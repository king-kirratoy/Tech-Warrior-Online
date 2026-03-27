// ═══════════════════════════════════════════════════════════════
// SKILL TREE — State, overlay, and pan/zoom (Part A)
// ═══════════════════════════════════════════════════════════════

// ── State ───────────────────────────────────────────────────────
let _skillTreeData  = null;
let _skillTreeState = { allocated: {} };
let _skillTreeSVG   = null;
let _skillTreeVB    = { x: -450, y: -420, w: 900, h: 840 };
let _skillTreePanning  = false;
let _skillTreePanStart = { x: 0, y: 0 };

// ── showSkillTree ───────────────────────────────────────────────
function showSkillTree() {
  if (document.getElementById('skill-tree-overlay')) return;

  // ── Resolve chassis / pilot info ──
  const chassis = (typeof _campaignState !== 'undefined' && _campaignState.lockedChassis)
    ? _campaignState.lockedChassis
    : 'LIGHT';
  const level = (typeof _campaignState !== 'undefined' && _campaignState.playerLevel)
    ? _campaignState.playerLevel
    : 1;
  const skillPts = (typeof _campaignState !== 'undefined' && typeof _campaignState.skillPoints !== 'undefined')
    ? _campaignState.skillPoints
    : 0;

  // ── Outer overlay ──
  const overlay = document.createElement('div');
  overlay.id = 'skill-tree-overlay';
  overlay.style.cssText = [
    'position:fixed', 'inset:0',
    'background:rgba(8,11,14,0.95)',
    'z-index:9999',
    'display:flex',
    'flex-direction:column',
    'font-family:var(--font-mono)',
  ].join(';');

  // ── Top bar (44 px) ──
  const topBar = document.createElement('div');
  topBar.style.cssText = [
    'position:relative',
    'display:flex',
    'align-items:center',
    'height:44px',
    'padding:0 12px',
    'flex-shrink:0',
    'border-bottom:1px solid rgba(0,212,255,0.18)',
    'background:rgba(0,212,255,0.04)',
  ].join(';');

  // BACK button
  const backBtn = document.createElement('button');
  backBtn.className = 'tw-btn tw-btn--ghost tw-btn--sm';
  backBtn.style.cssText = 'flex:0 0 auto;width:auto;';
  backBtn.textContent = '‹ BACK';
  backBtn.addEventListener('click', hideSkillTree);

  // Title (center)
  const title = document.createElement('span');
  title.style.cssText = [
    'position:absolute',
    'left:50%',
    'transform:translateX(-50%)',
    'font-size:11px',
    'letter-spacing:4px',
    'color:#7ec8e3',
    'text-transform:uppercase',
    'pointer-events:none',
  ].join(';');
  title.textContent = 'SKILL TREE';

  // Skill points (right)
  const ptsBadge = document.createElement('span');
  ptsBadge.id = 'st-skill-points';
  ptsBadge.style.cssText = [
    'margin-left:auto',
    'font-size:11px',
    'letter-spacing:2px',
    'color:#00d4ff',
  ].join(';');
  ptsBadge.textContent = `SKILL POINTS: ${skillPts}`;

  // Zoom buttons (absolute top-right, inside top bar area)
  const zoomWrap = document.createElement('div');
  zoomWrap.style.cssText = [
    'position:absolute',
    'right:12px',
    'top:50%',
    'transform:translateY(-50%)',
    'display:flex',
    'gap:4px',
  ].join(';');

  const zoomIn = document.createElement('button');
  zoomIn.className = 'tw-btn tw-btn--ghost tw-btn--sm';
  zoomIn.style.cssText = 'width:28px;padding:0;font-size:14px;line-height:1;';
  zoomIn.textContent = '+';
  zoomIn.title = 'Zoom in';
  zoomIn.addEventListener('click', () => _skillTreeZoom(-0.2));

  const zoomOut = document.createElement('button');
  zoomOut.className = 'tw-btn tw-btn--ghost tw-btn--sm';
  zoomOut.style.cssText = 'width:28px;padding:0;font-size:14px;line-height:1;';
  zoomOut.textContent = '−';
  zoomOut.title = 'Zoom out';
  zoomOut.addEventListener('click', () => _skillTreeZoom(0.2));

  zoomWrap.appendChild(zoomIn);
  zoomWrap.appendChild(zoomOut);

  topBar.appendChild(backBtn);
  topBar.appendChild(title);
  topBar.appendChild(ptsBadge);
  topBar.appendChild(zoomWrap);

  // ── Sub-header (chassis + level) ──
  const subHeader = document.createElement('div');
  subHeader.style.cssText = [
    'text-align:center',
    'padding:6px 0 4px',
    'font-size:10px',
    'letter-spacing:3px',
    'color:#cc88ff',
    'text-transform:uppercase',
    'flex-shrink:0',
  ].join(';');
  subHeader.textContent = `${chassis.toUpperCase()} CHASSIS  ·  PILOT LEVEL ${level}`;

  // ── SVG canvas ──
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'skill-tree-svg';
  svg.style.cssText = [
    'flex:1 1 auto',
    'display:block',
    'cursor:grab',
    'overflow:hidden',
    'background:transparent',
  ].join(';');
  _skillTreeSVG = svg;
  _skillTreeApplyViewBox();

  // ── Pan/zoom event listeners ──
  svg.addEventListener('mousedown', _skillTreeOnMouseDown);
  svg.addEventListener('mousemove', _skillTreeOnMouseMove);
  svg.addEventListener('mouseup',   _skillTreeOnMouseUp);
  svg.addEventListener('mouseleave', _skillTreeOnMouseUp);
  svg.addEventListener('wheel',     _skillTreeOnWheel, { passive: false });

  // ── Bottom bar (legend) ──
  const legend = document.createElement('div');
  legend.style.cssText = [
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'gap:20px',
    'padding:8px 16px',
    'flex-shrink:0',
    'border-top:1px solid rgba(0,212,255,0.12)',
    'background:rgba(0,212,255,0.03)',
  ].join(';');

  const legendItems = [
    { label: 'ALLOCATED', fill: '#00ff88', stroke: '#00ff88' },
    { label: 'AVAILABLE', fill: 'rgba(0,212,255,0.25)', stroke: '#00d4ff' },
    { label: 'LOCKED',    fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.25)' },
    { label: 'NOTABLE',   fill: 'rgba(255,160,60,0.25)', stroke: '#ff8c00' },
    { label: 'KEYSTONE',  fill: 'rgba(180,80,255,0.25)', stroke: '#cc88ff' },
  ];

  legendItems.forEach(({ label, fill, stroke }) => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:6px;';

    // Hex icon SVG (20×20)
    const hexSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    hexSvg.setAttribute('width', '20');
    hexSvg.setAttribute('height', '20');
    hexSvg.setAttribute('viewBox', '-12 -12 24 24');
    const hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    // Regular hexagon points (flat-top, r=10)
    hex.setAttribute('points', _hexPoints(10));
    hex.setAttribute('fill', fill);
    hex.setAttribute('stroke', stroke);
    hex.setAttribute('stroke-width', '1.5');
    hexSvg.appendChild(hex);

    const lbl = document.createElement('span');
    lbl.style.cssText = `font-size:9px;letter-spacing:1.5px;color:${stroke};`;
    lbl.textContent = label;

    item.appendChild(hexSvg);
    item.appendChild(lbl);
    legend.appendChild(item);
  });

  // ── Assemble ──
  overlay.appendChild(topBar);
  overlay.appendChild(subHeader);
  overlay.appendChild(svg);
  overlay.appendChild(legend);
  document.body.appendChild(overlay);
}

// ── hideSkillTree ───────────────────────────────────────────────
function hideSkillTree() {
  const ov = document.getElementById('skill-tree-overlay');
  if (ov) ov.remove();

  // Return to mission select if that's where we came from
  const ms = document.getElementById('mission-select-overlay');
  if (ms && ms.style.display === 'none') {
    ms.style.display = 'flex';
  }
}

// ── Part B stubs ────────────────────────────────────────────────
function _renderSkillTree()   { /* Part B */ }
function _allocateNode(nodeId)  { /* Part B */ }
function _isNodeAvailable(nodeId) { /* Part B */ }
function getSkillTreeBonuses()  { return {}; }

// ══════════════════════════════════════════════════════════════
// PAN / ZOOM HELPERS
// ══════════════════════════════════════════════════════════════

/** Apply _skillTreeVB to the SVG element. */
function _skillTreeApplyViewBox() {
  if (!_skillTreeSVG) return;
  const { x, y, w, h } = _skillTreeVB;
  _skillTreeSVG.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
}

/** Clamp viewBox dimensions between min/max zoom levels. */
function _skillTreeClampVB() {
  const MIN = 400, MAX = 2000;
  _skillTreeVB.w = Math.max(MIN, Math.min(MAX, _skillTreeVB.w));
  _skillTreeVB.h = Math.max(MIN, Math.min(MAX, _skillTreeVB.h));
}

/**
 * Zoom by changing viewBox size.
 * delta > 0 = zoom out (larger VB), delta < 0 = zoom in (smaller VB).
 * cx/cy are the SVG-space focal point (defaults to VB centre).
 */
function _skillTreeZoom(delta, cx, cy) {
  const { x, y, w, h } = _skillTreeVB;
  if (cx === undefined) cx = x + w / 2;
  if (cy === undefined) cy = y + h / 2;

  const factor = 1 + delta;
  const newW = w * factor;
  const newH = h * factor;

  // Clamp
  const MIN = 400, MAX = 2000;
  const clampedW = Math.max(MIN, Math.min(MAX, newW));
  const clampedH = Math.max(MIN, Math.min(MAX, newH));

  // Adjust origin so focal point stays fixed
  _skillTreeVB.x = cx - (cx - x) * (clampedW / w);
  _skillTreeVB.y = cy - (cy - y) * (clampedH / h);
  _skillTreeVB.w = clampedW;
  _skillTreeVB.h = clampedH;

  _skillTreeApplyViewBox();
}

/** Convert a mouse event's clientX/Y to SVG-space coordinates. */
function _skillTreeClientToSVG(evt) {
  if (!_skillTreeSVG) return { x: 0, y: 0 };
  const rect = _skillTreeSVG.getBoundingClientRect();
  const svgW = rect.width  || 1;
  const svgH = rect.height || 1;
  const { x: vx, y: vy, w: vw, h: vh } = _skillTreeVB;
  return {
    x: vx + (evt.clientX - rect.left) / svgW * vw,
    y: vy + (evt.clientY - rect.top)  / svgH * vh,
  };
}

// ── Mouse event handlers ────────────────────────────────────────
function _skillTreeOnMouseDown(evt) {
  if (evt.button !== 0) return;
  _skillTreePanning = true;
  _skillTreePanStart = { x: evt.clientX, y: evt.clientY };
  if (_skillTreeSVG) _skillTreeSVG.style.cursor = 'grabbing';
  evt.preventDefault();
}

function _skillTreeOnMouseMove(evt) {
  if (!_skillTreePanning) return;
  const dx = evt.clientX - _skillTreePanStart.x;
  const dy = evt.clientY - _skillTreePanStart.y;
  _skillTreePanStart = { x: evt.clientX, y: evt.clientY };

  // Convert pixel delta to SVG-space delta
  const rect = _skillTreeSVG ? _skillTreeSVG.getBoundingClientRect() : { width: 1, height: 1 };
  const scaleX = _skillTreeVB.w / (rect.width  || 1);
  const scaleY = _skillTreeVB.h / (rect.height || 1);

  _skillTreeVB.x -= dx * scaleX;
  _skillTreeVB.y -= dy * scaleY;
  _skillTreeApplyViewBox();
  evt.preventDefault();
}

function _skillTreeOnMouseUp() {
  _skillTreePanning = false;
  if (_skillTreeSVG) _skillTreeSVG.style.cursor = 'grab';
}

function _skillTreeOnWheel(evt) {
  evt.preventDefault();
  const delta = evt.deltaY > 0 ? 0.12 : -0.12;
  const focal = _skillTreeClientToSVG(evt);
  _skillTreeZoom(delta, focal.x, focal.y);
}

// ── Utility ─────────────────────────────────────────────────────
/** Return SVG polygon points string for a flat-top regular hexagon of radius r. */
function _hexPoints(r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push(`${(r * Math.cos(angle)).toFixed(3)},${(r * Math.sin(angle)).toFixed(3)}`);
  }
  return pts.join(' ');
}
