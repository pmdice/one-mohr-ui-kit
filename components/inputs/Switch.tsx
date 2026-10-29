"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** A setting that applies at once (E-07); in a form that is saved, use Checkbox. */
export function Switch({ checked, onChange, label, description, disabled, className }: {
    checked: boolean
    onChange: (checked: boolean) => void
    /** Says the "on" state ("Ton"), never a negation. */
    label: React.ReactNode
    description?: React.ReactNode
    disabled?: boolean
    className?: string
}) {
    const id = React.useId()
    return (
        <div className={cn("flex items-start gap-3", className)}>
            <button
                type="button"
                role="switch"
                id={id}
                aria-checked={checked}
                aria-labelledby={`${id}-label`}
                aria-describedby={description ? `${id}-description` : undefined}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-control border transition-colors duration-fast",
                    checked ? "border-accent bg-accent" : "border-border-strong bg-surface-sunken",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        "absolute h-3.5 w-3.5 rounded-[3px] shadow-overlay transition-[left] duration-fast ease-out-soft",
                        checked ? "left-[1.125rem] bg-accent-fg" : "left-0.5 bg-surface"
                    )}
                />
            </button>
            <span className="flex flex-col">
                <span id={`${id}-label`} className="text-sm text-fg" onClick={() => !disabled && onChange(!checked)}>{label}</span>
                {description && <span id={`${id}-description`} className="text-xs text-fg-muted">{description}</span>}
            </span>
        </div>
    )
}
