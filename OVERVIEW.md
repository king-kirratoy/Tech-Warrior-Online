# Tech Warrior Online — OVERVIEW

> A browser-based top-down mech shooter built with Phaser 3.60.0. Players choose a chassis, build a loadout in the Hangar, then deploy into wave-based combat. Combat Simulation is a roguelike run-and-die loop; Campaign is persistent with XP/levels/missions/shop; PVP is real-time via Socket.IO.

Last updated: March 20, 2026 (v4.9 — Fixed two additional structural brace errors in _syncEnemyVisuals and _applyEnemyObstacleAvoidance; script block now parses cleanly)

---

## File Map

| File | Purpose |
|------|---------|
| `index.html` | Main entry point. Contains the full Phaser game config, all core game logic (chassis, weapons, mods, perks, shields, legs, augments, cover, bosses, loot orbs, HUD, garage, menus, round system, extraction, audio engine, death screen, leaderboard). All inline JS in a single `<script>` block at the bottom. |
| `js/loot-system.js` | ARPG loot layer. Item generation (`generateItem`, `rollRarity`, `rollAffixes`), rarity definitions (`RARITY_DEFS`), affix pool (`AFFIX_POOL`), inventory management (`_inventory`, `_equipped`, `_gearState`, `recalcGearStats`), equipment ground drops (`spawnEquipmentLoot`, `checkEquipmentPickups`), unique boss items, scrapping. |
| `js/enemy-types.js` | Special enemy types (Scout, Enforcer, Technician, Berserker, Sniper Elite, Drone Carrier) and elite modifier system (Vampiric, Shielded, Explosive, Swift, Armored, Splitting). Functions: `spawnSpecialEnemy`, `applyEliteModifier`, `_rollEliteModifier`, `handleEliteDamage`, `handleEliteDeath`, `updateSpecialEnemies`, `_getEnemySpawnConfig`. |
| `js/arena-objectives.js` | Arena layout generator (`ARENA_DEFS`, `selectArena`, `generateCover` variants), objective system (`selectObjective`, `initObjective`, `updateObjectives`, `cleanupObjective`, `shouldEndRound`, `getArenaLabel`, `getObjectiveLabel`). Exports `_arenaState` object — mutate properties only, never reassign. |
| `js/campaign-system.js` | Campaign missions, chapter/mission data, XP curve (`getXPForLevel`, `getXPToNextLevel`), level-up, skill tree, chassis upgrades (`applyChassisUpgrades`), shop (`refreshShopStock`), mission rewards (`awardMissionReward`), bonus objectives (`trackBonusObjective`, `finalizeBonusObjective`), cloud save integration (`saveToCloud`, `loadFromCloud`, `_restoreFromCloudData`), mission select overlay (`showMissionSelect`). |
| `js/multiplayer.js` | PVP matchmaking via Socket.IO, remote player rendering, bullet sync, PVP HUD, PVP hangar (`mpShowPvpHangar`), in-game chat, respawn system. Exports `mpUpdate`, `mpBroadcastBullet`, `mpDrawMinimapPlayers`, `mpIsPvpMenuOpen`, `mpShowPvpMenu`, `mpClosePvpMenu`. |
| `LOOT_SYSTEM_DESIGN.md` | Design document for the ARPG loot overhaul. Full spec for item categories, rarity tiers, affix system, equipment slots, drop tables, inventory UI, enemy expansion, boss loot, arena/objective system, and 8-phase implementation plan. Reference document — not loaded at runtime. |

**Load order in `<head>`:**
```
loot-system.js → enemy-types.js → arena-objectives.js → campaign-system.js → multiplayer.js → inline <script>
```

---

## Systems Overview

### Chassis System
**Lives in:** `index.html` — `const CHASSIS`, `const CHASSIS_WEAPONS`, `const CHASSIS_MODS`, `const CHASSIS_SHIELDS`, `const CHASSIS_LEGS`, `const CHASSIS_AUGS`
**What it does:** Defines the three playable chassis types (Light/Medium/Heavy) with HP pools, speed, scale, and passive traits. Each chassis has weapon/mod/shield/leg/aug restrictions enforced by `Set` lookups. Chassis choice is locked in Campaign mode once selected.
**Key constants:** `CHASSIS.light.spd=250`, `CHASSIS.medium.modCooldownMult=0.85`, `CHASSIS.heavy.passiveDR=0.15`
**Connects to:** `deployMech()` (initializes `player.comp` from chassis HP values), `refreshGarage()` (filters dropdown options), `randomEnemyLoadout()` (enemies also roll chassis)

### Loadout System
**Lives in:** `index.html` — `let loadout`, `const STARTER_LOADOUTS`, `selectSlot()`, `refreshGarage()`
**What it does:** Tracks the player's current build across 7 slots (chassis, L, R, mod, aug, leg, shld, color). The garage UI uses a custom dropdown system (`toggleDD`, `buildDD`, `closeAllDD`). Two-handed weapons (`siege`, `chain`) lock both arms to the same key. Starter loadouts are applied per chassis on new game or chassis switch.
**Loadout slot keys:** `L` `R` `mod` `aug` `leg` `shld` (not `shield` — it's `shld`)
**Connects to:** `deployMech()` reads loadout to set up player, `updateHUD()` displays slot names, `processPlayerDamage()` checks `_lArmDestroyed`/`_rArmDestroyed`

### Combat & Firing System
**Lives in:** `index.html` — `fire()`, `fireFTH()`, `fireRAIL()`, `fireGL()`, `fireRL()`, `fireSG()`, `fireSR()`, `firePLSM()`, `fireSIEGE()`, `fireStandard()`
**What it does:** Handles weapon firing from arm offset origins (bullets spawn from the arm, not torso center). Dispatches per weapon type. Single-arm brace gives +25% damage / +15% reload. Dual-wield gives −15% damage per arm. Critical hits, overcharge rounds, phantom protocol, and targeting scope bonuses all applied here.
**Key variables:** `reloadL`, `reloadR` (timestamps), `_shotsFired`, `_shotsHit`, `_damageDealt`
**Connects to:** `handlePlayerFiring()` (called each frame), `_perkState` (all damage/reload multipliers), `_gearState` (gear bonuses), bullet ↔ enemy overlap registered in `create()`

### Perk System
**Lives in:** `index.html` — `const _perks`, `let _perkState`, `_pickedPerks[]`, `selectPerks()`, `showPerkMenu()`, `pickPerk()`
**What it does:** ~400+ perks organized by category (universal, chassis, weapon/mod-specific, legendary). Offered in a 4-slot menu after each round's extraction. Perks apply immediately on pick via `p.apply()` which mutates `_perkState`. Legendaries require 2+ perks in their category and round 5+.
**Key state:** `_perkState.dmgMult`, `_perkState.reloadMult`, `_perkState.speedMult`, `_perkState.fortress` (DR), `_perkState.critChance`
**Connects to:** `damageEnemy()` and `processPlayerDamage()` read `_perkState` for all combat math, `handleShieldRegen()` checks `_perkState.noShieldRegen`

### Shield System
**Lives in:** `index.html` — `const SHIELD_SYSTEMS`, `handleShieldRegen()`, `processPlayerDamage()`
**What it does:** 20 shield types (5 universal + 5 per chassis) each with unique passive mechanics. Shield is initialized on `player` at deploy time. Absorbs a portion of incoming damage based on `absorb` value (50% default, 60% for Medium). Regens after `regenDelay` seconds with no damage taken.
**Key player properties:** `player.shield`, `player.maxShield`, `player._shieldAbsorb`, `player._shieldRegenRate`, `player._shieldRegenDelay`
**Connects to:** `processPlayerDamage()` (absorb logic, on-break effects), `activateShield()` (barrier mod), `updateBars()` (HUD display)

### Round & Extraction System
**Lives in:** `index.html` — `startRound()`, `resetRoundPerks()`, `onEnemyKilled()`, `handleObjectiveRoundEnd()`, `destroyEnemyWithCleanup()`, `_spawnExtractionPoint()`, `_updateExtraction()`, `_triggerExtraction()`
**What it does:** Enemies spawn on a staggered timer at round start. When all enemies die, an extraction zone spawns at a random map location. Player must reach it and press E to end the round, triggering perk selection. Bosses spawn every 5th round. Campaign mode uses `_activeCampaignConfig` for enemy composition instead of the default formula.
**Key variables:** `_round`, `_roundKills`, `_roundTotal`, `_roundActive`, `_extractionActive`, `_extractionPoint`
**Key helpers:** `resetRoundPerks()` — called at round start to clear all per-round perk state. `handleObjectiveRoundEnd(scene)` — called each frame from `update()` to detect survival/assassination objective endings. `destroyEnemyWithCleanup(scene, e)` — shared teardown for forced enemy removal (objective end, swarm defeat).
**Connects to:** `damageEnemy()` → `onEnemyKilled()`, `showPerkMenu()` → `pickPerk()` → `startRound(nextRound)`

### Enemy AI System
**Lives in:** `index.html` — `handleEnemyAI()`, `spawnEnemy()`, `spawnCommander()`, `spawnMedic()`, `enemyFire()`, `enemyFireSecondary()`
**What it does:** State machine per enemy: `patrol` → `search` → `chase` → `combat`. Vision cone detection (patrol/search), wide pursuit radius (chase/combat). Squad system groups enemies by chassis. Behaviors: `circle`, `rusher`, `flanker`, `ambusher`, `guardian`, `sniper`. Obstacle avoidance via feeler rays. Separation force prevents stacking.
**Key enemy properties:** `e.comp` (HP parts), `e.loadout` (chassis/weapons/mod), `e._aiState`, `e._squadId`, `e.behavior`, `e.speed`, `e.isStunned`, `e._fireGrace`
**Connects to:** `enemies` (Phaser group), `damageEnemy()`, `enemyFire()`, `handleEnemyAI()` called each frame

### Boss System
**Lives in:** `index.html` — `spawnBoss()`, `spawnWarden()`, `spawnTwinRazors()`, `spawnArchitect()`, `spawnJuggernaut()`, `spawnSwarm()`, `spawnMirror()`, `spawnTitan()`, `spawnCore()`
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
**Lives in:** `index.html` — `_tone()`, `_noise()`, `sndFire()`, `sndExplosion()`, `sndEnemyDeath()`, etc.
**What it does:** Web Audio API synthesizer — no audio files required. Oscillators + noise buffers for all sounds. Throttled via `_sndThrottle{}` (per-sound last-played timestamps). Node count capped at `_MAX_NODES=48`.
**Key globals:** `let _ac` (AudioContext), `let _masterVol=0.32`, `let _activeNodes=0`, `let _lastNodeStartTime=0`, `let _audioReady=false`
**Lifecycle:** AudioContext is created only after the first user gesture (`_audioReady` flag). Tab-visibility changes suspend/resume the context. A 2000 ms `setInterval` audit resets `_activeNodes` if the context is closed or all nodes must have expired.

### HUD System
**Lives in:** `index.html` — `updateHUD()`, `updateBars()`, `updatePaperDoll()`, `updateRoundHUD()`, `updateCooldownOverlays()`, `drawMinimap()`
**What it does:** Bottom-left console frame with paper doll (part HP colors) and 4 weapon bar rows (L/R/CORE/DEFENSE). Reload progress bars fill right-to-left as weapons cool down. Round HUD shows current round, remaining enemies, total kills. Minimap (160×160 canvas) shows enemies, loot, extraction point, player.
**DOM element IDs:** `hud-container`, `slot-L/R/M/S`, `wr-fill-L/R/M/S`, `wr-st-L/R/M/S`, `round-hud`, `round-num`, `minimap-canvas`

### Mech Visual System
**Lives in:** `index.html` — `buildPlayerMech()`, `buildEnemyTorso()`, `refreshMechColor()`, `syncVisuals()`, `syncChassisEffect()`
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
