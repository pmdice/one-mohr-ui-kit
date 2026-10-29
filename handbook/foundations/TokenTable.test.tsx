import { readFileSync } from 'fs'
import path from 'path'
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TokenTable } from './TokenTable'
import { TOKEN_GROUPS } from './tokens'

const css = readFileSync(path.resolve(__dirname, '../../app/tokens.css'), 'utf8')
const defined = [...new Set([...css.matchAll(/^\s+(--[a-z0-9-]+):/gm)].map((m) => m[1]))]

describe('token list', () => {
    it('names every variable in tokens.css exactly once, with a role', () => {
        const listed = TOKEN_GROUPS.flatMap((g) => g.tokens.map((t) => t.name))
        expect([...listed].sort()).toEqual([...defined].sort())
        for (const t of TOKEN_GROUPS.flatMap((g) => g.tokens)) expect(t.role).toMatch(/\.$/)
    })
})

describe('TokenTable', () => {
    const colors = TOKEN_GROUPS.find((g) => g.kind === 'color')!

    it('shows name, role and the light and dark value read from the page', () => {
        const read = (el: Element, name: string) => (el.closest('.dark') ? `dark${name}` : `light${name}`)
        render(<TokenTable group={colors} read={read} />)
        const row = screen.getByRole('row', { name: new RegExp(colors.tokens[0].name) })
        expect(within(row).getByText(colors.tokens[0].role)).toBeInTheDocument()
        expect(within(row).getByText(`light${colors.tokens[0].name}`)).toBeInTheDocument()
        expect(within(row).getByText(`dark${colors.tokens[0].name}`)).toBeInTheDocument()
    })

    it('reads the light column in a light scope even when the page is dark', () => {
        const read = (el: Element, name: string) => (el.closest('.light') ? `light${name}` : el.closest('.dark') ? `dark${name}` : `none${name}`)
        render(<div className="dark"><TokenTable group={colors} read={read} /></div>)
        const row = screen.getByRole('row', { name: new RegExp(colors.tokens[0].name) })
        expect(within(row).getByText(`light${colors.tokens[0].name}`)).toBeInTheDocument()
        expect(css).toMatch(/:root,\s*\.light\s*\{/)
    })

    it('shows a dash when a value is missing', () => {
        render(<TokenTable group={colors} read={() => ''} />)
        const row = screen.getByRole('row', { name: new RegExp(colors.tokens[0].name) })
        expect(within(row).getAllByText('—').length).toBe(2)
    })
})
