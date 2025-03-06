"use client"

import { useState } from "react"
import { ChatWindow } from "./ChatWindow"
import { ChatFab } from "./FAB"

export function Chat() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed z-50 bottom-4 right-4">
      {isOpen ? (
        <ChatWindow toggleChat={toggleChat} />
      ) : (
        <ChatFab onClick={toggleChat} />
      )}
    </div>
  )
}

