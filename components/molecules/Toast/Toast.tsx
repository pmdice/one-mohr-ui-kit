"use client"

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastVariant = "success" | "error" | "info" | "warning"

interface ToastItem {
    id: string
    title: string
    description?: string
    variant?: ToastVariant
}

interface ToastContextValue {
    toast: (item: Omit<ToastItem, "id">) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
    const ctx = React.useContext(ToastContext)
    if (!ctx) throw new Error("useToast must be used within ToastProvider")
    return ctx
}

const ICONS: Record<ToastVariant, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-success" />,
    error:   <AlertCircle className="h-5 w-5 text-danger" />,
    info:    <Info className="h-5 w-5 text-accent" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
}

const VARIANT_BORDER: Record<ToastVariant, string> = {
    success: "border-success/30",
    error:   "border-danger/30",
    info:    "border-accent/30",
    warning: "border-warning/30",
}

const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastItem[]>([])
    const shouldReduce = useReducedMotion()

    const dismiss = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = React.useCallback((item: Omit<ToastItem, "id">) => {
        const id = Math.random().toString(36).slice(2, 9)
        setToasts(prev => [...prev, { ...item, id }])
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    }, [dismiss])

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
                <AnimatePresence mode="popLayout">
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            layout
                            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, x: 48, scale: 0.95 }}
                            transition={shouldReduce ? { duration: 0 } : { type: "spring", bounce: 0.15, duration: 0.35 }}
                            className={cn(
                                "flex w-80 items-start gap-3 rounded-panel border bg-surface-raised p-4 shadow-overlay",
                                t.variant ? VARIANT_BORDER[t.variant] : "border-border"
                            )}
                        >
                            {t.variant && ICONS[t.variant]}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-fg">{t.title}</p>
                                {t.description && (
                                    <p className="mt-0.5 text-xs text-fg-muted">{t.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => dismiss(t.id)}
                                aria-label="Dismiss notification"
                                className="text-fg-subtle transition-colors hover:text-fg-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}
