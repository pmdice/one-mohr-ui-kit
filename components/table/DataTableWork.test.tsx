import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { DataTable, type Column } from './DataTable'
import { BulkBar } from './BulkBar'

type Row = { id: string; no: string }
const rows: Row[] = ['a', 'b', 'c'].map((id, i) => ({ id, no: `26100013 – ${i + 1}/3` }))
const columns: Column<Row>[] = [{ id: 'no', header: 'Nummer', cell: (r) => r.no }]

function Harness({ onOpenRow = vi.fn(), onPrint = vi.fn(), onMenu = vi.fn() }) {
    const [cursorId, setCursorId] = React.useState<string | null>(null)
    const [selected, setSelected] = React.useState<Set<string>>(new Set())
    return (
        <>
            <input aria-label="In Laufzetteln suchen" />
            <DataTable<Row>
                label="Laufzettel" columns={columns} rows={rows} getRowId={(r) => r.id} getRowHref={(r) => `/z/${r.id}`}
                sort={null} onSortChange={vi.fn()} status="ready" onOpenRow={onOpenRow}
                cursorId={cursorId} onCursorChange={setCursorId}
                selected={selected} onSelectedChange={setSelected} rowLabel={(r) => r.no}
                rowAction={(r) => ({ label: 'Drucken', onSelect: () => onPrint(r.id) })}
                rowMenu={(r) => [{ id: 'order', label: 'Zum Auftrag', onSelect: () => onMenu(r.id) }]}
            />
            <p data-testid="selected">{[...selected].join(',')}</p>
        </>
    )
}

const cursorRow = () => document.querySelector('[data-cursor="true"]')

describe('DataTable – keyboard (L-09)', () => {
    it('J/K move the cursor, X selects, Enter opens', async () => {
        const onOpenRow = vi.fn()
        render(<Harness onOpenRow={onOpenRow} />)
        await userEvent.keyboard('j')
        expect(cursorRow()).toHaveTextContent('1/3')
        await userEvent.keyboard('jj')
        expect(cursorRow()).toHaveTextContent('3/3')
        await userEvent.keyboard('k')
        expect(cursorRow()).toHaveTextContent('2/3')
        await userEvent.keyboard('x')
        expect(screen.getByTestId('selected')).toHaveTextContent('b')
        await userEvent.keyboard('{Enter}')
        expect(onOpenRow).toHaveBeenCalledWith('b')
    })

    it('moving the cursor never scrolls the table sideways', async () => {
        const spy = vi.fn()
        Element.prototype.scrollIntoView = spy
        render(<Harness />)
        await userEvent.keyboard('j')
        expect(spy).not.toHaveBeenCalled()
    })

    it('does nothing while typing in the list search', async () => {
        render(<Harness />)
        await userEvent.click(screen.getByRole('textbox', { name: 'In Laufzetteln suchen' }))
        await userEvent.keyboard('jx')
        expect(cursorRow()).toBeNull()
        expect(screen.getByTestId('selected')).toHaveTextContent('')
    })
})

describe('DataTable – selection (L-10)', () => {
    it('has a checkbox per row and a page checkbox with a partial state', async () => {
        render(<Harness />)
        await userEvent.click(screen.getByRole('checkbox', { name: '26100013 – 1/3 auswählen' }))
        const all = screen.getByRole('checkbox', { name: 'Alle auf dieser Seite auswählen' }) as HTMLInputElement
        expect(all.indeterminate).toBe(true)
        await userEvent.click(all)
        expect(screen.getByTestId('selected')).toHaveTextContent('a,b,c')
        expect(all.checked).toBe(true)
        await userEvent.click(all)
        expect(screen.getByTestId('selected')).toHaveTextContent('')
    })
})

describe('DataTable – row actions (L-11)', () => {
    it('shows the main action as labelled button and the rest in a menu, without opening the row', async () => {
        const onOpenRow = vi.fn()
        const onPrint = vi.fn()
        const onMenu = vi.fn()
        render(<Harness onOpenRow={onOpenRow} onPrint={onPrint} onMenu={onMenu} />)
        const row = screen.getByRole('link', { name: '26100013 – 2/3' }).closest('tr')!
        await userEvent.click(within(row).getByRole('button', { name: 'Drucken' }))
        expect(onPrint).toHaveBeenCalledWith('b')
        await userEvent.click(within(row).getByRole('button', { name: 'Weitere Aktionen' }))
        await userEvent.click(screen.getByRole('menuitem', { name: 'Zum Auftrag' }))
        expect(onMenu).toHaveBeenCalledWith('b')
        expect(onOpenRow).not.toHaveBeenCalled()
    })
})

describe('BulkBar', () => {
    it('says how many are selected and how many are not in view', async () => {
        const onClear = vi.fn()
        const onPrint = vi.fn()
        const { rerender } = render(<BulkBar count={3} hiddenCount={0} actions={[{ label: 'Drucken', onSelect: onPrint }]} onClear={onClear} />)
        const bar = screen.getByRole('region', { name: 'Auswahl' })
        expect(bar).toHaveTextContent('3 ausgewählt')
        expect(bar).not.toHaveTextContent('nicht sichtbar')
        await userEvent.click(within(bar).getByRole('button', { name: 'Drucken' }))
        expect(onPrint).toHaveBeenCalled()
        await userEvent.click(within(bar).getByRole('button', { name: 'Auswahl aufheben' }))
        expect(onClear).toHaveBeenCalled()
        rerender(<BulkBar count={3} hiddenCount={2} actions={[]} onClear={onClear} />)
        expect(screen.getByRole('region', { name: 'Auswahl' })).toHaveTextContent('3 ausgewählt · 2 nicht sichtbar')
    })
})
