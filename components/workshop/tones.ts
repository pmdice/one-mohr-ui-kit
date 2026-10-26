export type ToneKind = "in" | "out" | "error"

const TONES: Record<ToneKind, { hz: number; ms: number }[]> = {
    in: [{ hz: 880, ms: 120 }],
    out: [{ hz: 660, ms: 90 }, { hz: 660, ms: 90 }],
    error: [{ hz: 220, ms: 300 }],
}
const VIBRATION: Record<ToneKind, number[]> = { in: [60], out: [60, 60, 60], error: [250] }

let context: AudioContext | null = null

function audio(): AudioContext | null {
    const Ctor = globalThis.AudioContext ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    context ??= new Ctor()
    // Browsers start audio suspended until a user gesture; resume is a no-op once running
    if (context.state === "suspended") void context.resume().catch(() => {})
    return context
}

/** A short tone per answer, made by Web Audio, no files (W-04). Silent where audio is unavailable. */
export function playTone(kind: ToneKind) {
    try {
        const ctx = audio()
        if (ctx) {
            let t = ctx.currentTime
            for (const { hz, ms } of TONES[kind]) {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.frequency.value = hz
                // Short ramps in and out, so the tone does not click
                gain.gain.setValueAtTime(0, t)
                gain.gain.linearRampToValueAtTime(0.2, t + 0.01)
                gain.gain.linearRampToValueAtTime(0, t + ms / 1000)
                osc.connect(gain).connect(ctx.destination)
                osc.start(t)
                osc.stop(t + ms / 1000)
                t += (ms + 60) / 1000
            }
        }
        navigator.vibrate?.(VIBRATION[kind])
    } catch { /* no sound is better than no scan */ }
}

/** Unlocks the sound on the first touch or key after the page loaded (autoplay rules). Returns a cleanup. */
export function unlockOnFirstTouch(): () => void {
    const unlock = () => {
        try { audio() } catch { /* stay silent */ }
        stop()
    }
    const stop = () => {
        document.removeEventListener("pointerdown", unlock)
        document.removeEventListener("keydown", unlock)
    }
    document.addEventListener("pointerdown", unlock)
    document.addEventListener("keydown", unlock)
    return stop
}
