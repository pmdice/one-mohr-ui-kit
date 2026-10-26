import { normalizeIdentifier } from "@/components/nav/identifier"

export type ScanTarget = {
    /** The printed code, written any way (N-06). */
    code: string
    label: string
    /** Station the slip is scanned in at, or null. */
    station: string | null
    /** Status word when the slip is closed ("storniert"), else null. */
    locked: string | null
    visits: { station: string }[]
}

export type ScanResult = {
    kind: "in" | "out" | "duplicate" | "unknown" | "locked"
    target?: ScanTarget
    /** Which visit of this station a scan-in starts. */
    visit?: number
    message: string
}

/**
 * What one scan at a station means (S-07): in where the slip is not, out where it is. The same code
 * again within `dedupeMs` is a double read and does nothing.
 */
export function resolveScan({ code, station, stationLabel, targets, lastScans, now, dedupeMs = 3000 }: {
    code: string
    station: string
    stationLabel: string
    targets: ScanTarget[]
    /** Normalized code → time of its last accepted scan. */
    lastScans: Map<string, number>
    now: number
    dedupeMs?: number
}): ScanResult {
    const key = normalizeIdentifier(code)
    const target = targets.find((t) => normalizeIdentifier(t.code) === key)
    if (!target) return { kind: "unknown", message: `Unbekannter Code: ${code.trim()}` }
    const last = lastScans.get(key)
    if (last !== undefined && now - last < dedupeMs) return { kind: "duplicate", target, message: `Schon erfasst: ${target.label}` }
    if (target.locked) return { kind: "locked", target, message: `${target.label} ist ${target.locked}. Kein Scan möglich.` }
    if (target.station === station) return { kind: "out", target, message: `${target.label} ausgescannt aus ${stationLabel}` }
    const visit = target.visits.filter((v) => v.station === station).length + 1
    return {
        kind: "in",
        target,
        visit,
        message: `${target.label} eingescannt in ${stationLabel}${visit >= 2 ? ` (${visit}. Durchlauf)` : ""}`,
    }
}
