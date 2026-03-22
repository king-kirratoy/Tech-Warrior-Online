// ── UI Color Constants ────────────────────────────────────────────
// These replicate CSS tokens for use in JS template literal inline styles.
// CSS variables cannot be read directly from JS without getComputedStyle,
// so named constants are used instead. Names mirror css/base.css tokens.
const UI_COLORS = {
  // Font
  fontMono:       "'Courier New', monospace",

  // Gold family  (#ffd700 = --gold)
  gold:           '#ffd700',
  goldGlow:       'rgba(255,215,0,0.5)',
  gold70:         'rgba(255,215,0,0.7)',
  gold60:         'rgba(255,215,0,0.6)',
  gold45:         'rgba(255,215,0,0.45)',
  gold40:         'rgba(255,215,0,0.4)',
  gold30:         'rgba(255,215,0,0.3)',
  gold25:         'rgba(255,215,0,0.25)',
  gold20:         'rgba(255,215,0,0.2)',
  gold15:         'rgba(255,215,0,0.15)',
  gold12:         'rgba(255,215,0,0.12)',
  gold10:         'rgba(255,215,0,0.1)',
  gold06:         'rgba(255,215,0,0.06)',
  gold04:         'rgba(255,215,0,0.04)',

  // Cyan family  (#00ffff = --cyan)
  cyan:           '#00ffff',
  cyan70:         'rgba(0,255,255,0.7)',
  cyan60:         'rgba(0,255,255,0.6)',
  cyan50:         'rgba(0,255,255,0.5)',
  cyan45:         'rgba(0,255,255,0.45)',
  cyan40:         'rgba(0,255,255,0.4)',
  cyan35:         'rgba(0,255,255,0.35)',
  cyan20:         'rgba(0,255,255,0.2)',
  cyan12:         'rgba(0,255,255,0.12)',
  cyan10:         'rgba(0,255,255,0.1)',
  cyanSurface04:  'rgba(0,255,255,0.04)',
  cyanSurface03:  'rgba(0,255,255,0.03)',

  // HUD cyan family  (rgba(0,210,255,…) = --hud-cyan)
  hudCyan:        'rgba(0,210,255,1)',
  hudCyan75:      'rgba(0,210,255,0.75)',
  hudCyan60:      'rgba(0,210,255,0.6)',
  hudCyan55:      'rgba(0,210,255,0.55)',
  hudCyan40:      'rgba(0,210,255,0.4)',
  hudCyan35:      'rgba(0,210,255,0.35)',
  hudCyan25:      'rgba(0,210,255,0.25)',
  hudCyan08:      'rgba(0,210,255,0.08)',
  hudCyan04:      'rgba(0,210,255,0.04)',

  // Green / teal family
  greenAccent:    '#00ff88',   // --green-accent
  greenPos:       '#44ff88',   // --green-pos
  teal:           '#00ffcc',   // --teal
  tealAlt:        '#00ffc8',   // success toast variant
  yellow:         '#ffdd00',   // --yellow (HP bar mid threshold)
  green80:        'rgba(0,255,136,0.8)',
  green20:        'rgba(0,255,136,0.2)',
  green04:        'rgba(0,255,136,0.04)',
  toastSuccessBg: 'rgba(0,255,200,0.12)',
  toastSuccessBd: 'rgba(0,255,200,0.4)',

  // Red / danger family
  red:            '#ff5050',   // --red
  redAlt:         '#ff4444',   // --red-alt
  redCritical:    '#ff4466',   // --red-critical
  redError:       '#ff3300',   // --red-error
  redHard:        '#ff2200',   // mission difficulty HARD
  redSoft:        'rgba(255,100,100,0.7)',
  redSoft60:      'rgba(255,100,100,0.6)',
  toastErrorBg:   'rgba(255,40,40,0.18)',
  toastErrorBd:   'rgba(255,40,40,0.5)',
  toastErrorText: '#ff6666',

  // Orange / amber / purple
  orange:         '#ff8844',   // --orange
  amber:          '#ffaa00',   // --amber
  purple:         '#cc88ff',   // --purple

  // Chassis accent colors
  chassisLight:   '#88ff88',
  chassisMedium:  '#ffcc44',
  chassisHeavy:   '#ff8844',   // same as --orange

  // Leaderboard specific
  rankGold:       '#ffd700',
  rankSilver:     '#c0c0c0',
  rankBronze:     '#cd7f32',
  leaderName:     '#e8f0e8',
  leaderRound:    '#00e0ff',
  diffEasy:       '#88aacc',
  diffTrivial:    '#666666',

  // Text / neutral  (#c8d2d9 = rgb(200,210,217) = --text)
  text:           '#c8d2d9',
  text90:         'rgba(200,210,217,0.9)',
  text75:         'rgba(200,210,217,0.75)',
  text70:         'rgba(200,210,217,0.7)',
  text65:         'rgba(200,210,217,0.65)',
  text60:         'rgba(200,210,217,0.6)',
  text50:         'rgba(200,210,217,0.5)',
  text40:         'rgba(200,210,217,0.4)',
  text35:         'rgba(200,210,217,0.35)',
  text30:         'rgba(200,210,217,0.3)',
  text25:         'rgba(200,210,217,0.25)',
  rarityCommon:   '#c0c8d0',

  // Surfaces / overlays
  surface:        'rgba(255,255,255,0.04)',   // --surface
  surface03:      'rgba(255,255,255,0.03)',
  surface08:      'rgba(255,255,255,0.08)',
  surface10:      'rgba(255,255,255,0.1)',
  surface05:      'rgba(255,255,255,0.05)',
  bgDark30:       'rgba(0,0,0,0.3)',
};

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
            _modeLabel.style.color = UI_COLORS.gold45;
        } else {
            _modeLabel.textContent = 'COMBAT SIMULATION';
            _modeLabel.style.color = UI_COLORS.cyan35;
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
        _updateMainMenuStats();
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
            modeLabel.style.color = UI_COLORS.cyan35;
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
        _updateMainMenuStats();
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
            const statusEl = document.getElementById('pause-round-status');
            if (statusEl && typeof _round !== 'undefined') {
                statusEl.textContent = 'Round ' + String(_round).padStart(2, '0') + ' active';
            }
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

function _updateMainMenuStats() {
    const callsignEl = document.getElementById('mm-callsign');
    if (callsignEl && typeof _playerCallsign !== 'undefined') {
        callsignEl.textContent = _playerCallsign || '—';
    }
    const missionsEl = document.getElementById('mm-stat-missions');
    if (missionsEl && typeof _campaignState !== 'undefined') {
        missionsEl.textContent = Object.keys(_campaignState.completedMissions || {}).length || '0';
    }
    const roundEl = document.getElementById('mm-stat-round');
    if (roundEl && typeof _bestRound !== 'undefined') {
        roundEl.textContent = _bestRound || '—';
    }
    const fillEl = document.getElementById('mm-xp-fill');
    const textEl = document.getElementById('mm-xp-text');
    if (fillEl && typeof _campaignState !== 'undefined') {
        const level = _campaignState.playerLevel || 1;
        const xpCur = (_campaignState.playerXP || 0) - (typeof getXPForLevel === 'function' ? getXPForLevel(level) : 0);
        const xpNext = typeof getXPToNextLevel === 'function' ? getXPToNextLevel(level) : 100;
        const pct = xpNext > 0 ? Math.min(100, Math.round((xpCur / xpNext) * 100)) : 100;
        fillEl.style.width = pct + '%';
        if (textEl) textEl.textContent = 'LVL ' + level + ' — ' + xpCur + ' / ' + xpNext + ' XP';
    }
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
        resumeBtn.style.display = 'flex';
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
            resumeBtn.style.display = 'flex';
            resumeBtn.innerHTML = '&#9733;&nbsp;&nbsp;RESUME CAMPAIGN';
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

// ═══════════ CAMPAIGN CHASSIS SELECT ═══════════

/** Track which chassis is highlighted in the selection screen. */
let _selectedNewChassis = null;

/** Show chassis selection screen for new campaign. */
function _showNewCampaignChassisSelect() {
    _selectedNewChassis = null;
    const menu = document.getElementById('main-menu');
    if (menu) { menu.style.transition = 'opacity 0.6s ease'; menu.style.opacity = '0'; }
    setTimeout(() => {
        if (menu) menu.style.display = 'none';
        const overlay = document.getElementById('mission-select-overlay');
        if (!overlay) return;
        overlay.dataset.mode = 'chassis-select';  // flag for ESC handler
        _renderChassisSelect(overlay);
    }, 600);
}

/** Render the chassis selection UI. */
function _renderChassisSelect(overlay) {
    if (!overlay) overlay = document.getElementById('mission-select-overlay');
    if (!overlay) return;

    let html = '';
    html += `<div style="font-size:28px;letter-spacing:6px;color:${UI_COLORS.gold};text-shadow:0 0 20px ${UI_COLORS.goldGlow};margin-bottom:6px;">NEW CAMPAIGN</div>`;
    html += `<div style="font-size:11px;letter-spacing:2px;color:${UI_COLORS.goldGlow};margin-bottom:32px;">SELECT YOUR CHASSIS CLASS</div>`;

    const chassisInfo = {
        light:  { color: UI_COLORS.chassisLight,  desc: 'Fast and agile. Access to SMGs, Battle Rifles, Shotguns, Snipers. Mods: Jump, Decoy, Barrier, EMP, Ghost Step.', hp: 'Low HP', speed: 'High Speed' },
        medium: { color: UI_COLORS.chassisMedium, desc: 'Balanced all-rounder. Access to Machine Guns, Battle Rifles, Heavy Rifles, Grenade Launchers, Plasma, Snipers. Mods: Barrier, Repair, Missile, Drone, Overclock.', hp: 'Medium HP', speed: 'Medium Speed' },
        heavy:  { color: UI_COLORS.chassisHeavy,  desc: 'Slow but powerful tank. Access to Machine Guns, Heavy Rifles, Rocket Launchers, Plasma, Siege, Chain Gun. Mods: Barrier, Repair, Rage, Siege Mode, Anchor.', hp: 'High HP', speed: 'Low Speed' }
    };

    html += '<div style="display:flex;gap:16px;max-width:800px;width:100%;">';
    for (const ch of ['light', 'medium', 'heavy']) {
        const info = chassisInfo[ch];
        const isSelected = (_selectedNewChassis === ch);
        html += `<button onclick="_highlightChassis('${ch}')" class="tw-btn chassis-card${isSelected ? ' active' : ''}" style="--card-color:${info.color};">`;
        html += `<div style="font-size:18px;letter-spacing:4px;color:${info.color};margin-bottom:8px;">${ch.toUpperCase()}</div>`;
        html += `<div style="font-size:10px;color:${info.color};opacity:0.7;margin-bottom:8px;">${info.hp} // ${info.speed}</div>`;
        html += `<div style="font-size:9px;color:${UI_COLORS.text50};line-height:1.5;">${info.desc}</div>`;
        html += '</button>';
    }
    html += '</div>';

    // Start Campaign button — only visible when a chassis is selected
    html += '<div style="display:flex;gap:16px;margin-top:24px;align-items:center;">';
    if (_selectedNewChassis) {
        const selInfo = chassisInfo[_selectedNewChassis];
        html += `<button onclick="_startNewCampaignWithChassis('${_selectedNewChassis}')" class="tw-btn tw-btn--gold">START CAMPAIGN</button>`;
    }
    html += `<button onclick="_cancelNewCampaign()" class="tw-btn tw-btn--danger">BACK</button>`;
    html += '</div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
}

/** Highlight a chassis without starting the campaign. */
function _highlightChassis(chassisType) {
    _selectedNewChassis = chassisType;
    _renderChassisSelect();
}

/** Start campaign with the selected chassis. */
function _startNewCampaignWithChassis(chassisType) {
    loadout.chassis = chassisType;
    _applyStarterLoadout(chassisType);
    resetInventory();
    _round = 1;
    _totalKills = 0;
    _perksEarned = 0;
    // Lock chassis choice in campaign state
    _campaignState.chassis = chassisType;
    // Save the chassis choice
    saveCampaignProgress();
    if (typeof saveCampaignState === 'function') saveCampaignState();
    // Hide chassis select, show mission select
    const overlay = document.getElementById('mission-select-overlay');
    if (overlay) overlay.style.display = 'none';
    _gameMode = 'campaign';
    if (typeof applyChassisUpgrades === 'function') applyChassisUpgrades();
    if (typeof refreshShopStock === 'function') refreshShopStock();
    if (typeof showMissionSelect === 'function') showMissionSelect();
}

/** Cancel new campaign chassis selection — return to main menu. */
function _cancelNewCampaign() {
    const overlay = document.getElementById('mission-select-overlay');
    if (overlay) { overlay.style.display = 'none'; delete overlay.dataset.mode; }
    const menu = document.getElementById('main-menu');
    if (menu) { menu.style.display = 'flex'; menu.style.opacity = '1'; }
    hideCampaignSubMenu();
    _updateMainMenuStats();
}

// ═══════════ STATS AND INVENTORY UI ═══════════

function populateInventory() {
    // Update header count
    const hdr = document.getElementById('inv-header-count');
    if (hdr) hdr.textContent = `${_inventory.length} / ${INVENTORY_MAX} items  |  ${_scrap} scrap`;

    // ── Mech Silhouette with positioned equip slots ──
    const silEl = document.getElementById('inv-mech-silhouette');
    if (silEl) {
        const ch = loadout?.chassis || 'medium';
        const mechColor = typeof loadout !== 'undefined' ? loadout.color : 0x00ff88;
        const hexColor = typeof mechColor === 'number' ? '#' + mechColor.toString(16).padStart(6,'0') : mechColor;

        // Slot positions: left column and right column flanking the mech
        // Left (top→bottom): CPU, ARMS, L ARM, SHIELD
        // Right (top→bottom): AUGMENT, ARMOR, R ARM, LEGS
        // Positioned close to center using calc() — just outside the mech image
        const _slotL = 'calc(50% - 244px)';   // right edge of left column (shifted out by half slot width)
        const _slotR = 'calc(50% + 149px)';   // left edge of right column (shifted out by half slot width)
        const slotPositions = {
            mod:     { top: '10px',  left: _slotL,  label: 'CPU' },
            arms:    { top: '105px', left: _slotL,  label: 'ARMS' },
            L:       { top: '200px', left: _slotL,  label: 'L ARM' },
            shield:  { top: '295px', left: _slotL,  label: 'SHIELD' },
            augment: { top: '10px',  left: _slotR,  label: 'AUGMENT' },
            chest:   { top: '105px', left: _slotR,  label: 'ARMOR' },
            R:       { top: '200px', left: _slotR,  label: 'R ARM' },
            legs:    { top: '295px', left: _slotR,  label: 'LEGS' },
        };

        let html = '';
        // Use the actual mech PNG as the silhouette background
        html += `<div style="position:relative;width:100%;height:385px;">`;
        const mechImgSrc = `assets/${ch}-mech.png`;
        const hexStr = typeof mechColor === 'number' ? mechColor.toString(16).padStart(6,'0') : '00ff88';
        html += `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;opacity:0.25;">`;
        html += `<img src="${mechImgSrc}" style="height:340px;object-fit:contain;filter:drop-shadow(0 0 20px #${hexStr}66);" />`;
        html += `</div>`;

        // Equipment slots positioned over the silhouette
        Object.entries(slotPositions).forEach(([key, pos]) => {
            const item = _equipped[key];
            const rd = item ? RARITY_DEFS[item.rarity] : null;
            const nameColor = rd ? rd.colorStr : UI_COLORS.text35;
            const itemName = item ? (item.isUnique ? '★ ' + (item.shortName || item.name) : (item.shortName || item.name)) : '— empty —';
            const borderColor = rd ? rd.colorStr + '55' : UI_COLORS.gold20;
            let posStyle = `top:${pos.top};`;
            if (pos.left) posStyle += `left:${pos.left};`;
            if (pos.right) posStyle += `right:${pos.right};`;
            if (pos.transform) posStyle += `transform:${pos.transform};`;

            html += `<div class="mech-equip-slot" style="${posStyle}border-color:${borderColor};"
                data-slot="${key}" ${item ? 'draggable="true"' : ''}
                ondragstart="_onEquipDragStart(event)" ondragover="_onSlotDragOver(event)" ondragleave="_onSlotDragLeave(event)" ondrop="_onSlotDrop(event)"
                onclick="_showItemDetail('equipped','${key}')">
                <div class="slot-label">${pos.label}</div>
                <div class="slot-item" style="color:${nameColor};">${itemName}</div>
            </div>`;
        });

        html += `</div>`; // end relative container
        silEl.innerHTML = html;
    }

    // ── Backpack Grid ──
    const bpEl = document.getElementById('inv-backpack');
    if (bpEl) {
        bpEl.innerHTML = '';
        // Make backpack a drop target for unequipping
        bpEl.ondragover = (ev) => { ev.preventDefault(); bpEl.style.background = UI_COLORS.green04; };
        bpEl.ondragleave = () => { bpEl.style.background = ''; };
        bpEl.ondrop = (ev) => {
            ev.preventDefault();
            bpEl.style.background = '';
            const data = ev.dataTransfer.getData('text/plain');
            if (data.startsWith('equipped:')) {
                const slotKey = data.split(':')[1];
                _unequipItem(slotKey);
            }
        };

        if (_inventory.length === 0) {
            bpEl.innerHTML = `<span style="font-size:12px;color:${UI_COLORS.text35};letter-spacing:1px;">No items in backpack</span>`;
        } else {
            _inventory.forEach((item, idx) => {
                const rd = RARITY_DEFS[item.rarity];
                const cell = document.createElement('div');
                cell.className = 'bp-cell';
                const _uBorder = item.isUnique ? `border:2px solid ${rd.colorStr};box-shadow:0 0 6px ${rd.colorStr}44;` : `border:1px solid ${rd.colorStr}44;`;
                cell.style.cssText = `width:88px;height:76px;${_uBorder}border-radius:5px;background:${UI_COLORS.bgDark30};display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;`;
                cell.draggable = true;
                cell.dataset.invIdx = idx;
                cell.title = `${item.name}\n${item.affixes.map(a => a.label).join('\n')}${item.uniqueLabel ? '\n★ ' + item.uniqueLabel : ''}`;
                const _starBadge = item.isUnique ? `<div style="position:absolute;top:1px;right:3px;font-size:9px;color:${UI_COLORS.gold};">★</div>` : '';
                cell.innerHTML = `${_starBadge}<div style="font-size:9px;letter-spacing:0.5px;color:${rd.colorStr};text-align:center;line-height:1.3;overflow:hidden;max-width:80px;">${item.shortName}</div>
                    <div style="width:7px;height:7px;border-radius:50%;background:${rd.colorStr};margin-top:4px;opacity:0.7;"></div>`;
                cell.addEventListener('mouseover', () => { cell.style.borderColor = rd.colorStr + 'aa'; cell.style.boxShadow = `0 0 8px ${rd.colorStr}33`; });
                cell.addEventListener('mouseout', () => { cell.style.borderColor = rd.colorStr + '44'; cell.style.boxShadow = 'none'; });
                cell.addEventListener('click', () => _showItemDetail('backpack', idx));
                // Drag events
                cell.addEventListener('dragstart', (ev) => {
                    ev.dataTransfer.setData('text/plain', 'backpack:' + idx);
                    cell.classList.add('dragging');
                });
                cell.addEventListener('dragend', () => cell.classList.remove('dragging'));
                bpEl.appendChild(cell);
            });
        }
    }

    // Hide detail panel initially
    const dp = document.getElementById('inv-detail-panel');
    if (dp) dp.style.display = 'none';
}

function _showItemDetail(source, key) {
    const dp = document.getElementById('inv-detail-panel');
    const dc = document.getElementById('inv-detail-content');
    if (!dp || !dc) return;

    const item = source === 'equipped' ? _equipped[key] : _inventory[key];
    if (!item) return;

    const rd = RARITY_DEFS[item.rarity];
    const _uniqueBadge = item.isUnique ? `<span style="font-size:9px;letter-spacing:2px;color:${UI_COLORS.gold};margin-left:10px;background:${UI_COLORS.gold12};padding:2px 6px;border:1px solid ${UI_COLORS.gold30};border-radius:3px;">★ UNIQUE</span>` : '';
    let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">`;
    html += `<div>
        <span style="font-size:16px;letter-spacing:2px;color:${rd.colorStr};text-shadow:0 0 10px ${rd.colorStr}44;">${item.name}</span>${_uniqueBadge}
        <span style="font-size:10px;letter-spacing:1px;color:${UI_COLORS.text40};margin-left:12px;">iLvl ${item.level}</span>
    </div>`;

    // Action buttons
    html += `<div style="display:flex;gap:8px;">`;
    if (source === 'backpack') {
        const slotKey = _getSlotForItem(item);
        if (slotKey || item.baseType === 'weapon') {
            html += `<button onclick="_equipItem(${key})" class="tw-btn tw-btn--green tw-btn--sm">EQUIP</button>`;
        }
        html += `<button onclick="_scrapItem(${key})" class="tw-btn tw-btn--danger tw-btn--sm">SCRAP (+${rd.scrapValue})</button>`;
    } else if (source === 'equipped') {
        html += `<button onclick="_unequipItem('${key}')" class="tw-btn tw-btn--gold tw-btn--sm">UNEQUIP</button>`;
    }
    html += `</div></div>`;

    // Base stats
    html += `<div style="border-top:1px solid ${UI_COLORS.gold10};padding-top:10px;">`;
    if (item.baseStats) {
        const statNames = { dmg:'Damage', reload:'Reload (ms)', pellets:'Pellets', speed:'Projectile Speed',
            range:'Range', radius:'Blast Radius', burst:'Burst Count', coreHP:'Core HP', armHP:'Arm HP',
            legHP:'Leg HP', dr:'Damage Reduction', shieldHP:'Shield HP', shieldRegen:'Shield Regen %',
            absorbPct:'Shield Absorb %', speedPct:'Move Speed %', reloadPct:'Reload Speed %',
            dmgPct:'Damage %', modCdPct:'Mod Cooldown %', modEffPct:'Mod Effectiveness %',
            dodgePct:'Dodge %', accuracy:'Accuracy', lootMult:'Loot Quality %' };
        Object.entries(item.baseStats).forEach(([k, v]) => {
            const label = statNames[k] || k;
            html += `<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;">
                <span style="color:${UI_COLORS.text60};">${label}</span>
                <span style="color:${UI_COLORS.text90};">${typeof v === 'number' ? (v < 1 && v > 0 ? Math.round(v*100)+'%' : v) : v}</span>
            </div>`;
        });
    }
    html += `</div>`;

    // Affixes
    if (item.affixes.length > 0) {
        html += `<div style="border-top:1px solid ${UI_COLORS.gold10};margin-top:8px;padding-top:8px;">`;
        item.affixes.forEach(a => {
            html += `<div style="font-size:12px;color:#44ff88;margin-bottom:3px;letter-spacing:1px;">● ${a.label}</div>`;
        });
        html += `</div>`;
    }

    // System ability (hybrid system items)
    if (item.systemKey) {
        const _sysDesc = (typeof SLOT_DESCS !== 'undefined' && SLOT_DESCS[item.systemKey]) ? SLOT_DESCS[item.systemKey] : null;
        const _sysTypeLabel = { shield_system:'SHIELD SYSTEM', mod_system:'CPU MODULE', leg_system:'LEG SYSTEM', aug_system:'AUGMENT SYSTEM' };
        html += `<div style="border-top:2px solid ${UI_COLORS.cyan20};margin-top:10px;padding-top:10px;background:${UI_COLORS.cyanSurface03};border-radius:4px;padding:10px;">`;
        html += `<div style="font-size:9px;letter-spacing:3px;color:${UI_COLORS.cyan50};margin-bottom:6px;">${_sysTypeLabel[item.baseType] || 'SYSTEM'}</div>`;
        html += `<div style="font-size:12px;color:${UI_COLORS.teal};letter-spacing:1px;margin-bottom:4px;">Activates: ${item.systemKey.replace(/_/g,' ').toUpperCase()}</div>`;
        if (_sysDesc) {
            html += `<div style="font-size:11px;color:${UI_COLORS.text65};line-height:1.4;">${_sysDesc.desc}</div>`;
        }
        html += `</div>`;
    }

    // Unique effect (boss items)
    if (item.isUnique && item.uniqueLabel) {
        html += `<div style="border-top:2px solid ${UI_COLORS.gold30};margin-top:10px;padding-top:10px;background:${UI_COLORS.gold04};border-radius:4px;padding:10px;">`;
        html += `<div style="font-size:9px;letter-spacing:3px;color:${UI_COLORS.goldGlow};margin-bottom:6px;">★ UNIQUE EFFECT</div>`;
        html += `<div style="font-size:12px;color:${UI_COLORS.gold};letter-spacing:1px;margin-bottom:4px;text-shadow:0 0 8px ${UI_COLORS.gold30};">${item.uniqueLabel}</div>`;
        if (item.uniqueDesc) {
            html += `<div style="font-size:11px;color:${UI_COLORS.text65};line-height:1.4;">${item.uniqueDesc}</div>`;
        }
        html += `</div>`;
    }

    // ── Item Comparison (backpack item vs equipped) ──
    if (source === 'backpack') html += _buildItemComparisonHTML(item);

    dc.innerHTML = html;
    dp.style.display = 'block';
}

function _getSlotForItem(item) {
    if (item.baseType === 'weapon') return null; // weapon needs L or R choice
    const map = {
        armor:'chest', arms:'arms', legs:'legs', shield:'shield', mod:'mod', augment:'augment',
        // System items map to the same equip slots
        shield_system:'shield', mod_system:'mod', leg_system:'legs', aug_system:'augment'
    };
    return map[item.baseType] || null;
}

function _equipItem(invIdx) {
    const item = _inventory[invIdx];
    if (!item) return;

    if (item.baseType === 'weapon') {
        // Show arm picker for weapons
        _showArmPicker(invIdx);
        return;
    }

    const slotKey = _getSlotForItem(item);
    if (!slotKey) return;
    _equipItemToSlot(invIdx, slotKey);
}

function _equipItemToSlot(invIdx, slotKey) {
    const item = _inventory[invIdx];
    if (!item) return;

    // Swap: if slot occupied, move old item to inventory
    const old = _equipped[slotKey];
    _equipped[slotKey] = item;
    _inventory.splice(invIdx, 1);
    if (old) _inventory.push(old);

    if (typeof loadout !== 'undefined') {
        // Weapons → loadout.L / loadout.R
        if (item.baseType === 'weapon') {
            loadout[slotKey] = item.subType;
        }
        // System items → activate the actual GAME system
        if (item.systemKey) {
            const _sysLoadoutMap = { shield_system:'shld', mod_system:'mod', leg_system:'leg', aug_system:'aug' };
            const loadoutKey = _sysLoadoutMap[item.baseType];
            if (loadoutKey) loadout[loadoutKey] = item.systemKey;
        }
    }

    recalcGearStats();
    saveInventory();
    populateInventory();
    _updateInvCount();
}

function _unequipItem(slotKey) {
    const item = _equipped[slotKey];
    if (!item) return;
    if (_inventory.length >= INVENTORY_MAX) {
        // Inventory full — show feedback so the player knows why nothing happened
        const _sc = GAME?.scene?.scenes[0];
        if (_sc && typeof _showFloatingWarning === 'function') _showFloatingWarning(_sc, 'INVENTORY FULL', UI_COLORS.redAlt);
        return;
    }
    _inventory.push(item);
    _equipped[slotKey] = null;

    if (typeof loadout !== 'undefined') {
        // Weapons → clear from loadout
        if (item.baseType === 'weapon') {
            loadout[slotKey] = 'none';
        }
        // System items → revert to 'none' (or starter default)
        if (item.systemKey) {
            const _sysLoadoutMap = { shield_system:'shld', mod_system:'mod', leg_system:'leg', aug_system:'aug' };
            const loadoutKey = _sysLoadoutMap[item.baseType];
            if (loadoutKey) {
                // Revert to starter loadout default for this slot
                const starter = (typeof STARTER_LOADOUTS !== 'undefined') ? STARTER_LOADOUTS[loadout.chassis] : null;
                const _starterKeyMap = { shld:'shld', mod:'mod', leg:'leg', aug:'aug' };
                loadout[loadoutKey] = starter ? (starter[loadoutKey === 'shld' ? 'shld' : loadoutKey] || 'none') : 'none';
            }
        }
    }

    recalcGearStats();
    saveInventory();
    populateInventory();
    _updateInvCount();
}

function _scrapItem(invIdx) {
    const item = _inventory[invIdx];
    if (!item) return;
    const rd = RARITY_DEFS[item.rarity];
    _scrap += rd.scrapValue;
    _inventory.splice(invIdx, 1);
    saveInventory();
    populateInventory();
    _updateInvCount();
}

function _showArmPicker(invIdx) {
    const item = _inventory[invIdx];
    if (!item) return;
    // Remove any existing picker
    const old = document.querySelector('.arm-picker-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.className = 'arm-picker-overlay';
    const box = document.createElement('div');
    box.className = 'arm-picker-box';

    const lItem = _equipped.L;
    const rItem = _equipped.R;
    const lLabel = lItem ? (lItem.shortName || lItem.name) : 'empty';
    const rLabel = rItem ? (rItem.shortName || rItem.name) : 'empty';

    box.innerHTML = `
        <div style="font-size:14px;letter-spacing:3px;color:${UI_COLORS.cyan};margin-bottom:16px;">EQUIP TO WHICH ARM?</div>
        <div style="font-size:11px;color:${UI_COLORS.text60};margin-bottom:16px;letter-spacing:1px;">${item.name}</div>
        <div style="display:flex;gap:12px;justify-content:center;">
            <button class="tw-btn tw-btn--sm arm-picker-btn" id="_arm-pick-L">L ARM<br><span style="font-size:9px;color:${UI_COLORS.text50};">${lLabel}</span></button>
            <button class="tw-btn tw-btn--sm arm-picker-btn" id="_arm-pick-R">R ARM<br><span style="font-size:9px;color:${UI_COLORS.text50};">${rLabel}</span></button>
        </div>
        <div style="margin-top:14px;">
            <button class="tw-btn tw-btn--sm arm-picker-btn arm-picker-btn--cancel" id="_arm-pick-cancel">CANCEL</button>
        </div>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    document.getElementById('_arm-pick-L').onclick = () => { overlay.remove(); _equipItemToSlot(invIdx, 'L'); };
    document.getElementById('_arm-pick-R').onclick = () => { overlay.remove(); _equipItemToSlot(invIdx, 'R'); };
    document.getElementById('_arm-pick-cancel').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

function _updateInvCount() {
    const el = document.getElementById('inv-count');
    if (el) el.textContent = `${_inventory.length}/${INVENTORY_MAX}`;
}

function _statRow(label, value, colorClass='') {
    return `<div class="stats-row"><span class="stats-label">${label}</span><span class="stats-value ${colorClass}">${value}</span></div>`;
}

function _hpBar(label, hp, max, color) {
    const pct = max > 0 ? Math.round(hp/max*100) : 0;
    const barColor = pct > 60 ? UI_COLORS.greenAccent : pct > 30 ? UI_COLORS.yellow : UI_COLORS.redCritical;
    return `<div class="stats-hp-bar">
        <span class="stats-label" style="min-width:70px">${label}</span>
        <div class="stats-hp-track"><div class="stats-hp-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <span class="stats-value" style="font-size:13px;min-width:70px;text-align:right;color:${barColor}">${Math.round(hp)} / ${Math.round(max)}</span>
    </div>`;
}

function _hpBarBoosted(label, hp, max, baseMax) {
    const pct = max > 0 ? Math.round(hp/max*100) : 0;
    const barColor = pct > 60 ? UI_COLORS.greenAccent : pct > 30 ? UI_COLORS.yellow : UI_COLORS.redCritical;
    const bonus = Math.round(max - baseMax);
    const bonusData = bonus > 0 ? ` data-bonus="+${bonus} from perks/gear"` : '';
    const bonusCls = bonus > 0 ? ' stat-has-bonus' : '';
    return `<div class="stats-hp-bar">
        <span class="stats-label" style="min-width:70px">${label}</span>
        <div class="stats-hp-track"><div class="stats-hp-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <span class="stats-value${bonusCls}" style="min-width:80px;text-align:right;color:${barColor}"${bonusData}>${Math.round(hp)} / ${Math.round(max)}</span>
    </div>`;
}

function _perkBonus(value, base) {
    const diff = Math.round(value - base);
    if (diff <= 0) return String(Math.round(value));
    return `<span class="stat-has-bonus" data-bonus="+${diff} from perks">${Math.round(value)}</span>`;
}

function _perkReduction(value, base) {
    const diff = Math.round(base - value);
    if (diff <= 0) return String(Math.round(value));
    return `<span class="stat-has-bonus" data-bonus="−${diff} from perks">${Math.round(value)}</span>`;
}

// ── Stats panel renderers ──────────────────────────────────────────

function _renderChassisPanel() {
    const ch = loadout.chassis;
    const chassisData = CHASSIS[ch];
    // ── CHASSIS & HP ──────────────────────────────────────────
    const _inGame = !!(player?.comp); // true when actually deployed in-game
    const baseShield = chassisData?.max || 75;
    let chassisHtml = '';
    chassisHtml += _statRow('Chassis', ch.toUpperCase(), ch==='light'?'green':ch==='medium'?'yellow':'orange');
    // Shield: show base vs current max, tooltip for gear/perk breakdown
    const gearShieldHP = (_gearState?.shieldHP || 0);
    const _curShield = _inGame ? Math.round(player.shield||0) : baseShield;
    const _maxShield = _inGame ? Math.round(player.maxShield||0) : baseShield;
    const shieldBonus = Math.round(_maxShield - baseShield);
    const perkShieldBonus = shieldBonus - gearShieldHP;
    let shieldTip = '';
    if (gearShieldHP > 0) shieldTip += `+${gearShieldHP} gear`;
    if (perkShieldBonus > 0) shieldTip += (shieldTip ? ', ' : '') + `+${perkShieldBonus} perks`;
    const shieldBonusData = shieldTip ? ` data-bonus="${shieldTip}"` : '';
    const shieldBonusCls = shieldTip ? ' stat-has-bonus' : '';
    chassisHtml += `<div class="stats-row"><span class="stats-label">Shield</span><span class="stats-value purple${shieldBonusCls}"${shieldBonusData}>${_curShield} / ${_maxShield}</span></div>`;
    chassisHtml += `<div style="margin-top:12px;margin-bottom:6px;font-size:12px;letter-spacing:2px;color:${UI_COLORS.cyan35};">HULL INTEGRITY</div>`;
    {
    const baseHP = { core: chassisData?.coreHP||212, lArm: chassisData?.armHP||120, rArm: chassisData?.armHP||120, legs: chassisData?.legHP||152 };
    if (_inGame) {
        chassisHtml += _hpBarBoosted('Core',  player.comp.core.hp,  player.comp.core.max,  baseHP.core);
        chassisHtml += _hpBarBoosted('L.Arm', player.comp.lArm.hp,  player.comp.lArm.max,  baseHP.lArm);
        chassisHtml += _hpBarBoosted('R.Arm', player.comp.rArm.hp,  player.comp.rArm.max,  baseHP.rArm);
        chassisHtml += _hpBarBoosted('Legs',  player.comp.legs.hp,  player.comp.legs.max,  baseHP.legs);
        const totalHp  = Object.values(player.comp).reduce((s,c)=>s+c.hp,0);
        const totalMax = Object.values(player.comp).reduce((s,c)=>s+c.max,0);
        const totalBase = Object.values(baseHP).reduce((s,v)=>s+v,0);
        const totalBonusHp = Math.round(totalMax - totalBase);
        const totalBonusData = totalBonusHp > 0 ? ` data-bonus="+${totalBonusHp} from perks/gear"` : '';
        const totalBonusCls = totalBonusHp > 0 ? ' stat-has-bonus' : '';
        chassisHtml += `<div style="border-top:1px solid ${UI_COLORS.cyan12};margin-top:8px;padding-top:8px;"><div class="stats-row"><span class="stats-label">Total HP</span><span class="stats-value${totalBonusCls}"${totalBonusData}>${Math.round(totalHp)} / ${Math.round(totalMax)}</span></div></div>`;
    } else {
        // Not in-game: show base HP values at full
        chassisHtml += _hpBarBoosted('Core',  baseHP.core,  baseHP.core,  baseHP.core);
        chassisHtml += _hpBarBoosted('L.Arm', baseHP.lArm,  baseHP.lArm,  baseHP.lArm);
        chassisHtml += _hpBarBoosted('R.Arm', baseHP.rArm,  baseHP.rArm,  baseHP.rArm);
        chassisHtml += _hpBarBoosted('Legs',  baseHP.legs,  baseHP.legs,  baseHP.legs);
        const totalBase = Object.values(baseHP).reduce((s,v)=>s+v,0);
        chassisHtml += `<div style="border-top:1px solid ${UI_COLORS.cyan12};margin-top:8px;padding-top:8px;"><div class="stats-row"><span class="stats-label">Total HP</span><span class="stats-value">${totalBase} / ${totalBase}</span></div></div>`;
    }
    }
    // ── Chassis traits & arm mode — rendered full-width below the grid ──
    const _chColor = ch === 'light' ? UI_COLORS.chassisLight : ch === 'medium' ? UI_COLORS.chassisMedium : UI_COLORS.chassisHeavy;
    const _cTraits = ch === 'light'
    ? [['Dual-Fire','Both arms fire simultaneously when matching weapons equipped (−15% dmg per arm)'],
       ['Reload Speed','+20% passive reload speed on all weapons'],
       ['Fragile Arms','Arms have 30% less base HP than Medium chassis']]
    : ch === 'medium'
    ? [['Mod Cooldowns','All mod cooldowns reduced by −15%'],
       ['Kill Reduction','Each kill shaves 0.5s off active mod cooldowns'],
       ['Shield Absorb','Shield absorbs 60% of incoming damage (vs 50%)']]
    : [['Passive DR','15% damage reduction at all times'],
       ['Restrictions','Cannot equip JUMP mod or AFTERLEG legs'],
       ['Attrition','Built for sustained punishment — high HP across all parts']];

    const _sIs2H   = WEAPONS[loadout?.L]?.twoHanded;
    const _sLEmpty = !loadout?.L || loadout.L === 'none';
    const _sREmpty = !loadout?.R || loadout.R === 'none';
    const _sBrace  = !_sIs2H && (_sLEmpty !== _sREmpty);
    const _sDualW  = !_sIs2H && loadout?.L !== 'none' && loadout?.R !== 'none' && loadout?.L === loadout?.R;
    const _sBothDiff = !_sIs2H && !_sLEmpty && !_sREmpty && !_sDualW;
    const _armMode = _sIs2H   ? ['TWO-HANDED',  'Both arms locked to same weapon. Weight counted once.', UI_COLORS.chassisHeavy]
               : _sBrace  ? ['BRACE MODE',   '+25% damage and +15% reload when only one arm is equipped.', UI_COLORS.chassisLight]
               : _sDualW  ? ['DUAL WIELD',   'Same weapon in both arms. Left-click fires both simultaneously.', UI_COLORS.chassisMedium]
               : _sBothDiff ? ['INDEPENDENT', 'Different weapons in each arm. Left-click fires L arm, right-click fires R arm.', UI_COLORS.rarityCommon]
               : null;

    // Build the full-width traits+armmode block separately
    let traitHtml = '';
    traitHtml += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">`;
    // Left col: chassis traits
    traitHtml += `<div>`;
    traitHtml += `<div style="font-size:10px;letter-spacing:3px;color:${UI_COLORS.cyan45};margin-bottom:10px;border-bottom:1px solid ${UI_COLORS.cyan10};padding-bottom:6px;">CHASSIS TRAITS</div>`;
    _cTraits.forEach(([tLabel, tDesc]) => {
    traitHtml += `<div style="margin-bottom:10px;">
        <div style="font-size:11px;letter-spacing:1.5px;color:${_chColor};margin-bottom:3px;">${tLabel}</div>
        <div style="font-size:12px;color:${UI_COLORS.text75};line-height:1.5;">${tDesc}</div>
    </div>`;
    });
    traitHtml += `</div>`;
    // Right col: arm mode + additional context
    traitHtml += `<div>`;
    traitHtml += `<div style="font-size:10px;letter-spacing:3px;color:${UI_COLORS.cyan45};margin-bottom:10px;border-bottom:1px solid ${UI_COLORS.cyan10};padding-bottom:6px;">ARM CONFIGURATION</div>`;
    if (_armMode) {
    traitHtml += `<div style="margin-bottom:10px;">
        <div style="font-size:11px;letter-spacing:1.5px;color:${_armMode[2]};margin-bottom:3px;">${_armMode[0]}</div>
        <div style="font-size:12px;color:${UI_COLORS.text75};line-height:1.5;">${_armMode[1]}</div>
    </div>`;
    }
    // Show L and R arm weapon names for quick reference
    const _lName = WEAPONS[loadout?.L]?.name || loadout?.L || '—';
    const _rName = WEAPONS[loadout?.R]?.name || loadout?.R || '—';
    traitHtml += `<div style="margin-top:6px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;">
        <span style="color:${UI_COLORS.text50};letter-spacing:1px;">L ARM</span>
        <span style="color:${UI_COLORS.rarityCommon};letter-spacing:1px;">${_lName !== 'none' && _lName !== '—' ? _lName : '—'}</span>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:12px;">
        <span style="color:${UI_COLORS.text50};letter-spacing:1px;">R ARM</span>
        <span style="color:${UI_COLORS.rarityCommon};letter-spacing:1px;">${_rName !== 'none' && _rName !== '—' ? _rName : '—'}</span>
    </div>
    </div>`;
    traitHtml += `</div>`;
    traitHtml += `</div>`;

    document.getElementById('stat-chassis-info').innerHTML = chassisHtml;
    document.getElementById('stat-traits-info').innerHTML  = traitHtml;
}

function _renderWeaponPanel() {
    // ── WEAPONS & DPS ─────────────────────────────────────────
    let wHtml = '';
    const sides = [['L', loadout.L], ['R', loadout.R], ['CORE', loadout.mod]];
    const _gDmgFlat = (_gearState?.dmgFlat || 0);
    const _gDmgPct  = (_gearState?.dmgPct || 0);
    const _gReloadPct = (_gearState?.reloadPct || 0);
    sides.forEach(([side, key]) => {
    if (!key || key === 'none') return;
    const w = WEAPONS[key];
    if (!w) return;
    wHtml += `<div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid ${UI_COLORS.cyan10};">`;
    wHtml += `<div style="font-size:13px;letter-spacing:2px;color:${UI_COLORS.cyan70};margin-bottom:8px;">${side}: ${w.name}</div>`;
    if (w.dmg) {
        const baseDmg  = w.dmg;
        const perkDmg  = Math.round(baseDmg * (_perkState.dmgMult||1));
        const effDmg   = Math.round((baseDmg + _gDmgFlat) * (_perkState.dmgMult||1) * (1 + _gDmgPct/100));
        const baseRld  = w.reload || 0;
        const perkRld  = Math.round(baseRld * (_perkState.reloadMult||1));
        const effRld   = Math.round(baseRld * (_perkState.reloadMult||1) * (1 - _gReloadPct/100));
        const baseDps  = baseRld > 0 ? Math.round(baseDmg / baseRld * 1000) : 0;
        const effDps   = effRld  > 0 ? Math.round(effDmg  / effRld  * 1000) : 0;
        const dmgSuffix = w.pellets ? ` x ${w.pellets} pellets` : '';
        // Build tooltip strings for gear+perk breakdowns
        const _dmgGearDiff = Math.round(effDmg - perkDmg);
        const _dmgPerkDiff = Math.round(perkDmg - baseDmg);
        let dmgTip = '';
        if (_dmgPerkDiff > 0) dmgTip += `+${_dmgPerkDiff} perks`;
        if (_dmgGearDiff > 0) dmgTip += (dmgTip ? ', ' : '') + `+${_dmgGearDiff} gear`;
        const dmgBonusData = dmgTip ? ` data-bonus="${dmgTip}"` : '';
        const dmgBonusCls = dmgTip ? ' stat-has-bonus' : '';
        const _rldGearDiff = Math.round(perkRld - effRld);
        const _rldPerkDiff = Math.round(baseRld - perkRld);
        let rldTip = '';
        if (_rldPerkDiff > 0) rldTip += `-${_rldPerkDiff} perks`;
        if (_rldGearDiff > 0) rldTip += (rldTip ? ', ' : '') + `-${_rldGearDiff} gear`;
        const rldBonusData = rldTip ? ` data-bonus="${rldTip}"` : '';
        const rldBonusCls = rldTip ? ' stat-has-bonus' : '';
        wHtml += `<div class="stats-row"><span class="stats-label">Damage/Shot</span><span class="stats-value${dmgBonusCls}"${dmgBonusData}>${Math.round(effDmg)}${dmgSuffix}</span></div>`;
        wHtml += `<div class="stats-row"><span class="stats-label">Reload (ms)</span><span class="stats-value ${effRld < 500?'green':effRld<1500?'yellow':'orange'}${rldBonusCls}"${rldBonusData}>${Math.round(effRld)}</span></div>`;
        const dpsTip = effDps > baseDps ? `+${effDps - baseDps} from perks/gear` : '';
        const dpsBonusData = dpsTip ? ` data-bonus="${dpsTip}"` : '';
        const dpsBonusCls = dpsTip ? ' stat-has-bonus' : '';
        wHtml += `<div class="stats-row"><span class="stats-label">DPS (est.)</span><span class="stats-value ${effDps>200?'green':effDps>80?'yellow':'orange'}${dpsBonusCls}"${dpsBonusData}>${Math.round(effDps)}</span></div>`;
    }
    if (w.radius) {
        const effRad = Math.round(w.radius * (_perkState.blastMult||1));
        const radDiff = effRad - w.radius;
        const radData = radDiff > 0 ? ` data-bonus="+${radDiff} from perks"` : '';
        const radCls = radDiff > 0 ? ' stat-has-bonus' : '';
        wHtml += `<div class="stats-row"><span class="stats-label">Blast Radius</span><span class="stats-value${radCls}"${radData}>${effRad}</span></div>`;
    }
    if (w.cooldown) wHtml += _statRow('Mod Cooldown', w.cooldown + 'ms');
    wHtml += '</div>';
    });
    if (!wHtml) wHtml = '<div class="stats-label" style="opacity:0.4;font-size:13px;">No weapons armed</div>';
    document.getElementById('stat-weapons-info').innerHTML = wHtml;
}

function _renderMobilityPanel() {
    const chassisData = CHASSIS[loadout.chassis];
    const _inGame = !!(player?.comp); // true when actually deployed in-game
    // ── MOBILITY & SHIELD ─────────────────────────────────────
    let mobHtml = '';
    const baseSpd = chassisData?.spd || 200;
    const perkSpd = Math.round(baseSpd * (_perkState.speedMult||1));
    const gearSpdBonus = (_gearState?.speedPct || 0);
    const effSpd  = Math.round(perkSpd * (1 + gearSpdBonus/100));
    const legsOk  = _inGame ? (player?.comp?.legs?.hp > 0) : true;
    // Helper: build tooltip string from perk + gear contributions
    const _bonusTip = (perkVal, gearVal, perkLabel='perks', gearLabel='gear') => {
    let tip = '';
    if (perkVal > 0) tip += `+${perkVal} ${perkLabel}`;
    if (gearVal > 0) tip += (tip ? ', ' : '') + `+${gearVal} ${gearLabel}`;
    return tip;
    };
    const _bonusCls = (tip) => tip ? ' stat-has-bonus' : '';
    const _bonusData = (tip) => tip ? ` data-bonus="${tip}"` : '';
    let spdTip = '';
    const spdPerkDiff = perkSpd - baseSpd;
    const spdGearDiff = effSpd - perkSpd;
    if (spdPerkDiff > 0) spdTip += `+${spdPerkDiff} perks`;
    if (spdGearDiff > 0) spdTip += (spdTip ? ', ' : '') + `+${spdGearDiff} gear`;
    mobHtml += `<div class="stats-row"><span class="stats-label">Speed</span><span class="stats-value ${effSpd>baseSpd?'green':''}${_bonusCls(spdTip)}"${_bonusData(spdTip)}>${effSpd}</span></div>`;
    mobHtml += _statRow('Legs Status', legsOk ? 'OPERATIONAL' : 'DESTROYED', legsOk ? 'green' : 'red');
    if (!legsOk) mobHtml += _statRow('Speed Penalty', '−50%', 'red');
    mobHtml += `<div style="border-top:1px solid ${UI_COLORS.cyan12};margin-top:10px;padding-top:10px;"></div>`;
    const baseRegenRate = 1.0;
    const perkRegenRate = baseRegenRate * (_perkState.shieldRegenMult||1);
    const gearRegenBonus = (_gearState?.shieldRegen || 0);
    const effRegenRate   = perkRegenRate * (1 + gearRegenBonus/100);
    let regenTip = '';
    const regenPerkDiff = Math.round((perkRegenRate - baseRegenRate)*10)/10;
    const regenGearDiff = Math.round((effRegenRate - perkRegenRate)*10)/10;
    if (regenPerkDiff > 0) regenTip += `+${regenPerkDiff} perks`;
    if (regenGearDiff > 0) regenTip += (regenTip ? ', ' : '') + `+${regenGearDiff} gear`;
    mobHtml += `<div class="stats-row"><span class="stats-label">Shield Regen</span><span class="stats-value purple${_bonusCls(regenTip)}"${_bonusData(regenTip)}>${parseFloat(effRegenRate.toFixed(1))}/frame</span></div>`;
    if (_perkState.noShieldRegen) mobHtml += _statRow('Regen Active', 'DISABLED', 'red');
    if (_perkState.immovable) mobHtml += _statRow('Immovable', '3x regen while still', 'purple');
    // Dodge: perk + gear
    const perkDodgePct = Math.round((_perkState.dodgeChance||0) * 100);
    const gearDodgePct = (_gearState?.dodgePct || 0);
    const totalDodge = perkDodgePct + gearDodgePct;
    if (totalDodge > 0) { const _dodgeTip = _bonusTip(perkDodgePct, gearDodgePct); mobHtml += `<div class="stats-row"><span class="stats-label">Dodge Chance</span><span class="stats-value green${_bonusCls(_dodgeTip)}"${_bonusData(_dodgeTip)}>${totalDodge}%</span></div>`; }
    // DR: perk + gear
    const perkDR = Math.round(Math.min(75, (_perkState.fortress||0) * 100));
    const gearDR = (_gearState?.dr || 0);
    const totalDR = Math.min(75, perkDR + gearDR);
    if (totalDR > 0) { const _drTip = _bonusTip(perkDR, gearDR); mobHtml += `<div class="stats-row"><span class="stats-label">Dmg Reduction</span><span class="stats-value green${_bonusCls(_drTip)}"${_bonusData(_drTip)}>${totalDR}%</span></div>`; }
    // Auto-repair: perk + gear
    const perkRepair = _perkState.autoRepair || 0;
    const gearRepair = (_gearState?.autoRepair || 0);
    const totalRepair = perkRepair + gearRepair;
    if (totalRepair > 0) { const _repairTip = _bonusTip(perkRepair, gearRepair); mobHtml += `<div class="stats-row"><span class="stats-label">Auto-Repair</span><span class="stats-value green${_bonusCls(_repairTip)}"${_bonusData(_repairTip)}>${totalRepair} HP/sec</span></div>`; }
    // Crit: perk + gear
    const perkCrit = Math.round((_perkState.critChance||0) * 100);
    const gearCrit = (_gearState?.critChance || 0);
    const totalCrit = perkCrit + gearCrit;
    if (totalCrit > 0) { const _critTip = _bonusTip(perkCrit, gearCrit); mobHtml += `<div class="stats-row"><span class="stats-label">Crit Chance</span><span class="stats-value green${_bonusCls(_critTip)}"${_bonusData(_critTip)}>${totalCrit}%</span></div>`; }
    // Gear-only stats
    const gearModCd = (_gearState?.modCdPct || 0);
    if (gearModCd > 0) mobHtml += `<div class="stats-row"><span class="stats-label">Mod Cooldown</span><span class="stats-value stat-has-bonus" data-bonus="−${gearModCd}% gear">−${gearModCd}%</span></div>`;
    const gearLoot = (_gearState?.lootMult || 0);
    if (gearLoot > 0) mobHtml += `<div class="stats-row"><span class="stats-label">Loot Quality</span><span class="stats-value stat-has-bonus" data-bonus="+${gearLoot}% gear">+${gearLoot}%</span></div>`;
    document.getElementById('stat-mobility-info').innerHTML = mobHtml;
}

function _renderRunStatsPanel() {
    // ── RUN STATS ─────────────────────────────────────────────
    const acc = _shotsFired > 0 ? Math.round(_shotsHit/_shotsFired*100) : 0;
    let runHtml = '';
    runHtml += _statRow('Current Round', _round, 'yellow');
    runHtml += _statRow('Total Kills', _totalKills, 'green');
    runHtml += _statRow('Shots Fired', _shotsFired);
    runHtml += _statRow('Shots Hit', _shotsHit, 'green');
    runHtml += _statRow('Accuracy', acc + '%', acc >= 60 ? 'green' : acc >= 30 ? 'yellow' : 'orange');
    runHtml += _statRow('Damage Dealt', Math.round(_damageDealt), 'orange');
    runHtml += _statRow('Damage Taken', Math.round(_damageTaken), 'red');
    runHtml += _statRow('Perks Earned', _perksEarned, 'purple');
    document.getElementById('stat-run-info').innerHTML = runHtml;
}

function _renderActivePerksPanel() {
    // ── ACTIVE PERKS ──────────────────────────────────────────
    const perksEl = document.getElementById('stat-perks-info');
    perksEl.innerHTML = '';
    if (_pickedPerks.length === 0) {
    perksEl.innerHTML = '<span class="stats-label" style="opacity:0.4;font-size:13px;">No perks selected yet</span>';
    } else {
    // Count and group
    const perkCounts = {};
    _pickedPerks.forEach(k => { perkCounts[k] = (perkCounts[k]||0)+1; });
    Object.entries(perkCounts).forEach(([k, n]) => {
        const p = _perks[k];
        if (!p) return;
        const chip = document.createElement('div');
        chip.className = 'stats-perk-chip';
        chip.style.position = 'relative';
        chip.style.cursor = 'default';
        const catColor = p.cat==='universal' ? UI_COLORS.cyan : p.cat==='light' ? UI_COLORS.chassisLight : p.cat==='medium' ? UI_COLORS.chassisMedium : p.cat==='heavy' ? UI_COLORS.chassisHeavy : UI_COLORS.purple;
        chip.style.borderColor = catColor + '66';
        chip.style.color = catColor;
        if (p.legendary) {
            chip.style.borderColor = UI_COLORS.gold;
            chip.style.background = UI_COLORS.gold10;
            chip.style.color = UI_COLORS.gold;
            chip.style.boxShadow = `0 0 8px ${UI_COLORS.gold25}`;
        }
        chip.title = p.desc; // native tooltip fallback
        const legendBadge = p.legendary ? `<span style="font-size:9px;letter-spacing:1px;color:${UI_COLORS.gold};opacity:0.7;margin-left:6px;">★ LEGENDARY</span>` : '';
        chip.innerHTML = `${p.label}${n>1?` <span style="opacity:0.6">×${n}</span>`:''}${legendBadge}`;
        // Custom tooltip
        const tip = document.createElement('div');
        tip.style.cssText = `display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:rgba(5,10,18,0.97);border:1px solid ${catColor}66;border-radius:6px;padding:8px 12px;font-size:11px;letter-spacing:1px;color:${UI_COLORS.text90};white-space:nowrap;z-index:20000;pointer-events:none;box-shadow:0 0 12px rgba(0,0,0,0.6);`;
        tip.textContent = p.desc;
        chip.appendChild(tip);
        chip.addEventListener('mouseenter', () => tip.style.display = 'block');
        chip.addEventListener('mouseleave', () => tip.style.display = 'none');
        perksEl.appendChild(chip);
    });
    }
}

function _renderGearBonusesPanel() {
    // ── GEAR BONUSES SUMMARY ──────────────────────────────────
    const gearPanel = document.getElementById('stat-gear-panel');
    const gearInfo  = document.getElementById('stat-gear-info');
    if (gearPanel && gearInfo) {
    const gs = typeof _gearState !== 'undefined' ? _gearState : {};
    const hasAnyGear = Object.values(gs).some(v => v > 0);
    if (!hasAnyGear) {
        gearPanel.style.display = 'none';
    } else {
        gearPanel.style.display = 'block';
        const _gsLabels = {
            dmgFlat:'Flat Damage', dmgPct:'Damage %', critChance:'Crit Chance %', critDmg:'Crit Damage %',
            reloadPct:'Reload Speed %', pellets:'Bonus Pellets', splashRadius:'Blast Radius %',
            coreHP:'Core HP', armHP:'Arm HP', legHP:'Leg HP', allHP:'All Part HP',
            dr:'Damage Reduction %', shieldHP:'Shield Capacity', shieldRegen:'Shield Regen %',
            dodgePct:'Dodge Chance %', speedPct:'Move Speed %', modCdPct:'Mod Cooldown %',
            modEffPct:'Mod Effectiveness %', lootMult:'Loot Quality %', autoRepair:'HP/sec Regen',
            absorbPct:'Shield Absorb %'
        };
        // Group into offensive / defensive / utility
        const offKeys = ['dmgFlat','dmgPct','critChance','critDmg','reloadPct','pellets','splashRadius'];
        const defKeys = ['coreHP','armHP','legHP','allHP','dr','shieldHP','shieldRegen','dodgePct','absorbPct'];
        const utilKeys = ['speedPct','modCdPct','modEffPct','lootMult','autoRepair'];
        const _renderGroup = (title, keys) => {
            const active = keys.filter(k => (gs[k] || 0) > 0);
            if (active.length === 0) return '';
            let h = `<div style="font-size:10px;letter-spacing:2px;color:${UI_COLORS.gold40};margin-top:10px;margin-bottom:6px;">${title}</div>`;
            active.forEach(k => {
                const v = gs[k];
                const prefix = ['reloadPct','modCdPct'].includes(k) ? '−' : '+';
                h += `<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:3px;font-size:13px;">
                    <span style="color:${UI_COLORS.text60};">${_gsLabels[k] || k}</span>
                    <span style="color:${UI_COLORS.gold};letter-spacing:1px;">${prefix}${v}</span>
                </div>`;
            });
            return h;
        };
        // Show equipped item names at the top
        const slotLabels = [['L','L Arm'],['R','R Arm'],['chest','Chest'],['arms','Arms'],['legs','Legs'],['shield','Shield'],['mod','Mod'],['augment','Augment']];
        let gHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">';
        slotLabels.forEach(([sk, sl]) => {
            const it = typeof _equipped !== 'undefined' ? _equipped[sk] : null;
            if (!it) return;
            const rd = typeof RARITY_DEFS !== 'undefined' ? RARITY_DEFS[it.rarity] : null;
            const c = rd ? rd.colorStr : '#888';
            gHtml += `<span style="padding:3px 8px;border:1px solid ${c}44;border-radius:3px;font-size:10px;letter-spacing:1px;color:${c};background:${UI_COLORS.bgDark30};">${sl}: ${it.shortName || it.name}</span>`;
        });
        gHtml += '</div>';
        gHtml += _renderGroup('OFFENSIVE', offKeys);
        gHtml += _renderGroup('DEFENSIVE', defKeys);
        gHtml += _renderGroup('UTILITY', utilKeys);
        gearInfo.innerHTML = gHtml;
    }
    }
}

function populateStats() {
    if (typeof _updateCampaignXPBar === 'function') _updateCampaignXPBar();
    _renderChassisPanel();
    _renderWeaponPanel();
    _renderMobilityPanel();
    _renderRunStatsPanel();
    _renderActivePerksPanel();
    _renderGearBonusesPanel();
}

// ═══════════ LEADERBOARD ═══════════

async function showLeaderboard() {
    const overlay = document.getElementById('leaderboard-overlay');
    overlay.style.display = 'block';

    // Show loading spinner while fetching
    document.getElementById('lb-loading').style.display = 'block';
    document.getElementById('lb-table').style.display   = 'none';
    document.getElementById('lb-empty').style.display   = 'none';

    // Load once, use for both the notice and the table
    const scores = await _loadScores();

    // Show last-run notice if a run was just submitted
    const submitPanel = document.getElementById('lb-submit-panel');
    const lastMine = scores.filter(s => s.name === _playerCallsign).sort((a,b) => b.ts - a.ts)[0];
    if (lastMine && Date.now() - lastMine.ts < 60000) {
        submitPanel.style.display = 'block';
        const prev = document.getElementById('lb-run-preview');
        const ch = (lastMine.chassis || '?').toUpperCase();
        prev.textContent = `${lastMine.name}  ·  ${ch}  ·  ROUND ${lastMine.round}  ·  ${lastMine.kills} KILLS  ·  ${lastMine.accuracy}% ACC  ·  ${(lastMine.damage||0).toLocaleString()} DMG`;
    } else {
        submitPanel.style.display = 'none';
    }

    _renderScores(scores);
}

function closeLeaderboard() {
    document.getElementById('leaderboard-overlay').style.display = 'none';
}

async function _loadScores() {
    if (_supabaseEnabled()) {
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=*&order=round.desc,kills.desc,accuracy.desc&limit=${LB_MAX}`,
                { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
            );
            if (res.ok) return await res.json();
        } catch(e) { console.warn('Supabase load failed, using local', e); }
    }
    // Fallback: localStorage
    try {
        const raw = localStorage.getItem(LB_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
}

async function _saveScores(scores) {
    // localStorage always kept as local backup
    try { localStorage.setItem(LB_KEY, JSON.stringify(scores)); } catch(e) {}
}

async function _insertScore(entry) {
    entry = _validateScoreEntry(entry);
    if (_supabaseEnabled()) {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    name:     entry.name,
                    round:    entry.round,
                    kills:    entry.kills,
                    accuracy: entry.accuracy,
                    damage:   entry.damage,
                    chassis:  entry.chassis,
                    ts:       entry.ts
                })
            });
            return; // Supabase handles its own sorting/limiting
        } catch(e) { console.warn('Supabase insert failed, saving locally', e); }
    }
    // Fallback: localStorage
    const scores = await _loadScores();
    scores.push(entry);
    _sortScores(scores);
    await _saveScores(scores.slice(0, LB_MAX));
}

function _sortScores(scores) {
    return scores.sort((a, b) => {
        if (b.round !== a.round) return b.round - a.round;
        if (b.kills !== a.kills) return b.kills - a.kills;
        return b.accuracy - a.accuracy;
    });
}

function _renderScores(scores) {
    const loading = document.getElementById('lb-loading');
    const table   = document.getElementById('lb-table');
    const empty   = document.getElementById('lb-empty');

    loading.style.display = 'none';
    table.style.display   = 'none';
    empty.style.display   = 'none';

    if (!scores || scores.length === 0) {
        empty.style.display = 'block';
        return;
    }

    const sorted = _sortScores([...scores]);
    const chassisColor = { light: UI_COLORS.chassisLight, medium: UI_COLORS.chassisMedium, heavy: UI_COLORS.chassisHeavy };

    // Build rows using DOM elements so fetched string values are never treated as HTML
    const frag = document.createDocumentFragment();

    // Header row (static strings only — innerHTML is safe here)
    const headerDiv = document.createElement('div');
    headerDiv.innerHTML = `
        <div style="display:grid;grid-template-columns:36px 1fr 60px 60px 60px 72px 52px;align-items:center;padding:6px 12px 10px;gap:0 6px;border-bottom:1px solid ${UI_COLORS.hudCyan25};margin-bottom:4px;">
            <span style="color:${UI_COLORS.hudCyan35};font-size:9px;">#</span>
            <span style="color:${UI_COLORS.hudCyan35};font-size:9px;letter-spacing:2px;">CALLSIGN</span>
            <span style="color:${UI_COLORS.hudCyan35};font-size:9px;text-align:right;letter-spacing:1px;">ROUND</span>
            <span style="color:${UI_COLORS.hudCyan35};font-size:9px;text-align:right;letter-spacing:1px;">KILLS</span>
            <span style="color:${UI_COLORS.hudCyan35};font-size:9px;text-align:right;letter-spacing:1px;">ACC</span>
            <span style="color:${UI_COLORS.hudCyan35};font-size:9px;text-align:right;letter-spacing:1px;">DAMAGE</span>
            <span style="color:${UI_COLORS.hudCyan35};font-size:9px;text-align:right;letter-spacing:1px;">CHASSIS</span>
        </div>`;
    frag.appendChild(headerDiv);

    sorted.forEach((e, i) => {
        const rank    = i + 1;
        const medal   = rank === 1 ? '◈' : rank === 2 ? '◇' : rank === 3 ? '◆' : `${rank}.`;
        const rankCol = rank === 1 ? UI_COLORS.rankGold : rank === 2 ? UI_COLORS.rankSilver : rank === 3 ? UI_COLORS.rankBronze : UI_COLORS.hudCyan40;
        const cc      = chassisColor[e.chassis] || '#aaa';
        const bg      = rank <= 3 ? UI_COLORS.hudCyan04 : 'transparent';

        // Coerce numeric fields — never interpolate raw DB values as HTML
        const safeRound    = Math.round(Number(e.round)    || 0);
        const safeKills    = Math.round(Number(e.kills)    || 0);
        const safeAccuracy = Math.round(Number(e.accuracy) || 0);
        const safeDamage   = Math.round(Number(e.damage)   || 0);

        // Sanitize string fields with textContent assignment (not innerHTML)
        const safeName    = _sanitizeCallsign(e.name || 'UNKNOWN');
        const safeChassis = _sanitizeCallsign(e.chassis || '?');

        const row = document.createElement('div');
        row.style.cssText = `display:grid;grid-template-columns:36px 1fr 60px 60px 60px 72px 52px;align-items:center;padding:9px 12px;border-bottom:1px solid ${UI_COLORS.hudCyan08};background:${bg};gap:0 6px;`;

        const cells = [
            { text: medal,                              style: `color:${rankCol};font-size:12px;font-weight:bold;` },
            { text: safeName,                           style: `color:${UI_COLORS.leaderName};font-size:12px;letter-spacing:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;` },
            { text: `R${safeRound}`,                   style: `color:${UI_COLORS.leaderRound};font-size:11px;text-align:right;` },
            { text: `${safeKills}K`,                   style: `color:${UI_COLORS.hudCyan75};font-size:11px;text-align:right;` },
            { text: `${safeAccuracy}%`,                style: `color:${UI_COLORS.hudCyan60};font-size:11px;text-align:right;` },
            { text: safeDamage.toLocaleString(),        style: `color:${UI_COLORS.hudCyan55};font-size:10px;text-align:right;` },
            { text: safeChassis,                        style: `color:${cc};font-size:9px;text-align:right;letter-spacing:1px;opacity:0.8;` },
        ];

        cells.forEach(({ text, style }) => {
            const span = document.createElement('span');
            span.style.cssText = style;
            span.textContent = text;
            row.appendChild(span);
        });

        frag.appendChild(row);
    });

    table.innerHTML = '';
    table.appendChild(frag);
    table.style.display = 'block';
}

function _capturePendingRun() {
    const rawAcc = _shotsFired > 0 ? Math.round((_shotsHit / _shotsFired) * 100) : 0;
    _pendingRun = _validateScoreEntry({
        name:     _playerCallsign || 'ANONYMOUS',
        round:    _round,
        kills:    _totalKills,
        accuracy: rawAcc,
        damage:   _damageDealt,
        chassis:  loadout.chassis || 'unknown',
        ts:       Date.now(),
    });
    // Auto-submit immediately — no manual step needed
    _autoSubmitRun(_pendingRun);
}

async function _autoSubmitRun(entry) {
    try {
        await _insertScore(entry);
        _pendingRun = null;
    } catch(e) { console.error('Auto-submit failed', e); }
}

// ── Cloud status toast ────────────────────────────────────────────

function _showCloudStatusToast(msg, isError) {
    let toast = document.getElementById('tw-cloud-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'tw-cloud-toast';
        toast.style.cssText = `position:fixed;top:16px;right:16px;z-index:99990;font-family:${UI_COLORS.fontMono};font-size:10px;letter-spacing:2px;padding:6px 12px;border-radius:4px;pointer-events:none;transition:opacity 0.4s ease;opacity:0;`;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = isError ? UI_COLORS.toastErrorBg : UI_COLORS.toastSuccessBg;
    toast.style.border = isError ? `1px solid ${UI_COLORS.toastErrorBd}` : `1px solid ${UI_COLORS.toastSuccessBd}`;
    toast.style.color  = isError ? UI_COLORS.toastErrorText : UI_COLORS.tealAlt;
    toast.style.opacity = '1';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2400);
}

// ── Score validation and submission ──────────────────────────────

function _supabaseEnabled() {
    return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;
}

/** Clamp and type-coerce all fields in a score entry before submission. */
function _validateScoreEntry(entry) {
    return {
        name:     _sanitizeCallsign(entry.name || 'ANONYMOUS'),
        round:    Math.min(Math.max(Math.round(Number(entry.round)    || 0), 0), SCORE_MAX_ROUND),
        kills:    Math.min(Math.max(Math.round(Number(entry.kills)    || 0), 0), SCORE_MAX_KILLS),
        accuracy: Math.min(Math.max(Math.round(Number(entry.accuracy) || 0), 0), 100),
        damage:   Math.min(Math.max(Math.round(Number(entry.damage)   || 0), 0), SCORE_MAX_DAMAGE),
        chassis:  ['light', 'medium', 'heavy'].includes(entry.chassis) ? entry.chassis : 'unknown',
        ts:       Number(entry.ts) || Date.now(),
    };
}

async function submitLeaderboardEntry() {
    if (!_pendingRun) return;
    const nameEl = document.getElementById('lb-name-input');
    const name   = (nameEl?.value || '').trim().toUpperCase().replace(/[^A-Z0-9 _\-\.]/g, '') || 'ANONYMOUS';

    // Remember callsign
    try { localStorage.setItem('tw_callsign', name); } catch(e) {}

    const entry = { ...(_pendingRun), name };
    const scores = await _loadScores();
    scores.push(entry);
    _sortScores(scores);
    const trimmed = scores.slice(0, LB_MAX);
    await _saveScores(trimmed);

    _pendingRun = null;
    document.getElementById('lb-submit-panel').style.display = 'none';
    await _renderScores();
}

function skipLeaderboardSubmit() {
    _pendingRun = null;
    document.getElementById('lb-submit-panel').style.display = 'none';
}

// ── Deploy tween ─────────────────────────────────────────────────

function _execDropInTween(scene, normalScale) {
    // Drop-in: mech starts above (offset up), tweens down to land with shockwave
    player.setAlpha(1);
    torso.setAlpha(1);
    if (glowWedge) glowWedge.setVisible(false);

    // Remove cover — mech is about to drop in
    document.getElementById('deploy-cover').style.display = 'none';
    document.getElementById('hud-container').style.display = 'flex';
    document.getElementById('top-left-btns').style.display = 'flex';
    const _mm = document.getElementById('minimap-wrap'); if (_mm) _mm.style.display = 'block';

    // Set camera lerp to instant so it tracks the mech even while offset above
    scene.cameras.main.setLerp(1.0, 1.0);
    const dropOffsetY = 280;
    player.y -= dropOffsetY;
    torso.y  -= dropOffsetY;

    // Lock movement during drop
    isDeployed = false;

    scene.tweens.add({
        targets:  [player, torso],
        y:        `+=${dropOffsetY}`,
        duration: 750,
        ease:     'Cubic.easeIn',
        onComplete: () => {
            // Restore smooth camera lerp after landing
            scene.cameras.main.setLerp(0.5, 0.5);
            if (glowWedge) glowWedge.setVisible(true);

            // White shockwave ring
            const w1 = scene.add.circle(player.x, player.y, 8, 0xffffff, 0)
                .setStrokeStyle(4, 0xffffff, 1.0).setDepth(15);
            scene.tweens.add({ targets: w1, radius: 120 * normalScale, alpha: 0,
                duration: 600, ease: 'Cubic.easeOut', onComplete: () => w1.destroy() });

            // Armour-coloured ring
            const w2 = scene.add.circle(player.x, player.y, 8, loadout.color, 0)
                .setStrokeStyle(2.5, loadout.color, 0.85).setDepth(14);
            scene.tweens.add({ targets: w2, radius: 90 * normalScale, alpha: 0,
                duration: 500, ease: 'Cubic.easeOut', onComplete: () => w2.destroy() });

            // Dust/debris burst
            const dust = scene.add.particles(player.x, player.y, 'smoke', {
                lifespan:  { min: 400, max: 700 },
                scale:     { start: 1.4, end: 0 },
                alpha:     { start: 0.7, end: 0 },
                speed:     { min: 80, max: 220 },
                angle:     { min: 0, max: 360 },
                tint:      0xaaaaaa,
                quantity:  24,
                frequency: -1
            }).setDepth(6);
            scene.time.delayedCall(900, () => dust.destroy());

            // Camera shake on landing
            scene.cameras.main.shake(300, 0.018);

            // Unlock movement + spawn enemies now that scene is ready
            // Guard: if player was destroyed during drop (bullet hit during tween), abort
            if (!player?.active) { console.log('[DEPLOY] player not active, aborting'); return; }
            isDeployed = true;
            _isPaused = false;
            // Ensure physics and time are running (could be paused from death/stats)
            try { GAME.scene.scenes[0].physics.resume(); } catch(e) {}
            try { GAME.scene.scenes[0].time.paused = false; } catch(e) {}
            applyAugment();
            applyLegSystem();
            // Apply skill tree combat bonuses to perkState
            if (_gameMode === 'campaign' && typeof getSkillTreeBonuses === 'function') {
                const stb = getSkillTreeBonuses(_campaignState.chassis);
                if (stb.dmgMult)     _perkState.dmgMult = (_perkState.dmgMult || 1) * (1 + stb.dmgMult);
                if (stb.reloadMult)  _perkState.reloadMult = (_perkState.reloadMult || 1) * (1 - stb.reloadMult);
                if (stb.critChance)  _perkState.critChance = (_perkState.critChance || 0) + stb.critChance;
                if (stb.shieldRegen) _perkState.shieldRegenMult = (_perkState.shieldRegenMult || 1) * (1 + stb.shieldRegen);
                if (stb.blastMult)   _perkState.blastMult = (_perkState.blastMult || 1) * (1 + stb.blastMult);
                if (stb.dodgeChance) _perkState.dodgeChance = (_perkState.dodgeChance || 0) + stb.dodgeChance;
                if (stb.dr)          _perkState.fortress = (_perkState.fortress || 0) + stb.dr;
                if (stb.critDmg)     _perkState.critDmg = (_perkState.critDmg || 0) + stb.critDmg;
                if (stb.autoRepair)  _perkState.autoRepair = (_perkState.autoRepair || 0) + stb.autoRepair;
                if (stb.modCdMult && typeof CHASSIS !== 'undefined' && CHASSIS.medium) {
                    CHASSIS.medium.modCooldownMult = (CHASSIS.medium.modCooldownMult || 0.85) * (1 - stb.modCdMult);
                }
            }
            const sc = GAME.scene.scenes[0];
            // PVP uses its own deploy path (mpDeployPVP) — skip PvE round system entirely
            if (_gameMode !== 'pvp') {
                // Kick off round system on first deploy / respawn
                document.getElementById('round-hud').style.display = 'flex';
                if (_gameMode === 'campaign' && typeof getCampaignMission === 'function') {
                    const _cm = getCampaignMission();
                    if (_cm) {
                        const _campEnemy = (typeof getCampaignEnemyConfig === 'function') ? getCampaignEnemyConfig() : null;
                        const _enemyCount = _campEnemy ? _campEnemy.totalEnemies + (_cm.hasBoss ? 1 : 0) : '?';
                        showRoundBanner(_cm.name.toUpperCase(), _enemyCount + ' HOSTILES // LV.' + _cm.enemyLevel, 2200, null);
                    }
                } else {
                    showRoundBanner('ROUND ' + _round, (_round + 2) + ' ENEMY MECHS', 2000, null);
                }
                startRound(_round);
            }
        }
    });
}

// ── Game cleanup (pre-death / respawn) ────────────────────────────

function _cleanupGame() {
    const scene = GAME.scene.scenes[0];
    // Destroy per-deploy physics overlap/colliders so they don't accumulate across respawns
    if (_playerBulletOverlap) { try { scene.physics.world.removeCollider(_playerBulletOverlap); } catch(e){} _playerBulletOverlap = null; }
    if (_playerEnemyCollider) { try { scene.physics.world.removeCollider(_playerEnemyCollider); } catch(e){} _playerEnemyCollider = null; }
    if (_enemyEnemyCollider)  { try { scene.physics.world.removeCollider(_enemyEnemyCollider);  } catch(e){} _enemyEnemyCollider  = null; }
    // Kill all tweens
    try { scene.tweens.killAll(); } catch(e) {}
    // Clear loot tracking array (objects destroyed below with scene wipe)
    lootPickups = [];
    cleanupEquipmentDrops();
    // ── Nuclear scene wipe: destroy every display object EXCEPT persistent
    //    scene infrastructure: hangarOverlay, _bfGrid, and the physics groups
    //    (bullets, enemyBullets, enemies, coverObjects) which are registered once
    //    in create() and must survive. Everything else — particles, text, circles,
    //    mine visuals, explosion rings, drones, ghosts — gets destroyed.
    try {
        const keep = [
            scene.hangarOverlay, scene._bfGrid,
            bullets, enemyBullets, enemies, coverObjects
        ].filter(Boolean);
        // In PVP, also keep the local player, torso, shield, remote players, and bullet group
        if (_gameMode === 'pvp') {
            if (player) keep.push(player);
            if (torso) keep.push(torso);
            if (typeof shieldGraphic !== 'undefined' && shieldGraphic) keep.push(shieldGraphic);
            if (typeof glowWedge !== 'undefined' && glowWedge) keep.push(glowWedge);
            if (typeof crosshair !== 'undefined' && crosshair) keep.push(crosshair);
            if (typeof _mpPlayers !== 'undefined') {
                try {
                    _mpPlayers.forEach(rp => {
                        if (rp.body) keep.push(rp.body);
                        if (rp.torso) keep.push(rp.torso);
                        if (rp.nameTag) keep.push(rp.nameTag);
                        if (rp.hpBarBg) keep.push(rp.hpBarBg);
                        if (rp.hpBar) keep.push(rp.hpBar);
                    });
                } catch(e) {}
            }
            if (typeof _mpPvpBullets !== 'undefined' && _mpPvpBullets) keep.push(_mpPvpBullets);
            if (typeof _mpRemoteBodies !== 'undefined' && _mpRemoteBodies) keep.push(_mpRemoteBodies);
        }
        scene.children.list.slice().forEach(obj => {
            if (keep.includes(obj)) return;
            try { obj.destroy(); } catch(e) {}
        });
    } catch(e) {}
    player = torso = shieldGraphic = glowWedge = crosshair = speedStreakLine = null;
    // Clear group contents (the groups themselves survive)
    if (bullets)      bullets.clear(true, true);
    if (enemyBullets) enemyBullets.clear(true, true);
    if (enemies) {
        enemies.getChildren().forEach(e => {
            if (e.cmdLabel)   try { e.cmdLabel.destroy();   } catch(ex){}
            if (e.medicLabel) try { e.medicLabel.destroy(); } catch(ex){}
            if (e.medicCross) try { e.medicCross.destroy(); } catch(ex){}
            if (e._healTimer) try { e._healTimer.remove();  } catch(ex){}
            if (e.visuals)  try { e.visuals.destroy();  } catch(ex){}
            if (e.torso)    try { e.torso.destroy();    } catch(ex){}
            if (e._onDestroy) try { e._onDestroy(); } catch(ex){}
        });
        enemies.clear(true, true);
    }
    // Restore weapons/mod destroyed during play
    if (_savedL   !== null) { loadout.L   = _savedL;   _savedL   = null; }
    if (_savedR   !== null) { loadout.R   = _savedR;   _savedR   = null; }
    if (_savedMod !== null) { loadout.mod = _savedMod; _savedMod = null; }
    if (_savedAug !== null) { loadout.aug = _savedAug; _savedAug = null; }
    if (_savedLeg !== null) { loadout.leg = _savedLeg; _savedLeg = null; }
    _chaingunSpinStart = 0; _chaingunReady = false;
    isJumping = false;
    // Reset visual scales — jump tween may have left torso/player at non-base scale
    if (torso?.active) {
        const _baseS = CHASSIS[loadout.chassis]?.scale || 1.0;
        torso.setScale(_baseS);
    }
    if (player?.active) player.setScale(1.0);
    isDeployed = false; isJumping = false; isShieldActive = false; isRageActive = false; isAmmoActive = false; isChargeActive = false;
    _roundClearing = false; _roundActive = false;
    _lArmDestroyed = false; _rArmDestroyed = false; _legsDestroyed = false;
    // Window globals — destroy stale live objects and null refs so no cross-session bleed
    if (window._activeDecoy) { try { window._activeDecoy.destroy(); } catch(e){} window._activeDecoy = null; }
    if (window._phantomDecoys) {
        window._phantomDecoys.forEach(p => { try { p.drift?.remove(); p.fire?.remove(); } catch(e){} });
        window._phantomDecoys = [];
    }
    if (window._activeSwarm) { try { if (window._activeSwarm._tick) window._activeSwarm._tick.remove(); } catch(e){} window._activeSwarm = null; }
    window._equipPromptCallback = null;
    reloadL = 0; reloadR = 0; lastDamageTime = -99999; lastModTime = -10000;
    _footstepTimer = 0; _footstepSide = 1; _shockwaveTimer = 0;
    _lastTorsoX = 0; _lastTorsoY = 0; _lastTorsoMX = 0; _lastTorsoMY = 0;
}
