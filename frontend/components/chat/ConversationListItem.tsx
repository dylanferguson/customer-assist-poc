import { Bot, UserRound } from "lucide-react"
import { format } from "date-fns"
import { ConversationList } from "../../api/messagingServiceClient"

interface ConversationListItemProps {
    conversation: ConversationList['conversations'][number]
    onClick?: () => void
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
    conversation,
    onClick
}) => {
    return (
        <>
            <button
                className="relative w-full px-4 py-3 text-left cursor-pointer hover:bg-accent/50"
                role="listitem"
                aria-label={`Conversation about ${conversation.title}`}
                onClick={onClick}
            >
                <div className="flex items-center gap-3">
                    {/* Avatar with unread indicator */}
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

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <span className="block mb-1 text-xs text-gray-500">
                            {conversation.lastMessage?.createdAt ?
                                format(new Date(conversation.lastMessage.createdAt), 'EEE h:mma') :
                                'No messages'
                            }
                        </span>
                        <div className="flex items-start justify-between">
                            <h3 className={`text-base ${conversation.unread_count > 0 ? 'font-bold' : 'font-medium'}`}>
                                {conversation.title}
                            </h3>
                        </div>
                        <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'text-gray-800' : 'text-gray-500'}`}>
                            {conversation.lastMessage?.content || 'Start a new conversation'}
                        </p>
                    </div>
                </div>
            </button>
            <div className="h-px mx-4 bg-gray-200" role="separator" />
        </>
    )
} 