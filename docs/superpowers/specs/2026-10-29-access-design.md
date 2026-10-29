# Teil 10: Rechte & Rollen (B-01–B-08)

## Warum

Bisher sagen einzelne Regeln etwas über Rechte: N-10 („was jemand nicht darf, sieht er nicht“), S-05
(Schritte, die gerade nicht gehen, mit Grund), R-07 (403 als Satz). Wann man ausblendet, wann man sperrt
und wann man erklärt, steht nirgends zusammen – und genau dort entstehen in Firmensoftware die Sackgassen:
ein grauer Knopf ohne Grund, ein Formular voller deaktivierter Felder, eine Preisspalte voller Striche.
Linear und Vercel zeigen Rollen offen („Admin“, „Member“), erklären gesperrte Aktionen und lassen
Zugriff anfragen statt eine Fehlerseite zu zeigen.

Patrick hat freie Hand gegeben; alle Entscheidungen hier sind meine.

## Ziele

1. Acht Regeln B-01–B-08.
2. Bausteine unter `components/access/`: `decide` (reine Entscheidung „verborgen / gesperrt mit Grund /
   erlaubt“), `Guarded` (wendet sie auf eine Aktion an), `ReadOnlyNotice`, `AccessRequestDialog`,
   `RoleBadge`, `RightsSummary`, `ImpersonationBanner`.
3. Beispiel „Rechte: Auftrag aus vier Rollen“: dieselbe Seite als Büro, Werkstatt, Teamleitung, Gast.

## Nicht-Ziele

- Echte Rechteverwaltung (Rollen anlegen, Rechte vergeben).
- Server-Prüfung (die gehört in Policies; die Oberfläche spiegelt nur).

## Anti-Ziele

- Graue Knöpfe ohne Grund.
- Ein Formular voller deaktivierter Felder als „Leseansicht“.
- Leere Spalten oder Striche, wo Rechte fehlen.
- Eine Fehlerseite ohne Weg, Zugriff zu bekommen.

## Regeln

### Zeigen
- **B-01 Ausblenden, sperren oder erklären.** Was eine Rolle nie darf, ist nicht da (N-10). Was sie
  grundsätzlich darf, aber gerade nicht (Zustand, S-05), ist sichtbar und gesperrt mit Grund. Was sie nicht
  darf, aber kennen muss, weil sie es anstossen soll, ist sichtbar mit „Nur Teamleitung“ und einem Weg
  (Anfragen, B-07).
- **B-02 Gesperrt heisst mit Grund und mit Weg.** Ein gesperrter Knopf sagt sichtbar daneben (nicht nur im
  Tooltip), warum und wer es darf oder was zuerst passieren muss.
- **B-03 Nur lesen sieht aus wie lesen.** Wer nur lesen darf, sieht Werte als Text (D-03), nicht ein Formular
  mit ausgegrauten Feldern; oben ein ruhiger Hinweis, dass und warum nur gelesen werden kann.
- **B-04 Was man nicht sehen darf, hinterlässt keine Lücke.** Felder und Spalten ohne Leserecht fehlen ganz;
  Summen, die sie verraten würden, auch. Keine Striche, keine „***“.

### Wissen
- **B-05 Die Rolle ist sichtbar.** Name und Rolle im Benutzermenü, dazu „Was darf ich?“ mit einer Übersicht
  nach Bereichen (lesen, ändern, löschen).
- **B-06 Als jemand anderes ansehen ist unübersehbar.** Wer die App als andere Person sieht (Support,
  Einrichten), sieht ein Band oben mit wem und einem Weg zurück; alles, was dabei geändert wird, steht im
  Verlauf mit beiden Namen.

### Weiterkommen
- **B-07 Zugriff anfragen statt Sackgasse.** Wo Rechte fehlen, gibt es „Zugriff anfragen“: ein kurzer Dialog
  mit Grund, der an die zuständige Person geht, mit Link auf genau diese Stelle.
- **B-08 Der Server entscheidet, die Oberfläche spiegelt.** Jede Regel hier ist Darstellung; geprüft wird
  auf dem Server bei jeder Anfrage. Lehnt er ab, sagt die Oberfläche es als Satz (R-07) und blendet danach aus.

## Bausteine (`components/access/`)

- `decide(rule, ctx): Decision` mit `rule = { roles: string[]; known?: string /* Hinweis für andere, z. B. "Nur Teamleitung" */; when?: (ctx) => string | null /* Grund, wenn gerade nicht */ }`,
  `ctx = { role: string; [k]: unknown }`, `Decision = { kind: "allowed" } | { kind: "disabled"; reason: string; requestable?: boolean } | { kind: "hidden" }`.
  Reihenfolge: Rolle fehlt und kein `known` → hidden; Rolle fehlt mit `known` → disabled(known, requestable); `when` liefert Grund → disabled(Grund); sonst allowed.
- `Guarded({ decision, children(props: { disabled, "aria-describedby" }) , onRequest? })` – rendert nichts,
  das Kind gesperrt mit Grund (sichtbarer Text, verknüpft) oder normal; bei `requestable` ein Link „Zugriff anfragen“.
- `ReadOnlyNotice({ area, who, onRequest? })` – „Sie können Aufträge nur lesen. Ändern dürfen: Büro, Teamleitung.“
- `AccessRequestDialog({ open, what, to, onSend(reason), onClose })` auf `Dialog`.
- `RoleBadge({ name, role })`, `RightsSummary({ rows: { area; read; change; delete }[] })` als Tabelle mit Wörtern.
- `ImpersonationBanner({ as, role, onLeave })`.
