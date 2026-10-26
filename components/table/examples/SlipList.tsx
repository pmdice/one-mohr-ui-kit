"use client"

import * as React from "react"
import { AlertTriangle, ArrowDown, ArrowUp, Minus, Printer } from "lucide-react"
import { Badge } from "@/components/atoms/Badge/Badge"
import { Button } from "@/components/atoms/Button/Button"
import { LinkProvider, NavLink } from "@/components/nav/NavLink"
import { PageHeader } from "@/components/nav/PageHeader"
import { MemoryRouter, RouterLink, hrefOf, useLocation, useNavigate, useReplace } from "@/components/nav/examples/router"
import { BulkBar } from "../BulkBar"
import { DataTable, type Column, type Sort } from "../DataTable"
import { EmptyState } from "../EmptyState"
import { FilterBar, type ActiveFilter } from "../FilterBar"
import { formatDate, formatNumber } from "../format"
import { Pagination, usePageSize } from "../Pagination"
import {
    FILTER_FIELDS, SLIPS, STATIONS, querySlips, slipNumber, stationLabel, urgencyOf,
    type Slip, type SlipQuery, type SlipResult, type Station, type Urgency,
} from "./slips"

/** Simulated server: 300–600 ms, the same delay for the same question. */
const simulatedLoader = (query: SlipQuery): Promise<SlipResult> => {
    const delay = 300 + (JSON.stringify(query).length * 37) % 300
    return new Promise((resolve) => setTimeout(() => resolve(querySlips(query)), delay))
}

interface SlipListProps {
    initial?: string
    loader?: (query: SlipQuery) => Promise<SlipResult>
    /** Story variants: no data at all, or every reload fails */
    variant?: "default" | "empty" | "reload-error"
}

/** Example work list (L-01–L-12): ~300 slips, all list state in the URL. */
export function SlipList({ initial = "/laufzettel", loader = simulatedLoader, variant = "default" }: SlipListProps) {
    const effectiveLoader = React.useMemo(() => {
        if (variant === "empty") return async (q: SlipQuery) => querySlips(q, [])
        if (variant === "reload-error") {
            let calls = 0
            return (q: SlipQuery) => (++calls === 1 ? loader(q) : new Promise<SlipResult>((_, reject) => setTimeout(() => reject(new Error("offline")), 400)))
        }
        return loader
    }, [loader, variant])

    return (
        <MemoryRouter initial={initial}>
            <LinkProvider component={RouterLink}>
                <div className="mx-auto flex max-w-[84rem] flex-col gap-4 p-6">
                    <Routes loader={effectiveLoader} />
                </div>
            </LinkProvider>
        </MemoryRouter>
    )
}

function Routes({ loader }: { loader: (q: SlipQuery) => Promise<SlipResult> }) {
    const { path, query } = useLocation()
    const m = path.match(/^\/laufzettel\/(.+)$/)
    if (m) return <SlipDetail id={m[1]} from={query.get("from")} />
    return <List loader={loader} />
}

// ---- URL <-> list state (N-03) ------------------------------------------------------

function readQuery(query: URLSearchParams, storedSize: number): SlipQuery {
    const filters = query.getAll("f").map((f) => {
        const [field, ...rest] = f.split(":")
        return { field, value: rest.join(":") }
    })
    const [sortId, dir] = (query.get("sort") ?? "").split(":")
    const sort: Sort = sortId && (dir === "asc" || dir === "desc") ? { id: sortId, dir } : null
    const page = Math.max(1, Number(query.get("page")) || 1)
    const pageSize = Number(query.get("size")) || storedSize
    return { filters, q: query.get("q") ?? "", sort, page, pageSize }
}

function listHref(state: SlipQuery, includeSize: boolean): string {
    const params = new URLSearchParams()
    for (const f of state.filters) params.append("f", `${f.field}:${f.value}`)
    if (state.q) params.set("q", state.q)
    if (state.sort) params.set("sort", `${state.sort.id}:${state.sort.dir}`)
    if (state.page > 1) params.set("page", String(state.page))
    if (includeSize) params.set("size", String(state.pageSize))
    const qs = params.toString()
    return qs ? `/laufzettel?${qs}` : "/laufzettel"
}

// ---- Cells ---------------------------------------------------------------------------

const URGENCY_STYLE: Record<Urgency, { variant: "destructive" | "warning" | "secondary" | "outline"; icon: React.ReactNode }> = {
    dringend: { variant: "destructive", icon: <AlertTriangle className="h-3 w-3" aria-hidden="true" /> },
    hoch: { variant: "warning", icon: <ArrowUp className="h-3 w-3" aria-hidden="true" /> },
    normal: { variant: "secondary", icon: <Minus className="h-3 w-3" aria-hidden="true" /> },
    niedrig: { variant: "outline", icon: <ArrowDown className="h-3 w-3" aria-hidden="true" /> },
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
    const style = URGENCY_STYLE[urgency]
    return <Badge variant={style.variant} className="gap-1 px-1.5">{style.icon}{urgencyOf(urgency).label}</Badge>
}

const STATION_VARIANT: Record<Station, "secondary" | "default" | "warning" | "success" | "outline"> = {
    offen: "outline", "3d": "default", guss: "warning", polissage: "default", versand: "success",
}

const COLUMNS: Column<Slip>[] = [
    { id: "urgency", header: "Dringlichkeit", width: "7.5rem", sortable: true, cell: (s) => <UrgencyBadge urgency={s.urgency} /> },
    { id: "number", header: "Nummer", width: "9.5rem", sortable: true, cell: (s) => slipNumber(s) },
    { id: "material", header: "Material", cell: (s) => s.material },
    {
        id: "customer", header: "Kunde", truncate: true, title: (s) => s.customer,
        cell: (s) => <NavLink href={`/kunden/${s.customerId}`} className="text-fg underline-offset-2 hover:text-accent hover:underline">{s.customer}</NavLink>,
    },
    { id: "station", header: "Station", cell: (s) => <Badge variant={STATION_VARIANT[s.station]}>{stationLabel(s.station)}</Badge> },
    { id: "castDate", header: "Eingipsdatum", sortable: true, cell: (s) => <span className="tabular-nums">{formatDate(s.castDate)}</span> },
    { id: "pieces", header: "Stück", align: "right", sortable: true, cell: (s) => formatNumber(s.pieces) },
    { id: "weight", header: "Gewicht (g)", align: "right", sortable: true, cell: (s) => formatNumber(s.weight) },
]

// ---- List ----------------------------------------------------------------------------

type LoadState = { status: "loading" | "ready" | "reloading"; data: SlipResult | null; error: boolean }

function List({ loader }: { loader: (q: SlipQuery) => Promise<SlipResult> }) {
    const { href, query } = useLocation()
    const replace = useReplace()
    const navigate = useNavigate()
    const [storedSize, setStoredSize] = usePageSize("laufzettel")
    const state = readQuery(query, storedSize)
    const hasSize = query.has("size")
    const set = (patch: Partial<SlipQuery>, size = hasSize) => replace(listHref({ ...state, ...patch }, size))

    // Loading (L-08): first load shows skeletons, later loads keep the rows; older answers are dropped
    const [load, setLoad] = React.useState<LoadState>({ status: "loading", data: null, error: false })
    const [attempt, setAttempt] = React.useState(0)
    const requestRef = React.useRef(0)
    const key = JSON.stringify(state)
    React.useEffect(() => {
        const id = ++requestRef.current
        setLoad((l) => ({ ...l, status: l.data ? "reloading" : "loading", error: false }))
        loader(JSON.parse(key) as SlipQuery).then(
            (data) => { if (requestRef.current === id) setLoad({ status: "ready", data, error: false }) },
            () => { if (requestRef.current === id) setLoad((l) => ({ ...l, status: "ready", error: true })) },
        )
    }, [key, attempt, loader])

    // Selection survives paging, not a change of what is shown (L-10)
    const [selected, setSelected] = React.useState<Set<string>>(new Set())
    const [cursorId, setCursorId] = React.useState<string | null>(null)
    const filterKey = JSON.stringify([state.filters, state.q])
    React.useEffect(() => { setSelected(new Set()) }, [filterKey])

    const [message, setMessage] = React.useState("")
    const say = (text: string) => setMessage(text)

    const rows = load.data?.rows ?? []
    const total = load.data?.total ?? 0
    const filteredTotal = load.data?.filteredTotal ?? 0
    const filtered = state.filters.length > 0 || state.q !== ""
    const hiddenCount = [...selected].filter((id) => !rows.some((r) => r.id === id)).length
    const rowHref = (s: Slip) => hrefOf(`/laufzettel/${s.id}`, { from: href })
    const resetFilters = () => set({ filters: [], q: "", page: 1 })

    const empty = load.status !== "loading" && rows.length === 0 && !load.error
    const setStation = (ids: string[]) => say(`Station für ${ids.length} Laufzettel setzen – im Beispiel ohne Wirkung`)

    return (
        <>
            <header className="flex items-end justify-between gap-3">
                <h1 className="m-0 text-xl font-semibold text-fg">Laufzettel</h1>
                <p role="status" className="m-0 text-xs text-fg-muted">{message}</p>
            </header>

            <FilterBar
                fields={FILTER_FIELDS}
                active={state.filters}
                onChange={(filters: ActiveFilter[]) => set({ filters, page: 1 })}
                total={total}
                filteredTotal={filteredTotal}
                noun="Laufzettel"
            >
                <input
                    type="search"
                    aria-label="In Laufzetteln suchen"
                    placeholder="In Laufzetteln suchen …"
                    value={state.q}
                    onChange={(e) => set({ q: e.target.value, page: 1 })}
                    className="h-7 w-64 rounded-control border border-border bg-surface px-2.5 text-xs text-fg placeholder:text-fg-subtle focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30"
                />
            </FilterBar>

            {selected.size > 0 && (
                <BulkBar
                    count={selected.size}
                    hiddenCount={hiddenCount}
                    onClear={() => setSelected(new Set())}
                    actions={[
                        { label: "Drucken", onSelect: () => say(`${selected.size} Laufzettel zum Drucken gesendet`) },
                        { label: "Station setzen …", onSelect: () => setStation([...selected]) },
                    ]}
                />
            )}

            {load.error && load.data && (
                <EmptyState
                    kind="error"
                    title="Liste konnte nicht aktualisiert werden – die angezeigten Zeilen sind vom letzten Laden."
                    action={<Button size="sm" variant="outline" onClick={() => setAttempt((a) => a + 1)}>Erneut versuchen</Button>}
                    className="rounded-panel border border-danger/30 bg-danger-subtle py-3"
                />
            )}

            {load.error && !load.data ? (
                <EmptyState kind="error" title="Liste konnte nicht geladen werden" action={<Button size="sm" variant="outline" onClick={() => setAttempt((a) => a + 1)}>Erneut versuchen</Button>} />
            ) : empty ? (
                filtered || total > 0
                    ? <EmptyState kind="no-results" title="Keine Laufzettel für diese Filter" action={<Button size="sm" variant="outline" onClick={resetFilters}>Filter zurücksetzen</Button>} />
                    : <EmptyState kind="none" title="Noch keine Laufzettel" description="Laufzettel entstehen, wenn ein Auftrag erfasst wird." action={<Button size="sm">Auftrag erfassen</Button>} />
            ) : (
                <DataTable<Slip>
                    label="Laufzettel"
                    className="max-h-[70vh]"
                    columns={COLUMNS}
                    rows={rows}
                    getRowId={(s) => s.id}
                    getRowHref={rowHref}
                    identifierColumn="number"
                    rowLabel={slipNumber}
                    sort={state.sort}
                    onSortChange={(sort) => set({ sort, page: 1 })}
                    status={load.status}
                    onOpenRow={(id) => { const s = rows.find((r) => r.id === id); if (s) navigate(rowHref(s)) }}
                    cursorId={cursorId}
                    onCursorChange={setCursorId}
                    selected={selected}
                    onSelectedChange={setSelected}
                    rowAction={(s) => ({ label: "Drucken", icon: <Printer className="h-3.5 w-3.5" aria-hidden="true" />, onSelect: () => say(`Laufzettel ${slipNumber(s)} zum Drucken gesendet`) })}
                    rowMenu={(s) => [
                        { id: "station", label: "Station setzen …", onSelect: () => setStation([s.id]) },
                        { id: "order", label: "Zum Auftrag", onSelect: () => say(`Auftrag #${s.orderId} öffnen – im Beispiel ohne Ziel`) },
                    ]}
                />
            )}

            {!empty && (
                <Pagination
                    page={state.page}
                    pageSize={state.pageSize}
                    total={filteredTotal}
                    onPageChange={(page) => set({ page })}
                    onPageSizeChange={(pageSize) => { setStoredSize(pageSize); set({ pageSize, page: 1 }, true) }}
                />
            )}
            <p className="m-0 text-xs text-fg-subtle">Tastatur: <kbd>J</kbd>/<kbd>K</kbd> Zeile wählen · <kbd>Enter</kbd> öffnen · <kbd>X</kbd> auswählen</p>
        </>
    )
}

function SlipDetail({ id, from }: { id: string; from: string | null }) {
    const slip = SLIPS.find((s) => s.id === id)
    if (!slip) return <EmptyState kind="error" title="Laufzettel nicht gefunden" />
    return (
        <>
            <PageHeader
                trail={[{ label: "Laufzettel", href: "/laufzettel" }, { label: slipNumber(slip), href: `/laufzettel/${slip.id}` }]}
                back={from ? { label: "Laufzettel", href: from } : undefined}
                title={slipNumber(slip)}
                badges={<><UrgencyBadge urgency={slip.urgency} /><Badge variant={STATION_VARIANT[slip.station]}>{stationLabel(slip.station)}</Badge></>}
            />
            <p className="m-0 text-sm text-fg-muted">Detailseite im Beispiel – „Laufzettel“ oben führt mit Filtern, Sortierung und Seite zurück.</p>
            <p className="m-0 text-xs text-fg-subtle">Stationen: {STATIONS.map((s) => s.label).join(" → ")}</p>
        </>
    )
}
