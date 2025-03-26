import React, { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
    socketAuthenticated: boolean
    connect: () => void
    disconnect: () => void
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    socketAuthenticated: false,
    connect: () => { },
    disconnect: () => { },
})

export const useSocket = () => useContext(SocketContext)

interface SocketProviderProps {
    children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [socketAuthenticated, setSocketAuthenticated] = useState(false)

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
            disconnect
        }}>
            {children}
        </SocketContext.Provider>
    )
} 