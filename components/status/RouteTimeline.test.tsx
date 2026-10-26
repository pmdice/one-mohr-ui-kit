import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RouteTimeline, type Visit } from './RouteTimeline'

const H = 3_600_000
const now = new Date(2026, 9, 26, 14, 0).getTime()
const VISITS: Visit[] = [
    { station: '3d', label: '3D', in: now - 30 * H, out: now - 26 * H, norm: 6 * H },
    { station: 'guss', label: 'Guss', in: now - 24 * H, out: now - 22 * H, norm: 4 * H },
    { station: 'polissage', label: 'Polissage', in: now - 20 * H, out: now - 12 * H, norm: 8 * H },
    { station: 'guss', label: 'Guss', in: now - 5 * H, out: null, norm: 4 * H },
]

describe('RouteTimeline', () => {
    it('lists every visit in order and counts repeated stations', () => {
        render(<RouteTimeline visits={VISITS} now={now} />)
        const items = within(screen.getByRole('list', { name: 'Durchlauf' })).getAllByRole('listitem')
        expect(items.map((i) => i.querySelector('[data-station]')!.textContent)).toEqual(['3D', 'Guss', 'Polissage', 'Guss'])
        expect(items[3]).toHaveTextContent('2. Durchlauf')
        expect(items[1]).not.toHaveTextContent('Durchlauf')
        expect(items[0]).toHaveTextContent('Dauer 4 h')
    })

    it('marks the current visit with its running time and an exceeded usual time', () => {
        render(<RouteTimeline visits={VISITS} now={now} />)
        const current = screen.getByText('jetzt hier').closest('li')!
        expect(current).toHaveAttribute('aria-current', 'step')
        expect(current).toHaveTextContent('Dauer 5 h')
        expect(current).toHaveTextContent('Länger als üblich (Richtzeit 4 h)')
        expect(screen.getAllByText(/Länger als üblich/)).toHaveLength(1)
    })

    it('says when the slip was never scanned', () => {
        render(<RouteTimeline visits={[]} now={now} />)
        expect(screen.getByText('Noch nicht eingescannt')).toBeInTheDocument()
    })
})
