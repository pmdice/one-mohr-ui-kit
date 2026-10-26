/** The five kinds of status; every concrete status belongs to one and borrows its shape (S-01). */
export type StatusCategory = "planned" | "active" | "waiting" | "done" | "canceled"

export type StatusDef = { id: string; label: string; category: StatusCategory }

export type Transition<C = unknown> = {
    from: string
    to: string
    /** What the button says: "Fertig melden", not "Fertig". */
    verb: string
    /** Final or far-reaching: ask first (S-06). */
    confirm?: boolean
    reason?: "required" | "optional"
    /** The usual next step, shown as a button (S-05). */
    primary?: boolean
    /** Why it is not possible right now, or null when it is. */
    when?: (ctx: C) => string | null
}

export type Workflow<C = unknown> = { statuses: StatusDef[]; transitions: Transition<C>[] }

export function statusOf<C>(workflow: Workflow<C>, id: string): StatusDef {
    const status = workflow.statuses.find((s) => s.id === id)
    if (!status) throw new Error(`Unknown status "${id}"`)
    return status
}

/** The steps the workflow allows from here (S-05); impossible ones are left out, blocked ones say why. */
export function allowedTransitions<C>(workflow: Workflow<C>, from: string, ctx: C): { transition: Transition<C>; blocked: string | null }[] {
    return workflow.transitions
        .filter((t) => t.from === from)
        .map((transition) => ({ transition, blocked: transition.when?.(ctx) ?? null }))
}

/** A parent's status from its parts (S-04). Canceled parts count as settled and do not start the work. */
export function deriveStatus(parts: StatusCategory[]): { category: StatusCategory; done: number; total: number } {
    const total = parts.length
    const done = parts.filter((c) => c === "done" || c === "canceled").length
    const all = (c: StatusCategory) => total > 0 && parts.every((p) => p === c)
    let category: StatusCategory = "active"
    const live = parts.filter((p) => p !== "canceled")
    if (all("canceled")) category = "canceled"
    else if (live.every((p) => p === "planned")) category = "planned"
    else if (done === total && parts.includes("done")) category = "done"
    return { category, done, total }
}
