const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const pad = (n: number) => String(n).padStart(2, "0")

/** "45 min", "2 h 10 min", "3 d 4 h". */
export function formatDuration(ms: number): string {
    if (ms < MIN) return "< 1 min"
    if (ms < HOUR) return `${Math.floor(ms / MIN)} min`
    if (ms < DAY) {
        const h = Math.floor(ms / HOUR)
        const m = Math.floor((ms % HOUR) / MIN)
        return m ? `${h} h ${m} min` : `${h} h`
    }
    const d = Math.floor(ms / DAY)
    const h = Math.floor((ms % DAY) / HOUR)
    return h ? `${d} d ${h} h` : `${d} d`
}

const date = (t: Date) => `${pad(t.getDate())}.${pad(t.getMonth() + 1)}.${t.getFullYear()}`
const clock = (t: Date) => `${pad(t.getHours())}:${pad(t.getMinutes())}`

/** "21.10.2026 14:05" in local time. */
export function formatDateTime(ms: number): string {
    const t = new Date(ms)
    return `${date(t)} ${clock(t)}`
}

const dayStart = (ms: number) => {
    const t = new Date(ms)
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()
}

/** Relative today, "gestern HH:MM" yesterday, a date before (S-11). */
export function formatRelative(ms: number, now: number): string {
    const diff = now - ms
    const today = dayStart(now)
    if (ms >= today) {
        if (diff < MIN) return "gerade eben"
        if (diff < HOUR) return `vor ${Math.floor(diff / MIN)} min`
        return `vor ${Math.floor(diff / HOUR)} h`
    }
    const t = new Date(ms)
    if (ms >= dayStart(today - 1)) return `gestern ${clock(t)}`
    return date(t)
}
