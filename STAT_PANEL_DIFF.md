# STAT_PANEL_DIFF — Warzone vs Multiplayer Stats Panel Diagnostic

## Root Cause (Summary)

The visual difference is caused entirely by **font-family inheritance**. The two panels share identical class names (`.hg-stat-row`, `.hg-stat-label`, `.hg-stat-val`) but those classes do **not** declare `font-family` — they inherit it from their ancestor. The multiplayer hangar's outermost wrapper gets `el.className = 'mp-screen'` applied at runtime (multiplayer.js line 2136), and `.mp-screen` declares `font-family: var(--font-mono)` (`'Courier New', monospace`). The warzone hangar lives inside `#garage-menu.stat-readout`, neither of which sets `font-family`, so it falls through to `body { font-family: var(--font-ui) }` (`'Verdana', 'Segoe UI', sans-serif`).

**Result:** Multiplayer stat rows render in Courier New. Warzone stat rows render in Verdana. The HTML structure and class names are identical — the font difference is the only visual cause.

**Minimal fix:** Add `font-family: var(--font-mono)` to the `.hg-stat-label` and `.hg-stat-val` rules in `css/garage.css`. This makes both panels Courier New regardless of ancestor container.

---

## Step 1 — CSS Rules for Shared Stat Classes

### File: `css/garage.css`

**Rule 1 — `.hg-stat-row`** (line 572)
```css
.hg-stat-row {
  align-items: baseline;
  border-bottom: 1px solid var(--sci-line);
  display: grid;
  gap: 8px;
  grid-template-columns: 130px 1fr;
  padding: 8px 20px;
}
```
- Plain class selector. No parent prefix.
- No `font-family`. Inherits from ancestor.

**Rule 2 — `.hg-stat-label`** (line 581)
```css
.hg-stat-label {
  color: rgba(255,255,255,0.45);
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
}
```
- Plain class selector. No parent prefix.
- **No `font-family` declared.** ← KEY MISSING PROPERTY

**Rule 3 — `.hg-stat-val`** (line 589)
```css
.hg-stat-val {
  color: var(--sci-cyan);
  font-size: 11px;
  word-break: break-word;
}
```
- Plain class selector. No parent prefix.
- **No `font-family` declared.** ← KEY MISSING PROPERTY

**Rule 4 — `.hg-stat-val` modifier variants** (lines 595–598)
```css
.hg-stat-val.warn   { color: var(--sci-gold); }
.hg-stat-val.dim    { color: rgba(255,255,255,0.55); font-size: 10px; }
.hg-stat-val.green  { color: #00ff88; }
.hg-stat-val.purple { color: #cc88ff; font-size: 10px; }
```
- Plain class selectors. No parent prefix. No `font-family`.

**Rule 5 — `.hg-gap`** (line 600)
```css
.hg-gap {
  background: rgba(255,255,255,0.02);
  height: 6px;
}
```
- Plain class selector. No parent prefix. Not text-bearing.

### File: `css/menus.css`

**Rule 6 — `.mp-stats-header`** (line 1231)
```css
.mp-stats-header {
  border-bottom: 1px solid var(--sci-line);
  color: rgba(255,255,255,0.45);
  flex-shrink: 0;
  font-size: 9px;
  letter-spacing: 2px;
  padding: 10px 20px;
  text-transform: uppercase;
}
```
- Plain class selector. No parent prefix.
- No `font-family` declared. Inherits from ancestor.

### Files: `css/base.css`, `css/hud.css`

No matches for any of the target class names.

### File: `index.html` (inline `<style>`)

No inline `<style>` block exists in index.html. The stat class names appear only in structural HTML:
```html
<div class="hg-right">
  <div class="mp-stats-header">Build stats</div>
  <div id="garage-stats-panel"></div>
  <div id="starter-loadout-panel"></div>
</div>
```
No scoped overrides. No inline style on `.hg-right` or `#garage-stats-panel`.

**Finding:** Zero instances of any parent-prefixed selector like `#garage-menu .hg-stat-row` or `.mp-right .hg-stat-val`. The class rules are entirely plain — no conditional scoping by screen.

---

## Step 2 — Wrapper IDs

### A) Warzone hangar stats panel — outermost wrapper

- **Outermost element:** `<div class="stat-readout" id="garage-menu">` (index.html line 119)
- **Stats panel container:** `<div class="hg-right">` → `<div id="garage-stats-panel">`
- The stats rows (`.hg-stat-row` etc.) are injected directly into `#garage-stats-panel` with no intermediate wrapper

### B) Multiplayer hangar stats panel — outermost wrapper

- **Outermost element:** `<div id="pvp-hangar">` — created dynamically by `mpShowPvpHangar()` and appended to `document.body`
- **Critical line:** `el.className = 'mp-screen';` (multiplayer.js line 2136) — the `#pvp-hangar` div is assigned class `mp-screen` every time the hangar opens
- **Stats panel container:** `<div class="mp-right">` → `<div style="padding:12px 20px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;flex:1;">` → stat rows

**Key difference:** `#pvp-hangar` has class `mp-screen` at runtime; `#garage-menu` has class `stat-readout`.

---

## Step 3 — Screen-level Overrides

### Warzone wrapper: `#garage-menu` / `.stat-readout`

**`.stat-readout`** (garage.css lines 15–27):
```css
.stat-readout {
  background: linear-gradient(var(--surface-dim), var(--surface-dim)),
              url('../assets/hangar-bg.jpg') center / cover;
  border: 1px solid var(--border-cyan);
  border-radius: 10px;
  box-shadow: 0 0 40px rgba(0,0,0,0.7), 0 0 20px rgba(0,255,255,0.1);
  max-width: 98vw;
  padding: 24px 28px;
  pointer-events: auto;
  position: relative;
  width: 820px;
}
```
- **No `font-family`, `font-size`, `color`, or `letter-spacing` declared.**
- Children inherit from `body`.

**`#garage-menu`** (garage.css lines 29–40):
```css
#garage-menu {
  background: #080b0e;
  border: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 100%;
  padding: 0;
  width: 100%;
}
```
- **No `font-family`, `font-size`, `color`, or `letter-spacing` declared.**
- Children still inherit from `body`.

**`body`** (base.css line 134–138):
```css
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-ui);   ← 'Verdana', 'Segoe UI', sans-serif
  margin: 0;
  overflow: hidden;
}
```
- `--font-ui: 'Verdana', 'Segoe UI', sans-serif`

**Result:** Warzone stat rows inherit `font-family: 'Verdana', 'Segoe UI', sans-serif`.

---

### Multiplayer wrapper: `#pvp-hangar` / `.mp-screen`

**`.mp-screen`** (menus.css lines 1058–1066):
```css
.mp-screen {
  background: #080b0e;
  display: none;
  flex-direction: column;
  font-family: var(--font-mono);   ← 'Courier New', monospace  ← ROOT CAUSE
  inset: 0;
  position: fixed;
  z-index: 10002;
}
```
- **Declares `font-family: var(--font-mono)`** = `'Courier New', monospace`
- This overrides the `body` font for ALL descendants of `#pvp-hangar`

**Result:** Multiplayer stat rows inherit `font-family: 'Courier New', monospace`.

---

### Side-by-side comparison

| Property      | Warzone (`#garage-menu`) | Multiplayer (`#pvp-hangar.mp-screen`) |
|---------------|--------------------------|---------------------------------------|
| `font-family` | `'Verdana', 'Segoe UI', sans-serif` (from `body`) | `'Courier New', monospace` (from `.mp-screen`) |
| `font-size`   | (none set on wrapper) | (none set on wrapper) |
| `color`       | `var(--text)` (from `body`) | `var(--text)` (from `body`) |

The font-family mismatch is the **sole** cause of the visual difference.

---

## Step 4 — !important Overrides

### `css/garage.css`
One `!important` block found on `#deploy-btn.overweight` (lines 78–87):
```css
#deploy-btn.overweight {
  background: rgba(255,50,0,0.1) !important;
  border: 1px solid var(--red-error) !important;
  border-bottom: 2px solid var(--red-error) !important;
  border-top: 2px solid var(--red-error) !important;
  color: var(--red-error) !important;
  letter-spacing: var(--ls-2) !important;
}
```
- Scoped to `#deploy-btn.overweight` only — a button, not a stat row. No impact on stats panel.

### `css/menus.css`
One `!important` block found (lines 172–176):
```css
#top-left-btns button:focus,
#top-left-btns button:focus-visible {
  box-shadow: 0 0 10px rgba(0,255,255,0.15) !important;
  outline: none !important;
}
```
- `box-shadow` and `outline` only. Not text-related. No impact on stats panel.

### `css/base.css`, `css/hud.css`
No `!important` declarations on text-related properties found.

**Finding:** No `!important` rules affect the stats panel text on either screen.

---

## Conclusion

The **only** CSS difference between the two stat panels is the `font-family` inherited from their respective outermost containers:

- `.hg-stat-label` and `.hg-stat-val` omit `font-family` from their rule bodies
- The warzone panel's ancestor chain resolves to `body { font-family: 'Verdana', 'Segoe UI', sans-serif }`
- The multiplayer panel's ancestor chain resolves to `.mp-screen { font-family: 'Courier New', monospace }` (applied to `#pvp-hangar` at runtime)

**Minimal fix:** Add `font-family: var(--font-mono)` to `.hg-stat-label` and `.hg-stat-val` in `css/garage.css`. Two-line change. No JS changes needed.
