import { act, render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { CameraScanner, type Detector } from './CameraScanner'

afterEach(() => vi.useRealTimers())

function fakes(codes: () => string[]) {
    const stop = vi.fn()
    const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream
    const detector: Detector = { detect: vi.fn(async () => codes().map((rawValue) => ({ rawValue }))) }
    return { stop, getStream: vi.fn(async () => stream), createDetector: () => detector }
}

const fallback = <input aria-label="Nummer eintippen" />

describe('CameraScanner', () => {
    it('reports a code once while it stays in view, again after it was gone for a second', async () => {
        vi.useFakeTimers()
        let inView = ['26100013-1/4']
        const f = fakes(() => inView)
        const onCode = vi.fn()
        render(<CameraScanner onCode={onCode} getStream={f.getStream} createDetector={f.createDetector} fallback={fallback} />)
        await act(async () => { await vi.advanceTimersByTimeAsync(250 * 20) })
        expect(onCode).toHaveBeenCalledTimes(1)
        expect(onCode).toHaveBeenCalledWith('26100013-1/4')
        expect(screen.getByLabelText('Kamera')).toBeInTheDocument()
        inView = []
        await act(async () => { await vi.advanceTimersByTimeAsync(1250) })
        inView = ['26100013-1/4']
        await act(async () => { await vi.advanceTimersByTimeAsync(250) })
        expect(onCode).toHaveBeenCalledTimes(2)
    })

    it('a slow detector does not report the same code twice', async () => {
        vi.useFakeTimers()
        const stop = vi.fn()
        const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream
        const detector = { detect: vi.fn(() => new Promise<{ rawValue: string }[]>((r) => setTimeout(() => r([{ rawValue: 'A' }]), 600))) }
        const onCode = vi.fn()
        render(<CameraScanner onCode={onCode} getStream={async () => stream} createDetector={() => detector} fallback={fallback} />)
        await act(async () => { await vi.advanceTimersByTimeAsync(3000) })
        expect(onCode).toHaveBeenCalledTimes(1)
    })

    it('reports nothing after it left, even from a detection still running', async () => {
        vi.useFakeTimers()
        const stream = { getTracks: () => [{ stop: vi.fn() }] } as unknown as MediaStream
        const detector = { detect: vi.fn(() => new Promise<{ rawValue: string }[]>((r) => setTimeout(() => r([{ rawValue: 'A' }]), 100))) }
        const onCode = vi.fn()
        const { unmount } = render(<CameraScanner onCode={onCode} getStream={async () => stream} createDetector={() => detector} fallback={fallback} />)
        await act(async () => { await vi.advanceTimersByTimeAsync(260) })
        unmount()
        await act(async () => { await vi.advanceTimersByTimeAsync(200) })
        expect(onCode).not.toHaveBeenCalled()
    })

    it('stops the camera when it leaves', async () => {
        const f = fakes(() => [])
        const { unmount } = render(<CameraScanner onCode={vi.fn()} getStream={f.getStream} createDetector={f.createDetector} fallback={fallback} />)
        await screen.findByLabelText('Kamera')
        unmount()
        expect(f.stop).toHaveBeenCalled()
    })

    it('says how to allow a refused camera and keeps the typed input', async () => {
        const getStream = vi.fn(async () => { throw Object.assign(new Error('no'), { name: 'NotAllowedError' }) })
        render(<CameraScanner onCode={vi.fn()} getStream={getStream} createDetector={() => fakes(() => []).createDetector()} fallback={fallback} />)
        expect(await screen.findByText(/Kamera nicht erlaubt/)).toHaveTextContent('In den Einstellungen des Browsers die Kamera für diese Seite erlauben.')
        expect(screen.getByLabelText('Nummer eintippen')).toBeInTheDocument()
    })

    it('without code recognition it does not start the camera and points to the input', async () => {
        const f = fakes(() => [])
        render(<CameraScanner onCode={vi.fn()} getStream={f.getStream} createDetector={() => null} fallback={fallback} />)
        expect(await screen.findByText(/erkennt Codes nicht selbst/)).toBeInTheDocument()
        expect(f.getStream).not.toHaveBeenCalled()
        expect(screen.getByLabelText('Nummer eintippen')).toBeInTheDocument()
    })
})
