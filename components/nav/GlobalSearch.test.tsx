import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { GlobalSearch } from './GlobalSearch'
import { searchRecords, type SearchRecord } from './search'

const records: SearchRecord[] = [
    { type: 'order', id: 'o1', title: '#26100013 DÄHLER + BLASER', href: '/auftraege/26100013', identifiers: ['26100013'], text: ['DÄHLER + BLASER'] },
    ...[1, 2].map((n) => ({
        type: 'slip', id: `s${n}`, title: `Laufzettel ${n}/2 INOX`, context: 'Auftrag #26100013 DÄHLER + BLASER',
        href: `/auftraege/26100013/laufzettel/${n}`, identifiers: [`26100013 – ${n}/2`, `26100013-${n}`],
    })),
]
const labels = { order: 'Aufträge', slip: 'Laufzettel' }
const local = async (q: string) => searchRecords(records, q, { typeOrder: ['order', 'slip'] })

function setup(search = local) {
    const onNavigate = vi.fn()
    render(<><input aria-label="Anderes Feld" /><GlobalSearch search={search} typeLabels={labels} onNavigate={onNavigate} /></>)
    return { onNavigate, input: screen.getByRole('combobox', { name: 'Suchen' }) }
}

describe('GlobalSearch', () => {
    it('Enter on a typed number opens that record directly', async () => {
        const { onNavigate, input } = setup()
        await userEvent.type(input, '26100013-2')
        await screen.findByRole('option', { name: /Laufzettel 2\/2/ })
        await userEvent.keyboard('{Enter}')
        expect(onNavigate).toHaveBeenCalledWith('/auftraege/26100013/laufzettel/2')
    })

    it('shows what a result belongs to, grouped by type', async () => {
        const { input } = setup()
        await userEvent.type(input, '26100013')
        const option = await screen.findByRole('option', { name: /Laufzettel 1\/2/ })
        expect(option).toHaveTextContent('Auftrag #26100013 DÄHLER + BLASER')
        expect(screen.getByRole('group', { name: 'Laufzettel' })).toBeInTheDocument()
        expect(screen.getAllByRole('option')[0]).toHaveTextContent('#26100013 DÄHLER + BLASER')
    })

    it('/ focuses search from anywhere but another input; Ctrl+K always', async () => {
        const { input } = setup()
        await userEvent.click(document.body)
        await userEvent.keyboard('/')
        expect(input).toHaveFocus()
        await userEvent.click(screen.getByLabelText('Anderes Feld'))
        await userEvent.keyboard('/')
        expect(screen.getByLabelText('Anderes Feld')).toHaveValue('/')
        await userEvent.keyboard('{Control>}k{/Control}')
        expect(input).toHaveFocus()
    })

    it('Escape closes the list', async () => {
        const { input } = setup()
        await userEvent.type(input, '26100013')
        await screen.findAllByRole('option')
        await userEvent.keyboard('{Escape}')
        expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('never shows an older answer over a newer one', async () => {
        let releaseOld: () => void = () => {}
        const search = vi.fn(async (q: string) => {
            if (q === '2610') await new Promise<void>((r) => { releaseOld = r })
            return local(q)
        })
        const { input } = setup(search)
        await userEvent.type(input, '2610')
        await waitFor(() => expect(search).toHaveBeenCalledWith('2610'))
        await userEvent.clear(input)
        await userEvent.type(input, '26100013-2')
        await screen.findByRole('option', { name: /Laufzettel 2\/2/ })
        await act(async () => { releaseOld() })
        expect(screen.getAllByRole('option')).toHaveLength(1)
    })
})
