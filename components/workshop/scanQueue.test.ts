import { describe, it, expect, vi } from 'vitest'
import { createScanQueue, type QueuedScan } from './scanQueue'

function memoryStorage(): Storage {
    const m = new Map<string, string>()
    return {
        getItem: (k) => m.get(k) ?? null,
        setItem: (k, v) => { m.set(k, v) },
        removeItem: (k) => { m.delete(k) },
        clear: () => m.clear(),
        key: (i) => [...m.keys()][i] ?? null,
        get length() { return m.size },
    }
}

const ok = async () => ({ ok: true as const })

describe('scan queue', () => {
    it('sends in order with the original time and empties itself', async () => {
        const sent: QueuedScan[] = []
        const q = createScanQueue({ storage: memoryStorage(), send: async (s) => { sent.push(s); return { ok: true } } })
        q.add({ code: 'A', station: 'guss', at: 1 })
        q.add({ code: 'B', station: 'guss', at: 2 })
        await q.flush()
        expect(sent.map((s) => [s.code, s.at])).toEqual([['A', 1], ['B', 2]])
        expect(q.items()).toEqual([])
    })

    it('keeps a rejected scan with its reason and goes on with the next', async () => {
        const q = createScanQueue({ storage: memoryStorage(), send: async (s) => (s.code === 'A' ? { ok: false, reason: '26100013 – 2/4 ist fertig' } : { ok: true }) })
        q.add({ code: 'A', station: 'guss', at: 1 })
        q.add({ code: 'B', station: 'guss', at: 2 })
        await q.flush()
        expect(q.items()).toMatchObject([{ code: 'A', error: '26100013 – 2/4 ist fertig' }])
        const send = vi.fn(ok)
        const again = createScanQueue({ storage: memoryStorage(), send })
        again.add({ code: 'X', station: 'guss', at: 1 })
        await again.flush()
        expect(send).toHaveBeenCalledTimes(1)
    })

    it('a network error stops the run, and the next run sends each scan exactly once', async () => {
        const sent: string[] = []
        let online = false
        const q = createScanQueue({ storage: memoryStorage(), send: async (s) => { if (!online) throw new Error('offline'); sent.push(s.code); return { ok: true } } })
        q.add({ code: 'A', station: 'guss', at: 1 })
        q.add({ code: 'B', station: 'guss', at: 2 })
        await q.flush()
        expect(q.items()).toHaveLength(2)
        online = true
        await Promise.all([q.flush(), q.flush()])
        expect(sent).toEqual(['A', 'B'])
    })

    it('survives a reload through the storage', async () => {
        const storage = memoryStorage()
        createScanQueue({ storage, send: ok }).add({ code: 'A', station: 'polissage', at: 5 })
        const reloaded = createScanQueue({ storage, send: ok })
        expect(reloaded.items()).toMatchObject([{ code: 'A', station: 'polissage', at: 5 }])
    })

    it('removes a waiting scan and tells subscribers', () => {
        const q = createScanQueue({ storage: memoryStorage(), send: ok })
        const fn = vi.fn()
        q.subscribe(fn)
        const s = q.add({ code: 'A', station: 'guss', at: 1 })
        expect(q.remove(s.id)).toBe(true)
        expect(q.remove('nope')).toBe(false)
        expect(q.items()).toEqual([])
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it('works without storage when it throws', () => {
        const broken = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } } as unknown as Storage
        const q = createScanQueue({ storage: broken, send: ok })
        q.add({ code: 'A', station: 'guss', at: 1 })
        expect(q.items()).toHaveLength(1)
    })
})
