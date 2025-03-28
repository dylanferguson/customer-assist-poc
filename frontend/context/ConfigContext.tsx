"use client"

import { createContext, useContext, ReactNode } from 'react'

export interface Config {
    apiUrl: string
    socketPath: string
    environment: 'development' | 'production' | 'test'
    viewMode: 'chat' | 'message-centre'
    threadMode: 'single-threaded' | 'multi-threaded'
}

const defaultConfig: Config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    socketPath: process.env.NEXT_PUBLIC_SOCKET_PATH || '/v1/ws',
    environment: (process.env.NEXT_PUBLIC_ENV || 'development') as Config['environment'],
    viewMode: 'chat',
    threadMode: 'single-threaded',
}

const ConfigContext = createContext<Config>(defaultConfig)

export function useConfig() {
    const context = useContext(ConfigContext)
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider')
    }
    return context
}

interface ConfigProviderProps {
    children: ReactNode
    config?: Partial<Config>
}

export function ConfigProvider({ children, config = {} }: ConfigProviderProps) {
    const mergedConfig = { ...defaultConfig, ...config }

    return (
        <ConfigContext.Provider value={mergedConfig}>
            {children}
        </ConfigContext.Provider>
    )
} 