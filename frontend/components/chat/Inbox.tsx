import { Spinner } from "../ui/spinner"
import { useEffect, useState } from "react"
import { SquarePen, Calendar, HelpCircle, Search } from "lucide-react"
import { LinkCard } from "../ui/link-card"
import { ConversationListItem } from "./ConversationListItem"
import { FilterButton } from "../ui/filter-button"

export interface Conversation {
    id: string
    type: 'bot' | 'agent'
    name: string
    subject: string
    lastMessage: string
    timestamp: Date
    unread: boolean
}

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
    const [isLoading, setIsLoading] = useState(true)
    const [activeConversations, setActiveConversations] = useState<Conversation[]>([])
    const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([])
    const [activeFilter, setActiveFilter] = useState<'active' | 'archived'>('active')

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
            // Sample data split between active and archived
            setActiveConversations([
                {
                    id: '1',
                    type: 'bot',
                    name: 'Virtual Assistant',
                    subject: 'General Inquiry',
                    lastMessage: 'How can I help you today?',
                    timestamp: new Date(),
                    unread: true
                },
                {
                    id: '2',
                    type: 'agent',
                    name: 'Sarah from Support',
                    subject: 'Loan Application Review',
                    lastMessage: "I've reviewed your loan application...",
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    unread: false
                },
            ])

            setArchivedConversations([
                {
                    id: '3',
                    type: 'agent',
                    name: 'Michael Chen',
                    subject: 'Credit Card Application',
                    lastMessage: 'Your application has been approved',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    unread: true
                },
                {
                    id: '4',
                    type: 'bot',
                    name: 'Virtual Assistant',
                    subject: 'Account Security Alert',
                    lastMessage: 'We noticed a login from a new device',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    unread: false
                }
            ])
        }, 200)

        return () => clearTimeout(timer)
    }, [])

    const currentConversations = activeFilter === 'active' ? activeConversations : archivedConversations

    // Add click handler to ConversationListItem
    const handleConversationClick = (id: string) => {
        onSelectConversation?.(id)
    }

    const handleNewMessage = () => {
        // Create a new conversation ID and navigate to it
        const newConversationId = 'new'
        onSelectConversation?.(newConversationId)
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 p-4">
                <Spinner />
                <p className="mt-2 text-sm text-muted-foreground">Loading conversations...</p>
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
                        >
                            Active
                        </FilterButton>
                        <FilterButton
                            selected={activeFilter === 'archived'}
                            onToggle={() => setActiveFilter('archived')}
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
                            <ConversationListItem
                                key={conversation.id}
                                conversation={conversation}
                                onClick={() => handleConversationClick(conversation.id)}
                            />
                        ))}
                    </div>
                )}

                <button
                    onClick={handleNewMessage}
                    className="absolute p-3 transition-transform rounded-lg shadow-lg cursor-pointer bottom-4 right-4 bg-primary text-primary-foreground hover:scale-105"
                >
                    <SquarePen className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}

export default Inbox