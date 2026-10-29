# Teil 0: Grundlagen (G-01–G-10) und Aufräumen

## Warum

Fünf Teile stehen auf Tokens, Dichten und Regeln, die nur im Code leben (`app/tokens.css`, Token-Guard).
Wer die Regeln nach Nova überträgt, muss sie nachlesen können: welche Farbe was bedeutet, welche
Schriftgrössen es gibt, wann komfortabel, wie Fokus aussieht. Linear und Vercel (Geist) machen das
genau so: eine kleine, benannte Skala und eine Seite, die sie erklärt. Ausserdem stehen zwei
Generationen von Bausteinen nebeneinander (alter `Dialog` mit framer-motion, neuer `ConfirmDialog`
mit eigener Fokus-Falle), und ein Kollege findet nicht, welcher Baustein welche Regel umsetzt.

Patrick hat freie Hand gegeben („nach Best Practices, Linear und Vercel als Vorbild“). Alle
Entscheidungen hier sind meine.

## Ziele

1. **Handbuch „Grundlagen“** mit zehn Regeln G-01–G-10 (gleiches Format wie F/N/L/S/W: Regel,
   Warum, Details, Gut/Schlecht, Übertragen).
2. **Token-Seite** „Grundlagen/Tokens“: Farben als Muster mit Name, Rolle und Wert in hell und dunkel,
   Schriftstufen, Abstände, Radien, Dichten, Bewegung. Die Werte werden zur Laufzeit aus den
   CSS-Variablen gelesen, damit die Seite nie veraltet.
3. **Komponenten-Katalog** „Handbuch/Komponenten“: jede Komponente mit Zweck, umgesetzten Regeln
   und Pfad. Ein Test stellt sicher, dass jede Komponenten-Datei im Katalog steht.
4. **Ein Dialog-Baustein**: `molecules/Dialog` neu geschrieben (Fokus-Falle, Escape, Fokus zurück,
   Scroll-Sperre, Beschriftung, `role="dialog" | "alertdialog"`), ohne framer-motion;
   `ConfirmDialog` baut darauf auf.
5. **Aufräumen**: Lint auf 0 Fehler, README auf den heutigen Stand (Deutsch), Startseite `app/page.tsx`
   mit allen Bereichen, `lang="de"`, Geist-Schrift auch in Storybook.

## Nicht-Ziele

- Toast/Meldungen vereinheitlichen – gehört zu Teil 8 (Speichern & Rückmeldung).
- Neue Eingabe-Bausteine – Teil 6.
- Eigene Stories für jede Komponente. Der Katalog verweist auf die Regel-Seiten, die sie zeigen.
- Ein neues Farbschema. Die bestehenden Werte bleiben, sie werden nur benannt und erklärt.

## Anti-Ziele

- Eine Token-Seite, deren Werte von Hand abgeschrieben sind und auseinanderlaufen.
- Regeln, die Geschmack sind („modern wirken“) statt beobachtbarem Verhalten.
- Ein Katalog, der beim nächsten Teil vergessen wird (darum der Test).

## Regeln

### Farbe & Fläche
- **G-01 Farbe trägt Bedeutung, sonst nichts.** Grau für alles; Akzent nur für die Hauptaktion,
  Auswahl und Links; Rot, Orange, Grün nur für Fehler/Gefahr, Warnung, Erfolg. Bedeutung nie nur
  über Farbe (verweist auf L-03, S-01).
- **G-02 Drei Ebenen und Schatten nur für Schwebendes.** `surface-sunken` (Hintergrund, Ablage),
  `surface` (Inhalt), `surface-raised` (Menüs, Dialoge). Schatten nur für das, was über anderem schwebt.
  Linien statt Schatten für Gliederung.
- **G-03 Hell und dunkel sind gleichwertig.** Jedes Token hat beide Werte; Text erreicht in beiden
  4.5:1. Kein „Dunkel als Nachgedanke“: Bilder einer Kamera bleiben schwarz, Papier bleibt weiss.

### Grösse & Raum
- **G-04 Wenige Schriftstufen mit festen Rollen.** 12 Metadaten, 13 Bedienelemente (kompakt),
  14 Fliesstext, 16 Abschnittstitel, 20 Seitentitel; grösser nur in der Werkstatt. Hierarchie über
  Gewicht und Farbe (`fg`, `fg-muted`, `fg-subtle`), nicht über immer neue Grössen. Keine Grösse unter 12 px.
- **G-05 Abstände aus einem 4-px-Raster.** 4/8/12/16/24/32. Zusammengehöriges enger als Getrenntes.
- **G-06 Zwei Dichten, eine Komponente.** Kompakt am Schreibtisch (Bedienelement 32 px),
  komfortabel für Tablet und Werkstatt (44 px). Die Dichte wird am Wurzelelement gesetzt,
  Komponenten lesen sie über Tokens; keine zweite Komponente „für Touch“.

### Bedienung
- **G-07 Der Fokus ist immer sichtbar.** Ring in `focus`, 2 px, nur bei Tastatur (`:focus-visible`).
  Nie `outline: none` ohne Ersatz. Reihenfolge folgt dem Lesefluss.
- **G-08 Bewegung erklärt, sie schmückt nicht.** Kurz (120–200 ms), nur für Herkunft und Zustand
  (Menü öffnet aus dem Knopf, Zeile wird eingefügt). Bei „Bewegung reduzieren“ ohne Bewegung.
- **G-09 Icons begleiten Text.** Ein Icon allein nur bei allgemein bekannten Zeichen (Schliessen,
  Suche) und dann mit Beschriftung für Screenreader und Tooltip. Gleiches Icon, gleiche Bedeutung.

### Sprache
- **G-10 Gleiche Wörter für gleiche Dinge.** Knöpfe sagen mit einem Verb, was passiert („Speichern“,
  „Auftrag anlegen“), dasselbe Wort in Knopf, Meldung und Verlauf. Schweizer Schreibweise (ss),
  Satzschreibung, keine Entwickler-Wörter (ID, null, Error 422). Eine Begriffsliste auf der Seite.

## Bausteine

- `handbook/foundations/tokens.ts`: Liste der Tokens `{ name, role, group }` (Gruppen: Fläche, Text,
  Linie, Bedeutung, Radius, Dichte, Bewegung). Die Werte kommen per `getComputedStyle` aus dem DOM.
- `handbook/foundations/TokenTable.tsx`: zeigt eine Gruppe; Farb-Muster in hell und dunkel nebeneinander
  (zwei Kästen, einer mit Klasse `dark`), Wert als Mono-Text, Rolle als Satz.
- Neue Tokens: `--dur-fast: 120ms`, `--dur-base: 200ms`, `--ease-out: cubic-bezier(0.2, 0, 0, 1)`,
  `--shadow-overlay` (hell: `0 8px 24px rgb(0 0 0 / 0.12), 0 0 0 1px var(--line)`; dunkel stärker).
  Tailwind-Utilities: `shadow-overlay`, `duration-fast`, `duration-base`, `ease-out-soft`.
- `handbook/catalog.ts`: `{ name, path, purpose, rules: string[] }[]`; `handbook/Catalog.tsx` zeigt sie
  gruppiert nach Ordner; Test: jede `.tsx`-Datei unter `components/` (ausser stories/test/examples/
  providers) steht genau einmal im Katalog, jede Regel-ID existiert in einem `*_RULE_GROUPS`.
- `Dialog` (neu): `Dialog({ open, onClose, title, description?, role = "dialog", initialFocus?, children, footer?, size = "md" })`.
  Escape und Klick auf den Hintergrund schliessen (`onClose`), Tab bleibt im Dialog, Fokus geht
  beim Schliessen zurück, `body` scrollt nicht. Schliessen-Knopf mit `aria-label="Schliessen"`.
  `ConfirmDialog` nutzt `Dialog` mit `role="alertdialog"` und `initialFocus` = Abbrechen; sein Verhalten
  und seine Tests bleiben gleich.
- Token-Guard erweitert: keine willkürlichen Schriftgrössen (`text-[…px]`) in `components/`,
  kein `shadow-2xl`.

## Aufräumen

- Lint: `.storybook/preview.ts` (Decorator als Komponente), `Dialog.stories`/`Select.stories`
  (Render-Funktionen als Komponenten), `Card.stories`/`Tabs.stories` (Apostroph).
- `GlobalSearch` `text-[10px]` → `text-xs`.
- `ActionMenu` Einträge: sichtbarer Fokus (`focus-visible:ring`) statt nur Hintergrund (G-07). Der
  Hintergrund bleibt für die aktive Zeile.
- README: Deutsch, Aufbau (Handbuch, Komponenten, Tokens), Befehle, Übertragen nach Nova.
- `app/page.tsx`: alle Bereiche als „verfügbar“, `app/layout.tsx` `lang="de"`, Beschreibung.
- Storybook: `@fontsource-variable/geist` und `-mono` laden, `--font-geist-sans/mono` setzen.

## Was bleibt dem Bauenden

Gestaltung der Token- und Katalog-Seite im Stil der Regel-Übersicht (ruhig, dicht, Linear-artig).
