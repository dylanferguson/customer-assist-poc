'use client'

import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { Chat } from "@/components/chat/Chat"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 bg-muted min-h-svh md:p-10">
      <div className="flex flex-col w-full max-w-sm gap-6">
        <a href="#" className="flex items-center self-center gap-2 font-medium">
          <div className="flex items-center justify-center rounded-md bg-primary text-primary-foreground size-6">
            <GalleryVerticalEnd className="size-4" />
          </div>
          ACME Inc.
        </a>
        <LoginForm onLogin={() => {
          router.push('/dashboard')
        }} />
      </div>
      <Chat />
    </div>
  )
}
