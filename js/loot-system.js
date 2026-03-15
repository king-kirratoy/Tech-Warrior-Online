// ================================================================
// LOOT SYSTEM — Phase 1: Core Foundation
// Items, rarity, affixes, generation, ground rendering, pickup, inventory
// ================================================================

// ── RARITY DEFINITIONS ─────────────────────────────────────────
const RARITY_DEFS = {
    common:    { label:'Common',    color:0xc0c8d0, colorStr:'#c0c8d0', minAffixes:0, maxAffixes:1, statMult:1.00, affixQualityMin:0.00, affixQualityMax:0.40, dropWeight:45, scrapValue:1 },
    uncommon:  { label:'Uncommon',  color:0x00ff44, colorStr:'#00ff44', minAffixes:1, maxAffixes:2, statMult:1.15, affixQualityMin:0.15, affixQualityMax:0.55, dropWeight:30, scrapValue:3 },
    rare:      { label:'Rare',      color:0x4488ff, colorStr:'#4488ff', minAffixes:2, maxAffixes:3, statMult:1.30, affixQualityMin:0.30, affixQualityMax:0.75, dropWeight:15, scrapValue:8 },
    epic:      { label:'Epic',      color:0xaa44ff, colorStr:'#aa44ff', minAffixes:3, maxAffixes:4, statMult:1.50, affixQualityMin:0.50, affixQualityMax:0.90, dropWeight:8,  scrapValue:20 },
    legendary: { label:'Legendary', color:0xffd700, colorStr:'#ffd700', minAffixes:4, maxAffixes:5, statMult:1.80, affixQualityMin:0.70, affixQualityMax:1.00, dropWeight:2,  scrapValue:50 },
};

// ── ITEM BASE DEFINITIONS ──────────────────────────────────────
// Weapons inherit stats from the existing WEAPONS object at generation time.
// Non-weapon items have their own base stats defined here.
const ITEM_BASES = {
    // ── ARMOR PLATING (chest slot) ──
    light_plate:    { baseType:'armor', name:'Light Plating',     icon:'armor_light',  baseStats:{ coreHP:20, dr:0.02 } },
    medium_plate:   { baseType:'armor', name:'Medium Plating',    icon:'armor_medium', baseStats:{ coreHP:40, dr:0.05 } },
    heavy_plate:    { baseType:'armor', name:'Heavy Plating',     icon:'armor_heavy',  baseStats:{ coreHP:60, dr:0.08 } },
    reactive_plate: { baseType:'armor', name:'Reactive Plating',  icon:'armor_react',  baseStats:{ coreHP:30, dr:0.04 } },

    // ── ARM REINFORCEMENT (arms slot) ──
    servo_enhancer: { baseType:'arms', name:'Servo Enhancer',     icon:'arm_servo',    baseStats:{ armHP:15, reloadPct:-5 } },
    stabilizer:     { baseType:'arms', name:'Stabilizer',         icon:'arm_stab',     baseStats:{ armHP:20, accuracy:5 } },
    power_coupler:  { baseType:'arms', name:'Power Coupler',      icon:'arm_power',    baseStats:{ armHP:10, dmgPct:3 } },

    // ── LEG COMPONENTS (legs slot) ──
    actuator:       { baseType:'legs', name:'Actuator',           icon:'leg_actuator', baseStats:{ legHP:20, speedPct:3 } },
    booster:        { baseType:'legs', name:'Booster',            icon:'leg_booster',  baseStats:{ legHP:15, speedPct:6, dodgePct:2 } },
    dampener:       { baseType:'legs', name:'Dampener',           icon:'leg_dampener', baseStats:{ legHP:30, speedPct:-2, dr:0.03 } },

    // ── SHIELD MODULES (shield slot) ──
    barrier_core:   { baseType:'shield', name:'Barrier Core',     icon:'shield_core',  baseStats:{ shieldHP:15, shieldRegen:5 } },
    regen_cell:     { baseType:'shield', name:'Regen Cell',       icon:'shield_regen', baseStats:{ shieldHP:5,  shieldRegen:15 } },
    absorb_matrix:  { baseType:'shield', name:'Absorb Matrix',    icon:'shield_abs',   baseStats:{ shieldHP:25, absorbPct:5 } },

    // ── MOD CHIPS (mod slot) ──
    cooldown_chip:  { baseType:'mod', name:'Cooldown Chip',       icon:'mod_cd',       baseStats:{ modCdPct:-8 } },
    amplifier:      { baseType:'mod', name:'Amplifier',           icon:'mod_amp',      baseStats:{ modEffPct:10 } },
    overcharge:     { baseType:'mod', name:'Overcharge Module',   icon:'mod_oc',       baseStats:{ modCdPct:-5, modEffPct:5 } },

    // ── AUGMENT CORES (augment slot) ──
    targeting_array: { baseType:'augment', name:'Targeting Array', icon:'aug_target',   baseStats:{ critChance:3, accuracy:5 } },
    neural_link:     { baseType:'augment', name:'Neural Link',    icon:'aug_neural',   baseStats:{ lootMult:5 } },
    combat_matrix:   { baseType:'augment', name:'Combat Matrix',  icon:'aug_combat',   baseStats:{ dmgPct:3, speedPct:2 } },
};

// Which weapon keys from WEAPONS are droppable as loot items
const WEAPON_LOOT_KEYS = ['smg','mg','sg','br','hr','fth','sr','gl','rl','plsm','rail','siege','chain'];

// ── AFFIX POOL ─────────────────────────────────────────────────
const AFFIX_POOL = {
    // Offensive
    dmgFlat:      { label:'+{v} Damage',             min:1,  max:15, weight:10, types:['weapon'] },
    dmgPct:       { label:'+{v}% Damage',            min:3,  max:25, weight:8,  types:['weapon','arms','augment'] },
    critChance:   { label:'+{v}% Crit Chance',       min:2,  max:15, weight:7,  types:['weapon','augment'] },
    critDmg:      { label:'+{v}% Crit Damage',       min:10, max:50, weight:5,  types:['weapon','augment'] },
    reloadPct:    { label:'-{v}% Reload Time',       min:3,  max:20, weight:8,  types:['weapon','arms'] },
    pellets:      { label:'+{v} Pellets',            min:1,  max:3,  weight:3,  types:['weapon'], subTypes:['sg'] },
    splashRadius: { label:'+{v}% Blast Radius',      min:10, max:40, weight:5,  types:['weapon'], subTypes:['gl','rl','plsm','siege'] },

    // Defensive
    coreHP:       { label:'+{v} Core HP',            min:10, max:80, weight:8,  types:['armor'] },
    armHP:        { label:'+{v} Arm HP',             min:5,  max:40, weight:6,  types:['arms'] },
    legHP:        { label:'+{v} Leg HP',             min:5,  max:40, weight:6,  types:['legs'] },
    allHP:        { label:'+{v} All Part HP',        min:5,  max:25, weight:4,  types:['armor','augment'] },
    dr:           { label:'+{v}% Damage Reduction',  min:1,  max:10, weight:5,  types:['armor','legs'] },
    shieldHP:     { label:'+{v} Shield Capacity',    min:5,  max:40, weight:7,  types:['shield'] },
    shieldRegen:  { label:'+{v}% Shield Regen',      min:5,  max:30, weight:6,  types:['shield'] },
    dodgePct:     { label:'+{v}% Dodge Chance',      min:1,  max:8,  weight:4,  types:['legs'] },

    // Utility
    speedPct:     { label:'+{v}% Move Speed',        min:2,  max:12, weight:6,  types:['legs','augment'] },
    modCdPct:     { label:'-{v}% Mod Cooldown',      min:3,  max:20, weight:6,  types:['mod'] },
    modEffPct:    { label:'+{v}% Mod Effectiveness',  min:5,  max:25, weight:5, types:['mod'] },
    lootMult:     { label:'+{v}% Loot Quality',      min:3,  max:15, weight:3,  types:['augment'] },
    autoRepair:   { label:'+{v} HP/sec Regen',       min:1,  max:5,  weight:4,  types:['armor','augment'] },
};

// ── INVENTORY & EQUIPMENT STATE ────────────────────────────────
const INVENTORY_MAX = 30;
let _inventory = [];
let _equipped = {
    L: null, R: null,
    chest: null, arms: null, legs: null,
    shield: null, mod: null, augment: null
};
let _gearState = {};
let _scrap = 0;
let _equipmentDrops = [];  // Array tracking ground equipment drops
let _lootItemIdCounter = 0;
let _lootNotifications = []; // Active pickup toasts

// ── RARITY ROLL ────────────────────────────────────────────────
function rollRarity(round, isCommander, isBoss) {
    let luck = 0;
    luck += Math.min(round * 0.5, 15);
    if (typeof _perkState !== 'undefined') {
        luck += ((_perkState.lootMult || 1) - 1) * 20;
    }
    if (isCommander) luck += 15;
    if (isBoss) luck += 30;

    // Gear affix luck from equipped items
    luck += (_gearState.lootMult || 0) * 0.5;

    const roll = Math.random() * 100;
    const thresholds = {
        legendary: 2 + luck * 0.1,
        epic:      10 + luck * 0.3,
        rare:      25 + luck * 0.5,
        uncommon:  55 + luck * 0.7
    };

    if (roll < thresholds.legendary) return 'legendary';
    if (roll < thresholds.epic)      return 'epic';
    if (roll < thresholds.rare)      return 'rare';
    if (roll < thresholds.uncommon)  return 'uncommon';
    return 'common';
}

// ── AFFIX ROLLING ──────────────────────────────────────────────
function rollAffixes(baseType, subType, rarity) {
    const rarityDef = RARITY_DEFS[rarity];
    const count = Phaser.Math.Between(rarityDef.minAffixes, rarityDef.maxAffixes);

    const eligible = Object.entries(AFFIX_POOL).filter(([key, affix]) => {
        if (!affix.types.includes(baseType)) return false;
        if (affix.subTypes && !affix.subTypes.includes(subType)) return false;
        return true;
    });

    const picked = [];
    const used = new Set();

    for (let i = 0; i < count; i++) {
        const available = eligible.filter(([k]) => !used.has(k));
        if (available.length === 0) break;

        const totalWeight = available.reduce((s, [, a]) => s + a.weight, 0);
        let r = Math.random() * totalWeight;
        let chosen = available[0];
        for (const entry of available) {
            r -= entry[1].weight;
            if (r <= 0) { chosen = entry; break; }
        }

        const [key, affix] = chosen;
        used.add(key);

        const quality = rarityDef.affixQualityMin + Math.random() * (rarityDef.affixQualityMax - rarityDef.affixQualityMin);
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

// ── ITEM GENERATION ────────────────────────────────────────────
function _selectItemType(enemyData) {
    const weights = {
        weapon: 35, armor: 15, arms: 10, legs: 10,
        shield: 10, mod: 10, augment: 10
    };
    if (enemyData?.isMedic) { weights.shield *= 3; weights.armor *= 2; }
    if (enemyData?.isCommander) { weights.weapon *= 2; }

    const total = Object.values(weights).reduce((s, v) => s + v, 0);
    let r = Math.random() * total;
    for (const [type, w] of Object.entries(weights)) {
        r -= w;
        if (r <= 0) return type;
    }
    return 'weapon';
}

function _selectBaseItem(baseType) {
    if (baseType === 'weapon') {
        return WEAPON_LOOT_KEYS[Math.floor(Math.random() * WEAPON_LOOT_KEYS.length)];
    }
    const candidates = Object.entries(ITEM_BASES).filter(([, def]) => def.baseType === baseType);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)][0];
}

function generateItem(round, enemyData) {
    const rarity = rollRarity(round || 1, enemyData?.isCommander, enemyData?.isBoss);
    const rarityDef = RARITY_DEFS[rarity];
    const baseType = _selectItemType(enemyData);
    const baseKey = _selectBaseItem(baseType);
    if (!baseKey) return null;

    let name, icon, subType, baseStats;

    if (baseType === 'weapon') {
        const w = WEAPONS[baseKey];
        if (!w) return null;
        subType = baseKey;
        name = w.name;
        icon = baseKey; // icon key matches weapon key
        baseStats = {};
        if (w.dmg) baseStats.dmg = w.dmg;
        if (w.reload) baseStats.reload = w.reload;
        if (w.pellets) baseStats.pellets = w.pellets;
        if (w.speed) baseStats.speed = w.speed;
        if (w.range) baseStats.range = w.range;
        if (w.radius) baseStats.radius = w.radius;
        if (w.burst) baseStats.burst = w.burst;
    } else {
        const def = ITEM_BASES[baseKey];
        subType = baseKey;
        name = def.name;
        icon = def.icon;
        baseStats = { ...def.baseStats };
    }

    // Item level = round, scale base stats slightly
    const level = round || 1;
    const levelMult = 1 + (level - 1) * 0.03;

    // Apply level and rarity multiplier to numeric base stats
    const scaledStats = {};
    for (const [k, v] of Object.entries(baseStats)) {
        if (typeof v === 'number') {
            scaledStats[k] = Math.round(v * levelMult * rarityDef.statMult);
        } else {
            scaledStats[k] = v;
        }
    }

    // Roll affixes
    const affixes = rollAffixes(baseType, subType, rarity);

    // Generate rarity-colored name
    const fullName = rarity === 'common' ? name : `${rarityDef.label} ${name}`;

    const item = {
        id: 'item_' + (++_lootItemIdCounter),
        baseType,
        subType,
        baseKey,
        name: fullName,
        shortName: name,
        icon,
        rarity,
        level,
        baseStats: scaledStats,
        affixes,
        computedStats: {}
    };

    // Compute final stats: base + affixes
    item.computedStats = { ...scaledStats };
    affixes.forEach(a => {
        item.computedStats[a.stat] = (item.computedStats[a.stat] || 0) + a.value;
    });

    return item;
}

// ── EQUIPMENT DROP CHANCE ──────────────────────────────────────
function _getEquipDropChance(enemyData) {
    const round = (typeof _round !== 'undefined') ? _round : 1;
    if (enemyData?.isBoss) return 1.0;
    if (enemyData?.isCommander) return 0.40;
    if (enemyData?.isElite) return 0.30;         // Elite enemies: 30% drop chance
    if (enemyData?.enemyType) return 0.20;       // Special enemy types: 20% base
    if (enemyData?.isMedic) return 0.15;
    return Math.min(0.08 + round * 0.005, 0.20);
}

// ── GROUND LOOT ICON DRAWING ───────────────────────────────────
// Each icon is drawn as a small Phaser graphics object (~20x20px)
function _drawLootIcon(scene, x, y, iconKey, rarityColor) {
    const g = scene.add.graphics().setDepth(9);
    const c = rarityColor;

    switch (iconKey) {
        // ── WEAPONS ──
        case 'smg':
            g.fillStyle(c, 0.9);
            g.fillRect(x-8, y-2, 16, 4);   // barrel
            g.fillRect(x-4, y-2, 6, 8);    // grip
            g.fillRect(x-10, y-2, 4, 3);   // stock
            break;
        case 'mg':
            g.fillStyle(c, 0.9);
            g.fillRect(x-10, y-2, 20, 5);  // long barrel
            g.fillRect(x-3, y-2, 6, 9);    // grip
            g.fillRect(x+6, y-4, 4, 3);    // sight
            break;
        case 'sg':
            g.fillStyle(c, 0.9);
            g.fillRect(x-8, y-3, 16, 3);   // top barrel
            g.fillRect(x-8, y+0, 16, 3);   // bottom barrel
            g.fillRect(x-4, y-3, 5, 10);   // grip
            break;
        case 'br':
            g.fillStyle(c, 0.9);
            g.fillRect(x-9, y-2, 18, 4);   // barrel
            g.fillRect(x-3, y-2, 5, 8);    // grip
            g.fillRect(x+4, y-5, 6, 3);    // scope
            break;
        case 'hr':
            g.fillStyle(c, 0.9);
            g.fillRect(x-10, y-3, 20, 6);  // big barrel
            g.fillRect(x-4, y-3, 6, 10);   // grip
            g.lineStyle(1, 0xffffff, 0.5);
            g.strokeRect(x-10, y-3, 20, 6);
            break;
        case 'fth':
            g.fillStyle(c, 0.9);
            g.fillRect(x-6, y-2, 12, 4);   // nozzle
            // flame tip
            g.fillStyle(0xff6600, 0.8);
            g.fillCircle(x+8, y, 4);
            g.fillStyle(0xffdd00, 0.6);
            g.fillCircle(x+8, y, 2);
            break;
        case 'sr':
            g.fillStyle(c, 0.9);
            g.fillRect(x-12, y-1, 24, 3);  // long thin barrel
            g.fillRect(x-4, y-1, 4, 7);    // grip
            g.fillRect(x+4, y-4, 4, 3);    // scope
            break;
        case 'gl':
            g.fillStyle(c, 0.9);
            g.fillRect(x-7, y-3, 14, 6);   // tube
            g.fillCircle(x+8, y, 4);       // round end
            g.fillRect(x-3, y-3, 5, 9);    // grip
            break;
        case 'rl':
            g.fillStyle(c, 0.9);
            g.fillRect(x-10, y-4, 20, 8);  // big tube
            g.lineStyle(1, 0xffffff, 0.4);
            g.strokeRect(x-10, y-4, 20, 8);
            g.fillStyle(0xff4400, 0.7);
            g.fillCircle(x+11, y, 3);      // exhaust
            break;
        case 'plsm':
            g.fillStyle(c, 0.9);
            g.fillRect(x-8, y-2, 16, 5);   // body
            g.fillStyle(0x00ffff, 0.7);
            g.fillCircle(x+9, y, 4);       // plasma glow
            g.fillStyle(0x00ffff, 0.3);
            g.fillCircle(x+9, y, 6);
            break;
        case 'rail':
            g.fillStyle(c, 0.9);
            g.fillRect(x-12, y-2, 24, 4);  // long barrel
            g.lineStyle(2, 0x4400ff, 0.6);
            g.lineBetween(x-12, y, x+12, y); // energy line
            g.fillRect(x-4, y-2, 5, 8);    // grip
            break;
        case 'siege':
            g.fillStyle(c, 0.9);
            g.fillRect(x-10, y-5, 20, 10); // massive barrel
            g.lineStyle(2, 0xffffff, 0.4);
            g.strokeRect(x-10, y-5, 20, 10);
            g.fillRect(x-4, y-5, 6, 14);   // grip
            break;
        case 'chain':
            g.fillStyle(c, 0.9);
            g.fillRect(x-10, y-3, 20, 6);  // barrel
            g.fillCircle(x-10, y, 5);      // drum
            g.lineStyle(1, 0xffffff, 0.3);
            g.strokeCircle(x-10, y, 5);
            break;

        // ── ARMOR ──
        case 'armor_light':
        case 'armor_medium':
        case 'armor_heavy':
        case 'armor_react':
            g.fillStyle(c, 0.9);
            // Chestplate shape
            g.fillRect(x-7, y-7, 14, 14);
            g.lineStyle(1, 0xffffff, 0.5);
            g.strokeRect(x-7, y-7, 14, 14);
            // inner detail
            g.lineStyle(1, c, 0.4);
            g.lineBetween(x, y-7, x, y+7);
            break;

        // ── ARMS ──
        case 'arm_servo':
        case 'arm_stab':
        case 'arm_power':
            g.fillStyle(c, 0.9);
            g.fillRect(x-3, y-8, 6, 16);  // arm shape
            g.fillCircle(x, y-8, 4);       // shoulder joint
            g.fillCircle(x, y+8, 3);       // hand joint
            break;

        // ── LEGS ──
        case 'leg_actuator':
        case 'leg_booster':
        case 'leg_dampener':
            g.fillStyle(c, 0.9);
            g.fillRect(x-5, y-8, 4, 16);   // left leg
            g.fillRect(x+1, y-8, 4, 16);   // right leg
            g.fillRect(x-6, y-8, 12, 4);   // hip joint
            break;

        // ── SHIELD ──
        case 'shield_core':
        case 'shield_regen':
        case 'shield_abs':
            g.fillStyle(c, 0.3);
            g.fillCircle(x, y, 10);
            g.lineStyle(2, c, 0.8);
            g.strokeCircle(x, y, 10);
            g.lineStyle(1, c, 0.4);
            g.strokeCircle(x, y, 7);
            break;

        // ── MOD ──
        case 'mod_cd':
        case 'mod_amp':
        case 'mod_oc':
            g.fillStyle(c, 0.9);
            // Chip/circuit board shape
            g.fillRect(x-6, y-6, 12, 12);
            g.lineStyle(1, 0xffffff, 0.5);
            g.strokeRect(x-6, y-6, 12, 12);
            // pins
            g.fillStyle(0xffffff, 0.4);
            g.fillRect(x-8, y-3, 2, 2);
            g.fillRect(x-8, y+1, 2, 2);
            g.fillRect(x+6, y-3, 2, 2);
            g.fillRect(x+6, y+1, 2, 2);
            break;

        // ── AUGMENT ──
        case 'aug_target':
        case 'aug_neural':
        case 'aug_combat':
            g.fillStyle(c, 0.9);
            // Diamond/crystal shape
            g.fillTriangle(x, y-8, x-6, y, x+6, y);
            g.fillTriangle(x, y+8, x-6, y, x+6, y);
            g.lineStyle(1, 0xffffff, 0.4);
            g.lineBetween(x-6, y, x+6, y);
            break;

        default:
            g.fillStyle(c, 0.9);
            g.fillCircle(x, y, 8);
            break;
    }

    return g;
}

// ── GROUND LOOT SPAWNING ───────────────────────────────────────
function spawnEquipmentDrop(scene, x, y, item) {
    if (!item || !scene) return;
    const rarityDef = RARITY_DEFS[item.rarity];

    // Background glow circle
    const glow = scene.add.circle(x, y, 14, rarityDef.color, 0.20).setDepth(7);

    // Item icon
    const icon = _drawLootIcon(scene, x, y, item.icon, rarityDef.color);

    // Item name tag
    const tag = scene.add.text(x, y + 16, item.shortName, {
        font: 'bold 8px Courier New',
        fill: rarityDef.colorStr,
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5).setDepth(9).setAlpha(0.85);

    // Rarity indicator dot
    const rarityDot = scene.add.circle(x, y - 14, 3, rarityDef.color, 0.9).setDepth(9);

    // Float animation
    scene.tweens.add({
        targets: [glow, rarityDot],
        y: '-=5',
        yoyo: true, repeat: -1, duration: 900,
        ease: 'Sine.easeInOut'
    });

    // Glow pulse
    scene.tweens.add({
        targets: glow,
        alpha: 0.35,
        yoyo: true, repeat: -1, duration: 600
    });

    // Rarity-specific visual effects
    let beam = null;
    if (item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary') {
        beam = scene.add.rectangle(x, y - 35, 2, 50, rarityDef.color, 0.25).setDepth(6);
        scene.tweens.add({
            targets: beam,
            alpha: 0.08, yoyo: true, repeat: -1, duration: 700
        });
    }
    if (item.rarity === 'legendary') {
        // Star burst particles
        for (let i = 0; i < 4; i++) {
            const star = scene.add.star(x, y, 4, 2, 5, rarityDef.color, 0.6)
                .setDepth(10).setScale(0.5);
            scene.tweens.add({
                targets: star,
                x: x + Phaser.Math.Between(-25, 25),
                y: y + Phaser.Math.Between(-25, 25),
                alpha: 0, scale: 0,
                duration: 1200 + i * 200,
                onComplete: () => star.destroy()
            });
        }
        // Drop sound
        if (typeof _noise === 'function') {
            _noise(0.12, 0.5, 0, 300, 700);
        }
    }

    const dropData = {
        item,
        glow, icon, tag, rarityDot, beam,
        x, y,
        active: true
    };

    _equipmentDrops.push(dropData);

    // Expire after 30s
    scene.time.delayedCall(30000, () => {
        _removeEquipmentDrop(scene, dropData, true);
    });
}

function _removeEquipmentDrop(scene, drop, fade) {
    if (!drop.active) return;
    drop.active = false;

    const objects = [drop.glow, drop.icon, drop.tag, drop.rarityDot, drop.beam].filter(Boolean);

    if (fade && scene) {
        scene.tweens.add({
            targets: objects.filter(o => o.active !== false),
            alpha: 0, duration: 800,
            onComplete: () => objects.forEach(o => { try { if (o.destroy) o.destroy(); } catch(e){} })
        });
    } else {
        objects.forEach(o => { try { if (o.destroy) o.destroy(); } catch(e){} });
    }

    _equipmentDrops = _equipmentDrops.filter(d => d !== drop);
}

// ── EQUIPMENT PICKUP CHECK (called from update loop) ───────────
function checkEquipmentPickups(scene) {
    if (!player?.active || !isDeployed) return;
    _equipmentDrops.slice().forEach(drop => {
        if (!drop.active) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, drop.x, drop.y);
        if (dist < 45) {
            if (_inventory.length < INVENTORY_MAX) {
                _inventory.push(drop.item);
                _showLootPickupNotification(scene, drop.item);
                if (typeof _noise === 'function') _noise(0.08, 0.25, 0, 500, 1100);
                if (typeof _updateInvCount === 'function') _updateInvCount();
                if (typeof saveInventory === 'function') saveInventory();
                _removeEquipmentDrop(scene, drop, false);
            } else {
                // Inventory full — show warning (throttled)
                if (!drop._fullWarningShown || (scene.time.now - drop._fullWarningShown) > 3000) {
                    drop._fullWarningShown = scene.time.now;
                    _showFloatingWarning(scene, 'INVENTORY FULL', '#ff4444');
                }
            }
        }
    });
}

// ── PICKUP NOTIFICATION TOAST ──────────────────────────────────
function _showLootPickupNotification(scene, item) {
    const rarityDef = RARITY_DEFS[item.rarity];

    // Determine vertical offset based on active notifications
    _lootNotifications = _lootNotifications.filter(n => n.active);
    const yOffset = _lootNotifications.length * 36;

    const baseX = game.config.width - 10;
    const baseY = 80 + yOffset;

    // Build notification text
    const affixText = item.affixes.length > 0
        ? '  ' + item.affixes.map(a => a.label).join(', ')
        : '';
    const displayText = `${rarityDef.label === 'Common' ? '' : rarityDef.label + ' '}${item.shortName}${affixText}`;

    // Background bar
    const bg = scene.add.rectangle(baseX, baseY, 280, 28, 0x0a0f16, 0.92)
        .setOrigin(1, 0.5).setDepth(200).setScrollFactor(0)
        .setStrokeStyle(1, rarityDef.color, 0.6);

    // Rarity stripe on left edge
    const stripe = scene.add.rectangle(baseX - 278, baseY, 3, 28, rarityDef.color, 0.9)
        .setOrigin(0, 0.5).setDepth(201).setScrollFactor(0);

    // Text
    const txt = scene.add.text(baseX - 270, baseY, displayText, {
        font: 'bold 10px Courier New',
        fill: rarityDef.colorStr,
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0, 0.5).setDepth(201).setScrollFactor(0);

    // Slide in from right
    const startX = baseX + 300;
    bg.x = startX;
    stripe.x = startX - 278;
    txt.x = startX - 270;

    const notification = { bg, stripe, txt, active: true };
    _lootNotifications.push(notification);

    scene.tweens.add({
        targets: [bg],
        x: baseX,
        duration: 300,
        ease: 'Power2'
    });
    scene.tweens.add({
        targets: [stripe],
        x: baseX - 278,
        duration: 300,
        ease: 'Power2'
    });
    scene.tweens.add({
        targets: [txt],
        x: baseX - 270,
        duration: 300,
        ease: 'Power2'
    });

    // Fade out after 2.5s
    scene.time.delayedCall(2500, () => {
        scene.tweens.add({
            targets: [bg, stripe, txt],
            alpha: 0,
            duration: 500,
            onComplete: () => {
                notification.active = false;
                bg.destroy(); stripe.destroy(); txt.destroy();
            }
        });
    });
}

function _showFloatingWarning(scene, text, color) {
    const fx = scene.add.text(game.config.width / 2, game.config.height * 0.40, text, {
        font: 'bold 14px Courier New',
        fill: color,
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5).setDepth(200).setScrollFactor(0);
    scene.tweens.add({
        targets: fx, y: fx.y - 30, alpha: 0, duration: 1500,
        onComplete: () => fx.destroy()
    });
}

// ── INTEGRATION: spawnEquipmentLoot (called alongside existing spawnLoot) ──
function spawnEquipmentLoot(scene, x, y, enemyData) {
    const chance = _getEquipDropChance(enemyData);
    if (Math.random() > chance) return;

    const round = (typeof _round !== 'undefined') ? _round : 1;

    // Boss can drop 1-3 items
    if (enemyData?.isBoss) {
        const dropCount = Phaser.Math.Between(1, 3);
        for (let i = 0; i < dropCount; i++) {
            const item = generateItem(round, enemyData);
            if (item) {
                const ox = x + Phaser.Math.Between(-40, 40);
                const oy = y + Phaser.Math.Between(-40, 40);
                spawnEquipmentDrop(scene, ox, oy, item);
            }
        }
    } else {
        const item = generateItem(round, enemyData);
        if (item) {
            spawnEquipmentDrop(scene, x, y, item);
        }
    }
}

// ── GEAR STATE CALCULATION ─────────────────────────────────────
function recalcGearStats() {
    _gearState = {
        dmgFlat:0, dmgPct:0, critChance:0, critDmg:0, reloadPct:0,
        coreHP:0, armHP:0, legHP:0, allHP:0, dr:0,
        shieldHP:0, shieldRegen:0, absorbPct:0, dodgePct:0, speedPct:0,
        modCdPct:0, modEffPct:0, lootMult:0, autoRepair:0,
        pellets:0, splashRadius:0, accuracy:0
    };

    const slots = [_equipped.L, _equipped.R, _equipped.chest, _equipped.arms,
                   _equipped.legs, _equipped.shield, _equipped.mod, _equipped.augment];

    slots.forEach(item => {
        if (!item) return;
        // Add base stats
        if (item.baseStats) {
            Object.entries(item.baseStats).forEach(([k, v]) => {
                if (typeof v === 'number' && k in _gearState) {
                    _gearState[k] += v;
                }
            });
        }
        // Add affix stats
        if (item.affixes) {
            item.affixes.forEach(affix => {
                if (affix.stat in _gearState) {
                    _gearState[affix.stat] += affix.value;
                }
            });
        }
    });
}

// ── CLEANUP (called when returning to hangar/main menu) ────────
function cleanupEquipmentDrops() {
    _equipmentDrops.forEach(drop => {
        [drop.glow, drop.icon, drop.tag, drop.rarityDot, drop.beam]
            .filter(Boolean)
            .forEach(o => { try { if (o.destroy) o.destroy(); } catch(e){} });
    });
    _equipmentDrops = [];
    _lootNotifications = [];
}

// ── SAVE/LOAD (localStorage) ───────────────────────────────────
function saveInventory() {
    try {
        localStorage.setItem('tw_inventory', JSON.stringify(_inventory));
        localStorage.setItem('tw_equipped', JSON.stringify(_equipped));
        localStorage.setItem('tw_scrap', String(_scrap));
    } catch(e) {}
}

function loadInventory() {
    try {
        const inv = localStorage.getItem('tw_inventory');
        const eq = localStorage.getItem('tw_equipped');
        const sc = localStorage.getItem('tw_scrap');
        if (inv) _inventory = JSON.parse(inv);
        if (eq) _equipped = JSON.parse(eq);
        if (sc) _scrap = parseInt(sc) || 0;
        recalcGearStats();
    } catch(e) {
        _inventory = [];
        _equipped = { L:null, R:null, chest:null, arms:null, legs:null, shield:null, mod:null, augment:null };
        _scrap = 0;
    }
}
