import { ThemeToggle } from "@/components/atoms/ThemeToggle/ThemeToggle"

const AREAS = [
    { id: "F", title: "Formulare", description: "Pflichtfelder, Fehler, Positionen, bedingte Felder.", status: "verfügbar" },
    { id: "N", title: "Navigation & App-Rahmen", description: "Sidebar, Breadcrumb, Seitenhierarchie.", status: "geplant" },
    { id: "T", title: "Listen & Tabellen", description: "Dichte Tabellen, Filter, Liste → Detail.", status: "geplant" },
    { id: "S", title: "Status & Lebenszyklus", description: "Status-Sprache, Scan-Ein/Aus, Historie.", status: "geplant" },
]

export default function Home() {
    return (
        <main className="mx-auto max-w-2xl px-6 py-16">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-fg">One Mohr UI Kit</h1>
                    <p className="mt-2 text-fg-muted">
                        Handbuch für Firmensoftware: Regeln, die man in jedes Projekt übertragen kann,
                        mit React-Komponenten als Referenz-Umsetzung.
                    </p>
                </div>
                <ThemeToggle />
            </div>

            <p className="mt-8 text-sm text-fg-muted">
                Die Regeln und Beispiele leben in Storybook:{" "}
                <a className="text-accent underline-offset-4 hover:underline" href="http://localhost:6006">
                    localhost:6006
                </a>{" "}
                (<code className="font-mono text-xs">npm run storybook</code>).
            </p>

            <h2 className="mt-10 text-xs font-medium uppercase tracking-wider text-fg-subtle">Regelbereiche</h2>
            <ul className="mt-3 divide-y divide-border rounded-panel border border-border">
                {AREAS.map((area) => (
                    <li key={area.id} className="flex items-baseline gap-4 px-4 py-3">
                        <span className="w-4 font-mono text-xs text-fg-subtle">{area.id}</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-fg">{area.title}</p>
                            <p className="text-sm text-fg-muted">{area.description}</p>
                        </div>
                        <span className="text-xs text-fg-subtle">{area.status}</span>
                    </li>
                ))}
            </ul>
        </main>
    )
}
