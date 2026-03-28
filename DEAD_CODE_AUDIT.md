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

---

## Session 3 — Enemies, Rounds & Perks

Audited files: `js/perks.js`, `js/enemies.js`, `js/rounds.js`, `js/enemy-types.js`, `js/arena-objectives.js`

Search method: every flagged identifier was grepped across all `.js` files and
`index.html` before being recorded. Perk flags were additionally checked across
`js/combat.js`, `js/events.js`, `js/init.js`, `js/mods.js`, and `js/rounds.js`.
Only identifiers with zero readers/writers outside their own definition site
(or their `_resetPerkState` initializer) are listed.

---

### js/perks.js (1103 lines)

#### Orphaned `_perkState` fields — initialized in `_resetPerkState()` but never set or read by any game logic

| Approx. Line | Field name | Notes | Confidence |
|---|---|---|---|
| 1101 | `perfectAccuracy` | Initialized to `false` in `_resetPerkState()` and in the default state object in `state.js:115`. No perk's `apply()` ever sets it `true` and no game code (combat, events, init, mods) ever reads it. Appears to be a leftover placeholder from a planned perk that was never implemented. | HIGH |
| 1101 | `reinforcedCore` | Same situation. The `reinforced_core` perk (line 20) works by directly mutating `player.comp.core.max` and `.hp` — it never sets `_perkState.reinforcedCore = true`. The flag is therefore always `false` and is never checked anywhere. | HIGH |
| 1101 | `fthDmg` | Initialized to `0` in `_resetPerkState()` and in `state.js:115`. No perk's `apply()` ever writes it and no game logic ever reads it. `fth_intensity` (line 215) correctly uses `_perkState.dmgMult` instead. | HIGH |

#### Unimplemented "new perks" block (~lines 688–835)

The section headed `// NEW PERKS — 100 additional perks for variety` defines approximately
60+ perks that set unique `_perkState.*` flags. A grep of every one of those flag names across
all `.js` files confirms they appear **only** in `js/perks.js` (the `apply()` lambda) and
`js/state.js` (the default object). No file reads these flags or acts on them, so players
can pick these perks but they have zero mechanical effect.

The following sub-groups were confirmed unimplemented:

**Weapon-specific new perks (lines ~748–803) — all flags absent from `combat.js`:**

| Lines | Perk key(s) | Unimplemented state flags |
|---|---|---|
| 748–751 | `smg_ricochet`, `smg_adrenaline`, `smg_armor_shred`, `smg_overdose` | `smgRicochet`, `smgAdrenaline`, `smgArmorShred`, `smgOverdose` |
| 754–756 | `mg_suppression`, `mg_chain_fire`, `mg_explosive_tips` | `mgSuppression`, `mgChainFire`, `mgExplosiveTips` |
| 759–763 | `sg_double_barrel`, `sg_incendiary`, `sg_stun_round`, `sg_combat_roll`, `sg_shrapnel` | `sgDoubleBarrel`, `sgIncendiary`, `sgStunRound`, `sgCombatRoll`, `sgShrapnel` |
| 766–770 | `br_armor_crack`, `br_recoil_comp`, `br_kill_feed`, `br_double_burst`, `br_crit_burst` | `brArmorCrack`, `brRecoilComp`, `brKillFeed`, `brDoubleBurst`, `brCritBurst` |
| 773–776 | `hr_ricochet`, `hr_piercing`, `hr_concussive`, `hr_mark_target` | `hrRicochet`, `hrPiercing`, `hrConcussive`, `hrMarkTarget` |
| 779–782 | `sr_piercing_rounds`, `sr_double_shot`, `sr_tracer`, `sr_killstreak` | `srArmorPiercer`, `srDoubleShot`, `srTracer`, `srKillstreak` |
| 785–788 | `gl_bouncing`, `gl_toxic`, `gl_impact`, `gl_mag_grenade` | `glBouncing`, `glToxic`, `glImpact`, `glMagGrenade` |
| 791–793 | `rl_guided`, `rl_split`, `rl_napalm` | `rlGuided`, `rlSplit`, `rlNapalm` |
| 796–798 | `plsm_gravity`, `plsm_split`, `plsm_drain` | `plsmGravity`, `plsmSplit`, `plsmDrain` |
| 801–803 | `rail_double`, `rail_chain_lightning`, `rail_charge_bonus` | `railDouble`, `railChainLightning`, `railChargeBonus` |

**Universal new offense perks (lines ~692–700) — flags absent from all game files:**

| Lines | Perk key(s) | Unimplemented state flags |
|---|---|---|
| 692–700 | `double_tap`, `precision_strike`, `momentum_kill`, `ricochet_rounds`, `vulnerability`, `finishing_blow`, `focus_fire`, `combat_stim`, `executioner` | `doubleTap`, `precisionStrike`, `momentumKill`, `ricochetRounds`, `vulnerability`, `finishingBlow`, `focusFire`, `combatStim`, `executioner` |

Note: `armor_piercing` (line 691) is the one exception — `armorPierce` IS read in `combat.js:1174`.

**Universal new survivability/utility perks (lines ~703–719) — flags absent from all game files:**

| Lines | Perk key(s) | Unimplemented state flags |
|---|---|---|
| 703–710 | `nano_repair`, `emergency_shield`, `damage_cap`, `reactive_hull`, `second_wind`, `hardened_systems`, `vital_strike`, `energy_converter` | `nanoRepair`, `emergencyShield`, `damageCap`, `reactiveHull`, `secondWind`, `hardenedSystems`, `vitalStrike`, `energyConverter` |
| 713–719 | `quick_swap`, `tactical_reload`, `combat_awareness`, `scrap_collector`, `resource_recycler`, `field_medic_univ`, `munitions_expert` | `quickSwap`, `tacticalReload`, `combatAwareness`, `scrapCollector`, `resourceRecycler`, `fieldMedic`, `munitionsExpert` |

**New chassis perks (lines ~729–745) — unique flags absent from all game files:**

| Lines | Perk key(s) | Unimplemented state flags |
|---|---|---|
| 730–732 | `light_nimble`, `light_quick_draw`, `light_shadow_dance` | `lightNimble`, `lightQuickDraw`, `lightShadowDance` |
| 735–739 | `medium_versatile`, `medium_iron_resolve`, `medium_tactician`, `medium_steady_hand`, `medium_mod_synergy` | `mediumVersatile`, `mediumIronResolve`, `mediumTactician`, `mediumSteadyHand`, `mediumModSynergy` |
| 742–745 | `heavy_juggernaut`, `heavy_intimidate` | `heavyJuggernaut`, `heavyIntimidate` |

Note: `heavy_wrecking_ball` (line 743) reuses `groundPound` (implemented). `heavy_endurance` (line 744) reuses `autoRepair` (implemented). `light_evasion_master` (line 729) reuses `dodgeChance` (implemented).

**New universal legendary perks (lines ~806–820) — flags only in `state.js` default, never read:**

| Lines | Perk key(s) | Unimplemented state flags |
|---|---|---|
| 806–820 | `universal_phoenix`, `universal_overload`, `universal_nullifier`, `universal_warlord`, `universal_adaptive` | `phoenixProtocol`, `systemOverload`, `nullifierField`, `warlordAscendant`, `adaptiveEvolution` |

All of the above unimplemented-new-perk entries are **HIGH confidence**: the flag names are unique strings, a codebase-wide grep finds them only in `js/perks.js` and the default state in `js/state.js`.

#### Commented-out code blocks

None found.

---

### js/enemies.js (2431 lines)

No unreachable functions, unused variables, or commented-out code blocks found.

All 37 functions defined in this file are called from at least one external caller
(`init.js`, `rounds.js`, `combat.js`, `menus.js`) or from within the file itself.
The two module-level constants (`_FEELER_OFFSETS`, `_CONE_RAY_POINTS`) are both
actively used inside `handleEnemyAI` and `_computeEnemyVisibility`.

**Minor non-dead-code note (not a finding, for completeness):**
Line 744 contains the tautological expression
`enemy._decoyTarget.x ?? enemy._decoyTarget.x` — both sides of `??` are
identical, making the nullish-coalescing operator a no-op. This is a logic/style
issue, not dead code.

Line 963 has the same section comment duplicated back-to-back
(`// ── STATE TRANSITIONS ─────────────────────────────────────` appears twice).
Cosmetic only, not dead code.

---

### js/rounds.js (554 lines)

No unreachable functions, unused variables, or commented-out code blocks found.

All 14 functions are called: `updateRoundHUD` and `showRoundBanner` from multiple
sites; `_healPlayerFull`, `_clearMapForRound`, `_setupArenaAndObjective`,
`_spawnCampaignEnemies`, `_spawnSimulationEnemies`, `onEnemyKilled`, and
`startRound` from `init.js`/`menus.js`; `_spawnExtractionPoint` and
`_triggerExtraction` from within `onEnemyKilled` / `_updateExtraction`;
`_updateExtraction` from `init.js:262`; `_cleanupExtraction` and
`_overlapsAnyCover` from `_clearMapForRound` / `_spawnExtractionPoint`.

---

### js/enemy-types.js (861 lines)

No unreachable functions, unused variables, or commented-out code blocks found.

All 12 functions are called via `typeof` guards from `rounds.js`, `init.js`,
`combat.js`, or internally within the file. `ENEMY_TYPE_DEFS` and
`ELITE_MODIFIERS` are both read in `spawnSpecialEnemy` / `applyEliteModifier`
and in `handleEliteDeath` respectively.

---

### js/arena-objectives.js (921 lines)

No unreachable functions, unused variables, or commented-out code blocks found.

All 29 functions are called: the four arena generators
(`generateCorridors`, `generatePit`, `generateStronghold`, `generateTowerDefense`)
are invoked dynamically via `window[arenaDef.generator]` in `cover.js:127`.
All objective helpers (`_updateSurvival`, `_markAssassinTarget`,
`_updateAssassination`, `_cleanupAssassinMarker`, `_spawnGenerator`,
`_updateDefense`, `_destroyGenerator`, `_spawnDataCores`, `_updateSalvage`,
`_initPitZone`, `_drawPitZone`, `_updatePitZone`, `_onObjectiveComplete`,
`_onObjectiveFailed`, `_updateObjectiveHUD`) are called internally from
`initObjective` or `updateObjectives`.

---

## Session 3 Summary Table

| File | Finding | Type | Confidence |
|------|---------|------|------------|
| `js/perks.js:1101` | `perfectAccuracy` field in `_resetPerkState` | Orphaned `_perkState` field — never set by any perk, never read | HIGH |
| `js/perks.js:1101` | `reinforcedCore` field in `_resetPerkState` | Orphaned `_perkState` field — perk works by direct mutation, never reads this flag | HIGH |
| `js/perks.js:1101` | `fthDmg` field in `_resetPerkState` | Orphaned `_perkState` field — no perk sets it, no game code reads it | HIGH |
| `js/perks.js:748–803` | 34 weapon-specific new perks (`smg_ricochet` … `rail_charge_bonus`) | Unimplemented perks — state flags set but never read in any game file | HIGH |
| `js/perks.js:692–700` | 9 universal offense new perks (`double_tap` … `executioner`) | Unimplemented perks — state flags set but never read | HIGH |
| `js/perks.js:703–719` | 15 universal survivability/utility new perks (`nano_repair` … `munitions_expert`) | Unimplemented perks — state flags set but never read | HIGH |
| `js/perks.js:729–745` | 10 new chassis perks with unique flags (`light_nimble`, `medium_versatile`, etc.) | Unimplemented perks — unique state flags set but never read | HIGH |
| `js/perks.js:806–820` | 5 new universal legendary perks (`universal_phoenix` … `universal_adaptive`) | Unimplemented perks — state flags set but never read | HIGH |

---

## Session 4 — UI & Menus

Audited files: `js/hud.js`, `js/garage.js`, `js/menus.js`, `js/loot-system.js`

Search method: every flagged identifier was grepped across all `.js` files and
`index.html` before being recorded. For `menus.js` and `loot-system.js`, callers
in `events.js`, `campaign-system.js`, `init.js`, `rounds.js`, and `combat.js` were
all checked. Only identifiers with zero call sites (or a fully dead call chain)
outside their own definition are listed.

---

### js/hud.js (544 lines)

No unreachable functions found. All 12 exported functions are called from external
files (`init.js`, `rounds.js`, `combat.js`, `mods.js`). Note: `updateSiphonHeatBar`
is a deliberate no-op stub called from `combat.js:565` via a `typeof` guard — it is
intentionally retained and is not flagged as dead.

#### Unused local variables

| Line | Name | Notes | Confidence |
|------|------|-------|------------|
| 233 | `lootDef` inside `drawMinimap()` | Declared as `const lootDef = LOOT_TYPES[p.type];` but never read. The `fillStyle` on the very next line branches directly on `p.type` string literals (`'repair'`, `'ammo'`), bypassing `lootDef` entirely. | HIGH |

#### Commented-out code blocks

None found.

---

### js/garage.js (652 lines)

#### Unreachable functions

| Lines | Name | Notes | Confidence |
|-------|------|-------|------------|
| 427–432 | `_calcWeight(lo)` | Computes total weapon weight from a loadout object. Grepping all JS files and `index.html` finds zero call sites. Weight display in the garage UI is handled inline inside `renderGarage()` without calling this function. | HIGH |

#### Commented-out code blocks

None found.

---

### js/menus.js (2824 lines)

#### Unreachable functions — item-detail dead chain

The four functions below form a fully unreachable call chain. The entry point
`_showItemDetail` has no external callers, and `index.html` sets `#inv-detail-panel`
to `display:none !important;` (line 562), confirming the panel was disabled.

| Lines | Name | Notes | Confidence |
|-------|------|-------|------------|
| 1450–1468 | `_showItemDetail(source, key)` | Entry point of the dead chain. Zero call sites in any JS file or `index.html`. References `#inv-detail-panel`, which is hidden with `display:none !important;` in `index.html`. | HIGH |
| 1470–1560 | `_renderItemDetail(source, key)` | Only caller is the dead `_showItemDetail`. | HIGH |
| 1340–1428 | `_buildItemComparisonHTML(newItem)` | Only caller is the dead `_renderItemDetail`. | HIGH |
| 1330–1338 | `_setCompareArm(arm)` | Only referenced as an `onclick` string inside the dead `_buildItemComparisonHTML`. | HIGH |

#### Unreachable functions — leaderboard dead stubs

| Lines | Name | Notes | Confidence |
|-------|------|-------|------------|
| 2612–2630 | `submitLeaderboardEntry()` | Zero call sites anywhere. References a `#lb-submit-panel` DOM element that does not exist in `index.html`. Superseded by `_autoSubmitRun()` (line 2560), which is called from `campaign-system.js` on run completion. | HIGH |
| 2632–2641 | `skipLeaderboardSubmit()` | Zero call sites anywhere. Same `#lb-submit-panel` dependency; same superseded status. | HIGH |

#### No-op stub (called but effectless)

| Lines | Name | Notes | Confidence |
|-------|------|-------|------------|
| 2591–2593 | `_showCloudStatusToast()` | Body is `{ return; }` — a pure no-op. Called three times from `campaign-system.js` but produces no output or side-effect. Likely a placeholder for a cloud-sync status UI that was never built. Not fully unreachable (has callers), but has zero effect. | MEDIUM |

#### Commented-out code blocks

None found.

---

### js/loot-system.js (1921 lines)

No unreachable non-stub functions found. All major exported functions
(`generateLoot`, `applyLoot`, `spawnLoot`, `removeLoot`, `checkLootPickups`,
`applyUniqueEffect`, `hasUniqueEffect`, `saveCampaignProgress`,
`loadCampaignProgress`, `debouncedCampaignSave`) have confirmed callers.

#### Unimplemented stub functions

| Lines | Name | Notes | Confidence |
|-------|------|-------|------------|
| 1567–1570 | `triggerEchoStrike()` | Self-documented: `// stub — not yet implemented`. Body is empty (single comment only). Zero call sites anywhere in the codebase. Parameters are commented out. | HIGH |
| 1576–1580 | `checkMirrorShot()` | Self-documented with a TODO: always `return false`. Calls `hasUniqueEffect('mirrorShot')` but immediately returns `false` regardless, so it has no effect. Zero call sites anywhere in the codebase. | HIGH |

#### Commented-out code blocks

None found.

---

## Session 4 Summary Table

| File | Finding | Type | Confidence |
|------|---------|------|------------|
| `js/hud.js:233` | `lootDef` local in `drawMinimap` | Unused local variable | HIGH |
| `js/garage.js:427` | `_calcWeight()` | Unreachable function | HIGH |
| `js/menus.js:1330` | `_setCompareArm()` | Unreachable function (dead chain) | HIGH |
| `js/menus.js:1340` | `_buildItemComparisonHTML()` | Unreachable function (dead chain) | HIGH |
| `js/menus.js:1450` | `_showItemDetail()` | Unreachable function (dead chain entry, panel disabled) | HIGH |
| `js/menus.js:1470` | `_renderItemDetail()` | Unreachable function (dead chain) | HIGH |
| `js/menus.js:2591` | `_showCloudStatusToast()` | No-op stub body — called but has zero effect | MEDIUM |
| `js/menus.js:2612` | `submitLeaderboardEntry()` | Unreachable function (no callers, DOM panel absent) | HIGH |
| `js/menus.js:2632` | `skipLeaderboardSubmit()` | Unreachable function (no callers, DOM panel absent) | HIGH |
| `js/loot-system.js:1567` | `triggerEchoStrike()` | Unimplemented stub — no callers | HIGH |
| `js/loot-system.js:1576` | `checkMirrorShot()` | Unimplemented stub — always returns false, no callers | HIGH |
