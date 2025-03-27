import { Inbox as InboxIcon } from 'lucide-react';
import { ChatProviders } from './ChatProviders';
import { Inbox } from './Inbox';
import { Conversation } from './Conversation';
import { useMessagingService } from '@/hooks/useMessagingService';

function MessageContent() {
    const { useConversations } = useMessagingService();
    const { data: conversations } = useConversations();

    const conversationId = conversations?.conversations?.[0]?.id;

    return (
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-full gap-4 border-t border-gray-100">
            <div className="p-4 border-r border-gray-100">
                <div className="flex items-center gap-2">
                    <InboxIcon className="w-6 h-6" />
                    <h2 className="text-lg font-semibold">Inbox</h2>
                </div>
                <Inbox />
            </div>
            <div className="p-4">
                {
                    conversationId && (
                        <Conversation conversationId={conversationId} />
                    )
                }
            </div>
        </div>
    );
}

export function MessageCentre() {
    return (
        <ChatProviders>
            <MessageContent />
        </ChatProviders>
    )
}