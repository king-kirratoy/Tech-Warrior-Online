# Changelog

All notable changes to Tech Warrior Online are documented here.
Each session that changes code gets a version bump.

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

## v6.06 — OVERVIEW.md accuracy audit

**Date:** 2026-03-24

Documentation-only session. Audited OVERVIEW.md for staleness against CHANGELOG.md and actual code. Fixed: added `WEAPON_NAMES` to `js/constants.js` File Map entry, updated `js/campaign-system.js` entry with new shop functions (`_shopGetCategory`, `_shopSortCategories`, `_shopRenderCategory`, `_shopGetHoverCard`, `_shopShowHover`, `_shopHideHover`), updated `_buildHoverHtml` signature to include `leftLabel` param, replaced stale hover card CSS classes (`.lo-hover-cmp-wrap`/`.lo-hover-cmp-cards`/`.lo-hover-cmp-label` → `.lo-hover-cmp-card`/`.lo-hover-cmp-cols`/`.lo-hover-cmp-left`) and added `.lo-hover-divider`.

---

## v6.05 — Shop three-column category buy grid

**Date:** 2026-03-24

Replaced the single 6×5 buy grid with three side-by-side category grids (Offensive / Defensive / Utility), each 3×5. Items are categorized by `baseType` via new `_shopGetCategory()`. Reduced `SHOP_MAX_ITEMS` from 30 to 12 — items distribute randomly across categories. Sold-back items appear immediately in the correct category grid with no special visual treatment. Added `_shopRenderCategory()` for targeted re-renders on sell.

---

## v6.04 — Fix shop hover cards not showing

**Date:** 2026-03-24

Fixed supply shop hover cards being invisible because `#eq-hover-card` was nested inside `#stats-overlay` (hidden when shop is open); created a dedicated `#shop-hover-card` lazily appended to `document.body` so it renders above all overlays.

---
