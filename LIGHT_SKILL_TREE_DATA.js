// LIGHT CHASSIS — SKILL TREE NODE DATA
// Canvas: ~2000x2000 (-1000 to +1000 each axis)
// Node spacing: ~50-60 units between connected nodes
// Coordinate system: (0,0) = center start node
// Pathing: 3-4 small nodes between interesting nodes
// All connections are bidirectional
//
// Node types: 'start', 'regular', 'notable', 'keystone'
// Categories: weapon clusters, general clusters, connectors

const LIGHT_SKILL_TREE = {
  chassis: 'light',
  nodes: [

    // ============================================================
    // CENTER START NODE
    // ============================================================
    { id: 'start', x: 0, y: 0, type: 'start', name: 'Pilot Core', desc: 'Your journey begins here', stat: null, connects: ['c_n1','c_ne1','c_e1','c_se1','c_s1','c_sw1','c_w1','c_nw1'] },

    // ============================================================
    // CORE SPOKES — 8 initial branches from center
    // These are the first nodes in each direction
    // ============================================================
    { id: 'c_n1', x: 0, y: -55, type: 'regular', name: 'Hull Plating', desc: 'Core gains 10 HP', stat: {coreHP:10}, connects: ['start','c_n2'] },
    { id: 'c_ne1', x: 45, y: -35, type: 'regular', name: 'Servo Boost', desc: '+3% move speed', stat: {moveSpd:0.03}, connects: ['start','c_ne2'] },
    { id: 'c_e1', x: 55, y: 0, type: 'regular', name: 'Shield Capacitor', desc: 'Shield gains 8 max HP', stat: {shieldHP:8}, connects: ['start','c_e2'] },
    { id: 'c_se1', x: 45, y: 35, type: 'regular', name: 'Composite Plating', desc: 'Take 1% less damage', stat: {dr:0.01}, connects: ['start','c_se2'] },
    { id: 'c_s1', x: 0, y: 55, type: 'regular', name: 'Targeting Scope', desc: 'All weapons crit 2% more', stat: {critChance:0.02}, connects: ['start','c_s2'] },
    { id: 'c_sw1', x: -45, y: 35, type: 'regular', name: 'Leg Reinforcement', desc: 'Legs gain 10 HP', stat: {legHP:10}, connects: ['start','c_sw2'] },
    { id: 'c_w1', x: -55, y: 0, type: 'regular', name: 'Quick Hands', desc: 'All weapons fire 3% faster', stat: {fireRate:0.03}, connects: ['start','c_w2'] },
    { id: 'c_nw1', x: -45, y: -35, type: 'regular', name: 'Arm Reinforcement', desc: 'Arms gain 8 HP', stat: {armHP:8}, connects: ['start','c_nw2'] },

    // ============================================================
    // SPOKE EXTENSIONS — 2nd ring (~110 from center)
    // ============================================================
    { id: 'c_n2', x: 0, y: -110, type: 'regular', name: 'Shield Matrix', desc: 'Shield gains 10 max HP', stat: {shieldHP:10}, connects: ['c_n1','c_n3','path_crit1'] },
    { id: 'c_ne2', x: 90, y: -70, type: 'regular', name: 'Weapon Calibration', desc: 'All damage +2%', stat: {allDmg:0.02}, connects: ['c_ne1','path_fth1','path_aug1'] },
    { id: 'c_e2', x: 110, y: 0, type: 'regular', name: 'Shield Amplifier', desc: 'Shield gains 10 max HP', stat: {shieldHP:10}, connects: ['c_e1','path_shield1','path_siph_e1'] },
    { id: 'c_se2', x: 90, y: 70, type: 'regular', name: 'Core Reinforcement', desc: 'Core gains 10 HP', stat: {coreHP:10}, connects: ['c_se1','path_siph_se1','path_decoy1'] },
    { id: 'c_s2', x: 0, y: 110, type: 'regular', name: 'Lethal Precision', desc: 'Crits deal 4% more', stat: {critDmg:0.04}, connects: ['c_s1','c_s3','path_gc1'] },
    { id: 'c_sw2', x: -90, y: 70, type: 'regular', name: 'Dense Barrier', desc: 'Shield absorbs 2% more', stat: {shieldAbsorb:0.02}, connects: ['c_sw1','path_sg_sw1','path_barrier1'] },
    { id: 'c_w2', x: -110, y: 0, type: 'regular', name: 'Hydraulic Upgrade', desc: '+3% move speed', stat: {moveSpd:0.03}, connects: ['c_w1','path_speed1','path_sg_w1'] },
    { id: 'c_nw2', x: -90, y: -70, type: 'regular', name: 'All HP Boost', desc: 'All HP pools +5', stat: {allHP:5}, connects: ['c_nw1','path_smg1','path_cpu1'] },

    // ============================================================
    // NORTH PATH — toward CRIT cluster
    // ============================================================
    { id: 'c_n3', x: 0, y: -170, type: 'regular', name: 'Combat Analysis', desc: 'Crit chance +2%', stat: {critChance:0.02}, connects: ['c_n2','c_n4'] },
    { id: 'c_n4', x: 0, y: -230, type: 'regular', name: 'All Damage Boost', desc: 'All damage +2%', stat: {allDmg:0.02}, connects: ['c_n3','path_crit1','path_jump_entry','path_gs_entry'] },

    // Crit entry connector
    { id: 'path_crit1', x: 40, y: -165, type: 'regular', name: 'Weak Point Scanner', desc: 'Crit damage +3%', stat: {critDmg:0.03}, connects: ['c_n2','c_n3','path_crit2'] },
    { id: 'path_crit2', x: 80, y: -220, type: 'regular', name: 'Precision Focus', desc: 'Crit chance +2%', stat: {critChance:0.02}, connects: ['path_crit1','crit1'] },

    // CRIT CLUSTER (5 nodes + notable)
    { id: 'crit1', x: 40, y: -290, type: 'regular', name: 'Targeting Scope', desc: 'All weapons crit 2% more', stat: {critChance:0.02}, connects: ['path_crit2','c_n4','crit2','crit3'] },
    { id: 'crit2', x: -30, y: -340, type: 'regular', name: 'Combat Analysis', desc: 'Crit chance +2%', stat: {critChance:0.02}, connects: ['crit1','crit4'] },
    { id: 'crit3', x: 100, y: -330, type: 'regular', name: 'Lethal Precision', desc: 'Crits deal 4% more', stat: {critDmg:0.04}, connects: ['crit1','crit4'] },
    { id: 'crit4', x: 30, y: -390, type: 'regular', name: 'Weak Point Scanner', desc: 'Crit damage +4%', stat: {critDmg:0.04}, connects: ['crit2','crit3','crit_notable'] },
    { id: 'crit_notable', x: 30, y: -450, type: 'notable', name: "Assassin's Eye", desc: 'Crit chance +3%, crit damage +6%', stat: {critChance:0.03,critDmg:0.06}, connects: ['crit4','ks_executioner_path1'] },

    // Path to EXECUTIONER keystone
    { id: 'ks_executioner_path1', x: 30, y: -510, type: 'regular', name: 'Lethal Force', desc: 'Crit damage +3%', stat: {critDmg:0.03}, connects: ['crit_notable','ks_executioner_path2'] },
    { id: 'ks_executioner_path2', x: 30, y: -565, type: 'regular', name: 'Kill Instinct', desc: 'Crit chance +2%', stat: {critChance:0.02}, connects: ['ks_executioner_path1','ks_executioner'] },
    { id: 'ks_executioner', x: 30, y: -630, type: 'keystone', name: 'Executioner', desc: 'Crit chance +8%. Crit damage +20%. Crits vs targets below 25% HP deal triple damage.', stat: {critChance:0.08,critDmg:0.20,executeTreshold:0.25}, connects: ['ks_executioner_path2'] },

    // ============================================================
    // NORTHWEST PATH — toward SMG cluster
    // ============================================================
    { id: 'path_smg1', x: -150, y: -120, type: 'regular', name: 'All Damage Boost', desc: 'All damage +2%', stat: {allDmg:0.02}, connects: ['c_nw2','path_smg2'] },
    { id: 'path_smg2', x: -210, y: -170, type: 'regular', name: 'Fire Rate Boost', desc: 'All fire rate +2%', stat: {fireRate:0.02}, connects: ['path_smg1','path_smg3','path_smg_speed_cross'] },
    { id: 'path_smg3', x: -270, y: -220, type: 'regular', name: 'Core HP Boost', desc: 'Core gains 10 HP', stat: {coreHP:10}, connects: ['path_smg2','smg_dmg1'] },

    // SMG RAW DAMAGE sub-cluster
    { id: 'smg_dmg1', x: -340, y: -270, type: 'regular', name: 'Barrel Boring', desc: 'SMG deals 3% more damage', stat: {smgDmg:0.03}, connects: ['path_smg3','smg_dmg2','smg_crit1'] },
    { id: 'smg_dmg2', x: -400, y: -310, type: 'regular', name: 'Heavy Rounds', desc: 'SMG deals 4% more damage', stat: {smgDmg:0.04}, connects: ['smg_dmg1','smg_dmg3'] },
    { id: 'smg_dmg3', x: -460, y: -280, type: 'regular', name: 'Tungsten Core', desc: 'SMG deals 6% more damage', stat: {smgDmg:0.06}, connects: ['smg_dmg2','smg_dmg_notable'] },
    { id: 'smg_dmg_notable', x: -520, y: -320, type: 'notable', name: 'Overcharged Rounds', desc: 'SMG +8% damage, +3% crit damage', stat: {smgDmg:0.08,smgCritDmg:0.03}, connects: ['smg_dmg3','ks_bullet_path1'] },

    // SMG FIRE RATE sub-cluster
    { id: 'smg_fr1', x: -350, y: -180, type: 'regular', name: 'Trigger Tuning', desc: 'SMG fires 3% faster', stat: {smgFR:0.03}, connects: ['path_smg3','smg_fr2'] },
    { id: 'smg_fr2', x: -420, y: -200, type: 'regular', name: 'Motorized Feed', desc: 'SMG fires 5% faster', stat: {smgFR:0.05}, connects: ['smg_fr1','smg_fr3'] },
    { id: 'smg_fr3', x: -480, y: -170, type: 'regular', name: 'Quick Magazine', desc: 'SMG fires 5% faster', stat: {smgFR:0.05}, connects: ['smg_fr2','smg_fr_notable'] },
    { id: 'smg_fr_notable', x: -540, y: -210, type: 'notable', name: 'Lead Storm', desc: 'SMG fire rate +6%', stat: {smgFR:0.06}, connects: ['smg_fr3','ks_bullet_path1'] },

    // SMG CRIT sub-cluster
    { id: 'smg_crit1', x: -380, y: -360, type: 'regular', name: 'Precision Barrel', desc: 'SMG crits 2% more', stat: {smgCrit:0.02}, connects: ['smg_dmg1','smg_crit2'] },
    { id: 'smg_crit2', x: -440, y: -400, type: 'regular', name: 'Vital Targeting', desc: 'SMG crit damage +4%', stat: {smgCritDmg:0.04}, connects: ['smg_crit1','smg_crit_notable'] },
    { id: 'smg_crit_notable', x: -510, y: -430, type: 'notable', name: 'Surgical Precision', desc: 'SMG crit +3%, crit damage +6%', stat: {smgCrit:0.03,smgCritDmg:0.06}, connects: ['smg_crit2','ks_bullet_path2'] },

    // SMG HEAT sub-cluster
    { id: 'smg_heat1', x: -500, y: -120, type: 'regular', name: 'Ventilated Barrel', desc: 'SMG generates 5% less heat', stat: {smgHeatBuild:-0.05}, connects: ['smg_fr3','smg_heat2'] },
    { id: 'smg_heat2', x: -560, y: -90, type: 'regular', name: 'Heat Sink', desc: 'SMG cools 8% faster', stat: {smgHeatCool:0.08}, connects: ['smg_heat1','smg_heat3'] },
    { id: 'smg_heat3', x: -620, y: -130, type: 'regular', name: 'Ceramic Lining', desc: 'SMG generates 8% less heat', stat: {smgHeatBuild:-0.08}, connects: ['smg_heat2','smg_heat_notable'] },
    { id: 'smg_heat_notable', x: -670, y: -170, type: 'notable', name: 'Thermal Mastery', desc: 'SMG heat -10%, cooling +10%', stat: {smgHeatBuild:-0.10,smgHeatCool:0.10}, connects: ['smg_heat3'] },

    // Path to BULLET HELL keystone
    { id: 'ks_bullet_path1', x: -590, y: -270, type: 'regular', name: 'SMG Damage Boost', desc: 'SMG damage +3%', stat: {smgDmg:0.03}, connects: ['smg_dmg_notable','smg_fr_notable','ks_bullet_path2'] },
    { id: 'ks_bullet_path2', x: -650, y: -340, type: 'regular', name: 'SMG Mastery', desc: 'SMG fire rate +3%', stat: {smgFR:0.03}, connects: ['ks_bullet_path1','smg_crit_notable','ks_bullet_hell'] },
    { id: 'ks_bullet_hell', x: -710, y: -400, type: 'keystone', name: 'Bullet Hell', desc: 'SMG damage +15%. SMG fires two rounds per shot.', stat: {smgDmg:0.15,smgDoubleShot:true}, connects: ['ks_bullet_path2'] },

    // ============================================================
    // NORTHEAST PATH — toward FLAMETHROWER cluster
    // ============================================================
    { id: 'path_fth1', x: 150, y: -120, type: 'regular', name: 'All Damage Boost', desc: 'All damage +2%', stat: {allDmg:0.02}, connects: ['c_ne2','path_fth2'] },
    { id: 'path_fth2', x: 210, y: -170, type: 'regular', name: 'Shield HP Boost', desc: 'Shield gains 8 HP', stat: {shieldHP:8}, connects: ['path_fth1','path_fth3','path_aug1'] },
    { id: 'path_fth3', x: 280, y: -220, type: 'regular', name: 'Crit Damage Boost', desc: 'Crit damage +3%', stat: {critDmg:0.03}, connects: ['path_fth2','fth_dmg1'] },

    // FTH RAW BURN DAMAGE sub-cluster
    { id: 'fth_dmg1', x: 350, y: -270, type: 'regular', name: 'Fuel Enrichment', desc: 'FTH deals 3% more damage', stat: {fthDmg:0.03}, connects: ['path_fth3','fth_dmg2','fth_dur1'] },
    { id: 'fth_dmg2', x: 420, y: -300, type: 'regular', name: 'Superheated Fuel', desc: 'FTH deals 5% more damage', stat: {fthDmg:0.05}, connects: ['fth_dmg1','fth_dmg_notable'] },
    { id: 'fth_dmg_notable', x: 490, y: -330, type: 'notable', name: 'Inferno Core', desc: 'FTH +8% damage, +3% burn damage', stat: {fthDmg:0.08,burnDmg:0.03}, connects: ['fth_dmg2','ks_hellfire_path1'] },

    // FTH BURN DURATION / SPREAD sub-cluster
    { id: 'fth_dur1', x: 380, y: -370, type: 'regular', name: 'Sticky Fuel', desc: 'Burns last 0.5s longer', stat: {burnDur:0.5}, connects: ['fth_dmg1','fth_dur2'] },
    { id: 'fth_dur2', x: 440, y: -410, type: 'regular', name: 'Napalm Mix', desc: 'Burns last 1s longer', stat: {burnDur:1.0}, connects: ['fth_dur1','fth_dur3'] },
    { id: 'fth_dur3', x: 500, y: -440, type: 'regular', name: 'Wildfire Agent', desc: 'Burn spreads to 1 nearby enemy', stat: {burnSpread:1}, connects: ['fth_dur2','fth_dur_notable'] },
    { id: 'fth_dur_notable', x: 560, y: -470, type: 'notable', name: 'Contagion Flame', desc: 'Burn +1.5s, spreads to 2 enemies', stat: {burnDur:1.5,burnSpread:2}, connects: ['fth_dur3','ks_hellfire_path2'] },

    // FTH RANGE / AREA sub-cluster
    { id: 'fth_range1', x: 460, y: -230, type: 'regular', name: 'Extended Nozzle', desc: 'FTH range +5%', stat: {fthRange:0.05}, connects: ['fth_dmg2','fth_range2'] },
    { id: 'fth_range2', x: 530, y: -260, type: 'regular', name: 'Wide Dispersal', desc: 'FTH cone width +8%', stat: {fthCone:0.08}, connects: ['fth_range1','fth_range_notable'] },
    { id: 'fth_range_notable', x: 590, y: -290, type: 'notable', name: 'Firestorm Projector', desc: 'FTH range +10%, cone +10%', stat: {fthRange:0.10,fthCone:0.10}, connects: ['fth_range2','ks_hellfire_path1'] },

    // FTH IGNITE / DOT sub-cluster
    { id: 'fth_ign1', x: 530, y: -380, type: 'regular', name: 'Volatile Mix', desc: 'Ignite chance +5%', stat: {igniteChance:0.05}, connects: ['fth_dur_notable','fth_ign2'] },
    { id: 'fth_ign2', x: 590, y: -410, type: 'regular', name: 'Accelerant', desc: 'Burn tick damage +3%', stat: {burnTickDmg:0.03}, connects: ['fth_ign1','fth_ign_notable'] },
    { id: 'fth_ign_notable', x: 650, y: -440, type: 'notable', name: 'Pyromaniac', desc: 'Ignite +8%, burn tick +5%', stat: {igniteChance:0.08,burnTickDmg:0.05}, connects: ['fth_ign2','ks_hellfire_path2'] },

    // FTH HEAT sub-cluster
    { id: 'fth_heat1', x: 520, y: -170, type: 'regular', name: 'Insulated Chamber', desc: 'FTH generates 5% less heat', stat: {fthHeatBuild:-0.05}, connects: ['fth_range1','fth_heat2'] },
    { id: 'fth_heat2', x: 580, y: -140, type: 'regular', name: 'Rapid Vent', desc: 'FTH cools 8% faster', stat: {fthHeatCool:0.08}, connects: ['fth_heat1','fth_heat_notable'] },
    { id: 'fth_heat_notable', x: 640, y: -180, type: 'notable', name: 'Flame Regulator', desc: 'FTH heat -8%, cooling +10%', stat: {fthHeatBuild:-0.08,fthHeatCool:0.10}, connects: ['fth_heat2'] },

    // Path to HELLFIRE keystone
    { id: 'ks_hellfire_path1', x: 650, y: -310, type: 'regular', name: 'FTH Damage Boost', desc: 'FTH damage +3%', stat: {fthDmg:0.03}, connects: ['fth_dmg_notable','fth_range_notable','ks_hellfire_path2'] },
    { id: 'ks_hellfire_path2', x: 710, y: -380, type: 'regular', name: 'FTH Mastery', desc: 'Burn damage +3%', stat: {burnDmg:0.03}, connects: ['ks_hellfire_path1','fth_dur_notable','fth_ign_notable','ks_hellfire'] },
    { id: 'ks_hellfire', x: 770, y: -440, type: 'keystone', name: 'Hellfire', desc: 'FTH +15%. Burns always ignite. Burning enemies explode on death for 30 AOE.', stat: {fthDmg:0.15,alwaysIgnite:true,burnExplode:30}, connects: ['ks_hellfire_path2'] },

    // ============================================================
    // SOUTHWEST PATH — toward SHOTGUN cluster
    // ============================================================
    { id: 'path_sg_sw1', x: -150, y: 120, type: 'regular', name: 'Crit Chance Boost', desc: 'Crit chance +1%', stat: {critChance:0.01}, connects: ['c_sw2','path_sg_sw2'] },
    { id: 'path_sg_sw2', x: -210, y: 170, type: 'regular', name: 'All HP Boost', desc: 'All HP +8', stat: {allHP:8}, connects: ['path_sg_sw1','path_sg_sw3','path_barrier_cross'] },
    { id: 'path_sg_sw3', x: -280, y: 220, type: 'regular', name: 'Damage Boost', desc: 'All damage +2%', stat: {allDmg:0.02}, connects: ['path_sg_sw2','sg_dmg1'] },

    // Also connect from west spoke
    { id: 'path_sg_w1', x: -170, y: 50, type: 'regular', name: 'Leg HP Boost', desc: 'Legs gain 8 HP', stat: {legHP:8}, connects: ['c_w2','path_sg_sw2','path_speed1'] },

    // SG RAW DAMAGE sub-cluster
    { id: 'sg_dmg1', x: -350, y: 270, type: 'regular', name: 'Reinforced Slugs', desc: 'SG deals 3% more damage', stat: {sgDmg:0.03}, connects: ['path_sg_sw3','sg_dmg2','sg_close1'] },
    { id: 'sg_dmg2', x: -410, y: 310, type: 'regular', name: 'Hardened Shot', desc: 'SG deals 4% more damage', stat: {sgDmg:0.04}, connects: ['sg_dmg1','sg_dmg3'] },
    { id: 'sg_dmg3', x: -470, y: 280, type: 'regular', name: 'Magnum Load', desc: 'SG deals 6% more damage', stat: {sgDmg:0.06}, connects: ['sg_dmg2','sg_dmg_notable'] },
    { id: 'sg_dmg_notable', x: -530, y: 320, type: 'notable', name: 'Frag Rounds', desc: 'SG +8% damage, +1 pellet', stat: {sgDmg:0.08,sgPellets:1}, connects: ['sg_dmg3','ks_decim_path1'] },

    // SG CLOSE RANGE sub-cluster
    { id: 'sg_close1', x: -380, y: 360, type: 'regular', name: 'Close Quarters', desc: 'SG +5% damage within 100 units', stat: {sgCloseDmg:0.05}, connects: ['sg_dmg1','sg_close2'] },
    { id: 'sg_close2', x: -440, y: 400, type: 'regular', name: 'Breach Specialist', desc: 'SG +8% damage within 100 units', stat: {sgCloseDmg:0.08}, connects: ['sg_close1','sg_close_notable'] },
    { id: 'sg_close_notable', x: -510, y: 430, type: 'notable', name: 'Pointblank Protocol', desc: 'SG +12% close range, +3% fire rate', stat: {sgCloseDmg:0.12,sgFR:0.03}, connects: ['sg_close2','ks_decim_path2'] },

    // SG SPREAD / PELLET sub-cluster
    { id: 'sg_pellet1', x: -490, y: 220, type: 'regular', name: 'Choke Barrel', desc: 'SG spread -5%', stat: {sgSpread:-0.05}, connects: ['sg_dmg3','sg_pellet2'] },
    { id: 'sg_pellet2', x: -550, y: 250, type: 'regular', name: 'Extended Magazine', desc: '+1 SG pellet', stat: {sgPellets:1}, connects: ['sg_pellet1','sg_pellet_notable'] },
    { id: 'sg_pellet_notable', x: -610, y: 290, type: 'notable', name: 'Wall of Lead', desc: '+2 pellets, -8% spread', stat: {sgPellets:2,sgSpread:-0.08}, connects: ['sg_pellet2','ks_decim_path1'] },

    // SG CRIT sub-cluster
    { id: 'sg_crit1', x: -440, y: 480, type: 'regular', name: 'Lucky Scatter', desc: 'SG crit chance +2%', stat: {sgCrit:0.02}, connects: ['sg_close_notable','sg_crit2'] },
    { id: 'sg_crit2', x: -500, y: 510, type: 'regular', name: 'Explosive Tips', desc: 'SG crit damage +4%', stat: {sgCritDmg:0.04}, connects: ['sg_crit1','sg_crit_notable'] },
    { id: 'sg_crit_notable', x: -560, y: 480, type: 'notable', name: 'Lethal Scatter', desc: 'SG crit +3%, crit damage +5%', stat: {sgCrit:0.03,sgCritDmg:0.05}, connects: ['sg_crit2','ks_decim_path2'] },

    // Path to DECIMATOR keystone
    { id: 'ks_decim_path1', x: -620, y: 350, type: 'regular', name: 'SG Damage Boost', desc: 'SG damage +3%', stat: {sgDmg:0.03}, connects: ['sg_dmg_notable','sg_pellet_notable','ks_decim_path2'] },
    { id: 'ks_decim_path2', x: -680, y: 420, type: 'regular', name: 'SG Mastery', desc: 'SG fire rate +3%', stat: {sgFR:0.03}, connects: ['ks_decim_path1','sg_close_notable','sg_crit_notable','ks_decimator'] },
    { id: 'ks_decimator', x: -740, y: 490, type: 'keystone', name: 'Decimator', desc: 'SG +15%. +3 pellets. Pellets hitting same target deal 5% more each.', stat: {sgDmg:0.15,sgPellets:3,sgPelletStack:0.05}, connects: ['ks_decim_path2'] },

    // ============================================================
    // SOUTHEAST PATH — toward SIPHON cluster
    // ============================================================
    { id: 'path_siph_se1', x: 150, y: 120, type: 'regular', name: 'Shield Regen Boost', desc: 'Shield regens 3% faster', stat: {shieldRegen:0.03}, connects: ['c_se2','path_siph_se2'] },
    { id: 'path_siph_se2', x: 210, y: 170, type: 'regular', name: 'Core HP Boost', desc: 'Core gains 10 HP', stat: {coreHP:10}, connects: ['path_siph_se1','path_siph_se3','path_decoy1'] },
    { id: 'path_siph_se3', x: 280, y: 220, type: 'regular', name: 'All Damage Boost', desc: 'All damage +2%', stat: {allDmg:0.02}, connects: ['path_siph_se2','siph_heal1'] },

    // Also connect from east spoke
    { id: 'path_siph_e1', x: 170, y: 50, type: 'regular', name: 'Shield HP Boost', desc: 'Shield gains 8 HP', stat: {shieldHP:8}, connects: ['c_e2','path_siph_se2','path_shield1'] },

    // SIPHON HEAL sub-cluster
    { id: 'siph_heal1', x: 350, y: 270, type: 'regular', name: 'Drain Amplifier', desc: 'Siphon heals 5% more', stat: {siphHeal:0.05}, connects: ['path_siph_se3','siph_heal2','siph_slow1'] },
    { id: 'siph_heal2', x: 420, y: 300, type: 'regular', name: 'Deep Drain', desc: 'Siphon heals 8% more', stat: {siphHeal:0.08}, connects: ['siph_heal1','siph_heal_notable'] },
    { id: 'siph_heal_notable', x: 490, y: 330, type: 'notable', name: 'Vampiric Core', desc: 'Siphon heal +12%, 2x vs targets below 30%', stat: {siphHeal:0.12,siphLowHPBonus:true}, connects: ['siph_heal2','ks_parasyte_path1'] },

    // SIPHON SLOW sub-cluster
    { id: 'siph_slow1', x: 380, y: 360, type: 'regular', name: 'Heavy Tether', desc: 'Siphon slows 3% more', stat: {siphSlow:0.03}, connects: ['siph_heal1','siph_slow2'] },
    { id: 'siph_slow2', x: 440, y: 400, type: 'regular', name: 'Paralyzing Drain', desc: 'Siphon slows 5% more', stat: {siphSlow:0.05}, connects: ['siph_slow1','siph_slow_notable'] },
    { id: 'siph_slow_notable', x: 510, y: 430, type: 'notable', name: 'Corroded Link', desc: 'Siphon slow +8%, targets take +5% damage', stat: {siphSlow:0.08,siphVulnerable:0.05}, connects: ['siph_slow2','ks_parasyte_path2'] },

    // SIPHON HEAT sub-cluster
    { id: 'siph_heat1', x: 500, y: 220, type: 'regular', name: 'Cooled Emitter', desc: 'Siphon generates 5% less heat', stat: {siphHeatBuild:-0.05}, connects: ['siph_heal2','siph_heat2'] },
    { id: 'siph_heat2', x: 560, y: 250, type: 'regular', name: 'Thermal Bleed', desc: 'Siphon cools 8% faster', stat: {siphHeatCool:0.08}, connects: ['siph_heat1','siph_heat_notable'] },
    { id: 'siph_heat_notable', x: 620, y: 290, type: 'notable', name: 'Perpetual Beam', desc: 'Siphon heat -8%, cooling +10%', stat: {siphHeatBuild:-0.08,siphHeatCool:0.10}, connects: ['siph_heat2'] },

    // SIPHON RANGE/WIDTH sub-cluster
    { id: 'siph_range1', x: 440, y: 480, type: 'regular', name: 'Extended Filament', desc: 'Siphon range +5%', stat: {siphRange:0.05}, connects: ['siph_slow_notable','siph_range2'] },
    { id: 'siph_range2', x: 500, y: 510, type: 'regular', name: 'Diffusion Lens', desc: 'Siphon beam width +10%', stat: {siphWidth:0.10}, connects: ['siph_range1','siph_range_notable'] },
    { id: 'siph_range_notable', x: 560, y: 480, type: 'notable', name: 'Engulfing Beam', desc: 'Siphon range +10%, width +15%', stat: {siphRange:0.10,siphWidth:0.15}, connects: ['siph_range2','ks_parasyte_path2'] },

    // Path to PARASYTE keystone
    { id: 'ks_parasyte_path1', x: 570, y: 370, type: 'regular', name: 'Siphon Boost', desc: 'Siphon heal +3%', stat: {siphHeal:0.03}, connects: ['siph_heal_notable','ks_parasyte_path2'] },
    { id: 'ks_parasyte_path2', x: 640, y: 430, type: 'regular', name: 'Siphon Mastery', desc: 'Siphon slow +3%', stat: {siphSlow:0.03}, connects: ['ks_parasyte_path1','siph_slow_notable','siph_range_notable','ks_parasyte'] },
    { id: 'ks_parasyte', x: 710, y: 490, type: 'keystone', name: 'Parasyte', desc: 'Siphon heal doubled. Beam chains to 1 nearby enemy. Siphon damage +10%.', stat: {siphHealMult:2,siphChain:1,siphDmg:0.10}, connects: ['ks_parasyte_path2'] },

    // ============================================================
    // WEST PATH — toward SPEED cluster
    // ============================================================
    { id: 'path_speed1', x: -220, y: 20, type: 'regular', name: 'Fire Rate Boost', desc: 'All fire rate +2%', stat: {fireRate:0.02}, connects: ['c_w2','path_sg_w1','path_speed2'] },
    { id: 'path_speed2', x: -300, y: 0, type: 'regular', name: 'Move Speed Boost', desc: 'Move speed +2%', stat: {moveSpd:0.02}, connects: ['path_speed1','path_speed3'] },
    { id: 'path_speed3', x: -380, y: -20, type: 'regular', name: 'Shield HP Boost', desc: 'Shield gains 8 HP', stat: {shieldHP:8}, connects: ['path_speed2','speed1'] },

    // Cross-connect to SMG path
    { id: 'path_smg_speed_cross', x: -280, y: -100, type: 'regular', name: 'Arm HP Boost', desc: 'Arms gain 8 HP', stat: {armHP:8}, connects: ['path_smg2','path_speed2'] },

    // SPEED CLUSTER
    { id: 'speed1', x: -450, y: 0, type: 'regular', name: 'Servo Boost', desc: 'Move speed +3%', stat: {moveSpd:0.03}, connects: ['path_speed3','speed2','speed3'] },
    { id: 'speed2', x: -510, y: -40, type: 'regular', name: 'Hydraulic Upgrade', desc: 'Move speed +3%', stat: {moveSpd:0.03}, connects: ['speed1','speed4'] },
    { id: 'speed3', x: -510, y: 40, type: 'regular', name: 'Quick Hands', desc: 'All fire rate +3%', stat: {fireRate:0.03}, connects: ['speed1','speed4'] },
    { id: 'speed4', x: -570, y: 0, type: 'regular', name: 'Streamlined Action', desc: 'All fire rate +4%', stat: {fireRate:0.04}, connects: ['speed2','speed3','speed_notable'] },
    { id: 'speed_notable', x: -640, y: 0, type: 'notable', name: 'Lightning Reflexes', desc: 'Move speed +5%, fire rate +5%', stat: {moveSpd:0.05,fireRate:0.05}, connects: ['speed4','ks_phantom_path1'] },

    // Path to PHANTOM keystone
    { id: 'ks_phantom_path1', x: -710, y: -30, type: 'regular', name: 'Dodge Boost', desc: 'Dodge +2%', stat: {dodge:0.02}, connects: ['speed_notable','ks_phantom_path2'] },
    { id: 'ks_phantom_path2', x: -770, y: 0, type: 'regular', name: 'Evasion Protocol', desc: 'Dodge +2%', stat: {dodge:0.02}, connects: ['ks_phantom_path1','ks_phantom'] },
    { id: 'ks_phantom', x: -840, y: 0, type: 'keystone', name: 'Phantom', desc: 'Dodge +12%. Move speed +8%.', stat: {dodge:0.12,moveSpd:0.08}, connects: ['ks_phantom_path2'] },

    // ============================================================
    // EAST PATH — toward SHIELD cluster
    // ============================================================
    { id: 'path_shield1', x: 220, y: -20, type: 'regular', name: 'Shield Regen Boost', desc: 'Shield regens 3% faster', stat: {shieldRegen:0.03}, connects: ['c_e2','path_siph_e1','path_shield2'] },
    { id: 'path_shield2', x: 300, y: 0, type: 'regular', name: 'Core HP Boost', desc: 'Core gains 8 HP', stat: {coreHP:8}, connects: ['path_shield1','path_shield3'] },
    { id: 'path_shield3', x: 380, y: 20, type: 'regular', name: 'DR Boost', desc: 'Take 1% less damage', stat: {dr:0.01}, connects: ['path_shield2','shield_hp1'] },

    // SHIELD HP/ABSORB cluster
    { id: 'shield_hp1', x: 450, y: 0, type: 'regular', name: 'Shield Capacitor', desc: 'Shield gains 8 HP', stat: {shieldHP:8}, connects: ['path_shield3','shield_hp2','shield_regen1'] },
    { id: 'shield_hp2', x: 510, y: -40, type: 'regular', name: 'Shield Matrix', desc: 'Shield gains 12 HP', stat: {shieldHP:12}, connects: ['shield_hp1','shield_hp3'] },
    { id: 'shield_hp3', x: 570, y: -20, type: 'regular', name: 'Dense Barrier', desc: 'Shield absorb +2%', stat: {shieldAbsorb:0.02}, connects: ['shield_hp2','shield_hp_notable'] },
    { id: 'shield_hp_notable', x: 640, y: -50, type: 'notable', name: 'Fortified Barrier', desc: 'Shield +15 HP, absorb +3%', stat: {shieldHP:15,shieldAbsorb:0.03}, connects: ['shield_hp3'] },

    // SHIELD REGEN cluster
    { id: 'shield_regen1', x: 460, y: 60, type: 'regular', name: 'Quick Recharge', desc: 'Shield regens 5% faster', stat: {shieldRegen:0.05}, connects: ['shield_hp1','shield_regen2'] },
    { id: 'shield_regen2', x: 520, y: 90, type: 'regular', name: 'Rapid Response', desc: 'Shield regen delay -0.3s', stat: {shieldDelay:-0.3}, connects: ['shield_regen1','shield_regen3'] },
    { id: 'shield_regen3', x: 580, y: 60, type: 'regular', name: 'Overclocked Cap', desc: 'Shield regens 8% faster', stat: {shieldRegen:0.08}, connects: ['shield_regen2','shield_regen_notable'] },
    { id: 'shield_regen_notable', x: 650, y: 40, type: 'notable', name: 'Instant Recovery', desc: 'Shield regen +10%, delay -0.5s', stat: {shieldRegen:0.10,shieldDelay:-0.5}, connects: ['shield_regen3'] },

    // ============================================================
    // INNER UPPER-LEFT — CPU GENERAL cluster
    // ============================================================
    { id: 'path_cpu1', x: -140, y: -140, type: 'regular', name: 'Mod CD Boost', desc: 'Mod cooldown -2%', stat: {modCD:-0.02}, connects: ['c_nw2','path_cpu2'] },
    { id: 'path_cpu2', x: -200, y: -200, type: 'regular', name: 'All HP Boost', desc: 'All HP +5', stat: {allHP:5}, connects: ['path_cpu1','cpu1'] },
    { id: 'cpu1', x: -250, y: -260, type: 'regular', name: 'Processor Boost', desc: 'All mod CD -3%', stat: {modCD:-0.03}, connects: ['path_cpu2','cpu2'] },
    { id: 'cpu2', x: -300, y: -310, type: 'regular', name: 'Overclocked CPU', desc: 'All mod CD -5%', stat: {modCD:-0.05}, connects: ['cpu1','cpu_notable'] },
    { id: 'cpu_notable', x: -340, y: -370, type: 'notable', name: 'Neural Accelerator', desc: 'All mod CD -8%', stat: {modCD:-0.08}, connects: ['cpu2','ks_overclock_path1'] },

    // Path to OVERCLOCK keystone
    { id: 'ks_overclock_path1', x: -390, y: -430, type: 'regular', name: 'System Efficiency', desc: 'Mod CD -3%', stat: {modCD:-0.03}, connects: ['cpu_notable','ks_overclock'] },
    { id: 'ks_overclock', x: -430, y: -500, type: 'keystone', name: 'Overclock', desc: 'All mod CD -15%. Mod effects last 30% longer. Mods grant +5% damage for 3s.', stat: {modCD:-0.15,modDuration:0.30,modDmgBuff:0.05}, connects: ['ks_overclock_path1'] },

    // ============================================================
    // INNER UPPER-RIGHT — AUGMENT cluster
    // ============================================================
    { id: 'path_aug1', x: 140, y: -140, type: 'regular', name: 'Augment Boost', desc: 'Augment effect +3%', stat: {augEffect:0.03}, connects: ['c_ne2','path_fth2','path_aug2'] },
    { id: 'path_aug2', x: 200, y: -200, type: 'regular', name: 'Shield HP Boost', desc: 'Shield gains 8 HP', stat: {shieldHP:8}, connects: ['path_aug1','aug1'] },
    { id: 'aug1', x: 250, y: -260, type: 'regular', name: 'Augment Amplifier', desc: 'Augment effect +5%', stat: {augEffect:0.05}, connects: ['path_aug2','aug2'] },
    { id: 'aug2', x: 300, y: -300, type: 'regular', name: 'Augment Overcharge', desc: 'Augment effect +8%', stat: {augEffect:0.08}, connects: ['aug1','aug3'] },
    { id: 'aug3', x: 340, y: -340, type: 'regular', name: 'Synced Systems', desc: '+3% damage while augment active', stat: {augDmg:0.03}, connects: ['aug2','aug_notable'] },
    { id: 'aug_notable', x: 380, y: -390, type: 'notable', name: 'Full Integration', desc: 'Augment +12%, +5% damage', stat: {augEffect:0.12,augDmg:0.05}, connects: ['aug3'] },

    // ============================================================
    // INNER SOUTH — GLASS CANNON keystone path
    // ============================================================
    { id: 'path_gc1', x: 0, y: 170, type: 'regular', name: 'All Damage Boost', desc: 'All damage +3%', stat: {allDmg:0.03}, connects: ['c_s2','path_gc2'] },
    { id: 'path_gc2', x: 0, y: 230, type: 'regular', name: 'Weapon Mastery', desc: 'All damage +3%', stat: {allDmg:0.03}, connects: ['path_gc1','path_gc3'] },
    { id: 'path_gc3', x: 0, y: 290, type: 'regular', name: 'Lethal Force', desc: 'All damage +3%', stat: {allDmg:0.03}, connects: ['path_gc2','ks_glass_cannon'] },
    { id: 'ks_glass_cannon', x: 0, y: 360, type: 'keystone', name: 'Glass Cannon', desc: 'All weapon damage +25%.', stat: {allDmg:0.25}, connects: ['path_gc3'] },

    // ============================================================
    // UPPER-NORTH-WEST — JUMP cluster
    // ============================================================
    { id: 'path_jump_entry', x: -60, y: -290, type: 'regular', name: 'Leg HP Boost', desc: 'Legs gain 10 HP', stat: {legHP:10}, connects: ['c_n4','path_jump1'] },
    { id: 'path_jump1', x: -120, y: -350, type: 'regular', name: 'Shield HP Boost', desc: 'Shield gains 8 HP', stat: {shieldHP:8}, connects: ['path_jump_entry','path_jump2'] },
    { id: 'path_jump2', x: -180, y: -410, type: 'regular', name: 'Move Speed Boost', desc: 'Move speed +2%', stat: {moveSpd:0.02}, connects: ['path_jump1','jump1'] },
    { id: 'jump1', x: -230, y: -470, type: 'regular', name: 'Thrust Upgrade', desc: 'Jump height +10%', stat: {jumpHeight:0.10}, connects: ['path_jump2','jump2'] },
    { id: 'jump2', x: -280, y: -520, type: 'regular', name: 'Quick Ignition', desc: 'Jump CD -5%', stat: {jumpCD:-0.05}, connects: ['jump1','jump3'] },
    { id: 'jump3', x: -320, y: -570, type: 'regular', name: 'Impact Absorbers', desc: '+3% DR for 2s after landing', stat: {jumpLandDR:0.03}, connects: ['jump2','jump_notable'] },
    { id: 'jump_notable', x: -360, y: -630, type: 'notable', name: 'Meteor Drop', desc: 'Jump +15%, CD -8%, landing 20 AOE', stat: {jumpHeight:0.15,jumpCD:-0.08,jumpAOE:20}, connects: ['jump3','ks_meteor_path1'] },
    { id: 'ks_meteor_path1', x: -400, y: -690, type: 'regular', name: 'Aerial Mastery', desc: 'Jump height +5%', stat: {jumpHeight:0.05}, connects: ['jump_notable','ks_meteor'] },
    { id: 'ks_meteor', x: -440, y: -750, type: 'keystone', name: 'Meteor Strike', desc: 'Jump +25%. Landing = 50 AOE. 2s invuln during jump.', stat: {jumpHeight:0.25,jumpAOE:50,jumpInvuln:2}, connects: ['ks_meteor_path1'] },

    // ============================================================
    // UPPER-NORTH-EAST — GHOST STEP cluster
    // ============================================================
    { id: 'path_gs_entry', x: 60, y: -290, type: 'regular', name: 'Dodge Boost', desc: 'Dodge +1%', stat: {dodge:0.01}, connects: ['c_n4','path_gs1'] },
    { id: 'path_gs1', x: 120, y: -350, type: 'regular', name: 'Move Speed Boost', desc: 'Move speed +2%', stat: {moveSpd:0.02}, connects: ['path_gs_entry','path_gs2'] },
    { id: 'path_gs2', x: 180, y: -410, type: 'regular', name: 'Core HP Boost', desc: 'Core gains 8 HP', stat: {coreHP:8}, connects: ['path_gs1','gs1'] },
    { id: 'gs1', x: 230, y: -470, type: 'regular', name: 'Extended Phase', desc: 'Ghost Step invis +0.3s', stat: {gsInvis:0.3}, connects: ['path_gs2','gs2'] },
    { id: 'gs2', x: 280, y: -520, type: 'regular', name: 'Quick Phase', desc: 'Ghost Step CD -5%', stat: {gsCD:-0.05}, connects: ['gs1','gs_notable'] },
    { id: 'gs_notable', x: 320, y: -580, type: 'notable', name: 'Ambush Protocol', desc: 'Invis +0.5s, first attack after +25% damage', stat: {gsInvis:0.5,gsAmbush:0.25}, connects: ['gs2','ks_ghost_path1'] },
    { id: 'ks_ghost_path1', x: 360, y: -640, type: 'regular', name: 'Shadow Mastery', desc: 'Ghost Step CD -3%', stat: {gsCD:-0.03}, connects: ['gs_notable','ks_ghost'] },
    { id: 'ks_ghost', x: 400, y: -700, type: 'keystone', name: 'Ghost Protocol', desc: '2s full invis. First attack = 3x damage. +5% speed during invis.', stat: {gsInvis:2,gsFirstStrike:3,gsSpeed:0.05}, connects: ['ks_ghost_path1'] },

    // ============================================================
    // LOWER-SOUTH-WEST — BARRIER cluster
    // ============================================================
    { id: 'path_barrier1', x: -150, y: 170, type: 'regular', name: 'DR Boost', desc: 'Take 1% less damage', stat: {dr:0.01}, connects: ['c_sw2','path_barrier2'] },
    { id: 'path_barrier_cross', x: -250, y: 130, type: 'regular', name: 'Shield HP Boost', desc: 'Shield gains 8 HP', stat: {shieldHP:8}, connects: ['path_sg_sw2','path_barrier2'] },
    { id: 'path_barrier2', x: -200, y: 250, type: 'regular', name: 'All HP Boost', desc: 'All HP +8', stat: {allHP:8}, connects: ['path_barrier1','path_barrier_cross','path_barrier3'] },
    { id: 'path_barrier3', x: -250, y: 330, type: 'regular', name: 'Mod CD Boost', desc: 'Mod CD -2%', stat: {modCD:-0.02}, connects: ['path_barrier2','barrier1'] },
    { id: 'barrier1', x: -300, y: 400, type: 'regular', name: 'Extended Field', desc: 'Barrier +1.5s duration', stat: {barrierDur:1.5}, connects: ['path_barrier3','barrier2'] },
    { id: 'barrier2', x: -350, y: 460, type: 'regular', name: 'Quick Deploy', desc: 'Barrier CD -5%', stat: {barrierCD:-0.05}, connects: ['barrier1','barrier_notable'] },
    { id: 'barrier_notable', x: -400, y: 520, type: 'notable', name: 'Fortress Protocol', desc: 'Barrier +2s, CD -8%', stat: {barrierDur:2,barrierCD:-0.08}, connects: ['barrier2','ks_stasis_path1'] },
    { id: 'ks_stasis_path1', x: -440, y: 590, type: 'regular', name: 'Barrier Mastery', desc: 'Barrier +1s', stat: {barrierDur:1}, connects: ['barrier_notable','ks_stasis'] },
    { id: 'ks_stasis', x: -480, y: 660, type: 'keystone', name: 'Stasis Field', desc: 'Barrier +3s. Activating slows enemies 150 units by 40%.', stat: {barrierDur:3,barrierSlow:0.40,barrierSlowRange:150}, connects: ['ks_stasis_path1'] },

    // ============================================================
    // LOWER-SOUTH-EAST — DECOY cluster
    // ============================================================
    { id: 'path_decoy1', x: 150, y: 170, type: 'regular', name: 'All HP Boost', desc: 'All HP +5', stat: {allHP:5}, connects: ['c_se2','path_siph_se2','path_decoy2'] },
    { id: 'path_decoy2', x: 200, y: 250, type: 'regular', name: 'Mod CD Boost', desc: 'Mod CD -2%', stat: {modCD:-0.02}, connects: ['path_decoy1','path_decoy3'] },
    { id: 'path_decoy3', x: 250, y: 330, type: 'regular', name: 'Crit Damage Boost', desc: 'Crit damage +2%', stat: {critDmg:0.02}, connects: ['path_decoy2','decoy1'] },
    { id: 'decoy1', x: 300, y: 400, type: 'regular', name: 'Persistent Hologram', desc: 'Decoy +2s duration', stat: {decoyDur:2}, connects: ['path_decoy3','decoy2'] },
    { id: 'decoy2', x: 350, y: 460, type: 'regular', name: 'Booby Trap', desc: 'Decoy explodes for 30 damage', stat: {decoyExplode:30}, connects: ['decoy1','decoy_notable'] },
    { id: 'decoy_notable', x: 400, y: 520, type: 'notable', name: 'Master Illusionist', desc: 'Decoy +3s, aggro range +30%', stat: {decoyDur:3,decoyAggro:0.30}, connects: ['decoy2','ks_doppel_path1'] },
    { id: 'ks_doppel_path1', x: 440, y: 590, type: 'regular', name: 'Decoy Mastery', desc: 'Decoy +1s', stat: {decoyDur:1}, connects: ['decoy_notable','ks_doppel'] },
    { id: 'ks_doppel', x: 480, y: 660, type: 'keystone', name: 'Doppelganger', desc: 'Decoy fires your weapon at 50% damage. +4s duration. 100% aggro.', stat: {decoyFire:0.50,decoyDur:4,decoyAggro:1.0}, connects: ['ks_doppel_path1'] },

    // ============================================================
    // SOUTH — SURVIVABILITY cluster
    // ============================================================
    { id: 'c_s3', x: -50, y: 170, type: 'regular', name: 'Core HP Boost', desc: 'Core gains 8 HP', stat: {coreHP:8}, connects: ['c_s2','path_barrier1','surv_path1'] },
    { id: 'surv_path1', x: -30, y: 250, type: 'regular', name: 'All HP Boost', desc: 'All HP +5', stat: {allHP:5}, connects: ['c_s3','surv_path2'] },
    { id: 'surv_path2', x: 30, y: 320, type: 'regular', name: 'DR Boost', desc: 'Take 1% less damage', stat: {dr:0.01}, connects: ['surv_path1','surv1'] },
    { id: 'surv1', x: -40, y: 400, type: 'regular', name: 'Hull Plating', desc: 'Core gains 10 HP', stat: {coreHP:10}, connects: ['surv_path2','surv2'] },
    { id: 'surv2', x: 40, y: 440, type: 'regular', name: 'Arm Reinforcement', desc: 'Arms gain 8 HP', stat: {armHP:8}, connects: ['surv1','surv3'] },
    { id: 'surv3', x: -30, y: 490, type: 'regular', name: 'Leg Reinforcement', desc: 'Legs gain 10 HP', stat: {legHP:10}, connects: ['surv2','surv4'] },
    { id: 'surv4', x: 30, y: 540, type: 'regular', name: 'Hardened Alloy', desc: 'Take 1% less damage', stat: {dr:0.01}, connects: ['surv3','surv_notable'] },
    { id: 'surv_notable', x: 0, y: 600, type: 'notable', name: 'Structural Integrity', desc: 'All HP +15, DR +2%', stat: {allHP:15,dr:0.02}, connects: ['surv4'] },

    // ============================================================
    // CROSS-CONNECTIONS — linking branches together
    // ============================================================
    // SMG region <-> Jump region
    { id: 'cross_smg_jump', x: -400, y: -500, type: 'regular', name: 'All HP Boost', desc: 'All HP +5', stat: {allHP:5}, connects: ['smg_crit_notable','jump_notable'] },

    // FTH region <-> Ghost Step region
    { id: 'cross_fth_gs', x: 450, y: -520, type: 'regular', name: 'Fire Rate Boost', desc: 'Fire rate +2%', stat: {fireRate:0.02}, connects: ['fth_dur_notable','gs_notable'] },

    // SMG region <-> Speed region
    { id: 'cross_smg_speed', x: -600, y: -60, type: 'regular', name: 'Move Speed Boost', desc: 'Move speed +2%', stat: {moveSpd:0.02}, connects: ['smg_heat_notable','speed_notable'] },

    // FTH region <-> Shield region
    { id: 'cross_fth_shield', x: 620, y: -80, type: 'regular', name: 'Shield HP Boost', desc: 'Shield gains 10 HP', stat: {shieldHP:10}, connects: ['fth_heat_notable','shield_hp_notable'] },

    // SG region <-> Barrier region
    { id: 'cross_sg_barrier', x: -450, y: 500, type: 'regular', name: 'DR Boost', desc: 'Take 1% less damage', stat: {dr:0.01}, connects: ['sg_crit_notable','barrier_notable'] },

    // Siphon region <-> Decoy region
    { id: 'cross_siph_decoy', x: 450, y: 500, type: 'regular', name: 'Crit Chance Boost', desc: 'Crit chance +1%', stat: {critChance:0.01}, connects: ['siph_range_notable','decoy_notable'] },

    // Speed region <-> SG region
    { id: 'cross_speed_sg', x: -500, y: 130, type: 'regular', name: 'Leg HP Boost', desc: 'Legs gain 8 HP', stat: {legHP:8}, connects: ['speed1','sg_pellet1'] },

    // Shield region <-> Siphon region
    { id: 'cross_shield_siph', x: 500, y: 130, type: 'regular', name: 'Core HP Boost', desc: 'Core gains 8 HP', stat: {coreHP:8}, connects: ['shield_regen3','siph_heat1'] },

    // Crit <-> Jump path
    { id: 'cross_crit_jump', x: -150, y: -480, type: 'regular', name: 'Crit Damage Boost', desc: 'Crit damage +2%', stat: {critDmg:0.02}, connects: ['ks_executioner_path1','jump2'] },

    // Crit <-> Ghost Step path
    { id: 'cross_crit_gs', x: 150, y: -480, type: 'regular', name: 'Dodge Boost', desc: 'Dodge +1%', stat: {dodge:0.01}, connects: ['ks_executioner_path1','gs1'] },

    // Glass Cannon <-> Survivability connection
    { id: 'cross_gc_surv', x: -40, y: 460, type: 'regular', name: 'All Damage Boost', desc: 'All damage +2%', stat: {allDmg:0.02}, connects: ['ks_glass_cannon','surv2'] },

    // Barrier <-> Survivability
    { id: 'cross_barrier_surv', x: -200, y: 550, type: 'regular', name: 'Shield HP Boost', desc: 'Shield gains 8 HP', stat: {shieldHP:8}, connects: ['barrier_notable','surv_notable'] },

    // Decoy <-> Survivability
    { id: 'cross_decoy_surv', x: 200, y: 550, type: 'regular', name: 'All HP Boost', desc: 'All HP +5', stat: {allHP:5}, connects: ['decoy_notable','surv_notable'] },

  ]
};
