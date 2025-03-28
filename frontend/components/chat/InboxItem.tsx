'use client'

import { Bot, UserRound } from "lucide-react"
import { format } from "date-fns"
import { ConversationList } from "../../api/messagingServiceClient"
import { InboxActionsPopover } from "./conversation/InboxActionsPopover"
import { useMessagingService } from "../../hooks/useMessagingService"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
interface InboxItemProps {
    conversation: ConversationList['conversations'][number]
    selected?: boolean
    onClick?: () => void
}

export const InboxItem: React.FC<InboxItemProps> = ({
    conversation,
    selected,
    onClick
}) => {
    const { useUpdateConversation } = useMessagingService()
    const updateConversation = useUpdateConversation({
        onError: (error) => {
            console.error('Error updating conversation:', error)
            toast.error('Error updating conversation:', { description: 'Please try again later' })
        }
    })

    const onArchiveToggle = () => {
        updateConversation.mutate({
            conversationId: conversation.id,
            data: {
                archived: !conversation.archived
            }
        })
    }

    return (
        <>
            <div className="relative group">
                <button
                    className={cn("relative w-full px-4 py-3 text-left cursor-pointer hover:bg-accent/90 [&:has(button:hover)]:hover:bg-transparent rounded-md", selected && "bg-accent/90")}
                    role="listitem"
                    aria-label={`Conversation about ${conversation.title}`}
                    onClick={onClick}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            {conversation.unread_count > 0 && (
                                <div
                                    className="absolute w-2.5 h-2.5 bg-red-500 rounded-full left-0 top-0"
                                    aria-label="unread conversation"
                                />
                            )}
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                                {conversation.lastMessage?.participantRole === 'CUSTOM_BOT' ? (
                                    <Bot className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                ) : (
                                    <UserRound className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="block mb-1 text-xs text-gray-500">
                                {conversation.lastMessage?.createdAt ?
                                    format(new Date(conversation.lastMessage.createdAt), 'EEE h:mma') :
                                    'No messages'
                                }
                            </span>
                            <h3 arial-label="conversation subject" className={`text-base ${conversation.unread_count > 0 ? 'font-bold' : 'font-medium'}`}>
                                {conversation.title}
                            </h3>
                            <p arial-label="conversation last message" className={`text-sm ${conversation.unread_count > 0 ? 'text-gray-800' : 'text-gray-500'}`}>
                                {conversation.lastMessage?.content || 'Start a new conversation'}
                            </p>
                        </div>

                    </div>
                </button>
                <div className="absolute -translate-y-1/2 right-2 top-1/2">
                    <InboxActionsPopover
                        onArchiveClick={onArchiveToggle}
                        isArchived={conversation.archived}
                    />
                </div>
            </div>
            <div className="h-px bg-gray-100/50" role="separator" />
        </>
    )
} 