"use client"

import * as React from "react"
import { NoticeCard, useTimeout } from "@/components/feedback/Notices"

/** A change that happened at once, with a way back for a few seconds (S-06, R-04); paused while pointed at. */
export function UndoNotice({ message, onUndo, onClose, duration = 8000, className }: {
    message: string
    onUndo: () => void
    onClose: () => void
    duration?: number
    className?: string
}) {
    const { pause } = useTimeout(duration, onClose, message)
    return <NoticeCard {...pause} tone="success" message={message} action={{ label: "Rückgängig", run: onUndo }} className={className} />
}
