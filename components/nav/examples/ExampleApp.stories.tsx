import type { Meta, StoryObj } from '@storybook/react'
import { ExampleApp } from './ExampleApp'

const meta: Meta<typeof ExampleApp> = {
    title: 'Navigation/Beispiel-App',
    component: ExampleApp,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof ExampleApp>

/** Start in the order list. Open an order, go to its slips, search "26100013-2" with "/". */
export const Auftragsliste: Story = { args: { initial: '/auftraege' } }

/** A slip opened from the slip list: menu marks "Laufzettel", path still shows the order. */
export const LaufzettelAusListe: Story = {
    args: { initial: `/auftraege/26100013/laufzettel/2?from=${encodeURIComponent('/laufzettel?q=26100013')}` },
}

/** A slip opened by search or scan: no origin, so the menu marks the first crumb. */
export const LaufzettelPerSuche: Story = { args: { initial: '/auftraege/26100013/laufzettel/1' } }
