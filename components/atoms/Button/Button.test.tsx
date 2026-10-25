import { render } from '@testing-library/react'
import { Button } from './Button'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'

describe('Button busy', () => {
    it('busy button ignores clicks but stays enabled', () => {
        const onClick = vi.fn()
        const { getByRole } = render(<Button busy onClick={onClick}>Speichern</Button>)
        const button = getByRole('button', { name: /speichern/i })
        fireEvent.click(button)
        expect(onClick).not.toHaveBeenCalled()
        expect(button).not.toBeDisabled()
        expect(button).toHaveAttribute('aria-busy', 'true')
    })
})

describe('MainButton', () => {
    it('renders correctly', () => {
        const { getByRole } = render(<Button>Click me</Button>)

        // Now we use it directly (no 'screen.' prefix needed)
        const button = getByRole('button', { name: /click me/i })

        expect(button).toBeInTheDocument()
    })
})