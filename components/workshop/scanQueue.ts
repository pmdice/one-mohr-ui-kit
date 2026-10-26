export type QueuedScan = { id: string; code: string; station: string; at: number; error?: string }
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

    async function run() {
        for (const scan of [...items]) {
            if (scan.error) continue
            let result: SendResult
            try {
                result = await send(scan)
            } catch {
                return
            }
            set(result.ok ? items.filter((s) => s.id !== scan.id) : items.map((s) => (s.id === scan.id ? { ...s, error: result.reason } : s)))
        }
    }

    return {
        items: () => items,
        add(scan: Omit<QueuedScan, "id" | "error">): QueuedScan {
            const entry = { ...scan, id: `${scan.at}-${Math.random().toString(36).slice(2, 8)}` }
            set([...items, entry])
            return entry
        },
        remove(id: string): boolean {
            if (!items.some((s) => s.id === id)) return false
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
