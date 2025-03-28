"use client"

import { useState, useEffect } from "react"
import { ChatWindow } from "./ChatWindow"
import { ChatFab } from "./FAB"
import { ChatProviders } from "./ChatProviders"
import { useAppState } from "@/context/AppStateContext"
import { AnimatePresence, motion } from "framer-motion"

type ChatProps = {
  mode?: 'single-threaded' | 'multi-threaded'
}


export function ChatContainer({ mode = 'multi-threaded' }: ChatProps) {
  const { appState: state, updateAppState } = useAppState()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(state.chatOpen)
  }, [state.chatOpen])

  const toggleChat = () => {
    updateAppState({ chatOpen: !isOpen })
    setIsOpen(!isOpen)
  }

  return (

    <AnimatePresence >
      {isOpen ? (
        <div className="fixed z-40 bottom-8 right-8">
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.2, transformOrigin: 'bottom right' }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 25,
              }
            }}
            exit={{
              opacity: 0,
              scale: 0.2,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 30,
              }
            }}
          >
            <ChatWindow toggleChat={toggleChat} mode={mode} />
          </motion.div>
        </div>
      ) : (
        <div className="fixed z-40 bottom-8 right-8">
          <motion.div
            key="fab"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
              mass: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.2,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 30,
              }
            }}
          >

            <ChatFab onClick={toggleChat} />
          </motion.div>
        </div>
      )
      }
    </AnimatePresence >
  )
}

export function Chat({ mode = 'multi-threaded' }: ChatProps) {
  return (
    <ChatProviders config={{ viewMode: 'chat', threadMode: mode }}>
      <ChatContainer />
    </ChatProviders>
  )
}

