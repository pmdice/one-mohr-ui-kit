"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type NoticeTone = "success" | "error" | "info"

export interface NoticeInput {
    /** One sentence in the perfect tense (G-10): "Auftrag archiviert". */
    message: string
    tone?: NoticeTone
    /** At most one, usually "Rückgängig" (R-02). */
    action?: { label: string; run: () => void }
    /** ms; default 5 s, 8 s with an action, errors stay until closed. */
    duration?: number
}

type Notice = NoticeInput & { id: number }

const MAX = 3
const ICON = { success: CheckCircle2, error: AlertCircle, info: Info }
const ICON_TONE = { success: "text-success", error: "text-danger", info: "text-accent" }

const Context = React.createContext<{ notify: (n: NoticeInput) => number; dismiss: (id: number) => void } | null>(null)

export function useNotice() {
    const ctx = React.useContext(Context)
    if (!ctx) throw new Error("useNotice needs a NoticeProvider")
    return ctx
}

let counter = 0
const subscribeNothing = () => () => {}

/** Floating notices for things whose place is gone or that ran in the background (R-02, R-03). */
export function NoticeProvider({ children }: { children: React.ReactNode }) {
    const [notices, setNotices] = React.useState<Notice[]>([])
    const dismiss = React.useCallback((id: number) => setNotices((list) => list.filter((n) => n.id !== id)), [])
    const notify = React.useCallback((input: NoticeInput) => {
        const id = ++counter
        setNotices((list) => {
            const next = [...list, { ...input, id }]
            // Errors stay until closed (R-03): when there are too many, the oldest non-error goes first
            while (next.length > MAX) {
                const drop = next.findIndex((n) => n.tone !== "error")
                if (drop === -1 || drop === next.length - 1) break
                next.splice(drop, 1)
            }
            return next
        })
        return id
    }, [])
    const value = React.useMemo(() => ({ notify, dismiss }), [notify, dismiss])
    // The portal exists only in the browser: rendered after hydration, so server and first client render match
    const mounted = React.useSyncExternalStore(subscribeNothing, () => true, () => false)

    return (
        <Context.Provider value={value}>
            {children}
            {mounted && createPortal(
                <div role="region" aria-label="Meldungen" aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-2">
                    {notices.map((n) => <TimedNotice key={n.id} notice={n} onClose={() => dismiss(n.id)} />)}
                </div>,
                document.body
            )}
        </Context.Provider>
    )
}

/** Runs out after its time, but not while the pointer or the focus is on it; then only the rest (R-03). */
export function useTimeout(duration: number | null, onEnd: () => void, restartKey?: unknown) {
    // Pointer and focus pause separately: leaving with the mouse must not end it under the keyboard
    const [hovered, setHovered] = React.useState(false)
    const [focused, setFocused] = React.useState(false)
    const paused = hovered || focused
    const remaining = React.useRef(duration ?? 0)
    const keyRef = React.useRef(restartKey)
    const endRef = React.useRef(onEnd)
    React.useEffect(() => { endRef.current = onEnd })
    React.useEffect(() => {
        // A new message gets the full time again
        if (keyRef.current !== restartKey) { keyRef.current = restartKey; remaining.current = duration ?? 0 }
        if (duration === null || paused) return
        const started = Date.now()
        const timer = setTimeout(() => endRef.current(), remaining.current)
        return () => { clearTimeout(timer); remaining.current -= Date.now() - started }
    }, [duration, paused, restartKey])
    const pause = {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onFocus: () => setFocused(true),
        onBlur: (e: React.FocusEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false) },
    }
    return { pause, paused }
}

function TimedNotice({ notice, onClose }: { notice: Notice; onClose: () => void }) {
    const tone = notice.tone ?? "success"
    const duration = tone === "error" ? null : notice.duration ?? (notice.action ? 8000 : 5000)
    const { pause } = useTimeout(duration, onClose)
    return (
        <NoticeCard
            {...pause}
            tone={tone}
            message={notice.message}
            action={notice.action && { label: notice.action.label, run: () => { notice.action!.run(); onClose() } }}
            onClose={onClose}
        />
    )
}

/** The look of every notice; also used by UndoNotice. */
export function NoticeCard({ tone, message, action, onClose, className, ...events }: {
    tone: NoticeTone
    message: string
    action?: { label: string; run: () => void }
    onClose?: () => void
    className?: string
} & Pick<React.HTMLAttributes<HTMLDivElement>, "onMouseEnter" | "onMouseLeave" | "onFocus" | "onBlur">) {
    const Icon = ICON[tone]
    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            {...events}
            className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-panel bg-surface-raised px-4 py-3 text-sm text-fg shadow-overlay motion-safe:animate-[dialog-in_var(--dur-base)_var(--ease-out)]",
                className
            )}
        >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", ICON_TONE[tone])} aria-hidden="true" />
            <span className="min-w-0 flex-1">{message}</span>
            {action && (
                <button type="button" onClick={action.run} className="shrink-0 rounded-control font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    {action.label}
                </button>
            )}
            {onClose && (
                <button type="button" onClick={onClose} aria-label="Meldung schliessen" className="-mr-1 shrink-0 rounded-control p-0.5 text-fg-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            )}
        </div>
    )
}
