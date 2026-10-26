"use client"

import * as React from "react"
import { AlertTriangle, MapPin } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { LinkProvider, NavLink } from "@/components/nav/NavLink"
import { PageHeader } from "@/components/nav/PageHeader"
import { MemoryRouter, RouterLink, useLocation, hrefOf } from "@/components/nav/examples/router"
import { normalizeIdentifier } from "@/components/nav/identifier"
import { ActivityLog, type ActivityFilter } from "../ActivityLog"
import { ConfirmDialog } from "../ConfirmDialog"
import { LockedNotice } from "../LockedNotice"
import { RouteTimeline } from "../RouteTimeline"
import { resolveScan, type ScanTarget } from "../scan"
import { ScanField } from "../ScanField"
import { StatusBadge } from "../StatusBadge"
import { StatusMenu } from "../StatusMenu"
import { formatDuration, formatDateTime, overdueHint } from "../time"
import { UndoNotice } from "../UndoNotice"
import { allowedTransitions, deriveStatus, type StatusCategory, type StatusDef, type Transition } from "../workflow"
import {
    ME, NOW, REOPEN_HINT, SLIP_WORKFLOW, STATIONS, activityOf, applyEvent, number, seedWorld, slipStatus, stationLabel,
    type SlipCtx, type SlipEvent, type SlipState, type World,
} from "./slip"

type Variant = "default" | "canceled" | "done-locked"
type Undo = { id: number; slip: string; previous: SlipState; message: string }

type Ctx = {
    world: World
    now: number
    canReopen: boolean
    dispatch: (event: DistributiveOmit<SlipEvent, "at" | "actor">) => void
    lastScans: Map<string, number>
    undo: Undo | null
    setUndo: (undo: Undo | null) => void
}
type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never

const AppContext = React.createContext<Ctx | null>(null)
const useApp = () => React.useContext(AppContext)!

const ORDER_STATUS: Record<StatusCategory, StatusDef> = {
    planned: { id: "offen", label: "Offen", category: "planned" },
    active: { id: "in-arbeit", label: "In Arbeit", category: "active" },
    waiting: { id: "wartet", label: "Wartet", category: "waiting" },
    done: { id: "fertig", label: "Fertig", category: "done" },
    canceled: { id: "storniert", label: "Storniert", category: "canceled" },
}

const slipHref = (s: SlipState, tab?: string, verlauf?: string) => hrefOf(`/laufzettel/${s.id}`, { tab, verlauf })
const ctxOf = (s: SlipState, canReopen: boolean): SlipCtx => ({ atStation: s.station !== null, canReopen })

/**
 * Example: the detail page of a slip. Status and place apart (S-02), allowed steps only (S-05),
 * scan with one clear answer (S-07), locked when closed (S-08), route and history (S-09–S-12).
 */
export function SlipDetail({ initial = "default", now = NOW }: { initial?: Variant; now?: number }) {
    const [world, setWorld] = React.useState(() => seedWorld(initial))
    const [undo, setUndo] = React.useState<Undo | null>(null)
    // The clock runs from the given "now", so stories and tests stay the same every time
    const mounted = React.useRef<number | null>(null)
    const [elapsed, setElapsed] = React.useState(0)
    const [lastScans] = React.useState(() => new Map<string, number>())

    React.useEffect(() => {
        mounted.current = Date.now()
        const timer = setInterval(() => setElapsed(Date.now() - mounted.current!), 30_000)
        return () => clearInterval(timer)
    }, [])

    const dispatch = React.useCallback<Ctx["dispatch"]>((event) => {
        const passed = mounted.current === null ? 0 : Date.now() - mounted.current
        setElapsed(passed)
        setWorld((w) => applyEvent(w, { ...event, actor: ME, at: now + passed } as SlipEvent))
    }, [now])

    const value = React.useMemo<Ctx>(() => ({
        world,
        now: now + elapsed,
        canReopen: initial !== "done-locked",
        lastScans,
        undo,
        setUndo,
        dispatch,
    }), [world, now, elapsed, initial, lastScans, undo, dispatch])

    return (
        <AppContext.Provider value={value}>
            <MemoryRouter initial="/laufzettel/26100013-1">
                <LinkProvider component={RouterLink}>
                    <div className="mx-auto flex max-w-[72rem] flex-col gap-6 px-4 py-6">
                        <Routes />
                    </div>
                    {undo && (
                        <UndoNotice
                            key={undo.id}
                            className="fixed bottom-4 right-4 z-40"
                            message={undo.message}
                            onUndo={() => {
                                dispatch({ type: "undo", slip: undo.slip, previous: undo.previous })
                                setUndo(null)
                            }}
                            onClose={() => setUndo(null)}
                        />
                    )}
                </LinkProvider>
            </MemoryRouter>
        </AppContext.Provider>
    )
}

function Routes() {
    const { path } = useLocation()
    const { world } = useApp()
    const match = path.match(/^\/laufzettel\/([^/]+)$/)
    const slip = match && world.slips.find((s) => s.id === match[1])
    if (slip) return <SlipPage slip={slip} />
    return <SlipIndex />
}

/** The same status words and shapes in a list as on the page (S-01). */
function SlipIndex() {
    const { world, now } = useApp()
    return (
        <section aria-label="Laufzettel" className="flex flex-col gap-3">
            <h1 className="m-0 text-xl font-semibold text-fg">Laufzettel</h1>
            <ul className="m-0 flex list-none flex-col divide-y divide-border rounded-panel border border-border p-0">
                {world.slips.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm">
                        <NavLink href={slipHref(s)} className="w-36 font-mono text-accent hover:underline">{number(s)}</NavLink>
                        <StatusBadge status={slipStatus(s)} />
                        <Place slip={s} now={now} />
                    </li>
                ))}
            </ul>
        </section>
    )
}

/** Where the slip is, apart from how far it is (S-02), with since when and an exceeded usual time (S-03). */
function Place({ slip, now }: { slip: SlipState; now: number }) {
    const text = slip.station ? `An Station ${stationLabel(slip.station)}`
        : slip.lastStation ? `Unterwegs, zuletzt ${stationLabel(slip.lastStation)}`
        : "Noch nicht eingescannt"
    const norm = slip.station ? STATIONS.find((s) => s.id === slip.station)?.norm : undefined
    const overdue = slip.station ? overdueHint(now - slip.locationSince, norm) : undefined
    return (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1 text-fg">
                <MapPin className="h-3.5 w-3.5 text-fg-muted" aria-hidden="true" />{text}
            </span>
            {(slip.station || slip.lastStation) && (
                <span className="text-xs text-fg-muted" title={formatDateTime(slip.locationSince)}>seit {formatDuration(now - slip.locationSince)}</span>
            )}
            {overdue && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />{overdue}
                </span>
            )}
        </span>
    )
}

const CONSEQUENCES: Record<string, string[]> = {
    storniert: [
        "Der Laufzettel verschwindet aus den offenen Listen.",
        "Gedruckte Zettel bleiben gültig, bis sie entsorgt sind.",
        "Felder lassen sich danach nicht mehr ändern.",
    ],
    zurueckgestellt: ["Der Laufzettel bleibt, wo er ist, und erscheint unter „Zurückgestellt“."],
}

function SlipPage({ slip }: { slip: SlipState }) {
    const app = useApp()
    const { query } = useLocation()
    const tab = query.get("tab") ?? "details"
    const filter = (query.get("verlauf") ?? "all") as ActivityFilter
    const [pending, setPending] = React.useState<Transition<SlipCtx> | null>(null)
    const ctx = ctxOf(slip, app.canReopen)
    const status = slipStatus(slip)
    const entries = activityOf(app.world, slip.id)

    const run = (t: Transition<SlipCtx>, reason?: string) => {
        app.dispatch({ type: "transition", slip: slip.id, to: t.to, reason })
        app.setUndo(t.confirm ? null : { id: app.world.seq + 1, slip: slip.id, previous: slip, message: `Status auf ${SLIP_WORKFLOW.statuses.find((s) => s.id === t.to)!.label} gesetzt` })
    }
    const choose = (t: Transition<SlipCtx>) => (t.confirm || t.reason ? setPending(t) : run(t))
    const primary = allowedTransitions(SLIP_WORKFLOW, slip.status, ctx).find((a) => a.transition.primary)
    const reopen = allowedTransitions(SLIP_WORKFLOW, slip.status, ctx).find((a) => a.transition.verb === "Wieder öffnen")
    const verb = pending?.verb.replace(/ …$/, "") ?? ""
    const reasonId = React.useId()

    return (
        <>
            <PageHeader
                trail={[{ label: "Laufzettel", href: "/laufzettel" }, { label: number(slip), href: slipHref(slip) }]}
                title={number(slip)}
                badges={
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-2">
                            <StatusMenu workflow={SLIP_WORKFLOW} current={slip.status} ctx={ctx} onSelect={choose} />
                            <span className="whitespace-nowrap text-xs text-fg-muted" title={formatDateTime(slip.statusSince)}>seit {formatDuration(app.now - slip.statusSince)}</span>
                        </span>
                        <Place slip={slip} now={app.now} />
                    </span>
                }
                primaryAction={primary && (
                    <span className="flex items-center gap-2">
                        {primary.blocked && <span id={reasonId} className="text-xs text-fg-muted">{primary.blocked}</span>}
                        <Button size="sm" disabled={!!primary.blocked} aria-describedby={primary.blocked ? reasonId : undefined} onClick={() => choose(primary.transition)}>
                            {primary.transition.verb}
                        </Button>
                    </span>
                )}
                tabs={{
                    current: slipHref(slip, tab === "details" ? undefined : tab),
                    tabs: [
                        { label: "Details", href: slipHref(slip) },
                        { label: "Durchlauf", href: slipHref(slip, "durchlauf"), count: slip.visits.length },
                        { label: "Verlauf", href: slipHref(slip, "verlauf"), count: entries.length },
                    ],
                }}
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="flex min-w-0 flex-col gap-6">
                    {tab === "details" && (
                        <>
                            {slip.closed && (
                                <LockedNotice
                                    status={status}
                                    at={slip.closed.at}
                                    by={slip.closed.by}
                                    reason={slip.closed.reason}
                                    canReopen={!!reopen && !reopen.blocked}
                                    reopenHint={REOPEN_HINT}
                                    onReopen={() => reopen && run(reopen.transition)}
                                />
                            )}
                            <Fields slip={slip} />
                            <section aria-labelledby={`${reasonId}-recent`} className="flex flex-col gap-2">
                                <h2 id={`${reasonId}-recent`} className="m-0 text-sm font-semibold text-fg">Letzte Änderungen</h2>
                                <ActivityLog entries={entries} now={app.now} limit={3} moreHref={slipHref(slip, "verlauf")} />
                            </section>
                        </>
                    )}
                    {tab === "durchlauf" && <RouteTimeline visits={slip.visits} now={app.now} />}
                    {tab === "verlauf" && (
                        <ActivityLog entries={entries} now={app.now} filter={filter} filterHref={(f) => slipHref(slip, "verlauf", f === "all" ? undefined : f)} />
                    )}
                </div>
                <aside className="flex flex-col gap-6">
                    <OrderCard current={slip} />
                    <ScanBox />
                </aside>
            </div>

            <ConfirmDialog
                open={!!pending}
                title={`${number(slip)} ${verb.toLowerCase()}${pending?.confirm ? "?" : ""}`}
                consequences={pending ? CONSEQUENCES[pending.to] ?? [] : []}
                confirmLabel={verb}
                reason={pending?.reason}
                tone={pending?.confirm ? "danger" : "default"}
                onCancel={() => setPending(null)}
                onConfirm={(reason) => {
                    if (pending) run(pending, reason)
                    setPending(null)
                }}
            />
        </>
    )
}

/** Read-only, not greyed out, when closed (S-08); every change is written to the history (S-09). */
function Fields({ slip }: { slip: SlipState }) {
    const { dispatch } = useApp()
    const locked = !!slip.closed
    const commit = (field: "weight" | "pieces", label: string) => (e: React.FocusEvent<HTMLInputElement>) => {
        const raw = e.target.value.trim()
        const value = raw === "" ? null : Number(raw)
        if (value !== null && Number.isNaN(value)) return
        dispatch({ type: "field", slip: slip.id, field, label, value })
    }
    const input = "h-control w-full rounded-control border border-border-strong bg-surface px-3 text-sm text-fg tabular-nums read-only:border-border read-only:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    return (
        <dl className="m-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><dt className="text-xs text-fg-muted">Kunde</dt><dd className="m-0 text-sm text-fg">{slip.customer}</dd></div>
            <div><dt className="text-xs text-fg-muted">Material</dt><dd className="m-0 text-sm text-fg">{slip.material}</dd></div>
            <div className="flex flex-col gap-1">
                <dt><label htmlFor={`${slip.id}-weight`} className="text-xs text-fg-muted">Gewicht (g)</label></dt>
                <dd className="m-0">
                    <input id={`${slip.id}-weight`} key={`w${slip.weight}`} inputMode="numeric" readOnly={locked} defaultValue={slip.weight ?? ""} onBlur={locked ? undefined : commit("weight", "Gewicht (g)")} className={input} />
                </dd>
            </div>
            <div className="flex flex-col gap-1">
                <dt><label htmlFor={`${slip.id}-pieces`} className="text-xs text-fg-muted">Stück</label></dt>
                <dd className="m-0">
                    <input id={`${slip.id}-pieces`} key={`p${slip.pieces}`} inputMode="numeric" readOnly={locked} defaultValue={slip.pieces} onBlur={locked ? undefined : commit("pieces", "Stück")} className={input} />
                </dd>
            </div>
        </dl>
    )
}

/** The order's status comes from its slips and is shown, not set (S-04). */
function OrderCard({ current }: { current: SlipState }) {
    const { world } = useApp()
    const slips = world.slips.filter((s) => s.orderId === current.orderId)
    const derived = deriveStatus(slips.map((s) => slipStatus(s).category))
    return (
        <section aria-label={`Auftrag ${current.orderId}`} className="flex flex-col gap-3 rounded-panel border border-border p-4">
            <div className="flex flex-col gap-1">
                <h2 className="m-0 text-sm font-semibold text-fg">Auftrag {current.orderId}</h2>
                <StatusBadge status={ORDER_STATUS[derived.category]} />
                <p className="m-0 text-xs text-fg-muted">{derived.done} von {derived.total} Laufzetteln erledigt · ergibt sich aus den Laufzetteln</p>
                <div className="h-1 overflow-hidden rounded-control bg-surface-sunken" aria-hidden="true">
                    <div className="h-full bg-success" style={{ width: `${(derived.done / derived.total) * 100}%` }} />
                </div>
            </div>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {slips.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                        {s.id === current.id
                            ? <span className="font-mono text-fg" aria-current="page">{number(s)}</span>
                            : <NavLink href={slipHref(s)} className="font-mono text-accent hover:underline">{number(s)}</NavLink>}
                        <StatusBadge status={slipStatus(s)} />
                    </li>
                ))}
            </ul>
        </section>
    )
}

/** The scanner as it would stand at a station (S-07); the full workshop view is its own chapter. */
function ScanBox() {
    const { world, dispatch, lastScans } = useApp()
    const [station, setStation] = React.useState("guss")
    const id = React.useId()
    const targets: ScanTarget[] = world.slips.map((s) => ({
        code: `${s.orderId}-${s.index}/${s.total}`,
        label: number(s),
        station: s.station,
        locked: s.closed ? slipStatus(s).label.toLowerCase() : null,
        visits: s.visits,
    }))
    return (
        <section aria-labelledby={`${id}-title`} className="flex flex-col gap-3 rounded-panel border border-border p-4">
            <h2 id={`${id}-title`} className="m-0 text-sm font-semibold text-fg">Scannen</h2>
            <div className="flex flex-col gap-1">
                <label htmlFor={id} className="text-xs text-fg-muted">Diese Station</label>
                <select id={id} value={station} onChange={(e) => setStation(e.target.value)} className="h-control rounded-control border border-border-strong bg-surface px-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    {STATIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
            </div>
            <ScanField
                stationLabel={stationLabel(station)}
                resolve={(code) => resolveScan({ code, station, stationLabel: stationLabel(station), targets, lastScans, now: Date.now() })}
                onScan={(result) => {
                    if (!result.target) return
                    if (result.kind !== "duplicate") lastScans.set(normalizeIdentifier(result.target.code), Date.now())
                    if (result.kind !== "in" && result.kind !== "out") return
                    const slip = world.slips.find((s) => number(s) === result.target!.label)!
                    dispatch({ type: "scan", slip: slip.id, station, device: `Tablet ${stationLabel(station)}` })
                }}
            />
            <p className="m-0 text-xs text-fg-subtle">Im Beispiel funktionieren die Codes des Auftrags, z. B. 26100013-3/4.</p>
        </section>
    )
}
