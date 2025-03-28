import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Spinner } from '../ui/spinner';
import { format, isSameDay } from 'date-fns';
import { Bot, UserRound, Send } from 'lucide-react';
import { useMessagingService } from '../../hooks/useMessagingService';
import { useSocket } from '../../context/SocketContext';
import { Message, TypingEvent } from '../../api/messagingServiceClient';
import { TypingIndicator } from '../ui/typing-indicator';
import { TooltipTrigger, Tooltip, TooltipContent } from '../ui/tooltip';
import { ChatActionsPopover } from './conversation/ChatActionsPopover';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useConfig } from '@/context/ConfigContext';
import { useAppState } from '@/context/AppStateContext';
interface MessageWithStatus extends Message {
    pending?: boolean;
    error?: boolean;
}

// Create a new memoized component for the messages list
const MessagesList = memo(({
    messages,
    isAgentTyping
}: {
    messages: MessageWithStatus[],
    isAgentTyping: boolean
}) => {
    return (
        <div className="space-y-[2px]">
            <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                    // Check if this message is from the same sender as the previous one
                    const previousMessage = index > 0 ? messages[index - 1] : null;
                    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                    const lastMessage = index === messages.length - 1;

                    // Check if this is the last message from this sender in a consecutive group
                    const isLastInGroup = !nextMessage || nextMessage.participantRole !== message.participantRole;
                    const isFirstInGroup = !previousMessage || previousMessage.participantRole !== message.participantRole;

                    // Check if date changed from previous message
                    const showDateSeparator = index === 0 || (previousMessage &&
                        !isSameDay(new Date(message.createdAt), new Date(previousMessage.createdAt)));

                    return (
                        <motion.div
                            key={`message-group-${index}`}
                        >
                            {showDateSeparator && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 text-sm font-semibold text-center text-gray-500"
                                >
                                    {format(new Date(message.createdAt), "dd MMMM yyyy, HH:mm")}
                                </motion.div>
                            )}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0, }}
                                transition={{ duration: 0.2 }}
                                className={`${isLastInGroup ? 'mb-4' : ''}`}
                                role="article"
                                aria-label={`Message from ${message.participantRole === 'CUSTOMER' ? 'you' : message.participantName}`}
                            >
                                <div
                                    className='grid grid-cols-[auto_1fr] gap-2'
                                >
                                    <div className='w-10'>
                                        {message.participantRole !== 'CUSTOMER' && isLastInGroup && (
                                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                                                {message.participantRole === 'AGENT' ? (
                                                    <UserRound className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                                ) : (
                                                    <Bot className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`max-w-[90%] ${message.participantRole === 'CUSTOMER' ? 'justify-self-end' : 'justify-self-start'}`}>
                                        {isFirstInGroup && ['AGENT', 'CUSTOM_BOT'].includes(message.participantRole) && (
                                            <div className="mb-1 text-xs text-gray-500">
                                                {message.participantRole === 'AGENT' ? 'Agent' : 'Virtual Assistant'}
                                            </div>
                                        )}
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div
                                                    tabIndex={0}
                                                    className={`inline-block rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 ${message.participantRole === 'CUSTOMER'
                                                        ? `bg-black text-white ${message.pending ? 'opacity-60' : ''}`
                                                        : 'bg-gray-100 text-black'
                                                        }`}
                                                >
                                                    <div className="text-left break-words">{message.content}</div>
                                                    <div className="text-[10px] mt-1 opacity-70 flex items-center justify-between">
                                                        {lastMessage && message.participantRole !== 'CUSTOMER' && (
                                                            <span>{format(new Date(message.createdAt), "h:mmaaa")}</span>
                                                        )}
                                                        {message.error && (
                                                            <span className="flex items-center ml-2 text-red-400">
                                                                Not delivered
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent aria-label="Message sent at">
                                                <p>{format(new Date(message.createdAt), "HH:mm")}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })}
                {isAgentTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`grid grid-cols-[auto_1fr] gap-2`}
                    >
                        <div className='w-10'></div>
                        <div className="flex items-center gap-2">
                            <TypingIndicator />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

MessagesList.displayName = 'MessagesList';

export const Conversation = ({ conversationId }: { conversationId: string }) => {
    const [messageInput, setMessageInput] = useState('');
    const [isAgentTyping, setIsAgentTyping] = useState(false);
    const [_isAgentTypingTimeout, setIsAgentTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [messages, setMessages] = useState<MessageWithStatus[]>([]);
    const { useMessages, useSendMessage } = useMessagingService();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { subscribeToConversation, socket, isConnected } = useSocket();
    const config = useConfig();
    const { updateAppState } = useAppState();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);


    const {
        data: messagesData,
        isLoading: isLoadingMessages,
    } = useMessages(conversationId);

    const { mutate: sendMessage } = useSendMessage({
        onMutate: (newMessage) => {
            // Create a temporary message with pending state
            const tempMessage: MessageWithStatus = {
                id: `temp-${Date.now()}`,
                conversationId: '',
                content: newMessage.data.content,
                contentType: 'plain_text',
                createdAt: new Date().toISOString(),
                participantRole: 'CUSTOMER',
                participantName: 'You',
                pending: true
            };

            // Add to messages immediately for optimistic UI update
            setMessages(prevMessages => [...prevMessages, tempMessage]);

            // Scroll to the new message
            setTimeout(scrollToBottom, 50);

            // Return the temporary message to use in onSuccess
            return { tempMessage };
        },
        onSuccess: (response, _variables, context) => {
            if (!context) return;

            const { tempMessage } = context as { tempMessage: MessageWithStatus };

            // Replace the temporary message with the server response
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === tempMessage.id ? response : msg
                )
            );
        },
        onError: (error, _variables, context) => {
            if (!context) return;

            const { tempMessage } = context as { tempMessage: MessageWithStatus };

            // Mark the message as failed
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === tempMessage.id ? { ...msg, pending: false, error: true } : msg
                )
            );

            // Optionally show an error message to the user
            toast.error('Failed to send message');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageInput.trim() || !conversationId) return;

        sendMessage({
            conversationId,
            data: {
                content: messageInput.trim(),
                contentType: 'plain_text'
            }
        });

        setMessageInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    // Initialize messages from API data
    useEffect(() => {
        if (messagesData?.data && messagesData.data.length > 0) {
            setMessages(messagesData.data);
            updateAppState({ activeConversationId: conversationId });
        }
    }, [messagesData]);

    // Listen for new messages via WebSocket using our subscription system
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewMessage = (newMessage: Message) => {
            // Add message to state if it doesn't exist already
            setIsAgentTyping(false);
            setMessages(prevMessages => {
                // Skip if message already exists (by ID)
                if (prevMessages.some(msg => msg.id === newMessage.id)) {
                    return prevMessages;
                }

                // Replace pending message if content matches
                const pendingMsgIndex = prevMessages.findIndex(
                    msg => msg.pending && msg.content === newMessage.content
                );

                if (pendingMsgIndex >= 0) {
                    // Replace the pending message with the confirmed one
                    const updatedMessages = [...prevMessages];
                    updatedMessages[pendingMsgIndex] = newMessage;
                    return updatedMessages;
                }

                // Otherwise add as new message
                return [...prevMessages, newMessage];
            });

            // Scroll to new message
            setTimeout(scrollToBottom, 50);
        };

        const handleTyping = (data: TypingEvent) => {
            if (data.participantType === 'AGENT') {
                setIsAgentTyping(true);
                setTimeout(scrollToBottom, 50);
                setIsAgentTypingTimeout(setTimeout(() => {
                    setIsAgentTyping(false);
                }, 10000));
            }
        };

        // Subscribe to messages for this specific conversation
        const unsubscribe = subscribeToConversation(conversationId, { message: handleNewMessage, typing: handleTyping });

        // Return cleanup function
        return () => {
            unsubscribe();
        };
    }, [socket, isConnected, conversationId, scrollToBottom, subscribeToConversation]);

    // Scroll to bottom when messages change or on initial load
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const loading = isLoadingMessages;

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

                sendMessage({
                    conversationId,
                    data: {
                        content: `📍 My location: ${mapsLink}`,
                        contentType: 'plain_text'
                    }
                });
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to retrieve your location. Please check your permissions and try again.');
            }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="text-center">
                    <Spinner />
                </div>
            </div>
        );
    }

    if (!messagesData) {
        return <div>Conversation not found</div>;
    }

    return (
        <div className="relative flex flex-col h-full border border-gray-100 rounded-md">
            <div className="flex flex-col flex-1 min-h-0">
                <div className={`flex-1 overflow-y-auto ${config.viewMode == 'chat' ? 'max-h-[552px]' : ''} scrollbar-thin`}>
                    <div className="p-4 mt-2 text-sm">
                        <p className="text-center text-gray-500">
                            Privacy Notice: Messages in this conversation may be reviewed for training and quality improvement purposes.
                            Your information is handled in accordance with our Privacy Policy.
                        </p>
                    </div>

                    <div className="p-3">
                        <MessagesList messages={messages} isAgentTyping={isAgentTyping} />
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="relative px-4 py-2 bg-white border-t border-gray-100 round-md">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <ChatActionsPopover
                            onLocationClick={handleLocationClick}
                            onFileClick={() => { }}
                            onImageClick={() => { }}
                        />
                        <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            rows={1}
                            className="flex-1 min-w-0 px-3 py-2 overflow-y-auto text-sm border-gray-100 rounded-md resize-none bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center w-10 h-10 rounded-md cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-90"
                            aria-label="Send message"
                            disabled={!messageInput.trim()}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};