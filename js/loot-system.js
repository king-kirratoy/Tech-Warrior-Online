// ================================================================
// LOOT SYSTEM — Phase 1: Core Foundation
// Items, rarity, affixes, generation, ground rendering, pickup, inventory
// ================================================================
//
// ── CROSS-FILE DEPENDENCIES ──────────────────────────────────────
// This file is loaded via <script> in index.html BEFORE enemy-types.js
// and arena-objectives.js. It defines globals used across the codebase.
//
// GLOBALS EXPORTED (used by index.html):
//   _inventory, _equipped, _gearState, _scrap
//   RARITY_DEFS, ITEM_BASES, UNIQUE_ITEMS, AFFIX_POOLS, AFFIX_RANGES
//
// FUNCTIONS CALLED FROM index.html (search "typeof <name>" to find call sites):
//   Phases 1-3: spawnEquipmentLoot, checkEquipmentPickups, recalcGearStats,
//               loadCampaignInventory, loadCampaignProgress, cleanupEquipmentDrops
//   Phase 5 unique effects: hasUniqueEffect, getUnstoppableSpeedBonus,
//               getDualReloadBonus, checkDoubleStrike, spawnModCover,
//               checkImpactArmor, getImpactArmorDR
//   Phase 7 unique effects: triggerSwarmBurst, getAdaptiveArmorDR,
//               checkTitanSmash, triggerTitanSmash, updateColossusStand,
//               getColossusDmgMult, getColossusDR, triggerCoreOverload,
//               triggerMatrixBarrier, isMatrixBarrierActive
//
// GLOBALS READ FROM index.html (must exist before these are called):
//   player, torso, enemies, loadout, isDeployed, _round, _perkState,
//   coverObjects, GAME, Phaser
//
// FUNCTIONS CALLED FROM arena-objectives.js:
//   getObjectiveLootBonus (via rollRarity luck bonus)
//
// FUNCTIONS CALLED BACK INTO index.html:
//   sndEquipDrop, sndEquipPickup (Phase 8 sound functions)
//   _noise (fallback audio)
//   damageEnemy, showDamageText (from unique effect procs)
// ──────────────────────────────────────────────────────────────────

// ── RARITY DEFINITIONS ─────────────────────────────────────────
const RARITY_DEFS = {
    common:    { label:'Common',    color:0xc0c8d0, colorStr:'#c0c8d0', affixCount:0, dropWeight:40, scrapValue:1  },
    uncommon:  { label:'Uncommon',  color:0x00ff44, colorStr:'#00ff44', affixCount:1, dropWeight:30, scrapValue:3  },
    rare:      { label:'Rare',      color:0x4488ff, colorStr:'#4488ff', affixCount:2, dropWeight:18, scrapValue:8  },
    epic:      { label:'Epic',      color:0xaa44ff, colorStr:'#aa44ff', affixCount:3, dropWeight:9,  scrapValue:20 },
    legendary: { label:'Legendary', color:0xffd700, colorStr:'#ffd700', affixCount:4, dropWeight:3,  scrapValue:50 },
};

// ── ITEM BASE DEFINITIONS ──────────────────────────────────────
// Weapons inherit stats from the existing WEAPONS object at generation time.
// Non-weapon items have their own base stats defined here.
const ITEM_BASES = {
    // ── ARMOR PLATING (armor slot) — coreHP is rolled at generation ──
    light_plate:    { baseType:'armor', name:'Light Plating',     icon:'armor_light',  baseStats:{ dr:2 } },
    medium_plate:   { baseType:'armor', name:'Medium Plating',    icon:'armor_medium', baseStats:{ dr:5 } },
    heavy_plate:    { baseType:'armor', name:'Heavy Plating',     icon:'armor_heavy',  baseStats:{ dr:8 } },
    reactive_plate: { baseType:'armor', name:'Reactive Plating',  icon:'armor_react',  baseStats:{ dr:4 } },

    // ── ARM REINFORCEMENT (arms slot) — armHP is rolled at generation ──
    servo_enhancer: { baseType:'arms', name:'Servo Enhancer',     icon:'arm_servo',    baseStats:{ fireRatePct:-5 } },
    stabilizer:     { baseType:'arms', name:'Stabilizer',         icon:'arm_stab',     baseStats:{} },
    power_coupler:  { baseType:'arms', name:'Power Coupler',      icon:'arm_power',    baseStats:{ dmgPct:3 } },

    // ── LEG COMPONENTS (legs slot) — legHP is rolled at generation ──
    actuator:       { baseType:'legs', name:'Actuator',           icon:'leg_actuator', baseStats:{ speedPct:3 } },
    booster:        { baseType:'legs', name:'Booster',            icon:'leg_booster',  baseStats:{ speedPct:6, dodgePct:2 } },
    dampener:       { baseType:'legs', name:'Dampener',           icon:'leg_dampener', baseStats:{ speedPct:-2, dr:3 } },

    // ── SHIELD MODULES (shield slot) — shieldHP is rolled at generation ──
    barrier_core:   { baseType:'shield', name:'Barrier Core',     icon:'shield_core',  baseStats:{ shieldRegen:5 } },
    regen_cell:     { baseType:'shield', name:'Regen Cell',       icon:'shield_regen', baseStats:{ shieldRegen:15 } },
    absorb_matrix:  { baseType:'shield', name:'Absorb Matrix',    icon:'shield_abs',   baseStats:{ absorbPct:5 } },

    // ── CPU CHIPS (cpu slot) — static stats, no primary rolling ──
    cooldown_chip:  { baseType:'cpu', name:'Cooldown Chip',       icon:'mod_cd',       baseStats:{ modCdPct:-8 } },
    amplifier:      { baseType:'cpu', name:'Amplifier',           icon:'mod_amp',      baseStats:{ modEffPct:10 } },
    overcharge:     { baseType:'cpu', name:'Overcharge Module',   icon:'mod_oc',       baseStats:{ modCdPct:-5 } },

    // ── AUGMENT CORES (augment slot) — base stat is randomly rolled at generation ──
    targeting_array: { baseType:'augment', name:'Targeting Array', icon:'aug_target',   baseStats:{} },
    neural_link:     { baseType:'augment', name:'Neural Link',    icon:'aug_neural',   baseStats:{} },
    combat_matrix:   { baseType:'augment', name:'Combat Matrix',  icon:'aug_combat',   baseStats:{} },

    // ══════════════════════════════════════════════════════════════
    // HYBRID SYSTEM ITEMS — carry a real GAME system + stat affixes
    // These replace the hangar equipment selection. Finding a "Jump Jets"
    // drop gives you the jump mod ability AND rarity-scaled bonus stats.
    // ══════════════════════════════════════════════════════════════

    // ── SYSTEM SHIELDS (shield_system slot → sets loadout.shld) — shieldHP rolled at generation ──
    sys_fortress_shield: { baseType:'shield_system', systemKey:'fortress_shield', name:'Fortress Shield',  icon:'shld_fort',    baseStats:{ dr:3 } },
    sys_micro_shield:    { baseType:'shield_system', systemKey:'micro_shield',    name:'Micro Shield',     icon:'shld_micro',   baseStats:{ shieldRegen:8, speedPct:2 } },
    sys_flicker_shield:  { baseType:'shield_system', systemKey:'flicker_shield',  name:'Flicker Shield',   icon:'shld_flicker', baseStats:{ dodgePct:3 } },
    sys_adaptive_shield: { baseType:'shield_system', systemKey:'adaptive_shield', name:'Adaptive Shield',  icon:'shld_adapt',   baseStats:{ dr:2 } },
    sys_bulwark_shield:  { baseType:'shield_system', systemKey:'bulwark_shield',  name:'Bulwark Shield',   icon:'shld_bulwark', baseStats:{ dr:4 } },
    sys_titan_shield:    { baseType:'shield_system', systemKey:'titan_shield',    name:'Titan Shield',     icon:'shld_titan',   baseStats:{ dr:5 } },

    // ── SYSTEM CPU (cpu_system slot → sets loadout.cpu) ──
    sys_jump:             { baseType:'cpu_system', systemKey:'jump',             name:'Jump Jets',         icon:'mod_jump',     baseStats:{ speedPct:3 } },
    sys_barrier:          { baseType:'cpu_system', systemKey:'barrier',          name:'Barrier Module',    icon:'mod_barrier',  baseStats:{ shieldHP:10, dr:2 } },
    sys_rage:             { baseType:'cpu_system', systemKey:'rage',             name:'Rage Inducer',      icon:'mod_rage',     baseStats:{ dmgPct:4 } },
    sys_emp:              { baseType:'cpu_system', systemKey:'emp',              name:'EMP Burst',         icon:'mod_emp',      baseStats:{ modCdPct:-5 } },
    sys_repair:           { baseType:'cpu_system', systemKey:'repair',           name:'Repair Drone',      icon:'mod_repair',   baseStats:{ autoRepair:1 } },
    sys_atk_drone:        { baseType:'cpu_system', systemKey:'atk_drone',       name:'Attack Drone',      icon:'mod_drone',    baseStats:{ dmgPct:2 } },
    sys_missile:          { baseType:'cpu_system', systemKey:'missile',          name:'Missile Pod',       icon:'mod_missile',  baseStats:{ dmgPct:3 } },
    sys_decoy:            { baseType:'cpu_system', systemKey:'decoy',            name:'Decoy Projector',   icon:'mod_decoy',    baseStats:{ speedPct:2 } },
    sys_ghost_step:       { baseType:'cpu_system', systemKey:'ghost_step',       name:'Ghost Step',        icon:'mod_ghost',    baseStats:{ speedPct:3, dodgePct:2 } },
    sys_fortress_mode:    { baseType:'cpu_system', systemKey:'fortress_mode',    name:'Fortress Mode',     icon:'mod_fortress', baseStats:{ dr:3, coreHP:15 } },

    // ── SYSTEM LEGS (leg_system slot → sets loadout.leg) — legHP rolled at generation ──
    sys_hydraulic_boost:  { baseType:'leg_system', systemKey:'hydraulic_boost',  name:'Hydraulic Boost',   icon:'leg_hydro',    baseStats:{ speedPct:5 } },
    sys_gyro_stabilizer:  { baseType:'leg_system', systemKey:'gyro_stabilizer',  name:'Gyro Stabilizer',   icon:'leg_gyro',     baseStats:{} },
    sys_mag_anchors:      { baseType:'leg_system', systemKey:'mag_anchors',      name:'Mag Anchors',       icon:'leg_mag',      baseStats:{ dr:3 } },
    sys_mine_layer:       { baseType:'leg_system', systemKey:'mine_layer',       name:'Mine Layer',        icon:'leg_mine',     baseStats:{ dmgPct:2 } },
    sys_sprint_boosters:  { baseType:'leg_system', systemKey:'sprint_boosters',  name:'Sprint Boosters',   icon:'leg_sprint',   baseStats:{ speedPct:8, dodgePct:2 } },
    sys_featherweight:    { baseType:'leg_system', systemKey:'featherweight',    name:'Featherweight',     icon:'leg_feather',  baseStats:{ speedPct:6, dodgePct:3 } },
    sys_tremor_legs:      { baseType:'leg_system', systemKey:'tremor_legs',      name:'Tremor Legs',       icon:'leg_tremor',   baseStats:{ dmgPct:3 } },

    // ── SYSTEM AUGMENTS (aug_system slot → sets loadout.aug) — base stat rolled at generation ──
    sys_target_painter:   { baseType:'aug_system', systemKey:'target_painter',   name:'Target Painter',    icon:'aug_painter',  baseStats:{} },
    sys_threat_analyzer:  { baseType:'aug_system', systemKey:'threat_analyzer',  name:'Threat Analyzer',   icon:'aug_threat',   baseStats:{} },
    sys_overclock_cpu:    { baseType:'aug_system', systemKey:'overclock_cpu',    name:'Overclock CPU',     icon:'aug_cpu',      baseStats:{} },
    sys_reactive_plating: { baseType:'aug_system', systemKey:'reactive_plating', name:'Reactive Plating',  icon:'aug_plating',  baseStats:{} },
    sys_war_machine:      { baseType:'aug_system', systemKey:'war_machine',      name:'War Machine',       icon:'aug_war',      baseStats:{} },
};

// Which weapon keys from WEAPONS are droppable as loot items.
const WEAPON_LOOT_KEYS = ['smg','mg','sg','br','hr','fth','sr','gl','rl','plsm','rail','siphon'];

// ── UNIQUE BOSS ITEMS ────────────────────────────────────────────
// Each boss has 2 unique drops (both always Legendary). Unique items
// have special passive/proc effects beyond standard stat bonuses.
// Base stats and affixes are rolled at generation time via generateUniqueItem()
// using the same Legendary rolling system as regular loot. The uniqueEffect
// replaces a standard Legendary trait — no legendaryTrait key is assigned.
const UNIQUE_ITEMS = {
    // ── THE WARDEN (Round 5, 25, 45...) ──────────────────────
    wardens_aegis: {
        name: "Warden's Aegis",
        shortName: 'Aegis',
        baseType: 'shield',
        icon: 'shield_core',
        rarity: 'legendary',
        isUnique: true,
        boss: 'warden',
        baseStats: { shieldHP: 45, shieldRegen: 12, absorbPct: 10 },
        affixes: [
            { key:'shieldHP', stat:'shieldHP', value:25, label:'+25 Shield Capacity' },
            { key:'dr', stat:'dr', value:5, label:'+5% Damage Reduction' }
        ],
        uniqueEffect: 'frontalAbsorb',
        uniqueLabel: 'FRONTAL AEGIS: Attacks from the front deal 40% less damage',
        uniqueDesc: 'While shield is active, frontal hits (±60°) take 40% reduced damage.'
    },
    sentinels_plating: {
        name: "Sentinel's Plating",
        shortName: 'Sentinel',
        baseType: 'armor',
        icon: 'armor_heavy',
        rarity: 'epic',
        isUnique: true,
        boss: 'warden',
        baseStats: { coreHP: 55, dr: 6 },
        affixes: [
            { key:'coreHP', stat:'coreHP', value:30, label:'+30 Core HP' },
            { key:'dr', stat:'dr', value:4, label:'+4% Damage Reduction' }
        ],
        uniqueEffect: 'shieldDR',
        uniqueLabel: 'SENTINEL STANCE: +12% DR while shield is full',
        uniqueDesc: 'While shield is at maximum, gain 12% additional damage reduction.'
    },

    // ── TWIN RAZORS (Round 10, 30, 50...) ────────────────────
    razor_edge: {
        name: "Razor Edge",
        shortName: 'Razor',
        baseType: 'weapon',
        subType: 'smg',
        icon: 'smg',
        rarity: 'legendary',
        isUnique: true,
        boss: 'razor',
        baseStats: { dmg: 18, reload: 180, speed: 700 },
        affixes: [
            { key:'dmgPct', stat:'dmgPct', value:15, label:'+15% Damage' },
            { key:'critChance', stat:'critChance', value:8, label:'+8% Crit Chance' },
            { key:'fireRatePct', stat:'fireRatePct', value:10, label:'+10% Fire Rate' }
        ],
        uniqueEffect: 'doubleStrike',
        uniqueLabel: 'TWIN FANGS: Every 3rd shot fires twice',
        uniqueDesc: 'Every 3rd bullet is duplicated, hitting with two projectiles.'
    },
    twinned_servo: {
        name: "Twinned Servo",
        shortName: 'T.Servo',
        baseType: 'arms',
        icon: 'arm_servo',
        rarity: 'epic',
        isUnique: true,
        boss: 'razor',
        baseStats: { armHP: 25, fireRatePct: -8 },
        affixes: [
            { key:'fireRatePct', stat:'fireRatePct', value:12, label:'+12% Fire Rate' },
            { key:'dmgPct', stat:'dmgPct', value:5, label:'+5% Damage' }
        ],
        uniqueEffect: 'dualReload',
        uniqueLabel: 'SYNC SERVOS: Dual-wield weapons reload 30% faster',
        uniqueDesc: 'When both arms have weapons equipped, reload speed is boosted by 30%.'
    },

    // ── THE ARCHITECT (Round 15, 35, 55...) ──────────────────
    blueprint_core: {
        name: "Blueprint Core",
        shortName: 'B.Core',
        baseType: 'cpu',
        icon: 'mod_oc',
        rarity: 'legendary',
        isUnique: true,
        boss: 'architect',
        baseStats: { modCdPct: -12, modEffPct: 15 },
        affixes: [
            { key:'modCdPct', stat:'modCdPct', value:10, label:'-10% Mod Cooldown' },
            { key:'modEffPct', stat:'modEffPct', value:15, label:'+15% Mod Duration %' }
        ],
        uniqueEffect: 'modCover',
        uniqueLabel: 'FABRICATOR: Mod activation spawns a temporary cover wall',
        uniqueDesc: 'Each time you activate your mod, a destructible cover wall spawns at your position.'
    },
    architects_array: {
        name: "Architect's Array",
        shortName: 'A.Array',
        baseType: 'augment',
        icon: 'aug_combat',
        rarity: 'epic',
        isUnique: true,
        boss: 'architect',
        baseStats: { modEffPct: 20 },
        affixes: [
            { key:'modCdPct', stat:'modCdPct', value:8, label:'-8% Mod Cooldown' },
            { key:'modEffPct', stat:'modEffPct', value:25, label:'+25% Mod Duration %' }
        ],
        uniqueEffect: 'modAmplify',
        uniqueLabel: 'OVERCLOCK: Mod durations last 50% longer',
        uniqueDesc: 'All mod durations and effects are extended by 50%.'
    },

    // ── JUGGERNAUT (Round 20, 40, 60...) ─────────────────────
    juggernaut_engine: {
        name: "Juggernaut Engine",
        shortName: 'J.Engine',
        baseType: 'legs',
        icon: 'leg_booster',
        rarity: 'legendary',
        isUnique: true,
        boss: 'juggernaut',
        baseStats: { legHP: 40, speedPct: 8 },
        affixes: [
            { key:'speedPct', stat:'speedPct', value:12, label:'+12% Move Speed' },
            { key:'dodgePct', stat:'dodgePct', value:5, label:'+5% Dodge Chance' },
            { key:'legHP', stat:'legHP', value:20, label:'+20 Leg HP' }
        ],
        uniqueEffect: 'unstoppable',
        uniqueLabel: 'UNSTOPPABLE: Immune to slow effects, +20% speed',
        uniqueDesc: 'Cannot be slowed. Move speed bonus increased by 20%.'
    },
    unstoppable_core: {
        name: "Unstoppable Core",
        shortName: 'U.Core',
        baseType: 'armor',
        icon: 'armor_react',
        rarity: 'epic',
        isUnique: true,
        boss: 'juggernaut',
        baseStats: { coreHP: 70, dr: 5 },
        affixes: [
            { key:'allHP', stat:'allHP', value:15, label:'+15 All Part HP' },
            { key:'dr', stat:'dr', value:6, label:'+6% Damage Reduction' }
        ],
        uniqueEffect: 'impactArmor',
        uniqueLabel: 'IMPACT ARMOR: Taking heavy hits (>25 dmg) grants 3s of +15% DR',
        uniqueDesc: 'When hit for more than 25 damage in one hit, gain 15% bonus DR for 3 seconds.'
    },

    // ── THE SWARM (Round 25, 65, 105...) ─────────────────────
    hive_mind: {
        name: "Hive Mind",
        shortName: 'H.Mind',
        baseType: 'augment',
        icon: 'aug_core',
        rarity: 'legendary',
        isUnique: true,
        boss: 'swarm',
        baseStats: { dmgPct: 8, modEffPct: 10 },
        affixes: [
            { key:'dmgPct', stat:'dmgPct', value:10, label:'+10% Damage' },
            { key:'critChance', stat:'critChance', value:8, label:'+8% Crit Chance' },
            { key:'modCdPct', stat:'modCdPct', value:6, label:'-6% Mod Cooldown' }
        ],
        uniqueEffect: 'swarmBurst',
        uniqueLabel: 'SWARM BURST: Kills release homing drones that seek nearby enemies',
        uniqueDesc: 'Each kill spawns 2 micro-drones that home in on the nearest enemy, dealing 15 damage each.'
    },
    swarm_carapace: {
        name: "Swarm Carapace",
        shortName: 'S.Carapace',
        baseType: 'armor',
        icon: 'armor_heavy',
        rarity: 'epic',
        isUnique: true,
        boss: 'swarm',
        baseStats: { coreHP: 60, dr: 4 },
        affixes: [
            { key:'allHP', stat:'allHP', value:20, label:'+20 All Part HP' },
            { key:'dr', stat:'dr', value:5, label:'+5% Damage Reduction' }
        ],
        uniqueEffect: 'adaptiveArmor',
        uniqueLabel: 'ADAPTIVE: Each consecutive hit from same source deals 10% less',
        uniqueDesc: 'Successive hits from the same enemy deal 10% less damage, stacking up to 40%.'
    },

    // ── THE MIRROR (Round 30, 70, 110...) ─────────────────────
    mirror_shard: {
        name: "Mirror Shard",
        shortName: 'M.Shard',
        baseType: 'weapon',
        icon: 'weapon_plsm',
        rarity: 'legendary',
        isUnique: true,
        boss: 'mirror',
        baseStats: { dmgFlat: 12 },
        affixes: [
            { key:'dmgPct', stat:'dmgPct', value:12, label:'+12% Damage' },
            { key:'critDmg', stat:'critDmg', value:15, label:'+15% Crit Damage' },
            { key:'fireRatePct', stat:'fireRatePct', value:8, label:'+8% Fire Rate' }
        ],
        uniqueEffect: 'mirrorShot',
        uniqueLabel: 'MIRROR SHOT: Bullets reflect off walls once, dealing 60% damage',
        uniqueDesc: 'Your projectiles bounce off cover and walls once, dealing 60% of original damage on the ricochet.'
    },
    echo_frame: {
        name: "Echo Frame",
        shortName: 'E.Frame',
        baseType: 'arms',
        icon: 'arm_servo',
        rarity: 'epic',
        isUnique: true,
        boss: 'mirror',
        baseStats: { armHP: 35, fireRatePct: -5 },
        affixes: [
            { key:'fireRatePct', stat:'fireRatePct', value:8, label:'+8% Fire Rate' }
        ],
        uniqueEffect: 'echoStrike',
        uniqueLabel: 'ECHO: Mod activation fires a phantom copy of your last shot',
        uniqueDesc: 'When you activate a mod, a ghost projectile mimicking your last weapon fires automatically.'
    },

    // ── THE TITAN (Round 35, 75, 115...) ─────────────────────
    titan_fist: {
        name: "Titan Fist",
        shortName: 'T.Fist',
        baseType: 'weapon',
        icon: 'weapon_rl',
        rarity: 'legendary',
        isUnique: true,
        boss: 'titan',
        baseStats: { dmgFlat: 18 },
        affixes: [
            { key:'dmgPct', stat:'dmgPct', value:15, label:'+15% Damage' },
            { key:'splashRadius', stat:'splashRadius', value:20, label:'+20% Splash Radius' },
            { key:'critChance', stat:'critChance', value:5, label:'+5% Crit Chance' }
        ],
        uniqueEffect: 'titanSmash',
        uniqueLabel: 'TITAN SMASH: Every 5th shot creates a shockwave dealing 50% AoE',
        uniqueDesc: 'Every 5th shot fired triggers a shockwave around the impact point, dealing 50% of the shot damage in a 120px radius.'
    },
    colossus_frame: {
        name: "Colossus Frame",
        shortName: 'C.Frame',
        baseType: 'legs',
        icon: 'leg_heavy',
        rarity: 'epic',
        isUnique: true,
        boss: 'titan',
        baseStats: { legHP: 50, speedPct: 3 },
        affixes: [
            { key:'allHP', stat:'allHP', value:25, label:'+25 All Part HP' },
            { key:'dr', stat:'dr', value:4, label:'+4% Damage Reduction' }
        ],
        uniqueEffect: 'colossusStand',
        uniqueLabel: 'COLOSSUS: Standing still for 2s grants +25% damage and +10% DR',
        uniqueDesc: 'After remaining stationary for 2 seconds, gain +25% damage and +10% DR until you move.'
    },

    // ── THE CORE (Round 40, 80, 120...) ─────────────────────
    core_reactor: {
        name: "Core Reactor",
        shortName: 'C.Reactor',
        baseType: 'cpu',
        icon: 'mod_chip',
        rarity: 'legendary',
        isUnique: true,
        boss: 'core',
        baseStats: { modCdPct: -12, modEffPct: 10 },
        affixes: [
            { key:'modCdPct', stat:'modCdPct', value:10, label:'-10% Mod Cooldown' },
            { key:'modEffPct', stat:'modEffPct', value:12, label:'+12% Mod Duration %' },
            { key:'dmgPct', stat:'dmgPct', value:5, label:'+5% Damage' }
        ],
        uniqueEffect: 'coreOverload',
        uniqueLabel: 'CORE OVERLOAD: Mod activation emits a 200px damage pulse (80 dmg)',
        uniqueDesc: 'Each mod activation releases an energy pulse dealing 80 damage to all enemies within 200px.'
    },
    matrix_shield: {
        name: "Matrix Shield",
        shortName: 'M.Shield',
        baseType: 'shield',
        icon: 'shield_regen',
        rarity: 'epic',
        isUnique: true,
        boss: 'core',
        baseStats: { shieldHP: 50, shieldRegen: 3 },
        affixes: [
            { key:'shieldHP', stat:'shieldHP', value:30, label:'+30 Shield HP' },
            { key:'absorbPct', stat:'absorbPct', value:5, label:'+5% Shield Absorb' }
        ],
        uniqueEffect: 'matrixBarrier',
        uniqueLabel: 'MATRIX: Shield break creates a 3s damage-immune bubble (60s CD)',
        uniqueDesc: 'When your shield is broken, gain a 3-second invulnerability bubble. 60 second cooldown.'
    }
};

// Boss drop table: which unique items each boss can drop
const BOSS_DROP_TABLE = {
    warden:     { legendary: 'wardens_aegis',     epic: 'sentinels_plating' },
    razor:      { legendary: 'razor_edge',        epic: 'twinned_servo' },
    architect:  { legendary: 'blueprint_core',    epic: 'architects_array' },
    juggernaut: { legendary: 'juggernaut_engine', epic: 'unstoppable_core' },
    swarm:      { legendary: 'hive_mind',         epic: 'swarm_carapace' },
    mirror:     { legendary: 'mirror_shard',      epic: 'echo_frame' },
    titan:      { legendary: 'titan_fist',        epic: 'colossus_frame' },
    core:       { legendary: 'core_reactor',      epic: 'matrix_shield' }
};

// Generate a unique boss item from a template.
// All boss uniques are always Legendary. Base stats are rolled using the same
// system as generateItem() for Legendary items. 4 affixes are rolled from the
// Legendary affix pool. The unique effect is preserved exactly as-is and is
// displayed in place of a standard Legendary trait.
function generateUniqueItem(uniqueKey, round) {
    const template = UNIQUE_ITEMS[uniqueKey];
    if (!template) return null;

    const level = round || 1;
    const bt = template.baseType;

    // ── Roll base stats (Legendary tier, same as generateItem) ────
    let baseStats = {};
    let _augBaseStatKey = null;

    if (bt === 'weapon') {
        const weaponKey = template.subType;
        const wDef = (weaponKey && typeof WEAPONS !== 'undefined') ? WEAPONS[weaponKey] : null;
        if (wDef && wDef.dmg) {
            // Weapon with recognised subType — roll dmg in [floor, floor × 1.10]
            const floor = wDef.dmg;
            baseStats.dmg = Math.round(floor + Math.random() * floor * 0.10);
            if (wDef.fireRate) baseStats.fireRate = wDef.fireRate;
            if (wDef.pellets)  baseStats.pellets  = wDef.pellets;
            if (wDef.speed)    baseStats.speed    = wDef.speed;
            if (wDef.range)    baseStats.range    = wDef.range;
            if (wDef.radius)   baseStats.radius   = wDef.radius;
            if (wDef.burst)    baseStats.burst    = wDef.burst;
        } else {
            // Unique weapon using dmgFlat (no standard subType) — roll in [floor, floor × 1.10]
            const floor = template.baseStats.dmgFlat || 0;
            baseStats.dmgFlat = Math.round(floor + Math.random() * floor * 0.10);
        }
    } else if (bt === 'armor') {
        baseStats.coreHP = Math.round(30 + Math.random() * 20);  // Legendary [30,50]
        if (template.baseStats.dr !== undefined) baseStats.dr = template.baseStats.dr;
    } else if (bt === 'arms') {
        baseStats.armHP = Math.round(30 + Math.random() * 20);   // Legendary [30,50]
        if (template.baseStats.fireRatePct !== undefined) baseStats.fireRatePct = template.baseStats.fireRatePct;
    } else if (bt === 'shield') {
        baseStats.shieldHP = Math.round(125 + Math.random() * 50); // Legendary [125,175]
        if (template.baseStats.shieldRegen !== undefined) baseStats.shieldRegen = template.baseStats.shieldRegen;
        if (template.baseStats.absorbPct   !== undefined) baseStats.absorbPct   = template.baseStats.absorbPct;
    } else if (bt === 'legs') {
        baseStats.legHP = Math.round(30 + Math.random() * 20);   // Legendary [30,50]
        if (template.baseStats.speedPct !== undefined) baseStats.speedPct = template.baseStats.speedPct;
        if (template.baseStats.dodgePct !== undefined) baseStats.dodgePct = template.baseStats.dodgePct;
    } else if (bt === 'cpu') {
        // Roll modCdPct magnitude in Legendary range [5,8], stored as negative
        const mag = 5 + Math.round(Math.random() * 3);
        baseStats.modCdPct = -mag;
        if (template.baseStats.modEffPct !== undefined) baseStats.modEffPct = template.baseStats.modEffPct;
    } else if (bt === 'augment') {
        // Roll one stat from augment pool — Legendary tier values (same pool as generateItem)
        const _augPool = [
            { key:'dmgPct',      lo:5,  hi:15 },
            { key:'fireRatePct', lo:5,  hi:15 },
            { key:'critChance',  lo:5,  hi:12 },
            { key:'critDmg',     lo:15, hi:40 },
            { key:'dr',          lo:5,  hi:12 },
            { key:'shieldHP',    lo:15, hi:40 },
            { key:'shieldRegen', lo:10, hi:30 },
            { key:'absorbPct',   lo:4,  hi:10 },
            { key:'speedPct',    lo:5,  hi:15 },
            { key:'dodgePct',    lo:4,  hi:10 },
        ];
        const pick = _augPool[Math.floor(Math.random() * _augPool.length)];
        // Inverted stats (fireRatePct) stored negative — negative = buff per convention
        const rawUniqueAugVal = Math.round(pick.lo + Math.random() * (pick.hi - pick.lo));
        baseStats = { [pick.key]: (pick.key === 'fireRatePct') ? -rawUniqueAugVal : rawUniqueAugVal };
        _augBaseStatKey = pick.key;
    } else {
        baseStats = { ...template.baseStats };
    }

    // ── Roll 4 affixes using the Legendary affix system ───────────
    const _affixTypeMap = { shield_system:'shield', cpu_system:'cpu', leg_system:'legs', aug_system:'augment' };
    const affixType = _affixTypeMap[bt] || bt;
    const affixes = rollAffixes(affixType, 'legendary', _augBaseStatKey);

    const item = {
        id: 'item_' + (++_lootItemIdCounter),
        baseType: template.baseType,
        subType: template.subType || uniqueKey,
        baseKey: uniqueKey,
        name: template.name,
        shortName: template.shortName,
        icon: template.icon,
        rarity: 'legendary',
        level,
        baseStats,
        affixes,
        computedStats: {},
        isUnique: true,
        uniqueEffect: template.uniqueEffect,
        uniqueLabel: template.uniqueLabel,
        uniqueDesc: template.uniqueDesc,
        boss: template.boss
    };

    // Compute final stats: base + affixes
    item.computedStats = { ...baseStats };
    affixes.forEach(a => {
        item.computedStats[a.stat] = (item.computedStats[a.stat] || 0) + a.value;
    });

    return item;
}

// Roll boss-specific drops: 1 guaranteed unique + regular drops
function rollBossDrops(bossType, round) {
    const table = BOSS_DROP_TABLE[bossType];
    if (!table) return [];

    const drops = [];

    // Guaranteed unique drop: 50/50 between the two boss uniques (both Legendary)
    const uniqueKey = Math.random() < 0.5 ? table.legendary : table.epic;
    const uniqueItem = generateUniqueItem(uniqueKey, round);
    if (uniqueItem) drops.push(uniqueItem);

    // Additional regular drops (1-2)
    const extraCount = Phaser.Math.Between(1, 2);
    for (let i = 0; i < extraCount; i++) {
        const item = generateItem(round, { isBoss: true });
        if (item) drops.push(item);
    }

    return drops;
}

// ── LEGENDARY TRAIT TABLES ────────────────────────────────────
// Maps item subtype (weapon key or cpu/leg systemKey) to a list of
// eligible trait perk keys. One perk is randomly selected for each
// Legendary item at generation time and stored as item.legendaryTrait.
// Item types without an entry here (augments, shields, armor, arms,
// standard cpu/leg chips) do not receive traits.
// NOTE: Some keys here are in _hiddenPerks (smg_ricochet, mg_explosive_tips,
// rail_chain_lightning, hr_concussive, rl_napalm) — they exist in _perks
// and are valid for trait application even while hidden from warzone menus.
const LEGENDARY_TRAITS = {
  // ── Weapons ──────────────────────────────────────────────────
  smg:            ['smg_lifesteal', 'smg_suppressor', 'smg_ricochet'],
  sg:             ['sg_momentum', 'sg_buckshot', 'sg_lifesteal'],
  fth:            ['fth_napalm_strike', 'fth_pressure_spray', 'fth_meltdown_core'],
  siphon:         ['siphon_wide', 'siphon_leech_shield', 'siphon_deep_drain'],
  mg:             ['mg_explosive_tips', 'mg_overheat', 'mg_headshot'],
  br:             ['br_explosive_tip', 'br_stagger', 'br_mag_size'],
  sr:             ['sr_explosive', 'sr_legendary', 'sr_mark'],
  rail:           ['rail_chain_lightning', 'rail_emp_trail', 'rail_splinter'],
  hr:             ['hr_legendary', 'hr_concussive', 'hr_splash'],
  rl:             ['rl_napalm', 'rl_cluster_war', 'rl_lock_on'],
  plsm:           ['plsm_nova', 'plsm_pierce', 'plsm_emp_burst'],
  gl:             ['gl_legendary', 'gl_incendiary', 'gl_concuss'],
  // ── CPU Mods (matched against item.systemKey) ─────────────────
  barrier:        ['barrier_heal', 'barrier_reflect'],
  jump:           ['jump_double_tap', 'jump_afterimage'],
  decoy:          ['decoy_phantom_army', 'decoy_multi'],
  ghost_step:     ['gs_legendary', 'gs_double'],
  rage:           ['rage_legendary', 'rage_lifesteal'],
  atk_drone:      ['drone_autonomous_unit', 'drone_shield'],
  repair:         ['repair_legendary', 'repair_double'],
  missile:        ['missile_incend', 'missile_legendary'],
  fortress_mode:  ['fm_legendary', 'fm_aoe'],
  emp:            ['emp_legendary', 'emp_detonate'],
  // ── Leg Systems (matched against item.systemKey) ──────────────
  hydraulic_boost:  ['hb_trail', 'hb_overdrive'],
  seismic_dampener: ['sd_legendary', 'sd_stagger'],
  featherweight:    ['fw_adrenaline', 'fw_crit'],
  ghost_legs:       ['gleg_heal', 'gleg_emp'],
  mine_layer:       ['ml_legendary', 'ml_emp'],
  sprint_boosters:  ['sb_trail', 'sb_legendary'],
  reactor_legs:     ['rl2_aoe', 'rl2_heal'],
  mag_anchors:      ['ma_legendary', 'ma_aoe_lock'],
  tremor_legs:      ['tl_legendary', 'tl_heal'],
  suppressor_legs:  ['sl_legendary', 'sl_fire2'],
  warlord_stride:   ['ws_legendary', 'ws_shield'],
};

// ── AFFIX POOLS — eligible affix keys per item type ────────────
// System item types (shield_system, cpu_system, leg_system, aug_system)
// are mapped to their parent type before pool lookup (see _affixTypeMap).
const AFFIX_POOLS = {
    weapon:  ['dmgPct', 'fireRatePct', 'critDmg'],
    cpu:     ['modCdPct', 'modEffPct', 'shieldRegen'],
    augment: ['dmgPct', 'fireRatePct', 'critChance', 'critDmg', 'dr', 'shieldHP', 'shieldRegen', 'absorbPct', 'speedPct', 'dodgePct'],
    arms:    ['armHP', 'critChance', 'critDmg'],
    armor:   ['coreHP', 'shieldHP', 'dr'],
    shield:  ['shieldHP', 'shieldRegen', 'absorbPct'],
    legs:    ['legHP', 'speedPct', 'dodgePct'],
};

// ── AFFIX VALUE RANGES ─────────────────────────────────────────
// std: [min, max] for Common–Epic; leg: [min, max] for Legendary.
// Percentage affixes and HP affixes both round to integers.
const AFFIX_RANGES = {
    fireRatePct: { std:[2,5],   leg:[5,8],   label:'+{v}% Fire Rate'        },
    dmgPct:      { std:[2,5],   leg:[5,8],   label:'+{v}% Damage'           },
    critChance:  { std:[5,10],  leg:[10,15], label:'+{v}% Crit Chance'      },
    critDmg:     { std:[10,20], leg:[20,30], label:'+{v}% Crit Damage'      },
    dr:          { std:[2,5],   leg:[5,8],   label:'+{v}% Damage Reduction' },
    shieldHP:    { std:[10,30], leg:[30,50], label:'+{v} Shield HP'         },
    shieldRegen: { std:[2,5],   leg:[5,8],   label:'+{v} Shield Regen'      },
    absorbPct:   { std:[2,5],   leg:[5,8],   label:'+{v}% Shield Absorb'    },
    speedPct:    { std:[2,5],   leg:[5,8],   label:'+{v}% Move Speed'       },
    dodgePct:    { std:[2,5],   leg:[5,8],   label:'+{v}% Dodge'            },
    coreHP:      { std:[10,30], leg:[30,50], label:'+{v} Core HP'           },
    armHP:       { std:[10,30], leg:[30,50], label:'+{v} Arm HP'            },
    legHP:       { std:[10,30], leg:[30,50], label:'+{v} Leg HP'            },
    modCdPct:    { std:[2,5],   leg:[5,8],   label:'-{v}% Mod Cooldown'     },
    modEffPct:   { std:[2,5],   leg:[5,8],   label:'+{v}% Mod Duration'     },
};

// ── ITEM NAMING SYSTEM ─────────────────────────────────────────
// Tier prefix by rarity (derived from affix count).
const TIER_PREFIX = {
    common:    'Basic',
    uncommon:  'Enhanced',
    rare:      'Advanced',
    epic:      'Elite',
    legendary: 'Prototype',
};

// Display names for CPU mod system keys.
const CPU_MOD_DISPLAY_NAMES = {
    barrier:       'Barrier',
    jump:          'Jump Jets',
    decoy:         'Decoy',
    ghost_step:    'Ghost Step',
    atk_drone:     'Attack Drone',
    repair:        'Repair Drone',
    rage:          'Rage',
    missile:       'Missile Pod',
    fortress_mode: 'Fortress Mode',
    emp:           'EMP Burst',
};

// Returns the type-specific portion of an item name.
function _getItemTypeName(baseType, subType, systemKey) {
    switch (baseType) {
        case 'weapon':
            return (typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[subType] : null) || subType;
        case 'cpu_system':
            return CPU_MOD_DISPLAY_NAMES[systemKey] || systemKey || 'Module';
        case 'armor':         return 'Plating';
        case 'arms':          return 'Servos';
        case 'shield':
        case 'shield_system': return 'Generator';
        case 'legs':
        case 'leg_system':    return 'Frame';
        case 'augment':
        case 'aug_system':    return 'Module';
        case 'cpu':           return 'Module';
        default:              return baseType;
    }
}

// ── INVENTORY & EQUIPMENT STATE ────────────────────────────────
const INVENTORY_MAX = 20;
let _inventory = [];
let _equipped = {
    L: null, R: null,
    armor: null, arms: null, legs: null,
    shield: null, cpu: null, augment: null
};
let _gearState = {};
let _scrap = 0;
let _equipmentDrops = [];  // Array tracking ground equipment drops
const _MAX_GROUND_DROPS = 20; // Cap to prevent scene overload
let _lootItemIdCounter = 0;
let _lootNotifications = []; // Active pickup toasts
let _scrapDrops = [];  // Array tracking ground scrap coin pickups

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
    // Phase 6: objective completion bonus to loot quality
    if (typeof getObjectiveLootBonus === 'function') {
        const bonus = getObjectiveLootBonus();
        if (bonus > 1) luck += (bonus - 1) * 30; // e.g. 1.5x = +15 luck
    }

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
// baseType:      item type after system-type mapping (e.g. 'weapon', 'armor', 'shield')
// rarity:        rarity key
// excludeStatKey: optional — stat key already used as augment base stat (excluded from pool)
function rollAffixes(baseType, rarity, excludeStatKey) {
    const count = RARITY_DEFS[rarity].affixCount;
    if (count === 0) return [];

    const pool = (AFFIX_POOLS[baseType] || []).slice(); // copy
    const isLegendary = rarity === 'legendary';

    // For augments, remove the base stat from the affix pool
    const eligiblePool = excludeStatKey
        ? pool.filter(k => k !== excludeStatKey)
        : pool;

    const actualCount = Math.min(count, eligiblePool.length);
    const available = eligiblePool.slice(); // shuffle-from copy
    const picked = [];

    for (let i = 0; i < actualCount; i++) {
        // Random selection without replacement
        const idx = Math.floor(Math.random() * available.length);
        const key = available.splice(idx, 1)[0];

        const rangeDef = AFFIX_RANGES[key];
        if (!rangeDef) continue;

        const [lo, hi] = isLegendary ? rangeDef.leg : rangeDef.std;
        // Inverted stats (fireRatePct, modCdPct) are stored negative — a buff is negative per convention
        const rawVal = Math.round(lo + Math.random() * (hi - lo));
        const value = (key === 'fireRatePct' || key === 'modCdPct') ? -rawVal : rawVal;

        picked.push({
            key,
            stat: key,
            value,
            label: rangeDef.label.replace('{v}', Math.abs(value)),
        });
    }

    return picked;
}

// ── ITEM GENERATION ────────────────────────────────────────────
function _selectItemType(enemyData) {
    const weights = {
        weapon: 10, armor: 10, arms: 10, legs: 10,
        shield: 10, augment: 10,
        // System drops — the main way to get new equipment (cpu_system replaces plain cpu)
        shield_system: 10, cpu_system: 10, leg_system: 10, aug_system: 10
    };
    if (enemyData?.isMedic) { weights.shield_system *= 2; weights.shield *= 2; weights.armor *= 2; }
    if (enemyData?.isCommander) { weights.weapon *= 2; weights.cpu_system *= 2; }
    if (enemyData?.isBoss) { weights.cpu_system *= 2; weights.aug_system *= 2; weights.shield_system *= 2; }
    if (enemyData?.isElite) { weights.leg_system *= 2; weights.shield_system *= 1.5; }

    const total = Object.values(weights).reduce((s, v) => s + v, 0);
    let r = Math.random() * total;
    for (const [type, w] of Object.entries(weights)) {
        r -= w;
        if (r <= 0) return type;
    }
    return 'weapon';
}

function _selectBaseItem(baseType) {
    // Filter drops to items the current chassis can equip
    const ch = (typeof loadout !== 'undefined') ? loadout.chassis : 'medium';
    if (baseType === 'weapon') {
        const allowed = typeof CHASSIS_WEAPONS !== 'undefined' ? CHASSIS_WEAPONS[ch] : null;
        const pool = allowed ? WEAPON_LOOT_KEYS.filter(k => k !== 'none' && allowed.has(k)) : WEAPON_LOOT_KEYS;
        if (pool.length === 0) return WEAPON_LOOT_KEYS[Math.floor(Math.random() * WEAPON_LOOT_KEYS.length)];
        return pool[Math.floor(Math.random() * pool.length)];
    }
    let candidates = Object.entries(ITEM_BASES).filter(([, def]) => def.baseType === baseType);
    // For system items, filter by chassis restrictions
    if (baseType === 'shield_system') {
        const allowed = typeof CHASSIS_SHIELDS !== 'undefined' ? CHASSIS_SHIELDS[ch] : null;
        if (allowed) candidates = candidates.filter(([, def]) => allowed.has(def.systemKey));
    } else if (baseType === 'cpu_system') {
        const allowed = typeof CHASSIS_CPUS !== 'undefined' ? CHASSIS_CPUS[ch] : null;
        if (allowed) candidates = candidates.filter(([, def]) => allowed.has(def.systemKey));
    } else if (baseType === 'leg_system') {
        const allowed = typeof CHASSIS_LEGS !== 'undefined' ? CHASSIS_LEGS[ch] : null;
        if (allowed) candidates = candidates.filter(([, def]) => allowed.has(def.systemKey));
    } else if (baseType === 'aug_system') {
        const allowed = typeof CHASSIS_AUGS !== 'undefined' ? CHASSIS_AUGS[ch] : null;
        if (allowed) candidates = candidates.filter(([, def]) => allowed.has(def.systemKey));
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)][0];
}

function generateItem(round, enemyData) {
    const rarity = rollRarity(round || 1, enemyData?.isCommander, enemyData?.isBoss);
    const baseType = _selectItemType(enemyData);
    const baseKey = _selectBaseItem(baseType);
    if (!baseKey) return null;

    const isLegendary = rarity === 'legendary';
    let name, icon, subType, baseStats;
    let _augBaseStatKey = null; // tracks augment base stat to exclude from affix pool

    if (baseType === 'weapon') {
        // ── Step 1/2: Weapons roll Damage % base stat ──
        // Base damage is always the hardcoded WEAPONS[key].dmg value.
        // The rolled Damage % is a bonus ON TOP of that base.
        const w = WEAPONS[baseKey];
        if (!w) return null;
        subType = baseKey;
        icon = baseKey; // icon key matches weapon key
        // Damage % roll: Common-Epic [2,5]%, Legendary [5,8]%
        const [wpnPctLo, wpnPctHi] = isLegendary ? [5, 8] : [2, 5];
        const rolledDmgPct = Math.round(wpnPctLo + Math.random() * (wpnPctHi - wpnPctLo));
        baseStats = { dmgPct: rolledDmgPct };
    } else {
        const def = ITEM_BASES[baseKey];
        subType = baseKey;
        icon = def.icon;
        // Copy secondary stats from ITEM_BASES; primary stat is rolled below
        baseStats = { ...def.baseStats };

        if (baseType === 'cpu_system') {
            // ── Step 3: CPU mod — base stat is Mod Cooldown % only ──
            // Base cooldown is always the hardcoded WEAPONS[systemKey].cooldown value.
            // The rolled Mod Cooldown % is a reduction ON TOP of that base.
            // Stored negative: negative = buff per convention.
            const [cpuPctLo, cpuPctHi] = isLegendary ? [5, 8] : [2, 5];
            const rolledCdPct = Math.round(cpuPctLo + Math.random() * (cpuPctHi - cpuPctLo));
            baseStats = { modCdPct: -rolledCdPct };
        } else if (baseType === 'armor') {
            // ── Step 4: Armor — sole base stat is Core HP ──
            const [lo, hi] = isLegendary ? [30, 50] : [10, 30];
            baseStats = { coreHP: Math.round(lo + Math.random() * (hi - lo)) };
        } else if (baseType === 'arms') {
            // ── Step 4: Arms — sole base stat is Arm HP ──
            const [lo, hi] = isLegendary ? [30, 50] : [10, 30];
            baseStats = { armHP: Math.round(lo + Math.random() * (hi - lo)) };
        } else if (baseType === 'shield' || baseType === 'shield_system') {
            // ── Step 4: Shield — sole base stat is Shield HP ──
            const [lo, hi] = isLegendary ? [125, 175] : [75, 125];
            baseStats = { shieldHP: Math.round(lo + Math.random() * (hi - lo)) };
        } else if (baseType === 'legs' || baseType === 'leg_system') {
            // ── Step 4: Legs — sole base stat is Leg HP ──
            const [lo, hi] = isLegendary ? [30, 50] : [10, 30];
            baseStats = { legHP: Math.round(lo + Math.random() * (hi - lo)) };
        } else if (baseType === 'augment' || baseType === 'aug_system') {
            // ── Step 4: Augment — randomly pick and roll one stat from pool ──
            const _augPool = [
                { key:'dmgPct',      lo:2, hi:8,  legLo:5,  legHi:15 },
                { key:'fireRatePct', lo:2, hi:8,  legLo:5,  legHi:15 },
                { key:'critChance',  lo:1, hi:6,  legLo:5,  legHi:12 },
                { key:'critDmg',     lo:5, hi:20, legLo:15, legHi:40 },
                { key:'dr',          lo:1, hi:6,  legLo:5,  legHi:12 },
                { key:'shieldHP',    lo:5, hi:20, legLo:15, legHi:40 },
                { key:'shieldRegen', lo:3, hi:15, legLo:10, legHi:30 },
                { key:'absorbPct',   lo:1, hi:5,  legLo:4,  legHi:10 },
                { key:'speedPct',    lo:2, hi:8,  legLo:5,  legHi:15 },
                { key:'dodgePct',    lo:1, hi:5,  legLo:4,  legHi:10 },
            ];
            const pick = _augPool[Math.floor(Math.random() * _augPool.length)];
            const lo = isLegendary ? pick.legLo : pick.lo;
            const hi = isLegendary ? pick.legHi : pick.hi;
            // Augment base stat is entirely the rolled pick (replaces static ITEM_BASES entry)
            // Inverted stats (fireRatePct) stored negative — negative = buff per convention
            const rawAugVal = Math.round(lo + Math.random() * (hi - lo));
            const augVal = (pick.key === 'fireRatePct') ? -rawAugVal : rawAugVal;
            baseStats = { [pick.key]: augVal };
            _augBaseStatKey = pick.key; // exclude from affix pool
        }
    }

    // Roll affixes — system items use their parent slot type for affix pool
    const _affixTypeMap = { shield_system:'shield', cpu_system:'cpu', leg_system:'legs', aug_system:'augment' };
    const affixType = _affixTypeMap[baseType] || baseType;
    const affixes = rollAffixes(affixType, rarity, _augBaseStatKey);

    // For system items, carry the systemKey so equip logic can activate the GAME system
    const _baseDef = ITEM_BASES[baseKey];
    const systemKey = _baseDef?.systemKey || null;

    // Compute item name using the tier+type naming system
    name = `${TIER_PREFIX[rarity]} ${_getItemTypeName(baseType, subType, systemKey)}`;

    const item = {
        id: 'item_' + (++_lootItemIdCounter),
        baseType,
        subType,
        baseKey,
        name,
        shortName: name,
        icon,
        rarity,
        level: round || 1,
        baseStats,
        affixes,
        computedStats: {},
        systemKey
    };

    // Compute final stats: base + affixes
    item.computedStats = { ...baseStats };
    affixes.forEach(a => {
        item.computedStats[a.stat] = (item.computedStats[a.stat] || 0) + a.value;
    });

    // ── Legendary trait selection ─────────────────────────────────
    // Weapons use subType directly; cpu_system and leg_system use systemKey.
    // Augments, shields, armor, arms, plain cpu/leg chips get no trait.
    if (isLegendary) {
        let _traitLookupKey = null;
        if (baseType === 'weapon') {
            _traitLookupKey = subType;
        } else if (baseType === 'cpu_system' || baseType === 'leg_system') {
            _traitLookupKey = systemKey;
        }
        if (_traitLookupKey && LEGENDARY_TRAITS[_traitLookupKey]) {
            const _pool = LEGENDARY_TRAITS[_traitLookupKey];
            item.legendaryTrait = _pool[Math.floor(Math.random() * _pool.length)];
        }
    }

    return item;
}

// ── EQUIPMENT DROP CHANCE ──────────────────────────────────────
function _getEquipDropChance(enemyData) {
    if (enemyData?.isBoss)   return 1.0;   // 100% — boss always drops
    if (enemyData?.isElite)  return 0.75;  // 75%  — elite drop chance
    return 0.50;                           // 50%  — normal enemy drop chance
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
        case 'leg_heavy':
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
        case 'mod_chip':
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
        case 'aug_core':
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
// spawnEquipmentDrop(scene, x, y, item [, fromX, fromY, delay])
//   x, y     = final landing position
//   fromX/Y  = death position (arc origin); omit for instant-appear
//   delay    = ms stagger before arc launches (for multi-drop)
function spawnEquipmentDrop(scene, x, y, item, fromX, fromY, delay) {
    if (!item || !scene) return;
    // Cap active ground drops — remove oldest common/uncommon first
    while (_equipmentDrops.length >= _MAX_GROUND_DROPS) {
        const oldest = _equipmentDrops.find(d => d.active && (d.item.rarity === 'common' || d.item.rarity === 'uncommon'))
            || _equipmentDrops.find(d => d.active);
        if (oldest) _removeEquipmentDrop(scene, oldest, true);
        else break;
    }
    const rarityDef = RARITY_DEFS[item.rarity];
    const rc = rarityDef.color;

    // ── Beam height & intensity scale by rarity ──
    const _beamDefs = {
        common:    { h: 60,  w: 3,  glowR: 10, coreW: 1,  baseR: 8,  glowA: 0.10, coreA: 0.30, pulseA: 0.04 },
        uncommon:  { h: 80,  w: 4,  glowR: 12, coreW: 1.5,baseR: 10, glowA: 0.14, coreA: 0.40, pulseA: 0.06 },
        rare:      { h: 110, w: 5,  glowR: 16, coreW: 2,  baseR: 14, glowA: 0.18, coreA: 0.50, pulseA: 0.08 },
        epic:      { h: 140, w: 6,  glowR: 20, coreW: 2.5,baseR: 16, glowA: 0.22, coreA: 0.60, pulseA: 0.10 },
        legendary: { h: 180, w: 8,  glowR: 26, coreW: 3,  baseR: 20, glowA: 0.28, coreA: 0.70, pulseA: 0.12 },
    };
    const beamCfg = _beamDefs[item.rarity] || _beamDefs.common;

    // ── Create all visuals at landing position ──
    const baseGlow = scene.add.circle(x, y, beamCfg.baseR, rc, beamCfg.glowA + 0.10).setDepth(6);
    const beam = scene.add.rectangle(x, y, beamCfg.w * 3, beamCfg.h, rc, beamCfg.glowA)
        .setDepth(6).setOrigin(0.5, 1);
    const beamCore = scene.add.rectangle(x, y, beamCfg.coreW * 2, beamCfg.h, 0xffffff, beamCfg.coreA)
        .setDepth(7).setOrigin(0.5, 1);
    const beamGlow = scene.add.circle(x, y - beamCfg.h, beamCfg.glowR * 0.6, rc, beamCfg.glowA * 0.5).setDepth(6);
    // Icon drawn at local (0,0) so setScale works around draw center
    const icon = _drawLootIcon(scene, 0, 0, item.icon, rc);
    icon.setPosition(x, y); // depth 9 already set by _drawLootIcon
    const tag = scene.add.text(x, y + 16, item.shortName, {
        font: 'bold 8px Courier New',
        fill: rarityDef.colorStr,
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5).setDepth(9).setAlpha(0.85);
    const rarityDot = scene.add.circle(x, y - 14, 3, rc, 0.9).setDepth(9);

    // ── Idle animations (deferred until after arc, or immediate if no arc) ──
    const _startIdleAnims = () => {
        if (baseGlow?.active !== false) baseGlow.setAlpha(beamCfg.glowA + 0.10).setScale(1);
        if (beam?.active !== false) beam.setAlpha(beamCfg.glowA).setScale(1);
        if (beamCore?.active !== false) beamCore.setAlpha(beamCfg.coreA).setScale(1);
        if (beamGlow?.active !== false) { beamGlow.setAlpha(beamCfg.glowA * 0.5); beamGlow.setScale(1); }
        if (tag?.active !== false) tag.setAlpha(0.85).setScale(1);
        if (rarityDot?.active !== false) rarityDot.setAlpha(0.9).setScale(1);
        if (icon?.active !== false) icon.setScale(1);
        scene.tweens.add({ targets: baseGlow, alpha: beamCfg.glowA, yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut' });
        scene.tweens.add({ targets: beam, alpha: beamCfg.pulseA, yoyo: true, repeat: -1, duration: 900 + Math.random() * 300 });
        scene.tweens.add({ targets: beamCore, alpha: beamCfg.coreA * 0.4, yoyo: true, repeat: -1, duration: 700 + Math.random() * 200 });
        scene.tweens.add({ targets: beamGlow, alpha: 0, scaleX: 1.3, scaleY: 1.3, yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.easeInOut' });
        scene.tweens.add({ targets: [rarityDot, baseGlow], y: '-=4', yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' });
    };

    const dropData = {
        item,
        glow: baseGlow, icon, tag, rarityDot, beam, beamGlow, beamCore, baseGlow,
        x, y,
        active: true,
        _arcDone: true,
    };
    _equipmentDrops.push(dropData);

    const hasArc = fromX !== undefined && fromY !== undefined;

    if (hasArc) {
        dropData._arcDone = false;

        // Arc center proxy — moves from death point to landing point
        const proxy = { cx: fromX, cy: fromY };
        const _updatePositions = () => {
            const cx = proxy.cx, cy = proxy.cy;
            if (baseGlow?.active !== false) { baseGlow.x = cx;     baseGlow.y = cy; }
            if (beam?.active !== false)     { beam.x = cx;         beam.y = cy; }
            if (beamCore?.active !== false) { beamCore.x = cx;     beamCore.y = cy; }
            if (beamGlow?.active !== false) { beamGlow.x = cx;     beamGlow.y = cy - beamCfg.h; }
            if (icon?.active !== false)     { icon.x = cx;         icon.y = cy; }
            if (tag?.active !== false)      { tag.x = cx;          tag.y = cy + 16; }
            if (rarityDot?.active !== false){ rarityDot.x = cx;    rarityDot.y = cy - 14; }
        };
        // Move all visuals to start position and hide
        _updatePositions();
        [baseGlow, beam, beamCore, beamGlow, icon, tag, rarityDot].forEach(o => {
            if (o) { o.setAlpha(0); o.setScale(0.5); }
        });

        const arcH = Phaser.Math.Between(60, 80);
        const arcDur = Phaser.Math.Between(400, 500);
        const halfDur1 = Math.floor(arcDur * 0.45);
        const halfDur2 = arcDur - halfDur1;
        const midX = (fromX + x) * 0.5;
        const midY = fromY - arcH;
        const fadeInDur = Math.floor(arcDur * 0.4);

        const _doArc = () => {
            // Fade in + scale up across first part of arc
            scene.tweens.add({ targets: baseGlow, alpha: beamCfg.glowA + 0.10, scaleX: 1, scaleY: 1, duration: fadeInDur, ease: 'Power1' });
            scene.tweens.add({ targets: beam,     alpha: beamCfg.glowA,         scaleX: 1, scaleY: 1, duration: fadeInDur, ease: 'Power1' });
            scene.tweens.add({ targets: beamCore, alpha: beamCfg.coreA,         scaleX: 1, scaleY: 1, duration: fadeInDur, ease: 'Power1' });
            scene.tweens.add({ targets: beamGlow, alpha: beamCfg.glowA * 0.5,  scaleX: 1, scaleY: 1, duration: fadeInDur, ease: 'Power1' });
            scene.tweens.add({ targets: icon,     alpha: 1,                     scaleX: 1, scaleY: 1, duration: fadeInDur, ease: 'Power1' });
            scene.tweens.add({ targets: tag,      alpha: 0.85,                  scaleX: 1, scaleY: 1, duration: fadeInDur, ease: 'Power1' });
            scene.tweens.add({ targets: rarityDot,alpha: 0.9,                   scaleX: 1, scaleY: 1, duration: fadeInDur, ease: 'Power1' });

            // Phase 1: arc up to apex
            scene.tweens.add({
                targets: proxy, cx: midX, cy: midY,
                duration: halfDur1, ease: 'Power1',
                onUpdate: _updatePositions,
                onComplete: () => {
                    // Phase 2: arc down to landing
                    scene.tweens.add({
                        targets: proxy, cx: x, cy: y,
                        duration: halfDur2, ease: 'Power2',
                        onUpdate: _updatePositions,
                        onComplete: () => {
                            // Bounce on landing
                            const bProxy = { by: 0 };
                            scene.tweens.add({
                                targets: bProxy, by: 5,
                                duration: 80, ease: 'Quad.easeOut', yoyo: true,
                                onUpdate: () => {
                                    const d = bProxy.by;
                                    if (baseGlow?.active !== false) { baseGlow.y = y + d; }
                                    if (beam?.active !== false)     { beam.y = y + d; }
                                    if (beamCore?.active !== false) { beamCore.y = y + d; }
                                    if (beamGlow?.active !== false) { beamGlow.y = y - beamCfg.h + d; }
                                    if (icon?.active !== false)     { icon.y = y + d; }
                                    if (tag?.active !== false)      { tag.y = y + 16 + d; }
                                    if (rarityDot?.active !== false){ rarityDot.y = y - 14 + d; }
                                },
                                onComplete: () => {
                                    _startIdleAnims();
                                    dropData._arcDone = true;
                                    if (typeof sndLootDrop === 'function') sndLootDrop(item.rarity);
                                }
                            });
                        }
                    });
                }
            });
        };

        if (delay > 0) {
            scene.time.delayedCall(delay, _doArc);
        } else {
            _doArc();
        }

        // Screen shake + starburst at launch from death position
        if (item.rarity === 'epic') {
            scene.cameras.main.shake(120, 0.004);
        }
        if (item.rarity === 'legendary') {
            scene.cameras.main.shake(200, 0.008);
            for (let i = 0; i < 6; i++) {
                const star = scene.add.star(fromX, fromY - 10, 4, 2, 5, rc, 0.7).setDepth(10).setScale(0.5);
                scene.tweens.add({
                    targets: star,
                    x: fromX + Phaser.Math.Between(-35, 35),
                    y: fromY + Phaser.Math.Between(-50, 10),
                    alpha: 0, scale: 0,
                    duration: 1200 + i * 200,
                    onComplete: () => star.destroy()
                });
            }
            if (typeof sndEquipDrop === 'function') sndEquipDrop(item.rarity);
            else if (typeof _noise === 'function') _noise(0.12, 0.5, 0, 300, 700);
        }

    } else {
        // No arc: start idle animations immediately
        _startIdleAnims();
        if (item.rarity === 'epic') {
            scene.cameras.main.shake(120, 0.004);
        }
        if (item.rarity === 'legendary') {
            scene.cameras.main.shake(200, 0.008);
            for (let i = 0; i < 6; i++) {
                const star = scene.add.star(x, y - 10, 4, 2, 5, rc, 0.7).setDepth(10).setScale(0.5);
                scene.tweens.add({
                    targets: star,
                    x: x + Phaser.Math.Between(-35, 35),
                    y: y + Phaser.Math.Between(-50, 10),
                    alpha: 0, scale: 0,
                    duration: 1200 + i * 200,
                    onComplete: () => star.destroy()
                });
            }
            if (typeof sndEquipDrop === 'function') sndEquipDrop(item.rarity);
            else if (typeof _noise === 'function') _noise(0.12, 0.5, 0, 300, 700);
        }
    }
}

function _removeEquipmentDrop(scene, drop, fade) {
    if (!drop.active) return;
    drop.active = false;

    const objects = [drop.glow, drop.icon, drop.tag, drop.rarityDot, drop.beam, drop.beamGlow, drop.beamCore, drop.baseGlow].filter(Boolean);

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
    if (_gameMode === 'simulation' || _gameMode === 'pvp') return;
    if (!player?.active || !isDeployed) return;
    _equipmentDrops.slice().forEach(drop => {
        if (!drop.active) return;
        if (!drop._arcDone) return; // still in flight
        const dist = Phaser.Math.Distance.Between(player.x, player.y, drop.x, drop.y);
        if (dist < 45) {
            const _freeSlot = _inventory.indexOf(null);
            if (_freeSlot !== -1) {
                _inventory[_freeSlot] = drop.item;
                _showLootPickupNotification(scene, drop.item);
                if (typeof sndEquipPickup === 'function') sndEquipPickup(drop.item.rarity);
                else if (typeof _noise === 'function') _noise(0.08, 0.25, 0, 500, 1100);
                // Particle burst on epic/legendary pickup
                if (drop.item.rarity === 'epic' || drop.item.rarity === 'legendary') {
                    const rDef = RARITY_DEFS[drop.item.rarity];
                    const count = drop.item.rarity === 'legendary' ? 10 : 6;
                    for (let pi = 0; pi < count; pi++) {
                        const angle = (pi / count) * Math.PI * 2;
                        const p = scene.add.circle(drop.x, drop.y, 3, rDef.color, 0.8).setDepth(12);
                        scene.tweens.add({
                            targets: p,
                            x: drop.x + Math.cos(angle) * Phaser.Math.Between(30, 60),
                            y: drop.y + Math.sin(angle) * Phaser.Math.Between(30, 60),
                            alpha: 0, scale: 0,
                            duration: 400 + pi * 40,
                            onComplete: () => p.destroy()
                        });
                    }
                    if (drop.item.rarity === 'legendary') scene.cameras.main.shake(80, 0.003);
                }
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

// ── PICKUP NOTIFICATION SYSTEM ─────────────────────────────────
// All item pickup pills and scrap notifications share a single left-side queue.
const _NOTIF_TOP    = 80;   // px from viewport top for first slot
const _NOTIF_GAP    = 6;    // px gap between pills
const _NOTIF_MAX    = 6;    // hard cap — oldest evicted when exceeded
// _lootNotifications already declared above; each entry: { el, active }
let _scrapAccum = { el: null, notif: null, total: 0, timerId: null }; // accumulator for scrap

// Convert #rrggbb to rgba(r,g,b,a)
function _hexToRgba(hex, a) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${a})`;
}

// Recalculate top positions for all active notifications and tween them in place.
function _reposNotifs() {
    let offset = _NOTIF_TOP;
    _lootNotifications.forEach(n => {
        if (!n.el || !n.active) return;
        n.el.style.top = offset + 'px';
        offset += (n.el.offsetHeight || 32) + _NOTIF_GAP;
    });
}

// Remove a notification from the queue, slide remaining up.
function _removeNotif(notif) {
    notif.active = false;
    if (notif.el) {
        try { if (notif.el.parentNode) notif.el.parentNode.removeChild(notif.el); } catch(e) {}
        notif.el = null;
    }
    _lootNotifications = _lootNotifications.filter(n => n !== notif);
    _reposNotifs();
}

// Shared helper: create and enqueue a pill element.
function _enqueueNotifPill(elStyle, text, holdMs, scene) {
    // Evict oldest if at cap
    if (_lootNotifications.length >= _NOTIF_MAX) {
        _removeNotif(_lootNotifications[0]);
    }

    const el = document.createElement('div');
    Object.assign(el.style, {
        position:      'fixed',
        left:          '12px',
        top:           (_NOTIF_TOP + _lootNotifications.length * 40) + 'px',
        borderRadius:  '14px',
        padding:       '5px 13px',
        fontFamily:    'var(--font-mono, "Courier New", monospace)',
        whiteSpace:    'nowrap',
        pointerEvents: 'none',
        opacity:       '0',
        transition:    'opacity 150ms ease, top 200ms ease',
        zIndex:        '9000',
        ...elStyle,
    });
    el.textContent = text;
    document.body.appendChild(el);

    const notif = { el, active: true };
    _lootNotifications.push(notif);
    _reposNotifs();

    // Fade in
    requestAnimationFrame(() => { if (el) el.style.opacity = '1'; });

    // Auto-dismiss after holdMs + 300ms fade-out
    scene.time.delayedCall(holdMs, () => {
        if (!notif.active) return;
        el.style.transition = 'opacity 300ms ease';
        el.style.opacity = '0';
        scene.time.delayedCall(320, () => _removeNotif(notif));
    });

    return notif;
}

function _showLootPickupNotification(scene, item) {
    const rarityDef = RARITY_DEFS[item.rarity] || RARITY_DEFS.common;

    // Resolve display name: item type only
    let displayName;
    if (item.baseType === 'weapon') {
        const wName = (typeof WEAPON_NAMES !== 'undefined') ? WEAPON_NAMES[item.subType] : null;
        displayName = wName ? wName.toUpperCase() : 'WEAPON';
    } else if (item.baseType === 'mod' || item.baseType === 'mod_system' || item.baseType === 'cpu_system') {
        displayName = 'CPU';
    } else if (item.baseType === 'shield' || item.baseType === 'shield_system') {
        displayName = 'SHIELD';
    } else if (item.baseType === 'augment' || item.baseType === 'aug_system') {
        displayName = 'AUGMENT';
    } else if (item.baseType === 'arms') {
        displayName = 'ARMS';
    } else if (item.baseType === 'armor' || item.baseType === 'chest') {
        displayName = 'ARMOR';
    } else if (item.baseType === 'leg' || item.baseType === 'leg_system' || item.baseType === 'legs') {
        displayName = 'LEGS';
    } else {
        displayName = (item.baseType || 'ITEM').toUpperCase();
    }

    const rc = rarityDef.colorStr;
    const glowMap = {
        common:    '',
        uncommon:  `0 0 8px ${_hexToRgba(rc, 0.3)}`,
        rare:      `0 0 12px ${_hexToRgba(rc, 0.4)}`,
        epic:      `0 0 16px ${_hexToRgba(rc, 0.5)}`,
        legendary: `0 0 20px ${_hexToRgba(rc, 0.6)}, 0 0 40px ${_hexToRgba(rc, 0.2)}`,
    };

    _enqueueNotifPill({
        background:     _hexToRgba(rc, item.rarity === 'legendary' || item.rarity === 'common' ? 0.15 : 0.12),
        border:         `1px solid ${_hexToRgba(rc, 0.5)}`,
        color:          rc,
        fontSize:       '13px',
        fontWeight:     'bold',
        letterSpacing:  '2px',
        textTransform:  'uppercase',
        boxShadow:      glowMap[item.rarity] || '',
    }, displayName, 1800, scene);
}

// Scrap pickup notification — accumulates rapid pickups into one updating pill.
function _showScrapPickupNotification(scene, amount) {
    _scrapAccum.total += amount;

    if (_scrapAccum.notif && _scrapAccum.notif.active && _scrapAccum.el) {
        // Update existing pill text
        _scrapAccum.el.textContent = `\u2699 +${_scrapAccum.total} SCRAP`;
        // Reset dismiss timer
        if (_scrapAccum.timerId) clearTimeout(_scrapAccum.timerId);
    } else {
        // Create new scrap pill
        const el = document.createElement('div');
        Object.assign(el.style, {
            position:      'fixed',
            left:          '12px',
            top:           (_NOTIF_TOP + _lootNotifications.length * 40) + 'px',
            background:    _hexToRgba('#ffd700', 0.08),
            borderRadius:  '14px',
            padding:       '4px 12px',
            fontFamily:    'var(--font-mono, "Courier New", monospace)',
            fontSize:      '11px',
            color:         '#ffd700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            whiteSpace:    'nowrap',
            pointerEvents: 'none',
            opacity:       '0',
            transition:    'opacity 100ms ease, top 200ms ease',
            zIndex:        '9000',
        });
        el.textContent = `\u2699 +${_scrapAccum.total} SCRAP`;
        document.body.appendChild(el);

        const notif = { el, active: true };
        _lootNotifications.push(notif);
        _reposNotifs();
        requestAnimationFrame(() => { if (el) el.style.opacity = '1'; });

        _scrapAccum.el    = el;
        _scrapAccum.notif = notif;
    }

    // Dismiss 1.2s after last pickup, 200ms fade
    if (_scrapAccum.timerId) clearTimeout(_scrapAccum.timerId);
    _scrapAccum.timerId = setTimeout(() => {
        const n = _scrapAccum.notif;
        const e = _scrapAccum.el;
        if (!n || !n.active) return;
        if (e) { e.style.transition = 'opacity 200ms ease'; e.style.opacity = '0'; }
        setTimeout(() => {
            _removeNotif(n);
            _scrapAccum.el = null;
            _scrapAccum.notif = null;
            _scrapAccum.total = 0;
            _scrapAccum.timerId = null;
        }, 220);
    }, 1200);
}

function _showFloatingWarning(scene, text, color) {
    const fx = scene.add.text(GAME.config.width / 2, GAME.config.height * 0.40, text, {
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
    if (_gameMode === 'simulation' || _gameMode === 'pvp') return;
    const chance = _getEquipDropChance(enemyData);
    if (Math.random() > chance) return;

    const round = (typeof _round !== 'undefined') ? _round : 1;

    // Calculate scatter landing positions: 100-150px from death, 40px min separation
    const _scatterPositions = (count) => {
        const positions = [];
        for (let i = 0; i < count; i++) {
            let px, py, attempts = 0;
            do {
                const angle = Math.random() * Math.PI * 2;
                const dist = 100 + Math.random() * 50;
                px = x + Math.cos(angle) * dist;
                py = y + Math.sin(angle) * dist;
                attempts++;
            } while (attempts < 8 && positions.some(p => Phaser.Math.Distance.Between(px, py, p.x, p.y) < 40));
            positions.push({ x: px, y: py });
        }
        return positions;
    };

    const stagger = 65; // ms between successive drop launches

    if (enemyData?.isBoss) {
        // Boss: 100% guaranteed, 2-3 items (50% for 2, 50% for 3)
        const dropCount = Math.random() < 0.5 ? 2 : 3;
        const bossType = enemyData.bossType || null;
        let drops = [];
        if (bossType && typeof rollBossDrops === 'function') {
            drops = rollBossDrops(bossType, round);
            // Ensure at least dropCount items (pad with generated items if needed)
            while (drops.length < dropCount) {
                const extra = generateItem(round, enemyData);
                if (extra) drops.push(extra);
                else break;
            }
        } else {
            for (let i = 0; i < dropCount; i++) {
                const item = generateItem(round, enemyData);
                if (item) drops.push(item);
            }
        }
        const positions = _scatterPositions(drops.length);
        drops.forEach((item, i) => {
            spawnEquipmentDrop(scene, positions[i].x, positions[i].y, item, x, y, i * stagger);
        });
    } else if (enemyData?.isElite) {
        // Elite: 75% chance (already passed), 50%/50% for 1 or 2 items
        const dropCount = Math.random() < 0.5 ? 1 : 2;
        const items = [];
        for (let i = 0; i < dropCount; i++) {
            const item = generateItem(round, enemyData);
            if (item) items.push(item);
        }
        const positions = _scatterPositions(items.length);
        items.forEach((item, i) => {
            spawnEquipmentDrop(scene, positions[i].x, positions[i].y, item, x, y, i * stagger);
        });
    } else {
        // Normal: 50% chance (already passed), 1 item
        const item = generateItem(round, enemyData);
        if (item) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 50;
            spawnEquipmentDrop(scene, x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, item, x, y, 0);
        }
    }
}

// ── GEAR STATE CALCULATION ─────────────────────────────────────
function recalcGearStats() {
    _gearState = {
        dmgFlat:0, dmgPct:0, critChance:0, critDmg:0, fireRatePct:0,
        coreHP:0, armHP:0, legHP:0, allHP:0, dr:0,
        shieldHP:0, shieldRegen:0, absorbPct:0, dodgePct:0, speedPct:0,
        modCdPct:0, modEffPct:0, lootMult:0, autoRepair:0,
        pellets:0, splashRadius:0
    };

    const slots = [_equipped.L, _equipped.R, _equipped.armor, _equipped.arms,
                   _equipped.legs, _equipped.shield, _equipped.cpu, _equipped.augment];

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

    // ── Unique effect tracking ───────────────────────────────
    // Reset active unique effects
    _gearState._uniqueEffects = {};
    slots.forEach(item => {
        if (!item?.isUnique || !item.uniqueEffect) return;
        _gearState._uniqueEffects[item.uniqueEffect] = true;
    });

    // ── Legendary trait perk application ────────────────────────
    // Collect active trait keys and apply each perk's effect.
    // All trait perks in LEGENDARY_TRAITS only modify _perkState flags —
    // none modify player HP/shield directly, so this is safe in all contexts.
    //
    // STACKING NOTE: If a player also picks the same perk in warzone,
    // effects stack as intended. Most perks set boolean flags (idempotent).
    // Additive perks (fw_crit: +=0.12) and multiplicative perks
    // (siphon_wide: *=1.50, hb_overdrive: *=1.15) will accumulate if
    // recalcGearStats() is called multiple times during a combat session
    // (e.g. mid-round equip). This only affects those 3 perks and is an
    // edge case; recalcGearStats() is called once at deploy in normal play.
    _gearState._traitKeys = [];
    if (typeof _perks !== 'undefined' && typeof _perkState !== 'undefined') {
        slots.forEach(item => {
            if (!item?.legendaryTrait) return;
            const traitKey = item.legendaryTrait;
            // Guard: skip if already applied this recalc (two items same trait)
            if (_gearState._traitKeys.includes(traitKey)) return;
            _gearState._traitKeys.push(traitKey);
            const p = _perks[traitKey];
            if (p?.apply) p.apply();
        });
    }
}

// ══════════════════════════════════════════════════════════════════
// UNIQUE EFFECT HELPERS — Called from index.html combat code
// These functions are defined here but wired into index.html via
// typeof guards. Search index.html for each function name to find
// the exact call site where it's integrated into the GAME loop.
// ══════════════════════════════════════════════════════════════════
// Check if a unique effect is currently active
function hasUniqueEffect(effectKey) {
    return !!(_gearState?._uniqueEffects?.[effectKey]);
}

// Frontal Aegis: reduce frontal damage by 40%
function applyFrontalAbsorb(amt, bulletAngle) {
    if (!hasUniqueEffect('frontalAbsorb')) return amt;
    if (typeof player === 'undefined' || !player?.active) return amt;
    // Check if bullet is coming from the front (±60° of player facing)
    const playerAngle = player.rotation || (typeof torso !== 'undefined' ? torso?.rotation || 0 : 0);
    const incomingAngle = bulletAngle != null ? bulletAngle : 0;
    // "Front" = direction the player/torso is facing
    const diff = Math.abs(Phaser.Math.Angle.Wrap(incomingAngle - playerAngle - Math.PI));
    if (diff < Math.PI / 3) { // ±60°
        return amt * 0.60; // 40% reduction
    }
    return amt;
}

// Sentinel's Plating: +12% DR while shield is full
function getShieldDRBonus() {
    if (!hasUniqueEffect('shieldDR')) return 0;
    if (typeof player === 'undefined' || !player?.active) return 0;
    if ((player.shield || 0) >= (player.maxShield || 1) && player.maxShield > 0) {
        return 0.12;
    }
    return 0;
}

// Unstoppable: immune to slow, +20% speed
function getUnstoppableSpeedBonus() {
    return hasUniqueEffect('unstoppable') ? 0.20 : 0;
}

// Impact Armor: heavy hit triggers temp DR
let _impactArmorActive = false;
function checkImpactArmor(dmg) {
    if (!hasUniqueEffect('impactArmor') || _impactArmorActive) return;
    if (dmg > 25) {
        _impactArmorActive = true;
        setTimeout(() => { _impactArmorActive = false; }, 3000);
    }
}
function getImpactArmorDR() {
    return _impactArmorActive ? 0.15 : 0;
}

// Dual Reload: 30% faster reload when both arms have weapons
function getDualReloadBonus() {
    if (!hasUniqueEffect('dualReload')) return 0;
    if (typeof loadout === 'undefined') return 0;
    if (loadout.L && loadout.L !== 'none' && loadout.R && loadout.R !== 'none') {
        return 0.30; // 30% faster
    }
    return 0;
}

// Double Strike: every 3rd shot fires twice (tracked per weapon cycle)
let _doubleStrikeCounter = 0;
function checkDoubleStrike() {
    if (!hasUniqueEffect('doubleStrike')) return false;
    _doubleStrikeCounter++;
    if (_doubleStrikeCounter >= 3) {
        _doubleStrikeCounter = 0;
        return true; // fire extra bullet
    }
    return false;
}

// Mod Cover: spawn cover wall on mod activation
function spawnModCover(scene) {
    if (!hasUniqueEffect('modCover') || !scene || !player?.active) return;
    const x = player.x;
    const y = player.y + 30;
    const w = 60, h = 16;
    const wall = scene.add.rectangle(x - w/2, y - h/2, w, h, 0xffd700)
        .setOrigin(0, 0).setStrokeStyle(2, 0xffee88).setDepth(3).setAlpha(0);
    scene.tweens.add({ targets: wall, alpha: 0.8, duration: 200 });
    scene.physics.add.existing(wall, true);
    wall.body.setSize(w, h);
    wall.body.reset(x - w/2, y - h/2);
    wall.coverType = 'wall'; wall.coverHp = 40; wall.coverMaxHp = 40;
    if (typeof coverObjects !== 'undefined') {
        coverObjects.add(wall, true);
        coverObjects.refresh();
    }
    // Auto-destroy after 8 seconds
    scene.time.delayedCall(8000, () => {
        if (wall.active) {
            scene.tweens.add({ targets: wall, alpha: 0, duration: 400, onComplete: () => wall.destroy() });
        }
    });
}

// ══════════════════════════════════════════════════════════════════
// PHASE 7 UNIQUE EFFECT HELPERS — Called from index.html
// Wired into: damageEnemy(), processPlayerDamage(), update() loop,
//             onEnemyKilled(), activateMod(), bullet-enemy overlap
// Search index.html for each function name to find call sites.
// ══════════════════════════════════════════════════════════════════

// Swarm Burst: kills spawn 2 homing micro-drones
// → Called from onEnemyKilled() in index.html (~line 5139)
function triggerSwarmBurst(scene, x, y) {
    if (!hasUniqueEffect('swarmBurst') || !scene) return;
    for (let i = 0; i < 2; i++) {
        const drone = scene.add.circle(x, y, 5, 0x88ff00, 0.9).setStrokeStyle(1, 0xccff44).setDepth(12);
        scene.physics.add.existing(drone);
        drone.body.setCircle(5);
        const findTarget = () => {
            if (typeof enemies === 'undefined') return null;
            let closest = null, closestDist = 500;
            enemies.getChildren().forEach(e => {
                if (!e.active) return;
                const d = Phaser.Math.Distance.Between(drone.x, drone.y, e.x, e.y);
                if (d < closestDist) { closest = e; closestDist = d; }
            });
            return closest;
        };
        const tick = scene.time.addEvent({ delay: 50, loop: true, callback: () => {
            if (!drone.active) { tick.remove(); return; }
            const target = findTarget();
            if (!target) { drone.destroy(); tick.remove(); return; }
            const angle = Math.atan2(target.y - drone.y, target.x - drone.x);
            drone.body.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);
            if (Phaser.Math.Distance.Between(drone.x, drone.y, target.x, target.y) < 20) {
                if (typeof damageEnemy === 'function') damageEnemy(target, 15, 0, true);
                if (typeof showDamageText === 'function') showDamageText(scene, target.x, target.y, 15);
                drone.destroy(); tick.remove();
            }
        }});
        // Self-destruct after 3s
        scene.time.delayedCall(3000, () => { if (drone.active) drone.destroy(); tick.remove(); });
    }
}

// Adaptive Armor: consecutive hits from same source deal less
// → Called from processPlayerDamage() in index.html (~line 9272)
let _adaptiveLastShooter = null;
let _adaptiveStacks = 0;
function getAdaptiveArmorDR(shooterId) {
    if (!hasUniqueEffect('adaptiveArmor')) return 0;
    if (shooterId && shooterId === _adaptiveLastShooter) {
        _adaptiveStacks = Math.min(4, _adaptiveStacks + 1);
    } else {
        _adaptiveLastShooter = shooterId;
        _adaptiveStacks = 0;
    }
    return _adaptiveStacks * 0.10; // 10% per stack, max 40%
}

// Titan Smash: every 5th shot creates shockwave
// → checkTitanSmash called from bullet-enemy overlap in index.html (~line 2976)
// → triggerTitanSmash called from same location (~line 2977)
let _titanSmashCounter = 0;
function checkTitanSmash() {
    if (!hasUniqueEffect('titanSmash')) return false;
    _titanSmashCounter++;
    if (_titanSmashCounter >= 5) {
        _titanSmashCounter = 0;
        return true;
    }
    return false;
}

function triggerTitanSmash(scene, x, y, baseDmg) {
    if (!scene) return;
    const aoeDmg = Math.round(baseDmg * 0.5);
    const ring = scene.add.circle(x, y, 10, 0xff6600, 0.5).setStrokeStyle(3, 0xff8800).setDepth(14);
    scene.tweens.add({ targets: ring, radius: 120, alpha: 0, duration: 400, onComplete: () => ring.destroy() });
    if (typeof enemies !== 'undefined') {
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            if (Phaser.Math.Distance.Between(x, y, e.x, e.y) < 120) {
                if (typeof damageEnemy === 'function') damageEnemy(e, aoeDmg, 0, true);
                if (typeof showDamageText === 'function') showDamageText(scene, e.x, e.y, aoeDmg);
            }
        });
    }
}

// Colossus Stand: stationary 2s grants +25% dmg, +10% DR
// → updateColossusStand called from update() loop in index.html (~line 3068)
// → getColossusDmgMult called from _effectiveDmg calc (~line 8842)
// → getColossusDR called from processPlayerDamage() (~line 9277)
let _colossusActive = false;
let _colossusStillTime = 0;
let _colossusLastX = 0;
let _colossusLastY = 0;
function updateColossusStand(time) {
    if (!hasUniqueEffect('colossusStand')) { _colossusActive = false; return; }
    if (typeof player === 'undefined' || !player?.active) return;
    const moved = Math.abs(player.x - _colossusLastX) > 3 || Math.abs(player.y - _colossusLastY) > 3;
    _colossusLastX = player.x;
    _colossusLastY = player.y;
    if (moved) {
        _colossusStillTime = time;
        _colossusActive = false;
    } else if (time - _colossusStillTime > 2000) {
        _colossusActive = true;
    }
}
function getColossusDmgMult() { return _colossusActive ? 1.25 : 1.0; }
function getColossusDR() { return _colossusActive ? 0.10 : 0; }

// Core Overload: mod activation damage pulse
// → Called from activateMod() in index.html (~line 5739)
function triggerCoreOverload(scene) {
    if (!hasUniqueEffect('coreOverload') || !scene) return;
    if (typeof player === 'undefined' || !player?.active) return;
    const ring = scene.add.circle(player.x, player.y, 10, 0x00ffff, 0.5).setStrokeStyle(3, 0x44ffff).setDepth(14);
    scene.tweens.add({ targets: ring, radius: 200, alpha: 0, duration: 500, onComplete: () => ring.destroy() });
    if (typeof enemies !== 'undefined') {
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            if (Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y) < 200) {
                if (typeof damageEnemy === 'function') damageEnemy(e, 80, 0, true);
                if (typeof showDamageText === 'function') showDamageText(scene, e.x, e.y, 80);
            }
        });
    }
}

// Matrix Barrier: shield break invulnerability bubble
// → triggerMatrixBarrier called from processPlayerDamage() in index.html (~line 9483)
// → isMatrixBarrierActive called from processPlayerDamage() (~line 9279)
let _matrixBarrierCooldown = 0;
let _matrixBarrierActive = false;
function triggerMatrixBarrier(scene, time) {
    if (!hasUniqueEffect('matrixBarrier')) return false;
    if (time < _matrixBarrierCooldown || _matrixBarrierActive) return false;
    _matrixBarrierActive = true;
    _matrixBarrierCooldown = time + 60000; // 60s CD
    // Visual bubble
    if (scene && typeof player !== 'undefined' && player?.active) {
        const bubble = scene.add.circle(player.x, player.y, 50, 0x00ccff, 0.2)
            .setStrokeStyle(3, 0x00ffff).setDepth(15);
        const follow = scene.time.addEvent({ delay: 16, loop: true, callback: () => {
            if (!bubble.active || !player?.active) return;
            bubble.setPosition(player.x, player.y);
        }});
        scene.time.delayedCall(3000, () => {
            _matrixBarrierActive = false;
            follow.remove();
            if (bubble.active) scene.tweens.add({ targets: bubble, alpha: 0, duration: 300, onComplete: () => bubble.destroy() });
        });
    } else {
        setTimeout(() => { _matrixBarrierActive = false; }, 3000);
    }
    return true;
}
function isMatrixBarrierActive() { return _matrixBarrierActive; }

// ── SCRAP COIN DROP SYSTEM ─────────────────────────────────────
// Every enemy death spawns a scrap pickup (campaign mode only).
// Scrap coins have a magnet effect — they move toward the player
// when within 120px, then are collected on overlap.

function spawnScrapDrop(scene, x, y) {
    if (_gameMode !== 'campaign') return;
    const value = Phaser.Math.Between(5, 10);
    // Landing position: 60-80px from death point
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 20;
    const landX = x + Math.cos(angle) * dist;
    const landY = y + Math.sin(angle) * dist;
    // Outer ring (dark gold border effect)
    const outerRing = scene.add.circle(x, y, 10, 0x8b6914, 0).setDepth(7);
    // Gold coin fill
    const coin = scene.add.circle(x, y, 8, 0xffd700, 0).setDepth(8);
    // Coin label
    const label = scene.add.text(x, y, 'S', {
        fontFamily: 'monospace', fontSize: '7px', color: '#5c3d00', align: 'center'
    }).setOrigin(0.5, 0.5).setDepth(9).setAlpha(0);
    const drop = { coin, outerRing, label, x: landX, y: landY, value, active: true, _arcDone: false };
    _scrapDrops.push(drop);

    // Short arc: 40-50px height, 350ms
    const arcH = 40 + Math.random() * 10;
    const arcDur = 350;
    const halfDur1 = Math.floor(arcDur * 0.45);
    const halfDur2 = arcDur - halfDur1;
    const proxy = { cx: x, cy: y };
    const midX = (x + landX) * 0.5;
    const midY = y - arcH;

    scene.tweens.add({ targets: [coin, outerRing, label], alpha: 1, scaleX: 1, scaleY: 1, duration: Math.floor(arcDur * 0.4), ease: 'Power1' });
    coin.setScale(0.5); outerRing.setScale(0.5); label.setScale(0.5);

    const _updateScrap = () => {
        if (coin?.active !== false)      { coin.x = proxy.cx;      coin.y = proxy.cy; }
        if (outerRing?.active !== false) { outerRing.x = proxy.cx; outerRing.y = proxy.cy; }
        if (label?.active !== false)     { label.x = proxy.cx;     label.y = proxy.cy; }
    };

    scene.tweens.add({
        targets: proxy, cx: midX, cy: midY,
        duration: halfDur1, ease: 'Power1',
        onUpdate: _updateScrap,
        onComplete: () => {
            scene.tweens.add({
                targets: proxy, cx: landX, cy: landY,
                duration: halfDur2, ease: 'Power2',
                onUpdate: _updateScrap,
                onComplete: () => {
                    const bProxy = { by: 0 };
                    scene.tweens.add({
                        targets: bProxy, by: 3,
                        duration: 70, ease: 'Quad.easeOut', yoyo: true,
                        onUpdate: () => {
                            if (coin?.active !== false)      { coin.y = landY + bProxy.by; }
                            if (outerRing?.active !== false) { outerRing.y = landY + bProxy.by; }
                            if (label?.active !== false)     { label.y = landY + bProxy.by; }
                        },
                        onComplete: () => {
                            if (coin?.active !== false)      { coin.x = landX;      coin.y = landY; }
                            if (outerRing?.active !== false) { outerRing.x = landX; outerRing.y = landY; }
                            if (label?.active !== false)     { label.x = landX;     label.y = landY; }
                            drop._arcDone = true;
                        }
                    });
                }
            });
        }
    });
}

function checkScrapPickups(scene) {
    if (_gameMode !== 'campaign') return;
    if (!player?.active || !isDeployed) return;
    _scrapDrops.slice().forEach(drop => {
        if (!drop.active) return;
        if (!drop._arcDone) return; // still in flight
        const dist = Phaser.Math.Distance.Between(player.x, player.y, drop.x, drop.y);
        if (dist < 45) {
            // Collect
            _scrap += drop.value;
            _showScrapFloatText(scene, drop.value);
            _showScrapPickupNotification(scene, drop.value);
            if (typeof sndScrapPickup === 'function') sndScrapPickup();
            drop.active = false;
            if (drop.coin?.active)      try { drop.coin.destroy(); }      catch(e) {}
            if (drop.outerRing?.active) try { drop.outerRing.destroy(); } catch(e) {}
            if (drop.label?.active)     try { drop.label.destroy(); }     catch(e) {}
            _scrapDrops = _scrapDrops.filter(d => d !== drop);
            if (typeof debouncedCampaignSave === 'function') debouncedCampaignSave();
        }
    });
}

function _showScrapFloatText(scene, value) {
    if (!player?.active) return;
    const txt = scene.add.text(player.x, player.y - 30, `+${value} SCRAP`, {
        font: 'bold 12px Courier New',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);
    scene.tweens.add({
        targets: txt, y: player.y - 80, alpha: 0,
        duration: 1200, ease: 'Quad.easeOut',
        onComplete: () => { try { txt.destroy(); } catch(e) {} }
    });
}

// ── CLEANUP (called when returning to hangar/main menu) ────────
function cleanupEquipmentDrops() {
    _equipmentDrops.forEach(drop => {
        [drop.glow, drop.icon, drop.tag, drop.rarityDot, drop.beam, drop.beamGlow, drop.beamCore, drop.baseGlow]
            .filter(Boolean)
            .forEach(o => { try { if (o.destroy) o.destroy(); } catch(e){} });
    });
    _equipmentDrops = [];
    // Remove any DOM notification pills still on screen
    _lootNotifications.forEach(n => {
        if (n.el) try { if (n.el.parentNode) n.el.parentNode.removeChild(n.el); } catch(e) {}
    });
    _lootNotifications = [];
    // Reset scrap accumulator
    if (_scrapAccum.timerId) { clearTimeout(_scrapAccum.timerId); }
    _scrapAccum = { el: null, notif: null, total: 0, timerId: null };
    // Cleanup scrap coins
    _scrapDrops.forEach(drop => {
        if (drop.coin?.active)      try { drop.coin.destroy(); }      catch(e) {}
        if (drop.outerRing?.active) try { drop.outerRing.destroy(); } catch(e) {}
        if (drop.label?.active)     try { drop.label.destroy(); }     catch(e) {}
    });
    _scrapDrops = [];
}

/** Create a basic common-rarity item for starter loadout. */
function _createStarterItem(baseType, weaponKey) {
    const rarity = 'common';
    const rarityDef = RARITY_DEFS[rarity];
    let name, icon, subType, baseStats, baseKey, systemKey = null;

    if (baseType === 'weapon') {
        const w = (typeof WEAPONS !== 'undefined') ? WEAPONS[weaponKey] : null;
        if (!w) return null;
        baseKey = weaponKey;
        subType = weaponKey;
        icon = weaponKey;
        // Starter weapons use Common Damage % range [2,5]
        const rolledDmgPct = Math.round(2 + Math.random() * 3);
        baseStats = { dmgPct: rolledDmgPct };
    } else {
        // System item — find the matching ITEM_BASES entry by systemKey
        const entry = Object.entries(ITEM_BASES).find(([, def]) => def.baseType === baseType && def.systemKey === weaponKey);
        if (!entry) return null;
        baseKey = entry[0];
        const def = entry[1];
        subType = baseKey;
        icon = def.icon;
        baseStats = { ...def.baseStats };
        systemKey = def.systemKey;
    }

    // Apply naming system
    name = `${TIER_PREFIX[rarity]} ${_getItemTypeName(baseType, subType, systemKey)}`;

    const item = {
        id: 'item_' + (++_lootItemIdCounter),
        baseType,
        subType,
        baseKey,
        name,
        shortName: name,
        icon,
        rarity,
        level: 1,
        baseStats,
        affixes: [],
        computedStats: { ...baseStats },
        systemKey
    };
    return item;
}

/** Equip starter gear into _equipped based on the current chassis starter loadout. */
function equipStarterGear() {
    const ch = (typeof loadout !== 'undefined') ? loadout.chassis : 'medium';
    const starter = (typeof STARTER_LOADOUTS !== 'undefined') ? STARTER_LOADOUTS[ch] : null;
    if (!starter) return;

    // Starter weapon in L ARM only — no other slots pre-filled
    if (starter.L && starter.L !== 'none') {
        _equipped.L = _createStarterItem('weapon', starter.L);
    }

    recalcGearStats();
}

/** Reset all inventory/equipment state for a new run. */
function resetInventory() {
    _inventory = Array(INVENTORY_MAX).fill(null);
    _equipped = { L:null, R:null, armor:null, arms:null, legs:null, shield:null, cpu:null, augment:null };
    _scrap = 0;
    _gearState = {};
    equipStarterGear();
    saveInventory();
    if (typeof _updateInvCount === 'function') _updateInvCount();
}

// ── SAVE/LOAD ──────────────────────────────────────────────────
// Simulation mode: gear resets every run (no persistence).
// Campaign mode: gear persists to localStorage.

// Keys removed in the shield consolidation pass — migrate old saves on load.
const REMOVED_SHIELDS = [
    'light_shield', 'standard_shield', 'heavy_shield', 'reactive_shield',
    'siege_wall', 'counter_shield', 'pulse_shield', 'phase_shield',
];

// Keys removed in the leg consolidation pass — migrate old saves on load.
const REMOVED_LEGS = [
    'siege_stance', 'ironclad_legs', 'power_stride', 'evasion_coils',
    'adaptive_stride', 'stabilizer_gyros', 'reactive_dash', 'silent_step',
];

// Keys removed in the augment consolidation pass — migrate old saves on load.
const REMOVED_AUGMENTS = [
    'chain_drive', 'blast_dampener', 'colossus_frame', 'iron_fortress', 'scrap_cannon',
    'impact_core', 'adaptive_core', 'system_sync', 'tactical_uplink', 'echo_targeting',
    'combat_ai', 'drone_relay', 'shadow_core', 'targeting_scope', 'predator_lens',
    'ghost_circuit', 'pyromaniac_chip', 'kill_sprint', 'reflex_amp', 'fuel_injector',
];

function saveInventory() {
    if (typeof _gameMode === 'undefined' || _gameMode !== 'campaign') return;
    try {
        localStorage.setItem('tw_campaign_inventory', JSON.stringify(_inventory));
        localStorage.setItem('tw_campaign_equipped', JSON.stringify(_equipped));
        localStorage.setItem('tw_campaign_scrap', String(_scrap));
        localStorage.setItem('tw_campaign_itemCounter', String(_lootItemIdCounter));
    } catch(e) {}
}

function loadCampaignInventory() {
    try {
        const inv = localStorage.getItem('tw_campaign_inventory');
        const eq = localStorage.getItem('tw_campaign_equipped');
        const sc = localStorage.getItem('tw_campaign_scrap');
        const ic = localStorage.getItem('tw_campaign_itemCounter');
        if (inv) {
            const parsed = JSON.parse(inv);
            if (Array.isArray(parsed)) {
                const clean = Array(INVENTORY_MAX).fill(null);
                parsed.forEach((it, i) => {
                    if (i < INVENTORY_MAX && it && typeof it === 'object' && it.name && it.rarity && it.baseType) {
                        // Migration: discard items whose systemKey is a removed shield
                        if (it.baseType === 'shield_system' && REMOVED_SHIELDS.includes(it.systemKey)) return;
                        // Migration: discard items whose systemKey is a removed leg
                        if (it.baseType === 'leg_system' && REMOVED_LEGS.includes(it.systemKey)) return;
                        // Migration: discard items whose systemKey is a removed augment
                        if (it.baseType === 'aug_system' && REMOVED_AUGMENTS.includes(it.systemKey)) return;
                        clean[i] = it;
                    }
                });
                _inventory = clean;
            }
        }
        if (eq) {
            const parsed = JSON.parse(eq);
            if (parsed && typeof parsed === 'object') {
                const validSlots = ['L','R','armor','arms','legs','shield','cpu','augment'];
                const clean = { L:null, R:null, armor:null, arms:null, legs:null, shield:null, cpu:null, augment:null };
                validSlots.forEach(s => {
                    if (parsed[s] && typeof parsed[s] === 'object' && parsed[s].name && parsed[s].rarity && parsed[s].baseType) {
                        // Migration: discard equipped shield if it's a removed shield
                        if (s === 'shield' && parsed[s].baseType === 'shield_system' && REMOVED_SHIELDS.includes(parsed[s].systemKey)) return;
                        // Migration: discard equipped legs if it's a removed leg
                        if (s === 'legs' && parsed[s].baseType === 'leg_system' && REMOVED_LEGS.includes(parsed[s].systemKey)) return;
                        // Migration: discard equipped augment if it's a removed augment
                        if (s === 'augment' && parsed[s].baseType === 'aug_system' && REMOVED_AUGMENTS.includes(parsed[s].systemKey)) return;
                        clean[s] = parsed[s];
                    }
                });
                _equipped = clean;
            }
        }
        if (sc) _scrap = Math.max(0, parseInt(sc) || 0);
        if (ic) _lootItemIdCounter = Math.max(_lootItemIdCounter, parseInt(ic) || 0);
        recalcGearStats();
    } catch(e) {
        // If campaign data is corrupt, start fresh with starter gear
        _inventory = Array(INVENTORY_MAX).fill(null);
        _equipped = { L:null, R:null, armor:null, arms:null, legs:null, shield:null, cpu:null, augment:null };
        _scrap = 0;
    }
}

/** Save campaign progress (round, loadout, chassis, color). */
function saveCampaignProgress() {
    if (typeof _gameMode === 'undefined' || _gameMode !== 'campaign') return;
    try {
        const progress = {
            round: (typeof _round !== 'undefined') ? _round : 1,
            chassis: loadout.chassis,
            color: loadout.color,
            L: loadout.L,
            R: loadout.R,
            cpu: loadout.cpu,
            aug: loadout.aug,
            leg: loadout.leg,
            shld: loadout.shld,
            totalKills: (typeof _totalKills !== 'undefined') ? _totalKills : 0,
            perksEarned: (typeof _perksEarned !== 'undefined') ? _perksEarned : 0,
            skillTreeAllocated: (typeof _skillTreeState !== 'undefined') ? _skillTreeState.allocated : {},
            savedAt: Date.now()
        };
        localStorage.setItem('tw_campaign_progress', JSON.stringify(progress));
    } catch(e) {}
    // Debounced cloud save — avoids hammering Supabase on rapid saves
    _scheduleCloudSave();
}

let _cloudSaveTimer = null;
function _scheduleCloudSave() {
    if (_cloudSaveTimer) clearTimeout(_cloudSaveTimer);
    _cloudSaveTimer = setTimeout(() => {
        _cloudSaveTimer = null;
        if (typeof saveToCloud === 'function') saveToCloud();
    }, 2000); // 2-second debounce
}

/** Debounced campaign save — coalesces rapid saves (skill clicks, drag-and-drop) into one write per 500ms. */
let _campaignSaveTimeout = null;
function debouncedCampaignSave() {
    if (_campaignSaveTimeout) clearTimeout(_campaignSaveTimeout);
    _campaignSaveTimeout = setTimeout(() => {
        saveCampaignProgress();
        _campaignSaveTimeout = null;
    }, 500);
}

/** Load campaign progress. Returns the progress object or null. */
function loadCampaignProgress() {
    try {
        const raw = localStorage.getItem('tw_campaign_progress');
        if (!raw) return null;
        const data = JSON.parse(raw);
        // Migration: reset removed shield keys to 'none'
        if (data && REMOVED_SHIELDS.includes(data.shld)) data.shld = 'none';
        return data;
    } catch(e) { return null; }
}

// ═══════════ CONSUMABLE LOOT ORBS ═══════════

function spawnLoot(scene, x, y, forced) {
    // Drop chance: 30% normal, 100% commander
    if (!forced && Math.random() > 0.30) return;

    // Weighted type: repair 15%, ammo/charge split the rest
    const _tr = Math.random();
    const type = _tr < 0.15 ? 'repair' : _tr < 0.575 ? 'ammo' : 'charge';
    const def   = LOOT_TYPES[type];

    const orb = scene.add.circle(x, y, def.size, def.color, 0.9)
        .setStrokeStyle(2, 0xffffff).setDepth(8);
    scene.physics.add.existing(orb, true);

    // Label
    const label = scene.add.text(x, y - 18, def.label, {
        font: 'bold 9px monospace', fill: def.glow
    }).setOrigin(0.5).setDepth(9);

    // Pulse tween
    scene.tweens.add({
        targets: orb, scaleX: 1.25, scaleY: 1.25,
        duration: 500, yoyo: true, repeat: -1
    });

    const pickup = { orb, label, type, x, y };
    lootPickups.push(pickup);

    // Expire after 15s
    scene.time.delayedCall(15000, () => removeLoot(pickup));
}

function removeLoot(pickup) {
    if (pickup.orb?.active)   pickup.orb.destroy();
    if (pickup.label?.active) pickup.label.destroy();
    lootPickups = lootPickups.filter(p => p !== pickup);
}

function checkLootPickups(scene) {
    if (!player?.active || !isDeployed) return;
    lootPickups.slice().forEach(pickup => {
        if (!pickup.orb?.active) { lootPickups = lootPickups.filter(p => p !== pickup); return; }
        const dist = Phaser.Math.Distance.Between(player.x, player.y, pickup.x, pickup.y);
        if (dist < 40) {
            applyLoot(scene, pickup.type);
            removeLoot(pickup);
        }
        // Sync label
        if (pickup.label?.active) pickup.label.setPosition(pickup.x, pickup.y - 18);
    });
}

function applyLoot(scene, type) {
    sndLoot(type);
    const def = LOOT_TYPES[type];
    // Flash text
    const fx = scene.add.text(player.x, player.y - 40, def.label + ' PICKED UP', {
        font: 'bold 13px monospace', fill: def.glow,
        stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0)
      .setPosition(GAME.config.width/2, GAME.config.height * 0.35);
    scene.tweens.add({ targets: fx, y: fx.y - 40, alpha: 0, duration: 1800,
        onComplete: () => fx.destroy() });

    switch (type) {
        case 'repair': {
            // Full heal + restore broken arms
            _healPlayerFull();
            _applyFieldEngineer();
            break;
        }
        case 'ammo': {
            // 50% faster reload for 8s — mirrors rage mode
            isAmmoActive = true;
            _applyFieldEngineer();
            ['slot-L','slot-R'].forEach(id => {
                const el = document.getElementById(id);
                const bar = el?.querySelector('.wr-bar-bg');
                if (bar) { bar.style.boxShadow = '0 0 12px #ffdd00, 0 0 4px #ffaa00'; bar.style.borderColor = 'rgba(255,210,0,0.7)'; }
            });
            scene.time.delayedCall(8000, () => {
                isAmmoActive = false;
                ['slot-L','slot-R'].forEach(id => {
                    const el = document.getElementById(id);
                    const bar = el?.querySelector('.wr-bar-bg');
                    if (bar) { bar.style.boxShadow = ''; bar.style.borderColor = ''; }
                });
            });
            break;
        }
        case 'charge': {
            // 50% reduced mod cooldown for 10s
            isChargeActive = true;
            const el = document.getElementById('slot-M');
            const bar = el?.querySelector('.wr-bar-bg');
            if (bar) { bar.style.boxShadow = '0 0 12px #00ffff, 0 0 4px #00ddff'; bar.style.borderColor = 'rgba(0,220,255,0.8)'; }
            scene.time.delayedCall(10000, () => {
                isChargeActive = false;
                if (bar) { bar.style.boxShadow = ''; bar.style.borderColor = ''; }
            });
            break;
        }
    }
}
