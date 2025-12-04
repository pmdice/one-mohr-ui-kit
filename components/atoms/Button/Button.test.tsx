import { render } from '@testing-library/react'
import { Button } from './Button'
import { describe, it, expect } from 'vitest'

describe('MainButton', () => {
    it('renders correctly', () => {
        const { getByRole } = render(<Button>Click me</Button>)

        // Now we use it directly (no 'screen.' prefix needed)
        const button = getByRole('button', { name: /click me/i })

        expect(button).toBeInTheDocument()
    })
})