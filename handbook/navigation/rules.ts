import type { RuleGroup } from "../rules.types"

export const NAV_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Orientierung",
        description: "Wo bin ich, wozu gehört das, wie komme ich zurück?",
        rules: [
            {
                id: "N-01",
                title: "Der Pfad zeigt die Zugehörigkeit",
                summary: "Zeige im Pfad, wozu ein Objekt gehört – immer gleich, egal ob man über Menü, Liste, Suche oder Scan gekommen ist.",
                docsId: "handbuch-navigation-n-01-der-pfad-zeigt-die-zugehörigkeit--docs",
            },
            {
                id: "N-02",
                title: "Das Menü zeigt die Herkunft",
                summary: "Lass die Markierung im Menü auf dem Eintrag, über den man gekommen ist; ohne Herkunft markiere das erste Pfad-Glied.",
                docsId: "handbuch-navigation-n-02-das-menü-zeigt-die-herkunft--docs",
            },
            {
                id: "N-03",
                title: "Zurück zur Liste an dieselbe Stelle",
                summary: "Führe von einem Objekt zurück in genau die Liste, aus der es geöffnet wurde – mit Ansicht, Filtern, Seite und hervorgehobener Zeile.",
                docsId: "handbuch-navigation-n-03-zurück-zur-liste-an-dieselbe-stelle--docs",
            },
            {
                id: "N-04",
                title: "Zwischen Geschwistern blättern",
                summary: "Lass auf einem Objekt zum vorherigen und nächsten derselben Menge springen, ohne zurückzugehen („1/4 im Auftrag ‹ ›“, J/K).",
                docsId: "handbuch-navigation-n-04-zwischen-geschwistern-blättern--docs",
            },
            {
                id: "N-05",
                title: "Der Seitenkopf sagt, was das ist",
                summary: "Gib jeder Objektseite denselben Kopf: Kennung und Name, Status, höchstens eine Hauptaktion, darunter die Seiten-Tabs.",
                docsId: "handbuch-navigation-n-05-der-seitenkopf-sagt-was-das-ist--docs",
            },
        ],
    },
    {
        title: "Finden",
        description: "Wie komme ich mit einer Nummer in der Hand zum Objekt?",
        rules: [
            {
                id: "N-06",
                title: "Suchbar ist alles, was man ablesen kann",
                summary: "Lass die globale Suche jede Kennung finden, die irgendwo steht, in jeder Schreibweise – und führe direkt zum Objekt.",
                docsId: "handbuch-navigation-n-06-suchbar-ist-alles-was-man-ablesen-kann--docs",
            },
            {
                id: "N-07",
                title: "Globale Suche und Listensuche sehen verschieden aus",
                summary: "Unterscheide die globale Suche (navigiert) sichtbar von der Listensuche (schränkt ein) und beschrifte, was durchsucht wird.",
                docsId: "handbuch-navigation-n-07-globale-suche-und-listensuche-sehen-verschieden-aus--docs",
            },
            {
                id: "N-08",
                title: "Jeder Verweis ist ein Link",
                summary: "Mach jede Erwähnung eines anderen Objekts zu einem Link auf dieses Objekt.",
                docsId: "handbuch-navigation-n-08-jeder-verweis-ist-ein-link--docs",
            },
        ],
    },
    {
        title: "Menü",
        description: "Was steht in der Sidebar, und wie sieht man den Unterschied?",
        rules: [
            {
                id: "N-09",
                title: "Eine Liste, ein Menüeintrag",
                summary: "Setz jede Liste genau einmal ins Menü; gefilterte Ansichten gehören in die Liste oder eingerückt darunter.",
                docsId: "handbuch-navigation-n-09-eine-liste-ein-menüeintrag--docs",
            },
            {
                id: "N-10",
                title: "Das Menü ist nach Häufigkeit gegliedert",
                summary: "Ordne oben die tägliche Arbeit, darunter die Stammdaten, unten die eingeklappte Verwaltung – jede Gruppe nach einer Logik.",
                docsId: "handbuch-navigation-n-10-das-menü-ist-nach-häufigkeit-gegliedert--docs",
            },
            {
                id: "N-11",
                title: "Seiten-Tabs sind keine Filter",
                summary: "Gestalte Seiten-Tabs (Unterseiten eines Objekts) als Reiter und Listen-Ansichten als Segment-Schalter mit Anzahl.",
                docsId: "handbuch-navigation-n-11-seiten-tabs-sind-keine-filter--docs",
            },
            {
                id: "N-12",
                title: "Sidebar einklappen ohne Orientierungsverlust",
                summary: "Lass die Sidebar auf Icons einklappen – mit Namen im Tooltip, sichtbarer Markierung und gespeichertem Zustand.",
                docsId: "handbuch-navigation-n-12-sidebar-einklappen-ohne-orientierungsverlust--docs",
            },
        ],
    },
]
