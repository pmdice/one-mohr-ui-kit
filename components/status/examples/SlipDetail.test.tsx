import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { SlipDetail } from './SlipDetail'
import { NOW } from './slip'

const scan = async (code: string, station?: string) => {
    if (station) await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Diese Station' }), station)
    await userEvent.type(screen.getByRole('textbox', { name: 'Code scannen' }), `${code}{Enter}`)
}
const head = () => screen.getByRole('banner')
const tab = async (name: string) => userEvent.click(within(screen.getByRole('navigation', { name: 'Seitenbereiche' })).getByRole('link', { name: new RegExp(`^${name}`) }))

describe('SlipDetail', () => {
    it('shows status and place apart, each with since when, and the overdue station', () => {
        render(<SlipDetail now={NOW} />)
        expect(within(head()).getByRole('heading', { name: '26100013 – 1/4' })).toBeInTheDocument()
        expect(head()).toHaveTextContent('In Arbeit')
        expect(head()).toHaveTextContent('An Station Guss')
        expect(head()).toHaveTextContent('seit 5 h')
        expect(head()).toHaveTextContent('Länger als üblich (Richtzeit 4 h)')
    })

    it('blocks Fertig melden at a station and says why, allows it after scanning out', async () => {
        render(<SlipDetail now={NOW} />)
        expect(screen.getByRole('button', { name: 'Fertig melden' })).toBeDisabled()
        expect(screen.getByText('Fertig melden geht erst nach dem Ausscannen')).toBeInTheDocument()
        await scan('26100013-1/4', 'guss')
        expect(screen.getByText('26100013 – 1/4 ausgescannt aus Guss')).toBeInTheDocument()
        expect(head()).toHaveTextContent('Unterwegs, zuletzt Guss')
        expect(screen.getByRole('button', { name: 'Fertig melden' })).toBeEnabled()
    })

    it('a scan of an open slip of the order sets it to In Arbeit and writes the history', async () => {
        render(<SlipDetail now={NOW} />)
        await scan('26100013 – 3/4', 'guss')
        expect(screen.getByText('26100013 – 3/4 eingescannt in Guss')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('link', { name: '26100013 – 3/4' }))
        expect(head()).toHaveTextContent('In Arbeit')
        expect(head()).toHaveTextContent('An Station Guss')
        await tab('Verlauf')
        const log = screen.getByRole('list', { name: 'Verlauf' })
        expect(log).toHaveTextContent('hat eingescannt in Guss · per Scan (Tablet Guss)')
        expect(log).toHaveTextContent('System hat Status von Offen auf In Arbeit gesetzt · automatisch')
    })

    it('Fertig melden updates the order card and can be undone, which is a new entry', async () => {
        render(<SlipDetail now={NOW} />)
        const card = () => screen.getByRole('region', { name: 'Auftrag 26100013' })
        expect(card()).toHaveTextContent('1 von 4 Laufzetteln erledigt')
        await scan('26100013-1/4', 'guss')
        await userEvent.click(screen.getByRole('button', { name: 'Fertig melden' }))
        expect(head()).toHaveTextContent('Fertig')
        expect(card()).toHaveTextContent('2 von 4 Laufzetteln erledigt')
        expect(screen.getByRole('note')).toHaveTextContent('Felder sind gesperrt')
        await userEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))
        expect(head()).toHaveTextContent('In Arbeit')
        expect(card()).toHaveTextContent('1 von 4 Laufzetteln erledigt')
        await tab('Verlauf')
        expect(screen.getByRole('list', { name: 'Verlauf' })).toHaveTextContent('hat Status von Fertig auf In Arbeit gesetzt – Rückgängig gemacht')
    })

    it('a new change replaces the undo of the previous one', async () => {
        render(<SlipDetail now={NOW} />)
        await scan('26100013-1/4', 'guss')
        await userEvent.click(screen.getByRole('button', { name: 'Fertig melden' }))
        await userEvent.click(screen.getByRole('button', { name: 'Wieder öffnen' }))
        expect(screen.getAllByRole('button', { name: 'Rückgängig' })).toHaveLength(1)
        expect(screen.getByText('Status auf In Arbeit gesetzt')).toBeInTheDocument()
    })

    it('canceling asks with consequences and a required reason, then locks the fields', async () => {
        render(<SlipDetail now={NOW} />)
        await userEvent.click(screen.getByRole('button', { name: /Status ändern/ }))
        await userEvent.click(screen.getByRole('menuitem', { name: 'Stornieren' }))
        const dialog = screen.getByRole('alertdialog', { name: '26100013 – 1/4 stornieren?' })
        await userEvent.click(within(dialog).getByRole('button', { name: 'Stornieren' }))
        expect(dialog).toBeInTheDocument()
        await userEvent.type(within(dialog).getByRole('textbox', { name: /Grund/ }), 'Kunde hat abgesagt')
        await userEvent.click(within(dialog).getByRole('button', { name: 'Stornieren' }))
        expect(screen.queryByRole('alertdialog')).toBeNull()
        expect(screen.getByRole('note')).toHaveTextContent('Storniert am 26.10.2026 von P. Mohr: Kunde hat abgesagt. Felder sind gesperrt.')
        expect(screen.getByRole('textbox', { name: 'Gewicht (g)' })).toHaveAttribute('readonly')
        expect(screen.queryByRole('button', { name: 'Rückgängig' })).toBeNull()
    })

    it('a locked slip that may not be reopened says who may', () => {
        render(<SlipDetail now={NOW} initial="done-locked" />)
        expect(screen.getByRole('note')).toHaveTextContent('Wieder öffnen können Admins.')
        expect(screen.queryByRole('button', { name: 'Wieder öffnen' })).toBeNull()
    })

    it('scanning a closed slip is refused with the reason', async () => {
        render(<SlipDetail now={NOW} />)
        await scan('26100013-2/4', 'guss')
        expect(screen.getByRole('alert')).toHaveTextContent('26100013 – 2/4 ist fertig. Kein Scan möglich.')
    })

    it('a field change is written to the history', async () => {
        render(<SlipDetail now={NOW} />)
        const weight = screen.getByRole('textbox', { name: 'Gewicht (g)' })
        await userEvent.clear(weight)
        await userEvent.type(weight, '420')
        await userEvent.tab()
        expect(screen.getByRole('list', { name: 'Verlauf' })).toHaveTextContent('P. Mohr hat Gewicht (g) von 412 auf 420 geändert')
    })

    it('a scan at the next station closes the visit before and extends the route', async () => {
        render(<SlipDetail now={NOW} />)
        await scan('26100013-1/4', 'polissage')
        expect(head()).toHaveTextContent('An Station Polissage')
        await tab('Durchlauf')
        const items = within(screen.getByRole('list', { name: 'Durchlauf' })).getAllByRole('listitem')
        expect(items.map((i) => i.querySelector('[data-station]')!.textContent)).toEqual(['3D', 'Guss', 'Polissage'])
    })
})
