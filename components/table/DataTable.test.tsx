import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DataTable, type Column, type Sort } from './DataTable'

type Row = { id: string; no: string; customer: string; weight: number | null }
const LONG = 'K'.repeat(120)
const rows: Row[] = [
    { id: 'a', no: '26100013 – 1/4', customer: LONG, weight: 1234 },
    { id: 'b', no: '26100013 – 2/4', customer: 'MEIER', weight: null },
]
const columns: Column<Row>[] = [
    { id: 'no', header: 'Nummer', cell: (r) => r.no },
    { id: 'customer', header: 'Kunde', cell: (r) => <a href={`/k/${r.id}`}>{r.customer}</a>, truncate: true, title: (r) => r.customer },
    { id: 'weight', header: 'Gewicht (g)', cell: (r) => r.weight ?? '—', align: 'right', sortable: true },
]

function setup(props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) {
    const onOpenRow = vi.fn()
    const onSortChange = vi.fn()
    render(
        <DataTable<Row>
            label="Laufzettel" columns={columns} rows={rows} getRowId={(r) => r.id} getRowHref={(r) => `/z/${r.id}`}
            sort={null} onSortChange={onSortChange} status="ready" onOpenRow={onOpenRow}
            {...props}
        />
    )
    return { onOpenRow, onSortChange }
}

describe('DataTable – reading', () => {
    it('links the identifier in the first column', () => {
        setup()
        expect(screen.getByRole('link', { name: '26100013 – 1/4' })).toHaveAttribute('href', '/z/a')
    })

    it('keeps every row on one line', () => {
        setup()
        expect(screen.getByRole('cell', { name: '1234' }).className).toContain('whitespace-nowrap')
        expect(screen.getByRole('columnheader', { name: /Gewicht/ }).className).toContain('whitespace-nowrap')
    })

    it('right-aligns numbers', () => {
        setup()
        const cell = screen.getByRole('cell', { name: '1234' })
        expect(cell.className).toContain('text-right')
        expect(cell.className).toContain('tabular-nums')
    })

    it('truncates long values and keeps them in the title', () => {
        setup()
        const cell = screen.getByRole('link', { name: LONG }).closest('td')!
        expect(cell.firstElementChild!.className).toContain('truncate')
        expect(cell.firstElementChild).toHaveAttribute('title', LONG)
    })
})

describe('DataTable – sorting', () => {
    it('cycles asc → desc → default and shows it in aria-sort', async () => {
        const { onSortChange } = setup()
        const header = screen.getByRole('columnheader', { name: /Gewicht/ })
        expect(header).toHaveAttribute('aria-sort', 'none')
        await userEvent.click(within(header).getByRole('button'))
        expect(onSortChange).toHaveBeenLastCalledWith({ id: 'weight', dir: 'asc' })
    })

    it.each<[Sort, Sort, string]>([
        [{ id: 'weight', dir: 'asc' }, { id: 'weight', dir: 'desc' }, 'ascending'],
        [{ id: 'weight', dir: 'desc' }, null, 'descending'],
    ])('from %j goes to %j', async (current, next, aria) => {
        const { onSortChange } = setup({ sort: current })
        const header = screen.getByRole('columnheader', { name: /Gewicht/ })
        expect(header).toHaveAttribute('aria-sort', aria)
        await userEvent.click(within(header).getByRole('button'))
        expect(onSortChange).toHaveBeenLastCalledWith(next)
    })
})

describe('DataTable – loading', () => {
    it('shows skeleton rows on first load', () => {
        setup({ status: 'loading', rows: [] })
        expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
        expect(screen.queryByRole('link', { name: /26100013/ })).toBeNull()
        expect(document.querySelectorAll('[data-skeleton]').length).toBeGreaterThan(0)
    })

    it('keeps the rows while reloading', () => {
        setup({ status: 'reloading' })
        expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true')
        expect(screen.getByRole('link', { name: '26100013 – 1/4' })).toBeInTheDocument()
    })
})

describe('DataTable – row click', () => {
    it('opens on a click in the row, but not on its links and buttons', async () => {
        const { onOpenRow } = setup()
        await userEvent.click(screen.getByRole('cell', { name: '1234' }))
        expect(onOpenRow).toHaveBeenCalledWith('a')
        onOpenRow.mockClear()
        await userEvent.click(screen.getByRole('link', { name: 'MEIER' }))
        await userEvent.click(screen.getByRole('link', { name: '26100013 – 2/4' }))
        expect(onOpenRow).not.toHaveBeenCalled()
    })
})

describe('DataTable – identifier column after a narrow lead column', () => {
    it('links and pins the identifier column, and pins the columns before it', () => {
        const lead: Column<Row>[] = [{ id: 'urg', header: 'Dringlichkeit', width: '6rem', cell: () => 'Hoch' }, ...columns]
        render(
            <DataTable<Row> label="L" columns={lead} rows={rows} getRowId={(r) => r.id} getRowHref={(r) => `/z/${r.id}`}
                identifierColumn="no" sort={null} onSortChange={vi.fn()} status="ready" />
        )
        const link = screen.getByRole('link', { name: '26100013 – 1/4' })
        const idCell = link.closest('td')!
        expect(idCell.className).toContain('sticky')
        expect(idCell.style.left).toContain('6rem')
        expect(screen.getAllByRole('cell', { name: 'Hoch' })[0].className).toContain('sticky')
        expect(screen.queryByRole('link', { name: 'Hoch' })).toBeNull()
    })

describe('DataTable – review fixes', () => {
    it('shows the default sort in the header and leaves it on the first click', async () => {
        const onSortChange = vi.fn()
        render(<DataTable<Row> label="L" columns={columns} rows={rows} getRowId={(r) => r.id} sort={null} defaultSort={{ id: 'weight', dir: 'desc' }}
            onSortChange={onSortChange} status="ready" />)
        const header = screen.getByRole('columnheader', { name: /Gewicht/ })
        expect(header).toHaveAttribute('aria-sort', 'descending')
        await userEvent.click(within(header).getByRole('button'))
        expect(onSortChange).toHaveBeenLastCalledWith({ id: 'weight', dir: 'asc' })
    })

    it('a click beside the checkbox or the actions does not open the row', async () => {
        const onOpenRow = vi.fn()
        const onSelectedChange = vi.fn()
        render(<DataTable<Row> label="L" columns={columns} rows={rows} getRowId={(r) => r.id} sort={null} onSortChange={vi.fn()} status="ready"
            onOpenRow={onOpenRow} selected={new Set()} onSelectedChange={onSelectedChange} rowLabel={(r) => r.no}
            rowAction={() => ({ label: 'Drucken', onSelect: vi.fn() })} />)
        const box = screen.getByRole('checkbox', { name: '26100013 – 1/4 auswählen' })
        await userEvent.click(box.closest('td')!)
        expect(onSelectedChange).toHaveBeenCalled()
        await userEvent.click(screen.getAllByRole('button', { name: 'Drucken' })[0].closest('td')!)
        expect(onOpenRow).not.toHaveBeenCalled()
    })
})
})
