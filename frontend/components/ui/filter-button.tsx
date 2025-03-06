import * as React from "react"
import { cn } from "@/lib/utils"

interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  onToggle?: (selected: boolean) => void
  children: React.ReactNode
}

const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ selected = false, onToggle, className, children, onClick, ...props }, ref) => {
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
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
FilterButton.displayName = "FilterButton"

export { FilterButton } 