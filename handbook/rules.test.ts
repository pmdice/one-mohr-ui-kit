import { describe, it, expect } from 'vitest'
import { FORM_RULE_GROUPS } from './forms/rules'
import { NAV_RULE_GROUPS } from './navigation/rules'
import type { RuleGroup } from './rules.types'

const ids = (groups: RuleGroup[]) => groups.flatMap((g) => g.rules.map((r) => r.id))
const expected = (prefix: string) => Array.from({ length: 12 }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`)

describe('rule index', () => {
    it('lists N-01 to N-12 once, in order, linking to navigation pages', () => {
        expect(ids(NAV_RULE_GROUPS)).toEqual(expected('N'))
        for (const rule of NAV_RULE_GROUPS.flatMap((g) => g.rules)) expect(rule.docsId).toMatch(/^handbuch-navigation-n-/)
    })

    it('lists all twelve form rules once, linking to form pages', () => {
        expect([...ids(FORM_RULE_GROUPS)].sort()).toEqual(expected('F'))
        for (const rule of FORM_RULE_GROUPS.flatMap((g) => g.rules)) expect(rule.docsId).toMatch(/^handbuch-formulare-f-/)
    })
})
