import { useEffect, useState } from 'react';
import { Spinner } from '../ui/spinner';
import { format } from 'date-fns';
import { Bot, UserRound, Send } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    sender: 'assistant' | 'user';
    type?: 'bot' | 'agent';
    timestamp: string;
}

interface ConversationData {
    id: string;
    startDate: string;
    messages: Message[];
}

export const Conversation = ({ conversationId }: { conversationId: string }) => {
    const [loading, setLoading] = useState(true);
    const [conversation, setConversation] = useState<ConversationData | null>(null);
    const [messageInput, setMessageInput] = useState('');

    useEffect(() => {
        // Mock fetch - replace with actual API call
        const fetchConversation = async () => {
            setLoading(true);
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock data
                const mockData: ConversationData = {
                    id: conversationId,
                    startDate: '2022-08-22T13:53:00',
                    messages: [
                        {
                            id: '1',
                            content: 'Hello! How can I assist you today?',
                            sender: 'assistant',
                            type: 'bot',
                            timestamp: '2022-08-22T13:53:00'
                        },
                        {
                            id: '2',
                            content: 'I need help with my account settings.',
                            sender: 'user',
                            timestamp: '2022-08-22T13:53:30'
                        },
                        {
                            id: '3',
                            content: 'Let me connect you with a support agent who can help.',
                            sender: 'assistant',
                            type: 'bot',
                            timestamp: '2022-08-22T13:54:00'
                        },
                        {
                            id: '4',
                            content: 'Hi there! I\'m Sarah from the support team. I can help you with your account settings.',
                            sender: 'assistant',
                            type: 'agent',
                            timestamp: '2022-08-22T13:54:30'
                        },
                        {
                            id: '5',
                            content: 'Specifically, I can\'t figure out how to change my notification preferences.',
                            sender: 'user',
                            timestamp: '2022-08-22T13:55:00'
                        },
                        {
                            id: '6',
                            content: 'I can help you with that! To change your notification preferences, go to Settings > Notifications. You\'ll see options for email, push, and in-app notifications there.',
                            sender: 'assistant',
                            type: 'agent',
                            timestamp: '2022-08-22T13:55:30'
                        },
                        {
                            id: '7',
                            content: 'Thanks! I see those options now. One more question - can I set quiet hours?',
                            sender: 'user',
                            timestamp: '2022-08-22T13:56:00'
                        },
                        {
                            id: '8',
                            content: 'Yes, absolutely! In the same Notifications section, scroll down to "Quiet Hours." You can set different schedules for weekdays and weekends.',
                            sender: 'assistant',
                            type: 'agent',
                            timestamp: '2022-08-22T13:56:30'
                        },
                        {
                            id: '9',
                            content: 'Perfect, that\'s exactly what I needed. Thank you so much for your help!',
                            sender: 'user',
                            timestamp: '2022-08-22T13:57:00'
                        },
                        {
                            id: '10',
                            content: 'You\'re welcome! Is there anything else you\'d like help with today?',
                            sender: 'assistant',
                            type: 'agent',
                            timestamp: '2022-08-22T13:57:30'
                        }
                    ]
                };
                setConversation(mockData);
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();
    }, [conversationId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageInput.trim() || !conversation) return;

        const newMessage: Message = {
            id: String(Date.now()),
            content: messageInput.trim(),
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setConversation(prev => prev ? {
            ...prev,
            messages: [...prev.messages, newMessage]
        } : null);

        setMessageInput('');
    };

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

    if (!conversation) {
        return <div>Conversation not found</div>;
    }

    // Group messages by sender
    const messageGroups = conversation.messages.reduce((groups: Message[][], message, index, array) => {
        if (index === 0 || message.sender !== array[index - 1].sender || message.type !== array[index - 1].type) {
            groups.push([message]);
        } else {
            groups[groups.length - 1].push(message);
        }
        return groups;
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 mt-2 text-sm">
                    <p className="text-center text-gray-500">
                        Privacy Notice: Messages in this conversation may be reviewed for training and quality improvement purposes.
                        Your information is handled in accordance with our Privacy Policy.
                    </p>
                </div>

                <div className="p-3">
                    <div className="mb-4 text-sm font-semibold text-center text-gray-500">
                        {format(new Date(conversation.startDate), "dd MMMM, yyyy, h:mmaaa")}
                    </div>

                    <div className="space-y-4">
                        {messageGroups.map((group) => (
                            <div key={group[0].id} className="space-y-1">
                                {group.map((message, index) => (
                                    <div
                                        key={message.id}
                                        className={`flex items-start gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        {message.sender === 'assistant' && index === group.length - 1 && (
                                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                                                {message.type === 'agent' ? (
                                                    <UserRound className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                                ) : (
                                                    <Bot className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                                )}
                                            </div>
                                        )}
                                        <div className={`max-w-[70%] rounded-lg p-3 text-sm ${message.sender === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-black'
                                            }`}>
                                            <div>{message.content}</div>
                                            {index === group.length - 1 && (
                                                <div className="text-[10px] mt-1 opacity-70">
                                                    {format(new Date(message.timestamp), "h:mmaaa")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-white border-t">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        rows={1}
                        className="flex-1 min-w-0 px-3 py-2 overflow-y-auto text-sm border rounded-md resize-none bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                        aria-label="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};