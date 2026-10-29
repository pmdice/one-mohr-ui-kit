"use client"

import * as React from "react"
import { explainError, type Explained } from "./explainError"

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "failed"

/**
 * The saving state of a form or record (R-01, R-05): one save at a time, a failure explained (R-07),
 * retry with the value that failed.
 */
export function useSave<T>(save: (value: T) => Promise<void>, { now = Date.now }: { now?: () => number } = {}) {
    const [state, setState] = React.useState<SaveState>("idle")
    const [savedAt, setSavedAt] = React.useState<number | undefined>()
    const [error, setError] = React.useState<Explained | undefined>()
    const busy = React.useRef(false)
    const last = React.useRef<{ value: T } | null>(null)
    /** What the server has: the same value again is not sent (a quick second click after a fast save). */
    const saved = React.useRef<string | null>(null)
    const saveRef = React.useRef(save)
    React.useEffect(() => { saveRef.current = save })

    const run = React.useCallback(async (value: T) => {
        if (busy.current) return
        if (saved.current !== null && saved.current === JSON.stringify(value)) { setState("saved"); return }
        busy.current = true
        last.current = { value }
        setState("saving")
        setError(undefined)
        try {
            await saveRef.current(value)
            saved.current = JSON.stringify(value)
            setSavedAt(now())
            setState("saved")
        } catch (e) {
            setError(explainError(e))
            setState("failed")
        } finally {
            busy.current = false
        }
    }, [now])

    const retry = React.useCallback(async () => { if (last.current) await run(last.current.value) }, [run])
    const markDirty = React.useCallback(() => setState((s) => (s === "saving" ? s : "dirty")), [])

    return { state, savedAt, error, run, retry, markDirty }
}
