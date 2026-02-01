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

export function useChatPanel() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatPanel must be used within ChatProvider')
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
