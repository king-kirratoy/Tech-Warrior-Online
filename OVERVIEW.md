# Tech Warrior Online — OVERVIEW

> A browser-based top-down mech shooter built with Phaser 3.60.0. Players choose a chassis, build a loadout in the Hangar, then deploy into wave-based combat. **Warzone** is a roguelike run-and-die loop (`_gameMode='simulation'`); **Campaign** is persistent with XP/levels/missions/shop (`_gameMode='campaign'`); **Multiplayer** is real-time PVP via Socket.IO (`_gameMode='pvp'`).

---

## File Map

| File | Purpose |
|------|---------|
| `index.html` | HTML shell with all screen divs and canonical `<script>` load order; no inline scripts or styles. `boss-hud` and `objective-hud` are top-anchored siblings of `round-hud`. HUD labels: "MOD" for CPU mod row, "SHIELD" for shield row. |
| `css/base.css` | Design tokens (legacy brand + sci-fi UI palette), `--font-mono`, glow/button geometry tokens, `.tw-btn` system, and universal reset. |
| `css/hud.css` | In-game HUD styles: console frame, paper doll, weapon bar rows, and HUD-specific color tokens. |
| `css/garage.css` | Hangar UI, perk cards, stats panel, dropdown system, and the full `.lo-*` loadout overlay class family. |
| `css/menus.css` | Main menu, pause, callsign, leaderboard, PVP hangar, multiplayer lobby, death screen, warzone perks overlay, drag-and-drop, and chassis selector styles. |
| `js/constants.js` | All immutable game data: chassis (with trait definitions), weapons, shields, augments, legs, cover, arenas, enemy color palettes, chassis restriction Sets (`CHASSIS_LEGS`, `CHASSIS_AUGS`, `CHASSIS_WEAPONS`, `CHASSIS_CPUS`), starter loadouts, `SLOT_ID_MAP`, `GAME_CONFIG`, `COLOR_OPTIONS`, `CROSSHAIR_COLOR_OPTIONS`, and `GAME_VERSION`. |
| `js/state.js` | All mutable runtime globals: Phaser object refs, game-mode flags, round/combat state, `loadout`, `_perkState`, extraction state, loot pickups, and leaderboard run state. |
| `js/utils.js` | Pure helpers: color utilities, chassis HP calculation, HUD name lookup, and visual FX spawners (damage text, sparks, muzzle flash, debris, footprint). |
| `js/audio.js` | Web Audio API synthesizer with 29+ sound functions, throttle/node-cap system, and first-gesture/tab-visibility lifecycle. |
| `js/mechs.js` | Mech construction, per-frame visual sync, chassis movement effects, rage ghosts, spectre clone logic, and Shield Specialist absorb calculation. |
| `js/cover.js` | Cover placement, battlefield generation, and cover damage/destruction. |
| `js/combat.js` | All weapon firing functions, damage processing, shield absorption, area effects, mine mechanics, siphon beam logic, and keystone trait combat effects. Cover collision is per-weapon-type: group collider for standard projectiles, per-object collider for rockets/grenades, hitscan raycast for rail/siphon. |
| `js/mods.js` | All mod-activation functions, drone builder helpers, and augment/leg application. Mod Specialist trait applies duration bonus via `CHASSIS.medium.modDurationMult`. |
| `js/perks.js` | Master perk dictionary, perk pool selection, perk menu render/pick, equip prompt, and per-round perk reset. Perk keys must match their `cat` prefix (see CLAUDE.md). |
| `js/enemies.js` | Enemy spawning, full AI state machine, enemy firing, 8 boss spawners, and DOM boss HP bar helpers. |
| `js/rounds.js` | Round init, enemy spawn dispatch, kill tracking, extraction point system, and round banner. |
| `js/hud.js` | All HUD update functions: weapon slots, HP/shield bars, paper doll, minimap, cooldown overlays, crosshair, and HUD reset. |
| `js/garage.js` | Warzone hangar UI: dropdown system, slot selection logic (dual-wield for light; no duplicate weapons for medium/heavy), and the full hangar renderer with 3-column layout. Reads skill-tree keystones to apply stat modifiers. |
| `js/menus.js` | All menu and overlay logic: main menu, hangar nav, death screen, pause, loadout overlay, hover card system, inventory management, leaderboard, and game cleanup. `populateLoadout()` is the single render entry point (see CLAUDE.md §4). Drag-and-drop uses `window._dragActiveItem` as the transfer object; hover highlights are applied per-slot on `dragenter`. |
| `js/loot-system.js` | ARPG loot layer: item generation, rarity/affix system, inventory/equipment management, ground drops (campaign only), unique item effects, campaign cloud save, and save migration. `RARITY_DEFS`, `AFFIX_POOLS`, and `LEGENDARY_TRAITS` are the key data structures. Weapon/CPU mod drops always chassis-filtered; shields/legs/augs filtered for field drops only (see CLAUDE.md §2). |
| `js/enemy-types.js` | Special enemy type definitions (`ENEMY_TYPE_DEFS`), elite modifier system (`ELITE_MODIFIERS`), and all type/modifier lifecycle functions. |
| `js/arena-objectives.js` | Arena layout generators (4 arenas), objective system (4 types), lifecycle functions, and `_arenaState` export. |
| `js/campaign-system.js` | Campaign missions, XP system, mission modifiers, enemy composition, campaign flow, localStorage save/load, mission select overlay, and supply shop. Shop generates items via `generateItem({ isShop: true })`; interaction is right-click only (buy/sell), no confirmation panels. |
| `js/skill-tree-data.js` | `SKILL_TREE_DATA` constant with chassis-keyed skill trees (light, medium, heavy), 193 nodes each including 39 keystones. Node objects hold id, position, type, stats, requirements, and icon data. |
| `js/skill-tree.js` | Skill tree overlay: pan/zoom SVG canvas with hex nodes, hover card, click-to-allocate/deallocate with BFS disconnect check. `getSkillTreeBonuses()` parses node stat strings. Free respec; auto-save on allocation changes. |
| `js/multiplayer.js` | PVP matchmaking via Socket.IO: connection, remote players, per-frame sync, lobby, PVP HUD, chat, kill feed, respawn, match results, and PVP hangar. PVP hangar mirrors the warzone hangar layout and shares `_buildSlotDetails` for weapon stats. |
| `js/events.js` | All top-level global event listeners: resize, click, keydown, player movement/firing, and inventory drag-and-drop. Handles chassis trait movement modifiers, effective mod cooldown formula, and Tremor Legs timer. |
| `js/init.js` | Game startup: animated grid canvas, callsign handlers, Phaser scene lifecycle (`preload`/`create`/`update`), objective round-end polling, and `window.onload` bootstrap. |

**Script load order (bottom of `<body>`):**
```
phaser.min.js → constants.js → state.js → utils.js → audio.js → mechs.js → cover.js → combat.js → mods.js → perks.js → enemies.js → rounds.js → hud.js → garage.js → menus.js → loot-system.js → enemy-types.js → arena-objectives.js → campaign-system.js → skill-tree-data.js → skill-tree.js → socket.io.min.js → multiplayer.js → events.js → init.js
```

---

## HUD Element IDs Reference

```
hud-container        game-canvas
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
- **Slot IDs in garage dropdown:** single uppercase letter — `L` `R` `M` (cpu) `A` (aug) `G` (leg) `S` (shield) `C` (color) `XHCOL` (crosshair color)
- **Slot keys in `loadout`:** `L` `R` `cpu` `aug` `leg` `shld` (note: `shld` not `shield`) `crosshairColor`
- **Slot keys in `_equipped`:** different again — `L` `R` `armor` `arms` `legs` `shield` `cpu` `augment`
- **Garage slot ID → loadout key:** use `SLOT_ID_MAP` constant: `{ L:'L', R:'R', M:'cpu', A:'aug', G:'leg', S:'shld' }`. `_equipped` uses a different set: `{ L, R, armor, arms, legs, shield, cpu, augment }`.
- **Enemy color palettes:** `ENEMY_COLORS`, `COMMANDER_COLORS`, `MEDIC_COLORS`, `BOSS_COLORS` (all keyed by chassis/type)
