"use client"

import * as React from "react"
import { RadioGroup } from "@/components/inputs/RadioGroup"
import { addDays } from "@/components/inputs/parse"
import { formatDue } from "@/components/record/due"
import { SLIPS, slipNumber, stationLabel, urgencyOf, type Slip } from "@/components/table/examples/slips"
import { DataFreshness } from "../DataFreshness"
import { RecentList } from "../RecentList"
import { StatTile } from "../StatTile"
import { WorkQueue, type QueueItem } from "../WorkQueue"

export const TODAY = "2026-10-29"
const NOW = new Date(2026, 9, 29, 10, 30).getTime()

/** The example's due date: four weeks after casting. */
export const dueOf = (s: Slip) => addDays(s.castDate, 28)

type Role = "buero" | "werkstatt" | "leitung"
const ROLES = [{ value: "buero", label: "Büro" }, { value: "werkstatt", label: "Werkstatt" }, { value: "leitung", label: "Teamleitung" }]

const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s+-])\p{L}/gu, (m) => m.toUpperCase())
const href = (params: Record<string, string>) => `#laufzettel?${new URLSearchParams(params).toString()}`

/** Overdue first (longest first), then today, then later; at equal date the more urgent first (A-03). */
function sortByDue(slips: Slip[]) {
    return [...slips].sort((a, b) => dueOf(a).localeCompare(dueOf(b)) || urgencyOf(b.urgency).rank - urgencyOf(a.urgency).rank)
}

function toItem(s: Slip, prefix = ""): QueueItem {
    const due = formatDue(dueOf(s), TODAY)
    return {
        id: s.id,
        title: slipNumber(s),
        meta: `${titleCase(s.customer)} · ${stationLabel(s.station)}${s.urgency === "dringend" ? " · Dringend" : ""}`,
        href: `#laufzettel-${s.id}`,
        reason: `${prefix}${due.relative === "heute" ? "heute fällig" : due.relative}`,
        tone: due.overdue ? "warning" : undefined,
    }
}

/** The start page for three roles (A-01–A-08): same parts, the work of each role. */
export function HomeExample() {
    const [role, setRole] = React.useState<Role>("werkstatt")
    const [at, setAt] = React.useState(NOW - 5 * 60_000)

    const view = React.useMemo(() => {
        if (role === "werkstatt") {
            const mine = SLIPS.filter((s) => s.station === "guss")
            const overdue = mine.filter((s) => dueOf(s) < TODAY)
            return {
                title: "An Guss",
                queue: sortByDue(mine),
                tiles: [
                    { label: "an Guss", value: mine.length, href: href({ station: "guss" }), detail: "Laufzettel" },
                    { label: "überfällig", value: overdue.length, href: href({ station: "guss", frist: "ueberfaellig" }), detail: "Laufzettel", tone: "warning" as const },
                    { label: "dringend", value: mine.filter((s) => s.urgency === "dringend").length, href: href({ station: "guss", dringlichkeit: "dringend" }), detail: "Laufzettel" },
                ],
                more: href({ station: "guss" }),
                empty: { text: "An Guss liegt nichts.", next: "Neue Laufzettel kommen aus dem 3D-Druck." },
            }
        }
        if (role === "buero") {
            const plan = SLIPS.filter((s) => s.station === "offen")
            return {
                title: "Zu planen",
                queue: sortByDue(plan),
                tiles: [
                    { label: "zu planen", value: plan.length, href: href({ station: "offen" }), detail: "nicht gescannte Laufzettel" },
                    { label: "versandbereit", value: SLIPS.filter((s) => s.station === "versand").length, href: href({ station: "versand" }), detail: "Laufzettel" },
                ],
                more: href({ station: "offen" }),
                empty: { text: "Nichts zu planen.", next: "Neue Aufträge erscheinen hier, sobald sie erfasst sind." },
            }
        }
        const stuck = SLIPS.filter((s) => s.station !== "versand" && dueOf(s) < TODAY)
        return {
            title: "Hängt fest",
            queue: sortByDue(stuck),
            tiles: [
                { label: "überfällig", value: stuck.length, href: href({ frist: "ueberfaellig" }), detail: "Laufzettel an allen Stationen", tone: "warning" as const },
                { label: "dringend", value: stuck.filter((s) => s.urgency === "dringend").length, href: href({ frist: "ueberfaellig", dringlichkeit: "dringend" }), detail: "davon dringend" },
            ],
            more: href({ frist: "ueberfaellig" }),
            empty: { text: "Nichts hängt fest.", next: `Nächster Termin: ${formatDue(addDays(TODAY, 1), TODAY).absolute}` },
        }
    }, [role])

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
                    <WorkQueue title={view.title} items={view.queue.slice(0, 6).map((s) => toItem(s))} total={view.queue.length} moreHref={view.more} empty={view.empty} />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {view.tiles.map((t) => <StatTile key={t.label} {...t} />)}
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
