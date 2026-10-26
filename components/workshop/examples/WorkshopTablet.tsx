"use client"

import * as React from "react"
import { Button } from "@/components/atoms/Button/Button"
import { normalizeIdentifier } from "@/components/nav/identifier"
import { resolveScan, type ScanTarget } from "@/components/status/scan"
import { NOW, STATIONS, applyEvent, number, seedWorld, stationLabel, type World } from "@/components/status/examples/slip"
import { cn } from "@/lib/utils"
import { useAutoFlush } from "../autoFlush"
import { CameraScanner } from "../CameraScanner"
import { HereList } from "../HereList"
import { ScanBanner, type BannerResult } from "../ScanBanner"
import { createScanQueue, type QueuedScan } from "../scanQueue"
import { SlipCard } from "../SlipCard"
import { StationHeader, StationPicker } from "../StationHeader"
import { memoryStorage, useStation } from "../station"
import { unlockOnFirstTouch } from "../tones"

type Variant = "default" | "setup" | "denied" | "offline"
type Undo = { snapshot: World; slip: string; queuedId: string; code: string; station: string }

const UNDO_MS = 10_000
const URGENCY: Record<number, string> = { 1: "Dringend", 2: "Normal", 3: "Hoch", 4: "Normal" }
const NOTES: Record<string, string[]> = { "26100013-1": ["Steine nicht mitgiessen"] }
const UNKNOWN = "99999999-1/1"

const codeOf = (s: World["slips"][number]) => `${s.orderId}-${s.index}/${s.total}`

/** Three scans made while the network was gone (W-07): applied on the device, waiting to be sent. */
function offlineSeed(): { world: World; queue: QueuedScan[] } {
    let world = seedWorld()
    const queue: QueuedScan[] = []
    const scans: [string, string][] = [["26100013-3", "guss"], ["26100013-4", "guss"], ["26100013-1", "guss"]]
    scans.forEach(([slip, station], i) => {
        const at = NOW - (30 - i * 10) * 60_000
        world = applyEvent(world, { type: "scan", slip, station, actor: "Tablet Guss", device: "Tablet Guss", at })
        const s = world.slips.find((x) => x.id === slip)!
        queue.push({ id: `seed-${i}`, code: codeOf(s), station, at })
    })
    return { world, queue }
}

/**
 * Example: the tablet at a station. The camera is simulated (stories and tests have none); tapping a slip
 * holds it in front of the camera. A switch simulates the network.
 */
export function WorkshopTablet({ initial = "default", now = NOW, dedupeMs = 3000, sound: initialSound = true }: {
    initial?: Variant
    now?: number
    /** Double-read guard (S-07); tests set 0 to scan the same slip twice in a row. */
    dedupeMs?: number
    sound?: boolean
}) {
    const [seed] = React.useState(() => (initial === "offline" ? offlineSeed() : { world: seedWorld(), queue: [] }))
    const [storage] = React.useState(() => memoryStorage({
        ...(initial === "setup" ? {} : { "workshop:station": "guss" }),
        ...(seed.queue.length ? { "workshop:queue": JSON.stringify(seed.queue) } : {}),
    }))
    const [station, setStation] = useStation(storage)
    const [world, setWorld] = React.useState(seed.world)
    const [online, setOnline] = React.useState(initial !== "offline")
    // The simulated network, read by the queue when it sends
    const [network] = React.useState(() => createNetwork(initial !== "offline"))
    const [queue] = React.useState(() => createScanQueue({
        storage,
        send: async () => {
            if (!network.isOnline()) throw new Error("offline")
            return { ok: true }
        },
    }))
    const items = React.useSyncExternalStore(queue.subscribe, queue.items, queue.items)
    const waiting = items.filter((s) => !s.error).length
    const rejected = items.filter((s) => s.error).map((s) => ({ id: s.id, code: s.code, reason: s.error! }))
    useAutoFlush(queue)
    React.useEffect(() => unlockOnFirstTouch(), [])
    const [banner, setBanner] = React.useState<BannerResult | null>(null)
    const [undo, setUndo] = React.useState<Undo | null>(null)
    const [selected, setSelected] = React.useState<string | null>(null)
    const [sound, setSound] = React.useState(initialSound)
    const [lastScans] = React.useState(() => new Map<string, number>())
    const [start] = React.useState(() => Date.now())
    const [elapsed, setElapsed] = React.useState(0)
    const clock = () => now + (Date.now() - start)

    React.useEffect(() => {
        const timer = setInterval(() => setElapsed(Date.now() - start), 30_000)
        return () => clearInterval(timer)
    }, [start])

    React.useEffect(() => {
        if (!undo) return
        const timer = setTimeout(() => setUndo(null), UNDO_MS)
        return () => clearTimeout(timer)
    }, [undo])

    const show = (result: Omit<BannerResult, "id">) => setBanner((prev) => ({ ...result, id: (prev?.id ?? 0) + 1 }))

    const toggleOnline = () => {
        const next = !online
        network.set(next)
        setOnline(next)
        if (next) void queue.flush()
    }

    const handleCode = (code: string) => {
        if (!station) return
        const label = stationLabel(station)
        const at = clock()
        setElapsed(at - now)
        const targets: ScanTarget[] = world.slips.map((s) => ({
            code: codeOf(s),
            label: number(s),
            station: s.station,
            locked: s.closed ? (s.status === "fertig" ? "fertig" : "storniert") : null,
            visits: s.visits,
        }))
        const r = resolveScan({ code, station, stationLabel: label, targets, lastScans, now: Date.now(), dedupeMs })
        if (r.kind === "duplicate") {
            // The same slip read again: keep its EIN/AUS and the way back, say it only for another slip
            if (banner?.code === r.target!.code) return
            return show({ kind: "repeat", message: r.message, code: r.target!.code })
        }
        setUndo(null)
        // Errors name the next step (W-06)
        if (r.kind === "unknown") return show({ kind: "error", message: `Code nicht erkannt: ${code.trim()}`, next: "Nummer unten eintippen oder Zettel ins Büro bringen." })
        if (r.kind === "locked") return show({ kind: "error", message: r.message, next: "Zettel ins Büro bringen." })
        const slip = world.slips.find((s) => number(s) === r.target!.label)!
        lastScans.set(normalizeIdentifier(r.target!.code), Date.now())
        setWorld((w) => applyEvent(w, { type: "scan", slip: slip.id, station, actor: `Tablet ${label}`, device: `Tablet ${label}`, at }))
        const queued = queue.add({ code: r.target!.code, station, at })
        if (online) void queue.flush()
        show({ kind: r.kind, message: r.message, code: r.target!.code, next: online ? undefined : "Gespeichert, wird gesendet, sobald die Verbindung zurück ist." })
        setUndo({ snapshot: world, slip: slip.id, queuedId: queued.id, code: r.target!.code, station })
        setSelected(slip.id)
    }

    const takeBack = () => {
        if (!undo) return
        setUndo(null)
        if (queue.remove(undo.queuedId)) {
            // Never sent: as if it had not happened
            setWorld(undo.snapshot)
        } else {
            // Already sent: an explicit revoke of that scan. The slip goes back to where it was, the history
            // keeps both entries plus the reversal (S-09). A counter-scan would hit the server's double-read guard.
            const before = undo.snapshot.slips.find((s) => s.id === undo.slip)!
            const at = clock()
            const device = `Tablet ${stationLabel(undo.station)}`
            setWorld((w) => ({
                slips: w.slips.map((s) => (s.id === undo.slip ? before : s)),
                activity: [...w.activity, { id: `e${w.seq + 1}`, at, slip: undo.slip, actor: device, via: "scan", device, kind: "location", text: "hat den Scan zurückgenommen" }],
                seq: w.seq + 1,
            }))
            queue.add({ code: undo.code, station: undo.station, at, revokes: undo.queuedId })
            if (online) void queue.flush()
        }
        show({ kind: "repeat", message: "Scan zurückgenommen", code: undo.code })
    }

    const renderNow = now + elapsed
    const card = world.slips.find((s) => s.id === selected)

    return (
        <div data-density="comfortable" className="flex min-h-full flex-col gap-4 bg-surface p-4 text-fg">
            <div className="flex flex-wrap items-center gap-3 rounded-panel border border-dashed border-border-strong px-3 py-2 text-sm text-fg-muted">
                <span className="font-medium">Simulation</span>
                <button
                    type="button"
                    role="switch"
                    aria-checked={online}
                    aria-label="Verbindung"
                    onClick={toggleOnline}
                    className="inline-flex min-h-10 items-center gap-2 rounded-control border border-border px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                    <span className={cn("h-3 w-6 rounded-control", online ? "bg-success" : "bg-border-strong")} aria-hidden="true" />
                    Verbindung {online ? "an" : "aus"}
                </button>
            </div>

            {!station
                ? <StationPicker stations={STATIONS} onPick={setStation} />
                : (
                    <>
                        <StationHeader
                            station={stationLabel(station)}
                            waiting={waiting}
                            rejected={rejected}
                            onDismissRejected={(id) => queue.remove(id)}
                            online={online}
                            sound={sound}
                            onSoundChange={setSound}
                            onChangeStation={() => { setStation(null); setUndo(null); setBanner(null) }}
                        />
                        <ScanBanner result={banner} sound={sound} onUndo={undo ? takeBack : undefined} />
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                            <CameraScanner
                                onCode={handleCode}
                                simulated={initial === "denied" ? undefined : <SimulatedCamera slips={world.slips} onHold={handleCode} />}
                                getStream={initial === "denied" ? deniedStream : undefined}
                                createDetector={initial === "denied" ? () => ({ detect: async () => [] }) : undefined}
                                fallback={<TypedInput onSubmit={handleCode} />}
                            />
                            <div className="flex flex-col gap-5">
                                {card && (
                                    <SlipCard
                                        number={number(card)}
                                        customer={card.customer}
                                        material={card.material}
                                        pieces={card.pieces}
                                        urgency={URGENCY[card.index]}
                                        notes={NOTES[card.id]}
                                    />
                                )}
                                <HereList
                                    station={stationLabel(station)}
                                    now={renderNow}
                                    onSelect={setSelected}
                                    items={world.slips.filter((s) => s.station === station).map((s) => ({
                                        id: s.id,
                                        number: number(s),
                                        since: s.locationSince,
                                        norm: STATIONS.find((x) => x.id === station)?.norm,
                                    }))}
                                />
                            </div>
                        </div>
                    </>
                )}
        </div>
    )
}

/** A switchable stand-in for the network of the example. */
function createNetwork(initial: boolean) {
    let online = initial
    return { isOnline: () => online, set: (next: boolean) => { online = next } }
}

const deniedStream = async (): Promise<MediaStream> => {
    throw Object.assign(new Error("Permission denied"), { name: "NotAllowedError" })
}

function SimulatedCamera({ slips, onHold }: { slips: World["slips"]; onHold: (code: string) => void }) {
    return (
        <div className="flex h-full flex-col gap-3 p-4 text-surface">
            <p className="m-0 text-base">Simulation: Zettel antippen = vor die Kamera halten</p>
            <div className="grid flex-1 grid-cols-2 content-center gap-3">
                {slips.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        aria-label={`${number(s)} vor die Kamera halten`}
                        onClick={() => onHold(codeOf(s))}
                        className="min-h-14 rounded-panel border-2 border-surface/60 px-3 font-mono text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:bg-surface/20"
                    >
                        {number(s)}
                    </button>
                ))}
                <button
                    type="button"
                    aria-label="Unbekannter Code vor die Kamera halten"
                    onClick={() => onHold(UNKNOWN)}
                    className="min-h-14 rounded-panel border-2 border-dashed border-surface/60 px-3 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:bg-surface/20"
                >
                    Unbekannter Code
                </button>
            </div>
        </div>
    )
}

/** Typing the number or a hand scanner (keyboard + Enter) – always there, the main way when the camera is out (W-02). */
function TypedInput({ onSubmit }: { onSubmit: (code: string) => void }) {
    const [value, setValue] = React.useState("")
    const id = React.useId()
    return (
        <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
                e.preventDefault()
                if (!value.trim()) return
                onSubmit(value)
                setValue("")
            }}
        >
            <label htmlFor={id} className="text-base font-medium text-fg">Nummer eintippen</label>
            <div className="flex gap-2">
                <input
                    id={id}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoComplete="off"
                    inputMode="text"
                    placeholder="z. B. 26100013-3/4"
                    className="min-h-12 min-w-0 flex-1 rounded-control border border-border-strong bg-surface px-4 font-mono text-xl text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                />
                <Button type="submit" className="min-h-12 px-5 text-base">Erfassen</Button>
            </div>
        </form>
    )
}
