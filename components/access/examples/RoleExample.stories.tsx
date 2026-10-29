import type { Meta, StoryObj } from '@storybook/react'
import { RoleExample } from './RoleExample'

const meta: Meta<typeof RoleExample> = {
    title: 'Rechte/Beispiel: Auftrag aus vier Rollen',
    component: RoleExample,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof RoleExample>

/** Oben die Rolle wechseln: dieselbe Seite als Büro, Werkstatt, Teamleitung und Gast. */
export const Standard: Story = {}
