# Button Audit — Tech Warrior Online

**Date:** 2026-03-22
**Scope:** Buttons and interactive elements NOT using the `.tw-btn` system
**Files scanned:** `index.html`, `js/menus.js`, `js/campaign-system.js`

A button is flagged when it meets one or more of these conditions:
- `<button>` element without the `tw-btn` class
- Inline `style="..."` that overrides **colors**, **borders**, or **font** on a button (layout-only overrides such as `width`, `margin`, `position`, `flex`, `display`, `gap` are **not** flagged)
- Legacy class (`.menu-start-btn`, `.pause-menu-btn`, `.loadout-tab`, `.arm-picker-btn`) used **without** `tw-btn` also present
- Clickable `<div>` or `<span>` with hardcoded appearance styles acting as a button

---

## 1. index.html

### Finding 1 — `#loadout-tab-stats`

| Field | Value |
|---|---|
| **File / Line** | `index.html` ~428 |
| **Element** | `<button id="loadout-tab-stats" onclick="_switchLoadoutTab('stats')" class="loadout-tab active">` |
| **Issue** | No `tw-btn` base class. Uses only `loadout-tab active`. Appearance is fully driven by the `.loadout-tab` legacy rule in `menus.css`. |
| **Recommended fix** | Add `tw-btn tw-btn--sm` as the base classes; keep `loadout-tab` as a layout/state modifier; move active-state color changes to a CSS override (`.tw-btn.loadout-tab.active`) rather than a standalone rule. |

---

### Finding 2 — `#loadout-tab-gear`

| Field | Value |
|---|---|
| **File / Line** | `index.html` ~429 |
| **Element** | `<button id="loadout-tab-gear" onclick="_switchLoadoutTab('gear')" class="loadout-tab">` |
| **Issue** | No `tw-btn` base class. Uses only `loadout-tab`. Same situation as `#loadout-tab-stats`. |
| **Recommended fix** | Add `tw-btn tw-btn--sm loadout-tab` as the class string; remove standalone `loadout-tab` appearance rules that duplicate button chrome. |

---

**index.html section complete — 2 non-compliant buttons found.**

---

## 2. js/menus.js

### Finding 3 — Chassis selector cards (`_renderChassisSelect`)

| Field | Value |
|---|---|
| **File / Line** | `js/menus.js` ~783 |
| **Element** | `<button onclick="_highlightChassis('${ch}')" class="tw-btn" style="background:${bgColor};border:1px solid ${borderColor};border-radius:6px;border-top:3px solid ${info.color};flex:1;padding:24px 16px;text-align:center;${shadowStyle}">` |
| **Issue** | Has `tw-btn` base class BUT inline `style` overrides `background`, `border` (color + width), and `border-top` (color + width). Padding is also overriding the `--btn-padding` token. Fully defeats the design system. |
| **Recommended fix** | Add a `.chassis-card` CSS class in `menus.css` that handles the card layout (larger padding, flex, text-left). Drive the selected/locked color state via a CSS custom property (`--chassis-card-color`) set as a JS inline style (`style="--chassis-card-color:${info.color};"`) and reference it inside `.chassis-card` rules. Remove all color/border inline overrides. |

---

### Finding 4 — Arm picker L/R buttons (`_showArmPicker`)

| Field | Value |
|---|---|
| **File / Line** | `js/menus.js` ~1167–1168 |
| **Element** | `<button class="arm-picker-btn" id="_arm-pick-L">` and `<button class="arm-picker-btn" id="_arm-pick-R">` |
| **Issue** | No `tw-btn` base class. Both buttons rely entirely on `.arm-picker-btn` in `menus.css` for all appearance. |
| **Recommended fix** | Change both to `class="tw-btn tw-btn--sm arm-picker-btn"`. Reduce `.arm-picker-btn` in `menus.css` to layout-only overrides (width, min-height, etc.). |

---

### Finding 5 — Arm picker Cancel button (`_showArmPicker`)

| Field | Value |
|---|---|
| **File / Line** | `js/menus.js` ~1171 |
| **Element** | `<button class="arm-picker-btn" id="_arm-pick-cancel" style="color:${UI_COLORS.text50};border-color:${UI_COLORS.text25};">CANCEL</button>` |
| **Issue** | No `tw-btn` base class. Additionally has inline `color` and `border-color` overrides that hardcode appearance values. |
| **Recommended fix** | Change to `class="tw-btn tw-btn--sm arm-picker-btn arm-picker-btn--cancel"` and remove inline `color`/`border-color`; encode the muted cancel appearance in a `.arm-picker-btn--cancel` CSS modifier rule. |

---

### Finding 6 — Item detail action buttons (`_showItemDetail`) — inline `style` on a `tw-btn` with border-color

> **Note:** Lines 978–982 produce buttons with classes `tw-btn tw-btn--green tw-btn--sm`, `tw-btn tw-btn--danger tw-btn--sm`, and `tw-btn tw-btn--gold tw-btn--sm`. No inline color/border overrides are present. **These are compliant** and are recorded here only to document that they were reviewed. No action needed.

---

**js/menus.js section complete — 3 non-compliant buttons found (Findings 3–5).**

---

## 3. js/campaign-system.js

### Finding 7 — Chapter tab buttons (`showMissionSelect`)

| Field | Value |
|---|---|
| **File / Line** | `js/campaign-system.js` ~787 |
| **Element** | `<button onclick="..." class="tw-btn" style="flex:1;${cls}...">` where `cls` injects `background`, `color`, and `border-color` based on active/unlocked/locked state |
| **Issue** | Has `tw-btn` base class but `cls` string overrides `background`, `color` (text color), and `border-color` inline. This fully overrides the design-system colors for all three states (active, unlocked, locked). |
| **Recommended fix** | Add a `.chapter-tab` CSS modifier to `menus.css` with three state classes (`.chapter-tab--active`, `.chapter-tab--locked`). Set state classes via JS and remove the inline `cls` string. Keep only `style="flex:1;"` for layout. |

---

### Finding 8 — Mission card buttons (`showMissionSelect`)

| Field | Value |
|---|---|
| **File / Line** | `js/campaign-system.js` ~815 |
| **Element** | `<button onclick="_selectMission(${idx})" class="tw-btn" style="align-items:center;background:${bgBase};border:1px solid ${bdBase};border-left:3px solid ${blBase};border-radius:4px;display:flex;...;${shadowStyle}">` |
| **Issue** | Has `tw-btn` base class but inline `background`, `border`, `border-left` colors (all rarity/state-driven) fully replace the design-system appearance. `display:flex`, `text-align:left`, and `padding` also override button defaults. |
| **Recommended fix** | Create a `.mission-card` CSS class in `menus.css` that handles the card layout (flex, larger padding, text-left, border-radius). Drive selected/completed color state via CSS custom property (`--mission-accent`) or state classes (`.mission-card--selected`, `.mission-card--completed`) and remove all inline color/border overrides. |

---

### Finding 9 — Shop item card buttons (`_renderShop`)

| Field | Value |
|---|---|
| **File / Line** | `js/campaign-system.js` ~1449 |
| **Element** | `<button onclick="_shopSelect(${idx})" class="tw-btn" style="background:${bgBase};border:1px solid ${bdBase};border-left:3px solid ${rc};border-radius:4px;padding:10px;text-align:left;width:155px;${shadowStyle}">` |
| **Issue** | Has `tw-btn` but inline `background`, `border`, and `border-left` color overrides replace design-system chrome. `padding`, `text-align`, and `width` also override button defaults. |
| **Recommended fix** | Create a `.shop-item-card` CSS class; drive the rarity accent color via `--item-color` CSS custom property (`style="--item-color:${rc};"`) and reference it in `.shop-item-card` CSS rules. Remove color/border inline overrides. |

---

### Finding 10 — Shop sell card buttons (`_renderShop`)

| Field | Value |
|---|---|
| **File / Line** | `js/campaign-system.js` ~1526 |
| **Element** | `<button onclick="_shopSell(${idx})" class="tw-btn" style="background:${UI_COLORS.surface03};border:1px solid ${rc}30;border-left:2px solid ${rc};border-radius:4px;padding:8px;text-align:left;width:145px;">` |
| **Issue** | Has `tw-btn` but inline `background`, `border`, and `border-left` color overrides replace design-system chrome. Same pattern as shop item cards. |
| **Recommended fix** | Same approach as shop item cards — use a `.shop-sell-card` CSS class with a `--item-color` custom property and remove inline color/border overrides. |

---

**js/campaign-system.js section complete — 4 non-compliant buttons found (Findings 7–10).**

---

## Summary

| File | Non-compliant buttons | Finding numbers |
|---|---|---|
| `index.html` | 2 | 1, 2 |
| `js/menus.js` | 3 | 3, 4, 5 |
| `js/campaign-system.js` | 4 | 7, 8, 9, 10 |
| **Total** | **9** | |

### Violation categories

| Category | Count |
|---|---|
| Missing `tw-btn` entirely (legacy class only) | 4 (Findings 1, 2, 4, 5) |
| Has `tw-btn` but inline style overrides colors/borders | 5 (Findings 3, 7, 8, 9, 10) |

### Highest-priority fixes

1. **Findings 4 & 5** — arm-picker buttons in `_showArmPicker`: simple class change, no new CSS needed.
2. **Finding 1 & 2** — loadout tab buttons in `index.html`: class change + small CSS override.
3. **Findings 7–10** — card-style buttons in campaign system and chassis select: require new CSS modifier classes before inline color overrides can be removed.
