import { describe, it, expect } from 'vitest'
import { NOW, applyEvent, seedWorld, activityOf } from './slip'

const at = NOW + 1000

describe('slip events', () => {
    it('undo reverts only the status, later field changes stay', () => {
        let w = seedWorld()
        const before = w.slips.find((s) => s.id === '26100013-4')!
        w = applyEvent(w, { type: 'transition', slip: '26100013-4', to: 'in-arbeit', actor: 'P. Mohr', at })
        w = applyEvent(w, { type: 'field', slip: '26100013-4', field: 'weight', label: 'Gewicht (g)', value: 250, actor: 'P. Mohr', at })
        w = applyEvent(w, { type: 'undo', slip: '26100013-4', previous: before, actor: 'P. Mohr', at })
        const slip = w.slips.find((s) => s.id === '26100013-4')!
        expect(slip.status).toBe('zurueckgestellt')
        expect(slip.weight).toBe(250)
    })

    it('undo keeps the place the slip has been scanned to since', () => {
        let w = seedWorld()
        const before = w.slips.find((s) => s.id === '26100013-4')!
        w = applyEvent(w, { type: 'transition', slip: '26100013-4', to: 'in-arbeit', actor: 'P. Mohr', at })
        w = applyEvent(w, { type: 'scan', slip: '26100013-4', station: 'guss', device: 'Tablet Guss', actor: 'P. Mohr', at })
        w = applyEvent(w, { type: 'undo', slip: '26100013-4', previous: before, actor: 'P. Mohr', at })
        expect(w.slips.find((s) => s.id === '26100013-4')!.station).toBe('guss')
    })

    it('canceling a slip at a station takes it out of the station, with an entry', () => {
        let w = seedWorld()
        w = applyEvent(w, { type: 'transition', slip: '26100013-1', to: 'storniert', reason: 'Kunde hat abgesagt', actor: 'P. Mohr', at })
        const slip = w.slips.find((s) => s.id === '26100013-1')!
        expect(slip.station).toBeNull()
        expect(slip.lastStation).toBe('guss')
        expect(slip.visits.at(-1)!.out).toBe(at)
        expect(activityOf(w, slip.id).map((e) => e.text).filter(Boolean)).toContain('hat ausgescannt aus Guss')
    })

    it('scanning in at the next station writes the implicit check-out too', () => {
        let w = seedWorld()
        w = applyEvent(w, { type: 'scan', slip: '26100013-1', station: 'polissage', device: 'Tablet Polissage', actor: 'P. Mohr', at })
        const texts = activityOf(w, '26100013-1').slice(-2).map((e) => e.text)
        expect(texts).toEqual(['hat ausgescannt aus Guss', 'hat eingescannt in Polissage'])
    })

    it('status entries carry the statuses, so the history can show badges', () => {
        let w = seedWorld()
        w = applyEvent(w, { type: 'transition', slip: '26100013-4', to: 'in-arbeit', actor: 'P. Mohr', at })
        const e = activityOf(w, '26100013-4').at(-1)!
        expect(e.statusFrom?.label).toBe('Zurückgestellt')
        expect(e.statusTo?.category).toBe('active')
    })
})
