"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
    open: boolean
    onClose: () => void
    title?: string
    description?: string
    children?: React.ReactNode
    className?: string
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
    // Close on Escape
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
        if (open) document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [open, onClose])

    // Lock body scroll
    React.useEffect(() => {
        if (open) document.body.style.overflow = "hidden"
        else document.body.style.overflow = ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    if (typeof document === "undefined") return null

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden
                    />

                    {/* Centering shell */}
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        role="dialog"
                        aria-modal
                        aria-labelledby={title ? "dialog-title" : undefined}
                        aria-describedby={description ? "dialog-description" : undefined}
                    >
                        <motion.div
                            key="panel"
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
                            className={cn(
                                "relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10",
                                className
                            )}
                        >
                            <button
                                onClick={onClose}
                                aria-label="Close dialog"
                                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {title && (
                                <h2 id="dialog-title" className="text-lg font-semibold text-neutral-900 dark:text-white pr-6">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p id="dialog-description" className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {description}
                                </p>
                            )}
                            {children && (
                                <div className={cn((title || description) && "mt-4")}>
                                    {children}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("mt-6 flex items-center justify-end gap-2", className)}
            {...props}
        />
    )
}
