import { MapPin, File, Image, Plus } from "lucide-react";
import { useState } from "react";

import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Popover } from "@/components/ui/popover";

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button className="flex items-center gap-2 px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100" aria-label={label} onClick={onClick}>
            {icon}
            <span>{label}</span>
        </button>
    )
}

type ChatActionsPopoverProps = {
    onLocationClick: () => void;
    onFileClick: () => void;
    onImageClick: () => void;
}

export function ChatActionsPopover({ onLocationClick, onFileClick, onImageClick }: ChatActionsPopoverProps) {
    const [open, setOpen] = useState(false)

    const handleAction = (action: () => void) => {
        action()
        setOpen(false)  // Close the popover after action
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
                <div className="p-1 bg-gray-800 rounded-full cursor-pointer hover:opacity-80">
                    <Plus className={`w-4 h-4 text-white transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-30" align="start">
                <div className="flex flex-col gap-3">
                    <ActionButton
                        icon={<MapPin className="w-4 h-4" />}
                        label="Location"
                        onClick={() => handleAction(onLocationClick)}
                    />
                    <ActionButton
                        icon={<File className="w-4 h-4" />}
                        label="File"
                        onClick={() => handleAction(onFileClick)}
                    />
                    <ActionButton
                        icon={<Image className="w-4 h-4" />}
                        label="Image"
                        onClick={() => handleAction(onImageClick)}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}