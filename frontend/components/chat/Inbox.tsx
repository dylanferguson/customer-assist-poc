'use client'

import { Spinner } from "../ui/spinner"
import { useState } from "react"
import { SquarePen, Calendar, HelpCircle, Search, MessageCircle, Archive } from "lucide-react"
import { LinkCard } from "../ui/link-card"
import { InboxItem } from "./InboxItem"
import { FilterButton } from "../ui/filter-button"
import { useMessagingService } from "../../hooks/useMessagingService"
import { toast } from "sonner"

export interface InboxProps {
    onSelectConversation?: (id: string) => void
}

const EmptyInbox = () => {
    return (
        <div className="flex-1">
            <div className="mt-4 mb-10">
                <p className="font-medium text-gray-900">You have no conversations.</p>
            </div>

            <div>
                <h3 className="mb-3 text-lg font-medium text-gray-900">Helpful resources</h3>
                <div className="space-y-2">
                    <LinkCard
                        href="#"
                        icon={<Calendar className="w-5 h-5" />}
                        title="Book a home loan appointment"
                        subtitle="Speak to a specialist"
                    />
                    <LinkCard
                        href="#"
                        icon={<HelpCircle className="w-5 h-5" />}
                        title="Frequently asked questions"
                        subtitle="Find answers to common questions"
                    />
                    <LinkCard
                        href="#"
                        icon={<Search className="w-5 h-5" />}
                        title="Suspicious transaction?"
                        subtitle="Here's what to do..."
                    />
                </div>
            </div>
        </div>
    )
}

const Inbox = ({ onSelectConversation }: InboxProps) => {
    const [activeFilter, setActiveFilter] = useState<'active' | 'archived'>('active')
    const { useConversations, useCreateConversation } = useMessagingService()

    // Query conversations with archived filter
    const { data: conversationList, isLoading } = useConversations({
        is_archived: activeFilter === 'archived'
    })
    const createConversation = useCreateConversation({
        onError: (error) => {
            toast.error('Error creating conversation', { description: 'Please try again later' })
            console.error('Error creating conversation:', error)
        }
    })
    const currentConversations = conversationList?.conversations || []

    const handleConversationClick = (id: string) => {
        onSelectConversation?.(id)
    }

    const handleNewConversation = async () => {
        const newConversation = await createConversation.mutateAsync({})
        onSelectConversation?.(newConversation?.id)
    }

    if (isLoading || createConversation.isPending) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 p-4">
                <Spinner />
                <p className="mt-2 text-sm text-muted-foreground">{isLoading ? 'Loading conversations...' : 'Starting new chat...'}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-1 h-full p-4">
            <div className="flex flex-col flex-1 h-full">
                <div>
                    <p className="text-gray-700 text-sm/5">ACME virtual assistant is here for you 24/7. Our human team will get back to you within 48 hours.</p>
                    <h2 className="mt-6 text-lg font-bold">Messages</h2>
                    <div className="flex gap-2 mt-4">
                        <FilterButton
                            selected={activeFilter === 'active'}
                            onToggle={() => setActiveFilter('active')}
                            icon={<MessageCircle className="w-4 h-4" />}
                        >
                            Active
                        </FilterButton>
                        <FilterButton
                            selected={activeFilter === 'archived'}
                            onToggle={() => setActiveFilter('archived')}
                            icon={<Archive className="w-4 h-4" />}
                        >
                            Archived
                        </FilterButton>
                    </div>
                </div>

                {(currentConversations.length === 0) ? (
                    <EmptyInbox />
                ) : (
                    <div className="flex-1 mt-6 overflow-y-auto">
                        {currentConversations.map((conversation) => (
                            <InboxItem
                                key={conversation.id}
                                conversation={conversation}
                                onClick={() => handleConversationClick(conversation.id)}
                            />
                        ))}
                    </div>
                )}

                <button
                    onClick={handleNewConversation}
                    className="absolute p-3 transition-transform rounded-lg shadow-lg cursor-pointer bottom-4 right-4 bg-primary text-primary-foreground hover:scale-105"
                >
                    <SquarePen className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}

export { Inbox }