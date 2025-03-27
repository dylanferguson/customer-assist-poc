"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SocketProvider } from '@/context/SocketContext'
import { ChatWindow } from "./ChatWindow"
import { ChatFab } from "./FAB"
import { AuthProvider } from "@/context/AuthContext"
import { TooltipProvider } from "@radix-ui/react-tooltip"

const queryClient = new QueryClient()

type ChatProps = {
  mode?: 'single-threaded' | 'multi-threaded'
}

export function Chat({ mode = 'multi-threaded' }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <TooltipProvider>
            <div className="fixed z-50 bottom-4 right-4">
              {isOpen ? (
                <ChatWindow toggleChat={toggleChat} mode={mode} />
              ) : (
                <ChatFab onClick={toggleChat} />
              )}
            </div>
          </TooltipProvider>
        </SocketProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

