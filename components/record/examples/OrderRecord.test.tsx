import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { OrderRecord } from './OrderRecord'

const setup = () => render(<OrderRecord saveDelay={10} />)

describe('Beispiel: Datensatz Auftrag', () => {
    it('shows the key facts with their distance in time', () => {
        setup()
        const facts = screen.getByRole('region', { name: 'Auf einen Blick' })
        expect(within(facts).getByText('in 15 Tagen')).toBeInTheDocument()
        expect(within(facts).getByText('1 von 4')).toBeInTheDocument()
    })

    it('changes the delivery date in place and writes it into the history', async () => {
        setup()
        await userEvent.click(screen.getByRole('button', { name: /^Liefertermin ändern/ }))
        const field = screen.getByRole('textbox', { name: 'Liefertermin' })
        await userEvent.clear(field)
        await userEvent.type(field, '20.11.{Enter}')
        expect(await screen.findByRole('button', { name: /^Liefertermin ändern/ })).toHaveTextContent('Fr, 20.11.2026')
        const history = screen.getByRole('region', { name: 'Verlauf' })
        expect(within(history).getByText(/Liefertermin/)).toBeInTheDocument()
    })

    it('when saving fails the typed value stays with the reason', async () => {
        setup()
        await userEvent.click(screen.getByRole('switch', { name: 'Speichern schlägt fehl' }))
        await userEvent.click(screen.getByRole('button', { name: /^Bestellnummer des Kunden hinzufügen/ }))
        await userEvent.type(screen.getByRole('textbox', { name: 'Bestellnummer des Kunden' }), 'PO-4471{Enter}')
        expect(await screen.findByRole('alert')).toHaveTextContent('Keine Verbindung zum Server. Nochmals versuchen oder später speichern.')
        expect(screen.getByRole('textbox', { name: 'Bestellnummer des Kunden' })).toHaveValue('PO-4471')
    })

    it('the order number can be copied', () => {
        setup()
        expect(screen.getByRole('button', { name: 'Auftragsnummer kopieren' })).toBeInTheDocument()
    })

    it('related records are on the page with a way to all of them', () => {
        setup()
        expect(screen.getByRole('heading', { name: 'Laufzettel 12' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Alle 12 anzeigen' })).toBeInTheDocument()
        expect(screen.getByText('Noch keine Rechnung')).toBeInTheDocument()
    })

    it('the delivery address is changed together in a form (D-08)', async () => {
        setup()
        await userEvent.click(screen.getByRole('button', { name: 'Lieferadresse bearbeiten' }))
        const dialog = screen.getByRole('dialog', { name: 'Lieferadresse bearbeiten' })
        await userEvent.clear(within(dialog).getByRole('textbox', { name: 'Ort' }))
        await userEvent.type(within(dialog).getByRole('textbox', { name: 'Ort' }), 'Nidau')
        await userEvent.click(within(dialog).getByRole('button', { name: 'Adresse speichern' }))
        expect(screen.queryByRole('dialog')).toBeNull()
        expect(screen.getByRole('region', { name: 'Eigenschaften' })).toHaveTextContent('Nidau')
    })

    it('arrow keys move the choice; Enter saves it', async () => {
        setup()
        await userEvent.click(screen.getByRole('button', { name: /^Dringlichkeit ändern/ }))
        expect(screen.getByRole('radio', { name: 'Normal' })).toHaveFocus()
        await userEvent.keyboard('{ArrowRight}{ArrowRight}{Enter}')
        expect(await screen.findByRole('button', { name: /^Dringlichkeit ändern/ })).toHaveTextContent('Warten')
    })

    it('arrow keys in the date field do not save on their own', async () => {
        setup()
        await userEvent.click(screen.getByRole('button', { name: /^Liefertermin ändern/ }))
        await userEvent.keyboard('{ArrowUp}{ArrowUp}')
        expect(screen.getByRole('textbox', { name: 'Liefertermin' })).toHaveValue('15.11.2026')
        await userEvent.keyboard('{Enter}')
        expect(await screen.findByRole('button', { name: /^Liefertermin ändern/ })).toHaveTextContent('So, 15.11.2026')
    })

    it('an unreadable date stays in the field when leaving', async () => {
        setup()
        await userEvent.click(screen.getByRole('button', { name: /^Liefertermin ändern/ }))
        const field = screen.getByRole('textbox', { name: 'Liefertermin' })
        await userEvent.clear(field)
        await userEvent.type(field, '31.02.2027')
        await userEvent.click(screen.getByRole('heading', { name: /Positionen/ }))
        expect(screen.getByRole('textbox', { name: 'Liefertermin' })).toHaveValue('31.02.2027')
    })

    it('a cancelled address edit is gone when the dialog opens again, and cancelling with changes asks first', async () => {
        setup()
        await userEvent.click(screen.getByRole('button', { name: 'Lieferadresse bearbeiten' }))
        const street = within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Strasse' })
        await userEvent.clear(street)
        await userEvent.type(street, 'Falsch 1')
        await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Abbrechen' }))
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Verwerfen' }))
        await userEvent.click(screen.getByRole('button', { name: 'Lieferadresse bearbeiten' }))
        expect(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Strasse' })).toHaveValue('Zentralstrasse 12')
    })
})
