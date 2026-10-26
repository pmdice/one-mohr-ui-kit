import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FilterBar, type FilterField } from './FilterBar'

const fields: FilterField[] = [
    { id: 'station', label: 'Station', options: [{ value: 'guss', label: 'Guss' }, { value: '3d', label: '3D' }] },
    { id: 'material', label: 'Material', options: [{ value: 'inox', label: 'INOX' }] },
]

describe('FilterBar', () => {
    it('shows each active filter as a removable chip', async () => {
        const onChange = vi.fn()
        render(<FilterBar fields={fields} active={[{ field: 'station', value: 'guss' }]} onChange={onChange} total={312} filteredTotal={27} noun="Laufzettel" />)
        expect(screen.getByText('Station: Guss')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Filter Station: Guss entfernen' }))
        expect(onChange).toHaveBeenCalledWith([])
        expect(screen.queryByRole('button', { name: 'Alle zurücksetzen' })).toBeNull()
    })

    it('offers reset from two filters on', async () => {
        const onChange = vi.fn()
        render(<FilterBar fields={fields} active={[{ field: 'station', value: 'guss' }, { field: 'material', value: 'inox' }]} onChange={onChange} total={312} filteredTotal={4} noun="Laufzettel" />)
        await userEvent.click(screen.getByRole('button', { name: 'Alle zurücksetzen' }))
        expect(onChange).toHaveBeenCalledWith([])
    })

    it('counts filtered and unfiltered', () => {
        const { rerender } = render(<FilterBar fields={fields} active={[{ field: 'station', value: 'guss' }]} onChange={vi.fn()} total={312} filteredTotal={27} noun="Laufzettel" />)
        expect(screen.getByText('27 von 312 Laufzettel')).toBeInTheDocument()
        rerender(<FilterBar fields={fields} active={[]} onChange={vi.fn()} total={312} filteredTotal={312} noun="Laufzettel" />)
        expect(screen.getByText('312 Laufzettel')).toBeInTheDocument()
    })

    it('adds a filter by field and value, ignoring duplicates', async () => {
        const onChange = vi.fn()
        render(<FilterBar fields={fields} active={[{ field: 'station', value: 'guss' }]} onChange={onChange} total={312} filteredTotal={27} noun="Laufzettel" />)
        await userEvent.click(screen.getByRole('button', { name: '+ Filter' }))
        const dialog = screen.getByRole('dialog', { name: 'Filter hinzufügen' })
        await userEvent.selectOptions(within(dialog).getByRole('combobox', { name: 'Feld' }), 'station')
        await userEvent.selectOptions(within(dialog).getByRole('combobox', { name: 'Wert' }), '3d')
        await userEvent.click(within(dialog).getByRole('button', { name: 'Hinzufügen' }))
        expect(onChange).toHaveBeenLastCalledWith([{ field: 'station', value: 'guss' }, { field: 'station', value: '3d' }])
    })
})
