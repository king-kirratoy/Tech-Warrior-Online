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
let _mpScoreboard = {};         // socketId → { kills, deaths } from server
let _mpKillsToWin = 25;        // Deathmatch kill target
let _mpMapSize = 6000;          // PVP map size (larger than standard 4000)
let _mpChatOpen = false;        // Is in-game chat input open?
let _mpRespawning = false;      // Are we in respawn countdown?

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

        // Auto-join lobby with current callsign + full loadout
        _mpSocket.emit('lobby-join', {
            name: _playerCallsign || 'ANONYMOUS',
            chassis: loadout.chassis,
            color: loadout.color,
            loadout: {
                chassis: loadout.chassis,
                L: loadout.L,
                R: loadout.R,
                mod: loadout.mod,
                shld: loadout.shld,
                leg: loadout.leg,
                aug: loadout.aug
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
        _mpDeaths = 0;
        _mpRespawning = false;
        _mpKillsToWin = data.killsToWin || 25;
        _mpMapSize = data.mapSize || 6000;
        _mpScoreboard = data.scoreboard || {};
        _mpMySpawn = data.spawns[_mpLocalId] || { x: _mpMapSize / 2, y: _mpMapSize / 2 };

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
        mpHideInGameChat();
        mpShowPvpHangar();
    });

    // ── DEATHMATCH: RESPAWN ──────────────────────────────────────

    _mpSocket.on('respawn', (data) => {
        if (!_mpMatchActive) return;
        _mpRespawning = true;
        const delay = data.delay || 3000;
        _mpMySpawn = { x: data.x, y: data.y };

        // Show respawn countdown
        mpShowRespawnCountdown(delay, () => {
            _mpRespawning = false;
            mpRespawnPlayer();
        });
    });

    // ── DEATHMATCH: MATCH WINNER ─────────────────────────────────

    _mpSocket.on('match-winner', (data) => {
        _mpMatchActive = false;
        _mpScoreboard = data.scoreboard || {};
        const isWinner = data.winnerId === _mpLocalId;
        mpShowMatchResults(isWinner, data.winnerName, data.scoreboard);
    });

    // ── IN-MATCH: REMOTE PLAYER STATE ──────────────────────────

    _mpSocket.on('player-state', (data) => {
        if (!_mpMatchActive) return;
        const rp = _mpPlayers.get(data.id);
        if (!rp) return;

        // Store target state for interpolation (reject NaN)
        if (isNaN(data.x) || isNaN(data.y)) return;
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
        // Update scoreboard
        if (data.scoreboard) _mpScoreboard = data.scoreboard;

        // Kill feed
        const feedMsg = data.killerName
            ? `${data.killerName} fragged ${data.victimName}`
            : `${data.victimName} disconnected`;
        mpAddKillFeed(feedMsg);

        // Track our kills
        if (data.killerId === _mpLocalId) {
            _mpKills++;
            _totalKills++;
        }

        // If victim is us, mark dead (respawn handled by 'respawn' event)
        if (data.victimId === _mpLocalId) {
            _mpAlive = false;
            _mpDeaths++;
        }

        // If victim is a remote player who disconnected, remove visuals
        // (for deathmatch, don't destroy on kill — they respawn)
        if (data.victimId !== _mpLocalId && data.killerName === 'DISCONNECT') {
            mpDestroyRemotePlayer(data.victimId);
        }

        // Update PVP HUD
        mpUpdatePvpHud();
    });

    // ── CHAT ───────────────────────────────────────────────────

    _mpSocket.on('chat', (data) => {
        if (data.id === _mpLocalId) return; // Already shown locally
        // In-match: show in game chat overlay; in lobby: show in lobby chat
        if (_mpMatchActive) {
            mpAddInGameChatMessage(`${data.name}: ${data.message}`, '#cccccc');
        } else {
            mpShowChat(`${data.name}: ${data.message}`, '#cccccc');
        }
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
    // Phaser callback order: (memberOfGroup1, object2) — bullet is from `bullets` group, rpBody is `body`
    scene.physics.add.overlap(bullets, body, (bullet, rpBody) => {
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
    _mpRespawning = false;
    _mpKillFeed = [];
    _mpScoreboard = {};

    // Hide PVP-specific UI
    mpHidePvpHud();
    mpHideInGameChat();
    const respawnEl = document.getElementById('mp-respawn-overlay');
    if (respawnEl) respawnEl.style.display = 'none';
    const resultsEl = document.getElementById('mp-results-overlay');
    if (resultsEl) resultsEl.style.display = 'none';
}

// ================================================================
// REMOTE BULLET SPAWNING
// ================================================================

function mpSpawnRemoteBullet(scene, data) {
    if (!_mpPvpBullets) {
        _mpPvpBullets = scene.physics.add.group();
        // PVP bullets hit local player
        // Phaser callback order: (memberOfGroup1, object2) — bullet is from `_mpPvpBullets`, playerObj is `player`
        scene.physics.add.overlap(_mpPvpBullets, player, (bullet, playerObj) => {
            if (!bullet?.active || !player?.active || !isDeployed) return;

            const dmg = bullet.damageValue || 15;
            const shooterId = bullet._shooterId;  // capture before destroy
            const bAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);

            if (isShieldActive) {
                try { sndShieldBlock(); } catch(e) {}
                try { createShieldSparks(scene, bullet.x, bullet.y); } catch(e) {}
                try { showDamageText(scene, bullet.x, bullet.y, 0, true); } catch(e) {}
                bullet.destroy();
                return;
            }

            createImpactSparks(scene, player.x, player.y);
            showDamageText(scene, player.x, player.y, dmg, player.shield > 0);
            bullet.destroy();

            try {
                processPlayerDamage(dmg, bAngle);
            } catch(e) {
                // Ensure damage lock is released even if processPlayerDamage throws
                if (player) player.isProcessingDamage = false;
            }

            // Report hit to server
            _mpSocket.emit('player-hit', {
                shooterId: shooterId,
                victimId: _mpLocalId,
                damage: dmg,
                x: player.x,
                y: player.y
            });

            // Check if we died — deathmatch: notify server, wait for respawn
            if (player?.comp?.core?.hp <= 0 && _mpAlive) {
                _mpAlive = false;
                _mpSocket.emit('player-killed', { killerId: shooterId });
                // Hide player visually until respawn
                if (player?.active) { player.setAlpha(0); player.body.setVelocity(0, 0); }
                if (torso?.active) torso.setAlpha(0);
                if (shieldGraphic?.active) shieldGraphic.setVisible(false);
                isDeployed = false;
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

        // Smooth lerp toward target position (guard against NaN)
        const lerpFactor = 0.2;
        const currentX = rp.body.x;
        const currentY = rp.body.y;
        if (isNaN(rp.targetX) || isNaN(rp.targetY)) return;
        const newX = currentX + (rp.targetX - currentX) * lerpFactor;
        const newY = currentY + (rp.targetY - currentY) * lerpFactor;
        if (isNaN(newX) || isNaN(newY)) return;
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
    // Guard against NaN coordinates propagating to remote clients
    const px = Math.round(player.x), py = Math.round(player.y);
    if (isNaN(px) || isNaN(py)) return;

    _mpSocket.emit('player-state', {
        x: px,
        y: py,
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

    const mapSize = _mpMapSize || 6000;
    const spawnX = _mpMySpawn?.x || mapSize / 2;
    const spawnY = _mpMySpawn?.y || mapSize / 2;

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

    // Show battlefield — resize grid to match PVP map size
    if (scene._bfGrid) {
        scene._bfGrid.setPosition(mapSize / 2, mapSize / 2);
        scene._bfGrid.setSize(mapSize, mapSize);
        scene._bfGrid.setVisible(true);
    }

    // World & camera (PVP uses larger map)
    scene.physics.world.setBounds(0, 0, mapSize, mapSize);
    scene.cameras.main.setBounds(0, 0, mapSize, mapSize);
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
    document.getElementById('top-left-btns').style.display = 'none'; // No pause/stats button in PVP
    document.getElementById('round-hud').style.display = 'none';
    const mm = document.getElementById('minimap-wrap'); if (mm) mm.style.display = 'block';
    mpShowPvpHud();

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

            // Show PVP HUD (custom deathmatch HUD, not the round HUD)
            document.getElementById('round-hud').style.display = 'none';
            mpShowPvpHud();
            mpShowInGameChat();
            if (typeof showRoundBanner === 'function') {
                showRoundBanner('DEATHMATCH', 'FIRST TO ' + _mpKillsToWin + ' KILLS', 2500, null);
            }

            // Generate PVP-specific cover for the larger map
            try { generatePvpCover(scene, _mpMapSize); } catch(e) {
                try { generateCover(scene); } catch(e2) {}
            }

            // Nudge player out of any overlapping cover objects
            try { mpNudgeOutOfCover(scene); } catch(e) {}

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

    // Player list — show chassis + weapon loadout summary
    listEl.innerHTML = _mpLobbyPlayers.map(p => {
        const isMe = p.id === _mpLocalId;
        const isHost = p.id && _mpLobbyPlayers[0]?.id === p.id;
        const chassisLabel = (p.chassis || 'light').toUpperCase();
        const colorHex = '#' + (p.color || 0x00ff00).toString(16).padStart(6, '0');
        // Build loadout summary
        const lo = p.loadout || {};
        const wL = lo.L && lo.L !== 'none' ? (typeof WEAPONS !== 'undefined' && WEAPONS[lo.L]?.name || lo.L.toUpperCase()) : '';
        const wR = lo.R && lo.R !== 'none' && lo.R !== lo.L ? (typeof WEAPONS !== 'undefined' && WEAPONS[lo.R]?.name || lo.R.toUpperCase()) : '';
        const weapons = [wL, wR].filter(Boolean).join(' / ') || 'UNARMED';
        return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:4px;
                    background:rgba(${isMe?'0,255,255':'255,255,255'},0.04);
                    border:1px solid rgba(${isMe?'0,255,255':'255,255,255'},${isMe?'0.2':'0.06'});
                    border-left:3px solid ${isMe?'#00ffff':colorHex};border-radius:4px;">
            <div style="width:12px;height:12px;background:${colorHex};border-radius:2px;flex-shrink:0;"></div>
            <div style="flex:1;">
                <span style="color:${isMe?'#00ffff':'#c8d2d9'};font-size:13px;font-weight:bold;">${p.name}</span>
                ${isHost?'<span style="color:#ffcc00;font-size:9px;margin-left:6px;">HOST</span>':''}
                ${isMe?'<span style="color:rgba(0,255,255,0.5);font-size:9px;margin-left:6px;">YOU</span>':''}
                <div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px;letter-spacing:1px;">${weapons}</div>
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
            mod: loadout.mod, shld: loadout.shld,
            leg: loadout.leg, aug: loadout.aug
        }
    });
    _mpSocket.emit('match-start');
}

function mpLeaveLobby() {
    mpDisconnect();
    mpHideLobby();
    // Return to PVP hangar for loadout changes
    mpShowPvpHangar();
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
    // Legacy — now handled by mpShowMatchResults
}

function mpShowDefeat() {
    // In deathmatch, death triggers respawn — not defeat screen
    // This is called from showDeathScreen() in index.html — block it
}

function mpShowMatchResults(isWinner, winnerName, scoreboard) {
    _mpMatchActive = false;
    if (_mpStateInterval) { clearInterval(_mpStateInterval); _mpStateInterval = null; }

    // Build sorted scoreboard
    const entries = [];
    for (const [id, s] of Object.entries(scoreboard)) {
        const p = _mpLobbyPlayers.find(pl => pl.id === id);
        entries.push({ id, name: p?.name || 'UNKNOWN', kills: s.kills, deaths: s.deaths });
    }
    entries.sort((a, b) => b.kills - a.kills);

    let el = document.getElementById('mp-results-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mp-results-overlay';
        el.style.cssText = `position:fixed;inset:0;z-index:20000;display:flex;justify-content:center;align-items:center;
            background:rgba(0,0,0,0.85);font-family:'Courier New',monospace;color:#c8d2d9;`;
        document.body.appendChild(el);
    }

    el.style.display = 'flex';
    el.innerHTML = `
        <div style="text-align:center;max-width:500px;">
            <div style="font-size:36px;letter-spacing:8px;color:${isWinner ? '#00ff00' : '#ff4444'};
                text-shadow:0 0 30px ${isWinner ? 'rgba(0,255,0,0.7)' : 'rgba(255,68,68,0.7)'};margin-bottom:8px;">
                ${isWinner ? 'VICTORY' : 'MATCH OVER'}
            </div>
            <div style="font-size:13px;letter-spacing:3px;color:rgba(255,255,255,0.5);margin-bottom:24px;">
                ${winnerName} WINS WITH ${scoreboard[Object.keys(scoreboard).find(k => entries[0]?.id === k)]?.kills || 0} KILLS
            </div>
            <div style="text-align:left;border:1px solid rgba(0,255,255,0.2);border-radius:6px;overflow:hidden;">
                <div style="display:flex;padding:8px 16px;background:rgba(0,255,255,0.08);font-size:10px;letter-spacing:2px;color:rgba(0,255,255,0.6);">
                    <span style="flex:1;">PLAYER</span><span style="width:60px;text-align:center;">KILLS</span><span style="width:60px;text-align:center;">DEATHS</span>
                </div>
                ${entries.map((e, i) => `
                    <div style="display:flex;padding:8px 16px;border-top:1px solid rgba(255,255,255,0.05);
                        background:${e.id === _mpLocalId ? 'rgba(0,255,255,0.06)' : 'transparent'};">
                        <span style="flex:1;color:${i === 0 ? '#ffcc00' : e.id === _mpLocalId ? '#00ffff' : '#c8d2d9'};font-size:12px;">
                            ${i === 0 ? '&#9733; ' : ''}${e.name}${e.id === _mpLocalId ? ' (YOU)' : ''}
                        </span>
                        <span style="width:60px;text-align:center;color:#00ff88;font-size:13px;">${e.kills}</span>
                        <span style="width:60px;text-align:center;color:#ff6666;font-size:13px;">${e.deaths}</span>
                    </div>
                `).join('')}
            </div>
            <button onclick="mpLeaveMatchResults()" style="margin-top:24px;padding:12px 40px;font-size:13px;letter-spacing:3px;
                color:#00ffff;border:1px solid rgba(0,255,255,0.4);background:rgba(0,255,255,0.06);cursor:pointer;
                font-family:'Courier New',monospace;">CONTINUE</button>
        </div>
    `;
}

function mpLeaveMatchResults() {
    const el = document.getElementById('mp-results-overlay');
    if (el) el.style.display = 'none';
    if (typeof _cleanupGame === 'function') _cleanupGame();
    mpCleanupMatch();
    _mpSocket?.emit('return-to-lobby');
    mpDisconnect();
    mpShowPvpHangar();
}

// ================================================================
// PVP DEATHMATCH HUD — kills / deaths / score to win
// ================================================================

function mpShowPvpHud() {
    let el = document.getElementById('mp-pvp-hud');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mp-pvp-hud';
        el.style.cssText = `position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:9999;
            pointer-events:none;font-family:'Courier New',monospace;`;
        el.innerHTML = `
            <div style="display:flex;gap:28px;align-items:center;padding:12px 24px;background:rgba(12,16,20,0.85);
                border:1px solid rgba(0,255,255,0.3);border-radius:12px;
                box-shadow:0 0 10px rgba(0,255,255,0.2),inset 0 0 10px rgba(0,255,255,0.1);">
                <div style="text-align:center;">
                    <div style="font-size:9px;letter-spacing:3px;color:rgba(0,255,255,0.5);text-transform:uppercase;">Kills</div>
                    <div id="pvp-hud-kills" style="font-size:22px;letter-spacing:4px;color:#00ff88;text-shadow:0 0 10px rgba(0,255,136,0.5);">0</div>
                </div>
                <div style="width:1px;height:36px;background:rgba(0,255,255,0.2);"></div>
                <div style="text-align:center;">
                    <div style="font-size:9px;letter-spacing:3px;color:rgba(0,255,255,0.5);text-transform:uppercase;">Deaths</div>
                    <div id="pvp-hud-deaths" style="font-size:22px;letter-spacing:4px;color:#ff4400;text-shadow:0 0 10px rgba(255,68,0,0.5);">0</div>
                </div>
                <div style="width:1px;height:36px;background:rgba(0,255,255,0.2);"></div>
                <div style="text-align:center;">
                    <div style="font-size:9px;letter-spacing:3px;color:rgba(0,255,255,0.5);text-transform:uppercase;">First to</div>
                    <div id="pvp-hud-target" style="font-size:22px;letter-spacing:4px;color:#ffcc00;text-shadow:0 0 10px rgba(255,204,0,0.5);">25</div>
                </div>
                <div style="width:1px;height:36px;background:rgba(0,255,255,0.2);"></div>
                <div style="text-align:center;">
                    <div style="font-size:9px;letter-spacing:3px;color:rgba(0,255,255,0.5);text-transform:uppercase;">Leader</div>
                    <div id="pvp-hud-leader" style="font-size:14px;letter-spacing:2px;color:#ffcc00;text-shadow:0 0 10px rgba(255,204,0,0.5);">—</div>
                </div>
            </div>`;
        document.body.appendChild(el);
    }
    el.style.display = 'block';
    mpUpdatePvpHud();
}

function mpHidePvpHud() {
    const el = document.getElementById('mp-pvp-hud');
    if (el) el.style.display = 'none';
}

function mpUpdatePvpHud() {
    const kills = document.getElementById('pvp-hud-kills');
    const deaths = document.getElementById('pvp-hud-deaths');
    const target = document.getElementById('pvp-hud-target');
    const leader = document.getElementById('pvp-hud-leader');
    if (kills) kills.innerText = _mpKills;
    if (deaths) deaths.innerText = _mpDeaths;
    if (target) target.innerText = _mpKillsToWin;
    if (leader) {
        // Find leader from scoreboard
        let topName = '—', topKills = 0;
        for (const [id, s] of Object.entries(_mpScoreboard)) {
            if (s.kills > topKills) {
                topKills = s.kills;
                const p = _mpLobbyPlayers.find(pl => pl.id === id);
                topName = (id === _mpLocalId ? 'YOU' : p?.name || '???') + ' (' + s.kills + ')';
            }
        }
        leader.innerText = topName;
    }
}

// ================================================================
// IN-GAME CHAT — press T to type, messages shown in corner
// ================================================================

function mpShowInGameChat() {
    let el = document.getElementById('mp-ingame-chat');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mp-ingame-chat';
        el.style.cssText = `position:fixed;bottom:24px;left:24px;z-index:9998;
            font-family:'Courier New',monospace;width:320px;pointer-events:none;`;
        el.innerHTML = `
            <div id="mp-chat-messages" style="max-height:160px;overflow-y:auto;margin-bottom:6px;
                padding:6px;pointer-events:none;"></div>
            <div id="mp-chat-input-wrap" style="display:none;pointer-events:auto;">
                <div style="display:flex;gap:4px;">
                    <input id="mp-ingame-chat-input" type="text" maxlength="200" placeholder="Type message..."
                        style="flex:1;padding:6px 10px;background:rgba(0,0,0,0.7);border:1px solid rgba(0,255,255,0.3);
                        color:#c8d2d9;font-family:'Courier New',monospace;font-size:11px;border-radius:3px;outline:none;"
                        onkeydown="mpInGameChatKey(event)">
                    <button onclick="mpSendInGameChat()" style="padding:6px 10px;font-size:10px;cursor:pointer;
                        color:#00ffcc;border:1px solid rgba(0,255,204,0.3);background:rgba(0,255,204,0.06);
                        font-family:'Courier New',monospace;border-radius:3px;pointer-events:auto;">SEND</button>
                </div>
            </div>
            <div id="mp-chat-hint" style="font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:1px;margin-top:4px;">
                PRESS T TO CHAT</div>
        `;
        document.body.appendChild(el);
    }
    el.style.display = 'block';
    _mpChatOpen = false;
}

function mpHideInGameChat() {
    _mpChatOpen = false;
    const el = document.getElementById('mp-ingame-chat');
    if (el) el.style.display = 'none';
}

function mpToggleInGameChat() {
    const wrap = document.getElementById('mp-chat-input-wrap');
    const input = document.getElementById('mp-ingame-chat-input');
    const hint = document.getElementById('mp-chat-hint');
    if (!wrap || !input) return;

    _mpChatOpen = !_mpChatOpen;
    if (_mpChatOpen) {
        wrap.style.display = 'block';
        if (hint) hint.style.display = 'none';
        input.focus();
        // Temporarily disable game input while typing
        const scene = game?.scene?.scenes[0];
        if (scene?.input?.keyboard) {
            scene.input.keyboard.enabled = false;
        }
    } else {
        wrap.style.display = 'none';
        if (hint) hint.style.display = 'block';
        input.value = '';
        input.blur();
        const scene = game?.scene?.scenes[0];
        if (scene?.input?.keyboard) {
            scene.input.keyboard.enabled = true;
        }
    }
}

function mpInGameChatKey(e) {
    if (e.key === 'Enter') {
        mpSendInGameChat();
    } else if (e.key === 'Escape') {
        mpToggleInGameChat();
    }
    e.stopPropagation();
}

function mpSendInGameChat() {
    const input = document.getElementById('mp-ingame-chat-input');
    if (!input || !_mpSocket) return;
    const msg = input.value.trim();
    if (msg) {
        _mpSocket.emit('chat', msg);
        mpAddInGameChatMessage(`${_playerCallsign || 'YOU'}: ${msg}`, '#00ffcc');
    }
    input.value = '';
    mpToggleInGameChat();
}

function mpAddInGameChatMessage(text, color) {
    const box = document.getElementById('mp-chat-messages');
    if (!box) return;
    const line = document.createElement('div');
    line.style.cssText = `color:${color || '#aaa'};font-size:11px;margin-bottom:3px;
        background:rgba(0,0,0,0.5);padding:3px 6px;border-radius:2px;
        opacity:1;transition:opacity 2s;`;
    line.textContent = text;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
    // Fade out after 8 seconds
    setTimeout(() => { line.style.opacity = '0.2'; }, 8000);
    // Remove after 15 seconds
    setTimeout(() => { if (line.parentNode) line.remove(); }, 15000);
}

// Hook into existing chat handler — update to use in-game chat during match
(function() {
    // Will be called from mpShowChat during match
})();

// ================================================================
// RESPAWN SYSTEM — countdown overlay + player recreation
// ================================================================

function mpShowRespawnCountdown(delayMs, onComplete) {
    let el = document.getElementById('mp-respawn-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mp-respawn-overlay';
        el.style.cssText = `position:fixed;inset:0;z-index:15000;display:flex;justify-content:center;align-items:center;
            background:rgba(0,0,0,0.6);font-family:'Courier New',monospace;pointer-events:none;`;
        document.body.appendChild(el);
    }
    el.style.display = 'flex';

    let remaining = Math.ceil(delayMs / 1000);
    el.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:24px;letter-spacing:6px;color:#ff4444;text-shadow:0 0 20px rgba(255,68,68,0.7);margin-bottom:12px;">
                DESTROYED</div>
            <div style="font-size:48px;color:#ffcc00;text-shadow:0 0 30px rgba(255,204,0,0.7);" id="mp-respawn-timer">${remaining}</div>
            <div style="font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.4);margin-top:8px;">RESPAWNING...</div>
        </div>
    `;

    const interval = setInterval(() => {
        remaining--;
        const timer = document.getElementById('mp-respawn-timer');
        if (timer) timer.innerText = remaining;
        if (remaining <= 0) {
            clearInterval(interval);
            el.style.display = 'none';
            if (onComplete) onComplete();
        }
    }, 1000);
}

function mpRespawnPlayer() {
    if (!_mpMatchActive) return;
    const scene = game?.scene?.scenes[0];
    if (!scene) return;

    const s = CHASSIS[loadout.chassis];
    const spawnX = _mpMySpawn?.x || _mpMapSize / 2;
    const spawnY = _mpMySpawn?.y || _mpMapSize / 2;

    // Reset player position and HP
    if (player?.active) {
        player.setPosition(spawnX, spawnY);
        player.setAlpha(1);
        player.body.setVelocity(0, 0);
    }
    if (torso?.active) {
        torso.setPosition(spawnX, spawnY);
        torso.setAlpha(1);
    }

    // Restore full HP
    if (player?.comp) {
        player.comp.core.hp = player.comp.core.max;
        player.comp.lArm.hp = player.comp.lArm.max;
        player.comp.rArm.hp = player.comp.rArm.max;
        player.comp.legs.hp = player.comp.legs.max;
    }
    const shldSys = (typeof SHIELD_SYSTEMS !== 'undefined' ? SHIELD_SYSTEMS[loadout.shld] : null) || { maxShield: 0 };
    if (player) {
        player.shield = player.maxShield || 0;
        player.hp = player.maxHp || 100;
    }

    // Reset destroyed weapon states
    _lArmDestroyed = false; _rArmDestroyed = false; _legsDestroyed = false;
    if (typeof _resetHUDState === 'function') _resetHUDState();

    // Restore weapons
    loadout.L = _savedL; loadout.R = _savedR;
    loadout.mod = _savedMod; loadout.aug = _savedAug; loadout.leg = _savedLeg;

    // Re-enable
    _mpAlive = true;
    isDeployed = true;
    player.isProcessingDamage = false;

    // Camera
    scene.cameras.main.centerOn(spawnX, spawnY);

    // Brief invulnerability flash
    if (player?.active) {
        scene.tweens.add({
            targets: [player, torso],
            alpha: { from: 0.3, to: 1 },
            duration: 200,
            repeat: 5,
            yoyo: true
        });
    }

    // Nudge out of cover
    try { mpNudgeOutOfCover(scene); } catch(e) {}
}

// ================================================================
// PVP MAP GENERATION — zone-based 6000×6000 map
// Five distinct districts: Dense Urban, Industrial, Ruins, Fortress,
// and Center Arena, connected by corridors of varying width.
// ================================================================

function generatePvpCover(scene, mapSize) {
    if (!coverObjects) return;
    // Destroy orphaned building graphics from previous round
    if (typeof _buildingGraphics !== 'undefined') {
        _buildingGraphics.forEach(g => { try { if (g?.active) g.destroy(); } catch(e){} });
        _buildingGraphics = [];
    }
    coverObjects.clear(true, true);

    const M = mapSize || 6000;
    const center = M / 2;
    const placed = [];

    const placeAt = (def, x, y) => {
        if (x < 80 || y < 80 || x > M - 80 || y > M - 80) return;
        placed.push({ x, y, w: def.w, h: def.h });
        if (def.type === 'building') {
            placeBuilding(scene, x, y, def);
        } else {
            const rect = scene.add.rectangle(x - def.w/2, y - def.h/2, def.w, def.h, def.color)
                .setOrigin(0, 0).setStrokeStyle(2, def.stroke).setDepth(3);
            coverObjects.add(rect, true);
            rect.body.setSize(def.w, def.h);
            rect.body.reset(x - def.w/2, y - def.h/2);
            rect.body.immovable = true;
            rect.coverType = def.type; rect.coverHp = def.hp;
            rect.coverMaxHp = def.hp; rect.coverDef = def;
            rect.coverCX = x; rect.coverCY = y;
        }
    };

    const tooClose = (x, y, minDist) => placed.some(p =>
        Math.abs(p.x - x) < (minDist + (p.w || 0) / 2) && Math.abs(p.y - y) < (minDist + (p.h || 0) / 2));

    // Seeded pseudo-random for deterministic maps
    let _seed = 77;
    const R = () => { _seed = (_seed * 16807 + 0) % 2147483647; return (_seed & 0x7fffffff) / 0x7fffffff; };

    // Shorthand for COVER_DEFS indices
    const ROCK_L = 2, ROCK_M = 0, ROCK_S = 1;
    const WALL_H = 3, WALL_V = 4, WALL_S = 5;
    const CRATE = 6, CRATE_S = 7;
    const BLD_S = 8, BLD_M = 9, BLD_L = 10, BLD_R = 11;

    // ── Street / corridor markings ────────────────────────────────
    const streetGfx = scene.add.graphics().setDepth(2);
    if (typeof _buildingGraphics !== 'undefined') _buildingGraphics.push(streetGfx);

    const drawStreetH = (y, x1, x2) => {
        streetGfx.lineStyle(1, 0x334433, 0.25);
        for (let dx = x1; dx < x2; dx += 40) {
            streetGfx.beginPath(); streetGfx.moveTo(dx, y); streetGfx.lineTo(dx + 20, y); streetGfx.strokePath();
        }
    };
    const drawStreetV = (x, y1, y2) => {
        streetGfx.lineStyle(1, 0x334433, 0.25);
        for (let dy = y1; dy < y2; dy += 40) {
            streetGfx.beginPath(); streetGfx.moveTo(x, dy); streetGfx.lineTo(x, dy + 20); streetGfx.strokePath();
        }
    };

    // ──────────────────────────────────────────────────────────────
    // ZONE 1: CENTER ARENA (2400-3600, 2400-3600)
    // Open contested area — scattered crates, low walls, good sightlines
    // ──────────────────────────────────────────────────────────────
    // Ring of barricades around center
    for (let a = 0; a < 8; a++) {
        const angle = (a / 8) * Math.PI * 2 + 0.2;
        const dist = 350 + R() * 100;
        const bx = Math.round(center + Math.cos(angle) * dist);
        const by = Math.round(center + Math.sin(angle) * dist);
        placeAt(COVER_DEFS[a % 2 === 0 ? WALL_H : WALL_V], bx, by);
    }
    // Scattered crates in center
    for (let i = 0; i < 6; i++) {
        const angle = R() * Math.PI * 2;
        const dist = 100 + R() * 200;
        const cx = Math.round(center + Math.cos(angle) * dist);
        const cy = Math.round(center + Math.sin(angle) * dist);
        if (!tooClose(cx, cy, 80)) placeAt(COVER_DEFS[CRATE], cx, cy);
    }
    // Outer ring — rocks and ruins at ~550-700px from center
    for (let a = 0; a < 6; a++) {
        const angle = (a / 6) * Math.PI * 2 + R() * 0.3;
        const dist = 550 + R() * 150;
        const ox = Math.round(center + Math.cos(angle) * dist);
        const oy = Math.round(center + Math.sin(angle) * dist);
        if (!tooClose(ox, oy, 100)) placeAt(COVER_DEFS[a % 3 === 0 ? ROCK_L : BLD_R], ox, oy);
    }

    // ──────────────────────────────────────────────────────────────
    // ZONE 2: NW DENSE URBAN (200-2300, 200-2300)
    // Tight corridors, many small/medium buildings packed close.
    // Creates alleyway combat with lots of corner-peeking.
    // ──────────────────────────────────────────────────────────────
    const nwOx = 250, nwOy = 250, nwW = 2050, nwH = 2050;

    // Main boulevard through the district (diagonal feel via offset rows)
    drawStreetH(nwOy + 500, nwOx, nwOx + nwW);
    drawStreetH(nwOy + 1100, nwOx, nwOx + nwW);
    drawStreetH(nwOy + 1700, nwOx, nwOx + nwW);
    drawStreetV(nwOx + 600, nwOy, nwOy + nwH);
    drawStreetV(nwOx + 1300, nwOy, nwOy + nwH);

    // Dense cluster 1: tight block (top-left)
    placeAt(COVER_DEFS[BLD_S], 450,  400);
    placeAt(COVER_DEFS[BLD_S], 700,  380);
    placeAt(COVER_DEFS[BLD_M], 580,  600);
    placeAt(COVER_DEFS[BLD_S], 380,  650);
    placeAt(COVER_DEFS[WALL_H], 550, 520);
    placeAt(COVER_DEFS[CRATE], 480,  480);

    // Dense cluster 2: L-shaped arrangement
    placeAt(COVER_DEFS[BLD_M], 1100, 350);
    placeAt(COVER_DEFS[BLD_S], 1300, 350);
    placeAt(COVER_DEFS[BLD_S], 1100, 550);
    placeAt(COVER_DEFS[WALL_V], 1250, 480);
    placeAt(COVER_DEFS[CRATE_S], 1200, 430);

    // Dense cluster 3: courtyard with buildings on 3 sides
    placeAt(COVER_DEFS[BLD_M], 400,  850);
    placeAt(COVER_DEFS[BLD_S], 620,  780);
    placeAt(COVER_DEFS[BLD_S], 620,  960);
    placeAt(COVER_DEFS[WALL_H], 500, 900);
    placeAt(COVER_DEFS[CRATE], 530,  870);

    // Dense cluster 4: narrow alley between parallel buildings
    placeAt(COVER_DEFS[BLD_M], 1050, 820);
    placeAt(COVER_DEFS[BLD_M], 1050, 1020);
    placeAt(COVER_DEFS[WALL_S], 1180, 920);
    placeAt(COVER_DEFS[CRATE], 1100, 920);

    // Dense cluster 5: T-junction
    placeAt(COVER_DEFS[BLD_L], 480,  1350);
    placeAt(COVER_DEFS[BLD_S], 750,  1280);
    placeAt(COVER_DEFS[BLD_S], 750,  1450);
    placeAt(COVER_DEFS[WALL_V], 680, 1380);
    placeAt(COVER_DEFS[ROCK_M], 600, 1500);

    // Dense cluster 6: deep corner compound
    placeAt(COVER_DEFS[BLD_M], 1200, 1350);
    placeAt(COVER_DEFS[BLD_S], 1400, 1300);
    placeAt(COVER_DEFS[BLD_S], 1400, 1480);
    placeAt(COVER_DEFS[BLD_S], 1200, 1550);
    placeAt(COVER_DEFS[WALL_H], 1300, 1420);

    // Cluster 7: south edge of NW district
    placeAt(COVER_DEFS[BLD_S], 400,  1850);
    placeAt(COVER_DEFS[BLD_M], 620,  1900);
    placeAt(COVER_DEFS[BLD_S], 850,  1830);
    placeAt(COVER_DEFS[WALL_H], 700, 1780);

    // Cluster 8: SE corner of NW zone
    placeAt(COVER_DEFS[BLD_S], 1600, 1700);
    placeAt(COVER_DEFS[BLD_S], 1800, 1650);
    placeAt(COVER_DEFS[BLD_M], 1700, 1880);
    placeAt(COVER_DEFS[ROCK_S], 1550, 1800);
    placeAt(COVER_DEFS[CRATE], 1680, 1760);

    // Alley clutter — scattered crates and rocks in gaps
    const nwClutter = [[340,530],[720,470],[950,650],[1350,700],[500,1150],[900,1100],
                        [1100,1200],[350,1680],[1000,1650],[1500,1500],[1900,1400]];
    nwClutter.forEach(([cx,cy]) => {
        if (!tooClose(cx, cy, 90)) placeAt(COVER_DEFS[R() < 0.5 ? CRATE : ROCK_S], cx, cy);
    });

    // ──────────────────────────────────────────────────────────────
    // ZONE 3: NE INDUSTRIAL (3700-5800, 200-2300)
    // Large warehouses with wide open spaces between them.
    // Long sightlines, few but big cover objects.
    // ──────────────────────────────────────────────────────────────
    drawStreetH(1200, 3700, 5800);
    drawStreetV(4700, 200, 2300);

    // Warehouse row 1 (top)
    placeAt(COVER_DEFS[BLD_L], 4100, 500);
    placeAt(COVER_DEFS[BLD_L], 4700, 450);
    placeAt(COVER_DEFS[BLD_M], 5350, 520);

    // Open yard between rows — just a few crates
    placeAt(COVER_DEFS[CRATE], 4300, 800);
    placeAt(COVER_DEFS[CRATE], 4900, 850);
    placeAt(COVER_DEFS[WALL_H], 4600, 780);

    // Warehouse row 2 (middle)
    placeAt(COVER_DEFS[BLD_L], 3950, 1450);
    placeAt(COVER_DEFS[BLD_M], 4400, 1500);
    placeAt(COVER_DEFS[BLD_L], 5100, 1400);
    placeAt(COVER_DEFS[BLD_M], 5550, 1500);

    // Loading docks — walls and crates
    placeAt(COVER_DEFS[WALL_H], 4200, 1150);
    placeAt(COVER_DEFS[WALL_H], 5300, 1100);
    placeAt(COVER_DEFS[CRATE], 4450, 1100);
    placeAt(COVER_DEFS[CRATE_S], 5200, 1150);

    // Warehouse row 3 (bottom of NE zone)
    placeAt(COVER_DEFS[BLD_L], 4200, 2050);
    placeAt(COVER_DEFS[BLD_M], 4850, 2000);
    placeAt(COVER_DEFS[BLD_L], 5450, 2080);

    // Scattered industrial debris
    placeAt(COVER_DEFS[ROCK_L], 3900, 900);
    placeAt(COVER_DEFS[ROCK_M], 5500, 800);
    placeAt(COVER_DEFS[CRATE], 4600, 1800);
    placeAt(COVER_DEFS[WALL_V], 5100, 900);
    placeAt(COVER_DEFS[CRATE_S], 3850, 1800);

    // ──────────────────────────────────────────────────────────────
    // ZONE 4: SW RUINS (200-2300, 3700-5800)
    // Destroyed buildings, rubble piles, partial walls.
    // Unpredictable, asymmetric cover — ambush territory.
    // ──────────────────────────────────────────────────────────────
    drawStreetH(4500, 200, 2300);
    drawStreetV(1200, 3700, 5800);

    // Ruined building cluster 1
    placeAt(COVER_DEFS[BLD_R], 500,  3950);
    placeAt(COVER_DEFS[BLD_R], 850,  3900);
    placeAt(COVER_DEFS[ROCK_L], 680, 4100);
    placeAt(COVER_DEFS[WALL_H], 600, 4050);
    placeAt(COVER_DEFS[ROCK_S], 400, 4100);

    // Collapsed overpass — wall segments with gaps
    placeAt(COVER_DEFS[WALL_H], 350,  4400);
    placeAt(COVER_DEFS[WALL_H], 600,  4400);
    // gap here for movement
    placeAt(COVER_DEFS[WALL_H], 950,  4400);
    placeAt(COVER_DEFS[ROCK_M], 800,  4450);

    // Rubble field — scattered rocks
    placeAt(COVER_DEFS[ROCK_L], 1500, 3900);
    placeAt(COVER_DEFS[ROCK_M], 1300, 4050);
    placeAt(COVER_DEFS[ROCK_S], 1650, 4020);
    placeAt(COVER_DEFS[ROCK_M], 1450, 4200);

    // Ruined cluster 2 — partially standing buildings
    placeAt(COVER_DEFS[BLD_R], 400,  4800);
    placeAt(COVER_DEFS[BLD_S], 650,  4750);
    placeAt(COVER_DEFS[BLD_R], 500,  5000);
    placeAt(COVER_DEFS[ROCK_L], 800, 4900);
    placeAt(COVER_DEFS[WALL_V], 720, 4800);

    // Open crater area (south)
    placeAt(COVER_DEFS[ROCK_L], 1100, 4700);
    placeAt(COVER_DEFS[ROCK_M], 1350, 4800);
    placeAt(COVER_DEFS[CRATE], 1200, 4600);

    // Deep ruins cluster
    placeAt(COVER_DEFS[BLD_R], 1600, 4700);
    placeAt(COVER_DEFS[BLD_R], 1850, 4650);
    placeAt(COVER_DEFS[ROCK_L], 1750, 4850);
    placeAt(COVER_DEFS[WALL_H], 1700, 4550);

    // Bottom rubble
    placeAt(COVER_DEFS[BLD_R], 500,  5400);
    placeAt(COVER_DEFS[ROCK_M], 800, 5350);
    placeAt(COVER_DEFS[BLD_R], 1200, 5300);
    placeAt(COVER_DEFS[ROCK_S], 1500, 5450);
    placeAt(COVER_DEFS[BLD_S], 1800, 5350);
    placeAt(COVER_DEFS[ROCK_L], 2050, 5200);

    // Ruin clutter
    const swClutter = [[350,4250],[900,3850],[1100,4350],[600,4600],[1400,4500],
                        [1000,5100],[1600,5100],[700,5550],[1400,5550]];
    swClutter.forEach(([cx,cy]) => {
        if (!tooClose(cx, cy, 90)) placeAt(COVER_DEFS[R() < 0.6 ? ROCK_S : CRATE], cx, cy);
    });

    // ──────────────────────────────────────────────────────────────
    // ZONE 5: SE FORTRESS (3700-5800, 3700-5800)
    // Military compound — organized medium buildings with alleys,
    // plus a fortified inner compound. Mix of tight and open.
    // ──────────────────────────────────────────────────────────────
    drawStreetH(4600, 3700, 5800);
    drawStreetV(4800, 3700, 5800);

    // Outer wall segments (north side of fortress)
    placeAt(COVER_DEFS[WALL_H], 4100, 3850);
    placeAt(COVER_DEFS[WALL_H], 4500, 3850);
    // gate gap
    placeAt(COVER_DEFS[WALL_H], 5000, 3850);
    placeAt(COVER_DEFS[WALL_H], 5400, 3850);

    // Barracks row 1
    placeAt(COVER_DEFS[BLD_M], 4100, 4100);
    placeAt(COVER_DEFS[BLD_M], 4500, 4100);
    placeAt(COVER_DEFS[BLD_S], 4850, 4080);

    // Alley between barracks
    placeAt(COVER_DEFS[CRATE], 4300, 4250);
    placeAt(COVER_DEFS[CRATE_S], 4650, 4230);

    // Barracks row 2
    placeAt(COVER_DEFS[BLD_M], 4100, 4400);
    placeAt(COVER_DEFS[BLD_S], 4450, 4380);
    placeAt(COVER_DEFS[BLD_M], 4750, 4420);

    // Central command building (large)
    placeAt(COVER_DEFS[BLD_L], 5300, 4200);
    placeAt(COVER_DEFS[WALL_V], 5100, 4200);
    placeAt(COVER_DEFS[CRATE], 5150, 4100);
    placeAt(COVER_DEFS[CRATE], 5150, 4300);

    // Motor pool — open area with scattered vehicles (crates)
    placeAt(COVER_DEFS[CRATE], 4200, 4850);
    placeAt(COVER_DEFS[CRATE], 4450, 4900);
    placeAt(COVER_DEFS[CRATE], 4350, 4750);
    placeAt(COVER_DEFS[WALL_H], 4300, 4700);

    // Southern structures
    placeAt(COVER_DEFS[BLD_M], 5100, 4800);
    placeAt(COVER_DEFS[BLD_S], 5400, 4750);
    placeAt(COVER_DEFS[BLD_S], 5400, 4950);
    placeAt(COVER_DEFS[WALL_V], 5250, 4900);

    // Guard towers (small buildings at corners)
    placeAt(COVER_DEFS[BLD_S], 3900, 5200);
    placeAt(COVER_DEFS[BLD_S], 5600, 5200);
    placeAt(COVER_DEFS[BLD_S], 3900, 5500);
    placeAt(COVER_DEFS[BLD_S], 5600, 5500);

    // Inner compound walls
    placeAt(COVER_DEFS[WALL_H], 4200, 5150);
    placeAt(COVER_DEFS[WALL_H], 4700, 5150);
    placeAt(COVER_DEFS[WALL_H], 5200, 5150);
    placeAt(COVER_DEFS[BLD_M], 4500, 5350);
    placeAt(COVER_DEFS[BLD_L], 5100, 5400);

    // Fortress clutter
    placeAt(COVER_DEFS[CRATE_S], 4000, 4500);
    placeAt(COVER_DEFS[ROCK_S], 5500, 4500);
    placeAt(COVER_DEFS[CRATE], 4700, 5300);
    placeAt(COVER_DEFS[ROCK_M], 4100, 5500);
    placeAt(COVER_DEFS[CRATE], 5300, 5550);

    // ──────────────────────────────────────────────────────────────
    // CORRIDORS: connecting zones through the cross-shaped gaps
    // North-South corridor (x ~2300-3700) and East-West (y ~2300-3700)
    // ──────────────────────────────────────────────────────────────

    // N-S corridor: NW→Center (x ≈ 2300-3700, y ≈ 2000-2500)
    drawStreetV(2600, 1800, 2500);
    drawStreetV(3400, 1800, 2500);
    placeAt(COVER_DEFS[BLD_S], 2500, 2100);
    placeAt(COVER_DEFS[ROCK_M], 3500, 2150);
    placeAt(COVER_DEFS[WALL_V], 3000, 2200);
    placeAt(COVER_DEFS[CRATE], 2800, 2050);

    // N-S corridor: Center→SW (x ≈ 2300-3700, y ≈ 3500-4000)
    drawStreetV(2600, 3500, 4200);
    drawStreetV(3400, 3500, 4200);
    placeAt(COVER_DEFS[BLD_R], 2500, 3800);
    placeAt(COVER_DEFS[ROCK_L], 3500, 3750);
    placeAt(COVER_DEFS[WALL_H], 3000, 3700);
    placeAt(COVER_DEFS[CRATE], 3200, 3850);

    // E-W corridor: NW→Center (x ≈ 2000-2500, y ≈ 2300-3700)
    drawStreetH(2600, 1800, 2500);
    drawStreetH(3400, 1800, 2500);
    placeAt(COVER_DEFS[BLD_S], 2100, 2700);
    placeAt(COVER_DEFS[ROCK_M], 2200, 3300);
    placeAt(COVER_DEFS[WALL_H], 2050, 3000);

    // E-W corridor: Center→NE (x ≈ 3500-4000, y ≈ 2300-3700)
    drawStreetH(2600, 3500, 4200);
    drawStreetH(3400, 3500, 4200);
    placeAt(COVER_DEFS[BLD_M], 3800, 2700);
    placeAt(COVER_DEFS[ROCK_M], 3750, 3300);
    placeAt(COVER_DEFS[CRATE], 3900, 3000);
    placeAt(COVER_DEFS[WALL_V], 3650, 2900);

    // E-W corridor: SW→SE (y ≈ 4500-5000 area)
    drawStreetH(4800, 2200, 3800);
    placeAt(COVER_DEFS[BLD_R], 2600, 4800);
    placeAt(COVER_DEFS[ROCK_L], 3200, 4750);
    placeAt(COVER_DEFS[CRATE], 2900, 4850);

    // N-S corridor: NE→SE (x ≈ 4500-5000 area)
    drawStreetV(4500, 2200, 3800);
    placeAt(COVER_DEFS[BLD_S], 4500, 2600);
    placeAt(COVER_DEFS[ROCK_M], 4550, 3200);
    placeAt(COVER_DEFS[CRATE], 4450, 2900);
    placeAt(COVER_DEFS[WALL_H], 4600, 3400);

    // ──────────────────────────────────────────────────────────────
    // TRANSITION ZONES: fill the diagonal spaces with mixed cover
    // to prevent empty dead zones
    // ──────────────────────────────────────────────────────────────

    // NE gap fill (between NW dense and NE industrial, y 200-2300, x 2300-3700)
    placeAt(COVER_DEFS[BLD_M], 2800, 600);
    placeAt(COVER_DEFS[BLD_S], 3200, 500);
    placeAt(COVER_DEFS[ROCK_L], 3000, 900);
    placeAt(COVER_DEFS[BLD_R], 2600, 1200);
    placeAt(COVER_DEFS[BLD_S], 3400, 1100);
    placeAt(COVER_DEFS[WALL_H], 3100, 1400);
    placeAt(COVER_DEFS[CRATE], 2900, 1500);
    placeAt(COVER_DEFS[BLD_S], 3200, 1700);
    placeAt(COVER_DEFS[ROCK_M], 2600, 1800);

    // SW gap fill (between NW dense and SW ruins, x 200-2300, y 2300-3700)
    placeAt(COVER_DEFS[BLD_S], 600,  2800);
    placeAt(COVER_DEFS[BLD_R], 500,  3200);
    placeAt(COVER_DEFS[ROCK_L], 900, 3000);
    placeAt(COVER_DEFS[BLD_M], 1200, 2600);
    placeAt(COVER_DEFS[WALL_V], 1100, 3400);
    placeAt(COVER_DEFS[CRATE], 1500, 2900);
    placeAt(COVER_DEFS[BLD_S], 1700, 3200);
    placeAt(COVER_DEFS[ROCK_M], 1800, 2600);

    // SE gap fill (between NE industrial and SE fortress, x 3700-5800, y 2300-3700)
    placeAt(COVER_DEFS[BLD_M], 4200, 2800);
    placeAt(COVER_DEFS[BLD_S], 4800, 3000);
    placeAt(COVER_DEFS[BLD_R], 5200, 2700);
    placeAt(COVER_DEFS[ROCK_L], 5500, 3100);
    placeAt(COVER_DEFS[WALL_H], 4500, 3200);
    placeAt(COVER_DEFS[CRATE], 5000, 3400);
    placeAt(COVER_DEFS[BLD_S], 4300, 3500);
    placeAt(COVER_DEFS[ROCK_M], 5400, 3500);

    // Bottom-left gap fill (between SW ruins and SE fortress, x 2300-3700, y 3700-5800)
    placeAt(COVER_DEFS[BLD_R], 2800, 4200);
    placeAt(COVER_DEFS[BLD_S], 3200, 4400);
    placeAt(COVER_DEFS[ROCK_L], 3000, 4600);
    placeAt(COVER_DEFS[BLD_M], 2600, 5000);
    placeAt(COVER_DEFS[BLD_R], 3400, 4900);
    placeAt(COVER_DEFS[WALL_V], 3100, 5200);
    placeAt(COVER_DEFS[CRATE], 2800, 5400);
    placeAt(COVER_DEFS[BLD_S], 3300, 5500);

    // ──────────────────────────────────────────────────────────────
    // RANDOM SCATTER: fill remaining gaps with light cover
    // ──────────────────────────────────────────────────────────────
    for (let i = 0; i < 30; i++) {
        const rx = 200 + R() * (M - 400);
        const ry = 200 + R() * (M - 400);
        // Skip center arena
        if (Math.hypot(rx - center, ry - center) < 500) continue;
        if (tooClose(rx, ry, 140)) continue;
        const defIdx = R() < 0.3 ? ROCK_S : R() < 0.6 ? CRATE : ROCK_M;
        placeAt(COVER_DEFS[defIdx], Math.round(rx), Math.round(ry));
    }

    // Force-sync static bodies
    coverObjects.getChildren().forEach(c => {
        if (c.body) {
            const w = c.width || 60, h = c.height || 60;
            c.body.setSize(w, h);
            c.body.reset(c.x, c.y);
            c.body.immovable = true;
            if (c.coverCX === undefined) { c.coverCX = c.x + w / 2; c.coverCY = c.y + h / 2; }
        }
    });
    coverObjects.refresh();
    try { scene.time.delayedCall(120, () => { try { coverObjects?.refresh(); } catch(e){} }); } catch(e) {}
}

// ================================================================
// SPAWN SAFETY: nudge player out of cover objects after generation
// ================================================================

function mpNudgeOutOfCover(scene) {
    if (!player?.active || !coverObjects) return;
    const px = player.x, py = player.y;
    const hitR = loadout.chassis === 'light' ? 16 : loadout.chassis === 'medium' ? 22 : 30;

    // Check overlap with each cover object
    const covers = coverObjects.getChildren();
    for (const c of covers) {
        if (!c?.active || !c.body) continue;
        const cx = c.coverCX || (c.x + (c.width || 0) / 2);
        const cy = c.coverCY || (c.y + (c.height || 0) / 2);
        const cw = (c.width || 60) / 2 + hitR + 10;
        const ch = (c.height || 60) / 2 + hitR + 10;

        // AABB overlap check
        if (Math.abs(px - cx) < cw && Math.abs(py - cy) < ch) {
            // Push player to nearest edge
            const dx = px - cx;
            const dy = py - cy;
            const pushX = dx >= 0 ? cx + cw + 5 : cx - cw - 5;
            const pushY = dy >= 0 ? cy + ch + 5 : cy - ch - 5;

            // Push along shortest axis
            if (Math.abs(dx) / cw > Math.abs(dy) / ch) {
                player.x = pushX;
                if (torso?.active) torso.x = pushX;
            } else {
                player.y = pushY;
                if (torso?.active) torso.y = pushY;
            }
            break; // Re-check could be needed but one nudge is usually enough
        }
    }
}

// ================================================================
// PVP MECH HANGAR — full loadout selection using the same style as simulation hangar
// ================================================================

let _pvpHangarOpen = false;
let _pvpHangarInMatch = false; // true = opened mid-match via ESC menu
let _pvpOpenDD = null;         // currently open dropdown slot key

function mpShowPvpHangar(inMatch) {
    _pvpHangarOpen = true;
    _pvpHangarInMatch = !!inMatch;
    _pvpOpenDD = null;
    let el = document.getElementById('pvp-hangar');
    if (!el) {
        el = document.createElement('div');
        el.id = 'pvp-hangar';
        el.style.cssText = `
            position:fixed;inset:0;z-index:2000;
            display:flex;justify-content:center;align-items:center;
            background:#0c1014;
            font-family:'Courier New',monospace;color:#c8d2d9;
            overflow-y:auto;
        `;
        document.body.appendChild(el);
        // Close dropdowns when clicking outside
        el.addEventListener('click', (e) => {
            if (!e.target.closest('.pvp-dd-wrap')) _pvpCloseAllDD();
        });
    }
    el.style.display = 'flex';
    _pvpRenderHangar();
}

function mpHidePvpHangar() {
    _pvpHangarOpen = false;
    _pvpHangarInMatch = false;
    const el = document.getElementById('pvp-hangar');
    if (el) el.style.display = 'none';
}

function _pvpCloseAllDD() {
    document.querySelectorAll('.pvp-dd-selected').forEach(el => el.classList.remove('dd-open'));
    document.querySelectorAll('.pvp-dd-list').forEach(el => el.classList.remove('dd-list-open'));
    _pvpOpenDD = null;
}

function _pvpToggleDD(slotId) {
    if (_pvpOpenDD === slotId) { _pvpCloseAllDD(); return; }
    _pvpCloseAllDD();
    _pvpOpenDD = slotId;
    _pvpBuildDropdown(slotId);
    document.getElementById('pvp-dds-' + slotId)?.classList.add('dd-open');
    document.getElementById('pvp-ddl-' + slotId)?.classList.add('dd-list-open');
}

function _pvpGetSlotLabel(slotId) {
    const key = slotId === 'L' ? loadout.L : slotId === 'R' ? loadout.R
              : slotId === 'M' ? loadout.mod : slotId === 'S' ? loadout.shld
              : slotId === 'G' ? loadout.leg : loadout.aug;
    if (!key || key === 'none') return 'NONE';
    const desc = typeof SLOT_DESCS !== 'undefined' ? SLOT_DESCS[key] : null;
    if (desc) return desc.title;
    const dict = (slotId === 'L' || slotId === 'R' || slotId === 'M') ? WEAPONS
               : slotId === 'S' ? SHIELD_SYSTEMS : slotId === 'G' ? LEG_SYSTEMS : AUGMENTS;
    return dict[key]?.name || key.toUpperCase();
}

function _pvpBuildDropdown(slotId) {
    const list = document.getElementById('pvp-ddl-' + slotId);
    if (!list) return;
    list.innerHTML = '';
    const chassis = loadout.chassis;

    // Get options and restriction set for this slot
    let options, restrictSet;
    if (slotId === 'L' || slotId === 'R') {
        options = typeof WEAPON_OPTIONS !== 'undefined' ? WEAPON_OPTIONS : [];
        restrictSet = typeof CHASSIS_WEAPONS !== 'undefined' ? CHASSIS_WEAPONS[chassis] : null;
    } else if (slotId === 'M') {
        options = typeof MOD_OPTIONS !== 'undefined' ? MOD_OPTIONS : [];
        restrictSet = typeof CHASSIS_MODS !== 'undefined' ? CHASSIS_MODS[chassis] : null;
    } else if (slotId === 'S') {
        options = typeof SHIELD_OPTIONS !== 'undefined' ? SHIELD_OPTIONS : [];
        restrictSet = typeof CHASSIS_SHIELDS !== 'undefined' ? CHASSIS_SHIELDS[chassis] : null;
    } else if (slotId === 'G') {
        options = typeof LEG_OPTIONS !== 'undefined' ? LEG_OPTIONS : [];
        restrictSet = typeof CHASSIS_LEGS !== 'undefined' ? CHASSIS_LEGS[chassis] : null;
    } else {
        options = typeof AUG_OPTIONS !== 'undefined' ? AUG_OPTIONS : [];
        restrictSet = typeof CHASSIS_AUGS !== 'undefined' ? CHASSIS_AUGS[chassis] : null;
    }

    const currentKey = slotId === 'L' ? loadout.L : slotId === 'R' ? loadout.R
                     : slotId === 'M' ? loadout.mod : slotId === 'S' ? loadout.shld
                     : slotId === 'G' ? loadout.leg : loadout.aug;

    const is2H = WEAPONS[loadout.L]?.twoHanded;

    options.forEach(opt => {
        // Chassis restriction
        if (restrictSet && !restrictSet.has(opt.key)) return;
        // Light can't use two-handed
        if (chassis === 'light' && opt.twoHanded) return;
        // If 2H equipped, R arm is locked
        if (is2H && slotId === 'R' && opt.key !== loadout.L && opt.key !== 'none') return;

        // Check dual-wield / already in use
        const otherArm = slotId === 'L' ? loadout.R : slotId === 'R' ? loadout.L : null;
        const isDual = chassis === 'light' && (slotId === 'L' || slotId === 'R') && opt.key !== 'none' && opt.key === otherArm;
        const isBlocked = chassis !== 'light' && (slotId === 'L' || slotId === 'R') && opt.key !== 'none' && opt.key === otherArm;

        const desc = typeof SLOT_DESCS !== 'undefined' ? SLOT_DESCS[opt.key] : null;
        const descText = (desc && opt.key !== 'none') ? desc.desc : '';
        const titleText = desc ? desc.title : opt.label;

        const div = document.createElement('div');
        div.className = 'dd-option'
            + (opt.key === currentKey ? ' dd-active' : '')
            + (isBlocked ? ' do-disabled' : '');
        div.innerHTML = `
            <div class="do-header">
                <span class="do-name">${titleText}${isDual ? ' <span style="font-size:9px;letter-spacing:1px;color:#00ffcc;background:rgba(0,255,204,0.12);padding:1px 5px;border:1px solid rgba(0,255,204,0.3);border-radius:2px;vertical-align:middle;">DUAL</span>' : ''}${isBlocked ? ' <span style="font-size:9px;letter-spacing:1px;color:rgba(255,100,100,0.7);background:rgba(255,60,60,0.08);padding:1px 5px;border:1px solid rgba(255,60,60,0.25);border-radius:2px;vertical-align:middle;">IN USE</span>' : ''}</span>
            </div>
            ${descText ? `<div class="do-desc">${descText}</div>` : ''}`;
        if (!isBlocked) div.onclick = () => { _pvpSelectSlot(slotId, opt.key); _pvpCloseAllDD(); };
        list.appendChild(div);
    });
}

function _pvpBuildColorDD() {
    const list = document.getElementById('pvp-ddl-COL');
    if (!list) return;
    list.innerHTML = '';
    const curHex = loadout.color.toString(16).padStart(6, '0').toLowerCase();
    (typeof COLOR_OPTIONS !== 'undefined' ? COLOR_OPTIONS : []).forEach(opt => {
        const desc = typeof SLOT_DESCS !== 'undefined' ? SLOT_DESCS['col_' + opt.key] : null;
        const div = document.createElement('div');
        div.className = 'dd-option dd-color-opt' + (opt.key === curHex ? ' dd-active' : '');
        div.innerHTML = `
            <div class="do-header">
                <span class="do-color-swatch" style="background:${opt.hex6};box-shadow:0 0 6px ${opt.hex6}55;"></span>
                <span class="do-name">${opt.label}</span>
            </div>
            ${desc ? `<div class="do-desc">${desc.desc}</div>` : ''}`;
        div.onclick = () => { loadout.color = opt.hex; _pvpCloseAllDD(); _pvpRenderHangar(); };
        list.appendChild(div);
    });
}

function _pvpToggleColorDD() {
    if (_pvpOpenDD === 'COL') { _pvpCloseAllDD(); return; }
    _pvpCloseAllDD();
    _pvpOpenDD = 'COL';
    _pvpBuildColorDD();
    document.getElementById('pvp-dds-COL')?.classList.add('dd-open');
    document.getElementById('pvp-ddl-COL')?.classList.add('dd-list-open');
}

function _pvpRenderHangar() {
    const el = document.getElementById('pvp-hangar');
    if (!el) return;

    const chassis = loadout.chassis;
    const hexStr = loadout.color.toString(16).padStart(6, '0');
    const colorOpt = (typeof COLOR_OPTIONS !== 'undefined' ? COLOR_OPTIONS : []).find(o => o.key === hexStr) || { label: 'GREEN', hex6: '#00ff00' };

    const is2H = WEAPONS[loadout.L]?.twoHanded;
    const ch = typeof CHASSIS !== 'undefined' ? CHASSIS[chassis] : {};
    const totalHP = typeof getTotalHP === 'function' ? getTotalHP(chassis) : (ch.coreHP || 0) + (ch.armHP || 0) * 2 + (ch.legHP || 0);
    const shld = typeof SHIELD_SYSTEMS !== 'undefined' ? (SHIELD_SYSTEMS[loadout.shld] || { maxShield: 0 }) : { maxShield: 0 };

    // Weapon fire rate helpers
    const fmtDps = (key) => {
        const w = WEAPONS[key];
        if (!w || !w.reload || !w.dmg) return '';
        const dps = (w.dmg / (w.reload / 1000)).toFixed(1);
        return `<span style="color:rgba(255,255,255,0.3);font-size:9px;margin-left:6px;">${dps} dps</span>`;
    };

    function ddRow(slotId, label) {
        const headerName = _pvpGetSlotLabel(slotId);
        const dpsTag = (slotId === 'L') ? fmtDps(loadout.L) : (slotId === 'R') ? fmtDps(is2H ? loadout.L : loadout.R) : '';
        return `<div class="dd-row">
            <span class="dd-label">${label}</span>
            <div class="pvp-dd-wrap" style="position:relative;flex:1;">
                <div class="dd-selected pvp-dd-selected" id="pvp-dds-${slotId}" onclick="_pvpToggleDD('${slotId}')">
                    <span class="dd-name">${headerName}${dpsTag}</span>
                    <span class="dd-arrow">▼</span>
                </div>
                <div class="dd-list pvp-dd-list" id="pvp-ddl-${slotId}"></div>
            </div>
        </div>`;
    }

    // Button section depends on context (pre-match vs in-match)
    let buttonsHtml;
    if (_pvpHangarInMatch) {
        buttonsHtml = `
            <button id="pvp-deploy-btn" onclick="_pvpDeployFromHangar()" style="width:100%;box-sizing:border-box;font-size:13px;padding:12px;display:flex;justify-content:center;
                background:transparent;border:1px solid rgba(0,255,255,0.35);border-top:2px solid rgba(0,255,255,0.7);border-bottom:2px solid rgba(0,255,255,0.7);
                color:#00ffff;text-transform:uppercase;letter-spacing:4px;font-family:'Courier New',monospace;cursor:pointer;
                box-shadow:0 0 10px rgba(0,255,255,0.06);transition:all 0.3s;">DEPLOY MECH</button>
            <button onclick="_pvpQuitToMenu()" style="width:100%;box-sizing:border-box;font-size:13px;padding:12px;display:flex;justify-content:center;
                background:transparent;border:1px solid rgba(255,80,80,0.35);border-top:2px solid rgba(255,80,80,0.7);border-bottom:2px solid rgba(255,80,80,0.7);
                color:rgba(255,100,100,0.9);text-transform:uppercase;letter-spacing:4px;font-family:'Courier New',monospace;cursor:pointer;
                box-shadow:0 0 10px rgba(255,80,80,0.06);transition:all 0.3s;">QUIT MATCH</button>`;
    } else {
        buttonsHtml = `
            <button onclick="_pvpJoinLobby()" style="width:100%;box-sizing:border-box;font-size:13px;padding:12px;display:flex;justify-content:center;
                background:transparent;border:1px solid rgba(0,255,0,0.35);border-top:2px solid rgba(0,255,0,0.7);border-bottom:2px solid rgba(0,255,0,0.7);
                color:#00ff00;text-transform:uppercase;letter-spacing:4px;font-family:'Courier New',monospace;cursor:pointer;
                box-shadow:0 0 10px rgba(0,255,0,0.06);transition:all 0.3s;">JOIN LOBBY</button>
            <button onclick="_pvpBackToMenu()" style="width:100%;box-sizing:border-box;font-size:13px;padding:12px;display:flex;justify-content:center;
                background:transparent;border:1px solid rgba(255,80,80,0.35);border-top:2px solid rgba(255,80,80,0.7);border-bottom:2px solid rgba(255,80,80,0.7);
                color:rgba(255,100,100,0.9);text-transform:uppercase;letter-spacing:4px;font-family:'Courier New',monospace;cursor:pointer;
                box-shadow:0 0 10px rgba(255,80,80,0.06);transition:all 0.3s;">MAIN MENU</button>`;
    }

    const rArmLabel = is2H ? '■ R.ARM ⬡' : '■ R.ARM';

    // Build details panel (same as simulation)
    const chassisTraits = [];
    if (chassis === 'light') { chassisTraits.push('Dual-fire both arms', '+20% reload speed', 'Fragile arms'); }
    else if (chassis === 'medium') { chassisTraits.push('Mod cooldowns -15%', 'Kills shave 0.5s off cooldown', 'Shield absorbs 60%'); }
    else if (chassis === 'heavy') { chassisTraits.push('Passive 15% DR', 'Cannot equip JUMP or AFTERLEG', 'Built for attrition'); }

    el.innerHTML = `
        <div class="stat-readout" style="max-height:96vh;overflow-y:auto;">
            <h2 style="text-align:center;margin:0 0 20px;letter-spacing:8px;color:#00ffff;font-family:'Courier New',monospace;font-size:26px;
                text-shadow:0 0 18px rgba(0,255,255,0.7),0 0 40px rgba(0,255,255,0.2);font-weight:normal;">MECH HANGAR</h2>
            <div style="text-align:center;margin:-14px 0 16px;font-size:10px;letter-spacing:4px;color:rgba(0,255,255,0.35);font-family:'Courier New',monospace;">
                ${_pvpHangarInMatch ? 'CHANGE LOADOUT' : 'PVP LOADOUT CONFIGURATION'}</div>

            <div style="display:flex;gap:28px;align-items:stretch;">
                <!-- LEFT: BUILD OPTIONS -->
                <div style="flex:1;min-width:0;">
                    <!-- Chassis -->
                    <div class="dd-row">
                        <span class="dd-label">■ CHASSIS</span>
                        <div style="display:flex;gap:6px;flex:1;">
                            <button id="pvp-c-light" onclick="_pvpSetChassis('light')" class="${chassis === 'light' ? 'active' : ''}" style="flex:1;padding:8px 6px;font-size:12px;letter-spacing:2px;font-family:'Courier New',monospace;">LIGHT</button>
                            <button id="pvp-c-medium" onclick="_pvpSetChassis('medium')" class="${chassis === 'medium' ? 'active' : ''}" style="flex:1;padding:8px 6px;font-size:12px;letter-spacing:2px;font-family:'Courier New',monospace;">MEDIUM</button>
                            <button id="pvp-c-heavy" onclick="_pvpSetChassis('heavy')" class="${chassis === 'heavy' ? 'active' : ''}" style="flex:1;padding:8px 6px;font-size:12px;letter-spacing:2px;font-family:'Courier New',monospace;">HEAVY</button>
                        </div>
                    </div>

                    <!-- Colour -->
                    <div class="dd-row">
                        <span class="dd-label">■ COLOUR</span>
                        <div class="pvp-dd-wrap" style="position:relative;flex:1;">
                            <div class="dd-selected pvp-dd-selected" id="pvp-dds-COL" onclick="_pvpToggleColorDD()">
                                <span class="dd-color-swatch-header" style="background:${colorOpt.hex6};box-shadow:0 0 6px ${colorOpt.hex6}55;"></span>
                                <span class="dd-name">${colorOpt.label}</span>
                                <span class="dd-arrow">▼</span>
                            </div>
                            <div class="dd-list pvp-dd-list" id="pvp-ddl-COL"></div>
                        </div>
                    </div>

                    ${ddRow('L', '■ L.ARM')}
                    ${ddRow('R', rArmLabel)}
                    ${ddRow('M', '■ CORE MOD')}
                    ${ddRow('S', '■ SHIELD')}
                    ${ddRow('G', '■ LEGS')}
                    ${ddRow('A', '■ AUGMENT')}

                    <!-- Build Details -->
                    <div style="margin-top:16px;">
                        <div style="font-size:10px;letter-spacing:3px;color:rgba(0,255,255,0.7);font-family:'Courier New',monospace;margin-bottom:6px;text-transform:uppercase;">■ BUILD DETAILS</div>
                        <div>
                            <div class="gs-row"><span class="gs-label">TOTAL HP</span><span class="gs-val" style="color:#00ff88">${totalHP} HP</span></div>
                            <div class="gs-row"><span class="gs-label">HP SPLIT</span><span class="gs-val" style="color:#55cc88">C ${ch.coreHP||0} / A ${ch.armHP||0} / L ${ch.legHP||0}</span></div>
                            <div class="gs-row"><span class="gs-label">SPEED</span><span class="gs-val" style="color:#ffdd88">${ch.spd||210} u/s</span></div>
                            <div class="gs-row"><span class="gs-label">SHIELD</span><span class="gs-val" style="color:#00ffff">${shld.maxShield > 0 ? shld.maxShield + ' HP / ' + Math.round((shld.absorb||0.5)*100) + '% absorb' : 'NONE'}</span></div>
                            <div class="gs-row"><span class="gs-label">CHASSIS</span><span class="gs-val" style="color:${chassis==='light'?'#88ff88':chassis==='medium'?'#ffcc44':'#ff8844'}">${chassisTraits.join(' · ')}</span></div>
                        </div>
                    </div>
                </div><!-- /left -->

                <!-- RIGHT: PREVIEW + BUTTONS -->
                <div style="width:210px;flex-shrink:0;display:flex;flex-direction:column;align-items:stretch;gap:0;">
                    <div style="width:200px;height:140px;border:1px solid rgba(0,255,255,0.4);background:rgba(0,10,20,0.6);
                        box-shadow:0 0 14px rgba(0,255,255,0.12);display:flex;justify-content:center;align-items:center;">
                        <img src="assets/${chassis}-mech.png" style="max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 0 15px #${hexStr});">
                    </div>
                    <div style="width:100%;margin-top:auto;display:flex;flex-direction:column;gap:8px;">
                        ${buttonsHtml}
                    </div>
                </div><!-- /right -->
            </div>
        </div>
    `;
}

function _pvpSelectSlot(slotId, key) {
    if (slotId === 'L' || slotId === 'R') {
        const is2H = WEAPONS[key]?.twoHanded;
        if (loadout.chassis === 'light' && is2H) return;
        if (is2H) {
            loadout.L = key; loadout.R = key;
        } else if (slotId === 'L') {
            if (WEAPONS[loadout.L]?.twoHanded) loadout.R = 'none';
            loadout.L = key;
            if (loadout.chassis !== 'light' && key !== 'none' && loadout.R === key) loadout.R = 'none';
        } else {
            if (WEAPONS[loadout.R]?.twoHanded) loadout.L = 'none';
            loadout.R = key;
            if (loadout.chassis !== 'light' && key !== 'none' && loadout.L === key) loadout.L = 'none';
        }
    } else if (slotId === 'M') {
        loadout.mod = key;
    } else if (slotId === 'S') {
        loadout.shld = key;
    } else if (slotId === 'G') {
        loadout.leg = key;
    } else if (slotId === 'A') {
        loadout.aug = key;
    }
    _pvpRenderHangar();
}

function _pvpSetChassis(ch) {
    loadout.chassis = ch;
    if (!CHASSIS_WEAPONS[ch]?.has(loadout.L)) loadout.L = 'none';
    if (!CHASSIS_WEAPONS[ch]?.has(loadout.R)) loadout.R = 'none';
    if (!CHASSIS_MODS[ch]?.has(loadout.mod)) loadout.mod = 'none';
    if (!CHASSIS_SHIELDS[ch]?.has(loadout.shld)) loadout.shld = 'none';
    if (!CHASSIS_LEGS[ch]?.has(loadout.leg)) loadout.leg = 'none';
    if (!CHASSIS_AUGS[ch]?.has(loadout.aug)) loadout.aug = 'none';
    const starter = typeof STARTER_LOADOUTS !== 'undefined' ? STARTER_LOADOUTS[ch] : null;
    if (starter && loadout.L === 'none') loadout.L = starter.L;
    if (starter && loadout.shld === 'none') loadout.shld = starter.shld;
    _pvpRenderHangar();
}

function _pvpJoinLobby() {
    mpHidePvpHangar();
    mpShowLobby();
    mpConnect();
}

function _pvpBackToMenu() {
    mpHidePvpHangar();
    const menu = document.getElementById('main-menu');
    if (menu) { menu.style.display = ''; menu.style.opacity = '1'; }
}

function _pvpDeployFromHangar() {
    // Close hangar and jump back into the match with new loadout
    mpHidePvpHangar();
    document.getElementById('hud-container').style.display = 'flex';
    const mm = document.getElementById('minimap-wrap'); if (mm) mm.style.display = 'block';
    mpShowPvpHud();
    mpShowInGameChat();

    // Respawn with new loadout
    const scene = game?.scene?.scenes[0];
    if (!scene) return;
    scene.input.setDefaultCursor('none');
    document.body.style.cursor = 'none';

    // Apply new loadout — respawn at current spawn point
    mpRespawnPlayer();
}

function _pvpQuitToMenu() {
    mpHidePvpHangar();
    if (typeof _cleanupGame === 'function') _cleanupGame();
    mpCleanupMatch();
    _mpSocket?.emit('return-to-lobby');
    mpDisconnect();
    // Return to main menu
    const menu = document.getElementById('main-menu');
    if (menu) { menu.style.display = ''; menu.style.opacity = '1'; }
}

// ================================================================
// PVP ESC MENU — accessible during matches
// ================================================================

function mpShowPvpMenu() {
    let el = document.getElementById('mp-pvp-menu');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mp-pvp-menu';
        el.style.cssText = `position:fixed;inset:0;z-index:15000;display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.7);font-family:'Courier New',monospace;`;
        el.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:36px;letter-spacing:12px;color:#00ffff;text-shadow:0 0 30px rgba(0,255,255,0.8),0 0 60px rgba(0,255,255,0.4);
                    animation:pausePulse 1.2s ease-in-out infinite;margin-bottom:40px;">MENU</div>
                <div style="display:flex;flex-direction:column;gap:14px;align-items:center;">
                    <button onclick="mpClosePvpMenu()" class="pause-menu-btn">RESUME</button>
                    <button onclick="mpClosePvpMenu();mpShowPvpHangar(true);" class="pause-menu-btn">MECH HANGAR</button>
                    <button onclick="mpClosePvpMenu();_pvpQuitToMenu();" class="pause-menu-btn"
                        style="border-left-color:#ff4444;color:#ff4444;border-color:rgba(255,68,68,0.3);box-shadow:0 0 10px rgba(255,68,68,0.15);">
                        QUIT MATCH</button>
                </div>
                <div style="margin-top:24px;font-size:11px;letter-spacing:2px;color:rgba(0,255,255,0.35);">PRESS ESC TO CLOSE</div>
            </div>
        `;
        document.body.appendChild(el);
    }
    el.style.display = 'flex';
}

function mpClosePvpMenu() {
    const el = document.getElementById('mp-pvp-menu');
    if (el) el.style.display = 'none';
}

function mpIsPvpMenuOpen() {
    const el = document.getElementById('mp-pvp-menu');
    return el && el.style.display !== 'none';
}

// ================================================================
// MINIMAP: draw remote players as red dots
// ================================================================

function mpDrawMinimapPlayers(ctx, scale, offsetX, offsetY) {
    if (!_mpMatchActive || !player?.active) return;
    _mpPlayers.forEach((rp) => {
        if (!rp.alive || !rp.body?.active) return;
        const mx = rp.body.x * scale + offsetX;
        const my = rp.body.y * scale + offsetY;
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(mx - 2, my - 2, 4, 4);
    });
}
