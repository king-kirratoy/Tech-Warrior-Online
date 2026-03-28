# Tech Warrior Online — Session Summary
## March 27, 2026

### Overview
Massive session focused primarily on designing, building, and implementing the per-chassis skill tree system for campaign mode. Also covered skill tree editor tool creation, map editor tool creation, and tech-warrior skill file rewrite.

---

### SKILL TREE — COMPLETE SYSTEM BUILT

**Design Evolution:**
- Started with 200-node constellation design (too complex for Claude Code)
- Simplified to ~60 nodes with multi-rank system (3-5 ranks per node)
- Final design settled at 193 nodes per chassis after Zac's editor work
- 13 keystones, 11 notables, 168 regular nodes, 1 start node
- ~360 total rank sinks per tree, player gets 100 points (~28% fillable)
- Multi-rank: regular nodes have 1-2 ranks, notables 1, keystones 1

**Skill Tree Editor App (skill-tree-editor.html):**
- Built standalone HTML app for designing skill trees
- Pan/zoom canvas, grid snap, SELECT/CONNECT modes
- Node property editing: name, type, ranks, description, connections
- Export/Import JSON for passing data between editor and game
- Multiple iterations on connection clicking — final version uses proximity-based detection on canvas click
- Right-click to cancel in-progress connections
- Opaque node fills matching game aesthetic
- Notable/keystone labels: smaller font with word wrap to show full names
- NEW TREE button, starts empty (use IMPORT for existing data)
- Removed 's' (stat display) field — only description field used now
- Default format: value-first (+10 All Parts HP)

**All Three Chassis Trees Completed:**

Light Chassis:
- Weapons: SMG, Shotgun, Flamethrower, Siphon
- CPU Mods: Jump (Meteor Strike), Ghost Step (Ghost Protocol), Barrier (Stasis Field), Decoy (Doppelganger)
- Additional keystones: Executioner, Phantom, Overclock, Glass Cannon, Iron Steel, Blessed Shield

Medium Chassis:
- Weapons: Machine Gun (Lead Storm), Battle Rifle (Deadeye), Sniper Rifle (One Shot One Kill), Railgun (Armor Piercer)
- CPU Mods: Rage (Berserker), Attack Drone (Drone Swarm), Barrier (Stasis Field), Repair Drone (Guardian Angel)
- Shared keystones: Executioner, Phantom, Overclock, Glass Cannon, Iron Steel, Blessed Shield

Heavy Chassis:
- Weapons: Heavy Rifle (Heavy Barrage), Rocket Launcher (Bombardment), Plasma Cannon (Plasma Storm), Grenade Launcher (Carpet Bomb)
- CPU Mods: Missile (Missile Barrage), Fortress Mode (Iron Fortress), Barrier (Stasis Field), EMP Burst (EMP Overload)
- Shared keystones: Executioner, Phantom, Overclock, Glass Cannon, Iron Steel, Blessed Shield

**Implementation (Claude Code prompts written/run):**
- Part A: Data file, overlay container, pan/zoom canvas, button wiring
- Part B: Node rendering, hover cards, click allocation, save/load, bonus application
- Additional prompts for: title color, chassis text positioning, node color changes (remove "available" state, allocated regulars use cyan), opaque node fills, hover card redesign, zoom button removal, undo/redo while on screen (lock on exit), auto-save on all campaign changes, stat stacking in hover cards, abbreviation replacements, value-first format, red text for negatives, node icons, icon sizing, muted icons when unallocated, GEAR/SKILL BONUSES display, Medium chassis addition, Heavy chassis addition

**Skill Tree UI Decisions:**
- [COMPLETED] No "available" visual state — all unselected nodes look locked/dim
- [COMPLETED] Allocated regular nodes use cyan, notables keep orange, keystones keep purple
- [COMPLETED] Hover card: NAME (caps, orange) → RANK → divider → description (green, stacked stats)
- [COMPLETED] Value-first format: "+2% Damage" not "Damage +2%"
- [COMPLETED] Red text (#cc2222 or matching game's loadout red) for negative values
- [COMPLETED] Abbreviations spelled out (FTH→Flamethrower, SG→Shotgun, etc.) except SMG, HP, AOE, REGEN
- [COMPLETED] Opaque node fills, not transparent
- [COMPLETED] Small SVG icons inside regular nodes (HP cross, shield, crit star, damage arrow, speed bolt, etc.)
- [COMPLETED] Icons muted gray when unallocated, vivid color when allocated
- [COMPLETED] Notable/keystone text: smaller font with word wrap showing full name
- [COMPLETED] Removed zoom +/- buttons (scroll wheel sufficient)
- [COMPLETED] Removed "CLICK TO ALLOCATE" action text from hover card
- [COMPLETED] Removed stat display ('s') field — description only
- [COMPLETED] Stats stacked vertically (split on commas)
- [COMPLETED] Cooldown/heat reductions display as positive (+2% Mod Cooldown not -2%)
- [COMPLETED] Periods replaced with commas in multi-stat descriptions
- [COMPLETED] GEAR BONUSES → GEAR / SKILL BONUSES in campaign loadout
- [COMPLETED] Undo/redo while on screen, lock allocations on exit
- [COMPLETED] Auto-save on every campaign change (debounced)

**Data Format (final):**
```
{id, x, y, t (type), n (name), d (description), r (max ranks), c (connections array), i (icon type - regular nodes only)}
```
No 's' (stat display) field. Icon types: hp, shield, shield_regen, crit, crit_dmg, damage, speed, fire_rate, dodge, dr, mod_cd, augment, heat, smg, flamethrower, shotgun, siphon

**Known Issues:**
- Railgun nodes say "Charge Speed" — not a real game mechanic, needs replacing
- Sniper Rifle "Headshot Damage" — not applicable to top-down game, needs replacing
- Heavy chassis missing node icons (prompt written, needs running)
- Medium chassis may also be missing icons on generic nodes
- Assassin's Eye notable updated to +10% Crit Chance, +20% Crit Damage

---

### MAP EDITOR — BUILT

**map-editor.html created:**
- Tile-based grid editor for designing battlefields
- Configurable world size (default 4000) and tile size (default 40)
- Three modes: PLACE, SELECT, ERASE
- Palette categories: Terrain, Cover, Spawns & Markers
- Cover objects match game's COVER_DEFS: rocks (S/M/L), walls (H/V/short), crates, buildings (S/M/L/ruin), breakable walls, exploding barrels
- Markers: player spawn, enemy spawn, boss spawn, objective, loot crate, waypoint
- Pan (alt+drag or middle mouse), zoom (scroll wheel)
- Object properties: resize, HP, label editing
- Export/Import JSON
- Grid snapping, status bar with mouse/tile coordinates

**Enemy Spawn System Analysis:**
- Current system: fully random within distance constraints (1200+ from center, 900+ from player)
- Bosses: random 1100+ from player
- No predefined spawn points currently
- DECISION: Switch to map-defined spawn points for both campaign and warzone
  - 10-20 spawn zones per map, enemies randomly pick from them
  - Random selection from available zones each wave
  - Player spawn defined in map data, defaults to center
  - Implementation deferred — current random system works with any map layout

---

### SHIELD BUG — PROMPT WRITTEN

- New campaigns start without shields (set to 'none' from item removal pass)
- HUD shows "none" for defense even when shield is equipped from loot
- Shield functionally works (blocking damage) — display bug only
- Prompt written to investigate and fix both issues

---

### TECH-WARRIOR SKILL FILE — REWRITTEN

**Old version:** ~400 lines with hardcoded game values that go stale quickly
**New version:** ~130 lines focused on stable architectural rules

**Kept:**
- Slot key distinction table (biggest gotcha)
- CSS namespace rules
- 18 architectural rules (Phaser groups, cover origin, arenaState, etc.)
- UI conventions
- Version tracking

**Removed:**
- All exact chassis stats, weapon lists, shield lists
- Starter loadouts, enemy HP formulas
- Anything that changes between sessions

**Added:**
- "Always read CLAUDE.md, OVERVIEW.md, and UI_CONVENTIONS from the repo first" as #1 instruction
- These living documents are the source of truth, not the skill file

---

### FILES CREATED THIS SESSION

| File | Purpose |
|------|---------|
| skill-tree-editor.html | Standalone skill tree layout editor (multiple versions) |
| LIGHT_SKILL_TREE_DATA_FINAL_v3.json | Light chassis tree (193 nodes, no 's' field, value-first, abbreviations spelled out) |
| MEDIUM_SKILL_TREE_DATA.json | Medium chassis tree (cloned from Light, weapons/mods swapped) |
| HEAVY_SKILL_TREE_DATA.json | Heavy chassis tree (cloned from Medium, weapons/mods swapped) |
| map-editor.html | Tile-based battlefield/map design editor |
| SKILL.md | Rewritten tech-warrior skill (lean, structural rules only) |

### FILES TO REMOVE FROM REPO
- LIGHT_SKILL_TREE.md, MEDIUM_SKILL_TREE.md, HEAVY_SKILL_TREE.md (old design docs, replaced by data files)
- LIGHT_SKILL_TREE_DATA_FINAL.json (old version, replaced by v3 and game's skill-tree-data.js)
- MEDIUM_SKILL_TREE_DATA.json, HEAVY_SKILL_TREE_DATA.json (data now lives in js/skill-tree-data.js)

---
---

## Continuation Session — March 27, 2026 (Evening)

### Overview
Focused on map editor enhancements, skill tree respec system, campaign bug fixes (stat display, hover cards, item comparisons), and UI brainstorming for item comparison card borders.

---

### MAP EDITOR — ENHANCEMENTS

**Resize Handles Added:**
- 8 resize handles (4 corners + 4 edge midpoints) appear on selected cover objects in SELECT mode
- Drag handles to resize objects, snaps to tile grid
- Minimum size enforced: 1 tile in either dimension
- Cursor changes to appropriate resize arrow on hover (ns, ew, nwse, nesw)
- Properties panel W×H values update live during drag
- Markers (circles) excluded — resize handles only appear on rectangular cover objects

**Procedural Building Generator Added:**
- GENERATE button in toolbar with size dropdown (SM/MD/LG) and color picker for base color
- Spawns a single grouped building object at center of current view
- Each click produces a unique randomized combination of rooftop details (top-down view):
  - HVAC vents (louvered rectangles with louver lines)
  - Exhaust fans (concentric circles with hub)
  - Skylights (glass panels with cross-dividers)
  - Antenna/comms dishes (rings with signal indicators and stubs)
  - Piping runs (horizontal/vertical lines with joint circles)
  - Access hatches (square hatches with handle lines)
  - Structural seams (horizontal/vertical roof section lines)
  - Corner pylons (reinforcement blocks at corners)
- Detail colors derived from base color (darker/lighter shades) for cohesion
- Buildings render as single grouped objects — move, resize, select as one piece
- Details stored in `obj.details` array, exported/imported with full fidelity
- At least 2 detail types guaranteed per generation

**Top-Down Building Design Decisions:**
- Pure rooftop view — no doors, windows, or side-wall details visible from birds-eye perspective
- Rooftop features only: HVAC, exhaust fans, skylights, antenna, piping, hatches, seams, pylons
- Dark sci-fi color palette matching game aesthetic

**Full Map Rendering Demo:**
- Rendered a complete industrial compound map inspired by a CoD-style reference image
- ~30+ structures: warehouses, command center, hangars, reactors, bunkers, supply depots, fuel tanks, water towers, guard posts, barricade walls, bridges
- All using rooftop-view details (no doors)

---

### SKILL TREE — RESPEC SYSTEM (v7.09)

**Design Decisions:**
- Free respec — no cost, available anytime the skill tree screen is open
- Left-click = allocate, Right-click = de-allocate
- Path validation: can only de-allocate if removing the node wouldn't disconnect other allocated nodes from START
- "Peel from the edges" system — only leaf nodes at the outer edge of your build can be removed
- Multi-rank nodes: ranks > 1 can always be reduced; last rank triggers connectivity check
- Blocked de-allocation shows status message: "Cannot remove — other nodes depend on this path"

**Implementation Results (Claude Code):**
- `_canDeallocate()` BFS flood-fill already existed — no changes needed
- Removed `_lockedAllocations` finalization mechanism from `showSkillTree()` and `hideSkillTree()`
- New `_deallocateNode(nodeId)` function for right-click de-allocation
- New `_stShowStatusMsg(msg)` for blocked removal feedback (flashes 2.5s)
- `contextmenu` listeners added to node groups and SVG canvas
- Orange hover highlight (#ff9933) on nodes that can be de-allocated
- Save format unchanged — `_skillTreeState.allocated` still `{ nodeId: rank }`

---

### CAMPAIGN BUG FIXES

**HUD Element Positioning (v7.10+):**
- Mission objective text and boss HP bar were offset too far down from top of screen
- Root cause: shared parent container padding/positioning
- Fixed to be near top edge with 10-14px breathing room (not flush)

**Boss Unique Item Stat Display Bugs (v7.11–v7.13):**
- Fire Rate % base stat showing green instead of cyan blue (color issue)
- Arm HP showing "38" without + sign while Fire Rate showed "+12%" (inconsistency)
- Affix section showing "-12% Fire Rate" instead of "+12% Fire Rate" (inverted display)
- Backpack slot border changing from orange to purple on hover (should stay orange with glow)
- Root causes: boss unique items bypassed the display formatting pipeline that regular loot uses
- v7.11: Fixed affix prefix generation and base stats display for unique items
- v7.13: Fixed two boss unique items with wrong internal sign values:
  - `echo_frame.baseStats.fireRatePct`: 5 → -5
  - `core_reactor.baseStats.modCdPct`: 12 → -12
  - `hive_mind` and `core_reactor` affix template labels corrected
- All 16 boss unique items audited — no other fireRatePct/modCdPct issues found

**Damage Reduction % Display Bug:**
- GEAR / SKILL BONUSES section showing "+800%" instead of "+8%"
- Root cause: value stored as percentage integer (8) but display multiplying by 100 again
- Prompt written and run to trace value through full pipeline and fix ×100 duplication

**Heavy Chassis Skill Tree Missing Icons:**
- Heavy tree nodes not showing icons that Light and Medium have
- Prompt written to diagnose and fix — likely icon field missing/empty in Heavy data

---

### ITEM COMPARISON SYSTEM — BUGS & IMPROVEMENTS

**Missing Comparison Bug (prompt written):**
- Some items don't trigger the comparison card when hovered
- Known case: Epic SMG equipped + Rare SMG in backpack → no comparison shown
- Reverse (Rare equipped, hover Epic) works fine
- Likely caused by equipped slot lookup logic or rarity-based filtering
- Added to comparison improvement prompt for investigation

**Affix Stats Not Included in Comparison (prompt written):**
- "CHANGES IF EQUIPPED" section only compares base stats, ignores green affix bonuses
- Decision: show net totals combining base + affix stats into single line per stat
- Example: item with +5% DMG base and +5% DMG affix = 10% total used for comparison
- Prompt written to fix both issues in one session

---

### ITEM HOVER CARD BORDER — UI BRAINSTORM

**Mockups Created (chat-only, not implemented):**
- Explored multiple border color approaches for comparison hover cards
- All mockups used game's dark sci-fi aesthetic with Courier New

**Options Explored:**
- Option A: Full rarity borders on both cards (purple left, blue right)
- Option B: Shared border, split colors meeting at center divider
- Option C: Full borders + subtle background tint per rarity
- Option D: Neutral border, rarity accent bar in header only
- No-border version: neutral borders, only BACKPACK/EQUIPPED label text colored by rarity
- Full 4-sided borders on both cards (both cards get complete borders, touching in center)
- Split-rarity bottom border (each item's color flows down sides and meets at bottom center)
- Comparison section with no top border (6 color variations tested: cyan, white, yellow/gold, split rarity, dim cyan, subtle gray)

**Final Decision:**
- Reverted to NO rarity-colored borders on item cards
- Comparison section uses neutral border matching its text color
- BACKPACK/EQUIPPED/SHOP label text colored by item's rarity (from RARITY_DEFS[item.rarity].colorStr)
- Rarity name text below item name also uses rarity color
- Prompt written and run to implement this approach

---

### PROMPTS WRITTEN THIS SESSION

| Prompt | Status | Version |
|--------|--------|---------|
| Skill tree respec (de-allocation with path validation) | Run ✓ | v7.09 |
| HUD element positioning (objective + boss HP bar) | Run ✓ | — |
| Boss unique stat display bugs (3 bugs + audit) | Run ✓ | v7.11 |
| Fire Rate sign fix (revert wrong direction) | Run ✓ | v7.13 |
| Damage Reduction ×100 display bug | Run ✓ | — |
| Hover card rarity border (single item) | Written | — |
| Comparison card rarity borders (Option D split) | Run ✓ | — |
| Revert comparison borders to neutral + rarity label text | Run ✓ | — |
| Heavy chassis missing skill tree icons | Written | — |
| Item comparison: affix stats + missing comparison bug | Written | — |

---

### FILES UPDATED THIS SESSION

| File | Changes |
|------|---------|
| map-editor.html | Added resize handles (8-point), procedural building generator with rooftop details |
| js/skill-tree.js | Removed allocation locking, added de-allocation with path validation, right-click support |
| js/loot-system.js | Fixed boss unique item stat signs (echo_frame, core_reactor), affix template labels |
| js/menus.js | Hover card border changes (rarity borders → reverted to neutral), comparison card updates |
| css/hud.css | Mission objective and boss HP bar positioning fixes |
