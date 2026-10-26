import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { ConditionalField } from './ConditionalField'
import { RequiredRegistryProvider, useOpenRequiredCount } from './RequiredRegistry'
import { FormField } from './FormField'
import { Input } from '@/components/atoms/Input/Input'
import { Select } from '@/components/molecules/Select/Select'

const TYPES = [
    { value: 'neu', label: 'Neue Form' },
    { value: 'vorlage', label: 'Bestehende Vorlage' },
]

function OpenCount() {
    return <output data-testid="open">{useOpenRequiredCount()}</output>
}

function Fixture() {
    const form = useForm({ defaultValues: { typ: 'neu', articleId: '', qty: '' }, shouldUnregister: false })
    const typ = useWatch({ control: form.control, name: 'typ' })
    return (
        <FormProvider {...form}>
            <RequiredRegistryProvider>
                <Controller
                    control={form.control}
                    name="typ"
                    render={({ field }) => (
                        <FormField label="Typ" name="typ" required>
                            <Select options={TYPES} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                        </FormField>
                    )}
                />
                <ConditionalField when={typ === 'vorlage'}>
                    <FormField label="Bestehender Artikel" name="articleId" required>
                        <Input {...form.register('articleId')} />
                    </FormField>
                </ConditionalField>
                <FormField label="Menge" name="qty" required>
                    <Input {...form.register('qty')} />
                </FormField>
                <OpenCount />
            </RequiredRegistryProvider>
        </FormProvider>
    )
}

async function chooseTyp(user: ReturnType<typeof userEvent.setup>, label: string) {
    await user.click(screen.getByRole('combobox', { name: /Typ/ }))
    await user.click(screen.getByRole('option', { name: label }))
}

describe('ConditionalField (F-10)', () => {
    it('hidden field is not in the DOM', () => {
        render(<Fixture />)
        expect(screen.queryByLabelText(/Bestehender Artikel/)).not.toBeInTheDocument()
    })

    it('appears when trigger value matches and counts as required', async () => {
        const user = userEvent.setup()
        render(<Fixture />)
        expect(screen.getByTestId('open')).toHaveTextContent('1')
        await chooseTyp(user, 'Bestehende Vorlage')
        expect(screen.getByLabelText(/Bestehender Artikel/)).toBeInTheDocument()
        expect(screen.getByTestId('open')).toHaveTextContent('2')
    })

    it('keeps value when toggled away and back', async () => {
        const user = userEvent.setup()
        render(<Fixture />)
        await chooseTyp(user, 'Bestehende Vorlage')
        await user.type(screen.getByLabelText(/Bestehender Artikel/), 'A-100')
        await chooseTyp(user, 'Neue Form')
        expect(screen.queryByLabelText(/Bestehender Artikel/)).not.toBeInTheDocument()
        await chooseTyp(user, 'Bestehende Vorlage')
        expect(screen.getByLabelText(/Bestehender Artikel/)).toHaveValue('A-100')
    })

    it('nested registry counts in parent', () => {
        function Nested() {
            const form = useForm({ defaultValues: { outer: 'x', inner: '' } })
            return (
                <FormProvider {...form}>
                    <RequiredRegistryProvider>
                        <FormField label="Aussen" name="outer" required><Input {...form.register('outer')} /></FormField>
                        <RequiredRegistryProvider>
                            <FormField label="Innen" name="inner" required><Input {...form.register('inner')} /></FormField>
                        </RequiredRegistryProvider>
                        <OpenCount />
                    </RequiredRegistryProvider>
                </FormProvider>
            )
        }
        render(<Nested />)
        expect(screen.getByTestId('open')).toHaveTextContent('1')
    })
})
