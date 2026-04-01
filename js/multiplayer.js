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
let _mpChatOpen = false;        // Is in-GAME chat input open?
let _mpRespawning = false;      // Are we in respawn countdown?
let _mpRespawnInvuln = false;   // Brief invulnerability after respawn
let _mpRemoteBodies = null;     // Phaser group for all remote player hitbox sprites
let _mpBulletOverlap = null;    // Collider ref: local bullets vs remote bodies

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
                cpu: loadout.cpu,
                shld: loadout.shld,
                leg: loadout.leg,
                aug: loadout.aug
            }
        });
    });

    _mpSocket.on('disconnect', () => {
        _mpConnected = false;
        console.log('[MP] Disconnected');
        const statusEl = document.getElementById('mp-lobby-status');
        if (statusEl) { statusEl.textContent = 'DISCONNECTED — RECONNECTING...'; statusEl.style.color = 'rgba(255,80,80,0.8)'; }
        mpCleanupMatch();
    });

    _mpSocket.on('connect_error', (err) => {
        _mpConnected = false;
        console.warn('[MP] Connection error:', err?.message);
        const statusEl = document.getElementById('mp-lobby-status');
        if (statusEl) { statusEl.textContent = 'CONNECTION FAILED — CHECK SERVER'; statusEl.style.color = 'rgba(255,80,80,0.9)'; }
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
        const scene = GAME.scene.scenes[0];
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

        // Detect respawn: player was dead but now sending state with restored HP
        if (!rp.alive && data.hp > 0) {
            rp.alive = true;
            // Re-enable physics hitbox
            if (rp.body?.body) rp.body.body.enable = true;
            // Snap all objects to respawn position
            if (rp.body?.active) rp.body.setPosition(data.x, data.y);
            if (rp.torso?.active) {
                rp.torso.setPosition(data.x, data.y);
                rp.torso.setAlpha(1);
                rp.torso.setVisible(true);
                // Force-restore all children in the container
                rp.torso.each(child => {
                    if (child) { child.setAlpha(1); child.setVisible(true); }
                });
            }
            if (rp.nameTag?.active) {
                rp.nameTag.setVisible(true);
                rp.nameTag.setPosition(data.x, data.y - 50);
            }
        }

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
        // Update component HP for paper doll
        if (data.comp) {
            rp.comp = data.comp;
        }
        rp.lastUpdate = Date.now();
    });

    // ── IN-MATCH: REMOTE BULLET FIRED ──────────────────────────

    _mpSocket.on('bullet-fired', (data) => {
        if (!_mpMatchActive) return;
        const scene = GAME.scene.scenes[0];
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
        // Skip if we are the shooter — local bullet overlap already
        // showed impact sparks and damage text, so displaying the server
        // relay too would cause duplicate hit effects.
        if (data.shooterId === _mpLocalId) return;
        const scene = GAME.scene.scenes[0];
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

        // Handle remote player death visuals
        if (data.victimId !== _mpLocalId) {
            const rp = _mpPlayers.get(data.victimId);
            if (data.killerName === 'DISCONNECT') {
                // Disconnected players are fully removed
                mpDestroyRemotePlayer(data.victimId);
            } else if (rp) {
                // Normal kill: hide visuals and disable hitbox until respawn
                rp.alive = false;
                if (rp.nameTag?.active) rp.nameTag.setVisible(false);
                if (rp.body?.body) rp.body.body.enable = false;
                // Death explosion — use torso position (always tracked) with
                // body as fallback, so the explosion appears even if the
                // invisible hitbox sprite has been deactivated
                const scene = GAME?.scene?.scenes[0];
                const dx = rp.torso?.active ? rp.torso.x
                         : rp.body?.active  ? rp.body.x
                         : rp.targetX;
                const dy = rp.torso?.active ? rp.torso.y
                         : rp.body?.active  ? rp.body.y
                         : rp.targetY;
                if (scene && dx !== undefined) {
                    try {
                        createExplosion(scene, dx, dy, 60, 0);
                        scene.cameras.main.shake(250, 0.008);
                        const debrisCol = rp.info?.color || 0xff4444;
                        spawnDebris(scene, dx, dy, debrisCol);
                    } catch(e) {}
                }
                // Hide torso AFTER capturing position for explosion
                if (rp.torso?.active) {
                    rp.torso.setAlpha(0);
                    rp.torso.setVisible(false);
                }
            }
        }

        // Update PVP HUD
        mpUpdatePvpHud();
    });

    // ── CHAT ───────────────────────────────────────────────────

    _mpSocket.on('chat', (data) => {
        if (data.id === _mpLocalId) return; // Already shown locally
        // In-match: show in GAME chat overlay; in lobby: show in lobby chat
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
    // Destroy all remote player visuals and physics before clearing the reference map.
    // _mpPlayers.clear() alone only drops the JS references — without this loop the
    // Phaser scene objects (body, torso, nameTag) would remain as orphaned display
    // children with no path to cleanup.
    _mpPlayers.forEach((rp, id) => { try { mpDestroyRemotePlayer(id); } catch(e) {} });
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

    // Physics body for collision detection with our bullets.
    // MUST use a Sprite (not Rectangle/Zone/Image) because only Sprites have
    // preUpdate() which auto-syncs the physics body position each frame.
    // Without preUpdate, setPosition() moves the visual but the physics body
    // stays at the old coordinates, causing bullets to pass through.
    if (!scene.textures.exists('_mpBlank')) {
        const g = scene.make.graphics({ add: false });
        g.fillStyle(0x000000, 0);
        g.fillRect(0, 0, 4, 4);
        g.generateTexture('_mpBlank', 4, 4);
        g.destroy();
    }
    const body = scene.physics.add.sprite(spawnPos.x, spawnPos.y, '_mpBlank')
        .setVisible(false)
        .setDepth(5);
    const hitR = chassis === 'light' ? 24 : chassis === 'medium' ? 32 : 42;
    body.body.setCircle(hitR);
    body.body.setOffset(2 - hitR, 2 - hitR);
    body.body.setImmovable(true);
    // Tag body with owning player ID so the shared overlap callback can look up the player
    body._mpPlayerId = info.id;

    // Add to shared remote-bodies group (overlap registered once in mpDeployPVP)
    if (!_mpRemoteBodies) {
        _mpRemoteBodies = scene.physics.add.group({ allowGravity: false });
    }
    _mpRemoteBodies.add(body);

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

    const rp = {
        info: info,
        body: body,
        torso: remoteTorso,
        nameTag: nameTag,
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
        // Component HP for paper doll display
        comp: {
            core: { hp: 100, max: 100 },
            lArm: { hp: 100, max: 100 },
            rArm: { hp: 100, max: 100 },
            legs: { hp: 100, max: 100 }
        },
        lastUpdate: Date.now(),
        alive: true
    };
    _mpPlayers.set(info.id, rp);
}

function mpDestroyRemotePlayer(playerId) {
    const rp = _mpPlayers.get(playerId);
    if (!rp) return;
    rp.alive = false;

    // Death explosion visual
    const scene = GAME?.scene?.scenes[0];
    if (scene && rp.body?.active) {
        const dx = rp.body.x, dy = rp.body.y;
        try {
            createExplosion(scene, dx, dy, 60, 0);
            const debrisCol = rp.info?.color || 0xff4444;
            spawnDebris(scene, dx, dy, debrisCol);
        } catch(e) {}
    }

    // Remove from shared remote-bodies group before destroying
    if (_mpRemoteBodies && rp.body?.active) {
        try { _mpRemoteBodies.remove(rp.body); } catch(e) {}
    }
    try { if (rp.body?.active) rp.body.destroy(); } catch(e) {}
    try { if (rp.torso?.active) rp.torso.destroy(); } catch(e) {}
    try { if (rp.nameTag?.active) rp.nameTag.destroy(); } catch(e) {}
}

function mpCleanupMatch() {
    // Remove bullet overlap collider before destroying bodies
    if (_mpBulletOverlap) {
        try {
            const scene = GAME?.scene?.scenes[0];
            if (scene) scene.physics.world.removeCollider(_mpBulletOverlap);
        } catch(e) {}
        _mpBulletOverlap = null;
    }

    // Destroy all remote players
    _mpPlayers.forEach((rp, id) => mpDestroyRemotePlayer(id));
    _mpPlayers.clear();

    // Destroy remote body group
    if (_mpRemoteBodies) {
        try { _mpRemoteBodies.clear(true, true); } catch(e) {}
        _mpRemoteBodies = null;
    }

    // Destroy remote bullets
    if (_mpPvpBullets) {
        try { _mpPvpBullets.clear(true, true); } catch(e) {}
        _mpPvpBullets = null;
    }

    if (_mpStateInterval) { clearInterval(_mpStateInterval); _mpStateInterval = null; }
    _mpMatchActive = false;
    _mpRespawning = false;
    _mpRespawnInvuln = false;
    _mpAlive = true;
    _mpKills = 0;
    _mpDeaths = 0;
    _mpKillFeed = [];
    _mpScoreboard = {};
    _mpMySpawn = null;

    // Hide PVP-specific UI
    mpHidePvpHud();
    mpHideInGameChat();
    const killfeedEl = document.getElementById('mp-killfeed');
    if (killfeedEl) killfeedEl.style.display = 'none';
    const respawnEl = document.getElementById('mp-respawn-overlay');
    if (respawnEl) respawnEl.style.display = 'none';
    const resultsEl = document.getElementById('mp-results-overlay');
    if (resultsEl) resultsEl.style.display = 'none';
}

// ================================================================
// PVP DAMAGE — clean damage path that avoids PvE perk/enemy refs
// ================================================================

function _mpApplyDamage(rawDmg) {
    if (!player?.active || !player?.comp) return 0;

    let amt = rawDmg;

    // Chassis DR
    if (loadout.chassis === 'heavy') amt *= 0.85;

    // Shield absorption (passive shield, not mod shield)
    if (player.maxShield > 0 && player.shield > 0) {
        const absorb = player._shieldAbsorb ?? 0.50;
        const shieldDmg = amt * absorb;
        player.shield = Math.max(0, player.shield - shieldDmg);
        amt -= shieldDmg;
    }

    if (amt <= 0) {
        try { updateBars(); } catch(e) {}
        return rawDmg - amt;
    }

    // Weighted random hit — legs 35%, core 25%, lArm 20%, rArm 20%
    const r = Math.random();
    let target = r < 0.35 ? 'legs' : r < 0.60 ? 'core' : r < 0.80 ? 'lArm' : 'rArm';
    let component = player.comp[target];
    if (component.hp <= 0 && target !== 'core') component = player.comp.core;

    component.hp = Math.max(0, component.hp - amt);

    // Recalculate total HP
    player.hp = Object.values(player.comp).reduce((sum, c) => sum + c.hp, 0);

    // Limb destruction
    if (player.comp.lArm.hp <= 0 && !_lArmDestroyed) {
        loadout.L = 'none'; _lArmDestroyed = true;
    }
    if (player.comp.rArm.hp <= 0 && !_rArmDestroyed) {
        loadout.R = 'none'; _rArmDestroyed = true;
    }
    if (player.comp.legs.hp <= 0 && !_legsDestroyed) {
        _legsDestroyed = true;
    }

    try { sndPlayerHit(); } catch(e) {}
    try { updateBars(); } catch(e) {}
    try { updatePaperDoll(); } catch(e) {}
    try { updateHUD(); } catch(e) {}

    return rawDmg;
}

// ================================================================
// REMOTE BULLET SPAWNING
// ================================================================

function mpSpawnRemoteBullet(scene, data) {
    if (!_mpPvpBullets) {
        _mpPvpBullets = scene.physics.add.group({ allowGravity: false });
        // PVP bullets hit local player
        // Phaser overlap(group, sprite) callback order: (sprite, groupMember) = (player, bullet)
        scene.physics.add.overlap(_mpPvpBullets, player, (playerObj, bullet) => {
            try {
                if (!bullet?.active || !bullet?.body) return;
                if (!player?.active || !isDeployed) {
                    if (bullet?.active) bullet.destroy();
                    return;
                }
                if (!_mpAlive || _mpRespawning || _mpRespawnInvuln) {
                    if (bullet?.active) bullet.destroy();
                    return;
                }

                const dmg = bullet.damageValue || 15;
                const shooterId = bullet._shooterId;

                if (isShieldActive) {
                    try { sndShieldBlock(); } catch(e) {}
                    try { createShieldSparks(scene, bullet.x, bullet.y); } catch(e) {}
                    try { showDamageText(scene, bullet.x, bullet.y, 0, true); } catch(e) {}
                    bullet.destroy();
                    return;
                }

                try { createImpactSparks(scene, player.x, player.y); } catch(e) {}
                try { showDamageText(scene, player.x, player.y, dmg, player.shield > 0); } catch(e) {}
                bullet.destroy();

                // Use PVP-specific damage path (bypasses PvE perk/enemy interactions)
                const actualDmg = _mpApplyDamage(dmg);

                if (actualDmg > 0 && _mpSocket?.connected) {
                    _mpSocket.emit('player-hit', {
                        shooterId: shooterId,
                        victimId: _mpLocalId,
                        damage: Math.round(actualDmg),
                        x: player.x,
                        y: player.y
                    });
                }

                // Check if we died
                if (player?.comp?.core?.hp <= 0 && _mpAlive) {
                    _mpAlive = false;
                    if (_mpSocket?.connected) {
                        _mpSocket.emit('player-killed', { killerId: shooterId });
                    }
                    try {
                        const deathX = player.x, deathY = player.y;
                        if (player?.active) { player.setAlpha(0); player.body.setVelocity(0, 0); }
                        if (torso?.active) torso.setAlpha(0);
                        if (shieldGraphic?.active) shieldGraphic.setVisible(false);
                        // Death explosion on own mech
                        createExplosion(scene, deathX, deathY, 60, 0);
                        scene.cameras.main.shake(300, 0.015);
                        spawnDebris(scene, deathX, deathY, loadout.color || 0x4488ff);
                    } catch(e) {}
                    isDeployed = false;
                }
            } catch(e) {
                console.warn('[MP] PVP bullet overlap error:', e);
            }
        });

        // PVP bullets hit cover
        scene.physics.add.collider(_mpPvpBullets, coverObjects, (bullet) => {
            try {
                if (!bullet?.active) return;
                createImpactSparks(scene, bullet.x, bullet.y);
                bullet.destroy();
            } catch(e) {}
        });
    }

    // Compute arm-offset bullet origin from the shooter's interpolated torso.
    // Matches the local fire() arm offset logic: bullets spawn from the L or R
    // shoulder, not the torso center. Uses the remote player's visual position
    // (what the observer actually sees) to avoid network-lag offset.
    const _rp = data.shooterId ? _mpPlayers.get(data.shooterId) : null;
    const _torsoX = _rp?.torso?.active ? _rp.torso.x : data.x;
    const _torsoY = _rp?.torso?.active ? _rp.torso.y : data.y;
    const _torsoRot = _rp?.torso?.active ? _rp.torso.rotation : data.angle;
    const _chassis = _rp?.info?.chassis || 'medium';
    const _armSideOffset = _chassis === 'light' ? 12 : _chassis === 'medium' ? 26 : 42;
    const _barrelDist = _chassis === 'light' ? 25 : _chassis === 'medium' ? 32 : 40;
    const _side = data.side || 'R';
    const _perpSign = _side === 'L' ? -1 : 1;
    const _perpAngle = _torsoRot + _perpSign * Math.PI / 2;
    const _armX = _torsoX + Math.cos(_perpAngle) * _armSideOffset;
    const _armY = _torsoY + Math.sin(_perpAngle) * _armSideOffset;
    const _spawnX = _armX + Math.cos(data.angle) * _barrelDist;
    const _spawnY = _armY + Math.sin(data.angle) * _barrelDist;

    // Muzzle flash at the arm barrel tip
    try {
        if (typeof createMuzzleFlash === 'function') {
            const flashColor = (data.weapon === 'fth') ? 0xff6600
                             : (data.weapon === 'sr')  ? 0xffffff
                             : (data.weapon === 'plsm') ? 0x00ffff
                             : 0xffffff;
            createMuzzleFlash(scene, _armX, _armY, data.angle, _barrelDist, flashColor);
        }
    } catch(e) {}

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
        const b = scene.add.circle(_spawnX, _spawnY, bSize, 0xff4444, 0.9).setDepth(11);
        scene.physics.add.existing(b);
        b.body.setCircle(bSize);
        b.body.allowGravity = false;
        b.damageValue = Math.round((data.damage || 10) / pelletCount);
        b._shooterId = data.shooterId;
        _mpPvpBullets.add(b);

        // Set velocity using velocityFromRotation (matches local bullet code)
        scene.physics.velocityFromRotation(angle, bSpeed, b.body.velocity);

        // Auto-destroy after 2 seconds
        scene.time.delayedCall(2000, () => { if (b?.active) b.destroy(); });
    }
}

// ================================================================
// UPDATE LOOP (called from GAME update())
// ================================================================

function mpUpdate() {
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

        // Directly sync the physics body position so overlap checks in
        // the CURRENT frame's physics step use the latest coordinates.
        // Without this, setPosition() only updates the GAME object; the
        // Arcade Physics body doesn't sync until next frame's preUpdate(),
        // causing a 1-frame positional lag that makes fast bullets miss.
        if (rp.body.body) {
            const hw = rp.body.body.halfWidth;
            const hh = rp.body.body.halfHeight;
            rp.body.body.position.set(newX - hw, newY - hh);
            rp.body.body.prev.set(newX - hw, newY - hh);
        }

        // Torso follows body + rotates
        if (rp.torso?.active) {
            rp.torso.setPosition(newX, newY);
            rp.torso.rotation = Phaser.Math.Angle.RotateTo(
                rp.torso.rotation,
                rp.targetTorsoRotation,
                0.15
            );
        }

        // Name tag follows
        if (rp.nameTag?.active) rp.nameTag.setPosition(newX, newY - 50);

        // Ensure torso is visible while alive (respawn may have cleared visibility)
        if (rp.torso?.active && !rp.torso.visible) rp.torso.setVisible(true);

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
    if (!_mpAlive || _mpRespawning) return;
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
        comp: player?.comp ? {
            core: { hp: Math.round(player.comp.core.hp), max: Math.round(player.comp.core.max) },
            lArm: { hp: Math.round(player.comp.lArm.hp), max: Math.round(player.comp.lArm.max) },
            rArm: { hp: Math.round(player.comp.rArm.hp), max: Math.round(player.comp.rArm.max) },
            legs: { hp: Math.round(player.comp.legs.hp), max: Math.round(player.comp.legs.max) }
        } : null,
        firing: false,
        chassis: loadout.chassis,
        color: loadout.color
    });
}

// ── BROADCAST BULLET FIRED (called from fire() hook) ───────────

function mpBroadcastBullet(x, y, angle, weaponKey, damage, side) {
    if (!_mpSocket || !_mpConnected || !_mpMatchActive) return;
    const w = WEAPONS[weaponKey];
    if (!w) return;
    // TODO(pvp-siphon): beam weapons (w.beam === true) are not yet broadcast.
    //   PVP siphon support requires a dedicated 'beam-fired' socket event that
    //   applies slow + drain to remote players rather than spawning a bullet.
    if (w.beam) return;

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
        spread: w.pellets ? 0.35 : 0,
        side: side || 'R'
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
    const scene = GAME.scene.scenes[0];
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
    const hitR = loadout.chassis === 'light' ? 24 : loadout.chassis === 'medium' ? 32 : 42;
    player.body.setCircle(hitR);
    // Center the circle on the sprite using unscaled dimensions — works for all chassis scales.
    const offsetX = (player.width - hitR * 2) / 2;
    const offsetY = (player.height - hitR * 2) / 2;
    player.body.setOffset(offsetX, offsetY);
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
    player._shieldAbsorb     = Math.min(0.90, (shldSys.absorb || 0.50) + (loadout.chassis === 'medium' ? (CHASSIS.medium.shieldAbsorbBonus || 0.15) : 0));

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
    _savedCpu = loadout.cpu; _savedAug = loadout.aug; _savedLeg = loadout.leg;

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

            // Register overlap: local bullets vs all remote player hitboxes.
            // Done HERE (after physics.resume) so the physics world is fully
            // active and the collider is guaranteed to be checked every step.
            if (_mpRemoteBodies && !_mpBulletOverlap) {
                _mpBulletOverlap = scene.physics.add.overlap(
                    bullets, _mpRemoteBodies, (bullet, rpBody) => {
                        try {
                            if (!bullet?.active) return;
                            const rpId = rpBody._mpPlayerId;
                            const rpData = rpId ? _mpPlayers.get(rpId) : null;
                            if (rpData && !rpData.alive) return;
                            const dmg = bullet.damageValue || 10;
                            const bx = bullet.x, by = bullet.y;
                            bullet.destroy();
                            try { createImpactSparks(scene, bx, by); } catch(e) {}
                            try { showDamageText(scene, bx, by, dmg); } catch(e) {}
                            _shotsHit++;
                            _damageDealt += dmg;
                            if (rpData?.comp && typeof updateEnemyDoll === 'function') {
                                try {
                                    updateEnemyDoll({
                                        comp: rpData.comp,
                                        loadout: { chassis: rpData.info?.chassis || 'medium' },
                                        _pvpName: rpData.info?.name || 'ENEMY'
                                    });
                                } catch(e) {}
                            }
                        } catch(e) {
                            console.warn('[MP] Shooter overlap error:', e);
                        }
                    }
                );
            }

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
        document.body.appendChild(lobbyEl);
    }
    lobbyEl.className = 'mp-screen';

    // Build loadout summary string for the left panel
    const wL = loadout.L && loadout.L !== 'none' ? (WEAPON_NAMES[loadout.L] || WEAPONS[loadout.L]?.name || loadout.L) : '';
    const wR = loadout.R && loadout.R !== 'none' && loadout.R !== loadout.L
        ? (WEAPON_NAMES[loadout.R] || WEAPONS[loadout.R]?.name || loadout.R) : '';
    const loadoutSummary = [wL, wR].filter(Boolean).join(' / ') || 'Unarmed';
    const chassisLabel   = (loadout.chassis || 'light');

    lobbyEl.innerHTML = `
        <!-- Top bar -->
        <div class="mp-top">
            <button onclick="mpLeaveLobby()" class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;">‹ Back</button>
            <div class="mp-screen-title">LOBBY</div>
            <button id="mp-start-btn" onclick="mpStartMatch()" class="tw-btn tw-btn--solid" style="flex:0 0 auto;width:auto;margin-left:auto;opacity:0.35;pointer-events:none;" disabled>Start Game ›</button>
        </div>

        <!-- Body -->
        <div class="mp-body">

            <!-- Left panel -->
            <div style="width:300px;flex-shrink:0;border-right:1px solid var(--sci-line);display:flex;flex-direction:column;padding:20px;gap:12px;">
                <div style="font-size:9px;letter-spacing:2px;color:var(--sci-txt3);text-transform:uppercase;">Lobby Code</div>
                <div id="mp-lobby-code" style="font-size:22px;letter-spacing:5px;color:var(--sci-cyan);font-family:var(--font-mono);">— — — —</div>
                <div id="mp-lobby-status" style="font-size:9px;letter-spacing:2px;color:var(--sci-txt3);">Connecting...</div>
                <div style="border-top:1px solid var(--sci-line);padding-top:12px;">
                    <div style="font-size:8px;letter-spacing:2px;color:var(--sci-txt3);margin-bottom:6px;text-transform:uppercase;">Your Loadout</div>
                    <div style="font-size:11px;letter-spacing:1px;color:var(--sci-txt);text-transform:capitalize;">${chassisLabel}</div>
                    <div style="font-size:9px;color:var(--sci-txt3);margin-top:3px;">${loadoutSummary}</div>
                </div>
                <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px;">
                    <button id="mp-ready-btn" onclick="_mpToggleReady()" class="tw-btn tw-btn--solid" style="width:100%;">Ready Up</button>
                    <button onclick="mpLeaveLobby()" class="tw-btn tw-btn--ghost" style="width:100%;">Leave Lobby</button>
                </div>
                <div id="mp-chat-box" style="max-height:100px;overflow-y:auto;font-size:10px;padding:8px;
                     background:var(--sci-surface);border:1px solid var(--sci-line);">
                </div>
                <div style="display:flex;gap:6px;">
                    <input id="mp-chat-input" type="text" maxlength="200" placeholder="Message..."
                           style="flex:1;padding:6px 10px;background:var(--sci-surface);border:1px solid var(--sci-line);
                                  color:var(--sci-txt);font-family:var(--font-mono);font-size:10px;outline:none;"
                           onfocus="window._chatInputFocused=true"
                           onblur="window._chatInputFocused=false"
                           onkeydown="event.stopPropagation();if(event.key==='Enter')mpSendChat()">
                    <button onclick="mpSendChat()" class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;">Send</button>
                </div>
            </div>

            <!-- Right panel: player list -->
            <div style="flex:1;display:flex;flex-direction:column;overflow-y:auto;">
                <div class="lobby-hdr">Players — <span id="mp-player-count">0</span> / 4</div>
                <div id="mp-player-list"></div>
            </div>

        </div><!-- /mp-body -->
    `;

    lobbyEl.style.display = 'flex';
    mpUpdateLobbyUI();
}

function mpHideLobby() {
    const el = document.getElementById('mp-lobby');
    if (el) el.style.display = 'none';
}

let _mpLocalReady = false;

function _mpToggleReady() {
    _mpLocalReady = !_mpLocalReady;
    const btn = document.getElementById('mp-ready-btn');
    if (btn) btn.textContent = _mpLocalReady ? 'Not Ready' : 'Ready Up';
    _mpSocket?.emit('lobby-update', { ready: _mpLocalReady });
    mpUpdateLobbyUI();
}

function mpUpdateLobbyUI() {
    const statusEl  = document.getElementById('mp-lobby-status');
    const listEl    = document.getElementById('mp-player-list');
    const countEl   = document.getElementById('mp-player-count');
    const startBtn  = document.getElementById('mp-start-btn');
    const bottomSt  = document.getElementById('mp-lobby-bottom-status');
    if (!listEl) return;

    const connected = !!_mpConnected;

    if (statusEl) {
        statusEl.textContent = connected
            ? (_mpIsHost ? 'You are host' : 'Connected')
            : 'Connecting...';
    }

    if (countEl) countEl.textContent = _mpLobbyPlayers.length;

    // Build 4 player slots (filled + empty)
    const MAX_PLAYERS = 4;
    let rows = '';
    for (let i = 0; i < MAX_PLAYERS; i++) {
        const p = _mpLobbyPlayers[i];
        if (p) {
            const isMe      = p.id === _mpLocalId;
            const isHost    = _mpLobbyPlayers[0]?.id === p.id;
            const lo        = p.loadout || {};
            const wL = lo.L && lo.L !== 'none' ? (typeof WEAPONS !== 'undefined' && WEAPONS[lo.L]?.name || lo.L) : '';
            const wR = lo.R && lo.R !== 'none' && lo.R !== lo.L ? (typeof WEAPONS !== 'undefined' && WEAPONS[lo.R]?.name || lo.R) : '';
            const weapons   = [wL, wR].filter(Boolean).join(' / ') || 'Unarmed';
            const chassis   = (p.chassis || 'light');
            const isReady   = p.ready || (isMe && _mpLocalReady);
            rows += `<div class="lobby-player-row${isMe ? '" style="background:var(--sci-cyan-dim)' : ''}">
                <div class="lobby-dot"></div>
                <div style="flex:1;min-width:0;">
                    <div class="lobby-player-name${isMe ? ' lb-me' : ''}">
                        ${p.name}${isHost ? '<span style="font-size:8px;color:var(--sci-gold);margin-left:8px;">HOST</span>' : ''}${isMe ? '<span style="font-size:8px;color:var(--sci-cyan-border);margin-left:8px;">YOU</span>' : ''}
                    </div>
                    <div class="lobby-player-loadout">${chassis} · ${weapons}</div>
                </div>
                <div class="lobby-ready-badge${isReady ? '' : ' waiting'}">${isReady ? 'Ready' : 'Not ready'}</div>
            </div>`;
        } else {
            rows += `<div class="lobby-player-row">
                <div class="lobby-dot empty"></div>
                <div class="lobby-player-name empty">Waiting for player...</div>
            </div>`;
        }
    }
    listEl.innerHTML = rows;

    // Enable start button for host once 2+ players connected
    const canStart = _mpIsHost && _mpLobbyPlayers.length >= 2;
    if (startBtn) {
        startBtn.disabled          = !canStart;
        startBtn.style.opacity     = canStart ? '1' : '0.35';
        startBtn.style.pointerEvents = canStart ? 'auto' : 'none';
    }
    if (bottomSt) {
        bottomSt.textContent = canStart
            ? (_mpIsHost ? 'All ready — you can start the match.' : 'Waiting for host to start...')
            : 'Waiting for all players to ready up...';
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
            cpu: loadout.cpu, shld: loadout.shld,
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
// MATCH RESULTS SCREEN
// ================================================================

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
        // Temporarily disable GAME input while typing
        const scene = GAME?.scene?.scenes[0];
        if (scene?.input?.keyboard) {
            scene.input.keyboard.enabled = false;
        }
    } else {
        wrap.style.display = 'none';
        if (hint) hint.style.display = 'block';
        input.value = '';
        input.blur();
        const scene = GAME?.scene?.scenes[0];
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
    const scene = GAME?.scene?.scenes[0];
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
    if (player) {
        player.shield = player.maxShield || 0;
        player.hp = player.maxHp || 100;
    }

    // Reset destroyed weapon states
    _lArmDestroyed = false; _rArmDestroyed = false; _legsDestroyed = false;
    if (typeof _resetHUDState === 'function') _resetHUDState();

    // Restore weapons
    loadout.L = _savedL; loadout.R = _savedR;
    loadout.cpu = _savedCpu; loadout.aug = _savedAug; loadout.leg = _savedLeg;

    // Re-enable
    _mpAlive = true;
    isDeployed = true;
    player.isProcessingDamage = false;

    // Camera
    scene.cameras.main.centerOn(spawnX, spawnY);

    // Brief invulnerability flash
    if (player?.active) {
        _mpRespawnInvuln = true;
        scene.tweens.add({
            targets: [player, torso],
            alpha: { from: 0.3, to: 1 },
            duration: 200,
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                // Ensure alpha is fully restored after flash ends
                if (player?.active) player.setAlpha(1);
                if (torso?.active) torso.setAlpha(1);
                _mpRespawnInvuln = false;
            }
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
    const hitR = loadout.chassis === 'light' ? 24 : loadout.chassis === 'medium' ? 32 : 42;

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
    // Reset to Light chassis starter loadout when opening fresh — multiplayer never persists selections
    if (!inMatch && typeof resetLoadout === 'function') resetLoadout();
    let el = document.getElementById('pvp-hangar');
    if (!el) {
        el = document.createElement('div');
        el.id = 'pvp-hangar';
        document.body.appendChild(el);
        // Close dropdowns when clicking outside
        el.addEventListener('click', (e) => {
            if (!e.target.closest('.pvp-dd-wrap')) _pvpCloseAllDD();
        });
    }
    el.className = 'mp-screen';
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
              : slotId === 'M' ? loadout.cpu : slotId === 'S' ? loadout.shld
              : slotId === 'G' ? loadout.leg : loadout.aug;
    if (!key || key === 'none') return 'NONE';
    if (slotId === 'L' || slotId === 'R') {
        return (typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[key] : null) || WEAPONS[key]?.name || key.toUpperCase();
    }
    const desc = typeof SLOT_DESCS !== 'undefined' ? SLOT_DESCS[key] : null;
    if (desc) return desc.title;
    const dict = slotId === 'M' ? WEAPONS
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
        restrictSet = typeof CHASSIS_CPUS !== 'undefined' ? CHASSIS_CPUS[chassis] : null;
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
                     : slotId === 'M' ? loadout.cpu : slotId === 'S' ? loadout.shld
                     : slotId === 'G' ? loadout.leg : loadout.aug;

    const lHasWeapon = loadout.L && loadout.L !== 'none';
    const rHasWeapon = loadout.R && loadout.R !== 'none';

    options.forEach(opt => {
        // Chassis restriction
        if (restrictSet && !restrictSet.has(opt.key)) return;

        // Check dual-wield / already in use
        const otherArm = slotId === 'L' ? loadout.R : slotId === 'R' ? loadout.L : null;
        const isDual = chassis === 'light' && (slotId === 'L' || slotId === 'R') && opt.key !== 'none' && opt.key === otherArm;
        const isBlocked = chassis !== 'light' && (slotId === 'L' || slotId === 'R') && opt.key !== 'none' && opt.key === otherArm;
        const isNoneDisabled = opt.key === 'none'
            && (slotId === 'L' || slotId === 'R')
            && (slotId === 'L' ? !rHasWeapon : !lHasWeapon);

        const desc = typeof SLOT_DESCS !== 'undefined' ? SLOT_DESCS[opt.key] : null;
        const descText = (desc && opt.key !== 'none') ? desc.desc : '';
        const titleText = (slotId === 'L' || slotId === 'R')
            ? ((typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[opt.key] : null) || opt.label)
            : (desc ? desc.title : opt.label);

        const div = document.createElement('div');
        div.className = 'dd-option'
            + (opt.key === currentKey ? ' dd-active' : '')
            + (isBlocked || isNoneDisabled ? ' do-disabled' : '');
        div.innerHTML = `
            <div class="do-header">
                <span class="do-name">${titleText}${isDual ? ' <span style="font-size:9px;letter-spacing:1px;color:#00ffcc;background:rgba(0,255,204,0.12);padding:1px 5px;border:1px solid rgba(0,255,204,0.3);border-radius:2px;vertical-align:middle;">DUAL</span>' : ''}${isBlocked ? ' <span style="font-size:9px;letter-spacing:1px;color:rgba(255,100,100,0.7);background:rgba(255,60,60,0.08);padding:1px 5px;border:1px solid rgba(255,60,60,0.25);border-radius:2px;vertical-align:middle;">IN USE</span>' : ''}</span>
            </div>
            ${descText ? `<div class="do-desc">${descText}</div>` : ''}`;
        if (!isBlocked && !isNoneDisabled) div.onclick = () => { _pvpSelectSlot(slotId, opt.key); _pvpCloseAllDD(); };
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

function _pvpBuildCrosshairColorDD() {
    const list = document.getElementById('pvp-ddl-XHCOL');
    if (!list) return;
    list.innerHTML = '';
    const curHex = (loadout.crosshairColor || 0xffffff).toString(16).padStart(6, '0').toLowerCase();
    (typeof CROSSHAIR_COLOR_OPTIONS !== 'undefined' ? CROSSHAIR_COLOR_OPTIONS : []).forEach(opt => {
        const div = document.createElement('div');
        div.className = 'dd-option dd-color-opt' + (opt.key === curHex ? ' dd-active' : '');
        div.innerHTML = `
            <div class="do-header">
                <span class="do-color-swatch" style="background:${opt.hex6};box-shadow:0 0 6px ${opt.hex6}55;"></span>
                <span class="do-name">${opt.label}</span>
            </div>`;
        div.onclick = () => {
            loadout.crosshairColor = opt.hex;
            try { localStorage.setItem('tw_crosshair_color', opt.key); } catch(e) {}
            _pvpCloseAllDD();
            _pvpRenderHangar();
        };
        list.appendChild(div);
    });
}

function _pvpToggleCrosshairColorDD() {
    if (_pvpOpenDD === 'XHCOL') { _pvpCloseAllDD(); return; }
    _pvpCloseAllDD();
    _pvpOpenDD = 'XHCOL';
    _pvpBuildCrosshairColorDD();
    document.getElementById('pvp-dds-XHCOL')?.classList.add('dd-open');
    document.getElementById('pvp-ddl-XHCOL')?.classList.add('dd-list-open');
}

function _pvpRenderHangar() {
    const el = document.getElementById('pvp-hangar');
    if (!el) return;

    const chassis  = loadout.chassis;
    const hexStr   = loadout.color.toString(16).padStart(6, '0');
    const colorOpt = (typeof COLOR_OPTIONS !== 'undefined' ? COLOR_OPTIONS : [])
        .find(o => o.key === hexStr) || { label: 'GREEN', hex6: '#00ff00' };
    const xhHexStr   = (loadout.crosshairColor || 0xffffff).toString(16).padStart(6, '0').toLowerCase();
    const xhColorOpt = (typeof CROSSHAIR_COLOR_OPTIONS !== 'undefined' ? CROSSHAIR_COLOR_OPTIONS : [])
        .find(o => o.key === xhHexStr) || { label: 'WHITE', hex6: '#ffffff' };

    const ch     = typeof CHASSIS !== 'undefined' ? CHASSIS[chassis] : {};
    const lEmpty = !loadout.L || loadout.L === 'none';
    const rEmpty = !loadout.R || loadout.R === 'none';
    const braceArm = lEmpty !== rEmpty;

    const shldSys  = typeof SHIELD_SYSTEMS !== 'undefined'
        ? (SHIELD_SYSTEMS[loadout.shld] || { maxShield: 0 })
        : { maxShield: 0 };
    const totalHP  = typeof getTotalHP === 'function'
        ? getTotalHP(chassis)
        : (ch.coreHP || 0) + (ch.armHP || 0) * 2 + (ch.legHP || 0);

    // ── Stat calculations (mirrors updateGarageStats) ──
    const oc    = loadout.aug === 'overclock_cpu';
    const hydro = loadout.leg === 'hydraulic_boost';
    const gyro  = loadout.leg === 'gyro_stabilizer';
    const mag   = loadout.leg === 'mag_anchors';
    const spd   = Math.round((ch.spd || 210) * (hydro ? 1.20 : 1.0));
    const spdStr = spd + ' u/s' + (hydro ? ' (+20%)' : '');

    const shHp  = shldSys.maxShield || 0;
    const shStr = shHp + ' HP';

    const reloadMult   = oc ? 0.88 : 1.0;
    const braceDmgB    = braceArm ? 1.25 : 1.0;
    const braceRldB    = braceArm ? 0.85 : 1.0;
    function fmtReload(w) {
        if (!w || !w.fireRate) return null;
        const r   = Math.round(w.fireRate * reloadMult * braceRldB);
        const dps = w.dmg ? ((w.dmg * braceDmgB) / (r / 1000)).toFixed(1) : null;
        const tag = braceArm ? ' ★' : '';
        return dps ? dps + ' dps · ' + r + 'ms cd' + tag : r + 'ms cd' + tag;
    }
    const wL   = WEAPONS[loadout.L];
    const wR   = WEAPONS[loadout.R];
    const modW = WEAPONS[loadout.cpu];
    const lRate = fmtReload(wL);
    const rRate = fmtReload(wR);
    const modCd = modW?.cooldown ? Math.round(modW.cooldown * (oc ? 0.88 : 1.0) / 1000) + 's cd' : null;

    // ── Passives ──
    const passives = [];
    if (braceArm)  passives.push('+25% damage · +15% fire rate (single-arm brace)');
    if (gyro)      passives.push('leg penalty immunity');
    if (mag)       passives.push('−20% dmg in / +15% dmg out when still');
    if (loadout.aug === 'target_painter')   passives.push('hit marks: +20% dmg on target');
    if (loadout.aug === 'threat_analyzer')  passives.push('hit debuff: −15% resist 3s');
    if (loadout.aug === 'reactive_plating') passives.push('on hit: +5% DR stack (max 5)');
    if (loadout.leg === 'mine_layer')       passives.push('drop mine every 8s moving');
    if (loadout.leg === 'afterleg')         passives.push('jump +50% dist · land shockwave');

    // ── Chassis traits ──
    const chassisTraits = [];
    if (chassis === 'light') {
        chassisTraits.push('Dual-Wield: −15% dmg & fire rate when same weapon in both arms');
        chassisTraits.push('Lightweight: +15% speed when core HP < 50%');
        chassisTraits.push('Agility: +10% speed & +10% dodge with only one weapon equipped');
    } else if (chassis === 'medium') {
        chassisTraits.push('Mod Specialist: +15% mod duration, −15% mod cooldown');
        chassisTraits.push('Kill Recharge: each kill reduces mod cooldown by 0.5s');
        chassisTraits.push('Shield Specialist: +15% shield regen & +15% shield absorb');
    } else if (chassis === 'heavy') {
        chassisTraits.push('Improved Armor: passive 15% damage reduction');
        chassisTraits.push('Attrition: +15% DR when core HP < 50%');
        chassisTraits.push('Iron Legs: no speed penalty from destroyed legs');
    }

    // ── Slot label helpers ──
    const weaponName = (key) => {
        if (!key || key === 'none') return 'NONE';
        return (typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[key] : null)
            || WEAPONS[key]?.name || key.toUpperCase();
    };

    function statRow(lbl, val, cls) {
        return `<div class="hg-stat-row"><span class="hg-stat-label">${lbl}</span><span class="hg-stat-val${cls ? ' ' + cls : ''}">${val}</span></div>`;
    }
    // ── Stats panel HTML (new order) ──
    let statsHtml = '';
    // Chassis perks/traits
    if (chassisTraits.length) {
        const traitHtml = chassisTraits.map(t => {
            const ci = t.indexOf(':');
            if (ci === -1) return `<span style="color:var(--sci-gold)">${t}</span>`;
            const tName = t.substring(0, ci);
            const tDesc = t.substring(ci + 1).trim();
            return `<span style="color:var(--sci-gold)">${tName}</span><span style="color:var(--sci-txt2)">: ${tDesc}</span>`;
        }).join(`<span style="color:var(--sci-txt2)"> · </span>`);
        statsHtml += statRow('CHASSIS PERKS', traitHtml, '');
    }
    // HP
    const _hpN = n => `<span style="color:#00ff88">${n}</span>`;
    const _hpD = s => `<span style="color:rgba(255,255,255,0.55)">${s}</span>`;
    statsHtml += statRow('HP SPLIT',
        _hpD('C ') + _hpN(ch.coreHP||0) + _hpD(' / A ') + _hpN(ch.armHP||0) + _hpD(' / L ') + _hpN(ch.legHP||0),
        '');
    statsHtml += statRow('TOTAL HP', totalHP + ' HP', 'green');
    statsHtml += statRow('TOTAL SHIELD', shHp > 0 ? shStr : 'NONE', shHp > 0 ? 'warn' : 'dim');
    // Slot details — same order as dropdown list
    function pvpSlotBlock(label, slotType, key) {
        const name = (slotType === 'weapon') ? weaponName(key) : _pvpGetSlotLabel(
            slotType === 'cpu' ? 'M' : slotType === 'augment' ? 'A' : slotType === 'legs' ? 'G' : 'S'
        );
        if (!key || key === 'none' || name === 'NONE') {
            statsHtml += statRow(label, '<span style="color:var(--sci-txt2)">NONE</span>', '');
            return;
        }
        const details = (typeof _buildSlotDetails === 'function') ? _buildSlotDetails(slotType, key) : [];
        const sep = '<span style="color:var(--sci-txt2)"> · </span>';
        const displayName = slotType === 'weapon' ? name.toUpperCase() : name;
        const nameSpan = `<span style="color:var(--sci-gold)">${displayName}</span>`;
        if (!details.length) {
            statsHtml += statRow(label, nameSpan, '');
            return;
        }
        const detailSpans = details.map(d => {
            const isDesc = d.lbl.trim() === 'INFO';
            return `<span style="color:${isDesc ? 'var(--sci-txt2)' : 'var(--sci-txt)'}">${d.val}</span>`;
        });
        statsHtml += statRow(label, nameSpan + sep + detailSpans.join(sep), '');
    }
    pvpSlotBlock('CPU', 'cpu', loadout.cpu);
    pvpSlotBlock('AUGMENT', 'augment', loadout.aug);
    pvpSlotBlock('L ARM', 'weapon', loadout.L);
    pvpSlotBlock('R ARM', 'weapon', loadout.R);
    pvpSlotBlock('LEGS', 'legs', loadout.leg);
    pvpSlotBlock('SHIELD', 'shield', loadout.shld);

    // ── Dropdown row builder ──
    function ddRow(slotId, labelText) {
        const name   = slotId === 'L' ? weaponName(loadout.L)
                     : slotId === 'R' ? weaponName(loadout.R)
                     : _pvpGetSlotLabel(slotId);
        const locked = '';
        return `<div class="mp-dd-row"${locked}>
            <span class="mp-dd-label">${labelText}</span>
            <div class="pvp-dd-wrap" style="position:relative;flex:1;">
                <div class="mp-dd-selected pvp-dd-selected" id="pvp-dds-${slotId}" onclick="_pvpToggleDD('${slotId}')">
                    <span>${name}</span>
                    <span style="font-size:9px;opacity:0.5;">▼</span>
                </div>
                <div class="dd-list pvp-dd-list" id="pvp-ddl-${slotId}"></div>
            </div>
        </div>`;
    }

    // ── Top-bar action buttons ──
    const backBtn = !_pvpHangarInMatch
        ? `<button onclick="_pvpBackToMenu()" class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;">‹ Back</button>`
        : '';

    // ── Deploy/join validation ──
    const noWeapons = lEmpty && rEmpty;
    const _deployDisabled = noWeapons ? ' style="opacity:0.45;pointer-events:none;"' : '';

    let bottomRightBtn;
    if (_pvpHangarInMatch) {
        bottomRightBtn = `
            <div style="display:flex;gap:8px;align-items:center;">
                <button id="pvp-deploy-btn" onclick="_pvpDeployFromHangar()" class="tw-btn tw-btn--solid" style="flex:0 0 auto;width:auto;"${_deployDisabled}>Deploy ›</button>
                <button onclick="_pvpQuitToMenu()" class="tw-btn tw-btn--danger tw-btn--sm" style="flex:0 0 auto;width:auto;">Quit Match</button>
            </div>`;
    } else {
        bottomRightBtn = `<button id="pvp-join-btn" onclick="_pvpJoinLobby()" class="tw-btn tw-btn--solid" style="flex:0 0 auto;width:auto;"${_deployDisabled}>Lobby ›</button>`;
    }

    const screenTitle = _pvpHangarInMatch ? 'CHANGE LOADOUT' : 'MULTIPLAYER';

    el.innerHTML = `
        <!-- Top bar -->
        <div class="mp-top">
            ${backBtn}
            <div class="mp-screen-title">${screenTitle}</div>
        </div>

        <!-- Body -->
        <div class="mp-body">

            <!-- Left column: preview + chassis + colour/crosshair -->
            <div class="mp-left">
                <div class="mp-stats-header">Chassis</div>

                <!-- Mech preview -->
                <div class="mp-preview-zone">
                    <div class="mp-preview-box">
                        <div class="sci-corner sci-corner-tl"></div>
                        <div class="sci-corner sci-corner-tr"></div>
                        <div class="sci-corner sci-corner-bl"></div>
                        <div class="sci-corner sci-corner-br"></div>
                        <img id="pvp-preview-img" src="assets/${chassis}-mech.png"
                            style="max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 0 15px #${hexStr});">
                    </div>
                    <div style="font-size:9px;letter-spacing:3px;color:var(--sci-txt3);text-transform:uppercase;">
                        ${chassis} &nbsp;·&nbsp; ${colorOpt.label}
                    </div>
                </div>

                <!-- Chassis + colour/crosshair -->
                <div class="mp-left-controls">
                    <div class="mp-chassis-row">
                        <button class="mp-chassis-btn${chassis === 'light'  ? ' active' : ''}" onclick="_pvpSetChassis('light')">Light</button>
                        <button class="mp-chassis-btn${chassis === 'medium' ? ' active' : ''}" onclick="_pvpSetChassis('medium')">Medium</button>
                        <button class="mp-chassis-btn${chassis === 'heavy'  ? ' active' : ''}" onclick="_pvpSetChassis('heavy')">Heavy</button>
                    </div>

                    <!-- Colour + Crosshair side by side, no external labels -->
                    <div class="mp-color-pair">
                        <div class="pvp-dd-wrap" style="position:relative;flex:1;">
                            <div class="mp-dd-selected pvp-dd-selected" id="pvp-dds-COL" onclick="_pvpToggleColorDD()">
                                <span style="display:flex;align-items:center;gap:6px;">
                                    <span style="width:10px;height:10px;background:${colorOpt.hex6};display:inline-block;flex-shrink:0;"></span>
                                    CHASSIS
                                </span>
                                <span style="font-size:9px;opacity:0.5;">▼</span>
                            </div>
                            <div class="dd-list pvp-dd-list" id="pvp-ddl-COL"></div>
                        </div>
                        <div class="pvp-dd-wrap" style="position:relative;flex:1;">
                            <div class="mp-dd-selected pvp-dd-selected" id="pvp-dds-XHCOL" onclick="_pvpToggleCrosshairColorDD()">
                                <span style="display:flex;align-items:center;gap:6px;">
                                    <span style="width:10px;height:10px;background:${xhColorOpt.hex6};display:inline-block;flex-shrink:0;"></span>
                                    CROSSHAIR
                                </span>
                                <span style="font-size:9px;opacity:0.5;">▼</span>
                            </div>
                            <div class="dd-list pvp-dd-list" id="pvp-ddl-XHCOL"></div>
                        </div>
                    </div>
                </div>

            </div><!-- /mp-left -->

            <!-- Middle column: loadout dropdowns -->
            <div class="mp-mid">
                <div class="mp-stats-header">Loadout</div>
                <div class="mp-mid-controls">
                    ${ddRow('M', 'Cpu')}
                    ${ddRow('A', 'Augment')}
                    ${ddRow('L', 'L.Arm')}
                    ${ddRow('R', 'R.Arm')}
                    ${ddRow('G', 'Legs')}
                    ${ddRow('S', 'Shield')}
                </div>
            </div>

            <!-- Right column: full build stats -->
            <div class="mp-right">
                <div class="mp-stats-header">Build stats</div>
                <div style="padding:12px 20px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;flex:1;">
                    ${statsHtml}
                </div>
                <div style="border-top:1px solid var(--sci-line);display:flex;flex-shrink:0;justify-content:flex-end;padding:12px 20px;">
                    ${bottomRightBtn}
                </div>
            </div>

        </div><!-- /mp-body -->
    `;
}

function _pvpSelectSlot(slotId, key) {
    if (slotId === 'L' || slotId === 'R') {
        if (slotId === 'L') {
            loadout.L = key;
            if (loadout.chassis !== 'light' && key !== 'none' && loadout.R === key) loadout.R = 'none';
        } else {
            loadout.R = key;
            if (loadout.chassis !== 'light' && key !== 'none' && loadout.L === key) loadout.L = 'none';
        }
    } else if (slotId === 'M') {
        loadout.cpu = key;
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
    if (!CHASSIS_CPUS[ch]?.has(loadout.cpu)) loadout.cpu = 'none';
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
    // Delegate to goToMainMenu() for full state reset (_round, _perkState, loadout,
    // _inventory) and proper socket cleanup before showing the main menu.
    if (typeof goToMainMenu === 'function') goToMainMenu();
}

function _pvpDeployFromHangar() {
    // Close hangar and jump back into the match with new loadout
    mpHidePvpHangar();
    document.getElementById('hud-container').style.display = 'flex';
    const mm = document.getElementById('minimap-wrap'); if (mm) mm.style.display = 'block';
    mpShowPvpHud();
    mpShowInGameChat();

    // Respawn with new loadout
    const scene = GAME?.scene?.scenes[0];
    if (!scene) return;
    scene.input.setDefaultCursor('none');
    document.body.style.cursor = 'none';

    // Apply new loadout — respawn at current spawn point
    mpRespawnPlayer();
}

function _pvpQuitToMenu() {
    mpHidePvpHangar();
    // Notify server before disconnecting
    _mpSocket?.emit('return-to-lobby');
    // Delegate to goToMainMenu() which runs the full PVP cleanup path added in goToMainMenu():
    //   mpCleanupMatch() → mpDisconnect() → _gameMode='simulation' → _cleanupGame()
    //   → resets _round, _perkState, loadout, _inventory → shows main menu
    if (typeof goToMainMenu === 'function') goToMainMenu();
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
