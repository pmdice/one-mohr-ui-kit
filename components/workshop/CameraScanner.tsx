"use client"

import * as React from "react"
import { CameraOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type Detector = { detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]> }

type State = "starting" | "active" | "denied" | "missing" | "unsupported"

const MESSAGES: Record<Exclude<State, "active">, string> = {
    starting: "Kamera startet …",
    denied: "Kamera nicht erlaubt. In den Einstellungen des Browsers die Kamera für diese Seite erlauben.",
    missing: "Keine Kamera gefunden. Nummer unten eintippen oder Hand-Scanner nutzen.",
    unsupported: "Dieses Gerät erkennt Codes nicht selbst. Nummer unten eintippen oder Hand-Scanner nutzen.",
}

/** How long a code must be out of view before the same code counts again. */
const GONE_MS = 1000

function defaultStream() {
    return navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
}

function defaultDetector(): Detector | null {
    const Ctor = (globalThis as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector
    return Ctor ? new Ctor({ formats: ["qr_code", "code_128", "code_39"] }) : null
}

/**
 * The camera is the page (W-02): the picture fills the space and a frame shows where the code goes.
 * When the camera is refused or codes cannot be recognised, one sentence says why and the input below
 * (`fallback`) carries the work.
 */
/** Colour of the aiming corners: they repeat the last answer where the eyes are (W-04). */
const CORNERS: Record<"idle" | "in" | "out" | "error", string> = {
    idle: "border-white",
    in: "border-success",
    out: "border-accent",
    error: "border-danger",
}

function Finder({ tone }: { tone: keyof typeof CORNERS }) {
    const corner = cn("absolute h-10 w-10 transition-colors duration-300", CORNERS[tone])
    return (
        <div className="pointer-events-none absolute inset-[12%]" aria-hidden="true">
            <span className={cn(corner, "left-0 top-0 rounded-tl-panel border-l-4 border-t-4")} />
            <span className={cn(corner, "right-0 top-0 rounded-tr-panel border-r-4 border-t-4")} />
            <span className={cn(corner, "bottom-0 left-0 rounded-bl-panel border-b-4 border-l-4")} />
            <span className={cn(corner, "bottom-0 right-0 rounded-br-panel border-b-4 border-r-4")} />
            <span className="absolute inset-x-6 h-0.5 bg-white/50 motion-reduce:hidden" style={{ animation: "scan-sweep 3.2s ease-in-out infinite" }} />
        </div>
    )
}

export function CameraScanner({ onCode, getStream = defaultStream, createDetector = defaultDetector, interval = 250, fallback, simulated, tone = "idle", className }: {
    onCode: (code: string) => void
    getStream?: () => Promise<MediaStream>
    createDetector?: () => Detector | null
    interval?: number
    /** Typed or hand-scanner input; always shown. */
    fallback: React.ReactNode
    /** Replaces camera and detector, e.g. in stories. */
    simulated?: React.ReactNode
    /** The last answer, shown on the aiming corners. */
    tone?: "idle" | "in" | "out" | "error"
    className?: string
}) {
    const [state, setState] = React.useState<State>(simulated ? "active" : "starting")
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const onCodeRef = React.useRef(onCode)
    // Camera and detector are set up once; new function props on re-render must not restart the camera
    const setup = React.useRef({ getStream, createDetector })
    React.useEffect(() => { onCodeRef.current = onCode })

    React.useEffect(() => {
        if (simulated) return
        const { getStream, createDetector } = setup.current
        const detector = createDetector()
        if (!detector) { setState("unsupported"); return }
        let stream: MediaStream | null = null
        let timer: ReturnType<typeof setInterval> | undefined
        let cancelled = false
        let current: string | null = null
        let lastSeen = 0

        getStream().then((s) => {
            stream = s
            if (cancelled) { s.getTracks().forEach((t) => t.stop()); return }
            const video = videoRef.current
            if (video) {
                try {
                    video.srcObject = s
                    video.play()?.catch(() => {})
                } catch { /* autoplay may be refused; the picture starts on the next user tap */ }
            }
            setState("active")
            timer = setInterval(async () => {
                if (!videoRef.current) return
                let codes: string[] = []
                try { codes = (await detector.detect(videoRef.current)).map((c) => c.rawValue) } catch { return }
                // Left meanwhile (e.g. the station changed): a late result must not be booked
                if (cancelled) return
                const now = Date.now()
                const seen = current !== null && codes.includes(current)
                if (seen) { lastSeen = now; return }
                if (current !== null && now - lastSeen < GONE_MS) return
                current = null
                const code = codes[0]
                if (!code) return
                // A code held in front of the camera is reported once, not on every frame
                current = code
                lastSeen = now
                onCodeRef.current(code)
            }, interval)
        }).catch((error: { name?: string }) => {
            if (!cancelled) setState(error?.name === "NotAllowedError" ? "denied" : "missing")
        })

        return () => {
            cancelled = true
            clearInterval(timer)
            stream?.getTracks().forEach((t) => t.stop())
        }
    }, [simulated, interval])

    const blocked = state !== "active" && state !== "starting"
    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {!blocked && (
                // A camera picture is black in either theme
                <div className="relative aspect-[4/3] max-h-[55vh] w-full overflow-hidden rounded-panel bg-black">
                    {!simulated && <video ref={videoRef} aria-label="Kamera" muted playsInline className="h-full w-full object-cover" />}
                    <Finder tone={tone} />
                    {simulated && <div className="absolute inset-0">{simulated}</div>}
                    {state === "starting" && (
                        <p className="absolute inset-0 m-0 flex items-center justify-center gap-2 text-xl text-white">
                            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />{MESSAGES.starting}
                        </p>
                    )}
                </div>
            )}
            {blocked && (
                <p role="status" className="m-0 flex items-start gap-3 rounded-panel border border-border bg-surface-sunken p-4 text-xl text-fg">
                    <CameraOff className="mt-1 h-6 w-6 shrink-0 text-fg-muted" aria-hidden="true" />
                    {MESSAGES[state]}
                </p>
            )}
            {fallback}
        </div>
    )
}
