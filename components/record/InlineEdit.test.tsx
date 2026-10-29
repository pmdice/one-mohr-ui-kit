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

    it('an empty value says what is missing and the button adds it (D-04)', async () => {
        function Ref() {
            const [value, setValue] = React.useState('')
            return <InlineEdit<string> label="Bestellnummer" value={value} isEmpty={(v) => !v} emptyText="Keine Bestellnummer" display={(v) => v} editor={(p) => <TextEditor {...p} />} onSave={setValue} />
        }
        render(<Ref />)
        const add = screen.getByRole('button', { name: 'Bestellnummer hinzufügen' })
        expect(add).toHaveTextContent('Keine Bestellnummer')
        expect(add).toHaveTextContent('Hinzufügen')
        await userEvent.click(add)
        expect(screen.getByRole('textbox')).toHaveFocus()
    })

    it('leaving without a change closes, also when the editor did not report anything', async () => {
        function Silent() {
            return (
                <>
                    <InlineEdit<string> label="Art" value="neu" display={(v) => v} editor={({ inputRef }) => <button ref={inputRef as React.Ref<HTMLButtonElement>}>Option</button>} onSave={vi.fn()} />
                    <button>Woanders</button>
                </>
            )
        }
        render(<Silent />)
        await userEvent.click(screen.getByRole('button', { name: 'Art ändern' }))
        expect(screen.getByRole('button', { name: 'Option' })).toHaveFocus()
        await userEvent.click(screen.getByRole('button', { name: 'Woanders' }))
        expect(screen.getByRole('button', { name: 'Art ändern' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Woanders' })).toHaveFocus()
    })

    it('focuses the first control when the editor gives no ref', async () => {
        render(<InlineEdit<string> label="Art" value="neu" display={(v) => v} editor={() => <input aria-label="Feld" />} onSave={vi.fn()} />)
        await userEvent.click(screen.getByRole('button', { name: 'Art ändern' }))
        expect(screen.getByRole('textbox', { name: 'Feld' })).toHaveFocus()
    })
})
