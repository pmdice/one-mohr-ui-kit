import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
    it('takes control height from density token', () => {
        render(<div data-density="comfortable"><Input aria-label="Menge" /></div>)
        expect(screen.getByLabelText('Menge').className).toContain('h-control')
    })

    it('marks invalid', () => {
        render(<Input aria-label="Menge" error />)
        expect(screen.getByLabelText('Menge')).toHaveAttribute('aria-invalid', 'true')
    })
})
