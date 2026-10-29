import { readdirSync, statSync } from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'
import { CATALOG } from './catalog'
import { ALL_RULE_GROUPS } from './allRules'

const ROOT = path.resolve(__dirname, '..')

function componentFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
        const full = path.join(dir, entry)
        if (statSync(full).isDirectory()) return entry === 'examples' || entry === 'providers' ? [] : componentFiles(full)
        return full.endsWith('.tsx') && !/\.(stories|test)\.tsx$/.test(full) ? [path.relative(ROOT, full)] : []
    })
}

describe('component catalog', () => {
    it('lists every component file exactly once', () => {
        const files = componentFiles(path.join(ROOT, 'components')).sort()
        expect(CATALOG.map((c) => c.path).sort()).toEqual(files)
    })

    it('only refers to rules that exist', () => {
        const known = new Set(ALL_RULE_GROUPS.flatMap((g) => g.rules.map((r) => r.id)))
        for (const entry of CATALOG) for (const id of entry.rules) expect(known, `${entry.name} → ${id}`).toContain(id)
    })

    it('says what each component is for in a sentence', () => {
        for (const entry of CATALOG) expect(entry.purpose, entry.name).toMatch(/\.$/)
    })
})
