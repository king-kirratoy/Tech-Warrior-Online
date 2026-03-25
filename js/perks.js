// ═══════════ PERKS DATA ═══════════

const _perks = {
    // ── UNIVERSAL OFFENSE ──────────────────────────────────────────────
    heavy_rounds:    { cat:'universal', label:'Heavy Rounds',       desc:'+20% weapon damage (stackable)',     apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.20; } },
    rapid_reload:    { cat:'universal', label:'Rapid Reload',       desc:'-20% reload times (stackable)',      apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.80; } },
    critical_hit:    { cat:'universal', label:'Critical Hit',       desc:'15% chance any bullet deals 2× dmg (+5% per stack)',  apply: () => { _perkState.critChance=(_perkState.critChance||0)+0.15; } },
    blast_radius:    { cat:'universal', label:'Blast Radius',       desc:'GL/RL explosion radius +25% (stackable)',  apply: () => { _perkState.blastMult=(_perkState.blastMult||1)*1.25; } },
    adrenaline:      { cat:'universal', label:'Adrenaline',         desc:'Kills restore 5% core HP (+5% per stack)', apply: () => { _perkState.adrenalineStacks=(_perkState.adrenalineStacks||0)+1; } },
    hollow_point:    { cat:'universal', label:'Hollow Point',       desc:'+15% damage to enemies below 50% HP (stackable)', apply: () => { _perkState.hollowPoint=(_perkState.hollowPoint||0)+0.15; } },
    incendiary:      { cat:'universal', label:'Incendiary Rounds',  desc:'20% chance to ignite on hit (5 dmg/tick, 2s)',     apply: () => { _perkState.incendiary=(_perkState.incendiary||0)+0.20; } },
    chain_reaction:  { cat:'universal', label:'Chain Reaction',     desc:'Kills have 30% chance to trigger a small blast',   apply: () => { _perkState.chainReaction=(_perkState.chainReaction||0)+0.30; } },
    overcharge_rounds:{ cat:'universal',label:'Overcharge Rounds',  desc:'Every 5th bullet deals 3× damage',                apply: () => { _perkState.overchargeRounds=(_perkState.overchargeRounds||0)+1; } },
    // ── UNIVERSAL SURVIVABILITY ────────────────────────────────────────
    thick_plating:   { cat:'universal', label:'Thick Plating',      desc:'+15% all part max HP (stackable)',    apply: () => { Object.values(player.comp).forEach(c=>{c.max=Math.round(c.max*1.15);c.hp=Math.min(c.hp+Math.round(c.max*0.15),c.max);}); } },
    extended_shield: { cat:'universal', label:'Extended Shield',    desc:'+30% max shield (stackable)',          apply: () => { player.maxShield=Math.round(player.maxShield*1.30); player.shield=player.maxShield; } },
    shield_regen:    { cat:'universal', label:'Shield Regen',       desc:'Shield regens 2× faster (stackable)', apply: () => { _perkState.shieldRegenMult=(_perkState.shieldRegenMult||1)*2; } },
    auto_repair:     { cat:'universal', label:'Auto-Repair',        desc:'Core regenerates +1 HP/sec (stackable)', apply: () => { _perkState.autoRepair=(_perkState.autoRepair||0)+1; } },
    last_stand:      { cat:'universal', label:'Last Stand',         desc:'Below 20% core HP: take 40% less damage', apply: () => { _perkState.lastStand=true; } },
    reinforced_core: { cat:'universal', label:'Reinforced Core',    desc:'+20% core max HP (stackable)', apply: () => { player.comp.core.max=Math.round(player.comp.core.max*1.20); player.comp.core.hp=Math.min(player.comp.core.hp+Math.round(player.comp.core.max*0.20),player.comp.core.max); } },
    scrap_shield:    { cat:'universal', label:'Scrap Shield',       desc:'On limb destruction: absorb next 40 damage to core', apply: () => { _perkState.scrapShield=(_perkState.scrapShield||0)+40; } },
    // ── UNIVERSAL UTILITY ──────────────────────────────────────────────
    overclock:       { cat:'universal', label:'Overclock',          desc:'+15% move speed (stackable)',          apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.15; } },
    salvager:        { cat:'universal', label:'Salvager',           desc:'Loot drop rate +25% (stackable)',      apply: () => { _perkState.lootMult=(_perkState.lootMult||1)*1.25; } },
    ammo_cache:      { cat:'universal', label:'Ammo Cache',         desc:'Start each round with Ammo buff',      apply: () => { _perkState.ammoCache=true; } },
    emp_resistance:  { cat:'universal', label:'EMP Resistance',     desc:'Enemy EMP stun −50% (stackable)',      apply: () => { _perkState.empResist=(_perkState.empResist||0)+0.50; } },
    scavenger:       { cat:'universal', label:'Scavenger',          desc:'Kill loot chance +10% (stackable)',    apply: () => { _perkState.lootMult=(_perkState.lootMult||1)*1.10; } },
    salvage_protocol:{ cat:'universal', label:'Salvage Protocol',   desc:'Destroying an enemy limb guarantees a loot drop', apply: () => { _perkState.salvageProtocol=true; } },
    threat_scanner:  { cat:'universal', label:'Threat Scanner',     desc:'Enemies within 300px take +10% damage from you (stackable)', apply: () => { _perkState.threatScanner=(_perkState.threatScanner||0)+0.10; } },
    kill_streak:     { cat:'universal', label:'Kill Streak',        desc:'3 kills without taking damage: +25% damage for the rest of the round', apply: () => { _perkState.killStreak=(_perkState.killStreak||0)+1; } },
    opportunist:     { cat:'universal', label:'Opportunist',        desc:'+20% damage to stunned or slowed enemies (stackable)', apply: () => { _perkState.opportunist=(_perkState.opportunist||0)+0.20; } },
    // ── UNIVERSAL TRADEOFFS ─────────────────────────────────────────────
    glass_cannon:    { cat:'universal', once:true, label:'Glass Cannon',   desc:'+40% weapon damage, −20% all part HP', apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.40; Object.values(player.comp).forEach(c=>{c.max=Math.round(c.max*0.80);c.hp=Math.min(c.hp,c.max);}); } },
    berserker:       { cat:'universal', once:true, label:'Berserker',      desc:'+30% damage, shield never regens',     apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.30; _perkState.noShieldRegen=true; } },
    stripped_armor:  { cat:'universal', once:true, label:'Stripped Armor', desc:'+25% speed, −25% all part HP',         apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.25; Object.values(player.comp).forEach(c=>{c.max=Math.round(c.max*0.75);c.hp=Math.min(c.hp,c.max);}); } },
    overclock_ii:    { cat:'universal', once:true, label:'Overclock II',   desc:'+30% speed, JUMP mod disabled',        apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.30; _perkState.jumpDisabled=true; } },
    war_machine:     { cat:'universal', once:true, label:'War Machine',    desc:'+35% damage; shield never regens; auto-repair disabled', apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.35; _perkState.noShieldRegen=true; _perkState.autoRepair=0; } },
    scorched_earth:  { cat:'universal', once:true, label:'Scorched Earth', desc:'+50% explosion damage; loot orbs destroyed at round start', apply: () => { _perkState.blastMult=(_perkState.blastMult||1)*1.50; _perkState.scorchedEarth=true; } },
    // ── LIGHT CHASSIS ──────────────────────────────────────────────────
    phantom:         { cat:'light', label:'Phantom',       desc:'15% bullet dodge chance (+5% per stack)', apply: () => { _perkState.dodgeChance=(_perkState.dodgeChance||0)+0.15; } },
    hit_and_run:     { cat:'light', label:'Hit and Run',   desc:'Kills grant +25% speed for 3s (stackable)',  apply: () => { _perkState.hitRunStacks=(_perkState.hitRunStacks||0)+1; } },
    ghost_step:      { cat:'light', label:'Ghost Step',    desc:'JUMP cooldown −40% per stack',             apply: () => { _perkState.jumpCdMult=(_perkState.jumpCdMult||1)*0.60; } },
    flicker:         { cat:'light', label:'Flicker',       desc:'Taking damage: 0.3s invincibility (4s cd)', apply: () => { _perkState.flicker=true; } },
    predator:        { cat:'light', label:'Predator',      desc:'Kills charge next shot for +50% dmg (stackable)', apply: () => { _perkState.predatorStacks=(_perkState.predatorStacks||0)+1; } },
    hair_trigger:    { cat:'light', label:'Hair Trigger',  desc:'−15% reload time (stackable)',              apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.85; } },
    glass_step:      { cat:'light', label:'Glass Step',    desc:'First hit each round is always dodged',     apply: () => { _perkState.glassStep=true; } },
    afterimage:      { cat:'light', label:'Afterimage',    desc:'JUMP leaves a decoy at launch point that briefly draws fire', apply: () => { _perkState.afterimage=true; } },
    // ── MEDIUM CHASSIS ─────────────────────────────────────────────────
    balanced_load:   { cat:'medium', label:'Balanced Load', desc:'Both weapons reload 15% faster (stackable)', apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.85; } },
    suppressor:      { cat:'medium', label:'Suppressor',    desc:'Hits slow enemies 5% (stacks up to 3×)',   apply: () => { _perkState.suppressStacks=(_perkState.suppressStacks||0)+1; } },
    battle_rhythm:   { cat:'medium', label:'Battle Rhythm', desc:'Every 5 kills this round: +10% damage',    apply: () => { _perkState.battleRhythm=(_perkState.battleRhythm||0)+1; } },
    resilience:      { cat:'medium', label:'Resilience',    desc:'Destroyed arms restored at 50% HP each round', apply: () => { _perkState.resilience=true; } },
    adaptive_armor:  { cat:'medium', label:'Adaptive Armor',desc:'After taking damage: 10% resist for 4s',   apply: () => { _perkState.adaptiveArmor=(_perkState.adaptiveArmor||0)+1; } },
    resonance:       { cat:'medium', label:'Resonance',     desc:'Dealing damage charges shield +2 per hit',  apply: () => { _perkState.resonance=(_perkState.resonance||0)+2; } },
    pressure_system: { cat:'medium', label:'Pressure System',desc:'Each consecutive hit on same enemy: +5% damage (max 5 stacks)', apply: () => { _perkState.pressureSystem=(_perkState.pressureSystem||0)+1; } },
    // ── HEAVY CHASSIS ──────────────────────────────────────────────────
    fortress:        { cat:'heavy', label:'Fortress',      desc:'Take 15% less damage (stackable)',          apply: () => { _perkState.fortress=(_perkState.fortress||0)+0.15; } },
    immovable:       { cat:'heavy', label:'Immovable',     desc:'While still: shield regens 3× faster',      apply: () => { _perkState.immovable=true; } },
    siege_mode:      { cat:'heavy', label:'Siege Mode',    desc:'Moving slowly: +20% weapon damage (stackable)', apply: () => { _perkState.siegeMode=(_perkState.siegeMode||0)+0.20; } },
    iron_will:       { cat:'heavy', label:'Iron Will',     desc:'Core cannot be one-shot (survives to 1 HP, resets per round)', apply: () => { _perkState.ironWill=true; } },
    reactor_core:    { cat:'heavy', label:'Reactor Core',  desc:'GL/RL kills trigger a small secondary explosion', apply: () => { _perkState.reactorCore=true; } },
    titan_core:      { cat:'heavy', label:'Titan Core',    desc:'Core HP cannot drop more than 30% from a single hit', apply: () => { _perkState.titanCore=true; } },
    ground_pound:    { cat:'heavy', label:'Ground Pound',  desc:'Ramming enemies deals 25 contact damage',     apply: () => { _perkState.groundPound=(_perkState.groundPound||0)+25; } },
    iron_curtain:    { cat:'heavy', once:true, label:'Iron Curtain', desc:'−40% all damage taken; −30% move speed', apply: () => { _perkState.fortress=(_perkState.fortress||0)+0.40; _perkState.speedMult=(_perkState.speedMult||1)*0.70; } },
    // ── WEAPON / MOD SPECIFIC ──────────────────────────────────────────
    overheated_barrels: { cat:'smg',  label:'Overheated Barrels', desc:'SMG: +10% damage & −10% reload',    apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.10; _perkState.reloadMult=(_perkState.reloadMult||1)*0.90; } },
    mg_heat_sink:    { cat:'mg',   label:'Heat Sink',       desc:'MG: reload −25% (stackable)',              apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.75; } },
    mg_tracer:       { cat:'mg',   label:'Tracer Rounds',   desc:'MG: every 5th bullet deals +50% damage',   apply: () => { _perkState.mgTracer=true; } },
    point_blank:     { cat:'sg',   label:'Point Blank',     desc:'Shotgun: +40% dmg within 150px (stackable)', apply: () => { _perkState.pointBlank=(_perkState.pointBlank||0)+0.40; } },
    sg_flechette:    { cat:'sg',   label:'Flechette',       desc:'Shotgun: +2 extra pellets per shot (stackable)', apply: () => { _perkState.sgFlechette=(_perkState.sgFlechette||0)+2; } },
    cold_shot:       { cat:'sr',   label:'Cold Shot',       desc:'Sniper: first shot each reload deals 3× dmg', apply: () => { _perkState.coldShot=true; _perkState.coldShotReady=true; } },
    sr_breath:       { cat:'sr',   label:'Steady Breath',   desc:'Sniper: +25% damage while standing still (stackable)', apply: () => { _perkState.srBreath=(_perkState.srBreath||0)+0.25; } },
    cluster_rounds:  { cat:'gl',   label:'Cluster Rounds',  desc:'GL: explosion spawns 3 small secondary blasts', apply: () => { _perkState.clusterRounds=true; } },
    rl_warhead:      { cat:'rl',   label:'Warhead',         desc:'RL: +25% explosion radius & +15% dmg (stackable)', apply: () => { _perkState.blastMult=(_perkState.blastMult||1)*1.25; _perkState.dmgMult=(_perkState.dmgMult||1)*1.15; } },
    rl_tandem:       { cat:'rl',   label:'Tandem Warhead',  desc:'RL: each rocket spawns a smaller follow-up explosion', apply: () => { _perkState.rlTandem=true; } },
    afterburn:       { cat:'rl',   label:'Afterburn',       desc:'RL: leaves burning trail at impact (5 dmg/tick)', apply: () => { _perkState.afterburn=true; } },
    br_marksman:     { cat:'br',   label:'Marksman',        desc:'BR: +20% damage on first shot after full reload (stackable)', apply: () => { _perkState.brMarksman=(_perkState.brMarksman||0)+0.20; } },
    hr_devastator:   { cat:'hr',   label:'Devastator',      desc:'HR: +15% damage & blast on impact (stackable)', apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.15; } },
    plsm_overcharge: { cat:'plsm', label:'Overcharge',      desc:'Plasma: +20% size & damage (stackable)',    apply: () => { _perkState.plsmMult=(_perkState.plsmMult||1)*1.20; } },
    plsm_chain:      { cat:'plsm', label:'Chain Plasma',    desc:'Plasma orb chains to nearest enemy within 150px on hit', apply: () => { _perkState.plsmChain=true; } },
    fth_napalm:      { cat:'fth',  label:'Napalm',          desc:'FTH: ignited enemies burn for 3s after leaving range', apply: () => { _perkState.fthNapalm=true; } },
    fth_wide_cone:   { cat:'fth',  label:'Wide Cone',       desc:'FTH: flame spread +30%, range +20% (stackable)', apply: () => { _perkState.fthRange=(_perkState.fthRange||0)+0.20; _perkState.fthCone=(_perkState.fthCone||0)+0.30; } },
    rail_capacitor:  { cat:'rail', label:'Capacitor',       desc:'RAIL: charge time −20% (stackable)',        apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.80; } },
    rail_overload:   { cat:'rail', label:'Overload',        desc:'RAIL: +25% damage per enemy pierced (stackable)', apply: () => { _perkState.railPierceBonus=(_perkState.railPierceBonus||0)+0.25; } },
    reactive_shield: { cat:'shield', label:'Reactive Shield', desc:'Shield activation reflects 30 dmg to nearby enemies (+30/stack)', apply: () => { _perkState.reactiveShield=(_perkState.reactiveShield||0)+30; } },
    berserker_fuel:  { cat:'rage', label:'Berserker Fuel',  desc:'Rage duration +50% (stackable)',             apply: () => { _perkState.rageDurMult=(_perkState.rageDurMult||1)*1.50; } },
    rage_feed:       { cat:'rage', label:'Blood Rage',      desc:'Kills during rage extend duration by 0.5s (stackable)', apply: () => { _perkState.rageFeed=(_perkState.rageFeed||0)+500; } },
    afterburner:     { cat:'jump', label:'Afterburner',     desc:'JUMP distance & speed +40% (stackable)',     apply: () => { _perkState.jumpSpeedMult=(_perkState.jumpSpeedMult||1)*1.40; } },
    jump_slam:       { cat:'jump', label:'Ground Slam',     desc:'Landing from JUMP deals extra damage in radius (stackable)', apply: () => { _perkState.jumpSlam=(_perkState.jumpSlam||0)+30; } },
    afterimage_jump: { cat:'jump', label:'Afterimage',      desc:'JUMP leaves a decoy at launch point that briefly draws fire', apply: () => { _perkState.afterimage=true; } },
    // ── DECOY MOD PERKS ────────────────────────────────────────────────
    decoy_duration:  { cat:'decoy', label:'Extended Run',    desc:'Decoy lasts 3s longer (stackable)',                   apply: () => { _perkState.decoyDuration=(_perkState.decoyDuration||0)+3000; } },
    decoy_damage:    { cat:'decoy', label:'Live Rounds',     desc:'Decoy fires at full damage instead of 50%',           apply: () => { _perkState.decoyFullDmg=true; } },
    twin_decoy:      { cat:'decoy', label:'Twin Decoy',      desc:'Deploy 2 decoys at once — second spawns 40px offset', apply: () => { _perkState.twinDecoy=true; } },
    ghost_exit:      { cat:'decoy', label:'Ghost Exit',      desc:'When decoy expires, you cloak for 2s',                apply: () => { _perkState.ghostExit=true; } },
    phantom_army:    { cat:'decoy', once:true, legendary:true, label:'Phantom Army',
        desc:'LEGENDARY — Decoys never expire. Each activation spawns a new permanent decoy (max 3). All phantoms fire continuously.',
        apply: () => { _perkState.phantomArmy=true; } },
    chain_emp:       { cat:'emp',  label:'Chain EMP',       desc:'EMP stun chains to a 2nd nearby enemy',      apply: () => { _perkState.chainEmp=true; } },
    emp_amplifier:   { cat:'emp',  label:'Amplifier',       desc:'EMP: stun duration +40%, area +30%',         apply: () => { _perkState.empAmplifier=true; } },
    barrier_spike:   { cat:'barrier', label:'Barrier Spike',desc:'While barrier is active: nearby enemies take 15 dmg/s', apply: () => { _perkState.barrierSpike=true; } },
    // ── AUGMENT PERKS ──────────────────────────────────────────────────
    painter_lock:    { cat:'target_painter',   label:'Target Lock', desc:'Painter: marked enemies stay marked 2s longer', apply: () => { _perkState.painterDuration=(_perkState.painterDuration||0)+2000; } },
    analyzer_deep:   { cat:'threat_analyzer',  label:'Deep Scan',   desc:'Analyzer: resistance reduction increases to 25%', apply: () => { _perkState.analyzerDepth=true; } },
    plating_stacks:  { cat:'reactive_plating', label:'Dense Weave', desc:'Reactive Plating: max stacks increased to 8', apply: () => { _perkState.platingMaxStacks=8; } },
    scrap_chain:     { cat:'scrap_cannon',     label:'Shrapnel',    desc:'Scrap Cannon: explosion chains once to nearby enemy', apply: () => { _perkState.scrapChain=true; } },
    // ── LEG SYSTEM PERKS ───────────────────────────────────────────────
    boost_overdrive: { cat:'hydraulic_boost',  label:'Overdrive',    desc:'Hydro Boost: speed bonus increased to +35%', apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.15; } },
    mine_cluster:    { cat:'mine_layer',        label:'Cluster Mine', desc:'Mine Layer: mines spawn 3 submunitions on detonation', apply: () => { _perkState.mineCluster=true; } },
    anchor_fortress: { cat:'mag_anchors',       label:'Fortress Mode',desc:'Mag Anchors: DR while still increased to 35%', apply: () => { _perkState.anchorFortress=true; } },
    afterleg_boost:  { cat:'afterleg',          label:'Jet Assist',   desc:'Afterleg: shockwave damage +50%, radius +30%', apply: () => { _perkState.afterlegBoost=true; } },

    // ── DRONE COMMANDER PERKS ──────────────────────────────────────
    drone_uplink:    { cat:'atk_drone', label:'Drone Uplink',     desc:'Drone damage +25% per stack',                  apply: () => { _perkState.droneUplink=(_perkState.droneUplink||0)+0.25; } },
    rapid_relaunch:  { cat:'atk_drone', label:'Rapid Relaunch',   desc:'Drone cooldown −35% per stack',                apply: () => { _perkState.droneCdMult=(_perkState.droneCdMult||1)*0.65; } },
    neural_link:     { cat:'atk_drone', label:'Neural Link',      desc:'While drone is active: reload speed +15%',     apply: () => { _perkState.neuralLink=(_perkState.neuralLink||0)+0.15; } },
    swarm_logic:     { cat:'atk_drone', label:'Swarm Logic',      desc:'Each kill while drone is active: −2s drone cooldown', apply: () => { _perkState.swarmLogic=(_perkState.swarmLogic||0)+2000; } },
    hardened_frame:  { cat:'atk_drone', label:'Hardened Frame',   desc:'Drone takes 50% less damage (stackable)',      apply: () => { _perkState.droneArmor=(_perkState.droneArmor||0)+0.50; } },
    overwatch:       { cat:'atk_drone', label:'Overwatch',        desc:'Drone damage +20% per kill you make this round (resets each round)', apply: () => { _perkState.overwatchStacks=(_perkState.overwatchStacks||0)+1; } },
    // LEGENDARY: Autonomous Unit
    drone_burst:     { cat:'atk_drone', label:'Burst Fire',      desc:'Drone fires in 3-shot bursts dealing +50% total damage per burst', apply: () => { _perkState.droneBurst=true; } },
    drone_shield:    { cat:'atk_drone', label:'Shield Siphon',   desc:'Drone hits restore 5 shield HP to you per hit',    apply: () => { _perkState.droneShield=true; } },
    drone_emp5:      { cat:'atk_drone', label:'EMP Drone',       desc:'Every 5th drone shot stuns target for 0.8s',       apply: () => { _perkState.droneEmp5=true; } },
    drone_range:     { cat:'atk_drone', label:'Extended Range',  desc:'Drone targeting range +150px (stackable)',         apply: () => { _perkState.droneRange=(_perkState.droneRange||0)+150; } },
    autonomous_unit: { cat:'atk_drone', once:true, legendary:true, label:'Autonomous Unit',
        desc:'LEGENDARY — Drone deploys automatically each round and stays until destroyed. Respawns 12s after death. Kills reduce respawn by −1s each.',
        apply: () => { _perkState.autonomousUnit=true; } },

    // ── GHOST ASSASSIN PERKS ────────────────────────────────────
    ghost_jump:      { cat:'jump', label:'Ghost Jump',     desc:'During JUMP air time, enemies stop targeting you',  apply: () => { _perkState.ghostJump=true; } },
    kinetic_landing: { cat:'jump', label:'Kinetic Landing',desc:'Landing within 80px of enemy: 40–120 dmg scaled to jump distance', apply: () => { _perkState.kineticLanding=(_perkState.kineticLanding||0)+1; } },
    double_tap_jump: { cat:'jump', label:'Double Tap',     desc:'JUMP has 2 charges per cooldown period',           apply: () => { _perkState.jumpCharges=2; } },
    snap_charge:     { cat:'rail', label:'Snap Charge',    desc:'First RAIL shot each round fires instantly (no charge time)', apply: () => { _perkState.snapCharge=true; _perkState._snapChargeReady=true; } },
    tungsten_core:   { cat:'rail', label:'Tungsten Core',  desc:'RAIL shots ignore enemy shields entirely',         apply: () => { _perkState.tungstenCore=true; } },
    piercing_momentum:{ cat:'rail',label:'Piercing Momentum',desc:'Each enemy pierced by RAIL: +25% damage for that shot (stackable)', apply: () => { _perkState.piercingMomentum=(_perkState.piercingMomentum||0)+0.25; } },
    one_shot:        { cat:'sr',  label:'One Shot',        desc:'SR: killing the target halves reload time',        apply: () => { _perkState.oneShot=true; } },
    penetrator:      { cat:'sr',  label:'Penetrator',      desc:'SR: +20% damage per 200px traveled',              apply: () => { _perkState.penetrator=(_perkState.penetrator||0)+0.20; } },
    // LEGENDARY: Phantom Protocol
    phantom_protocol:{ cat:'jump', once:true, legendary:true, label:'Phantom Protocol',
        desc:'LEGENDARY — For 3s after landing from JUMP: your next shot deals 4× damage and pierces all targets.',
        apply: () => { _perkState.phantomProtocol=true; } },

    // ── INFERNO WALL PERKS ──────────────────────────────────────
    inferno:         { cat:'fth', label:'Inferno',         desc:'Ignited enemies spread fire to adjacent enemies on death', apply: () => { _perkState.inferno=true; } },
    fuel_efficiency: { cat:'fth', label:'Fuel Efficiency', desc:'FTH reload −25% per stack',                       apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.75; } },
    melt_armor:      { cat:'fth', label:'Melt Armor',      desc:'FTH hits reduce enemy DR by 10% for 4s (stacks to 3×)', apply: () => { _perkState.meltArmor=(_perkState.meltArmor||0)+1; } },
    pressure_spray:  { cat:'fth', label:'Pressure Spray',  desc:'FTH slows enemies 20% while in the flame cone',   apply: () => { _perkState.pressureSpray=true; } },
    napalm_strike:   { cat:'fth', label:'Napalm Strike',   desc:'FTH leaves a burning ground patch for 3s at impact point', apply: () => { _perkState.napalmStrike=true; } },
    thorns_protocol: { cat:'barrier', label:'Thorns Protocol', desc:'While shield/barrier active: enemies hitting you take 20 reflected dmg per stack', apply: () => { _perkState.thornsProtocol=(_perkState.thornsProtocol||0)+20; } },
    capacitor_armor: { cat:'barrier', label:'Capacitor Armor', desc:'Every 100 shield damage absorbed: next shot +25% damage', apply: () => { _perkState.capacitorArmor=(_perkState.capacitorArmor||0)+100; _perkState._capacitorCharge=0; } },
    // LEGENDARY: Meltdown Core
    meltdown_core:   { cat:'fth', once:true, legendary:true, label:'Meltdown Core',
        desc:'LEGENDARY — Passive heat aura: enemies within 180px take 8 dmg/s. Activating Barrier/Shield spikes to 60 instant AoE at 250px.',
        apply: () => { _perkState.meltdownCore=true; } },

    // ══════════════════════════════════════════════════════════════
    // SMG PERKS (need 9 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    smg_mag_dump:    { cat:'smg', label:'Mag Dump',        desc:'SMG: last 4 bullets of each mag deal +60% damage',       apply: () => { _perkState.smgMagDump=true; } },
    smg_hollow:      { cat:'smg', label:'Hollow Points',   desc:'SMG: +15% damage at ranges under 160px (stackable)',      apply: () => { _perkState.smgHollow=(_perkState.smgHollow||0)+0.15; } },
    smg_spray:       { cat:'smg', label:'Spray Pattern',   desc:'SMG: fire rate +20%, bullet spread +15% (stackable)',     apply: () => { _perkState.smgSpray=(_perkState.smgSpray||0)+1; } },
    smg_rupture:     { cat:'smg', label:'Rupture Rounds',  desc:'SMG hits cause bleeding: 3 dmg/s for 2s on each hit',    apply: () => { _perkState.smgRupture=true; } },
    smg_suppressor:  { cat:'smg', label:'Suppressor',      desc:'SMG shots slow enemies 8% per hit, stacking up to 4×',   apply: () => { _perkState.smgSuppressor=true; } },
    smg_tracer:      { cat:'smg', label:'Tracer Rounds',   desc:'Every 5th SMG bullet deals 3× damage',                   apply: () => { _perkState.smgTracer=true; } },
    smg_burst:       { cat:'smg', label:'Burst Trigger',   desc:'SMG: first 3 shots after reload deal +40% damage',       apply: () => { _perkState.smgBurst=true; } },
    smg_range:       { cat:'smg', label:'Extended Barrel', desc:'SMG range dropoff extended +40% (stackable)',             apply: () => { _perkState.smgRange=(_perkState.smgRange||0)+0.40; } },
    smg_lifesteal:   { cat:'smg', label:'Lifesteal',       desc:'SMG kills restore 5 core HP',                            apply: () => { _perkState.smgLifesteal=true; } },
    smg_legendary:   { cat:'smg', once:true, legendary:true, label:'Bullet Storm',
        desc:'LEGENDARY — SMG fires twice per trigger pull. No accuracy penalty. Reload time doubled but ammo is unlimited between reloads.',
        apply: () => { _perkState.smgBulletStorm=true; } },

    // ══════════════════════════════════════════════════════════════
    // MG PERKS (need 8 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    mg_overheat:     { cat:'mg', label:'Overheat Rounds',  desc:'MG: every 8th bullet is incendiary, igniting on hit',    apply: () => { _perkState.mgOverheat=true; } },
    mg_penetrator:   { cat:'mg', label:'Penetrator',       desc:'MG bullets pierce through the first enemy hit',          apply: () => { _perkState.mgPenetrator=true; } },
    mg_armor_strip:  { cat:'mg', label:'Armor Strip',      desc:'MG hits reduce enemy DR by 5% for 3s (max 4 stacks)',    apply: () => { _perkState.mgArmorStrip=true; } },
    mg_velocity:     { cat:'mg', label:'High Velocity',    desc:'MG bullet speed +30%, damage +10% at range >350px',      apply: () => { _perkState.mgVelocity=true; } },
    mg_sustain:      { cat:'mg', label:'Sustained Fire',   desc:'Each second of continuous MG fire: +5% damage (max +25%)',apply: () => { _perkState.mgSustain=true; } },
    mg_headshot:     { cat:'mg', label:'Precision Feed',   desc:'MG: 10% chance per bullet to deal 2× damage (crit)',     apply: () => { _perkState.mgHeadshot=true; } },
    mg_coolant:      { cat:'mg', label:'Coolant System',   desc:'MG reload time -20% (stackable)',                        apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.80; } },
    mg_shieldbreak:  { cat:'mg', label:'Shield Breaker',   desc:'MG ignores 30% of enemy shield absorption',             apply: () => { _perkState.mgShieldBreak=true; } },
    mg_legendary:    { cat:'mg', once:true, legendary:true, label:'Iron Curtain',
        desc:'LEGENDARY — MG never needs to reload. Damage ramps +5% every second of continuous fire, up to +50%. Stops when you stop firing.',
        apply: () => { _perkState.mgIronCurtain=true; } },

    // ══════════════════════════════════════════════════════════════
    // BR PERKS (need 9 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    br_burst_chain:  { cat:'br', label:'Chain Burst',      desc:'BR kills reset burst cooldown instantly',                apply: () => { _perkState.brBurstChain=true; } },
    br_penetrate:    { cat:'br', label:'Penetrating Fire', desc:'BR bullets pierce through one enemy',                    apply: () => { _perkState.brPenetrate=true; } },
    br_headhunter:   { cat:'br', label:'Headhunter',       desc:'BR first shot of each burst deals +50% damage',         apply: () => { _perkState.brHeadhunter=true; } },
    br_stagger:      { cat:'br', label:'Stagger Rounds',   desc:'BR bursts briefly stagger enemies (0.3s slow)',          apply: () => { _perkState.brStagger=true; } },
    br_scope:        { cat:'br', label:'Long Barrel',      desc:'BR damage +20% at ranges over 300px (stackable)',        apply: () => { _perkState.brScope=(_perkState.brScope||0)+0.20; } },
    br_mag_size:     { cat:'br', label:'Extended Mag',     desc:'BR fires 4-round bursts instead of 3',                  apply: () => { _perkState.brExtMag=true; } },
    br_reload:       { cat:'br', label:'Fast Hands',       desc:'BR reload time -25% (stackable)',                        apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.75; } },
    br_tracking:     { cat:'br', label:'Target Tracking',  desc:'BR burst: each successive hit in the burst deals +10% more damage', apply: () => { _perkState.brTracking=true; } },
    br_explosive_tip:{ cat:'br', label:'Explosive Tip',    desc:'BR last bullet in every burst causes a small explosion (30 dmg, 60px)', apply: () => { _perkState.brExplosiveTip=true; } },
    br_legendary:    { cat:'br', once:true, legendary:true, label:'Decimator Protocol',
        desc:'LEGENDARY — BR fires 6-round bursts. Every 3rd full burst auto-fires an additional burst at no reload cost.',
        apply: () => { _perkState.brDecimator=true; } },

    // ══════════════════════════════════════════════════════════════
    // SG PERKS (need 8 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    sg_spread:       { cat:'sg', label:'Wide Spread',      desc:'SG: +2 pellets per shot, wider spread cone',             apply: () => { _perkState.sgSpread=(_perkState.sgSpread||0)+2; } },
    sg_slug:         { cat:'sg', label:'Slug Round',       desc:'Every 3rd SG shot is a single high-damage slug (×3 base dmg, no spread)', apply: () => { _perkState.sgSlug=true; } },
    sg_reload_kd:    { cat:'sg', label:'Pump Action Pro',  desc:'SG reload -20% (stackable)',                             apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.80; } },
    sg_range_ext:    { cat:'sg', label:'Extended Choke',   desc:'SG max effective range +30%',                            apply: () => { _perkState.sgRangeExt=(_perkState.sgRangeExt||0)+0.30; } },
    sg_momentum:     { cat:'sg', label:'Knockback',        desc:'SG hits push enemies back slightly, disrupting movement', apply: () => { _perkState.sgKnockback=true; } },
    sg_breacher:     { cat:'sg', label:'Breacher',         desc:'SG deals +40% damage to stationary enemies',             apply: () => { _perkState.sgBreacher=true; } },
    sg_lifesteal:    { cat:'sg', label:'Bloodsoak',        desc:'SG kills heal 8 core HP',                                apply: () => { _perkState.sgLifesteal=true; } },
    sg_buckshot:     { cat:'sg', label:'Dragon Breath',    desc:'SG pellets ignite enemies on hit (30% chance per pellet)',apply: () => { _perkState.sgDragonBreath=true; } },
    sg_legendary:    { cat:'sg', once:true, legendary:true, label:'Point Blank Protocol',
        desc:'LEGENDARY — SG deals maximum damage regardless of range. Kills with SG at under 120px restore 20 HP and reset reload.',
        apply: () => { _perkState.sgPointBlank=true; } },

    // ══════════════════════════════════════════════════════════════
    // FTH PERKS (need 3 reg — already has legendary)
    // ══════════════════════════════════════════════════════════════
    fth_afterburn:   { cat:'fth', label:'Afterburn',       desc:'FTH: ignited enemies continue burning 2s longer (stackable)', apply: () => { _perkState.fthAfterburn=(_perkState.fthAfterburn||0)+2; } },
    fth_intensity:   { cat:'fth', label:'High Intensity',  desc:'FTH base damage +25% (stackable)',                       apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.25; } },
    fth_pyro_aura:   { cat:'fth', label:'Pyro Aura',       desc:'While FTH is active, you are immune to your own fire damage', apply: () => { _perkState.fthPyroAura=true; } },

    // ══════════════════════════════════════════════════════════════
    // HR PERKS (need 9 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    hr_capacitor:    { cat:'hr', label:'Capacitor Round',  desc:'HR: charge between shots to deal +50% damage (0.8s window)', apply: () => { _perkState.hrCapacitor=true; } },
    hr_blowthrough:  { cat:'hr', label:'Blowthrough',      desc:'HR pierces through all enemies in a line',                apply: () => { _perkState.hrBlowthrough=true; } },
    hr_emp_shot:     { cat:'hr', label:'EMP Shot',         desc:'HR hits disable enemy weapons for 1.5s',                  apply: () => { _perkState.hrEmpShot=true; } },
    hr_reload_boost: { cat:'hr', label:'Quick Cycle',      desc:'HR reload -20% (stackable)',                             apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.80; } },
    hr_splash:       { cat:'hr', label:'Hyper Expansion',  desc:'HR shots create a 50px shockwave at impact point (40 dmg)', apply: () => { _perkState.hrSplash=true; } },
    hr_stagger:      { cat:'hr', label:'Heavy Impact',     desc:'HR hits stagger large enemies for 0.5s',                  apply: () => { _perkState.hrStagger=true; } },
    hr_expose:       { cat:'hr', label:'Armor Crack',      desc:'HR hits mark target: +25% damage from all sources for 3s', apply: () => { _perkState.hrExpose=true; } },
    hr_charge_dmg:   { cat:'hr', label:'Overcharge',       desc:'HR +30% damage (stackable)',                             apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.30; } },
    hr_twin_shot:    { cat:'hr', label:'Twin Shot',        desc:'Every 3rd HR shot fires a second bullet at -50% damage at no reload cost', apply: () => { _perkState.hrTwinShot=true; } },
    hr_legendary:    { cat:'hr', once:true, legendary:true, label:'Annihilator',
        desc:'LEGENDARY — HR bullets now explode on impact (80px radius, 120 dmg). Cooldown between shots removed.',
        apply: () => { _perkState.hrAnnihilator=true; } },

    // ══════════════════════════════════════════════════════════════
    // SR PERKS (need 6 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    sr_explosive:    { cat:'sr', label:'Explosive Round',  desc:'SR shot creates 80px explosion at impact (100 dmg)',      apply: () => { _perkState.srExplosive=true; } },
    sr_chain:        { cat:'sr', label:'Chain Shot',       desc:'SR kill: bullet ricochets to nearest enemy at 70% dmg',   apply: () => { _perkState.srChain=true; } },
    sr_scope_in:     { cat:'sr', label:'Scope Mastery',    desc:'SR: stationary for 1s+ grants +30% damage bonus',         apply: () => { _perkState.srScopeMastery=true; } },
    sr_reload:       { cat:'sr', label:'Bolt Action Pro',  desc:'SR reload -25% (stackable)',                             apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.75; } },
    sr_mark:         { cat:'sr', label:'Death Mark',       desc:'SR hit marks target: they take +30% dmg from all sources for 4s', apply: () => { _perkState.srMark=true; } },
    sr_ghost_bullet: { cat:'sr', label:'Ghost Round',      desc:'SR bullets are invisible until they hit',                 apply: () => { _perkState.srGhostBullet=true; } },
    sr_legendary:    { cat:'sr', once:true, legendary:true, label:'One Shot Protocol',
        desc:'LEGENDARY — SR deals 600 base damage. Every kill with SR grants 0.5s of invincibility and instantly reloads.',
        apply: () => { _perkState.srOneShot=true; } },

    // ══════════════════════════════════════════════════════════════
    // GL PERKS (need 9 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    gl_airburst:     { cat:'gl', label:'Airburst',         desc:"GL grenades explode mid-air after 1.2s if they haven't hit anything", apply: () => { _perkState.glAirburst=true; } },
    gl_sticky:       { cat:'gl', label:'Sticky Round',     desc:'GL grenades stick to enemies before detonating',          apply: () => { _perkState.glSticky=true; } },
    gl_radius:       { cat:'gl', label:'Heavy Charge',     desc:'GL explosion radius +25% (stackable)',                    apply: () => { _perkState.glRadius=(_perkState.glRadius||0)+0.25; } },
    gl_cluster:      { cat:'gl', label:'Cluster II',       desc:'GL explosions spawn 3 mini-grenades that scatter and explode', apply: () => { _perkState.glClusterII=true; } },
    gl_incendiary:   { cat:'gl', label:'Incendiary Round', desc:'GL explosions leave a burning ground patch for 3s',       apply: () => { _perkState.glIncendiary=true; } },
    gl_reload:       { cat:'gl', label:'Autoloader',       desc:'GL reload -20% (stackable)',                             apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.80; } },
    gl_double:       { cat:'gl', label:'Double Tap',       desc:'GL fires 2 grenades per trigger pull (second at -30% dmg)', apply: () => { _perkState.glDoubleTap=true; } },
    gl_concuss:      { cat:'gl', label:'Concussive Blast', desc:'GL explosions stun enemies for 1.5s',                    apply: () => { _perkState.glConcuss=true; } },
    gl_chain_det:    { cat:'gl', label:'Chain Detonation', desc:'GL kills trigger a secondary explosion from the corpse',  apply: () => { _perkState.glChainDet=true; } },
    gl_legendary:    { cat:'gl', once:true, legendary:true, label:'Carpet Bomb',
        desc:'LEGENDARY — GL fires 4 grenades simultaneously in a spread. Explosion radius doubled. Kill with GL fully reloads.',
        apply: () => { _perkState.glCarpetBomb=true; } },

    // ══════════════════════════════════════════════════════════════
    // RL PERKS (need 7 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    rl_cluster_war:  { cat:'rl', label:'Cluster Warhead',  desc:'RL explosion spawns 4 homing micro-rockets (30 dmg each)', apply: () => { _perkState.rlClusterWar=true; } },
    rl_propellant:   { cat:'rl', label:'High Propellant',  desc:'RL rocket speed +40%, explosion radius +15%',             apply: () => { _perkState.rlPropellant=true; } },
    rl_lock_on:      { cat:'rl', label:'Lock-On System',   desc:'RL rockets home toward nearest enemy',                    apply: () => { _perkState.rlLockOn=true; } },
    rl_reload:       { cat:'rl', label:'Rapid Loader',     desc:'RL reload -20% (stackable)',                             apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.80; } },
    rl_penetrate:    { cat:'rl', label:'Bunker Buster',    desc:'RL explosion ignores 50% of enemy DR',                    apply: () => { _perkState.rlPenetrate=true; } },
    rl_self_shield:  { cat:'rl', label:'Blast Shield',     desc:'RL self-damage further reduced 30% (stackable)',          apply: () => { _perkState.rlSelfShield=(_perkState.rlSelfShield||0)+0.30; } },
    rl_shockwave:    { cat:'rl', label:'Shockwave',        desc:'RL explosion emits a shockwave that knocks enemies back 200px', apply: () => { _perkState.rlShockwave=true; } },
    rl_legendary:    { cat:'rl', once:true, legendary:true, label:'Doomsday Round',
        desc:'LEGENDARY — RL explosion radius doubled to 240px. Direct hits deal an additional 300 damage before explosion.',
        apply: () => { _perkState.rlDoomsday=true; } },

    // ══════════════════════════════════════════════════════════════
    // PLSM PERKS (need 8 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    plsm_pierce:     { cat:'plsm', label:'Pierce Core',    desc:'PLSM beam passes through enemies (hits all in path)',     apply: () => { _perkState.plsmPierce=true; } },
    plsm_regen:      { cat:'plsm', label:'Energy Siphon',  desc:'PLSM kills restore 15 shield HP',                        apply: () => { _perkState.plsmRegen=true; } },
    plsm_width:      { cat:'plsm', label:'Wide Beam',      desc:'PLSM orb size +40% (stackable)',                         apply: () => { _perkState.plsmWidth=(_perkState.plsmWidth||0)+0.40; } },
    plsm_speed:      { cat:'plsm', label:'Accelerator',    desc:'PLSM travel speed +30%, impact damage +15%',             apply: () => { _perkState.plsmSpeed=true; } },
    plsm_nova:       { cat:'plsm', label:'Nova Burst',     desc:'PLSM on impact releases a 120px energy nova (60 dmg)',    apply: () => { _perkState.plsmNova=true; } },
    plsm_reload:     { cat:'plsm', label:'Capacitor Bank', desc:'PLSM reload -20% (stackable)',                           apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.80; } },
    plsm_emp_burst:  { cat:'plsm', label:'EMP Burst',      desc:'PLSM impact stuns enemies in 80px for 1s',               apply: () => { _perkState.plsmEmpBurst=true; } },
    plsm_dmg:        { cat:'plsm', label:'Overcharge Core',desc:'PLSM base damage +30% (stackable)',                      apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.30; } },
    plsm_legendary:  { cat:'plsm', once:true, legendary:true, label:'Singularity',
        desc:'LEGENDARY — PLSM creates a singularity on impact: pulls all nearby enemies (300px) toward the blast point for 2s, then explodes for 250 dmg.',
        apply: () => { _perkState.plsmSingularity=true; } },

    // ══════════════════════════════════════════════════════════════
    // RAIL PERKS (need 5 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    rail_emp_trail:  { cat:'rail', label:'EMP Trail',      desc:'RAIL shot leaves an EMP trail that stuns enemies it passes through', apply: () => { _perkState.railEmpTrail=true; } },
    rail_splinter:   { cat:'rail', label:'Splinter Shot',  desc:'RAIL penetration splits into 3 shards at each enemy hit (30 dmg, short range)', apply: () => { _perkState.railSplinter=true; } },
    rail_reload:     { cat:'rail', label:'Rapid Charge',   desc:'RAIL charge time -20% and reload -15% (stackable)',       apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.85; } },
    rail_shield_rip: { cat:'rail', label:'Shield Ripper',  desc:'RAIL destroys enemy shields entirely on hit',             apply: () => { _perkState.railShieldRip=true; } },
    rail_afterburn:  { cat:'rail', label:'Plasma Burn',    desc:'RAIL shots ignite every enemy pierced',                   apply: () => { _perkState.railAfterburn=true; } },
    rail_legendary:  { cat:'rail', once:true, legendary:true, label:'Railstorm',
        desc:'LEGENDARY — RAIL fires 3 simultaneous shots in a tight spread. Charge time halved. Each shot retains full pierce.',
        apply: () => { _perkState.railstorm=true; } },

    // ══════════════════════════════════════════════════════════════
    // JUMP MOD PERKS (need 4 reg — already has legendary)
    // ══════════════════════════════════════════════════════════════
    jump_stealth:    { cat:'jump', label:'Ghost Launch',   desc:'JUMP launch grants 1s of invisibility',                   apply: () => { _perkState.jumpStealth=true; } },
    jump_reload:     { cat:'jump', label:'Aerial Reload',  desc:'Reloads both weapons during JUMP airtime',                apply: () => { _perkState.jumpAerialReload=true; } },
    jump_cooldown:   { cat:'jump', label:'Quick Recovery', desc:'JUMP cooldown -20% (stackable)',                          apply: () => { _perkState.jumpCooldownMult=(_perkState.jumpCooldownMult||1)*0.80; } },
    jump_dmg_boost:  { cat:'jump', label:'Apex Strike',    desc:'JUMP landing slam damage +50% (stackable)',               apply: () => { _perkState.jumpSlam=(_perkState.jumpSlam||0)+20; } },

    // ══════════════════════════════════════════════════════════════
    // BARRIER PERKS (need 7 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    barrier_extend:  { cat:'barrier', label:'Extended Field',desc:'Barrier duration +1s (stackable)',                      apply: () => { _perkState.barrierExtend=(_perkState.barrierExtend||0)+1000; } },
    barrier_cooldown:{ cat:'barrier', label:'Rapid Recharge',desc:'Barrier cooldown -15% (stackable)',                     apply: () => { _perkState.barrierCooldown=(_perkState.barrierCooldown||0)+0.15; } },
    barrier_reflect: { cat:'barrier', label:'Mirror Field', desc:'Barrier reflects 50% of incoming damage back at attacker', apply: () => { _perkState.barrierReflect=true; } },
    barrier_heal:    { cat:'barrier', label:'Field Repair', desc:'Barrier active: regenerates 15 HP/s while active',       apply: () => { _perkState.barrierHeal=true; } },
    barrier_emp_pop: { cat:'barrier', label:'EMP Pop',      desc:'When barrier expires, emits a 200px EMP that stuns nearby enemies', apply: () => { _perkState.barrierEmpPop=true; } },
    barrier_speed:   { cat:'barrier', label:'Reactive Dash',desc:'+30% move speed while barrier is active',                apply: () => { _perkState.barrierSpeed=true; } },
    barrier_recharge:{ cat:'barrier', label:'Overcharge',   desc:'Breaking barrier early (before expiry) reduces cooldown by 50%', apply: () => { _perkState.barrierRecharge=true; } },
    barrier_legendary:{ cat:'barrier', once:true, legendary:true, label:'Absolute Defense',
        desc:'LEGENDARY — Barrier duration +3s and makes you fully invisible to enemies while active. Expires in a 300px explosion (150 dmg).',
        apply: () => { _perkState.barrierAbsolute=true; } },

    // ══════════════════════════════════════════════════════════════
    // RAGE PERKS (need 8 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    rage_speed:      { cat:'rage', label:'War Dash',       desc:'Rage grants +40% move speed (stackable)',                 apply: () => { _perkState.rageSpeed=(_perkState.rageSpeed||0)+0.40; } },
    rage_lifesteal:  { cat:'rage', label:'Bloodthirst',    desc:'All kills during Rage restore 12 core HP',                apply: () => { _perkState.rageLifesteal=true; } },
    rage_cooldown:   { cat:'rage', label:'Warpath',        desc:'Rage cooldown -20% (stackable)',                          apply: () => { _perkState.rageCooldown=(_perkState.rageCooldown||0)+0.20; } },
    rage_dmg_stack:  { cat:'rage', label:'Frenzy',         desc:'Each kill during Rage stacks +8% more damage (max +40%)', apply: () => { _perkState.rageFrenzy=true; } },
    rage_extend:     { cat:'rage', label:'Prolonged Fury', desc:'Rage duration +1.5s (stackable)',                         apply: () => { _perkState.rageDurMult=(_perkState.rageDurMult||1)*1.50; } },
    rage_armor:      { cat:'rage', label:'Iron Skin',      desc:'Rage grants +20% DR',                                    apply: () => { _perkState.rageArmor=true; } },
    rage_execute:    { cat:'rage', label:'Execute',        desc:'Rage: enemies below 15% HP are instantly killed',         apply: () => { _perkState.rageExecute=true; } },
    rage_chain_kill: { cat:'rage', label:'Kill Chain',     desc:'Kills during Rage have 30% chance to reset Rage duration', apply: () => { _perkState.rageChainKill=true; } },
    rage_legendary:  { cat:'rage', once:true, legendary:true, label:'Godmode Surge',
        desc:'LEGENDARY — Rage grants full invincibility (not just invuln frames), +60% damage, +50% speed, and kills auto-detonate enemies.',
        apply: () => { _perkState.rageGodmode=true; } },

    // ══════════════════════════════════════════════════════════════
    // EMP PERKS (need 8 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    emp_reload_dmg:  { cat:'emp', label:'Post-EMP Strike', desc:'Weapons deal +30% damage to stunned enemies',             apply: () => { _perkState.empReloadDmg=true; } },
    emp_pulse:       { cat:'emp', label:'Pulse Echo',      desc:'EMP sends a second pulse 1.5s after the first',           apply: () => { _perkState.empPulse=true; } },
    emp_slow:        { cat:'emp', label:'Residual Jam',    desc:'EMP stun fades into 40% movement slow for 2s',            apply: () => { _perkState.empSlow=true; } },
    emp_cooldown:    { cat:'emp', label:'Fast Charge',     desc:'EMP cooldown -20% (stackable)',                           apply: () => { _perkState.empCooldown=(_perkState.empCooldown||0)+0.20; } },
    emp_shieldstrip: { cat:'emp', label:'Shield Wipe',     desc:'EMP fully destroys enemy shields on hit',                 apply: () => { _perkState.empShieldStrip=true; } },
    emp_overload:    { cat:'emp', label:'Overload',        desc:'Stunned enemies take +20% damage from all sources (stackable)', apply: () => { _perkState.empOverload=(_perkState.empOverload||0)+0.20; } },
    emp_radius:      { cat:'emp', label:'Wide Field',      desc:'EMP radius +25% (stackable)',                             apply: () => { _perkState.empRadius=(_perkState.empRadius||0)+0.25; } },
    emp_detonate:    { cat:'emp', label:'Detonate',        desc:'EMP stun ends in a 100px explosion (80 dmg) on each enemy hit', apply: () => { _perkState.empDetonate=true; } },
    emp_legendary:   { cat:'emp', once:true, legendary:true, label:'Cascade Pulse',
        desc:'LEGENDARY — EMP chains between all enemies within 500px. Each chain reduces stun duration by 10% but the last enemy gets full stun + 200 dmg.',
        apply: () => { _perkState.empCascade=true; } },

    // ══════════════════════════════════════════════════════════════
    // REPAIR DRONE PERKS (need 10 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    repair_boost:    { cat:'repair', label:'Overclocked',  desc:'Repair Drone heals 20% faster (stackable)',               apply: () => { _perkState.repairBoost=(_perkState.repairBoost||0)+0.20; } },
    repair_full_arm: { cat:'repair', label:'Full Restore', desc:'Repair Drone heals all 3 limb types, not just most-damaged', apply: () => { _perkState.repairFullArm=true; } },
    repair_cooldown: { cat:'repair', label:'Quick Deploy', desc:'Repair Drone cooldown -20% (stackable)',                  apply: () => { _perkState.repairCooldown=(_perkState.repairCooldown||0)+0.20; } },
    repair_shield:   { cat:'repair', label:'Shield Splice',desc:'Repair Drone also restores 30 shield HP',                 apply: () => { _perkState.repairShield=true; } },
    repair_combat:   { cat:'repair', label:'Combat Medic', desc:'Repair Drone activates automatically when core HP drops below 25%', apply: () => { _perkState.repairCombat=true; } },
    repair_burst:    { cat:'repair', label:'Burst Heal',   desc:'Repair Drone heals in one instant burst instead of over time', apply: () => { _perkState.repairBurst=true; } },
    repair_radius:   { cat:'repair', label:'Field Medic',  desc:'Repair Drone heals you for 5 HP/s passively while deployed (not just on activation)', apply: () => { _perkState.repairPassive=true; } },
    repair_double:   { cat:'repair', label:'Dual Drone',   desc:'Repair activates two drones simultaneously',              apply: () => { _perkState.repairDouble=true; } },
    repair_save:     { cat:'repair', label:'Emergency Protocol',desc:'At 10% HP or below, one free Repair activation per round', apply: () => { _perkState.repairSave=true; } },
    repair_lifeline: { cat:'repair', label:'Lifeline',     desc:'Repair Drone restores full HP of the most-damaged limb (instead of partial)', apply: () => { _perkState.repairLifeline=true; } },
    repair_legendary:{ cat:'repair', once:true, legendary:true, label:'Nanite Swarm',
        desc:'LEGENDARY — Repair Drone is now permanent and passive: heals 3 HP/s to most-damaged limb. Activating triggers a full emergency restore of all limbs.',
        apply: () => { _perkState.repairNanite=true; } },

    // ══════════════════════════════════════════════════════════════
    // MISSILE PERKS (need 10 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    missile_count:   { cat:'missile', label:'Extra Payload',desc:'Missiles: +2 additional missiles per activation (stackable)', apply: () => { _perkState.missileCount=(_perkState.missileCount||0)+2; } },
    missile_dmg:     { cat:'missile', label:'Warhead Boost',desc:'Missile damage +25% (stackable)',                        apply: () => { _perkState.missileDmg=(_perkState.missileDmg||0)+0.25; } },
    missile_cooldown:{ cat:'missile', label:'Fast Launch',  desc:'Missile cooldown -20% (stackable)',                      apply: () => { _perkState.missileCooldown=(_perkState.missileCooldown||0)+0.20; } },
    missile_cluster: { cat:'missile', label:'Cluster Head', desc:'Each missile spawns 2 submunitions on impact (20 dmg each)', apply: () => { _perkState.missileCluster=true; } },
    missile_smart:   { cat:'missile', label:'Smart Lock',   desc:'Missiles target up to 6 enemies instead of 3',           apply: () => { _perkState.missileSmart=true; } },
    missile_emp:     { cat:'missile', label:'EMP Warhead',  desc:'Each missile stuns target for 1s on impact',             apply: () => { _perkState.missileEmp=true; } },
    missile_incend:  { cat:'missile', label:'Incendiary',   desc:'Missiles ignite targets on impact',                      apply: () => { _perkState.missileIncend=true; } },
    missile_speed:   { cat:'missile', label:'High Velocity',desc:'Missile travel speed +40%, homing radius +25%',          apply: () => { _perkState.missileSpeed=true; } },
    missile_chain:   { cat:'missile', label:'Chain Seeker', desc:'Missiles that kill their target re-seek the nearest enemy at 60% damage', apply: () => { _perkState.missileChain=true; } },
    missile_shield:  { cat:'missile', label:'Shield Buster',desc:'Missiles ignore enemy shield absorption entirely',        apply: () => { _perkState.missileShield=true; } },
    missile_legendary:{ cat:'missile', once:true, legendary:true, label:'Hellfire',
        desc:'LEGENDARY — Missile count tripled. All missiles track simultaneously. Targets hit by 3+ missiles in one volley take an additional 300 instant damage.',
        apply: () => { _perkState.missileHellfire=true; } },

    // ══════════════════════════════════════════════════════════════
    // DECOY PERKS (need 6 reg — already has legendary)
    // ══════════════════════════════════════════════════════════════
    decoy_cooldown:  { cat:'decoy', label:'Quick Deploy',   desc:'Decoy cooldown -20% (stackable)',                        apply: () => { _perkState.decoyCooldown=(_perkState.decoyCooldown||0)+0.20; } },
    decoy_firefast:  { cat:'decoy', label:'Suppressing Fire',desc:'Decoy fires every 0.6s instead of 1.2s',               apply: () => { _perkState.decoyFastFire=true; } },
    decoy_hp:        { cat:'decoy', label:'Reinforced Holo',desc:'Decoy absorbs up to 100 damage before dissolving',       apply: () => { _perkState.decoyHP=(_perkState.decoyHP||0)+100; } },
    decoy_taunt:     { cat:'decoy', label:'Full Taunt',     desc:'Decoy guarantees 100% enemy aggro (all enemies target it instantly)', apply: () => { _perkState.decoyFullTaunt=true; } },
    decoy_multi:     { cat:'decoy', label:'Triple Threat',  desc:'Deploy 3 decoys at once, each in a different direction', apply: () => { _perkState.decoyMulti=true; } },
    decoy_explosive: { cat:'decoy', label:'Explosive Holo', desc:'Decoy explodes for 120 dmg in 150px when destroyed or expired', apply: () => { _perkState.decoyExplosive=true; } },

    // ══════════════════════════════════════════════════════════════
    // GHOST STEP PERKS (need 10 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    gs_extend:       { cat:'ghost_step', label:'Extended Cloak',desc:'Ghost Step duration +0.5s (stackable)',              apply: () => { _perkState.ghostStepExtend=(_perkState.ghostStepExtend||0)+500; } },
    gs_cooldown:     { cat:'ghost_step', label:'Quick Recharge',desc:'Ghost Step cooldown -20% (stackable)',               apply: () => { _perkState.ghostStepCooldown=(_perkState.ghostStepCooldown||0)+0.20; } },
    gs_damage:       { cat:'ghost_step', label:'Assassin',      desc:'First shot after Ghost Step deals +80% damage',      apply: () => { _perkState.ghostStepAssassin=true; } },
    gs_speed:        { cat:'ghost_step', label:'Blur',          desc:'+40% move speed while Ghost Step is active',         apply: () => { _perkState.ghostStepSpeed=true; } },
    gs_extend_fire:  { cat:'ghost_step', label:'Quiet Kill',    desc:'Killing while cloaked extends cloak by 1s',          apply: () => { _perkState.ghostStepQuietKill=true; } },
    gs_reflect:      { cat:'ghost_step', label:'Phase Shift',   desc:'Ghost Step makes you intangible: bullets pass through you', apply: () => { _perkState.ghostStepPhase=true; } },
    gs_aoe:          { cat:'ghost_step', label:'Shadow Burst',  desc:'Exiting Ghost Step emits a 150px shockwave (60 dmg)', apply: () => { _perkState.ghostStepBurst=true; } },
    gs_double:       { cat:'ghost_step', label:'Double Ghost',  desc:'Ghost Step grants 2 charges per cooldown',            apply: () => { _perkState.ghostStepDouble=true; } },
    gs_heal:         { cat:'ghost_step', label:'Mend in Shadow',desc:'Regenerate 10 core HP during Ghost Step',            apply: () => { _perkState.ghostStepHeal=true; } },
    gs_sensor:       { cat:'ghost_step', label:'Threat Pulse',  desc:'While Ghost Step active, all enemies within 400px are highlighted through walls', apply: () => { _perkState.ghostStepSensor=true; } },
    gs_legendary:    { cat:'ghost_step', once:true, legendary:true, label:'Wraith Protocol',
        desc:'LEGENDARY — Ghost Step duration tripled. While active: you heal 5 HP/s, deal 2× damage, and enemies cannot detect you at any range.',
        apply: () => { _perkState.ghostStepWraith=true; } },

    // ══════════════════════════════════════════════════════════════
    // FORTRESS MODE PERKS (need 10 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    fm_extend:       { cat:'fortress_mode', label:'Extended Hold',desc:'Fortress Mode duration +1.5s (stackable)',          apply: () => { _perkState.fmExtend=(_perkState.fmExtend||0)+1500; } },
    fm_cooldown:     { cat:'fortress_mode', label:'Quick Reset',  desc:'Fortress Mode cooldown -20% (stackable)',            apply: () => { _perkState.fmCooldown=(_perkState.fmCooldown||0)+0.20; } },
    fm_dmg:          { cat:'fortress_mode', label:'Siege Damage', desc:'Fortress Mode also grants +25% damage',             apply: () => { _perkState.fmDmg=(_perkState.fmDmg||0)+0.25; } },
    fm_heal:         { cat:'fortress_mode', label:'Fortify',      desc:'Fortress Mode heal rate +50%: 7.5 HP/s instead of 5', apply: () => { _perkState.fmHeal=(_perkState.fmHeal||0)+0.50; } },
    fm_aoe:          { cat:'fortress_mode', label:'Retribution',  desc:'Fortress Mode: reflect 20% of incoming damage as explosion AoE', apply: () => { _perkState.fmAoe=true; } },
    fm_end_burst:    { cat:'fortress_mode', label:'Breakout',     desc:'Fortress Mode expiry releases a 250px shockwave (100 dmg)', apply: () => { _perkState.fmEndBurst=true; } },
    fm_immunity:     { cat:'fortress_mode', label:'Ironclad',     desc:'Fortress Mode grants immunity to DoT effects (fire, bleed, etc.)', apply: () => { _perkState.fmImmunity=true; } },
    fm_speed:        { cat:'fortress_mode', label:'Rapid Advance',desc:'Fortress Mode does not slow movement speed',         apply: () => { _perkState.fmSpeed=true; } },
    fm_kill_extend:  { cat:'fortress_mode', label:'Last Stand',   desc:'Kills during Fortress Mode extend duration by 0.5s',  apply: () => { _perkState.fmKillExtend=true; } },
    fm_shield_regen: { cat:'fortress_mode', label:'Bulwark',      desc:'Fortress Mode regenerates 15 shield HP/s while active', apply: () => { _perkState.fmShieldRegen=true; } },
    fm_legendary:    { cat:'fortress_mode', once:true, legendary:true, label:'Colossus Mode',
        desc:'LEGENDARY — Fortress Mode duration doubled. While active: full invincibility, +50% damage, and you emit a 200px suppression aura that slows enemies 60%.',
        apply: () => { _perkState.fmColossus=true; } },

    // ══════════════════════════════════════════════════════════════
    // SHIELD PERKS (need 9 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    shield_regen_boost:{ cat:'shield', label:'Fast Regen',  desc:'Shield regen rate +25% (stackable)',                     apply: () => { _perkState.shieldRegenBoost=(_perkState.shieldRegenBoost||0)+0.25; } },
    shield_cap:      { cat:'shield', label:'Expanded Cell', desc:'Shield max HP +25 (stackable)',                           apply: () => { _perkState.shieldCap=(_perkState.shieldCap||0)+25; } },
    shield_absorb:   { cat:'shield', label:'Dense Matrix',  desc:'Shield absorbs +10% more damage per hit (stackable)',     apply: () => { _perkState.shieldAbsorb=(_perkState.shieldAbsorb||0)+0.10; } },
    shield_delay:    { cat:'shield', label:'Hardened Cell', desc:'Shield regen delay -1s (stackable)',                      apply: () => { _perkState.shieldDelay=(_perkState.shieldDelay||0)+1; } },
    shield_repulse:  { cat:'shield', label:'Repulsor',      desc:'When shield breaks, knock nearby enemies back 200px',     apply: () => { _perkState.shieldRepulse=true; } },
    shield_spike_dmg:{ cat:'shield', label:'Feedback',      desc:'Each hit absorbed by shield deals 10 damage back to attacker', apply: () => { _perkState.shieldSpikeDmg=true; } },
    shield_overcharge:{ cat:'shield', label:'Overcharge',   desc:'Shield can charge up to 150% of max HP (excess on top)',  apply: () => { _perkState.shieldOvercharge=true; } },
    shield_reform:   { cat:'shield', label:'Emergency Cell',desc:'Shield instantly reforms at 30% capacity after a 1s break (1 time per round)', apply: () => { _perkState.shieldReform=true; } },
    shield_speed:    { cat:'shield', label:'Agile Shell',   desc:'Having shield above 50% grants +8% move speed',           apply: () => { _perkState.shieldSpeed=true; } },
    shield_legendary:{ cat:'shield', once:true, legendary:true, label:'Indestructible',
        desc:'LEGENDARY — Shield cannot be fully broken. Minimum 1 HP remains. Full regen activates after 2s without damage. +50% max shield HP.',
        apply: () => { _perkState.shieldIndestructible=true; player.maxShield=Math.round(player.maxShield*1.50); player.shield=player.maxShield; player._shieldRegenDelay=2; } },

    // ══════════════════════════════════════════════════════════════
    // CHASSIS: LIGHT (need 2 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    light_chain_kill:{ cat:'light', label:'Chain Kill',     desc:'Light: killing 3 enemies without taking damage grants 3s of invincibility', apply: () => { _perkState.lightChainKill=true; } },
    light_reflex:    { cat:'light', label:'Combat Reflex',  desc:'Light: dodging enemy fire (near miss) grants +25% damage for 2s', apply: () => { _perkState.lightReflex=true; } },
    light_legendary: { cat:'light', once:true, legendary:true, label:'Ghost Mech',
        desc:'LEGENDARY — Light: You are permanently semi-transparent to enemies (50% detection range). Kills extend this with a 2s full cloak.',
        apply: () => { _perkState.lightGhostMech=true; } },

    // ══════════════════════════════════════════════════════════════
    // CHASSIS: MEDIUM (need 3 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    medium_overload: { cat:'medium', label:'System Overload',desc:'Medium: Activating any mod grants +15% damage for 4s',  apply: () => { _perkState.mediumOverload=true; } },
    medium_salvage:  { cat:'medium', label:'Combat Salvage', desc:'Medium: kills have 25% chance to reduce active mod cooldown by 1s', apply: () => { _perkState.mediumSalvage=true; } },
    medium_multi_mod:{ cat:'medium', label:'Dual System',    desc:'Medium: two mods can be active simultaneously (second queued, auto-triggers)', apply: () => { _perkState.mediumMultiMod=true; } },
    medium_legendary:{ cat:'medium', once:true, legendary:true, label:'Command Unit',
        desc:'LEGENDARY — Medium: All mod cooldowns halved. Activating a mod also triggers a free Repair tick. Kills reduce all cooldowns by 1s.',
        apply: () => { _perkState.mediumCommand=true; } },

    // ══════════════════════════════════════════════════════════════
    // CHASSIS: HEAVY (need 2 reg + 1 leg)
    // ══════════════════════════════════════════════════════════════
    heavy_core_tank: { cat:'heavy', label:'Core Reinforced', desc:'Heavy: core HP +50. Taking lethal damage once per round instead goes to 1 HP', apply: () => { _perkState.heavyCoreTank=true; _perkState._heavyCoreTankUsed=false; } },
    heavy_rampage:   { cat:'heavy', label:'Rampage',         desc:'Heavy: each kill this round adds +3% damage (max +30%, resets each round)', apply: () => { _perkState.heavyRampage=true; } },
    heavy_legendary: { cat:'heavy', once:true, legendary:true, label:'Dreadnought',
        desc:'LEGENDARY — Heavy: +100 core HP, +80 arm/leg HP. Cannot be staggered. All incoming damage reduced by 25%. Rage mod cooldown halved.',
        apply: () => { _perkState.heavyDreadnought=true; } },

    // ══════════════════════════════════════════════════════════════
    // UNIVERSAL LEGENDARY (just need 1 leg)
    // ══════════════════════════════════════════════════════════════
    apex_predator:   { cat:'universal', once:true, legendary:true, label:'Apex Predator',
        desc:'LEGENDARY — After 5 kills without taking damage: all weapons deal 2× damage, all mods have no cooldown, and you regen 5 HP/s. Resets if you take damage.',
        apply: () => { _perkState.apexPredator=true; } },

    // ══════════════════════════════════════════════════════════════
    // LEG SYSTEM PERKS — one per unique leg
    // ══════════════════════════════════════════════════════════════
    // HYDRAULIC BOOST (need 9 reg + 1 leg)
    hb_speed2:       { cat:'hydraulic_boost', label:'Overdrive II',  desc:'Hydraulic Boost: +10% more move speed (stackable)', apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.10; } },
    hb_leg_armor:    { cat:'hydraulic_boost', label:'Leg Armor',     desc:'Hydraulic Boost: legs take 20% less damage (stackable)', apply: () => { _perkState.hbLegArmor=(_perkState.hbLegArmor||0)+0.20; } },
    hb_slam:         { cat:'hydraulic_boost', label:'Boosted Slam',  desc:'Hydraulic Boost: landing from any height deals 40 AoE damage', apply: () => { _perkState.hbSlam=true; } },
    hb_reload:       { cat:'hydraulic_boost', label:'Sprint Reload', desc:'Reload speed +15% while moving at full speed',       apply: () => { _perkState.hbReload=true; } },
    hb_evasion:      { cat:'hydraulic_boost', label:'Evasion',       desc:'Moving at full speed reduces incoming damage 8%',    apply: () => { _perkState.hbEvasion=true; } },
    hb_launch:       { cat:'hydraulic_boost', label:'Sprint Launch', desc:'Sprint start gives +80% speed burst for 0.3s',       apply: () => { _perkState.hbLaunch=true; } },
    hb_dmg_moving:   { cat:'hydraulic_boost', label:'Hit and Run',   desc:'+12% damage while moving at full speed',             apply: () => { _perkState.hbDmgMoving=true; } },
    hb_leg_regen:    { cat:'hydraulic_boost', label:'Self Repair',   desc:'Legs slowly regenerate: +2 HP/s when above 50% leg HP', apply: () => { _perkState.hbLegRegen=true; } },
    hb_trail:        { cat:'hydraulic_boost', label:'Slipstream',    desc:'Enemies near your movement trail are slowed 15%',    apply: () => { _perkState.hbTrail=true; } },
    hb_legendary:    { cat:'hydraulic_boost', once:true, legendary:true, label:'Mach Protocol',
        desc:'LEGENDARY — Hydraulic Boost speed doubled (+40% total). At full speed, you are untargetable by enemy ranged attacks for 1.5s after sprinting.',
        apply: () => { _perkState.hbMach=true; _perkState.speedMult=(_perkState.speedMult||1)*1.20; } },

    // MAG ANCHORS (need 9 reg + 1 leg)
    ma_dmg:          { cat:'mag_anchors', label:'Anchor Fire',    desc:'Mag Anchors stationary bonus: +10% more damage (stackable)', apply: () => { _perkState.maExtraDmg=(_perkState.maExtraDmg||0)+0.10; } },
    ma_dr:           { cat:'mag_anchors', label:'Anchor Shield',  desc:'Mag Anchors stationary bonus: +10% more DR (stackable)', apply: () => { _perkState.maExtraDr=(_perkState.maExtraDr||0)+0.10; } },
    ma_fast_lock:    { cat:'mag_anchors', label:'Instant Lock',   desc:'Mag Anchors bonus activates after 0.3s stationary instead of default', apply: () => { _perkState.maFastLock=true; } },
    ma_aoe_lock:     { cat:'mag_anchors', label:'Rooted Burst',   desc:'When you stop moving (anchoring), emit a 120px shockwave (50 dmg)', apply: () => { _perkState.maAoeLock=true; } },
    ma_reload:       { cat:'mag_anchors', label:'Planted Hands',  desc:'While anchored: reload speed +25%',                    apply: () => { _perkState.maReload=true; } },
    ma_regen:        { cat:'mag_anchors', label:'Anchor Regen',   desc:'While anchored: regenerate 3 core HP/s',               apply: () => { _perkState.maRegen=true; } },
    ma_crit:         { cat:'mag_anchors', label:'Target Lock',    desc:'While anchored: 15% crit chance on all shots',         apply: () => { _perkState.maCrit=true; } },
    ma_shield_regen: { cat:'mag_anchors', label:'Static Hold',    desc:'While anchored: shield regen rate doubled',             apply: () => { _perkState.maShieldRegen=true; } },
    ma_emp_aura:     { cat:'mag_anchors', label:'Ground Pulse',   desc:'Anchoring for 2s+ creates a 200px slow aura around you', apply: () => { _perkState.maEmpAura=true; } },
    ma_legendary:    { cat:'mag_anchors', once:true, legendary:true, label:'Immovable Object',
        desc:'LEGENDARY — While anchored: cannot be moved by any force, +40% DR, +40% damage, and passively regenerate 5 HP/s. Unanchoring releases a 250px shockwave.',
        apply: () => { _perkState.maImmovable=true; } },

    // MINE LAYER (need 9 reg + 1 leg)
    ml_dmg:          { cat:'mine_layer', label:'High Yield',     desc:'Mine damage +40% (stackable)',                        apply: () => { _perkState.mlDmg=(_perkState.mlDmg||0)+0.40; } },
    ml_rate:         { cat:'mine_layer', label:'Rapid Deploy',   desc:'Mine deploy interval -2s (stackable, min 2s)',         apply: () => { _perkState.mlRate=(_perkState.mlRate||0)+2000; } },
    ml_radius:       { cat:'mine_layer', label:'Wide Charge',    desc:'Mine explosion radius +30% (stackable)',               apply: () => { _perkState.mlRadius=(_perkState.mlRadius||0)+0.30; } },
    ml_sticky:       { cat:'mine_layer', label:'Magnetic',       desc:'Mines are attracted to passing enemies and stick to them', apply: () => { _perkState.mlSticky=true; } },
    ml_emp:          { cat:'mine_layer', label:'EMP Mine',       desc:'Mines stun enemies for 1.5s in addition to dealing damage', apply: () => { _perkState.mlEmp=true; } },
    ml_chain:        { cat:'mine_layer', label:'Chain Reaction', desc:'Mine explosions trigger adjacent mines within 120px',  apply: () => { _perkState.mlChain=true; } },
    ml_cloak:        { cat:'mine_layer', label:'Invisible Mine', desc:'Mines are invisible to enemies until triggered',       apply: () => { _perkState.mlCloak=true; } },
    ml_cluster2:     { cat:'mine_layer', label:'Cluster Mine',   desc:'Each mine spawns 2 submunitions on explosion (30 dmg each)', apply: () => { _perkState.mlCluster=true; } },
    ml_count:        { cat:'mine_layer', label:'Dense Field',    desc:'Deploy 2 mines at once per interval',                  apply: () => { _perkState.mlCount=true; } },
    ml_legendary:    { cat:'mine_layer', once:true, legendary:true, label:'Minefield Protocol',
        desc:'LEGENDARY — Deploy mines every 1s. Mines deal 200 damage, chain infinitely, and enemies killed by mines drop no aggro on you.',
        apply: () => { _perkState.mlLegendary=true; } },

    // AFTERLEG (need 9 reg + 1 leg)
    al_distance:     { cat:'afterleg', label:'Hyperdrive',       desc:'Afterleg: jump distance +30% (stackable)',             apply: () => { _perkState.alDistance=(_perkState.alDistance||0)+0.30; } },
    al_slam_dmg:     { cat:'afterleg', label:'Meteor Strike',    desc:'Afterleg landing shockwave +40 damage (stackable)',     apply: () => { _perkState.alSlamDmg=(_perkState.alSlamDmg||0)+40; } },
    al_slam_radius:  { cat:'afterleg', label:'Quake Zone',       desc:'Afterleg landing shockwave radius +50% (stackable)',    apply: () => { _perkState.alSlamRadius=(_perkState.alSlamRadius||0)+0.50; } },
    al_airtime:      { cat:'afterleg', label:'Extended Arc',     desc:'JUMP airtime +30% (stackable)',                        apply: () => { _perkState.alAirtime=(_perkState.alAirtime||0)+0.30; } },
    al_air_dmg:      { cat:'afterleg', label:'Aerial Assault',   desc:'While airborne: deal +25% damage',                    apply: () => { _perkState.alAirDmg=true; } },
    al_cooldown:     { cat:'afterleg', label:'Fast Recovery',    desc:'JUMP cooldown -20% (stackable)',                       apply: () => { _perkState.jumpCooldownMult=(_perkState.jumpCooldownMult||1)*0.80; } },
    al_emp_slam:     { cat:'afterleg', label:'EMP Landing',      desc:'Afterleg landing also stuns enemies in the shockwave radius for 1s', apply: () => { _perkState.alEmpSlam=true; } },
    al_double:       { cat:'afterleg', label:'Double Jump',      desc:'Afterleg: JUMP can be triggered twice before cooldown', apply: () => { _perkState.alDouble=true; } },
    al_fire_slam:    { cat:'afterleg', label:'Fire Landing',     desc:'Afterleg landing ignites all enemies in shockwave radius', apply: () => { _perkState.alFireSlam=true; } },
    al_legendary:    { cat:'afterleg', once:true, legendary:true, label:'Extinction Event',
        desc:'LEGENDARY — Afterleg landing creates a massive 300px shockwave (200 dmg). You are invincible during airtime. Landing auto-reloads both weapons.',
        apply: () => { _perkState.alExtinction=true; } },

    // FEATHERWEIGHT (need 10 reg + 1 leg)
    fw_speed:        { cat:'featherweight', label:'Ultralight',   desc:'Featherweight: +8% more move speed (stackable)',      apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.08; } },
    fw_reload:       { cat:'featherweight', label:'Swift Hands',  desc:'Featherweight: +8% more reload speed (stackable)',    apply: () => { _perkState.reloadMult=(_perkState.reloadMult||1)*0.92; } },
    fw_evasion:      { cat:'featherweight', label:'Feather Dodge',desc:'Featherweight: 10% chance to fully dodge any hit',    apply: () => { _perkState.fwEvasion=(_perkState.fwEvasion||0)+0.10; } },
    fw_kill_speed:   { cat:'featherweight', label:'Burst Sprint',  desc:'Featherweight kills grant +12% speed for 2s (stacks 3×)', apply: () => { _perkState.fwKillSpeed=true; } },
    fw_air:          { cat:'featherweight', label:'Low Profile',   desc:'While moving: 12% reduced incoming damage',          apply: () => { _perkState.fwAir=true; } },
    fw_dmg:          { cat:'featherweight', label:'Glass Strike',  desc:'Featherweight: +20% damage but take 10% more damage', apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.20; _perkState.fwGlass=true; } },
    fw_crit:         { cat:'featherweight', label:'Light Touch',   desc:'Featherweight: 12% crit chance on all shots',        apply: () => { _perkState.fwCrit=(_perkState.fwCrit||0)+0.12; } },
    fw_heal:         { cat:'featherweight', label:'Rush Heal',     desc:'Kills restore 4 HP while at full speed',             apply: () => { _perkState.fwHeal=true; } },
    fw_slide:        { cat:'featherweight', label:'Combat Slide',  desc:'Changing direction at speed briefly reduces your hitbox', apply: () => { _perkState.fwSlide=true; } },
    fw_adrenaline:   { cat:'featherweight', label:'Adrenaline',    desc:'Below 30% HP: +30% speed and +15% damage',           apply: () => { _perkState.fwAdrenaline=true; } },
    fw_legendary:    { cat:'featherweight', once:true, legendary:true, label:'Ghost Frame',
        desc:'LEGENDARY — Featherweight: you become untargetable while moving. Enemies can only fire at you when you are stationary.',
        apply: () => { _perkState.fwGhostFrame=true; } },

    // SPRINT BOOSTERS (need 10 reg + 1 leg)
    sb_cooldown:     { cat:'sprint_boosters', label:'Quick Tap',   desc:'Sprint Booster cooldown -1s (stackable)',            apply: () => { _perkState.sbCooldown=(_perkState.sbCooldown||0)+1000; } },
    sb_duration:     { cat:'sprint_boosters', label:'Extended Burn',desc:'Sprint burst duration +0.3s (stackable)',           apply: () => { _perkState.sbDuration=(_perkState.sbDuration||0)+300; } },
    sb_dmg:          { cat:'sprint_boosters', label:'Impact Run',   desc:'Dealing damage during sprint burst: +30% damage',   apply: () => { _perkState.sbDmg=true; } },
    sb_invuln:       { cat:'sprint_boosters', label:'Phase Rush',   desc:'Sprint burst grants 0.3s invincibility at start',   apply: () => { _perkState.sbInvuln=true; } },
    sb_trail:        { cat:'sprint_boosters', label:'Afterburn',    desc:'Sprint burst leaves a fire trail dealing 20 dmg/s for 1s', apply: () => { _perkState.sbTrail=true; } },
    sb_reload:       { cat:'sprint_boosters', label:'Sprint Reload',desc:'Sprint burst automatically reloads both weapons',   apply: () => { _perkState.sbReload=true; } },
    sb_charges:      { cat:'sprint_boosters', label:'Double Tap II',desc:'Sprint Booster gains 2 charges per cooldown',        apply: () => { _perkState.sbCharges=true; } },
    sb_kill_reset:   { cat:'sprint_boosters', label:'Blitz',        desc:'Kills reset Sprint Booster cooldown (30% chance)',  apply: () => { _perkState.sbKillReset=true; } },
    sb_stealth:      { cat:'sprint_boosters', label:'Shadow Run',   desc:'Sprint burst makes you invisible for its duration', apply: () => { _perkState.sbStealth=true; } },
    sb_aoe:          { cat:'sprint_boosters', label:'Shockwave Sprint',desc:'Sprint burst start and end each deal 40 dmg in 80px', apply: () => { _perkState.sbAoe=true; } },
    sb_legendary:    { cat:'sprint_boosters', once:true, legendary:true, label:'Mach Dash',
        desc:'LEGENDARY — Sprint burst speed quintupled. You are invincible during entire burst. Burst can be triggered every 1.5s.',
        apply: () => { _perkState.sbLegendary=true; } },

    // GHOST LEGS (need 10 reg + 1 leg)
    gl_burst_dmg:    { cat:'ghost_legs', label:'Pain Burst',      desc:'Ghost Legs damage burst: +20% damage for 1.5s after trigger', apply: () => { _perkState.glBurstDmg=true; } },
    gl_cooldown2:    { cat:'ghost_legs', label:'Hair Trigger',    desc:'Ghost Legs trigger more easily (reduced velocity threshold)', apply: () => { _perkState.glCooldown2=true; } },
    gl_shield_save:  { cat:'ghost_legs', label:'Shield Deflect',  desc:'Ghost Legs speed burst triggers a 0.5s shield regen', apply: () => { _perkState.glShieldSave=true; } },
    gl_chain2:       { cat:'ghost_legs', label:'Chain Dash',      desc:'Ghost Legs can trigger multiple times within 3s before cooldown', apply: () => { _perkState.glChain2=true; } },
    gl_counter:      { cat:'ghost_legs', label:'Counter Rush',    desc:'After Ghost Legs triggers: next shot deals +50% damage', apply: () => { _perkState.glCounter=true; } },
    gl_invuln:       { cat:'ghost_legs', label:'Blink',           desc:'Ghost Legs burst grants 0.4s invincibility',          apply: () => { _perkState.glInvuln=true; } },
    gl_speed2:       { cat:'ghost_legs', label:'Surge',           desc:'Ghost Legs burst speed increased +40%',               apply: () => { _perkState.glSpeed2=true; } },
    gl_heal:         { cat:'ghost_legs', label:'Resilient',       desc:'Ghost Legs trigger heals 8 HP',                      apply: () => { _perkState.glHeal=true; } },
    gl_emp2:         { cat:'ghost_legs', label:'Shock Step',      desc:'Ghost Legs burst stuns nearby enemies (80px) for 0.5s', apply: () => { _perkState.glEmp2=true; } },
    gl_extend2:      { cat:'ghost_legs', label:'Long Stride',     desc:'Ghost Legs burst duration +0.15s',                   apply: () => { _perkState.glExtend2=true; } },
    gl_legendary:    { cat:'ghost_legs', once:true, legendary:true, label:'Phantom Step',
        desc:'LEGENDARY — Ghost Legs activates automatically whenever you take any damage. Burst speed +100%. Grants 1s invincibility each trigger.',
        apply: () => { _perkState.glLegendary=true; } },

    // SILENT STEP (need 10 reg + 1 leg)
    ss_range:        { cat:'silent_step', label:'Shadow Range',   desc:'Silent Step: vision loss range +20% (stackable)',     apply: () => { _perkState.ssRange=(_perkState.ssRange||0)+0.20; } },
    ss_speed:        { cat:'silent_step', label:'Phantom Walk',   desc:'Silent Step: +8% move speed while active',           apply: () => { _perkState.ssSpeed=true; } },
    ss_full_cloak:   { cat:'silent_step', label:'Deep Shadow',    desc:'Silent Step: if moving slowly, you become fully invisible', apply: () => { _perkState.ssFullCloak=true; } },
    ss_strike:       { cat:'silent_step', label:'Ambush',         desc:'Silent Step: first shot from undetected deals +60% damage', apply: () => { _perkState.ssStrike=true; } },
    ss_duration:     { cat:'silent_step', label:'Linger',         desc:'Silent Step vision fade persists 1s after stopping',  apply: () => { _perkState.ssDuration=true; } },
    ss_reload:       { cat:'silent_step', label:'Shadow Prep',    desc:'Reload speed +20% while undetected',                 apply: () => { _perkState.ssReload=true; } },
    ss_heal:         { cat:'silent_step', label:'Predator Rest',  desc:'While fully undetected: slowly regen 2 HP/s',        apply: () => { _perkState.ssHeal=true; } },
    ss_aoe:          { cat:'silent_step', label:'Vanishing Act',  desc:'Entering undetected state emits 80px AoE confusion burst (enemies lose you)', apply: () => { _perkState.ssAoe=true; } },
    ss_crit:         { cat:'silent_step', label:'Lethal Shadow',  desc:'While undetected: 20% crit chance on all shots',     apply: () => { _perkState.ssCrit=true; } },
    ss_chain:        { cat:'silent_step', label:'Kill Fade',      desc:'Silent Step: kills while undetected restore full stealth immediately', apply: () => { _perkState.ssChain=true; } },
    ss_legendary:    { cat:'silent_step', once:true, legendary:true, label:'Wraith Walk',
        desc:'LEGENDARY — Silent Step: you are permanently invisible while moving. Detection only possible when stationary. All shots from stealth deal 2× damage.',
        apply: () => { _perkState.ssLegendary=true; } },

    // REACTIVE DASH (need 10 reg + 1 leg)
    rd_cooldown:     { cat:'reactive_dash', label:'Quick Fuse',   desc:'Reactive Dash cooldown -1s (stackable)',              apply: () => { _perkState.rdCooldown=(_perkState.rdCooldown||0)+1000; } },
    rd_invuln:       { cat:'reactive_dash', label:'Phase Out',    desc:'Reactive Dash grants 0.5s invincibility',             apply: () => { _perkState.rdInvuln=true; } },
    rd_dmg:          { cat:'reactive_dash', label:'Counter Dash', desc:'Reactive Dash: next shot after dash deals +60% damage', apply: () => { _perkState.rdDmg=true; } },
    rd_distance:     { cat:'reactive_dash', label:'Long Dash',    desc:'Reactive Dash distance +40%',                        apply: () => { _perkState.rdDistance=true; } },
    rd_heal:         { cat:'reactive_dash', label:'Adrenaline Tap',desc:'Reactive Dash restores 10 HP',                      apply: () => { _perkState.rdHeal=true; } },
    rd_aoe:          { cat:'reactive_dash', label:'Shockwave Dash',desc:'Reactive Dash leaves a 100px shockwave at launch point (50 dmg)', apply: () => { _perkState.rdAoe=true; } },
    rd_charges:      { cat:'reactive_dash', label:'Multi-Dash',   desc:'Reactive Dash can trigger twice before cooldown',     apply: () => { _perkState.rdCharges=true; } },
    rd_cloak:        { cat:'reactive_dash', label:'Ghost Dash',   desc:'Reactive Dash grants 1.5s invisibility',             apply: () => { _perkState.rdCloak=true; } },
    rd_threshold:    { cat:'reactive_dash', label:'Hair Trigger',  desc:'Reactive Dash triggers at 75% leg HP instead of 50%', apply: () => { _perkState.rdThreshold=true; } },
    rd_reload:       { cat:'reactive_dash', label:'Emergency Reload',desc:'Reactive Dash also instantly reloads both weapons', apply: () => { _perkState.rdReload=true; } },
    rd_legendary:    { cat:'reactive_dash', once:true, legendary:true, label:'Reflex God',
        desc:'LEGENDARY — Reactive Dash triggers on ANY damage taken (not just leg damage). Grants 1s invincibility, +80% damage for 2s, and heals 20 HP.',
        apply: () => { _perkState.rdLegendary=true; } },

    // STABILIZER GYROS (need 10 reg + 1 leg)
    sg2_dmg:         { cat:'stabilizer_gyros', label:'Precision Core',desc:'Stabilizer Gyros stationary bonus: +10% more damage (stackable)', apply: () => { _perkState.sg2Dmg=(_perkState.sg2Dmg||0)+0.10; } },
    sg2_acc:         { cat:'stabilizer_gyros', label:'Laser Focus',  desc:'Stabilizer Gyros accuracy bonus: +10% more accuracy (stackable)', apply: () => { _perkState.sg2Acc=(_perkState.sg2Acc||0)+0.10; } },
    sg2_fast:        { cat:'stabilizer_gyros', label:'Quick Plant',  desc:'Stabilizer Gyros bonus activates after 0.5s instead of 1.5s', apply: () => { _perkState.sg2Fast=true; } },
    sg2_reload:      { cat:'stabilizer_gyros', label:'Planted Reload',desc:'Stabilizer Gyros: reload speed +30% while stationary', apply: () => { _perkState.sg2Reload=true; } },
    sg2_regen:       { cat:'stabilizer_gyros', label:'Brace Regen', desc:'While stationary: 3 HP/s core regeneration',        apply: () => { _perkState.sg2Regen=true; } },
    sg2_crit:        { cat:'stabilizer_gyros', label:'Deadeye',      desc:'While stationary: 20% crit chance on all shots',    apply: () => { _perkState.sg2Crit=true; } },
    sg2_shield:      { cat:'stabilizer_gyros', label:'Fortify',      desc:'While stationary: shield regen delay halved',       apply: () => { _perkState.sg2Shield=true; } },
    sg2_overwatch:   { cat:'stabilizer_gyros', label:'Overwatch',    desc:'While stationary 2s+: bullet speed +20% and range +30%', apply: () => { _perkState.sg2Overwatch=true; } },
    sg2_emp:         { cat:'stabilizer_gyros', label:'Seismic Lock', desc:'After 3s stationary, emit a 200px pulse that slows nearby enemies 30%', apply: () => { _perkState.sg2Emp=true; } },
    sg2_exit_burst:  { cat:'stabilizer_gyros', label:'Break Out',    desc:'Leaving stationary position releases a 150px burst (60 dmg)', apply: () => { _perkState.sg2ExitBurst=true; } },
    sg2_legendary:   { cat:'stabilizer_gyros', once:true, legendary:true, label:'Fortress Sniper',
        desc:'LEGENDARY — While stationary: you deal 3× damage, take 50% less damage, and enemies have a 30% slower detection range against you.',
        apply: () => { _perkState.sg2Legendary=true; } },

    // ADAPTIVE STRIDE (need 10 reg + 1 leg)
    as_retreat_boost:{ cat:'adaptive_stride', label:'Tactical Retreat',desc:'Adaptive Stride retreat speed bonus +10% (stackable)', apply: () => { _perkState.asRetreat=(_perkState.asRetreat||0)+0.10; } },
    as_kite:         { cat:'adaptive_stride', label:'Kite Master',    desc:'Adaptive Stride: while retreating, take 10% less damage', apply: () => { _perkState.asKite=true; } },
    as_advance_dmg:  { cat:'adaptive_stride', label:'Aggressive Push',desc:'Adaptive Stride: advancing toward enemy grants +10% damage', apply: () => { _perkState.asAdvanceDmg=true; } },
    as_regen:        { cat:'adaptive_stride', label:'Motion Regen',   desc:'While moving at any speed: regen 2 HP/s',           apply: () => { _perkState.asRegen=true; } },
    as_burst:        { cat:'adaptive_stride', label:'Sudden Surge',   desc:'Changing direction emits a 0.2s speed burst (+60%)', apply: () => { _perkState.asBurst=true; } },
    as_stealth:      { cat:'adaptive_stride', label:'Shadow Stride',  desc:'While retreating: you are harder to target (-30% detection range)', apply: () => { _perkState.asStealth=true; } },
    as_reload:       { cat:'adaptive_stride', label:'Mobile Reload',  desc:'Reload speed +15% while moving',                    apply: () => { _perkState.asReload=true; } },
    as_counter:      { cat:'adaptive_stride', label:'Counter Step',   desc:'After retreating 150px, next shot deals +40% damage', apply: () => { _perkState.asCounter=true; } },
    as_heal:         { cat:'adaptive_stride', label:'Endurance Run',  desc:'Kills while retreating heal 10 HP',                 apply: () => { _perkState.asHeal=true; } },
    as_speed3:       { cat:'adaptive_stride', label:'Fluid Motion',   desc:'+10% total speed in all directions (stackable)',     apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.10; } },
    as_legendary:    { cat:'adaptive_stride', once:true, legendary:true, label:'Ghost Stride',
        desc:'LEGENDARY — Adaptive Stride: while retreating, you are fully invisible and immune to damage for up to 1.5s. Resets each engagement.',
        apply: () => { _perkState.asLegendary=true; } },

    // SEISMIC DAMPENER (need 10 reg + 1 leg)
    sd_leg_armor:    { cat:'seismic_dampener', label:'Shock Absorb',  desc:'Seismic Dampener: legs take 15% less damage (stackable)', apply: () => { _perkState.sdLegArmor=(_perkState.sdLegArmor||0)+0.15; } },
    sd_slam_boost:   { cat:'seismic_dampener', label:'Quake Amp',     desc:'Seismic Dampener: landing slam damage +50 (stackable)', apply: () => { _perkState.sdSlamBoost=(_perkState.sdSlamBoost||0)+50; } },
    sd_regen:        { cat:'seismic_dampener', label:'Bone Regen',    desc:'Seismic Dampener: legs regenerate 3 HP/s',           apply: () => { _perkState.sdRegen=true; } },
    sd_stagger:      { cat:'seismic_dampener', label:'Earth Stomp',   desc:'Seismic Dampener: heavy movement staggers nearby enemies', apply: () => { _perkState.sdStagger=true; } },
    sd_dr:           { cat:'seismic_dampener', label:'Dampened Frame',desc:'Seismic Dampener: total DR +8% (stackable)',           apply: () => { _perkState.sdDr=(_perkState.sdDr||0)+0.08; } },
    sd_slam_range:   { cat:'seismic_dampener', label:'Shockwave Ring',desc:'Seismic Dampener slam radius +40%',                  apply: () => { _perkState.sdSlamRange=true; } },
    sd_emp:          { cat:'seismic_dampener', label:'EMP Tremor',    desc:'Seismic Dampener slams stun enemies in radius for 1s', apply: () => { _perkState.sdEmp=true; } },
    sd_chain3:       { cat:'seismic_dampener', label:'Cascade',       desc:'Seismic Dampener slams chain to nearby enemies (80px, 30 dmg each)', apply: () => { _perkState.sdChain3=true; } },
    sd_speed:        { cat:'seismic_dampener', label:'Ground Surge',  desc:'After any landing slam: +20% speed for 1.5s',        apply: () => { _perkState.sdSpeed=true; } },
    sd_heal:         { cat:'seismic_dampener', label:'Impact Heal',   desc:'Landing slams heal 15 HP',                          apply: () => { _perkState.sdHeal=true; } },
    sd_legendary:    { cat:'seismic_dampener', once:true, legendary:true, label:'Tectonic Force',
        desc:'LEGENDARY — All movement creates continuous seismic waves. Enemies within 200px take 15 dmg/s. Slams deal 500 damage in 300px.',
        apply: () => { _perkState.sdLegendary=true; } },

    // ── REACTOR LEGS ───────────────────────────────────────────────
    rl2_rate:        { cat:'reactor_legs', label:'Efficient Burn',desc:'Reactor Legs: cooldown reduction per 300px reduced to 200px', apply: () => { _perkState.rl2Rate=true; } },
    rl2_amount:      { cat:'reactor_legs', label:'Power Surge',  desc:'Reactor Legs: cooldown reduction per trigger +0.5s (stackable)', apply: () => { _perkState.rl2Amount=(_perkState.rl2Amount||0)+0.5; } },
    rl2_passive:     { cat:'reactor_legs', label:'Idle Charge',  desc:'Reactor Legs also reduce cooldowns by 1s every 5s while stationary', apply: () => { _perkState.rl2Passive=true; } },
    rl2_speed:       { cat:'reactor_legs', label:'Reactor Boost',desc:'+10% move speed while Reactor Legs are active (stackable)', apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.10; } },
    rl2_dmg:         { cat:'reactor_legs', label:'Hot Core',     desc:'While moving: +10% damage (stackable)',               apply: () => { _perkState.rl2Dmg=(_perkState.rl2Dmg||0)+0.10; } },
    rl2_chain4:      { cat:'reactor_legs', label:'Chain Reaction',desc:'Reactor Legs cooldown reduction applies to all mods simultaneously', apply: () => { _perkState.rl2Chain4=true; } },
    rl2_heal:        { cat:'reactor_legs', label:'Kinetic Heal', desc:'Every 400px traveled heals 2 HP',                    apply: () => { _perkState.rl2Heal=true; } },
    rl2_shield:      { cat:'reactor_legs', label:'Motion Shield',desc:'Moving at full speed: shield regen delay -1s',         apply: () => { _perkState.rl2Shield=true; } },
    rl2_reload:      { cat:'reactor_legs', label:'Sprint Reload',desc:'Reactor Legs: reload speed +15% while moving',         apply: () => { _perkState.rl2Reload=true; } },
    rl2_aoe:         { cat:'reactor_legs', label:'Exhaust Trail',desc:'Reactor Legs leave a 60px slow trail for 1s behind you', apply: () => { _perkState.rl2Aoe=true; } },
    rl2_legendary:   { cat:'reactor_legs', once:true, legendary:true, label:'Perpetual Motion',
        desc:'LEGENDARY — Reactor Legs: moving removes all mod cooldowns at a rate of 2s per 100px traveled. All mods can activate simultaneously.',
        apply: () => { _perkState.rl2Legendary=true; } },

    // ── POWER STRIDE ───────────────────────────────────────────────
    ps_stack_cap:    { cat:'power_stride', label:'Max Capacity',  desc:'Power Stride: max speed stacks increased to 5× instead of 3×', apply: () => { _perkState.psStackCap=true; } },
    ps_stack_dmg:    { cat:'power_stride', label:'Momentum Damage',desc:'Power Stride: each stack also grants +3% damage',    apply: () => { _perkState.psStackDmg=(_perkState.psStackDmg||0)+0.03; } },
    ps_duration2:    { cat:'power_stride', label:'Sustained Pace',desc:'Power Stride stack duration +1s (stackable)',         apply: () => { _perkState.psDuration=(_perkState.psDuration||0)+1000; } },
    ps_kill_regen:   { cat:'power_stride', label:'Killing Pace',  desc:'Power Stride kills heal 5 HP per active stack',       apply: () => { _perkState.psKillRegen=true; } },
    ps_full_stack:   { cat:'power_stride', label:'Sprint Start',  desc:'Power Stride starts rounds at full 3 stacks',         apply: () => { _perkState.psFullStack=true; _perkState._powerStrideStacks = Math.min(3, (_perkState._powerStrideStacks||0) + 3); } },
    ps_shield:       { cat:'power_stride', label:'Speed Shield',  desc:'At max stacks: shield regen rate doubled',             apply: () => { _perkState.psShield=true; } },
    ps_burst:        { cat:'power_stride', label:'Overdrive',     desc:'At max stacks: grants a 0.5s speed burst (+50%) per kill', apply: () => { _perkState.psBurst=true; } },
    ps_crit:         { cat:'power_stride', label:'Rushing Strike',desc:'At max stacks: 20% crit chance on all shots',         apply: () => { _perkState.psCrit=true; } },
    ps_invuln:       { cat:'power_stride', label:'Unstoppable',   desc:'While at max stacks: 10% chance to fully dodge any hit', apply: () => { _perkState.psInvuln=true; } },
    ps_reload:       { cat:'power_stride', label:'Rhythm Reload', desc:'Each Power Stride stack reduces reload time 5%',      apply: () => { _perkState.psReload=true; } },
    ps_legendary:    { cat:'power_stride', once:true, legendary:true, label:'Velocity God',
        desc:'LEGENDARY — Power Stride stacks never expire and increase to 6×. At max stacks: you deal 2× damage and are immune to slow effects.',
        apply: () => { _perkState.psLegendary=true; } },

    // ── EVASION COILS ──────────────────────────────────────────────
    ec_dr:           { cat:'evasion_coils', label:'Coil Armor',    desc:'Evasion Coils: DR while moving increased +5% (stackable)', apply: () => { _perkState.ecDr=(_perkState.ecDr||0)+0.05; } },
    ec_speed:        { cat:'evasion_coils', label:'Coil Boost',    desc:'+8% move speed (stackable)',                         apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.08; } },
    ec_close_dr:     { cat:'evasion_coils', label:'Point Defense', desc:'Evasion Coils: close-range DR increased +10% (stackable)', apply: () => { _perkState.ecCloseDr=(_perkState.ecCloseDr||0)+0.10; } },
    ec_heal:         { cat:'evasion_coils', label:'Evasive Regen', desc:'While moving: regen 2 HP/s',                        apply: () => { _perkState.ecHeal=true; } },
    ec_burst:        { cat:'evasion_coils', label:'Dodge Burst',   desc:'Dropping below 30% HP triggers a +60% speed burst for 1.5s', apply: () => { _perkState.ecBurst=true; } },
    ec_dmg:          { cat:'evasion_coils', label:'Elusive Strike',desc:'While moving: +10% damage (stackable)',              apply: () => { _perkState.ecDmg=(_perkState.ecDmg||0)+0.10; } },
    ec_reload:       { cat:'evasion_coils', label:'On the Move',   desc:'Reload speed +12% while moving',                    apply: () => { _perkState.ecReload=true; } },
    ec_emp:          { cat:'evasion_coils', label:'Coil Discharge',desc:'Taking damage while moving: 20% chance to emit a 100px stun burst', apply: () => { _perkState.ecEmp=true; } },
    ec_stealth:      { cat:'evasion_coils', label:'Blur Frame',    desc:'While moving: detection range reduced 20%',          apply: () => { _perkState.ecStealth=true; } },
    ec_riposte:      { cat:'evasion_coils', label:'Riposte',       desc:'After any hit while moving: next shot deals +35% damage', apply: () => { _perkState.ecRiposte=true; } },
    ec_legendary:    { cat:'evasion_coils', once:true, legendary:true, label:'Untouchable',
        desc:'LEGENDARY — Evasion Coils: while moving, all incoming damage reduced by 50%. Stopping for more than 0.5s removes this bonus.',
        apply: () => { _perkState.ecLegendary=true; } },

    // ── TREMOR LEGS ────────────────────────────────────────────────
    tl_charge:       { cat:'tremor_legs', label:'Fast Charge',    desc:'Tremor Legs: stationary time to trigger reduced to 1s',   apply: () => { _perkState.tlCharge=true; } },
    tl_dmg:          { cat:'tremor_legs', label:'Heavy Tremor',   desc:'Tremor Legs: tremor damage +30 (stackable)',           apply: () => { _perkState.tlDmg=(_perkState.tlDmg||0)+30; } },
    tl_radius2:      { cat:'tremor_legs', label:'Wide Tremor',    desc:'Tremor Legs: tremor radius +40% (stackable)',          apply: () => { _perkState.tlRadius=(_perkState.tlRadius||0)+0.40; } },
    tl_slow:         { cat:'tremor_legs', label:'Quake',          desc:'Tremor Legs: tremor slows enemies 40% for 2s',         apply: () => { _perkState.tlSlow=true; } },
    tl_fire:         { cat:'tremor_legs', label:'Magma Tremor',   desc:'Tremor Legs: tremor ignites enemies',                  apply: () => { _perkState.tlFire=true; } },
    tl_emp2:         { cat:'tremor_legs', label:'EMP Tremor',     desc:'Tremor Legs: tremor stuns enemies for 1s',             apply: () => { _perkState.tlEmp=true; } },
    tl_chain5:       { cat:'tremor_legs', label:'Aftershock',     desc:'Tremor Legs: tremor triggers a second smaller tremor 1s later (50% dmg)', apply: () => { _perkState.tlChain5=true; } },
    tl_heal:         { cat:'tremor_legs', label:'Ground Surge',   desc:'Tremor Legs: each tremor restores 15 HP',             apply: () => { _perkState.tlHeal=true; } },
    tl_passive:      { cat:'tremor_legs', label:'Passive Rumble', desc:'While stationary: emit a passive slow aura (150px, 20% slow)',  apply: () => { _perkState.tlPassive=true; } },
    tl_cd:           { cat:'tremor_legs', label:'Restless',       desc:'Tremor Legs can trigger more frequently (-0.5s cooldown)', apply: () => { _perkState.tlCd=true; } },
    tl_legendary:    { cat:'tremor_legs', once:true, legendary:true, label:'Magnitude 10',
        desc:'LEGENDARY — Tremor Legs tremor damage 300, radius 300px. Every tremor also drops 3 mines. Tremor triggers every 0.5s while stationary.',
        apply: () => { _perkState.tlLegendary=true; } },

    // ── SIEGE STANCE ───────────────────────────────────────────────
    ss2_dmg:         { cat:'siege_stance', label:'Siege Fire',    desc:'Siege Stance: +10% more damage while stationary (stackable)', apply: () => { _perkState.ss2Dmg=(_perkState.ss2Dmg||0)+0.10; } },
    ss2_dr:          { cat:'siege_stance', label:'Siege Armor',   desc:'Siege Stance: +10% more DR while stationary (stackable)', apply: () => { _perkState.ss2Dr=(_perkState.ss2Dr||0)+0.10; } },
    ss2_fast_lock:   { cat:'siege_stance', label:'Instant Deploy',desc:'Siege Stance activates after 0.3s stationary instead of 1.5s', apply: () => { _perkState.ss2FastLock=true; } },
    ss2_regen:       { cat:'siege_stance', label:'Entrenched',    desc:'Siege Stance: 4 HP/s regeneration while stationary',  apply: () => { _perkState.ss2Regen=true; } },
    ss2_reload:      { cat:'siege_stance', label:'Planted Loader',desc:'Siege Stance: reload speed +30% while active',         apply: () => { _perkState.ss2Reload=true; } },
    ss2_crit:        { cat:'siege_stance', label:'Designated Fire',desc:'Siege Stance: 15% crit chance while stationary',      apply: () => { _perkState.ss2Crit=true; } },
    ss2_shield:      { cat:'siege_stance', label:'Shield Hold',   desc:'Siege Stance: shield regen delay halved while active', apply: () => { _perkState.ss2Shield=true; } },
    ss2_aoe:         { cat:'siege_stance', label:'Break Out',     desc:'Leaving Siege Stance releases a 180px shockwave (80 dmg)', apply: () => { _perkState.ss2Aoe=true; } },
    ss2_immune:      { cat:'siege_stance', label:'Unmovable',     desc:'Siege Stance: immune to knockback, pushes, and movement effects', apply: () => { _perkState.ss2Immune=true; } },
    ss2_emp2:        { cat:'siege_stance', label:'Seismic Hold',  desc:'After 2s in Siege Stance: emit 200px pulse that slows enemies 30%', apply: () => { _perkState.ss2Emp2=true; } },
    ss2_legendary:   { cat:'siege_stance', once:true, legendary:true, label:'Living Fortress',
        desc:'LEGENDARY — Siege Stance: infinite duration, +60% damage, +50% DR, and 8 HP/s regen. Enemies cannot stagger you under any condition.',
        apply: () => { _perkState.ss2Legendary=true; } },

    // ── IRONCLAD LEGS ──────────────────────────────────────────────
    il_bonus_hp:     { cat:'ironclad_legs', label:'Reinforced',   desc:'Ironclad Legs: +40 more leg HP (stackable)',           apply: () => { _perkState.ilBonusHp=(_perkState.ilBonusHp||0)+40; } },
    il_dr2:          { cat:'ironclad_legs', label:'Iron Shell',   desc:'Ironclad Legs: legs take 10% less damage (stackable)', apply: () => { _perkState.ilDr2=(_perkState.ilDr2||0)+0.10; } },
    il_core_dr:      { cat:'ironclad_legs', label:'Full Plate',   desc:'Ironclad Legs: +8% total body DR (stackable)',          apply: () => { _perkState.ilCoreDr=(_perkState.ilCoreDr||0)+0.08; } },
    il_regen:        { cat:'ironclad_legs', label:'Bone Knit',    desc:'Ironclad Legs: legs regenerate 3 HP/s',                apply: () => { _perkState.ilRegen=true; } },
    il_stomp:        { cat:'ironclad_legs', label:'Iron Stomp',   desc:'Movement creates minor shockwaves (60px, 15 dmg each step every 1s)', apply: () => { _perkState.ilStomp=true; } },
    il_reflect:      { cat:'ironclad_legs', label:'Leg Riposte',  desc:'Leg hits deal 20 damage back to attacker',             apply: () => { _perkState.ilReflect=true; } },
    il_speed:        { cat:'ironclad_legs', label:'Powered Frame',desc:'+5% speed (legs are more efficient, stackable)',       apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.05; } },
    il_unstoppable:  { cat:'ironclad_legs', label:'Unstoppable',  desc:'Ironclad Legs: slowing effects are reduced 50%',       apply: () => { _perkState.ilUnstoppable=true; } },
    il_charge:       { cat:'ironclad_legs', label:'Momentum',     desc:'Full-speed movement builds charge: stopping releases 60px shockwave (40 dmg)', apply: () => { _perkState.ilCharge=true; } },
    il_heal:         { cat:'ironclad_legs', label:'Combat Grit',  desc:'Kills restore 5 leg HP',                              apply: () => { _perkState.ilHeal=true; } },
    il_legendary:    { cat:'ironclad_legs', once:true, legendary:true, label:'Unbreakable',
        desc:'LEGENDARY — Ironclad Legs: legs cannot be destroyed. Leg HP doubles. While legs are above 50% HP, you are immune to all movement penalties.',
        apply: () => { _perkState.ilLegendary=true; } },

    // ── SUPPRESSOR LEGS ────────────────────────────────────────────
    sl_radius2:      { cat:'suppressor_legs', label:'Wide Aura',  desc:'Suppressor Legs aura radius +40px (stackable)',         apply: () => { _perkState.slRadius=(_perkState.slRadius||0)+40; } },
    sl_slow2:        { cat:'suppressor_legs', label:'Deep Slow',  desc:'Suppressor Legs: slow effect +8% stronger (stackable)', apply: () => { _perkState.slSlow=(_perkState.slSlow||0)+0.08; } },
    sl_fear:         { cat:'suppressor_legs', label:'Intimidate', desc:'Suppressor Legs: enemies in aura have -20% damage',     apply: () => { _perkState.slFear=true; } },
    sl_dmg:          { cat:'suppressor_legs', label:'Suppression Strike',desc:'+15% damage vs slowed enemies',                 apply: () => { _perkState.slDmg=true; } },
    sl_heal:         { cat:'suppressor_legs', label:'Drain',      desc:'Suppressor Legs: drain 2 HP/s from enemies in aura',   apply: () => { _perkState.slHeal=true; } },
    sl_emp3:         { cat:'suppressor_legs', label:'Pulse Shock',desc:'Every 5s: aura emits a stun pulse (0.5s stun)',        apply: () => { _perkState.slEmp3=true; } },
    sl_fire2:        { cat:'suppressor_legs', label:'Heated Aura',desc:'Suppressor Legs aura also ignites enemies within it',  apply: () => { _perkState.slFire2=true; } },
    sl_mark:         { cat:'suppressor_legs', label:'Target Lock', desc:'Enemies in aura are marked: +20% damage from all sources', apply: () => { _perkState.slMark=true; } },
    sl_reload:       { cat:'suppressor_legs', label:'Pressure Cooker',desc:'While enemies are in your aura: reload speed +20%', apply: () => { _perkState.slReload=true; } },
    sl_dmg2:         { cat:'suppressor_legs', label:'Suppressor Core',desc:'Suppressor Legs: your own damage +10% (stackable)', apply: () => { _perkState.dmgMult=(_perkState.dmgMult||1)*1.10; } },
    sl_legendary:    { cat:'suppressor_legs', once:true, legendary:true, label:'Dominion Field',
        desc:'LEGENDARY — Suppressor Legs aura tripled to 660px. Enemies in aura move 60% slower, deal 40% less damage, and you drain 5 HP/s from each of them.',
        apply: () => { _perkState.slLegendary=true; } },

    // ── WARLORD STRIDE ─────────────────────────────────────────────
    ws_threshold:    { cat:'warlord_stride', label:'Iron Threshold',desc:'Warlord Stride bonus activates at 70% leg HP instead of 50%', apply: () => { _perkState.wsThreshold=true; } },
    ws_dmg:          { cat:'warlord_stride', label:'Close Quarters',desc:'Warlord Stride: close range damage bonus +5% (stackable)', apply: () => { _perkState.wsDmg=(_perkState.wsDmg||0)+0.05; } },
    ws_speed2:       { cat:'warlord_stride', label:'War March',    desc:'Warlord Stride: speed bonus +4% (stackable)',          apply: () => { _perkState.wsSpeed=(_perkState.wsSpeed||0)+0.04; } },
    ws_heal:         { cat:'warlord_stride', label:'Combat Vitality',desc:'Warlord Stride: close-range kills heal 10 HP',       apply: () => { _perkState.wsHeal=true; } },
    ws_leg_regen:    { cat:'warlord_stride', label:'Warlord Repair',desc:'Warlord Stride: legs regenerate 2 HP/s',              apply: () => { _perkState.wsLegRegen=true; } },
    ws_aura:         { cat:'warlord_stride', label:'War Aura',     desc:'While Warlord Stride active: enemies within 150px slow 15%', apply: () => { _perkState.wsAura=true; } },
    ws_reflect:      { cat:'warlord_stride', label:'Iron Fist',    desc:'Close-range hits received deal 20 damage back to attacker', apply: () => { _perkState.wsReflect=true; } },
    ws_crit:         { cat:'warlord_stride', label:'Warlord Precision',desc:'While Warlord Stride active: 12% crit chance',     apply: () => { _perkState.wsCrit=true; } },
    ws_fear:         { cat:'warlord_stride', label:'Imposing',     desc:'While Warlord Stride active: enemies deal 10% less damage', apply: () => { _perkState.wsFear=true; } },
    ws_shield:       { cat:'warlord_stride', label:'Blood Shield', desc:'Close-range kills restore 20 shield HP',              apply: () => { _perkState.wsShield=true; } },
    ws_legendary:    { cat:'warlord_stride', once:true, legendary:true, label:'Apex Warlord',
        desc:'LEGENDARY — Warlord Stride: bonus never expires (even with legs below 50%). Close-range damage +40%, speed +20%. You cannot be staggered.',
        apply: () => { _perkState.wsLegendary=true; } },

    // ══════════════════════════════════════════════════════════════
    // AUG PERKS — one set per aug
    // ══════════════════════════════════════════════════════════════

    // ── TARGET PAINTER ─────────────────────────────────────────────
    tp_stack:        { cat:'target_painter', label:'Deep Mark',   desc:'Target Painter mark stacks: +10% more damage per application (stackable)', apply: () => { _perkState.tpStack=(_perkState.tpStack||0)+0.10; } },
    tp_duration:     { cat:'target_painter', label:'Long Mark',   desc:'Target Painter mark duration +2s (stackable)',         apply: () => { _perkState.tpDuration=(_perkState.tpDuration||0)+2; } },
    tp_spread:       { cat:'target_painter', label:'Area Mark',   desc:'Marking a target also marks all enemies within 120px', apply: () => { _perkState.tpSpread=true; } },
    tp_heal:         { cat:'target_painter', label:'Blood Trail', desc:'Killing a marked target heals 15 HP',                  apply: () => { _perkState.tpHeal=true; } },
    tp_expose:       { cat:'target_painter', label:'Expose',      desc:'Marked targets have their DR reduced by 15%',          apply: () => { _perkState.tpExpose=true; } },
    tp_slow:         { cat:'target_painter', label:'Hamstring',   desc:'Marked targets move 20% slower',                      apply: () => { _perkState.tpSlow=true; } },
    tp_chain6:       { cat:'target_painter', label:'Chain Mark',  desc:'Killing a marked target auto-marks the nearest enemy', apply: () => { _perkState.tpChain6=true; } },
    tp_multi:        { cat:'target_painter', label:'Multi-Tag',   desc:'Target Painter marks up to 3 enemies simultaneously',  apply: () => { _perkState.tpMulti=true; } },
    tp_detonate:     { cat:'target_painter', label:'Mark Detonate',desc:'Marked enemy death causes 80px explosion (60 dmg)',   apply: () => { _perkState.tpDetonate=true; } },
    tp_legendary:    { cat:'target_painter', once:true, legendary:true, label:'Hunter Protocol',
        desc:'LEGENDARY — All enemies are permanently marked. Marked damage bonus tripled to +60%. Killing any marked target reduces all mod cooldowns by 1s.',
        apply: () => { _perkState.tpLegendary=true; } },

    // ── THREAT ANALYZER ────────────────────────────────────────────
    ta_stack:        { cat:'threat_analyzer', label:'Deep Scan',  desc:'Threat Analyzer DR reduction +5% per stack (stackable)', apply: () => { _perkState.taStack=(_perkState.taStack||0)+0.05; } },
    ta_duration:     { cat:'threat_analyzer', label:'Long Scan',  desc:'Threat Analyzer DR debuff lasts 2s longer (stackable)', apply: () => { _perkState.taDuration=(_perkState.taDuration||0)+2; } },
    ta_spread2:      { cat:'threat_analyzer', label:'Scan Pulse', desc:'Hitting one enemy also applies debuff to all enemies within 150px', apply: () => { _perkState.taSpread2=true; } },
    ta_expose2:      { cat:'threat_analyzer', label:'Full Analysis',desc:'Analyzed targets also take +10% damage from all sources', apply: () => { _perkState.taExpose2=true; } },
    ta_slow2:        { cat:'threat_analyzer', label:'System Jam', desc:'Analyzed targets move 15% slower',                    apply: () => { _perkState.taSlow2=true; } },
    ta_dmg:          { cat:'threat_analyzer', label:'Exploit',    desc:'+15% damage vs analyzed targets (stackable)',          apply: () => { _perkState.taDmg=(_perkState.taDmg||0)+0.15; } },
    ta_detonate2:    { cat:'threat_analyzer', label:'Data Bomb',  desc:'Analyzed enemy death explodes for 80 dmg in 100px',    apply: () => { _perkState.taDetonate2=true; } },
    ta_heal:         { cat:'threat_analyzer', label:'Data Drain', desc:'Each hit on analyzed target restores 3 HP',            apply: () => { _perkState.taHeal=true; } },
    ta_chain7:       { cat:'threat_analyzer', label:'Cascade Scan',desc:'Killing analyzed target applies debuff to nearest 2 enemies', apply: () => { _perkState.taChain7=true; } },
    ta_legendary:    { cat:'threat_analyzer', once:true, legendary:true, label:'Total Analysis',
        desc:'LEGENDARY — Threat Analyzer applies to all enemies permanently. DR reduction tripled to 45%. Kill chain cascades infinitely at 50% effectiveness.',
        apply: () => { _perkState.taLegendary=true; } },

    // ── REACTIVE PLATING ───────────────────────────────────────────
    rp_decay:        { cat:'reactive_plating', label:'Durable Stack',desc:'Reactive Plating stacks decay after 5s instead of resetting on round end (in combat)', apply: () => { _perkState.rpDecay=true; } },
    rp_cap:          { cat:'reactive_plating', label:'More Plates', desc:'Reactive Plating max stacks: +2 (stackable)',         apply: () => { _perkState.rpCap=(_perkState.rpCap||0)+2; } },
    rp_val:          { cat:'reactive_plating', label:'Thick Plate', desc:'Reactive Plating DR per stack +3% (stackable)',       apply: () => { _perkState.rpVal=(_perkState.rpVal||0)+0.03; } },
    rp_regen:        { cat:'reactive_plating', label:'Plate Regen', desc:'At max stacks: regen 3 HP/s',                        apply: () => { _perkState.rpRegen=true; } },
    rp_reflect2:     { cat:'reactive_plating', label:'Ricochet',    desc:'At max stacks: 15% of incoming damage reflected back', apply: () => { _perkState.rpReflect2=true; } },
    rp_fast:         { cat:'reactive_plating', label:'Quick Stack', desc:'Reactive Plating reaches max stacks after 2 hits instead of 5', apply: () => { _perkState.rpFast=true; } },
    rp_shield:       { cat:'reactive_plating', label:'Shield Plate',desc:'Reactive Plating stacks also grant +8 shield HP each', apply: () => { _perkState.rpShield=true; } },
    rp_dmg:          { cat:'reactive_plating', label:'Battle Hardened',desc:'At max stacks: +10% damage (stackable)',          apply: () => { _perkState.rpDmg=(_perkState.rpDmg||0)+0.10; } },
    rp_lifesteal:    { cat:'reactive_plating', label:'Siphon Plating',desc:'At max stacks: kills restore 8 HP',                apply: () => { _perkState.rpLifesteal=true; } },
    rp_legendary:    { cat:'reactive_plating', once:true, legendary:true, label:'Living Armor',
        desc:'LEGENDARY — Reactive Plating stacks never reset. Max 10 stacks. At max: full DR (take 0 damage), heal 5 HP/s, and deal +20% damage.',
        apply: () => { _perkState.rpLegendary=true; } },

    // ── SCRAP CANNON ───────────────────────────────────────────────
    sc_dmg:          { cat:'scrap_cannon', label:'Heavy Shrapnel',desc:'Scrap Cannon explosion damage +30 (stackable)',         apply: () => { _perkState.scDmg=(_perkState.scDmg||0)+30; } },
    sc_radius2:      { cat:'scrap_cannon', label:'Wide Burst',    desc:'Scrap Cannon explosion radius +40% (stackable)',        apply: () => { _perkState.scRadius=(_perkState.scRadius||0)+0.40; } },
    sc_chain8:       { cat:'scrap_cannon', label:'Chain Scrap',   desc:'Scrap Cannon explosions trigger on non-limb kills too', apply: () => { _perkState.scChain8=true; } },
    sc_count:        { cat:'scrap_cannon', label:'Scatter Shot',  desc:'Scrap Cannon: explosion spawns 4 fragments (20 dmg each, random direction)', apply: () => { _perkState.scCount=true; } },
    sc_slow:         { cat:'scrap_cannon', label:'Scrap Shred',   desc:'Scrap Cannon explosion slows survivors 30% for 2s',    apply: () => { _perkState.scSlow=true; } },
    sc_ignite:       { cat:'scrap_cannon', label:'Burning Scrap', desc:'Scrap Cannon explosion ignites all enemies hit',        apply: () => { _perkState.scIgnite=true; } },
    sc_heal:         { cat:'scrap_cannon', label:'Salvage',       desc:'Scrap Cannon explosion heals you 10 HP',               apply: () => { _perkState.scHeal=true; } },
    sc_emp4:         { cat:'scrap_cannon', label:'EMP Shrapnel',  desc:'Scrap Cannon explosion stuns enemies for 0.8s',        apply: () => { _perkState.scEmp4=true; } },
    sc_passive:      { cat:'scrap_cannon', label:'Always Armed',  desc:'Scrap Cannon can trigger from non-explosive non-limb kills (any kill type)', apply: () => { _perkState.scPassive=true; } },
    sc_legendary:    { cat:'scrap_cannon', once:true, legendary:true, label:'Scrap God',
        desc:'LEGENDARY — Every kill triggers Scrap Cannon (not just limb kills). Explosion damage 200, radius 200px. Chains infinitely.',
        apply: () => { _perkState.scLegendary=true; } },

    // ══════════════════════════════════════════════════════════════
    // NEW PERKS — 100 additional perks for variety
    // ══════════════════════════════════════════════════════════════

    // ── UNIVERSAL OFFENSE (10 new) ───────────────────────────────
    armor_piercing:      { cat:'universal', label:'Armor Piercing',    desc:'Bullets ignore 10% of enemy damage reduction (stackable)',            apply: () => { _perkState.armorPierce=(_perkState.armorPierce||0)+0.10; } },
    double_tap:          { cat:'universal', label:'Double Tap',        desc:'10% chance to fire an extra bullet per shot (stackable)',              apply: () => { _perkState.doubleTap=(_perkState.doubleTap||0)+0.10; } },
    precision_strike:    { cat:'universal', label:'Precision Strike',  desc:'+25% damage to enemies above 80% HP (stackable)',                     apply: () => { _perkState.precisionStrike=(_perkState.precisionStrike||0)+0.25; } },
    momentum_kill:       { cat:'universal', label:'Momentum',          desc:'Each kill this round grants +3% damage (max +30%, resets each round)', apply: () => { _perkState.momentumKill=(_perkState.momentumKill||0)+1; } },
    ricochet_rounds:     { cat:'universal', label:'Ricochet Rounds',   desc:'Bullets that miss have 15% chance to ricochet toward nearest enemy',  apply: () => { _perkState.ricochetRounds=(_perkState.ricochetRounds||0)+0.15; } },
    vulnerability:       { cat:'universal', label:'Vulnerability',     desc:'Enemies hit 3 times in 2s take +20% damage for 4s',                   apply: () => { _perkState.vulnerability=true; } },
    finishing_blow:      { cat:'universal', label:'Finishing Blow',     desc:'+50% damage to enemies below 20% HP (stackable)',                     apply: () => { _perkState.finishingBlow=(_perkState.finishingBlow||0)+0.50; } },
    focus_fire:          { cat:'universal', label:'Focus Fire',        desc:'Hitting the same enemy 5 times in a row: next hit deals 2× damage',   apply: () => { _perkState.focusFire=true; } },
    combat_stim:         { cat:'universal', label:'Combat Stim',       desc:'After taking damage: +15% fire rate for 3s (stackable)',               apply: () => { _perkState.combatStim=(_perkState.combatStim||0)+0.15; } },
    executioner:         { cat:'universal', label:'Executioner',       desc:'Kills grant +5% crit chance for 5s (stacks up to 4×)',                apply: () => { _perkState.executioner=true; } },

    // ── UNIVERSAL SURVIVABILITY (8 new) ──────────────────────────
    nano_repair:         { cat:'universal', label:'Nano Repair',       desc:'Regenerate 2 HP/s to your most-damaged limb (stackable)',              apply: () => { _perkState.nanoRepair=(_perkState.nanoRepair||0)+2; } },
    emergency_shield:    { cat:'universal', label:'Emergency Shield',  desc:'Below 15% core HP: shield instantly restores to 50% (once per round)', apply: () => { _perkState.emergencyShield=true; } },
    damage_cap:          { cat:'universal', label:'Damage Cap',        desc:'No single hit can deal more than 40% of your max core HP',             apply: () => { _perkState.damageCap=true; } },
    reactive_hull:       { cat:'universal', label:'Reactive Hull',     desc:'After being hit 3 times in 2s: gain 20% DR for 3s',                   apply: () => { _perkState.reactiveHull=true; } },
    second_wind:         { cat:'universal', label:'Second Wind',       desc:'Surviving a lethal hit restores 25% core HP (once per round)',          apply: () => { _perkState.secondWind=true; } },
    hardened_systems:    { cat:'universal', label:'Hardened Systems',   desc:'Limbs take 10% less damage (stackable)',                              apply: () => { _perkState.hardenedSystems=(_perkState.hardenedSystems||0)+0.10; } },
    vital_strike:        { cat:'universal', label:'Vital Strike',      desc:'Crits restore 5 HP (stackable)',                                      apply: () => { _perkState.vitalStrike=(_perkState.vitalStrike||0)+5; } },
    energy_converter:    { cat:'universal', label:'Energy Converter',  desc:'10% of damage dealt is converted to shield HP (stackable)',            apply: () => { _perkState.energyConverter=(_perkState.energyConverter||0)+0.10; } },

    // ── UNIVERSAL UTILITY (7 new) ────────────────────────────────
    quick_swap:          { cat:'universal', label:'Quick Swap',        desc:'Switching weapons is instant and grants +20% damage for 1s',           apply: () => { _perkState.quickSwap=true; } },
    tactical_reload:     { cat:'universal', label:'Tactical Reload',   desc:'Kills during reload complete the reload instantly',                    apply: () => { _perkState.tacticalReload=true; } },
    combat_awareness:    { cat:'universal', label:'Combat Awareness',  desc:'Enemies within 200px are highlighted through cover',                   apply: () => { _perkState.combatAwareness=true; } },
    scrap_collector:     { cat:'universal', label:'Scrap Collector',   desc:'Every 10 kills: gain a random temporary buff for 15s',                 apply: () => { _perkState.scrapCollector=true; } },
    resource_recycler:   { cat:'universal', label:'Resource Recycler', desc:'Loot orbs grant 50% more benefit (stackable)',                         apply: () => { _perkState.resourceRecycler=(_perkState.resourceRecycler||0)+0.50; } },
    field_medic_univ:    { cat:'universal', label:'Field Medic',       desc:'Loot health orbs restore 50% more HP (stackable)',                     apply: () => { _perkState.fieldMedic=(_perkState.fieldMedic||0)+0.50; } },
    munitions_expert:    { cat:'universal', label:'Munitions Expert',  desc:'Explosive damage +15% (GL, RL, Siege) (stackable)',                    apply: () => { _perkState.munitionsExpert=(_perkState.munitionsExpert||0)+0.15; } },

    // ── UNIVERSAL TRADEOFFS (5 new) ──────────────────────────────
    reckless_charge:     { cat:'universal', once:true, label:'Reckless Charge',  desc:'+20% speed, +15% damage, but shield max HP halved',          apply: () => { _perkState.speedMult=(_perkState.speedMult||1)*1.20; _perkState.dmgMult=(_perkState.dmgMult||1)*1.15; player.maxShield=Math.round(player.maxShield*0.50); player.shield=Math.min(player.shield,player.maxShield); } },
    blood_pact:          { cat:'universal', once:true, label:'Blood Pact',       desc:'Kills restore 10 HP, but you lose 2 HP/s passively',         apply: () => { _perkState.bloodPact=true; } },
    overdrive_protocol:  { cat:'universal', once:true, label:'Overdrive Protocol',desc:'+50% fire rate, but reload times doubled',                  apply: () => { _perkState.overdriveProtocol=true; } },
    vampiric_rounds:     { cat:'universal', once:true, label:'Vampiric Rounds',  desc:'All damage dealt restores 3% as HP, but -15% max HP',        apply: () => { _perkState.vampiricRounds=true; Object.values(player.comp).forEach(c=>{c.max=Math.round(c.max*0.85);c.hp=Math.min(c.hp,c.max);}); } },
    kamikaze_protocol:   { cat:'universal', once:true, label:'Kamikaze Protocol',desc:'+60% explosion damage, but all explosions also damage you',  apply: () => { _perkState.kamikazeProtocol=true; _perkState.blastMult=(_perkState.blastMult||1)*1.60; } },

    // ── LIGHT CHASSIS (5 new) ────────────────────────────────────
    light_evasion_master:{ cat:'light', label:'Evasion Master',   desc:'Light: dodge chance +8% (stackable)',                                       apply: () => { _perkState.dodgeChance=(_perkState.dodgeChance||0)+0.08; } },
    light_blade_dancer:  { cat:'light', label:'Blade Dancer',     desc:'Light: moving at full speed grants +12% damage (stackable)',                 apply: () => { _perkState.lightBladeDancer=(_perkState.lightBladeDancer||0)+0.12; } },
    light_nimble:        { cat:'light', label:'Nimble',            desc:'Light: turn rate +30%, acceleration +25%',                                  apply: () => { _perkState.lightNimble=true; } },
    light_quick_draw:    { cat:'light', label:'Quick Draw',        desc:'Light: first shot after idle deals +40% damage',                            apply: () => { _perkState.lightQuickDraw=true; } },
    light_shadow_dance:  { cat:'light', label:'Shadow Dance',      desc:'Light: kills while moving grant 1s invisibility',                          apply: () => { _perkState.lightShadowDance=true; } },

    // ── MEDIUM CHASSIS (5 new) ───────────────────────────────────
    medium_versatile:    { cat:'medium', label:'Versatile',       desc:'Medium: all mod effects are 15% stronger (stackable)',                       apply: () => { _perkState.mediumVersatile=(_perkState.mediumVersatile||0)+0.15; } },
    medium_iron_resolve: { cat:'medium', label:'Iron Resolve',    desc:'Medium: taking lethal arm damage triggers 2s of +30% DR',                    apply: () => { _perkState.mediumIronResolve=true; } },
    medium_tactician:    { cat:'medium', label:'Tactician',        desc:'Medium: each different enemy type killed grants +5% damage (round)',         apply: () => { _perkState.mediumTactician=true; } },
    medium_steady_hand:  { cat:'medium', label:'Steady Hand',     desc:'Medium: accuracy improves 10% for each second you hold fire (max +30%)',     apply: () => { _perkState.mediumSteadyHand=true; } },
    medium_mod_synergy:  { cat:'medium', label:'Mod Synergy',      desc:'Medium: activating a mod grants +10% damage for 5s',                        apply: () => { _perkState.mediumModSynergy=true; } },

    // ── HEAVY CHASSIS (5 new) ────────────────────────────────────
    heavy_juggernaut:    { cat:'heavy', label:'Juggernaut',       desc:'Heavy: immune to all slow and stagger effects',                              apply: () => { _perkState.heavyJuggernaut=true; } },
    heavy_wrecking_ball: { cat:'heavy', label:'Wrecking Ball',    desc:'Heavy: contact with enemies deals 15 damage (stackable)',                     apply: () => { _perkState.groundPound=(_perkState.groundPound||0)+15; } },
    heavy_endurance:     { cat:'heavy', label:'Endurance',         desc:'Heavy: passive core regen +3 HP/s (stackable)',                              apply: () => { _perkState.autoRepair=(_perkState.autoRepair||0)+3; } },
    heavy_bunker_down:   { cat:'heavy', label:'Bunker Down',      desc:'Heavy: while standing still 2s+, take 25% less damage',                      apply: () => { _perkState.heavyBunkerDown=true; } },
    heavy_intimidate:    { cat:'heavy', label:'Intimidate',        desc:'Heavy: enemies within 250px deal 10% less damage',                           apply: () => { _perkState.heavyIntimidate=true; } },

    // ── SMG (5 new) ─────────────────────────────────────────────
    smg_dual_mags:       { cat:'smg', label:'Dual Magazines',    desc:'SMG: alternate between two mags — reloading one while firing the other',      apply: () => { _perkState.smgDualMags=true; } },
    smg_ricochet:        { cat:'smg', label:'Ricochet',           desc:'SMG bullets that hit cover bounce toward nearest enemy (15% chance)',         apply: () => { _perkState.smgRicochet=true; } },
    smg_adrenaline:      { cat:'smg', label:'Adrenaline Rush',   desc:'SMG: kills at close range (<120px) grant +20% speed for 2s',                 apply: () => { _perkState.smgAdrenaline=true; } },
    smg_armor_shred:     { cat:'smg', label:'Armor Shred',        desc:'SMG: sustained fire reduces enemy DR by 3% per hit (max 15%)',               apply: () => { _perkState.smgArmorShred=true; } },
    smg_overdose:        { cat:'smg', label:'Overdose',           desc:'SMG: when enemy is below 30% HP, fire rate doubles against them',            apply: () => { _perkState.smgOverdose=true; } },

    // ── MG (5 new) ──────────────────────────────────────────────
    mg_suppression:      { cat:'mg', label:'Suppression Fire',    desc:'MG: hits reduce enemy accuracy by 20% for 2s (stackable)',                   apply: () => { _perkState.mgSuppression=true; } },
    mg_bipod:            { cat:'mg', label:'Bipod',               desc:'MG: +20% damage and -30% spread while standing still',                       apply: () => { _perkState.mgBipod=true; } },
    mg_belt_feed:        { cat:'mg', label:'Extended Belt',       desc:'MG: magazine size doubled (fires twice as long before reload)',               apply: () => { _perkState.mgBeltFeed=true; } },
    mg_chain_fire:       { cat:'mg', label:'Chain Fire',           desc:'MG: each consecutive hit increases fire rate by 2% (max +20%)',              apply: () => { _perkState.mgChainFire=true; } },
    mg_explosive_tips:   { cat:'mg', label:'Explosive Tips',      desc:'MG: every 10th bullet creates a small explosion (40 dmg, 50px)',             apply: () => { _perkState.mgExplosiveTips=true; } },

    // ── SG (5 new) ──────────────────────────────────────────────
    sg_double_barrel:    { cat:'sg', label:'Double Barrel',       desc:'SG: fire two shots at once (uses 2 ammo), doubled pellets per trigger',      apply: () => { _perkState.sgDoubleBarrel=true; } },
    sg_incendiary:       { cat:'sg', label:'Incendiary Shell',    desc:'SG: every 3rd shot fires incendiary pellets that ignite on hit',             apply: () => { _perkState.sgIncendiary=true; } },
    sg_stun_round:       { cat:'sg', label:'Stun Round',          desc:'SG: first pellet of each shot stuns enemy for 0.5s',                        apply: () => { _perkState.sgStunRound=true; } },
    sg_combat_roll:      { cat:'sg', label:'Combat Roll',         desc:'SG: kills grant +30% move speed for 1.5s',                                  apply: () => { _perkState.sgCombatRoll=true; } },
    sg_shrapnel:         { cat:'sg', label:'Shrapnel Shell',      desc:'SG: pellets fragment on hit, dealing 40% splash to nearby enemies (80px)',   apply: () => { _perkState.sgShrapnel=true; } },

    // ── BR (5 new) ──────────────────────────────────────────────
    br_armor_crack:      { cat:'br', label:'Armor Crack',        desc:'BR: full burst on same target reduces their DR by 15% for 4s',               apply: () => { _perkState.brArmorCrack=true; } },
    br_recoil_comp:      { cat:'br', label:'Recoil Comp',        desc:'BR: burst spread reduced by 40%, tighter grouping',                          apply: () => { _perkState.brRecoilComp=true; } },
    br_kill_feed:        { cat:'br', label:'Kill Feed',           desc:'BR: kills instantly reload and grant +20% damage for next burst',            apply: () => { _perkState.brKillFeed=true; } },
    br_double_burst:     { cat:'br', label:'Double Burst',        desc:'BR: fires 2 bursts per trigger pull (second at -25% damage)',                apply: () => { _perkState.brDoubleBurst=true; } },
    br_crit_burst:       { cat:'br', label:'Critical Burst',      desc:'BR: if all bullets of a burst hit, the last deals 3× damage',               apply: () => { _perkState.brCritBurst=true; } },

    // ── HR (5 new) ──────────────────────────────────────────────
    hr_ricochet:         { cat:'hr', label:'Ricochet Round',     desc:'HR: bullets bounce to nearest enemy at 50% damage on kill',                   apply: () => { _perkState.hrRicochet=true; } },
    hr_piercing:         { cat:'hr', label:'Full Bore',          desc:'HR: bullets pierce through 1 additional enemy (stackable)',                    apply: () => { _perkState.hrPiercing=(_perkState.hrPiercing||0)+1; } },
    hr_concussive:       { cat:'hr', label:'Concussive Round',   desc:'HR: hits stun target for 0.8s',                                              apply: () => { _perkState.hrConcussive=true; } },
    hr_mark_target:      { cat:'hr', label:'Mark on Hit',        desc:'HR: hit targets take +20% damage from all sources for 3s',                    apply: () => { _perkState.hrMarkTarget=true; } },
    hr_quick_scope:      { cat:'hr', label:'Quick Scope',        desc:'HR: standing still 1s+ grants +30% damage (stackable)',                       apply: () => { _perkState.hrQuickScope=(_perkState.hrQuickScope||0)+0.30; } },

    // ── SR (4 new) ──────────────────────────────────────────────
    sr_piercing_rounds:  { cat:'sr', label:'Armor Piercer',      desc:'SR: ignores all enemy damage reduction',                                      apply: () => { _perkState.srArmorPiercer=true; } },
    sr_double_shot:      { cat:'sr', label:'Double Shot',        desc:'SR: 20% chance to fire a second bullet immediately (stackable)',               apply: () => { _perkState.srDoubleShot=(_perkState.srDoubleShot||0)+0.20; } },
    sr_tracer:           { cat:'sr', label:'Tracer Round',       desc:'SR: hit enemies are visible through cover for 5s',                            apply: () => { _perkState.srTracer=true; } },
    sr_killstreak:       { cat:'sr', label:'Headhunter',         desc:'SR: consecutive kills without missing: +25% damage per streak',               apply: () => { _perkState.srKillstreak=true; } },

    // ── GL (4 new) ──────────────────────────────────────────────
    gl_bouncing:         { cat:'gl', label:'Bouncing Grenade',   desc:'GL: grenades bounce once before detonating, extending range',                  apply: () => { _perkState.glBouncing=true; } },
    gl_toxic:            { cat:'gl', label:'Toxic Cloud',        desc:'GL: explosions leave a toxic cloud for 3s (5 dmg/tick)',                       apply: () => { _perkState.glToxic=true; } },
    gl_impact:           { cat:'gl', label:'Impact Fuse',        desc:'GL: grenades explode on first contact (no fuse timer)',                        apply: () => { _perkState.glImpact=true; } },
    gl_mag_grenade:      { cat:'gl', label:'Mag Grenade',        desc:'GL: grenades are magnetic and home toward nearby enemies',                     apply: () => { _perkState.glMagGrenade=true; } },

    // ── RL (3 new) ──────────────────────────────────────────────
    rl_guided:           { cat:'rl', label:'Guided Missile',     desc:'RL: rockets curve toward your crosshair after launch',                        apply: () => { _perkState.rlGuided=true; } },
    rl_split:            { cat:'rl', label:'Split Warhead',      desc:'RL: rocket splits into 3 smaller rockets at 50% travel distance',             apply: () => { _perkState.rlSplit=true; } },
    rl_napalm:           { cat:'rl', label:'Napalm Warhead',     desc:'RL: explosion leaves a burning ground patch for 4s (8 dmg/tick)',             apply: () => { _perkState.rlNapalm=true; } },

    // ── PLSM (3 new) ───────────────────────────────────────────
    plsm_gravity:        { cat:'plsm', label:'Gravity Well',    desc:'PLSM: on impact, pulls enemies inward 100px before exploding',                 apply: () => { _perkState.plsmGravity=true; } },
    plsm_split:          { cat:'plsm', label:'Split Orb',       desc:'PLSM: orb splits into 3 smaller orbs at 60% travel distance',                 apply: () => { _perkState.plsmSplit=true; } },
    plsm_drain:          { cat:'plsm', label:'Energy Drain',    desc:'PLSM: enemies hit lose 30% movement speed for 3s',                            apply: () => { _perkState.plsmDrain=true; } },

    // ── RAIL (3 new) ────────────────────────────────────────────
    rail_double:         { cat:'rail', label:'Double Beam',      desc:'RAIL: fires 2 beams in a narrow spread',                                      apply: () => { _perkState.railDouble=true; } },
    rail_chain_lightning:{ cat:'rail', label:'Chain Lightning',   desc:'RAIL: beam chains to 2 additional enemies near hit point (60% dmg)',          apply: () => { _perkState.railChainLightning=true; } },
    rail_charge_bonus:   { cat:'rail', label:'Deep Charge',      desc:'RAIL: waiting full charge time grants +40% damage',                           apply: () => { _perkState.railChargeBonus=true; } },

    // ── UNIVERSAL LEGENDARY (5 new) ──────────────────────────────
    universal_phoenix:   { cat:'universal', once:true, legendary:true, label:'Phoenix Protocol',
        desc:'LEGENDARY — On death, revive once per run at 50% HP with 3s invincibility. All enemies take 200 AoE damage on revival.',
        apply: () => { _perkState.phoenixProtocol=true; } },
    universal_overload:  { cat:'universal', once:true, legendary:true, label:'System Overload',
        desc:'LEGENDARY — Every 30s, your next shot deals 5× damage. Timer visible on HUD. Kills reduce timer by 3s.',
        apply: () => { _perkState.systemOverload=true; } },
    universal_nullifier: { cat:'universal', once:true, legendary:true, label:'Nullifier Field',
        desc:'LEGENDARY — Enemies within 300px have all buffs removed. Their fire rate, speed, and damage are reduced by 25%.',
        apply: () => { _perkState.nullifierField=true; } },
    universal_warlord:   { cat:'universal', once:true, legendary:true, label:'Warlord Ascendant',
        desc:'LEGENDARY — Every 5 kills grants a permanent +5% damage and +3% speed boost for the rest of the run (no cap).',
        apply: () => { _perkState.warlordAscendant=true; } },
    universal_adaptive:  { cat:'universal', once:true, legendary:true, label:'Adaptive Evolution',
        desc:'LEGENDARY — Each round survived permanently grants: +5% damage, +5% speed, +10 max core HP, +5% DR.',
        apply: () => { _perkState.adaptiveEvolution=true; } },

    // ── LIGHT LEGENDARY (1 new) ──────────────────────────────────
    light_spectre:       { cat:'light', once:true, legendary:true, label:'Spectre',
        desc:'LEGENDARY — Light: every kill creates a shadow clone that fights for 4s. Max 2 clones. Clones deal 50% of your damage.',
        apply: () => { _perkState.lightSpectre=true; } },

    // ── MEDIUM LEGENDARY (1 new) ─────────────────────────────────
    medium_apex_system:  { cat:'medium', once:true, legendary:true, label:'Apex System',
        desc:'LEGENDARY — Medium: mod cooldowns tick down 3× faster. Activating any mod triggers all other mods at 50% effectiveness.',
        apply: () => { _perkState.mediumApexSystem=true; } },

    // ── HEAVY LEGENDARY (1 new) ──────────────────────────────────
    heavy_titan:         { cat:'heavy', once:true, legendary:true, label:'Titan Protocol',
        desc:'LEGENDARY — Heavy: +200 core HP. All incoming damage reduced by 30%. You cannot be pushed, stunned, or slowed by any source.',
        apply: () => { _perkState.heavyTitan=true; } },

};

// ═══════════ PERK MENU ═══════════

// Module-level: track perk menu state for keyboard selection (keys 1-4)
let _currentPerkKeys = [];
let _currentPerkNextRound = 1;

function showPerkMenu(nextRound) {
    const menu = document.getElementById('perk-menu');
    if (!menu) return;

    const { chosen, slotLabels, slotColors } = selectPerks();

    // Store for keyboard handler
    _currentPerkKeys = chosen;
    _currentPerkNextRound = nextRound;

    const cards = document.getElementById('perk-cards');
    cards.innerHTML = '';
    chosen.forEach((key, idx) => {
        const p    = _perks[key];
        const card = document.createElement('div');
        card.className = 'perk-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Perk ${idx + 1}: ${p.label}`);
        const timesHeld = _pickedPerks.filter(k=>k===key).length;
        const stackBadge = timesHeld > 0 ? `<div class="perk-stack-badge">×${timesHeld+1}</div>` : '';
        const onceBadge      = (p.once && !p.legendary) ? `<div class="perk-once-badge">ONE-TIME</div>` : '';
        const legendaryBadge = p.legendary ? `<div class="perk-legendary-badge">✦ LEGENDARY</div>` : '';
        if (p.legendary) card.classList.add('legendary');
        card.innerHTML = `
            <div class="perk-slot-label" style="color:${p.legendary ? '#ffd700' : slotColors[idx]}">${p.legendary ? 'LEGENDARY' : slotLabels[idx]} <span style="color:rgba(255,255,255,0.3);font-size:9px;">[${idx+1}]</span></div>
            ${stackBadge}
            ${legendaryBadge}
            <div class="perk-card-title" style="${p.legendary ? 'color:#ffd700;' : ''}">${p.label}</div>
            <div class="perk-card-desc">${p.desc}</div>
            ${onceBadge}`;
        card.onclick = () => pickPerk(key, nextRound);
        card.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pickPerk(key, nextRound); } };
        cards.appendChild(card);
    });
    _lastOfferedPerks = [...chosen];
    menu.style.display = 'flex';
    const _psc = GAME?.scene?.scenes[0];
    if (_psc) { try { _psc.input.setDefaultCursor('default'); } catch(e){} }
    document.body.style.cursor = 'default';
}

function pickPerk(key, nextRound) {
    if (!_perks[key]) return;
    _pickedPerks.push(key);
    _perksEarned++;
    _perks[key].apply();
    updateBars(); updatePaperDoll();
    const menu = document.getElementById('perk-menu');
    if (menu) menu.style.display = 'none';
    _roundClearing = false;

    // If player has unequipped loot, show brief equip prompt before next round (campaign only)
    if (_gameMode === 'campaign' && _inventory.filter(i => i !== null).length > 0) {
        _showEquipPrompt(nextRound);
        return;
    }

    const _rsc = GAME?.scene?.scenes[0];
    if (_rsc) { try { _rsc.input.setDefaultCursor('none'); } catch(e){} }
    document.body.style.cursor = 'none';
    sndRoundStart();
    startRound(nextRound);
}

function _showEquipPrompt(nextRound) {
    let overlay = document.getElementById('equip-prompt-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'equip-prompt-overlay';
        overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:10000;background:rgba(3,6,10,0.92);font-family:"Courier New",monospace;flex-direction:column;align-items:center;justify-content:center;';
        overlay.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:14px;letter-spacing:4px;color:#ffd700;margin-bottom:8px;text-shadow:0 0 12px rgba(255,215,0,0.4);">LOOT AVAILABLE</div>
                <div id="equip-prompt-count" style="font-size:12px;letter-spacing:2px;color:rgba(200,210,220,0.6);margin-bottom:28px;"></div>
                <div style="display:flex;gap:16px;justify-content:center;">
                    <button id="equip-prompt-open" class="tw-btn tw-btn--gold">OPEN INVENTORY</button>
                    <button id="equip-prompt-skip" class="tw-btn">CONTINUE →</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    }

    const _invCount = _inventory.filter(i => i !== null).length;
    document.getElementById('equip-prompt-count').textContent = `${_invCount} item${_invCount > 1 ? 's' : ''} in backpack`;
    overlay.style.display = 'flex';
    // Ensure cursor is visible so the player can click the prompt buttons
    const _epScene = GAME?.scene?.scenes[0];
    if (_epScene) { try { _epScene.input.setDefaultCursor('default'); } catch(e){} }
    document.body.style.cursor = 'default';

    const openBtn = document.getElementById('equip-prompt-open');
    const skipBtn = document.getElementById('equip-prompt-skip');

    const _dismissAndStart = () => {
        overlay.style.display = 'none';
        const _rsc = GAME?.scene?.scenes[0];
        if (_rsc) { try { _rsc.input.setDefaultCursor('none'); } catch(e){} }
        document.body.style.cursor = 'none';
        sndRoundStart();
        startRound(nextRound);
    };

    // Clone buttons to remove old listeners
    const newOpen = openBtn.cloneNode(true);
    const newSkip = skipBtn.cloneNode(true);
    openBtn.parentNode.replaceChild(newOpen, openBtn);
    skipBtn.parentNode.replaceChild(newSkip, skipBtn);

    newOpen.addEventListener('click', () => {
        overlay.style.display = 'none';
        // Store callback so inventory close triggers round start
        window._equipPromptCallback = _dismissAndStart;
        toggleInventory();
    });
    newSkip.addEventListener('click', _dismissAndStart);
}

// ═══════════ PERK SELECTION HELPERS ═══════════

function _pickFrom(pool, n, exclude) {
    const avail = pool.filter(k => {
        if (exclude.includes(k)) return false;
        if (_perks[k].once && _pickedPerks.includes(k)) return false;
        if (_lastOfferedPerks.includes(k)) return false;
        return true;
    });
    const fallback = pool.filter(k => {
        if (exclude.includes(k)) return false;
        if (_perks[k].once && _pickedPerks.includes(k)) return false;
        return true;
    });
    const src2 = avail.length >= n ? avail : fallback;
    return [...src2].sort(() => Math.random() - 0.5).slice(0, n);
}

// ═══════════ PERK LIFECYCLE HELPERS ═══════════

function _tickPerkExpiries(time) {
    // Hit-and-run speed bonus expiry
    if (_perkState._hitRunActive && time > _perkState._hitRunTimer) {
        _perkState._hitRunActive = false;
        _perkState.speedMult = Math.max(1, _perkState.speedMult / (1 + 0.25 * _perkState.hitRunStacks));
    }
    // Adaptive armor DR bonus expiry
    if (_perkState._adaptiveActive && time > _perkState._adaptiveTimer) {
        _perkState._adaptiveActive = false;
        _perkState.fortress = Math.max(0, _perkState.fortress - 0.10 * _perkState.adaptiveArmor);
    }
    // Battle rhythm bonus (recalculate each frame based on kills this round)
    if (_perkState.battleRhythm > 0) {
        _perkState._battleRhythmBonus = Math.floor(_roundKills / 5) * 0.10 * _perkState.battleRhythm;
    }
    // Flicker invincibility expiry
    if (_perkState._flickerActive && time > _perkState._flickerLastTrigger + 300) {
        _perkState._flickerActive = false;
    }
}

function selectPerks() {
    const ch  = loadout.chassis;
    const mod = loadout.cpu || 'none';
    const wL  = loadout.L   || 'none';
    const wR  = loadout.R   || 'none';
    const aug = loadout.aug || 'none';
    const leg = loadout.leg || 'none';
    const shld = loadout.shld || 'none';

    // Build per-pool filtered lists
    const universalPool = Object.keys(_perks).filter(k => _perks[k].cat === 'universal');
    const chassisPool   = Object.keys(_perks).filter(k => _perks[k].cat === ch);
    // Slot 4: weapon/mod/aug/leg/shield specific
    const specCats = [wL, wR, mod, aug, leg].filter(c => c && c !== 'none');
    // Shield perks use cat:'shield' but loadout.shld is e.g. 'light_shield' — map it
    if (shld && shld !== 'none') specCats.push('shield');
    const weaponPool = Object.keys(_perks).filter(k => specCats.includes(_perks[k].cat));

    const chosen = [];
    // Slots 1 & 2 — universal
    chosen.push(..._pickFrom(universalPool, 2, chosen));
    // Slot 3 — chassis (fallback to universal)
    chosen.push(...(chassisPool.length > 0 ? _pickFrom(chassisPool, 1, chosen) : _pickFrom(universalPool, 1, chosen)));

    // Slot 4 — legendary if eligible (round 5+, 2+ same-cat perks, 10% chance)
    const legendaryKeys = Object.keys(_perks).filter(k => _perks[k].legendary && !_pickedPerks.includes(k));
    const eligibleLeg   = legendaryKeys.filter(k => {
        const cat      = _perks[k].cat;
        const catCount = _pickedPerks.filter(pk => _perks[pk]?.cat === cat).length;
        return catCount >= 2 && _round >= 5;
    });
    const offerLegendary = eligibleLeg.length > 0 && Math.random() < 0.10 && !chosen.includes(eligibleLeg[0]);
    if (offerLegendary) {
        chosen.push(eligibleLeg[Math.floor(Math.random() * eligibleLeg.length)]);
    } else {
        chosen.push(...(weaponPool.length > 0 ? _pickFrom(weaponPool, 1, chosen) : _pickFrom(universalPool, 1, chosen)));
    }

    const specLabel  = specCats.length > 0 ? specCats[specCats.length-1].replace(/_/g,' ').toUpperCase() : 'WEAPON / CORE';
    const slotLabels = ['UNIVERSAL', 'UNIVERSAL', ch.toUpperCase(), specLabel];
    const slotColors = ['#00ffff', '#00ffff', ch==='light'?'#88ff88':ch==='medium'?'#ffcc00':'#ff8844', '#cc88ff'];

    return { chosen, slotLabels, slotColors };
}

function resetRoundPerks() {
    // Resilience: restore destroyed arms at 50% HP
    if (_perkState.resilience && player?.comp) {
        if (_lArmDestroyed) { _lArmDestroyed = false; loadout.L = _savedL || loadout.L || 'none'; player.comp.lArm.hp = Math.round(player.comp.lArm.max*0.5); updateHUD(); }
        if (_rArmDestroyed) { _rArmDestroyed = false; loadout.R = _savedR || loadout.R || 'none'; player.comp.rArm.hp = Math.round(player.comp.rArm.max*0.5); updateHUD(); }
    }
    // One-shot activation flags
    if (_perkState.ironWill)      _perkState._ironWillUsed     = false;
    if (_perkState.glassStep)     _perkState._glassStepUsed    = false;
    if (_perkState.heavyCoreTank) _perkState._heavyCoreTankUsed = false;
    if (_perkState.snapCharge)  _perkState._snapChargeReady = true;
    if (_perkState.jumpCharges > 1) _perkState._jumpChargesLeft = _perkState.jumpCharges;
    // Kill-based counters
    _perkState._killStreakCount   = 0;
    _perkState._killStreakActive  = false;
    _perkState._pressureTarget   = null;
    _perkState._pressureStacks   = 0;
    _perkState.overwatchKills     = 0;
    // Activation-state flags
    _perkState._neuralAccelActive  = false;
    _perkState._phantomActive      = false;
    _perkState._phantomShotReady   = false;
    _perkState._capacitorCharge    = 0;
    _perkState._capacitorReady     = false;
    // Autonomous Unit: destroy existing auto-drone before next round
    if (_perkState.autonomousUnit) {
        try {
            if (_perkState._autoDroneRef?.active) _perkState._autoDroneRef.destroy();
        } catch(e) {}
        _perkState._autoDroneActive = false;
        _perkState._autoDroneRef    = null;
        if (_perkState._autoDroneRespawnTimer) {
            _perkState._autoDroneRespawnTimer.remove?.();
            _perkState._autoDroneRespawnTimer = null;
        }
    }
}

function _resetPerkState() {
    return { dmgMult:1, reloadMult:1, speedMult:1, shieldRegenMult:1, lootMult:1, ammoCache:false, noShieldRegen:false, jumpDisabled:false, critChance:0, blastMult:1, armorPierce:0, adrenalineStacks:0, autoRepair:0, lastStand:false, fieldEngineer:0, empResist:0, commanderBounty:false, dodgeChance:0, hitRunStacks:0, jumpCdMult:1, flicker:false, predatorStacks:0, suppressStacks:0, battleRhythm:0, resilience:false, adaptiveArmor:0, fortress:0, immovable:false, siegeMode:0, ironWill:false, reactorCore:false, perfectAccuracy:false, pointBlank:0, coldShot:false, coldShotReady:false, clusterRounds:false, afterburn:false, reactiveShield:0, rageDurMult:1, jumpSpeedMult:1, chainEmp:false, plsmMult:1, _hitRunActive:false, _hitRunTimer:0, _flickerActive:false, _flickerLastTrigger:0, _adaptiveActive:false, _adaptiveTimer:0, _predatorCharged:false, _suppressedEnemies:new Map(), _ironWillUsed:false, _battleRhythmBonus:0, targetPainter:false, _paintedEnemy:null, threatAnalyzer:false, overclockCpu:false, reactivePlating:false, _reactivePlatingStacks:0, scrapCannon:false, railChargeActive:false, _railChargeStart:0, legSystemActive:true, mineLayerTimer:0, _magAnchorsActive:false, _droneActive:false, fthRange:0, fthDmg:0, hollowPoint:0, threatScanner:0, opportunist:0, pressureSystem:0, _pressureTarget:null, _pressureStacks:0, resonance:0, overchargeRounds:0, _shotCounter:0, incendiary:0, chainReaction:0, killStreak:0, _killStreakCount:0, _killStreakActive:false, glassStep:false, _glassStepUsed:false, scrapShield:0, titanCore:false, sgFlechette:0, srBreath:0, brMarksman:0, _mgShotCount:0, mgTracer:false, salvageProtocol:false, afterimage:false, barrierSpike:false, groundPound:0, empAmplifier:false, jumpSlam:0, rlTandem:false, plsmChain:false, rageFeed:0, _rageEndTime:0, scorchedEarth:false, reinforcedCore:false, anchorFortress:false, afterlegBoost:false, painterDuration:0, analyzerDepth:false, platingMaxStacks:5, scrapChain:false, gyroCounter:false, droneUplink:0, droneCdMult:1, neuralLink:0, swarmLogic:0, droneArmor:0, overwatchStacks:0, overwatchKills:0, autonomousUnit:false, _autoDroneActive:false, _autoDroneRespawnTimer:null, ghostJump:false, kineticLanding:0, jumpCharges:1, _jumpChargesLeft:1, snapCharge:false, _snapChargeReady:false, tungstenCore:false, piercingMomentum:0, oneShot:false, penetrator:0, phantomProtocol:false, _phantomActive:false, _phantomTimer:null, inferno:false, meltArmor:0, pressureSpray:false, napalmStrike:false, thornsProtocol:0, capacitorArmor:0, _capacitorCharge:0, meltdownCore:false, fthNapalm:false, lightSpectre:false, lightGhostMech:false, mediumCommand:false, mediumApexSystem:false, heavyDreadnought:false, heavyTitan:false, adaptiveEvolution:false, heavyCoreTank:false, _heavyCoreTankUsed:false, heavyRampage:false, mediumOverload:false, mediumSalvage:false, mediumMultiMod:false, apexPredator:false, _apexPredatorActive:false };
}

