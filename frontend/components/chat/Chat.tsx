"use client"

import { useState } from "react"
import { ChatWindow } from "./ChatWindow"
import { ChatFab } from "./FAB"
import { ChatProviders } from "./ChatProviders"

type ChatProps = {
  mode?: 'single-threaded' | 'multi-threaded'
}

export function Chat({ mode = 'multi-threaded' }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false)

  const chatConfig = {
    viewMode: 'chat' as const,
    threadMode: mode,
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <ChatProviders config={chatConfig}>
      <div className="fixed z-50 bottom-4 right-4">
        {isOpen ? (
          <ChatWindow toggleChat={toggleChat} mode={mode} />
        ) : (
          <ChatFab onClick={toggleChat} />
        )}
      </div>
    </ChatProviders>
  )
}

