import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'

// Components must use semantic tokens only — no raw palette colors, no pill radii.
const RAW_COLOR = /\b(?:bg|text|border|ring|fill|stroke|from|to|via|placeholder|divide|outline)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/
const PILL = /\brounded-full\b/
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

const GUARDED = [
    'atoms/Input/Input.tsx',
    'atoms/Textarea/Textarea.tsx',
    'atoms/Label/Label.tsx',
    'atoms/Button/Button.tsx',
].map((p) => path.join(ROOT, p))

function violations(file: string): string[] {
    return readFileSync(file, 'utf8')
        .split('\n')
        .filter((line) => !line.includes(ALLOW))
        .flatMap((line) => [line.match(RAW_COLOR)?.[0], line.match(PILL)?.[0]])
        .filter((m): m is string => Boolean(m))
}

describe('token guard', () => {
    it('finds the guarded files', () => {
        const all = listComponents(ROOT)
        for (const file of GUARDED) expect(all).toContain(file)
    })

    for (const file of GUARDED) {
        it(`${path.relative(ROOT, file)} uses only semantic tokens`, () => {
            expect(violations(file)).toEqual([])
        })
    }
})
