import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { StatTile } from './StatTile'
import { WorkQueue } from './WorkQueue'
import { RecentList } from './RecentList'
import { DataFreshness } from './DataFreshness'

describe('StatTile', () => {
    it('is a link into the filtered list, named by number and label', () => {
        render(<StatTile label="überfällig" value={3} href="/laufzettel?status=ueberfaellig" detail="Laufzettel" tone="warning" />)
        const link = screen.getByRole('link', { name: /^3 überfällig/ })
        expect(link).toHaveAttribute('href', '/laufzettel?status=ueberfaellig')
    })
})

describe('WorkQueue', () => {
    const items = [
        { id: 'a', title: '26100013 – 1/4', meta: 'Dähler + Blaser', href: '#a', reason: 'seit 2 Tagen überfällig', tone: 'warning' as const },
        { id: 'b', title: '26100021 – 1/1', meta: 'Bucherer', href: '#b', reason: 'heute fällig' },
    ]

    it('shows each line with its reason and the count in the title', () => {
        render(<WorkQueue title="Meine Laufzettel" items={items} total={7} moreHref="#alle" empty={{ text: 'Nichts zu tun.' }} />)
        expect(screen.getByRole('heading', { name: 'Meine Laufzettel 7' })).toBeInTheDocument()
        const rows = screen.getAllByRole('listitem')
        expect(rows[0]).toHaveTextContent('seit 2 Tagen überfällig')
        expect(within(rows[0]).getByRole('link', { name: /26100013 – 1\/4/ })).toHaveAttribute('href', '#a')
        expect(screen.getByRole('link', { name: 'Alle 7 anzeigen' })).toHaveAttribute('href', '#alle')
    })

    it('empty says there is nothing to do and what comes next, without cheering', () => {
        render(<WorkQueue title="Meine Laufzettel" items={[]} empty={{ text: 'Nichts überfällig und nichts heute fällig.', next: 'Nächster Termin: Fr, 13.11.2026' }} />)
        expect(screen.getByText('Nichts überfällig und nichts heute fällig.')).toBeInTheDocument()
        expect(screen.getByText('Nächster Termin: Fr, 13.11.2026')).toBeInTheDocument()
        expect(document.body.textContent).not.toMatch(/!|Super|Glückwunsch/)
    })
})

describe('RecentList', () => {
    it('lists the last records with kind and label as links', () => {
        render(<RecentList items={[{ id: '1', kind: 'Auftrag', label: '26100013 · Ringe Herbst 2026', href: '#1' }]} />)
        expect(screen.getByRole('link', { name: /Auftrag.*26100013/ })).toHaveAttribute('href', '#1')
    })
})

describe('DataFreshness', () => {
    it('says from when and refreshes on request', async () => {
        const onRefresh = vi.fn()
        render(<DataFreshness at={new Date(2026, 9, 29, 10, 30).getTime()} now={new Date(2026, 9, 29, 10, 35).getTime()} onRefresh={onRefresh} />)
        expect(screen.getByText(/Stand 10:30/)).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Aktualisieren' }))
        expect(onRefresh).toHaveBeenCalledTimes(1)
    })

    it('refreshes once when the page becomes visible again, not when it is hidden', () => {
        const onRefresh = vi.fn()
        render(<DataFreshness at={0} now={0} onRefresh={onRefresh} />)
        const set = (v: string) => Object.defineProperty(document, 'visibilityState', { value: v, configurable: true })
        act(() => { set('hidden'); document.dispatchEvent(new Event('visibilitychange')) })
        expect(onRefresh).not.toHaveBeenCalled()
        act(() => { set('visible'); document.dispatchEvent(new Event('visibilitychange')) })
        expect(onRefresh).toHaveBeenCalledTimes(1)
    })
})
