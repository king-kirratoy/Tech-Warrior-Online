# Tech Warrior Online — Loot System Reference

> Audit of `js/loot-system.js` and `js/constants.js`. Reports exact code state as of v6.43.
> **AUDIT ONLY** — this document describes existing code; it does not prescribe changes.

---

## Section 1: Item Base Types

There are two categories of item base types: **pure stat items** and **hybrid system items**.

### Pure Stat Items

Pure stat items provide only numerical bonuses when equipped. They do not activate any game-system ability (weapon, shield regen, etc.).

| `baseType` key | `_equipped` slot | Chassis restrictions | Notes |
|---|---|---|---|
| `weapon` | `L` or `R` | Restricted by `CHASSIS_WEAPONS` per chassis | Weapons from `WEAPON_LOOT_KEYS` only (see below) |
| `armor` | `chest` | None | Provides `coreHP` and `dr` |
| `arms` | `arms` | None | Provides `armHP`, `reloadPct`, `accuracy`, `dmgPct` |
| `legs` | `legs` | None | Provides `legHP`, `speedPct`, `dodgePct`, `dr` |
| `shield` | `shield` | None | Provides `shieldHP`, `shieldRegen`, `absorbPct` |
| `mod` | `mod` | None | Provides `modCdPct`, `modEffPct` |
| `augment` | `augment` | None | Provides `critChance`, `dmgPct`, `lootMult`, `speedPct` |

### Hybrid System Items

Hybrid system items carry a real GAME system (weapon ability, shield type, mod type, leg ability, or augment) **plus** rarity-scaled stat affixes. Equipping one sets both the functional ability (`loadout.shld`, `loadout.mod`, `loadout.leg`, `loadout.aug`) and the stat bonuses. They are the primary way to obtain new gameplay equipment during a campaign run.

| `baseType` key | `_equipped` slot | Also sets | Chassis restrictions |
|---|---|---|---|
| `shield_system` | `shield` | `loadout.shld` via `systemKey` | Restricted by `CHASSIS_SHIELDS` per chassis |
| `mod_system` | `mod` | `loadout.mod` via `systemKey` | Restricted by `CHASSIS_MODS` per chassis |
| `leg_system` | `legs` | `loadout.leg` via `systemKey` | Restricted by `CHASSIS_LEGS` per chassis |
| `aug_system` | `augment` | `loadout.aug` via `systemKey` | Restricted by `CHASSIS_AUGS` per chassis |

### Weapon Drop Restrictions

The constant `WEAPON_LOOT_KEYS` defines which weapon keys can appear as loot:

```
['smg', 'mg', 'sg', 'br', 'hr', 'fth', 'sr', 'gl', 'rl', 'plsm', 'rail']
```

`siege` and `chain` are **excluded** from loot drops. Both are two-handed weapons that lock `loadout.L === loadout.R` simultaneously. The loot equip system sets one arm slot at a time, which would leave the loadout in an invalid state for 2H weapons.

### Special Rules: Two-Handed Weapons

- `siege` (Siege Cannon) and `chain` (Chain Gun) are 2H weapons (`twoHanded: true` in `WEAPONS`).
- Equipping either locks **both** arm slots to the same key.
- Weight is counted only once despite occupying two slots.
- Available to **Medium** and **Heavy** chassis only. Light chassis cannot equip 2H weapons.
- Cannot drop as loot (see above).

### Chassis Weapon Restrictions (`CHASSIS_WEAPONS`)

| Chassis | Allowed weapon keys |
|---|---|
| `light` | `none`, `smg`, `br`, `fth`, `sg`, `sr` |
| `medium` | `none`, `mg`, `br`, `hr`, `gl`, `plsm`, `sr`, `siege`, `chain` |
| `heavy` | `none`, `mg`, `hr`, `rl`, `plsm`, `siege`, `chain` |

### Inventory & Equipment State

- Inventory capacity: **20 slots** (`INVENTORY_MAX = 20`), backed by `_inventory[]`.
- Equipment slots: `_equipped` object with keys `L`, `R`, `chest`, `arms`, `legs`, `shield`, `mod`, `augment`.
- Ground drops cap: **20 simultaneous** (`_MAX_GROUND_DROPS = 20`).
- Ground drops expire after **30 seconds**.
- Equipment loot exists in **campaign mode only** — `spawnEquipmentLoot()` and `checkEquipmentPickups()` return immediately in `simulation` and `pvp` modes.

---

## Section 2: Item Sub Types

Sub types are organized by `baseType`. Stats listed are the **base stats before level/rarity scaling** (see Section 6 for the scaling formula).

---

### baseType: `weapon`

Sub type key = weapon key from `WEAPONS`. Display name from `WEAPON_NAMES`. Base stats pulled directly from the `WEAPONS` constant at generation time.

| Sub type key | Display name | Chassis | Weight | Key stats | Special properties |
|---|---|---|---|---|---|
| `smg` | Submachine Gun | Light only | 15 | dmg:6, reload:55ms, speed:950 | `rangeDropoff:280` — damage falls off past 280px |
| `mg` | Machine Gun | Medium, Heavy | 25 | dmg:28, reload:280ms, speed:870 | Sustained fire workhorse |
| `sg` | Shotgun | Light only | 30 | dmg:16, reload:700ms, speed:580, pellets:6, range:500 | Multi-pellet; each pellet deals `dmg` |
| `br` | Battle Rifle | Light, Medium | 30 | dmg:30, reload:900ms, speed:1150, burst:3 | Fires burst of 3 |
| `hr` | Heavy Rifle | Medium, Heavy | 45 | dmg:160, reload:1600ms, speed:1100 | `armorBuster:true`, `shieldPierce:true` — ignores shield absorb entirely |
| `fth` | Flamethrower | Light only | 30 | dmg:7, reload:90ms, speed:420, range:350 | `flame:true` — DoT cone, no standard bullet |
| `sr` | Sniper Rifle | Light, Medium | 50 | dmg:240, reload:2200ms, speed:2200 | `pierce:true` — passes through all enemies in line |
| `gl` | Grenade Launcher | Medium only | 55 | dmg:220, reload:2800ms | `explosive:true`, `armDist:80` — short arm distance, big AoE |
| `rl` | Rocket Launcher | Heavy only | 65 | dmg:250, reload:3200ms, speed:820 | `explosive:true`, `selfDamage:true`, `radius:120` — can self-damage |
| `plsm` | Plasma Cannon | Medium, Heavy | 60 | dmg:300, reload:3200ms, size:32 | Channeled growing orb projectile |
| `rail` | Railgun | Medium only* | 70 | dmg:450, reload:4500ms, speed:3000 | `pierce:true`, `charge:true` — long charge, extreme single-target; excluded from enemy use |

> *`rail` is in `CHASSIS_WEAPONS.medium` only. It is in `WEAPON_LOOT_KEYS` and can drop as loot for medium chassis.

**Weapons not in `WEAPON_LOOT_KEYS`** (cannot drop as loot):

| Key | Display name | Reason |
|---|---|---|
| `siege` | Siege Cannon | 2H weapon — locks both arm slots |
| `chain` | Chain Gun | 2H weapon — locks both arm slots |

---

### baseType: `armor`

Equips to `_equipped.chest`.

| Sub type key | Display name | Base stats |
|---|---|---|
| `light_plate` | Light Plating | coreHP:20, dr:0.02 |
| `medium_plate` | Medium Plating | coreHP:40, dr:0.05 |
| `heavy_plate` | Heavy Plating | coreHP:60, dr:0.08 |
| `reactive_plate` | Reactive Plating | coreHP:30, dr:0.04 |

No chassis restrictions on armor sub types.

---

### baseType: `arms`

Equips to `_equipped.arms`.

| Sub type key | Display name | Base stats |
|---|---|---|
| `servo_enhancer` | Servo Enhancer | armHP:15, reloadPct:-5 |
| `stabilizer` | Stabilizer | armHP:20, accuracy:5 |
| `power_coupler` | Power Coupler | armHP:10, dmgPct:3 |

No chassis restrictions on arms sub types.

> Note: `reloadPct` is an inverted stat — negative values are beneficial (faster reload).

---

### baseType: `legs`

Equips to `_equipped.legs`.

| Sub type key | Display name | Base stats |
|---|---|---|
| `actuator` | Actuator | legHP:20, speedPct:3 |
| `booster` | Booster | legHP:15, speedPct:6, dodgePct:2 |
| `dampener` | Dampener | legHP:30, speedPct:-2, dr:0.03 |

No chassis restrictions on `legs` sub types (distinct from `leg_system`).

---

### baseType: `shield`

Equips to `_equipped.shield`. These are pure stat items, not system activators.

| Sub type key | Display name | Base stats |
|---|---|---|
| `barrier_core` | Barrier Core | shieldHP:15, shieldRegen:5 |
| `regen_cell` | Regen Cell | shieldHP:5, shieldRegen:15 |
| `absorb_matrix` | Absorb Matrix | shieldHP:25, absorbPct:5 |

---

### baseType: `mod`

Equips to `_equipped.mod`. These are pure stat items, not system activators.

| Sub type key | Display name | Base stats |
|---|---|---|
| `cooldown_chip` | Cooldown Chip | modCdPct:-8 |
| `amplifier` | Amplifier | modEffPct:10 |
| `overcharge` | Overcharge Module | modCdPct:-5, modEffPct:5 |

> `modCdPct` is an inverted stat — negative values reduce cooldown (beneficial).

---

### baseType: `augment`

Equips to `_equipped.augment`. These are pure stat items, not system activators.

| Sub type key | Display name | Base stats |
|---|---|---|
| `targeting_array` | Targeting Array | critChance:3, accuracy:5 |
| `neural_link` | Neural Link | lootMult:5 |
| `combat_matrix` | Combat Matrix | dmgPct:3, speedPct:2 |

---

### baseType: `shield_system`

Equips to `_equipped.shield` and sets `loadout.shld = systemKey`. Each entry in `CHASSIS_SHIELDS` controls which chassis can receive this drop.

| Sub type key | Display name | `systemKey` | Base stats | Chassis |
|---|---|---|---|---|
| `sys_light_shield` | Light Shield | `light_shield` | shieldHP:10, shieldRegen:3 | All |
| `sys_standard_shield` | Standard Shield | `standard_shield` | shieldHP:15, shieldRegen:2 | All |
| `sys_heavy_shield` | Heavy Shield | `heavy_shield` | shieldHP:20, dr:0.02 | All |
| `sys_reactive_shield` | Reactive Shield | `reactive_shield` | shieldHP:12, shieldRegen:5 | All |
| `sys_fortress_shield` | Fortress Shield | `fortress_shield` | shieldHP:30, dr:0.03 | All |
| `sys_micro_shield` | Micro Shield | `micro_shield` | shieldRegen:8, speedPct:2 | Light |
| `sys_flicker_shield` | Flicker Shield | `flicker_shield` | shieldHP:10, dodgePct:3 | Light |
| `sys_phase_shield` | Phase Shield | `phase_shield` | shieldHP:10, speedPct:2 | Light |
| `sys_adaptive_shield` | Adaptive Shield | `adaptive_shield` | shieldHP:15, dr:0.02 | Medium |
| `sys_counter_shield` | Counter Shield | `counter_shield` | shieldHP:12, dmgPct:2 | Medium |
| `sys_bulwark_shield` | Bulwark Shield | `bulwark_shield` | shieldHP:25, dr:0.04 | Heavy |
| `sys_titan_shield` | Titan Shield | `titan_shield` | shieldHP:30, dr:0.05 | Heavy |

> `smoke_burst`, `mirror_shield` (Light), `pulse_shield`, `layered_shield`, `overcharge_shld` (Medium), `siege_wall`, `retribution_shld`, `thermal_shield` (Heavy) exist in `CHASSIS_SHIELDS` but have no corresponding `ITEM_BASES` entry — they are hangar-only equipment, not loot drops.

---

## Section 3: Rarity System

Defined in `RARITY_DEFS` in `js/loot-system.js`.

| Rarity key | Display label | Color | `colorStr` | Drop weight | Min affixes | Max affixes | `statMult` | Affix quality min | Affix quality max | Scrap value |
|---|---|---|---|---|---|---|---|---|---|---|
| `common` | Common | `0xc0c8d0` | `#c0c8d0` | 45 | 0 | 1 | 1.00 | 0.00 | 0.40 | 1 |
| `uncommon` | Uncommon | `0x00ff44` | `#00ff44` | 30 | 1 | 2 | 1.15 | 0.15 | 0.55 | 3 |
| `rare` | Rare | `0x4488ff` | `#4488ff` | 15 | 2 | 3 | 1.30 | 0.30 | 0.75 | 8 |
| `epic` | Epic | `0xaa44ff` | `#aa44ff` | 8 | 3 | 4 | 1.50 | 0.50 | 0.90 | 20 |
| `legendary` | Legendary | `0xffd700` | `#ffd700` | 2 | 4 | 5 | 1.80 | 0.70 | 1.00 | 50 |

**Column definitions:**

- **Drop weight**: Used in `rollRarity()` as a baseline before luck modifiers shift the thresholds (see Section 6). Higher weight = more common.
- **statMult**: Multiplier applied to all numeric base stats at generation time. A legendary item has base stats 1.8× higher than a common of the same type (before level scaling).
- **Affix quality min/max**: The quality range `[0.0–1.0]` for rolling each affix value. Quality is sampled uniformly within the range, then linearly interpolated between the affix's `min` and `max` values.
- **Scrap value**: How much scrap currency the item is worth when scrapped (referenced in `RARITY_DEFS` but scrapping UI is in `js/menus.js`).

### Visual Effects by Rarity

- **Epic**: Camera shake on drop spawn (`shake(120, 0.004)`) and burst of 6 particles on pickup.
- **Legendary**: Camera shake on drop spawn (`shake(200, 0.008)`), 6 star-burst particles on spawn, sound effect (`sndEquipDrop`), burst of 10 particles on pickup, camera shake on pickup (`shake(80, 0.003)`).
- **Common/Uncommon/Rare**: No special visual effects on spawn or pickup.

### No Unique/Set Rarity Tier

There is no separate rarity tier for unique items. Unique items use the standard `legendary` or `epic` rarity tiers from `RARITY_DEFS`. The `isUnique: true` flag on an item is a separate property, not a rarity level.

---

## Section 4: Affix System

Defined in `AFFIX_POOL` in `js/loot-system.js`. All affixes are drawn from a single flat pool; there is **no prefix/suffix distinction** in the code.

Each affix entry has:
- `label`: Display string template (uses `{v}` as value placeholder)
- `min` / `max`: Absolute value range for the stat bonus
- `weight`: Weighted probability when randomly selecting this affix
- `types`: Array of `baseType` strings this affix can roll on
- `subTypes` (optional): Further restricts to specific `subType` keys within those base types

### Affix Rolling Mechanics

1. Filter `AFFIX_POOL` to entries where `affix.types.includes(baseType)` and (if `subTypes` present) `affix.subTypes.includes(subType)`.
2. Pick `count` affixes via weighted random, without replacement (each key used once per item).
3. For each picked affix, sample a `quality` value uniformly from `[affixQualityMin, affixQualityMax]` for the item's rarity.
4. Final value: `Math.round(affix.min + (affix.max - affix.min) * quality)`.

The `affixType` passed to `rollAffixes()` for system items is remapped: `shield_system → shield`, `mod_system → mod`, `leg_system → legs`, `aug_system → augment`.

---

### Offensive Affixes

| Affix key | Stat modified | Label | Min | Max | Weight | Allowed `baseType` | Sub type restriction |
|---|---|---|---|---|---|---|---|
| `dmgFlat` | `dmgFlat` | `+{v} Damage` | 2 | 18 | 10 | `weapon` | None |
| `dmgPct` | `dmgPct` | `+{v}% Damage` | 3 | 28 | 8 | `weapon`, `arms`, `augment` | None |
| `critChance` | `critChance` | `+{v}% Crit Chance` | 2 | 18 | 7 | `weapon`, `augment` | None |
| `critDmg` | `critDmg` | `+{v}% Crit Damage` | 10 | 60 | 5 | `weapon`, `augment` | None |
| `reloadPct` | `reloadPct` | `-{v}% Reload Time` | 3 | 22 | 8 | `weapon`, `arms` | None |
| `pellets` | `pellets` | `+{v} Pellets` | 1 | 3 | 3 | `weapon` | `sg` only |
| `splashRadius` | `splashRadius` | `+{v}% Blast Radius` | 10 | 45 | 5 | `weapon` | `gl`, `rl`, `plsm`, `siege` only |
| `accuracy` | `accuracy` | `+{v}% Accuracy` | 3 | 15 | 5 | `weapon`, `arms` | None |

> `reloadPct` is an inverted stat. The label shows `-{v}%` (negative = faster reload = better). Render logic in `js/menus.js` uses `_hoverInvertedStats` to display it correctly with a `+` prefix.

---

### Defensive Affixes

| Affix key | Stat modified | Label | Min | Max | Weight | Allowed `baseType` | Sub type restriction |
|---|---|---|---|---|---|---|---|
| `coreHP` | `coreHP` | `+{v} Core HP` | 10 | 100 | 8 | `armor` | None |
| `armHP` | `armHP` | `+{v} Arm HP` | 5 | 50 | 6 | `arms` | None |
| `legHP` | `legHP` | `+{v} Leg HP` | 5 | 50 | 6 | `legs` | None |
| `allHP` | `allHP` | `+{v} All Part HP` | 5 | 30 | 4 | `armor`, `augment` | None |
| `dr` | `dr` | `+{v}% Damage Reduction` | 1 | 12 | 5 | `armor`, `legs` | None |
| `shieldHP` | `shieldHP` | `+{v} Shield Capacity` | 5 | 50 | 7 | `shield` | None |
| `shieldRegen` | `shieldRegen` | `+{v}% Shield Regen` | 5 | 35 | 6 | `shield` | None |
| `absorbPct` | `absorbPct` | `+{v}% Shield Absorb` | 2 | 10 | 4 | `shield` | None |
| `dodgePct` | `dodgePct` | `+{v}% Dodge Chance` | 1 | 10 | 4 | `legs` | None |

---

### Utility Affixes

| Affix key | Stat modified | Label | Min | Max | Weight | Allowed `baseType` | Sub type restriction |
|---|---|---|---|---|---|---|---|
| `speedPct` | `speedPct` | `+{v}% Move Speed` | 2 | 14 | 6 | `legs`, `augment` | None |
| `modCdPct` | `modCdPct` | `-{v}% Mod Cooldown` | 3 | 22 | 6 | `mod` | None |
| `modEffPct` | `modEffPct` | `+{v}% Mod Effectiveness` | 5 | 30 | 5 | `mod` | None |
| `lootMult` | `lootMult` | `+{v}% Loot Quality` | 3 | 18 | 3 | `augment` | None |
| `autoRepair` | `autoRepair` | `+{v} HP/sec Regen` | 1 | 6 | 4 | `armor`, `augment` | None |

> `modCdPct` is an inverted stat (negative = shorter cooldown = better). Rendered with `+` prefix by `_hoverInvertedStats`.

---

### Affix Availability by Base Type — Quick Reference

| Base type | Available affixes |
|---|---|
| `weapon` | dmgFlat, dmgPct, critChance, critDmg, reloadPct, pellets (sg only), splashRadius (gl/rl/plsm/siege only), accuracy |
| `armor` | coreHP, allHP, dr, autoRepair |
| `arms` | dmgPct, reloadPct, accuracy, armHP |
| `legs` | legHP, dr, dodgePct, speedPct |
| `shield` | shieldHP, shieldRegen, absorbPct |
| `mod` | modCdPct, modEffPct |
| `augment` | dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair |

> System item types (`shield_system`, `mod_system`, `leg_system`, `aug_system`) are mapped to their parent type before affix selection, so they draw from the same pool as their corresponding pure-stat type.

---

## Section 5: Unique Items

Defined in `UNIQUE_ITEMS` in `js/loot-system.js`. There are **16 unique items** total — 2 per boss (1 Legendary, 1 Epic).

### How Unique Items Are Obtained

- **Source**: Boss drops only. Every boss kill calls `spawnEquipmentLoot()` with `isBoss: true`, which calls `rollBossDrops(bossType, round)`.
- **Drop guarantee**: Every boss kill guarantees **1 unique item** drop.
  - 25% chance → Legendary unique
  - 75% chance → Epic unique
- **Additional drops**: 1–2 regular (non-unique) items also drop alongside the unique.
- **Generation**: `generateUniqueItem(uniqueKey, round)` scales base stats and affix values by level.
- **`computedStats`**: Unique items have both `baseStats` (scaled) and fixed `affixes` (also level-scaled). `computedStats` = `baseStats` + sum of all affix values.

### Level Scaling for Unique Items

Same formula as regular items:
```
levelMult = 1 + (round - 1) * 0.03
scaledStat = Math.round(baseStat * levelMult * rarityDef.statMult)
affixValue = Math.round(templateAffix.value * levelMult)
```

### Unique Effect Implementation Status

| Effect key | Status |
|---|---|
| `frontalAbsorb` | Implemented — `applyFrontalAbsorb()` |
| `shieldDR` | Implemented — `getShieldDRBonus()` |
| `doubleStrike` | Implemented — `checkDoubleStrike()` |
| `dualReload` | Implemented — `getDualReloadBonus()` |
| `modCover` | Implemented — `spawnModCover()` |
| `modAmplify` | Effect key registered; proc logic is in `index.html` |
| `unstoppable` | Implemented — `getUnstoppableSpeedBonus()` |
| `impactArmor` | Implemented — `checkImpactArmor()`, `getImpactArmorDR()` |
| `swarmBurst` | Implemented — `triggerSwarmBurst()` |
| `adaptiveArmor` | Implemented — `getAdaptiveArmorDR()` |
| `mirrorShot` | **Stub only** — `checkMirrorShot()` always returns `false` |
| `echoStrike` | **Stub only** — `triggerEchoStrike()` is empty |
| `titanSmash` | Implemented — `checkTitanSmash()`, `triggerTitanSmash()` |
| `colossusStand` | Implemented — `updateColossusStand()`, `getColossusDmgMult()`, `getColossusDR()` |
| `coreOverload` | Implemented — `triggerCoreOverload()` |
| `matrixBarrier` | Implemented — `triggerMatrixBarrier()`, `isMatrixBarrierActive()` |

---

### Boss Drop Table (`BOSS_DROP_TABLE`)

| Boss key | Spawn rounds | Legendary drop | Epic drop |
|---|---|---|---|
| `warden` | 5, 25, 45… | `wardens_aegis` | `sentinels_plating` |
| `razor` | 10, 30, 50… | `razor_edge` | `twinned_servo` |
| `architect` | 15, 35, 55… | `blueprint_core` | `architects_array` |
| `juggernaut` | 20, 40, 60… | `juggernaut_engine` | `unstoppable_core` |
| `swarm` | 25, 65, 105… | `hive_mind` | `swarm_carapace` |
| `mirror` | 30, 70, 110… | `mirror_shard` | `echo_frame` |
| `titan` | 35, 75, 115… | `titan_fist` | `colossus_frame` |
| `core` | 40, 80, 120… | `core_reactor` | `matrix_shield` |

> Boss spawn round schedules are from `BOSS_COLORS` context in `js/constants.js`. Exact scheduling logic lives in `js/rounds.js` / `js/enemies.js`.

---

### Unique Item Details

#### Warden's Aegis
- **Key**: `wardens_aegis` | **Rarity**: Legendary | **Base type**: `shield`
- **Base stats**: shieldHP:45, shieldRegen:12, absorbPct:10
- **Fixed affixes**: +25 Shield Capacity, +5% Damage Reduction
- **Unique effect** (`frontalAbsorb`): While shield is active, frontal hits (within ±60° of torso facing) take 40% reduced damage.
- **Implementation**: `applyFrontalAbsorb(amt, bulletAngle)` — checks angle diff using `Phaser.Math.Angle.Wrap`.

---

#### Sentinel's Plating
- **Key**: `sentinels_plating` | **Rarity**: Epic | **Base type**: `armor`
- **Base stats**: coreHP:55, dr:0.06
- **Fixed affixes**: +30 Core HP, +4% Damage Reduction
- **Unique effect** (`shieldDR`): +12% DR while shield is at maximum capacity.
- **Implementation**: `getShieldDRBonus()` — returns 0.12 if `player.shield >= player.maxShield`.

---

#### Razor Edge
- **Key**: `razor_edge` | **Rarity**: Legendary | **Base type**: `weapon`, sub type: `smg`
- **Base stats**: dmg:18, reload:180ms, speed:700
- **Fixed affixes**: +15% Damage, +8% Crit Chance, -10% Reload Time
- **Unique effect** (`doubleStrike`): Every 3rd shot fires twice (duplicate projectile).
- **Implementation**: `checkDoubleStrike()` — increments `_doubleStrikeCounter`; resets to 0 and returns `true` at count 3.

---

#### Twinned Servo
- **Key**: `twinned_servo` | **Rarity**: Epic | **Base type**: `arms`
- **Base stats**: armHP:25, reloadPct:-8
- **Fixed affixes**: -12% Reload Time, +5% Damage
- **Unique effect** (`dualReload`): When both arms have weapons equipped (`loadout.L` and `loadout.R` both non-`none`), all reload speed increased by 30%.
- **Implementation**: `getDualReloadBonus()` — returns 0.30 if both arm slots are occupied.

---

#### Blueprint Core
- **Key**: `blueprint_core` | **Rarity**: Legendary | **Base type**: `mod`
- **Base stats**: modCdPct:-12, modEffPct:15
- **Fixed affixes**: -10% Mod Cooldown, +15% Mod Effectiveness
- **Unique effect** (`modCover`): Each mod activation spawns a temporary destructible cover wall (60×16px, 40 HP, 8s duration) at the player's position.
- **Implementation**: `spawnModCover(scene)` — creates a physics-enabled wall rectangle and adds it to `coverObjects`.

---

#### Architect's Array
- **Key**: `architects_array` | **Rarity**: Epic | **Base type**: `augment`
- **Base stats**: modEffPct:20
- **Fixed affixes**: -8% Mod Cooldown, +25% Mod Effectiveness
- **Unique effect** (`modAmplify`): All mod durations and effects extended by 50%.
- **Implementation**: Effect key registered in `_gearState._uniqueEffects`; proc logic wired in `index.html`.

---

#### Juggernaut Engine
- **Key**: `juggernaut_engine` | **Rarity**: Legendary | **Base type**: `legs`
- **Base stats**: legHP:40, speedPct:8
- **Fixed affixes**: +12% Move Speed, +5% Dodge Chance, +20 Leg HP
- **Unique effect** (`unstoppable`): Immune to slow effects; movement speed bonus increased by 20%.
- **Implementation**: `getUnstoppableSpeedBonus()` — returns 0.20 when active.

---

#### Unstoppable Core
- **Key**: `unstoppable_core` | **Rarity**: Epic | **Base type**: `armor`
- **Base stats**: coreHP:70, dr:0.05
- **Fixed affixes**: +15 All Part HP, +6% Damage Reduction
- **Unique effect** (`impactArmor`): Taking more than 25 damage in a single hit grants +15% DR for 3 seconds.
- **Implementation**: `checkImpactArmor(dmg)` sets `_impactArmorActive = true` for 3s via `setTimeout`. `getImpactArmorDR()` returns 0.15 while active.

---

#### Hive Mind
- **Key**: `hive_mind` | **Rarity**: Legendary | **Base type**: `augment`
- **Base stats**: dmgPct:8, modEffPct:10
- **Fixed affixes**: +10% Damage, +8% Crit Chance, +6% Mod Cooldown (note: positive modCdPct = longer cooldown on this item)
- **Unique effect** (`swarmBurst`): Each kill spawns 2 homing micro-drones that seek the nearest enemy and deal 15 damage each (3s lifetime, max 500px range).
- **Implementation**: `triggerSwarmBurst(scene, x, y)` — spawns 2 physics circles with a 50ms tick loop homing toward nearest enemy.

---

#### Swarm Carapace
- **Key**: `swarm_carapace` | **Rarity**: Epic | **Base type**: `armor`
- **Base stats**: coreHP:60, dr:0.04
- **Fixed affixes**: +20 All Part HP, +5% Damage Reduction
- **Unique effect** (`adaptiveArmor`): Successive hits from the same enemy source deal 10% less damage per consecutive hit, stacking up to 4× (max 40% DR).
- **Implementation**: `getAdaptiveArmorDR(shooterId)` — tracks `_adaptiveLastShooter` and `_adaptiveStacks`; resets stacks when shooter changes.

---

#### Mirror Shard
- **Key**: `mirror_shard` | **Rarity**: Legendary | **Base type**: `weapon` (no sub type key — weapon-type unique without a specific weapon sub type)
- **Base stats**: dmgFlat:12
- **Fixed affixes**: +12% Damage, +15% Crit Damage, +8% Reload Speed
- **Unique effect** (`mirrorShot`): Bullets reflect off cover/walls once, dealing 60% damage on ricochet.
- **Implementation**: **STUB — not implemented**. `checkMirrorShot()` always returns `false`.

---

#### Echo Frame
- **Key**: `echo_frame` | **Rarity**: Epic | **Base type**: `arms`
- **Base stats**: armHP:35, reloadPct:5 (note: positive reloadPct = slower reload on base stat)
- **Fixed affixes**: +8% Reload Speed, +6% Accuracy
- **Unique effect** (`echoStrike`): Mod activation fires a phantom copy of the last shot.
- **Implementation**: **STUB — not implemented**. `triggerEchoStrike()` is empty.

---

#### Titan Fist
- **Key**: `titan_fist` | **Rarity**: Legendary | **Base type**: `weapon` (no sub type key)
- **Base stats**: dmgFlat:18
- **Fixed affixes**: +15% Damage, +20% Splash Radius, +5% Crit Chance
- **Unique effect** (`titanSmash`): Every 5th shot creates a shockwave dealing 50% of shot damage in a 120px AoE.
- **Implementation**: `checkTitanSmash()` / `triggerTitanSmash(scene, x, y, baseDmg)` — counter resets at 5, AoE damage = `Math.round(baseDmg * 0.5)`.

---

#### Colossus Frame
- **Key**: `colossus_frame` | **Rarity**: Epic | **Base type**: `legs`
- **Base stats**: legHP:50, speedPct:3
- **Fixed affixes**: +25 All Part HP, +4% Damage Reduction
- **Unique effect** (`colossusStand`): After standing still for 2 seconds, gain +25% damage and +10% DR until moving.
- **Implementation**: `updateColossusStand(time)` runs in `update()` loop; sets `_colossusActive = true` after 2000ms stationary. `getColossusDmgMult()` returns 1.25, `getColossusDR()` returns 0.10 when active.

---

#### Core Reactor
- **Key**: `core_reactor` | **Rarity**: Legendary | **Base type**: `mod`
- **Base stats**: modCdPct:12, modEffPct:10 (note: positive modCdPct = longer cooldown on base stat)
- **Fixed affixes**: +10% Mod Cooldown, +12% Mod Effectiveness, +5% Damage
- **Unique effect** (`coreOverload`): Each mod activation releases a 200px energy pulse dealing 80 damage to all enemies.
- **Implementation**: `triggerCoreOverload(scene)` — creates expanding ring graphic and calls `damageEnemy()` for all enemies within 200px.

---

#### Matrix Shield
- **Key**: `matrix_shield` | **Rarity**: Epic | **Base type**: `shield`
- **Base stats**: shieldHP:50, shieldRegen:3
- **Fixed affixes**: +30 Shield HP, +5% Shield Absorb
- **Unique effect** (`matrixBarrier`): When shield breaks, gain 3-second full invulnerability. 60-second cooldown.
- **Implementation**: `triggerMatrixBarrier(scene, time)` — sets `_matrixBarrierActive = true` for 3s; `_matrixBarrierCooldown = time + 60000`. `isMatrixBarrierActive()` checked before processing player damage.

---

## Section 6: Item Generation Rules

### Entry Point: `spawnEquipmentLoot(scene, x, y, enemyData)`

Called when an enemy dies. The full flow:

```
spawnEquipmentLoot()
  → _getEquipDropChance(enemyData)   — check if a drop occurs at all
  → if boss: rollBossDrops()         — unique + regular drops
  → else:    generateItem()          — single regular item
  → spawnEquipmentDrop()             — place item on the ground
```

Equipment drops only spawn in `campaign` mode. The function returns immediately if `_gameMode === 'simulation'` or `_gameMode === 'pvp'`.

---

### Step 1: Drop Chance (`_getEquipDropChance`)

| Enemy type | Drop chance |
|---|---|
| `isBoss: true` | 1.00 (100% — always drops) |
| `isCommander: true` | 0.45 (45%) |
| `isElite: true` | 0.35 (35%) |
| `enemyType` set (special type) | 0.25 (25%) |
| `isMedic: true` | 0.18 (18%) |
| Standard enemy | `min(0.08 + round × 0.007, 0.22)` + late bonus |

**Late-round bonus** (standard enemies only): For rounds > 20, an additional `min((round − 20) × 0.01, 0.10)` is added to the base rate. The combined value is capped at **0.35 (35%)**.

**Examples:**
- Round 1 standard: 8.7% drop chance
- Round 10 standard: 15% drop chance
- Round 20 standard: 22% drop chance (base cap)
- Round 25 standard: 22% + 5% = 27%
- Round 30 standard: 22% + 10% = 32%
- Round 50+ standard: 22% + 10% = 32% (combined cap)

---

### Step 2: Base Type Selection (`_selectItemType`)

Base weights before enemy type modifiers:

| Base type | Base weight |
|---|---|
| `weapon` | 30 |
| `armor` | 10 |
| `arms` | 8 |
| `shield_system` | 8 |
| `mod_system` | 7 |
| `leg_system` | 7 |
| `legs` | 6 |
| `shield` | 6 |
| `mod` | 6 |
| `augment` | 6 |
| `aug_system` | 6 |

**Enemy type modifiers** (multiply base weights):

| Enemy flag | Modifier |
|---|---|
| `isMedic` | `shield_system × 2`, `shield × 2`, `armor × 2` |
| `isCommander` | `weapon × 2`, `mod_system × 2` |
| `isBoss` | `mod_system × 2`, `aug_system × 2`, `shield_system × 2` |
| `isElite` | `leg_system × 2`, `shield_system × 1.5` |

Selection is weighted random over the final weight values.

---

### Step 3: Base Item Selection (`_selectBaseItem`)

For `weapon` type: picks randomly from `WEAPON_LOOT_KEYS` filtered by `CHASSIS_WEAPONS[chassis]`. If no weapons pass the chassis filter (fallback), picks from the full unfiltered list.

For non-weapon types: all `ITEM_BASES` entries matching `baseType` are collected. For system types (`shield_system`, `mod_system`, `leg_system`, `aug_system`), the candidates are further filtered by the relevant chassis restriction set (`CHASSIS_SHIELDS`, `CHASSIS_MODS`, `CHASSIS_LEGS`, `CHASSIS_AUGS`). Selection is uniform random from the filtered pool.

The chassis used for filtering is `loadout.chassis` at the time of generation. If `loadout` is unavailable, defaults to `'medium'`.

---

### Step 4: Rarity Roll (`rollRarity`)

```javascript
function rollRarity(round, isCommander, isBoss)
```

**Luck accumulation:**

| Source | Luck added |
|---|---|
| Round scaling | `min(round × 0.5, 15)` — caps at +15 luck at round 30 |
| Perk loot multiplier | `(_perkState.lootMult − 1) × 20` |
| isCommander | +15 |
| isBoss | +30 |
| Gear `lootMult` stat | `_gearState.lootMult × 0.5` |
| Objective bonus | `(bonus − 1) × 30` (e.g. 1.5× bonus = +15 luck) |

**Thresholds** (roll range 0–100, lower = rarer):

| Rarity | Threshold |
|---|---|
| `legendary` | `2 + luck × 0.1` |
| `epic` | `10 + luck × 0.3` |
| `rare` | `25 + luck × 0.5` |
| `uncommon` | `55 + luck × 0.7` |
| `common` | Everything else |

A random roll in `[0, 100)` is checked against thresholds in order from legendary → epic → rare → uncommon → common.

**Example thresholds at luck = 0 (round 1, standard enemy):**

| Rarity | Threshold | Approx. chance |
|---|---|---|
| Legendary | 2% | 2% |
| Epic | 10% | 8% |
| Rare | 25% | 15% |
| Uncommon | 55% | 30% |
| Common | — | 45% |

**Example thresholds at luck = 30 (boss drop, ~round 1):**

| Rarity | Threshold | Approx. chance |
|---|---|---|
| Legendary | 5% | 5% |
| Epic | 19% | 14% |
| Rare | 40% | 21% |
| Uncommon | 76% | 36% |
| Common | — | 24% |

---

### Step 5: Stat Generation (`generateItem`)

```javascript
const level = round || 1;
const levelMult = 1 + (level - 1) * 0.03;
```

For each numeric base stat:
```javascript
scaledStats[k] = Math.round(v * levelMult * rarityDef.statMult);
```

So a legendary item at round 10 applies: `statMult:1.80 × levelMult:(1 + 9×0.03 = 1.27) = 2.286×` the base stat value.

**Weapon items** copy the following stats from `WEAPONS[baseKey]` into `baseStats` (only if the property exists on the weapon):
`dmg`, `reload`, `pellets`, `speed`, `range`, `radius`, `burst`

**Non-weapon items** copy from `ITEM_BASES[baseKey].baseStats`.

`systemKey` is preserved on the generated item for system items so the equip logic can activate the correct game system.

---

### Step 6: Affix Rolling (see Section 4 for affix pool details)

```javascript
const affixType = _affixTypeMap[baseType] || baseType;
// _affixTypeMap: { shield_system:'shield', mod_system:'mod', leg_system:'legs', aug_system:'augment' }
const affixes = rollAffixes(affixType, subType, rarity);
```

Affix count is `Phaser.Math.Between(rarityDef.minAffixes, rarityDef.maxAffixes)`.
Each affix rolls a quality value and maps it to a value between `affix.min` and `affix.max`.
No affix key can appear twice on the same item.

---

### Step 7: `computedStats` Calculation

```javascript
item.computedStats = { ...scaledStats };
affixes.forEach(a => {
    item.computedStats[a.stat] = (item.computedStats[a.stat] || 0) + a.value;
});
```

`computedStats` = scaled base stats + sum of all affix values. This is what `recalcGearStats()` reads.

---

### Boss Drop Flow (`rollBossDrops`)

```
rollBossDrops(bossType, round)
  → Look up BOSS_DROP_TABLE[bossType]
  → Roll Math.random() < 0.25 ? legendary : epic
  → generateUniqueItem(uniqueKey, round)   — 1 guaranteed unique
  → loop Phaser.Math.Between(1, 2) times:
      generateItem(round, { isBoss:true })  — 1–2 bonus regular items
  → return array of all drops
```

If `bossType` is not in `BOSS_DROP_TABLE` (or is null), falls back to 1–3 regular items via `generateItem`.

---

### Consumable Loot Orbs (`spawnLoot`)

Separate from equipment drops. Available in all game modes.

- **Drop chance**: 30% per enemy kill (100% when `forced = true`, e.g. commander).
- **Type weights**: repair 15% (`_tr < 0.15`), ammo 42.5%, charge 42.5%.
- **Expire after**: 15 seconds.
- **Pickup range**: Close proximity (exact range in `checkLootPickups` in `js/loot-system.js`).

| Type | Color | Glow | Size |
|---|---|---|---|
| `repair` | `0x00ff44` | `#00ff44` | 10px radius |
| `ammo` | `0xffdd00` | `#ffdd00` | 10px radius |
| `charge` | `0x00ffff` | `#00ffff` | 10px radius |

---

### Persistence

| Mode | Inventory persistence |
|---|---|
| `simulation` | Resets every run — `resetInventory()` on each deploy |
| `campaign` | Persists to `localStorage` (`tw_campaign_inventory`, `tw_campaign_equipped`, `tw_campaign_scrap`) and cloud via Supabase (`tw_campaign_saves` table) |
| `pvp` | No equipment loot system |

Campaign save is debounced 2 seconds after any `saveInventory()` call before uploading to cloud (`_scheduleCloudSave`).

---

## Section 7: Gear Stats & Stacking

### `recalcGearStats()` — How It Works

Called whenever equipment changes (equip, unequip, on load). Reads all 8 `_equipped` slots and produces a single `_gearState` object used throughout the combat code.

```javascript
function recalcGearStats() {
    _gearState = { /* all stats zeroed */ };

    const slots = [
        _equipped.L, _equipped.R,
        _equipped.chest, _equipped.arms,
        _equipped.legs, _equipped.shield,
        _equipped.mod, _equipped.augment
    ];

    slots.forEach(item => {
        if (!item) return;
        // Add base stats
        Object.entries(item.baseStats).forEach(([k, v]) => {
            if (typeof v === 'number' && k in _gearState) _gearState[k] += v;
        });
        // Add affix stats
        item.affixes.forEach(affix => {
            if (affix.stat in _gearState) _gearState[affix.stat] += affix.value;
        });
    });

    // Collect active unique effects
    _gearState._uniqueEffects = {};
    slots.forEach(item => {
        if (item?.isUnique && item.uniqueEffect)
            _gearState._uniqueEffects[item.uniqueEffect] = true;
    });
}
```

### Stat Aggregation Rules

**All stats are additive.** There is no multiplicative stacking between gear items. Every numeric stat from every equipped item's `baseStats` and `affixes` is summed into the corresponding field in `_gearState`.

### `_gearState` Fields

| Field | Type | Description |
|---|---|---|
| `dmgFlat` | integer | Flat damage bonus added to weapon damage |
| `dmgPct` | integer | % damage bonus (additive with other `dmgPct` sources) |
| `critChance` | integer | % critical hit chance |
| `critDmg` | integer | % bonus damage on critical hits |
| `reloadPct` | integer | % reload time reduction (negative = faster, inverted stat) |
| `coreHP` | integer | Bonus core (body) HP |
| `armHP` | integer | Bonus arm HP |
| `legHP` | integer | Bonus leg HP |
| `allHP` | integer | Bonus HP added to all parts |
| `dr` | float | Damage reduction fraction (e.g. 0.10 = 10% DR) |
| `shieldHP` | integer | Bonus shield capacity |
| `shieldRegen` | integer | % bonus shield regen rate |
| `absorbPct` | integer | % bonus shield absorb (stacks additively with base absorb) |
| `dodgePct` | integer | % dodge chance |
| `speedPct` | integer | % move speed bonus |
| `modCdPct` | integer | % mod cooldown reduction (negative = shorter, inverted stat) |
| `modEffPct` | integer | % mod effectiveness bonus |
| `lootMult` | integer | % loot quality bonus (used in `rollRarity` luck calculation) |
| `autoRepair` | integer | HP per second passive regeneration |
| `pellets` | integer | Additional pellets for shotgun (`sg`) |
| `splashRadius` | integer | % bonus explosion radius |
| `accuracy` | integer | % accuracy bonus |
| `_uniqueEffects` | object | Map of `effectKey → true` for active unique item effects |

### Stats Initialized to Zero

`recalcGearStats()` initializes all numeric fields to `0` before summing. An unequipped item contributes nothing.

### No Stat Caps

There are no explicit caps on any `_gearState` numeric field in `recalcGearStats()`. Values are raw sums. Any effective caps are applied at the consumption site in `index.html` combat code (e.g., adaptive armor DR stacks are capped at 4 in `getAdaptiveArmorDR()`).

### Only Numeric Stats Are Summed

The guard `typeof v === 'number' && k in _gearState` means:
- Non-numeric base stats (e.g. `autoRepair:1` where the value is numeric, but anything non-numeric is skipped).
- Stats not listed in the initial `_gearState` zeroing block are silently ignored (no crash, no contribution).
- `computedStats` on items is **not** read by `recalcGearStats()` — it reads `baseStats` and `affixes` separately.

### Unique Effect Registration

After stat summation, `recalcGearStats()` scans all slots again for items with `isUnique: true` and a `uniqueEffect` key. Each active unique effect is registered as `_gearState._uniqueEffects[effectKey] = true`. This is the mechanism `hasUniqueEffect(effectKey)` checks — it reads `_gearState._uniqueEffects`.

### Interaction with Chassis Passives and Perks

`recalcGearStats()` produces `_gearState` only. It does **not** apply chassis passives or perk bonuses. Those are separate:

| Bonus source | Where applied |
|---|---|
| `_gearState` stats | Applied in `index.html` combat/movement code, consuming the summed values |
| Chassis passives (e.g. `passiveDR:0.15` for heavy) | Applied directly from `CHASSIS[chassis]` constants in `index.html` |
| Perk bonuses (`_perkState`) | Applied in `index.html` alongside gear stats, usually additively |
| `_gearState.lootMult` | Fed back into `rollRarity()` as a luck bonus for future drops |

No deduplication or interaction logic exists between `_gearState` fields and chassis/perk values in `recalcGearStats()` itself — the consuming code in `index.html` is responsible for combining them.

### `allHP` Field Behavior

The `allHP` affix/stat adds to all body parts (core, arms, legs). This summation happens at the consumption site in `index.html`, not in `recalcGearStats()`. `recalcGearStats()` only accumulates the numeric total into `_gearState.allHP`.

### Starter Gear

`equipStarterGear()` calls `_createStarterItem()` to construct common-rarity items for the starter weapon and shield, then calls `recalcGearStats()`. Starter items have `level:1`, no affixes (`affixes:[]`), and `rarity:'common'` — they receive no stat scaling beyond the raw `WEAPONS` or `ITEM_BASES` values.

### Save/Load Integrity

On `loadCampaignInventory()`, loaded items are validated: each must have `name`, `rarity`, and `baseType` properties to be accepted. After loading, `recalcGearStats()` is called immediately to rebuild `_gearState` from the restored equipment.

---

### baseType: `mod_system`

Equips to `_equipped.mod` and sets `loadout.mod = systemKey`. Filtered by `CHASSIS_MODS`.

| Sub type key | Display name | `systemKey` | Base stats | Chassis |
|---|---|---|---|---|
| `sys_jump` | Jump Jets | `jump` | speedPct:3 | Light |
| `sys_barrier` | Barrier Module | `barrier` | shieldHP:10, dr:0.02 | Light, Medium |
| `sys_rage` | Rage Inducer | `rage` | dmgPct:4 | Heavy |
| `sys_emp` | EMP Burst | `emp` | modCdPct:-5 | Light |
| `sys_repair` | Repair Drone | `repair` | autoRepair:1 | Medium, Heavy |
| `sys_atk_drone` | Attack Drone | `atk_drone` | dmgPct:2 | Medium, Heavy |
| `sys_missile` | Missile Pod | `missile` | dmgPct:3 | Medium, Heavy |
| `sys_decoy` | Decoy Projector | `decoy` | speedPct:2 | Light |
| `sys_ghost_step` | Ghost Step | `ghost_step` | speedPct:3, dodgePct:2 | Light |
| `sys_overclock_burst` | Overclock Burst | `overclock_burst` | reloadPct:-3, speedPct:2 | Medium |
| `sys_fortress_mode` | Fortress Mode | `fortress_mode` | dr:0.03, coreHP:15 | Heavy |

---

### baseType: `leg_system`

Equips to `_equipped.legs` and sets `loadout.leg = systemKey`. Filtered by `CHASSIS_LEGS`.

| Sub type key | Display name | `systemKey` | Base stats | Chassis |
|---|---|---|---|---|
| `sys_hydraulic_boost` | Hydraulic Boost | `hydraulic_boost` | speedPct:5, legHP:10 | Light |
| `sys_gyro_stabilizer` | Gyro Stabilizer | `gyro_stabilizer` | accuracy:5, legHP:10 | Light, Medium |
| `sys_mag_anchors` | Mag Anchors | `mag_anchors` | dr:0.03, legHP:15 | Medium, Heavy |
| `sys_mine_layer` | Mine Layer | `mine_layer` | dmgPct:2, legHP:10 | Medium, Heavy |
| `sys_sprint_boosters` | Sprint Boosters | `sprint_boosters` | speedPct:8, dodgePct:2 | Light |
| `sys_featherweight` | Featherweight | `featherweight` | speedPct:6, dodgePct:3 | Light |
| `sys_tremor_legs` | Tremor Legs | `tremor_legs` | dmgPct:3, legHP:20 | Heavy |
| `sys_siege_stance` | Siege Stance | `siege_stance` | dr:0.04, dmgPct:3 | Heavy |
| `sys_ironclad_legs` | Ironclad Legs | `ironclad_legs` | dr:0.03, legHP:25 | Heavy |
| `sys_adaptive_stride` | Adaptive Stride | `adaptive_stride` | speedPct:4, dodgePct:2 | Medium |

---

### baseType: `aug_system`

Equips to `_equipped.augment` and sets `loadout.aug = systemKey`. Filtered by `CHASSIS_AUGS`.

| Sub type key | Display name | `systemKey` | Base stats | Chassis |
|---|---|---|---|---|
| `sys_target_painter` | Target Painter | `target_painter` | dmgPct:3, accuracy:3 | Light, Medium |
| `sys_threat_analyzer` | Threat Analyzer | `threat_analyzer` | critChance:2, accuracy:3 | Light, Medium |
| `sys_overclock_cpu` | Overclock CPU | `overclock_cpu` | reloadPct:-5, modCdPct:-3 | Medium |
| `sys_reactive_plating` | Reactive Plating | `reactive_plating` | dr:0.03, coreHP:10 | Medium, Heavy |
| `sys_scrap_cannon` | Scrap Cannon | `scrap_cannon` | dmgPct:4 | Heavy |
| `sys_ghost_circuit` | Ghost Circuit | `ghost_circuit` | dodgePct:3, speedPct:3 | Light |
| `sys_reflex_amp` | Reflex Amp | `reflex_amp` | reloadPct:-4, dodgePct:2 | Light |
| `sys_combat_ai` | Combat AI | `combat_ai` | critChance:3, dmgPct:2 | Medium |
| `sys_war_machine` | War Machine | `war_machine` | dmgPct:5, dr:0.02 | Heavy |
| `sys_iron_fortress` | Iron Fortress | `iron_fortress` | dr:0.05, coreHP:15 | Heavy |
| `sys_drone_relay` | Drone Relay | `drone_relay` | dmgPct:2, modCdPct:-3 | Medium |
