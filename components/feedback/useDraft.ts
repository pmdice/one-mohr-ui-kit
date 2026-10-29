"use client"

import * as React from "react"

function safeStorage(): Storage | null {
    try { return typeof window === "undefined" ? null : window.localStorage } catch { return null }
}

/**
 * Keeps unsaved input in the browser, so a reload or an expired session loses nothing (R-09).
 * `restored` is the draft found when the page opened; `clear` after a successful save.
 */
export function useDraft<T>(key: string, value: T, storage: Storage | null = safeStorage()) {
    const [restored] = React.useState<T | null>(() => {
        try {
            const raw = storage?.getItem(`draft:${key}`)
            return raw ? (JSON.parse(raw) as T) : null
        } catch { return null }
    })
    const first = React.useRef(true)
    const serialized = JSON.stringify(value)
    React.useEffect(() => {
        // The value on opening is not a draft yet; only what changes after that is
        if (first.current) { first.current = false; return }
        try { storage?.setItem(`draft:${key}`, serialized) } catch { /* full or blocked: the draft is a convenience */ }
    }, [key, serialized, storage])
    const clear = React.useCallback(() => { try { storage?.removeItem(`draft:${key}`) } catch { /* see above */ } }, [key, storage])
    return { restored, clear }
}
