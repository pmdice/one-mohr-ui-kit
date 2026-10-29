"use client"

import * as React from "react"
import { Button } from "@/components/atoms/Button/Button"
import { Textarea } from "@/components/atoms/Textarea/Textarea"
import { FormField } from "@/components/forms/FormField"
import { Checkbox } from "../Checkbox"
import { DateInput } from "../DateInput"
import { FileDrop, type UploadedFile, type Upload } from "../FileDrop"
import { MoneyInput, NumberInput } from "../NumberInput"
import { RadioGroup } from "../RadioGroup"
import { RecordPicker } from "../RecordPicker"

const CUSTOMERS = [
    { value: "c1", label: "Dähler + Blaser", description: "10073 · Biel" },
    { value: "c2", label: "Dähler Uhren", description: "10112 · Lyss" },
    { value: "c3", label: "Bucherer", description: "10002 · Luzern" },
    { value: "c4", label: "Gübelin", description: "10031 · Luzern" },
    { value: "c5", label: "Beyer Chronometrie", description: "10044 · Zürich" },
]

const KINDS = [
    { value: "neu", label: "Neue Form", description: "Nach Zeichnung oder Muster." },
    { value: "vorlage", label: "Bestehende Vorlage", description: "Die Form liegt im Lager." },
    { value: "reparatur", label: "Reparatur", description: "Der Kunde bringt das Stück." },
]

const URGENCY = [
    { value: "normal", label: "Normal" },
    { value: "dringend", label: "Dringend" },
    { value: "warten", label: "Warten" },
]

/** The example has no server: an upload that takes a moment. */
const simulateUpload: Upload = (_file, onProgress, signal) => new Promise((resolve) => {
    let share = 0
    const timer = setInterval(() => { share = Math.min(1, share + 0.2); onProgress(share); if (share === 1) { clearInterval(timer); resolve() } }, 250)
    signal.addEventListener("abort", () => clearInterval(timer))
})

type Stored = Record<string, string>

/** One position with every kind of field from E-01–E-10; "Speichern" shows what would be stored. */
export function PositionEntry({ today }: { today?: string }) {
    const [customer, setCustomer] = React.useState<string | null>(null)
    const [created, setCreated] = React.useState<{ value: string; label: string; description: string }[]>([])
    const [kind, setKind] = React.useState("neu")
    const [qty, setQty] = React.useState<number | null>(null)
    const [weight, setWeight] = React.useState<number | null>(null)
    const [price, setPrice] = React.useState<number | null>(null)
    const [due, setDue] = React.useState<string | null>(null)
    const [urgency, setUrgency] = React.useState("normal")
    const [slip, setSlip] = React.useState(true)
    const [note, setNote] = React.useState("")
    const [files, setFiles] = React.useState<UploadedFile[]>([])
    const [uploading, setUploading] = React.useState(false)
    const [stored, setStored] = React.useState<Stored | null>(null)

    const options = [...created, ...CUSTOMERS]
    const create = (name: string) => {
        const record = { value: `neu-${created.length + 1}`, label: name, description: "Neu angelegt" }
        setCreated((list) => [record, ...list])
        setCustomer(record.value)
    }

    const save = (e: React.FormEvent) => {
        e.preventDefault()
        setStored({
            Kunde: customer ?? "—",
            Art: kind,
            "Menge (Stk.)": qty === null ? "—" : String(qty),
            "Gewicht (g)": weight === null ? "—" : String(weight),
            "Preis (Rappen)": price === null ? "—" : String(price),
            Liefertermin: due ?? "—",
            Dringlichkeit: urgency,
            Lieferschein: slip ? "ja" : "nein",
            Fotos: String(files.length),
        })
    }

    return (
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_16rem]" data-density="compact">
            <form onSubmit={save} className="flex max-w-2xl flex-col gap-6 rounded-panel border border-border bg-surface p-5 text-fg">
                <div className="flex flex-col gap-1">
                    <h2 className="m-0 text-base font-semibold">Position erfassen</h2>
                    <p className="m-0 text-sm text-fg-muted">Tippen Sie, wie Sie es gewohnt sind: „1&apos;200“, „412,5“, „morgen“.</p>
                </div>

                <FormField label="Kunde" hint="Nummer oder Name">
                    <RecordPicker options={options} recent={[CUSTOMERS[2], CUSTOMERS[0]]} value={customer} onChange={setCustomer} onCreate={create} href={(v) => `#kunde-${v}`} placeholder="Suchen …" />
                </FormField>

                <RadioGroup label="Art der Position" options={KINDS} value={kind} onChange={setKind} />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FormField label="Menge" hint="1 bis 10’000"><NumberInput unit="Stk." decimals={0} min={1} max={10000} value={qty} onChange={setQty} /></FormField>
                    <FormField label="Gewicht" hint="pro Stück"><NumberInput unit="g" decimals={1} min={0} value={weight} onChange={setWeight} /></FormField>
                    <FormField label="Preis pro Stück"><MoneyInput cents={price} onChange={setPrice} /></FormField>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField label="Liefertermin" hint="z. B. 14.11., morgen, +10"><DateInput today={today} min={today} value={due} onChange={setDue} /></FormField>
                    <RadioGroup label="Dringlichkeit" variant="segments" options={URGENCY} value={urgency} onChange={setUrgency} />
                </div>

                <Checkbox checked={slip} onChange={setSlip} label="Lieferschein mitdrucken" description="Wird beim Speichern des Auftrags gedruckt." />

                <FormField label="Notiz für die Werkstatt" hint="Höchstens 120 Zeichen">
                    <Textarea maxLength={120} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
                </FormField>

                <div role="group" aria-labelledby="position-photos" className="flex flex-col gap-1">
                    <span id="position-photos" className="text-sm font-medium">Fotos</span>
                    <FileDrop upload={simulateUpload} accept="image/*,.pdf" acceptLabel="Bilder oder PDF" maxBytes={10 * 1024 * 1024} capture="environment" onChange={setFiles} onBusyChange={setUploading} />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                    {uploading && <span role="status" className="text-xs text-fg-muted">Fotos werden noch hochgeladen …</span>}
                    <Button type="submit" disabled={uploading}>Position speichern</Button>
                </div>
            </form>

            <section aria-label="Gespeichert" className="h-fit rounded-panel border border-border bg-surface-sunken p-4 text-sm text-fg">
                <h3 className="m-0 mb-2 text-xs font-medium text-fg-muted">So wird gespeichert</h3>
                {stored ? (
                    <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                        {Object.entries(stored).map(([k, v]) => (
                            <React.Fragment key={k}><dt className="text-xs text-fg-muted">{k}</dt><dd className="m-0 font-mono text-xs">{v}</dd></React.Fragment>
                        ))}
                    </dl>
                ) : (
                    <p className="m-0 text-xs text-fg-muted">Nach „Position speichern“ steht hier, was in der Datenbank landet: ganze Zahlen, Rappen, ISO-Datum.</p>
                )}
            </section>
        </div>
    )
}
