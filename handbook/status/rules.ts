import type { RuleGroup } from "../rules.types"

export const STATUS_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Status zeigen",
        description: "Wie steht es, wo ist es, seit wann?",
        rules: [
            {
                id: "S-01",
                title: "Ein Status hat ein Wort und eine Form",
                summary: "Ordne jeden Status einer von fünf Kategorien zu – Geplant, In Arbeit, Wartet, Erledigt, Abgebrochen – und zeige ihn überall mit demselben Wort, derselben Form und derselben Farbe.",
                docsId: "handbuch-status-s-01-ein-status-hat-ein-wort-und-eine-form--docs",
            },
            {
                id: "S-02",
                title: "Ort und Stand sind zwei Angaben",
                summary: "Zeige getrennt, wie weit etwas ist (Stand) und wo es gerade ist (Ort) – im Kopf nebeneinander, in Listen als eigene Spalten.",
                docsId: "handbuch-status-s-02-ort-und-stand-sind-zwei-angaben--docs",
            },
            {
                id: "S-03",
                title: "Seit wann und ob es zu lange ist",
                summary: "Zeige neben Stand und Ort, seit wann sie gelten, und weise in Worten darauf hin, wenn eine Richtzeit überschritten ist.",
                docsId: "handbuch-status-s-03-seit-wann-und-ob-es-zu-lange-ist--docs",
            },
            {
                id: "S-04",
                title: "Abgeleiteter Status wird gezeigt und nicht gesetzt",
                summary: "Berechne einen Status, der sich aus Teilen ergibt (Auftrag aus seinen Laufzetteln), zeige ihn mit Fortschritt und biete kein Auswahlfeld dafür an.",
                docsId: "handbuch-status-s-04-abgeleiteter-status-wird-gezeigt-und-nicht-gesetzt--docs",
            },
        ],
    },
    {
        title: "Status \u00e4ndern",
        description: "Welche Schritte gehen, und wie sicher sind sie?",
        rules: [
            {
                id: "S-05",
                title: "Nur erlaubte Schritte und der nächste vorne",
                summary: "Biete nur die Schritte an, die der Ablauf von hier aus erlaubt – den üblichen als Knopf mit Verb, den Rest im Status-Menü (Kürzel S) – und nenne den Grund, wenn der übliche gerade nicht geht.",
                docsId: "handbuch-status-s-05-nur-erlaubte-schritte-und-der-nächste-vorne--docs",
            },
            {
                id: "S-06",
                title: "Bestätigen nur was sich nicht zurücknehmen lässt",
                summary: "Frage nur bei endgültigen oder folgenreichen Schritten nach, mit den Folgen im Text und einem Knopf, der wie die Handlung heisst; alles andere passiert sofort und lässt sich 8 Sekunden lang rückgängig machen.",
                docsId: "handbuch-status-s-06-bestätigen-nur-was-sich-nicht-zurücknehmen-lässt--docs",
            },
            {
                id: "S-07",
                title: "Ein Scan gibt eine eindeutige Rückmeldung",
                summary: "Behandle einen Scan wie jeden Wechsel – ein, wenn der Zettel nicht hier liegt, aus, wenn er hier liegt – und antworte gross in einem Satz mit Kennung, Richtung und Station.",
                docsId: "handbuch-status-s-07-ein-scan-gibt-eine-eindeutige-rückmeldung--docs",
            },
            {
                id: "S-08",
                title: "Abgeschlossen heisst gesperrt mit Grund und Weg zurück",
                summary: "Zeige bei einem erledigten oder abgebrochenen Datensatz oben, wann, von wem und warum er abgeschlossen wurde, sperre die Felder lesbar und biete „Wieder öffnen“ an – oder sage, wer es darf.",
                docsId: "handbuch-status-s-08-abgeschlossen-heisst-gesperrt-mit-grund-und-weg-zurück--docs",
            },
        ],
    },
    {
        title: "Nachvollziehen",
        description: "Was ist passiert, und wo liest man es?",
        rules: [
            {
                id: "S-09",
                title: "Jede Änderung hinterlässt einen Eintrag",
                summary: "Schreibe für jeden Wechsel von Stand, Ort und Feldern einen Verlaufseintrag – wer, wann, was (alt → neu) und wie (von Hand, per Scan, automatisch) – und ändere oder lösche Einträge nie.",
                docsId: "handbuch-status-s-09-jede-änderung-hinterlässt-einen-eintrag--docs",
            },
            {
                id: "S-10",
                title: "Der Durchlauf zeigt den Weg",
                summary: "Zeige den Weg durch die Stationen als geordnete Liste vom ersten zum letzten Besuch, mit Ein, Aus und Dauer, mehrfache Besuche gezählt und den aktuellen als „jetzt hier“.",
                docsId: "handbuch-status-s-10-der-durchlauf-zeigt-den-weg--docs",
            },
            {
                id: "S-11",
                title: "Der Verlauf liest sich wie Sätze",
                summary: "Schreibe Verlaufseinträge als Sätze mit Namen und Bezeichnungen statt IDs und Feldnamen, Zeit relativ mit genauer Zeit im Tooltip, und fasse eine Serie von Feldänderungen derselben Person aufklappbar zusammen.",
                docsId: "handbuch-status-s-11-der-verlauf-liest-sich-wie-sätze--docs",
            },
            {
                id: "S-12",
                title: "Der Verlauf ist dort wo man ihn braucht",
                summary: "Zeige auf der Detailseite die letzten 3 Einträge mit „Ganzer Verlauf“ und im Tab „Verlauf“ alle, neueste zuerst, filterbar nach Alle / Status & Ort / Felder – mit dem Filter in der URL.",
                docsId: "handbuch-status-s-12-der-verlauf-ist-dort-wo-man-ihn-braucht--docs",
            },
        ],
    },
]
