"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
    value: string
    label: string
}

interface SelectProps {
    options: SelectOption[]
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function Select({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    disabled = false,
    className,
}: SelectProps) {
    const [open, setOpen] = React.useState(false)
    const ref = React.useRef<HTMLDivElement>(null)
    const selected = options.find(o => o.value === value)
    const shouldReduce = useReducedMotion()

    React.useEffect(() => {
        const onOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        if (open) document.addEventListener("mousedown", onOutside)
        return () => document.removeEventListener("mousedown", onOutside)
    }, [open])

    // Keyboard navigation
    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false)
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(v => !v) }
        if (e.key === "ArrowDown" && open) {
            const idx = options.findIndex(o => o.value === value)
            const next = options[idx + 1]
            if (next) onChange?.(next.value)
        }
        if (e.key === "ArrowUp" && open) {
            const idx = options.findIndex(o => o.value === value)
            const prev = options[idx - 1]
            if (prev) onChange?.(prev.value)
        }
    }

    return (
        <div ref={ref} className={cn("relative w-full", className)}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(v => !v)}
                onKeyDown={onKeyDown}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={cn(
                    "flex h-control w-full items-center justify-between rounded-control border bg-surface px-control text-control text-fg transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    open
                        ? "border-focus ring-2 ring-focus ring-offset-2"
                        : "border-border-strong"
                )}
            >
                <span className={cn(!selected && "text-fg-subtle")}>
                    {selected ? selected.label : placeholder}
                </span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={shouldReduce ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}>
                    <ChevronDown className="h-4 w-4 text-fg-muted" />
                </motion.div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        role="listbox"
                        initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
                        transition={shouldReduce ? { duration: 0 } : { type: "spring", bounce: 0.2, duration: 0.25 }}
                        className="absolute z-50 mt-2 w-full overflow-hidden rounded-panel border border-border bg-surface-raised py-1 shadow-lg"
                    >
                        {options.map((option) => (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={value === option.value}
                                onClick={() => { onChange?.(option.value); setOpen(false) }}
                                className={cn(
                                    "flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition-colors",
                                    value === option.value
                                        ? "bg-accent-subtle text-accent"
                                        : "text-fg hover:bg-surface-sunken"
                                )}
                            >
                                {option.label}
                                {value === option.value && <Check className="h-3.5 w-3.5" />}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    )
}
