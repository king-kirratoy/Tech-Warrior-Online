# Tech Warrior Online — OVERVIEW

> A browser-based top-down mech shooter built with Phaser 3.60.0. Players choose a chassis, build a loadout in the Hangar, then deploy into wave-based combat. Combat Simulation is a roguelike run-and-die loop; Campaign is persistent with XP/levels/missions/shop; PVP is real-time via Socket.IO.

Last updated: March 21, 2026 (v5.20 — final verification; three missing spawn functions restored to rounds.js)

---

## File Map

| File | Purpose |
|------|---------|
| `index.html` | Pure HTML shell. Contains only structural markup, four CSS `<link>` tags in `<head>`, and `<script src>` tags at the bottom of `<body>` in canonical load order. No inline `<script>` or `<style>` blocks. |
| `css/base.css` | Universal reset, scrollbar styling, and base `button` styles shared across all UI screens. |
| `css/hud.css` | In-game HUD styles — `#hud-container`, `.hud-background`, `.console-frame`, `.paper-doll`, `.doll-row`, `.part` (and size variants: `.head`, `.core`, `.shoulder`, `.arm`, `.leg`), `.weapon-row`, `.wr-fill`, `.wr-status`, and arm-destroyed / active-firing state variants. |
| `css/garage.css` | Hangar/garage UI and perk menu — `.stat-readout`, `.dd-row`, `.dd-wrap`, `.dd-selected`, `.dd-list`, `.dd-option` (full dropdown system with all states), `.perk-card` (and badge variants: `.perk-stack-badge`, `.perk-once-badge`, `.perk-legendary-badge`), `.stats-panel`, `.stats-panel-title`, `.stats-row`, `.stats-value` (color variants), HP bar display, color swatch, and garage stats rows. |
| `css/menus.css` | Main menu, death screen, pause, and overlay styles — `.menu-title`, `.menu-subtitle`, `.menu-start-btn` (and variants `.menu-btn-red`, `.disabled-mode`), `.menu-version`, `.pause-menu-btn`, `.loadout-tab`, inventory drag-and-drop styles (`.mech-equip-slot`, `.bp-cell`, `.arm-picker-*`), and keyframes: `titleFlicker`, `pulse`, `pausePulse`. |
| `js/constants.js` | All immutable game data. `CHASSIS`, `WEAPONS`, `SHIELD_SYSTEMS`, `AUGMENTS`, `LEG_SYSTEMS`, `COVER_DEFS`, `ARENA_DEFS`, `ENEMY_COLORS`, `COMMANDER_COLORS`, `MEDIC_COLORS`, `BOSS_COLORS`, `CHASSIS_WEAPONS/MODS/SHIELDS/LEGS/AUGS` (chassis restriction Sets), `STARTER_LOADOUTS`, `SLOT_ID_MAP`, `GAME_CONFIG`, Supabase config constants, leaderboard constants. Defines `window.TW = {}` namespace. |
| `js/state.js` | All mutable runtime globals shared across systems — Phaser object references (`player`, `torso`, `enemies`, `bullets`, etc.), game mode flags (`_gameMode`, `isDeployed`, `_isPaused`), round state (`_round`, `_roundKills`, etc.), combat state (`reloadL/R`, `lastDamageTime`, mod-active flags), `loadout`, `_perkState`, extraction state, loot pickups, leaderboard run state, and chassis movement-effect trackers. |
| `js/utils.js` | Pure helper functions with no side effects on global game state. Colour utilities (`darkenColor`), chassis stats (`getTotalHP`), HUD name lookup (`HUD_NAMES` const + `_hudName`), and visual FX helpers (`showDamageText`, `createImpactSparks`, `createShieldSparks`, `createShieldBreak`, `createMuzzleFlash`, `spawnDebris`, `spawnFootprint`). |
| `js/audio.js` | Web Audio API synthesizer — no audio files required. Audio state variables (`_ac`, `_masterVol`, `_activeNodes`, `_sndThrottle`, `_MAX_NODES`, `_audioReady`), core engine functions (`_getAC()`, `_canPlay()`, `_tone()`, `_noise()`), all 23 `snd*` sound functions, and the `_initAudioLifecycle` IIFE for first-gesture gate and tab visibility handling. |
| `js/mechs.js` | Mech building and visual systems. Player mech construction (`buildPlayerMech`), enemy mech construction (`buildEnemyMech`, `buildEnemyTorso`), color refresh (`refreshMechColor`), per-frame visual sync (`syncVisuals`, `syncChassisEffect`), chassis movement effects (`syncLightTrail`, `syncMediumFootsteps`, `syncHeavyShockwave`), rage ghost FX (`handleRageGhosts`), and spectre clone perk logic (`_spawnSpectreClone`). |
| `js/cover.js` | Cover and battlefield generation. `placeBuilding` (renders building geometry, registers static physics body), `generateCover` (clears old cover, dispatches to arena generator or default city-block layout, force-syncs static bodies), `damageCover` (darkens cover by HP percentage, destroys on zero HP). Also owns `_buildingGraphics` array. |
| `js/combat.js` | All weapon firing functions (`fire`, `fireFTH`, `fireRAIL`, `fireGL`, `fireRL`, `fireSIEGE`, `fireSG`, `firePLSM`, `fireSR`, `fireStandard`), damage processing (`processPlayerDamage`, `damageEnemy`, `_resolveEnemyDeath`), shield absorption helpers (`_applyPassiveShieldAbsorption`, `_applyExplosivePlayerDamage`), area effects (`createExplosion`), and mine mechanics (`dropMine`, `dropEnemyMine`, `_drawMineGraphic`). |
| `js/mods.js` | All 18 mod-activation functions: `activateMod` (dispatcher), `activateJump`, `activateDecoy`, `activateMissiles`, `activateDrone`, `activateRepair`, `activateEMP`, `activateRage`, `activateShield`, `activateGhostStep`, `activateOverclockBurst`, `activateFortressMode`, `activateEnemyMod`, `activateAutoDrone`, drone builder helpers (`_buildDroneGraphic`, `_spawnDrone`), and augment/leg application (`applyAugment`, `applyLegSystem`). |
| `js/perks.js` | `const _perks` — master perk definition dictionary (~400+ entries, each with `cat`, `label`, `desc`, `apply()`). `selectPerks()` (perk pool selection, no DOM), `showPerkMenu()` (renders 4 perk cards), `pickPerk()` (applies chosen perk, advances round), `_showEquipPrompt()` (gear equip flow after extraction), `resetRoundPerks()` (clears per-round perk state at round start). |
| `js/enemies.js` | Enemy spawning (`spawnEnemy`, `spawnCommander`, `spawnMedic`, `randomEnemyLoadout`), full enemy AI (`handleEnemyAI` and all private helpers: state machine, vision cone, squad system, obstacle avoidance, behavior dispatch), enemy firing (`enemyFire`, `enemyFireSecondary`), and all 8 boss variant spawners (`spawnWarden`, `spawnTwinRazors`, `spawnArchitect`, `spawnJuggernaut`, `spawnSwarm`, `spawnMirror`, `spawnTitan`, `spawnCore`) plus boss HP bar helpers (`_addBossHPBar`, `_updateBossHPBar`, `_hideBossHPBar`). |
| `js/rounds.js` | Round flow and extraction system. `startRound` (round init, arena setup, enemy spawning dispatch), `onEnemyKilled` (kill tracking, extraction trigger, perk/campaign bonus logic), `_setupArenaAndObjective` (arena + cover + objective init), `_spawnSimulationEnemies` (staggered normal/special/elite spawn for simulation mode), `_spawnCampaignEnemies` (campaign composition spawn), `showRoundBanner`, `_healPlayerFull`, `_clearMapForRound`, extraction point system (`_spawnExtractionPoint`, `_updateExtraction`, `_triggerExtraction`, `_cleanupExtraction`). |
| `js/hud.js` | All HUD update functions: `updateHUD()` (weapon slot names/states), `updateBars()` (HP and shield bar fills), `updatePaperDoll()` (part HP colors for player and enemy dolls), `drawMinimap()` (160×160 canvas radar), `updateCooldownOverlays()` (weapon-row fill animations), `syncGlowWedge()`, `syncCrosshair()`, `_resetHUDState()` (blanks all HUD elements on death/return). |
| `js/garage.js` | Hangar UI and loadout management. `toggleDD()`, `buildDD()`, `closeAllDD()` (custom dropdown system), `selectSlot()` (slot selection with 2H weapon locking), `refreshGarage()` (rebuilds all dropdowns filtered by chassis), `updateGarageStats()` (recalculates and displays build stats panel), `setChassis()`, `buildColorDD()`, `_calcWeight()`, `_updateStarterPanel()`. |
| `js/menus.js` | All menu screen logic: main menu nav (`proceedToMainMenu`, `showCampaignSubMenu`, `hideCampaignSubMenu`, `returnToMainMenu`), hangar nav (`returnToHangar`, `returnToHangarForMissionSelect`, `deployMech`, `startGame`, `startMultiplayer`, `goToMainMenu`), death screen (`showDeathScreen`, `respawnMech`), pause (`togglePause`), stats overlay (`toggleStats`, `_switchLoadoutTab`, `populateStats`, `populateInventory`, `_updateInvCount`), leaderboard (`showLeaderboard`, `closeLeaderboard`, `submitLeaderboardEntry`), and campaign chassis select flow. |
| `js/loot-system.js` | ARPG loot layer. Item generation (`generateItem`, `rollRarity`, `rollAffixes`), rarity definitions (`RARITY_DEFS`), affix pool (`AFFIX_POOL`), inventory management (`_inventory`, `_equipped`, `_gearState`, `recalcGearStats`), equipment ground drops (`spawnEquipmentLoot`, `checkEquipmentPickups`), unique boss items, scrapping. |
| `js/enemy-types.js` | Special enemy types (Scout, Enforcer, Technician, Berserker, Sniper Elite, Drone Carrier) and elite modifier system (Vampiric, Shielded, Explosive, Swift, Armored, Splitting). Functions: `spawnSpecialEnemy`, `applyEliteModifier`, `_rollEliteModifier`, `handleEliteDamage`, `handleEliteDeath`, `updateSpecialEnemies`, `_getEnemySpawnConfig`. |
| `js/arena-objectives.js` | Arena layout generator (`ARENA_DEFS`, `selectArena`, arena-specific cover generators invoked via `window[arenaDef.generator]` by `generateCover`), objective system (`selectObjective`, `initObjective`, `updateObjectives`, `cleanupObjective`, `shouldEndRound`, `getArenaLabel`, `getObjectiveLabel`). Exports `_arenaState` object — mutate properties only, never reassign. |
| `js/campaign-system.js` | Campaign missions, chapter/mission data, XP curve (`getXPForLevel`, `getXPToNextLevel`), level-up, skill tree, chassis upgrades (`applyChassisUpgrades`), shop (`refreshShopStock`), mission rewards (`awardMissionReward`), bonus objectives (`trackBonusObjective`, `finalizeBonusObjective`), cloud save integration (`saveToCloud`, `loadFromCloud`, `_restoreFromCloudData`), mission select overlay (`showMissionSelect`). |
| `js/multiplayer.js` | PVP matchmaking via Socket.IO, remote player rendering, bullet sync, PVP HUD, PVP hangar (`mpShowPvpHangar`), in-game chat, respawn system. Exports `mpUpdate`, `mpBroadcastBullet`, `mpDrawMinimapPlayers`, `mpIsPvpMenuOpen`, `mpShowPvpMenu`, `mpClosePvpMenu`. |
| `js/events.js` | All top-level global event listeners: window resize (`_onWindowResize`), document click (dropdown close via `closeAllDD`), main keydown handler (perk menu 1–4 pick, death screen Enter/ESC, equip-prompt Enter/ESC, chassis-select overlay, leaderboard close, campaign overlay closes, stats overlay, pause toggle, PVP chat T key), `_mainMenuKeyNav` (main menu arrow-key focus, ESC closes campaign sub-menu), `handlePlayerMovement`, `handlePlayerFiring`, and inventory drag-and-drop handlers (`_onEquipDragStart`, `_onSlotDragOver`, `_onSlotDragLeave`, `_onSlotDrop`). |
| `js/init.js` | Game startup and Phaser initialization. Animated grid canvas (`_startGridCanvas`, `startMenuGrid`), callsign input handlers (`_csKeyDown`, `_updateCallsignBtn`), callsign pre-fill IIFE, Phaser scene lifecycle functions (`preload`, `create`, `update`), and `window.onload` bootstrap. Loaded last — after `events.js`. |
| `LOOT_SYSTEM_DESIGN.md` | Design document for the ARPG loot overhaul. Full spec for item categories, rarity tiers, affix system, equipment slots, drop tables, inventory UI, enemy expansion, boss loot, arena/objective system, and 8-phase implementation plan. Reference document — not loaded at runtime. |

**Script load order (bottom of `<body>`):**
```
phaser.min.js → constants.js → state.js → utils.js → audio.js → mechs.js → cover.js → combat.js → mods.js → perks.js → enemies.js → rounds.js → hud.js → garage.js → menus.js → loot-system.js → enemy-types.js → arena-objectives.js → campaign-system.js → socket.io.min.js → multiplayer.js → events.js → init.js
```

---

## Systems Overview

### Chassis System
**Lives in:** `js/constants.js` — `const CHASSIS`, `const CHASSIS_WEAPONS`, `const CHASSIS_MODS`, `const CHASSIS_SHIELDS`, `const CHASSIS_LEGS`, `const CHASSIS_AUGS`
**What it does:** Defines the three playable chassis types (Light/Medium/Heavy) with HP pools, speed, scale, and passive traits. Each chassis has weapon/mod/shield/leg/aug restrictions enforced by `Set` lookups. Chassis choice is locked in Campaign mode once selected.
**Key constants:** `CHASSIS.light.spd=250`, `CHASSIS.medium.modCooldownMult=0.85`, `CHASSIS.heavy.passiveDR=0.15`
**Connects to:** `deployMech()` (initializes `player.comp` from chassis HP values), `refreshGarage()` (filters dropdown options), `randomEnemyLoadout()` (enemies also roll chassis)

### Loadout System
**Lives in:** `js/constants.js` — `const STARTER_LOADOUTS`; `js/state.js` — `let loadout`; `js/garage.js` — `selectSlot()`, `refreshGarage()`
**What it does:** Tracks the player's current build across 7 slots (chassis, L, R, mod, aug, leg, shld, color). The garage UI uses a custom dropdown system (`toggleDD`, `buildDD`, `closeAllDD`). Two-handed weapons (`siege`, `chain`) lock both arms to the same key. Starter loadouts are applied per chassis on new game or chassis switch.
**Loadout slot keys:** `L` `R` `mod` `aug` `leg` `shld` (not `shield` — it's `shld`)
**Connects to:** `deployMech()` reads loadout to set up player, `updateHUD()` displays slot names, `processPlayerDamage()` checks `_lArmDestroyed`/`_rArmDestroyed`

### Combat & Firing System
**Lives in:** `js/combat.js` — `fire()`, `fireFTH()`, `fireRAIL()`, `fireGL()`, `fireRL()`, `fireSG()`, `fireSR()`, `firePLSM()`, `fireSIEGE()`, `fireStandard()`
**What it does:** Handles weapon firing from arm offset origins (bullets spawn from the arm, not torso center). Dispatches per weapon type. Single-arm brace gives +25% damage / +15% reload. Dual-wield gives −15% damage per arm. Critical hits, overcharge rounds, phantom protocol, and targeting scope bonuses all applied here.
**Key variables:** `reloadL`, `reloadR` (timestamps), `_shotsFired`, `_shotsHit`, `_damageDealt`
**Connects to:** `handlePlayerFiring()` (called each frame), `_perkState` (all damage/reload multipliers), `_gearState` (gear bonuses), bullet ↔ enemy overlap registered in `create()`

### Perk System
**Lives in:** `js/perks.js` — `const _perks`, `showPerkMenu()`, `pickPerk()`, `selectPerks()`, `_pickFrom()`, `_showEquipPrompt()`, `_currentPerkKeys`, `_currentPerkNextRound`; `let _perkState`, `_pickedPerks[]`, `_lastOfferedPerks[]` in `js/state.js`
**What it does:** ~400+ perks organized by category (universal, chassis, weapon/mod-specific, legendary). Offered in a 4-slot menu after each round's extraction. Perks apply immediately on pick via `p.apply()` which mutates `_perkState`. Legendaries require 2+ perks in their category and round 5+.
**Key state:** `_perkState.dmgMult`, `_perkState.reloadMult`, `_perkState.speedMult`, `_perkState.fortress` (DR), `_perkState.critChance`
**Connects to:** `damageEnemy()` and `processPlayerDamage()` read `_perkState` for all combat math, `handleShieldRegen()` checks `_perkState.noShieldRegen`

### Shield System
**Lives in:** `js/constants.js` — `const SHIELD_SYSTEMS`; `js/combat.js` — `processPlayerDamage()`; `js/init.js` — `handleShieldRegen()` (called each frame in `update()`)
**What it does:** 20 shield types (5 universal + 5 per chassis) each with unique passive mechanics. Shield is initialized on `player` at deploy time. Absorbs a portion of incoming damage based on `absorb` value (50% default, 60% for Medium). Regens after `regenDelay` seconds with no damage taken.
**Key player properties:** `player.shield`, `player.maxShield`, `player._shieldAbsorb`, `player._shieldRegenRate`, `player._shieldRegenDelay`
**Connects to:** `processPlayerDamage()` (absorb logic, on-break effects), `activateShield()` (barrier mod), `updateBars()` (HUD display)

### Round & Extraction System
**Lives in:** `js/rounds.js` — `startRound()`, `onEnemyKilled()`, `_setupArenaAndObjective()`, `_spawnSimulationEnemies()`, `_spawnCampaignEnemies()`, `_spawnExtractionPoint()`, `_updateExtraction()`, `_triggerExtraction()`; `js/perks.js` — `resetRoundPerks()`; `js/combat.js` — `destroyEnemyWithCleanup()`; `js/init.js` — `handleObjectiveRoundEnd()` (called each frame in `update()`)
**What it does:** Enemies spawn on a staggered timer at round start. When all enemies die, an extraction zone spawns at a random map location. Player must reach it and press E to end the round, triggering perk selection. Bosses spawn every 5th round. Campaign mode uses `_activeCampaignConfig` for enemy composition instead of the default formula.
**Key variables:** `_round`, `_roundKills`, `_roundTotal`, `_roundActive`, `_extractionActive`, `_extractionPoint`
**Key helpers:** `resetRoundPerks()` — called at round start to clear all per-round perk state. `handleObjectiveRoundEnd(scene)` — called each frame from `update()` to detect survival/assassination objective endings. `destroyEnemyWithCleanup(scene, e)` — shared teardown for forced enemy removal (objective end, swarm defeat).
**Connects to:** `damageEnemy()` → `onEnemyKilled()`, `showPerkMenu()` → `pickPerk()` → `startRound(nextRound)`

### Enemy AI System
**Lives in:** `js/enemies.js` — `handleEnemyAI()`, `spawnEnemy()`, `spawnCommander()`, `spawnMedic()`, `enemyFire()`, `enemyFireSecondary()`
**What it does:** State machine per enemy: `patrol` → `search` → `chase` → `combat`. Vision cone detection (patrol/search), wide pursuit radius (chase/combat). Squad system groups enemies by chassis. Behaviors: `circle`, `rusher`, `flanker`, `ambusher`, `guardian`, `sniper`. Obstacle avoidance via feeler rays. Separation force prevents stacking.
**Key enemy properties:** `e.comp` (HP parts), `e.loadout` (chassis/weapons/mod), `e._aiState`, `e._squadId`, `e.behavior`, `e.speed`, `e.isStunned`, `e._fireGrace`
**Connects to:** `enemies` (Phaser group), `damageEnemy()`, `enemyFire()`, `handleEnemyAI()` called each frame

### Boss System
**Lives in:** `js/enemies.js` — `spawnBoss()`, `spawnWarden()`, `spawnTwinRazors()`, `spawnArchitect()`, `spawnJuggernaut()`, `spawnSwarm()`, `spawnMirror()`, `spawnTitan()`, `spawnCore()`
**What it does:** 8 bosses cycle every 5 rounds (R5=Warden, R10=Razors, R15=Architect, R20=Juggernaut, R25=Swarm, R30=Mirror, R35=Titan, R40=Core). Each boss has unique phase mechanics, a DOM-based HP bar (`boss-hud`), and an `e._onDestroy` callback for cleanup. Swarm boss uses shared `_swarmState.hp` pool — damage bypasses individual enemy HP.
**Key pattern:** Every boss must call `_hideBossHPBar()` in `e._onDestroy`. Boss HP bar is DOM-based, not Phaser.
**Connects to:** `startRound()` (detects boss round), `damageEnemy()` (swarm check via `e._isSwarmUnit`), `spawnEquipmentLoot()` (boss drops)

### Loot System (ARPG Layer)
**Lives in:** `js/loot-system.js`
**What it does:** Generates randomized items with rarity (Common→Legendary), rolled affixes from `AFFIX_POOL`, and base stats from `ITEM_BASES`. Ground drops render with floating animations and rarity glow effects. Player walks over to pick up. Items go to `_inventory[]`. Gear equipped to `_equipped{}` affects `_gearState{}` via `recalcGearStats()`.
**Key constants:** `RARITY_DEFS` (colors, scrap values, affix counts), `AFFIX_POOL` (stat modifiers with weights/ranges), `INVENTORY_MAX=30`
**Gear stat keys (all applied in gameplay as of v3.4):** `dmgFlat` `dmgPct` `critChance` `critDmg` `reloadPct` `coreHP` `armHP` `legHP` `allHP` `dr` `shieldHP` `shieldRegen` `absorbPct` `dodgePct` `speedPct` `modCdPct` `modEffPct` `lootMult` `autoRepair` `pellets` `splashRadius`
**Gear stat keys (accumulated but no gameplay effect yet):** `accuracy` — no general accuracy system exists; stat is displayed in stat overlay only
**Unique effects stubbed (Phase 7):** `echoStrike` (Echo Frame), `mirrorShot` (Mirror Shard) — effect keys registered, stubs exist, procs not yet wired
**2H weapons excluded from loot drops:** `siege` and `chain` cannot drop as loot items (equip system can only set one arm slot at a time; 2H locking requires both slots share the same key)
**Connects to:** `damageEnemy()` → death triggers `spawnEquipmentLoot()`, `deployMech()` calls `recalcGearStats()` to apply gear HP/shield bonuses, `populateInventory()` renders the GEAR tab

### Audio Engine
**Lives in:** `js/audio.js` — `_tone()`, `_noise()`, `sndFire()`, `sndExplosion()`, `sndEnemyDeath()`, etc.
**What it does:** Web Audio API synthesizer — no audio files required. Oscillators + noise buffers for all sounds. Throttled via `_sndThrottle{}` (per-sound last-played timestamps). Node count capped at `_MAX_NODES=48`.
**Key globals:** `let _ac` (AudioContext), `let _masterVol=0.32`, `let _activeNodes=0`, `let _lastNodeStartTime=0`, `let _audioReady=false`
**Lifecycle:** AudioContext is created only after the first user gesture (`_audioReady` flag). Tab-visibility changes suspend/resume the context. A 2000 ms `setInterval` audit resets `_activeNodes` if the context is closed or all nodes must have expired.

### HUD System
**Lives in:** `js/hud.js` — `updateHUD()`, `updateBars()`, `updatePaperDoll()`, `updateCooldownOverlays()`, `drawMinimap()`; `js/rounds.js` — `updateRoundHUD()`
**What it does:** Bottom-left console frame with paper doll (part HP colors) and 4 weapon bar rows (L/R/CORE/DEFENSE). Reload progress bars fill right-to-left as weapons cool down. Round HUD shows current round, remaining enemies, total kills. Minimap (160×160 canvas) shows enemies, loot, extraction point, player.
**DOM element IDs:** `hud-container`, `slot-L/R/M/S`, `wr-fill-L/R/M/S`, `wr-st-L/R/M/S`, `round-hud`, `round-num`, `minimap-canvas`

### Mech Visual System
**Lives in:** `js/mechs.js` — `buildPlayerMech()`, `buildEnemyMech()`, `buildEnemyTorso()`, `refreshMechColor()`, `syncVisuals()`, `syncChassisEffect()`, `syncLightTrail()`, `syncMediumFootsteps()`, `syncHeavyShockwave()`, `handleRageGhosts()`, `_spawnSpectreClone()`
**What it does:** Player uses two separate Phaser objects — `player` (invisible physics rectangle, moves with WASD) and `torso` (visual container, rotates toward mouse each frame). Enemies use `e.visuals` (body, faces movement) and `e.torso` (full mech, aims at player). Each chassis has a distinct movement effect (Light: ghost trail, Medium: blur + footprints, Heavy: shockwave rings).
**Important:** Always sync both objects. `e.visuals.setPosition(e.x, e.y)` AND `e.torso.setPosition(e.x, e.y)`.

---

## Naming Conventions & Patterns

- **Global state variables:** underscore prefix — `_round`, `_perkState`, `_gearState`, `_inventory`, `_equipped`
- **Boolean flags:** `isDeployed`, `isJumping`, `isShieldActive`, `isRageActive`, `_roundActive`, `_extractionActive`
- **Private helpers:** double underscore prefix — `_healPlayerFull()`, `_resetHUDState()`, `_cleanupGame()`
- **DOM element IDs:** kebab-case — `round-hud`, `hud-container`, `boss-hud`, `enemy-doll-hud`
- **Slot IDs in code:** single uppercase letter — `L` `R` `M` (mod) `A` (aug) `G` (leg) `S` (shield) `C` (color)
- **Slot keys in `_equipped`:** different — `L` `R` `chest` `arms` `legs` `shield` `mod` `augment`
- **Shield field on loadout:** `shld` (not `shield`) — `loadout.shld = 'light_shield'`
- **Garage slot ID → loadout key:** use `SLOT_ID_MAP` constant: `{ L:'L', R:'R', M:'mod', A:'aug', G:'leg', S:'shld' }`. `_equipped` (loot-system.js) uses yet another set: `{ L, R, chest, arms, legs, shield, mod, augment }`.
- **`selectPerks()`:** pure perk selection (no DOM). Call before `showPerkMenu()` renders cards. Returns `{ chosen, slotLabels, slotColors }`.
- **`destroyEnemyWithCleanup(scene, e)`:** centralised enemy teardown. Use wherever enemies are force-removed outside the normal damage path.
- **Enemy color palettes:** `ENEMY_COLORS`, `COMMANDER_COLORS`, `MEDIC_COLORS`, `BOSS_COLORS` (all keyed by chassis/type)
- **typeof guards:** External JS functions are always called with `typeof fn === 'function'` guards to survive file load failures

---

## Notes

- **Cover origin is top-left (0,0):** Always use `c.coverCX` / `c.coverCY` for true center in LOS/distance checks — never `c.x/c.y` directly.
- **Phaser groups persist across deploys:** `bullets`, `enemyBullets`, `enemies`, `coverObjects` are created once in `create()` and never destroyed — only `.clear(true, true)` their children.
- **`_roundClearing=true` blocks `update()`** — do not start any game logic while true.
- **`_arenaState` from arena-objectives.js** — mutate its properties in place, never reassign the whole object.
- **Campaign enemy scaling uses `_activeCampaignConfig?.enemyLevel || _round`** — never use raw `_round` for campaign enemy HP/speed.
- **Loot system is actively being built** (LOOT_SYSTEM_DESIGN.md documents Phase 1–8). Some inventory/gear UI systems exist but boss-unique items, certain UI interactions, and late-phase features may be partially implemented.
- **Version display:** The version number should be displayed somewhere visible in the game UI and tracked in CHANGELOG.md.
