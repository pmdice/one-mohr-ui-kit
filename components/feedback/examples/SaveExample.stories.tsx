import type { Meta, StoryObj } from '@storybook/react'
import { SaveExample } from './SaveExample'

const meta: Meta<typeof SaveExample> = {
    title: 'Speichern/Beispiel: Auftrag bearbeiten',
    component: SaveExample,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof SaveExample>

/** Oben wählen, wie das nächste Speichern ausgeht; dann ein Feld ändern und speichern. */
export const Standard: Story = {}
