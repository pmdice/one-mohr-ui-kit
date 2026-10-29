# Grundlagen (Teil 0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grundlagen-Regeln G-01–G-10 mit Token-Seite und Komponenten-Katalog, ein gemeinsamer Dialog-Baustein, Lint/README/Schrift aufgeräumt.

**Architecture:** Neue Tokens in `app/tokens.css` + Utilities in `globals.css`. Handbuch unter `handbook/foundations/`, Katalog unter `handbook/catalog.ts`. `molecules/Dialog` neu, `status/ConfirmDialog` darauf.

**Tech Stack:** wie Teil 1–5.

**Spec:** `docs/superpowers/specs/2026-10-29-foundations-design.md`

## Global Constraints

- Nur Tokens aus `app/tokens.css`; Guard-Test gilt.
- Regeltexte Deutsch (Schweizer Schreibweise), Code Englisch.
- Tests: `npx vitest run`; Lint: `npx eslint .` → 0 Fehler am Ende.

## Review Focus

1. **Dialog verschachtelt:** Escape im ConfirmDialog, der über einem Dialog liegt, schliesst nur den obersten. → Test Task 2.
2. **Fokus zurück, wenn der Auslöser verschwunden ist:** kein Fehler, Fokus fällt auf `body`. → Test Task 2.
3. **Scroll-Sperre bei zwei offenen Dialogen:** Schliessen des oberen gibt den Scroll nicht frei. → Test Task 2.
4. **Token-Seite ohne DOM-Wert:** fehlende Variable zeigt „—“ statt leer. → Test Task 3.
5. **Katalog verweist auf nicht existierende Regel-ID.** → Test Task 4.

---

### Task 1: Tokens, Guard, Fokus

**Files:** `app/tokens.css`, `app/globals.css`, `lib/tokens.guard.test.ts`, `components/nav/GlobalSearch.tsx`, `components/table/ActionMenu.tsx` (+ test)

- [ ] Guard-Test erweitern: `ARBITRARY_TEXT = /\btext-\[\d+(?:\.\d+)?(?:px|rem)\]/`, `SHADOW_2XL = /\bshadow-2xl\b/`; Test „lib/tokens.css defines motion and overlay tokens“ prüft `--dur-fast`, `--dur-base`, `--ease-out`, `--shadow-overlay` in `:root` und `--shadow-overlay` in `.dark`. Laufen → FAIL (GlobalSearch, fehlende Tokens).
- [ ] Tokens + Utilities (`shadow-overlay`, `duration-fast`, `duration-base`, `ease-out-soft`) ergänzen; GlobalSearch `text-xs`.
- [ ] ActionMenu-Test: Eintrag hat `focus-visible:ring-2` in der Klasse → FAIL, dann ergänzen.
- [ ] Laufen → PASS, Commit.

### Task 2: Dialog

**Files:** `components/molecules/Dialog/Dialog.tsx` (+ `Dialog.test.tsx`, Stories), `components/status/ConfirmDialog.tsx`

- `Dialog({ open, onClose, title, description?, role?: "dialog" | "alertdialog", initialFocus?: React.RefObject<HTMLElement | null>, footer?: React.ReactNode, size?: "sm" | "md" | "lg", closeLabel = "Schliessen", hideClose?, children? })`
- Verhalten: Portal in `body`; Beschriftung über `aria-labelledby`/`aria-describedby`; Fokus beim Öffnen auf `initialFocus` sonst erstes fokussierbares Element im Inhalt sonst Panel; Tab-Falle; Escape → `onClose` nur im obersten Dialog (Stapel auf Modulebene); Klick auf Hintergrund → `onClose`; Scroll-Sperre per Zähler; beim Schliessen Fokus zurück, wenn das Element noch im DOM ist.
- Tests: Rolle + Name; Fokus auf initialFocus; Tab-Falle vorwärts/rückwärts; Escape schliesst; verschachtelt schliesst nur oben (RF 1); Fokus zurück; Auslöser entfernt → kein Fehler (RF 2); Scroll-Sperre mit zwei Dialogen (RF 3); Hintergrund-Klick.
- ConfirmDialog auf Dialog umbauen; bestehende ConfirmDialog-Tests bleiben unverändert grün.
- Stories: Render-Funktionen als benannte Komponenten (Lint).

### Task 3: Handbuch Grundlagen

**Files:** `handbook/foundations/{tokens.ts, TokenTable.tsx, TokenTable.test.tsx, rules.ts, examples.tsx, Uebersicht.mdx, Tokens.mdx, G-01…G-10.mdx}`, `handbook/rules.test.ts`, `handbook/Einleitung.mdx`

- `tokens.ts`: `TOKEN_GROUPS: { title, description, kind: "color" | "length" | "shadow" | "motion", tokens: { name, role }[] }[]` über alle Variablen aus `tokens.css`.
- `TokenTable({ group })`: Zeilen Name (Mono), Rolle, Muster/Wert. Farben: zwei Muster (hell, dunkel) über Wrapper mit/ohne `.dark`, Wert via `getComputedStyle(el).getPropertyValue(name).trim()` im Effekt; leer → „—“ (RF 4).
- `rules.ts` `FOUNDATION_RULE_GROUPS`, docsId `handbuch-grundlagen-g-…`; Test `expected('G', 10)`.
- Beispiele Gut/Schlecht je Regel; MDX wie W-04.
- Einleitung: Bereich Grundlagen, ID-Liste ergänzt.

### Task 4: Komponenten-Katalog

**Files:** `handbook/catalog.ts`, `handbook/catalog.test.ts`, `handbook/Catalog.tsx`, `handbook/Komponenten.mdx`

- `CATALOG: { name, path, purpose, rules: string[] }[]`.
- Tests: jede Komponenten-Datei (`components/**/*.tsx` ohne stories/test, ohne `examples/`, `providers/`) genau einmal (`path`); jede Regel-ID existiert (RF 5); `purpose` endet mit Punkt.
- `Catalog`: gruppiert nach erstem Ordner, Regel-IDs als Links (`docsHref`).

### Task 5: Aufräumen

**Files:** `.storybook/preview.ts`, `.storybook/fonts.css`, Stories mit Lint-Fehlern, `README.md`, `app/page.tsx`, `app/layout.tsx`, `package.json`

- `@fontsource-variable/geist`, `@fontsource-variable/geist-mono` als devDependency; `fonts.css` setzt `--font-geist-sans: "Geist Variable", system-ui, sans-serif` und Mono.
- `npx eslint .` → 0 Fehler; `npx vitest run` grün; `npm run build-storybook` OK.
