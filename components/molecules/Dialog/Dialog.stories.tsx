import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Dialog } from './Dialog'
import { Button } from '@/components/atoms/Button/Button'
import { Input } from '@/components/atoms/Input/Input'
import { Label } from '@/components/atoms/Label/Label'

const meta: Meta = {
    title: 'Molecules/Dialog',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

function RenameDialog() {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>Umbenennen</Button>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title="Auftrag umbenennen"
                description="Der neue Name erscheint in Listen, Suche und Verlauf."
                footer={<><Button variant="outline" size="sm" onClick={() => setOpen(false)}>Abbrechen</Button><Button size="sm" onClick={() => setOpen(false)}>Speichern</Button></>}
            >
                <div className="flex flex-col gap-1">
                    <Label htmlFor="rename">Name</Label>
                    <Input id="rename" defaultValue="Ringe Herbst 2026" />
                </div>
            </Dialog>
        </>
    )
}

export const Standard: Story = { render: () => <RenameDialog /> }
