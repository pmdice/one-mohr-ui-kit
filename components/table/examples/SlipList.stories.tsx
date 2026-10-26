import type { Meta, StoryObj } from '@storybook/react'
import { SlipList } from './SlipList'

const meta: Meta<typeof SlipList> = {
    title: 'Listen/Beispiel: Laufzettel',
    component: SlipList,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof SlipList>

/** ~300 slips, urgent first. Try J/K, X, Enter; add a filter; sort by weight; select across pages. */
export const Standard: Story = {}

/** Filters active: chips, "27 von 300", reset. */
export const Gefiltert: Story = { args: { initial: '/laufzettel?f=station:guss&f=urgency:dringend' } }

/** Filters that hide everything: "Keine Treffer" with reset. */
export const KeineTreffer: Story = { args: { initial: '/laufzettel?q=zzzz' } }

/** Nothing exists yet: different text, main action instead of reset. */
export const NochNichtsDa: Story = { args: { variant: 'empty' } }

/** First load works, every later load fails: rows stay, error with retry. Change the page to see it. */
export const FehlerBeimNachladen: Story = { args: { variant: 'reload-error' } }
