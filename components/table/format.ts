/** Shown for a missing value: an empty cell and a zero mean different things (L-02). */
export const EMPTY = "—"

/** Swiss grouping with ’, decimals with a point: 1234567 → "1’234’567". */
export function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) return EMPTY
    const [int, dec] = String(Math.abs(value)).split(".")
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "’")
    return `${value < 0 ? "-" : ""}${grouped}${dec ? `.${dec}` : ""}`
}

/** ISO date (YYYY-MM-DD) as DD.MM.YYYY. */
export function formatDate(iso: string | null | undefined): string {
    if (!iso) return EMPTY
    const [y, m, d] = iso.slice(0, 10).split("-")
    return `${d}.${m}.${y}`
}
