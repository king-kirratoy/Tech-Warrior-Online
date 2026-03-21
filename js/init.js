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
  } else {
    btn.disabled         = true;
    btn.style.background = 'rgba(0,210,255,0.04)';
    btn.style.border     = '1px solid rgba(0,210,255,0.2)';
    btn.style.borderLeft = '1px solid rgba(0,210,255,0.2)';
    btn.style.color      = 'rgba(0,210,255,0.3)';
    btn.style.cursor     = 'not-allowed';
    btn.style.opacity    = '0.4';
    btn.style.boxShadow  = 'none';
  }
}

// ── Game bootstrap ─────────────────────────────────────────────────
// Deferred to window.onload so that preload/create/update (defined in the
// inline <script> at the bottom of <body>) are fully parsed and added to
// the global scope before Phaser receives them as scene callbacks.
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
