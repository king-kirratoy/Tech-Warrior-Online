# PERK AUDIT — Tech Warrior Online
> Audit date: 2026-03-26 | Game version: v6.79 | Audit scope: js/perks.js

---

## PASS 1 — Reload References

Every perk whose **name, label, or description** contains the word "reload" (or "reloads") in any form is listed below. All are candidates for rewording to use "fire rate" terminology, since `WEAPONS` data uses `fireRate` (not a separate `reload` property) for most weapons.

| # | Perk key | Current label | Description text containing "reload" | Suggested replacement wording |
|---|---|---|---|---|
| 1 | `rapid_reload` | Rapid Reload | `-20% reload times (stackable)` | `-20% fire rate interval (stackable)` |
| 2 | `hair_trigger` | Hair Trigger | `−15% reload time (stackable)` | `+15% fire rate (stackable)` |
| 3 | `balanced_load` | Balanced Load | `Both weapons reload 15% faster (stackable)` | `Both weapons fire 15% faster (stackable)` |
| 4 | `overheated_barrels` | Overheated Barrels | `SMG: +10% damage & −10% reload` | `SMG: +10% damage & −10% fire interval` |
| 5 | `mg_heat_sink` | Heat Sink | `MG: reload −25% (stackable)` | `MG: fire rate +25% (stackable)` |
| 6 | `cold_shot` | Cold Shot | `Sniper: first shot each reload deals 3× dmg` | `Sniper: first shot after full fire cooldown deals 3× dmg` |
| 7 | `br_marksman` | Marksman | `BR: +20% damage on first shot after full reload` | `BR: +20% damage on first shot after full fire cycle` |
| 8 | `one_shot` | One Shot | `SR: killing the target halves reload time` | `SR: killing the target halves fire interval` |
| 9 | `fuel_efficiency` | Fuel Efficiency | `FTH reload −25% per stack` | `FTH fire rate +25% per stack` |
| 10 | `neural_link` | Neural Link | `While drone is active: reload speed +15%` | `While drone is active: fire rate +15%` |
| 11 | `jump_reload` | Aerial Reload | `Reloads both weapons during JUMP airtime` | `Resets both weapon fire delays during JUMP airtime` |
| 12 | `mg_coolant` | Coolant System | `MG reload time -20% (stackable)` | `MG fire rate +20% (stackable)` |
| 13 | `br_reload` | Fast Hands | `BR reload time -25% (stackable)` | `BR fire rate +25% (stackable)` |
| 14 | `sg_reload_kd` | Pump Action Pro | `SG reload -20% (stackable)` | `SG fire rate +20% (stackable)` |
| 15 | `hr_reload_boost` | Quick Cycle | `HR reload -20% (stackable)` | `HR fire rate +20% (stackable)` |
| 16 | `sr_reload` | Bolt Action Pro | `SR reload -25% (stackable)` | `SR fire rate +25% (stackable)` |
| 17 | `gl_reload` | Autoloader | `GL reload -20% (stackable)` | `GL fire rate +20% (stackable)` |
| 18 | `rl_reload` | Rapid Loader | `RL reload -20% (stackable)` | `RL fire rate +20% (stackable)` |
| 19 | `plsm_reload` | Capacitor Bank | `PLSM reload -20% (stackable)` | `PLSM fire rate +20% (stackable)` |
| 20 | `rail_reload` | Rapid Charge | `RAIL charge time -20% and reload -15% (stackable)` | `RAIL charge time -20% and fire interval -15% (stackable)` |
| 21 | `smg_burst` | Burst Trigger | `SMG: first 3 shots after reload deal +40% damage` | `SMG: first 3 shots of each fire cycle deal +40% damage` |
| 22 | `smg_legendary` | Bullet Storm | `Reload time doubled but ammo is unlimited between reloads` | `Fire interval doubled but weapon never needs to pause between bursts` |
| 23 | `smg_dual_mags` | Dual Magazines | `alternate between two mags — reloading one while firing the other` | `alternate fire channels — cycling one while firing the other` |
| 24 | `hb_reload` | Sprint Reload | `Reload speed +15% while moving at full speed` | `Fire rate +15% while moving at full speed` |
| 25 | `ma_reload` | Planted Hands | `While anchored: reload speed +25%` | `While anchored: fire rate +25%` |
| 26 | `fw_reload` | Swift Hands | `Featherweight: +8% more reload speed (stackable)` | `Featherweight: +8% more fire rate (stackable)` |
| 27 | `sb_reload` | Sprint Reload | `Sprint burst automatically reloads both weapons` | `Sprint burst instantly resets both weapon fire delays` |
| 28 | `al_legendary` | Extinction Event | `Landing auto-reloads both weapons` | `Landing instantly resets both weapon fire delays` |
| 29 | `rl2_reload` | Sprint Reload | `Reactor Legs: reload speed +15% while moving` | `Reactor Legs: fire rate +15% while moving` |
| 30 | `sl_reload` | Pressure Cooker | `While enemies are in your aura: reload speed +20%` | `While enemies are in your aura: fire rate +20%` |
| 31 | `tactical_reload` | Tactical Reload | `Kills during reload complete the reload instantly` | `Kills during a fire delay instantly reset the fire delay` |

**Pass 1 total: 31 perks with reload references.**

---

## PASS 2 — Dead Perks

Dead perks are perks whose `cat` value references an item that **cannot currently be equipped by any chassis**, determined by cross-referencing against `CHASSIS_WEAPONS`, `CHASSIS_SHIELDS`, `CHASSIS_LEGS`, and `CHASSIS_AUGS` in `js/constants.js`.

### Finding: `afterleg` removed from CHASSIS_LEGS

`afterleg` is defined in `LEG_SYSTEMS` (js/constants.js line 221) but is **not present in any set within `CHASSIS_LEGS`**:

```
CHASSIS_LEGS.light  = { hydraulic_boost, seismic_dampener, featherweight, ghost_legs }
CHASSIS_LEGS.medium = { gyro_stabilizer, mine_layer, sprint_boosters, reactor_legs }
CHASSIS_LEGS.heavy  = { mag_anchors, tremor_legs, suppressor_legs, warlord_stride }
```

The perk selection function `selectPerks()` (perks.js:1067) builds `specCats` from `loadout.leg`. Since `loadout.leg` can only hold a value the garage dropdown populates (restricted to `CHASSIS_LEGS` entries), `afterleg` can never appear in `loadout.leg`. All 11 `afterleg` perks are therefore **permanently unreachable**.

| # | Perk key | Cat value | Why it is dead |
|---|---|---|---|
| 1 | `afterleg_boost` | `afterleg` | `afterleg` not in any `CHASSIS_LEGS` set — cannot be equipped |
| 2 | `al_distance` | `afterleg` | same |
| 3 | `al_slam_dmg` | `afterleg` | same |
| 4 | `al_slam_radius` | `afterleg` | same |
| 5 | `al_airtime` | `afterleg` | same |
| 6 | `al_air_dmg` | `afterleg` | same |
| 7 | `al_cooldown` | `afterleg` | same |
| 8 | `al_emp_slam` | `afterleg` | same |
| 9 | `al_double` | `afterleg` | same |
| 10 | `al_fire_slam` | `afterleg` | same |
| 11 | `al_legendary` | `afterleg` | same |

### No other dead cat values found

All other perk `cat` values were checked against the removed items listed in the audit brief:

- **Removed weapons** (`siege`, `chain`): No perks have `cat:'siege'` or `cat:'chain'`. ✓
- **Removed shields** (`light_shield`, `standard_shield`, `heavy_shield`, `siege_wall`, `counter_shield`, `pulse_shield`, `phase_shield`, `reactive_shield`): No perks use any of these as a `cat` value. Shield perks use the generic `cat:'shield'` which maps to "any equipped shield". ✓
- **Removed legs** (`siege_stance`, `ironclad`, `power_stride`, `evasion_coils`, `adaptive_stride`, `stabilizer_gyros`, `reactive_dash`, `silent_step`): No perks reference these as `cat` values. ✓
- **Removed augments** (`chain_drive`, `blast_dampener`, `colossus_frame`, `iron_fortress`, `scrap_cannon`, `impact_core`, `adaptive_core`, `system_sync`, `tactical_uplink`, `echo_targeting`, `combat_ai`, `drone_relay`, `shadow_core`, `targeting_scope`, `predator_lens`, `ghost_circuit`, `pyromaniac_chip`, `kill_sprint`, `reflex_amp`, `fuel_injector`): No perks use any of these as a `cat` value. ✓

**Note:** `_resetPerkState()` (perks.js:1138) still initialises `scrapCannon:false`, `gyroCounter:false`, and `scrapChain:false` — orphaned state variables from removed augments/weapons. These are not dead perks (no perk entries exist for them) but should be cleaned from `_resetPerkState` to reduce confusion.

**Pass 2 total: 11 dead perks.**

---

## PASS 3 — Logic Mismatches

### 3A — Incorrect mechanic descriptions

| # | Perk key | Issue | Suggested fix |
|---|---|---|---|
| 1 | `tl_charge` | **Description is mechanically wrong.** Says "Tremor Legs: stationary time to trigger reduced to 1s." Tremor Legs fires **while moving** (velocity > 20, per OVERVIEW.md/events.js). There is no "stationary trigger" for tremor legs. The apply sets `_perkState.tlCharge=true` but OVERVIEW.md references `tlCd` (set by `tl_cd`) for the cooldown reduction — `tlCharge` is a separate unused-seeming flag. | Rewrite desc to reference movement-based trigger cadence, e.g. "Tremor Legs: tremor fires every 250ms instead of 500ms while moving." Verify `tlCharge` is actually read in events.js. |
| 2 | `ammo_cache` | **References an undefined mechanic.** desc: "Start each round with Ammo buff." No "Ammo buff" is defined anywhere in perks.js or visible in WEAPONS data. All weapons use `fireRate` with no tracked ammo count (except siphon which uses heat). `_perkState.ammoCache=true` is set but the downstream effect of this flag is unclear. | Define or remove the Ammo buff. If the mechanic no longer exists, replace with a concrete effect (e.g. "+20% fire rate for the first 10s of each round") or remove the perk. |
| 3 | `smg_legendary` (Bullet Storm) | **Desc references ammo/magazine mechanic that does not exist on SMG.** Says "Reload time doubled but ammo is unlimited between reloads." SMG is defined in WEAPONS with only `fireRate: 55` — there is no `ammo`, `magazine`, or `reload` property. "Ammo is unlimited between reloads" is meaningless if no ammo system exists. | Rewrite to reference fire rate: e.g. "SMG fires twice per trigger pull. No accuracy penalty. Fire interval doubled." |
| 4 | `smg_dual_mags` | **References magazine mechanic not in SMG WEAPONS data.** desc: "SMG: alternate between two mags — reloading one while firing the other." SMG has no `magazine` or `ammo` property. | Rewrite to describe the actual intended effect without magazine language: e.g. "SMG: never pauses to fire — alternates between two firing channels." |
| 5 | `mg_belt_feed` | **References magazine mechanic not in MG WEAPONS data.** desc: "MG: magazine size doubled (fires twice as long before reload)." MG has no `magazine` property in WEAPONS. | Rewrite: e.g. "MG: fire duration before pause doubled." |

### 3B — "Standing still", "while stationary", "while moving" phrases flagged for phase-out

Per audit brief, these mechanics are being phased out. All perks using this language are flagged.

**"standing still" / "while still" / "stationary":**

| # | Perk key | Flagged phrase in description |
|---|---|---|
| 1 | `immovable` | "While still: shield regens 3× faster" |
| 2 | `sr_breath` | "Sniper: +25% damage while standing still (stackable)" |
| 3 | `sr_scope_in` | "SR: stationary for 1s+ grants +30% damage bonus" |
| 4 | `rl2_passive` | "Reactor Legs also reduce cooldowns by 1s every 5s while stationary" |
| 5 | `tl_passive` | "While stationary: emit a passive slow aura (150px, 20% slow)" |
| 6 | `heavy_bunker_down` | "Heavy: while standing still 2s+, take 25% less damage" |
| 7 | `hr_quick_scope` | "HR: standing still 1s+ grants +30% damage" |
| 8 | `mg_bipod` | "MG: +20% damage and -30% spread while standing still" |
| 9 | `ma_dmg` | "Mag Anchors stationary bonus: +10% more damage" |
| 10 | `ma_dr` | "Mag Anchors stationary bonus: +10% more DR" |
| 11 | `ma_fast_lock` | "activates after 0.3s stationary instead of default" |
| 12 | `ma_emp_aura` | "Anchoring for 2s+ creates a 200px slow aura" |

**"while moving" / "at full speed":**

| # | Perk key | Flagged phrase in description |
|---|---|---|
| 13 | `hb_evasion` | "Moving at full speed reduces incoming damage 8%" |
| 14 | `hb_dmg_moving` | "+12% damage while moving at full speed" |
| 15 | `fw_air` | "While moving: 12% reduced incoming damage" |
| 16 | `rl2_dmg` | "While moving: +10% damage" |
| 17 | `rl2_shield` | "Moving at full speed: shield regen delay -1s" |
| 18 | `light_blade_dancer` | "moving at full speed grants +12% damage" |

**Pass 3 total: 5 primary logic mismatches + 18 stationary/movement-phrase flags = 23 perks.**

---

## FINAL SUMMARY

| Metric | Count |
|---|---|
| **Total perks audited** | ~580 |
| **Pass 1 — Reload references found** | 31 |
| **Pass 2 — Dead perks found** | 11 |
| **Pass 3 — Logic mismatches found** | 23 (5 primary + 18 movement-phrase) |
| **Total perks recommended for removal** | 11 (all afterleg — `afterleg_boost` + `al_*` × 10) |
| **Total perks recommended for update** | ~55 (31 reload rewrites + 5 logic fixes + 18 movement-phrase rewrites; some perks appear in multiple passes) |

### Priority actions

1. **Remove all 11 `afterleg` perks** — they can never be offered. `afterleg` is not in `CHASSIS_LEGS`. If `afterleg` is intended to return, add it to the appropriate `CHASSIS_LEGS` set first.
2. **Fix `tl_charge`** — description is mechanically wrong (claims stationary trigger; tremor legs fires while moving).
3. **Fix `ammo_cache`** — "Ammo buff" is undefined. Either define the mechanic or replace with a concrete effect.
4. **Fix `smg_legendary`, `smg_dual_mags`, `mg_belt_feed`** — remove magazine/ammo language; those properties do not exist on SMG or MG in `WEAPONS`.
5. **Mass-replace "reload" wording** (31 perks) — use "fire rate" or "fire interval" to match `WEAPONS.fireRate` property.
6. **Review movement-phrase perks** (18 perks) — update to remove "standing still"/"while stationary"/"while moving" language per the phase-out policy.
7. **Clean `_resetPerkState()`** — remove orphaned variables `scrapCannon`, `gyroCounter`, `scrapChain` which no perk sets.
