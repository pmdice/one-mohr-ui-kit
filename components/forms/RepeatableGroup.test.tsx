import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { Form, useEnterpriseForm, useFieldError } from './Form'
import { FormField } from './FormField'
import { RepeatableGroup } from './RepeatableGroup'
import { Input } from '@/components/atoms/Input/Input'
import { useFormContext } from 'react-hook-form'

const position = z.object({
    no: z.number(),
    typ: z.string().min(1, 'Typ fehlt'),
    material: z.string().min(1, 'Material fehlt'),
    qty: z.string().min(1, 'Menge fehlt'),
})
const schema = z.object({ positions: z.array(position) })
type Position = z.input<typeof position>

const full = (no: number, material = 'AlSi10Mg'): Position => ({ no, typ: 'Neu', material, qty: '10' })

function PositionFields({ index }: { index: number }) {
    const { register } = useFormContext()
    const typ = useFieldError(`positions.${index}.typ`)
    const material = useFieldError(`positions.${index}.material`)
    const qty = useFieldError(`positions.${index}.qty`)
    return (
        <div className="grid grid-cols-3 gap-3">
            <FormField label="Typ" name={`positions.${index}.typ`} required error={typ}><Input {...register(`positions.${index}.typ`)} /></FormField>
            <FormField label="Material" name={`positions.${index}.material`} required error={material}><Input {...register(`positions.${index}.material`)} /></FormField>
            <FormField label="Menge" name={`positions.${index}.qty`} required error={qty}><Input {...register(`positions.${index}.qty`)} /></FormField>
        </div>
    )
}

function Fixture({ positions, summarize }: { positions: Position[]; summarize?: (p: Position) => string }) {
    const form = useEnterpriseForm(schema, { defaultValues: { positions } })
    return (
        <Form form={form} onSubmit={vi.fn()}>
            <RepeatableGroup<Position>
                name="positions"
                itemLabel="Position"
                addLabel="Position hinzufügen"
                newItem={() => ({ typ: '', material: '', qty: '' })}
                summarize={summarize ?? ((p) => [p.typ, p.material, p.qty && `${p.qty} Stk`].filter(Boolean).join(' · '))}
            >
                {({ index }) => <PositionFields index={index} />}
            </RepeatableGroup>
        </Form>
    )
}

const isHeader = (no: number | string) => new RegExp(`^Position #${no}(?! (duplizieren|entfernen)$)`)
const header = (no: number) => screen.getByRole('button', { name: isHeader(no) })
const headers = () => screen.getAllByRole('button', { name: isHeader('\\d+') }).map((b) => b.getAttribute('data-no'))
const remove = (user: ReturnType<typeof userEvent.setup>, no: number) =>
    user.click(screen.getByRole('button', { name: `Position #${no} entfernen` }))

describe('RepeatableGroup numbering (F-06)', () => {
    it('numbers stay stable after removing a middle block', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1), full(2), full(3)]} />)
        await remove(user, 2)
        expect(headers()).toEqual(['1', '3'])
    })

    it('new block takes highest ever number + 1 even after removing the last', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1), full(2)]} />)
        await remove(user, 2)
        await user.click(screen.getByRole('button', { name: 'Position hinzufügen' }))
        expect(headers()).toEqual(['1', '3'])
    })

    it('undo restores the same number at the same position', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1), full(2, 'CuSn12'), full(3)]} />)
        await remove(user, 2)
        await user.click(screen.getByRole('button', { name: 'Rückgängig' }))
        expect(headers()).toEqual(['1', '2', '3'])
        expect(header(2)).toHaveTextContent('CuSn12')
    })

    it('duplicate gets a new number', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1, 'CuSn12'), full(2)]} />)
        await user.click(screen.getByRole('button', { name: 'Position #1 duplizieren' }))
        expect(headers()).toEqual(['1', '3', '2'])
        expect(header(3)).toHaveTextContent('CuSn12')
    })
})

describe('RepeatableGroup blocks (F-08, F-09)', () => {
    it('new block is expanded, focused, and shows open required count', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1)]} />)
        await user.click(screen.getByRole('button', { name: 'Position hinzufügen' }))
        const second = header(2)
        expect(second).toHaveAttribute('aria-expanded', 'true')
        await waitFor(() => expect(second).toHaveTextContent('3 Pflichtfelder offen'))
        await waitFor(() => expect(screen.getAllByLabelText(/^Typ/)[1]).toHaveFocus())
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('complete blocks start collapsed', async () => {
        render(<Fixture positions={[full(1), { no: 2, typ: 'Neu', material: '', qty: '' }]} />)
        const first = header(1)
        const second = header(2)
        await waitFor(() => expect(first).toHaveAttribute('aria-expanded', 'false'))
        expect(first).toHaveTextContent('vollständig')
        expect(document.getElementById(first.getAttribute('aria-controls')!)).not.toBeVisible()
        expect(second).toHaveAttribute('aria-expanded', 'true')
        expect(second).toHaveTextContent('2 Pflichtfelder offen')
    })

    it('uses singular for one open field', async () => {
        render(<Fixture positions={[{ no: 1, typ: 'Neu', material: 'X', qty: '' }]} />)
        await waitFor(() => expect(header(1)).toHaveTextContent('1 Pflichtfeld offen'))
    })

    it('collapse all and expand all', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1), { no: 2, typ: '', material: '', qty: '' }]} />)
        await user.click(screen.getByRole('button', { name: 'Alle einklappen' }))
        expect(header(2)).toHaveAttribute('aria-expanded', 'false')
        await user.click(screen.getByRole('button', { name: 'Alle aufklappen' }))
        expect(header(1)).toHaveAttribute('aria-expanded', 'true')
    })

    it('focus moves to undo when removing the focused block', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1), { no: 2, typ: '', material: '', qty: '' }]} />)
        const block2 = document.getElementById(header(2).getAttribute('aria-controls')!)!
        await user.click(within(block2).getByLabelText(/^Typ/))
        await remove(user, 2)
        await waitFor(() => expect(screen.getByRole('button', { name: 'Rückgängig' })).toHaveFocus())
    })

    it('long summary truncates and keeps full text in title', () => {
        const long = 'M'.repeat(120)
        render(<Fixture positions={[full(1)]} summarize={() => long} />)
        const summary = screen.getByTitle(long)
        expect(summary.className).toContain('truncate')
    })

    it('failed save expands collapsed incomplete blocks', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1), { no: 2, typ: '', material: '', qty: '' }]} />)
        await user.click(header(2))
        expect(header(2)).toHaveAttribute('aria-expanded', 'false')
        await user.click(screen.getByRole('button', { name: 'Speichern' }))
        await waitFor(() => expect(header(2)).toHaveAttribute('aria-expanded', 'true'))
        expect(header(2)).toHaveTextContent(/offen|Fehler/)
    })

    it('collapse all does not collapse blocks added afterwards', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1), full(2)]} />)
        await user.click(screen.getByRole('button', { name: 'Alle einklappen' }))
        await user.click(screen.getByRole('button', { name: 'Position hinzufügen' }))
        expect(header(3)).toHaveAttribute('aria-expanded', 'true')
        await waitFor(() => expect(screen.getAllByLabelText(/^Typ/)[2]).toHaveFocus())
    })

    it('undo after collapse all restores an incomplete block open', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1), { no: 2, typ: '', material: '', qty: '' }]} />)
        await user.click(screen.getByRole('button', { name: 'Alle einklappen' }))
        await remove(user, 2)
        await user.click(screen.getByRole('button', { name: 'Rückgängig' }))
        await waitFor(() => expect(header(2)).toHaveAttribute('aria-expanded', 'true'))
    })

    it('blocks keep their state and focus after a successful save', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[full(1), full(2)]} />)
        await user.click(header(1))
        expect(header(1)).toHaveAttribute('aria-expanded', 'true')
        const block1 = document.getElementById(header(1).getAttribute('aria-controls')!)!
        const material = within(block1).getByLabelText(/^Material/)
        await user.click(material)
        await user.keyboard('{Control>}{Enter}{/Control}')
        await waitFor(() => expect(screen.getByRole('button', { name: 'Speichern' })).not.toHaveAttribute('aria-busy'))
        expect(header(1)).toHaveAttribute('aria-expanded', 'true')
        expect(material).toBeInTheDocument()
        expect(material).toHaveFocus()
    })

    it('keeps focus in the list when the undo bar times out', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        try {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
            render(<Fixture positions={[full(1), full(2), full(3)]} />)
            await remove(user, 2)
            await waitFor(() => expect(screen.getByRole('button', { name: 'Rückgängig' })).toHaveFocus())
            await act(async () => { vi.advanceTimersByTime(8000) })
            expect(screen.queryByRole('button', { name: 'Rückgängig' })).not.toBeInTheDocument()
            expect(document.activeElement).not.toBe(document.body)
            expect(header(3)).toHaveFocus()
        } finally {
            vi.useRealTimers()
        }
    })
})
