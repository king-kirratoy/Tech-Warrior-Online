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
