# Heavy Chassis — Skill Tree Design

## Overview

- **Total nodes:** 200
- **Max level:** 100 (1 skill point per level)
- **Unlockable at max:** ~50% (100 of 200 nodes)
- **Layout:** Constellation-style hex grid, pannable + zoomable
- **Center:** Large hex with Heavy chassis mech image
- **Branches:** Radiate outward in all directions, cross-connect between branches

## Node Types

| Type | Size | Border Color | Purpose |
|------|------|-------------|---------|
| Regular | Small hex | Green (allocated) / Cyan (available) / Gray (locked) | Basic stat bonuses |
| Notable | Medium hex | Orange (#e8923a) | Sub-cluster capstone, stronger effect |
| Keystone | Large hex | Purple (#cc88ff) | Build-defining, far edges of tree |

## Node Budget

| Category | Nodes | Notables | Notes |
|----------|-------|----------|-------|
| HR clusters | 6 | 3 | 3 sub-clusters |
| RL clusters | 9 | 4 | 4 sub-clusters |
| PLSM clusters | 6 | 3 | 3 sub-clusters |
| GL clusters | 6 | 3 | 3 sub-clusters |
| General clusters | 51 | 15 | Shield, CPU mods, augment, survivability, crit, speed |
| Keystones | 12 | — | Build-defining |
| Generic connectors | 97 | — | Simple stat nodes linking clusters |
| **Total** | **200** | **28** | |

## Heavy Chassis Weapons

Heavy Rifle, Rocket Launcher, Plasma Cannon, Grenade Launcher (4 weapons)

## Heavy Chassis CPU Mods

Missile, Fortress Mode, Barrier, EMP Burst (4 mods)

## Heavy Chassis Shields

Thermal Shield, Bulwark Shield, Titan Shield, Rhino Shield (4 shields)

---

## NEW SHIELD: RHINO SHIELD

| Property | Value |
|----------|-------|
| HP | 160 |
| Regen Rate | 0.6 HP/s |
| Regen Delay | 6s |
| Absorb | 50% |
| Reflect | 20% of raw incoming damage reflected to attacker |
| On Break | AOE burst dealing damage scaled to total damage absorbed since last full recharge |

**Identity:** A thorns shield. High HP pool stays up a long time, steadily punishing attackers with reflected damage. When it finally breaks, the stored punishment releases as an AOE explosion. Rewards being in the thick of combat and taking hits rather than avoiding them.

**Implementation notes:**
- Track total raw damage received while shield is up since last full recharge
- On break, deal a percentage of that stored total as AOE damage (radius and scaling TBD during balancing)
- Reflect damage is applied per-hit to the specific enemy that dealt the damage
- Reflect triggers on every hit while shield HP > 0, regardless of absorb percentage

---

## WEAPON CLUSTERS

---

### HR SUB-CLUSTER 1: Raw Damage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% HR Damage | Bore Sighting | HR rounds deal 3% more damage |
| 2 | +5% HR Damage | Reinforced Chamber | Higher-powered HR cartridges |
| N | +8% HR Damage | Penetrator Rounds | Maximum HR impact per shot |

### HR SUB-CLUSTER 2: Fire Rate (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% HR Fire Rate | Smooth Action | HR fires 3% faster |
| 2 | +5% HR Fire Rate | Gas Operated Cycling | Accelerated HR mechanism |
| N | +8% HR Fire Rate | Rapid Semi-Auto | Maximum HR follow-up speed |

### HR SUB-CLUSTER 3: Crit Synergy (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +2% HR Crit Chance | Precision Sights | HR crits 2% more often |
| 2 | +4% HR Crit Damage | Hollow Points | HR crits deal 4% more |
| N | +3% HR Crit Chance, +6% HR Crit Damage | Executioner Rounds | Every HR shot finds the vitals |

---

### RL SUB-CLUSTER 1: Raw Damage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% RL Damage | Warhead Upgrade | Rockets deal 3% more damage |
| 2 | +5% RL Damage | High Explosive Fill | Increased warhead payload |
| N | +8% RL Damage | Thermobaric Warhead | Maximum rocket devastation |

### RL SUB-CLUSTER 2: Blast Radius / AOE (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% RL Blast Radius | Fragmentation Shell | Wider explosion radius |
| 2 | +8% RL Blast Radius | Cluster Warhead | Expanded blast zone |
| 3 | +5% RL AOE Damage | Shrapnel Casing | More damage at blast edges |
| N | +10% RL Blast Radius, +8% AOE Damage | Carpet Bomber | Everything in range is destroyed |

### RL SUB-CLUSTER 3: Fire Rate (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% RL Fire Rate | Quick Tube | Rockets load 3% faster |
| 2 | +5% RL Fire Rate | Auto-Loader | Accelerated rocket cycling |
| N | +8% RL Fire Rate | Rapid Barrage | Maximum rocket output |

### RL SUB-CLUSTER 4: Direct Hit Bonus (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +8% RL Direct Hit Damage | Impact Fuze | Bonus damage on direct hits |
| 2 | +12% RL Direct Hit Damage | Shaped Charge | Focused blast on contact |
| N | +15% RL Direct Hit Damage, +3% RL Crit Chance | Precision Strike | Direct hits are devastating |

---

### PLSM SUB-CLUSTER 1: Raw Damage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% PLSM Damage | Ionized Chamber | Plasma deals 3% more damage |
| 2 | +5% PLSM Damage | Superheated Plasma | Hotter plasma bolts |
| N | +8% PLSM Damage | Fusion Core | Maximum plasma intensity |

### PLSM SUB-CLUSTER 2: Fire Rate (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% PLSM Fire Rate | Rapid Ionization | Plasma fires 3% faster |
| 2 | +5% PLSM Fire Rate | Accelerated Chamber | Faster plasma cycling |
| N | +8% PLSM Fire Rate | Plasma Torrent | Maximum plasma output |

### PLSM SUB-CLUSTER 3: Projectile Speed (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +8% PLSM Projectile Speed | Magnetic Accelerator | Plasma bolts travel faster |
| 2 | +12% PLSM Projectile Speed | Rail Assisted Launch | Significantly faster plasma travel |
| N | +15% PLSM Projectile Speed, +3% PLSM Damage | Hypersonic Plasma | Near-instant plasma impact |

---

### GL SUB-CLUSTER 1: Raw Damage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% GL Damage | Enhanced Payload | Grenades deal 3% more damage |
| 2 | +5% GL Damage | High Explosive Mix | Increased grenade yield |
| N | +8% GL Damage | Demolition Rounds | Maximum grenade impact |

### GL SUB-CLUSTER 2: Blast Radius / AOE (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% GL Blast Radius | Wide Dispersal | Wider grenade explosion |
| 2 | +8% GL Blast Radius | Fragmentation Grenade | Expanded blast zone |
| N | +10% GL Blast Radius, +5% GL AOE Damage | Scorched Earth | Total area denial |

### GL SUB-CLUSTER 3: Fire Rate (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% GL Fire Rate | Quick Breach | Grenades launch 3% faster |
| 2 | +5% GL Fire Rate | Auto-Feed | Accelerated grenade cycling |
| N | +8% GL Fire Rate | Grenade Storm | Maximum launch rate |

---

## GENERAL CLUSTERS

---

### SHIELD SUB-CLUSTER 1: HP / Absorb (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +10 Shield HP | Shield Capacitor | Shield gains 10 max HP |
| 2 | +15 Shield HP | Shield Matrix | Reinforced shield barrier |
| 3 | +2% Shield Absorb | Dense Barrier | Shield absorbs 2% more |
| N | +20 Shield HP, +3% Absorb | Fortified Core | Maximum shield density |

### SHIELD SUB-CLUSTER 2: Regen Speed (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% Shield Regen Rate | Quick Recharge | Shield regenerates 5% faster |
| 2 | -0.3s Shield Regen Delay | Rapid Response | Shield starts recharging sooner |
| 3 | +8% Shield Regen Rate | Overclocked Capacitor | Accelerated recovery |
| N | +10% Shield Regen Rate, -0.5s Regen Delay | Instant Recovery | Shield bounces back fast |

### CPU MOD: General Cooldown (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | -3% Mod Cooldown | Processor Boost | All mod cooldowns reduced 3% |
| 2 | -5% Mod Cooldown | Overclocked CPU | Faster ability cycling |
| N | -8% All Mod Cooldowns | Neural Accelerator | Dramatically faster mod recharge |

### CPU MOD: Missile Damage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +8% Missile Damage | Warhead Enhancement | Missiles deal 8% more damage |
| 2 | +12% Missile Damage | Heavy Payload | Increased missile yield |
| N | +15% Missile Damage, +5% Missile Blast Radius | Cruise Missile | Maximum missile devastation |

### CPU MOD: Missile Cooldown / Count (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | -5% Missile Cooldown | Quick Lock | Missiles ready sooner |
| 2 | +1 Missile Count | Multi-Launcher | Fire one additional missile |
| N | -8% Missile CD, +1 Missile Count | Salvo System | More missiles, faster |

### CPU MOD: Fortress Mode DR / Duration (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% Fortress DR | Reinforced Stance | More damage reduction in Fortress Mode |
| 2 | +1.5s Fortress Duration | Extended Lockdown | Fortress lasts 1.5 seconds longer |
| N | +8% Fortress DR, +2s Duration | Immovable Object | Maximum Fortress protection |

### CPU MOD: Fortress Mode Damage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% Damage in Fortress Mode | Siege Targeting | Weapons hit harder while fortified |
| 2 | +8% Damage in Fortress Mode | Locked-In Targeting | Enhanced combat output in Fortress |
| N | +10% Damage in Fortress Mode, +3% Crit Chance | Artillery Platform | Fortress becomes an offensive powerhouse |

### CPU MOD: Barrier (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +1.5s Barrier Duration | Extended Field | Barrier lasts 1.5 seconds longer |
| 2 | -5% Barrier Cooldown | Quick Deploy | Barrier ready sooner |
| N | +2s Barrier Duration, -8% Barrier CD | Fortress Protocol | Maximum barrier uptime |

### CPU MOD: EMP Burst Range / Effect (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +10% EMP Range | Amplified Pulse | EMP reaches further |
| 2 | +0.5s EMP Stun Duration | Overloaded Burst | Enemies stunned longer |
| N | +15% EMP Range, +1s Stun Duration | System Crash | Massive EMP disruption |

### CPU MOD: EMP Burst Cooldown (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | -5% EMP Cooldown | Quick Charge | EMP ready sooner |
| 2 | -8% EMP Cooldown | Rapid Cycling | Faster EMP availability |
| N | -10% EMP CD, EMP also deals 20 damage | Shock Pulse | EMP that hurts |

### AUGMENT: General Boost (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% Augment Effect | Augment Amplifier | All augment effects increased 5% |
| 2 | +8% Augment Effect | Augment Overcharge | Stronger augment output |
| 3 | +3% All Damage while augment active | Synced Systems | Augment synergizes with weapons |
| N | +12% Augment Effect, +5% All Damage | Full Integration | Perfect augment-weapon sync |

### SURVIVABILITY: HP / DR (5 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +10 Core HP | Hull Plating | Core gains 10 HP |
| 2 | +8 Arm HP | Arm Reinforcement | Arms gain 8 HP |
| 3 | +10 Leg HP | Leg Reinforcement | Legs gain 10 HP |
| 4 | +1% DR | Hardened Alloy | Take 1% less damage |
| N | +15 All HP, +2% DR | Structural Integrity | Tougher across the board |

### CRIT: Chance / Damage (5 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +2% Crit Chance | Targeting Scope | All weapons crit 2% more |
| 2 | +2% Crit Chance | Combat Analysis | Improved target identification |
| 3 | +4% Crit Damage | Lethal Precision | Crits deal 4% more |
| 4 | +4% Crit Damage | Weak Point Scanner | Exploit structural weaknesses |
| N | +3% Crit Chance, +6% Crit Damage | Assassin's Eye | Every shot counts |

### SPEED / MOBILITY (5 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% Move Speed | Servo Boost | Slightly faster movement |
| 2 | +3% Move Speed | Hydraulic Upgrade | Improved leg servos |
| 3 | +3% All Fire Rate | Quick Hands | All weapons fire 3% faster |
| 4 | +4% All Fire Rate | Streamlined Action | Faster weapon cycling |
| N | +5% Move Speed, +5% All Fire Rate | Combat Efficiency | Faster in every way |

---

## KEYSTONES (12)

All keystones are pure power — no trade-offs or downsides.

---

### KEYSTONE 1: HEAVY GUNNER (Heavy Rifle Mastery)
**Effect:** HR damage +15%. Every 5th consecutive hit deals double damage.
**Location:** Far edge of HR cluster region.

### KEYSTONE 2: WARHEAD (Rocket Launcher Mastery)
**Effect:** RL damage +15%. Direct hits create a secondary explosion dealing 50% of hit damage in a smaller radius.
**Location:** Far edge of RL cluster region.

### KEYSTONE 3: PLASMA CORE (Plasma Cannon Mastery)
**Effect:** PLSM damage +15%. Plasma bolts leave a burning ground area for 2s dealing damage to enemies standing in it.
**Location:** Far edge of PLSM cluster region.

### KEYSTONE 4: BOMBARDIER (Grenade Launcher Mastery)
**Effect:** GL damage +15%. Grenades split into 3 mini-grenades on impact, each dealing 30% damage in a smaller radius.
**Location:** Far edge of GL cluster region.

### KEYSTONE 5: SALVO COMMANDER (Missile Mastery)
**Effect:** Missile damage +20%. Fires +2 additional missiles. Missiles track targets more aggressively.
**Location:** Far edge of Missile cluster region.

### KEYSTONE 6: CITADEL (Fortress Mode Mastery)
**Effect:** Fortress Mode DR +15%. While in Fortress Mode, all weapons deal +20% damage and fire +10% faster.
**Location:** Far edge of Fortress Mode cluster region.

### KEYSTONE 7: IRON CURTAIN (Barrier Mastery)
**Effect:** Barrier duration +3s. Activating barrier grants +10% damage for the barrier duration.
**Location:** Far edge of Barrier cluster region.

### KEYSTONE 8: BLACKOUT (EMP Burst Mastery)
**Effect:** EMP range +25%. EMP stun duration +2s. Stunned enemies take +15% damage from all sources.
**Location:** Far edge of EMP cluster region.

### KEYSTONE 9: JUGGERNAUT (Survivability)
**Effect:** +30 All HP. +5% DR. Shield regen delay reduced by 1s.
**Location:** Far edge of Survivability region.

### KEYSTONE 10: EXECUTIONER (Crit Assassin)
**Effect:** Crit chance +8%. Crit damage +20%. Crits against targets below 25% HP deal triple damage.
**Location:** Far edge of Crit cluster region.

### KEYSTONE 11: TACTICIAN (Mod Specialist)
**Effect:** All mod cooldowns -15%. Mod effects last 30% longer. Using a mod grants +5% damage for 3s.
**Location:** Far edge of CPU Mod general region.

### KEYSTONE 12: WARLORD
**Effect:** All weapon damage +10%. All AOE blast radius +15%. Kills grant +2% damage for 5s (stacks up to 5 times).
**Location:** Center-outer region, accessible from multiple paths.

---

## GENERIC CONNECTOR NODES (97 nodes)

These are simple stat nodes that form the paths between clusters.

| Stat Type | Approximate Count | Example Values |
|-----------|-------------------|----------------|
| Core HP | ~12 | +8, +10, +12, +15 |
| Arm HP | ~8 | +6, +8, +10 |
| Leg HP | ~8 | +8, +10, +12 |
| All HP | ~6 | +5, +8, +10 |
| Shield HP | ~10 | +5, +8, +10, +12 |
| DR | ~7 | +1%, +1%, +2% |
| All Damage | ~8 | +2%, +3%, +3% |
| Crit Chance | ~5 | +1%, +2% |
| Crit Damage | ~5 | +2%, +3% |
| Move Speed | ~5 | +2%, +3% |
| Fire Rate | ~6 | +2%, +3% |
| Dodge | ~3 | +1%, +2% |
| Shield Regen | ~5 | +3%, +5% |
| Mod Cooldown | ~4 | -2%, -3% |
| Loot Quality | ~3 | +3%, +5% |
| Scrap Bonus | ~2 | +5%, +8% |
| **Total** | **~97** | |

---

## VISUAL DESIGN

Same as Light and Medium chassis trees — see LIGHT_SKILL_TREE.md for full visual spec.
Center node contains Heavy chassis mech image.
