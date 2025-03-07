import { useState, useRef, useEffect, useCallback } from 'react';
import { Spinner } from '../ui/spinner';
import { format } from 'date-fns';
import { Bot, UserRound, Send } from 'lucide-react';
import { useMessagingService } from '../../hooks/useMessagingService';


export const Conversation = ({ conversationId }: { conversationId: string }) => {
    const [messageInput, setMessageInput] = useState('');
    const { useConversation, useMessages, useSendMessage } = useMessagingService();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);


    // Fetch conversation data
    const {
        data: conversation,
        isLoading: isLoadingConversation
    } = useConversation(conversationId);

    // Fetch messages for this conversation
    const {
        data: messagesData,
        isLoading: isLoadingMessages
    } = useMessages(conversationId);

    // Send message mutation
    const { mutate: sendMessage } = useSendMessage();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageInput.trim() || !conversation) return;

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

    // Scroll to bottom when messages change or on initial load
    useEffect(() => {
        if (messagesData) {
            scrollToBottom();
        }
    }, [messagesData, scrollToBottom]);

    const loading = isLoadingConversation || isLoadingMessages;

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="text-center">
                    <Spinner />
                    <p className="text-sm text-gray-500">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (!conversation || !messagesData) {
        return <div>Conversation not found</div>;
    }

    return (
        <div className="relative flex flex-col">
            <div className="overflow-y-auto max-h-[552px] pb-[57px] pr-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent', scrollbarGutter: 'stable' }}>
                <div className="p-4 mt-2 text-sm">
                    <p className="text-center text-gray-500">
                        Privacy Notice: Messages in this conversation may be reviewed for training and quality improvement purposes.
                        Your information is handled in accordance with our Privacy Policy.
                    </p>
                </div>

                <div className="p-3">
                    <div className="mb-4 text-sm font-semibold text-center text-gray-500">
                        {format(new Date(conversation.createdAt), "dd MMMM, yyyy, h:mmaaa")}
                    </div>

                    <div className="space-y-4">
                        {messagesData.data.map((message) => (
                            <div
                                key={message.id}
                                className="space-y-1"
                                role="article"
                                aria-label={`Message from ${message.participantRole === 'CUSTOMER' ? 'you' : message.participantName}`}
                            >
                                <div
                                    className={`flex items-start gap-2 ${message.participantRole === 'CUSTOMER' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {message.participantRole !== 'CUSTOMER' && (
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                                            {message.participantName === 'AGENT' ? (
                                                <UserRound className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                            ) : (
                                                <Bot className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                            )}
                                        </div>
                                    )}
                                    <div
                                        tabIndex={0}
                                        className={`max-w-[70%] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${message.participantRole === 'CUSTOMER' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}
                                    >
                                        <div>{message.content}</div>
                                        <div className="text-[10px] mt-1 opacity-70">
                                            {format(new Date(message.createdAt), "h:mmaaa")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-white border-t">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        rows={1}
                        className="flex-1 min-w-0 px-3 py-2 overflow-y-auto text-sm border rounded-md resize-none bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        aria-label="Send message"
                        disabled={!messageInput.trim()}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};