import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { RoleExample } from './RoleExample'

const as = async (role: string) => userEvent.click(screen.getByRole('radio', { name: role }))
const page = () => screen.getByRole('region', { name: 'Auftrag 26100013' })

describe('Beispiel: Rechte', () => {
    it('Werkstatt: no prices anywhere, no delete, and what it must know is explained with a way to ask', async () => {
        render(<RoleExample />)
        await as('Werkstatt')
        expect(page().textContent).not.toMatch(/CHF|Preis|Auftragswert/)
        expect(within(page()).queryByRole('button', { name: 'Löschen' })).toBeNull()
        const move = within(page()).getByRole('button', { name: 'Liefertermin verschieben' })
        expect(move).toHaveAttribute('aria-disabled', 'true')
        expect(move).toHaveAccessibleDescription('Nur Büro und Teamleitung')
        await userEvent.click(within(page()).getByRole('button', { name: 'Zugriff anfragen: Liefertermin verschieben' }))
        expect(screen.getByRole('dialog', { name: 'Zugriff anfragen: Liefertermin verschieben' })).toBeInTheDocument()
    })

    it('Büro: archiving waits for the slips, with the reason', async () => {
        render(<RoleExample />)
        await as('Büro')
        expect(within(page()).getByRole('button', { name: 'Archivieren' })).toHaveAccessibleDescription('Zuerst alle Laufzettel abschliessen (3 offen).')
        expect(within(page()).getByText('CHF 18’640.00')).toBeInTheDocument()
    })

    it('Teamleitung: may delete', async () => {
        render(<RoleExample />)
        await as('Teamleitung')
        expect(within(page()).getByRole('button', { name: 'Löschen' })).toBeInTheDocument()
    })

    it('Gast: reads values as text, without form remains, with a note and a way to ask', async () => {
        render(<RoleExample />)
        await as('Gast')
        expect(within(page()).getByRole('status')).toHaveTextContent('Sie können Aufträge nur lesen.')
        expect(page().querySelectorAll('input, textarea, select')).toHaveLength(0)
        expect(within(page()).queryByRole('button', { name: /Bearbeiten/ })).toBeNull()
    })

    it('"Was darf ich?" shows the rights of the role', async () => {
        render(<RoleExample />)
        await as('Werkstatt')
        await userEvent.click(screen.getByRole('button', { name: 'Was darf ich?' }))
        const table = screen.getByRole('table', { name: 'Was Werkstatt darf' })
        expect(within(table).getByRole('row', { name: /Laufzettel/ })).toHaveTextContent('Ändern: ja')
    })

    it('seeing it as someone else shows the band and leads back', async () => {
        render(<RoleExample />)
        await userEvent.click(screen.getByRole('switch', { name: 'Als S. Keller ansehen' }))
        expect(screen.getByRole('region', { name: 'Ansicht als S. Keller' })).toHaveTextContent('Sie sehen die App als S. Keller (Werkstatt).')
        await userEvent.click(screen.getByRole('button', { name: 'Zurück zu meinem Konto' }))
        expect(screen.queryByRole('region', { name: 'Ansicht als S. Keller' })).toBeNull()
    })
})
