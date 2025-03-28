"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SocketProvider } from '@/context/SocketContext'
import { AuthProvider } from "@/context/AuthContext"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ReactNode } from "react"
import { Toaster } from "sonner"
import { Config, ConfigProvider } from '@/context/ConfigContext'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

type ChatProvidersProps = {
    children: ReactNode
    config?: Partial<Config>
}

export function ChatProviders({ children, config }: ChatProvidersProps) {
    return (
        <ConfigProvider config={config}>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    <SocketProvider>
                        <TooltipProvider>
                            {children}
                            <Toaster position="top-right" richColors />
                            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
                        </TooltipProvider>
                    </SocketProvider>
                </QueryClientProvider>
            </AuthProvider>
        </ConfigProvider>
    )
} 