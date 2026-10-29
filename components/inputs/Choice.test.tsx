import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from './Checkbox'
import { Switch } from './Switch'
import { RadioGroup } from './RadioGroup'

describe('Checkbox', () => {
    it('is a native checkbox with its label and description', async () => {
        const onChange = vi.fn()
        render(<Checkbox checked={false} onChange={onChange} label="Lieferschein mitdrucken" description="Wird mit dem Auftrag ausgedruckt." />)
        const box = screen.getByRole('checkbox', { name: 'Lieferschein mitdrucken' })
        expect(box).toHaveAccessibleDescription('Wird mit dem Auftrag ausgedruckt.')
        await userEvent.click(screen.getByText('Lieferschein mitdrucken'))
        expect(onChange).toHaveBeenCalledWith(true)
    })

    it('shows "mixed" as indeterminate and checks all from there', async () => {
        const onChange = vi.fn()
        render(<Checkbox checked="mixed" onChange={onChange} aria-label="Alle auswählen" />)
        const box = screen.getByRole('checkbox', { name: 'Alle auswählen' }) as HTMLInputElement
        expect(box.indeterminate).toBe(true)
        await userEvent.click(box)
        expect(onChange).toHaveBeenCalledWith(true)
    })
})

describe('Switch', () => {
    it('is a switch that says its state and flips with click and Space', async () => {
        function Harness() {
            const [on, setOn] = React.useState(false)
            return <Switch checked={on} onChange={setOn} label="Ton" description="Spielt bei jedem Scan." />
        }
        render(<Harness />)
        const sw = screen.getByRole('switch', { name: 'Ton' })
        expect(sw).toHaveAttribute('aria-checked', 'false')
        expect(sw).toHaveAccessibleDescription('Spielt bei jedem Scan.')
        await userEvent.click(sw)
        expect(sw).toHaveAttribute('aria-checked', 'true')
        await userEvent.keyboard(' ')
        expect(sw).toHaveAttribute('aria-checked', 'false')
    })
})

describe('RadioGroup', () => {
    const OPTIONS = [
        { value: 'normal', label: 'Normal' },
        { value: 'dringend', label: 'Dringend', description: 'Vor allen anderen' },
        { value: 'warten', label: 'Warten' },
    ]
    function Harness({ variant = 'list' as 'list' | 'segments', onChange = vi.fn() }) {
        const [value, setValue] = React.useState('normal')
        return <RadioGroup label="Dringlichkeit" variant={variant} options={OPTIONS} value={value} onChange={(v) => { onChange(v); setValue(v) }} />
    }

    it('is a labelled radio group with one tab stop on the chosen option', () => {
        render(<Harness />)
        expect(screen.getByRole('radiogroup', { name: 'Dringlichkeit' })).toBeInTheDocument()
        expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked()
        expect(screen.getByRole('radio', { name: /Dringend/ })).toHaveAccessibleDescription('Vor allen anderen')
    })

    it('arrows move and choose, wrapping around', async () => {
        const onChange = vi.fn()
        render(<Harness onChange={onChange} />)
        await userEvent.click(screen.getByRole('radio', { name: 'Normal' }))
        await userEvent.keyboard('{ArrowDown}')
        expect(screen.getByRole('radio', { name: /Dringend/ })).toBeChecked()
        expect(screen.getByRole('radio', { name: /Dringend/ })).toHaveFocus()
        await userEvent.keyboard('{ArrowUp}{ArrowUp}')
        expect(screen.getByRole('radio', { name: 'Warten' })).toBeChecked()
        expect(onChange).toHaveBeenLastCalledWith('warten')
    })

    it('segments behave the same', async () => {
        render(<Harness variant="segments" />)
        await userEvent.click(screen.getByRole('radio', { name: 'Warten' }))
        expect(screen.getByRole('radio', { name: 'Warten' })).toBeChecked()
    })
})

describe('review fixes: choice', () => {
    it('a disabled radio group cannot be changed by keyboard', async () => {
        const onChange = vi.fn()
        render(<RadioGroup label="Art" disabled value="a" onChange={onChange} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />)
        await userEvent.tab()
        await userEvent.keyboard('{ArrowDown}')
        expect(onChange).not.toHaveBeenCalled()
    })

    it('stays indeterminate when the parent keeps it mixed after a click', async () => {
        render(<Checkbox checked="mixed" onChange={() => {}} aria-label="Alle" />)
        const box = screen.getByRole('checkbox', { name: 'Alle' }) as HTMLInputElement
        await userEvent.click(box)
        expect(box.indeterminate).toBe(true)
        expect(box).not.toHaveAttribute('aria-checked')
    })
})
