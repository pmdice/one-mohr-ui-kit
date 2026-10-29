import { act, renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useStation } from './station'

beforeEach(() => localStorage.clear())

describe('useStation', () => {
    it('starts empty, remembers the station on the device', () => {
        const { result, unmount } = renderHook(() => useStation())
        expect(result.current[0]).toBeNull()
        act(() => result.current[1]('guss'))
        expect(result.current[0]).toBe('guss')
        unmount()
        expect(renderHook(() => useStation()).result.current[0]).toBe('guss')
    })

    it('works in memory when the storage throws', () => {
        const broken = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } } as unknown as Storage
        const { result } = renderHook(() => useStation(broken))
        act(() => result.current[1]('3d'))
        expect(result.current[0]).toBe('3d')
    })
})
