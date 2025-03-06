"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useState } from "react"
import { ChatWindow } from "./ChatWindow"

export function ChatFab() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
          <ChatWindow toggleChat={toggleChat} />
      ) : (
        <Button
          size="icon"
          className="cursor-pointer h-14 w-14 rounded-full shadow-lg animate-in fade-in duration-300"
          aria-label="Chat with us"
          onClick={toggleChat}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}

