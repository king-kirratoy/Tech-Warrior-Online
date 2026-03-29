// ═══════════ FIRING FUNCTIONS ═══════════

// ── Siphon beam module state ──────────────────────────────────────
// Per-arm slow tracking sets. Dual-arm: an enemy stays slowed if in either set.
let _siphonSlowedEnemiesL = new Set();
let _siphonSlowedEnemiesR = new Set();
// Per-arm Phaser Graphics objects for beam visuals (created once, reused every frame).
let _siphonGfxL = null;
let _siphonGfxR = null;
// Timestamp for throttling heal-number display (max once per 500ms).
let _siphonHealTextThrottle = 0;

function fire(scene, side) {
    if (!isDeployed || isJumping || _isPaused) return;

    const now   = scene.time.now;
    const wKey  = side === 'L' ? loadout.L : loadout.R;
    if (!wKey || wKey === 'none') return;

    const weapon = WEAPONS[wKey];
    if (!weapon) return;

    // ── Beam weapons (siphon) — bypass reload-mult calculations ──────────
    if (weapon.beam) {
        // Mark this arm as firing every frame the button is held (used by updateSiphonBeam)
        const _armOverheat = side === 'L' ? player._siphonOverheatL : player._siphonOverheatR;
        if (!_armOverheat) {
            if (side === 'L') player._siphonFiringL = true;
            else              player._siphonFiringR = true;
        }
        // Damage tick: fire only every weapon.fireRate ms
        const _beamLast = side === 'L' ? reloadL : reloadR;
        if (now >= _beamLast) {
            const _bd    = loadout.chassis === 'light' ? 25 : loadout.chassis === 'medium' ? 32 : 40;
            const _bSide = loadout.chassis === 'light' ? 12 : loadout.chassis === 'medium' ? 26 : 42;
            const _pSign = side === 'L' ? -1 : 1;
            const _pAngle = torso.rotation + _pSign * Math.PI / 2;
            const _bOx = torso.x + Math.cos(_pAngle) * _bSide;
            const _bOy = torso.y + Math.sin(_pAngle) * _bSide;
            const _bMx = scene.input.activePointer.worldX;
            const _bMy = scene.input.activePointer.worldY;
            const _bAim = Math.atan2(_bMy - _bOy, _bMx - _bOx);
            fireSIPHON(scene, weapon, side, _bd, _bOx, _bOy, _bAim);
            if (side === 'L') reloadL = now + weapon.fireRate;
            else              reloadR = now + weapon.fireRate;
        }
        return;
    }

    // Single-arm brace bonus: when the other arm is empty, this arm gets +15% reload speed
    const _otherArm = side === 'L' ? loadout.R : loadout.L;
    const _braceMult = (!_otherArm || _otherArm === 'none') ? 0.85 : 1.0;
    const _gearReloadMult = 1 - ((_gearState?.fireRatePct || 0) / 100);
    const _dualReloadMult = 1 - (typeof getDualReloadBonus === 'function' ? getDualReloadBonus() : 0);
    // ── Dual-Wield (Light trait): same weapon in both arms → −15% fire rate ──────
    const _isDualWield = loadout.chassis === 'light' && loadout.L === loadout.R && loadout.L !== 'none';
    const _dualWieldReloadMult = _isDualWield ? 1.15 : 1.0;
    const reloadActual = ((isRageActive || isAmmoActive) ? weapon.fireRate * 0.5 : weapon.fireRate)
        * (_perkState.reloadMult || 1) * _gearReloadMult * _dualReloadMult * _dualWieldReloadMult * _braceMult
        * (_perkState._overclockBurst ? 0.75 : 1.0);
    const lastFired    = side === 'L' ? reloadL : reloadR;
    if (now < lastFired) return;

    _shotsFired++; // only count shots that actually fire (after all guards)

    // ── Single-arm brace damage bonus ────────────────────────────────
    // When the other arm is empty, +25% damage per shot
    const _braceOther = side === 'L' ? loadout.R : loadout.L;
    const _braceDmgMult = (!_braceOther || _braceOther === 'none') ? 1.25 : 1.0;

    // ── Dual-Wield (Light trait): same weapon in both arms → −15% damage per arm ─
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
    // SR Penetrator: SR +20% per 200px
    let _penetratorMult = 1.0;
    if (_perkState.srPenetrator > 0 && wKey === 'sr') {
        const _pDist = Phaser.Math.Distance.Between(torso.x, torso.y,
            scene.input.activePointer.worldX, scene.input.activePointer.worldY);
        _penetratorMult = 1 + (_pDist / 200) * _perkState.srPenetrator;
    }
    // Consume Phantom shot
    if (_perkState._phantomShotReady) {
        _perkState._phantomShotReady = false;
        _perkState._phantomActive = false;
        clearTimeout(_perkState._phantomTimer);
    }
    // Consume Snap Charge
    if (wKey === 'rail' && _perkState._railSnapChargeReady) {
        _perkState._railSnapChargeReady = false;
    }
    const _gearDmgFlat = (_gearState?.dmgFlat || 0);
    const _gearDmgPct  = 1 + ((_gearState?.dmgPct || 0) / 100);
    const _colossusMult = (typeof getColossusDmgMult === 'function') ? getColossusDmgMult() : 1.0;
    const _effectiveDmg = Math.round(((weapon.dmg || 0) + _gearDmgFlat) * _gearDmgPct * _braceDmgMult * _dualWieldMult * (_overchargeActive ? 3 : 1) * _brMarksmanBonus * _mgTracerBonus * _neuralMult * _phantomMult * _penetratorMult * _colossusMult);
    // Apply gear splash radius bonus to explosion weapons (GL, RL, PLSM).
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
    const maxRange = (weapon.range || 350) * (1 + (_perkState.fthRange||0));
    const _coneWidthMult = 1 + (_perkState.fthCone || 0);
    const coneSteps = 2;
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
                if (_perkState.fthNapalmStrike && i === 0) {
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
    const reloadTime = Math.round(weapon.fireRate * (_perkState.reloadMult||1));
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

    const reloadTime = Math.round(weapon.fireRate * (_perkState.reloadMult||1));
    if (side === 'L') reloadL = scene.time.now + reloadTime;
    else              reloadR = scene.time.now + reloadTime;
}

// ── SIPHON beam firing ────────────────────────────────────────────
// Called every weapon.fireRate ms (100ms) while the fire button is held.
// Casts a ray from the arm origin, checks cover for truncation, then
// damages / slows / siphons HP from every enemy in the beam's width.
// Slow does NOT stack across both arms — an enemy hit by both beams is
// only slowed once. Heal DOES stack — each beam heals independently.
function fireSIPHON(scene, weapon, side, barrelDist, armOx, armOy, aimAngle) {
    const _overheat = side === 'L' ? player._siphonOverheatL : player._siphonOverheatR;
    if (_overheat) return;

    const ox = armOx + Math.cos(aimAngle) * barrelDist;
    const oy = armOy + Math.sin(aimAngle) * barrelDist;
    let rayLen = weapon.range;  // 280 px

    // Truncate ray at first cover obstruction (step-march — same technique as rail)
    if (coverObjects) {
        const steps = 20;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const tx = ox + Math.cos(aimAngle) * rayLen * t;
            const ty = oy + Math.sin(aimAngle) * rayLen * t;
            let blocked = false;
            coverObjects.getChildren().forEach(c => {
                if (!c.active || blocked) return;
                // Use center coords (coverCX/CY) per CLAUDE.md cover origin rule
                const cx = c.coverCX !== undefined ? c.coverCX : c.x + (c.width||60)/2;
                const cy = c.coverCY !== undefined ? c.coverCY : c.y + (c.height||60)/2;
                const hw = (c.width||60)/2, hh = (c.height||60)/2;
                if (tx > cx - hw && tx < cx + hw && ty > cy - hh && ty < cy + hh) blocked = true;
            });
            if (blocked) { rayLen = rayLen * ((i - 1) / steps); break; }
        }
    }

    const ex = ox + Math.cos(aimAngle) * rayLen;
    const ey = oy + Math.sin(aimAngle) * rayLen;

    // Store per-arm beam geometry for per-frame rendering in updateSiphonBeam
    if (side === 'L') player._siphonBeamRayLenL = rayLen;
    else              player._siphonBeamRayLenR  = rayLen;

    const dx = ex - ox, dy = ey - oy;
    const lenSq = dx*dx + dy*dy;
    const halfWidth = weapon.beamWidth / 2;  // 10 px
    const _newHitSet = new Set();
    let _siphonHealThisTick = 0;

    // Per-arm slow tracking: use this arm's set; other arm's set for cross-check
    const _mySlowSet    = side === 'L' ? _siphonSlowedEnemiesL : _siphonSlowedEnemiesR;
    const _otherSlowSet = side === 'L' ? _siphonSlowedEnemiesR : _siphonSlowedEnemiesL;

    enemies.getChildren().forEach(e => {
        if (!e.active || lenSq <= 0) return;
        // Point-to-segment distance
        let t = ((e.x - ox)*dx + (e.y - oy)*dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const nearX = ox + t*dx, nearY = oy + t*dy;
        const dist = Phaser.Math.Distance.Between(nearX, nearY, e.x, e.y);
        if (dist > halfWidth) return;

        // Damage per tick — noCrit=true (weapon.noCrit flag honoured via 6th param)
        damageEnemy(e, weapon.dmg, aimAngle, false, false, true);
        showDamageText(scene, e.x, e.y, weapon.dmg);
        _shotsHit++;

        // Apply slow (store original speed once on first application — no double-stack)
        if (!e._siphonSlowed) {
            e._siphonOrigSpeed = e.speed;
            e.speed = Math.max(1, Math.round(e.speed * (1 - weapon.slowPct)));
            e._siphonSlowed = true;
            e._slowed = true;
        }
        _newHitSet.add(e);

        // Siphon heal: siphonHpPerSec / 10 per 100ms tick (stacks from both arms)
        if (player?.comp?.core) {
            const _coreBefore = player.comp.core.hp;
            player.comp.core.hp = Math.min(player.comp.core.max, player.comp.core.hp + weapon.siphonHpPerSec / 10);
            player.hp = Object.values(player.comp).reduce((s, c) => s + c.hp, 0);
            _siphonHealThisTick += player.comp.core.hp - _coreBefore;
        }
    });

    // Frame-accurate slow cleanup: remove slow from enemies that left THIS arm's beam.
    // Only unslow if the OTHER arm is also not hitting this enemy (no double-slow removal).
    _mySlowSet.forEach(e => {
        if (!e.active || !_newHitSet.has(e)) {
            if (e.active && !_otherSlowSet.has(e)) {
                e.speed = e._siphonOrigSpeed !== undefined ? e._siphonOrigSpeed : e.speed;
                e._slowed = false;
                e._siphonSlowed = false;
                delete e._siphonOrigSpeed;
            }
            _mySlowSet.delete(e);
        }
    });
    _newHitSet.forEach(e => _mySlowSet.add(e));

    // TODO(pvp): siphon beam vs remote players not yet implemented for PVP mode.
    //            Apply slow + damageRemotePlayer() calls when PVP beam is added.

    if (_newHitSet.size > 0) { updateBars(); updatePaperDoll(); }

    // ── Green heal float above player ─────────────────────────────────
    const _now = scene.time.now;
    if (_siphonHealThisTick > 0 && _now - _siphonHealTextThrottle >= 500) {
        _siphonHealTextThrottle = _now;
        const _healAmt = Math.round(_siphonHealThisTick);
        const _htx = scene.add.text(player.x, player.y - 30, `+${_healAmt}`, {
            font: 'bold 18px monospace',
            fill: '#00ff88',
            stroke: '#003322',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(101);
        scene.tweens.add({
            targets: _htx, y: player.y - 110, alpha: 0,
            duration: 1000, ease: 'Cubic.easeOut',
            onComplete: () => _htx.destroy(),
        });
    }
}

// ── Per-frame siphon beam update ──────────────────────────────────
// Must be called once per frame BEFORE handlePlayerFiring() so that
// _siphonFiringL/R are reset before fire() potentially sets them again.
// Supports single-arm or dual-arm (light chassis) siphon independently.
function updateSiphonBeam(scene) {
    if (!player?.active || !isDeployed) {
        _siphonBeamHide();
        return;
    }
    if (loadout.L !== 'siphon' && loadout.R !== 'siphon') {
        // No siphon equipped — ensure any lingering slows are cleaned up
        if (_siphonSlowedEnemiesL.size > 0 || _siphonSlowedEnemiesR.size > 0) _clearAllSiphonSlows();
        _siphonBeamHide();
        return;
    }

    const weapon = WEAPONS.siphon;
    const dt = GAME.loop.delta;

    // Capture and reset per-arm firing flags (fire() sets them if button held this frame)
    const wasFiringL = player._siphonFiringL;
    const wasFiringR = player._siphonFiringR;
    player._siphonFiringL = false;
    player._siphonFiringR = false;

    // ── Per-arm heat: L ───────────────────────────────────────────
    if (loadout.L === 'siphon') {
        const prevOverheatL = player._siphonOverheatL;
        if (wasFiringL && !player._siphonOverheatL) {
            player._siphonHeatL = Math.min(weapon.heatMax,
                player._siphonHeatL + weapon.heatPerSec * (dt / 1000));
            if (player._siphonHeatL >= weapon.heatMax) {
                player._siphonOverheatL = true;
                player._siphonHeatL = weapon.heatMax;
                _clearSiphonSlows('L');
            }
        } else {
            player._siphonHeatL = Math.max(0,
                player._siphonHeatL - weapon.heatCoolPerSec * (dt / 1000));
            if (player._siphonOverheatL && player._siphonHeatL <= 0) player._siphonOverheatL = false;
            if (!wasFiringL && _siphonSlowedEnemiesL.size > 0) _clearSiphonSlows('L');
        }
        if (!prevOverheatL && player._siphonOverheatL) {
            if (typeof sndSiphonOverheat === 'function') sndSiphonOverheat();
            if (typeof sndSiphonBeamStop === 'function') sndSiphonBeamStop();
        }
    }

    // ── Per-arm heat: R ───────────────────────────────────────────
    if (loadout.R === 'siphon') {
        const prevOverheatR = player._siphonOverheatR;
        if (wasFiringR && !player._siphonOverheatR) {
            player._siphonHeatR = Math.min(weapon.heatMax,
                player._siphonHeatR + weapon.heatPerSec * (dt / 1000));
            if (player._siphonHeatR >= weapon.heatMax) {
                player._siphonOverheatR = true;
                player._siphonHeatR = weapon.heatMax;
                _clearSiphonSlows('R');
            }
        } else {
            player._siphonHeatR = Math.max(0,
                player._siphonHeatR - weapon.heatCoolPerSec * (dt / 1000));
            if (player._siphonOverheatR && player._siphonHeatR <= 0) player._siphonOverheatR = false;
            if (!wasFiringR && _siphonSlowedEnemiesR.size > 0) _clearSiphonSlows('R');
        }
        if (!prevOverheatR && player._siphonOverheatR) {
            if (typeof sndSiphonOverheat === 'function') sndSiphonOverheat();
            if (typeof sndSiphonBeamStop === 'function') sndSiphonBeamStop();
        }
    }

    // Heat fraction for audio: use whichever arm is hotter
    const heatFraction = Math.max(player._siphonHeatL || 0, player._siphonHeatR || 0) / weapon.heatMax;

    // ── Beam visual rendering ────────────────────────────────────────
    // Shared geometry constants
    const _bSide = loadout.chassis === 'light' ? 12 : loadout.chassis === 'medium' ? 26 : 42;
    const _bd    = loadout.chassis === 'light' ? 25 : loadout.chassis === 'medium' ? 32 : 40;
    const _bMx   = scene.input.activePointer.worldX;
    const _bMy   = scene.input.activePointer.worldY;

    // Ensure per-arm graphics objects exist
    if (!_siphonGfxL) _siphonGfxL = scene.add.graphics().setDepth(50);
    if (!_siphonGfxR) _siphonGfxR = scene.add.graphics().setDepth(50);

    let anyBeamVisible = false;

    // L arm beam
    if (loadout.L === 'siphon' && wasFiringL && !player._siphonOverheatL) {
        const _pAngle = torso.rotation + (-1) * Math.PI / 2;
        const _bOx   = torso.x + Math.cos(_pAngle) * _bSide;
        const _bOy   = torso.y + Math.sin(_pAngle) * _bSide;
        const _bAim  = Math.atan2(_bMy - _bOy, _bMx - _bOx);
        const _ox    = _bOx + Math.cos(_bAim) * _bd;
        const _oy    = _bOy + Math.sin(_bAim) * _bd;
        const _rayLen = player._siphonBeamRayLenL !== undefined ? player._siphonBeamRayLenL : weapon.range;
        _drawSiphonBeam(_siphonGfxL, _ox, _oy, _bAim, _rayLen);
        anyBeamVisible = true;
    } else {
        _siphonGfxL.clear();
        _siphonGfxL.setVisible(false);
    }

    // R arm beam
    if (loadout.R === 'siphon' && wasFiringR && !player._siphonOverheatR) {
        const _pAngle = torso.rotation + (1) * Math.PI / 2;
        const _bOx   = torso.x + Math.cos(_pAngle) * _bSide;
        const _bOy   = torso.y + Math.sin(_pAngle) * _bSide;
        const _bAim  = Math.atan2(_bMy - _bOy, _bMx - _bOx);
        const _ox    = _bOx + Math.cos(_bAim) * _bd;
        const _oy    = _bOy + Math.sin(_bAim) * _bd;
        const _rayLen = player._siphonBeamRayLenR !== undefined ? player._siphonBeamRayLenR : weapon.range;
        _drawSiphonBeam(_siphonGfxR, _ox, _oy, _bAim, _rayLen);
        anyBeamVisible = true;
    } else {
        _siphonGfxR.clear();
        _siphonGfxR.setVisible(false);
    }

    // ── Audio: start/update hum if any beam is active, stop if none ──
    if (anyBeamVisible) {
        if (typeof sndSiphonBeamStart === 'function') sndSiphonBeamStart(heatFraction);
        if (typeof sndSiphonBeamUpdate === 'function') sndSiphonBeamUpdate(heatFraction);
    } else {
        if (typeof sndSiphonBeamStop === 'function') sndSiphonBeamStop();
    }

    if (typeof updateSiphonHeatBar === 'function') updateSiphonHeatBar();
}

// ── Draw one siphon beam (3 layered lines: glow + core) ──────────
function _drawSiphonBeam(gfx, ox, oy, aimAngle, rayLen) {
    const ex = ox + Math.cos(aimAngle) * rayLen;
    const ey = oy + Math.sin(aimAngle) * rayLen;
    gfx.setVisible(true);
    gfx.clear();
    // Glow layer: wide, low alpha
    gfx.lineStyle(14, 0x00ff88, 0.22);
    gfx.beginPath();
    gfx.moveTo(ox, oy);
    gfx.lineTo(ex, ey);
    gfx.strokePath();
    // Mid glow
    gfx.lineStyle(9, 0x00ff88, 0.45);
    gfx.beginPath();
    gfx.moveTo(ox, oy);
    gfx.lineTo(ex, ey);
    gfx.strokePath();
    // Main beam
    gfx.lineStyle(6, 0x00ff88, 0.85);
    gfx.beginPath();
    gfx.moveTo(ox, oy);
    gfx.lineTo(ex, ey);
    gfx.strokePath();
}

// ── Hide and clear both siphon beam graphics ─────────────────────
function _siphonBeamHide() {
    if (_siphonGfxL) { _siphonGfxL.clear(); _siphonGfxL.setVisible(false); }
    if (_siphonGfxR) { _siphonGfxR.clear(); _siphonGfxR.setVisible(false); }
}

// ── Clear slows from a single arm's set ──────────────────────────
// Only actually unslows an enemy if the other arm is also not hitting it.
function _clearSiphonSlows(side) {
    const mySet    = side === 'L' ? _siphonSlowedEnemiesL : _siphonSlowedEnemiesR;
    const otherSet = side === 'L' ? _siphonSlowedEnemiesR : _siphonSlowedEnemiesL;
    mySet.forEach(e => {
        if (!otherSet.has(e)) {
            if (e.active) {
                e.speed = e._siphonOrigSpeed !== undefined ? e._siphonOrigSpeed : e.speed;
                e._slowed = false;
                e._siphonSlowed = false;
                delete e._siphonOrigSpeed;
            }
        }
    });
    mySet.clear();
}

function _clearAllSiphonSlows() {
    // Merge both sets and unslow everything
    const allSlowed = new Set([..._siphonSlowedEnemiesL, ..._siphonSlowedEnemiesR]);
    allSlowed.forEach(e => {
        if (e.active) {
            e.speed = e._siphonOrigSpeed !== undefined ? e._siphonOrigSpeed : e.speed;
            e._slowed = false;
            e._siphonSlowed = false;
            delete e._siphonOrigSpeed;
        }
    });
    _siphonSlowedEnemiesL.clear();
    _siphonSlowedEnemiesR.clear();
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
                    if (ball.active) { createExplosion(scene, ball.x, ball.y, 100, weapon.dmg, true); ball.destroy(); timerText.destroy(); }
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
        createExplosion(scene, r.x, r.y, 80, weapon.dmg, true);
        particles.stop();
        scene.time.delayedCall(400, () => particles.destroy());
        r.destroy();
    });

    scene.time.delayedCall(2000, () => {
        if (rocket.active) { rlOverlap.destroy(); particles.stop(); scene.time.delayedCall(400, () => particles.destroy()); rocket.destroy(); }
    });
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

// ═══════════ DAMAGE FUNCTIONS ═══════════

function processPlayerDamage(amt, bulletAngle, explosive = false) {
    if (!player?.active || player.isProcessingDamage) return;
    _lastPlayerDamageTime = GAME?.loop?.time || 0;
    if (isShieldActive) {
        return;
    }
    // Fortress Mode (Heavy mod): 30% DR while active
    if (_perkState._fortressDR > 0) amt = Math.round(amt * (1 - _perkState._fortressDR));
    // HEAVY Improved Armor (trait): 15% damage reduction always active
    if (loadout.chassis === 'heavy') amt = Math.round(amt * (1 - (CHASSIS.heavy.passiveDR || 0.15)));
    // HEAVY Attrition (trait): +15% DR when core HP is below 50%
    if (loadout.chassis === 'heavy' && player?.comp?.core && player.comp.core.max > 0) {
        if (player.comp.core.hp / player.comp.core.max < 0.5) amt = Math.round(amt * 0.85);
    }
    // Bulwark Shield: 12% DR always active (even when shield depleted)
    const _bwSys2 = SHIELD_SYSTEMS[loadout.shld];
    if (_bwSys2?.passiveDR) amt = Math.round(amt * (1 - _bwSys2.passiveDR));
    // Siege Shield: -20% damage while shield is up
    if (_bwSys2?.activeDR && player.shield > 0) amt = Math.round(amt * (1 - _bwSys2.activeDR));
    // Scrap Shield: absorb incoming damage after limb destruction
    if (_perkState._scrapAbsorb > 0) {
        const _absorbed = Math.min(_perkState._scrapAbsorb, amt);
        _perkState._scrapAbsorb -= _absorbed;
        amt -= _absorbed;
        if (amt <= 0) return;
    }
    // (Glass Step is handled below after isProcessingDamage is set)
    // Titan Core: cap single-hit damage to 30% of core max
    if (_perkState.heavyTitanCore && player?.comp?.core) {
        const cap = player.comp.core.max * 0.30;
        if (amt > cap) amt = cap;
    }
    // ── Unique item effects (damage reduction) ──
    // Frontal Aegis: attacks from front deal 40% less damage
    if (typeof applyFrontalAbsorb === 'function') amt = applyFrontalAbsorb(amt, bulletAngle);
    // Sentinel's Plating: +12% DR while shield is full
    if (typeof getShieldDRBonus === 'function') { const sdr = getShieldDRBonus(); if (sdr > 0) amt = Math.round(amt * (1 - sdr)); }
    // Impact Armor: +15% DR for 3s after heavy hit
    if (typeof getImpactArmorDR === 'function') { const iadr = getImpactArmorDR(); if (iadr > 0) amt = Math.round(amt * (1 - iadr)); }
    if (typeof checkImpactArmor === 'function') checkImpactArmor(amt);
    // Adaptive Armor: consecutive hits from same source deal less
    if (typeof getAdaptiveArmorDR === 'function') {
        const aaDR = getAdaptiveArmorDR(bulletAngle != null ? Math.round(bulletAngle * 10) : null);
        if (aaDR > 0) amt = Math.round(amt * (1 - aaDR));
    }
    // Colossus Stand: +10% DR while stationary
    if (typeof getColossusDR === 'function') { const cdr = getColossusDR(); if (cdr > 0) amt = Math.round(amt * (1 - cdr)); }
    // Matrix Barrier: invulnerability bubble
    if (typeof isMatrixBarrierActive === 'function' && isMatrixBarrierActive()) return;
    // Gear total DR
    const _totalDR = (_perkState.fortress || 0) + ((_gearState?.dr || 0) / 100);
    if (_totalDR > 0) amt = Math.round(amt * (1 - Math.min(0.75, _totalDR)));
    // Phantom dodge chance
    // Agility (Light trait): +10% dodge when exactly one arm has a weapon
    const _agilityDodge = (() => {
        if (loadout.chassis !== 'light') return 0;
        const _lFilled = loadout.L && loadout.L !== 'none';
        const _rFilled = loadout.R && loadout.R !== 'none';
        return (_lFilled !== _rFilled) ? 0.10 : 0;
    })();
    const _totalDodge = (_perkState.dodgeChance || 0) + ((_gearState?.dodgePct || 0) / 100) + _agilityDodge;
    if (_totalDodge > 0 && Math.random() < _totalDodge) {
        const scene = GAME.scene.scenes[0];
        const dodgeTxt = scene.add.text(player.x, player.y - 30, 'DODGE!', {
            font:'bold 18px monospace', fill:'#88ff88', stroke:'#000', strokeThickness:3
        }).setDepth(20);
        scene.tweens.add({ targets:dodgeTxt, y:dodgeTxt.y-30, alpha:0, duration:700, onComplete:()=>dodgeTxt.destroy() });
        return;
    }
    player.isProcessingDamage = true;
    sndPlayerHit();
    const now = GAME.scene.scenes[0].time.now;
    lastDamageTime = now;
    player.lastHitTime = now;

    _damageTaken += amt;
    // Campaign bonus objective: track core damage and HP threshold
    if (_gameMode === 'campaign' && typeof trackBonusObjective === 'function') {
        trackBonusObjective('no_core_damage', false);
        if (player?.comp?.core && player.comp.core.hp < player.comp.core.max * 0.25) {
            trackBonusObjective('hp_threshold', false);
        }
    }
    // Mag Anchors: -20% incoming damage while stationary
    if (_perkState._magAnchorsActive) amt *= 0.80;
    // Reactive Plating: each hit adds 5% DR, max 5 stacks
    if (_perkState.reactivePlating) {
        _perkState._reactivePlatingStacks = Math.min(5, (_perkState._reactivePlatingStacks||0) + 1);
        amt *= (1 - 0.05 * _perkState._reactivePlatingStacks);
    }
    // Last Stand: below 20% core, take 40% less
    if (_perkState.lastStand && player.comp.core.hp / player.comp.core.max < 0.20) amt *= 0.60;
    // Adaptive armor: grant 10% resistance for 4s
    if (_perkState.mediumAdaptiveArmor > 0 && !_perkState._adaptiveActive) {
        const _now2 = GAME.scene.scenes[0].time.now;
        _perkState._adaptiveActive = true;
        _perkState._adaptiveTimer = _now2 + 4000;
        _perkState.fortress += 0.10 * _perkState.mediumAdaptiveArmor;
    }
    if (explosive) {
        _applyExplosivePlayerDamage(amt);
        return;
    }
    // Weighted random hit — legs 35%, core 25%, lArm 20%, rArm 20%
    const _r = Math.random();
    let   target = _r < 0.35 ? 'legs' : _r < 0.60 ? 'core' : _r < 0.80 ? 'lArm' : 'rArm';

    let component = player.comp[target];
    // Redirect to core if limb is already destroyed
    if (component.hp <= 0 && target !== 'core') component = player.comp.core;

    // Passive shield absorbs a portion of damage (mechanics vary by shield type)
    if (player.maxShield > 0 && player.shield > 0) {
        const _shieldResult = _applyPassiveShieldAbsorption(amt);
        if (_shieldResult === null) return;
        amt = _shieldResult;
    }

    component.hp = Math.max(0, component.hp - amt);

    // Recalculate total HP from components
    player.hp = Object.values(player.comp).reduce((sum, c) => sum + c.hp, 0);

    // Limb destruction — disable weapon and mark broken regardless of loadout
    if (loadout.leg === 'hydraulic_boost' && _perkState.legSystemActive && target === 'legs')
        component.hp = Math.min(component.max, component.hp + amt * 0.15);
    if (player.comp.lArm.hp <= 0 && !_lArmDestroyed) {
        loadout.L = 'none'; _lArmDestroyed = true;
        updateHUD();
    }
    if (player.comp.rArm.hp <= 0 && !_rArmDestroyed) {
        loadout.R = 'none'; _rArmDestroyed = true;
        updateHUD();
    }

    updateBars();
    updatePaperDoll();

    // Death check — clear processing flag synchronously before death so
    // no stale delayedCall fires against a destroyed player object
    if (player.comp.core.hp <= 0) {
        player.isProcessingDamage = false;
        showDeathScreen();
    } else {
        // Still alive — re-enable damage processing after brief lock
        try {
            GAME.scene.scenes[0].time.delayedCall(50, () => {
                if (player) player.isProcessingDamage = false;
            });
        } catch(e) {
            // Fallback: use setTimeout if Phaser timer fails (prevents permanent damage lock)
            setTimeout(() => { if (player) player.isProcessingDamage = false; }, 60);
        }
    }
}

// ── processPlayerDamage sub-functions ───────────────────────────────────────────────────────────────

function _applyExplosivePlayerDamage(amt) {
    // Explosive: split evenly across all 4 parts
    const share = amt / 4;
    Object.values(player.comp).forEach(c => { c.hp = Math.max(0, c.hp - share); });
    player.hp = Object.values(player.comp).reduce((s,c) => s + c.hp, 0);
    updateBars(); updatePaperDoll();
    if (player.comp.lArm.hp <= 0 && !_lArmDestroyed) {
        loadout.L = 'none'; _lArmDestroyed = true; updateHUD();
        if (_perkState.scrapShield > 0) { _perkState._scrapAbsorb = (_perkState._scrapAbsorb||0) + _perkState.scrapShield; }
    }
    if (player.comp.rArm.hp <= 0 && !_rArmDestroyed) {
        loadout.R = 'none'; _rArmDestroyed = true; updateHUD();
        if (_perkState.scrapShield > 0) { _perkState._scrapAbsorb = (_perkState._scrapAbsorb||0) + _perkState.scrapShield; }
    }
    if (loadout.leg === 'hydraulic_boost' && _perkState.legSystemActive && player.comp.legs.hp > 0)
        player.comp.legs.hp = Math.min(player.comp.legs.max, player.comp.legs.hp + share * 0.15);
    if (player.comp.legs.hp <= 0 && !_legsDestroyed) { _legsDestroyed = true; player.comp.legs.hp = 0; _perkState.legSystemActive = false; updateHUD(); }
    // Iron Will: survive to 1 HP once per round
    if (player.comp.core.hp <= 0 && _perkState.heavyIronWill && !_perkState._heavyIronWillUsed) {
        player.comp.core.hp = 1;
        _perkState._heavyIronWillUsed = true;
        const _sc2 = GAME.scene.scenes[0];
        const iwTxt = _sc2.add.text(player.x, player.y - 40, 'IRON WILL!', {
            font:'bold 20px monospace', fill:'#ff8844', stroke:'#000', strokeThickness:3
        }).setDepth(20);
        _sc2.tweens.add({ targets:iwTxt, y:iwTxt.y-40, alpha:0, duration:1200, onComplete:()=>iwTxt.destroy() });
        updateBars(); updatePaperDoll();
    }
    if (player.comp.core.hp <= 0) {
        player.isProcessingDamage = false;
        showDeathScreen();
    } else {
        GAME.scene.scenes[0].time.delayedCall(50, () => { if (player) player.isProcessingDamage = false; });
    }
}

function _applyPassiveShieldAbsorption(amt) {
    const _ss = SHIELD_SYSTEMS[loadout.shld] || SHIELD_SYSTEMS.none;
    let absorb = player._shieldAbsorb ?? 0.50;

    // ── Flicker Shield: block every other hit entirely ──
    if (_ss.flickerBlock) {
        player._shieldFlickerHit = !player._shieldFlickerHit;
        if (player._shieldFlickerHit) { player.isProcessingDamage = false; return null; } // blocked hit
    }

    // ── Phase Shield: brief invuln on each hit ──
    if (_ss.phaseInvuln && !player._phaseInvulnActive) {
        player._phaseInvulnActive = true;
        const _sc = GAME.scene.scenes[0];
        _sc?.time.delayedCall(_ss.phaseInvuln * 1000, () => { player._phaseInvulnActive = false; });
    }
    if (player._phaseInvulnActive) { player.isProcessingDamage = false; return null; }

    // ── Adaptive Shield: scale absorb with consecutive hits (reset on regen) ──
    if (_ss.adaptiveMax) {
        player._shieldAdaptStack = Math.min(6, (player._shieldAdaptStack || 0) + 1);
        absorb = Math.min(_ss.adaptiveMax, 0.50 + player._shieldAdaptStack * 0.05);
    }

    // ── Mirror Shield: reflect 35% of absorbed damage back ──
    if (_ss.reflectPct && enemies) {
        const _reflected = amt * absorb * _ss.reflectPct;
        let _nearest = null, _nd = Infinity;
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const _d = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
            if (_d < _nd) { _nd = _d; _nearest = e; }
        });
        if (_nearest) {
            const _sc = GAME.scene.scenes[0];
            damageEnemy(_nearest, Math.round(_reflected), 0);
            if (_sc) showDamageText(_sc, _nearest.x, _nearest.y, Math.round(_reflected));
        }
    }

    // ── Counter Shield: charge on every hit ──
    if (_ss.counterCharge) {
        player._shieldCounterChg = (player._shieldCounterChg || 0) + amt * absorb;
    }

    // ── Layered Shield: drain Layer 1 first, then Layer 2 ──
    if (_ss.layered && player._shieldLayerHP) {
        const _lNow  = GAME.scene.scenes[0]?.time?.now || 0;
        const _l1Abs = Math.min(player._shieldLayerHP[0], amt);
        player._shieldLayerHP[0] -= _l1Abs;
        const _lRem  = amt - _l1Abs;
        const _l2Abs = Math.min(player._shieldLayerHP[1], _lRem);
        player._shieldLayerHP[1] -= _l2Abs;
        const _lSpill = _lRem - _l2Abs;
        if (_l1Abs > 0) player._layer1LastDamageTime = _lNow;
        if (_l2Abs > 0) player._layer2LastDamageTime = _lNow;
        const _lFloor = _perkState.shieldIndestructible ? 1 : 0;
        player.shield = Math.max(_lFloor, player._shieldLayerHP[0] + player._shieldLayerHP[1]);
        return _lSpill; // spillover beyond both layers passes to HP unchanged
    }

    const _prevShield = player.shield;
    const _shieldFloor = _perkState.shieldIndestructible ? 1 : 0;
    player.shield = Math.max(_shieldFloor, player.shield - amt * absorb);
    amt *= (1 - absorb);

    // ── On-break effects ──
    if (_prevShield > 0 && player.shield <= 0) {
        const _sc = GAME.scene.scenes[0];

        // Smoke Burst: speed burst on break
        if (_ss.breakSpeedBurst && player.body) {
            player._smokeBurstActive = true;
            player.body.maxVelocity = new Phaser.Math.Vector2(9999, 9999);
            _sc?.time.delayedCall(2000, () => { player._smokeBurstActive = false; });
        }

        // Pulse Shield: EMP on break
        if (_ss.breakEMP && enemies) {
            enemies.getChildren().forEach(e => {
                if (!e.active) return;
                if (Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y) < 250) {
                    e.isStunned = true;
                    e.body?.setVelocity(0, 0);
                    _sc?.time.delayedCall(1800, () => { if (e.active) e.isStunned = false; });
                }
            });
            if (_sc) createExplosion(_sc, player.x, player.y, 0, 0); // visual only
        }

        // Matrix Shield: invulnerability bubble on shield break
        if (typeof triggerMatrixBarrier === 'function') {
            if (triggerMatrixBarrier(_sc, _sc?.time?.now || Date.now())) {
                amt = 0; // remaining damage blocked by bubble
            }
        }

    }

    return amt; // return modified amt (caller updates its local variable)
}

function damageEnemy(e, amt, bulletAngle, explosive = false, bulletShieldPierce = false, noCrit = false) {
    if (!e.active || e.health <= 0) return;
    e._justHit = true; // alert AI — player may be behind vision cone
    // Swarm shared HP pool — damage goes to swarm state, not individual unit
    if (e._isSwarmUnit && e._swarmState) {
        const sw = e._swarmState;
        sw.hp -= amt;
        if (sw.hp <= 0) {
            sw.hp = 0;
            if (sw._onDefeat) sw._onDefeat();
            if (typeof sndBossDefeat === 'function') sndBossDefeat();
            window._activeSwarm = null;
            // Count as boss kill
            _roundKills = _roundTotal;
            _totalKills++;
            updateRoundHUD();
            // Drop boss loot
            const scene = GAME.scene.scenes[0];
            if (typeof spawnEquipmentLoot === 'function') {
                spawnEquipmentLoot(scene, e.x, e.y, { isBoss: true, bossType: 'swarm' });
            }
            if (typeof spawnScrapDrop === 'function') spawnScrapDrop(scene, e.x, e.y);
            // Spawn extraction point — onEnemyKilled is never called for swarm units
            _roundActive = false;
            if (enemyBullets) enemyBullets.getChildren().slice().forEach(b => { if (b?.active) b.destroy(); });
            // Destroy remaining swarm units with visual cleanup
            enemies?.getChildren().slice().forEach(u => {
                try { destroyEnemyWithCleanup(scene, u); } catch(ex) {}
            });
            _spawnExtractionPoint(scene);
            showRoundBanner('SWARM ELIMINATED', 'REACH EXTRACTION POINT', 2500, null);
        }
        return;
    }
    // Active barrier mod (full block)
    if (e.isShielded) {
        if (_perkState.armorPierce > 0) {
            amt = amt * Math.min(0.90, _perkState.armorPierce);
        } else { return; }
    }
    // Passive energy shield absorption
    if ((e.maxShield||0) > 0 && (e.shield||0) > 0 && !bulletShieldPierce) {
        const absorb = e._shieldAbsorb ?? 0.50;
        const _shieldBefore = e.shield;
        e.shield = Math.max(0, e.shield - amt * absorb);
        // Campaign bonus objective: shield break tracking
        if (_gameMode === 'campaign' && _shieldBefore > 0 && e.shield <= 0 && typeof trackBonusObjective === 'function') {
            trackBonusObjective('shield_break', 1);
        }
        amt *= (1 - absorb);
        e._lastDamageTime = GAME.scene.scenes[0].time.now;
    } else if ((e.shield||0) > 0 && bulletShieldPierce) {
        e._lastDamageTime = GAME.scene.scenes[0].time.now;
    }
    // Enemy Reactive Plating: stacking DR
    if (e._augState?.reactivePlatingStacks !== undefined) {
        e._augState.reactivePlatingStacks = Math.min(5, e._augState.reactivePlatingStacks + 1);
        amt *= (1 - 0.05 * e._augState.reactivePlatingStacks);
    }
    // Apply global dmg multiplier
    amt = amt * (_perkState.dmgMult || 1);
    // Hollow Point: +% damage to enemies below 50% HP
    if (_perkState.hollowPoint > 0 && e.health < (e.maxHealth || e.health) * 0.50)
        amt *= (1 + _perkState.hollowPoint);
    // Threat Scanner: +% damage to nearby enemies
    if (_perkState.threatScanner > 0) {
        const _tsd = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
        if (_tsd < 300) amt *= (1 + _perkState.threatScanner);
    }
    // Opportunist: +% damage to stunned/slowed enemies
    if (_perkState.opportunist > 0 && (e.isStunned || e._slowed)) amt *= (1 + _perkState.opportunist);
    // Pressure System: consecutive hits on same enemy
    if (_perkState.mediumPressureSystem > 0) {
        if (_perkState._pressureTarget === e) {
            _perkState._pressureStacks = Math.min(5, (_perkState._pressureStacks||0) + 1);
        } else {
            _perkState._pressureTarget = e;
            _perkState._pressureStacks = 1;
        }
        amt *= (1 + 0.05 * _perkState._pressureStacks * _perkState.mediumPressureSystem);
    }
    // Resonance: charge shield on hit
    if (_perkState.mediumResonance > 0 && player?.maxShield > 0) {
        player.shield = Math.min(player.maxShield, (player.shield||0) + _perkState.mediumResonance);
    }
    // (Hollow Point and Threat Scanner already applied above — removed duplicate)
    // Fire Discipline: +dmg while not moving
    if (_perkState.fireDiscipline > 0 && player?.body) {
        const _fdSpeed = Math.sqrt(player.body.velocity.x**2 + player.body.velocity.y**2);
        if (_fdSpeed < 15) amt *= (1 + _perkState.fireDiscipline);
    }
    // Target Painter: painted enemy takes +20% damage
    if (_perkState.targetPainter && _perkState._paintedEnemy === e) amt *= 1.20;
    // Per-enemy damage multiplier (Threat Analyzer debuff)
    if (e._dmgMult) amt *= e._dmgMult;
    // Elite modifier damage handling (enforcer shield gate, shielded overshield, cloak DR)
    if (typeof handleEliteDamage === 'function' && (e.isElite || e.enemyType)) {
        amt = handleEliteDamage(e, amt);
        if (amt <= 0) return;
    }
    // Enemy chassis passive DR (heavy: 15%)
    if (e._passiveDR > 0) amt *= (1 - e._passiveDR);
    // Enemy Mag Anchors: 20% DR while stationary
    if (e._magAnchorsActive) amt *= 0.80;
    // Battle rhythm bonus
    if (_perkState._battleRhythmBonus > 0) amt *= (1 + _perkState._battleRhythmBonus);
    // Mag Anchors: +20% outgoing damage while stationary
    if (_perkState._magAnchorsActive) amt *= 1.20;
    // Critical hit — skipped when noCrit flag is set (e.g. siphon beam)
    const _totalCrit = (_perkState.critChance || 0) + ((_gearState?.critChance || 0) / 100);
    if (!explosive && !noCrit && _totalCrit > 0 && Math.random() < _totalCrit) {
        // Base crit = 2× damage. _gearState.critDmg adds extra multiplier (e.g. +15 → 2.15×).
        const _critMult = 2 + ((_gearState?.critDmg || 0) / 100);
        amt *= _critMult;
        const scene = GAME.scene.scenes[0];
        const critTxt = scene.add.text(e.x, e.y - 25, 'CRIT!', {
            font:'bold 16px monospace', fill:'#ffff00', stroke:'#000', strokeThickness:3
        }).setDepth(20);
        scene.tweens.add({ targets:critTxt, y:critTxt.y-30, alpha:0, duration:600, onComplete:()=>critTxt.destroy() });
    }
    if (!e.comp) { e.health -= amt; }
    else if (explosive) {
        e.lastDamageWasExplosive = true;
        const share = amt / 4;
        Object.values(e.comp).forEach(c => { c.hp = Math.max(0, c.hp - share); });
        e.health = Object.values(e.comp).reduce((s,c) => s + c.hp, 0);
        updateEnemyDoll(e);
    } else {
        // Weighted random hit — legs 35%, core 25%, lArm 20%, rArm 20%
        const _er = Math.random();
        let target = _er < 0.35 ? 'legs' : _er < 0.60 ? 'core' : _er < 0.80 ? 'lArm' : 'rArm';
        if (e.comp[target].hp <= 0 && target !== 'core') target = 'core';
        e.comp[target].hp = Math.max(0, e.comp[target].hp - amt);
        e.health = Object.values(e.comp).reduce((s,c) => s + c.hp, 0);
        updateEnemyDoll(e);
        // Campaign bonus objective: limb/head destroy tracking
        if (_gameMode === 'campaign' && e.comp[target].hp <= 0 && typeof trackBonusObjective === 'function') {
            trackBonusObjective('limb_destroy', 1);
            if (target === 'head') trackBonusObjective('head_destroy', 1);
        }
        // Arm destroyed — disable that weapon slot so enemy stops firing from it
        if (e.comp[target].hp <= 0) {
            if (target === 'lArm' && e.loadout?.L && e.loadout.L !== 'none') {
                const _wasL = e.loadout.L;
                e.loadout.L = 'none';
                // Update primary to R arm if primary was on L
                if (e.loadout.primary === _wasL)
                    e.loadout.primary = (e.loadout.R && e.loadout.R !== 'none') ? e.loadout.R : 'none';
            } else if (target === 'rArm' && e.loadout?.R && e.loadout.R !== 'none') {
                e.loadout.R = 'none';
                e.loadout.secondary = 'none';
            } else if (target === 'legs' && e._legSystemActive) {
                e._legSystemActive = false;
                e.speed = Math.round(e.speed * 0.50); // legs destroyed = half speed
            }
        }
        // (Salvage Protocol loot drop already handled above via _salvageDrop_ flag)
    }

    // Incendiary Rounds: chance to ignite on hit
    if (_perkState.incendiary > 0 && !explosive && e.active && !e._burning) {
        if (Math.random() < _perkState.incendiary) {
            e._burning = true;
            const scene2 = GAME.scene.scenes[0];
            let _burnTicks = 0;
            const _burnTimer = scene2.time.addEvent({ delay: 400, loop: true, callback: () => {
                if (!e.active || _burnTicks >= 5) { e._burning = false; _burnTimer.remove(); return; }
                damageEnemy(e, 5, 0);
                _burnTicks++;
                // Small orange flash
                const fx = scene2.add.circle(e.x, e.y, 8, 0xff6600, 0.6).setDepth(14);
                scene2.tweens.add({ targets: fx, alpha: 0, scaleX: 2, scaleY: 2, duration: 300, onComplete: ()=>fx.destroy() });
            }});
        }
    }
    // (Resonance shield charge is applied above — single application only)
    // Threat Analyzer: hit enemy takes 15% (or 25% with Deep Scan) more damage for 3 s
    if (_perkState.threatAnalyzer && !e._analyzed) {
        e._analyzed = true;
        const _analyzerResist = _perkState.taDeep ? 0.75 : 0.85;
        e._dmgMult = (e._dmgMult || 1) / _analyzerResist;
        GAME.scene.scenes[0].time.delayedCall(3000, () => {
            if (e?.active) { e._dmgMult = (e._dmgMult || 1) * _analyzerResist; e._analyzed = false; }
        });
    }
    // Die when core is destroyed (same logic as player)
    const _coreDead = e.comp ? e.comp.core.hp <= 0 : e.health <= 0;
    if (_coreDead) _resolveEnemyDeath(e);
}

// ── damageEnemy sub-functions ───────────────────────────────────────────────────────────────────────

function _resolveEnemyDeath(e) {
    const scene = GAME.scene.scenes[0];
    // Capture position before any cleanup destroys it
    const _deadRef = { x: e.x, y: e.y };
    try {
    if (e.isCommander) {
        sndEnemyDeath(true);
        scene.cameras.main.shake(500, 0.02);
        createExplosion(scene, e.x, e.y, 120, 0);
        scene.time.delayedCall(150, () => createExplosion(scene, e.x + Phaser.Math.Between(-30,30), e.y + Phaser.Math.Between(-30,30), 80, 0));
        spawnDebris(scene, e.x, e.y, 0xddaa00);
        spawnLoot(scene, e.x, e.y, true);
        spawnEquipmentLoot(scene, e.x, e.y, { isCommander: true });
        showRoundBanner('COMMANDER DESTROYED', '', 1500, null);
        if (_perkState.commanderBounty && player) { player.shield = player.maxShield; updateBars(); }
        if (_perkState.chainReaction > 0 && e._chainReactionCheck && Math.random() < _perkState.chainReaction) {
            const sc2 = GAME.scene.scenes[0];
            createExplosion(sc2, e.x, e.y, 45, 20);
        }
    } else {
        sndEnemyDeath(false);
        scene.cameras.main.shake(250, 0.008);
        createExplosion(scene, e.x, e.y, 60, 0);
        if (_perkState.fthInferno && e._burning) {
            let _iTarget = null, _iDist = Infinity;
            enemies.getChildren().forEach(e2 => {
                if (!e2.active || e2 === e || e2._burning) return;
                const id2 = Phaser.Math.Distance.Between(e.x, e.y, e2.x, e2.y);
                if (id2 < 300 && id2 < _iDist) { _iDist = id2; _iTarget = e2; }
            });
            if (_iTarget) {
                _iTarget._burning = true;
                let _ibt = 0;
                const _ibTimer = scene.time.addEvent({ delay: 400, loop: true, callback: () => {
                    if (!_iTarget.active || _ibt >= 5) { _iTarget._burning = false; _ibTimer.remove(); return; }
                    damageEnemy(_iTarget, 5, 0);
                    _ibt++;
                }});
            }
        }
        if (_perkState.heavyReactorCore && e.lastDamageWasExplosive) {
            scene.time.delayedCall(150, () => createExplosion(scene, e.x + Phaser.Math.Between(-40,40), e.y + Phaser.Math.Between(-40,40), 45, 25));
        }
        const debrisCol = e.loadout ? ENEMY_COLORS[e.loadout.chassis].head : 0x664400;
        spawnDebris(scene, e.x, e.y, debrisCol);
        if (_perkState.chainReaction > 0 && Math.random() < _perkState.chainReaction) {
            scene.time.delayedCall(80, () => createExplosion(scene, e.x, e.y, 50, 20));
        }
        spawnLoot(scene, e.x, e.y, false);
        if (e.isBoss && typeof sndBossDefeat === 'function') sndBossDefeat();
        spawnEquipmentLoot(scene, e.x, e.y, { isMedic: !!e.isMedic, isBoss: !!e.isBoss, bossType: e.bossType || null, isElite: !!e.isElite, enemyType: e.enemyType || null });
    }
    // All enemies move toward ally death location
    const _diedX = e.x, _diedY = e.y;
    if (enemies) {
        enemies.getChildren().forEach(nearby => {
            if (!nearby.active || nearby === e) return;
            const _nd = Phaser.Math.Distance.Between(nearby.x, nearby.y, _diedX, _diedY);
            if (_nd < 400 && (nearby._aiState === 'patrol' || nearby._aiState === 'search')) {
                nearby._aiState = 'search';
                nearby._lastKnownPlayer = { x: _diedX, y: _diedY };
                nearby._stateTimer = GAME?.loop?.time || 0;
            } else if (nearby._aiState === 'patrol') {
                nearby._patrolTarget = { x: _diedX + (Math.random()-0.5)*80, y: _diedY + (Math.random()-0.5)*80 };
                nearby._patrolSet = false;
            }
        });
    }
    if (typeof handleEliteDeath === 'function' && (e.isElite || e.enemyType)) {
        handleEliteDeath(scene, e);
    }
    } catch(deathErr) { /* ensure onEnemyKilled fires even if death effects fail */ }
    // Always spawn scrap (100% drop rate, campaign only)
    if (typeof spawnScrapDrop === 'function') spawnScrapDrop(scene, _deadRef.x, _deadRef.y);
    // Cleanup visuals — always runs
    try {
    if (e.visuals)  e.visuals.destroy();
    if (e.torso)    e.torso.destroy();
    if (e.cmdLabel)    e.cmdLabel.destroy();
    if (e.medicLabel)  e.medicLabel.destroy();
    if (e.medicCross)  e.medicCross.destroy();
    if (e._healTimer)  e._healTimer.remove();
    if (e._onDestroy)  { try { e._onDestroy(); } catch(ex){} }
    if (e.shieldRing?.active) e.shieldRing.destroy();
    if (e._visionConeGfx?.active) e._visionConeGfx.destroy();
    if (e._splitLabel?.active) e._splitLabel.destroy();
    } catch(cleanErr) { /* non-fatal */ }
    e.destroy();
    onEnemyKilled(_deadRef);
}

// ── Tremor Legs: AOE ground-shake triggered while moving ──────────
function _triggerTremor(scene) {
    if (!player?.active) return;
    const _baseDmg    = _perkState.tlLegendary ? 300 : 40 + (_perkState.tlDmg || 0);
    const _baseRadius = _perkState.tlLegendary ? 300 : 120 * (1 + (_perkState.tlRadius || 0));

    // Visual shockwave ring
    const _ring = scene.add.circle(player.x, player.y, 10, 0x886622, 0.55).setDepth(8);
    scene.tweens.add({
        targets: _ring, scaleX: _baseRadius / 10, scaleY: _baseRadius / 10, alpha: 0, duration: 380,
        onComplete: () => _ring.destroy(),
    });

    let _anyHit = false;
    enemies.getChildren().forEach(e => {
        if (!e.active) return;
        if (Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y) > _baseRadius) return;
        showDamageText(scene, e.x, e.y, _baseDmg);
        damageEnemy(e, _baseDmg, undefined, true);
        _anyHit = true;
        // tlSlow: 40% slow for 2s
        if (_perkState.tlSlow && !e._tremorSlowed) {
            e._tremorOrigSpeed = e.speed;
            e.speed = Math.max(1, Math.round(e.speed * 0.60));
            e._tremorSlowed = true;
            e._slowed = true;
            scene.time.delayedCall(2000, () => {
                if (!e.active) return;
                if (e._tremorOrigSpeed !== undefined) e.speed = e._tremorOrigSpeed;
                delete e._tremorOrigSpeed;
                e._tremorSlowed = false;
                e._slowed = false;
            });
        }
        // tlFire: ignite
        if (_perkState.tlFire && !e._burning) {
            e._burning = true;
            let _bt = 0;
            const _bTimer = scene.time.addEvent({ delay:1000, loop:true, callback:() => {
                _bt++;
                if (!e.active || _bt >= 5) { e._burning = false; _bTimer.remove(); return; }
                damageEnemy(e, 8, undefined, false);
            }});
        }
        // tlEmp: stun 1s
        if (_perkState.tlEmp && !e.isStunned) {
            e.isStunned = true;
            scene.time.delayedCall(1000, () => { if (e.active) e.isStunned = false; });
        }
    });

    sndExplosion(false);

    // tlHeal: restore 15 HP on hit
    if (_perkState.tlHeal && _anyHit && player?.comp?.core) {
        player.comp.core.hp = Math.min(player.comp.core.max, player.comp.core.hp + 15);
        player.hp = Object.values(player.comp).reduce((s, c) => s + c.hp, 0);
        updateHUD();
    }

    // tlChain5: second tremor at 50% dmg 1s later
    if (_perkState.tlChain5) {
        const _cx = player.x, _cy = player.y;
        scene.time.delayedCall(1000, () => {
            if (!player?.active) return;
            enemies.getChildren().forEach(e => {
                if (!e.active) return;
                if (Phaser.Math.Distance.Between(_cx, _cy, e.x, e.y) > _baseRadius) return;
                const _cd = Math.round(_baseDmg * 0.5);
                showDamageText(scene, e.x, e.y, _cd);
                damageEnemy(e, _cd, undefined, true);
            });
        });
    }

    // tlLegendary: also drop 3 mines
    if (_perkState.tlLegendary && typeof dropMine === 'function') {
        for (let _m = 0; _m < 3; _m++) dropMine(scene);
    }
}

function createExplosion(scene, x, y, radius, damage, isPlayerExplosion = false) {
    // Apply player explosion perk multipliers (blastMult is additive bonus, 0 = no bonus)
    const effRadius = (isPlayerExplosion && _perkState.blastMult > 0)
        ? radius * (1 + _perkState.blastMult)
        : radius;
    const effDamage = (isPlayerExplosion && _perkState.blastMult > 0)
        ? damage * (1 + _perkState.blastMult)
        : damage;

    sndExplosion(effRadius >= 90);
    const blast = scene.add.circle(x, y, effRadius, 0xff6600, 0.6).setDepth(15);
    scene.physics.add.existing(blast);

    const targetsHit         = new Set();
    let   playerDamageDealt  = false;

    // Store overlap collider so it can be destroyed when blast is done (Phaser does not auto-remove it).
    const blastOverlap = scene.physics.add.overlap(blast, enemies, (_, e) => {
        if (targetsHit.has(e)) return;
        targetsHit.add(e);
        showDamageText(scene, e.x, e.y, effDamage);
        damageEnemy(e, effDamage, undefined, true);
    });

    if (player?.active && !isShieldActive) {
        const dist = Phaser.Math.Distance.Between(x, y, player.x, player.y);
        if (dist < effRadius && !playerDamageDealt) {
            playerDamageDealt = true;
            processPlayerDamage(Math.floor(effDamage * 0.75), null, true);
            scene.cameras.main.shake(200, 0.01);
        }
    }

    // Kamikaze Protocol: player-triggered explosions also deal self-damage
    if (isPlayerExplosion && _perkState.heavyKamikazeProtocol && player?.active) {
        processPlayerDamage(Math.floor(effDamage * 0.20), null, true);
    }

    scene.tweens.add({
        targets: blast, scale: 1.5, alpha: 0, duration: 300,
        onComplete: () => { targetsHit.clear(); blastOverlap.destroy(); blast.destroy(); }
    });
}

// damageCover() — moved to js/cover.js

// ── Shared mine drawing helper ────────────────────────────
function _drawMineGraphic(g, mx, my, glowAlpha) {
    g.clear();
    g.lineStyle(2, 0xff2200, 0.45 * glowAlpha);
    g.strokeCircle(mx, my, 18);
    g.fillStyle(0x222222, 1);
    g.fillCircle(mx, my, 8);
    g.lineStyle(2, 0xcc2200, 1);
    g.strokeCircle(mx, my, 8);
    g.lineStyle(2, 0xff3300, 1);
    g.lineBetween(mx-8, my, mx+8, my);
    g.lineBetween(mx, my-8, mx, my+8);
    g.fillStyle(0xff4400, 1);
    g.fillCircle(mx, my, 2.5);
}

function dropMine(scene) {
    if (!player?.active) return;
    const mx = player.x + (Math.random()-0.5)*8;
    const my = player.y + (Math.random()-0.5)*8;

    // Mine visual: flat disc + crosshair + pulsing danger ring
    const g = scene.add.graphics().setDepth(8);
    let _glowAlpha = 1.0;
    const drawMine = () => _drawMineGraphic(g, mx, my, _glowAlpha);
    drawMine();
    let _pulseUp = false;
    const _pulseTick = scene.time.addEvent({ delay: 500, loop: true, callback: () => {
        _glowAlpha = _pulseUp ? 1.0 : 0.4;
        _pulseUp = !_pulseUp;
        drawMine();
    }});

    let armed = false;
    const tick = scene.time.addEvent({ delay:150, loop:true, callback:() => {
        if (!g.active || armed) return;
        enemies.getChildren().forEach(e => {
            if (armed || !e.active) return;
            if (Phaser.Math.Distance.Between(e.x, e.y, mx, my) < 55) {
                armed = true; g.destroy(); _pulseTick.remove(); tick.remove();
                createExplosion(scene, mx, my, 70, 80);
                if (_perkState.mlCluster) {
                    for (let s=0;s<3;s++) scene.time.delayedCall(s*120, () =>
                        createExplosion(scene, mx+Phaser.Math.Between(-40,40), my+Phaser.Math.Between(-40,40), 40, 25));
                }
            }
        });
    }});
    scene.time.delayedCall(30000, () => { if (!armed && g.active) { g.destroy(); _pulseTick.remove(); tick.remove(); } });
}

function dropEnemyMine(scene, enemy) {
    if (!enemy?.active) return;
    const mx = enemy.x + (Math.random()-0.5)*8;
    const my = enemy.y + (Math.random()-0.5)*8;

    // Mine visual: identical to player mine — uses shared _drawMineGraphic helper
    const g = scene.add.graphics().setDepth(8);
    let _glowAlpha = 1.0;
    const drawMine = () => _drawMineGraphic(g, mx, my, _glowAlpha);
    drawMine();
    let _pulseUp = false;
    const _pulseTick = scene.time.addEvent({ delay: 500, loop: true, callback: () => {
        _glowAlpha = _pulseUp ? 1.0 : 0.4;
        _pulseUp = !_pulseUp;
        drawMine();
    }});

    let armed = false;
    const tick = scene.time.addEvent({ delay:150, loop:true, callback:() => {
        if (!g.active || armed) return;
        if (player?.active && Phaser.Math.Distance.Between(player.x, player.y, mx, my) < 55) {
            armed = true;
            _pulseTick.remove();
            g.destroy(); tick.remove();
            processPlayerDamage(70, 0, true);
            const scene2 = GAME.scene.scenes[0];
            createExplosion(scene2, mx, my, 70, 0);
        }
    }});
    scene.time.delayedCall(25000, () => {
        if (!armed && g.active) { _pulseTick.remove(); g.destroy(); tick.remove(); }
    });
}

// ═══════════ BULLET IMPACT & SHIELD HANDLERS ═══════════

// ── Player bullet ↔ enemy impact ─────────────────────────────────
// Named handler extracted from the anonymous overlap callback in
// create(). Called as:  (bullet, enemy) => handleBulletEnemyOverlap(this, bullet, enemy)
function handleBulletEnemyOverlap(scene, bullet, enemy) {
    if (bullet.isGLBall) return;
    // Capture position and damage BEFORE destroying bullet (velocity zeroes on destroy)
    const bAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
    const dmg = _calcBulletDamage(bullet);
    const bulletShieldPierce = bullet.shieldPierce || false;
    _shotsHit++; _damageDealt += dmg;
    const bx = bullet.x, by = bullet.y;   // cached before destroy
    bullet.destroy();

    if (enemy.isShielded && !bulletShieldPierce) {
        _handleShieldedHit(scene, bx, by);
        return;
    }
    createImpactSparks(scene, enemy.x, enemy.y);
    showDamageText(scene, enemy.x, enemy.y, dmg);

    _applyIncendiaryProc(scene, enemy);

    // Chain Reaction: flag for explosion on kill
    if (_perkState.chainReaction > 0) enemy._chainReactionCheck = true;
    // SR One Shot: SR-magnitude hit → halve reload on kill
    if (_perkState.srOneShot && bullet?.damageValue >= (WEAPONS.sr?.dmg || 0) * 0.8) {
        enemy._oneShotCandidate = true;
    }
    if (_perkState.targetPainter && !enemy._painted) {
        enemy._painted = true;
        _perkState._paintedEnemy = enemy;
        enemy.torso?.list?.forEach(s => { if (s.setStrokeStyle) s.setStrokeStyle(2, 0xffaa00); });
    }
    // Field Processor: track hits per enemy; after 3 hits deal permanent +15% damage
    if (_perkState.fieldProcessor && enemy.active && !enemy._fpBonused) {
        enemy._fpHits = (enemy._fpHits || 0) + 1;
        if (enemy._fpHits >= 3) {
            enemy._fpBonused = true;
            enemy._dmgMult = (enemy._dmgMult || 1) * 1.15;
        }
    }
    damageEnemy(enemy, dmg, bAngle, false, bulletShieldPierce);

    // Titan Smash: every 5th shot AoE shockwave
    if (typeof checkTitanSmash === 'function' && checkTitanSmash()) {
        triggerTitanSmash(scene, bx, by, dmg);
    }
    _applyChainPlasma(scene, enemy, dmg);
    _applyFlameBulletEffects(scene, bullet, enemy);

    // Phantom Protocol: 4× pierce shot consumed on hit
    if (_perkState._phantomShotReady) {
        _perkState._phantomShotReady = false;
        _perkState._phantomActive = false;
    }
}

// ── handleBulletEnemyOverlap sub-functions ───────────────────────────────

/** Apply SMG/bullet range dropoff to base damage. Returns adjusted dmg value. */
function _calcBulletDamage(bullet) {
    let dmg = bullet.damageValue || 2;
    if (isRageActive && typeof _rageDmgMult === 'number') dmg = Math.round(dmg * _rageDmgMult);
    if (bullet.rangeDropoff && bullet._originX !== undefined) {
        const tDist = Phaser.Math.Distance.Between(bullet._originX, bullet._originY, bullet.x, bullet.y);
        if (tDist > bullet.rangeDropoff) {
            dmg = Math.max(1, Math.round(dmg * Math.max(0.40, 1 - (tDist - bullet.rangeDropoff) / 800)));
        }
    }
    return dmg;
}

/** Show shield-block sparks and BLOCK floating text when enemy shield absorbs the hit. */
function _handleShieldedHit(scene, bx, by) {
    try { createShieldSparks(scene, bx, by); } catch(ex) {}
    const blockTxt = scene.add.text(bx, by - 20, 'BLOCK', {
        font: 'bold 22px monospace', fill: '#00ffff',
        stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);
    blockTxt.setShadow(0, 0, '#00ffff', 8, true, true);
    scene.tweens.add({ targets: blockTxt, y: by - 100, alpha: 0,
        duration: 1500, hold: 500, ease: 'Back.easeOut',
        onComplete: () => blockTxt.destroy() });
}

/** Chance to ignite enemy from the Incendiary Rounds perk on bullet impact. */
function _applyIncendiaryProc(scene, enemy) {
    if (!(_perkState.incendiary > 0 && Math.random() < _perkState.incendiary && !enemy._burning)) return;
    enemy._burning = true;
    let burnTicks = 0;
    const burnTimer = scene.time.addEvent({ delay: 400, loop: true, callback: () => {
        if (!enemy.active || burnTicks >= 5) { enemy._burning = false; burnTimer.remove(); return; }
        damageEnemy(enemy, 5, 0);
        burnTicks++;
        const sp = scene.add.circle(enemy.x + (Math.random()-0.5)*16, enemy.y + (Math.random()-0.5)*16, 3, 0xff6600, 0.7).setDepth(13);
        scene.tweens.add({ targets: sp, alpha: 0, y: sp.y - 8, duration: 300, onComplete: () => sp.destroy() });
    }});
}

/** Chain Plasma: bolt chains to nearest enemy within 150px on a plasma-sized hit. */
function _applyChainPlasma(scene, enemy, dmg) {
    if (!(_perkState.plsmChain && dmg >= 200)) return;
    let chainTarget = null, chainDist = Infinity;
    enemies.getChildren().forEach(e2 => {
        if (!e2.active || e2 === enemy) return;
        const d2 = Phaser.Math.Distance.Between(enemy.x, enemy.y, e2.x, e2.y);
        if (d2 < 150 && d2 < chainDist) { chainDist = d2; chainTarget = e2; }
    });
    if (!chainTarget) return;
    damageEnemy(chainTarget, Math.round(dmg * 0.55), 0, true);
    showDamageText(scene, chainTarget.x, chainTarget.y, Math.round(dmg * 0.55));
    const cg = scene.add.graphics().setDepth(13);
    cg.lineStyle(3, 0x00ffff, 0.85);
    cg.lineBetween(enemy.x, enemy.y, chainTarget.x, chainTarget.y);
    scene.tweens.add({ targets: cg, alpha: 0, duration: 180, onComplete: () => cg.destroy() });
}

/** FTH flame bullet procs: ignite (Thermal Core), Melt Armor stacks, Pressure Spray slow. */
function _applyFlameBulletEffects(scene, bullet, enemy) {
    if (!bullet._flame) return;
    const igniteChance = _perkState.thermalCore ? 1.0 : (_perkState.incendiary || 0);
    if (igniteChance > 0 && (igniteChance >= 1 || Math.random() < igniteChance) && !enemy._burning) {
        const burnDur = _perkState.thermalCore ? 7 : 5;
        enemy._burning = true;
        let bt = 0;
        const bTimer = scene.time.addEvent({ delay: 400, loop: true, callback: () => {
            if (!enemy.active || bt >= burnDur) { enemy._burning = false; bTimer.remove(); return; }
            damageEnemy(enemy, 5, 0);
            bt++;
            const sp = scene.add.circle(enemy.x+(Math.random()-0.5)*16, enemy.y+(Math.random()-0.5)*16, 3, 0xff6600, 0.7).setDepth(13);
            scene.tweens.add({ targets: sp, alpha:0, y:sp.y-8, duration:300, onComplete:()=>sp.destroy() });
        }});
    }
    if (_perkState.fthMeltArmor > 0) {
        const stacks = Math.min(3, (enemy._meltArmorStacks||0) + 1);
        enemy._meltArmorStacks = stacks;
        enemy._dmgMult = (enemy._dmgMult || 1) / Math.max(0.1, 1 - stacks * 0.10);
        clearTimeout(enemy._meltArmorTimer);
        enemy._meltArmorTimer = setTimeout(() => {
            if (enemy.active) { enemy._meltArmorStacks = 0; enemy._dmgMult = 1; }
        }, 4000);
    }
    if (_perkState.fthPressureSpray && !enemy._fthSlowed) {
        enemy._fthSlowed = true;
        enemy._baseSpeed = enemy._baseSpeed || enemy.speed;
        enemy.speed = Math.round(enemy.speed * 0.80);
        clearTimeout(enemy._fthSlowTimer);
        enemy._fthSlowTimer = setTimeout(() => {
            if (enemy.active) { enemy.speed = enemy._baseSpeed; enemy._fthSlowed = false; }
        }, 300);
    }
}

// ═══════════ SHIELD REGEN & PASSIVE SYSTEMS ═══════════

/** Passive shield regeneration — kicks in 5 s after last hit. */
function handleShieldRegen(time) {
    if (!player?.active || !isDeployed) return;
    _applyPassiveAuras();
    _applyHeavyChassisRegen();
    _applyShieldRegen(time);
    _applyAutoRepair();
    _tickPerkExpiries(time);
}

// ── handleShieldRegen sub-functions ──────────────────────────────────────

/** Damage auras that tick every frame: thermal shield, barrier spike, meltdown core. */
function _applyPassiveAuras() {
    // Thermal Shield: burn enemies near player while shield is active
    const _thermSys = SHIELD_SYSTEMS[loadout.shld];
    if (_thermSys?.thermalAura && player.shield > 0 && enemies) {
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            if (Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y) < (_thermSys.thermalRange || 160)) {
                e._thermalTickTimer = (e._thermalTickTimer || 0) + (GAME.loop.delta || 16);
                if (e._thermalTickTimer >= 500) {
                    e._thermalTickTimer = 0;
                    damageEnemy(e, Math.round(_thermSys.thermalAura * 0.5), 0);
                }
            } else { e._thermalTickTimer = 0; }
        });
    }
    // Barrier spike: damage aura while shield mod is active
    if (_perkState.barrierSpike && isShieldActive) {
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const _bsd = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
            if (_bsd < 140) damageEnemy(e, 15 * (GAME.loop.delta / 1000), 0);
        });
    }
    // Meltdown Core: passive heat aura — 8 dmg/s within 180px
    if (_perkState.fthMeltdownCore) {
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const _md = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
            if (_md < 180) damageEnemy(e, 8 * (GAME.loop.delta / 1000), 0);
        });
    }
}

/** Heavy chassis passive: 2 HP/s core regen after 4s without taking damage. */
function _applyHeavyChassisRegen() {
    if (loadout.chassis === 'heavy' && player?.comp?.core) {
        const _timeSinceDmg = (GAME.loop.time - (_lastPlayerDamageTime || 0));
        if (_timeSinceDmg > 4000 && player.comp.core.hp > 0 && player.comp.core.hp < player.comp.core.max) {
            player.comp.core.hp = Math.min(player.comp.core.max, player.comp.core.hp + 2 * (GAME.loop.delta / 1000));
            updateHUD();
        }
    }
}

/** Tick shield HP upward once the regen delay has elapsed since last damage. */
function _applyShieldRegen(time) {
    if (_perkState.noShieldRegen) return;
    const regenDelay     = player._shieldRegenDelay ?? 5;
    const regenRate      = player._shieldRegenRate  ?? 1.0;
    // Shield Specialist (Medium trait): +15% shield regen rate
    const _chassisRegenMult = loadout.chassis === 'medium' ? 1.15 : 1.0;
    const _gearRegenMult = (1 + ((_gearState?.shieldRegen || 0) / 100)) * _chassisRegenMult;
    const _ss = SHIELD_SYSTEMS[loadout.shld];

    // ── Layered Shield: each layer regens on its own timer ──
    if (_ss?.layered && player._shieldLayerHP) {
        const _l1Max = _ss.layer1Max || 65;
        const _l2Max = _ss.layer2Max || 65;
        let _layerChanged = false;
        if (player._shieldLayerHP[0] < _l1Max && player._layer1LastDamageTime > 0) {
            const _l1Since = (time - player._layer1LastDamageTime) / 1000;
            if (_l1Since >= regenDelay) {
                player._shieldLayerHP[0] = Math.min(_l1Max, player._shieldLayerHP[0] + regenRate * (_perkState.shieldRegenMult || 1) * _gearRegenMult);
                _layerChanged = true;
            }
        }
        if (player._shieldLayerHP[1] < _l2Max && player._layer2LastDamageTime > 0) {
            const _l2Since = (time - player._layer2LastDamageTime) / 1000;
            if (_l2Since >= regenDelay) {
                player._shieldLayerHP[1] = Math.min(_l2Max, player._shieldLayerHP[1] + regenRate * (_perkState.shieldRegenMult || 1) * _gearRegenMult);
                _layerChanged = true;
            }
        }
        if (_layerChanged) {
            player.shield = player._shieldLayerHP[0] + player._shieldLayerHP[1];
            updateBars();
        }
        return;
    }

    const secondsSinceHit = (time - lastDamageTime) / 1000;
    if (player.maxShield > 0 && lastDamageTime > 0 && secondsSinceHit >= regenDelay && player.shield < player.maxShield) {
        player.shield = Math.min(player.maxShield, player.shield + regenRate * (_perkState.shieldRegenMult || 1) * _gearRegenMult);
        if (player.shield >= player.maxShield) {
            player._shieldAdaptStack = 0;  // adaptive_shield: reset on full regen
        }
        updateBars();
    }
}

/** Auto-repair: regenerate core HP slowly from perk + gear combined rate. */
function _applyAutoRepair() {
    const _totalAutoRepair = (_perkState.autoRepair || 0) + (_gearState?.autoRepair || 0);
    if (_totalAutoRepair > 0 && player?.comp?.core && player.comp.core.hp < player.comp.core.max) {
        player.comp.core.hp = Math.min(player.comp.core.max, player.comp.core.hp + (GAME.loop.delta / 1000) * _totalAutoRepair);
        updateBars(); updatePaperDoll();
    }
}

// ═══════════ ENEMY BULLET OVERLAP ═══════════

function _registerEnemyBulletOverlap(scene) {
    _playerBulletOverlap = scene.physics.add.overlap(enemyBullets, player, (p, bullet) => {
        if (!bullet || !bullet.active) return;
        if (!isDeployed || !player?.active) { if (bullet?.active) bullet.destroy(); return; }

        const bulletAngle = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);

        if (isShieldActive) {
            sndShieldBlock();
            createShieldSparks(scene, bullet.x, bullet.y);
            showDamageText(scene, bullet.x, bullet.y, 0, true);
            bullet.destroy();
            return;
        }

        if (player.shield > 0 && player.shield - 7.5 <= 0) {
            createShieldBreak(scene, p.x, p.y);
        }

        createImpactSparks(scene, p.x, p.y);
        const _hitDmg = bullet.damageValue || 15;
        showDamageText(scene, p.x, p.y, _hitDmg, player.shield > 0);
        // Vampiric elite: heal shooter on hit
        if (bullet._shooter && typeof handleVampiricHeal === 'function') {
            handleVampiricHeal(bullet._shooter, _hitDmg);
        }
        bullet.destroy();
        processPlayerDamage(_hitDmg, bulletAngle);
    });
}

// ═══════════ FIELD EFFECTS ═══════════

function _applyFieldEngineer() {
    if (!_perkState.fieldEngineer || !player?.comp) return;
    const parts = Object.entries(player.comp);
    parts.sort((a,b) => (a[1].hp/a[1].max) - (b[1].hp/b[1].max));
    const [, part] = parts[0];
    const heal = Math.round(part.max * 0.10 * _perkState.fieldEngineer);
    part.hp = Math.min(part.max, part.hp + heal);
    updateBars(); updatePaperDoll();
}

