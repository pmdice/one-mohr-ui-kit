import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { ClipboardList } from 'lucide-react'
import { AppShell } from './AppShell'
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
})
