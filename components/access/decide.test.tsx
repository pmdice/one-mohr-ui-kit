import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { decide } from './decide'
import { Guarded } from './Guarded'

const archive = { roles: ['buero', 'leitung'], when: (ctx: { open: boolean }) => (ctx.open ? 'Zuerst alle Laufzettel abschliessen.' : null) }
const remove = { roles: ['leitung'] }
const price = { roles: ['buero', 'leitung'], known: { roles: ['werkstatt'], text: 'Nur Büro und Teamleitung' } }

describe('decide', () => {
    it('a role that never may: hidden', () => {
        expect(decide(remove, { role: 'werkstatt' })).toEqual({ kind: 'hidden' })
    })
    it('a role that may, but not now: disabled with the reason', () => {
        expect(decide(archive, { role: 'buero', open: true })).toEqual({ kind: 'disabled', reason: 'Zuerst alle Laufzettel abschliessen.' })
    })
    it('a role that may not but must know: disabled with who may, requestable', () => {
        expect(decide(price, { role: 'werkstatt' })).toEqual({ kind: 'disabled', reason: 'Nur Büro und Teamleitung', requestable: true })
    })
    it('a missing role wins over a state reason', () => {
        expect(decide({ ...archive, known: { roles: ['gast'], text: 'Nur Büro' } }, { role: 'gast', open: true })).toEqual({ kind: 'disabled', reason: 'Nur Büro', requestable: true })
    })
    it('otherwise allowed', () => {
        expect(decide(archive, { role: 'leitung', open: false })).toEqual({ kind: 'allowed' })
    })
})

describe('Guarded', () => {
    const button = (props: { disabled?: boolean; 'aria-describedby'?: string }) => <button {...props} aria-disabled={props.disabled || undefined} disabled={false} onClick={props.disabled ? undefined : () => {}}>Archivieren</button>

    it('renders nothing when hidden', () => {
        const { container } = render(<Guarded decision={{ kind: 'hidden' }}>{button}</Guarded>)
        expect(container).toBeEmptyDOMElement()
    })

    it('shows the reason as visible text, tied to the control, which stays reachable by Tab', async () => {
        render(<Guarded decision={{ kind: 'disabled', reason: 'Zuerst alle Laufzettel abschliessen.' }}>{button}</Guarded>)
        const b = screen.getByRole('button', { name: 'Archivieren' })
        expect(b).toHaveAttribute('aria-disabled', 'true')
        expect(b).toHaveAccessibleDescription('Zuerst alle Laufzettel abschliessen.')
        await userEvent.tab()
        expect(b).toHaveFocus()
    })

    it('offers to request access when requestable', async () => {
        const onRequest = vi.fn()
        render(<Guarded decision={{ kind: 'disabled', reason: 'Nur Teamleitung', requestable: true }} onRequest={onRequest}>{button}</Guarded>)
        await userEvent.click(screen.getByRole('button', { name: 'Zugriff anfragen' }))
        expect(onRequest).toHaveBeenCalled()
    })

    it('allowed renders the control as is', () => {
        render(<Guarded decision={{ kind: 'allowed' }}>{button}</Guarded>)
        expect(screen.getByRole('button', { name: 'Archivieren' })).not.toHaveAttribute('aria-disabled')
    })
})
