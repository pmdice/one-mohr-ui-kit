"use client"

import * as React from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { RadioGroup } from "@/components/inputs/RadioGroup"
import { SLIPS, STATIONS, slipNumber, stationLabel, urgencyOf, type Slip, type Station } from "@/components/table/examples/slips"
import { download, exportFilename, toCsv, type CsvColumn } from "../csv"
import { ExportMenu } from "../ExportMenu"
import { PrintPreview } from "../PrintPreview"
import { PrintSheet } from "../PrintSheet"
import { RunSlip } from "../RunSlip"

const PRINTED = new Date(2026, 9, 29, 10, 30).getTime()
/** The example prints at most two sheets; a real app prints what was chosen. */
const PRINT_MAX = 8

const COLUMNS: CsvColumn<Slip>[] = [
    { label: "Laufzettel", kind: "text", value: (s) => s.id },
    { label: "Auftrag", kind: "text", value: (s) => s.orderId },
    { label: "Kunde", value: (s) => s.customer },
    { label: "Material", value: (s) => s.material },
    { label: "Stück", kind: "number", value: (s) => s.pieces },
    { label: "Gewicht (g)", kind: "number", value: (s) => s.weight },
    { label: "Gussdatum", kind: "date", value: (s) => s.castDate },
    { label: "Station", value: (s) => stationLabel(s.station) },
    { label: "Dringlichkeit", value: (s) => urgencyOf(s.urgency).label },
]

const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s+-])\p{L}/gu, (m) => m.toUpperCase())

/** A list with a filter: export exactly what is shown (P-05–P-07) and print its run slips (P-01–P-04). */
export function PrintExport({ today = "2026-10-29", onDownload = download, onPrint }: {
    today?: string
    onDownload?: (text: string, filename: string) => void
    onPrint?: () => void
}) {
    const [station, setStation] = React.useState<Station | "alle">("alle")
    const [preview, setPreview] = React.useState(false)
    const rows = station === "alle" ? SLIPS : SLIPS.filter((s) => s.station === station)
    const filters = station === "alle" ? [] : [`Station: ${stationLabel(station)}`]

    const printed = rows.slice(0, PRINT_MAX)
    const pages = Array.from({ length: Math.ceil(printed.length / 4) }, (_, p) => printed.slice(p * 4, p * 4 + 4))

    return (
        <div className="flex min-h-full flex-col gap-4 bg-surface-sunken p-4 text-fg" data-density="compact">
            <div className="print-hide flex flex-col gap-4 rounded-panel border border-border bg-surface p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <RadioGroup
                        label="Station"
                        variant="segments"
                        value={station}
                        onChange={(v) => { setStation(v as Station | "alle"); setPreview(false) }}
                        options={[{ value: "alle", label: "Alle" }, ...STATIONS.map((s) => ({ value: s.value, label: s.label }))]}
                    />
                    <div className="flex gap-2">
                        <ExportMenu
                            count={rows.length}
                            noun="Laufzettel"
                            filters={filters}
                            onExport={() => onDownload(toCsv(rows, COLUMNS), exportFilename(["Laufzettel", ...filters.map((f) => f.replace(": ", " "))], today, "csv"))}
                        />
                        <Button variant="outline" onClick={() => setPreview(true)} disabled={rows.length === 0}>
                            <Printer className="h-3.5 w-3.5" aria-hidden="true" />Laufzettel drucken ({Math.min(rows.length, PRINT_MAX)})
                        </Button>
                    </div>
                </div>
                <p className="m-0 text-sm text-fg-muted">{rows.length} Laufzettel{filters.length ? ` · ${filters.join(", ")}` : ""}</p>
                <ul className="m-0 grid list-none grid-cols-1 gap-x-6 p-0 font-mono text-xs text-fg-muted sm:grid-cols-2">
                    {rows.slice(0, 8).map((s) => <li key={s.id}>{slipNumber(s)} · {titleCase(s.customer)} · {stationLabel(s.station)}</li>)}
                </ul>
            </div>

            {preview && (
                <section aria-label="Druckvorschau">
                    <PrintPreview
                        title={`Laufzettel${filters.length ? ` · ${filters.join(", ")}` : ""}`}
                        onPrint={onPrint}
                        pages={pages.map((slips, p) => (
                            <PrintSheet key={p} company="Muster Guss AG" title="Laufzettel" page={p + 1} pages={pages.length} printedAt={PRINTED}>
                                <div className="grid h-full grid-cols-2 grid-rows-2 gap-[4mm]">
                                    {slips.map((s) => (
                                        <RunSlip
                                            key={s.id}
                                            number={slipNumber(s)}
                                            code={s.id}
                                            customer={titleCase(s.customer)}
                                            material={s.material}
                                            pieces={s.pieces}
                                            urgency={urgencyOf(s.urgency).label}
                                            notes={s.urgency === "dringend" ? ["Vor allen anderen giessen"] : []}
                                        />
                                    ))}
                                </div>
                            </PrintSheet>
                        ))}
                    />
                </section>
            )}
        </div>
    )
}
