# Changelog

All notable changes to Tech Warrior Online are documented here.
Each session that changes code gets a version bump.

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

## v6.03 — Rebuild supply shop with slot grids

**Date:** 2026-03-24

Replaced the row-based buy and sell lists in the campaign supply shop with fixed slot grids (6×5 buy, 4×5 sell) using the same `.lo-slot` cards as the loadout backpack. Added hover cards with equipped-item comparison to both grids via reused `_buildHoverHtml`, increased `SHOP_MAX_ITEMS` from 8 to 30, and removed all old row/card CSS.

---

## v6.02 — Fix supply shop hover card transparency (z-index below overlay)

**Date:** 2026-03-23

Shop hover card was rendered behind `#shop-overlay` (z-index 9999 < 10004), making it appear transparent; fixed by setting `card.style.zIndex = '10005'` in `_shopShowHover`.

---

## v6.01 — Supply shop hover cards; fix weapon slot label; inline buy button

**Date:** 2026-03-23

Fixed supply shop weapon slot label from `L ARM / R ARM` to `WEAPON`. Replaced the click-to-view detail panel for buy items with the same hover card system used in the loadout screen: `mouseenter` on any buy or sell row now shows a `_buildHoverHtml`-powered card (single card for sell items; comparison card showing `SHOP` vs `EQUIPPED` for buy items with an equipped counterpart). Added optional `leftLabel` param to `_buildHoverHtml` (default `'BACKPACK'`) so the shop comparison card shows `SHOP` instead. Moved the buy button inline into each buy row so purchasing works without the now-disabled click detail panel; sell confirmation panel (`_shopSelectSell`) is unchanged.

---
