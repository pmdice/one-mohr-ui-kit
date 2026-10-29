import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { decide } from './decide'
import { Guarded } from './Guarded'
import { AccessRequestDialog } from './AccessRequestDialog'
import { RoleExample } from './examples/RoleExample'

describe('review fixes: access', () => {
    it('known applies only to the roles that must know it; others do not see it', () => {
        const move = { roles: ['buero'], known: { roles: ['werkstatt'], text: 'Nur Büro' } }
        expect(decide(move, { role: 'werkstatt' })).toEqual({ kind: 'disabled', reason: 'Nur Büro', requestable: true })
        expect(decide(move, { role: 'gast' })).toEqual({ kind: 'hidden' })
    })

    it('a locked action does not run, by click, Enter or Space, whatever the control does', async () => {
        const run = vi.fn()
        render(<Guarded decision={{ kind: 'disabled', reason: 'Nur Büro' }}>{(p) => <button {...p} onClick={run}>Archivieren</button>}</Guarded>)
        const b = screen.getByRole('button', { name: 'Archivieren' })
        await userEvent.click(b)
        b.focus()
        await userEvent.keyboard('{Enter} ')
        expect(run).not.toHaveBeenCalled()
        expect(b).toHaveAttribute('aria-disabled', 'true')
    })

    it('a failed request says so in the dialog and keeps the reason', async () => {
        render(<AccessRequestDialog open what="Aufträge ändern" to="Teamleitung" onSend={() => Promise.reject(new Error('500'))} onClose={() => {}} />)
        await userEvent.type(screen.getByRole('textbox', { name: /Wofür/ }), 'Termine')
        await userEvent.click(screen.getByRole('button', { name: 'Anfrage senden' }))
        expect(await screen.findByRole('alert')).toHaveTextContent('Anfrage nicht gesendet. Erneut versuchen.')
        expect(screen.getByRole('textbox', { name: /Wofür/ })).toHaveValue('Termine')
    })

    it('example: a guest does not see actions it is not meant to start', async () => {
        render(<RoleExample />)
        await userEvent.click(screen.getByRole('radio', { name: 'Gast' }))
        expect(screen.queryByRole('button', { name: 'Liefertermin verschieben' })).toBeNull()
    })

    it('example: only Büro and Teamleitung may see the app as someone else; the role cannot change meanwhile', async () => {
        render(<RoleExample />)
        await userEvent.click(screen.getByRole('radio', { name: 'Werkstatt' }))
        expect(screen.queryByRole('switch', { name: 'Als S. Keller ansehen' })).toBeNull()
        await userEvent.click(screen.getByRole('radio', { name: 'Büro' }))
        await userEvent.click(screen.getByRole('switch', { name: 'Als S. Keller ansehen' }))
        expect(screen.getByRole('radio', { name: 'Gast' })).toHaveAttribute('aria-disabled', 'true')
    })
})
