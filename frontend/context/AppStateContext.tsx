'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { z } from 'zod'

const STORAGE_NAMESPACE = 'messaging_app'
const CURRENT_VERSION = 1

const AppStateSchema = z.object({
    hasActiveSession: z.boolean(),
    activeConversationId: z.string().optional(),
    chatOpen: z.boolean(),
    version: z.literal(CURRENT_VERSION)
})

type AppState = z.infer<typeof AppStateSchema>

const initialState: AppState = {
    chatOpen: false,
    activeConversationId: undefined,
    hasActiveSession: false,
    version: CURRENT_VERSION
}

interface AppStateContextType {
    appState: AppState
    updateAppState: (updates: Partial<AppState>) => void
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

export function AppStateProvider({ children }: { children: ReactNode }) {
    const [appState, setAppState] = useState<AppState>(() => {
        if (typeof window === 'undefined') {
            return initialState
        }

        const saved = sessionStorage.getItem(STORAGE_NAMESPACE)
        if (!saved) {
            return initialState
        }

        try {
            const parsedState = JSON.parse(saved)
            const validatedState = AppStateSchema.parse(parsedState)
            return validatedState
        } catch (error) {
            console.error('Invalid app state:', error)
            return initialState
        }
    })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(STORAGE_NAMESPACE, JSON.stringify(appState))
        }
    }, [appState])

    const updateAppState = (updates: Partial<AppState>) => {
        setAppState(current => ({
            ...current,
            ...updates
        }))
    }

    return (
        <AppStateContext.Provider value={{ appState: appState, updateAppState }}>
            {children}
        </AppStateContext.Provider>
    )
}

export function useAppState() {
    const context = useContext(AppStateContext)
    if (context === undefined) {
        throw new Error('useAppState must be used within an AppStateProvider')
    }
    return context
} 