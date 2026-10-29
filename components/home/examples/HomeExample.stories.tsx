import type { Meta, StoryObj } from '@storybook/react'
import { HomeExample } from './HomeExample'

const meta: Meta<typeof HomeExample> = {
    title: 'Startseite/Beispiel: Startseite für drei Rollen',
    component: HomeExample,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof HomeExample>

/** Oben die Rolle wechseln: Werkstatt sieht ihre Station, Büro was zu planen ist, Teamleitung was festhängt. */
export const Standard: Story = {}
