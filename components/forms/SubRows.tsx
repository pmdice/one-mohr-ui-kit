"use client"

import * as React from "react"
import { useFieldArray, useFormContext, type FieldValues } from "react-hook-form"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"

interface SubRowsProps<T> {
    /** Form path of the child array, e.g. "positions.0.extras" */
    name: string
    newItem: () => T
    addLabel: string
    rowLabel: string
    children: (args: { index: number; field: T; remove: () => void }) => React.ReactNode
}

const FOCUSABLE = 'input:not([type="hidden"]), textarea, select, button[role="combobox"]'

/**
 * F-07: child rows that visibly belong to their block — indented, joined by a guide line,
 * with the add button at the end of *their own* list. Their fields count toward the block.
 */
export function SubRows<T>({ name, newItem, addLabel, rowLabel, children }: SubRowsProps<T>) {
    const { control } = useFormContext()
    const { fields, append, remove } = useFieldArray({ control, name })
    const listRef = React.useRef<HTMLUListElement>(null)
    const addRef = React.useRef<HTMLButtonElement>(null)
    const [focusRow, setFocusRow] = React.useState<number | "add" | null>(null)

    React.useEffect(() => {
        if (focusRow === null) return
        if (focusRow === "add") addRef.current?.focus()
        else listRef.current?.children[focusRow]?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
        setFocusRow(null)
    }, [focusRow])

    const removeAt = (index: number) => {
        remove(index)
        setFocusRow(index < fields.length - 1 ? index : "add")
    }

    return (
        <div className="ml-2 border-l-2 border-border-strong pl-4">
            {fields.length > 0 && (
                <ul ref={listRef} aria-label={rowLabel} className="flex flex-col gap-2">
                    {fields.map((field, index) => (
                        <li key={field.id} className="relative flex items-start gap-2">
                            {/* Branch from the guide line to the row */}
                            <span aria-hidden="true" className="absolute -left-4 top-[calc(var(--control-h)/2+1.25rem)] h-px w-3 bg-border-strong" />
                            <div className="min-w-0 flex-1">
                                {children({ index, field: field as unknown as T, remove: () => removeAt(index) })}
                            </div>
                            <button
                                type="button"
                                aria-label={`${rowLabel} ${index + 1} entfernen`}
                                onClick={() => removeAt(index)}
                                className="mt-6 rounded-control p-1.5 text-fg-subtle hover:bg-danger-subtle hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                            >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <Button
                ref={addRef}
                type="button"
                variant="ghost"
                size="sm"
                className={fields.length > 0 ? "mt-2" : undefined}
                onClick={() => { append(newItem() as FieldValues, { shouldFocus: false }); setFocusRow(fields.length) }}
            >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                {addLabel}
            </Button>
        </div>
    )
}
