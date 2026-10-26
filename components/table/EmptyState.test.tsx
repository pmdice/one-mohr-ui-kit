import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
    it('announces quietly when there is nothing, loudly on error', () => {
        const { rerender } = render(<EmptyState kind="no-results" title="Keine Treffer" action={<button>Filter zurücksetzen</button>} />)
        expect(screen.getByRole('status')).toHaveTextContent('Keine Treffer')
        expect(screen.getByRole('button', { name: 'Filter zurücksetzen' })).toBeInTheDocument()
        rerender(<EmptyState kind="error" title="Liste konnte nicht geladen werden" />)
        expect(screen.getByRole('alert')).toHaveTextContent('Liste konnte nicht geladen werden')
    })
})
