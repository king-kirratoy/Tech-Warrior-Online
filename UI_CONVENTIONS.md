# Tech Warrior Online — UI Conventions

Quick reference for UI patterns, CSS conventions, and display rules. Claude Code should read this at the start of any session that touches `css/`, `js/menus.js`, or the loadout screen.

---

## Section 1 — Design Tokens

All tokens are defined in `css/base.css` as `:root` custom properties. Two parallel token families exist — **do not mix them**.

### Sci-fi Button / Panel Palette (`--sci-*`)
Used in all interactive UI panels: loadout overlay, hover cards, hangar, leaderboard, campaign screens.

| Token | Value | When to use |
|---|---|---|
| `--sci-cyan` | `#00d4ff` | Primary accent — interactive borders, active tab indicators, selected item borders |
| `--sci-cyan-dim` | `rgba(0,212,255,0.08)` | Hover/active background fill on slots, cards, buttons |
| `--sci-cyan-border` | `rgba(0,212,255,0.35)` | Default border on interactive elements (slots, cards, dropdowns) |
| `--sci-cyan-bright` | `rgba(0,212,255,1)` | Focused or active border (hovered slots, selected states) |
| `--sci-red` | `#ff4d6a` | Danger states, destroyed parts, negative stat values |
| `--sci-red-dim` | `rgba(255,77,106,0.08)` | Danger background fill |
| `--sci-red-border` | `rgba(255,77,106,0.35)` | Danger/warning border |
| `--sci-gold` | `#ffd166` | Legendary items, chassis traits, unique item names, warnings |
| `--sci-line` | `rgba(255,255,255,0.07)` | Subtle dividers between list items, inactive slot borders |
| `--sci-txt` | `rgba(255,255,255,0.9)` | Primary readable text (names, values) |
| `--sci-txt2` | `rgba(255,255,255,0.4)` | Secondary / muted text (labels, hints) |
| `--sci-txt3` | `rgba(255,255,255,0.18)` | Near-invisible decorative text (nav numbers, chapter labels) |
| `--sci-surface` | `rgba(255,255,255,0.03)` | Panel background fill |

### Legacy Brand / Game World Palette
Used in in-game HUD, Phaser game world, and older JS inline styles. Do not introduce into the `--sci-*` panel contexts.

| Token | Value | When to use |
|---|---|---|
| `--cyan` | `#00ffff` | HUD accents, game-world highlights |
| `--red` | `#ff5050` | HP danger zone in HUD |
| `--gold` | `#ffd700` | Legendary rarity glow, gold-themed items |
| `--green-accent` | `#00ff88` | Positive stats, HP bars, buffs |
| `--orange` | `#ff8844` | Scrap death penalty, moderate warnings |
| `--purple` | `#cc88ff` | Shield values, perk counts |
| `--amber` | `#ffaa00` | Moderate warnings (overweight build, etc.) |
| `--yellow` | `#ffdd00` | HP bar mid-zone threshold |
| `--hud-cyan` | `rgba(0,210,255,1)` | HUD weapon row labels and fills — distinct from `--cyan` |

### Typography Tokens

| Token | Value | When to use |
|---|---|---|
| `--font-mono` | `'Courier New', monospace` | **Every** UI element — the only permitted game font |
| `--font-ui` | `'Verdana', 'Segoe UI', sans-serif` | `body` default only — never apply explicitly to game UI |
| `--text-tiny` | `8px` | Eyebrow labels, slot type tags, badge text |
| `--text-xs` | `9px` | Body copy, descriptions, item affixes |
| `--text-sm` | `10px` | Stat values, secondary names |
| `--text-label` | `11px` | Names, primary labels, button text |
| `--text-md` | `12px` | Section headers, dropdown option names |
| `--text-base` | `13px` | Standard paragraph text |
| `--text-lg` | `14px` | Emphasized panel titles |
| `--text-xl` | `15px` | Large panel titles |
| `--text-h3` | `24px` | Screen headings |
| `--text-h2` | `28px` | Major headings (chassis select, death screen title) |

### Letter Spacing Tokens

| Token | Value | When to use |
|---|---|---|
| `--ls-1` | `1px` | Body copy |
| `--ls-2` | `2px` | Secondary labels |
| `--ls-3` | `3px` | Button text, primary labels |
| `--ls-4` | `4px` | HUD numbers, section tags |
| `--ls-6` | `6px` | Screen titles |

### Spacing Tokens

| Token | Value | When to use |
|---|---|---|
| `--space-xs` | `6px` | Gap between inline elements |
| `--space-sm` | `8px` | Compact padding (small buttons, chips) |
| `--space-md` | `14px` | Standard padding (panel sections) |
| `--space-lg` | `16px` | Card internal padding |
| `--space-xl` | `20px` | Between major sections |

### Border Token

| Token | Value | When to use |
|---|---|---|
| `--border` | `rgba(255,255,255,0.1)` | Generic divider, subtle list separators |

### Box Glow Tokens
Used for `box-shadow` on panels and cards. **Not** for button hover states.

| Token | Value |
|---|---|
| `--glow-cyan-sm` | `0 0 8px rgba(0,255,255,0.15)` |
| `--glow-cyan-md` | `0 0 16px rgba(0,255,255,0.25)` |
| `--glow-cyan-lg` | `0 0 28px rgba(0,255,255,0.35)` |
| `--glow-red-sm/md/lg` | Same pattern at 8/16/28px radius |
| `--glow-gold-sm/lg` | Gold equivalent at 8/28px |
| `--glow-green-sm/lg` | Green equivalent at 8/28px |

---

## Section 2 — Typography Rules

### Font Family
**Every UI element uses `'Courier New', monospace`.** This is stored in `--font-mono`. No exceptions.
- Always apply via `font-family: var(--font-mono)` in CSS
- In JS inline styles: `font-family: var(--font-mono)` or the `UI_COLORS.fontMono` constant
- The `body` element uses `--font-ui` (Verdana) as a fallback base only — never apply it explicitly to any game UI element

### Font Size Scale
These sizes are established by the `--text-*` tokens and consistently used throughout:

| Size | Token | Usage examples |
|---|---|---|
| 8px | `--text-tiny` | Slot type eyebrows (`CPU`, `WEAPON`), stat diff labels, badge text |
| 9px | `--text-xs` | Item descriptions, affix values, secondary body copy |
| 10px | `--text-sm` | Stat values, dropdown option descriptions, button text (small scale) |
| 11px | `--text-label` | Item names, section labels, primary button text, leaderboard rows |
| 12px | `--text-md` | Dropdown option names, section headers, campaign nav items |
| 13px | `--text-base` | Standard paragraph text, briefing content |
| 14–15px | `--text-lg/xl` | Emphasized panel titles |
| 24px | `--text-h3` | Screen-level headings |
| 28px | `--text-h2` | Death screen, major overlays |

### Text Transform
- **`text-transform: uppercase`**: All system labels, slot type tags, button text, HUD prefixes, section titles, leaderboard column headers
- **Sentence case**: Item descriptions, chassis trait descriptions, shop item descriptions, briefing text
- **Mixed case (Title Case)**: Item names, chassis names, perk names

### Letter Spacing
- 1–2px: Body descriptions and secondary labels
- 2–3px: Standard labels and button text
- 4px: HUD numbers and section titles
- 5–6px: Screen-level headings
- Values above 6px: Reserved for major display headings only (main menu title, death screen)

---

## Section 3 — Color Meaning

These are the semantic color assignments for the game UI. Use consistently — players learn these associations.

### Semantic Game Colors

| Color | Hex / Token | Meaning |
|---|---|---|
| Sci-cyan | `#00d4ff` / `--sci-cyan` | Active/selected states, interactive accent, primary highlights in panels |
| HUD cyan | `#00ffff` / `--cyan` | In-game HUD accents, game-world interactive elements |
| Positive green | `#00ff88` / `--green-accent` | Positive stat values, HP bars above danger, buffs, improvement diffs |
| Danger red | `#ff4d6a` / `--sci-red` | Negative stats, damaged/destroyed states, debuffs, bad diffs |
| Gold | `#ffd166` / `--sci-gold` | Legendary items, chassis traits, unique item names, special highlights |
| Shield purple | `#cc88ff` / `--purple` | Shield-related values, perk stack counts |
| Scrap orange | `#e8923a` | Scrap currency amount displayed in shop/loadout headers |
| Warning amber | `#ffaa00` / `--amber` | Moderate warnings (overweight build, dual-explosive risk) |

### Text Opacity Levels

| Color | When to use |
|---|---|
| `rgba(255,255,255,0.9)` / `--sci-txt` | Primary readable text — names, values, anything a player needs to read |
| `rgba(255,255,255,0.55)` | Secondary text — item descriptions, helper copy |
| `rgba(255,255,255,0.45)` | Dimmed labels — `text-dim` level, stat row labels |
| `rgba(255,255,255,0.35)` | Tertiary / hint text — minimum for readable text |
| `rgba(255,255,255,0.18)` / `--sci-txt3` | Decorative only — nav numbers, chapter numbers. Do not use for anything the player must read |

**Rule:** Never use opacity below `0.35` for text the player needs to read.

### Rarity Colors
From `RARITY_DEFS` in `js/loot-system.js`. Apply inline via `item.rarity`'s `colorStr` property — never hardcode in CSS.

| Rarity | `colorStr` | Weight |
|---|---|---|
| Common | `#c0c8d0` | 45 |
| Uncommon | `#00ff44` | 30 |
| Rare | `#4488ff` | 15 |
| Epic | `#aa44ff` | 8 |
| Legendary | `#ffd700` | 2 |

### Stat Diff Colors
Used in comparison hover cards and gear bonus panels:
- Improvement (higher is better, positive number): `#00ff88` (green)
- Degradation (lower is better, negative number): `#ff4d6a` (red)
- No change: `rgba(255,255,255,0.4)` (muted)

---

## Section 4 — Inverted Display Stats

Some stats are **buffs when their numeric value is negative** because they reduce a cost (reload time, cooldown duration). Displaying them with the raw sign would mislead the player.

### Affected Stats

| Stat key | Display label | Why inverted |
|---|---|---|
| `fireRatePct` | Fire Rate % | −15 means 15% faster fire rate — a buff; stored negative throughout (gen, gear, skill tree) |
| `modCdPct` | Mod Cooldown % | −15 means 15% shorter cooldown — a buff; stored negative throughout |
| `reload` | Fire Rate (shots/sec) | Lower ms = faster = more shots/sec — converted for display |

### Display Rule

| Raw value | Sign shown | Color | Meaning to player |
|---|---|---|---|
| Negative (e.g. −15) | `+15%` | Green `#00ff88` | Buff — good |
| Positive (e.g. +10) | `−10%` | Red `#ff4d6a` | Debuff — bad |
| Zero | `0%` | Muted | Neutral |

### Implementation
The `_hoverInvertedStats` Set in `js/menus.js` is the single source of truth:
```javascript
const _hoverInvertedStats = new Set(['fireRatePct', 'modCdPct', 'reload']);
```

### Storage Convention (v7.43)
`fireRatePct` and `modCdPct` are stored as **negative** throughout the entire codebase — in `ITEM_BASES`, rolled affixes, skill tree bonuses, and gear state. A buff of "5% faster fire rate" is stored as `fireRatePct = -5`. The combat formulas use `1 + (stat/100)` so that negative values correctly reduce reload/cooldown time.

**Always check this Set before formatting any stat sign/color.** The inversion logic is applied inline wherever stats are rendered:
- Gear bonuses panel (`_renderGearBonusesPanel`)
- Hover cards (`_buildSingleCardHtml`, `_buildHoverHtml`)
- Comparison diff section
- Supply shop item stats

Do not add new inverted stats by hardcoding checks elsewhere — add them to `_hoverInvertedStats`.

---

## Section 5 — Slot Label Naming

These are the canonical display names for item types and slot labels. Applied consistently across all UI contexts.

### Backpack Item Cards (`_bpSlotNames` map in `js/menus.js`)
Shown as the small eyebrow label at the top of each item card in the backpack grid.

| `item.baseType` key(s) | Display label |
|---|---|
| `weapon` | `WEAPON` |
| `mod`, `mod_system` | `CPU` |
| `augment`, `aug_system` | `AUGMENT` |
| `shield`, `shield_system` | `SHIELD` |
| `leg`, `leg_system`, `legs` | `LEGS` |
| `arms` | `ARMS` |
| `armor`, `chest` | `ARMOR` |

**Rule: Weapon slots in the backpack always show "WEAPON" — never "L ARM" or "R ARM".** This was intentionally changed in v5.90. Do not revert.

### Equipment Doll Slots (`slotPositions` config in `populateLoadout()`)
The label shown inside each of the 8 positioned slots on the mech silhouette.

| Slot key in `_equipped` | Doll label | Position |
|---|---|---|
| `mod` | `CPU` | Top-left |
| `arms` | `ARMS` | Mid-left |
| `L` | `L ARM` | Lower-left |
| `shield` | `SHIELD` | Bottom-left |
| `augment` | `AUGMENT` | Top-right |
| `chest` | `ARMOR` | Mid-right |
| `R` | `R ARM` | Lower-right |
| `legs` | `LEGS` | Bottom-right |

### Weapon Bar (center column, bottom of loadout screen)
Shows `L ARM` and `R ARM` for the two weapon entries — this context uses arm labels, not "WEAPON".

### Hover Card Slot Labels (`_buildSingleCardHtml` / `_buildHoverHtml`)
Uses the same `bpSlotNames`-style mapping. Weapons show as "Weapon" (title case in the hover card subtitle line).

---

## Section 6 — Loadout Screen Architecture

The loadout overlay (`#stats-overlay`, toggled by `toggleStats()`) is a three-column CSS Grid.

### Column Layout
```
grid-template-columns: 220px 1fr 440px;

┌─────────────────────┬──────────────────────┬──────────────────────────┐
│  Left col (220px)   │  Center col (flex)   │  Right col (440px)       │
│  ─────────────────  │  ──────────────────  │  ──────────────────────  │
│  Chassis name row   │  Chassis traits bar  │  Backpack header         │
│  HP bars            │  Mech silhouette     │  4×5 grid (20 slots)     │
│  Total HP / Shield  │  8 equipment slots   │  Each slot: 100×100px    │
│  Gear bonuses       │  Weapon bar          │                          │
│  Active perks       │                      │                          │
└─────────────────────┴──────────────────────┴──────────────────────────┘

Classes: .lo-left | .lo-center | .lo-right (all children of .lo-body)
```

### Shared `.lo-slot` Class
`.lo-slot` is **used for both doll slots and backpack cells.** It is defined once in `css/garage.css`.
- Size: `width: 100px; height: 100px` — set explicitly, **not** via `aspect-ratio`
- Any change to `.lo-slot` affects both contexts simultaneously
- Doll slots also receive `.mech-equip-slot` for drag-and-drop CSS states
- Backpack cells receive the `.bp-cell` class for drag opacity/cursor states

### Equipment Doll Slots
- 8 slots positioned using `position: absolute` with percentage-based `top` / `left` / `right`
- The silhouette `<div>` has `position: relative; width: 100%; height: 100%`
- SVG connector lines are drawn from each slot toward the mech center
- A grayscale mech image (40% opacity) sits centered behind the slots as a ghost reference

### Backpack Grid
- Container: `#inv-backpack` with class `.lo-bp-grid`
- CSS: `grid-template-columns: repeat(4, 100px); gap: 4px`
- 4 columns × 5 rows = **20 cells** (`INVENTORY_MAX = 20`)
- Each cell is a `.lo-slot` element — same size as doll slots (100×100px)

### Single Render Entry Point
`populateLoadout()` in `js/menus.js` is the **only** function that renders the loadout overlay. It calls internal sub-renderers:
- `_renderHullBars()` — HP bars and totals
- `_renderGearBonusesPanel()` — equipped gear stat bonuses
- `_renderActivePerksPanel()` — active perk chips
- `_renderWeaponBar()` — weapon bar at center-column bottom

**Never call these sub-renderers directly from outside `js/menus.js`.** To refresh the overlay: call `populateLoadout()`.

`populateInventory()` renders only the backpack grid (`#inv-backpack`) — call it when inventory contents change without needing a full overlay refresh.

### Hover Card System
- Appears on `mouseenter` for both doll slots and backpack cells
- Positioned with fixed coordinates; edge detection flips left/right and up/down to stay in viewport
- Z-index: `9999`
- **Single item:** `_showSlotHover(el, slotKey, itemOverride)` → `_buildHoverHtml(item, slotLabel, null)`
- **Comparison (backpack item with equipped counterpart):** `_buildHoverHtml(item, slotLabel, compareItem)` → two `.lo-hover-cmp-col` cards side by side + `.lo-hover-diff` section spanning full width beneath
- `_buildSingleCardHtml(item, slotLabel)` renders one item card; used by both single and comparison views
- Hide: `_hideSlotHover()` on `mouseleave` and `mousedown`
- The old click-based detail panel (`#inv-detail-panel`) is disabled (`display:none !important`)

### Hover Card Stat Row Format (v7.49)
All stat rows — both base stats and affixes — use a unified two-column layout:
- **Left:** grey label text (`color: rgba(255,255,255,0.45)`) — e.g. "Core HP", "Damage %", "Fire Rate"
- **Right:** green value text (`color: #00ff88`) with `+` prefix — e.g. "+26", "+5%"
- Layout: `display:flex; justify-content:space-between; font-size:9px; padding:1px 0`
- No separator line between base stats and affixes
- No "BONUSES" eyebrow label

**Exceptions (no `+` prefix, value has a unit suffix):**
- `fireRate` / `reload`: displayed as `N.N/sec` (shots-per-second conversion)
- `cooldown`: displayed as `Ns`

**Inverted stats** (`fireRatePct`, `modCdPct` — see Section 4): retain sign-flip logic; green for buff (stored negative), red `#ff4d6a` for penalty (stored positive).

**Affix label parsing:** affix `a.label` strings (e.g. `"+26 Core HP"`, `"+5% Damage"`) are split with `/^([+\-][\d.]+%?)\s+(.+)$/` — group 1 is the value token shown right-aligned in green, group 2 is the stat name shown left-aligned in grey. Inverted affixes (reload/cooldown) that start with `-` are sign-flipped to `+` before parsing.

---

## Section 7 — Button and Interactive Element Rules

### Button Classes (defined in `css/base.css`)

| Class | Use case | Visual |
|---|---|---|
| `.tw-btn` | Base class — apply to every button | Transparent, `--sci-cyan` border and text |
| `.tw-btn--solid` | Primary actions (Deploy, Confirm, Proceed) | Filled with `--sci-cyan-dim`, bright border |
| `.tw-btn--ghost` | Navigation / back actions | Same as base `.tw-btn` — lower visual weight |
| `.tw-btn--danger` | Destructive actions (Quit game, Scrap item, New Campaign) | `--sci-red` border and text |
| `.tw-btn--sm` | Small / panel-scale buttons (inside overlays, shops, hangar) | Smaller padding and font |
| `.tw-btn--disabled` | Non-interactive state | `opacity: 0.3`, `pointer-events: none` |

### Button Rules
- Every button must carry `.tw-btn` as its base class
- Combine modifier classes: `class="tw-btn tw-btn--solid"` or `class="tw-btn tw-btn--danger tw-btn--sm"`
- Font is always `--font-mono` (enforced by `.tw-btn` CSS)
- Text is always `text-transform: uppercase` (enforced by `.tw-btn` CSS)

### Gear Slot and Backpack Slot Interaction
- **No click handlers on `.lo-slot` elements for info display** — hover cards handle all info
- `mousedown` starts drag; drag-and-drop moves or equips items
- Equipping via drag goes through `_onSlotDrop()` → `_equipItemToSlot()` in `js/events.js` / `js/menus.js`
- Arm-slot weapon equip triggers `_showArmPicker()` when both arm slots are available

---

## Section 8 — Things Claude Code Must Never Do in UI Sessions

1. **Never call `populateStats()`** — it is dead code and does not exist as an active function. The correct call is `populateLoadout()`.

2. **Never add cache-busting `?v=` query strings** to `<link>` or `<script>` tags. They were deliberately removed in v5.87. The server handles caching.

3. **Never use `aspect-ratio` on `.lo-slot` or any equipment slot** — use explicit `width` and `height` (both `100px`). Aspect-ratio causes layout instability in the grid.

4. **Never add `border-radius` to borders that are only on one side** (e.g., `border-left` + `border-radius`). Border-radius on single-sided borders creates visual artifacts. Apply radius only when all four sides share the same border style.

5. **Never hardcode `font-family: sans-serif`, `font-family: Verdana`, or any non-monospace font** for any game UI element. Always use `font-family: var(--font-mono)` or the `UI_COLORS.fontMono` JS constant.

6. **Never use text opacity below `0.35`** for text the player must read. Anything dimmer than `rgba(255,255,255,0.35)` is decorative only.

7. **Never hardcode rarity hex values in CSS files.** Rarity colors come from `RARITY_DEFS[rarity].colorStr` in `js/loot-system.js` and are applied inline from JS. Adding them to CSS creates two sources of truth.

8. **Never touch `#inv-detail-panel`** — it is disabled (`display:none !important`) and has been replaced by the hover card system. Do not re-enable it or wire click handlers to it.

9. **Never compare `_gameMode` against display strings** (`'Warzone'`, `'Campaign'`, `'Multiplayer'`). Always use the internal keys: `'simulation'`, `'campaign'`, `'pvp'`.

10. **Never hardcode a hex color that duplicates a `--sci-*` token.** Look up the token table in Section 1 first.

---

## Section 9 — Pickup Notification System

Item and scrap pickup notifications appear in a shared left-side queue in `js/loot-system.js`.

### Queue Rules
- All notifications (item pills + scrap pill) share one vertical queue, `left: 12px`, top starting at `80px`.
- Each new notification appends to the bottom. When one dismisses, remaining pills slide up (`transition: top 200ms ease`).
- Hard cap: 6 simultaneous pills. If exceeded, the oldest is force-removed immediately.
- Managed by `_enqueueNotifPill()` / `_reposNotifs()` / `_removeNotif()` in `loot-system.js`.

### Item Pills
- Background: `rgba(r,g,b,0.12)` — derived from rarity `colorStr` (`0.15` for Common and Legendary).
- Border: `1px solid rgba(r,g,b,0.5)`.
- Text color: rarity `colorStr` (full opacity).
- Glow (`box-shadow`): none for Common, scaling up to double-layer for Legendary.
- Font: `var(--font-mono)`, 13px bold, uppercase, 2px letter-spacing.
- Hold 1.8s, fade out 300ms.

### Scrap Pill
- Gold text (`#ffd700`), no border, transparent background (`rgba(255,215,0,0.08)`).
- Font: `var(--font-mono)`, 11px, uppercase.
- Shows `⚙ +X SCRAP` where X is the accumulated total.
- Multiple pickups in rapid succession combine into one updating pill; dismiss timer resets on each new pickup.
- Fades in 100ms, holds 1.2s after last pickup, fades out 200ms.
