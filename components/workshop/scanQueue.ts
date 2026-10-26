export type QueuedScan = {
    id: string
    code: string
    station: string
    at: number
    /** Id of an earlier, already sent scan this one takes back (W-06). */
    revokes?: string
    error?: string
}
export type SendResult = { ok: true } | { ok: false; reason: string }

/**
 * Scans that could not be sent yet (W-07). Each one is stored on the device at once, sent in order with
 * its original time and station, and only removed when the server took it. A rejected scan stays with its
 * reason; a network error stops the run and leaves the rest for the next one.
 */
export function createScanQueue({ storage = globalThis.localStorage ?? null, key = "workshop:queue", send }: {
    storage?: Storage | null
    key?: string
    send: (scan: QueuedScan) => Promise<SendResult>
}) {
    let items: QueuedScan[] = load()
    let running: Promise<void> | null = null
    let inFlight: string | null = null
    const listeners = new Set<() => void>()

    function load(): QueuedScan[] {
        try {
            const raw = storage?.getItem(key)
            return raw ? (JSON.parse(raw) as QueuedScan[]) : []
        } catch {
            return []
        }
    }

    function set(next: QueuedScan[]) {
        items = next
        try { storage?.setItem(key, JSON.stringify(items)) } catch { /* device storage unavailable: keep in memory */ }
        listeners.forEach((fn) => fn())
    }

    // Reads the list afresh for every scan: one added meanwhile is sent in this run, one removed is not
    async function run() {
        for (;;) {
            const scan = items.find((s) => !s.error)
            if (!scan) return
            let result: SendResult
            inFlight = scan.id
            try {
                result = await send(scan)
            } catch {
                return
            } finally {
                inFlight = null
            }
            set(result.ok ? items.filter((s) => s.id !== scan.id) : items.map((s) => (s.id === scan.id ? { ...s, error: result.reason } : s)))
        }
    }

    return {
        items: () => items,
        add(scan: Omit<QueuedScan, "id" | "error">): QueuedScan {
            // Unique per device, so the server can ignore a scan it already has (idempotent)
            const entry = { ...scan, id: `${scan.at}-${Math.random().toString(36).slice(2, 8)}` }
            set([...items, entry])
            return entry
        },
        /** Takes a waiting scan out; false if it is unknown or already on its way. */
        remove(id: string): boolean {
            if (id === inFlight || !items.some((s) => s.id === id)) return false
            set(items.filter((s) => s.id !== id))
            return true
        },
        /** Sends what is waiting; a run already going is joined, not started twice. */
        flush(): Promise<void> {
            running ??= run().finally(() => { running = null })
            return running
        },
        subscribe(fn: () => void): () => void {
            listeners.add(fn)
            return () => { listeners.delete(fn) }
        },
    }
}

export type ScanQueue = ReturnType<typeof createScanQueue>
