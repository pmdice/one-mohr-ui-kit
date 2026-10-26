"use client"

import * as React from "react"
import { Eye, Filter, Loader2, Pencil, Printer } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { LinkProvider } from "@/components/nav/NavLink"
import { BulkBar } from "@/components/table/BulkBar"
import { DataTable, type Column, type Sort } from "@/components/table/DataTable"
import { EmptyState } from "@/components/table/EmptyState"
import { FilterBar } from "@/components/table/FilterBar"
import { formatDate, formatNumber } from "@/components/table/format"
import { Pagination } from "@/components/table/Pagination"
import { UrgencyBadge } from "@/components/table/examples/SlipList"
import { FILTER_FIELDS, SLIPS, querySlips, slipNumber, stationLabel, type Slip } from "@/components/table/examples/slips"
import { cn } from "@/lib/utils"

/* Live examples for the list rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

function NoopLink({ href, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return <a href={href} onClick={(e) => { onClick?.(e); e.preventDefault() }} {...props} />
}

const FEW = querySlips({ filters: [], q: "", sort: null, page: 1, pageSize: 4 }).rows
const MANY = querySlips({ filters: [], q: "", sort: null, page: 1, pageSize: 20 }).rows
const noop = () => {}

const COLS: Column<Slip>[] = [
    { id: "urgency", header: "Dringlichkeit", width: "7.5rem", cell: (s) => <UrgencyBadge urgency={s.urgency} /> },
    { id: "number", header: "Nummer", width: "9.5rem", cell: (s) => slipNumber(s) },
    { id: "customer", header: "Kunde", truncate: true, title: (s) => s.customer, cell: (s) => s.customer },
    { id: "weight", header: "Gewicht (g)", align: "right", cell: (s) => formatNumber(s.weight) },
]

function Table({ rows = FEW, columns = COLS, ...props }: Partial<React.ComponentProps<typeof DataTable<Slip>>>) {
    return (
        <LinkProvider component={NoopLink}>
            <DataTable<Slip>
                label="Laufzettel" columns={columns} rows={rows} getRowId={(s) => s.id} getRowHref={(s) => `#${s.id}`}
                identifierColumn="number" sort={null} onSortChange={noop} status="ready" {...props}
            />
        </LinkProvider>
    )
}

/** Hand-built plain table for anti-patterns. */
function Plain({ head, rows, className }: { head: string[]; rows: React.ReactNode[][]; className?: string }) {
    return (
        <div className={cn("overflow-auto rounded-panel border border-border", className)}>
            <table className="w-full border-collapse text-sm">
                <thead><tr>{head.map((h) => <th key={h} className="border-b border-border px-3 py-2 text-left text-xs font-medium text-fg-subtle">{h}</th>)}</tr></thead>
                <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-border px-3 py-2">{c}</td>)}</tr>)}</tbody>
            </table>
        </div>
    )
}

/* ---------- L-01 ---------- */
export const L01Good = () => <Table />
export const L01Bad = () => (
    <Plain head={["Kunde", "Material", "Nummer", ""]} rows={FEW.map((s) => [s.customer, s.material, s.id, <Eye key="e" className="h-4 w-4 text-fg-muted" aria-label="Ansehen" />])} />
)

/* ---------- L-02 ---------- */
export const L02Good = () => <Table columns={[COLS[1], { id: "pieces", header: "Stück", align: "right", cell: (s) => formatNumber(s.pieces) }, COLS[3], { id: "date", header: "Eingipsdatum", cell: (s) => formatDate(s.castDate) }]} />
export const L02Bad = () => (
    <Plain head={["Nummer", "Stück", "Gewicht", "Datum"]} rows={FEW.map((s) => [s.id, s.pieces, `${s.weight ?? 0} g`, s.castDate])} />
)

/* ---------- L-03 ---------- */
export const L03Good = () => <Table columns={[COLS[0], COLS[1], { id: "station", header: "Station", cell: (s) => stationLabel(s.station) }]} />
export const L03Bad = () => {
    const color: Record<string, string> = { dringend: "bg-danger", hoch: "bg-warning", normal: "bg-fg-subtle", niedrig: "bg-border-strong" }
    return <Plain head={["", "Nummer"]} rows={FEW.map((s) => [<span key="d" className={cn("inline-block h-2.5 w-2.5 rounded-control", color[s.urgency])} />, s.id])} />
}

/* ---------- L-04 ---------- */
export const L04Good = () => <Table rows={MANY} className="max-h-56" />
export const L04Bad = () => (
    <div className="max-h-56 overflow-auto rounded-panel border border-border">
        <table className="w-full border-collapse text-sm">
            <thead><tr>{["Nummer", "Kunde", "Gewicht"].map((h) => <th key={h} className="border-b border-border px-3 py-2 text-left text-xs font-medium text-fg-subtle">{h}</th>)}</tr></thead>
            <tbody>{MANY.map((s) => <tr key={s.id}><td className="border-b border-border px-3 py-2">{s.id}</td><td className="border-b border-border px-3 py-2">{s.customer}</td><td className="border-b border-border px-3 py-2">{s.weight ?? ""}</td></tr>)}</tbody>
        </table>
    </div>
)

/* ---------- L-05 / L-12 ---------- */
const ACTIVE = [{ field: "station", value: "guss" }, { field: "urgency", value: "dringend" }]
const GUSS = querySlips({ filters: ACTIVE, q: "", sort: null, page: 1, pageSize: 25 })
export const L05Good = () => <FilterBar fields={FILTER_FIELDS} active={ACTIVE} onChange={noop} total={SLIPS.length} filteredTotal={GUSS.filteredTotal} noun="Laufzettel" />
export const L05Bad = () => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-fg-muted">{GUSS.filteredTotal} Einträge</span>
        <span className="flex items-center gap-1 text-fg-muted"><Filter className="h-4 w-4" aria-hidden="true" /></span>
    </div>
)

/* ---------- L-06 ---------- */
export function L06Good() {
    const [sort, setSort] = React.useState<Sort>(null)
    const rows = querySlips({ filters: [], q: "", sort, page: 1, pageSize: 5 }).rows
    return <Table rows={rows} sort={sort} onSortChange={setSort} columns={[COLS[0], { ...COLS[1], sortable: true }, { id: "castDate", header: "Eingipsdatum", sortable: true, cell: (s) => formatDate(s.castDate) }]} />
}
export const L06Bad = () => {
    const rows = [...SLIPS].sort((a, b) => a.id.localeCompare(b.id)).slice(0, 5)
    return <Plain head={["Nummer ↑", "Dringlichkeit"]} rows={rows.map((s) => [s.id, s.urgency])} />
}

/* ---------- L-07 ---------- */
export const L07Good = () => (
    <div className="flex flex-col divide-y divide-border rounded-panel border border-border">
        <EmptyState kind="no-results" title="Keine Laufzettel für diese Filter" action={<Button size="sm" variant="outline">Filter zurücksetzen</Button>} className="py-6" />
        <EmptyState kind="none" title="Noch keine Laufzettel" action={<Button size="sm">Auftrag erfassen</Button>} className="py-6" />
    </div>
)
export const L07Bad = () => <Plain head={["Nummer", "Kunde"]} rows={[[<span key="x" className="text-fg-muted">Keine Einträge</span>, ""]]} />

/* ---------- L-08 ---------- */
export const L08Good = () => <Table status="reloading" />
export const L08Bad = () => (
    <div className="flex h-40 items-center justify-center gap-2 rounded-panel border border-border text-sm text-fg-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Lädt…
    </div>
)

/* ---------- L-09 ---------- */
export function L09Good() {
    const [cursorId, setCursorId] = React.useState<string | null>(null)
    const [selected, setSelected] = React.useState<Set<string>>(new Set())
    const [opened, setOpened] = React.useState("")
    return (
        <div className="flex flex-col gap-2">
            <Table cursorId={cursorId} onCursorChange={setCursorId} selected={selected} onSelectedChange={setSelected} rowLabel={slipNumber}
                onOpenRow={(id) => setOpened(id)} />
            <p className="m-0 text-xs text-fg-muted">J/K bewegen, X wählt, Enter öffnet{opened && ` – geöffnet: ${opened}`}</p>
        </div>
    )
}
export const L09Bad = () => <p className="m-0 text-sm text-fg-muted">Jede Zeile einzeln anklicken, zurück, nächste Zeile suchen.</p>

/* ---------- L-10 ---------- */
export function L10Good() {
    const [selected, setSelected] = React.useState<Set<string>>(new Set(FEW.slice(0, 3).map((s) => s.id)))
    return (
        <div className="flex flex-col gap-2">
            {selected.size > 0 && <BulkBar count={selected.size} hiddenCount={0} actions={[{ label: "Drucken", onSelect: noop }]} onClear={() => setSelected(new Set())} />}
            <Table selected={selected} onSelectedChange={setSelected} rowLabel={slipNumber} />
        </div>
    )
}
export const L10Bad = () => (
    <Plain head={["Nummer", ""]} rows={FEW.map((s) => [s.id, <Printer key="p" className="h-4 w-4 text-fg-muted" aria-hidden="true" />])} />
)

/* ---------- L-11 ---------- */
export const L11Good = () => (
    <Table columns={[COLS[1], COLS[2]]}
        rowAction={() => ({ label: "Drucken", icon: <Printer className="h-3.5 w-3.5" aria-hidden="true" />, onSelect: noop })}
        rowMenu={() => [{ id: "s", label: "Station setzen …", onSelect: noop }, { id: "o", label: "Zum Auftrag", onSelect: noop }]} />
)
export const L11Bad = () => (
    <Plain head={["Nummer", "Kunde", ""]} rows={FEW.map((s) => [s.id, s.customer,
        <span key="i" className="flex gap-2 text-fg-muted"><Eye className="h-4 w-4" aria-hidden="true" /><Printer className="h-4 w-4" aria-hidden="true" /><Pencil className="h-4 w-4" aria-hidden="true" /></span>])} />
)

/* ---------- L-12 ---------- */
export const L12Good = () => (
    <div className="flex flex-col gap-3">
        <L05Good />
        <Pagination page={1} pageSize={25} total={GUSS.filteredTotal} onPageChange={noop} onPageSizeChange={noop} />
    </div>
)
export const L12Bad = () => <div className="flex justify-end gap-2 text-xs text-fg-subtle"><span>‹</span><span>Seite 1</span><span>›</span></div>
