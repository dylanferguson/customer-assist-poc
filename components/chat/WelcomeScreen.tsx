import { MessageCircleMore } from "lucide-react"
import { Button } from "@/components/ui/button"

type WelcomeScreenProps = {
    onStartConversation: () => void
}

export const WelcomeScreen = ({ onStartConversation }: WelcomeScreenProps) => {
    return (
        <div className="flex flex-col items-center space-y-4 p-6 max-w-md mx-auto">
            <MessageCircleMore className="size-16 text-primary" />
            <h1 className="text-2xl font-bold">Message us</h1>
            <ul className="space-y-2 w-full">
                <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <span className="flex-1">24/7 Support</span>
                </li>
                <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <span className="flex-1">Your messages are safe and secure</span>
                </li>
                <li className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <span className="flex-1">Check and reply to messages when it suits you</span>
                </li>
            </ul>
            <Button className="w-full mt-4 cursor-pointer" onClick={onStartConversation}>Start Conversation</Button>
        </div>
    )
}