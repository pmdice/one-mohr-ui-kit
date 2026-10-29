"use client"

import * as React from "react"
import { Archive, CalendarClock, Pencil, ShieldQuestion, Trash2 } from "lucide-react"
import { Button } from "@/components/atoms/Button/Button"
import { RadioGroup } from "@/components/inputs/RadioGroup"
import { Switch } from "@/components/inputs/Switch"
import { Dialog } from "@/components/molecules/Dialog/Dialog"
import { KeyFacts } from "@/components/record/KeyFacts"
import { Property, PropertyList } from "@/components/record/PropertyList"
import { AccessRequestDialog } from "../AccessRequestDialog"
import { decide, type AccessRule } from "../decide"
import { Guarded } from "../Guarded"
import { ImpersonationBanner } from "../ImpersonationBanner"
import { ReadOnlyNotice } from "../ReadOnlyNotice"
import { RightsSummary, type RightsRow } from "../RightsSummary"
import { RoleBadge } from "../RoleBadge"

type Role = "buero" | "werkstatt" | "leitung" | "gast"
type Ctx = { role: Role; openSlips: number }

const ROLES: { value: Role; label: string; person: string }[] = [
    { value: "buero", label: "Büro", person: "P. Mohr" },
    { value: "werkstatt", label: "Werkstatt", person: "S. Keller" },
    { value: "leitung", label: "Teamleitung", person: "A. Altmann" },
    { value: "gast", label: "Gast", person: "Revision" },
]

/* The rules of this page, in one place (B-01); a server applies the same ones to every request (B-08). */
const RULES = {
    edit: { roles: ["buero", "leitung"] } satisfies AccessRule<Ctx>,
    move: { roles: ["buero", "leitung"], known: { roles: ["werkstatt"], text: "Nur Büro und Teamleitung" } } satisfies AccessRule<Ctx>,
    impersonate: { roles: ["buero", "leitung"] } satisfies AccessRule<Ctx>,
    archive: { roles: ["buero", "leitung"], when: (c: Ctx) => (c.openSlips > 0 ? `Zuerst alle Laufzettel abschliessen (${c.openSlips} offen).` : null) } satisfies AccessRule<Ctx>,
    remove: { roles: ["leitung"] } satisfies AccessRule<Ctx>,
    prices: { roles: ["buero", "leitung"] } satisfies AccessRule<Ctx>,
}

const RIGHTS: Record<Role, RightsRow[]> = {
    buero: [{ area: "Aufträge", read: true, change: true, delete: false }, { area: "Laufzettel", read: true, change: true, delete: false }, { area: "Preise", read: true, change: true, delete: false }],
    werkstatt: [{ area: "Aufträge", read: true, change: false, delete: false }, { area: "Laufzettel", read: true, change: true, delete: false }, { area: "Preise", read: false, change: false, delete: false }],
    leitung: [{ area: "Aufträge", read: true, change: true, delete: true }, { area: "Laufzettel", read: true, change: true, delete: true }, { area: "Preise", read: true, change: true, delete: false }],
    gast: [{ area: "Aufträge", read: true, change: false, delete: false }, { area: "Laufzettel", read: true, change: false, delete: false }, { area: "Preise", read: false, change: false, delete: false }],
}

const POSITIONS = [
    { no: 1, text: "Ring 750 Gelbgold", qty: 12, price: "CHF 6’240.00" },
    { no: 2, text: "Ring 750 Weissgold", qty: 12, price: "CHF 7’080.00" },
    { no: 3, text: "Anhänger Silber 925", qty: 24, price: "CHF 5’320.00" },
]

/** A guarded button: stays focusable when disabled, so the reason is read out (B-02). */
function Action({ icon: Icon, label, disabled, ...rest }: { icon: typeof Archive; label: string; disabled?: boolean; "aria-describedby"?: string; variant?: "outline" | "destructive" }) {
    return (
        <Button
            size="sm"
            variant={rest.variant ?? "outline"}
            aria-disabled={disabled || undefined}
            aria-describedby={rest["aria-describedby"]}
            onClick={(e) => { if (disabled) e.preventDefault() }}
            className={disabled ? "cursor-not-allowed opacity-60" : undefined}
        >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
        </Button>
    )
}

/** One order page seen from four roles (B-01–B-08). */
export function RoleExample() {
    const [role, setRole] = React.useState<Role>("buero")
    const [impersonating, setImpersonating] = React.useState(false)
    const [rights, setRights] = React.useState(false)
    const [request, setRequest] = React.useState<string | null>(null)
    const [sent, setSent] = React.useState<string | null>(null)

    const effective: Role = impersonating ? "werkstatt" : role
    const ctx: Ctx = { role: effective, openSlips: 3 }
    const can = (rule: AccessRule<Ctx>) => decide(rule, ctx)
    const seesPrices = can(RULES.prices).kind === "allowed"
    const editable = can(RULES.edit).kind === "allowed"
    const me = ROLES.find((r) => r.value === effective)!

    return (
        <div className="flex min-h-full flex-col bg-surface-sunken text-fg" data-density="compact">
            {impersonating && <ImpersonationBanner as="S. Keller" role="Werkstatt" onLeave={() => setImpersonating(false)} />}
            <div className="flex flex-col gap-4 p-4">
                <section aria-label="Simulation" className="flex flex-wrap items-end gap-6 rounded-panel border border-dashed border-border-strong p-3 text-sm">
                    <RadioGroup label="Angemeldet als" variant="segments" value={role} disabled={impersonating} onChange={(v) => setRole(v as Role)} options={ROLES.map((r) => ({ value: r.value, label: r.label }))} />
                    {/* Only who supports others may see the app as them (B-06) */}
                    {decide(RULES.impersonate, { role, openSlips: 0 }).kind === "allowed" && (
                        <Switch checked={impersonating} onChange={setImpersonating} label="Als S. Keller ansehen" description="Wie der Support die App einer Person sieht." />
                    )}
                </section>

                <section aria-label="Auftrag 26100013" className="flex max-w-4xl flex-col gap-5 rounded-panel border border-border bg-surface p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col">
                            <span className="font-mono text-xs text-fg-subtle">26100013</span>
                            <h1 className="m-0 text-xl font-semibold">Ringe Herbst 2026</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <RoleBadge name={me.person} role={me.label} />
                            <Button size="sm" variant="ghost" onClick={() => setRights(true)}><ShieldQuestion className="h-3.5 w-3.5" aria-hidden="true" />Was darf ich?</Button>
                        </div>
                    </div>

                    {!editable && <ReadOnlyNotice area="Aufträge" who={["Büro", "Teamleitung"]} onRequest={() => setRequest("Aufträge ändern")} />}

                    {editable || can(RULES.move).kind !== "hidden" ? (
                        <div className="flex flex-wrap items-start gap-3">
                            {editable && <Action icon={Pencil} label="Bearbeiten" />}
                            <Guarded decision={can(RULES.move)} what="Liefertermin verschieben" onRequest={() => setRequest("Liefertermin verschieben")}>{(p) => <Action icon={CalendarClock} label="Liefertermin verschieben" {...p} />}</Guarded>
                            <Guarded decision={can(RULES.archive)}>{(p) => <Action icon={Archive} label="Archivieren" {...p} />}</Guarded>
                            <Guarded decision={can(RULES.remove)}>{(p) => <Action icon={Trash2} label="Löschen" variant="destructive" {...p} />}</Guarded>
                        </div>
                    ) : null}

                    <KeyFacts facts={[
                        { label: "Liefertermin", value: "Fr, 13.11.2026", detail: "in 15 Tagen" },
                        { label: "Menge", value: "48 Stk.", detail: "in 3 Positionen" },
                        { label: "Laufzettel", value: "3 offen", detail: "von 9" },
                        // Without the right the number is not there at all, not hidden behind stars (B-04)
                        ...(seesPrices ? [{ label: "Auftragswert", value: "CHF 18’640.00", detail: "ohne MWST" }] : []),
                    ]} />

                    <PropertyList label="Eigenschaften">
                        <Property label="Kunde">Dähler + Blaser</Property>
                        <Property label="Dringlichkeit">Normal</Property>
                        {seesPrices && <Property label="Preisliste">Händler 2026</Property>}
                        <Property label="Notiz">Steine nicht mitgiessen.</Property>
                    </PropertyList>

                    <div className="overflow-x-auto rounded-panel border border-border">
                        <table aria-label="Positionen" className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs text-fg-muted">
                                    <th scope="col" className="px-3 py-2 font-medium">#</th>
                                    <th scope="col" className="px-3 py-2 font-medium">Position</th>
                                    <th scope="col" className="px-3 py-2 text-right font-medium">Stück</th>
                                    {seesPrices && <th scope="col" className="px-3 py-2 text-right font-medium">Preis</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {POSITIONS.map((p) => (
                                    <tr key={p.no}>
                                        <td className="px-3 py-2 font-mono text-xs text-fg-subtle">{p.no}</td>
                                        <td className="px-3 py-2">{p.text}</td>
                                        <td className="px-3 py-2 text-right tabular-nums">{p.qty}</td>
                                        {seesPrices && <td className="px-3 py-2 text-right tabular-nums">{p.price}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {sent && <p role="status" className="m-0 text-sm text-fg-muted">Anfrage „{sent}“ an die Teamleitung Produktion gesendet.</p>}
                </section>
            </div>

            <Dialog open={rights} onClose={() => setRights(false)} title={impersonating ? "Rechte von S. Keller" : "Was darf ich?"} description={`${me.person} · ${me.label}`} size="lg">
                <RightsSummary role={me.label} rows={RIGHTS[effective]} />
            </Dialog>
            {request && (
                <AccessRequestDialog
                    open
                    what={request}
                    to="Teamleitung Produktion"
                    onClose={() => setRequest(null)}
                    onSend={() => { setSent(request); setRequest(null) }}
                />
            )}
        </div>
    )
}
