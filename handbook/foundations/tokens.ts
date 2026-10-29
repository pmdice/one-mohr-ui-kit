/* Every variable from app/tokens.css with its role. The values are read from the page, never copied here. */

export type TokenKind = "color" | "radius" | "shadow" | "length" | "motion"

export interface TokenGroup {
    title: string
    description: string
    kind: TokenKind
    /** Compared side by side: light and dark for colours, compact and comfortable for density. */
    variants: { label: string; className?: string; density?: "compact" | "comfortable" }[]
    tokens: { name: string; role: string }[]
}

const THEMES = [{ label: "Hell", className: "light" }, { label: "Dunkel", className: "dark" }]
const ONE = [{ label: "Wert" }]

export const TOKEN_GROUPS: TokenGroup[] = [
    {
        title: "Flächen",
        description: "Drei Ebenen und ein Zustand. Gliederung über Ebenen und Linien, nicht über Farbe (G-02).",
        kind: "color",
        variants: THEMES,
        tokens: [
            { name: "--surface-sunken", role: "Hintergrund der App, Ablagen, Seitenleiste." },
            { name: "--surface", role: "Inhalt: Karten, Tabellen, Formulare." },
            { name: "--surface-raised", role: "Was darüber schwebt: Menüs, Dialoge, Meldungen." },
            { name: "--surface-hover", role: "Zeile oder Eintrag unter dem Zeiger." },
        ],
    },
    {
        title: "Text und Linien",
        description: "Hierarchie über drei Stufen Text statt über immer neue Schriftgrössen (G-04).",
        kind: "color",
        variants: THEMES,
        tokens: [
            { name: "--fg", role: "Inhalt, Werte, Titel." },
            { name: "--fg-muted", role: "Beschriftungen, Erklärungen, zweite Zeile." },
            { name: "--fg-subtle", role: "Metadaten, Kennungen in Übersichten, Platzhalter." },
            { name: "--line", role: "Trennlinien und Rahmen von Flächen." },
            { name: "--line-strong", role: "Rahmen von Eingabefeldern und wichtigen Trennungen." },
        ],
    },
    {
        title: "Bedeutung",
        description: "Farbe nur mit Bedeutung und nie allein (G-01).",
        kind: "color",
        variants: THEMES,
        tokens: [
            { name: "--accent", role: "Hauptaktion, Auswahl, Links." },
            { name: "--accent-hover", role: "Hauptaktion unter dem Zeiger." },
            { name: "--accent-fg", role: "Text auf Akzent-Fläche." },
            { name: "--accent-subtle", role: "Hinterlegung für Ausgewähltes und Hinweise." },
            { name: "--focus", role: "Fokus-Ring der Tastatur (G-07)." },
            { name: "--danger", role: "Fehler und Schritte, die etwas zerstören." },
            { name: "--danger-hover", role: "Gefährliche Aktion unter dem Zeiger." },
            { name: "--danger-subtle", role: "Hinterlegung einer Fehlermeldung." },
            { name: "--danger-fg", role: "Text auf Gefahr-Fläche." },
            { name: "--warning", role: "Warnung: zu lange, bald fällig, unvollständig." },
            { name: "--warning-subtle", role: "Hinterlegung einer Warnung." },
            { name: "--success", role: "Erfolg und erledigt." },
            { name: "--success-subtle", role: "Hinterlegung einer Erfolgsmeldung." },
        ],
    },
    {
        title: "Radien",
        description: "Zwei Radien; nichts ist pillenförmig (der Token-Guard verbietet rounded-full).",
        kind: "radius",
        variants: ONE,
        tokens: [
            { name: "--r-control", role: "Knöpfe, Felder, Abzeichen." },
            { name: "--r-panel", role: "Karten, Menüs, Dialoge." },
        ],
    },
    {
        title: "Ebene",
        description: "Ein Schatten für alles, was schwebt (G-02).",
        kind: "shadow",
        variants: THEMES,
        tokens: [{ name: "--shadow-overlay", role: "Menüs, Aufklapper, Dialoge, Meldungen." }],
    },
    {
        title: "Dichte",
        description: "Dieselben Komponenten in zwei Dichten, gesetzt am Wurzelelement mit data-density (G-06).",
        kind: "length",
        variants: [{ label: "Kompakt", density: "compact" }, { label: "Komfortabel", density: "comfortable" }],
        tokens: [
            { name: "--control-h", role: "Höhe von Knöpfen und Feldern." },
            { name: "--control-px", role: "Innenabstand links und rechts in Bedienelementen." },
            { name: "--control-text", role: "Schriftgrösse in Bedienelementen." },
            { name: "--stack-gap", role: "Abstand zwischen Feldern eines Formulars." },
        ],
    },
    {
        title: "Bewegung",
        description: "Kurz und nur zur Erklärung; bei „Bewegung reduzieren“ aus (G-08).",
        kind: "motion",
        variants: ONE,
        tokens: [
            { name: "--dur-fast", role: "Zustandswechsel: Hover, Haken, Farbe." },
            { name: "--dur-base", role: "Etwas erscheint: Menü, Dialog, eingefügte Zeile." },
            { name: "--ease-out", role: "Kurve für alles, was erscheint: schnell los, sanft an." },
        ],
    },
]
