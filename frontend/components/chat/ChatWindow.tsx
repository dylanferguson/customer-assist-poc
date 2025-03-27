import { Button } from "@/components/ui/button"
import { X, ArrowLeft } from "lucide-react"
import { WelcomeScreen } from "./WelcomeScreen"
import { Inbox } from "./Inbox"
import { useState, useEffect } from "react"
import { Conversation } from "./Conversation"
import { useSocket } from "@/context/SocketContext"
import { useMessagingService } from "@/hooks/useMessagingService"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"


type ChatProps = {
    toggleChat: () => void
    mode: 'single-threaded' | 'multi-threaded'
}

export const ChatWindow = ({ toggleChat, mode }: ChatProps) => {
    const [showInbox, setShowInbox] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const { connect, isConnected } = useSocket();
    const { useCreateConversation } = useMessagingService();
    const createConversation = useCreateConversation({
        onError(error) {
            toast.error('Error creating conversation', { description: 'Please try again later' })
            console.error('Error creating conversation:', error)
        },
    });

    const handleStartConversation = async () => {
        // Initialize socket when conversation starts
        if (!isConnected) {
            connect()
        }

        if (mode === 'multi-threaded') {
            setShowInbox(true)
        } else {
            const newConversation = await createConversation.mutateAsync({})
            setSelectedConversation(newConversation.id)
        }
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
                {createConversation.isPending ? (
                    <div className="flex flex-col items-center justify-center flex-1 p-4">
                        <Spinner />
                        <p className="mt-2 text-sm text-muted-foreground">Starting new chat...</p>
                    </div>
                ) :
                    selectedConversation ? (
                        <div className="flex flex-1 animate-in fade-in">
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