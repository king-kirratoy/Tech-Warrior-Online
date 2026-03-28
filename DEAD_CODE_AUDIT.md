# Dead Code Audit

## Session 1 — Core Systems

Audited files: `js/constants.js`, `js/state.js`, `js/utils.js`, `js/audio.js`

Search method: every flagged identifier was grepped across all `.js` files and
`index.html` before being recorded. Only identifiers with zero callers/readers
outside their own definition file are listed.

---

### js/constants.js (535 lines)

#### Unused variables / constants

| Line | Name | Notes | Confidence |
|------|------|-------|------------|
| 5 | `window.TW = {}` | Empty namespace object. Assigned once and never populated or read anywhere in the codebase. The preceding comment (`// NAMESPACE window.TW = {}`) suggests it was intended as a module namespace but was never wired up. | HIGH |
| 330–331 | `ENEMY_PRIMARY` | Array `['smg', 'mg', 'br', 'sg', 'hr', 'fth']`. Declared with a comment saying "Primary weapon keys available to enemies (excludes none)". Zero references outside `constants.js`. Line 333 comment notes that `ENEMY_SECONDARY` and `ENEMY_MODS` "are now handled inline in `randomEnemyLoadout`"; `ENEMY_PRIMARY` appears to have been left behind by the same inline migration. | HIGH |
| 332 | `ENEMY_ARM_WEAPONS` | Array `['smg','mg','br','sg','hr','fth','sr','gl','rl','plsm']`. Companion to `ENEMY_PRIMARY`, same inline-migration story. Zero references outside `constants.js`. | HIGH |

#### Commented-out code blocks

None found (all comments in this file are inline documentation/identity notes).

---

### js/state.js (141 lines)

#### Unused variables

| Line | Name | Notes | Confidence |
|------|------|-------|------------|
| 44 | `_pendingLoadoutTab` | `let _pendingLoadoutTab = null`. The inline comment says it is "consumed by `toggleStats()`", but grepping all JS files and `index.html` for `_pendingLoadoutTab` returns only this declaration — no reader or writer exists. | HIGH |

#### Commented-out code blocks

None found. (`// _buildingGraphics — moved to js/cover.js` on line 127 is a single migration note, not a code block.)

---

### js/utils.js (200 lines)

#### Unreachable functions

| Lines | Name | Notes | Confidence |
|-------|------|-------|------------|
| 193–199 | `_escapeHtml(str)` | Escapes `& < > " '` before DOM insertion. Defined in `utils.js` but grep of all JS files and `index.html` finds zero call sites. All other `utils.js` exports (`darkenColor`, `getTotalHP`, `_hudName`, `showDamageText`, `createImpactSparks`, `createShieldSparks`, `createShieldBreak`, `createMuzzleFlash`, `spawnDebris`, `spawnFootprint`, `_sanitizeCallsign`) have confirmed callers. | HIGH |

#### Commented-out code blocks

None found.

---

### js/audio.js (413 lines)

#### Unreachable code within a function

| Lines | Name | Notes | Confidence |
|-------|------|-------|------------|
| 151–154 | `case 'missile':` inside `sndFire()` | `sndFire(wKey)` is only invoked from `js/combat.js` weapon-firing paths, where `wKey` is always a player loadout weapon key (`smg`, `mg`, etc.). `'missile'` is a CPU mod key, not a weapon slot key; it never appears as a `wKey` argument in any call to `sndFire` across the codebase. The `gaps` throttle object (line 109) also omits `'missile'`, leaving it to fall back to the 150 ms default. Missile launch sounds are handled separately inside `mods.js` (individual impact sounds), which does not call `sndFire`. | MEDIUM |

#### Commented-out code blocks

None found.

---

## Summary Table

| File | Finding | Type | Confidence |
|------|---------|------|------------|
| `js/constants.js:5` | `window.TW = {}` | Unused variable | HIGH |
| `js/constants.js:330` | `ENEMY_PRIMARY` | Unused constant | HIGH |
| `js/constants.js:332` | `ENEMY_ARM_WEAPONS` | Unused constant | HIGH |
| `js/state.js:44` | `_pendingLoadoutTab` | Unused variable | HIGH |
| `js/utils.js:193` | `_escapeHtml()` | Unreachable function | HIGH |
| `js/audio.js:151` | `case 'missile':` in `sndFire` | Unreachable branch | MEDIUM |

---

## Session 2 — Combat & Mechs

Audited files: `js/mechs.js`, `js/cover.js`, `js/combat.js`, `js/mods.js`

Search method: every flagged identifier was grepped across all `.js` files and
`index.html` before being recorded. Only identifiers with zero callers/readers
outside their own definition are listed.

---

### js/mechs.js (441 lines)

#### Unused variable initializations

| Line | Name | Notes | Confidence |
|------|------|-------|------------|
| 440 | `player._siphonLine = null` | Set to `null` in `_initPlayerHP()` but never read or written anywhere else in the codebase. The siphon-beam rendering was refactored to use per-arm Graphics objects (`_siphonGfxL` / `_siphonGfxR` in `combat.js`) before this property was removed from init; the `null` initialization was left behind. | HIGH |

#### Commented-out code blocks

None found.

---

### js/cover.js (410 lines)

#### Unused local variables

| Lines | Name | Notes | Confidence |
|-------|------|-------|------------|
| 188–199 | `tryPlace` (local const inside `generateCover`) | Defined as a helper that randomises placement within bounds (`for (let attempt = 0; attempt < 60; ...)` loop), but `generateCover` never calls it — every cover object is placed via the `placeAt` helper instead. `tryPlace` exists only at this single definition site; it has no call sites inside or outside the function. | HIGH |

#### Commented-out code blocks

None found.

---

### js/combat.js (1960 lines)

#### Unreachable functions

| Lines | Name | Notes | Confidence |
|-------|------|-------|------------|
| 1945–1957 | `_createAfterburn(scene, x, y)` | Creates a 40px burning-zone circle and damages enemies in it for 10 ticks. Defined in `combat.js` but never called from any file in the codebase or from `index.html`. Likely an earlier draft of a flame/napalm mechanic superseded by the `napalmStrike` perk logic in `fireFTH`. | HIGH |

#### Commented-out code blocks

None found (the single-line comment at line 1547 — `// damageCover() — moved to js/cover.js` — is a migration note, not a code block).

---

### js/mods.js (817 lines)

#### Unused local variables

| Line | Name | Notes | Confidence |
|------|------|-------|------------|
| 32 | `decoyFireTimer` (local `let` inside `activateDecoy`) | Declared as `let decoyFireTimer = 0;` immediately before the `decoyFireEvent` timer is created, but never read or written again in the function. The actual Phaser timer reference is stored in `decoyFireEvent` (used for `decoyFireEvent.remove()` cleanup). `decoyFireTimer` serves no purpose. | HIGH |
| 203 | `partName` (destructured local inside `activateRepair`) | From `const [partName, part] = parts[0];` — `partName` is the key string of the most-damaged component but is never used; only `part` (the component object) is referenced in the heal logic below. | HIGH |

#### Commented-out code blocks

None found.

---

## Session 2 Summary Table

| File | Finding | Type | Confidence |
|------|---------|------|------------|
| `js/mechs.js:440` | `player._siphonLine = null` | Unused variable initialization | HIGH |
| `js/cover.js:188` | `tryPlace` local const in `generateCover` | Unused local variable (never called) | HIGH |
| `js/combat.js:1945` | `_createAfterburn()` | Unreachable function | HIGH |
| `js/mods.js:32` | `decoyFireTimer` in `activateDecoy` | Unused local variable | HIGH |
| `js/mods.js:203` | `partName` in `activateRepair` | Unused destructured variable | HIGH |
