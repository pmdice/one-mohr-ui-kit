import type { Meta, StoryObj } from '@storybook/react'
import { OrderForm } from './OrderForm'
import type { OrderInput } from './orderSchema'

const meta: Meta<typeof OrderForm> = {
    title: 'Forms/Beispiel: Auftrag erfassen',
    component: OrderForm,
    parameters: { layout: 'padded' },
    decorators: [(Story) => <div className="mx-auto max-w-3xl"><Story /></div>],
    args: {
        onSubmit: (values) => new Promise((resolve) => {
            console.info('Gespeichert', values)
            setTimeout(resolve, 600)
        }),
    },
}
export default meta
type Story = StoryObj<typeof OrderForm>

/**
 * Five positions — one incomplete, one template without article, one with four extras
 * (two of them 3D prints, one missing its file number) — so the overview problem is visible.
 * Press "Speichern" to see the error summary.
 */
const SAMPLE: OrderInput = {
    customer: 'Muster Maschinenbau AG',
    orderNo: 'A-2026-0412',
    dueDate: '2026-11-28',
    remark: '',
    positions: [
        { no: 1, typ: 'neu', material: 'alsi10mg', qty: '40', articleId: '', note: '', extras: [] },
        { no: 2, typ: 'neu', material: '', qty: '', articleId: '', note: '', extras: [] },
        { no: 3, typ: 'vorlage', material: 'cusn12', qty: "1'200", articleId: '', note: '', extras: [] },
        {
            no: 5, typ: 'reparatur', material: 'gjl250', qty: '2', articleId: '', note: 'Riss an Flansch', extras: [
                { art: '3d', fileNo: 'F-3381', note: '' },
                { art: '3d', fileNo: '', note: 'Kernmodell' },
                { art: 'waerme', fileNo: '', note: 'T6' },
                { art: 'pruefung', fileNo: '', note: '' },
            ],
        },
        { no: 6, typ: 'vorlage', material: 'alsi7mg', qty: '15', articleId: 'A-10007', note: '', extras: [] },
    ],
}

export const AuftragErfassen: Story = {
    name: 'Auftrag erfassen',
    args: { defaultValues: SAMPLE },
}

export const Leer: Story = {}
