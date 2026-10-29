"use client"

import * as React from "react"

const KEY = "workshop:station"

function read(storage: Storage | null): string | null {
    try { return storage?.getItem(KEY) ?? null } catch { return null }
}

/** The station this device stands at, remembered on the device (W-01). */
export function useStation(storage: Storage | null = typeof localStorage === "undefined" ? null : localStorage): [string | null, (station: string | null) => void] {
    const [station, setStationState] = React.useState(() => read(storage))
    const setStation = React.useCallback((next: string | null) => {
        setStationState(next)
        try {
            if (next) storage?.setItem(KEY, next)
            else storage?.removeItem(KEY)
        } catch { /* keep it in memory */ }
    }, [storage])
    return [station, setStation]
}

/** A Storage kept in memory, e.g. for examples that must not touch the real device storage. */
export function memoryStorage(seed: Record<string, string> = {}): Storage {
    const m = new Map(Object.entries(seed))
    return {
        getItem: (k) => m.get(k) ?? null,
        setItem: (k, v) => { m.set(k, String(v)) },
        removeItem: (k) => { m.delete(k) },
        clear: () => m.clear(),
        key: (i) => [...m.keys()][i] ?? null,
        get length() { return m.size },
    }
}
