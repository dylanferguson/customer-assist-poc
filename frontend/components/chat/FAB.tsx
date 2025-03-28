"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export function ChatFab({ onClick }: { onClick: () => void }) {

  return (
    <Button
      size="icon"
      className="rounded-full shadow-lg cursor-pointer h-14 w-14"
      aria-label="Chat with us"
      onClick={onClick}
    >
      <MessageCircle className="w-6 h-6" aria-hidden="true" />
    </Button>
  )
}


