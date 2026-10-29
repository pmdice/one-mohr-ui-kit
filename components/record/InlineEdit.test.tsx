import * as React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { InlineEdit, type EditorProps } from './InlineEdit'

const TextEditor = ({ value, commit, inputRef, id }: EditorProps<string>) => (
    <input
        ref={inputRef as React.Ref<HTMLInputElement>}
        id={id}
        aria-label="Notiz"
        defaultValue={value}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(e.currentTarget.value) }}
        onBlur={(e) => commit(e.currentTarget.value)}
    />
)

function Note({ onSave, readOnly }: { onSave: (v: string) => void | Promise<void>; readOnly?: boolean }) {
    const [value, setValue] = React.useState('Steine nicht mitgiessen')
    return (
        <InlineEdit<string>
            label="Notiz"
            value={value}
            readOnly={readOnly}
            display={(v) => v}
            editor={(p) => <TextEditor {...p} />}
            onSave={async (v) => { await onSave(v); setValue(v) }}
        />
    )
}

function deferred() {
    let resolve!: () => void, reject!: (e: Error) => void
    const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej })
    return { promise, resolve, reject }
}

describe('InlineEdit', () => {
    it('opens the field in place, saves on Enter and returns focus to the value', async () => {
        const onSave = vi.fn()
        render(<Note onSave={onSave} />)
        await userEvent.click(screen.getByRole('button', { name: 'Notiz ändern' }))
        const field = screen.getByRole('textbox', { name: 'Notiz' })
        expect(field).toHaveFocus()
        await userEvent.clear(field)
        await userEvent.type(field, 'Baum abschrecken{Enter}')
        expect(onSave).toHaveBeenCalledWith('Baum abschrecken')
        const button = await screen.findByRole('button', { name: 'Notiz ändern' })
        expect(button).toHaveTextContent('Baum abschrecken')
        expect(button).toHaveFocus()
    })

    it('shows "Speichert …" with the new value and does not save twice', async () => {
        const d = deferred()
        const onSave = vi.fn(() => d.promise)
        render(<Note onSave={onSave} />)
        await userEvent.click(screen.getByRole('button', { name: 'Notiz ändern' }))
        await userEvent.clear(screen.getByRole('textbox', { name: 'Notiz' }))
        await userEvent.type(screen.getByRole('textbox', { name: 'Notiz' }), 'Neu{Enter}')
        expect(screen.getByText('Speichert …')).toBeInTheDocument()
        expect(screen.getByText('Neu')).toBeInTheDocument()
        await userEvent.keyboard('{Enter}')
        expect(onSave).toHaveBeenCalledTimes(1)
        await act(async () => d.resolve())
        expect(screen.queryByText('Speichert …')).toBeNull()
    })

    it('a failed save keeps the typed value with the reason; Escape brings the old value back', async () => {
        const onSave = vi.fn().mockRejectedValue(new Error('Keine Verbindung. Nochmals versuchen.'))
        render(<Note onSave={onSave} />)
        await userEvent.click(screen.getByRole('button', { name: 'Notiz ändern' }))
        await userEvent.clear(screen.getByRole('textbox', { name: 'Notiz' }))
        await userEvent.type(screen.getByRole('textbox', { name: 'Notiz' }), 'Neu{Enter}')
        expect(await screen.findByRole('alert')).toHaveTextContent('Keine Verbindung. Nochmals versuchen.')
        expect(screen.getByRole('textbox', { name: 'Notiz' })).toHaveValue('Neu')
        await userEvent.keyboard('{Escape}')
        const button = screen.getByRole('button', { name: 'Notiz ändern' })
        expect(button).toHaveTextContent('Steine nicht mitgiessen')
        expect(button).toHaveFocus()
    })

    it('Escape closes without saving', async () => {
        const onSave = vi.fn()
        render(<Note onSave={onSave} />)
        await userEvent.click(screen.getByRole('button', { name: 'Notiz ändern' }))
        await userEvent.type(screen.getByRole('textbox', { name: 'Notiz' }), ' und mehr')
        await userEvent.keyboard('{Escape}')
        expect(onSave).not.toHaveBeenCalled()
        expect(screen.getByRole('button', { name: 'Notiz ändern' })).toHaveTextContent('Steine nicht mitgiessen')
    })

    it('the same value does not save', async () => {
        const onSave = vi.fn()
        render(<Note onSave={onSave} />)
        await userEvent.click(screen.getByRole('button', { name: 'Notiz ändern' }))
        await userEvent.keyboard('{Enter}')
        expect(onSave).not.toHaveBeenCalled()
        expect(screen.getByRole('button', { name: 'Notiz ändern' })).toBeInTheDocument()
    })

    it('read-only shows the value without a way to change it', () => {
        render(<Note onSave={vi.fn()} readOnly />)
        expect(screen.queryByRole('button')).toBeNull()
        expect(screen.getByText('Steine nicht mitgiessen')).toBeInTheDocument()
    })
})
