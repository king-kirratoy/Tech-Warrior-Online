// ═══════════ ENTRY POINT ═══════════

// ── Animated grid ─────────────────────────────────────────────────
// Draws a scrolling cyan grid on a <canvas> element.
function _startGridCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  let offset = 0;
  function draw() {
    if (!document.getElementById(canvasId)) return; // stop if removed
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const spacing = 48;
    ctx.strokeStyle = 'rgba(0,255,255,0.06)';
    ctx.lineWidth   = 1;
    for (let y = (offset % spacing); y < canvas.height; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    for (let x = 0; x < canvas.width; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.6
    );
    grad.addColorStop(0,   'rgba(0,255,255,0.04)');
    grad.addColorStop(0.5, 'rgba(0,255,255,0.01)');
    grad.addColorStop(1,   'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    offset += 0.4;
    requestAnimationFrame(draw);
  }
  setTimeout(draw, 50);
}

function startMenuGrid() {
  _startGridCanvas('menu-canvas');
  _startGridCanvas('callsign-canvas');
}

// ── Callsign input handlers ────────────────────────────────────────
function _csKeyDown(e, el) {
  if (e.key === 'Enter') { proceedToMainMenu(); return; }
  // Let through: Backspace, Delete, Arrow keys, Tab, Home, End
  if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End', 'Tab'].indexOf(e.key) !== -1) {
    setTimeout(function() { _updateCallsignBtn(); }, 0);
    return;
  }
  // Let through ctrl/meta combos (copy/paste/select-all)
  if (e.ctrlKey || e.metaKey) return;
  // For all other keys: prevent browser default, handle manually
  e.preventDefault();
  const ch = e.key.length === 1 ? e.key.toUpperCase() : '';
  if (!ch || !/^[A-Z0-9 _.\-]$/.test(ch)) return;
  const start = el.selectionStart, end = el.selectionEnd;
  const val = el.value;
  if (val.length >= el.maxLength && start === end) return; // at max length
  el.value = val.slice(0, start) + ch + val.slice(end);
  el.setSelectionRange(start + 1, start + 1);
  _updateCallsignBtn();
}

function _updateCallsignBtn() {
  const val = (document.getElementById('menu-callsign')?.value || '').trim();
  const btn = document.getElementById('callsign-proceed-btn');
  if (!btn) return;
  if (val.length > 0) {
    btn.disabled         = false;
    btn.style.background = 'rgba(0,210,255,0.08)';
    btn.style.border     = '1px solid rgba(0,210,255,0.6)';
    btn.style.borderLeft = '3px solid #00e0ff';
    btn.style.color      = '#00e0ff';
    btn.style.cursor     = 'pointer';
    btn.style.opacity    = '1';
    btn.style.boxShadow  = '0 0 12px rgba(0,210,255,0.15)';
    btn.style.letterSpacing = '4px';
    btn.onmouseover = function() {
      this.style.background    = 'rgba(0,210,255,0.15)';
      this.style.borderColor   = 'rgba(0,210,255,0.9)';
      this.style.color         = '#fff';
      this.style.letterSpacing = '6px';
      this.style.boxShadow     = '0 0 30px rgba(0,210,255,0.3)';
    };
    btn.onmouseout = function() {
      this.style.background    = 'rgba(0,210,255,0.08)';
      this.style.borderColor   = 'rgba(0,210,255,0.6)';
      this.style.color         = '#00e0ff';
      this.style.letterSpacing = '4px';
      this.style.boxShadow     = '0 0 12px rgba(0,210,255,0.15)';
    };
  } else {
    btn.disabled         = true;
    btn.style.background = 'rgba(0,210,255,0.04)';
    btn.style.border     = '1px solid rgba(0,210,255,0.2)';
    btn.style.borderLeft = '1px solid rgba(0,210,255,0.2)';
    btn.style.color      = 'rgba(0,210,255,0.3)';
    btn.style.cursor     = 'not-allowed';
    btn.style.opacity    = '0.4';
    btn.style.boxShadow  = 'none';
    btn.onmouseover = null;
    btn.onmouseout  = null;
  }
}

// ── Version display ────────────────────────────────────────────────
// Populate all .menu-version elements from the GAME_VERSION constant.
(function() {
    const ver = (typeof GAME_VERSION !== 'undefined') ? GAME_VERSION : '';
    const label = ver + ' // ALPHA BUILD';
    const els = document.querySelectorAll('.menu-version');
    els.forEach(function(el) { el.textContent = label; });
})();

// ── Game bootstrap ─────────────────────────────────────────────────
// Deferred to window.onload so that preload/create/update (defined in the
// inline <script> at the bottom of <body>) are fully parsed and added to
// the global scope before Phaser receives them as scene callbacks.
// ── Callsign pre-fill ──────────────────────────────────────────────
// Pre-fill the callsign input and update button state from localStorage.
(function() {
    try {
        const saved = localStorage.getItem('tw_callsign');
        const el = document.getElementById('menu-callsign');
        if (saved && el) {
            el.value = saved;
            const btn = document.getElementById('callsign-proceed-btn');
            if (btn) {
                btn.disabled = false;
                btn.style.background    = 'rgba(0,210,255,0.08)';
                btn.style.border        = '1px solid rgba(0,210,255,0.6)';
                btn.style.borderLeft    = '3px solid #00e0ff';
                btn.style.color         = '#00e0ff';
                btn.style.cursor        = 'pointer';
                btn.style.opacity       = '1';
            }
        }
    } catch(e) {}
})();

// ── Objective round-end handler ────────────────────────────────────
// Called every frame from update(). Detects when a non-boss objective
// (survival timer, assassination) reports completion via shouldEndRound()
// and triggers the extraction sequence in place of a kill-based ending.
function handleObjectiveRoundEnd(scene) {
    if (_extractionActive || !_roundActive) return;
    const isBossRound = _round > 0 && _round % 5 === 0;
    if (isBossRound) return;
    if (typeof shouldEndRound !== 'function' || !shouldEndRound()) return;
    _roundActive = false;
    if (enemyBullets) enemyBullets.getChildren().slice().forEach(b => { if (b?.active) b.destroy(); });
    enemies?.getChildren().slice().forEach(e => {
        try { destroyEnemyWithCleanup(scene, e); } catch(ex) {}
    });
    _roundKills = _roundTotal;
    _spawnExtractionPoint(scene);
    showRoundBanner('OBJECTIVE COMPLETE', 'REACH EXTRACTION POINT', 2500, null);
}

// ── Phaser scene lifecycle ─────────────────────────────────────────

function preload() {
    // Soft white circle — used by damage smoke particles
    let g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(10, 10, 10);
    g.generateTexture('smoke', 20, 20);

    // Bright radial bloom — used exclusively by the thrust exhaust emitter.
    // Concentric circles from opaque centre to transparent edge give a
    // convincing glow that responds well to tinting + ADD blend mode.
    let tg = this.make.graphics({ x: 0, y: 0, add: false });
    for (let i = 8; i >= 0; i--) {
        tg.fillStyle(0xffffff, (i / 8));
        tg.fillCircle(16, 16, (8 - i + 1) * 2);
    }
    tg.generateTexture('thrust', 32, 32);
}

function create() {
    // Battlefield grid — hidden until deployed
    const _bfGrid = this.add.grid(WORLD_CENTER, WORLD_CENTER, WORLD_SIZE, WORLD_SIZE, 64, 64, 0, 0, 0x004400, 0.3);
    _bfGrid.setVisible(false);
    this._bfGrid = _bfGrid;

    // Input
    keys = this.input.keyboard.addKeys('W,A,S,D,SPACE,E');

    // Prevent right-click context menu on the GAME canvas so RMB can fire R arm
    const _canvas = this.sys.canvas;
    if (_canvas) _canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Right mouse button fires R arm — handled in handlePlayerFiring each frame

    // Physics groups
    bullets      = this.physics.add.group();
    enemies      = this.physics.add.group();
    enemyBullets = this.physics.add.group();
    coverObjects = this.physics.add.staticGroup();
    generateCover(this);

    // Bullet ↔ cover — registered ONCE against the group reference (generateCover regenerates
    // the group's children on each deploy but these colliders stay valid)
    this.physics.add.collider(bullets, coverObjects, (bullet, cover) => {
        if (!bullet?.active) return;
        createImpactSparks(this, bullet.x, bullet.y);
        bullet.destroy();
        if (cover.coverHp > 0) damageCover(this, cover, bullet.damageValue || 10);
    });
    this.physics.add.collider(enemyBullets, coverObjects, (bullet, cover) => {
        if (!bullet?.active) return;
        bullet.destroy();
        if (cover.coverHp > 0) damageCover(this, cover, bullet.damageValue || 10);
    });

    // Player bullet ↔ enemy overlap — logic lives in handleBulletEnemyOverlap()
    this.physics.add.overlap(bullets, enemies, (bullet, enemy) => handleBulletEnemyOverlap(this, bullet, enemy));

    // (enemies spawned on deploy, not at scene creation)

    // Hangar overlay (hidden once deployed)
    this.hangarOverlay = this.add.rectangle(
        window.innerWidth / 2, window.innerHeight / 2,
        window.innerWidth, window.innerHeight,
        0x0c1014, 1.0
    ).setScrollFactor(0).setDepth(1000);
}

function update(time) {
    // PVP multiplayer: always interpolate remote players, even when dead/paused
    if (typeof mpUpdate === 'function') mpUpdate(time);

    if (!isDeployed || _isPaused || _roundClearing) return;

    // Safety: clear stuck damage processing lock (prevents permanent freeze)
    if (player?.isProcessingDamage && player._dmgLockTime && time - player._dmgLockTime > 200) {
        player.isProcessingDamage = false;
    }
    if (player?.isProcessingDamage && !player._dmgLockTime) {
        player._dmgLockTime = time;
    } else if (!player?.isProcessingDamage) {
        if (player) player._dmgLockTime = 0;
    }

    handleShieldRegen(time);
    // Skip PvE enemy AI in PVP (enemies group is empty but avoid any edge cases)
    if (_gameMode !== 'pvp') handleEnemyAI(this, time);
    handlePlayerMovement(this, time);
    handlePlayerFiring(this);
    handleRageGhosts(this, time);
    syncVisuals(this, time);
    updateCooldownOverlays(time);
    drawMinimap();
    // Skip PvE-only per-frame systems in PVP
    if (_gameMode !== 'pvp') {
        checkLootPickups(this);
        checkEquipmentPickups(this);                                                   // → js/loot-system.js
        if (_extractionActive) _updateExtraction(this);                                // extraction point check
        // Check for objective-based round end between kills (e.g., survival timer expires)
        if (typeof handleObjectiveRoundEnd === 'function') handleObjectiveRoundEnd(this);
        if (typeof updateSpecialEnemies === 'function') updateSpecialEnemies(this, time); // → js/enemy-types.js
        if (typeof updateObjectives === 'function') updateObjectives(this, time);         // → js/arena-objectives.js
        if (typeof updateColossusStand === 'function') updateColossusStand(time);         // → js/loot-system.js (Colossus Frame unique)
    }
}

window.onload = () => {
  // Wire the Phaser scene now that preload/create/update are globally defined.
  GAME_CONFIG.scene = { preload, create, update };
  GAME = new Phaser.Game(GAME_CONFIG);

  // Each run starts fresh — no carried-over gear.
  if (typeof resetInventory === 'function') resetInventory();

  startMenuGrid();
  refreshGarage();
  updateHUD();
  // Hide hangar UI until after main menu.
  document.getElementById('ui-layer').style.display = 'none';
};
