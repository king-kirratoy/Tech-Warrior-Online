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

// ── Player movement and firing handlers ───────────────────────────

/** Handle WASD movement, mod activation, and chassis-specific leg effects. */
function handlePlayerMovement(scene, time) {
    if (!player?.active || !isDeployed) return;
    const _gyroOn = loadout.leg === 'gyro_stabilizer' && _perkState.legSystemActive;
    // Iron Legs (Heavy trait): ignore destroyed-leg speed penalty
    const _ironLegs = loadout.chassis === 'heavy';
    // Use _legsDestroyed flag (set in processPlayerDamage) for consistent penalty timing
    // Penalty applies only when legs are fully destroyed (hp === 0), not at low HP
    const _legMult = _gyroOn ? 1.0
        : (_legsDestroyed && _ironLegs) ? 1.0
        : _legsDestroyed ? 0.5
        : 1.0;
    // Warlord Stride: +8% speed while leg HP > 50%
    const _warlordSpeedMult = (loadout.leg === 'warlord_stride' && _perkState.legSystemActive &&
        player.comp?.legs?.hp > player.comp.legs.max * 0.5) ? 1.08 : 1.0;
    const _shldSpdMult = (() => {
        const _ss2 = SHIELD_SYSTEMS[loadout.shld];
        if (!_ss2) return 1;
        if (_ss2.breakSpeedBurst && player._smokeBurstActive) return 1.70;
        if (_ss2.activeSpeedPenalty && player.shield > 0) return 1 - _ss2.activeSpeedPenalty;
        return 1;
    })();
    const _gearSpdMult = 1 + ((_gearState?.speedPct || 0) / 100);
    const _unstoppableSpdMult = 1 + (typeof getUnstoppableSpeedBonus === 'function' ? getUnstoppableSpeedBonus() : 0);
    // Lightweight (Light trait): +15% speed when core HP < 50%
    const _lightweightMult = (loadout.chassis === 'light' && player?.comp?.core && player.comp.core.max > 0 &&
        player.comp.core.hp / player.comp.core.max < 0.5) ? 1.15 : 1.0;
    // Agility (Light trait): +10% speed when exactly one arm has a weapon
    const _agilitySpeedMult = (() => {
        if (loadout.chassis !== 'light') return 1.0;
        const _lFilled = loadout.L && loadout.L !== 'none';
        const _rFilled = loadout.R && loadout.R !== 'none';
        return (_lFilled !== _rFilled) ? 1.10 : 1.0;
    })();
    const _berserkSpdMult = (isRageActive && typeof isKeystoneAllocated === 'function' && isKeystoneAllocated('ks_meteor') && loadout.chassis === 'medium') ? 1.08 : 1.0;
    const speed = CHASSIS[loadout.chassis].spd
        * (isRageActive ? 1.75 : 1)
        * _berserkSpdMult
        * _legMult
        * (_perkState.speedMult || 1)
        * _gearSpdMult
        * _warlordSpeedMult
        * _shldSpdMult
        * _unstoppableSpdMult
        * _lightweightMult
        * _agilitySpeedMult;
    const modCooldown = loadout.cpu !== 'none' ? WEAPONS[loadout.cpu]?.cooldown || 0 : 0;

    // Mod activation (SPACE)
    // modCdPct is stored negative for buff (−8 = 8% shorter cooldown); 1 + (−0.08) = 0.92 cd mult
    const _gearModCdMult = 1 + ((_gearState?.modCdPct || 0) / 100);
    const effectiveModCooldown = (isChargeActive ? modCooldown * 0.5
        : (loadout.chassis === 'medium' ? modCooldown * (CHASSIS.medium.modCooldownMult || 0.85) : modCooldown))
        * _gearModCdMult
        * (_perkState._keystoneModCdMult || 1)
        * (loadout.cpu === 'jump' ? (_perkState.jumpCdMult || 1) * (_perkState.jumpCooldownMult || 1) : 1)
        * (loadout.cpu === 'fortress_mode'
            ? (1 - (_perkState.fmCooldown || 0)) * (_perkState.heavyDreadnought ? 0.5 : 1)
            : 1);
    if (keys.SPACE.isDown && !isJumping && !isShieldActive && !isRageActive && time > lastModTime + effectiveModCooldown) {
        activateMod(scene, time);
    }

    // Movement
    if (!isJumping) {
        player.body.setVelocity(0);
        if (keys.W.isDown) scene.physics.velocityFromRotation(player.rotation, speed,      player.body.velocity);
        if (keys.S.isDown) scene.physics.velocityFromRotation(player.rotation, -speed / 2, player.body.velocity);

        if      (keys.A.isDown) player.body.setAngularVelocity(-200);
        else if (keys.D.isDown) player.body.setAngularVelocity(200);
        else                    player.body.setAngularVelocity(0);
    }

    // Mine Layer: drop a mine every 8 s while moving
    if (loadout.leg === 'mine_layer' && _perkState.legSystemActive) {
        const vel = player.body.velocity;
        if (Math.abs(vel.x) + Math.abs(vel.y) > 20) {
            _perkState.mineLayerTimer = (_perkState.mineLayerTimer || 0) + scene.game.loop.delta;
            if (_perkState.mineLayerTimer >= 8000) {
                _perkState.mineLayerTimer = 0;
                dropMine(scene);
            }
        }
    }

    // Mag Anchors: flag stationary state for use in damage calculations
    _perkState._magAnchorsActive = (loadout.leg === 'mag_anchors' && _perkState.legSystemActive &&
        Math.abs(player.body.velocity.x) + Math.abs(player.body.velocity.y) < 15);

    // Tremor Legs: fire a tremor at a regular interval while moving
    if (loadout.leg === 'tremor_legs' && _perkState.legSystemActive) {
        const _tvel = player.body.velocity;
        const _tMoving = Math.abs(_tvel.x) + Math.abs(_tvel.y) > 20;
        if (_tMoving) {
            const _tremorInterval = _perkState.tlCd ? 250 : 500;
            _perkState._tremorTimer = (_perkState._tremorTimer || 0) + scene.game.loop.delta;
            if (_perkState._tremorTimer >= _tremorInterval) {
                _perkState._tremorTimer = 0;
                if (typeof _triggerTremor === 'function') _triggerTremor(scene);
            }
        } else {
            _perkState._tremorTimer = 0;
        }
    }

}

/** Primary (M1) and secondary (RMB) weapon firing. */
function handlePlayerFiring(scene) {
    if (!player?.active || !isDeployed) return;
    const ptr = scene.input.activePointer;

    // Left-click: fire L arm (and R arm too if Light with matching weapons)
    if (ptr.isDown && ptr.leftButtonDown()) {
        const _target = document.elementFromPoint(ptr.x, ptr.y);
        const _canvas = scene.sys.canvas;
        if (_target && _canvas && _target !== _canvas) return;
        fire(scene, 'L');
        // Dual-fire: Light chassis only — fires both arms simultaneously when same weapon equipped
        if (loadout.chassis === 'light' && loadout.R && loadout.R !== 'none' && loadout.L === loadout.R) {
            fire(scene, 'R');
        }
    }

    // Right-click (held): fire R arm every frame (sustained weapons need this)
    if (ptr.rightButtonDown()) {
        // Don't double-fire R if left-click dual-fire already handled it this frame
        const isDualFiring = loadout.chassis === 'light' && loadout.L === loadout.R && loadout.R !== 'none' && ptr.leftButtonDown();
        if (!isDualFiring) fire(scene, 'R');
    }
}

// ── Drag-and-drop handlers for equip slots ──────────────────────

function _clearEquipDragHighlights() {
    window._dragActiveItem = null;
    document.querySelectorAll('.mech-equip-slot').forEach(slot => {
        slot.classList.remove('drag-hover-valid', 'drag-hover-invalid');
    });
    document.querySelectorAll('#inv-backpack .lo-slot').forEach(bp => {
        bp.classList.remove('drag-hover-valid');
    });
}
function _onEquipMouseDown(ev) {
    if (typeof _hideSlotHover === 'function') _hideSlotHover();
    const slotKey = ev.currentTarget.dataset.slot;
    if (!_equipped[slotKey]) return;
    window._dragActiveItem = _equipped[slotKey];
}
function _onEquipMouseUp() {
    _clearEquipDragHighlights();
}
function _onEquipDragStart(ev) {
    const slotKey = ev.currentTarget.dataset.slot;
    if (!_equipped[slotKey]) { ev.preventDefault(); return; }
    ev.dataTransfer.setData('text/plain', 'equipped:' + slotKey);
    window._dragActiveItem = _equipped[slotKey];
}
function _onEquipDragEnd() {
    _clearEquipDragHighlights();
}
function _onSlotDragEnter(ev) {
    const item = window._dragActiveItem;
    if (!item) return;
    const slot = ev.currentTarget;
    slot.classList.remove('drag-hover-valid', 'drag-hover-invalid');
    if (typeof _getDragValidSlots === 'function') {
        const validSlots = _getDragValidSlots(item);
        if (validSlots.includes(slot.dataset.slot)) {
            slot.classList.add('drag-hover-valid');
        } else {
            slot.classList.add('drag-hover-invalid');
        }
    }
}
function _onSlotDragOver(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.add('drag-over');
}
function _onSlotDragLeave(ev) {
    ev.currentTarget.classList.remove('drag-over', 'drag-hover-valid', 'drag-hover-invalid');
}
function _onSlotDrop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over', 'drag-hover-valid', 'drag-hover-invalid');
    const slotKey = ev.currentTarget.dataset.slot;
    const data = ev.dataTransfer.getData('text/plain');
    if (data.startsWith('backpack:')) {
        const idx = parseInt(data.split(':')[1]);
        const item = _inventory[idx];
        if (!item) return;
        // Validate: weapon can go to L or R, other items must match slot type
        if (item.baseType === 'weapon') {
            if (slotKey !== 'L' && slotKey !== 'R') return;
            _equipItemToSlot(idx, slotKey);
        } else {
            const expectedSlot = _getSlotForItem(item);
            if (expectedSlot !== slotKey) return;
            _equipItemToSlot(idx, slotKey);
        }
    } else if (data.startsWith('equipped:')) {
        const fromSlot = data.split(':')[1];
        if (fromSlot === slotKey) return;
        // Weapon L↔R swap
        if ((fromSlot === 'L' || fromSlot === 'R') && (slotKey === 'L' || slotKey === 'R')) {
            const temp = _equipped[fromSlot];
            _equipped[fromSlot] = _equipped[slotKey];
            _equipped[slotKey] = temp;
            if (typeof loadout !== 'undefined') {
                loadout[fromSlot] = _equipped[fromSlot]?.subType || 'none';
                loadout[slotKey]  = _equipped[slotKey]?.subType || 'none';
            }
            recalcGearStats(); saveInventory(); populateInventory(); _updateInvCount();
        }
    }
}
