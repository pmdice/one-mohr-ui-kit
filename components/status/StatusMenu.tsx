"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { ActionMenu } from "@/components/table/ActionMenu"
import { useShortcut } from "@/components/nav/shortcuts"
import { StatusBadge } from "./StatusBadge"
import { allowedTransitions, statusOf, type Transition, type Workflow } from "./workflow"

/** The current status as a button; its menu lists only the steps the workflow allows from here (S-05). */
export function StatusMenu<C>({ workflow, current, ctx, onSelect, shortcut = true, className }: {
    workflow: Workflow<C>
    current: string
    ctx: C
    onSelect: (transition: Transition<C>) => void
    /** Opens with S. */
    shortcut?: boolean
    className?: string
}) {
    const status = statusOf(workflow, current)
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const allowed = allowedTransitions(workflow, current, ctx)
    useShortcut("s", () => buttonRef.current?.click(), { enabled: shortcut && allowed.length > 0 })

    if (allowed.length === 0) return <StatusBadge status={status} className={className} />
    return (
        <ActionMenu
            className={className}
            buttonRef={buttonRef}
            label={`Status ändern: ${status.label}`}
            menuLabel="Status ändern"
            trigger={<><StatusBadge status={status} /><ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /></>}
            items={allowed.map(({ transition, blocked }) => ({
                id: `${transition.from}-${transition.to}`,
                label: transition.verb,
                disabled: !!blocked,
                hint: blocked ?? undefined,
                onSelect: () => onSelect(transition),
            }))}
        />
    )
}
