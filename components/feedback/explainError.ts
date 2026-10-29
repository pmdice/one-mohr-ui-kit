/*
 * Turns whatever went wrong into one sentence and the next step (R-07). Never shows codes, exceptions or
 * raw server text; an unexpected error gets a short code the person can give to support.
 */

export type ErrorInput = Error | { status?: number; code?: string; fields?: Record<string, string>; offline?: boolean } | unknown

export interface Explained {
    message: string
    /** What the interface offers next. */
    action?: "retry" | "login" | "reload"
    /** Validation messages per field, shown at the fields (F-03). */
    fields?: Record<string, string>
    /** For support, shown with a copy button. */
    code?: string
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const newCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("")

export function explainError(error: ErrorInput): Explained {
    const e = (error && typeof error === "object" ? error : {}) as { status?: number; code?: string; fields?: Record<string, string>; offline?: boolean }
    const status = e.status
    if (e.offline || status === 0) return { message: "Keine Verbindung. Ihre Eingaben sind noch da; erneut versuchen, sobald die Verbindung zurück ist.", action: "retry" }
    if (status === 401 || status === 419) return { message: "Ihre Sitzung ist abgelaufen. Melden Sie sich an; Ihre Eingaben bleiben erhalten.", action: "login" }
    if (status === 403) return { message: "Dafür fehlt Ihnen die Berechtigung. Eine Person mit Rechten für diesen Bereich kann das ändern." }
    if (status === 404) return { message: "Diesen Datensatz gibt es nicht mehr. Er wurde vermutlich gelöscht.", action: "reload" }
    if (status === 409) return { message: "Jemand anderes hat das inzwischen geändert." }
    if (status === 422) return { message: "Bitte die markierten Felder prüfen.", fields: e.fields ?? {} }
    if (status === 429) return { message: "Zu viele Anfragen. In einer Minute erneut versuchen.", action: "retry" }
    return { message: "Unerwarteter Fehler. Erneut versuchen; wenn es wieder passiert, den Code an den Support geben.", action: "retry", code: e.code ?? newCode() }
}
