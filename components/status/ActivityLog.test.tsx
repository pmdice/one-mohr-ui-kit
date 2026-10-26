import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ActivityLog } from './ActivityLog'
import type { ActivityEntry } from './activity'

const MIN = 60_000
const now = new Date(2026, 9, 26, 14, 0).getTime()
const ENTRIES: ActivityEntry[] = [
    { id: '1', at: now - 120 * MIN, actor: 'M. Keller', via: 'scan', device: 'Tablet Guss', kind: 'location', text: 'hat eingescannt in Guss' },
    { id: '2', at: now - 100 * MIN, actor: 'P. Mohr', via: 'hand', kind: 'status', from: 'Offen', to: 'In Arbeit' },
    { id: '3', at: now - 12 * MIN, actor: 'P. Mohr', via: 'hand', kind: 'field', field: 'Gewicht', from: '412 g', to: '418 g' },
    { id: '4', at: now - 10 * MIN, actor: 'P. Mohr', via: 'hand', kind: 'field', field: 'Stück', from: '3', to: '4' },
    { id: '5', at: now - 9 * MIN, actor: 'P. Mohr', via: 'hand', kind: 'field', field: 'Material', from: 'INOX', to: 'Bronze' },
]

const items = () => within(screen.getByRole('list', { name: 'Verlauf' })).getAllByRole('listitem').filter((li) => li.parentElement?.getAttribute('aria-label') === 'Verlauf')

describe('ActivityLog', () => {
    it('writes entries as sentences with relative time and exact time as title', () => {
        render(<ActivityLog entries={ENTRIES.slice(0, 3)} now={now} />)
        const [field, status, scan] = items()
        expect(field).toHaveTextContent('P. Mohr hat Gewicht von 412 g auf 418 g geändert')
        expect(within(field).getByText('vor 12 min')).toHaveAttribute('title', '26.10.2026 13:48')
        expect(status).toHaveTextContent('P. Mohr hat Status von Offen auf In Arbeit gesetzt')
        expect(scan).toHaveTextContent('M. Keller hat eingescannt in Guss · per Scan (Tablet Guss)')
    })

    it('folds a series of field changes into one line that opens', async () => {
        render(<ActivityLog entries={ENTRIES} now={now} />)
        expect(items()).toHaveLength(3)
        const toggle = screen.getByRole('button', { name: 'P. Mohr hat 3 Felder geändert' })
        expect(toggle).toHaveAttribute('aria-expanded', 'false')
        expect(screen.getByRole('list', { name: 'Verlauf' })).not.toHaveTextContent('Material von INOX')
        await userEvent.click(toggle)
        expect(toggle).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByRole('list', { name: 'Verlauf' })).toHaveTextContent('P. Mohr hat Material von INOX auf Bronze geändert')
    })

    it('filters by kind and links each filter', () => {
        render(<ActivityLog entries={ENTRIES} now={now} filter="status" filterHref={(f) => `?verlauf=${f}`} />)
        expect(items()).toHaveLength(2)
        const group = screen.getByRole('group', { name: 'Verlauf filtern' })
        expect(within(group).getByRole('link', { name: 'Felder' })).toHaveAttribute('href', '?verlauf=fields')
        expect(within(group).getByRole('link', { name: 'Status & Ort' })).toHaveAttribute('aria-current', 'true')
    })

    it('shows a short form with a link to the whole history', () => {
        render(<ActivityLog entries={[...ENTRIES, { ...ENTRIES[0], id: '6', at: now - 300 * MIN }]} now={now} limit={3} moreHref="?tab=verlauf" />)
        expect(items()).toHaveLength(3)
        expect(screen.getByRole('link', { name: 'Ganzer Verlauf' })).toHaveAttribute('href', '?tab=verlauf')
    })

    it('shows status changes as badges', () => {
        const offen = { id: 'offen', label: 'Offen', category: 'planned' as const }
        const aktiv = { id: 'in-arbeit', label: 'In Arbeit', category: 'active' as const }
        render(<ActivityLog entries={[{ ...ENTRIES[1], from: undefined, to: undefined, statusFrom: offen, statusTo: aktiv }]} now={now} />)
        expect(items()[0]).toHaveTextContent('P. Mohr hat Status von Offen auf In Arbeit gesetzt')
        expect(items()[0].querySelector('[data-category="active"]')).not.toBeNull()
    })

    it('adds the reason of a change', () => {
        render(<ActivityLog entries={[{ ...ENTRIES[1], note: 'Kunde hat abgesagt' }]} now={now} />)
        expect(items()[0]).toHaveTextContent('P. Mohr hat Status von Offen auf In Arbeit gesetzt – Kunde hat abgesagt')
    })

    it('says when there is nothing yet', () => {
        render(<ActivityLog entries={[]} now={now} />)
        expect(screen.getByText('Noch keine Einträge')).toBeInTheDocument()
    })
})
