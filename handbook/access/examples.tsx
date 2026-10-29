"use client"

import * as React from "react"
import { Archive, CalendarClock, Trash2 } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { Input } from "@/components/atoms/Input/Input"
import { Label } from "@/components/atoms/Label/Label"
import { Guarded } from "@/components/access/Guarded"
import { ImpersonationBanner } from "@/components/access/ImpersonationBanner"
import { ReadOnlyNotice } from "@/components/access/ReadOnlyNotice"
import { RightsSummary } from "@/components/access/RightsSummary"
import { RoleBadge } from "@/components/access/RoleBadge"
import { Property, PropertyList } from "@/components/record/PropertyList"

/* Live examples for the rights rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

const Row = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-start gap-3">{children}</div>
const Act = ({ label, icon: Icon, disabled, ...rest }: { label: string; icon: typeof Archive; disabled?: boolean; "aria-describedby"?: string }) => (
    <Button size="sm" variant="outline" aria-disabled={disabled || undefined} aria-describedby={rest["aria-describedby"]} className={disabled ? "cursor-not-allowed opacity-60" : undefined}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
    </Button>
)

/* ---------- B-01 ---------- */
export const B01Good = () => (
    <Row>
        <Guarded decision={{ kind: "disabled", reason: "Nur Büro und Teamleitung", requestable: true }} what="Liefertermin verschieben" onRequest={() => {}}>{(p) => <Act icon={CalendarClock} label="Liefertermin verschieben" {...p} />}</Guarded>
        <Guarded decision={{ kind: "hidden" }}>{(p) => <Act icon={Trash2} label="Löschen" {...p} />}</Guarded>
    </Row>
)
export const B01Bad = () => (
    <Row>
        {["Bearbeiten", "Verschieben", "Archivieren", "Löschen", "Preise", "Exportieren"].map((l) => <Button key={l} size="sm" variant="outline" disabled>{l}</Button>)}
    </Row>
)

/* ---------- B-02 ---------- */
export const B02Good = () => <Guarded decision={{ kind: "disabled", reason: "Zuerst alle Laufzettel abschliessen (3 offen)." }}>{(p) => <Act icon={Archive} label="Archivieren" {...p} />}</Guarded>
export const B02Bad = () => <Button size="sm" variant="outline" disabled title="Nicht möglich"><Archive className="h-3.5 w-3.5" aria-hidden="true" />Archivieren</Button>

/* ---------- B-03 ---------- */
export const B03Good = () => (
    <div className="flex flex-col gap-3">
        <ReadOnlyNotice area="Aufträge" who={["Büro", "Teamleitung"]} onRequest={() => {}} />
        <PropertyList label="Eigenschaften B-03"><Property label="Kunde">Dähler + Blaser</Property><Property label="Liefertermin">Fr, 13.11.2026</Property></PropertyList>
    </div>
)
export const B03Bad = () => (
    <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1"><Label htmlFor="b03-a">Kunde</Label><Input id="b03-a" disabled defaultValue="Dähler + Blaser" /></div>
        <div className="flex flex-col gap-1"><Label htmlFor="b03-b">Liefertermin</Label><Input id="b03-b" disabled defaultValue="13.11.2026" /></div>
        <Button size="sm" disabled className="w-fit">Speichern</Button>
    </div>
)

/* ---------- B-04 ---------- */
const Table = ({ prices }: { prices: "show" | "stars" | "none" }) => (
    <table className="w-full border-collapse text-sm">
        <thead><tr className="border-b border-border text-left text-xs text-fg-muted"><th className="py-1">Position</th><th className="py-1 text-right">Stück</th>{prices !== "none" && <th className="py-1 text-right">Preis</th>}</tr></thead>
        <tbody>
            {[["Ring 750 Gelbgold", 12], ["Anhänger Silber", 24]].map(([t, q]) => (
                <tr key={String(t)}><td className="py-1">{t}</td><td className="py-1 text-right tabular-nums">{q}</td>{prices !== "none" && <td className="py-1 text-right">***</td>}</tr>
            ))}
            {prices === "stars" && <tr className="border-t border-border"><td className="py-1 font-medium">Total</td><td /><td className="py-1 text-right font-medium">CHF 11’560.00</td></tr>}
        </tbody>
    </table>
)
export const B04Good = () => <Table prices="none" />
export const B04Bad = () => <Table prices="stars" />

/* ---------- B-05 ---------- */
export const B05Good = () => (
    <div className="flex flex-col gap-3">
        <RoleBadge name="S. Keller" role="Werkstatt" />
        <RightsSummary role="Werkstatt" rows={[{ area: "Aufträge", read: true, change: false, delete: false }, { area: "Laufzettel", read: true, change: true, delete: false }]} />
    </div>
)
export const B05Bad = () => <span className="text-sm">S. Keller</span>

/* ---------- B-06 ---------- */
export const B06Good = () => <ImpersonationBanner as="S. Keller" role="Werkstatt" onLeave={() => {}} />
export const B06Bad = () => <p className="m-0 text-sm text-fg-muted">(Keine Anzeige – man arbeitet still im Konto von S. Keller.)</p>

/* ---------- B-07 ---------- */
export const B07Good = () => <ReadOnlyNotice area="Rechnungen" who={["Buchhaltung"]} onRequest={() => {}} />
export const B07Bad = () => (
    <div className="flex flex-col items-center gap-1 rounded-panel border border-border p-4 text-center">
        <span className="text-2xl font-semibold">403</span>
        <span className="text-sm text-fg-muted">Forbidden</span>
    </div>
)

/* ---------- B-08 ---------- */
export const B08Good = () => (
    <pre className="m-0 overflow-x-auto font-mono text-xs">{`// Server (Policy) entscheidet, schickt das Ergebnis mit
{ "can": { "archive": { "allowed": false, "reason": "Zuerst alle Laufzettel abschliessen (3 offen)." } } }`}</pre>
)
export const B08Bad = () => <pre className="m-0 overflow-x-auto font-mono text-xs">{`<button style="display:none">Löschen</button>  <!-- im Browser versteckt, Server prüft nicht -->`}</pre>
