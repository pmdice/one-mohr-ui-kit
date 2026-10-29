"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ComboboxOption {
    value: string
    label: string
    description?: string
}

const DEBOUNCE_MS = 250

type ComboboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "defaultValue"> & {
    value?: string | null
    onChange: (value: string | null) => void
    /** Label of the current value — needed with loadOptions, where the option list is not known up front */
    valueLabel?: string
    placeholder?: string
    emptyText?: string
    /** Offered as the last option when nothing matches the typed text exactly (E-09). */
    onCreate?: (query: string) => void
    createLabel?: (query: string) => string
    /** Shown first while nothing is typed, under "Zuletzt benutzt" (E-09). */
    recent?: ComboboxOption[]
} & (
    | { options: ComboboxOption[]; loadOptions?: never }
    | { loadOptions: (query: string, signal: AbortSignal) => Promise<ComboboxOption[]>; options?: never }
)

/**
 * Searchable combobox (ARIA 1.2, list autocomplete). Static `options` are filtered locally;
 * `loadOptions` searches on the server with debounce, and stale responses are dropped.
 */
export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
    {
        value = null, onChange, valueLabel, options, loadOptions,
        placeholder = "Suchen…", emptyText = "Keine Treffer",
        onCreate, createLabel = (q) => `„${q}“ neu anlegen`, recent,
        id, className, onBlur, onKeyDown, disabled, ...props
    },
    ref
) {
    const generatedId = React.useId()
    const listId = `${id ?? generatedId}-listbox`
    const optionId = (index: number) => `${listId}-${index}`

    const labelFor = React.useCallback(
        (v: string | null) => (v === null ? "" : options?.find(o => o.value === v)?.label ?? valueLabel ?? v),
        [options, valueLabel]
    )

    const [query, setQuery] = React.useState(() => labelFor(value))
    const [editing, setEditing] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [highlight, setHighlight] = React.useState(0)
    const [remote, setRemote] = React.useState<ComboboxOption[]>([])
    const [loading, setLoading] = React.useState(false)
    const requestRef = React.useRef<{ id: number; controller: AbortController | null }>({ id: 0, controller: null })

    // Show the selected label whenever the user is not typing
    React.useEffect(() => {
        if (!editing) setQuery(labelFor(value))
    }, [value, editing, labelFor])

    // Server search: debounce, and invalidate older results on every keystroke —
    // results for an earlier term must never be shown or committed.
    React.useEffect(() => {
        if (!loadOptions || !editing) return
        requestRef.current.controller?.abort()
        const requestId = requestRef.current.id + 1
        requestRef.current = { id: requestId, controller: null }
        setRemote([])
        const term = query.trim()
        setLoading(Boolean(term))
        if (!term) return
        const timer = setTimeout(() => {
            const controller = new AbortController()
            requestRef.current = { id: requestId, controller }
            loadOptions(term, controller.signal).then(
                (result) => {
                    if (requestRef.current.id !== requestId) return
                    setRemote(result)
                    setHighlight(0)
                    setLoading(false)
                },
                () => {
                    if (requestRef.current.id === requestId) setLoading(false)
                }
            )
        }, DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [query, editing, loadOptions])

    React.useEffect(() => () => requestRef.current.controller?.abort(), [])

    const term = editing ? query.trim().toLowerCase() : ""
    const showRecent = !term && (recent?.length ?? 0) > 0
    const visible = React.useMemo(() => {
        if (showRecent) {
            const seen = new Set(recent!.map((o) => o.value))
            return [...recent!, ...(loadOptions ? [] : (options ?? []).filter((o) => !seen.has(o.value)))]
        }
        if (loadOptions) return remote
        if (!term) return options ?? []
        return (options ?? []).filter(o =>
            o.label.toLowerCase().includes(term) || o.description?.toLowerCase().includes(term)
        )
    }, [showRecent, recent, loadOptions, remote, options, term])

    // "… neu anlegen" as a last pseudo-option, only when nothing matches exactly
    const typed = query.trim()
    const canCreate = Boolean(onCreate) && editing && typed !== "" && !loading && !visible.some((o) => o.label.toLowerCase() === typed.toLowerCase())
    const count = visible.length + (canCreate ? 1 : 0)
    const create = () => {
        onCreate?.(typed)
        setEditing(false)
        setOpen(false)
        if (loadOptions) setRemote([])
    }

    const commit = (option: ComboboxOption | undefined) => {
        if (!option) return
        onChange(option.value)
        setEditing(false)
        setOpen(false)
        setQuery(option.label)
        if (loadOptions) setRemote([])
    }

    const cancel = () => {
        setEditing(false)
        setOpen(false)
        setQuery(labelFor(value))
        if (loadOptions) setRemote([])
    }

    const showList = open && (editing || !loadOptions || showRecent)

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e)
        if (e.defaultPrevented) return
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                if (!showList) { setOpen(true); setHighlight(0) }
                else setHighlight(h => Math.min(h + 1, count - 1))
                break
            case "ArrowUp":
                e.preventDefault()
                setHighlight(h => Math.max(h - 1, 0))
                break
            case "Enter":
                if (showList) {
                    e.preventDefault()
                    // Never commit while the shown results may belong to an older term
                    if (loading) break
                    if (canCreate && highlight === visible.length) create()
                    else commit(visible[highlight])
                }
                break
            case "Escape":
                if (open || editing) { e.preventDefault(); cancel() }
                break
        }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (editing && query.trim() === "" && value !== null) onChange(null)
        cancel()
        onBlur?.(e)
    }

    return (
        <div className={cn("relative w-full", className)}>
            <input
                ref={ref}
                id={id}
                type="text"
                role="combobox"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={showList}
                aria-controls={listId}
                aria-activedescendant={showList && highlight < count ? optionId(highlight) : undefined}
                disabled={disabled}
                placeholder={placeholder}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setEditing(true); setOpen(true); setHighlight(0) }}
                onClick={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className={cn(
                    "flex h-control w-full rounded-control border border-border-strong bg-surface pl-control pr-8 text-control text-fg transition-colors",
                    "placeholder:text-fg-subtle",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger"
                )}
                {...props}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-fg-muted" aria-hidden="true">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronsUpDown className="h-3.5 w-3.5" />}
            </span>

            {showList && (
                <ul
                    id={listId}
                    role="listbox"
                    aria-busy={loading || undefined}
                    className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-panel border border-border bg-surface-raised py-1 shadow-overlay"
                >
                    {loading && visible.length === 0 && (
                        <li className="px-control py-1.5 text-control text-fg-muted">Suche…</li>
                    )}
                    {!loading && count === 0 && (
                        <li className="px-control py-1.5 text-control text-fg-muted">
                            {loadOptions && !query.trim() ? "Zum Suchen tippen" : emptyText}
                        </li>
                    )}
                    {showRecent && <li role="presentation" className="px-control pb-1 pt-1.5 text-xs font-medium text-fg-subtle">Zuletzt benutzt</li>}
                    {visible.map((option, index) => (
                        <React.Fragment key={option.value}>
                        {showRecent && index === recent!.length && index > 0 && <li role="presentation" className="my-1 border-t border-border" />}
                        <li
                            id={optionId(index)}
                            role="option"
                            aria-selected={option.value === value}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => setHighlight(index)}
                            onClick={() => commit(option)}
                            className={cn(
                                "flex cursor-pointer items-center justify-between gap-3 px-control py-1.5 text-control text-fg",
                                index === highlight && "bg-surface-hover"
                            )}
                        >
                            <span className="min-w-0">
                                <span className="block truncate">{option.label}</span>
                                {option.description && (
                                    <span className="block truncate text-xs text-fg-muted">{option.description}</span>
                                )}
                            </span>
                            {option.value === value && <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />}
                        </li>
                        </React.Fragment>
                    ))}
                    {canCreate && (
                        <li
                            id={optionId(visible.length)}
                            role="option"
                            aria-selected={false}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => setHighlight(visible.length)}
                            onClick={create}
                            className={cn(
                                "flex cursor-pointer items-center gap-2 border-t border-border px-control py-1.5 text-control text-accent",
                                highlight === visible.length && "bg-surface-hover"
                            )}
                        >
                            <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {createLabel(typed)}
                        </li>
                    )}
                </ul>
            )}
        </div>
    )
})
