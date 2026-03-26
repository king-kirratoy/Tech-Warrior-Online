// LIGHT CHASSIS — SIMPLIFIED SKILL TREE DATA
// 50 nodes, multi-rank system (3-5 ranks per node, keystones = 1 rank)
// Canvas: ~800x800 (-400 to +400 each axis)
// Node spacing: ~60-80 units between connected nodes
// Each rank costs 1 skill point and gives the same flat bonus
//
// Node format:
//   id, x, y, type, name, desc, stat, ranks (max), connects
//   stat is the bonus PER RANK (applied additively)

const LIGHT_SKILL_TREE = {
  chassis: 'light',
  nodes: [

    // ============================================================
    // CENTER START NODE
    // ============================================================
    { id: 'start', x: 0, y: 0, type: 'start', name: 'Pilot Core', desc: 'Your journey begins here.', stat: null, ranks: 0, connects: ['gen_dmg','gen_hp','gen_shield','gen_crit','gen_speed','gen_fr','gen_dr'] },

    // ============================================================
    // INNER RING — General stat nodes (7 nodes around center)
    // These are the first investment choices from start
    // ============================================================
    { id: 'gen_dmg', x: 0, y: -70, type: 'regular', name: 'Weapon Calibration', desc: 'All damage +2% per rank', stat: {allDmg:0.02}, ranks: 5, connects: ['start','path_crit','path_smg','path_fth'] },
    { id: 'gen_hp', x: 60, y: -35, type: 'regular', name: 'Hull Plating', desc: 'All HP +8 per rank', stat: {allHP:8}, ranks: 5, connects: ['start','path_fth','path_shield'] },
    { id: 'gen_shield', x: 60, y: 35, type: 'regular', name: 'Shield Capacitor', desc: 'Shield HP +10 per rank', stat: {shieldHP:10}, ranks: 4, connects: ['start','path_shield','path_siph'] },
    { id: 'gen_crit', x: 0, y: 70, type: 'regular', name: 'Targeting Matrix', desc: 'Crit chance +2% per rank', stat: {critChance:0.02}, ranks: 4, connects: ['start','path_siph','path_decoy','path_gc'] },
    { id: 'gen_speed', x: -60, y: 35, type: 'regular', name: 'Servo Boost', desc: 'Move speed +2% per rank', stat: {moveSpd:0.02}, ranks: 4, connects: ['start','path_sg','path_barrier'] },
    { id: 'gen_fr', x: -60, y: -35, type: 'regular', name: 'Quick Hands', desc: 'All fire rate +2% per rank', stat: {fireRate:0.02}, ranks: 5, connects: ['start','path_smg','path_sg'] },
    { id: 'gen_dr', x: -45, y: 0, type: 'regular', name: 'Composite Plating', desc: 'DR +1% per rank', stat: {dr:0.01}, ranks: 4, connects: ['start','path_barrier','path_surv'] },

    // ============================================================
    // PATHS — connector nodes leading to clusters
    // ============================================================

    // North path — toward Crit cluster + CPU mods
    { id: 'path_crit', x: 0, y: -150, type: 'regular', name: 'Lethal Focus', desc: 'Crit damage +3% per rank', stat: {critDmg:0.03}, ranks: 4, connects: ['gen_dmg','crit_chance','crit_dmg','path_jump','path_gs'] },

    // Upper-left — toward SMG
    { id: 'path_smg', x: -80, y: -130, type: 'regular', name: 'Core HP Boost', desc: 'Core HP +10 per rank', stat: {coreHP:10}, ranks: 3, connects: ['gen_dmg','gen_fr','smg_dmg','smg_util'] },

    // Upper-right — toward FTH
    { id: 'path_fth', x: 80, y: -130, type: 'regular', name: 'Shield Regen Boost', desc: 'Shield regen +5% per rank', stat: {shieldRegen:0.05}, ranks: 3, connects: ['gen_dmg','gen_hp','fth_dmg','fth_util'] },

    // Right — toward Shield
    { id: 'path_shield', x: 130, y: 0, type: 'regular', name: 'Arm HP Boost', desc: 'Arm HP +8 per rank', stat: {armHP:8}, ranks: 3, connects: ['gen_hp','gen_shield','shield_hp','shield_regen'] },

    // Lower-right — toward Siphon
    { id: 'path_siph', x: 80, y: 130, type: 'regular', name: 'All Damage Boost', desc: 'All damage +2% per rank', stat: {allDmg:0.02}, ranks: 3, connects: ['gen_shield','gen_crit','siph_heal','siph_util'] },

    // Lower-left — toward Shotgun
    { id: 'path_sg', x: -80, y: 130, type: 'regular', name: 'Leg HP Boost', desc: 'Leg HP +10 per rank', stat: {legHP:10}, ranks: 3, connects: ['gen_speed','gen_fr','sg_dmg','sg_util'] },

    // Left — toward Barrier + Survivability
    { id: 'path_barrier', x: -130, y: 0, type: 'regular', name: 'Shield HP Boost', desc: 'Shield HP +8 per rank', stat: {shieldHP:8}, ranks: 3, connects: ['gen_speed','gen_dr','barrier','path_surv'] },

    // South — toward Glass Cannon + Survivability
    { id: 'path_gc', x: 30, y: 140, type: 'regular', name: 'Crit Damage Boost', desc: 'Crit damage +2% per rank', stat: {critDmg:0.02}, ranks: 3, connects: ['gen_crit','ks_glass_cannon','path_surv'] },

    // Survivability path
    { id: 'path_surv', x: -40, y: 120, type: 'regular', name: 'All HP Boost', desc: 'All HP +5 per rank', stat: {allHP:5}, ranks: 3, connects: ['gen_dr','path_barrier','path_gc','surv_hp','surv_dr'] },

    // ============================================================
    // SMG CLUSTER (upper-left)
    // ============================================================
    { id: 'smg_dmg', x: -160, y: -200, type: 'regular', name: 'SMG Damage', desc: 'SMG damage +3% per rank', stat: {smgDmg:0.03}, ranks: 5, connects: ['path_smg','smg_notable'] },
    { id: 'smg_util', x: -100, y: -220, type: 'regular', name: 'SMG Fire Rate', desc: 'SMG fire rate +3% per rank', stat: {smgFR:0.03}, ranks: 5, connects: ['path_smg','smg_notable','smg_heat'] },
    { id: 'smg_heat', x: -140, y: -280, type: 'regular', name: 'SMG Heat Control', desc: 'SMG heat buildup -5% per rank', stat: {smgHeatBuild:-0.05}, ranks: 4, connects: ['smg_util','smg_notable'] },
    { id: 'smg_notable', x: -190, y: -270, type: 'notable', name: 'Bullet Specialist', desc: 'SMG damage +5%, crit chance +2% per rank', stat: {smgDmg:0.05,smgCrit:0.02}, ranks: 3, connects: ['smg_dmg','smg_util','smg_heat','ks_bullet_hell'] },

    // BULLET HELL keystone
    { id: 'ks_bullet_hell', x: -250, y: -320, type: 'keystone', name: 'Bullet Hell', desc: 'SMG damage +15%. SMG fires two rounds per shot.', stat: {smgDmg:0.15,smgDoubleShot:true}, ranks: 1, connects: ['smg_notable'] },

    // ============================================================
    // FLAMETHROWER CLUSTER (upper-right)
    // ============================================================
    { id: 'fth_dmg', x: 160, y: -200, type: 'regular', name: 'FTH Damage', desc: 'FTH damage +3% per rank', stat: {fthDmg:0.03}, ranks: 5, connects: ['path_fth','fth_notable'] },
    { id: 'fth_util', x: 100, y: -220, type: 'regular', name: 'Burn Duration', desc: 'Burn lasts +0.5s per rank', stat: {burnDur:0.5}, ranks: 4, connects: ['path_fth','fth_notable','fth_heat'] },
    { id: 'fth_heat', x: 140, y: -280, type: 'regular', name: 'FTH Heat Control', desc: 'FTH heat buildup -5% per rank', stat: {fthHeatBuild:-0.05}, ranks: 4, connects: ['fth_util','fth_notable'] },
    { id: 'fth_notable', x: 190, y: -270, type: 'notable', name: 'Flame Specialist', desc: 'FTH damage +5%, ignite chance +5% per rank', stat: {fthDmg:0.05,igniteChance:0.05}, ranks: 3, connects: ['fth_dmg','fth_util','fth_heat','ks_hellfire'] },

    // HELLFIRE keystone
    { id: 'ks_hellfire', x: 250, y: -320, type: 'keystone', name: 'Hellfire', desc: 'FTH +15%. Burns always ignite. Burning enemies explode on death for 30 AOE.', stat: {fthDmg:0.15,alwaysIgnite:true,burnExplode:30}, ranks: 1, connects: ['fth_notable'] },

    // ============================================================
    // SHOTGUN CLUSTER (lower-left)
    // ============================================================
    { id: 'sg_dmg', x: -160, y: 200, type: 'regular', name: 'SG Damage', desc: 'SG damage +3% per rank', stat: {sgDmg:0.03}, ranks: 5, connects: ['path_sg','sg_notable'] },
    { id: 'sg_util', x: -100, y: 220, type: 'regular', name: 'SG Pellets', desc: '+1 pellet per rank', stat: {sgPellets:1}, ranks: 3, connects: ['path_sg','sg_notable'] },
    { id: 'sg_notable', x: -190, y: 270, type: 'notable', name: 'Scatter Specialist', desc: 'SG damage +5%, close range +8% per rank', stat: {sgDmg:0.05,sgCloseDmg:0.08}, ranks: 3, connects: ['sg_dmg','sg_util','ks_decimator'] },

    // DECIMATOR keystone
    { id: 'ks_decimator', x: -250, y: 320, type: 'keystone', name: 'Decimator', desc: 'SG +15%. +3 pellets. Same-target pellets deal 5% more each.', stat: {sgDmg:0.15,sgPellets:3,sgPelletStack:0.05}, ranks: 1, connects: ['sg_notable'] },

    // ============================================================
    // SIPHON CLUSTER (lower-right)
    // ============================================================
    { id: 'siph_heal', x: 160, y: 200, type: 'regular', name: 'Siphon Heal', desc: 'Siphon heal +5% per rank', stat: {siphHeal:0.05}, ranks: 5, connects: ['path_siph','siph_notable'] },
    { id: 'siph_util', x: 100, y: 220, type: 'regular', name: 'Siphon Slow', desc: 'Siphon slow +3% per rank', stat: {siphSlow:0.03}, ranks: 4, connects: ['path_siph','siph_notable'] },
    { id: 'siph_notable', x: 190, y: 270, type: 'notable', name: 'Drain Specialist', desc: 'Siphon heal +8%, slow +5% per rank', stat: {siphHeal:0.08,siphSlow:0.05}, ranks: 3, connects: ['siph_heal','siph_util','ks_parasyte'] },

    // PARASYTE keystone
    { id: 'ks_parasyte', x: 250, y: 320, type: 'keystone', name: 'Parasyte', desc: 'Siphon heal doubled. Beam chains to 1 nearby enemy. Siphon damage +10%.', stat: {siphHealMult:2,siphChain:1,siphDmg:0.10}, ranks: 1, connects: ['siph_notable'] },

    // ============================================================
    // CRIT CLUSTER (north)
    // ============================================================
    { id: 'crit_chance', x: -50, y: -220, type: 'regular', name: 'Precision Targeting', desc: 'Crit chance +2% per rank', stat: {critChance:0.02}, ranks: 4, connects: ['path_crit','crit_notable'] },
    { id: 'crit_dmg', x: 50, y: -220, type: 'regular', name: 'Lethal Precision', desc: 'Crit damage +4% per rank', stat: {critDmg:0.04}, ranks: 4, connects: ['path_crit','crit_notable'] },
    { id: 'crit_notable', x: 0, y: -280, type: 'notable', name: "Assassin's Eye", desc: 'Crit chance +3%, crit damage +6% per rank', stat: {critChance:0.03,critDmg:0.06}, ranks: 2, connects: ['crit_chance','crit_dmg','ks_executioner'] },

    // EXECUTIONER keystone
    { id: 'ks_executioner', x: 0, y: -350, type: 'keystone', name: 'Executioner', desc: 'Crit +8%. Crit damage +20%. Crits vs targets below 25% deal triple.', stat: {critChance:0.08,critDmg:0.20,executeThreshold:0.25}, ranks: 1, connects: ['crit_notable'] },

    // ============================================================
    // SHIELD CLUSTER (right)
    // ============================================================
    { id: 'shield_hp', x: 210, y: -40, type: 'regular', name: 'Shield Matrix', desc: 'Shield HP +12 per rank', stat: {shieldHP:12}, ranks: 4, connects: ['path_shield','shield_notable'] },
    { id: 'shield_regen', x: 210, y: 40, type: 'regular', name: 'Quick Recharge', desc: 'Shield regen +5% per rank', stat: {shieldRegen:0.05}, ranks: 4, connects: ['path_shield','shield_notable'] },
    { id: 'shield_notable', x: 280, y: 0, type: 'notable', name: 'Fortified Barrier', desc: 'Shield +15 HP, regen +8% per rank', stat: {shieldHP:15,shieldRegen:0.08}, ranks: 2, connects: ['shield_hp','shield_regen'] },

    // ============================================================
    // SPEED CLUSTER (left, connects to Phantom)
    // ============================================================
    { id: 'speed_move', x: -200, y: -50, type: 'regular', name: 'Hydraulic Upgrade', desc: 'Move speed +3% per rank', stat: {moveSpd:0.03}, ranks: 4, connects: ['path_barrier','speed_notable'] },
    { id: 'speed_fr', x: -200, y: 50, type: 'regular', name: 'Streamlined Action', desc: 'Fire rate +3% per rank', stat: {fireRate:0.03}, ranks: 4, connects: ['path_barrier','speed_notable'] },
    { id: 'speed_notable', x: -270, y: 0, type: 'notable', name: 'Lightning Reflexes', desc: 'Move +5%, fire rate +5% per rank', stat: {moveSpd:0.05,fireRate:0.05}, ranks: 2, connects: ['speed_move','speed_fr','ks_phantom'] },

    // PHANTOM keystone
    { id: 'ks_phantom', x: -340, y: 0, type: 'keystone', name: 'Phantom', desc: 'Dodge +12%. Move speed +8%.', stat: {dodge:0.12,moveSpd:0.08}, ranks: 1, connects: ['speed_notable'] },

    // ============================================================
    // SURVIVABILITY CLUSTER (south-west)
    // ============================================================
    { id: 'surv_hp', x: -120, y: 170, type: 'regular', name: 'Structural HP', desc: 'All HP +10 per rank', stat: {allHP:10}, ranks: 4, connects: ['path_surv','surv_notable'] },
    { id: 'surv_dr', x: -60, y: 200, type: 'regular', name: 'Hardened Alloy', desc: 'DR +1% per rank', stat: {dr:0.01}, ranks: 4, connects: ['path_surv','surv_notable'] },
    { id: 'surv_notable', x: -100, y: 260, type: 'notable', name: 'Structural Integrity', desc: 'All HP +15, DR +2% per rank', stat: {allHP:15,dr:0.02}, ranks: 2, connects: ['surv_hp','surv_dr'] },

    // ============================================================
    // CPU MOD NODES (branching from north path)
    // ============================================================

    // General mod CD
    { id: 'cpu_cd', x: -70, y: -200, type: 'regular', name: 'Processor Boost', desc: 'All mod CD -3% per rank', stat: {modCD:-0.03}, ranks: 4, connects: ['path_crit','ks_overclock'] },

    // OVERCLOCK keystone
    { id: 'ks_overclock', x: -120, y: -280, type: 'keystone', name: 'Overclock', desc: 'All mod CD -15%. Effects last 30% longer. Mods grant +5% damage 3s.', stat: {modCD:-0.15,modDuration:0.30,modDmgBuff:0.05}, ranks: 1, connects: ['cpu_cd'] },

    // Jump
    { id: 'path_jump', x: -100, y: -170, type: 'regular', name: 'Jump Boost', desc: 'Jump height +10%, CD -5% per rank', stat: {jumpHeight:0.10,jumpCD:-0.05}, ranks: 3, connects: ['path_crit','ks_meteor'] },

    // METEOR STRIKE keystone
    { id: 'ks_meteor', x: -170, y: -230, type: 'keystone', name: 'Meteor Strike', desc: 'Jump +25%. Landing = 50 AOE. 2s invuln during jump.', stat: {jumpHeight:0.25,jumpAOE:50,jumpInvuln:2}, ranks: 1, connects: ['path_jump'] },

    // Ghost Step
    { id: 'path_gs', x: 100, y: -170, type: 'regular', name: 'Ghost Step Boost', desc: 'Invis +0.3s, CD -5% per rank', stat: {gsInvis:0.3,gsCD:-0.05}, ranks: 3, connects: ['path_crit','ks_ghost'] },

    // GHOST PROTOCOL keystone
    { id: 'ks_ghost', x: 170, y: -230, type: 'keystone', name: 'Ghost Protocol', desc: '2s full invis. First attack = 3x damage. +5% speed during invis.', stat: {gsInvis:2,gsFirstStrike:3,gsSpeed:0.05}, ranks: 1, connects: ['path_gs'] },

    // Barrier
    { id: 'barrier', x: -200, y: 100, type: 'regular', name: 'Barrier Boost', desc: 'Barrier +1.5s, CD -5% per rank', stat: {barrierDur:1.5,barrierCD:-0.05}, ranks: 3, connects: ['path_barrier','ks_stasis'] },

    // STASIS FIELD keystone
    { id: 'ks_stasis', x: -270, y: 150, type: 'keystone', name: 'Stasis Field', desc: 'Barrier +3s. Activating slows enemies 150 units by 40%.', stat: {barrierDur:3,barrierSlow:0.40,barrierSlowRange:150}, ranks: 1, connects: ['barrier'] },

    // Decoy
    { id: 'path_decoy', x: 70, y: 160, type: 'regular', name: 'Decoy Boost', desc: 'Decoy +2s, explodes for 20 dmg per rank', stat: {decoyDur:2,decoyExplode:20}, ranks: 3, connects: ['gen_crit','ks_doppel'] },

    // DOPPELGANGER keystone
    { id: 'ks_doppel', x: 130, y: 210, type: 'keystone', name: 'Doppelganger', desc: 'Decoy fires your weapon at 50%. +4s duration. 100% aggro.', stat: {decoyFire:0.50,decoyDur:4,decoyAggro:1.0}, ranks: 1, connects: ['path_decoy'] },

    // Augment
    { id: 'augment', x: 120, y: -140, type: 'regular', name: 'Augment Boost', desc: 'Augment effect +5% per rank', stat: {augEffect:0.05}, ranks: 4, connects: ['path_fth','path_shield'] },

    // GLASS CANNON keystone (south, accessible from crit path)
    { id: 'ks_glass_cannon', x: 50, y: 210, type: 'keystone', name: 'Glass Cannon', desc: 'All weapon damage +25%.', stat: {allDmg:0.25}, ranks: 1, connects: ['path_gc'] },

  ]
};
