import { readFileSync } from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'

// Text tokens must stay readable: WCAG AA 4.5:1 against the surfaces they sit on.
const css = readFileSync(path.resolve(__dirname, '../app/tokens.css'), 'utf8')

function block(selector: string): Record<string, string> {
    const start = css.indexOf(`${selector} {`)
    const body = css.slice(start, css.indexOf('}', start))
    return Object.fromEntries(Array.from(body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi), (m) => [m[1], m[2]]))
}

function luminance(hex: string): number {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
}

describe.each([['light', ':root'], ['dark', '.dark']])('%s text contrast', (_, selector) => {
    const t = block(selector)
    for (const text of ['fg', 'fg-muted', 'fg-subtle', 'danger']) {
        for (const surface of ['surface', 'surface-sunken']) {
            it(`${text} on ${surface} meets AA`, () => {
                expect(contrast(t[text], t[surface])).toBeGreaterThanOrEqual(4.5)
            })
        }
    }
})
