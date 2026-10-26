# Navigation & App-Rahmen (Teil 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Kit bekommt einen App-Rahmen nach den Regeln N-01–N-12 (Pfad nach Zugehörigkeit, Menü nach Herkunft, Zurück zur Liste mit Zustand, Blättern, Seitenkopf, globale Suche über alle Kennungen, Seiten-Tabs vs. Filter, gegliederte einklappbare Sidebar), eine klickbare Beispiel-App und die Regeln als Handbuch-Seiten.

**Architecture:** Neue Komponenten unter `components/nav/`. Links laufen über einen austauschbaren `LinkComponent`-Context (Standard `<a>`), damit kein Router fest eingebaut ist. Zugehörigkeit (`trail`) und Herkunft (`origin`) kommen als Daten von aussen. Die Beispiel-App unter `components/nav/examples/` hat einen eigenen kleinen Router im Speicher (Zustand = URL-ähnlicher String), in dem Herkunft und Listenzustand als Query-Parameter stehen.

**Tech Stack:** Next 16, React 19, Tailwind 4 (Tokens aus Teil 1), CVA, Framer Motion, lucide-react, Storybook 10, Vitest 4 + happy-dom + Testing Library + user-event.

**Spec:** `docs/superpowers/specs/2026-10-26-navigation-design.md`

## Global Constraints

- Nur semantische Tokens aus `app/tokens.css`; kein `rounded-full`, keine rohen Palettenfarben (der Guard-Test in `lib/tokens.guard.test.ts` gilt auch für `components/nav/`).
- Hell/Dunkel und beide Dichten (`data-density="compact|comfortable"`) funktionieren.
- Regeltexte Deutsch; Code, Props, Kommentare Englisch.
- Regel-IDs `N-01`…`N-12`, Seitenformat Regel / Warum / Details / Gut–Schlecht / Übertragen wie in Teil 1.
- Kein Router fest eingebaut; alle Ziele als `href`, gerendert über `NavLink`.
- Tastenkürzel (`/`, ⌘/Ctrl+K, `J`, `K`, `[`) wirken nie, solange der Fokus in `input`, `textarea`, `select`, `[contenteditable]` oder `[role="combobox"]` liegt, und nie mit gedrückter Alt-Taste.
- Aktuelle Seite in Pfad und Sidebar trägt `aria-current="page"`; Pfad und Sidebar sind `nav` mit `aria-label`.
- Animationen respektieren `prefers-reduced-motion`.
- Beispielinhalte allgemein („Laufzettel“, „Material“), nicht Casting-Manager-spezifisch.

## Review Focus

1. **Exakte Kennung vs. Präfix in der Suche:** „26100013“ ist die Kennung eines Auftrags und Präfix seiner Laufzettel. Der Auftrag steht zuoberst (exakter Treffer), die Laufzettel folgen; Enter öffnet den Auftrag. „26100013-2“ öffnet Laufzettel 2/4. → Test in Task 6.
2. **Kürzel in Eingabefeldern:** `J`/`K`/`[`/`/` beim Tippen in Listensuche, Combobox oder `contenteditable` lösen nichts aus. → Test in Task 1.
3. **Herkunft passt nicht mehr:** Laufzettel aus Ansicht „Offen“ geöffnet, Objekt ist nicht (mehr) in der übergebenen Menge → Blättern zeigt sich nicht, statt „0 von 17“ oder Sprung ins Leere. → Test in Task 3.
4. **Lange Namen im Pfad:** Ein 120-Zeichen-Kundenname verdrängt das letzte Glied nicht; mittlere Glieder werden mit Ellipse gekürzt, voller Text im `title`. → Test in Task 2.
5. **Eingeklappte Sidebar per Tastatur:** Im Icon-Modus erscheint der Name beim Fokus (Tooltip) und ist über `aria-label` vorlesbar; die Markierung bleibt sichtbar. → Test in Task 5.

---

## File Structure

```
components/nav/
  NavLink.tsx            LinkComponent-Context + <NavLink>
  shortcuts.ts           isEditableTarget, useShortcut
  identifier.ts          normalizeIdentifier, matchesIdentifier
  Breadcrumb.tsx         N-01
  PageTabs.tsx           N-11 (Links, Unterstrich)
  ViewFilter.tsx         N-11 (Segment mit Anzahl)
  RecordPager.tsx        N-04
  PageHeader.tsx         N-03, N-05
  Sidebar.tsx            N-02, N-09, N-10, N-12
  AppShell.tsx           Rahmen, Kopfzeile, Einklappen, Schublade
  GlobalSearch.tsx       N-06, N-07
  search.ts              searchRecords (rein)
  examples/
    data.ts              ~20 Aufträge, 1–5 Laufzettel je Auftrag, Kunden
    router.tsx           In-Memory-Router (location string, navigate, back)
    ExampleApp.tsx       klickbare App
    ExampleApp.stories.tsx
components/molecules/Tabs  Reiter-Optik
components/organisms/Navbar  entfernt
handbook/navigation/     N-01…N-12.mdx, Uebersicht.mdx, rules.ts, examples.tsx
handbook/Einleitung.mdx  Navigation als verfügbar
```

---

### Task 1: Grundlagen – NavLink, Kürzel, Kennungen

**Files:**
- Create: `components/nav/NavLink.tsx`, `components/nav/shortcuts.ts`, `components/nav/identifier.ts`
- Test: `components/nav/shortcuts.test.tsx`, `components/nav/identifier.test.ts`

**Interfaces:**
- Produces:
  - `type LinkComponent = React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>`
  - `LinkProvider({ component, children })`, `NavLink(props: AnchorHTMLAttributes & { href: string })` – rendert die Komponente aus dem Context, Standard `<a>`.
  - `isEditableTarget(target: EventTarget | null): boolean`
  - `useShortcut(key: string, handler: (e: KeyboardEvent) => void, options?: { mod?: boolean; enabled?: boolean })` – `mod` = ⌘ oder Ctrl muss gedrückt sein; ohne `mod` darf weder ⌘/Ctrl noch Alt gedrückt sein; ignoriert editierbare Ziele; Vergleich von `key` ohne Gross/Klein.
  - `normalizeIdentifier(raw: string): string` – trimmt, Kleinbuchstaben, ersetzt Folgen aus Leerzeichen/`–`/`—`/`-` durch ein `-`, entfernt `#`.
  - `matchesIdentifier(query: string, id: string, aliases?: string[]): "exact" | "prefix" | null`

- [ ] **Step 1: Failing tests**
  - `identifier.test.ts`: `normalizeIdentifier("26100013 – 1/4") === "26100013-1/4"`; gleiches Ergebnis für `"26100013-1/4"`, `"26100013 1/4"`, `" #26100013—1/4 "`; `matchesIdentifier("26100013-1", "26100013 – 1/4", ["26100013-1"]) === "exact"`; `matchesIdentifier("26100013", "26100013 – 1/4") === "prefix"`; `matchesIdentifier("2610", "26100013") === "prefix"`; `matchesIdentifier("999", "26100013") === null`.
  - `shortcuts.test.tsx`: Handler für `j` feuert bei Taste im Dokument; feuert nicht, wenn Fokus in `input`, `textarea`, `[contenteditable]`, `[role=combobox]`; feuert nicht mit Alt; `{ mod: true }` für `k` feuert bei `{Meta>}k` und `{Control>}k`, nicht bei `k` allein; `enabled: false` feuert nie.
  - `NavLink`: ohne Provider ein `<a href>`; mit Provider wird die Komponente verwendet (Test-Komponente mit `data-testid`).
- [ ] **Step 2:** `npx vitest run components/nav` → FAIL (Module fehlen).
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** `npx vitest run components/nav` → PASS.
- [ ] **Step 5:** Commit `feat(nav): link context, shortcut hook, identifier normalization`.

### Task 2: Breadcrumb und PageTabs, Tabs-Optik

**Files:**
- Create: `components/nav/Breadcrumb.tsx`, `components/nav/PageTabs.tsx`
- Modify: `components/molecules/Tabs/Tabs.tsx`, `Tabs.stories.tsx` (rohe Farben raus)
- Test: `components/nav/Breadcrumb.test.tsx`, `components/nav/PageTabs.test.tsx`

**Interfaces:**
- Consumes: `NavLink`.
- Produces:
  - `type Crumb = { label: string; href: string }`
  - `Breadcrumb({ trail }: { trail: Crumb[] })` – `<nav aria-label="Pfad"><ol>`; alle ausser dem letzten als `NavLink`, das letzte als `<span aria-current="page">`; Trenner `aria-hidden`; mittlere Glieder `truncate max-w-[16rem]` mit `title`, das letzte `truncate` mit `title` und `min-w-0` aber ohne max-w-Grenze kleiner als die mittleren.
  - `type PageTab = { label: string; href: string; count?: number }`
  - `PageTabs({ tabs, current }: { tabs: PageTab[]; current: string })` – `<nav aria-label="Seitenbereiche">` mit Links, aktiver Link `aria-current="page"` und Unterstrich (`border-b-2 border-accent`), übrige `text-fg-muted`.
- [ ] **Step 1: Failing tests**
  - Breadcrumb: 3 Glieder → 2 Links mit korrekten `href`, letztes ohne Link mit `aria-current="page"`; `nav` hat Namen „Pfad“; mittleres Glied mit 120 Zeichen hat `title` = voller Text und Klasse `truncate`; letztes Glied hat `title`.
  - PageTabs: `current="/a/1/zettel"` markiert genau diesen Tab mit `aria-current="page"`; Tabs sind Links (`role=link`), keine `role=tab`.
  - Tabs (bestehend): bleibt funktionsfähig (bestehende Nutzung per Klick wechselt Inhalt), aktiver Tab hat `aria-selected="true"` und `role="tab"`.
- [ ] **Step 2:** `npx vitest run components/nav components/molecules/Tabs` → FAIL.
- [ ] **Step 3:** Implementieren. `Tabs`: `role="tablist"`/`tab`/`tabpanel`, Reiter-Optik mit Unterstrich wie PageTabs (gemeinsame Klassen nicht abstrahieren, zwei Stellen reichen).
- [ ] **Step 4:** Tests → PASS; `npx vitest run lib` (Guard) → PASS.
- [ ] **Step 5:** Commit `feat(nav): breadcrumb by belonging, page tabs; tabs get underline style`.

### Task 3: ViewFilter und RecordPager

**Files:**
- Create: `components/nav/ViewFilter.tsx`, `components/nav/RecordPager.tsx`
- Test: `components/nav/ViewFilter.test.tsx`, `components/nav/RecordPager.test.tsx`

**Interfaces:**
- Consumes: `NavLink`, `useShortcut`.
- Produces:
  - `type View = { id: string; label: string; href: string; count?: number }`
  - `ViewFilter({ views, current, label }: { views: View[]; current: string; label: string })` – Gruppe `role="group"` `aria-label={label}`, Links mit `aria-current="true"` am aktiven, Anzahl als Zahl in eigenem `span`; Optik Segment (`bg-surface-sunken` Rahmen, aktives Segment `bg-surface` + Schatten) – deutlich anders als PageTabs.
  - `RecordPager({ ids, currentId, hrefFor, label, shortcuts = true })` – `ids: string[]`, `hrefFor(id) => string`, `label` z. B. „im Auftrag“ oder „· Offen“. Zeigt `{index+1}/{ids.length} {label}` und zwei Links „Vorheriges“/„Nächstes“ (Icon + `aria-label`); am Rand ist der jeweilige Link `aria-disabled` ohne `href`. Ist `currentId` nicht in `ids` oder `ids.length < 2`, rendert er nichts. `J`/`K` navigieren über `onNavigate?: (href) => void`; ohne `onNavigate` klickt der Pager programmatisch seinen Link.
- [ ] **Step 1: Failing tests**
  - ViewFilter: aktives Segment `aria-current="true"`, Anzahl sichtbar („Offen 14“), Gruppe hat Namen.
  - RecordPager: `ids=[a,b,c,d]`, `currentId=b` → Text „2/4 im Auftrag“, Vorheriges → `hrefFor(a)`, Nächstes → `hrefFor(c)`; bei `a` ist Vorheriges `aria-disabled="true"`; `currentId="x"` → rendert nichts (Review Focus 3); `ids=[a]` → nichts; Taste `j` ruft `onNavigate(hrefFor(c))`, `k` → `hrefFor(a)`; Taste `j` im Input ruft nichts.
- [ ] **Step 2:** FAIL. **Step 3:** Implementieren. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(nav): view filter segments and record pager with J/K`.

### Task 4: PageHeader

**Files:**
- Create: `components/nav/PageHeader.tsx`
- Test: `components/nav/PageHeader.test.tsx`

**Interfaces:**
- Consumes: `Breadcrumb`, `PageTabs`, `RecordPager` (als Knoten), `Button`, `Badge`, `NavLink`.
- Produces: `PageHeader({ trail, back, title, badges, primaryAction, moreActions, pager, tabs })`
  - `trail: Crumb[]` (Breadcrumb über dem Titel)
  - `back?: { label: string; href: string }` – „‹ {label}“ als Link über dem Titel, links neben dem Pfad
  - `title: string` – `<h1>`
  - `badges?: React.ReactNode`, `primaryAction?: React.ReactNode`, `moreActions?: React.ReactNode` (rechts, Reihenfolge: pager, more, primary)
  - `pager?: React.ReactNode`, `tabs?: { tabs: PageTab[]; current: string }`
- [ ] **Step 1: Failing tests:** genau eine `h1` mit `title`; letztes Pfad-Glied hat denselben Text wie `title` (Regel N-05: Fixture übergibt beides gleich – Test prüft, dass der Kopf beides rendert); `back` rendert Link mit Text „Offen · Aufträge“ und `href`; ohne `back` kein Zurück-Link; `tabs` rendert PageTabs-Navigation.
- [ ] **Step 2:** FAIL. **Step 3:** Implementieren. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(nav): page header with back-to-list, pager slot and tabs`.

### Task 5: Sidebar und AppShell, Navbar entfernen

**Files:**
- Create: `components/nav/Sidebar.tsx`, `components/nav/AppShell.tsx`
- Delete: `components/organisms/Navbar/` (Komponente, Story, Test)
- Test: `components/nav/Sidebar.test.tsx`, `components/nav/AppShell.test.tsx`

**Interfaces:**
- Consumes: `NavLink`, `Tooltip`, `useShortcut`.
- Produces:
  - `type NavEntry = { id: string; label: string; href: string; icon: LucideIcon; children?: NavEntry[] }`
  - `type NavGroup = { id: string; label?: string; entries: NavEntry[]; collapsible?: boolean }`
  - `Sidebar({ groups, activeId, collapsed })` – `<nav aria-label="Hauptmenü">`; Eintrag mit `id === activeId` hat `aria-current="page"` und Markierung; `children` eingerückt unter ihrem Eintrag; `collapsible`-Gruppe ist ein Button mit `aria-expanded`, standardmässig zu, **offen, wenn `activeId` in der Gruppe liegt**; `collapsed` → nur Icons, jeder Link hat `aria-label={label}` und `Tooltip` (side right), Gruppen-Überschriften werden zu Abständen.
  - `AppShell({ logo, groups, activeId, search, headerEnd, children })` – Kopfzeile (Logo, `search`, `headerEnd`), Sidebar, `<main>`. Einklappen per Knopf am Sidebar-Rand (`aria-label` „Seitenleiste einklappen/ausklappen“, `aria-expanded`) und `[`; Zustand in `localStorage` unter `nav:sidebar-collapsed` (Zugriffe in try/catch). Unter 1024 px (`matchMedia("(max-width: 1023px)")`) ist die Sidebar eine Schublade: Menü-Knopf in der Kopfzeile öffnet, Escape/Klick auf Hintergrund/Navigation schliesst.
- [ ] **Step 1: Failing tests**
  - Sidebar: aktiver Eintrag `aria-current="page"`, genau einer; Verwaltung (`collapsible`) zu → Einträge nicht sichtbar, `aria-expanded="false"`; `activeId` in Verwaltung → offen; Kind-Ansicht wird innerhalb des `li` ihres Eltern-Eintrags gerendert; `collapsed`: Link hat zugänglichen Namen „Aufträge“, Fokus auf Link zeigt `role=tooltip` mit „Aufträge“, Markierung bleibt (`aria-current`) (Review Focus 5).
  - AppShell: Knopf klappt ein (`aria-expanded` wechselt), `[` ebenso, `[` im Input nicht; Zustand nach Remount aus `localStorage`; `localStorage` wirft → rendert trotzdem.
- [ ] **Step 2:** FAIL. **Step 3:** Implementieren; Navbar löschen. **Step 4:** `npx vitest run` (ganze Suite) → PASS; `npx tsc --noEmit` sauber.
- [ ] **Step 5:** Commit `feat(nav): grouped collapsible sidebar and app shell; remove website navbar`.

### Task 6: Globale Suche

**Files:**
- Create: `components/nav/search.ts`, `components/nav/GlobalSearch.tsx`
- Test: `components/nav/search.test.ts`, `components/nav/GlobalSearch.test.tsx`

**Interfaces:**
- Consumes: `normalizeIdentifier`, `matchesIdentifier`, `useShortcut`, `NavLink`.
- Produces:
  - `type SearchRecord = { type: string; id: string; title: string; context?: string; href: string; identifiers: string[]; text?: string[] }` – `identifiers` = Kennungen inkl. Varianten (z. B. `["26100013 – 1/4", "26100013-1"]`), `text` = Namen u. ä. (Teilwort-Suche, ohne Gross/Klein).
  - `type SearchGroup = { type: string; results: SearchRecord[] }`
  - `searchRecords(records, query, { typeOrder, limitPerType = 5 }): { exact: SearchRecord | null; groups: SearchGroup[] }` – Rang: exakte Kennung > Kennungs-Präfix > Text; `exact` = einziger exakter Treffer (bei mehreren: der erste nach `typeOrder`); Gruppen in `typeOrder`, `exact` steht in seiner Gruppe vorn.
  - `GlobalSearch({ search, typeLabels, placeholder, onNavigate })` – `search(query) => Promise<{ exact; groups }>` (das Beispiel wickelt `searchRecords` ein); Eingabe in der Kopfzeile (`role="combobox"`, `aria-expanded`, `aria-controls`), Popover `role="listbox"` mit Gruppenüberschriften (`role="group"` `aria-label`); jeder Treffer zeigt `title` und `context`; Pfeiltasten bewegen die Hervorhebung, Enter öffnet hervorgehobenen Treffer (Start: `exact` bzw. erster) via `onNavigate(href)`; Escape schliesst und leert; `/` und ⌘/Ctrl+K fokussieren das Feld; Hinweis-Kbd „/“ im Feld; veraltete Antworten werden verworfen (Request-Zähler wie Combobox aus Teil 1).
- [ ] **Step 1: Failing tests**
  - `search.test.ts` (Fixture: Auftrag `26100013` mit Text „DÄHLER + BLASER“, Laufzettel `26100013 – 1/4` … `4/4` mit Aliasen `26100013-1` …): Query `26100013` → `exact` = Auftrag, Laufzettel-Gruppe enthält 4 (Review Focus 1); `26100013-2` → `exact` = Laufzettel 2/4; `26100013 – 2/4` und `26100013 2/4` → dasselbe; `dähler` → Auftrag in Treffern, `exact` null; leere Query → keine Gruppen.
  - `GlobalSearch.test.tsx`: Tippen `26100013-2` + Enter → `onNavigate` mit Laufzettel-href; Treffer zeigt Kontext „Auftrag #26100013 DÄHLER + BLASER“; `/` im Dokument fokussiert das Feld, `/` in einem anderen Input nicht; `{Control>}k` fokussiert; Escape schliesst Liste; langsame Antwort für „2610“ trifft nach Antwort für „26100013-2“ ein → angezeigt bleibt die neuere.
- [ ] **Step 2:** FAIL. **Step 3:** Implementieren. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(nav): global search over every readable identifier`.

### Task 7: Beispiel-App

**Files:**
- Create: `components/nav/examples/data.ts`, `router.tsx`, `ExampleApp.tsx`, `ExampleApp.stories.tsx`
- Test: `components/nav/examples/ExampleApp.test.tsx`

**Interfaces:**
- Consumes: alles aus Tasks 1–6.
- Produces:
  - `data.ts`: `ORDERS: Order[]` (~20, `id` wie `26100013`, `customerId`, `status: "offen" | "in-bearbeitung" | "abgeschlossen"`, `createdBy: "me" | "other"`), `SLIPS: Slip[]` (`orderId`, `index`, `total`, `material`), `CUSTOMERS: Customer[]`; deterministisch (kein `Math.random`), Auftrag `26100013` „DÄHLER + BLASER“ hat 4 Laufzettel.
  - `router.tsx`: `MemoryRouter({ initial, children })`, `useLocation(): { path: string; query: URLSearchParams }`, `useNavigate(): (href: string) => void`, `useBack(): () => void`, `RouterLink` (für `LinkProvider`, fängt Klick ohne Modifier ab, ⌘/Ctrl-Klick bleibt Standard).
  - Routen: `/auftraege?view=&q=&page=`, `/auftraege/:id` (+ `/laufzettel`, `/verlauf`), `/auftraege/:id/laufzettel/:n`, `/laufzettel?view=&q=`, `/kunden`, `/kunden/:id`, `/verwaltung/:x`. Herkunft als `from=` (die vollständige Listen-URL, encodiert) am Objekt-Link.
  - `ExampleApp({ initial?: string })`.
- Verhalten:
  - Laufzettel-Pfad immer `Aufträge › #26100013 DÄHLER + BLASER › Laufzettel 1/4` (N-01).
  - Menü-Markierung: aus `from` abgeleitet (Liste `/laufzettel…` → Eintrag „Laufzettel“), sonst erstes Pfad-Glied (N-02).
  - Zurück-Link „‹ {Ansicht} · {Liste}“ führt exakt auf `from` (N-03); Liste markiert die Zeile mit `?highlight=` für 2 s (`data-highlighted`).
  - Pager: Laufzettel mit `from` aus Liste → Menge der Liste; ohne → Geschwister im Auftrag „im Auftrag“ (N-04).
  - Auftragsliste mit `ViewFilter` (Alle/Offen/In Bearbeitung/Von mir erstellt mit Anzahl) und Listensuche „In Aufträgen suchen“; Seiten à 10.
  - Kunde ist Link (N-08). Verwaltung-Einträge sind Platzhalterseiten.
- [ ] **Step 1: Failing tests**
  - Gleicher Pfad bei drei Einstiegen: über Auftrag → Tab Laufzettel → Laufzettel 1; über Liste Laufzettel → Laufzettel 1; über Suche „26100013-1“ + Enter. Alle drei: Pfad-Texte `["Aufträge", "#26100013 DÄHLER + BLASER", "Laufzettel 1/4"]`.
  - Menü: Einstieg über Liste Laufzettel → `aria-current` auf „Laufzettel“; über Suche → auf „Aufträge“.
  - Zurück: Liste mit Ansicht „Offen“, Suche „BLASER“, Seite 2 (sofern vorhanden, sonst Seite 1) → Auftrag öffnen → Zurück-Link Text enthält „Offen“ → Klick → Ansicht „Offen“ aktiv, Suchfeld enthält „BLASER“, zuletzt geöffnete Zeile `data-highlighted`.
  - Pager im Auftrag: Laufzettel 1/4 → `j` → Pfad endet auf „Laufzettel 2/4“.
- [ ] **Step 2:** FAIL. **Step 3:** Implementieren; Story `Navigation/Beispiel-App` mit `layout: 'fullscreen'`. **Step 4:** ganze Suite PASS, `npx tsc --noEmit` sauber.
- [ ] **Step 5:** Commit `feat(nav): clickable example app`.

### Task 8: Handbuch-Seiten N-01–N-12

**Files:**
- Create: `handbook/navigation/rules.ts`, `handbook/navigation/examples.tsx`, `handbook/navigation/Uebersicht.mdx`, `handbook/navigation/N-01-…mdx` … `N-12-…mdx`
- Modify: `handbook/Einleitung.mdx` (Navigation verfügbar, `N-01`…`N-12` erwähnen), `handbook/RuleIndex.tsx` (Typ `RuleGroup` aus gemeinsamer Stelle importieren: `rules.ts` von Formularen bleibt, Typ nach `handbook/rules.types.ts` verschieben)
- Test: `handbook/rules.test.ts`

**Interfaces:**
- Consumes: `RuleIndex`, `RuleExample`, nav-Komponenten.
- Produces: `NAV_RULE_GROUPS: RuleGroup[]` (Orientierung N-01–N-05, Finden N-06–N-08, Menü N-09–N-12), Seitentitel `Handbuch/Navigation/N-xx <Titel>`.
- Regeltexte: Regel- und Warum-Sätze wörtlich aus der Spec; Details aus den Spiegelstrichen der Spec; Übertragen 1–3 Punkte (u. a. Nova: Pfad aus Beziehungen statt Menüposition bauen; Herkunft als Query-Parameter mitgeben).
- Gut/Schlecht je Regel als Mini-Ausschnitt mit den echten Komponenten (Schlecht = Nachbau des Problems, z. B. Pfad „Planung › Laufzettel › …“).
- [ ] **Step 1: Failing test** `handbook/rules.test.ts`: `NAV_RULE_GROUPS` enthält genau `N-01`…`N-12` je einmal, in Reihenfolge; jede `docsId` beginnt mit `handbuch-navigation-n-`; dasselbe für `FORM_RULE_GROUPS` mit `F-` (12 Stück).
- [ ] **Step 2:** FAIL. **Step 3:** Seiten schreiben.
- [ ] **Step 4:** Test PASS; `PATH=/home/patrick/.nvm/versions/node/v24.22.1/bin:$PATH npx storybook build -o storybook-static --quiet` → Exit 0; alle `docsId` aus beiden `rules.ts` existieren in `storybook-static/index.json`; Screenshot der Übersicht und der Beispiel-App angesehen.
- [ ] **Step 5:** Commit `docs(handbook): navigation rules N-01 to N-12`.
