import type { Meta, StoryObj } from '@storybook/react'
import { ToastProvider, useToast } from './Toast'
import { Button } from '@/components/atoms/Button/Button'

function ToastDemo() {
    const { toast } = useToast()
    return (
        <div className="flex flex-wrap gap-2">
            <Button onClick={() => toast({ title: 'Changes saved', description: 'Your draft was saved successfully.', variant: 'success' })}>
                Success
            </Button>
            <Button variant="destructive" onClick={() => toast({ title: 'Something went wrong', description: 'Please try again later.', variant: 'error' })}>
                Error
            </Button>
            <Button variant="outline" onClick={() => toast({ title: 'Update available', description: 'A new version is ready to install.', variant: 'info' })}>
                Info
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: 'Session expiring', description: 'You will be logged out in 5 minutes.', variant: 'warning' })}>
                Warning
            </Button>
        </div>
    )
}

const meta: Meta = {
    title: 'Molecules/Toast',
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <ToastProvider>
                <Story />
            </ToastProvider>
        ),
    ],
}

export default meta
type Story = StoryObj

export const Default: Story = {
    render: () => <ToastDemo />,
}
