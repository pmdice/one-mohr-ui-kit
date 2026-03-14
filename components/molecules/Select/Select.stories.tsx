import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Select } from './Select'

const FRAMEWORKS = [
    { value: 'next', label: 'Next.js' },
    { value: 'remix', label: 'Remix' },
    { value: 'astro', label: 'Astro' },
    { value: 'vite', label: 'Vite + React' },
    { value: 'cra', label: 'Create React App' },
]

const meta: Meta<typeof Select> = {
    title: 'Molecules/Select',
    component: Select,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
    render: () => {
        const [value, setValue] = useState('')
        return (
            <div className="w-64">
                <Select options={FRAMEWORKS} value={value} onChange={setValue} placeholder="Choose a framework" />
            </div>
        )
    },
}

export const WithDefault: Story = {
    render: () => {
        const [value, setValue] = useState('next')
        return (
            <div className="w-64">
                <Select options={FRAMEWORKS} value={value} onChange={setValue} />
            </div>
        )
    },
}

export const Disabled: Story = {
    render: () => (
        <div className="w-64">
            <Select options={FRAMEWORKS} disabled placeholder="Disabled select" />
        </div>
    ),
}
