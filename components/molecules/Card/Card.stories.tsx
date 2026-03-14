import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'
import { Badge } from '@/components/atoms/Badge/Badge'
import { Button } from '@/components/atoms/Button/Button'

const meta: Meta<typeof Card> = {
    title: 'Molecules/Card',
    component: Card,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        interactive: { control: 'boolean' },
    },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
    args: { interactive: false },
    render: (args) => (
        <Card {...args} className="w-72">
            <CardHeader>
                <CardTitle>Component Card</CardTitle>
                <CardDescription>A clean content surface for any use case.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Cards group related content and actions. Use them for articles, profiles, product listings, or settings panels.
                </p>
            </CardContent>
            <CardFooter>
                <Button size="sm">Learn more</Button>
            </CardFooter>
        </Card>
    ),
}

export const Interactive: Story = {
    args: { interactive: true },
    render: (args) => (
        <Card {...args} className="w-72 cursor-pointer">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle>Hover me</CardTitle>
                    <Badge variant="success">New</Badge>
                </div>
                <CardDescription>This card lifts on hover with a spring animation.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Powered by Framer Motion's <code>whileHover</code> and <code>whileTap</code> gestures.
                </p>
            </CardContent>
        </Card>
    ),
}

export const Grid: Story = {
    render: () => (
        <div className="grid grid-cols-2 gap-4">
            {['Design', 'Engineering', 'Product', 'Research'].map(role => (
                <Card key={role} interactive className="cursor-pointer">
                    <CardTitle>{role}</CardTitle>
                    <CardDescription>Explore {role.toLowerCase()} resources</CardDescription>
                </Card>
            ))}
        </div>
    ),
}
