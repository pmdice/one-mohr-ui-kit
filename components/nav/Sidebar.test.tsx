import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ClipboardList, FileText, Settings, Users } from 'lucide-react'
import { Sidebar, type NavGroup } from './Sidebar'

const groups: NavGroup[] = [
    {
        id: 'work', label: 'Arbeit', entries: [
            { id: 'orders', label: 'Aufträge', href: '/auftraege', icon: ClipboardList, children: [
                { id: 'orders-mine', label: 'Von mir erstellt', href: '/auftraege?view=mine', icon: ClipboardList },
            ] },
            { id: 'slips', label: 'Laufzettel', href: '/laufzettel', icon: FileText },
        ],
    },
    {
        id: 'admin', label: 'Verwaltung', collapsible: true, entries: [
            { id: 'users', label: 'Benutzer', href: '/verwaltung/benutzer', icon: Users },
            { id: 'settings', label: 'Einstellungen', href: '/verwaltung/einstellungen', icon: Settings },
        ],
    },
]

describe('Sidebar', () => {
    it('marks exactly the active entry', () => {
        render(<Sidebar groups={groups} activeId="slips" />)
        const nav = screen.getByRole('navigation', { name: 'Hauptmenü' })
        const current = within(nav).getAllByRole('link').filter((l) => l.getAttribute('aria-current') === 'page')
        expect(current.map((l) => l.textContent)).toEqual(['Laufzettel'])
    })

    it('nests a view under its list', () => {
        render(<Sidebar groups={groups} activeId="orders" />)
        const parent = screen.getByRole('link', { name: 'Aufträge' }).closest('li')!
        expect(within(parent).getByRole('link', { name: 'Von mir erstellt' })).toBeInTheDocument()
    })

    it('keeps the admin group closed unless the active entry is in it', async () => {
        const { rerender } = render(<Sidebar groups={groups} activeId="orders" />)
        const toggle = screen.getByRole('button', { name: 'Verwaltung' })
        expect(toggle).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByRole('link', { name: 'Benutzer' })).toBeNull()
        await userEvent.click(toggle)
        expect(screen.getByRole('link', { name: 'Benutzer' })).toBeInTheDocument()
        rerender(<Sidebar groups={groups} activeId="users" key="other" />)
        expect(screen.getByRole('button', { name: 'Verwaltung' })).toHaveAttribute('aria-expanded', 'true')
    })

    it('collapsed: icons only, names stay accessible and show on focus', async () => {
        render(<Sidebar groups={groups} activeId="orders" collapsed />)
        const link = screen.getByRole('link', { name: 'Aufträge' })
        expect(link).toHaveAttribute('aria-current', 'page')
        expect(link).not.toHaveTextContent('Aufträge')
        link.focus()
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Aufträge')
    })

    it('collapsed: the tooltip is rendered outside the scrolling rail so it is not clipped', async () => {
        render(<Sidebar groups={groups} activeId="orders" collapsed />)
        screen.getByRole('link', { name: 'Laufzettel' }).focus()
        const tooltip = await screen.findByRole('tooltip')
        expect(screen.getByRole('navigation', { name: 'Hauptmenü' }).contains(tooltip)).toBe(false)
    })

    it('collapsed: the parent of an active nested view stays marked', () => {
        render(<Sidebar groups={groups} activeId="orders-mine" collapsed />)
        const parent = screen.getByRole('link', { name: 'Aufträge' })
        expect(parent).toHaveAttribute('data-active', 'true')
        expect(parent).not.toHaveAttribute('aria-current')
    })
})
