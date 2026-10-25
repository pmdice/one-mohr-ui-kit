"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
    value: string
    label: string
}

interface SelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
    options: SelectOption[]
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
}

/**
 * Select-only combobox (ARIA 1.2). Arrow keys only move the highlight;
 * the value changes on Enter, Space or click — never while browsing (F-11).
 */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(function Select(
    { options, value, onChange, placeholder = "Auswählen…", disabled = false, className, id, onKeyDown, ...props },
    ref
) {
    const [open, setOpen] = React.useState(false)
    const [highlight, setHighlight] = React.useState(-1)
    const wrapperRef = React.useRef<HTMLDivElement>(null)
    const generatedId = React.useId()
    const listId = `${id ?? generatedId}-listbox`
    const optionId = (index: number) => `${listId}-${index}`
    const selectedIndex = options.findIndex(o => o.value === value)
    const selected = options[selectedIndex]
    const shouldReduce = useReducedMotion()

    React.useEffect(() => {
        const onOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
        }
        if (open) document.addEventListener("mousedown", onOutside)
        return () => document.removeEventListener("mousedown", onOutside)
    }, [open])

    const openList = () => {
        setHighlight(selectedIndex >= 0 ? selectedIndex : 0)
        setOpen(true)
    }

    const commit = (index: number) => {
        const option = options[index]
        if (option) onChange?.(option.value)
        setOpen(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e)
        if (e.defaultPrevented || disabled) return
        const last = options.length - 1
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                if (!open) openList()
                else setHighlight(h => Math.min(h + 1, last))
                break
            case "ArrowUp":
                e.preventDefault()
                if (!open) openList()
                else setHighlight(h => Math.max(h - 1, 0))
                break
            case "Home":
                if (open) { e.preventDefault(); setHighlight(0) }
                break
            case "End":
                if (open) { e.preventDefault(); setHighlight(last) }
                break
            case "Enter":
            case " ":
                e.preventDefault()
                if (open) commit(highlight)
                else openList()
                break
            case "Escape":
                if (open) { e.preventDefault(); setOpen(false) }
                break
            case "Tab":
                setOpen(false)
                break
            default:
                // Typeahead: jump to the first option starting with the typed letter
                if (open && e.key.length === 1) {
                    const index = options.findIndex(o => o.label.toLowerCase().startsWith(e.key.toLowerCase()))
                    if (index >= 0) setHighlight(index)
                }
        }
    }

    return (
        <div ref={wrapperRef} className={cn("relative w-full", className)}>
            <button
                ref={ref}
                id={id}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={open && highlight >= 0 ? optionId(highlight) : undefined}
                disabled={disabled}
                onClick={() => (open ? setOpen(false) : openList())}
                onKeyDown={handleKeyDown}
                className={cn(
                    "flex h-control w-full items-center justify-between rounded-control border bg-surface px-control text-left text-control text-fg transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
                    open ? "border-focus" : "border-border-strong"
                )}
                {...props}
            >
                <span className={cn("truncate", !selected && "text-fg-subtle")}>
                    {selected ? selected.label : placeholder}
                </span>
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={shouldReduce ? { duration: 0 } : { duration: 0.15 }}>
                    <ChevronDown className="h-4 w-4 text-fg-muted" aria-hidden="true" />
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        id={listId}
                        role="listbox"
                        initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={shouldReduce ? { duration: 0 } : { duration: 0.12, ease: "easeOut" }}
                        className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-panel border border-border bg-surface-raised py-1 shadow-lg"
                    >
                        {options.map((option, index) => (
                            <li
                                key={option.value}
                                id={optionId(index)}
                                role="option"
                                aria-selected={value === option.value}
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setHighlight(index)}
                                onClick={() => commit(index)}
                                className={cn(
                                    "flex cursor-pointer items-center justify-between px-control py-1.5 text-control text-fg",
                                    index === highlight && "bg-surface-hover",
                                    value === option.value && "font-medium"
                                )}
                            >
                                {option.label}
                                {value === option.value && <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    )
})
