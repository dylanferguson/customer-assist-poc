"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"
import { useState } from "react"


export function ChatFab() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg w-80 h-96 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-primary p-4 flex justify-between items-center">
            <h3 className="text-primary-foreground font-medium">Chat with us</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
              onClick={toggleChat}
              aria-label="Minimize chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 p-4">{/* Chat content would go here */}</div>
        </div>
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

