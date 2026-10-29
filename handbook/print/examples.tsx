"use client"

import * as React from "react"
import { Barcode } from "@/components/print/Barcode"
import { toCsv } from "@/components/print/csv"
import { RunSlip } from "@/components/print/RunSlip"
import { ExportMenu } from "@/components/print/ExportMenu"

/* Live examples for the print and export rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

const Paper = ({ children, width = "105mm" }: { children: React.ReactNode; width?: string }) => (
    <div className="overflow-hidden rounded-control border border-border">
        <div className="origin-top-left bg-white text-black" style={{ width, transform: "scale(0.62)", marginBottom: "-38%" }}>{children}</div>
    </div>
)

/* ---------- P-01 ---------- */
export const P01Good = () => (
    <Paper width="148mm">
        <div className="flex flex-col gap-[2mm] p-[6mm] text-[3.5mm]">
            <div className="flex justify-between border-b border-black pb-[1mm]"><b>Muster Guss AG</b><span>Lieferschein · 26100013</span></div>
            <div className="flex items-center gap-[2mm]"><span className="bg-black px-[1.5mm] text-white">DRINGEND</span>Ringe Herbst 2026</div>
            <div>Status: ◐ In Arbeit</div>
        </div>
    </Paper>
)
export const P01Bad = () => (
    <div className="flex flex-col gap-1 rounded-control border border-border p-2 text-xs">
        <div className="flex gap-2 text-fg-muted"><span>☰ Menü</span><span>Aufträge</span><span>Kunden</span><span className="ml-auto rounded-control bg-accent px-1 text-accent-fg">Speichern</span></div>
        <span className="text-danger">Ringe Herbst 2026</span>
        <span className="text-fg-subtle">In Arbeit</span>
    </div>
)

/* ---------- P-02 ---------- */
export const P02Good = () => (
    <Paper><div style={{ height: "148mm" }}><RunSlip number="26100013 – 3/4" code="26100013-3" customer="Dähler + Blaser" material="INOX" pieces={12} urgency="Dringend" notes={["Steine nicht mitgiessen"]} /></div></Paper>
)
export const P02Bad = () => (
    <div className="grid grid-cols-2 gap-x-2 rounded-control border border-border p-2 text-[10px]">
        {[["ID", "8812"], ["Auftrag", "26100013"], ["Pos", "3"], ["Kunde-ID", "10073"], ["Mat", "3"], ["Stk", "12"], ["Prio", "4"], ["Preis", "412.00"], ["Erstellt", "26.10.2026"], ["Bem.", "Steine nicht mitgiessen"]].map(([k, v]) => <span key={k}>{k}: {v}</span>)}
    </div>
)

/* ---------- P-03 ---------- */
export const P03Good = () => <Paper><div className="p-[4mm]"><Barcode value="26100013-3" /></div></Paper>
export const P03Bad = () => (
    <Paper><div className="p-[4mm]" style={{ width: "40mm" }}><div style={{ transform: "scaleX(0.45)", transformOrigin: "left" }}><Barcode value="26100013-3" quiet={1} height={5} /></div></div></Paper>
)

/* ---------- P-04 ---------- */
export const P04Good = () => (
    <Paper width="148mm">
        <div className="flex flex-col gap-[2mm] p-[6mm] text-[3.5mm]">
            <div className="flex justify-between border-b border-black pb-[1mm]"><b>Muster Guss AG</b><span>Lieferschein · 26100013</span></div>
            <div className="h-[20mm]">… Positionen 13–24 …</div>
            <div className="flex justify-between border-t border-black pt-[1mm] text-[3mm]"><span>Gedruckt 29.10.2026 10:30</span><span>Seite 2 von 3</span></div>
        </div>
    </Paper>
)
export const P04Bad = () => <div className="rounded-control border border-border p-2 text-xs">… Positionen 13–24 …<br /><span className="text-fg-subtle">(welcher Auftrag? welche Seite?)</span></div>

/* ---------- P-05 ---------- */
export const P05Good = () => <ExportMenu count={124} noun="Laufzettel" filters={["Station: Guss"]} onExport={() => {}} />
export const P05Bad = () => <button className="h-control rounded-control border border-border-strong px-control text-control">Export (CSV)</button>

/* ---------- P-06 ---------- */
export const P06Good = () => <p className="m-0 font-mono text-xs">Laufzettel_Station-Guss_2026-10-29.csv<br />Aufträge_Kunde-Dähler-Blaser_2026-10-29.csv</p>
export const P06Bad = () => <p className="m-0 font-mono text-xs">export.csv<br />export(1).csv<br />export(7).csv</p>

/* ---------- P-07 ---------- */
const sample = toCsv(
    [{ no: "00123", customer: "Dähler + Blaser", pieces: 1200, date: "2026-11-14" }],
    [
        { label: "Nummer", kind: "text", value: (r) => r.no },
        { label: "Kunde", value: (r) => r.customer },
        { label: "Stück", kind: "number", value: (r) => r.pieces },
        { label: "Termin", kind: "date", value: (r) => r.date },
    ]
).slice(1)
export const P07Good = () => <pre className="m-0 overflow-x-auto font-mono text-xs">{sample}</pre>
export const P07Bad = () => <pre className="m-0 overflow-x-auto font-mono text-xs">{"Nummer,Kunde,Stück,Termin\n123,DÃ¤hler + Blaser,1'200,2026-11-14T00:00:00Z"}</pre>

/* ---------- P-08 ---------- */
export const P08Good = () => (
    <div className="flex flex-col gap-1 text-sm">
        <span>Export läuft im Hintergrund – Sie können weiterarbeiten.</span>
        <span className="text-xs text-fg-muted">Danach: „Export bereit · Laufzettel_2026-10-29.csv herunterladen (7 Tage gültig)“</span>
    </div>
)
export const P08Bad = () => <span className="text-sm text-fg-muted">Bitte warten … Fenster nicht schliessen (ca. 2 Minuten)</span>
