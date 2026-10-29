import type { RuleGroup } from "../rules.types"

export const FEEDBACK_RULE_GROUPS: RuleGroup[] = [
    {
        title: "Stand",
        description: "Wo steht das Speichern, und wo antwortet die Software?",
        rules: [
            {
                id: "R-01",
                title: "Der Speicherstand ist immer sichtbar",
                summary: "Sag in Worten neben dem Speichern-Knopf, wo das Speichern steht: nicht gespeichert, speichert, gespeichert vor 2 min, nicht gespeichert mit Grund und „Erneut versuchen“.",
                docsId: "handbuch-speichern-r-01-der-speicherstand-ist-immer-sichtbar--docs",
            },
            {
                id: "R-02",
                title: "Die Rückmeldung steht dort wo man gehandelt hat",
                summary: "Antworte am Feld oder Formular; eine schwebende Meldung nur, wenn der Ort verschwindet oder die Arbeit im Hintergrund weiterläuft, und nie mit einer Aufgabe ausser „Rückgängig“.",
                docsId: "handbuch-speichern-r-02-die-rückmeldung-steht-dort-wo-man-gehandelt-hat--docs",
            },
            {
                id: "R-03",
                title: "Meldungen sind kurz und bleiben solange man sie braucht",
                summary: "Schreib einen Satz mit höchstens einer Aktion; Erfolg verschwindet nach 5 s (mit Rückgängig 8 s) und nicht, solange Zeiger oder Fokus darauf sind; Fehler bleiben, bis man sie schliesst.",
                docsId: "handbuch-speichern-r-03-meldungen-sind-kurz-und-bleiben-solange-man-sie-braucht--docs",
            },
        ],
    },
    {
        title: "Schnell und sicher",
        description: "Wie fühlt sich Speichern schnell an, ohne zu schaden?",
        rules: [
            {
                id: "R-04",
                title: "Sofort zeigen wenn der Weg zurück sicher ist",
                summary: "Lass Umschalten, Status setzen und Zuweisen sofort wirken mit Rückgängig, nimm sie bei einem Fehler sichtbar zurück und frag nur bei Endgültigem.",
                docsId: "handbuch-speichern-r-04-sofort-zeigen-wenn-der-weg-zurück-sicher-ist--docs",
            },
            {
                id: "R-05",
                title: "Doppelt klicken speichert einmal",
                summary: "Halte den Knopf während des Speicherns beschäftigt, ohne Fokus und Text zu verlieren, und schick denselben Stand nicht zweimal.",
                docsId: "handbuch-speichern-r-05-doppelt-klicken-speichert-einmal--docs",
            },
            {
                id: "R-06",
                title: "Was dauert zeigt sich",
                summary: "Zeig unter 1 s nichts, ab 1 s ein Zeichen mit Text und ab 10 s Fortschritt oder das Angebot, im Hintergrund weiterzuarbeiten.",
                docsId: "handbuch-speichern-r-06-was-dauert-zeigt-sich--docs",
            },
        ],
    },
    {
        title: "Wenn es schiefgeht",
        description: "Was passiert bei Fehlern, Konflikten und ohne Verbindung?",
        rules: [
            {
                id: "R-07",
                title: "Fehler in Sätzen mit nächstem Schritt",
                summary: "Übersetz jeden Fehler in einen Satz, was passiert ist und was jetzt zu tun ist, Prüffehler an die Felder und unerwartete mit einem Code für den Support.",
                docsId: "handbuch-speichern-r-07-fehler-in-sätzen-mit-nächstem-schritt--docs",
            },
            {
                id: "R-08",
                title: "Konflikte zeigen statt überschreiben",
                summary: "Zeig beim Speichern, wer seit dem Öffnen was geändert hat, Feld für Feld, und lass wählen – nichts wird still überschrieben.",
                docsId: "handbuch-speichern-r-08-konflikte-zeigen-statt-überschreiben--docs",
            },
            {
                id: "R-09",
                title: "Eine abgelaufene Sitzung verliert nichts",
                summary: "Lass über der Seite neu anmelden, wiederhole danach das Speichern und halte Eingaben als Entwurf im Browser, auch über ein Neuladen.",
                docsId: "handbuch-speichern-r-09-eine-abgelaufene-sitzung-verliert-nichts--docs",
            },
            {
                id: "R-10",
                title: "Ohne Verbindung weiterarbeiten soweit es geht",
                summary: "Sag in einem Band, dass die Verbindung fehlt und was das heisst, lass warten, was warten kann, und sperr den Rest mit Grund.",
                docsId: "handbuch-speichern-r-10-ohne-verbindung-weiterarbeiten-soweit-es-geht--docs",
            },
        ],
    },
]
