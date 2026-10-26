import { describe, it, expect } from 'vitest'
import { searchRecords, type SearchRecord } from './search'

const order: SearchRecord = {
    type: 'order', id: 'o-26100013', title: '#26100013 DÄHLER + BLASER', href: '/auftraege/26100013',
    identifiers: ['26100013'], text: ['DÄHLER + BLASER'],
}
const slips: SearchRecord[] = [1, 2, 3, 4].map((n) => ({
    type: 'slip', id: `s-${n}`, title: `Laufzettel ${n}/4 INOX`, context: 'Auftrag #26100013 DÄHLER + BLASER',
    href: `/auftraege/26100013/laufzettel/${n}`, identifiers: [`26100013 – ${n}/4`, `26100013-${n}`],
}))
const other: SearchRecord = { type: 'order', id: 'o-26100014', title: '#26100014 MEIER', href: '/auftraege/26100014', identifiers: ['26100014'], text: ['MEIER'] }
const records = [...slips, other, order]
const opts = { typeOrder: ['order', 'slip'] }

describe('searchRecords', () => {
    it('puts the exact order first and its slips after it', () => {
        const { exact, groups } = searchRecords(records, '26100013', opts)
        expect(exact?.id).toBe('o-26100013')
        expect(groups.map((g) => g.type)).toEqual(['order', 'slip'])
        expect(groups[0].results[0].id).toBe('o-26100013')
        expect(groups[1].results).toHaveLength(4)
    })

    it.each(['26100013-2', '26100013 – 2/4', '26100013 2/4'])('finds slip 2/4 from "%s"', (q) => {
        expect(searchRecords(records, q, opts).exact?.id).toBe('s-2')
    })

    it('finds names by part of the word, without an exact hit', () => {
        const { exact, groups } = searchRecords(records, 'dähler', opts)
        expect(exact).toBeNull()
        expect(groups[0].results.map((r) => r.id)).toContain('o-26100013')
    })

    it('returns nothing for an empty query', () => {
        expect(searchRecords(records, '  ', opts)).toEqual({ exact: null, groups: [] })
    })
})
