# Tech Warrior Online — OVERVIEW

> A browser-based top-down mech shooter built with Phaser 3.60.0. Players choose a chassis, build a loadout in the Hangar, then deploy into wave-based combat. **Warzone** is a roguelike run-and-die loop (`_gameMode='simulation'`); **Campaign** is persistent with XP/levels/missions/shop (`_gameMode='campaign'`); **Multiplayer** is real-time PVP via Socket.IO (`_gameMode='pvp'`).

---

## File Map

| File | Purpose |
|------|---------|
| `index.html` | HTML shell with all screen divs and canonical `<script>` load order; no inline scripts or styles. `boss-hud` is a sibling of `round-hud` (not nested inside it) so campaign mode hiding `round-hud` does not affect the boss HP bar. `objective-hud` is anchored `top:68px;left:16px` — top-left corner, below the pause button row. |
| `css/base.css` | Design tokens (legacy brand + sci-fi UI palette), `--font-mono`, glow/button geometry tokens, `.tw-btn` system, and universal reset. |
| `css/hud.css` | In-game HUD styles: console frame, paper doll, weapon bar rows, and HUD-specific color tokens. |
| `css/garage.css` | Hangar UI, perk cards, stats panel, dropdown system, and the full `.lo-*` loadout overlay class family. |
| `css/menus.css` | Main menu, pause, callsign, leaderboard, PVP hangar, multiplayer lobby, death screen, warzone perks overlay, drag-and-drop, chassis selector cards, and typography utilities. `.mm-right` uses `justify-content: center` so the pilot stats panel is vertically centered, matching the left side. |
| `js/constants.js` | All immutable game data: chassis, weapons (including `siphon` beam weapon — added to `WEAPON_OPTIONS` in v6.69 so it appears in warzone/PVP dropdowns), shields (11 total: 4 light, 4 medium including `fortress_shield`, 3 heavy), augments (12 total: none + 11 active — 20 removed in v6.68), legs (13 total: 5 universal + 3 light + 3 medium + 2 heavy), cover, arenas, enemy color palettes, restriction Sets (`CHASSIS_LEGS`: light=hydraulic_boost/seismic_dampener/featherweight/ghost_legs, medium=gyro_stabilizer/mine_layer/sprint_boosters/reactor_legs, heavy=mag_anchors/tremor_legs/suppressor_legs/warlord_stride; `CHASSIS_AUGS`: light=threat_analyzer/ballistic_weave/neural_accel/thermal_core, medium=target_painter/overclock_cpu/multi_drone/field_processor, heavy=reactive_plating/war_machine/suppressor_aura/heavy_loader), starter loadouts, `SLOT_ID_MAP`, and `GAME_CONFIG`. `EXPLOSIVE_KEYS` removed in v6.76 (dual-explosive warning removed). |
| `js/state.js` | All mutable runtime globals: Phaser object refs, game-mode flags, round/combat state, `loadout`, `_perkState`, extraction state, loot pickups, and leaderboard run state. |
| `js/utils.js` | Pure helpers: color utilities, chassis HP calculation, HUD name lookup, and visual FX spawners (damage text, sparks, muzzle flash, debris, footprint). |
| `js/audio.js` | Web Audio API synthesizer with 27 sound functions, throttle/node-cap system, and first-gesture/tab-visibility lifecycle. Siphon beam sounds: persistent hum (`sndSiphonBeamStart/Update/Stop`) with triangle oscillator (80–120 Hz, heat-driven pitch) and 2.5 Hz LFO pulse; overheat buzz (`sndSiphonOverheat`). |
| `js/mechs.js` | Mech construction, per-frame visual sync, chassis movement effects, rage ghosts, and spectre clone logic. Spectre clone (`_spawnSpectreClone`): Container-based shadow clone with 16ms drift timer (moves toward nearest enemy at 75 px/s), 1s fire timer (cloned bullets into `bullets` group at 50% dmg), 4s expiry. Tint applied via child iteration (`list.forEach`) — Container has no native `setTint` in Phaser 3.60. |
| `js/cover.js` | Cover placement, battlefield generation, and cover damage/destruction. |
| `js/combat.js` | All weapon firing functions, damage processing, shield absorption, area effects, mine mechanics, and siphon beam logic (`fireSIPHON`, `updateSiphonBeam`, `_clearAllSiphonSlows`, `_clearSiphonSlows`, `_siphonBeamHide`, `_drawSiphonBeam`). Beam rendering: per-arm Phaser Graphics objects (`_siphonGfxL`/`_siphonGfxR`), per-arm heat state (`player._siphonHeatL/R`, `player._siphonOverheatL/R`, `player._siphonFiringL/R`); dual-arm supported — two independent beams drawn when both arms have siphon, slow does not double-stack, heal stacks from both; green heal float numbers above player (throttled 500ms). Layered shield: `_applyPassiveShieldAbsorption` drains Layer 1 then Layer 2 at 1:1 rate; spillover goes to HP; `_applyShieldRegen` regens each layer independently via `player._layer1LastDamageTime` / `player._layer2LastDamageTime`. Tremor Legs: `_triggerTremor(scene)` fires AOE (40 dmg, 120px) while moving, supports all tl* perks. |
| `js/mods.js` | All 18 mod-activation functions, drone builder helpers, and augment/leg application. |
| `js/perks.js` | Master perk dictionary (~400+ entries), perk pool selection, perk menu render/pick, equip prompt, and per-round perk reset. |
| `js/enemies.js` | Enemy spawning, full AI state machine, enemy firing, 8 boss spawners, and DOM boss HP bar helpers. |
| `js/rounds.js` | Round init, enemy spawn dispatch, kill tracking, extraction point system, and round banner. |
| `js/hud.js` | All HUD update functions: weapon slots, HP/shield bars, paper doll, minimap, cooldown overlays, crosshair, HUD reset. Siphon heat is shown inline in the L ARM / R ARM weapon bar rows (heat %, color-coded green→yellow→red, OVERHEAT pulse) via `_updateBarRow()` per-arm heat logic; the separate HEAT row was removed in v6.71. Layered shield: `updateBars()` renders a subtle cyan divider at 50% of the shield bar via CSS gradient on the `.wr-bar-bg` container. |
| `js/garage.js` | Warzone hangar UI: dropdown system, slot selection (dual-wield for light; no duplicate weapons for medium/heavy), and full hangar renderer. |
| `js/menus.js` | All menu and overlay logic: main menu, hangar nav, death screen, pause, loadout overlay, hover card system, inventory management, leaderboard, and game cleanup. `_renderGearBonusesPanel()` merges skill tree bonuses into gear bonuses display in campaign mode (v6.94); header shows "GEAR / SKILL BONUSES" in campaign, "GEAR BONUSES" otherwise. `_equipItemToSlot()` and `_unequipItem()` call `debouncedCampaignSave()` in campaign mode to persist loadout changes (v6.95). |
| `js/loot-system.js` | ARPG loot layer: item generation, rarity/affix system, inventory/equipment management, ground drops (campaign only), unique item effects, campaign cloud save, and save migration arrays (`REMOVED_SHIELDS`, `REMOVED_LEGS`, `REMOVED_AUGMENTS`). `debouncedCampaignSave()` added in v6.95: coalesces rapid `saveCampaignProgress()` calls (skill clicks, drag-and-drop) into one write per 500ms. |
| `js/enemy-types.js` | Special enemy type definitions (`ENEMY_TYPE_DEFS`), elite modifier system (`ELITE_MODIFIERS`), and all type/modifier lifecycle functions. |
| `js/arena-objectives.js` | Arena layout generators (4 arenas), objective system (4 types), lifecycle functions, and `_arenaState` export. |
| `js/campaign-system.js` | Campaign missions, XP system, mission modifiers, enemy composition, campaign flow, localStorage save/load, mission select overlay, supply shop, and loadout slots. Skill Tree button wired to `showSkillTree()` in v6.89. `_shopRestock()` now calls `saveInventory()` after deducting scrap (v6.95). |
| `js/skill-tree-data.js` | `SKILL_TREE_DATA` constant wrapping the light chassis skill tree as a JSON array of 193 nodes (id, x, y, t, n, d, s, r, c). Added in v6.89. Node text updated in v6.96: all abbreviations in n/d/s fields expanded to full form (FTH→Flamethrower, SG→Shotgun, CD→Cooldown, FR→Fire Rate, DR→Damage Reduction). Updated in v6.98: all node description (d) fields flipped to value-first format (e.g. "+2% Damage" instead of "Damage +2%"); multi-stat descriptions have each part flipped individually. Updated in v6.99: all heat and cooldown reduction stats (SMG/Flamethrower/Siphon/Invis/Barrier/Jump Heat/Cooldown, Mod Cooldown) flipped from negative to positive display (e.g. "-5% SMG Heat" → "+5% SMG Heat") in both d and s fields — these are buffs, not penalties; only the Glass Cannon keystone "-30 All Parts HP" remains negative as a true penalty. Updated in v7.02: `i` (icon) field added to all 168 regular nodes, mapping stat type to icon key (hp, shield, shield_regen, crit, crit_dmg, damage, speed, fire_rate, dodge, dr, mod_cd, augment, smg, flamethrower, shotgun, siphon, heat). |
| `js/skill-tree.js` | Skill tree overlay: `showSkillTree()` / `hideSkillTree()`, pan/zoom SVG canvas (mouse-wheel zoom only), bottom legend, `_renderSkillTree()` (SVG connection lines + hex node polygons + start-node chassis image), hover card (name/rank/description), click-to-allocate/deallocate (`_allocateNode()`), `getSkillTreeBonuses()` with stat-string parser. `_skillTreeState`, `_lockedAllocations`, `_stNodeMap`, `_skillTreeVB`, `_canDeallocate()`, pan/zoom helpers. Updated in v6.91 (start-node image, hover card redesign, undo-while-open/lock-on-exit). Updated in v6.92: title color changed to #00d4ff; chassis/level sub-text moved into top bar (no separate bar); node colors: allocated regular nodes now cyan (#00d4ff), no "available" visual distinction (all unallocated nodes use locked/dim appearance), connection lines cyan when both allocated else dim; legend updated (AVAILABLE removed, ALLOCATED=cyan, NOTABLE=orange, KEYSTONE=purple). Updated in v6.93: node fills changed to solid dark colors (opaque hex values instead of rgba with low alpha); hover card now shows node description (d field) below the divider instead of stat shorthand (s field) — omitted if empty. `getSkillTreeBonuses()` output merged into loadout overlay gear bonuses panel in v6.94. Auto-save on every node allocation/deallocation via `debouncedCampaignSave()` (v6.95); `hideSkillTree()` also calls `saveCampaignProgress()` on lock-in. Updated in v6.96: hover card splits multi-stat descriptions on commas, each stat on its own line (4-6px gap); `_parseSkillStatString` patterns updated to match expanded weapon/stat names (Flamethrower, Shotgun, Fire Rate, Damage Reduction). Updated in v6.97: keystone and notable node labels now use SVG tspan word wrap to display full names without truncation; font sizes reduced by 1px (keystone: 6→5, notable: 5.5→4.5); lines vertically centered in hex using lineHeight=fontSize×1.3. Updated in v6.98: hover card stat lines starting with "-" rendered in red (#cc2222); relies on value-first description format. Updated in v7.02: `_drawNodeIcon(g, iconType, cx, cy, state)` added — renders a small SVG icon centered in the upper portion of regular hex nodes (y offset −4); rank text moved to lower portion (y offset +7, font-size 5px); allocated icons render at opacity 0.9, locked at 0.5; 15 icon types defined (hp, shield, shield_regen, crit, crit_dmg, damage, speed, fire_rate, dodge, dr, mod_cd, augment, smg, flamethrower, shotgun, siphon, heat). Updated in v7.03: icon group transform changed from `translate(cx,cy)` to `translate(cx,cy) scale(1.5)` — all icons enlarged by 50% for better visibility. |
| `js/multiplayer.js` | PVP matchmaking via Socket.IO: connection, remote players, per-frame sync, lobby, PVP HUD, chat, kill feed, respawn, match results, and PVP hangar. |
| `js/events.js` | All top-level global event listeners: resize, click, keydown (all game states), main-menu key nav, player movement/firing, and inventory drag-and-drop. Tremor Legs timer: fires `_triggerTremor` every 500ms (250ms with tlCd) while velocity > 20; resets timer when stationary. |
| `js/init.js` | Game startup: animated grid canvas, callsign handlers, Phaser scene lifecycle (`preload`/`create`/`update`), objective round-end polling, and `window.onload` bootstrap. |

**Script load order (bottom of `<body>`):**
```
phaser.min.js → constants.js → state.js → utils.js → audio.js → mechs.js → cover.js → combat.js → mods.js → perks.js → enemies.js → rounds.js → hud.js → garage.js → menus.js → loot-system.js → enemy-types.js → arena-objectives.js → campaign-system.js → skill-tree-data.js → skill-tree.js → socket.io.min.js → multiplayer.js → events.js → init.js
```

---

## HUD Element IDs Reference

```
slot-L/R/M/S         txt-L/R/M/S          wr-fill-L/R/M/S      wr-st-L/R/M/S
slot-leg-wrap        txt-G
round-hud            round-num            round-remaining       round-kills
boss-hud             boss-bar-fill        boss-bar-name
doll-head            doll-core            doll-lArm             doll-rArm
doll-lShoulder       doll-rShoulder       doll-lLeg             doll-rLeg
minimap-canvas       enemy-doll-hud       edoll-label
stats-overlay        pause-overlay        death-screen          perk-menu
```

---

## Display Conventions

See UI_CONVENTIONS.md for slot label naming (§5), rarity colors (§3), inverted stats (§4), and general color semantics (§3).

---

## Naming Conventions & Patterns

- **Global state variables:** underscore prefix — `_round`, `_perkState`, `_gearState`, `_inventory`, `_equipped`
- **Boolean flags:** `isDeployed`, `isJumping`, `isShieldActive`, `isRageActive`, `_roundActive`, `_extractionActive`
- **Private helpers:** underscore prefix — `_healPlayerFull()`, `_resetHUDState()`, `_cleanupGame()`
- **DOM element IDs:** kebab-case — `round-hud`, `hud-container`, `boss-hud`, `enemy-doll-hud`
- **Slot IDs in garage dropdown:** single uppercase letter — `L` `R` `M` (cpu) `A` (aug) `G` (leg) `S` (shield) `C` (color)
- **Slot keys in `loadout`:** `L` `R` `cpu` `aug` `leg` `shld` (note: `shld` not `shield`)
- **Slot keys in `_equipped`:** different again — `L` `R` `armor` `arms` `legs` `shield` `cpu` `augment`
- **Garage slot ID → loadout key:** use `SLOT_ID_MAP` constant: `{ L:'L', R:'R', M:'cpu', A:'aug', G:'leg', S:'shld' }`. `_equipped` uses a different set: `{ L, R, armor, arms, legs, shield, cpu, augment }`.
- **`selectPerks()`:** pure perk selection (no DOM). Call before `showPerkMenu()` renders cards.
- **`destroyEnemyWithCleanup(scene, e)`:** centralised enemy teardown. Use wherever enemies are force-removed outside the normal damage path.
- **Enemy color palettes:** `ENEMY_COLORS`, `COMMANDER_COLORS`, `MEDIC_COLORS`, `BOSS_COLORS` (all keyed by chassis/type)
- **typeof guards:** External JS functions are always called with `typeof fn === 'function'` guards to survive file load failures
- **`UI_COLORS` const in `js/menus.js`:** mirrors CSS tokens for use in JS template literal inline styles — keeps inline colors consistent with CSS variables without needing `getComputedStyle`
