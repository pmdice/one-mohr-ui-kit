import type { ActiveFilter, FilterField } from "../FilterBar"
import type { Sort } from "../DataTable"
import { addDays } from "@/components/inputs/parse"

export type Urgency = "dringend" | "hoch" | "normal" | "niedrig"
export type Station = "offen" | "3d" | "guss" | "polissage" | "versand"

export type Slip = {
    id: string
    orderId: string
    index: number
    total: number
    urgency: Urgency
    material: string
    customerId: string
    customer: string
    station: Station
    /** ISO date */
    castDate: string
    pieces: number
    /** grams; null = not weighed yet */
    weight: number | null
}

export const URGENCY: { value: Urgency; label: string; rank: number }[] = [
    { value: "dringend", label: "Dringend", rank: 4 },
    { value: "hoch", label: "Hoch", rank: 3 },
    { value: "normal", label: "Normal", rank: 2 },
    { value: "niedrig", label: "Niedrig", rank: 1 },
]
export const STATIONS: { value: Station; label: string }[] = [
    { value: "offen", label: "Nicht gescannt" },
    { value: "3d", label: "3D" },
    { value: "guss", label: "Guss" },
    { value: "polissage", label: "Polissage" },
    { value: "versand", label: "Versand" },
]
const MATERIALS = ["INOX", "Weissgold 750", "Gelbgold 750", "Silber 925", "Bronze", "Eisen", "Platin 950"]
const CUSTOMERS = [
    ["10073", "DÄHLER + BLASER"], ["10002", "ALLENSPACH AG"], ["10207", "SENNHAUSER AG"], ["10038", "BISE Pierre A."],
    ["10869", "BLASER Fabian"], ["10004", "DÜBY Ralph"], ["10003", "CENTURY TIME GEMS LTD."], ["10006", "DÖPPER Werner"],
    ["10111", "GOLDSCHMIEDE AM MARKT GMBH"], ["10155", "ATELIER RENFER"],
]

/** Deterministic pseudo random numbers, so stories and tests always see the same list. */
function seeded(seed: number) {
    let s = seed
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296
        return s / 4294967296
    }
}

function build(count: number): Slip[] {
    const rand = seeded(42)
    const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)]
    const slips: Slip[] = []
    let order = 26100001
    while (slips.length < count) {
        const total = 1 + Math.floor(rand() * 4)
        const [customerId, customer] = pick(CUSTOMERS)
        const urgency = pick(["dringend", "hoch", "hoch", "normal", "normal", "normal", "niedrig"] as Urgency[])
        for (let index = 1; index <= total && slips.length < count; index++) {
            const day = 1 + Math.floor(rand() * 28)
            const station = pick(["offen", "offen", "3d", "guss", "guss", "polissage", "versand"] as Station[])
            slips.push({
                id: `${order}-${index}`,
                orderId: String(order),
                index,
                total,
                urgency,
                material: pick(MATERIALS),
                customerId,
                customer,
                station,
                castDate: `2026-${rand() > 0.5 ? "10" : "09"}-${String(day).padStart(2, "0")}`,
                pieces: 1 + Math.floor(rand() * 40),
                weight: station === "offen" || station === "3d" ? null : Math.round(rand() * 2400),
            })
        }
        order++
    }
    return slips
}

export const SLIPS: Slip[] = build(300)

export const slipNumber = (s: Slip) => `${s.orderId} – ${s.index}/${s.total}`
export const urgencyOf = (u: Urgency) => URGENCY.find((x) => x.value === u)!
export const stationLabel = (st: Station) => STATIONS.find((x) => x.value === st)!.label

/** "Today" of the example data, and a due date four weeks after casting. */
export const TODAY = "2026-10-29"
export const dueOf = (s: Slip) => addDays(s.castDate, 28)

export const FILTER_FIELDS: FilterField[] = [
    { id: "station", label: "Station", options: STATIONS },
    { id: "urgency", label: "Dringlichkeit", options: URGENCY },
    { id: "material", label: "Material", options: MATERIALS.map((m) => ({ value: m, label: m })) },
    { id: "frist", label: "Frist", options: [{ value: "ueberfaellig", label: "Überfällig" }] },
]

/** Fields that are computed, not stored on the slip. */
const DERIVED: Record<string, (s: Slip) => string> = {
    frist: (s) => (dueOf(s) < TODAY ? "ueberfaellig" : ""),
}

export type SlipQuery = { filters: ActiveFilter[]; q: string; sort: Sort; page: number; pageSize: number }
export type SlipResult = { rows: Slip[]; total: number; filteredTotal: number; matchingIds: string[] }

/** Default order (L-06): most urgent first, then the oldest cast date. */
function defaultCompare(a: Slip, b: Slip) {
    return urgencyOf(b.urgency).rank - urgencyOf(a.urgency).rank || a.castDate.localeCompare(b.castDate) || a.id.localeCompare(b.id)
}

const SORT_KEYS: Record<string, (s: Slip) => number | string> = {
    urgency: (s) => urgencyOf(s.urgency).rank,
    number: (s) => s.id,
    castDate: (s) => s.castDate,
    pieces: (s) => s.pieces,
    weight: (s) => s.weight ?? -1,
    due: (s) => dueOf(s),
}

/** The "server": filter (same field = or, different fields = and), search, sort, page. */
export function querySlips({ filters, q, sort, page, pageSize }: SlipQuery, source: Slip[] = SLIPS): SlipResult {
    const byField = new Map<string, string[]>()
    for (const f of filters) byField.set(f.field, [...(byField.get(f.field) ?? []), f.value])
    const term = q.trim().toLowerCase()
    const matching = source.filter((s) => {
        for (const [field, values] of byField) if (!values.includes(DERIVED[field]?.(s) ?? String(s[field as keyof Slip]))) return false
        return !term || slipNumber(s).toLowerCase().includes(term) || s.id.includes(term) || s.customer.toLowerCase().includes(term)
    })
    const key = sort ? SORT_KEYS[sort.id] : null
    const sorted = [...matching].sort((a, b) => {
        if (!key || !sort) return defaultCompare(a, b)
        const va = key(a), vb = key(b)
        const cmp = va < vb ? -1 : va > vb ? 1 : 0
        return (sort.dir === "asc" ? cmp : -cmp) || defaultCompare(a, b)
    })
    return {
        rows: sorted.slice((page - 1) * pageSize, page * pageSize),
        total: source.length,
        filteredTotal: matching.length,
        matchingIds: sorted.map((s) => s.id),
    }
}
