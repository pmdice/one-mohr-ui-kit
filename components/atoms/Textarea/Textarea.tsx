import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Renders red border + ring when true */
    error?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => (
        <textarea
            ref={ref}
            className={cn(
                "flex min-h-[96px] w-full resize-y rounded-2xl border bg-white px-4 py-3 text-sm transition-all",
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
Textarea.displayName = "Textarea"
