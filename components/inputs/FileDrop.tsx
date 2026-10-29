"use client"

import * as React from "react"
import { AlertCircle, Check, FileText, RotateCcw, Upload as UploadIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatBytes } from "./parse"

/** Sends one file; reports progress from 0 to 1 and stops when the signal aborts. */
export type Upload = (file: File, onProgress: (share: number) => void, signal: AbortSignal) => Promise<void>

export interface UploadedFile { id: string; name: string; size: number; type: string }

type Item = {
    id: string
    file: File
    status: "uploading" | "done" | "rejected" | "failed"
    progress: number
    reason?: string
    preview?: string
    controller?: AbortController
}

/** Does the file match an accept string like "image/*,.pdf"? */
export function accepts(file: File, accept: string | undefined): boolean {
    if (!accept) return true
    const name = file.name.toLowerCase()
    return accept.split(",").map((a) => a.trim().toLowerCase()).some((rule) =>
        rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? file.type.startsWith(rule.slice(0, -1)) : file.type === rule
    )
}

let counter = 0
const nextId = () => `file-${++counter}`

/**
 * Drop or choose files (E-10). Each file shows name, size, a preview for images and its progress; a refused file
 * says why at that very file while the others go on. Removing a file that is still uploading stops it.
 */
export function FileDrop({ upload, accept, acceptLabel, maxBytes, multiple = true, capture, onChange, className }: {
    upload: Upload
    /** As on <input type=file>, e.g. "image/*,.pdf". */
    accept?: string
    /** The same in words, for the hint and the refusal: "Bilder oder PDF". */
    acceptLabel: string
    maxBytes: number
    multiple?: boolean
    /** "environment" opens the back camera on a tablet. */
    capture?: "environment" | "user"
    onChange: (files: UploadedFile[]) => void
    className?: string
}) {
    const [items, setItems] = React.useState<Item[]>([])
    const [over, setOver] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const hintId = React.useId()

    const done = React.useMemo(() => items.filter((i) => i.status === "done").map((i) => ({ id: i.id, name: i.file.name, size: i.file.size, type: i.file.type })), [items])
    const doneKey = done.map((d) => d.id).join(",")
    const onChangeRef = React.useRef(onChange)
    React.useEffect(() => { onChangeRef.current = onChange })
    const first = React.useRef(true)
    React.useEffect(() => {
        if (first.current) { first.current = false; return }
        onChangeRef.current(done)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- report when the set of finished files changes
    }, [doneKey])

    // Previews are object URLs; give them back when the drop goes away
    const itemsRef = React.useRef(items)
    React.useEffect(() => { itemsRef.current = items })
    React.useEffect(() => () => itemsRef.current.forEach((i) => { if (i.preview) URL.revokeObjectURL?.(i.preview); i.controller?.abort() }), [])

    const patch = (id: string, change: Partial<Item>) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...change } : i)))

    const start = (id: string, file: File) => {
        const controller = new AbortController()
        patch(id, { status: "uploading", progress: 0, reason: undefined, controller })
        upload(file, (share) => { if (!controller.signal.aborted) patch(id, { progress: share }) }, controller.signal).then(
            () => { if (!controller.signal.aborted) patch(id, { status: "done", progress: 1 }) },
            () => { if (!controller.signal.aborted) patch(id, { status: "failed", reason: "Hochladen fehlgeschlagen" }) }
        )
    }

    const add = (files: File[]) => {
        const added: Item[] = files.map((file) => {
            const id = nextId()
            if (!accepts(file, accept)) return { id, file, status: "rejected", progress: 0, reason: `Dateityp nicht erlaubt. Erlaubt: ${acceptLabel}` }
            if (file.size > maxBytes) return { id, file, status: "rejected", progress: 0, reason: `Zu gross: ${formatBytes(file.size)}, erlaubt ${formatBytes(maxBytes)}` }
            const preview = file.type.startsWith("image/") && typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : undefined
            return { id, file, status: "uploading", progress: 0, preview }
        })
        setItems((list) => [...list, ...added])
        added.filter((i) => i.status === "uploading").forEach((i) => start(i.id, i.file))
    }

    const remove = (item: Item) => {
        item.controller?.abort()
        if (item.preview) URL.revokeObjectURL?.(item.preview)
        setItems((list) => list.filter((i) => i.id !== item.id))
    }

    return (
        <div className={cn("flex w-full flex-col gap-2", className)}>
            <div
                onDragOver={(e) => { e.preventDefault(); setOver(true) }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); setOver(false); add(Array.from(e.dataTransfer.files)) }}
                className={cn(
                    "flex flex-col items-center gap-2 rounded-panel border border-dashed px-4 py-5 text-center transition-colors duration-fast",
                    over ? "border-accent bg-accent-subtle" : "border-border-strong bg-surface-sunken"
                )}
            >
                <UploadIcon className="h-5 w-5 text-fg-muted" aria-hidden="true" />
                <p className="m-0 text-sm text-fg">
                    Dateien hierher ziehen oder{" "}
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        aria-describedby={hintId}
                        className="rounded-control font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                        auswählen
                    </button>
                </p>
                <p id={hintId} className="m-0 text-xs text-fg-muted">{acceptLabel}, je höchstens {formatBytes(maxBytes)}</p>
                <input
                    ref={inputRef}
                    type="file"
                    aria-label="Dateien auswählen"
                    tabIndex={-1}
                    className="sr-only"
                    accept={accept}
                    multiple={multiple}
                    capture={capture}
                    onChange={(e) => { add(Array.from(e.target.files ?? [])); e.target.value = "" }}
                />
            </div>
            {items.length > 0 && (
                <ul className="m-0 flex list-none flex-col divide-y divide-border rounded-panel border border-border bg-surface p-0">
                    {items.map((item) => <FileRow key={item.id} item={item} onRemove={() => remove(item)} onRetry={() => start(item.id, item.file)} />)}
                </ul>
            )}
        </div>
    )
}

function FileRow({ item, onRemove, onRetry }: { item: Item; onRemove: () => void; onRetry: () => void }) {
    const nameId = React.useId()
    const name = item.file.name
    const bad = item.status === "rejected" || item.status === "failed"
    return (
        <li aria-labelledby={nameId} className="flex items-center gap-3 px-3 py-2">
            {item.preview
                // eslint-disable-next-line @next/next/no-img-element -- a local object URL, not an optimisable asset
                ? <img src={item.preview} alt="" className="h-9 w-9 shrink-0 rounded-control object-cover" />
                : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-sunken text-fg-muted"><FileText className="h-4 w-4" aria-hidden="true" /></span>}
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-baseline gap-2">
                    <span id={nameId} className="truncate text-sm text-fg">{name}</span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-fg-subtle">{formatBytes(item.file.size)}</span>
                </span>
                {item.status === "uploading" && (
                    <span
                        role="progressbar"
                        aria-label={`${name} wird hochgeladen`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(item.progress * 100)}
                        className="h-1 w-full overflow-hidden rounded-control bg-surface-sunken"
                    >
                        <span className="block h-full bg-accent transition-[width] duration-base" style={{ width: `${item.progress * 100}%` }} />
                    </span>
                )}
                {item.status === "done" && <span className="flex items-center gap-1 text-xs text-success"><Check className="h-3.5 w-3.5" aria-hidden="true" />Hochgeladen</span>}
                {bad && <span className="flex items-center gap-1 text-xs text-danger"><AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{item.reason}</span>}
            </span>
            {item.status === "failed" && (
                <button type="button" onClick={onRetry} aria-label={`${name} erneut hochladen`} title="Erneut hochladen" className="flex h-7 w-7 items-center justify-center rounded-control text-fg-muted hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            )}
            <button type="button" onClick={onRemove} aria-label={`${name} entfernen`} title="Entfernen" className="flex h-7 w-7 items-center justify-center rounded-control text-fg-muted hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
        </li>
    )
}
