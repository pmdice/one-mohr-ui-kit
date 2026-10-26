import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ActionMenu } from './ActionMenu'

const items = (onA = vi.fn(), onB = vi.fn()) => [
    { id: 'a', label: 'Station setzen …', onSelect: onA },
    { id: 'b', label: 'Zum Auftrag', onSelect: onB },
]

describe('ActionMenu', () => {
    it('opens with focus on the first item and moves with arrows', async () => {
        render(<ActionMenu items={items()} />)
        await userEvent.click(screen.getByRole('button', { name: 'Weitere Aktionen' }))
        expect(screen.getByRole('menuitem', { name: 'Station setzen …' })).toHaveFocus()
        await userEvent.keyboard('{ArrowDown}')
        expect(screen.getByRole('menuitem', { name: 'Zum Auftrag' })).toHaveFocus()
    })

    it('Enter selects and closes', async () => {
        const onB = vi.fn()
        render(<ActionMenu items={items(vi.fn(), onB)} />)
        screen.getByRole('button', { name: 'Weitere Aktionen' }).focus()
        await userEvent.keyboard('{Enter}{ArrowDown}{Enter}')
        expect(onB).toHaveBeenCalledTimes(1)
        expect(screen.queryByRole('menu')).toBeNull()
    })

    it('Escape closes and returns focus to the button', async () => {
        render(<ActionMenu items={items()} />)
        const button = screen.getByRole('button', { name: 'Weitere Aktionen' })
        await userEvent.click(button)
        expect(button).toHaveAttribute('aria-expanded', 'true')
        await userEvent.keyboard('{Escape}')
        expect(screen.queryByRole('menu')).toBeNull()
        expect(button).toHaveFocus()
    })
})
