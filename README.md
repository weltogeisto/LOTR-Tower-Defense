# Reiter der Riddermark — Turmverteidigung

JGA-OS-Minispiel (Fan-Hommage) für die Gefährten der Reise **Holstein → Dänemark**.
Thematisch verwandt mit [Fellowship OS](https://github.com/weltogeisto/jga-fellowship-os) („Reiter der Riddermark“).

> **Kein offizielles Tolkien-/Herr-der-Ringe-Produkt.** Rein private Hommage für den Junggesellenabschied.

## Vorher / Nachher

| Vorher | Nachher |
|--------|---------|
| Englische UI, helles Blau | Dunkles Mark-Theme, Tolkien-flavoured **Deutsch** |
| Score + localStorage Highscore | **Ruhm**, **Ränge** (Späher → … → Kriegsfürst), **Siegelrune**-Slot |
| Kein Meta-Log | **Rotes Buch** (letzte Heldentaten) |
| Einfacher Audio-Toggle | **Horn**-Fanfaren + ruhiger Modus + Lautstärke |
| Sofortiger Start | Startbildschirm, Einstellungen, mobile Touch-Ziele |
| Standalone only | **`window.JgaTdBridge`** + `postMessage` für Fellowship-OS-Embed |

## Spielen

1. Seite öffnen (GitHub Pages oder lokal).
2. **Siegelrune** + Gefährtenname wählen (optional Reiter-Flair für Jan).
3. **In den Kampf** — Banner (idealerweise Rohan), Türme bauen, Wellen halten.
4. Ruhm sammeln, Rang aufsteigen, Taten im Roten Buch lesen.

### Steuerung

- **Bauen** → freies Feld tippen (Pfad nicht blockieren)
- Turm tippen → aufrüsten (Schätze)
- **Verkauf** → 60 % Rückerstattung
- **Held versetzen** → Held tippen, dann Zielfeld
- **Welle starten** / Tempo 1×–2× / Halt
- Einstellungen: Lautstärke, Klang, ruhiges Horn, weniger Bewegung

## Lokal starten

Statische Dateien — kein Build, keine Keys:

```bash
# Beliebiger Static Server, z. B.:
python3 -m http.server 8080
# → http://localhost:8080
```

Oder Ordner einfach über GitHub Pages deployen (Workflow unter `.github/workflows/`).

## Struktur

```
index.html          # Shell + DE-UI + Overlays
css/theme.css       # Dunkles Fellowship-Familien-Theme
js/storage.js       # Ruhm, Ränge, Siegelrune, Settings, Rotes Buch
js/bridge.js        # Embed-Bridge + postMessage-Protokoll
js/horn.js          # Horn-Juice (WebAudio)
js/game.js          # DecompressionStream inflate (valid gzip CRC)
js/packed/          # gzip+base64 canvas core (repacked; mute+slots fixes)
js/boot.js          # Startbildschirm / Settings-Wiring
```

## Embed in Fellowship OS (iframe)

Standalone funktioniert **ohne** Parent. Für spätere Integration:

```html
<iframe
  id="td"
  src="https://<pages-host>/LOTR-Tower-Defense/"
  title="Reiter der Riddermark TD"
  allow="autoplay"
></iframe>
```

### Protokoll

**Child → Parent** (`event.data.source === 'jga-td'`):

| type | payload (Auszug) |
|------|------------------|
| `ready` | `{ version, title }` |
| `start` | `{ runId, gefaehrte, siegelrune, riderId, faction }` |
| `pause` | `{ paused }` |
| `wave` | `{ wave, score, ruhmRun, lives, gold }` |
| `score` | laufender Stand |
| `end` | `{ victory, wave, score, ruhmEarned, totalRuhm, rank }` |

**Parent → Child** (`source: 'jga-os'`, `type: 'cmd'`):

`pause` | `resume` | `start` | `mute` | `unmute` | `getState`

Beispiel:

```js
iframe.contentWindow.postMessage({ source: 'jga-os', type: 'cmd', cmd: 'pause' }, '*');

window.addEventListener('message', (ev) => {
  if (!ev.data || ev.data.source !== 'jga-td') return;
  if (ev.data.type === 'end') {
    // Ruhm an Fellowship OS / Schatzkammer weiterreichen
    console.log(ev.data.payload.ruhmEarned, ev.data.payload.rank);
  }
});
```

Zusätzlich: `window.JgaTdBridge` und `window.JgaTdGame` im iframe-Kontext für direkte Hooks.

## Technik

- Rein statisch (GitHub-Pages-tauglich)
- Free stack only — keine bezahlten APIs/SDKs/Keys
- `localStorage` für Meta-Fortschritt (lokal; Siegelrune als Slot-Identität)
- Partikel-Cap + Frame-Clamp für performanten Loop

## Lizenz / Ton

Private Fan-/JGA-Hommage. Namen und Motive sind Tolkien-inspiriert und dienen dem JGA-Produktfamilien-Feeling mit Fellowship OS — ohne Anspruch auf offizielle Rechte.
