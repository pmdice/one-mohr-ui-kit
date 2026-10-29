import * as React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { NoticeProvider, useNotice, type NoticeInput } from './Notices'
import { LongTask } from './LongTask'
import { ConnectionBanner } from './ConnectionBanner'

function Trigger({ input, label = 'Los' }: { input: NoticeInput; label?: string }) {
    const { notify } = useNotice()
    return <button onClick={() => notify(input)}>{label}</button>
}

const user = () => userEvent.setup({ delay: null })

describe('Notices', () => {
    beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }) })
    afterEach(() => { vi.useRealTimers() })

    it('a success disappears after 5 s', async () => {
        render(<NoticeProvider><Trigger input={{ message: 'Auftrag archiviert' }} /></NoticeProvider>)
        await user().click(screen.getByRole('button', { name: 'Los' }))
        expect(screen.getByRole('status')).toHaveTextContent('Auftrag archiviert')
        act(() => { vi.advanceTimersByTime(5100) })
        expect(screen.queryByText('Auftrag archiviert')).toBeNull()
    })

    it('with an action it stays 8 s and the action runs and closes it', async () => {
        const run = vi.fn()
        render(<NoticeProvider><Trigger input={{ message: 'Auftrag archiviert', action: { label: 'Rückgängig', run } }} /></NoticeProvider>)
        await user().click(screen.getByRole('button', { name: 'Los' }))
        act(() => { vi.advanceTimersByTime(6000) })
        await user().click(screen.getByRole('button', { name: 'Rückgängig' }))
        expect(run).toHaveBeenCalled()
        expect(screen.queryByText('Auftrag archiviert')).toBeNull()
    })

    it('pauses while the pointer is on it and then runs only the rest', async () => {
        render(<NoticeProvider><Trigger input={{ message: 'Gespeichert' }} /></NoticeProvider>)
        const u = user()
        await u.click(screen.getByRole('button', { name: 'Los' }))
        act(() => { vi.advanceTimersByTime(3000) })
        await u.hover(screen.getByText('Gespeichert'))
        act(() => { vi.advanceTimersByTime(20000) })
        expect(screen.getByText('Gespeichert')).toBeInTheDocument()
        await u.unhover(screen.getByText('Gespeichert'))
        act(() => { vi.advanceTimersByTime(1900) })
        expect(screen.getByText('Gespeichert')).toBeInTheDocument()
        act(() => { vi.advanceTimersByTime(200) })
        expect(screen.queryByText('Gespeichert')).toBeNull()
    })

    it('an error stays until closed and is an alert', async () => {
        render(<NoticeProvider><Trigger input={{ message: 'Export fehlgeschlagen. Erneut versuchen.', tone: 'error' }} /></NoticeProvider>)
        const u = user()
        await u.click(screen.getByRole('button', { name: 'Los' }))
        act(() => { vi.advanceTimersByTime(60_000) })
        expect(screen.getByRole('alert')).toHaveTextContent('Export fehlgeschlagen')
        await u.click(screen.getByRole('button', { name: 'Meldung schliessen' }))
        expect(screen.queryByRole('alert')).toBeNull()
    })

    it('shows at most three, the newest last', async () => {
        function Many() {
            const { notify } = useNotice()
            return <button onClick={() => [1, 2, 3, 4].forEach((n) => notify({ message: `Meldung ${n}` }))}>Viele</button>
        }
        render(<NoticeProvider><Many /></NoticeProvider>)
        await user().click(screen.getByRole('button', { name: 'Viele' }))
        expect(screen.getAllByRole('status').map((n) => n.textContent)).toEqual([expect.stringContaining('Meldung 2'), expect.stringContaining('Meldung 3'), expect.stringContaining('Meldung 4')])
    })
})

describe('LongTask', () => {
    const base = { running: true, label: 'Exportiert 1’200 Aufträge …', startedAt: 0 }
    it('shows nothing under one second', () => {
        render(<LongTask {...base} now={999} />)
        expect(screen.queryByText(/Exportiert/)).toBeNull()
    })
    it('shows the label from one second', () => {
        render(<LongTask {...base} now={1000} />)
        expect(screen.getByRole('status')).toHaveTextContent('Exportiert 1’200 Aufträge …')
    })
    it('from ten seconds shows progress or offers the background', async () => {
        const onBackground = vi.fn()
        const { rerender } = render(<LongTask {...base} now={10_000} progress={0.42} />)
        expect(screen.getByRole('progressbar', { name: 'Exportiert 1’200 Aufträge …' })).toHaveAttribute('aria-valuenow', '42')
        rerender(<LongTask {...base} now={10_000} onBackground={onBackground} />)
        await userEvent.click(screen.getByRole('button', { name: 'Im Hintergrund weiterlaufen lassen' }))
        expect(onBackground).toHaveBeenCalled()
    })
    it('a task that ended shows nothing', () => {
        render(<LongTask {...base} running={false} now={20_000} />)
        expect(screen.queryByRole('status')).toBeNull()
    })
})

describe('ConnectionBanner', () => {
    it('offline says what that means', () => {
        render(<ConnectionBanner online={false} waiting={2} />)
        expect(screen.getByRole('status')).toHaveTextContent('Keine Verbindung. 2 Änderungen werden gespeichert, sobald die Verbindung zurück ist.')
    })
    it('back online while sending', () => {
        render(<ConnectionBanner online waiting={1} />)
        expect(screen.getByRole('status')).toHaveTextContent('Verbindung wieder da. 1 Änderung wird gesendet …')
    })
    it('online with nothing waiting shows nothing', () => {
        render(<ConnectionBanner online waiting={0} />)
        expect(screen.queryByRole('status')).toBeNull()
    })
})

void React
