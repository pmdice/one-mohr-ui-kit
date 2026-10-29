import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { NoticeProvider, useNotice } from './Notices'
import { useSave } from './useSave'
import { SaveIndicator } from './SaveIndicator'
import { SessionDialog } from './SessionDialog'

function deferred() {
    let resolve!: () => void
    const promise = new Promise<void>((r) => { resolve = r })
    return { promise, resolve }
}

describe('review fixes: notices', () => {
    afterEach(() => { vi.useRealTimers() })

    it('renders on the server without the portal (no hydration break)', () => {
        expect(renderToString(<NoticeProvider><p>Seite</p></NoticeProvider>)).toBe('<p>Seite</p>')
    })

    it('keeps errors when more notices come', async () => {
        function Many() {
            const { notify } = useNotice()
            return <button onClick={() => { notify({ message: 'Export fehlgeschlagen', tone: 'error' }); [1, 2, 3].forEach((n) => notify({ message: `OK ${n}` })) }}>Los</button>
        }
        render(<NoticeProvider><Many /></NoticeProvider>)
        await userEvent.click(screen.getByRole('button', { name: 'Los' }))
        expect(screen.getByRole('alert')).toHaveTextContent('Export fehlgeschlagen')
    })

    it('does not run out while focus is inside, even after the pointer left', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        function One() {
            const { notify } = useNotice()
            return <button onClick={() => notify({ message: 'Archiviert', action: { label: 'Rückgängig', run: () => {} } })}>Los</button>
        }
        render(<NoticeProvider><One /></NoticeProvider>)
        await userEvent.click(screen.getByRole('button', { name: 'Los' }))
        const card = screen.getByRole('status')
        fireEvent.mouseEnter(card)
        act(() => screen.getByRole('button', { name: 'Rückgängig' }).focus())
        fireEvent.mouseLeave(card)
        act(() => { vi.advanceTimersByTime(20_000) })
        expect(screen.getByText('Archiviert')).toBeInTheDocument()
    })

    it('the notice area is a live region that is always there', () => {
        render(<NoticeProvider><p>x</p></NoticeProvider>)
        expect(screen.getByRole('region', { name: 'Meldungen' })).toHaveAttribute('aria-live', 'polite')
    })
})

describe('review fixes: useSave', () => {
    it('typing during a save ends in "dirty", not "saved"', async () => {
        const d = deferred()
        const { result } = renderHook(() => useSave<string>(() => d.promise))
        act(() => { void result.current.run('A') })
        act(() => result.current.markDirty())
        await act(async () => d.resolve())
        expect(result.current.state).toBe('dirty')
    })

    it('a different value while saving is sent afterwards', async () => {
        const calls: string[] = []
        const pending: (() => void)[] = []
        const { result } = renderHook(() => useSave<string>((v) => { calls.push(v); return new Promise<void>((r) => pending.push(r)) }))
        act(() => { void result.current.run('A') })
        act(() => { void result.current.run('B') })
        await act(async () => pending[0]())
        await act(async () => pending[1]?.())
        expect(calls).toEqual(['A', 'B'])
        expect(result.current.state).toBe('saved')
    })

    it('after a failure the same value is sent again; reset tells it what the server holds', async () => {
        const save = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce({ status: 409 }).mockResolvedValue(undefined)
        const { result } = renderHook(() => useSave<string>(save))
        await act(async () => { await result.current.run('A') })
        await act(async () => { await result.current.run('B') })
        act(() => result.current.reset('C'))
        expect(result.current.state).toBe('idle')
        await act(async () => { await result.current.run('A') })
        expect(save).toHaveBeenLastCalledWith('A')
        expect(save).toHaveBeenCalledTimes(3)
    })
})

describe('review fixes: messages', () => {
    it('a failure without explanation is neutral', () => {
        render(<SaveIndicator state="failed" now={0} onRetry={() => {}} />)
        expect(screen.getByRole('status')).toHaveTextContent('Nicht gespeichert.')
        expect(screen.getByRole('status')).not.toHaveTextContent('Unerwarteter Fehler')
    })

    it('the session dialog shows only sentences meant for people', async () => {
        render(<SessionDialog open user="P. Mohr" onLogin={() => Promise.reject(new Error('Request failed with status code 422'))} onDone={() => {}} />)
        await userEvent.type(screen.getByLabelText('Passwort'), 'x{Enter}')
        expect(await screen.findByText('Anmelden hat nicht geklappt. Passwort prüfen und erneut versuchen.')).toBeInTheDocument()
        expect(screen.queryByText(/status code/)).toBeNull()
    })
})
