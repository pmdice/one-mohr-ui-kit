export interface Rule {
    id: string
    title: string
    summary: string
    /** Storybook docs id of the rule page */
    docsId: string
}

export interface RuleGroup {
    title: string
    description: string
    rules: Rule[]
}

export const FORM_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Pflichtfelder & Fehler",
        description: "Was muss ich ausfüllen, und was ist falsch?",
        rules: [
            {
                id: "F-01",
                title: "Pflicht vs. optional kennzeichnen",
                summary: "Kennzeichne pro Abschnitt die Minderheit: Sind die meisten Felder Pflicht, markiere die optionalen mit „(optional)“, sonst die Pflichtfelder mit *.",
                docsId: "handbuch-formulare-f-01-pflicht-vs-optional-kennzeichnen--docs",
            },
            {
                id: "F-02",
                title: "Wann Fehler erscheinen",
                summary: "Zeige eine Fehlermeldung erst, wenn das Feld verlassen oder gespeichert wird – und lass sie sofort verschwinden, sobald die Eingabe stimmt.",
                docsId: "handbuch-formulare-f-02-wann-fehler-erscheinen--docs",
            },
            {
                id: "F-03",
                title: "Fehlermeldungen sagen, was zu tun ist",
                summary: "Formuliere jede Fehlermeldung als Anweisung und zeige sie direkt am Feld.",
                docsId: "handbuch-formulare-f-03-fehlermeldungen-sagen-was-zu-tun-ist--docs",
            },
            {
                id: "F-04",
                title: "Fehlerzusammenfassung beim Speichern",
                summary: "Wenn das Speichern scheitert, setze den Fokus auf das erste fehlerhafte Feld und zeige oben eine Zusammenfassung mit Sprunglinks.",
                docsId: "handbuch-formulare-f-04-fehlerzusammenfassung-beim-speichern--docs",
            },
        ],
    },
    {
        title: "Aufbau",
        description: "Wie ist ein langes Formular gegliedert?",
        rules: [
            {
                id: "F-05",
                title: "Lange Formulare in Abschnitte gliedern",
                summary: "Gliedere Formulare ab etwa 7–8 Feldern in Abschnitte mit Überschrift und stelle Zusammengehöriges nebeneinander.",
                docsId: "handbuch-formulare-f-05-lange-formulare-in-abschnitte-gliedern--docs",
            },
            {
                id: "F-10",
                title: "Bedingte Felder",
                summary: "Zeige ein Feld, das von einer Auswahl abhängt, direkt beim auslösenden Feld – und blende es aus, wenn es nicht gilt.",
                docsId: "handbuch-formulare-f-10-bedingte-felder--docs",
            },
        ],
    },
    {
        title: "Positionen",
        description: "Wiederholbare Gruppen mit Unterzeilen, z. B. Auftragspositionen.",
        rules: [
            {
                id: "F-06",
                title: "Positionen sind Blöcke mit stabiler Nummer",
                summary: "Stelle jede wiederholbare Gruppe als abgegrenzten Block dar – mit stabiler Nummer, Zusammenfassung und Zustand im Kopf.",
                docsId: "handbuch-formulare-f-06-positionen-sind-blöcke-mit-stabiler-nummer--docs",
            },
            {
                id: "F-07",
                title: "Unterzeilen gehören sichtbar zu ihrem Block",
                summary: "Rücke Unterzeilen ein, verbinde sie mit einer Führungslinie mit ihrem Block und setze den „+“-Knopf ans Ende der eigenen Liste.",
                docsId: "handbuch-formulare-f-07-unterzeilen-gehören-sichtbar-zu-ihrem-block--docs",
            },
            {
                id: "F-08",
                title: "Neue Blöcke zeigen sofort, was fehlt",
                summary: "Öffne einen neu hinzugefügten Block, setze den Fokus ins erste Feld und zeige im Kopf, wie viele Pflichtfelder offen sind.",
                docsId: "handbuch-formulare-f-08-neue-blöcke-zeigen-sofort-was-fehlt--docs",
            },
            {
                id: "F-09",
                title: "Fertige Blöcke einklappbar",
                summary: "Lass vollständige Blöcke einklappen – einzeln und alle auf einmal – und lass unvollständige standardmässig offen.",
                docsId: "handbuch-formulare-f-09-fertige-blöcke-einklappbar--docs",
            },
        ],
    },
    {
        title: "Bedienung",
        description: "Tastatur und Speichern.",
        rules: [
            {
                id: "F-11",
                title: "Tastatur",
                summary: "Lass die Tab-Reihenfolge der sichtbaren Reihenfolge folgen, speichere nie mit Enter in einem einzeiligen Feld und biete ⌘/Ctrl+Enter zum Speichern.",
                docsId: "handbuch-formulare-f-11-tastatur--docs",
            },
            {
                id: "F-12",
                title: "Speichern und ungespeicherte Änderungen",
                summary: "Lass den Speichern-Button immer klickbar und warne, bevor ungespeicherte Änderungen verloren gehen.",
                docsId: "handbuch-formulare-f-12-speichern-und-ungespeicherte-änderungen--docs",
            },
        ],
    },
]
