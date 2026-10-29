"use client"

import * as React from "react"
import { DataFreshness } from "@/components/home/DataFreshness"
import { RecentList } from "@/components/home/RecentList"
import { StatTile } from "@/components/home/StatTile"
import { WorkQueue } from "@/components/home/WorkQueue"

/* Live examples for the start page rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

const NOW = new Date(2026, 9, 29, 10, 30).getTime()
const ITEMS = [
    { id: "a", title: "26100013 – 1/4", meta: "Dähler + Blaser · Guss · Dringend", href: "#a", reason: "seit 2 Tagen überfällig", tone: "warning" as const },
    { id: "b", title: "26100021 – 1/1", meta: "Bucherer · Guss", href: "#b", reason: "heute fällig" },
    { id: "c", title: "26100030 – 2/3", meta: "Gübelin · Guss", href: "#c", reason: "morgen" },
]
const Tile = ({ n, label, color }: { n: number | string; label: string; color: string }) => (
    <div className="rounded-panel p-3 text-surface" style={{ background: color }}><div className="text-2xl font-bold">{n}</div><div className="text-xs">{label}</div></div>
)

export const A01Good = () => <WorkQueue title="An Guss" items={ITEMS} total={14} moreHref="#alle" empty={{ text: "" }} />
export const A01Bad = () => (
    <div className="flex flex-col gap-2">
        <p className="m-0 text-lg font-semibold">Willkommen zurück, Sandra! 👋</p>
        <div className="grid grid-cols-3 gap-2">
            {/* token-guard: allow — anti-pattern: colour without meaning */}
            <Tile n={3012} label="Laufzettel" color="#7c3aed" /><Tile n={287} label="Aufträge" color="#0d9488" /><Tile n="94 %" label="Auslastung" color="#db2777" />
        </div>
    </div>
)

export const A02Good = () => <WorkQueue title="An Guss (meine Station)" items={ITEMS.slice(0, 2)} total={14} moreHref="#alle" empty={{ text: "" }} />
export const A02Bad = () => <WorkQueue title="Alle Laufzettel" items={[{ id: "x", title: "26100001 – 1/2", meta: "Allenspach · Versand", href: "#x", reason: "" }, { id: "y", title: "26100002 – 1/3", meta: "Sennhauser · 3D", href: "#y", reason: "" }]} total={3012} empty={{ text: "" }} />

export const A03Good = () => <WorkQueue title="An Guss" items={ITEMS} empty={{ text: "" }} />
export const A03Bad = () => <WorkQueue title="An Guss" items={[...ITEMS].reverse().map((i) => ({ ...i, reason: "", tone: undefined }))} empty={{ text: "" }} />

export const A04Good = () => <WorkQueue title="An Polissage" items={[]} empty={{ text: "Nichts überfällig und nichts heute fällig.", next: "Nächster Termin: Mo, 02.11.2026" }} />
export const A04Bad = () => <div className="rounded-panel border border-border p-4 text-center text-lg">🎉 Super! Alles erledigt! 🎉</div>

export const A05Good = () => (
    <div className="grid grid-cols-2 gap-2">
        <StatTile label="überfällig" value={3} href="#laufzettel?frist=ueberfaellig" detail="Laufzettel an Guss" tone="warning" />
        <StatTile label="dringend" value={2} href="#laufzettel?dringlichkeit=dringend" detail="Laufzettel an Guss" />
    </div>
)
export const A05Bad = () => <div className="flex gap-4 text-sm"><span><b className="text-xl">3</b> überfällig</span><span><b className="text-xl">2</b> dringend</span><span className="text-fg-muted">(nicht klickbar)</span></div>

export const A06Good = () => <DataFreshness at={NOW - 5 * 60_000} now={NOW} onRefresh={() => {}} />
export const A06Bad = () => <span className="text-sm">3 überfällig</span>

export const A07Good = () => <RecentList items={[{ id: "1", kind: "Auftrag", label: "26100013 · Ringe Herbst 2026", href: "#1" }, { id: "2", kind: "Kunde", label: "Dähler + Blaser", href: "#2" }]} />
export const A07Bad = () => <p className="m-0 text-sm text-fg-muted">Suche: _______ (Welcher Auftrag war das vorhin?)</p>

export const A08Good = () => (
    <div className="grid grid-cols-3 gap-2 text-xs">
        {[["Büro", "Zu planen 42"], ["Werkstatt", "An Guss 14"], ["Teamleitung", "Hängt fest 9"]].map(([r, t]) => (
            <div key={r} className="flex flex-col gap-1 rounded-panel border border-border p-2"><span className="text-fg-muted">{r}</span><span className="font-medium">{t}</span></div>
        ))}
    </div>
)
export const A08Bad = () => <p className="m-0 text-sm text-fg-muted">Alle Rollen sehen dasselbe Dashboard mit 12 Kacheln.</p>
