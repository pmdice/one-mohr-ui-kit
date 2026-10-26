"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ClipboardList, FileText, MoreHorizontal, Search, Settings, ShieldCheck, Users, UserSquare } from "lucide-react"
import { Badge } from "@/components/atoms/Badge/Badge"
import { Button } from "@/components/atoms/Button/Button"
import { Breadcrumb } from "@/components/nav/Breadcrumb"
import { GlobalSearch } from "@/components/nav/GlobalSearch"
import { LinkProvider } from "@/components/nav/NavLink"
import { PageHeader } from "@/components/nav/PageHeader"
import { PageTabs } from "@/components/nav/PageTabs"
import { RecordPager } from "@/components/nav/RecordPager"
import { searchRecords, type SearchRecord } from "@/components/nav/search"
import { Sidebar, type NavGroup } from "@/components/nav/Sidebar"
import { ViewFilter } from "@/components/nav/ViewFilter"
import { cn } from "@/lib/utils"

/* Live examples for the navigation rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

/** Links in examples go nowhere. */
function NoopLink({ href, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return <a href={href} onClick={(e) => { onClick?.(e); e.preventDefault() }} {...props} />
}

function Frame({ children }: { children: React.ReactNode }) {
    return <LinkProvider component={NoopLink}>{children}</LinkProvider>
}

const ORDER = "#26100013 DÄHLER + BLASER"
const TRAIL = [
    { label: "Aufträge", href: "#auftraege" },
    { label: ORDER, href: "#auftrag" },
    { label: "Laufzettel 1/4", href: "#zettel" },
]

const GROUPS: NavGroup[] = [
    {
        id: "work", label: "Arbeit", entries: [
            { id: "orders", label: "Aufträge", href: "#auftraege", icon: ClipboardList, children: [{ id: "orders-mine", label: "Von mir erstellt", href: "#mine", icon: ClipboardList }] },
            { id: "slips", label: "Laufzettel", href: "#laufzettel", icon: FileText },
        ],
    },
    { id: "master", label: "Stammdaten", entries: [{ id: "customers", label: "Kunden", href: "#kunden", icon: UserSquare }] },
    {
        id: "admin", label: "Verwaltung", collapsible: true, entries: [
            { id: "users", label: "Benutzer", href: "#benutzer", icon: Users },
            { id: "roles", label: "Rollen", href: "#rollen", icon: ShieldCheck },
            { id: "settings", label: "Einstellungen", href: "#einstellungen", icon: Settings },
        ],
    },
]

function SidebarBox({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
    return <div className={cn("rounded-panel border border-border bg-surface", narrow ? "w-14" : "w-56")}>{children}</div>
}

/** Hand-built menu list for anti-patterns. */
function FakeMenu({ groups, active }: { groups: { label: string; entries: string[] }[]; active: string }) {
    return (
        <div className="flex w-56 flex-col gap-3 rounded-panel border border-border bg-surface p-3">
            {groups.map((g) => (
                <div key={g.label} className="flex flex-col gap-0.5">
                    <p className="m-0 px-2 text-[10px] font-medium uppercase tracking-wide text-fg-subtle">{g.label}</p>
                    {g.entries.map((e) => {
                        const on = `${g.label}/${e}` === active
                        return <span key={e} className={cn("rounded-control px-2 py-1 text-sm", on ? "bg-accent text-accent-fg" : "text-fg-muted")}>{e}</span>
                    })}
                </div>
            ))}
        </div>
    )
}

/* ---------- N-01 ---------- */

export function N01Good() {
    return <Frame><Breadcrumb trail={TRAIL} /></Frame>
}

export function N01Bad() {
    return (
        <div className="flex items-center gap-1 text-sm text-fg-muted">
            <span>Planung</span><ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-accent">Laufzettel</span><ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-medium text-fg">INOX – DÄHLER + BLASER</span>
        </div>
    )
}

/* ---------- N-02 ---------- */

export function N02Good() {
    return (
        <Frame>
            <div className="flex flex-col gap-3">
                <Breadcrumb trail={TRAIL} />
                <SidebarBox><Sidebar groups={GROUPS} activeId="slips" /></SidebarBox>
            </div>
        </Frame>
    )
}

export function N02Bad() {
    return (
        <div className="flex flex-col gap-3">
            <N01Bad />
            <FakeMenu groups={[{ label: "Planung", entries: ["Aufträge", "Laufzettel"] }]} active="Planung/Laufzettel" />
            <p className="m-0 text-xs text-fg-muted">Man kam aus dem Auftrag – Menü und Pfad springen beide zu „Laufzettel“.</p>
        </div>
    )
}

/* ---------- N-03 ---------- */

export function N03Good() {
    return <Frame><PageHeader trail={TRAIL.slice(0, 2)} back={{ label: "Offen · Aufträge", href: "#offen" }} title={ORDER} /></Frame>
}

export function N03Bad() {
    return (
        <div className="flex flex-col gap-3">
            <a href="#zurueck" onClick={(e) => e.preventDefault()} className="flex items-center gap-1 text-sm text-accent"><ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />Zurück zur Auftragsübersicht</a>
            <h3 className="m-0 text-xl font-semibold">{ORDER}</h3>
            <p className="m-0 text-xs text-fg-muted">Führt zur ungefilterten Liste, Seite 1 – Ansicht „Offen“ und Suche sind weg.</p>
        </div>
    )
}

/* ---------- N-04 ---------- */

export function N04Good() {
    const [current, setCurrent] = React.useState("1")
    return (
        <Frame>
            <div className="flex items-center justify-between gap-3">
                <span className="text-lg font-semibold">Laufzettel {current}/4</span>
                <RecordPager ids={["1", "2", "3", "4"]} currentId={current} hrefFor={(id) => `#${id}`} label="im Auftrag" onNavigate={(href) => setCurrent(href.slice(1))} shortcuts={false} />
            </div>
        </Frame>
    )
}

export function N04Bad() {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-lg font-semibold">Laufzettel 1/4</span>
            <p className="m-0 text-xs text-fg-muted">Für den nächsten Zettel: zurück zum Auftrag, Tab „Laufzettel“, nächsten Eintrag suchen, öffnen.</p>
        </div>
    )
}

/* ---------- N-05 ---------- */

export function N05Good() {
    return (
        <Frame>
            <PageHeader
                trail={TRAIL.slice(0, 2)}
                title={ORDER}
                badges={<Badge>Offen</Badge>}
                moreActions={<Button variant="ghost" size="icon" aria-label="Weitere Aktionen"><MoreHorizontal className="h-4 w-4" aria-hidden="true" /></Button>}
                primaryAction={<Button size="sm">Status ändern</Button>}
                tabs={{ tabs: [{ label: "Details", href: "#d" }, { label: "Laufzettel", href: "#l", count: 4 }, { label: "Verlauf", href: "#v" }], current: "#d" }}
            />
        </Frame>
    )
}

export function N05Bad() {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <h3 className="m-0 text-xl font-semibold">Details</h3>
                <div className="flex gap-2"><Button size="sm">Weiterreichen</Button><Button size="sm">Status ändern</Button></div>
            </div>
            <p className="m-0 text-xs text-fg-muted">Welcher Auftrag? Welcher Knopf ist der wichtige?</p>
        </div>
    )
}

/* ---------- N-06 ---------- */

const RECORDS: SearchRecord[] = [
    { type: "order", id: "o", title: ORDER, href: "#o", identifiers: ["26100013"], text: ["DÄHLER + BLASER"] },
    ...[1, 2, 3, 4].map((n) => ({
        type: "slip", id: `s${n}`, title: `Laufzettel ${n}/4`, context: `Auftrag ${ORDER}`, href: `#s${n}`,
        identifiers: [`26100013 – ${n}/4`, `26100013-${n}`],
    })),
]

export function N06Good() {
    const [opened, setOpened] = React.useState<string | null>(null)
    return (
        <Frame>
            <div className="flex flex-col gap-2 pb-48">
                <GlobalSearch
                    search={async (q) => searchRecords(RECORDS, q, { typeOrder: ["order", "slip"] })}
                    typeLabels={{ order: "Aufträge", slip: "Laufzettel" }}
                    placeholder="z. B. 26100013-2 tippen, Enter"
                    onNavigate={(href) => setOpened(RECORDS.find((r) => r.href === href)?.title ?? href)}
                />
                {opened && <p className="m-0 text-xs text-fg-muted">Geöffnet: {opened}</p>}
            </div>
        </Frame>
    )
}

export function N06Bad() {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex h-8 items-center gap-2 rounded-control border border-border px-2.5 text-sm"><Search className="h-3.5 w-3.5 text-fg-subtle" aria-hidden="true" />26100013 – 2/4</div>
            <p className="m-0 text-sm text-fg-muted">Keine Treffer</p>
            <p className="m-0 text-xs text-fg-muted">Nur Aufträge sind suchbar. Nummer vom Papier → Auftrag suchen → Tab → Zettel.</p>
        </div>
    )
}

/* ---------- N-07 ---------- */

export function N07Good() {
    return (
        <Frame>
            <div className="flex flex-col gap-3">
                <div className="flex h-10 items-center rounded-panel border border-border bg-surface px-3">
                    <div className="flex h-7 w-full items-center gap-2 rounded-control border border-border bg-surface-sunken px-2.5 text-xs text-fg-subtle"><Search className="h-3.5 w-3.5" aria-hidden="true" />Nummer, Kunde oder Titel suchen <kbd className="ml-auto font-mono">/</kbd></div>
                </div>
                <div className="flex items-center gap-3">
                    <ViewFilter views={[{ id: "a", label: "Alle", href: "#a", count: 17 }, { id: "o", label: "Offen", href: "#o", count: 14 }]} current="o" label="Ansicht" />
                    <div className="flex h-7 flex-1 items-center rounded-control border border-border bg-surface px-2.5 text-xs text-fg-subtle">In Aufträgen suchen …</div>
                </div>
            </div>
        </Frame>
    )
}

export function N07Bad() {
    const field = <div className="flex h-8 items-center gap-2 rounded-control border border-border bg-surface px-2.5 text-xs text-fg-subtle"><Search className="h-3.5 w-3.5" aria-hidden="true" />Suchen …</div>
    return <div className="flex flex-col gap-2">{field}{field}<p className="m-0 text-xs text-fg-muted">Welches Feld durchsucht was?</p></div>
}

/* ---------- N-08 ---------- */

export function N08Good() {
    return (
        <dl className="m-0 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-fg-subtle">Kunde</dt><dd className="m-0"><a href="#k" onClick={(e) => e.preventDefault()} className="text-accent underline-offset-2 hover:underline">10073 DÄHLER + BLASER</a></dd></div>
            <div><dt className="text-xs text-fg-subtle">Auftrag</dt><dd className="m-0"><a href="#a" onClick={(e) => e.preventDefault()} className="text-accent underline-offset-2 hover:underline">{ORDER}</a></dd></div>
        </dl>
    )
}

export function N08Bad() {
    return (
        <dl className="m-0 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-fg-subtle">Kunde</dt><dd className="m-0">10073 DÄHLER + BLASER</dd></div>
            <div><dt className="text-xs text-fg-subtle">Auftrag</dt><dd className="m-0">26100013</dd></div>
        </dl>
    )
}

/* ---------- N-09 / N-10 ---------- */

export function N09Good() {
    return <Frame><SidebarBox><Sidebar groups={GROUPS.slice(0, 1)} activeId="orders-mine" /></SidebarBox></Frame>
}

export function N09Bad() {
    return <FakeMenu groups={[{ label: "Persönlich", entries: ["Aufträge", "Laufzettel"] }, { label: "Planung", entries: ["Aufträge", "Laufzettel"] }]} active="Planung/Aufträge" />
}

export function N10Good() {
    return <Frame><SidebarBox><Sidebar groups={GROUPS} activeId="orders" /></SidebarBox></Frame>
}

export function N10Bad() {
    return (
        <FakeMenu
            active="Planung/Aufträge"
            groups={[
                { label: "Persönlich", entries: ["Dashboard", "Aufträge"] },
                { label: "Stammdaten", entries: ["Artikel", "Kunden"] },
                { label: "Planung", entries: ["Aufträge", "Laufzettel"] },
                { label: "Konfiguration", entries: ["Benutzer", "Rollen"] },
                { label: "Einstellungen", entries: ["Typen"] },
            ]}
        />
    )
}

/* ---------- N-11 ---------- */

export function N11Good() {
    return (
        <Frame>
            <div className="flex flex-col gap-4">
                <div><p className="m-0 mb-1 text-xs text-fg-subtle">Seiten-Tabs eines Auftrags</p><PageTabs tabs={[{ label: "Details", href: "#d" }, { label: "Laufzettel", href: "#l", count: 4 }, { label: "Verlauf", href: "#v" }]} current="#d" /></div>
                <div><p className="m-0 mb-1 text-xs text-fg-subtle">Ansichten der Auftragsliste</p><ViewFilter views={[{ id: "a", label: "Alle", href: "#a", count: 17 }, { id: "o", label: "Offen", href: "#o", count: 14 }, { id: "b", label: "In Bearbeitung", href: "#b", count: 0 }]} current="a" label="Ansicht" /></div>
            </div>
        </Frame>
    )
}

export function N11Bad() {
    const pills = (items: string[]) => (
        <div className="flex gap-1">{items.map((t, i) => <span key={t} className={cn("rounded-panel px-3 py-1 text-xs", i === 0 ? "bg-accent text-accent-fg" : "bg-surface-sunken text-fg-muted")}>{t}</span>)}</div>
    )
    return (
        <div className="flex flex-col gap-4">
            <div><p className="m-0 mb-1 text-xs text-fg-subtle">Seiten-Tabs eines Auftrags</p>{pills(["Details", "Guss", "Verlauf"])}</div>
            <div><p className="m-0 mb-1 text-xs text-fg-subtle">Ansichten der Auftragsliste</p>{pills(["Alle", "Offen", "In Bearbeitung"])}</div>
        </div>
    )
}

/* ---------- N-12 ---------- */

export function N12Good() {
    return <Frame><SidebarBox narrow><Sidebar groups={GROUPS.slice(0, 2)} activeId="slips" collapsed /></SidebarBox></Frame>
}

export function N12Bad() {
    return (
        <div className="flex w-14 flex-col items-center gap-2 rounded-panel border border-border bg-surface py-3 text-fg-muted">
            {[ClipboardList, FileText, UserSquare].map((Icon, i) => <Icon key={i} className="h-4 w-4" aria-hidden="true" />)}
            <p className="m-0 px-1 text-center text-[10px] leading-tight text-fg-subtle">keine Namen, keine Markierung</p>
        </div>
    )
}
