import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Select } from './Select'

const OPTIONS = [
    { value: 'alu', label: 'Aluminium' },
    { value: 'bronze', label: 'Bronze' },
    { value: 'stahl', label: 'Stahl' },
]

describe('Select keyboard (F-11)', () => {
    it('arrow keys move highlight without changing value', async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        render(<Select aria-label="Material" options={OPTIONS} value="alu" onChange={onChange} />)
        const trigger = screen.getByRole('combobox', { name: 'Material' })
        trigger.focus()
        await user.keyboard('{Enter}')
        await user.keyboard('{ArrowDown}{ArrowDown}')
        expect(onChange).not.toHaveBeenCalled()
        expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Stahl' }).id)
        await user.keyboard('{Enter}')
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith('stahl')
    })

    it('Escape closes and returns focus to trigger', async () => {
        const user = userEvent.setup()
        render(<Select aria-label="Material" options={OPTIONS} />)
        const trigger = screen.getByRole('combobox', { name: 'Material' })
        await user.click(trigger)
        expect(screen.getByRole('listbox')).toBeInTheDocument()
        await user.keyboard('{Escape}')
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
        expect(trigger).toHaveFocus()
    })

    it('calls onBlur when focus leaves the trigger', async () => {
        const user = userEvent.setup()
        const onBlur = vi.fn()
        render(<><Select aria-label="Material" options={OPTIONS} onBlur={onBlur} /><button>weiter</button></>)
        await user.click(screen.getByRole('combobox', { name: 'Material' }))
        await user.keyboard('{Escape}')
        await user.tab()
        expect(onBlur).toHaveBeenCalled()
    })
})
