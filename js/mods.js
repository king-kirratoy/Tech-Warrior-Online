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
    let decoyFireTimer = 0;
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
        if (!weapon || weapon.twoHanded || weapon.explosive) return; // skip heavy/explosive for safety
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
            const [partName, part] = parts[0];
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
    refreshMechColor();
    const _gearModEffMult = 1 + ((_gearState?.modEffPct || 0) / 100);
    const _rageDur = WEAPONS.rage.rageTime * (typeof hasUniqueEffect === 'function' && hasUniqueEffect('modAmplify') ? 1.5 : 1) * (_perkState.rageDurMult || 1) * _gearModEffMult;
    scene.time.delayedCall(_rageDur, () => {
        isRageActive = false;
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

function activateMod(scene, time) {
    // Blueprint Core: spawn temporary cover wall on any mod activation
    if (typeof spawnModCover === 'function') spawnModCover(scene);
    // Core Reactor: mod activation damage pulse
    if (typeof triggerCoreOverload === 'function') triggerCoreOverload(scene);
    switch (loadout.mod) {
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
        case 'overclock_burst': activateOverclockBurst(scene, time); break;
        case 'fortress_mode': activateFortressMode(scene, time); break;
    }
}
