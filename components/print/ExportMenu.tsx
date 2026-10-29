"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { ActionMenu } from "@/components/table/ActionMenu"

/** Export of the current view; the menu says beforehand what will be in the file (P-05). */
export function ExportMenu({ count, noun, filters, onExport }: {
    count: number
    noun: string
    /** Active filters in words, "Station: Guss". */
    filters: string[]
    onExport: (format: "csv") => void
}) {
    const what = filters.length ? `${count} ${noun} · ${filters.join(", ")}` : `Alle ${count} ${noun}`
    return (
        <ActionMenu
            label="Exportieren"
            menuLabel="Exportieren"
            trigger={<span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" aria-hidden="true" />Exportieren</span>}
            triggerClassName="flex h-control items-center rounded-control border border-border-strong px-control text-control text-fg hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            items={[{ id: "csv", label: "Für Excel (CSV)", hint: what, onSelect: () => onExport("csv") }]}
        />
    )
}
