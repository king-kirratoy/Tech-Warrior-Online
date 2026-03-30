# Keystone Unique Trait Audit

**Date:** 2026-03-30
**Branch:** claude/read-docs-pagination-4C3mm
**Scope:** All keystone nodes across Light, Medium, and Heavy chassis skill trees.

---

## Root Cause — Systemic Failure

Before the per-keystone breakdown, the audit uncovered a systemic issue that
makes **all 39 keystones across all three chassis completely non-functional**.

### How the stat bonus pipeline works

`getSkillTreeBonuses()` (skill-tree.js:884) iterates every allocated node and
calls `_parseSkillStatString(node.s)` on its `"s"` (short stat) field. The
patterns it recognises are narrow numeric strings like `"+6% SMG DMG"`,
`"+10 ALL HP"`, `"+5% SHIELD REGEN"`, etc. It feeds matching values into a
`_stb` object. Then `garage.js:499-543` applies `_stb` values to `_perkState`
(damage, fire-rate, crit, speed, dodge, DR) and to player HP/shield fields.

### Why keystones produce zero output

1. **Light chassis keystones** — have an `"s"` field, but every keystone uses
   a mastery-label string: `"SMG MASTERY"`, `"EVASION MASTERY"`,
   `"BARRIER MASTERY"`, etc. None of these match any `_parseSkillStatString`
   pattern. The one partial exception, OVERCLOCK's `"s": "+15% Cooldown +30%
   EFFECT"`, doesn't match any pattern either (the function has no Cooldown or
   EFFECT token), and `garage.js` has no code to apply mod-cooldown or
   mod-duration from `_stb` even if it did parse.

2. **Medium and Heavy chassis keystones** — have **no `"s"` field at all**.
   `getSkillTreeBonuses()` skips `if (!node || !node.s) return;` for every
   one of them. Zero stats are produced.

3. **No keystone IDs are referenced outside `skill-tree-data.js`** — the
   node IDs (`ks_bullet_hell`, `ks_hellfire`, `ks_decimator`, `ks_parasyte`,
   `ks_phantom`, `ks_overclock`, `ks_meteor`, `ks_stasis`, `ks_doppel`,
   `ks_glass_cannon`, `node_9`, `node_11`, `node_215`) are **never read** in
   `combat.js`, `mods.js`, `perks.js`, `mechs.js`, `rounds.js`, or any other
   gameplay file. `_skillTreeState.allocated` is only accessed by the UI
   renderer (skill-tree.js), the save/load system, and the `getSkillTreeBonuses`
   call in garage.js. There is no function like `isKeystoneAllocated()` and no
   conditional branches anywhere in combat or mod code that check keystone
   allocation.

Consequence: every keystone's stat bonuses are silently discarded, and none of
the unique trait effects are ever executed.

---

## Light Chassis Keystones

### [Light] — BULLET HELL (`ks_bullet_hell`)
- Trait: "+6% SMG Damage, +6% SMG Fire Rate, **Fires two rounds per shot**"
- Status: **BROKEN**
- Implementation: `"s": "SMG MASTERY"` — not parsed. No SMG double-shot check anywhere in `combat.js` or the bullet-fire loop.
- Issue: Stat bonuses not applied. Unique trait "two rounds per shot" not implemented — no flag, no fire-path branch.

### [Light] — HELLFIRE (`ks_hellfire`)
- Trait: "+6% Flamethrower Damage, **Always ignite**, **Burn Explode 30 AOE**"
- Status: **BROKEN**
- Implementation: `"s": "Flamethrower MASTERY"` — not parsed. No always-ignite or burn-explode check tied to this keystone in `combat.js`.
- Issue: Stat bonus not applied. The existing FTH ignite logic in `combat.js` (lines 1727-1739) gates ignition behind `_perkState.incendiary` or `_perkState.thermalCore`; the keystone never sets either. "Burn Explode 30 AOE" has no implementation at all.

### [Light] — DECIMATOR (`ks_decimator`)
- Trait: "+15% Shotgun Damage, **+3 pellets**, **Same-target +5% each**"
- Status: **BROKEN**
- Implementation: `"s": "Shotgun MASTERY"` — not parsed. No pellet-count modifier or same-target stacking check for this keystone in `combat.js`/`fireSG`.
- Issue: Stat bonus not applied. Both unique traits (extra pellets, stacking damage) not implemented.

### [Light] — PARASYTE (`ks_parasyte`)
- Trait: "+6% Siphon Heal, +8% Damage, **Chain to 1 enemy**"
- Status: **BROKEN**
- Implementation: `"s": "SIPHON MASTERY"` — not parsed. No siphon-chain logic tied to this keystone in `combat.js`/`fireSIPHON`.
- Issue: Stat bonuses not applied. "Chain to 1 enemy" not implemented.

### [Light] — Phantom (`ks_phantom`)
- Trait: "+6% Move Speed, +6% Dodge"
- Status: **BROKEN**
- Implementation: `"s": "EVASION MASTERY"` — not parsed. No alternative path.
- Issue: Pure stat keystone; stats silently produce zero output.

### [Light] — OVERCLOCK (`ks_overclock`)
- Trait: "+15% Mod Cooldown, +30% Mod Duration"
- Status: **BROKEN**
- Implementation: `"s": "+15% Cooldown +30% EFFECT"` — no regex in `_parseSkillStatString` matches "Cooldown" or "EFFECT". Additionally `garage.js:499-543` has no handler for mod-cooldown or mod-duration from `_stb` even if parsing succeeded.
- Issue: Doubly broken — `s` field format wrong AND no application path exists.

### [Light] — Meteor Strike (`ks_meteor`)
- Trait: "+25% Jump Distance, **50 AOE Landing**, **2s Invuln**"
- Status: **BROKEN**
- Implementation: `"s": "JUMP MASTERY"` — not parsed. No landing-explosion or invulnerability window in the JUMP mod code (`mods.js`) gated on this keystone.
- Issue: Stat bonus not applied. The `jump_slam` perk adds a landing explosion but that is a separate perk; the keystone never sets it. 2s invuln not implemented anywhere.

### [Light] — Stasis Field (`ks_stasis`)
- Trait: "+3s Barrier, **Slows enemies 150u by 40%**"
- Status: **BROKEN**
- Implementation: `"s": "BARRIER MASTERY"` — not parsed. No barrier-activation slow logic in `mods.js` tied to this keystone.
- Issue: Stat bonus not applied. Enemy slow on barrier activation not implemented.

### [Light] — Doppelganger (`ks_doppel`)
- Trait: "**Decoy fires at 50%**, **+4s duration**, **100% aggro**"
- Status: **BROKEN**
- Implementation: `"s": "DECOY MASTERY"` — not parsed. The decoy fires in `mods.js:32` but rate, duration, and aggro are controlled by separate perks (`decoy_taunt`, `decoy_firefast`); the keystone never sets those flags.
- Issue: All three traits not implemented.

### [Light] — GLASS CANNON (`ks_glass_cannon`)
- Trait: "+12% Damage, +12% Fire Rate, -30 All Parts HP"
- Status: **BROKEN**
- Implementation: `"s": "WEAPON MASTERY"` — not parsed. No alternative path.
- Issue: Pure stat keystone; produces zero output.

### [Light] — IRON STEEL (`node_9`)
- Trait: "+30 All Parts HP, +6% Damage Reduction"
- Status: **BROKEN**
- Implementation: `"s": "RESISTANCE MASTERY"` — not parsed.
- Issue: Pure stat keystone; produces zero output.

### [Light] — BLESSED SHIELD (`node_11`)
- Trait: "+30 Shield HP, +6% Regen, +4% Absorb"
- Status: **BROKEN**
- Implementation: `"s": "SHIELD MASTERY"` — not parsed.
- Issue: Pure stat keystone; produces zero output.

### [Light] — Ghost Protocol (`node_215`)
- Trait: "**2s Invis**, **First Attack 3x**, +5% Move Speed"
- Status: **BROKEN**
- Implementation: `"s": "GHOST MASTERY"` — not parsed. No passive cloak or first-attack multiplier triggered by this keystone in any gameplay file. The Ghost Step CPU mod (`mods.js:779`) provides separate cloak but is a mod activation, not a keystone passive.
- Issue: Stat bonus not applied. Both unique traits not implemented.

---

## Medium Chassis Keystones

### [Medium] — LEAD STORM (`ks_bullet_hell`)
- Trait: "+6% Machine Gun Damage, +6% MG Fire Rate, **Every 5th hit deals double damage**"
- Status: **BROKEN**
- Implementation: No `"s"` field — `getSkillTreeBonuses()` skips this node entirely. No hit-counter or 5th-hit multiplier in `combat.js` tied to this keystone.
- Issue: All bonuses absent.

### [Medium] — DEADEYE (`ks_hellfire`)
- Trait: "+6% Battle Rifle Damage, **+2% Damage per consecutive hit on same target**"
- Status: **BROKEN**
- Implementation: No `"s"` field. No consecutive-hit tracking or stacking multiplier in `combat.js` for this keystone.
- Issue: All bonuses absent.

### [Medium] — ONE SHOT ONE KILL (`ks_decimator`)
- Trait: "+6% Sniper Rifle Damage, **+10% SR Crit Chance**, +4% SR Fire Rate"
- Status: **BROKEN**
- Implementation: No `"s"` field. No stat application.
- Issue: Pure stat keystone; produces zero output.

### [Medium] — ARMOR PIERCER (`ks_parasyte`)
- Trait: "+6% Railgun Damage, **Shots pierce 2 enemies**, +10% Railgun Charge Speed"
- Status: **BROKEN**
- Implementation: No `"s"` field. No pierce-limit code in `fireRAIL` (`combat.js:244`) tied to this keystone. Note: the current railgun already hits all enemies in line via hitscan iteration; "pierce 2 enemies" trait contradicts that behaviour and is also never applied.
- Issue: All bonuses absent.

### [Medium] — Phantom (`ks_phantom`)
- Trait: "+6% Move Speed, +6% Dodge"
- Status: **BROKEN**
- Implementation: No `"s"` field.
- Issue: Pure stat keystone; produces zero output.

### [Medium] — OVERCLOCK (`ks_overclock`)
- Trait: "+15% Mod Cooldown, +30% Mod Duration"
- Status: **BROKEN**
- Implementation: No `"s"` field. `garage.js` has no mod-cooldown/mod-duration application from `_stb`.
- Issue: All bonuses absent.

### [Medium] — BERSERKER (`ks_meteor`)
- Trait: "+16% Rage Damage, **+3s Rage Duration**, **+8% Move Speed during Rage**"
- Status: **BROKEN**
- Implementation: No `"s"` field. No rage-duration extension or in-rage speed bonus from keystone in `mods.js`/`activateRage`. Existing rage perks (`rage_fuel`, `rage_speed`) do this separately; the keystone never applies them.
- Issue: All bonuses absent.

### [Medium] — Stasis Field (`ks_stasis`)
- Trait: "+3s Barrier, **+40% Slow to enemies within 150u**"
- Status: **BROKEN**
- Implementation: No `"s"` field. No barrier-slow code in `mods.js` for this keystone.
- Issue: All bonuses absent.

### [Medium] — GUARDIAN ANGEL (`ks_doppel`)
- Trait: "+30% Repair Drone Heal, **+10% Damage Reduction while drone active**"
- Status: **BROKEN**
- Implementation: No `"s"` field. No DR-while-drone-active check in damage-processing (`combat.js`) for this keystone.
- Issue: All bonuses absent.

### [Medium] — GLASS CANNON (`ks_glass_cannon`)
- Trait: "+12% Damage, +12% Fire Rate, -30 All Parts HP"
- Status: **BROKEN**
- Implementation: No `"s"` field.
- Issue: Pure stat keystone; produces zero output.

### [Medium] — IRON STEEL (`node_9`)
- Trait: "+30 All Parts HP, +6% Damage Reduction"
- Status: **BROKEN**
- Implementation: No `"s"` field.
- Issue: Pure stat keystone; produces zero output.

### [Medium] — BLESSED SHIELD (`node_11`)
- Trait: "+30 Shield HP, +6% Regen, +4% Absorb"
- Status: **BROKEN**
- Implementation: No `"s"` field.
- Issue: Pure stat keystone; produces zero output.

### [Medium] — DRONE SWARM (`node_215`)
- Trait: "**2 Attack Drones**, **+15% Drone Damage**, **+3s Drone Duration**"
- Status: **BROKEN**
- Implementation: No `"s"` field. `activateDrone` in `mods.js` spawns exactly 1 drone; no branch fires a second drone from this keystone. Drone damage and duration bonuses not applied.
- Issue: All traits absent.

---

## Heavy Chassis Keystones

### [Heavy] — HEAVY BARRAGE (`ks_bullet_hell`)
- Trait: "+6% Heavy Rifle Damage, +6% HR Fire Rate, **Every 5th hit deals double damage**"
- Status: **BROKEN**
- Implementation: No `"s"` field. No hit-counter or 5th-hit doubling in `combat.js` tied to this keystone.
- Issue: All bonuses absent.

### [Heavy] — BOMBARDMENT (`ks_hellfire`)
- Trait: "+6% Rocket Launcher Damage, +15% Rocket Launcher AOE, **Rockets leave burning ground for 3s**"
- Status: **BROKEN**
- Implementation: No `"s"` field — stat bonuses (damage %, AOE %) not applied. Burning ground not created.
- Issue (detailed per Step 3):
  - `fireRL()` (`combat.js:678-703`): on enemy overlap calls `createExplosion(scene, r.x, r.y, 80, weapon.dmg, true)` — no burning-ground code follows.
  - `createExplosion()` (`combat.js:1476-1518`): handles blast radius, damage, and tween; no conditional for any burning-ground effect regardless of perk or keystone state.
  - The perk `rl_napalm` (`perks.js:707`) sets `_perkState.rlNapalm=true` — a parallel burning-ground mechanic — but that flag is **never read** anywhere in `combat.js`. The RL impact path has zero burning-ground code of any kind.
  - Similarly `rl_afterburn` sets `_perkState.rlAfterburn=true` (`perks.js:77`) — also never read in combat.js.
  - No check for `_skillTreeState.allocated['ks_hellfire']` exists anywhere outside `skill-tree-data.js`.
  - What's missing: (a) a parseable `"s"` field for the stat bonuses; (b) a burning-ground spawner in `fireRL` (or `createExplosion`) gated on keystone allocation or a keystone-set `_perkState` flag; (c) damage-tick logic for enemies in the burning zone.

### [Heavy] — PLASMA STORM (`ks_decimator`)
- Trait: "+6% Plasma Cannon Damage, +6% PLSM Fire Rate, **Plasma shots explode on impact for 25 AOE**"
- Status: **BROKEN**
- Implementation: No `"s"` field. No secondary explosion spawned at PLSM impact for this keystone. The `plsm_nova` perk does a 120px/60dmg nova but is a separate perk; this keystone never sets it or equivalent.
- Issue: All bonuses absent.

### [Heavy] — CARPET BOMB (`ks_parasyte`)
- Trait: "+6% Grenade Launcher Damage, +20% GL AOE, **Grenades split into 3 on impact**"
- Status: **BROKEN**
- Implementation: No `"s"` field. `fireGL()` detonation path (`combat.js:665`) has no split-grenade logic for this keystone. The legendary perk `gl_legendary` (CARPET BOMB) fires 4 spread grenades but is a separate perk; the keystone never applies it.
- Issue: All bonuses absent.

### [Heavy] — Phantom (`ks_phantom`)
- Trait: "+6% Move Speed, +6% Dodge"
- Status: **BROKEN**
- Implementation: No `"s"` field.
- Issue: Pure stat keystone; produces zero output.

### [Heavy] — OVERCLOCK (`ks_overclock`)
- Trait: "+15% Mod Cooldown, +30% Mod Duration"
- Status: **BROKEN**
- Implementation: No `"s"` field. `garage.js` has no mod-cooldown/mod-duration application from `_stb`.
- Issue: All bonuses absent.

### [Heavy] — MISSILE BARRAGE (`ks_meteor`)
- Trait: "+16% Missile Damage, **Fire 3 missiles per volley**, +20% Missile AOE"
- Status: **BROKEN**
- Implementation: No `"s"` field. `activateMissiles()` (`mods.js:99`) uses `mod.missileCount` from the WEAPONS constant (fixed at 6). The `missile_count` perk increments `_perkState.missileCount`; this keystone never does. No "volley of 3" distinct-volley behaviour exists.
- Issue: All bonuses absent.

### [Heavy] — Stasis Field (`ks_stasis`)
- Trait: "+3s Barrier, +40% Slow to enemies within 150u"
- Status: **BROKEN**
- Implementation: No `"s"` field. No barrier-activation slow for this keystone.
- Issue: All bonuses absent.

### [Heavy] — EMP OVERLOAD (`ks_doppel`)
- Trait: "+30% EMP Burst Damage, +20% EMP Burst AOE, **Disables enemy shields for 3s**"
- Status: **BROKEN**
- Implementation: No `"s"` field. EMP activation code in `mods.js` has no shield-disable branch for this keystone. The `emp_shieldstrip` perk fully destroys shields on hit but is a separate perk; the keystone never sets it.
- Issue: All bonuses absent.

### [Heavy] — GLASS CANNON (`ks_glass_cannon`)
- Trait: "+12% Damage, +12% Fire Rate, -30 All Parts HP"
- Status: **BROKEN**
- Implementation: No `"s"` field.
- Issue: Pure stat keystone; produces zero output.

### [Heavy] — IRON STEEL (`node_9`)
- Trait: "+30 All Parts HP, +6% Damage Reduction"
- Status: **BROKEN**
- Implementation: No `"s"` field.
- Issue: Pure stat keystone; produces zero output.

### [Heavy] — BLESSED SHIELD (`node_11`)
- Trait: "+30 Shield HP, +6% Regen, +4% Absorb"
- Status: **BROKEN**
- Implementation: No `"s"` field.
- Issue: Pure stat keystone; produces zero output.

### [Heavy] — IRON FORTRESS (`node_215`)
- Trait: "**+20% Fortress Mode Damage Reduction**, **+3s Fortress Mode Duration**, **Reflects 15% damage to attackers**"
- Status: **BROKEN**
- Implementation: No `"s"` field. `activateFortressMode()` (`mods.js`) does not check keystone allocation for DR boost, duration extension, or damage reflection. The `fm_aoe` perk reflects 20% damage as explosion AoE (separate perk; keystone never sets it).
- Issue: All traits absent.

---

## Summary — All Broken Keystones

**Every keystone across all three chassis is broken. 39 total / 39 broken.**

### Broken by systemic root cause only (unique mechanic missing AND stats not applied)

| Chassis | Node ID | Name | Missing unique trait |
|---------|---------|------|---------------------|
| Light | ks_bullet_hell | BULLET HELL | Fires two rounds per shot |
| Light | ks_hellfire | HELLFIRE | Always ignite; Burn Explode 30 AOE |
| Light | ks_decimator | DECIMATOR | +3 pellets; Same-target +5% stacking |
| Light | ks_parasyte | PARASYTE | Chain siphon to 1 enemy |
| Light | ks_phantom | Phantom | *(stat-only — no unique trait)* |
| Light | ks_overclock | OVERCLOCK | *(stat-only — ALSO has no apply path in garage.js)* |
| Light | ks_meteor | Meteor Strike | 50 AOE on landing; 2s invuln |
| Light | ks_stasis | Stasis Field | Slow enemies 150u by 40% |
| Light | ks_doppel | Doppelganger | Decoy fires at 50% dmg; +4s; 100% aggro |
| Light | ks_glass_cannon | GLASS CANNON | *(stat-only)* |
| Light | node_9 | IRON STEEL | *(stat-only)* |
| Light | node_11 | BLESSED SHIELD | *(stat-only)* |
| Light | node_215 | Ghost Protocol | 2s Invis (passive); First Attack 3x |
| Medium | ks_bullet_hell | LEAD STORM | Every 5th hit double damage |
| Medium | ks_hellfire | DEADEYE | +2% dmg per consecutive hit on same target |
| Medium | ks_decimator | ONE SHOT ONE KILL | *(stat-only)* |
| Medium | ks_parasyte | ARMOR PIERCER | Pierce 2 enemies |
| Medium | ks_phantom | Phantom | *(stat-only)* |
| Medium | ks_overclock | OVERCLOCK | *(stat-only)* |
| Medium | ks_meteor | BERSERKER | +3s Rage Duration; +8% speed during Rage |
| Medium | ks_stasis | Stasis Field | +40% slow to enemies in 150u |
| Medium | ks_doppel | GUARDIAN ANGEL | +10% DR while drone active |
| Medium | ks_glass_cannon | GLASS CANNON | *(stat-only)* |
| Medium | node_9 | IRON STEEL | *(stat-only)* |
| Medium | node_11 | BLESSED SHIELD | *(stat-only)* |
| Medium | node_215 | DRONE SWARM | 2 attack drones; +15% drone dmg; +3s duration |
| Heavy | ks_bullet_hell | HEAVY BARRAGE | Every 5th hit double damage |
| Heavy | **ks_hellfire** | **BOMBARDMENT** | **Rockets leave burning ground for 3s** |
| Heavy | ks_decimator | PLASMA STORM | Plasma shots explode on impact for 25 AOE |
| Heavy | ks_parasyte | CARPET BOMB | Grenades split into 3 on impact |
| Heavy | ks_phantom | Phantom | *(stat-only)* |
| Heavy | ks_overclock | OVERCLOCK | *(stat-only)* |
| Heavy | ks_meteor | MISSILE BARRAGE | Fire 3 missiles per volley |
| Heavy | ks_stasis | Stasis Field | +40% slow to enemies in 150u |
| Heavy | ks_doppel | EMP OVERLOAD | Disables enemy shields for 3s |
| Heavy | ks_glass_cannon | GLASS CANNON | *(stat-only)* |
| Heavy | node_9 | IRON STEEL | *(stat-only)* |
| Heavy | node_11 | BLESSED SHIELD | *(stat-only)* |
| Heavy | node_215 | IRON FORTRESS | +20% Fortress DR; +3s Fortress duration; 15% dmg reflect |

### What needs to be fixed (high-level)

**For stat-only keystones (15 nodes: Phantom × 3, OVERCLOCK × 3, GLASS CANNON × 3, IRON STEEL × 3, BLESSED SHIELD × 3):**
- Add properly-formatted `"s"` stat strings to each node in `skill-tree-data.js` using the pattern that `_parseSkillStatString` can parse (e.g. `"+6% SPEED +6% DODGE"`).
- For OVERCLOCK specifically: also add mod-cooldown and mod-duration application to the `_stb` section in `garage.js`.

**For keystones with unique gameplay traits (24 nodes):**
- Each requires both: (a) a parseable `"s"` field for stat bonuses, AND (b) new gameplay code in the relevant fire/mod/combat function that checks keystone allocation and executes the effect.
- BOMBARDMENT specifically needs burning-ground creation code inside `fireRL()` (or a post-impact hook called from it) gated on `_skillTreeState.allocated['ks_hellfire'] > 0` (heavy chassis) — the same pattern as `_perkState.fthNapalmStrike` at `combat.js:222`.
