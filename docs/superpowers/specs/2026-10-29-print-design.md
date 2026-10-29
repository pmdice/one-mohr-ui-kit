# Teil 9: Druck & Export (P-01–P-08)

## Warum

In der Werkstatt läuft die Arbeit auf Papier: Der Laufzettel mit Barcode begleitet jedes Stück, der
Lieferschein geht mit der Ware. Die Werkstatt-Regeln (W) lesen diese Zettel; wie sie gedruckt werden,
regelt noch nichts. Ebenso der Weg aus der Software hinaus: Listen werden nach Excel exportiert, und dort
stehen dann Umlaute als „Ã¤“, Zahlen als Text und Dateien heissen `export(7).csv`. Die Status-Spec hat
Druck und Export ausdrücklich verschoben.

Patrick hat freie Hand gegeben; alle Entscheidungen hier sind meine.

## Ziele

1. Acht Regeln P-01–P-08.
2. Bausteine unter `components/print/`: `code128` (Kodierung Code 128-B, rein), `Barcode` (SVG),
   `PrintSheet` (A4-Seite mit Kopf und Fuss, Druck-CSS), `RunSlip` (Laufzettel), `PrintPreview`
   (Vorschau mit Seitenzahl und „Drucken“), `toCsv`, `exportFilename`, `ExportMenu`.
3. Beispiel „Druck & Export“: Liste mit Filter, Export der gefilterten Liste, Druckvorschau der Laufzettel.

## Nicht-Ziele

- PDF-Erzeugung auf dem Server, Etikettendrucker-Sprachen (ZPL), XLSX-Erzeugung.
- QR-Codes (die Kamera liest Code 128; W-02).

## Anti-Ziele

- Ein Ausdruck der Bildschirmseite mit Menü und Knöpfen.
- Ein Barcode, der skaliert, gestaucht oder ohne Ruhezone gedruckt wird.
- Eine Exportdatei, deren Inhalt nicht dem entspricht, was man gesehen hat.

## Regeln

### Drucken
- **P-01 Gedrucktes ist für Papier gebaut.** Eine eigene Druckansicht (A4 hoch, Ränder 12 mm), ohne Menü,
  Knöpfe und Farbflächen; Bedeutung in Schwarzweiss lesbar (Form wie S-01, Text statt Farbe).
- **P-02 Der Laufzettel trägt das Nötigste gross.** Nummer sehr gross, Barcode, dann genau das, was W-05
  an der Station zeigt (Kunde, Material, Stück, Dringlichkeit) und Hinweise als Kasten. Gleiche Reihenfolge
  wie auf dem Tablet.
- **P-03 Barcodes mit Ruhezone und Klartext.** Code 128, Modulbreite mindestens 0.33 mm, Höhe mindestens
  12 mm, Ruhezone mindestens zehn Module links und rechts, Klartext darunter. Druck in „Tatsächlicher
  Grösse“, nie skaliert.
- **P-04 Jede Seite trägt Kopf und Fuss.** Firma, Dokument, Nummer oben; „Seite 2 von 3“ und Druckdatum
  unten. Tabellen wiederholen ihren Kopf, Zeilen werden nicht getrennt.

### Exportieren
- **P-05 Export nimmt mit, was man sieht.** Gleiche Filter, gleiche Sortierung, gleiche Spalten wie die
  Liste; das Menü sagt vorher, was exportiert wird („124 Laufzettel · Filter: Station Guss“).
- **P-06 Der Dateiname sagt was und wann.** `Laufzettel_Station-Guss_2026-10-29.csv` statt `export.csv`.
- **P-07 Excel öffnet es richtig.** CSV mit UTF-8-BOM und Semikolon; Zahlen ohne Tausender-Zeichen mit
  Punkt; Daten als `TT.MM.JJJJ`; Kennungen als Text, damit führende Nullen bleiben (`="00123"` ist keine
  Lösung – Spalte als Text exportieren, Wert in Anführungszeichen).
- **P-08 Grosses läuft im Hintergrund.** Ab etwa 5’000 Zeilen oder 10 s Dauer als Hintergrund-Auftrag mit
  Meldung und Link zum Herunterladen am Ende (R-06).

## Bausteine (`components/print/`)

- `code128.ts`: `encode128B(text): number[]` (Werte inkl. Start 104, Prüfsumme, Stopp 106; nur ASCII 32–126,
  sonst Fehler), `patterns(values): string` (Modulbreiten), `CODE128` Tabelle.
- `Barcode({ value, module = 0.33 /* mm */, height = 12 /* mm */, quiet = 10 })` – SVG in mm, `role="img"`,
  `aria-label="Barcode {value}"`, Klartext darunter in Mono.
- `PrintSheet({ title, number, page, pages, printedAt, children })` – 210 × 297 mm, Kopf/Fuss; im Druck
  `@page { size: A4; margin: 0 }`, eine Seite pro Blatt (`break-after: page`).
- `RunSlip({ slip })` – Laufzettel A6 (vier pro A4), Inhalt nach P-02.
- `PrintPreview({ pages, onPrint = window.print })` – zeigt Blätter verkleinert, „{n} Seiten · A4 hoch“, Knopf
  „Drucken“ (Hinweis „In tatsächlicher Grösse drucken“).
- `toCsv(rows, columns: { label; value(row) → string | number | null; kind?: "text" | "number" | "date" })`
  → String mit BOM, `;`, CRLF, Werte nach P-07, Anführungszeichen wo nötig.
- `exportFilename(parts: string[], date: ISO, ext)` → Teile mit `_`, Leerzeichen → `-`, Umlaute bleiben,
  verbotene Zeichen weg.
- `ExportMenu({ count, noun, filters: string[], onExport(format) })` – Knopf „Exportieren“, Menü mit
  Beschreibung, was exportiert wird.
