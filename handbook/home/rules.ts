import type { RuleGroup } from "../rules.types"

export const HOME_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Was heute dran ist",
        description: "Was sieht man zuerst nach dem Anmelden?",
        rules: [
            {
                id: "A-01",
                title: "Die Startseite sagt was heute dran ist",
                summary: "Zeig oben den eigenen Arbeitsvorrat – überfällig, heute fällig, wartet auf mich – mit dem Grund pro Zeile und Kennzahlen höchstens darunter.",
                docsId: "handbuch-startseite-a-01-die-startseite-sagt-was-heute-dran-ist--docs",
            },
            {
                id: "A-02",
                title: "Meins zuerst",
                summary: "Stell, was mir oder meiner Station gehört, vor das, was das Team betrifft, und mach „Alle“ zu einem Link statt zur Voreinstellung.",
                docsId: "handbuch-startseite-a-02-meins-zuerst--docs",
            },
            {
                id: "A-03",
                title: "Dringendes oben und mit Grund",
                summary: "Sortier nach Frist und Dringlichkeit und sag in jeder Zeile in Worten, warum sie da ist.",
                docsId: "handbuch-startseite-a-03-dringendes-oben-und-mit-grund--docs",
            },
            {
                id: "A-04",
                title: "Leer heisst nichts zu tun und was als Nächstes kommt",
                summary: "Sag bei leerem Vorrat ruhig, dass nichts zu tun ist, und nenn den nächsten Termin – ohne Jubel.",
                docsId: "handbuch-startseite-a-04-leer-heisst-nichts-zu-tun-und-was-als-nächstes-kommt--docs",
            },
        ],
    },
    {
        title: "Zahlen",
        description: "Was zählt, und stimmt es?",
        rules: [
            {
                id: "A-05",
                title: "Jede Zahl führt in die Liste dahinter",
                summary: "Mach jede Kennzahl zu einem Link auf die gefilterte Liste, die dieselbe Zahl zeigt.",
                docsId: "handbuch-startseite-a-05-jede-zahl-führt-in-die-liste-dahinter--docs",
            },
            {
                id: "A-06",
                title: "Zahlen sagen von wann sie sind",
                summary: "Schreib „Stand 10:30“ mit „Aktualisieren“ dazu und hol neue Zahlen, sobald die Seite wieder sichtbar wird.",
                docsId: "handbuch-startseite-a-06-zahlen-sagen-von-wann-sie-sind--docs",
            },
        ],
    },
    {
        title: "Weg zurück",
        description: "Wie macht man nach einer Unterbrechung weiter?",
        rules: [
            {
                id: "A-07",
                title: "Zuletzt geöffnet ist ein Weg zurück",
                summary: "Zeig die letzten fünf geöffneten Datensätze mit Art und Kennung als Links.",
                docsId: "handbuch-startseite-a-07-zuletzt-geöffnet-ist-ein-weg-zurück--docs",
            },
            {
                id: "A-08",
                title: "Jede Rolle hat ihre Startseite",
                summary: "Bau die Startseite pro Rolle aus denselben Bausteinen mit anderem Inhalt: Büro plant, Werkstatt arbeitet ab, Teamleitung sieht, was festhängt.",
                docsId: "handbuch-startseite-a-08-jede-rolle-hat-ihre-startseite--docs",
            },
        ],
    },
]
