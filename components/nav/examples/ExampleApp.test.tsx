import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ExampleApp } from './ExampleApp'

const ORDER = '#26100013 DÄHLER + BLASER'

const pathTexts = () => within(screen.getByRole('navigation', { name: 'Pfad' })).getAllByRole('listitem').map((li) => li.textContent)
const menuCurrent = () => within(screen.getByRole('navigation', { name: 'Hauptmenü' }))
    .getAllByRole('link').filter((l) => l.getAttribute('aria-current') === 'page').map((l) => l.textContent)

describe('ExampleApp', () => {
    it('shows the same path for a slip however it was reached (N-01)', async () => {
        // 1: list → order → tab → slip
        const first = render(<ExampleApp initial="/auftraege" />)
        await userEvent.click(screen.getByRole('link', { name: ORDER }))
        await userEvent.click(within(screen.getByRole('navigation', { name: 'Seitenbereiche' })).getByRole('link', { name: /Laufzettel/ }))
        await userEvent.click(screen.getByRole('link', { name: /Laufzettel 1\/4/ }))
        expect(pathTexts()).toEqual(['Aufträge', ORDER, 'Laufzettel 1/4'])
        first.unmount()

        // 2: slip list
        const second = render(<ExampleApp initial="/laufzettel?q=26100013" />)
        await userEvent.click(screen.getByRole('link', { name: /Laufzettel 1\/4/ }))
        expect(pathTexts()).toEqual(['Aufträge', ORDER, 'Laufzettel 1/4'])
        expect(menuCurrent()).toEqual(['Laufzettel'])
        second.unmount()

        // 3: global search
        render(<ExampleApp initial="/auftraege" />)
        await userEvent.type(screen.getByRole('combobox', { name: 'Suchen' }), '26100013-1')
        await screen.findByRole('option', { name: /Laufzettel 1\/4/ })
        await userEvent.keyboard('{Enter}')
        expect(pathTexts()).toEqual(['Aufträge', ORDER, 'Laufzettel 1/4'])
        expect(menuCurrent()).toEqual(['Aufträge'])
    })

    it('goes back to the very list it came from (N-03)', async () => {
        render(<ExampleApp initial="/auftraege?view=offen&q=BLASER" />)
        await userEvent.click(screen.getByRole('link', { name: ORDER }))
        const back = screen.getByRole('link', { name: /Offen · Aufträge/ })
        await userEvent.click(back)
        expect(screen.getByRole('link', { name: /Offen/, current: true })).toBeInTheDocument()
        expect(screen.getByRole('searchbox', { name: 'In Aufträgen suchen' })).toHaveValue('BLASER')
        expect(screen.getByRole('link', { name: ORDER }).closest('tr')).toHaveAttribute('data-highlighted', 'true')
    })

    it('pages through the slips of an order with J (N-04)', async () => {
        render(<ExampleApp initial="/auftraege/26100013/laufzettel/1" />)
        expect(screen.getByText('1/4 im Auftrag')).toBeInTheDocument()
        await userEvent.keyboard('j')
        expect(pathTexts().at(-1)).toBe('Laufzettel 2/4')
    })

    it('back after paging past the list page lands on the page of the current record (N-03)', async () => {
        render(<ExampleApp initial="/auftraege" />)
        await userEvent.click(screen.getByRole('link', { name: /^#26100011/ }))
        await userEvent.keyboard('j')
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('#26100010')
        await userEvent.click(screen.getByRole('link', { name: /Alle · Aufträge/ }))
        expect(screen.getByText('Seite 2 von 2')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /^#26100010/ }).closest('tr')).toHaveAttribute('data-highlighted', 'true')
    })
})
