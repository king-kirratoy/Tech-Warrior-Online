# Changelog

All notable changes to Tech Warrior Online are documented here.
Each session that changes code gets a version bump.

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

## v5.98 — Full weapon display names; revert slot name font size

**Date:** 2026-03-23

Reverted `.lo-slot-name` font-size from 11px back to 9px. Updated all 13 `WEAPONS[key].name` values in `constants.js` to full spelled-out names (`Submachine Gun`, `Machine Gun`, `Shotgun`, `Battle Rifle`, `Heavy Rifle`, `Flamethrower`, `Sniper Rifle`, `Grenade Launcher`, `Rocket Launcher`, `Plasma Cannon`, `Railgun`, `Siege Cannon`, `Chain Gun`); since `loot-system.js`, the weapon bar, and the hangar stats panel all derive display names from `WEAPONS[key].name`, the change propagates everywhere automatically — garage dropdown labels were already full names and are unchanged.

---

## v5.97 — Fix double borders on center column

**Date:** 2026-03-23

Removed redundant `border-left` and `border-bottom` from `.lo-center-frame`; the single dividing line between columns is now provided solely by `.lo-left`'s `border-right`, and the bottom edge by `.lo-weapon-bar`'s existing `border-bottom`.

---

## v5.96 — Hover card style refresh

**Date:** 2026-03-23

Updated single item hover cards to use `var(--sci-cyan)` for base stat values and added a `.lo-hover-divider` separator line between the base stats block and affixes block. Rebuilt the comparison hover card as a unified single bordered card (`.lo-hover-cmp-card`) using a CSS grid two-column layout with `BACKPACK` / `EQUIPPED` source labels, per-column stat/affix dividers, and a shared "Changes if equipped" diff section below; sign inversion for Reload Speed % and Mod Cooldown % applies in both columns and the diff. Viewport overflow detection is unchanged and already uses measured card width, so the wider comparison card stays on screen correctly.

---
