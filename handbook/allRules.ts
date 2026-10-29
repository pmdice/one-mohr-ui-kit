import type { RuleGroup } from "./rules.types"
import { FOUNDATION_RULE_GROUPS } from "./foundations/rules"
import { FORM_RULE_GROUPS } from "./forms/rules"
import { INPUT_RULE_GROUPS } from "./inputs/rules"
import { NAV_RULE_GROUPS } from "./navigation/rules"
import { RECORD_RULE_GROUPS } from "./records/rules"
import { LIST_RULE_GROUPS } from "./lists/rules"
import { STATUS_RULE_GROUPS } from "./status/rules"
import { WORKSHOP_RULE_GROUPS } from "./workshop/rules"

/** The handbook's parts in reading order, each with its rule prefix. */
export const PARTS: { prefix: string; title: string; groups: RuleGroup[] }[] = [
    { prefix: "G", title: "Grundlagen", groups: FOUNDATION_RULE_GROUPS },
    { prefix: "F", title: "Formulare", groups: FORM_RULE_GROUPS },
    { prefix: "E", title: "Eingaben", groups: INPUT_RULE_GROUPS },
    { prefix: "N", title: "Navigation & App-Rahmen", groups: NAV_RULE_GROUPS },
    { prefix: "L", title: "Listen & Tabellen", groups: LIST_RULE_GROUPS },
    { prefix: "D", title: "Datensatz-Seite", groups: RECORD_RULE_GROUPS },
    { prefix: "S", title: "Status & Lebenszyklus", groups: STATUS_RULE_GROUPS },
    { prefix: "W", title: "Werkstatt-Ansicht", groups: WORKSHOP_RULE_GROUPS },
]

export const ALL_RULE_GROUPS: RuleGroup[] = PARTS.flatMap((p) => p.groups)
