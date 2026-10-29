import type { RuleGroup } from "../rules.types"

export const RECORD_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Aufbau",
        description: "Wo steht was auf der Seite?",
        rules: [
            {
                id: "D-01",
                title: "Inhalt links und Eigenschaften rechts",
                summary: "Zeig Inhalt, Zugehöriges und Verlauf in der Hauptspalte und die Eigenschaften als Liste in einer schmalen Seitenspalte – auf schmalen Bildschirmen die Eigenschaften zuerst.",
                docsId: "handbuch-datensatz-d-01-inhalt-links-und-eigenschaften-rechts--docs",
            },
            {
                id: "D-02",
                title: "Das Wichtigste auf einen Blick",
                summary: "Stell höchstens vier Kennzahlen, die für die Arbeit zählen, direkt unter den Kopf, jede mit einem Wort Einordnung, und färb bei einer Warnung nur die betroffene Zahl.",
                docsId: "handbuch-datensatz-d-02-das-wichtigste-auf-einen-blick--docs",
            },
            {
                id: "D-03",
                title: "Eigenschaften in fester Reihenfolge",
                summary: "Zeig Eigenschaften als Beschriftung und Wert, bei allen Datensätzen dieser Art in derselben Reihenfolge, das Häufigste oben, Verweise als Links.",
                docsId: "handbuch-datensatz-d-03-eigenschaften-in-fester-reihenfolge--docs",
            },
        ],
    },
    {
        title: "Werte",
        description: "Wie zeigt sich ein einzelner Wert?",
        rules: [
            {
                id: "D-04",
                title: "Leere Werte sagen was fehlt",
                summary: "Schreib statt eines Strichs, was fehlt („Kein Liefertermin“), biete wo erlaubt direkt „Hinzufügen“ an und lass weg, was für diesen Datensatz nicht zutrifft.",
                docsId: "handbuch-datensatz-d-04-leere-werte-sagen-was-fehlt--docs",
            },
            {
                id: "D-05",
                title: "Kennungen sind kopierbar",
                summary: "Stell neben jede Kennung, Nummer oder Adresse, die man weitergibt, einen Knopf zum Kopieren, der danach kurz „Kopiert“ zeigt.",
                docsId: "handbuch-datensatz-d-05-kennungen-sind-kopierbar--docs",
            },
            {
                id: "D-06",
                title: "Termine sagen wie weit weg sie sind",
                summary: "Zeig Termine als Abstand und als Datum („in 5 Tagen · Fr, 14.11.2026“) und markier überfällige als Warnung.",
                docsId: "handbuch-datensatz-d-06-termine-sagen-wie-weit-weg-sie-sind--docs",
            },
        ],
    },
    {
        title: "Bearbeiten",
        description: "Wie ändert man, was man sieht?",
        rules: [
            {
                id: "D-07",
                title: "Einzelne Angaben an Ort und Stelle ändern",
                summary: "Lass eine Angabe dort ändern, wo sie steht: Enter oder Verlassen speichert, Escape verwirft, „Speichert …“ ist sichtbar und ein Fehler steht am Feld mit dem getippten Wert.",
                docsId: "handbuch-datensatz-d-07-einzelne-angaben-an-ort-und-stelle-ändern--docs",
            },
            {
                id: "D-08",
                title: "Viele Angaben zusammen im Formular",
                summary: "Lass ändern, was zusammen stimmen muss (Adresse, Positionen), in einem Formular nach den F-Regeln – hinter einem Knopf „Bearbeiten“ für genau diese Gruppe.",
                docsId: "handbuch-datensatz-d-08-viele-angaben-zusammen-im-formular--docs",
            },
        ],
    },
    {
        title: "Zusammenhang",
        description: "Was gehört dazu, und woher kommt es?",
        rules: [
            {
                id: "D-09",
                title: "Zugehöriges steht beim Datensatz",
                summary: "Zeig zugehörige Datensätze als kurze Listen mit Anzahl, die ersten fünf und „Alle N anzeigen“ zur gefilterten Liste, leer mit einem Satz und der Aktion.",
                docsId: "handbuch-datensatz-d-09-zugehöriges-steht-beim-datensatz--docs",
            },
            {
                id: "D-10",
                title: "Herkunft steht am Rand",
                summary: "Schreib klein am Ende der Seitenspalte, wer wann angelegt und zuletzt geändert hat, mit Link zum Verlauf; interne IDs nur dort und kopierbar.",
                docsId: "handbuch-datensatz-d-10-herkunft-steht-am-rand--docs",
            },
        ],
    },
]
