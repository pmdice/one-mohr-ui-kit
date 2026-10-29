import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PrintSheet } from './PrintSheet'
import { RunSlip } from './RunSlip'
import { PrintPreview } from './PrintPreview'

const PRINTED = new Date(2026, 9, 29, 10, 30).getTime()

describe('PrintSheet', () => {
    it('carries head and foot on the page', () => {
        render(<PrintSheet company="Muster Guss AG" title="Laufzettel" number="Auftrag 26100013" page={2} pages={3} printedAt={PRINTED}>Inhalt</PrintSheet>)
        const sheet = screen.getByRole('region', { name: 'Laufzettel, Seite 2 von 3' })
        expect(within(sheet).getByText('Muster Guss AG')).toBeInTheDocument()
        expect(within(sheet).getByText('Auftrag 26100013')).toBeInTheDocument()
        expect(sheet).toHaveTextContent('Seite 2 von 3')
        expect(sheet).toHaveTextContent('Gedruckt 29.10.2026 10:30')
    })
})

describe('RunSlip', () => {
    it('shows the number large, the barcode, and the same facts in the same order as the station', () => {
        render(<RunSlip number="26100013 – 3/4" code="26100013-3" customer="Dähler + Blaser" material="INOX" pieces={12} urgency="Dringend" notes={['Steine nicht mitgiessen']} />)
        expect(screen.getByRole('heading', { name: /26100013/ })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Barcode 26100013-3' })).toBeInTheDocument()
        expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Kunde', 'Material', 'Stück', 'Dringlichkeit'])
        expect(screen.getByRole('note')).toHaveTextContent('Steine nicht mitgiessen')
    })

    it('urgency is a word, readable in black and white', () => {
        render(<RunSlip number="26100013 – 3/4" code="26100013-3" customer="Bucherer" material="Silber 925" pieces={2} urgency="Dringend" />)
        expect(screen.getByText('DRINGEND')).toBeInTheDocument()
    })
})

describe('PrintPreview', () => {
    it('says how many pages and prints on request', async () => {
        const onPrint = vi.fn()
        render(<PrintPreview title="Laufzettel" onPrint={onPrint} pages={[<div key="1">1</div>, <div key="2">2</div>]} />)
        expect(screen.getByText('2 Seiten · A4 hoch')).toBeInTheDocument()
        expect(screen.getByText(/tatsächlicher Grösse/)).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Drucken' }))
        expect(onPrint).toHaveBeenCalled()
    })

    it('one page is singular', () => {
        render(<PrintPreview title="Lieferschein" onPrint={vi.fn()} pages={[<div key="1">1</div>]} />)
        expect(screen.getByText('1 Seite · A4 hoch')).toBeInTheDocument()
    })
})
