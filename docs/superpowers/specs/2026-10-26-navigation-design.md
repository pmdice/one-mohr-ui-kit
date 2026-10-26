# Handbuch Teil 2: Navigation & App-Rahmen

**Datum:** 2026-10-26
**Status:** Entwurf, wartet auf Freigabe
**Baut auf:** `2026-10-25-enterprise-forms-design.md` (Richtung, Regelformat, Tokens, Gestaltung nach Linear)

## Warum

Im Casting Manager verirrt man sich, obwohl die App nur drei Ebenen hat
(Auftrag → Gusszettel → Aufgabe). Patricks Beispiel aus dem echten Betrieb:

> Man ist auf *Planung › Aufträge › #26100013 DÄHLER + BLASER*, wechselt auf den Tab
> „Guss“ und öffnet den digitalen Gusszettel. Plötzlich steht oben
> *Planung › Gusszettel › INOX – DÄHLER + BLASER*. Man ist eine Ebene tiefer gegangen,
> der Pfad behauptet aber, man sei in einem ganz anderen Bereich.

Weitere Befunde aus den Screenshots und dem Gespräch:

- Der Pfad zeigt, **wo eine Seite im Menü hängt**, nicht **wozu das Ding gehört**. (Das
  ist typisch für ressourcenbasierte Admin-Frameworks wie Nova, in denen jede Ressource
  eine eigene Menüposition hat.)
- „Aufträge“ und „Gusszettel“ stehen zweimal im Menü, unter *Persönlich* und unter
  *Planung*. *Persönlich › Aufträge* sind die selbst erfassten Aufträge, umgesetzt als
  eigene Seite statt als Filter derselben Liste. Man weiss nie, in welcher Liste man ist.
- Das Menü hat mehrere Gruppen, die nach verschiedenen Logiken ordnen: nach Person,
  nach Abteilung, Stammdaten, Verwaltung.
- Seiten-Tabs („Details / Guss“) und Listenfilter („Alle / Offen / …“) sehen gleich aus.
- Zwei Suchfelder übereinander (global und Liste), ohne erkennbaren Unterschied.
- Die Gusszettelnummer *26100013 – 1/4* steht auf dem Papier, man kann aber nicht nach
  ihr suchen. Um einen Zettel anzusehen, braucht man vier Schritte: Liste → Auftrag →
  Tab „Guss“ → Auge/Drucken.
- Auf einem Gusszettel heisst ein Tab „Gusszettel“.
- Gut und beizubehalten: „1/4 im Auftrag ‹ ›“ zum Blättern zwischen den Gusszetteln eines
  Auftrags. Ausserdem sind Verweise wie der Kunde bereits als Links ausgeführt.

Alle Benutzer sehen (bis auf wenige Einstellungen) dasselbe Menü.

**Erfolg:** Patrick kann jede Regel in Nova umsetzen, und im Casting Manager weiss man
auf jeder Seite, wo man ist, wozu das Ding gehört und wie man zurückkommt.

## Ziele

- Regeln **N-01 bis N-12** für Orientierung, Finden und Menü, im Format von Teil 1
  (Regel / Warum / Details / Gut-Schlecht / Übertragen), auf Deutsch, unabhängig vom
  Framework.
- Referenz-Komponenten für den App-Rahmen (Sidebar, Kopfzeile, Pfad, Seitenkopf,
  Seiten-Tabs, Ansichts-Filter, globale Suche, Blättern).
- Ein durchgehendes, **klickbares Beispiel**: eine kleine App mit Liste → Objekt →
  Unterobjekt, in der man alle Regeln erlebt.

## Nicht-Ziele

- **Werkstatt-Modus** (Tablet, Kamera, Scan an der Station). Patrick: „nur eine Kamera-View
  mit kleinen Informationen“. Kommt später als eigenes Thema. Der Scan taucht hier nur
  als Suche nach einer Nummer auf (N-06).
- **Listen & Tabellen** selbst (Spalten, Sortieren, Filter-Logik, leere Zustände). Das
  ist das nächste Kapitel. Hier geht es nur darum, wie man in eine Liste hinein- und
  wieder herauskommt.
- **Befehlspalette mit Aktionen** (⌘K → „Neuer Auftrag“). Hier nur Suche nach Objekten.
- **Rollen und Berechtigungen** als Thema. Es gilt nur: Was jemand nicht darf, sieht er
  nicht (N-10).
- Ein Zuschnitt auf den Casting Manager. Er bleibt der Prüfstein, Regeln und Beispiel
  bleiben allgemein.

## Anti-Ziele

- Eine Navigation, die nur mit einem bestimmten Router funktioniert. Die Regeln
  beschreiben Verhalten; die Komponenten nehmen Links von aussen entgegen.
- Ein Pfad, der von der Klickgeschichte abhängt. Derselbe Gusszettel hat immer denselben
  Pfad.
- Zierrat im Rahmen: animierte Menüs, schwebende Leisten, grosse Logos. Der Rahmen soll
  verschwinden, die Arbeit steht im Vordergrund (Linear).

## Begriffe

- **Objekt:** ein Datensatz mit eigener Seite (Auftrag, Gusszettel, Kunde).
- **Zugehörigkeit:** die Kette von Eltern-Objekten bis zur obersten Liste
  (Gusszettel 1/4 → Auftrag #26100013 → Liste Aufträge). Jedes Objekt hat genau eine.
- **Liste:** eine Seite mit vielen Objekten eines Typs.
- **Ansicht:** eine gespeicherte Einschränkung einer Liste („Offen“, „Von mir erstellt“).
- **Herkunft:** die Liste oder Ansicht, aus der man ein Objekt geöffnet hat.

## Regeln

### Orientierung: Wo bin ich?

**N-01 Der Pfad zeigt die Zugehörigkeit**
Der Pfad (Breadcrumb) zeigt immer die Zugehörigkeit des Objekts, unabhängig davon, wie
man hingekommen ist (über das Menü, eine andere Liste, die Suche, einen Link oder einen
Scan).
- Jedes Glied ist eine Seite, auf die man klicken kann. Menügruppen wie „Planung“ sind
  keine Seiten und erscheinen nicht.
- Das erste Glied ist die oberste Liste des Objekttyps (*Aufträge*), das letzte Glied
  ist die aktuelle Seite und kein Link.
- Objekte erscheinen mit Kennung und Name (*#26100013 DÄHLER + BLASER*).
- Ein Seiten-Tab ist kein eigenes Glied; er steht im Seitenkopf (N-11).
*Warum:* Ein Pfad, der sich je nach Einstieg ändert, erklärt nichts, sondern widerspricht
sich. Die Zugehörigkeit ist das, was man am Telefon sagt: „Gusszettel 1 von Auftrag 26100013“.

**N-02 Das Menü zeigt die Herkunft**
Die Markierung im Menü bleibt auf dem Eintrag, über den man gekommen ist, auch wenn man
tiefer geht. Wer über *Gusszettel* einen Gusszettel öffnet, sieht *Gusszettel* markiert,
während der Pfad *Aufträge › #26100013 › Gusszettel 1/4* zeigt. Ohne Herkunft (Suche,
direkter Link, Scan) wird der Menüeintrag des ersten Pfad-Glieds markiert.
*Warum:* Pfad und Menü beantworten zwei verschiedene Fragen: „Wozu gehört das?“ und
„Woher komme ich?“. Wenn beide dasselbe zeigen, geht eine Antwort verloren.

**N-03 Zurück zur Liste kommt man dorthin, wo man war**
Wer aus einer Liste ein Objekt geöffnet hat, sieht im Seitenkopf einen Weg zurück zu
genau dieser Liste („‹ Offen · Aufträge“). Zurück heisst: gleiche Ansicht, gleiche
Filter, gleiche Sortierung, gleiche Seite, gleiche Scroll-Position, und die zuletzt
geöffnete Zeile ist kurz hervorgehoben. Filter, Sortierung und Seite stehen deshalb in
der URL. Der Browser-Zurück-Knopf führt zum selben Ergebnis.
*Warum:* Wer eine Liste abarbeitet, verliert sonst nach jedem Objekt seinen Platz und
muss die Filter neu setzen.

**N-04 Zwischen Geschwistern blättern**
Auf einem Objekt, das man aus einer Menge geöffnet hat, kann man zum vorherigen und
nächsten Objekt derselben Menge springen, ohne zurückzugehen: „1/4 im Auftrag ‹ ›“ für
Unterobjekte eines Elternteils, „3 von 17 · Offen ‹ ›“ für eine Liste. Tastatur: `K` /
`J` (vorheriges / nächstes), solange der Fokus nicht in einem Eingabefeld liegt. Ohne
Herkunft wird die Menge der Geschwister im Elternteil verwendet; hat das Objekt keinen
Elternteil, entfällt das Blättern.
*Warum:* Durchgehen ist eine der häufigsten Tätigkeiten: alle Zettel eines Auftrags
prüfen oder alle offenen Aufträge abarbeiten.

**N-05 Der Seitenkopf sagt, was das ist**
Jede Objektseite hat denselben Kopf: Kennung und Name als Titel, Status und andere
wichtige Merkmale als Badges daneben, rechts höchstens eine Hauptaktion (gefüllter
Button) und weitere Aktionen im Menü „…“. Darunter die Seiten-Tabs (N-11). Kopf und Pfad
benutzen dieselbe Bezeichnung für das Objekt.
*Warum:* Wer zwischen vielen Objekten springt, muss in einer Sekunde erkennen, wo er
gelandet ist und was er hier tun kann.

### Finden: Wie komme ich hin?

**N-06 Suchbar ist alles, was man ablesen kann**
Die globale Suche findet jedes Objekt über jede Kennung, die irgendwo steht: auf Papier,
Etikett, E-Mail oder Bildschirm (Auftragsnummer, Gusszettelnummer, Kundennummer,
Kunden-Auftragsnummer, Name).
- Schreibvarianten derselben Nummer führen zum selben Treffer: *26100013 – 1/4*,
  *26100013-1/4*, *26100013 1/4*, *26100013-1*. Leerzeichen, Gedankenstrich und
  Bindestrich sind gleichwertig; ein gescannter Code ist dieselbe Suche.
- Ein Treffer führt direkt zum Objekt, nicht zu seinem Elternteil.
- Treffer sind nach Typ gruppiert und zeigen ihre Zugehörigkeit
  („Gusszettel 1/4 INOX · Auftrag #26100013 DÄHLER + BLASER“).
- Passt eine Eingabe genau auf eine Kennung, steht dieser Treffer zuoberst und Enter
  öffnet ihn.
- Öffnen mit `/` von überall (ausser in Eingabefeldern) und mit ⌘/Ctrl+K.
*Warum:* Am Telefon und an der Werkbank hat man eine Nummer in der Hand, keinen Pfad.
Jeder Klick zwischen Nummer und Objekt ist Zeit, in der der Anrufer wartet.

**N-07 Globale Suche und Listensuche sehen verschieden aus**
Es gibt zwei Arten von Suche mit verschiedenen Aufgaben:
- **Global** (in der Kopfzeile): durchsucht alles und navigiert zum Treffer.
- **In der Liste** (über der Liste): schränkt die sichtbare Liste ein, ohne die Seite
  zu verlassen. Die Beschriftung nennt den Bereich („In Aufträgen suchen“), das
  Ergebnis ist eine Ansicht nach N-03 (steht in der URL).
Sie stehen nie direkt übereinander, ohne dass ihre Beschriftung den Unterschied sagt.
*Warum:* Zwei gleich aussehende Suchfelder zwingen zum Raten, und die falsche Wahl
liefert scheinbar „keine Treffer“.

**N-08 Jeder Verweis ist ein Link**
Wo ein anderes Objekt erwähnt wird (Kunde in einem Auftrag, Auftrag auf einem
Gusszettel, Gusszettel in einer Artikelzeile), ist die Erwähnung ein Link auf dieses
Objekt. Links sehen wie Links aus und öffnen mit ⌘/Ctrl-Klick in einem neuen Tab. Das
gilt auch für Kennungen in Tabellen.
*Warum:* Die Daten sind ein Netz. Wer einem Verweis nicht folgen kann, muss ihn
abschreiben und suchen.

### Menü: Was zeigt die Sidebar?

**N-09 Eine Liste, ein Menüeintrag**
Jede Liste steht genau einmal im Menü. Gefilterte Ansichten derselben Liste („Von mir
erstellt“, „Offen“) sind Ansichten innerhalb der Liste (N-11), keine eigenen Seiten.
Ist eine Ansicht so wichtig, dass sie ins Menü gehört, steht sie eingerückt unter ihrer
Liste, nie in einer anderen Gruppe.
*Warum:* Zwei Menüeinträge für dieselben Objekte lassen offen, welche Liste die richtige
ist, und man weiss nie, ob man gerade alle oder nur einen Teil sieht.

**N-10 Das Menü ist nach Häufigkeit gegliedert**
Oben steht die tägliche Arbeit, darunter die Stammdaten, ganz unten die Verwaltung.
Jede Gruppe folgt einer einzigen Logik und hat höchstens etwa sieben Einträge. Die
Verwaltung ist einklappbar und standardmässig eingeklappt, ausser man befindet sich
gerade darin. Was jemand nicht benutzen darf, steht nicht im Menü (nicht ausgegraut).
Beispiel Casting Manager:
- *Dashboard*
- **Arbeit:** Aufträge, Gusszettel
- **Stammdaten:** Kunden, Kontakte, Artikel, Legierungen, Materialien, Lieferanten
- **Verwaltung:** Benutzer, Rollen, Abteilungen, Typen, Extraleistungen, Rabattstaffel,
  Synchronisation, Verlauf
*Warum:* Wer täglich dasselbe öffnet, soll es ohne Lesen finden. Selten Benutztes darf
weiter weg sein, aber nicht dazwischen.

**N-11 Seiten-Tabs sind keine Filter**
- **Seiten-Tabs** wechseln zwischen Unterseiten eines Objekts (Details / Guss / Verlauf).
  Sie sehen aus wie Reiter mit Unterstrich, stehen im Seitenkopf und ändern den
  URL-Pfad. Kein Tab trägt den Namen des Objekttyps, auf dem man ist (kein Tab
  „Gusszettel“ auf einem Gusszettel).
- **Ansichts-Filter** schränken eine Liste ein (Alle / Offen / In Bearbeitung / Von mir
  erstellt). Sie sehen aus wie ein Segment-Schalter mit Anzahl, stehen über der Liste
  und ändern einen URL-Parameter.
*Warum:* Wenn beide gleich aussehen, weiss man nicht, ob man gerade eine andere Seite
oder dieselbe Liste anders sieht.

**N-12 Die Sidebar lässt sich einklappen, ohne dass man die Orientierung verliert**
Eingeklappt zeigt die Sidebar nur Icons. Jeder Eintrag hat dann einen Tooltip mit
seinem Namen, die Markierung (N-02) bleibt sichtbar, und Gruppen sind durch Abstände
getrennt. Der Zustand bleibt pro Gerät gespeichert. Ein- und Ausklappen geht per Knopf
am Rand der Sidebar und per `[`. Unter etwa 1024 px Breite wird die Sidebar zur
Schublade, die sich über den Inhalt legt.
*Warum:* Auf kleinen Bildschirmen braucht der Inhalt den Platz, aber man darf dafür
nicht vergessen, wo man ist.

## Komponenten (Referenz-Umsetzung)

| Komponente | Zweck | Regeln |
|---|---|---|
| `AppShell` | Rahmen: Sidebar, Kopfzeile, Inhalt; Einklappen, Schublade unter ~1024 px | N-12 |
| `Sidebar` | Gruppen, einklappbare Gruppe, eingerückte Ansichten, Markierung, Icon-Modus mit Tooltips | N-02, N-09, N-10, N-12 |
| `Breadcrumb` | Pfad aus einer Zugehörigkeitskette | N-01 |
| `PageHeader` | Titel, Badges, Hauptaktion, „…“-Menü, Zurück-zur-Liste, Blättern, Seiten-Tabs | N-03, N-04, N-05 |
| `PageTabs` | Seiten-Tabs als Links mit Unterstrich | N-11 |
| `ViewFilter` | Segment-Schalter mit Anzahl für Listen-Ansichten | N-09, N-11 |
| `RecordPager` | „1/4 im Auftrag ‹ ›“ mit `J`/`K` | N-04 |
| `GlobalSearch` | Suchfeld in der Kopfzeile + Ergebnis-Popover, gruppiert, `/` und ⌘/Ctrl+K | N-06, N-07 |
| `normalizeIdentifier` | reine Funktion: Schreibvarianten einer Kennung auf eine Form bringen | N-06 |

- Komponenten bekommen Ziele als `href` und rendern Links über eine austauschbare
  Link-Komponente (Standard: `<a>`). Kein Router ist fest eingebaut. *Entscheid Claude:*
  Sonst funktioniert das Beispiel in Storybook nicht und die Regel wäre an Next.js gebunden.
- Zugehörigkeit und Herkunft werden von aussen hereingegeben (als Daten), nicht von den
  Komponenten ermittelt. Wie eine App die Herkunft weiterreicht (URL-Parameter,
  History-State), zeigt das Beispiel; die Regel schreibt es nicht vor. *Entscheid Claude.*
- Die bestehende `Navbar` (schwebende Website-Leiste) wird entfernt; sie widerspricht der
  Richtung. *Entscheid Claude.*
- Die bestehende `Tabs`-Komponente (Pillen-Optik, schaltet Inhalt auf derselben Seite)
  bleibt für Inhaltswechsel innerhalb einer Seite, bekommt aber die Reiter-Optik aus
  N-11, damit es im Kit nur eine Tab-Optik gibt. *Entscheid Claude.*

## Durchgehendes Beispiel

Eine Story „App-Rahmen“ mit einer kleinen, klickbaren App im Speicher (eigener kleiner
Router im Beispiel, keine echte Navigation):

- Objekte, allgemein benannt, aber gleich aufgebaut wie im Casting Manager:
  **Aufträge** (Kennung `26100013`, Kunde, Status) → **Laufzettel** (Kennung
  `26100013 – 1/4`, Material) und **Kunden**.
- Menü nach N-10 mit Arbeit (Aufträge, Laufzettel), Stammdaten (Kunden, …) und
  eingeklappter Verwaltung (Platzhalterseiten).
- Auftragsliste mit Ansichten „Alle / Offen / In Bearbeitung / Von mir erstellt“ und
  Listensuche; Auftragsseite mit Tabs „Details / Laufzettel / Verlauf“; Laufzettelseite
  mit Pfad *Aufträge › #26100013 … › Laufzettel 1/4*, Blättern im Auftrag, Link zum
  Kunden.
- Laufzettel lassen sich über die eigene Liste, über den Auftrag und über die globale
  Suche öffnen; der Pfad bleibt gleich, die Menü-Markierung folgt der Herkunft.
- Etwa 20 Aufträge mit je 1–5 Laufzetteln, damit Blättern und Zurück-zur-Liste spürbar
  werden.
- Beide Dichten und Hell/Dunkel umschaltbar.

## Testen

Wie Teil 1: Vitest + Testing Library auf beobachtbares Verhalten, a11y-Addon ohne
Verstösse. Insbesondere:
- Gleicher Pfad für denselben Laufzettel bei drei Einstiegen; Menü-Markierung folgt der
  Herkunft, ohne Herkunft dem ersten Pfad-Glied.
- Zurück zur Liste stellt Ansicht, Suche und Seite wieder her.
- `normalizeIdentifier` und die Suche: alle Schreibvarianten aus N-06 treffen; exakter
  Treffer steht zuoberst; Enter öffnet ihn.
- `/`, ⌘/Ctrl+K, `J`/`K` und `[` wirken nicht, solange der Fokus in einem Eingabefeld liegt.
- Pfad und Sidebar sind als `nav` mit Namen ausgezeichnet, aktuelle Seite mit
  `aria-current="page"`.

## Handbuch-Seiten

Wie in Teil 1: eine MDX-Seite pro Regel unter *Handbuch › Navigation*, eine Übersicht mit
der Gruppen-Komponente aus Teil 1 (Orientierung / Finden / Menü), Gut/Schlecht-Beispiele
als lebende Mini-Ausschnitte. Die Einleitung markiert „Navigation & App-Rahmen“ als
verfügbar.

## Dem Umsetzer überlassen

- Genaue Masse, Icons und Abstände des Rahmens (ruhig, im Stil von Linear und Teil 1).
- Wie die Ergebnisliste der Suche im Beispiel gefüllt wird (lokal, simuliert asynchron).
- Wie die Herkunft im Beispiel transportiert wird.
- Wie lange die zuletzt geöffnete Zeile hervorgehoben bleibt.
- Aufteilung in atoms/molecules/organisms.
