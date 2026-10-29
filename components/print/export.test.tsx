import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { exportFilename, toCsv } from './csv'
import { ExportMenu } from './ExportMenu'

type Row = { no: string; customer: string; pieces: number | null; weight: number | null; date: string | null; note: string }
const COLUMNS = [
    { label: 'Nummer', kind: 'text' as const, value: (r: Row) => r.no },
    { label: 'Kunde', value: (r: Row) => r.customer },
    { label: 'Stück', kind: 'number' as const, value: (r: Row) => r.pieces },
    { label: 'Gewicht (g)', kind: 'number' as const, value: (r: Row) => r.weight },
    { label: 'Gussdatum', kind: 'date' as const, value: (r: Row) => r.date },
    { label: 'Notiz', value: (r: Row) => r.note },
]

describe('toCsv', () => {
    const csv = toCsv([
        { no: '00123', customer: 'Dähler + Blaser', pieces: 1200, weight: 412.5, date: '2026-11-14', note: 'Steine; nicht "mitgiessen"\nzweite Zeile' },
        { no: '26100013-3', customer: 'Bucherer', pieces: null, weight: null, date: null, note: '' },
    ], COLUMNS)

    it('starts with a BOM so Excel reads UTF-8', () => {
        expect(csv.charCodeAt(0)).toBe(0xfeff)
    })

    it('uses semicolons and CRLF', () => {
        const lines = csv.slice(1).split('\r\n')
        expect(lines[0]).toBe('Nummer;Kunde;Stück;Gewicht (g);Gussdatum;Notiz')
    })

    it('numbers without grouping and with a point, dates as TT.MM.JJJJ, empty for missing', () => {
        const second = csv.slice(1).split('\r\n')[2]
        expect(second).toBe('"26100013-3";Bucherer;;;;')
        expect(csv).toContain(';1200;412.5;14.11.2026;')
    })

    it('keeps leading zeros of identifiers by quoting them as text', () => {
        expect(csv).toContain('\r\n"00123";')
    })

    it('quotes values with separators, quotes or line breaks', () => {
        expect(csv).toContain('"Steine; nicht ""mitgiessen""\nzweite Zeile"')
    })
})

describe('exportFilename', () => {
    it('says what and when, without characters a file system refuses', () => {
        expect(exportFilename(['Laufzettel', 'Station Guss'], '2026-10-29', 'csv')).toBe('Laufzettel_Station-Guss_2026-10-29.csv')
        expect(exportFilename(['Aufträge', 'Kunde: Dähler/Blaser'], '2026-10-29', 'csv')).toBe('Aufträge_Kunde-Dähler-Blaser_2026-10-29.csv')
    })
})

describe('ExportMenu', () => {
    it('says what will be exported before it happens', async () => {
        const onExport = vi.fn()
        render(<ExportMenu count={124} noun="Laufzettel" filters={['Station: Guss', 'Dringlichkeit: Dringend']} onExport={onExport} />)
        await userEvent.click(screen.getByRole('button', { name: 'Exportieren' }))
        expect(screen.getByRole('menu')).toHaveTextContent('124 Laufzettel · Station: Guss, Dringlichkeit: Dringend')
        await userEvent.click(screen.getByRole('menuitem', { name: /Für Excel \(CSV\)/ }))
        expect(onExport).toHaveBeenCalledWith('csv')
    })

    it('without filters says all', async () => {
        render(<ExportMenu count={300} noun="Laufzettel" filters={[]} onExport={vi.fn()} />)
        await userEvent.click(screen.getByRole('button', { name: 'Exportieren' }))
        expect(screen.getByRole('menu')).toHaveTextContent('Alle 300 Laufzettel')
    })
})
