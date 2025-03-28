
type PopoverActionButtonProps = {
    icon: React.ReactNode;
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function PopoverActionButton({ icon, label, onClick }: PopoverActionButtonProps) {
    return (
        <button className="flex items-center gap-2 px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100" aria-label={label} onClick={onClick}>
            {icon}
            <span>{label}</span>
        </button>
    )
}
