import type { Meta, StoryObj } from '@storybook/react'
import { PositionEntry } from './PositionEntry'

const meta: Meta<typeof PositionEntry> = {
    title: 'Eingaben/Beispiel: Position erfassen',
    component: PositionEntry,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof PositionEntry>

/** Alle Eingabe-Regeln in einem Formular. Rechts steht nach dem Speichern, was gespeichert würde. */
export const Standard: Story = { args: { today: '2026-10-29' } }
