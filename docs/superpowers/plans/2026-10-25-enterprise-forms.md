# Firmensoftware-Formulare (Teil 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das UI Kit bekommt semantische Tokens mit zwei Dichten, einen regelkonformen Formular-Baukasten (Pflicht/optional, Fehler-Timing, Abschnitte, Positionen mit stabilen Nummern, Unterzeilen, bedingte Felder, Fehlerzusammenfassung) und die Regeln F-01–F-12 als Storybook-Seiten.

**Architecture:** Tokens als CSS-Variablen in `app/tokens.css`, von Tailwind über `@theme` gelesen; Dichte per `data-density` auf einem Vorfahren. Formularzustand über `react-hook-form` + `zod`; ein `RequiredRegistry`-Context lässt sichtbare Pflichtfelder sich bei ihrem Block an-/abmelden, daraus entstehen Blockzähler und Zusammenfassung. Regeln liegen als MDX unter `handbook/forms/`.

**Tech Stack:** Next 16, React 19, Tailwind 4, CVA, Framer Motion, Storybook 10, Vitest 4 + Testing Library, react-hook-form, @hookform/resolvers, zod.

**Spec:** `docs/superpowers/specs/2026-10-25-enterprise-forms-design.md`

## Global Constraints

- Komponenten verwenden keine rohen Tailwind-Palettenfarben (`red-500`, `slate-400`, `blue-600`, `neutral-300` …) und kein `rounded-full` auf Eingabe-/Aktionselementen; nur semantische Tokens.
- Hell- und Dunkelmodus funktionieren (Klasse `.dark`, bestehender ThemeToggle).
- Zwei Dichten: `data-density="compact"` (Default) und `data-density="comfortable"`.
- Regeltexte auf Deutsch; Code, Props, Kommentare auf Englisch.
- Jede Regel hat ID (`F-01`…`F-12`) und das Format Regel / Warum / Gut–Schlecht / Übertragen.
- Animationen respektieren `prefers-reduced-motion` (`useReducedMotion`, wie im bestehenden Code).
- Beispielinhalte allgemein halten („Position“, „Material“, „Bestehende Vorlage“) – nicht Casting-Manager-spezifisch.
- Speichern-Button wird nie wegen fehlender Pflichtfelder deaktiviert.
- Positionsnummern sind stabil: keine Nachnummerierung, neue = höchste je vergebene + 1, Duplikat = neue Nummer, Rückgängig stellt die alte Nummer wieder her.

## Review Focus

1. **Veraltete Antworten der Async-Combobox:** Schnelles Tippen „Al“→„AlSi“ – trifft die Antwort für „Al“ später ein, darf sie die Treffer für „AlSi“ nicht überschreiben. → Test in Task 5.
2. **Fokus nach Entfernen eines Blocks:** Liegt der Fokus im entfernten Block, landet er auf dem „Rückgängig“-Knopf, nicht auf `<body>`. → Test in Task 8.
3. **Schweizer Zahleneingabe bei Menge:** „1'000“, „1 000“, „12,5“ – Menge ist ganzzahlig; Tausendertrenner `'` und Leerzeichen werden akzeptiert, Dezimalzahl ergibt „Menge muss eine ganze Zahl sein“. → Test in Task 10.
4. **Doppeltes Absenden:** Zweimal schnell ⌘/Ctrl+Enter bzw. Klick während `onSubmit` läuft ruft `onSubmit` nur einmal auf (Button zeigt „Speichert…“ und `aria-busy`). → Test in Task 6.
5. **Lange Werte in der Blockkopf-Zusammenfassung:** Ein 120-Zeichen-Materialname bricht das Kopflayout nicht; Zusammenfassung wird mit Ellipse gekürzt, voller Text im `title`. → Test in Task 8.

---

## File Structure

```
app/tokens.css                         Tokens (Farben, Radien, Dichte), hell + dunkel
app/globals.css                        importiert tokens.css, @theme-Mapping
components/atoms/Input|Textarea|Label  auf Tokens + Dichte
components/atoms/Button                auf Tokens + Dichte
components/molecules/Select            Tastatur-Fix
components/molecules/Combobox/         neu: sync + async Combobox
components/forms/                      neu: Formular-Baukasten
  Form.tsx                             <Form>, useEnterpriseForm, Submit-Kürzel, Doppel-Submit-Schutz
  FormField.tsx                        (verschoben aus molecules) Label, Marker, Hinweis, Fehler, aria
  FormSection.tsx                      Abschnitt + Marker-Konvention-Context
  FormErrorSummary.tsx                 Zusammenfassung + Sprunglinks
  RequiredRegistry.tsx                 Context: sichtbare Pflichtfelder pro Block
  ConditionalField.tsx                 bedingtes Ein-/Ausblenden
  RepeatableGroup.tsx                  Blockliste, stabile Nummern, Rückgängig
  GroupBlock.tsx                       Block mit Kopf (Nummer, Zusammenfassung, Zähler, Aktionen)
  SubRows.tsx                          Unterzeilen mit Führungslinie
  numbering.ts                         reine Nummern-Logik
  useUnsavedChanges.ts                 F-12 Warnung
  examples/OrderForm.tsx               Beispiel „Auftrag erfassen“ + Schema
handbook/forms/*.mdx                   Regelseiten F-01…F-12 + Übersicht
lib/tokens.guard.test.ts               verbietet rohe Farben / rounded-full in components/
```

`components/molecules/FormField/` wird nach `components/forms/` verschoben; alter Pfad entfällt (einziger Nutzer ist `app/page.tsx`).

---

### Task 1: Test-Runner reparieren, Abhängigkeiten

`npx vitest run` scheitert aktuell mit `ERR_REQUIRE_ESM` (jsdom 27 braucht `require(esm)`, Node ist 20.18).

**Files:**
- Rename: `vitest.config.ts` → `vitest.config.mts`
- Modify: `vitest.config.mts` (environment), `package.json`

- [ ] **Step 1:** `git mv vitest.config.ts vitest.config.mts`
- [ ] **Step 2:** `npm i -D happy-dom` und in `vitest.config.mts` `environment: 'happy-dom'` setzen. (Alternative nur falls happy-dom eine bestehende Suite bricht: Node ≥ 22 voraussetzen und `.nvmrc` mit `22` anlegen – dann im Commit erwähnen.)
- [ ] **Step 3:** `npm i react-hook-form @hookform/resolvers zod` (zod explizit als Dependency, aktuell nur transitiv vorhanden).
- [ ] **Step 4:** Run: `npx vitest run` — Expected: bestehende Suiten (Button, SearchInput, Navbar) PASS.
- [ ] **Step 5:** Commit `chore: fix vitest under node 20, add form dependencies`

---

### Task 2: Tokens, Dichte, Guard-Test, Basis-Atome

**Files:**
- Create: `app/tokens.css`, `lib/tokens.guard.test.ts`
- Modify: `app/globals.css`, `components/atoms/{Input,Textarea,Label,Button}/*.tsx`, `.storybook/preview.ts`
- Test: `components/atoms/Input/Input.test.tsx`

**Interfaces:**
- Produces: Tailwind-Utilities aus Tokens: `bg-surface`, `bg-surface-sunken`, `bg-surface-raised`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `border-border`, `border-border-strong`, `ring-focus`, `text-danger`/`bg-danger`/`border-danger`, `bg-danger-subtle`, `text-warning`, `text-success`, `bg-accent`/`text-accent-fg`, `rounded-control` (Eingabe/Button), `rounded-panel` (Karten/Blöcke); Dichte-Variablen `--control-h`, `--control-px`, `--control-text`, `--stack-gap`, die `h-control`, `px-control`, `text-control` als `@theme`-Werte bereitstellen.
- Bestehende Variablen `--background`, `--foreground`, `--border`, `--ring`, `--muted`, `--muted-foreground` bleiben als Aliase, damit nichts bricht.

- [ ] **Step 1: Guard-Test schreiben** `lib/tokens.guard.test.ts`: liest rekursiv alle `.tsx` unter `components/` (ohne `*.stories.tsx`, `*.test.tsx`) und erwartet für jede Datei aus einer Liste `GUARDED` keine Treffer für `/\b(?:bg|text|border|ring|fill|stroke|from|to|via|placeholder|divide|outline)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/` und `/\brounded-full\b/`. Testname je Datei: `"<path> uses only semantic tokens"`. `GUARDED` in diesem Task: Input, Textarea, Label, Button. (Ausnahme `rounded-full` zulässig für reine Indikatoren wie Punkte/Avatare: Zeile mit Kommentar `// token-guard: allow` wird ignoriert.)
- [ ] **Step 2:** Run `npx vitest run lib/tokens.guard.test.ts` — Expected: FAIL für alle vier.
- [ ] **Step 3: `app/tokens.css`** anlegen: neutrale, ruhige Palette (Linear/WMS-Richtung; Werte frei), eine Akzentfarbe, Danger/Warning/Success, je hell (`:root`) und dunkel (`.dark`). Dichte:
  - `:root, [data-density="compact"]`: `--control-h: 2rem; --control-px: 0.625rem; --control-text: 0.8125rem; --stack-gap: 0.75rem`
  - `[data-density="comfortable"]`: `--control-h: 2.75rem; --control-px: 0.875rem; --control-text: 0.9375rem; --stack-gap: 1.25rem`
  - `--radius-control: 6px; --radius-panel: 8px`
  `globals.css` importiert `tokens.css` und mappt alles in `@theme inline`.
- [ ] **Step 4:** Input, Textarea, Label, Button auf Tokens umstellen; Input/Textarea/Button-`default` nutzen `h-control px-control text-control rounded-control`; `active:scale` und `shadow-md` aus Button entfernen (ruhig). Button bekommt Prop `busy?: boolean` → `aria-busy="true"`, zeigt Spinner-Icon links, verhindert `onClick` (nicht `disabled`).
- [ ] **Step 5: Test** `Input.test.tsx` › `"takes control height from density token"`: rendert Input in `<div data-density="comfortable">`, erwartet `className` enthält `h-control`. › `"marks invalid"`: `error` → `aria-invalid="true"`. Zusätzlich in `Button.test.tsx` › `"busy button ignores clicks but stays enabled"`: `onClick` 0× aufgerufen, `not.toBeDisabled()`, `aria-busy="true"`.
- [ ] **Step 6:** `.storybook/preview.ts`: globale Toolbar „Dichte“ (compact/comfortable) und Decorator, der Story in `<div data-density=…>` wickelt; `globals.css` importieren falls noch nicht.
- [ ] **Step 7:** Run `npx vitest run` — Expected: alles PASS.
- [ ] **Step 8:** Commit `feat(tokens): semantic tokens with two densities; migrate base atoms`

---

### Task 3: Restliche Komponenten migrieren, Website-Teile entfernen

**Files:**
- Modify: Badge, Card, Tabs, Accordion, Toast, Dialog, Tooltip, SearchInput, ThemeToggle, Navbar, `app/page.tsx`, `README.md`, `lib/tokens.guard.test.ts`
- Delete: `components/organisms/Hero/`, `components/atoms/FadeIn/`

- [ ] **Step 1:** In `tokens.guard.test.ts` `GUARDED` auf *alle* `.tsx` unter `components/` umstellen. Run — Expected: FAIL für die oben gelisteten Dateien.
- [ ] **Step 2:** Farben/Radien jeder Datei 1:1 auf Tokens umstellen – kein Redesign, kein Verhaltenswechsel. Navbar nur Farben.
- [ ] **Step 3:** Hero und FadeIn löschen; `app/page.tsx` auf eine schlichte Startseite reduzieren: Titel „One Mohr UI Kit“, ein Satz „Handbuch für Firmensoftware“, Link zu Storybook (`http://localhost:6006`), Liste der Regelbereiche (vorerst nur „Formulare“). README-Einleitung entsprechend auf die neue Richtung anpassen (2–4 Sätze, Verweis auf Spec).
- [ ] **Step 4:** Run `npx vitest run && npm run build` — Expected: PASS, Build ohne Fehler.
- [ ] **Step 5:** Commit `refactor: migrate all components to tokens; remove website-only pieces`

---

### Task 4: FormField, FormSection, Marker-Konvention (F-01, F-02-Darstellung, F-03, F-05)

**Files:**
- Create: `components/forms/FormField.tsx`, `components/forms/FormSection.tsx`, `components/forms/FormField.test.tsx`
- Delete: `components/molecules/FormField/` (Story nach `components/forms/FormField.stories.tsx` verschieben und anpassen)
- Modify: `components/atoms/Label/Label.tsx`

**Interfaces:**
- Produces:
  - `type MarkerConvention = "required" | "optional"`
  - `FormSection({ title, description?, markers = "required", children, id? })` – rendert `<section aria-labelledby>` mit `<h2>`; stellt `MarkerConvention` per Context bereit.
  - `useMarkerConvention(): MarkerConvention` (Default ohne Section: `"required"`)
  - `FormField({ label, required?, hint?, error?, name?, children, className? })` – genau ein Kind-Element; klont es mit `id` (`useId`), `aria-describedby` (Hinweis/Fehler-IDs), `aria-invalid` (bei `error`), `aria-required` (bei `required`). Fehler ersetzt Hinweis, `role="alert"` bleibt.
  - `Label({ marker?: "required" | "optional" | null })` statt `required`: `"required"` → `*` sichtbar + `<span class="sr-only">(Pflicht)</span>`; `"optional"` → `(optional)` in `text-fg-subtle`.

- [ ] **Step 1: Tests** in `FormField.test.tsx`:
  - `"marks required fields in a required-convention section"`: Section `markers="required"`, Feld `required` → Text `*` sichtbar, kein `(optional)`; Feld ohne `required` → keins von beiden.
  - `"marks optional fields in an optional-convention section"`: Section `markers="optional"`, Feld ohne `required` → `(optional)` sichtbar; Feld mit `required` → kein `*`.
  - `"wires aria attributes onto the control"`: `getByLabelText("Menge")` hat `aria-required="true"`, `aria-describedby` zeigt auf Element mit Hinweistext.
  - `"error replaces hint and marks control invalid"`: `error="Menge muss mindestens 1 sein"` → Text sichtbar mit `role="alert"`, Hinweis weg, `aria-invalid="true"`.
- [ ] **Step 2:** Run `npx vitest run components/forms` — Expected: FAIL (Module fehlen).
- [ ] **Step 3:** Implementieren wie in Interfaces. `FormSection`-Abstände aus `--stack-gap`.
- [ ] **Step 4:** `app/page.tsx`-Import (falls noch genutzt) anpassen. Run `npx vitest run` — Expected: PASS.
- [ ] **Step 5:** Commit `feat(forms): FormField and FormSection with per-section marker convention`

---

### Task 5: Select-Tastatur-Fix und Combobox (F-11)

**Files:**
- Modify: `components/molecules/Select/Select.tsx`
- Create: `components/molecules/Select/Select.test.tsx`, `components/molecules/Combobox/{Combobox.tsx,Combobox.test.tsx,Combobox.stories.tsx}`

**Interfaces:**
- Produces:
  - `Select` behält Props, ergänzt `id?`, `aria-*`-Durchreichung, `onBlur?`, `name?` (damit `FormField` und react-hook-form `Controller` funktionieren); Trigger ist das klonbare Element.
  - `ComboboxOption = { value: string; label: string; description?: string }`
  - `Combobox({ value?: string | null, onChange(value: string | null), onBlur?, options?: ComboboxOption[], loadOptions?: (query: string, signal: AbortSignal) => Promise<ComboboxOption[]>, placeholder?, emptyText = "Keine Treffer", id?, name?, "aria-*"? })` – genau eins von `options`/`loadOptions`. ARIA-1.2-Combobox-Muster (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, Liste `role="listbox"`). Debounce 250 ms für `loadOptions`; Ladezustand als Zeile „Suche…“ mit `aria-busy` auf der Liste.

- [ ] **Step 1: Tests**
  - `Select.test.tsx` › `"arrow keys move highlight without changing value"`: offen, `ArrowDown` 2×, `onChange` 0× aufgerufen; `Enter` → `onChange` 1× mit der hervorgehobenen Option. › `"Escape closes and returns focus to trigger"`.
  - `Combobox.test.tsx` › `"filters static options by typed text"`. › `"calls loadOptions once after debounce"` (Fake-Timer: tippe „Al“, `advanceTimersByTime(249)` → 0 Aufrufe, `+1` → 1 Aufruf mit `"Al"`). › `"ignores stale responses"` (Review Focus 1): `loadOptions` für „Al“ löst nach 500 ms auf, für „AlSi“ nach 100 ms; nach beiden ist nur das „AlSi“-Ergebnis sichtbar und das vorherige `signal` war `aborted`. › `"shows empty text when no results"`.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implementieren. Veraltete Antworten über `AbortController` pro Anfrage + Vergleich der Anfrage-ID verwerfen.
- [ ] **Step 4:** Run `npx vitest run components/molecules` — Expected: PASS.
- [ ] **Step 5:** Commit `feat: keyboard-correct Select and sync/async Combobox`

---

### Task 6: Form-Kern – Fehler-Timing, Speichern, Zusammenfassung, Kürzel, ungespeicherte Änderungen (F-02, F-04, F-11, F-12)

**Files:**
- Create: `components/forms/{Form.tsx,FormErrorSummary.tsx,useUnsavedChanges.ts,Form.test.tsx}`

**Interfaces:**
- Consumes: `FormField` (Task 4), `Button` mit `busy` (Task 2).
- Produces:
  - `useEnterpriseForm<S extends z.ZodTypeAny>(schema: S, options: { defaultValues: z.input<S> }): UseFormReturn<z.input<S>, unknown, z.output<S>>` – ruft `useForm` mit `resolver: zodResolver(schema)`, `mode: "onTouched"`, `reValidateMode: "onChange"`, `shouldUnregister: false`, `shouldFocusError: false` (Fokus macht `Form` selbst, s. u.).
  - `type ErrorSummaryItem = { id: string; label: string; href: string }` (`href` = `#<element-id>`)
  - `Form<T>({ form, onSubmit(values): Promise<void> | void, summarize?(errors: FieldErrors): ErrorSummaryItem[], children, submitLabel = "Speichern" })` – rendert `<form noValidate>`, oben `FormErrorSummary` (nur nach fehlgeschlagenem Speichern), unten Speichern-Button. Verhalten:
    - Enter in einzeiligem `<input>` sendet nicht ab (`onKeyDown` am Form, `preventDefault` wenn Ziel `input` und nicht `type=submit`).
    - ⌘/Ctrl+Enter irgendwo im Formular → Submit.
    - Während `onSubmit` läuft: Button `busy`, weitere Submits ignoriert (Ref-Flag).
    - Nach fehlgeschlagener Validierung: Event `forms:reveal` auf dem `<form>` dispatchen (Blöcke klappen auf, Task 8), dann im nächsten Frame Fokus auf das erste fehlerhafte Feld in DOM-Reihenfolge (`[aria-invalid="true"]`). Die Zusammenfassung ist `role="alert"` und wird vorgelesen, bekommt aber nicht den Fokus.
    - Default-`summarize`: ein Eintrag pro fehlerhaftem Feld mit Label aus dem zugehörigen `<label for>`.
  - `FormErrorSummary({ title, items: ErrorSummaryItem[] })` – `role="alert"`, Titel z. B. „2 Positionen unvollständig: #2, #4“ (Titel kommt vom Aufrufer bzw. Default „N Felder brauchen Aufmerksamkeit“), Liste von Links; Klick fokussiert Ziel.
  - `useUnsavedChanges(isDirty: boolean, message = "Ungespeicherte Änderungen verwerfen?")` – registriert `beforeunload` solange `isDirty`. (In-App-Navigation ist Sache von Teil „Navigation“; im Kommentar vermerken.)

- [ ] **Step 1: Tests** `Form.test.tsx` mit Mini-Schema `{ name: z.string().min(1, "Name fehlt"), qty: z.coerce.number().int().min(1, "Menge muss mindestens 1 sein") }`:
  - `"does not show errors while typing for the first time"`: tippe in Name, lösche → kein `role=alert` am Feld.
  - `"shows error on blur"`: Name fokussieren, leer verlassen → „Name fehlt“.
  - `"clears error live once valid"`: nach Blur-Fehler 1 Zeichen tippen → Meldung weg ohne Blur.
  - `"enter in a text input does not submit"`: `onSubmit` 0×.
  - `"ctrl+enter submits"`: gültige Werte, `{Control>}{Enter}` → `onSubmit` 1×.
  - `"save focuses first invalid field and shows summary"`: beide leer, Klick Speichern → `document.activeElement` ist Name-Input, Zusammenfassung mit 2 Links.
  - `"save button is never disabled for missing fields"`: leeres Formular → Button `not.toBeDisabled()`.
  - `"double submit calls onSubmit once"` (Review Focus 4): `onSubmit` gibt Promise zurück, das 100 ms läuft; zweimal klicken → 1 Aufruf, Button `aria-busy="true"` währenddessen.
  - `"warns before unload when dirty"`: nach Eingabe dispatch `beforeunload` → `event.defaultPrevented === true`.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** Run `npx vitest run components/forms` — Expected: PASS.
- [ ] **Step 5:** Commit `feat(forms): Form core with error timing, summary, shortcuts, unsaved-changes guard`

---

### Task 7: RequiredRegistry und ConditionalField (F-10, Zähler-Grundlage)

**Files:**
- Create: `components/forms/{RequiredRegistry.tsx,ConditionalField.tsx,ConditionalField.test.tsx}`
- Modify: `components/forms/FormField.tsx` (registriert sich)

**Interfaces:**
- Produces:
  - `RequiredRegistryProvider({ children })` – hält eine Menge registrierter Feldnamen (RHF-Pfade). Verschachtelbar: ein inneres Registrieren meldet sich auch beim äusseren Provider an (damit Unterzeilen in den Blockzähler zählen).
  - `useRequiredFields(): string[]` – registrierte Namen des nächsten Providers (inkl. verschachtelter).
  - `useOpenRequiredCount(): number` – zählt registrierte Namen, deren aktueller Wert (`useWatch`) leer ist: `undefined`, `null`, `""` (nach `trim`), leeres Array.
  - `FormField` mit `required` und `name` registriert `name` beim Mount, abmeldet beim Unmount.
  - `ConditionalField({ when: boolean, children })` – rendert Kinder nur wenn `when`; Ein-/Ausblenden mit `AnimatePresence` (Höhe+Opacity, ≤150 ms, reduced-motion: keine Bewegung). Kinder werden bei `when=false` unmounted → Felder melden sich ab. Werte bleiben im Form-State (`shouldUnregister: false`).
  - Konvention für Schemas (dokumentiert in JSDoc von `ConditionalField`): bedingte Pflicht über `superRefine`; die Ausgabe-Transformation entfernt Werte inaktiver Felder (Beispiel in Task 10).

- [ ] **Step 1: Tests** `ConditionalField.test.tsx` mit kleinem Formular: Select „Typ“ (`neu` | `vorlage`), bedingtes Pflichtfeld „Bestehender Artikel“ (`when={typ === "vorlage"}`), Zähler-Anzeige über `useOpenRequiredCount` in einem Testkind:
  - `"hidden field is not in the DOM"`: Typ `neu` → `queryByLabelText("Bestehender Artikel")` null (nicht nur disabled).
  - `"appears when trigger value matches and counts as required"`: Typ wählen `vorlage` → Feld da, Zähler steigt um 1.
  - `"keeps value when toggled away and back"`: Wert „A-100“ eintragen, Typ `neu`, wieder `vorlage` → Feld zeigt „A-100“.
  - `"nested registry counts in parent"`: zwei verschachtelte Provider, Pflichtfeld im inneren leer → äusserer Zähler 1.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** Run — Expected: PASS.
- [ ] **Step 5:** Commit `feat(forms): required-field registry and ConditionalField`

---

### Task 8: RepeatableGroup, GroupBlock, stabile Nummern, Rückgängig (F-06, F-08, F-09)

**Files:**
- Create: `components/forms/{numbering.ts,numbering.test.ts,RepeatableGroup.tsx,GroupBlock.tsx,RepeatableGroup.test.tsx}`

**Interfaces:**
- Consumes: `RequiredRegistryProvider`, `useOpenRequiredCount` (Task 7); Event `forms:reveal` (Task 6).
- Produces:
  - `numbering.ts`: `nextNumber(maxEverAssigned: number): number` (= max+1); `initialMax(items: { no: number }[]): number`.
  - Datenkonvention: jedes Element im Feld-Array hat `no: number` (stabile Nummer) zusätzlich zu RHF-`id`.
  - `RepeatableGroup<T extends { no: number }>({ name, newItem(): Omit<T, "no">, addLabel, itemLabel = "Position", children: (args: { index: number; no: number; field: T }) => ReactNode, summarize(item: T): string })` – nutzt `useFieldArray`. Hält `maxEver` in `useRef(initialMax(fields))`. Hinzufügen: `append({ ...newItem(), no: nextNumber(maxEver) })`, Block aufgeklappt, Fokus erstes Feld des neuen Blocks. Entfernen: Element aus Array, an seiner Stelle Platzhalter „Position #N entfernt · Rückgängig“ für 8 s; Rückgängig → `insert(originalIndex, removedItem)` mit **derselben** `no`; Platzhalter verschwindet auch beim nächsten Hinzufügen/Entfernen. Duplizieren: Kopie mit `nextNumber`. Kopfleiste: „Alle einklappen“ / „Alle aufklappen“.
  - `GroupBlock({ no, label, summary, openCount, hasError, expanded, onToggle, onRemove, onDuplicate, children })` – Kopf: `#no`, Zusammenfassung (eine Zeile, `truncate`, `title=summary`), Status: `openCount>0` → „N Pflichtfelder offen“ (neutral, `text-fg-muted`), sonst `hasError` → „Fehler“ (`text-danger`), sonst „vollständig“. Gesamter Block in eigenem `RequiredRegistryProvider`. Eingeklappt bleiben Kinder gemountet (verborgen per `hidden`), damit Registrierung und Zähler stimmen. Unvollständige Blöcke starten offen, vollständige eingeklappt. Hört auf `forms:reveal` und klappt auf, wenn `openCount>0 || hasError`. Kopf-Element bekommt `id="<name>-<no>"` für Sprunglinks.

- [ ] **Step 1: Tests** `numbering.test.ts`: `nextNumber(4) === 5`; `initialMax([{no:1},{no:3}]) === 3`; `initialMax([]) === 0`.
  `RepeatableGroup.test.tsx` (Formular mit Positionen `{ no, typ, material, qty }`, alle drei Pflicht):
  - `"numbers stay stable after removing a middle block"`: Startdaten #1,#2,#3 → #2 entfernen → Köpfe zeigen #1, #3.
  - `"new block takes highest ever number + 1 even after removing the last"`: #1,#2 → #2 entfernen → hinzufügen → neuer Kopf `#3`.
  - `"undo restores the same number at the same position"`: #1,#2,#3 → #2 entfernen → „Rückgängig“ → Reihenfolge #1,#2,#3.
  - `"duplicate gets a new number"`: #1,#2 → #1 duplizieren → `#3` mit gleichen Werten.
  - `"new block is expanded, focused, and shows open required count"`: hinzufügen → erstes Feld fokussiert, Kopf „3 Pflichtfelder offen“, keine Fehlermeldung sichtbar.
  - `"complete blocks start collapsed"`: Startdaten vollständig → Inhalt `hidden`, Kopf „vollständig“.
  - `"focus moves to undo when removing the focused block"` (Review Focus 2): Fokus in Feld von #2 → Entfernen-Knopf → `activeElement` ist „Rückgängig“.
  - `"long summary truncates and keeps full text in title"` (Review Focus 5): `summarize` gibt 120 Zeichen → Element hat Klasse `truncate` und `title` mit vollem Text.
  - `"failed save expands collapsed incomplete blocks"`: Block manuell einklappen, Feld leeren via `setValue`, Speichern → Block-Inhalt sichtbar.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** Run `npx vitest run components/forms` — Expected: PASS.
- [ ] **Step 5:** Commit `feat(forms): repeatable groups with stable numbering, undo, collapse`

---

### Task 9: SubRows (F-07)

**Files:**
- Create: `components/forms/{SubRows.tsx,SubRows.test.tsx}`

**Interfaces:**
- Consumes: `useFieldArray`, `RequiredRegistryProvider` des umgebenden `GroupBlock` (Task 8).
- Produces: `SubRows<T>({ name, newItem(): T, addLabel, rowLabel, children: (args: { index: number; field: T; remove(): void }) => ReactNode })` – Liste eingerückt, linke Führungslinie (`border-l border-border-strong`, Abstand aus Tokens), „+ {addLabel}“ am Ende der eigenen Liste; Unterzeilen haben laufende Anzeige (keine stabile Nummer nötig – Spec verlangt Stabilität nur für Positionen). Entfernen einer Unterzeile ohne Rückgängig, aber mit Fokus auf nächste Zeile oder den „+“-Knopf.

- [ ] **Step 1: Tests**
  - `"add button belongs to its own block"`: zwei Positionen, Klick „+ Zusatzleistung“ in #2 → nur #2 hat eine Unterzeile.
  - `"required field in a sub-row counts toward its block"`: Unterzeile mit leerem Pflichtfeld „Art“ → Kopf von #2 „1 Pflichtfeld offen“ (Singular!) bzw. Zahl +1, #1 unverändert.
  - `"removing a sub-row moves focus to the add button when it was the last"`.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implementieren. Singular/Plural im Kopf („1 Pflichtfeld offen“ / „N Pflichtfelder offen“) – falls in Task 8 noch nicht, hier in `GroupBlock` ergänzen.
- [ ] **Step 4:** Run — Expected: PASS.
- [ ] **Step 5:** Commit `feat(forms): SubRows attached to their parent block`

---

### Task 10: Beispiel „Auftrag erfassen“

**Files:**
- Create: `components/forms/examples/{orderSchema.ts,orderSchema.test.ts,OrderForm.tsx,OrderForm.stories.tsx,OrderForm.test.tsx,mockArticles.ts}`

**Interfaces:**
- Consumes: alles aus Tasks 4–9, `Combobox` mit `loadOptions` (Task 5).
- Produces: `orderSchema` (zod), `OrderForm({ defaultValues?, onSubmit })`.

Inhalt (Spec „Durchgehendes Beispiel“):
- Abschnitt **Kopfdaten** (`markers="optional"` wenn Mehrheit Pflicht – Umsetzer zählt): Kunde (Pflicht), Auftragsnummer (Pflicht), Liefertermin (Pflicht, Datum), Bemerkung (optional).
- Abschnitt **Positionen** (`markers="optional"`): `RepeatableGroup` mit Typ (`neu` „Neue Form“ | `vorlage` „Bestehende Vorlage“ | `reparatur` „Reparatur“), Material (Select, ~8 Einträge), Menge (Pflicht, ganzzahlig ≥ 1), Fotos (einfaches `<input type=file multiple>`, optional, keine Upload-Logik), Notiz (optional). `ConditionalField` Typ=`vorlage` → **Bestehender Artikel** (Pflicht, `Combobox` mit `loadOptions` über `mockArticles.ts`: 3000 generierte Artikel, 300–600 ms Verzögerung, Filter auf Nummer+Name). `SubRows` **Zusatzleistungen**: Art (Pflicht: `3d` „3D-Druck“ | `waerme` „Wärmebehandlung“ | `pruefung` „Prüfprotokoll“ | `andere` „Andere“), Bemerkung optional; `ConditionalField` Art=`3d` → **Dateinummer** (Pflicht).
- Zusammenfassung im Blockkopf: `"{Typ} · {Material} · {Menge} Stk"`, fehlende Teile weglassen.
- `summarize` für die Fehlerzusammenfassung: gruppiert nach Position → Titel „2 Positionen unvollständig: #2, #4“, Links auf `#positions-<no>` (Feld-Array heisst `positions`); Kopfdaten-Fehler als einzelne Einträge davor.
- Menge-Parsing: `'` und Leerzeichen als Tausendertrenner entfernen, dann ganzzahlig.
- Schema-Ausgabe entfernt `articleId` wenn Typ ≠ `vorlage` und `fileNo` wenn Art ≠ `3d`.
- Story „Auftrag erfassen“ mit Beispieldaten: 5 Positionen (eine unvollständig, eine mit Typ `vorlage` ohne Artikel, eine mit 4 Zusatzleistungen davon zwei 3D-Druck) – damit das Übersichtsproblem sichtbar ist; zweite Story „Leer“.

- [ ] **Step 1: Tests** `orderSchema.test.ts`:
  - `"requires article only for template type"`: `typ:"neu"` ohne `articleId` gültig; `typ:"vorlage"` ohne → Fehler am Pfad `positions.0.articleId`.
  - `"requires file number only for 3d print"`.
  - `"strips inactive conditional values from output"`: `typ:"neu", articleId:"A-1"` → Ausgabe ohne `articleId`.
  - `"parses swiss thousands separators"` (Review Focus 3): `"1'000"` → 1000, `"1 000"` → 1000; `"12,5"` → Fehler „Menge muss eine ganze Zahl sein“; `"0"` → „Menge muss mindestens 1 sein“.
  `OrderForm.test.tsx`:
  - `"summary groups incomplete positions by number"`: Beispieldaten mit #2 und #4 unvollständig → Speichern → Text „2 Positionen unvollständig: #2, #4“, Link auf #2 fokussiert den Kopf von #2.
  - `"valid order submits cleaned values"`: vollständige Daten → `onSubmit` 1× mit Werten ohne inaktive Felder.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** Run `npx vitest run` — Expected: PASS. Run `npm run storybook`, Story „Auftrag erfassen“ manuell in beiden Dichten und hell/dunkel ansehen; a11y-Panel ohne Verstösse.
- [ ] **Step 5:** Commit `feat(forms): order entry example exercising all form rules`

---

### Task 11: Regelseiten F-01–F-12 im Handbuch

**Files:**
- Create: `handbook/Einleitung.mdx`, `handbook/forms/Uebersicht.mdx`, `handbook/forms/F-01-pflicht-optional.mdx` … `F-12-ungespeicherte-aenderungen.mdx` (12 Dateien)
- Create: `handbook/RuleExample.tsx` (Gut/Schlecht-Rahmen: zwei Spalten, Kopf „Gut“ / „Schlecht“, stapelt unter 640 px)
- Modify: `.storybook/main.ts` (Glob `"../handbook/**/*.mdx"` ergänzen; `addon-onboarding` entfernen)

**Interfaces:**
- Consumes: Komponenten und `OrderForm` aus Tasks 4–10.

- [ ] **Step 1:** `RuleExample({ good: ReactNode, bad: ReactNode, caption? })` anlegen.
- [ ] **Step 2:** Pro Regel eine MDX-Seite, `<Meta title="Handbuch/Formulare/F-0X Titel" />`, Abschnitte exakt: **Regel** (ein Satz, Text aus Spec), **Warum** (Text aus Spec), **Gut / Schlecht** (`RuleExample` mit lebenden Komponenten; „Schlecht“ zeigt das Anti-Muster, z. B. Sternchen an jedem Feld, ausgegrautes statt ausgeblendetes bedingtes Feld, deaktivierter Speichern-Button, nachnummerierte Positionen), **Übertragen** (1–3 Stichpunkte, framework-neutral, z. B. „Marker-Konvention pro Abschnitt als Konfiguration ablegen, nicht pro Feld entscheiden“). F-06 nennt die stabile Nummerierung samt Begründung aus der Spec.
- [ ] **Step 3:** `Uebersicht.mdx`: Tabelle aller 12 Regeln (ID, Titel, ein Satz) mit Links; `Einleitung.mdx`: Zweck des Handbuchs (3–5 Sätze aus „Warum“ der Spec), Aufbau einer Regel, wie man auf Regel-IDs verweist.
- [ ] **Step 4:** Run `npm run build-storybook` — Expected: Build erfolgreich, Seiten unter „Handbuch/Formulare“ vorhanden.
- [ ] **Step 5:** Commit `docs(handbook): form rules F-01 to F-12 with live good/bad examples`

---

## Abschluss

- [ ] `npx vitest run && npm run lint && npm run build && npm run build-storybook` — alles grün.
- [ ] Branch-Review gemäss gewählter Ausführungsart.
