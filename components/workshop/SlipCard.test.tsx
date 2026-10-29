import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SlipCard } from './SlipCard'

describe('SlipCard', () => {
    it('shows five facts and the notes as a warning above', () => {
        render(<SlipCard number="26100013 – 1/4" customer="DÄHLER + BLASER" material="INOX" pieces={12} urgency="Dringend" notes={['Steine nicht mitgiessen']} />)
        const card = screen.getByRole('region', { name: '26100013 – 1/4' })
        expect(within(card).getAllByRole('term').map((t) => t.textContent)).toEqual(['Kennung', 'Kunde', 'Material', 'Stück', 'Dringlichkeit'])
        expect(within(card).getByRole('note')).toHaveTextContent('Steine nicht mitgiessen')
    })
})
