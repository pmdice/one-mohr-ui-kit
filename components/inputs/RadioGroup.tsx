"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioOption {
    value: string
    label: string
    description?: string
}

/**
 * Two to five options, all visible (E-08). One tab stop on the chosen option; arrows move and choose.
 * `segments` for short words side by side, `list` for options that need a description.
 */
export function RadioGroup({ value, onChange, options, label, variant = "list", disabled, className }: {
    value: string | null
    onChange: (value: string) => void
    options: RadioOption[]
    label: string
    variant?: "list" | "segments"
    disabled?: boolean
    className?: string
}) {
    const id = React.useId()
    const refs = React.useRef<(HTMLElement | null)[]>([])
    const current = Math.max(0, options.findIndex((o) => o.value === value))

    const move = (from: number, step: number) => {
        const next = (from + step + options.length) % options.length
        onChange(options[next].value)
        refs.current[next]?.focus()
    }
    const onKeyDown = (index: number) => (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); move(index, 1) }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); move(index, -1) }
        if (e.key === " ") { e.preventDefault(); onChange(options[index].value) }
    }

    return (
        <div
            role="radiogroup"
            aria-labelledby={`${id}-label`}
            aria-disabled={disabled || undefined}
            className={cn("flex flex-col gap-1.5", className)}
        >
            <span id={`${id}-label`} className="text-sm font-medium text-fg">{label}</span>
            <div className={variant === "segments" ? "inline-flex w-fit rounded-control border border-border-strong bg-surface-sunken p-0.5" : "flex flex-col gap-2"}>
                {options.map((option, index) => {
                    const checked = option.value === value
                    const common = {
                        ref: (el: HTMLElement | null) => { refs.current[index] = el },
                        role: "radio",
                        "aria-checked": checked,
                        "aria-describedby": option.description ? `${id}-${index}-description` : undefined,
                        tabIndex: index === current ? 0 : -1,
                        onClick: () => !disabled && onChange(option.value),
                        onKeyDown: onKeyDown(index),
                    } as const
                    if (variant === "segments") {
                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={disabled}
                                {...common}
                                className={cn(
                                    "h-[calc(var(--control-h)-0.375rem)] rounded-[calc(var(--r-control)-2px)] px-3 text-control transition-colors duration-fast",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                                    checked ? "bg-surface font-medium text-fg shadow-overlay" : "text-fg-muted hover:text-fg"
                                )}
                            >
                                {option.label}
                            </button>
                        )
                    }
                    return (
                        <div key={option.value} className="flex items-start gap-2">
                            <span
                                {...common}
                                aria-labelledby={`${id}-${index}-label`}
                                className={cn(
                                    "mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-control border transition-colors duration-fast",
                                    checked ? "border-accent" : "border-border-strong bg-surface",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
                                )}
                            >
                                {checked && <span className="h-2 w-2 rounded-[2px] bg-accent" aria-hidden="true" />}
                            </span>
                            <span className="flex flex-col">
                                <span id={`${id}-${index}-label`} className="cursor-pointer text-sm text-fg" onClick={() => !disabled && onChange(option.value)}>{option.label}</span>
                                {option.description && <span id={`${id}-${index}-description`} className="text-xs text-fg-muted">{option.description}</span>}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
