import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { SlipList } from './SlipList'
import { querySlips, SLIPS, type SlipQuery, type SlipResult } from './slips'

const instant = async (q: SlipQuery) => querySlips(q)
const table = () => screen.getByRole('table', { name: 'Laufzettel' })
const dataRows = () => within(table()).getAllByRole('row').slice(1)

describe('SlipList example', () => {
    it('sorts the way work is done: urgent first', async () => {
        render(<SlipList loader={instant} />)
        await waitFor(() => expect(dataRows().length).toBeGreaterThan(0))
        expect(dataRows()[0]).toHaveTextContent('Dringend')
        expect(screen.getByText(`${SLIPS.length} Laufzettel`)).toBeInTheDocument()
    })

    it('shows a filter as chip and counts the hits', async () => {
        render(<SlipList loader={instant} initial="/laufzettel?f=station:guss" />)
        expect(await screen.findByText('Station: Guss')).toBeInTheDocument()
        const hits = SLIPS.filter((s) => s.station === 'guss').length
        expect(await screen.findByText(`${hits} von ${SLIPS.length} Laufzettel`)).toBeInTheDocument()
    })

    it('keeps the selection across pages and clears it when filters change', async () => {
        render(<SlipList loader={instant} />)
        await waitFor(() => expect(dataRows().length).toBeGreaterThan(3))
        const boxes = within(table()).getAllByRole('checkbox').slice(1, 4)
        for (const box of boxes) await userEvent.click(box)
        expect(screen.getByRole('region', { name: 'Auswahl' })).toHaveTextContent('3 ausgewählt')
        await userEvent.click(screen.getByRole('button', { name: 'Nächste Seite' }))
        await waitFor(() => expect(screen.getByRole('region', { name: 'Auswahl' })).toHaveTextContent('3 ausgewählt · 3 nicht sichtbar'))
        await userEvent.type(screen.getByRole('searchbox', { name: 'In Laufzetteln suchen' }), '2610')
        await waitFor(() => expect(screen.queryByRole('region', { name: 'Auswahl' })).toBeNull())
    })

    it('never shows an older page over a newer one', async () => {
        const pending: Record<number, () => void> = {}
        const loader = (q: SlipQuery) => q.page === 1
            ? Promise.resolve(querySlips(q))
            : new Promise<SlipResult>((resolve) => { pending[q.page] = () => resolve(querySlips(q)) })
        render(<SlipList loader={loader} />)
        await waitFor(() => expect(dataRows().length).toBeGreaterThan(0))
        await userEvent.click(screen.getByRole('button', { name: 'Nächste Seite' }))
        await userEvent.click(screen.getByRole('button', { name: 'Nächste Seite' }))
        await act(async () => { pending[3]() })
        const page3First = dataRows()[0].textContent
        await act(async () => { pending[2]() })
        expect(dataRows()[0].textContent).toBe(page3First)
        expect(screen.getByText(/^51–75 von/)).toBeInTheDocument()
    })

    it('says when filters hide everything and offers to reset them', async () => {
        render(<SlipList loader={instant} initial="/laufzettel?q=zzzz" />)
        expect(await screen.findByText('Keine Laufzettel für diese Filter')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Filter zurücksetzen' }))
        await waitFor(() => expect(dataRows().length).toBeGreaterThan(0))
    })
})
