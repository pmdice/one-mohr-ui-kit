export type ToneKind = "in" | "out" | "error"

const TONES: Record<ToneKind, { hz: number; ms: number }[]> = {
    in: [{ hz: 880, ms: 120 }],
    out: [{ hz: 660, ms: 90 }, { hz: 660, ms: 90 }],
    error: [{ hz: 220, ms: 300 }],
}
const VIBRATION: Record<ToneKind, number[]> = { in: [60], out: [60, 60, 60], error: [250] }

let context: AudioContext | null = null

/** A short tone per answer, made by Web Audio, no files (W-04). Silent where audio is unavailable. */
export function playTone(kind: ToneKind) {
    try {
        const Ctor = globalThis.AudioContext ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (Ctor) {
            context ??= new Ctor()
            let t = context.currentTime
            for (const { hz, ms } of TONES[kind]) {
                const osc = context.createOscillator()
                const gain = context.createGain()
                osc.frequency.value = hz
                gain.gain.value = 0.2
                osc.connect(gain).connect(context.destination)
                osc.start(t)
                osc.stop(t + ms / 1000)
                t += (ms + 60) / 1000
            }
        }
        navigator.vibrate?.(VIBRATION[kind])
    } catch { /* no sound is better than no scan */ }
}
