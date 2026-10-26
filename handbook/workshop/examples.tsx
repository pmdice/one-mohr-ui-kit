"use client"

import * as React from "react"
import { Check, Eye, Pencil, Printer, ScanLine } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { NOW } from "@/components/status/examples/slip"
import { CameraScanner } from "@/components/workshop/CameraScanner"
import { HereList } from "@/components/workshop/HereList"
import { ScanBanner } from "@/components/workshop/ScanBanner"
import { SlipCard } from "@/components/workshop/SlipCard"
import { StationHeader } from "@/components/workshop/StationHeader"

/* Live examples for the workshop rules, shown in comfortable density. Anti-patterns ("Schlecht") are built by hand on purpose. */

const H = 3_600_000
const noop = () => {}
const Comfortable = ({ children }: { children: React.ReactNode }) => <div data-density="comfortable" className="flex flex-col gap-3">{children}</div>
const Field = ({ label }: { label: string }) => (
    <label className="flex flex-col gap-1 text-base">{label}<input className="min-h-12 rounded-control border border-border-strong bg-surface px-4 font-mono text-xl" placeholder="z. B. 26100013-3/4" /></label>
)

/* ---------- W-01 ---------- */
export const W01Good = () => <Comfortable><StationHeader station="Guss" waiting={0} online sound onSoundChange={noop} onChangeStation={noop} /></Comfortable>
export const W01Bad = () => (
    <div className="flex items-center gap-2 text-sm">
        <select className="h-8 rounded-control border border-border-strong bg-surface px-2"><option>Guss</option><option>Polissage</option></select>
        <input className="h-8 flex-1 rounded-control border border-border-strong bg-surface px-2" placeholder="Code" />
    </div>
)

/* ---------- W-02 ---------- */
const Viewfinder = () => <div className="flex h-full items-center justify-center text-lg text-surface"><ScanLine className="h-16 w-16" aria-hidden="true" /></div>
export const W02Good = () => <Comfortable><CameraScanner onCode={noop} simulated={<Viewfinder />} fallback={<Field label="Nummer eintippen" />} /></Comfortable>
export const W02Bad = () => <div className="flex aspect-[4/3] items-center justify-center rounded-panel bg-surface-sunken text-xs text-fg-subtle">Kamera nicht verfügbar</div>

/* ---------- W-03 ---------- */
export const W03Good = () => (
    <Comfortable>
        <p className="m-0 text-xl font-semibold">26100013 – 1/4 eingescannt in Guss</p>
        <div className="flex flex-wrap gap-3"><Button variant="outline" className="min-h-12 px-4 text-base">Scan zurücknehmen</Button><Button className="min-h-12 px-4 text-base">Erfassen</Button></div>
    </Comfortable>
)
export const W03Bad = () => (
    <div className="flex items-center justify-between text-xs">
        <span>26100013-1/4 ok</span>
        <span className="flex gap-1 text-fg-muted"><Eye className="h-3 w-3" aria-hidden="true" /><Printer className="h-3 w-3" aria-hidden="true" /><Pencil className="h-3 w-3" aria-hidden="true" /></span>
    </div>
)

/* ---------- W-04 ---------- */
export const W04Good = () => <Comfortable><ScanBanner sound={false} result={{ id: 1, kind: "in", message: "26100013 – 1/4 eingescannt in Guss" }} /></Comfortable>
export const W04Bad = () => (
    <div className="flex w-fit items-center gap-1 rounded-panel border border-border bg-surface-raised px-3 py-1.5 text-xs shadow-lg"><Check className="h-3 w-3 text-success" aria-hidden="true" />OK</div>
)

/* ---------- W-05 ---------- */
export const W05Good = () => (
    <Comfortable><SlipCard number="26100013 – 1/4" customer="DÄHLER + BLASER" material="INOX" pieces={12} urgency="Dringend" notes={["Steine nicht mitgiessen"]} /></Comfortable>
)
export const W05Bad = () => (
    <dl className="m-0 grid grid-cols-2 gap-x-3 text-xs">
        {[["ID", "8812"], ["Auftrag", "26100013"], ["Pos.", "1/4"], ["Kunde", "10073"], ["Material-ID", "3"], ["Stück", "12"], ["Gewicht", "412"], ["Eingips", "2026-10-25"], ["Prio", "4"], ["Erstellt", "P. Mohr"], ["Bemerkung", "Steine nicht mitgiessen"], ["Status-ID", "2"]].map(([k, v]) => (
            <React.Fragment key={k}><dt className="text-fg-muted">{k}</dt><dd className="m-0">{v}</dd></React.Fragment>
        ))}
    </dl>
)

/* ---------- W-06 ---------- */
export const W06Good = () => (
    <Comfortable><ScanBanner sound={false} result={{ id: 1, kind: "error", message: "Code nicht erkannt: 2610001-14", next: "Nummer unten eintippen oder Zettel ins Büro bringen." }} /></Comfortable>
)
export const W06Bad = () => <p className="m-0 text-sm text-danger">Error 422: Unprocessable Entity</p>

/* ---------- W-07 ---------- */
export const W07Good = () => (
    <Comfortable>
        <StationHeader station="Guss" waiting={3} online={false} sound onSoundChange={noop} onChangeStation={noop} />
        <ScanBanner sound={false} result={{ id: 1, kind: "in", message: "26100013 – 3/4 eingescannt in Guss", next: "Gespeichert, wird gesendet, sobald die Verbindung zurück ist." }} />
    </Comfortable>
)
export const W07Bad = () => <p className="m-0 text-sm text-danger">Netzwerkfehler. Bitte erneut scannen.</p>

/* ---------- W-08 ---------- */
export const W08Good = () => (
    <Comfortable>
        <HereList station="Guss" now={NOW} onSelect={noop} items={[
            { id: "a", number: "26100013 – 1/4", since: NOW - 5 * H, norm: 4 * H },
            { id: "b", number: "26100011 – 2/2", since: NOW - 2 * H, norm: 4 * H },
            { id: "c", number: "26100014 – 1/1", since: NOW - 0.5 * H, norm: 4 * H },
        ]} />
    </Comfortable>
)
export const W08Bad = () => <p className="m-0 text-sm text-fg-muted">Welche Zettel an Guss liegen, sieht man im Büro unter Planung › Gusszettel.</p>
