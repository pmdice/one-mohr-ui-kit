import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useShortcut } from './shortcuts'
import { LinkProvider, NavLink } from './NavLink'

function Fixture({ onJ, onModK, enabled }: { onJ: () => void; onModK?: () => void; enabled?: boolean }) {
    useShortcut('j', onJ, { enabled })
    useShortcut('k', onModK ?? (() => {}), { mod: true })
    return (
        <div>
            <input aria-label="Feld" />
            <textarea aria-label="Text" />
            <div contentEditable aria-label="Editor" suppressContentEditableWarning tabIndex={0}>x</div>
            <input role="combobox" aria-label="Auswahl" aria-expanded={false} aria-controls="x" />
            <button>Knopf</button>
        </div>
    )
}

describe('useShortcut', () => {
    it('fires for a plain key outside editable elements', async () => {
        const onJ = vi.fn()
        render(<Fixture onJ={onJ} />)
        await userEvent.click(screen.getByRole('button', { name: 'Knopf' }))
        await userEvent.keyboard('j')
        expect(onJ).toHaveBeenCalledTimes(1)
    })

    it.each(['Feld', 'Text', 'Editor', 'Auswahl'])('does not fire while typing in %s', async (name) => {
        const onJ = vi.fn()
        render(<Fixture onJ={onJ} />)
        await userEvent.click(screen.getByLabelText(name))
        await userEvent.keyboard('j')
        expect(onJ).not.toHaveBeenCalled()
    })

    it('does not fire with Alt held', async () => {
        const onJ = vi.fn()
        render(<Fixture onJ={onJ} />)
        await userEvent.keyboard('{Alt>}j{/Alt}')
        expect(onJ).not.toHaveBeenCalled()
    })

    it('mod shortcuts need ⌘ or Ctrl', async () => {
        const onModK = vi.fn()
        render(<Fixture onJ={vi.fn()} onModK={onModK} />)
        await userEvent.keyboard('k')
        expect(onModK).not.toHaveBeenCalled()
        await userEvent.keyboard('{Meta>}k{/Meta}')
        await userEvent.keyboard('{Control>}k{/Control}')
        expect(onModK).toHaveBeenCalledTimes(2)
    })

    it('accepts symbol keys typed with AltGr (Swiss and German layouts)', async () => {
        const onBracket = vi.fn()
        function Bracket() { useShortcut('[', onBracket); return <button>B</button> }
        render(<Bracket />)
        await userEvent.keyboard('{Control>}{Alt>}[[{/Alt}{/Control}')
        await userEvent.keyboard('{Alt>}[[{/Alt}')
        expect(onBracket).toHaveBeenCalledTimes(2)
    })

    it('does not fire inside a modal dialog, menu or listbox', async () => {
        const onJ = vi.fn()
        function InDialog() {
            useShortcut('j', onJ)
            return (
                <>
                    <div role="dialog" aria-modal="true"><button>Im Dialog</button></div>
                    <div role="menu"><button role="menuitem">Eintrag</button></div>
                    <div role="listbox" tabIndex={0} aria-label="Liste" />
                </>
            )
        }
        render(<InDialog />)
        await userEvent.click(screen.getByRole('button', { name: 'Im Dialog' }))
        await userEvent.keyboard('j')
        screen.getByRole('menuitem').focus()
        await userEvent.keyboard('j')
        screen.getByRole('listbox').focus()
        await userEvent.keyboard('j')
        expect(onJ).not.toHaveBeenCalled()
    })

    it('does not fire while a modal dialog is open, even with focus elsewhere', async () => {
        const onJ = vi.fn()
        function Open() { useShortcut('j', onJ); return <><div role="dialog" aria-modal="true" /><button>Draussen</button></> }
        render(<Open />)
        await userEvent.click(screen.getByRole('button', { name: 'Draussen' }))
        await userEvent.keyboard('j')
        expect(onJ).not.toHaveBeenCalled()
    })

    it('never fires when disabled', async () => {
        const onJ = vi.fn()
        render(<Fixture onJ={onJ} enabled={false} />)
        await userEvent.keyboard('j')
        expect(onJ).not.toHaveBeenCalled()
    })
})

describe('NavLink', () => {
    it('renders a plain anchor without provider', () => {
        render(<NavLink href="/a">A</NavLink>)
        expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('href', '/a')
    })

    it('uses the link component from the provider', () => {
        const Custom = ({ href, children }: { href: string; children?: React.ReactNode }) => <a data-testid="custom" href={href}>{children}</a>
        render(<LinkProvider component={Custom}><NavLink href="/b">B</NavLink></LinkProvider>)
        expect(screen.getByTestId('custom')).toHaveAttribute('href', '/b')
    })

    it('hands the ref to the provider component', () => {
        const Custom = ({ ref, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; ref?: React.Ref<HTMLAnchorElement> }) => <a ref={ref} {...props} />
        const ref = React.createRef<HTMLAnchorElement>()
        render(<LinkProvider component={Custom}><NavLink ref={ref} href="/c">C</NavLink></LinkProvider>)
        expect(ref.current).toBe(screen.getByRole('link', { name: 'C' }))
    })
})
