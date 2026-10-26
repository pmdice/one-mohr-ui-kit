import { describe, it, expect } from 'vitest'
import { groupActivity, type ActivityEntry } from './activity'

const MIN = 60_000
const field = (id: string, at: number, actor = 'P. Mohr'): ActivityEntry => ({ id, at, actor, via: 'hand', kind: 'field', field: 'Gewicht', from: '412 g', to: '418 g' })

describe('groupActivity', () => {
    it('puts the newest first and groups field changes of one person within 5 minutes', () => {
        const groups = groupActivity([field('a', 0), field('b', 2 * MIN), field('c', 4 * MIN)])
        expect(groups.map((g) => g.entries.map((e) => e.id))).toEqual([['c', 'b', 'a']])
    })

    it('splits when the gap is 6 minutes', () => {
        const groups = groupActivity([field('a', 0), field('b', 6 * MIN)])
        expect(groups.map((g) => g.entries.map((e) => e.id))).toEqual([['b'], ['a']])
    })

    it('never groups across people, and never groups status changes', () => {
        const status: ActivityEntry = { id: 's', at: 2 * MIN, actor: 'P. Mohr', via: 'hand', kind: 'status', from: 'Offen', to: 'In Arbeit' }
        const status2: ActivityEntry = { ...status, id: 't', at: 3 * MIN }
        const groups = groupActivity([field('a', 0), field('b', MIN, 'M. Keller'), status, status2])
        expect(groups.map((g) => g.entries.map((e) => e.id))).toEqual([['t'], ['s'], ['b'], ['a']])
    })
})
