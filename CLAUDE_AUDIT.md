# CLAUDE.md Audit — 2026-03-23

---

## Accurate sections

- **Project overview** (description paragraph) — mech shooter, Phaser 3.60.0, three modes, chassis/loadout/deploy loop. Still correct.
- **Always Do This at Session Start** — read OVERVIEW.md, read CHANGELOG.md, update both after changes. Still correct procedure.
- **Code Style Standards** — section comment patterns, naming conventions table, formatting rules (2-space indent, single quotes in JS, alphabetical CSS, trailing commas). All still correct.
- **Architecture Rules → Critical Slot Key Distinction** — `loadout.shld` vs `_equipped.shield` vs garage dropdown IDs. Still correct.
- **Architecture Rules → Phaser Groups — Never Destroy Them** — `bullets`, `enemyBullets`, `enemies`, `coverObjects`. Still correct.
- **Architecture Rules → Cover Object Origins** — `origin(0,0)`, use `c.coverCX`/`c.coverCY`. Still correct.
- **Architecture Rules → Player Visual Split** — `player` (physics) vs `torso` (visual), `e.visuals` / `e.torso` for enemies. Still correct.
- **Architecture Rules → External Function Guards** — `typeof fn === 'function'` before calling cross-file functions. Still correct.
- **Architecture Rules → `_arenaState` — Mutate, Never Reassign** — still correct.
- **Architecture Rules → Campaign Enemy Scaling** — use `_activeCampaignConfig?.enemyLevel || _round`. Still correct.
- **Architecture Rules → Round Flow — Extraction Required** — all enemies dead → extraction zone → E to leave → perk menu → next round. Still correct.
- **Architecture Rules → `_roundClearing` Blocks `update()`** — still correct.
- **Architecture Rules → Boss HP Bar is DOM-Based** — `_addBossHPBar`, `_updateBossHPBar`, `_hideBossHPBar` in `e._onDestroy`. Still correct.
- **Architecture Rules → Swarm Boss Exception** — `e._isSwarmUnit`, `e._swarmState.hp`. Still correct.
- **Architecture Rules → Two-Handed Weapons** — `siege`/`chain` lock both arms, counted once, Medium/Heavy only. Still correct.
- **Key State Globals** — all listed globals are still accurate.
- **Damage Calculation Order** — outgoing and incoming pipelines still correct.
- **HUD Element IDs** — all IDs listed are still present in the DOM.
- **Common Pitfalls #1–12** — all still valid.

---

## Outdated sections

### Section: "File Structure & Load Order"

**What is wrong:**
- `index.html` is described as "Main game shell + all core logic (currently a monolith — being split)". The refactor is **complete**. `index.html` is now a pure HTML shell with no inline `<script>` or `<style>` blocks.
- The file list omits all the new JS and CSS files that now exist: `js/constants.js`, `js/state.js`, `js/utils.js`, `js/audio.js`, `js/mechs.js`, `js/cover.js`, `js/combat.js`, `js/mods.js`, `js/perks.js`, `js/enemies.js`, `js/rounds.js`, `js/hud.js`, `js/garage.js`, `js/menus.js`, `js/events.js`, `js/init.js`, `css/base.css`, `css/hud.css`, `css/garage.css`, `css/menus.css`.
- The load order shown (`loot-system.js → enemy-types.js → arena-objectives.js → campaign-system.js → multiplayer.js → inline <script>`) is wrong and incomplete.

**What is correct:**
Full file list and canonical script load order from OVERVIEW.md:
```
phaser.min.js → constants.js → state.js → utils.js → audio.js → mechs.js → cover.js
→ combat.js → mods.js → perks.js → enemies.js → rounds.js → hud.js → garage.js
→ menus.js → loot-system.js → enemy-types.js → arena-objectives.js
→ campaign-system.js → socket.io.min.js → multiplayer.js → events.js → init.js
```

---

### Section: "Target File Structure (Refactor Goal)"

**What is wrong:**
This entire section is obsolete. The refactor described as a future goal is **already complete**. Presenting it as a goal to work toward is actively misleading — a future session could re-introduce splits that already exist, or create redundant files.

**What is correct:**
Remove or replace this section with a "Current File Structure" section that describes each file's actual role (as OVERVIEW.md already does in detail).

---

### Section: "Key Constants Reference" — INVENTORY_MAX

**What is wrong:**
`INVENTORY_MAX: 30` — this is incorrect.

**What is correct:**
`INVENTORY_MAX = 20` (set in `js/loot-system.js`, changed in v5.83).

---

### Section: "Project Overview" — game mode names

**What is wrong:**
Lists the three modes as "Combat Simulation (roguelike), Campaign (persistent progression), PVP (Socket.IO multiplayer)."

These are partially wrong:
- The roguelike mode is displayed to the user as **"Warzone"** (main menu button label), not "Combat Simulation". Internal `_gameMode` key is still `'simulation'`.
- The multiplayer mode is displayed as **"Multiplayer"** on the main menu. Internal key is `'pvp'`. The PVP matchmaking screen uses "WARZONE" as its screen title heading.

**What is correct:**
| Display name (UI) | Internal `_gameMode` key | Description |
|---|---|---|
| Warzone | `'simulation'` | Roguelike wave-shooter |
| Campaign | `'campaign'` | Persistent XP/levels/missions |
| Multiplayer | `'pvp'` | Socket.IO real-time PVP |

---

## Missing sections

### 1. CSS Design Token System

CLAUDE.md has no mention of the `--sci-*` custom property family defined in `css/base.css`. These tokens are used throughout all four CSS files and must be understood before editing any UI:

| Token | Value / Purpose |
|---|---|
| `--sci-cyan` | `#00d4ff` — primary accent color |
| `--sci-cyan-dim` | `rgba(0,212,255,0.08)` — hover/active background tint |
| `--sci-cyan-border` | `rgba(0,212,255,0.35)` — default border on interactive elements |
| `--sci-cyan-bright` | `rgba(0,212,255,1)` — focused/active border |
| `--sci-red` | `#ff4d6a` — danger/destroyed state |
| `--sci-red-dim` | `rgba(255,77,106,0.08)` — danger background tint |
| `--sci-red-border` | `rgba(255,77,106,0.35)` — danger border |
| `--sci-gold` | `#ffd166` — legendary/unique highlight |
| `--sci-line` | `rgba(255,255,255,0.07)` — subtle dividers and inactive borders |
| `--sci-txt` | `rgba(255,255,255,0.9)` — primary text |
| `--sci-txt2` | `rgba(255,255,255,0.4)` — secondary/muted text |
| `--sci-txt3` | `rgba(255,255,255,0.18)` — near-invisible decorative text |
| `--sci-surface` | `rgba(255,255,255,0.03)` — panel background fill |
| `--font-mono` | `'Courier New', monospace` — universal font for all game UI |

**Rule:** Always use `var(--sci-*)` tokens for colors and `var(--font-mono)` for font-family. Do not hardcode hex values that duplicate these tokens.

---

### 2. Loadout Overlay Architecture

The loadout overlay (`#stats-overlay`) is a three-column layout:

```
[ 220px left col ] [ flex center col ] [ 440px right col ]
  chassis stats      mech silhouette     backpack grid
  HP bars            8 equip slots
  gear bonuses       weapon bar
  active perks
```

- **Single render entry point:** `populateLoadout()` in `js/menus.js` renders the entire overlay. Do not call sub-renders directly.
- **Shared slot class:** `.lo-slot` is used for both the 8 equipped gear slots on the mech silhouette AND the backpack grid cells. CSS changes to `.lo-slot` affect both simultaneously.
- **Backpack size:** 4×5 grid, 20 slots (`INVENTORY_MAX = 20`), each slot 100×100px.

---

### 3. Display Conventions — Inverted Stats

Some stats are "inverted" — a negative value is an improvement. These must be displayed with reversed color logic and a `+` sign prefix:

| Stat key | Display label | Why inverted |
|---|---|---|
| `reloadPct` | Reload Speed % | Negative % = faster reload = better |
| `modCdPct` | Mod Cooldown % | Negative % = shorter cooldown = better |
| `reload` | Reload (raw) | Lower value = faster = better |

**Rule:** In any UI that color-codes or sign-labels these stats, use `_hoverInvertedStats` (a `Set` in `js/menus.js`) to check and invert the green/red logic. Do not hard-code the inversion outside of this set.

---

### 4. Weapon Slot Label Convention

Backpack item cards display the slot category label based on `item.baseType`, using the `_bpSlotNames` map in `js/menus.js`:
- `weapon` → **"WEAPON"** (not "L ARM" or "R ARM")
- `mod_system` → "CPU"
- `aug_system` → "AUGMENT"
- `shield_system` → "DEFENSE"
- `leg_system` → "LEGS"

The equipped doll slots on the mech silhouette still label arm slots as "L ARM" and "R ARM".
The weapon bar at the bottom of the center column uses "L ARM" / "R ARM" labels.

**Do not revert backpack item cards to "L ARM" / "R ARM"** — this was intentionally changed in v5.90.

---

### 5. No Cache-Busting Query Strings

Cache-busting `?v=X.XX` query strings on `<link>` and `<script>` tags were **deliberately removed** in v5.87. Do not add them back.

---

### 6. `window.TW` Namespace

`js/constants.js` defines `window.TW = {}` as the project namespace. Feature files expose public APIs via `window.TW.featureName = { fn1, fn2 }`. This is mentioned only in the now-obsolete "Target File Structure" section and should be documented in a permanent conventions section.
