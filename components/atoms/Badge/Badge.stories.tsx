import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
    title: 'Atoms/Badge',
    component: Badge,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'success', 'warning', 'destructive', 'outline', 'secondary'],
        },
    },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = { args: { children: 'New', variant: 'default' } }
export const Success: Story = { args: { children: 'Published', variant: 'success' } }
export const Warning: Story = { args: { children: 'Beta', variant: 'warning' } }
export const Destructive: Story = { args: { children: 'Deprecated', variant: 'destructive' } }
export const Outline: Story = { args: { children: 'v2.0.0', variant: 'outline' } }
export const Secondary: Story = { args: { children: 'Draft', variant: 'secondary' } }

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-2">
            <Badge variant="default">New</Badge>
            <Badge variant="success">Published</Badge>
            <Badge variant="warning">Beta</Badge>
            <Badge variant="destructive">Deprecated</Badge>
            <Badge variant="outline">v2.0.0</Badge>
            <Badge variant="secondary">Draft</Badge>
        </div>
    ),
}
