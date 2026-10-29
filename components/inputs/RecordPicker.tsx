"use client"

import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { Combobox, type ComboboxOption } from "@/components/molecules/Combobox/Combobox"
import { NavLink } from "@/components/nav/NavLink"

type ComboboxProps = React.ComponentProps<typeof Combobox>

/**
 * A field that points to another record (E-09): search by number and name, a second line to tell similar ones
 * apart, the recently used first, "… neu anlegen" with the typed text, and the chosen record as a link (N-08).
 */
export function RecordPicker({ href, ...props }: ComboboxProps & {
    /** Where the chosen record lives; without it there is no link. */
    href?: (value: string) => string
}) {
    const { value, valueLabel } = props
    const options = "options" in props ? (props.options as ComboboxOption[] | undefined) : undefined
    const label = value === null || value === undefined ? null : options?.find((o) => o.value === value)?.label ?? valueLabel ?? value
    return (
        <div className="flex w-full items-center gap-1">
            <Combobox {...props} />
            {href && value && (
                <NavLink
                    href={href(value)}
                    aria-label={`${label} öffnen`}
                    title={`${label} öffnen`}
                    className="flex h-control w-[var(--control-h)] shrink-0 items-center justify-center rounded-control text-fg-muted hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </NavLink>
            )}
        </div>
    )
}
