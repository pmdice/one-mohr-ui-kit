import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { StatusMenu } from './StatusMenu'
import type { Workflow } from './workflow'

type Ctx = { atStation: boolean }
const WF: Workflow<Ctx> = {
    statuses: [
        { id: 'offen', label: 'Offen', category: 'planned' },
        { id: 'in-arbeit', label: 'In Arbeit', category: 'active' },
        { id: 'fertig', label: 'Fertig', category: 'done' },
        { id: 'storniert', label: 'Storniert', category: 'canceled' },
    ],
    transitions: [
        { from: 'in-arbeit', to: 'fertig', verb: 'Fertig melden', when: (c) => (c.atStation ? 'Fertig melden geht erst nach dem Ausscannen' : null) },
        { from: 'in-arbeit', to: 'storniert', verb: 'Stornieren' },
    ],
}

describe('StatusMenu', () => {
    it('offers only the allowed steps and says why one is blocked', async () => {
        render(<StatusMenu workflow={WF} current="in-arbeit" ctx={{ atStation: true }} onSelect={vi.fn()} />)
        await userEvent.click(screen.getByRole('button', { name: 'Status ändern: In Arbeit' }))
        const items = screen.getAllByRole('menuitem')
        expect(items.map((i) => i.textContent)).toEqual(['Fertig meldenFertig melden geht erst nach dem Ausscannen', 'Stornieren'])
        expect(items[0]).toHaveAttribute('aria-disabled', 'true')
        expect(screen.queryByRole('menuitem', { name: /Offen/ })).toBeNull()
    })

    it('reports the chosen transition', async () => {
        const onSelect = vi.fn()
        render(<StatusMenu workflow={WF} current="in-arbeit" ctx={{ atStation: false }} onSelect={onSelect} />)
        await userEvent.click(screen.getByRole('button', { name: /Status ändern/ }))
        await userEvent.click(screen.getByRole('menuitem', { name: 'Fertig melden' }))
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ to: 'fertig' }))
    })

    it('opens with S, but not while typing', async () => {
        render(<><input aria-label="Notiz" /><StatusMenu workflow={WF} current="in-arbeit" ctx={{ atStation: false }} onSelect={vi.fn()} /></>)
        await userEvent.click(screen.getByLabelText('Notiz'))
        await userEvent.keyboard('s')
        expect(screen.queryByRole('menu')).toBeNull()
        await userEvent.click(document.body)
        await userEvent.keyboard('s')
        expect(screen.getByRole('menu')).toBeInTheDocument()
    })
})
