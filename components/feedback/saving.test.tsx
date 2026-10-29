import * as React from 'react'
import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { explainError } from './explainError'
import { useSave } from './useSave'
import { SaveIndicator } from './SaveIndicator'
import { useDraft } from './useDraft'
import { memoryStorage } from '@/components/workshop/station'

describe('explainError', () => {
    it.each([
        [{ offline: true }, 'Keine Verbindung. Ihre Eingaben sind noch da; erneut versuchen, sobald die Verbindung zurück ist.', 'retry'],
        [{ status: 0 }, 'Keine Verbindung. Ihre Eingaben sind noch da; erneut versuchen, sobald die Verbindung zurück ist.', 'retry'],
        [{ status: 401 }, 'Ihre Sitzung ist abgelaufen. Melden Sie sich an; Ihre Eingaben bleiben erhalten.', 'login'],
        [{ status: 419 }, 'Ihre Sitzung ist abgelaufen. Melden Sie sich an; Ihre Eingaben bleiben erhalten.', 'login'],
        [{ status: 403 }, 'Dafür fehlt Ihnen die Berechtigung. Eine Person mit Rechten für diesen Bereich kann das ändern.', undefined],
        [{ status: 404 }, 'Diesen Datensatz gibt es nicht mehr. Er wurde vermutlich gelöscht.', 'reload'],
        [{ status: 409 }, 'Jemand anderes hat das inzwischen geändert.', undefined],
        [{ status: 429 }, 'Zu viele Anfragen. In einer Minute erneut versuchen.', 'retry'],
    ])('%o → a sentence with the next step', (input, message, action) => {
        expect(explainError(input)).toEqual(action ? { message, action } : { message })
    })

    it('puts validation errors at the fields', () => {
        expect(explainError({ status: 422, fields: { dueDate: 'Liefertermin liegt in der Vergangenheit' } })).toEqual({
            message: 'Bitte die markierten Felder prüfen.',
            fields: { dueDate: 'Liefertermin liegt in der Vergangenheit' },
        })
    })

    it('unknown errors get a code for support and never the raw text', () => {
        const e = explainError(new Error('SQLSTATE[23000]: Integrity constraint violation'))
        expect(e.message).toBe('Unerwarteter Fehler. Erneut versuchen; wenn es wieder passiert, den Code an den Support geben.')
        expect(e.action).toBe('retry')
        expect(e.code).toMatch(/^[A-Z0-9]{6}$/)
        expect(explainError({ status: 500, code: 'R7Q2KX' }).code).toBe('R7Q2KX')
    })
})

function deferred() {
    let resolve!: () => void, reject!: (e: unknown) => void
    const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej })
    return { promise, resolve, reject }
}

describe('useSave', () => {
    it('goes dirty → saving → saved and ignores a second run while saving', async () => {
        const d = deferred()
        const save = vi.fn(() => d.promise)
        const { result } = renderHook(() => useSave<string>(save, { now: () => 1000 }))
        act(() => result.current.markDirty())
        expect(result.current.state).toBe('dirty')
        act(() => { void result.current.run('a') })
        act(() => { void result.current.run('b') })
        expect(result.current.state).toBe('saving')
        expect(save).toHaveBeenCalledTimes(1)
        await act(async () => d.resolve())
        expect(result.current.state).toBe('saved')
        expect(result.current.savedAt).toBe(1000)
    })

    it('a failure is explained and retry sends the last value again', async () => {
        const save = vi.fn().mockRejectedValueOnce({ status: 0 }).mockResolvedValueOnce(undefined)
        const { result } = renderHook(() => useSave<string>(save))
        await act(async () => { await result.current.run('Wert') })
        expect(result.current.state).toBe('failed')
        expect(result.current.error?.action).toBe('retry')
        await act(async () => { await result.current.retry() })
        expect(save).toHaveBeenLastCalledWith('Wert')
        expect(result.current.state).toBe('saved')
    })
})

describe('SaveIndicator', () => {
    const NOW = 10 * 60_000
    it.each([
        ['dirty', 'Nicht gespeicherte Änderungen'],
        ['saving', 'Speichert …'],
        ['saved', 'Gespeichert · vor 2 min'],
    ] as const)('%s says "%s"', (state, text) => {
        render(<SaveIndicator state={state} savedAt={NOW - 2 * 60_000} now={NOW} onRetry={() => {}} />)
        expect(screen.getByRole('status')).toHaveTextContent(text)
    })

    it('failed says why and offers to retry', async () => {
        const onRetry = vi.fn()
        render(<SaveIndicator state="failed" error={explainError({ status: 0 })} now={NOW} onRetry={onRetry} />)
        expect(screen.getByRole('status')).toHaveTextContent('Nicht gespeichert – Keine Verbindung.')
        await userEvent.click(screen.getByRole('button', { name: 'Erneut versuchen' }))
        expect(onRetry).toHaveBeenCalled()
    })

    it('idle says nothing', () => {
        render(<SaveIndicator state="idle" now={NOW} onRetry={() => {}} />)
        expect(screen.getByRole('status')).toHaveTextContent('')
    })
})

describe('useDraft', () => {
    it('keeps a draft across a reload and clears it after saving', () => {
        const storage = memoryStorage()
        const first = renderHook(({ v }) => useDraft('auftrag:26100013', v, storage), { initialProps: { v: { note: '' } } })
        first.rerender({ v: { note: 'Neu' } })
        first.unmount()
        const second = renderHook(() => useDraft<{ note: string }>('auftrag:26100013', { note: '' }, storage))
        expect(second.result.current.restored).toEqual({ note: 'Neu' })
        act(() => second.result.current.clear())
        const third = renderHook(() => useDraft<{ note: string }>('auftrag:26100013', { note: '' }, storage))
        expect(third.result.current.restored).toBeNull()
    })
})

void React
