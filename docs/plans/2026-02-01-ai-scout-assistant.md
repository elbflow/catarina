# AI Scout Assistant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an in-app AI chat assistant that allows farmers to log pest observations via natural language and photos, with automatic pest counting via Gemini Flash.

**Architecture:** Collapsible right-side chat pane using Vercel AI SDK's `useChat` hook. Photos are sent to Gemini Flash for pest counting. AI has tools to create observations and query risk status. Trap names are fuzzy-matched against farmer's actual traps.

**Tech Stack:** Vercel AI SDK (`ai` + `@ai-sdk/google`), Google Gemini Flash for vision, Zod for tool schemas, Tailwind CSS for chat UI.

---

## Task 1: Install AI SDK Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install packages**

Run:
```bash
pnpm add ai @ai-sdk/google @ai-sdk/react zod
```

**Step 2: Verify installation**

Run: `pnpm list ai @ai-sdk/google @ai-sdk/react zod`
Expected: All four packages listed with versions

**Step 3: Add environment variable**

Add to `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
chore: add Vercel AI SDK and Google provider dependencies

- ai: Core AI SDK with streaming and tools
- @ai-sdk/google: Gemini model provider
- @ai-sdk/react: useChat hook for React
- zod: Schema validation for tool inputs
EOF
)"
```

---

## Task 2: Create Chat API Route with Tools

**Files:**
- Create: `src/app/api/chat/route.ts`

**Step 1: Create the chat API route**

Create `src/app/api/chat/route.ts`:

```typescript
import { google } from '@ai-sdk/google'
import { streamText, tool, UIMessage, convertToModelMessages } from 'ai'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { cookies } from 'next/headers'

export const maxDuration = 60

// System prompt for the AI Scout
const SYSTEM_PROMPT = `You are the AI Scout Assistant for Catarina, an IPM (Integrated Pest Management) application.

Your primary job is to help farmers log pest observations quickly and easily.

CAPABILITIES:
1. Log observations from photos - When a farmer sends a trap photo, analyze it to count pests and log the observation
2. Log observations from text - When a farmer tells you a count, log it for them
3. Check risk status - Tell farmers if they're close to needing to spray

INTERACTION STYLE:
- Be concise and friendly
- After logging, always tell them their current risk status
- If they send a photo without specifying a trap, ask which trap it's for
- Use the farmer's trap names (fuzzy match if needed)

RISK LEVELS:
- Safe: Average rate < 1/day - "Activity is low. Continue monitoring."
- Warning: Average rate 1-2/day - "Activity rising. Prepare controls."
- Danger: Average rate > 2/day - "Action window now. Coordinate treatment."

When counting pests in photos:
- Only count clearly identifiable moths/insects
- If image is unclear, give your best estimate
- Always confirm the count before logging`

export async function POST(req: Request) {
  const { messages, farmId, traps }: {
    messages: UIMessage[]
    farmId: number
    traps: Array<{ id: number; name: string }>
  } = await req.json()

  // Get authenticated user from cookies
  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: SYSTEM_PROMPT + `\n\nFarmer's traps: ${traps.map(t => `"${t.name}" (ID: ${t.id})`).join(', ')}`,
    messages: await convertToModelMessages(messages),
    tools: {
      createObservation: tool({
        description: 'Log a pest observation for a trap. Use this when the farmer provides a count (either from a photo you analyzed or from text). Always confirm the trap name matches one of their traps.',
        parameters: z.object({
          trapId: z.number().describe('The ID of the trap'),
          trapName: z.string().describe('The name of the trap (for confirmation)'),
          count: z.number().min(0).describe('Number of pests observed'),
          notes: z.string().optional().describe('Optional notes about the observation'),
        }),
        execute: async ({ trapId, trapName, count, notes }) => {
          try {
            // Verify trap belongs to this farm
            const trap = await payload.findByID({
              collection: 'traps',
              id: trapId,
              user,
              overrideAccess: false,
            })

            if (!trap) {
              return { success: false, error: 'Trap not found or access denied' }
            }

            // Create the observation
            const observation = await payload.create({
              collection: 'pest-observations',
              data: {
                date: new Date().toISOString().split('T')[0],
                count,
                trap: trapId,
                notes: notes || undefined,
                tenant: farmId,
              },
              user,
              overrideAccess: false,
            })

            // Get updated risk info
            const recentObs = await payload.find({
              collection: 'pest-observations',
              where: {
                trap: { equals: trapId },
              },
              sort: '-date',
              limit: 10,
              user,
              overrideAccess: false,
            })

            // Calculate simple rate from last 2 observations
            let riskMessage = 'Risk status updated.'
            if (recentObs.docs.length >= 2) {
              const latest = recentObs.docs[0]
              const prev = recentObs.docs[1]
              const daysDiff = Math.max(
                (new Date(latest.date).getTime() - new Date(prev.date).getTime()) / (1000 * 60 * 60 * 24),
                0.5
              )
              const rate = latest.count / daysDiff

              if (rate > 2) {
                riskMessage = `Rate is ${rate.toFixed(1)}/day - DANGER zone. Action window now.`
              } else if (rate >= 1) {
                riskMessage = `Rate is ${rate.toFixed(1)}/day - WARNING zone. Activity rising.`
              } else {
                riskMessage = `Rate is ${rate.toFixed(1)}/day - SAFE zone. Continue monitoring.`
              }
            }

            return {
              success: true,
              observationId: observation.id,
              trapName,
              count,
              date: new Date().toISOString().split('T')[0],
              riskMessage,
            }
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to create observation'
            }
          }
        },
      }),

      getRiskStatus: tool({
        description: 'Get the current risk status for a trap or the whole farm. Use when farmer asks "am I close to spraying?" or "how are my traps doing?"',
        parameters: z.object({
          trapId: z.number().optional().describe('Optional trap ID. If not provided, returns farm-wide status.'),
        }),
        execute: async ({ trapId }) => {
          try {
            const where = trapId
              ? { trap: { equals: trapId } }
              : { tenant: { equals: farmId } }

            const recentObs = await payload.find({
              collection: 'pest-observations',
              where,
              sort: '-date',
              limit: 20,
              user,
              overrideAccess: false,
            })

            if (recentObs.docs.length < 2) {
              return {
                status: 'insufficient_data',
                message: 'Need at least 2 observations to calculate risk. Keep logging!'
              }
            }

            // Calculate average rate from recent observations
            let totalRate = 0
            let rateCount = 0

            for (let i = 0; i < recentObs.docs.length - 1; i++) {
              const current = recentObs.docs[i]
              const prev = recentObs.docs[i + 1]
              const daysDiff = Math.max(
                (new Date(current.date).getTime() - new Date(prev.date).getTime()) / (1000 * 60 * 60 * 24),
                0.5
              )
              const rate = current.count / daysDiff
              totalRate += rate
              rateCount++
            }

            const avgRate = rateCount > 0 ? totalRate / rateCount : 0

            let level: 'safe' | 'warning' | 'danger'
            let message: string
            let action: string

            if (avgRate > 2) {
              level = 'danger'
              message = `Average rate is ${avgRate.toFixed(1)}/day - in DANGER zone`
              action = 'Action window now. Coordinate treatment timing.'
            } else if (avgRate >= 1) {
              level = 'warning'
              message = `Average rate is ${avgRate.toFixed(1)}/day - in WARNING zone`
              action = 'Activity rising. Prepare biological controls and increase scouting.'
            } else {
              level = 'safe'
              message = `Average rate is ${avgRate.toFixed(1)}/day - in SAFE zone`
              action = 'Activity is low. Continue regular monitoring.'
            }

            return { level, message, action, avgRate: avgRate.toFixed(1) }
          } catch (error) {
            return {
              status: 'error',
              message: error instanceof Error ? error.message : 'Failed to get risk status'
            }
          }
        },
      }),

      listTraps: tool({
        description: 'List all traps for the farmer. Use when they ask about their traps or you need to help them pick one.',
        parameters: z.object({}),
        execute: async () => {
          return {
            traps: traps.map(t => ({ id: t.id, name: t.name })),
            message: `You have ${traps.length} trap${traps.length === 1 ? '' : 's'}`
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
```

**Step 2: Run TypeScript check**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "$(cat <<'EOF'
feat(chat): add AI chat API route with observation tools

- POST /api/chat endpoint with streaming responses
- createObservation tool: logs pest count for a trap
- getRiskStatus tool: checks current risk level
- listTraps tool: shows farmer's available traps
- Uses Gemini 2.0 Flash for fast responses
- Authenticates via payload-token cookie
EOF
)"
```

---

## Task 3: Create Chat UI Component

**Files:**
- Create: `src/components/chat/ChatPane.tsx`
- Create: `src/components/chat/ChatMessage.tsx`

**Step 1: Create ChatMessage component**

Create `src/components/chat/ChatMessage.tsx`:

```typescript
'use client'

import type { UIMessage } from 'ai'

interface ChatMessageProps {
  message: UIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        {message.parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <p key={index} className="text-sm whitespace-pre-wrap">
                {part.text}
              </p>
            )
          }
          if (part.type === 'file' && part.mediaType?.startsWith('image/')) {
            return (
              <img
                key={index}
                src={part.url}
                alt="Uploaded"
                className="max-w-full rounded-lg mt-2"
              />
            )
          }
          return null
        })}
      </div>
    </div>
  )
}
```

**Step 2: Create ChatPane component**

Create `src/components/chat/ChatPane.tsx`:

```typescript
'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useState, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'

interface Trap {
  id: number
  name: string
}

interface ChatPaneProps {
  farmId: number
  traps: Trap[]
  isOpen: boolean
  onClose: () => void
}

async function convertFileToDataURL(file: File): Promise<{
  type: 'file'
  mediaType: string
  url: string
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        type: 'file',
        mediaType: file.type,
        url: reader.result as string,
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ChatPane({ farmId, traps, isOpen, onClose }: ChatPaneProps) {
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { farmId, traps },
    }),
  })

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Create preview URL
      const url = URL.createObjectURL(selectedFile)
      setFilePreview(url)
    }
  }

  // Clear file
  const clearFile = () => {
    setFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() && !file) return

    const parts: Array<{ type: 'text'; text: string } | { type: 'file'; mediaType: string; url: string }> = []

    // Add file if present
    if (file) {
      const filePart = await convertFileToDataURL(file)
      parts.push(filePart)
    }

    // Add text if present
    if (input.trim()) {
      parts.push({ type: 'text', text: input.trim() })
    }

    sendMessage({
      role: 'user',
      parts,
    })

    setInput('')
    clearFile()
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐞</span>
          <h2 className="font-semibold text-gray-900">AI Scout</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Close chat"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-2xl mb-2">👋</p>
            <p className="text-sm">
              Hi! Send me a trap photo and I'll count the pests for you.
            </p>
            <p className="text-xs mt-2 text-gray-400">
              Or just tell me the count: "12 moths in the north trap"
            </p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {status === 'streaming' && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
            {error.message}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {filePreview && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="relative inline-block">
            <img src={filePreview} alt="Preview" className="h-20 rounded-lg" />
            <button
              onClick={clearFile}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Upload photo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a photo or message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={status === 'streaming'}
          />
          <button
            type="submit"
            disabled={status === 'streaming' || (!input.trim() && !file)}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
```

**Step 3: Run TypeScript check**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/chat/
git commit -m "$(cat <<'EOF'
feat(chat): add ChatPane and ChatMessage UI components

- ChatPane: Collapsible right sidebar with chat interface
- ChatMessage: Renders user and assistant messages
- Photo upload with preview
- Typing indicator during streaming
- Error display
- Responsive design with Tailwind
EOF
)"
```

---

## Task 4: Create Chat Toggle Button

**Files:**
- Create: `src/components/chat/ChatToggle.tsx`

**Step 1: Create the toggle button component**

Create `src/components/chat/ChatToggle.tsx`:

```typescript
'use client'

interface ChatToggleProps {
  isOpen: boolean
  onClick: () => void
}

export function ChatToggle({ isOpen, onClick }: ChatToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-40 ${
        isOpen
          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
      aria-label={isOpen ? 'Close AI Scout' : 'Open AI Scout'}
    >
      {isOpen ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <span className="text-2xl">🐞</span>
      )}
    </button>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/chat/ChatToggle.tsx
git commit -m "$(cat <<'EOF'
feat(chat): add floating ChatToggle button

- Fixed position bottom-right corner
- Shows bug emoji when closed, X when open
- Smooth transitions between states
EOF
)"
```

---

## Task 5: Create Chat Provider for State Management

**Files:**
- Create: `src/components/chat/ChatProvider.tsx`

**Step 1: Create the chat context provider**

Create `src/components/chat/ChatProvider.tsx`:

```typescript
'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { ChatPane } from './ChatPane'
import { ChatToggle } from './ChatToggle'

interface Trap {
  id: number
  name: string
}

interface ChatContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: ReactNode
  farmId: number
  traps: Trap[]
}

export function ChatProvider({ children, farmId, traps }: ChatProviderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((prev) => !prev)

  return (
    <ChatContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      <ChatToggle isOpen={isOpen} onClick={toggle} />
      <ChatPane
        farmId={farmId}
        traps={traps}
        isOpen={isOpen}
        onClose={close}
      />
    </ChatContext.Provider>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/chat/ChatProvider.tsx
git commit -m "$(cat <<'EOF'
feat(chat): add ChatProvider context for state management

- Manages open/close state for chat pane
- Renders ChatToggle and ChatPane
- Provides useChat hook for child components
EOF
)"
```

---

## Task 6: Create Chat Index Export

**Files:**
- Create: `src/components/chat/index.ts`

**Step 1: Create index file**

Create `src/components/chat/index.ts`:

```typescript
export { ChatProvider, useChat } from './ChatProvider'
export { ChatPane } from './ChatPane'
export { ChatMessage } from './ChatMessage'
export { ChatToggle } from './ChatToggle'
```

**Step 2: Commit**

```bash
git add src/components/chat/index.ts
git commit -m "$(cat <<'EOF'
feat(chat): add index exports for chat components
EOF
)"
```

---

## Task 7: Integrate Chat into Protected Layout

**Files:**
- Modify: `src/app/(frontend)/(protected)/layout.tsx`

**Step 1: Read current layout**

Read `src/app/(frontend)/(protected)/layout.tsx` to understand current structure.

**Step 2: Add ChatProvider wrapper**

Modify `src/app/(frontend)/(protected)/layout.tsx` to wrap content with ChatProvider:

```typescript
// Add import at top
import { ChatProvider } from '@/components/chat'

// Inside the layout component, after getting farm and traps data:
// Wrap the AppShell with ChatProvider

// Find where AppShell is rendered and wrap it:
<ChatProvider farmId={farm.id} traps={trapsForChat}>
  <AppShell user={authUser} farmName={farmName}>
    {children}
  </AppShell>
</ChatProvider>
```

The specific changes depend on the current layout structure. Key requirements:
1. Import `ChatProvider` from `@/components/chat`
2. Get the user's traps (you may need to add this query)
3. Get the farm ID
4. Wrap the main content with `<ChatProvider farmId={...} traps={...}>`

**Step 3: Verify it builds**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/\(frontend\)/\(protected\)/layout.tsx
git commit -m "$(cat <<'EOF'
feat(chat): integrate ChatProvider into protected layout

- Adds AI Scout chat to all protected pages
- Passes farm ID and traps to chat context
- Chat available via floating button
EOF
)"
```

---

## Task 8: Test Chat Integration End-to-End

**Files:**
- No new files

**Step 1: Start development server**

Run: `pnpm dev`

**Step 2: Manual testing checklist**

1. Navigate to dashboard at `http://localhost:3000/dashboard`
2. Verify floating bug button appears in bottom-right
3. Click button - chat pane should slide in from right
4. Type "hi" and send - AI should respond
5. Upload a photo - preview should appear
6. Send photo with message "count the moths" - AI should respond with count
7. Type "log 5 moths for [trap name]" - should create observation
8. Type "am I close to spraying?" - should return risk status
9. Click X - chat pane should close
10. Verify new observation appears in dashboard list

**Step 3: Fix any issues found**

Address any bugs discovered during manual testing.

**Step 4: Commit fixes if needed**

```bash
git add -A
git commit -m "$(cat <<'EOF'
fix(chat): address issues found during testing
EOF
)"
```

---

## Task 9: Add Error Boundary for Chat

**Files:**
- Create: `src/components/chat/ChatErrorBoundary.tsx`
- Modify: `src/components/chat/ChatProvider.tsx`

**Step 1: Create error boundary**

Create `src/components/chat/ChatErrorBoundary.tsx`:

```typescript
'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm shadow-lg z-50">
          <p className="text-red-800 text-sm font-medium">AI Scout encountered an error</p>
          <p className="text-red-600 text-xs mt-1">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 text-xs text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Step 2: Wrap ChatProvider with error boundary**

Update the export in `src/components/chat/index.ts`:

```typescript
export { ChatProvider, useChat } from './ChatProvider'
export { ChatPane } from './ChatPane'
export { ChatMessage } from './ChatMessage'
export { ChatToggle } from './ChatToggle'
export { ChatErrorBoundary } from './ChatErrorBoundary'
```

**Step 3: Commit**

```bash
git add src/components/chat/
git commit -m "$(cat <<'EOF'
feat(chat): add error boundary for graceful error handling

- ChatErrorBoundary catches errors in chat components
- Shows user-friendly error message with retry option
- Prevents errors from crashing the whole page
EOF
)"
```

---

## Task 10: Final Verification and Documentation

**Files:**
- Modify: `CLAUDE.md` (optional - add chat API docs)

**Step 1: Run full test suite**

Run: `pnpm test`
Expected: All tests pass

**Step 2: Run linting**

Run: `pnpm lint`
Expected: No errors (warnings OK)

**Step 3: Run build**

Run: `pnpm build`
Expected: Build succeeds

**Step 4: Manual smoke test**

1. Start dev server: `pnpm dev`
2. Log in as demo user
3. Open AI Scout chat
4. Send a test message
5. Verify observation creation works
6. Close chat, verify it remembers nothing (fresh each time)

**Step 5: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(chat): complete AI Scout Assistant implementation

AI Scout is a chat-based assistant that helps farmers:
- Log observations via natural language
- Upload trap photos for automatic pest counting (Gemini Flash)
- Check current risk status

Tech stack:
- Vercel AI SDK for chat streaming
- Google Gemini 2.0 Flash for vision and conversation
- Tool calling for observation creation
EOF
)"
```

---

## Summary

This plan implements the AI Scout Assistant with:

| Component | Purpose |
|-----------|---------|
| `/api/chat` | Streaming chat endpoint with tools |
| `ChatPane` | Right-side sliding chat UI |
| `ChatMessage` | Individual message rendering |
| `ChatToggle` | Floating action button |
| `ChatProvider` | State management context |
| `ChatErrorBoundary` | Graceful error handling |

**Environment Variables Required:**
- `GOOGLE_GENERATIVE_AI_API_KEY` - Gemini API key

**Key Features:**
- Photo upload with Gemini Flash vision analysis
- Tool calling for observation creation
- Risk status queries
- Fuzzy trap name matching
- Fresh chat on each session (no persistence)
