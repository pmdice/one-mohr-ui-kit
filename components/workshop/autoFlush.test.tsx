import { act, renderHook } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useAutoFlush } from './autoFlush'

afterEach(() => vi.useRealTimers())

describe('useAutoFlush', () => {
    it('sends on load, when the network comes back and every 30 s', () => {
        vi.useFakeTimers()
        const queue = { flush: vi.fn(async () => {}) }
        renderHook(() => useAutoFlush(queue))
        expect(queue.flush).toHaveBeenCalledTimes(1)
        act(() => { window.dispatchEvent(new Event('online')) })
        expect(queue.flush).toHaveBeenCalledTimes(2)
        act(() => { vi.advanceTimersByTime(30_000) })
        expect(queue.flush).toHaveBeenCalledTimes(3)
    })
})
