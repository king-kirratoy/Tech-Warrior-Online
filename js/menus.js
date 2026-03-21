// ═══════════ NAVIGATION ═══════════

function returnToHangar() {
    if (_isPaused) { _isPaused=false; const s=GAME.scene.scenes[0]; if(s){s.physics.resume();s.time.paused=false;} }
    const _sc = GAME?.scene?.scenes[0]; if (_sc?._bfGrid) _sc._bfGrid.setVisible(false);
    // Scale cleanup for jump tween interruption
    if (_sc) {
        try {
            const _bs = CHASSIS[loadout?.chassis]?.scale || 1.0;
            if (typeof torso !== 'undefined' && torso?.active) torso.setScale(_bs);
            if (typeof player !== 'undefined' && player?.active) player.setScale(1.0);
        } catch(e) {}
    }
    document.getElementById('death-screen').style.display = 'none';
    _cleanupGame();
    const scene = GAME.scene.scenes[0];
    try { scene.input.setDefaultCursor('default'); } catch(e){}
    if (scene.hangarOverlay) scene.hangarOverlay.setVisible(true);
    document.getElementById('ui-layer').style.display = 'flex';
    document.getElementById('hud-container').style.display = 'none';
    const rhud = document.getElementById('round-hud'); if (rhud) rhud.style.display = 'none';
    _hideBossHPBar();
    const _mm2 = document.getElementById('minimap-wrap'); if (_mm2) _mm2.style.display = 'none';
    const _edh = document.getElementById('enemy-doll-hud'); if (_edh) _edh.style.display = 'none';
    const _pm = document.getElementById('perk-menu'); if (_pm) _pm.style.display = 'none';
    _eDollTarget = null;
    const rban = document.getElementById('round-banner'); if (rban) rban.style.display = 'none';
    document.getElementById('top-left-btns').style.display = 'none';
    startHangarGrid();
    // Update hangar mode label
    const _modeLabel = document.getElementById('hangar-mode-label');
    if (_modeLabel) {
        if (_gameMode === 'campaign') {
            const _lvl = (typeof _campaignState !== 'undefined') ? _campaignState.playerLevel : 1;
            _modeLabel.textContent = 'CAMPAIGN // LV.' + _lvl + ' // ROUND ' + _round;
            _modeLabel.style.color = 'rgba(255,215,0,0.45)';
        } else {
            _modeLabel.textContent = 'COMBAT SIMULATION';
            _modeLabel.style.color = 'rgba(0,255,255,0.35)';
        }
    }
    // Reset HUD to clean state
    _resetHUDState();
    // ── Game reset — behavior depends on mode ──
    if (_gameMode === 'campaign') {
        // Campaign: keep gear, save progress, just reset combat state
        saveCampaignProgress();
        saveInventory();
    } else {
        // Simulation: full wipe — each run starts from scratch
        if (_round > 1 || _totalKills > 0) _capturePendingRun();
        resetInventory();
        _applyStarterLoadout(loadout.chassis);
    }
    _round      = (_gameMode === 'campaign') ? _round : 1;
    CHASSIS.medium.modCooldownMult = 0.85; // restore from tactical_uplink modification
    _roundKills = 0;
    _roundTotal = 0;
    _roundActive  = false;
    _roundClearing = false;
    _extractionActive = false; _extractionPoint = null; _extractionVisuals = null; _extractionPromptShown = false;
    _pickedPerks  = [];
    _perksEarned  = (_gameMode === 'campaign') ? _perksEarned : 0;
    _shotsFired   = 0; _shotsHit = 0; _damageDealt = 0; _damageTaken = 0;
    _lastOfferedPerks = [];
    _perkState = _resetPerkState(); // shared factory — see _resetPerkState()
    window._spectreClones = [];
    _lastKillTime = 0;
    window._missionStartTime = null;
    // Keep loadout — player keeps their build configuration
    // Ensure old map cover objects are cleared (they'll regenerate on next deploy)
    try { if (coverObjects) coverObjects.clear(true, true); } catch(e) {}
    refreshGarage();
    updateHUD();
}

function returnToMainMenu() {
    // Full cleanup same as returnToHangar
    returnToHangar();
    // Restore chassis selector (may have been hidden in campaign mode)
    const chassisRow = document.getElementById('chassis-select-row');
    if (chassisRow) chassisRow.style.display = '';
    // Hide the hangar ui-layer (returnToHangar shows it — hide it again)
    document.getElementById('ui-layer').style.display = 'none';
    // Show main menu directly (skip callsign screen — callsign already known)
    document.getElementById('callsign-screen').style.display = 'none';
    const menu = document.getElementById('main-menu');
    if (menu) {
        menu.style.display = 'flex';
        menu.style.opacity = '0';
        menu.style.transition = 'opacity 0.5s ease';
        _updateCampaignButton();
        setTimeout(() => { menu.style.opacity = '1'; }, 20);
    }
}

function goToMainMenu() {
    if (_isPaused) togglePause();
    // PVP: destroy remote players, disconnect socket, and downgrade mode before _cleanupGame()
    // so the scene wipe destroys all PVP mech objects instead of preserving them.
    if (_gameMode === 'pvp') {
        if (typeof mpCleanupMatch === 'function') mpCleanupMatch();
        if (typeof mpDisconnect === 'function') mpDisconnect();
        if (typeof _pvpHangarOpen !== 'undefined') _pvpHangarOpen = false;
        if (typeof _mpChatOpen !== 'undefined') _mpChatOpen = false;
        const pvpHangarEl = document.getElementById('pvp-hangar');
        if (pvpHangarEl) pvpHangarEl.style.display = 'none';
        const pvpMenuEl = document.getElementById('mp-pvp-menu');
        if (pvpMenuEl) pvpMenuEl.style.display = 'none';
        _gameMode = 'simulation';  // downgrade so _cleanupGame() destroys PVP objects properly
    }
    const _gmScene = GAME?.scene?.scenes[0];
    if (_gmScene) { try { _gmScene.physics.resume(); } catch(e){} }
    _cleanupGame();
    // Reset round state
    _round = 1; _roundKills = 0; _roundTotal = 0; _totalKills = 0; _roundActive = false;
    _extractionActive = false; _extractionPoint = null; _extractionVisuals = null; _extractionPromptShown = false;
    _lArmDestroyed = false; _rArmDestroyed = false; _legsDestroyed = false;
    CHASSIS.medium.modCooldownMult = 0.85; // restore from tactical_uplink modification
    _perkState = _resetPerkState(); // shared factory — see _resetPerkState()
    _pickedPerks = [];
    _lastOfferedPerks = [];
    window._spectreClones = [];
    _lastKillTime = 0;
    window._missionStartTime = null;
    _shotsFired = 0; _shotsHit = 0; _damageDealt = 0; _damageTaken = 0; _perksEarned = 0;
    _roundClearing = false;
    // Simulation: wipe inventory/gear so the previous run's drops don't carry into the next run.
    // Campaign: keep inventory intact — it will be reloaded from localStorage on resume.
    if (_gameMode !== 'campaign' && typeof resetInventory === 'function') resetInventory();
    resetLoadout(); // reset gear when returning to main menu
    // Restore cursor (Phaser hides it on deploy)
    const sc = GAME?.scene?.scenes[0];
    if (sc) { try { sc.input.setDefaultCursor('default'); } catch(e){} }
    document.body.style.cursor = 'default';
    // Hide all in-GAME UI
    document.getElementById('ui-layer').style.display = 'none';
    document.getElementById('hud-container').style.display = 'none';
    document.getElementById('top-left-btns').style.display = 'none';
    const _so = document.getElementById('stats-overlay'); if (_so) _so.style.display = 'none';
    _isStats = false;
    const rhud = document.getElementById('round-hud'); if (rhud) rhud.style.display = 'none';
    _hideBossHPBar();
    const mmw  = document.getElementById('minimap-wrap'); if (mmw) mmw.style.display = 'none';
    const edh  = document.getElementById('enemy-doll-hud'); if (edh) edh.style.display = 'none';
    const pm   = document.getElementById('perk-menu'); if (pm) pm.style.display = 'none';
    const rb   = document.getElementById('round-banner'); if (rb) rb.style.display = 'none';
    const ds   = document.getElementById('death-screen'); if (ds) ds.style.display = 'none';
    const po   = document.getElementById('pause-overlay'); if (po) po.style.display = 'none';
    const mso  = document.getElementById('mission-select-overlay'); if (mso) mso.style.display = 'none';
    const mbp  = document.getElementById('mission-briefing-popup'); if (mbp) mbp.style.display = 'none';
    const sho  = document.getElementById('shop-overlay'); if (sho) sho.style.display = 'none';
    const lso  = document.getElementById('loadout-slots-overlay'); if (lso) lso.style.display = 'none';
    const ugo  = document.getElementById('upgrades-overlay'); if (ugo) ugo.style.display = 'none';
    window._activeCampaignConfig = null;
    // Restore chassis selector (may have been hidden in campaign mode)
    const chassisRow2 = document.getElementById('chassis-select-row');
    if (chassisRow2) chassisRow2.style.display = '';
    // Stop hangar grid animation
    const hgc = document.getElementById('hangar-canvas');
    if (hgc) { hgc._gridRunning = false; hgc.style.display = 'none'; }
    // Show main menu and restart its animated grid
    const menu = document.getElementById('main-menu');
    if (menu) { menu.style.opacity = '1'; menu.style.display = 'flex'; }
    resetLoadout();
    startMenuGrid();
    // Sync garage UI to the reset loadout so it matches when player returns
    try { refreshGarage(); } catch(e) {}
}

function respawnMech() {
    document.getElementById('death-screen').style.display = 'none';
    // Fully clear all pause/stats state before resuming
    _isPaused = false;
    _isStats  = false;
    const _statsOv2 = document.getElementById('stats-overlay');
    if (_statsOv2) _statsOv2.style.display = 'none';
    const _pauseOv = document.getElementById('pause-overlay');
    if (_pauseOv) _pauseOv.style.display = 'none';
    // Resume physics AND time before cleanup so destroys work cleanly
    const _rScene = GAME?.scene?.scenes[0];
    if (_rScene) {
        try { _rScene.physics.resume(); } catch(e){}
        try { _rScene.time.paused = false; } catch(e){}
    }
    _cleanupGame();
    // Reset loot/inventory — campaign keeps gear, simulation wipes
    if (_gameMode !== 'campaign') {
        if (typeof resetInventory === 'function') resetInventory();
    }
    document.getElementById('hud-container').style.display = 'flex';
    document.getElementById('top-left-btns').style.display = 'flex';
    const _mm = document.getElementById('minimap-wrap'); if (_mm) _mm.style.display = 'block';
    // Hide animated grid canvas during gameplay
    const hgc = document.getElementById('hangar-canvas');
    if (hgc) { hgc.style.display = 'none'; hgc._gridRunning = false; }
    _resetHUDState();
    if (_gameMode === 'campaign') {
        _round = 1; _roundKills = 0; _roundTotal = 0;
        // Reset round to 1 for each campaign mission deploy
    } else {
        _round = 1; _roundKills = 0; _totalKills = 0; _roundTotal = 0;
    }
    _perkState = _resetPerkState();
    window._spectreClones = [];
    _pickedPerks = [];
    _shotsFired = 0; _shotsHit = 0; _damageDealt = 0; _damageTaken = 0; _perksEarned = 0;
    _roundClearing = false;
    _extractionActive = false; _extractionPoint = null; _extractionVisuals = null; _extractionPromptShown = false;
    CHASSIS.medium.modCooldownMult = 0.85;
    const scene = GAME.scene.scenes[0];
    deployMech();
}

/** Campaign death: apply penalty then go to mission select. */
function campaignDeathToMissionSelect() {
    // Apply scrap death penalty
    let scrapLost = 0;
    if (typeof applyCampaignDeathPenalty === 'function') {
        scrapLost = applyCampaignDeathPenalty();
    }
    // Save after penalty
    if (typeof saveCampaignState === 'function') saveCampaignState();
    saveCampaignProgress();
    saveInventory();

    // Show scrap loss message briefly on death screen
    const ds = document.getElementById('death-screen');
    const title = document.getElementById('death-title');
    if (title && scrapLost > 0) {
        title.innerHTML = 'MECH DESTROYED<br><span style="font-size:16px;color:#ff8844;letter-spacing:2px;">-' + scrapLost + ' SCRAP</span>';
    }

    // After a brief delay, transition to mission select
    setTimeout(() => {
        if (title) title.textContent = 'MECH DESTROYED';
        returnToHangarForMissionSelect();
    }, 2000);
}

/** Campaign: return from combat to the mission select screen. */
function returnToHangarForMissionSelect() {
    // Use returnToHangar to clean up GAME state
    returnToHangar();
    // Then hide hangar and show mission select
    document.getElementById('ui-layer').style.display = 'none';
    const hgc = document.getElementById('hangar-canvas');
    if (hgc) { hgc._gridRunning = false; hgc.style.display = 'none'; }
    window._activeCampaignConfig = null;
    // Phase 4: Refresh shop stock when returning to mission select
    if (typeof refreshShopStock === 'function') refreshShopStock();
    if (typeof showMissionSelect === 'function') showMissionSelect();
}

function startGame(mode) {
    _gameMode = mode || 'simulation';
    const menu = document.getElementById('main-menu');
    if (!menu) return;
    // Callsign was already captured in proceedToMainMenu
    // If somehow arriving here without callsign (e.g. direct call), fall back
    if (!_playerCallsign || _playerCallsign === 'ANONYMOUS') {
        const _csInput = document.getElementById('menu-callsign');
        const _csVal   = (_csInput?.value || '').trim().toUpperCase();
        _playerCallsign = _sanitizeCallsign(_csVal || (localStorage.getItem ? (localStorage.getItem('tw_callsign') || 'ANONYMOUS') : 'ANONYMOUS'));
        if (_playerCallsign && localStorage.setItem) localStorage.setItem('tw_callsign', _playerCallsign);
    }
    // Campaign mode: restore saved progress (cloud first, then localStorage)
    if (_gameMode === 'campaign') {
        // Disable the triggering button and show a loading label while fetching
        const resumeBtn = document.getElementById('resume-campaign-btn');
        const origHtml  = resumeBtn ? resumeBtn.innerHTML : null;
        if (resumeBtn) { resumeBtn.disabled = true; resumeBtn.innerHTML = '&#9733;&nbsp;&nbsp;LOADING SAVE DATA...'; }
        _loadCampaignData()
            .catch(() => {
                // Cloud load failed but _loadCampaignData already falls back to localStorage
            })
            .finally(() => {
                if (resumeBtn && origHtml !== null) { resumeBtn.disabled = false; resumeBtn.innerHTML = origHtml; }
                // Apply chassis upgrades based on pilot level
                if (typeof applyChassisUpgrades === 'function') applyChassisUpgrades();
                // Generate initial shop stock
                if (typeof refreshShopStock === 'function') refreshShopStock();
                // Fade out menu, show mission select
                menu.style.transition = 'opacity 0.6s ease';
                menu.style.opacity = '0';
                setTimeout(() => {
                    menu.style.display = 'none';
                    if (typeof showMissionSelect === 'function') showMissionSelect();
                }, 600);
            });
        return;
    }
    // Simulation mode: go straight to hangar
    menu.style.transition = 'opacity 0.6s ease';
    menu.style.opacity = '0';
    setTimeout(() => {
        menu.style.display = 'none';
        document.getElementById('ui-layer').style.display = 'flex';
        // Show mode label in hangar
        const modeLabel = document.getElementById('hangar-mode-label');
        if (modeLabel) {
            modeLabel.textContent = 'COMBAT SIMULATION';
            modeLabel.style.color = 'rgba(0,255,255,0.35)';
        }
        startHangarGrid();
        // Ensure garage UI matches loadout state
        try { refreshGarage(); } catch(e) {}
    }, 600);
}

function proceedToMainMenu() {
    const csInput = document.getElementById('menu-callsign');
    const val = (csInput?.value || '').trim().toUpperCase();
    if (!val) return; // guard: should not be reachable with disabled btn
    _playerCallsign = _sanitizeCallsign(val);
    try { localStorage.setItem('tw_callsign', _playerCallsign); } catch(e) {}

    // Fade out callsign screen, fade in main menu
    const cs = document.getElementById('callsign-screen');
    const mm = document.getElementById('main-menu');
    cs.style.transition = 'opacity 0.5s ease';
    cs.style.opacity = '0';
    setTimeout(() => {
        cs.style.display = 'none';
        mm.style.display = 'flex';
        mm.style.opacity = '0';
        mm.style.transition = 'opacity 0.5s ease';
        _updateCampaignButton();
        setTimeout(() => { mm.style.opacity = '1'; }, 20);
    }, 500);
}

// ── PVP MULTIPLAYER ─────────────────────────────────────────────
function startMultiplayer() {
    _gameMode = 'pvp';
    // Capture callsign
    if (!_playerCallsign || _playerCallsign === 'ANONYMOUS') {
        const csInput = document.getElementById('menu-callsign');
        const csVal = (csInput?.value || '').trim().toUpperCase();
        _playerCallsign = _sanitizeCallsign(csVal || (localStorage.getItem ? (localStorage.getItem('tw_callsign') || 'ANONYMOUS') : 'ANONYMOUS'));
        if (_playerCallsign && localStorage.setItem) localStorage.setItem('tw_callsign', _playerCallsign);
    }
    // Fade out main menu → show PVP hangar for loadout configuration
    const menu = document.getElementById('main-menu');
    if (menu) {
        menu.style.transition = 'opacity 0.6s ease';
        menu.style.opacity = '0';
        setTimeout(() => {
            menu.style.display = 'none';
            // Show PVP hangar for mech buildout before joining lobby
            mpShowPvpHangar();
        }, 600);
    }
}

// ═══════════ MENU HELPERS ═══════════

function showDeathScreen() {
    console.log('[DEATH] showDeathScreen called. isDeployed=' + isDeployed + ' stack=' + new Error().stack.split('\n')[1]);
    if (!isDeployed) return;  // already dead — prevent double-call
    // PVP deathmatch: death is handled by multiplayer.js (respawn system)
    // Don't show the death screen — just return
    if (_gameMode === 'pvp') {
        return;
    }
    isDeployed = false;
    _roundActive   = false;
    _roundClearing = false;   // prevent update() from being permanently gated
    _cleanupExtraction(GAME?.scene?.scenes[0]);
    // Close stats overlay if open
    _isStats = false;
    _isPaused = false;
    const _statsOv = document.getElementById('stats-overlay');
    if (_statsOv) _statsOv.style.display = 'none';
    const _pauseBtn2 = document.getElementById('pause-btn');
    if (_pauseBtn2) _pauseBtn2.innerHTML = 'MENU';
    // Pause the Phaser scene so the update loop stops running against destroyed objects
    const _dScene = GAME?.scene?.scenes[0];
    if (_dScene) {
        try { _dScene.physics.pause(); } catch(e) {}
        try { _dScene.time.paused = true; } catch(e) {}
        try { _dScene.cameras.main.stopFollow(); } catch(e) {}
        try { _dScene.input.setDefaultCursor('default'); } catch(e) {}
    }
    // Stop player physics
    if (player?.body) { player.body.setVelocity(0, 0); player.body.setAngularVelocity(0); }
    document.body.style.cursor = 'default';
    if (_round > _bestRound) _bestRound = _round;
    // Populate score panel
    const el = id => document.getElementById(id);
    const _acc = _shotsFired > 0 ? Math.round(_shotsHit / _shotsFired * 100) : 0;
    if (el('score-round'))     el('score-round').innerText     = _round;
    if (el('score-kills'))     el('score-kills').innerText     = _totalKills;
    if (el('score-accuracy'))  el('score-accuracy').innerText  = _acc + '%';
    if (el('score-dmg-dealt')) el('score-dmg-dealt').innerText = Math.round(_damageDealt);
    if (el('score-dmg-taken')) el('score-dmg-taken').innerText = Math.round(_damageTaken);
    if (el('score-perks'))     el('score-perks').innerText     = _perksEarned;
    // Campaign mode: update death screen primary button
    const _deathBtn = el('death-btn-primary');
    if (_deathBtn) {
        _deathBtn.innerHTML = (_gameMode === 'campaign') ? '&#9733; MISSION SELECT' : '&#8962; MECH HANGAR';
    }
    const ds = document.getElementById('death-screen');
    if (ds) ds.style.display = 'flex';
    const _dsc = GAME?.scene?.scenes[0];
    if (_dsc) { try { _dsc.input.setDefaultCursor('default'); } catch(e){} }
    document.body.style.cursor = 'default';
}

function togglePause() {
    const scene = GAME.scene.scenes[0];
    if (!scene || !isDeployed) return;
    // PVP: use dedicated PVP menu instead of pause
    if (_gameMode === 'pvp') {
        if (typeof mpIsPvpMenuOpen === 'function' && mpIsPvpMenuOpen()) {
            mpClosePvpMenu();
        } else if (typeof mpShowPvpMenu === 'function') {
            mpShowPvpMenu();
        }
        return;
    }
    // If the combined loadout overlay is open, close it first
    if (_isStats) { toggleStats(); return; }
    _isPaused = !_isPaused;
    const btn = document.getElementById('pause-btn');
    const po  = document.getElementById('pause-overlay');
    const topBtns = document.getElementById('top-left-btns');
    if (_isPaused) {
        scene.physics.pause();
        scene.time.paused = true;
        try { scene.input.setDefaultCursor('default'); } catch(e) {}
        document.body.style.cursor = 'default';
        if (topBtns) topBtns.style.display = 'none';
        if (po) {
            po.style.display = 'flex';
            // Move keyboard focus to first pause menu button so Tab/arrows work immediately
            const firstPauseBtn = po.querySelector('button');
            if (firstPauseBtn) firstPauseBtn.focus();
        }
    } else {
        scene.physics.resume();
        scene.time.paused = false;
        try { scene.input.setDefaultCursor('none'); } catch(e) {}
        document.body.style.cursor = 'none';
        if (topBtns) topBtns.style.display = 'flex';
        if (btn) { btn.innerHTML = 'MENU'; btn.blur(); }
        if (po)  po.style.display = 'none';
    }
}

function toggleStats() {
    const overlay = document.getElementById('stats-overlay');
    if (!overlay) return;
    _isStats = !_isStats;
    if (_isStats) {
        populateStats();
        overlay.style.display = 'flex';
        _isPaused = true;
        const scene = GAME?.scene?.scenes[0];
        if (scene) { try { scene.physics.pause(); scene.time.paused = true; scene.input.setDefaultCursor('default'); } catch(e){} }
        document.body.style.cursor = 'default';
        // Switch to the appropriate tab
        if (_pendingLoadoutTab === 'gear') {
            _switchLoadoutTab('gear');
            _pendingLoadoutTab = null;
        } else {
            _switchLoadoutTab('stats');
        }
    } else {
        overlay.style.display = 'none';
        _isInventory = false;
        _isPaused = false;
        // If opened from mission select, return there instead of resuming GAME
        if (window._loadoutOpenedFromMission) {
            window._loadoutOpenedFromMission = false;
            if (typeof showMissionSelect === 'function') showMissionSelect();
            return;
        }
        const scene = GAME?.scene?.scenes[0];
        if (scene && isDeployed) { try { scene.physics.resume(); scene.time.paused = false; scene.input.setDefaultCursor('none'); } catch(e){} }
        document.body.style.cursor = isDeployed ? 'none' : 'default';
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) pauseBtn.innerHTML = 'MENU';
        // If inventory was opened from equip prompt, fire the callback to start next round
        if (window._equipPromptCallback) {
            const cb = window._equipPromptCallback;
            window._equipPromptCallback = null;
            cb();
        }
    }
}

// toggleInventory now opens the LOADOUT overlay on the GEAR tab
function toggleInventory() {
    if (_isStats) {
        // Already in loadout — switch to gear tab
        _switchLoadoutTab('gear');
        return;
    }
    // Open loadout at gear tab
    _isInventory = true;
    _pendingLoadoutTab = 'gear';
    toggleStats();
}

// Tab switcher for the combined loadout overlay
// _pendingLoadoutTab — declared in js/state.js
function _switchLoadoutTab(tab) {
    const statsContent = document.getElementById('loadout-stats-content');
    const gearContent  = document.getElementById('loadout-gear-content');
    const tabStats     = document.getElementById('loadout-tab-stats');
    const tabGear      = document.getElementById('loadout-tab-gear');
    if (!statsContent || !gearContent) return;
    if (tab === 'gear') {
        statsContent.style.display = 'none';
        gearContent.style.display  = 'block';
        if (tabStats) tabStats.classList.remove('active');
        if (tabGear)  tabGear.classList.add('active');
        populateInventory();
    } else {
        statsContent.style.display = 'block';
        gearContent.style.display  = 'none';
        if (tabStats) tabStats.classList.add('active');
        if (tabGear)  tabGear.classList.remove('active');
    }
}

/** Update Campaign button label. */
function _updateCampaignButton() {
    // Campaign button is now always just "CAMPAIGN" — sub-menu handles Resume/New
    const btn = document.getElementById('campaign-btn');
    if (btn) btn.innerHTML = '&#9733;&nbsp;&nbsp;CAMPAIGN';
    // Reset sub-menu state
    hideCampaignSubMenu();
}

async function showCampaignSubMenu() {
    const mainBtns = document.getElementById('main-menu-buttons');
    const subMenu = document.getElementById('campaign-sub-menu');
    if (!mainBtns || !subMenu) return;
    mainBtns.style.display = 'none';
    subMenu.style.display = 'flex';

    // Check local save
    let hasSave = !!(loadCampaignProgress() || localStorage.getItem('tw_campaign_state'));
    let levelInfo = '';

    const resumeBtn = document.getElementById('resume-campaign-btn');

    // If no local save, do a cloud check with a visible loading state
    if (!hasSave && resumeBtn) {
        resumeBtn.style.display = 'inline-block';
        resumeBtn.disabled = true;
        resumeBtn.innerHTML = '&#9733;&nbsp;&nbsp;CHECKING SAVE DATA...';
        try {
            const cloudData = await loadFromCloud();
            if (cloudData) hasSave = true;
        } catch(e) {}
        resumeBtn.disabled = false;
        resumeBtn.style.display = 'none';
    }

    if (hasSave) {
        try {
            const cs = JSON.parse(localStorage.getItem('tw_campaign_state'));
            if (cs?.playerLevel > 1) levelInfo = ' LV.' + cs.playerLevel;
        } catch(e) {}
    }

    if (resumeBtn) {
        if (hasSave) {
            resumeBtn.style.display = 'inline-block';
            resumeBtn.innerHTML = '&#9733;&nbsp;&nbsp;RESUME CAMPAIGN' + (levelInfo ? ' <span style="font-size:9px;letter-spacing:2px;color:rgba(255,215,0,0.45);margin-left:6px;">' + levelInfo + '</span>' : '');
        } else {
            resumeBtn.style.display = 'none';
        }
    }
    // Move focus to first visible sub-menu button for keyboard users
    const firstBtn = subMenu.querySelector('button:not([style*="display:none"]):not([disabled])');
    if (firstBtn) firstBtn.focus();
}

/** Hide campaign sub-menu and return to main buttons. */
function hideCampaignSubMenu() {
    const mainBtns = document.getElementById('main-menu-buttons');
    const subMenu = document.getElementById('campaign-sub-menu');
    if (mainBtns) mainBtns.style.display = 'flex';
    if (subMenu) subMenu.style.display = 'none';
}

/** Start a brand new campaign — wipe all progress. */
function confirmNewCampaign() {
    // If save exists, confirm first
    const hasSave = loadCampaignProgress() || localStorage.getItem('tw_campaign_state');
    if (hasSave) {
        if (!confirm('Start a NEW campaign? All existing progress, inventory, and levels will be wiped!')) return;
    }
    // Wipe all campaign data
    try {
        localStorage.removeItem('tw_campaign_state');
        localStorage.removeItem('tw_campaign_progress');
        localStorage.removeItem('tw_campaign_inventory');
        localStorage.removeItem('tw_campaign_equipped');
        localStorage.removeItem('tw_campaign_scrap');
        localStorage.removeItem('tw_campaign_itemCounter');
    } catch(e) {}
    // Delete cloud save too
    deleteCloudSave();
    // Reset campaign state in memory
    _campaignState.playerLevel = 1;
    _campaignState.playerXP = 0;
    _campaignState.currentChapter = 0;
    _campaignState.currentMission = 0;
    _campaignState.completedMissions = {};
    _campaignState.chassis = null;
    _campaignState.claimedRewards = {};
    _campaignState.loadoutSlots = [];
    _campaignState.skillsChosen = [];
    _campaignState.activeModifier = null;
    _campaignState.activeBonusObjective = null;
    _campaignState.bonusObjectiveProgress = 0;
    _campaignState.bonusObjectiveComplete = false;
    // Show chassis selection for new campaign
    _showNewCampaignChassisSelect();
}
