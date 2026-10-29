import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { HomeExample } from './examples/HomeExample'
import { WorkQueue } from './WorkQueue'
import { StatTile } from './StatTile'
import { querySlips, type SlipQuery } from '@/components/table/examples/slips'

/** The list's own reading of a link: field=value pairs, values separated by commas, sort=field. */
function queryOf(href: string): SlipQuery {
    const params = new URLSearchParams(href.split('?')[1])
    const filters = [...params.entries()].filter(([k]) => k !== 'sort').flatMap(([field, v]) => v.split(',').map((value) => ({ field, value })))
    const sort = params.get('sort')
    return { filters, q: '', sort: sort ? { id: sort, dir: 'asc' } : null, page: 1, pageSize: 1000 }
}

describe('review fixes: home', () => {
    it.each(['Büro', 'Werkstatt', 'Teamleitung'])('%s: every tile shows the number of the list its link opens', async (role) => {
        render(<HomeExample />)
        await userEvent.click(screen.getByRole('radio', { name: role }))
        for (const tile of screen.getAllByRole('link').filter((l) => l.getAttribute('href')?.startsWith('#laufzettel?') && /^\d/.test(l.textContent ?? ''))) {
            const n = Number(tile.textContent!.match(/^\d+/)![0])
            expect(querySlips(queryOf(tile.getAttribute('href')!)).filteredTotal, tile.textContent!).toBe(n)
        }
    })

    it.each(['Büro', 'Werkstatt', 'Teamleitung'])('%s: the queue shows the first rows of the list behind "Alle", in its order', async (role) => {
        render(<HomeExample />)
        await userEvent.click(screen.getByRole('radio', { name: role }))
        const all = screen.getByRole('link', { name: /^Alle \d+ anzeigen$/ })
        const list = querySlips(queryOf(all.getAttribute('href')!)).rows
        const shown = within(all.closest('section')!).getAllByRole('listitem').map((li) => li.querySelector('a')!.getAttribute('href'))
        expect(shown).toEqual(list.slice(0, shown.length).map((s) => `#laufzettel-${s.id}`))
        expect(shown).toHaveLength(5)
    })

    it('a queue that could not load says so and offers to retry, never an all-clear', async () => {
        const onRetry = vi.fn()
        render(<WorkQueue title="An Guss" items={[]} empty={{ text: 'Nichts zu tun.' }} error={{ text: 'Vorrat nicht geladen. Keine Verbindung.', onRetry }} />)
        expect(screen.getByRole('alert')).toHaveTextContent('Vorrat nicht geladen. Keine Verbindung.')
        expect(screen.queryByText('Nichts zu tun.')).toBeNull()
        await userEvent.click(screen.getByRole('button', { name: 'Erneut versuchen' }))
        expect(onRetry).toHaveBeenCalled()
    })

    it('a tile is named by number and label only, and zero carries no warning colour', () => {
        render(<StatTile label="überfällig" value={0} href="#x" detail="Laufzettel" tone="warning" />)
        const link = screen.getByRole('link')
        expect(link).toHaveAccessibleName('0 überfällig Laufzettel')
        expect(link.innerHTML).not.toMatch(/text-warning/)
    })
})
