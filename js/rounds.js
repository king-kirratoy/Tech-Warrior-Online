// ═══════════ ROUND FLOW ═══════════

function updateRoundHUD() {
    const el = document.getElementById('round-hud');
    // Round/kill counter is simulation and pvp only — hide entirely in campaign
    if (_gameMode === 'campaign') {
        if (el) el.style.display = 'none';
        return;
    }
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
    // Scorched Earth perk: wipe all loot pickups at round start
    if (_perkState.heavyScorchedEarth) {
        lootPickups.forEach(p => {
            try { if (p.orb?.active)   p.orb.destroy();   } catch(e) {}
            try { if (p.label?.active) p.label.destroy(); } catch(e) {}
        });
        lootPickups = [];
    }
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
    if (_perkState.droneAutonomousUnit && loadout.cpu === 'atk_drone' && !_perkState._autoDroneActive) {
        setTimeout(() => { if (isDeployed && _roundActive) activateAutoDrone(scene); }, 600);
    }
}

// ── Arena & Objective setup ───────────────────────────────────────
function _setupArenaAndObjective(scene, roundNum, campaignMission) {
    if (typeof selectArena !== 'function') return;
    const arenaKey = campaignMission ? campaignMission.arena : selectArena(roundNum);
    const objKey   = campaignMission ? campaignMission.objective : selectObjective(roundNum, arenaKey);
    _arenaState.currentArena = arenaKey;
    _arenaState.currentObjective = objKey;
    if (typeof cleanupObjective === 'function') cleanupObjective(scene);
    if (roundNum > 1) generateCover(scene, arenaKey);
    if (arenaKey === 'pit' && typeof _initPitZone === 'function') _initPitZone(scene);
    if (typeof initObjective === 'function') initObjective(scene, roundNum, objKey);
    const aLabel = typeof getArenaLabel === 'function' ? getArenaLabel() : '';
    const oLabel = typeof getObjectiveLabel === 'function' ? getObjectiveLabel() : '';
    if (typeof _showArenaLabel === 'function') _showArenaLabel(scene, aLabel, oLabel);
}

// ── Campaign enemy spawning ───────────────────────────────────────
function _spawnCampaignEnemies(scene, campaignMission, campaignEnemy) {
    const comp = campaignEnemy.composition;
    let spawnIdx = 0;
    let elitesApplied = 0;

    for (let i = 0; i < comp.length; i++) {
        const typeKey = comp[i];
        const delay = spawnIdx * 400;
        setTimeout(() => {
            if (!isDeployed || !_roundActive) return;
            let spawned;
            if (typeKey === 'normal') {
                spawned = spawnEnemy(scene);
            } else if (typeof spawnSpecialEnemy === 'function') {
                spawned = spawnSpecialEnemy(scene, typeKey);
            } else {
                spawned = spawnEnemy(scene);
            }
            // Apply elite modifier based on campaign config
            if (spawned && elitesApplied < campaignEnemy.maxElites && Math.random() < campaignEnemy.eliteChance) {
                const mod1 = (typeof _rollEliteModifier === 'function') ? _rollEliteModifier([]) : null;
                if (mod1 && typeof applyEliteModifier === 'function') {
                    applyEliteModifier(scene, spawned, mod1);
                    elitesApplied++;
                }
            }
        }, delay);
        spawnIdx++;
    }

    // Boss fight at end of boss missions (after normal enemies)
    if (campaignMission.hasBoss) {
        setTimeout(() => { if (isDeployed && _roundActive) spawnBoss(scene, campaignEnemy.enemyLevel); }, spawnIdx * 400 + 600);
    }

    // Commander in higher-level campaign missions (add to total)
    if (campaignEnemy.enemyLevel >= 6) {
        _roundTotal++;
        updateRoundHUD();
        setTimeout(() => { if (isDeployed && _roundActive) spawnCommander(scene); }, spawnIdx * 400 + 800);
    }
}

// ── Simulation enemy spawning ─────────────────────────────────────
function _spawnSimulationEnemies(scene, roundNum) {
    // Normal round — commanders from round 4+, medic from round 3+
    const spawnCmd = roundNum >= 6 || (roundNum >= 4 && Math.random() < 0.5);
    const spawnCfg = (typeof _getEnemySpawnConfig === 'function') ? _getEnemySpawnConfig(roundNum) : { specialTypes:[], eliteChance:0, maxElites:0 };

    // Determine how many specials to spawn (replace some normal enemies)
    let specialCount = 0;
    if (spawnCfg.specialTypes.length > 0 && roundNum > 5) {
        specialCount = Math.min(Math.floor(_roundTotal / 4) + 1, spawnCfg.specialTypes.length, Math.floor(_roundTotal * 0.4));
        specialCount = Math.max(1, specialCount);
    }

    const normalCount = Math.max(1, (spawnCmd ? _roundTotal - 1 : _roundTotal) - specialCount);
    let spawnIdx = 0;

    // Spawn normal enemies
    for (let i = 0; i < normalCount; i++) {
        const delay = spawnIdx * 400;
        setTimeout(() => { if (isDeployed && _roundActive) spawnEnemy(scene); }, delay);
        spawnIdx++;
    }

    // Spawn special enemy types
    let elitesApplied = 0;
    for (let i = 0; i < specialCount; i++) {
        const typeKey = Phaser.Math.RND.pick(spawnCfg.specialTypes);
        const delay = spawnIdx * 400;
        setTimeout(() => {
            if (!isDeployed || !_roundActive) return;
            if (typeof spawnSpecialEnemy !== 'function') { spawnEnemy(scene); return; }
            const se = spawnSpecialEnemy(scene, typeKey);
            // Possibly apply elite modifier
            if (se && elitesApplied < spawnCfg.maxElites && Math.random() < spawnCfg.eliteChance) {
                if (typeof _rollEliteModifier !== 'function' || typeof applyEliteModifier !== 'function') return;
                const mod1 = _rollEliteModifier([]);
                if (mod1) {
                    applyEliteModifier(scene, se, mod1);
                    elitesApplied++;
                    // Double modifier chance (round 20+)
                    if ((spawnCfg.doubleModChance || 0) > 0 && Math.random() < spawnCfg.doubleModChance) {
                        const mod2 = _rollEliteModifier([mod1]);
                        if (mod2) applyEliteModifier(scene, se, mod2);
                    }
                }
            }
        }, delay);
        spawnIdx++;
    }

    // Apply elite modifiers to some normal enemies (round 11+)
    if (roundNum >= 11 && spawnCfg.maxElites > 0) {
        const normalEliteCount = Math.min(spawnCfg.maxElites - specialCount, Math.floor(normalCount * 0.3));
        if (normalEliteCount > 0) {
            setTimeout(() => {
                if (!isDeployed || !_roundActive || !enemies) return;
                if (typeof _rollEliteModifier !== 'function' || typeof applyEliteModifier !== 'function') return;
                const normals = enemies.getChildren().filter(en =>
                    en.active && !en.isElite && !en.isCommander && !en.isMedic && !en.isBoss && !en.enemyType
                );
                const toElite = Phaser.Utils.Array.Shuffle(normals).slice(0, normalEliteCount);
                toElite.forEach(en => {
                    if (elitesApplied >= spawnCfg.maxElites) return;
                    const mod1 = _rollEliteModifier([]);
                    if (mod1) { applyEliteModifier(scene, en, mod1); elitesApplied++; }
                });
            }, spawnIdx * 400 + 200);
        }
    }

    if (spawnCmd) {
        setTimeout(() => { if (isDeployed && _roundActive) spawnCommander(scene); }, spawnIdx * 400 + 600);
    }
    if (roundNum >= 3 && Math.random() < 0.40) {
        _roundTotal++; // medic counts toward the kill total
        updateRoundHUD();
        setTimeout(() => { if (isDeployed && _roundActive) spawnMedic(scene); }, spawnIdx * 400 + 1000);
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
    // Drone Swarm Logic: kills while drone active reduce drone cooldown
    if (_perkState.droneSwarmLogic > 0 && (_perkState._droneActive || _perkState._autoDroneActive)) {
        lastModTime -= _perkState.droneSwarmLogic;
    }
    // Drone Overwatch: kills increase drone damage for this round
    if (_perkState.droneOverwatchStacks > 0) {
        _perkState.droneOverwatchKills = (_perkState.droneOverwatchKills || 0) + 1;
    }
    // Autonomous Unit: kills while drone is down reduce respawn timer
    if (_perkState.droneAutonomousUnit && !_perkState._autoDroneActive && _perkState._autoDroneRespawnTimer) {
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
    // Spectre: every kill spawns a shadow clone (max 2, lasts 4s, deals 50% dmg)
    if (_perkState.lightSpectre && player?.active && isDeployed) {
        if (typeof _spawnSpectreClone === 'function') _spawnSpectreClone();
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

// ═══════════ EXTRACTION SYSTEM ═══════════

function _spawnExtractionPoint(scene) {
    // Pick a random spot away from player, within map bounds, not overlapping cover
    const zoneR = 60; // extraction zone radius — declared early for overlap check
    let ex, ey, attempts = 0;
    do {
        ex = Phaser.Math.Between(300, 3700);
        ey = Phaser.Math.Between(300, 3700);
        attempts++;
    } while (
        attempts < 80 &&
        (_overlapsAnyCover(ex, ey, zoneR) ||
         (player?.active && Phaser.Math.Distance.Between(ex, ey, player.x, player.y) < 600))
    );
    _extractionPoint = { x: ex, y: ey };
    _extractionActive = true;
    _extractionPromptShown = false;
    updateRoundHUD();

    // Visual: pulsing green circle on the ground
    const glow = scene.add.circle(ex, ey, zoneR, 0x00ff66, 0.08).setDepth(2);
    const ring = scene.add.circle(ex, ey, zoneR, 0x000000, 0).setDepth(2);
    ring.setStrokeStyle(3, 0x00ff66, 0.7);
    const innerRing = scene.add.circle(ex, ey, zoneR * 0.5, 0x000000, 0).setDepth(2);
    innerRing.setStrokeStyle(2, 0x00ff66, 0.35);

    // Diamond icon at center
    const diamond = scene.add.polygon(ex, ey,
        [0, -12, 10, 0, 0, 12, -10, 0], 0x00ff66, 0.6).setDepth(3);
    diamond.setStrokeStyle(2, 0xffffff, 0.8);

    // Label
    const label = scene.add.text(ex, ey - zoneR - 14, 'EXTRACTION POINT', {
        font: 'bold 11px monospace', fill: '#00ff66',
        stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);

    // Prompt (hidden initially, shown when player is close)
    const prompt = scene.add.text(ex, ey + zoneR + 14, '[ PRESS  E  TO EXTRACT ]', {
        font: 'bold 10px monospace', fill: '#ffffff',
        stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    // Pulse animations
    scene.tweens.add({ targets: glow, alpha: 0.18, duration: 1000, yoyo: true, repeat: -1 });
    scene.tweens.add({ targets: ring, scaleX: 1.08, scaleY: 1.08, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    scene.tweens.add({ targets: diamond, angle: 360, duration: 4000, repeat: -1 });
    scene.tweens.add({ targets: label, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    _extractionVisuals = { glow, ring, innerRing, diamond, label, prompt, zoneR };
}

function _updateExtraction(scene) {
    if (!_extractionActive || !_extractionPoint || !player?.active) return;
    const dist = Phaser.Math.Distance.Between(player.x, player.y, _extractionPoint.x, _extractionPoint.y);
    const inZone = dist < (_extractionVisuals?.zoneR || 60);

    // Show/hide prompt
    if (_extractionVisuals?.prompt) {
        if (inZone && !_extractionPromptShown) {
            _extractionPromptShown = true;
            _extractionVisuals.prompt.setAlpha(1);
            scene.tweens.add({ targets: _extractionVisuals.prompt, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
        } else if (!inZone && _extractionPromptShown) {
            _extractionPromptShown = false;
            scene.tweens.killTweensOf(_extractionVisuals.prompt);
            _extractionVisuals.prompt.setAlpha(0);
        }
    }

    // Check for E key press while in zone
    if (inZone && keys.E.isDown) {
        _triggerExtraction(scene);
    }
}

function _triggerExtraction(scene) {
    // PVP has no extraction system, campaign XP, or perk menus — skip entirely
    if (_gameMode === 'pvp') return;
    _extractionActive = false;
    _cleanupExtraction(scene);

    // Now run the normal round-end flow
    _roundActive = false;
    _roundClearing = true;
    if (player?.body) { player.body.setVelocity(0, 0); player.body.setAngularVelocity(0); }
    if (enemyBullets) enemyBullets.getChildren().slice().forEach(b => { if (b?.active) b.destroy(); });

    const _objFailed = typeof _arenaState !== 'undefined' && _arenaState.objectiveFailed;
    const _bannerSub = _objFailed ? '✖ OBJECTIVE FAILED' :
        (typeof _arenaState !== 'undefined' && _arenaState.currentObjective !== 'elimination' && _arenaState.objectiveComplete ? '★ OBJECTIVE COMPLETE' : '');
    sndRoundClear();
    _healPlayerFull();
    if (typeof cleanupObjective === 'function') cleanupObjective(scene);
    const nextRound = _round + 1;

    // ── Campaign mode: award XP, mark mission complete, save ──
    if (_gameMode === 'campaign' && typeof awardMissionXP === 'function') {
        // Finalize bonus objective (e.g., speed run check)
        const elapsed = (scene.time?.now || Date.now()) - (window._missionStartTime || 0);
        if (typeof finalizeBonusObjective === 'function') finalizeBonusObjective(elapsed);

        const xpResult = awardMissionXP();
        if (typeof completeCampaignMission === 'function') completeCampaignMission();

        // Phase 4: Award first-clear mission rewards
        let rewardLine = '';
        const mission = (typeof getCampaignMission === 'function') ? getCampaignMission() : null;
        if (mission && typeof awardMissionReward === 'function') {
            const reward = awardMissionReward(mission.id);
            if (reward) {
                rewardLine = ` // +${reward.scrap} SCRAP`;
                if (reward.item) rewardLine += ` + ${reward.item.rarity.toUpperCase()} LOOT`;
            }
        }

        saveCampaignProgress();
        if (typeof saveCampaignState === 'function') saveCampaignState();
        saveInventory();

        // Build campaign-specific banner text
        const mName = mission ? mission.name.toUpperCase() : 'MISSION';
        let xpLine = `+${xpResult.xpGained} XP`;
        if (xpResult.leveledUp) xpLine += ` // LEVEL UP! LV.${xpResult.newLevel}`;
        const bonusLine = (_campaignState?.bonusObjectiveComplete) ? ' // BONUS COMPLETE' : '';

        showRoundBanner(
            'MISSION COMPLETE',
            `${mName} ${xpLine}${bonusLine}${rewardLine}`,
            3000,
            () => {
                // Return to mission select instead of starting next round
                _roundClearing = false;
                window._activeCampaignConfig = null;
                returnToHangarForMissionSelect();
            }
        );
        return;
    }

    // Campaign: auto-save gear and progress after each cleared round
    if (_gameMode === 'campaign') { saveCampaignProgress(); saveInventory(); }
    showRoundBanner(
        'ROUND ' + _round + ' CLEARED',
        _bannerSub,
        2200,
        () => showPerkMenu(nextRound)
    );
}

function _cleanupExtraction(scene) {
    if (_extractionVisuals) {
        const objs = [_extractionVisuals.glow, _extractionVisuals.ring, _extractionVisuals.innerRing,
                      _extractionVisuals.diamond, _extractionVisuals.label, _extractionVisuals.prompt];
        objs.forEach(o => {
            try { if (o) { scene.tweens.killTweensOf(o); if (o.active !== false) o.destroy(); } } catch(e) {}
        });
        _extractionVisuals = null;
    }
    _extractionPoint = null;
    _extractionActive = false;
    _extractionPromptShown = false;
}

function _overlapsAnyCover(px, py, radius) {
    if (!coverObjects) return false;
    const pad = radius + 10; // extra margin so the player can comfortably reach the zone
    return coverObjects.getChildren().some(c => {
        if (!c.active) return false;
        // coverCX/coverCY = true center; fall back to body origin + half size
        const cx = c.coverCX ?? (c.x + (c.width || 0) / 2);
        const cy = c.coverCY ?? (c.y + (c.height || 0) / 2);
        const hw = (c.width  || 60) / 2 + pad;
        const hh = (c.height || 60) / 2 + pad;
        return Math.abs(px - cx) < hw && Math.abs(py - cy) < hh;
    });
}

