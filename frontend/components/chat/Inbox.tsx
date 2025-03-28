'use client'

import { Spinner } from "../ui/spinner"
import { useEffect, useState } from "react"
import { SquarePen, Calendar, HelpCircle, Search, MessageCircle, Archive } from "lucide-react"
import { LinkCard } from "../ui/link-card"
import { InboxItem } from "./InboxItem"
import { FilterButton } from "../ui/filter-button"
import { useMessagingService } from "../../hooks/useMessagingService"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useConfig } from "@/context/ConfigContext"
import { cn } from "@/lib/utils"
import { useAppState } from "@/context/AppStateContext"
export interface InboxProps {
    onSelectConversation?: (id: string) => void
}

interface EmptyInboxProps {
    messageType: 'active' | 'archived'
}

const EmptyInbox = ({ messageType }: EmptyInboxProps) => {

    return (
        <div className="flex-1">
            <div className="mt-4 mb-10">
                <p className="font-medium text-gray-900">You have no {messageType} conversations.</p>
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
    const { updateAppState, appState } = useAppState()
    const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(appState.activeConversationId)
    const config = useConfig()

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
        setSelectedConversationId(id)
        onSelectConversation?.(id)
    }

    const handleNewConversation = async () => {
        const newConversation = await createConversation.mutateAsync({})
        onSelectConversation?.(newConversation?.id)
    }

    useEffect(() => {
        if (config.viewMode == 'chat') {
            updateAppState({ activeConversationId: undefined })
        }
    }, [])

    if (isLoading || createConversation.isPending) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 h-[calc(100%-40px)]">
                <Spinner />
            </div>
        )
    }

    return (
        <div className={cn(config.viewMode == 'chat' && "p-4")}>
            <div className="h-full">
                <div className="mb-4">
                    <p className="mt-2 text-gray-700 text-sm/5">ACME virtual assistant is here for you 24/7. Our human team will get back to you within 48 hours.</p>
                    <h2 className="mt-4 text-lg font-bold">Messages</h2>
                    <div className="flex gap-2 mt-2">
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
                    <EmptyInbox messageType={activeFilter} />
                ) : (
                    <AnimatePresence mode="popLayout">
                        {currentConversations.map((conversation) => (
                            <motion.div
                                key={conversation.id}
                                initial={{ opacity: 0, }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    transition: {
                                        type: "spring",
                                        bounce: 0.3
                                    }
                                }}
                                exit={{ opacity: 0 }}
                                layout
                                transition={{
                                    layout: { type: "spring", bounce: 0.1 },
                                    duration: 0.2
                                }}
                            >
                                <InboxItem
                                    selected={conversation.id === selectedConversationId}
                                    conversation={conversation}
                                    onClick={() => handleConversationClick(conversation.id)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {config.viewMode == 'chat' && (
                    <button
                        onClick={handleNewConversation}
                        className="absolute p-3 transition-transform rounded-lg shadow-lg cursor-pointer bottom-4 right-4 bg-primary text-primary-foreground hover:scale-105"
                    >
                        <SquarePen className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    )
}

export { Inbox }