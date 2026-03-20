# Changelog

All notable changes to Tech Warrior Online are documented here.
Each session that changes code gets a version bump.

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
