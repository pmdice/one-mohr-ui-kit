"use client"

import * as React from "react"
import { RadioGroup } from "@/components/inputs/RadioGroup"
import { formatDue } from "@/components/record/due"
import type { ActiveFilter } from "@/components/table/FilterBar"
import { TODAY, dueOf, querySlips, slipNumber, stationLabel, type Slip } from "@/components/table/examples/slips"
import { DataFreshness } from "../DataFreshness"
import { RecentList } from "../RecentList"
import { StatTile } from "../StatTile"
import { WorkQueue, type QueueItem } from "../WorkQueue"

export { TODAY, dueOf }
const NOW = new Date(2026, 9, 29, 10, 30).getTime()
/** As many rows as a related list shows (D-09). */
const SHOWN = 5

type Role = "buero" | "werkstatt" | "leitung"
const ROLES = [{ value: "buero", label: "Büro" }, { value: "werkstatt", label: "Werkstatt" }, { value: "leitung", label: "Teamleitung" }]

const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s+-])\p{L}/gu, (m) => m.toUpperCase())

/** One filter object for both the number and the link, so they cannot drift apart (A-05). */
type View = { filters: ActiveFilter[]; sort?: "due" }
const f = (field: string, ...values: string[]): ActiveFilter[] => values.map((value) => ({ field, value }))

function hrefOf({ filters, sort }: View) {
    const byField = new Map<string, string[]>()
    for (const x of filters) byField.set(x.field, [...(byField.get(x.field) ?? []), x.value])
    const params = new URLSearchParams([...byField].map(([k, v]) => [k, v.join(",")]))
    if (sort) params.set("sort", sort)
    return `#laufzettel?${params.toString().replace(/%2C/g, ",")}`
}

/** The list's own query: same filters, same order (A-03: by due date, then the list's default). */
function run({ filters, sort }: View) {
    return querySlips({ filters, q: "", sort: sort ? { id: sort, dir: "asc" } : null, page: 1, pageSize: 10_000 })
}

function toItem(s: Slip): QueueItem {
    const due = formatDue(dueOf(s), TODAY)
    return {
        id: s.id,
        title: slipNumber(s),
        meta: `${titleCase(s.customer)} · ${stationLabel(s.station)}${s.urgency === "dringend" ? " · Dringend" : ""}`,
        href: `#laufzettel-${s.id}`,
        reason: due.relative === "heute" ? "heute fällig" : due.relative,
        tone: due.overdue ? "warning" : undefined,
    }
}

const STUCK = f("station", "offen", "3d", "guss", "polissage")

const VIEWS: Record<Role, { title: string; queue: View; tiles: { label: string; detail: string; view: View; tone?: "warning" }[]; empty: string }> = {
    werkstatt: {
        title: "An Guss",
        queue: { filters: f("station", "guss"), sort: "due" },
        tiles: [
            { label: "an Guss", detail: "Laufzettel", view: { filters: f("station", "guss") } },
            { label: "überfällig", detail: "Laufzettel", view: { filters: [...f("station", "guss"), ...f("frist", "ueberfaellig")] }, tone: "warning" },
            { label: "dringend", detail: "Laufzettel", view: { filters: [...f("station", "guss"), ...f("urgency", "dringend")] } },
        ],
        empty: "An Guss liegt nichts.",
    },
    buero: {
        title: "Zu planen",
        queue: { filters: f("station", "offen"), sort: "due" },
        tiles: [
            { label: "zu planen", detail: "nicht gescannte Laufzettel", view: { filters: f("station", "offen") } },
            { label: "versandbereit", detail: "Laufzettel", view: { filters: f("station", "versand") } },
        ],
        empty: "Nichts zu planen.",
    },
    leitung: {
        title: "Hängt fest",
        queue: { filters: [...STUCK, ...f("frist", "ueberfaellig")], sort: "due" },
        tiles: [
            { label: "überfällig", detail: "noch nicht im Versand", view: { filters: [...STUCK, ...f("frist", "ueberfaellig")] }, tone: "warning" },
            { label: "dringend", detail: "davon dringend", view: { filters: [...STUCK, ...f("frist", "ueberfaellig"), ...f("urgency", "dringend")] } },
        ],
        empty: "Nichts hängt fest.",
    },
}

/** The start page for three roles (A-01–A-08): same parts, the work of each role. */
export function HomeExample() {
    const [role, setRole] = React.useState<Role>("werkstatt")
    const [at, setAt] = React.useState(NOW - 5 * 60_000)
    const view = VIEWS[role]
    const queue = run(view.queue)
    // The next date comes from the data, not from the calendar (A-04)
    const next = run({ filters: view.queue.filters.filter((x) => x.field !== "frist"), sort: "due" }).rows.map(dueOf).find((d) => d >= TODAY)

    return (
        <div className="flex min-h-full flex-col gap-4 bg-surface-sunken p-4 text-fg" data-density="compact">
            <section aria-label="Simulation" className="flex flex-wrap items-end gap-6 rounded-panel border border-dashed border-border-strong p-3 text-sm">
                <RadioGroup label="Angemeldet als" variant="segments" value={role} onChange={(v) => setRole(v as Role)} options={ROLES} />
            </section>

            <div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h1 className="m-0 text-xl font-semibold">Heute</h1>
                        <DataFreshness at={at} now={NOW} onRefresh={() => setAt(NOW)} />
                    </div>
                    <WorkQueue
                        title={view.title}
                        items={queue.rows.slice(0, SHOWN).map(toItem)}
                        total={queue.filteredTotal}
                        moreHref={hrefOf(view.queue)}
                        empty={{ text: view.empty, next: next ? `Nächster Termin: ${formatDue(next, TODAY).absolute}` : undefined }}
                    />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {view.tiles.map((t) => <StatTile key={t.label} label={t.label} detail={t.detail} tone={t.tone} value={run(t.view).filteredTotal} href={hrefOf(t.view)} />)}
                    </div>
                </div>
                <aside className="flex flex-col gap-4">
                    <RecentList items={[
                        { id: "r1", kind: "Auftrag", label: "26100013 · Ringe Herbst 2026", href: "#auftrag-26100013" },
                        { id: "r2", kind: "Laufzettel", label: "26100021 – 1/1", href: "#laufzettel-26100021-1" },
                        { id: "r3", kind: "Kunde", label: "Dähler + Blaser", href: "#kunde-10073" },
                    ]} />
                </aside>
            </div>
        </div>
    )
}
