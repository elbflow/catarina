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
