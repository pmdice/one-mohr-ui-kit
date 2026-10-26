import { z } from "zod"

export const TYPES = [
    { value: "neu", label: "Neue Form" },
    { value: "vorlage", label: "Bestehende Vorlage" },
    { value: "reparatur", label: "Reparatur" },
]

export const MATERIALS = [
    { value: "alsi10mg", label: "AlSi10Mg" },
    { value: "alsi7mg", label: "AlSi7Mg" },
    { value: "alsi12", label: "AlSi12" },
    { value: "cusn12", label: "CuSn12" },
    { value: "cuzn39pb3", label: "CuZn39Pb3" },
    { value: "gjl250", label: "EN-GJL-250" },
    { value: "gjs400", label: "EN-GJS-400" },
    { value: "x5crni", label: "X5CrNi18-10" },
]

export const EXTRA_KINDS = [
    { value: "3d", label: "3D-Druck" },
    { value: "waerme", label: "Wärmebehandlung" },
    { value: "pruefung", label: "Prüfprotokoll" },
    { value: "andere", label: "Andere" },
]

export const labelOf = (list: { value: string; label: string }[], value: string | undefined) =>
    list.find((o) => o.value === value)?.label

const required = (message: string) => z.string().trim().min(1, message)

/** Whole pieces; accepts Swiss thousands separators ("1'000", "1 000"). */
const quantity = z
    .string()
    .transform((v) => v.replace(/['’\s]/g, ""))
    .pipe(
        z.string()
            .min(1, "Menge fehlt")
            // empty is reported by min() alone
            .regex(/^(-?\d+)?$/, "Menge muss eine ganze Zahl sein")
            .transform(Number)
            .pipe(z.number().min(1, "Menge muss mindestens 1 sein"))
    )

// Conditional fields (F-10) are plain optional strings here; whether they are required is decided
// below in superRefine, and the output transform drops values of fields that do not apply.
const extra = z.object({
    art: required("Art wählen"),
    fileNo: z.string().optional(),
    note: z.string().optional(),
})

const position = z.object({
    no: z.number(),
    typ: required("Typ wählen"),
    material: required("Material wählen"),
    qty: quantity,
    articleId: z.string().optional(),
    photos: z.any().optional(),
    note: z.string().optional(),
    extras: z.array(extra),
})

export const orderSchema = z
    .object({
        customer: required("Kunde fehlt"),
        orderNo: required("Auftragsnummer fehlt"),
        dueDate: required("Liefertermin fehlt"),
        remark: z.string().optional(),
        positions: z.array(position),
    })
    // Run even when other fields are invalid, so all missing fields show up at once
    .superRefine((order, ctx) => {
        order.positions?.forEach((p, i) => {
            if (p?.typ === "vorlage" && !p.articleId?.trim()) {
                ctx.addIssue({ code: "custom", path: ["positions", i, "articleId"], message: "Bestehenden Artikel wählen" })
            }
            p?.extras?.forEach((x, j) => {
                if (x?.art === "3d" && !x.fileNo?.trim()) {
                    ctx.addIssue({ code: "custom", path: ["positions", i, "extras", j, "fileNo"], message: "Dateinummer fehlt" })
                }
            })
        })
    })
    .transform((order) => ({
        ...order,
        positions: order.positions.map(({ articleId, extras, ...p }) => ({
            ...p,
            ...(p.typ === "vorlage" ? { articleId } : {}),
            extras: extras.map(({ fileNo, ...x }) => ({ ...x, ...(x.art === "3d" ? { fileNo } : {}) })),
        })),
    }))

export type OrderInput = z.input<typeof orderSchema>
export type OrderOutput = z.output<typeof orderSchema>
export type PositionInput = OrderInput["positions"][number]
