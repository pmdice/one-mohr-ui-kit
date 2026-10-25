import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Renders danger border + ring when true */
    error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => (
        <input
            ref={ref}
            className={cn(
                "flex h-control w-full rounded-control border bg-surface px-control text-control text-fg transition-colors",
                "placeholder:text-fg-subtle",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error
                    ? "border-danger focus-visible:ring-danger"
                    : "border-border-strong focus-visible:ring-focus aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
                className
            )}
            aria-invalid={error ? true : undefined}
            {...props}
        />
    )
)
Input.displayName = "Input"
