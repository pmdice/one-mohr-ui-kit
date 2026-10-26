"use client"

import * as React from "react"
import { Boxes, ClipboardList, FileText, Gauge, Layers, Settings, ShieldCheck, Users, UserSquare } from "lucide-react"
import { Badge } from "@/components/atoms/Badge/Badge"
import { cn } from "@/lib/utils"
import { AppShell } from "../AppShell"
import { GlobalSearch } from "../GlobalSearch"
import { LinkProvider, NavLink } from "../NavLink"
import { PageHeader } from "../PageHeader"
import { RecordPager } from "../RecordPager"
import { searchRecords, type SearchRecord } from "../search"
import type { NavGroup } from "../Sidebar"
import { ViewFilter, type View } from "../ViewFilter"
import {
    CUSTOMERS, ORDERS, SLIPS, STATUS_LABEL, customerOf, orderLabel, slipLabel, slipNumber, slipsOf,
    type Order, type Slip,
} from "./data"
import { MemoryRouter, RouterLink, hrefOf, useLocation, useNavigate, useReplace } from "./router"

const PAGE_SIZE = 10

const GROUPS: NavGroup[] = [
    { id: "start", entries: [{ id: "overview", label: "Übersicht", href: "/uebersicht", icon: Gauge }] },
    {
        id: "work", label: "Arbeit", entries: [
            {
                id: "orders", label: "Aufträge", href: "/auftraege", icon: ClipboardList,
                children: [{ id: "orders-mine", label: "Von mir erstellt", href: "/auftraege?view=mine", icon: ClipboardList }],
            },
            { id: "slips", label: "Laufzettel", href: "/laufzettel", icon: FileText },
        ],
    },
    {
        id: "master", label: "Stammdaten", entries: [
            { id: "customers", label: "Kunden", href: "/kunden", icon: UserSquare },
            { id: "articles", label: "Artikel", href: "/stammdaten/artikel", icon: Boxes },
            { id: "materials", label: "Materialien", href: "/stammdaten/materialien", icon: Layers },
        ],
    },
    {
        id: "admin", label: "Verwaltung", collapsible: true, entries: [
            { id: "users", label: "Benutzer", href: "/verwaltung/benutzer", icon: Users },
            { id: "roles", label: "Rollen", href: "/verwaltung/rollen", icon: ShieldCheck },
            { id: "settings", label: "Einstellungen", href: "/verwaltung/einstellungen", icon: Settings },
        ],
    },
]

const PLACEHOLDERS: Record<string, { id: string; label: string }> = {
    "/uebersicht": { id: "overview", label: "Übersicht" },
    "/stammdaten/artikel": { id: "articles", label: "Artikel" },
    "/stammdaten/materialien": { id: "materials", label: "Materialien" },
    "/verwaltung/benutzer": { id: "users", label: "Benutzer" },
    "/verwaltung/rollen": { id: "roles", label: "Rollen" },
    "/verwaltung/einstellungen": { id: "settings", label: "Einstellungen" },
}

// ---- Lists and their views ----------------------------------------------------------

const ORDER_VIEWS = [
    { id: "alle", label: "Alle", test: () => true },
    { id: "offen", label: "Offen", test: (o: Order) => o.status === "offen" },
    { id: "in-bearbeitung", label: "In Bearbeitung", test: (o: Order) => o.status === "in-bearbeitung" },
    { id: "mine", label: "Von mir erstellt", test: (o: Order) => o.createdBy === "me" },
]
const SLIP_VIEWS = [
    { id: "alle", label: "Alle", test: () => true },
    { id: "offen", label: "Offen", test: (s: Slip) => ORDERS.find((o) => o.id === s.orderId)!.status === "offen" },
]

const viewOf = <T,>(views: { id: string; label: string; test: (x: T) => boolean }[], id: string | null) =>
    views.find((v) => v.id === id) ?? views[0]

const matchesText = (q: string, ...values: string[]) => !q || values.some((v) => v.toLowerCase().includes(q.toLowerCase()))

function filterOrders(query: URLSearchParams): Order[] {
    const view = viewOf(ORDER_VIEWS, query.get("view"))
    const q = query.get("q") ?? ""
    return ORDERS.filter((o) => view.test(o) && matchesText(q, o.id, customerOf(o).name, o.customerRef))
}

function filterSlips(query: URLSearchParams): Slip[] {
    const view = viewOf(SLIP_VIEWS, query.get("view"))
    const q = query.get("q") ?? ""
    return SLIPS.filter((s) => view.test(s) && matchesText(q, slipNumber(s), `${s.orderId}-${s.index}`, s.material, customerOf(ORDERS.find((o) => o.id === s.orderId)!).name))
}

/** The list an object was opened from, read from its `from` parameter (N-02, N-03). */
function originOf(from: string | null) {
    if (!from) return null
    const [path, search = ""] = from.split("?")
    const query = new URLSearchParams(search)
    query.delete("highlight")
    if (path === "/auftraege") {
        const view = viewOf(ORDER_VIEWS, query.get("view"))
        return { kind: "orders" as const, href: hrefOf(path, Object.fromEntries(query)), query, menuId: view.id === "mine" ? "orders-mine" : "orders", label: `${view.label} · Aufträge`, viewLabel: view.label }
    }
    if (path === "/laufzettel") {
        const view = viewOf(SLIP_VIEWS, query.get("view"))
        return { kind: "slips" as const, href: hrefOf(path, Object.fromEntries(query)), query, menuId: "slips", label: `${view.label} · Laufzettel`, viewLabel: view.label }
    }
    return null
}

/** Back to the list, with the opened row highlighted (N-03). */
const backHref = (originHref: string, highlight: string) => {
    const [path, search = ""] = originHref.split("?")
    return hrefOf(path, { ...Object.fromEntries(new URLSearchParams(search)), highlight })
}

const orderHref = (id: string, from?: string, sub = "") => hrefOf(`/auftraege/${id}${sub}`, { from })
const slipHref = (slip: Slip, from?: string) => hrefOf(`/auftraege/${slip.orderId}/laufzettel/${slip.index}`, { from })
const slipKey = (slip: Slip) => `${slip.orderId}-${slip.index}`

// ---- Search -------------------------------------------------------------------------

const RECORDS: SearchRecord[] = [
    ...ORDERS.map((o) => ({
        type: "order", id: o.id, title: orderLabel(o), context: `${STATUS_LABEL[o.status]} · ${o.date}`,
        href: orderHref(o.id), identifiers: [o.id, o.customerRef], text: [customerOf(o).name],
    })),
    ...SLIPS.map((s) => {
        const order = ORDERS.find((o) => o.id === s.orderId)!
        return {
            type: "slip", id: slipKey(s), title: `${slipLabel(s)} ${s.material}`, context: `Auftrag ${orderLabel(order)}`,
            href: slipHref(s), identifiers: [slipNumber(s), `${s.orderId}-${s.index}`],
        }
    }),
    ...CUSTOMERS.map((c) => ({ type: "customer", id: c.id, title: c.name, context: `Kunde ${c.id}`, href: `/kunden/${c.id}`, identifiers: [c.id], text: [c.name] })),
]
const TYPE_LABELS = { order: "Aufträge", slip: "Laufzettel", customer: "Kunden" }
const runSearch = async (q: string) => searchRecords(RECORDS, q, { typeOrder: ["order", "slip", "customer"] })

// ---- App ----------------------------------------------------------------------------

/** A small clickable app that applies N-01–N-12: list → order → slip, customers, search. */
export function ExampleApp({ initial = "/auftraege" }: { initial?: string }) {
    return (
        <MemoryRouter initial={initial}>
            <LinkProvider component={RouterLink}>
                <App />
            </LinkProvider>
        </MemoryRouter>
    )
}

function App() {
    const { path, query } = useLocation()
    const navigate = useNavigate()
    const origin = originOf(query.get("from"))
    const page = route(path, query, origin)

    return (
        <AppShell
            logo={<span className="px-1 text-sm font-semibold text-fg">Beispiel-App</span>}
            groups={GROUPS}
            activeId={origin?.menuId ?? page.menuId}
            search={<GlobalSearch search={runSearch} typeLabels={TYPE_LABELS} onNavigate={navigate} />}
        >
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">{page.content}</div>
        </AppShell>
    )
}

type Origin = ReturnType<typeof originOf>

function route(path: string, query: URLSearchParams, origin: Origin): { menuId: string; content: React.ReactNode } {
    let m: RegExpMatchArray | null
    if (path === "/auftraege") return { menuId: query.get("view") === "mine" ? "orders-mine" : "orders", content: <OrdersList query={query} /> }
    if ((m = path.match(/^\/auftraege\/(\d+)\/laufzettel\/(\d+)$/))) {
        const slip = SLIPS.find((s) => s.orderId === m![1] && s.index === Number(m![2]))
        if (slip) return { menuId: "orders", content: <SlipPage slip={slip} origin={origin} /> }
    }
    if ((m = path.match(/^\/auftraege\/(\d+)(\/laufzettel|\/verlauf)?$/))) {
        const order = ORDERS.find((o) => o.id === m![1])
        if (order) return { menuId: "orders", content: <OrderPage order={order} sub={m[2] ?? ""} origin={origin} /> }
    }
    if (path === "/laufzettel") return { menuId: "slips", content: <SlipsList query={query} /> }
    if (path === "/kunden") return { menuId: "customers", content: <CustomersList /> }
    if ((m = path.match(/^\/kunden\/(\d+)$/))) {
        const customer = CUSTOMERS.find((c) => c.id === m![1])
        if (customer) return { menuId: "customers", content: <CustomerPage customerId={customer.id} /> }
    }
    const placeholder = PLACEHOLDERS[path]
    if (placeholder) return { menuId: placeholder.id, content: <Placeholder label={placeholder.label} href={path} /> }
    return { menuId: "", content: <Placeholder label="Nicht gefunden" href={path} /> }
}

// ---- Pages --------------------------------------------------------------------------

function useHighlight(id: string | null) {
    const [highlight, setHighlight] = React.useState(id)
    React.useEffect(() => {
        setHighlight(id)
        if (!id) return
        const timer = setTimeout(() => setHighlight(null), 2000)
        return () => clearTimeout(timer)
    }, [id])
    return highlight
}

function ListPage({ title, views, current, searchLabel, query, path, rows, total }: {
    title: string; views: View[]; current: string; searchLabel: string; query: URLSearchParams; path: string; rows: React.ReactNode; total: number
}) {
    const replace = useReplace()
    const page = Number(query.get("page") ?? "1")
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const params = (extra: Record<string, string | number | undefined>) =>
        hrefOf(path, { view: query.get("view") ?? undefined, q: query.get("q") ?? undefined, page: query.get("page") ?? undefined, ...extra })

    return (
        <>
            <header className="flex flex-col gap-3">
                <h1 className="m-0 text-xl font-semibold text-fg">{title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                    <ViewFilter views={views} current={current} label="Ansicht" />
                    <input
                        type="search"
                        aria-label={searchLabel}
                        placeholder={`${searchLabel} …`}
                        value={query.get("q") ?? ""}
                        onChange={(e) => replace(params({ q: e.target.value, page: undefined }))}
                        className="h-7 w-64 rounded-control border border-border bg-surface px-2.5 text-xs text-fg placeholder:text-fg-subtle focus-visible:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30"
                    />
                </div>
            </header>
            <div className="overflow-x-auto rounded-panel border border-border bg-surface">
                <table className="w-full border-collapse text-sm">{rows}</table>
            </div>
            {pages > 1 && (
                <div className="flex items-center justify-between text-xs text-fg-muted">
                    {page > 1 ? <NavLink href={params({ page: page - 1 })} className="text-accent hover:underline">Vorherige Seite</NavLink> : <span />}
                    <span className="tabular-nums">Seite {page} von {pages}</span>
                    {page < pages ? <NavLink href={params({ page: page + 1 })} className="text-accent hover:underline">Nächste Seite</NavLink> : <span />}
                </div>
            )}
        </>
    )
}

const th = "border-b border-border px-3 py-2 text-left text-xs font-medium text-fg-subtle"
const td = "border-b border-border px-3 py-2"
const link = "text-accent underline-offset-2 hover:underline"

function Row({ highlighted, children }: { highlighted: boolean; children: React.ReactNode }) {
    return (
        <tr data-highlighted={highlighted || undefined} className={cn("transition-colors duration-700", highlighted ? "bg-accent-subtle" : "hover:bg-surface-hover")}>
            {children}
        </tr>
    )
}

const pageSlice = <T,>(items: T[], query: URLSearchParams) => {
    const page = Number(query.get("page") ?? "1")
    return items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
}

/** The current list href without the one-off highlight, used as `from` for opened rows. */
const listHref = (path: string, query: URLSearchParams) => {
    const params = new URLSearchParams(query)
    params.delete("highlight")
    return hrefOf(path, Object.fromEntries(params))
}

function OrdersList({ query }: { query: URLSearchParams }) {
    const highlight = useHighlight(query.get("highlight"))
    const current = viewOf(ORDER_VIEWS, query.get("view")).id
    const orders = filterOrders(query)
    const from = listHref("/auftraege", query)
    const views: View[] = ORDER_VIEWS.map((v) => ({
        id: v.id, label: v.label, count: ORDERS.filter(v.test).length,
        href: hrefOf("/auftraege", { view: v.id === "alle" ? undefined : v.id, q: query.get("q") ?? undefined }),
    }))

    return (
        <ListPage
            title="Aufträge" views={views} current={current} searchLabel="In Aufträgen suchen" query={query} path="/auftraege" total={orders.length}
            rows={
                <>
                    <thead><tr><th className={th}>Auftrag</th><th className={th}>Kunde</th><th className={th}>Datum</th><th className={th}>Status</th><th className={cn(th, "text-right")}>Laufzettel</th></tr></thead>
                    <tbody>
                        {pageSlice(orders, query).map((o) => (
                            <Row key={o.id} highlighted={highlight === o.id}>
                                <td className={td}><NavLink href={orderHref(o.id, from)} className={cn(link, "font-medium")}>{orderLabel(o)}</NavLink></td>
                                <td className={td}><NavLink href={`/kunden/${o.customerId}`} className={link}>{customerOf(o).name}</NavLink></td>
                                <td className={cn(td, "tabular-nums text-fg-muted")}>{o.date}</td>
                                <td className={td}><StatusBadge order={o} /></td>
                                <td className={cn(td, "text-right tabular-nums")}>{slipsOf(o.id).length}</td>
                            </Row>
                        ))}
                    </tbody>
                </>
            }
        />
    )
}

function SlipsList({ query }: { query: URLSearchParams }) {
    const highlight = useHighlight(query.get("highlight"))
    const current = viewOf(SLIP_VIEWS, query.get("view")).id
    const slips = filterSlips(query)
    const from = listHref("/laufzettel", query)
    const views: View[] = SLIP_VIEWS.map((v) => ({
        id: v.id, label: v.label, count: SLIPS.filter(v.test).length,
        href: hrefOf("/laufzettel", { view: v.id === "alle" ? undefined : v.id, q: query.get("q") ?? undefined }),
    }))

    return (
        <ListPage
            title="Laufzettel" views={views} current={current} searchLabel="In Laufzetteln suchen" query={query} path="/laufzettel" total={slips.length}
            rows={
                <>
                    <thead><tr><th className={th}>Laufzettel</th><th className={th}>Nummer</th><th className={th}>Material</th><th className={th}>Auftrag</th></tr></thead>
                    <tbody>
                        {pageSlice(slips, query).map((s) => {
                            const order = ORDERS.find((o) => o.id === s.orderId)!
                            return (
                                <Row key={slipKey(s)} highlighted={highlight === slipKey(s)}>
                                    <td className={td}><NavLink href={slipHref(s, from)} className={cn(link, "font-medium")}>{slipLabel(s)}</NavLink></td>
                                    <td className={cn(td, "font-mono text-xs text-fg-muted")}>{slipNumber(s)}</td>
                                    <td className={td}>{s.material}</td>
                                    <td className={td}><NavLink href={orderHref(order.id)} className={link}>{orderLabel(order)}</NavLink></td>
                                </Row>
                            )
                        })}
                    </tbody>
                </>
            }
        />
    )
}

function StatusBadge({ order }: { order: Order }) {
    const variant = order.status === "offen" ? "default" : order.status === "in-bearbeitung" ? "warning" : "success"
    return <Badge variant={variant}>{STATUS_LABEL[order.status]}</Badge>
}

function Fields({ children }: { children: React.ReactNode }) {
    return <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-3 rounded-panel border border-border bg-surface p-4 sm:grid-cols-2">{children}</dl>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-fg-subtle">{label}</dt>
            <dd className="m-0 text-sm text-fg">{children}</dd>
        </div>
    )
}

function OrderPage({ order, sub, origin }: { order: Order; sub: string; origin: Origin }) {
    const navigate = useNavigate()
    const from = origin?.href
    const slips = slipsOf(order.id)
    const tabs = [
        { label: "Details", href: orderHref(order.id, from) },
        { label: "Laufzettel", href: orderHref(order.id, from, "/laufzettel"), count: slips.length },
        { label: "Verlauf", href: orderHref(order.id, from, "/verlauf") },
    ]
    const current = orderHref(order.id, from, sub)
    const pagerIds = origin?.kind === "orders" ? filterOrders(origin.query).map((o) => o.id) : []

    return (
        <>
            <PageHeader
                trail={[{ label: "Aufträge", href: "/auftraege" }, { label: orderLabel(order), href: orderHref(order.id) }]}
                back={origin ? { label: origin.label, href: backHref(origin.href, order.id) } : undefined}
                title={orderLabel(order)}
                badges={<StatusBadge order={order} />}
                pager={origin?.kind === "orders" && (
                    <RecordPager ids={pagerIds} currentId={order.id} hrefFor={(id) => orderHref(id, from)} label={`· ${origin.viewLabel}`} onNavigate={navigate} />
                )}
                tabs={{ tabs, current }}
            />
            {sub === "" && (
                <Fields>
                    <Field label="Auftragsnummer"><span className="font-mono">{order.id}</span></Field>
                    <Field label="Kunde"><NavLink href={`/kunden/${order.customerId}`} className={link}>{customerOf(order).id} {customerOf(order).name}</NavLink></Field>
                    <Field label="Kunden-Auftragsnummer">{order.customerRef}</Field>
                    <Field label="Auftragsdatum">{order.date}</Field>
                </Fields>
            )}
            {sub === "/laufzettel" && (
                <ul className="m-0 flex list-none flex-col divide-y divide-border rounded-panel border border-border bg-surface p-0">
                    {slips.map((s) => (
                        <li key={s.index} className="flex items-center justify-between gap-4 px-4 py-2.5">
                            <NavLink href={slipHref(s)} className={cn(link, "font-medium")}>{slipLabel(s)}</NavLink>
                            <span className="text-sm text-fg-muted">{s.material}</span>
                            <span className="font-mono text-xs text-fg-subtle">{slipNumber(s)}</span>
                        </li>
                    ))}
                </ul>
            )}
            {sub === "/verlauf" && <p className="m-0 text-sm text-fg-muted">Der Verlauf ist in diesem Beispiel leer.</p>}
        </>
    )
}

function SlipPage({ slip, origin }: { slip: Slip; origin: Origin }) {
    const navigate = useNavigate()
    const order = ORDERS.find((o) => o.id === slip.orderId)!
    const fromList = origin?.kind === "slips" ? origin : null
    const pager = fromList ? (
        <RecordPager
            ids={filterSlips(fromList.query).map(slipKey)}
            currentId={slipKey(slip)}
            hrefFor={(key) => slipHref(SLIPS.find((s) => slipKey(s) === key)!, fromList.href)}
            label={`· ${fromList.viewLabel}`}
            onNavigate={navigate}
        />
    ) : (
        <RecordPager
            ids={slipsOf(order.id).map((s) => String(s.index))}
            currentId={String(slip.index)}
            hrefFor={(index) => slipHref(SLIPS.find((s) => s.orderId === order.id && s.index === Number(index))!)}
            label="im Auftrag"
            onNavigate={navigate}
        />
    )

    return (
        <>
            <PageHeader
                trail={[
                    { label: "Aufträge", href: "/auftraege" },
                    { label: orderLabel(order), href: orderHref(order.id) },
                    { label: slipLabel(slip), href: slipHref(slip) },
                ]}
                back={fromList ? { label: fromList.label, href: backHref(fromList.href, slipKey(slip)) } : undefined}
                title={slipLabel(slip)}
                badges={<Badge variant="secondary">{slip.material}</Badge>}
                pager={pager}
            />
            <Fields>
                <Field label="Laufzettelnummer"><span className="font-mono">{slipNumber(slip)}</span></Field>
                <Field label="Auftrag"><NavLink href={orderHref(order.id)} className={link}>{orderLabel(order)}</NavLink></Field>
                <Field label="Kunde"><NavLink href={`/kunden/${order.customerId}`} className={link}>{customerOf(order).id} {customerOf(order).name}</NavLink></Field>
                <Field label="Material">{slip.material}</Field>
            </Fields>
        </>
    )
}

function CustomersList() {
    return (
        <>
            <h1 className="m-0 text-xl font-semibold text-fg">Kunden</h1>
            <div className="overflow-x-auto rounded-panel border border-border bg-surface">
                <table className="w-full border-collapse text-sm">
                    <thead><tr><th className={th}>Nummer</th><th className={th}>Name</th><th className={cn(th, "text-right")}>Aufträge</th></tr></thead>
                    <tbody>
                        {CUSTOMERS.map((c) => (
                            <Row key={c.id} highlighted={false}>
                                <td className={cn(td, "font-mono text-xs")}>{c.id}</td>
                                <td className={td}><NavLink href={`/kunden/${c.id}`} className={cn(link, "font-medium")}>{c.name}</NavLink></td>
                                <td className={cn(td, "text-right tabular-nums")}>{ORDERS.filter((o) => o.customerId === c.id).length}</td>
                            </Row>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

function CustomerPage({ customerId }: { customerId: string }) {
    const customer = CUSTOMERS.find((c) => c.id === customerId)!
    const orders = ORDERS.filter((o) => o.customerId === customerId)
    return (
        <>
            <PageHeader trail={[{ label: "Kunden", href: "/kunden" }, { label: customer.name, href: `/kunden/${customer.id}` }]} title={customer.name} />
            <section className="flex flex-col gap-2">
                <h2 className="m-0 text-sm font-semibold text-fg">Aufträge</h2>
                <ul className="m-0 flex list-none flex-col divide-y divide-border rounded-panel border border-border bg-surface p-0">
                    {orders.map((o) => (
                        <li key={o.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                            <NavLink href={orderHref(o.id)} className={cn(link, "font-medium")}>{orderLabel(o)}</NavLink>
                            <StatusBadge order={o} />
                        </li>
                    ))}
                </ul>
            </section>
        </>
    )
}

function Placeholder({ label, href }: { label: string; href: string }) {
    return (
        <>
            <PageHeader trail={[{ label, href }]} title={label} />
            <p className="m-0 text-sm text-fg-muted">Platzhalter – diese Seite zeigt nur, wo sie im Menü steht.</p>
        </>
    )
}
