import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PageHeader } from './PageHeader'

const trail = [
    { label: 'Aufträge', href: '/auftraege' },
    { label: '#26100013 DÄHLER + BLASER', href: '/auftraege/26100013' },
]

describe('PageHeader', () => {
    it('names the object once as h1 and ends the path with the same label', () => {
        render(<PageHeader trail={trail} title="#26100013 DÄHLER + BLASER" />)
        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('#26100013 DÄHLER + BLASER')
        const path = screen.getByRole('navigation', { name: 'Pfad' })
        expect(within(path).getByText('#26100013 DÄHLER + BLASER')).toHaveAttribute('aria-current', 'page')
    })

    it('offers the way back to the list it came from', () => {
        const { rerender } = render(<PageHeader trail={trail} title="x" back={{ label: 'Offen · Aufträge', href: '/auftraege?view=offen' }} />)
        expect(screen.getByRole('link', { name: /Offen · Aufträge/ })).toHaveAttribute('href', '/auftraege?view=offen')
        rerender(<PageHeader trail={trail} title="x" />)
        expect(screen.queryByRole('link', { name: /Offen · Aufträge/ })).toBeNull()
    })

    it('renders actions and page tabs', () => {
        render(
            <PageHeader
                trail={trail}
                title="x"
                primaryAction={<button>Status ändern</button>}
                tabs={{ tabs: [{ label: 'Details', href: '/a' }, { label: 'Verlauf', href: '/a/v' }], current: '/a' }}
            />
        )
        expect(screen.getByRole('button', { name: 'Status ändern' })).toBeInTheDocument()
        expect(screen.getByRole('navigation', { name: 'Seitenbereiche' })).toBeInTheDocument()
    })
})
