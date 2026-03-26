# Medium Chassis — Skill Tree Design

## Overview

- **Total nodes:** 200
- **Max level:** 100 (1 skill point per level)
- **Unlockable at max:** ~50% (100 of 200 nodes)
- **Layout:** Constellation-style hex grid, pannable + zoomable
- **Center:** Large hex with Medium chassis mech image
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
| MG clusters | 11 | 4 | 4 sub-clusters (includes heat) |
| BR clusters | 10 | 4 | 4 sub-clusters |
| SR clusters | 7 | 3 | 3 sub-clusters |
| Rail clusters | 6 | 3 | 3 sub-clusters |
| General clusters | 48 | 13 | Shield, CPU mods, augment, survivability, crit, speed |
| Keystones | 12 | — | Build-defining |
| Generic connectors | 93 | — | Simple stat nodes linking clusters |
| **Total** | **200** | **27** | |

## Medium Chassis Weapons

Machine Gun, Battle Rifle, Sniper Rifle, Railgun (4 weapons)

## Medium Chassis CPU Mods

Barrier, Attack Drone, Repair Drone, Rage (4 mods)

## Medium Chassis Shields

Adaptive Shield, Overcharge Shield, Layered Shield, Fortress Shield (4 shields)

---

## WEAPON CLUSTERS

---

### MG SUB-CLUSTER 1: Raw Damage (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% MG Damage | Barrel Rifling | MG rounds deal 3% more damage |
| 2 | +4% MG Damage | Hardened Casings | Tougher MG ammunition |
| 3 | +6% MG Damage | Depleted Core Rounds | Dense MG projectiles |
| N | +8% MG Damage, +3% MG Crit Damage | Armor-Piercing Belt | Rounds that punch through anything |

### MG SUB-CLUSTER 2: Fire Rate (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% MG Fire Rate | Belt Feeder | MG cycles 3% faster |
| 2 | +5% MG Fire Rate | Motorized Action | Accelerated feed mechanism |
| 3 | +5% MG Fire Rate | Quick Belt Swap | Faster MG cycling |
| N | +6% MG Fire Rate | Suppression Fire | Maximum sustained output |

### MG SUB-CLUSTER 3: Crit Synergy (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +2% MG Crit Chance | Tracer Rounds | MG crits 2% more often |
| 2 | +4% MG Crit Damage | Vital Strikes | MG crits deal 4% more bonus damage |
| N | +3% MG Crit Chance, +6% MG Crit Damage | Precision Burst | Controlled fire finds weak points |

### MG SUB-CLUSTER 4: Heat Management (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | -5% MG Heat Buildup | Ventilated Shroud | MG generates 5% less heat |
| 2 | +8% MG Heat Cooling | Coolant Jacket | MG cools 8% faster when not firing |
| 3 | -8% MG Heat Buildup | Composite Barrel | Advanced materials resist heat |
| N | -10% MG Heat Buildup, +10% MG Cooling | Thermal Regulation | Near-perfect MG heat control |

---

### BR SUB-CLUSTER 1: Raw Damage (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% BR Damage | Match Grade Ammo | BR rounds deal 3% more damage |
| 2 | +4% BR Damage | Enhanced Propellant | Higher muzzle velocity |
| 3 | +6% BR Damage | Tungsten Tips | Hardened BR projectiles |
| N | +8% BR Damage, +3% BR Crit Damage | Marksman Rounds | Precision ammunition for maximum impact |

### BR SUB-CLUSTER 2: Burst Grouping / Fire Rate (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% BR Fire Rate | Quick Burst | Faster burst cycling |
| 2 | +5% BR Fire Rate | Tactical Cycling | BR fires 5% faster |
| N | +5% BR Fire Rate | Rapid Engagement | Maximum burst speed |

### BR SUB-CLUSTER 3: Crit Synergy (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +2% BR Crit Chance | Stabilized Optics | BR crits 2% more often |
| 2 | +4% BR Crit Damage | Expanding Rounds | BR crits deal 4% more |
| N | +3% BR Crit Chance, +6% BR Crit Damage | Sharpshooter | Every burst is lethal |

### BR SUB-CLUSTER 4: Fire Rate / Efficiency (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% BR Fire Rate | Speed Loader | BR fires 5% faster |
| 2 | +8% BR Fire Rate | Tactical Swap | Accelerated BR cycling |
| N | +10% BR Fire Rate | Rapid Engagement | Minimum downtime between engagements |

---

### SR SUB-CLUSTER 1: Raw Damage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% SR Damage | Heavy Barrel | Sniper rounds deal 3% more |
| 2 | +5% SR Damage | Magnum Cartridge | High-powered sniper ammunition |
| N | +8% SR Damage | Anti-Material Round | Maximum sniper impact |

### SR SUB-CLUSTER 2: Crit / Headshot (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% SR Crit Chance | Precision Scope | Sniper crits 3% more often |
| 2 | +5% SR Crit Damage | Vital Shot | Sniper crits deal 5% more |
| 3 | +3% SR Crit Chance | Spotter System | Enhanced target identification |
| N | +4% SR Crit Chance, +8% SR Crit Damage | One Shot One Kill | Every sniper round finds the mark |

### SR SUB-CLUSTER 3: Fire Rate (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% SR Fire Rate | Quick Bolt | Sniper fires 5% faster |
| 2 | +3% SR Fire Rate | Smooth Action | Faster follow-up shots |
| N | +8% SR Fire Rate | Rapid Cycling | Minimum downtime between shots |

---

### RAIL SUB-CLUSTER 1: Raw Damage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% Rail Damage | Capacitor Upgrade | Railgun deals 3% more damage |
| 2 | +5% Rail Damage | Magnetic Amplifier | Stronger magnetic acceleration |
| N | +8% Rail Damage | Gauss Overdrive | Maximum railgun impact |

### RAIL SUB-CLUSTER 2: Crit Synergy (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% Rail Crit Chance | Trajectory Plotter | Rail crits 3% more often |
| 2 | +5% Rail Crit Damage | Core Penetrator | Rail crits deal 5% more |
| N | +4% Rail Crit Chance, +8% Rail Crit Damage | Perfect Trajectory | Every rail shot is devastating |

### RAIL SUB-CLUSTER 3: Fire Rate (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% Rail Fire Rate | Quick Capacitor | Railgun fires 5% faster |
| 2 | +8% Rail Fire Rate | Rapid Recharge | Faster magnetic cycling |
| N | +10% Rail Fire Rate | Instant Chamber | Maximum railgun fire rate |

---

## GENERAL CLUSTERS

---

### SHIELD SUB-CLUSTER 1: HP / Absorb (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +10 Shield HP | Shield Capacitor | Shield gains 10 max HP |
| 2 | +15 Shield HP | Shield Matrix | Reinforced shield barrier |
| 3 | +2% Shield Absorb | Layered Plating | Shield absorbs 2% more |
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

### CPU MOD: Barrier-Specific (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +1.5s Barrier Duration | Extended Field | Barrier lasts 1.5 seconds longer |
| 2 | -5% Barrier Cooldown | Quick Deploy | Barrier ready sooner |
| N | +2s Barrier Duration, -8% Barrier CD | Fortress Protocol | Maximum barrier uptime |

### CPU MOD: Attack Drone Damage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +8% Drone Damage | Drone Calibration | Attack drone deals 8% more |
| 2 | +12% Drone Damage | Upgraded Armament | Drone weapons enhanced |
| N | +15% Drone Damage, +5% Drone Fire Rate | Combat Drone MK2 | Maximum drone lethality |

### CPU MOD: Attack Drone Duration / Count (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +2s Drone Duration | Extended Battery | Drone lasts 2 seconds longer |
| 2 | +3s Drone Duration | Fusion Cell | Prolonged drone deployment |
| N | +4s Duration, drone targets nearest enemy automatically | Smart Targeting | Drone finds its own targets |

### CPU MOD: Repair Drone Heal Amount (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +8% Repair Heal | Improved Nanites | Repair drone heals 8% more |
| 2 | +12% Repair Heal | Medical Grade Nanites | Enhanced repair output |
| N | +15% Repair Heal, repair also restores 5 shield HP/s | Combat Medic | Full spectrum repair |

### CPU MOD: Repair Drone Speed / Duration (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +2s Repair Duration | Extended Repair Cycle | Repair lasts 2 seconds longer |
| 2 | +10% Repair Speed | Rapid Nanites | Faster heal ticks |
| N | +3s Duration, +15% Repair Speed | Sustained Recovery | Prolonged high-output healing |

### CPU MOD: Rage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +1s Rage Duration | Extended Fury | Rage lasts 1 second longer |
| 2 | +5% Rage Damage Bonus | Amplified Rage | Rage damage boost increased |
| N | +2s Rage Duration, +8% Rage Damage | Berserker Protocol | Maximum rage output |

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

### KEYSTONE 1: BULLET STORM (MG Mastery)
**Effect:** MG damage +15%. MG fires two rounds per shot.
**Location:** Far edge of MG cluster region.

### KEYSTONE 2: MARKSMAN (Battle Rifle Mastery)
**Effect:** BR damage +15%. Every 3rd consecutive hit on the same target deals double damage.
**Location:** Far edge of BR cluster region.

### KEYSTONE 3: DEADEYE (Sniper Rifle Mastery)
**Effect:** SR damage +15%. SR crit chance +10%. Crits deal +25% bonus damage.
**Location:** Far edge of SR cluster region.

### KEYSTONE 4: RAILBREAKER (Railgun Mastery)
**Effect:** Rail damage +20%. Each enemy the rail pierces through takes +10% more damage than the last.
**Location:** Far edge of Rail cluster region.

### KEYSTONE 5: FORTRESS (Barrier Mastery)
**Effect:** Barrier duration +3s. Activating barrier grants +10% damage for the barrier duration.
**Location:** Far edge of Barrier cluster region.

### KEYSTONE 6: DRONE SWARM (Attack Drone Mastery)
**Effect:** Attack drone spawns 2 drones. Drone damage +20%. Drone duration +5s.
**Location:** Far edge of Attack Drone cluster region.

### KEYSTONE 7: FIELD SURGEON (Repair Drone Mastery)
**Effect:** Repair heals +30%. Repair also removes all debuffs. Repair grants 3s of +15% DR after ending.
**Location:** Far edge of Repair Drone cluster region.

### KEYSTONE 8: RAMPAGE (Rage Mastery)
**Effect:** Rage damage bonus +20%. Kills during Rage extend duration by 1.5s. Rage grants +10% move speed.
**Location:** Far edge of Rage cluster region.

### KEYSTONE 9: EXECUTIONER (Crit Assassin)
**Effect:** Crit chance +8%. Crit damage +20%. Crits against targets below 25% HP deal triple damage.
**Location:** Far edge of Crit cluster region.

### KEYSTONE 10: IRON WALL (Survivability)
**Effect:** +30 All HP. +5% DR. Shield regen delay reduced by 1s.
**Location:** Far edge of Survivability region.

### KEYSTONE 11: TACTICIAN (Mod Specialist)
**Effect:** All mod cooldowns -15%. Mod effects last 30% longer. Using a mod grants +5% damage for 3s.
**Location:** Far edge of CPU Mod general region.

### KEYSTONE 12: ADAPTIVE COMMANDER
**Effect:** Kills reduce all active cooldowns by 0.5s. +10% All Damage. +5% Move Speed.
**Location:** Center-outer region, accessible from multiple paths.

---

## GENERIC CONNECTOR NODES (93 nodes)

These are simple stat nodes that form the paths between clusters.

| Stat Type | Approximate Count | Example Values |
|-----------|-------------------|----------------|
| Core HP | ~10 | +8, +10, +12, +15 |
| Arm HP | ~7 | +6, +8, +10 |
| Leg HP | ~7 | +8, +10, +12 |
| All HP | ~5 | +5, +8, +10 |
| Shield HP | ~10 | +5, +8, +10, +12 |
| DR | ~6 | +1%, +1%, +2% |
| All Damage | ~8 | +2%, +3%, +3% |
| Crit Chance | ~5 | +1%, +2% |
| Crit Damage | ~5 | +2%, +3% |
| Move Speed | ~5 | +2%, +3% |
| Fire Rate | ~6 | +2%, +3% |
| Dodge | ~4 | +1%, +2% |
| Shield Regen | ~5 | +3%, +5% |
| Mod Cooldown | ~4 | -2%, -3% |
| Loot Quality | ~3 | +3%, +5% |
| Scrap Bonus | ~3 | +5%, +8% |
| **Total** | **~93** | |

---

## VISUAL DESIGN

Same as Light chassis tree — see LIGHT_SKILL_TREE.md for full visual spec.
Center node contains Medium chassis mech image instead of Light.
