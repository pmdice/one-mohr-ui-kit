import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { Form, useEnterpriseForm, useFieldError } from './Form'
import { FormField } from './FormField'
import { Input } from '@/components/atoms/Input/Input'
import { Select } from '@/components/molecules/Select/Select'
import { Controller } from 'react-hook-form'

const schema = z.object({
    name: z.string().min(1, 'Name fehlt'),
    qty: z.coerce.number<string>().int().min(1, 'Menge muss mindestens 1 sein'),
})

function Mini({ onSubmit }: { onSubmit: (values: z.output<typeof schema>) => Promise<void> | void }) {
    const form = useEnterpriseForm(schema, { defaultValues: { name: '', qty: '' } })
    return (
        <Form form={form} onSubmit={onSubmit}>
            <Fields register={form.register} />
        </Form>
    )
}

function Fields({ register }: { register: ReturnType<typeof useEnterpriseForm<typeof schema>>['register'] }) {
    const nameError = useFieldError('name')
    const qtyError = useFieldError('qty')
    return (
        <>
            <FormField label="Name" required error={nameError}><Input {...register('name')} /></FormField>
            <FormField label="Menge" required error={qtyError}><Input inputMode="numeric" {...register('qty')} /></FormField>
        </>
    )
}

const nameInput = () => screen.getByLabelText(/^Name/)
const qtyInput = () => screen.getByLabelText(/^Menge/)

describe('Form error timing (F-02)', () => {
    it('does not show errors while typing for the first time', async () => {
        const user = userEvent.setup()
        render(<Mini onSubmit={vi.fn()} />)
        await user.type(nameInput(), 'A')
        await user.clear(nameInput())
        expect(screen.queryByText('Name fehlt')).not.toBeInTheDocument()
    })

    it('shows error on blur', async () => {
        const user = userEvent.setup()
        render(<Mini onSubmit={vi.fn()} />)
        await user.click(nameInput())
        await user.tab()
        expect(await screen.findByText('Name fehlt')).toBeInTheDocument()
    })

    it('clears error live once valid', async () => {
        const user = userEvent.setup()
        render(<Mini onSubmit={vi.fn()} />)
        await user.click(nameInput())
        await user.tab()
        await screen.findByText('Name fehlt')
        await user.type(nameInput(), 'A')
        await waitFor(() => expect(screen.queryByText('Name fehlt')).not.toBeInTheDocument())
        expect(nameInput()).toHaveFocus()
    })
})

describe('Form submit (F-04, F-11, F-12)', () => {
    it('enter in a text input does not submit', async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        render(<Mini onSubmit={onSubmit} />)
        await user.type(nameInput(), 'Kunde AG')
        await user.type(qtyInput(), '5{Enter}')
        await act(async () => {})
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('ctrl+enter submits', async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        render(<Mini onSubmit={onSubmit} />)
        await user.type(nameInput(), 'Kunde AG')
        await user.type(qtyInput(), '5')
        await user.keyboard('{Control>}{Enter}{/Control}')
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0][0]).toEqual({ name: 'Kunde AG', qty: 5 })
    })

    it('save focuses first invalid field and shows summary', async () => {
        const user = userEvent.setup()
        render(<Mini onSubmit={vi.fn()} />)
        await user.click(screen.getByRole('button', { name: 'Speichern' }))
        await waitFor(() => expect(nameInput()).toHaveFocus())
        const summary = screen.getByRole('alert', { name: /2 Felder/ })
        const links = summary.querySelectorAll('a')
        expect(links).toHaveLength(2)
        expect(links[0]).toHaveTextContent('Name')
        expect(links[0].getAttribute('href')).toBe(`#${nameInput().id}`)
    })

    it('summary link focuses its field', async () => {
        const user = userEvent.setup()
        render(<Mini onSubmit={vi.fn()} />)
        await user.click(screen.getByRole('button', { name: 'Speichern' }))
        await user.click(screen.getByRole('link', { name: /Menge/ }))
        expect(qtyInput()).toHaveFocus()
    })

    it('save button is never disabled for missing fields', () => {
        render(<Mini onSubmit={vi.fn()} />)
        expect(screen.getByRole('button', { name: 'Speichern' })).not.toBeDisabled()
    })

    it('double submit calls onSubmit once', async () => {
        const user = userEvent.setup()
        let resolve!: () => void
        const onSubmit = vi.fn(() => new Promise<void>((r) => { resolve = r }))
        render(<Mini onSubmit={onSubmit} />)
        await user.type(nameInput(), 'Kunde AG')
        await user.type(qtyInput(), '5')
        const button = screen.getByRole('button', { name: /Speicher/ })
        await user.click(button)
        await waitFor(() => expect(button).toHaveAttribute('aria-busy', 'true'))
        await user.click(button)
        await user.keyboard('{Control>}{Enter}{/Control}')
        expect(onSubmit).toHaveBeenCalledTimes(1)
        await act(async () => resolve())
        await waitFor(() => expect(button).not.toHaveAttribute('aria-busy'))
    })

    it('warns before unload when dirty', async () => {
        const user = userEvent.setup()
        render(<Mini onSubmit={vi.fn()} />)
        const clean = new Event('beforeunload', { cancelable: true })
        window.dispatchEvent(clean)
        expect(clean.defaultPrevented).toBe(false)
        await user.type(nameInput(), 'A')
        const dirty = new Event('beforeunload', { cancelable: true })
        window.dispatchEvent(dirty)
        expect(dirty.defaultPrevented).toBe(true)
    })

    it('rejected save shows an error and keeps the form dirty', async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn(() => Promise.reject(new Error('500')))
        render(<Mini onSubmit={onSubmit} />)
        await user.type(nameInput(), 'Kunde AG')
        await user.type(qtyInput(), '5')
        await user.click(screen.getByRole('button', { name: 'Speichern' }))
        expect(await screen.findByRole('alert', { name: /Speichern fehlgeschlagen/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Speichern' })).not.toHaveAttribute('aria-busy')
        const unload = new Event('beforeunload', { cancelable: true })
        window.dispatchEvent(unload)
        expect(unload.defaultPrevented).toBe(true)
    })

    it('edits made while saving stay unsaved', async () => {
        const user = userEvent.setup()
        let resolve!: () => void
        render(<Mini onSubmit={() => new Promise<void>((r) => { resolve = r })} />)
        await user.type(nameInput(), 'Kunde AG')
        await user.type(qtyInput(), '5')
        await user.click(screen.getByRole('button', { name: 'Speichern' }))
        await user.type(nameInput(), ' Bern')
        await act(async () => resolve())
        const unload = new Event('beforeunload', { cancelable: true })
        window.dispatchEvent(unload)
        expect(unload.defaultPrevented).toBe(true)
    })

    it('warns before unload while saving', async () => {
        const user = userEvent.setup()
        render(<Mini onSubmit={() => new Promise<void>(() => {})} />)
        await user.type(nameInput(), 'Kunde AG')
        await user.type(qtyInput(), '5')
        await user.click(screen.getByRole('button', { name: 'Speichern' }))
        await waitFor(() => expect(screen.getByRole('button', { name: /Speicher/ })).toHaveAttribute('aria-busy', 'true'))
        const unload = new Event('beforeunload', { cancelable: true })
        window.dispatchEvent(unload)
        expect(unload.defaultPrevented).toBe(true)
    })
})

describe('Form with a select (F-11)', () => {
    const selectSchema = z.object({ material: z.string().min(1, 'Material wählen') })
    function WithSelect({ onSubmit }: { onSubmit: () => void }) {
        const form = useEnterpriseForm(selectSchema, { defaultValues: { material: 'alu' } })
        return (
            <Form form={form} onSubmit={onSubmit}>
                <Controller control={form.control} name="material" render={({ field }) => (
                    <FormField label="Material"><Select options={[{ value: 'alu', label: 'Aluminium' }]} value={field.value} onChange={field.onChange} onBlur={field.onBlur} /></FormField>
                )} />
            </Form>
        )
    }

    it('ctrl+enter on a select submits without opening it', async () => {
        const user = userEvent.setup()
        const onSubmit = vi.fn()
        render(<WithSelect onSubmit={onSubmit} />)
        screen.getByRole('combobox', { name: 'Material' }).focus()
        await user.keyboard('{Control>}{Enter}{/Control}')
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
})
