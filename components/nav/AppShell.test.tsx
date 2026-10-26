import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { ClipboardList } from 'lucide-react'
import { AppShell } from './AppShell'
import { act } from '@testing-library/react'
import type { NavGroup } from './Sidebar'

const groups: NavGroup[] = [{ id: 'w', entries: [{ id: 'orders', label: 'Aufträge', href: '/a', icon: ClipboardList }] }]

function Shell() {
    return <AppShell logo="Logo" groups={groups} activeId="orders"><input aria-label="Feld" /></AppShell>
}

afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
})

describe('AppShell', () => {
    it('collapses the sidebar by button and by [, but not while typing', async () => {
        render(<Shell />)
        const toggle = screen.getByRole('button', { name: 'Seitenleiste einklappen' })
        expect(toggle).toHaveAttribute('aria-expanded', 'true')
        await userEvent.click(toggle)
        expect(screen.getByRole('button', { name: 'Seitenleiste ausklappen' })).toHaveAttribute('aria-expanded', 'false')
        await userEvent.keyboard('[[')
        expect(screen.getByRole('button', { name: 'Seitenleiste einklappen' })).toBeInTheDocument()
        await userEvent.click(screen.getByLabelText('Feld'))
        await userEvent.keyboard('[[')
        expect(screen.getByRole('button', { name: 'Seitenleiste einklappen' })).toBeInTheDocument()
    })

    it('remembers the state per device', async () => {
        const { unmount } = render(<Shell />)
        await userEvent.click(screen.getByRole('button', { name: 'Seitenleiste einklappen' }))
        unmount()
        render(<Shell />)
        expect(screen.getByRole('button', { name: 'Seitenleiste ausklappen' })).toBeInTheDocument()
    })

    it('still renders when storage is blocked', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
        render(<Shell />)
        expect(screen.getByRole('main')).toBeInTheDocument()
    })

    describe('narrow screens (drawer)', () => {
        function narrow() {
            vi.stubGlobal('matchMedia', (q: string) => ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} }))
        }
        afterEach(() => vi.unstubAllGlobals())

        it('moves focus into the drawer, keeps Tab inside, and returns it on Escape', async () => {
            narrow()
            render(<Shell />)
            const menu = await screen.findByRole('button', { name: 'Menü öffnen' })
            await userEvent.click(menu)
            const drawer = screen.getByRole('dialog', { name: 'Menü' })
            expect(drawer.contains(document.activeElement)).toBe(true)
            await userEvent.tab()
            expect(drawer.contains(document.activeElement)).toBe(true)
            await userEvent.keyboard('{Escape}')
            expect(menu).toHaveFocus()
        })

        it('closes on every link click, even to a page under the same menu entry', async () => {
            narrow()
            render(<Shell />)
            await userEvent.click(await screen.findByRole('button', { name: 'Menü öffnen' }))
            await act(async () => { screen.getByRole('link', { name: 'Aufträge' }).click() })
            expect(screen.queryByRole('dialog', { name: 'Menü' })).toBeNull()
        })
    })
})
