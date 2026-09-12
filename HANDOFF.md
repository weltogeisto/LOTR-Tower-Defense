# HANDOFF — LOTR Tower Defense → Claude

> **For Claude (or any successor):** read this first, then `README.md`, then open PR #9. Reply to Hendrik in German unless he writes English. Direct Stabschef (Grok Bot) with concrete next orders — he executes via GitHub MCP / local static serve; **Cursor Cloud Agents are unavailable on the current plan**.

Last updated: 2026-09-12 (Stabschef / Hendrik).

---

## 1. What Hendrik wants

| Goal | Detail |
|------|--------|
| Product | Elevate https://github.com/weltogeisto/LOTR-Tower-Defense into a free, browser TD that can later be a **minigame inside Fellowship OS** |
| Parent app | https://github.com/weltogeisto/jga-fellowship-os — PWA „Reiter der Riddermark“ (JGA Holstein→DK, Bräutigam Jan, Tolkien-DE) |
| Quality bar | He asked for **SOTA**. After first visual pass he rated **graphics 3/10** and was disappointed (“design still the same”). |
| Constraints | **Free forever** (no paid APIs/assets/keys). Static / GitHub Pages friendly. Fan homage, not official LotR product. |
| Process now | **Claude anleitet, Stabschef führt aus.** Do not merge PR #9 without Hendrik’s OK. |

### Explicit user feedback (verbatim sense)
- “absolutely grandiose SOTA level, naturally free”
- “as many JGA OS elements as possible; maybe later a minigame in jga os”
- “Graphics is 3/10”
- “Give Claude a handover, he will guide you then”

---

## 2. Current git state

| Item | Value |
|------|--------|
| Repo | `weltogeisto/LOTR-Tower-Defense` |
| PR | https://github.com/weltogeisto/LOTR-Tower-Defense/pull/9 |
| Branch | `feat/jga-os-minigame-sota` → `main` |
| Tip (at handoff) | `6f9a5b8f94075488238c999c690ff4b9b60851f2` |
| Merge | **Not merged.** Wait for Hendrik. |
| Cloud Agents | **Blocked** (“Upgrade to Pro”). Do not assume they work. |
| GitHub connector | Connected (`user-Github`). Stabschef + GitHub-Bot can use MCP. |

`main` still has the old single-file light `index.html` toy game. All JGA/SOTA work is on the PR branch.

---

## 3. What already works (keep these)

### JGA OS product hooks (content OK per GitHub review)
- DE Tolkien-flavoured UI: Ruhm, Ränge (Späher→Kriegsfürst), Siegelrune **save slots**, Gefährte, Reiter-Flair (Jan banner etc.)
- Schätze economy naming, Rotes Buch event log, Horn + quiet mode, mute persistence
- Dark shell overlays (start / settings / pause / victory / defeat)
- Embed: `window.JgaTdBridge` + `postMessage` (`source: jga-td` ↔ `jga-os`) — see README
- Static free stack, localStorage meta

### Visual (partial — user still rates 3/10)
- Dark night canvas palette (`MARK_PALETTE`: nightDeep, parchment, pathGlow, beacons, hit flashes, floating damage)
- Old light tokens (`#eef3f8`, white canvas toy look) removed from gameplay chrome
- Screenshots after visual pass: dark olive grass, torchlit path, orcs, artillery with range ring — better than white toy, **not** SOTA

### Engineering debt in the loader
Live path: `js/game-core.js` tries plain `js/core/r00…r20.js.txt` → `p00…p11.js.txt` → inflates `js/packed-sota/b00…b04.txt` (gzip+b64).
- **Runtime depends on packed-sota inflate** (dark core is correct when inflate works).
- Plain SoT on GitHub is **incomplete** (`r06–r19`, many `p*` missing) — fragile for edits.
- Past incident: base64/CRC typos broke `DecompressionStream` (game blank). Prefer **one plain `game-core.js` / modular sources** over gzip packs for the next graphics push.

---

## 4. Why graphics is still ~3/10 (honest)

1. Still **2D canvas primitives + emoji** for towers — not custom silhouettes / atlas / shader look.
2. Map reads as “darkened old TD”, not a authored art-directed scene.
3. UI chrome is premium-ish; **battlefield craft** lags (particles/FX limited).
4. No WebGL/WebGPU, no Spine/sprite pipeline, no lighting beyond simple fills/glows.
5. Architecture optimized for MCP file-size limits (packing) at the cost of editable art code.

**Do not claim SOTA in README/PR until Hendrik re-rates.**

---

## 5. Recommended next orders for Claude → Stabschef

Prioritize **one vertical graphics leap**, not more meta labels:

1. **Unpack SoT:** Ship readable modular canvas code on the branch; delete or demote packed-sota as fallback only after plain load works.
2. **Art system:** sprite/atlas or crisp vector draw layer for towers, enemies, projectiles; remove emoji as primary art.
3. **Battlefield:** parallax/fog, authored path materials, keep/fortress landmark, readable unit scale, juice (hit stop, trails, death FX) with `prefers-reduced-motion` respect.
4. **HUD in-canvas or integrated:** fewer HTML selects; build bar that feels game-native.
5. **Proof:** local static serve + screenshots of start + combat; ask Hendrik for a new graphics score.
6. Only then deepen gameplay / Fellowship iframe wiring.

Optional later: iframe mount path inside `jga-fellowship-os` (separate PR there).

---

## 6. How Stabschef can execute (constraints)

- **Can:** GitHub MCP (`user-Github`) create_branch / push_files / create_or_update_file / PRs; curl raw files to `/workspace`; `python3 -m http.server`; computerUse screenshots; coordinate GitHub-Bot for reviews.
- **Cannot (currently):** Cursor Cloud Agents; assume Pro.
- **Must not:** Merge without Hendrik; add paid deps; paste secrets into repo; claim official Tolkien rights.

When Claude issues orders, phrase them as: goal, files/areas, acceptance (screenshots + “graphics feel X/10”), non-goals.

---

## 7. Local playtest

```bash
# From a tree at PR tip SHA (download via raw/API — avoid git clone if following Stabschef policy)
python3 -m http.server 8080
# → http://127.0.0.1:8080
```

Hard-refresh. Siegelrune + name → In den Kampf → Welle starten → place tower.

Screenshot refs (prior runs, may be stale):
- `/workspace/lotr-td-v2/shots/01-start.png`
- `/workspace/lotr-td-v2/shots/02-gameplay.png`
- `/workspace/lotr-td-v2/shots/03-settings.png`

---

## 8. Related agents (Grok Bot sidebar)

| Agent | Role |
|-------|------|
| **Stabschef** | Coordinator; executes Claude’s plan; talks to Hendrik |
| **GitHub** | PR review / CI / Diff (already REQUEST_CHANGES then OK on load fixes) |
| **Vercel / Google** | Not needed for this static TD yet |
| **Claude** | External (user’s Claude) — **architect / Anleitung** for next graphics leap |

---

## 9. Success criteria for the next pass

- Hendrik can open the PR branch and immediately feel a **graphics jump** (target: clearly above 3/10 without debate).
- Plain editable canvas source on GitHub (no CRC roulette).
- JGA hooks still intact (Ruhm/Ränge/Siegelrune/Horn/Bridge).
- Still free + static.
- Fresh screenshots attached in chat / PR comment.
- Still **no merge** until Hendrik says so.

---

## 10. Message to Claude (starter)

> Hendrik rated current graphics 3/10. Product meta/JGA hooks are fine; battlefield art is not. Plan a concrete graphics SoT unpack + art-system rewrite on `feat/jga-os-minigame-sota`. Instruct Stabschef step-by-step; he has GitHub MCP and can ship commits + screenshots. Cloud Agents are off-plan. Do not merge.
