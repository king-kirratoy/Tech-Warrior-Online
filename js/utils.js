// ═══════════ UTILS ═══════════
// Pure helper functions — no side effects on global game state.
// Shared by index.html and all external JS files via window globals.
// Load order: after audio.js, before loot-system.js


// ── Colour utilities ──────────────────────────────────────────────

/** Darkens a packed RGB hex colour by a multiplier (0–1). */
function darkenColor(hex, amount = 0.4) {
  if (hex == null) return 0x333333;
  const r = ((hex >> 16) & 0xFF) * amount;
  const g = ((hex >>  8) & 0xFF) * amount;
  const b = ( hex        & 0xFF) * amount;
  return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
}


// ── Chassis stats ─────────────────────────────────────────────────

/** Returns the sum of all component HP for a given chassis type. */
function getTotalHP(type) {
  const s = CHASSIS[type];
  return s ? s.coreHP + s.armHP * 2 + s.legHP : 0;
}


// ── HUD name lookup ───────────────────────────────────────────────

// Full display names for HUD (longer than the short WEAPONS.name)
const HUD_NAMES = {
  smg:'SUBMACHINE GUN', mg:'MACHINE GUN', sg:'SHOTGUN', br:'BATTLE RIFLE',
  hr:'HEAVY RIFLE', fth:'FLAMETHROWER', sr:'SNIPER RIFLE', gl:'GRENADE LAUNCHER',
  rl:'ROCKET LAUNCHER', plsm:'PLASMA CANNON', rail:'RAILGUN',
  jump:'JUMP JETS', barrier:'BARRIER', rage:'RAGE MODE', emp:'EMP BURST',
  repair:'REPAIR DRONE', atk_drone:'ATTACK DRONE', missile:'MISSILE POD',
  decoy:'DECOY', ghost_step:'GHOST STEP', overclock_burst:'OVERCLOCK BURST',
  fortress_mode:'FORTRESS MODE',
  light_shield:'LIGHT SHIELD', standard_shield:'STD. SHIELD',
  heavy_shield:'HEAVY SHIELD', reactive_shield:'REACTIVE SHIELD',
  fortress_shield:'FORTRESS SHIELD', phase_shield:'PHASE SHIELD',
  smoke_burst:'SMOKE BURST', micro_shield:'MICRO SHIELD',
  flicker_shield:'FLICKER SHIELD', mirror_shield:'MIRROR SHIELD',
  adaptive_shield:'ADAPTIVE SHIELD', counter_shield:'COUNTER SHIELD',
  pulse_shield:'PULSE SHIELD', layered_shield:'LAYERED SHIELD',
  overcharge_shld:'OVERCHARGE SHLD', siege_wall:'SIEGE WALL',
  bulwark_shield:'BULWARK SHIELD', retribution_shld:'RETRIBUTION',
  thermal_shield:'THERMAL SHIELD', titan_shield:'TITAN SHIELD',
};

function _hudName(key) {
  if (!key || key === 'none') return '—';
  return HUD_NAMES[key] || WEAPONS[key]?.name || key.toUpperCase();
}


// ── Visual FX ─────────────────────────────────────────────────────

function showDamageText(scene, x, y, amount, hasShield = false) {
  if (amount <= 0 && !isShieldActive && !hasShield) return;

  let color    = '#ffff00';
  let fontSize = '20px';

  if (hasShield) {
    color    = '#00ffff';
    fontSize = '22px';
  } else if (amount >= 150) {
    color    = '#ff0055';
    fontSize = '28px';
  } else if (amount >= 90) {
    color    = '#ffaa00';
    fontSize = '24px';
  }

  const label = amount === 0 ? 'BLOCK' : amount;
  const txt   = scene.add.text(x, y - 20, label, {
    font: `bold ${fontSize} monospace`,
    fill: color,
    stroke: '#000000',
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(100);
  txt.setShadow(0, 0, color, 8, true, true);

  scene.tweens.add({
    targets: txt, y: y - 100, alpha: 0,
    scale:    amount >= 90 ? 1.3 : 1.0,
    duration: 1500, hold: 500, ease: 'Back.easeOut',
    onComplete: () => txt.destroy()
  });
}

function createImpactSparks(scene, x, y) {
  for (let i = 0; i < 6; i++) {
    const color = Phaser.Math.RND.pick([0xffaa00, 0xffff00, 0xffffff]);
    const spark = scene.add.rectangle(x, y, 6, 2, color).setDepth(20);
    scene.physics.add.existing(spark);
    const angle = Math.random() * Math.PI * 2;
    scene.physics.velocityFromRotation(angle, 200 + Math.random() * 250, spark.body.velocity);
    spark.body.setAccelerationY(400);
    scene.tweens.add({ targets: spark, alpha: 0, scaleX: 0, duration: 300, onComplete: () => spark.destroy() });
  }
}

function createShieldSparks(scene, x, y) {
  for (let i = 0; i < 5; i++) {
    const spark = scene.add.rectangle(x, y, 10, 2, 0x00ffff).setDepth(100);
    scene.physics.add.existing(spark);
    const angle = Math.random() * Math.PI * 2;
    scene.physics.velocityFromRotation(angle, Phaser.Math.Between(400, 600), spark.body.velocity);
    scene.tweens.add({ targets: spark, alpha: 0, scaleX: 2, duration: 150, onComplete: () => spark.destroy() });
  }
}

function createShieldBreak(scene, x, y) {
  const side   = 14;
  const h      = side * (Math.sqrt(3) / 2);
  const count  = 15;

  for (let i = 0; i < count; i++) {
    const shard = scene.add.triangle(x, y, 0, -h/2, side/2, h/2, -side/2, h/2, 0xddffff, 0.8)
      .setStrokeStyle(1.5, 0x00ffff, 1);
    scene.physics.add.existing(shard);
    const angle = Math.random() * Math.PI * 2;
    scene.physics.velocityFromRotation(angle, Phaser.Math.Between(150, 400), shard.body.velocity);
    shard.body.setAngularVelocity(Phaser.Math.Between(-600, 600));
    shard.body.setDrag(80);
    scene.tweens.add({
      targets: shard,
      alpha: 0, scale: { start: 0.8, end: 0.1 },
      duration: 1200, ease: 'Cubic.easeOut',
      onComplete: () => shard.destroy()
    });
  }
  scene.cameras.main.shake(250, 0.007);
}

function createMuzzleFlash(scene, x, y, angle, distance = 40, color = 0xffffff) {
  if (!scene?.add) return;
  const fx = scene.add.circle(
    x + Math.cos(angle) * distance,
    y + Math.sin(angle) * distance,
    6, color, 1
  ).setDepth(15);
  scene.tweens.add({ targets: fx, scale: 0.2, duration: 50, onComplete: () => fx.destroy() });
}

function spawnDebris(scene, x, y, color) {
  for (let i = 0; i < 8; i++) {
    const chunk = scene.add.rectangle(
      x, y,
      Phaser.Math.Between(5, 15), Phaser.Math.Between(5, 15),
      color
    ).setStrokeStyle(1, 0xffffff);
    scene.physics.add.existing(chunk);
    scene.physics.velocityFromRotation(Math.random() * Math.PI * 2, Phaser.Math.Between(150, 400), chunk.body.velocity);
    chunk.body.setAngularVelocity(Phaser.Math.Between(-500, 500));
    chunk.body.setDrag(200);
    scene.tweens.add({
      targets: chunk, alpha: 0, scale: 0.5,
      duration: Phaser.Math.Between(800, 1500),
      onComplete: () => chunk.destroy()
    });
  }
}

/**
 * Shared helper — stamps a single boot-shaped rectangle on the ground.
 * @param {number} w        print width
 * @param {number} h        print height
 * @param {number} fadeTime ms until fully transparent
 */
function spawnFootprint(scene, x, y, rotation, w, h, fadeTime, color) {
  const printColor = color !== undefined ? color : loadout.color;
  const print = scene.add.rectangle(x, y, w, h, printColor, 0.6)
    .setRotation(rotation)
    .setDepth(2);
  scene.tweens.add({
    targets:  print,
    alpha:    0,
    duration: fadeTime,
    ease:     'Cubic.easeIn',
    onComplete: () => print.destroy()
  });
}


// ═══════════ STRING SANITIZATION HELPERS ═══════════

/** Strip disallowed chars and enforce length on a callsign string. */
function _sanitizeCallsign(raw) {
    return String(raw || '').toUpperCase().replace(/[^A-Z0-9 _.\-]/g, '').slice(0, 16) || 'ANONYMOUS';
}

/** Escape HTML special characters in a string before DOM insertion. */
function _escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
