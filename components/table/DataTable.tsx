"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { NavLink } from "@/components/nav/NavLink"
import { cn } from "@/lib/utils"

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
    onSortChange: (sort: Sort) => void
    /** loading: first load (skeleton) · reloading: keep rows, dimmed (L-08) */
    status: "loading" | "ready" | "reloading"
    onOpenRow?: (id: string) => void
    /** Keep the identifier column visible when scrolling sideways (L-04) */
    stickyFirst?: boolean
    className?: string
}

const SKELETON_ROWS = 8
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="menu"], [role="menuitem"]'

/** Next state of a sortable header: ascending → descending → back to the list's default (L-06). */
export function nextSort(current: Sort, id: string): Sort {
    if (current?.id !== id) return { id, dir: "asc" }
    return current.dir === "asc" ? { id, dir: "desc" } : null
}

/** Dense work list (L-01–L-04, L-06, L-08). Controlled: sorting and loading state come from outside. */
export function DataTable<T>({
    label, columns, rows, getRowId, getRowHref, sort, onSortChange, status, onOpenRow, stickyFirst = true, className,
}: DataTableProps<T>) {
    const busy = status !== "ready"

    const onRowClick = (event: React.MouseEvent, id: string) => {
        if ((event.target as Element).closest(INTERACTIVE)) return
        onOpenRow?.(id)
    }

    const cellClass = (column: Column<T>, index: number, head = false) => cn(
        "border-b border-border px-3 text-left",
        head ? "h-8 text-xs font-medium text-fg-subtle" : "h-[var(--control-h)] text-control text-fg",
        column.align === "right" && "text-right tabular-nums",
        index === 0 && stickyFirst && "sticky left-0 z-[1] bg-inherit",
    )

    return (
        <div className={cn("relative overflow-auto rounded-panel border border-border bg-surface", className)}>
            {status === "reloading" && (
                <div className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden" aria-hidden="true">
                    <div className="h-full w-1/3 animate-pulse bg-accent" />
                </div>
            )}
            <table aria-label={label} aria-busy={busy || undefined} className="w-full border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-surface">
                    <tr className="bg-surface">
                        {columns.map((column, index) => {
                            const active = sort?.id === column.id ? sort.dir : null
                            return (
                                <th
                                    key={column.id}
                                    scope="col"
                                    style={column.width ? { width: column.width } : undefined}
                                    aria-sort={column.sortable ? (active === "asc" ? "ascending" : active === "desc" ? "descending" : "none") : undefined}
                                    className={cellClass(column, index, true)}
                                >
                                    {column.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() => onSortChange(nextSort(sort, column.id))}
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
                    </tr>
                </thead>
                <tbody className={cn(status === "reloading" && "opacity-60 transition-opacity")}>
                    {status === "loading"
                        ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                            <tr key={i} data-skeleton aria-hidden="true" className="bg-surface">
                                {columns.map((column, index) => (
                                    <td key={column.id} className={cellClass(column, index)}>
                                        <span className={cn("block h-3 animate-pulse rounded-control bg-surface-sunken", column.align === "right" ? "ml-auto w-10" : "w-3/4")} />
                                    </td>
                                ))}
                            </tr>
                        ))
                        : rows.map((row) => {
                            const id = getRowId(row)
                            return (
                                <tr
                                    key={id}
                                    onClick={(e) => onRowClick(e, id)}
                                    className={cn("bg-surface transition-colors hover:bg-surface-hover", onOpenRow && "cursor-pointer")}
                                >
                                    {columns.map((column, index) => {
                                        const content = index === 0 && getRowHref
                                            ? <NavLink href={getRowHref(row)} className="font-mono text-xs text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">{column.cell(row)}</NavLink>
                                            : column.cell(row)
                                        return (
                                            <td key={column.id} className={cellClass(column, index)}>
                                                {column.truncate
                                                    ? <div className="max-w-[16rem] truncate" title={column.title?.(row)}>{content}</div>
                                                    : content}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        </div>
    )
}
