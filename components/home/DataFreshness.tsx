"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { formatDateTime } from "@/components/status/time"

/** From when the numbers are (A-06), with a refresh; refreshes by itself when the page is seen again. */
export function DataFreshness({ at, now, onRefresh }: { at: number; now: number; onRefresh: () => void }) {
    const refresh = React.useRef(onRefresh)
    React.useEffect(() => { refresh.current = onRefresh })
    React.useEffect(() => {
        const onVisible = () => { if (document.visibilityState === "visible") refresh.current() }
        document.addEventListener("visibilitychange", onVisible)
        return () => document.removeEventListener("visibilitychange", onVisible)
    }, [])
    const time = formatDateTime(at).slice(-5)
    const sameDay = formatDateTime(at).slice(0, 10) === formatDateTime(now).slice(0, 10)
    return (
        <span className="flex items-center gap-2 text-xs text-fg-muted">
            <span title={formatDateTime(at)}>Stand {sameDay ? time : formatDateTime(at)}</span>
            <button type="button" onClick={onRefresh} className="flex items-center gap-1 rounded-control px-1 py-0.5 hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <RefreshCw className="h-3 w-3" aria-hidden="true" />Aktualisieren
            </button>
        </span>
    )
}
