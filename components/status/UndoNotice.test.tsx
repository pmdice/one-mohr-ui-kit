import { act, render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { UndoNotice } from './UndoNotice'

afterEach(() => vi.useRealTimers())

describe('UndoNotice', () => {
    it('offers Rückgängig and calls back', () => {
        const onUndo = vi.fn()
        render(<UndoNotice message="Status auf Fertig gesetzt" onUndo={onUndo} onClose={vi.fn()} />)
        expect(screen.getByRole('status')).toHaveTextContent('Status auf Fertig gesetzt')
        fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))
        expect(onUndo).toHaveBeenCalledTimes(1)
    })

    it('closes after 8 seconds, and a new message starts the time again', () => {
        vi.useFakeTimers()
        const onClose = vi.fn()
        const { rerender } = render(<UndoNotice message="A" onUndo={vi.fn()} onClose={onClose} />)
        act(() => { vi.advanceTimersByTime(7000) })
        rerender(<UndoNotice message="B" onUndo={vi.fn()} onClose={onClose} />)
        act(() => { vi.advanceTimersByTime(7000) })
        expect(onClose).not.toHaveBeenCalled()
        act(() => { vi.advanceTimersByTime(1000) })
        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
