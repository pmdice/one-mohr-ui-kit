import * as React from 'react'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Combobox, type ComboboxOption } from '@/components/molecules/Combobox/Combobox'
import { RecordPicker } from './RecordPicker'
import { FileDrop, type Upload } from './FileDrop'

const CUSTOMERS: ComboboxOption[] = [
    { value: 'c1', label: 'Dähler + Blaser', description: '10073 · Biel' },
    { value: 'c2', label: 'Dähler Uhren', description: '10112 · Lyss' },
    { value: 'c3', label: 'Bucherer', description: '10002 · Luzern' },
]

function Picker({ onCreate = vi.fn(), recent }: { onCreate?: (q: string) => void; recent?: ComboboxOption[] }) {
    const [value, setValue] = React.useState<string | null>(null)
    return <Combobox aria-label="Kunde" options={CUSTOMERS} value={value} onChange={setValue} onCreate={onCreate} recent={recent} />
}

describe('Combobox: create and recent', () => {
    it('offers "neu anlegen" with the typed text when nothing matches exactly', async () => {
        const onCreate = vi.fn()
        render(<Picker onCreate={onCreate} />)
        await userEvent.type(screen.getByRole('combobox', { name: 'Kunde' }), 'Dähler AG')
        const create = screen.getByRole('option', { name: '„Dähler AG“ neu anlegen' })
        await userEvent.click(create)
        expect(onCreate).toHaveBeenCalledWith('Dähler AG')
    })

    it('does not offer it for an exact match', async () => {
        render(<Picker />)
        await userEvent.type(screen.getByRole('combobox', { name: 'Kunde' }), 'bucherer')
        expect(screen.queryByRole('option', { name: /neu anlegen/ })).toBeNull()
    })

    it('Enter on the create option creates', async () => {
        const onCreate = vi.fn()
        render(<Picker onCreate={onCreate} />)
        await userEvent.type(screen.getByRole('combobox', { name: 'Kunde' }), 'Neu GmbH{ArrowDown}{Enter}')
        expect(onCreate).toHaveBeenCalledWith('Neu GmbH')
    })

    it('shows the recently used first while nothing is typed', async () => {
        render(<Picker recent={[CUSTOMERS[2]]} />)
        await userEvent.click(screen.getByRole('combobox', { name: 'Kunde' }))
        const listbox = screen.getByRole('listbox')
        expect(within(listbox).getByText('Zuletzt benutzt')).toBeInTheDocument()
        expect(within(listbox).getAllByRole('option')[0]).toHaveAccessibleName(/Bucherer/)
        expect(within(listbox).getAllByRole('option')).toHaveLength(3)
    })
})

describe('RecordPicker', () => {
    it('links to the chosen record', () => {
        render(<RecordPicker aria-label="Kunde" options={CUSTOMERS} value="c1" onChange={() => {}} href={(v) => `/kunden/${v}`} />)
        expect(screen.getByRole('link', { name: 'Dähler + Blaser öffnen' })).toHaveAttribute('href', '/kunden/c1')
    })

    it('has no link while nothing is chosen', () => {
        render(<RecordPicker aria-label="Kunde" options={CUSTOMERS} value={null} onChange={() => {}} href={(v) => `/kunden/${v}`} />)
        expect(screen.queryByRole('link')).toBeNull()
    })
})

/** An upload that reports progress and finishes or fails when the test says so. */
function controlledUpload() {
    const calls: { file: File; progress: (n: number) => void; resolve: () => void; reject: () => void; signal: AbortSignal }[] = []
    const upload: Upload = (file, progress, signal) => new Promise<void>((resolve, reject) => { calls.push({ file, progress, resolve, reject: () => reject(new Error('net')), signal }) })
    return { upload, calls }
}

const file = (name: string, bytes: number, type: string) => new File([new Uint8Array(bytes)], name, { type })

describe('FileDrop', () => {
    it('says the limits before anything is chosen', () => {
        render(<FileDrop upload={controlledUpload().upload} accept="image/*,.pdf" acceptLabel="Bilder oder PDF" maxBytes={10 * 1024 * 1024} onChange={() => {}} />)
        expect(screen.getByText('Bilder oder PDF, je höchstens 10 MB')).toBeInTheDocument()
    })

    it('rejects a file that is too big at that file and uploads the others', async () => {
        const { upload, calls } = controlledUpload()
        render(<FileDrop upload={upload} accept="image/*" acceptLabel="Bilder" maxBytes={1024} onChange={() => {}} />)
        await userEvent.upload(screen.getByLabelText('Dateien auswählen', { selector: 'input' }), [file('gross.jpg', 2048, 'image/jpeg'), file('klein.jpg', 100, 'image/jpeg')])
        const big = screen.getByRole('listitem', { name: /gross\.jpg/ })
        expect(big).toHaveTextContent('Zu gross: 2 KB, erlaubt 1 KB')
        expect(calls.map((c) => c.file.name)).toEqual(['klein.jpg'])
    })

    it('rejects a type that is not allowed with the reason', async () => {
        const { upload, calls } = controlledUpload()
        render(<FileDrop upload={upload} accept="image/*,.pdf" acceptLabel="Bilder oder PDF" maxBytes={1024} onChange={() => {}} />)
        await userEvent.upload(screen.getByLabelText('Dateien auswählen', { selector: 'input' }), file('liste.xlsx', 10, 'application/vnd.ms-excel'), { applyAccept: false })
        expect(screen.getByRole('listitem', { name: /liste\.xlsx/ })).toHaveTextContent('Dateityp nicht erlaubt. Erlaubt: Bilder oder PDF')
        expect(calls).toHaveLength(0)
    })

    it('shows progress and reports finished files', async () => {
        const { upload, calls } = controlledUpload()
        const onChange = vi.fn()
        render(<FileDrop upload={upload} accept="application/pdf" acceptLabel="PDF" maxBytes={1024} onChange={onChange} />)
        await userEvent.upload(screen.getByLabelText('Dateien auswählen', { selector: 'input' }), file('plan.pdf', 100, 'application/pdf'))
        act(() => calls[0].progress(0.4))
        expect(screen.getByRole('progressbar', { name: /plan\.pdf/ })).toHaveAttribute('aria-valuenow', '40')
        await act(async () => calls[0].resolve())
        expect(screen.getByRole('listitem', { name: /plan\.pdf/ })).toHaveTextContent('Hochgeladen')
        expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'plan.pdf', size: 100 })])
    })

    it('removing a file while it uploads stops the upload; the others go on', async () => {
        const { upload, calls } = controlledUpload()
        render(<FileDrop upload={upload} accept="application/pdf" acceptLabel="PDF" maxBytes={1024} onChange={() => {}} />)
        await userEvent.upload(screen.getByLabelText('Dateien auswählen', { selector: 'input' }), [file('a.pdf', 10, 'application/pdf'), file('b.pdf', 10, 'application/pdf')])
        await userEvent.click(screen.getByRole('button', { name: 'a.pdf entfernen' }))
        expect(calls[0].signal.aborted).toBe(true)
        expect(calls[1].signal.aborted).toBe(false)
        expect(screen.queryByRole('listitem', { name: /a\.pdf/ })).toBeNull()
        expect(screen.getByRole('listitem', { name: /b\.pdf/ })).toBeInTheDocument()
    })

    it('a failed upload says so and can be tried again', async () => {
        const { upload, calls } = controlledUpload()
        render(<FileDrop upload={upload} accept="application/pdf" acceptLabel="PDF" maxBytes={1024} onChange={() => {}} />)
        await userEvent.upload(screen.getByLabelText('Dateien auswählen', { selector: 'input' }), file('a.pdf', 10, 'application/pdf'))
        await act(async () => calls[0].reject())
        expect(screen.getByRole('listitem', { name: /a\.pdf/ })).toHaveTextContent('Hochladen fehlgeschlagen')
        await userEvent.click(screen.getByRole('button', { name: 'a.pdf erneut hochladen' }))
        expect(calls).toHaveLength(2)
    })
})
