# Changelog

All notable changes to Tech Warrior Online are documented here.
Each session that changes code gets a version bump.

---

## v5.2 — Extract Constants into js/constants.js

**Date:** 2026-03-21

Extracted 31 constants from the inline `<script>` block in `index.html` into the new dedicated file `js/constants.js`, covering chassis definitions (`CHASSIS`), weapon definitions (`WEAPONS`), shield systems (`SHIELD_SYSTEMS`), augments (`AUGMENTS`), leg systems (`LEG_SYSTEMS`), cover definitions (`COVER_DEFS`), and loot types (`LOOT_TYPES`). A `<script src="js/constants.js">` tag was added to `index.html` before the other JS files so all downstream code retains access to these values via the shared `window` global scope.

### Files Changed

- `js/constants.js` — created (31 top-level constants moved from index.html)
- `index.html` — constants block removed; `<script src="js/constants.js">` tag added
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.2

---

## v5.1 — CSS Extraction into Separate Files

**Date:** 2026-03-20

Extracted all CSS from the inline `<style>` blocks in `index.html` into four dedicated files. The BASE / RESET section (reset, body, scrollbar, shared button components) went into `css/base.css`; all in-game HUD and paper doll rules went into `css/hud.css`; the hangar/garage panel, dropdown system, perk cards, stats panel, and related garage rules went into `css/garage.css`; and the main menu, pause overlay, animations (@keyframes), loadout tab buttons, mech equip slots, backpack drag styles, and arm picker modal went into `css/menus.css`. Both `<style>` blocks were removed from `index.html` and replaced with four `<link>` tags in load order: `base.css → hud.css → garage.css → menus.css`.

### Files Changed

- `css/base.css` — created (reset, body, scrollbar, shared button styles)
- `css/hud.css` — created (in-game HUD, weapon rows, paper doll)
- `css/garage.css` — created (hangar panel, dropdowns, perk cards, stats panel, garage stats, deploy button)
- `css/menus.css` — created (main menu, animations, pause overlay, loadout tabs, mech equip slots, backpack, arm picker)
- `index.html` — both `<style>` blocks removed; four `<link>` tags added to `<head>`
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.1

---

## v5.0 — Fix _inGame ReferenceError in Loadout Menu

**Date:** 2026-03-20

### Root Cause

`_inGame` was declared as a `const` local to `_renderChassisPanel()` during the v4.6 function decomposition pass. `_renderMobilityPanel()` (a separate function) also referenced `_inGame` at line 12924, but the variable was out of scope there, causing `ReferenceError: _inGame is not defined` whenever the LOADOUT/Stats overlay was opened.

### Fix

Added `const _inGame = !!(player?.comp);` at the top of `_renderMobilityPanel()`, matching the identical declaration already in `_renderChassisPanel()`.

### Files Changed

- `index.html` — `_renderMobilityPanel()`: added `_inGame` local declaration
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.0

---

## v4.9 — Fix Remaining Syntax Errors in _syncEnemyVisuals and _applyEnemyObstacleAvoidance

**Date:** 2026-03-20

The v4.8 fix restored the `function` keyword but two additional structural bugs remained that still crashed the script block.

### Root Causes

1. **Missing `});` and `}` in `_syncEnemyVisuals`** (index.html ~line 3884): The `if (enemy.isCommander && player) { enemies.getChildren().forEach(other => { ... })` block was missing its arrow-function closing `});` and the outer `if` closing `}`. This left the forEach callback and the isCommander branch both unclosed, causing the JS parser to nest everything that followed inside them at the wrong scope depth.

2. **Missing `}` in `_applyEnemyObstacleAvoidance`** (index.html ~line 3963): The `if (_curSpd > 20) {` wall-stuck detection block was missing its closing `}`. The "Tank locomotion" code that followed was intended to run unconditionally (4-space indent = function body level), but the unclosed if left the entire function body open, so `_applyEnemyObstacleAvoidance`'s own closing `}` was consumed by the if block — leaving the function itself unclosed and producing "Unexpected end of input" at end-of-file.

### Effect

Even after the v4.8 keyword fix, the JS engine still could not parse the script block. `proceedToMainMenu` and all other functions remained undefined, keeping the game unlaunchable.

### Fix

- Restored `});` and `}` closing the `forEach` callback and `isCommander` if-block in `_syncEnemyVisuals`.
- Added the missing `}` closing the `if (_curSpd > 20)` block in `_applyEnemyObstacleAvoidance`.
- Verified with Node.js `--check`: script now parses cleanly. Brace balance: `{ 4080 } 4080 diff: 0`.

### Files Changed

- `index.html` — two structural brace fixes in `_syncEnemyVisuals` and `_applyEnemyObstacleAvoidance`
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v4.9

---

## v4.8 — Fix Callsign Screen Syntax Error

**Date:** 2026-03-20

Fixed a syntax error that crashed the entire inline `<script>` block, preventing all functions below it (including `proceedToMainMenu`) from being defined.

### Root Cause

Line 3898 of `index.html` read `nction _applyEnemyObstacleAvoidance(...)` — the `fu` prefix was missing, making `nction` a bare identifier followed by a function-call expression and a stray `{`, which the JS parser reported as "missing ) after argument list" (line ~3896).

### Effect

The script parse error killed the entire inline `<script>` block. `proceedToMainMenu` (defined at line 13613) was never registered, so clicking Proceed on the callsign screen threw `ReferenceError: proceedToMainMenu is not defined` — making the game unlaunchable.

### Fix

Restored `fu` so the declaration reads `function _applyEnemyObstacleAvoidance(...)`. No other changes.

### Files Changed

- `index.html` — line 3898: `nction` → `function`
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v4.8

---

## v4.7 — Final Consistency Check

**Date:** 2026-03-20

Pre-split consistency audit. Verified all function references, variable references, typeof guards, and documentation accuracy. No game logic changed.

### Checks Performed

1. **Function references** — All function calls in `index.html` resolve to existing definitions. All 22 v4.6 sub-functions and 2 v4.5 helpers verified present. No dangling calls found.
2. **Variable references** — All variable references in `index.html` resolve to existing declarations. `GAME_CONFIG` and `GAME` (renamed v4.3) confirmed in use throughout.
3. **typeof guards** — All guards reference functions that exist in the expected external file. No guard checks for a non-existent function.
4. **Documentation accuracy** — Found and fixed 5 issues (see below).
5. **CHANGELOG gaps** — Found duplicate v3.2 entry; resolved.

### Issues Found and Fixed

**DEPENDENCY_MAP.md — Section 1.3: 7 phantom unique-effect function entries removed**
- `triggerVoidstepDash`, `applyMirrorShieldBlock`, `checkArcDischarge`, `triggerNullCoreDetonation`, `checkChainReactionProc`, `checkWarpStrikeProc`, `updateEquippedUniqueEffects` were listed as guarded calls from `index.html` into `loot-system.js` but none of these functions exist anywhere in the codebase and no typeof guards for them appear in `index.html`. Removed the 7 stale rows.
- Replaced with accurate entries for the 12 unique-effect helpers that actually do exist and are called from `index.html` (`hasUniqueEffect`, `applyFrontalAbsorb`, `getShieldDRBonus`, `getImpactArmorDR`, `checkImpactArmor`, `isMatrixBarrierActive`, `triggerMatrixBarrier`, `getColossusDR`, `getColossusDmgMult`, `getDualReloadBonus`, `getUnstoppableSpeedBonus`, `checkDoubleStrike`, `spawnModCover`, `triggerCoreOverload`, `_showFloatingWarning`).

**DEPENDENCY_MAP.md — `game` → `GAME` in sections 2.1, 2.3, 4.1**
- The Phaser game instance was renamed from `game` to `GAME` in v4.3. Updated all three section entries.

**DEPENDENCY_MAP.md — Missing cross-file calls added in v4.4**
- Section 1.2: Added `_showArenaLabel()` (moved from `index.html` to `arena-objectives.js` in v4.4) and `_initPitZone()`.
- Section 1.4: Added `_updateCampaignXPBar()` (moved from `index.html` to `campaign-system.js` in v4.4), plus `completeCampaignMission`, `awardMissionReward`, `getSkillTreeBonuses`, `_closeShop`, `_closeLoadoutSlots`, `_closeUpgrades`.

**GLOBAL_INVENTORY.md — `config`/`game` entries updated**
- Section 1: Renamed `config` → `GAME_CONFIG` and `game` → `GAME` with v4.3 rename notes.
- Section 2: Same renames in destination table.
- Section 3: Collision-risk rows for `config` and `game` marked as resolved (renamed in v4.3).

**CHANGELOG.md — Duplicate v3.2 entry**
- Two entries both labeled `v3.2` existed: "Structural Audit Fixes" and "GLOBAL_INVENTORY.md Complete". The latter (oldest entry, positioned at the bottom of the file) renamed to `v3.0` to eliminate the duplicate version number.

### Files Changed

- `DEPENDENCY_MAP.md` — Section 1.2 (added `_showArenaLabel`, `_initPitZone`); Section 1.3 (removed 7 phantom functions, added 15 accurate unique-effect helper rows); Section 1.4 (added 6 missing guarded calls); Sections 2.1, 2.3, 4.1 (`game` → `GAME`)
- `GLOBAL_INVENTORY.md` — Section 1 (`config` → `GAME_CONFIG`, `game` → `GAME`); Section 2 (same); Section 3 (resolved-rename rows for `config`/`game`)
- `CHANGELOG.md` — Duplicate v3.2 renamed to v3.0; this entry added
- `OVERVIEW.md` — Version updated to v4.7

---

## v4.6 — Function Decomposition Pass

**Date:** 2026-03-20

Scanned all of `index.html` in ~500-line sections and extracted every function exceeding ~80 lines or handling more than one distinct responsibility. Each oversized function was split into a coordinator calling named sub-functions placed directly below under a `// ── Sub-section name` comment.

### Functions Split

| Parent Function | Lines Before | Sub-functions Extracted |
|---|---|---|
| `startRound` | ~184 | `_setupArenaAndObjective`, `_spawnCampaignEnemies`, `_spawnSimulationEnemies` |
| `damageEnemy` | ~329 | `_resolveEnemyDeath` |
| `populateStats` | ~347 | `_renderChassisPanel`, `_renderWeaponPanel`, `_renderMobilityPanel`, `_renderRunStatsPanel`, `_renderActivePerksPanel`, `_renderGearBonusesPanel` |
| `processPlayerDamage` | ~351 | `_applyExplosivePlayerDamage`, `_applyPassiveShieldAbsorption` |
| `deployMech` | ~303 | `_registerEnemyBulletOverlap`, `_initPlayerHP`, `_execDropInTween` |
| `enemyFire` | ~202 | `_dispatchEnemyWeapon` |
| `spawnEnemy` | ~143 | `_assignEnemyToSquad` |
| `_showItemDetail` | ~135 | `_buildItemComparisonHTML` |
| `handleEnemyAI` | ~634 | `_applyEnemyPassiveShieldRegen`, `_computeEnemyVisibility`, `_updateEnemyAIState`, `_calcEnemyBehaviorVelocity`, `_handleEnemyFiringDecision`, `_applyEnemyObstacleAvoidance`, `_syncEnemyVisuals` |

**Total: 9 parent functions split → 22 new named sub-functions created.**

Functions assessed and left intact (single responsibility or tightly coupled internals): `generateCover`, `fire`, `drawMinimap`, `spawnTitan`, `spawnCore`, `togglePause`, `returnToHangar`, `updatePaperDoll`.

---

## v4.5 — Duplicate Logic Audit

**Date:** 2026-03-20

Full duplicate-logic audit of all ~14,200 lines of `index.html`, scanning in ~500-line sections. Any logic implemented more than once — either twice inside `index.html`, or once in `index.html` and once in an external file — was identified and collapsed into a single canonical implementation.

### Duplicates Found and Fixed

**`drawMine()` closure — duplicated in `dropMine()` and `dropEnemyMine()`**
- Lines ~10721–10734 (inside `dropMine`) and ~10769–10782 (inside `dropEnemyMine`) contained a byte-for-byte identical 14-line inline closure for drawing mine graphics (flat disc, crosshair, pulsing danger ring). The comment in `dropEnemyMine` even noted "identical to player mine."
- Fix: Extracted shared module-level helper `_drawMineGraphic(g, mx, my, glowAlpha)` immediately before `dropMine()`.
- Both closures replaced with `const drawMine = () => _drawMineGraphic(g, mx, my, _glowAlpha);`.
- No `typeof` guard needed — helper lives in the same inline `<script>`.

**`_perkState` reset object — duplicated three times**
- Identical ~100-field perk state reset object appeared in three functions:
  - `respawnMech()` — single-line version
  - `goToMainMenu()` — 39-line formatted version
  - `returnToHangar()` — 39-line formatted version
- Comments in the code explicitly warned "must match the shape in returnToHangar() exactly" — acknowledging the duplication.
- Fix: Extracted shared factory function `_resetPerkState()` immediately before `respawnMech()`.
- All three `_perkState = { ... }` assignments replaced with `_perkState = _resetPerkState();`.
- No `typeof` guard needed — factory lives in the same inline `<script>`.

### Sections Scanned — No Other Duplicates Found

- Lines 1–4500 (prior session): CSS, HTML, constants, chassis/weapon/perk data, audio engine, state vars, `handleEnemyAI()`, movement/visual functions
- Lines 4500–10712: perk menu, round management, cloud saves, scene helpers, boss spawners, enemy AI, all `fireXxx()` functions, `processPlayerDamage()`, `damageEnemy()`
- Lines 10712–10806: `dropMine()` / `dropEnemyMine()` — **DUPLICATE FOUND AND FIXED** ✓
- Lines 10807–11309: visual FX helpers, mech building, utility functions, HUD update functions
- Lines 11310–12041: garage option arrays, `SLOT_DESCS`, dropdown system, `updateGarageStats()`, `showDeathScreen()`, `_cleanupGame()`
- Lines 12041–12309: `respawnMech()`, `toggleStats()`, `toggleInventory()`, `_switchLoadoutTab()`
- Lines 12310–12809: inventory/item UI, drag-and-drop handlers, `populateStats()` start
- Lines 12810–13309: `populateStats()` completion, `togglePause()`, ESC key handler, `goToMainMenu()` — **DUPLICATE FOUND** (perk reset)
- Lines 13310–end: `returnToHangar()` — **DUPLICATE FOUND** (perk reset); entry points, campaign flow, `startGame()`, `startMultiplayer()`
- All perk reset duplicates **FIXED** in a single pass ✓

### Files Changed

- `index.html` — `_drawMineGraphic()` helper added; both `drawMine` closures replaced; `_resetPerkState()` factory added; three `_perkState = { ... }` blocks replaced with `_resetPerkState()` calls

---

## v4.4 — Misplaced Function Audit

**Date:** 2026-03-20

Full audit of all functions in `index.html` against the three misplacement criteria: (1) exclusively operates on data owned by an external file, (2) duplicates logic already in an external file, (3) clearly belongs to a system with its own file. Scanned all ~14,200 lines in ~500-line sections.

### Misplacements Found and Fixed

**`_showArenaLabel(scene, arenaLabel, objLabel)` — moved from `index.html` → `js/arena-objectives.js`**
- Exclusively read `ARENA_DEFS` and `_arenaState` (both owned by `arena-objectives.js`).
- Added after `getObjectiveLabel()` in the arena label helper section of `arena-objectives.js`.
- The `ARENA_DEFS` typeof guard in the original was removed (unnecessary inside the owning file).
- Deleted from `index.html`. Call site in `startRound()` wrapped with `if (typeof _showArenaLabel === 'function')` guard.

**`_updateCampaignXPBar()` — moved from `index.html` → `js/campaign-system.js`**
- Exclusively read `_campaignState.playerLevel` / `.playerXP` and called `getXPForLevel()` / `getXPToNextLevel()` (all owned by `campaign-system.js`).
- Added in a new `// CAMPAIGN HUD HELPERS` section before the `// MISSION SELECT UI` section in `campaign-system.js`.
- Internal typeof guards for `_campaignState`, `getXPForLevel`, `getXPToNextLevel` removed (unnecessary inside the owning file); `_gameMode` guard changed to `typeof _gameMode === 'undefined'` check since `_gameMode` is index.html state.
- Deleted from `index.html`. Call site in `populateStats()` wrapped with `if (typeof _updateCampaignXPBar === 'function')` guard.

### Sections Scanned — No Other Misplacements Found

- Lines 1–500: HTML/CSS only
- Lines 500–1400: HTML/CSS only
- Lines 1400–2600: game state vars, `_perks` const, `resetLoadout()`, `_applyStarterLoadout()` — all index.html state
- Lines 2600–2965: audio engine (`_getAC`, `_canPlay`, `_tone`, `_noise`, all `sndXxx`) — no audio.js file yet
- Lines 2965–3312: `preload()`, `create()`, `update()`, `handleBulletEnemyOverlap()` — Phaser lifecycle, index.html state
- Lines 3312–3946: `handleEnemyAI()` — index.html state
- Lines 3946–4772: movement, firing, sync, perk selection, `showPerkMenu()`, `_showEquipPrompt()`, `showRoundBanner()` — index.html state
- Lines 4772–4870: `_showArenaLabel()` → **MOVED** ✓; `_clearMapForRound()` — index.html state
- Lines 4865–5083: `startRound()` — index.html orchestrator
- Lines 5083–5288: cloud save / leaderboard helpers — index.html state
- Lines 5288–6054: leaderboard, spectral clone, `destroyEnemyWithCleanup()`, `onEnemyKilled()`, minimap, extraction — index.html state
- Lines 6054–6379: `deployMech()` — index.html state
- Lines 6379–6525: `applyAugment()`, `applyLegSystem()` — write to `_perkState` (index.html state)
- Lines 6525–7407: all `activateXxx()` mod functions — index.html state
- Lines 7407–7765: `generateCover()`, `placeBuilding()`, `spawnMedic()` — index.html state
- Lines 7765–8892: boss spawners — index.html state
- Lines 8892–9543: `randomEnemyLoadout()`, `spawnEnemy()`, `spawnCommander()`, `enemyFire()` — index.html state
- Lines 9543–10730: `fire()` and all `fireXxx()` functions, `processPlayerDamage()`, `damageEnemy()` — index.html state
- Lines 10730–11056: `dropMine()`, `updateEnemyDoll()`, visual FX — index.html state
- Lines 11056–11576: `buildPlayerMech()`, `buildEnemyTorso()`, utility helpers, `updateHUD()`, `updateBars()`, `updatePaperDoll()` — index.html state
- Lines 11576–12116: garage system — index.html state
- Lines 12116–12196: `toggleStats()`, `toggleInventory()`, `_switchLoadoutTab()` — index.html state
- Lines 12196–12675: inventory UI, drag-and-drop handlers, stat helpers — mixed index.html/loot-system state
- Lines 12675–12695: `_updateCampaignXPBar()` → **MOVED** ✓
- Lines 12695–13044: `populateStats()` — multi-system read, index.html orchestrator
- Lines 13044–13507: event handlers, `togglePause()`, `goToMainMenu()`, `returnToHangar()` — index.html state
- Lines 13507–end: entry points, campaign chassis select, `startGame()`, `startMultiplayer()` — index.html state

### Files Changed

- `index.html` — `_showArenaLabel()` deleted, `_updateCampaignXPBar()` deleted, two call sites updated with typeof guards
- `js/arena-objectives.js` — `_showArenaLabel()` added after `getObjectiveLabel()`
- `js/campaign-system.js` — `_updateCampaignXPBar()` added in new `CAMPAIGN HUD HELPERS` section

---

## v4.3 — Constants Audit & Magic Number Extraction

**Date:** 2026-03-20 (Central Time)

Full audit of all 46 top-level `const` declarations in `index.html`, classification of magic numbers in the JS logic sections, and targeted fixes.

### PART 1 — Audit

Classified all 46 top-level `const` declarations alphabetically into three categories:

- **TRUE CONSTANT (20):** Never reassigned and never mutated — safe for `constants.js` in the upcoming split. Includes `_FEELER_OFFSETS`, `_MAX_NODES`, `COMMANDER_COLORS`, `ENEMY_2H_WEAPONS`, `ENEMY_ARM_WEAPONS`, `ENEMY_PRIMARY`, `EXPLOSIVE_KEYS`, `LB_KEY`, `LB_MAX`, `MEDIC_COLORS`, `SCORE_MAX_*`, `SLOT_ID_MAP`, all `SUPABASE_*` constants, and two that needed renaming (`config`, `game`).
- **MUTATED CONSTANT (3):** Declared `const` but properties written at runtime — `CHASSIS`, `_sndThrottle`, `_CONE_RAY_POINTS`.
- **LOOKUP TABLE (23):** Large read-only data objects — `CHASSIS_WEAPONS`, `SHIELD_SYSTEMS`, `WEAPONS`, `_perks`, `COVER_DEFS`, `LOOT_TYPES`, all garage dropdown option arrays, etc.

Magic number scan identified two module-level values appearing 10+ times each with no named form: `4000` (world size) and `2000` (world center / player spawn).

### PART 2 — Fixes

**Step 1 — ⚠️ MUTATED AT RUNTIME comments (`index.html`):**
- Added comment above `CHASSIS` explaining that `applyChassisUpgrades()` and `tactical_uplink` write into it at runtime.
- Added comment above `_sndThrottle` explaining that `_canPlay()` writes timestamps into it on every sound play.
- Added comment above `_CONE_RAY_POINTS` explaining that `handleEnemyAI()` overwrites `.x`/`.y` on each element every frame.

**Step 2 — Magic number extraction (`index.html`):**
- Added `WORLD_SIZE = 4000` and `WORLD_CENTER = 2000` at the top of the CONSTANTS section.
- Extracted 19 magic numbers into named constants across `setBounds`, `centerOn`, `setPosition`, `Distance.Between`, arena generator, swarm spawn, Core boss, and AI patrol target clamping calls.

**Step 3 — SCREAMING_SNAKE_CASE renames (`index.html` + all 5 external JS files):**
- `config` → `GAME_CONFIG` (2 sites in `index.html`).
- `game` → `GAME` (83 lines in `index.html`; 30 additional lines across `loot-system.js`, `enemy-types.js`, `multiplayer.js`, `arena-objectives.js`, `campaign-system.js`). `scene.game` (Phaser's internal scene property) was correctly preserved unchanged.

### Files Changed

- `index.html` — `⚠️` comments on `CHASSIS`, `_sndThrottle`, `_CONE_RAY_POINTS`; new `WORLD_SIZE`/`WORLD_CENTER` constants; 19 magic number replacements; `config` → `GAME_CONFIG`; `game` → `GAME` throughout.
- `js/loot-system.js` — `game` → `GAME` (7 lines).
- `js/enemy-types.js` — `game` → `GAME` (3 lines).
- `js/multiplayer.js` — `game` → `GAME` (16 lines).
- `js/arena-objectives.js` — `game` → `GAME` (2 lines).
- `js/campaign-system.js` — `game` → `GAME` (2 lines).
- `CHANGELOG.md` — this entry.
- `OVERVIEW.md` — version updated to v4.3.

---

## v4.2 — Dependency Map

**Date:** 2026-03-20 (Central Time)

Produced a complete static dependency map of the codebase in preparation for the upcoming file split. No game logic was modified.

### What Was Documented

- **Section 1 — INDEX.HTML → EXTERNAL FILES:** Every call from `index.html`'s inline script into the five external JS files, with call-site line numbers and typeof-guard status. Identified six unguarded call chains (simulation enemy spawn path calls `applyEliteModifier`/`_rollEliteModifier` directly; `checkEquipmentPickups` runs unguarded every frame in `update()`; `saveCampaignProgress`/`saveInventory`/`cleanupEquipmentDrops`/`loadCampaign*` have no guards).

- **Section 2 — EXTERNAL FILES → INDEX.HTML:** All globals and functions defined in `index.html` that the external files depend on. Includes Phaser objects (`player`, `torso`, `enemies`, `enemyBullets`, `coverObjects`, `game`), constants (`CHASSIS`, `WEAPONS`, `SHIELD_SYSTEMS`, `CHASSIS_*`, `ENEMY_COLORS`), state variables (`_round`, `_perkState`, `_gameMode`, etc.), and callback functions (`buildEnemyMech`, `buildEnemyTorso`, `damageEnemy`, `showDamageText`, `updateBars`, etc.). Notable: `multiplayer.js` **writes** `torso`, `_lArmDestroyed`, `_rArmDestroyed`, `_legsDestroyed`, and `_totalKills` back into index.html state.

- **Section 3 — EXTERNAL FILES → EXTERNAL FILES:** Two cross-file dependencies identified: (1) `loot-system.js` calls `getObjectiveLootBonus()` from `arena-objectives.js` (typeof guarded); (2) `campaign-system.js` reads and writes `_scrap` owned by `loot-system.js` (no guard).

- **Section 4 — SHARED GLOBALS:** Full table of every variable written by one file and read by another. Flags `CHASSIS` mutation by `campaign-system.js`, `_scrap` shared between two external files, `_mpMatchActive` read as a bare variable in `fire()` with no typeof guard, and `_campaignState`/`_arenaState` accessed directly by index.html bypassing their owner files' APIs.

- **Refactor Risk Summary:** Ranked table of the highest-risk items to address before any file is moved.

### Files Changed

- `DEPENDENCY_MAP.md` — created (new file, project root)
- `CHANGELOG.md` — this entry

---

## v4.1 — PVP Bug-Fix Audit

**Date:** 2026-03-20 (Central Time)

Eliminated all PvE-bleed into PVP, guaranteed cleanup of every remote-player object on disconnect or exit, and ensured a fully clean state when switching from PVP into simulation or campaign.

### Area 1 — PvE Bleed into PVP

- **`update()` — `updateColossusStand` unguarded (index.html):** The call to `updateColossusStand(time)` was placed after the `if (_gameMode !== 'pvp')` block and therefore ran every frame in PVP mode. Moved it inside the guard block alongside the other PvE-only per-frame systems.

- **`deployMech()` — round HUD and `startRound()` unguarded (index.html):** Inside the drop-in tween `onComplete`, the `round-hud` element was unconditionally shown and `startRound(_round)` was unconditionally called. If `deployMech()` were invoked in PVP mode (or called defensively), this would have spawned PvE enemies, set up arena/objectives, and displayed the round counter. Wrapped the entire block in `if (_gameMode !== 'pvp')`.

- **`startRound()` — no PVP guard (index.html):** No early-return existed at the top of the function. Added `if (_gameMode === 'pvp') return;` as the first statement so that any path that calls `startRound()` during PVP — including future code — is silently skipped rather than spawning enemies, running the arena/objective system, or mutating `_roundTotal`.

- **`onEnemyKilled()` — no PVP guard (index.html):** The function had no PVP guard. If called during PVP (e.g. from a leftover timer or future code), it would increment `_roundKills`, call `_spawnExtractionPoint()`, and display a "REACH EXTRACTION POINT" banner. Added `if (_gameMode === 'pvp') return;` at the top.

- **`_triggerExtraction()` — no PVP guard (index.html):** No early-return existed. Extraction sets `_roundClearing = true`, runs campaign XP logic, calls `showPerkMenu()`, and blocks `update()` — none of which should ever run in PVP. Added `if (_gameMode === 'pvp') return;` at the top.

### Area 2 — Remote Player Cleanup

- **`mpDisconnect()` — remote player visuals leaked on clear (js/multiplayer.js):** `_mpPlayers.clear()` dropped the JS references but never called `mpDestroyRemotePlayer()` for each entry. Any remote players that existed at disconnect time (e.g. when leaving a lobby that had previously started a match) would remain as orphaned Phaser scene objects — body sprites, torso containers, and name tags — with no path to destruction. Added a `_mpPlayers.forEach(mpDestroyRemotePlayer)` loop immediately before the `.clear()` call.

- **`mpCleanupMatch()` — kill-feed overlay not hidden (js/multiplayer.js):** The `#mp-killfeed` overlay was shown via `mpShowKillFeedOverlay()` at match start but never hidden in `mpCleanupMatch()`. After a match ended or the player disconnected, the kill feed remained visible on top of the main menu or hangar. Added `killfeedEl.style.display = 'none'` to the UI teardown block in `mpCleanupMatch()`.

- **`mpCleanupMatch()` — `_mpAlive`, `_mpKills`, `_mpDeaths`, `_mpMySpawn` not reset (js/multiplayer.js):** These four fields were only initialised in the `match-begin` handler, never reset in `mpCleanupMatch()`. A player who died in one match would re-enter the next match with `_mpAlive = false`, locking them out of firing and state-sends. Reset all four to their default values (`_mpAlive = true`, `_mpKills = 0`, `_mpDeaths = 0`, `_mpMySpawn = null`) inside `mpCleanupMatch()`.

- **`_pvpBackToMenu()` — bypassed all cleanup and state reset (js/multiplayer.js):** The function only called `mpHidePvpHangar()` and manually set `main-menu` to visible, bypassing `_cleanupGame()`, `mpCleanupMatch()`, `mpDisconnect()`, and all variable resets. Any remote player objects or socket listeners active at that point were leaked, and `_gameMode` was left as `'pvp'`. Replaced the manual display code with a call to `goToMainMenu()`, which now contains the full PVP exit path (see Area 3).

### Area 3 — State Reset on Mode Switch

- **`goToMainMenu()` — no PVP cleanup path (index.html):** When called while `_gameMode === 'pvp'`, `goToMainMenu()` went straight into `_cleanupGame()`, which in PVP mode preserves the local player mech and all remote player objects (by design, to keep them alive during a match). The remote players were never destroyed, the Socket.IO socket was never disconnected, and `_pvpHangarOpen`/`_mpChatOpen` were never reset. Added a PVP guard block at the top of `goToMainMenu()` that, when `_gameMode === 'pvp'`: (1) calls `mpCleanupMatch()` to destroy all remote player scene objects; (2) calls `mpDisconnect()` to null the socket and remove all state intervals; (3) resets `_pvpHangarOpen = false` and `_mpChatOpen = false`; (4) hides the `#pvp-hangar` and `#mp-pvp-menu` overlays; (5) sets `_gameMode = 'simulation'` so the subsequent `_cleanupGame()` call destroys the local PVP mech objects instead of preserving them.

- **`_pvpQuitToMenu()` — manual state reset missed `_round`, `_perkState`, `loadout`, `_inventory` (js/multiplayer.js):** The function manually showed the main menu div and called `startMenuGrid()` but did not reset any game state variables. A PVP session followed by a simulation run would start with whatever `_round`, `_perkState`, `loadout`, and `_inventory` were set to during PVP (or from a prior session). Replaced the entire manual teardown block with a `goToMainMenu()` call (preceded by `_mpSocket?.emit('return-to-lobby')` so the server is notified before disconnect). `goToMainMenu()` now performs the full PVP cleanup path and resets all state.

### Version Bump

- **Version display updated to v4.1 in `#main-menu` subtitle and OVERVIEW.md.**

### Files Changed

- `index.html` — `update()` (moved `updateColossusStand` inside PVP guard); `startRound()` (added PVP guard); `onEnemyKilled()` (added PVP guard); `_triggerExtraction()` (added PVP guard); `deployMech()` drop-in `onComplete` (guarded round-hud show and `startRound()` call); `goToMainMenu()` (added PVP cleanup block: `mpCleanupMatch`, `mpDisconnect`, flag resets, overlay hides, `_gameMode` downgrade); version bump to v4.1
- `js/multiplayer.js` — `mpDisconnect()` (added remote-player destroy loop before `_mpPlayers.clear()`); `mpCleanupMatch()` (added `#mp-killfeed` hide; reset `_mpAlive`, `_mpKills`, `_mpDeaths`, `_mpMySpawn`); `_pvpBackToMenu()` (replaced manual display with `goToMainMenu()` call); `_pvpQuitToMenu()` (replaced manual teardown with `goToMainMenu()` call)
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v4.1

---

## v4.0 — Audio System Audit

**Date:** 2026-03-20 (Central Time)

Hardened the entire Web Audio engine against node leaks, unbounded `_activeNodes` growth, unthrottled high-frequency sound calls, premature AudioContext creation, and missing tab-visibility handling.

### Area 1 — Node Cleanup & `_activeNodes` Accuracy

- **Added `_lastNodeStartTime` tracking to `_tone()` and `_noise()` (index.html):** Both functions now set `_lastNodeStartTime = performance.now()` immediately after incrementing `_activeNodes`. This timestamp is used by the periodic audit (see next bullet) to detect when all in-flight nodes must have completed.

- **Added periodic audit `_auditActiveNodes` inside `_getAC()` (index.html):** A `setInterval` (2000 ms) is registered the first time the AudioContext is created. On each tick it checks two conditions: (1) if `_ac.state === 'closed'`, `_activeNodes` is reset to `0` immediately — closed-context nodes never fire `onended` so the counter would otherwise be stuck; (2) if `_activeNodes > 0` but more than `1500 ms` have elapsed since the last node was started (longer than the longest possible sound), the counter is also reset to `0`. This prevents the `_MAX_NODES` cap from permanently silencing audio after a rare `onended` dropout.

- **Added `if (!ac) return;` guard to `_tone()` and `_noise()` (index.html):** `_getAC()` now returns `null` before the first user gesture and when the context is closed. Both synthesis functions bail out immediately on a `null` return rather than relying on the outer `try/catch` to swallow a `TypeError`. This makes the early-exit explicit and avoids an unnecessary exception being generated and silently eaten on every call before the player has interacted.

- **`_activeNodes` safety floor already present — confirmed correct (index.html):** Both `onended` handlers use `Math.max(0, _activeNodes - 1)`, ensuring the counter can never go negative. No change needed here; documented as verified.

### Area 2 — Throttle Gaps

- **`sndShieldDeactivate()` — added `_canPlay('sdact', 300)` guard (index.html):** This function had no throttle at all. It is called via `activateShield()` expiry and could fire in rapid succession if the barrier mod cycled quickly.

- **`sndRage()` — added `_canPlay('rage', 500)` guard (index.html):** No throttle existed. Multiple rage stacks, the Titan boss rage effect, and the secondary rage mod path all call this function independently.

- **`sndJump()` — added `_canPlay('jump', 250)` guard (index.html):** No throttle existed. Rapid jump key presses (or the sprint-boosters perk reducing cooldown) could fire nodes faster than they complete.

- **`sndLoot(type)` — added `_canPlay('loot_' + type, 200)` guard (index.html):** No throttle existed. Walking over a cluster of loot orbs triggers one call per orb per frame until each is consumed, potentially stacking many simultaneous nodes.

- **`sndCommanderSpawn()` — added `_canPlay('cmdsn', 300)` guard (index.html):** No throttle existed. Squad-based spawns can produce multiple commanders in the same tick, particularly in campaign mode with staggered spawning.

- **`sndRoundClear()` — added `_canPlay('rclr', 500)` guard (index.html):** No throttle existed. While typically a one-shot event, the guard protects against double-fire if the round-end path is re-entered during the perk-menu transition.

- **`sndRoundStart()` — added `_canPlay('rstrt', 500)` guard (index.html):** No throttle existed. Same rationale as `sndRoundClear()`.

- **Drone fire sound (line in `_spawnDrone` fire callback) — wrapped with `_canPlay('drone_fire', 150)` (index.html):** The Overwatch perk can activate two drones simultaneously, each firing on independent 1000 ms timers. The two fire events can coincide within the same frame, doubling the node cost with no throttle. Throttled at 150 ms to allow distinct sounds for near-simultaneous hits while preventing duplicates.

- **Missile impact sound (in `activateMissiles()` tween onComplete) — wrapped with `_canPlay('mslimp', 100)` (index.html):** Up to 3 missiles land within 150 ms of each other (150 ms stagger × 3), all calling `_noise()` directly with no throttle. Added 100 ms minimum gap so the first impact is always audible.

- **Medic heal sound (in `spawnMedic()` heal-aura timer) — wrapped with `_canPlay('medic_heal', 500)` (index.html):** Multiple medics share the same 2500 ms heal timer but their callbacks are not synchronized. In a round with several medics, multiple `_tone()` calls could arrive in the same frame with no throttle.

- **Titan artillery impact sound (in `spawnTitan()` phase-1 artillery timer) — wrapped with `_canPlay('art_imp', 100)` (index.html):** Phase 1 fires 3 mortar rounds every 2000 ms; phase 3 fires additional alternating attacks every 2500 ms. Each mortar's tween `onComplete` called `_tone()` directly, producing up to 3 concurrent unthrottled nodes every 2 seconds.

### Area 3 — AudioContext Lifecycle

- **Added `_audioReady` flag and `_onFirstUserGesture` handler (index.html):** `_getAC()` now returns `null` and skips context creation until `_audioReady` is `true`. The flag is set by a one-shot `mousedown`/`keydown` listener (`_onFirstUserGesture`) that removes itself after the first event. This satisfies the browser autoplay policy, which requires an AudioContext to be created or resumed within a user-gesture handler, and prevents a silent suspended-context from being constructed during script evaluation or Phaser init.

- **Added `_onVisibilityChange` handler (index.html):** `document.addEventListener('visibilitychange', ...)` calls `_ac.suspend()` when `document.hidden` is `true` and `_ac.resume()` when the tab becomes visible again (only if the state is `'suspended'`, to avoid calling `resume()` on a running or closed context). This stops audio processing while the game is in the background, reducing CPU usage and preventing sounds from playing into an unlistened-to context.

- **Both lifecycle handlers registered in an IIFE `_initAudioLifecycle()` (index.html):** Wrapped in an immediately-invoked function expression to keep the listener references contained and avoid polluting the module-level scope with one-shot helper functions.

### Version Bump

- **Version display updated to v4.0 in `#main-menu` subtitle and OVERVIEW.md.**

### Files Changed

- `index.html` — audio globals (added `_lastNodeStartTime`, `_audioReady`); `_getAC()` (added `_audioReady` guard, `_auditActiveNodes` setInterval); `_tone()` (added `if (!ac) return`, `_lastNodeStartTime` update); `_noise()` (added `if (!ac) return`, `_lastNodeStartTime` update); `sndShieldDeactivate()` (added throttle); `sndRage()` (added throttle); `sndJump()` (added throttle); `sndLoot()` (added per-type throttle); `sndCommanderSpawn()` (added throttle); `sndRoundClear()` (added throttle); `sndRoundStart()` (added throttle); `_spawnDrone()` drone fire callback (added throttle); `activateMissiles()` impact callback (added throttle); `spawnMedic()` heal-aura callback (added throttle); `spawnTitan()` artillery impact callback (added throttle); `_initAudioLifecycle()` IIFE (new — user-gesture guard + visibility handler); version bump to v4.0
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v4.0

---

## v3.9 — Accessibility & UX Audit

**Date:** 2026-03-20 (Central Time)

Eliminated all purely mouse-only interactions in menus and overlays, replaced hardcoded pixel sizes that broke at narrow viewports, added visible loading and error feedback to every async operation, and corrected cursor/physics state across all overlay open/close paths.

### Area 1 — Mouse-Only Interactions: Keyboard Support Added

- **Global keydown handler rewritten (index.html):** Restructured the single `document.addEventListener('keydown', ...)` handler to process overlays in priority order before falling through to `togglePause`. Perk menu, death screen, equip prompt, campaign shop/slots/upgrades, leaderboard, and stats overlay are all now checked first so Escape and Enter work in every context regardless of which layer is frontmost.

- **Perk menu — number keys 1–4 pick a perk; arrow keys navigate cards; Enter confirms (index.html `showPerkMenu`):** Added module-level `_currentPerkKeys[]` and `_currentPerkNextRound` so the keydown handler can resolve the selection without DOM traversal. Each `.perk-card` is now `tabindex="0"` with `role="button"` and an `aria-label`. The slot label shows the `[N]` hint so keyboard users can see which key to press. Focus is moved to the first card when the menu opens. Cards also handle `keydown` for Enter/Space directly.

- **Death screen — Enter triggers primary action, Escape goes to main menu (index.html global keydown):** The death screen check fires before any pause or overlay handling, preventing Enter from leaking through to the game loop.

- **Equip-prompt — Enter opens inventory, Escape skips (index.html global keydown + `_showEquipPrompt`):** The equip prompt was entirely keyboard-inaccessible. Keyboard shortcuts now match the two visible buttons.

- **Leaderboard — Escape closes it (index.html global keydown):** Previously only the "MAIN MENU" button could dismiss the leaderboard.

- **Stats/Loadout overlay — Escape closes it from any context (index.html global keydown):** This was missing when the overlay was opened from the hangar (not deployed). The check is now in the global handler and fires correctly in both deployed and hangar contexts.

- **Main menu — Up/Down arrow keys move focus between buttons; Escape closes campaign sub-menu (index.html `_mainMenuKeyNav` listener):** Added a dedicated named keydown handler that attaches to document and routes arrow key presses to the visible button list (main or campaign sub-menu), enabling full keyboard navigation without a mouse.

- **Campaign sub-menu — first button focused on open (index.html `showCampaignSubMenu`):** After the cloud check resolves and the correct buttons are visible, focus is moved to the first enabled button so arrow navigation begins immediately.

- **Pause menu — first button focused on open (index.html `togglePause`):** When the pause overlay is shown, `firstPauseBtn.focus()` ensures Tab and arrow keys work immediately for keyboard-only users.

- **Campaign chassis select — Left/Right arrows pick chassis; Enter confirms; Escape cancels (index.html global keydown):** The `mission-select-overlay` is tagged `dataset.mode = 'chassis-select'` while in chassis selection mode so the handler can distinguish it from the mission list screen. `_cancelNewCampaign()` now also cleans up the dataset attribute on close.

- **Campaign shop, loadout-slots, upgrades overlays — Escape closes each and returns to mission select (index.html global keydown):** Three campaign overlays from `campaign-system.js` are now keyboard-dismissible via `_closeShop()`, `_closeLoadoutSlots()`, and `_closeUpgrades()` (all called with `typeof` guards).

### Area 2 — Screen Size Assumptions: Responsive Fixes

- **Boss HP bar — hardcoded `width:440px` and `min-width:480px` replaced with viewport-relative values (index.html HTML):** `#boss-hud` now uses `min-width:min(480px,96vw)` and `max-width:96vw`; `#boss-bar-track` uses `width:min(440px,calc(96vw - 40px))`. The bar shrinks gracefully on any screen narrower than ~530px instead of overflowing.

- **Perk cards — `width:200px` replaced with `clamp(160px, 200px, calc(50vw - 24px))` (index.html CSS):** Cards contract on screens narrower than ~450px so the perk menu remains usable on small viewports.

- **Perk card focus state added to CSS (index.html CSS):** `.perk-card:focus` now shares the hover style (glow, border highlight, translateY), giving keyboard users a clear visual indicator without a browser default focus ring.

- **Phaser canvas resize handler added (index.html, after `new Phaser.Game`):** `window.addEventListener('resize', _onWindowResize)` calls `game.scale.resize(window.innerWidth, window.innerHeight)` so the canvas fills the window correctly after any browser resize, browser zoom change, or device orientation change.

### Area 3 — Error & Loading States: Async Feedback

- **`_showCloudStatusToast(msg, isError)` helper added (index.html):** Creates a small fixed-position toast in the top-right corner that fades out after 2.4 s. Used to surface silent async results to the player without blocking UI.

- **`saveToCloud()` now shows success/failure toast (index.html):** On a successful Supabase upsert the toast reads "CLOUD SAVE SYNCED" (cyan). On a network error or non-OK response it reads "CLOUD SAVE FAILED — SAVED LOCALLY" (red). Previously all outcomes were silent apart from a `console.warn`.

- **Campaign resume — button disabled and relabeled "LOADING SAVE DATA…" during `_loadCampaignData()` (index.html `startGame`):** The "RESUME CAMPAIGN" button now gives visible feedback while the cloud fetch is in progress. The button is re-enabled and its original label is restored in the `.finally()` handler regardless of whether the load succeeded or fell back to localStorage.

- **Campaign sub-menu — "CHECKING SAVE DATA…" label shown while cloud check runs (index.html `showCampaignSubMenu`):** When no local save exists, the resume button is temporarily enabled, relabeled, and disabled during the async cloud check rather than silently flickering in/out of view.

- **Socket.IO connection error — error state shown in lobby status bar (js/multiplayer.js `mpConnect`):** `connect_error` now updates `#mp-lobby-status` to "CONNECTION FAILED — CHECK SERVER" in red. `disconnect` updates it to "DISCONNECTED — RECONNECTING…" in red rather than reverting to the static "CONNECTING…" string that gave no indication of a prior failure.

### Area 4 — UI State Consistency: Overlay/Cursor/Physics

- **Equip-prompt cursor fix (index.html `_showEquipPrompt`):** When the equip-prompt overlay appears, the cursor is now explicitly set to `'default'` (both on the DOM body and via Phaser's `setDefaultCursor`). Previously the cursor remained `'none'` (the in-game cursor) while the prompt was visible, making the mouse pointer invisible and the buttons effectively unclickable without knowing cursor position.

- **Global ESC handler ordering fixed (index.html global keydown):** The handler now checks overlays in strict priority order — perk menu → death screen → equip prompt → campaign overlays → leaderboard → stats overlay → chassis select → pause — ensuring that Escape always closes the topmost visible layer and never leaks through to trigger a second action.

- **`_cancelNewCampaign()` cleans up `dataset.mode` (index.html):** The chassis-select `data-mode` attribute is now removed from `mission-select-overlay` on cancel so the chassis-select ESC handler does not accidentally intercept keys when the overlay is later reused for the campaign mission list.

### Version Bump

- **Version display updated to v3.9 in `#main-menu` subtitle and OVERVIEW.md.**

### Files Changed

- `index.html` — `showPerkMenu()` (tabindex/role/aria-label/key-hint on cards, focus first card); global keydown handler (perk keys 1–4, death-screen Enter/ESC, equip-prompt Enter/ESC, campaign overlays ESC, leaderboard ESC, stats ESC, chassis-select arrows/Enter/ESC); `_mainMenuKeyNav` listener (arrow key main menu nav); `togglePause()` (focus first button on open); `_showEquipPrompt()` (cursor fix); `showCampaignSubMenu()` (loading state + focus); `showCampaignSubMenu()` (first-button focus); `_showNewCampaignChassisSelect()` (dataset.mode tag); `_cancelNewCampaign()` (clear dataset.mode); `startGame()` (campaign loading state with disable/relabel); `saveToCloud()` (success/fail toast); `_showCloudStatusToast()` (new helper); `.perk-card` CSS (clamp width, :focus state); `#boss-hud`/`#boss-bar-track` (responsive min/max/width); `window resize` listener (Phaser canvas resize); version bump to v3.9
- `js/multiplayer.js` — `mpConnect()` (`connect_error` and `disconnect` error states in lobby status)
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v3.9

---

## v3.8 — State Reset Audit

**Date:** 2026-03-20 (Central Time)

Eliminated all stale global state that could carry over between runs, mode switches, and rounds by auditing every cleanup and reset path and adding the missing explicit resets.

### Area 1 — `_cleanupGame()` Missing Resets

- **`_roundClearing` and `_roundActive` not reset in `_cleanupGame()` (index.html):** Both flags were only reset by callers (`returnToHangar`, `respawnMech`) after `_cleanupGame()` returned. Any future caller added without explicit post-reset would inherit stale `true` values, permanently gating `update()` or allowing logic to run while a round is supposedly inactive. Fixed: added `_roundClearing = false; _roundActive = false;` directly inside `_cleanupGame()`.

- **`_lArmDestroyed`, `_rArmDestroyed`, `_legsDestroyed` not reset in `_cleanupGame()` (index.html):** These flags were cleared by `_resetHUDState()` (called later in `returnToHangar`/`respawnMech`) but not by `_cleanupGame()` itself. `goToMainMenu()` called `_cleanupGame()` but not `_resetHUDState()`, leaving the destroyed flags set when returning to the main menu. Fixed: added explicit resets to `_cleanupGame()`.

- **`window._activeDecoy`, `window._phantomDecoys` not cleaned up in `_cleanupGame()` (index.html):** `_clearMapForRound()` cleaned these between rounds, but if the player quit mid-round (death or pause→quit), the decoy torso remained a live (or destroyed) scene object and the phantom decoy timer events kept firing. Fixed: `_cleanupGame()` now explicitly destroys the active decoy, removes drift/fire timer events on all phantom decoys, and nulls both window references.

- **`window._activeSwarm` not nulled in `_cleanupGame()` (index.html):** The swarm boss `_swarmState` was only nulled on swarm defeat (inside `damageEnemy`). Quitting during a swarm boss fight left `window._activeSwarm` pointing to a defunct state object. Fixed: `_cleanupGame()` now removes the swarm tick timer and nulls `window._activeSwarm`.

- **`window._equipPromptCallback` not cleared in `_cleanupGame()` (index.html):** If the player opened the gear overlay from the equip-item prompt and then died/quit before closing it, the stored callback survived into the next session. The next time the loadout overlay was closed, the old callback would fire spuriously, triggering `startRound()` outside its intended context. Fixed: `window._equipPromptCallback = null` added to `_cleanupGame()`.

### Area 2 — `goToMainMenu()` Mode-Switch Resets

- **`CHASSIS.medium.modCooldownMult` not restored in `goToMainMenu()` (index.html):** `tactical_uplink` mod permanently mutates `CHASSIS.medium.modCooldownMult` from `0.85` toward `0.60` each time it is equipped. The restore line (`CHASSIS.medium.modCooldownMult = 0.85`) existed in `returnToHangar()` and `respawnMech()` but was absent from `goToMainMenu()`. A medium-chassis player who equipped `tactical_uplink` and quit directly to the main menu (via pause → Quit) would carry the reduced cooldown into the next simulation run even without the mod equipped. Fixed: restore line added to `goToMainMenu()`.

- **`_roundTotal` not reset in `goToMainMenu()` (index.html):** `_roundTotal` was omitted from the round-state reset block (`_round`, `_roundKills`, `_roundActive` were present). Fixed: added `_roundTotal = 0` to the same reset line.

- **Extraction state (`_extractionActive`, `_extractionPoint`, `_extractionVisuals`, `_extractionPromptShown`) not reset in `goToMainMenu()` (index.html):** These four variables were reset in `returnToHangar()` and `respawnMech()` but missing from `goToMainMenu()`. Fixed: added the full extraction reset block to `goToMainMenu()`.

- **`_lArmDestroyed`, `_rArmDestroyed`, `_legsDestroyed` not reset in `goToMainMenu()` (index.html):** `goToMainMenu()` calls `_cleanupGame()` and `resetLoadout()` but not `_resetHUDState()`. Fixed: explicit arm-destroyed resets added (now also covered by `_cleanupGame()` per Area 1, providing double insurance).

- **`_perkState` reset in `goToMainMenu()` was missing 15 legendary/chassis perk fields (index.html):** The one-liner `_perkState = { ... }` in `goToMainMenu()` was an older copy that pre-dated the legendary perk additions. Missing fields: `lightSpectre`, `lightGhostMech`, `mediumCommand`, `mediumApexSystem`, `heavyDreadnought`, `heavyTitan`, `adaptiveEvolution`, `heavyCoreTank`, `_heavyCoreTankUsed`, `heavyRampage`, `mediumOverload`, `mediumSalvage`, `mediumMultiMod`, `apexPredator`, `_apexPredatorActive`. A run where any of these perks were picked would leave them active in the next run's starting state. Fixed: replaced the stale one-liner with the canonical multi-line form matching `returnToHangar()`.

- **`window._spectreClones`, `_lastKillTime`, `window._missionStartTime` not reset in `goToMainMenu()` (index.html):** All three were reset in `returnToHangar()` but omitted from `goToMainMenu()`. Fixed: added all three to `goToMainMenu()`.

### Area 3 — Per-Round Reset in `resetRoundPerks()`

- **`_heavyCoreTankUsed` not reset at round start (index.html):** `heavyCoreTank` perk (legendary heavy) allows the player to survive one lethal hit per round. The `_heavyCoreTankUsed` flag that tracks this was set to `false` by the perk's `apply()` function (on pick) and on full `_perkState` wipe, but never reset by `resetRoundPerks()`. So after the first round where the player triggered the save, the perk would not activate again in subsequent rounds. Fixed: added `if (_perkState.heavyCoreTank) _perkState._heavyCoreTankUsed = false;` to `resetRoundPerks()`.

### Area 4 — `window.*` Globals in `returnToHangar()`

- **`_lastKillTime` not reset in `returnToHangar()` (index.html):** The module-level `_lastKillTime` counter (used for multi-kill streak tracking) was never zeroed on hangar return. A player who got a kill streak on their last round before returning to hangar would have a ~2-second window where the stale timestamp could falsely trigger streak logic on the very first kill of the next deploy. Fixed: `_lastKillTime = 0` added to `returnToHangar()`.

- **`window._missionStartTime` not reset in `returnToHangar()` (index.html):** The campaign mission speed-run timer was set at the start of each round and read at extraction to compute elapsed time. It was never nulled on hangar return, meaning a subsequent deploy's first bonus-objective check could read a time from a previous mission. Fixed: `window._missionStartTime = null` added to `returnToHangar()`.

### Files Changed

- `index.html` — `_cleanupGame()` (added `_roundClearing`, `_roundActive`, `_lArmDestroyed`/`_rArmDestroyed`/`_legsDestroyed`, `window._activeDecoy`/`window._phantomDecoys`, `window._activeSwarm`, `window._equipPromptCallback` resets); `goToMainMenu()` (added `_roundTotal`, extraction state, arm-destroyed flags, `CHASSIS.medium.modCooldownMult`, full `_perkState` with 15 legendary fields, `window._spectreClones`, `_lastKillTime`, `window._missionStartTime`); `resetRoundPerks()` (added `_heavyCoreTankUsed` per-round reset); `returnToHangar()` (added `_lastKillTime`, `window._missionStartTime`); version bump to v3.8
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v3.8

---

## v3.7 — Security & Input Validation Audit

**Date:** 2026-03-20 (Central Time)

Hardened all leaderboard submission paths, callsign handling, and external-data DOM rendering against score manipulation, filter bypass via paste, and XSS from Supabase-fetched strings.

### Area 1 — Leaderboard Score Integrity

- **Added validation constants `SCORE_MAX_ROUND`, `SCORE_MAX_KILLS`, `SCORE_MAX_DAMAGE` (index.html):** Defined upper bounds for submitted values — round cap 999, kills cap 30,000 (~30/round × 999 rounds), damage cap 100,000,000. These are used by `_validateScoreEntry()` to clamp all numeric fields.

- **Added `_validateScoreEntry(entry)` helper (index.html):** New function that clamps every numeric field via `Math.min/max/round(Number(...))`, restricts `chassis` to the known enum `['light','medium','heavy']`, and sanitizes `name` through `_sanitizeCallsign()`. Returns a safe, type-coerced copy of the entry.

- **`_capturePendingRun()` now passes raw values through `_validateScoreEntry()` (index.html):** All fields — round, kills, accuracy, damage, and name — are validated and clamped before being stored in `_pendingRun`. Accuracy was already computed as a ratio but is now also hard-clamped to 0–100.

- **`_insertScore()` validates entry before any Supabase or localStorage write (index.html):** First line of `_insertScore()` now calls `entry = _validateScoreEntry(entry)`, ensuring values are clamped even if called directly with unvalidated data.

### Area 2 — Callsign Sanitization

- **Added `_sanitizeCallsign(raw)` helper (index.html):** Single source of truth for callsign normalization — uppercases, strips all characters not in `[A-Z0-9 _.\-]` (matching the `_csKeyDown` allowlist), and slices to 16 characters. Falls back to `'ANONYMOUS'` if the result is empty.

- **`proceedToMainMenu()` now runs callsign through `_sanitizeCallsign()` before storing (index.html):** Previously the raw `.trim().toUpperCase()` value was stored directly, allowing characters inserted via paste (Ctrl+V) to bypass the `_csKeyDown` key filter. Fixed: `_playerCallsign = _sanitizeCallsign(val)` and the localStorage write uses the sanitized value.

- **`startGame()` sanitizes the localStorage/input fallback callsign (index.html):** The fallback path that reads `menu-callsign` or `localStorage.getItem('tw_callsign')` now wraps the result in `_sanitizeCallsign()` before assigning to `_playerCallsign`.

- **`startMultiplayer()` sanitizes the localStorage/input fallback callsign (index.html):** Same fix applied to the PVP entry path.

### Area 3 — External Data Rendering

- **Added `_escapeHtml(str)` helper (index.html):** Escapes `&`, `<`, `>`, `"`, and `'` for safe use in `innerHTML` contexts. Available for future use wherever fetched strings must be injected as HTML.

- **`_renderScores()` rewritten to use DOM construction instead of `innerHTML` for all fetched data (index.html):** The previous implementation built a template-literal string containing `e.name`, `e.chassis`, and numeric fields and injected it via `table.innerHTML = header + rows`. A malicious or corrupt Supabase record with HTML in the `name` field would have been executed as markup. Fixed: each row is now built with `document.createElement('div')` / `document.createElement('span')` and all cell content is assigned via `span.textContent`, which the browser always treats as plain text. Numeric fields are coerced with `Number()` before display. String fields (`name`, `chassis`) pass through `_sanitizeCallsign()`. The static header row (no fetched data) retains `innerHTML` for its fixed template.

### Files Changed

- `index.html` — added `SCORE_MAX_ROUND`, `SCORE_MAX_KILLS`, `SCORE_MAX_DAMAGE` constants; added `_sanitizeCallsign()`, `_escapeHtml()`, `_validateScoreEntry()` helpers; updated `_capturePendingRun()`, `_insertScore()`, `proceedToMainMenu()`, `startGame()`, `startMultiplayer()`, `_renderScores()`; version bump to v3.7
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v3.7

---

## v3.6 — Save & Persistence Audit

**Date:** 2026-03-20 (Central Time)

Audited all save/load paths, corrupt-save handling, cloud vs local sync logic, and state-bleed between runs; fixed every asymmetry and bleed found.

### Area 1 — Save/Load Symmetry

- **`saveCampaignProgress()` (loot-system.js) missing timestamp field:** `tw_campaign_progress` was saved without a time marker, so `_loadCampaignData()` had no basis for choosing between an older cloud record and a newer local one. Fixed: added `savedAt: Date.now()` to the progress object. This field is now read in `_loadCampaignData()` for cloud vs local comparison (see Area 3).

### Area 2 — Corrupt Save Handling

- **Equipped-item validation only checked `name`, not `rarity`/`baseType`:** `loadCampaignInventory()` and `_restoreFromCloudData()` both filtered inventory items by `name && rarity && baseType` but validated equipped-slot objects only by `name`. A saved equipped item with a `name` but corrupt or missing `rarity`/`baseType` fields would pass into `_equipped` and could cause `recalcGearStats()` errors or silent stat miscalculations. Fixed: both load paths now require `name && rarity && baseType` before accepting an equipped item — matching the existing inventory filter in both functions.

### Area 3 — Cloud vs Local Sync

- **`_loadCampaignData()` always preferred cloud over local with no timestamp check:** If a cloud save succeeded at time T but the player then played more missions (saving locally at T+N) before the cloud sync timer fired, a page reload would restore the older cloud record and silently roll back T+N of progress. Fixed: `_loadCampaignData()` now reads `localSavedAt` from the local progress before hitting the network, compares it against `cloudData.updated_at`, and only restores from cloud when `cloudTs >= localSavedAt`. When local is newer (e.g. cloud sync failed), the localStorage path is used instead, preserving the player's most recent state.

### Area 4 — State Bleed Between Runs

- **`goToMainMenu()` did not reset inventory for simulation mode:** If a player deployed a simulation run (accumulating inventory drops, scrap, and gear state), then quit directly to main menu via pause or death screen (bypassing `returnToHangar()`), `_inventory`, `_equipped`, `_scrap`, and `_gearState` were left intact. The next simulation deploy would start with the previous run's gear already in `_equipped`, causing incorrect `recalcGearStats()` values at `deployMech()`. Fixed: `goToMainMenu()` now calls `resetInventory()` when `_gameMode !== 'campaign'`, clearing all four state variables and equipping fresh starter gear before the player can deploy again.

- **`confirmNewCampaign()` did not reset `_campaignState.chassis`:** Starting a new campaign via the menu wiped `playerLevel`, `playerXP`, `completedMissions`, `skillsChosen`, `claimedRewards`, and `loadoutSlots` but left `_campaignState.chassis` set to the previous campaign's locked chassis. The subsequent chassis selection screen would immediately re-lock to the old value in `_loadCampaignData()` because `if (_campaignState.chassis) loadout.chassis = _campaignState.chassis` runs after every load. Fixed: added `_campaignState.chassis = null` to the reset block in `confirmNewCampaign()`.

- **`respawnMech()` duplicated the stat-counter reset line:** `_shotsFired = 0; _shotsHit = 0; _damageDealt = 0; _damageTaken = 0; _perksEarned = 0;` appeared twice in sequence (lines 11901 and 11904 in the original file), with only `_roundClearing = false` and the extraction reset between them. The duplicate was dead code but masked a subtle ordering question. Removed the second copy; the single reset at line 11901 is authoritative.

### Files Changed

- `js/loot-system.js` — `saveCampaignProgress()` (added `savedAt` field); `loadCampaignInventory()` (equipped item validation requires `rarity && baseType`)
- `index.html` — `_restoreFromCloudData()` (equipped item validation requires `rarity && baseType`); `_loadCampaignData()` (timestamp comparison before restoring cloud); `goToMainMenu()` (call `resetInventory()` for simulation mode); `confirmNewCampaign()` (reset `_campaignState.chassis = null`); `respawnMech()` (removed duplicate stat reset line)
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v3.6

---

## v3.5 — Performance & Memory Audit

**Date:** 2026-03-20

Eliminated per-frame heap allocations in the enemy AI hot loop, stopped orphaned `repeat:-1` tweens on projectiles and boss labels, and destroyed all leaked physics overlap colliders across player and enemy weapon fire paths.

### Area 1 — Object Creation in `update()` Hot Loops

- **`handleEnemyAI`: `_coneCovers` filter allocated per enemy per frame:** `.filter()` on cover objects ran inside `enemies.forEach()`, allocating a new array for every enemy every frame. Fixed: a single `_activeCoverCache` is computed once before the loop and shared across all enemies.

- **`handleEnemyAI`: `_rayPoints = []` allocated per enemy per frame:** The 19-element vision-cone ray-point array was re-created each frame per enemy. Fixed: added module-level `_CONE_RAY_POINTS` pool (19 pre-allocated `{x,y}` objects) and replaced `.push({x,y})` with index-based in-place mutation (`_CONE_RAY_POINTS[_rayCount].x = ...`). Pool is frozen at 19 entries, matching the maximum cone resolution.

- **`handleEnemyAI`: `const _feelers = [0, -0.35, 0.35]` allocated per enemy per frame:** The obstacle-avoidance feeler offset array was declared inside the enemy loop. Fixed: hoisted to module-level `const _FEELER_OFFSETS = Object.freeze([0, -0.35, 0.35])`.

- **`handleEnemyAI`: `enemy._lastKnownPlayer = { x, y }` allocated each update:** Three sites reassigned the object each tick. Fixed: initial assignment creates the object once; subsequent updates mutate `.x`/`.y` in place.

- **`handleEnemyAI`: `enemy._lastPos = { x, y }` allocated each update:** Same pattern. Fixed: in-place mutation on all sites.

- **`handleEnemyAI`: `enemy._orbitRefPos = { x, y }` allocated on orbit reset:** Fixed: in-place mutation (`enemy._orbitRefPos.x = ...; enemy._orbitRefPos.y = ...`).

- **`_spawnSpectreClone` drift event (16 ms) and fire event (1000 ms): `.filter().sort()` for nearest-enemy search:** Two array allocations plus O(n log n) sort ran at 62.5 fps inside `driftEvent`. Fixed: replaced both with a single O(n) linear scan using local `nearest`/`_nearDist` variables — zero allocations per tick.

- **`activateDecoy` fire event (1200 ms): same `.filter().sort()` pattern:** Fixed with the same O(n) linear scan.

### Area 2 — Tween & Timer Leaks (`repeat: -1` Orphans)

- **`_addBossLabel` / all boss `_onDestroy` handlers:** The pulsing boss-label tween (`yoyo: true, repeat: -1`) was never stopped before its target was destroyed, leaving the tween alive in the TweenManager. Fixed: `_addBossLabel` stores the tween in `e._bossLabelTween`; every boss `_onDestroy` (Warden, Twin Razors eA/eB, Architect, Juggernaut, Mirror, Titan, Core) now calls `if (e._bossLabelTween) e._bossLabelTween.stop()` before `e.bossLabel.destroy()`.

- **`destroyEnemyWithCleanup`: medic label tween not stopped before destroy:** Added `scene.tweens.killTweensOf(e.medicLabel)` before `e.medicLabel.destroy()`.

- **`firePLSM` player plasma bolt:** The `repeat: -1` alpha-pulse tween was not linked to the projectile's lifetime. Fixed: stored as `plsmTween`; added `p.once('destroy', () => plsmTween.stop())`.

- **`fireSR` sniper round:** Same pattern. Fixed: stored as `srTween`; added `b.once('destroy', () => srTween.stop())`.

- **`fireSIEGE` cannonball:** Same pattern. Fixed: stored as `siegeBallTween`; added `ball.once('destroy', () => siegeBallTween.stop())`.

- **`enemyFire` PLSM:** Fixed: stored as `ePlsmTween`; added `p.once('destroy', () => ePlsmTween.stop())`.

- **`enemyFireSecondary` PLSM:** Fixed: stored as `secPlsmTween`; added `p.once('destroy', () => secPlsmTween.stop())`.

### Area 3 — Physics Overlap Collider Leaks

`scene.physics.add.overlap()` returns a `Collider` that persists in `scene.physics.world.colliders` until explicitly destroyed. None of the following were previously destroyed:

- **`createExplosion`:** Stored as `blastOverlap`; destroyed inside the tween `onComplete` alongside `blast.destroy()`.

- **`fireRL` player rocket:** Stored as `rlOverlap`; destroyed on enemy-hit callback and on `delayedCall(2000)` timeout path.

- **`fireSIEGE` cannonball:** Stored as `siegeOverlap`; destroyed on enemy-hit callback and on `delayedCall(3000)` timeout path.

- **`enemyFire` RL rocket:** Stored as `eRlOverlap`; destroyed on player-hit callback and on `delayedCall(2200)` timeout path.

- **`enemyFire` siege bullet:** Stored as `eSiegeOverlap`; destroyed on player-hit callback and on `delayedCall(2500)` timeout path. The `delayedCall` was also moved inside the `siege` branch so it no longer runs for non-siege weapons.

- **`enemyFireSecondary` RL rocket:** Stored as `secRlOverlap`; destroyed on player-hit callback and on `delayedCall(2200)` timeout path.

### Area 4 — Particle & Explosion Cleanup (verified, no changes needed)

- **`createImpactSparks`, `createShieldSparks`, `createShieldBreak`, `spawnDebris`:** All particles/shards are destroyed via tween `onComplete` — no orphans.
- **`fireRL` particle emitter:** `.stop()` then `delayedCall(400, destroy)` present in all code paths (hit callback and timeout).
- **Deploy dust emitter (`deployMech`):** Destroyed via `delayedCall(900)` — correct.

### Files Changed

- `index.html` — `handleEnemyAI()` (cover cache, ray-point pool, feeler constant, `_lastKnownPlayer`/`_lastPos`/`_orbitRefPos` in-place mutation), `_spawnSpectreClone()` (linear scan in drift + fire events), `activateDecoy()` (linear scan in fire event), `_addBossLabel()` (tween stored in `e._bossLabelTween`), all boss `_onDestroy` handlers (stop label tween), `destroyEnemyWithCleanup()` (kill medic label tween), `firePLSM()` / `fireSR()` / `fireSIEGE()` (stop tween on destroy), `enemyFire()` (PLSM tween, RL overlap, siege overlap), `enemyFireSecondary()` (PLSM tween, RL overlap), `createExplosion()` (blast overlap), `fireRL()` (rocket overlap)
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v3.5

---

## v3.4 — Loot System Audit Fixes

**Date:** 2026-03-20

### Bug Fixes

- **`critDmg` gear stat had no gameplay effect:** `damageEnemy()` multiplied crit hits by a hardcoded `2` regardless of `_gearState.critDmg`. Fixed: crit multiplier is now `2 + (_gearState.critDmg / 100)`, so a `+15% Crit Damage` affix correctly raises crits from 2× to 2.15×.

- **`absorbPct` gear stat had no gameplay effect:** `player._shieldAbsorb` was set from `SHIELD_SYSTEMS[loadout.shld].absorb` at deploy time and never augmented by gear. Fixed: `_gearState.absorbPct / 100` is now added at deploy time (capped at 0.90), making items like `Absorb Matrix` and `Warden's Aegis` actually increase shield absorption.

- **`autoRepair` gear stat had no gameplay effect:** The core regen loop in `update()` read only `_perkState.autoRepair`; gear items with `autoRepair` base stats (e.g. `sys_repair` mod) contributed to `_gearState.autoRepair` but were never applied. Fixed: regen now uses `_perkState.autoRepair + _gearState.autoRepair` as the combined HP/sec rate.

- **`modEffPct` gear stat had no gameplay effect:** `_gearState.modEffPct` (from items like `Amplifier`, `Overcharge Module`, `Blueprint Core`) was accumulated and shown in the stat overlay but never applied to mod durations. Fixed: each mod activation function (`activateShield`, `activateRage`, `activateEMP`, `activateGhostStep`, `activateOverclockBurst`, `activateFortressMode`) now multiplies its duration constant by `1 + (_gearState.modEffPct / 100)`. Stacks multiplicatively with the `modAmplify` unique effect.

- **`pellets` gear affix had no gameplay effect:** `fireSG()` counted pellets as `weapon.pellets + _perkState.sgFlechette` only. SG weapon items can roll a `+{v} Pellets` affix that accumulated into `_gearState.pellets` but was never read. Fixed: `fireSG()` now includes `_gearState.pellets` in the total pellet count.

- **`splashRadius` gear affix had no gameplay effect:** GL/RL/PLSM/siege weapon items can roll a `+{v}% Blast Radius` affix that accumulated into `_gearState.splashRadius` but was never applied. Fixed: `fire()` now applies a `_gearSplashMult = 1 + (_gearState.splashRadius / 100)` multiplier to `weapon.radius` when building the `_wEff` object, so all player-fired explosive weapons use the gear-boosted radius.

- **`siege` and `chain` weapons in loot drop pool:** Both were in `WEAPON_LOOT_KEYS` and could drop as loot items. These are 2H weapons that require both arm slots to share the same key (`loadout.L === loadout.R`). The loot equip system sets one arm slot at a time via `_equipItemToSlot`, so equipping either weapon via loot would leave the loadout in an invalid half-2H state. Removed both from `WEAPON_LOOT_KEYS`.

- **`_unequipItem()` silently failed when inventory full:** Clicking UNEQUIP while the backpack was at capacity returned without any feedback, making it appear as if the button was broken. Fixed: a "INVENTORY FULL" floating warning is now shown via `_showFloatingWarning()`.

### Stubbed (Known Incomplete)

- **`echoStrike` unique effect (`Echo Frame`):** The `echo_frame` epic item (Mirror boss drop) registers its effect key in `_gearState._uniqueEffects`, but no gameplay proc exists yet. Added `triggerEchoStrike()` stub with TODO comment. Requires tracking last bullet type/angle per arm and spawning a ghost projectile on mod activation.

- **`mirrorShot` unique effect (`Mirror Shard`):** Same status. Added `checkMirrorShot()` stub. Requires bullet–wall collision detection and a reflective second projectile at the bounce angle.

### Files Changed

- `js/loot-system.js` — `WEAPON_LOOT_KEYS` (removed `siege`, `chain`); added `triggerEchoStrike()` stub, `checkMirrorShot()` stub
- `index.html` — `damageEnemy()` (critDmg), `deployMech()` (absorbPct), `update()` (autoRepair), `activateShield()` / `activateRage()` / `activateEMP()` / `activateGhostStep()` / `activateOverclockBurst()` / `activateFortressMode()` (modEffPct), `fireSG()` (pellets), `fire()` (splashRadius, _wEff), `_unequipItem()` (inventory full feedback)
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — loot system status updated

---

## v3.3 — Logic Audit Fixes

**Date:** 2026-03-20

### Bug Fixes

- **Missiles deal zero damage:** `activateMissiles()` called `damageEnemy(scene, target, mod.missileDmg)` — passed `scene` as the enemy argument. Fixed to `damageEnemy(target, mod.missileDmg, 0)`. Missiles now deal their full intended damage on impact.

- **Ghost Step cloak silently fails:** `activateGhostStep()` referenced `player.torso` and `player.visuals` — properties that do not exist on the physics rectangle. Fixed to use the global `torso` container. Player sprite now correctly fades to 15% alpha during Ghost Step and restores to full alpha on expiry.

- **Rage Duration perks have no effect:** `activateRage()` computed `_rageDur` without reading `_perkState.rageDurMult`, so `berserker_fuel` (+50% duration/stack) and `rage_extend` perks were inert. Fixed to multiply `_rageDur` by `(_perkState.rageDurMult || 1)`.

- **Jump cooldown perks have no effect:** The `effectiveModCooldown` calculation applied `CHASSIS.medium.modCooldownMult` and gear `modCdPct` but never applied `_perkState.jumpCdMult` (from `ghost_step` perk: −40%/stack) or `_perkState.jumpCooldownMult` (from `jump_cooldown`/`al_cooldown` perks: −20%/stack). Added both multipliers when `loadout.mod === 'jump'`.

- **Fortress Mode `fm_heal` perk has no effect:** The 200ms heal ticker hardcoded `+ 1` HP regardless of `_perkState.fmHeal`. Fixed to `Math.round(1 * (1 + (_perkState.fmHeal || 0)))` so each `fm_heal` stack (+50%) correctly scales the heal rate.

- **`fth_wide_cone` perk only partially applies:** The perk applied `fthRange` (+20% range) but never set `fthCone`, the variable `fireFTH()` reads for cone spread width. Added `_perkState.fthCone += 0.30` to the perk's apply function so the advertised "+30% flame spread" now takes effect.

- **`dmgMult` double-applied to all bullet/FTH/RAIL/drone/spectre damage:** `damageEnemy()` applies `_perkState.dmgMult` at the canonical location (line ~10208). `fire()`, `fireFTH()`, `fireRAIL()`, `_spawnDrone()`, and `_spawnSpectreClone()` each also multiplied by `_perkState.dmgMult` before calling `damageEnemy`, causing all damage perks to deal roughly the square of their intended bonus. Removed `* (_perkState.dmgMult || 1)` from all five caller sites; `damageEnemy()` remains the single authoritative application point.

### Files Changed

- `index.html` — `activateMissiles()`, `activateGhostStep()`, `activateRage()`, `activateFortressMode()`, `handlePlayerFiring()` (effectiveModCooldown), `fireFTH()`, `fireRAIL()`, `fire()`, `_spawnDrone()`, `_spawnSpectreClone()`; perk definition `fth_wide_cone` in `_perks{}`
- `CHANGELOG.md` — this entry

---

## v3.2 — Structural Audit Fixes

**Date:** 2026-03-20

### Bug Fixes

- **Duplicate Kill Streak activation:** `onEnemyKilled()` contained two identical Kill Streak activation blocks that both fired on the activating kill, causing `_perkState.dmgMult` to be multiplied by the streak bonus twice and `_killStreakCount` to be incremented twice. Removed the first (duplicate) block; the surviving block fires after adrenaline and medium-cooldown logic as intended.

### Refactoring

- **`destroyEnemyWithCleanup(scene, e)`:** Extracted the enemy visual/physics teardown sequence (destroy `visuals`, `torso`, `cmdLabel`, `medicLabel`, `medicCross`, `shieldRing`, `_visionConeGfx`, `_splitLabel`, call `_onDestroy`) into a shared helper. Replaced three identical copy-pasted loops in `update()`, `onEnemyKilled()`, and the swarm kill path of `damageEnemy()`.

- **`resetRoundPerks()`:** Extracted 36 lines of per-round `_perkState` reset logic from the top of `startRound()` into its own named function. `startRound()` now calls `resetRoundPerks()` as its first action.

- **`handleObjectiveRoundEnd(scene)`:** Extracted the objective-based mid-round end sequence from `update()` into a named function. `update()` now calls it as a single line instead of embedding the enemy cleanup and extraction trigger inline.

- **`handleBulletEnemyOverlap(scene, bullet, enemy)`:** Extracted the ~120-line anonymous bullet/enemy overlap callback registered in `create()` into a named top-level function. `create()` now registers a thin arrow wrapper: `(b, e) => handleBulletEnemyOverlap(this, b, e)`. Removed always-false `wKey === 'sr'` condition (wKey was never in scope inside the anonymous callback). Local variables renamed to drop the incorrect underscore prefix (`_bAngle` → `bAngle`, `_bPierce` → `bulletShieldPierce`, `_bx2` → `bx`, etc.).

- **`selectPerks()`:** Extracted perk pool selection, legendary eligibility check, and slot label/color generation out of `showPerkMenu()` into `selectPerks()`. `showPerkMenu()` now calls `selectPerks()` and handles only DOM rendering. Removed local `const _legendaryKeys`, `const _eligibleLeg`, `const _offerLegendary` — all renamed without underscore prefix as locals.

- **`SLOT_ID_MAP`:** Added a shared `const SLOT_ID_MAP = { L, R, M:'mod', A:'aug', G:'leg', S:'shld' }` constant in the Garage section with inline documentation distinguishing it from `_equipped` keys (loot-system.js). `buildDD()` now uses `loadout[SLOT_ID_MAP[slotId]]` for the current-slot highlight. `selectSlot()` non-arm branch replaced with `loadout[SLOT_ID_MAP[slotId]] = key`. `toggleDD()` options dispatch replaced with a `DD_OPTIONS` lookup object.

- **`window._spectreClones` / `window._lastKillTime`:** Both moved from ad-hoc `window.` assignments to proper `let` declarations at module scope (`let _spectreClones = []`, `let _lastKillTime = 0`). All references in `_spawnSpectreClone()` and `onEnemyKilled()` updated to drop the `window.` prefix.

- **Local variable naming in `startRound()`:** `const _isCampaignMode`, `const _campaignMission`, `const _campaignEnemy`, `const _spawnCfg`, `let _elitesApplied` renamed to drop the underscore prefix (reserved for module-level private globals, not local variables). All downstream references within the function updated.

- **Local variable naming in `deployMech()`:** `const _deployScene`, `const _hitR`, `const _hitOff` renamed to `deployScene`, `hitR`, `hitOff`.

- **`_equipped.shield` / `loadout.shld` disambiguation comment:** Added inline comment at the `recalcGearStats()` call site in `deployMech()` explaining that `recalcGearStats()` reads `_equipped.shield` (loot gear, `loot-system.js`) while the loadout uses `loadout.shld`.

### Files Changed

- `index.html` — `onEnemyKilled()`, `_spawnSpectreClone()`, `create()`, `update()`, `startRound()`, `deployMech()`, `showPerkMenu()`, `buildDD()`, `toggleDD()`, `selectSlot()`, plus new functions: `destroyEnemyWithCleanup()`, `resetRoundPerks()`, `handleObjectiveRoundEnd()`, `handleBulletEnemyOverlap()`, `selectPerks()`
- `CHANGELOG.md` — this entry

---

## v3.1 — Fix Game Logic Bugs

**Date:** 2026-03-20

### Bug Fixes

- **Kill Streak double-reset:** `dmgMult` was divided twice in `processPlayerDamage` when the player took damage, causing damage to drop far below intended values.
- **Glass Step double-check:** Was checked twice (before and after `isProcessingDamage` flag set), with the first check leaving the damage lock in an inconsistent state.
- **Scrap Shield perk value consumed:** The raw `scrapShield` perk value was subtracted from directly on each hit, depleting the template so future limb destructions added less absorb buffer than intended.
- **Resonance double-application:** Shield charge per hit was applied twice in `damageEnemy` (at two separate locations), giving 2x the intended shield-per-hit.
- **Duplicate Enemy Scrap Cannon:** Identical code block executed twice per enemy limb destruction; second block was dead code due to the flag already being set.
- **Salvage Protocol double loot:** Two separate loot drops triggered per limb destruction instead of one.
- **Deep Scan perk had no effect:** `analyzerDepth` was set by the perk but never read in the Threat Analyzer damage logic. Now correctly applies 25% resistance reduction (vs 15% base).
- **Auto-repair framerate-dependent:** Used hardcoded `0.016` instead of `game.loop.delta / 1000`, causing incorrect heal rates at frame rates other than 60fps.
- **Heavy chassis DR not rounded:** Added `Math.round` for consistency with all other DR calculations.

### Files Changed

- `index.html` — `processPlayerDamage()`, `damageEnemy()`, `handleShieldRegen()`

## v3.0 — GLOBAL_INVENTORY.md Complete

**Date:** 2026-03-20

`GLOBAL_INVENTORY.md` is now fully documented with all four sections: Section 1 (130 top-level variables from `index.html` with types and purposes), Section 2 (ownership assignments for all 130 variables to their destination files in the planned refactor), Section 3 (naming collision analysis — 0 cross-file collisions, 4 near-miss pairs, 14 generic-name risks with suggested renames), and Section 4 (8 explicit `window.*` globals across the codebase, all assigned to `state.js` post-refactor, with cross-file read tracking and a confirmed-empty unmatched-reads table). This document serves as the authoritative reference for the upcoming `index.html` file split.

### Files Changed

- `GLOBAL_INVENTORY.md` — Sections 1–4 complete
