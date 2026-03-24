# Changelog

All notable changes to Tech Warrior Online are documented here.
Each session that changes code gets a version bump.

---

## v6.16 — BUILD STATS slot detail rows

**Date:** 2026-03-24

Enriched the BUILD STATS panel on both the warzone and multiplayer hangar screens so every equipped item shows its full stats, not just its name. Added `_buildSlotDetails()` helper in `js/garage.js` that returns detail lines per slot type: weapons show DPS, damage, reload, burst, and flags (explosive/pierce/etc.); shields show HP, absorb %, regen rate, delay, and description; CPU/mods show cooldown and description; augments and legs show their description. Both screens now render these detail rows beneath each slot header row using the existing `.hg-stat-row` pattern. Multiplayer calls the helper via a `typeof` guard since it's defined in a separate file. Updated GAME_VERSION to v6.16.

---

## v6.15 — Hangar UI polish: reorder, preview, deploy validation

**Date:** 2026-03-24

Unified the warzone and multiplayer hangar screens with identical layout and behavior. Renamed "Core Mod" dropdown label to "Cpu" and stats row "MOD" to "CPU" on both screens. Reordered dropdowns to: CPU, Augment, L.Arm, R.Arm, Legs, Shield. Moved the mech preview image to the top of the left column above the chassis selection buttons. Rebuilt the BUILD STATS panel order to: CHASSIS name, CHASSIS PERKS, HP SPLIT, TOTAL HP, TOTAL SHIELD, then slot rows matching dropdown order. Removed the PASSIVES row. Fixed empty weapon slots displaying "None" instead of "NONE" on the multiplayer screen. Added deploy/join button validation — disabled with a red warning when no weapons are equipped. Updated GAME_VERSION to v6.15.

---

## v6.14 — Warzone hangar mp-dd class system unification

**Date:** 2026-03-24

Rebuilt the warzone hangar screen to use the same `mp-*` / `pvp-dd-*` CSS class system as the multiplayer hangar. Previously the warzone screen used `.dd-*` classes from `garage.css` and `.hg-*` container classes, which are for the legacy pre-deploy screen only. Converted `refreshGarage()` from a partial-update function into a full dynamic renderer (like PVP's `_pvpRenderHangar()`), outputting identical structure: `.mp-top`, `.mp-body`, `.mp-left`/`.mp-right`, `.mp-left-controls`, `.mp-preview-zone`, `.mp-preview-box`. Replaced `toggleDD()`/`buildDD()`/`closeAllDD()`/`buildColorDD()` with warzone-specific equivalents (`_wzToggleDD`, `_wzBuildDropdown`, `_wzCloseAllDD`, `_wzBuildColorDD`) using `.wz-dd-selected`/`.wz-dd-list` selectors scoped to `#garage-menu`. Added `.wz-dd-list` CSS rule alongside `.pvp-dd-list` in `menus.css`. Empty slot text now displays "NONE" (uppercase) matching the multiplayer screen. Stats panel always shows MOD/SHIELD/LEGS/AUGMENT rows regardless of whether a slot is equipped.

---

## v6.13 — Warzone/multiplayer hangar dropdown parity

**Date:** 2026-03-24

Added the full set of loadout dropdowns (L Arm, R Arm, Core Mod, Shield, Legs, Augment) to the warzone hangar screen, matching the multiplayer hangar. Previously warzone only had a Colour dropdown while multiplayer had all slots. On both screens, moved the Colour dropdown above L Arm and placed a new "LOADOUT" section label above it (replacing the old "Weapons & Gear" label on multiplayer). Updated `refreshGarage()` to sync all dropdown headers and lock the R arm row when a two-handed weapon is equipped.

---

## v6.12 — Strip rarity prefix from generated item names

**Date:** 2026-03-24

Removed the rarity label prefix (e.g. "Epic", "Legendary") from generated item names in `generateItem()`. The rarity word was being prepended to `item.name` for non-common items, producing names like "Epic Threat Analyzer" even though rarity is already shown separately in hover cards and slot UI. Newly generated items now use the base name only (e.g. "Threat Analyzer") with rarity stored in the `item.rarity` field. Items already saved in player inventory or campaign saves may still have the old rarity-prefixed names since they were generated before this fix; no migration of saved data is needed.

---

## v6.11 — Fix shift-arm hover card comparison not updating live

**Date:** 2026-03-24

Fixed Shift-key weapon arm switching in hover cards not working because the hover card was built once on mouseenter and never rebuilt when Shift state changed. Both `_showSlotHover` (loadout) and `_shopShowHover` (shop) now track the currently hovered element/item and re-invoke themselves on Shift keydown/keyup, so pressing or releasing Shift while hovering a weapon item immediately rebuilds the comparison card against the other arm.

---

## v6.10 — Doll slot star fix, double-click equip, shift-arm hover comparison

**Date:** 2026-03-24

Fixed unique item gold star (★) on equipped doll slots to use the same absolutely-positioned `.lo-slot-star` element as backpack slots instead of rendering inline with the item name. Added double-click to equip from the loadout backpack grid — weapons equip to L arm by default or R arm with Shift held, non-weapons route to their natural slot. Added Shift-key arm switching for weapon hover card comparison in both the loadout backpack and supply shop buy grid, reading a new `_shiftHeld` global tracked via keydown/keyup listeners.

---

## v6.09 — Fix shop divider overflow and sell hover comparison

**Date:** 2026-03-24

Fixed vertical divider lines (.shop-cat-sep and .shop-buy-col border-right) running off the bottom of the viewport by removing flex: 1 and height: 100% from .shop-body so it sizes to its grid content instead of stretching to fill the screen; the border-bottom is now visible at the natural content boundary. Fixed sell grid hover cards incorrectly showing a two-column equipped-item comparison by adding a noCompare flag to _shopShowHover, passed from sellSlot, so sell items display a single-card hover only.

---

## v6.08 — Supply shop layout adjustments

**Date:** 2026-03-24

Moved the Restock button and scrap count from the buy column into the top header bar, grouped to the far right alongside the Back button and title. Removed the restock button from the Buy column header so both Buy and Sell headers now align at the same height. Added a "BACKPACK" category header with separator line above the sell slot grid, matching the buy-side category header style. Added a bottom border to `.shop-body` to visually close the grid area without changing the full-screen flex layout.

---

## v6.07 — Doc consolidation: UI_CONVENTIONS.md as single source of truth

**Date:** 2026-03-24

Documentation-only session. Made UI_CONVENTIONS.md the single authoritative source for all UI rules (design tokens, font rules, color meanings, rarity colors, inverted stats, slot label naming, loadout screen architecture, hover card system). Removed duplicate content from CLAUDE.md and OVERVIEW.md, replacing it with one-line references to the relevant UI_CONVENTIONS.md sections. Updated CLAUDE.md session-start rule #3 wording.

---
