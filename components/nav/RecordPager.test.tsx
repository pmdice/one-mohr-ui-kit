import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { RecordPager } from './RecordPager'

const ids = ['a', 'b', 'c', 'd']
const hrefFor = (id: string) => `/z/${id}`

describe('RecordPager', () => {
    it('shows the position and links to the neighbours', () => {
        render(<RecordPager ids={ids} currentId="b" hrefFor={hrefFor} label="im Auftrag" />)
        expect(screen.getByText('2/4 im Auftrag')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Vorheriges' })).toHaveAttribute('href', '/z/a')
        expect(screen.getByRole('link', { name: 'Nächstes' })).toHaveAttribute('href', '/z/c')
    })

    it('disables the edge link', () => {
        render(<RecordPager ids={ids} currentId="a" hrefFor={hrefFor} label="im Auftrag" />)
        const prev = screen.getByRole('link', { name: 'Vorheriges' })
        expect(prev).toHaveAttribute('aria-disabled', 'true')
        expect(prev).not.toHaveAttribute('href')
    })

    it('renders nothing when the record is not in the set, or the set is too small', () => {
        const { container, rerender } = render(<RecordPager ids={ids} currentId="x" hrefFor={hrefFor} label="· Offen" />)
        expect(container).toBeEmptyDOMElement()
        rerender(<RecordPager ids={['a']} currentId="a" hrefFor={hrefFor} label="· Offen" />)
        expect(container).toBeEmptyDOMElement()
    })

    it('J and K go to next and previous, but not while typing', async () => {
        const onNavigate = vi.fn()
        render(<><input aria-label="Feld" /><RecordPager ids={ids} currentId="b" hrefFor={hrefFor} label="im Auftrag" onNavigate={onNavigate} /></>)
        await userEvent.keyboard('j')
        expect(onNavigate).toHaveBeenLastCalledWith('/z/c')
        await userEvent.keyboard('k')
        expect(onNavigate).toHaveBeenLastCalledWith('/z/a')
        await userEvent.click(screen.getByLabelText('Feld'))
        await userEvent.keyboard('j')
        expect(onNavigate).toHaveBeenCalledTimes(2)
    })
})
