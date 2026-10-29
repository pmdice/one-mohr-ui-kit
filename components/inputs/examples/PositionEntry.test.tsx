import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { PositionEntry } from './PositionEntry'

describe('Beispiel: Position erfassen', () => {
    it('stores what was typed in its canonical form', async () => {
        render(<PositionEntry today="2026-10-29" />)
        await userEvent.type(screen.getByRole('textbox', { name: 'Menge' }), "1'200")
        await userEvent.type(screen.getByRole('textbox', { name: 'Gewicht' }), '412,5')
        await userEvent.type(screen.getByRole('textbox', { name: 'Preis pro Stück' }), '19.9')
        await userEvent.type(screen.getByRole('textbox', { name: /Liefertermin/ }), 'morgen')
        await userEvent.click(screen.getByRole('radio', { name: 'Dringend' }))
        await userEvent.click(screen.getByRole('button', { name: 'Position speichern' }))

        const stored = screen.getByRole('region', { name: 'Gespeichert' })
        expect(within(stored).getByText('1200')).toBeInTheDocument()
        expect(within(stored).getByText('412.5')).toBeInTheDocument()
        expect(within(stored).getByText('1990')).toBeInTheDocument()
        expect(within(stored).getByText('2026-10-30')).toBeInTheDocument()
        expect(within(stored).getByText('dringend')).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'Menge' })).toHaveValue('1’200')
    })

    it('has every kind of field from the rules', () => {
        render(<PositionEntry today="2026-10-29" />)
        expect(screen.getByRole('combobox', { name: 'Kunde' })).toBeInTheDocument()
        expect(screen.getByRole('radiogroup', { name: 'Art der Position' })).toBeInTheDocument()
        expect(screen.getByRole('radiogroup', { name: 'Dringlichkeit' })).toBeInTheDocument()
        expect(screen.getByRole('checkbox', { name: 'Lieferschein mitdrucken' })).toBeInTheDocument()
        expect(screen.getByLabelText('Dateien auswählen', { selector: 'input' })).toBeInTheDocument()
    })
})

describe('review fixes: position entry', () => {
    it('does not save while photos are still uploading and says why', async () => {
        render(<PositionEntry today="2026-10-29" />)
        await userEvent.upload(screen.getByLabelText('Dateien auswählen', { selector: 'input' }), new File([new Uint8Array(10)], 'ring.jpg', { type: 'image/jpeg' }))
        expect(screen.getByRole('button', { name: 'Position speichern' })).toBeDisabled()
        expect(screen.getByText('Fotos werden noch hochgeladen …')).toBeInTheDocument()
    })
})
