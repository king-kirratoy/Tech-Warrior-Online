# Tech Warrior Online — Campaign Equipment Reference

> **Scope**: Campaign mode (`_gameMode = 'campaign'`) only. Covers all items that can drop as loot
> from regular enemies, elite/commander enemies, bosses, or the supply shop. Warzone hangar
> selections and multiplayer loadouts are out of scope.
>
> **Source files audited**: `js/constants.js`, `js/loot-system.js` (as of v6.43).
> All base stats are **pre-scaling values**. Actual stats in-game are multiplied by
> `levelMult = 1 + (round − 1) × 0.03` and `rarityDef.statMult` (1.00 → 1.80).
>
> **Note on LOOT_REFERENCE.md discrepancies**: The actual code uses base types `cpu` and
> `cpu_system` (not `mod`/`mod_system`). Chassis weapon restrictions and affix names also
> differ from LOOT_REFERENCE.md — this document uses the authoritative values from source code.

---

## Drop Sources Quick Reference

| Source | Drop chance | Notes |
|---|---|---|
| Standard enemy | 8.7% (round 1) → 22% cap + up to 10% late bonus (rounds 20+) | Combined cap: 35% |
| Special-type enemy | 25% | Enemies with `enemyType` set |
| Medic | 18% | Biased toward shield/armor drops |
| Elite | 35% | Biased toward leg_system/shield_system drops |
| Commander | 45% | Biased toward weapon/cpu_system drops |
| Boss | 100% guaranteed | Always drops 1 unique + 1–2 regular items |

---

## Section 1: Weapons

Weapons are the most common loot type (base weight: 30 out of ~100 total weight).
Only keys in `WEAPON_LOOT_KEYS` can drop: `smg`, `mg`, `sg`, `br`, `hr`, `fth`, `sr`, `gl`, `rl`, `plsm`, `rail`.

Weapon drops are **filtered by the player's current chassis** at generation time (via `CHASSIS_WEAPONS`).
Each chassis only receives weapons it can equip — there is no cross-chassis weapon contamination in drops.

**Cannot drop as loot**: `siege` (Siege Cannon) and `chain` (Chain Gun) — both are 2H weapons
that require locking both arm slots simultaneously; the one-slot-at-a-time loot equip system
cannot handle them safely.

### Weapon Affixes

All weapons draw from the following affix pool (`AFFIX_POOL` entries with `types: ['weapon']`):

| Affix key | Label | Range | Weight | Sub-type restriction |
|---|---|---|---|---|
| `dmgFlat` | +{v} Damage | 2–18 | 10 | None |
| `dmgPct` | +{v}% Damage | 3–28 | 8 | None |
| `critChance` | +{v}% Crit Chance | 2–18 | 7 | None |
| `critDmg` | +{v}% Crit Damage | 10–60 | 5 | None |
| `fireRatePct` | +{v}% Fire Rate | 3–22 | 8 | None |
| `accuracy` | +{v}% Accuracy | 3–15 | 5 | None |
| `pellets` | +{v} Pellets | 1–3 | 3 | `sg` only |
| `splashRadius` | +{v}% Blast Radius | 10–45 | 5 | `gl`, `rl`, `plsm` only |

> `fireRatePct` increases fire rate — higher value = shoots faster (shorter effective reload).
> `splashRadius` only rolls on explosive/AoE weapons. `pellets` only rolls on Shotgun.

---

### Light Chassis Weapons

Light chassis can equip: `smg`, `fth`, `sg`

---

#### SMG — Submachine Gun
- **Sub type key**: `smg`
- **Base stats**: dmg: 6, fireRate: 55 ms, bulletSize: 4, speed: 950, rangeDropoff: 280
- **Special**: `rangeDropoff: 280` — damage falls off past 280 px
- **Chassis**: Light only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy
- **Drop sources**: Regular enemies (Light run), elites, commanders, bosses (regular drops)

---

#### FTH — Flamethrower
- **Sub type key**: `fth`
- **Base stats**: dmg: 7, fireRate: 90 ms, bulletSize: 8, speed: 420, range: 350, flame: true
- **Special**: `flame: true` — fires a short-range DoT cone, not a standard bullet. DoT ignites on hit.
- **Chassis**: Light only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy
  - `splashRadius` does NOT apply to FTH (not in subTypes list)
- **Drop sources**: Regular enemies (Light run), elites, commanders, bosses (regular drops)

---

#### SG — Shotgun
- **Sub type key**: `sg`
- **Base stats**: dmg: 16 per pellet, fireRate: 700 ms, bulletSize: 5, speed: 580, pellets: 6, range: 500
- **Special**: Fires 6 pellets simultaneously — each pellet deals full `dmg`. Devastating at close range.
- **Chassis**: Light only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy, **pellets** (+1–3 extra pellets)
- **Drop sources**: Regular enemies (Light run), elites, commanders, bosses (regular drops)

---

### Medium Chassis Weapons

Medium chassis can equip: `mg`, `br`, `sr`, `rail`

---

#### MG — Machine Gun
- **Sub type key**: `mg`
- **Base stats**: dmg: 28, fireRate: 280 ms, bulletSize: 6, speed: 870
- **Special**: Reliable sustained-fire workhorse; no special mechanics
- **Chassis**: Medium only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy
- **Drop sources**: Regular enemies (Medium run), elites, commanders, bosses (regular drops)

---

#### BR — Battle Rifle
- **Sub type key**: `br`
- **Base stats**: dmg: 30, fireRate: 900 ms, bulletSize: 5, speed: 1150, burst: 3
- **Special**: `burst: 3` — fires a 3-round burst per trigger pull
- **Chassis**: Medium only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy
- **Drop sources**: Regular enemies (Medium run), elites, commanders, bosses (regular drops)

---

#### SR — Sniper Rifle
- **Sub type key**: `sr`
- **Base stats**: dmg: 240, fireRate: 2200 ms, bulletSize: 6, speed: 2200, pierce: true
- **Special**: `pierce: true` — projectile passes through all enemies in line; extreme single-target/line damage
- **Chassis**: Medium only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy
- **Drop sources**: Regular enemies (Medium run), elites, commanders, bosses (regular drops)

---

#### RAIL — Railgun
- **Sub type key**: `rail`
- **Base stats**: dmg: 450, fireRate: 4500 ms, bulletSize: 5, speed: 3000, pierce: true, charge: true
- **Special**: `pierce: true`, `charge: true` — long charge-up before firing, passes through all enemies in line, highest single-shot damage in the game. Not used by enemies.
- **Chassis**: Medium only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy
- **Drop sources**: Regular enemies (Medium run), elites, commanders, bosses (regular drops)

---

### Heavy Chassis Weapons

Heavy chassis can equip: `hr`, `rl`, `plsm`, `gl`

---

#### HR — Heavy Rifle
- **Sub type key**: `hr`
- **Base stats**: dmg: 160, fireRate: 1600 ms, bulletSize: 12, speed: 1100, armorBuster: true, shieldPierce: true
- **Special**: `armorBuster: true`, `shieldPierce: true` — ignores shield absorb entirely (shield HP depleted but absorb % not applied). Hard counter to shielded enemies.
- **Chassis**: Heavy only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy
- **Drop sources**: Regular enemies (Heavy run), elites, commanders, bosses (regular drops)

---

#### RL — Rocket Launcher
- **Sub type key**: `rl`
- **Base stats**: dmg: 250, fireRate: 3200 ms, bulletSize: 12, speed: 820, explosive: true, selfDamage: true, radius: 120
- **Special**: `explosive: true`, `selfDamage: true`, `radius: 120` — large AoE explosion on impact; player can take self-damage from the blast radius
- **Chassis**: Heavy only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy, **splashRadius** (+10–45% blast radius)
- **Drop sources**: Regular enemies (Heavy run), elites, commanders, bosses (regular drops)

---

#### PLSM — Plasma Cannon
- **Sub type key**: `plsm`
- **Base stats**: dmg: 300, fireRate: 3200 ms, size: 32
- **Special**: Channeled growing orb projectile — continuous-fire, projectile grows over time
- **Chassis**: Heavy only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy, **splashRadius** (+10–45% blast radius)
- **Drop sources**: Regular enemies (Heavy run), elites, commanders, bosses (regular drops)

---

#### GL — Grenade Launcher
- **Sub type key**: `gl`
- **Base stats**: dmg: 220, fireRate: 2800 ms, explosive: true, armDist: 80
- **Special**: `explosive: true`, `armDist: 80` — grenade must travel 80 px before arming; big AoE on detonation
- **Chassis**: Heavy only
- **Affix pool**: dmgFlat, dmgPct, critChance, critDmg, fireRatePct, accuracy, **splashRadius** (+10–45% blast radius)
- **Drop sources**: Regular enemies (Heavy run), elites, commanders, bosses (regular drops)

---

### Unique / Boss-Drop Weapons

Unique weapons drop exclusively from boss kills (1 guaranteed unique per boss; 25% Legendary, 75% Epic).
They are generated via `generateUniqueItem()` — **chassis filtering does not apply** at drop time,
but equip restrictions still apply when the player attempts to equip the item.

---

#### Razor Edge *(Legendary — Razor boss, rounds 10/30/50…)*
- **Key**: `razor_edge` | **Rarity**: Legendary | **Base type**: `weapon` | **Sub type**: `smg`
- **Base stats**: dmg: 18, fireRate: 180 ms, speed: 700
- **Fixed affixes**: +15% Damage, +8% Crit Chance, −10% Reload Time
- **Unique effect** (`doubleStrike`): Every 3rd shot fires twice — a duplicate projectile is spawned.
- **Chassis**: SMG is Light chassis only; equip will be rejected for Medium/Heavy
- **Implementation**: `checkDoubleStrike()` — increments `_doubleStrikeCounter`; resets to 0 and returns `true` at count 3

---

#### Mirror Shard *(Legendary — Mirror boss, rounds 30/70/110…)*
- **Key**: `mirror_shard` | **Rarity**: Legendary | **Base type**: `weapon` | **Sub type**: none
- **Base stats**: dmgFlat: 12
- **Fixed affixes**: +12% Damage, +15% Crit Damage, +8% Reload Speed
- **Unique effect** (`mirrorShot`): Bullets should reflect off cover/walls once dealing 60% damage on ricochet.
- **⚠ STUB**: `checkMirrorShot()` always returns `false` — effect is not implemented.
- **Chassis**: No sub type means no built-in chassis restriction at equip time
- **Implementation**: `checkMirrorShot()` always returns `false`

---

#### Titan Fist *(Legendary — Titan boss, rounds 35/75/115…)*
- **Key**: `titan_fist` | **Rarity**: Legendary | **Base type**: `weapon` | **Sub type**: none
- **Base stats**: dmgFlat: 18
- **Fixed affixes**: +15% Damage, +20% Splash Radius, +5% Crit Chance
- **Unique effect** (`titanSmash`): Every 5th shot creates a shockwave dealing 50% of shot damage in a 120 px AoE.
- **Chassis**: No sub type means no built-in chassis restriction at equip time
- **Implementation**: `checkTitanSmash()` / `triggerTitanSmash(scene, x, y, baseDmg)` — counter resets at 5; AoE damage = `Math.round(baseDmg * 0.5)`

---

## Section 2: CPU

CPU items occupy the `cpu` slot (`_equipped.cpu`). There are two categories:

- **Pure stat CPU** (`baseType: 'cpu'`): provides only `modCdPct` / `modEffPct` bonuses; does not activate any gameplay system.
- **CPU system** (`baseType: 'cpu_system'`): equips to `_equipped.cpu` AND sets `loadout.cpu = systemKey`, activating the corresponding CPU ability from `WEAPONS`.

CPU drops have base weight 6 (pure stat) and 7 (cpu_system) in the type selection table.
Commanders boost `cpu_system` weight ×2; bosses boost `cpu_system` weight ×2.

### CPU Affixes

CPU items (`cpu` and `cpu_system`) draw from these affixes (`AFFIX_POOL` entries with `types: ['cpu']`):

| Affix key | Label | Range | Weight |
|---|---|---|---|
| `modCdPct` | −{v}% Mod Cooldown | 3–22 | 6 |
| `modEffPct` | +{v}% Mod Effectiveness | 5–30 | 5 |

> `modCdPct` is an inverted stat — negative values shorten cooldown (beneficial).
> Displayed with a `+` prefix in the UI via `_hoverInvertedStats`.

---

### Pure Stat CPU Items

No chassis restrictions — any chassis can receive these drops.
Equips to `_equipped.cpu`. Does **not** set `loadout.cpu` (no gameplay ability unlocked).

#### Cooldown Chip
- **Sub type key**: `cooldown_chip`
- **Base stats**: modCdPct: −8
- **Chassis**: All (no restriction)
- **Affix pool**: modCdPct, modEffPct
- **Drop sources**: Regular enemies, elites, commanders (boosted), bosses (regular drops)

#### Amplifier
- **Sub type key**: `amplifier`
- **Base stats**: modEffPct: 10
- **Chassis**: All (no restriction)
- **Affix pool**: modCdPct, modEffPct
- **Drop sources**: Regular enemies, elites, commanders (boosted), bosses (regular drops)

#### Overcharge Module
- **Sub type key**: `overcharge`
- **Base stats**: modCdPct: −5, modEffPct: 5
- **Chassis**: All (no restriction)
- **Affix pool**: modCdPct, modEffPct
- **Drop sources**: Regular enemies, elites, commanders (boosted), bosses (regular drops)

---

### CPU System Items

CPU system items set `loadout.cpu = systemKey` on equip, activating the corresponding ability.
Drops are chassis-filtered via `CHASSIS_CPUS` — each chassis only receives its own allowed systems.

**`CHASSIS_CPUS` restrictions:**
- **Light**: `barrier`, `jump`, `decoy`, `ghost_step`
- **Medium**: `barrier`, `atk_drone`, `repair`, `rage`
- **Heavy**: `barrier`, `missile`, `fortress_mode`, `emp`

> `barrier` is the only system available to all three chassis.

---

#### Light Chassis CPU Systems

##### Barrier Module (Light)
- **Sub type key**: `sys_barrier` | **systemKey**: `barrier`
- **Base stats**: shieldHP: 10, dr: 0.02
- **Chassis**: All (barrier is universal, but generates for whichever chassis is running)
- **System gameplay**: Activates a 2-second true invulnerability burst (`trueInvuln: true`). Cooldown: 9 000 ms. No damage can be taken for the full 2 s duration.
- **Affix pool**: modCdPct, modEffPct

##### Jump Jets (Light)
- **Sub type key**: `sys_jump` | **systemKey**: `jump`
- **Base stats**: speedPct: 3
- **Chassis**: Light only
- **System gameplay**: Launches the player in the movement direction (`jumpSpeed: 950`, `airTime: 220 ms`). On landing, deals a slam AoE (`slamDmg: 40`, `slamRadius: 120 px`). Cooldown: 3 500 ms. Heavy chassis cannot equip jump (blocked by `CHASSIS_CPUS` and `CHASSIS.heavy.noJump`).
- **Affix pool**: modCdPct, modEffPct

##### Decoy Projector (Light)
- **Sub type key**: `sys_decoy` | **systemKey**: `decoy`
- **Base stats**: speedPct: 2
- **Chassis**: Light only
- **System gameplay**: Deploys a holographic decoy at the player's position. Enemies redirect fire at the decoy for `decoyDuration: 6 000 ms`. Cooldown: 8 500 ms.
- **Affix pool**: modCdPct, modEffPct

##### Ghost Step (Light)
- **Sub type key**: `sys_ghost_step` | **systemKey**: `ghost_step`
- **Base stats**: speedPct: 3, dodgePct: 2
- **Chassis**: Light only
- **System gameplay**: Activates 1.5 s of full cloak (`cloakTime: 1 500 ms`). Enemies lose targeting while cloaked. Cloak ends immediately if the player fires a weapon. Cooldown: 7 000 ms.
- **Affix pool**: modCdPct, modEffPct

---

#### Medium Chassis CPU Systems

##### Barrier Module (Medium)
- *(Same system as Light. See Barrier Module above.)*
- **Sub type key**: `sys_barrier` | **systemKey**: `barrier`
- **Base stats**: shieldHP: 10, dr: 0.02
- **Chassis**: Medium (generates for Medium run)
- **System gameplay**: 2-second true invulnerability. Cooldown: 9 000 ms.
- **Affix pool**: modCdPct, modEffPct

##### Attack Drone (Medium)
- **Sub type key**: `sys_atk_drone` | **systemKey**: `atk_drone`
- **Base stats**: dmgPct: 2
- **Chassis**: Medium only
- **System gameplay**: Deploys an autonomous turret drone that auto-fires at the nearest enemy (`droneDmg: 24`, `droneReload: 600 ms`, `droneDuration: 8 000 ms`). Cooldown: 12 000 ms.
- **Affix pool**: modCdPct, modEffPct

##### Repair Drone (Medium)
- **Sub type key**: `sys_repair` | **systemKey**: `repair`
- **Base stats**: autoRepair: 1
- **Chassis**: Medium only
- **System gameplay**: Heals the most-damaged limb in 5 ticks (`healAmount: 40` total, `healTicks: 5`, `tickDelay: 500 ms`). Cooldown: 12 000 ms.
- **Affix pool**: modCdPct, modEffPct

##### Rage Inducer (Medium)
- **Sub type key**: `sys_rage` | **systemKey**: `rage`
- **Base stats**: dmgPct: 4
- **Chassis**: Medium only
- **System gameplay**: On activation, grants 500 ms invincibility frames (`invincFrames: 500`), then boosts damage for `rageTime: 3 500 ms`. Cooldown: 10 500 ms.
- **Affix pool**: modCdPct, modEffPct

---

#### Heavy Chassis CPU Systems

##### Barrier Module (Heavy)
- *(Same system as Light/Medium. See Barrier Module above.)*
- **Sub type key**: `sys_barrier` | **systemKey**: `barrier`
- **Base stats**: shieldHP: 10, dr: 0.02
- **Chassis**: Heavy (generates for Heavy run)
- **System gameplay**: 2-second true invulnerability. Cooldown: 9 000 ms.
- **Affix pool**: modCdPct, modEffPct

##### Missile Pod (Heavy)
- **Sub type key**: `sys_missile` | **systemKey**: `missile`
- **Base stats**: dmgPct: 3
- **Chassis**: Heavy only
- **System gameplay**: Fires 6 homing micro-missiles distributed across up to 3 nearest enemies (`missileDmg: 55` each, `missileCount: 6`). Cooldown: 11 000 ms.
- **Affix pool**: modCdPct, modEffPct

##### Fortress Mode (Heavy)
- **Sub type key**: `sys_fortress_mode` | **systemKey**: `fortress_mode`
- **Base stats**: dr: 0.03, coreHP: 15
- **Chassis**: Heavy only
- **System gameplay**: Activates for `modeTime: 4 000 ms`, granting +30% DR and 5 HP/s core regeneration during the window. Player becomes immovable ("fortress"). Cooldown: 14 000 ms.
- **Affix pool**: modCdPct, modEffPct

##### EMP Burst (Heavy)
- **Sub type key**: `sys_emp` | **systemKey**: `emp`
- **Base stats**: modCdPct: −5
- **Chassis**: Heavy only
- **System gameplay**: Releases an expanding EMP pulse (`radius: 570`, `empSpeed: 380`) that stuns all enemies in range for `stunTime: 2 400 ms`. Cooldown: 9 000 ms.
- **Affix pool**: modCdPct, modEffPct

---

### Unique CPU Items

#### Blueprint Core *(Legendary — Architect boss, rounds 15/35/55…)*
- **Key**: `blueprint_core` | **Rarity**: Legendary | **Base type**: `cpu`
- **Base stats**: modCdPct: −12, modEffPct: 15
- **Fixed affixes**: −10% Mod Cooldown, +15% Mod Effectiveness
- **Unique effect** (`modCover`): Each CPU activation spawns a temporary destructible cover wall (60×16 px, 40 HP, 8 s duration) at the player's position.
- **Chassis**: All (baseType `cpu`, no chassis restriction)
- **Implementation**: `spawnModCover(scene)` — creates a physics-enabled wall rectangle, adds to `coverObjects`

#### Core Reactor *(Legendary — Core boss, rounds 40/80/120…)*
- **Key**: `core_reactor` | **Rarity**: Legendary | **Base type**: `cpu`
- **Base stats**: modCdPct: +12, modEffPct: 10 *(note: positive modCdPct = longer base cooldown on this item)*
- **Fixed affixes**: +10% Mod Cooldown, +12% Mod Effectiveness, +5% Damage
- **Unique effect** (`coreOverload`): Each CPU activation releases a 200 px energy pulse dealing 80 damage to all enemies within range.
- **Chassis**: All (baseType `cpu`, no chassis restriction)
- **Implementation**: `triggerCoreOverload(scene)` — creates expanding ring graphic, calls `damageEnemy()` for all enemies within 200 px

#### Architect's Array *(Epic — Architect boss, rounds 15/35/55…)*
- **Key**: `architects_array` | **Rarity**: Epic | **Base type**: `augment`
- **Base stats**: modEffPct: 20
- **Fixed affixes**: −8% Mod Cooldown, +25% Mod Effectiveness
- **Unique effect** (`modAmplify`): All CPU activation durations and effects extended by 50%.
- **Chassis**: All (baseType `augment`, no chassis restriction)
- **Implementation**: Effect key registered in `_gearState._uniqueEffects`; proc logic wired in `index.html`

---

## Section 3: Shield

Shield items occupy the `shield` slot (`_equipped.shield`). There are two categories:

- **Pure stat shield** (`baseType: 'shield'`): provides only `shieldHP`, `shieldRegen`, `absorbPct` bonuses; does not activate any shield system.
- **Shield system** (`baseType: 'shield_system'`): equips to `_equipped.shield` AND sets `loadout.shld = systemKey`, activating the corresponding shield from `SHIELD_SYSTEMS`.

Shield drops: base weight 6 (pure stat) and 8 (shield_system).
Medics boost both `shield_system` ×2 and `shield` ×2; elites boost `shield_system` ×1.5; bosses boost `shield_system` ×2.

### Shield Affixes

All shield items (`shield` and `shield_system`) draw from these affixes (`AFFIX_POOL` entries with `types: ['shield']`):

| Affix key | Label | Range | Weight |
|---|---|---|---|
| `shieldHP` | +{v} Shield Capacity | 5–50 | 7 |
| `shieldRegen` | +{v}% Shield Regen | 5–35 | 6 |
| `absorbPct` | +{v}% Shield Absorb | 2–10 | 4 |

> System items (`shield_system`) are remapped to `'shield'` for affix rolling, so they draw from the same pool.

---

### Pure Stat Shield Items

No chassis restrictions — any chassis can receive and equip these.
Equips to `_equipped.shield`. Does **not** set `loadout.shld` (no shield system activated).

#### Barrier Core
- **Sub type key**: `barrier_core`
- **Base stats**: shieldHP: 15, shieldRegen: 5
- **Chassis**: All (no restriction)
- **Affix pool**: shieldHP, shieldRegen, absorbPct
- **Drop sources**: Regular enemies, medics (boosted), elites, commanders, bosses (regular drops)

#### Regen Cell
- **Sub type key**: `regen_cell`
- **Base stats**: shieldHP: 5, shieldRegen: 15
- **Chassis**: All (no restriction)
- **Affix pool**: shieldHP, shieldRegen, absorbPct
- **Drop sources**: Regular enemies, medics (boosted), elites, commanders, bosses (regular drops)

#### Absorb Matrix
- **Sub type key**: `absorb_matrix`
- **Base stats**: shieldHP: 25, absorbPct: 5
- **Chassis**: All (no restriction)
- **Affix pool**: shieldHP, shieldRegen, absorbPct
- **Drop sources**: Regular enemies, medics (boosted), elites, commanders, bosses (regular drops)

---

### Shield System Items

Shield system items set `loadout.shld = systemKey` on equip, activating the shield.
Drops are chassis-filtered via `CHASSIS_SHIELDS`. 5 shields are universal (all chassis); each chassis also has its own exclusive shields.

**`CHASSIS_SHIELDS` with loot-droppable entries:**
- **All chassis**: `light_shield`, `standard_shield`, `heavy_shield`, `reactive_shield`, `fortress_shield`
- **Light only**: `micro_shield`, `flicker_shield`, `phase_shield`
- **Medium only**: `adaptive_shield`, `counter_shield`
- **Heavy only**: `bulwark_shield`, `titan_shield`

**Hangar-only shields** (in `CHASSIS_SHIELDS` but no `ITEM_BASES` entry — cannot drop as loot):
- **Light**: `smoke_burst`, `mirror_shield`
- **Medium**: `pulse_shield`, `layered_shield`, `overcharge_shld`
- **Heavy**: `siege_wall`, `thermal_shield`

---

#### Universal Shield Systems (All Chassis)

##### Light Shield
- **Sub type key**: `sys_light_shield` | **systemKey**: `light_shield`
- **Base stats**: shieldHP: 10, shieldRegen: 3
- **Chassis**: All
- **Shield gameplay**: maxShield: 60, regenRate: 6.0/s, regenDelay: 1 s, absorb: 50%. Extremely fast regen — cycles in ~1 s. Designed to be burned constantly with no significant downtime if the player stays mobile.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

##### Standard Shield
- **Sub type key**: `sys_standard_shield` | **systemKey**: `standard_shield`
- **Base stats**: shieldHP: 15, shieldRegen: 2
- **Chassis**: All
- **Shield gameplay**: maxShield: 100, regenRate: 1.2/s, regenDelay: 4 s, absorb: 50%. Reliable balanced baseline — no gimmick, nothing lacking.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

##### Heavy Shield
- **Sub type key**: `sys_heavy_shield` | **systemKey**: `heavy_shield`
- **Base stats**: shieldHP: 20, dr: 0.02
- **Chassis**: All
- **Shield gameplay**: maxShield: 100, regenRate: 0.6/s, regenDelay: 7 s, absorb: 70%. Same HP as Standard but absorbs 70% of each hit (vs. 50%). Very slow regen — protect the shield from breaking.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

##### Reactive Shield
- **Sub type key**: `sys_reactive_shield` | **systemKey**: `reactive_shield`
- **Base stats**: shieldHP: 12, shieldRegen: 5
- **Chassis**: All
- **Shield gameplay**: maxShield: 80, regenRate: 4.0/s, regenDelay: 2 s, absorb: 50%, `breakInvuln: 0.3 s`. On shield break, player gains 0.3 s invulnerability. Designed around a break-and-recover rhythm.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

##### Fortress Shield
- **Sub type key**: `sys_fortress_shield` | **systemKey**: `fortress_shield`
- **Base stats**: shieldHP: 30, dr: 0.03
- **Chassis**: All
- **Shield gameplay**: maxShield: 240, regenRate: 0.4/s, regenDelay: 9 s, absorb: 25%. Enormous HP but only 25% absorb — most damage bleeds through to core HP. Acts as a speed bump rather than a wall.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

---

#### Light-Only Shield Systems

##### Micro Shield
- **Sub type key**: `sys_micro_shield` | **systemKey**: `micro_shield`
- **Base stats**: shieldRegen: 8, speedPct: 2
- **Chassis**: Light only
- **Shield gameplay**: maxShield: 30, regenRate: 10.0/s, regenDelay: 1 s, absorb: 50%. Paper-thin HP with near-instant regen — almost permanently cycling. Best paired with high mobility.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

##### Flicker Shield
- **Sub type key**: `sys_flicker_shield` | **systemKey**: `flicker_shield`
- **Base stats**: shieldHP: 10, dodgePct: 3
- **Chassis**: Light only
- **Shield gameplay**: maxShield: 80, regenRate: 0/s (no regen), absorb: 50%, `flickerBlock: true`. Alternates active/inactive with each hit — blocks every second incoming hit entirely. No regen needed; the mechanic is the protection.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

##### Phase Shield
- **Sub type key**: `sys_phase_shield` | **systemKey**: `phase_shield`
- **Base stats**: shieldHP: 10, speedPct: 2
- **Chassis**: Light only
- **Shield gameplay**: maxShield: 70, regenRate: 1.5/s, regenDelay: 3 s, absorb: 50%, `phaseInvuln: 0.25 s`. Each incoming shield hit triggers 0.25 s invulnerability. Provides consistent per-hit mitigation regardless of damage amount.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

---

#### Medium-Only Shield Systems

##### Adaptive Shield
- **Sub type key**: `sys_adaptive_shield` | **systemKey**: `adaptive_shield`
- **Base stats**: shieldHP: 15, dr: 0.02
- **Chassis**: Medium only
- **Shield gameplay**: maxShield: 90, regenRate: 1.0/s, regenDelay: 5 s, absorb starts at 50%, `adaptiveMax: 80%`. Each consecutive hit increases absorb by 10% (up to 80%). Rewards staying in sustained fights rather than retreating.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

##### Counter Shield
- **Sub type key**: `sys_counter_shield` | **systemKey**: `counter_shield`
- **Base stats**: shieldHP: 12, dmgPct: 2
- **Chassis**: Medium only
- **Shield gameplay**: maxShield: 90, regenRate: 1.1/s, regenDelay: 4 s, absorb: 50%, `counterCharge: 40`. Every 40 points of shield damage charges a counter-strike. Discharging (on CPU activation): 80 AoE damage to nearby enemies.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

---

#### Heavy-Only Shield Systems

##### Bulwark Shield
- **Sub type key**: `sys_bulwark_shield` | **systemKey**: `bulwark_shield`
- **Base stats**: shieldHP: 25, dr: 0.04
- **Chassis**: Heavy only
- **Shield gameplay**: maxShield: 140, regenRate: 0.5/s, regenDelay: 7 s, absorb: 50%, `passiveDR: 0.12`. Passive 12% DR is **always active** — even when the shield is fully broken. The DR does not disappear on shield break.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

##### Titan Shield
- **Sub type key**: `sys_titan_shield` | **systemKey**: `titan_shield`
- **Base stats**: shieldHP: 30, dr: 0.05
- **Chassis**: Heavy only
- **Shield gameplay**: maxShield: 200, regenRate: 0.3/s, regenDelay: 9 s, absorb: 60%, `coreBonus: 20`. Provides +20 bonus core HP while equipped (in addition to shield stats). Extremely slow regen — pure staying power.
- **Affix pool**: shieldHP, shieldRegen, absorbPct

---

### Unique Shield Items

#### Warden's Aegis *(Legendary — Warden boss, rounds 5/25/45…)*
- **Key**: `wardens_aegis` | **Rarity**: Legendary | **Base type**: `shield`
- **Base stats**: shieldHP: 45, shieldRegen: 12, absorbPct: 10
- **Fixed affixes**: +25 Shield Capacity, +5% Damage Reduction
- **Unique effect** (`frontalAbsorb`): While shield is active, frontal hits (within ±60° of torso facing) take 40% reduced damage.
- **Chassis**: All (baseType `shield`, no chassis restriction)
- **Implementation**: `applyFrontalAbsorb(amt, bulletAngle)` — checks angle diff using `Phaser.Math.Angle.Wrap`

#### Matrix Shield *(Epic — Core boss, rounds 40/80/120…)*
- **Key**: `matrix_shield` | **Rarity**: Epic | **Base type**: `shield`
- **Base stats**: shieldHP: 50, shieldRegen: 3
- **Fixed affixes**: +30 Shield HP, +5% Shield Absorb
- **Unique effect** (`matrixBarrier`): When shield breaks, gain 3-second full invulnerability. 60-second cooldown between triggers.
- **Chassis**: All (baseType `shield`, no chassis restriction)
- **Implementation**: `triggerMatrixBarrier(scene, time)` — sets `_matrixBarrierActive = true` for 3 s; `_matrixBarrierCooldown = time + 60 000`. `isMatrixBarrierActive()` checked before processing player damage.

---

## Section 4: Armor

Armor items occupy the `armor` slot (`_equipped.armor`). There is only one category: **pure stat armor** (`baseType: 'armor'`). There are no armor system items (no systemKey, no gameplay ability activated on equip).

Armor drops have base weight **10** in the type selection table (out of ~100 total weight).
Medics boost armor weight ×2 (to 20); no other enemy type has a specific armor bias.

**No chassis restrictions** — armor generation in `_selectBaseItem()` applies no chassis filtering. Any chassis can receive and equip any armor sub type.

### Armor Affixes

All armor items draw from the following affix pool (`AFFIX_POOL` entries with `types` including `'armor'`):

| Affix key | Label | Range | Weight |
|---|---|---|---|
| `coreHP` | +{v} Core HP | 10–100 | 8 |
| `allHP` | +{v} All Part HP | 5–30 | 4 |
| `dr` | +{v}% Damage Reduction | 1–12 | 5 |
| `autoRepair` | +{v} HP/sec Regen | 1–6 | 4 |

> `allHP` also appears on `augment` type items — it raises every part's HP simultaneously (core, arms, legs).
> `dr` also appears on `legs` items — rolling it on armor is independent from rolling it on legs.
> `autoRepair` also appears on `augment` items.

---

### Armor Sub Types

#### Light Plating
- **Display name**: Light Plating
- **Sub type key**: `light_plate`
- **Base stats**: coreHP: 20, dr: 0.02
- **Chassis**: All (no restriction)
- **Affix pool**: coreHP, allHP, dr, autoRepair
- **Drop sources**: Regular enemies, medics (boosted ×2), elites, commanders, bosses (regular drops)

---

#### Medium Plating
- **Display name**: Medium Plating
- **Sub type key**: `medium_plate`
- **Base stats**: coreHP: 40, dr: 0.05
- **Chassis**: All (no restriction)
- **Affix pool**: coreHP, allHP, dr, autoRepair
- **Drop sources**: Regular enemies, medics (boosted ×2), elites, commanders, bosses (regular drops)

---

#### Heavy Plating
- **Display name**: Heavy Plating
- **Sub type key**: `heavy_plate`
- **Base stats**: coreHP: 60, dr: 0.08
- **Chassis**: All (no restriction)
- **Affix pool**: coreHP, allHP, dr, autoRepair
- **Drop sources**: Regular enemies, medics (boosted ×2), elites, commanders, bosses (regular drops)

---

#### Reactive Plating
- **Display name**: Reactive Plating
- **Sub type key**: `reactive_plate`
- **Base stats**: coreHP: 30, dr: 0.04
- **Chassis**: All (no restriction)
- **Affix pool**: coreHP, allHP, dr, autoRepair
- **Drop sources**: Regular enemies, medics (boosted ×2), elites, commanders, bosses (regular drops)

---

### Unique / Boss-Drop Armor Items

Unique armor items drop exclusively from boss kills (25% Legendary, 75% Epic chance per drop).
All three unique armor items are Epic rarity. None have a Legendary counterpart.
Chassis filtering does **not** apply at drop time; equip is unrestricted (baseType `armor`).

---

#### Sentinel's Plating *(Epic — Warden boss, rounds 5/25/45…)*
- **Key**: `sentinels_plating` | **Rarity**: Epic | **Base type**: `armor`
- **Base stats**: coreHP: 55, dr: 0.06
- **Fixed affixes**: +30 Core HP, +4% Damage Reduction
- **Unique effect** (`shieldDR`): While shield is at maximum capacity, gain an additional +12% damage reduction.
- **Chassis**: All (baseType `armor`, no chassis restriction)
- **Implementation**: Effect key registered in `_gearState._uniqueEffects`; `shieldDR` is checked in damage processing when `_equipped.shield` is at full HP

---

#### Unstoppable Core *(Epic — Juggernaut boss, rounds 20/40/60…)*
- **Key**: `unstoppable_core` | **Rarity**: Epic | **Base type**: `armor`
- **Base stats**: coreHP: 70, dr: 0.05
- **Fixed affixes**: +15 All Part HP, +6% Damage Reduction
- **Unique effect** (`impactArmor`): When hit for more than 25 damage in a single hit, gain +15% bonus DR for 3 seconds.
- **Chassis**: All (baseType `armor`, no chassis restriction)
- **Implementation**: Effect key registered in `_gearState._uniqueEffects`; hit-magnitude check triggers a timed DR boost

---

#### Swarm Carapace *(Epic — Swarm boss, rounds 25/65/105…)*
- **Key**: `swarm_carapace` | **Rarity**: Epic | **Base type**: `armor`
- **Base stats**: coreHP: 60, dr: 0.04
- **Fixed affixes**: +20 All Part HP, +5% Damage Reduction
- **Unique effect** (`adaptiveArmor`): Successive hits from the same enemy deal 10% less damage per hit, stacking up to a 40% reduction.
- **Chassis**: All (baseType `armor`, no chassis restriction)
- **Implementation**: Effect key registered in `_gearState._uniqueEffects`; per-enemy hit counter tracked; resets when a different enemy deals damage

---

## Section 5: Arms

Arms items occupy the `arms` slot (`_equipped.arms`). There is only one category: **pure stat arms reinforcement** (`baseType: 'arms'`). There are no arms system items (no systemKey, no gameplay ability activated on equip).

Arms drops have base weight **8** in the type selection table (out of ~100 total weight). No enemy type applies a specific multiplier to the arms weight — commanders, medics, elites, and bosses all leave it at 8.

**No chassis restrictions** — arms generation in `_selectBaseItem()` applies no chassis filtering. Any chassis (Light, Medium, Heavy) can receive and equip any arms sub type.

> **Note on `reloadPct`**: This stat does not appear in any arms base item or arms-eligible affix. The `fireRatePct` affix (positive values) increases fire rate; reload speed is handled separately via perks and unique effects (e.g. `dualReload` on Twinned Servo).

---

### Arms Affixes

All arms items draw from the following affix pool (`AFFIX_POOL` entries with `types` including `'arms'`):

| Affix key | Label | Range | Weight | Notes |
|---|---|---|---|---|
| `dmgPct` | +{v}% Damage | 3–28 | 8 | Also on `weapon`, `augment` |
| `fireRatePct` | +{v}% Fire Rate | 3–22 | 8 | Also on `weapon`. Label uses `+` prefix; lower values are better in one context (see base stat notes below) |
| `accuracy` | +{v}% Accuracy | 3–15 | 5 | Also on `weapon` |
| `armHP` | +{v} Arm HP | 5–50 | 6 | Arms-only |

> `reloadPct` is **not** in the affix pool for arms. The only arms-eligible affixes are the four listed above.

---

### Arms Sub Types

#### Servo Enhancer
- **Display name**: Servo Enhancer
- **Sub type key**: `servo_enhancer`
- **Base stats**: armHP: 15, fireRatePct: −5
  - `fireRatePct: -5` is a **negative base value** (fire rate cost) — it trades a small fire-rate penalty for structural arm HP. Affixes that roll `fireRatePct` on this item add on top of the −5 base, and can partially or fully offset it.
- **Chassis**: All (no restriction)
- **Affix pool**: dmgPct, fireRatePct, accuracy, armHP
- **Drop sources**: Regular enemies, elites, commanders, bosses (regular drops)

---

#### Stabilizer
- **Display name**: Stabilizer
- **Sub type key**: `stabilizer`
- **Base stats**: armHP: 20, accuracy: 5
  - Pure defensive/accuracy profile — highest base armHP of the three sub types, with a flat accuracy bonus and no fire-rate cost.
- **Chassis**: All (no restriction)
- **Affix pool**: dmgPct, fireRatePct, accuracy, armHP
- **Drop sources**: Regular enemies, elites, commanders, bosses (regular drops)

---

#### Power Coupler
- **Display name**: Power Coupler
- **Sub type key**: `power_coupler`
- **Base stats**: armHP: 10, dmgPct: 3
  - Offensive profile — lowest base armHP, compensated by a flat damage percentage bonus. Best pairing for builds that prioritize damage output over arm durability.
- **Chassis**: All (no restriction)
- **Affix pool**: dmgPct, fireRatePct, accuracy, armHP
- **Drop sources**: Regular enemies, elites, commanders, bosses (regular drops)

---

### Unique / Boss-Drop Arms Items

Unique arms items drop exclusively from boss kills (25% Legendary, 75% Epic chance per drop).
Both unique arms items are **Epic** rarity. Neither boss has a Legendary arms counterpart — the Legendary slot for both bosses is occupied by a different base type.
Chassis filtering does **not** apply at drop time; equip is unrestricted (baseType `arms`).

---

#### Twinned Servo *(Epic — Twin Razors boss, rounds 10/30/50…)*
- **Key**: `twinned_servo` | **Rarity**: Epic | **Base type**: `arms`
- **Base stats**: armHP: 25, fireRatePct: −8
- **Fixed affixes**: +12% Fire Rate, +5% Damage
- **Computed total** (base + affixes, pre-scaling): armHP: 25, fireRatePct: +4 (−8 base + 12 affix), dmgPct: 5
- **Unique effect** (`dualReload`): **SYNC SERVOS** — When both arm slots (L and R) have weapons equipped, reload speed is boosted by 30%.
- **Chassis**: All (baseType `arms`, no chassis restriction)
- **Implementation**: `dualReload` effect key registered in `_gearState._uniqueEffects`; checked in reload logic when `_equipped.L` and `_equipped.R` are both non-null weapons. Effect applies once regardless of which arm is reloading.
- **Boss context**: Twin Razors (Razor) is a Light-chassis boss encountered at rounds 10, 30, 50, and every 20 rounds thereafter. Drop is 75% chance on boss kill (Epic tier).

---

#### Echo Frame *(Epic — The Mirror boss, rounds 30/70/110…)*
- **Key**: `echo_frame` | **Rarity**: Epic | **Base type**: `arms`
- **Base stats**: armHP: 35, fireRatePct: 5
- **Fixed affixes**: +8% Fire Rate, +6% Accuracy
- **Computed total** (base + affixes, pre-scaling): armHP: 35, fireRatePct: 13, accuracy: 6
- **Unique effect** (`echoStrike`): **ECHO** — When you activate your equipped mod (CPU slot), a ghost projectile mimicking your last fired weapon shot is automatically released from the player's current position.
- **Chassis**: All (baseType `arms`, no chassis restriction)
- **Implementation**: `echoStrike` effect key registered in `_gearState._uniqueEffects`; mod-activation hook in `mods.js` checks for this key and calls the echo-shot spawner. The phantom projectile uses the last weapon's `dmg`, `speed`, and `pierce` values but does not trigger on-hit effects (crits, splash, unique weapon procs).
- **Boss context**: The Mirror is encountered at rounds 30, 70, 110, and every 40 rounds thereafter. Drop is 75% chance on boss kill (Epic tier).

---

## Section 6: Legs

Legs items occupy the `legs` slot (`_equipped.legs`). There are two categories:

- **Pure stat legs** (`baseType: 'legs'`): provides only `legHP`, `speedPct`, `dodgePct`, and/or `dr` bonuses; does not activate any leg system.
- **Leg system** (`baseType: 'leg_system'`): equips to `_equipped.legs` AND sets `loadout.leg = systemKey`, activating the corresponding passive from `LEG_SYSTEMS`.

Legs drops: base weight **6** (pure stat) and **7** (leg_system) in the type selection table.
Elites boost `leg_system` weight ×2 (to 14) — elites are the primary source of leg system drops.
No other enemy type has a specific bias toward legs or leg_system.

**Slot notes**: The leg slot key in `loadout` is `leg`; in `_equipped` it is `legs`. When legs are
destroyed in combat, the active leg system is disabled for the remainder of the round.

### Legs Affixes

All legs items (`legs` and `leg_system`) draw from these affixes (`AFFIX_POOL` entries with `types`
including `'legs'`). `leg_system` items are remapped to `'legs'` for affix rolling via `_affixTypeMap`
in `loot-system.js`, so both categories draw from the same pool.

| Affix key | Label | Range | Weight |
|---|---|---|---|
| `legHP` | +{v} Leg HP | 5–50 | 6 |
| `dr` | +{v}% Damage Reduction | 1–12 | 5 |
| `dodgePct` | +{v}% Dodge Chance | 1–10 | 4 |
| `speedPct` | +{v}% Move Speed | 2–14 | 6 |

> No offensive affixes (`dmgPct`, `critChance`, etc.) appear in the legs pool. Some leg system
> base items carry `dmgPct` as a **base stat** (e.g. `sys_mine_layer`), but that value comes from
> the `ITEM_BASES` entry, not from affix rolls — affixes on that item can only add `legHP`, `dr`,
> `dodgePct`, or `speedPct`.

---

### Part A — Pure Stat Legs

No chassis restrictions — any chassis can receive and equip these.
Equips to `_equipped.legs`. Does **not** set `loadout.leg` (no leg system activated).
Drop weight: **6** with no enemy-type multipliers.

---

#### Actuator
- **Display name**: Actuator
- **Sub type key**: `actuator`
- **Base stats**: legHP: 20, speedPct: 3
- **Chassis**: All (no restriction)
- **Affix pool**: legHP, dr, dodgePct, speedPct
- **Drop sources**: Regular enemies, elites, commanders, bosses (regular drops)

---

#### Booster
- **Display name**: Booster
- **Sub type key**: `booster`
- **Base stats**: legHP: 15, speedPct: 6, dodgePct: 2
  - Balanced mobility profile — mid-tier leg HP with the highest combined speed + dodge of the three pure stat legs.
- **Chassis**: All (no restriction)
- **Affix pool**: legHP, dr, dodgePct, speedPct
- **Drop sources**: Regular enemies, elites, commanders, bosses (regular drops)

---

#### Dampener
- **Display name**: Dampener
- **Sub type key**: `dampener`
- **Base stats**: legHP: 30, speedPct: −2, dr: 0.03
  - `speedPct: -2` is a negative base value — trades a small movement penalty for the highest base leg HP and a passive damage reduction bonus. Affixes that roll `speedPct` add on top of the −2 base and can partially or fully offset it.
- **Chassis**: All (no restriction)
- **Affix pool**: legHP, dr, dodgePct, speedPct
- **Drop sources**: Regular enemies, elites, commanders, bosses (regular drops)

---

### Part B — Leg Systems

Leg system items set `loadout.leg = systemKey` on equip, activating the corresponding passive from
`LEG_SYSTEMS`. Drops are chassis-filtered via `CHASSIS_LEGS` — each chassis only receives its own
allowed systems. Drop weight: **7** baseline; **14** from elites (×2 multiplier).

**`CHASSIS_LEGS` restrictions (droppable systems only):**
- **Light only**: `hydraulic_boost`, `sprint_boosters`, `featherweight`
- **Light + Medium**: `gyro_stabilizer`
- **Medium only**: `adaptive_stride`
- **Medium + Heavy**: `mag_anchors`, `mine_layer`
- **Heavy only**: `tremor_legs`, `siege_stance`, `ironclad_legs`

**Hangar-only leg systems** (in `CHASSIS_LEGS` but no `ITEM_BASES` entry — cannot drop as loot):
- **Light**: `ghost_legs`, `silent_step`, `reactive_dash`
- **Medium**: `stabilizer_gyros`, `seismic_dampener`, `reactor_legs`, `power_stride`, `evasion_coils`
- **Heavy**: `suppressor_legs`, `warlord_stride`

**LEG_SYSTEMS entries absent from all `CHASSIS_LEGS` sets** (defined but unreachable via normal gameplay):
- `afterleg`, `jump_jets`, `ground_slam` — appear in `LEG_SYSTEMS` but are in no chassis set; cannot be selected in the hangar or dropped as loot.

---

#### Light-Only Leg Systems

##### Hydraulic Boost
- **Sub type key**: `sys_hydraulic_boost` | **systemKey**: `hydraulic_boost`
- **Base stats**: speedPct: 5, legHP: 10
- **Chassis**: Light only
- **System gameplay**: Passive +20% move speed. While this system is active, legs take 15% less damage from all sources.
- **Affix pool**: legHP, dr, dodgePct, speedPct

---

##### Sprint Boosters
- **Sub type key**: `sys_sprint_boosters` | **systemKey**: `sprint_boosters`
- **Base stats**: speedPct: 8, dodgePct: 2
- **Chassis**: Light only
- **System gameplay**: Double-tap the move-forward key for a 0.8 s speed burst (+80% speed). 4 s cooldown between bursts. Highest base `speedPct` of all droppable leg systems.
- **Affix pool**: legHP, dr, dodgePct, speedPct

---

##### Featherweight
- **Sub type key**: `sys_featherweight` | **systemKey**: `featherweight`
- **Base stats**: speedPct: 6, dodgePct: 3
- **Chassis**: Light only
- **System gameplay**: Passive +15% reload speed and passive +10% move speed. All-mobile optimization — faster movement and faster weapon cycling simultaneously. Highest base `dodgePct` of all droppable leg systems.
- **Affix pool**: legHP, dr, dodgePct, speedPct

---

#### Light + Medium Leg Systems

##### Gyro Stabilizer
- **Sub type key**: `sys_gyro_stabilizer` | **systemKey**: `gyro_stabilizer`
- **Base stats**: accuracy: 5, legHP: 10
- **Chassis**: Light and Medium
- **System gameplay**: Eliminates the leg-damage slowdown penalty — damaged or crippled legs no longer reduce movement speed. Additionally provides passive +10% aim accuracy.
- **Affix pool**: legHP, dr, dodgePct, speedPct
  - Note: `accuracy` is a **base stat** on this item; it is not in the `legs` affix pool and cannot appear on affixes rolled for leg items.

---

#### Medium-Only Leg Systems

##### Adaptive Stride
- **Sub type key**: `sys_adaptive_stride` | **systemKey**: `adaptive_stride`
- **Base stats**: speedPct: 4, dodgePct: 2
- **Chassis**: Medium only
- **System gameplay**: Passive directional speed adaptation — automatically grants +15% move speed when retreating (moving away from the nearest enemy). Improves kiting survivability at no activation cost.
- **Affix pool**: legHP, dr, dodgePct, speedPct

---

#### Medium + Heavy Leg Systems

##### Mag Anchors
- **Sub type key**: `sys_mag_anchors` | **systemKey**: `mag_anchors`
- **Base stats**: dr: 0.03, legHP: 15
- **Chassis**: Medium and Heavy
- **System gameplay**: While stationary: take 20% less incoming damage and deal 15% more damage. Rewards positional play and holding angles. Pairs naturally with `siege_stance` (Heavy) to stack the stationary bonuses.
- **Affix pool**: legHP, dr, dodgePct, speedPct

---

##### Mine Layer
- **Sub type key**: `sys_mine_layer` | **systemKey**: `mine_layer`
- **Base stats**: dmgPct: 2, legHP: 10
- **Chassis**: Medium and Heavy
- **System gameplay**: Passive — automatically drops a proximity mine every 8 s while the player is in motion. Each mine detonates on contact with an enemy, dealing 80 AoE damage. No activation required; mines accumulate on the battlefield while moving.
  - Note: `dmgPct: 2` is a base stat on the item; `dmgPct` is not in the legs affix pool and cannot appear as a rolled affix.
- **Affix pool**: legHP, dr, dodgePct, speedPct

---

#### Heavy-Only Leg Systems

##### Tremor Legs
- **Sub type key**: `sys_tremor_legs` | **systemKey**: `tremor_legs`
- **Base stats**: dmgPct: 3, legHP: 20
- **Chassis**: Heavy only
- **System gameplay**: After standing still for 2 s, the next movement creates a ground tremor — 40 AoE damage in a 120 px radius centered on the player. Rewards stop-and-go positioning rhythms.
  - Note: `dmgPct: 3` is a base stat on the item; `dmgPct` is not in the legs affix pool.
- **Affix pool**: legHP, dr, dodgePct, speedPct

---

##### Siege Stance
- **Sub type key**: `sys_siege_stance` | **systemKey**: `siege_stance`
- **Base stats**: dr: 0.04, dmgPct: 3
- **Chassis**: Heavy only
- **System gameplay**: While stationary: +25% damage and +20% DR. The player becomes a near-immovable fortress when planted. Combined with the Heavy chassis passive 15% DR (`CHASSIS.heavy.passiveDR`), a stationary Heavy with Siege Stance can reach very high total DR before affix or shield contributions.
  - Note: `dmgPct: 3` is a base stat on the item; `dmgPct` is not in the legs affix pool.
- **Affix pool**: legHP, dr, dodgePct, speedPct

---

##### Ironclad Legs
- **Sub type key**: `sys_ironclad_legs` | **systemKey**: `ironclad_legs`
- **Base stats**: dr: 0.03, legHP: 25
- **Chassis**: Heavy only
- **System gameplay**: Leg HP +80 (system effect on top of item base stats). Legs take 30% less damage from all sources. Maximizes leg survivability to keep the system active deep into combat. Highest base `legHP` of all droppable leg system items.
- **Affix pool**: legHP, dr, dodgePct, speedPct

---

### Unique / Boss-Drop Leg Items

Unique leg items drop exclusively from boss kills (25% Legendary, 75% Epic chance per drop).
Both unique leg items have `baseType: 'legs'` — they are pure stat items with no `systemKey` and
do not activate a leg system. Chassis filtering does **not** apply at drop time; equip is unrestricted.

---

#### Juggernaut Engine *(Legendary — Juggernaut boss, rounds 20/40/60…)*
- **Key**: `juggernaut_engine` | **Rarity**: Legendary | **Base type**: `legs`
- **Base stats**: legHP: 40, speedPct: 8
- **Fixed affixes**: +12% Move Speed, +5% Dodge Chance, +20 Leg HP
- **Unique effect** (`unstoppable`): Cannot be slowed by any enemy effect. Movement speed bonus is further increased by 20%.
- **Chassis**: All (baseType `legs`, no chassis restriction)
- **Implementation**: `unstoppable` effect key registered in `_gearState._uniqueEffects`; slow-application code checks for this key and bypasses the slow when active

---

#### Colossus Frame *(Epic — The Titan boss, rounds 35/75/115…)*
- **Key**: `colossus_frame` | **Rarity**: Epic | **Base type**: `legs`
- **Base stats**: legHP: 50, speedPct: 3
- **Fixed affixes**: +25 All Part HP, +4% Damage Reduction
- **Unique effect** (`colossusStand`): After remaining stationary for 2 seconds, gain +25% damage and +10% DR until next movement. The buff drops instantly on any movement input.
- **Chassis**: All (baseType `legs`, no chassis restriction)
- **Implementation**: `colossusStand` effect key registered in `_gearState._uniqueEffects`; timer starts when player velocity reaches 0; buff clears on any movement

---

## Section 7: Augment

Augments occupy the `aug` loadout slot (`_equipped.augment` in `_equipped`; `loadout.aug` in `loadout`).
There are two distinct item categories:

- **Pure stat augment** (`baseType: 'augment'`): Provides only passive stat bonuses. Does **not** set `loadout.aug` to an AUGMENTS system key and does not activate any augment system behavior.
- **Augment system** (`baseType: 'aug_system'`): Provides item base stats **and** equips a named augment system — sets `loadout.aug = systemKey`, activating the corresponding `AUGMENTS[systemKey]` passive in-game effect. Chassis-restricted via `CHASSIS_AUGS`.

Drop weights: `augment` = 6, `aug_system` = 6 (same base weight).
Boss kills double `aug_system` weight (×2). Chassis filtering for `aug_system` runs at item-generation time.

---

### Augment Affixes

Both `augment` and `aug_system` items draw from the same affix pool. The loot system maps
`aug_system` → `augment` when selecting rollable affixes (`_affixTypeMap` in `generateItem()`).
No sub-type restrictions apply to any augment affix.

| Affix key | Label | Range | Weight | Notes |
|---|---|---|---|---|
| `dmgPct` | +{v}% Damage | 3–28 | 8 | |
| `critChance` | +{v}% Crit Chance | 2–18 | 7 | |
| `critDmg` | +{v}% Crit Damage | 10–60 | 5 | |
| `allHP` | +{v} All Part HP | 5–30 | 4 | |
| `speedPct` | +{v}% Move Speed | 2–14 | 6 | |
| `lootMult` | +{v}% Loot Quality | 3–18 | 3 | |
| `autoRepair` | +{v} HP/sec Regen | 1–6 | 4 | |

> Note: `fireRatePct` and `modCdPct` are **not** rollable augment affixes (those are `weapon`/`arms`
> and `cpu`-typed respectively). When they appear in an `aug_system`'s `baseStats`, they are fixed
> item base stats baked into the item definition — not rolled affixes.

---

## Part A — Pure Stat Augments (`baseType: 'augment'`)

Pure stat augments are defined in `ITEM_DEFS` in `js/loot-system.js`. They provide passive stat
bonuses from their `baseStats` (scaled by `levelMult` and `rarityDef.statMult`) and from rolled
affixes. They do **not** restrict by chassis — any chassis can equip any pure stat augment.

---

#### Targeting Array
- **Sub type key**: `targeting_array`
- **Base stats**: critChance: 3, accuracy: 5
- **Chassis**: No restriction — all chassis
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair

---

#### Neural Link
- **Sub type key**: `neural_link`
- **Base stats**: lootMult: 5
- **Chassis**: No restriction — all chassis
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair
- **Note**: Purely a loot-quality item. `lootMult` increases drop quality, stacking with rarity and round scaling.

---

#### Combat Matrix
- **Sub type key**: `combat_matrix`
- **Base stats**: dmgPct: 3, speedPct: 2
- **Chassis**: No restriction — all chassis
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair

---

## Part B — Augment Systems (`baseType: 'aug_system'`)

Augment systems are defined in `ITEM_DEFS` in `js/loot-system.js`. Equipping one calls the
loot equip path which sets `loadout.aug = systemKey`, activating the corresponding entry in the
`AUGMENTS` constant from `js/constants.js`. Only 11 of the full AUGMENTS roster have droppable
`aug_system` loot items; the remaining AUGMENTS entries (e.g. `kill_sprint`, `multi_drone`,
`iron_fortress`-warzone entries, etc.) are accessible via the Warzone hangar dropdown only.

Chassis filtering is applied at generation time via `CHASSIS_AUGS` — a player running a Light
chassis will never receive a Medium-only or Heavy-only aug_system drop.

---

### Light Chassis Only

Both Light-only aug_system items synergize with the Light chassis's JUMP mod and dodge identity.

---

#### Ghost Circuit
- **Sub type key**: `sys_ghost_circuit` | **systemKey**: `ghost_circuit`
- **Base stats**: dodgePct: 3, speedPct: 3
- **Chassis**: Light only
- **System gameplay**: After landing from a JUMP, the player becomes invisible to all enemies for 2 seconds. Enemies targeting the player lose lock during the stealth window. Pairs with the JUMP mod for repeated repositioning and ambush plays.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair

---

#### Reflex Amp
- **Sub type key**: `sys_reflex_amp` | **systemKey**: `reflex_amp`
- **Base stats**: fireRatePct: −4, dodgePct: 2
- **Chassis**: Light only
- **System gameplay**: The first shot fired after a JUMP landing or dodge deals +40% bonus damage. The damage window applies to the single next projectile only — burst and multi-pellet weapons consume it on the first pellet/burst.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair
- **Note**: `fireRatePct: −4` in `baseStats` is a fixed item stat (faster fire rate — negative = shorter interval). It is not a rollable affix.

---

### Light and Medium Chassis

These aug_systems drop for both Light and Medium chassis runs.

---

#### Target Painter
- **Sub type key**: `sys_target_painter` | **systemKey**: `target_painter`
- **Base stats**: dmgPct: 3, accuracy: 3
- **Chassis**: Light, Medium
- **System gameplay**: Hitting any enemy marks them. All damage dealt to marked enemies from any source (player weapons, drones, explosions) is increased by +20%. The mark persists until the enemy dies.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair

---

#### Threat Analyzer
- **Sub type key**: `sys_threat_analyzer` | **systemKey**: `threat_analyzer`
- **Base stats**: critChance: 2, accuracy: 3
- **Chassis**: Light, Medium
- **System gameplay**: Dealing damage to an enemy reduces their effective resistances by 15% for 3 seconds. The debuff refreshes on each hit and applies to shield absorption as well as flat damage reduction.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair

---

### Medium Chassis Only

Medium-only aug_systems support the Medium chassis identity of cooldown mastery, drone coordination, and mod-cycle dominance.

---

#### Overclock CPU
- **Sub type key**: `sys_overclock_cpu` | **systemKey**: `overclock_cpu`
- **Base stats**: fireRatePct: −5, modCdPct: −3
- **Chassis**: Medium only
- **System gameplay**: All weapon reload times and all mod cooldowns are reduced by 12%. Stacks multiplicatively with the Medium chassis's native −15% cooldown mastery. The combined reduction makes sustained-fire and fast mod cycling the Medium's primary combat identity.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair
- **Note**: Both `fireRatePct: −5` and `modCdPct: −3` in `baseStats` are fixed item stats (inverted — negative = beneficial). Neither is a rollable affix for augments.

---

#### Combat AI
- **Sub type key**: `sys_combat_ai` | **systemKey**: `combat_ai`
- **Base stats**: critChance: 3, dmgPct: 2
- **Chassis**: Medium only
- **System gameplay**: The active attack drone focuses the player's current target, concentrating drone fire on the same enemy the player is shooting. Without this aug, the drone targets independently. Requires an attack drone CPU (e.g. Drone Commander mod) to have any effect.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair

---

#### Drone Relay
- **Sub type key**: `sys_drone_relay` | **systemKey**: `drone_relay`
- **Base stats**: dmgPct: 2, modCdPct: −3
- **Chassis**: Medium only
- **System gameplay**: The attack drone fires 40% faster and gains +60 bonus HP. The HP bonus survives round transitions until the drone is destroyed. Requires an attack drone CPU to be active.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair
- **Note**: `modCdPct: −3` in `baseStats` is a fixed item stat (inverted — negative = shorter cooldown). Not a rollable affix for augments.

---

### Medium and Heavy Chassis

---

#### Reactive Plating
- **Sub type key**: `sys_reactive_plating` | **systemKey**: `reactive_plating`
- **Base stats**: dr: 0.03, coreHP: 10
- **Chassis**: Medium, Heavy
- **System gameplay**: Each time the player takes damage, a stack of 5% damage reduction is added (maximum 5 stacks = 25% bonus DR). All stacks reset at the end of each round. The Heavy chassis's existing passive 15% DR adds to this, making Reactive Plating especially potent on Heavy.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair

---

### Heavy Chassis Only

Heavy-only aug_systems reinforce the Heavy chassis's attrition, suppression, and close-quarters dominance.

---

#### Scrap Cannon
- **Sub type key**: `sys_scrap_cannon` | **systemKey**: `scrap_cannon`
- **Base stats**: dmgPct: 4
- **Chassis**: Heavy only
- **System gameplay**: When an enemy limb (arm or leg) is destroyed, it explodes for 30 AoE damage to all enemies within the blast radius. Works on both standard enemies and elite/boss limb destruction events. Scales with round level via standard damage multipliers.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair

---

#### War Machine
- **Sub type key**: `sys_war_machine` | **systemKey**: `war_machine`
- **Base stats**: dmgPct: 5, dr: 0.02
- **Chassis**: Heavy only
- **System gameplay**: Grants passive core HP regeneration of 2 HP/sec, but only after 4 consecutive seconds without taking damage. The regen timer resets to zero on any damage hit. Uses the same regen parameters as `CHASSIS.heavy.passiveRegenRate` / `CHASSIS.heavy.passiveRegenDelay`.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair

---

#### Iron Fortress
- **Sub type key**: `sys_iron_fortress` | **systemKey**: `iron_fortress`
- **Base stats**: dr: 0.05, coreHP: 15
- **Chassis**: Heavy only
- **System gameplay**: After standing stationary for 1.5 seconds, the player gains +15% damage reduction and +10% bonus damage. Both bonuses drop instantly when any movement input is detected. Pairs with Siege Stance leg system and Mag Anchors for maximum stationary-fortress builds.
- **Affix pool**: dmgPct, critChance, critDmg, allHP, speedPct, lootMult, autoRepair

---

### Augment Systems Not Available as Loot Drops

The following `AUGMENTS` entries exist in `CHASSIS_AUGS` but have **no corresponding `aug_system`
entry in `ITEM_DEFS`**. They can only be equipped via the Warzone hangar dropdown — they do not
drop in campaign runs.

| systemKey | Chassis | Description |
|---|---|---|
| `ballistic_weave` | Light | +10% bullet speed; bullets ignore 20% of enemy shields |
| `targeting_scope` | Light | SR/RAIL: +15% dmg per 200 px range |
| `neural_accel` | Light | First 3s after JUMP landing: all weapons deal 2× damage |
| `kill_sprint` | Light | Each kill grants +8% move speed for 4s (up to 3 stacks) |
| `predator_lens` | Light | Enemies >400 px highlighted; +10% damage vs highlighted |
| `shadow_core` | Light | While moving: all incoming damage reduced by 12% |
| `fuel_injector` | Light | FTH range +40%, cone width +30% |
| `thermal_core` | Light | FTH always ignites on hit; ignite duration +1s |
| `pyromaniac_chip` | Light | Ignited enemies spread fire to one adjacent enemy on death |
| `multi_drone` | Medium | Deploy 2 attack drones simultaneously instead of 1 |
| `tactical_uplink` | Medium | Mod cooldowns −10% additional; stacks with Cooldown Mastery |
| `field_processor` | Medium | After 3 hits same enemy: +15% damage to that target permanently |
| `system_sync` | Medium | Activating any mod heals 20 HP on most-damaged limb |
| `adaptive_core` | Medium | Each round survived: +3% base DR (max +15%) |
| `echo_targeting` | Medium | Hitting enemy reveals all enemies within 300 px for 3s |
| `suppressor_aura` | Heavy | Enemies within 200 px: −15% move speed |
| `colossus_frame` | Heavy | Core HP +60; Arm and Leg HP +40 |
| `impact_core` | Heavy | Close-range kills (<200 px): restore 15 core HP, stun nearby 0.5s |
| `blast_dampener` | Heavy | Self-damage from explosions reduced by 60% |
| `heavy_loader` | Heavy | All weapon reload times −20% |
| `chain_drive` | Heavy | CHAIN 2H weapon: +25% fire rate |

---

### Unique / Boss-Drop Augment Items

Unique augment items have `baseType: 'augment'` (not `aug_system`). They do **not** set
`loadout.aug` to a system key — they provide only passive stat bonuses and a unique effect.
No chassis restriction applies at drop time. Fixed affixes are always rolled with their exact values.

---

#### Architect's Array *(Epic — The Architect boss, rounds 15/35/55…)*
- **Key**: `architects_array` | **Rarity**: Epic | **Base type**: `augment`
- **Base stats**: modEffPct: 20
- **Fixed affixes**: −8% Mod Cooldown, +25% Mod Effectiveness
- **Unique effect** (`modAmplify`): All mod durations and effects are extended by 50%.
- **Unique label**: OVERCLOCK: Mod effects last 50% longer
- **Chassis**: All (no chassis restriction at drop time; augment slot is chassis-unrestricted for pure stat augments)
- **Implementation**: `modAmplify` effect key registered in `_gearState._uniqueEffects`; mod duration reads check for this key and multiply the active duration by 1.5

---

#### Hive Mind *(Legendary — The Swarm boss, rounds 25/65/105…)*
- **Key**: `hive_mind` | **Rarity**: Legendary | **Base type**: `augment`
- **Base stats**: dmgPct: 8, modEffPct: 10
- **Fixed affixes**: +10% Damage, +8% Crit Chance, +6% Mod Cooldown *(positive — note: fixed affix value stored as positive; display as a cost)*
- **Unique effect** (`swarmBurst`): Each kill spawns 2 micro-drones that home in on the nearest enemy, dealing 15 damage each (30 total per kill if both connect).
- **Unique label**: SWARM BURST: Kills release homing drones that seek nearby enemies
- **Chassis**: All (no chassis restriction)
- **Implementation**: `swarmBurst` effect key registered in `_gearState._uniqueEffects`; kill event handler checks for the key and spawns 2 homing drone projectiles at the kill location

---

## Section 8: Summary Tables

---

### Table 1 — Equippable Options per Slot per Chassis

Counts all distinct base item options (stat items + system items) available to each chassis in each gear
slot. Source: `CHASSIS_WEAPONS`, `CHASSIS_CPUS`, `CHASSIS_SHIELDS`, `CHASSIS_LEGS`, `CHASSIS_AUGS`
in `js/constants.js`; armor and arms sub-type counts from `js/loot-system.js` (no chassis restriction).
`'none'` is excluded from all counts. Unique boss-drop items are **not** counted here — see Table 2.

| Slot | Light | Medium | Heavy | Notes |
|---|:---:|:---:|:---:|---|
| **Weapon** *(per arm slot)* | 3 | 4 | 4 | L chassis: `smg`, `fth`, `sg`. M: `mg`, `br`, `sr`, `rail`. H: `hr`, `rl`, `plsm`, `gl`. Each mech has two independent arm slots (L/R). |
| **CPU** | 4 | 4 | 4 | System items only (from `CHASSIS_CPUS`). `barrier` is the one option shared across all three chassis; remaining 3 per chassis are exclusive. |
| **Shield** | 10 | 10 | 9 | 5 universal shields shared by all chassis + 5 Light-exclusive, 5 Medium-exclusive, 4 Heavy-exclusive. |
| **Armor** | 4 | 4 | 4 | No chassis restriction. Sub types: `light_plate`, `medium_plate`, `heavy_plate`, `reactive_plate`. |
| **Arms** | 3 | 3 | 3 | No chassis restriction. Sub types: `servo_enhancer`, `stabilizer`, `power_coupler`. |
| **Legs** | 10 | 12 | 10 | 3 pure-stat legs (all chassis) + 7 / 9 / 7 leg systems from `CHASSIS_LEGS`. |
| **Augment** | 16 | 15 | 13 | 3 pure-stat augments (all chassis) + 13 / 12 / 10 aug systems from `CHASSIS_AUGS`. |

#### Leg breakdown (pure stat + systems)

| Chassis | Pure Stat Legs | Leg Systems (from `CHASSIS_LEGS`) | Total |
|---|:---:|---|:---:|
| Light | 3 | `hydraulic_boost`, `gyro_stabilizer`, `sprint_boosters`, `featherweight`, `ghost_legs`, `silent_step`, `reactive_dash` (7) | **10** |
| Medium | 3 | `gyro_stabilizer`, `mag_anchors`, `mine_layer`, `stabilizer_gyros`, `adaptive_stride`, `seismic_dampener`, `reactor_legs`, `power_stride`, `evasion_coils` (9) | **12** |
| Heavy | 3 | `mag_anchors`, `mine_layer`, `tremor_legs`, `siege_stance`, `ironclad_legs`, `suppressor_legs`, `warlord_stride` (7) | **10** |

> Pure stat legs: `actuator`, `booster`, `dampener` — no chassis restriction, same 3 for all.

#### Augment breakdown (pure stat + systems)

| Chassis | Pure Stat Augments | Aug Systems (from `CHASSIS_AUGS`) | Total |
|---|:---:|---|:---:|
| Light | 3 | `target_painter`, `threat_analyzer`, `ballistic_weave`, `targeting_scope`, `neural_accel`, `ghost_circuit`, `reflex_amp`, `kill_sprint`, `predator_lens`, `shadow_core`, `fuel_injector`, `thermal_core`, `pyromaniac_chip` (13) | **16** |
| Medium | 3 | `target_painter`, `threat_analyzer`, `overclock_cpu`, `reactive_plating`, `combat_ai`, `drone_relay`, `multi_drone`, `tactical_uplink`, `field_processor`, `system_sync`, `adaptive_core`, `echo_targeting` (12) | **15** |
| Heavy | 3 | `reactive_plating`, `scrap_cannon`, `war_machine`, `iron_fortress`, `suppressor_aura`, `colossus_frame`, `impact_core`, `blast_dampener`, `heavy_loader`, `chain_drive` (10) | **13** |

> Pure stat augments: `targeting_array`, `neural_link`, `combat_matrix` — no chassis restriction, same 3 for all.

---

### Table 2 — Boss Unique Items by Gear Slot

All 16 unique items from `UNIQUE_ITEMS` in `js/loot-system.js`, organized by the gear slot they occupy.
Each boss guarantees 1 drop per kill: 25% chance Legendary, 75% chance Epic.
Chassis filtering does **not** apply at drop time — any chassis can receive any unique.
Equip restrictions (if any) are enforced at equip time from the item's `subType`.

Items are listed in boss encounter order (first appearance round).

#### Weapon Slot — 3 unique items

| Item | Boss Source | First Round | Rarity | Chassis at Equip | One-Line Effect |
|---|---|:---:|:---:|:---:|---|
| **Razor Edge** | Twin Razors | R10 | Legendary | Light only (`smg` sub type) | TWIN FANGS: Every 3rd shot fires twice — a duplicate projectile is spawned |
| **Mirror Shard** | The Mirror | R30 | Legendary | All (no sub type) | MIRROR SHOT: Bullets reflect off cover/walls once, dealing 60% damage on ricochet *(stub — not yet implemented)* |
| **Titan Fist** | The Titan | R35 | Legendary | All (no sub type) | TITAN SMASH: Every 5th shot creates a 120 px AoE shockwave dealing 50% of shot damage |

#### CPU Slot — 2 unique items

| Item | Boss Source | First Round | Rarity | Chassis at Equip | One-Line Effect |
|---|---|:---:|:---:|:---:|---|
| **Blueprint Core** | The Architect | R15 | Legendary | All | FABRICATOR: Each mod activation spawns a temporary destructible cover wall at the player's position |
| **Core Reactor** | The Core | R40 | Legendary | All | CORE OVERLOAD: Each mod activation releases a 200 px energy pulse dealing 80 damage to all enemies in range |

#### Shield Slot — 2 unique items

| Item | Boss Source | First Round | Rarity | Chassis at Equip | One-Line Effect |
|---|---|:---:|:---:|:---:|---|
| **Warden's Aegis** | The Warden | R5 | Legendary | All | FRONTAL AEGIS: While shield is active, frontal hits (within ±60° of torso facing) deal 40% less damage |
| **Matrix Shield** | The Core | R40 | Epic | All | MATRIX: Shield break grants 3 s of full invulnerability; 60 s cooldown between triggers |

#### Armor Slot — 3 unique items

| Item | Boss Source | First Round | Rarity | Chassis at Equip | One-Line Effect |
|---|---|:---:|:---:|:---:|---|
| **Sentinel's Plating** | The Warden | R5 | Epic | All | SENTINEL STANCE: While shield is at maximum HP, gain +12% additional damage reduction |
| **Unstoppable Core** | The Juggernaut | R20 | Epic | All | IMPACT ARMOR: Taking a single hit for >25 damage grants +15% bonus DR for 3 seconds |
| **Swarm Carapace** | The Swarm | R25 | Epic | All | ADAPTIVE: Successive hits from the same enemy deal 10% less damage per hit, stacking up to 40% reduction |

#### Arms Slot — 2 unique items

| Item | Boss Source | First Round | Rarity | Chassis at Equip | One-Line Effect |
|---|---|:---:|:---:|:---:|---|
| **Twinned Servo** | Twin Razors | R10 | Epic | All | SYNC SERVOS: When both arm slots have weapons equipped, reload speed is boosted by 30% |
| **Echo Frame** | The Mirror | R30 | Epic | All | ECHO: Mod activation fires a phantom copy of the last shot fired (no on-hit effects) |

#### Legs Slot — 2 unique items

| Item | Boss Source | First Round | Rarity | Chassis at Equip | One-Line Effect |
|---|---|:---:|:---:|:---:|---|
| **Juggernaut Engine** | The Juggernaut | R20 | Legendary | All | UNSTOPPABLE: Cannot be slowed by any effect; movement speed bonus further increased by 20% |
| **Colossus Frame** | The Titan | R35 | Epic | All | COLOSSUS: Standing still for 2 s grants +25% damage and +10% DR; buff drops on any movement input |

#### Augment Slot — 2 unique items

| Item | Boss Source | First Round | Rarity | Chassis at Equip | One-Line Effect |
|---|---|:---:|:---:|:---:|---|
| **Architect's Array** | The Architect | R15 | Epic | All | OVERCLOCK: All mod activation durations and effects are extended by 50% |
| **Hive Mind** | The Swarm | R25 | Legendary | All | SWARM BURST: Each kill spawns 2 homing micro-drones that seek the nearest enemy, dealing 15 damage each |

---

#### Boss–Drop Cross-Reference

| Boss | First Round | Legendary Drop | Slot | Epic Drop | Slot |
|---|:---:|---|:---:|---|:---:|
| The Warden | R5 | Warden's Aegis | Shield | Sentinel's Plating | Armor |
| Twin Razors | R10 | Razor Edge | Weapon | Twinned Servo | Arms |
| The Architect | R15 | Blueprint Core | CPU | Architect's Array | Augment |
| The Juggernaut | R20 | Juggernaut Engine | Legs | Unstoppable Core | Armor |
| The Swarm | R25 | Hive Mind | Augment | Swarm Carapace | Armor |
| The Mirror | R30 | Mirror Shard | Weapon | Echo Frame | Arms |
| The Titan | R35 | Titan Fist | Weapon | Colossus Frame | Legs |
| The Core | R40 | Core Reactor | CPU | Matrix Shield | Shield |

> Bosses recur on a fixed interval after their first appearance (e.g. Warden repeats every 20 rounds: R5, R25, R45…; The Core repeats every 40 rounds: R40, R80, R120…). Each recurrence is a fresh drop roll.
