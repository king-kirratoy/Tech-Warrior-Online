# Changelog

All notable changes to Tech Warrior Online are documented here.
Each session that changes code gets a version bump.

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
