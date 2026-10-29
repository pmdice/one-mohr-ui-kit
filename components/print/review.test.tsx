import { readFileSync } from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Barcode } from './Barcode'
import { RunSlip } from './RunSlip'
import { PrintPreview } from './PrintPreview'
import { toCsv } from './csv'

const css = readFileSync(path.resolve(__dirname, '../../app/globals.css'), 'utf8')

describe('review fixes: print', () => {
    it('print styles touch only pages that have something to print, and never scale the sheets', () => {
        expect(css).not.toMatch(/body \* \{ visibility: hidden/)
        expect(css).toMatch(/@page sheet/)
        expect(css).not.toMatch(/^@page \{/m)
    })

    it('the copy for the printer is real size, outside the scaled screen preview', () => {
        render(<PrintPreview title="Laufzettel" onPrint={() => {}} pages={[<div key="1">Blatt 1</div>]} />)
        const root = document.querySelector('.print-root')!
        expect(root.parentElement).toBe(document.body)
        expect(root.innerHTML).not.toMatch(/scale/)
        expect(root).toHaveTextContent('Blatt 1')
    })

    it('a value the barcode cannot carry shows a box with the reason instead of breaking the page', () => {
        render(<Barcode value="Größe" />)
        expect(screen.getByRole('img', { name: 'Barcode nicht druckbar: Größe' })).toHaveTextContent('Zeichen „ö“ kann nicht als Barcode gedruckt werden')
    })

    it('notes come right after the barcode, before the facts, as on the station (W-05)', () => {
        render(<RunSlip number="1" code="1" customer="K" material="M" pieces={1} urgency="Normal" notes={['Achtung']} />)
        const note = screen.getByRole('note')
        const firstTerm = screen.getAllByRole('term')[0]
        expect(note.compareDocumentPosition(firstTerm) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it('text that Excel would run as a formula is defused', () => {
        const csv = toCsv([{ v: '=HYPERLINK("http://x")' }, { v: '+41 79 123 45 67' }, { v: '@SUM(A1)' }], [{ label: 'Wert', value: (r: { v: string }) => r.v }])
        expect(csv).toContain(`"'=HYPERLINK(""http://x"")"`)
        expect(csv).toContain("'+41 79 123 45 67")
        expect(csv).toContain("'@SUM(A1)")
    })

    it('identifiers with leading zeros survive a double click in Excel', () => {
        const csv = toCsv([{ no: '00123' }, { no: '26100013-3' }], [{ label: 'Nummer', kind: 'text', value: (r: { no: string }) => r.no }])
        expect(csv).toContain('\r\n="00123"\r\n')
        expect(csv).toContain('\r\n"26100013-3"')
    })
})
