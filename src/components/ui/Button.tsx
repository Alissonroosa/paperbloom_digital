import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost"
    size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-text-main hover:bg-primary/90 shadow-md hover:shadow-lg",
            secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-md hover:shadow-lg",
            outline: "border-2 border-primary/20 bg-transparent hover:bg-primary/5 text-text-main",
            ghost: "hover:bg-primary/5 hover:text-primary",
        }

        const sizes = {
            default: "h-11 px-6 py-2",
            sm: "h-9 rounded-full px-4",
            lg: "h-14 rounded-full px-10",
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold tracking-wide ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
