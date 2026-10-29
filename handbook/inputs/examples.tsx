"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/atoms/Input/Input"
import { Label } from "@/components/atoms/Label/Label"
import { Textarea } from "@/components/atoms/Textarea/Textarea"
import { FormField } from "@/components/forms/FormField"
import { Checkbox } from "@/components/inputs/Checkbox"
import { DateInput } from "@/components/inputs/DateInput"
import { FileDrop, type Upload } from "@/components/inputs/FileDrop"
import { MoneyInput, NumberInput } from "@/components/inputs/NumberInput"
import { formatMoney } from "@/components/inputs/parse"
import { RadioGroup } from "@/components/inputs/RadioGroup"
import { RecordPicker } from "@/components/inputs/RecordPicker"
import { Switch } from "@/components/inputs/Switch"
import { Select } from "@/components/molecules/Select/Select"

/* Live examples for the input rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

const TODAY = "2026-10-29"
const Stack = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col gap-3">{children}</div>

function useNumber(initial: number | null) {
    return React.useState<number | null>(initial)
}

/* ---------- E-01 ---------- */
export function E01Good() {
    const [qty, setQty] = useNumber(12)
    const [due, setDue] = React.useState<string | null>("2026-11-14")
    const [urgency, setUrgency] = React.useState("normal")
    return (
        <Stack>
            <FormField label="Menge"><NumberInput unit="Stk." decimals={0} value={qty} onChange={setQty} /></FormField>
            <FormField label="Liefertermin"><DateInput today={TODAY} value={due} onChange={setDue} /></FormField>
            <RadioGroup label="Dringlichkeit" variant="segments" value={urgency} onChange={setUrgency} options={[{ value: "normal", label: "Normal" }, { value: "dringend", label: "Dringend" }, { value: "warten", label: "Warten" }]} />
        </Stack>
    )
}
export const E01Bad = () => (
    <Stack>
        <div className="flex flex-col gap-1"><Label htmlFor="e01-a">Menge</Label><Input id="e01-a" defaultValue="zwölf Stück" /></div>
        <div className="flex flex-col gap-1"><Label htmlFor="e01-b">Liefertermin</Label><Input id="e01-b" defaultValue="11/14/2026" /></div>
        <div className="flex flex-col gap-1">
            <Label htmlFor="e01-c">Dringlichkeit</Label>
            <button id="e01-c" className="flex h-control items-center justify-between rounded-control border border-border-strong bg-surface px-control text-control">Bitte wählen … <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /></button>
        </div>
    </Stack>
)

/* ---------- E-02 ---------- */
export function E02Good() {
    const [weight, setWeight] = useNumber(412.5)
    const [price, setPrice] = React.useState<number | null>(123450)
    return (
        <Stack>
            <FormField label="Gewicht"><NumberInput unit="g" decimals={1} value={weight} onChange={setWeight} /></FormField>
            <FormField label="Preis"><MoneyInput cents={price} onChange={setPrice} /></FormField>
        </Stack>
    )
}
export const E02Bad = () => (
    <Stack>
        <div className="flex flex-col gap-1"><Label htmlFor="e02-a">Gewicht</Label><Input id="e02-a" defaultValue="412,5" /></div>
        <div className="flex flex-col gap-1"><Label htmlFor="e02-b">Preis (in CHF, mit Rappen)</Label><Input id="e02-b" defaultValue="1234.5" /></div>
    </Stack>
)

/* ---------- E-03 ---------- */
export function E03Good() {
    const [pieces, setPieces] = useNumber(null)
    return (
        <Stack>
            <FormField label="Stück pro Baum" hint="1 bis 60"><NumberInput decimals={0} min={1} max={60} value={pieces} onChange={setPieces} /></FormField>
            <FormField label="Notiz für die Werkstatt" hint="Höchstens 120 Zeichen"><Textarea maxLength={120} defaultValue="Steine nicht mitgiessen. Baum nach dem Guss sofort abschrecken, Kunde holt am Freitag selbst ab." /></FormField>
        </Stack>
    )
}
export const E03Bad = () => (
    <Stack>
        <div className="flex flex-col gap-1"><Label htmlFor="e03-a">Stück pro Baum</Label><Input id="e03-a" defaultValue="80" aria-invalid /><p className="m-0 text-xs text-danger">Ungültiger Wert.</p></div>
        <div className="flex flex-col gap-1"><Label htmlFor="e03-b">Notiz für die Werkstatt</Label><Textarea id="e03-b" defaultValue="Steine nicht mitgiessen." /><span className="self-end text-xs text-fg-subtle">24 / 120</span></div>
    </Stack>
)

/* ---------- E-04 ---------- */
export function E04Good() {
    const [value, setValue] = useNumber(1500)
    return (
        <Stack>
            <FormField label="Menge" hint="z. B. 1'500, 1 500 oder 1500"><NumberInput unit="Stk." decimals={0} value={value} onChange={setValue} /></FormField>
            <p className="m-0 text-xs text-fg-muted">Nach dem Verlassen steht immer 1’500 da. „1,2,3“ wird abgelehnt mit „Mehr als ein Komma oder Punkt“.</p>
        </Stack>
    )
}
export const E04Bad = () => (
    <div className="flex flex-col gap-1">
        <Label htmlFor="e04-a">Menge</Label>
        <Input id="e04-a" defaultValue="1'500" aria-invalid />
        <p className="m-0 text-xs text-danger">Bitte nur Ziffern eingeben (0–9).</p>
    </div>
)

/* ---------- E-05 ---------- */
export function E05Good() {
    const [due, setDue] = React.useState<string | null>("2026-11-13")
    return <FormField label="Liefertermin" hint="z. B. 14.11., morgen, +10"><DateInput today={TODAY} value={due} onChange={setDue} /></FormField>
}
export const E05Bad = () => (
    <div className="flex flex-col gap-1">
        <Label htmlFor="e05-a">Liefertermin</Label>
        <div className="flex gap-1">
            {["Tag", "Monat", "Jahr"].map((p) => <select key={p} id={p === "Tag" ? "e05-a" : undefined} aria-label={p} className="h-control rounded-control border border-border-strong bg-surface px-1 text-control"><option>{p}</option></select>)}
        </div>
    </div>
)

/* ---------- E-06 ---------- */
export function E06Good() {
    const [a, setA] = React.useState<number | null>(10)
    const [b, setB] = React.useState<number | null>(20)
    const sum = (a ?? 0) + (b ?? 0)
    return (
        <Stack>
            <div className="grid grid-cols-2 gap-2">
                <FormField label="Zuschlag"><MoneyInput cents={a} onChange={setA} /></FormField>
                <FormField label="Porto"><MoneyInput cents={b} onChange={setB} /></FormField>
            </div>
            <p className="m-0 text-sm">Summe: <span className="font-mono tabular-nums">CHF {formatMoney(sum)}</span> <span className="text-fg-muted">(gerechnet in Rappen: {sum})</span></p>
        </Stack>
    )
}
export const E06Bad = () => (
    <Stack>
        <p className="m-0 text-sm">Zuschlag 0.1 + Porto 0.2</p>
        <p className="m-0 font-mono text-sm">Summe: CHF {String(0.1 + 0.2)}</p>
    </Stack>
)

/* ---------- E-07 ---------- */
export function E07Good() {
    const [print, setPrint] = React.useState(true)
    const [sound, setSound] = React.useState(true)
    return (
        <Stack>
            <Checkbox checked={print} onChange={setPrint} label="Lieferschein mitdrucken" description="Wird beim Speichern des Auftrags gedruckt." />
            <Switch checked={sound} onChange={setSound} label="Ton bei jedem Scan" description="Gilt sofort für dieses Gerät." />
        </Stack>
    )
}
export const E07Bad = () => (
    <Stack>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" />Lieferschein nicht drucken</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked />Ton deaktivieren (nach Speichern)</label>
    </Stack>
)

/* ---------- E-08 ---------- */
export function E08Good() {
    const [kind, setKind] = React.useState("neu")
    return (
        <RadioGroup label="Art der Position" value={kind} onChange={setKind} options={[
            { value: "neu", label: "Neue Form", description: "Wird nach Zeichnung oder Muster gebaut." },
            { value: "vorlage", label: "Bestehende Vorlage", description: "Eine Form, die schon im Lager ist." },
            { value: "reparatur", label: "Reparatur", description: "Kunde bringt das Stück." },
        ]} />
    )
}
export const E08Bad = () => (
    <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Art der Position</span>
        <Select options={[{ value: "neu", label: "Neue Form" }, { value: "vorlage", label: "Bestehende Vorlage" }, { value: "reparatur", label: "Reparatur" }]} placeholder="Bitte wählen …" />
    </div>
)

/* ---------- E-09 ---------- */
const CUSTOMERS = [
    { value: "c1", label: "Dähler + Blaser", description: "10073 · Biel" },
    { value: "c2", label: "Dähler Uhren", description: "10112 · Lyss" },
    { value: "c3", label: "Bucherer", description: "10002 · Luzern" },
    { value: "c4", label: "Gübelin", description: "10031 · Luzern" },
]
export function E09Good() {
    const [customer, setCustomer] = React.useState<string | null>("c1")
    const [created, setCreated] = React.useState<string | null>(null)
    return (
        <Stack>
            <FormField label="Kunde" hint="Nummer oder Name">
                <RecordPicker options={CUSTOMERS} recent={[CUSTOMERS[2]]} value={customer} onChange={setCustomer} onCreate={setCreated} href={(v) => `#kunde-${v}`} />
            </FormField>
            {created && <p className="m-0 text-xs text-fg-muted">Hier öffnet sich „Kunde anlegen“ mit dem Namen „{created}“.</p>}
        </Stack>
    )
}
export const E09Bad = () => (
    <div className="flex flex-col gap-1">
        <Label htmlFor="e09-a">Kunden-ID</Label>
        <select id="e09-a" className="h-control rounded-control border border-border-strong bg-surface px-2 text-control">
            {["Dähler", "Dähler", "Bucherer", "Gübelin"].map((n, i) => <option key={i}>{n}</option>)}
        </select>
        <span className="text-xs text-fg-muted">Kunde fehlt? Unter Stammdaten › Kunden anlegen und Seite neu laden.</span>
    </div>
)

/* ---------- E-10 ---------- */
const slowUpload: Upload = (_f, onProgress, signal) => new Promise((resolve) => {
    let s = 0
    const t = setInterval(() => { s = Math.min(1, s + 0.1); onProgress(s); if (s === 1) { clearInterval(t); resolve() } }, 300)
    signal.addEventListener("abort", () => clearInterval(t))
})
export const E10Good = () => <FileDrop upload={slowUpload} accept="image/*,.pdf" acceptLabel="Bilder oder PDF" maxBytes={10 * 1024 * 1024} onChange={() => {}} />
export const E10Bad = () => (
    <Stack>
        <input type="file" multiple aria-label="Dateien" className="text-sm" />
        <p className="m-0 text-sm text-danger">Upload fehlgeschlagen (413).</p>
    </Stack>
)
