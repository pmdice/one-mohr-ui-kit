/* Every component of the kit: what it is for and which rules it puts into practice. A test keeps this complete. */

export interface CatalogEntry {
    name: string
    /** Path from the repo root. */
    path: string
    purpose: string
    rules: string[]
    /** Older building block that a later part replaces or that no rule uses yet. */
    note?: string
}

/** Top-level folders under components/ with the heading they get on the page. */
export const FOLDERS: Record<string, string> = {
    atoms: "Grundbausteine",
    molecules: "Zusammengesetzte Bausteine",
    forms: "Formulare",
    inputs: "Eingaben",
    nav: "Navigation & App-Rahmen",
    table: "Listen & Tabellen",
    record: "Datensatz-Seite",
    status: "Status & Lebenszyklus",
    workshop: "Werkstatt",
}

export const CATALOG: CatalogEntry[] = [
    // Atoms
    { name: "Badge", path: "components/atoms/Badge/Badge.tsx", purpose: "Kurzes Etikett mit Bedeutungsfarbe.", rules: ["G-01"] },
    { name: "Button", path: "components/atoms/Button/Button.tsx", purpose: "Knopf in sechs Varianten und vier Grössen, mit Ladezustand, der den Fokus behält.", rules: ["G-01", "G-07", "G-10", "F-12"] },
    { name: "Input", path: "components/atoms/Input/Input.tsx", purpose: "Einzeiliges Eingabefeld in der Höhe der Dichte.", rules: ["G-06", "G-07"] },
    { name: "Label", path: "components/atoms/Label/Label.tsx", purpose: "Beschriftung eines Feldes mit Pflicht- oder Optional-Kennzeichen.", rules: ["F-01"] },
    { name: "Textarea", path: "components/atoms/Textarea/Textarea.tsx", purpose: "Mehrzeiliges Eingabefeld; mit maxLength erscheint ein Zähler kurz vor der Grenze.", rules: ["G-06", "G-07", "E-03"] },
    { name: "ThemeToggle", path: "components/atoms/ThemeToggle/ThemeToggle.tsx", purpose: "Wahl zwischen hell, dunkel und System.", rules: ["G-03"] },
    { name: "Tooltip", path: "components/atoms/Tooltip/Tooltip.tsx", purpose: "Beschriftung für Icon-Knöpfe bei Zeiger und Fokus.", rules: ["G-09"] },

    // Molecules
    { name: "Accordion", path: "components/molecules/Accordion/Accordion.tsx", purpose: "Aufklappbare Abschnitte für Hilfetexte.", rules: [], note: "Altbestand; Formulare klappen über GroupBlock ein (F-09)." },
    { name: "Card", path: "components/molecules/Card/Card.tsx", purpose: "Fläche mit Rahmen für zusammengehörigen Inhalt.", rules: ["G-02"] },
    { name: "Combobox", path: "components/molecules/Combobox/Combobox.tsx", purpose: "Auswahl mit Suche für lange Listen, mit „zuletzt benutzt“ und „… neu anlegen“.", rules: ["F-11", "E-09"] },
    { name: "Dialog", path: "components/molecules/Dialog/Dialog.tsx", purpose: "Der Dialog des Kits: beschriftet, Fokus bleibt drin und kehrt zurück, Escape schliesst nur den obersten.", rules: ["G-07", "S-06"] },
    { name: "SearchInput", path: "components/molecules/SearchInput/SearchInput.tsx", purpose: "Suchfeld mit Lupe und Leeren-Knopf.", rules: ["N-07"] },
    { name: "Select", path: "components/molecules/Select/Select.tsx", purpose: "Auswahl aus wenigen festen Werten, mit Tastatur bedienbar.", rules: ["F-11"] },
    { name: "Tabs", path: "components/molecules/Tabs/Tabs.tsx", purpose: "Wechselt Inhalt innerhalb einer Seite, im Stil der Seiten-Tabs.", rules: ["N-11"] },

    // Forms
    { name: "ConditionalField", path: "components/forms/ConditionalField.tsx", purpose: "Blendet Felder ein, wenn ihre Bedingung erfüllt ist, statt sie auszugrauen.", rules: ["F-10"] },
    { name: "Form", path: "components/forms/Form.tsx", purpose: "Formular mit Fehler-Zeitpunkt, Zusammenfassung beim Speichern und Tastatur-Kürzeln.", rules: ["F-02", "F-04", "F-11", "F-12"] },
    { name: "FormErrorSummary", path: "components/forms/FormErrorSummary.tsx", purpose: "Liste der Fehler nach einem misslungenen Speichern, mit Sprung zur Stelle.", rules: ["F-04"] },
    { name: "FormField", path: "components/forms/FormField.tsx", purpose: "Beschriftung, Feld, Hinweis und Fehlermeldung als eine Einheit.", rules: ["F-01", "F-03"] },
    { name: "FormSection", path: "components/forms/FormSection.tsx", purpose: "Abschnitt eines langen Formulars mit Titel und Pflicht-Zähler.", rules: ["F-01", "F-05"] },
    { name: "GroupBlock", path: "components/forms/GroupBlock.tsx", purpose: "Eine Position als Block mit stabiler Nummer, Fehlerzahl und Einklappen.", rules: ["F-04", "F-06", "F-08", "F-09"] },
    { name: "RepeatableGroup", path: "components/forms/RepeatableGroup.tsx", purpose: "Liste von Positionen: hinzufügen, duplizieren, entfernen, einklappen.", rules: ["F-06", "F-09"] },
    { name: "RequiredRegistry", path: "components/forms/RequiredRegistry.tsx", purpose: "Zählt Pflichtfelder pro Abschnitt, damit Kopf und Zusammenfassung sie kennen.", rules: ["F-01"] },
    { name: "SubRows", path: "components/forms/SubRows.tsx", purpose: "Unterzeilen sichtbar innerhalb ihres Blocks.", rules: ["F-07"] },

    // Inputs
    { name: "Checkbox", path: "components/inputs/Checkbox.tsx", purpose: "Ja/Nein, das mit dem Formular gespeichert wird, auch mit „teilweise“.", rules: ["E-07"] },
    { name: "DateInput", path: "components/inputs/DateInput.tsx", purpose: "Datum als TT.MM.JJJJ mit Abkürzungen, Wochentag und Kalender per Tastatur.", rules: ["E-01", "E-04", "E-05"] },
    { name: "FileDrop", path: "components/inputs/FileDrop.tsx", purpose: "Dateien ablegen oder wählen, mit Vorschau, Fortschritt und Grund pro Datei.", rules: ["E-03", "E-10"] },
    { name: "NumberInput", path: "components/inputs/NumberInput.tsx", purpose: "Zahl und Geldbetrag mit Einheit im Feld, grosszügig gelesen und kanonisch gezeigt.", rules: ["E-01", "E-02", "E-03", "E-04", "E-06"] },
    { name: "RadioGroup", path: "components/inputs/RadioGroup.tsx", purpose: "Zwei bis fünf Möglichkeiten sichtbar, als Liste oder Segmente.", rules: ["E-08"] },
    { name: "RecordPicker", path: "components/inputs/RecordPicker.tsx", purpose: "Verknüpfung zu einem Datensatz: suchen, zuletzt benutzt, neu anlegen, Link.", rules: ["E-09", "N-08"] },
    { name: "Switch", path: "components/inputs/Switch.tsx", purpose: "Einstellung, die sofort gilt.", rules: ["E-07"] },
    { name: "field", path: "components/inputs/field.tsx", purpose: "Gemeinsame Hülle der Eingabefelder: Rahmen, Einheit, Lesen beim Verlassen, Grund bei Fehlern.", rules: ["E-02", "E-04"] },

    // Navigation
    { name: "AppShell", path: "components/nav/AppShell.tsx", purpose: "App-Rahmen aus Kopf, Seitenleiste und Inhalt; die Leiste klappt zu Icons ein.", rules: ["N-12"] },
    { name: "Breadcrumb", path: "components/nav/Breadcrumb.tsx", purpose: "Pfad nach Zugehörigkeit, nicht nach Klickgeschichte.", rules: ["N-01"] },
    { name: "GlobalSearch", path: "components/nav/GlobalSearch.tsx", purpose: "Suche über alle Objekte, exakte Nummer zuerst.", rules: ["N-06", "N-07"] },
    { name: "NavLink", path: "components/nav/NavLink.tsx", purpose: "Der Link der App; das Kit bindet keinen Router fest ein.", rules: ["N-08"] },
    { name: "PageHeader", path: "components/nav/PageHeader.tsx", purpose: "Seitenkopf: Pfad, Titel, Status, Hauptaktion und Blättern.", rules: ["N-01", "N-03", "N-04", "N-05"] },
    { name: "PageTabs", path: "components/nav/PageTabs.tsx", purpose: "Unterseiten eines Objekts als Links mit Unterstrich.", rules: ["N-11"] },
    { name: "RecordPager", path: "components/nav/RecordPager.tsx", purpose: "Vorheriger und nächster Datensatz aus der Liste, aus der man kam.", rules: ["N-04"] },
    { name: "Sidebar", path: "components/nav/Sidebar.tsx", purpose: "Hauptmenü: ein Eintrag pro Liste, nach Häufigkeit gegliedert.", rules: ["N-02", "N-09", "N-10", "N-12"] },
    { name: "ViewFilter", path: "components/nav/ViewFilter.tsx", purpose: "Ansichten einer Liste als Umschalter mit Anzahl.", rules: ["N-09", "N-11"] },

    // Lists & tables
    { name: "ActionMenu", path: "components/table/ActionMenu.tsx", purpose: "Menü „…“ für die selteneren Aktionen, auch als Statusmenü verwendbar.", rules: ["L-11", "G-07"] },
    { name: "BulkBar", path: "components/table/BulkBar.tsx", purpose: "Aktionen für mehrere ausgewählte Zeilen.", rules: ["L-10"] },
    { name: "DataTable", path: "components/table/DataTable.tsx", purpose: "Dichte Tabelle mit Kennung, Sortierung, Laden, Tastatur und Auswahl.", rules: ["L-01", "L-02", "L-04", "L-06", "L-08", "L-09", "L-10", "L-11"] },
    { name: "EmptyState", path: "components/table/EmptyState.tsx", purpose: "Leere Liste mit Grund und nächstem Schritt.", rules: ["L-07"] },
    { name: "FilterBar", path: "components/table/FilterBar.tsx", purpose: "Aktive Filter als Chips und die Anzahl immer sichtbar.", rules: ["L-05", "L-12"] },
    { name: "Pagination", path: "components/table/Pagination.tsx", purpose: "Bereich, Blättern und Seitengrösse.", rules: ["L-12"] },

    // Record page
    { name: "AttachmentGallery", path: "components/record/AttachmentGallery.tsx", purpose: "Bilder als Vorschau, gross im Dialog und mit Pfeiltasten blätterbar.", rules: ["D-09"] },
    { name: "CopyButton", path: "components/record/CopyButton.tsx", purpose: "Kopiert eine Kennung mit einem Klick und sagt es an derselben Stelle.", rules: ["D-05"] },
    { name: "InlineEdit", path: "components/record/InlineEdit.tsx", purpose: "Eine Angabe an Ort und Stelle ändern, mit „Speichert …“ und Fehler am Feld.", rules: ["D-04", "D-07"] },
    { name: "KeyFacts", path: "components/record/KeyFacts.tsx", purpose: "Höchstens vier Kennzahlen mit Einordnung unter dem Kopf.", rules: ["D-02"] },
    { name: "PropertyList", path: "components/record/PropertyList.tsx", purpose: "Eigenschaften als Beschriftung und Wert; leere Werte sagen, was fehlt.", rules: ["D-03", "D-04"] },
    { name: "RecordLayout", path: "components/record/RecordLayout.tsx", purpose: "Inhalt links, Eigenschaften rechts; schmal die Eigenschaften zuerst.", rules: ["D-01"] },
    { name: "RecordMeta", path: "components/record/RecordMeta.tsx", purpose: "Wer hat wann angelegt und geändert, mit Link zum Verlauf.", rules: ["D-10"] },
    { name: "RelatedList", path: "components/record/RelatedList.tsx", purpose: "Zugehörige Datensätze mit Anzahl, „Alle N anzeigen“ und Aktion bei leer.", rules: ["D-09"] },

    // Status & lifecycle
    { name: "ActivityLog", path: "components/status/ActivityLog.tsx", purpose: "Verlauf in Sätzen, gruppiert und filterbar.", rules: ["S-09", "S-11", "S-12"] },
    { name: "ConfirmDialog", path: "components/status/ConfirmDialog.tsx", purpose: "Rückfrage vor endgültigen Schritten mit Folgen und optionalem Grund.", rules: ["S-06"] },
    { name: "LockedNotice", path: "components/status/LockedNotice.tsx", purpose: "Sagt, warum ein Datensatz gesperrt ist und wie man zurückkommt.", rules: ["S-08"] },
    { name: "RouteTimeline", path: "components/status/RouteTimeline.tsx", purpose: "Weg durch die Stationen mit Dauer pro Station.", rules: ["S-10"] },
    { name: "ScanField", path: "components/status/ScanField.tsx", purpose: "Scan-Feld für Hand-Scanner mit eindeutiger Rückmeldung.", rules: ["S-07"] },
    { name: "StatusBadge", path: "components/status/StatusBadge.tsx", purpose: "Status als Wort und Form, mit „seit …“ und Warnung bei zu langer Dauer.", rules: ["S-01", "S-02", "S-03"] },
    { name: "StatusMenu", path: "components/status/StatusMenu.tsx", purpose: "Status als Knopf, dessen Menü nur erlaubte Schritte anbietet.", rules: ["S-05"] },
    { name: "UndoNotice", path: "components/status/UndoNotice.tsx", purpose: "Meldung mit „Rückgängig“ für ein paar Sekunden.", rules: ["S-06"] },

    // Workshop
    { name: "CameraScanner", path: "components/workshop/CameraScanner.tsx", purpose: "Kamera als Seite mit Zielrahmen und Ersatz-Eingabe.", rules: ["W-02", "W-04"] },
    { name: "HereList", path: "components/workshop/HereList.tsx", purpose: "Was jetzt an der Station liegt, längste zuerst, mit Richtzeit.", rules: ["W-08", "S-03"] },
    { name: "ScanBanner", path: "components/workshop/ScanBanner.tsx", purpose: "Grosse Rückmeldung EIN/AUS/FEHLER mit Ton und Weg zurück.", rules: ["W-04", "W-06"] },
    { name: "SlipCard", path: "components/workshop/SlipCard.tsx", purpose: "Das Nötigste zum Zettel, aufgebaut wie der Zettel.", rules: ["W-05"] },
    { name: "StationHeader", path: "components/workshop/StationHeader.tsx", purpose: "Station gross mit Weg, Ton, Verbindung und bewusstem Wechsel.", rules: ["W-01", "W-07"] },
]
