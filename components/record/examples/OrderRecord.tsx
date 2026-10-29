"use client"

import * as React from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { Input } from "@/components/atoms/Input/Input"
import { Textarea } from "@/components/atoms/Textarea/Textarea"
import { FormField } from "@/components/forms/FormField"
import { DateInput } from "@/components/inputs/DateInput"
import { RadioGroup } from "@/components/inputs/RadioGroup"
import { RecordPicker } from "@/components/inputs/RecordPicker"
import { Switch } from "@/components/inputs/Switch"
import { Dialog } from "@/components/molecules/Dialog/Dialog"
import { PageHeader } from "@/components/nav/PageHeader"
import { ActivityLog } from "@/components/status/ActivityLog"
import type { ActivityEntry } from "@/components/status/activity"
import { StatusBadge } from "@/components/status/StatusBadge"
import type { StatusDef } from "@/components/status/workflow"
import { ActionMenu } from "@/components/table/ActionMenu"
import { AttachmentGallery } from "../AttachmentGallery"
import { CopyButton } from "../CopyButton"
import { formatDue } from "../due"
import { InlineEdit, type EditorProps } from "../InlineEdit"
import { KeyFacts } from "../KeyFacts"
import { Property, PropertyList } from "../PropertyList"
import { RecordLayout } from "../RecordLayout"
import { RecordMeta } from "../RecordMeta"
import { RelatedList } from "../RelatedList"

const TODAY = "2026-10-29"
const NOW = new Date(2026, 9, 29, 10, 30).getTime()
const MIN = 60_000

const ACTIVE: StatusDef = { id: "in-arbeit", label: "In Arbeit", category: "active" }
const DONE: StatusDef = { id: "fertig", label: "Fertig", category: "done" }
const PLANNED: StatusDef = { id: "offen", label: "Offen", category: "planned" }

const CUSTOMERS = [
    { value: "c1", label: "Dähler + Blaser", description: "10073 · Biel" },
    { value: "c2", label: "Dähler Uhren", description: "10112 · Lyss" },
    { value: "c3", label: "Bucherer", description: "10002 · Luzern" },
    { value: "c4", label: "Gübelin", description: "10031 · Luzern" },
]
const URGENCY = [{ value: "normal", label: "Normal" }, { value: "dringend", label: "Dringend" }, { value: "warten", label: "Warten" }]

const POSITIONS = [
    { no: 1, text: "Ring 750 Gelbgold", qty: 12, status: DONE },
    { no: 2, text: "Ring 750 Weissgold", qty: 12, status: ACTIVE },
    { no: 3, text: "Anhänger Silber 925", qty: 20, status: ACTIVE },
    { no: 4, text: "Anhänger INOX", qty: 4, status: PLANNED },
]
const SLIPS = ["Guss", "Polissage", "Guss", "Fassen", "Polissage"].map((station, i) => ({ id: `26100013-${i + 1}`, station }))

/** A grey picture with a caption, so the example needs no image files. */
const picture = (text: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#d4d4d8"/><circle cx="200" cy="130" r="60" fill="none" stroke="#71717a" stroke-width="14"/><text x="200" y="260" font-family="sans-serif" font-size="22" fill="#3f3f46" text-anchor="middle">${text}</text></svg>`)}`
const PHOTOS = [
    { id: "p1", name: "Ring vorne.jpg", src: picture("Ring vorne"), size: 1_240_000 },
    { id: "p2", name: "Ring seitlich.jpg", src: picture("Ring seitlich"), size: 1_180_000 },
    { id: "p3", name: "Gussbaum.jpg", src: picture("Gussbaum"), size: 2_400_000 },
]

type Address = { street: string; zip: string; city: string }

/** The page of one order (D-01–D-10), with simulated saving that can be made to fail. */
export function OrderRecord({ saveDelay = 600 }: { saveDelay?: number }) {
    const [failing, setFailing] = React.useState(false)
    const [customer, setCustomer] = React.useState("c1")
    const [due, setDue] = React.useState<string | null>("2026-11-13")
    const [urgency, setUrgency] = React.useState("normal")
    const [reference, setReference] = React.useState("")
    const [note, setNote] = React.useState("Steine nicht mitgiessen.")
    const [address, setAddress] = React.useState<Address>({ street: "Zentralstrasse 12", zip: "2502", city: "Biel" })
    const [editAddress, setEditAddress] = React.useState(false)
    const [history, setHistory] = React.useState<ActivityEntry[]>([
        { id: "h2", at: NOW - 95 * MIN, actor: "S. Keller", via: "hand", kind: "status", statusFrom: PLANNED, statusTo: ACTIVE },
        { id: "h1", at: NOW - 3 * 24 * 60 * MIN, actor: "P. Mohr", via: "hand", kind: "field", field: "Dringlichkeit", from: "Warten", to: "Normal" },
    ])
    const [updated, setUpdated] = React.useState({ by: "S. Keller", at: NOW - 95 * MIN })

    const label = (list: { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label ?? v

    /** Simulated server: waits, then saves or fails; a saved change becomes a history entry (S-09). */
    const save = <T,>(field: string, from: T, to: T, apply: (v: T) => void, show: (v: T) => React.ReactNode = (v) => String(v)) =>
        new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (failing) { reject(new Error("Keine Verbindung zum Server. Nochmals versuchen oder später speichern.")); return }
                apply(to)
                const at = Date.now() > NOW ? NOW + 1 : NOW
                setHistory((h) => [{ id: `h${h.length + 1}`, at, actor: "P. Mohr", via: "hand", kind: "field", field, from: from === "" || from === null ? undefined : show(from), to: show(to) }, ...h])
                setUpdated({ by: "P. Mohr", at })
                resolve()
            }, saveDelay)
        })

    const dueText = (v: string | null) => (v ? formatDue(v, TODAY).absolute : "")
    const facts = due ? formatDue(due, TODAY) : null

    return (
        <div className="flex min-h-full flex-col gap-4 bg-surface-sunken p-4 text-fg" data-density="compact">
            <div className="flex flex-wrap items-center gap-3 text-sm text-fg-muted">
                <span className="rounded-control border border-dashed border-border-strong px-2 py-0.5 text-xs font-medium uppercase tracking-[0.12em]">Simulation</span>
                <Switch checked={failing} onChange={setFailing} label="Speichern schlägt fehl" />
            </div>

            <div className="flex flex-col gap-6 rounded-panel border border-border bg-surface p-6">
                <PageHeader
                    trail={[{ label: "Aufträge", href: "#auftraege" }, { label: "26100013", href: "#auftrag-26100013" }]}
                    back={{ label: "Offene Aufträge", href: "#auftraege?ansicht=offen" }}
                    title="Ringe Herbst 2026"
                    badges={
                        <>
                            <StatusBadge status={ACTIVE} since={NOW - 95 * MIN} now={NOW} />
                            <span className="flex items-center gap-0.5 font-mono text-sm text-fg-muted">26100013<CopyButton value="26100013" label="Auftragsnummer" /></span>
                        </>
                    }
                    primaryAction={<Button size="sm"><Printer className="h-3.5 w-3.5" aria-hidden="true" />Laufzettel drucken</Button>}
                    moreActions={<ActionMenu items={[{ id: "dup", label: "Duplizieren", onSelect: () => {} }, { id: "arch", label: "Archivieren", onSelect: () => {} }]} />}
                />

                <section aria-label="Auf einen Blick">
                    <KeyFacts facts={[
                        { label: "Liefertermin", value: facts?.absolute ?? "Offen", detail: facts?.relative, tone: facts?.overdue ? "danger" : undefined },
                        { label: "Menge", value: "48 Stk.", detail: "in 4 Positionen" },
                        { label: "Fortschritt", value: "1 von 4", detail: "Positionen fertig" },
                        { label: "Auftragswert", value: "CHF 18’640.00", detail: "ohne MWST" },
                    ]} />
                </section>

                <RecordLayout
                    main={
                        <>
                            <RelatedList title="Positionen" count={POSITIONS.length} emptyText="Noch keine Positionen">
                                {POSITIONS.map((p) => (
                                    <li key={p.no} className="flex items-center gap-3 px-3 py-2">
                                        <span className="w-5 font-mono text-xs text-fg-subtle">{p.no}</span>
                                        <span className="flex-1">{p.text}</span>
                                        <span className="font-mono text-xs tabular-nums text-fg-muted">{p.qty} Stk.</span>
                                        <StatusBadge status={p.status} />
                                    </li>
                                ))}
                            </RelatedList>
                            <RelatedList title="Laufzettel" count={12} moreHref="#laufzettel?auftrag=26100013" emptyText="Noch keine Laufzettel">
                                {SLIPS.map((s) => (
                                    <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2">
                                        <a href={`#laufzettel-${s.id}`} className="font-mono text-xs text-accent hover:underline">{s.id}</a>
                                        <span className="text-xs text-fg-muted">an {s.station}</span>
                                    </li>
                                ))}
                            </RelatedList>
                            <RelatedList title="Rechnungen" count={0} emptyText="Noch keine Rechnung" emptyAction={{ label: "Rechnung erstellen", onClick: () => {} }} />
                            <div className="flex flex-col gap-2">
                                <h2 className="m-0 text-base font-semibold">Fotos <span className="font-mono text-sm font-normal text-fg-subtle">{PHOTOS.length}</span></h2>
                                <AttachmentGallery title="Fotos" items={PHOTOS} />
                            </div>
                            <section aria-label="Verlauf" className="flex flex-col gap-2">
                                <h2 className="m-0 text-base font-semibold">Verlauf</h2>
                                <ActivityLog entries={history} now={NOW} />
                            </section>
                        </>
                    }
                    aside={
                        <div className="flex flex-col gap-4 rounded-panel border border-border p-4">
                            <PropertyList label="Eigenschaften">
                                <Property label="Kunde">
                                    <InlineEdit<string>
                                        label="Kunde"
                                        value={customer}
                                        display={(v) => label(CUSTOMERS, v)}
                                        editor={(p) => <RecordPicker id={p.id} aria-label="Kunde" ref={p.inputRef as React.Ref<HTMLInputElement>} options={CUSTOMERS} value={p.value} onChange={(v) => v && p.commit(v)} href={(v) => `#kunde-${v}`} />}
                                        onSave={(v) => save("Kunde", customer, v, setCustomer, (x) => label(CUSTOMERS, x))}
                                    />
                                </Property>
                                <Property label="Liefertermin">
                                    <InlineEdit<string | null>
                                        label="Liefertermin"
                                        value={due}
                                        isEmpty={(v) => !v}
                                        emptyText="Kein Liefertermin"
                                        display={(v) => <span className="flex flex-col"><span>{dueText(v)}</span><span className="text-xs text-fg-muted">{v && formatDue(v, TODAY).relative}</span></span>}
                                        editor={(p) => <DateEditor {...p} />}
                                        onSave={(v) => save("Liefertermin", due, v, setDue, dueText)}
                                    />
                                </Property>
                                <Property label="Dringlichkeit">
                                    <InlineEdit<string>
                                        label="Dringlichkeit"
                                        value={urgency}
                                        display={(v) => label(URGENCY, v)}
                                        editor={(p) => <RadioGroup label="Dringlichkeit" variant="segments" options={URGENCY} value={p.value} onChange={p.commit} className="[&>span]:sr-only" />}
                                        onSave={(v) => save("Dringlichkeit", urgency, v, setUrgency, (x) => label(URGENCY, x))}
                                    />
                                </Property>
                                <Property label="Bestellnummer">
                                    <InlineEdit<string>
                                        label="Bestellnummer des Kunden"
                                        value={reference}
                                        isEmpty={(v) => !v}
                                        emptyText="Keine Bestellnummer"
                                        display={(v) => <span className="flex items-center gap-1 font-mono">{v}</span>}
                                        editor={(p) => <TextEditor {...p} label="Bestellnummer des Kunden" />}
                                        onSave={(v) => save("Bestellnummer", reference, v, setReference)}
                                    />
                                </Property>
                                <Property label="Notiz">
                                    <InlineEdit<string>
                                        label="Notiz"
                                        value={note}
                                        isEmpty={(v) => !v}
                                        emptyText="Keine Notiz"
                                        display={(v) => <span className="whitespace-pre-line">{v}</span>}
                                        editor={(p) => <NoteEditor {...p} />}
                                        onSave={(v) => save("Notiz", note, v, setNote)}
                                    />
                                </Property>
                                <Property label="Lieferadresse">
                                    <div className="flex items-start justify-between gap-2 pt-0.5">
                                        <span className="flex flex-col">{address.street}<span>{address.zip} {address.city}</span></span>
                                        <Button size="sm" variant="ghost" onClick={() => setEditAddress(true)} aria-label="Lieferadresse bearbeiten">Bearbeiten</Button>
                                    </div>
                                </Property>
                            </PropertyList>
                            <RecordMeta now={NOW} created={{ by: "P. Mohr", at: NOW - 3 * 24 * 60 * MIN - 20 * MIN }} updated={updated} id="8812" historyHref="#verlauf" />
                        </div>
                    }
                />
            </div>

            <AddressDialog open={editAddress} address={address} onClose={() => setEditAddress(false)} onSave={(a) => { setAddress(a); setEditAddress(false) }} />
        </div>
    )
}

function TextEditor({ value, commit, inputRef, id, label }: EditorProps<string> & { label: string }) {
    return (
        <Input
            ref={inputRef as React.Ref<HTMLInputElement>}
            id={id}
            aria-label={label}
            defaultValue={value}
            className="font-mono"
            onKeyDown={(e) => { if (e.key === "Enter") commit(e.currentTarget.value.trim()) }}
            onBlur={(e) => commit(e.currentTarget.value.trim())}
        />
    )
}

function NoteEditor({ value, commit, inputRef, id }: EditorProps<string>) {
    return (
        <div className="flex flex-col gap-1">
            <Textarea
                ref={inputRef as React.Ref<HTMLTextAreaElement>}
                id={id}
                aria-label="Notiz"
                rows={3}
                defaultValue={value}
                maxLength={200}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) commit(e.currentTarget.value.trim()) }}
                onBlur={(e) => commit(e.currentTarget.value.trim())}
            />
            <span className="text-xs text-fg-subtle">Ctrl+Enter speichert, Escape verwirft</span>
        </div>
    )
}

function DateEditor({ value, commit, inputRef, id }: EditorProps<string | null>) {
    const [draft, setDraft] = React.useState(value)
    return (
        <DateInput
            ref={inputRef as React.Ref<HTMLInputElement>}
            id={id}
            aria-label="Liefertermin"
            today={TODAY}
            value={draft}
            onChange={(v) => { setDraft(v); commit(v) }}
        />
    )
}

function AddressDialog({ open, address, onClose, onSave }: { open: boolean; address: Address; onClose: () => void; onSave: (a: Address) => void }) {
    const [draft, setDraft] = React.useState(address)
    const field = (key: keyof Address) => ({ value: draft[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [key]: e.target.value }) })
    return (
        <Dialog
            open={open}
            onClose={onClose}
            title="Lieferadresse bearbeiten"
            description="Strasse, PLZ und Ort gehören zusammen und werden zusammen gespeichert (D-08)."
            footer={<><Button variant="outline" onClick={onClose}>Abbrechen</Button><Button onClick={() => onSave(draft)}>Adresse speichern</Button></>}
        >
            <div className="flex flex-col gap-3">
                <FormField label="Strasse"><Input {...field("street")} /></FormField>
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                    <FormField label="PLZ"><Input inputMode="numeric" className="font-mono" {...field("zip")} /></FormField>
                    <FormField label="Ort"><Input {...field("city")} /></FormField>
                </div>
            </div>
        </Dialog>
    )
}
