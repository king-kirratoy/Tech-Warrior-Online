// ═══════════ ENEMY SPAWNING ═══════════

function randomEnemyLoadout() {
    const rnd = Phaser.Math.RND;
    const chassis = rnd.pick(['light', 'medium', 'heavy']);

    // ── Chassis-locked weapon pools (mirrors player restrictions) ──
    const LIGHT_WEAPONS  = ['smg','mg','sg','br','fth','plsm'];
    const MEDIUM_WEAPONS = ['mg','sg','br','hr','fth','sr','gl','plsm'];
    const HEAVY_WEAPONS  = ['hr','sg','gl','rl','fth','plsm','rail'];

    const weaponPool = chassis === 'light' ? LIGHT_WEAPONS
                     : chassis === 'medium' ? MEDIUM_WEAPONS
                     : HEAVY_WEAPONS;

    let L = 'none', R = 'none';
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

    // ── Chassis-locked mod pools ──
    const LIGHT_MODS  = ['jump','decoy','barrier','ghost_step'];
    const MEDIUM_MODS = ['barrier','atk_drone','repair','rage'];
    const HEAVY_MODS  = ['barrier','missile','fortress_mode','emp'];

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
    const _spreadMap = { smg:0.28, mg:0.18, br:0.14, sg:0.22, hr:0.10, fth:0, sr:0.06, gl:0, rl:0, plsm:0.10 };
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
    const _secScale = { rail:0.30, sr:0.40, plsm:0.40, gl:0.55, rl:0.55, hr:0.65, br:0.75 };
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
        let speed      = _legsOk ? (enemy.speed || _baseSpd) : _baseSpd * 0.5;
        // Suppressor Aura: enemies within 200px move 15% slower
        if (_perkState.suppressorAura && player) {
            const _saDist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
            if (_saDist < 200) speed *= 0.85;
        }

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
    const wepReload  = WEAPONS[_pWep]?.fireRate || 300;
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
        const secCd   = (secW?.fireRate || 3500) * 1.2;
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
    // Predator Lens: highlight enemies >400px (red-orange outline)
    if (_perkState.predatorLens && player) {
        const _plDist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
        const _shouldHL = _plDist > 400;
        if (_shouldHL !== enemy._predatorHighlight) {
            enemy._predatorHighlight = _shouldHL;
            enemy.torso?.list?.forEach(s => {
                if (s.setStrokeStyle) s.setStrokeStyle(_shouldHL ? 2 : 0, 0xff4400);
            });
        }
    } else if (enemy._predatorHighlight) {
        enemy._predatorHighlight = false;
        enemy.torso?.list?.forEach(s => { if (s.setStrokeStyle) s.setStrokeStyle(0); });
    }
    // Echo Targeting: teal outline on revealed enemies
    if (enemy._echoRevealedUntil && time < enemy._echoRevealedUntil) {
        if (!enemy._echoHighlight) {
            enemy._echoHighlight = true;
            enemy.torso?.list?.forEach(s => { if (s.setStrokeStyle) s.setStrokeStyle(2, 0x00ffcc); });
        }
    } else if (enemy._echoHighlight) {
        enemy._echoHighlight = false;
        enemy.torso?.list?.forEach(s => { if (s.setStrokeStyle) s.setStrokeStyle(0); });
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

// ═══════════ BOSS SYSTEM ═══════════

// Boss cycle: 8 bosses, one every 5 rounds starting at R5, cycling after R40.
// R5=Warden, R10=Razors, R15=Architect, R20=Juggernaut,
// R25=Swarm, R30=Mirror, R35=Titan, R40=Core, R45=Warden again...
// Boss definitions are in this file. Boss LOOT is in js/loot-system.js (BOSS_DROP_TABLE).
function spawnBoss(scene, roundNum) {
    if (typeof sndBossSpawn === 'function') sndBossSpawn(); // → Phase 8 sound (defined above)
    const bossCycle = (Math.floor(roundNum / 5) - 1) % 8;
    if (bossCycle === 0) spawnWarden(scene);
    else if (bossCycle === 1) spawnTwinRazors(scene);
    else if (bossCycle === 2) spawnArchitect(scene);
    else if (bossCycle === 3) spawnJuggernaut(scene);
    else if (bossCycle === 4) spawnSwarm(scene);
    else if (bossCycle === 5) spawnMirror(scene);
    else if (bossCycle === 6) spawnTitan(scene);
    else spawnCore(scene);
}

function _bossSpawnPos() {
    let x, y, att = 0;
    do {
        x = Phaser.Math.Between(300, 3700);
        y = Phaser.Math.Between(300, 3700);
        att++;
    } while (player && Phaser.Math.Distance.Between(x, y, player.x, player.y) < 1100 && att < 25);
    return { x, y };
}

function _showBossTitle(scene, name, subtitle, color) {
    const tx = scene.add.text(window.innerWidth/2, window.innerHeight*0.18, name, {
        font: 'bold 28px monospace', fill: '#' + color.toString(16).padStart(6,'0'),
        stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(9000).setAlpha(0);
    const sub = scene.add.text(window.innerWidth/2, window.innerHeight*0.18 + 38, subtitle, {
        font: '13px monospace', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(9000).setAlpha(0);
    scene.tweens.add({ targets: [tx, sub], alpha: 1, duration: 400, hold: 2200,
        onComplete: () => { scene.tweens.add({ targets:[tx,sub], alpha:0, duration:500, onComplete:()=>{ tx.destroy(); sub.destroy(); }}); }
    });
    _tone(60, 'sawtooth', 0.5, 0.4, 40);
    _tone(90, 'square',   0.4, 0.25, 70, 0.1);
    _noise(0.4, 0.35, 0.05, 0, 300);
    _tone(220, 'sine', 0.15, 0.08, 180, 0.3);
}

function _buildBossEnemy(scene, x, y, chassisKey, colorSet, hpMult, speedMult) {
    const chassisS = CHASSIS[chassisKey];
    const sz = chassisKey === 'heavy' ? 60 : chassisKey === 'light' ? 38 : 50;
    const e = scene.add.rectangle(x, y, sz, sz, 0x000000, 0);
    scene.physics.add.existing(e);
    e.body.setCircle(sz * 0.7);
    const scl = chassisKey === 'heavy' ? 1.7 : chassisKey === 'light' ? 0.85 : 1.15;
    e.visuals = buildEnemyMech(scene, chassisKey, colorSet);
    e.visuals.setPosition(x, y).setScale(scl);
    e.torso = buildEnemyTorso(scene, chassisKey, colorSet);
    e.torso.setPosition(x, y).setScale(scl).setDepth(6);
    e.speed = chassisS.spd * (speedMult || 1.0);
    const _bossLvl = (window._activeCampaignConfig?.enemyLevel) || _round;
    const bm = hpMult * (1 + (_bossLvl - 1) * 0.10);
    e.comp = {
        core: { hp: Math.round(chassisS.coreHP * bm), max: Math.round(chassisS.coreHP * bm) },
        lArm: { hp: Math.round(chassisS.armHP  * bm), max: Math.round(chassisS.armHP  * bm) },
        rArm: { hp: Math.round(chassisS.armHP  * bm), max: Math.round(chassisS.armHP  * bm) },
        legs: { hp: Math.round(chassisS.legHP  * bm), max: Math.round(chassisS.legHP  * bm) },
    };
    e.health    = Object.values(e.comp).reduce((s,c) => s+c.hp, 0);
    e.maxHealth = e.health;
    e.reloadL = 0; e.reloadR = 0;
    e.lastSecTime = -99999; e.lastModTime = -99999; e.isModActive = false;
    e._passiveDR  = chassisKey === 'heavy' ? 0.15 : 0;
    e._reloadMult = 1.0; e._augState = {};
    e.fxFootTimer = 0; e.fxFootSide = 1; e.fxShockTimer = 0;
    e.fxLastX = x; e.fxLastY = y; e.fxLastMX = x; e.fxLastMY = y;
    e._fireGrace = true;
    setTimeout(() => { if (e && e.active) e._fireGrace = false; }, 2000);
    e.lastFireTime = 0; e.lastSecTime = 0;
    e._shieldHP = 0; e._shieldMax = 0; e._shieldAbsorb = 0;
    e._visionConeGfx = scene.add.graphics().setDepth(3);
    enemies.add(e);
    if (coverObjects) scene.physics.add.collider(e, coverObjects);
    return e;
}

function _addBossLabel(scene, e, text, color, yOff) {
    e.bossLabel = scene.add.text(e.x, e.y - (yOff||75), text, {
        font: 'bold 11px monospace', fill: '#' + color.toString(16).padStart(6,'0'),
        stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);
    // Store tween reference so _onDestroy can stop it before destroying the target.
    e._bossLabelTween = scene.tweens.add({ targets: e.bossLabel, alpha: 0.45, duration: 600, yoyo: true, repeat: -1 });
}

function _addBossHPBar(scene, e, color, bossName) {
    // Store color as CSS hex string for DOM bar; no Phaser objects needed
    e._bossBarColor = '#' + color.toString(16).padStart(6, '0');
    e._bossBarName  = bossName || e.bossType || 'BOSS';
    // Show the DOM boss bar
    const hud  = document.getElementById('boss-hud');
    const fill = document.getElementById('boss-bar-fill');
    const name = document.getElementById('boss-bar-name');
    if (hud)  hud.style.display = 'block';
    if (fill) {
        fill.style.background = 'linear-gradient(90deg,' + e._bossBarColor + 'aa,' + e._bossBarColor + ')';
        fill.style.boxShadow  = '0 0 12px ' + e._bossBarColor + '99';
        fill.style.width = '100%';
    }
    if (name) name.style.color = e._bossBarColor;
    _updateBossHPBar(e);
}

function _updateBossHPBar(e) {
    const fill = document.getElementById('boss-bar-fill');
    const name = document.getElementById('boss-bar-name');
    if (!fill) return;
    const pct = Math.max(0, e.health / e.maxHealth);
    fill.style.width = (pct * 100).toFixed(1) + '%';
    if (name && e._bossBarName) name.textContent = e._bossBarName;
}

function _hideBossHPBar() {
    const hud = document.getElementById('boss-hud');
    if (hud) hud.style.display = 'none';
}

// ═══════════ BOSS VARIANTS ═══════════

// BOSS 1: THE WARDEN (Round 5)
function spawnWarden(scene) {
    const p = _bossSpawnPos();
    const e = _buildBossEnemy(scene, p.x, p.y, 'heavy', BOSS_COLORS.warden, 3.0, 0.9);
    e.loadout = { chassis:'heavy', primary:'mg', secondary:'barrier',
                  mod:'rage', shld:'heavy_shield', leg:'mag_anchors', aug:'reactive_plating' };
    e.behavior = 'circle'; e.isBoss = true; e.bossType = 'warden';
    _addBossLabel(scene, e, '[ THE WARDEN ]', 0x8800ff, 75);
    _addBossHPBar(scene, e, 0x8800ff, 'THE WARDEN');
    _showBossTitle(scene, 'THE WARDEN', 'HIT THE BACK — FRONTAL IMMUNITY ACTIVE', 0xaa44ff);

    e._wardenShieldAngle = 0;
    e._wardenImmuneSweep = Math.PI * 1.1;
    e._wardenShieldGfx = scene.add.graphics().setDepth(7);
    e._wardenPhase = 0;

    e._wardenUpdate = scene.time.addEvent({ delay: 16, loop: true, callback: () => {
        if (!e || !e.active || !player || !player.active) return;
        const toPlayer = Math.atan2(player.y - e.y, player.x - e.x);
        e._wardenShieldAngle = toPlayer;
        const g = e._wardenShieldGfx;
        g.clear();
        if (!isDeployed) return;
        const arcStart = e._wardenShieldAngle - e._wardenImmuneSweep / 2;
        const arcEnd   = e._wardenShieldAngle + e._wardenImmuneSweep / 2;
        g.lineStyle(4, 0x8800ff, 0.55);
        g.beginPath();
        g.arc(e.x, e.y, 42, arcStart, arcEnd, false);
        g.strokePath();
        g.lineStyle(2, 0xcc66ff, 0.25);
        g.beginPath();
        g.arc(e.x, e.y, 48, arcStart, arcEnd, false);
        g.strokePath();
        _updateBossHPBar(e);
        if (e.bossLabel && e.bossLabel.active) e.bossLabel.setPosition(e.x, e.y - 75);
    }});

    e._wardenPhaseCheck = scene.time.addEvent({ delay: 500, loop: true, callback: () => {
        if (!e || !e.active) return;
        const pct = e.health / e.maxHealth;
        if (pct < 0.5 && e._wardenPhase === 0) {
            e._wardenPhase = 1;
            e._wardenImmuneSweep = Math.PI * 1.4;
            e.speed *= 1.25;
            const warn = scene.add.text(window.innerWidth/2, window.innerHeight*0.28,
                'WARDEN ENRAGED', { font:'bold 18px monospace', fill:'#ff44ff', stroke:'#000', strokeThickness:4 })
                .setScrollFactor(0).setDepth(9001).setOrigin(0.5);
            scene.tweens.add({ targets: warn, alpha:0, duration:1800, onComplete:()=>warn.destroy() });
            _tone(55,'sawtooth',0.4,0.3,35);
            _tone(80,'square',0.3,0.2,60,0.1);
        }
    }});

    e._onDestroy = function() {
        if (e._wardenUpdate) e._wardenUpdate.remove();
        if (e._wardenPhaseCheck) e._wardenPhaseCheck.remove();
        if (e._wardenShieldGfx) e._wardenShieldGfx.destroy();
        if (e._bossLabelTween) e._bossLabelTween.stop();
        if (e.bossLabel) e.bossLabel.destroy();
        _hideBossHPBar();
    };
}

// BOSS 2: TWIN RAZORS (Round 10)
function spawnTwinRazors(scene) {
    const p = _bossSpawnPos();
    const x2 = p.x + (Math.random() > 0.5 ? 180 : -180);
    const y2 = p.y + Phaser.Math.Between(-80, 80);

    const eA = _buildBossEnemy(scene, p.x, p.y, 'light', BOSS_COLORS.razor, 2.5, 1.25);
    const eB = _buildBossEnemy(scene, x2,  y2,  'light', BOSS_COLORS.razor, 1.8, 1.25);

    // Twin Razors: 2 enemies, both must die to complete the round
    _roundTotal = 2;

    const totalHP = eA.health + eB.health;
    eA.maxHealth = eB.maxHealth = totalHP;
    eA.health    = eB.health    = totalHP;
    eA._razorPartner = eB; eB._razorPartner = eA;
    eA._razorEnraged = false; eB._razorEnraged = false;

    const razorLoadout = { chassis:'light', primary:'smg', secondary:'plsm',
        mod:'atk_drone', shld:'flicker_shield', leg:'sprint_boosters', aug:'none' };

    for (const e of [eA, eB]) {
        e.loadout = razorLoadout;
        e.behavior = 'flanker'; e.isBoss = true; e.bossType = 'razor';
        _addBossLabel(scene, e, '[ TWIN RAZOR ]', 0xff0022, 58);
        _addBossHPBar(scene, e, 0xff0022, 'TWIN RAZORS');
    }
    _showBossTitle(scene, 'TWIN RAZORS', 'SHARED HEALTH — KILLING ONE ENRAGES THE OTHER', 0xff4444);

    const syncHP = scene.time.addEvent({ delay: 80, loop: true, callback: () => {
        if (!eA.active && !eB.active) { syncHP.remove(); return; }
        const minHP = Math.min(
            eA.active ? eA.health : Infinity,
            eB.active ? eB.health : Infinity
        );
        if (isFinite(minHP)) {
            if (eA.active) eA.health = minHP;
            if (eB.active) eB.health = minHP;
        }
        for (const e of [eA, eB]) {
            if (!e.active) continue;
            _updateBossHPBar(e);
            if (e.bossLabel && e.bossLabel.active) e.bossLabel.setPosition(e.x, e.y - 58);
            if (!e._razorEnraged && e._razorPartner && !e._razorPartner.active) {
                e._razorEnraged = true;
                e.speed *= 1.8;
                const fl = scene.add.rectangle(e.x, e.y, 60, 60, 0xff0000, 0.5).setDepth(15);
                scene.tweens.add({ targets: fl, alpha:0, scale:3, duration:500, onComplete:()=>fl.destroy() });
                const warn = scene.add.text(window.innerWidth/2, window.innerHeight*0.28,
                    'RAZOR ENRAGED!', { font:'bold 20px monospace', fill:'#ff4444', stroke:'#000', strokeThickness:4 })
                    .setScrollFactor(0).setDepth(9001).setOrigin(0.5);
                scene.tweens.add({ targets: warn, alpha:0, duration:1800, onComplete:()=>warn.destroy() });
                _tone(110,'sawtooth',0.5,0.35,80);
                _noise(0.3,0.3,0,0,400);
            }
        }
    }});

    const razorOnDestroy = function() {
        if (e && e.bossLabel) e.bossLabel.destroy();
        if (e && e._bossBarBg) e._bossBarBg.destroy();
        if (e && e._bossBarFg) e._bossBarFg.destroy();
    };
    eA._onDestroy = function() {
        if (eA._bossLabelTween) eA._bossLabelTween.stop();
        if (eA.bossLabel) eA.bossLabel.destroy();
        // Don't hide bar yet — eB may still be alive
    };
    eB._onDestroy = function() {
        if (eB._bossLabelTween) eB._bossLabelTween.stop();
        if (eB.bossLabel) eB.bossLabel.destroy();
        syncHP.remove();
        _hideBossHPBar();
    };
}

// BOSS 3: THE ARCHITECT (Round 15)
function spawnArchitect(scene) {
    const p = _bossSpawnPos();
    const e = _buildBossEnemy(scene, p.x, p.y, 'medium', BOSS_COLORS.architect, 4.0, 0.95);
    e.loadout = { chassis:'medium', primary:'hr', secondary:'emp',
                  mod:'barrier', shld:'adaptive_shield', leg:'stabilizer_gyros', aug:'targeting_scope' };
    e.behavior = 'sniper'; e.isBoss = true; e.bossType = 'architect';
    _addBossLabel(scene, e, '[ THE ARCHITECT ]', 0x00cccc, 68);
    _addBossHPBar(scene, e, 0x00cccc, 'THE ARCHITECT');
    _showBossTitle(scene, 'THE ARCHITECT', 'STAY AGGRESSIVE — IT BUILDS COVER MID-FIGHT', 0x00dddd);

    let wallsPlaced = 0;
    e._architectTimer = scene.time.addEvent({ delay: 7000, loop: true, callback: () => {
        if (!e || !e.active || !isDeployed || wallsPlaced >= 8) return;
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        const perpAngle = angle + Math.PI / 2;
        const wallX = e.x + Math.cos(perpAngle) * 80;
        const wallY = e.y + Math.sin(perpAngle) * 80;
        const w = 80, h = 18;
        const wall = scene.add.rectangle(wallX - w/2, wallY - h/2, w, h, 0x00aa99)
            .setOrigin(0, 0).setStrokeStyle(2, 0x00ffcc).setDepth(3);
        wall.setAlpha(0);
        scene.tweens.add({ targets: wall, alpha: 1, duration: 300 });
        scene.physics.add.existing(wall, true);
        wall.body.setSize(w, h);
        wall.body.reset(wallX - w/2, wallY - h/2);
        wall.coverType = 'wall'; wall.coverHp = 60; wall.coverMaxHp = 60;
        coverObjects.add(wall, true);
        coverObjects.refresh();
        wallsPlaced++;
        _tone(440, 'square', 0.06, 0.06, 220);
        _noise(0.08, 0.08, 0, 600, 0);
        const retreatAngle = angle + Math.PI;
        if (e.body) {
            e.body.setVelocity(Math.cos(retreatAngle) * e.speed * 1.4, Math.sin(retreatAngle) * e.speed * 1.4);
            scene.time.delayedCall(600, () => { if (e && e.active && e.body) e.body.setVelocity(0, 0); });
        }
    }});

    e._architectSync = scene.time.addEvent({ delay: 16, loop: true, callback: () => {
        if (!e || !e.active) return;
        _updateBossHPBar(e);
        if (e.bossLabel && e.bossLabel.active) e.bossLabel.setPosition(e.x, e.y - 68);
    }});

    e._onDestroy = function() {
        if (e._architectTimer) e._architectTimer.remove();
        if (e._architectSync) e._architectSync.remove();
        if (e._bossLabelTween) e._bossLabelTween.stop();
        if (e.bossLabel) e.bossLabel.destroy();
        _hideBossHPBar();
    };
}

// BOSS 4: JUGGERNAUT (Round 20+)
function spawnJuggernaut(scene) {
    const p = _bossSpawnPos();
    const e = _buildBossEnemy(scene, p.x, p.y, 'heavy', BOSS_COLORS.juggernaut, 5.0, 0.8);
    e.loadout = { chassis:'heavy', primary:'mg', secondary:'rl',
                  mod:'rage', shld:'titan_shield', leg:'siege_stance', aug:'reactive_plating' };
    e.behavior = 'circle'; e.isBoss = true; e.bossType = 'juggernaut';
    e._jugPhase = 1; e._jugCharging = false;
    _addBossLabel(scene, e, '[ JUGGERNAUT ]', 0xff2200, 80);
    _addBossHPBar(scene, e, 0xff2200, 'JUGGERNAUT');
    _showBossTitle(scene, 'JUGGERNAUT', 'PHASE 1 — MAINTAIN DISTANCE', 0xff4400);

    e._jugPhaseTimer = scene.time.addEvent({ delay: 300, loop: true, callback: () => {
        if (!e || !e.active) return;
        _updateBossHPBar(e);
        if (e.bossLabel && e.bossLabel.active) e.bossLabel.setPosition(e.x, e.y - 80);
        const pct = e.health / e.maxHealth;

        if (pct < 0.66 && e._jugPhase === 1) {
            e._jugPhase = 2;
            e.speed *= 1.3;
            const warn = scene.add.text(window.innerWidth/2, window.innerHeight*0.28,
                'JUGGERNAUT — PHASE 2: CHARGING', { font:'bold 18px monospace', fill:'#ff6600', stroke:'#000', strokeThickness:4 })
                .setScrollFactor(0).setDepth(9001).setOrigin(0.5);
            scene.tweens.add({ targets: warn, alpha:0, duration:2000, onComplete:()=>warn.destroy() });
            _tone(55,'sawtooth',0.55,0.4,35);
            _noise(0.4,0.4,0,0,300);
            e._chargeTimer = scene.time.addEvent({ delay: 5000, loop: true, callback: () => {
                if (!e || !e.active || !player || !player.active || e._jugCharging) return;
                e._jugCharging = true;
                const windup = scene.add.circle(e.x, e.y, 30, 0xff4400, 0.6).setDepth(14);
                scene.tweens.add({ targets: windup, scale: 2.5, alpha: 0, duration: 600, onComplete: () => {
                    windup.destroy();
                    if (!e || !e.active || !player || !player.active) { e._jugCharging = false; return; }
                    const angle = Math.atan2(player.y - e.y, player.x - e.x);
                    const chargeSpeed = e.speed * 4.5;
                    if (e.body) e.body.setVelocity(Math.cos(angle)*chargeSpeed, Math.sin(angle)*chargeSpeed);
                    _tone(80,'sawtooth',0.35,0.25,50);
                    _noise(0.25,0.35,0,0,500);
                    scene.time.delayedCall(700, () => {
                        if (e && e.active) {
                            if (e.body) e.body.setVelocity(0, 0);
                            e._jugCharging = false;
                            if (player && player.active && Phaser.Math.Distance.Between(e.x,e.y,player.x,player.y) < 80) {
                                const impactDmg = Math.round(35 * (1 + Math.max(0,_round-20)*0.05));
                                processPlayerDamage(impactDmg, null);
                                _noise(0.2,0.4,0,0,600);
                                const imp = scene.add.circle(e.x,e.y,60,0xff4400,0.5).setDepth(14);
                                scene.tweens.add({ targets:imp, scale:2.5, alpha:0, duration:400, onComplete:()=>imp.destroy() });
                            }
                        }
                    });
                }});
            }});
        }

        if (pct < 0.33 && e._jugPhase === 2) {
            e._jugPhase = 3;
            e.speed *= 1.2;
            const warn = scene.add.text(window.innerWidth/2, window.innerHeight*0.28,
                'JUGGERNAUT — FINAL STAND', { font:'bold 20px monospace', fill:'#ff0000', stroke:'#000', strokeThickness:5 })
                .setScrollFactor(0).setDepth(9001).setOrigin(0.5);
            scene.tweens.add({ targets: warn, alpha:0, duration:2500, onComplete:()=>warn.destroy() });
            _tone(40,'sawtooth',0.7,0.45,30);
            _noise(0.5,0.5,0,0,200);
            e._mineDropTimer = scene.time.addEvent({ delay: 3000, loop: true, callback: () => {
                if (!e || !e.active || !isDeployed) return;
                const mx = e.x + Phaser.Math.Between(-30, 30);
                const my = e.y + Phaser.Math.Between(-30, 30);
                const mine = scene.add.circle(mx, my, 10, 0xff2200, 0.85)
                    .setStrokeStyle(2, 0xff8800).setDepth(5);
                scene.add.circle(mx, my, 5, 0xffaa00, 1).setDepth(6);
                _tone(200,'square',0.05,0.04,150);
                let exploded = false;
                function doExplode() {
                    if (exploded) return;
                    exploded = true;
                    if (mineTick) mineTick.remove();
                    const exp = scene.add.circle(mine.x, mine.y, 55, 0xff4400, 0.65).setDepth(14);
                    scene.tweens.add({ targets: exp, scale:2.5, alpha:0, duration:450, onComplete:()=>exp.destroy() });
                    if (player && player.active && Phaser.Math.Distance.Between(mine.x, mine.y, player.x, player.y) < 60) {
                        const mineDmg = Math.round(28 * (1 + Math.max(0,_round-20)*0.05));
                        processPlayerDamage(mineDmg, null);
                    }
                    _noise(0.3,0.45,0,0,600);
                    _tone(120,'sawtooth',0.3,0.2,60);
                    if (mine.active) mine.destroy();
                }
                const mineTick = scene.time.addEvent({ delay: 50, loop: true, callback: () => {
                    if (!mine.active) { mineTick.remove(); return; }
                    if (player && player.active && Phaser.Math.Distance.Between(mine.x, mine.y, player.x, player.y) < 45)
                        doExplode();
                }});
                scene.time.delayedCall(2500, doExplode);
            }});
        }
    }});

    e._onDestroy = function() {
        if (e._jugPhaseTimer) e._jugPhaseTimer.remove();
        if (e._chargeTimer) e._chargeTimer.remove();
        if (e._mineDropTimer) e._mineDropTimer.remove();
        if (e._bossLabelTween) e._bossLabelTween.stop();
        if (e.bossLabel) e.bossLabel.destroy();
        _hideBossHPBar();
    };
}

// ================================================================
// BOSS 5: THE SWARM (Round 25+)
// 20 mini-enemies sharing one large HP pool. Killed units reform.
// ================================================================
function spawnSwarm(scene) {
    const SWARM_COUNT = 20;
    const swarmHP = Math.round(800 * (1 + Math.min(_round - 1, 40) * 0.07));
    const _swarmState = { hp: swarmHP, maxHp: swarmHP, units: [], respawnQueue: [] };

    _addBossHPBar(scene, null, 0x88ff00, 'THE SWARM');

    // Override boss HP bar to use swarm state
    const bossBarFill = document.getElementById('boss-bar-fill');

    _showBossTitle(scene, 'THE SWARM', 'DESTROY THE HIVE MIND', 0x88ff00);

    function spawnSwarmUnit(x, y) {
        const sz = 18;
        const e = scene.add.rectangle(x, y, sz, sz, 0x000000, 0);
        scene.physics.add.existing(e);
        e.body.setCircle(sz * 0.6);
        e.body.setBounce(0.5);
        e.visuals = scene.add.circle(x, y, sz/2, 0x66cc00).setStrokeStyle(1, 0x88ff00).setDepth(5);
        // Small eye
        const eyeOx = Math.cos(0) * 4, eyeOy = Math.sin(0) * 4;
        e.torso = scene.add.circle(x + eyeOx, y + eyeOy, 3, 0xffffff).setDepth(6);
        e.speed = 120 + Math.random() * 80;
        const unitHP = 30;
        e.comp = {
            core: { hp: unitHP, max: unitHP },
            lArm: { hp: 10, max: 10 }, rArm: { hp: 10, max: 10 },
            legs: { hp: 10, max: 10 }
        };
        e.health = unitHP; e.maxHealth = unitHP;
        e.behavior = 'rush'; e.isBoss = false; e._isSwarmUnit = true;
        e._swarmState = _swarmState;
        e._passiveDR = 0; e._reloadMult = 1; e._augState = {};
        e.reloadL = 0; e.reloadR = 0; e.lastFireTime = 0; e.lastSecTime = 0;
        e.lastModTime = -99999; e.isModActive = false;
        e.fxFootTimer = 0; e.fxFootSide = 1; e.fxShockTimer = 0;
        e.fxLastX = x; e.fxLastY = y; e.fxLastMX = x; e.fxLastMY = y;
        e._fireGrace = true;
        setTimeout(() => { if (e?.active) e._fireGrace = false; }, 1500);
        e._visionConeGfx = scene.add.graphics().setDepth(3);
        e.loadout = { chassis:'light', primary:'smg', secondary:'none', mod:'none', shld:'none', leg:'none', aug:'none' };
        enemies.add(e);
        if (coverObjects) scene.physics.add.collider(e, coverObjects);
        _swarmState.units.push(e);
        return e;
    }

    // Spawn swarm units in a cluster
    for (let i = 0; i < SWARM_COUNT; i++) {
        const angle = (i / SWARM_COUNT) * Math.PI * 2;
        const r = 150 + Math.random() * 200;
        const sx = WORLD_CENTER + Math.cos(angle) * (800 + r);
        const sy = WORLD_CENTER + Math.sin(angle) * (800 + r);
        spawnSwarmUnit(Phaser.Math.Clamp(sx, 300, 3700), Phaser.Math.Clamp(sy, 300, 3700));
    }

    // Swarm update loop — shared HP, respawn dead units
    const swarmTick = scene.time.addEvent({ delay: 200, loop: true, callback: () => {
        if (_swarmState.hp <= 0) { swarmTick.remove(); return; }
        // Update boss HP bar
        if (bossBarFill) bossBarFill.style.width = Math.max(0, _swarmState.hp / _swarmState.maxHp * 100) + '%';
        // Respawn dead units (max 2 per tick)
        let respawned = 0;
        for (let i = _swarmState.units.length - 1; i >= 0; i--) {
            const u = _swarmState.units[i];
            if (!u.active && respawned < 2 && _swarmState.hp > 0) {
                // Respawn near a living unit
                const living = _swarmState.units.filter(u2 => u2.active);
                if (living.length > 0) {
                    const ref = living[Math.floor(Math.random() * living.length)];
                    const nu = spawnSwarmUnit(ref.x + Phaser.Math.Between(-60, 60), ref.y + Phaser.Math.Between(-60, 60));
                    _swarmState.units[i] = nu;
                    // Green flash on respawn
                    const flash = scene.add.circle(nu.x, nu.y, 15, 0x88ff00, 0.6).setDepth(14);
                    scene.tweens.add({ targets: flash, alpha: 0, scale: 2, duration: 300, onComplete: () => flash.destroy() });
                }
                respawned++;
            }
        }
        // Sync visuals for living units
        _swarmState.units.forEach(u => {
            if (!u.active) return;
            if (u.visuals?.active) u.visuals.setPosition(u.x, u.y);
            if (u.torso?.active) u.torso.setPosition(u.x + 4, u.y);
        });
    }});

    // Swarm boss is defeated when shared HP reaches 0
    // This is tracked via a custom damage hook — swarm units redirect damage to pool
    _swarmState._tick = swarmTick;
    _swarmState._onDefeat = function() {
        swarmTick.remove();
        _hideBossHPBar();
        _swarmState.units.forEach(u => {
            if (u.active) {
                const exp = scene.add.circle(u.x, u.y, 8, 0x88ff00, 0.7).setDepth(14);
                scene.tweens.add({ targets: exp, scale: 3, alpha: 0, duration: 400, onComplete: () => exp.destroy() });
                try { u.visuals?.destroy(); u.torso?.destroy(); u._visionConeGfx?.destroy(); } catch(ex) {}
                u.destroy();
            }
        });
    };

    // Store swarm state globally for damage hook
    window._activeSwarm = _swarmState;
}

// ================================================================
// BOSS 6: THE MIRROR (Round 30+)
// Copies player loadout, AI-controlled mirror match
// ================================================================
function spawnMirror(scene) {
    const p = _bossSpawnPos();
    const mirrorColors = { body: 0x111122, head: 0x4488ff, eye: 0x00ffff };
    const e = _buildBossEnemy(scene, p.x, p.y, loadout.chassis || 'medium', mirrorColors, 3.5, 1.0);
    // Copy player loadout
    e.loadout = {
        chassis: loadout.chassis || 'medium',
        primary: loadout.L || 'smg', secondary: loadout.R || 'none',
        cpu: loadout.cpu || 'none', shld: loadout.shld || 'none',
        leg: loadout.leg || 'none', aug: loadout.aug || 'none'
    };
    e.behavior = 'mirror'; e.isBoss = true; e.bossType = 'mirror';
    e._mirrorPhase = 1;
    _addBossLabel(scene, e, '[ THE MIRROR ]', 0x4488ff, 80);
    _addBossHPBar(scene, e, 0x4488ff, 'THE MIRROR');
    _showBossTitle(scene, 'THE MIRROR', 'IT KNOWS YOUR MOVES', 0x4488ff);

    // Mirror copies player speed
    e.speed = CHASSIS[loadout.chassis || 'medium'].spd * 1.05;

    // Mirror AI: strafe, dodge, use mods — update loop
    const mirrorTick = scene.time.addEvent({ delay: 250, loop: true, callback: () => {
        if (!e || !e.active) { mirrorTick.remove(); return; }
        _updateBossHPBar(e);
        if (e.bossLabel?.active) e.bossLabel.setPosition(e.x, e.y - 80);
        const pct = e.health / e.maxHealth;

        // Phase transitions: at 50% mirror copies player perks partially
        if (pct < 0.50 && e._mirrorPhase === 1) {
            e._mirrorPhase = 2;
            e.speed *= 1.2;
            e._passiveDR = 0.15;
            const warn = scene.add.text(window.innerWidth/2, window.innerHeight*0.28,
                'THE MIRROR — PHASE 2: ADAPTATION', { font:'bold 18px monospace', fill:'#4488ff', stroke:'#000', strokeThickness:4 })
                .setScrollFactor(0).setDepth(9001).setOrigin(0.5);
            scene.tweens.add({ targets: warn, alpha:0, duration:2000, onComplete:()=>warn.destroy() });
            _tone(180, 'sine', 0.3, 0.15, 120);
        }

        // Mirror dodge: teleport-dash when player fires nearby
        if (player?.active && e._mirrorPhase >= 2 && Math.random() < 0.08) {
            const dist = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
            if (dist < 400) {
                const dashAngle = Math.atan2(player.y - e.y, player.x - e.x) + (Math.random() < 0.5 ? Math.PI/2 : -Math.PI/2);
                const dashDist = 120;
                const nx = Phaser.Math.Clamp(e.x + Math.cos(dashAngle) * dashDist, 200, 3800);
                const ny = Phaser.Math.Clamp(e.y + Math.sin(dashAngle) * dashDist, 200, 3800);
                // Ghost trail
                const ghost = scene.add.circle(e.x, e.y, 20, 0x4488ff, 0.4).setDepth(12);
                scene.tweens.add({ targets: ghost, alpha: 0, scale: 0.3, duration: 400, onComplete: () => ghost.destroy() });
                e.x = nx; e.y = ny;
                if (e.body) e.body.reset(nx, ny);
            }
        }
    }});

    // Mirror uses EMP periodically
    let lastMirrorMod = 0;
    const mirrorModTick = scene.time.addEvent({ delay: 100, loop: true, callback: () => {
        if (!e || !e.active) { mirrorModTick.remove(); return; }
        const now = scene.time.now;
        if (now - lastMirrorMod > 8000 && e._mirrorPhase >= 2) {
            lastMirrorMod = now;
            // Mirror EMP: stuns player briefly
            const dist = Phaser.Math.Distance.Between(e.x, e.y, player?.x || WORLD_CENTER, player?.y || WORLD_CENTER);
            if (dist < 350) {
                const ring = scene.add.circle(e.x, e.y, 10, 0x4488ff, 0.3).setStrokeStyle(2, 0x4488ff).setDepth(12);
                scene.tweens.add({ targets: ring, radius: 250, alpha: 0, duration: 400, onComplete: () => ring.destroy() });
                _tone(400, 'sine', 0.15, 0.1, 200);
            }
        }
    }});

    e._onDestroy = function() {
        mirrorTick.remove();
        mirrorModTick.remove();
        if (e._bossLabelTween) e._bossLabelTween.stop();
        if (e.bossLabel) e.bossLabel.destroy();
        _hideBossHPBar();
    };
}

// ================================================================
// BOSS 7: THE TITAN (Round 35+)
// 3-phase mega-heavy boss with different attack patterns each phase
// ================================================================
function spawnTitan(scene) {
    const p = _bossSpawnPos();
    const titanColors = { body: 0x1a1000, head: 0xff8800, eye: 0xffcc00 };
    const e = _buildBossEnemy(scene, p.x, p.y, 'heavy', titanColors, 8.0, 0.55);
    e.loadout = { chassis:'heavy', primary:'rl', secondary:'mg',
                  mod:'fortress_mode', shld:'titan_shield', leg:'siege_stance', aug:'reactive_plating' };
    e.behavior = 'patrol'; e.isBoss = true; e.bossType = 'titan';
    e._titanPhase = 1;
    e._passiveDR = 0.25;
    // Titan is visually larger
    if (e.visuals) e.visuals.setScale(2.2);
    if (e.torso) e.torso.setScale(2.2);
    e.body.setCircle(80);
    _addBossLabel(scene, e, '[ THE TITAN ]', 0xff8800, 100);
    _addBossHPBar(scene, e, 0xff8800, 'THE TITAN');
    _showBossTitle(scene, 'THE TITAN', 'PHASE 1 — ARTILLERY BARRAGE', 0xff8800);

    // Phase 1: Artillery — fires explosive projectiles at player position
    let artilleryTimer = null;
    function startPhase1() {
        artilleryTimer = scene.time.addEvent({ delay: 2000, loop: true, callback: () => {
            if (!e || !e.active || !player?.active) return;
            // Fire 3 mortar rounds at player location with spread
            for (let i = 0; i < 3; i++) {
                const tx = player.x + Phaser.Math.Between(-80, 80);
                const ty = player.y + Phaser.Math.Between(-80, 80);
                // Warning indicator
                const warn = scene.add.circle(tx, ty, 40, 0xff4400, 0.15).setStrokeStyle(2, 0xff8800, 0.4).setDepth(3);
                scene.tweens.add({ targets: warn, alpha: 0.5, duration: 800, onComplete: () => {
                    warn.destroy();
                    if (!e?.active) return;
                    // Explosion
                    const exp = scene.add.circle(tx, ty, 15, 0xff6600, 0.7).setDepth(14);
                    scene.tweens.add({ targets: exp, radius: 60, alpha: 0, duration: 350, onComplete: () => exp.destroy() });
                    if (player?.active && Phaser.Math.Distance.Between(tx, ty, player.x, player.y) < 60) {
                        const artDmg = Math.round(25 * (1 + Math.max(0, _round - 35) * 0.04));
                        processPlayerDamage(artDmg, null);
                    }
                    // Impact sound (throttled: 3 mortars can land close together)
                    if (_canPlay('art_imp', 100)) _tone(100, 'sawtooth', 0.2, 0.15, 50);
                }});
            }
        }});
    }

    // Phase 2: Melee — charges at player with ground slam
    let slamTimer = null;
    function startPhase2() {
        if (artilleryTimer) artilleryTimer.remove();
        e.speed *= 2.0;
        const warn = scene.add.text(window.innerWidth/2, window.innerHeight*0.28,
            'THE TITAN — PHASE 2: GROUND ASSAULT', { font:'bold 18px monospace', fill:'#ff8800', stroke:'#000', strokeThickness:4 })
            .setScrollFactor(0).setDepth(9001).setOrigin(0.5);
        scene.tweens.add({ targets: warn, alpha:0, duration:2000, onComplete:()=>warn.destroy() });
        _tone(40, 'sawtooth', 0.6, 0.4, 25);

        slamTimer = scene.time.addEvent({ delay: 4000, loop: true, callback: () => {
            if (!e || !e.active || !player?.active) return;
            // Charge toward player
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            if (e.body) e.body.setVelocity(Math.cos(angle) * 400, Math.sin(angle) * 400);
            scene.time.delayedCall(600, () => {
                if (!e?.active) return;
                if (e.body) e.body.setVelocity(0, 0);
                // Ground slam
                const slam = scene.add.circle(e.x, e.y, 20, 0xff8800, 0.6).setDepth(14);
                scene.tweens.add({ targets: slam, radius: 150, alpha: 0, duration: 500, onComplete: () => slam.destroy() });
                if (player?.active && Phaser.Math.Distance.Between(e.x, e.y, player.x, player.y) < 150) {
                    const slamDmg = Math.round(40 * (1 + Math.max(0, _round - 35) * 0.04));
                    processPlayerDamage(slamDmg, null);
                }
                _noise(0.3, 0.4, 0, 0, 400);
            });
        }});
    }

    // Phase 3: Desperation — combines artillery + melee + enrage
    let desperationTimer = null;
    function startPhase3() {
        if (slamTimer) slamTimer.remove();
        e.speed *= 1.3;
        e._passiveDR = 0.10; // DR drops in desperation
        const warn = scene.add.text(window.innerWidth/2, window.innerHeight*0.28,
            'THE TITAN — FINAL PHASE: DESPERATION', { font:'bold 20px monospace', fill:'#ff0000', stroke:'#000', strokeThickness:5 })
            .setScrollFactor(0).setDepth(9001).setOrigin(0.5);
        scene.tweens.add({ targets: warn, alpha:0, duration:2500, onComplete:()=>warn.destroy() });
        _tone(30, 'sawtooth', 0.8, 0.5, 20);

        desperationTimer = scene.time.addEvent({ delay: 2500, loop: true, callback: () => {
            if (!e || !e.active || !player?.active) return;
            // Alternating attacks
            if (Math.random() < 0.5) {
                // Mortar
                const tx = player.x + Phaser.Math.Between(-60, 60);
                const ty = player.y + Phaser.Math.Between(-60, 60);
                const warn2 = scene.add.circle(tx, ty, 50, 0xff2200, 0.2).setDepth(3);
                scene.tweens.add({ targets: warn2, alpha: 0.6, duration: 600, onComplete: () => {
                    warn2.destroy();
                    if (!e?.active) return;
                    const exp = scene.add.circle(tx, ty, 20, 0xff4400, 0.8).setDepth(14);
                    scene.tweens.add({ targets: exp, radius: 80, alpha: 0, duration: 400, onComplete: () => exp.destroy() });
                    if (player?.active && Phaser.Math.Distance.Between(tx, ty, player.x, player.y) < 80) {
                        processPlayerDamage(Math.round(30 * (1 + Math.max(0, _round - 35) * 0.04)), null);
                    }
                }});
            } else {
                // Shockwave
                const sw = scene.add.circle(e.x, e.y, 10, 0xff6600, 0.5).setDepth(14);
                scene.tweens.add({ targets: sw, radius: 200, alpha: 0, duration: 500, onComplete: () => sw.destroy() });
                if (player?.active && Phaser.Math.Distance.Between(e.x, e.y, player.x, player.y) < 200) {
                    processPlayerDamage(Math.round(20 * (1 + Math.max(0, _round - 35) * 0.04)), null);
                }
            }
        }});
    }

    startPhase1();

    // Phase tracking
    const titanTick = scene.time.addEvent({ delay: 300, loop: true, callback: () => {
        if (!e || !e.active) { titanTick.remove(); return; }
        _updateBossHPBar(e);
        if (e.bossLabel?.active) e.bossLabel.setPosition(e.x, e.y - 100);
        const pct = e.health / e.maxHealth;
        if (pct < 0.66 && e._titanPhase === 1) { e._titanPhase = 2; startPhase2(); }
        if (pct < 0.33 && e._titanPhase === 2) { e._titanPhase = 3; startPhase3(); }
    }});

    e._onDestroy = function() {
        titanTick.remove();
        if (artilleryTimer) artilleryTimer.remove();
        if (slamTimer) slamTimer.remove();
        if (desperationTimer) desperationTimer.remove();
        if (e._bossLabelTween) e._bossLabelTween.stop();
        if (e.bossLabel) e.bossLabel.destroy();
        _hideBossHPBar();
    };
}

// ================================================================
// BOSS 8: THE CORE (Round 40+)
// Stationary core with 4 rotating turrets — must destroy turrets first
// ================================================================
function spawnCore(scene) {
    // Central core — stationary
    const coreHP = Math.round(600 * (1 + Math.min(_round - 1, 40) * 0.07));
    const coreE = scene.add.rectangle(WORLD_CENTER, 1200, 80, 80, 0x000000, 0);
    scene.physics.add.existing(coreE);
    coreE.body.setCircle(50);
    coreE.body.setImmovable(true);

    // Core visual
    const coreGfx = scene.add.graphics().setDepth(5);
    coreGfx.fillStyle(0x001133, 0.9);
    coreGfx.fillCircle(0, 0, 40);
    coreGfx.lineStyle(3, 0x00ccff);
    coreGfx.strokeCircle(0, 0, 40);
    coreGfx.fillStyle(0x00ffff, 0.6);
    coreGfx.fillCircle(0, 0, 15);
    coreGfx.setPosition(WORLD_CENTER, 1200);
    coreE.visuals = coreGfx;
    coreE.torso = scene.add.circle(WORLD_CENTER, 1200, 5, 0xffffff).setDepth(6);

    coreE.speed = 0;
    coreE.comp = {
        core: { hp: coreHP, max: coreHP },
        lArm: { hp: 1, max: 1 }, rArm: { hp: 1, max: 1 },
        legs: { hp: 1, max: 1 }
    };
    coreE.health = coreHP; coreE.maxHealth = coreHP;
    coreE.behavior = 'stationary'; coreE.isBoss = true; coreE.bossType = 'core';
    coreE._passiveDR = 0.50; // 50% DR while turrets alive
    coreE._reloadMult = 1; coreE._augState = {};
    coreE.reloadL = 0; coreE.reloadR = 0;
    coreE.lastFireTime = 0; coreE.lastSecTime = 0;
    coreE.lastModTime = -99999; coreE.isModActive = false;
    coreE.fxFootTimer = 0; coreE.fxFootSide = 1; coreE.fxShockTimer = 0;
    coreE.fxLastX = WORLD_CENTER; coreE.fxLastY = 1200; coreE.fxLastMX = WORLD_CENTER; coreE.fxLastMY = 1200;
    coreE._fireGrace = true;
    setTimeout(() => { if (coreE?.active) coreE._fireGrace = false; }, 3000);
    coreE._visionConeGfx = scene.add.graphics().setDepth(3);
    coreE.loadout = { chassis:'heavy', primary:'plsm', secondary:'none', mod:'none', shld:'none', leg:'none', aug:'none' };
    enemies.add(coreE);
    if (coverObjects) scene.physics.add.collider(coreE, coverObjects);

    _addBossLabel(scene, coreE, '[ THE CORE ]', 0x00ccff, 70);
    _addBossHPBar(scene, coreE, 0x00ccff, 'THE CORE');
    _showBossTitle(scene, 'THE CORE', 'DESTROY THE TURRETS FIRST', 0x00ccff);

    // Spawn 4 turrets orbiting the core
    const turrets = [];
    const TURRET_COUNT = 4;
    const orbitRadius = 180;
    let orbitAngle = 0;

    for (let i = 0; i < TURRET_COUNT; i++) {
        const ta = (i / TURRET_COUNT) * Math.PI * 2;
        const tx = WORLD_CENTER + Math.cos(ta) * orbitRadius;
        const ty = 1200 + Math.sin(ta) * orbitRadius;
        const turretHP = Math.round(200 * (1 + Math.min(_round - 1, 40) * 0.07));

        const t = scene.add.rectangle(tx, ty, 30, 30, 0x000000, 0);
        scene.physics.add.existing(t);
        t.body.setCircle(18);
        t.visuals = scene.add.circle(tx, ty, 14, 0x003366).setStrokeStyle(2, 0x00ccff).setDepth(5);
        // Turret barrel
        t.torso = scene.add.rectangle(tx, ty - 14, 4, 16, 0x00ccff).setOrigin(0.5, 1).setDepth(6);
        t.speed = 0;
        t.comp = {
            core: { hp: turretHP, max: turretHP },
            lArm: { hp: 1, max: 1 }, rArm: { hp: 1, max: 1 },
            legs: { hp: 1, max: 1 }
        };
        t.health = turretHP; t.maxHealth = turretHP;
        t.behavior = 'turret'; t.isBoss = false; t._isCoreTurret = true;
        t._passiveDR = 0; t._reloadMult = 1; t._augState = {};
        t.reloadL = 0; t.reloadR = 0; t.lastFireTime = 0; t.lastSecTime = 0;
        t.lastModTime = -99999; t.isModActive = false;
        t.fxFootTimer = 0; t.fxFootSide = 1; t.fxShockTimer = 0;
        t.fxLastX = tx; t.fxLastY = ty; t.fxLastMX = tx; t.fxLastMY = ty;
        t._fireGrace = true;
        setTimeout(() => { if (t?.active) t._fireGrace = false; }, 2500);
        t._visionConeGfx = scene.add.graphics().setDepth(3);
        t.loadout = { chassis:'medium', primary:'plsm', secondary:'none', mod:'none', shld:'none', leg:'none', aug:'none' };
        enemies.add(t);
        turrets.push(t);
        t._orbitIndex = i;
    }

    // Core update loop: rotate turrets, check turret status
    const coreTick = scene.time.addEvent({ delay: 50, loop: true, callback: () => {
        if (!coreE || !coreE.active) { coreTick.remove(); return; }
        _updateBossHPBar(coreE);
        if (coreE.bossLabel?.active) coreE.bossLabel.setPosition(coreE.x, coreE.y - 70);
        if (coreE.visuals?.active) coreE.visuals.setPosition(coreE.x, coreE.y);
        if (coreE.torso?.active) coreE.torso.setPosition(coreE.x, coreE.y);

        // Rotate turrets
        orbitAngle += 0.008;
        let aliveTurrets = 0;
        turrets.forEach((t, i) => {
            if (!t.active) return;
            aliveTurrets++;
            const a = orbitAngle + (i / TURRET_COUNT) * Math.PI * 2;
            const nx = coreE.x + Math.cos(a) * orbitRadius;
            const ny = coreE.y + Math.sin(a) * orbitRadius;
            t.x = nx; t.y = ny;
            if (t.body) t.body.reset(nx - 15, ny - 15);
            if (t.visuals?.active) t.visuals.setPosition(nx, ny);
            if (t.torso?.active) {
                // Point barrel at player
                if (player?.active) {
                    const aim = Math.atan2(player.y - ny, player.x - nx);
                    t.torso.setPosition(nx, ny).setRotation(aim + Math.PI/2);
                }
            }
        });

        // When all turrets dead, core loses DR and enters vulnerable phase
        if (aliveTurrets === 0 && coreE._passiveDR > 0) {
            coreE._passiveDR = 0;
            const warn = scene.add.text(window.innerWidth/2, window.innerHeight*0.28,
                'CORE EXPOSED — SHIELDS DOWN', { font:'bold 20px monospace', fill:'#00ffff', stroke:'#000', strokeThickness:5 })
                .setScrollFactor(0).setDepth(9001).setOrigin(0.5);
            scene.tweens.add({ targets: warn, alpha:0, duration:2500, onComplete:()=>warn.destroy() });
            _tone(600, 'sine', 0.2, 0.1, 300);
            // Core starts firing faster in desperation
            coreE.loadout.primary = 'rl';
        }

        // Core laser beam at player every 3s
        if (coreE._fireGrace) return;
        coreE._coreBeamTick = (coreE._coreBeamTick || 0) + 50;
        if (coreE._coreBeamTick >= 3000 && player?.active) {
            coreE._coreBeamTick = 0;
            const angle = Math.atan2(player.y - coreE.y, player.x - coreE.x);
            const beamLen = 600;
            const bx = coreE.x + Math.cos(angle) * beamLen;
            const by = coreE.y + Math.sin(angle) * beamLen;
            const beam = scene.add.line(0, 0, coreE.x, coreE.y, bx, by, 0x00ccff, 0.7)
                .setLineWidth(3).setDepth(14);
            scene.tweens.add({ targets: beam, alpha: 0, duration: 400, onComplete: () => beam.destroy() });
            // Damage along beam
            if (player?.active) {
                const dist = Phaser.Math.Distance.Between(coreE.x, coreE.y, player.x, player.y);
                // Check if player is roughly in beam path
                const pAngle = Math.atan2(player.y - coreE.y, player.x - coreE.x);
                if (Math.abs(Phaser.Math.Angle.Wrap(pAngle - angle)) < 0.15 && dist < beamLen) {
                    const beamDmg = Math.round(20 * (1 + Math.max(0, _round - 40) * 0.04));
                    processPlayerDamage(beamDmg, null);
                }
            }
            _tone(800, 'sine', 0.15, 0.08, 400);
        }
    }});

    // Track total kills needed (core + turrets)
    _roundTotal = 1 + TURRET_COUNT; // Kill turrets + core

    coreE._onDestroy = function() {
        coreTick.remove();
        turrets.forEach(t => {
            try { t.visuals?.destroy(); t.torso?.destroy(); t._visionConeGfx?.destroy(); } catch(ex) {}
        });
        if (coreE._bossLabelTween) coreE._bossLabelTween.stop();
        if (coreE.bossLabel) coreE.bossLabel.destroy();
        _hideBossHPBar();
    };
}

// ═══════════ ENEMY TEARDOWN ═══════════

function destroyEnemyWithCleanup(scene, e) {
    if (!e.active) return;
    if (typeof handleEliteDeath === 'function' && (e.isElite || e.enemyType)) handleEliteDeath(scene, e);
    if (e.visuals?.active)       e.visuals.destroy();
    if (e.torso?.active)         e.torso.destroy();
    if (e.cmdLabel?.active)      e.cmdLabel.destroy();
    if (e.medicLabel?.active)    { scene.tweens.killTweensOf(e.medicLabel); e.medicLabel.destroy(); }
    if (e.medicCross?.active)    e.medicCross.destroy();
    if (e._healTimer)            e._healTimer.remove();
    if (e.shieldRing?.active)    e.shieldRing.destroy();
    if (e._visionConeGfx?.active) e._visionConeGfx.destroy();
    if (e._splitLabel?.active)   e._splitLabel.destroy();
    if (e._onDestroy) e._onDestroy();
    e.destroy();
}

