import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from './ThemeToggle'

const meta: Meta<typeof ThemeToggle> = {
    title: 'Atoms/ThemeToggle',
    component: ThemeToggle,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A button that toggles between light and dark mode. Uses `next-themes` under the hood. The Storybook toolbar Theme button controls the active theme in all stories.',
            },
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

export const Default: Story = {}
