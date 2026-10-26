import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

function Harness({ onConfirm = vi.fn(), reason }: { onConfirm?: (r?: string) => void; reason?: 'required' | 'optional' }) {
    const [open, setOpen] = React.useState(false)
    return (
        <>
            <button onClick={() => setOpen(true)}>Stornieren …</button>
            <ConfirmDialog
                open={open}
                title="Laufzettel stornieren?"
                consequences={['Er verschwindet aus den offenen Listen.']}
                confirmLabel="Stornieren"
                reason={reason}
                onConfirm={(r) => { onConfirm(r); setOpen(false) }}
                onCancel={() => setOpen(false)}
            />
        </>
    )
}

describe('ConfirmDialog', () => {
    it('names the consequences and starts on Abbrechen', async () => {
        render(<Harness />)
        await userEvent.click(screen.getByRole('button', { name: 'Stornieren …' }))
        const dialog = screen.getByRole('alertdialog', { name: 'Laufzettel stornieren?' })
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveTextContent('Er verschwindet aus den offenen Listen.')
        expect(screen.getByRole('button', { name: 'Abbrechen' })).toHaveFocus()
        expect(screen.getByRole('button', { name: 'Stornieren' })).toBeInTheDocument()
    })

    it('keeps Tab inside the dialog', async () => {
        render(<Harness />)
        await userEvent.click(screen.getByRole('button', { name: 'Stornieren …' }))
        await userEvent.tab()
        expect(screen.getByRole('button', { name: 'Stornieren' })).toHaveFocus()
        await userEvent.tab()
        expect(screen.getByRole('button', { name: 'Abbrechen' })).toHaveFocus()
        await userEvent.tab({ shift: true })
        expect(screen.getByRole('button', { name: 'Stornieren' })).toHaveFocus()
    })

    it('Escape cancels and returns focus to the trigger', async () => {
        const onConfirm = vi.fn()
        render(<Harness onConfirm={onConfirm} />)
        await userEvent.click(screen.getByRole('button', { name: 'Stornieren …' }))
        await userEvent.keyboard('{Escape}')
        expect(screen.queryByRole('alertdialog')).toBeNull()
        expect(onConfirm).not.toHaveBeenCalled()
        expect(screen.getByRole('button', { name: 'Stornieren …' })).toHaveFocus()
    })

    it('a required reason blocks confirming until it is given', async () => {
        const onConfirm = vi.fn()
        render(<Harness onConfirm={onConfirm} reason="required" />)
        await userEvent.click(screen.getByRole('button', { name: 'Stornieren …' }))
        await userEvent.click(screen.getByRole('button', { name: 'Stornieren' }))
        expect(onConfirm).not.toHaveBeenCalled()
        expect(screen.getByRole('textbox', { name: /Grund/ })).toHaveAccessibleDescription('Bitte einen Grund angeben')
        await userEvent.type(screen.getByRole('textbox', { name: /Grund/ }), 'Kunde hat abgesagt')
        await userEvent.click(screen.getByRole('button', { name: 'Stornieren' }))
        expect(onConfirm).toHaveBeenCalledWith('Kunde hat abgesagt')
    })
})
