// ═══════════ DROPDOWN SYSTEM ═══════════

function toggleDD(slotId) {
    if (_openDD === slotId) { closeAllDD(); return; }
    closeAllDD();
    _openDD = slotId;
    if (slotId === 'C') {
        buildColorDD();
    } else {
        const DD_OPTIONS = { L: WEAPON_OPTIONS, R: WEAPON_OPTIONS, M: MOD_OPTIONS, A: AUG_OPTIONS, G: LEG_OPTIONS, S: SHIELD_OPTIONS };
        buildDD(slotId, DD_OPTIONS[slotId] ?? LEG_OPTIONS);
    }
    document.getElementById('dds-' + slotId)?.classList.add('dd-open');
    document.getElementById('ddl-' + slotId)?.classList.add('dd-list-open');
}

function closeAllDD() {
    // Only close main hangar dropdowns — PVP hangar has its own close handler
    document.querySelectorAll('.dd-selected:not(.pvp-dd-selected)').forEach(el => el.classList.remove('dd-open'));
    document.querySelectorAll('.dd-list:not(.pvp-dd-list)').forEach(el => el.classList.remove('dd-list-open'));
    _openDD = null;
}

function buildDD(slotId, options) {
    const list = document.getElementById('ddl-' + slotId);
    if (!list) return;
    list.innerHTML = '';
    const cap = CHASSIS[loadout.chassis]?.max || 999;
    const currentTotal = _calcWeight(loadout);

    // Sort options by weight (ascending) so they display lowest→highest
    const _sorted = [...options].sort((a, b) => (a.weight || 0) - (b.weight || 0));
    _sorted.forEach(opt => {
        // Chassis-based slot restrictions
        if (slotId === 'L' || slotId === 'R') {
            if (CHASSIS_WEAPONS[loadout.chassis] && !CHASSIS_WEAPONS[loadout.chassis].has(opt.key)) return;
        }
        if (slotId === 'M') {
            if (CHASSIS_MODS[loadout.chassis] && !CHASSIS_MODS[loadout.chassis].has(opt.key)) return;
        }
        if (slotId === 'S') {
            if (CHASSIS_SHIELDS[loadout.chassis] && !CHASSIS_SHIELDS[loadout.chassis].has(opt.key)) return;
        }
        if (slotId === 'G') {
            if (CHASSIS_LEGS[loadout.chassis] && !CHASSIS_LEGS[loadout.chassis].has(opt.key)) return;
        }
        if (slotId === 'A') {
            if (CHASSIS_AUGS[loadout.chassis] && !CHASSIS_AUGS[loadout.chassis].has(opt.key)) return;
        }
        // LIGHT chassis: cannot equip two-handed weapons
        if (loadout.chassis === 'light' && opt.twoHanded) return;
        // If a two-handed weapon is equipped, hide the R arm slot options (except the locked weapon)
        const activeTwoHanded = WEAPONS[loadout.L]?.twoHanded;
        if (activeTwoHanded && slotId === 'R' && opt.key !== loadout.L && opt.key !== 'none') return;
        const slotKey = loadout[SLOT_ID_MAP[slotId]];
        // Weight cap only applies to weapon arm slots
        const _isWeaponSlot = (slotId === 'L' || slotId === 'R');
        const currentSlotW = _isWeaponSlot ? (WEAPONS[slotKey]?.weight ?? 0) : 0;
        const wouldBe = _isWeaponSlot ? (currentTotal - currentSlotW + opt.weight) : 0;
        const over = false;
        const desc = SLOT_DESCS[opt.key];
        const descText = (desc && opt.key !== 'none') ? desc.desc : '';

        // Check if same weapon is in the other arm — allowed only for light (dual-wield)
        const otherArm  = slotId === 'L' ? loadout.R : slotId === 'R' ? loadout.L : null;
        const isDual    = loadout.chassis === 'light' && (slotId === 'L' || slotId === 'R') && opt.key !== 'none' && opt.key === otherArm;
        // Non-light: weapon already equipped in the other arm — gray it out, block selection
        const isBlocked = loadout.chassis !== 'light' && (slotId === 'L' || slotId === 'R') && opt.key !== 'none' && opt.key === otherArm;

        const div = document.createElement('div');
        div.className = 'dd-option'
            + (opt.key === slotKey ? ' dd-active' : '')
            + (over ? ' do-warn' : '')
            + (isBlocked ? ' do-disabled' : '');
        div.innerHTML = `
            <div class="do-header">
                <span class="do-name">${opt.label}${isDual ? ' <span style="font-size:9px;letter-spacing:1px;color:#00ffcc;background:rgba(0,255,204,0.12);padding:1px 5px;border:1px solid rgba(0,255,204,0.3);border-radius:2px;vertical-align:middle;">DUAL</span>' : ''}${isBlocked ? ' <span style="font-size:9px;letter-spacing:1px;color:rgba(255,100,100,0.7);background:rgba(255,60,60,0.08);padding:1px 5px;border:1px solid rgba(255,60,60,0.25);border-radius:2px;vertical-align:middle;">IN USE</span>' : ''}</span>

            </div>
            ${descText ? `<div class="do-desc">${descText}</div>` : ''}`;
        if (!isBlocked) div.onclick = () => { selectSlot(slotId, opt.key); closeAllDD(); };
        list.appendChild(div);
    });
}

function buildColorDD() {
    const list = document.getElementById('ddl-C');
    if (!list) return;
    list.innerHTML = '';
    const curHex = loadout.color.toString(16).padStart(6,'0').toLowerCase();
    COLOR_OPTIONS.forEach(opt => {
        const desc = SLOT_DESCS['col_' + opt.key];
        const div = document.createElement('div');
        div.className = 'dd-option dd-color-opt' + (opt.key === curHex ? ' dd-active' : '');
        div.innerHTML = `
            <div class="do-header">
                <span class="do-color-swatch" style="background:${opt.hex6};box-shadow:0 0 6px ${opt.hex6}55;"></span>
                <span class="do-name">${opt.label}</span>
            </div>
            ${desc ? `<div class="do-desc">${desc.desc}</div>` : ''}`;
        div.onclick = () => { loadout.color = opt.hex; closeAllDD(); refreshGarage(); };
        list.appendChild(div);
    });
}

function selectSlot(slotId, key) {
    // LIGHT chassis: cannot equip two-handed weapons
    if (loadout.chassis === 'light' && WEAPONS[key]?.twoHanded) return;

    if (slotId === 'L' || slotId === 'R') {
        const is2H = WEAPONS[key]?.twoHanded;
        if (is2H) {
            // Two-handed: fill both arms with same key, lock R
            loadout.L = key;
            loadout.R = key;
        } else {
            // Normal: set the chosen side.
            // Only Light chassis can dual-wield (same weapon in both arms).
            if (slotId === 'L') {
                if (WEAPONS[loadout.L]?.twoHanded) loadout.R = 'none';
                loadout.L = key;
                // Non-light: if the other arm already has the same weapon, clear it
                if (loadout.chassis !== 'light' && key !== 'none' && loadout.R === key) loadout.R = 'none';
            } else {
                if (WEAPONS[loadout.R]?.twoHanded) loadout.L = 'none';
                loadout.R = key;
                if (loadout.chassis !== 'light' && key !== 'none' && loadout.L === key) loadout.L = 'none';
            }
        }
    } else {
        // Non-arm slots: use SLOT_ID_MAP to resolve the loadout property
        const loadoutKey = SLOT_ID_MAP[slotId];
        if (loadoutKey) loadout[loadoutKey] = key;
    }
    refreshGarage();
}

function setChassis(t) {
    loadout.chassis = t;
    _applyStarterLoadout(t);
    refreshGarage();
}

// ═══════════ GARAGE UI ═══════════

function refreshGarage() {
    // Update chassis buttons
    ['light','medium','heavy'].forEach(ch => {
        document.getElementById('c-' + ch)?.classList.toggle('active', loadout.chassis === ch);
    });

    // Colour dropdown header
    const hexStr = loadout.color.toString(16).padStart(6,'0').toLowerCase();
    const colOpt = COLOR_OPTIONS.find(o => o.key === hexStr) || COLOR_OPTIONS[0];
    const colNameEl  = document.getElementById('ddn-C');
    const colSwatchEl = document.getElementById('dd-color-swatch-C');
    if (colNameEl)   colNameEl.textContent = colOpt.label;
    if (colSwatchEl) { colSwatchEl.style.background = colOpt.hex6; colSwatchEl.style.boxShadow = `0 0 6px ${colOpt.hex6}55`; }

    // Preview image
    const previewImg = document.getElementById('preview-img');
    if (previewImg) {
        previewImg.src          = `assets/${loadout.chassis}-mech.png`;
        previewImg.style.filter = `drop-shadow(0 0 15px #${hexStr})`;
    }

    // Deploy button — always enabled since starter loadout always has a weapon
    const deployBtn = document.getElementById('deploy-btn');
    if (deployBtn) {
        deployBtn.disabled = false;
        deployBtn.innerText = 'DEPLOY MECH';
        deployBtn.classList.remove('overweight');
    }

    // Dual-explosive warning
    const dualWarn = document.getElementById('dual-explosive-warn');
    if (dualWarn) {
        const bothExplosive = EXPLOSIVE_KEYS.has(loadout.L) && EXPLOSIVE_KEYS.has(loadout.R);
        dualWarn.style.display = bothExplosive ? 'block' : 'none';
    }

    // Populate starter loadout info panel
    _updateStarterPanel();
    updateGarageStats();
}

function updateGarageStats() {
    const panel = document.getElementById('garage-stats-panel');
    if (!panel) return;
    const ch   = CHASSIS[loadout.chassis];
    const shld = SHIELD_SYSTEMS[loadout.shld] || SHIELD_SYSTEMS.none;
    const oc   = loadout.aug === 'overclock_cpu';
    const gyro = loadout.leg === 'gyro_stabilizer';
    const hydro = loadout.leg === 'hydraulic_boost';
    const mag  = loadout.leg === 'mag_anchors';

    // ── HP breakdown (chassis-specific, not visible in dropdowns) ──
    const totalHP = getTotalHP(loadout.chassis);
    const coreHP  = ch.coreHP;
    const armHP   = ch.armHP;
    const legHP   = ch.legHP;
    const hpBreak = coreHP + ' / ' + armHP + ' / ' + armHP + ' / ' + legHP;

    // ── Speed (modified by legs) ──
    const baseSpd = ch.spd;
    const spd = Math.round(baseSpd * (hydro ? 1.20 : 1.0));
    const spdStr = spd + ' u/s' + (hydro ? ' (+20%)' : '');

    // ── Shield stats ──
    const shAbsorb = loadout.shld === 'reactive_shield' ? 65 : 50;
    const shHp     = shld.maxShield;
    const shStr    = shHp > 0 ? shHp + ' HP · ' + shAbsorb + '% absorb · ' + shld.regenDelay + 's regen' : '—';

    // ── Arm state (needed early for brace calcs) ──
    const is2H   = WEAPONS[loadout.L]?.twoHanded;
    const lEmpty = !loadout.L || loadout.L === 'none';
    const rEmpty = !loadout.R || loadout.R === 'none';
    const braceArm = !is2H && (lEmpty !== rEmpty);

    // ── Weapon fire rates ──
    const wL = WEAPONS[loadout.L];
    const wR = WEAPONS[loadout.R];
    const reloadMult = oc ? 0.88 : 1.0;
    const _garageBrace = braceArm;
    const _braceDmgB   = _garageBrace ? 1.25 : 1.0;
    const _braceRldB   = _garageBrace ? 0.85 : 1.0;
    function fmtReload(w) {
        if (!w || !w.reload) return null;
        const r = Math.round(w.reload * reloadMult * _braceRldB);
        const dps = w.dmg ? ((w.dmg * _braceDmgB) / (r/1000)).toFixed(1) : null;
        const tag = _garageBrace ? ' ★' : '';
        return dps ? dps + ' dps · ' + r + 'ms cd' + tag : r + 'ms cd' + tag;
    }
    const lRate = fmtReload(wL);
    const rRate = fmtReload(wR);

    // ── Mod cooldown ──
    const modW = WEAPONS[loadout.mod];
    const modCd = modW?.cooldown ? Math.round(modW.cooldown * (oc ? 0.88 : 1.0) / 1000) + 's cd' : null;

    // ── Passive effects summary ──
    const passives = [];
    if (braceArm)  passives.push('+25% damage · +15% reload (single-arm brace)');
    if (is2H)      passives.push('TWO-HANDED · both arms locked · weight counted once');
    if (gyro)  passives.push('leg penalty immunity');
    if (mag)   passives.push('−20% dmg in / +15% dmg out when still');
    if (loadout.aug === 'target_painter')   passives.push('hit marks: +20% dmg on target');
    if (loadout.aug === 'threat_analyzer')  passives.push('hit debuff: −15% resist 3s');
    if (loadout.aug === 'reactive_plating') passives.push('on hit: +5% DR stack (max 5)');
    if (loadout.aug === 'scrap_cannon')     passives.push('limb destroy: 30 AoE');
    if (loadout.leg === 'mine_layer')       passives.push('drop mine every 8s moving');
    if (loadout.leg === 'afterleg')         passives.push('jump +50% dist · land shockwave');

    // ── Chassis identity traits ──
    const chassisDef = CHASSIS[loadout.chassis];
    const chassisTraits = [];
    if (loadout.chassis === 'light') {
        chassisTraits.push('Dual-fire: fires both arms simultaneously when same weapon is equipped in each');
        chassisTraits.push('+20% reload speed (passive)');
        chassisTraits.push('Arms: fragile — 30% less base HP');
    } else if (loadout.chassis === 'medium') {
        chassisTraits.push('All mod cooldowns −15%');
        chassisTraits.push('Kills reduce mod cooldown by 0.5s');
        chassisTraits.push('Shield absorbs 60% of damage');
    } else if (loadout.chassis === 'heavy') {
        chassisTraits.push('Passive 15% damage reduction');
        chassisTraits.push('Cannot equip JUMP or AFTERLEG');
        chassisTraits.push('Built for sustained attrition');
    }

    const rows = [
        ['TOTAL HP',   totalHP + ' HP',     '#00ff88'],
        ['HP SPLIT',   'C ' + coreHP + ' / A ' + armHP + ' / L ' + legHP, '#55cc88'],
        ['SPEED',      spdStr,              '#ffdd88'],
        ['SHIELD HP',  shHp > 0 ? shStr : 'NONE', shHp > 0 ? '#00ffff' : '#445'],
        lRate ? ['L FIRE RATE', lRate, '#c0c8d0'] : null,
        rRate ? ['R FIRE RATE', rRate, '#c0c8d0'] : null,
        modCd ? ['CORE CD',      modCd, '#ffaa44'] : null,
        chassisTraits.length ? ['CHASSIS', chassisTraits.join(' · '), loadout.chassis==='light'?'#88ff88':loadout.chassis==='medium'?'#ffcc44':'#ff8844'] : null,
        passives.length ? ['PASSIVES', passives.join(' · '), '#cc88ff'] : null,
    ].filter(Boolean);

    panel.innerHTML = rows.map(([lbl,val,col]) =>
        `<div class="hg-stat-row"><span class="hg-stat-label">${lbl}</span><span class="hg-stat-val" style="color:${col}">${val}</span></div>`
    ).join('');
}

function _updateStarterPanel() {
    const panel = document.getElementById('starter-loadout-panel');
    if (!panel) return;
    const ch = loadout.chassis;
    const starter = STARTER_LOADOUTS[ch];
    const wL = WEAPONS[starter.L];
    const shName = SHIELD_SYSTEMS[starter.shld]?.name || 'NONE';
    const chColor = ch === 'light' ? '#88ff88' : ch === 'medium' ? '#ffcc44' : '#ff8844';

    let html = '';
    html += `<div class="hg-stat-row"><span class="hg-stat-label">WEAPON</span><span class="hg-stat-val" style="color:${chColor}">${wL?.name || 'NONE'}</span></div>`;
    html += `<div class="hg-stat-row"><span class="hg-stat-label">SHIELD</span><span class="hg-stat-val" style="color:${chColor}">${shName}</span></div>`;
    panel.innerHTML = html;
}

function _calcWeight(lo) {
    const w = (obj, key) => (key && key !== 'none') ? (obj[key]?.weight || 0) : 0;
    // Weight cap applies to weapons only — mod/aug/leg/shield no longer count toward cap
    const lW = w(WEAPONS, lo.L);
    const rW = (WEAPONS[lo.R]?.twoHanded || WEAPONS[lo.L]?.twoHanded) ? 0 : w(WEAPONS, lo.R);
    return lW + rW;
}

function deployMech() {
    // Phase 4: Apply campaign chassis upgrades before deploy
    if (_gameMode === 'campaign' && typeof applyChassisUpgrades === 'function') {
        applyChassisUpgrades();
    }

    // HEAVY: strip forbidden items if somehow equipped
    if (loadout.chassis === 'heavy') {
        if (loadout.mod === 'jump')    loadout.mod = 'none';
        if (loadout.leg === 'afterleg') loadout.leg = 'none';
    }

    // Regenerate cover map — visual rects are wiped by _cleanupGame each session
    // so we must rebuild them every deploy to keep both visuals and physics in sync
    const deployScene = GAME.scene.scenes[0];
    if (deployScene) {
        try { generateCover(deployScene); } catch(e) { console.warn('generateCover error', e); }
    }

    document.getElementById('ui-layer').style.display = 'none';
    // Cover the battlefield with a black div until mech is ready to drop in
    document.getElementById('deploy-cover').style.display = 'block';
    // Hide animated grid canvas during gameplay
    const hgc = document.getElementById('hangar-canvas');
    if (hgc) { hgc.style.display = 'none'; hgc._gridRunning = false; }

    const scene = GAME.scene.scenes[0];
    const s     = CHASSIS[loadout.chassis];

    if (scene.hangarOverlay) scene.hangarOverlay.setVisible(false);

    // Leg hitbox dimensions per chassis
    const legDims = { light: [40,30], medium: [60,40], heavy: [70,40] };
    const [legW, legH] = legDims[loadout.chassis] ?? legDims.medium;

    // Physics body (legs / lower hull) — invisible, used for collision only
    player = scene.add.rectangle(WORLD_CENTER, WORLD_CENTER, legW, legH, 0x000000, 0)
        .setDepth(5);
    scene.physics.add.existing(player);
    // Hitbox circle sized to match each chassis's core visual
    const hitR   = loadout.chassis === 'light' ? 16 : loadout.chassis === 'medium' ? 22 : 30;
    const hitOff = loadout.chassis === 'light' ? -8  : loadout.chassis === 'medium' ? -10 : -12;
    player.body.setCircle(hitR);
    player.body.setOffset(-hitR, hitOff);
    player.setScale(s.scale);
    player.body.setCollideWorldBounds(true);

    // Torso / turret
    torso = buildPlayerMech(scene, loadout.chassis, loadout.color);
    torso.setDepth(10);

    // Player ↔ cover (player now exists)
    if (coverObjects) scene.physics.add.collider(player, coverObjects);

    // Show battlefield grid now that we're deployed
    if (scene._bfGrid) scene._bfGrid.setVisible(true);

    // World & camera
    scene.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    scene.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    scene.cameras.main.centerOn(WORLD_CENTER, WORLD_CENTER);
    scene.cameras.main.startFollow(player, true, 0.5, 0.5);

    // Enemy bullet overlap — stored so it can be destroyed on cleanup
    _registerEnemyBulletOverlap(scene);

    // Component HP + shield — initialize from chassis stats and gear bonuses
    _initPlayerHP(scene, s);

    refreshMechColor();
    scene.time.delayedCall(10, () => refreshMechColor()); // One-frame safety flush

    // Shield bubble — base 72px scaled by chassis so it clears the hull on all sizes
    // light: 72*0.7 = ~50px  medium: 72*1.0 = 72px  heavy: 72*1.4 = ~101px
    const shieldRadius = 72 * CHASSIS[loadout.chassis].scale;
    shieldGraphic = scene.add.circle(0, 0, shieldRadius, 0x00ffff, 0.15)
        .setStrokeStyle(2, 0x00ffff)
        .setVisible(false)
        .setDepth(12);

    // --- FRONT GLOW WEDGE ---
    glowWedge = scene.add.graphics().setDepth(4);

    // --- MOTION BLUR (medium only) ---
    speedStreakLine = scene.add.graphics().setDepth(3);

    // --- CROSSHAIR ---
    // Drawn once as a static bracket-corner style graphic, follows mouse each frame.
    crosshair = scene.add.graphics().setDepth(9999).setScrollFactor(0);
    drawCrosshair(crosshair);
    scene.input.setDefaultCursor('none');

    // Colliders — stored so they can be destroyed on cleanup
    _playerEnemyCollider = scene.physics.add.collider(player, enemies);
    _enemyEnemyCollider  = scene.physics.add.collider(enemies, enemies);

    player.isProcessingDamage = false;
    lastDamageTime = -99999;
    lastModTime    = -10000;

    _lArmDestroyed = false; _rArmDestroyed = false; _legsDestroyed = false;
    updateHUD();
    updateBars();

    // Save weapon loadout before drop (module-level, survives player.destroy())
    _savedL   = loadout.L;
    _savedR   = loadout.R;
    _savedMod = loadout.mod;
    _savedAug = loadout.aug;
    _savedLeg = loadout.leg;

    // ── DROP-IN SEQUENCE ──────────────────────────────────────────
    const normalScale = CHASSIS[loadout.chassis].scale;
    _execDropInTween(scene, normalScale);
}

function startHangarGrid() {
    const canvas = document.getElementById('hangar-canvas');
    if (!canvas) return;
    canvas.style.display = 'block';
    if (canvas._gridRunning) return;
    canvas._gridRunning = true;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    let offset = 0;
    function draw() {
        if (!canvas._gridRunning) return;
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
        const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width * 0.55);
        grad.addColorStop(0,   'rgba(0,255,255,0.04)');
        grad.addColorStop(0.5, 'rgba(0,255,255,0.01)');
        grad.addColorStop(1,   'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        offset += 0.4;
        requestAnimationFrame(draw);
    }
    draw();
}

// ═══════════ LOADOUT HELPERS ═══════════

function resetLoadout() {
    loadout.chassis = 'light';
    _applyStarterLoadout('light');
    loadout.color   = 0x00ff00;
    closeAllDD();
}

/** Apply the starter loadout for the given chassis type. */
function _applyStarterLoadout(ch) {
    const starter = STARTER_LOADOUTS[ch] || STARTER_LOADOUTS.medium;
    loadout.L    = starter.L;
    loadout.R    = starter.R;
    loadout.mod  = starter.mod;
    loadout.aug  = starter.aug;
    loadout.leg  = starter.leg;
    loadout.shld = starter.shld;
}
