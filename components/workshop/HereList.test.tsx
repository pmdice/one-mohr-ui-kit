import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { HereList } from './HereList'

const H = 3_600_000
const now = 10 * H

describe('HereList', () => {
    it('lists the longest first with time and the usual-time warning, and opens one', async () => {
        const onSelect = vi.fn()
        render(<HereList station="Guss" now={now} onSelect={onSelect} items={[
            { id: 'a', number: '26100013 – 3/4', since: now - H, norm: 4 * H },
            { id: 'b', number: '26100013 – 1/4', since: now - 5 * H, norm: 4 * H },
        ]} />)
        const list = screen.getByRole('list', { name: 'Jetzt an Guss (2)' })
        const buttons = within(list).getAllByRole('button')
        expect(buttons[0]).toHaveTextContent('26100013 – 1/4')
        expect(buttons[0]).toHaveTextContent('5 h')
        expect(buttons[0]).toHaveTextContent('Länger als üblich (Richtzeit 4 h)')
        expect(buttons[1]).not.toHaveTextContent('Länger als üblich')
        await userEvent.click(buttons[1])
        expect(onSelect).toHaveBeenCalledWith('a')
    })

    it('says when nothing is here', () => {
        render(<HereList station="Guss" now={now} onSelect={vi.fn()} items={[]} />)
        expect(screen.getByText('Nichts eingescannt')).toBeInTheDocument()
    })
})
