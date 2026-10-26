import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PageTabs } from './PageTabs'

const tabs = [
    { label: 'Details', href: '/a/1' },
    { label: 'Laufzettel', href: '/a/1/zettel', count: 4 },
    { label: 'Verlauf', href: '/a/1/verlauf' },
]

describe('PageTabs', () => {
    it('are links, and only the current one is marked', () => {
        render(<PageTabs tabs={tabs} current="/a/1/zettel" />)
        expect(screen.queryAllByRole('tab')).toHaveLength(0)
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(3)
        expect(links.filter((l) => l.getAttribute('aria-current') === 'page').map((l) => l.textContent)).toEqual(['Laufzettel4'])
        expect(screen.getByRole('navigation', { name: 'Seitenbereiche' })).toBeInTheDocument()
    })
})
