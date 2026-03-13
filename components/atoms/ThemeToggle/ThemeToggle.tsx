"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Button } from "@/components/atoms/Button/Button"
import { cn } from "@/lib/utils"

const OPTIONS = [
    { value: "light",  label: "Light",  Icon: Sun },
    { value: "dark",   label: "Dark",   Icon: Moon },
    { value: "system", label: "System", Icon: Monitor },
] as const

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [open, setOpen] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const ref = React.useRef<HTMLDivElement>(null)
    const shouldReduce = useReducedMotion()

    React.useEffect(() => setMounted(true), [])

    React.useEffect(() => {
        if (!open) return
        const onOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", onOutside)
        return () => document.removeEventListener("mousedown", onOutside)
    }, [open])

    const ActiveIcon = !mounted
        ? Sun
        : theme === "dark"   ? Moon
        : theme === "light"  ? Sun
        : Monitor

    return (
        <div ref={ref} className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(v => !v)}
                aria-label="Toggle theme"
                aria-expanded={open}
            >
                <ActiveIcon className="h-[1.2rem] w-[1.2rem]" />
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }}
                        transition={shouldReduce ? { duration: 0 } : { type: "spring", bounce: 0.15, duration: 0.2 }}
                        className="absolute right-0 top-full z-50 mt-1 min-w-[8rem] overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                    >
                        {OPTIONS.map(({ value, label, Icon }) => (
                            <button
                                key={value}
                                onClick={() => { setTheme(value); setOpen(false) }}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                    theme === value
                                        ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
                                        : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
