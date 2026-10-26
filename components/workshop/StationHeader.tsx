"use client"

import * as React from "react"
import { CloudOff, MapPin, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { ConfirmDialog } from "@/components/status/ConfirmDialog"

/** First setup: which station this device stands at (W-01). */
export function StationPicker({ stations, onPick }: { stations: { id: string; label: string }[]; onPick: (id: string) => void }) {
    return (
        <section className="flex flex-col gap-5">
            <h1 className="m-0 text-2xl font-semibold text-fg">An welcher Station steht dieses Tablet?</h1>
            <p className="m-0 text-lg text-fg-muted">Alle Scans an diesem Gerät zählen an dieser Station. Das Gerät merkt sich die Wahl.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {stations.map((s) => (
                    <Button key={s.id} variant="outline" onClick={() => onPick(s.id)} className="min-h-16 text-xl">{s.label}</Button>
                ))}
            </div>
        </section>
    )
}

/**
 * The station, big, on every workshop page (W-01), with the scans still waiting for the network (W-07).
 * Changing the station is deliberate: far from the scan and confirmed.
 */
export function StationHeader({ station, waiting, online, sound, onSoundChange, onChangeStation }: {
    station: string
    waiting: number
    online: boolean
    sound: boolean
    onSoundChange: (sound: boolean) => void
    onChangeStation: () => void
}) {
    const [confirm, setConfirm] = React.useState(false)
    return (
        <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="m-0 flex items-center gap-3 text-2xl font-semibold text-fg">
                    <MapPin className="h-7 w-7 text-fg-muted" aria-hidden="true" />Station {station}
                </h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" aria-pressed={sound} onClick={() => onSoundChange(!sound)} className="min-h-12 gap-2 text-base">
                        {sound ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
                        Ton
                    </Button>
                    <Button variant="outline" onClick={() => setConfirm(true)} className="min-h-12 text-base">Station wechseln</Button>
                </div>
            </div>
            {(!online || waiting > 0) && (
                <p role="status" className="m-0 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-panel border border-warning bg-warning-subtle px-4 py-2 text-lg text-fg">
                    {!online && <span className="inline-flex items-center gap-2 font-semibold"><CloudOff className="h-5 w-5 text-warning" aria-hidden="true" />Keine Verbindung</span>}
                    {waiting > 0 && <span>{waiting === 1 ? "1 Scan wartet" : `${waiting} Scans warten`} auf Verbindung</span>}
                </p>
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
