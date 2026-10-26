import { describe, it, expect } from 'vitest'
import { allowedTransitions, deriveStatus, statusOf, type Workflow } from './workflow'

type Ctx = { atStation: boolean }
const WF: Workflow<Ctx> = {
    statuses: [
        { id: 'offen', label: 'Offen', category: 'planned' },
        { id: 'in-arbeit', label: 'In Arbeit', category: 'active' },
        { id: 'fertig', label: 'Fertig', category: 'done' },
        { id: 'storniert', label: 'Storniert', category: 'canceled' },
    ],
    transitions: [
        { from: 'offen', to: 'storniert', verb: 'Stornieren', confirm: true },
        { from: 'in-arbeit', to: 'fertig', verb: 'Fertig melden', primary: true, when: (c) => (c.atStation ? 'Fertig melden geht erst nach dem Ausscannen' : null) },
        { from: 'in-arbeit', to: 'storniert', verb: 'Stornieren', confirm: true },
    ],
}

describe('workflow', () => {
    it('finds a status by id', () => {
        expect(statusOf(WF, 'fertig')).toEqual({ id: 'fertig', label: 'Fertig', category: 'done' })
    })

    it('offers only the transitions that start at the current status', () => {
        expect(allowedTransitions(WF, 'offen', { atStation: false }).map((a) => a.transition.to)).toEqual(['storniert'])
        expect(allowedTransitions(WF, 'fertig', { atStation: false })).toEqual([])
    })

    it('says why an allowed transition is blocked right now', () => {
        const [fertig, storno] = allowedTransitions(WF, 'in-arbeit', { atStation: true })
        expect(fertig.blocked).toBe('Fertig melden geht erst nach dem Ausscannen')
        expect(storno.blocked).toBeNull()
        expect(allowedTransitions(WF, 'in-arbeit', { atStation: false })[0].blocked).toBeNull()
    })

    it('derives a parent status from its parts, with progress', () => {
        expect(deriveStatus(['planned', 'planned'])).toEqual({ category: 'planned', done: 0, total: 2 })
        expect(deriveStatus(['canceled', 'canceled'])).toEqual({ category: 'canceled', done: 2, total: 2 })
        expect(deriveStatus(['done', 'canceled', 'done'])).toEqual({ category: 'done', done: 3, total: 3 })
        expect(deriveStatus(['done', 'planned', 'active', 'waiting'])).toEqual({ category: 'active', done: 1, total: 4 })
        expect(deriveStatus(['planned', 'canceled'])).toEqual({ category: 'active', done: 1, total: 2 })
    })
})
