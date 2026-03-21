// NAMESPACE window.TW = {};
window.TW = {};

// ═══════════ CHASSIS ═══════════

// ── CHASSIS RESTRICTIONS ─────────────────────────────────────────
const CHASSIS_WEAPONS = {
    light:  new Set(['none','smg','br','fth','sg','sr']),
    medium: new Set(['none','mg','br','hr','gl','plsm','sr','siege','chain']),
    heavy:  new Set(['none','mg','hr','rl','plsm','siege','chain']),
};
// ── CHASSIS MOD RESTRICTIONS ──────────────────────────────────────
const CHASSIS_MODS = {
    // Each chassis gets exactly 5 unique options (plus none).
    // 'jump' and 'decoy' appear on light only; 'rage' on heavy only; etc.
    light:  new Set(['none','jump','decoy','barrier','emp','ghost_step']),
    medium: new Set(['none','barrier','repair','missile','atk_drone','overclock_burst']),
    heavy:  new Set(['none','rage','repair','atk_drone','missile','fortress_mode']),
};
// ── CHASSIS SHIELD RESTRICTIONS ───────────────────────────────────
const CHASSIS_SHIELDS = {
    // All chassis get the 5 universal shields + their 5 chassis-unique shields
    light:  new Set(['none',
        'light_shield','standard_shield','heavy_shield','reactive_shield','fortress_shield',
        'micro_shield','flicker_shield','phase_shield','smoke_burst','mirror_shield']),
    medium: new Set(['none',
        'light_shield','standard_shield','heavy_shield','reactive_shield','fortress_shield',
        'adaptive_shield','counter_shield','pulse_shield','layered_shield','overcharge_shld']),
    heavy:  new Set(['none',
        'light_shield','standard_shield','heavy_shield','reactive_shield','fortress_shield',
        'siege_wall','bulwark_shield','retribution_shld','thermal_shield','titan_shield']),
};
// ── CHASSIS LEG RESTRICTIONS ──────────────────────────────────────
const CHASSIS_LEGS = {
    light:  new Set(['none','hydraulic_boost','gyro_stabilizer','sprint_boosters','featherweight','ghost_legs','silent_step','reactive_dash']),
    medium: new Set(['none','gyro_stabilizer','mag_anchors','mine_layer','stabilizer_gyros','adaptive_stride','seismic_dampener','reactor_legs',
                     'power_stride','evasion_coils']),
    heavy:  new Set(['none','mag_anchors','mine_layer','tremor_legs','siege_stance','ironclad_legs','suppressor_legs',
                     'warlord_stride']),
};
// ── CHASSIS AUG RESTRICTIONS ──────────────────────────────────────
const CHASSIS_AUGS = {
    // Light: mobility/aggression + FTH-specific (only chassis with FTH) + jump/dodge synergy
    light:  new Set(['none','target_painter','threat_analyzer','ballistic_weave','targeting_scope','neural_accel','ghost_circuit','reflex_amp','kill_sprint','predator_lens','shadow_core',
                     'fuel_injector','thermal_core','pyromaniac_chip']),
    medium: new Set(['none','target_painter','threat_analyzer','overclock_cpu','reactive_plating','combat_ai','drone_relay','multi_drone','tactical_uplink','field_processor','system_sync','adaptive_core','echo_targeting']),
    heavy:  new Set(['none','reactive_plating','scrap_cannon','war_machine','iron_fortress','suppressor_aura','colossus_frame','impact_core',
                     'blast_dampener','heavy_loader','chain_drive']),
};

// ⚠️ MUTATED AT RUNTIME — applyChassisUpgrades() (campaign-system.js) writes upgrade HP
// values into this object; tactical_uplink aug writes CHASSIS.medium.modCooldownMult;
// goToMainMenu() restores modCooldownMult to its original value.
const CHASSIS = {
    // max = weight limit.
    // Light: dual-fire, fast, fragile. Unique: kill sprint, ghost dodge, shadow mobility.
    // Medium: cooldown mastery, adaptive targeting, system sync.
    // Heavy: passive regen, immovable fortress, suppression aura.
    light:  { max: 160, spd: 250, scale: 0.7, coreHP: 212, armHP: 120, legHP: 152,
              dualFire: true,
              passiveReloadBonus: 0.80,
              killSpeedStacks: 0,            // kill_sprint aug state
              shadowDRWhileMoving: 0.12,     // shadow_core aug: 12% DR while moving
              identity: 'Dual-fire, fast mobility, fragile arms. Unique: kill sprint, shadow DR, ghost evasion.' },
    medium: { max: 240, spd: 210, scale: 1.0, coreHP: 272, armHP: 180, legHP: 212,
              modCooldownMult: 0.85,
              killCooldownReduction: 500,
              shieldAbsorb: 0.60,
              identity: 'All mod cooldowns −15%. Kills shave 0.5s off active cooldown. Shield absorbs 60% of damage.' },
    heavy:  { max: 340, spd: 185, scale: 1.4, coreHP: 332, armHP: 240, legHP: 272,
              passiveDR: 0.15,
              passiveRegenRate: 2,           // HP/s after 4s no damage (war_machine aug or base trait)
              passiveRegenDelay: 4000,       // ms since last damage before regen kicks in
              noJump: true,
              identity: 'Passive 15% damage reduction. Cannot equip JUMP mod or Afterleg. Built for attrition.' }
};

// ═══════════ WEAPONS ═══════════

/**
 * Weapon & modification definitions.
 * Keys used: name, weight, reload (ms), dmg, bulletSize, speed,
 *            pellets, burst, range, explosive,
 *            jumpSpeed, airTime, shieldTime, rageTime,
 *            radius, empSpeed, stunTime, cooldown
 */
const WEAPONS = {
    // ── PRIMARY WEAPONS ─────────────────────────────────────────────
    // SMG: high fire rate, close range — identity: spray & suppression, damage falls off past 280px
    smg:    { name: 'SMG',    reload: 55,   dmg: 6,   weight: 15,  bulletSize: 4,  speed: 950, rangeDropoff: 280 },
    // MG: solid sustained fire — identity: reliable workhorse
    mg:     { name: 'MG',     reload: 280,  dmg: 28,  weight: 25,  bulletSize: 6,  speed: 870 },
    // SG: close-range burst — identity: devastating at point blank, weak at range
    sg:     { name: 'SG',     reload: 700,  dmg: 16,  weight: 30,  bulletSize: 5,  speed: 580,  pellets: 6, range: 500 },
    // BR: burst precision — identity: mid-range burst, first shot accurate
    br:     { name: 'BR',     reload: 900,  dmg: 30,  weight: 30,  bulletSize: 5,  speed: 1150, burst: 3 },
    // HR: anti-armor heavy — identity: pierces shields entirely (shield absorb ignored), high single-shot damage
    hr:     { name: 'HR',     reload: 1600, dmg: 160, weight: 45,  bulletSize: 12, speed: 1100, armorBuster: true, shieldPierce: true },
    // FTH: flamethrower — identity: short-range DoT cone, no bullet, spray fire
    fth:    { name: 'FTH',    reload: 90,   dmg: 7,   weight: 30,  bulletSize: 8,  speed: 420,  flame: true, range: 350 },
    // ── SECONDARY WEAPONS ───────────────────────────────────────────
    // SR: precision eliminator — identity: pierce through all enemies in line
    sr:     { name: 'SR',     reload: 2200, dmg: 240, weight: 50,  bulletSize: 6,  speed: 2200, pierce: true },
    // GL: area denial — identity: short arm distance, big AOE
    gl:     { name: 'GL',     reload: 2800, dmg: 220, weight: 55,  explosive: true, armDist: 80 },
    // RL: high-risk heavy — identity: massive dmg+radius, can self-damage
    rl:     { name: 'RL',     reload: 3200, dmg: 250, weight: 65,  explosive: true, bulletSize: 12, speed: 820, selfDamage: true, radius: 120 },
    // PLSM: channeled beam — identity: continuous growing orb
    plsm:   { name: 'PLSM',   reload: 3200, dmg: 300, weight: 60,  size: 32 },
    // RAIL: railgun — identity: long charge, extreme single-target damage, pierces all
    rail:   { name: 'RAIL',   reload: 4500, dmg: 450, weight: 70,  bulletSize: 5,  speed: 3000, pierce: true, charge: true },
    // ── SYSTEM MODIFICATIONS ────────────────────────────────────────
    none:   { name: 'NONE',   weight: 0 },
    // JUMP: repositioning — deals slam AoE on land
    jump:   { name: 'JUMP',   weight: 15,  jumpSpeed: 950,  airTime: 220,   cooldown: 3500,  slamDmg: 40, slamRadius: 120 },
    // SHIELD: defensive — 4s active, 3s lockout after deactivation
    // BARRIER: 2s full invulnerability burst — shorter than old shield but true invincibility
    barrier: { name: 'BARRIER', weight: 20,  shieldTime: 2000, cooldown: 9000, trueInvuln: true },
    // RAGE: offensive — brief invincibility on activation, boosted damage
    rage:   { name: 'RAGE',   weight: 30,  rageTime: 3500,                  cooldown: 10500, invincFrames: 500 },
    // EMP: crowd control
    emp:    { name: 'EMP',    weight: 30,  radius: 380, empSpeed: 380, stunTime: 2400, cooldown: 9000 },
    // REPAIR DRONE: sustain — repairs most-damaged limb over time
    repair: { name: 'REPAIR', weight: 20,  healAmount: 40, healTicks: 5, tickDelay: 500, cooldown: 12000 },
    // ATTACK DRONE: offensive — deploys a turret that auto-fires at nearest enemy
    atk_drone: { name: 'DRONE', weight: 35, droneDmg: 24, droneReload: 600, droneDuration: 8000, cooldown: 12000 },
    // MISSILE POD: burst — fires 6 homing micro-missiles at up to 3 enemies
    missile: { name: 'MISSILES', weight: 35, missileDmg: 55, missileCount: 6, cooldown: 11000 },
    // DECOY: utility — hologram that draws enemy fire for 6s
    decoy:  { name: 'DECOY',  weight: 15,  decoyDuration: 6000, cooldown: 8500 },
    // ── CHASSIS-UNIQUE CORE MODS ──────────────────────────────────
    // GHOST STEP: brief cloaking dash — 1.5s invisibility, 3s cooldown
    ghost_step: { name: 'GHOST STEP', weight: 20, cloakTime: 1500, cooldown: 7000,
                  desc: 'Cloak for 1.5s. Enemies lose targeting. Ends if you fire.' },
    // OVERCLOCK BURST: 3s +25% fire rate and +20% move speed, 12s cooldown
    overclock_burst: { name: 'OVERCLOCK BURST', weight: 25, boostTime: 3000, cooldown: 12000,
                       desc: '3s burst: +25% fire rate, +20% speed. High cooldown.' },
    // FORTRESS MODE: 4s +30% DR and 5 HP/s regen, 14s cooldown
    fortress_mode: { name: 'FORTRESS MODE', weight: 30, modeTime: 4000, cooldown: 14000,
                     desc: '4s: +30% DR and 5 HP/s core regen. Immovable fortress.' },
    // ── TWO-HANDED WEAPONS ──────────────────────────────────────────
    // SIEGE CANNON: slow, devastating AoE — requires both arms, no secondary possible
    siege:  { name: 'SIEGE CANNON', reload: 4000, dmg: 380, weight: 90, twoHanded: true,
              bulletSize: 16, speed: 600, explosive: true, radius: 160,
              desc: 'Two-handed. Massive AoE cannon. Locks both arm slots.' },
    // CHAINGUN: spins up over 1.5s then fires at extreme rate — requires both arms
    chain:  { name: 'CHAINGUN',     reload: 45,   dmg: 12,  weight: 80, twoHanded: true,
              bulletSize: 5,  speed: 1100, spinUp: 1500,
              desc: 'Two-handed. Spins up for 1.5s then fires at extreme rate. Locks both arm slots.' },
};

// ═══════════ SHIELDS ═══════════

const SHIELD_SYSTEMS = {
    none:            { name: 'NONE',            weight: 0,   maxShield: 0,   regenRate: 0,    regenDelay: 0,  absorb: 0.50, desc: 'No shield system.' },
    // ── UNIVERSAL (all chassis) ───────────────────────────────────
    // Fast Cycle: low HP, near-instant regen. Burn it freely — it comes right back.
    light_shield:    { name: 'LIGHT SHIELD',    weight: 15,  maxShield: 60,  regenRate: 6.0,  regenDelay: 1,  absorb: 0.50, desc: 'Low HP (60) but regens in ~1s. Cycle it constantly. No downtime if you stay mobile.' },
    // Balanced: nothing special, nothing lacking. The dependable baseline.
    standard_shield: { name: 'STD. SHIELD',     weight: 25,  maxShield: 100, regenRate: 1.2,  regenDelay: 4,  absorb: 0.50, desc: 'Reliable 100 HP, standard 50% absorb, 4s regen delay. No gimmick — just solid.' },
    // Absorb Quality: same HP as standard but 70% absorb. Regen is slower to compensate.
    heavy_shield:    { name: 'HEAVY SHIELD',    weight: 40,  maxShield: 100, regenRate: 0.6,  regenDelay: 7,  absorb: 0.70, desc: '100 HP but absorbs 70% of each hit (vs. 50%). Regen is slow — protect the shield.' },
    // Responsive: fast regen, invuln flash on break. Breaking it is part of the rhythm.
    reactive_shield: { name: 'REACTIVE SHIELD', weight: 45,  maxShield: 80,  regenRate: 4.0,  regenDelay: 2,  absorb: 0.50, desc: '80 HP, 2s regen. On break: 0.3s invulnerability window. Designed to break and recover.' },
    // Raw Mass: enormous HP but only absorbs 25% — most damage bleeds through.
    fortress_shield: { name: 'FORTRESS SHIELD', weight: 60,  maxShield: 240, regenRate: 0.4,  regenDelay: 9,  absorb: 0.25, desc: '240 HP but only 25% absorb — damage bleeds through. A speed bump, not a wall.' },
    // ── LIGHT CHASSIS UNIQUE ──────────────────────────────────────
    // Pure cycle: 30 HP but regen starts after 1s. Almost always up.
    micro_shield:    { name: 'MICRO SHIELD',    weight: 12,  maxShield: 30,  regenRate: 10.0, regenDelay: 1,  absorb: 0.50, desc: 'Paper thin (30 HP), instant 1s regen. Always cycling. Best with high mobility.' },
    // Rhythm blocker: absorbs every other hit entirely, HP never depletes.
    flicker_shield:  { name: 'FLICKER SHIELD',  weight: 22,  maxShield: 80,  regenRate: 0,    regenDelay: 0,  absorb: 0.50, flickerBlock: true, desc: 'Alternates active/inactive each hit. Blocks every second hit completely. No regen needed.' },
    // Reactive hit window: brief invuln on every shield hit (not just break).
    phase_shield:    { name: 'PHASE SHIELD',    weight: 20,  maxShield: 70,  regenRate: 1.5,  regenDelay: 3,  absorb: 0.50, phaseInvuln: 0.25, desc: '70 HP. Each hit triggers 0.25s invulnerability. Consistent hit mitigation.' },
    // Break escape: on shield break, gain a speed burst to disengage.
    smoke_burst:     { name: 'SMOKE BURST',     weight: 18,  maxShield: 60,  regenRate: 2.0,  regenDelay: 3,  absorb: 0.50, breakSpeedBurst: true, desc: '60 HP. On break: +70% speed for 2s. Converts being overwhelmed into an escape.' },
    // Punish attacker: reflects 35% of absorbed damage back at the source.
    mirror_shield:   { name: 'MIRROR SHIELD',   weight: 28,  maxShield: 70,  regenRate: 1.0,  regenDelay: 4,  absorb: 0.50, reflectPct: 0.35, desc: '70 HP. Reflects 35% of absorbed damage back at the attacker.' },
    // ── MEDIUM CHASSIS UNIQUE ─────────────────────────────────────
    // Sustained fighter: absorb scales 50→80% over 4 consecutive hits.
    adaptive_shield: { name: 'ADAPTIVE SHIELD', weight: 30,  maxShield: 90,  regenRate: 1.0,  regenDelay: 5,  absorb: 0.50, adaptiveMax: 0.80, desc: '90 HP. Each consecutive hit increases absorb by 10% (max 80%). Rewards staying in the fight.' },
    // Charge-and-release: stores energy from hits, discharge on mod for AoE burst.
    counter_shield:  { name: 'COUNTER SHIELD',  weight: 35,  maxShield: 90,  regenRate: 1.1,  regenDelay: 4,  absorb: 0.50, counterCharge: 40, desc: '90 HP. Every 40 shield damage charges a counter-strike. Discharge on mod activation: 80 AoE dmg.' },
    // Tactical reset: on break, EMP stuns all enemies within 250px for 1.8s.
    pulse_shield:    { name: 'PULSE SHIELD',    weight: 28,  maxShield: 80,  regenRate: 3.0,  regenDelay: 2,  absorb: 0.50, breakEMP: true, desc: '80 HP, fast 2s regen. On break: EMP stuns enemies within 250px for 1.8s.' },
    // Two lives: two independent 65 HP layers. Each regen separately.
    layered_shield:  { name: 'LAYERED SHIELD',  weight: 38,  maxShield: 130, regenRate: 0.8,  regenDelay: 5,  absorb: 0.50, layered: true, layer1Max: 65, layer2Max: 65, desc: '130 HP across two 65 HP layers. Each layer regens independently once broken.' },
    // Overflow: excess absorbed damage spills into temporary core HP.
    overcharge_shld: { name: 'OVERCHARGE SHLD', weight: 32,  maxShield: 90,  regenRate: 1.2,  regenDelay: 3,  absorb: 0.50, overchargeSpill: true, desc: '90 HP. Damage absorbed beyond shield HP temporarily adds to core HP buffer.' },
    // ── HEAVY CHASSIS UNIQUE ──────────────────────────────────────
    // Fortress: massive HP + damage reduction while active. Slows you down.
    siege_wall:      { name: 'SIEGE WALL',      weight: 70,  maxShield: 280, regenRate: 0.3,  regenDelay: 10, absorb: 0.50, activeDR: 0.20, activeSpeedPenalty: 0.20, desc: '280 HP. While shield is up: -20% incoming damage, -20% move speed. Hold the line.' },
    // Passive armor: 12% DR persists even when shield is fully depleted.
    bulwark_shield:  { name: 'BULWARK SHIELD',  weight: 55,  maxShield: 140, regenRate: 0.5,  regenDelay: 7,  absorb: 0.50, passiveDR: 0.12, desc: '140 HP. Passive 12% DR always active — even when shield is broken.' },
    // Retribution: charges on absorbed hits; on shield break, explodes for AoE.
    retribution_shld:{ name: 'RETRIBUTION',     weight: 50,  maxShield: 110, regenRate: 1.8,  regenDelay: 4,  absorb: 0.50, retributionBreak: true, desc: '110 HP. Absorbing hits charges retribution. On break: AoE explosion scaled to charge.' },
    // Contact damage: enemies near you take burn damage while shield is up.
    thermal_shield:  { name: 'THERMAL SHIELD',  weight: 45,  maxShield: 120, regenRate: 0.9,  regenDelay: 5,  absorb: 0.50, thermalAura: 8, thermalRange: 160, desc: '120 HP. Enemies within 160px take 8 dmg/s while your shield is active.' },
    // Bulk + core bonus: very high HP and adds 20 bonus core HP while equipped.
    titan_shield:    { name: 'TITAN SHIELD',    weight: 65,  maxShield: 200, regenRate: 0.3,  regenDelay: 9,  absorb: 0.60, coreBonus: 20, desc: '200 HP, 60% absorb, +20 core HP bonus. Slow regen. Pure staying power.' },
};

// ═══════════ AUGMENTS ═══════════

const AUGMENTS = {
    none:           { name: 'NONE',           weight: 0,   desc: 'No augment equipped.' },
    target_painter: { name: 'TARGET PAINTER', weight: 20,  desc: 'Hitting an enemy marks them. Marked enemies take +20% damage from all sources.' },
    threat_analyzer:{ name: 'THREAT ANALY.',  weight: 20,  desc: 'Damaged enemies have their resistances reduced by 15% for 3s.' },
    overclock_cpu:  { name: 'OVERCLOCK CPU',  weight: 30,  desc: 'All weapon reload times and mod cooldowns reduced by 12%.' },
    reactive_plating:{ name: 'REACT. PLATING',weight: 30,  desc: 'Taking damage grants a stacking 5% damage reduction (max 5 stacks, resets on round end).' },
    scrap_cannon:   { name: 'SCRAP CANNON',   weight: 40,  desc: 'Destroyed enemy limbs explode for 30 AoE damage to nearby enemies.' },
    // ── DRONE COMMANDER ────────────────────────────────────────
    drone_relay:     { name: 'DRONE RELAY',    weight: 30,  desc: 'Attack Drone fires 40% faster and gains +60 bonus HP.' },
    combat_ai:       { name: 'COMBAT AI',      weight: 25,  desc: 'Drone focuses your current target for coordinated fire.' },
    multi_drone:     { name: 'MULTI-DRONE',    weight: 50,  desc: 'Deploy 2 attack drones simultaneously instead of 1.' },
    // ── GHOST ASSASSIN ─────────────────────────────────────────
    targeting_scope: { name: 'TARGET SCOPE',   weight: 30,  desc: 'SR/RAIL: +15% damage per 200px distance to target.' },
    ballistic_weave: { name: 'BALLST. WEAVE',  weight: 25,  desc: '+10% bullet speed. Bullets ignore 20% of enemy shields.' },
    neural_accel:    { name: 'NEURAL ACCEL.',  weight: 35,  desc: 'First 3s after landing from JUMP: all weapons deal 2× damage.' },
    // ── INFERNO WALL ───────────────────────────────────────────
    fuel_injector:   { name: 'FUEL INJECTOR',  weight: 30,  desc: 'FTH range +40%, cone width +30%.' },
    thermal_core:    { name: 'THERMAL CORE',   weight: 25,  desc: 'FTH always ignites on hit. Ignite duration +1s.' },
    pyromaniac_chip: { name: 'PYRO CHIP',      weight: 35,  desc: 'Ignited enemies spread fire to one adjacent enemy on death.' },
    // ── LIGHT CHASSIS UNIQUE ──────────────────────────────────────
    ghost_circuit:   { name: 'GHOST CIRCUIT',  weight: 25,  desc: 'After a JUMP landing, you are invisible to enemies for 2s.' },
    reflex_amp:      { name: 'REFLEX AMP',     weight: 20,  desc: 'First shot fired after a dodge or JUMP deals +40% damage.' },
    kill_sprint:     { name: 'KILL SPRINT',    weight: 22,  desc: 'Each kill grants +8% move speed for 4s (stacks up to 3×).' },
    predator_lens:   { name: 'PREDATOR LENS',  weight: 28,  desc: 'Enemies at >400px distance are highlighted. +10% damage vs highlighted targets.' },
    shadow_core:     { name: 'SHADOW CORE',    weight: 30,  desc: 'While moving, all incoming damage reduced by 12%.' },
    // ── MEDIUM CHASSIS UNIQUE ─────────────────────────────────────
    tactical_uplink: { name: 'TACTICAL UPLINK',weight: 28,  desc: 'Mod cooldowns reduced by additional 10%. Stacks with Cooldown Mastery.' },
    field_processor: { name: 'FIELD PROCESSOR',weight: 25,  desc: 'After 3 hits on the same enemy, deal +15% damage to that target permanently.' },
    system_sync:     { name: 'SYSTEM SYNC',    weight: 30,  desc: 'Activating any mod heals 20 HP on your most-damaged limb.' },
    adaptive_core:   { name: 'ADAPTIVE CORE',  weight: 32,  desc: 'Each round survived increases your base DR by 3% (max +15%).' },
    echo_targeting:  { name: 'ECHO TARGETING', weight: 26,  desc: 'Hitting an enemy reveals all enemies within 300px for 3s.' },
    // ── HEAVY CHASSIS UNIQUE ──────────────────────────────────────
    war_machine:     { name: 'WAR MACHINE',    weight: 35,  desc: 'Passive core regeneration: 2 HP/s after 4s without taking damage.' },
    iron_fortress:   { name: 'IRON FORTRESS',  weight: 40,  desc: 'When stationary 1.5s+: +15% DR and +10% damage bonus.' },
    suppressor_aura: { name: 'SUPPRESSOR AURA',weight: 38,  desc: 'Enemies within 200px have -15% move speed. Passive intimidation field.' },
    colossus_frame:  { name: 'COLOSSUS FRAME', weight: 45,  desc: 'Core HP +60. Arm and leg HP +40. Built to absorb punishment.' },
    impact_core:     { name: 'IMPACT CORE',    weight: 32,  desc: 'Close-range kills (<200px) restore 15 core HP and stun nearby enemies for 0.5s.' },
};

// ═══════════ LEGS ═══════════

// ── LEG SYSTEMS — equipped to legs, disabled when legs destroyed ──
const LEG_SYSTEMS = {
    none:           { name: 'NONE',          weight: 0,   desc: 'No leg system.' },
    hydraulic_boost:{ name: 'HYDRO BOOST',   weight: 25,  desc: '+20% move speed. Legs take 15% less damage.' },
    gyro_stabilizer:{ name: 'GYRO STAB.',    weight: 25,  desc: 'Eliminates slowdown from damaged legs. Aim accuracy +10%.' },
    mine_layer:     { name: 'MINE LAYER',    weight: 35,  desc: 'Drops a proximity mine every 8s while moving. Mines deal 80 AoE damage.' },
    mag_anchors:    { name: 'MAG ANCHORS',   weight: 30,  desc: 'While stationary: take 20% less damage and deal 15% more damage.' },
    afterleg:       { name: 'AFTERLEG',      weight: 40,  desc: 'JUMP mod launches farther (+50%). Landing creates a shockwave (60 dmg, 150px).' },
    // ── LIGHT CHASSIS UNIQUE ──────────────────────────────────────
    sprint_boosters: { name: 'SPRINT BOOST',  weight: 28,  desc: 'Double-tap W for a 0.8s speed burst (+80%). 4s cooldown.' },
    featherweight:   { name: 'FEATHERWEIGHT', weight: 15,  desc: '+15% reload speed and +10% move speed. Light frame optimization — faster in every way.' },
    ghost_legs:      { name: 'GHOST LEGS',    weight: 22,  desc: 'Taking damage while moving gives 0.2s speed burst. Hard to pin down.' },
    silent_step:     { name: 'SILENT STEP',   weight: 20,  desc: 'Enemies lose vision of you 40% faster when moving. Flanking radius extended.' },
    reactive_dash:   { name: 'REACTIVE DASH', weight: 30,  desc: 'When legs drop below 50% HP, automatically trigger a short dodge dash.' },
    // ── MEDIUM CHASSIS UNIQUE ─────────────────────────────────────
    stabilizer_gyros:{ name: 'STABILIZER GYR',weight: 28,  desc: 'While stationary: +15% accuracy and +8% damage. Encourages deliberate positioning.' },
    jump_jets:       { name: 'JUMP JETS',     weight: 32,  desc: 'JUMP mod gains an additional charge (2 uses per cooldown).' },
    adaptive_stride: { name: 'ADAPTIVE STRIDE',weight: 25, desc: 'Automatically adjust speed: +15% faster when retreating, better kiting.' },
    seismic_dampener:{ name: 'SEISMIC DAMP.', weight: 30,  desc: 'Leg damage reduced by 25%. Stomps on landing deal +30% slam damage.' },
    reactor_legs:    { name: 'REACTOR LEGS',  weight: 35,  desc: 'Mod cooldowns reduce by 1s each time you move 300px. Rewards mobility.' },
    // ── HEAVY CHASSIS UNIQUE ──────────────────────────────────────
    tremor_legs:     { name: 'TREMOR LEGS',   weight: 45,  desc: 'After standing still 2s, moving creates a tremor: 40 AoE dmg, 120px radius.' },
    siege_stance:    { name: 'SIEGE STANCE',  weight: 40,  desc: 'While stationary: +25% damage, +20% DR. Plants you but makes you a fortress.' },
    ironclad_legs:   { name: 'IRONCLAD LEGS', weight: 38,  desc: 'Leg HP +80. Legs take 30% less damage. Much harder to cripple.' },
    ground_slam:     { name: 'GROUND SLAM',   weight: 42,  desc: 'JUMP landing AoE doubled in radius and damage. Turn landing into a weapon.' },
    suppressor_legs: { name: 'SUPPRESSOR LEG',weight: 35,  desc: 'Enemies within 220px move 20% slower. Passive suppression aura from heavy frame.' },
    // ── MEDIUM CHASSIS UNIQUE (replacing jump-dependent legs) ─────
    power_stride:    { name: 'POWER STRIDE',   weight: 28,  desc: 'Each kill grants +5% move speed for 3s, stacking up to 3×. Keep moving, keep killing.' },
    evasion_coils:   { name: 'EVASION COILS',  weight: 30,  desc: 'While moving, incoming damage reduced by 10%. Close-range hits (<150px) reduced by 15%.' },
    // ── HEAVY CHASSIS UNIQUE (replacing jump-dependent leg) ───────
    warlord_stride:  { name: 'WARLORD STRIDE', weight: 38,  desc: 'While leg HP is above 50%: +8% move speed and +10% damage at close range (<180px).' },
};

// ── STARTER LOADOUTS ─────────────────────────────────────────────
/** Starter loadouts per chassis — barebones gear to find the rest through loot. */
const STARTER_LOADOUTS = {
    light:  { L: 'smg',  R: 'none', mod: 'none', aug: 'none', leg: 'none', shld: 'light_shield' },
    medium: { L: 'mg',   R: 'none', mod: 'none', aug: 'none', leg: 'none', shld: 'standard_shield' },
    heavy:  { L: 'hr',   R: 'none', mod: 'none', aug: 'none', leg: 'none', shld: 'heavy_shield' },
};

// ═══════════ UI CONFIG ═══════════

// ── Phaser game config ────────────────────────────────────────────
const GAME_CONFIG = {
    type: Phaser.AUTO,
    parent: 'game-container',
    roundPixels: true,
    width:  window.innerWidth,
    height: window.innerHeight,
    fps:    { target: 60, forceSetTimeOut: true },
    physics: {
        default: 'arcade',
        arcade:  { debug: false, fps: 60 }
    },
    scene: { preload, create, update }
};

// ── Supabase infrastructure ───────────────────────────────────────
const SUPABASE_URL  = 'https://sqkqczkxjeutxcirbsgv.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_OKjtHa6csB206hHGBaNa1g_LZrYXtvo';
const SUPABASE_TABLE = 'tw_scores';
const SUPABASE_CAMPAIGN_TABLE = 'tw_campaign_saves';

// ── Leaderboard ───────────────────────────────────────────────────
const LB_KEY    = 'tw_leaderboard_v1';
const LB_MAX    = 20;

// ── Score validation ceilings ─────────────────────────────────────
const SCORE_MAX_ROUND  = 999;      // no realistic run exceeds this
const SCORE_MAX_KILLS  = 30000;    // ~30 enemies/round × 999 rounds

// ── Score validation (cont.) ──────────────────────────────────────
const SCORE_MAX_DAMAGE = 100000000; // 100 million — generous ceiling

// ═══════════ COVER ═══════════

const COVER_DEFS = [
    // { type, w, h, hp (0=indestructible), color, stroke }
    { type: 'rock',     w: 110, h:  90, hp: 0,   color: 0x445544, stroke: 0x88aa88 },
    { type: 'rock',     w:  80, h:  70, hp: 0,   color: 0x445544, stroke: 0x88aa88 },
    { type: 'rock',     w: 130, h: 100, hp: 0,   color: 0x334433, stroke: 0x667766 },
    { type: 'wall',     w: 180, h:  28, hp: 0,   color: 0x445566, stroke: 0x8899aa },
    { type: 'wall',     w:  28, h: 180, hp: 0,   color: 0x445566, stroke: 0x8899aa },
    { type: 'wall',     w: 140, h:  24, hp: 0,   color: 0x445566, stroke: 0x8899aa },
    { type: 'crate',    w:  60, h:  60, hp: 280, color: 0x886622, stroke: 0xddaa44 },
    { type: 'crate',    w:  55, h:  55, hp: 280, color: 0x886622, stroke: 0xddaa44 },
    // Buildings (index 8-11) — drawn via placeBuilding(), physics body sizes below
    { type: 'building', w: 130, h: 110, hp: 0,   color: 0x3a3f4a, stroke: 0x6a7080, variant: 'small'  },
    { type: 'building', w: 170, h: 140, hp: 0,   color: 0x323844, stroke: 0x5a6070, variant: 'medium' },
    { type: 'building', w: 230, h: 190, hp: 0,   color: 0x2c313c, stroke: 0x505868, variant: 'large'  },
    { type: 'building', w: 150, h: 120, hp: 0,   color: 0x3d3530, stroke: 0x6a5a50, variant: 'ruin'   },
];

// ═══════════ LOOT ═══════════

const LOOT_TYPES = {
    repair: { label: 'REPAIR',  color: 0x00ff44, glow: '#00ff44', size: 10 },
    ammo:   { label: 'AMMO',    color: 0xffdd00, glow: '#ffdd00', size: 10 },
    charge: { label: 'CHARGE',  color: 0x00ffff, glow: '#00ffff', size: 10 },
};

// ═══════════ COLORS ═══════════

const ENEMY_COLORS = {
    light:  { body: 0x1a0a00, head: 0xff6600, eye: 0xff0000 },
    medium: { body: 0x1a0000, head: 0xcc2200, eye: 0xff4400 },
    heavy:  { body: 0x0a0a1a, head: 0x4400cc, eye: 0xff0000 }
};
// Commander unit — dark armour with gold accent
const COMMANDER_COLORS = { body: 0x1a1000, head: 0xddaa00, eye: 0xff8800 };
const MEDIC_COLORS     = { body: 0x001a08, head: 0x00cc55, eye: 0x00ffaa };
const BOSS_COLORS = {
    warden:    { body: 0x0a001a, head: 0x8800ff, eye: 0xff00ff },
    razor:     { body: 0x1a0000, head: 0xff0022, eye: 0xff8800 },
    architect: { body: 0x001a1a, head: 0x00cccc, eye: 0xffffff },
    juggernaut:{ body: 0x0f0f0f, head: 0x441100, eye: 0xff2200 },
    swarm:     { body: 0x0a1a00, head: 0x66cc00, eye: 0x88ff00 },
    mirror:    { body: 0x111122, head: 0x4488ff, eye: 0x00ffff },
    titan:     { body: 0x1a1000, head: 0xff8800, eye: 0xffcc00 },
    core:      { body: 0x001133, head: 0x00ccff, eye: 0x00ffff },
};

// ── Enemy weapon key lists ────────────────────────────────────────
// Primary weapon keys available to enemies (excludes none)
const ENEMY_PRIMARY   = ['smg', 'mg', 'br', 'sg', 'hr', 'fth'];
// All weapons that can go in either arm slot
const ENEMY_ARM_WEAPONS = ['smg','mg','br','sg','hr','fth','sr','gl','rl','plsm']; // rail excluded: too accurate + hitscan
// Two-handed weapons (medium/heavy only)
const ENEMY_2H_WEAPONS  = ['siege','chain'];
// ENEMY_SECONDARY and ENEMY_MODS are now handled inline in randomEnemyLoadout (full parity with player)

// ── Combat utility sets ───────────────────────────────────────────
// Explosive keys for dual-explosive warning
const EXPLOSIVE_KEYS = new Set(['gl','rl','plsm','rail']);
