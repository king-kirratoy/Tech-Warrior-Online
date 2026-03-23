# Tech Warrior Online — Claude Instructions

This file is read automatically by Claude Code at the start of every session.
It defines architecture, conventions, and standards for this project.

---

## 1. Project Overview

Browser-based top-down mech shooter built with **Phaser 3.60.0**. Players pick a chassis,
build a loadout in the Hangar, and deploy into wave-based combat.

**Current version:** v5.90

### Game Modes

| Display name (UI) | Internal `_gameMode` key | Description |
|---|---|---|
| Warzone | `'simulation'` | Roguelike wave-shooter — run-and-die loop, no persistence |
| Campaign | `'campaign'` | Persistent progression — XP, levels, missions, shop, cloud saves |
| Multiplayer | `'pvp'` | Real-time PVP via Socket.IO — the matchmaking screen heading is "WARZONE" |

`_gameMode` is set at game start and read throughout the codebase to branch behavior.
Never compare against the display strings — always use the internal key strings above.

### Always Do This at Session Start

1. Read `OVERVIEW.md` before touching any code
2. Read `CHANGELOG.md` to understand what changed recently and confirm the current version
3. After making any changes, update both `OVERVIEW.md` (current state) and `CHANGELOG.md`
   (what changed, with new version number)

Version numbers use `v1.0, v1.1 … v5.90 …` format. Every session that changes code gets
a version bump. The version must be visible somewhere in the game UI.

---

## 2. File Structure

The monolith refactor is **complete**. `index.html` is now a pure HTML shell — no inline
`<script>` or `<style>` blocks. All logic lives in the files below.

### CSS files

```
css/base.css          ← Universal reset, scrollbar styling, shared button styles,
                        and ALL design token custom properties (--sci-*, --font-*)
css/hud.css           ← In-game HUD — #hud-container, .paper-doll, .doll-row,
                        .part and size variants, .weapon-row, .wr-fill, .wr-status
css/garage.css        ← Hangar UI, perk menu, loadout overlay — .stat-readout,
                        dropdown system (.dd-*), .perk-card, .stats-panel, .lo-* classes
css/menus.css         ← Main menu, death screen, pause, overlays — .menu-title,
                        .menu-start-btn, .loadout-tab, drag-and-drop styles, keyframes
```

### JS files — core engine (loaded first)

```
js/constants.js       ← All immutable game data: CHASSIS, WEAPONS, SHIELD_SYSTEMS,
                        AUGMENTS, LEG_SYSTEMS, COVER_DEFS, ARENA_DEFS, ENEMY_COLORS,
                        STARTER_LOADOUTS, SLOT_ID_MAP, GAME_CONFIG, Supabase config.
                        Defines window.TW = {} namespace.
js/state.js           ← All mutable runtime globals: Phaser object refs (player, torso,
                        enemies, bullets…), mode flags (_gameMode, isDeployed, _isPaused),
                        round state, combat state, loadout, _perkState, extraction state
js/utils.js           ← Pure helpers with no side effects: darkenColor(), getTotalHP(),
                        HUD_NAMES, showDamageText(), createImpactSparks(), spawnDebris()
js/audio.js           ← Web Audio API synthesizer — no audio files. _tone(), _noise(),
                        all 23 snd* functions, tab-visibility lifecycle, _MAX_NODES=48
js/mechs.js           ← Mech building and visuals: buildPlayerMech(), buildEnemyMech(),
                        refreshMechColor(), syncVisuals(), syncChassisEffect(),
                        chassis movement FX (trail/footprints/shockwave), rage ghosts
js/cover.js           ← Cover generation: placeBuilding(), generateCover(), damageCover()
js/combat.js          ← All weapon firing (fire(), fireFTH(), fireRAIL(), fireGL(),
                        fireRL(), fireSG(), fireSR(), firePLSM(), fireSIEGE(), fireStandard()),
                        damage processing (processPlayerDamage(), damageEnemy()),
                        explosions, mines, shield absorption helpers
js/mods.js            ← All 18 mod activators: activateMod() dispatcher + activateJump(),
                        activateDecoy(), activateMissiles(), activateDrone(), activateRepair(),
                        activateEMP(), activateRage(), activateShield(), activateGhostStep(),
                        activateOverclockBurst(), activateFortressMode(), plus applyAugment(),
                        applyLegSystem(), drone builder helpers
js/perks.js           ← ~400+ perk definitions (const _perks), selectPerks(), showPerkMenu(),
                        pickPerk(), _showEquipPrompt(), resetRoundPerks()
js/enemies.js         ← Enemy spawning (spawnEnemy(), spawnCommander(), spawnMedic()),
                        full AI state machine (handleEnemyAI()), enemyFire(),
                        all 8 boss spawners (spawnWarden()…spawnCore()),
                        boss HP bar helpers (_addBossHPBar(), _updateBossHPBar(), _hideBossHPBar())
js/rounds.js          ← Round flow: startRound(), onEnemyKilled(), _setupArenaAndObjective(),
                        _spawnSimulationEnemies(), _spawnCampaignEnemies(), showRoundBanner(),
                        extraction system (_spawnExtractionPoint(), _triggerExtraction())
js/hud.js             ← updateHUD(), updateBars(), updatePaperDoll(), drawMinimap(),
                        updateCooldownOverlays(), syncGlowWedge(), syncCrosshair(),
                        _resetHUDState()
js/garage.js          ← Hangar UI: toggleDD(), buildDD(), closeAllDD(), selectSlot(),
                        refreshGarage(), updateGarageStats(), setChassis(), buildColorDD()
js/menus.js           ← All menu/overlay logic: main menu nav, hangar nav, deployMech(),
                        death screen, pause, populateLoadout(), populateInventory(),
                        hover card system (_buildHoverHtml(), _showSlotHover()),
                        leaderboard, campaign chassis select
```

### JS files — feature modules (loaded after core engine)

```
js/loot-system.js     ← ARPG loot layer: generateItem(), rollRarity(), rollAffixes(),
                        RARITY_DEFS, AFFIX_POOL, _inventory[], _equipped{}, _gearState{},
                        recalcGearStats(), spawnEquipmentLoot(), checkEquipmentPickups()
js/enemy-types.js     ← Special enemy types (Scout, Enforcer, Technician, Berserker,
                        Sniper Elite, Drone Carrier) and elite modifier system
js/arena-objectives.js← Arena layouts, objective logic, _arenaState object (mutate only)
js/campaign-system.js ← Missions, XP curve, level-up, skill tree, shop, cloud saves
js/multiplayer.js     ← PVP matchmaking, Socket.IO, remote players, PVP HUD
```

### JS files — entry points (loaded last)

```
js/events.js          ← All global event listeners: keydown, resize, drag-and-drop,
                        dropdown close, player movement, player firing
js/init.js            ← window.onload bootstrap, animated grid canvas, Phaser scene
                        lifecycle (preload, create, update)
```

### Reference files (not loaded at runtime)

```
OVERVIEW.md           ← Living map of the project — read before reading code
CHANGELOG.md          ← Session-by-session change history with version numbers
LOOT_SYSTEM_DESIGN.md ← Design doc for the ARPG loot overhaul (Phases 1–8)
```

### Script load order (bottom of `<body>`)

```
phaser.min.js → constants.js → state.js → utils.js → audio.js → mechs.js → cover.js
→ combat.js → mods.js → perks.js → enemies.js → rounds.js → hud.js → garage.js
→ menus.js → loot-system.js → enemy-types.js → arena-objectives.js
→ campaign-system.js → socket.io.min.js → multiplayer.js → events.js → init.js
```

All files share globals via `window`. No module system. `window.TW = {}` is the project
namespace defined in `constants.js`. Feature files expose public API as
`window.TW.featureName = { fn1, fn2 }`.

---

## 3. Key Architecture Rules

These are hard rules. Breaking any of them causes runtime crashes or silently wrong behavior.

### Slot key distinction — never mix these up

| Context | Keys used |
|---|---|
| `loadout` object | `L` `R` `mod` `aug` `leg` **`shld`** (not `shield`) |
| Garage dropdown IDs | `L` `R` `M` (mod) `A` (aug) `G` (leg) `S` (shield) `C` (color) |
| `_equipped` object | `L` `R` `chest` `arms` `legs` **`shield`** `mod` `augment` |
| `SLOT_ID_MAP` constant | maps garage IDs → loadout keys: `{ L:'L', R:'R', M:'mod', A:'aug', G:'leg', S:'shld' }` |

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

## 4. CSS Conventions

### Font rule

**Every UI element uses `Courier New`, monospace.** There is no sans-serif or display font anywhere in the game. Always use the token:
```css
font-family: var(--font-mono); /* 'Courier New', monospace */
```
Do not hardcode the font string — use the variable.

### Design token system

All colors, borders, and surface fills use the `--sci-*` custom properties defined in `css/base.css`.
**Never hardcode a hex value that duplicates one of these tokens.**

| Token | Value | Meaning |
|---|---|---|
| `--sci-cyan` | `#00d4ff` | Primary accent — interactive elements, highlights |
| `--sci-cyan-dim` | `rgba(0,212,255,0.08)` | Hover/active background tint |
| `--sci-cyan-border` | `rgba(0,212,255,0.35)` | Default border on interactive elements |
| `--sci-cyan-bright` | `rgba(0,212,255,1)` | Focused or active border |
| `--sci-red` | `#ff4d6a` | Danger, destroyed state, negative values |
| `--sci-red-dim` | `rgba(255,77,106,0.08)` | Danger background tint |
| `--sci-red-border` | `rgba(255,77,106,0.35)` | Danger border |
| `--sci-gold` | `#ffd166` | Legendary/unique items, special highlights |
| `--sci-line` | `rgba(255,255,255,0.07)` | Subtle dividers, inactive borders |
| `--sci-txt` | `rgba(255,255,255,0.9)` | Primary text |
| `--sci-txt2` | `rgba(255,255,255,0.4)` | Secondary/muted text |
| `--sci-txt3` | `rgba(255,255,255,0.18)` | Near-invisible decorative text (nav numbers, etc.) |
| `--sci-surface` | `rgba(255,255,255,0.03)` | Panel background fill |
| `--font-mono` | `'Courier New', monospace` | Universal font |

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

## 5. UI Architecture

### Loadout overlay layout

The loadout overlay (`#stats-overlay`) is a **three-column CSS grid**:

```
grid-template-columns: 220px 1fr 440px;

┌─────────────────────┬──────────────────────┬──────────────────────────┐
│  Left col (220px)   │  Center col (flex)   │  Right col (440px)       │
│  ─────────────────  │  ──────────────────  │  ──────────────────────  │
│  Chassis stats row  │  Chassis traits bar  │  Backpack grid (4×5)     │
│  HP bars            │  Mech silhouette     │  20 slots × 100×100px    │
│  Total HP/Shield    │  8 equipment slots   │                          │
│  Gear bonuses       │  Weapon bar          │                          │
│  Active perks       │                      │                          │
└─────────────────────┴──────────────────────┴──────────────────────────┘
```

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

### Equipment doll slots

8 slots are positioned on the mech silhouette image using percentage-based `top`/`left`/`right`
absolute positioning. Slot positions are defined in a config object inside `populateLoadout()`.
The label shown in each doll slot uses the position config's `label` field:
- Arm slots: `"L ARM"` and `"R ARM"`
- Other slots: `"CPU"`, `"AUGMENT"`, `"SHIELD"`, `"LEGS"`, `"TORSO"`, `"ARMOR"`

### Backpack grid

- 4 columns × 5 rows = 20 cells (`INVENTORY_MAX = 20`)
- Each cell is a `.lo-slot` element — 100×100px, styled identically to doll slots
- Item label in backpack cards uses `_bpSlotNames` map (see Display Conventions section)

### Hover card system

Hover cards appear on `mouseenter` for both doll slots and backpack cells.
They are positioned with fixed coordinates and edge-detection to stay on screen.

- Single item: `_showSlotHover(item, el)` — calls `_buildHoverHtml(item, compareItem)`
- Comparison: when a backpack item has an equipped counterpart, the card shows two columns
  side by side (Backpack | Equipped) with a diff section below, built by `_buildSingleCardHtml()`
- Hide: `_hideSlotHover()` on `mouseleave` and on `mousedown` (so the card disappears on drag)

### HUD element IDs reference

```
slot-L/R/M/S         txt-L/R/M/S          wr-fill-L/R/M/S      wr-st-L/R/M/S
slot-leg-wrap        txt-G
round-hud            round-num            round-remaining       round-kills
boss-hud             boss-bar-fill        boss-bar-name
doll-head            doll-core            doll-lArm             doll-rArm
doll-lShoulder       doll-rShoulder       doll-lLeg             doll-rLeg
minimap-canvas       enemy-doll-hud       edoll-label
stats-overlay        pause-overlay        death-screen          perk-menu
```

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

## 6. Game Systems Summary

### Chassis system
**File:** `js/constants.js` — `const CHASSIS`, `const CHASSIS_WEAPONS/MODS/SHIELDS/LEGS/AUGS`
Three playable chassis (Light/Medium/Heavy) with distinct HP pools, speed, scale, and passive
traits. Weapon/mod/shield/leg/aug restrictions enforced by `Set` lookups. Chassis is locked
in Campaign once selected. Key constants: `CHASSIS.light.spd=250`, `CHASSIS.medium.modCooldownMult=0.85`, `CHASSIS.heavy.passiveDR=0.15`.

### Loadout system
**Files:** `js/constants.js` (STARTER_LOADOUTS), `js/state.js` (let loadout), `js/garage.js`
Seven slots: `chassis`, `L`, `R`, `mod`, `aug`, `leg`, `shld`. The garage uses a custom
dropdown system (`toggleDD`, `buildDD`, `closeAllDD`). Two-handed weapons (`siege`, `chain`)
lock both arm slots. `selectSlot()` enforces this locking. `refreshGarage()` filters options
by chassis restrictions. `updateGarageStats()` recalculates and displays the build stats panel.

### Combat and firing system
**File:** `js/combat.js` — `fire()` dispatches to per-weapon functions
Bullets spawn from arm offset origins (not torso center). Single-arm brace gives +25% damage /
+15% reload. Dual-wield gives −15% damage per arm. Damage pipeline: base → gear flat
(`_gearState.dmgFlat`) → perk multiplier (`_perkState.dmgMult`) → gear percent (`_gearState.dmgPct`)
→ situational bonuses (crit, brace, etc.). Key timestamps: `reloadL`, `reloadR`.

### Perk system
**File:** `js/perks.js` — `const _perks`, `showPerkMenu()`, `pickPerk()`, `selectPerks()`
~400+ perks organized by category. Offered in a 4-slot menu after each round's extraction.
`p.apply()` mutates `_perkState` immediately on pick. Legendaries require 2+ perks in their
category and round 5+. `selectPerks()` is pure (no DOM) — call it before `showPerkMenu()`.

### Shield system
**File:** `js/constants.js` (SHIELD_SYSTEMS), `js/combat.js` (processPlayerDamage()), `js/init.js` (handleShieldRegen())
20 shield types with unique passive mechanics. Absorbs a portion of incoming damage based on
`player._shieldAbsorb`. Regens after `_shieldRegenDelay` seconds with no damage taken. Incoming
damage pipeline: barrier block → passive absorb → chassis passiveDR → perk DR → gear DR → dodge → apply to `player.comp`.

### Enemy AI system
**File:** `js/enemies.js` — `handleEnemyAI()`, `spawnEnemy()`, `spawnCommander()`, `spawnMedic()`
State machine per enemy: `patrol → search → chase → combat`. Vision cone detection,
squad system, behaviors: `circle`, `rusher`, `flanker`, `ambusher`, `guardian`, `sniper`.
Obstacle avoidance via feeler rays. Separation force prevents stacking.

### Boss system
**File:** `js/enemies.js` — `spawnBoss()`, 8 boss spawners
8 bosses cycle every 5 rounds (R5=Warden, R10=Razors, R15=Architect, R20=Juggernaut,
R25=Swarm, R30=Mirror, R35=Titan, R40=Core). Each boss has unique phase mechanics, a DOM-based
HP bar, and an `e._onDestroy` callback. Swarm boss uses shared `_swarmState.hp` pool.

### Loot system
**File:** `js/loot-system.js`
ARPG loot layer. Items have rarity (Common→Legendary), rolled affixes from `AFFIX_POOL`,
base stats from `ITEM_BASES`. Ground drops glow with rarity color. Picking up sends item to
`_inventory[]`. Equipping to `_equipped{}` triggers `recalcGearStats()` which rebuilds `_gearState{}`.
`INVENTORY_MAX = 20`. 2H weapons (`siege`, `chain`) cannot appear as loot drops.

### Round and extraction system
**File:** `js/rounds.js` — `startRound()`, `onEnemyKilled()`, `_triggerExtraction()`
Enemies spawn on a staggered timer. When all die, extraction zone spawns. Player presses E to
extract, triggering heal → perk menu → next round. Campaign mode uses `_activeCampaignConfig`
for enemy composition. `destroyEnemyWithCleanup(scene, e)` is the shared teardown for
force-removing enemies outside the normal damage path.

### Audio engine
**File:** `js/audio.js` — `_tone()`, `_noise()`, all `snd*` functions
Web Audio API synthesizer — no audio files required. AudioContext created after first user gesture.
Throttled via `_sndThrottle{}`. Node count capped at `_MAX_NODES=48`. Tab visibility changes
suspend/resume the context. `_masterVol = 0.32`.

### Multiplayer
**File:** `js/multiplayer.js`
PVP matchmaking via Socket.IO. Remote player rendering, bullet sync, PVP HUD, in-game chat,
respawn system. Public API: `mpUpdate()`, `mpBroadcastBullet()`, `mpDrawMinimapPlayers()`,
`mpShowPvpMenu()`, `mpClosePvpMenu()`.

### Campaign
**File:** `js/campaign-system.js`
Missions with XP rewards, chapter progression, level-up, skill tree, chassis upgrades
(`applyChassisUpgrades()`), supply shop (`refreshShopStock()`), bonus objectives
(`trackBonusObjective()`), cloud save integration with Supabase (`saveToCloud()`, `loadFromCloud()`).

### Key constants

```javascript
// Chassis HP (base values before perks/gear)
CHASSIS.light  = { spd:250, scale:0.7, coreHP:212, armHP:120, legHP:152 }
CHASSIS.medium = { spd:210, scale:1.0, coreHP:272, armHP:180, legHP:212 }
CHASSIS.heavy  = { spd:185, scale:1.4, coreHP:332, armHP:240, legHP:272 }

// World
World size: 4000×4000   Player spawn: (2000, 2000)   INVENTORY_MAX: 20
Boss cycle: every 5 rounds, 8 bosses rotate
Enemy HP scale: 0.50 × (1 + (level−1) × 0.08)  (+8%/level, no cap)

// Audio
_masterVol = 0.32    _MAX_NODES = 48

// Supabase tables
'tw_scores'           ← leaderboard
'tw_campaign_saves'   ← campaign cloud saves
```

### Key state globals

```javascript
let isDeployed          // false during drop-in tween and while in hangar
let _isPaused           // true while pause overlay is showing
let _roundClearing      // true during perk menu/equip prompt — blocks update()
let _gameMode           // 'simulation' | 'campaign' | 'pvp'
let _round, _roundKills, _roundTotal, _roundActive
let _extractionActive, _extractionPoint
let _lArmDestroyed, _rArmDestroyed, _legsDestroyed
let reloadL, reloadR    // scene.time.now — next allowed fire timestamp
let lastDamageTime      // last player damage received
let lastModTime         // last mod activation

// Player component HP
player.comp = { core:{hp,max}, lArm:{hp,max}, rArm:{hp,max}, legs:{hp,max} }
player.shield, player.maxShield, player._shieldAbsorb

// Perk state
_perkState.dmgMult, .reloadMult, .speedMult, .critChance, .fortress (DR)
_perkState.legSystemActive  // false when legs destroyed

// Gear state (rebuilt by recalcGearStats() from _equipped)
_gearState.dmgFlat, .dmgPct, .reloadPct, .coreHP, .shieldHP, .dr, .speedPct ...
```

---

## 7. Display Conventions

### Inverted stats — negative is better

Some stats improve as the value goes more negative. These must be rendered with **reversed**
color logic and a `+` prefix rather than a `−` prefix:

| Stat key | Display label | Why |
|---|---|---|
| `reloadPct` | Reload Speed % | Negative % = faster reload |
| `modCdPct` | Mod Cooldown % | Negative % = shorter cooldown |
| `reload` | Reload (raw ms) | Lower value = faster |

**Implementation:** Use the `_hoverInvertedStats` Set in `js/menus.js` to check any stat key.
This set is the single source of truth — do not hard-code inversion logic elsewhere.

Display rule: a value of `−15` on `reloadPct` should show as **+15% Reload Speed** in green.
A value of `+10` on `reloadPct` should show as −10% Reload Speed in red.

### Slot label naming

| Location | Label used | Notes |
|---|---|---|
| Backpack item cards | **"WEAPON"** for weapons | Uses `_bpSlotNames` map in `js/menus.js` |
| Backpack item cards | "CPU" for mod systems | |
| Backpack item cards | "AUGMENT" for augments | |
| Backpack item cards | "DEFENSE" for shields | |
| Backpack item cards | "LEGS" for leg systems | |
| Equipped doll slots (arms) | "L ARM" / "R ARM" | Position config in `populateLoadout()` |
| Weapon bar (center col bottom) | "L ARM" / "R ARM" | `_wbItem()` calls in `populateLoadout()` |

**Do not revert backpack weapon cards to "L ARM" / "R ARM"** — changed intentionally in v5.90.

### Rarity colors

Rarity color strings come from `RARITY_DEFS[rarity].colorStr` in `js/loot-system.js`.
Apply them as inline `color:` or `border-color:` — never hardcode rarity hex values in CSS.

| Rarity | Approximate color |
|---|---|
| common | white / grey |
| uncommon | green |
| rare | blue |
| epic | purple |
| legendary | orange/gold |

### Color meanings (general UI)

| Color | Meaning |
|---|---|
| `--sci-cyan` (#00d4ff) | Interactive, active, selected, primary accent |
| `--sci-red` (#ff4d6a) | Danger, destroyed, negative diff, bad stat |
| `--sci-gold` (#ffd166) | Legendary, unique, special |
| Green (`.pos` class) | Positive stat value, improvement |
| Red (`.neg` class) | Negative stat value, downgrade |
| `--sci-txt2` (40% white) | Muted labels, secondary info |
| `--sci-txt3` (18% white) | Decorative only — nav numbers, chapter numbers |
