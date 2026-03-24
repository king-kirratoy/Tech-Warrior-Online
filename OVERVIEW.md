# Tech Warrior Online — OVERVIEW

> A browser-based top-down mech shooter built with Phaser 3.60.0. Players choose a chassis, build a loadout in the Hangar, then deploy into wave-based combat. **Warzone** is a roguelike run-and-die loop (`_gameMode='simulation'`); **Campaign** is persistent with XP/levels/missions/shop (`_gameMode='campaign'`); **Multiplayer** is real-time PVP via Socket.IO (`_gameMode='pvp'`).

Last updated: March 24, 2026 (v6.13 — warzone/multiplayer hangar dropdown parity)

---

## File Map

| File | Purpose |
|------|---------|
| `index.html` | Pure HTML shell. Four CSS `<link>` tags in `<head>`, `<script src>` tags at bottom of `<body>` in canonical load order. No inline `<script>` or `<style>` blocks. Screens: `#callsign-screen`, `#main-menu`, `#garage-menu` (hangar), `#leaderboard-overlay`, `#hud-container` (in-game HUD), `#round-hud`, `#boss-hud`, `#round-banner`, `#objective-hud`, `#arena-label`, `#mission-select-overlay`, `#mission-briefing-popup`, `#shop-overlay`, `#loadout-slots-overlay`, `#upgrades-overlay`, `#death-screen`, `#perk-menu`, `#stats-overlay` (loadout/inventory), `#minimap-wrap`, `#enemy-doll-hud`, `#pause-overlay`. |
| `css/base.css` | All CSS design tokens and the universal reset. Contains two token families: (1) Legacy brand tokens (`--cyan`, `--red`, `--gold`, `--green-accent`, `--amber`, `--purple`, etc.) used in the game world and HUD. (2) Sci-fi button palette (`--sci-cyan`, `--sci-cyan-dim`, `--sci-cyan-border`, `--sci-cyan-bright`, `--sci-red`, `--sci-red-dim`, `--sci-red-border`, `--sci-gold`, `--sci-line`, `--sci-txt`, `--sci-txt2`, `--sci-txt3`, `--sci-surface`) used in all UI panels. Also defines `--font-mono: 'Courier New', monospace`, `--font-ui: 'Verdana', sans-serif`, box glow tokens (`--glow-cyan-sm/md/lg`, `--glow-red-sm/md/lg`, etc.), button geometry tokens (`--btn-padding`, `--btn-font-size`, `--btn-ls` and `--*-sm` variants), surface tokens, scrollbar styling, and the `.tw-btn` button system. |
| `css/hud.css` | In-game HUD styles. `#hud-container`, `.hud-background`, `.console-frame`, `.paper-doll`, `.doll-row`, `.side-column`, `.part` (and size variants: `.head`, `.core`, `.shoulder`, `.arm`, `.leg`), `.weapon-row` (and states: `.arm-destroyed`, `.active-firing`), `.wr-slot-col`, `.wr-prefix`, `.wr-name-col`, `.wr-name`, `.wr-bar-bg`, `.wr-fill`, `.wr-status`. Also defines HUD-specific color tokens (`--hud-cyan`, `--hud-cyan-border`, `--hud-cyan-status`). |
| `css/garage.css` | Hangar UI, perk menu, garage stat panel, dropdown system, and the entire loadout overlay. Hangar: `.hg-top`, `.hg-body`, `.hg-left`, `.hg-right`, `.hg-preview-zone`, `.hg-stats-header`, `.hg-stat-row`, `.hg-stat-label`, `.hg-stat-val`. Perk cards: `.perk-card` (and `.perk-stack-badge`, `.perk-once-badge`, `.perk-legendary-badge`, `.legendary` variant). Stats panel: `.stats-panel`, `.stats-panel-title`, `.stats-row`, `.stats-label`, `.stats-value` (color variants: `.green`, `.orange`, `.yellow`, `.purple`, `.red`), `.stats-hp-bar`, `.stats-hp-track`, `.stats-hp-fill`. Dropdown: `.dd-row`, `.dd-label`, `.dd-wrap`, `.dd-selected`, `.dd-list`, `.dd-option`, `.dd-open`, `.do-name`, `.do-desc`, `.do-warn`, `.do-disabled`. Loadout overlay (`.lo-*` family): layout classes (`.lo-top-bar`, `.lo-body`, `.lo-left`, `.lo-center`, `.lo-right`), section blocks (`.lo-sec`, `.lo-block`, `.lo-totals-block`, `.lo-divider`, `.lo-sec-title`, `.lo-xp-row`), chassis info (`.lo-chassis-row`, `.lo-chassis-lbl`, `.lo-chassis-val`), HP bars (`.lo-hp-row`, `.lo-hp-part`, `.lo-hp-track`, `.lo-hp-fill`, `.lo-hp-val`), stat display (`.lo-stat-row`, `.lo-stat-label`, `.lo-stat-val`, `.lo-stat-value` with `.green/.red/.orange/.yellow/.purple`), traits (`.lo-trait`, `.lo-trait-name`, `.lo-trait-desc`, `.lo-traits-bar`, `.lo-trait-inline`), gear bonuses (`.lo-bonus-row`, `.lo-bonus-lbl`, `.lo-bonus-val` with `.pos/.neg`), doll area (`.lo-doll-wrap`), hover cards (`.lo-hover-card`, `.lo-hover-unique`, `.lo-hover-divider`, `.lo-hover-cmp-card`, `.lo-hover-cmp-cols`, `.lo-hover-cmp-col`, `.lo-hover-cmp-left`, `.lo-hover-diff`, `.lo-hover-diff-hdr`, `.lo-hover-diff-row`), weapon bar (`.lo-weapon-bar`, `.lo-wb-item`, `.lo-wb-divider`), slots (`.lo-slot` shared for both doll and backpack — see note), backpack (`.lo-backpack`, `.lo-bp-header`, `.lo-bp-count`, `.lo-bp-grid`). |
| `css/menus.css` | Main menu, pause screen, callsign screen, leaderboard, PVP hangar, multiplayer lobby, death screen, and shared utility styles. Main menu: `.mm-left`, `.mm-right`, `.mm-eyebrow`, `.mm-title`, `.mm-title-accent`, `.mm-nav`, `.mm-nav-num`, `.mm-stat-num`, `.mm-stat-label`, `.mm-stats-row`, `.mm-xp-bar`, `.mm-xp-fill`. Nav items: `.sci-nav-item`. Callsign screen: `.cs-inner`, `.cs-eyebrow`, `.cs-title`, `.cs-field-label`, `.cs-input-wrap`. Pause: `.ps-panel`, `.ps-header`, `.ps-title`, `.ps-status`, `.ps-body`, `.ps-btn`, `.ps-btn.danger`, `.ps-footer`, `.ps-hint`. Leaderboard: `.lb-top`, `.lb-title`, `.lb-filters`, `.lb-filter-tab`, `.lb-table-wrap`, `.lb-table-header`, `.lb-th`, `.lb-row`, `.lb-rank`, `.lb-callsign`, `.lb-val`. PVP/multiplayer: `.mp-screen`, `.mp-top`, `.mp-screen-title`, `.mp-body`, `.mp-left`, `.mp-chassis-row`, `.mp-chassis-btn`, `.mp-sec-label`. Drag-and-drop: `.mech-equip-slot` (applied alongside `.lo-slot` on doll slots in the loadout overlay), `.bp-cell`, `.arm-picker-overlay`, `.arm-picker-box`, `.arm-picker-btn`. Typography utilities: `.tw-heading`, `.tw-heading--gold`, `.tw-subheading`, `.tw-label`, `.tw-label--dim`, `.tw-panel-title`, `.tw-desc`, `.tw-stat-value`, `.tw-mono`. Comparison panel: `.cmp-panel` (currently `display:none !important` — replaced by hover cards). Keyframes: `titleFlicker`, `pulse`, `pausePulse`. |
| `js/constants.js` | All immutable game data. `CHASSIS`, `WEAPONS`, `WEAPON_NAMES` (canonical display name map for all 13 weapons), `SHIELD_SYSTEMS`, `AUGMENTS`, `LEG_SYSTEMS`, `COVER_DEFS`, `ARENA_DEFS`, `ENEMY_COLORS`, `COMMANDER_COLORS`, `MEDIC_COLORS`, `BOSS_COLORS`, `CHASSIS_WEAPONS/MODS/SHIELDS/LEGS/AUGS` (chassis restriction Sets), `STARTER_LOADOUTS`, `SLOT_ID_MAP`, `GAME_CONFIG`, Supabase config constants, leaderboard constants. Defines `window.TW = {}` namespace. |
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
| `js/menus.js` | All menu and overlay logic. Defines `UI_COLORS` const (JS color constants mirroring CSS tokens, for inline styles in template literals). Main menu nav (`proceedToMainMenu`, `showCampaignSubMenu`, `hideCampaignSubMenu`, `returnToMainMenu`, `confirmNewCampaign`, `_showNewCampaignChassisSelect`). Hangar nav (`returnToHangar`, `returnToHangarForMissionSelect`, `startGame`, `startMultiplayer`, `goToMainMenu`, `_execDropInTween`). Death screen (`showDeathScreen`, `respawnMech`, `campaignDeathToMissionSelect`). Pause (`togglePause`). Loadout overlay (`toggleStats`, `populateLoadout`, `_renderHullBars`, `_renderGearBonusesPanel`, `_renderActivePerksPanel`, `_renderWeaponBar`). Hover card system (`_buildSingleCardHtml`, `_buildHoverHtml`, `_showSlotHover`, `_hideSlotHover`). Inventory management (`populateInventory`, `_equipItem`, `_equipItemToSlot`, `_unequipItem`, `_scrapItem`, `_showArmPicker`, `_updateInvCount`). Legacy item detail functions still present but no longer wired to click handlers (`_showItemDetail`, `_renderItemDetail`, `_buildItemComparisonHTML`, `_setCompareArm`). Leaderboard (`showLeaderboard`, `closeLeaderboard`, `submitLeaderboardEntry`, `_lbSetFilter`, `_renderScores`, `_sortScores`). Game cleanup (`_cleanupGame`). |
| `js/loot-system.js` | ARPG loot layer. Item generation (`generateItem`, `rollRarity`, `rollAffixes`), rarity definitions (`RARITY_DEFS`), affix pool (`AFFIX_POOL`), item base stats (`ITEM_BASES`), unique item generation (`generateUniqueItem`, `rollBossDrops`), inventory management (`_inventory`, `_equipped`, `_gearState`, `recalcGearStats`, `INVENTORY_MAX=20`), equipment ground drops (`spawnEquipmentDrop`, `checkEquipmentPickups`), starter gear (`equipStarterGear`, `_createStarterItem`), inventory reset (`resetInventory`). Unique item effect helpers (all active): `hasUniqueEffect`, `applyFrontalAbsorb`, `getShieldDRBonus`, `getUnstoppableSpeedBonus`, `checkImpactArmor`, `getDualReloadBonus`, `checkDoubleStrike`, `spawnModCover`, `triggerSwarmBurst`, `getAdaptiveArmorDR`, `checkTitanSmash`, `triggerTitanSmash`, `updateColossusStand`, `getColossusDmgMult`, `getColossusDR`, `triggerCoreOverload`, `triggerMatrixBarrier`, `isMatrixBarrierActive`. Stubbed (Phase 7 not wired): `triggerEchoStrike` (Echo Frame), `checkMirrorShot` (Mirror Shard). Campaign inventory persistence (`saveInventory`, `loadCampaignInventory`, `saveCampaignProgress`, `loadCampaignProgress`, `_scheduleCloudSave`). 2H weapons (`siege`, `chain`) excluded from loot drops. |
| `js/enemy-types.js` | Special enemy types (Scout, Enforcer, Technician, Berserker, Sniper Elite, Drone Carrier) defined in `ENEMY_TYPE_DEFS`. Elite modifier system defined in `ELITE_MODIFIERS` (Vampiric, Shielded, Explosive, Swift, Armored, Splitting). Functions: `spawnSpecialEnemy`, `_initScout`, `_initEnforcer`, `_initTechnician`, `_initBerserker`, `_initSniperElite`, `_initDroneCarrier`, `applyEliteModifier`, `_rollEliteModifier`, `handleEliteDamage`, `handleEliteDeath`, `handleVampiricHeal`, `updateSpecialEnemies`, `_getEnemySpawnConfig`. |
| `js/arena-objectives.js` | Arena layout generator and objective system. Arenas defined in `ARENA_DEFS` (4 layouts: Corridors, Pit, Stronghold, Tower Defense), objectives in `OBJECTIVE_DEFS` (Survival, Assassination, Defense, Salvage). Arena cover generators: `generateCorridors`, `generatePit`, `generateStronghold`, `generateTowerDefense`. Objective lifecycle: `selectArena`, `selectObjective`, `initObjective`, `updateObjectives`, `cleanupObjective`, `shouldEndRound`. HUD helpers: `getArenaLabel`, `getObjectiveLabel`, `getObjectiveLootBonus`. Exports `_arenaState` object — mutate properties only, never reassign. |
| `js/campaign-system.js` | Campaign missions, chapter/mission data, XP system (`getXPForLevel`, `getXPToNextLevel`, `getXPMultiplier`, `awardMissionXP`), mission modifiers (`MISSION_MODIFIERS`, `rollMissionModifier`), bonus objectives (`rollBonusObjective`, `trackBonusObjective`, `finalizeBonusObjective`), enemy composition (`generateEnemyComposition`), campaign flow (`getCampaignMission`, `getCampaignEnemyConfig`, `completeCampaignMission`, `applyCampaignDeathPenalty`), localStorage save/load (`saveCampaignState`, `loadCampaignState`). Mission select overlay (`showMissionSelect`, `_selectChapter`, `_selectMission`, `_deployFromMissionSelect`, `_closeMissionSelect`). Supply shop (`refreshShopStock`, `shopBuyItem`, `shopSellItem`, `showShop`, `_shopBuy`, `_shopSell`, `_shopRestock`, `_closeShop`, `_shopGetCategory`, `_shopSortCategories`, `_shopRenderCategory`, `_shopGetHoverCard`, `_shopShowHover`, `_shopHideHover`). Loadout slot management (`saveLoadoutSlot`, `loadLoadoutSlot`, `deleteLoadoutSlot`, `showLoadoutSlots`). Skill tree and chassis upgrades (`applyChassisUpgrades`, `purchaseSkillNode`, `getSkillTreeBonuses`, `getAvailableSkillPoints`, `_showUpgradesPanel`). Mission rewards (`MISSION_REWARDS`, `getMissionReward`, `awardMissionReward`). Chapter helpers (`isChapterUnlocked`, `isMissionCompleted`, `getChapterCompletionCount`). Cloud save restore (`_restoreFromCloudData`). Note: cloud save write/read functions (`saveCampaignProgress`, `loadCampaignProgress`, `_scheduleCloudSave`) live in `js/loot-system.js`, not here. |
| `js/multiplayer.js` | PVP matchmaking via Socket.IO. PVP map size is 6000 (larger than standard 4000). Deathmatch kill target: 25. Connection (`mpConnect`, `mpDisconnect`). Remote players (`mpCreateRemotePlayer`, `mpDestroyRemotePlayer`, `mpCleanupMatch`). Per-frame update (`mpUpdate`), state broadcast (`mpSendState`), bullet broadcast (`mpBroadcastBullet`). Lobby (`mpShowLobby`, `mpHideLobby`, `mpUpdateLobbyUI`, `mpStartMatch`, `mpLeaveLobby`). PVP HUD (`mpShowPvpHud`, `mpHidePvpHud`, `mpUpdatePvpHud`). In-game chat (`mpShowInGameChat`, `mpHideInGameChat`, `mpToggleInGameChat`, `mpSendInGameChat`, `mpAddInGameChatMessage`). Kill feed (`mpShowKillFeedOverlay`, `mpAddKillFeed`, `mpRenderKillFeed`). Respawn (`mpShowRespawnCountdown`, `mpRespawnPlayer`). Match results (`mpShowMatchResults`, `mpLeaveMatchResults`). PVP cover generation (`generatePvpCover`, `mpNudgeOutOfCover`). PVP hangar (separate from standard hangar — `mpShowPvpHangar`, `mpHidePvpHangar`, `_pvpRenderHangar`, `_pvpSelectSlot`, `_pvpSetChassis`, `_pvpJoinLobby`, `_pvpDeployFromHangar`). Public API: `mpUpdate`, `mpBroadcastBullet`, `mpDrawMinimapPlayers`, `mpIsPvpMenuOpen`, `mpShowPvpMenu`, `mpClosePvpMenu`. |
| `js/events.js` | All top-level global event listeners: window resize (`_onWindowResize`), document click (dropdown close via `closeAllDD`), main keydown handler (perk menu 1–4 pick, death screen Enter/ESC, equip-prompt Enter/ESC, chassis-select overlay, leaderboard close, campaign overlay closes, stats overlay, pause toggle, PVP chat T key), `_mainMenuKeyNav` (main menu arrow-key focus, ESC closes campaign sub-menu), `handlePlayerMovement`, `handlePlayerFiring`, and inventory drag-and-drop handlers (`_onEquipDragStart`, `_onSlotDragOver`, `_onSlotDragLeave`, `_onSlotDrop`). |
| `js/init.js` | Game startup and Phaser initialization. Animated grid canvas (`_startGridCanvas`, `startMenuGrid`), callsign input handlers (`_csKeyDown`, `_updateCallsignBtn`), callsign pre-fill IIFE, Phaser scene lifecycle functions (`preload`, `create`, `update`), objective round-end polling (`handleObjectiveRoundEnd` called each frame from `update()`), and `window.onload` bootstrap. Loaded last — after `events.js`. |
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
**Lives in:** `js/perks.js` — `const _perks`, `showPerkMenu()`, `pickPerk()`, `selectPerks()`, `_showEquipPrompt()`, `resetRoundPerks()`; `let _perkState`, `_pickedPerks[]`, `_lastOfferedPerks[]` in `js/state.js`
**What it does:** ~400+ perks organized by category (universal, chassis, weapon/mod-specific, legendary). Offered in a 4-slot menu after each round's extraction. Perks apply immediately on pick via `p.apply()` which mutates `_perkState`. Legendaries require 2+ perks in their category and round 5+. `selectPerks()` is pure (no DOM) — call it before `showPerkMenu()`.
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
**What it does:** 8 bosses cycle every 5 rounds (R5=Warden, R10=Razors, R15=Architect, R20=Juggernaut, R25=Swarm, R30=Mirror, R35=Titan, R40=Core). Each boss has unique phase mechanics, a DOM-based HP bar (`#boss-hud`), and an `e._onDestroy` callback for cleanup. Swarm boss uses shared `_swarmState.hp` pool — damage bypasses individual enemy HP.
**Key pattern:** Every boss must call `_hideBossHPBar()` in `e._onDestroy`. Boss HP bar is DOM-based, not Phaser.
**Connects to:** `startRound()` (detects boss round), `damageEnemy()` (swarm check via `e._isSwarmUnit`), `spawnEquipmentLoot()` (boss drops)

### Loot System (ARPG Layer)
**Lives in:** `js/loot-system.js`
**What it does:** Generates randomized items with rarity (Common→Legendary), rolled affixes from `AFFIX_POOL`, and base stats from `ITEM_BASES`. Ground drops render with floating animations and rarity glow effects. Player walks over to pick up. Items go to `_inventory[]`. Gear equipped to `_equipped{}` affects `_gearState{}` via `recalcGearStats()`.
**Key constants:** `RARITY_DEFS` (colors, scrap values, affix counts), `AFFIX_POOL` (stat modifiers with weights/ranges), `INVENTORY_MAX=20`
**Gear stat keys (active in gameplay):** `dmgFlat` `dmgPct` `critChance` `critDmg` `reloadPct` `coreHP` `armHP` `legHP` `allHP` `dr` `shieldHP` `shieldRegen` `absorbPct` `dodgePct` `speedPct` `modCdPct` `modEffPct` `lootMult` `autoRepair` `pellets` `splashRadius`
**Gear stat keys (accumulated, no gameplay effect yet):** `accuracy` — no general accuracy system exists; stat is displayed in stat overlay only
**Unique effects stubbed (Phase 7):** `echoStrike` (Echo Frame), `mirrorShot` (Mirror Shard) — stubs exist in `triggerEchoStrike()` and `checkMirrorShot()`, not yet wired to procs
**2H weapons excluded from loot drops:** `siege` and `chain` cannot drop as loot items
**Campaign persistence:** `saveInventory`, `loadCampaignInventory`, `saveCampaignProgress`, `loadCampaignProgress`, `_scheduleCloudSave` all live here (not in `campaign-system.js`)
**Connects to:** `damageEnemy()` → death triggers `spawnEquipmentLoot()`, `deployMech()` calls `recalcGearStats()` to apply gear HP/shield bonuses, `populateInventory()` renders the GEAR tab

### Audio Engine
**Lives in:** `js/audio.js` — `_tone()`, `_noise()`, `sndFire()`, `sndExplosion()`, `sndEnemyDeath()`, etc.
**What it does:** Web Audio API synthesizer — no audio files required. Oscillators + noise buffers for all sounds. Throttled via `_sndThrottle{}` (per-sound last-played timestamps). Node count capped at `_MAX_NODES=48`.
**Key globals:** `let _ac` (AudioContext), `let _masterVol=0.32`, `let _activeNodes=0`, `let _lastNodeStartTime=0`, `let _audioReady=false`
**Lifecycle:** AudioContext is created only after the first user gesture (`_audioReady` flag). Tab-visibility changes suspend/resume the context. A 2000 ms `setInterval` audit resets `_activeNodes` if the context is closed or all nodes must have expired.

### HUD System
**Lives in:** `js/hud.js` — `updateHUD()`, `updateBars()`, `updatePaperDoll()`, `updateCooldownOverlays()`, `drawMinimap()`; `js/rounds.js` — `updateRoundHUD()`
**What it does:** Bottom-left console frame with paper doll (part HP colors) and 4 weapon bar rows (L.ARM/R.ARM/CORE/DEFENSE). Reload progress bars fill right-to-left as weapons cool down. Round HUD shows current round, remaining enemies, total kills. Minimap (160×160 canvas) shows enemies, loot, extraction point, player.
**DOM element IDs:** `hud-container`, `slot-L/R/M/S`, `wr-fill-L/R/M/S`, `wr-st-L/R/M/S`, `round-hud`, `round-num`, `round-remaining`, `round-kills`, `minimap-canvas`

### Mech Visual System
**Lives in:** `js/mechs.js` — `buildPlayerMech()`, `buildEnemyMech()`, `buildEnemyTorso()`, `refreshMechColor()`, `syncVisuals()`, `syncChassisEffect()`, `syncLightTrail()`, `syncMediumFootsteps()`, `syncHeavyShockwave()`, `handleRageGhosts()`, `_spawnSpectreClone()`
**What it does:** Player uses two separate Phaser objects — `player` (invisible physics rectangle, moves with WASD) and `torso` (visual container, rotates toward mouse each frame). Enemies use `e.visuals` (body, faces movement) and `e.torso` (full mech, aims at player). Each chassis has a distinct movement effect (Light: ghost trail, Medium: blur + footprints, Heavy: shockwave rings).
**Important:** Always sync both objects. `e.visuals.setPosition(e.x, e.y)` AND `e.torso.setPosition(e.x, e.y)`.

### Loadout Overlay (GEAR Screen)
**Lives in:** `js/menus.js` — `populateLoadout()`, `_renderHullBars()`, `_renderGearBonusesPanel()`, `_renderActivePerksPanel()`, `_renderWeaponBar()`; `css/garage.css` — all `.lo-*` classes
**What it does:** Three-column overlay (`grid-template-columns: 220px 1fr 440px`). Left: chassis stats, HP bars, total HP/shield, gear bonuses, active perks. Center: chassis traits bar, mech silhouette with 8 equipment slots, weapon bar. Right: backpack (4×5 grid, 20 slots × 100×100px). Hover cards appear on `mouseenter` for both doll slots and backpack cells.
**UI details:** See UI_CONVENTIONS.md — Section 6 (Loadout Screen Architecture) for layout, render entry point, shared `.lo-slot` class, hover card system, and equipment doll slot labels.

### HUD Element IDs Reference

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

### Slot Label Naming

See UI_CONVENTIONS.md — Section 5 (Slot Label Naming) for the full mapping tables.

### Rarity Colors

See UI_CONVENTIONS.md — Section 3 (Color Meaning → Rarity Colors) for the full table.

### Inverted Stats (Negative Is Better)

See UI_CONVENTIONS.md — Section 4 (Inverted Display Stats) for the full table and implementation rules.

### Color Meanings (General UI)

See UI_CONVENTIONS.md — Section 3 (Color Meaning) for the full semantic color table.

---

## Naming Conventions & Patterns

- **Global state variables:** underscore prefix — `_round`, `_perkState`, `_gearState`, `_inventory`, `_equipped`
- **Boolean flags:** `isDeployed`, `isJumping`, `isShieldActive`, `isRageActive`, `_roundActive`, `_extractionActive`
- **Private helpers:** underscore prefix — `_healPlayerFull()`, `_resetHUDState()`, `_cleanupGame()`
- **DOM element IDs:** kebab-case — `round-hud`, `hud-container`, `boss-hud`, `enemy-doll-hud`
- **Slot IDs in garage dropdown:** single uppercase letter — `L` `R` `M` (mod) `A` (aug) `G` (leg) `S` (shield) `C` (color)
- **Slot keys in `loadout`:** `L` `R` `mod` `aug` `leg` `shld` (note: `shld` not `shield`)
- **Slot keys in `_equipped`:** different again — `L` `R` `chest` `arms` `legs` `shield` `mod` `augment`
- **Garage slot ID → loadout key:** use `SLOT_ID_MAP` constant: `{ L:'L', R:'R', M:'mod', A:'aug', G:'leg', S:'shld' }`. `_equipped` uses a different set: `{ L, R, chest, arms, legs, shield, mod, augment }`.
- **`selectPerks()`:** pure perk selection (no DOM). Call before `showPerkMenu()` renders cards.
- **`destroyEnemyWithCleanup(scene, e)`:** centralised enemy teardown. Use wherever enemies are force-removed outside the normal damage path.
- **Enemy color palettes:** `ENEMY_COLORS`, `COMMANDER_COLORS`, `MEDIC_COLORS`, `BOSS_COLORS` (all keyed by chassis/type)
- **typeof guards:** External JS functions are always called with `typeof fn === 'function'` guards to survive file load failures
- **`UI_COLORS` const in `js/menus.js`:** mirrors CSS tokens for use in JS template literal inline styles — keeps inline colors consistent with CSS variables without needing `getComputedStyle`

---

## Notes

- **Cover origin is top-left (0,0):** Always use `c.coverCX` / `c.coverCY` for true center in LOS/distance checks — never `c.x/c.y` directly.
- **Phaser groups persist across deploys:** `bullets`, `enemyBullets`, `enemies`, `coverObjects` are created once in `create()` and never destroyed — only `.clear(true, true)` their children.
- **`_roundClearing=true` blocks `update()`** — do not start any game logic while true.
- **`_arenaState` from arena-objectives.js** — mutate its properties in place, never reassign the whole object.
- **Campaign enemy scaling uses `_activeCampaignConfig?.enemyLevel || _round`** — never use raw `_round` for campaign enemy HP/speed.
- **Cloud save lives in loot-system.js** — `saveCampaignProgress()`, `loadCampaignProgress()`, and `_scheduleCloudSave()` are in `js/loot-system.js`, not `js/campaign-system.js`. Campaign-system.js handles localStorage only.
- **`.lo-slot` is shared** — see UI_CONVENTIONS.md Section 6 for details.
- **Comparison panel is disabled** — see UI_CONVENTIONS.md Section 6 (Hover Card System).
- **Version display:** The version number is displayed in `#callsign-version` and `#main-menu-version` elements, populated at runtime. Tracked in CHANGELOG.md.
- **No cache-busting query strings** — see CLAUDE.md DO NOT list #13.
