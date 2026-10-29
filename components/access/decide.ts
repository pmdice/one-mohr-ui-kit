/*
 * Hide, disable with a reason, or allow (B-01). The interface only mirrors this; the server checks every
 * request itself (B-08).
 */

export interface AccessRule<C> {
    /** Roles that may do this at all. */
    roles: string[]
    /** For other roles who must know it exists: who may ("Nur Teamleitung"). Without it, they do not see it. */
    known?: string
    /** Why not right now, for roles that may (S-05): a sentence, or null when it is possible. */
    when?: (ctx: C) => string | null
}

export type Decision =
    | { kind: "allowed" }
    | { kind: "disabled"; reason: string; requestable?: boolean }
    | { kind: "hidden" }

export function decide<C extends { role: string }>(rule: AccessRule<C>, ctx: C): Decision {
    if (!rule.roles.includes(ctx.role)) return rule.known ? { kind: "disabled", reason: rule.known, requestable: true } : { kind: "hidden" }
    const reason = rule.when?.(ctx)
    return reason ? { kind: "disabled", reason } : { kind: "allowed" }
}
