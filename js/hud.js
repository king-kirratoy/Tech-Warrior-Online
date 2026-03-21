// ═══════════ HUD UPDATES ═══════════

function updateHUD() {
    // ── Left arm ──
    const _lRow = document.getElementById('slot-L');
    const _lTxt = document.getElementById('txt-L');
    const _lName = (loadout.L && loadout.L !== 'none') ? _hudName(loadout.L) : '—';
    if (_lTxt) _lTxt.innerText = _lArmDestroyed ? 'DESTROYED' : _lName;
    if (_lRow) { _lRow.classList.toggle('arm-destroyed', _lArmDestroyed); _lRow.style.opacity = (loadout.L && loadout.L !== 'none') ? '1' : '0.3'; }

    // ── Right arm ──
    const _rRow = document.getElementById('slot-R');
    const _rTxt = document.getElementById('txt-R');
    const _rName = (loadout.R && loadout.R !== 'none') ? _hudName(loadout.R) : '—';
    if (_rTxt) _rTxt.innerText = _rArmDestroyed ? 'DESTROYED' : _rName;
    if (_rRow) { _rRow.classList.toggle('arm-destroyed', _rArmDestroyed); _rRow.style.opacity = (loadout.R && loadout.R !== 'none') ? '1' : '0.3'; }

    // ── System mod ──
    const _mRow = document.getElementById('slot-M');
    const _mTxt = document.getElementById('txt-M');
    const _mName = (loadout.mod && loadout.mod !== 'none') ? _hudName(loadout.mod) : '—';
    if (_mTxt) _mTxt.innerText = _mName;
    if (_mRow) _mRow.style.opacity = (loadout.mod && loadout.mod !== 'none') ? '1' : '0.3';

    // ── Shield / defense ──
    const _sRow = document.getElementById('slot-S');
    const _sTxt = document.getElementById('txt-S');
    const _sHas  = loadout.shld && loadout.shld !== 'none';
    const _sName = _sHas ? (_hudName(loadout.shld) || loadout.shld.toUpperCase()) : 'NONE';
    if (_sTxt) _sTxt.innerText = _sName;
    if (_sRow) _sRow.style.opacity = _sHas ? '1' : '0.4';

    // ── Leg system ──
    const legWrap = document.getElementById('slot-leg-wrap');
    const _gTxt   = document.getElementById('txt-G');
    const legHas  = loadout.leg && loadout.leg !== 'none';
    const legName = legHas ? _hudName(loadout.leg) || (LEG_SYSTEMS[loadout.leg]?.name || loadout.leg.toUpperCase()) : '—';
    if (_gTxt) _gTxt.innerText = _legsDestroyed ? 'OFFLINE' : legName;
    if (legWrap) {
        legWrap.classList.toggle('arm-destroyed', _legsDestroyed);
        legWrap.style.display = legHas ? 'flex' : 'none';
    }
}

function updateBars() {
    if (!player) return;

    // Horizontal defense row
    const shFillH = document.getElementById('wr-fill-S');
    const shSt    = document.getElementById('wr-st-S');
    const _hasShield = player.maxShield > 0;
    if (_hasShield) {
        const shPct = Math.max(0, player.shield / player.maxShield) * 100;
        if (shFillH) shFillH.style.width = shPct + '%';
        if (shSt) {
            const _shHp = Math.ceil(player.shield || 0);
            shSt.innerText = _shHp > 0 ? _shHp : 'DOWN';
        }
    } else {
        // No shield equipped — empty bar
        if (shFillH) shFillH.style.width = '0%';
        if (shSt) shSt.innerText = '—';
    }
}

function updatePaperDoll() {
    if (!player || !isDeployed) return;

    const getColor = (hp, max) => {
        const pct = hp / max;
        if (pct <= 0)    return '#1a1a1a';
        if (pct <= 0.25) return '#ff0000';
        if (pct <= 0.50) return '#ffaa00';
        if (pct <= 0.75) return '#ffff00';
        return '#00ff00';
    };

    const set = (id, color) => {
        const el = document.getElementById(id);
        if (el) el.style.background = color;
    };

    const coreColor = getColor(player.comp.core.hp, player.comp.core.max);
    const lColor    = getColor(player.comp.lArm.hp, player.comp.lArm.max);
    const rColor    = getColor(player.comp.rArm.hp, player.comp.rArm.max);
    const legColor  = getColor(player.comp.legs.hp, player.comp.legs.max);

    set('doll-core',      coreColor);
    set('doll-lArm',      lColor);
    set('doll-lShoulder', lColor);
    set('doll-rArm',      rColor);
    set('doll-rShoulder', rColor);
    set('doll-lLeg',      legColor);
    set('doll-rLeg',      legColor);
}

/** Drive horizontal bar fill widths in the HUD weapon rows. */
function updateCooldownOverlays(time) {
    if (!isDeployed || _isPaused) return;
    _updateBarRow('L', loadout.L, reloadL, time);
    _updateBarRow('R', loadout.R, reloadR, time);

    // System mod cooldown
    if (loadout.mod && loadout.mod !== 'none') {
        const total   = WEAPONS[loadout.mod]?.cooldown || 0;
        const elapsed = time - lastModTime;
        let pct = 0;
        if (isShieldActive || isJumping || isRageActive) {
            pct = 100;
        } else if (lastModTime > 0 && elapsed < total) {
            pct = Math.round((1 - elapsed / total) * 100);
        }
        const fill = document.getElementById('wr-fill-M');
        const st   = document.getElementById('wr-st-M');
        if (fill) fill.style.width = pct + '%';
        if (st) {
            if (pct > 0) { st.innerText = Math.ceil((total - Math.min(elapsed, total)) / 1000) + 's'; }
            else { st.innerText = 'RDY'; }
        }
    }
}

function _updateBarRow(slotId, weaponKey, reloadTimestamp, time) {
    const fill = document.getElementById('wr-fill-' + slotId);
    const st   = document.getElementById('wr-st-' + slotId);
    if (!fill) return;
    if (!weaponKey || weaponKey === 'none') {
        fill.style.width = '0%';
        if (st) st.innerText = '';
        return;
    }
    const total     = WEAPONS[weaponKey]?.reload || 0;
    const remaining = Math.max(0, reloadTimestamp - time);
    const pct       = total > 0 ? Math.round((remaining / total) * 100) : 0;
    fill.style.width = pct + '%';
    if (st) {
        if (pct > 0) { st.innerText = (remaining / 1000).toFixed(1) + 's'; }
        else { st.innerText = 'RDY'; }
    }
}

// ═══════════ MINIMAP AND CROSSHAIR ═══════════

function drawMinimap() {
    const canvas = document.getElementById('minimap-canvas');
    if (!canvas || !isDeployed) return;
    const ctx   = canvas.getContext('2d');
    const S     = 160;       // canvas size px
    const W     = (_gameMode === 'pvp' && typeof _mpMapSize !== 'undefined') ? _mpMapSize : 4000;      // world size (PVP uses larger map)
    const scale = S / W;

    ctx.clearRect(0, 0, S, S);

    // Background
    ctx.fillStyle = 'rgba(0,8,4,0.0)';
    ctx.fillRect(0, 0, S, S);

    // Cover objects
    if (coverObjects) {
        coverObjects.getChildren().forEach(c => {
            if (!c.active) return;
            const cx = c.x * scale;
            const cy = c.y * scale;
            const cw = c.width  * scale;
            const ch = c.height * scale;
            ctx.fillStyle   = c.coverType === 'crate' ? 'rgba(140,100,30,0.7)' : 'rgba(60,80,60,0.7)';
            ctx.strokeStyle = 'rgba(100,140,100,0.4)';
            ctx.lineWidth   = 0.5;
            ctx.fillRect(cx - cw/2, cy - ch/2, cw, ch);
            ctx.strokeRect(cx - cw/2, cy - ch/2, cw, ch);
        });
    }

    // Enemies
    if (enemies) {
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const ex = e.x * scale;
            const ey = e.y * scale;
            const r  = e.loadout?.chassis === 'heavy' ? 3.5
                     : e.loadout?.chassis === 'light' ? 2.0 : 2.8;
            ctx.beginPath();
            ctx.arc(ex, ey, r, 0, Math.PI * 2);
            ctx.fillStyle   = '#ff3300';
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth   = 0.8;
            ctx.fill();
            ctx.stroke();
        });
    }

    // Loot pickups (repair/ammo/charge orbs)
    if (lootPickups) {
        lootPickups.forEach(p => {
            if (!p.orb?.active) return;
            const lx = p.x * scale;
            const ly = p.y * scale;
            const lootDef = LOOT_TYPES[p.type];
            ctx.beginPath();
            ctx.arc(lx, ly, 2, 0, Math.PI * 2);
            ctx.fillStyle = p.type === 'repair' ? '#00ff44' : p.type === 'ammo' ? '#ffdd00' : '#00ffff';
            ctx.fill();
        });
    }

    // Equipment drops (gear items on ground)
    if (typeof _equipmentDrops !== 'undefined') {
        _equipmentDrops.forEach(d => {
            if (!d.active) return;
            const dx = d.x * scale;
            const dy = d.y * scale;
            const rDef = typeof RARITY_DEFS !== 'undefined' ? RARITY_DEFS[d.item?.rarity] : null;
            ctx.beginPath();
            ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = rDef ? rDef.colorStr : '#ffd700';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.6;
            ctx.fill();
            ctx.stroke();
        });
    }

    // PVP remote players
    if (typeof mpDrawMinimapPlayers === 'function') mpDrawMinimapPlayers(ctx, scale, 0, 0);

    // Extraction point
    if (_extractionActive && _extractionPoint) {
        const epx = _extractionPoint.x * scale;
        const epy = _extractionPoint.y * scale;
        const epR = 5;
        // Pulsing glow
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.004);
        ctx.beginPath();
        ctx.arc(epx, epy, epR + 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,100,${0.1 + pulse * 0.15})`;
        ctx.fill();
        // Core diamond
        ctx.save();
        ctx.translate(epx, epy);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = `rgba(0,255,100,${0.6 + pulse * 0.4})`;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.fillRect(-epR/2, -epR/2, epR, epR);
        ctx.strokeRect(-epR/2, -epR/2, epR, epR);
        ctx.restore();
    }

    // Player
    if (player?.active) {
        const px = player.x * scale;
        const py = player.y * scale;
        // Direction indicator
        if (torso) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + Math.cos(torso.rotation) * 7, py + Math.sin(torso.rotation) * 7);
            ctx.strokeStyle = 'rgba(0,255,255,0.6)';
            ctx.lineWidth   = 1;
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle   = '#00ffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 1;
        ctx.fill();
        ctx.stroke();
    }
}

function updateEnemyDoll(e) {
    const hud = document.getElementById('enemy-doll-hud');
    if (!hud || !isDeployed) return;
    _eDollTarget = e;
    hud.style.display = 'block';
    if (_eDollHideTimer) clearTimeout(_eDollHideTimer);
    _eDollHideTimer = setTimeout(() => {
        hud.style.display = 'none';
        _eDollTarget = null;
    }, 3000);

    // Resolve enemy type definition at function scope so getCol/glow can use it
    const _typeDef = e.enemyType && typeof ENEMY_TYPE_DEFS !== 'undefined' ? ENEMY_TYPE_DEFS[e.enemyType] : null;

    const label = document.getElementById('edoll-label');
    if (label) {
        const _elitePrefix = e._eliteMods?.length ? e._eliteMods.map(k => (typeof ELITE_MODIFIERS !== 'undefined' ? ELITE_MODIFIERS[k]?.label : k)).join(' ') + ' ' : '';
        label.innerText = e._pvpName ? `[ ${e._pvpName} ]`
            : e.isCommander ? '[ COMMANDER ]'
            : _typeDef ? `[ ${_elitePrefix}${_typeDef.label} ]`
            : e.isMedic ? '[ MEDIC ]'
            : _elitePrefix ? `[ ${_elitePrefix.trim()} ${(e.loadout?.chassis?.toUpperCase() || 'TARGET')} ]`
            : (e.loadout?.chassis?.toUpperCase() || 'TARGET');
        const _labelCol = e._pvpName ? '#ff4444' : e.isCommander ? '#ddaa00' : _typeDef ? _typeDef.labelColor : e.isMedic ? '#00ff88' : e.isElite ? (typeof ELITE_MODIFIERS !== 'undefined' && e._eliteMods?.[0] ? ELITE_MODIFIERS[e._eliteMods[0]].color : '#ff8800') : '#c8d2d9';
        label.style.color = _labelCol;
        label.style.opacity = '0.8';
    }
    const getCol = (hp, max) => {
        const pct = hp / max;
        if (pct <= 0)    return '#1a1a1a';
        if (pct <= 0.25) return '#ff0000';
        if (pct <= 0.50) return '#ffaa00';
        if (pct <= 0.75) return '#ffff00';
        return e.isCommander ? '#ddaa00' : _typeDef ? _typeDef.labelColor : e.isElite ? '#ff8800' : '#00ff00';
    };
    const glow = (hp, max) => {
        const pct = hp / max;
        if (pct <= 0)    return 'none';
        if (pct <= 0.25) return '0 0 8px rgba(255,0,0,0.6)';
        if (pct <= 0.50) return '0 0 8px rgba(255,170,0,0.5)';
        if (pct <= 0.75) return '0 0 8px rgba(255,255,0,0.4)';
        return e.isCommander ? '0 0 8px rgba(221,170,0,0.4)' : 'none';
    };
    const set = (id, comp) => {
        const el = document.getElementById(id);
        if (!el || !comp) return;
        el.style.background = getCol(comp.hp, comp.max);
        el.style.boxShadow  = glow(comp.hp, comp.max);
    };
    if (!e.comp) return;
    // Update all parts with current HP values
    const parts = ['edoll-core','edoll-lArm','edoll-lShoulder','edoll-rArm','edoll-rShoulder','edoll-lLeg','edoll-rLeg','edoll-head'];
    const comps = [e.comp.core, e.comp.lArm, e.comp.lArm, e.comp.rArm, e.comp.rArm, e.comp.legs, e.comp.legs, e.comp.core];
    for (let i = 0; i < parts.length; i++) set(parts[i], comps[i]);
}

/**
 * Draws the static bracket-corner crosshair onto a Graphics object.
 * Called once at deploy — the shape never changes, only its position moves.
 *   size  = half-width/height of the full bracket area
 *   len   = length of each corner arm
 *   gap   = empty space from center to where arms begin
 */
function drawCrosshair(g) {
    const size = 14;
    const len  = 6;
    const col  = 0x00ffff; // matches shield bar / sh-text color in HUD

    // Outer soft bloom
    g.lineStyle(5, col, 0.18);
    g.beginPath(); g.moveTo(-size, -size+len); g.lineTo(-size, -size); g.lineTo(-size+len, -size); g.strokePath();
    g.beginPath(); g.moveTo( size-len, -size); g.lineTo( size, -size); g.lineTo( size, -size+len); g.strokePath();
    g.beginPath(); g.moveTo( size,  size-len); g.lineTo( size,  size); g.lineTo( size-len,  size); g.strokePath();
    g.beginPath(); g.moveTo(-size+len,  size); g.lineTo(-size,  size); g.lineTo(-size,  size-len); g.strokePath();

    // Mid glow
    g.lineStyle(2.5, col, 0.5);
    g.beginPath(); g.moveTo(-size, -size+len); g.lineTo(-size, -size); g.lineTo(-size+len, -size); g.strokePath();
    g.beginPath(); g.moveTo( size-len, -size); g.lineTo( size, -size); g.lineTo( size, -size+len); g.strokePath();
    g.beginPath(); g.moveTo( size,  size-len); g.lineTo( size,  size); g.lineTo( size-len,  size); g.strokePath();
    g.beginPath(); g.moveTo(-size+len,  size); g.lineTo(-size,  size); g.lineTo(-size,  size-len); g.strokePath();

    // Sharp bright core
    g.lineStyle(1.5, col, 1.0);
    g.beginPath(); g.moveTo(-size, -size+len); g.lineTo(-size, -size); g.lineTo(-size+len, -size); g.strokePath();
    g.beginPath(); g.moveTo( size-len, -size); g.lineTo( size, -size); g.lineTo( size, -size+len); g.strokePath();
    g.beginPath(); g.moveTo( size,  size-len); g.lineTo( size,  size); g.lineTo( size-len,  size); g.strokePath();
    g.beginPath(); g.moveTo(-size+len,  size); g.lineTo(-size,  size); g.lineTo(-size,  size-len); g.strokePath();

    // Center dot with halo
    g.fillStyle(col, 0.35);
    g.fillCircle(0, 0, 4);
    g.fillStyle(col, 1.0);
    g.fillCircle(0, 0, 1.5);
}

/** Moves the crosshair graphic to the current mouse position each frame. */
function syncCrosshair(scene) {
    if (!crosshair) return;
    crosshair.setPosition(
        scene.input.activePointer.x,
        scene.input.activePointer.y
    );
}

/**
 * Redraws the glow wedge each frame.
 * A soft filled arc sits at the front of the legs, always facing the
 * direction the legs are pointed, tinted in the mech's armour colour.
 */
function syncGlowWedge() {
    if (!glowWedge) return;
    glowWedge.clear();

    const r     = player.rotation;
    const scale = CHASSIS[loadout.chassis].scale;
    const col   = loadout.color;

    // Chevron arrow pointing in the direction legs face
    // Per-chassis base offset to clear the hull at all rotation angles
    // (hull radius is roughly scale * 36px, so offset must exceed that comfortably)
    const _chassisOffset = loadout.chassis === 'heavy' ? 62
                         : loadout.chassis === 'medium' ? 52
                         : 38;   // light
    const offset = _chassisOffset * scale;  // distance from mech center to chevron base
    const aw = 18 * scale;                  // half-width of chevron base
    const ad = 14 * scale;                  // depth (front-to-back) of chevron
    const notch = 7 * scale;               // depth of the rear notch (makes it a chevron not a triangle)

    // Tip point (forward)
    const tx = player.x + Math.cos(r) * (offset + ad);
    const ty = player.y + Math.sin(r) * (offset + ad);
    // Left base
    const lx = player.x + Math.cos(r) * offset + Math.cos(r + Math.PI/2) * aw;
    const ly = player.y + Math.sin(r) * offset + Math.sin(r + Math.PI/2) * aw;
    // Right base
    const rx2 = player.x + Math.cos(r) * offset + Math.cos(r - Math.PI/2) * aw;
    const ry2 = player.y + Math.sin(r) * offset + Math.sin(r - Math.PI/2) * aw;
    // Centre-rear notch
    const nx = player.x + Math.cos(r) * (offset + notch);
    const ny = player.y + Math.sin(r) * (offset + notch);

    // Outer glow layer
    glowWedge.fillStyle(col, 0.10);
    glowWedge.beginPath();
    glowWedge.moveTo(tx, ty);
    glowWedge.lineTo(lx, ly);
    glowWedge.lineTo(nx, ny);
    glowWedge.lineTo(rx2, ry2);
    glowWedge.closePath();
    glowWedge.fillPath();

    // Mid glow
    glowWedge.fillStyle(col, 0.22);
    glowWedge.beginPath();
    glowWedge.moveTo(tx, ty);
    glowWedge.lineTo(lx, ly);
    glowWedge.lineTo(nx, ny);
    glowWedge.lineTo(rx2, ry2);
    glowWedge.closePath();
    glowWedge.fillPath();

    // Bright core chevron (slightly smaller)
    const s = 0.72;
    const _cx = player.x + Math.cos(r) * offset;
    const _cy = player.y + Math.sin(r) * offset;
    const stx = _cx + Math.cos(r) * ad * s;
    const sty = _cy + Math.sin(r) * ad * s;
    const slx = _cx + Math.cos(r + Math.PI/2) * aw * s;
    const sly = _cy + Math.sin(r + Math.PI/2) * aw * s;
    const srx = _cx + Math.cos(r - Math.PI/2) * aw * s;
    const sry = _cy + Math.sin(r - Math.PI/2) * aw * s;
    const snx = _cx + Math.cos(r) * notch * s;
    const sny = _cy + Math.sin(r) * notch * s;

    glowWedge.fillStyle(col, 0.55);
    glowWedge.beginPath();
    glowWedge.moveTo(player.x + stx - _cx, player.y + sty - _cy);
    glowWedge.lineTo(player.x + slx - _cx, player.y + sly - _cy);
    glowWedge.lineTo(player.x + snx - _cx, player.y + sny - _cy);
    glowWedge.lineTo(player.x + srx - _cx, player.y + sry - _cy);
    glowWedge.closePath();
    glowWedge.fillPath();

    // Crisp outline stroke
    glowWedge.lineStyle(1.5, col, 0.75);
    glowWedge.beginPath();
    glowWedge.moveTo(tx, ty);
    glowWedge.lineTo(lx, ly);
    glowWedge.lineTo(nx, ny);
    glowWedge.lineTo(rx2, ry2);
    glowWedge.closePath();
    glowWedge.strokePath();
}


// ═══════════ HUD STATE RESET ═══════════

/** Resets all HUD elements to their initial clean state. Called before any redeploy or hangar return. */
function _resetHUDState() {
    // Paper doll — all green
    ['doll-head','doll-core','doll-lArm','doll-lShoulder',
     'doll-rArm','doll-rShoulder','doll-lLeg','doll-rLeg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.background = '#00ff00';
    });
    // Reset HUD accent border
    const hudAcc = document.getElementById('hud-accent');
    if (hudAcc) hudAcc.style.borderColor = '';
    // Weapon slot opacity + clear destroyed state
    _lArmDestroyed = false; _rArmDestroyed = false; _legsDestroyed = false;
    ['slot-L','slot-R','slot-M'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.opacity = '1'; el.style.borderColor = '#00ffff'; el.classList.remove('arm-destroyed'); }
    });
    // Reset weapon name text
    const txtL = document.getElementById('txt-L');
    const txtR = document.getElementById('txt-R');
    if (txtL) { txtL.innerText = (loadout.L || 'none').toUpperCase(); txtL.style.fontSize = ''; }
    if (txtR) { txtR.innerText = (loadout.R || 'none').toUpperCase(); txtR.style.fontSize = ''; }
}
