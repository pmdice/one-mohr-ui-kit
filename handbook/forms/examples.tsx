"use client"

import * as React from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/atoms/Input/Input"
import { Button } from "@/components/atoms/Button/Button"
import { Select } from "@/components/molecules/Select/Select"
import { Form, useEnterpriseForm, useFieldError } from "@/components/forms/Form"
import { FormField } from "@/components/forms/FormField"
import { FormSection } from "@/components/forms/FormSection"
import { FormErrorSummary } from "@/components/forms/FormErrorSummary"
import { ConditionalField } from "@/components/forms/ConditionalField"
import { RepeatableGroup } from "@/components/forms/RepeatableGroup"
import { SubRows } from "@/components/forms/SubRows"
import { Label } from "@/components/atoms/Label/Label"

/* Live examples for the form rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

const MATERIALS = [
    { value: "alsi10mg", label: "AlSi10Mg" },
    { value: "cusn12", label: "CuSn12" },
    { value: "gjl250", label: "EN-GJL-250" },
]

function Bound({ name, label, required, children }: { name: string; label: string; required?: boolean; children: React.ReactElement<Record<string, unknown>> }) {
    return <FormField name={name} label={label} required={required} error={useFieldError(name)}>{children}</FormField>
}

/* ---------- F-01 ---------- */

export function F01Good() {
    return (
        <FormSection title="Position" markers="optional">
            <FormField label="Typ" required><Input /></FormField>
            <FormField label="Material" required><Input /></FormField>
            <FormField label="Menge" required><Input /></FormField>
            <FormField label="Notiz"><Input /></FormField>
        </FormSection>
    )
}

export function F01Bad() {
    return (
        <div className="flex flex-col gap-stack">
            <p className="text-sm font-semibold">Position</p>
            {["Typ", "Material", "Menge"].map((l) => (
                <div key={l} className="flex flex-col gap-1">
                    <Label marker="required">{l}</Label><Input />
                </div>
            ))}
            <div className="flex flex-col gap-1"><Label>Notiz</Label><Input /></div>
        </div>
    )
}

/* ---------- F-02 / F-03 ---------- */

const nameSchema = z.object({ kunde: z.string().trim().min(1, "Kunde fehlt – bitte Firmennamen eingeben") })

export function F02Good() {
    const form = useEnterpriseForm(nameSchema, { defaultValues: { kunde: "" } })
    return (
        <Form form={form} onSubmit={() => {}}>
            <Bound name="kunde" label="Kunde" required><Input placeholder="Feld anklicken, leer verlassen" {...form.register("kunde")} /></Bound>
        </Form>
    )
}

export function F02Bad() {
    return (
        <FormField label="Kunde" required error="Pflichtfeld!">
            <Input placeholder="Noch nichts getippt…" />
        </FormField>
    )
}

export function F03Good() {
    return <FormField label="Menge" required error="Menge muss mindestens 1 sein"><Input defaultValue="0" /></FormField>
}

export function F03Bad() {
    return (
        <div className="flex flex-col gap-3">
            <p className="rounded-control bg-danger-subtle px-3 py-2 text-sm text-danger">Ungültige Eingabe.</p>
            <FormField label="Menge" required><Input defaultValue="0" /></FormField>
        </div>
    )
}

/* ---------- F-04 / F-12 ---------- */

export function F04Good() {
    return (
        <FormErrorSummary
            title="2 Positionen unvollständig: #2, #4"
            items={[{ id: "2", label: "Position #2", href: "#" }, { id: "4", label: "Position #4", href: "#" }]}
        />
    )
}

export function F04Bad() {
    return <p className="rounded-control bg-fg px-3 py-2 text-sm text-surface">Speichern fehlgeschlagen.</p>
}

export function F12Good() {
    return (
        <div className="flex items-center justify-end gap-3">
            <span className="text-xs text-fg-subtle">3 Pflichtfelder offen</span>
            <Button>Speichern</Button>
        </div>
    )
}

export function F12Bad() {
    return <div className="flex justify-end"><Button disabled>Speichern</Button></div>
}

/* ---------- F-05 ---------- */

export function F05Good() {
    return (
        <div className="flex flex-col gap-6">
            <FormSection title="Kopfdaten" markers="optional">
                <div className="grid grid-cols-2 gap-3">
                    <FormField label="Kunde" required><Input /></FormField>
                    <FormField label="Auftragsnummer" required><Input /></FormField>
                </div>
            </FormSection>
            <FormSection title="Lieferung" markers="optional">
                <div className="grid grid-cols-2 gap-3">
                    <FormField label="Liefertermin" required><Input type="date" /></FormField>
                    <FormField label="Lieferart" required><Input /></FormField>
                </div>
            </FormSection>
        </div>
    )
}

export function F05Bad() {
    return (
        <div className="flex flex-col gap-2">
            {["Kunde", "Lieferart", "Auftragsnummer", "Liefertermin"].map((l) => (
                <div key={l} className="flex flex-col gap-1"><Label>{l}</Label><Input /></div>
            ))}
        </div>
    )
}

/* ---------- F-06 – F-09: positions ---------- */

const demoSchema = z.object({
    positions: z.array(z.object({
        no: z.number(),
        material: z.string().min(1, "Material wählen"),
        qty: z.string().min(1, "Menge fehlt"),
        extras: z.array(z.object({ art: z.string().min(1, "Art fehlt") })),
    })),
})
type DemoPosition = z.input<typeof demoSchema>["positions"][number]

function DemoFields({ index }: { index: number }) {
    const { register, control } = useFormContext()
    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
                <Controller control={control} name={`positions.${index}.material`} render={({ field }) => (
                    <Bound name={field.name} label="Material" required>
                        <Select ref={field.ref} name={field.name} options={MATERIALS} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                    </Bound>
                )} />
                <Bound name={`positions.${index}.qty`} label="Menge" required><Input inputMode="numeric" {...register(`positions.${index}.qty`)} /></Bound>
            </div>
            <SubRows name={`positions.${index}.extras`} addLabel="Zusatzleistung" rowLabel="Zusatzleistung" newItem={() => ({ art: "" })}>
                {({ index: row }) => (
                    <Bound name={`positions.${index}.extras.${row}.art`} label="Art" required>
                        <Input {...register(`positions.${index}.extras.${row}.art`)} />
                    </Bound>
                )}
            </SubRows>
        </div>
    )
}

export function PositionsDemo() {
    const form = useEnterpriseForm(demoSchema, {
        defaultValues: {
            positions: [
                { no: 1, material: "alsi10mg", qty: "40", extras: [] },
                { no: 3, material: "", qty: "", extras: [{ art: "3D-Druck" }, { art: "" }] },
                { no: 4, material: "cusn12", qty: "12", extras: [{ art: "Prüfprotokoll" }] },
            ],
        },
    })
    return (
        <Form form={form} onSubmit={() => {}}>
            <FormSection title="Positionen" markers="optional">
                <RepeatableGroup<DemoPosition>
                    name="positions"
                    addLabel="Position hinzufügen"
                    newItem={() => ({ material: "", qty: "", extras: [] })}
                    summarize={(p) => [MATERIALS.find((m) => m.value === p.material)?.label, p.qty && `${p.qty} Stk`].filter(Boolean).join(" · ")}
                >
                    {({ index }) => <DemoFields index={index} />}
                </RepeatableGroup>
            </FormSection>
        </Form>
    )
}

function LooseRow({ material, qty }: { material?: string; qty?: string }) {
    return (
        <div className="grid grid-cols-2 gap-2">
            <Input defaultValue={material} placeholder="Material" />
            <Input defaultValue={qty} placeholder="Menge" />
        </div>
    )
}

export function F06Bad() {
    return (
        <div className="flex flex-col gap-2">
            <LooseRow material="AlSi10Mg" qty="40" />
            <Input defaultValue="3D-Druck" />
            <LooseRow />
            <Input defaultValue="3D-Druck" />
            <Input />
            <LooseRow material="CuSn12" qty="12" />
            <p className="text-xs text-fg-muted">Nach dem Löschen: aus „Position 3“ wurde „Position 2“ – der Verweis auf dem Papier stimmt nicht mehr.</p>
        </div>
    )
}

export function F07Bad() {
    return (
        <div className="flex flex-col gap-2">
            <LooseRow material="AlSi10Mg" qty="40" />
            <LooseRow material="CuSn12" qty="12" />
            <Input defaultValue="3D-Druck" />
            <Input defaultValue="Prüfprotokoll" />
            <div><Button variant="outline" size="sm">+ Zusatzleistung</Button></div>
        </div>
    )
}

export function F08Bad() {
    return (
        <div className="flex flex-col gap-2">
            <LooseRow material="AlSi10Mg" qty="40" />
            <LooseRow />
            <p className="text-xs text-fg-muted">Was muss hier rein? Erst beim Speichern wird alles rot.</p>
        </div>
    )
}

export function F09Bad() {
    return (
        <div className="flex max-h-56 flex-col gap-2 overflow-hidden">
            {Array.from({ length: 8 }, (_, i) => <LooseRow key={i} material="AlSi10Mg" qty={`${(i + 1) * 5}`} />)}
        </div>
    )
}

/* ---------- F-10 ---------- */

const TYPES = [
    { value: "neu", label: "Neue Form" },
    { value: "vorlage", label: "Bestehende Vorlage" },
]

function ConditionalDemoFields() {
    const { control, register } = useFormContext()
    const typ = useWatch({ control, name: "typ" })
    return (
        <div className="flex flex-col gap-stack">
            <Controller control={control} name="typ" render={({ field }) => (
                <Bound name="typ" label="Typ" required>
                    <Select ref={field.ref} name={field.name} options={TYPES} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                </Bound>
            )} />
            <ConditionalField when={typ === "vorlage"}>
                <Bound name="articleId" label="Bestehender Artikel" required><Input {...register("articleId")} placeholder="A-10001" /></Bound>
            </ConditionalField>
        </div>
    )
}

const conditionalSchema = z.object({ typ: z.string().min(1, "Typ wählen"), articleId: z.string() })

export function F10Good() {
    const form = useEnterpriseForm(conditionalSchema, { defaultValues: { typ: "neu", articleId: "" } })
    return (
        <Form form={form} onSubmit={() => {}}>
            <ConditionalDemoFields />
        </Form>
    )
}

export function F10Bad() {
    return (
        <div className="flex flex-col gap-stack">
            <FormField label="Typ" required><Select options={TYPES} value="neu" /></FormField>
            <p className="text-xs text-fg-muted">… zehn weitere Felder …</p>
            <FormField label="Bestehender Artikel"><Input disabled placeholder="nur bei Vorlage" /></FormField>
        </div>
    )
}

/* ---------- F-11 ---------- */

export function F11Good() {
    const [value, setValue] = React.useState("alsi10mg")
    return (
        <div className="flex flex-col gap-2">
            <FormField label="Material" required><Select options={MATERIALS} value={value} onChange={setValue} /></FormField>
            <p className="text-xs text-fg-muted">↓/↑ blättern, Enter übernimmt, Esc bricht ab. Speichern: ⌘/Ctrl + Enter.</p>
        </div>
    )
}

export function F11Bad() {
    return (
        <ul className="list-disc pl-5 text-sm text-fg-muted">
            <li>Pfeiltaste ändert sofort den Wert – beim Durchblättern wird unbemerkt etwas anderes gespeichert.</li>
            <li>Enter im Feld „Menge“ speichert das ganze Formular mit 40 Feldern.</li>
            <li>Tab springt quer über die Seite statt der sichtbaren Reihenfolge zu folgen.</li>
        </ul>
    )
}
