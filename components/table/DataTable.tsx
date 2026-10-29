"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { NavLink } from "@/components/nav/NavLink"
import { isEditableTarget, useShortcut } from "@/components/nav/shortcuts"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/inputs/Checkbox"
import { ActionMenu, type MenuItem } from "./ActionMenu"

export type Column<T> = {
    id: string
    header: string
    cell: (row: T) => React.ReactNode
    align?: "left" | "right"
    /** CSS width, e.g. "8rem" */
    width?: string
    sortable?: boolean
    /** Cut long values with an ellipsis; the full text goes into `title` */
    truncate?: boolean
    title?: (row: T) => string
}

export type Sort = { id: string; dir: "asc" | "desc" } | null

export interface DataTableProps<T> {
    /** Accessible name of the table */
    label: string
    columns: Column<T>[]
    rows: T[]
    getRowId: (row: T) => string
    /** Target of the identifier link in the first column (L-01) */
    getRowHref?: (row: T) => string
    sort: Sort
    /** The order the list has when `sort` is null (L-06); shown in the header like a chosen sort */
    defaultSort?: Sort
    onSortChange: (sort: Sort) => void
    /** loading: first load (skeleton) · reloading: keep rows, dimmed (L-08) */
    status: "loading" | "ready" | "reloading"
    onOpenRow?: (id: string) => void
    /** Column holding the identifier (L-01); linked via getRowHref. Defaults to the first column. */
    identifierColumn?: string
    /** Keep the identifier column, and the columns before it, visible when scrolling sideways (L-04) */
    stickyFirst?: boolean
    /** Keyboard cursor (L-09): J/K move it, Enter opens, X selects. Not the same as the selection. */
    cursorId?: string | null
    onCursorChange?: (id: string | null) => void
    /** Selection (L-10); enables the checkbox column */
    selected?: Set<string>
    onSelectedChange?: (selected: Set<string>) => void
    /** Name of a row for its checkbox, e.g. its identifier */
    rowLabel?: (row: T) => string
    /** The one visible action per row (L-11) */
    rowAction?: (row: T) => { label: string; icon?: React.ReactNode; onSelect: () => void }
    /** Further actions behind "…" */
    rowMenu?: (row: T) => MenuItem[]
    className?: string
}

const SKELETON_ROWS = 8
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="menu"], [role="menuitem"], [data-no-open]'

/**
 * Next state of a sortable header: ascending → descending → back to the list's default (L-06).
 * On the default column the first click turns the default direction around.
 */
export function nextSort(current: Sort, id: string, defaultSort: Sort = null): Sort {
    if (!current && defaultSort?.id === id) return { id, dir: defaultSort.dir === "asc" ? "desc" : "asc" }
    if (current?.id !== id) return { id, dir: "asc" }
    return current.dir === "asc" ? { id, dir: "desc" } : null
}

/** Dense work list (L-01–L-04, L-06, L-08). Controlled: sorting and loading state come from outside. */
export function DataTable<T>({
    label, columns, rows, getRowId, getRowHref, sort, defaultSort = null, onSortChange, status, onOpenRow, identifierColumn, stickyFirst = true,
    cursorId, onCursorChange, selected, onSelectedChange, rowLabel, rowAction, rowMenu, className,
}: DataTableProps<T>) {
    const busy = status !== "ready"
    const selectable = !!selected && !!onSelectedChange
    const hasActions = !!rowAction || !!rowMenu
    const ids = rows.map(getRowId)
    const tableRef = React.useRef<HTMLTableElement>(null)

    // L-09: J/K move the cursor, X toggles selection, Enter opens — never while typing (useShortcut)
    const move = (delta: number) => {
        if (!onCursorChange || ids.length === 0) return
        const index = cursorId ? ids.indexOf(cursorId) : -1
        const next = index < 0 ? 0 : Math.min(Math.max(index + delta, 0), ids.length - 1)
        onCursorChange(ids[next])
    }
    const toggle = (id: string) => {
        if (!selected || !onSelectedChange) return
        const next = new Set(selected)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        onSelectedChange(next)
    }
    const keys = !!onCursorChange && status !== "loading"
    useShortcut("j", () => move(1), { enabled: keys })
    useShortcut("k", () => move(-1), { enabled: keys })
    useShortcut("x", () => { if (cursorId) toggle(cursorId) }, { enabled: keys && selectable })
    useShortcut("Enter", () => { if (cursorId) onOpenRow?.(cursorId) }, {
        enabled: keys && !!cursorId,
        // Enter on a focused link or button keeps its own meaning
        ignore: (e) => isEditableTarget(e.target) || (e.target instanceof Element && !!e.target.closest(INTERACTIVE)),
    })

    // Keep the cursor row in view, vertically only: scrollIntoView would also shift a wide table sideways
    React.useEffect(() => {
        const row = tableRef.current?.querySelector<HTMLElement>('[data-cursor="true"]')
        const box = tableRef.current?.parentElement
        if (!cursorId || !row || !box) return
        const head = tableRef.current?.tHead?.offsetHeight ?? 0
        if (row.offsetTop - head < box.scrollTop) box.scrollTop = row.offsetTop - head
        else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight
    }, [cursorId])

    const pageSelected = ids.filter((id) => selected?.has(id)).length
    const toggleAll = () => {
        if (!selected || !onSelectedChange) return
        const next = new Set(selected)
        if (pageSelected === ids.length) ids.forEach((id) => next.delete(id))
        else ids.forEach((id) => next.add(id))
        onSelectedChange(next)
    }

    const onRowClick = (event: React.MouseEvent, id: string) => {
        if ((event.target as Element).closest(INTERACTIVE)) return
        // Selecting text to copy it is not a request to open the row
        if (window.getSelection?.()?.toString()) return
        onOpenRow?.(id)
    }

    const identIndex = Math.max(0, identifierColumn ? columns.findIndex((c) => c.id === identifierColumn) : 0)
    // Columns up to the identifier stick; each one's left offset is the width of what is before it
    const stickyLeft = (index: number): React.CSSProperties | undefined => {
        if (!stickyFirst || index > identIndex) return undefined
        const parts = [selectable ? "2.5rem" : "0px", ...columns.slice(0, index).map((c) => c.width ?? "0px")]
        return { left: `calc(${parts.join(" + ")})` }
    }
    const cellStyle = (column: Column<T>, index: number): React.CSSProperties | undefined => {
        const left = stickyLeft(index)
        return column.width || left ? { ...(column.width ? { width: column.width } : {}), ...left } : undefined
    }

    const cellClass = (column: Column<T>, index: number, head = false) => cn(
        "border-b border-border px-3 text-left whitespace-nowrap",
        head ? "h-8 text-xs font-medium text-fg-subtle" : "h-[var(--control-h)] text-control text-fg",
        column.align === "right" && "text-right tabular-nums",
        stickyFirst && index <= identIndex && "sticky z-[1] bg-inherit",
    )
    const checkCell = (head = false) => cn("sticky left-0 z-[1] w-10 border-b border-border bg-inherit px-3", head ? "h-8" : "h-[var(--control-h)]")

    return (
        <div className={cn("relative overflow-auto rounded-panel border border-border bg-surface", className)}>
            {status === "reloading" && (
                <div className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden" aria-hidden="true">
                    <div className="h-full w-1/3 animate-pulse bg-accent" />
                </div>
            )}
            <table ref={tableRef} aria-label={label} aria-busy={busy || undefined} className="w-full border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-surface">
                    <tr className="bg-surface">
                        {selectable && (
                            <th scope="col" className={checkCell(true)}>
                                <Checkbox
                                    aria-label="Alle auf dieser Seite auswählen"
                                    className="align-middle"
                                    checked={ids.length > 0 && pageSelected === ids.length ? true : pageSelected > 0 ? "mixed" : false}
                                    onChange={toggleAll}
                                    disabled={ids.length === 0}
                                />
                            </th>
                        )}
                        {columns.map((column, index) => {
                            const shown = sort ?? defaultSort
                            const active = shown?.id === column.id ? shown.dir : null
                            return (
                                <th
                                    key={column.id}
                                    scope="col"
                                    style={cellStyle(column, index)}
                                    aria-sort={column.sortable ? (active === "asc" ? "ascending" : active === "desc" ? "descending" : "none") : undefined}
                                    className={cellClass(column, index, true)}
                                >
                                    {column.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() => onSortChange(nextSort(sort, column.id, defaultSort))}
                                            className={cn(
                                                "inline-flex items-center gap-1 rounded-control hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                                                column.align === "right" && "flex-row-reverse",
                                                active && "text-fg"
                                            )}
                                        >
                                            {column.header}
                                            {active === "asc" ? <ArrowUp className="h-3 w-3" aria-hidden="true" />
                                                : active === "desc" ? <ArrowDown className="h-3 w-3" aria-hidden="true" />
                                                    : <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />}
                                        </button>
                                    ) : column.header}
                                </th>
                            )
                        })}
                        {hasActions && <th scope="col" className="h-8 border-b border-border px-3"><span className="sr-only">Aktionen</span></th>}
                    </tr>
                </thead>
                <tbody className={cn(status === "reloading" && "opacity-60 transition-opacity")}>
                    {status === "loading"
                        ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                            <tr key={i} data-skeleton aria-hidden="true" className="bg-surface">
                                {selectable && <td className={checkCell()} />}
                                {columns.map((column, index) => (
                                    <td key={column.id} className={cellClass(column, index)} style={stickyLeft(index)}>
                                        <span className={cn("block h-3 animate-pulse rounded-control bg-surface-sunken", column.align === "right" ? "ml-auto w-10" : "w-3/4")} />
                                    </td>
                                ))}
                                {hasActions && <td className="border-b border-border" />}
                            </tr>
                        ))
                        : rows.map((row) => {
                            const id = getRowId(row)
                            const isCursor = id === cursorId
                            const isSelected = !!selected?.has(id)
                            const action = rowAction?.(row)
                            return (
                                <tr
                                    key={id}
                                    data-cursor={isCursor || undefined}
                                    aria-selected={selectable ? isSelected : undefined}
                                    onClick={(e) => onRowClick(e, id)}
                                    className={cn(
                                        "transition-colors hover:bg-surface-hover",
                                        isSelected ? "bg-accent-subtle" : "bg-surface",
                                        isCursor && "outline outline-2 -outline-offset-2 outline-focus",
                                        onOpenRow && "cursor-pointer"
                                    )}
                                >
                                    {selectable && (
                                        <td data-no-open className={cn(checkCell(), "p-0")} onClick={(e) => { if (e.target === e.currentTarget) toggle(id) }}>
                                            {/* The whole cell toggles: a near miss must not open the row */}
                                            <label className="flex h-full min-h-[var(--control-h)] cursor-pointer items-center px-3">
                                                <Checkbox
                                                    aria-label={`${rowLabel?.(row) ?? id} auswählen`}
                                                    checked={isSelected}
                                                    onChange={() => toggle(id)}
                                                />
                                            </label>
                                        </td>
                                    )}
                                    {columns.map((column, index) => {
                                        const content = index === identIndex && getRowHref
                                            ? <NavLink href={getRowHref(row)} className="font-mono text-xs text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">{column.cell(row)}</NavLink>
                                            : column.cell(row)
                                        return (
                                            <td key={column.id} className={cellClass(column, index)} style={stickyLeft(index)}>
                                                {column.truncate
                                                    ? <div className="max-w-[16rem] truncate" title={column.title?.(row)}>{content}</div>
                                                    : content}
                                            </td>
                                        )
                                    })}
                                    {hasActions && (
                                        <td data-no-open className="h-[var(--control-h)] cursor-default border-b border-border px-2 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1">
                                                {action && (
                                                    <Button type="button" size="sm" variant="ghost" onClick={action.onSelect}>
                                                        {action.icon}
                                                        {action.label}
                                                    </Button>
                                                )}
                                                {rowMenu && <ActionMenu items={rowMenu(row)} />}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        </div>
    )
}
