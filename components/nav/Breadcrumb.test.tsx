import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Breadcrumb } from './Breadcrumb'

const LONG = 'K'.repeat(120)
const trail = [
    { label: 'Aufträge', href: '/auftraege' },
    { label: `#26100013 ${LONG}`, href: '/auftraege/26100013' },
    { label: 'Laufzettel 1/4', href: '/auftraege/26100013/laufzettel/1' },
]

describe('Breadcrumb', () => {
    it('links every crumb but the last, which is the current page', () => {
        render(<Breadcrumb trail={trail} />)
        const nav = screen.getByRole('navigation', { name: 'Pfad' })
        const links = within(nav).getAllByRole('link')
        expect(links.map((l) => l.getAttribute('href'))).toEqual(['/auftraege', '/auftraege/26100013'])
        const current = within(nav).getByText('Laufzettel 1/4')
        expect(current.closest('a')).toBeNull()
        expect(current).toHaveAttribute('aria-current', 'page')
    })

    it('shortens long middle crumbs but keeps the full text in the title', () => {
        render(<Breadcrumb trail={trail} />)
        const middle = screen.getByRole('link', { name: `#26100013 ${LONG}` })
        expect(middle).toHaveAttribute('title', `#26100013 ${LONG}`)
        expect(middle.className).toContain('truncate')
        expect(screen.getByText('Laufzettel 1/4')).toHaveAttribute('title', 'Laufzettel 1/4')
    })
})
