import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { Combobox, type ComboboxOption } from './Combobox'

const OPTIONS: ComboboxOption[] = [
    { value: 'a1', label: 'AlSi10Mg' },
    { value: 'a2', label: 'AlSi7Mg' },
    { value: 'b1', label: 'Bronze CuSn12' },
]

describe('Combobox with static options', () => {
    it('filters static options by typed text', async () => {
        const user = userEvent.setup()
        render(<Combobox aria-label="Material" options={OPTIONS} onChange={() => {}} />)
        await user.type(screen.getByRole('combobox', { name: 'Material' }), 'bron')
        const options = screen.getAllByRole('option')
        expect(options).toHaveLength(1)
        expect(options[0]).toHaveTextContent('Bronze CuSn12')
    })

    it('selects highlighted option with Enter', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        render(<Combobox aria-label="Material" options={OPTIONS} onChange={onChange} />)
        await user.type(screen.getByRole('combobox', { name: 'Material' }), 'alsi7{ArrowDown}{Enter}')
        expect(onChange).toHaveBeenCalledWith('a2')
    })

    it('shows empty text when no results', async () => {
        const user = userEvent.setup()
        render(<Combobox aria-label="Material" options={OPTIONS} onChange={() => {}} />)
        await user.type(screen.getByRole('combobox', { name: 'Material' }), 'xyz')
        expect(screen.getByText('Keine Treffer')).toBeInTheDocument()
    })
})

describe('Combobox with async options', () => {
    beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }) })
    afterEach(() => { vi.useRealTimers() })

    it('calls loadOptions once after debounce', async () => {
        vi.useFakeTimers()
        const loadOptions = vi.fn().mockResolvedValue([])
        render(<Combobox aria-label="Artikel" loadOptions={loadOptions} onChange={() => {}} />)
        const input = screen.getByRole('combobox', { name: 'Artikel' })
        fireEvent.change(input, { target: { value: 'A' } })
        fireEvent.change(input, { target: { value: 'Al' } })
        act(() => { vi.advanceTimersByTime(249) })
        expect(loadOptions).not.toHaveBeenCalled()
        act(() => { vi.advanceTimersByTime(1) })
        expect(loadOptions).toHaveBeenCalledTimes(1)
        expect(loadOptions.mock.calls[0][0]).toBe('Al')
    })

    it('ignores stale responses', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        const signals: AbortSignal[] = []
        const loadOptions = vi.fn((query: string, signal: AbortSignal) => {
            signals.push(signal)
            const delay = query === 'Al' ? 500 : 100
            return new Promise<ComboboxOption[]>((resolve) =>
                setTimeout(() => resolve([{ value: query, label: `Treffer ${query}` }]), delay)
            )
        })
        render(<Combobox aria-label="Artikel" loadOptions={loadOptions} onChange={() => {}} />)
        const input = screen.getByRole('combobox', { name: 'Artikel' })
        await user.type(input, 'Al')
        await act(async () => { vi.advanceTimersByTime(250) })
        await user.type(input, 'Si')
        await act(async () => { vi.advanceTimersByTime(250) })
        await act(async () => { vi.advanceTimersByTime(600) })
        expect(screen.getByText('Treffer AlSi')).toBeInTheDocument()
        expect(screen.queryByText('Treffer Al')).not.toBeInTheDocument()
        expect(signals[0].aborted).toBe(true)
    })

    it('shows a loading row while searching', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        const loadOptions = vi.fn(() => new Promise<ComboboxOption[]>(() => {}))
        render(<Combobox aria-label="Artikel" loadOptions={loadOptions} onChange={() => {}} />)
        await user.type(screen.getByRole('combobox', { name: 'Artikel' }), 'A')
        await act(async () => { vi.advanceTimersByTime(250) })
        expect(screen.getByText('Suche…')).toBeInTheDocument()
        expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true')
    })

    it('drops an in-flight response once the user keeps typing', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        const signals: AbortSignal[] = []
        const loadOptions = vi.fn((query: string, signal: AbortSignal) => {
            signals.push(signal)
            return new Promise<ComboboxOption[]>((resolve) =>
                setTimeout(() => resolve([{ value: query, label: `Treffer ${query}` }]), 100)
            )
        })
        render(<Combobox aria-label="Artikel" loadOptions={loadOptions} onChange={() => {}} />)
        const input = screen.getByRole('combobox', { name: 'Artikel' })
        await user.type(input, 'Al')
        await act(async () => { vi.advanceTimersByTime(250) })
        await user.type(input, 'Si')
        // "Al" resolves while "AlSi" is still debouncing
        await act(async () => { vi.advanceTimersByTime(120) })
        expect(screen.queryByText('Treffer Al')).not.toBeInTheDocument()
        expect(signals[0].aborted).toBe(true)
    })

    it('Enter does not commit results of an older search', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        const onChange = vi.fn()
        const loadOptions = vi.fn((query: string) =>
            new Promise<ComboboxOption[]>((resolve) => setTimeout(() => resolve([{ value: `${query}-1`, label: `${query}-1` }]), 50))
        )
        render(<Combobox aria-label="Artikel" loadOptions={loadOptions} onChange={onChange} />)
        const input = screen.getByRole('combobox', { name: 'Artikel' })
        await user.type(input, 'Al')
        await act(async () => { vi.advanceTimersByTime(400) })
        expect(screen.getByText('Al-1')).toBeInTheDocument()
        await user.type(input, 'Si{Enter}')
        expect(onChange).not.toHaveBeenCalled()
    })

    it('keys do nothing while the list is hidden', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        const onChange = vi.fn()
        const loadOptions = vi.fn(() => Promise.resolve([{ value: 'A-1', label: 'A-1' }, { value: 'A-2', label: 'A-2' }]))
        render(<Combobox aria-label="Artikel" loadOptions={loadOptions} onChange={onChange} />)
        const input = screen.getByRole('combobox', { name: 'Artikel' })
        await user.type(input, 'A')
        await act(async () => { vi.advanceTimersByTime(300) })
        await user.keyboard('{Enter}')
        expect(onChange).toHaveBeenCalledTimes(1)
        await user.click(input)
        await user.keyboard('{ArrowDown}{Enter}')
        expect(onChange).toHaveBeenCalledTimes(1)
    })
})
