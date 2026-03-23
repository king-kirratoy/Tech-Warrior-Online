# UI AUDIT — Loadout Screen Fix Visibility Analysis

**Date:** 2026-03-23
**Purpose:** Understand why repeated fix attempts are not producing visible results.

---

## Section 1 — Loadout Render Entry Points

### Entry Points That Open the Loadout Overlay

| # | Function | File | Line | Trigger | Calls |
|---|----------|------|------|---------|-------|
| 1 | `toggleStats()` | `js/menus.js` | 572 | HTML onclick, Escape key, pause menu "Loadout" button | `populateLoadout()` |
| 2 | `toggleInventory()` | `js/menus.js` | 607 | Equip prompt "OPEN INVENTORY" button | Wraps `toggleStats()` with `_isInventory=true` |
| 3 | `_openLoadoutFromMission()` | `js/campaign-system.js` | 855 | Campaign mission select "Loadout" button | Directly shows `#stats-overlay`, calls `populateLoadout()` |

### Keyboard Entry (js/events.js)

- **Escape key** (line 131): When `_isStats === true`, calls `toggleStats()` to close.

### Closing Paths

| Function | File | Line | Notes |
|----------|------|------|-------|
| `toggleStats()` | `js/menus.js` | 572 | Toggle off — hides overlay |
| `goToMainMenu()` | `js/menus.js` | 246 | Sets `display:none` directly |
| `respawnMech()` | `js/menus.js` | 288 | Sets `display:none` directly |
| `startRound()` | `js/menus.js` | 480 | Sets `display:none` directly |
| `togglePause()` | `js/menus.js` | 525 | Calls `toggleStats()` if overlay is open |

### Primary Render Function: `populateLoadout()`

- **File:** `js/menus.js`
- **Line:** 1790
- **Sub-functions called:**
  1. `_updateCampaignXPBar()` (campaign-system.js, line 719) — via typeof guard
  2. `_renderHullBars()` (js/menus.js, line 1443) — chassis name, totals, HP bars
  3. `_renderGearBonusesPanel()` (js/menus.js, line 1732) — gear stat bonuses
  4. `populateInventory()` (js/menus.js, line 840) — mech silhouette + 8 equip slots + 30-slot backpack
  5. `_renderActivePerksPanel()` (js/menus.js, line 1691) — simulation mode only
  6. `_renderWeaponBar()` (js/menus.js, line 1806) — weapon stats + chassis traits

### Orphaned Function: `populateStats()`

- **File:** `js/menus.js`, line 1779
- **Status:** EXISTS but is **NEVER CALLED** anywhere in the codebase
- **Sub-functions it calls (all orphaned from this path):**
  - `_updateCampaignXPBar()`
  - `_renderChassisPanel()` (line 1502)
  - `_renderWeaponPanel()` (line 1547)
  - `_renderMobilityPanel()` (line 1606)
  - `_renderRunStatsPanel()` (line 1676)
  - `_renderActivePerksPanel()`
  - `_renderGearBonusesPanel()`

### Critical Finding: `_renderMobilityPanel()` is orphaned

`_renderMobilityPanel()` (line 1606) renders Shield Regen, Dodge Chance, Dmg Reduction, Auto-Repair, Crit Chance, Mod Cooldown, and Speed. It writes to `document.getElementById('stat-mobility-info')`.

**However:**
- `populateLoadout()` does NOT call `_renderMobilityPanel()`
- The `#stat-mobility-info` div does NOT exist in index.html (it was removed per v5.76 changelog)
- Only the orphaned `populateStats()` calls it
- **Result:** The stat rows are never rendered even though the function still exists

---

## Section 2 — Left Column HTML

### HTML Structure (index.html lines 466–496)

The left column `<div class="lo-left">` contains these elements in order:

```html
<!-- 1. Chassis name row -->
<div id="lo-chassis-row" class="lo-chassis-row"></div>

<!-- 2. Totals: Total HP + Total Shield -->
<div id="lo-totals-block" class="lo-totals-block"></div>

<!-- 3. Visual divider -->
<div class="lo-divider"></div>

<!-- 4. HP bars: Core, L Arm, R Arm, Legs -->
<div id="lo-hull-info" class="lo-block"></div>

<!-- 5–6. Hidden old placeholders -->
<div id="stat-weapons-info" style="display:none;"></div>
<div id="stat-run-info" style="display:none;"></div>

<!-- 7. Gear Bonuses (hidden when no gear) -->
<div id="stat-gear-panel" class="lo-sec" style="display:none;">
  <div class="lo-sec-title">Gear Bonuses</div>
  <div id="stat-gear-info"></div>
</div>

<!-- 8. Active Perks (simulation only) -->
<div id="lo-perks-section" class="lo-sec">
  <div class="lo-sec-title">Active Perks</div>
  <div id="stat-perks-info"></div>
</div>
```

### What `_renderHullBars()` Produces (menus.js line 1443)

The function writes to THREE elements:

**1. `#lo-chassis-row` (line 1458–1459):**
```html
<span class="lo-chassis-lbl">Chassis</span>
<span class="lo-chassis-val">MEDIUM</span>
```

**2. `#lo-totals-block` (line 1498–1499):**
```html
<div class="lo-stat-row">
  <span class="lo-stat-label">Total HP</span>
  <span class="lo-stat-value" style="color:#00ff88">864 / 864</span>
</div>
<div class="lo-stat-row">
  <span class="lo-stat-label">Total Shield</span>
  <span class="lo-stat-value" style="color:#cc88ff">50 / 50</span>
</div>
```

**3. `#lo-hull-info` (line 1497):**
```html
<div class="lo-hp-row">
  <span class="lo-hp-part">Core</span>
  <div class="lo-hp-track"><div class="lo-hp-fill" style="width:100%;background:#00ff88"></div></div>
  <span class="lo-hp-val">272 / 272</span>
</div>
<!-- repeated for L.Arm, R.Arm, Legs -->
```

### Specific Checks

| Question | Answer |
|----------|--------|
| Does "HULL INTEGRITY" appear? | **NO** — string not found anywhere in codebase |
| Does "MECH STATS" appear? | **YES** — exists as a comment in `_renderMobilityPanel()` at line 1610, but that function is never called by `populateLoadout()` and its target div `#stat-mobility-info` doesn't exist in HTML. Not rendered. |
| Where does Chassis render? | Top of left column in `#lo-chassis-row` (above totals and HP bars) |
| Where do Total HP / Total Shield render? | In `#lo-totals-block`, below chassis name, above the divider and HP bars |
| Are stat rows (Shield Regen, Dodge Chance etc.) rendered? | **NO** — `_renderMobilityPanel()` is orphaned; not called by `populateLoadout()` and target div removed from HTML |
| HP values — base or gear-computed? | **Gear-computed** — `_gearState.coreHP/armHP/legHP/allHP` are added to chassis base values (lines 1447–1454). Shield reads from `SHIELD_SYSTEMS[loadout.shld].maxShield` + `_gearState.shieldHP` (line 1493) |

---

## Section 3 — Gear Slot Sizing

### Equipment Doll Slots (8 slots around mech silhouette)

**Rendered by:** `populateInventory()` in `js/menus.js`, lines 887–904.

Each slot element has **two classes**: `mech-equip-slot lo-slot`

```html
<div class="mech-equip-slot lo-slot" style="top:6%;position:absolute;left:2%;border-color:...;"
     data-slot="mod" draggable="true" ...>
  <div class="lo-slot-lbl">CPU</div>
  <div class="lo-slot-name" style="color:...;">Item Name</div>
</div>
```

The 8 slots are positioned:
- **Left column** (left: 2%): CPU (6%), ARMS (28%), L ARM (50%), SHIELD (72%)
- **Right column** (right: 2%): AUGMENT (6%), ARMOR (28%), R ARM (50%), LEGS (72%)

### CSS Rules — Three Competing Rules

**Rule 1: `.mech-equip-slot`** (`css/menus.css`, line 293)
```css
.mech-equip-slot {
  width: 88px;       /* FIXED */
  height: 76px;      /* FIXED */
  position: absolute;
  /* ... other properties */
}
```

**Rule 2: `.lo-slot`** (`css/garage.css`, line 962)
```css
.lo-slot {
  aspect-ratio: 1;   /* square */
  /* ... no explicit width/height */
}
```

**Rule 3: `.lo-doll-wrap .lo-slot`** (`css/garage.css`, line 1027)
```css
.lo-doll-wrap .lo-slot {
  aspect-ratio: 1;
  height: auto;
  position: absolute;
  width: calc((100% - 36px - 32px) / 10);  /* responsive */
}
```

### Specificity Analysis

| Rule | Specificity | Width | Height |
|------|------------|-------|--------|
| `.mech-equip-slot` | 0-1-0 | `88px` | `76px` |
| `.lo-slot` | 0-1-0 | (none) | (none) |
| `.lo-doll-wrap .lo-slot` | 0-2-0 | `calc((100% - 36px - 32px) / 10)` | `auto` |

**Conflict:** `.mech-equip-slot` (specificity 0-1-0) sets `width: 88px` and `height: 76px`. `.lo-doll-wrap .lo-slot` (specificity 0-2-0) sets `width: calc(...)` and `height: auto`. Since the element has BOTH classes, the higher-specificity rule `.lo-doll-wrap .lo-slot` wins for `width` and `height`. BUT `.mech-equip-slot` also has `position: absolute` which conflicts with `.lo-slot`'s `position: relative` — the later-loaded rule or higher specificity wins.

**Net result for doll slots:** `width: calc((100% - 36px - 32px) / 10)` from `.lo-doll-wrap .lo-slot` likely overrides the `88px`. The `88px` from `.mech-equip-slot` may still apply if `.lo-doll-wrap .lo-slot` doesn't fully override (depends on CSS load order since both have competing specificities).

### Backpack Slots

**Rendered by:** `populateInventory()` — creates 30 `<div class="lo-slot ...">` elements inside `#inv-backpack`.

**Class:** Only `lo-slot` (no `mech-equip-slot`).

**Grid:** `#inv-backpack` is inside `.lo-bp-grid` which uses:
```css
.lo-bp-grid {
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(10, 1fr);
}
```

**Backpack slot width:** Determined by the 10-column grid (`1fr` each), so approximately `(container_width - 36px_gap) / 10`.

### Key Finding

The `.lo-doll-wrap .lo-slot` rule attempts to make doll slots the same width as backpack cells using `calc((100% - 36px - 32px) / 10)`. But the `.mech-equip-slot` class applies a fixed `88px × 76px` which may partially interfere. The `aspect-ratio: 1` from `.lo-slot` is overridden by the explicit `height: 76px` from `.mech-equip-slot` — so doll slots are NOT square (88×76), while backpack slots ARE square (aspect-ratio: 1).

---

## Section 4 — CSS Rule Conflicts

### Loadout Overlay Wrapper

**ID:** `#stats-overlay` (index.html line 446)
**Inline style:** `position:fixed;inset:0;z-index:10001;background:#080b0e;font-family:var(--font-mono);flex-direction:column;`

The overlay inherits `font-family: var(--font-mono)` from its inline style. Children may override this.

### All CSS Rules Affecting Text in the Loadout Overlay

#### Section Titles & Labels (garage.css)

| Line | Selector | Color | Size | Specificity |
|------|----------|-------|------|-------------|
| 709 | `.lo-sec-title` | `rgba(255,255,255,0.45)` | 8px | 0-1-0 |
| 727 | `.lo-chassis-lbl` | `rgba(255,255,255,0.22)` | 8px | 0-1-0 |
| 735 | `.lo-chassis-val` | `rgba(255,255,255,0.88)` | 11px | 0-1-0 |
| 750 | `.lo-hp-part` | `rgba(255,255,255,0.22)` | 9px | 0-1-0 |
| 770 | `.lo-hp-val` | `rgba(255,255,255,0.22)` | 10px | 0-1-0 |
| 787 | `.lo-stat-label` | `rgba(255,255,255,0.45)` | 9px | 0-1-0 |
| 795 | `.lo-stat-val` | `var(--sci-cyan)` | 11px | 0-1-0 |
| 801 | `.lo-stat-value` | `#00d4ff` | 10px | 0-1-0 |
| 807-811 | `.lo-stat-value.green/.red/.orange/.yellow/.purple` | Various bright | — | 0-2-0 |
| 821 | `.lo-trait-name` | `#ffd166` | 9px | 0-1-0 |
| 828 | `.lo-trait-desc` | `rgba(255,255,255,0.22)` | 8px | 0-1-0 |
| 852 | `.lo-bonus-lbl` | `rgba(255,255,255,0.22)` | 9px | 0-1-0 |
| 859 | `.lo-bonus-val` | (none set) | 10px | 0-1-0 |
| 864 | `.lo-bonus-val.pos` | `#00ff88` | — | 0-2-0 |
| 865 | `.lo-bonus-val.neg` | `#ff4d6a` | — | 0-2-0 |
| 868 | `.bsub` | `rgba(212,163,0,0.5)` | 8px | 0-1-0 |
| 986 | `.lo-slot .lo-slot-lbl` | `rgba(255,255,255,0.22)` | 6px | 0-2-0 |
| 999 | `.lo-slot .lo-slot-name` | (none set, inherited) | 8px | 0-2-0 |

#### Inline Styles in JS (menus.js)

The weapon bar `_renderWeaponBar()` uses extensive **inline styles** rather than CSS classes:
- Line 1823: arm labels → `color:rgba(255,255,255,0.22)` (8px)
- Line 1824: weapon name → `color:var(--sci-cyan)` (12px)
- Line 1825: DMG/DPS → `color:rgba(255,255,255,0.22)` with values `color:rgba(255,255,255,0.88)` (9px)
- Line 1832: "CPU MOD" label → `color:rgba(255,255,255,0.22)` (8px)

#### Top Bar (menus.css + inline)

| Line | Source | Selector/Element | Color |
|------|--------|-----------------|-------|
| 452 | index.html (inline) | `#inv-header-count` | `rgba(255,255,255,0.45)` |
| — | menus.css | `.mp-screen-title` | inherited from menu title styling |
| — | menus.css | `.tw-btn--ghost` | button styling |

### Specificity Conflicts Found

1. **No higher-specificity overrides found** for `.lo-stat-label`, `.lo-sec-title`, `.lo-bonus-lbl`. These are all 0-1-0 specificity and nothing with higher specificity targets the same elements.

2. **Potential issue:** `.lo-stat-value` (0-1-0) vs inline `style="color:#00ff88"` on Total HP/Shield elements. Inline styles always win (specificity 1-0-0-0), so the inline `style="color:#00ff88"` on line 1485 correctly overrides `.lo-stat-value`'s default `#00d4ff`.

3. **`.lo-bonus-lbl` at `rgba(255,255,255,0.22)`** — This is VERY dim (22% opacity white on #080b0e background). This may be intentionally low-contrast for tertiary labels, but it's near-invisible on many monitors.

---

## Section 5 — Remaining Dark Text Sources

### a) Dark Cyan/Teal Colors (#006666 to #009999) on Text

**No matches found.** No color values in this range exist anywhere in the CSS or JS files. This class of problem has been fully eliminated.

### b) rgba(0, 212, 255, N) with N < 0.5 on Text

All occurrences of `rgba(0, 212, 255, ...)` with opacity below 0.5 are on **borders, backgrounds, and SVG strokes** — NOT on text:

| File | Line | Value | Used On |
|------|------|-------|---------|
| css/base.css | 49 | `rgba(0,212,255,0.08)` | `--sci-cyan-dim` variable (backgrounds) |
| css/base.css | 50 | `rgba(0,212,255,0.35)` | `--sci-cyan-border` variable (borders) |
| css/base.css | 201 | `rgba(0,212,255,0.15)` | Button background |
| css/garage.css | 899 | `rgba(0,212,255,0.35)` | `.eq-slot:hover` border |
| css/menus.css | 328–329 | `0.08` / `0.4` | Background / border |
| css/menus.css | 1114 | `rgba(0,212,255,0.35)` | Border |
| css/menus.css | 1188–1189 | `0.2` / `0.4` | Borders |
| js/menus.js | 882 | `rgba(0,212,255,0.1)` | SVG connector line stroke |

**No text color issues in this category.**

### c) CSS Class for Main Menu Nav Numbers (01, 02, etc.)

- **Class:** `.mm-nav-num`
- **File:** `css/menus.css`, line 68
- **Color:** `rgba(255,255,255,0.22)` — intentionally dim tertiary chrome
- **Used on:** 7 spans in `index.html` (lines 48, 53, 58, 63, 70, 75, 80)
- **Assessment:** This is decorative numbering, intentionally very dim. Design choice, not a bug.

### d) CSS Class for Campaign Chapter Numbers (CH.1, CH.2, etc.)

- **Class:** `.cm-chapter-num`
- **File:** `css/menus.css`, line 761
- **Color:** `rgba(255,255,255,0.22)` — intentionally dim
- **Rendered by:** `showMissionSelect()` in `campaign-system.js` line 787
- **Assessment:** Same intentional dim styling as nav numbers. Design choice.

### e) Text Under Mech Image in Multiplayer/Warzone

- **Element:** `#preview-chassis-label`
- **File:** `index.html`, line 155
- **Color:** `rgba(255,255,255,0.45)` (inline style)
- **Assessment:** This is the warzone hangar chassis label. At 45% opacity it's readable but muted. The multiplayer hangar generates its own preview in `js/multiplayer.js` — check `mpShowPvpHangar` for equivalent.

### Summary of All Dark Text Sources Still in Play

| Priority | Selector | Color | Opacity | File:Line | Verdict |
|----------|----------|-------|---------|-----------|---------|
| **HIGH** | `.lo-bonus-lbl` | `rgba(255,255,255,0.22)` | 22% | garage.css:852 | Near-invisible on dark bg |
| **HIGH** | `.lo-hp-part` | `rgba(255,255,255,0.22)` | 22% | garage.css:750 | HP part names barely visible |
| **HIGH** | `.lo-hp-val` | `rgba(255,255,255,0.22)` | 22% | garage.css:770 | HP values barely visible |
| **HIGH** | `.lo-chassis-lbl` | `rgba(255,255,255,0.22)` | 22% | garage.css:727 | "Chassis" label barely visible |
| **HIGH** | `.lo-trait-desc` | `rgba(255,255,255,0.22)` | 22% | garage.css:828 | Trait descriptions barely visible |
| **HIGH** | `.lo-slot .lo-slot-lbl` | `rgba(255,255,255,0.22)` | 22% | garage.css:986 | Equip slot labels barely visible |
| **HIGH** | `.bsub` | `rgba(212,163,0,0.5)` | 50% | garage.css:868 | Gear bonus group headers dim gold |
| Medium | `.lo-sec-title` | `rgba(255,255,255,0.45)` | 45% | garage.css:709 | Readable but muted |
| Medium | `.lo-stat-label` | `rgba(255,255,255,0.45)` | 45% | garage.css:787 | Readable but muted |
| Low | `.mm-nav-num` | `rgba(255,255,255,0.22)` | 22% | menus.css:68 | Intentional decoration |
| Low | `.cm-chapter-num` | `rgba(255,255,255,0.22)` | 22% | menus.css:761 | Intentional decoration |
| OK | Weapon bar inline | `rgba(255,255,255,0.22)` | 22% | menus.js:1823,1825,1832 | Labels dim but weapon names/values are bright |

---

## Section 6 — Change Verification

### a) "HULL INTEGRITY" label removed from loadout

**YES — change exists.** The string "HULL INTEGRITY" does not appear anywhere in the codebase. It has been fully removed. The HTML structure in `index.html` (line 477) uses `<div id="lo-hull-info" class="lo-block">` with no title text. `_renderHullBars()` writes HP bars directly without any section header.

### b) "MECH STATS" label removed

**PARTIAL — comment remains, but string is not rendered.** The string "MECH STATS" appears only as a code comment in `_renderMobilityPanel()` at `js/menus.js:1610`:
```javascript
// ── MECH STATS ────────────────────────────────────────────
```
This function is never called by `populateLoadout()`, and its target div `#stat-mobility-info` does not exist in the HTML. The label is effectively removed from rendered output.

### c) Stat rows removed (Shield Regen, Dodge Chance, etc.)

**YES — removed from rendered output, but code still exists.** `_renderMobilityPanel()` (line 1606–1674) still contains all the stat row rendering code (Shield Regen, Dodge Chance, Dmg Reduction, Auto-Repair, Crit Chance, Mod Cooldown, Speed). However:
- `populateLoadout()` does NOT call `_renderMobilityPanel()`
- The target div `#stat-mobility-info` does not exist in `index.html`
- The function is dead code — it can never render anything
- Only the orphaned `populateStats()` (also never called) references it

### d) CPU MOD label (changed from CORE MOD)

**YES — change exists.** `_renderWeaponBar()` at `js/menus.js:1832` uses:
```javascript
weapHtml += `<div style="...">CPU MOD</div>`;
```
The string "CORE MOD" does not appear in any rendered HTML. It only appears in `js/constants.js:134` as a section comment for chassis-unique core mods data.

### e) RELOAD removed from weapon bar

**YES — change exists.** Searching for "RELOAD" in `js/menus.js` returns zero matches. The weapon bar (`_renderWeaponBar()`, line 1825) shows only DMG and DPS:
```javascript
weapHtml += `<div style="...">DMG <span...>${effDmg}</span> · DPS <span...>${effDps}</span></div>`;
```

### f) Duplicate COLOUR label removed from warzone

**YES — change exists.** Only ONE instance of "Colour" appears in `index.html` at line 135, as a dropdown label inside the `.mp-dd-row`:
```html
<span class="mp-dd-label">Colour</span>
```
No standalone duplicate "Colour" label exists.

### g) Duplicate COLOUR label removed from multiplayer

**YES — change exists.** Only ONE instance of "Colour" appears in `js/multiplayer.js` at line 2449, as a dropdown label. No duplicate.

### h) BACK button top-left in loadout

**YES — change exists.** `index.html` line 450:
```html
<button onclick="toggleStats()" class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;">BACK</button>
```
The button is labeled "BACK" (not "CLOSE") and is the first element in `.lo-top-bar`, making it top-left. The items/scrap count has `margin-left:auto` to push it to the right side.

### i) Campaign XP bar removed from mission select

**YES — change exists.** `showMissionSelect()` in `campaign-system.js` (lines 747–845) does NOT render any XP bar element. The deploy bar (line 833–838) contains only a Deploy button. The level and XP info is shown as a plain text span in the top bar (line 767):
```javascript
html += `<span style="...">LVL ${_campaignState.playerLevel} · ${xpCur} / ${xpNeeded} XP</span>`;
```
No `cm-xp-bar` div or fill bar exists in the mission select screen.

### Verification Summary

| Change | Status | Notes |
|--------|--------|-------|
| "HULL INTEGRITY" removed | **YES** | Fully removed |
| "MECH STATS" removed | **YES** | Dead code remains but not rendered |
| Stat rows removed | **YES** | Dead code remains but not rendered |
| CORE MOD → CPU MOD | **YES** | Fully changed |
| RELOAD removed from weapon bar | **YES** | Fully removed |
| Duplicate COLOUR removed (warzone) | **YES** | Only one instance |
| Duplicate COLOUR removed (multiplayer) | **YES** | Only one instance |
| BACK button top-left | **YES** | Labeled BACK, positioned left |
| Campaign XP bar removed from mission select | **YES** | Replaced with plain text |

**All 9 intended changes have been successfully implemented in the source code.**

---

## Section 7 — Root Cause Analysis

### 1. Why are some fixes not sticking?

**The fixes ARE sticking in the source code.** Every change verified in Section 6 is present and correctly implemented. The likely reason the user perceives fixes as "not sticking" falls into one of these categories:

- **Browser caching:** The browser may be serving stale cached versions of JS and CSS files. Without cache-busting query strings (e.g., `?v=5.78`) on `<script>` and `<link>` tags, the browser will happily serve old versions even after files change on disk. This is the #1 most likely cause.
- **Dead code confusion:** Functions like `_renderMobilityPanel()` and `populateStats()` still exist in the source but are never called. Their presence may create the impression that "MECH STATS" or stat rows haven't been removed, when in fact they have been disconnected from the render pipeline. The dead code should be deleted to avoid confusion.
- **Multiple render paths that were once active:** The old `populateStats()` path and the new `populateLoadout()` path coexist. If someone reads the code and sees `populateStats()` calling `_renderMobilityPanel()`, they might assume stat rows are rendering when they are not.

### 2. Why does Claude Code keep reporting "confirmed" when issues persist?

**Claude Code verifies by reading source code, not by rendering the page in a browser.** When asked "is HULL INTEGRITY removed?", Claude Code searches the source files and correctly finds the string is gone. When asked "are stat rows removed?", Claude Code sees that `populateLoadout()` doesn't call `_renderMobilityPanel()` and confirms the change.

The disconnect is:
- **Source code verification ≠ visual rendering verification.** Claude Code cannot open a browser, load the page, and visually inspect the rendered DOM. It can only read files.
- **CSS visibility issues are invisible to source-level analysis.** A label might be "there" in the source but rendered at `rgba(255,255,255,0.22)` on a `#080b0e` background — effectively invisible. Claude Code sees the text exists but cannot judge whether a human can read it on screen.
- **Caching is invisible to source analysis.** If the user's browser is serving a cached `menus.js` from 3 sessions ago, no amount of source code changes will produce visible results, and Claude Code has no way to detect this.

### 3. What is the single most reliable way to fix the loadout screen?

**Three-step approach:**

1. **Add cache-busting to all script/CSS tags in `index.html`.** Change every `<script src="js/foo.js">` to `<script src="js/foo.js?v=5.78">` and every `<link href="css/bar.css">` to `<link href="css/bar.css?v=5.78">`. Update the version number with each deploy. This guarantees the browser loads fresh code.

2. **Delete all dead render functions.** Remove `populateStats()`, `_renderChassisPanel()`, `_renderWeaponPanel()`, `_renderMobilityPanel()`, and `_renderRunStatsPanel()` — they are orphaned and never called. Remove the hidden placeholder divs (`#stat-weapons-info`, `#stat-run-info`) from `index.html`. This eliminates confusion about which code is actually running.

3. **Fix the remaining 22%-opacity text labels in `garage.css`.** The following selectors use `rgba(255,255,255,0.22)` which is near-invisible:
   - `.lo-hp-part` (line 750) — HP part names (Core, L.Arm, etc.)
   - `.lo-hp-val` (line 770) — HP values (272 / 272)
   - `.lo-chassis-lbl` (line 727) — "Chassis" label
   - `.lo-bonus-lbl` (line 852) — Gear bonus labels
   - `.lo-trait-desc` (line 828) — Chassis trait descriptions
   - `.lo-slot .lo-slot-lbl` (line 986) — Equipment slot labels

   Raise these to at least `rgba(255,255,255,0.45)` for readable secondary text, or to `rgba(255,255,255,0.65)` if they should be clearly visible. The current 22% opacity was likely set as "tertiary chrome" but these are functional labels that users need to read.

