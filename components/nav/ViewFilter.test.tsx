import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ViewFilter } from './ViewFilter'

const views = [
    { id: 'alle', label: 'Alle', href: '?view=alle', count: 17 },
    { id: 'offen', label: 'Offen', href: '?view=offen', count: 14 },
]

describe('ViewFilter', () => {
    it('is a named group with the current view marked and counts shown', () => {
        render(<ViewFilter views={views} current="offen" label="Ansicht" />)
        expect(screen.getByRole('group', { name: 'Ansicht' })).toBeInTheDocument()
        const offen = screen.getByRole('link', { name: /Offen/ })
        expect(offen).toHaveAttribute('aria-current', 'true')
        expect(offen).toHaveTextContent('Offen14')
        expect(screen.getByRole('link', { name: /Alle/ })).not.toHaveAttribute('aria-current')
    })
})
