# One Mohr UI Kit

**Ein Handbuch für Firmensoftware.** Keine Websites und keine Shops, sondern Arbeitssoftware: grosse CRUD-Anwendungen mit vielen Bedingungen, bei denen jedes kleine Detail darüber entscheidet, ob die Software gern benutzt wird. Vorbild sind Linear und Vercel: ruhige Flächen, wenige Farben mit Bedeutung, schnelle Bedienung mit der Tastatur.

Das Kit hält **Regeln** fest, die unabhängig vom Framework formuliert sind. Jede Regel hat eine ID (`F-01`), einen Satz als Anweisung, eine Begründung, ein lebendiges Gut/Schlecht-Beispiel und einen Abschnitt *Übertragen* für andere Stacks (vor allem Laravel Nova). Die React-Komponenten sind eine **Referenz-Umsetzung**; übertragen wird das Verhalten, nicht der Code.

## Bereiche

| Präfix | Bereich | Inhalt |
|---|---|---|
| G | Grundlagen | Farbe, Ebenen, hell/dunkel, Schrift, Abstände, Dichte, Fokus, Bewegung, Icons, Sprache |
| F | Formulare | Pflichtfelder, Fehler, Abschnitte, Positionen, bedingte Felder, Tastatur, Speichern |
| E | Eingaben | Zahlen mit Einheit, Geld in Rappen, Schweizer Daten, Ja/Nein, Auswahl, Verknüpfungen, Dateien |
| N | Navigation & App-Rahmen | Pfad, Menü, Zurück, Blättern, Seitenkopf, Suche, Tabs |
| L | Listen & Tabellen | Kennung, Zahlen, Status, Filter, Sortierung, leer, laden, Tastatur, Auswahl |
| D | Datensatz-Seite | Inhalt und Eigenschaften, Kennzahlen, leere Werte, Kopieren, Termine, Ändern an Ort und Stelle, Zugehöriges |
| R | Speichern & Rückmeldung | Speicherstand, Meldungen, sofort mit Rückgängig, doppelt klicken, lange Vorgänge, Fehler in Sätzen, Konflikte, Sitzung, Verbindung |
| S | Status & Lebenszyklus | Status-Sprache, erlaubte Schritte, Bestätigen, Scan, Sperre, Verlauf |
| P | Druck & Export | Druckansicht, Laufzettel, Barcodes, Kopf und Fuss, Export nach Ansicht, Dateinamen, Excel-taugliche CSV |
| B | Rechte & Rollen | ausblenden, sperren mit Grund, erklären; Leseansicht; keine Lücken; Rolle sichtbar; Zugriff anfragen |
| W | Werkstatt-Ansicht | Station, Kamera, grosse Ziele, Rückmeldung, Offline-Warteschlange |

Dazu in Storybook: **Tokens** (alle Werte live aus `app/tokens.css`) und **Komponenten** (jede Komponente mit Zweck und Regeln; ein Test hält die Liste vollständig).

## Loslegen

```bash
npm install
npm run storybook        # Handbuch und Beispiele auf http://localhost:6006 (Node 24)
npx vitest run           # alle Tests
npx eslint .             # Lint
npm run build-storybook  # statischer Build nach storybook-static/
```

## Aufbau

```
app/tokens.css        Design-Tokens als reine CSS-Variablen (Farben, Radien, Dichte, Schatten, Bewegung)
app/globals.css       Tailwind-4-Zuordnung der Tokens, Utilities (h-control, gap-stack, shadow-overlay …)
components/           Referenz-Komponenten, nach Bereich (atoms, molecules, forms, nav, table, status, workshop)
  */examples/         ganze Beispiele, die alle Regeln eines Bereichs gleichzeitig anwenden
handbook/             Regeln als MDX: je Bereich rules.ts (Index), examples.tsx (Gut/Schlecht), eine Seite pro Regel
handbook/catalog.ts   Komponenten-Katalog
lib/tokens.guard.test.ts  verbietet Palettenfarben, Pillen-Radien, willkürliche Schriftgrössen in Komponenten
docs/superpowers/     Design-Dokumente (specs) und Umsetzungspläne (plans) je Teil
```

## Grundsätze für Beiträge

- **Nur Tokens.** Farben, Radien, Schatten und Grössen kommen aus `app/tokens.css`. Der Token-Guard prüft das.
- **Jede Regel mit Warum.** Ohne Begründung lässt sich eine Regel nicht auf neue Fälle übertragen.
- **Verhalten vor Optik.** Regeln beschreiben, was ein Mensch sieht und tut, nicht eine Hook-API.
- **Tests zuerst.** Jede Komponente hat Tests für ihr Verhalten (Vitest, Testing Library, happy-dom).
- **Neue Komponente → Katalog.** Sonst scheitert `handbook/catalog.test.ts`.

## Technik

Next 16, React 19, Tailwind CSS 4, class-variance-authority, lucide-react, Storybook 10, Vitest 4.
