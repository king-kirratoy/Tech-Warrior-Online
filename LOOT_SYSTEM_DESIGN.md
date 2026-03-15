# Tech Warrior Online — Loot System & ARPG Overhaul Design Document

## Table of Contents
1. [Vision & Overview](#1-vision--overview)
2. [Item System](#2-item-system)
3. [Rarity Tiers](#3-rarity-tiers)
4. [Affix & Stat Roll System](#4-affix--stat-roll-system)
5. [Equipment Slots](#5-equipment-slots)
6. [Loot Drop System](#6-loot-drop-system)
7. [World Loot Rendering & Pickup](#7-world-loot-rendering--pickup)
8. [Inventory System](#8-inventory-system)
9. [End-of-Round Equip Screen](#9-end-of-round-equip-screen)
10. [Enemy Expansion](#10-enemy-expansion)
11. [Boss & Elite System](#11-boss--elite-system)
12. [Level Design & Objectives](#12-level-design--objectives)
13. [Implementation Phases](#13-implementation-phases)
14. [Technical Architecture](#14-technical-architecture)
15. [Integration with Existing Systems](#15-integration-with-existing-systems)

---

## 1. Vision & Overview

Transform Tech Warrior Online from a wave-based mech shooter into an **action-RPG mech shooter** with Diablo-inspired loot. Players fight through rounds, enemies drop randomized gear with varying rarity and stats, and players build their mech through a combination of the existing perk system and new loot-based equipment.

### Core Loop
```
Fight Enemies → Loot Drops → Pick Up Loot → Round Ends → Equip/Manage Inventory → Next Round
```

### Design Pillars
- **Loot Excitement**: Every drop should feel potentially game-changing. Color-coded rarity, distinct icons, satisfying pickup effects.
- **Build Diversity**: Loot + perks together should enable more diverse builds than perks alone.
- **Readable at a Glance**: Ground loot must be instantly identifiable — you should know "that's a shotgun" or "that's a shield module" from the icon alone.
- **Respect Existing Systems**: The perk system stays. Loot is additive, not a replacement. Equipment stats stack with perk bonuses.

---

## 2. Item System

### 2.1 Item Categories

| Category | Slot | Examples | Primary Stats |
|----------|------|----------|---------------|
| **Weapons** | L Arm, R Arm | SMG, MG, BR, SG, HR, SR, GL, RL, PLSM, RAIL, CHAIN, SIEGE | Damage, Reload, Crit Chance, Pellets |
| **Armor Plating** | Chest | Light/Med/Heavy Plates | Core HP, Damage Reduction |
| **Arm Reinforcement** | Arms | Servo Enhancers, Stabilizers | Arm HP, Reload Speed, Accuracy |
| **Leg Components** | Legs | Actuators, Boosters, Dampeners | Leg HP, Move Speed, Dodge |
| **Shield Modules** | Shield | Barrier Cores, Regen Cells | Shield Capacity, Regen Rate |
| **Mod Chips** | Mod | Cooldown Chips, Amplifiers | Mod Cooldown, Mod Effectiveness |
| **Augment Cores** | Augment | Neural Links, Targeting Arrays | Various special effects |
| **Consumables** | N/A (auto-use) | Repair Kits, Ammo Packs, Stim Injectors | Immediate effect on pickup |

### 2.2 Item Data Structure

```javascript
const ITEM_TEMPLATE = {
    id: 'sg_combat_01',           // Unique ID
    baseType: 'weapon',           // Category
    subType: 'sg',                // Specific type (maps to existing WEAPONS keys)
    name: 'Combat Shotgun',       // Display name
    icon: 'shotgun',              // Icon key for ground/inventory rendering
    rarity: 'rare',               // common|uncommon|rare|epic|legendary
    level: 5,                     // Item level (based on round dropped)
    baseStats: {                  // Base stats (from WEAPONS definition)
        dmg: 18,
        reload: 600,
        pellets: 8,
        spread: 0.3
    },
    affixes: [                    // Rolled affixes based on rarity
        { stat: 'dmgFlat', value: 4, label: '+4 Damage' },
        { stat: 'reloadPct', value: -12, label: '-12% Reload Time' },
        { stat: 'critChance', value: 8, label: '+8% Crit Chance' }
    ],
    computedStats: {              // Final calculated stats (base + affixes)
        dmg: 22,
        reload: 528,
        pellets: 8,
        spread: 0.3,
        critChance: 0.08
    }
};
```

### 2.3 Base Item Definitions

Weapon items inherit from the existing `WEAPONS` object. The base stats remain the same — affixes modify them. Non-weapon items get new base stat definitions:

```javascript
const ITEM_BASES = {
    // ── ARMOR PLATING ──
    light_plate:    { baseType:'armor', name:'Light Plating',    icon:'armor_light',  baseStats:{ coreHP:20, dr:0.02 } },
    medium_plate:   { baseType:'armor', name:'Medium Plating',   icon:'armor_medium', baseStats:{ coreHP:40, dr:0.05 } },
    heavy_plate:    { baseType:'armor', name:'Heavy Plating',    icon:'armor_heavy',  baseStats:{ coreHP:60, dr:0.08 } },
    reactive_plate: { baseType:'armor', name:'Reactive Plating', icon:'armor_react',  baseStats:{ coreHP:30, dr:0.04, thornsDmg:5 } },

    // ── ARM REINFORCEMENT ──
    servo_enhancer: { baseType:'arms', name:'Servo Enhancer',    icon:'arm_servo',    baseStats:{ armHP:15, reloadPct:-5 } },
    stabilizer:     { baseType:'arms', name:'Stabilizer',        icon:'arm_stab',     baseStats:{ armHP:20, accuracy:5 } },
    power_coupler:  { baseType:'arms', name:'Power Coupler',     icon:'arm_power',    baseStats:{ armHP:10, dmgPct:3 } },

    // ── LEG COMPONENTS ──
    actuator:       { baseType:'legs', name:'Actuator',          icon:'leg_actuator', baseStats:{ legHP:20, speedPct:3 } },
    booster:        { baseType:'legs', name:'Booster',           icon:'leg_booster',  baseStats:{ legHP:15, speedPct:6, dodgePct:2 } },
    dampener:       { baseType:'legs', name:'Dampener',          icon:'leg_dampener', baseStats:{ legHP:30, speedPct:-2, dr:0.03 } },

    // ── SHIELD MODULES ──
    barrier_core:   { baseType:'shield', name:'Barrier Core',    icon:'shield_core',  baseStats:{ shieldHP:15, regenPct:5 } },
    regen_cell:     { baseType:'shield', name:'Regen Cell',      icon:'shield_regen', baseStats:{ shieldHP:5,  regenPct:15 } },
    absorb_matrix:  { baseType:'shield', name:'Absorb Matrix',   icon:'shield_abs',   baseStats:{ shieldHP:25, absorbPct:5 } },

    // ── MOD CHIPS ──
    cooldown_chip:  { baseType:'mod', name:'Cooldown Chip',      icon:'mod_cd',       baseStats:{ modCdPct:-8 } },
    amplifier:      { baseType:'mod', name:'Amplifier',          icon:'mod_amp',      baseStats:{ modEffPct:10 } },
    overcharge:     { baseType:'mod', name:'Overcharge',         icon:'mod_oc',       baseStats:{ modCdPct:-5, modEffPct:5 } },

    // ── AUGMENT CORES ──
    targeting_array: { baseType:'augment', name:'Targeting Array', icon:'aug_target', baseStats:{ critChance:3, accuracy:5 } },
    neural_link:     { baseType:'augment', name:'Neural Link',    icon:'aug_neural', baseStats:{ xpMult:10, lootMult:5 } },
    combat_matrix:   { baseType:'augment', name:'Combat Matrix',  icon:'aug_combat', baseStats:{ dmgPct:3, speedPct:2 } },
};
```

---

## 3. Rarity Tiers

### 3.1 Rarity Definitions

| Rarity | Color | Hex | Drop Weight | Affix Count | Stat Multiplier | Affix Quality |
|--------|-------|-----|-------------|-------------|-----------------|---------------|
| **Common** | White | `#c0c8d0` | 45% | 0-1 | 1.0x | Low rolls |
| **Uncommon** | Green | `#00ff44` | 30% | 1-2 | 1.15x | Low-Mid |
| **Rare** | Blue | `#4488ff` | 15% | 2-3 | 1.30x | Mid-High |
| **Epic** | Purple | `#aa44ff` | 8% | 3-4 | 1.50x | High |
| **Legendary** | Gold | `#ffd700` | 2% | 4-5 | 1.80x | Max rolls + unique effect |

### 3.2 Rarity Visual Effects

| Rarity | Ground Loot Effect | Inventory Border | Name Color |
|--------|-------------------|------------------|------------|
| Common | None | Thin gray | White |
| Uncommon | Subtle green pulse | Green border | Green |
| Rare | Blue glow + particles | Blue border + glow | Blue |
| Epic | Purple beam + swirl | Purple border + glow | Purple |
| Legendary | Gold pillar + star burst + sound | Gold border + animated glow | Gold |

### 3.3 Rarity Roll Calculation

```javascript
function rollRarity(round, isCommander, isBoss) {
    let luck = 0;
    luck += Math.min(round * 0.5, 15);         // +0.5% per round, cap 15%
    luck += (_perkState.lootMult - 1) * 20;     // Perk-based luck
    if (isCommander) luck += 15;                 // Commanders drop better
    if (isBoss) luck += 30;                      // Bosses drop much better

    const roll = Math.random() * 100;
    const thresholds = {
        legendary: 2 + luck * 0.1,              // Base 2%, scales slowly
        epic:      8 + luck * 0.3,              // Base 8%, scales moderately
        rare:      15 + luck * 0.5,             // Base 15%, scales well
        uncommon:  30 + luck * 0.7              // Base 30%, scales fast
    };

    if (roll < thresholds.legendary) return 'legendary';
    if (roll < thresholds.epic)      return 'epic';
    if (roll < thresholds.rare)      return 'rare';
    if (roll < thresholds.uncommon)  return 'uncommon';
    return 'common';
}
```

---

## 4. Affix & Stat Roll System

### 4.1 Affix Pool

Affixes are randomized stat modifiers rolled onto items. Each affix has a stat, a value range, and a weight.

```javascript
const AFFIX_POOL = {
    // ── OFFENSIVE ──
    dmgFlat:      { label: '+{v} Damage',              min: 1,  max: 15, weight: 10, types: ['weapon'] },
    dmgPct:       { label: '+{v}% Damage',             min: 3,  max: 25, weight: 8,  types: ['weapon','arms','augment'] },
    critChance:   { label: '+{v}% Crit Chance',        min: 2,  max: 15, weight: 7,  types: ['weapon','augment'] },
    critDmg:      { label: '+{v}% Crit Damage',        min: 10, max: 50, weight: 5,  types: ['weapon','augment'] },
    reloadPct:    { label: '-{v}% Reload Time',        min: 3,  max: 20, weight: 8,  types: ['weapon','arms'] },
    pellets:      { label: '+{v} Pellets',             min: 1,  max: 3,  weight: 3,  types: ['weapon'], subTypes: ['sg'] },
    piercing:     { label: 'Pierces {v} enemies',      min: 1,  max: 3,  weight: 3,  types: ['weapon'], subTypes: ['sr','rail','br'] },
    splashRadius: { label: '+{v}% Blast Radius',       min: 10, max: 40, weight: 5,  types: ['weapon'], subTypes: ['gl','rl','plsm','siege'] },

    // ── DEFENSIVE ──
    coreHP:       { label: '+{v} Core HP',             min: 10, max: 80, weight: 8,  types: ['armor'] },
    armHP:        { label: '+{v} Arm HP',              min: 5,  max: 40, weight: 6,  types: ['arms'] },
    legHP:        { label: '+{v} Leg HP',              min: 5,  max: 40, weight: 6,  types: ['legs'] },
    allHP:        { label: '+{v} All Part HP',         min: 5,  max: 25, weight: 4,  types: ['armor','augment'] },
    dr:           { label: '+{v}% Damage Reduction',   min: 1,  max: 10, weight: 5,  types: ['armor','legs'] },
    shieldHP:     { label: '+{v} Shield Capacity',     min: 5,  max: 40, weight: 7,  types: ['shield'] },
    shieldRegen:  { label: '+{v}% Shield Regen',       min: 5,  max: 30, weight: 6,  types: ['shield'] },
    dodgePct:     { label: '+{v}% Dodge Chance',       min: 1,  max: 8,  weight: 4,  types: ['legs'] },

    // ── UTILITY ──
    speedPct:     { label: '+{v}% Move Speed',         min: 2,  max: 12, weight: 6,  types: ['legs','augment'] },
    modCdPct:     { label: '-{v}% Mod Cooldown',       min: 3,  max: 20, weight: 6,  types: ['mod'] },
    modEffPct:    { label: '+{v}% Mod Effectiveness',  min: 5,  max: 25, weight: 5,  types: ['mod'] },
    lootMult:     { label: '+{v}% Loot Quality',       min: 3,  max: 15, weight: 3,  types: ['augment'] },
    autoRepair:   { label: '+{v} HP/sec Regen',        min: 1,  max: 5,  weight: 4,  types: ['armor','augment'] },
};
```

### 4.2 Affix Roll Algorithm

```javascript
function rollAffixes(item) {
    const rarity = RARITY_DEFS[item.rarity];
    const count = Phaser.Math.Between(rarity.minAffixes, rarity.maxAffixes);

    // Filter eligible affixes for this item type
    const eligible = Object.entries(AFFIX_POOL).filter(([key, affix]) => {
        if (!affix.types.includes(item.baseType)) return false;
        if (affix.subTypes && !affix.subTypes.includes(item.subType)) return false;
        return true;
    });

    const picked = [];
    const used = new Set();

    for (let i = 0; i < count; i++) {
        // Weighted random from eligible, no duplicates
        const available = eligible.filter(([k]) => !used.has(k));
        if (available.length === 0) break;

        const totalWeight = available.reduce((s, [, a]) => s + a.weight, 0);
        let roll = Math.random() * totalWeight;
        let chosen = available[0];
        for (const entry of available) {
            roll -= entry[1].weight;
            if (roll <= 0) { chosen = entry; break; }
        }

        const [key, affix] = chosen;
        used.add(key);

        // Roll value: higher rarity = higher portion of the range
        const qualityMin = rarity.affixQualityMin; // e.g., 0.0 for common
        const qualityMax = rarity.affixQualityMax; // e.g., 1.0 for legendary
        const quality = qualityMin + Math.random() * (qualityMax - qualityMin);
        const value = Math.round(affix.min + (affix.max - affix.min) * quality);

        picked.push({
            key,
            stat: key,
            value,
            label: affix.label.replace('{v}', value)
        });
    }

    return picked;
}
```

### 4.3 Rarity Affix Quality Ranges

| Rarity | Min Quality | Max Quality | Affix Count |
|--------|-------------|-------------|-------------|
| Common | 0.0 | 0.4 | 0-1 |
| Uncommon | 0.15 | 0.55 | 1-2 |
| Rare | 0.30 | 0.75 | 2-3 |
| Epic | 0.50 | 0.90 | 3-4 |
| Legendary | 0.70 | 1.00 | 4-5 |

---

## 5. Equipment Slots

### 5.1 Slot Layout

```
┌─────────────────────────────────┐
│         MECH EQUIPMENT          │
├────────┬──────────┬─────────────┤
│        │  [HEAD]  │             │
│ [L ARM]│ [CHEST]  │ [R ARM]    │
│ (Wpn)  │ (Armor)  │ (Wpn)      │
│        │  [MOD]   │             │
│        │  [AUG]   │             │
│ [SHIELD]│ [LEGS]  │             │
└────────┴──────────┴─────────────┘
```

### 5.2 Slot Definitions

| Slot | ID | Accepts | Current System Mapping |
|------|----|---------|----------------------|
| Left Arm | `equipL` | Weapon items | `loadout.L` |
| Right Arm | `equipR` | Weapon items | `loadout.R` |
| Chest | `equipChest` | Armor Plating | *New* |
| Arms | `equipArms` | Arm Reinforcement | *New* |
| Legs | `equipLegs` | Leg Components | *Extends* `loadout.legs` |
| Shield | `equipShield` | Shield Modules | *Extends* `loadout.shield` |
| Mod | `equipMod` | Mod Chips | *Extends* `loadout.mod` |
| Augment | `equipAug` | Augment Cores | *Extends* `loadout.aug` |

### 5.3 Equipment Stat Application

When gear is equipped, its `computedStats` are aggregated into a new `_gearState` object (similar to `_perkState`):

```javascript
function recalcGearStats() {
    _gearState = { dmgFlat:0, dmgPct:0, critChance:0, critDmg:0, reloadPct:0,
                   coreHP:0, armHP:0, legHP:0, allHP:0, dr:0,
                   shieldHP:0, shieldRegen:0, dodgePct:0, speedPct:0,
                   modCdPct:0, modEffPct:0, lootMult:0, autoRepair:0 };

    const slots = [equipL, equipR, equipChest, equipArms, equipLegs,
                   equipShield, equipMod, equipAug];

    slots.forEach(item => {
        if (!item) return;
        item.affixes.forEach(affix => {
            _gearState[affix.stat] = (_gearState[affix.stat] || 0) + affix.value;
        });
        // Also add base stats from item
        Object.entries(item.baseStats || {}).forEach(([k, v]) => {
            _gearState[k] = (_gearState[k] || 0) + v;
        });
    });
}
```

Gear stats apply ON TOP of perk stats. The order is:
1. **Base chassis stats** → 2. **Perk modifiers** → 3. **Gear modifiers**

---

## 6. Loot Drop System

### 6.1 Drop Table Architecture

Currently `spawnLoot()` drops consumables (repair/ammo/charge). The new system adds **equipment drops** alongside consumables.

```javascript
function spawnLoot(scene, x, y, forced, enemyData) {
    // Consumable drops (unchanged, always possible)
    if (forced || Math.random() < 0.30) {
        _spawnConsumable(scene, x, y);
    }

    // Equipment drops (NEW)
    const equipChance = _getEquipDropChance(enemyData);
    if (Math.random() < equipChance) {
        const item = _generateItem(enemyData);
        _spawnEquipmentDrop(scene, x, y, item);
    }
}
```

### 6.2 Equipment Drop Chances

| Enemy Type | Base Drop Chance | Notes |
|------------|-----------------|-------|
| Regular Enemy | 8% | Scales +0.5% per round (cap 20%) |
| Commander | 40% | Always at least Uncommon |
| Medic | 15% | Bias toward shield/repair items |
| Boss (Warden) | 100% | 1-2 drops, minimum Rare |
| Boss (Twin Razors) | 100% | 1 drop per razor, minimum Rare |
| Boss (Architect) | 100% | 1-2 drops, bias toward mod/augment |
| Boss (Juggernaut) | 100% | 2-3 drops, minimum Epic for 1 drop |

### 6.3 Item Type Selection

What type of item drops depends on the enemy type and some randomness:

```javascript
function _selectItemType(enemyData) {
    // Weapon drops are most common, armor/utility less so
    const weights = {
        weapon:  35,
        armor:   15,
        arms:    10,
        legs:    10,
        shield:  10,
        mod:     10,
        augment: 10
    };

    // Medics bias toward defensive
    if (enemyData?.isMedic) {
        weights.shield *= 3;
        weights.armor *= 2;
    }

    // Commanders bias toward weapons
    if (enemyData?.isCommander) {
        weights.weapon *= 2;
    }

    return weightedRandom(weights);
}
```

### 6.4 Item Level

Item level = current round number. Higher level items have:
- Higher base stat multiplier: `1 + (level - 1) * 0.03` (3% per level)
- Access to higher-tier base items (some base items unlock at specific rounds)

---

## 7. World Loot Rendering & Pickup

### 7.1 Ground Loot Icons

Each item type gets a distinct icon rendered as a Phaser graphics object. Icons are simple but recognizable silhouettes:

```javascript
const LOOT_ICONS = {
    // Weapons — rendered as simplified weapon shapes
    smg:    { draw: drawSMGIcon,    color: 0xffdd00 },
    mg:     { draw: drawMGIcon,     color: 0xff8800 },
    br:     { draw: drawBRIcon,     color: 0x44aaff },
    sg:     { draw: drawSGIcon,     color: 0xff4444 },
    hr:     { draw: drawHRIcon,     color: 0x00ff88 },
    sr:     { draw: drawSRIcon,     color: 0x8844ff },
    gl:     { draw: drawGLIcon,     color: 0xff6600 },
    rl:     { draw: drawRLIcon,     color: 0xff2200 },
    plsm:   { draw: drawPLSMIcon,   color: 0x00ffff },
    rail:   { draw: drawRAILIcon,   color: 0x4400ff },
    chain:  { draw: drawChainIcon,  color: 0xffaa00 },
    siege:  { draw: drawSiegeIcon,  color: 0xff0000 },

    // Equipment — distinct shapes
    armor_light:  { draw: drawLightArmorIcon, color: 0x88ccff },
    armor_medium: { draw: drawMedArmorIcon,   color: 0x44aaff },
    armor_heavy:  { draw: drawHvyArmorIcon,   color: 0x2266cc },
    arm_servo:    { draw: drawArmIcon,        color: 0x88ff88 },
    leg_actuator: { draw: drawLegIcon,        color: 0xffcc44 },
    shield_core:  { draw: drawShieldIcon,     color: 0x00ffff },
    mod_cd:       { draw: drawModIcon,        color: 0xff44ff },
    aug_target:   { draw: drawAugIcon,        color: 0xffd700 },
};
```

### 7.2 Ground Loot Rendering

```javascript
function _spawnEquipmentDrop(scene, x, y, item) {
    const rarityDef = RARITY_DEFS[item.rarity];

    // Create container for icon + effects
    const container = scene.add.container(x, y).setDepth(8);

    // Background glow (rarity-colored)
    const glow = scene.add.circle(0, 0, 16, rarityDef.colorHex, 0.25);
    container.add(glow);

    // Item icon (rendered per type)
    const iconDef = LOOT_ICONS[item.icon];
    const icon = iconDef.draw(scene, 0, 0, rarityDef.colorHex);
    container.add(icon);

    // Rarity name tag
    const tag = scene.add.text(0, 18, item.name, {
        font: 'bold 8px Courier New',
        fill: rarityDef.colorStr
    }).setOrigin(0.5).setAlpha(0.8);
    container.add(tag);

    // Floating animation
    scene.tweens.add({
        targets: container,
        y: y - 6,
        yoyo: true,
        repeat: -1,
        duration: 800,
        ease: 'Sine.easeInOut'
    });

    // Rarity-specific effects
    if (item.rarity === 'epic' || item.rarity === 'legendary') {
        // Particle beam effect
        const beam = scene.add.rectangle(0, -30, 2, 60, rarityDef.colorHex, 0.3).setDepth(7);
        container.add(beam);
        scene.tweens.add({ targets: beam, alpha: 0.1, yoyo: true, repeat: -1, duration: 600 });
    }
    if (item.rarity === 'legendary') {
        // Star burst + sound
        _noise(0.15, 0.6, 0, 200, 800); // Distinctive drop sound
    }

    // Physics for pickup detection
    scene.physics.add.existing(container);
    container.body.setCircle(20).setAllowGravity(false).setImmovable(true);

    // Store item data
    container._item = item;
    container._isEquipDrop = true;

    // Add to loot group
    equipmentDrops.add(container);

    // Expire after 30s (longer than consumables)
    scene.time.delayedCall(30000, () => {
        if (container.active) {
            scene.tweens.add({
                targets: container, alpha: 0, duration: 1000,
                onComplete: () => container.destroy()
            });
        }
    });
}
```

### 7.3 Pickup Mechanic

Player walks over loot to pick it up. Equipment goes to inventory (not auto-equipped). Consumables still auto-apply.

```javascript
function checkEquipmentPickups(scene) {
    if (!equipmentDrops) return;
    equipmentDrops.getChildren().forEach(drop => {
        if (!drop.active || !drop._isEquipDrop) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, drop.x, drop.y);
        if (dist < 45) {
            // Add to inventory
            if (_inventory.length < INVENTORY_MAX) {
                _inventory.push(drop._item);
                _showPickupNotification(drop._item);
                _noise(0.1, 0.3, 0, 400, 1200); // Pickup sound
                drop.destroy();
            } else {
                // Inventory full — show floating "INVENTORY FULL" text
                _showFloatingText(player.x, player.y - 40, 'INVENTORY FULL', '#ff4444');
            }
        }
    });
}
```

### 7.4 Pickup Notification

Brief HUD notification when picking up loot:

```
┌─────────────────────────────┐
│ ★ RARE Combat Shotgun       │
│ +4 Damage, -12% Reload      │
└─────────────────────────────┘
```

Slides in from the right side of screen, stays 2.5s, fades out. Stacks vertically if multiple pickups happen close together.

---

## 8. Inventory System

### 8.1 Inventory Structure

```javascript
const INVENTORY_MAX = 30;      // Max items in inventory
let _inventory = [];            // Array of item objects
let _equipped = {               // Currently equipped items
    L: null, R: null,
    chest: null, arms: null, legs: null,
    shield: null, mod: null, augment: null
};
```

### 8.2 Inventory UI (Accessible Between Rounds)

The inventory is a full-screen overlay similar to the existing stat menu:

```
┌──────────────────────────────────────────────────────┐
│                    MECH INVENTORY                     │
│                                                       │
│  ┌─ EQUIPPED ──────────┐  ┌─ BACKPACK ─────────────┐ │
│  │                      │  │ ┌──┐┌──┐┌──┐┌──┐┌──┐  │ │
│  │    [L ARM: SMG]      │  │ │  ││  ││  ││  ││  │  │ │
│  │    [CHEST: Heavy]    │  │ ├──┤├──┤├──┤├──┤├──┤  │ │
│  │    [R ARM: SG]       │  │ │  ││  ││  ││  ││  │  │ │
│  │    [LEGS: Booster]   │  │ ├──┤├──┤├──┤├──┤├──┤  │ │
│  │    [SHIELD: Regen]   │  │ │  ││  ││  ││  ││  │  │ │
│  │    [MOD: CD Chip]    │  │ ├──┤├──┤├──┤├──┤├──┤  │ │
│  │    [AUG: Neural]     │  │ │  ││  ││  ││  ││  │  │ │
│  │                      │  │ ├──┤├──┤├──┤├──┤├──┤  │ │
│  └──────────────────────┘  │ │  ││  ││  ││  ││  │  │ │
│                             │ ├──┤├──┤├──┤├──┤├──┤  │ │
│  ┌─ ITEM DETAIL ─────────┐ │ │  ││  ││  ││  ││  │  │ │
│  │ ★ RARE Combat Shotgun │ │ └──┘└──┘└──┘└──┘└──┘  │ │
│  │ iLvl 8                │ │           30 / 30       │ │
│  │ ─────────────────     │ └─────────────────────────┘ │
│  │ Damage: 22 (+4)       │                             │
│  │ Reload: 528ms (-72)   │  [EQUIP]  [SCRAP]  [CLOSE] │
│  │ Crit: +8%             │                             │
│  └───────────────────────┘                             │
└──────────────────────────────────────────────────────┘
```

### 8.3 Item Comparison

When hovering over an inventory item that can go in an occupied slot, show a comparison:

```
┌─ CURRENT ──────────┐  ┌─ NEW ITEM ──────────┐
│ Combat Shotgun     │  │ ★ Plasma Shotgun    │
│ Damage: 18        │  │ Damage: 22 ↑ +4     │
│ Reload: 600ms     │  │ Reload: 550ms ↑ -50 │
│ Crit: 0%          │  │ Crit: +8% ↑ NEW     │
└────────────────────┘  └─────────────────────┘
```

Green arrows for upgrades, red for downgrades.

### 8.4 Scrapping Items

Items can be scrapped for **Scrap** currency (future use for crafting or upgrading):

| Rarity | Scrap Value |
|--------|-------------|
| Common | 1 |
| Uncommon | 3 |
| Rare | 8 |
| Epic | 20 |
| Legendary | 50 |

---

## 9. End-of-Round Equip Screen

### 9.1 Flow

```
Round Ends → Perk Selection (existing) → Equipment Screen → Next Round
```

After perk selection, if the player has unequipped items in inventory, show the equipment screen automatically. Player can also manually open inventory via a button.

### 9.2 Equip Screen Design

The equip screen is a streamlined version of the full inventory, focused on quick swap decisions:

```
┌─────────────────────────────────────────────┐
│           ROUND 5 COMPLETE                   │
│     Review your loadout before Round 6       │
│                                              │
│  ┌── NEW LOOT ─────────────────────────┐    │
│  │ ★ [Epic Plasma Rifle]  [EQUIP L]    │    │
│  │   [Rare Servo Enhancer] [EQUIP ARM] │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  ┌── EQUIPPED ─────────────────────────┐    │
│  │ L: Standard SMG → [SWAP]            │    │
│  │ R: Standard Shotgun                  │    │
│  │ Chest: (empty) → drag here           │    │
│  │ ...                                  │    │
│  └─────────────────────────────────────┘    │
│                                              │
│        [OPEN FULL INVENTORY]                 │
│        [CONTINUE TO NEXT ROUND]              │
└─────────────────────────────────────────────┘
```

### 9.3 Quick Equip

Newly picked up items are highlighted. Clicking "EQUIP" on a new item auto-places it in the correct slot (swapping the old item to inventory if occupied).

---

## 10. Enemy Expansion

### 10.1 New Regular Enemy Types

| Enemy Type | Chassis | Behavior | Special Mechanic | Drop Bias |
|-----------|---------|----------|-----------------|-----------|
| **Scout** | Light | Rusher | Alerts nearby enemies on sight, fast but fragile | Speed/dodge items |
| **Enforcer** | Heavy | Guardian | Shield gate: first 30% damage absorbed, then vulnerable | Armor/shield items |
| **Technician** | Medium | Defender | Deploys auto-turrets (max 2), turrets fire at player | Mod/augment items |
| **Berserker** | Heavy | Rusher | Enrages below 50% HP: 2x speed, 1.5x damage, no shield | Weapon items |
| **Sniper Elite** | Light | Sniper | Cloaks for 3s after firing, repositions, laser sight warning | Weapon items |
| **Drone Carrier** | Medium | Circle | Launches 3 attack drones that orbit and fire | Augment items |

### 10.2 New Elite Modifiers

Elites are regular enemies with a random modifier (replaces commanders in some rounds):

| Modifier | Visual | Effect |
|----------|--------|--------|
| **Vampiric** | Red aura | Heals on hitting player |
| **Shielded** | Blue rings | Regenerating overshield |
| **Explosive** | Orange glow | Death explosion (150px, 40 dmg) |
| **Swift** | Green trails | +50% move speed, +25% fire rate |
| **Armored** | Thick border | +30% damage reduction |
| **Splitting** | Dual outline | On death, spawns 2 half-HP minions |

### 10.3 Spawning Rules

- **Rounds 1-5**: Regular enemies only, no elites
- **Rounds 6-10**: 1 elite per round (20% chance), commanders
- **Rounds 11-15**: 1-2 elites per round (40% chance), new enemy types unlock
- **Rounds 16-20**: 2-3 elites, all enemy types available
- **Round 20+**: Elite density increases, modifier stacking possible (2 modifiers on 1 enemy)

---

## 11. Boss & Elite System

### 11.1 Existing Bosses Enhanced

Each existing boss gets guaranteed unique/legendary loot drops themed to their mechanics:

| Boss | Unique Drops |
|------|-------------|
| **Warden** | "Warden's Aegis" (Legendary Shield: frontal damage absorb), "Sentinel's Plating" (Epic Armor: +DR when shield is full) |
| **Twin Razors** | "Razor Edge" (Legendary Weapon: dual-wield bonus, attacks hit twice), "Twinned Servo" (Epic Arms: dual weapons reload 30% faster) |
| **Architect** | "Blueprint Core" (Legendary Mod: mod creates terrain/cover), "Architect's Array" (Epic Augment: +50% mod effectiveness) |
| **Juggernaut** | "Juggernaut Engine" (Legendary Legs: immune to slow, +20% speed), "Unstoppable Core" (Epic Armor: cannot be staggered) |

### 11.2 New Bosses (Future)

| Boss | Round | Chassis | Mechanic |
|------|-------|---------|----------|
| **The Swarm** | 25 | N/A | 20 mini-enemies sharing one large HP pool, reform when killed |
| **The Mirror** | 30 | Player's | Copies player's loadout and perks, AI-controlled mirror match |
| **The Titan** | 35 | Mega-Heavy | 3-phase, each phase different attack pattern, massive arena boss |
| **The Core** | 40 | Stationary | Central core with 4 rotating turrets, must destroy turrets first |

---

## 12. Level Design & Objectives

### 12.1 Current Arena

The current play area is a rectangular arena with randomly placed cover objects. This remains the default.

### 12.2 New Arena Variants

Introduce arena variety that rotates or progresses:

| Arena | Layout | Special Feature |
|-------|--------|-----------------|
| **Warehouse** (Default) | Open with scattered cover | Standard, balanced |
| **Corridors** | Narrow hallways, chokepoints | Favors shotguns/close range, ambush risk |
| **Tower Defense** | Central objective to protect | Enemies converge on a point, player must defend |
| **Gauntlet** | Long linear path with waves | Forward-progressing, can't go back |
| **Pit** | Circular arena, shrinking safe zone | Zone deals damage, forces close combat |
| **Stronghold** | Fortified position with walls | Player starts with cover advantage, enemies breach |

### 12.3 Objective System

Beyond "kill all enemies," introduce round objectives:

| Objective | Description | Bonus |
|-----------|-------------|-------|
| **Elimination** | Kill all enemies (current) | Standard loot |
| **Survival** | Survive for 90 seconds | +50% loot quality |
| **Assassination** | Kill the marked target within 60s | Guaranteed rare+ drop |
| **Defense** | Protect the generator (HP pool) | Bonus gear drop |
| **Salvage** | Collect 5 data cores from the field | Guaranteed item + scrap |
| **Boss Rush** | 2 mini-bosses simultaneously | Double boss loot |

### 12.4 Arena Progression

- Rounds 1-5: Warehouse (tutorial/baseline)
- Rounds 6-10: Random from Warehouse/Corridors
- Rounds 11-15: Add Tower Defense/Stronghold
- Rounds 16+: Full rotation, objectives diversify
- Every 5th round: Boss arena (special layout per boss)

---

## 13. Implementation Phases

### Phase 1: Core Loot Foundation (Priority: HIGH)
**Goal**: Items drop, can be picked up, stored in inventory

- [ ] Define `ITEM_BASES` data structure
- [ ] Define `RARITY_DEFS` with colors, affix counts, quality ranges
- [ ] Define `AFFIX_POOL` with stat modifiers
- [ ] Implement `generateItem()` — creates a full item with rolled affixes
- [ ] Implement `rollRarity()` — determines rarity based on round/enemy
- [ ] Implement `rollAffixes()` — picks and rolls affix values
- [ ] Implement ground loot rendering with distinct icons per item type
- [ ] Implement rarity visual effects (glow, beam, particles)
- [ ] Implement pickup mechanic (walk over to collect)
- [ ] Add `_inventory` array and `INVENTORY_MAX` constant
- [ ] Integrate with existing `spawnLoot()` — equipment drops alongside consumables
- [ ] Add pickup HUD notification (slide-in toast)

### Phase 2: Equipment & Inventory UI (Priority: HIGH)
**Goal**: Players can view inventory and equip items

- [ ] Implement inventory overlay UI (grid layout, item slots)
- [ ] Implement equipment slot display (paper doll layout)
- [ ] Implement item detail panel (stats, affixes, rarity)
- [ ] Implement item comparison (current vs new)
- [ ] Implement equip/unequip mechanics
- [ ] Implement `_gearState` calculation — aggregate all equipped item stats
- [ ] Integrate gear stats with combat system (damage, HP, shield, speed, etc.)
- [ ] Add inventory button to HUD
- [ ] Implement end-of-round equip prompt
- [ ] Implement scrap/discard functionality

### Phase 3: Stat Menu Integration (Priority: MEDIUM)
**Goal**: Stat menu shows gear contributions

- [ ] Update `populateStats()` to show gear bonuses alongside perk bonuses
- [ ] Add gear icon indicators in stat rows
- [ ] Show total gear contribution summary in stat menu
- [ ] Update `_perkBonus` / `_perkReduction` helpers to include gear

### Phase 4: Enemy Expansion (Priority: MEDIUM)
**Goal**: More enemy variety

- [ ] Implement Scout, Enforcer, Technician enemy types
- [ ] Implement Berserker, Sniper Elite, Drone Carrier types
- [ ] Implement Elite modifier system (Vampiric, Shielded, Explosive, etc.)
- [ ] Add elite spawn logic to `startRound()`
- [ ] Balance HP/damage/speed for new enemies
- [ ] Add unique visual indicators for each enemy type

### Phase 5: Boss Loot & Unique Items (Priority: MEDIUM)
**Goal**: Bosses drop unique themed items

- [ ] Define boss-specific unique items
- [ ] Add boss drop tables
- [ ] Implement unique item effects (special mechanics beyond stat bonuses)
- [ ] Add unique item visual styling (animated borders, custom icons)

### Phase 6: Arena & Objectives (Priority: LOW)
**Goal**: Level variety and mission objectives

- [ ] Implement arena variant generator (Corridors, Pit, etc.)
- [ ] Implement objective system framework
- [ ] Add objective HUD display
- [ ] Implement Survival, Assassination, Defense objective types
- [ ] Add arena selection/rotation logic
- [ ] Implement arena-specific cover/terrain generation

### Phase 7: New Bosses (Priority: LOW)
**Goal**: End-game boss content

- [ ] Design and implement The Swarm (round 25)
- [ ] Design and implement The Mirror (round 30)
- [ ] Design and implement The Titan (round 35)
- [ ] Design and implement The Core (round 40)
- [ ] Add boss-specific arenas and mechanics

### Phase 8: Polish & Balance (Priority: ONGOING)
**Goal**: Everything feels good

- [ ] Balance drop rates across all rounds
- [ ] Tune affix value ranges
- [ ] Balance new enemies (HP, damage, speed)
- [ ] Add sound effects for all new systems
- [ ] Add screen shake, particles for loot drops
- [ ] Performance optimization (object pooling for drops)
- [ ] Save/load system for inventory between sessions (localStorage)

---

## 14. Technical Architecture

### 14.1 New Global State

```javascript
// ── Inventory & Equipment ──
const INVENTORY_MAX = 30;
let _inventory = [];                    // Item objects in backpack
let _equipped = {                       // Currently equipped items
    L: null, R: null,                   // Weapon slots
    chest: null, arms: null,            // Body slots
    legs: null, shield: null,           // Defense slots
    mod: null, augment: null            // Utility slots
};
let _gearState = {};                    // Computed gear stat bonuses

// ── Loot Groups ──
let equipmentDrops;                     // Phaser group for ground equipment

// ── Scrap Currency ──
let _scrap = 0;
```

### 14.2 New Phaser Groups (in scene.create)

```javascript
equipmentDrops = this.physics.add.group({ allowGravity: false });
```

### 14.3 Integration Points

| System | Integration | Change |
|--------|------------|--------|
| `spawnLoot()` | Add equipment drop logic | Extend existing function |
| `damageEnemy()` (death) | Pass enemy data to spawnLoot | Add `enemyData` parameter |
| `scene.update()` | Add `checkEquipmentPickups()` | New pickup check loop |
| Combat damage calc | Apply `_gearState` bonuses | Modify damage formula |
| Player HP init | Apply gear HP bonuses | Modify `initPlayerComp()` |
| Shield init | Apply gear shield bonuses | Modify shield setup |
| Movement speed | Apply gear speed bonuses | Modify speed calculation |
| `populateStats()` | Show gear + perk combined bonuses | Extend stat display |
| `toggleStats()` | Add inventory tab/button | Extend stat overlay |
| Round clear | Show equip screen | New UI after perk selection |
| `startRound()` | Elite/new enemy spawning | Extend spawn logic |
| `_perkState` reset | Also reset `_gearState` (but keep items) | Add to reset functions |

### 14.4 File Organization

Currently everything is in `index.html`. For the loot system, consider splitting into modules loaded via `<script>` tags:

```
index.html              ← Main game (existing)
js/loot-items.js        ← ITEM_BASES, RARITY_DEFS, AFFIX_POOL definitions
js/loot-generator.js    ← generateItem(), rollRarity(), rollAffixes()
js/loot-renderer.js     ← Ground loot rendering, icon drawing functions
js/inventory.js         ← Inventory UI, equipment slots, item comparison
js/gear-stats.js        ← recalcGearStats(), gear stat application
js/enemies-expanded.js  ← New enemy types, elite modifiers
js/arenas.js            ← Arena variants, objective system
```

---

## 15. Integration with Existing Systems

### 15.1 Perk + Gear Stat Stacking

Perks and gear stack multiplicatively for multipliers, additively for flat bonuses:

```javascript
// Example: Final damage calculation
const baseDmg = weapon.dmg;
const perkDmgMult = _perkState.dmgMult || 1;     // e.g., 1.4 (40% from perks)
const gearDmgFlat = _gearState.dmgFlat || 0;      // e.g., +8 from gear
const gearDmgPct  = (_gearState.dmgPct || 0) / 100; // e.g., 0.12 (12% from gear)

const finalDmg = Math.round((baseDmg + gearDmgFlat) * perkDmgMult * (1 + gearDmgPct));
```

### 15.2 Loadout System Migration

The existing `loadout` object (`loadout.L`, `loadout.R`, etc.) maps weapon *keys* (like `"smg"`, `"sg"`). With the loot system, equipped weapon items contain both the weapon key AND bonus stats. The loadout system stays but references equipped item data:

```javascript
// When equipping a weapon item to L arm:
_equipped.L = weaponItem;
loadout.L = weaponItem.subType;  // Still sets the weapon key for existing systems

// Damage calculation checks _equipped.L for affixes
```

### 15.3 Garage Menu Interaction

The garage menu (pre-deploy loadout selection) continues to work for selecting base chassis, weapons, and mods. Loot equipment is an **additional layer** on top. The garage selects the base; loot items add bonuses.

Future consideration: The garage could show equipped loot items and allow pre-deploy equip management.

### 15.4 Save System

Use `localStorage` to persist:
- `_inventory` (serialized item array)
- `_equipped` (serialized equipped items)
- `_scrap` (currency)

```javascript
function saveInventory() {
    localStorage.setItem('tw_inventory', JSON.stringify(_inventory));
    localStorage.setItem('tw_equipped', JSON.stringify(_equipped));
    localStorage.setItem('tw_scrap', String(_scrap));
}

function loadInventory() {
    try {
        _inventory = JSON.parse(localStorage.getItem('tw_inventory')) || [];
        _equipped = JSON.parse(localStorage.getItem('tw_equipped')) || { L:null, R:null, chest:null, arms:null, legs:null, shield:null, mod:null, augment:null };
        _scrap = parseInt(localStorage.getItem('tw_scrap')) || 0;
    } catch(e) {
        _inventory = [];
        _equipped = { L:null, R:null, chest:null, arms:null, legs:null, shield:null, mod:null, augment:null };
        _scrap = 0;
    }
}
```

---

## Appendix: Quick Reference

### Rarity Colors
```
Common:    #c0c8d0  (white/gray)
Uncommon:  #00ff44  (green)
Rare:      #4488ff  (blue)
Epic:      #aa44ff  (purple)
Legendary: #ffd700  (gold)
```

### Drop Rate Summary
```
Regular enemy:  8-20% equip drop, 30% consumable
Commander:      40% equip drop (min Uncommon), 100% consumable
Medic:          15% equip drop (defense bias), 30% consumable
Boss:           100% equip drop (min Rare), 100% consumable
```

### Stat Abbreviations
```
dmgFlat/dmgPct  = Damage bonus (flat/percent)
critChance      = Critical hit chance
critDmg         = Critical hit damage multiplier
reloadPct       = Reload speed reduction
coreHP/armHP/legHP/allHP = Hit point bonuses
dr              = Damage reduction
shieldHP        = Shield capacity
shieldRegen     = Shield regeneration rate
dodgePct        = Dodge chance
speedPct        = Movement speed
modCdPct        = Mod cooldown reduction
modEffPct       = Mod effectiveness increase
lootMult        = Loot quality bonus
autoRepair      = HP regeneration per second
```
