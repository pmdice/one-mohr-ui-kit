import * as React from "react"
import { encode128B, modules } from "./code128"

/**
 * A Code 128 barcode in real millimetres (P-03): module width, height and quiet zone are sizes on paper,
 * so it scans when printed at actual size. The value stands below as text, for when the scanner fails.
 */
export function Barcode({ value, module = 0.33, height = 12, quiet = 10, className }: {
    value: string
    /** Width of the narrowest bar in mm; 0.33 or more for workshop scanners and cameras. */
    module?: number
    /** Bar height in mm. */
    height?: number
    /** Quiet zone left and right, in modules. */
    quiet?: number
    className?: string
}) {
    let widths: string
    try {
        widths = modules(encode128B(value))
    } catch (e) {
        // One slip that cannot carry a barcode must not stop the others from printing
        return (
            <figure role="img" aria-label={`Barcode nicht druckbar: ${value}`} className={className} style={{ margin: 0, border: "0.5mm solid #000", padding: "2mm", color: "#000", fontSize: "3mm" }}>
                {e instanceof Error ? e.message : "Barcode nicht druckbar"} · <span style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}>{value}</span>
            </figure>
        )
    }
    const bars: { x: number; w: number }[] = []
    let x = quiet
    ;[...widths].forEach((w, i) => {
        const n = Number(w)
        if (i % 2 === 0) bars.push({ x, w: n })
        x += n
    })
    const total = x + quiet
    return (
        <figure className={className} style={{ margin: 0, display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
            <svg
                role="img"
                aria-label={`Barcode ${value}`}
                width={`${total * module}mm`}
                height={`${height}mm`}
                viewBox={`0 0 ${total * module} ${height}`}
                shapeRendering="crispEdges"
            >
                {/* Paper is white and bars are black in every theme */}
                <rect x={0} y={0} width={total * module} height={height} fill="#fff" />
                {bars.map((b, i) => <rect key={i} data-bar="" x={b.x * module} y={0} width={b.w * module} height={height} fill="#000" />)}
            </svg>
            <figcaption style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: "3mm", letterSpacing: "0.05em", color: "#000" }}>{value}</figcaption>
        </figure>
    )
}
