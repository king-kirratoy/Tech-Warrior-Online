// ================================================================
// TECH WARRIOR ONLINE — PVP MULTIPLAYER CLIENT
// Manages Socket.io connection, lobby, remote player rendering,
// and bullet replication for PVP free-for-all matches.
//
// Depends on: index.html globals (CHASSIS, WEAPONS, buildPlayerMech,
//             darkenColor, player, torso, loadout, etc.)
// ================================================================

// ── Module state ────────────────────────────────────────────────

let _mpSocket = null;           // Socket.io connection
let _mpConnected = false;
let _mpIsHost = false;
let _mpLocalId = null;          // Our socket ID
let _mpPlayers = new Map();     // socketId → { info, body, torso, nameTag, lastUpdate }
let _mpMatchActive = false;
let _mpMySpawn = null;          // { x, y } assigned spawn point
let _mpAlive = true;            // Are we alive this match?
let _mpKills = 0;
let _mpDeaths = 0;
let _mpKillFeed = [];           // Recent kill messages [{ text, time }]
let _mpLobbyPlayers = [];       // Current lobby player list
let _mpStateInterval = null;    // Interval for sending player state
let _mpPvpBullets = null;       // Phaser group for remote player bullets

// ── CONNECT TO SERVER ──────────────────────────────────────────

function mpConnect(serverUrl) {
    if (_mpSocket) return;

    // Socket.io loaded via CDN in index.html
    _mpSocket = io(serverUrl || window.location.origin, {
        transports: ['websocket', 'polling']
    });

    _mpSocket.on('connect', () => {
        _mpConnected = true;
        _mpLocalId = _mpSocket.id;
        console.log('[MP] Connected:', _mpLocalId);

        // Auto-join lobby with current callsign + loadout
        _mpSocket.emit('lobby-join', {
            name: _playerCallsign || 'ANONYMOUS',
            chassis: loadout.chassis,
            color: loadout.color,
            loadout: {
                chassis: loadout.chassis,
                L: loadout.L,
                R: loadout.R,
                mod: loadout.mod,
                shld: loadout.shld
            }
        });
    });

    _mpSocket.on('disconnect', () => {
        _mpConnected = false;
        console.log('[MP] Disconnected');
        mpCleanupMatch();
    });

    // ── LOBBY EVENTS ───────────────────────────────────────────

    _mpSocket.on('lobby-state', (data) => {
        _mpLobbyPlayers = data.players;
        _mpIsHost = (data.hostId === _mpLocalId);
        _mpMatchActive = data.matchActive;
        mpUpdateLobbyUI();
    });

    _mpSocket.on('lobby-player-joined', (info) => {
        // Add to local list if not already there
        if (!_mpLobbyPlayers.find(p => p.id === info.id)) {
            _mpLobbyPlayers.push(info);
        }
        mpUpdateLobbyUI();
        mpShowChat(info.name + ' joined the lobby', '#00ffcc');
    });

    _mpSocket.on('lobby-player-updated', (info) => {
        const idx = _mpLobbyPlayers.findIndex(p => p.id === info.id);
        if (idx >= 0) _mpLobbyPlayers[idx] = info;
        else _mpLobbyPlayers.push(info);
        mpUpdateLobbyUI();
    });

    _mpSocket.on('lobby-player-left', (data) => {
        _mpLobbyPlayers = _mpLobbyPlayers.filter(p => p.id !== data.id);
        mpUpdateLobbyUI();
    });

    _mpSocket.on('host-changed', (data) => {
        _mpIsHost = (data.hostId === _mpLocalId);
        mpUpdateLobbyUI();
        if (_mpIsHost) mpShowChat('You are now the HOST', '#ffcc00');
    });

    // ── MATCH EVENTS ───────────────────────────────────────────

    _mpSocket.on('match-begin', (data) => {
        _mpMatchActive = true;
        _mpAlive = true;
        _mpKills = 0;
        _mpMySpawn = data.spawns[_mpLocalId] || { x: 2000, y: 2000 };

        // Build remote player representations
        const scene = game.scene.scenes[0];
        data.players.forEach(p => {
            if (p.id === _mpLocalId) return;
            mpCreateRemotePlayer(scene, p, data.spawns[p.id]);
        });

        // Hide lobby, trigger deploy
        mpHideLobby();
        mpDeployPVP();
    });

    _mpSocket.on('match-ended', () => {
        _mpMatchActive = false;
        mpCleanupMatch();
        mpShowLobby();
    });

    // ── IN-MATCH: REMOTE PLAYER STATE ──────────────────────────

    _mpSocket.on('player-state', (data) => {
        if (!_mpMatchActive) return;
        const rp = _mpPlayers.get(data.id);
        if (!rp) return;

        // Store target state for interpolation
        rp.targetX = data.x;
        rp.targetY = data.y;
        rp.targetRotation = data.rotation;
        rp.targetTorsoRotation = data.torsoRotation;
        rp.velocityX = data.velocityX || 0;
        rp.velocityY = data.velocityY || 0;
        rp.hp = data.hp;
        rp.shield = data.shield;
        rp.maxHp = data.maxHp;
        rp.maxShield = data.maxShield;
        rp.lastUpdate = Date.now();
    });

    // ── IN-MATCH: REMOTE BULLET FIRED ──────────────────────────

    _mpSocket.on('bullet-fired', (data) => {
        if (!_mpMatchActive) return;
        const scene = game.scene.scenes[0];
        if (!scene) return;
        mpSpawnRemoteBullet(scene, data);
    });

    // ── IN-MATCH: HIT CONFIRMED (we hit someone) ──────────────

    _mpSocket.on('hit-confirmed', (data) => {
        // Visual feedback: we hit a player
        _shotsHit++;
        _damageDealt += (data.damage || 0);
    });

    // ── IN-MATCH: PLAYER HIT VISUAL ────────────────────────────

    _mpSocket.on('player-hit-visual', (data) => {
        if (!_mpMatchActive) return;
        const scene = game.scene.scenes[0];
        if (!scene) return;
        try {
            createImpactSparks(scene, data.x, data.y);
            showDamageText(scene, data.x, data.y, data.damage);
        } catch(e) {}
    });

    // ── IN-MATCH: PLAYER KILLED ────────────────────────────────

    _mpSocket.on('player-killed', (data) => {
        // Kill feed
        const feedMsg = data.killerName
            ? `${data.killerName} eliminated ${data.victimName}`
            : `${data.victimName} disconnected`;
        mpAddKillFeed(feedMsg);

        // Track our kills
        if (data.killerId === _mpLocalId) {
            _mpKills++;
            _totalKills++;
        }

        // Remove dead remote player visuals
        if (data.victimId !== _mpLocalId) {
            mpDestroyRemotePlayer(data.victimId);
        }

        // Check for victory (are we the last one?)
        if (_mpMatchActive && data.victimId !== _mpLocalId) {
            const aliveRemote = Array.from(_mpPlayers.values()).filter(rp => rp.alive);
            if (aliveRemote.length === 0 && _mpAlive) {
                mpShowVictory();
            }
        }
    });

    // ── CHAT ───────────────────────────────────────────────────

    _mpSocket.on('chat', (data) => {
        if (data.id === _mpLocalId) return; // Already shown locally
        mpShowChat(`${data.name}: ${data.message}`, '#cccccc');
    });
}

// ── DISCONNECT ─────────────────────────────────────────────────

function mpDisconnect() {
    if (_mpSocket) {
        _mpSocket.disconnect();
        _mpSocket = null;
    }
    _mpConnected = false;
    _mpLocalId = null;
    _mpIsHost = false;
    _mpPlayers.clear();
    _mpMatchActive = false;
    _mpLobbyPlayers = [];
    if (_mpStateInterval) { clearInterval(_mpStateInterval); _mpStateInterval = null; }
}

// ================================================================
// REMOTE PLAYER MANAGEMENT
// ================================================================

function mpCreateRemotePlayer(scene, info, spawn) {
    const spawnPos = spawn || { x: 2000, y: 2000 };
    const chassis = info.chassis || 'medium';
    const color = info.color || 0xff4444;

    // Physics body for collision detection with our bullets
    const body = scene.add.rectangle(spawnPos.x, spawnPos.y, 40, 40, 0x000000, 0)
        .setDepth(5);
    scene.physics.add.existing(body);
    const hitR = chassis === 'light' ? 16 : chassis === 'medium' ? 22 : 30;
    body.body.setCircle(hitR);
    body.body.setOffset(-hitR, -hitR);
    body.body.setImmovable(true);

    // Visual mech torso
    const remoteTorso = buildPlayerMech(scene, chassis, color);
    remoteTorso.setPosition(spawnPos.x, spawnPos.y).setDepth(10);

    // Name tag above mech
    const nameTag = scene.add.text(spawnPos.x, spawnPos.y - 50, info.name, {
        font: 'bold 11px monospace',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);

    // HP bar above name
    const hpBarBg = scene.add.rectangle(spawnPos.x, spawnPos.y - 38, 50, 5, 0x333333)
        .setOrigin(0.5).setDepth(19);
    const hpBar = scene.add.rectangle(spawnPos.x, spawnPos.y - 38, 50, 5, 0x00ff00)
        .setOrigin(0.5).setDepth(20);

    const rp = {
        info: info,
        body: body,
        torso: remoteTorso,
        nameTag: nameTag,
        hpBarBg: hpBarBg,
        hpBar: hpBar,
        targetX: spawnPos.x,
        targetY: spawnPos.y,
        targetRotation: 0,
        targetTorsoRotation: 0,
        velocityX: 0,
        velocityY: 0,
        hp: 100,
        shield: 0,
        maxHp: 100,
        maxShield: 100,
        lastUpdate: Date.now(),
        alive: true
    };
    _mpPlayers.set(info.id, rp);

    // Overlap: OUR bullets hit THEIR body
    scene.physics.add.overlap(bullets, body, (rpBody, bullet) => {
        if (!bullet?.active) return;
        const dmg = bullet.damageValue || 10;
        const bx = bullet.x, by = bullet.y;
        bullet.destroy();

        createImpactSparks(scene, bx, by);
        showDamageText(scene, bx, by, dmg);
        _shotsHit++;
        _damageDealt += dmg;

        // Tell server we hit this player
        _mpSocket.emit('player-hit', {
            shooterId: _mpLocalId,
            victimId: info.id,
            damage: dmg,
            x: bx,
            y: by
        });
    });
}

function mpDestroyRemotePlayer(playerId) {
    const rp = _mpPlayers.get(playerId);
    if (!rp) return;
    rp.alive = false;

    // Death explosion visual
    const scene = game.scene.scenes[0];
    if (scene && rp.body?.active) {
        try {
            const dust = scene.add.particles(rp.body.x, rp.body.y, 'smoke', {
                lifespan: { min: 400, max: 800 },
                scale: { start: 2, end: 0 },
                alpha: { start: 0.8, end: 0 },
                speed: { min: 60, max: 200 },
                angle: { min: 0, max: 360 },
                tint: 0xff4400,
                quantity: 20,
                frequency: -1
            }).setDepth(15);
            scene.time.delayedCall(1000, () => dust.destroy());
        } catch(e) {}
    }

    try { if (rp.body?.active) rp.body.destroy(); } catch(e) {}
    try { if (rp.torso?.active) rp.torso.destroy(); } catch(e) {}
    try { if (rp.nameTag?.active) rp.nameTag.destroy(); } catch(e) {}
    try { if (rp.hpBarBg?.active) rp.hpBarBg.destroy(); } catch(e) {}
    try { if (rp.hpBar?.active) rp.hpBar.destroy(); } catch(e) {}
}

function mpCleanupMatch() {
    // Destroy all remote players
    _mpPlayers.forEach((rp, id) => mpDestroyRemotePlayer(id));
    _mpPlayers.clear();

    // Destroy remote bullets
    if (_mpPvpBullets) {
        try { _mpPvpBullets.clear(true, true); } catch(e) {}
        _mpPvpBullets = null;
    }

    if (_mpStateInterval) { clearInterval(_mpStateInterval); _mpStateInterval = null; }
    _mpMatchActive = false;
    _mpKillFeed = [];
}

// ================================================================
// REMOTE BULLET SPAWNING
// ================================================================

function mpSpawnRemoteBullet(scene, data) {
    if (!_mpPvpBullets) {
        _mpPvpBullets = scene.physics.add.group();
        // PVP bullets hit local player
        scene.physics.add.overlap(_mpPvpBullets, player, (p, bullet) => {
            if (!bullet?.active || !player?.active || !isDeployed) return;

            const dmg = bullet.damageValue || 15;
            const bAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);

            if (isShieldActive) {
                try { sndShieldBlock(); } catch(e) {}
                try { createShieldSparks(scene, bullet.x, bullet.y); } catch(e) {}
                try { showDamageText(scene, bullet.x, bullet.y, 0, true); } catch(e) {}
                bullet.destroy();
                return;
            }

            createImpactSparks(scene, p.x, p.y);
            showDamageText(scene, p.x, p.y, dmg, player.shield > 0);
            bullet.destroy();
            processPlayerDamage(dmg, bAngle);

            // Report hit to server
            _mpSocket.emit('player-hit', {
                shooterId: bullet._shooterId,
                victimId: _mpLocalId,
                damage: dmg,
                x: p.x,
                y: p.y
            });

            // Check if we died
            if (player?.comp?.core?.hp <= 0) {
                _mpAlive = false;
                _mpDeaths++;
                _mpSocket.emit('player-killed', { killerId: bullet._shooterId });
            }
        });

        // PVP bullets hit cover
        scene.physics.add.collider(_mpPvpBullets, coverObjects, (bullet) => {
            if (!bullet?.active) return;
            createImpactSparks(scene, bullet.x, bullet.y);
            bullet.destroy();
        });
    }

    // Handle shotgun pellets
    const pelletCount = data.pellets || 1;
    for (let i = 0; i < pelletCount; i++) {
        let angle = data.angle;
        if (pelletCount > 1) {
            const spreadAngle = data.spread || 0.35;
            angle += (Math.random() - 0.5) * spreadAngle;
        }

        const bSize = data.bulletSize || 5;
        const bSpeed = data.speed || 800;
        const b = scene.add.circle(data.x, data.y, bSize, 0xff4444, 0.9).setDepth(11);
        scene.physics.add.existing(b);
        b.body.setCircle(bSize);
        b.body.velocity.x = Math.cos(angle) * bSpeed;
        b.body.velocity.y = Math.sin(angle) * bSpeed;
        b.damageValue = Math.round((data.damage || 10) / pelletCount);
        b._shooterId = data.shooterId;
        _mpPvpBullets.add(b);

        // Auto-destroy after 2 seconds
        scene.time.delayedCall(2000, () => { if (b?.active) b.destroy(); });
    }
}

// ================================================================
// UPDATE LOOP (called from game update())
// ================================================================

function mpUpdate(time) {
    if (!_mpMatchActive || !_mpConnected) return;

    // Interpolate remote player positions
    const now = Date.now();
    _mpPlayers.forEach((rp) => {
        if (!rp.alive || !rp.body?.active) return;

        // Smooth lerp toward target position
        const lerpFactor = 0.2;
        const currentX = rp.body.x;
        const currentY = rp.body.y;
        const newX = currentX + (rp.targetX - currentX) * lerpFactor;
        const newY = currentY + (rp.targetY - currentY) * lerpFactor;
        rp.body.setPosition(newX, newY);

        // Torso follows body + rotates
        if (rp.torso?.active) {
            rp.torso.setPosition(newX, newY);
            rp.torso.rotation = Phaser.Math.Angle.RotateTo(
                rp.torso.rotation,
                rp.targetTorsoRotation,
                0.15
            );
        }

        // Name tag + HP bar follow
        if (rp.nameTag?.active) rp.nameTag.setPosition(newX, newY - 50);
        if (rp.hpBarBg?.active) rp.hpBarBg.setPosition(newX, newY - 38);
        if (rp.hpBar?.active) {
            const hpFrac = Math.max(0, rp.hp / (rp.maxHp || 1));
            const barWidth = 50 * hpFrac;
            rp.hpBar.setSize(barWidth, 5);
            rp.hpBar.setPosition(newX - (50 - barWidth) / 2, newY - 38);
            rp.hpBar.setFillStyle(hpFrac > 0.5 ? 0x00ff00 : hpFrac > 0.25 ? 0xffcc00 : 0xff0000);
        }

        // Stale check — if no update for 3s, fade out
        if (now - rp.lastUpdate > 3000 && rp.torso?.active) {
            rp.torso.setAlpha(0.3);
        } else if (rp.torso?.active) {
            rp.torso.setAlpha(1.0);
        }
    });
}

// ── SEND LOCAL STATE (called at interval) ──────────────────────

function mpSendState() {
    if (!_mpSocket || !_mpConnected || !_mpMatchActive) return;
    if (!player?.active || !torso?.active) return;

    _mpSocket.emit('player-state', {
        x: Math.round(player.x),
        y: Math.round(player.y),
        rotation: player.rotation || 0,
        torsoRotation: torso.rotation || 0,
        velocityX: Math.round(player.body?.velocity?.x || 0),
        velocityY: Math.round(player.body?.velocity?.y || 0),
        hp: Math.round(player?.comp?.core?.hp || 0),
        shield: Math.round(player?.shield || 0),
        maxHp: Math.round(player?.comp?.core?.max || 100),
        maxShield: Math.round(player?.maxShield || 0),
        firing: false,
        chassis: loadout.chassis,
        color: loadout.color
    });
}

// ── BROADCAST BULLET FIRED (called from fire() hook) ───────────

function mpBroadcastBullet(x, y, angle, weaponKey, damage) {
    if (!_mpSocket || !_mpConnected || !_mpMatchActive) return;
    const w = WEAPONS[weaponKey];
    if (!w) return;

    _mpSocket.emit('bullet-fired', {
        x: Math.round(x),
        y: Math.round(y),
        angle: angle,
        weapon: weaponKey,
        speed: w.speed || 800,
        damage: Math.round(damage),
        bulletSize: w.bulletSize || 5,
        pierce: w.pierce || false,
        explosive: w.explosive || false,
        radius: w.radius || 0,
        pellets: w.pellets || 0,
        spread: w.pellets ? 0.35 : 0
    });
}

// ================================================================
// PVP DEPLOY — starts match from lobby
// ================================================================

function mpDeployPVP() {
    // Hide lobby UI, show hangar briefly for deploy
    document.getElementById('mp-lobby').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'none';

    // Override spawn position
    const scene = game.scene.scenes[0];
    const s = CHASSIS[loadout.chassis];

    if (scene.hangarOverlay) scene.hangarOverlay.setVisible(false);

    // Cover screen during deploy
    document.getElementById('deploy-cover').style.display = 'block';

    const legDims = { light: [40,30], medium: [60,40], heavy: [70,40] };
    const [legW, legH] = legDims[loadout.chassis] || legDims.medium;

    const spawnX = _mpMySpawn?.x || 2000;
    const spawnY = _mpMySpawn?.y || 2000;

    // Create player physics body at spawn
    player = scene.add.rectangle(spawnX, spawnY, legW, legH, 0x000000, 0)
        .setDepth(5);
    scene.physics.add.existing(player);
    const hitR = loadout.chassis === 'light' ? 16 : loadout.chassis === 'medium' ? 22 : 30;
    const hitOff = loadout.chassis === 'light' ? -8 : loadout.chassis === 'medium' ? -10 : -12;
    player.body.setCircle(hitR);
    player.body.setOffset(-hitR, hitOff);
    player.setScale(s.scale);
    player.body.setCollideWorldBounds(true);

    // Torso
    torso = buildPlayerMech(scene, loadout.chassis, loadout.color);
    torso.setDepth(10);

    // Player <-> cover
    if (coverObjects) scene.physics.add.collider(player, coverObjects);

    // Show battlefield
    if (scene._bfGrid) scene._bfGrid.setVisible(true);

    // World & camera
    scene.physics.world.setBounds(0, 0, 4000, 4000);
    scene.cameras.main.setBounds(0, 0, 4000, 4000);
    scene.cameras.main.centerOn(spawnX, spawnY);
    scene.cameras.main.startFollow(player, true, 0.5, 0.5);

    // Component HP
    if (typeof recalcGearStats === 'function') recalcGearStats();
    const gCoreHP = (typeof _gearState !== 'undefined' && _gearState?.coreHP || 0) + (typeof _gearState !== 'undefined' && _gearState?.allHP || 0);
    const gArmHP  = (typeof _gearState !== 'undefined' && _gearState?.armHP  || 0) + (typeof _gearState !== 'undefined' && _gearState?.allHP || 0);
    const gLegHP  = (typeof _gearState !== 'undefined' && _gearState?.legHP  || 0) + (typeof _gearState !== 'undefined' && _gearState?.allHP || 0);
    player.comp = {
        core: { hp: s.coreHP + gCoreHP, max: s.coreHP + gCoreHP },
        lArm: { hp: s.armHP  + gArmHP,  max: s.armHP  + gArmHP },
        rArm: { hp: s.armHP  + gArmHP,  max: s.armHP  + gArmHP },
        legs: { hp: s.legHP  + gLegHP,  max: s.legHP  + gLegHP }
    };
    if (typeof _resetHUDState === 'function') _resetHUDState();
    player.maxHp     = getTotalHP(loadout.chassis);
    player.hp        = player.maxHp;
    const shldSys = (typeof SHIELD_SYSTEMS !== 'undefined' ? SHIELD_SYSTEMS[loadout.shld] : null) || { maxShield: 0, regenRate: 0, regenDelay: 5000, absorb: 0 };
    const gShieldHP = (typeof _gearState !== 'undefined' && _gearState?.shieldHP || 0);
    player.maxShield = (shldSys.maxShield || 0) + gShieldHP;
    player.shield    = (shldSys.maxShield || 0) + gShieldHP;
    player._shieldRegenRate  = shldSys.regenRate || 0;
    player._shieldRegenDelay = shldSys.regenDelay || 5000;
    player._shieldAbsorb     = shldSys.absorb || 0.50;

    if (typeof refreshMechColor === 'function') refreshMechColor();

    // Shield bubble
    const shieldRadius = 72 * CHASSIS[loadout.chassis].scale;
    shieldGraphic = scene.add.circle(0, 0, shieldRadius, 0x00ffff, 0.15)
        .setStrokeStyle(2, 0x00ffff).setVisible(false).setDepth(12);

    // Glow wedge & crosshair
    glowWedge = scene.add.graphics().setDepth(4);
    speedStreakLine = scene.add.graphics().setDepth(3);
    crosshair = scene.add.graphics().setDepth(9999).setScrollFactor(0);
    if (typeof drawCrosshair === 'function') drawCrosshair(crosshair);
    scene.input.setDefaultCursor('none');

    // No enemy colliders in PVP — players don't physically block each other
    player.isProcessingDamage = false;
    lastDamageTime = -99999;
    lastModTime    = -10000;
    _lArmDestroyed = false; _rArmDestroyed = false; _legsDestroyed = false;

    // Save weapon loadout
    _savedL = loadout.L; _savedR = loadout.R;
    _savedMod = loadout.mod; _savedAug = loadout.aug; _savedLeg = loadout.leg;

    // Drop-in animation
    const normalScale = CHASSIS[loadout.chassis].scale;
    player.setAlpha(1); torso.setAlpha(1);
    if (glowWedge) glowWedge.setVisible(false);
    document.getElementById('deploy-cover').style.display = 'none';
    document.getElementById('hud-container').style.display = 'flex';
    document.getElementById('top-left-btns').style.display = 'flex';
    const mm = document.getElementById('minimap-wrap'); if (mm) mm.style.display = 'block';

    scene.cameras.main.setLerp(1.0, 1.0);
    const dropOffsetY = 280;
    player.y -= dropOffsetY;
    torso.y -= dropOffsetY;
    isDeployed = false;

    scene.tweens.add({
        targets: [player, torso],
        y: `+=${dropOffsetY}`,
        duration: 750,
        ease: 'Cubic.easeIn',
        onComplete: () => {
            scene.cameras.main.setLerp(0.5, 0.5);
            if (glowWedge) glowWedge.setVisible(true);

            // Landing shockwave
            const w1 = scene.add.circle(player.x, player.y, 8, 0xffffff, 0)
                .setStrokeStyle(4, 0xffffff, 1.0).setDepth(15);
            scene.tweens.add({ targets: w1, radius: 120 * normalScale, alpha: 0,
                duration: 600, ease: 'Cubic.easeOut', onComplete: () => w1.destroy() });
            const w2 = scene.add.circle(player.x, player.y, 8, loadout.color, 0)
                .setStrokeStyle(2.5, loadout.color, 0.85).setDepth(14);
            scene.tweens.add({ targets: w2, radius: 90 * normalScale, alpha: 0,
                duration: 500, ease: 'Cubic.easeOut', onComplete: () => w2.destroy() });

            scene.cameras.main.shake(300, 0.018);

            if (!player?.active) return;
            isDeployed = true;
            _isPaused = false;
            try { scene.physics.resume(); } catch(e) {}
            try { scene.time.paused = false; } catch(e) {}
            if (typeof applyAugment === 'function') applyAugment();
            if (typeof applyLegSystem === 'function') applyLegSystem();

            // Show PVP HUD
            document.getElementById('round-hud').style.display = 'flex';
            if (typeof showRoundBanner === 'function') {
                showRoundBanner('PVP MATCH', _mpPlayers.size + ' OPPONENTS', 2500, null);
            }

            // Regenerate cover
            try { generateCover(scene); } catch(e) {}

            // Start sending state at 20Hz
            if (_mpStateInterval) clearInterval(_mpStateInterval);
            _mpStateInterval = setInterval(mpSendState, 50);

            // Show kill feed overlay
            mpShowKillFeedOverlay();
        }
    });
}

// ================================================================
// LOBBY UI
// ================================================================

function mpShowLobby() {
    // Hide other menus
    document.getElementById('ui-layer').style.display = 'none';
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) mainMenu.style.display = 'none';

    let lobbyEl = document.getElementById('mp-lobby');
    if (!lobbyEl) {
        lobbyEl = document.createElement('div');
        lobbyEl.id = 'mp-lobby';
        lobbyEl.style.cssText = `
            position: fixed; inset: 0; z-index: 2000;
            display: flex; justify-content: center; align-items: center;
            background: #0c1014;
            font-family: 'Courier New', monospace; color: #c8d2d9;
        `;
        lobbyEl.innerHTML = `
            <div style="width:600px;max-width:95vw;padding:32px;border:1px solid rgba(0,255,255,0.35);border-radius:10px;
                        background:linear-gradient(rgba(12,16,20,0.95),rgba(12,16,20,0.95)),url('assets/hangar-bg.jpg') center/cover;
                        box-shadow:0 0 40px rgba(0,0,0,0.7),0 0 20px rgba(0,255,255,0.1);">
                <h2 style="text-align:center;margin:0 0 8px;letter-spacing:8px;color:#00ffff;font-size:22px;
                           text-shadow:0 0 18px rgba(0,255,255,0.7);font-weight:normal;">PVP ARENA</h2>
                <div id="mp-lobby-status" style="text-align:center;font-size:10px;letter-spacing:3px;
                     color:rgba(0,255,255,0.5);margin-bottom:20px;">CONNECTING...</div>
                <div id="mp-player-list" style="margin-bottom:20px;max-height:300px;overflow-y:auto;"></div>
                <div style="display:flex;gap:8px;justify-content:center;">
                    <button id="mp-start-btn" onclick="mpStartMatch()" style="padding:12px 24px;font-size:14px;
                        letter-spacing:3px;color:#00ff00;border:1px solid rgba(0,255,0,0.4);border-left:3px solid #00ff00;
                        background:rgba(0,255,0,0.06);cursor:pointer;font-family:'Courier New',monospace;display:none;">
                        START MATCH</button>
                    <button id="mp-waiting-btn" style="padding:12px 24px;font-size:12px;letter-spacing:3px;
                        color:rgba(255,255,255,0.3);border:1px solid rgba(255,255,255,0.1);
                        background:rgba(255,255,255,0.02);cursor:default;font-family:'Courier New',monospace;">
                        WAITING FOR HOST...</button>
                    <button onclick="mpLeaveLobby()" style="padding:12px 24px;font-size:12px;letter-spacing:3px;
                        color:#ff4444;border:1px solid rgba(255,68,68,0.3);border-left:3px solid #ff4444;
                        background:rgba(255,68,68,0.06);cursor:pointer;font-family:'Courier New',monospace;">
                        LEAVE</button>
                </div>
                <div id="mp-chat-box" style="margin-top:16px;max-height:120px;overflow-y:auto;font-size:11px;
                     padding:8px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);border-radius:4px;">
                </div>
                <div style="display:flex;gap:6px;margin-top:6px;">
                    <input id="mp-chat-input" type="text" maxlength="200" placeholder="Type a message..."
                           style="flex:1;padding:6px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);
                                  color:#c8d2d9;font-family:'Courier New',monospace;font-size:11px;border-radius:3px;"
                           onkeydown="if(event.key==='Enter')mpSendChat()">
                    <button onclick="mpSendChat()" style="padding:6px 12px;font-size:11px;cursor:pointer;
                        color:#00ffcc;border:1px solid rgba(0,255,204,0.3);background:rgba(0,255,204,0.06);
                        font-family:'Courier New',monospace;border-radius:3px;">SEND</button>
                </div>
            </div>
        `;
        document.body.appendChild(lobbyEl);
    }
    lobbyEl.style.display = 'flex';
    mpUpdateLobbyUI();
}

function mpHideLobby() {
    const el = document.getElementById('mp-lobby');
    if (el) el.style.display = 'none';
}

function mpUpdateLobbyUI() {
    const statusEl = document.getElementById('mp-lobby-status');
    const listEl = document.getElementById('mp-player-list');
    const startBtn = document.getElementById('mp-start-btn');
    const waitBtn = document.getElementById('mp-waiting-btn');
    if (!listEl) return;

    if (statusEl) {
        statusEl.textContent = _mpConnected
            ? `${_mpLobbyPlayers.length} PLAYER${_mpLobbyPlayers.length !== 1 ? 'S' : ''} IN LOBBY` +
              (_mpIsHost ? ' // YOU ARE HOST' : '')
            : 'CONNECTING...';
        statusEl.style.color = _mpConnected ? 'rgba(0,255,204,0.7)' : 'rgba(255,200,0,0.7)';
    }

    // Player list
    listEl.innerHTML = _mpLobbyPlayers.map(p => {
        const isMe = p.id === _mpLocalId;
        const isHost = p.id && _mpLobbyPlayers[0]?.id === p.id;
        const chassisLabel = (p.chassis || 'light').toUpperCase();
        const colorHex = '#' + (p.color || 0x00ff00).toString(16).padStart(6, '0');
        return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:4px;
                    background:rgba(${isMe?'0,255,255':'255,255,255'},0.04);
                    border:1px solid rgba(${isMe?'0,255,255':'255,255,255'},${isMe?'0.2':'0.06'});
                    border-left:3px solid ${isMe?'#00ffff':colorHex};border-radius:4px;">
            <div style="width:12px;height:12px;background:${colorHex};border-radius:2px;flex-shrink:0;"></div>
            <div style="flex:1;">
                <span style="color:${isMe?'#00ffff':'#c8d2d9'};font-size:13px;font-weight:bold;">${p.name}</span>
                ${isHost?'<span style="color:#ffcc00;font-size:9px;margin-left:6px;">HOST</span>':''}
                ${isMe?'<span style="color:rgba(0,255,255,0.5);font-size:9px;margin-left:6px;">YOU</span>':''}
            </div>
            <span style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.4);">${chassisLabel}</span>
        </div>`;
    }).join('');

    // Show start button only for host with 2+ players
    if (startBtn && waitBtn) {
        if (_mpIsHost && _mpLobbyPlayers.length >= 2) {
            startBtn.style.display = 'block';
            waitBtn.style.display = 'none';
        } else if (_mpIsHost) {
            startBtn.style.display = 'none';
            waitBtn.style.display = 'block';
            waitBtn.textContent = 'NEED 2+ PLAYERS';
        } else {
            startBtn.style.display = 'none';
            waitBtn.style.display = 'block';
            waitBtn.textContent = 'WAITING FOR HOST...';
        }
    }
}

function mpStartMatch() {
    if (!_mpSocket || !_mpIsHost) return;
    // Send current loadout before starting
    _mpSocket.emit('lobby-update', {
        chassis: loadout.chassis,
        color: loadout.color,
        loadout: {
            chassis: loadout.chassis,
            L: loadout.L, R: loadout.R,
            mod: loadout.mod, shld: loadout.shld
        }
    });
    _mpSocket.emit('match-start');
}

function mpLeaveLobby() {
    mpDisconnect();
    mpHideLobby();
    // Return to main menu
    const menu = document.getElementById('main-menu');
    if (menu) { menu.style.display = ''; menu.style.opacity = '1'; }
}

function mpSendChat() {
    const input = document.getElementById('mp-chat-input');
    if (!input || !_mpSocket) return;
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    _mpSocket.emit('chat', msg);
    mpShowChat(`${_playerCallsign || 'YOU'}: ${msg}`, '#00ffcc');
}

function mpShowChat(text, color) {
    const box = document.getElementById('mp-chat-box');
    if (!box) return;
    const line = document.createElement('div');
    line.style.cssText = `color:${color || '#aaa'};margin-bottom:3px;`;
    line.textContent = text;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
}

// ================================================================
// KILL FEED (in-match overlay)
// ================================================================

function mpShowKillFeedOverlay() {
    let el = document.getElementById('mp-killfeed');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mp-killfeed';
        el.style.cssText = `
            position:fixed;top:60px;right:16px;z-index:1500;
            font-family:'Courier New',monospace;font-size:12px;
            pointer-events:none;width:300px;
        `;
        document.body.appendChild(el);
    }
    el.style.display = 'block';
}

function mpAddKillFeed(text) {
    _mpKillFeed.push({ text, time: Date.now() });
    if (_mpKillFeed.length > 6) _mpKillFeed.shift();
    mpRenderKillFeed();
}

function mpRenderKillFeed() {
    const el = document.getElementById('mp-killfeed');
    if (!el) return;
    const now = Date.now();
    // Remove entries older than 8s
    _mpKillFeed = _mpKillFeed.filter(e => now - e.time < 8000);
    el.innerHTML = _mpKillFeed.map(e => {
        const age = (now - e.time) / 8000;
        const opacity = Math.max(0.2, 1 - age);
        return `<div style="background:rgba(0,0,0,0.6);padding:4px 8px;margin-bottom:3px;
                    border-left:2px solid #ff4444;border-radius:2px;opacity:${opacity};
                    color:#ffcccc;">${e.text}</div>`;
    }).join('');
}

// ================================================================
// VICTORY / DEFEAT SCREEN
// ================================================================

function mpShowVictory() {
    _mpMatchActive = false;
    if (_mpStateInterval) { clearInterval(_mpStateInterval); _mpStateInterval = null; }

    // Show victory banner
    if (typeof showRoundBanner === 'function') {
        showRoundBanner('VICTORY', `${_mpKills} KILLS // ${_mpDeaths} DEATHS`, 4000, null);
    }

    // Return to lobby after delay
    setTimeout(() => {
        if (typeof _cleanupGame === 'function') _cleanupGame();
        mpCleanupMatch();
        _mpSocket?.emit('return-to-lobby');
        mpShowLobby();
    }, 5000);
}

function mpShowDefeat() {
    // Called when local player dies — show spectate info or return
    if (typeof showRoundBanner === 'function') {
        showRoundBanner('ELIMINATED', `${_mpKills} KILLS`, 3000, null);
    }

    setTimeout(() => {
        if (typeof _cleanupGame === 'function') _cleanupGame();
        mpCleanupMatch();
        _mpSocket?.emit('return-to-lobby');
        mpShowLobby();
    }, 4000);
}

// ================================================================
// MINIMAP: draw remote players as red dots
// ================================================================

function mpDrawMinimapPlayers(ctx, scale, offsetX, offsetY) {
    if (!_mpMatchActive) return;
    _mpPlayers.forEach((rp) => {
        if (!rp.alive || !rp.body?.active) return;
        const mx = rp.body.x * scale + offsetX;
        const my = rp.body.y * scale + offsetY;
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(mx - 2, my - 2, 4, 4);
    });
}
