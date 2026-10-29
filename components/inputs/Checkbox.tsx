"use client"

import * as React from "react"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Yes/no that is saved with the form (E-07). A native checkbox underneath, so forms, labels and keyboard work
 * as everywhere; "mixed" for "some of them" (a select-all over a partly chosen list).
 */
export const Checkbox = React.forwardRef<HTMLInputElement, Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "onChange" | "type"> & {
    checked: boolean | "mixed"
    onChange: (checked: boolean) => void
    /** Says the checked state ("Lieferschein mitdrucken"), never a negation. */
    label?: React.ReactNode
    description?: React.ReactNode
}>(function Checkbox({ checked, onChange, label, description, className, id, disabled, ...props }, forwarded) {
    const generated = React.useId()
    const boxId = id ?? generated
    const ref = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(forwarded, () => ref.current as HTMLInputElement)
    React.useEffect(() => {
        if (ref.current) ref.current.indeterminate = checked === "mixed"
    }, [checked])

    const box = (
        <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
            <input
                ref={ref}
                id={boxId}
                type="checkbox"
                checked={checked === true}
                aria-checked={checked === "mixed" ? "mixed" : undefined}
                aria-describedby={description ? `${boxId}-description` : undefined}
                disabled={disabled}
                onChange={(e) => onChange(checked === "mixed" ? true : e.target.checked)}
                className={cn(
                    "peer h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-border-strong bg-surface transition-colors duration-fast",
                    "checked:border-accent checked:bg-accent indeterminate:border-accent indeterminate:bg-accent",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    !label && className
                )}
                {...props}
            />
            {checked === "mixed"
                ? <Minus className="pointer-events-none absolute h-3 w-3 text-accent-fg" aria-hidden="true" />
                : <Check className="pointer-events-none absolute hidden h-3 w-3 text-accent-fg peer-checked:block" aria-hidden="true" />}
        </span>
    )
    if (!label) return box
    return (
        <div className={cn("flex items-start gap-2", className)}>
            <span className="mt-0.5 flex">{box}</span>
            <span className="flex flex-col">
                <label htmlFor={boxId} className={cn("cursor-pointer text-sm text-fg", disabled && "cursor-not-allowed opacity-50")}>{label}</label>
                {description && <span id={`${boxId}-description`} className="text-xs text-fg-muted">{description}</span>}
            </span>
        </div>
    )
})
