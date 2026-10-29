import type { RuleGroup } from "../rules.types"

export const PRINT_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Drucken",
        description: "Was kommt aufs Papier, und wie?",
        rules: [
            {
                id: "P-01",
                title: "Gedrucktes ist für Papier gebaut",
                summary: "Bau eine eigene Druckansicht in A4 ohne Menü, Knöpfe und Farbflächen und mach jede Bedeutung in Schwarzweiss lesbar.",
                docsId: "handbuch-druck-p-01-gedrucktes-ist-für-papier-gebaut--docs",
            },
            {
                id: "P-02",
                title: "Der Laufzettel trägt das Nötigste gross",
                summary: "Druck die Nummer sehr gross, darunter den Barcode und genau das, was die Station zeigt, in derselben Reihenfolge, Hinweise als Kasten.",
                docsId: "handbuch-druck-p-02-der-laufzettel-trägt-das-nötigste-gross--docs",
            },
            {
                id: "P-03",
                title: "Barcodes mit Ruhezone und Klartext",
                summary: "Druck Code 128 mit mindestens 0.33 mm Modulbreite, 12 mm Höhe und zehn Modulen Ruhezone, mit Klartext darunter, in tatsächlicher Grösse.",
                docsId: "handbuch-druck-p-03-barcodes-mit-ruhezone-und-klartext--docs",
            },
            {
                id: "P-04",
                title: "Jede Seite trägt Kopf und Fuss",
                summary: "Wiederhol auf jeder Seite Firma, Dokument und Nummer oben, Seite und Druckdatum unten; Tabellenköpfe wiederholen sich, Zeilen werden nicht getrennt.",
                docsId: "handbuch-druck-p-04-jede-seite-trägt-kopf-und-fuss--docs",
            },
        ],
    },
    {
        title: "Exportieren",
        description: "Was geht hinaus, und wie kommt es an?",
        rules: [
            {
                id: "P-05",
                title: "Export nimmt mit was man sieht",
                summary: "Exportier mit denselben Filtern, derselben Sortierung und denselben Spalten wie die Liste und sag vorher, was in der Datei steht.",
                docsId: "handbuch-druck-p-05-export-nimmt-mit-was-man-sieht--docs",
            },
            {
                id: "P-06",
                title: "Der Dateiname sagt was und wann",
                summary: "Nenn die Datei nach Inhalt, Filter und Datum („Laufzettel_Station-Guss_2026-10-29.csv“), nie „export.csv“.",
                docsId: "handbuch-druck-p-06-der-dateiname-sagt-was-und-wann--docs",
            },
            {
                id: "P-07",
                title: "Excel öffnet es richtig",
                summary: "Schreib CSV mit UTF-8-BOM und Semikolon, Zahlen ohne Tausender-Zeichen mit Punkt, Daten als TT.MM.JJJJ und Kennungen als Text.",
                docsId: "handbuch-druck-p-07-excel-öffnet-es-richtig--docs",
            },
            {
                id: "P-08",
                title: "Grosses läuft im Hintergrund",
                summary: "Lass grosse Exporte im Hintergrund laufen, mit Meldung und Link zum Herunterladen am Ende.",
                docsId: "handbuch-druck-p-08-grosses-läuft-im-hintergrund--docs",
            },
        ],
    },
]
