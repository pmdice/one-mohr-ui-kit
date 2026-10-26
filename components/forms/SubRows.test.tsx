import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { Form, useEnterpriseForm } from './Form'
import { FormField } from './FormField'
import { RepeatableGroup } from './RepeatableGroup'
import { SubRows } from './SubRows'
import { Input } from '@/components/atoms/Input/Input'

const schema = z.object({
    positions: z.array(z.object({
        no: z.number(),
        qty: z.string(),
        extras: z.array(z.object({ art: z.string(), note: z.string() })),
    })),
})
type Position = z.input<typeof schema>['positions'][number]

function Extras({ index }: { index: number }) {
    const { register } = useFormContext()
    return (
        <SubRows
            name={`positions.${index}.extras`}
            addLabel="Zusatzleistung"
            rowLabel="Zusatzleistung"
            newItem={() => ({ art: '', note: '' })}
        >
            {({ index: row }) => (
                <FormField label="Art" name={`positions.${index}.extras.${row}.art`} required>
                    <Input {...register(`positions.${index}.extras.${row}.art`)} />
                </FormField>
            )}
        </SubRows>
    )
}

function Fixture({ positions }: { positions: Position[] }) {
    const form = useEnterpriseForm(schema, { defaultValues: { positions } })
    return (
        <Form form={form} onSubmit={vi.fn()}>
            <RepeatableGroup<Position>
                name="positions"
                addLabel="Position hinzufügen"
                newItem={() => ({ qty: '1', extras: [] })}
                summarize={(p) => `${p.qty} Stk`}
            >
                {({ index }) => <Extras index={index} />}
            </RepeatableGroup>
        </Form>
    )
}

const content = (no: number) => {
    const header = document.getElementById(`positions-${no}`)!
    return document.getElementById(header.getAttribute('aria-controls')!)!
}

describe('SubRows (F-07)', () => {
    const two = [{ no: 1, qty: '1', extras: [] }, { no: 2, qty: '1', extras: [] }]

    it('add button belongs to its own block', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={two} />)
        await user.click(screen.getByRole('button', { name: 'Alle aufklappen' }))
        await user.click(within(content(2)).getByRole('button', { name: /Zusatzleistung/ }))
        expect(within(content(2)).getAllByLabelText(/^Art/)).toHaveLength(1)
        expect(within(content(1)).queryAllByLabelText(/^Art/)).toHaveLength(0)
    })

    it('required field in a sub-row counts toward its block', async () => {
        render(<Fixture positions={[{ no: 1, qty: '1', extras: [] }, { no: 2, qty: '1', extras: [{ art: '', note: '' }] }]} />)
        await waitFor(() => expect(document.getElementById('positions-2')).toHaveTextContent('1 Pflichtfeld offen'))
        expect(document.getElementById('positions-1')).toHaveTextContent('vollständig')
    })

    it('rows are grouped as a list attached to the block', () => {
        render(<Fixture positions={[{ no: 1, qty: '1', extras: [{ art: '3D-Druck', note: '' }] }]} />)
        expect(within(content(1)).getByRole('list', { name: 'Zusatzleistung', hidden: true })).toBeInTheDocument()
    })

    it('removing a sub-row moves focus to the add button when it was the last', async () => {
        const user = userEvent.setup()
        render(<Fixture positions={[{ no: 1, qty: '1', extras: [{ art: 'X', note: '' }] }]} />)
        await user.click(document.getElementById('positions-1')!)
        await user.click(within(content(1)).getByRole('button', { name: 'Zusatzleistung 1 entfernen' }))
        await waitFor(() => expect(within(content(1)).getByRole('button', { name: /Zusatzleistung/ })).toHaveFocus())
    })
})
