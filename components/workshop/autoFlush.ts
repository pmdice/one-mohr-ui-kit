"use client"

import * as React from "react"

/**
 * Sends waiting scans on load, when the browser reports the network back and every 30 s (W-07).
 * `navigator.onLine` alone is unreliable, so the timer is the real retry.
 */
export function useAutoFlush(queue: { flush: () => Promise<void> }, interval = 30_000) {
    React.useEffect(() => {
        const flush = () => { void queue.flush() }
        flush()
        window.addEventListener("online", flush)
        const timer = setInterval(flush, interval)
        return () => {
            window.removeEventListener("online", flush)
            clearInterval(timer)
        }
    }, [queue, interval])
}
