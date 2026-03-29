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
//   RARITY_DEFS, ITEM_BASES, UNIQUE_ITEMS, AFFIX_POOL
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
    overcharge:     { baseType:'cpu', name:'Overcharge Module',   icon:'mod_oc',       baseStats:{ modCdPct:-5, modEffPct:5 } },

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
// Each boss has 1 Legendary + 1 Epic unique drop. Unique items have
// special passive/proc effects beyond standard stat bonuses.
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

// Generate a unique boss item from a template
function generateUniqueItem(uniqueKey, round) {
    const template = UNIQUE_ITEMS[uniqueKey];
    if (!template) return null;

    const level = round || 1;
    const levelMult = 1 + (level - 1) * 0.03;
    const rarityDef = RARITY_DEFS[template.rarity];

    // Scale base stats
    const scaledStats = {};
    for (const [k, v] of Object.entries(template.baseStats)) {
        if (typeof v === 'number') {
            scaledStats[k] = Math.round(v * levelMult * rarityDef.statMult);
        } else {
            scaledStats[k] = v;
        }
    }

    // Copy affixes (scale values by level)
    const affixes = template.affixes.map(a => ({
        ...a,
        value: Math.round(a.value * levelMult)
    }));
    // Update labels with scaled values
    affixes.forEach(a => {
        const prefix = a.stat === 'modCdPct' ? '-' : '+';
        a.label = a.label.replace(/[+-]?\d+/, prefix + a.value);
    });

    const item = {
        id: 'item_' + (++_lootItemIdCounter),
        baseType: template.baseType,
        subType: template.subType || uniqueKey,
        baseKey: uniqueKey,
        name: template.name,
        shortName: template.shortName,
        icon: template.icon,
        rarity: template.rarity,
        level,
        baseStats: scaledStats,
        affixes,
        computedStats: {},
        isUnique: true,
        uniqueEffect: template.uniqueEffect,
        uniqueLabel: template.uniqueLabel,
        uniqueDesc: template.uniqueDesc,
        boss: template.boss
    };

    // Compute final stats
    item.computedStats = { ...scaledStats };
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

    // Guaranteed unique drop: 25% legendary, 75% epic
    const uniqueKey = Math.random() < 0.25 ? table.legendary : table.epic;
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

// ── AFFIX POOL ─────────────────────────────────────────────────
const AFFIX_POOL = {
    // Offensive
    dmgFlat:      { label:'+{v} Damage',             min:2,  max:18, weight:10, types:['weapon'] },
    dmgPct:       { label:'+{v}% Damage',            min:3,  max:28, weight:8,  types:['weapon','arms','augment'] },
    critChance:   { label:'+{v}% Crit Chance',       min:2,  max:18, weight:7,  types:['weapon','augment'] },
    critDmg:      { label:'+{v}% Crit Damage',       min:10, max:60, weight:5,  types:['weapon','augment'] },
    fireRatePct:  { label:'+{v}% Fire Rate',          min:3,  max:22, weight:8,  types:['weapon','arms'] },
    pellets:      { label:'+{v} Pellets',            min:1,  max:3,  weight:3,  types:['weapon'], subTypes:['sg'] },
    splashRadius: { label:'+{v}% Blast Radius',      min:10, max:45, weight:5,  types:['weapon'], subTypes:['gl','rl','plsm'] },

    // Defensive
    coreHP:       { label:'+{v} Core HP',            min:10, max:100, weight:8,  types:['armor'] },
    armHP:        { label:'+{v} Arm HP',             min:5,  max:50,  weight:6,  types:['arms'] },
    legHP:        { label:'+{v} Leg HP',             min:5,  max:50,  weight:6,  types:['legs'] },
    allHP:        { label:'+{v} All Part HP',        min:5,  max:30,  weight:4,  types:['armor','augment'] },
    dr:           { label:'+{v}% Damage Reduction',  min:1,  max:12,  weight:5,  types:['armor','legs'] },
    shieldHP:     { label:'+{v} Shield Capacity',    min:5,  max:50,  weight:7,  types:['shield'] },
    shieldRegen:  { label:'+{v}% Shield Regen',      min:5,  max:35,  weight:6,  types:['shield'] },
    absorbPct:    { label:'+{v}% Shield Absorb',     min:2,  max:10,  weight:4,  types:['shield'] },
    dodgePct:     { label:'+{v}% Dodge Chance',      min:1,  max:10,  weight:4,  types:['legs'] },

    // Utility
    speedPct:     { label:'+{v}% Move Speed',        min:2,  max:14, weight:6,  types:['legs','augment'] },
    modCdPct:     { label:'-{v}% Mod Cooldown',      min:3,  max:22, weight:6,  types:['cpu'] },
    modEffPct:    { label:'+{v}% Mod Duration %',  min:5,  max:30, weight:5, types:['cpu'] },
    lootMult:     { label:'+{v}% Loot Quality',      min:3,  max:18, weight:3,  types:['augment'] },
    autoRepair:   { label:'+{v} HP/sec Regen',       min:1,  max:6,  weight:4,  types:['armor','augment'] },
};

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
        weapon: 30, armor: 10, arms: 8, legs: 6,
        shield: 6, cpu: 6, augment: 6,
        // System drops — the main way to get new equipment
        shield_system: 8, cpu_system: 7, leg_system: 7, aug_system: 6
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

    if (baseType === 'weapon') {
        // ── Step 1/2: Weapons roll base damage — no item-level scaling ──
        const w = WEAPONS[baseKey];
        if (!w) return null;
        subType = baseKey;
        name = (typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[baseKey] : null) || w.name;
        icon = baseKey; // icon key matches weapon key
        // Base damage roll: floor = hardcoded dmg, ceiling = floor × 1.05 (1.10 for Legendary)
        const dmgFloor = w.dmg || 0;
        const dmgCeiling = dmgFloor * (isLegendary ? 1.10 : 1.05);
        const rolledDmg = Math.round(dmgFloor + Math.random() * (dmgCeiling - dmgFloor));
        baseStats = {};
        if (w.dmg)      baseStats.dmg      = rolledDmg;
        if (w.fireRate) baseStats.fireRate  = w.fireRate;
        if (w.pellets)  baseStats.pellets   = w.pellets;
        if (w.speed)    baseStats.speed     = w.speed;
        if (w.range)    baseStats.range     = w.range;
        if (w.radius)   baseStats.radius    = w.radius;
        if (w.burst)    baseStats.burst     = w.burst;
    } else {
        const def = ITEM_BASES[baseKey];
        subType = baseKey;
        name = def.name;
        icon = def.icon;
        // Copy secondary stats from ITEM_BASES; primary stat is rolled below
        baseStats = { ...def.baseStats };

        if (baseType === 'cpu_system') {
            // ── Step 3: CPU mod — roll base cooldown (lower is better) ──
            const modDef = WEAPONS[def.systemKey];
            if (modDef?.cooldown) {
                const cdFloor = modDef.cooldown;
                const cdCeiling = Math.round(cdFloor * (isLegendary ? 0.90 : 0.95) * 10) / 10;
                const rolledCd = Math.round((cdCeiling + Math.random() * (cdFloor - cdCeiling)) * 10) / 10;
                baseStats.cooldown = rolledCd;
            }
        } else if (baseType === 'armor') {
            // ── Step 4: Armor — roll Core HP ──
            const [lo, hi] = isLegendary ? [30, 50] : [10, 30];
            baseStats.coreHP = Math.round(lo + Math.random() * (hi - lo));
        } else if (baseType === 'arms') {
            // ── Step 4: Arms — roll Arm HP ──
            const [lo, hi] = isLegendary ? [30, 50] : [10, 30];
            baseStats.armHP = Math.round(lo + Math.random() * (hi - lo));
        } else if (baseType === 'shield' || baseType === 'shield_system') {
            // ── Step 4: Shield — roll Shield HP ──
            const [lo, hi] = isLegendary ? [30, 50] : [10, 30];
            baseStats.shieldHP = Math.round(lo + Math.random() * (hi - lo));
        } else if (baseType === 'legs' || baseType === 'leg_system') {
            // ── Step 4: Legs — roll Leg HP ──
            const [lo, hi] = isLegendary ? [30, 50] : [10, 30];
            baseStats.legHP = Math.round(lo + Math.random() * (hi - lo));
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
            baseStats = { [pick.key]: Math.round(lo + Math.random() * (hi - lo)) };
        }
    }

    // Roll affixes — system items use their parent slot type for affix pool
    const _affixTypeMap = { shield_system:'shield', cpu_system:'cpu', leg_system:'legs', aug_system:'augment' };
    const affixType = _affixTypeMap[baseType] || baseType;
    const affixes = rollAffixes(affixType, subType, rarity);

    // For system items, carry the systemKey so equip logic can activate the GAME system
    const _baseDef = ITEM_BASES[baseKey];
    const systemKey = _baseDef?.systemKey || null;

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

    return item;
}

// ── EQUIPMENT DROP CHANCE ──────────────────────────────────────
function _getEquipDropChance(enemyData) {
    const round = (typeof _round !== 'undefined') ? _round : 1;
    if (enemyData?.isBoss) return 1.0;
    if (enemyData?.isCommander) return 0.45;
    if (enemyData?.isElite) return 0.35;
    if (enemyData?.enemyType) return 0.25;
    if (enemyData?.isMedic) return 0.18;
    // Base drop rate scales with round, floors at 8%, caps at 22%
    const base = Math.min(0.08 + round * 0.007, 0.22);
    // Late-GAME bonus: +1% per round past 20, up to +10%
    const lateBonus = round > 20 ? Math.min((round - 20) * 0.01, 0.10) : 0;
    return Math.min(base + lateBonus, 0.35);
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
function spawnEquipmentDrop(scene, x, y, item) {
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
    const beamCfg = {
        common:    { h: 60,  w: 3,  glowR: 10, coreW: 1,  baseR: 8,  glowA: 0.10, coreA: 0.30, pulseA: 0.04 },
        uncommon:  { h: 80,  w: 4,  glowR: 12, coreW: 1.5,baseR: 10, glowA: 0.14, coreA: 0.40, pulseA: 0.06 },
        rare:      { h: 110, w: 5,  glowR: 16, coreW: 2,  baseR: 14, glowA: 0.18, coreA: 0.50, pulseA: 0.08 },
        epic:      { h: 140, w: 6,  glowR: 20, coreW: 2.5,baseR: 16, glowA: 0.22, coreA: 0.60, pulseA: 0.10 },
        legendary: { h: 180, w: 8,  glowR: 26, coreW: 3,  baseR: 20, glowA: 0.28, coreA: 0.70, pulseA: 0.12 }
    }[item.rarity] || beamCfg.common;

    // ── Base glow on the ground ──
    const baseGlow = scene.add.circle(x, y, beamCfg.baseR, rc, beamCfg.glowA + 0.10).setDepth(6);
    scene.tweens.add({
        targets: baseGlow, alpha: beamCfg.glowA,
        yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut'
    });

    // ── Outer beam (wide, soft glow) ──
    const beam = scene.add.rectangle(x, y - beamCfg.h / 2, beamCfg.w * 3, beamCfg.h, rc, beamCfg.glowA).setDepth(6);
    beam.setOrigin(0.5, 1);
    beam.setPosition(x, y);
    scene.tweens.add({
        targets: beam, alpha: beamCfg.pulseA,
        yoyo: true, repeat: -1, duration: 900 + Math.random() * 300
    });

    // ── Inner beam core (bright, narrow) ──
    const beamCore = scene.add.rectangle(x, y - beamCfg.h / 2, beamCfg.coreW * 2, beamCfg.h, 0xffffff, beamCfg.coreA).setDepth(7);
    beamCore.setOrigin(0.5, 1);
    beamCore.setPosition(x, y);
    scene.tweens.add({
        targets: beamCore, alpha: beamCfg.coreA * 0.4,
        yoyo: true, repeat: -1, duration: 700 + Math.random() * 200
    });

    // ── Glow circle at beam top ──
    const beamGlow = scene.add.circle(x, y - beamCfg.h, beamCfg.glowR * 0.6, rc, beamCfg.glowA * 0.5).setDepth(6);
    scene.tweens.add({
        targets: beamGlow, alpha: 0, scaleX: 1.3, scaleY: 1.3,
        yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.easeInOut'
    });

    // ── Item icon at the base ──
    const icon = _drawLootIcon(scene, x, y, item.icon, rc);

    // ── Item name tag ──
    const tag = scene.add.text(x, y + 16, item.shortName, {
        font: 'bold 8px Courier New',
        fill: rarityDef.colorStr,
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5).setDepth(9).setAlpha(0.85);

    // ── Rarity indicator dot ──
    const rarityDot = scene.add.circle(x, y - 14, 3, rc, 0.9).setDepth(9);

    // Float animation for icon area
    scene.tweens.add({
        targets: [rarityDot, baseGlow],
        y: '-=4', yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut'
    });

    // Screen shake for epic/legendary drops
    if (item.rarity === 'epic') {
        scene.cameras.main.shake(120, 0.004);
    }
    if (item.rarity === 'legendary') {
        scene.cameras.main.shake(200, 0.008);
        // Star burst particles
        for (let i = 0; i < 6; i++) {
            const star = scene.add.star(x, y - 10, 4, 2, 5, rc, 0.7)
                .setDepth(10).setScale(0.5);
            scene.tweens.add({
                targets: star,
                x: x + Phaser.Math.Between(-35, 35),
                y: y + Phaser.Math.Between(-50, 10),
                alpha: 0, scale: 0,
                duration: 1200 + i * 200,
                onComplete: () => star.destroy()
            });
        }
        if (typeof sndEquipDrop === 'function') {
            sndEquipDrop(item.rarity);
        } else if (typeof _noise === 'function') {
            _noise(0.12, 0.5, 0, 300, 700);
        }
    }

    const dropData = {
        item,
        glow: baseGlow, icon, tag, rarityDot, beam, beamGlow, beamCore, baseGlow,
        x, y,
        active: true
    };

    _equipmentDrops.push(dropData);
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

// ── PICKUP NOTIFICATION TOAST ──────────────────────────────────
function _showLootPickupNotification(scene, item) {
    const rarityDef = RARITY_DEFS[item.rarity];

    // Determine vertical offset based on active notifications
    _lootNotifications = _lootNotifications.filter(n => n.active);
    const yOffset = _lootNotifications.length * 36;

    const baseX = 10;
    const baseY = 122 + yOffset;

    // Build notification text
    const affixText = item.affixes.length > 0
        ? '  ' + item.affixes.map(a => a.label).join(', ')
        : '';
    const displayText = `${rarityDef.label === 'Common' ? '' : rarityDef.label + ' '}${item.shortName}${affixText}`;

    // Background bar — rounded rect via Graphics (max-width 280px, border-radius 6px)
    const bg = scene.add.graphics().setDepth(200).setScrollFactor(0);
    bg.fillStyle(0x0a0f16, 0.92);
    bg.fillRoundedRect(0, -14, 280, 28, 6);
    bg.lineStyle(1, rarityDef.color, 0.6);
    bg.strokeRoundedRect(0, -14, 280, 28, 6);

    // Rarity stripe on left edge
    const stripe = scene.add.rectangle(baseX, baseY, 3, 28, rarityDef.color, 0.9)
        .setOrigin(0, 0.5).setDepth(201).setScrollFactor(0);

    // Text
    const txt = scene.add.text(baseX + 7, baseY, displayText, {
        font: 'bold 10px Courier New',
        fill: rarityDef.colorStr,
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0, 0.5).setDepth(201).setScrollFactor(0);

    // Slide in from left
    const startX = baseX - 310;
    bg.x = startX;
    bg.y = baseY;
    stripe.x = startX;
    txt.x = startX + 7;

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
        x: baseX,
        duration: 300,
        ease: 'Power2'
    });
    scene.tweens.add({
        targets: [txt],
        x: baseX + 7,
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

    // Boss can drop unique items + regular drops
    if (enemyData?.isBoss) {
        const bossType = enemyData.bossType || null;
        let drops = [];
        if (bossType && typeof rollBossDrops === 'function') {
            drops = rollBossDrops(bossType, round);
        } else {
            // Fallback: generate 1-3 regular items
            const dropCount = Phaser.Math.Between(1, 3);
            for (let i = 0; i < dropCount; i++) {
                const item = generateItem(round, enemyData);
                if (item) drops.push(item);
            }
        }
        drops.forEach((item, i) => {
            const ox = x + Phaser.Math.Between(-50, 50);
            const oy = y + Phaser.Math.Between(-50, 50);
            spawnEquipmentDrop(scene, ox, oy, item);
        });
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

// ── CLEANUP (called when returning to hangar/main menu) ────────
function cleanupEquipmentDrops() {
    _equipmentDrops.forEach(drop => {
        [drop.glow, drop.icon, drop.tag, drop.rarityDot, drop.beam, drop.beamGlow, drop.beamCore, drop.baseGlow]
            .filter(Boolean)
            .forEach(o => { try { if (o.destroy) o.destroy(); } catch(e){} });
    });
    _equipmentDrops = [];
    _lootNotifications = [];
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
        name = w.name;
        icon = weaponKey;
        baseStats = {};
        if (w.dmg) baseStats.dmg = w.dmg;
        if (w.fireRate) baseStats.fireRate = w.fireRate;
        if (w.pellets) baseStats.pellets = w.pellets;
        if (w.speed) baseStats.speed = w.speed;
        if (w.range) baseStats.range = w.range;
        if (w.radius) baseStats.radius = w.radius;
        if (w.burst) baseStats.burst = w.burst;
    } else {
        // System item — find the matching ITEM_BASES entry by systemKey
        const entry = Object.entries(ITEM_BASES).find(([, def]) => def.baseType === baseType && def.systemKey === weaponKey);
        if (!entry) return null;
        baseKey = entry[0];
        const def = entry[1];
        subType = baseKey;
        name = def.name;
        icon = def.icon;
        baseStats = { ...def.baseStats };
        systemKey = def.systemKey;
    }

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

    // Starter weapon in L ARM
    if (starter.L && starter.L !== 'none') {
        _equipped.L = _createStarterItem('weapon', starter.L);
    }
    // Starter shield
    if (starter.shld && starter.shld !== 'none') {
        _equipped.shield = _createStarterItem('shield_system', starter.shld);
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
