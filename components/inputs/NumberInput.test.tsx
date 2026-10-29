import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MoneyInput, NumberInput } from './NumberInput'
import { Textarea } from '@/components/atoms/Textarea/Textarea'

function Weight({ initial = null as number | null, onChange = vi.fn(), ...props }: Partial<React.ComponentProps<typeof NumberInput>> & { initial?: number | null }) {
    const [value, setValue] = React.useState<number | null>(initial)
    return <NumberInput aria-label="Gewicht" unit="g" decimals={1} value={value} onChange={(v) => { onChange(v); setValue(v) }} {...props} />
}

describe('NumberInput', () => {
    it('reads a comma when leaving and shows the canonical form', async () => {
        const onChange = vi.fn()
        render(<Weight onChange={onChange} />)
        const field = screen.getByRole('textbox', { name: 'Gewicht' })
        await userEvent.type(field, "1'234,56")
        await userEvent.tab()
        expect(onChange).toHaveBeenLastCalledWith(1234.6)
        expect(field).toHaveValue('1’234.6')
    })

    it('Enter reads as well', async () => {
        const onChange = vi.fn()
        render(<Weight onChange={onChange} />)
        await userEvent.type(screen.getByRole('textbox', { name: 'Gewicht' }), '12{Enter}')
        expect(onChange).toHaveBeenLastCalledWith(12)
    })

    it('shows the unit in the field and tells screen readers', () => {
        render(<Weight initial={12} />)
        const field = screen.getByRole('textbox', { name: 'Gewicht' })
        expect(screen.getByText('g')).toBeInTheDocument()
        expect(field).toHaveAccessibleDescription(/g/)
    })

    it('keeps an unreadable text and says why', async () => {
        const onChange = vi.fn()
        render(<Weight onChange={onChange} />)
        const field = screen.getByRole('textbox', { name: 'Gewicht' })
        await userEvent.type(field, '1,2,3')
        await userEvent.tab()
        expect(onChange).not.toHaveBeenCalled()
        expect(field).toHaveValue('1,2,3')
        expect(field).toHaveAttribute('aria-invalid', 'true')
        expect(field).toHaveAccessibleDescription(/Mehr als ein Komma oder Punkt/)
    })

    it('refuses values outside the limits with the allowed range', async () => {
        const onChange = vi.fn()
        render(<Weight onChange={onChange} min={1} max={500} />)
        const field = screen.getByRole('textbox', { name: 'Gewicht' })
        await userEvent.type(field, '900')
        await userEvent.tab()
        expect(onChange).not.toHaveBeenCalled()
        expect(field).toHaveAccessibleDescription(/Erlaubt: 1 bis 500/)
    })

    it('arrows step within the limits', async () => {
        const onChange = vi.fn()
        render(<Weight initial={499.5} onChange={onChange} max={500} decimals={0} />)
        const field = screen.getByRole('textbox', { name: 'Gewicht' })
        await userEvent.click(field)
        await userEvent.keyboard('{ArrowUp}')
        expect(onChange).toHaveBeenLastCalledWith(500)
        await userEvent.keyboard('{ArrowUp}')
        expect(onChange).toHaveBeenLastCalledWith(500)
        await userEvent.keyboard('{ArrowDown}')
        expect(onChange).toHaveBeenLastCalledWith(499)
    })

    it('does not overwrite what someone is typing when the value changes from outside', async () => {
        function Outside() {
            const [value, setValue] = React.useState<number | null>(1)
            return (
                <>
                    <NumberInput aria-label="Menge" value={value} onChange={setValue} />
                    <button onClick={() => setValue(99)}>Fremd</button>
                </>
            )
        }
        render(<Outside />)
        const field = screen.getByRole('textbox', { name: 'Menge' })
        await userEvent.clear(field)
        await userEvent.type(field, '42')
        // the outside change arrives while the field still has focus
        screen.getByRole('button', { name: 'Fremd' }).click()
        expect(field).toHaveValue('42')
    })
})

describe('MoneyInput', () => {
    it('stores whole cents and shows two decimals with the currency', async () => {
        const onChange = vi.fn()
        function Price() {
            const [cents, setCents] = React.useState<number | null>(null)
            return <MoneyInput aria-label="Preis" cents={cents} onChange={(c) => { onChange(c); setCents(c) }} />
        }
        render(<Price />)
        const field = screen.getByRole('textbox', { name: 'Preis' })
        await userEvent.type(field, '1234.5')
        await userEvent.tab()
        expect(onChange).toHaveBeenLastCalledWith(123450)
        expect(field).toHaveValue('1’234.50')
        expect(screen.getByText('CHF')).toBeInTheDocument()
    })
})

describe('Textarea counter', () => {
    it('shows the count only near the limit', async () => {
        render(<Textarea aria-label="Notiz" maxLength={10} />)
        const field = screen.getByRole('textbox', { name: 'Notiz' })
        await userEvent.type(field, '1234567')
        expect(screen.queryByText(/\/ 10/)).not.toBeInTheDocument()
        await userEvent.type(field, '8')
        expect(screen.getByText('8 / 10')).toBeInTheDocument()
    })
})
