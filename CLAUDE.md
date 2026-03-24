# Tech Warrior Online — Claude Instructions

This file is read automatically by Claude Code at the start of every session.
It defines architecture, conventions, and standards for this project.

---

## 1. Project Overview

Browser-based top-down mech shooter built with **Phaser 3.60.0**. Players pick a chassis,
build a loadout in the Hangar, and deploy into wave-based combat.

### Game Modes

`_gameMode` is set at game start and read throughout the codebase to branch behavior.
Never compare against the display strings — always use the internal key strings
(`'simulation'`, `'campaign'`, `'pvp'`). See OVERVIEW.md for the full mode table.

### Always Do This at Session Start

1. Read `OVERVIEW.md` before touching any code
2. Read `CHANGELOG.md` to understand what changed recently and confirm the current version
3. If the session touches `css/`, `js/menus.js`, or the loadout screen: also read `UI_CONVENTIONS.md`
4. After making any changes, update both `OVERVIEW.md` (current state) and `CHANGELOG.md`
   (what changed, with new version number)
5. Keep CHANGELOG.md to the 10 most recent version entries. After writing
   a new changelog entry, count the total number of version entries
   (each starts with "## v"). If there are more than 10, delete the oldest
   entries until only 10 remain. Do not archive — just delete. No separate
   archive file.

Version numbers use `v1.0, v1.1 … v5.90 …` format. Every session that changes code gets
a version bump. The version must be visible somewhere in the game UI.

Maximum 10 entries: After writing a new entry, if CHANGELOG.md contains
more than 10 version entries, delete the oldest ones immediately. Count
before ending the session.

---

## 2. Key Architecture Rules

These are hard rules. Breaking any of them causes runtime crashes or silently wrong behavior.

### Slot key distinction — never mix these up

`loadout`, `_equipped`, and garage dropdown IDs each use different key sets.
See the full slot key table in OVERVIEW.md (Naming Conventions section).
Critical: `loadout.shld` (not `shield`), `_equipped.shield` (not `shld`).

### Phaser groups — never destroy them

`bullets`, `enemyBullets`, `enemies`, `coverObjects` are created once in `create()` and
survive every deploy/death/respawn. Only call `.clear(true, true)` on their children.
**Never call `.destroy()` on the groups themselves.**

### Cover object origins

Cover uses `setOrigin(0,0)` — `c.x` and `c.y` are the **top-left corner**, not the center.
Always use `c.coverCX` / `c.coverCY` for center-based distance checks and LOS raycasting.

### Player visual split

- `player` — invisible physics rectangle. Rotates with WASD movement direction.
- `torso` — visual container. Rotates toward mouse cursor each frame in `syncVisuals()`.

Enemy equivalent: `e.visuals` (faces movement) and `e.torso` (aims at player).
Always sync **both**: `e.visuals.setPosition(e.x, e.y)` AND `e.torso.setPosition(e.x, e.y)`.

### External function guards

All calls to functions defined in external JS files must use typeof guards:
```javascript
if (typeof spawnSpecialEnemy === 'function') spawnSpecialEnemy(scene, typeKey);
if (typeof shouldEndRound === 'function' && shouldEndRound()) { ... }
```
This prevents crashes when a file fails to load.

### `_arenaState` — mutate, never reassign

`_arenaState` is exported from `arena-objectives.js`. Always mutate its properties:
```javascript
_arenaState.currentArena = 'pit';      // ✓ correct
_arenaState = { currentArena: 'pit' }; // ✗ breaks the reference
```

### Campaign enemy scaling

Never use raw `_round` for campaign enemy HP or speed. Always use:
```javascript
const _effectiveRound = (window._activeCampaignConfig?.enemyLevel) || _round;
```

### Round flow — extraction is required

Rounds do **not** end when enemies die. The full flow is:
```
all enemies dead → _spawnExtractionPoint() → player presses E in zone
  → _triggerExtraction() → heal → showPerkMenu(next) → startRound(next)
```
`_roundActive` and `_extractionActive` must stay in sync. Check both before starting logic.

### `_roundClearing` blocks `update()`

`update()` returns early when `_roundClearing === true` (perk menu, equip prompt).
Never start game logic during this window.

### Boss HP bar is DOM-based

The boss HP bar is not a Phaser object — it is DOM divs. Pattern for every boss:
- `_addBossHPBar(scene, e, color, name)` on spawn
- `_updateBossHPBar(e)` each frame
- `_hideBossHPBar()` inside `e._onDestroy` — **every boss must have `_onDestroy`**

### Swarm boss exception

`e._isSwarmUnit === true` means damage goes to `e._swarmState.hp`, not `e.health`.
Check `window._activeSwarm` before standard damage logic.

### Two-handed weapons

`siege` and `chain` lock both arm slots to the same key. When equipped: `loadout.L === loadout.R`.
Weight is counted once. Medium/Heavy only — Light chassis cannot equip 2H weapons.
This is **not** dual-wield. Dual-wield is Light chassis only, same weapon in both arms.
2H weapons (`siege`, `chain`) cannot drop as loot — the equip system sets one arm at a time.

### DO NOT list

1. Do not use `c.x / c.y` for cover center — use `c.coverCX / c.coverCY`
2. Do not destroy `bullets`, `enemyBullets`, `enemies`, or `coverObjects` groups — only `.clear(true, true)` their children
3. Do not start game logic when `_roundClearing === true`
4. Do not use `loadout.shield` — the field is `loadout.shld`
5. Do not use raw `_round` for campaign enemy scaling — use `_activeCampaignConfig?.enemyLevel || _round`
6. Do not omit `_hideBossHPBar()` from `e._onDestroy`
7. Do not reassign `_arenaState` — always mutate properties in place
8. Do not update only `e.visuals` or only `e.torso` — always sync both
9. Do not call external JS functions without a `typeof` guard
10. Do not apply the same damage multiplier in two places (double-dipping)
11. Do not assume rounds end when enemies die — extraction step comes first
12. Do not check `!player` without also checking `!player.active` (destroyed ≠ null)
13. Do not add cache-busting `?v=X.XX` query strings to `<link>` or `<script>` tags — they were deliberately removed in v5.87

---

## 3. CSS Conventions

### Font rule

**Every UI element uses `Courier New`, monospace.** There is no sans-serif or display font anywhere in the game. Always use the token:
```css
font-family: var(--font-mono); /* 'Courier New', monospace */
```
Do not hardcode the font string — use the variable.

### Design token system

All colors, borders, and surface fills use the `--sci-*` custom properties defined in `css/base.css`.
**Never hardcode a hex value that duplicates one of these tokens.**
See `css/base.css` for token values and OVERVIEW.md for the full token reference.

### Section comment pattern

```css
/* ============================================================
   SECTION NAME
   ============================================================ */

/* --- Sub-section Name --- */
```

### Class naming

- CSS classes: `kebab-case` — `.weapon-row`, `.perk-card`, `.lo-slot`
- CSS custom properties: `--kebab-case` — `--sci-cyan`, `--font-mono`
- HTML IDs: `camelCase` — `id="roundHud"`, `id="statsOverlay"`

### Property ordering

CSS properties are alphabetical within each rule block.

### Rarity colors

Rarity colors come from `RARITY_DEFS` in `js/loot-system.js`. Do not hardcode them in CSS.
The rarity `colorStr` property is applied inline from JS when rendering item cards.

---

## 4. UI Architecture

### Single render entry point

**`populateLoadout()`** in `js/menus.js` is the only function that renders the loadout overlay.
Do not call any of its internal sub-renderers (`_renderHullBars`, `_renderGearBonusesPanel`,
`_renderActivePerksPanel`, `_renderWeaponBar`) directly from outside `js/menus.js`.
To refresh the overlay, call `populateLoadout()` and nothing else.

### Shared `.lo-slot` class

`.lo-slot` is used for **both** the 8 equipped gear slots on the mech silhouette **and** the
backpack grid cells. It is defined once in `css/garage.css`. Any change to `.lo-slot` base
styles affects both contexts simultaneously. Use modifier classes or inline styles for
context-specific overrides.

### Hover card system

Hover cards appear on `mouseenter` for both doll slots and backpack cells.
They are positioned with fixed coordinates and edge-detection to stay on screen.

- Single item: `_showSlotHover(item, el)` — calls `_buildHoverHtml(item, compareItem)`
- Comparison: when a backpack item has an equipped counterpart, the card shows two columns
  side by side (Backpack | Equipped) with a diff section below, built by `_buildSingleCardHtml()`
- Hide: `_hideSlotHover()` on `mouseleave` and on `mousedown` (so the card disappears on drag)

### Code style

```javascript
// ═══════════ SECTION NAME ═══════════       ← major JS sections
// ── Sub-section name ─────────────────────── ← sub-sections
```
```html
<!-- ═══ Section Name ═══ -->
```

| Type | Convention | Example |
|---|---|---|
| CSS classes | `kebab-case` | `.weapon-row`, `.perk-card` |
| HTML IDs | `camelCase` | `id="roundHud"`, `id="bossFill"` |
| JS variables | `camelCase` | `let reloadL`, `let _roundKills` |
| JS constants | `SCREAMING_SNAKE` | `const CHASSIS`, `const RARITY_DEFS` |
| JS functions | `camelCase` verb prefix | `renderGarage()`, `spawnEnemy()` |
| Private vars | underscore prefix | `_perkState`, `_roundActive` |
| Render functions | `render` prefix | `renderGarage()`, `renderStats()` |
| Event handlers | `on` prefix | `onTabClick()`, `onKeyDown()` |

Formatting: 2-space indent everywhere. Single quotes in JS, double quotes in HTML attributes.
Opening braces on the same line. Trailing commas in multi-line objects/arrays.

---

## 5. Display Convention Rules

### Inverted stats — negative is better

Some stats improve as the value goes more negative (e.g. `reloadPct`, `modCdPct`).
Render these with **reversed** color logic and a `+` prefix rather than `−`.
Use the `_hoverInvertedStats` Set in `js/menus.js` — it is the single source of truth.
Do not hard-code inversion logic elsewhere. See OVERVIEW.md for the full stat key list.

### Slot label naming

**Do not revert backpack weapon cards to "L ARM" / "R ARM"** — they intentionally use "WEAPON".
See OVERVIEW.md (Display Conventions) for the full slot label mapping table.

### Rarity colors

Rarity color strings come from `RARITY_DEFS[rarity].colorStr` in `js/loot-system.js`.
Apply them as inline `color:` or `border-color:` — never hardcode rarity hex values in CSS.
See OVERVIEW.md (Display Conventions) for the rarity-to-color reference and color meanings table.
