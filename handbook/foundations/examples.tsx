"use client"

import * as React from "react"
import { AlertTriangle, Archive, Check, Copy, Pencil, Search, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { Input } from "@/components/atoms/Input/Input"
import { Label } from "@/components/atoms/Label/Label"
import { StatusBadge } from "@/components/status/StatusBadge"

/* Live examples for the foundation rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

const Row = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-center gap-2">{children}</div>

/* ---------- G-01 ---------- */
export const G01Good = () => (
    <div className="flex flex-col gap-3">
        <Row>
            <Button size="sm">Auftrag anlegen</Button>
            <Button size="sm" variant="outline">Exportieren</Button>
        </Row>
        <p className="m-0 flex items-center gap-1.5 text-sm text-warning"><AlertTriangle className="h-4 w-4" aria-hidden="true" />Liefertermin in 2 Tagen</p>
    </div>
)
export const G01Bad = () => (
    <div className="flex flex-col gap-3">
        <Row>
            {/* token-guard: allow — the anti-pattern is decorative colour */}
            <button className="rounded-control bg-violet-600 px-2.5 py-1 text-xs font-medium text-white">Auftrag anlegen</button>
            {/* token-guard: allow */}
            <button className="rounded-control bg-teal-500 px-2.5 py-1 text-xs font-medium text-white">Exportieren</button>
        </Row>
        {/* token-guard: allow */}
        <p className="m-0 text-sm text-pink-600">Liefertermin in 2 Tagen</p>
    </div>
)

/* ---------- G-02 ---------- */
export const G02Good = () => (
    <div className="flex flex-col gap-0 rounded-panel bg-surface-sunken p-3">
        <div className="rounded-panel border border-border bg-surface">
            <div className="border-b border-border px-3 py-2 text-xs font-medium text-fg-muted">Positionen</div>
            <div className="divide-y divide-border text-sm">
                <div className="px-3 py-2">1 · Ring 750 Gelbgold</div>
                <div className="px-3 py-2">2 · Anhänger INOX</div>
            </div>
        </div>
        <div className="relative">
            <div className="absolute right-2 -top-4 w-40 rounded-panel bg-surface-raised py-1 text-sm shadow-overlay">
                <div className="px-3 py-1">Duplizieren</div>
                <div className="px-3 py-1">Löschen</div>
            </div>
        </div>
        <div className="h-12" />
    </div>
)
export const G02Bad = () => (
    <div className="flex flex-col gap-3 p-1">
        <div className="rounded-panel bg-surface p-3 shadow-lg">
            <div className="mb-2 rounded-panel bg-surface p-2 text-xs font-medium shadow-md">Positionen</div>
            <div className="rounded-panel p-2 text-sm shadow">1 · Ring 750 Gelbgold</div>
            <div className="mt-2 rounded-panel p-2 text-sm shadow">2 · Anhänger INOX</div>
        </div>
    </div>
)

/* ---------- G-03 ---------- */
export const G03Good = () => (
    <div className="grid grid-cols-2 gap-2">
        {[false, true].map((dark) => (
            <div key={String(dark)} className={dark ? "dark" : undefined}>
                <div className="flex flex-col gap-2 rounded-panel border border-border bg-surface p-3 text-fg">
                    <span className="text-xs text-fg-muted">{dark ? "Dunkel" : "Hell"}</span>
                    <StatusBadge status={{ id: "active", label: "In Arbeit", category: "active" }} />
                    <p className="m-0 text-sm text-danger">Kunde fehlt</p>
                </div>
            </div>
        ))}
    </div>
)
export const G03Bad = () => (
    <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2 rounded-panel border border-border bg-surface p-3 text-sm">
            <span className="text-xs text-fg-muted">Hell</span>
            <span style={{ color: "#2b2b2b" }}>In Arbeit</span>
            <span style={{ color: "#c4322f" }}>Kunde fehlt</span>
        </div>
        <div className="flex flex-col gap-2 rounded-panel p-3 text-sm" style={{ background: "#121214" }}>
            <span className="text-xs" style={{ color: "#555" }}>Dunkel</span>
            <span style={{ color: "#2b2b2b" }}>In Arbeit</span>
            <span style={{ color: "#8a1f1d" }}>Kunde fehlt</span>
        </div>
    </div>
)

/* ---------- G-04 ---------- */
export const G04Good = () => (
    <div className="flex flex-col gap-1">
        <span className="text-xs text-fg-subtle">Auftrag 26100013</span>
        <span className="text-xl font-semibold text-fg">Ringe Herbst 2026</span>
        <span className="text-sm text-fg-muted">Dähler + Blaser · Liefertermin 14.11.2026</span>
        <span className="mt-3 text-base font-semibold text-fg">Positionen</span>
        <span className="text-sm text-fg">4 Positionen, 48 Stück</span>
    </div>
)
export const G04Bad = () => (
    <div className="flex flex-col">
        <span className="text-[10px] uppercase text-fg-subtle">Auftrag 26100013</span>
        <span className="text-3xl font-black text-fg">Ringe Herbst 2026</span>
        <span className="text-[15px] italic text-fg">Dähler + Blaser · Liefertermin 14.11.2026</span>
        <span className="mt-1 text-2xl font-light text-accent">Positionen</span>
        <span className="text-[11px] text-fg">4 Positionen, 48 Stück</span>
    </div>
)

/* ---------- G-05 ---------- */
const Field = ({ id, label, value }: { id: string; label: string; value: string }) => (
    <div className="flex flex-col gap-1"><Label htmlFor={id}>{label}</Label><Input id={id} defaultValue={value} /></div>
)
export const G05Good = () => (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold">Kunde</span>
            <Field id="g05-a" label="Firma" value="Dähler + Blaser" />
            <Field id="g05-b" label="Ansprechperson" value="M. Dähler" />
        </div>
        <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold">Lieferung</span>
            <Field id="g05-c" label="Termin" value="14.11.2026" />
        </div>
    </div>
)
export const G05Bad = () => (
    <div className="flex flex-col">
        <span className="mb-1 text-sm font-semibold">Kunde</span>
        <div className="mb-5 flex flex-col"><Label htmlFor="g05-d">Firma</Label><Input id="g05-d" className="mt-3" defaultValue="Dähler + Blaser" /></div>
        <div className="mb-2 flex flex-col"><Label htmlFor="g05-e">Ansprechperson</Label><Input id="g05-e" className="mt-0.5" defaultValue="M. Dähler" /></div>
        <span className="mb-4 text-sm font-semibold">Lieferung</span>
        <div className="flex flex-col"><Label htmlFor="g05-f">Termin</Label><Input id="g05-f" className="mt-2" defaultValue="14.11.2026" /></div>
    </div>
)

/* ---------- G-06 ---------- */
export const G06Good = () => (
    <div className="grid grid-cols-2 gap-4">
        {(["compact", "comfortable"] as const).map((d) => (
            <div key={d} data-density={d} className="flex flex-col gap-2">
                <span className="text-xs text-fg-muted">{d === "compact" ? "Kompakt" : "Komfortabel"}</span>
                <Input aria-label={`Nummer ${d}`} defaultValue="26100013-1" />
                <Button>Erfassen</Button>
            </div>
        ))}
    </div>
)
export const G06Bad = () => (
    <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
            <span className="text-xs text-fg-muted">Desktop</span>
            <Input aria-label="Nummer Desktop" defaultValue="26100013-1" />
            <Button>Erfassen</Button>
        </div>
        <div className="flex flex-col gap-2">
            <span className="text-xs text-fg-muted">TouchInput, TouchButton</span>
            <input aria-label="Nummer Touch" defaultValue="26100013-1" className="h-14 rounded-panel border-2 border-accent px-4 text-lg" />
            <button className="h-14 rounded-panel bg-success text-lg font-bold text-surface">ERFASSEN</button>
        </div>
    </div>
)

/* ---------- G-07 ---------- */
export const G07Good = () => (
    <Row>
        <Button size="sm" variant="outline" className="ring-2 ring-focus ring-offset-1 ring-offset-surface">Abbrechen</Button>
        <Button size="sm">Speichern</Button>
        <span className="text-xs text-fg-muted">← Tab steht hier</span>
    </Row>
)
export const G07Bad = () => (
    <Row>
        <button className="rounded-control border border-border-strong px-2.5 py-1 text-xs outline-none">Abbrechen</button>
        <button className="rounded-control bg-accent px-2.5 py-1 text-xs text-accent-fg outline-none">Speichern</button>
        <span className="text-xs text-fg-muted">Wo steht Tab?</span>
    </Row>
)

/* ---------- G-08 ---------- */
export const G08Good = () => (
    <div className="flex flex-col gap-2 text-sm">
        <p className="m-0">Ein Menü wächst 200 ms lang aus seinem Knopf; eine neue Zeile blendet sich ein. Danach steht alles still.</p>
        <div className="w-44 rounded-panel bg-surface-raised py-1 shadow-overlay motion-safe:animate-[dialog-in_var(--dur-base)_var(--ease-out)]">
            <div className="px-3 py-1">Duplizieren</div><div className="px-3 py-1">Archivieren</div>
        </div>
    </div>
)
export const G08Bad = () => (
    <div className="flex flex-col gap-2 text-sm">
        <p className="m-0">Die Karte hüpft dauernd, der Knopf pulsiert, um Aufmerksamkeit zu holen.</p>
        <div className="flex gap-2">
            <div className="animate-bounce rounded-panel border border-border px-3 py-2">3 neue Aufträge</div>
            <span className="animate-pulse rounded-control bg-accent px-2.5 py-1 text-xs text-accent-fg">Jetzt ansehen!</span>
        </div>
    </div>
)

/* ---------- G-09 ---------- */
export const G09Good = () => (
    <Row>
        <Button size="sm" variant="outline"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Bearbeiten</Button>
        <Button size="sm" variant="outline"><Archive className="h-3.5 w-3.5" aria-hidden="true" />Archivieren</Button>
        <Button size="icon" variant="ghost" aria-label="Suchen" title="Suchen"><Search className="h-4 w-4" aria-hidden="true" /></Button>
    </Row>
)
export const G09Bad = () => (
    <Row>
        <button className="rounded-control p-1.5 hover:bg-surface-hover"><Pencil className="h-4 w-4" /></button>
        <button className="rounded-control p-1.5 hover:bg-surface-hover"><Star className="h-4 w-4" /></button>
        <button className="rounded-control p-1.5 hover:bg-surface-hover"><Copy className="h-4 w-4" /></button>
        <button className="rounded-control p-1.5 hover:bg-surface-hover"><Trash2 className="h-4 w-4" /></button>
        <span className="text-xs text-fg-muted">Was macht der Stern?</span>
    </Row>
)

/* ---------- G-10 ---------- */
export const G10Good = () => (
    <div className="flex flex-col gap-2 text-sm">
        <Row><Button size="sm">Auftrag archivieren</Button></Row>
        <p className="m-0 flex items-center gap-1.5 text-fg"><Check className="h-4 w-4 text-success" aria-hidden="true" />Auftrag archiviert</p>
        <p className="m-0 text-fg-muted">Verlauf: P. Mohr hat den Auftrag archiviert · gerade eben</p>
    </div>
)
export const G10Bad = () => (
    <div className="flex flex-col gap-2 text-sm">
        <Row><Button size="sm">OK</Button></Row>
        <p className="m-0 text-fg">Datensatz erfolgreich deaktiviert!</p>
        <p className="m-0 font-mono text-xs text-fg-muted">order.status_id: 2 → 5 (user_id 7)</p>
    </div>
)
