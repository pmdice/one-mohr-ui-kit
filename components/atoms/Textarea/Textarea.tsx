import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Renders danger border + ring when true */
    error?: boolean
}

/** Share of maxLength from which the count appears (E-03): earlier it is noise, later it is too late. */
const COUNT_FROM = 0.8

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, maxLength, onChange, ...props }, ref) => {
        const [typed, setTyped] = React.useState(() => String(props.defaultValue ?? "").length)
        const length = props.value !== undefined ? String(props.value).length : typed
        const area = (
        <textarea
            ref={ref}
            className={cn(
                "flex min-h-[5rem] w-full resize-y rounded-control border bg-surface px-control py-2 text-control text-fg transition-colors",
                "placeholder:text-fg-subtle",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error
                    ? "border-danger focus-visible:ring-danger"
                    : "border-border-strong focus-visible:ring-focus aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
                className
            )}
            aria-invalid={error ? true : undefined}
            maxLength={maxLength}
            onChange={(e) => { setTyped(e.target.value.length); onChange?.(e) }}
            {...props}
        />
        )
        if (maxLength === undefined) return area
        return (
            <div className="flex w-full flex-col gap-1">
                {area}
                <span aria-live="polite" className="self-end font-mono text-xs tabular-nums text-fg-subtle">
                    {length >= maxLength * COUNT_FROM ? `${length} / ${maxLength}` : ""}
                </span>
            </div>
        )
    }
)
Textarea.displayName = "Textarea"
