import { readdirSync, readFileSync, statSync } from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'
import { extractPorting } from './porting-extract.mjs'
import { PORTING } from './porting.generated'
import { ALL_RULE_GROUPS } from './allRules'

const root = __dirname
const pages = readdirSync(root)
    .filter((d) => statSync(path.join(root, d)).isDirectory())
    .flatMap((d) => readdirSync(path.join(root, d)).filter((f) => /^[A-Z]-\d{2}.*\.mdx$/.test(f)).map((f) => path.join(root, d, f)))

describe('porting overview', () => {
    it('is in step with the rule pages (run node scripts/porting.mjs after changing a rule)', () => {
        const fresh = pages.map((f) => extractPorting(readFileSync(f, 'utf8'))).filter((p): p is { id: string; title: string; notes: string[] } => p !== null).sort((a, b) => a.id.localeCompare(b.id))
        expect(PORTING).toEqual(fresh)
    })

    it('covers every rule of the handbook, each with at least one note', () => {
        const ids = ALL_RULE_GROUPS.flatMap((g) => g.rules.map((r) => r.id)).sort()
        expect(PORTING.map((p) => p.id).sort()).toEqual(ids)
        for (const p of PORTING) expect(p.notes.length, p.id).toBeGreaterThan(0)
    })
})
