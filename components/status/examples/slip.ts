import type { ActivityEntry } from "../activity"
import type { Visit } from "../RouteTimeline"
import { statusOf, type StatusDef, type Workflow } from "../workflow"

const MIN = 60_000
const H = 60 * MIN

/** The fixed "now" of stories and tests: 26.10.2026 14:00. */
export const NOW = new Date(2026, 9, 26, 14, 0).getTime()

export type SlipCtx = { atStation: boolean; canReopen: boolean }

const REOPEN_HINT = "Wieder öffnen können Admins."
const reopen = (from: string) => ({ from, to: "in-arbeit", verb: "Wieder öffnen", when: (c: SlipCtx) => (c.canReopen ? null : REOPEN_HINT) })
const cancel = (from: string) => ({ from, to: "storniert", verb: "Stornieren", confirm: true, reason: "required" as const })

export const SLIP_WORKFLOW: Workflow<SlipCtx> = {
    statuses: [
        { id: "offen", label: "Offen", category: "planned" },
        { id: "in-arbeit", label: "In Arbeit", category: "active" },
        { id: "zurueckgestellt", label: "Zurückgestellt", category: "waiting" },
        { id: "fertig", label: "Fertig", category: "done" },
        { id: "storniert", label: "Storniert", category: "canceled" },
    ],
    transitions: [
        cancel("offen"),
        { from: "in-arbeit", to: "fertig", verb: "Fertig melden", primary: true, when: (c) => (c.atStation ? "Fertig melden geht erst nach dem Ausscannen" : null) },
        { from: "in-arbeit", to: "zurueckgestellt", verb: "Zurückstellen …", reason: "required" },
        cancel("in-arbeit"),
        { from: "zurueckgestellt", to: "in-arbeit", verb: "Fortsetzen", primary: true },
        cancel("zurueckgestellt"),
        reopen("fertig"),
        reopen("storniert"),
    ],
}

export { REOPEN_HINT }

export const STATIONS: { id: string; label: string; norm: number }[] = [
    { id: "3d", label: "3D", norm: 6 * H },
    { id: "guss", label: "Guss", norm: 4 * H },
    { id: "polissage", label: "Polissage", norm: 8 * H },
    { id: "versand", label: "Versand", norm: 2 * H },
]
export const stationLabel = (id: string) => STATIONS.find((s) => s.id === id)!.label
const visit = (station: string, from: number, to: number | null): Visit => ({ station, label: stationLabel(station), in: from, out: to, norm: STATIONS.find((s) => s.id === station)!.norm })

export type SlipState = {
    id: string
    orderId: string
    index: number
    total: number
    customer: string
    material: string
    status: string
    statusSince: number
    /** Scanned in here, or null */
    station: string | null
    /** Where it was last, while on the way */
    lastStation: string | null
    locationSince: number
    visits: Visit[]
    weight: number | null
    pieces: number
    closed: { at: number; by: string; reason?: string } | null
}

/** A history entry of one slip of the example. */
export type SlipEntry = ActivityEntry & { slip: string }

export type World = { slips: SlipState[]; activity: SlipEntry[]; seq: number }

export const number = (s: SlipState) => `${s.orderId} – ${s.index}/${s.total}`
export const slipStatus = (s: SlipState): StatusDef => statusOf(SLIP_WORKFLOW, s.status)
export const ME = "P. Mohr"

export function seedWorld(variant: "default" | "canceled" | "done-locked" = "default"): World {
    const base = { orderId: "26100013", total: 4, customer: "DÄHLER + BLASER", closed: null, lastStation: null }
    const slips: SlipState[] = [
        { ...base, id: "26100013-1", index: 1, material: "INOX", status: "in-arbeit", statusSince: NOW - 26 * H, station: "guss", locationSince: NOW - 5 * H,
            visits: [visit("3d", NOW - 26 * H, NOW - 22 * H), visit("guss", NOW - 5 * H, null)], weight: 412, pieces: 12 },
        { ...base, id: "26100013-2", index: 2, material: "Weissgold 750", status: "fertig", statusSince: NOW - 3 * H, station: null, lastStation: "versand", locationSince: NOW - 3 * H,
            visits: [visit("3d", NOW - 50 * H, NOW - 46 * H), visit("guss", NOW - 30 * H, NOW - 27 * H), visit("polissage", NOW - 26 * H, NOW - 20 * H), visit("versand", NOW - 4 * H, NOW - 3 * H)],
            weight: 86, pieces: 4, closed: { at: NOW - 3 * H, by: "M. Keller" } },
        { ...base, id: "26100013-3", index: 3, material: "Eisen", status: "offen", statusSince: NOW - 26 * H, station: null, locationSince: NOW - 26 * H, visits: [], weight: null, pieces: 20 },
        { ...base, id: "26100013-4", index: 4, material: "Bronze", status: "zurueckgestellt", statusSince: NOW - 2 * H, station: null, lastStation: "polissage", locationSince: NOW - 2 * H,
            visits: [visit("3d", NOW - 26 * H, NOW - 24 * H), visit("polissage", NOW - 6 * H, NOW - 2 * H)], weight: 230, pieces: 6 },
    ]
    const e = (id: string, at: number, rest: Omit<ActivityEntry, "id" | "at">): SlipEntry => ({ id, at, slip: "26100013-1", ...rest })
    const activity = [
        e("a1", NOW - 26 * H, { actor: "M. Keller", via: "scan", device: "Tablet 3D", kind: "location", text: "hat eingescannt in 3D" }),
        e("a2", NOW - 26 * H, { actor: "System", via: "system", kind: "status", from: "Offen", to: "In Arbeit" }),
        e("a3", NOW - 22 * H, { actor: "M. Keller", via: "scan", device: "Tablet 3D", kind: "location", text: "hat ausgescannt aus 3D" }),
        e("a4", NOW - 5 * H, { actor: "S. Ryser", via: "scan", device: "Tablet Guss", kind: "location", text: "hat eingescannt in Guss" }),
        e("a5", NOW - 4 * H, { actor: ME, via: "hand", kind: "field", field: "Stück", from: "10", to: "12" }),
        e("a6", NOW - 4 * H + 2 * MIN, { actor: ME, via: "hand", kind: "field", field: "Gewicht (g)", from: "398", to: "412" }),
    ]
    const world: World = { slips, activity, seq: 0 }
    if (variant === "canceled") {
        slips[0] = { ...slips[0], status: "storniert", statusSince: NOW - 1 * H, station: null, lastStation: "guss", locationSince: NOW - H,
            visits: [slips[0].visits[0], { ...slips[0].visits[1], out: NOW - H }], closed: { at: NOW - H, by: ME, reason: "Kunde hat abgesagt" } }
        activity.push(e("a7", NOW - H, { actor: ME, via: "hand", kind: "status", from: "In Arbeit", to: "Storniert", note: "Kunde hat abgesagt" }))
    }
    if (variant === "done-locked") {
        slips[0] = { ...slips[0], status: "fertig", statusSince: NOW - H, station: null, lastStation: "guss", locationSince: NOW - H,
            visits: [slips[0].visits[0], { ...slips[0].visits[1], out: NOW - H }], closed: { at: NOW - H, by: "S. Ryser" } }
        activity.push(e("a7", NOW - H, { actor: "S. Ryser", via: "hand", kind: "status", from: "In Arbeit", to: "Fertig" }))
    }
    return world
}

export type SlipEvent =
    | { type: "scan"; slip: string; station: string; actor: string; device: string; at: number }
    | { type: "transition"; slip: string; to: string; actor: string; reason?: string; at: number }
    | { type: "undo"; slip: string; previous: SlipState; actor: string; at: number }
    | { type: "field"; slip: string; field: "weight" | "pieces"; label: string; value: number | null; actor: string; at: number }

const label = (status: string) => statusOf(SLIP_WORKFLOW, status).label
const CLOSED = new Set(["fertig", "storniert"])

/** All changes of the example; every one leaves an entry (S-09). */
export function applyEvent(world: World, event: SlipEvent): World {
    const slip = world.slips.find((s) => s.id === event.slip)
    if (!slip) return world
    const entries: SlipEntry[] = []
    let seq = world.seq
    const add = (rest: Omit<ActivityEntry, "id" | "at">) => entries.push({ id: `e${++seq}`, at: event.at, slip: slip.id, ...rest })
    let next: SlipState = slip

    switch (event.type) {
        case "scan": {
            const visits = slip.visits.map((v) => (v.out === null ? { ...v, out: event.at } : v))
            if (slip.station === event.station) {
                next = { ...slip, visits, station: null, lastStation: event.station, locationSince: event.at }
                add({ actor: event.actor, via: "scan", device: event.device, kind: "location", text: `hat ausgescannt aus ${stationLabel(event.station)}` })
            } else {
                const nth = slip.visits.filter((v) => v.station === event.station).length + 1
                next = { ...slip, visits: [...visits, visit(event.station, event.at, null)], station: event.station, lastStation: null, locationSince: event.at }
                add({ actor: event.actor, via: "scan", device: event.device, kind: "location", text: `hat eingescannt in ${stationLabel(event.station)}${nth >= 2 ? ` (${nth}. Durchlauf)` : ""}` })
                if (slip.status === "offen") {
                    next = { ...next, status: "in-arbeit", statusSince: event.at }
                    add({ actor: "System", via: "system", kind: "status", from: label("offen"), to: label("in-arbeit") })
                }
            }
            break
        }
        case "transition": {
            next = {
                ...slip,
                status: event.to,
                statusSince: event.at,
                closed: CLOSED.has(event.to) ? { at: event.at, by: event.actor, reason: event.reason } : null,
            }
            add({ actor: event.actor, via: "hand", kind: "status", from: label(slip.status), to: label(event.to), note: event.reason })
            break
        }
        case "undo": {
            next = { ...event.previous }
            add({ actor: event.actor, via: "hand", kind: "status", from: label(slip.status), to: label(event.previous.status), note: "Rückgängig gemacht" })
            break
        }
        case "field": {
            const from = slip[event.field]
            if (from === event.value) return world
            next = { ...slip, [event.field]: event.value }
            add({ actor: event.actor, via: "hand", kind: "field", field: event.label, from: from === null ? "—" : String(from), to: event.value === null ? "—" : String(event.value) })
            break
        }
    }
    return { slips: world.slips.map((s) => (s.id === slip.id ? next : s)), activity: [...world.activity, ...entries], seq }
}

export const activityOf = (world: World, slip: string) => world.activity.filter((e) => e.slip === slip)
