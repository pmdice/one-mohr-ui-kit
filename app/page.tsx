import { Hero } from "@/components/organisms/Hero/Hero"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-16 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 md:p-10 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-950 dark:ring-slate-700/50">
        <div className="mb-8 border-b pb-4 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            One Mohr UI Kit · Hybrid 2D/3D UI · In active development
          </p>
        </div>

        <Hero
          title="One Mohr UI Kit"
          subtitle="A hybrid 2D/3D interface kit for the modern web. Clean DOM components meet expressive canvas scenes—built for speed, clarity, and a little magic. Early access and actively evolving."
        />

        {/* Spatial teaser: faux canvas + HTML overlay to hint at the hybrid model */}
        <section className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border bg-slate-50 p-4 ring-1 ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-700/40">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700">
              {/* Faux 3D canvas area */}
              <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.35)_0,transparent_40%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.35)_0,transparent_45%)]" />
              {/* HTML overlay chip that would track a 3D point */}
              <div className="pointer-events-auto absolute left-6 top-6 select-none rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur dark:bg-slate-950/70 dark:text-slate-200">
                SpatialOverlay
              </div>
              <div className="pointer-events-auto absolute bottom-6 right-6 select-none rounded-lg bg-white/85 px-3 py-2 text-xs text-slate-700 shadow-sm ring-1 ring-slate-900/10 backdrop-blur dark:bg-slate-950/70 dark:text-slate-200 dark:ring-slate-700/40">
                CameraRig: target=“splat-42”
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              This is a conceptual preview. The library’s spatial layer will provide a Canvas host (Three.js/R3F) and an HTML overlay system for labels, HUDs, and interactions that sync with the camera.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Why “Hybrid” matters</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Real products need both: crisp, accessible DOM controls and immersive 3D scenes. one-mohr-ui-kit treats 2D and 3D as peers—so you can compose buttons, inputs, and overlays right inside a spatial canvas.
              </p>
            </div>
            <ul className="grid list-none gap-4 sm:grid-cols-2">
              <li className="rounded-lg border p-4 text-sm ring-1 ring-slate-900/5 dark:border-slate-800 dark:ring-slate-700/40">
                <p className="font-medium text-slate-900 dark:text-white">Splat Atom</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Decomposable <code>&lt;Splat /&gt;</code> with a <code>&lt;SplatViewer /&gt;</code> host built on R3F.</p>
              </li>
              <li className="rounded-lg border p-4 text-sm ring-1 ring-slate-900/5 dark:border-slate-800 dark:ring-slate-700/40">
                <p className="font-medium text-slate-900 dark:text-white">SpatialOverlay</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">HTML annotations that lock to 3D points and camera movement.</p>
              </li>
              <li className="rounded-lg border p-4 text-sm ring-1 ring-slate-900/5 dark:border-slate-800 dark:ring-slate-700/40">
                <p className="font-medium text-slate-900 dark:text-white">CameraRig</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Declarative camera targeting and smooth interpolation.</p>
              </li>
              <li className="rounded-lg border p-4 text-sm ring-1 ring-slate-900/5 dark:border-slate-800 dark:ring-slate-700/40">
                <p className="font-medium text-slate-900 dark:text-white">DebugHud</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Built‑in FPS, memory, and draw‑call insights for performance‑minded devs.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Roadmap snapshot */}
        <section className="mt-16">
          <h3 className="text-base font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">What’s brewing</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">An evolving snapshot of what’s in motion. Expect frequent updates as the hybrid toolkit takes shape.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4 text-sm ring-1 ring-slate-900/5 dark:border-slate-800 dark:ring-slate-700/40">
              <p className="font-medium text-slate-900 dark:text-white">Week 1 · Foundation & The Bridge</p>
              <ul className="mt-2 list-disc pl-5 text-slate-600 dark:text-slate-400">
                <li>components/spatial folder</li>
                <li><code>&lt;Splat /&gt;</code> + <code>&lt;SplatViewer /&gt;</code></li>
                <li><code>&lt;SpatialOverlay /&gt;</code> HTML-in-canvas</li>
              </ul>
            </div>
            <div className="rounded-lg border p-4 text-sm ring-1 ring-slate-900/5 dark:border-slate-800 dark:ring-slate-700/40">
              <p className="font-medium text-slate-900 dark:text-white">Week 2 · Interaction & Physics</p>
              <ul className="mt-2 list-disc pl-5 text-slate-600 dark:text-slate-400">
                <li><code>&lt;CameraRig /&gt;</code> target & easing</li>
                <li>3D Cursor</li>
                <li>Storybook “Spatial Concepts” docs</li>
              </ul>
            </div>
            <div className="rounded-lg border p-4 text-sm ring-1 ring-slate-900/5 dark:border-slate-800 dark:ring-slate-700/40">
              <p className="font-medium text-slate-900 dark:text-white">Week 3 · Polish & Ecosystem</p>
              <ul className="mt-2 list-disc pl-5 text-slate-600 dark:text-slate-400">
                <li>Theme Provider: sync 2D palette with 3D lighting</li>
                <li><code>&lt;DebugHud /&gt;</code></li>
                <li>Prep npm publish <code>@patrickmohr/ui</code></li>
              </ul>
            </div>
            <div className="rounded-lg border p-4 text-sm ring-1 ring-slate-900/5 dark:border-slate-800 dark:ring-slate-700/40">
              <p className="font-medium text-slate-900 dark:text-white">Week 4 · The Showcase</p>
              <ul className="mt-2 list-disc pl-5 text-slate-600 dark:text-slate-400">
                <li>“Dogfood” Lab demo</li>
                <li>Case study: Hybrid 2D/3D design system</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}