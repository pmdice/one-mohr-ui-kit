export type Customer = { id: string; name: string }
export type OrderStatus = "offen" | "in-bearbeitung" | "abgeschlossen"
export type Order = { id: string; customerId: string; customerRef: string; status: OrderStatus; createdBy: "me" | "other"; date: string }
export type Slip = { orderId: string; index: number; total: number; material: string }

export const CUSTOMERS: Customer[] = [
    { id: "10073", name: "DÄHLER + BLASER" },
    { id: "10002", name: "ALLENSPACH AG" },
    { id: "10207", name: "SENNHAUSER AG" },
    { id: "10038", name: "BISE Pierre A." },
    { id: "10869", name: "BLASER Fabian" },
    { id: "10004", name: "DÜBY Ralph" },
    { id: "10003", name: "CENTURY TIME GEMS LTD." },
    { id: "10006", name: "DÖPPER Werner" },
]

const STATUSES: OrderStatus[] = ["offen", "offen", "in-bearbeitung", "offen", "abgeschlossen"]
const MATERIALS = ["INOX", "Weissgold 750", "Eisen", "Bronze", "Silber 925", "Gelbgold 750"]

/** 20 orders, newest first; #26100013 belongs to DÄHLER + BLASER, is open and has 4 slips. */
export const ORDERS: Order[] = Array.from({ length: 20 }, (_, i) => {
    const n = 20 - i
    const id = `261000${String(n).padStart(2, "0")}`
    const special = id === "26100013"
    return {
        id,
        customerId: special ? "10073" : CUSTOMERS[(n % (CUSTOMERS.length - 1)) + 1].id,
        customerRef: special ? "xy" : `K-${4000 + n}`,
        status: special ? "offen" : STATUSES[n % STATUSES.length],
        createdBy: n % 3 === 0 ? "me" : "other",
        date: `${String(28 - n).padStart(2, "0")}.10.2026`,
    }
})

export const SLIPS: Slip[] = ORDERS.flatMap((order) => {
    const n = Number(order.id.slice(-2))
    const total = order.id === "26100013" ? 4 : (n % 5) + 1
    return Array.from({ length: total }, (_, i) => ({
        orderId: order.id,
        index: i + 1,
        total,
        material: order.id === "26100013" ? ["INOX", "Weissgold 750", "Eisen", "Bronze"][i] : MATERIALS[(n + i) % MATERIALS.length],
    }))
})

export const STATUS_LABEL: Record<OrderStatus, string> = { offen: "Offen", "in-bearbeitung": "In Bearbeitung", abgeschlossen: "Abgeschlossen" }

export const customerOf = (order: Order) => CUSTOMERS.find((c) => c.id === order.customerId)!
export const orderLabel = (order: Order) => `#${order.id} ${customerOf(order).name}`
export const slipLabel = (slip: Slip) => `Laufzettel ${slip.index}/${slip.total}`
export const slipNumber = (slip: Slip) => `${slip.orderId} – ${slip.index}/${slip.total}`
export const slipsOf = (orderId: string) => SLIPS.filter((s) => s.orderId === orderId)
