"use client"

import * as React from "react"
import { CloudOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { ConfirmDialog } from "@/components/status/ConfirmDialog"
import { cn } from "@/lib/utils"

type Station = { id: string; label: string }

/** First setup: which station this device stands at (W-01). */
export function StationPicker({ stations, onPick }: { stations: Station[]; onPick: (id: string) => void }) {
    return (
        <section className="flex flex-col gap-6 py-4">
            <div className="flex flex-col gap-2">
                <h1 className="m-0 text-3xl font-semibold tracking-tight text-fg">An welcher Station steht dieses Tablet?</h1>
                <p className="m-0 text-lg text-fg-muted">Alle Scans an diesem Gerät zählen an dieser Station. Das Gerät merkt sich die Wahl.</p>
            </div>
            <ol aria-label="Stationen" className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
                {stations.map((s, i) => (
                    <li key={s.id}>
                        <button
                            type="button"
                            onClick={() => onPick(s.id)}
                            className="flex min-h-24 w-full flex-col items-start justify-between gap-2 rounded-panel border-2 border-border bg-surface-raised p-4 text-left transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:bg-surface-sunken"
                        >
                            <span className="text-sm text-fg-muted" aria-hidden="true">{i + 1}. Station</span>
                            <span className="text-2xl font-semibold text-fg">{s.label}</span>
                        </button>
                    </li>
                ))}
            </ol>
        </section>
    )
}

/**
 * The station, big, on every workshop page (W-01), with the way of the slips through the stations, and
 * the scans still waiting for the network (W-07). Changing the station is deliberate: far from the scan
 * and confirmed.
 */
export function StationHeader({ station, stations, waiting, online, sound, onSoundChange, onChangeStation, rejected = [], onDismissRejected }: {
    station: string
    /** All stations in the order a slip passes them; shown as a rail with this one marked. */
    stations?: Station[]
    /** Scans not sent yet (rejected ones are listed apart). */
    waiting: number
    online: boolean
    sound: boolean
    onSoundChange: (sound: boolean) => void
    onChangeStation: () => void
    /** Scans the server refused (W-07): stay visible with their reason until taken out. */
    rejected?: { id: string; code: string; reason: string }[]
    onDismissRejected?: (id: string) => void
}) {
    const [confirm, setConfirm] = React.useState(false)
    return (
        <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-3">
                    <h1 className="m-0 flex flex-col">
                        <span className="text-sm font-medium uppercase tracking-[0.14em] text-fg-muted">Station</span>{" "}
                        <span className="text-5xl font-semibold leading-none tracking-tight text-fg">{station}</span>
                    </h1>
                    {stations && <StationRail stations={stations} current={station} />}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" aria-pressed={sound} onClick={() => onSoundChange(!sound)} className="min-h-12 gap-2 text-base">
                        {sound ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
                        Ton
                    </Button>
                    <Button variant="outline" onClick={() => setConfirm(true)} className="min-h-12 text-base">Station wechseln</Button>
                </div>
            </div>
            {(!online || waiting > 0) && (
                <p role="status" className="m-0 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-panel border border-warning bg-warning-subtle px-4 py-3 text-lg text-fg">
                    {!online && <span className="inline-flex items-center gap-2 font-semibold"><CloudOff className="h-5 w-5 text-warning" aria-hidden="true" />Keine Verbindung</span>}
                    {waiting > 0 && <span>{waiting === 1 ? "1 Scan wartet" : `${waiting} Scans warten`} auf Verbindung</span>}
                </p>
            )}
            {rejected.length > 0 && (
                <section aria-label="Abgelehnte Scans" className="flex flex-col gap-2 rounded-panel border border-danger bg-danger-subtle px-4 py-3">
                    <h2 className="m-0 text-lg font-semibold text-fg">Abgelehnte Scans ({rejected.length})</h2>
                    <ul className="m-0 flex list-none flex-col gap-2 p-0">
                        {rejected.map((r) => (
                            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 text-lg text-fg">
                                <span><span className="font-mono">{r.code}</span>: {r.reason}. Zettel ins Büro bringen.</span>
                                <Button variant="outline" aria-label={`${r.code} aus der Liste nehmen`} onClick={() => onDismissRejected?.(r.id)} className="min-h-12 text-base">Aus der Liste nehmen</Button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <ConfirmDialog
                open={confirm}
                title="Station wechseln?"
                consequences={["Alle folgenden Scans zählen an der neuen Station.", "Wartende Scans behalten ihre Station."]}
                confirmLabel="Station wechseln"
                tone="default"
                onCancel={() => setConfirm(false)}
                onConfirm={() => { setConfirm(false); onChangeStation() }}
            />
        </header>
    )
}

/** The way of a slip, this station marked: where am I, what came before, what comes next. */
function StationRail({ stations, current }: { stations: Station[]; current: string }) {
    return (
        <ol aria-label="Weg der Laufzettel" className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
            {stations.map((s, i) => {
                const here = s.label === current
                return (
                    <li key={s.id} className="flex items-center gap-1.5" aria-current={here ? "location" : undefined}>
                        {i > 0 && <span className="h-px w-5 bg-border-strong" aria-hidden="true" />}
                        <span className={cn(
                            "rounded-control px-2.5 py-1 text-sm",
                            here ? "bg-fg font-semibold text-surface" : "border border-border text-fg-muted"
                        )}>
                            {s.label}
                        </span>
                    </li>
                )
            })}
        </ol>
    )
}
