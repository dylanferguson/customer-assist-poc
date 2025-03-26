'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { Message, TypingEvent } from '@/api/messagingServiceClient'

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
    socketAuthenticated: boolean
    connect: () => void
    disconnect: () => void
    subscribeToConversation: (conversationId: string, { message, typing }: { message?: (message: Message) => void, typing?: (data: TypingEvent) => void }) => () => void
    unsubscribeFromConversation: (conversationId: string, { message, typing }: { message?: (message: Message) => void, typing?: (data: TypingEvent) => void }) => void
}

const messageSound = typeof window !== 'undefined'
    ? new Audio('/sounds/chime.mp3')
    : null;

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    socketAuthenticated: false,
    connect: () => { },
    disconnect: () => { },
    subscribeToConversation: () => () => { },
    unsubscribeFromConversation: () => { },
})

export const useSocket = () => useContext(SocketContext)

interface SocketProviderProps {
    children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [socketAuthenticated, setSocketAuthenticated] = useState(false)

    // Keep track of conversation subscriptions
    const conversationSubscribersRef = useRef<{
        [conversationId: string]: {
            message?: Set<(message: any) => void>
            typing?: Set<(data: TypingEvent) => void>
        }
    }>({})

    // Get auth state directly from context
    const { getToken, token } = useAuth()

    const authenticateSocket = async () => {
        if (socketRef.current && isConnected) {
            const token = await getToken()
            socketRef.current.emit('authenticate', token)
            console.log('Authentication event sent to server')
        }
    }

    const connect = () => {
        if (!socketRef.current) {
            socketRef.current = io(process.env.NEXT_PUBLIC_API_URL, {
                path: process.env.NEXT_PUBLIC_SOCKET_PATH,
            })

            socketRef.current.on('connect', () => {
                setIsConnected(true)
                console.log('Socket connected with ID:', socketRef.current?.id)
                authenticateSocket()
            })

            socketRef.current.on('message', (message) => {
                console.log('Received message:', message)

                // Play notification sound when a new message arrives
                messageSound?.play().catch(err => {
                    console.error('Failed to play message sound:', err)
                });


                if (message.conversationId) {
                    const conversationId = message.conversationId;
                    const subscribers = conversationSubscribersRef.current[conversationId];
                    if (subscribers) {
                        subscribers.message?.forEach(callback => callback(message));
                    }
                }
            })

            socketRef.current.on('typing', (data) => {
                const conversationId = data.conversationId;
                const subscribers = conversationSubscribersRef.current[conversationId];
                if (subscribers) {
                    subscribers.typing?.forEach(callback => callback(data));
                }
            })

            // Handle authentication response from server
            socketRef.current.on('authenticated', (response) => {
                if (response.success) {
                    setSocketAuthenticated(true)
                    console.log('Socket authenticated successfully')
                } else {
                    setSocketAuthenticated(false)
                    console.error('Socket authentication failed:', response.message)
                }
            })

            socketRef.current.on('disconnect', () => {
                setIsConnected(false)
                setSocketAuthenticated(false)
                console.log('Socket disconnected')
            })

            socketRef.current.on('error', (error) => {
                console.error('Socket error:', error)
            })
        }
    }

    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.disconnect()
            socketRef.current = null
            setIsConnected(false)
            setSocketAuthenticated(false)
        }
    }

    // Subscribe to messages for a specific conversation
    const subscribeToConversation = (conversationId: string, { message, typing }: { message?: (message: Message) => void, typing?: (data: TypingEvent) => void }) => {
        if (!conversationSubscribersRef.current[conversationId]) {
            conversationSubscribersRef.current[conversationId] = {
                message: new Set(),
                typing: new Set()
            }
        }

        if (message) {
            conversationSubscribersRef.current[conversationId].message?.add(message)
            console.log(`Subscribed to messages for conversation ${conversationId}`)
        }
        if (typing) {
            conversationSubscribersRef.current[conversationId].typing?.add(typing)
            console.log(`Subscribed to typing for conversation ${conversationId}`)
        }

        // Return unsubscribe function
        return () => {
            unsubscribeFromConversation(conversationId, { message, typing })
        }
    }

    // Move unsubscribeFromConversation outside of subscribeToConversation
    const unsubscribeFromConversation = (conversationId: string,
        { message, typing }: {
            message?: (message: Message) => void,
            typing?: (data: TypingEvent) => void
        }) => {
        if (!conversationSubscribersRef.current[conversationId]) return

        if (message) {
            // Remove specific callback
            conversationSubscribersRef.current[conversationId].message?.delete(message)
            console.log(`Unsubscribed specific callback from conversation ${conversationId}`)

            // Clean up empty set
            if (conversationSubscribersRef.current[conversationId]?.message?.size === 0) {
                delete conversationSubscribersRef.current[conversationId]
            }
        }
        if (typing) {
            // Remove specific callback
            conversationSubscribersRef.current[conversationId]?.typing?.delete(typing)
            console.log(`Unsubscribed specific callback from conversation ${conversationId}`)

            // Clean up empty set
            if (conversationSubscribersRef.current[conversationId]?.typing?.size === 0) {
                delete conversationSubscribersRef.current[conversationId]
            }
        }

        if (!typing && !message) {
            // Remove all callbacks for this conversation
            delete conversationSubscribersRef.current[conversationId]
            console.log(`Unsubscribed all callbacks from conversation ${conversationId}`)
        }
    }

    // Re-authenticate when token changes or connection status changes
    useEffect(() => {
        if (isConnected && token) {
            authenticateSocket()
        }
    }, [token, isConnected])

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, [])

    return (
        <SocketContext.Provider value={{
            socket: socketRef.current,
            isConnected,
            socketAuthenticated,
            connect,
            disconnect,
            subscribeToConversation,
            unsubscribeFromConversation
        }}>
            {children}
        </SocketContext.Provider>
    )
}