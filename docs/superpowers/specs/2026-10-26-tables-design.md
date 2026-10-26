# Handbuch Teil 3: Listen & Tabellen

**Datum:** 2026-10-26
**Status:** Freigegeben („passt, setze um“)
**Baut auf:** Teil 1 (Formulare, Tokens, Regelformat) und Teil 2 (Navigation: N-03 Listenzustand in der URL, N-04 Blättern, N-09/N-11 Ansichten)

## Warum

Im Casting Manager hat sich herausgestellt: **Der Einstieg in die Arbeit ist der Gusszettel,
nicht der Auftrag.** Die Gusszettel-Liste ist das Arbeitspferd. Dort wird gesucht,
eingegrenzt, gedruckt und weitergegeben. Patrick lässt für Listen freie Hand („das Feld frei für die
bestmögliche Optimierung“). Die Regeln unten sind Claudes Vorschlag, von Patrick mit
„passt“ freigegeben.

Was in den heutigen Listen auffällt (Screenshots aus Teil 2):
- Die Spalten sind gleichmässig verteilt, Zahlen stehen links und lange Zeilen haben keinen Halt.
- Status und Dringlichkeit sind farbige Pillen; die Bedeutung hängt teils nur an der Farbe.
- Filter verstecken sich hinter einem Trichter-Symbol; man sieht nicht, ob gerade gefiltert ist.
- Sortiert wird nach Nummer, nicht nach dem, was als Nächstes zu tun ist.
- Zeilenaktionen sind kleine Icons (Auge, Drucker, Stift) ohne Beschriftung.
- „1-17 von 17“ steht klein unten; Seitengrösse ist fest.

**Erfolg:** Eine Gusszettel-Liste mit einigen Hundert offenen Zetteln lässt sich mit der
Tastatur abarbeiten, man sieht jederzeit, was gefiltert ist und wie viele es sind, und
mehrere Zettel lassen sich in einem Schritt drucken.

**Nachtrag zu Teil 2:** Im Casting-Manager-Beispiel von N-10 steht „Gusszettel“ vor
„Aufträge“, weil die Arbeit dort beginnt.

## Ziele

- Regeln **L-01 bis L-12** im Format der Teile 1 und 2 (Regel / Warum / Details /
  Gut–Schlecht / Übertragen), Deutsch, framework-unabhängig.
- Referenz-Komponenten für dichte Arbeitslisten.
- Ein durchgehendes Beispiel: eine **Laufzettel-Liste** mit ~300 Einträgen, simuliert
  asynchron geladen.

## Nicht-Ziele

- Spalten ein-/ausblenden, umsortieren, in der Breite ziehen; gespeicherte eigene Ansichten.
- Inline-Bearbeitung in Zellen.
- Endloses Scrollen / Virtualisierung (bei einigen Hundert Einträgen reicht Blättern).
- Export (CSV/Excel).
- Werkstatt-Ansicht (eigenes Kapitel). Die komfortable Dichte muss trotzdem funktionieren.
- Ein Zuschnitt auf den Casting Manager. Das Beispiel bleibt allgemein („Laufzettel“,
  „Station“).

## Anti-Ziele

- Eine Tabelle, die nur mit Maus bedienbar ist (Aktionen nur bei Hover, Klick-Handler auf `div`).
- Bedeutung nur über Farbe.
- Ein Listenzustand, der beim Zurückkommen verloren geht (widerspräche N-03).

## Regeln

### Lesen

**L-01 Die erste Spalte ist die Kennung**
Die erste Spalte enthält die Kennung, die auf Papier und Etiketten steht (Monospace), als
Link auf das Objekt. Die ganze Zeile ist zusätzlich per Klick zu öffnen; Links und Knöpfe
in der Zeile behalten ihren eigenen Klick. ⌘/Ctrl-Klick öffnet in neuem Tab (echter Link).
*Warum:* Die Nummer ist das, womit man das Papier in der Hand mit der Zeile auf dem
Bildschirm abgleicht.

**L-02 Zahlen rechts, Einheiten im Kopf, Leeres als „—“**
Zahlen sind rechtsbündig mit gleich breiten Ziffern (`tabular-nums`); die Einheit steht im
Spaltenkopf („Gewicht (g)“), nicht in jeder Zelle. Leere Werte zeigen „—“, nicht „0“ und
nicht nichts. Datum überall im selben Format (`TT.MM.JJJJ`), Tausender mit `’`.
*Warum:* Rechtsbündige Zahlen lassen sich untereinander vergleichen; ein leeres Feld und
eine Null bedeuten Verschiedenes.

**L-03 Status ist Text, Farbe nur Zusatz**
Status und Dringlichkeit stehen als Badge mit Text (und bei Dringlichkeit einem Icon). Sie
sind lesbar ohne Farbe. Dringlichkeit ist eine eigene, schmale Spalte ganz links, vor der
Kennung, damit das Auge sie beim Runterlaufen trifft.
*Warum:* Farbe allein unterscheidet nicht jeder, und sie trägt auf grauen Druckern und in
grellem Werkstattlicht nicht.

**L-04 Kopf und Kennung bleiben stehen**
Der Spaltenkopf bleibt beim Scrollen sichtbar; bei horizontal scrollenden Tabellen auch
die Kennungsspalte. Zeilenhöhe und Schrift folgen der Dichte (`compact` / `comfortable`).
*Warum:* In Zeile 40 weiss niemand mehr, welche Spalte das Gewicht war.

### Eingrenzen

**L-05 Aktive Filter sind immer sichtbar**
Jeder aktive Filter erscheint als Chip über der Tabelle („Status: Guss ×“). Ein Chip lässt
sich einzeln entfernen; ab zwei Filtern gibt es „Alle zurücksetzen“. Neue Filter kommen
über „+ Filter“ (Feld wählen, Wert wählen). Filter, Suche, Sortierung, Seite und
Seitengrösse stehen in der URL (N-03).
*Warum:* Ein versteckter Filter ist der häufigste Grund für „der Zettel ist verschwunden“.

**L-06 Die Standard-Sortierung folgt der Arbeit**
Ohne eigene Wahl ist die Liste so sortiert, wie gearbeitet wird (z. B. dringend zuerst,
dann ältestes Eingipsdatum), nicht nach ID. Die aktive Sortierung ist im Spaltenkopf
sichtbar (Pfeil + `aria-sort`); Klick auf einen sortierbaren Kopf wechselt aufsteigend →
absteigend → Standard.
*Warum:* Die oberste Zeile soll die sein, die man als Nächstes anfasst.

**L-07 Leer ist nicht gleich leer**
Drei Zustände mit eigenem Text und eigener Aktion:
- **Noch nichts da:** „Noch keine Laufzettel“ + Hauptaktion („Laufzettel erfassen“), falls
  erlaubt.
- **Keine Treffer:** „Keine Laufzettel für diese Filter“ + „Filter zurücksetzen“; die
  Chips bleiben sichtbar.
- **Fehler:** „Liste konnte nicht geladen werden“ + „Erneut versuchen“; vorhandene Zeilen
  bleiben stehen, wenn es nur ein Nachladen war.
*Warum:* „Keine Einträge“ nach einem Filter lässt glauben, die Daten seien weg.

**L-08 Laden ohne Flackern**
Beim ersten Laden zeigt die Tabelle Platzhalter-Zeilen in Form der echten Zeilen. Beim
Nachladen (Filter, Sortierung, Seite) bleiben die bisherigen Zeilen stehen, leicht
abgeblendet, mit einem dünnen Fortschrittsbalken; die Tabelle ist `aria-busy`. Antworten
für einen älteren Zustand werden verworfen.
*Warum:* Eine Tabelle, die bei jedem Klick leer wird und wieder auftaucht, verliert den
Blick des Benutzers.

### Arbeiten

**L-09 Mit der Tastatur durch die Liste**
`J`/`K` (und ↓/↑ in der Tabelle) bewegen eine sichtbare Zeilenmarkierung, Enter öffnet die
markierte Zeile, `X` wählt sie aus. Die Markierung ist nicht dasselbe wie die Auswahl.
Kürzel wirken nicht in Eingabefeldern, Menüs und Dialogen (wie N-04).
*Warum:* Wer 40 Zettel durchgeht, greift nicht 40-mal zur Maus.

**L-10 Mehrere auf einmal**
Jede Zeile hat eine Checkbox, der Kopf eine für „alle auf dieser Seite“ (mit
Teilzustand). Sobald etwas ausgewählt ist, erscheint eine Leiste: „3 ausgewählt“ mit den
Sammelaktionen (z. B. Drucken, Station setzen) und „Auswahl aufheben“. Die Auswahl
überlebt Blättern innerhalb derselben Filter, wird bei Filterwechsel aufgehoben, und die
Leiste sagt, wie viele davon gerade nicht sichtbar sind.
*Warum:* Drucken oder Weitergeben passiert stapelweise; einzeln klicken ist Fehlerquelle.

**L-11 Die häufigste Aktion sichtbar, der Rest im Menü**
Pro Zeile ist höchstens eine Aktion direkt sichtbar, mit Text oder eindeutigem Icon plus
zugänglichem Namen (z. B. „Drucken“). Weitere Aktionen liegen im „…“-Menü. Alles ist per
Tastatur erreichbar und immer sichtbar, nicht erst bei Hover.
*Warum:* Drei unbeschriftete Icons pro Zeile sind 300 Ratespiele pro Seite.

**L-12 Die Menge ist immer sichtbar**
Über der Tabelle steht die Trefferzahl („312 Laufzettel“, gefiltert „27 von 312“), unter
der Tabelle der Bereich („1–25 von 27“) mit Blättern und Seitengrösse (25 / 50 / 100).
Die gewählte Seitengrösse bleibt pro Liste auf dem Gerät gespeichert.
*Warum:* Ohne Zahl weiss man nicht, ob man fertig ist oder ob der Filter zu eng ist.

## Komponenten (Referenz-Umsetzung)

| Komponente | Zweck | Regeln |
|---|---|---|
| `DataTable` | Spalten-Definition, Ausrichtung, Sticky-Kopf/-Spalte, Sortierköpfe, Zeilenklick, Tastatur-Markierung, Auswahl, Zeilenaktion + Menü, Lade-/Nachlade-Zustand | L-01–L-04, L-06, L-08–L-11 |
| `FilterBar` | Chips aktiver Filter, „+ Filter“, „Alle zurücksetzen“, Trefferzahl | L-05, L-12 |
| `EmptyState` | drei Varianten | L-07 |
| `Pagination` | Bereich, Blättern, Seitengrösse (gespeichert) | L-12 |
| `BulkBar` | Auswahl-Leiste mit Sammelaktionen | L-10 |
| `ActionMenu` | „…“-Menü (Menü-Pattern, Tastatur) | L-11 |
| `format.ts` | `formatNumber` (`’`), `formatDate` (`TT.MM.JJJJ`), `EMPTY = "—"` | L-02 |

- Die Tabelle ist **kontrolliert**: Sortierung, Filter, Seite, Auswahl kommen als Props und
  ändern sich über Callbacks. Wo sie in der URL stehen, entscheidet die App (Beispiel: In-Memory-Router
  aus Teil 2). *Entscheid Claude.*
- Zeilen-Links laufen über `NavLink` (Teil 2), kein Router fest eingebaut.
- Die Kürzel nutzen `useShortcut` aus Teil 2 (ignoriert Eingabefelder, Menüs, Dialoge).
- Die bestehende `SearchInput` bleibt unverändert; die Listensuche im Beispiel ist ein
  einfaches Feld wie in Teil 2. *Entscheid Claude.*

## Durchgehendes Beispiel

Story *Listen › Beispiel: Laufzettel*:
- ~300 deterministische Laufzettel: Dringlichkeit (Dringend / Hoch / Normal / Niedrig),
  Nummer (`26100013 – 1/4`), Material, Kunde (Link), Station (Nicht gescannt / 3D / Guss /
  Polissage / Versand), Eingipsdatum, Stück, Gewicht (g, teils leer).
- Standard-Sortierung: Dringlichkeit absteigend, dann Eingipsdatum aufsteigend.
- Filter: Station, Material, Dringlichkeit; Listensuche über Nummer und Kunde.
- Simuliertes Laden (300–600 ms), Knopf/Story-Variante für „Fehler beim Nachladen“, eine
  Variante „noch nichts da“.
- Zeilenaktion „Drucken“, im Menü „Station setzen …“, „Zum Auftrag“. Sammelaktionen
  „Drucken“ und „Station setzen“ (Ergebnis als Toast-artige Meldung im Beispiel).
- Beide Dichten.

## Testen

Vitest + Testing Library auf beobachtbares Verhalten, insbesondere:
- Zahlenspalten rechtsbündig, leere Werte „—“, `formatNumber(1234567) === "1’234’567"`.
- Sortierkopf: Klickfolge asc → desc → Standard, `aria-sort` stimmt.
- Filter-Chips: entfernen, „Alle zurücksetzen“ ab zwei, Trefferzahl „27 von 312“.
- Leere Zustände: „Keine Treffer“ zeigt „Filter zurücksetzen“, „noch nichts da“ nicht.
- Nachladen: alte Zeilen bleiben, `aria-busy`, ältere Antwort wird verworfen.
- Tastatur: `J`/`K` bewegt Markierung, Enter öffnet, `X` wählt; nicht im Suchfeld.
- Auswahl: Kopf-Checkbox mit Teilzustand, Leiste mit Anzahl, Auswahl überlebt Blättern,
  Filterwechsel hebt sie auf.
- „…“-Menü: Pfeiltasten, Escape gibt Fokus zurück.
- Seitengrösse bleibt gespeichert (localStorage in try/catch).

## Handbuch-Seiten

Wie Teil 1/2: *Handbuch › Listen*, Übersicht mit `RuleIndex` (Lesen / Eingrenzen /
Arbeiten), je Seite Gut/Schlecht. Einleitung: „Listen & Tabellen – verfügbar“. N-10
(Übertragen): Gusszettel vor Aufträge.

## Dem Umsetzer überlassen

- Genaue Masse, Farben und Abstände (Tokens aus Teil 1, ruhig wie Linear).
- API-Details der Spalten-Definition.
- Wie „+ Filter“ im Detail aussieht (Popover mit zwei Auswahlen genügt).
- Ob Pfeiltasten zusätzlich zu `J`/`K` wirken, solange der Fokus in der Tabelle ist.
