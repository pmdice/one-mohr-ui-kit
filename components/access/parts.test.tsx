import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ReadOnlyNotice } from './ReadOnlyNotice'
import { AccessRequestDialog } from './AccessRequestDialog'
import { RoleBadge } from './RoleBadge'
import { RightsSummary } from './RightsSummary'
import { ImpersonationBanner } from './ImpersonationBanner'

describe('ReadOnlyNotice', () => {
    it('says that, why and who may change, with a way to ask', async () => {
        const onRequest = vi.fn()
        render(<ReadOnlyNotice area="Aufträge" who={['Büro', 'Teamleitung']} onRequest={onRequest} />)
        expect(screen.getByRole('status')).toHaveTextContent('Sie können Aufträge nur lesen. Ändern dürfen: Büro, Teamleitung.')
        await userEvent.click(screen.getByRole('button', { name: 'Zugriff anfragen' }))
        expect(onRequest).toHaveBeenCalled()
    })
})

describe('AccessRequestDialog', () => {
    it('needs a reason and sends it', async () => {
        const onSend = vi.fn().mockResolvedValue(undefined)
        render(<AccessRequestDialog open what="Aufträge ändern" to="Teamleitung Produktion" onSend={onSend} onClose={vi.fn()} />)
        const dialog = screen.getByRole('dialog', { name: 'Zugriff anfragen: Aufträge ändern' })
        expect(dialog).toHaveTextContent('Teamleitung Produktion')
        await userEvent.click(within(dialog).getByRole('button', { name: 'Anfrage senden' }))
        expect(within(dialog).getByText('Bitte kurz sagen, wofür Sie den Zugriff brauchen.')).toBeInTheDocument()
        expect(onSend).not.toHaveBeenCalled()
        await userEvent.type(within(dialog).getByRole('textbox', { name: /Wofür/ }), 'Liefertermine anpassen')
        await userEvent.click(within(dialog).getByRole('button', { name: 'Anfrage senden' }))
        expect(onSend).toHaveBeenCalledWith('Liefertermine anpassen')
    })
})

describe('RoleBadge', () => {
    it('shows name and role in words', () => {
        render(<RoleBadge name="S. Keller" role="Werkstatt" />)
        expect(screen.getByText('S. Keller')).toBeInTheDocument()
        expect(screen.getByText('Werkstatt')).toBeInTheDocument()
    })
})

describe('RightsSummary', () => {
    it('lists areas with words, not ticks only', () => {
        render(<RightsSummary role="Werkstatt" rows={[{ area: 'Aufträge', read: true, change: false, delete: false }, { area: 'Laufzettel', read: true, change: true, delete: false }]} />)
        const table = screen.getByRole('table', { name: 'Was Werkstatt darf' })
        const row = within(table).getByRole('row', { name: /Laufzettel/ })
        expect(row).toHaveTextContent('Lesen: ja')
        expect(row).toHaveTextContent('Ändern: ja')
        expect(row).toHaveTextContent('Löschen: nein')
    })
})

describe('ImpersonationBanner', () => {
    it('cannot be missed and leads back', async () => {
        const onLeave = vi.fn()
        render(<ImpersonationBanner as="S. Keller" role="Werkstatt" onLeave={onLeave} />)
        expect(screen.getByRole('alert')).toHaveTextContent('Sie sehen die App als S. Keller (Werkstatt). Änderungen werden mit Ihrem Namen und dem von S. Keller festgehalten.')
        await userEvent.click(screen.getByRole('button', { name: 'Zurück zu meinem Konto' }))
        expect(onLeave).toHaveBeenCalled()
    })
})
