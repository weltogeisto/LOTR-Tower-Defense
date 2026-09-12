# ORDERS — Grafik-Sprung `feat/jga-os-minigame-sota`

> Antwort auf HANDOFF.md. Für Stabschef. Reihenfolge ist bindend — jeder Befehl hat ein Abnahmekriterium.
> Stand: PR #9 @ `7d6cf00`, lokal verifiziert (statischer Serve + Headless-Chromium-Screenshots, 1440×900 @ DPR 2).

---

## Befund

Das Schlachtfeld rendert als **Tabelle mit Aufklebern**. Das ist keine Meinung, das steht im Code:

| Symptom im Bild | Ursache im Code |
|---|---|
| Alles wirkt weich/unscharf | `resize()` setzt `cvs.width = W` ohne `devicePixelRatio` — auf jedem Retina-Screen wird hochskaliert |
| 560 sichtbare Zellen | `ctx.strokeRect()` pro Kachel in der Tile-Schleife (`gridLine`) |
| Weg = Klebeband | Pfad wird als Folge von `fillRect(tile,tile)` gezeichnet, plus flacher `pathGlow`-Rechteck-Overlay |
| Disney-Burg mit roten Dächern, Fliegenpilze, Zelte, Vampir | `🏰` / `ENEMY_EMOJIS` / `decorations[].emoji` — Emoji sind die primäre Kunst |
| Bildrauschen | ~60 Deko-Props gleichverteilt gestreut, ohne Komposition, in voller Deko-Größe |
| „TOR" / „FESTE" als Kästchen | `ctx.fillText('TOR', …)` in Segoe UI auf einer Glow-Kachel |
| Türme unlesbar | Kreis `radius = tile*0.38` + Emoji, gleiche visuelle Masse wie ein Pilz daneben |

Dazu zwei Fakten fürs Protokoll: **35 × 404 pro Seitenaufruf** (`r06–r19`, `p01–p10`, `game-core.source.js` existiert nicht — die Datei im Repo heißt `game-core.source.q0a.js`), und der Livepfad ist der gzip+Base64-Block.

**Kernsatz:** Emoji tragen fremde Kunstrichtung mit sich — eigene Farben, eigenes Licht, eigene Betriebssystem-Version. Solange Emoji die Hauptkunst sind, ist jede Palette Kosmetik. Das ist der 3/10.

---

## Befehl 0 — SoT entpacken (Blocker, keine sichtbare Änderung)

**Fakt:** Die vollständige lesbare Quelle existiert bereits — der Inflate von `packed-sota/b00..b04` ergibt **113 039 Bytes / 3331 Zeilen** valides JS. Es muss nichts rekonstruiert werden.

- Zerlegen **nach Verantwortung, nicht nach Byte-Offset** (das war der Fehler bei `r*`/`p*` — Schnitte mitten im Kommentar):
  `js/core/config.js` (Palette, TOWER_DATA, ENEMY_DATA, MAPS) · `pathfinding.js` · `entities.js` · `waves.js` · `render.js` · `ui.js` · `main.js` — je 10–20 KB.
- `index.html` lädt sie als schlichte `<script>`-Tags in Reihenfolge. Kein `fetch`, kein Inflate.
- Löschen: `js/game-core.js`, `js/core/r*.js.txt`, `js/core/p*.js.txt`, `js/packed-sota/`.
- **Abnahme:** Konsole zeigt 0 Fehler und 0 404. Screenshot identisch zu vorher. `git diff` lesbar.

Begründung: Kunst entsteht durch Zeichnen–Ansehen–Korrigieren. Mit einem Base64-Repack pro Iteration gibt es keine Iteration.

---

## Befehl 1 — Pixelschärfe (≈10 Zeilen, bester Effekt pro Zeile)

```js
function resize(){
  const wrap = document.getElementById('game-wrap');
  const dpr  = Math.min(window.devicePixelRatio || 1, 2);
  tile = Math.floor(wrap.clientWidth / COLS);      // ganzzahlig → keine Nähte
  const W = tile * COLS, H = tile * ROWS;
  cvs.style.width = W + 'px';  cvs.style.height = H + 'px';
  cvs.width = Math.round(W*dpr); cvs.height = Math.round(H*dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
```
Achtung: alle `cvs.width`-Nutzungen im Zeichencode (`draw()`, `drawBattlefieldAtmosphere`) auf die CSS-Maße umstellen.

**Abnahme:** Screenshot bei DPR 2, Kanten und Text scharf.

---

## Befehl 2 — Emoji raus, Silhouetten rein *(der eigentliche Hebel)*

Neue Datei `js/art/shapes.js`: pro Turm-, Gegner- und Prop-Typ eine Funktion `draw(ctx, size, t)`, die eine **Silhouette in Palettenfarben** zeichnet. Beim Boot einmal in Offscreen-Canvases der Größe `tile×dpr` backen, im Frame nur `drawImage`. Kosten pro Frame ≈ null. Kein Asset, kein Netz, weiterhin frei und statisch.

Gestaltungsregeln, nicht verhandelbar:
- **Silhouette zuerst.** Jede Einheit muss als schwarze Form bei 32 px erkennbar sein. Erst Form, dann Details.
- Türme = **Architektur** (Turmstumpf, Torbogen, Balliste). Gegner = **Kreatur-Umriss** mit Fraktionsakzent. Keine Gesichter.
- Alles aus `MARK_PALETTE` + max. 4 Fraktionsakzente. Kein reines Weiß. Gesättigtes Rot nur für Schadens-FX.
- Props: max. `0.4 × tile`, entsättigt, mit Kontaktschatten.

**Abnahme:** Screenshot ohne ein einziges Emoji auf dem Canvas. Squint-Test bei 25 % Zoom: Turm, Gegner und Prop bleiben unterscheidbar.

---

## Befehl 3 — Boden wird Ort, nicht Raster

- **Raster weg.** `strokeRect` pro Kachel ersatzlos streichen. Zellen nur im Baumodus zeigen — als weiche abgerundete Fläche unter dem Cursor.
- **Statische Bodenebene.** Terrain, Weg und Props einmal pro Karte in ein Offscreen-Canvas zeichnen, im Frame ein einziges `drawImage`. Das gibt Budget frei, damit der Boden teuer sein darf.
- **Weg als Spline, nicht als Kacheln.** Pfadzellen → geglätteter Polyzug durch die Zellmittelpunkte → drei Striche übereinander: dunkle Basis (`0.8 × tile`), schmaler heller Kern, weiche Außenkante. Diese eine Änderung nimmt den Klebeband-Look.
- **Terrain-Variation.** 2–3 Oktaven Value-Noise auf den Grashelligkeitswert. Ränder dunkler, Umgebung der Feste wärmer. **Eine** Lichtquelle für die ganze Szene: die Feste. Alle Schatten zeigen konsistent von ihr weg.
- **Deko-Disziplin.** Anzahl um ~70 % kürzen und **gruppieren** (Felsen zu zweit/dritt, Bäume als Hain). Nie auf oder neben dem Weg, nie im mittleren Baufeld.

**Abnahme:** Screenshot des leeren Bretts liest sich als Landschaft. Außerhalb des Baumodus kein sichtbares Zellraster.

---

## Befehl 4 — Landmarken und Lesbarkeit

- **TOR** = zerbrochener Torbogen als Silhouette, kaltes Türkis-Licht läuft auf den Weg aus. **FESTE** = echtes mehrfeldriges Bauwerk mit Banner, warmem Licht und Schlagschatten — der visuelle Anker der Szene. Beide ohne Textlabel.
- **Größenhierarchie:** Feste > Türme > Gegner > Props. Gegner bekommen eine Kontaktschatten-Ellipse, damit sie auf dem Boden stehen statt zu schweben.
- **HP-Balken** nur bei Schaden, dünn, abgerundet, ohne schwarzen Kasten, Farbe aus der Palette.

---

## Befehl 5 — Juice (hinter `reducedMotion`)

Mündungsblitz → fliegendes Projektil mit kurzer Spur → Aufschlagfunke. Hit-Stop ~40 ms bei Krit und Boss-Treffer. Tod als Auflösung in Glut, nicht als Emoji-Pop. Bestehenden Screenshake deckeln. Alles respektiert die vorhandene `reducedMotion`-Einstellung.

---

## Befehl 6 — Aus der Seite wird ein Spiel

Aktuell steht das Schlachtfeld hinter ~600 px Kopfzeile, Metaleiste, HUD-Leiste und Steuerleiste — man muss zum Spiel scrollen.

- Canvas nach oben, füllt den sichtbaren Bereich. HUD schwebt in den Ecken darüber.
- Die drei nativen `<select>` ersetzen (Banner / Turm / Karte) — sie sind das lauteste „hier ist ein Webformular"-Signal im Bild. Stattdessen Icon-Kacheln mit Kosten und Kurzinfo.

---

## Befehl 7 — Beweis

Screenshots bei DPR 2: Startbildschirm, leeres Brett, Gefecht. Vorher/Nachher nebeneinander, als Kommentar an PR #9. Dann Hendrik um eine neue Note bitten. **Kein Merge.** Kein „SOTA" in README oder PR-Text, bis die Note steht.

---

## Hebelwirkung, falls die Zeit knapp wird

1. Befehl 2 (Emoji → Silhouetten) — trägt den Sprung allein zur Hälfte
2. Befehl 3 (Raster weg, Weg als Spline) — zweite Hälfte
3. Befehl 1 (DPR) — billigste Zeilen im ganzen Plan
4. Befehl 6 (Layout)

Befehl 0 ist kein Grafikschritt, aber ohne ihn kostet jeder der anderen ein Repack-Risiko.
