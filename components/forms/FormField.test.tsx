import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FormField } from './FormField'
import { FormSection } from './FormSection'
import { Input } from '@/components/atoms/Input/Input'

describe('FormField markers (F-01)', () => {
    it('marks required fields in a required-convention section', () => {
        render(
            <FormSection title="Kopfdaten" markers="required">
                <FormField label="Kunde" required><Input /></FormField>
                <FormField label="Bemerkung"><Input /></FormField>
            </FormSection>
        )
        const kunde = screen.getByText('Kunde').closest('label')!
        const bemerkung = screen.getByText('Bemerkung').closest('label')!
        expect(kunde).toHaveTextContent('*')
        expect(kunde).not.toHaveTextContent('(optional)')
        expect(bemerkung).not.toHaveTextContent('*')
        expect(bemerkung).not.toHaveTextContent('(optional)')
    })

    it('marks optional fields in an optional-convention section', () => {
        render(
            <FormSection title="Position" markers="optional">
                <FormField label="Menge" required><Input /></FormField>
                <FormField label="Notiz"><Input /></FormField>
            </FormSection>
        )
        const menge = screen.getByText('Menge').closest('label')!
        const notiz = screen.getByText('Notiz').closest('label')!
        expect(notiz).toHaveTextContent('(optional)')
        expect(menge).not.toHaveTextContent('*')
        expect(menge).not.toHaveTextContent('(optional)')
    })

    it('renders the section as a labelled region', () => {
        render(<FormSection title="Kopfdaten"><span /></FormSection>)
        expect(screen.getByRole('region', { name: 'Kopfdaten' })).toBeInTheDocument()
    })
})

describe('FormField wiring', () => {
    it('wires aria attributes onto the control', () => {
        render(<FormField label="Menge" required hint="Ganze Stück"><Input /></FormField>)
        const input = screen.getByLabelText(/Menge/)
        expect(input).toHaveAttribute('aria-required', 'true')
        const describedBy = input.getAttribute('aria-describedby')!
        expect(document.getElementById(describedBy)).toHaveTextContent('Ganze Stück')
    })

    it('error replaces hint and marks control invalid', () => {
        render(
            <FormField label="Menge" hint="Ganze Stück" error="Menge muss mindestens 1 sein">
                <Input />
            </FormField>
        )
        expect(screen.getByRole('alert')).toHaveTextContent('Menge muss mindestens 1 sein')
        expect(screen.queryByText('Ganze Stück')).not.toBeInTheDocument()
        const input = screen.getByLabelText(/Menge/)
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(document.getElementById(input.getAttribute('aria-describedby')!)).toHaveTextContent('Menge muss mindestens 1 sein')
    })
})
