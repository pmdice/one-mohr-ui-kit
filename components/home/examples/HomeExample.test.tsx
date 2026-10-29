import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { HomeExample, dueOf, TODAY } from './HomeExample'
import { SLIPS } from '@/components/table/examples/slips'

const as = (role: string) => userEvent.click(screen.getByRole('radio', { name: role }))

describe('Beispiel: Startseite', () => {
    it('Werkstatt: the number of a tile is the number of the list behind it', async () => {
        render(<HomeExample />)
        await as('Werkstatt')
        const overdue = SLIPS.filter((s) => s.station === 'guss' && dueOf(s) < TODAY).length
        const tile = screen.getByRole('link', { name: new RegExp(`^${overdue} überfällig`) })
        expect(tile.getAttribute('href')).toContain('station=guss')
        expect(tile.getAttribute('href')).toContain('frist=ueberfaellig')
    })

    it('the queue starts with what is overdue, each with its reason', async () => {
        render(<HomeExample />)
        await as('Werkstatt')
        const queue = screen.getByRole('region', { name: /An Guss/ })
        const reasons = within(queue).getAllByRole('listitem').map((li) => li.textContent ?? '')
        const firstLater = reasons.findIndex((r) => /in \d+ Tagen|morgen/.test(r))
        const lastOverdue = reasons.map((r) => /überfällig/.test(r)).lastIndexOf(true)
        if (firstLater !== -1 && lastOverdue !== -1) expect(lastOverdue).toBeLessThan(firstLater)
        expect(reasons[0]).toMatch(/überfällig|heute/)
    })

    it('each role sees its own start page with the same parts', async () => {
        render(<HomeExample />)
        await as('Büro')
        expect(screen.getByRole('heading', { name: /Zu planen/ })).toBeInTheDocument()
        await as('Teamleitung')
        expect(screen.getByRole('heading', { name: /Hängt fest/ })).toBeInTheDocument()
        expect(screen.getByRole('region', { name: 'Zuletzt geöffnet' })).toBeInTheDocument()
        expect(screen.getByText(/Stand/)).toBeInTheDocument()
    })
})
