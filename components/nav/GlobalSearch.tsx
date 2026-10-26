"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SearchRecord, SearchResult } from "./search"
import { useShortcut } from "./shortcuts"

const DEBOUNCE_MS = 120

interface GlobalSearchProps {
    search: (query: string) => Promise<SearchResult>
    /** Group headings per record type */
    typeLabels: Record<string, string>
    placeholder?: string
    onNavigate: (href: string) => void
    className?: string
}

/**
 * Global search in the header (N-06, N-07): finds every record by every identifier that is
 * printed somewhere, and goes straight to it. "/" or ⌘/Ctrl+K focus it.
 */
export function GlobalSearch({ search, typeLabels, placeholder = "Nummer, Kunde oder Titel suchen", onNavigate, className }: GlobalSearchProps) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const listId = React.useId()
    const [query, setQuery] = React.useState("")
    const [result, setResult] = React.useState<SearchResult | null>(null)
    const [open, setOpen] = React.useState(false)
    const [highlight, setHighlight] = React.useState(0)
    const requestRef = React.useRef(0)

    const focus = () => { inputRef.current?.focus(); inputRef.current?.select() }
    useShortcut("/", focus)
    useShortcut("k", focus, { mod: true })

    // Every keystroke invalidates older answers: a slow response must never replace a newer one
    React.useEffect(() => {
        const requestId = ++requestRef.current
        if (!query.trim()) { setResult(null); return }
        const timer = setTimeout(() => {
            search(query).then((next) => {
                if (requestRef.current !== requestId) return
                setResult(next)
                setHighlight(0)
            }, () => {})
        }, DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [query, search])

    // The exact hit is listed first within its group; flatten in display order
    const flat = React.useMemo<SearchRecord[]>(() => {
        if (!result) return []
        const groups = result.groups.map((g) => ({
            ...g,
            results: result.exact && g.type === result.exact.type
                ? [result.exact, ...g.results.filter((r) => r.id !== result.exact!.id)]
                : g.results,
        }))
        const exactFirst = result.exact ? [...groups].sort((a, b) => Number(b.type === result.exact!.type) - Number(a.type === result.exact!.type)) : groups
        return exactFirst.flatMap((g) => g.results)
    }, [result])

    const groups = React.useMemo(() => {
        const map = new Map<string, SearchRecord[]>()
        for (const record of flat) map.set(record.type, [...(map.get(record.type) ?? []), record])
        return [...map.entries()]
    }, [flat])

    const showList = open && query.trim() !== "" && result !== null
    const optionId = (record: SearchRecord) => `${listId}-${record.type}-${record.id}`

    const close = () => { setOpen(false); setQuery(""); setResult(null) }
    const go = (record: SearchRecord | undefined) => {
        if (!record) return
        close()
        inputRef.current?.blur()
        onNavigate(record.href)
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setOpen(true)
                setHighlight((h) => Math.min(h + 1, flat.length - 1))
                break
            case "ArrowUp":
                e.preventDefault()
                setHighlight((h) => Math.max(h - 1, 0))
                break
            case "Enter":
                if (showList) { e.preventDefault(); go(flat[highlight]) }
                break
            case "Escape":
                if (open || query) { e.preventDefault(); close() }
                break
        }
    }

    return (
        <div className={cn("relative w-full max-w-md", className)}>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
            <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-label="Suchen"
                aria-autocomplete="list"
                aria-expanded={showList}
                aria-controls={listId}
                aria-activedescendant={showList && flat[highlight] ? optionId(flat[highlight]) : undefined}
                autoComplete="off"
                placeholder={placeholder}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={onKeyDown}
                className={cn(
                    "h-8 w-full rounded-control border border-border bg-surface-sunken pl-8 pr-8 text-sm text-fg transition-colors",
                    "placeholder:text-fg-subtle focus-visible:border-focus focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30"
                )}
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-border px-1 font-mono text-[10px] text-fg-subtle" aria-hidden="true">/</kbd>

            {showList && (
                <div
                    id={listId}
                    role="listbox"
                    aria-label="Suchergebnisse"
                    className="absolute left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-panel border border-border bg-surface-raised py-1 shadow-lg"
                >
                    {flat.length === 0 && <p className="m-0 px-3 py-2 text-sm text-fg-muted">Keine Treffer für „{query.trim()}“</p>}
                    {groups.map(([type, records]) => (
                        <div key={type} role="group" aria-label={typeLabels[type] ?? type} className="py-1">
                            <p className="m-0 px-3 pb-1 pt-1.5 text-xs font-medium text-fg-subtle" aria-hidden="true">{typeLabels[type] ?? type}</p>
                            {records.map((record) => {
                                const index = flat.indexOf(record)
                                return (
                                    <div
                                        key={record.id}
                                        id={optionId(record)}
                                        role="option"
                                        aria-selected={index === highlight}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onMouseEnter={() => setHighlight(index)}
                                        onClick={() => go(record)}
                                        className={cn("cursor-pointer px-3 py-1.5", index === highlight && "bg-surface-hover")}
                                    >
                                        <span className="block truncate text-sm text-fg">{record.title}</span>
                                        {record.context && <span className="block truncate text-xs text-fg-muted">{record.context}</span>}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
