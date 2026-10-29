"use client"

import * as React from "react"
import { explainError, type Explained } from "./explainError"

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "failed"

/**
 * The saving state of a form or record (R-01, R-05): one save at a time; a newer value given meanwhile is sent
 * right after; typing during a save ends in "dirty"; a failure is explained (R-07); retry sends the value
 * that failed. The same value as the server already has is not sent again.
 */
export function useSave<T>(save: (value: T) => Promise<void>, { now = Date.now, key = (v: T) => JSON.stringify(v) }: {
    now?: () => number
    /** What makes two values "the same content"; leave out version fields so a bump does not look like a change. */
    key?: (value: T) => string
} = {}) {
    const [state, setState] = React.useState<SaveState>("idle")
    const [savedAt, setSavedAt] = React.useState<number | undefined>()
    const [error, setError] = React.useState<Explained | undefined>()
    const busy = React.useRef(false)
    const last = React.useRef<{ value: T } | null>(null)
    /** What the server holds as far as we know; cleared when that is unsure. */
    const saved = React.useRef<string | null>(null)
    /** A newer value given while saving: sent after the current one. */
    const queued = React.useRef<{ value: T } | null>(null)
    /** Changes made while saving that are not part of what is being sent. */
    const dirtyMeanwhile = React.useRef(false)
    const saveRef = React.useRef(save)
    const keyRef = React.useRef(key)
    React.useEffect(() => { saveRef.current = save; keyRef.current = key })

    const run = React.useCallback(async (value: T): Promise<void> => {
        if (busy.current) {
            if (!last.current || keyRef.current(value) !== keyRef.current(last.current.value)) queued.current = { value }
            return
        }
        if (saved.current !== null && saved.current === keyRef.current(value)) { setState("saved"); return }
        busy.current = true
        last.current = { value }
        dirtyMeanwhile.current = false
        setState("saving")
        setError(undefined)
        try {
            await saveRef.current(value)
            saved.current = keyRef.current(value)
            setSavedAt(now())
            setState(dirtyMeanwhile.current ? "dirty" : "saved")
        } catch (e) {
            saved.current = null
            setError(explainError(e))
            setState("failed")
            queued.current = null
        } finally {
            busy.current = false
        }
        const next = queued.current
        queued.current = null
        if (next) await run(next.value)
    }, [now])

    const retry = React.useCallback(async () => { if (last.current) await run(last.current.value) }, [run])
    const markDirty = React.useCallback(() => {
        if (busy.current) { dirtyMeanwhile.current = true; return }
        setState("dirty")
    }, [])
    /** The server holds `value` now (e.g. after taking the other person's version in a conflict). */
    const reset = React.useCallback((value: T) => {
        saved.current = keyRef.current(value)
        last.current = { value }
        setError(undefined)
        setState("idle")
    }, [])

    return { state, savedAt, error, run, retry, markDirty, reset }
}
