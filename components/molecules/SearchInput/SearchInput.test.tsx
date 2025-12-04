import { render, fireEvent } from '@testing-library/react'
import { SearchInput } from './SearchInput'
import { describe, it, expect, vi } from 'vitest'

describe('SearchInput', () => {
    it('renders correctly', () => {
        const { getByPlaceholderText, getByRole } = render(<SearchInput placeholder="Test search..." />)

        expect(getByPlaceholderText('Test search...')).toBeInTheDocument()
        expect(getByRole('button', { name: /search/i })).toBeInTheDocument()
    })

    it('updates input value when typing', () => {
        const { getByPlaceholderText } = render(<SearchInput />)
        const input = getByPlaceholderText('Search...') as HTMLInputElement

        fireEvent.change(input, { target: { value: 'Next.js' } })
        expect(input.value).toBe('Next.js')
    })

    it('calls onSearch when button is clicked', () => {
        const handleSearch = vi.fn()
        const { getByRole, getByPlaceholderText } = render(<SearchInput onSearch={handleSearch} />)

        const input = getByPlaceholderText('Search...')
        const button = getByRole('button', { name: /search/i })

        // Type something
        fireEvent.change(input, { target: { value: 'React' } })

        // Click button
        fireEvent.click(button)

        expect(handleSearch).toHaveBeenCalledTimes(1)
        expect(handleSearch).toHaveBeenCalledWith('React')
    })

    it('calls onSearch when Enter key is pressed', () => {
        const handleSearch = vi.fn()
        const { getByPlaceholderText } = render(<SearchInput onSearch={handleSearch} />)

        const input = getByPlaceholderText('Search...')

        // Type and press Enter
        fireEvent.change(input, { target: { value: 'TypeScript' } })
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

        expect(handleSearch).toHaveBeenCalledTimes(1)
        expect(handleSearch).toHaveBeenCalledWith('TypeScript')
    })

    it('does not call onSearch when disabled', () => {
        const handleSearch = vi.fn()
        const { getByRole, getByPlaceholderText } = render(<SearchInput onSearch={handleSearch} disabled />)

        const input = getByPlaceholderText('Search...')
        const button = getByRole('button', { name: /search/i })

        // Try to type (should be disabled but we can force event in this test, logic usually stops at handler or UI state)
        // Checking attributes is better for disabled state
        expect(input).toBeDisabled()
        expect(button).toBeDisabled()

        // Try to click
        fireEvent.click(button)
        expect(handleSearch).not.toHaveBeenCalled()
    })
})