"use client"

import * as React from "react"
import { Archive, Download } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { Textarea } from "@/components/atoms/Textarea/Textarea"
import { FormField } from "@/components/forms/FormField"
import { DateInput } from "@/components/inputs/DateInput"
import { NumberInput } from "@/components/inputs/NumberInput"
import { RadioGroup } from "@/components/inputs/RadioGroup"
import { Switch } from "@/components/inputs/Switch"
import { ConflictDialog } from "../ConflictDialog"
import { ConnectionBanner } from "../ConnectionBanner"
import { LongTask } from "../LongTask"
import { NoticeProvider, useNotice } from "../Notices"
import { SaveIndicator } from "../SaveIndicator"
import { SessionDialog } from "../SessionDialog"
import { useSave } from "../useSave"

const TODAY = "2026-10-29"
const NOW = new Date(2026, 9, 29, 10, 30).getTime()

type Outcome = "ok" | "offline" | "session" | "conflict" | "server"
const OUTCOMES = [
    { value: "ok", label: "Klappt" },
    { value: "offline", label: "Keine Verbindung" },
    { value: "session", label: "Sitzung abgelaufen" },
    { value: "conflict", label: "Konflikt" },
    { value: "server", label: "Serverfehler" },
]

type Values = { due: string | null; qty: number | null; note: string; version: number }
/** The content without the version: a version bump alone is not a change (R-05). */
const contentKey = ({ due, qty, note }: Values) => JSON.stringify([due, qty, note])

/** Every way a save can go (R-01–R-10), triggered from the simulation bar. */
export function SaveExample({ delay = 600 }: { delay?: number }) {
    return <NoticeProvider><Example delay={delay} /></NoticeProvider>
}

function Example({ delay }: { delay: number }) {
    const { notify } = useNotice()
    const [outcome, setOutcome] = React.useState<Outcome>("ok")
    const [online, setOnline] = React.useState(true)
    const [values, setValues] = React.useState<Values>({ due: "2026-11-13", qty: 48, note: "Steine nicht mitgiessen.", version: 2 })
    /** What the simulated server holds; its version answers "has someone else changed it?" (R-08). */
    const record = React.useRef<Values>({ due: "2026-11-13", qty: 48, note: "Steine nicht mitgiessen.", version: 2 })
    const [queued, setQueued] = React.useState<Values | null>(null)
    const [status, setStatus] = React.useState("Offen")
    const [log, setLog] = React.useState<string[]>([])
    const [conflict, setConflict] = React.useState(false)
    const [session, setSession] = React.useState(false)
    const [exportStart, setExportStart] = React.useState<number | null>(null)
    const [now, setNow] = React.useState(NOW)
    const outcomeRef = React.useRef(outcome)
    React.useEffect(() => { outcomeRef.current = outcome })

    // The simulated clock moves while something long runs
    React.useEffect(() => {
        if (exportStart === null) return
        const timer = setInterval(() => setNow((n) => n + 500), 500)
        return () => clearInterval(timer)
    }, [exportStart])

    /** Simulated server: fails once the way the bar says, then works again. */
    const server = React.useCallback((v: Values) => new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            const next = outcomeRef.current
            if (next !== "ok") setOutcome("ok")
            if (next === "offline") return reject({ offline: true })
            if (next === "session") { setSession(true); return reject({ status: 419 }) }
            // Someone else saves in between: the server now holds their version
            if (next === "conflict") record.current = { ...record.current, due: "2026-11-16", note: "Steine separat liefern.", version: record.current.version + 1 }
            if (next === "server") return reject({ status: 500 })
            if (v.version !== record.current.version) { setConflict(true); return reject({ status: 409 }) }
            record.current = { ...v, version: v.version + 1 }
            setValues((cur) => ({ ...cur, version: record.current.version }))
            setLog((l) => [...l, `Version ${v.version}: ${v.due ?? "kein Termin"} · ${v.qty ?? "–"} Stk. · ${v.note}`])
            resolve()
        }, delay)
    }), [delay])

    const save = useSave<Values>(server, { now: () => NOW, key: contentKey })
    const change = (patch: Partial<Values>) => { setValues((v) => ({ ...v, ...patch })); save.markDirty() }

    const startExport = () => { setNow(NOW); setExportStart(NOW) }

    // Without a connection the save waits and runs when it is back (R-10)
    const submit = () => { if (online) void save.run(values); else setQueued(values) }
    React.useEffect(() => {
        if (!online || !queued) return
        setQueued(null)
        void save.run(queued)
    }, [online, queued, save])

    return (
        <div className="flex min-h-full flex-col gap-4 bg-surface-sunken p-4 text-fg" data-density="compact">
            <section aria-label="Simulation" className="flex flex-wrap items-start gap-6 rounded-panel border border-dashed border-border-strong p-3 text-sm">
                <RadioGroup label="Nächstes Speichern" variant="segments" options={OUTCOMES} value={outcome} onChange={(v) => setOutcome(v as Outcome)} />
                <Switch checked={online} onChange={setOnline} label="Verbindung" />
                <section aria-label="Server-Protokoll" className="min-w-48 flex-1">
                    <span className="text-xs font-medium text-fg-muted">Server-Protokoll</span>
                    <ul className="m-0 list-none p-0 font-mono text-xs text-fg-muted">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
                </section>
            </section>

            <ConnectionBanner online={online} waiting={queued ? 1 : 0} />

            <form
                onSubmit={(e) => { e.preventDefault(); submit() }}
                className="flex max-w-2xl flex-col gap-5 rounded-panel border border-border bg-surface p-5"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col">
                        <span className="font-mono text-xs text-fg-subtle">26100013</span>
                        <h2 className="m-0 text-xl font-semibold">Ringe Herbst 2026 <span className="ml-1 text-sm font-normal text-fg-muted">{status}</span></h2>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={startExport}><Download className="h-3.5 w-3.5" aria-hidden="true" />Exportieren</Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setStatus("Archiviert")
                                notify({ message: "Auftrag archiviert", action: { label: "Rückgängig", run: () => setStatus("Offen") } })
                            }}
                        >
                            <Archive className="h-3.5 w-3.5" aria-hidden="true" />Archivieren
                        </Button>
                    </div>
                </div>

                {exportStart !== null && (
                    <LongTask
                        running
                        label="Exportiert 1’200 Positionen …"
                        startedAt={exportStart}
                        now={now}
                        onBackground={() => { setExportStart(null); notify({ message: "Export läuft im Hintergrund. Sie werden benachrichtigt.", tone: "info" }) }}
                    />
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField label="Liefertermin"><DateInput today={TODAY} value={values.due} onChange={(due) => change({ due })} /></FormField>
                    <FormField label="Menge"><NumberInput unit="Stk." decimals={0} value={values.qty} onChange={(qty) => change({ qty })} /></FormField>
                </div>
                <FormField label="Notiz"><Textarea rows={2} value={values.note} onChange={(e) => change({ note: e.target.value })} /></FormField>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
                    <SaveIndicator state={save.state} savedAt={save.savedAt} error={save.error} now={NOW} onRetry={() => void save.retry()} />
                    <Button type="submit" busy={save.state === "saving"}>Speichern</Button>
                </div>
            </form>

            <ConflictDialog
                open={conflict}
                by="S. Keller"
                at={NOW - 3 * 60_000}
                now={NOW}
                changes={[{ field: "Liefertermin", mine: values.due ?? "–", theirs: "Mo, 16.11.2026" }, { field: "Notiz", mine: values.note, theirs: "Steine separat liefern." }]}
                // Mine: sent again against the version that is now on the server, not the stale one
                onKeepMine={() => { setConflict(false); const v = { ...values, version: record.current.version }; setValues(v); void save.run(v) }}
                onKeepTheirs={() => {
                    setConflict(false)
                    const server = record.current
                    const merged = { ...values, due: server.due, note: server.note, version: server.version }
                    setValues(merged)
                    save.reset(server)
                    // Own changes to other fields are still there and still unsaved
                    if (merged.qty !== server.qty) save.markDirty()
                }}
                onCancel={() => setConflict(false)}
            />
            <SessionDialog
                open={session}
                user="P. Mohr"
                onLogin={(pw) => new Promise((resolve, reject) => setTimeout(() => (pw ? resolve() : reject(new Error("Passwort fehlt."))), delay))}
                onDone={() => { setSession(false); void save.retry() }}
            />
        </div>
    )
}
