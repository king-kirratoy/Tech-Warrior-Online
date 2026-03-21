// ═══════════ ROUND FLOW ═══════════

function updateRoundHUD() {
    const el = document.getElementById('round-hud');
    if (el) el.style.display = 'flex';
    const rn = document.getElementById('round-num');
    const rr = document.getElementById('round-remaining');
    const rk = document.getElementById('round-kills');
    if (rn) rn.innerText = _round;
    if (rr) rr.innerText = _extractionActive ? 'EXTRACT' : Math.max(0, _roundTotal - _roundKills);
    if (rk) rk.innerText = _totalKills;
}

function _healPlayerFull() {
    if (!player?.comp) return;
    Object.values(player.comp).forEach(c => { c.hp = c.max; });
    player.hp = Object.values(player.comp).reduce((s,c)=>s+c.hp,0);
    player.shield = player.maxShield;
    if (_lArmDestroyed) { _lArmDestroyed = false; if (_savedL) loadout.L = _savedL; }
    if (_rArmDestroyed) { _rArmDestroyed = false; if (_savedR) loadout.R = _savedR; }
    updateHUD(); updateBars(); updatePaperDoll();
    if (_perkState.ammoCache) { isAmmoActive = true; setTimeout(()=>{ isAmmoActive=false; },8000); }
}

function showRoundBanner(title, sub, duration, onDone) {
    const banner = document.getElementById('round-banner');
    const bt = document.getElementById('round-banner-text');
    const bs = document.getElementById('round-banner-sub');
    if (!banner) { if (onDone) onDone(); return; }
    if (bt) bt.innerText = title;
    if (bs) bs.innerText = sub;
    banner.style.display = 'block';
    banner.style.opacity = '0';
    banner.style.transition = 'opacity 0.3s ease';
    setTimeout(() => { banner.style.opacity = '1'; }, 20);
    setTimeout(() => {
        banner.style.opacity = '0';
        setTimeout(() => {
            banner.style.display = 'none';
            if (onDone) onDone();
        }, 350);
    }, duration);
}

function _clearMapForRound(scene) {
    // Clean up extraction point visuals from previous round
    _cleanupExtraction(scene);
    // Wipe all in-flight bullets
    if (bullets)      bullets.getChildren().slice().forEach(b => { try { if (b.active) b.destroy(); } catch(e){} });
    // Clean up decoys and phantom decoys between rounds
    if (window._activeDecoy) { try { window._activeDecoy.destroy(); } catch(e){} window._activeDecoy = null; }
    if (window._phantomDecoys) {
        window._phantomDecoys.forEach(p => { try { p.torso.destroy(); p.label.destroy(); p.drift.remove(); p.fire.remove(); } catch(e){} });
        window._phantomDecoys = [];
    }
    if (enemyBullets) enemyBullets.getChildren().slice().forEach(b => { try { if (b.active) b.destroy(); } catch(e){} });
    // Wipe all loot pickups (orbs + labels)
    lootPickups.forEach(p => {
        try { if (p.orb?.active)   p.orb.destroy();   } catch(e) {}
        try { if (p.label?.active) p.label.destroy(); } catch(e) {}
    });
    lootPickups = [];
    // Teleport player to map center
    if (player?.body) {
        player.x = WORLD_CENTER; player.y = WORLD_CENTER;
        player.body.setVelocity(0, 0);
        player.body.setAngularVelocity(0);
    }
    if (torso) torso.setPosition(WORLD_CENTER, WORLD_CENTER);
    // Re-anchor camera
    try {
        scene.cameras.main.centerOn(WORLD_CENTER, WORLD_CENTER);
        scene.cameras.main.startFollow(player, true, 0.5, 0.5);
    } catch(e) {}
}

function startRound(roundNum) {
    // PVP mode has no rounds, enemy spawns, objectives, or extraction — skip entirely
    if (_gameMode === 'pvp') return;
    _round      = roundNum;
    _roundKills = 0;
    resetRoundPerks();
    _roundActive = true;
    const scene = GAME.scene.scenes[0];

    // ── Campaign mode: use mission config ──
    const isCampaignMode  = _gameMode === 'campaign' && typeof getCampaignMission === 'function';
    const campaignMission = isCampaignMode ? getCampaignMission() : null;
    const campaignEnemy   = (isCampaignMode && typeof getCampaignEnemyConfig === 'function') ? getCampaignEnemyConfig() : null;

    if (campaignMission && campaignEnemy) {
        _roundTotal = campaignEnemy.totalEnemies + (campaignMission.hasBoss ? 1 : 0);
        // Store campaign enemy config for HP/speed scaling in spawnEnemy
        window._activeCampaignConfig = campaignEnemy;
        // Record mission start time for speed-run bonus objective
        window._missionStartTime = scene.time?.now || Date.now();
    } else {
        _roundTotal = roundNum + 2;   // round 1=3, round 2=4, etc.
        window._activeCampaignConfig = null;
    }
    updateRoundHUD();

    // Round 2+: wipe map debris and reset player to center
    if (roundNum > 1) _clearMapForRound(scene);

    // ── Phase 6: Arena & Objective selection ──
    _setupArenaAndObjective(scene, roundNum, campaignMission);

    // Boss every 5th round (simulation), or hasBoss flag (campaign)
    const isBossRound = campaignMission ? campaignMission.hasBoss : (roundNum > 0 && roundNum % 5 === 0);

    if (isBossRound && !(campaignMission && campaignEnemy && campaignEnemy.totalEnemies > 0)) {
        // BOSS-ONLY ROUND — only the boss spawns; it counts as 1 kill to end the round
        _roundTotal = 1;
        setTimeout(() => { if (isDeployed && _roundActive) spawnBoss(scene, roundNum); }, 800);
    } else if (campaignMission && campaignEnemy) {
        _spawnCampaignEnemies(scene, campaignMission, campaignEnemy);
    } else {
        _spawnSimulationEnemies(scene, roundNum);
    }

    // Autonomous Unit: auto-deploy drone at round start (after short delay)
    if (_perkState.autonomousUnit && loadout.mod === 'atk_drone' && !_perkState._autoDroneActive) {
        setTimeout(() => { if (isDeployed && _roundActive) activateAutoDrone(scene); }, 600);
    }
}

function onEnemyKilled(deadEnemy) {
    // PVP has no PvE enemy kills, extraction, or round progression — skip entirely
    if (_gameMode === 'pvp') return;
    _roundKills++;
    // Swarm Burst unique: kills spawn homing micro-drones
    if (typeof triggerSwarmBurst === 'function' && deadEnemy?.x != null) {
        triggerSwarmBurst(GAME.scene.scenes[0], deadEnemy.x, deadEnemy.y);
    }
    // Swarm Logic: kills while drone active reduce drone cooldown
    if (_perkState.swarmLogic > 0 && (_perkState._droneActive || _perkState._autoDroneActive)) {
        lastModTime -= _perkState.swarmLogic;
    }
    // Overwatch: kills increase drone damage for this round
    if (_perkState.overwatchStacks > 0) {
        _perkState.overwatchKills = (_perkState.overwatchKills || 0) + 1;
    }
    // Autonomous Unit: kills while drone is down reduce respawn timer
    if (_perkState.autonomousUnit && !_perkState._autoDroneActive && _perkState._autoDroneRespawnTimer) {
        _perkState._autoDroneRespawnTimer.delay = Math.max(1000, (_perkState._autoDroneRespawnTimer.delay || 12000) - 1000);
    }
    _totalKills++;
    updateRoundHUD();
    // Campaign bonus objective tracking: close kills, multi-kills, limb destroys
    if (_gameMode === 'campaign' && typeof trackBonusObjective === 'function') {
        // Close kill tracking (within 150px)
        if (player?.active && deadEnemy?.x != null) {
            const _killDist = Phaser.Math.Distance.Between(player.x, player.y, deadEnemy.x, deadEnemy.y);
            if (_killDist <= 150) trackBonusObjective('close_kill', 1);
        }
        // Multi-kill tracking (2 kills within 2s)
        const now = Date.now();
        if (now - _lastKillTime < 2000) {
            trackBonusObjective('multi_kill', 1);
        }
        _lastKillTime = now;
    }
    // MEDIUM: each kill reduces active mod cooldown by 0.5s
    if (loadout.chassis === 'medium' && lastModTime > 0) {
        const reduction = CHASSIS.medium.killCooldownReduction || 500;
        lastModTime = Math.max(0, lastModTime - reduction);
    }
    if (_perkState.adrenalineStacks > 0 && player?.comp?.core)
        player.comp.core.hp = Math.min(player.comp.core.max, player.comp.core.hp + player.comp.core.max * 0.05 * _perkState.adrenalineStacks);
    // Kill Streak: track kills without taking damage
    if (_perkState.killStreak > 0) {
        _perkState._killStreakCount = (_perkState._killStreakCount || 0) + 1;
        if (!_perkState._killStreakActive && _perkState._killStreakCount >= 3) {
            _perkState._killStreakActive = true;
            _perkState.dmgMult = (_perkState.dmgMult || 1) * (1 + 0.25 * _perkState.killStreak);
            const sc3 = GAME.scene.scenes[0];
            const kst = sc3.add.text(player.x, player.y - 55, 'KILL STREAK!', {
                font: 'bold 14px Courier New', fill: '#ffff00', stroke: '#aa6600', strokeThickness: 3
            }).setDepth(20).setOrigin(0.5);
            sc3.tweens.add({ targets: kst, y: kst.y - 30, alpha: 0, duration: 1200, onComplete: () => kst.destroy() });
        }
    }
    // rage_feed: kills during rage extend it
    if (_perkState.rageFeed > 0 && isRageActive) {
        _perkState._rageEndTime = (_perkState._rageEndTime || 0) + _perkState.rageFeed;
    }
    // Hit-and-run: speed burst on kill
    if (_perkState.hitRunStacks > 0) {
        const scene = GAME.scene.scenes[0];
        if (!_perkState._hitRunActive) {
            _perkState.speedMult *= (1 + 0.25 * _perkState.hitRunStacks);
        }
        _perkState._hitRunActive = true;
        _perkState._hitRunTimer = scene.time.now + 3000;
    }
    // Spectre: every kill spawns a shadow clone (max 2, lasts 4s, deals 50% dmg)
    if (_perkState.lightSpectre && player?.active && isDeployed) {
        _spawnSpectreClone();
    }

    // Predator: long-range kill charges next shot
    if (_perkState.predatorStacks > 0 && player) {
        const nearestEnemy = enemies?.getChildren()?.reduce((closest, e) => {
            const d = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
            return (!closest || d < closest.dist) ? {e, dist:d} : closest;
        }, null);
        // If last kill was at 500+ px, charge next shot
        _perkState._predatorCharged = true;
    }

    // Phase 6: check objective-based round end (survival complete, assassination done, etc.)
    const _objEnd = typeof shouldEndRound === 'function' && shouldEndRound();
    if ((_roundKills >= _roundTotal || _objEnd) && !_extractionActive) {
        const scene = GAME.scene.scenes[0];
        _roundActive = false;
        // Destroy any in-flight enemy bullets
        if (enemyBullets) enemyBullets.getChildren().slice().forEach(b => { if (b?.active) b.destroy(); });
        // Destroy remaining enemies if objective ended the round early
        if (_objEnd && _roundKills < _roundTotal) {
            enemies?.getChildren().slice().forEach(e => {
                try { destroyEnemyWithCleanup(scene, e); } catch(ex) {}
            });
            _roundKills = _roundTotal;
        }
        // Spawn extraction point — player must go there to end the round
        _spawnExtractionPoint(scene);
        showRoundBanner('ALL HOSTILES ELIMINATED', 'REACH EXTRACTION POINT', 2500, null);
    }
}
