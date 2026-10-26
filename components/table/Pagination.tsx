"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "./format"

interface PaginationProps {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    sizes?: number[]
    className?: string
}

/** Range, paging and page size (L-12). */
export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, sizes = [25, 50, 100], className }: PaginationProps) {
    const pages = Math.max(1, Math.ceil(total / pageSize))
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1
    const to = Math.min(page * pageSize, total)
    const button = "flex h-7 w-7 items-center justify-center rounded-control border border-border text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"

    return (
        <div className={cn("flex flex-wrap items-center justify-between gap-3 text-xs text-fg-muted", className)}>
            <label className="flex items-center gap-2">
                Pro Seite
                <select
                    aria-label="Pro Seite"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="h-7 rounded-control border border-border bg-surface px-1.5 text-xs text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                    {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </label>
            <div className="flex items-center gap-2">
                <span className="tabular-nums">{total === 0 ? "0 Einträge" : `${formatNumber(from)}–${formatNumber(to)} von ${formatNumber(total)}`}</span>
                <button type="button" aria-label="Vorherige Seite" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={button}>
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Nächste Seite" disabled={page >= pages} onClick={() => onPageChange(page + 1)} className={button}>
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            </div>
        </div>
    )
}

/** Page size per list, remembered on this device. */
export function usePageSize(listKey: string, fallback = 25): [number, (size: number) => void] {
    const key = `table:page-size:${listKey}`
    const [size, setSize] = React.useState(fallback)
    React.useEffect(() => {
        try {
            const stored = Number(localStorage.getItem(key))
            if (stored > 0) setSize(stored)
        } catch { /* storage blocked: keep the fallback */ }
    }, [key])
    const update = React.useCallback((next: number) => {
        setSize(next)
        try { localStorage.setItem(key, String(next)) } catch { /* storage blocked */ }
    }, [key])
    return [size, update]
}
