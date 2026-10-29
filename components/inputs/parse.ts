/*
 * Reading and writing numbers, money and dates the Swiss way (E-04, E-05, E-06).
 * Generous when reading, strict when writing. Plain functions, so they port to PHP one to one.
 */

export type Read<T> = { ok: true; value: T } | { ok: false; reason: string }

/** Strips group separators and turns a comma into the decimal point; null when the text is empty. */
function normalize(text: string): { ok: true; s: string | null } | { ok: false; reason: string } {
    const s = text.trim().replace(/['’\s]/g, "").replace(/,/g, ".")
    if (s === "") return { ok: true, s: null }
    if ((s.match(/\./g) ?? []).length > 1) return { ok: false, reason: "Mehr als ein Komma oder Punkt" }
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return { ok: false, reason: "Keine Zahl" }
    return { ok: true, s }
}

export function parseNumber(text: string, { decimals }: { decimals?: number } = {}): Read<number | null> {
    const n = normalize(text)
    if (!n.ok) return n
    if (n.s === null) return { ok: true, value: null }
    const value = Number(n.s)
    if (decimals === 0 && !Number.isInteger(value)) return { ok: false, reason: "Nur ganze Zahlen" }
    if (decimals === undefined) return { ok: true, value }
    const factor = 10 ** decimals
    return { ok: true, value: Math.round(value * factor) / factor }
}

const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, "’")

/** 1234.5 → "1’234.5"; with `decimals` always that many places. Empty for no value. */
export function formatNumber(value: number | null | undefined, { decimals }: { decimals?: number } = {}): string {
    if (value === null || value === undefined || Number.isNaN(value)) return ""
    const [int, dec] = (decimals === undefined ? String(Math.abs(value)) : Math.abs(value).toFixed(decimals)).split(".")
    const negative = value < 0 && Number(`${int}.${dec ?? 0}`) !== 0
    return `${negative ? "-" : ""}${group(int)}${dec ? `.${dec}` : ""}`
}

/** Money as whole cents, read from the text itself so no floating point is involved. */
export function parseMoney(text: string): { ok: true; cents: number | null } | { ok: false; reason: string } {
    const n = normalize(text)
    if (!n.ok) return n
    if (n.s === null) return { ok: true, cents: null }
    const negative = n.s.startsWith("-")
    const [int, frac = ""] = n.s.replace("-", "").split(".")
    if (frac.length > 2) return { ok: false, reason: "Höchstens zwei Stellen nach dem Punkt" }
    const cents = Number(int || "0") * 100 + Number(frac.padEnd(2, "0"))
    return { ok: true, cents: negative && cents !== 0 ? -cents : cents }
}

/** 123450 → "1’234.50". Empty for no value. */
export function formatMoney(cents: number | null | undefined): string {
    if (cents === null || cents === undefined) return ""
    const abs = Math.abs(cents)
    return `${cents < 0 ? "-" : ""}${group(String(Math.floor(abs / 100)))}.${String(abs % 100).padStart(2, "0")}`
}

/* ---------- dates: ISO strings (YYYY-MM-DD) inside, TT.MM.JJJJ outside ---------- */

const pad = (n: number) => String(n).padStart(2, "0")

export function toIso(y: number, m: number, d: number): string {
    return `${y}-${pad(m)}-${pad(d)}`
}

function utc(iso: string): Date {
    const [y, m, d] = iso.split("-").map(Number)
    return new Date(Date.UTC(y, m - 1, d))
}

export function addDays(iso: string, days: number): string {
    const date = utc(iso)
    date.setUTCDate(date.getUTCDate() + days)
    return toIso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

/** Same day in another month, or the last day if that month is shorter (31.01. + 1 → 28.02.). */
export function addMonths(iso: string, months: number): string {
    const [y, m, d] = iso.split("-").map(Number)
    const first = new Date(Date.UTC(y, m - 1 + months, 1))
    const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
    return toIso(first.getUTCFullYear(), first.getUTCMonth() + 1, Math.min(d, last))
}

function valid(y: number, m: number, d: number): string | null {
    const date = new Date(Date.UTC(y, m - 1, d))
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? toIso(y, m, d) : null
}

const NOT_A_DATE = "Kein Datum. Beispiel: 14.11.2026, morgen, +3"

/** Reads 14.11.2026, 14.11.26, 14.11., 14112026, heute, morgen, +3 and ISO (E-05). */
export function parseDate(text: string, today: string): Read<string | null> {
    const t = text.trim().toLowerCase()
    if (t === "") return { ok: true, value: null }
    if (t === "heute") return { ok: true, value: today }
    if (t === "morgen") return { ok: true, value: addDays(today, 1) }
    const plus = t.match(/^\+(\d{1,3})$/)
    if (plus) return { ok: true, value: addDays(today, Number(plus[1])) }

    let parts: [number, number, number] | null = null
    const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    const compact = t.match(/^(\d{2})(\d{2})(\d{4})$/)
    const dotted = t.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2}|\d{4})?)?$/)
    if (iso) parts = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    else if (compact) parts = [Number(compact[3]), Number(compact[2]), Number(compact[1])]
    else if (dotted) {
        const year = dotted[3] === undefined ? Number(today.slice(0, 4)) : dotted[3].length === 2 ? 2000 + Number(dotted[3]) : Number(dotted[3])
        parts = [year, Number(dotted[2]), Number(dotted[1])]
    }
    if (!parts) return { ok: false, reason: NOT_A_DATE }
    const value = valid(...parts)
    return value ? { ok: true, value } : { ok: false, reason: "Diesen Tag gibt es nicht" }
}

/** "2026-11-14" → "14.11.2026". Empty for no value. */
export function formatDate(iso: string | null | undefined): string {
    if (!iso) return ""
    const [y, m, d] = iso.slice(0, 10).split("-")
    return `${d}.${m}.${y}`
}

export const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

export function weekday(iso: string): string {
    return WEEKDAYS[utc(iso).getUTCDay()]
}

/** 512 → "512 B", 2048 → "2 KB", 14.2 MB → "14.2 MB". */
export function formatBytes(bytes: number): string {
    const one = (n: number) => n.toFixed(1).replace(/\.0$/, "")
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${one(bytes / 1024)} KB`
    return `${one(bytes / 1024 / 1024)} MB`
}
