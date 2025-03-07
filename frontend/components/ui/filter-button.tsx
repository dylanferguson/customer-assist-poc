import * as React from "react"
import { cn } from "@/lib/utils"

interface FilterButtonProps {
  selected?: boolean
  onToggle?: (selected: boolean) => void
  icon?: React.ReactNode
  children: React.ReactNode
}

const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ selected = false, onToggle, children, icon, onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      onToggle?.(!selected)
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
          "hover:bg-muted border cursor-pointer",
          selected && "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
          !selected && "bg-background text-foreground border-primary-background-200",
        )}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    )
  }
)
FilterButton.displayName = "FilterButton"

export { FilterButton } 