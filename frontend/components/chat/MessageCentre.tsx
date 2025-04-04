'use client'

import { Inbox as InboxIcon } from 'lucide-react';
import { ChatProviders } from './ChatProviders';
import { Inbox } from './Inbox';
import { Conversation } from './Conversation';
import { useMessagingService } from '@/hooks/useMessagingService';
import { useEffect, useState } from 'react';
import { useAppState } from '@/context/AppStateContext';

function MessageContent() {
    const { useConversations } = useMessagingService();
    const { data: conversations } = useConversations();
    const { appState } = useAppState()
    const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();

    useEffect(() => {
        setSelectedConversationId(appState.activeConversationId || conversations?.conversations?.[0]?.id)
    }, [])

    return (
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-80px)] gap-4 border-t border-gray-100 p-4">
            <div className="p-4 overflow-y-auto border border-gray-100 rounded-md scrollbar-thin">
                <div className="flex items-center gap-2 mb-2">
                    <InboxIcon className="w-6 h-6" />
                    <h2 className="text-2xl font-semibold">Inbox</h2>
                </div>
                <Inbox
                    onSelectConversation={setSelectedConversationId}
                />
            </div>
            <div className="overflow-y-auto scrollbar-thin">
                {selectedConversationId && (
                    <Conversation conversationId={selectedConversationId} />
                )}
            </div>
        </div>
    );
}

export function MessageCentre() {
    const messageCentreConfig = {
        viewMode: 'message-centre' as const,
        threadMode: 'multi-threaded' as const,
    }

    return (
        <ChatProviders config={messageCentreConfig}>
            <MessageContent />
        </ChatProviders>
    )
}