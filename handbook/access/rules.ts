import type { RuleGroup } from "../rules.types"

export const ACCESS_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Zeigen",
        description: "Was sieht, wer etwas nicht darf?",
        rules: [
            {
                id: "B-01",
                title: "Ausblenden sperren oder erklären",
                summary: "Blend aus, was eine Rolle nie darf, sperr mit Grund, was sie gerade nicht darf, und zeig mit „Nur Teamleitung“ und einem Weg, was sie kennen muss.",
                docsId: "handbuch-rechte-b-01-ausblenden-sperren-oder-erklären--docs",
            },
            {
                id: "B-02",
                title: "Gesperrt heisst mit Grund und mit Weg",
                summary: "Schreib neben jeden gesperrten Knopf sichtbar, warum und wer es darf oder was zuerst passieren muss – nicht nur im Tooltip.",
                docsId: "handbuch-rechte-b-02-gesperrt-heisst-mit-grund-und-mit-weg--docs",
            },
            {
                id: "B-03",
                title: "Nur lesen sieht aus wie lesen",
                summary: "Zeig Werte für Leserechte als Text mit einem ruhigen Hinweis oben, nicht als Formular mit ausgegrauten Feldern.",
                docsId: "handbuch-rechte-b-03-nur-lesen-sieht-aus-wie-lesen--docs",
            },
            {
                id: "B-04",
                title: "Was man nicht sehen darf hinterlässt keine Lücke",
                summary: "Lass Felder, Spalten und Summen ohne Leserecht ganz weg – keine Striche, keine Sterne, keine leeren Spalten.",
                docsId: "handbuch-rechte-b-04-was-man-nicht-sehen-darf-hinterlässt-keine-lücke--docs",
            },
        ],
    },
    {
        title: "Wissen",
        description: "Wer bin ich hier, und als wen sehe ich es?",
        rules: [
            {
                id: "B-05",
                title: "Die Rolle ist sichtbar",
                summary: "Zeig Name und Rolle im Benutzermenü und eine Übersicht „Was darf ich?“ nach Bereichen in Worten.",
                docsId: "handbuch-rechte-b-05-die-rolle-ist-sichtbar--docs",
            },
            {
                id: "B-06",
                title: "Als jemand anderes ansehen ist unübersehbar",
                summary: "Zeig beim Ansehen als andere Person ein Band oben mit wem und einem Weg zurück und halte Änderungen mit beiden Namen fest.",
                docsId: "handbuch-rechte-b-06-als-jemand-anderes-ansehen-ist-unübersehbar--docs",
            },
        ],
    },
    {
        title: "Weiterkommen",
        description: "Wie kommt man zu Rechten, und wer prüft?",
        rules: [
            {
                id: "B-07",
                title: "Zugriff anfragen statt Sackgasse",
                summary: "Biete dort, wo Rechte fehlen, „Zugriff anfragen“ mit einem Grund an, der mit Link auf diese Stelle an die zuständige Person geht.",
                docsId: "handbuch-rechte-b-07-zugriff-anfragen-statt-sackgasse--docs",
            },
            {
                id: "B-08",
                title: "Der Server entscheidet und die Oberfläche spiegelt",
                summary: "Prüf jede Anfrage auf dem Server; die Oberfläche zeigt nur, was er erlaubt, und sagt eine Ablehnung als Satz.",
                docsId: "handbuch-rechte-b-08-der-server-entscheidet-und-die-oberfläche-spiegelt--docs",
            },
        ],
    },
]
