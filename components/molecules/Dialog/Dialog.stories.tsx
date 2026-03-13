import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Dialog, DialogFooter } from './Dialog'
import { Button } from '@/components/atoms/Button/Button'

const meta: Meta = {
    title: 'Molecules/Dialog',
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj

export const Default: Story = {
    render: () => {
        const [open, setOpen] = useState(false)
        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Dialog</Button>
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    title="Confirm action"
                    description="This will permanently delete the item. This action cannot be undone."
                >
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => setOpen(false)}>Delete</Button>
                    </DialogFooter>
                </Dialog>
            </>
        )
    },
}

export const WithForm: Story = {
    render: () => {
        const [open, setOpen] = useState(false)
        return (
            <>
                <Button onClick={() => setOpen(true)}>Edit profile</Button>
                <Dialog open={open} onClose={() => setOpen(false)} title="Edit profile" description="Make changes to your profile here.">
                    <div className="flex flex-col gap-3">
                        <input className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm" placeholder="Display name" />
                        <input className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm" placeholder="Email" type="email" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={() => setOpen(false)}>Save changes</Button>
                    </DialogFooter>
                </Dialog>
            </>
        )
    },
}
