"use client"

import * as React from "react"
import { Controller, useFormContext, useWatch, type FieldErrors } from "react-hook-form"
import { Input } from "@/components/atoms/Input/Input"
import { Textarea } from "@/components/atoms/Textarea/Textarea"
import { Select } from "@/components/molecules/Select/Select"
import { Combobox } from "@/components/molecules/Combobox/Combobox"
import { DateInput } from "@/components/inputs/DateInput"
import { FileDrop, type Upload } from "@/components/inputs/FileDrop"
import { Form, controlLabel, useEnterpriseForm, useFieldError, type ErrorSummary } from "../Form"
import { FormField } from "../FormField"
import { FormSection } from "../FormSection"
import { ConditionalField } from "../ConditionalField"
import { RepeatableGroup } from "../RepeatableGroup"
import { SubRows } from "../SubRows"
import type { ErrorSummaryItem } from "../FormErrorSummary"
import {
    EXTRA_KINDS, MATERIALS, TYPES, labelOf, orderSchema,
    type OrderInput, type OrderOutput, type PositionInput,
} from "./orderSchema"
import { searchArticles } from "./mockArticles"

/** The example has no server: an upload that takes a moment and reports its progress. */
const simulateUpload: Upload = (_file, onProgress, signal) => new Promise((resolve, reject) => {
    let share = 0
    const timer = setInterval(() => {
        share = Math.min(1, share + 0.25)
        onProgress(share)
        if (share === 1) { clearInterval(timer); resolve() }
    }, 200)
    signal.addEventListener("abort", () => { clearInterval(timer); reject(new DOMException("aborted", "AbortError")) })
})

export const EMPTY_POSITION: Omit<PositionInput, "no"> = {
    typ: "", material: "", qty: "", articleId: "", note: "", extras: [],
}

export const EMPTY_ORDER: OrderInput = {
    customer: "", orderNo: "", dueDate: "", remark: "", positions: [{ no: 1, ...EMPTY_POSITION }],
}

/** FormField bound to the surrounding form: error message and required tracking by path. */
function Field({ name, label, required, hint, className, children }: {
    name: string
    label: string
    required?: boolean
    hint?: string
    className?: string
    children: React.ReactElement<Record<string, unknown>>
}) {
    return (
        <FormField name={name} label={label} required={required} hint={hint} error={useFieldError(name)} className={className}>
            {children}
        </FormField>
    )
}

function SelectField({ name, label, options, required }: {
    name: string
    label: string
    options: { value: string; label: string }[]
    required?: boolean
}) {
    const { control } = useFormContext()
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <Field name={name} label={label} required={required}>
                    <Select ref={field.ref} name={field.name} options={options} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                </Field>
            )}
        />
    )
}

function Extras({ index }: { index: number }) {
    const { register, control } = useFormContext()
    const path = `positions.${index}.extras`
    const extras = (useWatch({ control, name: path }) ?? []) as PositionInput["extras"]
    return (
        <SubRows name={path} addLabel="Zusatzleistung" rowLabel="Zusatzleistung" newItem={() => ({ art: "", fileNo: "", note: "" })}>
            {({ index: row }) => (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <SelectField name={`${path}.${row}.art`} label="Art" options={EXTRA_KINDS} required />
                    <ConditionalField when={extras[row]?.art === "3d"}>
                        <Field name={`${path}.${row}.fileNo`} label="Dateinummer" required>
                            <Input {...register(`${path}.${row}.fileNo`)} />
                        </Field>
                    </ConditionalField>
                    <Field name={`${path}.${row}.note`} label="Bemerkung">
                        <Input {...register(`${path}.${row}.note`)} />
                    </Field>
                </div>
            )}
        </SubRows>
    )
}

function PositionFields({ index }: { index: number }) {
    const { register, control } = useFormContext()
    const path = `positions.${index}`
    const typ = useWatch({ control, name: `${path}.typ` }) as string
    return (
        <div className="flex flex-col gap-stack">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SelectField name={`${path}.typ`} label="Typ" options={TYPES} required />
                <SelectField name={`${path}.material`} label="Material" options={MATERIALS} required />
                <Field name={`${path}.qty`} label="Menge" required hint="Stück">
                    <Input inputMode="numeric" {...register(`${path}.qty`)} />
                </Field>
            </div>
            {/* Conditional field sits right below its trigger (F-10) */}
            <ConditionalField when={typ === "vorlage"}>
                <Controller
                    control={control}
                    name={`${path}.articleId`}
                    render={({ field }) => (
                        <Field name={field.name} label="Bestehender Artikel" required hint="Nummer oder Bezeichnung">
                            <Combobox
                                ref={field.ref}
                                name={field.name}
                                loadOptions={searchArticles}
                                value={field.value || null}
                                valueLabel={field.value || undefined}
                                onChange={(v) => field.onChange(v ?? "")}
                                onBlur={field.onBlur}
                            />
                        </Field>
                    )}
                />
            </ConditionalField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Controller
                    control={control}
                    name={`${path}.photos`}
                    render={({ field }) => (
                        <div role="group" aria-labelledby={`${field.name}-label`} className="flex flex-col gap-1">
                            <span id={`${field.name}-label`} className="text-sm font-medium text-fg">Fotos</span>
                            <FileDrop upload={simulateUpload} accept="image/*" acceptLabel="Bilder" maxBytes={10 * 1024 * 1024} capture="environment" initial={field.value} onChange={field.onChange} />
                        </div>
                    )}
                />
                <Field name={`${path}.note`} label="Notiz">
                    <Textarea rows={1} className="min-h-[var(--control-h)]" {...register(`${path}.note`)} />
                </Field>
            </div>
            <Extras index={index} />
        </div>
    )
}

export function summarizePosition(p: PositionInput): string {
    return [labelOf(TYPES, p.typ), labelOf(MATERIALS, p.material), p.qty && `${p.qty} Stk`].filter(Boolean).join(" · ")
}

interface OrderFormProps {
    defaultValues?: OrderInput
    onSubmit: (values: OrderOutput) => Promise<void> | void
}

/** Worked example: order entry with positions, conditional fields and sub-rows. */
export function OrderForm({ defaultValues = EMPTY_ORDER, onSubmit }: OrderFormProps) {
    const form = useEnterpriseForm(orderSchema, { defaultValues })

    // F-04: header fields one by one, positions grouped by their stable number
    const summarize = (errors: FieldErrors<OrderInput>, formEl: HTMLFormElement): ErrorSummary => {
        const items: ErrorSummaryItem[] = []
        for (const el of Array.from(formEl.querySelectorAll<HTMLElement>("[name]"))) {
            const name = el.getAttribute("name")!
            if (name.startsWith("positions.") || !el.id || !(errors as Record<string, unknown>)[name]) continue
            items.push({ id: name, label: controlLabel(el) ?? name, href: `#${el.id}` })
        }
        const headerCount = items.length
        const positions = form.getValues("positions")
        const broken = (Array.isArray(errors.positions) ? errors.positions : [])
            .map((error, index) => (error ? positions[index]?.no : undefined))
            .filter((no): no is number => no !== undefined)
        for (const no of broken) items.push({ id: `positions-${no}`, label: `Position #${no}`, href: `#positions-${no}` })

        const positionText = broken.length
            ? `${broken.length === 1 ? "1 Position" : `${broken.length} Positionen`} unvollständig: ${broken.map((n) => `#${n}`).join(", ")}`
            : ""
        const headerText = headerCount ? (headerCount === 1 ? "1 Feld in den Kopfdaten" : `${headerCount} Felder in den Kopfdaten`) : ""
        const title = [headerText, positionText].filter(Boolean).join(", ") + (positionText ? "" : " unvollständig")
        return { title, items }
    }

    return (
        <Form form={form} onSubmit={onSubmit} summarize={summarize}>
            <FormSection title="Kopfdaten" markers="optional">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field name="customer" label="Kunde" required><Input {...form.register("customer")} /></Field>
                    <Field name="orderNo" label="Auftragsnummer" required><Input className="font-mono" {...form.register("orderNo")} /></Field>
                    <Controller
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <Field name="dueDate" label="Liefertermin" required hint="z. B. 14.11., morgen, +10">
                                <DateInput ref={field.ref} name={field.name} value={field.value || null} onChange={(v) => field.onChange(v ?? "")} onInvalid={(reason) => { if (reason) field.onChange(`!${reason}`) }} onBlur={field.onBlur} />
                            </Field>
                        )}
                    />
                </div>
                <Field name="remark" label="Bemerkung"><Textarea {...form.register("remark")} /></Field>
            </FormSection>

            <FormSection title="Positionen" markers="optional">
                <RepeatableGroup<PositionInput>
                    name="positions"
                    itemLabel="Position"
                    addLabel="Position hinzufügen"
                    newItem={() => structuredClone(EMPTY_POSITION)}
                    summarize={summarizePosition}
                >
                    {({ index }) => <PositionFields index={index} />}
                </RepeatableGroup>
            </FormSection>
        </Form>
    )
}
