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

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <ChatProviders>
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

