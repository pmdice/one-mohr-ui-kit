import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

function fakeAudio() {
    const resume = vi.fn(async () => {})
    const node = () => ({ connect: vi.fn(function (this: unknown, n: unknown) { return n }), start: vi.fn(), stop: vi.fn(), frequency: { value: 0 }, gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } })
    class Ctx { state = 'suspended'; currentTime = 0; destination = {}; resume = resume; createOscillator = node; createGain = node }
    vi.stubGlobal('AudioContext', Ctx)
    return { resume }
}

describe('tones', () => {
    it('resumes a suspended audio context before playing', async () => {
        const { resume } = fakeAudio()
        const { playTone } = await import('./tones')
        playTone('in')
        expect(resume).toHaveBeenCalled()
    })

    it('unlocks the sound on the first touch', async () => {
        const { resume } = fakeAudio()
        const { unlockOnFirstTouch } = await import('./tones')
        const stop = unlockOnFirstTouch()
        document.dispatchEvent(new Event('pointerdown'))
        expect(resume).toHaveBeenCalledTimes(1)
        stop()
    })
})
