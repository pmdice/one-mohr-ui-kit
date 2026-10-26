"use client"

import * as React from "react"
import { Check, ChevronDown, Lock } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { LinkProvider } from "@/components/nav/NavLink"
import { ActivityLog } from "@/components/status/ActivityLog"
import type { ActivityEntry } from "@/components/status/activity"
import { ConfirmDialog } from "@/components/status/ConfirmDialog"
import { LockedNotice } from "@/components/status/LockedNotice"
import { RouteTimeline, type Visit } from "@/components/status/RouteTimeline"
import { resolveScan, type ScanTarget } from "@/components/status/scan"
import { ScanField } from "@/components/status/ScanField"
import { StatusBadge } from "@/components/status/StatusBadge"
import { StatusMenu } from "@/components/status/StatusMenu"
import { UndoNotice } from "@/components/status/UndoNotice"
import { deriveStatus, type StatusDef } from "@/components/status/workflow"
import { NOW, SLIP_WORKFLOW } from "@/components/status/examples/slip"
import { cn } from "@/lib/utils"

/* Live examples for the status rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

function NoopLink({ href, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return <a href={href} onClick={(e) => { onClick?.(e); e.preventDefault() }} {...props} />
}

const H = 3_600_000
const MIN = 60_000
const S = (id: string) => SLIP_WORKFLOW.statuses.find((s) => s.id === id)!
const Pill = ({ className, children }: { className: string; children: React.ReactNode }) => (
    <span className={cn("inline-flex rounded-control px-2 py-0.5 text-xs font-medium text-accent-fg", className)}>{children}</span>
)
const Row = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-center gap-2">{children}</div>

/* ---------- S-01 ---------- */
export const S01Good = () => <Row>{SLIP_WORKFLOW.statuses.map((s) => <StatusBadge key={s.id} status={s} />)}</Row>
export const S01Bad = () => (
    <Row>
        <Pill className="bg-fg-subtle">Offen</Pill>
        <Pill className="bg-accent">In Arbeit</Pill>
        <Pill className="bg-warning">Zurückgestellt</Pill>
        <Pill className="bg-success">Fertig</Pill>
        <Pill className="bg-danger">Storniert</Pill>
    </Row>
)

/* ---------- S-02 ---------- */
export const S02Good = () => (
    <div className="flex flex-col gap-2 text-sm">
        <Row><StatusBadge status={S("in-arbeit")} /><span>An Station Guss</span><span className="text-xs text-fg-muted">seit 1 h 20 min</span></Row>
        <Row><StatusBadge status={S("in-arbeit")} /><span>Unterwegs, zuletzt Guss</span><span className="text-xs text-fg-muted">seit 12 min</span></Row>
    </div>
)
export const S02Bad = () => (
    <div className="flex flex-col gap-2 text-sm">
        <Row><span className="text-fg-muted">Status:</span><Pill className="bg-accent">Guss</Pill></Row>
        <Row><span className="text-fg-muted">Status:</span><Pill className="bg-accent">Guss</Pill></Row>
    </div>
)

/* ---------- S-03 ---------- */
export const S03Good = () => <StatusBadge status={S("in-arbeit")} since={NOW - 5 * H} now={NOW} overdue="Länger als üblich (Richtzeit 4 h)" />
export const S03Bad = () => <Row><Pill className="bg-accent">In Arbeit</Pill><span className="text-xs text-fg-muted">2026-10-26T09:00:00Z</span></Row>

/* ---------- S-04 ---------- */
const ORDER: StatusDef = { id: "in-arbeit", label: "In Arbeit", category: "active" }
export function S04Good() {
    const d = deriveStatus(["done", "active", "planned", "waiting"])
    return (
        <div className="flex flex-col gap-1.5">
            <StatusBadge status={ORDER} />
            <p className="m-0 text-xs text-fg-muted">{d.done} von {d.total} Laufzetteln erledigt · ergibt sich aus den Laufzetteln</p>
            <div className="h-1 overflow-hidden rounded-control bg-surface-sunken" aria-hidden="true"><div className="h-full w-1/4 bg-success" /></div>
        </div>
    )
}
export const S04Bad = () => (
    <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs text-fg-muted">Auftragsstatus</span>
        <select defaultValue="Abgeschlossen" className="h-control rounded-control border border-border-strong bg-surface px-2 text-sm">
            <option>Offen</option><option>In Bearbeitung</option><option>Abgeschlossen</option>
        </select>
        <span className="text-xs text-fg-muted">(3 von 4 Laufzetteln noch offen)</span>
    </label>
)

/* ---------- S-05 ---------- */
export function S05Good() {
    const [picked, setPicked] = React.useState("")
    return (
        <div className="flex flex-col gap-2">
            <Row>
                <StatusMenu workflow={SLIP_WORKFLOW} current="in-arbeit" ctx={{ atStation: true, canReopen: true }} onSelect={(t) => setPicked(t.verb)} shortcut={false} />
                <Button size="sm" disabled aria-describedby="s05-reason">Fertig melden</Button>
            </Row>
            <p id="s05-reason" className="m-0 text-xs text-fg-muted">Fertig melden geht erst nach dem Ausscannen{picked && ` · gewählt: ${picked}`}</p>
        </div>
    )
}
export const S05Bad = () => (
    <div className="flex flex-col gap-1">
        <span className="inline-flex w-fit items-center gap-1 rounded-control border border-border-strong px-2 py-1 text-sm">In Arbeit <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /></span>
        <ul className="m-0 w-fit list-none rounded-panel border border-border p-1 text-sm">
            {["Offen", "In Arbeit", "Zurückgestellt", "Fertig", "Storniert", "Gelöscht"].map((s) => <li key={s} className="px-2 py-0.5">{s}</li>)}
        </ul>
        <Button size="sm" disabled className="w-fit">Fertig</Button>
    </div>
)

/* ---------- S-06 ---------- */
export function S06Good() {
    const [open, setOpen] = React.useState(false)
    const [undo, setUndo] = React.useState(false)
    return (
        <div className="flex flex-col items-start gap-3">
            <Row>
                <Button size="sm" variant="outline" onClick={() => setUndo(true)}>Zurückstellen</Button>
                <Button size="sm" variant="destructive" onClick={() => setOpen(true)}>Stornieren …</Button>
            </Row>
            {undo && <UndoNotice message="Status auf Zurückgestellt gesetzt" onUndo={() => setUndo(false)} onClose={() => setUndo(false)} />}
            <ConfirmDialog
                open={open}
                title="26100013 – 1/4 stornieren?"
                consequences={["Der Laufzettel verschwindet aus den offenen Listen.", "Gedruckte Zettel bleiben gültig, bis sie entsorgt sind."]}
                confirmLabel="Stornieren"
                reason="required"
                onCancel={() => setOpen(false)}
                onConfirm={() => setOpen(false)}
            />
        </div>
    )
}
export const S06Bad = () => (
    <div className="flex w-full max-w-xs flex-col gap-3 rounded-panel border border-border p-4 text-sm">
        <p className="m-0 font-semibold">Sind Sie sicher?</p>
        <div className="flex justify-end gap-2"><Button size="sm" variant="outline">Abbrechen</Button><Button size="sm">OK</Button></div>
    </div>
)

/* ---------- S-07 ---------- */
export function S07Good() {
    const [targets, setTargets] = React.useState<ScanTarget[]>([
        { code: "26100013-1/4", label: "26100013 – 1/4", station: null, locked: null, visits: [{ station: "guss" }] },
    ])
    const [lastScans] = React.useState(() => new Map<string, number>())
    return (
        <ScanField
            stationLabel="Guss"
            resolve={(code) => resolveScan({ code, station: "guss", stationLabel: "Guss", targets, lastScans, now: Date.now() })}
            onScan={(r) => {
                if (!r.target || r.kind === "duplicate") return
                lastScans.set("26100013-1/4", Date.now())
                if (r.kind === "in" || r.kind === "out") {
                    setTargets([{ ...r.target, station: r.kind === "in" ? "guss" : null, visits: r.kind === "in" ? [...r.target.visits, { station: "guss" }] : r.target.visits }])
                }
            }}
        />
    )
}
export const S07Bad = () => (
    <div className="flex flex-col gap-2">
        <input aria-label="Code" placeholder="Code" className="h-control rounded-control border border-border-strong bg-surface px-3 text-sm" />
        <span className="inline-flex items-center gap-1 text-xs text-success"><Check className="h-3 w-3" aria-hidden="true" /></span>
    </div>
)

/* ---------- S-08 ---------- */
export const S08Good = () => (
    <div className="flex flex-col gap-3">
        <LockedNotice status={S("storniert")} at={NOW - 5 * 24 * H} by="P. Mohr" reason="Kunde hat abgesagt" canReopen onReopen={() => {}} />
        <label className="flex flex-col gap-1 text-xs text-fg-muted">Gewicht (g)
            <input readOnly defaultValue="412" className="h-control rounded-control border border-border bg-surface-sunken px-3 text-sm text-fg" />
        </label>
    </div>
)
export const S08Bad = () => (
    <label className="flex flex-col gap-1 text-xs text-fg-muted">Gewicht (g)
        <input disabled defaultValue="412" className="h-control rounded-control border border-border bg-surface-sunken px-3 text-sm opacity-50" />
    </label>
)

/* ---------- S-09 / S-11 / S-12 ---------- */
const ENTRIES: ActivityEntry[] = [
    { id: "1", at: NOW - 26 * H, actor: "M. Keller", via: "scan", device: "Tablet 3D", kind: "location", text: "hat eingescannt in 3D" },
    { id: "2", at: NOW - 26 * H, actor: "System", via: "system", kind: "status", from: <StatusBadge status={S("offen")} />, to: <StatusBadge status={S("in-arbeit")} /> },
    { id: "3", at: NOW - 5 * H, actor: "S. Ryser", via: "scan", device: "Tablet Guss", kind: "location", text: "hat eingescannt in Guss" },
    { id: "4", at: NOW - 40 * MIN, actor: "P. Mohr", via: "hand", kind: "field", field: "Stück", from: "10", to: "12" },
    { id: "5", at: NOW - 38 * MIN, actor: "P. Mohr", via: "hand", kind: "field", field: "Gewicht (g)", from: "398", to: "412" },
    { id: "6", at: NOW - 37 * MIN, actor: "P. Mohr", via: "hand", kind: "field", field: "Material", from: "INOX", to: "Bronze" },
    { id: "7", at: NOW - 5 * MIN, actor: "P. Mohr", via: "hand", kind: "status", from: <StatusBadge status={S("in-arbeit")} />, to: <StatusBadge status={S("zurueckgestellt")} />, note: "Wartet auf Steine" },
]
const Log = (props: Partial<React.ComponentProps<typeof ActivityLog>>) => (
    <LinkProvider component={NoopLink}><ActivityLog entries={ENTRIES} now={NOW} {...props} /></LinkProvider>
)

export const S09Good = () => <Log />
export const S09Bad = () => <p className="m-0 text-sm text-fg-muted">Zuletzt geändert: 26.10.2026 13:55</p>

/* ---------- S-10 ---------- */
const VISITS: Visit[] = [
    { station: "3d", label: "3D", in: NOW - 30 * H, out: NOW - 26 * H, norm: 6 * H },
    { station: "guss", label: "Guss", in: NOW - 24 * H, out: NOW - 22 * H, norm: 4 * H },
    { station: "polissage", label: "Polissage", in: NOW - 20 * H, out: NOW - 12 * H, norm: 8 * H },
    { station: "guss", label: "Guss", in: NOW - 5 * H, out: null, norm: 4 * H },
]
export const S10Good = () => <RouteTimeline visits={VISITS} now={NOW} />
export const S10Bad = () => <p className="m-0 text-sm">Station: <strong>Guss</strong></p>

export const S11Good = () => <Log />
export const S11Bad = () => (
    <ul className="m-0 flex list-none flex-col gap-1 p-0 font-mono text-xs text-fg-muted">
        <li>2026-10-26 13:20:11 user_id=4 slip.weight 398 → 412</li>
        <li>2026-10-26 13:21:40 user_id=4 slip.pieces 10 → 12</li>
        <li>2026-10-26 13:22:02 user_id=4 slip.material_id 3 → 5</li>
        <li>2026-10-26 13:55:30 user_id=4 slip.status_id 2 → 3</li>
    </ul>
)

export const S12Good = () => <Log limit={3} moreHref="#verlauf" />
export const S12Bad = () => (
    <p className="m-0 flex items-center gap-1 text-sm text-fg-muted">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />Verlauf nur unter Admin › Protokolle, alle Datensätze gemischt, ohne Filter
    </p>
)
