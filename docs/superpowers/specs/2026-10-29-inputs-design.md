# Teil 6: Eingaben (E-01–E-10)

## Warum

Die Formular-Regeln (F) sagen, wie ein Formular als Ganzes arbeitet: Pflicht, Fehler, Abschnitte. Sie
sagen nicht, wie ein einzelnes Feld eine Angabe aufnimmt. Heute nimmt das Kit für ein Datum das
`type="date"` des Browsers (zeigt je nach Browser `11/14/2026`), für Mengen ein Textfeld, für Ja/Nein
rohe Checkboxen, die `DataTable` und das Werkstatt-Beispiel je selbst bauen. Gute Firmensoftware
(Linear, Vercel, Stripe-Dashboard) ist hier streng in der Anzeige und grosszügig bei der Eingabe:
„1,5“, „1.5“ und „1'500“ werden verstanden, „morgen“ ist ein Datum, und das Feld zeigt danach in einer
einzigen, Schweizer Schreibweise, was es verstanden hat.

Patrick hat freie Hand gegeben; alle Entscheidungen hier sind meine.

## Ziele

1. Zehn Regeln E-01–E-10 im Handbuch (gleiches Format wie die anderen Teile).
2. Bausteine: `NumberInput`, `MoneyInput`, `DateInput` (mit Kalender), `Checkbox`, `Switch`,
   `RadioGroup` (Liste und Segmente), `RecordPicker`, `FileDrop`, Zeichenzähler im `Textarea`.
3. Reine Funktionen zum Lesen und Schreiben von Zahlen, Beträgen und Daten (`components/inputs/parse.ts`),
   unabhängig von React und direkt nach PHP übertragbar.
4. Die bestehenden Stellen nutzen die neuen Bausteine: `DataTable` (Checkbox mit „teilweise“),
   Werkstatt-Beispiel (Switch), `OrderForm` (Liefertermin als `DateInput`, Menge als `NumberInput` mit „Stk.“,
   Fotos als `FileDrop`).
5. Ein Beispiel „Eingaben: Position erfassen“, das alle Regeln gleichzeitig zeigt.

## Nicht-Ziele

- Zeitangaben mit Uhrzeit und Zeitzonen (die Status-Teile zeigen Zeiten nur an).
- Rich-Text-Editor, Farbwähler, Bereichs-Datum („von–bis“).
- Echter Upload. `FileDrop` bekommt eine `upload`-Funktion von aussen; das Beispiel simuliert sie.
- Anderes Gebietsschema als de-CH.

## Anti-Ziele

- Ein Feld, das eine Eingabe wegen ihrer Schreibweise ablehnt, obwohl die Bedeutung klar ist.
- Ein Feld, das still etwas anderes speichert, als man sieht (Komma verschluckt, „1.5“ als 15).
- Rechnen mit Gleitkomma bei Geld.
- Ein Kalender als einziger Weg zum Datum.

## Begriffe

- **Lesen** (parse): Text → Wert oder Grund, warum nicht. **Schreiben** (format): Wert → Text.
- **Kanonische Schreibweise**: die eine Form, in der das Feld nach dem Verlassen den Wert zeigt.

## Regeln

### Das richtige Feld
- **E-01 Das Feld passt zur Angabe.** Zahl → Zahlenfeld mit Einheit; Datum → Datumsfeld; eine von
  2–5 Möglichkeiten → alle sichtbar (Radio oder Segmente); 6–15 → Auswahlliste; mehr oder Datensätze →
  Suche (Combobox, RecordPicker); Ja/Nein → Checkbox oder Schalter (E-06).
- **E-02 Die Einheit steht im Feld.** „g“, „Stk.“, „CHF“, „%“ rechts im Feld, nicht in der Beschriftung
  und nicht weggelassen. Zahlen in Ziffern gleicher Breite.
- **E-03 Grenzen stehen vorher da.** Was erlaubt ist (min/max, Format, Dateityp, Grösse, Zeichen) steht
  als Hinweis unter dem Feld, bevor man tippt. Ein Zähler erscheint erst, wenn die Grenze nah ist
  (ab 80 %).

### Lesen und zeigen
- **E-04 Grosszügig lesen, streng zeigen.** Ein Feld versteht jede eindeutige Schreibweise und zeigt nach
  dem Verlassen die kanonische. Zahlen: „1,5“ = „1.5“; Tausender mit `'`, `’` oder Leerzeichen.
  Abgelehnt wird nur, was mehrdeutig oder sinnlos ist – mit Satz, was gemeint sein könnte.
- **E-05 Daten schweizerisch und mit Abkürzungen.** Anzeige `TT.MM.JJJJ` mit Wochentag daneben
  („Fr, 14.11.2026“). Lesen: `14.11.2026`, `14.11.26`, `14.11.` (dieses Jahr), `14112026`, `heute`,
  `morgen`, `+3` (in drei Tagen). Der Kalender ist eine Hilfe, nicht der einzige Weg.
- **E-06 Geld in Rappen.** Beträge werden als ganze Rappen gespeichert und gerechnet, angezeigt mit
  zwei Nachkommastellen und `'` als Tausender (`1'234.50`), Währung im Feld. Nie Gleitkomma.

### Auswählen
- **E-07 Ja/Nein: Checkbox speichert mit, Schalter wirkt sofort.** In einem Formular mit „Speichern“ ist
  es eine Checkbox. Ein Schalter ist eine Einstellung, die sofort gilt. Die Beschriftung sagt den
  eingeschalteten Zustand („Lieferschein mitdrucken“), nie eine Verneinung.
- **E-08 Wenige Möglichkeiten sichtbar.** Bis fünf Möglichkeiten alle zeigen (Radio, oder Segmente bei
  kurzen Wörtern); ein Klick weniger und man sieht die Alternativen. Eine Auswahlliste erst ab sechs.
- **E-09 Verknüpfen heisst suchen, erkennen, notfalls anlegen.** Ein Feld, das auf einen anderen
  Datensatz zeigt (Kunde, Artikel), sucht nach Nummer und Name, zeigt pro Treffer eine zweite Zeile zum
  Unterscheiden (Nummer, Ort), die zuletzt benutzten zuerst, und bietet „„…“ neu anlegen“ mit dem
  getippten Text an. Der gewählte Datensatz ist ein Link (N-08).
- **E-10 Dateien zeigen, was mit ihnen passiert.** Ablegen oder auswählen; pro Datei Name, Grösse,
  Vorschau bei Bildern, Fortschritt, und bei Ablehnung der Grund an genau dieser Datei („zu gross:
  14 MB, erlaubt 10 MB“). Andere Dateien laufen weiter. Auf dem Tablet direkt die Kamera.

## Bausteine

`components/inputs/`:

- `parse.ts`
  - `parseNumber(text, { decimals? }): { ok: true; value: number | null } | { ok: false; reason: string }`
    Leer → `null`. Entfernt `'`, `’`, Leerzeichen; Komma → Punkt. Mehr als ein Dezimaltrenner nach dieser
    Normalisierung → Grund „Mehr als ein Komma oder Punkt“. Nicht-Zahl → „Keine Zahl“. Mit `decimals = 0`
    und Nachkommastellen ≠ 0 → „Nur ganze Zahlen“.
    Sonderfall Tausender-Punkt: „1.500“ (genau drei Ziffern nach einem Punkt, keine weiteren Trenner) ist
    mehrdeutig, wird aber als 1.5 gelesen, weil in der Schweiz der Punkt der Dezimaltrenner ist; das
    Feld zeigt danach „1.50“ bzw. „1.5“, also sieht man es.
  - `formatNumber(value, { decimals? }): string` → Schweizer Tausender `’`, feste Nachkommastellen falls
    `decimals` gesetzt. (Die bestehende `components/table/format.ts#formatNumber` bleibt für Tabellen.)
  - `parseMoney(text): { ok: true; cents: number | null } | { ok: false; reason }` – über `parseNumber`,
    höchstens zwei Nachkommastellen, sonst „Höchstens zwei Stellen nach dem Punkt“; Rappen per
    Zeichenkette, nicht per Multiplikation.
  - `formatMoney(cents): string` → `1’234.50`.
  - `parseDate(text, today: string /* ISO */): { ok: true; value: string | null } | { ok: false; reason }`
    gemäss E-05; ungültige Tage (31.02.) → „Diesen Tag gibt es nicht“. Zweistellige Jahre → 20xx.
  - `formatDate(iso): string` → `14.11.2026`; `weekday(iso): string` → `Fr`.
- `NumberInput({ value: number | null; onChange(value); unit?; decimals?; min?; max?; ...input props })`
  Textfeld `inputMode="decimal"` (bzw. `numeric` bei `decimals=0`), Einheit als Suffix im Feld, liest
  beim Verlassen und bei Enter, zeigt kanonisch. Unlesbar → Text bleibt stehen, `aria-invalid`, Grund über
  `onInvalid?(reason)` und als Text unter dem Feld wenn nicht in `FormField` (Prop `error` von aussen hat
  Vorrang). Pfeil hoch/runter ± 1 (bzw. 10^-decimals), innerhalb min/max.
- `MoneyInput({ cents, onChange(cents), currency = "CHF" })` auf derselben Grundlage.
- `DateInput({ value: string | null; onChange; today?; min?; max? })` Textfeld + Kalender-Knopf
  (`aria-label="Kalender öffnen"`), Wochentag rechts im Feld nach dem Lesen. Kalender: Monatsraster als
  `grid` mit Pfeiltasten (Tag ±1, Woche ±7), Bild auf/ab Monat, Enter wählt, Escape schliesst und
  Fokus zurück, Wochen beginnen am Montag, heute markiert.
- `Checkbox({ checked: boolean | "mixed"; onChange; label?; description? })` – natives `input`
  (`indeterminate` per Ref), eigene Optik über `appearance-none`; ohne `label` braucht es `aria-label`.
- `Switch({ checked; onChange; label; description? })` – `button role="switch"`.
- `RadioGroup({ value; onChange; options: { value; label; description? }[]; variant: "list" | "segments"; label })`
  – `role="radiogroup"`, Pfeiltasten wechseln (roving tabindex), Segmente nur für kurze Wörter.
- `RecordPicker` – baut auf `Combobox` (bekommt `onCreate?(query)` + `createLabel?(query)`; Option
  „„…“ neu anlegen“ als letzte Option, nur wenn kein exakter Treffer) und zeigt den gewählten Datensatz
  mit Link (`href?(value)`) daneben. „Zuletzt benutzt“: `recent?: ComboboxOption[]` erscheinen bei leerer
  Suche als Gruppe.
- `FileDrop({ accept; maxBytes; multiple; upload(file, onProgress, signal): Promise<void>; files; onChange })`
  Ablagefläche + Knopf „Dateien auswählen“ (`capture="environment"` bei Bildern optional), Liste mit
  Name, Grösse (`formatBytes`), Vorschau, Fortschritt (`progressbar`), Entfernen (bricht laufenden Upload
  ab), Ablehnung pro Datei mit Grund.
- `Textarea` bekommt `maxLength` mit Zähler „412 / 500“ ab 80 % (`aria-live="polite"`).

## Was bleibt dem Bauenden

Optik der Kalender- und Datei-Elemente im Stil des Kits (ruhig, dicht; G-01–G-09).
