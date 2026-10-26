import { matchesIdentifier } from "./identifier"

export type SearchRecord = {
    type: string
    id: string
    title: string
    /** What the record belongs to, e.g. "Auftrag #26100013 DÄHLER + BLASER" */
    context?: string
    href: string
    /** Every identifier as it is printed, plus its common variants */
    identifiers: string[]
    /** Names and other words found by part of the word */
    text?: string[]
}

export type SearchGroup = { type: string; results: SearchRecord[] }
export type SearchResult = { exact: SearchRecord | null; groups: SearchGroup[] }

const RANK = { exact: 0, prefix: 1, text: 2 } as const

/** N-06: exact identifier > identifier prefix > text, grouped by type in `typeOrder`. */
export function searchRecords(
    records: SearchRecord[],
    query: string,
    { typeOrder, limitPerType = 5 }: { typeOrder: string[]; limitPerType?: number }
): SearchResult {
    const q = query.trim()
    if (!q) return { exact: null, groups: [] }
    const lower = q.toLowerCase()

    const ranked: { record: SearchRecord; rank: number }[] = []
    for (const record of records) {
        const [first, ...rest] = record.identifiers
        const match = first ? matchesIdentifier(q, first, rest) : null
        if (match) ranked.push({ record, rank: RANK[match] })
        else if (record.text?.some((t) => t.toLowerCase().includes(lower))) ranked.push({ record, rank: RANK.text })
    }

    const typeIndex = (type: string) => {
        const i = typeOrder.indexOf(type)
        return i < 0 ? typeOrder.length : i
    }
    const exact = ranked
        .filter((r) => r.rank === RANK.exact)
        .sort((a, b) => typeIndex(a.record.type) - typeIndex(b.record.type))[0]?.record ?? null

    const groups: SearchGroup[] = []
    for (const type of [...new Set(ranked.map((r) => r.record.type))].sort((a, b) => typeIndex(a) - typeIndex(b))) {
        const results = ranked
            .filter((r) => r.record.type === type)
            .sort((a, b) => a.rank - b.rank)
            .slice(0, limitPerType)
            .map((r) => r.record)
        groups.push({ type, results })
    }
    return { exact, groups }
}
