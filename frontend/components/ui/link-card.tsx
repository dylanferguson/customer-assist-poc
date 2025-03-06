import { cn } from "@/lib/utils"
import Link from "next/link"
import { ReactNode } from "react"

interface LinkCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
    href: string
    title: string
    subtitle: string
    icon?: ReactNode
}

const LinkCard = ({ 
    href, 
    title, 
    subtitle, 
    icon, 
    className, 
    ...props 
}: LinkCardProps) => {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-start gap-4 p-4 rounded-lg border bg-card text-card-foreground hover:bg-accent transition-colors",
                className
            )}
            {...props}
        >
            {icon && (
                <div className="flex-shrink-0 mt-0.5">
                    {icon}
                </div>
            )}
            <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </Link>
    )
}

export { LinkCard }
export type { LinkCardProps } 