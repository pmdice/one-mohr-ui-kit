import type { RuleGroup } from "../rules.types"

export const LIST_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Lesen",
        description: "Was steht in der Zeile, und wie liest man sie schnell?",
        rules: [
            {
                id: "L-01",
                title: "Die Kennung ist der Anker der Zeile",
                summary: "Zeige die Kennung, die auf Papier und Etikett steht, vorn in der Zeile als Link – und lass die ganze Zeile per Klick öffnen.",
                docsId: "handbuch-listen-l-01-die-kennung-ist-der-anker-der-zeile--docs",
            },
            {
                id: "L-02",
                title: "Zahlen rechts und Einheiten im Kopf",
                summary: "Richte Zahlen rechtsbündig mit gleich breiten Ziffern aus, schreib die Einheit in den Spaltenkopf und zeige leere Werte als „—“.",
                docsId: "handbuch-listen-l-02-zahlen-rechts-und-einheiten-im-kopf--docs",
            },
            {
                id: "L-03",
                title: "Status ist Text und Farbe nur Zusatz",
                summary: "Zeige Status und Dringlichkeit als Badge mit Text (Dringlichkeit mit Icon) – lesbar auch ohne Farbe – und die Dringlichkeit als schmale Spalte ganz vorn.",
                docsId: "handbuch-listen-l-03-status-ist-text-und-farbe-nur-zusatz--docs",
            },
            {
                id: "L-04",
                title: "Kopf und Kennung bleiben stehen",
                summary: "Lass den Spaltenkopf beim Scrollen stehen, bei breiten Tabellen auch die Kennung, und richte Zeilenhöhe und Schrift nach der Dichte.",
                docsId: "handbuch-listen-l-04-kopf-und-kennung-bleiben-stehen--docs",
            },
        ],
    },
    {
        title: "Eingrenzen",
        description: "Wie finde ich die Zeilen, die ich jetzt brauche?",
        rules: [
            {
                id: "L-05",
                title: "Aktive Filter sind immer sichtbar",
                summary: "Zeig jeden aktiven Filter als entfernbaren Chip über der Tabelle, ab zwei mit „Alle zurücksetzen“, und halte Filter, Suche, Sortierung und Seite in der URL.",
                docsId: "handbuch-listen-l-05-aktive-filter-sind-immer-sichtbar--docs",
            },
            {
                id: "L-06",
                title: "Die Standard-Sortierung folgt der Arbeit",
                summary: "Sortiere ohne eigene Wahl so, wie gearbeitet wird (z. B. dringend zuerst, dann ältestes Datum), und zeig die aktive Sortierung im Spaltenkopf.",
                docsId: "handbuch-listen-l-06-die-standard-sortierung-folgt-der-arbeit--docs",
            },
            {
                id: "L-07",
                title: "Leer ist nicht gleich leer",
                summary: "Unterscheide „noch nichts da“, „keine Treffer für diese Filter“ und „Fehler beim Laden“ – mit eigenem Text und eigener Aktion.",
                docsId: "handbuch-listen-l-07-leer-ist-nicht-gleich-leer--docs",
            },
            {
                id: "L-08",
                title: "Laden ohne Flackern",
                summary: "Zeig beim ersten Laden Platzhalter in Zeilenform und lass beim Nachladen die bisherigen Zeilen abgeblendet stehen; verwirf Antworten für einen älteren Zustand.",
                docsId: "handbuch-listen-l-08-laden-ohne-flackern--docs",
            },
        ],
    },
    {
        title: "Arbeiten",
        description: "Wie arbeite ich eine Liste ab?",
        rules: [
            {
                id: "L-09",
                title: "Mit der Tastatur durch die Liste",
                summary: "Lass J/K eine sichtbare Zeilenmarkierung bewegen, Enter die markierte Zeile öffnen und X sie auswählen.",
                docsId: "handbuch-listen-l-09-mit-der-tastatur-durch-die-liste--docs",
            },
            {
                id: "L-10",
                title: "Mehrere auf einmal",
                summary: "Gib jeder Zeile eine Checkbox und dem Kopf eine für die ganze Seite und zeig bei Auswahl eine Leiste mit Anzahl und Sammelaktionen.",
                docsId: "handbuch-listen-l-10-mehrere-auf-einmal--docs",
            },
            {
                id: "L-11",
                title: "Die häufigste Aktion sichtbar und der Rest im Menü",
                summary: "Zeig pro Zeile höchstens eine Aktion direkt, mit Text, und leg alle weiteren ins „…“-Menü – alles per Tastatur erreichbar und immer sichtbar.",
                docsId: "handbuch-listen-l-11-die-häufigste-aktion-sichtbar-und-der-rest-im-menü--docs",
            },
            {
                id: "L-12",
                title: "Die Menge ist immer sichtbar",
                summary: "Zeig über der Tabelle die Trefferzahl („27 von 312 Laufzettel“) und darunter den Bereich mit Blättern und einer gespeicherten Seitengrösse.",
                docsId: "handbuch-listen-l-12-die-menge-ist-immer-sichtbar--docs",
            },
        ],
    },
]
