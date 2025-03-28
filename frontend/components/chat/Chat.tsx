"use client"

import { useState, useEffect } from "react"
import { ChatWindow } from "./ChatWindow"
import { ChatFab } from "./FAB"
import { ChatProviders } from "./ChatProviders"
import { useAppState } from "@/context/AppStateContext"

type ChatProps = {
  mode?: 'single-threaded' | 'multi-threaded'
}


export function ChatContainer({ mode = 'multi-threaded' }: ChatProps) {
  const { state, updateState } = useAppState()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(state.chatOpen)
  }, [state.chatOpen])

  const toggleChat = () => {
    updateState({ chatOpen: !isOpen })
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed z-50 bottom-4 right-4">
      {isOpen ? (
        <ChatWindow toggleChat={toggleChat} mode={mode} />
      ) : (
        <ChatFab onClick={toggleChat} />
      )}
    </div>

  )
}

export function Chat({ mode = 'multi-threaded' }: ChatProps) {
  return (
    <ChatProviders config={{ viewMode: 'chat', threadMode: mode }}>
      <ChatContainer />
    </ChatProviders>
  )
}

