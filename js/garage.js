// ═══════════ SLOT DETAIL HELPER ═══════════

// Builds multi-line detail HTML for a BUILD STATS slot.
// Returns array of {lbl, val, cls} objects for statRow rendering.
function _buildSlotDetails(slotType, key) {
    if (!key || key === 'none') return [];
    const lines = [];
    const _dim = 'dim';

    if (slotType === 'weapon') {
        const w = WEAPONS[key];
        if (!w) return [];
        const desc = (typeof SLOT_DESCS !== 'undefined' && SLOT_DESCS[key]) ? SLOT_DESCS[key].desc : (w.desc || null);
        if (desc) lines.push({ lbl: '  INFO', val: desc, cls: _dim });

    } else if (slotType === 'shield') {
        const s = typeof SHIELD_SYSTEMS !== 'undefined' ? SHIELD_SYSTEMS[key] : null;
        if (!s) return [];
        const desc = (typeof SLOT_DESCS !== 'undefined' && SLOT_DESCS[key]) ? SLOT_DESCS[key].desc : (s.desc || null);
        if (desc && key !== 'none') lines.push({ lbl: '  INFO', val: desc, cls: _dim });

    } else if (slotType === 'augment') {
        const a = typeof AUGMENTS !== 'undefined' ? AUGMENTS[key] : null;
        if (!a) return [];
        if (a.desc && key !== 'none') lines.push({ lbl: '  INFO', val: a.desc, cls: _dim });

    } else if (slotType === 'legs') {
        const l = typeof LEG_SYSTEMS !== 'undefined' ? LEG_SYSTEMS[key] : null;
        if (!l) return [];
        if (l.desc && key !== 'none') lines.push({ lbl: '  INFO', val: l.desc, cls: _dim });

    } else if (slotType === 'cpu') {
        const m = WEAPONS[key];
        if (!m) return [];
        const desc = (typeof SLOT_DESCS !== 'undefined' && SLOT_DESCS[key]) ? SLOT_DESCS[key].desc : (m.desc || null);
        if (desc) lines.push({ lbl: '  INFO', val: desc, cls: _dim });
    }

    return lines;
}

// ═══════════ DROPDOWN SYSTEM ═══════════


function _wzCloseAllDD() {
    document.querySelectorAll('#garage-menu .wz-dd-selected').forEach(el => el.classList.remove('dd-open'));
    document.querySelectorAll('#garage-menu .wz-dd-list').forEach(el => el.classList.remove('dd-list-open'));
    _openDD = null;
}

function _wzToggleDD(slotId) {
    if (_openDD === slotId) { _wzCloseAllDD(); return; }
    _wzCloseAllDD();
    _openDD = slotId;
    _wzBuildDropdown(slotId);
    document.getElementById('wz-dds-' + slotId)?.classList.add('dd-open');
    document.getElementById('wz-ddl-' + slotId)?.classList.add('dd-list-open');
}

function _wzToggleColorDD() {
    if (_openDD === 'COL') { _wzCloseAllDD(); return; }
    _wzCloseAllDD();
    _openDD = 'COL';
    _wzBuildColorDD();
    document.getElementById('wz-dds-COL')?.classList.add('dd-open');
    document.getElementById('wz-ddl-COL')?.classList.add('dd-list-open');
}

function _wzBuildDropdown(slotId) {
    const list = document.getElementById('wz-ddl-' + slotId);
    if (!list) return;
    list.innerHTML = '';
    const chassis = loadout.chassis;

    let options, restrictSet;
    if (slotId === 'L' || slotId === 'R') {
        options = typeof WEAPON_OPTIONS !== 'undefined' ? WEAPON_OPTIONS : [];
        restrictSet = typeof CHASSIS_WEAPONS !== 'undefined' ? CHASSIS_WEAPONS[chassis] : null;
    } else if (slotId === 'M') {
        options = typeof MOD_OPTIONS !== 'undefined' ? MOD_OPTIONS : [];
        restrictSet = typeof CHASSIS_CPUS !== 'undefined' ? CHASSIS_CPUS[chassis] : null;
    } else if (slotId === 'S') {
        options = typeof SHIELD_OPTIONS !== 'undefined' ? SHIELD_OPTIONS : [];
        restrictSet = typeof CHASSIS_SHIELDS !== 'undefined' ? CHASSIS_SHIELDS[chassis] : null;
    } else if (slotId === 'G') {
        options = typeof LEG_OPTIONS !== 'undefined' ? LEG_OPTIONS : [];
        restrictSet = typeof CHASSIS_LEGS !== 'undefined' ? CHASSIS_LEGS[chassis] : null;
    } else {
        options = typeof AUG_OPTIONS !== 'undefined' ? AUG_OPTIONS : [];
        restrictSet = typeof CHASSIS_AUGS !== 'undefined' ? CHASSIS_AUGS[chassis] : null;
    }

    const currentKey = loadout[SLOT_ID_MAP[slotId]];
    const lHasWeapon = loadout.L && loadout.L !== 'none';
    const rHasWeapon = loadout.R && loadout.R !== 'none';

    const _sorted = [...options].sort((a, b) => (a.weight || 0) - (b.weight || 0));
    _sorted.forEach(opt => {
        if (restrictSet && !restrictSet.has(opt.key)) return;

        const otherArm = slotId === 'L' ? loadout.R : slotId === 'R' ? loadout.L : null;
        const isDual = chassis === 'light' && (slotId === 'L' || slotId === 'R') && opt.key !== 'none' && opt.key === otherArm;
        const isBlocked = chassis !== 'light' && (slotId === 'L' || slotId === 'R') && opt.key !== 'none' && opt.key === otherArm;
        const isNoneDisabled = opt.key === 'none'
            && (slotId === 'L' || slotId === 'R')
            && (slotId === 'L' ? !rHasWeapon : !lHasWeapon);

        const desc = typeof SLOT_DESCS !== 'undefined' ? SLOT_DESCS[opt.key] : null;
        const descText = (desc && opt.key !== 'none') ? desc.desc : '';
        const titleText = (slotId === 'L' || slotId === 'R')
            ? ((typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[opt.key] : null) || opt.label)
            : (desc ? desc.title : opt.label);

        const div = document.createElement('div');
        div.className = 'dd-option'
            + (opt.key === currentKey ? ' dd-active' : '')
            + (isBlocked || isNoneDisabled ? ' do-disabled' : '');
        div.innerHTML = `
            <div class="do-header">
                <span class="do-name">${titleText}${isDual ? ' <span style="font-size:9px;letter-spacing:1px;color:#00ffcc;background:rgba(0,255,204,0.12);padding:1px 5px;border:1px solid rgba(0,255,204,0.3);border-radius:2px;vertical-align:middle;">DUAL</span>' : ''}${isBlocked ? ' <span style="font-size:9px;letter-spacing:1px;color:rgba(255,100,100,0.7);background:rgba(255,60,60,0.08);padding:1px 5px;border:1px solid rgba(255,60,60,0.25);border-radius:2px;vertical-align:middle;">IN USE</span>' : ''}</span>
            </div>
            ${descText ? `<div class="do-desc">${descText}</div>` : ''}`;
        if (!isBlocked && !isNoneDisabled) div.onclick = () => { selectSlot(slotId, opt.key); _wzCloseAllDD(); };
        list.appendChild(div);
    });
}

function _wzBuildColorDD() {
    const list = document.getElementById('wz-ddl-COL');
    if (!list) return;
    list.innerHTML = '';
    const curHex = loadout.color.toString(16).padStart(6, '0').toLowerCase();
    (typeof COLOR_OPTIONS !== 'undefined' ? COLOR_OPTIONS : []).forEach(opt => {
        const desc = typeof SLOT_DESCS !== 'undefined' ? SLOT_DESCS['col_' + opt.key] : null;
        const div = document.createElement('div');
        div.className = 'dd-option dd-color-opt' + (opt.key === curHex ? ' dd-active' : '');
        div.innerHTML = `
            <div class="do-header">
                <span class="do-color-swatch" style="background:${opt.hex6};box-shadow:0 0 6px ${opt.hex6}55;"></span>
                <span class="do-name">${opt.label}</span>
            </div>
            ${desc ? `<div class="do-desc">${desc.desc}</div>` : ''}`;
        div.onclick = () => { loadout.color = opt.hex; _wzCloseAllDD(); refreshGarage(); };
        list.appendChild(div);
    });
}

// Legacy wrappers — some external files call these
function closeAllDD() { _wzCloseAllDD(); }
function toggleDD(slotId) { _wzToggleDD(slotId); }

function selectSlot(slotId, key) {
    if (slotId === 'L' || slotId === 'R') {
        // Only Light chassis can dual-wield (same weapon in both arms).
        if (slotId === 'L') {
            loadout.L = key;
            // Non-light: if the other arm already has the same weapon, clear it
            if (loadout.chassis !== 'light' && key !== 'none' && loadout.R === key) loadout.R = 'none';
        } else {
            loadout.R = key;
            if (loadout.chassis !== 'light' && key !== 'none' && loadout.L === key) loadout.L = 'none';
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

function _wzGetSlotLabel(slotId) {
    const key = loadout[SLOT_ID_MAP[slotId]];
    if (!key || key === 'none') return 'NONE';
    const desc = typeof SLOT_DESCS !== 'undefined' ? SLOT_DESCS[key] : null;
    if (desc) return desc.title;
    if (slotId === 'L' || slotId === 'R') return (typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[key] : null) || WEAPONS[key]?.name || key.toUpperCase();
    if (slotId === 'S') return (SHIELD_SYSTEMS[key]?.name || key.toUpperCase());
    if (slotId === 'G') return (typeof LEG_SYSTEMS !== 'undefined' ? LEG_SYSTEMS[key]?.name : null) || key.toUpperCase();
    if (slotId === 'A') return (typeof AUGMENTS !== 'undefined' ? AUGMENTS[key]?.name : null) || key.toUpperCase();
    if (slotId === 'M') return (WEAPONS[key]?.name || key.toUpperCase());
    return key.toUpperCase();
}

function refreshGarage() {
    const el = document.getElementById('garage-menu');
    if (!el) return;

    const chassis  = loadout.chassis;
    const hexStr   = loadout.color.toString(16).padStart(6, '0').toLowerCase();
    const colorOpt = (typeof COLOR_OPTIONS !== 'undefined' ? COLOR_OPTIONS : [])
        .find(o => o.key === hexStr) || { label: 'GREEN', hex6: '#00ff00' };
    const ch     = typeof CHASSIS !== 'undefined' ? CHASSIS[chassis] : {};
    const lEmpty = !loadout.L || loadout.L === 'none';
    const rEmpty = !loadout.R || loadout.R === 'none';
    const braceArm = lEmpty !== rEmpty;

    const shldSys  = typeof SHIELD_SYSTEMS !== 'undefined'
        ? (SHIELD_SYSTEMS[loadout.shld] || { maxShield: 0 })
        : { maxShield: 0 };
    const totalHP  = typeof getTotalHP === 'function'
        ? getTotalHP(chassis)
        : (ch.coreHP || 0) + (ch.armHP || 0) * 2 + (ch.legHP || 0);

    // ── Stat calculations ──
    const oc    = loadout.aug === 'overclock_cpu';
    const hydro = loadout.leg === 'hydraulic_boost';
    const gyro  = loadout.leg === 'gyro_stabilizer';
    const mag   = loadout.leg === 'mag_anchors';
    const spd   = Math.round((ch.spd || 210) * (hydro ? 1.20 : 1.0));
    const spdStr = spd + ' u/s' + (hydro ? ' (+20%)' : '');

    const shHp  = shldSys.maxShield || 0;
    const shStr = shHp + ' HP';

    const reloadMult   = oc ? 0.88 : 1.0;
    const braceDmgB    = braceArm ? 1.25 : 1.0;
    const braceRldB    = braceArm ? 0.85 : 1.0;
    function fmtReload(w) {
        if (!w || !w.reload) return null;
        const r   = Math.round(w.reload * reloadMult * braceRldB);
        const dps = w.dmg ? ((w.dmg * braceDmgB) / (r / 1000)).toFixed(1) : null;
        const tag = braceArm ? ' ★' : '';
        return dps ? dps + ' dps · ' + r + 'ms cd' + tag : r + 'ms cd' + tag;
    }
    const wL   = WEAPONS[loadout.L];
    const wR   = WEAPONS[loadout.R];
    const modW = WEAPONS[loadout.cpu];
    const lRate = fmtReload(wL);
    const rRate = fmtReload(wR);
    const modCd = modW?.cooldown ? Math.round(modW.cooldown * (oc ? 0.88 : 1.0) / 1000) + 's cd' : null;

    // ── Passives ──
    const passives = [];
    if (braceArm)  passives.push('+25% damage · +15% reload (single-arm brace)');
    if (gyro)      passives.push('leg penalty immunity');
    if (mag)       passives.push('−20% dmg in / +15% dmg out when still');
    if (loadout.aug === 'target_painter')   passives.push('hit marks: +20% dmg on target');
    if (loadout.aug === 'threat_analyzer')  passives.push('hit debuff: −15% resist 3s');
    if (loadout.aug === 'reactive_plating') passives.push('on hit: +5% DR stack (max 5)');
    if (loadout.aug === 'scrap_cannon')     passives.push('limb destroy: 30 AoE');
    if (loadout.leg === 'mine_layer')       passives.push('drop mine every 8s moving');
    if (loadout.leg === 'afterleg')         passives.push('jump +50% dist · land shockwave');

    // ── Chassis traits ──
    const chassisTraits = [];
    if (chassis === 'light') {
        chassisTraits.push('Dual-fire: fires both arms simultaneously when same weapon equipped in each');
        chassisTraits.push('+20% reload speed (passive)');
        chassisTraits.push('Arms: fragile — 30% less base HP');
    } else if (chassis === 'medium') {
        chassisTraits.push('All mod cooldowns −15%');
        chassisTraits.push('Kills reduce mod cooldown by 0.5s');
        chassisTraits.push('Shield absorbs 60% of damage');
    } else if (chassis === 'heavy') {
        chassisTraits.push('Passive 15% damage reduction');
        chassisTraits.push('Cannot equip JUMP or AFTERLEG');
        chassisTraits.push('Built for sustained attrition');
    }

    // ── Slot label helpers ──
    const weaponName = (key) => {
        if (!key || key === 'none') return 'NONE';
        return (typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[key] : null)
            || WEAPONS[key]?.name || key.toUpperCase();
    };

    function statRow(lbl, val, cls) {
        return `<div class="hg-stat-row"><span class="hg-stat-label">${lbl}</span><span class="hg-stat-val${cls ? ' ' + cls : ''}">${val}</span></div>`;
    }
    // ── Stats panel HTML (new order) ──
    let statsHtml = '';
    // Chassis name
    statsHtml += statRow('CHASSIS', (chassis || '').toUpperCase(), 'warn');
    // Chassis perks/traits
    if (chassisTraits.length) {
        const chCls = 'gold';
        statsHtml += statRow('CHASSIS PERKS', chassisTraits.join(' · '), chCls);
    }
    // HP
    const _hpN = n => `<span style="color:#00ff88">${n}</span>`;
    const _hpD = s => `<span style="color:rgba(255,255,255,0.55)">${s}</span>`;
    statsHtml += statRow('HP SPLIT',
        _hpD('C ') + _hpN(ch.coreHP||0) + _hpD(' / A ') + _hpN(ch.armHP||0) + _hpD(' / L ') + _hpN(ch.legHP||0),
        '');
    statsHtml += statRow('TOTAL HP', totalHP + ' HP', 'green');
    statsHtml += statRow('TOTAL SHIELD', shHp > 0 ? shStr : 'NONE', shHp > 0 ? '' : 'dim');
    // Slot details — same order as dropdown list
    function slotBlock(label, slotType, key) {
        const name = (slotType === 'weapon') ? weaponName(key) : _wzGetSlotLabel(
            slotType === 'cpu' ? 'M' : slotType === 'augment' ? 'A' : slotType === 'legs' ? 'G' : 'S'
        );
        if (!key || key === 'none' || name === 'NONE') {
            statsHtml += statRow(label, '<span style="color:var(--sci-txt2)">NONE</span>', '');
            return;
        }
        const details = _buildSlotDetails(slotType, key);
        const sep = '<span style="color:var(--sci-txt2)"> · </span>';
        const displayName = slotType === 'weapon' ? name.toUpperCase() : name;
        const nameSpan = `<span style="color:var(--sci-gold)">${displayName}</span>`;
        if (!details.length) {
            statsHtml += statRow(label, nameSpan, '');
            return;
        }
        const detailSpans = details.map(d => {
            const isDesc = d.lbl.trim() === 'INFO';
            return `<span style="color:${isDesc ? 'var(--sci-txt2)' : 'var(--sci-txt)'}">${d.val}</span>`;
        });
        statsHtml += statRow(label, nameSpan + sep + detailSpans.join(sep), '');
    }
    slotBlock('CPU', 'cpu', loadout.cpu);
    slotBlock('AUGMENT', 'augment', loadout.aug);
    slotBlock('L ARM', 'weapon', loadout.L);
    slotBlock('R ARM', 'weapon', loadout.R);
    slotBlock('LEGS', 'legs', loadout.leg);
    slotBlock('SHIELD', 'shield', loadout.shld);

    // ── Dropdown row builder ──
    function ddRow(slotId, labelText) {
        const name   = slotId === 'L' ? weaponName(loadout.L)
                     : slotId === 'R' ? weaponName(loadout.R)
                     : _wzGetSlotLabel(slotId);
        const locked = '';
        return `<div class="mp-dd-row"${locked}>
            <span class="mp-dd-label">${labelText}</span>
            <div class="pvp-dd-wrap" style="position:relative;flex:1;">
                <div class="mp-dd-selected wz-dd-selected" id="wz-dds-${slotId}" onclick="_wzToggleDD('${slotId}')">
                    <span>${name}</span>
                    <span style="font-size:9px;opacity:0.5;">▼</span>
                </div>
                <div class="dd-list wz-dd-list" id="wz-ddl-${slotId}"></div>
            </div>
        </div>`;
    }

    // ── Dual-explosive warning ──
    const bothExplosive = typeof EXPLOSIVE_KEYS !== 'undefined' && EXPLOSIVE_KEYS.has(loadout.L) && EXPLOSIVE_KEYS.has(loadout.R);

    // ── Deploy button validation ──
    const noWeapons = lEmpty && rEmpty;
    const deployDisabled = noWeapons ? ' style="opacity:0.45;pointer-events:none;"' : '';

    el.innerHTML = `
        <!-- Top bar -->
        <div class="mp-top">
            <button id="hangar-mm-btn" class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;" onclick="returnToMainMenu()">‹ Back</button>
            <div class="mp-screen-title">WARZONE</div>
            <div style="margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;">
                <button id="deploy-btn" class="tw-btn tw-btn--solid" style="flex:0 0 auto;width:auto;" onclick="deployMech()"${deployDisabled}>Deploy Mech ›</button>
            </div>
        </div>

        <!-- Body -->
        <div class="mp-body">

            <!-- Left column: preview + controls -->
            <div class="mp-left">

                <!-- Mech preview -->
                <div class="mp-preview-zone">
                    <div class="mp-preview-box">
                        <div class="sci-corner sci-corner-tl"></div>
                        <div class="sci-corner sci-corner-tr"></div>
                        <div class="sci-corner sci-corner-bl"></div>
                        <div class="sci-corner sci-corner-br"></div>
                        <img id="preview-img" src="assets/${chassis}-mech.png"
                            style="max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 0 15px #${hexStr});">
                    </div>
                    <div style="font-size:9px;letter-spacing:3px;color:var(--sci-txt3);text-transform:uppercase;">
                        ${chassis} &nbsp;·&nbsp; ${colorOpt.label}
                    </div>
                </div>

                <!-- Dropdowns section -->
                <div class="mp-left-controls">
                    <div class="mp-sec-label">Chassis</div>
                    <div class="mp-chassis-row">
                        <button id="c-light" class="mp-chassis-btn${chassis === 'light' ? ' active' : ''}" onclick="setChassis('light')">Light</button>
                        <button id="c-medium" class="mp-chassis-btn${chassis === 'medium' ? ' active' : ''}" onclick="setChassis('medium')">Medium</button>
                        <button id="c-heavy" class="mp-chassis-btn${chassis === 'heavy' ? ' active' : ''}" onclick="setChassis('heavy')">Heavy</button>
                    </div>

                    <div class="mp-sec-label">Loadout</div>
                    <div class="mp-dd-row">
                        <span class="mp-dd-label">Colour</span>
                        <div class="pvp-dd-wrap" style="position:relative;flex:1;">
                            <div class="mp-dd-selected wz-dd-selected" id="wz-dds-COL" onclick="_wzToggleColorDD()">
                                <span style="display:flex;align-items:center;gap:8px;">
                                    <span style="width:10px;height:10px;background:${colorOpt.hex6};display:inline-block;flex-shrink:0;"></span>
                                    ${colorOpt.label}
                                </span>
                                <span style="font-size:9px;opacity:0.5;">▼</span>
                            </div>
                            <div class="dd-list wz-dd-list" id="wz-ddl-COL"></div>
                        </div>
                    </div>
                    ${ddRow('M', 'Cpu')}
                    ${ddRow('A', 'Augment')}
                    ${ddRow('L', 'L.Arm')}
                    ${ddRow('R', 'R.Arm')}
                    ${ddRow('G', 'Legs')}
                    ${ddRow('S', 'Shield')}
                    ${bothExplosive ? '<div style="font-size:9px;letter-spacing:1px;color:var(--sci-gold);margin-top:8px;">⚠ Dual explosive — high self-damage risk</div>' : ''}
                </div>

            </div><!-- /mp-left -->

            <!-- Right column: full build stats -->
            <div class="mp-right">
                <div class="mp-stats-header">Build stats</div>
                <div style="padding:12px 20px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;flex:1;">
                    ${statsHtml}
                </div>
            </div>

        </div><!-- /mp-body -->
    `;

    // Close dropdowns when clicking outside
    el.onclick = (e) => {
        if (!e.target.closest('.pvp-dd-wrap')) _wzCloseAllDD();
    };
}

function _calcWeight(lo) {
    const w = (obj, key) => (key && key !== 'none') ? (obj[key]?.weight || 0) : 0;
    // Weight cap applies to weapons only — mod/aug/leg/shield no longer count toward cap
    const lW = w(WEAPONS, lo.L);
    const rW = w(WEAPONS, lo.R);
    return lW + rW;
}

function deployMech() {
    // Phase 4: Apply campaign chassis upgrades before deploy
    if (_gameMode === 'campaign' && typeof applyChassisUpgrades === 'function') {
        applyChassisUpgrades();
    }

    // HEAVY: strip forbidden items if somehow equipped
    if (loadout.chassis === 'heavy') {
        if (loadout.cpu === 'jump')    loadout.cpu = 'none';
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
    const hitR = loadout.chassis === 'light' ? 16 : loadout.chassis === 'medium' ? 22 : 30;
    player.body.setCircle(hitR);
    // Center the circle on the sprite using unscaled dimensions — works for all chassis scales.
    const offsetX = (player.width - hitR * 2) / 2;
    const offsetY = (player.height - hitR * 2) / 2;
    player.body.setOffset(offsetX, offsetY);
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
    _savedCpu = loadout.cpu;
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
    loadout.cpu  = starter.cpu;
    loadout.aug  = starter.aug;
    loadout.leg  = starter.leg;
    loadout.shld = starter.shld;
}
