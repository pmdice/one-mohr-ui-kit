import * as React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DateInput } from './DateInput'

const TODAY = '2026-10-29'

function Due({ initial = null as string | null, onChange = vi.fn(), min, max }: { initial?: string | null; onChange?: (v: string | null) => void; min?: string; max?: string }) {
    const [value, setValue] = React.useState<string | null>(initial)
    return <DateInput aria-label="Liefertermin" today={TODAY} value={value} min={min} max={max} onChange={(v) => { onChange(v); setValue(v) }} />
}

describe('DateInput', () => {
    it('reads "morgen" and shows the date with its weekday', async () => {
        const onChange = vi.fn()
        render(<Due onChange={onChange} />)
        const field = screen.getByRole('textbox', { name: 'Liefertermin' })
        await userEvent.type(field, 'morgen')
        await userEvent.tab()
        expect(onChange).toHaveBeenLastCalledWith('2026-10-30')
        expect(field).toHaveValue('30.10.2026')
        expect(field).toHaveAccessibleDescription(/Fr/)
    })

    it('says why a text is not a date', async () => {
        render(<Due />)
        const field = screen.getByRole('textbox', { name: 'Liefertermin' })
        await userEvent.type(field, '31.02.2027')
        await userEvent.tab()
        expect(field).toHaveAttribute('aria-invalid', 'true')
        expect(field).toHaveAccessibleDescription(/Diesen Tag gibt es nicht/)
    })

    it('refuses a date outside min and max', async () => {
        render(<Due min="2026-10-29" />)
        const field = screen.getByRole('textbox', { name: 'Liefertermin' })
        await userEvent.type(field, '1.10.2026')
        await userEvent.tab()
        expect(field).toHaveAccessibleDescription(/Frühestens 29.10.2026/)
    })

    it('opens the calendar on the chosen day, moves with arrows and picks with Enter', async () => {
        const onChange = vi.fn()
        render(<Due initial="2026-11-14" onChange={onChange} />)
        await userEvent.click(screen.getByRole('button', { name: 'Kalender öffnen' }))
        const grid = screen.getByRole('grid', { name: 'November 2026' })
        expect(within(grid).getByRole('gridcell', { name: /14\. November 2026/ })).toHaveFocus()
        await userEvent.keyboard('{ArrowRight}{ArrowDown}')
        expect(within(grid).getByRole('gridcell', { name: /22\. November 2026/ })).toHaveFocus()
        await userEvent.keyboard('{Enter}')
        expect(onChange).toHaveBeenLastCalledWith('2026-11-22')
        expect(screen.queryByRole('grid')).not.toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'Liefertermin' })).toHaveFocus()
    })

    it('Page Down goes to the same day next month or its last day', async () => {
        render(<Due initial="2027-01-31" />)
        await userEvent.click(screen.getByRole('button', { name: 'Kalender öffnen' }))
        await userEvent.keyboard('{PageDown}')
        expect(screen.getByRole('gridcell', { name: /28\. Februar 2027/ })).toHaveFocus()
        expect(screen.getByRole('grid', { name: 'Februar 2027' })).toBeInTheDocument()
    })

    it('starts weeks on Monday and marks today', async () => {
        render(<Due />)
        await userEvent.click(screen.getByRole('button', { name: 'Kalender öffnen' }))
        const heads = screen.getAllByRole('columnheader').map((h) => h.textContent)
        expect(heads[0]).toBe('Mo')
        expect(screen.getByRole('gridcell', { name: /29\. Oktober 2026/ })).toHaveAttribute('aria-current', 'date')
    })

    it('Escape closes the calendar and focus returns to the field', async () => {
        render(<Due />)
        await userEvent.click(screen.getByRole('button', { name: 'Kalender öffnen' }))
        await userEvent.keyboard('{Escape}')
        expect(screen.queryByRole('grid')).not.toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'Liefertermin' })).toHaveFocus()
    })

    it('days outside min and max cannot be picked', async () => {
        const onChange = vi.fn()
        render(<Due initial="2026-10-29" min="2026-10-29" onChange={onChange} />)
        await userEvent.click(screen.getByRole('button', { name: 'Kalender öffnen' }))
        const before = screen.getByRole('gridcell', { name: /28\. Oktober 2026/ })
        expect(before).toHaveAttribute('aria-disabled', 'true')
        await userEvent.click(before)
        expect(onChange).not.toHaveBeenCalled()
    })
})
