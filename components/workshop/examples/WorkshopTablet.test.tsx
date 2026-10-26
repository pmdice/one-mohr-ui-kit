import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { WorkshopTablet } from './WorkshopTablet'
import { NOW } from '@/components/status/examples/slip'

const hold = (n: string) => userEvent.click(screen.getByRole('button', { name: `${n} vor die Kamera halten` }))
const here = () => screen.getByRole('list', { name: /^Jetzt an Guss/ })
const setup = (props: Partial<React.ComponentProps<typeof WorkshopTablet>> = {}) => render(<WorkshopTablet now={NOW} dedupeMs={0} sound={false} {...props} />)

describe('WorkshopTablet', () => {
    it('asks for the station first and shows it big afterwards', async () => {
        setup({ initial: 'setup' })
        expect(screen.getByRole('heading', { name: 'An welcher Station steht dieses Tablet?' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /vor die Kamera halten/ })).toBeNull()
        await userEvent.click(screen.getByRole('button', { name: 'Polissage' }))
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Station Polissage')
    })

    it('a scan says EIN, shows the card and the slip joins the list', async () => {
        setup()
        expect(screen.getByRole('heading', { name: 'Jetzt an Guss (1)' })).toBeInTheDocument()
        await hold('26100013 – 3/4')
        expect(screen.getByText('EIN')).toBeInTheDocument()
        expect(screen.getByText('26100013 – 3/4 eingescannt in Guss')).toBeInTheDocument()
        expect(screen.getByRole('region', { name: '26100013 – 3/4' })).toHaveTextContent('Eisen')
        expect(within(here()).getAllByRole('button').map((b) => b.querySelector('.font-mono')!.textContent)).toEqual(['26100013 – 1/4', '26100013 – 3/4'])
        await hold('26100013 – 3/4')
        expect(screen.getByText('AUS')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Jetzt an Guss (1)' })).toBeInTheDocument()
    })

    it('shows the note of a slip as a warning', async () => {
        setup()
        await hold('26100013 – 1/4')
        expect(screen.getByRole('note')).toHaveTextContent('Steine nicht mitgiessen')
    })

    it('errors say what to do next', async () => {
        setup()
        await userEvent.click(screen.getByRole('button', { name: 'Unbekannter Code vor die Kamera halten' }))
        expect(screen.getByRole('alert')).toHaveTextContent('Nummer unten eintippen oder Zettel ins Büro bringen.')
        await hold('26100013 – 2/4')
        expect(screen.getByRole('alert')).toHaveTextContent('26100013 – 2/4 ist fertig. Kein Scan möglich.Zettel ins Büro bringen.')
    })

    it('typing the number works like a scan', async () => {
        setup()
        await userEvent.type(screen.getByRole('textbox', { name: 'Nummer eintippen' }), '26100013-3/4{Enter}')
        expect(screen.getByText('26100013 – 3/4 eingescannt in Guss')).toBeInTheDocument()
    })

    it('without connection a scan is kept and sent when it is back', async () => {
        setup()
        await userEvent.click(screen.getByRole('switch', { name: 'Verbindung' }))
        await hold('26100013 – 3/4')
        expect(screen.getByText('Gespeichert, wird gesendet, sobald die Verbindung zurück ist.')).toBeInTheDocument()
        expect(screen.getByText('1 Scan wartet auf Verbindung')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Jetzt an Guss (2)' })).toBeInTheDocument()
        await userEvent.click(screen.getByRole('switch', { name: 'Verbindung' }))
        expect(await screen.findByRole('heading', { name: 'Jetzt an Guss (2)' })).toBeInTheDocument()
        expect(screen.queryByText(/wartet auf Verbindung/)).toBeNull()
    })

    it('a scan can be taken back, also one still waiting to be sent', async () => {
        setup()
        await hold('26100013 – 3/4')
        await userEvent.click(screen.getByRole('button', { name: 'Scan zurücknehmen' }))
        expect(screen.getByRole('heading', { name: 'Jetzt an Guss (1)' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Scan zurücknehmen' })).toBeNull()
        await userEvent.click(screen.getByRole('switch', { name: 'Verbindung' }))
        await hold('26100013 – 3/4')
        await userEvent.click(screen.getByRole('button', { name: 'Scan zurücknehmen' }))
        expect(screen.queryByText(/wartet auf Verbindung/)).toBeNull()
        expect(screen.getByRole('heading', { name: 'Jetzt an Guss (1)' })).toBeInTheDocument()
    })

    it('changing the station needs a confirmation', async () => {
        setup()
        await userEvent.click(screen.getByRole('button', { name: 'Station wechseln' }))
        const dialog = screen.getByRole('alertdialog', { name: 'Station wechseln?' })
        expect(dialog).toHaveTextContent('Alle folgenden Scans zählen an der neuen Station.')
        await userEvent.click(within(dialog).getByRole('button', { name: 'Abbrechen' }))
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Station Guss')
        await userEvent.click(screen.getByRole('button', { name: 'Station wechseln' }))
        await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Station wechseln' }))
        expect(screen.getByRole('heading', { name: 'An welcher Station steht dieses Tablet?' })).toBeInTheDocument()
    })

    it('with the camera refused, the typed input still works', async () => {
        setup({ initial: 'denied' })
        expect(await screen.findByText(/Kamera nicht erlaubt/)).toBeInTheDocument()
        await userEvent.type(screen.getByRole('textbox', { name: 'Nummer eintippen' }), '26100013-3/4{Enter}')
        expect(screen.getByText('EIN')).toBeInTheDocument()
    })

    it('the offline variant starts with three waiting scans', () => {
        setup({ initial: 'offline' })
        expect(screen.getByText('3 Scans warten auf Verbindung')).toBeInTheDocument()
    })
})
