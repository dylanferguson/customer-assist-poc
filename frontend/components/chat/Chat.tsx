"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ChatWindow } from "./ChatWindow"
import { ChatFab } from "./FAB"

const queryClient = new QueryClient()

export function Chat() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="fixed z-50 bottom-4 right-4">
        {isOpen ? (
          <ChatWindow toggleChat={toggleChat} />
        ) : (
          <ChatFab onClick={toggleChat} />
        )}
      </div>
    </QueryClientProvider>
  )
}

