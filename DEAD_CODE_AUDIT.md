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

---

## Session 5 — Campaign, Skill Tree, Multiplayer & Events

Audited files: `js/campaign-system.js`, `js/skill-tree-data.js`, `js/skill-tree.js`,
`js/multiplayer.js`, `js/events.js`, `js/init.js`

Search method: every flagged identifier was grepped across all `.js` files and
`index.html` before being recorded. Socket.IO event callbacks in `multiplayer.js`
were not flagged as dead code per audit instructions.

---

### js/campaign-system.js (2072 lines)

#### Permanently-disabled code block

| Lines | Description | Confidence |
|---|---|---|
| 1327–1399 | `if (false) { ... }` block inside `showShop()` labelled "Buy detail panel — disabled; hover cards replace click-to-view". The block is syntactically unreachable — `if (false)` is never entered. It contains full stat-comparison panel HTML that was superseded by the hover card system. | HIGH |

#### Unreachable module-level function

| Lines | Name | Notes | Confidence |
|---|---|---|---|
| 1199–1208 | `_shopItemTotal(item)` | Returns combined `baseStats + computedStats` for an item. Its only call sites are (a) inside `_itemStatCard()` (a local closure defined inside `showShop()`), and (b) inside the `if (false)` block at lines 1333–1334. `_itemStatCard` itself is only called from within the same `if (false)` block. No live code path ever reaches `_shopItemTotal`. | HIGH |
| 1501–1503 | `_shopSelect(idx)` | Toggles `_selectedShopIdx` and re-renders the shop. Buy slots in both `_shopRenderCategory()` (line 1091) and the `buySlot()` helper (line 1295) use `onclick="_shopBuy(${idx})"` — `_shopSelect` was the old pre-hover-card click handler and was never updated to the new code path. Zero call sites in any file. | HIGH |

#### Unreachable loadout-slots subsystem (no entry point)

The four functions below form a closed subsystem that can never be entered from
outside: `showLoadoutSlots()` has zero external callers (only called from
`_saveSlot`, `_loadSlot`, and `_deleteSlot`, which are onclick handlers generated
inside the overlay's own HTML). Nothing in any JS file or `index.html` ever calls
`showLoadoutSlots()` to open the overlay in the first place.

| Lines | Name | Notes | Confidence |
|---|---|---|---|
| 1742–1789 | `showLoadoutSlots()` | Entry point of the dead subsystem. Zero external callers confirmed by codebase-wide grep. The `#loadout-slots-overlay` DOM element exists in `index.html:410` but is only opened via this function. | HIGH |
| 1693–1711 | `saveLoadoutSlot(slotIdx, name)` | Only caller is `_saveSlot()` (line 1793), which is an onclick handler inside the overlay HTML. Unreachable unless the overlay is open. | HIGH |
| 1714–1731 | `loadLoadoutSlot(slotIdx)` | Only caller is `_loadSlot()` (line 1798), same situation. | HIGH |
| 1734–1739 | `deleteLoadoutSlot(slotIdx)` | Only caller is `_deleteSlot()` (line 1803), same situation. | HIGH |

#### Commented-out code blocks

None found (the `if (false)` block above is the only deliberately disabled code).

---

### js/skill-tree-data.js (8467 lines)

Pure data file — no function definitions to audit for dead code.

All three chassis trees (`light`, `medium`, `heavy`) are accessed dynamically in
`skill-tree.js` via `SKILL_TREE_DATA[chassisKey]`. No chassis tree is orphaned.

Node connectivity is internally self-referential via the `c` array field; the
renderer in `skill-tree.js` iterates `_skillTreeData.forEach` over all nodes, so
every node object is visited regardless of its connectivity status.

No orphaned data keys found.

---

### js/skill-tree.js (1012 lines)

#### Unused module-level variable

| Line | Name | Notes | Confidence |
|---|---|---|---|
| 9 | `_lockedAllocations` | Declared as `let _lockedAllocations = {};`. Assigned to `{}` at line 30 inside `showSkillTree()` with the inline comment "no longer used for locking; kept for structural compatibility". Confirmed by codebase-wide grep: the variable is written but never read anywhere in any JS file. | MEDIUM |

#### Unreachable functions

| Lines | Name | Notes | Confidence |
|---|---|---|---|
| 257–259 | `_isNodeAvailable(nodeId)` | One-liner that returns `_stGetNodeState(nodeId) === 'available'`. Zero call sites in any JS file — callers throughout `_renderSkillTree()` and `_allocateNode()` call `_stGetNodeState()` directly and compare the result inline. | HIGH |
| 917–921 | `_skillTreeClampVB()` | Clamps `_skillTreeVB.w` and `_skillTreeVB.h` to `[400, 2000]`. Zero call sites anywhere — the zoom handler `_skillTreeOnWheel()` (line 996) does the same clamping inline inside `_skillTreeZoom()` at lines 937–940 without calling this helper. | HIGH |

#### Commented-out code blocks

None found.

---

### js/multiplayer.js (2660 lines)

No unreachable functions, unused variables, or commented-out code blocks found.

All functions are reachable via Socket.IO event callbacks, UI button onclick
handlers, or direct calls from `init.js` / `events.js` / `hud.js`. Socket.IO
event handlers (`_mpSocket.on(...)`) were correctly excluded from dead-code
analysis per audit instructions.

---

### js/events.js (352 lines)

No unreachable functions, unused variables, or commented-out code blocks found.

All five exported functions (`handlePlayerMovement`, `handlePlayerFiring`,
`_onEquipDragStart`, `_onSlotDragOver`, `_onSlotDragLeave`, `_onSlotDrop`) are
called from `init.js:251/253` or from DOM event attributes generated in `menus.js:1104`.

---

### js/init.js (284 lines)

No unreachable functions, unused variables, or commented-out code blocks found.

All functions (`_startGridCanvas`, `startMenuGrid`, `_csKeyDown`,
`_updateCallsignBtn`, `handleObjectiveRoundEnd`, `preload`, `create`, `update`)
are called from `window.onload`, Phaser's scene system, or `index.html:31`.

---

## Session 5 Summary Table

| File | Finding | Type | Confidence |
|---|---|---|---|
| `js/campaign-system.js:1327` | `if (false) { }` buy detail panel block in `showShop()` | Permanently-disabled code | HIGH |
| `js/campaign-system.js:1199` | `_shopItemTotal()` | Unreachable function (only called from dead code) | HIGH |
| `js/campaign-system.js:1501` | `_shopSelect()` | Unreachable function (zero callers; superseded by `_shopBuy`) | HIGH |
| `js/campaign-system.js:1742` | `showLoadoutSlots()` | Unreachable function (no external entry point) | HIGH |
| `js/campaign-system.js:1693` | `saveLoadoutSlot()` | Unreachable function (dead loadout-slots subsystem) | HIGH |
| `js/campaign-system.js:1714` | `loadLoadoutSlot()` | Unreachable function (dead loadout-slots subsystem) | HIGH |
| `js/campaign-system.js:1734` | `deleteLoadoutSlot()` | Unreachable function (dead loadout-slots subsystem) | HIGH |
| `js/skill-tree.js:9` | `_lockedAllocations` | Unused module-level variable (written but never read) | MEDIUM |
| `js/skill-tree.js:257` | `_isNodeAvailable()` | Unreachable function (zero callers) | HIGH |
| `js/skill-tree.js:917` | `_skillTreeClampVB()` | Unreachable function (zoom does inline clamping instead) | HIGH |

---

## Summary

*Counts across all 5 sessions (Sessions 1–5).*

### Total finding counts

| Confidence | Count |
|---|---|
| HIGH | 37 |
| MEDIUM | 3 |
| LOW | 0 |

**HIGH count breakdown by session:**
- Session 1 (`constants.js`, `state.js`, `utils.js`, `audio.js`): 5
- Session 2 (`mechs.js`, `cover.js`, `combat.js`, `mods.js`): 5
- Session 3 (`perks.js`, `enemies.js`, `rounds.js`, `enemy-types.js`, `arena-objectives.js`): 8 entries (representing 76+ individual unimplemented perk keys)
- Session 4 (`hud.js`, `garage.js`, `menus.js`, `loot-system.js`): 10
- Session 5 (`campaign-system.js`, `skill-tree.js`): 9

**MEDIUM count breakdown by session:**
- Session 1: 1 (unreachable `case 'missile':` branch in `sndFire`)
- Session 4: 1 (`_showCloudStatusToast` no-op stub)
- Session 5: 1 (`_lockedAllocations` written but never read)

### Recommended cleanup order

Priority is based on impact (lines removable, risk introduced, and likelihood of
the dead code causing confusion or masking bugs).

1. **`js/campaign-system.js`** — Remove the `if (false)` buy-detail block (~72
   lines), `_shopItemTotal`, `_shopSelect`, and the entire loadout-slots subsystem
   (`showLoadoutSlots`, `saveLoadoutSlot`, `loadLoadoutSlot`, `deleteLoadoutSlot`,
   `_saveSlot`, `_loadSlot`, `_deleteSlot`, `_closeLoadoutSlots`, `MAX_LOADOUT_SLOTS`,
   `_getLoadoutSlots`). The `_shopSelect`/`_shopItemTotal` removal is zero-risk;
   the loadout-slots removal requires confirming that the feature is not planned
   for imminent re-wiring. Also verify `#loadout-slots-overlay` in `index.html`
   can be removed.

2. **`js/perks.js`** — Remove the ~73 unimplemented new-perk entries and their
   orphaned `_perkState` fields in `_resetPerkState()` and the `state.js` default
   object. High impact but requires cross-checking `state.js` for every removed
   field name. Removing unimplemented perks also prevents players from picking
   perks that have no mechanical effect.

3. **`js/menus.js`** — Remove the 6-function dead chain
   (`_showItemDetail` → `_renderItemDetail` → `_buildItemComparisonHTML` →
   `_setCompareArm`) plus `submitLeaderboardEntry` and `skipLeaderboardSubmit`.
   The `#inv-detail-panel` div in `index.html` (`display:none !important`) can
   also be removed. Low risk — no live path reaches any of these.

4. **`js/loot-system.js`** — Remove `triggerEchoStrike` and `checkMirrorShot`
   stubs. Self-documented as unimplemented; zero risk.

5. **`js/skill-tree.js`** — Remove `_isNodeAvailable`, `_skillTreeClampVB`, and
   the `_lockedAllocations` declaration and assignment. Tiny change, zero risk.

6. **`js/garage.js`** — Remove `_calcWeight`. Single function, zero risk.

7. **`js/utils.js`** — Remove `_escapeHtml`. Single function, zero risk.

8. **`js/constants.js`** — Remove `window.TW = {}`, `ENEMY_PRIMARY`, and
   `ENEMY_ARM_WEAPONS`. Verify `index.html` and all JS files once more before
   deleting `ENEMY_PRIMARY`/`ENEMY_ARM_WEAPONS` in case any future enemy
   AI code references them by string lookup.

9. **`js/state.js`** — Remove `_pendingLoadoutTab`. Remove the corresponding
   orphaned `_perkState` fields (`perfectAccuracy`, `reinforcedCore`, `fthDmg`)
   after step 2 is complete.

10. **Smaller isolated removals** — `player._siphonLine = null` (mechs.js),
    `tryPlace` local const (cover.js), `_createAfterburn` (combat.js),
    `decoyFireTimer` and `partName` locals (mods.js), `lootDef` local (hud.js),
    `case 'missile':` branch (audio.js). Each is a one-line or few-line removal
    with negligible risk.
