# Teil 11: Startseite & Arbeitsvorrat (A-01–A-08)

## Warum

Die erste Seite nach dem Anmelden ist in vielen Firmenprogrammen ein Dashboard mit farbigen Kacheln und
Diagrammen, die niemand anklickt. Linear öffnet mit „My Issues“ und „Inbox“: was mir zugewiesen ist,
was sich geändert hat. Vercel zeigt die letzten Deployments mit Stand. Die Frage am Morgen ist nicht
„Wie viele Aufträge gibt es?“, sondern „Was muss ich heute tun?“.

Patrick hat freie Hand gegeben; alle Entscheidungen hier sind meine.

## Ziele

1. Acht Regeln A-01–A-08.
2. Bausteine unter `components/home/`: `StatTile` (Zahl als Link in die gefilterte Liste), `WorkQueue`
   (Arbeitsvorrat mit Grund und Frist), `RecentList` (zuletzt geöffnet), `DataFreshness` (Stand von …,
   Aktualisieren).
3. Beispiel „Startseite für drei Rollen“: Büro, Werkstatt, Teamleitung.

## Nicht-Ziele

- Diagramme und frei anordenbare Kacheln.
- Benachrichtigungen per E-Mail/Push (nur die Liste auf der Seite).

## Anti-Ziele

- Zahlen, die nirgendwohin führen, oder deren Liste eine andere Zahl zeigt.
- Kacheln in vielen Farben ohne Bedeutung (G-01).
- „Willkommen zurück!“ statt Arbeit.

## Regeln

### Was heute dran ist
- **A-01 Die Startseite sagt, was heute dran ist.** Oben der eigene Arbeitsvorrat: überfällig, heute fällig,
  wartet auf mich – jede Zeile mit dem Grund, warum sie da ist. Kennzahlen höchstens als Leiste darunter.
- **A-02 Meins zuerst.** Was mir oder meiner Station gehört, steht vor dem, was das Team betrifft; „Alle“
  ist ein Link, nicht die Voreinstellung.
- **A-03 Dringendes oben, mit Grund.** Sortiert nach Frist, bei gleicher Frist nach der Reihenfolge der Liste (L-06); jede Zeile sagt in
  Worten warum: „seit 2 Tagen überfällig“, „heute fällig“, „wartet seit 5 h auf Freigabe“.
- **A-04 Leer heisst: nichts zu tun, und was als Nächstes kommt.** Ein leerer Vorrat sagt das ruhig und nennt
  den nächsten Termin (L-07) – keine Konfetti, kein „Super!“.

### Zahlen
- **A-05 Jede Zahl führt in die Liste dahinter.** Eine Kennzahl ist ein Link auf die gefilterte Liste, und
  diese zeigt dieselbe Zahl (L-12). Keine Zahl ohne Ziel.
- **A-06 Zahlen sagen, von wann sie sind.** „Stand 10:30 · Aktualisieren“; automatisch neu, wenn die Seite
  wieder sichtbar wird.

### Weg zurück
- **A-07 Zuletzt geöffnet ist ein Weg zurück.** Die letzten fünf geöffneten Datensätze mit Art und Kennung,
  damit man nach einer Unterbrechung weitermacht.
- **A-08 Jede Rolle hat ihre Startseite.** Büro: zu planen und zu verrechnen; Werkstatt: die eigene Station;
  Teamleitung: was festhängt. Gleiche Bausteine, anderer Inhalt.

## Bausteine (`components/home/`)

- `StatTile({ label, value, href, detail?, tone? })` – ganze Kachel ist ein Link (`NavLink`), Name „{value} {label}“.
- `WorkQueue({ title, items: { id; title; meta?; href; reason; tone? }[], total?, moreHref?, empty: { text; next? } })`
  – Liste mit Grund pro Zeile, Anzahl im Titel, leer mit Satz und nächstem Termin.
- `RecentList({ items: { id; kind; label; href }[] })`.
- `DataFreshness({ at, now, onRefresh })` – „Stand 10:30“ und Knopf; ruft `onRefresh` auch bei `visibilitychange` → sichtbar.
