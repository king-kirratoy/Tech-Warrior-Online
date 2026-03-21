// ═══════════ MECH BUILDING & VISUALS ═══════════
// buildPlayerMech(), buildEnemyMech(), buildEnemyTorso(), refreshMechColor(),
// syncVisuals(), syncChassisEffect(), syncLightTrail(), syncMediumFootsteps(),
// syncHeavyShockwave(), handleRageGhosts(), _spawnSpectreClone()
//
// Depends on: CHASSIS, ENEMY_COLORS (constants.js), darkenColor, spawnFootprint (utils.js),
//             loadout, torso, player, isDeployed, isRageActive, isShieldActive,
//             shieldGraphic, bullets, enemies, GAME, WEAPONS (state.js / globals),
//             _lastTorsoX, _lastTorsoY, _lastTorsoMX, _lastTorsoMY,
//             _footstepTimer, _footstepSide, _shockwaveTimer, _spectreClones (state.js),
//             syncGlowWedge, syncCrosshair (hud.js)

// ── Mech building ─────────────────────────────────────────────────

function buildPlayerMech(scene, type, color) {
  const container = scene.add.container(0, 0);
  const s = CHASSIS[type].scale;

  const bodyCol = darkenColor(color, 0.4);
  if (type === 'heavy') {
    container.add([
      scene.add.rectangle(0, 0,  40, 100, bodyCol).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle(0, 0,  60,  70, bodyCol).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle(0, 0,  40,  30, color).setStrokeStyle(2, 0xffffff).setName('mechHead'),
      scene.add.rectangle(20, 0,  8,  30, 0x0F61A1).setStrokeStyle(1, 0xffffff),
    ]);
  } else if (type === 'light') {
    container.add([
      scene.add.rectangle(0, 0,  25,  60, bodyCol).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle(0, 0,  40,  40, bodyCol).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle(0, 0,  25,  20, color).setStrokeStyle(2, 0xffffff).setName('mechHead'),
      scene.add.rectangle(10, 0, 10,  20, 0x0F61A1).setStrokeStyle(1, 0xffffff),
    ]);
  } else { // medium
    container.add([
      scene.add.rectangle(0, 0,  35,  80, bodyCol).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle(0, 0,  50,  50, bodyCol).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle(0, 0,  35,  25, color).setStrokeStyle(2, 0xffffff).setName('mechHead'),
      scene.add.rectangle(14, 0, 10,  25, 0x0F61A1).setStrokeStyle(1, 0xffffff),
    ]);
  }

  container.setScale(s);
  return container;
}

function buildEnemyMech(scene, type, colors) {
  // Invisible placeholder container — all visuals are in e.torso
  // Kept so existing sync/destroy code doesn't break
  return scene.add.container(0, 0);
}

function buildEnemyTorso(scene, type, colors) {
  // Complete mech visual — rotates as one unit to face the player.
  // Coordinate system: rotation=0 = facing right (+X).
  //   X axis = forward/backward (gun at +X, rear at -X)
  //   Y axis = left/right perpendicular (shoulders at +Y and -Y)
  type   = type   || 'medium';
  colors = colors || ENEMY_COLORS[type];
  const body = darkenColor(colors.head, 0.45);
  const head = colors.head;
  const eye  = colors.eye;
  const c = scene.add.container(0, 0);
  if (type === 'heavy') {
    c.add([
      scene.add.rectangle(  0, 0,  40, 100, body).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle(  0, 0,  60,  70, body).setStrokeStyle(1, 0xffffff),
      scene.add.rectangle(  0, 0,  40,  30, head).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle( 20, 0,   8,  30, eye ).setStrokeStyle(1, 0xffffff),
    ]);
  } else if (type === 'light') {
    c.add([
      scene.add.rectangle(  0, 0,  25,  60, body).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle(  0, 0,  40,  40, body).setStrokeStyle(1, 0xffffff),
      scene.add.rectangle(  0, 0,  25,  20, head).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle( 10, 0,  10,  20, eye ).setStrokeStyle(1, 0xffffff),
    ]);
  } else { // medium
    c.add([
      scene.add.rectangle(  0, 0,  35,  80, body).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle(  0, 0,  50,  50, body).setStrokeStyle(1, 0xffffff),
      scene.add.rectangle(  0, 0,  35,  25, head).setStrokeStyle(2, 0xffffff),
      scene.add.rectangle( 14, 0,  10,  25, eye ).setStrokeStyle(1, 0xffffff),
    ]);
  }
  return c;
}

function refreshMechColor() {
  if (!torso?.list || !isDeployed) return;
  const headColor = isRageActive ? 0xff0000 : loadout.color;
  const bodyColor = isRageActive ? 0x660000 : darkenColor(loadout.color, 0.4);

  // Reset footstep/shockwave timers so effects re-sync after color change

  torso.list.forEach(shape => {
    if (!shape?.setFillStyle) return;
    if (shape.name === 'mechHead') shape.setFillStyle(headColor);
    else if (shape.width >= 25)   shape.setFillStyle(bodyColor);
  });
}

// ── Visual sync & chassis effects ────────────────────────────────

/** Sync torso/shield graphics to physics body, update turret aim, and run chassis effects. */
function syncVisuals(scene, time) {
  if (!player?.active || !torso?.active || !isDeployed) return;
  torso.setPosition(player.x, player.y);
  shieldGraphic.setPosition(player.x, player.y).setVisible(isShieldActive);

  const targetAngle = Phaser.Math.Angle.Between(
    player.x, player.y,
    scene.input.activePointer.worldX,
    scene.input.activePointer.worldY
  );
  torso.rotation = Phaser.Math.Angle.RotateTo(torso.rotation, targetAngle, 0.1);

  syncChassisEffect(scene, time);
  syncGlowWedge();
  syncCrosshair(scene);
}

/**
 * CHASSIS MOVEMENT EFFECTS
 * Called each frame from syncVisuals.
 * Light  → ghost torso trail
 * Medium → alternating footstep dust puffs
 * Heavy  → periodic ground shockwaves + camera nudge
 */
function syncChassisEffect(scene, time) {
  const speed  = player.body.velocity.length();
  const moving = speed > 10;

  if      (loadout.chassis === 'light')  syncLightTrail(scene, time, moving);
  else if (loadout.chassis === 'medium') syncMediumFootsteps(scene, time, moving);
  else if (loadout.chassis === 'heavy')  syncHeavyShockwave(scene, time, moving);


}

/**
 * Light mech: ghost torso trail + small quick-fading footprints.
 * Prints: 12×6, stance 8px, fast cadence, fade in 1200ms.
 */
function syncLightTrail(scene, time, moving) {
  if (!moving) return;

  // --- Ghost trail ---
  const dist = Phaser.Math.Distance.Between(torso.x, torso.y, _lastTorsoX, _lastTorsoY);
  if (dist >= 10) {
    _lastTorsoX = torso.x;
    _lastTorsoY = torso.y;

    const ghost = buildPlayerMech(scene, loadout.chassis, loadout.color);
    ghost.setPosition(torso.x, torso.y).setRotation(torso.rotation);
    ghost.setAlpha(0.35).setDepth(8);
    ghost.list.forEach(s => { if (s?.setFillStyle) s.setFillStyle(darkenColor(loadout.color, 0.6)); });
    scene.tweens.add({ targets: ghost, alpha: 0, duration: 220, onComplete: () => ghost.destroy() });
  }

  // --- Footprints ---
  if (time < _footstepTimer) return;
  const speed    = player.body.velocity.length();
  const interval = Math.max(90, 260 - speed * 0.5);
  _footstepTimer = time + interval;

  const perp = player.rotation + Math.PI / 2;
  const rear = player.rotation + Math.PI;
  const rx   = player.x + Math.cos(rear) * 12;
  const ry   = player.y + Math.sin(rear) * 12;

  spawnFootprint(scene,
    rx + Math.cos(perp) * 8 * _footstepSide,
    ry + Math.sin(perp) * 8 * _footstepSide,
    player.rotation, 12, 6, 1200
  );
  _footstepSide *= -1;
}

/**
 * Medium mech: footprints + speed-line streak behind the torso.
 * Prints: 16×8, stance 12px, medium cadence, fade in 1800ms.
 * Streak: fading line drawn opposite travel direction, length/alpha scale with speed.
 */
function syncMediumFootsteps(scene, time, moving) {
  // --- Subtle motion blur ---
  // Spawn a faint ghost every 18px of movement, very low alpha and fast fade.
  // Much subtler than the light trail — feels like blur rather than echo.
  if (moving) {
    const dist = Phaser.Math.Distance.Between(torso.x, torso.y, _lastTorsoMX, _lastTorsoMY);
    if (dist >= 14) {
      _lastTorsoMX = torso.x;
      _lastTorsoMY = torso.y;

      const ghost = buildPlayerMech(scene, loadout.chassis, loadout.color);
      ghost.setPosition(torso.x, torso.y).setRotation(torso.rotation);
      ghost.setAlpha(0.28).setDepth(8);
      ghost.list.forEach(s => { if (s?.setFillStyle) s.setFillStyle(darkenColor(loadout.color, 0.55)); });
      scene.tweens.add({ targets: ghost, alpha: 0, duration: 200, onComplete: () => ghost.destroy() });
    }
  }

  // --- Footprints ---
  if (!moving || time < _footstepTimer) return;
  const speed    = player.body.velocity.length();
  const interval = Math.max(140, 340 - speed * 0.6);
  _footstepTimer = time + interval;

  const perp = player.rotation + Math.PI / 2;
  const rear = player.rotation + Math.PI;
  const rx   = player.x + Math.cos(rear) * 16;
  const ry   = player.y + Math.sin(rear) * 16;

  spawnFootprint(scene,
    rx + Math.cos(perp) * 12 * _footstepSide,
    ry + Math.sin(perp) * 12 * _footstepSide,
    player.rotation, 16, 8, 1800
  );
  _footstepSide *= -1;
}

/**
 * Heavy mech: large footprints + shockwave ring + camera thud.
 * Prints: 22×11, stance 20px, slow cadence, fade in 2500ms.
 */
function syncHeavyShockwave(scene, time, moving) {
  if (!moving || time < _shockwaveTimer) return;

  const speed     = player.body.velocity.length();
  const interval  = Math.max(320, 700 - speed * 1.2);
  _shockwaveTimer = time + interval;

  const perp = player.rotation + Math.PI / 2;
  const rear = player.rotation + Math.PI;
  const rx   = player.x + Math.cos(rear) * 24;
  const ry   = player.y + Math.sin(rear) * 24;

  // --- Footprints (both feet per step, wide stance) ---
  [-1, 1].forEach(side => {
    spawnFootprint(scene,
      rx + Math.cos(perp) * 20 * side,
      ry + Math.sin(perp) * 20 * side,
      player.rotation, 22, 11, 2500
    );
  });

  // --- Shockwave ring ---
  const ring = scene.add.circle(player.x, player.y, 10, loadout.color, 0)
    .setStrokeStyle(3, loadout.color, 0.9)
    .setDepth(3);
  scene.tweens.add({
    targets:  ring,
    radius:   70,
    alpha:    0,
    duration: 500,
    ease:     'Cubic.easeOut',
    onComplete: () => ring.destroy(),
  });

  // --- Camera thud ---
  scene.cameras.main.shake(80, 0.004);
}

// ── Rage ghosts ───────────────────────────────────────────────────

/** Rage mode: spawns fading red ghost mechs behind the player. */
function handleRageGhosts(scene, time) {
  if (!player?.active || !isDeployed) return;
  if (!isRageActive || time % 150 >= 20) return;

  const ghost = buildPlayerMech(scene, loadout.chassis, 0xff0000);
  ghost.setPosition(torso.x, torso.y).setRotation(torso.rotation);
  ghost.list.forEach(shape => { if (shape.setTint) shape.setTint(0xff0000); });
  ghost.setAlpha(0.4).setDepth(9);

  scene.tweens.add({
    targets: ghost,
    alpha: 0, scale: 1.1,
    duration: 400,
    onComplete: () => ghost.destroy(),
  });
}

// ── SPECTRE CLONE (Light Legendary) ──────────────────────────────

function _spawnSpectreClone() {
  const scene = GAME?.scene?.scenes[0];
  if (!scene || !player?.active) return;
  // Remove expired/destroyed clones from tracking
  _spectreClones = _spectreClones.filter(c => c.torso?.active);

  // Max 2 clones at a time
  if (_spectreClones.length >= 2) {
    // Destroy oldest to make room
    const oldest = _spectreClones.shift();
    try { oldest.torso.destroy(); oldest.label.destroy(); oldest.fire.remove(); oldest.drift.remove(); } catch(ex) {}
  }

  const spawnX = player.x + Phaser.Math.Between(-60, 60);
  const spawnY = player.y + Phaser.Math.Between(-60, 60);

  // Build a shadow clone — semi-transparent purple-tinted mech
  const cloneTorso = buildPlayerMech(scene, loadout.chassis, loadout.color);
  cloneTorso.setPosition(spawnX, spawnY);
  cloneTorso.setAlpha(0.35);
  cloneTorso.setDepth(9);
  cloneTorso.setTint(0x8844ff);
  cloneTorso.setRotation(torso?.rotation || 0);

  const cloneLabel = scene.add.text(spawnX, spawnY - 36, 'SPECTRE', {
    font: 'bold 10px Courier New', fill: '#aa66ff',
  }).setAlpha(0.7).setDepth(15).setOrigin(0.5);

  // Spawn flash effect
  const flash = scene.add.circle(spawnX, spawnY, 30, 0x8844ff, 0.5).setDepth(20);
  scene.tweens.add({ targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 400, onComplete: () => flash.destroy() });

  // Clone drifts toward nearest enemies
  let cloneAngle = torso?.rotation || 0;
  const driftEvent = scene.time.addEvent({ delay: 16, loop: true, callback: () => {
    if (!cloneTorso.active) return;
    // Linear scan avoids filter+sort array allocations every 16 ms
    let nearest = null, _nearDist = Infinity;
    enemies?.getChildren().forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(cloneTorso.x, cloneTorso.y, e.x, e.y);
      if (d < _nearDist) { _nearDist = d; nearest = e; }
    });
    if (nearest) {
      const targetAngle = Math.atan2(nearest.y - cloneTorso.y, nearest.x - cloneTorso.x);
      cloneAngle = Phaser.Math.Angle.RotateTo(cloneAngle, targetAngle, 0.05);
      cloneTorso.x += Math.cos(cloneAngle) * 1.2;
      cloneTorso.y += Math.sin(cloneAngle) * 0.8;
    } else {
      cloneAngle += 0.008;
      cloneTorso.x += Math.cos(cloneAngle) * 0.4;
      cloneTorso.y += Math.sin(cloneAngle) * 0.2;
    }
    cloneTorso.setRotation(cloneAngle);
    cloneLabel.setPosition(cloneTorso.x, cloneTorso.y - 36);
  }});

  // Clone fires at enemies every 1s, dealing 50% of player damage
  const cloneFireEvent = scene.time.addEvent({ delay: 1000, loop: true, callback: () => {
    if (!cloneTorso.active) return;
    let nearest = null, _nearDistF = Infinity;
    enemies?.getChildren().forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(cloneTorso.x, cloneTorso.y, e.x, e.y);
      if (d < _nearDistF) { _nearDistF = d; nearest = e; }
    });
    if (!nearest) return;
    const ang = Math.atan2(nearest.y - cloneTorso.y, nearest.x - cloneTorso.x);
    const wKey = loadout.L !== 'none' ? loadout.L : loadout.R;
    const weapon = WEAPONS[wKey];
    if (!weapon || weapon.explosive) return;
    const b = scene.add.circle(cloneTorso.x, cloneTorso.y, (weapon.bulletSize || 4), 0x8844ff, 0.7).setDepth(11);
    scene.physics.add.existing(b);
    b.body.setAllowGravity(false);
    b.damageValue = Math.round((weapon.dmg || 10) * 0.5);
    bullets.add(b);
    scene.physics.velocityFromRotation(ang, (weapon.speed || 800) * 0.9, b.body.velocity);
    scene.time.delayedCall(1500, () => { if (b.active) b.destroy(); });
  }});

  // Track the clone
  _spectreClones.push({ torso: cloneTorso, label: cloneLabel, fire: cloneFireEvent, drift: driftEvent });

  // Clone expires after 4s
  scene.time.delayedCall(4000, () => {
    if (cloneTorso.active) {
      // Fade out
      scene.tweens.add({ targets: [cloneTorso, cloneLabel], alpha: 0, duration: 300, onComplete: () => {
        cloneTorso.destroy();
        cloneLabel.destroy();
        cloneFireEvent.remove();
        driftEvent.remove();
      }});
    } else {
      try { cloneLabel.destroy(); cloneFireEvent.remove(); driftEvent.remove(); } catch(ex) {}
    }
    _spectreClones = _spectreClones.filter(c => c.torso?.active);
  });
}

// ═══════════ PLAYER HP INIT ═══════════

function _initPlayerHP(scene, s) {
    // Apply gear HP bonuses from equipped items.
    // recalcGearStats() lives in loot-system.js and reads _equipped (not loadout).
    // Key distinction: _equipped.shield  (loot gear slot)
    //                  loadout.shld      (loadout shield selection)
    recalcGearStats();
    const _gCoreHP = (_gearState?.coreHP || 0) + (_gearState?.allHP || 0);
    const _gArmHP  = (_gearState?.armHP  || 0) + (_gearState?.allHP || 0);
    const _gLegHP  = (_gearState?.legHP  || 0) + (_gearState?.allHP || 0);
    player.comp = {
        core: { hp: s.coreHP + _gCoreHP, max: s.coreHP + _gCoreHP },
        lArm: { hp: s.armHP  + _gArmHP,  max: s.armHP  + _gArmHP  },
        rArm: { hp: s.armHP  + _gArmHP,  max: s.armHP  + _gArmHP  },
        legs: { hp: s.legHP  + _gLegHP,  max: s.legHP  + _gLegHP  }
    };
    // Force doll to green now — updatePaperDoll() won't run until isDeployed=true
    _resetHUDState();
    player.maxHp     = getTotalHP(loadout.chassis);
    player.hp        = player.maxHp;
    // Shield comes from equipped shield system — 0 if none
    const _shldSys = SHIELD_SYSTEMS[loadout.shld] || SHIELD_SYSTEMS.none;
    const _gShieldHP = (_gearState?.shieldHP || 0);
    player.maxShield = _shldSys.maxShield + _gShieldHP;
    player.shield    = _shldSys.maxShield + _gShieldHP;
    player._shieldRegenRate  = _shldSys.regenRate;
    player._shieldRegenDelay = _shldSys.regenDelay;
    // Absorb from shield definition; medium chassis gets +10% absorb bonus on top.
    const _shldAbsorbBase = _shldSys.absorb ?? 0.50;
    const _chassisBonus   = loadout.chassis === 'medium' ? 0.10 : 0;
    const _gearAbsorb     = ((_gearState?.absorbPct || 0) / 100);
    player._shieldAbsorb  = Math.min(0.90, _shldAbsorbBase + _chassisBonus + _gearAbsorb);
    // Per-shield state
    player._shieldFlickerHit  = false;  // flicker_shield: tracks odd/even hits
    player._shieldAdaptStack  = 0;      // adaptive_shield: consecutive hit count
    player._shieldCounterChg  = 0;      // counter_shield: stored charge
    player._shieldRetribChg   = 0;      // retribution: stored charge
    player._shieldLayerHP     = [       // layered_shield: [layer1, layer2]
        _shldSys.layer1Max || 0, _shldSys.layer2Max || 0
    ];
    // Titan shield: add core HP bonus
    if (loadout.shld === 'titan_shield' && _shldSys.coreBonus) {
        player.maxHp  += _shldSys.coreBonus;
        player.hp     += _shldSys.coreBonus;
        if (player.comp?.core) { player.comp.core.max += _shldSys.coreBonus; player.comp.core.hp += _shldSys.coreBonus; }
    }
}

