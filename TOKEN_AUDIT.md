# TOKEN_AUDIT.md
# Tech Warrior Online — Design Token Audit
# Generated: 2026-03-21 | Session covering css/*, index.html, js/campaign-system.js, js/menus.js

This report catalogs every hardcoded color, font string, font-size, letter-spacing, and
spacing value found in inline styles, JS template literals, and CSS rule bodies that
should be replaced with CSS custom property tokens.

---

## Colors

### Cyan Family

The codebase has **four distinct cyan tint families** in use simultaneously. None are tokenized except `--cyan`.

| Value | Usage | Status |
|---|---|---|
| `#00ffff` / `rgba(0,255,255,…)` | Base cyan — buttons, headings, HUD text | **Tokenized** as `--cyan`, `--border-cyan`, etc. |
| `rgba(0,210,255,…)` | Leaderboard rows, hud.css fills | **NOT tokenized** — needs `--hud-cyan` family |
| `rgba(0,225,255,…)` | hud.css bar fill active | **NOT tokenized** |
| `rgba(0,230,255,…)` | hud.css active-firing state | **NOT tokenized** |
| `#00e0ff` | Leaderboard round number | **NOT tokenized** |
| `#00ffcc` / `#00ffc8` | System ability text, success toast text | **NOT tokenized** — teal variant |
| `rgba(0,255,200,…)` | Success toast border/bg | **NOT tokenized** |

**Recommended new tokens:**
```css
--hud-cyan: rgba(0,210,255,1);          /* hud.css + leaderboard family */
--hud-cyan-fill: rgba(0,225,255,1);     /* hud bar fill */
--teal: #00ffcc;                         /* system ability, success states */
--teal-dim: rgba(0,255,200,0.12);
```

---

### Gold / Yellow Family

`#ffd700` / `rgba(255,215,0,…)` appears **50+ times** across JS template literals as inline styles.
The token `--gold` exists in `:root` but is not consumed — literal values are used instead.

**Recurring unlisted alpha variants (candidates for tokens):**
```
rgba(255,215,0,0.04)  rgba(255,215,0,0.06)  rgba(255,215,0,0.12)
rgba(255,215,0,0.15)  rgba(255,215,0,0.2)   rgba(255,215,0,0.3)
rgba(255,215,0,0.4)   rgba(255,215,0,0.5)   rgba(255,215,0,0.6)
rgba(255,215,0,0.7)
```

Also found: `#ffdd00` in `_hpBar` for the 30–60% HP threshold (≠ `--gold`); `#ffcc44` / `#ffcc00` for medium chassis (two different values used in different files).

**Recommended:**
```css
--gold-04: rgba(255,215,0,0.04);
--gold-12: rgba(255,215,0,0.12);
--gold-dim: rgba(255,215,0,0.35);   /* existing level */
--gold-mid: rgba(255,215,0,0.6);
--amber: #ffaa00;                    /* scrap/orange-gold — already used as literal ×3 in garage.css */
```

---

### Red Family

The codebase has **four semantically distinct red shades** used inconsistently:

| Value | Where used | Semantic role |
|---|---|---|
| `#ff5050` / `rgba(255,80,80,…)` | `--red` token, `--border-red`, damage negatives | Primary danger red |
| `#ff4444` / `rgba(255,68,68,…)` | `menus.css` pause-btn-red, `hud.css` arm-destroyed, BOSS badges | Secondary red (lighter) |
| `#ff3300` / `rgba(255,51,0,…)` | `base.css` `.tw-btn--error`, overweight warning | Error/destructive red |
| `rgba(255,40,40,…)` / `#ff6666` | Cloud toast error state | Toast error red |
| `#ff4466` | `_hpBar` critical HP (<30%) | Critical HP red |
| `#ff2244` | Death screen score stat | Death/crit red |
| `#ff2200` | Mission difficulty HARD label | Difficulty red |
| `rgba(255,100,100,…)` | Shop SELL heading, error messages | Soft danger |

**Recommended additions to `:root`:**
```css
--red-alt: #ff4444;        /* menus/hud secondary red */
--red-critical: #ff4466;   /* HP bar critical threshold */
--red-error: #ff3300;      /* already in base.css but not as a variable */
```
Consider consolidating `#ff4444` and `#ff4466` — they are very close and may not need to be distinct.

---

### Green Family

| Value | Where used | Note |
|---|---|---|
| `#00ff88` | `--green-accent` token | Correct usage |
| `#44ff88` | Positive stat diffs (campaign-system.js, menus.js), skill tree bonuses | Different — NOT `--green-accent` |
| `#88ff88` | Light chassis color | Lighter green |
| `#00ff44` | Rarity color 'uncommon' in shop | Bright green |
| `rgba(0,255,136,…)` | Completed mission rows | `#00ff88` in rgba form |
| `rgba(0,255,100,0.04)` | Backpack drag hover | Different alpha base |
| `#0f0` / `#00ff00` | hud.css label, initial loadout color | Pure green |

**Recommended:**
```css
--green-pos: #44ff88;      /* positive stat diffs */
--green-chassis: #88ff88;  /* light chassis color */
```

---

### Orange Family

| Value | Where used | Note |
|---|---|---|
| `#ff8844` | `--orange` token | Heavy chassis, sell price |
| `#ffaa00` | garage.css perk badge, death score, scrap | Needs `--amber` |
| `#ff6600` | Death score stat | Not in tokens |
| `rgba(255,200,0,…)` | Objective HUD color | Not in tokens |
| `#ffcc44` | Medium chassis color | Not in tokens |
| `#ffcc00` | Medium perk chip (menus.js) | Different from `#ffcc44` |

**Recommended:**
```css
--amber: #ffaa00;
--chassis-medium: #ffcc44;   /* canonical medium chassis color */
```

---

### Purple Family

| Value | Where used | Note |
|---|---|---|
| `#cc88ff` | `--purple` token, perk chip 'other' | Correct |
| `rgba(180,0,255,…)` | Boss HP bar gradient | Not in tokens |
| `#6600cc` / `#cc00ff` | Boss gradient colors | Not in tokens |
| `rgba(220,160,255,…)` | Boss name text | Not in tokens |
| `#aa44ff` | Rarity 'epic' in rarityColors | Not in tokens |

**Recommended:**
```css
--boss-purple: #cc00ff;
--rarity-epic: #aa44ff;
```

---

### Background / Surface Family

Multiple unlisted dark overlay variants:

| Value | Where used | Note |
|---|---|---|
| `rgba(5,8,12,0.92)` | Perk menu bg | `--surface-dim` is (12,16,20,0.92) — different base |
| `rgba(5,8,12,0.96/0.97)` | Stats/gear overlay bgs | Not tokenized |
| `rgba(3,6,10,0.96)` | Stats-overlay bg | Not tokenized |
| `rgba(10,14,20,0.98)` | garage.css deep surface | Not tokenized |
| `rgba(10,15,22,0.9)` | garage.css dd-option bg | Not tokenized |
| `rgba(0,0,0,0.7/0.82/0.3)` | Pause overlay, death screen, locked tab | Not tokenized |
| `rgba(255,255,255,0.03)` | JS item cards (vs `--surface` = 0.04) | Near-miss |

**Recommended:**
```css
--overlay-dark: rgba(5,8,12,0.96);    /* primary overlay bg */
--overlay-pause: rgba(0,0,0,0.7);     /* pause/death backdrop */
--surface-deep: rgba(10,14,20,0.98);  /* deepest panel bg */
```

---

### Text / Neutral Family

| Value | Where used | Note |
|---|---|---|
| `#c8d2d9` | `--text` token | Correct |
| `rgba(200,210,217,…)` | Muted text variants at 0.25/0.35/0.4/0.5/0.6/0.7/0.85 | Should use `--text` with alpha |
| `rgba(200,210,220,…)` | Comparison tables, item detail (220 vs 217) | Inconsistency |
| `rgba(200,210,220,0.35/0.5/0.6/0.9)` | Various stats panels | Different base color |
| `#e8f0e8` | Leaderboard callsign text | Not in tokens |
| `#c0c8d0` | Common rarity color in shop | Close to `--text` but not same |
| `#c0c0c0` | Leaderboard rank 2 silver | Not in tokens |
| `#cd7f32` | Leaderboard rank 3 bronze | Not in tokens |
| `#888` / `#aaa` | Fallback colors | Not in tokens |

**Note:** The inconsistency between `rgba(200,210,217,…)` and `rgba(200,210,220,…)` should be resolved — pick one base and stick to it. `#c8d2d9` = `rgb(200,210,217)` so use that consistently.

---

### Miscellaneous Unlisted Colors

| Value | Usage | Recommended token |
|---|---|---|
| `#4488ff` | Rarity 'rare' in rarityColors | `--rarity-rare` |
| `#c0c8d0` | Rarity 'common' in rarityColors | `--rarity-common` |
| `#ff8844` | Rarity 'legendary' (wait — actually orange) | Already `--orange` |
| `#88aacc` | Mission difficulty EASY label | `--blue-muted` |
| `#666666` | Mission difficulty TRIVIAL | `--gray` |
| `#ff0000` | Death screen title | — (could use `--red`) |

---

## Fonts

### `'Courier New', monospace`

Appears **20+ times** as a hardcoded string in inline styles across all files. Should always use `var(--font-mono)`.

**Locations:**
- `index.html` lines ~47, 81, 83 (callsign/leaderboard), ~490, ~495 (pause overlay)
- `js/campaign-system.js` line ~1449 (shop item cards), line ~1526 (sell item cards), line ~668 (chassis select cards)
- `js/menus.js` line ~1680 (cloud toast)
- `css/hud.css` — ×3 hardcoded, zero `var()` usage throughout

**Action:** Replace all with `var(--font-mono)`. In `hud.css`, add `:root` import or add `var(--font-mono)`.

---

## Font Sizes

### Unlisted sizes appearing 3+ times

| Size | Occurrences | Location |
|---|---|---|
| `7px` | ×3 | Campaign modifier labels, locked chapter badge |
| `8px` | ×10+ | Skill tree nodes, shop stats, rarity label |
| `9px` | ×10+ | Item rarity sub-labels, BOSS badge, REWARD badge |
| `10px` | ×10+ | XP text, gear bonuses, stat labels |
| `11px` | ×15+ | Level labels, scrap counter, mission names |
| `12px` | ×10+ | Mission briefing, stats rows, weapon panel |
| `13px` | ×8+ | Gear bonus values, weapon heading |
| `14px` | ×4 | Chapter title, arm picker |
| `24px` | ×4 | Panel headings (loadout slots, skill tree) |
| `28px` | ×3 | Major overlay titles (CAMPAIGN, SUPPLY SHOP, NEW CAMPAIGN) |

**Note:** These are largely in JS template literals generating dynamic UI. Introducing CSS
component classes for these repeated UI patterns (e.g. `.panel-title-lg`, `.stat-label-sm`)
would eliminate the repetition without needing per-size tokens.

---

## Letter Spacing

### Unlisted values appearing 3+ times

| Value | Occurrences | Example use |
|---|---|---|
| `0.5px` | ×4 | Mission briefing, affix labels |
| `1px` | ×10+ | Sub-labels, slot names, stat keys |
| `1.5px` | ×3 | Chassis trait labels |
| `2px` | ×10+ | Level labels, pause footer, medium-emphasis text |
| `3px` | ×8+ | Section headings, gear group titles |
| `4px` | ×8+ | Major labels, chapter titles |
| `6px` | ×6+ | CAMPAIGN/SUPPLY SHOP/panel major titles |
| `12px` | ×1 | PAUSED text (likely unique, keep inline) |

**`base.css` already has `--btn-letter-spacing: 4px`** for buttons. Proposed additions:
```css
--ls-1: 1px;
--ls-2: 2px;
--ls-3: 3px;
--ls-6: 6px;
```

---

## Spacing & Padding

No spacing values were extracted as tokens during the audit. Padding and gap values appear
extensively as inline styles in JS template literals but vary significantly by context
(each panel is individually tuned). The highest-priority candidates for tokenization are
repeated structural patterns:

| Pattern | Value | Count |
|---|---|---|
| Standard card padding | `padding:10px 14px` / `padding:12px 16px` | ×8+ |
| Panel section gap | `gap:8px` | ×6+ |
| Panel section margin | `margin-bottom:16px` | ×8+ |
| Small gap | `gap:6px` | ×5+ |

---

## Already Tokenized (Confirmed Correct Usage)

The following tokens were defined in `css/base.css` `:root` and are **correctly consumed**
via `var()` in `css/menus.css` and `css/garage.css`:

- `--cyan`, `--cyan-dim`, `--cyan-mid`
- `--red`, `--gold`, `--green-accent`, `--orange`, `--purple`
- `--bg`, `--surface`, `--surface-dim`, `--surface-hover`, `--surface-active`
- `--border-cyan`, `--border-cyan-bright`, `--border-red`, `--border-red-bright`
- `--font-mono`, `--font-ui`
- `--btn-padding`, `--btn-padding-sm`
- `--btn-letter-spacing`, `--btn-font-size`, `--btn-font-size-sm`
- `--glow-cyan-sm`, `--glow-cyan-md`, `--glow-cyan-lg`
- `--glow-red-sm`, `--glow-red-md`, `--glow-red-lg`
- `.tw-btn` component with 8 modifier variants

**`css/hud.css` is the single largest non-adopter** — it uses zero CSS variables and should be
migrated as its own dedicated task.

---

## Inline `onmouseover`/`onmouseout` Remaining

Session 1 removed all `onmouseover`/`onmouseout` from index.html and most JS files.
One instance was found still present:

- **`js/campaign-system.js` line ~1831** — skill tree node `canBuy` hover state in `_showUpgradesPanel()`.
  The hover changes `this.style.background` and `this.style.boxShadow`. Because the values depend
  on the dynamic chassis color variable (`cc`), a pure CSS `:hover` rule cannot easily reference it.
  This is acceptable to leave as-is until skill tree nodes are refactored into a component class.

---

## Priority

### P0 — Quick wins (no refactor needed, just find-replace)

1. **`var(--font-mono)` everywhere** — Replace all `'Courier New',monospace` / `"Courier New",monospace` inline strings. ~20 occurrences across index.html, campaign-system.js, menus.js, hud.css.
2. **`#c8d2d9` → `var(--text)`** — The token exists; the literal appears ×6+ in JS files.
3. **`rgba(200,210,217,…)` inconsistency** — Align all `rgba(200,210,220,…)` instances to use `200,210,217` base.

### P1 — Token additions needed, then migrate

4. **`--amber: #ffaa00`** — Used as literal ×5+ in garage.css and JS files.
5. **`--gold-*` alpha variants** — Define 3–4 standard gold alphas; replace ×30+ literal occurrences in JS.
6. **`--chassis-light/medium/heavy`** — Define the three chassis color constants; replace in all JS files.
7. **`--overlay-dark` / `--overlay-pause`** — Two recurring overlay backgrounds not currently in `:root`.

### P2 — Architecture improvements

8. **`hud.css` full migration** — Add `:root` consumption; replace all 3 hardcoded `rgba(0,210,255,…)` cyan families with `--hud-cyan` tokens; replace `#ff4444`, `#0f0`, `'Courier New'` literals.
9. **`--red-alt: #ff4444`** — Harmonize the two red families (`#ff5050` vs `#ff4444`) across menus.css, hud.css, and JS BOSS badges.
10. **JS UI component classes** — The bulk of inline styles in `campaign-system.js` and `menus.js` come from individually hand-styled template literal panels. Introducing shared CSS classes (`.panel-briefing`, `.mission-card`, `.skill-node`, `.shop-item-card`) would eliminate the need for per-element inline styles entirely and is the structural fix underlying most P1 items.

### P3 — Low priority / unique values

11. **`#00ffcc` / `#00ffc8`** — Teal system/toast color. Define `--teal` and use.
12. **Leaderboard hud-cyan family** — `rgba(0,210,255,…)` — share with hud.css `--hud-cyan` token when P2 is done.
13. **HP bar thresholds** — `#00ff88` / `#ffdd00` / `#ff4466` — define `--hp-high`, `--hp-mid`, `--hp-low`.
14. **`#e8f0e8`**, **`#c0c0c0`**, **`#cd7f32`** — Leaderboard one-off colors. Low value to tokenize unless leaderboard styling is fully componentized.
