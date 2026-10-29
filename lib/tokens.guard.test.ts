import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'

// Components must use semantic tokens only — no raw palette colors, no pill radii.
const RAW_COLOR = /\b(?:bg|text|border|ring|fill|stroke|from|to|via|placeholder|divide|outline)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/
const PILL = /\brounded-full\b/
// G-04: only the named type steps; G-02: one overlay shadow, no heavier ones
const ARBITRARY_TEXT = /\btext-\[\d+(?:\.\d+)?(?:px|rem)\]/
const SHADOW_2XL = /\bshadow-2xl\b/
const ALLOW = 'token-guard: allow'

const ROOT = path.resolve(__dirname, '../components')

function listComponents(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
        const full = path.join(dir, entry)
        if (statSync(full).isDirectory()) return listComponents(full)
        if (!full.endsWith('.tsx') || /\.(stories|test)\.tsx$/.test(full)) return []
        return [full]
    })
}

const GUARDED = listComponents(ROOT)

function violations(file: string): string[] {
    return readFileSync(file, 'utf8')
        .split('\n')
        .filter((line) => !line.includes(ALLOW))
        .flatMap((line) => [RAW_COLOR, PILL, ARBITRARY_TEXT, SHADOW_2XL].map((re) => line.match(re)?.[0]))
        .filter((m): m is string => Boolean(m))
}

describe('token guard', () => {
    it('tokens.css defines motion and overlay tokens in both themes', () => {
        const css = readFileSync(path.resolve(__dirname, '../app/tokens.css'), 'utf8')
        const block = (selector: string) => css.slice(css.indexOf(selector + ' {'), css.indexOf('}', css.indexOf(selector + ' {')))
        for (const name of ['--dur-fast', '--dur-base', '--ease-out', '--shadow-overlay']) expect(block(':root')).toContain(name)
        expect(block('.dark')).toContain('--shadow-overlay')
    })

    it('finds component files', () => {
        expect(GUARDED.length).toBeGreaterThan(10)
    })

    for (const file of GUARDED) {
        it(`${path.relative(ROOT, file)} uses only semantic tokens`, () => {
            expect(violations(file)).toEqual([])
        })
    }
})
