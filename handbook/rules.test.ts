import { describe, it, expect } from 'vitest'
import { FORM_RULE_GROUPS } from './forms/rules'
import { NAV_RULE_GROUPS } from './navigation/rules'
import { LIST_RULE_GROUPS } from './lists/rules'
import { STATUS_RULE_GROUPS } from './status/rules'
import { WORKSHOP_RULE_GROUPS } from './workshop/rules'
import { FOUNDATION_RULE_GROUPS } from './foundations/rules'
import { INPUT_RULE_GROUPS } from './inputs/rules'
import type { RuleGroup } from './rules.types'

const ids = (groups: RuleGroup[]) => groups.flatMap((g) => g.rules.map((r) => r.id))
const expected = (prefix: string, count = 12) => Array.from({ length: count }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`)

describe('rule index', () => {
    it('lists E-01 to E-10 once, in order, linking to input pages', () => {
        expect(ids(INPUT_RULE_GROUPS)).toEqual(expected('E', 10))
        for (const rule of INPUT_RULE_GROUPS.flatMap((g) => g.rules)) expect(rule.docsId).toMatch(/^handbuch-eingaben-e-/)
    })
    it('lists G-01 to G-10 once, in order, linking to foundation pages', () => {
        expect(ids(FOUNDATION_RULE_GROUPS)).toEqual(expected('G', 10))
        for (const rule of FOUNDATION_RULE_GROUPS.flatMap((g) => g.rules)) expect(rule.docsId).toMatch(/^handbuch-grundlagen-g-/)
    })

    it('lists N-01 to N-12 once, in order, linking to navigation pages', () => {
        expect(ids(NAV_RULE_GROUPS)).toEqual(expected('N'))
        for (const rule of NAV_RULE_GROUPS.flatMap((g) => g.rules)) expect(rule.docsId).toMatch(/^handbuch-navigation-n-/)
    })

    it('lists all twelve form rules once, linking to form pages', () => {
        expect([...ids(FORM_RULE_GROUPS)].sort()).toEqual(expected('F'))
        for (const rule of FORM_RULE_GROUPS.flatMap((g) => g.rules)) expect(rule.docsId).toMatch(/^handbuch-formulare-f-/)
    })

    it('lists L-01 to L-12 once, in order, linking to list pages', () => {
        expect(ids(LIST_RULE_GROUPS)).toEqual(expected('L'))
        for (const rule of LIST_RULE_GROUPS.flatMap((g) => g.rules)) expect(rule.docsId).toMatch(/^handbuch-listen-l-/)
    })

    it('lists S-01 to S-12 once, in order, linking to status pages', () => {
        expect(ids(STATUS_RULE_GROUPS)).toEqual(expected('S'))
        for (const rule of STATUS_RULE_GROUPS.flatMap((g) => g.rules)) expect(rule.docsId).toMatch(/^handbuch-status-s-/)
    })

    it('lists W-01 to W-08 once, in order, linking to workshop pages', () => {
        expect(ids(WORKSHOP_RULE_GROUPS)).toEqual(expected('W', 8))
        for (const rule of WORKSHOP_RULE_GROUPS.flatMap((g) => g.rules)) expect(rule.docsId).toMatch(/^handbuch-werkstatt-w-/)
    })
})
