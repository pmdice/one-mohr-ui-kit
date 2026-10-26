# Handbuch Teil 5: Werkstatt-Ansicht

**Datum:** 2026-10-26
**Status:** Freigegeben („mach die letzte Ansicht“: Patrick überlässt Inhalt und Umsetzung Claude)
**Baut auf:** Teil 1 (Dichte `comfortable`), Teil 4 (S-02 Ort, S-03 Richtzeit, S-07 Scan, `resolveScan`, Laufzettel-Beispiel)

## Warum

Das hat Patrick erzählt:
- In der Produktion steht ein Tablet. Der Gusszettel wird ausgedruckt, aber digital erfasst.
- Kommt der Zettel an eine Station, wird er gescannt und ist damit an diesem Arbeitsort aktiv. Verlässt
  er die Station, wird er wieder gescannt. Dieselbe Station kann mehrmals durchlaufen werden.
- Die Werkstatt-Ansicht ist „nur eine Kamera-View mit kleinen Informationen und that's it“.

Teil 4 hat die Regeln für den Scan selbst festgelegt (S-07). Dieser Teil regelt die Ansicht, in der
gescannt wird: ein Tablet, das an einer Station steht, mit der Kamera als Scanner, bedient im Stehen,
mit schmutzigen Händen und mit dem Blick auf dem Werkstück.

**Erfolg:**
- Wer einen Zettel vor das Tablet hält, weiss nach einer Sekunde, ob er ein- oder ausgescannt ist, ohne
  hinzuschauen. Ein Blick genügt für das Wichtigste zum Zettel.
- Kein Scan geht verloren, auch wenn das WLAN in der Giesserei aussetzt.

## Ziele

- Regeln **W-01 bis W-08** im bekannten Format, Deutsch, unabhängig vom Framework. Bewusst nur acht,
  weil die Ansicht klein ist.
- Referenz-Komponenten für die Tablet-Ansicht: Kamera-Scanner mit Ersatz-Eingabe, Stationskopf,
  grosse Rückmeldung, Kurzinfo zum Zettel, Warteschlange für Scans ohne Netz, Liste „Jetzt hier“.
- Ein Beispiel: *Werkstatt › Beispiel: Tablet an der Station*. Die Kamera wird simuliert, weil Storybook
  und Tests keine Kamera haben.

## Nicht-Ziele

- Formulare in der Werkstatt (Gewicht eintragen usw.). Dafür gelten die Formular-Regeln in komfortabler
  Dichte.
- Ein Login am Tablet oder ein Benutzerwechsel. Das Gerät ist an der Station angemeldet.
- Native App, Offline-Installation (PWA) und Druck.
- Eine eigene Bibliothek zum Erkennen von Barcodes. Die Referenz nutzt die `BarcodeDetector`-API des
  Browsers, wo es sie gibt, und zeigt sonst die Ersatz-Eingabe.

## Anti-Ziele

- Eine Desktop-Seite, die man auf dem Tablet verkleinert öffnet.
- Kleine Knöpfe, Hover oder Tooltips als einziger Weg zu einer Information.
- Ein Scan, der still verloren geht oder doppelt zählt.
- Eine Ansicht, die bei verweigerter Kamera leer bleibt.

## Regeln

### Einrichten

**W-01 Ein Gerät, eine Station**
- Das Tablet wird einmal einer Station zugeordnet und merkt sich das auf dem Gerät.
- Die Station steht gross oben auf jeder Werkstatt-Seite.
- „Station wechseln“ ist möglich, aber bewusst: Es liegt nicht neben dem Scan und braucht eine
  Bestätigung.
- Ohne Station wird zuerst gefragt; gescannt wird erst danach.

*Warum:* Jeder Scan zählt an der Station des Geräts. Steht das Gerät auf der falschen, landet jeder Zettel
falsch, und niemand merkt es.

**W-02 Die Kamera ist die Seite**
- Das Kamerabild füllt den grössten Teil des Bildschirms und startet von selbst. Ein Rahmen zeigt, wohin
  der Code gehört.
- Darunter gibt es immer ein Eingabefeld für Hand-Scanner oder zum Eintippen der Nummer.
- Ist die Kamera verweigert oder nicht vorhanden, sagt die Ansicht das in einem Satz, nennt, wie man sie
  erlaubt, und macht die Eingabe zur Hauptsache.

*Warum:* Am Tablet gibt es nichts anderes zu tun als zu scannen. Wenn die Kamera streikt, muss die Arbeit
trotzdem weitergehen.

**W-03 Gross genug für Handschuhe und zwei Meter Abstand**
- Die Werkstatt nutzt die komfortable Dichte. Ziele sind mindestens 48 px hoch.
- Die wichtigste Information steht in mindestens 20 px.
- Es gibt keinen Hover, keine Tooltips und keine Information, die nur in einem Icon steckt.
- Der Kontrast hält auch grelles Hallenlicht aus.

*Warum:* Wer mit Handschuhen, im Stehen und aus Abstand bedient, trifft keine 32-px-Knöpfe und liest
keine 13-px-Schrift.

### Scannen

**W-04 Die Rückmeldung ist für Augen und Ohren**
- Jeder Scan zeigt über die ganze Breite einen Balken mit Icon, Farbe und einem Satz (S-07). Das grosse
  Wort ist **EIN** oder **AUS**.
- Dazu gibt es einen kurzen Ton: einen hellen für ein, zwei für aus, einen tiefen für Fehler. Wo das Gerät
  es kann, vibriert es zusätzlich. Der Ton lässt sich am Gerät abschalten.
- Die Rückmeldung bleibt bis zum nächsten Scan stehen.

*Warum:* Der Blick ist beim Werkstück. Ton und Grösse sagen aus dem Augenwinkel, ob es geklappt hat.

**W-05 Nur das Nötigste zum Zettel**
- Nach dem Scan zeigt eine Karte höchstens fünf Angaben: Kennung, Kunde, Material, Stück und
  Dringlichkeit.
- Hinweise zum Zettel („Steine nicht mitgiessen“) stehen darüber, gross und als Warnung.
- Weitere Details gibt es hier nicht. Wer mehr braucht, geht an den Arbeitsplatz.

*Warum:* An der Station braucht man die Bestätigung, dass es der richtige Zettel ist, und den einen
Hinweis, der einen Fehler verhindert. Alles andere lenkt ab.

**W-06 Fehler sagen, was jetzt zu tun ist**
- Jede Fehlermeldung nennt den nächsten Schritt:
  - „Code nicht erkannt. Nummer unten eintippen oder Zettel ins Büro bringen.“
  - „26100013 – 2/4 ist fertig. Kein Scan möglich. Zettel ins Büro bringen.“
- Ein versehentlicher Scan lässt sich 10 Sekunden lang mit einem grossen Knopf „Scan zurücknehmen“
  zurücknehmen.

*Warum:* In der Werkstatt gibt es niemanden, der fragt „und jetzt?“. Ein Fehler ohne nächsten Schritt
führt zu einem Zettel, der liegen bleibt.

### Verlässlich

**W-07 Kein Scan geht verloren**
- Ohne Verbindung wird ein Scan auf dem Gerät gespeichert und sofort als „gespeichert, wird gesendet“
  bestätigt.
- Eine dauernde Anzeige oben sagt „3 Scans warten auf Verbindung“.
- Sobald die Verbindung zurück ist, werden die Scans in der richtigen Reihenfolge mit ihrer ursprünglichen
  Zeit gesendet.
- Ein Scan, den der Server ablehnt, bleibt sichtbar in der Liste und wird nicht stillschweigend
  verworfen.

*Warum:* Ein verlorener Scan ist ein Zettel, der digital an der falschen Station steht. Das merkt man
erst, wenn er gesucht wird.

**W-08 Was hier liegt, ist sichtbar**
- Neben oder unter der Kamera steht die Liste „Jetzt an Guss (5)“: die Zettel, die an dieser Station
  eingescannt sind, die längsten zuerst, mit Dauer und Richtzeit-Warnung (S-03).
- Ein Tippen auf einen Zettel zeigt seine Karte (W-05).

*Warum:* Die Station sieht so, was liegen geblieben ist, und der Platz auf dem Tisch stimmt mit dem auf
dem Bildschirm überein.

## Komponenten (Referenz-Umsetzung)

Alles unter `components/workshop/`.

| Komponente | Zweck | Regeln |
|---|---|---|
| `StationHeader` | Station gross, „Station wechseln“ mit Bestätigung, Warteschlangen-Anzeige | W-01, W-07 |
| `StationPicker` | Erste Einrichtung: Station wählen, auf dem Gerät gespeichert | W-01 |
| `CameraScanner` | Kamerabild + Rahmen + Erkennung über `BarcodeDetector`; Zustände startet / aktiv / verweigert / nicht unterstützt; Ersatz-Eingabe | W-02 |
| `ScanBanner` | Rückmeldung über die ganze Breite: EIN/AUS/Fehler, Satz, nächster Schritt, Ton, Vibration | W-04, W-06 |
| `SlipCard` | Höchstens fünf Angaben und Hinweise | W-05 |
| `scanQueue.ts` | Warteschlange: speichern, der Reihe nach senden, Ablehnungen behalten | W-07 |
| `HereList` | „Jetzt an {Station}“ mit Dauer und Warnung | W-08 |

**Entscheide von Claude:**
- Erkannt wird über die `BarcodeDetector`-API des Browsers, ohne neue Abhängigkeit. Die Kamera und der
  Detektor werden als Props hereingegeben, damit Tests und Stories sie ersetzen können. Wo die API fehlt
  (z. B. Safari), steht in „Übertragen“, dass eine Bibliothek wie ZXing nötig ist.
- Die Station wird in `localStorage` unter `workshop:station` gespeichert, gekapselt in try/catch.
- Die Töne erzeugt die Web-Audio-API direkt, ohne Audiodateien.
- Die Ansicht nutzt `data-density="comfortable"` an ihrem Wurzel-Element, unabhängig von der
  globalen Einstellung.
- Die Logik des Scans (`resolveScan`) und das Laufzettel-Modell kommen aus Teil 4 und werden
  wiederverwendet.

## Beispiel

Story *Werkstatt › Beispiel: Tablet an der Station*:
- Eine simulierte Kamera, in der Story klar als Simulation beschriftet. Neben dem Kamerabild liegen die
  „Zettel auf dem Tisch“ als Knöpfe: Ein Tippen hält den Zettel vor die Kamera. Ein unbekannter Code und
  ein fertiger Zettel sind dabei.
- Ein Schalter „Verbindung“ (an/aus) simuliert das WLAN.
- Varianten:
  - Standard (Station Guss).
  - Erste Einrichtung (keine Station).
  - Kamera verweigert.
  - Ohne Verbindung mit 3 wartenden Scans.

## Testen

- `scanQueue`:
  - Speichert offline.
  - Sendet beim Wiederverbinden in Reihenfolge mit der Originalzeit.
  - Eine Ablehnung bleibt in der Liste mit Grund.
  - Ein Fehler beim Senden bricht ab und versucht es später, ohne zu verdoppeln.
- `CameraScanner`:
  - Ein erkannter Code ruft `onCode` genau einmal auf, solange derselbe Code im Bild bleibt.
  - Verweigert → Satz + Eingabe.
  - Keine `BarcodeDetector`-API → Hinweis + Eingabe.
  - Der Kamera-Stream wird beim Verlassen gestoppt.
- `ScanBanner`: EIN/AUS/Fehler mit Rolle `status`/`alert`; der Ton wird über eine eingereichte Funktion
  abgespielt und lässt sich abschalten.
- `StationHeader` und `StationPicker`:
  - Ohne Station → Auswahl, dann gespeichert.
  - Ein Wechsel braucht eine Bestätigung.
  - Ein werfendes `localStorage` blockiert nicht.
- `SlipCard`: höchstens fünf Angaben, der Hinweis als Warnung.
- `HereList`: die längsten zuerst, mit Richtzeit-Warnung.
- Beispiel:
  - Simulierter Scan → EIN, Karte, Liste wächst.
  - Zweiter Scan nach 3 s → AUS.
  - Offline-Scan → Anzeige „1 Scan wartet“; Verbindung an → gesendet, Anzeige weg.
  - Scan zurücknehmen.

## Handbuch-Seiten

- *Handbuch › Werkstatt*: Übersicht mit `RuleIndex` (Einrichten / Scannen / Verlässlich) und W-01 bis
  W-08 mit Gut/Schlecht.
- Einleitung: „Werkstatt-Ansicht – verfügbar“ und die IDs `W-01 … W-08`.
- `rules.test.ts` um `W` erweitern, mit 8 Regeln.
- S-07 (Übertragen) bekommt einen Verweis auf W-04.

## Dem Umsetzer überlassen

- Genaue Masse und Farben (Tokens, komfortable Dichte).
- Wie die simulierte Kamera aussieht, solange klar ist, dass es eine Simulation ist.
- Die Tonhöhen und die Länge der Töne.
