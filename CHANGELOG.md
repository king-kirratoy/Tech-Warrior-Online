# Changelog

All notable changes to Tech Warrior Online are documented here.
Each session that changes code gets a version bump.

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
