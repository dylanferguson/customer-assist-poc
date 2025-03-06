import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-current border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        destructive: "text-destructive",
        muted: "text-muted-foreground",
      },
      size: {
        default: "h-5 w-5 border-2",
        sm: "h-4 w-4 border-2",
        lg: "h-6 w-6 border-2",
        xl: "h-8 w-8 border-3",
        "2xl": "h-12 w-12 border-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof spinnerVariants> {
  asChild?: boolean
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(({ className, variant, size, ...props }, ref) => {
  return (
    <span
      className={cn(spinnerVariants({ variant, size, className }))}
      ref={ref}
      role="status"
      aria-label="Loading"
      {...props}
    />
  )
})
Spinner.displayName = "Spinner"

export { Spinner, spinnerVariants }

