import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Tabs } from './Tabs'

const TABS = [
    { id: 'a', label: 'Eins', content: <p>Inhalt eins</p> },
    { id: 'b', label: 'Zwei', content: <p>Inhalt zwei</p> },
]

describe('Tabs', () => {
    it('switches content within the page and marks the selected tab', async () => {
        render(<Tabs tabs={TABS} />)
        expect(screen.getByRole('tab', { name: 'Eins' })).toHaveAttribute('aria-selected', 'true')
        await userEvent.click(screen.getByRole('tab', { name: 'Zwei' }))
        expect(screen.getByRole('tab', { name: 'Zwei' })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('tabpanel')).toHaveTextContent('Inhalt zwei')
    })
})
