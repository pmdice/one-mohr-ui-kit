import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PrintExport } from './PrintExport'
import { SLIPS } from '@/components/table/examples/slips'

describe('Beispiel: Druck & Export', () => {
    it('exports exactly the filtered list with a speaking file name', async () => {
        const onDownload = vi.fn()
        render(<PrintExport today="2026-10-29" onDownload={onDownload} onPrint={vi.fn()} />)
        await userEvent.click(screen.getByRole('radio', { name: 'Guss' }))
        const guss = SLIPS.filter((s) => s.station === 'guss')
        await userEvent.click(screen.getByRole('button', { name: 'Exportieren' }))
        expect(screen.getByRole('menu')).toHaveTextContent(`${guss.length} Laufzettel · Station: Guss`)
        await userEvent.click(screen.getByRole('menuitem', { name: /Für Excel/ }))
        const [csv, filename] = onDownload.mock.calls[0]
        expect(filename).toBe('Laufzettel_Station-Guss_2026-10-29.csv')
        expect(csv.slice(1).split('\r\n')).toHaveLength(guss.length + 1)
    })

    it('prints the run slips of the filtered list, four per page', async () => {
        render(<PrintExport today="2026-10-29" onDownload={vi.fn()} onPrint={vi.fn()} />)
        await userEvent.click(screen.getByRole('radio', { name: 'Guss' }))
        await userEvent.click(screen.getByRole('button', { name: /Laufzettel drucken/ }))
        const preview = screen.getByRole('region', { name: 'Druckvorschau' })
        const count = Math.min(SLIPS.filter((s) => s.station === 'guss').length, 8)
        expect(within(preview).getAllByRole('img', { name: /^Barcode / })).toHaveLength(count)
        expect(within(preview).getByText(`${Math.ceil(count / 4)} Seiten · A4 hoch`)).toBeInTheDocument()
    })
})
