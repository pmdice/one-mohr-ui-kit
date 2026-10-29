import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { SaveExample } from './SaveExample'

const setup = (delay = 5) => render(<SaveExample delay={delay} />)
const outcome = async (label: string) => userEvent.click(screen.getByRole('radio', { name: label }))
const log = () => within(screen.getByRole('region', { name: 'Server-Protokoll' })).queryAllByRole('listitem')

async function change() {
    const note = screen.getByRole('textbox', { name: 'Notiz' })
    await userEvent.type(note, ' Bitte prüfen.')
}

describe('Beispiel: Speichern', () => {
    it('shows unsaved, then saved', async () => {
        setup()
        await change()
        expect(screen.getByText('Nicht gespeicherte Änderungen')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
        expect(await screen.findByText(/Gespeichert · /)).toBeInTheDocument()
    })

    it('double click saves once', async () => {
        setup()
        await change()
        await userEvent.dblClick(screen.getByRole('button', { name: 'Speichern' }))
        await screen.findByText(/Gespeichert · /)
        expect(log()).toHaveLength(1)
    })

    it('no connection: says so, keeps input, retry saves', async () => {
        setup()
        await outcome('Keine Verbindung')
        await change()
        await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
        expect(await screen.findByText('Nicht gespeichert – Keine Verbindung.')).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'Notiz' })).toHaveValue('Steine nicht mitgiessen. Bitte prüfen.')
        await userEvent.click(screen.getByRole('button', { name: 'Erneut versuchen' }))
        expect(await screen.findByText(/Gespeichert · /)).toBeInTheDocument()
    })

    it('expired session: log in over the page, then it saves once', async () => {
        setup()
        await outcome('Sitzung abgelaufen')
        await change()
        await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
        const dialog = await screen.findByRole('dialog', { name: 'Sitzung abgelaufen' })
        await userEvent.type(within(dialog).getByLabelText('Passwort'), 'geheim{Enter}')
        expect(await screen.findByText(/Gespeichert · /)).toBeInTheDocument()
        expect(log()).toHaveLength(1)
    })

    it('conflict: shows the other change; keeping mine saves', async () => {
        setup()
        await outcome('Konflikt')
        await change()
        await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
        const dialog = await screen.findByRole('alertdialog', { name: /S\. Keller hat diesen Auftrag inzwischen geändert/ })
        expect(dialog).toHaveTextContent('Mo, 16.11.2026')
        await userEvent.click(within(dialog).getByRole('button', { name: 'Meine Änderungen speichern' }))
        expect(await screen.findByText(/Gespeichert · /)).toBeInTheDocument()
    })

    it('server error: a code for support', async () => {
        setup()
        await outcome('Serverfehler')
        await change()
        await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
        expect(await screen.findByText(/Nicht gespeichert – Unerwarteter Fehler\./)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Fehlercode kopieren' })).toBeInTheDocument()
    })

    it('archiving shows a notice with undo', async () => {
        setup()
        await userEvent.click(screen.getByRole('button', { name: 'Archivieren' }))
        expect(await screen.findByText('Auftrag archiviert')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))
        expect(screen.getByText('Offen')).toBeInTheDocument()
    })

    it('keeping the other version leaves a clear state; own other changes stay marked unsaved', async () => {
        setup()
        await outcome('Konflikt')
        await userEvent.clear(screen.getByRole('textbox', { name: 'Menge' }))
        await userEvent.type(screen.getByRole('textbox', { name: 'Menge' }), '50{Enter}')
        await change()
        await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
        const dialog = await screen.findByRole('alertdialog')
        await userEvent.click(within(dialog).getByRole('button', { name: 'Änderungen von S. Keller übernehmen' }))
        expect(screen.getByRole('textbox', { name: 'Notiz' })).toHaveValue('Steine separat liefern.')
        expect(screen.getByText('Nicht gespeicherte Änderungen')).toBeInTheDocument()
        expect(screen.queryByText(/Nicht gespeichert –/)).toBeNull()
    })

    it('keeping mine saves with the new version, not the stale one', async () => {
        setup()
        await outcome('Konflikt')
        await change()
        await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
        await userEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Meine Änderungen speichern' }))
        expect(await screen.findByText(/Gespeichert · /)).toBeInTheDocument()
        expect(log()[0]).toHaveTextContent('Version 3')
    })

    it('offline: saving waits and runs when the connection is back', async () => {
        setup()
        await userEvent.click(screen.getByRole('switch', { name: 'Verbindung' }))
        await change()
        await userEvent.click(screen.getByRole('button', { name: 'Speichern' }))
        expect(screen.getByText(/Keine Verbindung\. 1 Änderung/)).toBeInTheDocument()
        expect(log()).toHaveLength(0)
        await userEvent.click(screen.getByRole('switch', { name: 'Verbindung' }))
        expect(await screen.findByText(/Gespeichert · /)).toBeInTheDocument()
        expect(log()).toHaveLength(1)
    })
})
