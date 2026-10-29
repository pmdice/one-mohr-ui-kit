"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { Input } from "@/components/atoms/Input/Input"
import { FormField } from "@/components/forms/FormField"
import { ConflictDialog } from "@/components/feedback/ConflictDialog"
import { ConnectionBanner } from "@/components/feedback/ConnectionBanner"
import { explainError } from "@/components/feedback/explainError"
import { LongTask } from "@/components/feedback/LongTask"
import { NoticeCard } from "@/components/feedback/Notices"
import { SaveIndicator } from "@/components/feedback/SaveIndicator"
import { SessionDialog } from "@/components/feedback/SessionDialog"

/* Live examples for the saving and feedback rules. Anti-patterns ("Schlecht") are built by hand on purpose. */

const NOW = new Date(2026, 9, 29, 10, 30).getTime()
const MIN = 60_000
const Stack = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col gap-2">{children}</div>
const FakeToast = ({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "error" }) => (
    <div className={`flex w-fit items-center gap-2 rounded-panel px-3 py-2 text-xs text-surface ${tone === "error" ? "bg-danger" : "bg-fg"}`}>{children}</div>
)

/* ---------- R-01 ---------- */
export const R01Good = () => (
    <Stack>
        <SaveIndicator state="dirty" now={NOW} onRetry={() => {}} />
        <SaveIndicator state="saved" savedAt={NOW - 2 * MIN} now={NOW} onRetry={() => {}} />
        <SaveIndicator state="failed" error={explainError({ offline: true })} now={NOW} onRetry={() => {}} />
    </Stack>
)
export const R01Bad = () => (
    <div className="flex items-center gap-2"><Button size="sm">Speichern</Button><span className="text-xs text-fg-subtle">(hat es geklappt?)</span></div>
)

/* ---------- R-02 ---------- */
export const R02Good = () => (
    <Stack>
        <FormField label="Liefertermin" error="Liefertermin liegt in der Vergangenheit"><Input defaultValue="01.10.2026" /></FormField>
        <NoticeCard tone="success" message="Auftrag gelöscht" action={{ label: "Rückgängig", run: () => {} }} />
    </Stack>
)
export const R02Bad = () => (
    <Stack>
        <FormField label="Liefertermin"><Input defaultValue="01.10.2026" /></FormField>
        <FakeToast tone="error">Validierung fehlgeschlagen: due_date. Bitte korrigieren.</FakeToast>
    </Stack>
)

/* ---------- R-03 ---------- */
export const R03Good = () => (
    <Stack>
        <NoticeCard tone="success" message="Auftrag archiviert" action={{ label: "Rückgängig", run: () => {} }} />
        <NoticeCard tone="error" message="Export fehlgeschlagen. Erneut versuchen." onClose={() => {}} />
    </Stack>
)
export const R03Bad = () => (
    <Stack>
        <FakeToast><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />Erfolg! Der Datensatz wurde erfolgreich archiviert und ist jetzt nicht mehr in der Liste der offenen Aufträge sichtbar.</FakeToast>
        <FakeToast tone="error"><AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />Fehler (verschwindet in 3 s)</FakeToast>
    </Stack>
)

/* ---------- R-04 ---------- */
export function R04Good() {
    const [done, setDone] = React.useState(false)
    return (
        <Stack>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={done} onChange={() => setDone(!done)} />Position 2 fertig</label>
            {done && <NoticeCard tone="success" message="Position 2 als fertig gemeldet" action={{ label: "Rückgängig", run: () => setDone(false) }} />}
        </Stack>
    )
}
export const R04Bad = () => (
    <div className="flex flex-col gap-2 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" disabled />Position 2 fertig</label>
        <span className="flex items-center gap-1 text-xs text-fg-muted"><Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />Bitte warten … (Seite wird neu geladen)</span>
    </div>
)

/* ---------- R-05 ---------- */
export const R05Good = () => <div className="flex items-center gap-3"><Button busy>Speichern</Button><span className="text-xs text-fg-muted">Weitere Klicks tun nichts.</span></div>
export const R05Bad = () => <p className="m-0 text-sm text-fg-muted">Verlauf: P. Mohr hat den Auftrag angelegt · P. Mohr hat den Auftrag angelegt · P. Mohr hat den Auftrag angelegt</p>

/* ---------- R-06 ---------- */
export const R06Good = () => (
    <Stack>
        <LongTask running label="Exportiert 1’200 Aufträge …" startedAt={0} now={2500} />
        <LongTask running label="Exportiert 1’200 Aufträge …" startedAt={0} now={12_000} progress={0.64} />
    </Stack>
)
export const R06Bad = () => <div className="flex h-16 items-center justify-center rounded-panel border border-border"><Loader2 className="h-5 w-5 animate-spin text-fg-muted" aria-label="Laden" /></div>

/* ---------- R-07 ---------- */
export const R07Good = () => (
    <Stack>
        {[{ status: 403 }, { status: 404 }, { status: 500, code: "R7Q2KX" }].map((e) => {
            const x = explainError(e)
            return <p key={String(e.status)} className="m-0 text-sm">{x.message}{x.code && <span className="ml-1 font-mono text-xs text-fg-muted">Code {x.code}</span>}</p>
        })}
    </Stack>
)
export const R07Bad = () => (
    <Stack>
        <p className="m-0 font-mono text-xs text-danger">Error 403: This action is unauthorized.</p>
        <p className="m-0 font-mono text-xs text-danger">SQLSTATE[23000]: Integrity constraint violation: 1451</p>
        <p className="m-0 text-sm text-danger">Ein Fehler ist aufgetreten.</p>
    </Stack>
)

/* ---------- R-08 ---------- */
export function R08Good() {
    const [open, setOpen] = React.useState(false)
    return (
        <Stack>
            <Button size="sm" variant="outline" className="w-fit" onClick={() => setOpen(true)}>Speichern (Konflikt)</Button>
            <ConflictDialog
                open={open}
                by="S. Keller"
                at={NOW - 3 * MIN}
                now={NOW}
                changes={[{ field: "Liefertermin", mine: "Fr, 20.11.2026", theirs: "Mo, 16.11.2026" }]}
                onKeepMine={() => setOpen(false)}
                onKeepTheirs={() => setOpen(false)}
                onCancel={() => setOpen(false)}
            />
        </Stack>
    )
}
export const R08Bad = () => <p className="m-0 text-sm">Gespeichert. <span className="text-fg-muted">(Die Änderung von S. Keller von vor 3 Minuten ist weg – niemand merkt es.)</span></p>

/* ---------- R-09 ---------- */
export function R09Good() {
    const [open, setOpen] = React.useState(false)
    return (
        <Stack>
            <Button size="sm" variant="outline" className="w-fit" onClick={() => setOpen(true)}>Speichern (Sitzung abgelaufen)</Button>
            <SessionDialog open={open} user="P. Mohr" onLogin={async () => {}} onDone={() => setOpen(false)} />
        </Stack>
    )
}
export const R09Bad = () => <p className="m-0 text-sm text-danger">419 | Page Expired <span className="text-fg-muted">(zurück zur Anmeldung, alle Eingaben weg)</span></p>

/* ---------- R-10 ---------- */
export const R10Good = () => (
    <Stack>
        <ConnectionBanner online={false} waiting={2} />
        <div className="flex items-center gap-2"><Button size="sm" disabled>PDF senden</Button><span className="text-xs text-fg-muted">Senden geht wieder, sobald die Verbindung zurück ist.</span></div>
    </Stack>
)
export const R10Bad = () => <p className="m-0 text-sm text-danger">Netzwerkfehler. Bitte Seite neu laden.</p>
