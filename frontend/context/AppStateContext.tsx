'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { z } from 'zod'

const STORAGE_NAMESPACE = 'messaging_app'
const CURRENT_VERSION = 1

const AppStateSchema = z.object({
    hasActiveSession: z.boolean(),
    chatOpen: z.boolean(),
    version: z.literal(CURRENT_VERSION)
})

type AppState = z.infer<typeof AppStateSchema>

const initialState: AppState = {
    chatOpen: false,
    hasActiveSession: false,
    version: CURRENT_VERSION
}

interface AppStateContextType {
    state: AppState
    updateState: (updates: Partial<AppState>) => void
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

export function AppStateProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>(() => {
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
            sessionStorage.setItem(STORAGE_NAMESPACE, JSON.stringify(state))
        }
    }, [state])

    const updateState = (updates: Partial<AppState>) => {
        setState(current => ({
            ...current,
            ...updates
        }))
    }

    return (
        <AppStateContext.Provider value={{ state, updateState }}>
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