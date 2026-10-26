import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ScanField } from './ScanField'
import type { ScanResult } from './scan'

describe('ScanField', () => {
    it('resolves on Enter, empties the field and keeps focus', async () => {
        const onScan = vi.fn()
        const resolve = (code: string): ScanResult => ({ kind: 'in', message: `${code} eingescannt in Guss` })
        render(<ScanField stationLabel="Guss" resolve={resolve} onScan={onScan} />)
        const field = screen.getByRole('textbox', { name: /Code scannen/ })
        await userEvent.type(field, '26100013-1/4{Enter}')
        expect(onScan).toHaveBeenCalledWith(expect.objectContaining({ kind: 'in' }), '26100013-1/4')
        expect(field).toHaveValue('')
        expect(field).toHaveFocus()
        expect(screen.getByRole('status')).toHaveTextContent('26100013-1/4 eingescannt in Guss')
    })

    it('reports errors as an alert', async () => {
        render(<ScanField stationLabel="Guss" resolve={(c) => ({ kind: 'unknown', message: `Unbekannter Code: ${c}` })} onScan={vi.fn()} />)
        await userEvent.type(screen.getByRole('textbox', { name: /Code scannen/ }), 'xyz{Enter}')
        expect(screen.getByRole('alert')).toHaveTextContent('Unbekannter Code: xyz')
    })

    it('names the station in the field and marks a repeated answer', async () => {
        render(<ScanField stationLabel="Guss" resolve={(c) => ({ kind: 'unknown', message: `Unbekannter Code: ${c}` })} onScan={vi.fn()} />)
        const field = screen.getByRole('textbox', { name: 'Code scannen an Guss' })
        await userEvent.type(field, 'xyz{Enter}')
        const first = screen.getByRole('alert').firstElementChild
        await userEvent.type(field, 'xyz{Enter}')
        expect(screen.getByRole('alert').firstElementChild).not.toBe(first)
        expect(screen.getByRole('alert')).toHaveTextContent('Unbekannter Code: xyz (2×)')
    })

    it('ignores Enter on an empty field', async () => {
        const onScan = vi.fn()
        render(<ScanField stationLabel="Guss" resolve={() => ({ kind: 'in', message: '' })} onScan={onScan} />)
        await userEvent.type(screen.getByRole('textbox', { name: /Code scannen/ }), '  {Enter}')
        expect(onScan).not.toHaveBeenCalled()
    })
})
