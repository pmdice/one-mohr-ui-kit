import { formatDate } from "@/components/inputs/parse"

export interface CsvColumn<T> {
    label: string
    value: (row: T) => string | number | null | undefined
    /** text: always quoted (keeps leading zeros); number: plain with a point; date: ISO in, TT.MM.JJJJ out. */
    kind?: "text" | "number" | "date"
}

const BOM = "﻿"

const quote = (s: string) => `"${s.replace(/"/g, '""')}"`

/**
 * A CSV that Swiss Excel opens right (P-07): UTF-8 with BOM, semicolons, CRLF, numbers without grouping,
 * dates as TT.MM.JJJJ, identifiers quoted so leading zeros stay, empty for missing values.
 */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
    const cell = (column: CsvColumn<T>, row: T) => {
        const raw = column.value(row)
        if (raw === null || raw === undefined || raw === "") return ""
        if (column.kind === "number") return String(raw)
        if (column.kind === "date") return formatDate(String(raw))
        const text = String(raw)
        if (column.kind === "text" || /[;"\r\n]/.test(text)) return quote(text)
        return text
    }
    const header = columns.map((c) => (/[;"\r\n]/.test(c.label) ? quote(c.label) : c.label)).join(";")
    return BOM + [header, ...rows.map((row) => columns.map((c) => cell(c, row)).join(";"))].join("\r\n")
}

/** "Laufzettel_Station-Guss_2026-10-29.csv" (P-06): what and when, nothing a file system refuses. */
export function exportFilename(parts: string[], date: string, ext: string): string {
    const clean = (s: string) => s.replace(/[\\/:*?"<>|]+/g, " ").trim().replace(/\s+/g, "-")
    return `${[...parts.map(clean).filter(Boolean), date].join("_")}.${ext}`
}

/** Hands the text to the browser as a file to save. */
export function download(text: string, filename: string, type = "text/csv;charset=utf-8") {
    const url = URL.createObjectURL(new Blob([text], { type }))
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}
