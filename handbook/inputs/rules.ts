import type { RuleGroup } from "../rules.types"

export const INPUT_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Das richtige Feld",
        description: "Welches Feld für welche Angabe, und was steht darin?",
        rules: [
            {
                id: "E-01",
                title: "Das Feld passt zur Angabe",
                summary: "Nimm für Zahlen ein Zahlenfeld mit Einheit, für Daten ein Datumsfeld, für zwei bis fünf Möglichkeiten sichtbare Optionen, ab sechs eine Auswahlliste und für Datensätze eine Suche.",
                docsId: "handbuch-eingaben-e-01-das-feld-passt-zur-angabe--docs",
            },
            {
                id: "E-02",
                title: "Die Einheit steht im Feld",
                summary: "Zeig Einheit oder Währung rechts im Feld – nicht in der Beschriftung versteckt und nie weggelassen – und setz Zahlen in Ziffern gleicher Breite.",
                docsId: "handbuch-eingaben-e-02-die-einheit-steht-im-feld--docs",
            },
            {
                id: "E-03",
                title: "Grenzen stehen vorher da",
                summary: "Schreib unter das Feld, was erlaubt ist, bevor jemand tippt, und zeig einen Zähler erst, wenn die Grenze nah ist.",
                docsId: "handbuch-eingaben-e-03-grenzen-stehen-vorher-da--docs",
            },
        ],
    },
    {
        title: "Lesen und zeigen",
        description: "Was versteht ein Feld, und wie zeigt es, was es verstanden hat?",
        rules: [
            {
                id: "E-04",
                title: "Grosszügig lesen und streng zeigen",
                summary: "Versteh jede eindeutige Schreibweise („1,5“, „1.5“, „1'500“), zeig nach dem Verlassen die eine kanonische und lehn nur ab, was mehrdeutig oder sinnlos ist – mit einem Satz, warum.",
                docsId: "handbuch-eingaben-e-04-grosszügig-lesen-und-streng-zeigen--docs",
            },
            {
                id: "E-05",
                title: "Daten schweizerisch und mit Abkürzungen",
                summary: "Zeig Daten als TT.MM.JJJJ mit Wochentag, versteh „14.11.“, „morgen“ und „+3“ und biete den Kalender als Hilfe an, nicht als einzigen Weg.",
                docsId: "handbuch-eingaben-e-05-daten-schweizerisch-und-mit-abkürzungen--docs",
            },
            {
                id: "E-06",
                title: "Geld in Rappen",
                summary: "Speichere und rechne Beträge in ganzen Rappen, zeig sie mit zwei Nachkommastellen und der Währung im Feld und nimm nie Gleitkomma.",
                docsId: "handbuch-eingaben-e-06-geld-in-rappen--docs",
            },
        ],
    },
    {
        title: "Auswählen",
        description: "Ja/Nein, eine aus wenigen, ein anderer Datensatz, Dateien.",
        rules: [
            {
                id: "E-07",
                title: "Checkbox speichert mit und Schalter wirkt sofort",
                summary: "Nimm im Formular mit „Speichern“ eine Checkbox und für Einstellungen, die sofort gelten, einen Schalter – beschriftet mit dem eingeschalteten Zustand, nie mit einer Verneinung.",
                docsId: "handbuch-eingaben-e-07-checkbox-speichert-mit-und-schalter-wirkt-sofort--docs",
            },
            {
                id: "E-08",
                title: "Wenige Möglichkeiten sind sichtbar",
                summary: "Zeig bis fünf Möglichkeiten alle auf einmal – als Liste oder bei kurzen Wörtern als Segmente – und nimm eine Auswahlliste erst ab sechs.",
                docsId: "handbuch-eingaben-e-08-wenige-möglichkeiten-sind-sichtbar--docs",
            },
            {
                id: "E-09",
                title: "Verknüpfen heisst suchen, erkennen, notfalls anlegen",
                summary: "Lass nach Nummer und Name suchen, zeig pro Treffer eine zweite Zeile zum Unterscheiden, die zuletzt benutzten zuerst, biete „… neu anlegen“ mit dem getippten Text an und mach den gewählten Datensatz zum Link.",
                docsId: "handbuch-eingaben-e-09-verknüpfen-heisst-suchen-erkennen-notfalls-anlegen--docs",
            },
            {
                id: "E-10",
                title: "Dateien zeigen was mit ihnen passiert",
                summary: "Zeig pro Datei Name, Grösse, Vorschau und Fortschritt, nenn bei einer Ablehnung den Grund genau an dieser Datei und lass die anderen weiterlaufen.",
                docsId: "handbuch-eingaben-e-10-dateien-zeigen-was-mit-ihnen-passiert--docs",
            },
        ],
    },
]
