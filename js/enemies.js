// ═══════════ ENEMY SPAWNING ═══════════

function randomEnemyLoadout() {
    const rnd = Phaser.Math.RND;
    const chassis = rnd.pick(['light', 'medium', 'heavy']);

    // ── Chassis-locked weapon pools (mirrors player restrictions) ──
    const LIGHT_WEAPONS  = ['smg','mg','sg','br','fth','plsm'];
    const MEDIUM_WEAPONS = ['mg','sg','br','hr','fth','sr','gl','plsm','siege','chain'];
    const HEAVY_WEAPONS  = ['hr','sg','gl','rl','fth','plsm','siege','chain','rail'];

    const weaponPool = chassis === 'light' ? LIGHT_WEAPONS
                     : chassis === 'medium' ? MEDIUM_WEAPONS
                     : HEAVY_WEAPONS;

    // Two-handed only for medium/heavy
    const twoHandPool = chassis !== 'light' ? ['siege','chain'] : [];
    const use2H = twoHandPool.length > 0 && Math.random() < 0.10;

    let L = 'none', R = 'none';
    if (use2H) {
        L = R = rnd.pick(twoHandPool);
    } else {
        L = rnd.pick(weaponPool);
        if (Math.random() < 0.75) {
            if (Math.random() < 0.20) {
                R = L; // dual wield same
            } else {
                R = rnd.pick(weaponPool);
            }
        }
        // Light: no dual wield (mirror player restriction)
        if (chassis === 'light' && L === R) R = 'none';
    }

    // ── Chassis-locked mod pools ──
    const LIGHT_MODS  = ['jump','decoy','barrier','emp','ghost_step'];
    const MEDIUM_MODS = ['barrier','repair','missile','atk_drone','overclock_burst'];
    const HEAVY_MODS  = ['rage','repair','atk_drone','missile','fortress_mode'];

    const modPool = chassis === 'light' ? LIGHT_MODS
                  : chassis === 'medium' ? MEDIUM_MODS
                  : HEAVY_MODS;
    const mod = Math.random() < 0.75 ? rnd.pick(modPool) : 'none';

    // ── Chassis-locked shield pools ──
    const LIGHT_SHIELDS  = ['micro_shield','flicker_shield','light_shield','phase_shield','smoke_burst'];
    const MEDIUM_SHIELDS = ['standard_shield','reactive_shield','mirror_shield','adaptive_shield','counter_shield'];
    const HEAVY_SHIELDS  = ['heavy_shield','fortress_shield','pulse_shield','layered_shield','overcharge_shld'];

    const shieldPool = chassis === 'light' ? LIGHT_SHIELDS
                     : chassis === 'medium' ? MEDIUM_SHIELDS
                     : HEAVY_SHIELDS;
    const shld = Math.random() < 0.60 ? rnd.pick(shieldPool) : 'none';

    // ── Chassis-locked leg pools ──
    const LIGHT_LEGS  = ['hydraulic_boost','gyro_stabilizer','afterleg','sprint_coils','stealth_treads'];
    const MEDIUM_LEGS = ['hydraulic_boost','gyro_stabilizer','mag_anchors','mine_layer','assault_stride'];
    const HEAVY_LEGS  = ['gyro_stabilizer','mag_anchors','mine_layer','fortress_treads','siege_stance'];

    const legPool = chassis === 'light' ? LIGHT_LEGS
                  : chassis === 'medium' ? MEDIUM_LEGS
                  : HEAVY_LEGS;
    // Filter to only actually defined leg systems
    const validLegs = legPool.filter(l => LEG_SYSTEMS[l]);
    const leg = validLegs.length > 0 && Math.random() < 0.65 ? rnd.pick(validLegs) : 'none';

    // ── Chassis-locked aug pools ──
    const LIGHT_AUGS  = ['reflex_booster','overclock_cpu','threat_scanner','stealth_coating','burst_capacitor'];
    const MEDIUM_AUGS = ['target_painter','threat_analyzer','overclock_cpu','reactive_plating','scrap_cannon'];
    const HEAVY_AUGS  = ['reactive_plating','scrap_cannon','threat_analyzer','ironclad_core','colossus_plating'];

    const augPool = chassis === 'light' ? LIGHT_AUGS
                  : chassis === 'medium' ? MEDIUM_AUGS
                  : HEAVY_AUGS;
    const validAugs = augPool.filter(a => CHASSIS_AUGS[chassis]?.has(a));
    const aug = validAugs.length > 0 && Math.random() < 0.55 ? rnd.pick(validAugs) : 'none';

    return { chassis, L, R, mod, shld, leg, aug };
}

function spawnEnemy(scene) {
    // Spawn away from the player if deployed, otherwise random
    let x, y, attempts = 0;
    do {
        x = Phaser.Math.Between(100, 3900);
        y = Phaser.Math.Between(100, 3900);
        attempts++;
    } while (
        attempts < 30 && (
            Phaser.Math.Distance.Between(x, y, WORLD_CENTER, WORLD_CENTER) < 1200 ||
            (player && isDeployed && Phaser.Math.Distance.Between(x, y, player.x, player.y) < 900)
        )
    );

    const loadoutE  = randomEnemyLoadout();
    const chassisS  = CHASSIS[loadoutE.chassis];
    const colors    = ENEMY_COLORS[loadoutE.chassis];

    // Hitbox
    const e = scene.add.rectangle(x, y, 50, 50, 0x000000, 0);
    scene.physics.add.existing(e);
    e.body.setCircle(35);

    // Visual
    e.visuals = buildEnemyMech(scene, loadoutE.chassis, colors);
    e.visuals.setPosition(x, y);
    e.visuals.setScale(chassisS.scale);

    // Separate torso that rotates independently toward player (like player's torso)
    e.torso = buildEnemyTorso(scene, loadoutE.chassis, colors);
    e.torso.setPosition(x, y);
    e.torso.setScale(chassisS.scale);
    e.torso.setDepth(6);

    // Stats — use the same component HP as the chassis defines
    e.loadout    = loadoutE;
    const _behaviorPool = {
        light:  ['rusher', 'rusher', 'flanker', 'ambusher', 'flanker'],
        medium: ['circle', 'flanker', 'circle', 'guardian', 'ambusher'],
        heavy:  ['circle', 'sniper',  'circle', 'guardian', 'guardian']
    };
    e.behavior   = (loadoutE.primary === 'hr' || loadoutE.primary === 'sr')
                 ? 'sniper'
                 : Phaser.Math.RND.pick(_behaviorPool[loadoutE.chassis]);
    e.speed      = chassisS.spd;
    // Campaign mode: scale HP using mission enemy level instead of round
    const _effectiveRound = (window._activeCampaignConfig?.enemyLevel) || _round;
    const _hm = 0.50 * (1 + (_effectiveRound - 1) * 0.08); // +8% HP per level, no cap
    // Apply campaign modifier HP/speed multipliers
    const _campHpMult = (window._activeCampaignConfig?.enemyHpMult) || 1.0;
    const _campSpdMult = (window._activeCampaignConfig?.enemySpeedMult) || 1.0;
    // Level-based speed scaling: +1% per level
    const _levelSpdMult = 1.0 + (_effectiveRound - 1) * 0.01;
    e.speed = Math.round(e.speed * _levelSpdMult * _campSpdMult);
    e.comp = {
        core: { hp: Math.round(chassisS.coreHP * _hm * _campHpMult), max: Math.round(chassisS.coreHP * _hm * _campHpMult) },
        lArm: { hp: Math.round(chassisS.armHP  * _hm * _campHpMult), max: Math.round(chassisS.armHP  * _hm * _campHpMult) },
        rArm: { hp: Math.round(chassisS.armHP  * _hm * _campHpMult), max: Math.round(chassisS.armHP  * _hm * _campHpMult) },
        legs: { hp: Math.round(chassisS.legHP  * _hm * _campHpMult), max: Math.round(chassisS.legHP  * _hm * _campHpMult) },
    };
    e.health    = Object.values(e.comp).reduce((s,c) => s + c.hp, 0);
    e.maxHealth = e.health;
    e.reloadL    = 0;
    e.reloadR    = 0;
    e.lastSecTime = -99999;
    const _mc = WEAPONS[loadoutE.mod]?.cooldown || 8000;
    e.lastModTime = -_mc * Phaser.Math.FloatBetween(0.1, 0.8);
    e.isModActive = false;

    // Shield system
    const _eShldSys = SHIELD_SYSTEMS[loadoutE.shld] || SHIELD_SYSTEMS.none;
    e.maxShield = _eShldSys.maxShield;
    e.shield    = _eShldSys.maxShield;
    e._shieldRegenRate  = _eShldSys.regenRate;
    e._shieldRegenDelay = _eShldSys.regenDelay;
    // Medium chassis: 60% shield absorb (same as player rule)
    const _eBaseAbsorb = loadoutE.chassis === 'medium' ? (CHASSIS.medium.shieldAbsorb || 0.60) : 0.50;
    e._shieldAbsorb     = (loadoutE.shld === 'reactive_shield') ? 0.65 : _eBaseAbsorb;
    e._lastDamageTime   = -99999;
    // Fire grace: block shooting for 2s after spawn regardless of clock state
    e._fireGrace = true;
    setTimeout(() => { if (e?.active) e._fireGrace = false; }, 2000);
    e.lastFireTime  = 0;
    e.lastSecTime   = 0;
    // Leg system
    e._legSystemActive = true;
    if (loadoutE.leg === 'hydraulic_boost') e.speed = Math.round((e.speed||chassisS.spd) * 1.20);
    if (loadoutE.leg === 'mine_layer') e._mineTimer = 0;
    if (loadoutE.leg === 'mag_anchors') e._magAnchorsActive = false;
    // Chassis identity passives
    // Heavy: 15% passive DR (applied in damageEnemy via e._passiveDR)
    e._passiveDR = loadoutE.chassis === 'heavy' ? (CHASSIS.heavy.passiveDR || 0.15) : 0;
    // Light: +20% reload speed (stored as multiplier < 1)
    const _eChassisReload = loadoutE.chassis === 'light' ? (CHASSIS.light.passiveReloadBonus || 0.80) : 1.0;
    // Augment
    e._augState = {};
    e._reloadMult = ((loadoutE.aug === 'overclock_cpu') ? 0.88 : 1.0) * _eChassisReload;
    if (loadoutE.aug === 'reactive_plating') e._augState.reactivePlatingStacks = 0;
    if (loadoutE.aug === 'scrap_cannon')     e._augState.scrapCannon = true;

    // Per-enemy chassis effect state
    e.fxFootTimer  = 0;
    e.fxFootSide   = 1;
    e.fxShockTimer = 0;
    e.fxLastX      = x;
    e.fxLastY      = y;
    e.fxLastMX     = x;
    e.fxLastMY     = y;

    // Vision cone graphics object — drawn each frame in handleEnemyAI
    e._visionConeGfx = scene.add.graphics().setDepth(3);

    // Squad system: assign to an existing squad or start a new one
    _assignEnemyToSquad(e, loadoutE);

    enemies.add(e);
    // Collide new enemy with all existing cover objects
    if (coverObjects) scene.physics.add.collider(e, coverObjects);
}

// ── spawnEnemy sub-functions ─────────────────────────────────────────────────────────────────────
function _assignEnemyToSquad(e, loadoutE) {
    e._squadLeader = null;
    e._squadId = null;
    const _activeEnemies = enemies ? enemies.getChildren().filter(en => en.active && en !== e) : [];
    const _squads = {};
    _activeEnemies.forEach(en => {
        if (en._squadId != null) {
            if (!_squads[en._squadId]) _squads[en._squadId] = [];
            _squads[en._squadId].push(en);
        }
    });
    let _joined = false;
    for (const [sid, members] of Object.entries(_squads)) {
        if (members.length < 3 && members[0].loadout?.chassis === loadoutE.chassis) {
            e._squadId = parseInt(sid);
            e._squadLeader = members.find(m => m._squadLeader === m) || members[0];
            _joined = true;
            break;
        }
    }
    if (!_joined) {
        // Start a new squad — this enemy is the leader
        e._squadId = Math.floor(Math.random() * 100000);
        e._squadLeader = e;
    }
}

function spawnCommander(scene) {
    // Commander: always heavy, gold/dark colours, boosted stats, active mod
    let x, y, attempts = 0;
    do {
        x = Phaser.Math.Between(100, 3900);
        y = Phaser.Math.Between(100, 3900);
        attempts++;
    } while (
        player && isDeployed &&
        Phaser.Math.Distance.Between(x, y, player.x, player.y) < 900 &&
        attempts < 20
    );

    const chassisS = CHASSIS.heavy;
    const cmdScale = 1.6;  // bigger than standard heavy (1.4)

    // Pick a strong primary — HR or MG only
    const primary   = Phaser.Math.RND.pick(['hr', 'mg']);
    const secondary = Phaser.Math.RND.pick(['rl', 'plsm']);
    const mod       = Phaser.Math.RND.pick(['rage', 'barrier']);
    const loadoutE  = { chassis: 'heavy', primary, secondary, mod,
                        shld: 'heavy_shield',
                        leg:  Phaser.Math.RND.pick(['mag_anchors', 'afterleg']),
                        aug:  Phaser.Math.RND.pick(['reactive_plating', 'scrap_cannon']) };

    // Hitbox
    const e = scene.add.rectangle(x, y, 60, 60, 0x000000, 0);
    scene.physics.add.existing(e);
    e.body.setCircle(40);

    // Visuals — use commander gold colours
    e.visuals = buildEnemyMech(scene, 'heavy', COMMANDER_COLORS);
    e.visuals.setPosition(x, y).setScale(cmdScale);
    e.torso = buildEnemyTorso(scene, 'heavy', COMMANDER_COLORS);
    e.torso.setPosition(x, y).setScale(cmdScale).setDepth(6);

    // COMMANDER label above mech
    e.cmdLabel = scene.add.text(x, y - 70, '[ COMMANDER ]', {
        font: 'bold 10px monospace', fill: '#ddaa00',
        stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);
    scene.tweens.add({ targets: e.cmdLabel, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    // Stats — 150% HP, boosted speed
    e.loadout    = loadoutE;
    e.isCommander = true;
    e.behavior   = 'circle';
    const _effectiveLvl = (window._activeCampaignConfig?.enemyLevel) || _round;
    e.speed      = Math.round(chassisS.spd * 1.2 * (1 + (_effectiveLvl - 1) * 0.01));
    const _cm = 0.50 * 1.5 * (1 + (_effectiveLvl - 1) * 0.08);
    e.comp = {
        core: { hp: Math.round(chassisS.coreHP * _cm), max: Math.round(chassisS.coreHP * _cm) },
        lArm: { hp: Math.round(chassisS.armHP  * _cm), max: Math.round(chassisS.armHP  * _cm) },
        rArm: { hp: Math.round(chassisS.armHP  * _cm), max: Math.round(chassisS.armHP  * _cm) },
        legs: { hp: Math.round(chassisS.legHP  * _cm), max: Math.round(chassisS.legHP  * _cm) },
    };
    e.health    = Object.values(e.comp).reduce((s,c) => s + c.hp, 0);
    e.maxHealth = e.health;
    e.reloadL    = 0;
    e.reloadR    = 0;
    e.lastSecTime = -99999;
    const _mc = WEAPONS[mod]?.cooldown || 8000;
    e.lastModTime = -_mc * 0.1;
    e.isModActive = false;

    // Commander is always heavy — apply chassis identity
    e._passiveDR   = CHASSIS.heavy.passiveDR || 0.15;
    e._reloadMult  = (loadoutE.aug === 'overclock_cpu') ? 0.88 : 1.0;
    e._augState    = {};
    if (loadoutE.aug === 'reactive_plating') e._augState.reactivePlatingStacks = 0;
    if (loadoutE.aug === 'scrap_cannon')     e._augState.scrapCannon = true;
    e.fxFootTimer = 0; e.fxFootSide = 1;
    e.fxShockTimer = 0;
    e.fxLastX = x; e.fxLastY = y;
    e.fxLastMX = x; e.fxLastMY = y;

    e._visionConeGfx = GAME.scene.scenes[0]?.add?.graphics()?.setDepth(3);
    enemies.add(e);
    if (coverObjects) scene.physics.add.collider(e, coverObjects);
    sndCommanderSpawn();
}

function spawnMedic(scene) {
    // MEDIC: medium chassis, green scheme, low HP but heals nearby allies every 3s
    // Priority target — while alive, enemies in 280px radius regenerate 8 HP/s
    let x, y, attempts = 0;
    do {
        x = Phaser.Math.Between(200, 3800);
        y = Phaser.Math.Between(200, 3800);
        attempts++;
    } while (
        player && isDeployed &&
        Phaser.Math.Distance.Between(x, y, player.x, player.y) < 1000 &&
        attempts < 20
    );

    const chassisS = CHASSIS.medium;
    const e = scene.add.rectangle(x, y, 46, 46, 0x000000, 0);
    scene.physics.add.existing(e);
    e.body.setCircle(28);

    e.visuals = buildEnemyMech(scene, 'medium', MEDIC_COLORS);
    e.visuals.setPosition(x, y).setScale(1.0);
    e.torso = buildEnemyTorso(scene, 'medium', MEDIC_COLORS);
    e.torso.setPosition(x, y).setScale(1.0).setDepth(6);

    // MEDIC label
    e.medicLabel = scene.add.text(x, y - 52, '[ MEDIC ]', {
        font: 'bold 9px monospace', fill: '#00ff88',
        stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);
    scene.tweens.add({ targets: e.medicLabel, alpha: 0.4, duration: 1000, yoyo: true, repeat: -1 });

    // Cross symbol above label
    e.medicCross = scene.add.text(x, y - 64, '+', {
        font: 'bold 14px monospace', fill: '#00ffaa',
        stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);

    const _effectiveLvl = (window._activeCampaignConfig?.enemyLevel) || _round;
    const _hm = 0.35 * (1 + (_effectiveLvl - 1) * 0.08); // medics have less HP than normal
    const loadoutE = {
        chassis: 'medium', primary: 'smg', secondary: 'none', mod: 'repair',
        shld: 'standard_shield', leg: 'none', aug: 'none'
    };
    e.loadout     = loadoutE;
    e.isMedic     = true;
    e.behavior    = 'defender'; // hangs back
    e.speed       = chassisS.spd * 0.85;
    e.comp = {
        core: { hp: Math.round(chassisS.coreHP * _hm), max: Math.round(chassisS.coreHP * _hm) },
        lArm: { hp: Math.round(chassisS.armHP  * _hm), max: Math.round(chassisS.armHP  * _hm) },
        rArm: { hp: Math.round(chassisS.armHP  * _hm), max: Math.round(chassisS.armHP  * _hm) },
        legs: { hp: Math.round(chassisS.legHP  * _hm), max: Math.round(chassisS.legHP  * _hm) },
    };
    e.health    = Object.values(e.comp).reduce((s,c) => s + c.hp, 0);
    e.maxHealth = e.health;
    e.reloadL = 0; e.reloadR = 0;
    e.lastSecTime = -99999; e.lastModTime = -99999; e.isModActive = false;
    e._passiveDR  = 0;
    e._reloadMult = 1.0;
    e._augState   = {};
    e.fxFootTimer = 0; e.fxFootSide = 1; e.fxShockTimer = 0;
    e.fxLastX = x; e.fxLastY = y; e.fxLastMX = x; e.fxLastMY = y;
    e._fireGrace = true;
    setTimeout(() => { if (e?.active) e._fireGrace = false; }, 2500);
    e.lastFireTime = 0; e.lastSecTime = 0;
    // Shield
    e._shieldHP = 80; e._shieldMax = 80; e._shieldRegen = 4000; e._shieldLastBreak = -9999;
    e._shieldAbsorb = 0.5;

    // Heal aura — pulses every 2.5s, heals nearby enemies 10 HP
    e._healTimer = scene.time.addEvent({ delay: 2500, loop: true, callback: () => {
        if (!e?.active || !isDeployed) return;
        enemies.getChildren().forEach(ally => {
            if (!ally.active || ally === e) return;
            const d = Phaser.Math.Distance.Between(e.x, e.y, ally.x, ally.y);
            if (d > 300) return;
            // Heal each component proportionally
            const healAmt = 10;
            Object.values(ally.comp).forEach(part => {
                if (part.hp > 0 && part.hp < part.max) {
                    part.hp = Math.min(part.max, part.hp + healAmt);
                }
            });
            ally.health = Object.values(ally.comp).reduce((s,c) => s + c.hp, 0);
            // Green heal pulse visual
            const pulse = scene.add.circle(ally.x, ally.y, 18, 0x00ff88, 0.45).setDepth(12);
            scene.tweens.add({ targets: pulse, alpha: 0, scale: 2.5, duration: 500, onComplete: () => pulse.destroy() });
        });
        // Green aura ring on medic itself
        const ring = scene.add.circle(e.x, e.y, 300, 0x00ff88, 0.04).setDepth(4)
            .setStrokeStyle(1, 0x00ff88, 0.3);
        scene.tweens.add({ targets: ring, alpha: 0, duration: 600, onComplete: () => ring.destroy() });
        // Sound — soft high tone (throttled: multiple medics may fire in the same tick)
        if (_canPlay('medic_heal', 500)) _tone(880, 'sine', 0.08, 0.06, 1100);
    }});

    e._visionConeGfx = scene.add.graphics().setDepth(3);
    enemies.add(e);
    if (coverObjects) scene.physics.add.collider(e, coverObjects);
}

function enemyFire(scene, enemy, time) {
    if (!isDeployed || !player?.active || enemy.isStunned) return;

    const wKey  = enemy.loadout?.primary || 'smg';
    const weapon = WEAPONS[wKey];
    if (!weapon) return;

    sndEnemyFire(wKey);
    const _fireDecoy = enemy._decoyTarget?.active !== false && enemy._decoyTarget;
    const _ftx = _fireDecoy ? enemy._decoyTarget.x : player.x;
    const _fty = _fireDecoy ? enemy._decoyTarget.y : player.y;
    // Base angle toward target
    const _rawAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, _ftx, _fty);
    // Accuracy spread per weapon type (radians). Larger = less accurate.
    // Also increases while enemy is moving (momentum penalty)
    const _spreadMap = { smg:0.28, mg:0.18, br:0.14, sg:0.22, hr:0.10, fth:0, sr:0.06, gl:0, rl:0, plsm:0.10, chain:0.22, siege:0.06 };
    const _baseSpread = _spreadMap[wKey] ?? 0.15;
    const _moving = Math.abs(enemy.body?.velocity?.x || 0) + Math.abs(enemy.body?.velocity?.y || 0) > 30;
    const _totalSpread = _baseSpread * (_moving ? 1.6 : 1.0);
    const angle = _rawAngle + (Math.random() - 0.5) * _totalSpread;
    const ex = enemy.x, ey = enemy.y;
    const bSize  = weapon.bulletSize || 6;
    const bSpeed = weapon.speed || 600;
    // Enemy damage scaling — enemies have perfect aim so high-dmg weapons are tuned down
    const _enemyDmgScale = {
        rail:  0.30,   // 450 → 135  (still scary but not instant death)
        sr:    0.40,   // 240 → 96
        plsm:  0.40,   // 300 → 120
        siege: 0.35,   // 380 → 133
        gl:    0.55,   // 200 → 110
        rl:    0.55,   // 220 → 121
        hr:    0.65,   // 160 → 104
        br:    0.75,   // 30  → 22
    };
    let dmg    = Math.round((weapon.dmg || 15) * (_enemyDmgScale[wKey] || 1.0));
    // Level-based damage scaling: +3% per enemy level
    const _eLvl = (window._activeCampaignConfig?.enemyLevel) || _round;
    dmg = Math.round(dmg * (1.0 + (_eLvl - 1) * 0.03));
    // Berserker enrage: 1.5x damage
    if (enemy._enrageDmgMult) dmg = Math.round(dmg * enemy._enrageDmgMult);
    // Dispatch by weapon type — mirrors player fire functions
    _dispatchEnemyWeapon(scene, enemy, wKey, weapon, dmg, angle, ex, ey, bSize, bSpeed);
}

// ── enemyFire sub-functions ──────────────────────────────────────────────────────────────────────
function _dispatchEnemyWeapon(scene, enemy, wKey, weapon, dmg, angle, ex, ey, bSize, bSpeed) {
    const _tagBullet = (b) => { b._shooter = enemy; return b; };

    if (wKey === 'sg') {
        for (let i = 0; i < (weapon.pellets || 5); i++) {
            const spread = (Math.random() - 0.5) * 0.35;
            const b = scene.add.circle(ex, ey, bSize, 0xff4400);
            scene.physics.add.existing(b);
            b.body.setAllowGravity(false);
            b.damageValue = dmg; _tagBullet(b);
            enemyBullets.add(b);
            scene.physics.velocityFromRotation(angle + spread, bSpeed, b.body.velocity);
            scene.time.delayedCall(1500, () => { if (b.active) b.destroy(); });
        }
    } else if (wKey === 'fth') {
        // Flamethrower: short-range cone of flame particles
        const coneCount = 6;
        for (let i = 0; i < coneCount; i++) {
            const spread = (Math.random() - 0.5) * 0.55;
            const b = scene.add.circle(ex, ey, bSize, 0xff6600).setAlpha(0.85);
            scene.physics.add.existing(b);
            b.body.setAllowGravity(false);
            b.damageValue = dmg; _tagBullet(b);
            enemyBullets.add(b);
            scene.physics.velocityFromRotation(angle + spread, bSpeed * (0.8 + Math.random() * 0.4), b.body.velocity);
            const ttl = 400 + Math.random() * 200;
            scene.tweens.add({ targets: b, alpha: 0, scaleX: 1.8, scaleY: 1.8, duration: ttl,
                onComplete: () => { if (b.active) b.destroy(); } });
            scene.time.delayedCall(ttl, () => { if (b.active) b.destroy(); });
        }
    } else if (wKey === 'sr') {
        // Sniper: fast pierce tracer
        const b = scene.add.rectangle(ex, ey, 50, 6, 0xffffff)
            .setRotation(angle).setStrokeStyle(1, 0xff6600).setDepth(14);
        scene.physics.add.existing(b);
        b.body.setAllowGravity(false);
        b.damageValue = dmg; _tagBullet(b);
        b.piercing = true;
        enemyBullets.add(b);
        scene.physics.velocityFromRotation(angle, weapon.speed, b.body.velocity);
        scene.time.delayedCall(2500, () => { if (b.active) b.destroy(); });
    } else if (wKey === 'gl') {
        // Grenade: lobs toward player, explodes on stop
        const gDist = Phaser.Math.Distance.Between(ex, ey, player.x, player.y);
        const ball = scene.add.circle(ex, ey, 10, 0xff8800).setStrokeStyle(2, 0xffcc00).setDepth(14);
        scene.physics.add.existing(ball);
        ball.body.setAllowGravity(false);
        ball.body.setDrag(gDist * 1.8);
        scene.physics.velocityFromRotation(angle, gDist * 1.8, ball.body.velocity);
        let fuseStarted = false;
        const timerEvent = scene.time.addEvent({ delay: 50, loop: true, callback: () => {
            if (!ball.active) { timerEvent.remove(); return; }
            if (!fuseStarted && ball.body.velocity.length() < 20) {
                fuseStarted = true; timerEvent.remove();
                scene.time.delayedCall(2000, () => {
                    if (ball.active) { createExplosion(scene, ball.x, ball.y, 90, dmg); ball.destroy(); }
                });
            }
        }});
    } else if (wKey === 'rl') {
        // Rocket
        const rocket = scene.add.rectangle(ex, ey, 22, 9, 0xff4400).setRotation(angle).setDepth(14);
        scene.physics.add.existing(rocket);
        rocket.body.setAllowGravity(false);
        scene.physics.velocityFromRotation(angle, bSpeed * 0.85, rocket.body.velocity);
        const eRlOverlap = scene.physics.add.overlap(rocket, player, () => {
            if (!rocket.active) return;
            eRlOverlap.destroy();
            createExplosion(scene, rocket.x, rocket.y, weapon.radius || 80, dmg);
            rocket.destroy();
        });
        scene.time.delayedCall(2200, () => {
            if (rocket.active) { eRlOverlap.destroy(); createExplosion(scene, rocket.x, rocket.y, weapon.radius || 80, dmg); rocket.destroy(); }
        });
    } else if (wKey === 'plsm') {
        // Plasma orb
        const p = scene.add.circle(ex, ey, 22, 0xff6600).setAlpha(0.85).setDepth(14);
        scene.physics.add.existing(p);
        p.body.setAllowGravity(false);
        p.damageValue = dmg; _tagBullet(p);
        enemyBullets.add(p);
        scene.physics.velocityFromRotation(angle, 260, p.body.velocity);
        const ePlsmTween = scene.tweens.add({ targets: p, alpha: 0.4, duration: 120, yoyo: true, repeat: -1 });
        p.once('destroy', () => ePlsmTween.stop());
        scene.time.delayedCall(3500, () => { if (p.active) p.destroy(); });
    } else if (wKey === 'rail') {
        // Railgun: instant line, pierces player, bright flash
        const dist = 900;
        const endX = ex + Math.cos(angle) * dist;
        const endY = ey + Math.sin(angle) * dist;
        if (player?.active) {
            const dx = player.x - ex, dy = player.y - ey;
            const dot = dx * Math.cos(angle) + dy * Math.sin(angle);
            const perp = Math.abs(dx * Math.sin(angle) - dy * Math.cos(angle));
            if (dot > 0 && perp < 30) processPlayerDamage(dmg, angle);
        }
        const beam = scene.add.graphics().setDepth(14);
        beam.lineStyle(4, 0xffffff, 1.0);
        beam.lineBetween(ex, ey, endX, endY);
        scene.tweens.add({ targets: beam, alpha: 0, duration: 150, onComplete: () => beam.destroy() });
    } else if (wKey === 'siege' || wKey === 'chain') {
        // Two-handed: fire like normal bullet but with siege/chain stats
        const b = scene.add.circle(ex, ey, bSize, 0xff2200);
        scene.physics.add.existing(b);
        b.body.setAllowGravity(false);
        b.damageValue = dmg; _tagBullet(b);
        if (wKey === 'siege') {
            const eSiegeOverlap = scene.physics.add.overlap(b, player, () => {
                if (!b.active) return;
                eSiegeOverlap.destroy();
                createExplosion(scene, b.x, b.y, weapon.radius || 160, dmg);
                b.destroy();
            });
            scene.physics.velocityFromRotation(angle, bSpeed, b.body.velocity);
            scene.time.delayedCall(2500, () => { if (b.active) { eSiegeOverlap.destroy(); b.destroy(); } });
        } else {
            enemyBullets.add(b);
            scene.physics.velocityFromRotation(angle, bSpeed, b.body.velocity);
            scene.time.delayedCall(2500, () => { if (b.active) b.destroy(); });
        }
    } else if (wKey === 'br') {
        // Burst rifle: 3 rapid shots
        for (let i = 0; i < 3; i++) {
            scene.time.delayedCall(i * 60, () => {
                if (!enemy.active || !player?.active) return;
                const ang2 = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                const b = scene.add.circle(enemy.x, enemy.y, bSize, 0xff2200);
                scene.physics.add.existing(b);
                b.body.setAllowGravity(false);
                b.damageValue = dmg; _tagBullet(b);
                enemyBullets.add(b);
                scene.physics.velocityFromRotation(ang2, bSpeed, b.body.velocity);
                scene.time.delayedCall(2000, () => { if (b.active) b.destroy(); });
            });
        }
    } else {
        // Default: smg, mg, hr — straight bullet
        const b = scene.add.circle(ex, ey, bSize, 0xff2200);
        scene.physics.add.existing(b);
        b.body.setAllowGravity(false);
        b.damageValue = dmg; _tagBullet(b);
        enemyBullets.add(b);
        scene.physics.velocityFromRotation(angle, bSpeed, b.body.velocity);
        scene.time.delayedCall(2000, () => { if (b.active) b.destroy(); });
    }

    // Dual-wield: if enemy has same weapon in both arms, also fire R arm
    if (enemy.loadout?.L === enemy.loadout?.R && enemy.loadout?.R !== 'none' && enemy.loadout?.R === wKey) {
        // Small offset to simulate second barrel
        const ox = Math.cos(angle + Math.PI/2) * 8, oy = Math.sin(angle + Math.PI/2) * 8;
        const b2 = scene.add.circle(ex + ox, ey + oy, bSize, 0xff2200);
        scene.physics.add.existing(b2);
        b2.body.setAllowGravity(false);
        b2.damageValue = dmg;
        enemyBullets.add(b2);
        scene.physics.velocityFromRotation(angle, bSpeed, b2.body.velocity);
        scene.time.delayedCall(2000, () => { if (b2.active) b2.destroy(); });
    }
}

function enemyFireSecondary(scene, enemy, wKey, time) {
    if (!isDeployed || !player?.active || enemy.isStunned) return;
    const weapon = WEAPONS[wKey];
    if (!weapon) return;

    const _fireDecoy = enemy._decoyTarget?.active !== false && enemy._decoyTarget;
    const _ftx = _fireDecoy ? enemy._decoyTarget.x : player.x;
    const _fty = _fireDecoy ? enemy._decoyTarget.y : player.y;
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, _ftx, _fty);
    const ex = enemy.x, ey = enemy.y;
    // Scaled damage — same table as enemyFire primary
    const _secScale = { rail:0.30, sr:0.40, plsm:0.40, siege:0.35, gl:0.55, rl:0.55, hr:0.65, br:0.75 };
    const _sDmg = Math.round((weapon.dmg || 15) * (_secScale[wKey] || 1.0));

    switch (wKey) {
        case 'sr': {
            // Sniper round — fast, accurate, bright tracer
            const b = scene.add.rectangle(ex, ey, 50, 6, 0xffffff)
                .setRotation(angle).setStrokeStyle(1, 0xff6600).setDepth(14);
            scene.physics.add.existing(b);
            b.body.setAllowGravity(false);
            b.damageValue = _sDmg;
            enemyBullets.add(b);
            scene.physics.velocityFromRotation(angle, weapon.speed, b.body.velocity);
            scene.time.delayedCall(2500, () => { if (b.active) b.destroy(); });
            break;
        }
        case 'gl': {
            // Grenade — lobs toward player with fuse timer matching player GL
            const gDist = Phaser.Math.Distance.Between(ex, ey, player.x, player.y);
            const ball = scene.add.circle(ex, ey, 10, 0xff8800)
                .setStrokeStyle(2, 0xffcc00).setDepth(14);
            scene.physics.add.existing(ball);
            ball.body.setAllowGravity(false);
            ball.body.setDrag(gDist * 1.8);
            scene.physics.velocityFromRotation(angle, gDist * 1.8, ball.body.velocity);
            // Fuse countdown — same as player GL
            const fuseTime  = 2000;
            let fuseStarted = false;
            let startTime   = 0;
            const timerText = scene.add.text(ball.x, ball.y - 16, '', {
                font: 'bold 13px monospace', fill: '#ffff00'
            }).setOrigin(0.5).setDepth(15).setVisible(false);
            const timerEvent = scene.time.addEvent({
                delay: 50, loop: true,
                callback: () => {
                    if (!ball.active) { timerText.destroy(); timerEvent.destroy(); return; }
                    timerText.setPosition(ball.x, ball.y - 16);
                    if (!fuseStarted && ball.body.velocity.length() < 20) {
                        fuseStarted = true;
                        startTime   = scene.time.now;
                        timerText.setVisible(true);
                        scene.time.delayedCall(fuseTime, () => {
                            if (ball.active) {
                                createExplosion(scene, ball.x, ball.y, 90, _sDmg);
                                ball.destroy(); timerText.destroy();
                            }
                        });
                    }
                    if (fuseStarted) {
                        const rem = Math.max(0, (fuseTime - (scene.time.now - startTime)) / 1000);
                        timerText.setText(rem.toFixed(1));
                        if (rem < 0.5) timerText.setFill(scene.time.now % 200 < 100 ? '#ffffff' : '#ff0000');
                    }
                }
            });
            break;
        }
        case 'rl': {
            // Rocket — straight shot that explodes on impact or after 2s
            const rocket = scene.add.rectangle(ex, ey, 22, 9, 0xff4400)
                .setRotation(angle).setDepth(14);
            scene.physics.add.existing(rocket);
            rocket.body.setAllowGravity(false);
            scene.physics.velocityFromRotation(angle, weapon.speed * 0.85, rocket.body.velocity);
            // Overlap with player for direct hit
            const secRlOverlap = scene.physics.add.overlap(rocket, player, () => {
                if (!rocket.active) return;
                secRlOverlap.destroy();
                createExplosion(scene, rocket.x, rocket.y, 80, _sDmg);
                rocket.destroy();
            });
            scene.time.delayedCall(2200, () => {
                if (rocket.active) {
                    secRlOverlap.destroy();
                    createExplosion(scene, rocket.x, rocket.y, 80, _sDmg);
                    rocket.destroy();
                }
            });
            break;
        }
        case 'plsm': {
            const p = scene.add.circle(ex, ey, 22, 0xff6600).setAlpha(0.85).setDepth(14);
            scene.physics.add.existing(p);
            p.body.setAllowGravity(false);
            p.damageValue = _sDmg;
            enemyBullets.add(p);
            scene.physics.velocityFromRotation(angle, 260, p.body.velocity);
            const secPlsmTween = scene.tweens.add({ targets: p, alpha: 0.4, duration: 120, yoyo: true, repeat: -1 });
            p.once('destroy', () => secPlsmTween.stop());
            scene.time.delayedCall(3500, () => { if (p.active) p.destroy(); });
            break;
        }
        case 'rail': {
            // Railgun secondary — same as primary rail
            const dist = 900;
            const endX = ex + Math.cos(angle) * dist;
            const endY = ey + Math.sin(angle) * dist;
            if (player?.active) {
                const dx = player.x - ex, dy = player.y - ey;
                const dot = dx * Math.cos(angle) + dy * Math.sin(angle);
                const perp = Math.abs(dx * Math.sin(angle) - dy * Math.cos(angle));
                if (dot > 0 && perp < 30) processPlayerDamage(_sDmg, angle);
            }
            const beam = scene.add.graphics().setDepth(14);
            beam.lineStyle(4, 0xffffff, 1.0);
            beam.lineBetween(ex, ey, endX, endY);
            scene.tweens.add({ targets: beam, alpha: 0, duration: 150, onComplete: () => beam.destroy() });
            break;
        }
        case 'fth': {
            // Flamethrower secondary
            for (let i = 0; i < 5; i++) {
                const spread = (Math.random() - 0.5) * 0.55;
                const b = scene.add.circle(ex, ey, weapon.bulletSize || 8, 0xff6600).setAlpha(0.85);
                scene.physics.add.existing(b);
                b.body.setAllowGravity(false);
                b.damageValue = _sDmg;
                enemyBullets.add(b);
                scene.physics.velocityFromRotation(angle + spread, (weapon.speed||420) * (0.8 + Math.random()*0.4), b.body.velocity);
                const ttl = 400 + Math.random() * 200;
                scene.tweens.add({ targets: b, alpha: 0, scaleX: 1.8, scaleY: 1.8, duration: ttl, onComplete: () => { if (b.active) b.destroy(); } });
                scene.time.delayedCall(ttl, () => { if (b.active) b.destroy(); });
            }
            break;
        }
    }
}

// ═══════════ ENEMY AI ═══════════

// ── Module-level constants / reusable objects for handleEnemyAI ──
// Avoids per-frame / per-enemy heap allocations in the hot AI loop.
const _FEELER_OFFSETS = Object.freeze([0, -0.35, 0.35]);
// ⚠️ MUTATED AT RUNTIME — handleEnemyAI() overwrites .x/.y on each element every
// frame to avoid per-frame heap allocation. The array reference itself never changes.
const _CONE_RAY_POINTS = Array.from({ length: 19 }, () => ({ x: 0, y: 0 }));

/** Per-frame enemy AI: movement, strafing, and firing. */
function handleEnemyAI(scene, time) {
    if (!player?.active || !isDeployed) return;
    // Pre-compute active cover list once per frame (shared by all enemy iterations).
    const _activeCoverCache = coverObjects ? coverObjects.getChildren().filter(c => c.active) : [];
    enemies.getChildren().forEach(enemy => {
        const dist  = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
        // _decoyTarget is now a live container reference (or {x,y} fallback)
        const _decoyActive = enemy._decoyTarget?.active !== false && enemy._decoyTarget;
        const _aimX = _decoyActive ? (enemy._decoyTarget.x ?? enemy._decoyTarget.x) : player.x;
        const _aimY = _decoyActive ? (enemy._decoyTarget.y ?? enemy._decoyTarget.y) : player.y;
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, _aimX, _aimY);
        // Speed — halved if legs destroyed
        const _baseSpd = CHASSIS[enemy.loadout?.chassis]?.spd || (enemy.isCommander ? 180 : 150);
        const _legsOk  = !enemy.comp || enemy.comp.legs.hp > 0;
        const speed    = _legsOk ? (enemy.speed || _baseSpd) : _baseSpd * 0.5;

        // Detection: vision cone + LOS raycasting (returns true if player is visible)
        const _canSeePlayer = _computeEnemyVisibility(enemy, dist, _activeCoverCache);
        // State machine transitions — updates enemy._aiState based on visibility
        _updateEnemyAIState(enemy, _canSeePlayer, dist, time);
        if (!enemy.isStunned && !enemy.isJumping) {
            // Compute desired velocity from AI behavior pattern
            let {vx, vy} = _calcEnemyBehaviorVelocity(enemy, dist, angle, speed, time);
            // Ghost abilities: skip firing + avoidance entirely for this enemy this frame
            if (isJumping && _perkState.ghostJump) return;
            if (_perkState._ghostStepActive) return;
            // Weapon firing decisions + mod activation
            _handleEnemyFiringDecision(scene, enemy, dist, time);

            // Obstacle avoidance, stuck/orbit/separation correction, + tank locomotion
            _applyEnemyObstacleAvoidance(enemy, angle, speed, time, vx, vy);
        } else {
            enemy.body.setVelocity(0, 0);
            enemy.body.setImmovable(true);
        }

        // Passive shield regen + leg passives
        _applyEnemyPassiveShieldRegen(scene, enemy, time);
        // Visual sync: positions, torso, labels, commander buff, chassis FX
        _syncEnemyVisuals(scene, enemy, time);
    });
}

// ── handleEnemyAI sub-functions ─────────────────────────────────────────────────────────────────
function _applyEnemyPassiveShieldRegen(scene, enemy, time) {
    // Passive shield regen
    if ((enemy.maxShield||0) > 0 && enemy.shield < enemy.maxShield) {
        const _secSinceHit = (time - (enemy._lastDamageTime || -99999)) / 1000;
        if (_secSinceHit >= (enemy._shieldRegenDelay ?? 5)) {
            enemy.shield = Math.min(enemy.maxShield, enemy.shield + (enemy._shieldRegenRate ?? 1.0));
        }
    }
    // Mine Layer leg system
    if (enemy.loadout?.leg === 'mine_layer' && enemy._legSystemActive) {
        const _ev = enemy.body.velocity;
        if (Math.abs(_ev.x) + Math.abs(_ev.y) > 20) {
            enemy._mineTimer = (enemy._mineTimer || 0) + scene.game.loop.delta;
            if (enemy._mineTimer >= 10000) {
                enemy._mineTimer = 0;
                dropEnemyMine(scene, enemy);
            }
        }
    }
    // Mag Anchors: track stationary state
    if (enemy.loadout?.leg === 'mag_anchors' && enemy._legSystemActive) {
        const _ev2 = enemy.body.velocity;
        enemy._magAnchorsActive = (Math.abs(_ev2.x) + Math.abs(_ev2.y) < 15);
    } else {
        enemy._magAnchorsActive = false;
    }
}

function _computeEnemyVisibility(enemy, dist, _activeCoverCache) {
    // Vision cone + AI state init — initialise missing state on first call
    // ── VISION CONE + STATE MACHINE ──────────────────────────────
    if (!enemy._aiState)         enemy._aiState = 'patrol';
    if (!enemy._patrolTarget)    enemy._patrolTarget = { x: Phaser.Math.Between(300, 3700), y: Phaser.Math.Between(300, 3700) };
    if (!enemy._lastKnownPlayer) enemy._lastKnownPlayer = null;
    if (!enemy._stateTimer)      enemy._stateTimer = 0;

    // ── DETECTION RANGES ──────────────────────────────────────
    // Patrol: narrow vision cone from torso facing direction
    const _coneRange   = enemy.behavior === 'sniper' ? 900 : 680;
    const _coneAngle   = 0.75; // ±43° half-angle
    // Pursuit: once alerted, enemy tracks player in a huge radius (no cone needed)
    const _pursuitRange = 1400;
    // Break-off: enemy gives up only after being this far away for 3s continuously
    const _breakRange   = 1400;

    // Cone uses the TORSO facing direction (head/gun), not the legs
    const _facingAngle = enemy.torso?.rotation ?? enemy.visuals?.rotation ?? 0;

    // ── VISION CONE CHECK (only relevant in patrol/search) ──────
    const _angleToPlayer = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    const _angleDiff     = Phaser.Math.Angle.Wrap(_angleToPlayer - _facingAngle);
    const _inCone        = Math.abs(_angleDiff) < _coneAngle && dist < _coneRange;

    // LOS raycast for cone detection
    let _hasLOS = false;
    if (_inCone && coverObjects) {
        _hasLOS = true;
        const _raySteps = 12;
        for (let _rs = 1; _rs <= _raySteps; _rs++) {
            const _rt = _rs / _raySteps;
            const _rx = enemy.x + (player.x - enemy.x) * _rt;
            const _ry = enemy.y + (player.y - enemy.y) * _rt;
            const _hit = coverObjects.getChildren().some(c => {
                if (!c.active) return false;
                // Use stored center coords (coverCX/CY) — c.x/c.y is top-left (origin 0,0)
                const cx = c.coverCX !== undefined ? c.coverCX : c.x + (c.width||60)/2;
                const cy = c.coverCY !== undefined ? c.coverCY : c.y + (c.height||60)/2;
                const hw = (c.width || 60) / 2, hh = (c.height || 60) / 2;
                return _rx > cx - hw && _rx < cx + hw && _ry > cy - hh && _ry < cy + hh;
            });
            if (_hit) { _hasLOS = false; break; }
        }
    }
    const _canSeeViaConeCone = _inCone && _hasLOS && !player?._ghostExitActive;

    // ── PURSUIT DETECTION (chase/combat only): wide radius, no cone needed ──
    // Once alerted, enemy tracks player within pursuit range BUT still needs LOS
    const _isAlerted   = !player?._ghostExitActive && (enemy._aiState === 'chase' || enemy._aiState === 'combat');
    let _pursueLOS = false;
    if (_isAlerted && dist < _pursuitRange && coverObjects) {
        _pursueLOS = true;
        const _pRaySteps = 8;
        for (let _prs = 1; _prs <= _pRaySteps; _prs++) {
            const _prt = _prs / _pRaySteps;
            const _prx = enemy.x + (player.x - enemy.x) * _prt;
            const _pry = enemy.y + (player.y - enemy.y) * _prt;
            const _phit = coverObjects.getChildren().some(c => {
                if (!c.active) return false;
                const cx = c.coverCX !== undefined ? c.coverCX : c.x + (c.width||60)/2;
                const cy = c.coverCY !== undefined ? c.coverCY : c.y + (c.height||60)/2;
                const hw = (c.width || 60) / 2, hh = (c.height || 60) / 2;
                return _prx > cx - hw && _prx < cx + hw && _pry > cy - hh && _pry < cy + hh;
            });
            if (_phit) { _pursueLOS = false; break; }
        }
    }
    const _canPursue   = _isAlerted && dist < _pursuitRange && _pursueLOS;

    // Combined: can the enemy detect the player this frame?
    const _canSeePlayer = _canSeeViaConeCone || _canPursue;

    // ── DRAW VISION CONE — wall-occluded (patrol/search only) ───
    if (enemy._visionConeGfx?.active) {
        const _cg = enemy._visionConeGfx;
        _cg.clear();
        const _showCone = (enemy._aiState === 'patrol' || enemy._aiState === 'search');
        if (_showCone) {
            const _coneJustSpotted = _canSeeViaConeCone;
            const _coneCol   = _coneJustSpotted ? 0xff2200
                             : enemy._aiState === 'search' ? 0xffcc00
                             : 0x4488ff;
            const _coneAlpha = _coneJustSpotted ? 0.18 : 0.07;

            // Cast individual rays — each stops at the first cover object hit
            // This makes the cone visually respect walls and buildings
            const _coneRays  = 18;  // number of rays (more = smoother but costs more)
            const _coneCovers = _activeCoverCache;
            let _rayCount = 0;

            for (let _ri = 0; _ri <= _coneRays; _ri++) {
                const _ra = _facingAngle - _coneAngle + (_ri / _coneRays) * _coneAngle * 2;
                let _rayLen = _coneRange;

                // Step along ray and find first cover intersection
                const _steps = 12;
                for (let _rs = 1; _rs <= _steps; _rs++) {
                    const _t  = _rs / _steps;
                    const _rx = enemy.x + Math.cos(_ra) * _coneRange * _t;
                    const _ry = enemy.y + Math.sin(_ra) * _coneRange * _t;
                    let _hit  = false;
                    for (let _ci2 = 0; _ci2 < _coneCovers.length; _ci2++) {
                        const _cv = _coneCovers[_ci2];
                        // Use stored center coords — c.x/c.y is top-left (origin 0,0)
                        const _cvCX = _cv.coverCX !== undefined ? _cv.coverCX : _cv.x + (_cv.width||60)/2;
                        const _cvCY = _cv.coverCY !== undefined ? _cv.coverCY : _cv.y + (_cv.height||60)/2;
                        const _hw = (_cv.width  || 60) * 0.5 + 2;
                        const _hh = (_cv.height || 60) * 0.5 + 2;
                        if (_rx > _cvCX - _hw && _rx < _cvCX + _hw &&
                            _ry > _cvCY - _hh && _ry < _cvCY + _hh) {
                            _hit = true; break;
                        }
                    }
                    if (_hit) {
                        _rayLen = _coneRange * (_t - 1/_steps); // stop just before obstacle
                        break;
                    }
                }
                _CONE_RAY_POINTS[_rayCount].x = enemy.x + Math.cos(_ra) * Math.max(0, _rayLen);
                _CONE_RAY_POINTS[_rayCount].y = enemy.y + Math.sin(_ra) * Math.max(0, _rayLen);
                _rayCount++;
            }

            // Draw filled polygon from enemy origin through all ray endpoints
            _cg.fillStyle(_coneCol, _coneAlpha);
            _cg.beginPath();
            _cg.moveTo(enemy.x, enemy.y);
            for (let _i = 0; _i < _rayCount; _i++) _cg.lineTo(_CONE_RAY_POINTS[_i].x, _CONE_RAY_POINTS[_i].y);
            _cg.closePath();
            _cg.fillPath();

            // Thin outer edge on first and last ray
            _cg.lineStyle(1, _coneCol, _coneAlpha * 3.5);
            _cg.beginPath();
            _cg.moveTo(enemy.x, enemy.y);
            _cg.lineTo(_CONE_RAY_POINTS[0].x, _CONE_RAY_POINTS[0].y);
            _cg.strokePath();
            _cg.beginPath();
            _cg.moveTo(enemy.x, enemy.y);
            _cg.lineTo(_CONE_RAY_POINTS[_rayCount - 1].x, _CONE_RAY_POINTS[_rayCount - 1].y);
            _cg.strokePath();
        }
    }

    return _canSeePlayer;
}

function _updateEnemyAIState(enemy, _canSeePlayer, dist, time) {
    // ── STATE TRANSITIONS ─────────────────────────────────────
    // ── STATE TRANSITIONS ─────────────────────────────────────
    if (_canSeePlayer) {
        // Always update last known position — mutate in-place to avoid heap allocation
        if (!enemy._lastKnownPlayer) enemy._lastKnownPlayer = { x: player.x, y: player.y };
        else { enemy._lastKnownPlayer.x = player.x; enemy._lastKnownPlayer.y = player.y; }

        if (enemy._aiState === 'patrol' || enemy._aiState === 'search') {
            // Just spotted — enter chase
            enemy._aiState = 'chase';
            enemy._breakOffTimer = 0;
        } else if (enemy._aiState === 'chase' && dist < (enemy.behavior === 'sniper' ? 480 : 350)) {
            enemy._aiState = 'combat';
            enemy._breakOffTimer = 0;
        } else if (enemy._aiState === 'combat' && dist > 500) {
            enemy._aiState = 'chase';
        }
        enemy._breakOffTimer = 0; // reset break-off countdown whenever player is seen

    } else {
        // Player not detectable this frame
        if (enemy._aiState === 'chase' || enemy._aiState === 'combat') {
            // Start or continue break-off timer — only give up after 3s far away
            enemy._breakOffTimer = (enemy._breakOffTimer || 0) + GAME.loop.delta;
            if (enemy._breakOffTimer > 3000) {
                // Player has been out of range long enough — fall back to search
                enemy._aiState = 'search';
                enemy._stateTimer = time;
                enemy._breakOffTimer = 0;
            }
            // While timer is running: keep chasing last known position
        }
        if (enemy._aiState === 'search' && time - enemy._stateTimer > 5000) {
            enemy._aiState = 'patrol';
            enemy._lastKnownPlayer = null;
            enemy._patrolTarget = { x: Phaser.Math.Between(300, 3700), y: Phaser.Math.Between(300, 3700) };
        }
    }

    // If shot from outside vision cone, immediately alert regardless of cone
    if (enemy._justHit) {
        if (enemy._aiState === 'patrol' || enemy._aiState === 'search') {
            enemy._aiState = 'chase';
            if (!enemy._lastKnownPlayer) enemy._lastKnownPlayer = { x: player.x, y: player.y };
            else { enemy._lastKnownPlayer.x = player.x; enemy._lastKnownPlayer.y = player.y; }
        }
        enemy._justHit = false;
        enemy._breakOffTimer = 0;
    }

    // Squad alert: when one member detects the player, alert nearby squad mates
    if (_canSeePlayer && enemy._squadId != null) {
        enemies.getChildren().forEach(mate => {
            if (!mate.active || mate === enemy || mate._squadId !== enemy._squadId) return;
            if (mate._aiState === 'patrol' || mate._aiState === 'search') {
                const _mateDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, mate.x, mate.y);
                if (_mateDist < 800) {
                    mate._aiState = 'chase';
                    if (!mate._lastKnownPlayer) mate._lastKnownPlayer = { x: player.x, y: player.y };
                    else { mate._lastKnownPlayer.x = player.x; mate._lastKnownPlayer.y = player.y; }
                    mate._breakOffTimer = 0;
                }
            }
        });
    }

}

function _calcEnemyBehaviorVelocity(enemy, dist, angle, speed, time) {
    let vx = 0, vy = 0;
    // AI BEHAVIOR PATTERNS
    const beh = enemy.behavior || 'circle';

    // Patrol: wander to random target — always moving, never spinning
    if (enemy._aiState === 'patrol') {
        const ptDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy._patrolTarget.x, enemy._patrolTarget.y);
        // Pick new target when close enough to current one
        if (ptDist < 120) {
            // If in a squad, follow squad leader's general area
            if (enemy._squadLeader && enemy._squadLeader.active && enemy._squadLeader !== enemy) {
                const leader = enemy._squadLeader;
                const _offX = (Math.random() - 0.5) * 300;
                const _offY = (Math.random() - 0.5) * 300;
                const _tx = Phaser.Math.Clamp(leader._patrolTarget.x + _offX, 200, 3800);
                const _ty = Phaser.Math.Clamp(leader._patrolTarget.y + _offY, 200, 3800);
                enemy._patrolTarget = { x: _tx, y: _ty };
            } else {
                // Pick a random point across the map — bias toward center to keep enemies roaming
                const _angle = Math.random() * Math.PI * 2;
                const _dist  = 400 + Math.random() * 800;
                const _cx = 2000 + (Math.random() - 0.5) * 1200; // center-biased origin
                const _cy = WORLD_CENTER + (Math.random() - 0.5) * 1200;
                const _tx = Phaser.Math.Clamp(_cx + Math.cos(_angle) * _dist, 200, 3800);
                const _ty = Phaser.Math.Clamp(_cy + Math.sin(_angle) * _dist, 200, 3800);
                enemy._patrolTarget = { x: _tx, y: _ty };
            }
        }
        const ptAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy._patrolTarget.x, enemy._patrolTarget.y);
        // Minimum 60% speed so patrol is always visible movement
        const ptSpeed = Math.max(speed * 0.55, 60);
        vx = Math.cos(ptAngle) * ptSpeed;
        vy = Math.sin(ptAngle) * ptSpeed;
    }
    // Search: move to last known player position
    else if (enemy._aiState === 'search') {
        const lkp = enemy._lastKnownPlayer;
        if (lkp) {
            const lkDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, lkp.x, lkp.y);
            if (lkDist > 60) {
                const lkAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, lkp.x, lkp.y);
                vx = Math.cos(lkAngle) * speed * 0.7;
                vy = Math.sin(lkAngle) * speed * 0.7;
            }
        }
    }
    // Chase/Combat: use behavior patterns toward player
    // Strafe direction: periodically reverse to prevent perpetual orbits
    else if (beh === 'circle') {
        if (!enemy._strafeDir) enemy._strafeDir = Phaser.Math.RND.pick([-1, 1]);
        if (!enemy._strafeFlipTime) enemy._strafeFlipTime = time + 2000 + Math.random() * 3000;
        if (time > enemy._strafeFlipTime) {
            enemy._strafeDir *= -1;
            enemy._strafeFlipTime = time + 2000 + Math.random() * 3000;
        }
        if (dist > 350) {
            vx = Math.cos(angle) * speed;
            vy = Math.sin(angle) * speed;
        } else if (dist < 200) {
            vx = -Math.cos(angle) * speed;
            vy = -Math.sin(angle) * speed;
        } else {
            // Strafe with a forward/backward bias to create spiraling, not pure circles
            const strafe = angle + (Math.PI / 2) * enemy._strafeDir;
            const fwdBias = dist > 280 ? 0.3 : -0.2; // push in or out to avoid stable orbit
            vx = Math.cos(strafe) * speed * 0.8 + Math.cos(angle) * speed * fwdBias;
            vy = Math.sin(strafe) * speed * 0.8 + Math.sin(angle) * speed * fwdBias;
        }
    }
    else if (beh === 'rusher') {
        if (!enemy._strafeDir) enemy._strafeDir = Phaser.Math.RND.pick([-1, 1]);
        if (!enemy._strafeFlipTime) enemy._strafeFlipTime = time + 1500 + Math.random() * 2000;
        if (time > enemy._strafeFlipTime) {
            enemy._strafeDir *= -1;
            enemy._strafeFlipTime = time + 1500 + Math.random() * 2000;
        }
        if (dist > 260) {
            vx = Math.cos(angle) * speed;
            vy = Math.sin(angle) * speed;
        } else if (dist < 160) {
            vx = -Math.cos(angle) * speed * 0.8;
            vy = -Math.sin(angle) * speed * 0.8;
        } else {
            const strafe = angle + (Math.PI / 2) * enemy._strafeDir;
            // Rushers add forward bias to keep closing in
            vx = Math.cos(strafe) * speed * 0.6 + Math.cos(angle) * speed * 0.4;
            vy = Math.sin(strafe) * speed * 0.6 + Math.sin(angle) * speed * 0.4;
        }
    }
    else if (beh === 'sniper') {
        if (!enemy._strafeDir) enemy._strafeDir = Phaser.Math.RND.pick([-1, 1]);
        if (!enemy._strafeFlipTime) enemy._strafeFlipTime = time + 3000 + Math.random() * 4000;
        if (time > enemy._strafeFlipTime) {
            enemy._strafeDir *= -1;
            enemy._strafeFlipTime = time + 3000 + Math.random() * 4000;
        }
        if (dist > 480) {
            vx = Math.cos(angle) * speed * 0.5;
            vy = Math.sin(angle) * speed * 0.5;
        } else if (dist < 400) {
            vx = -Math.cos(angle) * speed * 0.6;
            vy = -Math.sin(angle) * speed * 0.6;
        } else {
            const strafe = angle + (Math.PI / 2) * enemy._strafeDir;
            vx = Math.cos(strafe) * speed * 0.3;
            vy = Math.sin(strafe) * speed * 0.3;
        }
    }
    else if (beh === 'flanker') {
        // Arcs wide to get behind the player
        if (!enemy.flankDir) enemy.flankDir = Phaser.Math.RND.pick([-1, 1]);
        if (dist > 500) {
            vx = Math.cos(angle) * speed;
            vy = Math.sin(angle) * speed;
        } else {
            const fa = angle + (Math.PI / 2) * enemy.flankDir;
            vx = Math.cos(fa) * speed * 0.75 + Math.cos(angle) * speed * 0.25;
            vy = Math.sin(fa) * speed * 0.75 + Math.sin(angle) * speed * 0.25;
        }
    }
    else if (beh === 'ambusher') {
        // Stays still or creeps slowly until player is close, then rushes in
        if (dist > 350) {
            // Creep toward player slowly — ambush positioning
            vx = Math.cos(angle) * speed * 0.2;
            vy = Math.sin(angle) * speed * 0.2;
        } else if (dist > 150) {
            // Close enough — spring the ambush, rush in fast
            vx = Math.cos(angle) * speed * 1.1;
            vy = Math.sin(angle) * speed * 1.1;
        } else {
            // Point-blank — strafe to avoid return fire
            const strafe = angle + Math.PI / 2 * (enemy.flankDir || 1);
            vx = Math.cos(strafe) * speed * 0.9;
            vy = Math.sin(strafe) * speed * 0.9;
        }
    }
    else if (beh === 'guardian') {
        // Holds ground — only moves to maintain optimal range, prioritizes staying near spawn
        if (!enemy._guardPos) enemy._guardPos = { x: enemy.x, y: enemy.y };
        const guardDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy._guardPos.x, enemy._guardPos.y);
        if (dist < 250) {
            // Player too close — back away
            vx = -Math.cos(angle) * speed * 0.7;
            vy = -Math.sin(angle) * speed * 0.7;
        } else if (guardDist > 300) {
            // Drifted too far from guard position — return
            const gAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, enemy._guardPos.x, enemy._guardPos.y);
            vx = Math.cos(gAngle) * speed * 0.6;
            vy = Math.sin(gAngle) * speed * 0.6;
        } else if (dist > 500) {
            // Player far away — slowly advance
            vx = Math.cos(angle) * speed * 0.3;
            vy = Math.sin(angle) * speed * 0.3;
        } else {
            // Optimal range — strafe slowly
            const strafe = angle + Math.PI / 2;
            vx = Math.cos(strafe) * speed * 0.25;
            vy = Math.sin(strafe) * speed * 0.25;
        }
    }

    return {vx, vy};
}

function _handleEnemyFiringDecision(scene, enemy, dist, time) {
    if (enemy._aiState !== 'combat' && enemy._aiState !== 'chase') return; // no shooting in patrol/search
    const _pWep = enemy.loadout?.primary || 'smg';
    const fireRange  = (_pWep === 'fth' || _pWep === 'sg') ? 320
                     : enemy.behavior === 'sniper' ? 1000 : 750;
    const wepReload  = WEAPONS[_pWep]?.reload || 300;
    const reloadMult = enemy.behavior === 'sniper' ? 1.4
                     : enemy.behavior === 'rusher' ? 0.85
                     : enemy.behavior === 'flanker' ? 1.0 : 1.1;
    const _eliteFireMult = (enemy._swiftFireRateMult || 1);
    if (!enemy._fireGrace && dist < fireRange && time > (enemy.lastFireTime || 0) + wepReload * reloadMult * _eliteFireMult) {
        enemyFire(scene, enemy, time);
        enemy.lastFireTime = time;
        // Sniper Elite: cloak after firing
        if (enemy.enemyType === 'sniperElite' && enemy._onFire) enemy._onFire();
    }

    // Secondary weapon — fires less frequently, with per-weapon range gates
    const secKey = enemy.loadout?.secondary;
    if (secKey && secKey !== 'none') {
        const secW    = WEAPONS[secKey];
        const secCd   = (secW?.reload || 3500) * 1.2;
        const secRange = secKey === 'emp'  ? WEAPONS.emp.radius
                     : secKey === 'gl'   ? 700
                     : secKey === 'fth'  ? 320
                     : secKey === 'rail' ? 1200
                     : secKey === 'sr'   ? 1000
                     : fireRange;
        if (!enemy._fireGrace && dist < secRange && time > enemy.lastSecTime + secCd) {
            enemyFireSecondary(scene, enemy, secKey, time);
            enemy.lastSecTime = time;
        }
    }

    // Enemy mod activation
    const eMod = enemy.loadout?.mod;
    if (eMod && eMod !== 'none' && !enemy.isModActive) {
        const modDef   = WEAPONS[eMod];
        const cooldown = (modDef?.cooldown || 8000) * 1.5;
        const lastMT   = enemy.lastModTime ?? -99999;
        if (time > lastMT + cooldown) {
            activateEnemyMod(scene, enemy, eMod, time);
        }
    }
}



function _syncEnemyVisuals(scene, enemy, time) {
    // Always sync visual container to physics body
    enemy.visuals.setPosition(enemy.x, enemy.y);

    // Torso rotation: in combat/chase → aim at player. In patrol/search → follow body direction.
    if (enemy.torso && player && !enemy.isStunned) {
        enemy.torso.setPosition(enemy.x, enemy.y);
        const _state = enemy._aiState || 'patrol';
        if (_state === 'combat' || _state === 'chase') {
            // Lock onto player
            const aimAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            enemy.torso.rotation = Phaser.Math.Angle.RotateTo(enemy.torso.rotation, aimAngle, 0.1);
        } else {
            // Follow legs direction — torso matches body facing
            const bodyAngle = enemy.visuals?.rotation ?? enemy.torso.rotation;
            enemy.torso.rotation = Phaser.Math.Angle.RotateTo(enemy.torso.rotation, bodyAngle, 0.06);
        }
    } else if (enemy.torso) {
        enemy.torso.setPosition(enemy.x, enemy.y);
    }
    // Sync shield ring to enemy position
    if (enemy.shieldRing?.active) enemy.shieldRing.setPosition(enemy.x, enemy.y);
    // Sync commander/medic labels
    if (enemy.cmdLabel?.active)   enemy.cmdLabel.setPosition(enemy.x, enemy.y - 70);
    if (enemy.medicLabel?.active) enemy.medicLabel.setPosition(enemy.x, enemy.y - 52);
    if (enemy.medicCross?.active) enemy.medicCross.setPosition(enemy.x, enemy.y - 64);
    // Commander buff aura — boost nearby standard enemies
    if (enemy.isCommander && player) {
        enemies.getChildren().forEach(other => {
            if (other === enemy || !other.active) return;
            const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y);
            if (d < 300) {
                const base = CHASSIS[other.loadout?.chassis]?.spd || 250;
                other.speed = base * 1.2;
            } else {
                const base = CHASSIS[other.loadout?.chassis]?.spd || 250;
                if (other.speed > base) other.speed = base;
            }
        });
    }
    // Chassis movement FX
    syncEnemyChassisEffect(scene, time, enemy);
}

function _applyEnemyObstacleAvoidance(enemy, angle, speed, time, vx, vy) {
    // ── OBSTACLE AVOIDANCE STEERING ──────────────────────
    // ── OBSTACLE AVOIDANCE STEERING ──────────────────────
    // Cast feeler rays ahead of travel direction; steer away from nearby cover
    if ((vx !== 0 || vy !== 0) && coverObjects) {
        const _travelAngle = Math.atan2(vy, vx);
        const _feelerDist  = 90;   // how far ahead to sense
        const _avoidRadius = 70;   // cover objects within this dist trigger avoidance
        let _avoidX = 0, _avoidY = 0;

        // Three feelers: straight, left-20°, right-20° (module-level constant — no per-frame allocation)
        for (const _fOffset of _FEELER_OFFSETS) {
            const _fa  = _travelAngle + _fOffset;
            const _ftx = enemy.x + Math.cos(_fa) * _feelerDist;
            const _fty = enemy.y + Math.sin(_fa) * _feelerDist;

            coverObjects.getChildren().forEach(c => {
                if (!c.active) return;
                // Use stored center coords (coverCX/CY) for correct distance checks
                const _cCX = c.coverCX !== undefined ? c.coverCX : c.x + (c.width||60)/2;
                const _cCY = c.coverCY !== undefined ? c.coverCY : c.y + (c.height||60)/2;
                const _cdist = Phaser.Math.Distance.Between(_ftx, _fty, _cCX, _cCY);
                if (_cdist < _avoidRadius + (c.width || 60) * 0.5) {
                    const _pushAngle = Phaser.Math.Angle.Between(_cCX, _cCY, enemy.x, enemy.y);
                    const _pushStr   = (_avoidRadius - Math.max(0, _cdist - (c.width||60)*0.5)) / _avoidRadius;
                    _avoidX += Math.cos(_pushAngle) * _pushStr * speed * 1.2;
                    _avoidY += Math.sin(_pushAngle) * _pushStr * speed * 1.2;
                }
            });
        }

        // Blend avoidance into desired velocity
        if (_avoidX !== 0 || _avoidY !== 0) {
            vx += _avoidX * 0.6;
            vy += _avoidY * 0.6;
            // Re-normalise to original speed so avoidance doesn't slow/accelerate
            const _newSpd = Math.sqrt(vx*vx + vy*vy);
            if (_newSpd > 0) {
                const _origSpd = Math.sqrt((vx-_avoidX*0.6)**2 + (vy-_avoidY*0.6)**2) || speed;
                vx = (vx / _newSpd) * _origSpd;
                vy = (vy / _newSpd) * _origSpd;
            }
        }
    }

    // Wall-stuck detection: if enemy has barely moved but has velocity, nudge them
    const _curSpd = Math.sqrt(vx*vx + vy*vy);
    if (_curSpd > 20) {
        const _movedSince = enemy._lastPos ? Phaser.Math.Distance.Between(enemy.x, enemy.y, enemy._lastPos.x, enemy._lastPos.y) : 999;
        if (!enemy._stuckCheckTime) enemy._stuckCheckTime = time;
        if (time - enemy._stuckCheckTime > 800) {
            if (_movedSince < 15) {
                // Stuck against wall — pick a new random patrol target and add a perpendicular nudge
                enemy._patrolTarget = { x: Phaser.Math.Between(300, 3700), y: Phaser.Math.Between(300, 3700) };
                if (enemy._aiState === 'combat' || enemy._aiState === 'chase') enemy._aiState = 'patrol';
                vx += (Math.random() - 0.5) * speed * 2;
                vy += (Math.random() - 0.5) * speed * 2;
            }
            enemy._stuckCheckTime = time;
            // Mutate in-place to avoid per-frame heap allocation
            if (!enemy._lastPos) enemy._lastPos = { x: enemy.x, y: enemy.y };
            else { enemy._lastPos.x = enemy.x; enemy._lastPos.y = enemy.y; }
        }
    }

    // Tank locomotion: rotate legs toward travel direction, drive forward/back only
    const desiredAngle = (vx !== 0 || vy !== 0)
        ? Math.atan2(vy, vx)
        : enemy.visuals.rotation;
    const _turnRate = (enemy._aiState === 'patrol' || enemy._aiState === 'search') ? 0.14 : 0.08;
    enemy.visuals.rotation = Phaser.Math.Angle.RotateTo(
        enemy.visuals.rotation, desiredAngle, _turnRate);
    const _angleMismatch = Math.abs(Phaser.Math.Angle.Wrap(desiredAngle - enemy.visuals.rotation));
    const _turnBrake = _angleMismatch > 1.2 ? 0.25 : _angleMismatch > 0.6 ? 0.55 : 1.0;
    const spd = Math.sqrt(vx*vx + vy*vy) * _turnBrake;
    enemy.body.setVelocity(
        Math.cos(enemy.visuals.rotation) * spd,
        Math.sin(enemy.visuals.rotation) * spd
    );
    enemy.body.setImmovable(false);
}

/**
 * Per-enemy chassis movement effects — mirrors player effects but uses
 * per-enemy state stored on the entity itself.
 */
function syncEnemyChassisEffect(scene, time, enemy) {
    if (!enemy.loadout) return;
    const chassis = enemy.loadout.chassis;
    const vx = enemy.body?.velocity?.x || 0;
    const vy = enemy.body?.velocity?.y || 0;
    const speed  = Math.sqrt(vx*vx + vy*vy);
    const moving = speed > 10;
    const rot    = enemy.visuals.rotation;
    const scale  = CHASSIS[chassis].scale;

    if      (chassis === 'light')  _syncEnemyLightFX(scene, time, enemy, scale, rot, enemy.x, enemy.y, speed, moving);
    else if (chassis === 'medium') _syncEnemyMediumFX(scene, time, enemy, scale, rot, enemy.x, enemy.y, speed, moving);
    else if (chassis === 'heavy')  _syncEnemyHeavyFX(scene, time, enemy, scale, rot, enemy.x, enemy.y, speed, moving);
}

// ── syncEnemyChassisEffect sub-functions ────────────────────────────────

/** Light enemy: ghost trail every 12px of movement + alternating quick footprints. */
function _syncEnemyLightFX(scene, time, enemy, scale, rot, ex, ey, speed, moving) {
    if (moving) {
        const dist = Phaser.Math.Distance.Between(ex, ey, enemy.fxLastX, enemy.fxLastY);
        if (dist >= 12) {
            enemy.fxLastX = ex; enemy.fxLastY = ey;
            const colors = ENEMY_COLORS['light'];
            const ghost  = buildEnemyTorso(scene, 'light', colors);
            ghost.setPosition(ex, ey).setRotation(rot).setScale(scale);
            ghost.setAlpha(0.3).setDepth(8);
            scene.tweens.add({ targets: ghost, alpha: 0, duration: 220, onComplete: () => ghost.destroy() });
        }
    }
    if (moving && time >= enemy.fxFootTimer) {
        const interval = Math.max(90, 260 - speed * 0.5);
        enemy.fxFootTimer = time + interval;
        const perp = rot + Math.PI / 2;
        const rear = rot + Math.PI;
        const rx = ex + Math.cos(rear) * 12 * scale;
        const ry = ey + Math.sin(rear) * 12 * scale;
        spawnFootprint(scene,
            rx + Math.cos(perp) * 8 * scale * enemy.fxFootSide,
            ry + Math.sin(perp) * 8 * scale * enemy.fxFootSide,
            rot, 12 * scale, 6 * scale, 1200, 0xcc2200);
        enemy.fxFootSide *= -1;
    }
}

/** Medium enemy: motion-blur ghost every 16px of movement + alternating footprints. */
function _syncEnemyMediumFX(scene, time, enemy, scale, rot, ex, ey, speed, moving) {
    if (moving) {
        const dist = Phaser.Math.Distance.Between(ex, ey, enemy.fxLastMX, enemy.fxLastMY);
        if (dist >= 16) {
            enemy.fxLastMX = ex; enemy.fxLastMY = ey;
            const colors = ENEMY_COLORS['medium'];
            const ghost  = buildEnemyTorso(scene, 'medium', colors);
            ghost.setPosition(ex, ey).setRotation(rot).setScale(scale);
            ghost.setAlpha(0.22).setDepth(8);
            scene.tweens.add({ targets: ghost, alpha: 0, duration: 180, onComplete: () => ghost.destroy() });
        }
    }
    if (moving && time >= enemy.fxFootTimer) {
        const interval = Math.max(140, 340 - speed * 0.6);
        enemy.fxFootTimer = time + interval;
        const perp = rot + Math.PI / 2;
        const rear = rot + Math.PI;
        const rx = ex + Math.cos(rear) * 16 * scale;
        const ry = ey + Math.sin(rear) * 16 * scale;
        spawnFootprint(scene,
            rx + Math.cos(perp) * 12 * scale * enemy.fxFootSide,
            ry + Math.sin(perp) * 12 * scale * enemy.fxFootSide,
            rot, 16 * scale, 8 * scale, 1800, 0xcc2200);
        enemy.fxFootSide *= -1;
    }
}

/** Heavy enemy: wide dual footprints + expanding shockwave ring on each step. */
function _syncEnemyHeavyFX(scene, time, enemy, scale, rot, ex, ey, speed, moving) {
    if (!moving || time < enemy.fxShockTimer) return;
    const interval = Math.max(320, 700 - speed * 1.2);
    enemy.fxShockTimer = time + interval;
    const perp = rot + Math.PI / 2;
    const rear = rot + Math.PI;
    const rx = ex + Math.cos(rear) * 24 * scale;
    const ry = ey + Math.sin(rear) * 24 * scale;
    [-1, 1].forEach(side => {
        spawnFootprint(scene,
            rx + Math.cos(perp) * 20 * scale * side,
            ry + Math.sin(perp) * 20 * scale * side,
            rot, 22 * scale, 11 * scale, 2500, 0xcc2200);
    });
    const col = ENEMY_COLORS['heavy'].head;
    const ring = scene.add.circle(ex, ey, 10, col, 0)
        .setStrokeStyle(3, col, 0.9).setDepth(3);
    scene.tweens.add({ targets: ring, radius: 70 * scale, alpha: 0, duration: 500,
        ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
}
