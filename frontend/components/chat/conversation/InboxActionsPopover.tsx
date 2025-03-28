'use client'

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Archive, CircleEllipsis } from "lucide-react"
import { useState } from "react";
import { PopoverActionButton } from "./PopoverActionButton";

type InboxActionsPopoverProps = {
    onArchiveClick: () => void;
    onAudioCallClick: () => void;
    onVideoCallClick: () => void;
}

export const InboxActionsPopover = ({ onArchiveClick, onAudioCallClick, onVideoCallClick }: InboxActionsPopoverProps) => {
    const [open, setOpen] = useState(false);
    const handleAction = (event: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
        event?.stopPropagation()
        action()
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
                <div
                    className={`${open ? 'text-gray-800' : 'invisible'}  bg-white rounded-full cursor-pointer group-hover:visible hover:text-gray-800 hover:bg-accent/90`}
                    onClick={(e) => {
                        console.log(e)
                        e.stopPropagation();
                        setOpen(!open);
                    }}
                >
                    <CircleEllipsis className="stroke-[1.5] w-7 h-7 stroke-gray-700 hover:stroke-gray-700" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-30" align="center" side="top">
                <div className="flex flex-col gap-3">
                    <PopoverActionButton
                        icon={<Archive className="w-4 h-4" />}
                        label="Archive"
                        onClick={(event) => handleAction(event, onArchiveClick)}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}