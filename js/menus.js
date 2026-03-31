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
    // Always resume physics/time on hangar return — showDeathScreen() sets _isPaused=false
    // before pausing physics, so the _isPaused guard would silently skip the resume.
    _isPaused = false;
    { const s = GAME?.scene?.scenes[0]; if (s) { try { s.physics.resume(); s.time.paused = false; } catch(e){} } }
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
    document.body.style.cursor = 'default';
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
            _modeLabel.textContent = 'WARZONE';
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
        resetLoadout(); // reset to Light chassis starter — warzone never persists selections
    }
    _round      = (_gameMode === 'campaign') ? _round : 1;
    CHASSIS.medium.modCooldownMult = 0.85; // restore to baseline
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
    _spectreClones.forEach(c => { try { c.torso?.destroy(); c.label?.destroy(); c.fire?.remove(); c.drift?.remove(); } catch(ex) {} });
    _spectreClones = [];
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
        if (typeof loadCampaignState === 'function') loadCampaignState();
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
    CHASSIS.medium.modCooldownMult = 0.85; // restore to baseline
    _perkState = _resetPerkState(); // shared factory — see _resetPerkState()
    _pickedPerks = [];
    _lastOfferedPerks = [];
    _spectreClones.forEach(c => { try { c.torso?.destroy(); c.label?.destroy(); c.fire?.remove(); c.drift?.remove(); } catch(ex) {} });
    _spectreClones = [];
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
    _updateMainMenuStats();
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
    _spectreClones.forEach(c => { try { c.torso?.destroy(); c.label?.destroy(); c.fire?.remove(); c.drift?.remove(); } catch(ex) {} });
    _spectreClones = [];
    _pickedPerks = [];
    _shotsFired = 0; _shotsHit = 0; _damageDealt = 0; _damageTaken = 0; _perksEarned = 0;
    _roundClearing = false;
    _extractionActive = false; _extractionPoint = null; _extractionVisuals = null; _extractionPromptShown = false;
    CHASSIS.medium.modCooldownMult = 0.85;
    const scene = GAME.scene.scenes[0];
    deployMech();
}

/** Campaign death: go to mission select. Scrap penalty is applied when death screen appears. */
function campaignDeathToMissionSelect() {
    returnToHangarForMissionSelect();
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
        if (resumeBtn) { resumeBtn.disabled = true; const _ls = resumeBtn.querySelector('span:nth-child(2)'); if (_ls) _ls.textContent = 'LOADING SAVE DATA...'; }
        _loadCampaignData()
            .catch(() => {
                // Cloud load failed but _loadCampaignData already falls back to localStorage
            })
            .finally(() => {
                if (resumeBtn && origHtml !== null) { resumeBtn.disabled = false; resumeBtn.innerHTML = origHtml; }
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
            modeLabel.textContent = 'WARZONE';
            modeLabel.style.color = UI_COLORS.cyan35;
        }
        // Reset to Light chassis starter loadout — warzone always starts fresh
        if (typeof resetLoadout === 'function') resetLoadout();
        // Clear any Campaign skill tree allocations — warzone has no skill tree
        if (typeof _skillTreeState !== 'undefined') _skillTreeState.allocated = {};
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
        if (typeof loadCampaignState === 'function') loadCampaignState();
        _updateCampaignButton();
        _updateMainMenuStats();
        setTimeout(() => { mm.style.opacity = '1'; }, 20);
        // Kick off cloud load immediately; update stats when it resolves
        if (typeof _loadCampaignData === 'function') {
            _loadCampaignData().then(() => {
                const menuEl = document.getElementById('main-menu');
                if (menuEl && menuEl.style.display !== 'none') _updateMainMenuStats();
            }).catch(() => {});
        }
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
    const el = id => document.getElementById(id);
    if (_gameMode === 'campaign') {
        // Campaign: show campaign-specific death screen with scrap report
        _showCampaignDeathScreen();
    } else {
        // Warzone: render combat report layout
        _showWarzoneDeathScreen();
    }
    const _dsc = GAME?.scene?.scenes[0];
    if (_dsc) { try { _dsc.input.setDefaultCursor('default'); } catch(e){} }
    document.body.style.cursor = 'default';
}

/** Campaign-specific death screen: apply scrap penalty immediately and render campaign layout. */
function _showCampaignDeathScreen() {
    // Apply scrap death penalty immediately
    let scrapLost = 0;
    if (typeof applyCampaignDeathPenalty === 'function') {
        scrapLost = applyCampaignDeathPenalty();
    }
    if (typeof saveCampaignState === 'function') saveCampaignState();
    if (typeof saveCampaignProgress === 'function') saveCampaignProgress();
    if (typeof saveInventory === 'function') saveInventory();

    // Hide warzone content, show campaign content
    const wz = document.getElementById('death-warzone-content');
    if (wz) wz.style.display = 'none';
    const cp = document.getElementById('death-campaign-content');
    if (cp) {
        cp.innerHTML =
            '<div style="font-size:52px;letter-spacing:8px;color:#cc2222;text-shadow:0 0 30px #cc2222;margin-bottom:12px;">MECH DESTROYED</div>' +
            '<div style="height:1px;background:linear-gradient(to right,transparent,rgba(204,34,34,0.5),transparent);margin:0 auto 14px;width:320px;"></div>' +
            '<div style="font-size:11px;letter-spacing:6px;color:rgba(255,255,255,0.3);margin-bottom:28px;">CORE SYSTEMS OFFLINE</div>' +
            '<div style="border:1px solid rgba(0,212,255,0.15);padding:16px 32px;margin:0 auto 24px;display:inline-block;min-width:220px;">' +
                '<div style="font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.3);margin-bottom:10px;">SALVAGE REPORT</div>' +
                '<div style="height:1px;background:rgba(0,212,255,0.1);margin-bottom:10px;"></div>' +
                '<div style="font-size:14px;letter-spacing:3px;color:#e8923a;">-' + scrapLost + ' SCRAP</div>' +
            '</div>' +
            '<div style="display:flex;gap:16px;justify-content:center;">' +
                '<button class="tw-btn tw-btn--ghost" onclick="returnToHangarForMissionSelect()" style="width:190px;border-color:rgba(255,255,255,0.12);">' +
                    '<span style="color:#e8923a;">&#9733;</span> MISSION SELECT' +
                '</button>' +
                '<button class="tw-btn tw-btn--ghost" onclick="returnToMainMenu()" style="width:190px;border-color:rgba(255,255,255,0.12);">' +
                    '<span style="color:#cc2222;">&#9632;</span> MAIN MENU' +
                '</button>' +
            '</div>';
        cp.style.display = '';
    }
    const ds = document.getElementById('death-screen');
    if (ds) ds.style.display = 'flex';
}

/** Warzone-specific death screen: render combat report matching campaign layout. */
function _showWarzoneDeathScreen() {
    const wz = document.getElementById('death-warzone-content');
    const cp = document.getElementById('death-campaign-content');
    if (cp) cp.style.display = 'none';
    if (wz) {
        const _roundNum  = _round;
        const _kills     = _totalKills;
        const _dmgDealt  = Math.round(_damageDealt);
        const _dmgTaken  = Math.round(_damageTaken);
        const _divider   = '<div style="width:1px;background:rgba(0,212,255,0.1);"></div>';
        const _statCell  = (label, value) =>
            '<div style="padding:8px 20px;text-align:center;">' +
                '<div style="font-size:11px;letter-spacing:3px;color:rgba(255,255,255,0.3);margin-bottom:6px;">' + label + '</div>' +
                '<div style="font-size:22px;color:#e8923a;">' + value + '</div>' +
            '</div>';
        wz.innerHTML =
            '<div style="font-size:52px;letter-spacing:8px;color:#cc2222;text-shadow:0 0 30px #cc2222;margin-bottom:12px;">MECH DESTROYED</div>' +
            '<div style="height:1px;background:linear-gradient(to right,transparent,rgba(204,34,34,0.5),transparent);margin:0 auto 14px;width:320px;"></div>' +
            '<div style="font-size:11px;letter-spacing:6px;color:rgba(255,255,255,0.3);margin-bottom:28px;">CORE SYSTEMS OFFLINE</div>' +
            '<div style="border:1px solid rgba(0,212,255,0.15);padding:16px 32px;margin:0 auto 24px;display:inline-block;min-width:220px;">' +
                '<div style="font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.3);margin-bottom:10px;">COMBAT REPORT</div>' +
                '<div style="height:1px;background:rgba(0,212,255,0.1);margin-bottom:10px;"></div>' +
                '<div style="display:flex;gap:0;">' +
                    _statCell('ROUND', _roundNum) +
                    _divider +
                    _statCell('KILLS', _kills) +
                    _divider +
                    _statCell('DMG DEALT', _dmgDealt) +
                    _divider +
                    _statCell('DMG TAKEN', _dmgTaken) +
                '</div>' +
            '</div>' +
            '<div style="display:flex;gap:16px;justify-content:center;">' +
                '<button id="death-btn-primary" class="tw-btn tw-btn--ghost" onclick="returnToHangar()" style="width:190px;border-color:rgba(255,255,255,0.12);color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:4px;">' +
                    '<span style="color:#e8923a;">&#9651;</span> MECH HANGAR' +
                '</button>' +
                '<button class="tw-btn tw-btn--ghost" onclick="returnToMainMenu()" style="width:190px;border-color:rgba(255,255,255,0.12);color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:4px;">' +
                    '<span style="color:#cc2222;">&#9632;</span> MAIN MENU' +
                '</button>' +
            '</div>';
        wz.style.display = '';
    }
    const ds = document.getElementById('death-screen');
    if (ds) ds.style.display = 'flex';
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
            // Loadout button only appears in campaign
            const loadoutBtn = document.getElementById('pause-loadout-btn');
            if (loadoutBtn) loadoutBtn.style.display = _gameMode === 'campaign' ? '' : 'none';
            // Perks button only appears in warzone (simulation)
            const perksBtn = document.getElementById('pause-perks-btn');
            if (perksBtn) perksBtn.style.display = _gameMode === 'simulation' ? '' : 'none';
            // Remove focus from in-game elements so no pause button appears pre-selected
            document.activeElement?.blur();
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

// ── Warzone Perks Overlay ─────────────────────────────────────────
function showWarzonePerksOverlay() {
    // Remove stale instance so data is always fresh
    const old = document.getElementById('wz-perks-overlay');
    if (old) old.remove();

    // ── Helpers ──
    const chassis   = loadout.chassis || 'light';
    const totalHP   = typeof getTotalHP === 'function' ? getTotalHP(chassis) : 0;
    const shieldHP  = (typeof player !== 'undefined' && player && player.active && typeof player.maxShield !== 'undefined')
        ? (player.maxShield || 0) : 0;
    const wName = k => {
        if (!k || k === 'none') return 'NONE';
        return (typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[k] : null)
            || (typeof WEAPONS !== 'undefined' ? WEAPONS[k]?.name : null)
            || k.toUpperCase();
    };
    const gName = k => {
        if (!k || k === 'none') return 'NONE';
        return typeof _hudName === 'function' ? _hudName(k) : k.toUpperCase();
    };
    const isNone   = k => !k || k === 'none';
    const noneClr  = 'color:var(--sci-txt2)';
    const gearClr  = 'color:#e8923a';
    const statRow  = (lbl, val, vs = '') =>
        `<div class="wz-perks-stat-row"><span class="wz-perks-stat-lbl">${lbl}</span>` +
        `<span class="wz-perks-stat-val"${vs ? ` style="${vs}"` : ''}>${val}</span></div>`;
    const divRow   = () => '<div class="wz-perks-divider"></div>';

    // ── Left column — BUILD STATS ──
    let statsHtml = '<div class="wz-perks-sec-label">BUILD STATS</div>';
    statsHtml += statRow('ROUND',   typeof _round      !== 'undefined' ? _round      : '—');
    statsHtml += statRow('KILLS',   typeof _totalKills !== 'undefined' ? _totalKills : '—');
    statsHtml += divRow();
    statsHtml += statRow('CHASSIS', chassis.toUpperCase(), 'color:var(--sci-cyan)');
    statsHtml += statRow('TOTAL HP', totalHP,
        'color:#00ff88');
    statsHtml += statRow('SHIELD',
        shieldHP > 0 ? shieldHP + ' HP' : 'NONE',
        shieldHP > 0 ? 'color:var(--sci-cyan)' : noneClr);
    statsHtml += divRow();
    statsHtml += statRow('L ARM',    wName(loadout.L),    isNone(loadout.L)    ? noneClr : gearClr);
    statsHtml += statRow('R ARM',    wName(loadout.R),    isNone(loadout.R)    ? noneClr : gearClr);
    statsHtml += statRow('CPU',      gName(loadout.cpu),  isNone(loadout.cpu)  ? noneClr : gearClr);
    statsHtml += statRow('SHIELD',   gName(loadout.shld), isNone(loadout.shld) ? noneClr : gearClr);
    statsHtml += statRow('LEGS',     gName(loadout.leg),  isNone(loadout.leg)  ? noneClr : gearClr);
    statsHtml += statRow('AUGMENT',  gName(loadout.aug),  isNone(loadout.aug)  ? noneClr : gearClr);

    // ── Right column — PERKS ──
    const picks    = typeof _pickedPerks !== 'undefined' ? _pickedPerks : [];
    const perkCount = picks.length;
    let perksHtml  = '';

    if (perkCount === 0) {
        perksHtml = '<div class="wz-perks-empty">No perks selected yet.</div>';
    } else {
        // Group duplicates, preserve first-seen order
        const seen   = [];
        const counts = {};
        picks.forEach(k => {
            if (!counts[k]) { seen.push(k); counts[k] = 0; }
            counts[k]++;
        });
        seen.forEach(k => {
            const p = typeof _perks !== 'undefined' ? _perks[k] : null;
            if (!p) return;
            const n         = counts[k];
            const isLegend  = !!p.legendary;
            const nameClr   = isLegend ? 'var(--sci-gold)' : 'var(--sci-txt)';
            const stackBadge = n > 1
                ? `<span style="color:var(--sci-cyan);font-size:9px;margin-left:4px;">×${n}</span>`
                : '';
            perksHtml +=
                `<div class="wz-perks-perk-row">` +
                `<div class="wz-perks-cat">${(p.cat || '').toUpperCase()}</div>` +
                `<div class="wz-perks-name" style="color:${nameClr}">${p.label}${stackBadge}</div>` +
                `<div class="wz-perks-desc">${p.desc}</div>` +
                `</div>`;
        });
    }

    // ── Build overlay DOM ──
    const ov = document.createElement('div');
    ov.id = 'wz-perks-overlay';
    ov.innerHTML =
        `<div class="wz-perks-panel">` +
            `<div class="wz-perks-top-bar">` +
                `<button class="wz-perks-back">&#8249; Back</button>` +
                `<div class="wz-perks-title">PERKS</div>` +
                `<div class="wz-perks-count">${perkCount} selected this run</div>` +
            `</div>` +
            `<div class="wz-perks-body">` +
                `<div class="wz-perks-left">${statsHtml}</div>` +
                `<div class="wz-perks-right">${perksHtml}</div>` +
            `</div>` +
        `</div>`;
    document.body.appendChild(ov);

    // ── ESC / Back button — close overlay, keep pause menu open ──
    function _closeWzPerksOverlay() {
        document.removeEventListener('keydown', _wzPerksEscHandler, true);
        const overlay = document.getElementById('wz-perks-overlay');
        if (overlay) overlay.remove();
        document.getElementById('pause-perks-btn')?.blur();
    }
    function _wzPerksEscHandler(e) {
        if (e.key !== 'Escape') return;
        e.preventDefault();
        e.stopImmediatePropagation();
        _closeWzPerksOverlay();
    }
    ov.querySelector('.wz-perks-back').onclick = _closeWzPerksOverlay;
    document.addEventListener('keydown', _wzPerksEscHandler, true);
}

function toggleStats() {
    const overlay = document.getElementById('stats-overlay');
    if (!overlay) return;
    _isStats = !_isStats;
    if (_isStats) {
        overlay.style.display = 'flex';
        _isPaused = true;
        const scene = GAME?.scene?.scenes[0];
        if (scene) { try { scene.physics.pause(); scene.time.paused = true; scene.input.setDefaultCursor('default'); } catch(e){} }
        document.body.style.cursor = 'default';
        populateLoadout();
    } else {
        overlay.style.display = 'none';
        _isInventory = false;
        _isPaused = false;
        _loCloseColorDD();
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

function toggleInventory() {
    if (_isStats) return; // already open — single unified screen, nothing to switch
    _isInventory = true;
    toggleStats();
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
    setTimeout(() => {
        if (!document.getElementById('mm-stat-missions')) return;

        const callsignEl = document.getElementById('mm-callsign');
        if (callsignEl && typeof _playerCallsign !== 'undefined') {
            callsignEl.textContent = _playerCallsign || '—';
        }
        const missionsEl = document.getElementById('mm-stat-missions');
        if (missionsEl) {
            missionsEl.textContent = Object.keys((_campaignState && _campaignState.completedMissions) || {}).length;
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
    }, 100);
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
        const _cs = resumeBtn.querySelector('span:nth-child(2)'); if (_cs) _cs.textContent = 'CHECKING SAVE DATA...';
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
            resumeBtn.innerHTML = '<span style="font-size:9px;color:rgba(255,255,255,0.22);min-width:20px;">★</span><span style="font-size:12px;letter-spacing:3px;text-transform:uppercase;flex:1;">Resume Campaign</span><span style="font-size:10px;color:rgba(255,255,255,0.22);">›</span>';
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

    const chassisColors = {
        light:  UI_COLORS.chassisLight,
        medium: UI_COLORS.chassisMedium,
        heavy:  UI_COLORS.chassisHeavy,
    };

    let html = '';

    // Title area
    html += `<div style="font-family:var(--font-mono);font-size:13px;letter-spacing:6px;color:var(--sci-txt);text-transform:uppercase;margin-bottom:4px;">NEW CAMPAIGN</div>`;
    html += `<div style="font-family:var(--font-mono);font-size:9px;letter-spacing:3px;color:var(--sci-txt3);margin-bottom:28px;">SELECT YOUR CHASSIS CLASS</div>`;

    // Chassis cards row
    html += '<div style="display:flex;gap:14px;width:100%;max-width:860px;">';
    for (const ch of ['light', 'medium', 'heavy']) {
        const isSelected = (_selectedNewChassis === ch);
        const color = chassisColors[ch];
        const c = CHASSIS[ch];
        const sl = STARTER_LOADOUTS[ch];
        const totalHP = c.coreHP + c.armHP + c.legHP;
        const weaponName = (WEAPON_NAMES[sl.L] || sl.L).toUpperCase();
        const shieldData = SHIELD_SYSTEMS[sl.shld];
        const shieldName = shieldData ? shieldData.name : sl.shld.toUpperCase();
        const maxShield = shieldData ? shieldData.maxShield : '—';
        const identity = c.identity || '';

        html += `<div class="chassis-card${isSelected ? ' active' : ''}" onclick="_highlightChassis('${ch}')">`;

        // Mech preview
        html += `<div class="cc-preview"><img src="assets/${ch}-mech.png" alt="${ch}" style="filter:drop-shadow(0 0 12px ${color});max-width:100%;max-height:100%;object-fit:contain;"></div>`;

        // Chassis name
        html += `<div class="cc-name">${ch.toUpperCase()}</div>`;

        // Divider
        html += `<div class="cc-divider"></div>`;

        // STATS section
        html += `<div class="cc-sec-label">STATS</div>`;
        html += `<div class="cc-stat-row"><span class="cc-stat-lbl">TOTAL HP</span><span class="cc-stat-val cc-green">${totalHP}</span></div>`;
        html += `<div class="cc-stat-row"><span class="cc-stat-lbl">HP SPLIT</span><span class="cc-hp-split-val"><span class="cc-dim">C&thinsp;</span><span class="cc-green">${c.coreHP}</span><span class="cc-dim">&thinsp;/&thinsp;A&thinsp;</span><span class="cc-green">${c.armHP}</span><span class="cc-dim">&thinsp;/&thinsp;L&thinsp;</span><span class="cc-green">${c.legHP}</span></span></div>`;
        html += `<div class="cc-stat-row"><span class="cc-stat-lbl">SHIELD</span><span class="cc-stat-val cc-cyan">${maxShield}</span></div>`;

        // Divider
        html += `<div class="cc-divider"></div>`;

        // LOADOUT section
        html += `<div class="cc-sec-label">LOADOUT</div>`;
        html += `<div class="cc-stat-row"><span class="cc-stat-lbl">WEAPON</span><span class="cc-stat-val cc-orange">${weaponName}</span></div>`;
        html += `<div class="cc-stat-row"><span class="cc-stat-lbl">SHIELD</span><span class="cc-stat-val cc-orange">${shieldName}</span></div>`;

        // Chassis trait summary
        html += `<div class="cc-trait">${identity}</div>`;

        html += `</div>`; // close .chassis-card
    }
    html += '</div>'; // close cards row

    // Footer — Start Campaign button centered, Back button at top-left
    html += '<div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:24px;">';
    if (_selectedNewChassis) {
        html += `<button onclick="_startNewCampaignWithChassis('${_selectedNewChassis}')" class="tw-btn tw-btn--solid" style="min-width:220px;padding:12px 40px;white-space:nowrap;">START CAMPAIGN</button>`;
    } else {
        html += `<button class="tw-btn tw-btn--solid" style="min-width:220px;padding:12px 40px;white-space:nowrap;opacity:0.4;pointer-events:none;" disabled>START CAMPAIGN</button>`;
    }
    html += '</div>';

    // Back button — top-left of overlay
    html += `<button onclick="_cancelNewCampaign()" class="tw-btn tw-btn--ghost tw-btn--sm" style="position:absolute;top:20px;left:20px;">‹ Back</button>`;

    overlay.innerHTML = html;
    overlay.style.display        = 'flex';
    overlay.style.position       = 'fixed';
    overlay.style.alignItems     = 'center';
    overlay.style.justifyContent = 'flex-start';
    overlay.style.padding        = '40px 24px';
    overlay.style.overflowY      = 'auto';
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
    // Reset skill tree allocations for new campaign
    if (typeof _skillTreeState !== 'undefined') {
        _skillTreeState.allocated = {};
    }
    // Save the chassis choice (skill tree reset is persisted here)
    saveCampaignProgress();
    if (typeof saveCampaignState === 'function') saveCampaignState();
    // Hide chassis select, show mission select
    const overlay = document.getElementById('mission-select-overlay');
    if (overlay) overlay.style.display = 'none';
    _gameMode = 'campaign';
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
    if (hdr) hdr.innerHTML = `<span style="color:rgba(255,255,255,0.35);">SCRAP</span> <span style="color:#e8923a;">${_scrap}</span>`;
    const bpCount = document.getElementById('lo-bp-count');
    if (bpCount) bpCount.textContent = `${_inventory.filter(i => i !== null).length} / ${INVENTORY_MAX}`;

    // ── Mech Silhouette with positioned equip slots ──
    const silEl = document.getElementById('inv-mech-silhouette');
    if (silEl) {
        const ch = loadout?.chassis || 'medium';
        const mechColor = typeof loadout !== 'undefined' ? loadout.color : 0x00ff88;

        // Slot config: left column (top→bottom): CPU, ARMS, L ARM, SHIELD
        //              right column (top→bottom): AUGMENT, ARMOR, R ARM, LEGS
        const _leftSlots  = [
            { key: 'cpu',     label: 'CPU' },
            { key: 'arms',    label: 'ARMS' },
            { key: 'L',       label: 'L ARM' },
            { key: 'shield',  label: 'SHIELD' },
        ];
        const _rightSlots = [
            { key: 'augment', label: 'AUGMENT' },
            { key: 'armor',   label: 'ARMOR' },
            { key: 'R',       label: 'R ARM' },
            { key: 'legs',    label: 'LEGS' },
        ];

        const _mkSlot = ({ key, label }) => {
            const item = _equipped[key];
            const rd = item ? RARITY_DEFS[item.rarity] : null;
            const nameColor = rd ? rd.colorStr : UI_COLORS.text35;
            const _dn = item ? ((item.baseType === 'weapon' ? WEAPON_NAMES[item.subType] : null) || item.shortName || item.name) : '';
            const borderColor = rd ? rd.colorStr + '55' : UI_COLORS.gold20;
            const bgColor = rd ? rd.colorStr + '26' : '';
            return `<div class="mech-equip-slot lo-slot" style="border-color:${borderColor};${bgColor ? `background-color:${bgColor};` : ''}"
                data-slot="${key}" ${item ? 'draggable="true"' : ''}
                ondragstart="_onEquipDragStart(event)" ondragover="_onSlotDragOver(event)" ondragleave="_onSlotDragLeave(event)" ondrop="_onSlotDrop(event)"
                onmousedown="_hideSlotHover()" onmouseenter="_showSlotHover(this,'${key}')" onmouseleave="_hideSlotHover()">
                ${item && item.isUnique ? '<div class="lo-slot-star">★</div>' : ''}
                <div class="lo-slot-lbl">${label}</div>
                ${_dn ? `<div class="lo-slot-name" style="color:${nameColor};">${_dn}</div>` : ''}
            </div>`;
        };

        let html = '';
        html += `<div style="position:relative;width:100%;height:100%;">`;

        // Mech ghost image — neutral gray at 40% opacity
        const mechImgSrc = `assets/${ch}-mech.png`;
        html += `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;opacity:0.40;">`;
        html += `<img src="${mechImgSrc}" style="width:220px;object-fit:contain;filter:grayscale(100%);" />`;
        html += `</div>`;

        // SVG connector lines — y coords match vertically-centered 4-slot stack
        // (doll 440px, stack 412px → top=14px; slot centers at 64,168,272,376px → 14.5,38.2,61.8,85.5%)
        html += `<svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">`;
        const _svgLines = [
            [13,14.5,50,50],[13,38.2,50,50],[13,61.8,50,50],[13,85.5,50,50],
            [87,14.5,50,50],[87,38.2,50,50],[87,61.8,50,50],[87,85.5,50,50],
        ];
        _svgLines.forEach(([x1,y1,x2,y2]) => {
            html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(0,212,255,0.1)" stroke-dasharray="3 5" vector-effect="non-scaling-stroke"/>`;
        });
        html += `</svg>`;

        // Left flex column
        html += `<div class="lo-doll-left">`;
        _leftSlots.forEach(s => { html += _mkSlot(s); });
        html += `</div>`;

        // Right flex column
        html += `<div class="lo-doll-right">`;
        _rightSlots.forEach(s => { html += _mkSlot(s); });
        html += `</div>`;

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

        const _bpSlotNames = {
                weapon:'WEAPON', cpu_system:'CPU', aug_system:'AUGMENT',
                shield_system:'SHIELD', leg_system:'LEGS', armor:'ARMOR', arms:'ARMS',
                legs:'LEGS', shield:'SHIELD', cpu:'CPU', augment:'AUGMENT'
        };
        // Render all 20 slots by position — items stay at their stored index
        for (let i = 0; i < INVENTORY_MAX; i++) {
            const item = _inventory[i];
            if (item) {
                const rd = RARITY_DEFS[item.rarity];
                const cell = document.createElement('div');
                cell.className = 'lo-slot';
                cell.draggable = true;
                cell.dataset.invIdx = i;
                cell.dataset.bpIdx = i;
                cell.title = `${item.name}\n${item.affixes.map(a => a.label).join('\n')}${item.uniqueLabel ? '\n★ ' + item.uniqueLabel : ''}`;
                const _bpSlotLbl = _bpSlotNames[item.baseType] || '';
                cell.innerHTML = `
                    ${item.isUnique ? '<div class="lo-slot-star">★</div>' : ''}
                    <div class="lo-slot-lbl">${_bpSlotLbl}</div>
                    <div class="lo-slot-name" style="color:${rd.colorStr};">${(item.baseType === 'weapon' ? WEAPON_NAMES[item.subType] : null) || item.shortName || item.name}</div>
                `;
                cell.style.borderColor = item.isUnique ? 'rgba(255,215,0,0.4)' : rd.colorStr + '44';
                cell.style.backgroundColor = rd.colorStr + '26';
                // Apply selected state if this item is currently selected
                if (_invSelectedSource === 'backpack' && _invSelectedKey === i) {
                    cell.style.borderColor = rd.colorStr + 'ee';
                    cell.style.boxShadow   = `0 0 10px ${rd.colorStr}55`;
                }
                cell.addEventListener('mouseover', () => {
                    if (!(_invSelectedSource === 'backpack' && _invSelectedKey === i)) {
                        cell.style.borderColor = item.isUnique ? 'rgba(255,215,0,0.8)' : rd.colorStr + 'aa';
                        cell.style.boxShadow   = item.isUnique ? '0 0 8px rgba(255,215,0,0.4)' : `0 0 8px ${rd.colorStr}33`;
                    }
                });
                cell.addEventListener('mouseout', () => {
                    if (!(_invSelectedSource === 'backpack' && _invSelectedKey === i)) {
                        cell.style.borderColor = item.isUnique ? 'rgba(255,215,0,0.4)' : rd.colorStr + '44';
                        cell.style.boxShadow   = 'none';
                    }
                });
                cell.addEventListener('mouseenter', () => { _showSlotHover(cell, null, item); });
                cell.addEventListener('mouseleave', () => { _hideSlotHover(); });
                // Double-click to equip
                cell.addEventListener('dblclick', (ev) => {
                    _hideSlotHover();
                    if (item.baseType === 'weapon') {
                        const arm = ev.shiftKey ? 'R' : 'L';
                        _equipItemToSlot(i, arm);
                    } else {
                        _equipItem(i);
                    }
                    populateLoadout();
                });
                // Drag events
                cell.addEventListener('mousedown', () => { _hideSlotHover(); });
                cell.addEventListener('dragstart', (ev) => {
                    _hideSlotHover();
                    ev.dataTransfer.setData('text/plain', 'backpack:' + i);
                    cell.classList.add('dragging');
                    // Highlight valid/invalid equip slots
                    const validSlots = _getDragValidSlots(item);
                    document.querySelectorAll('.mech-equip-slot').forEach(slot => {
                        if (validSlots.includes(slot.dataset.slot)) {
                            slot.classList.add('drag-valid');
                        } else {
                            slot.classList.add('drag-invalid');
                        }
                    });
                    // Highlight all backpack slots green (valid move targets)
                    document.querySelectorAll('#inv-backpack .lo-slot').forEach(bp => {
                        bp.classList.add('bp-drag-valid');
                    });
                });
                cell.addEventListener('dragend', () => {
                    cell.classList.remove('dragging');
                    document.querySelectorAll('.mech-equip-slot').forEach(slot => {
                        slot.classList.remove('drag-valid', 'drag-invalid');
                    });
                    // Clear backpack slot highlights
                    document.querySelectorAll('#inv-backpack .lo-slot').forEach(bp => {
                        bp.classList.remove('bp-drag-valid');
                    });
                });
                // Backpack rearrange: accept drops from other backpack slots
                cell.addEventListener('dragover', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    cell.classList.add('drag-over');
                });
                cell.addEventListener('dragleave', () => { cell.classList.remove('drag-over'); });
                cell.addEventListener('drop', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    cell.classList.remove('drag-over');
                    _onBpCellDrop(ev, i);
                });
                bpEl.appendChild(cell);
            } else {
                const empty = document.createElement('div');
                empty.className = 'lo-slot empty';
                empty.dataset.bpIdx = i;
                empty.addEventListener('dragover', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    empty.classList.add('drag-over');
                });
                empty.addEventListener('dragleave', () => { empty.classList.remove('drag-over'); });
                empty.addEventListener('drop', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    empty.classList.remove('drag-over');
                    _onBpCellDrop(ev, i);
                });
                bpEl.appendChild(empty);
            }
        }
    }

}

/** Handle a drop onto a backpack cell — rearranges items within the backpack. */
function _onBpCellDrop(ev, targetIdx) {
    const data = ev.dataTransfer.getData('text/plain');
    if (data.startsWith('backpack:')) {
        const srcIdx = parseInt(data.split(':')[1]);
        if (srcIdx === targetIdx) return;
        // Swap source and target positions (works for both empty and occupied targets)
        const srcItem = _inventory[srcIdx];
        _inventory[srcIdx] = _inventory[targetIdx];
        _inventory[targetIdx] = srcItem;
        if (typeof saveInventory === 'function') saveInventory();
        populateInventory();
    } else if (data.startsWith('equipped:')) {
        // Drop equipped item to backpack — use normal unequip (places in first free slot)
        const slotKey = data.split(':')[1];
        _unequipItem(slotKey);
    }
}

/** Track currently selected item in the detail panel (for toggle behaviour). */
let _invSelectedSource = null;
let _invSelectedKey    = null;

/** Track Shift key state for weapon arm comparison in hover cards. */
var _shiftHeld = false;
var _hoverActiveEl = null;
var _hoverActiveSlotKey = null;
var _hoverActiveItem = null;
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' && !_shiftHeld) {
        _shiftHeld = true;
        if (_hoverActiveEl && _hoverActiveItem && _hoverActiveItem.baseType === 'weapon') {
            _showSlotHover(_hoverActiveEl, _hoverActiveSlotKey, _hoverActiveItem);
        }
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' && _shiftHeld) {
        _shiftHeld = false;
        if (_hoverActiveEl && _hoverActiveItem && _hoverActiveItem.baseType === 'weapon') {
            _showSlotHover(_hoverActiveEl, _hoverActiveSlotKey, _hoverActiveItem);
        }
    }
});

function _getSlotForItem(item) {
    if (item.baseType === 'weapon') return null; // weapon needs L or R choice
    const map = {
        armor:'armor', arms:'arms', legs:'legs', shield:'shield', cpu:'cpu', augment:'augment',
        // System items map to the same equip slots
        shield_system:'shield', cpu_system:'cpu', leg_system:'legs', aug_system:'augment'
    };
    return map[item.baseType] || null;
}

/** Returns the list of data-slot values that accept this item during drag. */
function _getDragValidSlots(item) {
    if (item.baseType === 'weapon') return ['L', 'R'];
    const slot = _getSlotForItem(item);
    return slot ? [slot] : [];
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
    _inventory[invIdx] = null;
    if (old) {
        const _fs = _inventory.indexOf(null);
        if (_fs !== -1) _inventory[_fs] = old;
    }

    if (typeof loadout !== 'undefined') {
        // Weapons → loadout.L / loadout.R
        if (item.baseType === 'weapon') {
            loadout[slotKey] = item.subType;
        }
        // System items → activate the actual GAME system
        if (item.systemKey) {
            const _sysLoadoutMap = { shield_system:'shld', cpu_system:'cpu', leg_system:'leg', aug_system:'aug' };
            const loadoutKey = _sysLoadoutMap[item.baseType];
            if (loadoutKey) loadout[loadoutKey] = item.systemKey;
        }
    }

    recalcGearStats();
    // If a shield item was equipped during an active run, recalc player shield stats
    if ((item.baseType === 'shield_system' || item.baseType === 'shield') && typeof player !== 'undefined' && player?.active && typeof isDeployed !== 'undefined' && isDeployed) {
        const _ss = (typeof SHIELD_SYSTEMS !== 'undefined' && SHIELD_SYSTEMS[loadout.shld]) || { maxShield:0, regenRate:0, regenDelay:5, absorb:0.50 };
        const _gShieldHP = (_gearState?.shieldHP || 0);
        const _ssBase = _equipped?.shield ? 0 : (_ss.maxShield || 0);
        player.maxShield = _ssBase + _gShieldHP;
        player.shield = Math.min(player.shield || 0, player.maxShield) || player.maxShield;
        player._shieldRegenRate  = _ss.regenRate;
        player._shieldRegenDelay = _ss.regenDelay;
        const _chassisBonus = loadout.chassis === 'medium' ? (CHASSIS.medium.shieldAbsorbBonus || 0.15) : 0;
        const _gAbsorb = ((_gearState?.shieldAbsorb || 0) / 100);
        player._shieldAbsorb = Math.min(0.90, (_ss.absorb ?? 0.50) + _chassisBonus + _gAbsorb);
        player._shieldFlickerHit = false;
        player._shieldAdaptStack = 0;
        player._shieldLayerHP = [_ss.layer1Max || 0, _ss.layer2Max || 0];
    }
    if (typeof updateHUD === 'function') updateHUD();
    if (typeof updateBars === 'function') updateBars();
    saveInventory();
    if (typeof _gameMode !== 'undefined' && _gameMode === 'campaign' && typeof debouncedCampaignSave === 'function') debouncedCampaignSave();
    populateInventory();
    _updateInvCount();
}

function _unequipItem(slotKey) {
    const item = _equipped[slotKey];
    if (!item) return;
    const _freeSlot = _inventory.indexOf(null);
    if (_freeSlot === -1) {
        // Inventory full — show feedback so the player knows why nothing happened
        const _sc = GAME?.scene?.scenes[0];
        if (_sc && typeof _showFloatingWarning === 'function') _showFloatingWarning(_sc, 'INVENTORY FULL', UI_COLORS.redAlt);
        return;
    }
    _inventory[_freeSlot] = item;
    _equipped[slotKey] = null;

    if (typeof loadout !== 'undefined') {
        // Weapons → clear from loadout
        if (item.baseType === 'weapon') {
            loadout[slotKey] = 'none';
        }
        // System items → revert to 'none' (or starter default)
        if (item.systemKey) {
            const _sysLoadoutMap = { shield_system:'shld', cpu_system:'cpu', leg_system:'leg', aug_system:'aug' };
            const loadoutKey = _sysLoadoutMap[item.baseType];
            if (loadoutKey) {
                // Revert to starter loadout default for this slot
                const starter = (typeof STARTER_LOADOUTS !== 'undefined') ? STARTER_LOADOUTS[loadout.chassis] : null;
                const _starterKeyMap = { shld:'shld', cpu:'cpu', leg:'leg', aug:'aug' };
                loadout[loadoutKey] = starter ? (starter[loadoutKey === 'shld' ? 'shld' : loadoutKey] || 'none') : 'none';
            }
        }
    }

    recalcGearStats();
    // If a shield item was unequipped during an active run, revert player shield stats
    if ((item.baseType === 'shield_system' || item.baseType === 'shield') && typeof player !== 'undefined' && player?.active && typeof isDeployed !== 'undefined' && isDeployed) {
        const _ss = (typeof SHIELD_SYSTEMS !== 'undefined' && SHIELD_SYSTEMS[loadout.shld]) || { maxShield:0, regenRate:0, regenDelay:5, absorb:0.50 };
        const _gShieldHP = (_gearState?.shieldHP || 0);
        const _ssBase = _equipped?.shield ? 0 : (_ss.maxShield || 0);
        player.maxShield = _ssBase + _gShieldHP;
        player.shield = Math.min(player.shield || 0, player.maxShield);
        player._shieldRegenRate  = _ss.regenRate;
        player._shieldRegenDelay = _ss.regenDelay;
        const _chassisBonus = loadout.chassis === 'medium' ? (CHASSIS.medium.shieldAbsorbBonus || 0.15) : 0;
        const _gAbsorb = ((_gearState?.shieldAbsorb || 0) / 100);
        player._shieldAbsorb = Math.min(0.90, (_ss.absorb ?? 0.50) + _chassisBonus + _gAbsorb);
        player._shieldFlickerHit = false;
        player._shieldAdaptStack = 0;
        player._shieldLayerHP = [_ss.layer1Max || 0, _ss.layer2Max || 0];
    }
    if (typeof updateHUD === 'function') updateHUD();
    if (typeof updateBars === 'function') updateBars();
    saveInventory();
    if (typeof _gameMode !== 'undefined' && _gameMode === 'campaign' && typeof debouncedCampaignSave === 'function') debouncedCampaignSave();
    populateInventory();
    _updateInvCount();
}

function _scrapItem(invIdx) {
    const item = _inventory[invIdx];
    if (!item) return;
    const rd = RARITY_DEFS[item.rarity];
    _scrap += rd.scrapValue;
    _inventory[invIdx] = null;
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
    if (el) el.textContent = `${_inventory.filter(i => i !== null).length}/${INVENTORY_MAX}`;
}

function _statRow(label, value, colorClass='') {
    return `<div class="lo-stat-row"><span class="lo-stat-label">${label}</span><span class="lo-stat-value ${colorClass}">${value}</span></div>`;
}

function _hpBar(label, hp, max, color) {
    const pct = max > 0 ? Math.round(hp/max*100) : 0;
    const barColor = pct > 60 ? UI_COLORS.greenAccent : pct > 30 ? UI_COLORS.yellow : UI_COLORS.redCritical;
    return `<div class="stats-hp-bar">
        <span class="lo-stat-label" style="min-width:70px">${label}</span>
        <div class="stats-hp-track"><div class="stats-hp-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <span class="lo-stat-value" style="font-size:13px;min-width:70px;text-align:right;color:${barColor}">${Math.round(hp)} / ${Math.round(max)}</span>
    </div>`;
}

function _hpBarBoosted(label, hp, max, baseMax) {
    const pct = max > 0 ? Math.round(hp/max*100) : 0;
    const barColor = pct > 60 ? UI_COLORS.greenAccent : pct > 30 ? UI_COLORS.yellow : UI_COLORS.redCritical;
    const bonus = Math.round(max - baseMax);
    const bonusData = bonus > 0 ? ` data-bonus="+${bonus} from perks/gear"` : '';
    const bonusCls = bonus > 0 ? ' stat-has-bonus' : '';
    return `<div class="stats-hp-bar">
        <span class="lo-stat-label" style="min-width:70px">${label}</span>
        <div class="stats-hp-track"><div class="stats-hp-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <span class="lo-stat-value${bonusCls}" style="min-width:80px;text-align:right;color:${barColor}"${bonusData}>${Math.round(hp)} / ${Math.round(max)}</span>
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

/** Renders hull HP bars to #lo-hull-info and chassis name to #lo-chassis-row. */
function _renderHullBars() {
    const ch = loadout.chassis;
    const chassisData = CHASSIS[ch];
    const _inGame = !!(player?.comp);
    const _gCore = (_gearState?.coreHP||0) + (_gearState?.allHP||0);
    const _gArm  = (_gearState?.armHP||0)  + (_gearState?.allHP||0);
    const _gLeg  = (_gearState?.legHP||0)  + (_gearState?.allHP||0);
    const baseHP = {
        core: (chassisData?.coreHP||212) + _gCore,
        lArm: (chassisData?.armHP||120)  + _gArm,
        rArm: (chassisData?.armHP||120)  + _gArm,
        legs: (chassisData?.legHP||152)  + _gLeg,
    };

    // Chassis name row
    const crEl = document.getElementById('lo-chassis-row');
    if (crEl) crEl.innerHTML = `<span class="lo-chassis-lbl">Chassis</span><span class="lo-chassis-val">${ch.toUpperCase()}</span>`;

    const el = document.getElementById('lo-hull-info');
    if (!el) return;

    const _hpRow = (label, hp, max) => {
        const pct = max > 0 ? Math.round(hp / max * 100) : 0;
        const fillColor = pct > 60 ? '#00ff88' : pct > 30 ? '#ffdd00' : '#ff4d6a';
        return `<div class="lo-hp-row">
            <span class="lo-hp-part">${label}</span>
            <div class="lo-hp-track"><div class="lo-hp-fill" style="width:${pct}%;background:${fillColor}"></div></div>
            <span class="lo-hp-val">${Math.round(hp)} / ${Math.round(max)}</span>
        </div>`;
    };

    let html = '';
    let totalsHtml = '';
    if (_inGame) {
        html += _hpRow('Core',  player.comp.core.hp,  player.comp.core.max);
        html += _hpRow('L.Arm', player.comp.lArm.hp,  player.comp.lArm.max);
        html += _hpRow('R.Arm', player.comp.rArm.hp,  player.comp.rArm.max);
        html += _hpRow('Legs',  player.comp.legs.hp,  player.comp.legs.max);
        const totalHp  = Object.values(player.comp).reduce((s,c)=>s+c.hp,0);
        const totalMax = Object.values(player.comp).reduce((s,c)=>s+c.max,0);
        const curShield = Math.round(player.shield||0);
        const maxShield = Math.round(player.maxShield||0);
        totalsHtml += `<div class="lo-stat-row"><span class="lo-stat-label">Total HP</span><span class="lo-stat-value" style="color:#00ff88">${Math.round(totalHp)} / ${Math.round(totalMax)}</span></div>`;
        totalsHtml += `<div class="lo-stat-row"><span class="lo-stat-label">Total Shield</span><span class="lo-stat-value" style="color:#cc88ff">${curShield} / ${maxShield}</span></div>`;
    } else {
        html += _hpRow('Core',  baseHP.core,  baseHP.core);
        html += _hpRow('L.Arm', baseHP.lArm,  baseHP.lArm);
        html += _hpRow('R.Arm', baseHP.rArm,  baseHP.rArm);
        html += _hpRow('Legs',  baseHP.legs,  baseHP.legs);
        const totalBase  = Object.values(baseHP).reduce((s,v)=>s+v,0);
        const baseShield = (SHIELD_SYSTEMS[loadout?.shld]?.maxShield||0) + (_gearState?.shieldHP||0);
        totalsHtml += `<div class="lo-stat-row"><span class="lo-stat-label">Total HP</span><span class="lo-stat-value" style="color:#00ff88">${totalBase} / ${totalBase}</span></div>`;
        totalsHtml += `<div class="lo-stat-row"><span class="lo-stat-label">Total Shield</span><span class="lo-stat-value" style="color:#cc88ff">${baseShield} / ${baseShield}</span></div>`;
    }
    el.innerHTML = html;
    const tbEl = document.getElementById('lo-totals-block');
    if (tbEl) tbEl.innerHTML = totalsHtml;
}

function _renderActivePerksPanel() {
    // ── ACTIVE PERKS ──────────────────────────────────────────
    const perksEl = document.getElementById('stat-perks-info');
    perksEl.innerHTML = '';
    if (_pickedPerks.length === 0) {
    perksEl.innerHTML = '<span class="lo-stat-label" style="opacity:0.4;font-size:13px;">No perks selected yet</span>';
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
    const gearTitle = document.getElementById('stat-gear-title');
    if (!gearPanel || !gearInfo) return;
    const gs = typeof _gearState !== 'undefined' ? _gearState : {};
    const hasAnyGear = Object.values(gs).some(v => v !== 0);

    // Merge skill tree bonuses in campaign mode
    const stb = (_gameMode === 'campaign' && typeof getSkillTreeBonuses === 'function')
        ? getSkillTreeBonuses() : {};
    const hasSkillBonuses = Object.values(stb).some(v => v !== 0);

    // Update header to reflect whether skill bonuses are included
    if (gearTitle) {
        gearTitle.textContent = (_gameMode === 'campaign') ? 'Gear / Skill Bonuses' : 'Gear Bonuses';
    }

    const hasChassisTrait = !!(loadout?.chassis);
    if (!hasAnyGear && !hasSkillBonuses && !hasChassisTrait) {
        gearPanel.style.display = 'none';
        return;
    }
    gearPanel.style.display = 'block';
    const offKeys  = ['dmgFlat','dmgPct','critChance','critDmg','fireRatePct','pellets','splashRadius'];
    const defKeys  = ['coreHP','armHP','legHP','allHP','dr','shieldHP','shieldRegen','dodgePct','shieldAbsorb'];
    const utilKeys = ['speedPct','modCdPct','modEffPct','lootMult','autoRepair'];
    const negKeys  = new Set(['fireRatePct','modCdPct']);

    const _renderGroup = (title, keys) => {
        const active = keys.filter(k => {
            const v = (gs[k] || 0) + (stb[k] || 0);
            return negKeys.has(k) ? v !== 0 : v > 0;
        });
        if (active.length === 0) return '';
        let h = `<div class="bsub">${title}</div>`;
        active.forEach(k => {
            const v  = (gs[k] || 0) + (stb[k] || 0);
            const isNeg = negKeys.has(k);
            const displaySign = isNeg ? (v < 0 ? '+' : '-') : '+';
            const displayMag = Math.abs(v);
            const fmtGv = _pctStats.has(k) ? displayMag + '%' : displayMag;
            const cls = isNeg ? (v < 0 ? 'pos' : 'neg') : 'pos';
            h += `<div class="lo-bonus-row"><span class="lo-bonus-lbl">${STAT_DISPLAY_NAMES[k] || _camelToTitle(k)}</span><span class="lo-bonus-val ${cls}">${displaySign}${fmtGv}</span></div>`;
        });
        return h;
    };

    let gHtml = '';
    gHtml += _renderGroup('OFFENSIVE', offKeys);
    gHtml += _renderGroup('DEFENSIVE', defKeys);
    gHtml += _renderGroup('UTILITY', utilKeys);

    // ── Chassis trait bonuses ──
    const _ch = loadout?.chassis;
    if (_ch) {
        const _traitRows = [];
        const _traitTextRow = (lbl) =>
            `<div class="lo-bonus-row"><span class="lo-bonus-lbl" style="color:rgba(255,209,102,0.7);">${lbl}</span></div>`;
        const _traitStatRow = (lbl, val, cls) =>
            `<div class="lo-bonus-row"><span class="lo-bonus-lbl">${lbl}</span><span class="lo-bonus-val ${cls}" style="color:#ffd166;">${val}</span></div>`;

        if (_ch === 'light') {
            const lFilled = loadout.L && loadout.L !== 'none';
            const rFilled = loadout.R && loadout.R !== 'none';
            const _dualWield = lFilled && rFilled && loadout.L === loadout.R;
            const _oneArm = (lFilled ? 1 : 0) + (rFilled ? 1 : 0) === 1;
            if (_dualWield) {
                _traitRows.push(`<div class="lo-bonus-row"><span class="lo-bonus-lbl">DAMAGE</span><span class="lo-bonus-val neg" style="color:#ff4d6a;">-15%</span></div>`);
                _traitRows.push(`<div class="lo-bonus-row"><span class="lo-bonus-lbl">FIRE RATE</span><span class="lo-bonus-val neg" style="color:#ff4d6a;">-15%</span></div>`);
            }
            _traitRows.push(_traitStatRow('Move Speed % < 50% HP', '+15%', 'pos'));
            if (_oneArm) {
                _traitRows.push(_traitStatRow('Move Speed %', '+10%', 'pos'));
                _traitRows.push(_traitStatRow('Dodge %', '+10%', 'pos'));
            }
        } else if (_ch === 'medium') {
            _traitRows.push(_traitStatRow('Mod Duration %', '+15%', 'pos'));
            _traitRows.push(_traitStatRow('Mod Cooldown %', '+15%', 'pos'));
            _traitRows.push(_traitStatRow('Shield Regen %', '+15%', 'pos'));
            _traitRows.push(_traitStatRow('Shield Absorb %', '+15%', 'pos'));
            _traitRows.push(_traitStatRow('Kill Recharge', '-0.5s', 'pos'));
        } else if (_ch === 'heavy') {
            _traitRows.push(_traitStatRow('Damage Reduction', '+15%', 'pos'));
            _traitRows.push(_traitStatRow('Damage Reduction < 50% HP', '+15%', 'pos'));
        }

        if (_traitRows.length) {
            gHtml += `<div class="bsub" style="color:#ffd166;margin-top:12px;">CHASSIS TRAITS</div>`;
            gHtml += _traitRows.join('');
        }
    }

    gearInfo.innerHTML = gHtml;
}

/** Populates the unified two-column loadout overlay (v5.64). */
function populateLoadout() {
    if (typeof _updateCampaignXPBar === 'function') _updateCampaignXPBar();
    _renderHullBars();
    _renderGearBonusesPanel();
    populateInventory();
    const perksSection = document.getElementById('lo-perks-section');
    if (_gameMode === 'simulation') {
        _renderActivePerksPanel();
        if (perksSection) perksSection.style.display = '';
    } else {
        if (perksSection) perksSection.style.display = 'none';
    }
    _renderWeaponBar();
    _loRefreshColorSwatch();
    _loRefreshXhColorSwatch();
}

// ── Loadout top bar color picker ──────────────────────────────────
let _loColDDOpen = false;
let _loColDDOutsideHandler = null;

function _loCloseColorDD() {
    _loColDDOpen = false;
    document.getElementById('lo-col-list')?.classList.remove('dd-list-open');
    document.getElementById('lo-col-sel')?.classList.remove('dd-open');
    if (_loColDDOutsideHandler) {
        document.removeEventListener('click', _loColDDOutsideHandler, true);
        _loColDDOutsideHandler = null;
    }
}

function _loToggleColorDD() {
    if (_loColDDOpen) { _loCloseColorDD(); return; }
    _loColDDOpen = true;
    _loBuildColorDD();
    document.getElementById('lo-col-list')?.classList.add('dd-list-open');
    document.getElementById('lo-col-sel')?.classList.add('dd-open');
    setTimeout(() => {
        _loColDDOutsideHandler = (e) => {
            if (!e.target.closest('#lo-color-picker')) _loCloseColorDD();
        };
        document.addEventListener('click', _loColDDOutsideHandler, true);
    }, 0);
}

function _loBuildColorDD() {
    const list = document.getElementById('lo-col-list');
    if (!list) return;
    list.innerHTML = '';
    const curHex = (loadout.color || 0).toString(16).padStart(6, '0').toLowerCase();
    (typeof COLOR_OPTIONS !== 'undefined' ? COLOR_OPTIONS : []).forEach(opt => {
        const div = document.createElement('div');
        div.className = 'dd-option dd-color-opt' + (opt.key === curHex ? ' dd-active' : '');
        div.innerHTML = `<div class="do-header">
            <span class="do-color-swatch" style="background:${opt.hex6};box-shadow:0 0 6px ${opt.hex6}55;"></span>
            <span class="do-name">${opt.label}</span>
        </div>`;
        div.onclick = () => {
            loadout.color = opt.hex;
            _loCloseColorDD();
            _loRefreshColorSwatch();
            if (typeof refreshMechColor === 'function') refreshMechColor();
            if (typeof saveCampaignState === 'function') saveCampaignState();
        };
        list.appendChild(div);
    });
}

function _loRefreshColorSwatch() {
    const picker = document.getElementById('lo-color-picker');
    if (!picker) return;
    picker.style.display = _gameMode === 'campaign' ? 'block' : 'none';
    if (_gameMode !== 'campaign') return;
    const curHex = (loadout.color || 0).toString(16).padStart(6, '0').toLowerCase();
    const opt = (typeof COLOR_OPTIONS !== 'undefined' ? COLOR_OPTIONS : []).find(o => o.key === curHex);
    const swatchEl = document.getElementById('lo-col-swatch');
    const labelEl  = document.getElementById('lo-col-label');
    if (swatchEl) swatchEl.style.background = opt ? opt.hex6 : '#888';
    if (labelEl)  labelEl.textContent = 'CHASSIS';
}

// ── Loadout top bar crosshair color picker ────────────────────────
let _loXhColDDOpen = false;
let _loXhColDDOutsideHandler = null;

function _loCloseXhColorDD() {
    _loXhColDDOpen = false;
    document.getElementById('lo-xhcol-list')?.classList.remove('dd-list-open');
    document.getElementById('lo-xhcol-sel')?.classList.remove('dd-open');
    if (_loXhColDDOutsideHandler) {
        document.removeEventListener('click', _loXhColDDOutsideHandler, true);
        _loXhColDDOutsideHandler = null;
    }
}

function _loToggleXhColorDD() {
    if (_loXhColDDOpen) { _loCloseXhColorDD(); return; }
    _loXhColDDOpen = true;
    _loBuildXhColorDD();
    document.getElementById('lo-xhcol-list')?.classList.add('dd-list-open');
    document.getElementById('lo-xhcol-sel')?.classList.add('dd-open');
    setTimeout(() => {
        _loXhColDDOutsideHandler = (e) => {
            if (!e.target.closest('#lo-xh-color-picker')) _loCloseXhColorDD();
        };
        document.addEventListener('click', _loXhColDDOutsideHandler, true);
    }, 0);
}

function _loBuildXhColorDD() {
    const list = document.getElementById('lo-xhcol-list');
    if (!list) return;
    list.innerHTML = '';
    const curHex = (loadout.crosshairColor || 0xffffff).toString(16).padStart(6, '0').toLowerCase();
    (typeof CROSSHAIR_COLOR_OPTIONS !== 'undefined' ? CROSSHAIR_COLOR_OPTIONS : []).forEach(opt => {
        const div = document.createElement('div');
        div.className = 'dd-option dd-color-opt' + (opt.key === curHex ? ' dd-active' : '');
        div.innerHTML = `<div class="do-header">
            <span class="do-color-swatch" style="background:${opt.hex6};box-shadow:0 0 6px ${opt.hex6}55;"></span>
            <span class="do-name">${opt.label}</span>
        </div>`;
        div.onclick = () => {
            loadout.crosshairColor = opt.hex;
            try { localStorage.setItem('tw_crosshair_color', opt.key); } catch(e) {}
            _loCloseXhColorDD();
            _loRefreshXhColorSwatch();
            if (typeof saveCampaignState === 'function') saveCampaignState();
        };
        list.appendChild(div);
    });
}

function _loRefreshXhColorSwatch() {
    const picker = document.getElementById('lo-xh-color-picker');
    if (!picker) return;
    picker.style.display = _gameMode === 'campaign' ? 'block' : 'none';
    if (_gameMode !== 'campaign') return;
    const curHex = (loadout.crosshairColor || 0xffffff).toString(16).padStart(6, '0').toLowerCase();
    const opt = (typeof CROSSHAIR_COLOR_OPTIONS !== 'undefined' ? CROSSHAIR_COLOR_OPTIONS : []).find(o => o.key === curHex);
    const swatchEl = document.getElementById('lo-xhcol-swatch');
    const labelEl  = document.getElementById('lo-xhcol-label');
    if (swatchEl) swatchEl.style.background = opt ? opt.hex6 : '#888';
    if (labelEl)  labelEl.textContent = 'CROSSHAIR';
}

/** Populates #lo-traits-bar with chassis traits and #lo-weapon-bar with weapon stats. */
function _renderWeaponBar() {
    // ── Chassis traits bar (top of center column) ─────────────
    const traitsEl = document.getElementById('lo-traits-bar');
    if (traitsEl) {
        const ch = loadout.chassis;
        const _cTraits = ch === 'light'
            ? [['Dual-Wield','−15% damage and −15% fire rate when both arms have the same weapon (matching pair only)'],
               ['Lightweight','+15% move speed when core HP is below 50%'],
               ['Agility','+10% move speed and +10% dodge chance when only one arm has a weapon']]
            : ch === 'medium'
            ? [['Mod Specialist','+15% mod duration and −15% mod cooldown on all mods'],
               ['Shield Specialist','+15% shield regen rate and +15% shield absorb'],
               ['Kill Recharge','Each kill reduces active mod cooldown by 0.5s']]
            : [['Improved Armor','15% damage reduction at all times (passive)'],
               ['Attrition','+15% additional damage reduction when core HP is below 50%'],
               ['Iron Legs','Ignore the speed penalty from destroyed legs']];
        let traitHtml = '';
        _cTraits.forEach(([name, desc], i) => {
            if (i > 0) traitHtml += `<div class="lo-wb-divider"></div>`;
            traitHtml += `<div class="lo-trait-inline"><div class="lo-trait-name">${name}</div><div class="lo-trait-desc">${desc}</div></div>`;
        });
        traitsEl.innerHTML = traitHtml;
    }

    // ── Weapon bar (bottom of center column) ──────────────────
    const el = document.getElementById('lo-weapon-bar');
    if (!el) return;
    const _gDmgFlat = (_gearState?.dmgFlat   || 0);
    const _gDmgPct  = (_gearState?.dmgPct    || 0);
    const _gRldPct  = (_gearState?.fireRatePct || 0);

    const _wbItem = (label, key) => {
        if (!key || key === 'none') return null;
        const w = WEAPONS[key];
        if (!w) return null;
        let h = `<div class="lo-wb-item">`;
        h += `<div style="font-size:8px;letter-spacing:2px;color:rgba(255,255,255,0.45);margin-bottom:2px;">${label}</div>`;
        h += `<div style="font-size:12px;letter-spacing:1px;color:var(--sci-cyan);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${WEAPON_NAMES[key] || w.name}</div>`;
        if (w.dmg) {
            // Chassis trait: Dual-Wield (Light) — same weapon in both arms → −15% dmg, −15% fire rate
            const _isDualWield = loadout.chassis === 'light' && loadout.L === loadout.R && loadout.L !== 'none';
            const _dwDmgMult    = _isDualWield ? 0.85 : 1.0;
            const _dwReloadMult = _isDualWield ? 1.15 : 1.0;
            // Brace bonus: when the opposite arm is empty → +25% dmg, +15% fire rate (0.85× reload time)
            const _otherArmKey  = label === 'L ARM' ? loadout.R : (label === 'R ARM' ? loadout.L : null);
            const _isArm        = _otherArmKey !== null;
            const _braceDmgMult = _isArm && (!_otherArmKey || _otherArmKey === 'none') ? 1.25 : 1.0;
            const _braceMult    = _isArm && (!_otherArmKey || _otherArmKey === 'none') ? 0.85 : 1.0;
            // Unique item effect: Dual Reload — 30% faster reload when both arms equipped
            const _dualRldMult  = 1 - (typeof getDualReloadBonus === 'function' ? getDualReloadBonus() : 0);
            const effDmg = Math.round((w.dmg + _gDmgFlat) * (_perkState.dmgMult||1) * (1 + _gDmgPct/100) * _dwDmgMult * _braceDmgMult);
            // _gRldPct = _gearState.fireRatePct (negative = faster); 1 + (−0.05) = 0.95 × fireRate = faster
            const effRld = Math.round((w.fireRate||0) * (_perkState.reloadMult||1) * (1 + _gRldPct/100) * _dwReloadMult * _dualRldMult * _braceMult);
            const effDps = effRld > 0 ? Math.round(effDmg / effRld * 1000) : 0;
            const effFr = effRld > 0 ? (1000 / effRld).toFixed(1) : '0.0';
            h += `<div style="font-size:9px;color:rgba(255,255,255,0.45);">DMG <span style="color:rgba(255,255,255,0.88);">${effDmg}</span> &middot; DPS <span style="color:rgba(255,255,255,0.88);">${effDps}</span> &middot; FR <span style="color:rgba(255,255,255,0.88);">${effFr}/s</span></div>`;
        } else if (w.cooldown) {
            h += `<div style="font-size:9px;color:rgba(255,255,255,0.45);">Cooldown <span style="color:rgba(255,255,255,0.88);">${(w.cooldown/1000).toFixed(1)}s</span></div>`;
        }
        h += `</div>`;
        return h;
    };

    const items = [
        _wbItem('L ARM', loadout.L),
        _wbItem('R ARM', loadout.R),
        _wbItem('CPU MOD', loadout.cpu),
    ].filter(Boolean);

    if (items.length === 0) {
        el.innerHTML = '<div class="lo-wb-item" style="opacity:0.3;font-size:9px;color:rgba(255,255,255,0.45);">No weapons armed</div>';
    } else {
        el.innerHTML = items.join('<div class="lo-wb-divider"></div>');
    }
}

/** Canonical stat key → player-facing display name. Used by all item cards, hover cards, and comparison views. */
const STAT_DISPLAY_NAMES = {
    dmg:'Damage', dmgFlat:'Damage', dmgPct:'Damage %',
    critChance:'Crit Chance %', critDmg:'Crit Damage %',
    fireRate:'Fire Rate', reload:'Fire Rate', fireRatePct:'Fire Rate %',
    coreHP:'Core HP', armHP:'Arm HP', legHP:'Leg HP', allHP:'All HP',
    dr:'Damage Reduction %',
    shieldHP:'Shield HP', shieldRegen:'Shield Regen %', shieldAbsorb:'Shield Absorb %', maxShield:'Shield HP',
    dodgePct:'Dodge %', speedPct:'Move Speed %',
    modCdPct:'Mod Cooldown %', modEffPct:'Mod Duration %', cooldown:'Mod Cooldown',
    lootMult:'Loot Quality %', autoRepair:'Auto Repair',
    pellets:'Pellets', splashRadius:'Blast Radius %',
    range:'Range', radius:'Blast Radius', burst:'Burst Count',
};
/** Converts a camelCase key to Title Case with spaces as a fallback display label. */
function _camelToTitle(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}
/** Builds hover card HTML for any item. */
const _hoverInvertedStats = new Set(['fireRatePct','modCdPct']);
const _pctStats = new Set(['dmgPct','critChance','critDmg','fireRatePct','dodgePct','speedPct','modCdPct','modEffPct','shieldAbsorb','shieldRegen','splashRadius','lootMult','dr']);

function _buildSingleCardHtml(item, slotLabel) {
    const rd = RARITY_DEFS[item.rarity] || { colorStr: UI_COLORS.text60, label: 'Common' };
    let html = '';
    if (slotLabel) html += `<div style="font-size:8px;letter-spacing:2px;color:rgba(255,255,255,0.45);margin-bottom:3px;">${slotLabel}</div>`;
    html += `<div style="font-size:12px;letter-spacing:1px;color:${rd.colorStr};margin-bottom:4px;">${(item.baseType === 'weapon' ? WEAPON_NAMES[item.subType] : null) || item.name}</div>`;
    html += `<div style="font-size:8px;letter-spacing:1px;color:${rd.colorStr};opacity:0.6;margin-bottom:6px;">${rd.label||item.rarity}${item.iLvl ? ' · iLvl '+item.iLvl : ''}</div>`;
    const hasStats = item.baseStats && Object.values(item.baseStats).some(v => v);
    const hasAffixes = item.affixes && item.affixes.length > 0;
    if (hasStats) {
        Object.entries(item.baseStats).forEach(([k, v]) => {
            if (!v) return;
            const isInv = _hoverInvertedStats.has(k);
            const valColor = isInv ? (v < 0 ? '#00ff88' : '#ff4d6a') : '#00ff88';
            let displayVal;
            if (k === 'fireRate' || k === 'reload') {
                displayVal = (1000 / v).toFixed(1) + '/sec';
            } else if (k === 'cooldown') {
                displayVal = v + 's';
            } else if (_pctStats.has(k)) {
                displayVal = isInv ? (v < 0 ? '+' : '-') + Math.abs(v) + '%' : '+' + v + '%';
            } else {
                displayVal = isInv ? (v < 0 ? '+' : '-') + Math.abs(v) : '+' + String(v);
            }
            html += `<div style="display:flex;justify-content:space-between;font-size:9px;padding:1px 0;"><span style="color:rgba(255,255,255,0.45);">${STAT_DISPLAY_NAMES[k] || _camelToTitle(k)}</span><span style="color:${valColor};">${displayVal}</span></div>`;
        });
    }
    if (hasAffixes) {
        item.affixes.forEach(a => {
            const lbl = a.label || '';
            const isInvertedAffix = /reload|cooldown/i.test(lbl);
            const fixedLbl = (isInvertedAffix && lbl.startsWith('-')) ? '+' + lbl.slice(1) : lbl;
            const m = fixedLbl.match(/^([+\-][\d.]+%?)\s+(.+)$/);
            if (m) {
                html += `<div style="display:flex;justify-content:space-between;font-size:9px;padding:1px 0;margin-top:2px;"><span style="color:rgba(255,255,255,0.45);">${m[2]}</span><span style="color:#00ff88;">${m[1]}</span></div>`;
            } else {
                html += `<div style="font-size:9px;color:#00ff88;margin-top:2px;">${fixedLbl}</div>`;
            }
        });
    }
    if (item.isUnique && item.uniqueLabel) {
        const parts = item.uniqueLabel.split(': ');
        const uName = parts[0] || '';
        const uDesc = parts.slice(1).join(': ') || '';
        html += `<div class="lo-hover-trait">`;
        html += `<div class="lo-hover-trait-hdr">✦ UNIQUE EFFECT</div>`;
        html += `<div class="lo-hover-trait-name">${uName}</div>`;
        if (uDesc) html += `<div class="lo-hover-trait-desc">${uDesc}</div>`;
        html += `</div>`;
    }
    if (item.legendaryTrait && typeof _perks !== 'undefined' && _perks[item.legendaryTrait]) {
        const tp = _perks[item.legendaryTrait];
        html += `<div class="lo-hover-trait">`;
        html += `<div class="lo-hover-trait-hdr">✦ LEGENDARY TRAIT</div>`;
        html += `<div class="lo-hover-trait-name">${tp.label || item.legendaryTrait}</div>`;
        if (tp.desc) html += `<div class="lo-hover-trait-desc">${tp.desc}</div>`;
        html += `</div>`;
    }
    return html;
}

function _buildHoverHtml(item, slotLabel, compareItem, leftLabel) {
    if (!compareItem) return _buildSingleCardHtml(item, slotLabel);

    const _rdItem = RARITY_DEFS[item.rarity] || { colorStr: UI_COLORS.text60 };
    const _rdCmp  = RARITY_DEFS[compareItem.rarity] || { colorStr: UI_COLORS.text60 };

    // Builds one column's content (source label + slot label + name + stats + affixes + unique)
    const _mkCol = (colItem, sourceLbl, colSlotLabel) => {
        const rd = RARITY_DEFS[colItem.rarity] || { colorStr: UI_COLORS.text60, label: 'Common' };
        let h = `<div class="lo-hover-source-lbl" style="color:${rd.colorStr};">${sourceLbl}</div>`;
        if (colSlotLabel) h += `<div style="font-size:8px;letter-spacing:2px;color:rgba(255,255,255,0.45);margin-bottom:3px;">${colSlotLabel}</div>`;
        h += `<div style="font-size:13px;letter-spacing:1px;color:${rd.colorStr};margin-bottom:4px;">${(colItem.baseType === 'weapon' ? WEAPON_NAMES[colItem.subType] : null) || colItem.name}</div>`;
        h += `<div style="font-size:9px;letter-spacing:1px;color:${rd.colorStr};opacity:0.6;margin-bottom:6px;">${rd.label||colItem.rarity}${colItem.iLvl ? ' · iLvl '+colItem.iLvl : ''}</div>`;
        const hasStats = colItem.baseStats && Object.values(colItem.baseStats).some(v => v);
        const hasAffixes = colItem.affixes && colItem.affixes.length > 0;
        if (hasStats) {
            Object.entries(colItem.baseStats).forEach(([k, v]) => {
                if (!v) return;
                const isInv = _hoverInvertedStats.has(k);
                const valColor = isInv ? (v < 0 ? '#00ff88' : '#ff4d6a') : '#00ff88';
                let displayVal;
                if (k === 'fireRate' || k === 'reload') {
                    displayVal = (1000 / v).toFixed(1) + '/sec';
                } else if (k === 'cooldown') {
                    displayVal = v + 's';
                } else if (_pctStats.has(k)) {
                    displayVal = isInv ? (v < 0 ? '+' : '-') + Math.abs(v) + '%' : '+' + v + '%';
                } else {
                    displayVal = isInv ? (v < 0 ? '+' : '-') + Math.abs(v) : '+' + String(v);
                }
                h += `<div style="display:flex;justify-content:space-between;font-size:9px;padding:1px 0;"><span style="color:rgba(255,255,255,0.45);">${STAT_DISPLAY_NAMES[k] || _camelToTitle(k)}</span><span style="color:${valColor};">${displayVal}</span></div>`;
            });
        }
        if (hasAffixes) {
            colItem.affixes.forEach(a => {
                const lbl = a.label || '';
                const isInvertedAffix = /reload|cooldown/i.test(lbl);
                const fixedLbl = (isInvertedAffix && lbl.startsWith('-')) ? '+' + lbl.slice(1) : lbl;
                const m = fixedLbl.match(/^([+\-][\d.]+%?)\s+(.+)$/);
                if (m) {
                    h += `<div style="display:flex;justify-content:space-between;font-size:9px;padding:1px 0;margin-top:2px;"><span style="color:rgba(255,255,255,0.45);">${m[2]}</span><span style="color:#00ff88;">${m[1]}</span></div>`;
                } else {
                    h += `<div style="font-size:9px;color:#00ff88;margin-top:2px;">${fixedLbl}</div>`;
                }
            });
        }
        if (colItem.isUnique && colItem.uniqueLabel) {
            const parts = colItem.uniqueLabel.split(': ');
            const uName = parts[0] || '';
            const uDesc = parts.slice(1).join(': ') || '';
            h += `<div class="lo-hover-trait">`;
            h += `<div class="lo-hover-trait-hdr">✦ UNIQUE EFFECT</div>`;
            h += `<div class="lo-hover-trait-name">${uName}</div>`;
            if (uDesc) h += `<div class="lo-hover-trait-desc">${uDesc}</div>`;
            h += `</div>`;
        }
        if (colItem.legendaryTrait && typeof _perks !== 'undefined' && _perks[colItem.legendaryTrait]) {
            const tp = _perks[colItem.legendaryTrait];
            h += `<div class="lo-hover-trait">`;
            h += `<div class="lo-hover-trait-hdr">✦ LEGENDARY TRAIT</div>`;
            h += `<div class="lo-hover-trait-name">${tp.label || colItem.legendaryTrait}</div>`;
            if (tp.desc) h += `<div class="lo-hover-trait-desc">${tp.desc}</div>`;
            h += `</div>`;
        }
        h += `<div class="cmp-spacer"></div>`;
        return h;
    };

    let html = `<div class="lo-hover-cmp-card">`;
    html += '<div class="lo-hover-cmp-cols">';
    html += `<div class="lo-hover-cmp-col lo-hover-cmp-left" style="border:1px solid var(--sci-cyan-border);">${_mkCol(compareItem, 'EQUIPPED', slotLabel || '')}</div>`;
    html += `<div class="lo-hover-cmp-col" style="border:1px solid var(--sci-cyan-border);">${_mkCol(item, leftLabel || 'BACKPACK', slotLabel)}</div>`;
    html += '</div>';

    // Diff section — build combined stats (base + affixes) for accurate net totals
    const _newCombined = { ...(item.baseStats||{}) };
    (item.affixes||[]).forEach(a => { if (a.stat) _newCombined[a.stat] = (_newCombined[a.stat]||0) + a.value; });
    const _oldCombined = { ...(compareItem.baseStats||{}) };
    (compareItem.affixes||[]).forEach(a => { if (a.stat) _oldCombined[a.stat] = (_oldCombined[a.stat]||0) + a.value; });
    const allKeys = new Set([...Object.keys(_newCombined), ...Object.keys(_oldCombined)]);
    let diffHtml = '';
    allKeys.forEach(k => {
        const nv = _newCombined[k] || 0;
        const ov = _oldCombined[k] || 0;
        if (k === 'fireRate' || k === 'reload') {
            if (!nv || !ov) return;
            const spsDiff = (1000 / nv) - (1000 / ov);
            if (Math.abs(spsDiff) < 0.05) return;
            const color = spsDiff > 0 ? '#00ff88' : '#ff4d6a';
            const sign = spsDiff > 0 ? '+' : '';
            diffHtml += `<div class="lo-hover-diff-row"><span class="lo-hover-diff-lbl">${STAT_DISPLAY_NAMES[k] || _camelToTitle(k)}</span><span style="color:${color};">${sign}${spsDiff.toFixed(1)}/sec</span></div>`;
            return;
        }
        const diff = nv - ov;
        if (diff === 0) return;
        const isInverted = _hoverInvertedStats.has(k);
        const isGood = isInverted ? diff < 0 : diff > 0;
        const color = isGood ? '#00ff88' : '#ff4d6a';
        // For inverted stats, flip sign so player sees the benefit (e.g. -15 fireRatePct → "+15%")
        const displayDiff = isInverted ? -diff : diff;
        const diffDisplay = (displayDiff > 0 ? '+' : '') + displayDiff + (_pctStats.has(k) ? '%' : '');
        diffHtml += `<div class="lo-hover-diff-row"><span class="lo-hover-diff-lbl">${STAT_DISPLAY_NAMES[k] || _camelToTitle(k)}</span><span style="color:${color};">${diffDisplay}</span></div>`;
    });
    if (diffHtml) {
        html += '<div class="lo-hover-cmp-diff" style="border-left:1px solid var(--sci-cyan-border);border-right:1px solid var(--sci-cyan-border);border-bottom:1px solid var(--sci-cyan-border);">';
        html += '<div class="lo-hover-diff-hdr">Changes if equipped</div>';
        html += diffHtml;
        html += '</div>';
    }
    html += '</div>';
    return html;
}

/** Shows a hover card for an equipment or backpack slot. */
function _showSlotHover(el, slotKey, itemOverride) {
    const card = document.getElementById('eq-hover-card');
    if (!card) return;
    _hoverActiveEl = el;
    _hoverActiveSlotKey = slotKey;
    _hoverActiveItem = itemOverride || (_equipped && _equipped[slotKey]) || null;
    const _slotNames = { L:'Weapon', R:'Weapon', armor:'Armor', arms:'Arms', legs:'Legs', shield:'Shield', cpu:'CPU Mod', augment:'Augment' };

    let item, slotLabel, compareItem;
    if (itemOverride) {
        // Backpack item passed directly
        item = itemOverride;
        const bpSlotNames = { weapon:'Weapon', cpu_system:'CPU', aug_system:'Augment',
            shield_system:'Shield', leg_system:'Legs', armor:'Armor', arms:'Arms',
            legs:'Legs', shield:'Shield', cpu:'CPU', augment:'Augment' };
        slotLabel = bpSlotNames[item.baseType] || item.baseType || '';
        // Find equipped item for same slot to compare
        // Weapon detection: check baseType first, then fall back to subType lookup for robustness
        const _isWeaponItem = item.baseType === 'weapon' ||
            (item.subType && typeof WEAPONS !== 'undefined' && !!WEAPONS[item.subType]);
        if (_isWeaponItem) {
            // Default L arm; Shift switches to R arm
            const _hoverArm = _shiftHeld ? 'R' : 'L';
            const _hoverAlt = _shiftHeld ? 'L' : 'R';
            if (_equipped && _equipped[_hoverArm]) {
                compareItem = _equipped[_hoverArm];
            } else if (_equipped && _equipped[_hoverAlt]) {
                compareItem = _equipped[_hoverAlt];
            }
        } else {
            // Use _getSlotForItem which correctly maps all non-weapon item types
            const eqKey = (typeof _getSlotForItem === 'function') ? _getSlotForItem(item) : null;
            if (eqKey && _equipped && _equipped[eqKey]) {
                compareItem = _equipped[eqKey];
            }
        }
    } else {
        // Equipped slot by key
        item = _equipped && _equipped[slotKey];
        slotLabel = _slotNames[slotKey] || slotKey;
    }
    if (!item) { card.style.display = 'none'; return; }

    const isCompare = !!compareItem;
    const _rdBorder = RARITY_DEFS[item.rarity] || { colorStr: UI_COLORS.text60 };
    card.innerHTML = _buildHoverHtml(item, slotLabel, compareItem);
    card.style.display = 'block';
    card.style.width = isCompare ? 'auto' : '200px';
    card.style.padding = isCompare ? '0' : '';
    card.style.border = isCompare ? 'none' : '';
    card.style.borderColor = isCompare ? '' : _rdBorder.colorStr;

    // Position: use fixed positioning relative to viewport
    const overlay = document.getElementById('stats-overlay');
    if (!overlay || !el) return;
    const or = overlay.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const margin = 8;

    // Render offscreen briefly to measure actual dimensions
    card.style.position = 'fixed';
    card.style.left = '-9999px';
    card.style.top = '0';
    const cardW = card.offsetWidth;
    const cardH = card.offsetHeight;

    // Determine left/right: prefer right of slot, flip if clipped
    let left;
    const isRightSide = er.left > (or.left + or.width / 2);
    if (isRightSide) {
        // Slot is on right half — show card to left
        left = er.left - cardW - margin;
        if (left < or.left) left = er.right + margin;
    } else {
        // Slot is on left half — show card to right
        left = er.right + margin;
        if (left + cardW > window.innerWidth) left = er.left - cardW - margin;
    }
    // Clamp horizontal
    if (left < 0) left = 4;
    if (left + cardW > window.innerWidth) left = window.innerWidth - cardW - 4;

    // Determine top: default align top of card with top of slot
    let top = er.top;
    // If card would overflow bottom, anchor upward
    if (top + cardH > window.innerHeight - 8) {
        top = er.bottom - cardH;
    }
    // Clamp vertical
    if (top < 4) top = 4;

    card.style.left = left + 'px';
    card.style.top = top + 'px';
}

function _hideSlotHover() {
    _hoverActiveEl = null;
    _hoverActiveSlotKey = null;
    _hoverActiveItem = null;
    const card = document.getElementById('eq-hover-card');
    if (card) {
        card.style.display = 'none';
        card.style.position = 'absolute';
        card.style.width = '';
        card.style.padding = '';
        card.style.border = '';
        card.style.borderColor = '';
    }
}

// ═══════════ LEADERBOARD ═══════════

async function showLeaderboard() {
    const overlay = document.getElementById('leaderboard-overlay');
    overlay.style.display = 'block';

    // Show loading, hide table/empty while fetching
    document.getElementById('lb-loading').style.display = 'block';
    document.getElementById('lb-table').innerHTML       = '';
    document.getElementById('lb-empty').style.display   = 'none';

    // Load once, use for both the notice and the table
    const scores = await _loadScores();

    // Reset filter tabs to 'all'
    _lbCurrentFilter = 'all';
    document.querySelectorAll('.lb-filter-tab').forEach(t => t.classList.remove('active'));
    const allTab = document.querySelector('.lb-filter-tab');
    if (allTab) allTab.classList.add('active');

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

let _lbAllScores    = [];
let _lbCurrentFilter = 'all';

function _renderScores(scores, filtered) {
    const loading = document.getElementById('lb-loading');
    const table   = document.getElementById('lb-table');
    const empty   = document.getElementById('lb-empty');

    loading.style.display = 'none';

    // Store master list for filter re-renders
    if (!filtered) _lbAllScores = scores || [];

    const display = filtered || _lbAllScores;

    if (!display || display.length === 0) {
        table.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    const sorted = _sortScores([...display]);
    const frag   = document.createDocumentFragment();

    sorted.forEach((e, i) => {
        const rank   = i + 1;
        const isMe   = _playerCallsign && e.name === _playerCallsign;

        // Coerce numeric fields — never interpolate raw DB values as HTML
        const safeRound = Math.round(Number(e.round) || 0);
        const safeKills = Math.round(Number(e.kills) || 0);

        // Sanitize string fields with textContent (not innerHTML)
        const safeName = _sanitizeCallsign(e.name || 'UNKNOWN');
        const safeMode = _sanitizeCallsign(e.mode || e.chassis || '?');

        const row = document.createElement('div');
        row.className = 'lb-row' + (isMe ? ' lb-me' : '');

        // Rank cell
        const rankEl = document.createElement('div');
        rankEl.className = 'lb-rank' + (rank <= 3 ? ' top' : '');
        rankEl.textContent = String(rank).padStart(2, '0');
        row.appendChild(rankEl);

        // Callsign cell
        const nameEl = document.createElement('div');
        nameEl.className = 'lb-callsign';
        nameEl.textContent = safeName;
        if (isMe) {
            const tag = document.createElement('span');
            tag.className = 'lb-you-tag';
            tag.textContent = 'YOU';
            nameEl.appendChild(tag);
        }
        row.appendChild(nameEl);

        // Round cell
        const roundEl = document.createElement('div');
        roundEl.className = 'lb-val hi';
        roundEl.style.textAlign = 'right';
        roundEl.textContent = safeRound;
        row.appendChild(roundEl);

        // Kills cell
        const killsEl = document.createElement('div');
        killsEl.className = 'lb-val';
        killsEl.style.textAlign = 'right';
        killsEl.textContent = safeKills;
        row.appendChild(killsEl);

        // Mode cell
        const modeEl = document.createElement('div');
        modeEl.className = 'lb-val';
        modeEl.style.textAlign = 'right';
        modeEl.style.fontSize  = '9px';
        modeEl.textContent = safeMode;
        row.appendChild(modeEl);

        frag.appendChild(row);
    });

    table.innerHTML = '';
    table.appendChild(frag);
}

function _lbSetFilter(type, el) {
    // Update tab active state
    document.querySelectorAll('.lb-filter-tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    _lbCurrentFilter = type;

    // Filter the stored scores
    let filtered;
    if (type === 'all') {
        filtered = _lbAllScores;
    } else if (type === 'warzone') {
        filtered = _lbAllScores.filter(s => !s.mode || s.mode === 'simulation' || s.mode === 'warzone');
    } else if (type === 'campaign') {
        filtered = _lbAllScores.filter(s => s.mode === 'campaign');
    } else {
        filtered = _lbAllScores;
    }

    _renderScores(null, filtered);
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

    // Ensure physics and time are running before the tween starts.
    // showDeathScreen() pauses them but sets _isPaused=false, so returnToHangar()
    // may not resume them. Resume unconditionally here so the tween environment is clean.
    try { scene.physics.resume(); } catch(e) {}
    try { scene.time.paused = false; } catch(e) {}

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
            // Ghost Protocol keystone (Light): 2s passive invis on deploy + first-attack 3x
            if (typeof isKeystoneAllocated === 'function' && isKeystoneAllocated('node_215') && loadout.chassis === 'light') {
                if (torso) torso.setAlpha(0.15);
                player._ghostProtocolActive = true;
                player._ghostProtocolFirstShot = true;
                GAME.scene.scenes[0].time.delayedCall(2000, () => {
                    player._ghostProtocolActive = false;
                    if (torso?.active) torso.setAlpha(1.0);
                });
            }
            const sc = GAME.scene.scenes[0];
            // PVP uses its own deploy path (mpDeployPVP) — skip PvE round system entirely
            if (_gameMode !== 'pvp') {
                // Kick off round system on first deploy / respawn
                // Campaign uses boss HP bars / mission UI — round-hud is hidden there
                if (_gameMode !== 'campaign') {
                    document.getElementById('round-hud').style.display = 'flex';
                }
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
    if (_savedCpu !== null) { loadout.cpu = _savedCpu; _savedCpu = null; }
    if (_savedAug !== null) { loadout.aug = _savedAug; _savedAug = null; }
    if (_savedLeg !== null) { loadout.leg = _savedLeg; _savedLeg = null; }
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
