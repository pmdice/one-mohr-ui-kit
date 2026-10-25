"use client"

import * as React from "react"
import { get, useFieldArray, useFormContext, useFormState, useWatch, type FieldValues } from "react-hook-form"
import { Plus, Undo2 } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { GroupBlock, type BlockCommand } from "./GroupBlock"
import { initialMax, nextNumber } from "./numbering"

const UNDO_MS = 8000

type Removed<T> = { item: T; index: number; no: number }

interface RepeatableGroupProps<T extends { no: number }> {
    /** Form path of the array, e.g. "positions"; block header ids are `${name}-${no}` */
    name: string
    newItem: () => Omit<T, "no">
    addLabel: string
    itemLabel?: string
    /** One-line summary for the block header, built from the item's values */
    summarize: (item: T) => string
    children: (args: { index: number; no: number; field: T }) => React.ReactNode
}

const FOCUSABLE = 'input:not([type="hidden"]), textarea, select, button[role="combobox"]'

/**
 * A list of repeatable blocks (F-06–F-09) with stable numbers: removing leaves a gap,
 * new blocks get the highest number ever assigned + 1, undo restores the very same block.
 */
export function RepeatableGroup<T extends { no: number }>({
    name, newItem, addLabel, itemLabel = "Position", summarize, children,
}: RepeatableGroupProps<T>) {
    const { control, getValues } = useFormContext()
    const { fields, append, insert, remove } = useFieldArray({ control, name })
    const items = (useWatch({ control, name }) ?? []) as T[]
    const { errors } = useFormState({ control, name })

    const maxEver = React.useRef(initialMax(fields as unknown as T[]))
    const [added, setAdded] = React.useState<Set<number>>(() => new Set())
    const [removed, setRemoved] = React.useState<Removed<T> | null>(null)
    const [command, setCommand] = React.useState<BlockCommand | null>(null)
    const [focusTarget, setFocusTarget] = React.useState<{ kind: "block" | "header" | "undo"; no?: number } | null>(null)
    const undoRef = React.useRef<HTMLButtonElement>(null)

    const blockId = (no: number) => `${name}-${no}`

    React.useEffect(() => {
        if (!removed) return
        const timer = setTimeout(() => setRemoved(null), UNDO_MS)
        return () => clearTimeout(timer)
    }, [removed])

    React.useEffect(() => {
        if (!focusTarget) return
        if (focusTarget.kind === "undo") undoRef.current?.focus()
        else {
            const header = document.getElementById(blockId(focusTarget.no!))
            if (focusTarget.kind === "header") header?.focus()
            else {
                const content = header && document.getElementById(header.getAttribute("aria-controls")!)
                content?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
            }
        }
        setFocusTarget(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusTarget])

    const add = () => {
        const no = nextNumber(maxEver.current)
        maxEver.current = no
        setRemoved(null)
        setAdded((s) => new Set(s).add(no))
        append({ ...newItem(), no } as FieldValues, { shouldFocus: false })
        setFocusTarget({ kind: "block", no })
    }

    const removeAt = (index: number) => {
        const item = getValues(`${name}.${index}`) as T
        remove(index)
        setRemoved({ item, index, no: item.no })
        setFocusTarget({ kind: "undo" })
    }

    const undo = () => {
        if (!removed) return
        insert(removed.index, removed.item as FieldValues, { shouldFocus: false })
        setFocusTarget({ kind: "header", no: removed.no })
        setRemoved(null)
    }

    const duplicate = (index: number) => {
        const no = nextNumber(maxEver.current)
        maxEver.current = no
        const copy = structuredClone(getValues(`${name}.${index}`)) as T
        setRemoved(null)
        setAdded((s) => new Set(s).add(no))
        insert(index + 1, { ...copy, no } as FieldValues, { shouldFocus: false })
        setFocusTarget({ kind: "header", no })
    }

    const undoBar = removed && (
        <div
            key="undo"
            className="flex items-center justify-between rounded-panel border border-dashed border-border-strong px-3 py-2 text-sm text-fg-muted"
        >
            <span>{itemLabel} #{removed.no} entfernt</span>
            <Button ref={undoRef} type="button" variant="ghost" size="sm" onClick={undo}>
                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                Rückgängig
            </Button>
        </div>
    )

    const blocks: React.ReactNode[] = fields.map((field, index) => {
        const item = (items[index] ?? field) as T
        const no = (field as unknown as T).no
        return (
            <GroupBlock
                key={field.id}
                id={blockId(no)}
                no={no}
                label={itemLabel}
                summary={summarize(item)}
                hasError={Boolean(get(errors, `${name}.${index}`))}
                initiallyExpanded={added.has(no)}
                command={command}
                onRemove={() => removeAt(index)}
                onDuplicate={() => duplicate(index)}
            >
                {children({ index, no, field: item })}
            </GroupBlock>
        )
    })
    if (undoBar) blocks.splice(Math.min(removed!.index, blocks.length), 0, undoBar)

    const seq = (command?.seq ?? 0) + 1
    return (
        <div className="flex flex-col gap-2">
            {fields.length > 1 && (
                <div className="flex justify-end gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCommand({ type: "collapse", seq })}>
                        Alle einklappen
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCommand({ type: "expand", seq })}>
                        Alle aufklappen
                    </Button>
                </div>
            )}
            {blocks}
            <div>
                <Button type="button" variant="outline" onClick={add}>
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    {addLabel}
                </Button>
            </div>
        </div>
    )
}
