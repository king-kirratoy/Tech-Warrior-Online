# Changelog

All notable changes to Tech Warrior Online are documented here.
Each session that changes code gets a version bump.

---

## v5.71 — Comprehensive text color readability sweep

**Date:** 2026-03-22

Full audit and fix pass across all CSS files, index.html, menus.js, and campaign-system.js to bring every player-readable text element up to legible contrast against the `#080b0e` background. Color rules applied: primary text `rgba(255,255,255,0.88)`, secondary/label text `rgba(255,255,255,0.45)`, tertiary/hint chrome `rgba(255,255,255,0.22)` (intentionally dim — not changed), accent values `var(--sci-cyan)` at full opacity. `base.css`: `.tw-btn--ghost` label color `var(--sci-txt2)` → `rgba(255,255,255,0.45)`. `menus.css`: fixed `.mm-stat-label`, `.ps-status`, `.ps-hint`, `.cm-chapter-prog`, `.lb-filter-tab`, `.lb-th`, `.lb-rank`, `.lb-val`, `.mp-sec-label`, `.mp-chassis-btn`, `.mp-stats-header`, `.lobby-hdr`, `.lobby-player-name.empty`, `.lobby-player-loadout`, `.lobby-ready-badge.waiting`, `.shop-scrap`, `.shop-col-title`, `.shop-item-meta`, `.shop-detail-meta`, `.shop-compare-header`, `.shop-compare-label`, `.shop-compare-val`, `.shop-compare-diff.neu` — all `var(--sci-txt3)` and `var(--sci-txt2)` on labels raised to 0.45 or 0.65 accordingly. `garage.css`: fixed `.hg-subtitle`, `.hg-stats-header`, `.hg-stat-label`, `.hg-stat-val.dim`, `.lo-xp-lbl`, `.lo-xp-val`, `.lo-sec-title`, `.lo-stat-label`, `.eq-slot .eq-slot-label`, `.lo-slot .lo-slot-lbl`, `.lo-bp-count`. `index.html`: hangar nav number/arrow prefix spans `var(--sci-txt3)` → `rgba(255,255,255,0.22)` (tertiary chrome); `#preview-chassis-label`, `#lb-loading`, `#lb-empty`, `#inv-header-count` → `rgba(255,255,255,0.45)`. `menus.js`: resume campaign star/arrow prefixes, `_statCard()` labels, "vs equipped" header, "Nothing equipped", diff stat names, "CHANGES IF EQUIPPED" header, `_showItemDetail()` slot label + iLvl, `_showSlotHover()` slot name + stat names — all raised to `rgba(255,255,255,0.45)`; "Hold + drag to swap" hint set to `rgba(255,255,255,0.22)`. `campaign-system.js`: XP bar text, level label, shop card/detail labels, "SOLD" badge, "CURRENT LOADOUT" header, empty slot labels, skill tree locked node descriptions, "ACTIVE BONUSES" header — all raised to `rgba(255,255,255,0.45)` or `rgba(255,255,255,0.22)` as appropriate; "SAVE" accent fixed to `var(--sci-cyan)` full opacity.

---

## v5.70 — Loadout overlay: left-column restructure + weapon bar chassis traits

**Date:** 2026-03-22

Four-step layout and CSS pass on the loadout overlay. Step 1: added a chassis name row (`#lo-chassis-row`, `.lo-chassis-row/.lo-chassis-lbl/.lo-chassis-val`) above the Hull Integrity section title with no `.lo-sec` wrapper; rewrote `_renderHullBars()` to use new `.lo-hp-row/.lo-hp-part/.lo-hp-track/.lo-hp-fill/.lo-hp-val` structure (replacing `_hpBarBoosted()`), dynamic fill color (green/yellow/red by %), and added Total HP (green `#00ff88`) + Total Shield (purple `#cc88ff`) rows below a thin divider. Step 2: renamed the "Stats" left-column section to "Mech Stats"; rewrote `_renderMobilityPanel()` to render in this exact order — Shield Regen, Dodge Chance, Dmg Reduction, Auto-Repair, Crit Chance, Mod Cooldown, Speed — removing the Chassis name row, Shield capacity row, Legs Status row, and Loot Quality row. Step 3: rewrote `_renderGearBonusesPanel()` to remove equipped gear chip tags and render all bonuses as `.lo-bonus-row` plain text rows with `.lo-bonus-lbl` / `.lo-bonus-val.pos` / `.lo-bonus-val.neg`; group sub-headers switched to new `.bsub` CSS class. Step 4: removed Chassis Traits from the left column entirely; rewrote `_renderWeaponBar()` to render a two-sided flex row — `.lo-weap-side` (L/R/Core weapon stats) separated by a border from `.lo-trait-side` (chassis trait cards as `.lo-trait-inline/.lo-trait-name/.lo-trait-desc`). No game, combat, or round logic changed.

---

## v5.69 — Text color readability pass across menus

**Date:** 2026-03-22

CSS-only pass to fix text elements rendering in dim cyan/teal that were hard to read against the dark background. All `var(--sci-txt3)` (rgba(255,255,255,0.18)) and cyan-tinted color values on labels were replaced with `rgba(255,255,255,0.45)` (the standard muted-label color). `menus.css`: `.cm-chapter.active .cm-chapter-prog` changed from `rgba(0,212,255,0.5)` → `rgba(255,255,255,0.45)`; `.mp-dd-label` changed from `rgba(0,212,255,0.6)` → `rgba(255,255,255,0.45)`; `.cm-mission-brief` changed from `var(--sci-txt3)` → `rgba(255,255,255,0.45)`; `.cm-mission-lv` changed from `var(--sci-txt3)` → `rgba(255,255,255,0.45)`. `index.html` pilot panel: "Pilot status" divider label, "Callsign" label, "Campaign level" label, and `#mm-xp-text` all changed from `var(--sci-txt3)` → `rgba(255,255,255,0.45)`. Accent values (`#mm-callsign`, active chapter/mission names) left unchanged at `var(--sci-cyan)`.

---

## v5.68 — Loadout overlay: full layout restructure

**Date:** 2026-03-22

Seven-step layout restructure of the loadout overlay to match the approved design. Step 1: replaced the tall campaign XP bar (`#campaign-xp-bar`) with a slim single-line `.lo-xp-row` (2px fill track, 8px monospace labels); updated `campaign-system.js` to show as `flex` instead of `block`. Step 2: narrowed left column from 260px to 240px; set `.lo-right` to `overflow:hidden`. Step 3: removed Backpack section from left column; left column now shows only Hull Integrity → Stats → Chassis Traits → Gear Bonuses → Active Perks (simulation-only). Step 4: equipment doll slots converted from calc()-positioned `.eq-slot` cards to percentage-positioned (left:2%/right:2%, top:6/28/50/72%) `.mech-equip-slot .lo-slot` cards; mech ghost image raised to `opacity:0.40` at `width:200px`; SVG dashed connector lines added (rgba(0,212,255,0.1)); `.lo-doll-wrap` changed to `flex:1` to fill remaining height. Step 5: backpack moved to right column below the weapon bar as a fixed 10×3 grid of 30 `.lo-slot` divs (filled items + empty placeholders); all drag-and-drop event handlers preserved unchanged; old `bp-cell` class replaced with `lo-slot`. Step 6: weapon bar class renamed from `weapon-bar` to `lo-weapon-bar` with updated CSS (`padding:9px 20px; gap:20px`). Step 7: hover card class renamed to `.lo-hover-card` (190px, `font-family:'Courier New'`); `_showSlotHover` updated to flip left/right to avoid screen-edge clipping, and now also shows rarity+iLvl row and a "Hold + drag to swap" hint.

---

## v5.67 — Loadout screen: CSS visual polish pass

**Date:** 2026-03-22

Seven CSS and styling fixes applied to the loadout overlay to match the agreed design spec. `garage.css`: updated `.lo-sec-title` to add `font-family:'Courier New'`, `font-weight:normal`, and `margin-bottom:10px`; added `.lo-sec` section wrapper rule (`padding:14px 18px; border-bottom:1px solid rgba(255,255,255,0.07)`) and migrated all six left-column section divs in `index.html` from `lo-section` to `lo-sec`; replaced `.lo-trait-row`/`.lo-trait-name`/`.lo-trait-desc` with the spec-correct `.lo-trait`/`.lo-trait-name`/`.lo-trait-desc` (with `font-family` and correct opacity); added sub-rules for `.eq-slot .eq-slot-label` and `.eq-slot .eq-slot-name` and set `border-radius:0` / `cursor:default` / `font-family` on `.eq-slot`; added `.lo-stat-value` and its `.green`/`.red`/`.orange`/`.yellow`/`.purple` color variants. `menus.js`: removed the inline "CHASSIS TRAITS" cyan sub-header; updated `_renderChassisPanel()` to use `.lo-trait`/`.lo-trait-name`/`.lo-trait-desc`; updated `populateInventory()` slot HTML to use `eq-slot-label`/`eq-slot-name`; updated `_statRow()` to use `lo-stat-row`/`lo-stat-label`/`lo-stat-value`; replaced all remaining `stats-row`/`stats-label`/`stats-value` inline class strings with the `lo-stat-*` equivalents; changed Shield Regen color class to `green` and Mod Cooldown to `red`; set mech ghost image to `opacity:0.15; filter:grayscale(100%)`.

---

## v5.66 — Loadout screen: align render path and fix design inconsistencies

**Date:** 2026-03-22

Fixed `_openLoadoutFromMission()` in `campaign-system.js` to call `populateLoadout()` instead of the old `populateStats()` + `populateInventory()` pair, ensuring the campaign loadout entry point uses the same unified render path as all other entry points. Removed the ARM CONFIGURATION two-column grid from `_renderChassisPanel()` — the Chassis Traits section now renders as a single column with no ARM CONFIGURATION right column. Updated `_renderGearBonusesPanel()` to output individual stat bonuses as `.tw-bonus-tag` pill elements grouped under OFFENSIVE / DEFENSIVE / UTILITY headings, replacing the old inline-styled label/value rows. Fixed `.tw-bonus-tag` CSS rule in `garage.css` to add `color: var(--sci-gold)` and `border: 1px solid var(--gold-dim)` so tags are visible. Corrected mech image opacity in the equipment doll from `0.25` to `0.18` to match the agreed spec.

---

## v5.65 — Fix null-ref crash when opening loadout from campaign mission select

**Date:** 2026-03-22

Added hidden placeholder `<div>` elements for `#stat-weapons-info` and `#stat-run-info` in `index.html`; these IDs were removed during the v5.64 redesign but `_renderWeaponPanel()` and `_renderRunStatsPanel()` (called by the legacy `populateStats()` path used in `_openLoadoutFromMission`) still write to them, causing a `TypeError: Cannot set properties of null` crash.

---

## v5.64 — Loadout overlay redesign: unified two-column screen

**Date:** 2026-03-22

Complete redesign of the `stats-overlay` (`#stats-overlay`) from a two-tab STATS/GEAR layout into a single unified two-column screen with no tab switching. Changes span `index.html`, `css/garage.css`, `css/menus.css`, and `js/menus.js`.

**HTML (`index.html`):** Replaced the old two-tab overlay (two hidden content divs, tab buttons, max-width wrapper) with a new full-screen flex layout: a top bar (`lo-top-bar`) with item count/scrap on the left, "LOADOUT" title centered, and a CLOSE button on the right; a campaign XP bar (unchanged content, new position); and a two-column body (`lo-body`) split into a fixed 260 px left column (`lo-left`, independently scrollable) and a flex-1 right column (`lo-right`). Left column sections: Hull Integrity (`#lo-hull-info`), Stats (`#stat-mobility-info`), Chassis Traits (`#stat-traits-info`), Gear Bonuses (`#stat-gear-panel`/`#stat-gear-info`), Backpack (with `#lo-bp-count` count + `#inv-backpack` grid), Active Perks (`#lo-perks-section`/`#stat-perks-info`). Right column: equipment doll wrap with `#inv-mech-silhouette` and `#eq-hover-card`, weapon bar `#lo-weapon-bar`, comparison panel `#inv-detail-panel`.

**CSS (`css/garage.css`):** Added full block of new layout rules — `.lo-top-bar`, `.lo-body`, `.lo-left`, `.lo-right`, `.lo-section`, `.lo-sec-title`; hull bar rows `.lo-hp-row`/`.lo-hp-label`/`.lo-hp-track`/`.lo-hp-fill`/`.lo-hp-val`; stat rows `.lo-stat-row`/`.lo-stat-label`/`.lo-stat-val`; trait rows `.lo-trait-row`/`.lo-trait-name`/`.lo-trait-desc`; `.tw-bonus-tag`; `.lo-doll-wrap` (500 px height); `.eq-slot`/`.eq-slot:hover`; `.eq-hover-card` (absolute, 200 px); `.weapon-bar`; `.cmp-panel`/`.cmp-cols`/`.cmp-col`; `.bp-card`/`.bp-card:hover`.

**CSS (`css/menus.css`):** Removed the `LOADOUT TABS` CSS section (`.loadout-tab`, `:first-child`, `:last-child`, `.active`, `:hover:not(.active)`) — no longer needed.

**JS (`js/menus.js`):**
- Removed `_switchLoadoutTab()` — tab switching no longer exists.
- `toggleStats()` simplified: removed `populateStats()` and `_switchLoadoutTab()` calls; now calls `populateLoadout()` after showing the overlay.
- `toggleInventory()` simplified: no longer switches to a tab; just opens the overlay via `toggleStats()` if not already open.
- Added `populateLoadout()` — the new master render function that calls `_renderHullBars`, `_renderMobilityPanel`, `_renderChassisPanel`, `_renderGearBonusesPanel`, `populateInventory`, conditionally `_renderActivePerksPanel` (simulation mode only with `#lo-perks-section` visibility toggled), and `_renderWeaponBar`.
- Added `_renderHullBars()` — renders Core/L.Arm/R.Arm/Legs HP bars (with boosted max indicators) to `#lo-hull-info`; extracted from `_renderChassisPanel`.
- Updated `_renderChassisPanel()` — chassis name/shield/HP content removed from its output; now only renders the traits+arm-config grid to `#stat-traits-info`; `#stat-chassis-info` write is null-guarded for old-layout fallback.
- Updated `_renderMobilityPanel()` — prepends chassis name row and shield row at the top of `#stat-mobility-info` output.
- Added `_renderWeaponBar()` — populates `#lo-weapon-bar` with L arm, R arm, and core mod entries showing name, effective damage, DPS, and reload/cooldown.
- Added `_showSlotHover(el, slotKey)` — positions and populates `#eq-hover-card` with the equipped item's name, base stats, and affixes when the mouse enters a doll slot.
- Added `_hideSlotHover()` — hides `#eq-hover-card`.
- `populateInventory()` — equip slot elements now also carry class `eq-slot` alongside `mech-equip-slot`; added `onmouseenter`/`onmouseleave` on each slot to call `_showSlotHover`/`_hideSlotHover`; header count format updated to `N / 30 items · X scrap`; added `#lo-bp-count` update.

### Files Changed

- `index.html` — stats-overlay replaced with two-column layout
- `css/garage.css` — new lo-* / eq-slot / weapon-bar / cmp-panel layout rules added
- `css/menus.css` — .loadout-tab CSS block removed
- `js/menus.js` — populateLoadout, _renderHullBars, _renderWeaponBar, _showSlotHover, _hideSlotHover added; toggleStats, toggleInventory, _renderChassisPanel, _renderMobilityPanel, populateInventory updated; _switchLoadoutTab removed
- `CHANGELOG.md` — this entry

---

## v5.63 — Warzone/multiplayer CSS unification + colour label + backpack comparison

**Date:** 2026-03-22

Three fixes across `index.html`, `css/garage.css`, and `js/menus.js`. Fix 1 (warzone uses exact multiplayer CSS classes): in `index.html` the warzone title `<div>` was replaced with `<div class="mp-screen-title">` (same class as the multiplayer screen title), the build-stats header was changed from `hg-stats-header` to `mp-stats-header` (they had identical properties — the difference was class-name drift), and all three chassis buttons were changed from `hg-chassis-btn` to `mp-chassis-btn`; the now-unused `.hg-chassis-btn / :hover / .active` CSS block was removed from `garage.css`. Fix 2 (colour label in warzone): the colour dropdown in the warzone sidebar lacked an inline label to its left; restructured the row to be a `mp-dd-row` wrapper with a `mp-dd-label` span ("Colour") to the left and `flex:1` on the `ddw-C` wrap — matching the multiplayer layout exactly; also updated the `.dd-selected` border in `garage.css` from hard-coded `rgba(0,255,255,0.25)` to `var(--sci-cyan-border)` for consistency. Fix 3 (backpack item comparison): `_buildItemComparisonHTML` in `menus.js` was rewritten to show a side-by-side "NEW / EQUIPPED" stat-card layout plus a "CHANGES IF EQUIPPED:" diff section below (matching the supply shop style); for weapon items, `_compareArm` (default `'L'`, reset on each new item open) controls which arm is used for comparison, and a small "vs R ARM" toggle button appears when the other arm also has a weapon equipped; `_showItemDetail` was split into a toggle-guard entry-point plus a `_renderItemDetail` function so that `_setCompareArm` can switch arms and re-render without re-triggering the toggle; the weapon EQUIP button now calls `_equipItemToSlot(idx, _compareArm)` so it equips directly to the currently compared arm rather than showing the generic arm-picker.

### Files Changed

- `index.html` — warzone title, stats header, chassis buttons, colour dd-row
- `css/garage.css` — removed .hg-chassis-btn rules; dd-selected border uses var(--sci-cyan-border)
- `js/menus.js` — _compareArm, _setCompareArm, _renderItemDetail, _buildItemComparisonHTML rewritten
- `CHANGELOG.md` — this entry

---

## v5.62 — Supply shop button width fixes

**Date:** 2026-03-22

Two button width fixes in `showShop()` in `js/campaign-system.js`. Fix 1 (Restock button): the Restock button already had `width:auto` but was still stretching inside its flex container because it lacked an explicit flex shrink rule; added `flex:0 0 auto` before the existing `width:auto` in its inline style so it stays compact regardless of the container. Fix 2 (Buy button): the Buy button in the detail panel had `style="width:100%"` which caused it to span the full panel width; changed it to `style="flex:0 0 auto;width:auto;min-width:160px;"` so it sizes to its content with a sensible minimum width. No other buttons, classes, onclick handlers, or files were changed.

### Files Changed

- `js/campaign-system.js` — Restock and Buy button inline styles fixed in showShop()
- `CHANGELOG.md` — this entry

---

## v5.61 — Main menu stat fixes + _buildItemComparisonHTML implemented

**Date:** 2026-03-22

Three improvements. Fix 1 (warzone/multiplayer CSS parity audit): audited all five property groups — stat row label/value (`hg-stat-label`/`hg-stat-val`), stats section header (`hg-stats-header` vs `mp-stats-header`), left column section labels (already using `mp-sec-label` since v5.59), and chassis buttons (`hg-chassis-btn` vs `mp-chassis-btn`) — all values are already identical, no CSS changes needed; confirmed `updateGarageStats()` Group 5 rows (MOD, SHIELD, LEGS, AUGMENT) already match the multiplayer's `statRow()` output in `multiplayer.js` so no rows were removed. Fix 2 (main menu stats showing defaults): updated `_updateMainMenuStats()` in `menus.js` with three sub-changes — (2a) increased `setTimeout` delay from 200ms to 500ms for more reliable loading after campaign state initializes, (2b) added `if (!document.getElementById('mm-stat-missions')) return;` null check at the top of the callback to prevent silent errors when the main menu isn't in the DOM, (2c) changed missions count to `Object.keys((_campaignState && _campaignState.completedMissions) || {}).length` using explicit `&&` guard; additionally added a 100ms deferred `_updateMainMenuStats()` call at the end of `loadCampaignState()` in `campaign-system.js` so stats refresh after any future cloud save restore. Fix 3 (backpack item detail ReferenceError): `_buildItemComparisonHTML` was called in `_showItemDetail()` but not defined anywhere in the codebase, causing `Uncaught ReferenceError` on every backpack item click; implemented the function in `menus.js` immediately before `_showItemDetail` — it finds the equipped item in the matching slot (using `_getSlotForItem` for non-weapons, preferring `_equipped.L` for weapons), iterates all stat keys across both items, skips zero-diff stats, renders each changed stat with a green/red colour based on whether the change is positive (with reload/modCdPct treated as "lower is better"), and returns an empty string when no equipped item exists for comparison.

### Files Changed

- `js/menus.js` — _updateMainMenuStats() timeout+null-check+missions-syntax fixes; _buildItemComparisonHTML() implemented
- `js/campaign-system.js` — loadCampaignState() now calls _updateMainMenuStats() after restore
- `CHANGELOG.md` — this entry

---

## v5.60 — Gear tab: fix backpack click selected state + add slot label to item detail panel

**Date:** 2026-03-22

Two fixes to the loadout gear tab in `js/menus.js`. Fix 1 (backpack click selected state): the click handler on each backpack item card was calling `_showItemDetail('backpack', idx)` correctly, but the card's visual selected state (bright border + glow) was only applied during the initial `populateInventory()` render and never updated when a card was actually clicked. Expanded the click handler to immediately walk all `#inv-backpack .bp-cell` elements after calling `_showItemDetail`, and update each card's `borderColor` and `boxShadow` based on whether `_invSelectedSource === 'backpack' && _invSelectedKey === that card's idx` — so the selected card highlights instantly on click, previously-selected cards clear, and clicking the same card a second time (which `_showItemDetail` handles as a toggle by setting `_invSelectedSource = null`) correctly dims all cards back to their resting state. Fix 2 (slot label in detail panel): `_showItemDetail()` was rendering item name, rarity, stats, and affixes but had no gear slot label. Added `_invSlotNames` mapping (`weapon → 'L ARM / R ARM'`, `mod_system → 'CPU'`, `aug_system → 'AUGMENT'`, `shield_system → 'SHIELD'`, `leg_system → 'LEGS'`, `armor → 'ARMOR'`, `arms → 'ARMS'`, plus `legs`, `shield`, `mod`, `augment` as aliases) and a `_slotLabel` lookup at the start of the render block; when a label exists, a `<div>` with `font-size:9px; letter-spacing:3px; color:var(--sci-txt3); text-transform:uppercase; margin-bottom:4px;` is injected as the first child of the name wrapper, appearing above the item name for both equipped slot clicks and backpack item clicks since they share the same rendering function.

### Files Changed

- `js/menus.js` — backpack click handler expanded with post-click card state update; _invSlotNames + slot label div added to _showItemDetail()
- `CHANGELOG.md` — this entry

---

## v5.59 — Main menu stat timing fix + warzone hangar visual parity with multiplayer

**Date:** 2026-03-22

Two improvements. Fix 1 (main menu stats): increased the `setTimeout` delay in `_updateMainMenuStats()` from 100ms to 200ms so it always runs after campaign state, XP functions, and other init code have fully loaded — this ensures missions count (`_campaignState.completedMissions`), best round (`_bestRound`), and the XP bar all display real values instead of defaults when entering the main menu. The function was already being called from `proceedToMainMenu()`, `returnToMainMenu()`, and `_cancelNewCampaign()`. Fix 2 (warzone hangar visual parity): three sub-changes to make the warzone hangar look identical to the multiplayer hangar. (2a) In `css/garage.css`, updated `.hg-chassis-btn` to match `.mp-chassis-btn` exactly — changed `font-size` from 11px to 10px, `padding` from `10px 14px` to `8px 10px`, `letter-spacing` from 2px to 1px, added `text-align: center` and `flex: 1`, and removed the flex-container properties (`display:flex`, `align-items`, `justify-content`, `flex-wrap`, `gap`) plus deleted the `.hg-chassis-sub` and `.hg-chassis-btn.active .hg-chassis-sub` rules entirely since sub-labels are removed. (2b) In `index.html`, restructured the chassis buttons — removed the `hg-chassis-sub` sub-label spans ("Fast / Agile", "Balanced", "Tank / Brawler") from each button, wrapped all three buttons in a `<div class="mp-chassis-row">` to create a horizontal row matching the multiplayer layout, and changed the "Chassis" and "Colour" section-label divs from inline styles to `class="mp-sec-label"` matching the multiplayer pattern exactly. (2c) Confirmed that the stat row template strings in `garage.js` (`row()` helper) and `multiplayer.js` (`statRow()` helper) are already identical — both use `hg-stat-row`/`hg-stat-label`/`hg-stat-val` class names and `hg-gap` div — no changes were needed.

### Files Changed

- `js/menus.js` — _updateMainMenuStats() setTimeout 100→200ms
- `css/garage.css` — .hg-chassis-btn rewritten to match .mp-chassis-btn; .hg-chassis-sub and .hg-chassis-btn.active .hg-chassis-sub removed
- `index.html` — chassis buttons restructured: horizontal mp-chassis-row, mp-sec-label labels, sub-label spans removed
- `CHANGELOG.md` — this entry

---

## v5.58 — Five UI fixes: remove MENU button, pause focus, lobby START GAME position, warzone header parity, backpack card polish

**Date:** 2026-03-22

Five targeted fixes across the in-game HUD, pause menu, multiplayer lobby, warzone hangar, and inventory backpack. Fix 1 (remove MENU button): removed the `<button>` element from `#top-left-btns` in `index.html`; the container div remains (used by other runtime logic) but is now empty so no MENU button appears during gameplay. Fix 2 (pause menu focus): in `js/menus.js` `togglePause()`, replaced `firstPauseBtn.focus()` with `document.activeElement?.blur()` so no pause button appears pre-highlighted when the menu opens; added `.ps-btn:focus` and `.ps-btn:focus-visible` CSS overrides in `css/menus.css` that reset the button to its default unstyled state to prevent browser-default focus rings from appearing. Fix 3 (lobby START GAME position): in `js/multiplayer.js` `mpShowLobby()`, moved the `#mp-start-btn` element from a dedicated `mp-bottom` bar into the `mp-top` bar at the far right using `margin-left:auto`; removed the entire `mp-bottom` section; `mpUpdateLobbyUI()` already uses `if (bottomSt)` guard so the null return is safe. Fix 4 (warzone hangar layout parity): three sub-changes — (4a) in `index.html`, restructured `#garage-menu .hg-top` to remove the old `.hg-title`/`.hg-subtitle`/`#hangar-mode-label` elements and replaced them with a centered "WARZONE" title using `position:absolute; left:50%; transform:translateX(-50%)` on the parent `position:relative` container, matching the multiplayer lobby header pattern; (4b) in `css/garage.css`, removed the border and background from `#garage-stats-panel` (set to `background:transparent; border:none; box-shadow:none`) so the stats panel blends into the hangar surface like the multiplayer build stats; (4c) in `js/garage.js` `updateGarageStats()`, added a Group 5 slot-name summary block at the bottom of the output with rows for MOD, SHIELD, LEGS, and AUGMENT showing the equipped item name via a new `_slotName()` helper that checks `SLOT_DESCS`, then falls back to `dict[key].name` or a formatted key string. Fix 5 (backpack card polish): two sub-changes — (5a) added `overflow:hidden; padding:0 4px; box-sizing:border-box` to the `bp-cell` container style and `white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%` to both the slot label and item name inner divs so long text truncates cleanly within the 88px card width; (5b) after rendering each card, if `_invSelectedSource === 'backpack' && _invSelectedKey === idx` the card immediately receives the full selected border/glow state; hover and mouseout listeners now check the same condition and skip restyling if the card is the active selection, so hovering over a selected card no longer dims it.

### Files Changed

- `index.html` — MENU button removed from #top-left-btns; .hg-top restructured with centered WARZONE title
- `css/menus.css` — .ps-btn:focus/.ps-btn:focus-visible overrides added
- `css/garage.css` — #garage-stats-panel border/background removed
- `js/menus.js` — togglePause() blur fix; bp-cell overflow CSS + ellipsis; backpack selected-state highlight + hover guard
- `js/multiplayer.js` — mp-start-btn moved to mp-top; mp-bottom section removed
- `js/garage.js` — Group 5 slot-name summary rows added to updateGarageStats()
- `CHANGELOG.md` — this entry

---

## v5.57 — Six UI fixes: dropdown clipping, page title, weapon stat rows, backpack labels, detail panel toggle

**Date:** 2026-03-22

Six targeted fixes across multiplayer, index.html, the build stats panels, and the loadout gear tab. Fix 1 (MP dropdown clipping): changed `.mp-left` from `overflow-y: auto` to `overflow: visible` in `css/menus.css` so absolutely-positioned `.pvp-dd-list` elements are no longer clipped by the column's scroll container; added a `.pvp-dd-list` CSS rule with `position:absolute`, `z-index:9999`, `max-height:280px`, `overflow-y:auto`, `top:100%`, `left/right:0` to ensure the dropdown scrolls internally rather than forcing the column to extend. Fix 2 (page title): changed `<title>` in `index.html` from "Tech Warrior: Alpha 3.0" to "Tech Warrior Online". Fix 3 (weapon stat rows): in both `js/garage.js` and `js/multiplayer.js`, removed the separate "L FIRE RATE" and "R FIRE RATE" rows and replaced them with single "L ARM" and "R ARM" rows that combine the weapon name and fire rate stats in the format `{Name} — {dps} dps · {N}ms cd` (e.g. "Submachine Gun — 159.6 dps · 47ms cd ★"); `— none` is shown when no weapon is equipped; the separate L ARM / R ARM name-only rows at the bottom of the multiplayer stats panel were removed since the info is now in the combined rows. Fix 4 (backpack slot labels): in `js/menus.js`, updated each backpack item card (`bp-cell`) to include a slot label (`ARMOR`, `CPU`, `AUGMENT`, `SHIELD`, `LEGS`, `ARMS`, `L ARM / R ARM`) as the first line above the item name, styled in 8px uppercase muted text; cell height increased from 76px to 84px to accommodate the extra line. Fix 5 (detail panel toggle): added `_invSelectedSource` and `_invSelectedKey` tracking vars in `js/menus.js`; `_showItemDetail()` now toggles — clicking the same item twice hides the panel; clicking a different item switches to it; `populateInventory()` resets both vars and hides the panel on each re-render so stale selection state is never carried forward.

### Files Changed

- `css/menus.css` — .mp-left overflow changed to visible; .pvp-dd-list added
- `index.html` — <title> updated to "Tech Warrior Online"
- `js/garage.js` — L ARM / R ARM combined stat rows replace L/R FIRE RATE rows
- `js/multiplayer.js` — same combined row change; standalone L ARM/R ARM name rows removed
- `js/menus.js` — bp-cell slot label added; _invSelectedSource/Key tracking; _showItemDetail toggle
- `CHANGELOG.md` — this entry

---

## v5.56 — Supply shop improvements + loadout drag-and-drop slot highlighting

**Date:** 2026-03-22

Four improvements across the shop and loadout systems. Fix 1 (sell confirmation): clicking a sell-column item now selects it (`_selectedSellIdx`) and shows a confirmation panel at the bottom of the sell column with the item's slot label, name, meta, a red "Sell — ⬡ N" button and a "Cancel" link; `_shopSell()` was rebuilt to add the sold item back to `_shopStock` with a `_soldBack:true` flag and its sell price as `_shopPrice` so the player can immediately buy it back, and only removes it from `_inventory` once confirmed; sold-back items appear in the buy list with a small muted "SOLD" badge; `_shopRestock()` and `_closeShop()` both reset `_selectedSellIdx`; `refreshShopStock()` wipes `_shopStock` entirely so sold-back items are cleared on restock. Fix 2 (side-by-side comparison): when a buy item is selected and an item is already equipped in the same slot, the detail panel now shows two stat cards side by side ("New" and "Equipped"), each listing all non-zero stats as rows; below the cards a "Changes if equipped:" section shows only the stats that differ with green/red coloring; when the slot is empty only the new item card is shown with all its stats. Fix 3 (slot label): all baseTypes now resolve to a friendly label (`armor → ARMOR`, `mod_system → CPU`, `aug_system → AUGMENT`, `shield_system → SHIELD`, `leg_system → LEGS`, `weapon → L ARM / R ARM`) via a new `_shopSlotLabels` map; this label appears as the topmost line of every buy and sell detail panel in small uppercase muted text; the meta line in every buy and sell row also shows the friendly slot name instead of the raw `baseType`; `_baseTypeToSlot` was also extended to include all system-type baseTypes (`mod_system`, `aug_system`, `shield_system`, `leg_system`) so the comparison correctly finds the equipped item for those slots. Fix 4 (drag highlighting): added `_getDragValidSlots(item)` helper in `menus.js` that returns the list of valid `data-slot` values for an item; the `dragstart` handler on inventory backpack cells now adds `drag-valid` to matching `.mech-equip-slot` elements and `drag-invalid` to all others; `dragend` removes both classes; in `css/menus.css`, `.mech-equip-slot.drag-invalid` shows a red tint and `.mech-equip-slot.drag-valid` shows a cyan tint.

### Files Changed

- `js/campaign-system.js` — _selectedSellIdx added; showShop() rebuilt with Fixes 1/2/3; _shopSelectSell() added; _shopSell() rewritten; _shopRestock() and _closeShop() reset _selectedSellIdx
- `js/menus.js` — _getDragValidSlots() added; dragstart/dragend on bp-cell updated for slot highlighting
- `css/menus.css` — .mech-equip-slot.drag-invalid and .drag-valid rules added; Supply Shop block from v5.55 unchanged
- `CHANGELOG.md` — this entry

---

## v5.55 — Supply shop redesigned to two-column Buy/Sell layout

**Date:** 2026-03-22

Redesigned the campaign supply shop from a scrollable centered card layout to a fixed two-column panel. In `css/menus.css`: added a new Supply Shop section with `.shop-screen` (flex column, full height), `.shop-top` (top bar with position:relative for centred title), `.shop-title` (absolute centred), `.shop-scrap` (right-aligned scrap display with gold `<span>`), `.shop-body` (flex row, flex:1), `.shop-buy-col` (flex:1, border-right) and `.shop-sell-col` (width:320px fixed), `.shop-col-header`, `.shop-items-list`, `.shop-item-row` (with hover and selected states, left-border accent), `.shop-rarity-bar` (3px tall coloured strip), `.shop-item-info`/`.shop-item-name`/`.shop-item-meta`, `.shop-item-price`/`.shop-sell-price`, `.shop-detail-panel` (fixed at bottom of buy column), `.shop-compare-grid` and `.shop-compare-grid.no-equipped` (4-col vs 2-col depending on whether an item is equipped), all comparison cell classes (`.shop-compare-header`, `.shop-compare-label`, `.shop-compare-val`, `.shop-compare-new`, `.shop-compare-diff` with `.pos`/`.neg`/`.neu` variants), and `.shop-bottom-bar`. In `js/campaign-system.js`: added module-level `const _shopRarityColors` with the five rarity colours; completely rebuilt `showShop()` — resets the overlay inline styles to remove old padding/centering before injecting the new layout; buy column lists each `_shopStock` item as a `.shop-item-row` with rarity bar, name (rarity-coloured), type/rarity/level meta, and price; the detail panel renders below the list when an item is selected, showing the item name and a comparison grid that switches between 4-column (stat/equipped/new/diff) when a same-slot item is equipped and 2-column (stat/new) when nothing is equipped; the buy button or a muted "Not enough scrap"/"Inventory full" message appears at the bottom of the detail panel; the sell column lists every `_inventory` item as a `.shop-item-row` with sell price in green; the Restock button moves into the buy column header; the Back button is in the top bar.

### Files Changed

- `css/menus.css` — full supply shop CSS block added
- `js/campaign-system.js` — _shopRarityColors const added; showShop() fully rebuilt
- `CHANGELOG.md` — this entry

---

## v5.54 — Multiplayer hangar restructured to match warzone layout

**Date:** 2026-03-22

Restructured the PVP loadout screen to exactly mirror the warzone hangar layout. In `css/menus.css`: updated `.mp-left` to remove `padding` and `gap` (moved to a new child class) and added `background:#080b0e`; added `.mp-left-controls` (padding 16px 20px, border-bottom, flex column, gap 6px) to wrap all dropdown controls separately from the preview; updated `.mp-preview-zone` to remove `border-bottom` and add `flex:1` so it fills the remaining left column height; updated `.mp-preview-box` from 140×140 to 160×160px and added `flex-shrink:0`; updated `.mp-right` to add `background:#080b0e` and `min-width:0`; added `.mp-stats-header` (padding 10px 20px, border-bottom, small uppercase label); removed `.mp-bottom` entirely since the action button moves to the top bar. In `js/multiplayer.js`: completely rebuilt `_pvpRenderHangar()` — the top bar now holds the Back button, centered "MULTIPLAYER" title, and the Join Lobby / Deploy Mech button at the far right (replacing the old bottom bar); the left column splits into `.mp-left-controls` (all chassis buttons, colour dropdown and six gear slot rows) and `.mp-preview-zone` (160×160 mech preview with sci-corner accents and chassis·colour label below); the right column uses `.mp-stats-header` "Build stats" then a scrollable stats panel built with the same stat calculation logic as the warzone garage — HP, HP split, speed (with hydraulic boost), shield (with absorb and regen delay), L/R fire rate with DPS and brace bonus, core mod CD, chassis traits, passives, and individual slot name rows — all using `.hg-stat-row`/`.hg-stat-label`/`.hg-stat-val` classes with green/warn/dim/purple color variants and `.hg-gap` separators between groups.

### Files Changed

- `css/menus.css` — mp-left restructured; mp-left-controls added; mp-preview-zone flex:1; mp-preview-box 160px; mp-right min-width/background; mp-stats-header added; mp-bottom removed
- `js/multiplayer.js` — _pvpRenderHangar fully rebuilt with two-column warzone-style layout and full stat panel
- `CHANGELOG.md` — this entry

---

## v5.53 — Three small UI fixes: callsign label centering, leaderboard tab hover, lobby chat keystroke passthrough

**Date:** 2026-03-22

Three targeted fixes across the callsign screen, leaderboard, and multiplayer lobby. In `index.html`: added `align-self:center;text-align:center` inline to the `.cs-field-label` element inside `#callsign-screen` so the "Enter callsign" label is centred above the input field. In `css/menus.css`: added `.lb-filter-tab:hover:not(.active)` rule that applies the same cyan highlight as the active state on hover, giving the filter tabs a visible interactive response. In `js/multiplayer.js`: added `onfocus` and `onblur` handlers to the `#mp-chat-input` element that set `window._chatInputFocused` so game systems can check this flag; added `event.stopPropagation()` as the first call in the `onkeydown` handler so WASD and E keystrokes are not intercepted by the global game keyboard listener while the player is typing in the lobby chat box.

### Files Changed

- `index.html` — cs-field-label align-self + text-align center
- `css/menus.css` — .lb-filter-tab:hover:not(.active) rule
- `js/multiplayer.js` — mp-chat-input onfocus/onblur flags; stopPropagation on keydown
- `CHANGELOG.md` — this entry

---

## v5.52 — Multiplayer screen redesign, campaign top bar and LVL/XP fixes

**Date:** 2026-03-22

Redesigned the PVP hangar and lobby screens and fixed two campaign UI issues. In `css/menus.css`: added two new sections — Multiplayer loadout screen classes (`.mp-screen`, `.mp-top`, `.mp-screen-title`, `.mp-body`, `.mp-left`, `.mp-sec-label`, `.mp-chassis-row`, `.mp-chassis-btn`, `.mp-dd-row`, `.mp-dd-label`, `.mp-dd-selected`, `.mp-right`, `.mp-preview-zone`, `.mp-preview-box`, `.mp-bottom`) and Lobby screen classes (`.lobby-hdr`, `.lobby-player-row`, `.lobby-dot`, `.lobby-player-name`, `.lobby-player-loadout`, `.lobby-ready-badge`). In `js/multiplayer.js`: `mpShowPvpHangar()` updated to set `el.className = 'mp-screen'` instead of inline styles; `_pvpRenderHangar()` completely rebuilt using the new layout — top bar with centered title, left panel with chassis buttons (`.mp-chassis-btn`), colour and gear slot rows (`.mp-dd-selected`), right panel with mech preview box and build stats using `.hg-stat-row` classes, and a bottom bar with action buttons; weapon slot labels now show clean full names only (no DPS suffix); `mpShowLobby()` completely rebuilt with `.mp-screen` layout — left panel with lobby code, your loadout summary, ready/leave buttons and chat, right panel with four `.lobby-player-row` slots including `.lobby-dot` status and `.lobby-ready-badge`; `mpUpdateLobbyUI()` rewritten to render all four player slots (filled + empty), enable/disable the Start Game button, and update bottom status text; added `_mpToggleReady()` and `_mpLocalReady` state for per-player ready tracking. In `js/campaign-system.js`: `showMissionSelect()` top bar rebuilt — CAMPAIGN title is now `position:absolute;left:50%;transform:translateX(-50%)` so it floats independently of flex items; LVL/XP text placed immediately below also absolute-positioned with `margin-top:22px`; Supply Shop button has `margin-left:auto` to push it flush right; the `.cm-top` container given `position:relative` inline.

### Files Changed

- `css/menus.css` — mp-screen/lobby CSS class blocks
- `js/multiplayer.js` — mpShowPvpHangar, _pvpRenderHangar, mpShowLobby, mpUpdateLobbyUI, _mpToggleReady rebuilt
- `js/campaign-system.js` — showMissionSelect top bar layout fixed
- `CHANGELOG.md` — this entry

---

## v5.51 — Callsign screen and leaderboard overlay redesign

**Date:** 2026-03-22

Full visual redesign of the callsign entry screen and leaderboard overlay. In `css/menus.css`: added two new sections at the end of the file — Callsign screen styles (`.cs-inner`, `.cs-eyebrow`, `.cs-title`, `.cs-field-label`, `.cs-input-wrap`) giving the entry screen a centred two-line title with a `<span>` accent, a bottom-bordered input strip, and a transparent monospaced input; Leaderboard overlay styles (`.lb-top`, `.lb-title`, `.lb-filters`, `.lb-filter-tab`, `.lb-table-wrap`, `.lb-table-header`, `.lb-th`, `.lb-row`, `.lb-row.lb-me`, `.lb-rank`, `.lb-callsign`, `.lb-val`, `.lb-you-tag`) giving the overlay an edge-to-edge panel layout with filter tabs and a five-column grid table. In `index.html`: `#callsign-screen` rebuilt using the new CSS classes — added sci-corner decorators, `.cs-inner` wrapper with eyebrow/title/field-label/input-wrap/proceed-btn structure, version tag positioned absolute bottom-right; `#leaderboard-overlay` rebuilt with `.lb-top` (back button + centred title), `.lb-filters` (All time / Warzone / Campaign tabs), and `.lb-table-wrap` containing a static header row plus `#lb-loading`, `#lb-table`, `#lb-empty` slots. In `js/menus.js`: `_renderScores()` completely rewritten to build five-column rows using DOM elements with new CSS classes, highlighting the current player's row with `.lb-me` and their callsign with `.lb-you-tag`; added module-level `_lbAllScores` and `_lbCurrentFilter` variables; added `_lbSetFilter(type, el)` which updates tab active state and re-renders the table filtered by mode field ('all', 'warzone', 'campaign'); updated `showLeaderboard()` to reset filter state to 'all' on open and removed the now-absent `lb-submit-panel` references.

### Files Changed

- `css/menus.css` — callsign screen classes; leaderboard overlay classes
- `index.html` — #callsign-screen rebuilt; #leaderboard-overlay rebuilt
- `js/menus.js` — _renderScores rewritten with CSS classes; _lbSetFilter added; showLeaderboard filter reset
- `CHANGELOG.md` — this entry

---

## v5.50 — Hangar layout redesign: two-column split with left chassis/preview column and full-width stats panel

**Date:** 2026-03-22

Full hangar layout overhaul across three files. In `css/garage.css`: removed `.hg-center` and `.hg-sidebar`/`.hg-section-label` (replaced by previous session); added `.hg-left` (260px fixed, border-right, flex column), `.hg-left-top` (chassis buttons + colour dropdown, border-bottom), `.hg-preview-zone` (centered flex column for mech preview image + label); replaced old `.hg-right` (fixed 320px) with new `flex:1` version that takes all remaining width; replaced `.hg-stat-row` grid (120px columns) with new version (130px, `align-items:baseline`); added `.hg-stats-header` for the Build Stats heading row; added `.hg-gap` (6px spacer between stat groups); added CSS class variants `.hg-stat-val.dim`, `.hg-stat-val.green`, `.hg-stat-val.purple`; updated `.hg-deploy-zone` with `border-top` and `padding:16px 20px`. In `index.html`: completely rebuilt `.hg-body` contents — left column (`.hg-left`) holds chassis buttons, colour dropdown and dual-explosive warning in `.hg-left-top`, then mech preview image (160×160) and `#preview-chassis-label` in `.hg-preview-zone`; right column (`.hg-right`) has `.hg-stats-header` then `#garage-stats-panel` then `#starter-loadout-panel` (deploy zone removed from HTML, now CSS-only via `margin-top:auto`). In `js/garage.js`: `updateGarageStats()` rewritten to use CSS class variants (`green`, `dim`, `warn`, `purple`) instead of inline color styles, and to emit `<div class="hg-gap">` dividers between four logical groups (HP / Mobility+Defense / Weapons / Chassis+Passives); `refreshGarage()` now sets `#preview-chassis-label` text to `CHASSIS · COLOUR` after updating chassis button active states; `_updateStarterPanel()` rewritten to use `.hg-stat-val.green` / `.hg-stat-val.warn` class variants instead of `style="color:…"`.

### Files Changed

- `css/garage.css` — new two-column layout classes; hg-gap; class variants; hg-deploy-zone border-top
- `index.html` — hg-body fully rebuilt with hg-left/hg-right structure
- `js/garage.js` — updateGarageStats CSS classes + gap groups; refreshGarage chassis label; _updateStarterPanel class variants
- `CHANGELOG.md` — this entry

---

## v5.49 — Five layout and UX fixes: campaign title centring, cloud toast, loading text, hangar stats, WARZONE label

**Date:** 2026-03-22

Five targeted fixes across hangar and campaign screens. In `css/menus.css`: added `position:relative` to `.cm-top` and changed `.cm-top > .cm-title` to `position:absolute; left:50%; transform:translateX(-50%); pointer-events:none;` so the CAMPAIGN title floats centred independently of the button positions. In `js/menus.js`: replaced the `_showCloudStatusToast` function body with a no-op `return;` to stop the CLOUD SAVE SYNCED banner from appearing; fixed two innerHTML assignments that were replacing the entire `#resume-campaign-btn` span structure with unstructured text — both now use `querySelector('span:nth-child(2)').textContent` to update only the label span, preserving the three-span layout; changed both occurrences of `'COMBAT SIMULATION'` in the hangar mode label to `'WARZONE'`. In `css/garage.css`: added `overflow:visible` to `.hg-sidebar` so the colour dropdown is not clipped; widened `.hg-right` to 320px with `overflow-y:auto`; changed `.hg-stat-row` to a two-column grid (120px label / 1fr value) with 8px gap; updated `.hg-stat-val` to `text-align:left` and removed the old ellipsis clipping; increased `.hg-center` padding to 32px. In `index.html`: preview container resized 160px → 240px.

### Files Changed

- `css/menus.css` — .cm-top position:relative; .cm-top > .cm-title absolute centred
- `css/garage.css` — hg-sidebar overflow:visible; hg-right 320px; hg-stat-row grid; hg-stat-val left; hg-center padding 32px
- `js/menus.js` — _showCloudStatusToast no-op; loading text span fix; WARZONE label
- `index.html` — preview-container 240px
- `CHANGELOG.md` — this entry

---

## v5.48 — Hangar panel widths, chassis button text, stat value wrapping

**Date:** 2026-03-22

Five targeted CSS edits in `css/garage.css`. `.hg-sidebar` width increased 200px → 220px to give chassis buttons more room. `.hg-right` width increased 260px → 280px and `flex-shrink:0` added so the stats panel never collapses. `.hg-chassis-btn` updated: `justify-content` changed from `space-between` to `flex-start`, `font-size` bumped to 11px, `gap:8px` and `flex-wrap:nowrap` added. `.hg-chassis-sub` updated: `font-size` 8px → 9px, `margin-left:6px` and `white-space:nowrap` added. `.hg-center` changed to `flex:1 1 auto` with `min-width:0`. `.hg-stat-val` changed to `font-size:11px`, `white-space:normal`, `word-break:break-word` (removing the old `overflow:hidden; text-overflow:ellipsis` that was cutting off values). The `#resume-campaign-btn` in `index.html` was already correct — no change needed.

### Files Changed

- `css/garage.css` — hg-sidebar, hg-right, hg-chassis-btn, hg-chassis-sub, hg-center, hg-stat-val
- `CHANGELOG.md` — this entry

---

## v5.47 — Verified hangar top bar inline styles (no-op)

**Date:** 2026-03-22

Verification pass only — no code changes made. Confirmed that all three targeted edits were already applied in v5.46: `#hangar-mm-btn` has `style="flex:0 0 auto;width:auto;"`, `#deploy-btn` has `style="flex:0 0 auto;width:auto;"`, and `.hg-top` in `css/garage.css` already contains `align-items:center`.

### Files Changed

- `CHANGELOG.md` — this entry

---

## v5.46 — Inline styles on hangar and campaign top bar buttons to prevent stretching

**Date:** 2026-03-22

Applied explicit inline `style` attributes directly to flex children in the hangar and campaign top bars, since CSS class rules alone were insufficient. In `index.html`: `#hangar-mm-btn` and `#deploy-btn` both get `style="flex:0 0 auto;width:auto;"` so they never grow; the title/subtitle wrapper div gets `style="flex:1 1 auto;min-width:0;"` so it fills remaining space. In `js/campaign-system.js` inside `showMissionSelect()`: Back, Supply Shop, and Loadout buttons in the `.cm-top` HTML string all updated to `style="flex:0 0 auto;width:auto;"`; `.cm-title` div updated to `style="flex:1 1 auto;min-width:0;"`; Deploy button in `.cm-bottom` updated to `style="flex:0 0 auto;width:auto;margin-left:auto;"`. No CSS files were touched.

### Files Changed

- `index.html` — #hangar-mm-btn, title wrapper, #deploy-btn inline styles
- `js/campaign-system.js` — cm-top and cm-bottom button inline styles
- `CHANGELOG.md` — this entry

---

## v5.45 — CSS child-selector rules to prevent top bar button stretching

**Date:** 2026-03-22

Added CSS child-selector rules to stop buttons from growing inside the hangar and campaign flex rows. In `css/garage.css`: added `.hg-top > button { flex:0 0 auto; width:auto; min-width:0; align-self:center; }` and `.hg-top > div { flex:1 1 auto; min-width:0; }` after the `.hg-top` rule — buttons stay compact, the title div fills remaining space. In `css/menus.css`: added matching `.cm-top > button, .cm-top > .tw-btn` (same `flex:0 0 auto`) and `.cm-top > .cm-title { flex:1 1 auto; }` rules after `.cm-top`; and `.cm-bottom > button, .cm-bottom > .tw-btn { flex:0 0 auto; margin-left:auto; }` plus `.cm-bottom > .cm-xp-bar { flex:1 1 auto; }` after `.cm-bottom`. No JS files were touched.

### Files Changed

- `css/garage.css` — .hg-top child-selector rules added
- `css/menus.css` — .cm-top and .cm-bottom child-selector rules added
- `CHANGELOG.md` — this entry

---

## v5.44 — Fix hangar top bar button positioning

**Date:** 2026-03-22

Fixed two CSS rules in `css/garage.css` that were breaking the `.hg-top` flex row layout. `#hangar-mm-btn` had `position:absolute; right:16px; top:14px; box-sizing:border-box` which pulled the Back button out of the flex flow entirely — replaced with `flex-shrink:0; width:auto` so it sits as the first flex item on the left. `#deploy-btn` had `font-size`, `overflow:hidden`, and `padding:12px` overrides that were conflicting with the `tw-btn` base styles and causing unwanted stretching — replaced with `flex-shrink:0; width:auto`. The `#deploy-btn.overweight` error-state rule was not touched.

### Files Changed

- `css/garage.css` — #hangar-mm-btn and #deploy-btn rules replaced
- `CHANGELOG.md` — this entry

---

## v5.43 — Hangar full-screen layout, mission select button widths, main menu stats

**Date:** 2026-03-22

Fixed the hangar, campaign mission select, and main menu stats panel. In `css/garage.css`: changed `#ui-layer` from `align-items:center; justify-content:center` to `align-items:stretch; justify-content:flex-start` so the garage fills the viewport instead of floating centred; added `#garage-menu` override rule resetting all `.stat-readout` card styles (border, radius, shadow, padding, width) to a full-screen flex column; added `flex-shrink:0; width:100%` to `.hg-top` and `min-height:0` to `.hg-body` so the top bar and body column share height correctly. In `js/campaign-system.js`: added `style="flex:1;"` inline to the `.cm-title` div so only the title grows while all surrounding buttons stay compact; removed the mission briefing panel that was added in v5.42 (deploy button in `.cm-bottom` remains). In `js/menus.js`: wrapped the entire body of `_updateMainMenuStats()` in a `setTimeout(..., 100)` so it runs after state has loaded; switched to optional chaining (`_campaignState?.completedMissions`) for safety; added a `_updateMainMenuStats()` call to `goToMainMenu()` so stats are fresh when returning from a run.

### Files Changed

- `css/garage.css` — #ui-layer stretch layout; #garage-menu full-screen override; hg-top/hg-body fixes
- `js/campaign-system.js` — cm-title flex:1 inline; mission briefing panel removed
- `js/menus.js` — _updateMainMenuStats setTimeout wrap + optional chaining; call added to goToMainMenu()
- `CHANGELOG.md` — this entry

---

## v5.42 — Four layout fixes: hangar top bar, stat row wrapping, campaign sub-menu star, mission briefing panel

**Date:** 2026-03-22

Fixed four layout regressions across the hangar and campaign screens. In `index.html`: added `style="width:auto;flex-shrink:0;"` to `#deploy-btn` in `.hg-top` so it stays compact; changed Resume Campaign's first span text from `01` to `★` (still constrained to `font-size:9px; min-width:20px`) so it visually identifies as a saved-game slot without rendering taller than New Campaign. In `js/menus.js`: fixed the `resumeBtn.innerHTML` assignment to restore the full three-span structure (`★` / label / `›`) instead of unstyled raw text, ensuring Resume Campaign and New Campaign are pixel-identical. In `css/garage.css`: added `white-space:nowrap` to `.hg-stat-label`, added `text-align:right; min-width:0; overflow:hidden; text-overflow:ellipsis` to `.hg-stat-val`, and widened `.hg-right` from 220px to 260px to give stat rows enough room. In `js/campaign-system.js`: added `margin-left:auto` to the Deploy button in `.cm-bottom` so it snaps to the right edge; restored the mission briefing panel — a `var(--sci-cyan-dim)` block inserted below the scrollable mission list when a mission is selected, showing the mission name (13px cyan, 3px ls), briefing text (10px muted), and enemy level in a difficulty-coded colour (green/gold/red).

### Files Changed

- `index.html` — deploy-btn gets flex-shrink:0; Resume Campaign span uses ★
- `js/menus.js` — resumeBtn.innerHTML restored to full span structure
- `css/garage.css` — stat label nowrap, stat val right-aligned + ellipsis, hg-right 260px
- `js/campaign-system.js` — Deploy margin-left:auto; mission briefing panel restored
- `CHANGELOG.md` — this entry

---

## v5.41 — Three layout fixes: main menu active state, campaign sub-menu size, mission select button widths

**Date:** 2026-03-22

Fixed three layout regressions from the recent sci-fi UI redesign. In `index.html`: removed the hardcoded `active` class from the Campaign `.sci-nav-item` so no item is highlighted on page load — hover state is CSS-only. In `js/menus.js`: changed `resumeBtn.style.display` from `'inline-block'` to `'flex'` at both show-points in `showCampaignSubMenu()` so that Resume Campaign renders as a flex row matching the `.sci-nav-item` CSS rule and stays the same height as New Campaign. In `js/campaign-system.js`: added `style="width:auto;flex-shrink:0;"` inline to the Back, Supply Shop, and Loadout buttons in the `.cm-top` bar of `showMissionSelect()`, and to the Deploy button in `.cm-bottom`, preventing all four from stretching across the flex container.

### Files Changed

- `index.html` — removed hardcoded `active` from Campaign nav item
- `js/menus.js` — resumeBtn.style.display changed to 'flex'
- `js/campaign-system.js` — width:auto;flex-shrink:0 added to Back, Supply Shop, Loadout, Deploy buttons
- `CHANGELOG.md` — this entry

---

## v5.40 — Sci-fi pause screen rebuild

**Date:** 2026-03-22

Rebuilt the pause screen overlay with a clean sci-fi panel design. In `css/menus.css`: added `.ps-panel` (300px, `--sci-cyan-border` frame, dark bg), `.ps-header` (flex space-between, border-bottom), `.ps-title` (cyan, 5px ls), `.ps-status` (txt3), `.ps-body` (flex column, gap 8px), `.ps-btn` (full-width, sci-surface bg, 3px ls + hover glow), `.ps-btn.danger` (red tint + hover), `.ps-btn-icon` (10×10 border box), `.ps-footer`, and `.ps-hint`. In `index.html`: replaced the old animated `PAUSED` heading and `tw-btn` button list with the new `ps-panel` structure — header shows title + live round status, body has Resume / Loadout / Quit game rows with `ps-btn-icon` accents, footer shows the ESC hint. In `js/menus.js`: `togglePause()` now writes `'Round 01 active'` (zero-padded `_round`) into `#pause-round-status` each time the overlay opens.

### Files Changed

- `css/menus.css` — new pause panel classes
- `index.html` — #pause-overlay rebuilt with ps-panel structure
- `js/menus.js` — togglePause() populates #pause-round-status
- `CHANGELOG.md` — this entry

---

## v5.39 — Sci-fi campaign mission select rebuild

**Date:** 2026-03-22

Rebuilt the campaign mission select screen with a sci-fi split-panel layout. In `css/menus.css`: added a new CAMPAIGN MISSION SELECT section with `.cm-top` (top bar), `.cm-title`, `.cm-body` (flex row), `.cm-left` (240px scrollable chapter list) with `.cm-chapter` (`.active`, `.locked`, `-num`, `-name`, `-prog`), `.cm-main` (flex:1 column) with `.cm-mission` (`.selected`, `-num`, `-done`, `-name`, `-brief`, `-lv`, `-lv.boss`) and `.cm-bottom` (deploy bar) with `.cm-xp-bar` / `.cm-xp-fill`. In `js/campaign-system.js`: rewrote `showMissionSelect()` — old gold-themed inline styles replaced entirely with CSS classes; overlay padding/align overridden in JS for full-panel fit; top bar now holds Back, title, LV/XP span, Supply Shop, and Loadout buttons; chapters render as `.cm-chapter` divs with `active`/`locked` classes; missions render as `.cm-mission` divs with `selected` class; deploy button (`.tw-btn--solid`) only rendered when a mission is selected. All onclick handlers preserved.

### Files Changed

- `css/menus.css` — new campaign mission select layout classes
- `js/campaign-system.js` — showMissionSelect() rewritten with sci-fi layout
- `CHANGELOG.md` — this entry

---

## v5.38 — Sci-fi three-column hangar UI rebuild

**Date:** 2026-03-22

Rebuilt the mech hangar UI with a three-column sci-fi split-panel layout. In `css/garage.css`: added a new HANGAR SPLIT-PANEL LAYOUT section with `.hg-top` (top bar with border), `.hg-title`, `.hg-subtitle`, `.hg-body` (flex row), `.hg-sidebar` (200px left column), `.hg-section-label`, `.hg-chassis-btn` (with `:hover`, `.active`, and `.hg-chassis-sub` sub-label), `.hg-center` (flex:1 preview area), `.hg-right` (220px right column), `.hg-stat-row`, `.hg-stat-label`, `.hg-stat-val` (+ `.warn`), and `.hg-deploy-zone`. In `index.html`: replaced the old single-column `#garage-menu` with the new three-column structure — left sidebar has chassis selector buttons (`hg-chassis-btn`) and the colour dropdown; center has the 160×160 preview with sci-corner brackets; right panel holds build stats and the deploy zone. In `js/garage.js`: `updateGarageStats()` and `_updateStarterPanel()` updated to emit `.hg-stat-row` / `.hg-stat-label` / `.hg-stat-val` markup; `refreshGarage()` chassis toggle was already using `classList.toggle('active')` and works unchanged.

### Files Changed

- `css/garage.css` — new hangar split-panel layout classes
- `index.html` — #garage-menu rebuilt with three-column structure
- `js/garage.js` — updateGarageStats and _updateStarterPanel use hg-stat-* classes
- `CHANGELOG.md` — this entry

---

## v5.37 — Sci-fi split-panel main menu

**Date:** 2026-03-22

Rebuilt the main menu with a two-column sci-fi layout. Left panel (`.mm-left`, 52% width): sci-corner bracket accents, `// System online` eyebrow, stacked TECH / WARRIOR / ONLINE title with a cyan accent span, and a `.mm-nav` block using `.sci-nav-item` rows for Campaign, Warzone, Multiplayer, and Leaderboard. Campaign sub-menu (Resume / New / Back) sits directly below the nav, toggled by `showCampaignSubMenu` / `hideCampaignSubMenu`. Right panel (`.mm-right`): sci-corner brackets, mission count and best-round stat blocks with 44px cyan numerals, a `.sci-divider` labelled "Pilot status", callsign display, a 3px XP progress bar, and the version label at `margin-top:auto`. In `css/menus.css`: replaced the old centred `#main-menu` block and added `.mm-left`, `.mm-right`, `.mm-eyebrow`, `.mm-title`, `.mm-title-accent`, `.mm-nav`, `.mm-stat-num`, `.mm-stat-label`, `.mm-stats-row`, `.mm-stat-divider`, `.mm-xp-bar`, and `.mm-xp-fill`. In `js/menus.js`: added `_updateMainMenuStats()` (populates callsign, mission count, best round, and XP bar from live state), called from `proceedToMainMenu`, `returnToMainMenu`, and `_cancelNewCampaign`.

### Files Changed

- `css/menus.css` — new #main-menu split-panel layout classes
- `index.html` — #main-menu div rebuilt with new structure
- `js/menus.js` — _updateMainMenuStats() added; called at all main menu entry points
- `CHANGELOG.md` — this entry

---

## v5.36 — Sci-fi .tw-btn system overhaul

**Date:** 2026-03-22

Replaced the old `.tw-btn` visual system across `css/base.css` and `css/menus.css` with a clean sci-fi design. In `:root`: updated button geometry tokens (smaller padding/font/letter-spacing), removed all `--border-*` and `--tg-*` (text-glow) tokens, and added 13 new `--sci-*` palette tokens (`--sci-cyan`, `--sci-red`, `--sci-gold`, `--sci-line`, `--sci-txt/2/3`, `--sci-surface`, and their dim/border/bright variants). The `.tw-btn` base is now `inline-flex` with a uniform `1px` border and 0.15s transition — no more asymmetric borders or letter-spacing hover expansion; hover simply fills with `--sci-cyan-dim` and brightens the border. Old `--gold` and `--green` variants removed; new `--solid` and `--ghost` variants added. `.tw-btn--error` and `.tw-btn--disabled` updated to use sci tokens. In `menus.css`: `.menu-start-btn` and `.pause-menu-btn` stripped to pure layout (no visual properties), and five new structural utility classes added — `.sci-panel`, `.sci-corner` (with tl/tr/bl/br variants), `.sci-divider`, `.sci-nav-item`, and `.sci-stat-row`.

### Files Changed

- `css/base.css` — new sci-fi button tokens and .tw-btn system; removed --border-* and --tg-* tokens
- `css/menus.css` — .menu-start-btn and .pause-menu-btn stripped to layout only; sci structural classes added
- `CHANGELOG.md` — this entry

---

## v5.35 — Back button top-left, deploy/join below image, remove loot hint text

**Date:** 2026-03-22

Standardised back/quit button placement and action button layout across three menus. In `js/multiplayer.js` (`_pvpRenderHangar`): moved the BACK button to `position:absolute;top:20px;left:24px` with `tw-btn tw-btn--danger tw-btn--sm`, replaced all three inline-styled action buttons (JOIN LOBBY, DEPLOY MECH, QUIT MATCH) with `tw-btn tw-btn--block` / `tw-btn tw-btn--danger tw-btn--block` classes, and changed the button container from `margin-top:auto` to `margin-top:8px` so buttons appear directly below the chassis image. In `index.html`: added `tw-btn--sm` to the LIGHT/MEDIUM/HEAVY chassis selector buttons; moved the DEPLOY MECH button (`#deploy-btn`) to appear directly below `#preview-container` with `margin-top:8px`; confirmed `#hangar-mm-btn` has `tw-btn tw-btn--danger tw-btn--sm`. In `js/garage.js` (`_updateStarterPanel`): removed the CPU, LEGS, and AUGMENT "find through loot" rows and the loot drop hint paragraph. In `js/campaign-system.js` (`showMissionSelect`): renamed the QUIT button to BACK (with arrow prefix), moved it to `position:absolute;top:20px;left:24px`, and removed it from the header row.

### Files Changed

- `js/multiplayer.js` — back button top-left; JOIN LOBBY, DEPLOY MECH, QUIT MATCH converted to tw-btn; buttons now directly below chassis image
- `index.html` — chassis buttons get tw-btn--sm; deploy button moved directly below preview image
- `js/garage.js` — CPU/LEGS/AUGMENT rows and loot hint removed from starter panel
- `js/campaign-system.js` — QUIT → BACK, moved to top-left position:absolute
- `CHANGELOG.md` — this entry

---

## v5.34 — Text, label, and layout changes to index.html

**Date:** 2026-03-22

Removed the "CALLSIGN REQUIRED TO CONTINUE" hint div from the callsign screen. Renamed the two main menu buttons: "COMBAT SIMULATION" → "WARZONE" and "MULTIPLAYER PVP" → "MULTIPLAYER". Removed the `margin-top:8px` inline style from the leaderboard menu button so all four buttons share consistent spacing from the parent flex gap. Moved the leaderboard back button from the bottom footer to the top-left of the leaderboard content div (wrapped in a flex row), added `tw-btn--sm` to its classes, and removed its `width`/`text-align` inline style overrides.

### Files Changed

- `index.html` — callsign hint removed; menu labels updated; leaderboard button margin removed; leaderboard back button repositioned
- `CHANGELOG.md` — this entry

---

## v5.33 — Refactor 5 card-style buttons to CSS custom property system (Findings 3, 7, 8, 9, 10)

**Date:** 2026-03-22

Replaced all inline `background`, `border`, `border-left`, and `box-shadow` color overrides on the five card-style buttons identified in BUTTON_AUDIT.md. Each button's dynamic accent color is now passed as a single CSS custom property (`style="--card-color:${color};"`) and referenced in new CSS modifier classes added to `css/menus.css`: `.chassis-card` (with `.active` and `.locked` states), `.chapter-tab` (with `.active` and `.locked` states), `.mission-card` (with `.selected` and `.completed` states), `.shop-item-card` (with `.selected` state), and `.shop-sell-card`. In `js/menus.js` the chassis card button was simplified to `class="tw-btn chassis-card"` plus `active` state from JS. In `js/campaign-system.js` the chapter tab `cls` string injection was replaced with state classes, and all three shop/mission card buttons were updated to their new modifier classes with `--card-color` only.

### Files Changed

- `css/menus.css` — five new card modifier class sections added
- `js/menus.js` — chassis card button updated (Finding 3)
- `js/campaign-system.js` — chapter tab, mission card, shop item card, and shop sell card buttons updated (Findings 7–10)
- `CHANGELOG.md` — this entry

---

## v5.32 — Fix 4 non-compliant buttons (Findings 1, 2, 4, 5)

**Date:** 2026-03-22

Added `tw-btn tw-btn--sm` as base classes to the four buttons identified in BUTTON_AUDIT.md that were missing the design-system base class. The two loadout tab buttons in `index.html` (`#loadout-tab-stats`, `#loadout-tab-gear`) received the new base classes, and `.loadout-tab` in `css/menus.css` was reduced to layout-only overrides (`flex`, border-radius per side), with `.loadout-tab.active` and `.loadout-tab:hover:not(.active)` kept as color-only overrides. The arm picker L and R buttons in `js/menus.js` received `tw-btn tw-btn--sm arm-picker-btn`; the Cancel button received `tw-btn tw-btn--sm arm-picker-btn arm-picker-btn--cancel` with its inline `color`/`border-color` style removed. `.arm-picker-btn` in `css/menus.css` was stripped to layout-only properties (`border-radius`, `margin`, `min-width`), and a new `.arm-picker-btn--cancel` modifier encodes the muted appearance via CSS.

### Files Changed

- `index.html` — `tw-btn tw-btn--sm` added to `#loadout-tab-stats` and `#loadout-tab-gear`
- `js/menus.js` — `tw-btn tw-btn--sm` added to arm picker L/R buttons; Cancel button updated to `arm-picker-btn--cancel` with inline style removed
- `css/menus.css` — `.loadout-tab` reduced to layout-only; `.arm-picker-btn` reduced to layout-only; `.arm-picker-btn--cancel` modifier added
- `CHANGELOG.md` — this entry

---

## v5.31 — Remove letter-spacing shift from .tw-btn hover states

**Date:** 2026-03-22

Removed the hover letter-spacing expansion from all `.tw-btn` variants in `css/base.css`. The `--btn-ls-hover` and `--btn-ls-sm-hover` token definitions were deleted from `:root`, and the corresponding `letter-spacing` declarations were removed from the `:hover` rules of `.tw-btn`, `.tw-btn--danger`, `.tw-btn--gold`, `.tw-btn--green`, and `.tw-btn--sm` (the `.tw-btn--sm:hover` block, which contained only that one property, was removed entirely). Button hover effects now only change border color, text color, and text-shadow glow — text size and spacing remain identical to the default state. No other files were modified.

### Files Changed

- `css/base.css` — `--btn-ls-hover` and `--btn-ls-sm-hover` removed from `:root`; `letter-spacing` line removed from all five `.tw-btn` `:hover` rules
- `CHANGELOG.md` — this entry

---

## v5.30 — Add missing tw-btn base class to menu and pause buttons

**Date:** 2026-03-22

Added `tw-btn` as the base class to 10 buttons in `index.html` that were using layout classes (`menu-start-btn`, `pause-menu-btn`) without it. The four main-menu buttons, two campaign sub-menu buttons, the campaign back button, the leaderboard back button, and the two pause-menu buttons all received `tw-btn` as their first class; the two red/danger buttons (`hideCampaignSubMenu`, `closeLeaderboard`, `goToMainMenu`) also had their `menu-btn-red`/`pause-btn-red` variant replaced with `tw-btn--danger` to align with the design system. No other attributes, styles, scripts, or buttons were touched.

### Files Changed

- `index.html` — `tw-btn` added to 10 buttons; `menu-btn-red`/`pause-btn-red` replaced with `tw-btn--danger`
- `CHANGELOG.md` — this entry

---

## v5.29 — Full button migration audit: all buttons on .tw-btn system

**Date:** 2026-03-22

Completed a full button migration audit across `index.html`, `js/campaign-system.js`, `js/menus.js`, and `js/perks.js`. All remaining inline button appearance styles (background, border, color, font-size, letter-spacing, box-shadow, text-shadow, padding, text-transform, cursor, font-family, transition) have been removed and replaced by the `.tw-btn` base class or the appropriate variant (`.tw-btn--gold`, `.tw-btn--danger`, `.tw-btn--green`, `.tw-btn--sm`, `.tw-btn--block`, `.tw-btn--disabled`). Every `<button>` element in the four scanned files now carries `.tw-btn` as its base class or an established design-system class (`menu-start-btn`, `pause-menu-btn`, `loadout-tab`, `arm-picker-btn`). `onmouseover`/`onmouseout` hover handlers were confirmed absent across all four files. Layout-only inline style properties (position, top, right, width, margin, display, min-width, flex, gap, text-align) were preserved. All onclick handlers were left untouched.

### Files Changed

- `index.html` — chassis selector buttons (`#c-light`, `#c-medium`, `#c-heavy`) given `tw-btn` base class
- `js/campaign-system.js` — chapter-tab buttons, mission-card buttons, shop-item cards, and shop-sell cards given `tw-btn` base class; `cursor:pointer` and `font-family` appearance removed from card-style buttons; `border:1px solid` and `padding` duplicating defaults removed from chapter tabs
- `js/menus.js` — chassis-select card buttons given `tw-btn` base class; `cursor:pointer`, `font-family`, and `transition` removed
- `js/perks.js` — confirmed already clean; no changes needed

---

## v5.28 — Fix duplicate UI_COLORS and _loadCampaignData reference error

**Date:** 2026-03-22

### Bug Fixes

- **Duplicate `UI_COLORS` declaration (SyntaxError):** `const UI_COLORS` was defined in both `js/menus.js` (line 5) and `js/campaign-system.js`. Since `menus.js` loads first, the second declaration in `campaign-system.js` threw `Uncaught SyntaxError: Identifier 'UI_COLORS' has already been declared`, preventing `campaign-system.js` from executing at all. Fixed by removing the duplicate block from `campaign-system.js`. The canonical definition lives in `menus.js`.
- **`_loadCampaignData` not defined (ReferenceError):** This was a direct consequence of the SyntaxError above — because `campaign-system.js` failed to load, `_loadCampaignData` was never defined and the `menus.js:388` call threw `Uncaught ReferenceError: _loadCampaignData is not defined`. Confirmed that `_loadCampaignData` is a top-level `async function` in `campaign-system.js` and the call site in `menus.js` is correct. No changes needed beyond fixing Bug 1.

### Files Changed

- `js/campaign-system.js` — removed duplicate `UI_COLORS` constant block (lines 580–693)

---

## v5.27 — CSS typography utility classes

**Date:** 2026-03-22

Scanned all four CSS files (`base.css`, `hud.css`, `garage.css`, `menus.css`) and `index.html` for repeated heading and label patterns, then consolidated them into nine shared utility classes appended to `css/menus.css`. Classes defined: `.tw-heading` (cyan glow overlay title), `.tw-heading--gold` (gold glow panel title), `.tw-subheading` (dim-cyan subtitle), `.tw-label` (small uppercase section label), `.tw-label--dim` (tiny muted-cyan caption), `.tw-panel-title` (small-caps panel header with bottom border), `.tw-desc` (muted body/description text), `.tw-stat-value` (cyan glowing numeric readout), and `.tw-mono` (generic monospace reset). Every class uses only existing `base.css` design tokens — no new hardcoded values introduced. Migration comments (`/* uses .tw-XYZ pattern */`) were added to 12 candidate rules in `css/menus.css` (5) and `css/garage.css` (7) to mark them for future HTML-side adoption. The three round-HUD caption divs in `index.html` (`Round`, `Remaining`, `Destroyed`) — which were identical exact-match instances of the `.tw-label--dim` pattern — had their inline styles replaced with the utility class. No JS files were changed.

### Files Changed

- `css/menus.css` — 9 utility classes added in new TYPOGRAPHY UTILITY CLASSES section; 5 migration comments added to existing rules
- `css/garage.css` — 7 migration comments added to existing rules
- `index.html` — 3 inline style attributes replaced with `class="tw-label--dim"` (round HUD captions)
- `CHANGELOG.md` — this entry

---

## v5.26 — JS UI_COLORS constant + inline style token migration

**Date:** 2026-03-22

Replaced all hardcoded color and font-family strings in JS template literal inline styles with a named `UI_COLORS` constant object, and replaced inline style colors in `index.html` with CSS `var(--token)` references.

**`UI_COLORS` constant** added near the top of `js/campaign-system.js` and `js/menus.js` (identical object in both files). The constant replicates CSS tokens as JS strings since CSS custom properties cannot be read directly from JS without `getComputedStyle`. Names mirror `css/base.css` token names (e.g. `--gold` → `UI_COLORS.gold`, `--hud-cyan-status` → `UI_COLORS.hudCyan` etc.). Covers: gold family (14 alpha steps), cyan family (12 alpha steps), HUD cyan family (9 entries), green/teal family, red/danger family, orange/amber/purple, chassis accent colors, leaderboard-specific colors, text/neutral family (11 alpha steps), and surface/overlay values.

**`js/campaign-system.js`** — All hardcoded color and `'Courier New', monospace` strings replaced with `UI_COLORS.*` references across: `showMissionSelect`, `showShop`, `showLoadoutSlots`, and `_showUpgradesPanel`. The rgba text-color base was normalized from the inconsistent 220-base to the canonical 217-base (`#c8d2d9`) throughout.

**`js/menus.js`** — Same replacement across: `returnToHangar`, `_renderChassisSelect`, `_showItemDetail`, `_unequipItem` arm-picker, `_hpBar` / `_hpBarBoosted`, `renderStatsOverlay` chassis/traits panels, `_renderWeaponPanel`, `_renderMobilityPanel`, perk-chip renderer, `_renderGearBonusesPanel`, leaderboard renderer, and `_showCloudStatusToast`.

**`index.html`** — Inline style attribute token migration: all `font-family:'Courier New',monospace` replaced with `font-family:var(--font-mono)` (21 occurrences); `background:#0c1014` with `var(--bg)`; `color:#00ffff` with `var(--cyan)`; `rgba(0,210,255,0.7)` with `var(--hud-cyan-status)`; `rgba(0,210,255,0.25)` with `var(--hud-cyan-border)`; `rgba(200,210,217,0.5)` with `var(--text-dim)`; `color:#00ff88` with `var(--green-accent)`; `color:#ffaa00` with `var(--amber)`; `color:#cc88ff` with `var(--purple)`; `color:#c8d2d9` with `var(--text)`; `#ffd700` border-left and gradient stops with `var(--gold)` and `var(--amber)`.

### Files Changed

- `js/campaign-system.js` — `UI_COLORS` constant added; all hardcoded color/font strings replaced in `showMissionSelect`, `showShop`, `showLoadoutSlots`, `_showUpgradesPanel`
- `js/menus.js` — `UI_COLORS` constant added; all hardcoded color/font strings replaced across all rendering functions
- `index.html` — inline style colors replaced with CSS `var(--token)` references; `font-family` literals replaced with `var(--font-mono)`
- `CHANGELOG.md` — this entry

---

## v5.25 — CSS token system expansion across all CSS files

**Date:** 2026-03-21

Expanded the CSS design token system established in v5.24 by adding 50 new custom properties to the `:root` block in `css/base.css`, then systematically replacing hardcoded values across all four CSS files. New token groups cover text colors (`--text`, `--text-dim`), extended brand colors (`--amber`, `--yellow`, `--red-alt`, `--red-error`, `--red-critical`, `--green-pos`, `--teal`, `--teal-dim`, `--gold-dim`), a HUD cyan family distinct from the base cyan (`--hud-cyan`, `--hud-cyan-dim`, `--hud-cyan-status`, `--hud-cyan-border`, `--hud-cyan-fill`, `--hud-cyan-fire`), overlay surfaces (`--overlay-dark`, `--overlay-pause`, `--surface-deep`), font size steps (`--text-tiny` through `--text-h2`), letter-spacing steps (`--ls-1` through `--ls-6`), and spacing steps (`--space-xs` through `--space-xl`). All four CSS files were updated: `menus.css` replaces font sizes, letter-spacing values, background surfaces, and semantic colors throughout; `garage.css` replaces font sizes, letter-spacing, color literals (`#ffaa00`, `#ffdd00`, `#ff4466`, `#44ff88`, `#ff3300`, `#c8d2d9`, `rgba(10,14,20,0.98)`), and border token usages; `hud.css` replaces all four `'Courier New', monospace` declarations and all `rgba(0,210,255,…)` / `rgba(0,225,255,…)` literals with the new HUD cyan family tokens; `base.css` non-`:root` rules replace `#c8d2d9`, `13px`, `6px` letter-spacings, `rgba(255,215,0,0.35)`, and `#ff3300` in the `.tw-btn` system and legacy button fallback.

### Files Changed

- `css/base.css` — 50 new `:root` tokens added; non-`:root` rules updated: `body color`, `button color/font-size`, `.tw-btn` hover letter-spacings, `.tw-btn--gold` border-color, `.tw-btn--error` color/border/letter-spacing
- `css/menus.css` — all font sizes, letter-spacings, surface backgrounds, and semantic colors replaced with tokens
- `css/garage.css` — all font sizes, letter-spacings, color literals, and surface values replaced with tokens
- `css/hud.css` — all `font-family: 'Courier New'`, HUD cyan color literals, `--red-alt` usage replaced with tokens
- `CHANGELOG.md` — this entry

---

## v5.24 — CSS design system + button migration

**Date:** 2026-03-21

Introduced a CSS design token system in `css/base.css`: a `:root` block groups all brand colors (cyan, red, gold, green, orange, purple), surface levels, border variants, font stacks, button geometry constants, and named glow shadow values. A canonical `.tw-btn` component with five colour variants (`--danger`, `--gold`, `--green`, and the base cyan), three utility modifiers (`--sm`, `--block`, `--disabled`), and an `--error` overweight state replaces all ad-hoc button styling across the project; CSS hover handles letter-spacing and colour transitions so no `onmouseover`/`onmouseout` attributes are needed. All static buttons in `index.html` were migrated: the callsign Proceed button, chassis selector tabs, hangar Back and Deploy buttons, death-screen Hangar and Main Menu buttons, the in-game pause/MENU button, and the stats-overlay CLOSE button — all inline appearance styles and JS hover handlers removed. Dynamic buttons in `js/campaign-system.js` were migrated (showMissionSelect QUIT, action row, DEPLOY, shop BUY/RESTOCK/BACK, loadout slot LOAD/DELETE/SAVE/BACK, upgrades BACK) and `js/menus.js` (chassis-select START CAMPAIGN and BACK, item detail EQUIP/SCRAP/UNEQUIP); the equip-prompt OPEN INVENTORY and CONTINUE buttons in `js/perks.js` were also migrated. Item cards using dynamic rarity colours retain a minimal inline style for the border-left accent while dropping hover handlers. `css/menus.css` and `css/garage.css` were fully rewritten to consume the new design tokens via CSS variables.

### Files Changed

- `css/base.css` — complete rewrite: `:root` tokens, `.tw-btn` component with all variants, legacy `button` fallback
- `css/menus.css` — complete rewrite: all rules now consume CSS variables from base.css; no duplicate button rules
- `css/garage.css` — complete rewrite: all rules now consume CSS variables; `#deploy-btn` and `#hangar-mm-btn` reduced to layout-only overrides
- `index.html` — 8 buttons migrated to `.tw-btn` class system; inline appearance styles and onmouseover/onmouseout removed
- `js/campaign-system.js` — all dynamic buttons in showMissionSelect, showShop, showLoadoutSlots, _showUpgradesPanel, _renderChassisSelect migrated
- `js/menus.js` — _renderChassisSelect and _showItemDetail buttons migrated
- `js/perks.js` — equip-prompt OPEN INVENTORY and CONTINUE buttons migrated
- `CHANGELOG.md` — this entry

---

## v5.23 — 7 UI fixes: background path, version display, button hover & layout

**Date:** 2026-03-21

Fixed a 404 on `hangar-bg.jpg` by correcting the relative path in `css/garage.css` from `assets/…` to `../assets/…`. Removed the hardcoded "Combat Simulation Alpha 3.0" subtitle from the callsign screen; added a `GAME_VERSION` constant (`v5.23`) to `js/constants.js` and a JS IIFE in `js/init.js` that populates all `.menu-version` elements dynamically — the version now appears at the bottom-right of both the callsign screen and main menu. Added hover effects (`onmouseover`/`onmouseout`) to the callsign Proceed button in `_updateCallsignBtn()`, matching the `.menu-start-btn` hover pattern. Changed the leaderboard "Main Menu" button to a red "Back" button using the existing `.menu-btn-red` class. Moved the hangar's red "Main Menu" button to an absolute top-right position within `.stat-readout` (now `position:relative` in `css/garage.css`) and relabelled it "Back". In the PVP hangar, moved the "Main Menu" button to the top-right corner as "Back", changed "Join Lobby" from green to blue, and added `cursor:pointer` to `.dd-option` dropdown items. Removed the level number appended to the "Resume Campaign" button label in `js/menus.js`; the red Quit button on the campaign mission select screen was already present from a prior session.

### Files Changed

- `css/garage.css` — fix `../assets/hangar-bg.jpg` path; add `position:relative` to `.stat-readout`; reposition `#hangar-mm-btn` to absolute top-right; add `cursor:pointer` to `.dd-option`
- `js/constants.js` — add `const GAME_VERSION = 'v5.23'`
- `js/init.js` — IIFE to populate `.menu-version` from `GAME_VERSION`; hover handlers on Proceed button
- `index.html` — remove "Alpha 3.0" from callsign screen; add `#callsign-version` div; add `id` to main-menu version div; update leaderboard button to red Back; relabel hangar button to Back
- `js/multiplayer.js` — PVP hangar: absolute Back button at top-right, Join Lobby changed to blue
- `js/menus.js` — remove level suffix from Resume Campaign label
- `CHANGELOG.md` — this entry

---

## v5.22 — Restore 6 missing stats panel render functions to `js/menus.js`

**Date:** 2026-03-21

### Bug Fixed

Opening the LOADOUT screen from either the HUD button (`toggleStats`) or the campaign mission select (`_openLoadoutFromMission`) threw `ReferenceError: _renderChassisPanel is not defined` at `populateStats` (menus.js). The same crash affected all 6 panel renderers that `populateStats` calls — none of them had been migrated from `index.html` to `js/menus.js` during the refactor.

**Functions restored to `js/menus.js`** (recovered from git commit `dcd9c82`, the v4.6 pass that originally named them):

| Function | What it renders |
|---|---|
| `_renderChassisPanel()` | Chassis type, shield, HP bars per part, chassis traits, arm configuration |
| `_renderWeaponPanel()` | Per-weapon damage/shot, reload time, DPS with perk+gear tooltips |
| `_renderMobilityPanel()` | Speed, legs status, shield regen, dodge/DR/crit/auto-repair/mod-cd/loot stats |
| `_renderRunStatsPanel()` | Round, kills, accuracy, damage dealt/taken, perks earned |
| `_renderActivePerksPanel()` | Picked perks as clickable chips with inline description tooltips |
| `_renderGearBonusesPanel()` | Equipped item names + grouped gear stat bonuses (offensive/defensive/utility) |

**`_inGame` bug also fixed:** In the original v4.6 code `_renderMobilityPanel` referenced `_inGame` (declared as `const` in `_renderChassisPanel`) without a local declaration — a latent `ReferenceError`. The fix from commit `e8ba2e0` is included: `const _inGame = !!(player?.comp)` is now declared at the top of `_renderMobilityPanel` as well.

**Both call paths verified clean:**
- `toggleStats()` (menus.js:451) → `populateStats()` → all 6 render functions ✓
- `_openLoadoutFromMission()` (campaign-system.js:889) → `populateStats()` → all 6 render functions ✓

### Files Changed

- `js/menus.js` — added 6 missing `_renderXxxPanel` functions (~355 lines) above `populateStats`
- `CHANGELOG.md` — this entry

---

## v5.21 — Restore missing `handleObjectiveRoundEnd` to `js/init.js`

**Date:** 2026-03-21

### Bug Fixed

`handleObjectiveRoundEnd(scene)` was called every frame in `update()` (line 218 of `js/init.js`) but was not defined anywhere in the codebase. This caused an uncaught `TypeError` every frame after deploying in simulation mode, crashing the game loop and preventing the mech from appearing.

The function was recovered from git commit `35533ca` (`index.html` at v3.2), where it lived inline before the refactor. It was never migrated to an external JS file during the extraction sessions.

**What the function does:** Detects when a non-boss objective (e.g., survival timer, assassination) signals completion via `shouldEndRound()` (from `arena-objectives.js`). It then sets `_roundActive = false`, clears all active enemy bullets, destroys remaining enemies via `destroyEnemyWithCleanup()`, equalises the kill counter, spawns the extraction point, and shows the `OBJECTIVE COMPLETE` banner. Boss rounds are intentionally skipped — they use a different end condition.

**Where restored:** Added to `js/init.js` above the Phaser scene lifecycle functions, consistent with the OVERVIEW.md file map entry.

**Guard added:** The bare call `handleObjectiveRoundEnd(this)` at line 218 was wrapped in a `typeof` guard (`if (typeof handleObjectiveRoundEnd === 'function')`) following the pattern used for all other external-function calls in the same file.

**Other update-loop functions verified:** All other functions called from `update()` — `handleShieldRegen`, `handleEnemyAI`, `handlePlayerMovement`, `handlePlayerFiring`, `handleRageGhosts`, `syncVisuals`, `updateCooldownOverlays`, `drawMinimap`, `checkLootPickups`, `checkEquipmentPickups`, `_updateExtraction`, `handleBulletEnemyOverlap`, `mpUpdate`, `updateSpecialEnemies`, `updateObjectives`, `updateColossusStand` — are all present in their respective files.

### Files Changed

- `js/init.js` — added `handleObjectiveRoundEnd()` function (~17 lines); added `typeof` guard on its call site
- `CHANGELOG.md` — this entry

---

## v5.20 — Final Pre-Merge Verification

**Date:** 2026-03-21

Ran a full 7-step pre-merge verification pass across all JS and CSS files produced by the refactor. One critical bug was found and fixed; documentation was brought fully up to date.

### Checks Performed

| Step | Result | Notes |
|------|--------|-------|
| 1 — Reference Check | **FIXED** | 3 broken function calls in `rounds.js` |
| 2 — Load Order Check | PASS | No parse-time violations; `window.onload` defers Phaser init correctly |
| 3 — typeof Guard Check | PASS | All guards reference existing functions; `genFn` is a local var (not a broken guard) |
| 4 — CSS Check | PASS | All functional CSS from the original `<style>` block is present across the 4 CSS files |
| 5 — Documentation Update | DONE | `OVERVIEW.md` file map and Systems Overview updated |
| 6 — CHANGELOG Entry | DONE | This entry |
| 7 — Merge Ready | CONFIRMED | See summary below |

### Bug Fixed — Three Missing Spawn Functions in `js/rounds.js`

During the v5.19 extraction of the inline `<script>` block, three private helper functions were inadvertently omitted from `js/rounds.js`. They were defined in `index.html` inline script and called by `startRound()` in `rounds.js`. Without them, any round start (simulation or campaign) would crash with `ReferenceError`.

Functions restored to `js/rounds.js` (recovered from git history of the v5.18 commit):

- **`_setupArenaAndObjective(scene, roundNum, campaignMission)`** — selects arena, sets `_arenaState`, cleans up previous objective, generates cover, initializes new objective, shows arena/objective label.
- **`_spawnCampaignEnemies(scene, campaignMission, campaignEnemy)`** — spawns enemies from campaign composition array with staggered timers; applies elite modifiers per campaign config; spawns commander at level 6+; triggers boss if `hasBoss`.
- **`_spawnSimulationEnemies(scene, roundNum)`** — spawns normal enemies, special enemy types (from `_getEnemySpawnConfig`), and applies elite modifiers for simulation mode; commanders spawn round 4+; medics spawn round 3+.

Both `_spawnCampaignEnemies` and `_spawnSimulationEnemies` received minor hardening: `typeof` guards were added to the `spawnSpecialEnemy`, `_rollEliteModifier`, and `applyEliteModifier` calls inside their `setTimeout` callbacks (matching the architecture rules for external-file function calls).

### Additional Fix — Incorrect Load Order Comment in `index.html`

The `<!-- Load order: ... -->` comment above the script tags was incorrect — it said "events → init, then external files" but the actual order places external files (loot-system, enemy-types, arena-objectives, campaign-system, multiplayer) before events and init. The comment was rewritten to match the actual `<script>` tag order.

### OVERVIEW.md Updates

- **File Map** — added 13 previously unlisted files: `css/base.css`, `css/hud.css`, `css/garage.css`, `css/menus.css`, `js/constants.js`, `js/mods.js`, `js/perks.js`, `js/enemies.js`, `js/rounds.js`, `js/hud.js`, `js/garage.js`, `js/menus.js`
- **Systems Overview** — all "Lives in: `index.html`" entries updated to point to the correct external files for: Chassis System, Loadout System, Combat & Firing System, Perk System, Shield System, Round & Extraction System, Enemy AI System, Boss System, HUD System

### Files Changed

- `js/rounds.js` — added `_setupArenaAndObjective`, `_spawnCampaignEnemies`, `_spawnSimulationEnemies` (~130 lines)
- `index.html` — corrected load order comment
- `OVERVIEW.md` — file map and systems overview updated; last-updated date bumped to v5.20
- `CHANGELOG.md` — this entry

### Refactor Summary (v4.1 → v5.20)

The full refactor extracted all inline `<script>` and `<style>` content from `index.html` across ~20 sessions:

| Metric | Value |
|--------|-------|
| Total new JS files created | 15 (`constants`, `state`, `utils`, `audio`, `mechs`, `cover`, `combat`, `mods`, `perks`, `enemies`, `rounds`, `hud`, `garage`, `menus`, `events`, `init`) |
| Total new CSS files created | 4 (`base`, `hud`, `garage`, `menus`) |
| `index.html` inline `<script>` lines removed | ~2,600 (lines 423–3021 of the v4.x monolith) |
| `index.html` inline `<style>` lines removed | ~800 |
| `index.html` final state | Pure HTML shell (~530 lines of markup + link/script tags only) |
| Broken references found and fixed this session | 3 |

---

## v5.19 — index.html is now a pure HTML shell

**Date:** 2026-03-21

Completed the full extraction of all inline JavaScript and CSS from `index.html`. The file is now a pure HTML shell containing only structural markup and `<link>`/`<script>` tags.

### Changes

**`index.html`**
- Removed both inline `<script>` blocks (callsign IIFE at lines 86–107; main game logic at lines 423–3021)
- Moved CSS `<link>` tags to the top of `<head>` (before any scripts)
- Moved all `<script src>` tags to the bottom of `<body>` in the canonical load order:
  `phaser → constants → state → utils → audio → mechs → cover → combat → mods → perks → enemies → rounds → hud → garage → menus → loot-system → enemy-types → arena-objectives → campaign-system → socket.io → multiplayer → events → init`
- Fixed `perks.js` position (was before `combat.js`, now correctly after `mods.js`)
- Updated version badge to `v5.19`

**`js/init.js`** (+140 lines)
- Added callsign pre-fill IIFE (from `index.html` lines 86–107)
- Added `preload()`, `create()`, `update()` Phaser scene lifecycle functions

**`js/events.js`** (+145 lines)
- Added `handlePlayerMovement()` — WASD movement, mod activation, chassis leg effects
- Added `handlePlayerFiring()` — M1/RMB weapon fire dispatch
- Added `_onEquipDragStart()`, `_onSlotDragOver()`, `_onSlotDragLeave()`, `_onSlotDrop()` — inventory drag-and-drop handlers

**`js/menus.js`** (+240 lines)
- Added `_showCloudStatusToast()` — HUD toast for cloud save feedback
- Added `_supabaseEnabled()`, `_validateScoreEntry()`, `submitLeaderboardEntry()`, `skipLeaderboardSubmit()` — leaderboard submission flow
- Added `_execDropInTween()` — deploy drop-in animation and round start logic
- Added `_cleanupGame()` — full scene wipe on death/respawn

**`js/campaign-system.js`** (+165 lines)
- Added `saveToCloud()`, `loadFromCloud()`, `deleteCloudSave()`, `_restoreFromCloudData()` — Supabase cloud save/load
- Added `_loadCampaignData()` — cloud-first, local-fallback campaign data loader

**Duplicate removal** — prior-session agents had appended duplicate function blocks to several files; all duplicates removed:
- `js/combat.js` — removed 291-line duplicate (lines 1614–1904)
- `js/perks.js` — removed 127-line duplicate (lines 1325–1452)
- `js/rounds.js` — removed 314-line duplicate (lines 415–729)
- `js/enemies.js` — removed 22-line duplicate (lines 2452–2473)
- `js/mechs.js` — removed 49-line duplicate (lines 434–483)

---

## v5.18 — Extract Startup / Phaser Init into js/init.js

**Date:** 2026-03-21

Created `js/init.js` (97 lines) and moved all startup and Phaser initialization code out of `index.html`'s inline `<script>` block into it. The file is organised under one section banner `ENTRY POINT` with three sub-sections:

- **Animated grid** (`_startGridCanvas`, `startMenuGrid`) — draws the scrolling cyan grid on the callsign and main-menu canvases.
- **Callsign input handlers** (`_csKeyDown`, `_updateCallsignBtn`) — keyboard handler for the callsign entry field and the button enable/disable logic.
- **Game bootstrap** (`window.onload`) — deferred to `window.onload` so that `preload`, `create`, and `update` (function declarations hoisted within the inline `<script>` at the bottom of `<body>`) are globally defined before Phaser receives them. On load: assigns `GAME_CONFIG.scene = { preload, create, update }`, instantiates `GAME = new Phaser.Game(GAME_CONFIG)`, calls `resetInventory()`, starts the menu grid animation, calls `refreshGarage()` and `updateHUD()`, and hides `#ui-layer`.

A related fix was applied to `js/constants.js`: `GAME_CONFIG.scene` was previously set to `{ preload, create, update }` at parse time (head load), when those functions are not yet defined in the global scope. The property is now initialised as `{}` and filled in by `init.js` at `window.onload` time.

The `<script src="js/init.js"></script>` tag was inserted in `index.html` after `events.js` (load position 35, last script tag). This placement satisfies all dependencies — every function called from `init.js` is defined in an earlier-loading file or in the inline script (resolved at `window.onload` runtime):

| Function / Variable | Defined in |
|---|---|
| `GAME_CONFIG` | `js/constants.js` (pos 1) |
| `GAME` | `js/state.js` (pos 2) |
| `resetInventory()` | `js/loot-system.js` (pos 15) |
| `refreshGarage()` | `js/garage.js` (pos 13) |
| `updateHUD()` | `js/hud.js` (pos 12) |
| `proceedToMainMenu()` | `js/menus.js` (pos 14) |
| `preload`, `create`, `update` | `index.html` inline `<script>` (body) — available at `window.onload` |

The inline `<script>` block in `index.html` no longer contains any startup or init code — only the Phaser lifecycle functions (`preload`, `create`, `update`) and the remaining game logic that has not yet been extracted.

### Files Changed

- `js/init.js` — new file, 5 functions + `window.onload` bootstrap (97 lines)
- `js/constants.js` — `GAME_CONFIG.scene` changed from `{ preload, create, update }` to `{}` (assigned at runtime by `init.js`)
- `index.html` — `<script src="js/init.js">` tag added after `events.js`; `GAME` instantiation, `resetInventory()` call, `_startGridCanvas`, `startMenuGrid`, `_csKeyDown`, `_updateCallsignBtn`, and `window.onload` block replaced with redirect comments
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — `js/init.js` added to file map and load order

---

## v5.17 — Extract Global Event Listeners into js/events.js

**Date:** 2026-03-21

Moved all four top-level `addEventListener` calls out of the inline `<script>` block in `index.html` into a new file `js/events.js` (174 lines). The file is organised under one section banner `GLOBAL EVENT LISTENERS` with four sub-sections:

- **Window resize** (`_onWindowResize`) — resizes the Phaser canvas on browser window resize via `GAME.scale.resize()`.
- **Document click** (dropdown close) — calls `closeAllDD()` when the user clicks outside any `.dd-wrap`, `.pvp-dd-wrap`, or `#pvp-hangar` element.
- **Main keydown handler** — handles perk menu (number keys 1–4, arrow focus, Enter confirm), death screen (Enter/ESC), equip-prompt (Enter/ESC), chassis select overlay (ESC/Arrow/Enter), leaderboard close (ESC), campaign overlay closes (shop/slots/upgrades via ESC), stats overlay close (ESC), pause toggle (ESC when deployed), and PVP chat toggle (T key).
- **`_mainMenuKeyNav`** — moves focus between main menu and campaign sub-menu buttons using Arrow keys; ESC closes the sub-menu when open.

The `<script src="js/events.js">` tag was inserted in `index.html` after `multiplayer.js` (load position 34). This placement satisfies all dependencies — every function referenced in `events.js` is defined in an earlier-loading file:

| Function / Variable | Defined in |
|---|---|
| `GAME` | `js/state.js` (pos 2) |
| `closeAllDD()` | `js/garage.js` (pos 13) |
| `pickPerk()`, `_currentPerkKeys`, `_currentPerkNextRound` | `js/perks.js` (pos 6) |
| `returnToMainMenu()`, `togglePause()`, `toggleStats()`, `hideCampaignSubMenu()`, `_cancelNewCampaign()`, `_highlightChassis()`, `_startNewCampaignWithChassis()`, `closeLeaderboard()`, `_selectedNewChassis` | `js/menus.js` (pos 14) |
| `_closeShop()`, `_closeLoadoutSlots()`, `_closeUpgrades()` | `js/campaign-system.js` (pos 18) |
| `mpIsPvpMenuOpen()`, `mpClosePvpMenu()`, `mpShowPvpMenu()`, `mpToggleInGameChat()`, `_mpChatOpen`, `_mpMatchActive`, `_pvpHangarOpen`, `_pvpHangarInMatch`, `_pvpDeployFromHangar()` | `js/multiplayer.js` (pos 20) |
| `_gameMode`, `_isStats`, `isDeployed` | `js/state.js` (pos 2) |

Three `addEventListener` calls that remain in `index.html` are legitimately inside functions (not top-level) and were not moved:
- `_canvas.addEventListener('contextmenu', ...)` — inside the Phaser canvas setup path (~line 689).
- Two `chip.addEventListener('mouseenter/mouseleave', ...)` — inside the affix-chip tooltip rendering loop (~lines 2876–2877).

No broken references remain.

### Files Changed

- `js/events.js` — new file, 4 event listeners (174 lines)
- `index.html` — `<script src="js/events.js">` tag added after `multiplayer.js`; 4 top-level listener blocks replaced with redirect comments
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — `js/events.js` added to file map and load order

---

## v5.16 — Extract Cover System into js/cover.js

**Date:** 2026-03-21

Moved all cover and battlefield generation functions out of `index.html` and `js/combat.js` into a new file `js/cover.js` (408 lines). The file is organised under one section banner: `COVER / BATTLEFIELD OBJECTS`, with three functions: `placeBuilding` (renders building geometry via Phaser Graphics and registers the invisible static physics body), `generateCover` (clears previous round's cover, dispatches to arena-specific generators or the default city-block layout, force-syncs all static bodies), and `damageCover` (darkens cover as HP falls, triggers explosion+debris on destruction). The `_buildingGraphics` array declaration was also moved from `js/state.js` into `js/cover.js` since it is exclusively owned by `placeBuilding` and `generateCover`.

The `<script src="js/cover.js">` tag was inserted in `index.html` after `mods.js` and before `enemies.js` (load position 22 of 33). This placement satisfies all dependencies: `cover.js` needs `createExplosion` from `combat.js` (load 20) and `spawnDebris` from `utils.js` (load 17), both of which load earlier. Call-site audit:

- `index.html` inline `create()` calls `generateCover(this)` — resolves at runtime after all scripts load ✓
- `index.html` bullet ↔ cover collider callbacks call `damageCover(this, cover, ...)` — resolves at runtime ✓
- `index.html` `startRound` flow calls `generateCover(scene, arenaKey)` — resolves at runtime ✓
- `js/garage.js` calls `generateCover(deployScene)` inside `deployMech()` — loads after `cover.js` (position 26) ✓
- `js/multiplayer.js` calls `generateCover(scene)` and `placeBuilding(scene, x, y, def)` — loads last ✓
- `js/loot-system.js`, `js/enemy-types.js`, `js/arena-objectives.js`, `js/campaign-system.js` — zero references to moved functions ✓

No broken references remain.

### Files Changed

- `js/cover.js` — new file, 3 functions + `_buildingGraphics` declaration (408 lines)
- `index.html` — `<script src="js/cover.js">` tag added after `mods.js`; `placeBuilding` and `generateCover` bodies removed; cover section comment updated
- `js/combat.js` — `damageCover` body removed, replaced with redirect comment
- `js/state.js` — `_buildingGraphics` declaration removed, replaced with redirect comment
- `CHANGELOG.md` — this entry

---

## v5.15 — Extract Mech Visual System into js/mechs.js

**Date:** 2026-03-21

Moved all mech building, visual syncing, and chassis effect functions out of the inline `<script>` block in `index.html` into a new file `js/mechs.js` (290 lines). The file is organised under three section banners: `MECH BUILDING` (`buildPlayerMech`, `buildEnemyMech`, `buildEnemyTorso`, `refreshMechColor`), `VISUAL SYNC & CHASSIS EFFECTS` (`syncVisuals`, `syncChassisEffect`, `syncLightTrail`, `syncMediumFootsteps`, `syncHeavyShockwave`), and `RAGE GHOSTS / SPECTRE CLONE` (`handleRageGhosts`, `_spawnSpectreClone`). The `<script src="js/mechs.js">` tag was added to `index.html` after `utils.js` and before `perks.js`/`combat.js`. A full call-site audit confirmed all references resolve correctly: `index.html` inline `update()` calls `handleRageGhosts` and `syncVisuals` at runtime after all scripts load; `mods.js` calls `buildPlayerMech` (decoy) and `refreshMechColor` ×2 directly (loads after `mechs.js`); `garage.js` calls `buildPlayerMech` and `refreshMechColor` ×2 (loads after `mechs.js`); `rounds.js` calls `_spawnSpectreClone` inside a timer callback (runtime-only, resolves after all scripts load); `enemies.js` calls `buildEnemyMech` and `buildEnemyTorso` ×6 (loads after `mechs.js`); `enemy-types.js` calls `buildEnemyMech` and `buildEnemyTorso` ×3 (loads after `mechs.js`); `multiplayer.js` calls `buildPlayerMech` ×2 directly and `refreshMechColor` behind a `typeof` guard (loads after `mechs.js`). No broken references remain.

### Files Changed

- `js/mechs.js` — new file, 11 functions (290 lines)
- `index.html` — `<script src="js/mechs.js">` tag added after `utils.js`; all 11 function bodies removed
- `CHANGELOG.md` — this entry

---

## v5.14 — Wire js/menus.js and Audit Call Sites

**Date:** 2026-03-21

The menu system extracted in the previous sessions was wired up by adding `<script src="js/menus.js">` to `index.html` after `garage.js` and before `loot-system.js`. A full call-site audit confirmed all references in `index.html` resolve correctly: HTML `onclick` attributes for `proceedToMainMenu`, `startGame`, `startMultiplayer`, `showCampaignSubMenu`, `confirmNewCampaign`, `hideCampaignSubMenu`, `showLeaderboard`, `closeLeaderboard`, `returnToMainMenu`, `campaignDeathToMissionSelect`, `returnToHangar`, `togglePause`, `toggleStats`, `goToMainMenu`, `_switchLoadoutTab`; and inline-script call sites for `_equipItemToSlot`, `_getSlotForItem`, `populateInventory`, `_updateInvCount`, `_statRow`, `_hpBarBoosted`, `_sortScores`, `_loadScores`, `_saveScores`, `_renderScores`, `_cancelNewCampaign`, `_highlightChassis`, `_startNewCampaignWithChassis`, `hideCampaignSubMenu`, `togglePause`, `proceedToMainMenu`, `returnToMainMenu`. All five external files were scanned: `enemy-types.js` and `arena-objectives.js` have zero references; `loot-system.js` calls `_updateInvCount` behind a `typeof` guard and loads after `menus.js`; `campaign-system.js` calls `populateStats`, `populateInventory`, `_updateInvCount`, `_switchLoadoutTab`, and `_getSlotForItem` all behind `typeof` guards and loads after `menus.js`; `multiplayer.js` calls `goToMainMenu` behind a `typeof` guard and loads after `menus.js`. `rounds.js` calls `returnToHangarForMissionSelect()` inside a tween callback (runtime-only), and `combat.js` calls `showDeathScreen()` inside function bodies — both resolve at runtime after all scripts are loaded. No broken references remain.

### Files Changed

- `index.html` — `<script src="js/menus.js">` tag added after `garage.js`
- `CHANGELOG.md` — this entry

---

## v5.13 — Extract Garage System into js/garage.js

**Date:** 2026-03-21

The garage and dropdown system was extracted from the inline `<script>` block in `index.html` into a new file `js/garage.js` (463 lines). The file is organised under two section banners: `DROPDOWN SYSTEM` (`toggleDD`, `closeAllDD`, `buildDD`, `buildColorDD`, `selectSlot`, `setChassis`) and `GARAGE UI` (`refreshGarage`, `updateGarageStats`, `_updateStarterPanel`, `_calcWeight`, `deployMech`, `startHangarGrid`). The `<script src="js/garage.js">` tag was added to `index.html` after `hud.js` and before `loot-system.js`. A full call-site audit confirmed all references in `index.html` (3 `setChassis` and 1 `toggleDD` and 1 `deployMech` HTML onclick attrs; `closeAllDD` ×2, `deployMech` ×1, `refreshGarage` ×4, `startHangarGrid` ×2 in the inline script) resolve correctly. `loot-system.js`, `enemy-types.js`, `arena-objectives.js`, and `multiplayer.js` have zero references to the moved functions; `campaign-system.js` calls `deployMech` and `refreshGarage` behind `typeof` guards and loads after `garage.js` — no broken references remain.

### Files Changed

- `js/garage.js` — new file, 12 functions (463 lines)
- `index.html` — `<script src="js/garage.js">` tag added; all 12 function bodies removed
- `CHANGELOG.md` — this entry

---

## v5.12 — Wire js/hud.js and Audit Call Sites

**Date:** 2026-03-21

The HUD system extracted in the previous session was wired up by adding `<script src="js/hud.js">` to `index.html` after `rounds.js` and before `loot-system.js`. A full call-site audit confirmed all 15 call sites in `index.html` (`updateCooldownOverlays`, `drawMinimap`, `updateHUD` ×5, `updateBars` ×4, `updatePaperDoll` ×2, `syncGlowWedge`, `syncCrosshair`, `drawCrosshair`) are in the inline `<script>` block and resolve correctly from `hud.js`. All five external files were scanned: `loot-system.js`, `enemy-types.js`, `arena-objectives.js`, and `campaign-system.js` have zero references to the moved functions; `multiplayer.js` calls `updateBars`, `updatePaperDoll`, `updateHUD` inside `try/catch` blocks and `drawCrosshair`/`updateEnemyDoll` behind `typeof` guards — all safe, as `hud.js` loads before `multiplayer.js` in the script order. No broken references remain.

### Files Changed

- `index.html` — `<script src="js/hud.js">` tag added
- `CHANGELOG.md` — this entry

---

## v5.11 — Extract Round Flow System into js/rounds.js

**Date:** 2026-03-21

Moved the full round flow and extraction system out of the inline `<script>` block in `index.html` into a new file `js/rounds.js` (414 lines). The file is organised under two section banners: `ROUND FLOW` (`updateRoundHUD`, `_healPlayerFull`, `showRoundBanner`, `_clearMapForRound`, `startRound`, `onEnemyKilled`) and `EXTRACTION SYSTEM` (`_spawnExtractionPoint`, `_updateExtraction`, `_triggerExtraction`, `_cleanupExtraction`, `_overlapsAnyCover`). The `<script src="js/rounds.js">` tag was added to `index.html` after `enemies.js` and before `loot-system.js`. All 6 call sites in `index.html` resolve correctly (`_updateExtraction` in `update()`, `_spawnExtractionPoint` + `showRoundBanner` in `handleObjectiveRoundEnd()`, `updateRoundHUD` in `_spawnCampaignEnemies()`, `showRoundBanner` × 2 + `startRound` in `deployMech()`, `_healPlayerFull` in the loot orb repair handler, `_cleanupExtraction` in the death handler). `multiplayer.js` calls `showRoundBanner` with a `typeof` guard and loads after `rounds.js` — no broken references. The remaining external files (`loot-system.js`, `enemy-types.js`, `arena-objectives.js`, `campaign-system.js`) reference the moved functions only in comments.

### Files Changed

- `js/rounds.js` — new file, 11 functions (414 lines)
- `index.html` — script tag added; all 11 function bodies removed
- `CHANGELOG.md` — this entry

---

## v5.10 — Extract Enemy System into js/enemies.js

**Date:** 2026-03-21

Moved all enemy spawning, AI, and boss logic out of the inline `<script>` block in `index.html` into a new file `js/enemies.js` (2 432 lines). The file is organised under four section banners: `ENEMY SPAWNING` (`randomEnemyLoadout`, `spawnEnemy`, `spawnCommander`, `spawnMedic`), `ENEMY AI` (`enemyFire`, `enemyFireSecondary`, `handleEnemyAI` and all private helpers), `BOSS SYSTEM` (`spawnBoss`, `_bossSpawnPos`, `_showBossTitle`, `_buildBossEnemy`, `_addBossLabel`, `_addBossHPBar`, `_updateBossHPBar`, `_hideBossHPBar`), and `BOSS VARIANTS` (`spawnWarden`, `spawnTwinRazors`, `spawnArchitect`, `spawnJuggernaut`, `spawnSwarm`, `spawnMirror`, `spawnTitan`, `spawnCore`). The `<script src="js/enemies.js">` tag was added to `index.html` after `mods.js` and before `loot-system.js`. All 11 call sites in `index.html` resolve correctly. None of the five external JS files (`loot-system.js`, `enemy-types.js`, `arena-objectives.js`, `campaign-system.js`, `multiplayer.js`) reference any function now in `enemies.js`, so no broken references exist.

### Files Changed

- `js/enemies.js` — new file, 34 functions (2 432 lines)
- `index.html` — script tag added; all function bodies removed
- `CHANGELOG.md` — this entry

---

## v5.9 — Extract Mod System into js/mods.js

**Date:** 2026-03-21

Moved all 18 mod-activation and support functions out of the inline `<script>` block in `index.html` into a new file `js/mods.js`. The file is organised under three section banners: `MOD ACTIVATIONS` (`activateMod`, `activateDecoy`, `activateMissiles`, `activateDrone`, `activateRepair`, `activateEMP`, `activateRage`, `activateShield`, `activateJump`), `DRONE HELPERS` (`activateGhostStep`, `activateOverclockBurst`, `activateFortressMode`, `activateEnemyMod`, `activateAutoDrone`, `_buildDroneGraphic`, `_spawnDrone`), and `AUGMENTS AND LEGS` (`applyAugment`, `applyLegSystem`). The `<script src="js/mods.js">` tag was added to `index.html` after `combat.js` and before `loot-system.js`. All five call sites in `index.html` (`activateEnemyMod`, `activateMod`, `activateAutoDrone`, `applyAugment`, `applyLegSystem`) resolve correctly from the inline script block. `multiplayer.js` calls `applyAugment` and `applyLegSystem` with `typeof` guards and loads after `mods.js` — no broken references.

### Files Changed

- `js/mods.js` — new file, 18 functions (899 lines)
- `index.html` — script tag added; all 18 function bodies removed
- `CHANGELOG.md` — this entry

---

## v5.8 — Audit and Confirm js/combat.js Extraction

**Date:** 2026-03-21

Performed a full session audit of the `js/combat.js` extraction to confirm the work is complete and no broken references exist. All 10 firing functions (`fire`, `fireFTH`, `fireRAIL`, `fireGL`, `fireRL`, `fireSIEGE`, `fireSG`, `firePLSM`, `fireSR`, `fireStandard`) and all 6 damage functions (`processPlayerDamage`, `damageEnemy`, `createExplosion`, `damageCover`, `dropMine`, `dropEnemyMine`) plus helpers (`_applyExplosivePlayerDamage`, `_applyPassiveShieldAbsorption`, `_resolveEnemyDeath`, `_drawMineGraphic`) are present in `js/combat.js` (1 336 lines). Verified:

- No function definitions remain in `index.html` — only call sites
- `<script src="js/combat.js">` is at the correct load-order position (after `perks.js`, before `loot-system.js`)
- `js/loot-system.js` calls `damageEnemy` with `typeof` guard ✓
- `js/arena-objectives.js` calls `processPlayerDamage` with `typeof` guard ✓
- `js/multiplayer.js` calls `createExplosion` (loads after `combat.js`, always defined) ✓
- `_mpMatchActive` referenced in `fire()` resolves via the shared global environment record from `multiplayer.js` ✓

No code changes were required — the extraction and script tag were already in place from v5.7 and prior sessions.

### Files Changed

- `CHANGELOG.md` — this entry

---

## v5.7 — Add Script Tag for js/combat.js

**Date:** 2026-03-21

The combat system was extracted into `js/combat.js` in a prior session but the `<script>` tag was missing from `index.html`. This session adds `<script src="js/combat.js"></script>` in the correct load-order position — after `js/perks.js` and before `js/loot-system.js` — making the 20 combat functions (`fire`, `fireFTH`, `fireRAIL`, `fireGL`, `fireRL`, `fireSIEGE`, `fireSG`, `firePLSM`, `fireSR`, `fireStandard`, `processPlayerDamage`, `_applyExplosivePlayerDamage`, `_applyPassiveShieldAbsorption`, `damageEnemy`, `_resolveEnemyDeath`, `createExplosion`, `damageCover`, `_drawMineGraphic`, `dropMine`, `dropEnemyMine`) available to all downstream scripts and the inline game loop. All call sites in `index.html`, `js/loot-system.js`, `js/enemy-types.js`, `js/arena-objectives.js`, and `js/multiplayer.js` were verified — no broken references.

### Files Changed

- `index.html` — `<script src="js/combat.js">` tag added after `perks.js`
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.7; load order updated

---

## v5.6 — Extract Perk Functions into js/perks.js

**Date:** 2026-03-21

Moved four perk-system functions out of the inline `<script>` block in `index.html` into the existing `js/perks.js` file (which previously held only the `_perks` data object). The functions moved are `_pickFrom(pool, n, exclude)` (pool sampling helper), `showPerkMenu(nextRound)` (renders perk cards and opens the menu overlay), `pickPerk(key, nextRound)` (applies a chosen perk and advances to the next round or equip prompt), and `_showEquipPrompt(nextRound)` (shows the LOOT AVAILABLE overlay when inventory has items after perk pick). Two module-level variables used by the keyboard handler — `_currentPerkKeys` and `_currentPerkNextRound` — were moved alongside `showPerkMenu`. All four function bodies in `index.html` were replaced with single-line comments. The `<script src="js/perks.js">` tag was already present at the correct position (after `utils.js`, before `loot-system.js`). All call sites in `index.html` (`showPerkMenu` at the extraction callback, `pickPerk` and `_currentPerk*` in the keydown handler) continue to resolve via the shared `window` global scope — no references are broken.

### Files Changed

- `js/perks.js` — four functions + two module-level vars appended after the `_perks` data object
- `index.html` — function bodies replaced with comments
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.6; Perk System entry updated to reflect new home

---

## v5.5 — Extract Pure Helpers into js/utils.js

**Date:** 2026-03-21

Moved 10 pure helper functions (plus the `HUD_NAMES` constant) out of the inline `<script>` block in `index.html` into the new dedicated file `js/utils.js`.

**Colour utilities:** `darkenColor(hex, amount)`

**Chassis stats:** `getTotalHP(type)`

**HUD name lookup:** `HUD_NAMES` (const), `_hudName(key)`

**Visual FX helpers:** `showDamageText(scene, x, y, amount, hasShield)`, `createImpactSparks(scene, x, y)`, `createShieldSparks(scene, x, y)`, `createShieldBreak(scene, x, y)`, `createMuzzleFlash(scene, x, y, angle, distance, color)`, `spawnDebris(scene, x, y, color)`, `spawnFootprint(scene, x, y, rotation, w, h, fadeTime, color)`

Each function body in `index.html` was replaced with a single `// <name>() — moved to js/utils.js` comment. A `<script src="js/utils.js"></script>` tag was inserted after `audio.js` and before `loot-system.js`. All call sites in `index.html`, `js/loot-system.js`, and `js/multiplayer.js` continue to resolve via the shared `window` global scope — no references are broken.

### Files Changed

- `js/utils.js` — created (10 functions + 1 constant moved from index.html)
- `index.html` — function bodies replaced with comments; `<script src="js/utils.js">` tag added
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.5; `utils.js` added to file map and load order

---

## v5.4 — Extract Web Audio Engine into js/audio.js

**Date:** 2026-03-21

Moved the entire synthesized sound engine out of the inline `<script>` block in `index.html` into the new dedicated file `js/audio.js`. The move covers all audio state variables, core engine functions, and all named sound functions, in five groups:

**Audio state variables:** `_ac`, `_masterVol`, `_activeNodes`, `_lastNodeStartTime`, `_MAX_NODES`, `_sndThrottle`, `_audioReady`.

**Core engine functions:** `_getAC()`, `_canPlay()`, `_tone()`, `_noise()`.

**snd\* functions (26 total):** `sndFire()`, `sndEnemyFire()`, `sndExplosion()`, `sndShieldBlock()`, `sndShieldActivate()`, `sndShieldDeactivate()`, `sndEMP()`, `sndRage()`, `sndJump()`, `sndPlayerHit()`, `sndLoot()`, `sndEnemyDeath()`, `sndCommanderSpawn()`, `sndRoundClear()`, `sndRoundStart()`, `sndEquipDrop()`, `sndEquipPickup()`, `sndObjectiveStart()`, `sndObjectiveComplete()`, `sndObjectiveFail()`, `sndArenaTransition()`, `sndBossSpawn()`, `sndBossDefeat()`.

**AudioContext lifecycle IIFE** (`_initAudioLifecycle`): first-user-gesture gate and tab visibility suspend/resume handlers.

The audio block in `index.html` was replaced with a single comment. A `<script src="js/audio.js"></script>` tag was inserted after `state.js` and before `loot-system.js`. All call sites for `snd*`, `_tone`, `_noise`, and `_canPlay` in `index.html` and external files continue to resolve via the shared `window` global scope — no references are broken.

### Files Changed

- `js/audio.js` — created (all audio state, engine, and sound functions moved from index.html)
- `index.html` — audio block replaced with comment; `<script src="js/audio.js">` tag added
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.4

---

## v5.3 — Extract Mutable State into js/state.js

**Date:** 2026-03-21

Extracted 74 mutable runtime globals from the inline `<script>` block in `index.html` into the new dedicated file `js/state.js`. Variables moved cover all shared runtime state: Phaser scene objects (`player`, `torso`, `keys`, `enemies`, `bullets`, `enemyBullets`, `shieldGraphic`, `coverObjects`, `speedStreakLine`, `crosshair`, `glowWedge`, `GAME`, and the three stored Phaser Collider references); game mode and overlay flags (`_gameMode`, `isDeployed`, `_isPaused`, `_isStats`, `_isInventory`, `_pendingLoadoutTab`); the `loadout` object and its saved-loadout snapshots (`_savedL/R/Mod/Aug/Leg`) and per-limb destruction flags; the full round-state suite (`_round`, `_bestRound`, `_roundKills`, `_roundTotal`, `_totalKills`, `_shotsFired`, `_shotsHit`, `_damageDealt`, `_damageTaken`, `_perksEarned`, `_roundActive`, `_roundClearing`, extraction state); chassis movement-effect trackers; combat/cooldown state (`reloadL`, `reloadR`, `lastDamageTime`, `lastModTime`, `_chaingunSpinStart`, `_chaingunReady`, mod-active flags); the `_perkState` object and associated perk-run arrays; and loot/leaderboard globals (`lootPickups`, `_buildingGraphics`, `_pendingRun`, `_playerCallsign`). Audio state (`_ac`, `_masterVol`, etc.) was intentionally left in index.html pending creation of `audio.js`. A `<script src="js/state.js">` tag was added after `constants.js` and before all other scripts. `GAME` was converted from `const` declaration to a bare assignment since its declaration now lives in `state.js`.

### Files Changed

- `js/state.js` — created (74 top-level mutable variables moved from index.html)
- `index.html` — state variable declarations replaced with comments; `<script src="js/state.js">` tag added; `const GAME = …` changed to `GAME = …`
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.3

---

## v5.2 — Extract Constants into js/constants.js

**Date:** 2026-03-21

Extracted 31 constants from the inline `<script>` block in `index.html` into the new dedicated file `js/constants.js`, covering chassis definitions (`CHASSIS`), weapon definitions (`WEAPONS`), shield systems (`SHIELD_SYSTEMS`), augments (`AUGMENTS`), leg systems (`LEG_SYSTEMS`), cover definitions (`COVER_DEFS`), and loot types (`LOOT_TYPES`). A `<script src="js/constants.js">` tag was added to `index.html` before the other JS files so all downstream code retains access to these values via the shared `window` global scope.

### Files Changed

- `js/constants.js` — created (31 top-level constants moved from index.html)
- `index.html` — constants block removed; `<script src="js/constants.js">` tag added
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.2

---

## v5.1 — CSS Extraction into Separate Files

**Date:** 2026-03-20

Extracted all CSS from the inline `<style>` blocks in `index.html` into four dedicated files. The BASE / RESET section (reset, body, scrollbar, shared button components) went into `css/base.css`; all in-game HUD and paper doll rules went into `css/hud.css`; the hangar/garage panel, dropdown system, perk cards, stats panel, and related garage rules went into `css/garage.css`; and the main menu, pause overlay, animations (@keyframes), loadout tab buttons, mech equip slots, backpack drag styles, and arm picker modal went into `css/menus.css`. Both `<style>` blocks were removed from `index.html` and replaced with four `<link>` tags in load order: `base.css → hud.css → garage.css → menus.css`.

### Files Changed

- `css/base.css` — created (reset, body, scrollbar, shared button styles)
- `css/hud.css` — created (in-game HUD, weapon rows, paper doll)
- `css/garage.css` — created (hangar panel, dropdowns, perk cards, stats panel, garage stats, deploy button)
- `css/menus.css` — created (main menu, animations, pause overlay, loadout tabs, mech equip slots, backpack, arm picker)
- `index.html` — both `<style>` blocks removed; four `<link>` tags added to `<head>`
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.1

---

## v5.0 — Fix _inGame ReferenceError in Loadout Menu

**Date:** 2026-03-20

### Root Cause

`_inGame` was declared as a `const` local to `_renderChassisPanel()` during the v4.6 function decomposition pass. `_renderMobilityPanel()` (a separate function) also referenced `_inGame` at line 12924, but the variable was out of scope there, causing `ReferenceError: _inGame is not defined` whenever the LOADOUT/Stats overlay was opened.

### Fix

Added `const _inGame = !!(player?.comp);` at the top of `_renderMobilityPanel()`, matching the identical declaration already in `_renderChassisPanel()`.

### Files Changed

- `index.html` — `_renderMobilityPanel()`: added `_inGame` local declaration
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v5.0

---

## v4.9 — Fix Remaining Syntax Errors in _syncEnemyVisuals and _applyEnemyObstacleAvoidance

**Date:** 2026-03-20

The v4.8 fix restored the `function` keyword but two additional structural bugs remained that still crashed the script block.

### Root Causes

1. **Missing `});` and `}` in `_syncEnemyVisuals`** (index.html ~line 3884): The `if (enemy.isCommander && player) { enemies.getChildren().forEach(other => { ... })` block was missing its arrow-function closing `});` and the outer `if` closing `}`. This left the forEach callback and the isCommander branch both unclosed, causing the JS parser to nest everything that followed inside them at the wrong scope depth.

2. **Missing `}` in `_applyEnemyObstacleAvoidance`** (index.html ~line 3963): The `if (_curSpd > 20) {` wall-stuck detection block was missing its closing `}`. The "Tank locomotion" code that followed was intended to run unconditionally (4-space indent = function body level), but the unclosed if left the entire function body open, so `_applyEnemyObstacleAvoidance`'s own closing `}` was consumed by the if block — leaving the function itself unclosed and producing "Unexpected end of input" at end-of-file.

### Effect

Even after the v4.8 keyword fix, the JS engine still could not parse the script block. `proceedToMainMenu` and all other functions remained undefined, keeping the game unlaunchable.

### Fix

- Restored `});` and `}` closing the `forEach` callback and `isCommander` if-block in `_syncEnemyVisuals`.
- Added the missing `}` closing the `if (_curSpd > 20)` block in `_applyEnemyObstacleAvoidance`.
- Verified with Node.js `--check`: script now parses cleanly. Brace balance: `{ 4080 } 4080 diff: 0`.

### Files Changed

- `index.html` — two structural brace fixes in `_syncEnemyVisuals` and `_applyEnemyObstacleAvoidance`
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v4.9

---

## v4.8 — Fix Callsign Screen Syntax Error

**Date:** 2026-03-20

Fixed a syntax error that crashed the entire inline `<script>` block, preventing all functions below it (including `proceedToMainMenu`) from being defined.

### Root Cause

Line 3898 of `index.html` read `nction _applyEnemyObstacleAvoidance(...)` — the `fu` prefix was missing, making `nction` a bare identifier followed by a function-call expression and a stray `{`, which the JS parser reported as "missing ) after argument list" (line ~3896).

### Effect

The script parse error killed the entire inline `<script>` block. `proceedToMainMenu` (defined at line 13613) was never registered, so clicking Proceed on the callsign screen threw `ReferenceError: proceedToMainMenu is not defined` — making the game unlaunchable.

### Fix

Restored `fu` so the declaration reads `function _applyEnemyObstacleAvoidance(...)`. No other changes.

### Files Changed

- `index.html` — line 3898: `nction` → `function`
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v4.8

---

## v4.7 — Final Consistency Check

**Date:** 2026-03-20

Pre-split consistency audit. Verified all function references, variable references, typeof guards, and documentation accuracy. No game logic changed.

### Checks Performed

1. **Function references** — All function calls in `index.html` resolve to existing definitions. All 22 v4.6 sub-functions and 2 v4.5 helpers verified present. No dangling calls found.
2. **Variable references** — All variable references in `index.html` resolve to existing declarations. `GAME_CONFIG` and `GAME` (renamed v4.3) confirmed in use throughout.
3. **typeof guards** — All guards reference functions that exist in the expected external file. No guard checks for a non-existent function.
4. **Documentation accuracy** — Found and fixed 5 issues (see below).
5. **CHANGELOG gaps** — Found duplicate v3.2 entry; resolved.

### Issues Found and Fixed

**DEPENDENCY_MAP.md — Section 1.3: 7 phantom unique-effect function entries removed**
- `triggerVoidstepDash`, `applyMirrorShieldBlock`, `checkArcDischarge`, `triggerNullCoreDetonation`, `checkChainReactionProc`, `checkWarpStrikeProc`, `updateEquippedUniqueEffects` were listed as guarded calls from `index.html` into `loot-system.js` but none of these functions exist anywhere in the codebase and no typeof guards for them appear in `index.html`. Removed the 7 stale rows.
- Replaced with accurate entries for the 12 unique-effect helpers that actually do exist and are called from `index.html` (`hasUniqueEffect`, `applyFrontalAbsorb`, `getShieldDRBonus`, `getImpactArmorDR`, `checkImpactArmor`, `isMatrixBarrierActive`, `triggerMatrixBarrier`, `getColossusDR`, `getColossusDmgMult`, `getDualReloadBonus`, `getUnstoppableSpeedBonus`, `checkDoubleStrike`, `spawnModCover`, `triggerCoreOverload`, `_showFloatingWarning`).

**DEPENDENCY_MAP.md — `game` → `GAME` in sections 2.1, 2.3, 4.1**
- The Phaser game instance was renamed from `game` to `GAME` in v4.3. Updated all three section entries.

**DEPENDENCY_MAP.md — Missing cross-file calls added in v4.4**
- Section 1.2: Added `_showArenaLabel()` (moved from `index.html` to `arena-objectives.js` in v4.4) and `_initPitZone()`.
- Section 1.4: Added `_updateCampaignXPBar()` (moved from `index.html` to `campaign-system.js` in v4.4), plus `completeCampaignMission`, `awardMissionReward`, `getSkillTreeBonuses`, `_closeShop`, `_closeLoadoutSlots`, `_closeUpgrades`.

**GLOBAL_INVENTORY.md — `config`/`game` entries updated**
- Section 1: Renamed `config` → `GAME_CONFIG` and `game` → `GAME` with v4.3 rename notes.
- Section 2: Same renames in destination table.
- Section 3: Collision-risk rows for `config` and `game` marked as resolved (renamed in v4.3).

**CHANGELOG.md — Duplicate v3.2 entry**
- Two entries both labeled `v3.2` existed: "Structural Audit Fixes" and "GLOBAL_INVENTORY.md Complete". The latter (oldest entry, positioned at the bottom of the file) renamed to `v3.0` to eliminate the duplicate version number.

### Files Changed

- `DEPENDENCY_MAP.md` — Section 1.2 (added `_showArenaLabel`, `_initPitZone`); Section 1.3 (removed 7 phantom functions, added 15 accurate unique-effect helper rows); Section 1.4 (added 6 missing guarded calls); Sections 2.1, 2.3, 4.1 (`game` → `GAME`)
- `GLOBAL_INVENTORY.md` — Section 1 (`config` → `GAME_CONFIG`, `game` → `GAME`); Section 2 (same); Section 3 (resolved-rename rows for `config`/`game`)
- `CHANGELOG.md` — Duplicate v3.2 renamed to v3.0; this entry added
- `OVERVIEW.md` — Version updated to v4.7

---

## v4.6 — Function Decomposition Pass

**Date:** 2026-03-20

Scanned all of `index.html` in ~500-line sections and extracted every function exceeding ~80 lines or handling more than one distinct responsibility. Each oversized function was split into a coordinator calling named sub-functions placed directly below under a `// ── Sub-section name` comment.

### Functions Split

| Parent Function | Lines Before | Sub-functions Extracted |
|---|---|---|
| `startRound` | ~184 | `_setupArenaAndObjective`, `_spawnCampaignEnemies`, `_spawnSimulationEnemies` |
| `damageEnemy` | ~329 | `_resolveEnemyDeath` |
| `populateStats` | ~347 | `_renderChassisPanel`, `_renderWeaponPanel`, `_renderMobilityPanel`, `_renderRunStatsPanel`, `_renderActivePerksPanel`, `_renderGearBonusesPanel` |
| `processPlayerDamage` | ~351 | `_applyExplosivePlayerDamage`, `_applyPassiveShieldAbsorption` |
| `deployMech` | ~303 | `_registerEnemyBulletOverlap`, `_initPlayerHP`, `_execDropInTween` |
| `enemyFire` | ~202 | `_dispatchEnemyWeapon` |
| `spawnEnemy` | ~143 | `_assignEnemyToSquad` |
| `_showItemDetail` | ~135 | `_buildItemComparisonHTML` |
| `handleEnemyAI` | ~634 | `_applyEnemyPassiveShieldRegen`, `_computeEnemyVisibility`, `_updateEnemyAIState`, `_calcEnemyBehaviorVelocity`, `_handleEnemyFiringDecision`, `_applyEnemyObstacleAvoidance`, `_syncEnemyVisuals` |

**Total: 9 parent functions split → 22 new named sub-functions created.**

Functions assessed and left intact (single responsibility or tightly coupled internals): `generateCover`, `fire`, `drawMinimap`, `spawnTitan`, `spawnCore`, `togglePause`, `returnToHangar`, `updatePaperDoll`.

---

## v4.5 — Duplicate Logic Audit

**Date:** 2026-03-20

Full duplicate-logic audit of all ~14,200 lines of `index.html`, scanning in ~500-line sections. Any logic implemented more than once — either twice inside `index.html`, or once in `index.html` and once in an external file — was identified and collapsed into a single canonical implementation.

### Duplicates Found and Fixed

**`drawMine()` closure — duplicated in `dropMine()` and `dropEnemyMine()`**
- Lines ~10721–10734 (inside `dropMine`) and ~10769–10782 (inside `dropEnemyMine`) contained a byte-for-byte identical 14-line inline closure for drawing mine graphics (flat disc, crosshair, pulsing danger ring). The comment in `dropEnemyMine` even noted "identical to player mine."
- Fix: Extracted shared module-level helper `_drawMineGraphic(g, mx, my, glowAlpha)` immediately before `dropMine()`.
- Both closures replaced with `const drawMine = () => _drawMineGraphic(g, mx, my, _glowAlpha);`.
- No `typeof` guard needed — helper lives in the same inline `<script>`.

**`_perkState` reset object — duplicated three times**
- Identical ~100-field perk state reset object appeared in three functions:
  - `respawnMech()` — single-line version
  - `goToMainMenu()` — 39-line formatted version
  - `returnToHangar()` — 39-line formatted version
- Comments in the code explicitly warned "must match the shape in returnToHangar() exactly" — acknowledging the duplication.
- Fix: Extracted shared factory function `_resetPerkState()` immediately before `respawnMech()`.
- All three `_perkState = { ... }` assignments replaced with `_perkState = _resetPerkState();`.
- No `typeof` guard needed — factory lives in the same inline `<script>`.

### Sections Scanned — No Other Duplicates Found

- Lines 1–4500 (prior session): CSS, HTML, constants, chassis/weapon/perk data, audio engine, state vars, `handleEnemyAI()`, movement/visual functions
- Lines 4500–10712: perk menu, round management, cloud saves, scene helpers, boss spawners, enemy AI, all `fireXxx()` functions, `processPlayerDamage()`, `damageEnemy()`
- Lines 10712–10806: `dropMine()` / `dropEnemyMine()` — **DUPLICATE FOUND AND FIXED** ✓
- Lines 10807–11309: visual FX helpers, mech building, utility functions, HUD update functions
- Lines 11310–12041: garage option arrays, `SLOT_DESCS`, dropdown system, `updateGarageStats()`, `showDeathScreen()`, `_cleanupGame()`
- Lines 12041–12309: `respawnMech()`, `toggleStats()`, `toggleInventory()`, `_switchLoadoutTab()`
- Lines 12310–12809: inventory/item UI, drag-and-drop handlers, `populateStats()` start
- Lines 12810–13309: `populateStats()` completion, `togglePause()`, ESC key handler, `goToMainMenu()` — **DUPLICATE FOUND** (perk reset)
- Lines 13310–end: `returnToHangar()` — **DUPLICATE FOUND** (perk reset); entry points, campaign flow, `startGame()`, `startMultiplayer()`
- All perk reset duplicates **FIXED** in a single pass ✓

### Files Changed

- `index.html` — `_drawMineGraphic()` helper added; both `drawMine` closures replaced; `_resetPerkState()` factory added; three `_perkState = { ... }` blocks replaced with `_resetPerkState()` calls

---

## v4.4 — Misplaced Function Audit

**Date:** 2026-03-20

Full audit of all functions in `index.html` against the three misplacement criteria: (1) exclusively operates on data owned by an external file, (2) duplicates logic already in an external file, (3) clearly belongs to a system with its own file. Scanned all ~14,200 lines in ~500-line sections.

### Misplacements Found and Fixed

**`_showArenaLabel(scene, arenaLabel, objLabel)` — moved from `index.html` → `js/arena-objectives.js`**
- Exclusively read `ARENA_DEFS` and `_arenaState` (both owned by `arena-objectives.js`).
- Added after `getObjectiveLabel()` in the arena label helper section of `arena-objectives.js`.
- The `ARENA_DEFS` typeof guard in the original was removed (unnecessary inside the owning file).
- Deleted from `index.html`. Call site in `startRound()` wrapped with `if (typeof _showArenaLabel === 'function')` guard.

**`_updateCampaignXPBar()` — moved from `index.html` → `js/campaign-system.js`**
- Exclusively read `_campaignState.playerLevel` / `.playerXP` and called `getXPForLevel()` / `getXPToNextLevel()` (all owned by `campaign-system.js`).
- Added in a new `// CAMPAIGN HUD HELPERS` section before the `// MISSION SELECT UI` section in `campaign-system.js`.
- Internal typeof guards for `_campaignState`, `getXPForLevel`, `getXPToNextLevel` removed (unnecessary inside the owning file); `_gameMode` guard changed to `typeof _gameMode === 'undefined'` check since `_gameMode` is index.html state.
- Deleted from `index.html`. Call site in `populateStats()` wrapped with `if (typeof _updateCampaignXPBar === 'function')` guard.

### Sections Scanned — No Other Misplacements Found

- Lines 1–500: HTML/CSS only
- Lines 500–1400: HTML/CSS only
- Lines 1400–2600: game state vars, `_perks` const, `resetLoadout()`, `_applyStarterLoadout()` — all index.html state
- Lines 2600–2965: audio engine (`_getAC`, `_canPlay`, `_tone`, `_noise`, all `sndXxx`) — no audio.js file yet
- Lines 2965–3312: `preload()`, `create()`, `update()`, `handleBulletEnemyOverlap()` — Phaser lifecycle, index.html state
- Lines 3312–3946: `handleEnemyAI()` — index.html state
- Lines 3946–4772: movement, firing, sync, perk selection, `showPerkMenu()`, `_showEquipPrompt()`, `showRoundBanner()` — index.html state
- Lines 4772–4870: `_showArenaLabel()` → **MOVED** ✓; `_clearMapForRound()` — index.html state
- Lines 4865–5083: `startRound()` — index.html orchestrator
- Lines 5083–5288: cloud save / leaderboard helpers — index.html state
- Lines 5288–6054: leaderboard, spectral clone, `destroyEnemyWithCleanup()`, `onEnemyKilled()`, minimap, extraction — index.html state
- Lines 6054–6379: `deployMech()` — index.html state
- Lines 6379–6525: `applyAugment()`, `applyLegSystem()` — write to `_perkState` (index.html state)
- Lines 6525–7407: all `activateXxx()` mod functions — index.html state
- Lines 7407–7765: `generateCover()`, `placeBuilding()`, `spawnMedic()` — index.html state
- Lines 7765–8892: boss spawners — index.html state
- Lines 8892–9543: `randomEnemyLoadout()`, `spawnEnemy()`, `spawnCommander()`, `enemyFire()` — index.html state
- Lines 9543–10730: `fire()` and all `fireXxx()` functions, `processPlayerDamage()`, `damageEnemy()` — index.html state
- Lines 10730–11056: `dropMine()`, `updateEnemyDoll()`, visual FX — index.html state
- Lines 11056–11576: `buildPlayerMech()`, `buildEnemyTorso()`, utility helpers, `updateHUD()`, `updateBars()`, `updatePaperDoll()` — index.html state
- Lines 11576–12116: garage system — index.html state
- Lines 12116–12196: `toggleStats()`, `toggleInventory()`, `_switchLoadoutTab()` — index.html state
- Lines 12196–12675: inventory UI, drag-and-drop handlers, stat helpers — mixed index.html/loot-system state
- Lines 12675–12695: `_updateCampaignXPBar()` → **MOVED** ✓
- Lines 12695–13044: `populateStats()` — multi-system read, index.html orchestrator
- Lines 13044–13507: event handlers, `togglePause()`, `goToMainMenu()`, `returnToHangar()` — index.html state
- Lines 13507–end: entry points, campaign chassis select, `startGame()`, `startMultiplayer()` — index.html state

### Files Changed

- `index.html` — `_showArenaLabel()` deleted, `_updateCampaignXPBar()` deleted, two call sites updated with typeof guards
- `js/arena-objectives.js` — `_showArenaLabel()` added after `getObjectiveLabel()`
- `js/campaign-system.js` — `_updateCampaignXPBar()` added in new `CAMPAIGN HUD HELPERS` section

---

## v4.3 — Constants Audit & Magic Number Extraction

**Date:** 2026-03-20 (Central Time)

Full audit of all 46 top-level `const` declarations in `index.html`, classification of magic numbers in the JS logic sections, and targeted fixes.

### PART 1 — Audit

Classified all 46 top-level `const` declarations alphabetically into three categories:

- **TRUE CONSTANT (20):** Never reassigned and never mutated — safe for `constants.js` in the upcoming split. Includes `_FEELER_OFFSETS`, `_MAX_NODES`, `COMMANDER_COLORS`, `ENEMY_2H_WEAPONS`, `ENEMY_ARM_WEAPONS`, `ENEMY_PRIMARY`, `EXPLOSIVE_KEYS`, `LB_KEY`, `LB_MAX`, `MEDIC_COLORS`, `SCORE_MAX_*`, `SLOT_ID_MAP`, all `SUPABASE_*` constants, and two that needed renaming (`config`, `game`).
- **MUTATED CONSTANT (3):** Declared `const` but properties written at runtime — `CHASSIS`, `_sndThrottle`, `_CONE_RAY_POINTS`.
- **LOOKUP TABLE (23):** Large read-only data objects — `CHASSIS_WEAPONS`, `SHIELD_SYSTEMS`, `WEAPONS`, `_perks`, `COVER_DEFS`, `LOOT_TYPES`, all garage dropdown option arrays, etc.

Magic number scan identified two module-level values appearing 10+ times each with no named form: `4000` (world size) and `2000` (world center / player spawn).

### PART 2 — Fixes

**Step 1 — ⚠️ MUTATED AT RUNTIME comments (`index.html`):**
- Added comment above `CHASSIS` explaining that `applyChassisUpgrades()` and `tactical_uplink` write into it at runtime.
- Added comment above `_sndThrottle` explaining that `_canPlay()` writes timestamps into it on every sound play.
- Added comment above `_CONE_RAY_POINTS` explaining that `handleEnemyAI()` overwrites `.x`/`.y` on each element every frame.

**Step 2 — Magic number extraction (`index.html`):**
- Added `WORLD_SIZE = 4000` and `WORLD_CENTER = 2000` at the top of the CONSTANTS section.
- Extracted 19 magic numbers into named constants across `setBounds`, `centerOn`, `setPosition`, `Distance.Between`, arena generator, swarm spawn, Core boss, and AI patrol target clamping calls.

**Step 3 — SCREAMING_SNAKE_CASE renames (`index.html` + all 5 external JS files):**
- `config` → `GAME_CONFIG` (2 sites in `index.html`).
- `game` → `GAME` (83 lines in `index.html`; 30 additional lines across `loot-system.js`, `enemy-types.js`, `multiplayer.js`, `arena-objectives.js`, `campaign-system.js`). `scene.game` (Phaser's internal scene property) was correctly preserved unchanged.

### Files Changed

- `index.html` — `⚠️` comments on `CHASSIS`, `_sndThrottle`, `_CONE_RAY_POINTS`; new `WORLD_SIZE`/`WORLD_CENTER` constants; 19 magic number replacements; `config` → `GAME_CONFIG`; `game` → `GAME` throughout.
- `js/loot-system.js` — `game` → `GAME` (7 lines).
- `js/enemy-types.js` — `game` → `GAME` (3 lines).
- `js/multiplayer.js` — `game` → `GAME` (16 lines).
- `js/arena-objectives.js` — `game` → `GAME` (2 lines).
- `js/campaign-system.js` — `game` → `GAME` (2 lines).
- `CHANGELOG.md` — this entry.
- `OVERVIEW.md` — version updated to v4.3.

---

## v4.2 — Dependency Map

**Date:** 2026-03-20 (Central Time)

Produced a complete static dependency map of the codebase in preparation for the upcoming file split. No game logic was modified.

### What Was Documented

- **Section 1 — INDEX.HTML → EXTERNAL FILES:** Every call from `index.html`'s inline script into the five external JS files, with call-site line numbers and typeof-guard status. Identified six unguarded call chains (simulation enemy spawn path calls `applyEliteModifier`/`_rollEliteModifier` directly; `checkEquipmentPickups` runs unguarded every frame in `update()`; `saveCampaignProgress`/`saveInventory`/`cleanupEquipmentDrops`/`loadCampaign*` have no guards).

- **Section 2 — EXTERNAL FILES → INDEX.HTML:** All globals and functions defined in `index.html` that the external files depend on. Includes Phaser objects (`player`, `torso`, `enemies`, `enemyBullets`, `coverObjects`, `game`), constants (`CHASSIS`, `WEAPONS`, `SHIELD_SYSTEMS`, `CHASSIS_*`, `ENEMY_COLORS`), state variables (`_round`, `_perkState`, `_gameMode`, etc.), and callback functions (`buildEnemyMech`, `buildEnemyTorso`, `damageEnemy`, `showDamageText`, `updateBars`, etc.). Notable: `multiplayer.js` **writes** `torso`, `_lArmDestroyed`, `_rArmDestroyed`, `_legsDestroyed`, and `_totalKills` back into index.html state.

- **Section 3 — EXTERNAL FILES → EXTERNAL FILES:** Two cross-file dependencies identified: (1) `loot-system.js` calls `getObjectiveLootBonus()` from `arena-objectives.js` (typeof guarded); (2) `campaign-system.js` reads and writes `_scrap` owned by `loot-system.js` (no guard).

- **Section 4 — SHARED GLOBALS:** Full table of every variable written by one file and read by another. Flags `CHASSIS` mutation by `campaign-system.js`, `_scrap` shared between two external files, `_mpMatchActive` read as a bare variable in `fire()` with no typeof guard, and `_campaignState`/`_arenaState` accessed directly by index.html bypassing their owner files' APIs.

- **Refactor Risk Summary:** Ranked table of the highest-risk items to address before any file is moved.

### Files Changed

- `DEPENDENCY_MAP.md` — created (new file, project root)
- `CHANGELOG.md` — this entry

---

## v4.1 — PVP Bug-Fix Audit

**Date:** 2026-03-20 (Central Time)

Eliminated all PvE-bleed into PVP, guaranteed cleanup of every remote-player object on disconnect or exit, and ensured a fully clean state when switching from PVP into simulation or campaign.

### Area 1 — PvE Bleed into PVP

- **`update()` — `updateColossusStand` unguarded (index.html):** The call to `updateColossusStand(time)` was placed after the `if (_gameMode !== 'pvp')` block and therefore ran every frame in PVP mode. Moved it inside the guard block alongside the other PvE-only per-frame systems.

- **`deployMech()` — round HUD and `startRound()` unguarded (index.html):** Inside the drop-in tween `onComplete`, the `round-hud` element was unconditionally shown and `startRound(_round)` was unconditionally called. If `deployMech()` were invoked in PVP mode (or called defensively), this would have spawned PvE enemies, set up arena/objectives, and displayed the round counter. Wrapped the entire block in `if (_gameMode !== 'pvp')`.

- **`startRound()` — no PVP guard (index.html):** No early-return existed at the top of the function. Added `if (_gameMode === 'pvp') return;` as the first statement so that any path that calls `startRound()` during PVP — including future code — is silently skipped rather than spawning enemies, running the arena/objective system, or mutating `_roundTotal`.

- **`onEnemyKilled()` — no PVP guard (index.html):** The function had no PVP guard. If called during PVP (e.g. from a leftover timer or future code), it would increment `_roundKills`, call `_spawnExtractionPoint()`, and display a "REACH EXTRACTION POINT" banner. Added `if (_gameMode === 'pvp') return;` at the top.

- **`_triggerExtraction()` — no PVP guard (index.html):** No early-return existed. Extraction sets `_roundClearing = true`, runs campaign XP logic, calls `showPerkMenu()`, and blocks `update()` — none of which should ever run in PVP. Added `if (_gameMode === 'pvp') return;` at the top.

### Area 2 — Remote Player Cleanup

- **`mpDisconnect()` — remote player visuals leaked on clear (js/multiplayer.js):** `_mpPlayers.clear()` dropped the JS references but never called `mpDestroyRemotePlayer()` for each entry. Any remote players that existed at disconnect time (e.g. when leaving a lobby that had previously started a match) would remain as orphaned Phaser scene objects — body sprites, torso containers, and name tags — with no path to destruction. Added a `_mpPlayers.forEach(mpDestroyRemotePlayer)` loop immediately before the `.clear()` call.

- **`mpCleanupMatch()` — kill-feed overlay not hidden (js/multiplayer.js):** The `#mp-killfeed` overlay was shown via `mpShowKillFeedOverlay()` at match start but never hidden in `mpCleanupMatch()`. After a match ended or the player disconnected, the kill feed remained visible on top of the main menu or hangar. Added `killfeedEl.style.display = 'none'` to the UI teardown block in `mpCleanupMatch()`.

- **`mpCleanupMatch()` — `_mpAlive`, `_mpKills`, `_mpDeaths`, `_mpMySpawn` not reset (js/multiplayer.js):** These four fields were only initialised in the `match-begin` handler, never reset in `mpCleanupMatch()`. A player who died in one match would re-enter the next match with `_mpAlive = false`, locking them out of firing and state-sends. Reset all four to their default values (`_mpAlive = true`, `_mpKills = 0`, `_mpDeaths = 0`, `_mpMySpawn = null`) inside `mpCleanupMatch()`.

- **`_pvpBackToMenu()` — bypassed all cleanup and state reset (js/multiplayer.js):** The function only called `mpHidePvpHangar()` and manually set `main-menu` to visible, bypassing `_cleanupGame()`, `mpCleanupMatch()`, `mpDisconnect()`, and all variable resets. Any remote player objects or socket listeners active at that point were leaked, and `_gameMode` was left as `'pvp'`. Replaced the manual display code with a call to `goToMainMenu()`, which now contains the full PVP exit path (see Area 3).

### Area 3 — State Reset on Mode Switch

- **`goToMainMenu()` — no PVP cleanup path (index.html):** When called while `_gameMode === 'pvp'`, `goToMainMenu()` went straight into `_cleanupGame()`, which in PVP mode preserves the local player mech and all remote player objects (by design, to keep them alive during a match). The remote players were never destroyed, the Socket.IO socket was never disconnected, and `_pvpHangarOpen`/`_mpChatOpen` were never reset. Added a PVP guard block at the top of `goToMainMenu()` that, when `_gameMode === 'pvp'`: (1) calls `mpCleanupMatch()` to destroy all remote player scene objects; (2) calls `mpDisconnect()` to null the socket and remove all state intervals; (3) resets `_pvpHangarOpen = false` and `_mpChatOpen = false`; (4) hides the `#pvp-hangar` and `#mp-pvp-menu` overlays; (5) sets `_gameMode = 'simulation'` so the subsequent `_cleanupGame()` call destroys the local PVP mech objects instead of preserving them.

- **`_pvpQuitToMenu()` — manual state reset missed `_round`, `_perkState`, `loadout`, `_inventory` (js/multiplayer.js):** The function manually showed the main menu div and called `startMenuGrid()` but did not reset any game state variables. A PVP session followed by a simulation run would start with whatever `_round`, `_perkState`, `loadout`, and `_inventory` were set to during PVP (or from a prior session). Replaced the entire manual teardown block with a `goToMainMenu()` call (preceded by `_mpSocket?.emit('return-to-lobby')` so the server is notified before disconnect). `goToMainMenu()` now performs the full PVP cleanup path and resets all state.

### Version Bump

- **Version display updated to v4.1 in `#main-menu` subtitle and OVERVIEW.md.**

### Files Changed

- `index.html` — `update()` (moved `updateColossusStand` inside PVP guard); `startRound()` (added PVP guard); `onEnemyKilled()` (added PVP guard); `_triggerExtraction()` (added PVP guard); `deployMech()` drop-in `onComplete` (guarded round-hud show and `startRound()` call); `goToMainMenu()` (added PVP cleanup block: `mpCleanupMatch`, `mpDisconnect`, flag resets, overlay hides, `_gameMode` downgrade); version bump to v4.1
- `js/multiplayer.js` — `mpDisconnect()` (added remote-player destroy loop before `_mpPlayers.clear()`); `mpCleanupMatch()` (added `#mp-killfeed` hide; reset `_mpAlive`, `_mpKills`, `_mpDeaths`, `_mpMySpawn`); `_pvpBackToMenu()` (replaced manual display with `goToMainMenu()` call); `_pvpQuitToMenu()` (replaced manual teardown with `goToMainMenu()` call)
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v4.1

---

## v4.0 — Audio System Audit

**Date:** 2026-03-20 (Central Time)

Hardened the entire Web Audio engine against node leaks, unbounded `_activeNodes` growth, unthrottled high-frequency sound calls, premature AudioContext creation, and missing tab-visibility handling.

### Area 1 — Node Cleanup & `_activeNodes` Accuracy

- **Added `_lastNodeStartTime` tracking to `_tone()` and `_noise()` (index.html):** Both functions now set `_lastNodeStartTime = performance.now()` immediately after incrementing `_activeNodes`. This timestamp is used by the periodic audit (see next bullet) to detect when all in-flight nodes must have completed.

- **Added periodic audit `_auditActiveNodes` inside `_getAC()` (index.html):** A `setInterval` (2000 ms) is registered the first time the AudioContext is created. On each tick it checks two conditions: (1) if `_ac.state === 'closed'`, `_activeNodes` is reset to `0` immediately — closed-context nodes never fire `onended` so the counter would otherwise be stuck; (2) if `_activeNodes > 0` but more than `1500 ms` have elapsed since the last node was started (longer than the longest possible sound), the counter is also reset to `0`. This prevents the `_MAX_NODES` cap from permanently silencing audio after a rare `onended` dropout.

- **Added `if (!ac) return;` guard to `_tone()` and `_noise()` (index.html):** `_getAC()` now returns `null` before the first user gesture and when the context is closed. Both synthesis functions bail out immediately on a `null` return rather than relying on the outer `try/catch` to swallow a `TypeError`. This makes the early-exit explicit and avoids an unnecessary exception being generated and silently eaten on every call before the player has interacted.

- **`_activeNodes` safety floor already present — confirmed correct (index.html):** Both `onended` handlers use `Math.max(0, _activeNodes - 1)`, ensuring the counter can never go negative. No change needed here; documented as verified.

### Area 2 — Throttle Gaps

- **`sndShieldDeactivate()` — added `_canPlay('sdact', 300)` guard (index.html):** This function had no throttle at all. It is called via `activateShield()` expiry and could fire in rapid succession if the barrier mod cycled quickly.

- **`sndRage()` — added `_canPlay('rage', 500)` guard (index.html):** No throttle existed. Multiple rage stacks, the Titan boss rage effect, and the secondary rage mod path all call this function independently.

- **`sndJump()` — added `_canPlay('jump', 250)` guard (index.html):** No throttle existed. Rapid jump key presses (or the sprint-boosters perk reducing cooldown) could fire nodes faster than they complete.

- **`sndLoot(type)` — added `_canPlay('loot_' + type, 200)` guard (index.html):** No throttle existed. Walking over a cluster of loot orbs triggers one call per orb per frame until each is consumed, potentially stacking many simultaneous nodes.

- **`sndCommanderSpawn()` — added `_canPlay('cmdsn', 300)` guard (index.html):** No throttle existed. Squad-based spawns can produce multiple commanders in the same tick, particularly in campaign mode with staggered spawning.

- **`sndRoundClear()` — added `_canPlay('rclr', 500)` guard (index.html):** No throttle existed. While typically a one-shot event, the guard protects against double-fire if the round-end path is re-entered during the perk-menu transition.

- **`sndRoundStart()` — added `_canPlay('rstrt', 500)` guard (index.html):** No throttle existed. Same rationale as `sndRoundClear()`.

- **Drone fire sound (line in `_spawnDrone` fire callback) — wrapped with `_canPlay('drone_fire', 150)` (index.html):** The Overwatch perk can activate two drones simultaneously, each firing on independent 1000 ms timers. The two fire events can coincide within the same frame, doubling the node cost with no throttle. Throttled at 150 ms to allow distinct sounds for near-simultaneous hits while preventing duplicates.

- **Missile impact sound (in `activateMissiles()` tween onComplete) — wrapped with `_canPlay('mslimp', 100)` (index.html):** Up to 3 missiles land within 150 ms of each other (150 ms stagger × 3), all calling `_noise()` directly with no throttle. Added 100 ms minimum gap so the first impact is always audible.

- **Medic heal sound (in `spawnMedic()` heal-aura timer) — wrapped with `_canPlay('medic_heal', 500)` (index.html):** Multiple medics share the same 2500 ms heal timer but their callbacks are not synchronized. In a round with several medics, multiple `_tone()` calls could arrive in the same frame with no throttle.

- **Titan artillery impact sound (in `spawnTitan()` phase-1 artillery timer) — wrapped with `_canPlay('art_imp', 100)` (index.html):** Phase 1 fires 3 mortar rounds every 2000 ms; phase 3 fires additional alternating attacks every 2500 ms. Each mortar's tween `onComplete` called `_tone()` directly, producing up to 3 concurrent unthrottled nodes every 2 seconds.

### Area 3 — AudioContext Lifecycle

- **Added `_audioReady` flag and `_onFirstUserGesture` handler (index.html):** `_getAC()` now returns `null` and skips context creation until `_audioReady` is `true`. The flag is set by a one-shot `mousedown`/`keydown` listener (`_onFirstUserGesture`) that removes itself after the first event. This satisfies the browser autoplay policy, which requires an AudioContext to be created or resumed within a user-gesture handler, and prevents a silent suspended-context from being constructed during script evaluation or Phaser init.

- **Added `_onVisibilityChange` handler (index.html):** `document.addEventListener('visibilitychange', ...)` calls `_ac.suspend()` when `document.hidden` is `true` and `_ac.resume()` when the tab becomes visible again (only if the state is `'suspended'`, to avoid calling `resume()` on a running or closed context). This stops audio processing while the game is in the background, reducing CPU usage and preventing sounds from playing into an unlistened-to context.

- **Both lifecycle handlers registered in an IIFE `_initAudioLifecycle()` (index.html):** Wrapped in an immediately-invoked function expression to keep the listener references contained and avoid polluting the module-level scope with one-shot helper functions.

### Version Bump

- **Version display updated to v4.0 in `#main-menu` subtitle and OVERVIEW.md.**

### Files Changed

- `index.html` — audio globals (added `_lastNodeStartTime`, `_audioReady`); `_getAC()` (added `_audioReady` guard, `_auditActiveNodes` setInterval); `_tone()` (added `if (!ac) return`, `_lastNodeStartTime` update); `_noise()` (added `if (!ac) return`, `_lastNodeStartTime` update); `sndShieldDeactivate()` (added throttle); `sndRage()` (added throttle); `sndJump()` (added throttle); `sndLoot()` (added per-type throttle); `sndCommanderSpawn()` (added throttle); `sndRoundClear()` (added throttle); `sndRoundStart()` (added throttle); `_spawnDrone()` drone fire callback (added throttle); `activateMissiles()` impact callback (added throttle); `spawnMedic()` heal-aura callback (added throttle); `spawnTitan()` artillery impact callback (added throttle); `_initAudioLifecycle()` IIFE (new — user-gesture guard + visibility handler); version bump to v4.0
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v4.0

---

## v3.9 — Accessibility & UX Audit

**Date:** 2026-03-20 (Central Time)

Eliminated all purely mouse-only interactions in menus and overlays, replaced hardcoded pixel sizes that broke at narrow viewports, added visible loading and error feedback to every async operation, and corrected cursor/physics state across all overlay open/close paths.

### Area 1 — Mouse-Only Interactions: Keyboard Support Added

- **Global keydown handler rewritten (index.html):** Restructured the single `document.addEventListener('keydown', ...)` handler to process overlays in priority order before falling through to `togglePause`. Perk menu, death screen, equip prompt, campaign shop/slots/upgrades, leaderboard, and stats overlay are all now checked first so Escape and Enter work in every context regardless of which layer is frontmost.

- **Perk menu — number keys 1–4 pick a perk; arrow keys navigate cards; Enter confirms (index.html `showPerkMenu`):** Added module-level `_currentPerkKeys[]` and `_currentPerkNextRound` so the keydown handler can resolve the selection without DOM traversal. Each `.perk-card` is now `tabindex="0"` with `role="button"` and an `aria-label`. The slot label shows the `[N]` hint so keyboard users can see which key to press. Focus is moved to the first card when the menu opens. Cards also handle `keydown` for Enter/Space directly.

- **Death screen — Enter triggers primary action, Escape goes to main menu (index.html global keydown):** The death screen check fires before any pause or overlay handling, preventing Enter from leaking through to the game loop.

- **Equip-prompt — Enter opens inventory, Escape skips (index.html global keydown + `_showEquipPrompt`):** The equip prompt was entirely keyboard-inaccessible. Keyboard shortcuts now match the two visible buttons.

- **Leaderboard — Escape closes it (index.html global keydown):** Previously only the "MAIN MENU" button could dismiss the leaderboard.

- **Stats/Loadout overlay — Escape closes it from any context (index.html global keydown):** This was missing when the overlay was opened from the hangar (not deployed). The check is now in the global handler and fires correctly in both deployed and hangar contexts.

- **Main menu — Up/Down arrow keys move focus between buttons; Escape closes campaign sub-menu (index.html `_mainMenuKeyNav` listener):** Added a dedicated named keydown handler that attaches to document and routes arrow key presses to the visible button list (main or campaign sub-menu), enabling full keyboard navigation without a mouse.

- **Campaign sub-menu — first button focused on open (index.html `showCampaignSubMenu`):** After the cloud check resolves and the correct buttons are visible, focus is moved to the first enabled button so arrow navigation begins immediately.

- **Pause menu — first button focused on open (index.html `togglePause`):** When the pause overlay is shown, `firstPauseBtn.focus()` ensures Tab and arrow keys work immediately for keyboard-only users.

- **Campaign chassis select — Left/Right arrows pick chassis; Enter confirms; Escape cancels (index.html global keydown):** The `mission-select-overlay` is tagged `dataset.mode = 'chassis-select'` while in chassis selection mode so the handler can distinguish it from the mission list screen. `_cancelNewCampaign()` now also cleans up the dataset attribute on close.

- **Campaign shop, loadout-slots, upgrades overlays — Escape closes each and returns to mission select (index.html global keydown):** Three campaign overlays from `campaign-system.js` are now keyboard-dismissible via `_closeShop()`, `_closeLoadoutSlots()`, and `_closeUpgrades()` (all called with `typeof` guards).

### Area 2 — Screen Size Assumptions: Responsive Fixes

- **Boss HP bar — hardcoded `width:440px` and `min-width:480px` replaced with viewport-relative values (index.html HTML):** `#boss-hud` now uses `min-width:min(480px,96vw)` and `max-width:96vw`; `#boss-bar-track` uses `width:min(440px,calc(96vw - 40px))`. The bar shrinks gracefully on any screen narrower than ~530px instead of overflowing.

- **Perk cards — `width:200px` replaced with `clamp(160px, 200px, calc(50vw - 24px))` (index.html CSS):** Cards contract on screens narrower than ~450px so the perk menu remains usable on small viewports.

- **Perk card focus state added to CSS (index.html CSS):** `.perk-card:focus` now shares the hover style (glow, border highlight, translateY), giving keyboard users a clear visual indicator without a browser default focus ring.

- **Phaser canvas resize handler added (index.html, after `new Phaser.Game`):** `window.addEventListener('resize', _onWindowResize)` calls `game.scale.resize(window.innerWidth, window.innerHeight)` so the canvas fills the window correctly after any browser resize, browser zoom change, or device orientation change.

### Area 3 — Error & Loading States: Async Feedback

- **`_showCloudStatusToast(msg, isError)` helper added (index.html):** Creates a small fixed-position toast in the top-right corner that fades out after 2.4 s. Used to surface silent async results to the player without blocking UI.

- **`saveToCloud()` now shows success/failure toast (index.html):** On a successful Supabase upsert the toast reads "CLOUD SAVE SYNCED" (cyan). On a network error or non-OK response it reads "CLOUD SAVE FAILED — SAVED LOCALLY" (red). Previously all outcomes were silent apart from a `console.warn`.

- **Campaign resume — button disabled and relabeled "LOADING SAVE DATA…" during `_loadCampaignData()` (index.html `startGame`):** The "RESUME CAMPAIGN" button now gives visible feedback while the cloud fetch is in progress. The button is re-enabled and its original label is restored in the `.finally()` handler regardless of whether the load succeeded or fell back to localStorage.

- **Campaign sub-menu — "CHECKING SAVE DATA…" label shown while cloud check runs (index.html `showCampaignSubMenu`):** When no local save exists, the resume button is temporarily enabled, relabeled, and disabled during the async cloud check rather than silently flickering in/out of view.

- **Socket.IO connection error — error state shown in lobby status bar (js/multiplayer.js `mpConnect`):** `connect_error` now updates `#mp-lobby-status` to "CONNECTION FAILED — CHECK SERVER" in red. `disconnect` updates it to "DISCONNECTED — RECONNECTING…" in red rather than reverting to the static "CONNECTING…" string that gave no indication of a prior failure.

### Area 4 — UI State Consistency: Overlay/Cursor/Physics

- **Equip-prompt cursor fix (index.html `_showEquipPrompt`):** When the equip-prompt overlay appears, the cursor is now explicitly set to `'default'` (both on the DOM body and via Phaser's `setDefaultCursor`). Previously the cursor remained `'none'` (the in-game cursor) while the prompt was visible, making the mouse pointer invisible and the buttons effectively unclickable without knowing cursor position.

- **Global ESC handler ordering fixed (index.html global keydown):** The handler now checks overlays in strict priority order — perk menu → death screen → equip prompt → campaign overlays → leaderboard → stats overlay → chassis select → pause — ensuring that Escape always closes the topmost visible layer and never leaks through to trigger a second action.

- **`_cancelNewCampaign()` cleans up `dataset.mode` (index.html):** The chassis-select `data-mode` attribute is now removed from `mission-select-overlay` on cancel so the chassis-select ESC handler does not accidentally intercept keys when the overlay is later reused for the campaign mission list.

### Version Bump

- **Version display updated to v3.9 in `#main-menu` subtitle and OVERVIEW.md.**

### Files Changed

- `index.html` — `showPerkMenu()` (tabindex/role/aria-label/key-hint on cards, focus first card); global keydown handler (perk keys 1–4, death-screen Enter/ESC, equip-prompt Enter/ESC, campaign overlays ESC, leaderboard ESC, stats ESC, chassis-select arrows/Enter/ESC); `_mainMenuKeyNav` listener (arrow key main menu nav); `togglePause()` (focus first button on open); `_showEquipPrompt()` (cursor fix); `showCampaignSubMenu()` (loading state + focus); `showCampaignSubMenu()` (first-button focus); `_showNewCampaignChassisSelect()` (dataset.mode tag); `_cancelNewCampaign()` (clear dataset.mode); `startGame()` (campaign loading state with disable/relabel); `saveToCloud()` (success/fail toast); `_showCloudStatusToast()` (new helper); `.perk-card` CSS (clamp width, :focus state); `#boss-hud`/`#boss-bar-track` (responsive min/max/width); `window resize` listener (Phaser canvas resize); version bump to v3.9
- `js/multiplayer.js` — `mpConnect()` (`connect_error` and `disconnect` error states in lobby status)
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v3.9

---

## v3.8 — State Reset Audit

**Date:** 2026-03-20 (Central Time)

Eliminated all stale global state that could carry over between runs, mode switches, and rounds by auditing every cleanup and reset path and adding the missing explicit resets.

### Area 1 — `_cleanupGame()` Missing Resets

- **`_roundClearing` and `_roundActive` not reset in `_cleanupGame()` (index.html):** Both flags were only reset by callers (`returnToHangar`, `respawnMech`) after `_cleanupGame()` returned. Any future caller added without explicit post-reset would inherit stale `true` values, permanently gating `update()` or allowing logic to run while a round is supposedly inactive. Fixed: added `_roundClearing = false; _roundActive = false;` directly inside `_cleanupGame()`.

- **`_lArmDestroyed`, `_rArmDestroyed`, `_legsDestroyed` not reset in `_cleanupGame()` (index.html):** These flags were cleared by `_resetHUDState()` (called later in `returnToHangar`/`respawnMech`) but not by `_cleanupGame()` itself. `goToMainMenu()` called `_cleanupGame()` but not `_resetHUDState()`, leaving the destroyed flags set when returning to the main menu. Fixed: added explicit resets to `_cleanupGame()`.

- **`window._activeDecoy`, `window._phantomDecoys` not cleaned up in `_cleanupGame()` (index.html):** `_clearMapForRound()` cleaned these between rounds, but if the player quit mid-round (death or pause→quit), the decoy torso remained a live (or destroyed) scene object and the phantom decoy timer events kept firing. Fixed: `_cleanupGame()` now explicitly destroys the active decoy, removes drift/fire timer events on all phantom decoys, and nulls both window references.

- **`window._activeSwarm` not nulled in `_cleanupGame()` (index.html):** The swarm boss `_swarmState` was only nulled on swarm defeat (inside `damageEnemy`). Quitting during a swarm boss fight left `window._activeSwarm` pointing to a defunct state object. Fixed: `_cleanupGame()` now removes the swarm tick timer and nulls `window._activeSwarm`.

- **`window._equipPromptCallback` not cleared in `_cleanupGame()` (index.html):** If the player opened the gear overlay from the equip-item prompt and then died/quit before closing it, the stored callback survived into the next session. The next time the loadout overlay was closed, the old callback would fire spuriously, triggering `startRound()` outside its intended context. Fixed: `window._equipPromptCallback = null` added to `_cleanupGame()`.

### Area 2 — `goToMainMenu()` Mode-Switch Resets

- **`CHASSIS.medium.modCooldownMult` not restored in `goToMainMenu()` (index.html):** `tactical_uplink` mod permanently mutates `CHASSIS.medium.modCooldownMult` from `0.85` toward `0.60` each time it is equipped. The restore line (`CHASSIS.medium.modCooldownMult = 0.85`) existed in `returnToHangar()` and `respawnMech()` but was absent from `goToMainMenu()`. A medium-chassis player who equipped `tactical_uplink` and quit directly to the main menu (via pause → Quit) would carry the reduced cooldown into the next simulation run even without the mod equipped. Fixed: restore line added to `goToMainMenu()`.

- **`_roundTotal` not reset in `goToMainMenu()` (index.html):** `_roundTotal` was omitted from the round-state reset block (`_round`, `_roundKills`, `_roundActive` were present). Fixed: added `_roundTotal = 0` to the same reset line.

- **Extraction state (`_extractionActive`, `_extractionPoint`, `_extractionVisuals`, `_extractionPromptShown`) not reset in `goToMainMenu()` (index.html):** These four variables were reset in `returnToHangar()` and `respawnMech()` but missing from `goToMainMenu()`. Fixed: added the full extraction reset block to `goToMainMenu()`.

- **`_lArmDestroyed`, `_rArmDestroyed`, `_legsDestroyed` not reset in `goToMainMenu()` (index.html):** `goToMainMenu()` calls `_cleanupGame()` and `resetLoadout()` but not `_resetHUDState()`. Fixed: explicit arm-destroyed resets added (now also covered by `_cleanupGame()` per Area 1, providing double insurance).

- **`_perkState` reset in `goToMainMenu()` was missing 15 legendary/chassis perk fields (index.html):** The one-liner `_perkState = { ... }` in `goToMainMenu()` was an older copy that pre-dated the legendary perk additions. Missing fields: `lightSpectre`, `lightGhostMech`, `mediumCommand`, `mediumApexSystem`, `heavyDreadnought`, `heavyTitan`, `adaptiveEvolution`, `heavyCoreTank`, `_heavyCoreTankUsed`, `heavyRampage`, `mediumOverload`, `mediumSalvage`, `mediumMultiMod`, `apexPredator`, `_apexPredatorActive`. A run where any of these perks were picked would leave them active in the next run's starting state. Fixed: replaced the stale one-liner with the canonical multi-line form matching `returnToHangar()`.

- **`window._spectreClones`, `_lastKillTime`, `window._missionStartTime` not reset in `goToMainMenu()` (index.html):** All three were reset in `returnToHangar()` but omitted from `goToMainMenu()`. Fixed: added all three to `goToMainMenu()`.

### Area 3 — Per-Round Reset in `resetRoundPerks()`

- **`_heavyCoreTankUsed` not reset at round start (index.html):** `heavyCoreTank` perk (legendary heavy) allows the player to survive one lethal hit per round. The `_heavyCoreTankUsed` flag that tracks this was set to `false` by the perk's `apply()` function (on pick) and on full `_perkState` wipe, but never reset by `resetRoundPerks()`. So after the first round where the player triggered the save, the perk would not activate again in subsequent rounds. Fixed: added `if (_perkState.heavyCoreTank) _perkState._heavyCoreTankUsed = false;` to `resetRoundPerks()`.

### Area 4 — `window.*` Globals in `returnToHangar()`

- **`_lastKillTime` not reset in `returnToHangar()` (index.html):** The module-level `_lastKillTime` counter (used for multi-kill streak tracking) was never zeroed on hangar return. A player who got a kill streak on their last round before returning to hangar would have a ~2-second window where the stale timestamp could falsely trigger streak logic on the very first kill of the next deploy. Fixed: `_lastKillTime = 0` added to `returnToHangar()`.

- **`window._missionStartTime` not reset in `returnToHangar()` (index.html):** The campaign mission speed-run timer was set at the start of each round and read at extraction to compute elapsed time. It was never nulled on hangar return, meaning a subsequent deploy's first bonus-objective check could read a time from a previous mission. Fixed: `window._missionStartTime = null` added to `returnToHangar()`.

### Files Changed

- `index.html` — `_cleanupGame()` (added `_roundClearing`, `_roundActive`, `_lArmDestroyed`/`_rArmDestroyed`/`_legsDestroyed`, `window._activeDecoy`/`window._phantomDecoys`, `window._activeSwarm`, `window._equipPromptCallback` resets); `goToMainMenu()` (added `_roundTotal`, extraction state, arm-destroyed flags, `CHASSIS.medium.modCooldownMult`, full `_perkState` with 15 legendary fields, `window._spectreClones`, `_lastKillTime`, `window._missionStartTime`); `resetRoundPerks()` (added `_heavyCoreTankUsed` per-round reset); `returnToHangar()` (added `_lastKillTime`, `window._missionStartTime`); version bump to v3.8
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v3.8

---

## v3.7 — Security & Input Validation Audit

**Date:** 2026-03-20 (Central Time)

Hardened all leaderboard submission paths, callsign handling, and external-data DOM rendering against score manipulation, filter bypass via paste, and XSS from Supabase-fetched strings.

### Area 1 — Leaderboard Score Integrity

- **Added validation constants `SCORE_MAX_ROUND`, `SCORE_MAX_KILLS`, `SCORE_MAX_DAMAGE` (index.html):** Defined upper bounds for submitted values — round cap 999, kills cap 30,000 (~30/round × 999 rounds), damage cap 100,000,000. These are used by `_validateScoreEntry()` to clamp all numeric fields.

- **Added `_validateScoreEntry(entry)` helper (index.html):** New function that clamps every numeric field via `Math.min/max/round(Number(...))`, restricts `chassis` to the known enum `['light','medium','heavy']`, and sanitizes `name` through `_sanitizeCallsign()`. Returns a safe, type-coerced copy of the entry.

- **`_capturePendingRun()` now passes raw values through `_validateScoreEntry()` (index.html):** All fields — round, kills, accuracy, damage, and name — are validated and clamped before being stored in `_pendingRun`. Accuracy was already computed as a ratio but is now also hard-clamped to 0–100.

- **`_insertScore()` validates entry before any Supabase or localStorage write (index.html):** First line of `_insertScore()` now calls `entry = _validateScoreEntry(entry)`, ensuring values are clamped even if called directly with unvalidated data.

### Area 2 — Callsign Sanitization

- **Added `_sanitizeCallsign(raw)` helper (index.html):** Single source of truth for callsign normalization — uppercases, strips all characters not in `[A-Z0-9 _.\-]` (matching the `_csKeyDown` allowlist), and slices to 16 characters. Falls back to `'ANONYMOUS'` if the result is empty.

- **`proceedToMainMenu()` now runs callsign through `_sanitizeCallsign()` before storing (index.html):** Previously the raw `.trim().toUpperCase()` value was stored directly, allowing characters inserted via paste (Ctrl+V) to bypass the `_csKeyDown` key filter. Fixed: `_playerCallsign = _sanitizeCallsign(val)` and the localStorage write uses the sanitized value.

- **`startGame()` sanitizes the localStorage/input fallback callsign (index.html):** The fallback path that reads `menu-callsign` or `localStorage.getItem('tw_callsign')` now wraps the result in `_sanitizeCallsign()` before assigning to `_playerCallsign`.

- **`startMultiplayer()` sanitizes the localStorage/input fallback callsign (index.html):** Same fix applied to the PVP entry path.

### Area 3 — External Data Rendering

- **Added `_escapeHtml(str)` helper (index.html):** Escapes `&`, `<`, `>`, `"`, and `'` for safe use in `innerHTML` contexts. Available for future use wherever fetched strings must be injected as HTML.

- **`_renderScores()` rewritten to use DOM construction instead of `innerHTML` for all fetched data (index.html):** The previous implementation built a template-literal string containing `e.name`, `e.chassis`, and numeric fields and injected it via `table.innerHTML = header + rows`. A malicious or corrupt Supabase record with HTML in the `name` field would have been executed as markup. Fixed: each row is now built with `document.createElement('div')` / `document.createElement('span')` and all cell content is assigned via `span.textContent`, which the browser always treats as plain text. Numeric fields are coerced with `Number()` before display. String fields (`name`, `chassis`) pass through `_sanitizeCallsign()`. The static header row (no fetched data) retains `innerHTML` for its fixed template.

### Files Changed

- `index.html` — added `SCORE_MAX_ROUND`, `SCORE_MAX_KILLS`, `SCORE_MAX_DAMAGE` constants; added `_sanitizeCallsign()`, `_escapeHtml()`, `_validateScoreEntry()` helpers; updated `_capturePendingRun()`, `_insertScore()`, `proceedToMainMenu()`, `startGame()`, `startMultiplayer()`, `_renderScores()`; version bump to v3.7
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v3.7

---

## v3.6 — Save & Persistence Audit

**Date:** 2026-03-20 (Central Time)

Audited all save/load paths, corrupt-save handling, cloud vs local sync logic, and state-bleed between runs; fixed every asymmetry and bleed found.

### Area 1 — Save/Load Symmetry

- **`saveCampaignProgress()` (loot-system.js) missing timestamp field:** `tw_campaign_progress` was saved without a time marker, so `_loadCampaignData()` had no basis for choosing between an older cloud record and a newer local one. Fixed: added `savedAt: Date.now()` to the progress object. This field is now read in `_loadCampaignData()` for cloud vs local comparison (see Area 3).

### Area 2 — Corrupt Save Handling

- **Equipped-item validation only checked `name`, not `rarity`/`baseType`:** `loadCampaignInventory()` and `_restoreFromCloudData()` both filtered inventory items by `name && rarity && baseType` but validated equipped-slot objects only by `name`. A saved equipped item with a `name` but corrupt or missing `rarity`/`baseType` fields would pass into `_equipped` and could cause `recalcGearStats()` errors or silent stat miscalculations. Fixed: both load paths now require `name && rarity && baseType` before accepting an equipped item — matching the existing inventory filter in both functions.

### Area 3 — Cloud vs Local Sync

- **`_loadCampaignData()` always preferred cloud over local with no timestamp check:** If a cloud save succeeded at time T but the player then played more missions (saving locally at T+N) before the cloud sync timer fired, a page reload would restore the older cloud record and silently roll back T+N of progress. Fixed: `_loadCampaignData()` now reads `localSavedAt` from the local progress before hitting the network, compares it against `cloudData.updated_at`, and only restores from cloud when `cloudTs >= localSavedAt`. When local is newer (e.g. cloud sync failed), the localStorage path is used instead, preserving the player's most recent state.

### Area 4 — State Bleed Between Runs

- **`goToMainMenu()` did not reset inventory for simulation mode:** If a player deployed a simulation run (accumulating inventory drops, scrap, and gear state), then quit directly to main menu via pause or death screen (bypassing `returnToHangar()`), `_inventory`, `_equipped`, `_scrap`, and `_gearState` were left intact. The next simulation deploy would start with the previous run's gear already in `_equipped`, causing incorrect `recalcGearStats()` values at `deployMech()`. Fixed: `goToMainMenu()` now calls `resetInventory()` when `_gameMode !== 'campaign'`, clearing all four state variables and equipping fresh starter gear before the player can deploy again.

- **`confirmNewCampaign()` did not reset `_campaignState.chassis`:** Starting a new campaign via the menu wiped `playerLevel`, `playerXP`, `completedMissions`, `skillsChosen`, `claimedRewards`, and `loadoutSlots` but left `_campaignState.chassis` set to the previous campaign's locked chassis. The subsequent chassis selection screen would immediately re-lock to the old value in `_loadCampaignData()` because `if (_campaignState.chassis) loadout.chassis = _campaignState.chassis` runs after every load. Fixed: added `_campaignState.chassis = null` to the reset block in `confirmNewCampaign()`.

- **`respawnMech()` duplicated the stat-counter reset line:** `_shotsFired = 0; _shotsHit = 0; _damageDealt = 0; _damageTaken = 0; _perksEarned = 0;` appeared twice in sequence (lines 11901 and 11904 in the original file), with only `_roundClearing = false` and the extraction reset between them. The duplicate was dead code but masked a subtle ordering question. Removed the second copy; the single reset at line 11901 is authoritative.

### Files Changed

- `js/loot-system.js` — `saveCampaignProgress()` (added `savedAt` field); `loadCampaignInventory()` (equipped item validation requires `rarity && baseType`)
- `index.html` — `_restoreFromCloudData()` (equipped item validation requires `rarity && baseType`); `_loadCampaignData()` (timestamp comparison before restoring cloud); `goToMainMenu()` (call `resetInventory()` for simulation mode); `confirmNewCampaign()` (reset `_campaignState.chassis = null`); `respawnMech()` (removed duplicate stat reset line)
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v3.6

---

## v3.5 — Performance & Memory Audit

**Date:** 2026-03-20

Eliminated per-frame heap allocations in the enemy AI hot loop, stopped orphaned `repeat:-1` tweens on projectiles and boss labels, and destroyed all leaked physics overlap colliders across player and enemy weapon fire paths.

### Area 1 — Object Creation in `update()` Hot Loops

- **`handleEnemyAI`: `_coneCovers` filter allocated per enemy per frame:** `.filter()` on cover objects ran inside `enemies.forEach()`, allocating a new array for every enemy every frame. Fixed: a single `_activeCoverCache` is computed once before the loop and shared across all enemies.

- **`handleEnemyAI`: `_rayPoints = []` allocated per enemy per frame:** The 19-element vision-cone ray-point array was re-created each frame per enemy. Fixed: added module-level `_CONE_RAY_POINTS` pool (19 pre-allocated `{x,y}` objects) and replaced `.push({x,y})` with index-based in-place mutation (`_CONE_RAY_POINTS[_rayCount].x = ...`). Pool is frozen at 19 entries, matching the maximum cone resolution.

- **`handleEnemyAI`: `const _feelers = [0, -0.35, 0.35]` allocated per enemy per frame:** The obstacle-avoidance feeler offset array was declared inside the enemy loop. Fixed: hoisted to module-level `const _FEELER_OFFSETS = Object.freeze([0, -0.35, 0.35])`.

- **`handleEnemyAI`: `enemy._lastKnownPlayer = { x, y }` allocated each update:** Three sites reassigned the object each tick. Fixed: initial assignment creates the object once; subsequent updates mutate `.x`/`.y` in place.

- **`handleEnemyAI`: `enemy._lastPos = { x, y }` allocated each update:** Same pattern. Fixed: in-place mutation on all sites.

- **`handleEnemyAI`: `enemy._orbitRefPos = { x, y }` allocated on orbit reset:** Fixed: in-place mutation (`enemy._orbitRefPos.x = ...; enemy._orbitRefPos.y = ...`).

- **`_spawnSpectreClone` drift event (16 ms) and fire event (1000 ms): `.filter().sort()` for nearest-enemy search:** Two array allocations plus O(n log n) sort ran at 62.5 fps inside `driftEvent`. Fixed: replaced both with a single O(n) linear scan using local `nearest`/`_nearDist` variables — zero allocations per tick.

- **`activateDecoy` fire event (1200 ms): same `.filter().sort()` pattern:** Fixed with the same O(n) linear scan.

### Area 2 — Tween & Timer Leaks (`repeat: -1` Orphans)

- **`_addBossLabel` / all boss `_onDestroy` handlers:** The pulsing boss-label tween (`yoyo: true, repeat: -1`) was never stopped before its target was destroyed, leaving the tween alive in the TweenManager. Fixed: `_addBossLabel` stores the tween in `e._bossLabelTween`; every boss `_onDestroy` (Warden, Twin Razors eA/eB, Architect, Juggernaut, Mirror, Titan, Core) now calls `if (e._bossLabelTween) e._bossLabelTween.stop()` before `e.bossLabel.destroy()`.

- **`destroyEnemyWithCleanup`: medic label tween not stopped before destroy:** Added `scene.tweens.killTweensOf(e.medicLabel)` before `e.medicLabel.destroy()`.

- **`firePLSM` player plasma bolt:** The `repeat: -1` alpha-pulse tween was not linked to the projectile's lifetime. Fixed: stored as `plsmTween`; added `p.once('destroy', () => plsmTween.stop())`.

- **`fireSR` sniper round:** Same pattern. Fixed: stored as `srTween`; added `b.once('destroy', () => srTween.stop())`.

- **`fireSIEGE` cannonball:** Same pattern. Fixed: stored as `siegeBallTween`; added `ball.once('destroy', () => siegeBallTween.stop())`.

- **`enemyFire` PLSM:** Fixed: stored as `ePlsmTween`; added `p.once('destroy', () => ePlsmTween.stop())`.

- **`enemyFireSecondary` PLSM:** Fixed: stored as `secPlsmTween`; added `p.once('destroy', () => secPlsmTween.stop())`.

### Area 3 — Physics Overlap Collider Leaks

`scene.physics.add.overlap()` returns a `Collider` that persists in `scene.physics.world.colliders` until explicitly destroyed. None of the following were previously destroyed:

- **`createExplosion`:** Stored as `blastOverlap`; destroyed inside the tween `onComplete` alongside `blast.destroy()`.

- **`fireRL` player rocket:** Stored as `rlOverlap`; destroyed on enemy-hit callback and on `delayedCall(2000)` timeout path.

- **`fireSIEGE` cannonball:** Stored as `siegeOverlap`; destroyed on enemy-hit callback and on `delayedCall(3000)` timeout path.

- **`enemyFire` RL rocket:** Stored as `eRlOverlap`; destroyed on player-hit callback and on `delayedCall(2200)` timeout path.

- **`enemyFire` siege bullet:** Stored as `eSiegeOverlap`; destroyed on player-hit callback and on `delayedCall(2500)` timeout path. The `delayedCall` was also moved inside the `siege` branch so it no longer runs for non-siege weapons.

- **`enemyFireSecondary` RL rocket:** Stored as `secRlOverlap`; destroyed on player-hit callback and on `delayedCall(2200)` timeout path.

### Area 4 — Particle & Explosion Cleanup (verified, no changes needed)

- **`createImpactSparks`, `createShieldSparks`, `createShieldBreak`, `spawnDebris`:** All particles/shards are destroyed via tween `onComplete` — no orphans.
- **`fireRL` particle emitter:** `.stop()` then `delayedCall(400, destroy)` present in all code paths (hit callback and timeout).
- **Deploy dust emitter (`deployMech`):** Destroyed via `delayedCall(900)` — correct.

### Files Changed

- `index.html` — `handleEnemyAI()` (cover cache, ray-point pool, feeler constant, `_lastKnownPlayer`/`_lastPos`/`_orbitRefPos` in-place mutation), `_spawnSpectreClone()` (linear scan in drift + fire events), `activateDecoy()` (linear scan in fire event), `_addBossLabel()` (tween stored in `e._bossLabelTween`), all boss `_onDestroy` handlers (stop label tween), `destroyEnemyWithCleanup()` (kill medic label tween), `firePLSM()` / `fireSR()` / `fireSIEGE()` (stop tween on destroy), `enemyFire()` (PLSM tween, RL overlap, siege overlap), `enemyFireSecondary()` (PLSM tween, RL overlap), `createExplosion()` (blast overlap), `fireRL()` (rocket overlap)
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — version updated to v3.5

---

## v3.4 — Loot System Audit Fixes

**Date:** 2026-03-20

### Bug Fixes

- **`critDmg` gear stat had no gameplay effect:** `damageEnemy()` multiplied crit hits by a hardcoded `2` regardless of `_gearState.critDmg`. Fixed: crit multiplier is now `2 + (_gearState.critDmg / 100)`, so a `+15% Crit Damage` affix correctly raises crits from 2× to 2.15×.

- **`absorbPct` gear stat had no gameplay effect:** `player._shieldAbsorb` was set from `SHIELD_SYSTEMS[loadout.shld].absorb` at deploy time and never augmented by gear. Fixed: `_gearState.absorbPct / 100` is now added at deploy time (capped at 0.90), making items like `Absorb Matrix` and `Warden's Aegis` actually increase shield absorption.

- **`autoRepair` gear stat had no gameplay effect:** The core regen loop in `update()` read only `_perkState.autoRepair`; gear items with `autoRepair` base stats (e.g. `sys_repair` mod) contributed to `_gearState.autoRepair` but were never applied. Fixed: regen now uses `_perkState.autoRepair + _gearState.autoRepair` as the combined HP/sec rate.

- **`modEffPct` gear stat had no gameplay effect:** `_gearState.modEffPct` (from items like `Amplifier`, `Overcharge Module`, `Blueprint Core`) was accumulated and shown in the stat overlay but never applied to mod durations. Fixed: each mod activation function (`activateShield`, `activateRage`, `activateEMP`, `activateGhostStep`, `activateOverclockBurst`, `activateFortressMode`) now multiplies its duration constant by `1 + (_gearState.modEffPct / 100)`. Stacks multiplicatively with the `modAmplify` unique effect.

- **`pellets` gear affix had no gameplay effect:** `fireSG()` counted pellets as `weapon.pellets + _perkState.sgFlechette` only. SG weapon items can roll a `+{v} Pellets` affix that accumulated into `_gearState.pellets` but was never read. Fixed: `fireSG()` now includes `_gearState.pellets` in the total pellet count.

- **`splashRadius` gear affix had no gameplay effect:** GL/RL/PLSM/siege weapon items can roll a `+{v}% Blast Radius` affix that accumulated into `_gearState.splashRadius` but was never applied. Fixed: `fire()` now applies a `_gearSplashMult = 1 + (_gearState.splashRadius / 100)` multiplier to `weapon.radius` when building the `_wEff` object, so all player-fired explosive weapons use the gear-boosted radius.

- **`siege` and `chain` weapons in loot drop pool:** Both were in `WEAPON_LOOT_KEYS` and could drop as loot items. These are 2H weapons that require both arm slots to share the same key (`loadout.L === loadout.R`). The loot equip system sets one arm slot at a time via `_equipItemToSlot`, so equipping either weapon via loot would leave the loadout in an invalid half-2H state. Removed both from `WEAPON_LOOT_KEYS`.

- **`_unequipItem()` silently failed when inventory full:** Clicking UNEQUIP while the backpack was at capacity returned without any feedback, making it appear as if the button was broken. Fixed: a "INVENTORY FULL" floating warning is now shown via `_showFloatingWarning()`.

### Stubbed (Known Incomplete)

- **`echoStrike` unique effect (`Echo Frame`):** The `echo_frame` epic item (Mirror boss drop) registers its effect key in `_gearState._uniqueEffects`, but no gameplay proc exists yet. Added `triggerEchoStrike()` stub with TODO comment. Requires tracking last bullet type/angle per arm and spawning a ghost projectile on mod activation.

- **`mirrorShot` unique effect (`Mirror Shard`):** Same status. Added `checkMirrorShot()` stub. Requires bullet–wall collision detection and a reflective second projectile at the bounce angle.

### Files Changed

- `js/loot-system.js` — `WEAPON_LOOT_KEYS` (removed `siege`, `chain`); added `triggerEchoStrike()` stub, `checkMirrorShot()` stub
- `index.html` — `damageEnemy()` (critDmg), `deployMech()` (absorbPct), `update()` (autoRepair), `activateShield()` / `activateRage()` / `activateEMP()` / `activateGhostStep()` / `activateOverclockBurst()` / `activateFortressMode()` (modEffPct), `fireSG()` (pellets), `fire()` (splashRadius, _wEff), `_unequipItem()` (inventory full feedback)
- `CHANGELOG.md` — this entry
- `OVERVIEW.md` — loot system status updated

---

## v3.3 — Logic Audit Fixes

**Date:** 2026-03-20

### Bug Fixes

- **Missiles deal zero damage:** `activateMissiles()` called `damageEnemy(scene, target, mod.missileDmg)` — passed `scene` as the enemy argument. Fixed to `damageEnemy(target, mod.missileDmg, 0)`. Missiles now deal their full intended damage on impact.

- **Ghost Step cloak silently fails:** `activateGhostStep()` referenced `player.torso` and `player.visuals` — properties that do not exist on the physics rectangle. Fixed to use the global `torso` container. Player sprite now correctly fades to 15% alpha during Ghost Step and restores to full alpha on expiry.

- **Rage Duration perks have no effect:** `activateRage()` computed `_rageDur` without reading `_perkState.rageDurMult`, so `berserker_fuel` (+50% duration/stack) and `rage_extend` perks were inert. Fixed to multiply `_rageDur` by `(_perkState.rageDurMult || 1)`.

- **Jump cooldown perks have no effect:** The `effectiveModCooldown` calculation applied `CHASSIS.medium.modCooldownMult` and gear `modCdPct` but never applied `_perkState.jumpCdMult` (from `ghost_step` perk: −40%/stack) or `_perkState.jumpCooldownMult` (from `jump_cooldown`/`al_cooldown` perks: −20%/stack). Added both multipliers when `loadout.mod === 'jump'`.

- **Fortress Mode `fm_heal` perk has no effect:** The 200ms heal ticker hardcoded `+ 1` HP regardless of `_perkState.fmHeal`. Fixed to `Math.round(1 * (1 + (_perkState.fmHeal || 0)))` so each `fm_heal` stack (+50%) correctly scales the heal rate.

- **`fth_wide_cone` perk only partially applies:** The perk applied `fthRange` (+20% range) but never set `fthCone`, the variable `fireFTH()` reads for cone spread width. Added `_perkState.fthCone += 0.30` to the perk's apply function so the advertised "+30% flame spread" now takes effect.

- **`dmgMult` double-applied to all bullet/FTH/RAIL/drone/spectre damage:** `damageEnemy()` applies `_perkState.dmgMult` at the canonical location (line ~10208). `fire()`, `fireFTH()`, `fireRAIL()`, `_spawnDrone()`, and `_spawnSpectreClone()` each also multiplied by `_perkState.dmgMult` before calling `damageEnemy`, causing all damage perks to deal roughly the square of their intended bonus. Removed `* (_perkState.dmgMult || 1)` from all five caller sites; `damageEnemy()` remains the single authoritative application point.

### Files Changed

- `index.html` — `activateMissiles()`, `activateGhostStep()`, `activateRage()`, `activateFortressMode()`, `handlePlayerFiring()` (effectiveModCooldown), `fireFTH()`, `fireRAIL()`, `fire()`, `_spawnDrone()`, `_spawnSpectreClone()`; perk definition `fth_wide_cone` in `_perks{}`
- `CHANGELOG.md` — this entry

---

## v3.2 — Structural Audit Fixes

**Date:** 2026-03-20

### Bug Fixes

- **Duplicate Kill Streak activation:** `onEnemyKilled()` contained two identical Kill Streak activation blocks that both fired on the activating kill, causing `_perkState.dmgMult` to be multiplied by the streak bonus twice and `_killStreakCount` to be incremented twice. Removed the first (duplicate) block; the surviving block fires after adrenaline and medium-cooldown logic as intended.

### Refactoring

- **`destroyEnemyWithCleanup(scene, e)`:** Extracted the enemy visual/physics teardown sequence (destroy `visuals`, `torso`, `cmdLabel`, `medicLabel`, `medicCross`, `shieldRing`, `_visionConeGfx`, `_splitLabel`, call `_onDestroy`) into a shared helper. Replaced three identical copy-pasted loops in `update()`, `onEnemyKilled()`, and the swarm kill path of `damageEnemy()`.

- **`resetRoundPerks()`:** Extracted 36 lines of per-round `_perkState` reset logic from the top of `startRound()` into its own named function. `startRound()` now calls `resetRoundPerks()` as its first action.

- **`handleObjectiveRoundEnd(scene)`:** Extracted the objective-based mid-round end sequence from `update()` into a named function. `update()` now calls it as a single line instead of embedding the enemy cleanup and extraction trigger inline.

- **`handleBulletEnemyOverlap(scene, bullet, enemy)`:** Extracted the ~120-line anonymous bullet/enemy overlap callback registered in `create()` into a named top-level function. `create()` now registers a thin arrow wrapper: `(b, e) => handleBulletEnemyOverlap(this, b, e)`. Removed always-false `wKey === 'sr'` condition (wKey was never in scope inside the anonymous callback). Local variables renamed to drop the incorrect underscore prefix (`_bAngle` → `bAngle`, `_bPierce` → `bulletShieldPierce`, `_bx2` → `bx`, etc.).

- **`selectPerks()`:** Extracted perk pool selection, legendary eligibility check, and slot label/color generation out of `showPerkMenu()` into `selectPerks()`. `showPerkMenu()` now calls `selectPerks()` and handles only DOM rendering. Removed local `const _legendaryKeys`, `const _eligibleLeg`, `const _offerLegendary` — all renamed without underscore prefix as locals.

- **`SLOT_ID_MAP`:** Added a shared `const SLOT_ID_MAP = { L, R, M:'mod', A:'aug', G:'leg', S:'shld' }` constant in the Garage section with inline documentation distinguishing it from `_equipped` keys (loot-system.js). `buildDD()` now uses `loadout[SLOT_ID_MAP[slotId]]` for the current-slot highlight. `selectSlot()` non-arm branch replaced with `loadout[SLOT_ID_MAP[slotId]] = key`. `toggleDD()` options dispatch replaced with a `DD_OPTIONS` lookup object.

- **`window._spectreClones` / `window._lastKillTime`:** Both moved from ad-hoc `window.` assignments to proper `let` declarations at module scope (`let _spectreClones = []`, `let _lastKillTime = 0`). All references in `_spawnSpectreClone()` and `onEnemyKilled()` updated to drop the `window.` prefix.

- **Local variable naming in `startRound()`:** `const _isCampaignMode`, `const _campaignMission`, `const _campaignEnemy`, `const _spawnCfg`, `let _elitesApplied` renamed to drop the underscore prefix (reserved for module-level private globals, not local variables). All downstream references within the function updated.

- **Local variable naming in `deployMech()`:** `const _deployScene`, `const _hitR`, `const _hitOff` renamed to `deployScene`, `hitR`, `hitOff`.

- **`_equipped.shield` / `loadout.shld` disambiguation comment:** Added inline comment at the `recalcGearStats()` call site in `deployMech()` explaining that `recalcGearStats()` reads `_equipped.shield` (loot gear, `loot-system.js`) while the loadout uses `loadout.shld`.

### Files Changed

- `index.html` — `onEnemyKilled()`, `_spawnSpectreClone()`, `create()`, `update()`, `startRound()`, `deployMech()`, `showPerkMenu()`, `buildDD()`, `toggleDD()`, `selectSlot()`, plus new functions: `destroyEnemyWithCleanup()`, `resetRoundPerks()`, `handleObjectiveRoundEnd()`, `handleBulletEnemyOverlap()`, `selectPerks()`
- `CHANGELOG.md` — this entry

---

## v3.1 — Fix Game Logic Bugs

**Date:** 2026-03-20

### Bug Fixes

- **Kill Streak double-reset:** `dmgMult` was divided twice in `processPlayerDamage` when the player took damage, causing damage to drop far below intended values.
- **Glass Step double-check:** Was checked twice (before and after `isProcessingDamage` flag set), with the first check leaving the damage lock in an inconsistent state.
- **Scrap Shield perk value consumed:** The raw `scrapShield` perk value was subtracted from directly on each hit, depleting the template so future limb destructions added less absorb buffer than intended.
- **Resonance double-application:** Shield charge per hit was applied twice in `damageEnemy` (at two separate locations), giving 2x the intended shield-per-hit.
- **Duplicate Enemy Scrap Cannon:** Identical code block executed twice per enemy limb destruction; second block was dead code due to the flag already being set.
- **Salvage Protocol double loot:** Two separate loot drops triggered per limb destruction instead of one.
- **Deep Scan perk had no effect:** `analyzerDepth` was set by the perk but never read in the Threat Analyzer damage logic. Now correctly applies 25% resistance reduction (vs 15% base).
- **Auto-repair framerate-dependent:** Used hardcoded `0.016` instead of `game.loop.delta / 1000`, causing incorrect heal rates at frame rates other than 60fps.
- **Heavy chassis DR not rounded:** Added `Math.round` for consistency with all other DR calculations.

### Files Changed

- `index.html` — `processPlayerDamage()`, `damageEnemy()`, `handleShieldRegen()`

## v3.0 — GLOBAL_INVENTORY.md Complete

**Date:** 2026-03-20

`GLOBAL_INVENTORY.md` is now fully documented with all four sections: Section 1 (130 top-level variables from `index.html` with types and purposes), Section 2 (ownership assignments for all 130 variables to their destination files in the planned refactor), Section 3 (naming collision analysis — 0 cross-file collisions, 4 near-miss pairs, 14 generic-name risks with suggested renames), and Section 4 (8 explicit `window.*` globals across the codebase, all assigned to `state.js` post-refactor, with cross-file read tracking and a confirmed-empty unmatched-reads table). This document serves as the authoritative reference for the upcoming `index.html` file split.

### Files Changed

- `GLOBAL_INVENTORY.md` — Sections 1–4 complete
