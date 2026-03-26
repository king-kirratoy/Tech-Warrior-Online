# Light Chassis — Skill Tree Design

## Overview

- **Total nodes:** 200
- **Max level:** 100 (1 skill point per level)
- **Unlockable at max:** ~50% (100 of 200 nodes)
- **Layout:** Constellation-style hex grid, pannable + zoomable
- **Center:** Large hex with Light chassis mech image
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
| SMG clusters | 11 | 4 | 4 sub-clusters |
| Shotgun clusters | 9 | 4 | 4 sub-clusters |
| Flamethrower clusters | 11 | 5 | 5 sub-clusters (includes heat) |
| Siphon clusters | 8 | 4 | 4 sub-clusters |
| General clusters | 32 | 11 | Shield, CPU mods, augment, survivability, crit, speed |
| Keystones | 12 | — | Build-defining |
| Generic connectors | 89 | — | Simple stat nodes linking clusters |
| **Total** | **200** | **28** | |

## Light Chassis Weapons

SMG, Shotgun, Flamethrower, Siphon (4 weapons only — no Sniper Rifle or Battle Rifle)

## Light Chassis CPU Mods

Jump, Barrier, Decoy, Ghost Step (no EMP)

---

## WEAPON CLUSTERS

---

### SMG SUB-CLUSTER 1: Raw Damage (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% SMG Damage | Barrel Boring | SMG rounds deal 3% more damage |
| 2 | +4% SMG Damage | Heavy Rounds | Higher caliber SMG ammunition |
| 3 | +6% SMG Damage | Tungsten Core | Hardened SMG projectiles |
| N | +8% SMG Damage, +3% SMG Crit Damage | Overcharged Rounds | Supercharged rounds hit and crit harder |

### SMG SUB-CLUSTER 2: Fire Rate (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% SMG Fire Rate | Trigger Tuning | SMG fires 3% faster |
| 2 | +5% SMG Fire Rate | Motorized Feed | Accelerated round cycling |
| 3 | +5% SMG Fire Rate | Quick Magazine | SMG fires 5% faster |
| N | +6% SMG Fire Rate, +5% SMG Fire Rate | Lead Storm | Maximum cycling speed |

### SMG SUB-CLUSTER 3: Crit Synergy (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +2% SMG Crit Chance | Precision Barrel | SMG crits 2% more often |
| 2 | +4% SMG Crit Damage | Vital Targeting | SMG crits deal 4% more bonus damage |
| N | +3% SMG Crit Chance, +6% SMG Crit Damage | Surgical Precision | Every burst finds the weak points |

### SMG SUB-CLUSTER 4: Heat Management (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | -5% SMG Heat Buildup | Ventilated Barrel | SMG generates 5% less heat |
| 2 | +8% SMG Heat Cooling | Heat Sink | SMG cools 8% faster when not firing |
| 3 | -8% SMG Heat Buildup | Ceramic Lining | Advanced barrel coating reduces heat |
| N | -10% SMG Heat Buildup, +10% SMG Cooling | Thermal Mastery | Near-perfect heat management |

---

### SHOTGUN SUB-CLUSTER 1: Raw Damage / Pellets (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% SG Damage | Reinforced Slugs | Shotgun pellets deal 3% more damage |
| 2 | +4% SG Damage | Hardened Shot | Denser pellet composition |
| 3 | +6% SG Damage | Magnum Load | High-powered shotgun shells |
| N | +8% SG Damage, +1 Pellet | Frag Rounds | More pellets, more damage per shell |

### SHOTGUN SUB-CLUSTER 2: Close Range Bonus (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% SG Damage within 100 units | Close Quarters | Bonus damage at point blank |
| 2 | +8% SG Damage within 100 units | Breach Specialist | Devastating up close |
| N | +12% SG Damage within 100 units, +3% SG Fire Rate | Pointblank Protocol | Maximum lethality at close range |

### SHOTGUN SUB-CLUSTER 3: Spread / Pellet Count (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | -5% SG Spread | Choke Barrel | Tighter pellet grouping |
| 2 | +1 SG Pellet | Extended Magazine | One additional pellet per shot |
| N | +2 SG Pellets, -8% SG Spread | Wall of Lead | Maximum pellet density |

### SHOTGUN SUB-CLUSTER 4: Crit (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +2% SG Crit Chance | Lucky Scatter | Pellets find weak spots more often |
| 2 | +4% SG Crit Damage | Explosive Tips | Critting pellets deal 4% more |
| N | +3% SG Crit Chance, +5% SG Crit Damage | Lethal Scatter | Every pellet is a potential kill shot |

---

### FLAMETHROWER SUB-CLUSTER 1: Raw Burn Damage (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% FTH Damage | Fuel Enrichment | Hotter flame, more damage |
| 2 | +5% FTH Damage | Superheated Fuel | Increased combustion temperature |
| N | +8% FTH Damage, +3% Burn Damage | Inferno Core | Maximum flame intensity |

### FLAMETHROWER SUB-CLUSTER 2: Burn Duration / Spread (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +0.5s Burn Duration | Sticky Fuel | Burns linger half a second longer |
| 2 | +1s Burn Duration | Napalm Mix | Persistent burning compound |
| 3 | Burn spreads to 1 nearby enemy | Wildfire Agent | Flames jump to adjacent targets |
| N | +1.5s Burn Duration, spread to 2 enemies | Contagion Flame | Uncontrollable fire spread |

### FLAMETHROWER SUB-CLUSTER 3: Range / Area (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% FTH Range | Extended Nozzle | Flame reaches further |
| 2 | +8% FTH Cone Width | Wide Dispersal | Broader flame coverage |
| N | +10% FTH Range, +10% Cone Width | Firestorm Projector | Maximum flame coverage |

### FLAMETHROWER SUB-CLUSTER 4: Ignite / DOT (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% Ignite Chance | Volatile Mix | Higher chance to ignite on hit |
| 2 | +3% Burn Damage per tick | Accelerant | Burns tick harder |
| N | +8% Ignite Chance, +5% Burn Tick Damage | Pyromaniac | Everything burns hotter and longer |

### FLAMETHROWER SUB-CLUSTER 5: Heat Management (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | -5% FTH Heat Buildup | Insulated Chamber | Flamethrower generates less heat |
| 2 | +8% FTH Heat Cooling | Rapid Vent | Faster cooldown between bursts |
| N | -8% FTH Heat Buildup, +10% Cooling | Flame Regulator | Sustained flaming with minimal downtime |

---

### SIPHON SUB-CLUSTER 1: Heal Amount (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% Siphon Heal | Drain Amplifier | Siphon heals 5% more per tick |
| 2 | +8% Siphon Heal | Deep Drain | Increased life siphon efficiency |
| N | +12% Siphon Heal, heal 2x vs targets below 30% HP | Vampiric Core | Maximum drain against weakened targets |

### SIPHON SUB-CLUSTER 2: Slow Effectiveness (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% Siphon Slow | Heavy Tether | Beam slows 3% more |
| 2 | +5% Siphon Slow | Paralyzing Drain | Stronger movement reduction |
| N | +8% Siphon Slow, targets take +5% damage from all sources | Corroded Link | Slowed targets are weakened |

### SIPHON SUB-CLUSTER 3: Heat Management (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | -5% Siphon Heat Buildup | Cooled Emitter | Beam generates less heat |
| 2 | +8% Siphon Heat Cooling | Thermal Bleed | Faster heat dissipation |
| N | -8% Heat Buildup, +10% Cooling | Perpetual Beam | Near-continuous beam uptime |

### SIPHON SUB-CLUSTER 4: Beam Range / Width (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% Siphon Range | Extended Filament | Beam reaches further |
| 2 | +10% Siphon Beam Width | Diffusion Lens | Wider beam hitbox |
| N | +10% Range, +15% Width | Engulfing Beam | Maximum beam coverage |

---

## GENERAL CLUSTERS

---

### SHIELD SUB-CLUSTER 1: HP / Absorb (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +8 Shield HP | Shield Capacitor | Shield gains 8 max HP |
| 2 | +12 Shield HP | Shield Matrix | Reinforced shield barrier |
| 3 | +2% Shield Absorb | Dense Barrier | Shield absorbs 2% more damage |
| N | +15 Shield HP, +3% Absorb | Fortified Barrier | Thicker shield, higher absorption |

### SHIELD SUB-CLUSTER 2: Regen Speed (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% Shield Regen Rate | Quick Recharge | Shield regenerates 5% faster |
| 2 | -0.3s Shield Regen Delay | Rapid Response | Shield starts recharging sooner |
| 3 | +8% Shield Regen Rate | Overclocked Capacitor | Accelerated shield recovery |
| N | +10% Shield Regen Rate, -0.5s Regen Delay | Instant Recovery | Shield bounces back almost immediately |

### CPU MOD: General Cooldown (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | -3% Mod Cooldown | Processor Boost | All mod cooldowns reduced 3% |
| 2 | -5% Mod Cooldown | Overclocked CPU | Faster ability cycling |
| N | -8% All Mod Cooldowns | Neural Accelerator | Dramatically faster mod recharge |

### CPU MOD: Jump-Specific (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +10% Jump Height | Thrust Upgrade | Jump jets propel higher |
| 2 | -5% Jump Cooldown | Quick Ignition | Jump ready sooner |
| 3 | +3% DR for 2s after landing | Impact Absorbers | Brief protection on touchdown |
| N | +15% Jump Height, -8% Jump CD, landing deals 20 AOE damage | Meteor Drop | Devastating aerial slams |

### CPU MOD: Barrier-Specific (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +1.5s Barrier Duration | Extended Field | Barrier lasts 1.5 seconds longer |
| 2 | -5% Barrier Cooldown | Quick Deploy | Barrier ready sooner |
| N | +2s Barrier Duration, -8% Barrier CD | Fortress Protocol | Maximum barrier uptime |

### CPU MOD: Decoy-Specific (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +2s Decoy Duration | Persistent Hologram | Decoy lasts 2 seconds longer |
| 2 | Decoy explodes on death for 30 damage | Booby Trap | Decoy detonates when destroyed |
| N | +3s Decoy Duration, decoy draws aggro from 30% wider radius | Master Illusionist | The perfect distraction |

### CPU MOD: Ghost Step-Specific (3 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +0.3s Ghost Step Invisibility | Extended Phase | Slightly longer invisibility window |
| 2 | -5% Ghost Step Cooldown | Quick Phase | Ghost Step ready sooner |
| N | +0.5s Invisibility, first attack after Ghost Step deals +25% damage | Ambush Protocol | Strike from the shadows |

### AUGMENT: General Boost (4 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +5% Augment Effect | Augment Amplifier | All augment effects increased 5% |
| 2 | +8% Augment Effect | Augment Overcharge | Stronger augment output |
| 3 | +3% All Damage while augment is active | Synced Systems | Augment synergizes with weapons |
| N | +12% Augment Effect, +5% All Damage | Full Integration | Augment and weapons in perfect sync |

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
| 3 | +4% Crit Damage | Lethal Precision | Crits deal 4% more bonus damage |
| 4 | +4% Crit Damage | Weak Point Scanner | Exploit structural weaknesses |
| N | +3% Crit Chance, +6% Crit Damage | Assassin's Eye | Every shot counts |

### SPEED / MOBILITY (5 nodes)

| # | Stat | Name | Description |
|---|------|------|-------------|
| 1 | +3% Move Speed | Servo Boost | Slightly faster movement |
| 2 | +3% Move Speed | Hydraulic Upgrade | Improved leg servos |
| 3 | +3% All Fire Rate | Quick Hands | All weapons fire 3% faster |
| 4 | +4% All Fire Rate | Streamlined Action | Faster weapon cycling |
| N | +5% Move Speed, +5% All Fire Rate | Lightning Reflexes | Faster in every way |

---

## KEYSTONES (12)

All keystones are pure power — no trade-offs or downsides.

---

### KEYSTONE 1: BULLET HELL (SMG Mastery)
**Effect:** SMG damage +15%. SMG fires two rounds per shot.
**Location:** Far edge of SMG cluster region.

### KEYSTONE 2: DECIMATOR (Shotgun Mastery)
**Effect:** Shotgun damage +15%. Shotgun fires +3 additional pellets. Pellets hitting same target deal 5% more each.
**Location:** Far edge of Shotgun cluster region.

### KEYSTONE 3: HELLFIRE (Flamethrower Mastery)
**Effect:** Flamethrower damage +15%. Burns always ignite. Burning enemies explode on death dealing 30 AOE damage.
**Location:** Far edge of Flamethrower cluster region.

### KEYSTONE 4: PARASYTE (Siphon Mastery)
**Effect:** Siphon heal doubled. Beam chains to 1 additional nearby enemy within 80 units. Siphon damage +10%.
**Location:** Far edge of Siphon cluster region.

### KEYSTONE 5: GLASS CANNON
**Effect:** All weapon damage +25%.
**Location:** Far edge of damage/offense region.

### KEYSTONE 6: EXECUTIONER (Crit Assassin)
**Effect:** Crit chance +8%. Crit damage +20%. Crits against targets below 25% HP deal triple damage.
**Location:** Far edge of Crit cluster region.

### KEYSTONE 7: PHANTOM (Evasion Master)
**Effect:** +12% dodge chance. +8% move speed.
**Location:** Far edge of Speed/Mobility region.

### KEYSTONE 8: OVERCLOCK (Mod Specialist)
**Effect:** All mod cooldowns -15%. Mod effects last 30% longer. Using a mod grants +5% damage for 3 seconds.
**Location:** Far edge of CPU Mod general region.

### KEYSTONE 9: METEOR STRIKE (Jump Mastery)
**Effect:** Jump height +25%. Landing creates a 50 damage AOE shockwave. 2 second invulnerability during jump.
**Location:** Far edge of Jump cluster region.

### KEYSTONE 10: STASIS FIELD (Barrier Mastery)
**Effect:** Barrier duration +3s. Activating barrier slows all enemies within 150 units by 40% for the barrier duration.
**Location:** Far edge of Barrier cluster region.

### KEYSTONE 11: DOPPELGANGER (Decoy Mastery)
**Effect:** Decoy fires your equipped weapon at 50% damage. Decoy duration +4s. Decoy draws 100% enemy aggro within range.
**Location:** Far edge of Decoy cluster region.

### KEYSTONE 12: GHOST PROTOCOL (Ghost Step Mastery)
**Effect:** Ghost Step grants 2s full invisibility. First attack after Ghost Step deals 3x damage. +5% move speed during invisibility.
**Location:** Far edge of Ghost Step cluster region.

---

## GENERIC CONNECTOR NODES (89 nodes)

These are simple stat nodes that form the paths between clusters. They use small hex shapes and provide basic bonuses. Distribution:

| Stat Type | Approximate Count | Example Values |
|-----------|-------------------|----------------|
| Core HP | ~10 | +8, +10, +12, +15 |
| Arm HP | ~6 | +6, +8, +10 |
| Leg HP | ~6 | +8, +10, +12 |
| All HP | ~5 | +5, +8, +10 |
| Shield HP | ~10 | +5, +8, +10, +12 |
| DR | ~6 | +1%, +1%, +2% |
| All Damage | ~8 | +2%, +3%, +3% |
| Crit Chance | ~5 | +1%, +2% |
| Crit Damage | ~5 | +2%, +3% |
| Move Speed | ~5 | +2%, +3% |
| Fire Rate | ~5 | +2%, +3% |
| Dodge | ~4 | +1%, +2% |
| Shield Regen | ~4 | +3%, +5% |
| Mod Cooldown | ~4 | -2%, -3% |
| Loot Quality | ~3 | +3%, +5% |
| Scrap Bonus | ~3 | +5%, +8% |
| **Total** | **~89** | |

---

## VISUAL DESIGN

| Element | Value |
|---------|-------|
| Background | #080b0e |
| Allocated node fill | rgba(0,255,136,0.15) |
| Allocated node stroke | #00ff88 |
| Available node fill | rgba(0,212,255,0.12) |
| Available node stroke | #00d4ff |
| Locked node fill | rgba(255,255,255,0.03) |
| Locked node stroke | rgba(255,255,255,0.12) |
| Notable stroke | #e8923a |
| Keystone stroke | #cc88ff |
| Allocated path lines | rgba(0,255,136,0.35) |
| Available path lines | rgba(0,212,255,0.2) |
| Locked path lines | rgba(255,255,255,0.06) |
| Hover card background | #0c1014 |
| Hover card border | #00d4ff |
| Hover card stat text | #00ff88 |
| Hover card name text | #e8923a |
| Font | Courier New, monospace |
| Center node | Large hex with chassis mech image |

## INTERACTION

- Click + drag to pan
- Scroll wheel to zoom in/out
- Hover node for detail card (stat, name, description)
- Click available node to allocate (spend 1 skill point)
- Nodes only available if adjacent to an allocated node
