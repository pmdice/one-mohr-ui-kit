# One Mohr UI Kit: Richtung „Firmensoftware“ + Teil 1 Formulare

**Datum:** 2026-10-25
**Status:** Freigegeben, bereit für Umsetzungsplanung

## Warum

Patrick baut bei der Raptus AG den *Casting Manager* für Altmann Casting (Laravel + Nova).
Die Software digitalisiert den Gusszettel, der heute von Hand durch die Abteilungen geht.
Im Projekt zeigt sich immer wieder dasselbe: Firmensoftware ist am Ende eine grosse
CRUD-Anwendung mit vielen Bedingungen, und ob sie benutzt wird, entscheidet sich an
vielen kleinen UI/UX-Details. Ein Beispiel: Man erkennt nicht, ob ein Feld Pflicht ist.
Es fehlt eine Hierarchie, und auch eine durchdachte Navigation gibt es nicht. Erst diese
Details machen den Unterschied zwischen „irgendwas stimmt nicht“ und „fühlt sich gut an“.

Was fehlt, sind keine hübscheren Buttons. Es fehlen **festgelegte Regeln**, damit nicht
jeder Entwickler jede dieser Entscheidungen neu trifft.

Das One Mohr UI Kit wird deshalb vom allgemeinen Komponenten-Showcase zu einem
**Handbuch für Firmensoftware mit Referenz-Komponenten**: Es hält fest, wie man solche
Software baut, und zeigt es am lebenden Beispiel.

**Erfolg:** Patrick kann eine Regel aus dem Kit direkt im Casting Manager (Nova/Vue)
anwenden, ohne sie erst neu interpretieren zu müssen.

## Ziele

- Regeln für typische Probleme von Firmensoftware, formuliert **unabhängig vom
  Framework**. Jede Regel hat einen Satz *Regel*, eine kurze *Begründung* und ein
  *Gut/Schlecht*-Beispiel.
- React-Komponenten als **Referenz-Umsetzung** der Regeln, in Storybook direkt neben der
  Regel zu sehen und auszuprobieren.
- Design-Tokens als reine CSS-Variablen, damit sie in jeden Stack übertragbar sind
  (Nova, Vue, Inertia).
- Zwei Dichtestufen von Anfang an: **kompakt** für den Schreibtisch (Admins legen
  Datensätze an) und **komfortabel** für die Werkstatt (scannen, wenige Werte
  eintragen, grössere Ziele).
- Teil 1 dieses Dokuments: **Formulare** vollständig (siehe unten).

## Nicht-Ziele (vorerst)

- Vue-Version oder direkte Einbindung in Laravel/Inertia/Nova. Kommt erst, wenn sich der
  Stack bei Raptus festigt. Die Regeln überträgt Patrick von Hand.
- Ein npm-Paket, Versionierung oder Veröffentlichung.
- Onboarding-Material für Kollegen. Die Regeln sollen aber so geschrieben sein, dass ein
  Kollege sie ohne Patrick versteht, denn später lesen sie auch die Kollegen.
- Ein Zuschnitt auf den Casting Manager. Er dient als **Prüfstein** (taugt die Regel für
  diesen Fall?), aber Regeln und Beispiele bleiben allgemein, also z. B. „Position“ statt
  „Gussposition“.
- Navigation/App-Rahmen, Tabellen und Status-Lebenszyklus. Die kommen als eigene Teile
  mit eigenem Design-Dokument (siehe „Später“).

## Anti-Ziele (würde es zum Fehlschlag machen)

- Regeln, die nur in React Sinn ergeben, etwa weil sie an eine Hook-API oder eine
  Bibliothek gekoppelt sind statt an ein beobachtbares Verhalten.
- Ein schöner Showcase, der für Website-Ästhetik optimiert ist (Pill-Inputs, Hero,
  dekorative Animationen) und nicht für Arbeitstempo.
- Regeln ohne Begründung. Ohne das „Warum“ kann man sie nicht auf neue Fälle übertragen.

## Gestaltungsrichtung

Vorbild ist **Linear**:

- Ruhig und fast farblos. Farbe trägt nur Bedeutung (Status, Fehler, Fokus), nie
  Dekoration.
- Hohe Dichte mit klarer Typo-Hierarchie und konsequenten Abständen.
- Tastatur zuerst: logische Tab-Reihenfolge, Kürzel für häufige Aktionen
  (z. B. ⌘/Ctrl+Enter = Speichern).
- Tempo als Gefühl: sofortige Reaktion, Skeletons statt Spinner, Animation nur wo sie
  Orientierung gibt (z. B. ein neu erscheinendes Feld).

Bewusste Abweichung: Werkstatt-Ansichten nutzen die komfortable Dichte.

Bestehender Stil aus SpaceFlow WMS, der übernommen wird: neutrale Töne, IDs und Codes in
Monospace, kleine Labels, eine Akzentfarbe für „Achtung“.

## Aufbau des Kits

### Regeln als Dokumentation

- Jede Regel ist eine MDX-Seite in Storybook. *Entscheid Claude:* Storybook gibt es schon
  und es kann Text und lebende Beispiele auf einer Seite kombinieren.
- Sprache der Regeln: **Deutsch**. Code, Props und Kommentare: Englisch, wie bisher.
  *Entscheid Claude:* Patrick und das Raptus-Team arbeiten auf Deutsch.
- Format jeder Regel:
  1. **Regel**: ein Satz, imperativ.
  2. **Warum**: 1–3 Sätze.
  3. **Gut / Schlecht**: lebendes Beispiel nebeneinander.
  4. **Übertragen**: ein bis drei Stichpunkte, worauf man achten muss, wenn man die Regel
     in einem anderen Stack (z. B. Nova) umsetzt. Rein beschreibend, keine
     Nova-spezifische Implementierung.
- Regel-IDs (z. B. `F-03`), damit man in Tickets und Code-Reviews darauf verweisen kann.

### Tokens

- Alle Farben, Abstände, Radien, Schriftgrössen und Dichte-Werte als CSS-Variablen in
  `app/globals.css` (oder einer eigenen `tokens.css`). Tailwind liest sie über `@theme`.
- Semantische Namen statt Farbnamen: `--color-danger`, `--color-text-muted`,
  `--color-border-strong` usw. Komponenten verwenden **keine** rohen Tailwind-Farben wie
  `red-500` oder `slate-400` mehr.
- Dichte über einen Container-Wert, z. B. `data-density="compact|comfortable"` auf einem
  Eltern-Element, das Höhen, Paddings und Schriftgrössen per Variablen umschaltet.
- Hell- und Dunkelmodus bleiben (ThemeToggle existiert).

### Aufräumen bestehender Komponenten

- **Alle verbleibenden Komponenten** (Button, Badge, Card, Tabs, Accordion, Toast, Dialog,
  Tooltip, SearchInput, ThemeToggle, Navbar) werden in Teil 1 auf die neuen Farb- und
  Radius-Tokens umgestellt. Das ist eine reine Umstellung ohne Redesign. Die
  Dichte-Tokens wirken in Teil 1 nur auf Formular-Komponenten und Button. Die Navbar
  wird erst in der Runde „Navigation“ neu gedacht. *Entscheid Claude:* Sonst gibt es
  zwei Farbsysteme nebeneinander.
- `Input`, `Select`, `Textarea`: weg von `rounded-full`, hin zu dezenten Radien; Höhe
  aus dem Dichte-Token.
- `Select`: Pfeiltasten verschieben nur noch den Fokus in der geöffneten Liste, sie
  ändern **nicht** direkt den Wert. Auswahl erst mit Enter/Klick. Bei längeren Listen
  durchsuchbar (Combobox), wobei die Schwelle Sache des Umsetzers ist.
- `Hero` und `FadeIn` sowie website-artige Teile der Demo-Seite entfernen.
  *Entscheid Claude:* Sie passen nicht zur Richtung und lenken ab.
- `app/page.tsx` wird zur Übersicht/Startseite des Handbuchs oder auf ein Minimum
  reduziert. Die eigentliche Dokumentation lebt in Storybook.
- Paketname `design-system-showcase` und ein allfälliger neuer Projektname: offen,
  später entscheiden.

## Teil 1: Formulare

### Regeln

**F-01 Pflicht vs. optional kennzeichnen**
Kennzeichne die *Minderheit*. Sind in einem Abschnitt die meisten Felder Pflicht,
werden die optionalen mit „(optional)“ markiert. Sind die meisten optional, werden
Pflichtfelder markiert. Die Konvention wird **pro Abschnitt vom Entwickler festgelegt**
(nicht zur Laufzeit berechnet), damit ein eingeblendetes bedingtes Feld nicht alle
Markierungen umschaltet. Wiederholbare Blöcke sind ein eigener Abschnitt.
*Entscheid Claude.*
Das Pflicht-Merkmal ist nicht nur Farbe (Screenreader-Text / `aria-required`).
*Warum:* Ein Sternchen an fast jedem Feld ist Rauschen; man übersieht das eine, das fehlt.

**F-02 Wann Fehler erscheinen**
Eine Fehlermeldung erscheint erst beim Verlassen des Feldes (blur) oder beim
Speichern, nie schon während der ersten Eingabe. Ist ein Fehler einmal sichtbar,
verschwindet er sofort, sobald die Eingabe gültig ist (live während des Tippens).
*Warum:* Wer früh angemeckert wird, fühlt sich bestraft; wer korrigiert, will sofort sehen,
dass es jetzt stimmt.

**F-03 Fehlermeldungen sagen, was zu tun ist**
„Stückzahl muss mindestens 1 sein“ statt „Ungültige Eingabe“. Die Meldung steht direkt
am Feld, nicht nur oben.

**F-04 Fehlerzusammenfassung beim Speichern**
Schlägt das Speichern fehl: Fokus springt auf das erste fehlerhafte Feld, und oben im
Formular steht eine Zusammenfassung („2 Positionen unvollständig: #2, #4“) mit Links zu
den Stellen. Eingeklappte Bereiche mit Fehlern klappen auf.

**F-05 Lange Formulare in Abschnitte gliedern**
Ab etwa 7–8 Feldern: Abschnitte mit Überschrift. Zusammengehöriges nebeneinander (z. B.
Typ / Legierung / Stückzahl in einer Zeile), Reihenfolge entspricht dem Denkfluss bzw.
der Papiervorlage.

**F-06 Positionen (wiederholbare Gruppen) sind Blöcke**
Eine wiederholbare Gruppe (Position, Zeile, Eintrag) ist ein klar abgegrenzter Block mit:
- Nummer und **Zusammenfassung im Kopf** (z. B. „#2 · Form bestehend · AlSi10Mg · 40 Stk“),
  die sich aus den Feldwerten bildet;
- Zustandsanzeige im Kopf: „3 Pflichtfelder offen“ bzw. „vollständig“. Gezählt werden
  **leere** Pflichtfelder, die gerade sichtbar sind, inklusive der Felder in den
  eigenen Unterzeilen. Ein Block ist erst vollständig, wenn auch seine Unterzeilen es
  sind. Ausgefüllte, aber ungültige Werte (z. B. Menge = 0) zeigen sich nach F-02 als
  Fehler am Feld, und der Kopf zeigt dann „Fehler“ statt „vollständig“.
  *Entscheid Claude.*
- Aktionen im Kopf: einklappen/aufklappen, entfernen (mit Rückgängig statt
  Bestätigungsdialog), ggf. duplizieren.
*Warum:* Bei vielen Positionen mit vielen Unterzeilen verliert man sonst, wo eine
Position anfängt und was in ihr fehlt.

**Nummern sind stabil** (Entscheid Patrick): Eine Position behält ihre Nummer, solange
sie existiert. Wird eine gelöscht, entsteht eine Lücke (#1, #3, #4), und es wird nicht
nachnummeriert. Eine neue Position erhält die höchste je vergebene Nummer + 1. Gelöschte
Nummern werden nicht wiederverwendet, ausser „Rückgängig“ stellt genau diese Position
wieder her. Ein Duplikat erhält eine neue Nummer. Die Fehlerzusammenfassung und die
Sprunglinks verweisen auf diese Nummer.
*Warum:* Nummern wandern auf Papier, in die Werkstatt und auf Rechnungen („schau bei
Position 3“). Würden sie sich nachträglich ändern, zeigte jeder Verweis plötzlich auf
die falsche Position.

**F-07 Unterzeilen gehören sichtbar zu ihrem Block**
Kindzeilen (z. B. Zusatzleistungen einer Position) sind eingerückt und durch eine
Führungslinie mit ihrem Block verbunden. Der „+ Unterzeile“-Knopf steht am Ende *der
eigenen* Unterzeilen, nicht global. Unterzeilen können eigene Pflicht- und bedingte Felder
haben; es gelten dieselben Regeln.

**F-08 Neue Blöcke zeigen sofort, was fehlt**
Ein neu hinzugefügter Block ist aufgeklappt, der Fokus liegt im ersten Feld, und der
Kopf zeigt die Zahl offener Pflichtfelder. Fehler-*Meldungen* erscheinen trotzdem erst
nach F-02. Die Zähler-Anzeige ist neutral, nicht rot.

**F-09 Fertige Blöcke einklappbar**
Vollständige Blöcke lassen sich einklappen (einzeln und „alle einklappen“); eingeklappt
sieht man nur die Kopfzeile mit Zusammenfassung. Unvollständige Blöcke bleiben
standardmässig offen.

**F-10 Bedingte Felder**
Hängt ein Feld von einer Auswahl ab (z. B. Typ „Form bestehend“ → „Bestehender Artikel“,
Zusatzleistung „3D-Druck“ → „Dateinummer“):
- erscheint es direkt beim auslösenden Feld (daneben oder darunter), mit dezenter
  Einblend-Animation (respektiert `prefers-reduced-motion`);
- ist es **ausgeblendet**, wenn es nicht gilt (nicht ausgegraut);
- sieht ein bedingtes Pflichtfeld aus wie jedes Pflichtfeld;
- zählt es in den Pflichtfeld-Zähler des Blocks, solange es sichtbar ist;
- bleibt ein bereits eingegebener Wert beim Umschalten im Hintergrund erhalten, wird aber
  nur gespeichert/validiert, wenn das Feld gilt.

**F-11 Tastatur**
Tab-Reihenfolge folgt der visuellen Reihenfolge. Enter in einem einzeiligen Feld
speichert *nicht* versehentlich ein grosses Formular; Speichern per Button oder
⌘/Ctrl+Enter. Neue Position/Unterzeile per Tastatur erreichbar.

**F-12 Ungespeicherte Änderungen**
Verlässt man ein geändertes Formular, kommt eine Warnung. Der Speichern-Button wird
**nie wegen fehlender Pflichtfelder deaktiviert**: Ein grauer Button sagt nicht, *was*
fehlt. Er bleibt klickbar, und der Klick löst F-04 aus.

### Komponenten (Referenz-Umsetzung)

Neu bzw. überarbeitet, jeweils mit Story und Regel-Verweis:

| Komponente | Zweck | Regeln |
|---|---|---|
| `FormField` (überarbeitet) | Label, Pflicht/optional-Markierung, Hinweis, Fehler, `aria-*`-Verknüpfung | F-01–F-03 |
| `FormSection` | Abschnitt mit Überschrift, optional Beschreibung | F-05 |
| `FormErrorSummary` | Zusammenfassung mit Sprunglinks | F-04 |
| `RepeatableGroup` / `GroupBlock` | Liste von Blöcken mit Kopf (Nummer, Zusammenfassung, Zähler, Aktionen), Ein-/Ausklappen, Hinzufügen/Entfernen mit Rückgängig | F-06, F-08, F-09 |
| `SubRows` | Eingerückte Unterzeilen mit Führungslinie und lokalem „+“ | F-07 |
| `ConditionalField` | Ein-/Ausblenden abhängig von einem Wert, inkl. Zähler-Beteiligung | F-10 |
| `Select` / `Combobox` (überarbeitet) | Korrekte Tastaturbedienung, durchsuchbar | F-11 |
| `Input`, `Textarea` (überarbeitet) | Tokens, Dichte, `aria-invalid` | — |

**Formular-Zustand:** Die Referenz-Umsetzung nutzt `react-hook-form` mit `zod`
(bedingte Pflicht über Schema-Verfeinerungen, verschachtelte Arrays über
`useFieldArray`). *Entscheid Claude:* verbreitet, gut für verschachtelte und bedingte
Felder. Die Regeln selbst sind davon unabhängig formuliert; Komponenten wie `FormField`
bleiben ohne Formular-Bibliothek verwendbar (kontrollierte Props).

### Durchgehendes Beispiel

Eine Story „Auftrag erfassen“ verbindet alles, allgemein gehalten aber strukturell
gleich wie der schwierigste Fall im Casting Manager:

- Abschnitt *Kopfdaten* (ein paar einfache Felder, gemischt Pflicht/optional).
- Abschnitt *Positionen*: wiederholbare Blöcke mit **Typ** (Auswahl), **Material**
  (Auswahl), **Menge** (Zahl). Alle drei Pflicht. Optional Fotos/Anhänge und Notiz.
  - Typ = „Bestehende Vorlage“ → bedingtes Pflichtfeld **Bestehender Artikel**. Das ist
    eine **asynchrone Combobox mit Server-Suche** (im Beispiel simuliert mit
    Verzögerung, Ladezustand und Debounce), weil echte Artikelstämme Tausende Einträge
    haben. *Entscheid Claude.*
  - Pro Position beliebig viele **Zusatzleistungen** (Unterzeilen) mit Art (Auswahl).
    Art = „3D-Druck“ → bedingtes Pflichtfeld **Dateinummer**.
- Speichern mit Fehlerzusammenfassung; Beispieldaten mit 4+ Positionen und vielen
  Zusatzleistungen, damit das Übersichtsproblem sichtbar wird.
- Beide Dichten umschaltbar.

Foto-Upload: im Beispiel nur als einfaches Datei-Feld/Platzhalter, ohne echte Upload-Logik.

### Testen

- Bestehendes Setup (Vitest + Testing Library, Storybook a11y-Addon).
- Tests auf beobachtbares Verhalten der Regeln: Fehler erscheint erst nach blur,
  verschwindet live; bedingtes Feld erscheint/verschwindet und zählt korrekt; Zähler im
  Blockkopf; Fokus springt beim Speichern zum ersten Fehler; Select-Pfeiltasten ändern den
  Wert nicht.
- a11y-Addon ohne Verstösse auf den Formular-Stories.

## Später (eigene Runden, nicht Teil dieses Dokuments)

1. **Navigation & App-Rahmen:** Sidebar mit Gruppen, Einklappen, Breadcrumb, Seitenkopf
   mit Hierarchie. Material aus SpaceFlow WMS.
2. **Listen & Tabellen:** dichte Tabelle, Sortieren, Filtern, leere Zustände,
   Liste → Detail → Bearbeiten. Material aus SpaceFlow WMS (`LogisticsTable`).
3. **Status & Lebenszyklus:** einheitliche Status-Sprache (Icon + Farbe), Scan-Ein/Aus,
   Historie/Prüfprotokoll. Der Gusszettel-Durchlauf durch Abteilungen ist der Prüfstein.
4. **Werkstatt-Ansicht:** Scan als Hauptaktion in komfortabler Dichte.
5. Befehlspalette (⌘K) und globale Kürzel.

## Dem Umsetzer überlassen

- Genaue Token-Werte (Farben, Abstände, Radien), solange ruhig/neutral im Sinn von Linear
  und dem WMS-Stil.
- Ob Tokens in `globals.css` bleiben oder in eine eigene Datei wandern.
- Ab welcher Optionsanzahl ein Select durchsuchbar wird.
- Konkrete Animationen (dezent, kurz, `prefers-reduced-motion` respektieren).
- Aufteilung der Komponenten in atoms/molecules/organisms.
