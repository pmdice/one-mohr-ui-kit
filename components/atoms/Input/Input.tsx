import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Renders red border + ring when true */
    error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => (
        <input
            ref={ref}
            className={cn(
                "flex h-10 w-full rounded-full border bg-white px-4 py-2 text-sm transition-all",
                "placeholder:text-slate-400",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500",
                error
                    ? "border-red-400 focus-visible:ring-red-400 dark:border-red-600"
                    : "border-neutral-300 focus-visible:ring-blue-500 dark:border-neutral-700",
                className
            )}
            aria-invalid={error ? true : undefined}
            {...props}
        />
    )
)
Input.displayName = "Input"
