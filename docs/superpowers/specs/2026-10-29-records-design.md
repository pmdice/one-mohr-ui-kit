# Teil 7: Datensatz-Seite (D-01–D-10)

## Warum

Listen (L) führen zu einem Datensatz, die Navigation (N) gibt ihm einen Kopf. Was dazwischen liegt –
die Seite eines Auftrags, eines Kunden, eines Artikels – ist in Firmensoftware die meistbesuchte Seite
und in Nova standardmässig eine lange Liste aus „Feldname: Wert“ mit einem „Bearbeiten“-Knopf, der in
ein anderes Formular springt. Linear zeigt, wie es besser geht: Inhalt links, Eigenschaften rechts,
jede Eigenschaft an Ort und Stelle änderbar, Kennung mit einem Klick kopiert, Verlauf darunter.

Patrick hat freie Hand gegeben; alle Entscheidungen hier sind meine.

## Ziele

1. Zehn Regeln D-01–D-10 im Handbuch.
2. Bausteine unter `components/record/`: `RecordLayout`, `KeyFacts`, `PropertyList`/`Property`,
   `InlineEdit`, `CopyButton`, `RelatedList`, `AttachmentGallery` (mit Vollbild über `Dialog`),
   `RecordMeta`, und `formatDue` (Termin relativ und absolut).
3. Ein Beispiel „Datensatz: Auftrag“, das alle Regeln anwendet und `PageHeader`, `StatusBadge`,
   `ActivityLog` und die Eingabe-Bausteine aus Teil 6 wiederverwendet.

## Nicht-Ziele

- Echtes Speichern auf einem Server; `InlineEdit` bekommt `onSave` (darf ein Promise sein).
- Gleichzeitiges Bearbeiten durch zwei Personen (kommt in Teil 8).
- Rechte (Teil 10): hier nur `readOnly` als Schalter pro Eigenschaft.

## Anti-Ziele

- Ein Datensatz, den man nur ändern kann, indem man in ein anderes Formular wechselt und alles noch einmal sieht.
- „null“, „-“, „N/A“ oder leere Zeilen für fehlende Werte.
- Interne IDs prominent; Kennungen, die man abtippen muss.
- Zugehöriges nur über einen Umweg in eine andere Liste.

## Regeln

### Aufbau
- **D-01 Inhalt links und Eigenschaften rechts.** Hauptspalte: Beschreibung, Positionen, Zugehöriges,
  Verlauf. Seitenspalte (etwa 18 rem): Eigenschaften als Liste. Unter 1024 px stehen die Eigenschaften
  direkt unter dem Kopf, vor dem Inhalt.
- **D-02 Das Wichtigste auf einen Blick.** Unter dem Kopf höchstens vier Kennzahlen mit Bedeutung für die
  Arbeit (Liefertermin, Menge, Fortschritt, Wert), jede mit einem Wort Einordnung („in 5 Tagen“,
  „3 von 4 fertig“). Eine Warnung färbt nur die betroffene Zahl (G-01).
- **D-03 Eigenschaften in fester Reihenfolge.** Beschriftung links, Wert rechts; bei allen Datensätzen
  dieser Art dieselbe Reihenfolge; das Häufigste oben. Werte, die auf andere Datensätze zeigen, sind
  Links (N-08).

### Werte
- **D-04 Leere Werte sagen, was fehlt.** Statt „—“ in der Detailseite: „Kein Liefertermin“ und, wo man
  es ändern darf, direkt „Hinzufügen“. Was für diesen Datensatz nicht zutrifft, erscheint gar nicht.
  (In Tabellen bleibt „—“, L-02.)
- **D-05 Kennungen sind kopierbar.** Neben jeder Kennung, Nummer oder Adresse, die man weitergibt, ein
  Knopf „Kopieren“; danach zwei Sekunden „Kopiert“ an derselben Stelle.
- **D-06 Termine sagen, wie weit weg sie sind.** „in 5 Tagen · Fr, 14.11.2026“, „heute“, „morgen“,
  „seit 2 Tagen überfällig“ (Warnung). Das absolute Datum steht immer dabei.

### Bearbeiten
- **D-07 Einzelne Angaben an Ort und Stelle ändern.** Klick oder Enter auf den Wert öffnet das passende
  Feld genau dort; Enter oder Verlassen speichert, Escape verwirft. Während des Speicherns bleibt der
  neue Wert sichtbar mit „Speichert …“; ein Fehler steht am Feld, der eingegebene Wert bleibt stehen,
  Fokus zurück auf dem Wert.
- **D-08 Viele Angaben zusammen im Formular.** Was zusammen stimmen muss (Adresse, alle Positionen) oder
  beim Anlegen, ändert man in einem Formular nach den F-Regeln. Die Seite bietet dafür einen Knopf
  „Bearbeiten“, nicht für jede einzelne Angabe.

### Zusammenhang
- **D-09 Zugehöriges steht beim Datensatz.** Positionen, Laufzettel, Rechnungen, Anhänge erscheinen als
  kurze Listen mit Anzahl im Titel, die ersten fünf sichtbar und „Alle 12 anzeigen“ als Link auf die
  gefilterte Liste (L-05). Leer: ein Satz und die Aktion („Noch keine Laufzettel · Laufzettel drucken“).
  Bilder als Vorschau, gross mit Pfeiltasten.
- **D-10 Herkunft steht am Rand.** Wer hat wann angelegt, wer zuletzt geändert – klein am Ende der
  Seitenspalte, mit Link zum Verlauf (S-12). Interne IDs nur dort, kopierbar.

## Bausteine (`components/record/`)

- `formatDue(iso, today): { relative: string; absolute: string; overdue: boolean }` – „heute“, „morgen“,
  „gestern“ (überfällig), „in N Tagen“, „seit N Tagen überfällig“, „vor N Tagen“ für vergangene Daten, wenn
  `{ past: "neutral" }`. Absolut „Fr, 14.11.2026“.
- `RecordLayout({ main, aside })` – Raster zwei Spalten ab `lg`, darunter `aside` zuerst.
- `KeyFacts({ facts: { label; value; detail?; tone?: "warning" | "danger" | "success" }[] })` – `dl` als Leiste.
- `PropertyList({ children, label })` – `dl`; `Property({ label, children })`.
- `EmptyValue({ text, onAdd?, addLabel = "Hinzufügen" })`.
- `InlineEdit<T>({ label, value, display(value) → node, editor({ value, onChange, commit, cancel, ref }) → node,
  onSave(value) → void | Promise<void>, readOnly?, empty? })` – Zustände `view` | `editing` | `saving` |
  `error`. Im `view` ein Knopf mit `aria-label="{label} ändern"`, Text = aktueller Wert. Enter/Klick → editing,
  Fokus ins Feld. `commit` speichert (gleicher Wert → nur schliessen), Escape → zurück ohne Speichern.
  Fehler (Promise abgelehnt mit Error) → Meldung am Feld, Editor bleibt offen mit dem Wert.
- `CopyButton({ value, label })` – `navigator.clipboard.writeText`; danach 2 s „Kopiert“ (`aria-live`);
  ohne Clipboard-API: Text markieren und Hinweis „Mit Ctrl+C kopieren“.
- `RelatedList({ title, count, children, moreHref?, emptyText, emptyAction? })` – zeigt `children`
  (höchstens fünf, der Aufrufer schneidet), Titel „Positionen (12)“, Link „Alle 12 anzeigen“ wenn `count > 5`.
- `AttachmentGallery({ items: { id; name; src; size? }[] })` – Raster aus Vorschauen (Knöpfe), Klick öffnet
  `Dialog` mit dem Bild, Pfeile links/rechts blättern, „Bild 2 von 5“.
- `RecordMeta({ created: { by; at }, updated?: { by; at }, now, id?, historyHref? })`.

## Was bleibt dem Bauenden

Gestaltung im Stil des Kits; Inhalt und Daten des Beispiels.
