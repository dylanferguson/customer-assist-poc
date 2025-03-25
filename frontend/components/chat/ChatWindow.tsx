import { Button } from "@/components/ui/button"
import { X, ArrowLeft } from "lucide-react"
import { WelcomeScreen } from "./WelcomeScreen"
import Inbox from "./Inbox"
import { useState } from "react"
import { Conversation } from "./Conversation"
import { useSocket } from "@/context/SocketContext"
import { useAuth } from "@/context/AuthContext"

type ChatProps = {
    toggleChat: () => void
}

export const ChatWindow = ({ toggleChat }: ChatProps) => {
    const [showInbox, setShowInbox] = useState(false)
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
    const { connect, isConnected } = useSocket()

    const handleStartConversation = () => {
        // Initialize socket when conversation starts
        if (!isConnected) {
            connect()
        }
        setShowInbox(true)
    }

    const handleBackClick = () => {
        if (selectedConversation) {
            setSelectedConversation(null)
        } else {
            setShowInbox(false)
        }
    }

    return (
        <div className="relative flex flex-col overflow-hidden duration-300 bg-white rounded-lg shadow-lg w-90 h-[600px] animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between p-2 bg-primary">
                {selectedConversation && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 cursor-pointer text-primary-foreground hover:text-primary-foreground hover:bg-primary-secondary"
                        onClick={handleBackClick}
                        aria-label="Back to inbox"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                )}
                <h3 className="flex-1 font-medium text-center text-primary-foreground">
                    {selectedConversation ? "Conversation" : "ACME Messaging"}
                </h3>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 cursor-pointer text-primary-foreground hover:text-primary-foreground hover:bg-primary-secondary"
                    onClick={toggleChat}
                    aria-label="Minimize chat"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex flex-1 h-full">
                {selectedConversation ? (
                    <div className="flex flex-1 duration-300 animate-in fade-in slide-in-from-right-5">
                        <Conversation conversationId={selectedConversation} />
                    </div>
                ) : showInbox ? (
                    <div className="flex flex-1 duration-300 animate-in fade-in">
                        <Inbox onSelectConversation={setSelectedConversation} />
                    </div>
                ) : (
                    <div className="flex flex-1 duration-300 animate-in fade-in">
                        <WelcomeScreen onStartConversation={handleStartConversation} />
                    </div>
                )}
            </div>
        </div>
    )
}