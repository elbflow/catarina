'use client'

import type { UIMessage } from 'ai'

interface ChatMessageProps {
  message: UIMessage
}

const TOOL_MESSAGES: Record<string, string> = {
  createObservation: '📝 Logging observation...',
  getRiskStatus: '📊 Checking risk status...',
  listTraps: '🪤 Looking up your traps...',
}

function getToolName(type: string): string | null {
  if (type.startsWith('tool-')) {
    return type.slice(5) // Remove 'tool-' prefix
  }
  return null
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  // Check if this message has any renderable content
  const hasRenderableContent = message.parts.some((part) => {
    if (part.type === 'text' && part.text.trim()) return true
    if (part.type === 'file' && part.mediaType?.startsWith('image/')) return true
    const toolName = getToolName(part.type)
    if (toolName && TOOL_MESSAGES[toolName]) return true
    return false
  })

  if (!hasRenderableContent) {
    return null
  }

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
          const toolName = getToolName(part.type)
          if (toolName) {
            const toolMessage = TOOL_MESSAGES[toolName]
            if (toolMessage) {
              return (
                <p key={index} className="text-sm text-gray-500 italic">
                  {toolMessage}
                </p>
              )
            }
          }
          return null
        })}
      </div>
    </div>
  )
}
