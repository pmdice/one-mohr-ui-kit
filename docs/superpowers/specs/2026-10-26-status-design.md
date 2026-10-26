# Handbuch Teil 4: Status & Lebenszyklus

**Datum:** 2026-10-26
**Status:** Freigegeben („leg selber los“: Patrick überlässt Inhalt und Umsetzung Claude)
**Baut auf:** Teil 1 (Tokens, Regelformat), Teil 2 (PageHeader, PageTabs „Verlauf“, `useShortcut`), Teil 3 (L-03 Status als Text, `ActionMenu`, `format.ts`)

## Warum

Das hat Patrick über den Ablauf in der Produktion erzählt (Teil 2):
- Der Gusszettel wird ausgedruckt, aber digital erfasst.
- In der Produktion steht ein Tablet. Kommt der Zettel an eine Station, wird er gescannt und ist damit
  an diesem Ort aktiv. Verlässt er die Station, wird er wieder gescannt.
- Er kann dieselbe Station mehrmals durchlaufen.
- Der Einstieg in die Arbeit ist der Gusszettel, nicht der Auftrag.

Schon in Teil 1 war das Thema so umrissen: „einheitliche Status-Sprache (Icon + Farbe), Scan Ein/Aus,
Historie/Prüfprotokoll. Der Gusszettel-Durchlauf durch Abteilungen ist der Prüfstein.“

Typische Probleme heute (Claudes Einschätzung aus den Screenshots von Teil 2, nicht von Patrick
bestätigt):
- Status ist eine farbige Pille, und dasselbe Wort hat in Liste, Detail und Druck verschiedene Farben.
- „Wo ist der Zettel?“ und „Wie weit ist er?“ stecken im selben Feld.
- Man sieht nicht, seit wann ein Zettel an einer Station liegt, also auch nicht, ob er hängt.
- Ein Status lässt sich auf jeden beliebigen Wert setzen, auch auf unsinnige.
- Der Verlauf ist eine Liste von Feldnamen und IDs, sofern es überhaupt einen gibt.

**Erfolg:**
- Wer einen Gusszettel öffnet, sieht in zwei Sekunden: wo er ist, seit wann, wie weit er ist und was als
  Nächstes kommt.
- Wer wissen will, was passiert ist, liest es im Verlauf in ganzen Sätzen.
- Ein Scan gibt eine Rückmeldung, die man auch aus zwei Metern Entfernung versteht.

## Ziele

- Regeln **S-01 bis S-12** im bekannten Format (Regel / Warum / Details / Gut–Schlecht / Übertragen),
  Deutsch, unabhängig vom Framework.
- Referenz-Komponenten für Status-Anzeige, Status-Wechsel, Scan, Durchlauf und Verlauf.
- Ein durchgehendes Beispiel: die **Detailseite eines Laufzettels** mit Scan, Durchlauf und Verlauf, dazu
  der Auftrag mit abgeleitetem Status.

## Nicht-Ziele

- Die Werkstatt-Ansicht mit Kamera, Tablet-Layout und Vollbild-Scan (eigenes Kapitel). Hier geht es um
  die Regeln des Scans, in normaler Seitenansicht und mit Hand-Scanner als Tastatur.
- Ein Editor für Workflows im Admin. Die Workflows sind im Code definiert.
- Kommentare und Erwähnungen im Verlauf.
- Benachrichtigungen (E-Mail, Push).
- Echte Rechteprüfung. Im Beispiel gibt es nur „darf wieder öffnen: ja/nein“ als Schalter.

## Anti-Ziele

- Status, der nur über Farbe zu erkennen ist (widerspräche L-03).
- Ein Menü, das jeden Status anbietet, auch die unmöglichen.
- „Sind Sie sicher?“ vor jeder Kleinigkeit. Bestätigungen, die man wegklickt, schützen nicht mehr.
- Ein Verlauf, den nur Entwickler lesen können (`station_id: 3 → 4`).
- Ein Scan, nach dem man nicht weiss, ob er angekommen ist.

## Regeln

### Status zeigen

**S-01 Ein Status, ein Wort, eine Form**
- Jeder Status gehört zu einer von fünf Kategorien: *Geplant*, *In Arbeit*, *Wartet*, *Erledigt* und
  *Abgebrochen*.
- Die Kategorie bestimmt Form und Farbe des Icons: leerer Kreis, Kreis mit Punkt, Pause, Haken und Kreuz.
  Der Text nennt den konkreten Status.
- Wort, Icon und Farbe sind überall gleich: in Liste, Detail, Suche, Verlauf und Druck.
- Die Farbe ist nur Zusatz: Geplant und Wartet sind neutral bzw. Warnung, In Arbeit ist Akzent, Erledigt
  ist Erfolg, Abgebrochen ist gedämpft.

*Warum:* Wer die Form einmal gelernt hat, liest jeden Status jeder Liste, auch auf einem
Schwarz-Weiss-Ausdruck.

**S-02 Ort und Stand sind zwei Angaben**
- Der *Stand* sagt, wie weit der Zettel ist (Status mit Kategorie).
- Der *Ort* sagt, wo er gerade ist: „An Station Guss“, oder „Unterwegs, zuletzt Guss“, wenn er
  ausgescannt und noch nirgends eingescannt ist.
- Beide stehen im Kopf der Detailseite nebeneinander, und in Listen als eigene Spalten.

*Warum:* „Guss“ als Status lässt offen, ob der Zettel dort liegt oder schon unterwegs zur Polissage ist.
Genau das fragt man in der Produktion.

**S-03 Seit wann, und ob es zu lange ist**
- Neben Ort und Stand steht, seit wann sie gelten: „seit 2 h 10 min“, als Tooltip bzw. `title` das
  genaue Datum und die Uhrzeit (`TT.MM.JJJJ HH:MM`).
- Hat eine Station eine Richtzeit und ist sie überschritten, steht ein Hinweis in Worten: „Länger als
  üblich (Richtzeit 4 h)“. Dazu Icon und Warnfarbe.

*Warum:* Ein hängender Zettel fällt sonst erst auf, wenn der Kunde anruft.

**S-04 Ein abgeleiteter Status wird gezeigt, nicht gesetzt**
- Ein Status, der sich aus Teilen ergibt (Auftrag aus seinen Laufzetteln), wird berechnet und mit
  Fortschritt angezeigt: „In Arbeit · 2 von 4 Laufzetteln erledigt“.
- Er hat kein Auswahlfeld. Wer ihn ändern will, sieht, woraus er sich ergibt, mit Links auf die Teile.

*Warum:* Zwei Quellen für denselben Stand widersprechen sich irgendwann, und dann glaubt man keiner mehr.

### Status ändern

**S-05 Nur die erlaubten Schritte, der nächste vorne**
- Ein Status lässt sich nur auf die Werte ändern, die der Ablauf von hier aus erlaubt.
- Der häufigste nächste Schritt ist ein sichtbarer Knopf mit Verb („Fertig melden“). Die übrigen erlaubten
  Schritte liegen im Status-Menü (Kürzel `S`).
- Unmögliche Schritte erscheinen nicht.
- Ist der übliche nächste Schritt gerade nicht möglich, steht der Grund dabei: „Fertig melden geht erst
  nach dem Ausscannen“.

*Warum:* Ein Menü mit allen Werten lädt zu Fehlern ein, und ein grauer Knopf ohne Grund ist ein Rätsel.

**S-06 Bestätigen, was sich nicht zurücknehmen lässt, sonst Rückgängig**
- Endgültige oder folgenreiche Schritte wie Stornieren öffnen eine Bestätigung. Sie nennt die Folgen
  („Der Laufzettel wird storniert. Er verschwindet aus den offenen Listen. Gedruckte Zettel bleiben
  gültig, bis sie entsorgt sind.“). Der Knopf heisst wie die Handlung („Stornieren“, nicht „OK“).
- Muss ein Grund angegeben werden, steht das Feld in der Bestätigung.
- Alle anderen Wechsel passieren sofort und zeigen eine Meldung mit „Rückgängig“, für 8 Sekunden.

*Warum:* Wer zehnmal am Tag „Sind Sie sicher?“ bestätigt, liest die elfte Frage nicht mehr. Rückgängig
schützt, ohne zu bremsen.

**S-07 Ein Scan, eine eindeutige Rückmeldung**
- Ein Scan an einer Station ist ein Wechsel wie jeder andere. Liegt der Zettel nicht an dieser Station,
  wird er eingescannt. Liegt er schon dort, wird er ausgescannt.
- Die Rückmeldung nennt Kennung, Richtung und Station in einem Satz, gross und mit Icon:
  „26100013 – 1/4 eingescannt in Guss“.
- Ein erneuter Besuch derselben Station ist erlaubt und wird gezählt („2. Durchlauf Guss“).
- Ein unbekannter Code oder ein abgeschlossener Zettel ergibt eine Fehlermeldung, die den gelesenen Code
  zeigt.
- Derselbe Code innerhalb von 3 Sekunden ein zweites Mal wird ignoriert. Das wird gemeldet, nicht
  ausgeführt: „Schon erfasst“.

*Warum:* Am Scanner schaut man auf das Werkstück, nicht auf den Bildschirm. Ein doppelt gelesener Code
darf den Zettel nicht gleich wieder ausscannen.

**S-08 Abgeschlossen heisst gesperrt, mit Grund und Weg zurück**
- Ein erledigter oder abgebrochener Datensatz zeigt oben einen Hinweis: „Storniert am 21.10.2026 von
  P. Mohr: Kunde hat abgesagt. Felder sind gesperrt.“
- Die Felder sind schreibgeschützt (lesbar und kopierbar, nicht ausgegraut).
- Wer darf, sieht „Wieder öffnen“. Wer nicht darf, liest, wer es darf.

*Warum:* Gesperrte Felder ohne Erklärung sehen aus wie ein Fehler der Software.

### Nachvollziehen

**S-09 Jede Änderung hinterlässt einen Eintrag**
- Jeder Wechsel von Stand, Ort und Feldern erzeugt einen Verlaufseintrag: wer, wann, was (alt → neu) und
  wie. „Wie“ ist von Hand, per Scan an Gerät/Station, oder automatisch.
- Einträge werden nie bearbeitet oder gelöscht. Ein Rückgängig ist ein neuer Eintrag.

*Warum:* Der Verlauf ist die Antwort auf „wer hat das geändert?“. Das gilt nur, wenn nichts darin fehlt.

**S-10 Der Durchlauf zeigt den Weg**
- Der Weg eines Laufzettels durch die Stationen ist eine eigene, geordnete Liste vom ersten zum letzten
  Besuch. Je Besuch stehen Station, Ein, Aus und Dauer.
- Mehrfache Besuche stehen mehrfach da und sind gezählt.
- Der aktuelle Besuch ist als „jetzt hier“ markiert, mit laufender Dauer. Überschrittene Richtzeiten sind
  wie in S-03 markiert.

*Warum:* Wie lange ein Zettel wo war, ist die Grundlage jeder Frage nach Verzug, und das Papier kann sie
nicht beantworten.

**S-11 Der Verlauf liest sich wie Sätze**
- Einträge sind Sätze mit Namen und Bezeichnungen statt IDs und Feldnamen: „P. Mohr hat Gewicht von 412 g
  auf 418 g geändert“.
- Status-Wechsel nutzen die Badges aus S-01.
- Die Zeit ist relativ („vor 5 min“, gestern als „gestern 14:05“, davor als Datum), mit genauer Zeit als `title`.
- Gleichartige Einträge derselben Person innerhalb von 5 Minuten werden zusammengefasst und lassen sich
  aufklappen („P. Mohr hat 3 Felder geändert“).

*Warum:* Wer den Verlauf liest, sucht eine Geschichte, keine Datenbankzeilen.

**S-12 Der Verlauf ist dort, wo man ihn braucht**
- Die Detailseite zeigt die letzten 3 Einträge unter den Feldern, mit „Ganzer Verlauf“.
- Der Tab „Verlauf“ zeigt alle Einträge, neueste zuerst, filterbar nach *Alle / Status & Ort / Felder*.
- Der Filter steht in der URL (N-03).

*Warum:* Die letzte Änderung braucht man oft, die ganze Geschichte selten. Beides soll einen Klick
entfernt sein.

## Komponenten (Referenz-Umsetzung)

Alles unter `components/status/`.

| Komponente | Zweck | Regeln |
|---|---|---|
| `workflow.ts` | Typen `StatusCategory`, `Workflow`; `allowedTransitions`, `deriveStatus`, `formatDuration`, `formatDateTime`, `formatRelative` | S-01, S-04, S-05 |
| `StatusBadge` | Icon nach Kategorie + Text, optional „seit …“ | S-01, S-03 |
| `StatusMenu` | Knopf mit aktuellem Status, Menü der erlaubten Schritte, Kürzel `S` | S-05 |
| `ConfirmDialog` | Bestätigung mit Folgen, optionalem Grund, Handlungs-Knopf, Fokus-Falle | S-06 |
| `UndoNotice` | Meldung mit „Rückgängig“, 8 s | S-06 |
| `ScanField` | Feld für Hand-Scanner (Tastatur + Enter), Rückmeldung, Doppel-Scan-Sperre | S-07 |
| `LockedNotice` | Hinweis gesperrt mit Grund, „Wieder öffnen“ oder wer darf | S-08 |
| `RouteTimeline` | Durchlauf: Besuche, Dauer, „jetzt hier“, Richtzeit | S-10, S-03 |
| `ActivityLog` | Verlauf: Sätze, Gruppierung, relative Zeit, Filter, Kurzform | S-09, S-11, S-12 |

**Entscheide von Claude:**
- Die Zeit kommt als Prop `now`, mit einem Standard von `Date.now()`. So bleiben Stories und Tests
  deterministisch.
- `ConfirmDialog` ist neu und nutzt nicht den bestehenden `Dialog`, weil dieser weder eine Fokus-Falle
  noch deutsche Beschriftungen hat. `Dialog` bleibt unverändert.
- `UndoNotice` ist neu und nutzt nicht `Toast`, weil `Toast` keine Aktion kennt und nach 4 s
  verschwindet. `Toast` bleibt unverändert.
- `StatusMenu` nutzt dasselbe Menü-Muster wie `ActionMenu`. Wenn sinnvoll, wird `ActionMenu` dafür um
  einen eigenen Auslöser erweitert, ohne Bruch der bestehenden API.

## Durchgehendes Beispiel

Story *Status › Beispiel: Laufzettel-Durchlauf*, auf dem In-Memory-Router aus Teil 2 aufgebaut, mit fester
Uhr.

**Laufzettel-Ablauf** (Stand):

| Status | Kategorie | Wie |
|---|---|---|
| Offen | Geplant | Start |
| In Arbeit | In Arbeit | automatisch beim ersten Einscannen |
| Zurückgestellt | Wartet | von Hand, mit Grund |
| Fertig | Erledigt | von Hand, nur wenn ausgescannt |
| Storniert | Abgebrochen | von Hand, mit Bestätigung und Grund |

- Erlaubte Schritte: Offen → Storniert; In Arbeit → Zurückgestellt, Fertig, Storniert;
  Zurückgestellt → In Arbeit, Storniert. Für Fertig und Storniert gibt es „Wieder öffnen“ → In Arbeit,
  sofern erlaubt.
- Stationen (Ort) wie in Teil 3: 3D, Guss, Polissage, Versand, mit Richtzeiten (z. B. Guss 4 h).

**Auftrag:** Der Status ist aus seinen 4 Laufzetteln abgeleitet.
- *Storniert*: alle storniert.
- *Offen*: alle nicht stornierten offen (Nachtrag nach dem Review: ein stornierter Zettel startet die Arbeit nicht).
- *Fertig*: alle fertig oder storniert, und mindestens einer fertig.
- *In Arbeit*: sonst.
- Dazu immer „x von n Laufzetteln erledigt“.

**Seite:**
- Kopf (PageHeader) mit Kennung, Stand und Ort samt „seit“, Knopf „Fertig melden“ bzw. „Zum
  Ausscannen…“-Hinweis, und Status-Menü.
- Tabs „Details / Durchlauf / Verlauf“. Details hat Felder (schreibgeschützt bei gesperrtem Zettel),
  den Kurzverlauf und eine Auftrags-Karte mit dem abgeleiteten Status.
- Ein Bereich „Scannen“ mit Auswahl „Diese Station“ und `ScanField`. Codes der anderen Zettel des
  Auftrags funktionieren auch, der Rest ist unbekannt.

**Varianten:** In Arbeit an Guss mit überschrittener Richtzeit, Storniert (gesperrt, darf wieder öffnen),
Fertig (gesperrt, darf nicht).

## Testen

Vitest + Testing Library auf beobachtbares Verhalten, insbesondere:
- `allowedTransitions` liefert nur erlaubte Ziele. `deriveStatus` deckt alle vier Fälle und den
  Fortschritt ab.
- `formatDuration(130 min) === "2 h 10 min"`, `formatRelative` (vor 5 min / gestern als Datum).
- `StatusBadge` hat Text, Icon `aria-hidden`, und die Kategorie als `data-category`.
- `StatusMenu` zeigt nur erlaubte Schritte und öffnet mit `S`, nicht im Eingabefeld.
- `ConfirmDialog`:
  - Fokus startet auf „Abbrechen“.
  - Tab bleibt im Dialog.
  - Escape bricht ab.
  - Der Pflicht-Grund verhindert die Bestätigung, solange er leer ist.
- `UndoNotice` ruft Rückgängig auf und verschwindet nach 8 s (Fake-Timer).
- `ScanField`:
  - Einscannen und Ausscannen.
  - Ein zweiter Durchlauf wird gezählt.
  - Ein unbekannter Code zeigt den Code.
  - Derselbe Code innerhalb von 3 s ergibt „Schon erfasst“, nach 3 s gilt er wieder.
- `RouteTimeline` zeigt mehrfache Besuche, „jetzt hier“ und die Richtzeit-Warnung.
- `ActivityLog`:
  - Gruppiert 3 Feldänderungen innerhalb von 5 min.
  - Trennt sie bei 6 min Abstand.
  - Filter.
  - Kurzform mit 3 Einträgen.
- Beispiel:
  - Scan → Stand wird „In Arbeit“, der Verlauf hat einen neuen Eintrag.
  - Fertig melden vor dem Ausscannen ist nicht möglich und nennt den Grund.
  - Stornieren → Sperre + Hinweis.
  - Rückgängig nach einem Wechsel stellt den alten Stand her und schreibt einen Eintrag.

## Handbuch-Seiten

Wie Teile 1–3:
- *Handbuch › Status*: eine Übersicht mit `RuleIndex` (Status zeigen / Status ändern / Nachvollziehen) und
  je Regel eine Seite mit Gut/Schlecht.
- Einleitung: „Status & Lebenszyklus – verfügbar“ und die IDs `S-01 … S-12`.
- `rules.test.ts` wird um `S` erweitert.
- L-03 (Übertragen) bekommt einen Verweis auf S-01.

## Dem Umsetzer überlassen

- Genaue Masse, Farben und Abstände (Tokens, ruhig wie Linear).
- Die genauen Icons je Kategorie, solange sie sich in der Form unterscheiden.
- API-Details von `ActivityLog`-Einträgen und Workflow-Definition.
- Wie die Scan-Rückmeldung genau aussieht, solange sie gross ist, Icon und Satz hat und vorgelesen wird
  (`role="status"` bzw. `role="alert"`).
