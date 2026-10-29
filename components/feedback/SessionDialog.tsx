"use client"

import * as React from "react"
import { Button } from "@/components/atoms/Button/Button"
import { Input } from "@/components/atoms/Input/Input"
import { Dialog } from "@/components/molecules/Dialog/Dialog"

/**
 * The session ran out while working (R-09): log in over the page, without leaving it; afterwards the
 * interrupted save runs again (the caller does that in `onDone`). Nothing typed is lost.
 */
export function SessionDialog({ open, user, onLogin, onDone }: {
    open: boolean
    user: string
    /** Rejects with an Error whose message is shown at the field. */
    onLogin: (password: string) => Promise<void>
    onDone: () => void
}) {
    const [password, setPassword] = React.useState("")
    const [error, setError] = React.useState<string | null>(null)
    const [busy, setBusy] = React.useState(false)
    const id = React.useId()

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (busy) return
        setBusy(true)
        setError(null)
        try {
            await onLogin(password)
            setPassword("")
            onDone()
        } catch (err) {
            setError(err instanceof Error && err.message ? err.message : "Anmelden hat nicht geklappt. Erneut versuchen.")
        } finally {
            setBusy(false)
        }
    }

    return (
        // Closing without logging in is not offered: the page behind would only fail again
        <Dialog open={open} onClose={() => {}} hideClose title="Sitzung abgelaufen" description={`Melden Sie sich wieder an, ${user}. Ihre Eingaben bleiben erhalten; danach wird gespeichert.`}>
            <form onSubmit={submit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <label htmlFor={`${id}-pw`} className="text-sm font-medium text-fg">Passwort</label>
                    <Input
                        id={`${id}-pw`}
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? `${id}-error` : undefined}
                    />
                    {error && <p id={`${id}-error`} className="m-0 text-xs text-danger">{error}</p>}
                </div>
                <div className="flex justify-end"><Button type="submit" busy={busy}>Anmelden</Button></div>
            </form>
        </Dialog>
    )
}
