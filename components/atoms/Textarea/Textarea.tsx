import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Renders danger border + ring when true */
    error?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => (
        <textarea
            ref={ref}
            className={cn(
                "flex min-h-[5rem] w-full resize-y rounded-control border bg-surface px-control py-2 text-control text-fg transition-colors",
                "placeholder:text-fg-subtle",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error
                    ? "border-danger focus-visible:ring-danger"
                    : "border-border-strong focus-visible:ring-focus",
                className
            )}
            aria-invalid={error ? true : undefined}
            {...props}
        />
    )
)
Textarea.displayName = "Textarea"
