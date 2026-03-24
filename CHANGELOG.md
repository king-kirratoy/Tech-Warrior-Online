# Changelog

All notable changes to Tech Warrior Online are documented here.
Each session that changes code gets a version bump.

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

## v6.00 — Runtime weapon name lookup at all render sites

**Date:** 2026-03-23

Fixed all UI render sites to look up `WEAPON_NAMES[item.subType]` at render time instead of relying on the stored `item.name`/`item.shortName`, which may have been generated before the canonical name fix. Updated: equipped doll slot cards, backpack slot cards, single item hover card, comparison hover card (both columns), and all three campaign supply shop item name locations (`_itemStatCard`, buy row, sell row).

---

## v5.99 — Canonical WEAPON_NAMES map; fix multiplayer weapon name display

**Date:** 2026-03-23

Added `WEAPON_NAMES` constant to `constants.js` as the single canonical source for all 13 weapon display names plus `none`. Fixed `multiplayer.js` `weaponName()` which was returning abbreviated `SLOT_DESCS` titles (e.g. "SMG — SUBMACHINE GUN") — it now uses `WEAPON_NAMES`. Updated the multiplayer lobby summary, weapon bar (`menus.js`), hangar stats panel (`garage.js`), and loot item generation (`loot-system.js`) to all use `WEAPON_NAMES[key]` with fallback to `WEAPONS[key].name`.

---
