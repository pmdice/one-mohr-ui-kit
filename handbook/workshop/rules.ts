import type { RuleGroup } from "../rules.types"

export const WORKSHOP_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Einrichten",
        description: "Wo steht das Gerät, und wie sieht man es?",
        rules: [
            {
                id: "W-01",
                title: "Ein Gerät gehört zu einer Station",
                summary: "Ordne das Tablet einmal einer Station zu, zeig sie gross auf jeder Werkstatt-Seite und mach den Wechsel bewusst – weit weg vom Scan und mit Bestätigung.",
                docsId: "handbuch-werkstatt-w-01-ein-gerät-gehört-zu-einer-station--docs",
            },
            {
                id: "W-02",
                title: "Die Kamera ist die Seite",
                summary: "Lass das Kamerabild den grössten Teil des Bildschirms füllen und von selbst starten, zeig mit einem Rahmen, wohin der Code gehört, und biete darunter immer eine Eingabe für Hand-Scanner oder Nummer.",
                docsId: "handbuch-werkstatt-w-02-die-kamera-ist-die-seite--docs",
            },
            {
                id: "W-03",
                title: "Gross genug für Handschuhe und Abstand",
                summary: "Nutze die komfortable Dichte, Ziele von mindestens 48 px und die wichtigste Information in mindestens 20 px – ohne Hover, Tooltips oder Bedeutung nur im Icon.",
                docsId: "handbuch-werkstatt-w-03-gross-genug-für-handschuhe-und-abstand--docs",
            },
        ],
    },
    {
        title: "Scannen",
        description: "Was sagt ein Scan, und was, wenn er scheitert?",
        rules: [
            {
                id: "W-04",
                title: "Die Rückmeldung ist für Augen und Ohren",
                summary: "Zeig jeden Scan über die ganze Breite mit dem grossen Wort EIN oder AUS, Icon, Farbe und einem Satz, spiel einen kurzen Ton (abschaltbar) und lass die Rückmeldung bis zum nächsten Scan stehen.",
                docsId: "handbuch-werkstatt-w-04-die-rückmeldung-ist-für-augen-und-ohren--docs",
            },
            {
                id: "W-05",
                title: "Nur das Nötigste zum Zettel",
                summary: "Zeig nach dem Scan höchstens fünf Angaben – Kennung, Kunde, Material, Stück, Dringlichkeit – und Hinweise zum Zettel gross als Warnung darüber.",
                docsId: "handbuch-werkstatt-w-05-nur-das-nötigste-zum-zettel--docs",
            },
            {
                id: "W-06",
                title: "Fehler sagen was jetzt zu tun ist",
                summary: "Lass jede Fehlermeldung den nächsten Schritt nennen und einen versehentlichen Scan 10 Sekunden lang mit einem grossen Knopf zurücknehmen.",
                docsId: "handbuch-werkstatt-w-06-fehler-sagen-was-jetzt-zu-tun-ist--docs",
            },
        ],
    },
    {
        title: "Verl\u00e4sslich",
        description: "Was passiert ohne Netz, und was liegt hier?",
        rules: [
            {
                id: "W-07",
                title: "Kein Scan geht verloren",
                summary: "Speichere einen Scan ohne Verbindung sofort auf dem Gerät, bestätige ihn als „gespeichert, wird gesendet“, zeig dauernd, wie viele warten, und sende sie später in Reihenfolge mit ihrer ursprünglichen Zeit.",
                docsId: "handbuch-werkstatt-w-07-kein-scan-geht-verloren--docs",
            },
            {
                id: "W-08",
                title: "Was hier liegt ist sichtbar",
                summary: "Zeig neben der Kamera die Liste der Zettel, die an dieser Station eingescannt sind – die längsten zuerst, mit Dauer und Richtzeit-Warnung.",
                docsId: "handbuch-werkstatt-w-08-was-hier-liegt-ist-sichtbar--docs",
            },
        ],
    },
]
