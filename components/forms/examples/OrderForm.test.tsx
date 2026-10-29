import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { OrderForm } from './OrderForm'
import type { OrderInput, PositionInput } from './orderSchema'

const complete = (no: number): PositionInput => ({
    no, typ: 'neu', material: 'alsi10mg', qty: '10', articleId: '', note: '', extras: [],
})
const incomplete = (no: number): PositionInput => ({ ...complete(no), material: '', qty: '' })

const order = (positions: PositionInput[]): OrderInput => ({
    customer: 'Kunde AG', orderNo: 'A-2026-001', dueDate: '2026-11-30', remark: '', positions,
})

describe('OrderForm', () => {
    it('an unreadable date blocks saving with its reason instead of saving the old date', async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        render(<OrderForm defaultValues={order([complete(1)])} onSubmit={onSubmit} />)
        const due = screen.getByRole('textbox', { name: /Liefertermin/ })
        await user.clear(due)
        await user.type(due, '31.02.2027')
        await user.click(screen.getByRole('button', { name: 'Speichern' }))
        expect(await screen.findByText('Diesen Tag gibt es nicht')).toBeInTheDocument()
        expect(onSubmit).not.toHaveBeenCalled()
        expect(due).toHaveValue('31.02.2027')
    })

    it('summary groups incomplete positions by number', async () => {
        const user = userEvent.setup()
        render(<OrderForm defaultValues={order([complete(1), incomplete(2), complete(3), incomplete(4)])} onSubmit={vi.fn()} />)
        await user.click(screen.getByRole('button', { name: 'Speichern' }))
        const summary = await screen.findByRole('alert', { name: /2 Positionen unvollständig: #2, #4/ })
        const link = Array.from(summary.querySelectorAll('a')).find((a) => a.textContent === 'Position #2')!
        expect(link.getAttribute('href')).toBe('#positions-2')
        await user.click(link)
        expect(document.getElementById('positions-2')).toHaveFocus()
    })

    it('lists header fields before positions in the summary', async () => {
        const user = userEvent.setup()
        render(<OrderForm defaultValues={{ ...order([incomplete(1)]), customer: '' }} onSubmit={vi.fn()} />)
        await user.click(screen.getByRole('button', { name: 'Speichern' }))
        const summary = await screen.findByRole('alert', { name: /unvollständig/ })
        expect(Array.from(summary.querySelectorAll('a')).map((a) => a.textContent)).toEqual(['Kunde', 'Position #1'])
    })

    it('valid order submits cleaned values', async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        render(<OrderForm defaultValues={order([{ ...complete(1), articleId: 'A-1', qty: "1'200" }])} onSubmit={onSubmit} />)
        await user.click(screen.getByRole('button', { name: 'Speichern' }))
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        const values = onSubmit.mock.calls[0][0]
        expect(values.positions[0].qty).toBe(1200)
        expect(values.positions[0]).not.toHaveProperty('articleId')
    })

    it('shows the existing-article field only for template type', async () => {
        const user = userEvent.setup()
        render(<OrderForm defaultValues={order([incomplete(1)])} onSubmit={vi.fn()} />)
        expect(screen.queryByLabelText(/Bestehender Artikel/)).not.toBeInTheDocument()
        await user.click(screen.getByRole('combobox', { name: /^Typ/ }))
        await user.click(screen.getByRole('option', { name: 'Bestehende Vorlage' }))
        expect(screen.getByLabelText(/Bestehender Artikel/)).toBeInTheDocument()
    })

    it('block header summarises type, material and quantity', () => {
        render(<OrderForm defaultValues={order([complete(1)])} onSubmit={vi.fn()} />)
        expect(document.getElementById('positions-1')).toHaveTextContent('Neue Form · AlSi10Mg · 10 Stk')
    })
})
