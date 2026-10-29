"use client"

import * as React from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { Input } from "@/components/atoms/Input/Input"
import { DateInput } from "@/components/inputs/DateInput"
import { AttachmentGallery } from "@/components/record/AttachmentGallery"
import { CopyButton } from "@/components/record/CopyButton"
import { formatDue } from "@/components/record/due"
import { InlineEdit } from "@/components/record/InlineEdit"
import { KeyFacts } from "@/components/record/KeyFacts"
import { EmptyValue, Property, PropertyList } from "@/components/record/PropertyList"
import { RecordLayout } from "@/components/record/RecordLayout"
import { RecordMeta } from "@/components/record/RecordMeta"
import { RelatedList } from "@/components/record/RelatedList"

/* Live examples for the record-page rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

const TODAY = "2026-10-29"
const NOW = new Date(2026, 9, 29, 10, 30).getTime()
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const Bad = ({ rows }: { rows: [string, string][] }) => (
    <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        {rows.map(([k, v]) => <React.Fragment key={k}><dt className="font-medium">{k}:</dt><dd className="m-0">{v}</dd></React.Fragment>)}
    </dl>
)

/* ---------- D-01 ---------- */
export const D01Good = () => (
    <RecordLayout
        className="lg:grid-cols-[minmax(0,1fr)_10rem]"
        main={<div className="flex flex-col gap-2 text-sm"><span className="font-semibold">Positionen 4</span><span className="text-fg-muted">Ring 750 Gelbgold · 12 Stk.</span><span className="font-semibold">Verlauf</span><span className="text-fg-muted">S. Keller hat den Status geändert</span></div>}
        aside={<PropertyList label="Eigenschaften D-01"><Property label="Kunde">Dähler + Blaser</Property><Property label="Termin">Fr, 13.11.</Property></PropertyList>}
    />
)
export const D01Bad = () => <Bad rows={[["ID", "8812"], ["Kunde", "Dähler + Blaser"], ["Termin", "2026-11-13"], ["Positionen", "→ Tab „Positionen“"], ["Verlauf", "→ Tab „Historie“"], ["Notiz", "Steine nicht mitgiessen"]]} />

/* ---------- D-02 ---------- */
export const D02Good = () => (
    <KeyFacts facts={[
        { label: "Liefertermin", value: "Fr, 13.11.2026", detail: "in 15 Tagen" },
        { label: "Fortschritt", value: "1 von 4", detail: "Positionen fertig" },
        { label: "Rechnung", value: "offen", detail: "seit 12 Tagen", tone: "warning" },
    ]} />
)
export const D02Bad = () => (
    <div className="flex flex-wrap gap-2">
        {["8812", "4", "48", "2", "12", "0", "18640"].map((n, i) => <span key={i} className="rounded-panel bg-accent-subtle px-3 py-2 text-lg font-bold text-accent">{n}</span>)}
    </div>
)

/* ---------- D-03 ---------- */
export const D03Good = () => (
    <PropertyList label="Eigenschaften D-03">
        <Property label="Kunde"><a href="#kunde" className="text-accent hover:underline">Dähler + Blaser</a></Property>
        <Property label="Liefertermin">Fr, 13.11.2026</Property>
        <Property label="Dringlichkeit">Normal</Property>
        <Property label="Bestellnummer"><span className="font-mono">PO-4471</span></Property>
    </PropertyList>
)
export const D03Bad = () => <Bad rows={[["bestellnr_kunde", "PO-4471"], ["prio", "2"], ["customer_id", "10073"], ["due_at", "2026-11-13 00:00:00"]]} />

/* ---------- D-04 ---------- */
export const D04Good = () => (
    <PropertyList label="Eigenschaften D-04">
        <Property label="Liefertermin"><EmptyValue text="Kein Liefertermin" onAdd={() => {}} /></Property>
        <Property label="Bestellnummer"><EmptyValue text="Keine Bestellnummer" /></Property>
    </PropertyList>
)
export const D04Bad = () => <Bad rows={[["Liefertermin", "null"], ["Bestellnummer", "-"], ["Rabatt", "N/A"], ["Gravur", ""]]} />

/* ---------- D-05 ---------- */
export const D05Good = () => (
    <div className="flex flex-col gap-1 text-sm">
        <span className="flex items-center gap-1">Auftrag <span className="font-mono">26100013</span><CopyButton value="26100013" label="Auftragsnummer" /></span>
        <span className="flex items-center gap-1">Laufzettel <span className="font-mono">26100013-3</span><CopyButton value="26100013-3" label="Laufzettelnummer" /></span>
    </div>
)
export const D05Bad = () => <p className="m-0 select-none text-sm">Auftrag <span className="font-mono">26100013</span> (bitte abtippen)</p>

/* ---------- D-06 ---------- */
export function D06Good() {
    const rows = ["2026-11-13", "2026-10-30", "2026-10-27"].map((iso) => ({ iso, ...formatDue(iso, TODAY) }))
    return (
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
            {rows.map((r) => <li key={r.iso}><span className={r.overdue ? "font-medium text-warning" : ""}>{r.relative}</span> <span className="text-fg-muted">· {r.absolute}</span></li>)}
        </ul>
    )
}
export const D06Bad = () => <ul className="m-0 flex list-none flex-col gap-1 p-0 font-mono text-xs"><li>2026-11-13T00:00:00Z</li><li>2026-10-30T00:00:00Z</li><li>2026-10-27T00:00:00Z</li></ul>

/* ---------- D-07 ---------- */
export function D07Good() {
    const [due, setDue] = React.useState<string | null>("2026-11-13")
    return (
        <PropertyList label="Eigenschaften D-07">
            <Property label="Liefertermin">
                <InlineEdit<string | null>
                    label="Liefertermin"
                    value={due}
                    display={(v) => (v ? formatDue(v, TODAY).absolute : "")}
                    editor={(p) => <DateInput ref={p.inputRef as React.Ref<HTMLInputElement>} id={p.id} aria-label="Liefertermin" today={TODAY} value={p.value} onChange={p.commit} />}
                    onSave={async (v) => { await wait(700); setDue(v) }}
                />
            </Property>
        </PropertyList>
    )
}
export const D07Bad = () => (
    <div className="flex items-center justify-between gap-2 text-sm">
        <span>Liefertermin: 13.11.2026</span>
        <Button size="sm" variant="outline"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Auftrag bearbeiten (alle 24 Felder)</Button>
    </div>
)

/* ---------- D-08 ---------- */
export const D08Good = () => (
    <PropertyList label="Eigenschaften D-08">
        <Property label="Lieferadresse">
            <span className="flex items-start justify-between gap-2"><span>Zentralstrasse 12<br />2502 Biel</span><Button size="sm" variant="ghost">Bearbeiten</Button></span>
        </Property>
    </PropertyList>
)
export const D08Bad = () => (
    <div className="flex flex-col gap-1 text-sm">
        {["Strasse", "PLZ", "Ort"].map((f) => <div key={f} className="flex items-center gap-2"><span className="w-14 text-xs text-fg-muted">{f}</span><Input aria-label={f} className="h-7" defaultValue={f === "PLZ" ? "2502" : f === "Ort" ? "Nidau" : "Zentralstrasse 12"} /><span className="text-xs text-success">✓ gespeichert</span></div>)}
        <span className="text-xs text-danger">PLZ 2502 passt nicht zu Nidau – aber schon gespeichert.</span>
    </div>
)

/* ---------- D-09 ---------- */
const pic = (t: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#d4d4d8"/><text x="100" y="110" font-family="sans-serif" font-size="18" fill="#3f3f46" text-anchor="middle">${t}</text></svg>`)}`
export const D09Good = () => (
    <div className="flex flex-col gap-4">
        <RelatedList title="Laufzettel" count={12} moreHref="#laufzettel?auftrag=26100013" emptyText="Noch keine Laufzettel">
            {[1, 2, 3].map((n) => <li key={n} className="px-3 py-1.5 font-mono text-xs">26100013-{n}</li>)}
        </RelatedList>
        <RelatedList title="Rechnungen" count={0} emptyText="Noch keine Rechnung" emptyAction={{ label: "Rechnung erstellen", onClick: () => {} }} />
        <AttachmentGallery title="Fotos" items={[{ id: "a", name: "vorne.jpg", src: pic("vorne") }, { id: "b", name: "seitlich.jpg", src: pic("seitlich") }, { id: "c", name: "Baum.jpg", src: pic("Baum") }]} />
    </div>
)
export const D09Bad = () => <p className="m-0 text-sm text-fg-muted">Laufzettel zu diesem Auftrag: Menü › Produktion › Laufzettel, dann nach Auftrag 26100013 filtern.</p>

/* ---------- D-10 ---------- */
export const D10Good = () => <RecordMeta now={NOW} created={{ by: "P. Mohr", at: NOW - 3 * 86_400_000 }} updated={{ by: "S. Keller", at: NOW - 95 * 60_000 }} id="8812" historyHref="#verlauf" />
export const D10Bad = () => <h1 className="m-0 text-xl font-semibold">Auftrag #8812 <span className="text-sm font-normal text-fg-muted">(created_at 2026-10-26 10:10:00, updated_by 7)</span></h1>
