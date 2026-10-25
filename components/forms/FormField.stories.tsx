import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from './FormField'
import { FormSection } from './FormSection'
import { Input } from '@/components/atoms/Input/Input'
import { Textarea } from '@/components/atoms/Textarea/Textarea'

const meta: Meta = {
    title: 'Forms/FormField',
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj

/** Most fields optional → mark the required ones (F-01). */
export const RequiredConvention: Story = {
    render: () => (
        <div className="w-96">
            <FormSection title="Kontakt" markers="required">
                <FormField label="Kunde" required>
                    <Input placeholder="Firma AG" />
                </FormField>
                <FormField label="Telefon">
                    <Input />
                </FormField>
                <FormField label="Bemerkung" hint="Erscheint auf dem Lieferschein.">
                    <Textarea />
                </FormField>
            </FormSection>
        </div>
    ),
}

/** Most fields required → mark the optional ones (F-01). */
export const OptionalConvention: Story = {
    render: () => (
        <div className="w-96">
            <FormSection title="Position" markers="optional">
                <div className="grid grid-cols-3 gap-3">
                    <FormField label="Typ" required><Input /></FormField>
                    <FormField label="Material" required><Input /></FormField>
                    <FormField label="Menge" required><Input inputMode="numeric" /></FormField>
                </div>
                <FormField label="Notiz">
                    <Textarea />
                </FormField>
            </FormSection>
        </div>
    ),
}

/** Errors say what to do, right at the field (F-03). */
export const WithError: Story = {
    render: () => (
        <div className="w-80">
            <FormField label="Menge" required hint="Ganze Stück" error="Menge muss mindestens 1 sein">
                <Input defaultValue="0" inputMode="numeric" />
            </FormField>
        </div>
    ),
}
