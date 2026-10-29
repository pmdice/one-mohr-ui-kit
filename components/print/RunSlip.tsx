import * as React from "react"
import { Barcode } from "./Barcode"

/**
 * The run slip that travels with the piece (P-02): the number very large, the barcode, then exactly what the
 * station shows (W-05) in the same order, and notes in a box. Readable in black and white; A6, four per A4.
 */
export function RunSlip({ number, code, customer, material, pieces, urgency, notes = [] }: {
    /** As people say it: "26100013 – 3/4". */
    number: string
    /** What the barcode carries: "26100013-3". */
    code: string
    customer: string
    material: string
    pieces: number
    urgency: string
    notes?: string[]
}) {
    const urgent = urgency.toLowerCase() === "dringend"
    const id = React.useId()
    return (
        <article aria-labelledby={id} className="flex h-full flex-col gap-[3mm] border border-dashed border-black p-[5mm] text-black">
            <div className="flex items-start justify-between gap-[3mm]">
                <h2 id={id} className="m-0 font-mono text-[9mm] font-bold leading-none tracking-tight">{number}</h2>
                {/* Urgency as a word in a black box: still there on a black-and-white copy (P-01, S-01) */}
                {urgent && <span className="bg-black px-[2mm] py-[1mm] text-[3.5mm] font-bold tracking-wider text-white">DRINGEND</span>}
            </div>
            <Barcode value={code} height={14} />
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-[4mm] gap-y-[1.5mm] text-[4mm]">
                <dt>Kunde</dt><dd className="m-0 font-semibold">{customer}</dd>
                <dt>Material</dt><dd className="m-0 font-semibold">{material}</dd>
                <dt>Stück</dt><dd className="m-0 font-semibold tabular-nums">{pieces}</dd>
                <dt>Dringlichkeit</dt><dd className="m-0 font-semibold">{urgency}</dd>
            </dl>
            {notes.length > 0 && (
                <div role="note" className="mt-auto border-2 border-black p-[2mm] text-[4mm] font-semibold">
                    {notes.map((n) => <p key={n} className="m-0">{n}</p>)}
                </div>
            )}
        </article>
    )
}
