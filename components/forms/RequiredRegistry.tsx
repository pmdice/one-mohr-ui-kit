"use client"

import * as React from "react"
import { useFormContext, useWatch } from "react-hook-form"

/**
 * Tracks which required fields are currently visible inside a region (a block, a form).
 * Fields register on mount and leave on unmount, so a hidden conditional field stops
 * counting automatically. Providers nest: a field inside a sub-row also counts for its block.
 */
type Registry = {
    register: (name: string) => () => void
    names: string[]
}

const RegistryContext = React.createContext<Registry | null>(null)

export function RequiredRegistryProvider({ children }: { children: React.ReactNode }) {
    const parent = React.useContext(RegistryContext)
    // Keep register stable: the parent's context value changes on every registration,
    // and a changing register would make every field re-register in a loop.
    const parentRegister = React.useRef(parent?.register)
    React.useLayoutEffect(() => { parentRegister.current = parent?.register })
    const [counts, setCounts] = React.useState<Record<string, number>>({})

    const register = React.useCallback((name: string) => {
        setCounts((c) => ({ ...c, [name]: (c[name] ?? 0) + 1 }))
        const leaveParent = parentRegister.current?.(name)
        return () => {
            setCounts((c) => {
                const next = { ...c, [name]: (c[name] ?? 1) - 1 }
                if (next[name] <= 0) delete next[name]
                return next
            })
            leaveParent?.()
        }
    }, [])

    const value = React.useMemo(() => ({ register, names: Object.keys(counts) }), [register, counts])
    return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>
}

/** Registers a required field with the nearest region while mounted. No-op outside a provider. */
export function useRegisterRequired(name: string | undefined, required: boolean) {
    const registry = React.useContext(RegistryContext)
    const register = registry?.register
    React.useEffect(() => {
        if (!register || !name || !required) return
        return register(name)
    }, [register, name, required])
}

export function useRequiredFields(): string[] {
    return React.useContext(RegistryContext)?.names ?? []
}

export function isEmptyValue(value: unknown): boolean {
    if (value === undefined || value === null) return true
    if (typeof value === "string") return value.trim() === ""
    if (Array.isArray(value)) return value.length === 0
    if (typeof FileList !== "undefined" && value instanceof FileList) return value.length === 0
    return false
}

/** Number of visible required fields in this region that are still empty. */
export function useOpenRequiredCount(): number {
    const names = useRequiredFields()
    const { control } = useFormContext()
    const values = useWatch({ control, name: names }) as unknown[]
    return names.length === 0 ? 0 : values.filter(isEmptyValue).length
}
