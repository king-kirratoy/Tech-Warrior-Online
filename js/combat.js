// ═══════════ FIRING FUNCTIONS ═══════════

function fire(scene, side) {
    if (!isDeployed || isJumping || _isPaused) return;

    const now   = scene.time.now;
    const wKey  = side === 'L' ? loadout.L : loadout.R;
    if (!wKey || wKey === 'none') return;

    const weapon = WEAPONS[wKey];
    if (!weapon) return;

    const _lightReloadMult = loadout.chassis === 'light' ? (CHASSIS.light.passiveReloadBonus || 0.80) : 1.0;
    // Single-arm brace bonus: when the other arm is empty, this arm gets +15% reload speed
    const _otherArm = side === 'L' ? loadout.R : loadout.L;
    const _braceMult = (!_otherArm || _otherArm === 'none') && !WEAPONS[loadout.L]?.twoHanded ? 0.85 : 1.0;
    const _gearReloadMult = 1 - ((_gearState?.reloadPct || 0) / 100);
    const _dualReloadMult = 1 - (typeof getDualReloadBonus === 'function' ? getDualReloadBonus() : 0);
    const reloadActual = ((isRageActive || isAmmoActive) ? weapon.reload * 0.5 : weapon.reload)
        * (_perkState.reloadMult || 1) * _gearReloadMult * _dualReloadMult * _lightReloadMult * _braceMult
        * (_perkState._overclockBurst ? 0.75 : 1.0);
    const lastFired    = side === 'L' ? reloadL : reloadR;
    if (now < lastFired) return;

    // ── Chaingun spin-up ─────────────────────────────────────────────
    if (wKey === 'chain') {
        const spinUp = weapon.spinUp || 1500;
        if (!_chaingunSpinStart) {
            _chaingunSpinStart = now;
            _chaingunReady = false;
            // Show spin-up indicator
            const scene2 = GAME.scene.scenes[0];
            const spinTxt = scene2.add.text(torso.x, torso.y - 40, '◎ SPINNING UP', {
                font: 'bold 13px monospace', fill: '#ffcc00',
                stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(20);
            scene2.tweens.add({ targets: spinTxt, y: spinTxt.y - 20, alpha: 0,
                duration: spinUp, onComplete: () => spinTxt.destroy() });
        }
        if (!_chaingunReady) {
            if (now - _chaingunSpinStart >= spinUp) {
                _chaingunReady = true;
            } else {
                return; // still spinning up
            }
        }
    } else {
        // Reset chaingun state when firing anything else
        _chaingunSpinStart = 0;
        _chaingunReady = false;
    }
    _shotsFired++; // only count shots that actually fire (after all guards)

    // ── Single-arm brace damage bonus ────────────────────────────────
    // When the other arm is empty (and not a 2H weapon), +25% damage per shot
    const _braceOther = side === 'L' ? loadout.R : loadout.L;
    const _braceDmgMult = (!_braceOther || _braceOther === 'none') && !WEAPONS[loadout.L]?.twoHanded ? 1.25 : 1.0;

    // ── Dual-fire damage penalty ─────────────────────────────────────
    // When same weapon in both arms (dual-wield), each arm deals 15% less damage
    const _isDualWield = loadout.L === loadout.R && loadout.L !== 'none' && !WEAPONS[loadout.L]?.twoHanded;
    const _dualWieldMult = _isDualWield ? 0.85 : 1.0;

    // ── Arm-offset origin ────────────────────────────────────────────
    // Bullets spawn from the arm that holds the weapon, not the torso center.
    // torso.rotation faces the mouse cursor.
    // Left arm: perpendicular left  (rotation - PI/2)
    // Right arm: perpendicular right (rotation + PI/2)
    const barrelDist    = loadout.chassis === 'light' ? 25 : loadout.chassis === 'medium' ? 32 : 40;
    const armSideOffset = loadout.chassis === 'light' ? 12 : loadout.chassis === 'medium' ? 26 : 42;
    const perpSign      = side === 'L' ? -1 : 1;  // L = left of forward, R = right
    // Shoulder position: offset perpendicular to facing direction
    const perpAngle = torso.rotation + perpSign * Math.PI / 2;
    const armOx = torso.x + Math.cos(perpAngle) * armSideOffset;
    const armOy = torso.y + Math.sin(perpAngle) * armSideOffset;
    // Aim angle FROM arm origin TOWARD mouse cursor (so shots converge on target)
    const mx = scene.input.activePointer.worldX;
    const my = scene.input.activePointer.worldY;
    const aimAngle = Math.atan2(my - armOy, mx - armOx);

    if (wKey === 'fth')  {
        fireFTH(scene, weapon, side, barrelDist, armOx, armOy, aimAngle);
        if (typeof mpBroadcastBullet === 'function' && _mpMatchActive) mpBroadcastBullet(armOx, armOy, aimAngle, wKey, weapon.dmg * (_perkState.dmgMult||1), side);
        return;
    }
    if (wKey === 'rail') {
        fireRAIL(scene, weapon, side, barrelDist, armOx, armOy, aimAngle);
        if (typeof mpBroadcastBullet === 'function' && _mpMatchActive) mpBroadcastBullet(armOx, armOy, aimAngle, wKey, weapon.dmg * (_perkState.dmgMult||1), side);
        return;
    }

    // Flash the weapon slot
    const slotEl = document.getElementById('slot-' + side);
    if (slotEl) {
        slotEl.classList.add('active-firing');
        scene.time.delayedCall(100, () => slotEl.classList.remove('active-firing'));
    }

    // Dispatch to correct fire mode
    sndFire(wKey);
    // Apply brace and perk damage multipliers to weapon for this shot
    let _overchargeActive = false;
    if (_perkState.overchargeRounds > 0) {
        _perkState._shotCounter = (_perkState._shotCounter || 0) + 1;
        if (_perkState._shotCounter >= 5 * _perkState.overchargeRounds) {
            _perkState._shotCounter = 0;
            _overchargeActive = true;
        }
    }
    // BR Marksman: bonus on first shot from full reload
    let _brMarksmanBonus = 1.0;
    if (_perkState.brMarksman > 0 && wKey === 'br') {
        const _reload = side === 'L' ? reloadL : reloadR;
        if (_reload <= 0) _brMarksmanBonus = 1 + _perkState.brMarksman;
    }
    // MG Tracer: every 5th bullet +50% damage
    let _mgTracerBonus = 1.0;
    if (_perkState.mgTracer && wKey === 'mg') {
        _perkState._mgShotCount = (_perkState._mgShotCount || 0) + 1;
        if (_perkState._mgShotCount % 5 === 0) _mgTracerBonus = 1.5;
    }
    // Build-specific multipliers
    const _neuralMult  = (_perkState._neuralAccelActive && _perkState.neuralAccel) ? 2.0 : 1.0;
    const _phantomMult = _perkState._phantomShotReady ? 4.0 : 1.0;
    // Targeting Scope: SR/RAIL +15% per 200px to cursor
    let _scopeMult = 1.0;
    if (_perkState.targetingScope && (wKey === 'sr' || wKey === 'rail')) {
        const _tsDist = Phaser.Math.Distance.Between(torso.x, torso.y,
            scene.input.activePointer.worldX, scene.input.activePointer.worldY);
        _scopeMult = 1 + (_tsDist / 200) * 0.15;
    }
    // Penetrator: SR +20% per 200px
    let _penetratorMult = 1.0;
    if (_perkState.penetrator > 0 && wKey === 'sr') {
        const _pDist = Phaser.Math.Distance.Between(torso.x, torso.y,
            scene.input.activePointer.worldX, scene.input.activePointer.worldY);
        _penetratorMult = 1 + (_pDist / 200) * _perkState.penetrator;
    }
    // Consume Phantom shot
    if (_perkState._phantomShotReady) {
        _perkState._phantomShotReady = false;
        _perkState._phantomActive = false;
        clearTimeout(_perkState._phantomTimer);
    }
    // Consume Snap Charge
    if (wKey === 'rail' && _perkState._snapChargeReady) {
        _perkState._snapChargeReady = false;
    }
    const _capBonus = (_perkState._capacitorReady) ? 1.25 : 1.0;
    if (_perkState._capacitorReady) _perkState._capacitorReady = false;
    const _gearDmgFlat = (_gearState?.dmgFlat || 0);
    const _gearDmgPct  = 1 + ((_gearState?.dmgPct || 0) / 100);
    const _colossusMult = (typeof getColossusDmgMult === 'function') ? getColossusDmgMult() : 1.0;
    const _effectiveDmg = Math.round(((weapon.dmg || 0) + _gearDmgFlat) * _gearDmgPct * _braceDmgMult * _dualWieldMult * (_overchargeActive ? 3 : 1) * _brMarksmanBonus * _mgTracerBonus * _neuralMult * _phantomMult * _scopeMult * _penetratorMult * _capBonus * _colossusMult);
    // Apply gear splash radius bonus to explosion weapons (GL, RL, PLSM, siege).
    const _gearSplashMult = 1 + ((_gearState?.splashRadius || 0) / 100);
    const _wEff = Object.assign({}, weapon, {
        dmg: _effectiveDmg,
        ...(weapon.radius ? { radius: Math.round(weapon.radius * _gearSplashMult) } : {})
    });
    // Phantom: mark all bullets from this shot as piercing
    if (_phantomMult > 1) _wEff._phantomPierce = true;
    // Ballistic Weave: bullets ignore 20% of shield
    if (_perkState.ballisticWeave) _wEff._shieldPierce = 0.20;
    const _fireOnce = () => {
        switch (wKey) {
            case 'gl':    fireGL(scene, _wEff, armOx, armOy, aimAngle);   break;
            case 'rl':    fireRL(scene, _wEff, barrelDist, armOx, armOy, aimAngle); break;
            case 'siege': fireSIEGE(scene, _wEff, barrelDist, armOx, armOy, aimAngle); break;
            case 'chain': fireStandard(scene, wKey, _wEff, barrelDist, armOx, armOy, aimAngle); break;
            case 'sg':    fireSG(scene, _wEff, barrelDist, armOx, armOy, aimAngle); break;
            case 'plsm':  firePLSM(scene, _wEff, armOx, armOy, aimAngle); break;
            case 'sr':    fireSR(scene, _wEff, barrelDist, armOx, armOy, aimAngle); break;
            default:      fireStandard(scene, wKey, _wEff, barrelDist, armOx, armOy, aimAngle); break;
        }
    };
    _fireOnce();
    // PVP: broadcast bullet to other players
    if (typeof mpBroadcastBullet === 'function' && _mpMatchActive) {
        mpBroadcastBullet(armOx, armOy, aimAngle, wKey, _effectiveDmg, side);
    }
    // Razor Edge: every 3rd shot fires a bonus duplicate
    if (typeof checkDoubleStrike === 'function' && checkDoubleStrike()) {
        scene.time.delayedCall(50, _fireOnce);
    }

    if (side === 'L') reloadL = now + reloadActual;
    else              reloadR = now + reloadActual;
}

// ── Individual fire modes ─────────────────────────────────────────

function fireFTH(scene, weapon, side, barrelDist, armOx, armOy, aimAngle) {
    armOx = armOx ?? torso.x; armOy = armOy ?? torso.y;
    const angle = aimAngle ?? Math.atan2(
        scene.input.activePointer.worldY - torso.y,
        scene.input.activePointer.worldX - torso.x
    );
    const _fuelBoost = _perkState.fuelInjector ? 1.40 : 1.0;
    const maxRange = (weapon.range || 350) * (1 + (_perkState.fthRange||0)) * _fuelBoost;
    const _coneWidthMult = 1 + (_perkState.fthCone || 0);
    const coneSteps = _perkState.fuelInjector ? 4 : 2;
    const coneAngleStep = 0.055 * _coneWidthMult;
    const dmg = Math.round(weapon.dmg);
    for (let i = -coneSteps; i <= coneSteps; i++) {
        const a = angle + i * coneAngleStep + (Math.random()-0.5)*0.06;
        const bx = armOx + Math.cos(a) * barrelDist;
        const by = armOy + Math.sin(a) * barrelDist;
        const b = scene.add.circle(bx, by, weapon.bulletSize, 0xff6600);
        scene.physics.add.existing(b);
        b.damageValue = dmg;
        b._flame = true;
        bullets.add(b);
        scene.physics.velocityFromRotation(a, weapon.speed, b.body.velocity);
        b.setDepth(11);
        // Fade out and destroy when out of range
        const startX = bx, startY = by;
        const lifeMs = (maxRange / weapon.speed) * 1000;
        scene.tweens.add({ targets: b, alpha: 0.3, duration: lifeMs });
        scene.time.delayedCall(lifeMs, () => {
            if (b?.active) {
                // Napalm Strike: leave burning patch at final position
                if (_perkState.napalmStrike && i === 0) {
                    const patch = scene.add.circle(b.x, b.y, 22, 0xff4400, 0.35).setDepth(10);
                    scene.tweens.add({ targets: patch, alpha: 0, duration: 3000, onComplete: () => patch.destroy() });
                    const _patchTimer = scene.time.addEvent({ delay: 400, repeat: 7, callback: () => {
                        if (!isDeployed) return;
                        enemies.getChildren().forEach(e => {
                            if (!e.active) return;
                            const pd = Phaser.Math.Distance.Between(b.x, b.y, e.x, e.y);
                            if (pd < 30) damageEnemy(e, 8, 0);
                        });
                    }});
                }
                b.destroy();
            }
        });
    }
    sndFire('fth');
    const reloadTime = Math.round(weapon.reload * (_perkState.reloadMult||1));
    if (side === 'L') reloadL = scene.time.now + reloadTime;
    else              reloadR = scene.time.now + reloadTime;
}

function fireRAIL(scene, weapon, side, barrelDist, armOx, armOy, aimAngle) {
    // Railgun: instant hitscan beam piercing all enemies in line
    armOx = armOx ?? torso.x; armOy = armOy ?? torso.y;
    const angle = aimAngle ?? Math.atan2(
        scene.input.activePointer.worldY - torso.y,
        scene.input.activePointer.worldX - torso.x
    );
    const ox = armOx + Math.cos(angle) * barrelDist;
    const oy = armOy + Math.sin(angle) * barrelDist;
    let rayLen = 900;

    // Shorten rail beam at first building/cover obstruction
    if (coverObjects) {
        const _railSteps = 20;
        for (let _rsi = 1; _rsi <= _railSteps; _rsi++) {
            const _rst = _rsi / _railSteps;
            const _rsx = ox + Math.cos(angle) * rayLen * _rst;
            const _rsy = oy + Math.sin(angle) * rayLen * _rst;
            let _blocked = false;
            coverObjects.getChildren().forEach(c => {
                if (!c.active || _blocked) return;
                const cx = c.coverCX !== undefined ? c.coverCX : c.x + (c.width||60)/2;
                const cy = c.coverCY !== undefined ? c.coverCY : c.y + (c.height||60)/2;
                const hw = (c.width||60)/2, hh = (c.height||60)/2;
                if (_rsx > cx - hw && _rsx < cx + hw && _rsy > cy - hh && _rsy < cy + hh) _blocked = true;
            });
            if (_blocked) { rayLen = rayLen * (_rst - 1/_railSteps); break; }
        }
    }

    const ex = ox + Math.cos(angle) * rayLen;
    const ey = oy + Math.sin(angle) * rayLen;

    // Draw rail beam — outer glow + bright core
    const beam = scene.add.graphics().setDepth(15);
    beam.lineStyle(6, 0x00ffff, 0.4);
    beam.lineBetween(ox, oy, ex, ey);
    beam.lineStyle(2, 0xffffff, 1.0);
    beam.lineBetween(ox, oy, ex, ey);
    scene.tweens.add({ targets: beam, alpha: 0, duration: 220, onComplete: () => beam.destroy() });

    // Hitscan: check each enemy using point-to-line distance
    const dmg = Math.round(weapon.dmg);
    let hitCount = 0;
    enemies.getChildren().forEach(e => {
        if (!e.active) return;
        const dx = ex - ox, dy = ey - oy;
        const lenSq = dx*dx + dy*dy;
        let t = ((e.x - ox)*dx + (e.y - oy)*dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const nearX = ox + t*dx;
        const nearY = oy + t*dy;
        const dist = Phaser.Math.Distance.Between(nearX, nearY, e.x, e.y);
        if (dist < 32) {
            damageEnemy(e, dmg, angle);
            showDamageText(scene, e.x, e.y, dmg);
            hitCount++;
            const flash = scene.add.circle(e.x, e.y, 12, 0x00ffff, 0.8).setDepth(15);
            scene.tweens.add({ targets: flash, alpha: 0, radius: 28, duration: 150, onComplete: () => flash.destroy() });
        }
    });
    if (hitCount > 0) _shotsHit += hitCount;

    sndFire('sr'); // Use sniper sound for now
    scene.cameras.main.shake(80, 0.006);

    const reloadTime = Math.round(weapon.reload * (_perkState.reloadMult||1));
    if (side === 'L') reloadL = scene.time.now + reloadTime;
    else              reloadR = scene.time.now + reloadTime;
}

function fireGL(scene, weapon, armOx, armOy, aimAngle) {
    armOx = armOx ?? torso.x; armOy = armOy ?? torso.y; aimAngle = aimAngle ?? torso.rotation;
    const targetX = scene.input.activePointer.worldX;
    const targetY = scene.input.activePointer.worldY;
    const distance = Phaser.Math.Distance.Between(armOx, armOy, targetX, targetY);

    const ball = scene.add.circle(armOx, armOy, 10, 0xffaa00)
        .setStrokeStyle(2, 0xffffff)
        .setDepth(14);
    scene.physics.add.existing(ball);
    scene.physics.velocityFromRotation(aimAngle, distance * 2, ball.body.velocity);
    ball.body.setDrag(distance * 2);

    const fuseTime  = 2000;
    let fuseStarted = false;
    let startTime   = 0;

    const timerText = scene.add.text(ball.x, ball.y - 20, '2.0', {
        font: 'bold 14px monospace', fill: '#ffff00'
    }).setOrigin(0.5).setDepth(15).setVisible(false);

    const timerEvent = scene.time.addEvent({
        delay: 50,
        loop: true,
        callback: () => {
            if (!ball.active) { timerText.destroy(); timerEvent.destroy(); return; }
            timerText.setPosition(ball.x, ball.y - 20);

            if (!fuseStarted && ball.body.velocity.length() < 20) {
                fuseStarted = true;
                startTime   = scene.time.now;
                timerText.setVisible(true);
                scene.time.delayedCall(fuseTime, () => {
                    if (ball.active) { createExplosion(scene, ball.x, ball.y, 100, weapon.dmg); ball.destroy(); timerText.destroy(); }
                });
            }

            if (fuseStarted) {
                const remaining = Math.max(0, (fuseTime - (scene.time.now - startTime)) / 1000);
                timerText.setText(remaining.toFixed(1));
                if (remaining < 0.5) timerText.setFill(scene.time.now % 200 < 100 ? '#ffffff' : '#ff0000');
            }
        }
    });
}

function fireRL(scene, weapon, barrelDist, armOx, armOy, aimAngle) {
    armOx = armOx ?? torso.x; armOy = armOy ?? torso.y; aimAngle = aimAngle ?? torso.rotation;
    createMuzzleFlash(scene, armOx, armOy, aimAngle, barrelDist);
    const rocket = scene.add.rectangle(armOx, armOy, 24, 10, 0xff4400).setDepth(14);
    scene.physics.add.existing(rocket);
    rocket.setRotation(aimAngle);
    scene.physics.velocityFromRotation(aimAngle, weapon.speed, rocket.body.velocity);

    const particles = scene.add.particles(0, 0, 'smoke', {
        speed: 20, scale: { start: 0.6, end: 0 }, alpha: { start: 0.5, end: 0 },
        lifespan: 400, frequency: 20, blendMode: 'ADD', follow: rocket
    }).setDepth(13);

    // Store overlap reference — Phaser does not remove it automatically when rocket is destroyed.
    const rlOverlap = scene.physics.add.overlap(rocket, enemies, (r) => {
        rlOverlap.destroy();
        createExplosion(scene, r.x, r.y, 80, weapon.dmg);
        particles.stop();
        scene.time.delayedCall(400, () => particles.destroy());
        r.destroy();
    });

    scene.time.delayedCall(2000, () => {
        if (rocket.active) { rlOverlap.destroy(); particles.stop(); scene.time.delayedCall(400, () => particles.destroy()); rocket.destroy(); }
    });
}

function fireSIEGE(scene, weapon, barrelDist, armOx, armOy, aimAngle) {
    armOx = armOx ?? torso.x; armOy = armOy ?? torso.y; aimAngle = aimAngle ?? torso.rotation;
    // Massive slow cannonball — screen shake on fire, huge explosion on impact
    scene.cameras.main.shake(200, 0.018);
    createMuzzleFlash(scene, armOx, armOy, aimAngle, barrelDist + 10, 0xff6600);
    const ball = scene.add.circle(armOx, armOy, 16, 0xff4400)
        .setStrokeStyle(3, 0xffaa00).setDepth(14).setAlpha(0.9);
    scene.physics.add.existing(ball);
    ball.damageValue = weapon.dmg;
    bullets.add(ball);
    scene.physics.velocityFromRotation(aimAngle, weapon.speed || 600, ball.body.velocity);
    // Pulsing glow while in flight — store tween to stop it on any destroy path
    const siegeBallTween = scene.tweens.add({ targets: ball, alpha: 0.6, scaleX: 1.3, scaleY: 1.3,
        duration: 200, yoyo: true, repeat: -1 });
    ball.once('destroy', () => siegeBallTween.stop());
    // Impact: massive explosion — store overlap to destroy it when ball is gone.
    const siegeOverlap = scene.physics.add.overlap(ball, enemies, (b) => {
        siegeOverlap.destroy();
        const radius = weapon.radius || 160;
        createExplosion(scene, b.x, b.y, radius, weapon.dmg);
        scene.cameras.main.shake(350, 0.03);
        b.destroy();
    });
    scene.time.delayedCall(3000, () => { if (ball.active) { siegeOverlap.destroy(); ball.destroy(); } });
}

function fireSG(scene, weapon, barrelDist, armOx, armOy, aimAngle) {
    armOx = armOx ?? torso.x; armOy = armOy ?? torso.y; aimAngle = aimAngle ?? torso.rotation;
    const spread = 0.3;
    const _totalPellets = weapon.pellets + (_perkState.sgFlechette || 0) + (_gearState?.pellets || 0);
    for (let i = 0; i < _totalPellets; i++) {
        const offset = (Math.random() - 0.5) * spread;
        const b = scene.add.circle(armOx, armOy, weapon.bulletSize, 0xffff00);
        createMuzzleFlash(scene, armOx, armOy, aimAngle + offset, barrelDist);
        scene.physics.add.existing(b);
        b.damageValue = weapon.dmg;
        bullets.add(b);
        scene.physics.velocityFromRotation(aimAngle + offset, weapon.speed, b.body.velocity);
        scene.time.delayedCall(800, () => { if (b.active) b.destroy(); });
    }
}

function firePLSM(scene, weapon, armOx, armOy, aimAngle) {
    armOx = armOx ?? torso.x; armOy = armOy ?? torso.y; aimAngle = aimAngle ?? torso.rotation;
    const p = scene.add.circle(armOx, armOy, 25, 0x00ffff).setAlpha(0.8);
    scene.physics.add.existing(p);
    p.damageValue = weapon.dmg;
    bullets.add(p);
    scene.physics.velocityFromRotation(aimAngle, 300, p.body.velocity);
    const plsmTween = scene.tweens.add({ targets: p, alpha: 0.3, duration: 100, yoyo: true, repeat: -1 });
    p.once('destroy', () => plsmTween.stop());
    scene.time.delayedCall(3000, () => { if (p.active) p.destroy(); });
}

function fireSR(scene, weapon, barrelDist, armOx, armOy, aimAngle) {
    armOx = armOx ?? torso.x; armOy = armOy ?? torso.y; aimAngle = aimAngle ?? torso.rotation;
    const b = scene.add.rectangle(armOx, armOy, 60, 8, 0xffffff)
        .setOrigin(0.5)
        .setRotation(aimAngle)
        .setStrokeStyle(2, 0x00ffff);
    scene.physics.add.existing(b);
    const _srSpd = player?.body ? Math.sqrt(player.body.velocity.x**2 + player.body.velocity.y**2) : 999;
    const _srBreathBonus = (_perkState.srBreath > 0 && _srSpd < 10) ? (1 + _perkState.srBreath) : 1.0;
    b.damageValue = Math.round(weapon.dmg * _srBreathBonus);
    bullets.add(b);
    scene.physics.velocityFromRotation(aimAngle, weapon.speed, b.body.velocity);
    const srTween = scene.tweens.add({ targets: b, scaleY: 0.5, duration: 50, yoyo: true, repeat: -1 });
    b.once('destroy', () => srTween.stop());
    createMuzzleFlash(scene, armOx, armOy, aimAngle, barrelDist, 0xffffff);

    // Fading tracer line
    const tracer = scene.add.line(0, 0, armOx, armOy, armOx, armOy, 0x00ffff)
        .setOrigin(0, 0).setLineWidth(2).setAlpha(0.6);
    scene.tweens.add({
        targets: tracer, alpha: 0, duration: 500,
        onUpdate:   () => { if (b.active) tracer.setTo(armOx, armOy, b.x, b.y); },
        onComplete: () => tracer.destroy()
    });

    // Camera kick & recoil
    scene.cameras.main.shake(150, 0.015);
    player.body.velocity.x -= Math.cos(torso.rotation) * 400;
    player.body.velocity.y -= Math.sin(torso.rotation) * 400;
    scene.time.delayedCall(2000, () => { if (b.active) b.destroy(); });
}

function fireStandard(scene, wKey, weapon, barrelDist, armOx, armOy, aimAngle) {
    armOx = armOx ?? torso.x; armOy = armOy ?? torso.y; aimAngle = aimAngle ?? torso.rotation;
    const fireRound = (offsetAngle = 0) => {
        const b = scene.add.circle(armOx, armOy, weapon.bulletSize, 0xffff00);
        scene.physics.add.existing(b);
        b.damageValue    = weapon.dmg;
        b.shieldPierce   = weapon.shieldPierce || false;
        b.rangeDropoff   = weapon.rangeDropoff || 0;
        b.travelDist     = 0;
        b._originX       = armOx;
        b._originY       = armOy;
        bullets.add(b);
        scene.physics.velocityFromRotation(aimAngle + offsetAngle, weapon.speed, b.body.velocity);
        createMuzzleFlash(scene, armOx, armOy, aimAngle + offsetAngle, barrelDist);
        scene.time.delayedCall(2000, () => { if (b.active) b.destroy(); });
    };

    if (wKey === 'br') {
        for (let i = 0; i < weapon.burst; i++) {
            scene.time.delayedCall(i * 60, () => fireRound(0));
        }
    } else {
        fireRound(0);
    }

    if (wKey === 'hr') {
        player.body.velocity.x -= Math.cos(torso.rotation) * 150;
        player.body.velocity.y -= Math.sin(torso.rotation) * 150;
        scene.cameras.main.shake(100, 0.005);
    }
}
