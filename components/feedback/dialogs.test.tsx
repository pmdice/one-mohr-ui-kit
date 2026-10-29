import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ConflictDialog } from './ConflictDialog'
import { SessionDialog } from './SessionDialog'

const NOW = Date.UTC(2026, 9, 29, 10, 30)

describe('ConflictDialog', () => {
    const changes = [
        { field: 'Liefertermin', mine: 'Fr, 20.11.2026', theirs: 'Mo, 16.11.2026' },
        { field: 'Notiz', mine: 'Steine nicht mitgiessen.', theirs: 'Steine separat liefern.' },
    ]

    it('says who changed what meanwhile, field by field', () => {
        render(<ConflictDialog open changes={changes} by="S. Keller" at={NOW - 3 * 60_000} now={NOW} onKeepMine={vi.fn()} onKeepTheirs={vi.fn()} onCancel={vi.fn()} />)
        const dialog = screen.getByRole('alertdialog', { name: 'S. Keller hat diesen Auftrag inzwischen geändert' })
        expect(dialog).toHaveTextContent('vor 3 min')
        const rows = within(dialog).getAllByRole('row').slice(1)
        expect(rows[0]).toHaveTextContent('Liefertermin')
        expect(rows[0]).toHaveTextContent('Fr, 20.11.2026')
        expect(rows[0]).toHaveTextContent('Mo, 16.11.2026')
    })

    it('offers both ways and cancel keeps the input', async () => {
        const onKeepMine = vi.fn(), onKeepTheirs = vi.fn(), onCancel = vi.fn()
        render(<ConflictDialog open changes={changes} by="S. Keller" at={NOW} now={NOW} onKeepMine={onKeepMine} onKeepTheirs={onKeepTheirs} onCancel={onCancel} />)
        await userEvent.click(screen.getByRole('button', { name: 'Meine Änderungen speichern' }))
        expect(onKeepMine).toHaveBeenCalled()
        await userEvent.click(screen.getByRole('button', { name: 'Änderungen von S. Keller übernehmen' }))
        expect(onKeepTheirs).toHaveBeenCalled()
        await userEvent.keyboard('{Escape}')
        expect(onCancel).toHaveBeenCalled()
    })

    it('starts on the safe choice: keep theirs is not the default focus, cancel is', () => {
        render(<ConflictDialog open changes={changes} by="S. Keller" at={NOW} now={NOW} onKeepMine={vi.fn()} onKeepTheirs={vi.fn()} onCancel={vi.fn()} />)
        expect(screen.getByRole('button', { name: 'Zurück zum Formular' })).toHaveFocus()
    })
})

describe('SessionDialog', () => {
    it('logs in over the page and reports success once', async () => {
        const onLogin = vi.fn().mockResolvedValue(undefined)
        const onDone = vi.fn()
        render(<SessionDialog open user="P. Mohr" onLogin={onLogin} onDone={onDone} />)
        const dialog = screen.getByRole('dialog', { name: 'Sitzung abgelaufen' })
        expect(dialog).toHaveTextContent('Ihre Eingaben bleiben erhalten')
        await userEvent.type(within(dialog).getByLabelText('Passwort'), 'geheim{Enter}')
        expect(onLogin).toHaveBeenCalledWith('geheim')
        expect(onDone).toHaveBeenCalledTimes(1)
    })

    it('a wrong password says so at the field and keeps the dialog', async () => {
        const onLogin = vi.fn().mockRejectedValue('Passwort stimmt nicht.')
        render(<SessionDialog open user="P. Mohr" onLogin={onLogin} onDone={vi.fn()} />)
        await userEvent.type(screen.getByLabelText('Passwort'), 'falsch')
        await userEvent.click(screen.getByRole('button', { name: 'Anmelden' }))
        expect(await screen.findByText('Passwort stimmt nicht.')).toBeInTheDocument()
        expect(screen.getByLabelText('Passwort')).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
})
