import type { Meta, StoryObj } from '@storybook/react'
import { SlipDetail } from './SlipDetail'

const meta: Meta<typeof SlipDetail> = {
    title: 'Status/Beispiel: Laufzettel-Durchlauf',
    component: SlipDetail,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof SlipDetail>

/** In Arbeit an Guss, länger als die Richtzeit. Scanne 26100013-1/4 aus, melde fertig, mach es rückgängig; scanne 26100013-3/4 ein. */
export const Standard: Story = { args: { initial: 'default' } }

/** Storniert mit Grund: gesperrt, darf wieder geöffnet werden. */
export const Storniert: Story = { args: { initial: 'canceled' } }

/** Fertig und gesperrt; Wieder öffnen dürfen nur Admins. */
export const FertigGesperrt: Story = { name: 'Fertig (darf nicht öffnen)', args: { initial: 'done-locked' } }
