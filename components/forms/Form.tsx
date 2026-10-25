"use client"

import * as React from "react"
import {
    FormProvider, get, useForm, useFormState,
    type DefaultValues, type FieldErrors, type FieldValues, type Resolver, type UseFormReturn,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/atoms/Button/Button"
import { FormErrorSummary, type ErrorSummaryItem } from "./FormErrorSummary"
import { useUnsavedChanges } from "./useUnsavedChanges"

/** Dispatched on the <form> after a failed save so collapsed parts can open up (F-04). */
export const REVEAL_EVENT = "forms:reveal"

/**
 * react-hook-form preconfigured for the handbook rules:
 * errors appear on blur, then update live while typing (F-02).
 */
export function useEnterpriseForm<S extends z.ZodType<FieldValues, FieldValues>>(
    schema: S,
    options: { defaultValues: DefaultValues<z.input<S>> }
): UseFormReturn<z.input<S>, unknown, z.output<S>> {
    return useForm<z.input<S>, unknown, z.output<S>>({
        resolver: zodResolver(schema as never) as unknown as Resolver<z.input<S>, unknown, z.output<S>>,
        defaultValues: options.defaultValues,
        mode: "onTouched",
        reValidateMode: "onChange",
        shouldUnregister: false,
        shouldFocusError: false,
    })
}

/** Error message for a field path, for use inside <Form>. */
export function useFieldError(name: string): string | undefined {
    const { errors } = useFormState({ name })
    return (get(errors, name) as { message?: string } | undefined)?.message
}

export type ErrorSummary = { title: string; items: ErrorSummaryItem[] }

/** Leaf paths of an error tree, e.g. ["name", "positions.1.qty"]. */
export function errorPaths(errors: FieldErrors, prefix = ""): string[] {
    return Object.entries(errors).flatMap(([key, value]) => {
        if (!value || typeof value !== "object") return []
        const path = prefix ? `${prefix}.${key}` : key
        if ("message" in value && "type" in value && typeof (value as { type: unknown }).type === "string") return [path]
        return errorPaths(value as FieldErrors, path)
    })
}

/** Visible label text of a control, without markers. */
export function controlLabel(element: Element): string | undefined {
    const label = (element as HTMLInputElement).labels?.[0]
    return label?.firstChild?.textContent?.trim() || undefined
}

function defaultSummarize(errors: FieldErrors, form: HTMLFormElement): ErrorSummary {
    const paths = new Set(errorPaths(errors))
    const items: ErrorSummaryItem[] = []
    for (const element of Array.from(form.querySelectorAll<HTMLElement>("[name]"))) {
        const name = element.getAttribute("name")!
        if (!paths.has(name) || !element.id) continue
        paths.delete(name)
        items.push({ id: name, label: controlLabel(element) ?? name, href: `#${element.id}` })
    }
    const n = items.length
    return { title: n === 1 ? "1 Feld braucht Aufmerksamkeit" : `${n} Felder brauchen Aufmerksamkeit`, items }
}

interface FormProps<TIn extends FieldValues, TOut> {
    form: UseFormReturn<TIn, unknown, TOut>
    onSubmit: (values: TOut) => Promise<void> | void
    /** Build the summary shown after a failed save; defaults to one link per invalid field */
    summarize?: (errors: FieldErrors<TIn>, form: HTMLFormElement) => ErrorSummary
    submitLabel?: string
    className?: string
    children: React.ReactNode
}

export function Form<TIn extends FieldValues, TOut>({
    form, onSubmit, summarize, submitLabel = "Speichern", className, children,
}: FormProps<TIn, TOut>) {
    const formRef = React.useRef<HTMLFormElement>(null)
    const submittingRef = React.useRef(false)
    const [busy, setBusy] = React.useState(false)
    const [showSummary, setShowSummary] = React.useState(false)
    const [focusPending, setFocusPending] = React.useState(0)
    const { errors, isDirty } = useFormState({ control: form.control })

    useUnsavedChanges(isDirty && !busy)

    // After a failed save: let collapsed parts open, then focus the first invalid control in DOM order
    React.useEffect(() => {
        if (!focusPending || !formRef.current) return
        const element = formRef.current
        element.dispatchEvent(new CustomEvent(REVEAL_EVENT))
        const frame = requestAnimationFrame(() => {
            element.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
        })
        return () => cancelAnimationFrame(frame)
    }, [focusPending])

    const submit = () => {
        if (submittingRef.current) return
        submittingRef.current = true
        setBusy(true)
        void form.handleSubmit(
            async (values) => {
                setShowSummary(false)
                try {
                    await onSubmit(values)
                    form.reset(form.getValues())
                } finally {
                    submittingRef.current = false
                    setBusy(false)
                }
            },
            () => {
                submittingRef.current = false
                setBusy(false)
                setShowSummary(true)
                setFocusPending((n) => n + 1)
            }
        )()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
        if (event.key !== "Enter" || event.nativeEvent.isComposing) return
        if (event.metaKey || event.ctrlKey) {
            event.preventDefault()
            submit()
            return
        }
        // A single-line field never submits a large form by accident (F-11)
        const target = event.target as HTMLElement
        if (target instanceof HTMLInputElement && !["submit", "button", "checkbox", "radio"].includes(target.type)) {
            event.preventDefault()
        }
    }

    const summary = showSummary && formRef.current && Object.keys(errors).length > 0
        ? (summarize ?? defaultSummarize)(errors as FieldErrors<TIn>, formRef.current)
        : null

    return (
        <FormProvider {...form}>
            <form
                ref={formRef}
                noValidate
                className={className ?? "flex flex-col gap-6"}
                onKeyDown={handleKeyDown}
                onSubmit={(event) => { event.preventDefault(); submit() }}
            >
                {summary && summary.items.length > 0 && <FormErrorSummary title={summary.title} items={summary.items} />}
                {children}
                <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                    <span className="text-xs text-fg-subtle">⌘/Ctrl + Enter</span>
                    <Button type="submit" busy={busy}>{busy ? "Speichert…" : submitLabel}</Button>
                </div>
            </form>
        </FormProvider>
    )
}
