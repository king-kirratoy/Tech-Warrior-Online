// ═══════════ GLOBAL EVENT LISTENERS ═══════════
// All top-level addEventListener calls that were previously at the bottom
// of index.html's inline <script> block. Loaded after multiplayer.js so
// every referenced function (menus.js, garage.js, perks.js, multiplayer.js,
// campaign-system.js, state.js) is guaranteed to be defined.

// ── Window resize ─────────────────────────────────────────────────
// Resize the Phaser canvas whenever the browser window size changes.
// Without this the canvas stays at its initial dimensions after any resize.
window.addEventListener('resize', function _onWindowResize() {
    if (GAME && GAME.scale) {
        try { GAME.scale.resize(window.innerWidth, window.innerHeight); } catch(e) {}
    }
});

// ── Dropdown close on outside click ───────────────────────────────
// Close dropdowns when clicking outside (skip PVP hangar dropdowns — they have their own handler)
document.addEventListener('click', e => {
    if (!e.target.closest('.dd-wrap') && !e.target.closest('.pvp-dd-wrap') && !e.target.closest('#pvp-hangar')) closeAllDD();
});

// ── Main keydown handler ───────────────────────────────────────────
// ESC key handler for pause menu + T for PVP chat + overlay close handling
document.addEventListener('keydown', function(e) {
    // ── Perk menu: number keys 1–4 pick a perk ───────────────────
    if (document.getElementById('perk-menu')?.style.display === 'flex') {
        const idx = parseInt(e.key) - 1;
        if (!isNaN(idx) && idx >= 0 && idx < _currentPerkKeys.length) {
            e.preventDefault();
            pickPerk(_currentPerkKeys[idx], _currentPerkNextRound);
            return;
        }
        // Arrow keys to cycle focus between cards
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const cards = document.querySelectorAll('#perk-cards .perk-card');
            if (!cards.length) return;
            let cur = Array.from(cards).indexOf(document.activeElement);
            if (cur === -1) cur = 0;
            else cur = e.key === 'ArrowRight' ? (cur + 1) % cards.length : (cur - 1 + cards.length) % cards.length;
            cards[cur].focus();
            return;
        }
        // Enter confirms the focused card
        if (e.key === 'Enter') {
            const focused = document.activeElement;
            if (focused?.classList.contains('perk-card')) { e.preventDefault(); focused.click(); }
            return;
        }
        return; // consume all keys while perk menu is open
    }

    // ── Death screen: Enter = primary action, ESC = main menu ────
    if (document.getElementById('death-screen')?.style.display === 'flex') {
        if (e.key === 'Enter') {
            e.preventDefault();
            const primary = document.getElementById('death-btn-primary');
            if (primary) primary.click();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            returnToMainMenu();
        }
        return;
    }

    // ── Equip-prompt: Enter = open inventory, Escape = skip ──────
    const equipPrompt = document.getElementById('equip-prompt-overlay');
    if (equipPrompt?.style.display === 'flex') {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('equip-prompt-open')?.click();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            document.getElementById('equip-prompt-skip')?.click();
        }
        return;
    }

    // ── Chassis select: Escape cancels it, Left/Right selects chassis ─
    const missionOverlay = document.getElementById('mission-select-overlay');
    if (missionOverlay?.dataset.mode === 'chassis-select'
        && missionOverlay.style.display !== 'none') {
        if (e.key === 'Escape') { e.preventDefault(); _cancelNewCampaign(); return; }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const order = ['light', 'medium', 'heavy'];
            const cur = order.indexOf(_selectedNewChassis);
            const next = e.key === 'ArrowRight'
                ? order[(cur + 1) % 3]
                : order[(cur - 1 + 3) % 3];
            _highlightChassis(next);
            return;
        }
        if (e.key === 'Enter' && _selectedNewChassis) {
            e.preventDefault();
            _startNewCampaignWithChassis(_selectedNewChassis);
            return;
        }
    }

    // ── Leaderboard: Escape closes it ────────────────────────────
    if (document.getElementById('leaderboard-overlay')?.style.display !== 'none'
        && document.getElementById('leaderboard-overlay')?.style.display) {
        if (e.key === 'Escape') { e.preventDefault(); closeLeaderboard(); return; }
    }

    // ── Campaign shop / slots / upgrades overlays: Escape returns ─
    if (e.key === 'Escape') {
        const shopOv = document.getElementById('shop-overlay');
        if (shopOv && shopOv.style.display !== 'none') {
            e.preventDefault();
            if (typeof _closeShop === 'function') _closeShop();
            return;
        }
        const slotsOv = document.getElementById('loadout-slots-overlay');
        if (slotsOv && slotsOv.style.display !== 'none') {
            e.preventDefault();
            if (typeof _closeLoadoutSlots === 'function') _closeLoadoutSlots();
            return;
        }
        const upOv = document.getElementById('upgrades-overlay');
        if (upOv && upOv.style.display !== 'none') {
            e.preventDefault();
            if (typeof _closeUpgrades === 'function') _closeUpgrades();
            return;
        }
    }

    // ── Stats / Loadout overlay: Escape closes it ─────────────────
    if (_isStats) {
        if (e.key === 'Escape') { e.preventDefault(); toggleStats(); return; }
    }

    if (e.key === 'Escape') {
        e.preventDefault();
        // PVP: close hangar if open mid-match
        if (_gameMode === 'pvp' && typeof _pvpHangarOpen !== 'undefined' && _pvpHangarOpen) {
            if (typeof _pvpHangarInMatch !== 'undefined' && _pvpHangarInMatch) {
                _pvpDeployFromHangar();
            }
            return;
        }
        // PVP: close chat if open
        if (_gameMode === 'pvp' && typeof _mpChatOpen !== 'undefined' && _mpChatOpen) {
            mpToggleInGameChat();
            return;
        }
        // PVP: toggle PVP menu (or close it)
        if (_gameMode === 'pvp' && typeof mpIsPvpMenuOpen === 'function') {
            if (mpIsPvpMenuOpen()) { mpClosePvpMenu(); return; }
            if (isDeployed || (typeof _mpMatchActive !== 'undefined' && _mpMatchActive)) {
                mpShowPvpMenu();
                return;
            }
        }
        if (isDeployed) togglePause();
    }
    // T key opens in-GAME chat during PVP matches
    if ((e.key === 't' || e.key === 'T') && _gameMode === 'pvp'
        && typeof _mpChatOpen !== 'undefined' && !_mpChatOpen
        && typeof _mpMatchActive !== 'undefined' && _mpMatchActive
        && !(typeof _pvpHangarOpen !== 'undefined' && _pvpHangarOpen)
        && !(typeof mpIsPvpMenuOpen === 'function' && mpIsPvpMenuOpen())) {
        e.preventDefault();
        mpToggleInGameChat();
    }
});

// ── Main menu keyboard navigation ────────────────────────────────
// Arrow keys move focus between menu buttons; ESC closes sub-menu if open.
document.addEventListener('keydown', function _mainMenuKeyNav(e) {
    const mm = document.getElementById('main-menu');
    if (!mm || mm.style.display === 'none') return;
    const subMenu = document.getElementById('campaign-sub-menu');
    const subOpen = subMenu && subMenu.style.display !== 'none';

    if (e.key === 'Escape' && subOpen) {
        e.preventDefault();
        hideCampaignSubMenu();
        return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const container = subOpen
            ? document.getElementById('campaign-sub-menu')
            : document.getElementById('main-menu-buttons');
        if (!container) return;
        const btns = Array.from(container.querySelectorAll('button:not([style*="display:none"]):not([disabled])'));
        if (!btns.length) return;
        let cur = btns.indexOf(document.activeElement);
        if (cur === -1) cur = 0;
        else cur = e.key === 'ArrowDown' ? (cur + 1) % btns.length : (cur - 1 + btns.length) % btns.length;
        btns[cur].focus();
    }
});
