// ═══════════════════════════════════════════════════════════════
// SKILL TREE — State, overlay, pan/zoom, rendering, interaction
// ═══════════════════════════════════════════════════════════════

// ── State ───────────────────────────────────────────────────────
let _skillTreeData  = null;   // array of node objects for current chassis
let _stNodeMap      = {};     // id → node lookup
let _skillTreeState = { allocated: {} };
let _skillTreeSVG   = null;
let _skillTreeVB    = { x: -450, y: -420, w: 900, h: 840 };
let _skillTreePanning  = false;
let _skillTreePanStart = { x: 0, y: 0 };
let _skillTreeHoverCard = null;

// ── showSkillTree ───────────────────────────────────────────────
function showSkillTree() {
  if (document.getElementById('skill-tree-overlay')) return;

  // ── Resolve chassis / pilot info ──
  const chassis = (typeof _campaignState !== 'undefined' && _campaignState.lockedChassis)
    ? _campaignState.lockedChassis
    : 'LIGHT';

  // ── Init node data ──
  const chassisKey = (chassis || 'light').toLowerCase();
  _skillTreeData = (typeof SKILL_TREE_DATA !== 'undefined' && SKILL_TREE_DATA[chassisKey])
    ? SKILL_TREE_DATA[chassisKey]
    : (typeof SKILL_TREE_DATA !== 'undefined' ? SKILL_TREE_DATA.light : []);
  _stNodeMap = {};
  _skillTreeData.forEach(n => { _stNodeMap[n.id] = n; });
  const level = (typeof _campaignState !== 'undefined' && _campaignState.playerLevel)
    ? _campaignState.playerLevel
    : 1;
  let _stInitSpent = 0;
  Object.values(_skillTreeState.allocated).forEach(r => { _stInitSpent += r; });
  const skillPts = Math.max(0, level - _stInitSpent);

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

  // ── Hover card (created once, reused for all nodes) ──
  const hoverCard = document.createElement('div');
  hoverCard.id = 'st-hover-card';
  hoverCard.style.cssText = [
    'position:fixed',
    'background:#0c1014',
    'border:1px solid #00d4ff',
    'padding:10px 14px',
    'min-width:200px',
    'max-width:280px',
    'pointer-events:none',
    'z-index:100000',
    'display:none',
    'font-family:var(--font-mono)',
    'font-size:11px',
    'line-height:1.5',
  ].join(';');
  document.body.appendChild(hoverCard);
  _skillTreeHoverCard = hoverCard;

  // ── Assemble ──
  overlay.appendChild(topBar);
  overlay.appendChild(subHeader);
  overlay.appendChild(svg);
  overlay.appendChild(legend);
  document.body.appendChild(overlay);

  // ── Initial render ──
  _renderSkillTree();
}

// ── hideSkillTree ───────────────────────────────────────────────
function hideSkillTree() {
  const ov = document.getElementById('skill-tree-overlay');
  if (ov) ov.remove();

  // Remove hover card from DOM
  if (_skillTreeHoverCard) {
    _skillTreeHoverCard.remove();
    _skillTreeHoverCard = null;
  }

  // Return to mission select if that's where we came from
  const ms = document.getElementById('mission-select-overlay');
  if (ms && ms.style.display === 'none') {
    ms.style.display = 'flex';
  }
}

// ══════════════════════════════════════════════════════════════
// PART B — Rendering, hover, allocation, bonuses
// ══════════════════════════════════════════════════════════════

// ── Node state helpers ───────────────────────────────────────────

/** Return 'allocated' | 'available' | 'locked' for a node. */
function _stGetNodeState(nodeId) {
  const node = _stNodeMap[nodeId];
  if (!node) return 'locked';
  if (node.t === 'start' || (_skillTreeState.allocated[nodeId] || 0) > 0) return 'allocated';
  for (const cId of (node.c || [])) {
    const cn = _stNodeMap[cId];
    if (cn && (cn.t === 'start' || (_skillTreeState.allocated[cId] || 0) > 0)) return 'available';
  }
  return 'locked';
}

function _isNodeAvailable(nodeId) {
  return _stGetNodeState(nodeId) === 'available';
}

// ── Hex geometry ─────────────────────────────────────────────────

/** Return SVG polygon points string for a hex centered at (cx, cy) with radius r.
 *  Uses pointy-top orientation: angle = PI/3*i - PI/2. */
function _hexPointsAt(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(' ');
}

// ── Render ───────────────────────────────────────────────────────

function _renderSkillTree() {
  if (!_skillTreeSVG || !_skillTreeData || _skillTreeData.length === 0) return;

  const NS = 'http://www.w3.org/2000/svg';

  // Clear SVG
  while (_skillTreeSVG.firstChild) _skillTreeSVG.removeChild(_skillTreeSVG.firstChild);

  // Precompute all node states
  const states = {};
  _skillTreeData.forEach(n => { states[n.id] = _stGetNodeState(n.id); });

  // ── Connection lines (drawn before nodes) ──
  const drawnPairs = new Set();

  _skillTreeData.forEach(node => {
    (node.c || []).forEach(cId => {
      // Deduplicate: sort the two IDs to form a canonical pair key
      const a = node.id < cId ? node.id : cId;
      const b = node.id < cId ? cId : node.id;
      const pairKey = a + '|' + b;
      if (drawnPairs.has(pairKey)) return;
      drawnPairs.add(pairKey);

      const other = _stNodeMap[cId];
      if (!other) return;

      const stA = states[node.id];
      const stB = states[cId];
      let lineColor;
      if (stA === 'allocated' && stB === 'allocated') {
        lineColor = 'rgba(0,255,136,0.35)';
      } else if (stA === 'allocated' || stB === 'allocated') {
        lineColor = 'rgba(0,212,255,0.2)';
      } else {
        lineColor = 'rgba(255,255,255,0.06)';
      }

      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', node.x);
      line.setAttribute('y1', node.y);
      line.setAttribute('x2', other.x);
      line.setAttribute('y2', other.y);
      line.setAttribute('stroke', lineColor);
      line.setAttribute('stroke-width', '1.5');
      _skillTreeSVG.appendChild(line);
    });
  });

  // ── Radii by type ──
  const RADII = { start: 32, keystone: 24, notable: 19, regular: 14 };

  // ── Hex nodes ──
  _skillTreeData.forEach(node => {
    const st = states[node.id];
    const r  = RADII[node.t] || 14;
    const cx = node.x, cy = node.y;

    let fill, stroke;
    if (node.t === 'start') {
      fill = 'rgba(0,212,255,0.08)'; stroke = '#00d4ff';
    } else if (node.t === 'keystone') {
      if (st === 'allocated')      { fill = 'rgba(204,136,255,0.15)'; stroke = '#cc88ff'; }
      else if (st === 'available') { fill = 'rgba(204,136,255,0.08)'; stroke = 'rgba(204,136,255,0.5)'; }
      else                         { fill = 'rgba(204,136,255,0.04)'; stroke = 'rgba(204,136,255,0.2)'; }
    } else if (node.t === 'notable') {
      if (st === 'allocated')      { fill = 'rgba(232,146,58,0.15)'; stroke = '#e8923a'; }
      else if (st === 'available') { fill = 'rgba(232,146,58,0.08)'; stroke = 'rgba(232,146,58,0.5)'; }
      else                         { fill = 'rgba(232,146,58,0.04)'; stroke = 'rgba(232,146,58,0.2)'; }
    } else {
      if (st === 'allocated')      { fill = 'rgba(0,255,136,0.15)'; stroke = '#00ff88'; }
      else if (st === 'available') { fill = 'rgba(0,212,255,0.12)'; stroke = '#00d4ff'; }
      else                         { fill = 'rgba(255,255,255,0.03)'; stroke = 'rgba(255,255,255,0.12)'; }
    }

    // Group
    const g = document.createElementNS(NS, 'g');
    g.style.cursor = (st === 'available' || (st === 'allocated' && node.t !== 'start' && (_skillTreeState.allocated[node.id] || 0) < node.r))
      ? 'pointer' : 'default';

    // Hex polygon
    const poly = document.createElementNS(NS, 'polygon');
    poly.setAttribute('points', _hexPointsAt(cx, cy, r));
    poly.setAttribute('fill', fill);
    poly.setAttribute('stroke', stroke);
    poly.setAttribute('stroke-width', '1.5');
    g.appendChild(poly);

    // Text inside hex
    if (node.t === 'start') {
      const t1 = document.createElementNS(NS, 'text');
      t1.setAttribute('x', cx); t1.setAttribute('y', cy - 4);
      t1.setAttribute('text-anchor', 'middle');
      t1.setAttribute('font-size', '8');
      t1.setAttribute('font-family', 'monospace');
      t1.setAttribute('fill', '#00d4ff');
      t1.textContent = 'LIGHT';
      g.appendChild(t1);

      const t2 = document.createElementNS(NS, 'text');
      t2.setAttribute('x', cx); t2.setAttribute('y', cy + 7);
      t2.setAttribute('text-anchor', 'middle');
      t2.setAttribute('font-size', '8');
      t2.setAttribute('font-family', 'monospace');
      t2.setAttribute('fill', '#00d4ff');
      t2.textContent = 'CHASSIS';
      g.appendChild(t2);
    } else if (node.t === 'keystone') {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', cx); t.setAttribute('y', cy + 2);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '6');
      t.setAttribute('font-family', 'monospace');
      t.setAttribute('fill', stroke);
      t.textContent = node.n.substring(0, 9).toUpperCase();
      g.appendChild(t);
    } else if (node.t === 'notable') {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', cx); t.setAttribute('y', cy + 2);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '5.5');
      t.setAttribute('font-family', 'monospace');
      t.setAttribute('fill', stroke);
      t.textContent = node.n.substring(0, 8).toUpperCase();
      g.appendChild(t);
    } else {
      const rank = _skillTreeState.allocated[node.id] || 0;
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', cx); t.setAttribute('y', cy + 3);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '8');
      t.setAttribute('font-family', 'monospace');
      t.setAttribute('fill', stroke);
      t.textContent = `${rank}/${node.r}`;
      g.appendChild(t);
    }

    // Interaction events (use let to capture node by reference)
    const _node = node;
    g.addEventListener('mouseenter', (evt) => {
      if (_skillTreePanning) return;
      _stShowHover(_node, evt);
    });
    g.addEventListener('mouseleave', () => _stHideHover());
    g.addEventListener('click', (evt) => {
      evt.stopPropagation();
      _allocateNode(_node.id);
    });

    _skillTreeSVG.appendChild(g);
  });
}

// ── Hover card ───────────────────────────────────────────────────

function _stShowHover(node, evt) {
  const card = _skillTreeHoverCard;
  if (!card) return;

  const st = _stGetNodeState(node.id);
  const rank = (node.t === 'start') ? 0 : (_skillTreeState.allocated[node.id] || 0);
  const maxRank = node.r || 0;

  // Available points
  let totalSpent = 0;
  Object.values(_skillTreeState.allocated).forEach(r => { totalSpent += r; });
  const level = (typeof _campaignState !== 'undefined' && _campaignState.playerLevel)
    ? _campaignState.playerLevel : 1;
  const pts = level - totalSpent;

  let actionText;
  if (node.t === 'start') {
    actionText = 'CORE NODE';
  } else if (st === 'locked') {
    actionText = 'LOCKED';
  } else if (rank >= maxRank) {
    actionText = 'MAXED';
  } else if (st === 'available') {
    actionText = 'CLICK TO ALLOCATE';
  } else {
    actionText = pts > 0 ? 'ADD RANK' : 'NO POINTS';
  }
  const actionColor = (actionText === 'LOCKED' || actionText === 'MAXED' || actionText === 'NO POINTS')
    ? 'rgba(255,255,255,0.35)' : '#00ff88';

  const rankLine = node.t === 'start'
    ? 'Always active'
    : `Rank ${rank} / ${maxRank}`;

  card.innerHTML =
    `<div style="color:#00ff88;font-size:10px;letter-spacing:1px;margin-bottom:2px">${node.s || ''}</div>` +
    `<div style="color:#e8923a;font-size:11px;font-weight:bold;letter-spacing:2px">${node.n}</div>` +
    `<div style="color:rgba(0,212,255,0.7);font-size:9px;margin-bottom:6px">${rankLine}</div>` +
    `<div style="border-top:1px solid rgba(0,212,255,0.15);margin-bottom:6px"></div>` +
    `<div style="color:rgba(255,255,255,0.65);font-size:10px;margin-bottom:6px">${node.d}</div>` +
    `<div style="color:${actionColor};font-size:9px;letter-spacing:2px">${actionText}</div>`;

  card.style.display = 'block';
  _stPositionHover(evt);
}

function _stPositionHover(evt) {
  const card = _skillTreeHoverCard;
  if (!card || card.style.display === 'none') return;
  const margin = 12;
  const cw = card.offsetWidth || 240;
  const ch = card.offsetHeight || 120;
  let left = evt.clientX + margin;
  let top  = evt.clientY + margin;
  if (left + cw > window.innerWidth  - margin) left = evt.clientX - cw - margin;
  if (top  + ch > window.innerHeight - margin) top  = evt.clientY - ch - margin;
  card.style.left = left + 'px';
  card.style.top  = top  + 'px';
}

function _stHideHover() {
  if (_skillTreeHoverCard) _skillTreeHoverCard.style.display = 'none';
}

// ── Allocation ───────────────────────────────────────────────────

function _allocateNode(nodeId) {
  const node = _stNodeMap[nodeId];
  if (!node || node.t === 'start') return;

  const st = _stGetNodeState(nodeId);
  const rank = _skillTreeState.allocated[nodeId] || 0;
  const maxRank = node.r || 1;

  if (rank >= maxRank) return;               // maxed
  if (st !== 'available' && st !== 'allocated') return; // locked

  // Count spent points
  let totalSpent = 0;
  Object.values(_skillTreeState.allocated).forEach(r => { totalSpent += r; });
  const level = (typeof _campaignState !== 'undefined' && _campaignState.playerLevel)
    ? _campaignState.playerLevel : 1;
  const pts = level - totalSpent;
  if (pts <= 0) return;  // no points remaining

  _skillTreeState.allocated[nodeId] = rank + 1;

  // Update points display
  const badge = document.getElementById('st-skill-points');
  if (badge) badge.textContent = `SKILL POINTS: ${pts - 1}`;

  _stHideHover();
  _renderSkillTree();
}

// ── Skill tree bonuses ───────────────────────────────────────────

/** Parse a stat string like "+2% DMG +10 ALL HP" into a bonuses object. */
function _parseSkillStatString(s) {
  if (!s) return {};
  const b = {};
  const add = (key, val) => { b[key] = (b[key] || 0) + val; };

  // Order matters: more specific patterns first (CRIT DMG before CRIT, SHIELD REGEN before REGEN)
  const patterns = [
    [/\+(\d+(?:\.\d+)?)% CRIT DMG/g,      v => add('critDmgPct', +v)],
    [/\+(\d+(?:\.\d+)?)% CRIT/g,           v => add('critPct', +v)],
    [/\+(\d+(?:\.\d+)?)% SHIELD ABSORB/g,  v => add('shieldAbsorbPct', +v)],
    [/\+(\d+(?:\.\d+)?)% SHIELD REGEN/g,   v => add('shieldRegenPct', +v)],
    [/\+(\d+(?:\.\d+)?)% REGEN/g,          v => add('shieldRegenPct', +v)],
    [/\+(\d+(?:\.\d+)?) SHIELD HP/g,       v => add('shieldHP', +v)],
    [/\+(\d+(?:\.\d+)?) SHIELD/g,          v => add('shieldHP', +v)],
    [/\+(\d+(?:\.\d+)?) ALL HP/g,          v => add('allHP', +v)],
    [/\+(\d+(?:\.\d+)?) ARM HP/g,          v => add('armHP', +v)],
    [/\+(\d+(?:\.\d+)?) CORE HP/g,         v => add('coreHP', +v)],
    [/\+(\d+(?:\.\d+)?) LEG HP/g,          v => add('legHP', +v)],
    [/\+(\d+(?:\.\d+)?)% FIRE RATE/g,      v => add('fireRatePct', +v)],
    [/\+(\d+(?:\.\d+)?)% (?:SMG |SG |MG |BR |SR |GL |RL |HR |PLSM |FTH )?FR/g, v => add('fireRatePct', +v)],
    [/\+(\d+(?:\.\d+)?)% SPEED/g,          v => add('speedPct', +v)],
    [/\+(\d+(?:\.\d+)?)% DODGE/g,          v => add('dodgePct', +v)],
    [/\+(\d+(?:\.\d+)?)% DR/g,             v => add('drPct', +v)],
    [/\+(\d+(?:\.\d+)?)% (?:SMG |SG |MG |BR |SR |GL |RL |HR |PLSM |FTH |RAIL |SIPHON )?DMG/g, v => add('dmgPct', +v)],
  ];

  patterns.forEach(([re, fn]) => {
    let m;
    while ((m = re.exec(s)) !== null) fn(m[1]);
  });

  return b;
}

/** Ensure _stNodeMap is populated (lazy init for calls outside showSkillTree). */
function _stEnsureNodeMap() {
  if (Object.keys(_stNodeMap).length > 0) return;
  if (typeof SKILL_TREE_DATA === 'undefined') return;
  const chassisKey = (typeof loadout !== 'undefined' && loadout.chassis)
    ? loadout.chassis.toLowerCase() : 'light';
  const nodes = SKILL_TREE_DATA[chassisKey] || SKILL_TREE_DATA.light || [];
  nodes.forEach(n => { _stNodeMap[n.id] = n; });
  _skillTreeData = nodes;
}

/** Aggregate all allocated node stat bonuses and return a single bonuses object. */
function getSkillTreeBonuses() {
  _stEnsureNodeMap();
  const total = {};
  const add = (key, val) => { total[key] = (total[key] || 0) + val; };

  Object.entries(_skillTreeState.allocated).forEach(([nodeId, rank]) => {
    if (!rank || rank <= 0) return;
    const node = _stNodeMap[nodeId];
    if (!node || !node.s) return;
    const b = _parseSkillStatString(node.s);
    Object.entries(b).forEach(([key, val]) => add(key, val * rank));
  });

  return total;
}

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
  _stHideHover();
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
