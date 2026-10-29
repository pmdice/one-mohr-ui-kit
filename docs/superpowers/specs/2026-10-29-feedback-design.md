# Teil 8: Speichern & Rückmeldung (R-01–R-10)

## Warum

Jeder Teil bisher speichert irgendwo: Formular (F-12), Eingaben (E-04), an Ort und Stelle (D-07),
Scan (S-07, W-07). Wie die Software dabei antwortet, ist aber nirgends als Ganzes geregelt: Wann ein
Toast, wann eine Meldung am Feld? Was, wenn zwei Personen denselben Auftrag ändern? Was sagt man bei
„HTTP 419“? Wie lange darf etwas dauern, ohne dass man es sieht? Vercel zeigt bei jedem Deployment
den Stand in Worten und Zeit; Linear speichert sofort, zeigt Konflikte und bietet Rückgängig statt Rückfragen.

Ausserdem gibt es zwei Arten Meldungen nebeneinander (`molecules/Toast` mit framer-motion, `status/UndoNotice`).
Teil 0 hat sie zum Zusammenführen hierher verschoben.

Patrick hat freie Hand gegeben; alle Entscheidungen hier sind meine.

## Ziele

1. Zehn Regeln R-01–R-10.
2. Bausteine unter `components/feedback/`: `explainError` (Fehler → Satz + nächster Schritt),
   `useSave` (Speicherstand-Maschine mit Wiederholen), `SaveIndicator`, `NoticeProvider`/`useNotice`/
   Meldungsbereich (ersetzt `molecules/Toast`; `UndoNotice` baut darauf auf), `ConflictDialog`,
   `SessionDialog` (Sitzung abgelaufen, ohne Datenverlust), `ConnectionBanner`, `PendingButton`-Verhalten
   über `Button busy` (besteht) plus `useOnce` gegen doppeltes Absenden, `LongTask` (Fortschritt ab 1 s, Hintergrund ab 10 s).
3. Beispiel „Speichern: Auftrag bearbeiten“, das alle Fälle per Simulation auslöst.

## Nicht-Ziele

- Echte Server-Anbindung, Websockets, Push-Benachrichtigungen.
- Benachrichtigungs-Center/Posteingang (später, wenn überhaupt).

## Anti-Ziele

- Ein Toast für einen Fehler, den man am Feld beheben muss.
- „Ein Fehler ist aufgetreten.“ ohne was und ohne nächsten Schritt.
- Stilles Überschreiben der Änderung einer anderen Person.
- Eingaben, die beim Ablauf der Sitzung verloren gehen.
- Ein Knopf, der zweimal speichert, weil man zweimal geklickt hat.

## Regeln

### Stand
- **R-01 Der Speicherstand ist immer sichtbar.** In Worten neben dem Speichern-Knopf oder im Kopf:
  „Nicht gespeicherte Änderungen“, „Speichert …“, „Gespeichert · vor 2 min“, „Nicht gespeichert – <Grund>“ mit „Erneut versuchen“.
- **R-02 Die Rückmeldung steht dort, wo man gehandelt hat.** Fehler und Erfolg am Feld oder Formular;
  eine schwebende Meldung (Toast) nur, wenn der Ort verschwindet (gelöscht → zurück zur Liste) oder die
  Arbeit im Hintergrund weiterläuft. Ein Toast verlangt nie, dass man etwas tut, ausser „Rückgängig“.
- **R-03 Meldungen sind kurz und bleiben, solange man sie braucht.** Ein Satz im Perfekt (G-10), höchstens
  eine Aktion. Erfolg verschwindet nach 5 s (mit Rückgängig 8 s), nicht solange der Zeiger oder der Fokus
  darauf ist; Fehler bleiben, bis man sie schliesst. Höchstens drei gleichzeitig, die neueste unten.

### Schnell und sicher
- **R-04 Sofort zeigen, wenn der Weg zurück sicher ist.** Umschalten, Status setzen, Zuweisen wirken
  sofort (optimistisch) mit Rückgängig; scheitert der Server, kehrt der alte Wert zurück und eine Meldung
  sagt es. Endgültiges fragt (S-06).
- **R-05 Doppelt klicken speichert einmal.** Während des Speicherns ist der Knopf beschäftigt (Fokus
  bleibt, Text bleibt), weitere Klicks und Enter tun nichts.
- **R-06 Was dauert, zeigt sich.** Unter 1 s nichts; ab 1 s ein Zeichen mit Text („Exportiert 1’200 Aufträge …“);
  ab 10 s Fortschritt oder „läuft im Hintergrund – Sie können weiterarbeiten“ mit Meldung am Ende.

### Wenn es schiefgeht
- **R-07 Fehler in Sätzen mit nächstem Schritt.** Keine Codes und Ausnahmen; jeder Fehler sagt was und
  was jetzt: Keine Verbindung → Eingaben bleiben, erneut versuchen; keine Berechtigung → wer es darf;
  Prüffehler → am Feld (F-03); Serverfehler → „Unerwarteter Fehler“ + Code für den Support zum Kopieren.
- **R-08 Konflikte zeigen statt überschreiben.** Hat jemand anderes den Datensatz seit dem Öffnen
  geändert, zeigt das Speichern, wer was geändert hat, Feld für Feld, und lässt wählen: die eigene Änderung
  übernehmen oder die andere behalten. Nichts geht still verloren.
- **R-09 Eine abgelaufene Sitzung verliert nichts.** Anmelden in einem Dialog über der Seite; danach wird
  das Speichern wiederholt. Eingaben bleiben, auch über ein Neuladen hinweg (Entwurf im Browser).
- **R-10 Ohne Verbindung arbeitet man weiter, soweit es geht.** Ein Band sagt „Keine Verbindung“ und was
  das heisst; Speichern wartet und läuft beim Wiederverbinden (wie W-07); was nicht warten kann, ist deaktiviert mit Grund.

## Bausteine (`components/feedback/`)

- `explainError(error): Explained` mit `Explained = { message: string; action?: "retry" | "login" | "reload"; field?: Record<string,string>; code?: string }`.
  Eingabe: `{ status?: number; code?: string; fields?: Record<string,string>; offline?: boolean }` oder `Error`.
  0/offline → „Keine Verbindung. Ihre Eingaben sind noch da; erneut versuchen, sobald die Verbindung zurück ist.“ (retry);
  401/419 → „Ihre Sitzung ist abgelaufen. Melden Sie sich an; Ihre Eingaben bleiben erhalten.“ (login);
  403 → „Dafür fehlt Ihnen die Berechtigung. Eine Person mit Rechten für Aufträge kann das ändern.“;
  404 → „Diesen Datensatz gibt es nicht mehr. Er wurde vermutlich gelöscht.“ (reload);
  409 → „Jemand anderes hat das inzwischen geändert.“; 422 → „Bitte die markierten Felder prüfen.“ + `field`;
  429 → „Zu viele Anfragen. In einer Minute erneut versuchen.“ (retry);
  5xx/sonst → „Unerwarteter Fehler. Erneut versuchen; wenn es wieder passiert, den Code an den Support geben.“ (retry, code).
- `useSave<T>(save: (value: T) => Promise<void>, { now? })` → `{ state: "idle" | "dirty" | "saving" | "saved" | "failed"; savedAt?; error?: Explained; markDirty(); run(value) (ignoriert, solange saving); retry() }`.
- `SaveIndicator({ state, savedAt, error, now, onRetry })` – Worte nach R-01, `role="status"`.
- `NoticeProvider`, `useNotice()` → `{ notify({ message, tone?: "success" | "error" | "info", action?: { label; run }, duration? }): id; dismiss(id) }`,
  Region unten rechts, `aria-live` (Fehler `role="alert"`), Pause bei Zeiger/Fokus, höchstens drei.
  `UndoNotice` bleibt als einzelne Meldung (gleiches API) im neuen Aussehen. `molecules/Toast` wird entfernt; `app/layout` nutzt `NoticeProvider`.
- `ConflictDialog({ open, changes: { field; mine; theirs }[], by, at, now, onKeepMine, onKeepTheirs, onCancel })` auf `Dialog`.
- `SessionDialog({ open, onLogin(password): Promise<void>, user })` – Passwort-Feld, Fehler am Feld, nach Erfolg schliesst er.
- `ConnectionBanner({ online, waiting? })`.
- `LongTask({ running, label, progress?, startedAt, now, onBackground? })` – nichts unter 1 s, Text ab 1 s, Fortschritt/Hintergrund ab 10 s.
- `useDraft(key, value, storage?)` – speichert den Entwurf im Browser, liefert `{ restored, clear }`.

## Was bleibt dem Bauenden

Aussehen im Stil des Kits; Inhalt des Beispiels.
