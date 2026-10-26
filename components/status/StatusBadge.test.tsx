import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from './StatusBadge'

const IN_ARBEIT = { id: 'in-arbeit', label: 'In Arbeit', category: 'active' as const }
const now = new Date(2026, 9, 26, 14, 0).getTime()

describe('StatusBadge', () => {
    it('shows the status as text with its category and a hidden icon', () => {
        render(<StatusBadge status={IN_ARBEIT} />)
        const badge = screen.getByText('In Arbeit').closest('[data-category]')!
        expect(badge).toHaveAttribute('data-category', 'active')
        expect(badge.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('says since when, with the exact time as title', () => {
        render(<StatusBadge status={IN_ARBEIT} since={now - 130 * 60_000} now={now} />)
        const since = screen.getByText('seit 2 h 10 min')
        expect(since.closest('[title]')).toHaveAttribute('title', '26.10.2026 11:50')
    })

    it('warns in words when the usual time is exceeded', () => {
        render(<StatusBadge status={IN_ARBEIT} overdue="Länger als üblich (Richtzeit 4 h)" />)
        expect(screen.getByText('Länger als üblich (Richtzeit 4 h)')).toBeInTheDocument()
    })
})
