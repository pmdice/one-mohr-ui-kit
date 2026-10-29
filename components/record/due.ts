import { addDays, formatDate, weekday } from "@/components/inputs/parse"

const DAY = 86_400_000
const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY)

/**
 * A date as distance and as date (D-06): "in 5 Tagen" next to "Fr, 14.11.2026". A date in the past is
 * overdue by default (a due date); `past: "neutral"` for things that simply happened.
 */
export function formatDue(iso: string, today: string, { past = "overdue" }: { past?: "overdue" | "neutral" } = {}): { relative: string; absolute: string; overdue: boolean } {
    const absolute = `${weekday(iso)}, ${formatDate(iso)}`
    const diff = daysBetween(today, iso)
    if (diff === 0) return { relative: "heute", absolute, overdue: false }
    if (diff === 1) return { relative: "morgen", absolute, overdue: false }
    if (diff > 1) return { relative: `in ${diff} Tagen`, absolute, overdue: false }
    const ago = -diff
    if (past === "neutral") return { relative: ago === 1 ? "gestern" : `vor ${ago} Tagen`, absolute, overdue: false }
    return { relative: ago === 1 ? "seit gestern überfällig" : `seit ${ago} Tagen überfällig`, absolute, overdue: true }
}

export { addDays }
