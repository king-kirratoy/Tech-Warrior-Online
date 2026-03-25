// ═══════════════════════════════════════════════════════════════════
//  ENEMY TYPES & ELITE MODIFIER SYSTEM — Phase 4
//  New enemy variants and elite modifiers for Tech Warrior Online
// ═══════════════════════════════════════════════════════════════════
//
// ── CROSS-FILE DEPENDENCIES ──────────────────────────────────────
// This file is loaded via <script> in index.html AFTER loot-system.js.
//
// FUNCTIONS CALLED FROM index.html (search "typeof <name>" to find call sites):
//   spawnSpecialEnemy    — called from startRound() enemy spawn loop
//   applyEliteModifier   — called from startRound() elite assignment
//   updateSpecialEnemies — called from update() GAME loop (~line 3066)
//   handleEliteDamage    — called from damageEnemy() (~line 9624)
//   handleEliteDeath     — called from onEnemyKilled() (~line 9849)
//   handleVampiricHeal   — called from processPlayerDamage() (~line 5407)
//   _getEnemySpawnConfig — called from startRound() (~line 4721)
//
// GLOBALS READ FROM index.html:
//   player, enemies, enemyBullets, isDeployed, _round, coverObjects,
//   _roundTotal, CHASSIS, ENEMY_COLORS, SHIELD_SYSTEMS,
//   buildEnemyMech, buildEnemyTorso, createExplosion, processPlayerDamage,
//   GAME, Phaser
// ──────────────────────────────────────────────────────────────────

// ── NEW ENEMY TYPE DEFINITIONS ───────────────────────────────────
const ENEMY_TYPE_DEFS = {
    scout: {
        label: 'SCOUT',
        chassis: 'light',
        behavior: 'rusher',
        hpMult: 0.40,         // fragile but survivable
        speedMult: 1.40,      // very fast
        primaryPool: ['smg', 'sg'],
        colors: { body: 0x0a1a00, head: 0x44ff44, eye: 0x88ff00 },
        labelColor: '#44ff44',
        dropBias: 'speed',
        desc: 'Fast scout that alerts nearby enemies on sight'
    },
    enforcer: {
        label: 'ENFORCER',
        chassis: 'heavy',
        behavior: 'guardian',
        hpMult: 0.70,         // tanky
        speedMult: 0.85,
        primaryPool: ['mg', 'hr'],
        colors: { body: 0x001a1a, head: 0x0088cc, eye: 0x00ccff },
        labelColor: '#0088cc',
        dropBias: 'armor',
        desc: 'Heavy enforcer with shield gate — first 30% damage absorbed'
    },
    technician: {
        label: 'TECHNICIAN',
        chassis: 'medium',
        behavior: 'guardian',
        hpMult: 0.45,
        speedMult: 0.90,
        primaryPool: ['smg', 'plsm'],
        colors: { body: 0x1a0a1a, head: 0xaa44ff, eye: 0xdd88ff },
        labelColor: '#aa44ff',
        dropBias: 'mod',
        desc: 'Deploys auto-turrets that fire at the player'
    },
    berserker: {
        label: 'BERSERKER',
        chassis: 'heavy',
        behavior: 'rusher',
        hpMult: 0.55,         // slightly reduced for enrage compensation
        speedMult: 1.0,
        primaryPool: ['sg', 'mg', 'rl'],
        colors: { body: 0x1a0000, head: 0xff2200, eye: 0xff0000 },
        labelColor: '#ff2200',
        dropBias: 'weapon',
        desc: 'Enrages below 50% HP — 2x speed, 1.5x damage'
    },
    sniperElite: {
        label: 'SNIPER',
        chassis: 'light',
        behavior: 'sniper',
        hpMult: 0.42,         // slight bump for survivability
        speedMult: 1.1,
        primaryPool: ['sr', 'hr', 'rail'],
        colors: { body: 0x0a0a0a, head: 0x888888, eye: 0xff4444 },
        labelColor: '#aaaaaa',
        dropBias: 'weapon',
        desc: 'Cloaks after firing, repositions, laser sight warning'
    },
    droneCarrier: {
        label: 'CARRIER',
        chassis: 'medium',
        behavior: 'circle',
        hpMult: 0.55,
        speedMult: 0.80,
        primaryPool: ['smg', 'plsm'],
        colors: { body: 0x1a1a00, head: 0xccaa00, eye: 0xffcc00 },
        labelColor: '#ccaa00',
        dropBias: 'augment',
        desc: 'Launches attack drones that orbit and fire at player'
    }
};

// ── ELITE MODIFIER DEFINITIONS ───────────────────────────────────
const ELITE_MODIFIERS = {
    vampiric: {
        label: 'VAMPIRIC',
        color: '#ff4444',
        glowColor: 0xff2200,
        desc: 'Heals on hitting player',
        hpScale: 1.2,
        dmgScale: 1.0,
        speedScale: 1.0
    },
    shielded: {
        label: 'SHIELDED',
        color: '#4488ff',
        glowColor: 0x2266ff,
        desc: 'Regenerating overshield',
        hpScale: 1.1,
        dmgScale: 1.0,
        speedScale: 1.0
    },
    explosive: {
        label: 'EXPLOSIVE',
        color: '#ff8800',
        glowColor: 0xff6600,
        desc: 'Death explosion (150px, 40 dmg)',
        hpScale: 1.0,
        dmgScale: 1.0,
        speedScale: 1.0
    },
    swift: {
        label: 'SWIFT',
        color: '#44ff88',
        glowColor: 0x22ff66,
        desc: '+50% move speed, +25% fire rate',
        hpScale: 0.9,
        dmgScale: 1.0,
        speedScale: 1.5
    },
    armored: {
        label: 'ARMORED',
        color: '#aaaaaa',
        glowColor: 0x888888,
        desc: '+30% damage reduction',
        hpScale: 1.3,
        dmgScale: 1.0,
        speedScale: 0.9
    },
    splitting: {
        label: 'SPLITTING',
        color: '#cc44ff',
        glowColor: 0xaa22ff,
        desc: 'On death, spawns 2 half-HP minions',
        hpScale: 1.15,
        dmgScale: 0.85,
        speedScale: 1.0
    }
};

// ── SPAWN RULES BY ROUND ─────────────────────────────────────────
function _getEnemySpawnConfig(round) {
    // Returns which special enemy types and how many elites to spawn
    if (round <= 5) {
        return { specialTypes: [], eliteChance: 0, maxElites: 0 };
    }
    if (round <= 10) {
        return {
            specialTypes: ['scout', 'enforcer'],
            eliteChance: 0.20,
            maxElites: 1
        };
    }
    if (round <= 15) {
        return {
            specialTypes: ['scout', 'enforcer', 'technician', 'berserker'],
            eliteChance: 0.40,
            maxElites: 2
        };
    }
    if (round <= 20) {
        return {
            specialTypes: ['scout', 'enforcer', 'technician', 'berserker', 'sniperElite', 'droneCarrier'],
            eliteChance: 0.60,
            maxElites: 3
        };
    }
    // Round 20+
    return {
        specialTypes: ['scout', 'enforcer', 'technician', 'berserker', 'sniperElite', 'droneCarrier'],
        eliteChance: 0.80,
        maxElites: Math.min(5, 3 + Math.floor((round - 20) / 5)),
        doubleModChance: 0.15 + (round - 20) * 0.02 // chance for 2 modifiers
    };
}

// ── PICK RANDOM ELITE MODIFIER ───────────────────────────────────
function _rollEliteModifier(exclude) {
    const keys = Object.keys(ELITE_MODIFIERS).filter(k => !exclude.includes(k));
    return keys.length > 0 ? Phaser.Math.RND.pick(keys) : null;
}

// ── SPAWN SPECIAL ENEMY TYPE ─────────────────────────────────────
function spawnSpecialEnemy(scene, typeKey) {
    const def = ENEMY_TYPE_DEFS[typeKey];
    if (!def) return null;

    let x, y, attempts = 0;
    do {
        x = Phaser.Math.Between(100, 3900);
        y = Phaser.Math.Between(100, 3900);
        attempts++;
    } while (
        attempts < 30 && (
            Phaser.Math.Distance.Between(x, y, 2000, 2000) < 1200 ||
            (player && isDeployed && Phaser.Math.Distance.Between(x, y, player.x, player.y) < 900)
        )
    );

    const chassisS = CHASSIS[def.chassis];
    const primary = Phaser.Math.RND.pick(def.primaryPool);

    const loadoutE = {
        chassis: def.chassis,
        primary,
        secondary: 'none',
        mod: def.chassis === 'medium' ? Phaser.Math.RND.pick(['repair', 'barrier']) : 'none',
        shld: def.chassis === 'heavy' ? 'heavy_shield' : 'standard_shield',
        leg: 'none',
        aug: 'none'
    };

    // Hitbox
    const hitSize = def.chassis === 'heavy' ? 55 : def.chassis === 'light' ? 42 : 50;
    const circleR = def.chassis === 'heavy' ? 38 : def.chassis === 'light' ? 28 : 35;
    const e = scene.add.rectangle(x, y, hitSize, hitSize, 0x000000, 0);
    scene.physics.add.existing(e);
    e.body.setCircle(circleR);

    // Visual — custom colors for this type
    e.visuals = buildEnemyMech(scene, def.chassis, def.colors);
    e.visuals.setPosition(x, y).setScale(chassisS.scale);
    e.torso = buildEnemyTorso(scene, def.chassis, def.colors);
    e.torso.setPosition(x, y).setScale(chassisS.scale).setDepth(6);

    // Type label
    e.typeLabel = scene.add.text(x, y - (def.chassis === 'heavy' ? 70 : 55), `[ ${def.label} ]`, {
        font: 'bold 9px monospace', fill: def.labelColor,
        stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);
    scene.tweens.add({ targets: e.typeLabel, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });

    // Stats
    e.loadout = loadoutE;
    e.enemyType = typeKey;
    e.behavior = def.behavior;
    const _effectiveLvl = (window._activeCampaignConfig?.enemyLevel) || _round;
    e.speed = Math.round(chassisS.spd * def.speedMult * (1 + (_effectiveLvl - 1) * 0.01));
    const _hm = def.hpMult * (1 + (_effectiveLvl - 1) * 0.08);
    e.comp = {
        core: { hp: Math.round(chassisS.coreHP * _hm), max: Math.round(chassisS.coreHP * _hm) },
        lArm: { hp: Math.round(chassisS.armHP  * _hm), max: Math.round(chassisS.armHP  * _hm) },
        rArm: { hp: Math.round(chassisS.armHP  * _hm), max: Math.round(chassisS.armHP  * _hm) },
        legs: { hp: Math.round(chassisS.legHP  * _hm), max: Math.round(chassisS.legHP  * _hm) },
    };
    e.health    = Object.values(e.comp).reduce((s, c) => s + c.hp, 0);
    e.maxHealth = e.health;
    e.reloadL = 0; e.reloadR = 0;
    e.lastSecTime = -99999;
    e.lastModTime = -99999;
    e.isModActive = false;
    e._passiveDR = def.chassis === 'heavy' ? (CHASSIS.heavy.passiveDR || 0.15) : 0;
    const _eChassisReload = def.chassis === 'light' ? (CHASSIS.light.passiveReloadBonus || 0.80) : 1.0;
    e._reloadMult = _eChassisReload;
    e._augState = {};
    e._fireGrace = true;
    setTimeout(() => { if (e?.active) e._fireGrace = false; }, 2000);
    e.lastFireTime = 0;

    // Shield system
    const _eShldSys = (typeof SHIELD_SYSTEMS !== 'undefined' && SHIELD_SYSTEMS[loadoutE.shld]) || { maxShield: 0, regenRate: 0, regenDelay: 5000 };
    e.maxShield = _eShldSys.maxShield || 0;
    e.shield = e.maxShield;
    e._shieldRegenRate = _eShldSys.regenRate || 0;
    e._shieldRegenDelay = _eShldSys.regenDelay || 5000;
    e._shieldAbsorb = def.chassis === 'medium' ? 0.60 : 0.50;
    e._lastDamageTime = -99999;

    // Foot FX
    e.fxFootTimer = 0; e.fxFootSide = 1; e.fxShockTimer = 0;
    e.fxLastX = x; e.fxLastY = y; e.fxLastMX = x; e.fxLastMY = y;
    e._visionConeGfx = scene.add.graphics().setDepth(3);

    // Squad system
    e._squadLeader = e;
    e._squadId = Math.floor(Math.random() * 100000);

    // ── TYPE-SPECIFIC MECHANICS ──────────────────────────────
    if (typeKey === 'scout') {
        _initScout(scene, e);
    } else if (typeKey === 'enforcer') {
        _initEnforcer(scene, e);
    } else if (typeKey === 'technician') {
        _initTechnician(scene, e);
    } else if (typeKey === 'berserker') {
        _initBerserker(scene, e);
    } else if (typeKey === 'sniperElite') {
        _initSniperElite(scene, e);
    } else if (typeKey === 'droneCarrier') {
        _initDroneCarrier(scene, e);
    }

    enemies.add(e);
    if (coverObjects) scene.physics.add.collider(e, coverObjects);
    return e;
}

// ── SCOUT: alerts nearby enemies when spotting player ────────────
function _initScout(scene, e) {
    e._scoutAlerted = false;
    e._scoutAlertRadius = 600;
    // Hooked into AI — when scout enters 'chase' state, all enemies within radius get alerted
    e._onSpotPlayer = () => {
        if (e._scoutAlerted) return;
        e._scoutAlerted = true;
        // Alert pulse visual
        const pulse = scene.add.circle(e.x, e.y, 10, 0x44ff44, 0.3).setDepth(12);
        scene.tweens.add({
            targets: pulse, scaleX: 60, scaleY: 60, alpha: 0,
            duration: 600, onComplete: () => pulse.destroy()
        });
        // Alert all nearby enemies
        if (enemies) {
            enemies.getChildren().forEach(ally => {
                if (!ally.active || ally === e) return;
                const d = Phaser.Math.Distance.Between(e.x, e.y, ally.x, ally.y);
                if (d < e._scoutAlertRadius) {
                    ally._aiState = 'chase';
                    ally._lastKnownPlayer = { x: player.x, y: player.y };
                    ally._stateTimer = scene.time?.now || 0;
                }
            });
        }
        // Brief alert indicator
        const txt = scene.add.text(e.x, e.y - 40, '! ALERT !', {
            font: 'bold 10px monospace', fill: '#44ff44',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(15);
        scene.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, duration: 1200, onComplete: () => txt.destroy() });
    };
}

// ── ENFORCER: shield gate — first 30% damage absorbed ────────────
function _initEnforcer(scene, e) {
    e._shieldGateActive = true;
    e._shieldGateThreshold = 0.30; // first 30% of max HP is gated
    e._shieldGateDamageAbsorbed = 0;
    e._shieldGateMax = e.maxHealth * e._shieldGateThreshold;
    // Visual: blue ring around enforcer
    e._enforcerRing = scene.add.circle(e.x, e.y, 45, 0x0088cc, 0).setDepth(5);
    e._enforcerRing.setStrokeStyle(2, 0x0088cc, 0.5);
    scene.tweens.add({
        targets: e._enforcerRing, strokeAlpha: 0.15, duration: 800, yoyo: true, repeat: -1
    });
}

// ── TECHNICIAN: deploys auto-turrets ─────────────────────────────
function _initTechnician(scene, e) {
    e._turrets = [];
    e._maxTurrets = 2;
    e._turretCooldown = 8000;
    e._lastTurretTime = scene.time?.now || 0;

    e._deployTurret = () => {
        if (e._turrets.length >= e._maxTurrets) return;
        const tx = e.x + Phaser.Math.Between(-80, 80);
        const ty = e.y + Phaser.Math.Between(-80, 80);

        const turret = scene.add.container(tx, ty).setDepth(7);
        // Turret visual: small square with rotating barrel
        const base = scene.add.rectangle(0, 0, 16, 16, 0xaa44ff).setStrokeStyle(2, 0xffffff);
        const barrel = scene.add.rectangle(10, 0, 12, 4, 0xdd88ff).setStrokeStyle(1, 0xffffff);
        turret.add([base, barrel]);

        // Turret state
        turret._hp = 30 + _round * 2;
        turret._maxHp = turret._hp;
        turret._fireRate = 1200;
        turret._lastFire = scene.time?.now || 0;
        turret._owner = e;
        turret._isEnemyTurret = true;

        // Turret label
        turret._label = scene.add.text(tx, ty - 18, 'TURRET', {
            font: '7px monospace', fill: '#aa44ff',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);

        // Turret AI: fire at player every _fireRate ms
        turret._fireTimer = scene.time.addEvent({ delay: turret._fireRate, loop: true, callback: () => {
            if (!turret.active || !player?.active || !isDeployed) return;
            const dist = Phaser.Math.Distance.Between(tx, ty, player.x, player.y);
            if (dist > 500) return;
            // Fire bullet toward player
            const angle = Phaser.Math.Angle.Between(tx, ty, player.x, player.y);
            turret.rotation = angle;
            const b = scene.add.circle(tx, ty, 3, 0xaa44ff, 1).setDepth(9);
            scene.physics.add.existing(b);
            b.body.setVelocity(Math.cos(angle) * 280, Math.sin(angle) * 280);
            b._isTurretBullet = true;
            b.damageValue = 4 + Math.min(Math.floor(_round * 0.4), 16);
            if (enemyBullets) enemyBullets.add(b);
            scene.time.delayedCall(2500, () => { if (b?.active) b.destroy(); });
        }});

        e._turrets.push(turret);
    };

    // Cleanup turrets on enemy death
    e._onDestroy = () => {
        e._turrets.forEach(t => {
            if (t._fireTimer) t._fireTimer.remove();
            if (t._label) t._label.destroy();
            if (t.active) t.destroy();
        });
        e._turrets = [];
    };
}

// ── BERSERKER: enrages below 50% HP ─────────────────────────────
function _initBerserker(scene, e) {
    e._enraged = false;
    e._baseSpeed = e.speed;
    e._checkEnrage = () => {
        if (e._enraged) return;
        const hpRatio = Object.values(e.comp).reduce((s, c) => s + c.hp, 0) /
                        Object.values(e.comp).reduce((s, c) => s + c.max, 0);
        if (hpRatio < 0.50) {
            e._enraged = true;
            e.speed = Math.round(e._baseSpeed * 1.75);
            e.behavior = 'rusher';
            e.shield = 0;
            e.maxShield = 0;
            e._enrageDmgMult = 1.5;
            // Visual: red flash + pulsing red glow
            const flash = scene.add.circle(e.x, e.y, 50, 0xff0000, 0.4).setDepth(12);
            scene.tweens.add({ targets: flash, scaleX: 2, scaleY: 2, alpha: 0, duration: 400, onComplete: () => flash.destroy() });
            // Rage text
            const txt = scene.add.text(e.x, e.y - 50, 'ENRAGED!', {
                font: 'bold 11px monospace', fill: '#ff2200',
                stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(15);
            scene.tweens.add({ targets: txt, y: txt.y - 25, alpha: 0, duration: 1500, onComplete: () => txt.destroy() });
        }
    };
}

// ── SNIPER ELITE: cloaks after firing ────────────────────────────
function _initSniperElite(scene, e) {
    e._cloaked = false;
    e._cloakDuration = 3000;
    e._lastCloakTime = 0;
    // Laser sight warning before firing
    e._laserGfx = scene.add.graphics().setDepth(4);

    e._onFire = () => {
        // Cloak after firing
        e._cloaked = true;
        e._lastCloakTime = scene.time?.now || 0;
        // Visual: fade out
        if (e.torso) e.torso.setAlpha(0.15);
        if (e.visuals) e.visuals.setAlpha(0.15);
        if (e.typeLabel) e.typeLabel.setAlpha(0);
        // Reposition: move to a random offset
        const newX = e.x + Phaser.Math.Between(-200, 200);
        const newY = e.y + Phaser.Math.Between(-200, 200);
        e.body.setVelocity(
            (Phaser.Math.Clamp(newX, 100, 3900) - e.x) * 2,
            (Phaser.Math.Clamp(newY, 100, 3900) - e.y) * 2
        );
        // Uncloak after duration
        scene.time.delayedCall(e._cloakDuration, () => {
            if (!e?.active) return;
            e._cloaked = false;
            if (e.torso) e.torso.setAlpha(1);
            if (e.visuals) e.visuals.setAlpha(1);
            if (e.typeLabel) e.typeLabel.setAlpha(1);
        });
    };

    e._onDestroy = () => {
        if (e._laserGfx?.active) e._laserGfx.destroy();
    };
}

// ── DRONE CARRIER: launches attack drones ────────────────────────
function _initDroneCarrier(scene, e) {
    e._drones = [];
    e._maxDrones = 3;
    e._droneCooldown = 6000;
    e._lastDroneTime = scene.time?.now || 0;
    e._droneOrbitRadius = 80;
    e._droneOrbitSpeed = 0.002;

    e._launchDrone = () => {
        if (e._drones.length >= e._maxDrones) return;
        const angle = (e._drones.length / e._maxDrones) * Math.PI * 2;
        const dx = e.x + Math.cos(angle) * e._droneOrbitRadius;
        const dy = e.y + Math.sin(angle) * e._droneOrbitRadius;

        const drone = scene.add.container(dx, dy).setDepth(8);
        // Drone visual: small diamond
        const body = scene.add.polygon(0, 0, [0,-6, 6,0, 0,6, -6,0], 0xccaa00).setDepth(8);
        body.setStrokeStyle(1, 0xffcc00);
        drone.add([body]);

        drone._hp = 15 + _round;
        drone._orbitAngle = angle;
        drone._fireRate = 1500;
        drone._lastFire = scene.time?.now || 0;
        drone._owner = e;
        drone._isDrone = true;

        drone._fireTimer = scene.time.addEvent({ delay: drone._fireRate, loop: true, callback: () => {
            if (!drone.active || !player?.active || !isDeployed) return;
            const dist = Phaser.Math.Distance.Between(drone.x, drone.y, player.x, player.y);
            if (dist > 450) return;
            const bAngle = Phaser.Math.Angle.Between(drone.x, drone.y, player.x, player.y);
            const b = scene.add.circle(drone.x, drone.y, 2, 0xffcc00, 1).setDepth(9);
            scene.physics.add.existing(b);
            b.body.setVelocity(Math.cos(bAngle) * 250, Math.sin(bAngle) * 250);
            b._isTurretBullet = true;
            b.damageValue = 3 + Math.min(Math.floor(_round * 0.25), 12);
            if (enemyBullets) enemyBullets.add(b);
            scene.time.delayedCall(2000, () => { if (b?.active) b.destroy(); });
        }});

        // Orbit update — stored on drone for per-frame update
        drone._updateOrbit = (time) => {
            if (!e?.active || !drone.active) return;
            drone._orbitAngle += e._droneOrbitSpeed * 16; // approx per-frame
            drone.x = e.x + Math.cos(drone._orbitAngle) * e._droneOrbitRadius;
            drone.y = e.y + Math.sin(drone._orbitAngle) * e._droneOrbitRadius;
        };

        e._drones.push(drone);
    };

    e._onDestroy = () => {
        e._drones.forEach(d => {
            if (d._fireTimer) d._fireTimer.remove();
            if (d.active) d.destroy();
        });
        e._drones = [];
    };
}

// ── APPLY ELITE MODIFIER TO AN ENEMY ─────────────────────────────
function applyEliteModifier(scene, e, modKey) {
    const mod = ELITE_MODIFIERS[modKey];
    if (!mod || !e) return;

    if (!e._eliteMods) e._eliteMods = [];
    e._eliteMods.push(modKey);
    e.isElite = true;

    // Scale HP
    Object.values(e.comp).forEach(part => {
        part.hp = Math.round(part.hp * mod.hpScale);
        part.max = Math.round(part.max * mod.hpScale);
    });
    e.health = Object.values(e.comp).reduce((s, c) => s + c.hp, 0);
    e.maxHealth = e.health;

    // Scale speed
    e.speed = Math.round(e.speed * mod.speedScale);

    // Elite label
    if (!e._eliteLabel) {
        const labelY = e.typeLabel ? (parseFloat(e.typeLabel.y) - 12) :
                       e.cmdLabel ? (parseFloat(e.cmdLabel.y) - 12) :
                       e.y - (e.loadout?.chassis === 'heavy' ? 82 : 67);
        e._eliteLabel = scene.add.text(e.x, labelY, '', {
            font: 'bold 8px monospace', fill: mod.color,
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(11);
    }
    e._eliteLabel.setText(e._eliteMods.map(k => ELITE_MODIFIERS[k].label).join(' + '));
    e._eliteLabel.setFill(mod.color);
    scene.tweens.add({ targets: e._eliteLabel, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });

    // Glow aura
    if (!e._eliteGlow) {
        e._eliteGlow = scene.add.circle(e.x, e.y, 40, mod.glowColor, 0.12).setDepth(3);
        scene.tweens.add({
            targets: e._eliteGlow, scaleX: 1.4, scaleY: 1.4, alpha: 0.04,
            duration: 1000, yoyo: true, repeat: -1
        });
    } else {
        // Multi-modifier: change glow to white
        e._eliteGlow.setFillStyle(0xffffff, 0.1);
    }

    // ── MODIFIER-SPECIFIC LOGIC ──────────────────────────────
    if (modKey === 'vampiric') {
        e._vampiric = true;
        e._vampHealPct = 0.25; // heal 25% of damage dealt
    }

    if (modKey === 'shielded') {
        e._eliteShieldMax = 60 + Math.min(_round * 3, 90);
        e._eliteShield = e._eliteShieldMax;
        e._eliteShieldRegen = 5; // per second
        // Blue ring
        e._eliteShieldRing = scene.add.circle(e.x, e.y, 42, 0x2266ff, 0).setDepth(5);
        e._eliteShieldRing.setStrokeStyle(2, 0x4488ff, 0.6);
        scene.tweens.add({
            targets: e._eliteShieldRing, strokeAlpha: 0.2, duration: 700, yoyo: true, repeat: -1
        });
    }

    if (modKey === 'explosive') {
        e._explosiveOnDeath = true;
        e._explosionRadius = 150;
        e._explosionDmg = 40;
    }

    if (modKey === 'swift') {
        e._swiftFireRateMult = 0.75; // 25% faster
    }

    if (modKey === 'armored') {
        e._passiveDR = Math.min(0.50, (e._passiveDR || 0) + 0.30);
    }

    if (modKey === 'splitting') {
        e._splitting = true;
    }
}

// ── UPDATE SPECIAL ENEMY PER-FRAME ───────────────────────────────
function updateSpecialEnemies(scene, time) {
    if (!enemies) return;
    enemies.getChildren().forEach(e => {
        if (!e.active) return;

        // Update type label position
        if (e.typeLabel) {
            e.typeLabel.setPosition(e.x, e.y - (e.loadout?.chassis === 'heavy' ? 70 : 55));
        }
        // Update elite visuals position
        if (e._eliteLabel) {
            const baseY = e.typeLabel ? e.typeLabel.y - 12 :
                          e.cmdLabel ? e.cmdLabel.y - 12 :
                          e.y - (e.loadout?.chassis === 'heavy' ? 82 : 67);
            e._eliteLabel.setPosition(e.x, baseY);
        }
        if (e._eliteGlow) e._eliteGlow.setPosition(e.x, e.y);
        if (e._eliteShieldRing) e._eliteShieldRing.setPosition(e.x, e.y);

        // ── SCOUT: trigger alert on first chase ──────────────
        if (e.enemyType === 'scout' && e._aiState === 'chase' && e._onSpotPlayer) {
            e._onSpotPlayer();
            e._onSpotPlayer = null; // one-time
        }

        // ── ENFORCER: update ring position ───────────────────
        if (e.enemyType === 'enforcer' && e._enforcerRing) {
            e._enforcerRing.setPosition(e.x, e.y);
            if (!e._shieldGateActive) e._enforcerRing.setAlpha(0.1);
        }

        // ── TECHNICIAN: deploy turrets ───────────────────────
        if (e.enemyType === 'technician' && e._deployTurret) {
            const now = scene.time?.now || 0;
            if (e._aiState === 'combat' && now - e._lastTurretTime > e._turretCooldown && e._turrets.length < e._maxTurrets) {
                e._lastTurretTime = now;
                e._deployTurret();
            }
            // Update turret label positions
            e._turrets.forEach(t => {
                if (t._label && t.active) t._label.setPosition(t.x, t.y - 18);
            });
        }

        // ── BERSERKER: check enrage threshold ────────────────
        if (e.enemyType === 'berserker' && e._checkEnrage) {
            e._checkEnrage();
        }

        // ── SNIPER ELITE: laser sight + cloak state ─────────
        if (e.enemyType === 'sniperElite') {
            if (e._laserGfx) {
                e._laserGfx.clear();
                if (!e._cloaked && e._aiState === 'combat' && player?.active) {
                    e._laserGfx.lineStyle(1, 0xff0000, 0.3);
                    e._laserGfx.lineBetween(e.x, e.y, player.x, player.y);
                }
            }
        }

        // ── DRONE CARRIER: launch drones + update orbits ─────
        if (e.enemyType === 'droneCarrier') {
            const now = scene.time?.now || 0;
            if (e._aiState === 'combat' && now - e._lastDroneTime > e._droneCooldown && e._drones.length < e._maxDrones) {
                e._lastDroneTime = now;
                e._launchDrone();
            }
            e._drones.forEach(d => {
                if (d.active && d._updateOrbit) d._updateOrbit(time);
            });
        }

        // ── ELITE: shielded regen ────────────────────────────
        if (e._eliteShield !== undefined && e._eliteShield < e._eliteShieldMax) {
            e._eliteShield = Math.min(e._eliteShieldMax, e._eliteShield + e._eliteShieldRegen / 60);
            if (e._eliteShieldRing) {
                const pct = e._eliteShield / e._eliteShieldMax;
                e._eliteShieldRing.setStrokeStyle(2, 0x4488ff, 0.2 + pct * 0.5);
            }
        }
    });
}

// ── HANDLE ELITE DAMAGE MODIFIERS (called from damageEnemy) ──────
function handleEliteDamage(e, amt) {
    // Shielded elite: absorb damage with overshield first
    if (e._eliteShield !== undefined && e._eliteShield > 0) {
        const absorbed = Math.min(e._eliteShield, amt * 0.5);
        e._eliteShield -= absorbed;
        amt -= absorbed;
    }
    // Enforcer shield gate: absorb first 30% of total damage
    if (e._shieldGateActive && e._shieldGateDamageAbsorbed < e._shieldGateMax) {
        const canAbsorb = e._shieldGateMax - e._shieldGateDamageAbsorbed;
        const absorbed = Math.min(canAbsorb, amt);
        e._shieldGateDamageAbsorbed += absorbed;
        amt -= absorbed;
        if (e._shieldGateDamageAbsorbed >= e._shieldGateMax) {
            e._shieldGateActive = false;
            // Visual: gate break
            const scene = GAME?.scene?.scenes[0];
            if (scene) {
                const txt = scene.add.text(e.x, e.y - 30, 'GATE BROKEN', {
                    font: 'bold 9px monospace', fill: '#0088cc',
                    stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5).setDepth(15);
                scene.tweens.add({ targets: txt, y: txt.y - 20, alpha: 0, duration: 1200, onComplete: () => txt.destroy() });
            }
        }
        if (amt <= 0) return 0;
    }
    // Cloaked sniper takes reduced damage (50% DR instead of 70%)
    if (e._cloaked) amt *= 0.5;
    return Math.max(0, amt);
}

// ── HANDLE ELITE DEATH EFFECTS ───────────────────────────────────
function handleEliteDeath(scene, e) {
    // Explosive: death explosion damages player
    if (e._explosiveOnDeath && player?.active) {
        const dist = Phaser.Math.Distance.Between(e.x, e.y, player.x, player.y);
        if (dist < e._explosionRadius) {
            // Orange warning flash
            createExplosion(scene, e.x, e.y, e._explosionRadius * 0.8, 0);
            if (typeof processPlayerDamage === 'function') {
                const falloff = 1 - (dist / e._explosionRadius);
                processPlayerDamage(Math.round(e._explosionDmg * falloff), 0);
            }
        } else {
            createExplosion(scene, e.x, e.y, 80, 0);
        }
    }

    // Splitting: spawn 2 half-HP minions
    if (e._splitting) {
        for (let i = 0; i < 2; i++) {
            const miniType = e.enemyType || null;
            // Spawn a regular enemy at this position with half HP
            const mini = scene.add.rectangle(
                e.x + Phaser.Math.Between(-40, 40),
                e.y + Phaser.Math.Between(-40, 40),
                36, 36, 0x000000, 0
            );
            scene.physics.add.existing(mini);
            mini.body.setCircle(22);

            const chassis = e.loadout?.chassis || 'medium';
            const colors = e.enemyType ? ENEMY_TYPE_DEFS[e.enemyType]?.colors : ENEMY_COLORS[chassis];
            mini.visuals = buildEnemyMech(scene, chassis, colors || ENEMY_COLORS[chassis]);
            mini.visuals.setPosition(mini.x, mini.y).setScale(CHASSIS[chassis].scale * 0.7);
            mini.torso = buildEnemyTorso(scene, chassis, colors || ENEMY_COLORS[chassis]);
            mini.torso.setPosition(mini.x, mini.y).setScale(CHASSIS[chassis].scale * 0.7).setDepth(6);

            // Half HP of parent
            const halfScale = 0.5;
            mini.loadout = { ...e.loadout };
            mini.behavior = 'rusher';
            mini.speed = Math.round((e.speed || 200) * 1.2);
            mini.comp = {};
            Object.entries(e.comp).forEach(([k, v]) => {
                mini.comp[k] = { hp: Math.round(v.max * halfScale), max: Math.round(v.max * halfScale) };
            });
            mini.health = Object.values(mini.comp).reduce((s, c) => s + c.hp, 0);
            mini.maxHealth = mini.health;
            mini.reloadL = 0; mini.reloadR = 0;
            mini.lastSecTime = -99999; mini.lastModTime = -99999; mini.isModActive = false;
            mini._passiveDR = 0; mini._reloadMult = 1.0; mini._augState = {};
            mini._fireGrace = true;
            setTimeout(() => { if (mini?.active) mini._fireGrace = false; }, 1000);
            mini.lastFireTime = 0; mini.lastSecTime = 0;
            mini.maxShield = 0; mini.shield = 0; mini._shieldAbsorb = 0;
            mini._lastDamageTime = -99999;
            mini.fxFootTimer = 0; mini.fxFootSide = 1; mini.fxShockTimer = 0;
            mini.fxLastX = mini.x; mini.fxLastY = mini.y;
            mini.fxLastMX = mini.x; mini.fxLastMY = mini.y;
            mini._visionConeGfx = scene.add.graphics().setDepth(3);
            mini._squadLeader = mini; mini._squadId = Math.floor(Math.random() * 100000);
            mini._isSplitMinion = true;

            // Mini label
            mini._splitLabel = scene.add.text(mini.x, mini.y - 30, 'SPLIT', {
                font: '7px monospace', fill: '#cc44ff',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(10);

            _roundTotal++; // increment kill requirement
            enemies.add(mini);
            if (coverObjects) scene.physics.add.collider(mini, coverObjects);
        }
    }

    // Kill infinite tweens before destroying objects to prevent memory leaks
    const _tweenTargets = [e._eliteLabel, e._eliteGlow, e._eliteShieldRing, e._enforcerRing, e.typeLabel].filter(Boolean);
    _tweenTargets.forEach(t => { try { scene.tweens.killTweensOf(t); } catch(ex) {} });

    // Cleanup elite visuals
    if (e._eliteLabel?.active) e._eliteLabel.destroy();
    if (e._eliteGlow?.active) e._eliteGlow.destroy();
    if (e._eliteShieldRing?.active) e._eliteShieldRing.destroy();
    if (e._enforcerRing?.active) e._enforcerRing.destroy();
    if (e._laserGfx?.active) e._laserGfx.destroy();
    if (e._visionConeGfx?.active) e._visionConeGfx.destroy();

    // Cleanup type label
    if (e.typeLabel?.active) e.typeLabel.destroy();
    if (e._splitLabel?.active) e._splitLabel.destroy();

    // Cleanup drones and turrets
    if (e._onDestroy) { try { e._onDestroy(); } catch(ex) {} }
}

// ── HANDLE ELITE VAMPIRIC ON-HIT (called when enemy hits player) ─
function handleVampiricHeal(e, dmgDealt) {
    if (!e?._vampiric || !e.active) return;
    const heal = Math.round(dmgDealt * e._vampHealPct);
    if (heal <= 0) return;
    // Heal core HP
    if (e.comp?.core && e.comp.core.hp < e.comp.core.max) {
        e.comp.core.hp = Math.min(e.comp.core.max, e.comp.core.hp + heal);
        e.health = Object.values(e.comp).reduce((s, c) => s + c.hp, 0);
    }
}
