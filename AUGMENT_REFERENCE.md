# Augment System Reference

> Audit-only document. No game files were modified.
> Sources: `js/constants.js` (AUGMENTS, CHASSIS_AUGS, AUG_OPTIONS), `js/mods.js` (applyAugment), `js/combat.js`, `js/events.js`, `js/loot-system.js` (ITEM_BASES aug_system entries).

---

## How Augments Work

Each mech has one augment slot (`loadout.aug`). On deploy, `applyAugment()` in `js/mods.js` reads `loadout.aug` and sets flags on `_perkState` (or directly mutates chassis/player state). Those flags are then read by combat, movement, and mod-activation code throughout the session. Augments are chassis-restricted: equipping an aug not in `CHASSIS_AUGS[loadout.chassis]` is blocked by the garage UI.

In the Campaign loot system (`js/loot-system.js`), augments drop as `aug_system` items with `baseStats` that provide flat numeric bonuses (e.g. `dmgPct`, `dr`, `reloadPct`) on top of the active effect described below.

Flags marked **"flag set, effect not yet implemented"** are wired up in `applyAugment()` and visible in the game UI/loot pool, but the corresponding runtime logic that reads the flag was not found in the codebase at audit time.

---

## Section 1 — Light Chassis Augments

Light chassis augment pool (`CHASSIS_AUGS.light`):
`none, target_painter, threat_analyzer, ballistic_weave, targeting_scope, neural_accel, ghost_circuit, reflex_amp, kill_sprint, predator_lens, shadow_core, fuel_injector, thermal_core, pyromaniac_chip`

---

### TARGET PAINTER
- **Key:** `target_painter`
- **Weight:** 20
- **Chassis access:** Light, Medium (universal)
- **Loot base stats:** `dmgPct: 3, accuracy: 3`
- **Gameplay effect:** When a bullet hits an enemy, that enemy is marked as `_painted = true` and stored as `_perkState._paintedEnemy`. A visual orange stroke is applied to the enemy's torso sprites. All subsequent damage dealt to that painted enemy (from any source, including explosions and drones) is multiplied by **×1.20** (+20%). Only one enemy can be painted at a time; landing a hit on a different enemy re-paints to the new target. The mark persists until the enemy dies.
- **Implementation:** `combat.js` line 907 (damage multiplier), lines 1297–1300 (paint on hit).

---

### THREAT ANALYZER
- **Key:** `threat_analyzer`
- **Weight:** 20
- **Chassis access:** Light, Medium (universal)
- **Loot base stats:** `critChance: 2, accuracy: 3`
- **Gameplay effect:** The first bullet that hits an enemy sets `e._analyzed = true` and permanently divides that enemy's damage-received multiplier (`e._dmgMult`) by **0.85**, making them take **~17.6% more damage** from all sources for the rest of the round. With the `analyzerDepth` perk, the divisor becomes 0.75 (~33% more damage). The effect does not stack on re-hits; it is applied once per enemy.
- **Implementation:** `combat.js` lines 1021–1024.

---

### REFLEX AMP
- **Key:** `reflex_amp`
- **Weight:** 20
- **Chassis access:** Light only
- **Loot base stats:** `reloadPct: -4, dodgePct: 2`
- **Gameplay effect (described):** The first shot fired immediately after a JUMP landing or a dodge maneuver deals **+40% damage**.
- **Implementation status:** `_perkState.reflexAmp = true` is set in `applyAugment()` (`mods.js` line 409). **Flag set; active damage-window logic not found in codebase.**

---

### KILL SPRINT
- **Key:** `kill_sprint`
- **Weight:** 22
- **Chassis access:** Light only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect (described):** Each kill grants **+8% move speed for 4 seconds**, stacking up to **3 times** for a maximum of +24% speed.
- **Implementation status:** `_perkState.killSprint = true` is set in `applyAugment()` (`mods.js` line 410). `CHASSIS.light.killSpeedStacks` is initialized to 0 in the chassis definition. **Flag set; speed-stack update logic not found in codebase.**

---

### BALLISTIC WEAVE
- **Key:** `ballistic_weave`
- **Weight:** 25
- **Chassis access:** Light only (Ghost Assassin group)
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect:** Bullets fired with this augment active ignore **20% of enemy shield absorption**. Every call to `fire()` checks `_perkState.ballisticWeave` and sets `_wEff._shieldPierce = 0.20` on the weapon effect object. The shield-pierce value reduces the effective shield damage reduction by that fraction, meaning more raw damage bleeds through to enemy HP. The +10% bullet speed described in the tooltip is not found applied in the fire function at audit time.
- **Implementation:** `combat.js` line 137.

---

### THERMAL CORE
- **Key:** `thermal_core`
- **Weight:** 25
- **Chassis access:** Light only (Inferno Wall group)
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect:** When equipped with a Flamethrower (FTH), every hit **guarantees ignition** (ignite chance forced to 1.0 regardless of other perk settings). Ignited enemies burn for **7 seconds** instead of the default 5 seconds (+2s). Works in combination with `pyromaniac_chip`.
- **Implementation:** `combat.js` lines 1381–1383.

---

### GHOST CIRCUIT
- **Key:** `ghost_circuit`
- **Weight:** 25
- **Chassis access:** Light only
- **Loot base stats:** `dodgePct: 3, speedPct: 3`
- **Gameplay effect (described):** After landing from a JUMP, the player becomes **invisible to enemies for 2 seconds**, preventing them from being targeted during that window.
- **Implementation status:** `_perkState.ghostCircuit = true` is set in `applyAugment()` (`mods.js` line 408). **Flag set; invisibility-on-land logic not found in codebase.**

---

### PREDATOR LENS
- **Key:** `predator_lens`
- **Weight:** 28
- **Chassis access:** Light only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect (described):** Enemies located more than **400px away** are highlighted visually. Highlighted enemies take **+10% damage** from all sources.
- **Implementation status:** `_perkState.predatorLens = true` is set in `applyAugment()` (`mods.js` line 411). **Flag set; highlight rendering and damage bonus logic not found in codebase.**

---

### FUEL INJECTOR
- **Key:** `fuel_injector`
- **Weight:** 30
- **Chassis access:** Light only (Inferno Wall group)
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect:** Extends the Flamethrower's effective range by **×1.40** (+40%) and increases the cone spray density by changing the raycast step count from 2 to **4** (doubling the number of flame segments per tick, effectively widening the cone). Also adds **+0.30** to `_perkState.fthCone`, further widening the spread angle.
- **Implementation:** `combat.js` lines 170–173; `mods.js` lines 401–403.

---

### TARGETING SCOPE
- **Key:** `targeting_scope`
- **Weight:** 30
- **Chassis access:** Light only (Ghost Assassin group)
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect:** Applies a distance-scaling damage bonus exclusively to **Sniper Rifle (SR)** and **Railgun (RAIL)** shots. The bonus is **+15% per 200px** of distance between the player torso and the cursor aim point, with no apparent cap. At 600px the bonus is approximately +45%. The multiplier is `1 + (distance / 200) × 0.15`.
- **Implementation:** `combat.js` lines 100–103.

---

### SHADOW CORE
- **Key:** `shadow_core`
- **Weight:** 30
- **Chassis access:** Light only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect:** While the player is moving (physics velocity magnitude > 20 px/s), all incoming damage is reduced by **12%** (`amt × 0.88`). The check runs every time `processPlayerDamage()` is called, before other damage-reduction layers such as the Heavy chassis passive DR and shield absorption.
- **Implementation:** `combat.js` lines 488–491.

---

### NEURAL ACCEL
- **Key:** `neural_accel`
- **Weight:** 35
- **Chassis access:** Light only (Ghost Assassin group)
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect:** Immediately after landing from a JUMP, a **3-second window** opens (`_perkState._neuralAccelActive = true`). During this window, all weapon fire deals **×2.0 damage** (double damage). The window closes either when the 3-second timer expires (via `setTimeout`) or on the next jump. This is the highest single-augment damage multiplier available for Light chassis builds.
- **Implementation:** `mods.js` lines 332–337 (window open on land); `combat.js` line 96 (multiplier application).

---

### PYROMANIAC CHIP
- **Key:** `pyromaniac_chip`
- **Weight:** 35
- **Chassis access:** Light only (Inferno Wall group)
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect:** When a **burning** enemy dies, the game searches for the nearest non-burning active enemy and spreads the fire status to it. Exactly **one** adjacent enemy is ignited per death. This chains through groups of enemies as long as a burning enemy dies while others are nearby, enabling chain-ignite combos with Flamethrower.
- **Implementation:** `combat.js` lines 1059–1081.

---

*Step 1 complete — Light chassis augments documented.*

---

## Section 2 — Medium Chassis Augments

Medium chassis augment pool (`CHASSIS_AUGS.medium`):
`none, target_painter, threat_analyzer, overclock_cpu, reactive_plating, combat_ai, drone_relay, multi_drone, tactical_uplink, field_processor, system_sync, adaptive_core, echo_targeting`

Augments shared with other chassis (target_painter, threat_analyzer, reactive_plating) are described in full in Section 1 and cross-referenced here.

---

### TARGET PAINTER *(Medium access)*
- **Key:** `target_painter` — see Section 1 for full description.
- **Loot base stats:** `dmgPct: 3, accuracy: 3`

---

### THREAT ANALYZER *(Medium access)*
- **Key:** `threat_analyzer` — see Section 1 for full description.
- **Loot base stats:** `critChance: 2, accuracy: 3`

---

### OVERCLOCK CPU
- **Key:** `overclock_cpu`
- **Weight:** 30
- **Chassis access:** Medium only (universal in name, Medium-gated in CHASSIS_AUGS)
- **Loot base stats:** `reloadPct: -5, modCdPct: -3`
- **Gameplay effect:** On deploy, `applyAugment()` multiplies `_perkState.reloadMult` by **0.88**, applying a **12% reduction** to all weapon reload intervals and mod cooldown calculations. This stacks multiplicatively with any other reload or cooldown multipliers from perks or gear. The reduction is baked into the multiplier at deploy time and does not require any active trigger.
- **Implementation:** `mods.js` lines 384–387.

---

### REACTIVE PLATING *(Medium access)*
- **Key:** `reactive_plating` — see Section 1 for full description.
- **Loot base stats:** `dr: 0.03, coreHP: 10`

---

### COMBAT AI
- **Key:** `combat_ai`
- **Weight:** 25
- **Chassis access:** Medium only (Drone Commander group)
- **Loot base stats:** `critChance: 3, dmgPct: 2`
- **Gameplay effect:** When the Attack Drone mod (`atk_drone`) is active and `_perkState.combatAI` is set, the drone AI's target-selection routine checks `_perkState._paintedEnemy` first. If the painted (most-recently-hit) enemy is still alive and active, the drone overrides its nearest-enemy logic and fires exclusively at that target. This makes the drone synchronize with the player's current focus, enabling coordinated burst on priority targets. Requires Target Painter (or any source that sets `_perkState._paintedEnemy`) to be meaningful.
- **Implementation:** `mods.js` lines 555–556.

---

### FIELD PROCESSOR
- **Key:** `field_processor`
- **Weight:** 25
- **Chassis access:** Medium only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect (described):** After landing **3 hits on the same enemy**, deal **+15% damage** to that target permanently for the remainder of the round.
- **Implementation status:** `_perkState.fieldProcessor = true` is set in `applyAugment()` (`mods.js` line 417). **Flag set; hit-counter tracking and damage bonus logic not found in codebase.**

---

### ECHO TARGETING
- **Key:** `echo_targeting`
- **Weight:** 26
- **Chassis access:** Medium only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect (described):** Hitting an enemy **reveals all enemies within 300px** of the hit target for **3 seconds**, making them visible through cover or visual effects.
- **Implementation status:** `_perkState.echoTargeting = true` is set in `applyAugment()` (`mods.js` line 420). **Flag set; reveal propagation logic not found in codebase.**

---

### TACTICAL UPLINK
- **Key:** `tactical_uplink`
- **Weight:** 28
- **Chassis access:** Medium only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect:** Permanently reduces the Medium chassis `modCooldownMult` by an additional **10%** (multiplicative). The chassis base value is 0.85; this augment sets it to `max(0.60, 0.85 × 0.90)` = **0.765**. Because this directly mutates `CHASSIS.medium.modCooldownMult`, it stacks with the chassis's base Cooldown Mastery trait. The `goToMainMenu()` function restores the original value on session end. Minimum floor is 0.60 (40% total reduction).
- **Implementation:** `mods.js` lines 414–416.

---

### DRONE RELAY
- **Key:** `drone_relay`
- **Weight:** 30
- **Chassis access:** Medium only (Drone Commander group)
- **Loot base stats:** `dmgPct: 2, modCdPct: -3`
- **Gameplay effect:** When the Attack Drone mod is activated, this augment modifies the spawned drone in two ways: (1) the drone's fire interval is reduced to **60% of normal** (`droneReload × 0.60`), making it shoot **40% faster**; and (2) the drone is given an explicit **60 HP pool** instead of operating as an invincible timer-based unit. The drone can now be destroyed by enemy fire, and will die when its 60 HP is depleted.
- **Implementation:** `mods.js` lines 526–527.

---

### SYSTEM SYNC
- **Key:** `system_sync`
- **Weight:** 30
- **Chassis access:** Medium only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect (described):** Each time the player activates any mod (JUMP, SHIELD, RAGE, EMP, REPAIR, DRONE, etc.), **20 HP is immediately healed** to the most-damaged limb component.
- **Implementation status:** `_perkState.systemSync = true` is set in `applyAugment()` (`mods.js` line 418). **Flag set; mod-activation heal hook not found in codebase.**

---

### ADAPTIVE CORE
- **Key:** `adaptive_core`
- **Weight:** 32
- **Chassis access:** Medium only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect (described):** Each round the player survives increases **base damage reduction** by **+3%**, up to a maximum of **+15%** (5 rounds of survival). Resets on death.
- **Implementation status:** `_perkState.adaptiveCoreAug = true` is set in `applyAugment()` (`mods.js` line 419). **Flag set; per-round DR accumulation logic not found in codebase.**

---

### MULTI-DRONE
- **Key:** `multi_drone`
- **Weight:** 50
- **Chassis access:** Medium only (Drone Commander group)
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect:** When the Attack Drone mod is activated with this augment equipped, the game spawns **two drones simultaneously** instead of one. The drones are placed at offset positions relative to the player (`±45–50px` horizontal, `−52–55px` vertical). Both drones function identically — auto-targeting nearest enemy, firing on their shared reload interval — but operate as independent entities. This doubles the drone DPS output for the duration.
- **Implementation:** `mods.js` lines 169–171 and 680–682.

---

*Step 2 complete — Medium chassis augments documented.*

---

## Section 3 — Heavy Chassis Augments

Heavy chassis augment pool (`CHASSIS_AUGS.heavy`):
`none, reactive_plating, scrap_cannon, war_machine, iron_fortress, suppressor_aura, colossus_frame, impact_core, blast_dampener, heavy_loader, chain_drive`

Three of these (`blast_dampener`, `heavy_loader`, `chain_drive`) are present in the `AUG_OPTIONS` list and the chassis gate set but do **not** have entries in the `AUGMENTS` constant object. They have no `desc` string in that object; their functionality is inferred entirely from `applyAugment()` and usage sites.

---

### REACTIVE PLATING *(Heavy access)*
- **Key:** `reactive_plating` — see Section 1 for full description.
- **Loot base stats:** `dr: 0.03, coreHP: 10`

---

### SCRAP CANNON
- **Key:** `scrap_cannon`
- **Weight:** 40
- **Chassis access:** Heavy, Medium (universal)
- **Loot base stats:** `dmgPct: 4`
- **Gameplay effect:** Whenever an enemy limb (arm, leg, head, core) is destroyed and its HP reaches 0, an **AoE explosion** is triggered at the enemy's position (`createExplosion(scene, e.x, e.y, 45, 30)`). The explosion deals **30 damage** in a **45px radius** to all nearby enemies. A one-shot guard flag (`e["_scrapFired_" + target]`) prevents duplicate explosions from the same limb. The augment also works on enemies that carry a `_augState.scrapCannon` flag (enemy units with this aug equipped), creating the same explosion when their limbs are destroyed by the player.
- **Implementation:** `combat.js` lines 971–974 and 994.

---

### WAR MACHINE
- **Key:** `war_machine`
- **Weight:** 35
- **Chassis access:** Heavy only
- **Loot base stats:** `dmgPct: 5, dr: 0.02`
- **Gameplay effect:** Grants **passive core HP regeneration** at **2 HP/s** after **4 seconds** without taking damage. The aug description matches the Heavy chassis base trait defined in `CHASSIS.heavy` (`passiveRegenRate: 2, passiveRegenDelay: 4000`). Mechanically, `_applyHeavyChassisRegen()` in `combat.js` (lines 1462–1470) runs every frame for any heavy chassis player, checking `loadout.chassis === 'heavy'` — it does **not** check `_perkState.warMachine`. This means the regen is a **base Heavy chassis trait** that operates whether or not the augment is equipped; the augment's value is delivered primarily through the loot base stats (`+5% damage, +2% DR`).
- **Implementation:** `combat.js` lines 1462–1470 (regen); `mods.js` line 422 (flag).

---

### IRON FORTRESS
- **Key:** `iron_fortress`
- **Weight:** 40
- **Chassis access:** Heavy only
- **Loot base stats:** `dr: 0.05, coreHP: 15`
- **Gameplay effect:** Tracks how long the player has been stationary each frame in `events.js`. After **1.5 seconds** without movement (velocity magnitude ≤ 15 px/s), `_perkState._ironFortressActive` is set to `true`. While active, all incoming damage is reduced by **15%** (`amt × 0.85`) in `processPlayerDamage()`. Moving again resets the timer and clears the active flag immediately. The tooltip also describes a **+10% damage bonus** when stationary, but no code applying a damage-out multiplier based on `_ironFortressActive` was found in the codebase at audit time.
- **Implementation:** `events.js` lines 268–278 (stationary timer); `combat.js` line 586 (DR application).

---

### SUPPRESSOR AURA
- **Key:** `suppressor_aura`
- **Weight:** 38
- **Chassis access:** Heavy only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect (described):** Enemies within **200px** of the player have their move speed reduced by **15%** passively. Functions as a permanent intimidation field while the augment is equipped and the player is alive.
- **Implementation status:** `_perkState.suppressorAura = true` is set in `applyAugment()` (`mods.js` line 424). **Flag set; enemy speed-reduction aura logic not found in codebase.**

---

### COLOSSUS FRAME
- **Key:** `colossus_frame`
- **Weight:** 45
- **Chassis access:** Heavy only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect:** On deploy, directly and immediately increases the player's component HP pools: **Core HP +60** (current and max), **Left Arm HP +40**, **Right Arm HP +40**, **Legs HP +40**. These are permanent additions for the duration of the deployment — the player spawns with the boosted HP. No ongoing proc or trigger; all values are applied once in `applyAugment()`.
- **Implementation:** `mods.js` lines 425–436.

---

### IMPACT CORE
- **Key:** `impact_core`
- **Weight:** 32
- **Chassis access:** Heavy only
- **Loot base stats:** *(not in loot ITEM_BASES at audit time)*
- **Gameplay effect (described):** Killing an enemy at **close range (<200px)** restores **15 core HP** and briefly stuns nearby enemies for **0.5 seconds**.
- **Implementation status:** `_perkState.impactCore = true` is set in `applyAugment()` (`mods.js` line 437). **Flag set; close-kill heal and stun logic not found in codebase.**

---

### BLAST DAMPENER
- **Key:** `blast_dampener`
- **Weight:** 30
- **Chassis access:** Heavy only (Heavy Weapon Mastery group)
- **Loot base stats:** *(not in AUGMENTS object; no loot ITEM_BASES entry at audit time)*
- **Gameplay effect:** When the player takes self-damage from their own explosive weapon (Rocket Launcher `rl` with `selfDamage: true`), the splash damage is multiplied by **0.40** — a **60% reduction** in self-inflicted explosion damage. Normal enemy damage is unaffected. This makes the Rocket Launcher viable at closer range for heavy builds without relying on cover to avoid self-damage.
- **Implementation:** `combat.js` line 1168.

---

### HEAVY LOADER
- **Key:** `heavy_loader`
- **Weight:** 35
- **Chassis access:** Heavy only (Heavy Weapon Mastery group)
- **Loot base stats:** *(not in AUGMENTS object; no loot ITEM_BASES entry at audit time)*
- **Gameplay effect:** On deploy, multiplies `_perkState.reloadMult` by **0.80**, applying a **20% reduction** to all weapon reload intervals. This stacks multiplicatively with other reload modifiers. Unlike `overclock_cpu` (12%), Heavy Loader is a stronger reload boost at the cost of 5 additional weight points.
- **Implementation:** `mods.js` lines 443–444.

---

### CHAIN DRIVE
- **Key:** `chain_drive`
- **Weight:** 32
- **Chassis access:** Heavy only (Heavy Weapon Mastery group)
- **Loot base stats:** *(not in AUGMENTS object; no loot ITEM_BASES entry at audit time)*
- **Gameplay effect (described):** Listed in the Heavy augment pool alongside Blast Dampener and Heavy Loader as a heavy weapon mastery augment. Likely provides a bonus specific to two-handed Chain (`chain`) weapons.
- **Implementation status:** `_perkState.chainDrive = true` is set in `applyAugment()` (`mods.js` line 447). **Flag set; no additional logic reading `chainDrive` found in codebase.**

---

*Step 3 complete — Heavy chassis augments documented.*

---

## Section 4 — Summary Comparison Table

| Name | Chassis | Key Stats | One-Line Summary |
|------|---------|-----------|-----------------|
| Target Painter | Light, Medium | dmgPct +3, accuracy +3 | First hit marks enemy; all damage to marked target is ×1.20. |
| Threat Analyzer | Light, Medium | critChance +2, accuracy +3 | First hit permanently reduces enemy damage resistance by ~17.6%. |
| Reflex Amp | Light | reloadPct −4, dodgePct +2 | First shot after JUMP or dodge deals +40% damage. *(flag set; not yet implemented)* |
| Kill Sprint | Light | — | Each kill grants +8% speed for 4s, stacking up to 3×. *(flag set; not yet implemented)* |
| Ballistic Weave | Light | — | Bullets ignore 20% of enemy shield absorption. |
| Thermal Core | Light | — | Flamethrower always ignites on hit; burn lasts 7s instead of 5s. |
| Ghost Circuit | Light | dodgePct +3, speedPct +3 | After a JUMP landing, invisible to enemies for 2s. *(flag set; not yet implemented)* |
| Predator Lens | Light | — | Enemies >400px are highlighted and take +10% damage. *(flag set; not yet implemented)* |
| Fuel Injector | Light | — | Flamethrower range ×1.40 and cone density doubled. |
| Targeting Scope | Light | — | SR/RAIL gain +15% damage per 200px distance to target. |
| Shadow Core | Light | — | While moving, all incoming damage reduced by 12%. |
| Neural Accel | Light | — | 3-second window after JUMP landing: all weapons deal ×2.0 damage. |
| Pyromaniac Chip | Light | — | Burning enemies spread fire to one adjacent enemy on death. |
| Overclock CPU | Medium | reloadPct −5, modCdPct −3 | All reload times and mod cooldowns reduced by 12%. |
| Combat AI | Medium | critChance +3, dmgPct +2 | Attack Drone locks onto the player's current painted target. |
| Field Processor | Medium | — | 3 hits on same enemy grants +15% permanent damage vs that target. *(flag set; not yet implemented)* |
| Echo Targeting | Medium | — | Hitting an enemy reveals all enemies within 300px for 3s. *(flag set; not yet implemented)* |
| Tactical Uplink | Medium | — | Reduces Medium chassis mod cooldown multiplier by 10% (stacks with Cooldown Mastery). |
| Drone Relay | Medium | dmgPct +2, modCdPct −3 | Attack Drone fires 40% faster and gains 60 HP (can be destroyed). |
| System Sync | Medium | — | Activating any mod heals 20 HP to the most-damaged limb. *(flag set; not yet implemented)* |
| Adaptive Core | Medium | — | Each round survived adds +3% base DR (max +15%). *(flag set; not yet implemented)* |
| Multi-Drone | Medium | — | Attack Drone mod spawns two drones simultaneously instead of one. |
| Reactive Plating | Light, Medium, Heavy | dr +0.03, coreHP +10 | Each hit taken adds a 5% DR stack, up to 5 stacks (max +25% DR). |
| Scrap Cannon | Medium, Heavy | dmgPct +4 | Destroyed enemy limbs trigger a 30-damage explosion in a 45px radius. |
| War Machine | Heavy | dmgPct +5, dr +0.02 | Passive core regen at 2 HP/s after 4s without damage (base Heavy trait; aug adds stat bonuses). |
| Iron Fortress | Heavy | dr +0.05, coreHP +15 | Stationary 1.5s+: incoming damage reduced 15%. |
| Suppressor Aura | Heavy | — | Enemies within 200px move 15% slower. *(flag set; not yet implemented)* |
| Colossus Frame | Heavy | — | On deploy: Core HP +60, both arms +40 HP, legs +40 HP. |
| Impact Core | Heavy | — | Close-range kills (<200px) restore 15 core HP and briefly stun nearby enemies. *(flag set; not yet implemented)* |
| Blast Dampener | Heavy | — | Self-damage from explosions (Rocket Launcher) reduced by 60%. |
| Heavy Loader | Heavy | — | All weapon reload times reduced by 20%. |
| Chain Drive | Heavy | — | Heavy weapon mastery aug; active effect not yet implemented. *(flag set; not yet implemented)* |

---

### Notes on Implementation Status

- **Fully implemented:** Target Painter, Threat Analyzer, Ballistic Weave, Thermal Core, Fuel Injector, Targeting Scope, Shadow Core, Neural Accel, Pyromaniac Chip, Overclock CPU, Combat AI, Tactical Uplink, Drone Relay, Multi-Drone, Reactive Plating, Scrap Cannon, Colossus Frame, Blast Dampener, Heavy Loader, Iron Fortress (DR portion), War Machine (flag; underlying regen is a base heavy trait).
- **Flag set, effect not yet implemented:** Reflex Amp, Kill Sprint, Ghost Circuit, Predator Lens, Field Processor, Echo Targeting, System Sync, Adaptive Core, Suppressor Aura, Impact Core, Chain Drive, Iron Fortress (+10% damage bonus portion).
- **Missing from AUGMENTS constant:** Blast Dampener, Heavy Loader, Chain Drive have no entry in the `AUGMENTS` object and no `desc` string; their names and effects are inferred from `AUG_OPTIONS`, `applyAugment()`, and usage sites.

---

*Step 4 complete — Summary table appended. Audit session complete. No game files were modified.*
