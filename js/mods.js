// ═══════════ MOD ACTIVATIONS ═══════════

function activateDecoy(scene, time) {
    const mod = WEAPONS.decoy;
    const spawnX = player.x, spawnY = player.y;

    // Build a ghost mech that looks like the player (same chassis, same colour, semi-transparent)
    const decoyTorso = buildPlayerMech(scene, loadout.chassis, loadout.color);
    decoyTorso.setPosition(spawnX, spawnY);
    decoyTorso.setAlpha(0.40);
    decoyTorso.setDepth(9);
    // Rotate to match player facing
    decoyTorso.setRotation(torso.rotation);

    // DECOY label above
    const decoyLabel = scene.add.text(spawnX, spawnY - 36, 'DECOY', {
        font: 'bold 10px Courier New', fill: '#00ccff'
    }).setAlpha(0.6).setDepth(15).setOrigin(0.5);

    // Slow ghost drift to make it convincing
    let decoyAngle = torso.rotation;
    const driftEvent = scene.time.addEvent({ delay: 16, loop: true, callback: () => {
        if (!decoyTorso.active) return;
        decoyAngle += 0.008;
        decoyTorso.x += Math.cos(decoyAngle) * 0.6;
        decoyTorso.y += Math.sin(decoyAngle) * 0.3;
        decoyTorso.setRotation(decoyAngle);
        decoyLabel.setPosition(decoyTorso.x, decoyTorso.y - 36);
    }});

    // Decoy fires the player's weapons toward nearest enemy every 1.2s
    const decoyFireEvent = scene.time.addEvent({ delay: 1200, loop: true, callback: () => {
        if (!decoyTorso.active) return;
        let nearest = null, _nearDistD = Infinity;
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const d = Phaser.Math.Distance.Between(decoyTorso.x, decoyTorso.y, e.x, e.y);
            if (d < _nearDistD) { _nearDistD = d; nearest = e; }
        });
        if (!nearest) return;
        const ang = Math.atan2(nearest.y - decoyTorso.y, nearest.x - decoyTorso.x);
        const wKey = loadout.L !== 'none' ? loadout.L : loadout.R;
        const weapon = WEAPONS[wKey];
        if (!weapon || weapon.explosive) return; // skip explosive weapons for safety
        // Fire a visual-only bullet (doesn't use the physics bullet group to keep things simple)
        const b = scene.add.circle(decoyTorso.x, decoyTorso.y, (weapon.bulletSize||4), 0x88ccff, 0.7).setDepth(11);
        scene.physics.add.existing(b);
        b.body.setAllowGravity(false);
        b.damageValue = Math.round((weapon.dmg||10) * 0.5); // decoy deals half damage
        bullets.add(b);
        scene.physics.velocityFromRotation(ang, (weapon.speed||800) * 0.9, b.body.velocity);
        scene.time.delayedCall(1500, () => { if (b.active) b.destroy(); });
    }});

    // Enemies target decoy — use a live position reference
    enemies.getChildren().forEach(e => {
        if (!e.active) return;
        e._decoyTarget = decoyTorso; // live reference so they track it as it drifts
    });
    // New enemies spawning during decoy also need target set — handled via _decoyRef global
    window._activeDecoy = decoyTorso;

    // decoy_duration perk extends lifetime; phantom_army makes it permanent
    const effectiveDuration = mod.decoyDuration + (_perkState.decoyDuration || 0);

    if (_perkState.phantomArmy) {
        if (!window._phantomDecoys) window._phantomDecoys = [];
        window._phantomDecoys.push({ torso: decoyTorso, label: decoyLabel, drift: driftEvent, fire: decoyFireEvent });
        if (window._phantomDecoys.length > 3) {
            const oldest = window._phantomDecoys.shift();
            try { oldest.torso.destroy(); oldest.label.destroy(); oldest.drift.remove(); oldest.fire.remove(); } catch(ex) {}
        }
        lastModTime = time;
        return;
    }

    scene.time.delayedCall(effectiveDuration, () => {
        if (decoyTorso.active) decoyTorso.destroy();
        if (decoyLabel.active) decoyLabel.destroy();
        driftEvent.remove();
        decoyFireEvent.remove();
        enemies.getChildren().forEach(e => { if (e) e._decoyTarget = null; });
        window._activeDecoy = null;
        // ghost_exit: cloak for 2s after decoy expires
        if (_perkState.ghostExit && player?.active && isDeployed) {
            player._ghostExitActive = true;
            const gscene = GAME.scene.scenes[0];
            if (torso) torso.setAlpha(0.15);
            gscene.time.delayedCall(2000, () => {
                player._ghostExitActive = false;
                if (torso?.active) torso.setAlpha(1.0);
            });
        }
        lastModTime = scene.time.now;
    });
    lastModTime = time;
}

function activateMissiles(scene, time) {
    const mod = WEAPONS.missile;
    const count = mod.missileCount;
    const sorted = enemies.getChildren()
        .filter(e => e.active)
        .sort((a,b) => Phaser.Math.Distance.Between(player.x,player.y,a.x,a.y) -
                       Phaser.Math.Distance.Between(player.x,player.y,b.x,b.y))
        .slice(0, 3);
    if (!sorted.length) { lastModTime = time; return; }

    // Missile launch sound
    _tone(180, 'sawtooth', 0.12, 0.25, 60);
    _noise(0.10, 0.30, 0, 200, 1800);

    for (let i = 0; i < count; i++) {
        const target = sorted[i % sorted.length];
        scene.time.delayedCall(i * 150, () => {
            if (!target.active || !player) return;
            // Rocket visual — small rectangle with orange/red tint, like RL
            const startX = player.x + (Math.random()-0.5)*20;
            const startY = player.y + (Math.random()-0.5)*20;
            const rocket = scene.add.rectangle(startX, startY, 14, 6, 0xff3300)
                .setStrokeStyle(1, 0xffaa00).setDepth(13).setAlpha(0.95);

            // Smoke trail — drops a fading dot every 60ms
            let smokeInterval = null;
            smokeInterval = scene.time.addEvent({ delay: 60, loop: true, callback: () => {
                if (!rocket.active) { smokeInterval?.remove(); return; }
                const s = scene.add.circle(rocket.x, rocket.y, 3 + Math.random()*2, 0x884422, 0.55).setDepth(12);
                scene.tweens.add({ targets: s, alpha: 0, scaleX: 2, scaleY: 2, duration: 350, onComplete: () => s.destroy() });
            }});

            // Fly toward target (slow homing tween)
            const dur = 900 + Math.random() * 300;
            scene.tweens.add({
                targets: rocket,
                x: target.x + (Math.random()-0.5)*24,
                y: target.y + (Math.random()-0.5)*24,
                duration: dur,
                ease: 'Sine.easeIn',
                onUpdate: () => {
                    // Rotate rocket to face travel direction
                    if (rocket.active) {
                        const ang = Math.atan2(
                            (target.y - rocket.y),
                            (target.x - rocket.x)
                        );
                        rocket.setRotation(ang);
                    }
                },
                onComplete: () => {
                    smokeInterval?.remove();
                    rocket.destroy();
                    if (target.active) {
                        damageEnemy(target, mod.missileDmg, 0);
                        createExplosion(scene, target.x, target.y, 45, 0);
                        // Individual impact sound (throttled: up to 3 missiles land within 150 ms each)
                        if (_canPlay('mslimp', 100)) _noise(0.08, 0.25, 0, 80, 900);
                    }
                }
            });
        });
    }
    lastModTime = time;
}

function activateDrone(scene, time) {
    if (_perkState._droneActive) return;
    _perkState._droneActive = true;
    if (_perkState.multiDrone) {
        _spawnDrone(scene, -50, -52, false);
        _spawnDrone(scene,  50, -52, false);
    } else {
        _spawnDrone(scene, 0, -62, false);
    }
    lastModTime = time || scene.time.now;
    // Cooldown reduction from perks
    if (_perkState.droneCdMult && _perkState.droneCdMult < 1) {
        const base = WEAPONS.atk_drone.cooldown;
        lastModTime -= base * (1 - _perkState.droneCdMult);
    }
}

function activateRepair(scene, time) {
    const mod = WEAPONS.repair;
    const ticks = mod.healTicks;

    // Repair drone follows the player while healing
    let rdX = player.x, rdY = player.y - 55;
    const repairDrone = _buildDroneGraphic(scene, rdX, rdY, 0x00ff88);
    const rdFollow = scene.time.addEvent({ delay: 16, loop: true, callback: () => {
        if (!repairDrone.active || !player?.active) return;
        const tx = player.x + Math.sin(scene.time.now * 0.002) * 20;
        const ty = player.y - 52 + Math.cos(scene.time.now * 0.0025) * 8;
        rdX += (tx - rdX) * 0.09;
        rdY += (ty - rdY) * 0.09;
        repairDrone._drawDrone(rdX, rdY, 0x00ff88);
    }});

    for (let i = 0; i < ticks; i++) {
        scene.time.delayedCall(i * mod.tickDelay, () => {
            if (!player?.comp) return;
            const parts = Object.entries(player.comp).sort((a,b) => (a[1].hp/a[1].max) - (b[1].hp/b[1].max));
            const [, part] = parts[0];
            const healAmt = mod.healAmount / ticks;
            if (part && part.hp < part.max) {
                part.hp = Math.min(part.max, part.hp + healAmt);
                updatePaperDoll();
                updateBars();
            }
            // Green heal beam from drone to player
            const beam = scene.add.graphics().setDepth(13);
            beam.lineStyle(3, 0x00ff88, 0.7);
            beam.lineBetween(rdX, rdY, player.x, player.y);
            scene.tweens.add({ targets: beam, alpha: 0, duration: mod.tickDelay * 0.8,
                onComplete: () => beam.destroy() });
            // Heal number (green, floats up)
            const healNum = scene.add.text(player.x + (Math.random()-0.5)*30, player.y - 25,
                '+' + Math.round(healAmt), {
                    font: 'bold 16px monospace', fill: '#00ff88',
                    stroke: '#004422', strokeThickness: 3
                }).setDepth(20).setOrigin(0.5);
            scene.tweens.add({ targets: healNum, y: healNum.y - 35, alpha: 0, duration: 700,
                onComplete: () => healNum.destroy() });
        });
    }

    const totalDur = ticks * mod.tickDelay + 200;
    scene.time.delayedCall(totalDur, () => {
        repairDrone.destroy();
        rdFollow.remove();
    });
    lastModTime = time;
}

function activateEMP(scene, time) {
    sndEMP();
    // Expanding ring visual
    const ring = scene.add.circle(player.x, player.y, 10, 0x00ffff, 0.2)
        .setStrokeStyle(2, 0x00ffff)
        .setDepth(12);
    scene.tweens.add({
        targets: ring,
        radius: WEAPONS.emp.radius,
        alpha: 0,
        duration: WEAPONS.emp.empSpeed,
        onComplete: () => ring.destroy()
    });

    // Stun nearby enemies
    enemies.getChildren().forEach(enemy => {
        const _empRad  = WEAPONS.emp.radius  * (_perkState.empAmplifier ? 1.30 : 1.0);
    const _empAmpMult = (typeof hasUniqueEffect === 'function' && hasUniqueEffect('modAmplify')) ? 1.5 : 1;
    const _gearModEffMult = 1 + ((_gearState?.modEffPct || 0) / 100);
    const _empStun = WEAPONS.emp.stunTime * (_perkState.empAmplifier ? 1.40 : 1.0) * _empAmpMult * _gearModEffMult;
    if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < _empRad) {
            enemy.isStunned = true;
            if (enemy.visuals?.setStrokeStyle) enemy.visuals.setStrokeStyle(4, 0x00ffff);

            scene.time.delayedCall(_empStun, () => {
                enemy.isStunned = false;
                enemy.body.setImmovable(false);
                if (enemy.visuals?.setStrokeStyle) enemy.visuals.setStrokeStyle(2, 0xffffff);
            });
        }
    });

    lastModTime = time;
}

function activateRage(scene) {
    sndRage();
    isRageActive = true;
    _rageDmgMult = 1.15;
    refreshMechColor();
    const _gearModEffMult = 1 + ((_gearState?.modEffPct || 0) / 100);
    const _rageDur = WEAPONS.rage.rageTime * (typeof hasUniqueEffect === 'function' && hasUniqueEffect('modAmplify') ? 1.5 : 1) * (_perkState.rageDurMult || 1) * _gearModEffMult;
    scene.time.delayedCall(_rageDur, () => {
        isRageActive = false;
        _rageDmgMult = 1.0;
        refreshMechColor();
        lastModTime = GAME.scene.scenes[0].time.now;
    });
}

function activateShield(scene) {
    sndShieldActivate();
    isShieldActive = true;
    // Meltdown Core: spike 60 AoE at 250px on activation
    if (_perkState.meltdownCore) {
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const _mds = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
            if (_mds < 250) {
                damageEnemy(e, 60, 0, true);
                showDamageText(scene, e.x, e.y, 60);
            }
        });
        const ring = scene.add.circle(player.x, player.y, 10, 0xff4400, 0.3).setStrokeStyle(2, 0xff6600).setDepth(12);
        scene.tweens.add({ targets: ring, radius: 250, alpha: 0, duration: 400, onComplete: () => ring.destroy() });
    }
    // Thorns Protocol: reflect damage to attackers while shield is up — handled in processPlayerDamage
    // Capacitor Armor: tracked in processPlayerDamage
    const _gearModEffMult = 1 + ((_gearState?.modEffPct || 0) / 100);
    const _barrierDur = WEAPONS.barrier.shieldTime * (typeof hasUniqueEffect === 'function' && hasUniqueEffect('modAmplify') ? 1.5 : 1) * _gearModEffMult;
    scene.time.delayedCall(_barrierDur, () => {
        isShieldActive = false;
        sndShieldDeactivate();
        lastModTime = GAME.scene.scenes[0].time.now;
    });
}

function activateJump(scene) {
    sndJump();
    isJumping = true;
    // Afterleg augment: +50% jump distance
    const jSpeedMult = (loadout.leg === 'afterleg' && _perkState.legSystemActive) ? 1.5 : 1.0;
    const jumpSpd = WEAPONS.jump.jumpSpeed * (_perkState.jumpSpeedMult||1) * jSpeedMult;
    scene.physics.velocityFromRotation(player.rotation, jumpSpd, player.body.velocity);
    const _jumpBaseScale = CHASSIS[loadout.chassis]?.scale || 1.0;
    scene.tweens.add({
        targets: [torso],
        scaleX: _jumpBaseScale * 1.2,
        scaleY: _jumpBaseScale * 1.2,
        duration: WEAPONS.jump.airTime,
        yoyo: true,
        onComplete: () => {
            if (torso?.active) torso.setScale(_jumpBaseScale);
            isJumping = false;
            lastModTime = GAME.scene.scenes[0].time.now;
            // Restore jump charges
            if (_perkState.jumpCharges > 1) _perkState._jumpChargesLeft = _perkState.jumpCharges;
            // Neural Accelerator: 3s 2× damage window after landing
            if (_perkState.neuralAccel) {
                _perkState._neuralAccelActive = true;
                clearTimeout(_perkState._neuralAccelTimer);
                _perkState._neuralAccelTimer = setTimeout(() => { _perkState._neuralAccelActive = false; }, 3000);
            }
            // Phantom Protocol: 3s window — next shot is 4× + pierce
            if (_perkState.phantomProtocol) {
                _perkState._phantomActive = true;
                _perkState._phantomShotReady = true;
                clearTimeout(_perkState._phantomTimer);
                _perkState._phantomTimer = setTimeout(() => {
                    _perkState._phantomActive = false;
                    _perkState._phantomShotReady = false;
                }, 3000);
            }
            // ── SLAM LANDING DAMAGE ──────────────────────────────
            const slamDmg = (WEAPONS.jump.slamDmg || 40) + (_perkState.jumpSlam || 0);
            const slamR   = (loadout.leg === 'afterleg' && _perkState.legSystemActive)
                ? (WEAPONS.jump.slamRadius||120) * 1.5
                : (WEAPONS.jump.slamRadius||120);
            // Visual shockwave ring
            const ring = scene.add.circle(player.x, player.y, 10, 0xffaa00, 0.3)
                .setStrokeStyle(2, 0xffaa00).setDepth(12);
            scene.tweens.add({ targets: ring, radius: slamR, alpha: 0, duration: 350, onComplete: () => ring.destroy() });
            // Damage enemies in slam radius
            enemies.getChildren().forEach(e => {
                if (!e.active) return;
                const dist = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
                if (dist < slamR) damageEnemy(e, slamDmg * (1 - dist/slamR));
            });
            // Kinetic Landing: bonus damage to enemies within 80px
            if (_perkState.kineticLanding > 0) {
                enemies.getChildren().forEach(e => {
                    if (!e.active) return;
                    const kd = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
                    if (kd < 80) {
                        const kDmg = Math.round((40 + Math.min(80, jumpSpd / 15)) * _perkState.kineticLanding);
                        damageEnemy(e, kDmg);
                        showDamageText(scene, e.x, e.y - 20, kDmg);
                    }
                });
            }
        }
    });
}

// ═══════════ AUGMENTS AND LEGS ═══════════

function applyAugment() {
    if (!loadout.aug || loadout.aug === 'none') return;
    switch (loadout.aug) {
        case 'overclock_cpu':
            // 12% reduction on all reloads and cooldowns — baked into multipliers
            _perkState.reloadMult = (_perkState.reloadMult||1) * 0.88;
            break;
        case 'target_painter':    _perkState.targetPainter = true; break;
        case 'threat_analyzer':   _perkState.threatAnalyzer = true; break;
        case 'reactive_plating':  _perkState.reactivePlating = true; break;
        // ── Drone Commander augments ──
        case 'multi_drone':       _perkState.multiDrone = true; break;
        // ── Ghost Assassin augments ──
        case 'ballistic_weave':   _perkState.ballisticWeave = true; break;
        case 'neural_accel':      _perkState.neuralAccel = true; break;
        // ── Inferno Wall augments ──
        case 'thermal_core':      _perkState.thermalCore = true; break;
        // ── MEDIUM CHASSIS UNIQUE ──────────────────────────────────
        case 'field_processor':   _perkState.fieldProcessor = true; break;
        // ── HEAVY CHASSIS UNIQUE ───────────────────────────────────
        case 'war_machine':       _perkState.warMachine     = true; break;
        case 'suppressor_aura':   _perkState.suppressorAura = true; break;
        // ── HEAVY WEAPON MASTERY ──────────────────────────────────
        case 'heavy_loader':
            _perkState.heavyLoader = true;
            _perkState.reloadMult  = (_perkState.reloadMult || 1) * 0.80;
            break;
    }
}

// ── Apply leg system passive effects on deploy ───────────────────
function applyLegSystem() {
    if (!loadout.leg || loadout.leg === 'none') return;
    switch (loadout.leg) {
        case 'hydraulic_boost':
            _perkState.speedMult = (_perkState.speedMult||1) * 1.20;
            break;
        case 'gyro_stabilizer':
            // Handled in movement — no leg speed penalty applied
            break;
        case 'mag_anchors':
            // Handled in update loop — stat changes when player still
            break;
        case 'afterleg':
            // Handled in activateJump — extended distance
            break;
        case 'mine_layer':
            _perkState.mineLayerTimer = 0;
            break;
        case 'featherweight':
            // +15% reload speed (via reloadMult) + +10% speed (via speedMult)
            _perkState.reloadMult = (_perkState.reloadMult || 1) * 0.85;
            _perkState.speedMult  = (_perkState.speedMult  || 1) * 1.10;
            break;
        case 'ghost_legs':
            // Passive: speed burst on taking damage — handled in processPlayerDamage
            break;
        case 'sprint_boosters':
            // Double-tap handled in input detection
            break;
        case 'jump_jets':
            // Only reachable on light chassis (where jump mod is available)
            _perkState.jumpCharges = (_perkState.jumpCharges || 1) + 1;
            _perkState._jumpChargesLeft = _perkState.jumpCharges;
            break;
        case 'seismic_dampener':
        case 'reactor_legs':
        case 'tremor_legs':
        case 'suppressor_legs':
            // Handled in update loop
            break;
        case 'warlord_stride':
            // Passive: speed/dmg when legs healthy — handled in update loop
            break;
    }
}

// ═══════════ DRONE HELPERS ═══════════

function _spawnDrone(scene, offsetX, offsetY, isAuto) {
    const mod = WEAPONS.atk_drone;
    const fireDelay  = mod.droneReload;
    const droneHP    = 0; // invincible timer-based
    const droneColor = isAuto ? 0x00ffcc : 0xffaa00;

    let droneX = (player?.x || 400) + (offsetX || 0);
    let droneY = (player?.y || 300) + (offsetY || -60);
    const drone = _buildDroneGraphic(scene, droneX, droneY, droneColor);
    drone._hp = droneHP > 0 ? droneHP : 9999;
    // Hardened Frame: drone takes less damage
    drone._armorMult = 1 - Math.min(0.80, _perkState.droneArmor || 0);
    // Mark so enemy bullets can damage it (for Autonomous Unit)
    if (isAuto) drone._isAutoDrone = true;

    const followEvent = scene.time.addEvent({ delay: 16, loop: true, callback: () => {
        if (!drone.active || !player?.active) return;
        const side = (offsetX > 0) ? 1 : -1;
        const targetX = player.x + Math.sin(scene.time.now * 0.002) * 25 + side * Math.abs(offsetX || 0) * 0.5;
        const targetY = player.y - 55 + Math.cos(scene.time.now * 0.003) * 10;
        droneX += (targetX - droneX) * 0.08;
        droneY += (targetY - droneY) * 0.08;
        drone._drawDrone(droneX, droneY);
        // Shield indicator if low HP
        if (isAuto && drone._hp < 20) drone._drawDrone(droneX, droneY, 0xff4400);
    }});

    const droneTicker = scene.time.addEvent({ delay: fireDelay, loop: true, callback: () => {
        if (!drone.active || !enemies || !player?.active) return;
        let target = null;
        const DRONE_RANGE = 550;
        let nearDist = DRONE_RANGE;
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const d = Phaser.Math.Distance.Between(droneX, droneY, e.x, e.y);
            if (d < nearDist) { nearDist = d; target = e; }
        });
        if (target) {
            const baseDmg = mod.droneDmg;
            const uplink  = 1 + (_perkState.droneUplink || 0);
            const overw   = 1 + (_perkState.overwatchStacks > 0 ? (_perkState.overwatchKills || 0) * 0.20 * _perkState.overwatchStacks : 0);
            const dmg     = Math.round(baseDmg * uplink * overw);
            damageEnemy(target, dmg, 0);
            showDamageText(scene, target.x, target.y, dmg);
            const zap = scene.add.graphics().setDepth(13);
            zap.lineStyle(2, droneColor, 0.9);
            zap.lineBetween(droneX, droneY, target.x, target.y);
            scene.tweens.add({ targets: zap, alpha: 0, duration: 100, onComplete: () => zap.destroy() });
            // Drone fire sound — quiet electric zap (throttled: dual-drone can fire twice per second)
            if (_canPlay('drone_fire', 150)) {
                _tone(1800, 'square', 0.04, 0.025, 900);
                _noise(0.03, 0.04, 0, 1200, 0);
            }
            drone._drawDrone(droneX, droneY, 0xffffff);
            scene.time.delayedCall(80, () => { if (drone.active) drone._drawDrone(droneX, droneY); });
        }
    }});

    // Neural Link: reload boost while drone is active
    if (_perkState.neuralLink > 0) {
        _perkState.reloadMult = (_perkState.reloadMult || 1) * (1 - _perkState.neuralLink);
    }

    function destroyDrone() {
        if (!drone.active) return;
        drone.destroy(); droneTicker.remove(); followEvent.remove();
        // Neural Link: remove reload boost
        if (_perkState.neuralLink > 0) {
            _perkState.reloadMult = (_perkState.reloadMult || 1) / (1 - _perkState.neuralLink);
        }
        if (isAuto) {
            _perkState._autoDroneActive = false;
            // Respawn after 12s (kills reduce timer via swarmLogic)
            const respawnMs = 12000;
            _perkState._autoDroneRespawnTimer = scene.time.delayedCall(respawnMs, () => {
                if (isDeployed && _roundActive && !_perkState._autoDroneActive)
                    activateAutoDrone(scene);
            });
            // Flash destroyed indicator
            const flash = scene.add.circle(droneX, droneY, 20, 0xff0000, 0.6).setDepth(15);
            scene.tweens.add({ targets: flash, alpha: 0, scale: 2, duration: 400, onComplete: () => flash.destroy() });
        } else {
            _perkState._droneActive = false;
            lastModTime = scene.time.now;
        }
    }

    // Duration-based destroy (non-auto) or HP-based (auto)
    if (!isAuto) {
        scene.time.delayedCall(mod.droneDuration, destroyDrone);
    } else {
        // Auto drone: destroyed by HP (bullet collisions tracked externally)
        drone._destroyDrone = destroyDrone;
    }

    return drone;
}

function _buildDroneGraphic(scene, x, y, color) {
    // Redesigned: angular square combat drone with sensor array and weapon pod
    const g = scene.add.graphics().setDepth(14);
    const drawDrone = (gx, gy, tint) => {
        g.clear();
        const c = tint || color;
        const dark = 0x0a0a12;
        // === Main body — square chassis ===
        g.fillStyle(dark, 1);
        g.fillRect(gx-9, gy-9, 18, 18);
        g.fillStyle(c, 0.88);
        g.fillRect(gx-8, gy-8, 16, 16);
        // Inner panel detail
        g.fillStyle(dark, 0.6);
        g.fillRect(gx-5, gy-5, 10, 10);
        // Corner cut detail (diagonal trim top-left and bottom-right)
        g.fillStyle(dark, 1);
        g.fillTriangle(gx-8, gy-8, gx-4, gy-8, gx-8, gy-4);
        g.fillTriangle(gx+8, gy+8, gx+4, gy+8, gx+8, gy+4);
        // === Sensor eye — front center ===
        g.fillStyle(0xffffff, 0.95);
        g.fillRect(gx+2, gy-2, 6, 4);
        g.fillStyle(c, 1);
        g.fillRect(gx+3, gy-1, 4, 2);
        // === Weapon pod — bottom protrusion ===
        g.fillStyle(dark, 1);
        g.fillRect(gx-3, gy+8, 6, 5);
        g.fillStyle(c, 0.7);
        g.fillRect(gx-2, gy+9, 4, 3);
        // === Rotor arms — four short diagonal struts ===
        g.lineStyle(1.5, c, 0.7);
        g.lineBetween(gx-8, gy-8,  gx-14, gy-14);
        g.lineBetween(gx+8, gy-8,  gx+14, gy-14);
        g.lineBetween(gx-8, gy+8,  gx-14, gy+14);
        g.lineBetween(gx+8, gy+8,  gx+14, gy+14);
        // Rotor hubs
        g.fillStyle(c, 0.9);
        g.fillCircle(gx-14, gy-14, 3);
        g.fillCircle(gx+14, gy-14, 3);
        g.fillCircle(gx-14, gy+14, 3);
        g.fillCircle(gx+14, gy+14, 3);
        // Glow halo (faint)
        g.lineStyle(1, c, 0.18);
        g.strokeRect(gx-11, gy-11, 22, 22);
    };
    drawDrone(x, y);
    g._drawDrone = drawDrone;
    return g;
}

function activateAutoDrone(scene) {
    if (_perkState._autoDroneActive || !isDeployed) return;
    _perkState._autoDroneActive = true;
    if (_perkState.multiDrone) {
        // Two auto-drones spread apart — left and right flanks
        _spawnDrone(scene, -45, -55, true);
        const drone = _spawnDrone(scene,  45, -55, true);
        _perkState._autoDroneRef = drone; // track right one for HP-based destroy
    } else {
        const drone = _spawnDrone(scene, 0, -62, true);
        _perkState._autoDroneRef = drone;
    }
}

function activateEnemyMod(scene, enemy, mod, time) {
    enemy.isModActive = true;
    enemy.lastModTime = time;

    switch (mod) {
        case 'jump': {
            // Lunge toward player — lock AI movement so velocity isn't overwritten
            const jSpeed = WEAPONS.jump.jumpSpeed;
            const jAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            enemy.isJumping = true;
            scene.physics.velocityFromRotation(jAngle, jSpeed, enemy.body.velocity);
            // Scale pulse like player jump
            const baseScaleX = enemy.visuals.scaleX;
            const baseScaleY = enemy.visuals.scaleY;
            scene.tweens.add({
                targets: [enemy.visuals, enemy.torso],
                scaleX: baseScaleX + 0.2,
                scaleY: baseScaleY + 0.2,
                duration: WEAPONS.jump.airTime,
                yoyo: true,
                onComplete: () => {
                    enemy.isJumping = false;
                    enemy.isModActive = false;
                    enemy.lastModTime = scene.time.now; // cooldown starts after jump ends
                }
            });
            break;
        }
        case 'barrier': {
            // Temporarily immune to damage — mirrors player shield exactly
            enemy.isShielded = true;
            const shieldRadius = 72 * (CHASSIS[enemy.loadout.chassis]?.scale || 1);
            const sr = scene.add.circle(enemy.x, enemy.y, shieldRadius, 0x00ffff, 0.15)
                .setStrokeStyle(2, 0x00ffff).setDepth(7);
            enemy.shieldRing = sr;
            scene.time.delayedCall(WEAPONS.barrier.shieldTime, () => {
                if (sr?.active) sr.destroy();
                enemy.shieldRing = null;
                enemy.isShielded = false;
                enemy.isModActive = false;
                enemy.lastModTime = scene.time.now; // cooldown starts after shield ends
            });
            break;
        }
        case 'rage': {
            // Speed and fire-rate boost, tint red
            const origSpeed = enemy.speed;
            enemy.speed *= 1.6;
            if (enemy.torso) enemy.torso.list?.forEach(s => s.setTint?.(0xff2200));
            scene.time.delayedCall(WEAPONS.rage.rageTime, () => {
                enemy.speed = origSpeed;
                if (enemy.torso) enemy.torso.list?.forEach(s => s.clearTint?.());
                enemy.isModActive = false;
                enemy.lastModTime = scene.time.now; // cooldown starts after rage ends
            });
            break;
        }
        case 'emp': {
            sndEMP();
            const ring = scene.add.circle(enemy.x, enemy.y, 10, 0xff6600, 0.2)
                .setStrokeStyle(2, 0xff6600).setDepth(12);
            scene.tweens.add({ targets: ring, radius: WEAPONS.emp.radius, alpha: 0,
                duration: WEAPONS.emp.empSpeed,
                onComplete: () => { ring.destroy(); enemy.isModActive = false; }
            });
            if (player && Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y) < WEAPONS.emp.radius) {
                scene.cameras.main.shake(300, 0.005);
                player.body.setVelocity(0, 0);
            }
            enemy.lastModTime = scene.time.now;
            break;
        }
        case 'repair': {
            // Self-repair: heal most-damaged component
            if (enemy.comp) {
                let worst = null, worstPct = Infinity;
                Object.entries(enemy.comp).forEach(([k,c]) => {
                    const pct = c.hp / c.max;
                    if (pct < worstPct) { worstPct = pct; worst = k; }
                });
                if (worst) {
                    const heal = Math.round(enemy.comp[worst].max * 0.30);
                    for (let t = 0; t < 4; t++) {
                        scene.time.delayedCall(t * 400, () => {
                            if (!enemy.active) return;
                            enemy.comp[worst].hp = Math.min(enemy.comp[worst].max, enemy.comp[worst].hp + heal/4);
                            enemy.health = Object.values(enemy.comp).reduce((s,c)=>s+c.hp, 0);
                            const healTxt = scene.add.text(enemy.x, enemy.y - 28 - t*10, `+${Math.round(heal/4)}`, {
                                font: 'bold 11px Courier New', fill: '#00ff88', stroke:'#000', strokeThickness:2
                            }).setOrigin(0.5).setDepth(20);
                            scene.tweens.add({ targets: healTxt, y: healTxt.y - 18, alpha: 0, duration: 600, onComplete: () => healTxt.destroy() });
                        });
                    }
                }
            }
            scene.time.delayedCall(WEAPONS.repair.cooldown * 0.4, () => { enemy.isModActive = false; });
            enemy.lastModTime = scene.time.now;
            break;
        }
        case 'missile': case 'atk_drone': {
            // Missile/drone: fire 3 fast projectiles at player
            const mCount = mod === 'missile' ? 3 : 2;
            for (let i = 0; i < mCount; i++) {
                scene.time.delayedCall(i * 250, () => {
                    if (!enemy.active || !player?.active) return;
                    const mAng = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y) + (Math.random()-0.5)*0.3;
                    const m = scene.add.circle(enemy.x, enemy.y, 5, 0xff4400).setDepth(14);
                    scene.physics.add.existing(m);
                    m.body.setAllowGravity(false);
                    m.damageValue = WEAPONS.missile?.missileDmg || 55;
                    enemyBullets.add(m);
                    scene.physics.velocityFromRotation(mAng, 900, m.body.velocity);
                    scene.time.delayedCall(1800, () => { if (m.active) m.destroy(); });
                });
            }
            scene.time.delayedCall(1500, () => { enemy.isModActive = false; });
            enemy.lastModTime = scene.time.now;
            break;
        }
        case 'decoy': {
            // Decoy: enemy briefly stands still with visual flash, then moves again
            const origSpeed = enemy.speed;
            enemy.speed = 0;
            const flash = scene.add.circle(enemy.x, enemy.y, 40, 0x00ffff, 0.25).setDepth(9);
            scene.tweens.add({ targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 600,
                onComplete: () => flash.destroy() });
            scene.time.delayedCall(WEAPONS.decoy.decoyDuration * 0.5, () => {
                enemy.speed = origSpeed;
                enemy.isModActive = false;
            });
            enemy.lastModTime = scene.time.now;
            break;
        }
    }
}

function activateFortressMode(scene, time) {
    if (!player?.active) return;
    _perkState._fortressMode = true;
    _perkState._fortressDR = 0.30; // 30% DR
    const _fTick = scene.time.addEvent({ delay: 200, loop: true, callback: () => {
        if (!_perkState._fortressMode || !player?.comp?.core) { _fTick.remove(); return; }
        player.comp.core.hp = Math.min(player.comp.core.max, player.comp.core.hp + Math.round(1 * (1 + (_perkState.fmHeal || 0)))); // 5 HP/s base; fmHeal perk scales this
        updateHUD();
    }});
    const _gearModEffMult = 1 + ((_gearState?.modEffPct || 0) / 100);
    const _fmDur = WEAPONS.fortress_mode.modeTime * (typeof hasUniqueEffect === 'function' && hasUniqueEffect('modAmplify') ? 1.5 : 1) * _gearModEffMult;
    scene.time.delayedCall(_fmDur, () => {
        _perkState._fortressMode = false;
        _perkState._fortressDR = 0;
        _fTick.remove();
    });
    lastModTime = time;
    sndBarrier?.();
}


function activateGhostStep(scene, time) {
    if (!player?.active) return;
    _perkState._ghostStepActive = true;
    // Make player sprite semi-transparent
    if (torso) torso.setAlpha(0.15);
    const _gearModEffMult = 1 + ((_gearState?.modEffPct || 0) / 100);
    const _gsCloakDur = WEAPONS.ghost_step.cloakTime * (typeof hasUniqueEffect === 'function' && hasUniqueEffect('modAmplify') ? 1.5 : 1) * _gearModEffMult;
    const _gTimer = scene.time.delayedCall(_gsCloakDur, () => {
        _perkState._ghostStepActive = false;
        if (torso?.active) torso.setAlpha(1);
    });
    // End early if player fires (checked in handlePlayerFiring)
    lastModTime = time;
    sndEMP?.();
}

function activateMod(scene, time) {
    // Blueprint Core: spawn temporary cover wall on any mod activation
    if (typeof spawnModCover === 'function') spawnModCover(scene);
    // Core Reactor: mod activation damage pulse
    if (typeof triggerCoreOverload === 'function') triggerCoreOverload(scene);
    switch (loadout.cpu) {
        case 'jump':      activateJump(scene);           break;
        case 'barrier':   activateShield(scene);         break;
        case 'rage':      activateRage(scene);           break;
        case 'emp':       activateEMP(scene, time);      break;
        case 'repair':    activateRepair(scene, time);   break;
        case 'atk_drone':
            // Block manual activation when Autonomous Unit legendary is active
            if (_perkState.autonomousUnit) return;
            activateDrone(scene, time);
            break;
        case 'missile':   activateMissiles(scene, time); break;
        case 'decoy':     activateDecoy(scene, time);    break;
        case 'ghost_step':    activateGhostStep(scene, time);   break;
        case 'fortress_mode': activateFortressMode(scene, time); break;
    }
}
