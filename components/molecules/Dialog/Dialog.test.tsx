import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Dialog } from './Dialog'

function Harness({ initialOpen = false, onClose }: { initialOpen?: boolean; onClose?: () => void }) {
    const [open, setOpen] = React.useState(initialOpen)
    const save = React.useRef<HTMLButtonElement>(null)
    return (
        <>
            <button onClick={() => setOpen(true)}>Öffnen</button>
            <Dialog
                open={open}
                onClose={() => { onClose?.(); setOpen(false) }}
                title="Auftrag umbenennen"
                description="Der neue Name erscheint überall."
                initialFocus={save}
                footer={<><button>Abbrechen</button><button ref={save}>Speichern</button></>}
            >
                <input aria-label="Name" />
            </Dialog>
        </>
    )
}

describe('Dialog', () => {
    it('is a labelled modal dialog', async () => {
        render(<Harness />)
        await userEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
        const dialog = screen.getByRole('dialog', { name: 'Auftrag umbenennen' })
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAccessibleDescription('Der neue Name erscheint überall.')
    })

    it('starts on initialFocus, otherwise on the first field', async () => {
        render(<Harness />)
        await userEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
        expect(screen.getByRole('button', { name: 'Speichern' })).toHaveFocus()

        render(<Dialog open onClose={() => {}} title="Ohne"><input aria-label="Erstes" /></Dialog>)
        expect(screen.getByRole('textbox', { name: 'Erstes' })).toHaveFocus()
    })

    it('keeps Tab inside, both ways', async () => {
        render(<Harness />)
        await userEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
        // order: Schliessen, Name, Abbrechen, Speichern
        await userEvent.tab()
        expect(screen.getByRole('button', { name: 'Schliessen' })).toHaveFocus()
        await userEvent.tab({ shift: true })
        expect(screen.getByRole('button', { name: 'Speichern' })).toHaveFocus()
    })

    it('Escape closes and focus returns to the trigger', async () => {
        render(<Harness />)
        const trigger = screen.getByRole('button', { name: 'Öffnen' })
        await userEvent.click(trigger)
        await userEvent.keyboard('{Escape}')
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(trigger).toHaveFocus()
    })

    it('a click on the backdrop closes, a click inside does not', async () => {
        const onClose = vi.fn()
        render(<Harness onClose={onClose} />)
        await userEvent.click(screen.getByRole('button', { name: 'Öffnen' }))
        await userEvent.click(screen.getByRole('textbox', { name: 'Name' }))
        expect(onClose).not.toHaveBeenCalled()
        await userEvent.click(screen.getByTestId('dialog-backdrop'))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('Escape in a nested dialog closes only the top one', async () => {
        const outer = vi.fn()
        const inner = vi.fn()
        render(
            <Dialog open onClose={outer} title="Aussen">
                <Dialog open onClose={inner} title="Innen" role="alertdialog"><button>Ok</button></Dialog>
            </Dialog>
        )
        await userEvent.keyboard('{Escape}')
        expect(inner).toHaveBeenCalledTimes(1)
        expect(outer).not.toHaveBeenCalled()
    })

    it('does not fail when the trigger is gone on close', async () => {
        function Gone() {
            const [open, setOpen] = React.useState(false)
            return (
                <>
                    {!open && <button onClick={() => setOpen(true)}>Weg</button>}
                    <Dialog open={open} onClose={() => setOpen(false)} title="T"><button>Ok</button></Dialog>
                </>
            )
        }
        render(<Gone />)
        await userEvent.click(screen.getByRole('button', { name: 'Weg' }))
        await userEvent.keyboard('{Escape}')
        expect(document.activeElement).toBe(document.body)
    })

    it('keeps the page from scrolling while any dialog is open', () => {
        const { rerender } = render(
            <>
                <Dialog open onClose={() => {}} title="A"><button>a</button></Dialog>
                <Dialog open onClose={() => {}} title="B"><button>b</button></Dialog>
            </>
        )
        expect(document.body.style.overflow).toBe('hidden')
        rerender(
            <>
                <Dialog open onClose={() => {}} title="A"><button>a</button></Dialog>
                <Dialog open={false} onClose={() => {}} title="B"><button>b</button></Dialog>
            </>
        )
        expect(document.body.style.overflow).toBe('hidden')
        rerender(<Dialog open={false} onClose={() => {}} title="A"><button>a</button></Dialog>)
        expect(document.body.style.overflow).toBe('')
    })
})
