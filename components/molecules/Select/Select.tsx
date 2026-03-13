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
                    "flex h-10 w-full items-center justify-between rounded-full border bg-white px-4 text-sm transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "dark:bg-neutral-900 dark:text-white",
                    open
                        ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2"
                        : "border-slate-300 dark:border-slate-700"
                )}
            >
                <span className={cn(!selected && "text-slate-400 dark:text-slate-500")}>
                    {selected ? selected.label : placeholder}
                </span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={shouldReduce ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
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
                        className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
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
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
