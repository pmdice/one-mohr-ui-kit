"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** A change that happened at once, with a way back for a few seconds (S-06). */
export function UndoNotice({ message, onUndo, onClose, duration = 8000, className }: {
    message: string
    onUndo: () => void
    onClose: () => void
    duration?: number
    className?: string
}) {
    const closeRef = React.useRef(onClose)
    React.useEffect(() => { closeRef.current = onClose })
    React.useEffect(() => {
        const timer = setTimeout(() => closeRef.current(), duration)
        return () => clearTimeout(timer)
    }, [message, duration])

    return (
        <div role="status" className={cn("flex items-center gap-3 rounded-panel border border-border bg-surface-raised px-4 py-2 text-sm text-fg shadow-lg", className)}>
            <span>{message}</span>
            <button type="button" onClick={onUndo} className="rounded-control px-2 py-0.5 font-medium text-accent hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                Rückgängig
            </button>
        </div>
    )
}
