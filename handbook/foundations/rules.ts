import type { RuleGroup } from "../rules.types"

export const FOUNDATION_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Farbe & Fläche",
        description: "Was bedeutet eine Farbe, was eine Ebene?",
        rules: [
            {
                id: "G-01",
                title: "Farbe trägt Bedeutung und sonst nichts",
                summary: "Halte alles grau und nimm Farbe nur für die Hauptaktion, Auswahl und Links (Akzent) und für Fehler, Warnung und Erfolg – nie als Schmuck und nie als einzigen Träger.",
                docsId: "handbuch-grundlagen-g-01-farbe-trägt-bedeutung-und-sonst-nichts--docs",
            },
            {
                id: "G-02",
                title: "Drei Ebenen und Schatten nur für Schwebendes",
                summary: "Gliedere mit drei Flächen (Hintergrund, Inhalt, darüber) und Linien; einen Schatten bekommt nur, was über anderem schwebt.",
                docsId: "handbuch-grundlagen-g-02-drei-ebenen-und-schatten-nur-für-schwebendes--docs",
            },
            {
                id: "G-03",
                title: "Hell und dunkel sind gleichwertig",
                summary: "Gib jedem Token einen hellen und einen dunklen Wert, prüfe Kontraste in beiden und lass nur echte Dinge (Kamerabild, Papier) ihre eigene Farbe behalten.",
                docsId: "handbuch-grundlagen-g-03-hell-und-dunkel-sind-gleichwertig--docs",
            },
        ],
    },
    {
        title: "Grösse & Raum",
        description: "Wie gross, wie weit, wie dicht?",
        rules: [
            {
                id: "G-04",
                title: "Wenige Schriftstufen mit festen Rollen",
                summary: "Nutze fünf Schriftgrössen mit festen Rollen (12 bis 20 px), ordne über Gewicht und Textfarbe und geh nie unter 12 px.",
                docsId: "handbuch-grundlagen-g-04-wenige-schriftstufen-mit-festen-rollen--docs",
            },
            {
                id: "G-05",
                title: "Abstände aus einem 4-px-Raster",
                summary: "Nimm Abstände aus 4, 8, 12, 16, 24 und 32 px und setz Zusammengehöriges enger als Getrenntes.",
                docsId: "handbuch-grundlagen-g-05-abstände-aus-einem-4-px-raster--docs",
            },
            {
                id: "G-06",
                title: "Zwei Dichten und eine Komponente",
                summary: "Setz die Dichte einmal am Wurzelelement – kompakt am Schreibtisch, komfortabel an Tablet und Werkstatt – und bau keine zweite Komponente für Touch.",
                docsId: "handbuch-grundlagen-g-06-zwei-dichten-und-eine-komponente--docs",
            },
        ],
    },
    {
        title: "Bedienung",
        description: "Wie sieht man, wo man ist und was passiert?",
        rules: [
            {
                id: "G-07",
                title: "Der Fokus ist immer sichtbar",
                summary: "Zeig den Tastatur-Fokus als deutlichen Ring, entferne den Umriss nie ohne Ersatz und lass die Reihenfolge dem Lesefluss folgen.",
                docsId: "handbuch-grundlagen-g-07-der-fokus-ist-immer-sichtbar--docs",
            },
            {
                id: "G-08",
                title: "Bewegung erklärt und schmückt nicht",
                summary: "Bewege nur, um Herkunft oder Zustand zu zeigen, kurz (120–200 ms), und lass alles weg, wenn jemand „Bewegung reduzieren“ eingestellt hat.",
                docsId: "handbuch-grundlagen-g-08-bewegung-erklärt-und-schmückt-nicht--docs",
            },
            {
                id: "G-09",
                title: "Icons begleiten Text",
                summary: "Stell Icons neben ein Wort; allein nur bei allgemein bekannten Zeichen und dann mit Beschriftung – und dasselbe Icon heisst überall dasselbe.",
                docsId: "handbuch-grundlagen-g-09-icons-begleiten-text--docs",
            },
        ],
    },
    {
        title: "Sprache",
        description: "Wie spricht die Software?",
        rules: [
            {
                id: "G-10",
                title: "Gleiche Wörter für gleiche Dinge",
                summary: "Benenne Knöpfe mit dem Verb dessen, was passiert, nimm dasselbe Wort in Knopf, Meldung und Verlauf und schreib Schweizer Hochdeutsch ohne Entwickler-Wörter.",
                docsId: "handbuch-grundlagen-g-10-gleiche-wörter-für-gleiche-dinge--docs",
            },
        ],
    },
]
