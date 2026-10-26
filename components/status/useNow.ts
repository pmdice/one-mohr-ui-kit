"use client"

import * as React from "react"

/** The current time, refreshed every 30 s, for components that are not given a fixed "now". */
export function useNow(given?: number): number {
    const [now, setNow] = React.useState(() => given ?? Date.now())
    React.useEffect(() => {
        if (given !== undefined) return
        const timer = setInterval(() => setNow(Date.now()), 30_000)
        return () => clearInterval(timer)
    }, [given])
    return given ?? now
}
