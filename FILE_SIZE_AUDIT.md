# JS File Size Audit — Tech Warrior Online

_Audit date: 2026-03-28. No code was changed during this session._

---

## File Metrics

| File | Lines | Size (KB) | Approx Tokens | Functions Defined |
|---|---|---|---|---|
| `js/skill-tree-data.js` | 8,467 | 137.9 | 35,300 | 0 |
| `js/multiplayer.js` | 2,660 | 113.0 | 28,900 | 56 |
| `js/menus.js` | 2,550 | 119.7 | 30,600 | 63 |
| `js/enemies.js` | 2,431 | 116.5 | 29,800 | 37 |
| `js/combat.js` | 1,945 | 89.6 | 22,900 | 38 |
| `js/loot-system.js` | 1,902 | 83.0 | 21,200 | 49 |
| `js/campaign-system.js` | 1,812 | 78.9 | 20,200 | 48 |
| `js/perks.js` | 1,038 | 125.2 | 32,100 | 8 |
| `js/skill-tree.js` | 999 | 37.3 | 9,600 | 25 |
| `js/arena-objectives.js` | 921 | 39.4 | 10,100 | 29 |
| `js/enemy-types.js` | 861 | 35.0 | 8,900 | 14 |
| `js/mods.js` | 815 | 36.4 | 9,300 | 17 |
| `js/garage.js` | 644 | 29.3 | 7,500 | 16 |
| `js/rounds.js` | 554 | 25.1 | 6,400 | 14 |
| `js/hud.js` | 543 | 22.3 | 5,700 | 12 |
| `js/constants.js` | 525 | 40.4 | 10,300 | 0 |
| `js/mechs.js` | 441 | 17.9 | 4,600 | 12 |
| `js/audio.js` | 409 | 16.1 | 4,100 | 31 |
| `js/cover.js` | 395 | 18.8 | 4,800 | 3 |
| `js/events.js` | 347 | 15.6 | 4,000 | 6 |
| `js/init.js` | 284 | 12.3 | 3,200 | 8 |
| `js/utils.js` | 200 | 7.3 | 1,900 | 12 |
| `js/state.js` | 138 | 8.4 | 2,200 | 0 |

---

## Analysis

### Size Flags

| File | Lines | Flag |
|---|---|---|
| `js/skill-tree-data.js` | 8,467 | **LARGE — candidate for splitting** _(pure data — see note below)_ |
| `js/multiplayer.js` | 2,660 | **LARGE — candidate for splitting** |
| `js/menus.js` | 2,550 | **LARGE — candidate for splitting** |
| `js/enemies.js` | 2,431 | **LARGE — candidate for splitting** |
| `js/combat.js` | 1,945 | **LARGE — candidate for splitting** |
| `js/loot-system.js` | 1,902 | **LARGE — candidate for splitting** |
| `js/campaign-system.js` | 1,812 | **LARGE — candidate for splitting** |
| `js/perks.js` | 1,038 | **NOTABLE — monitor for growth** |

> **Note on `skill-tree-data.js`:** This file contains zero functions. Its entire 8,467 lines
> are a single `const SKILL_TREE_DATA` object literal with three chassis trees (light, medium,
> heavy), each with 193 nodes. Splitting it would mean extracting per-chassis data into
> `skill-tree-data-light.js`, `skill-tree-data-medium.js`, `skill-tree-data-heavy.js` and
> combining them at load time. The file has no logic to refactor — only data to reorganise.

> **Note on `perks.js`:** Although under 1,500 lines, its **token density is unusually high**
> (32,100 tokens from 1,038 lines — the largest token count of any logic file in the project).
> This is because the perk dictionary stores long descriptive strings per entry. Growth of the
> perk dictionary will push this file toward LARGE quickly.

---

### Totals

| Metric | Value |
|---|---|
| **Total lines** | **30,881** |
| **Total size** | **1,224.9 KB** |
| **Total approx tokens** | **313,700** |

---

### LARGE File Function Groupings

The following groupings identify natural split points in each file flagged as LARGE (excluding
`skill-tree-data.js` which is pure data).

---

#### `js/multiplayer.js` — 2,660 lines · 56 functions

**Connection / Session Lifecycle**
`mpConnect`, `mpDisconnect`, `mpCleanupMatch`

**Remote Player Management**
`mpCreateRemotePlayer`, `mpDestroyRemotePlayer`

**In-Match Gameplay**
`_mpApplyDamage`, `mpSpawnRemoteBullet`, `mpUpdate`, `mpSendState`, `mpBroadcastBullet`,
`mpDeployPVP`, `mpRespawnPlayer`, `mpShowRespawnCountdown`, `mpNudgeOutOfCover`,
`generatePvpCover`

**Lobby**
`mpShowLobby`, `mpHideLobby`, `_mpToggleReady`, `mpUpdateLobbyUI`, `mpStartMatch`,
`mpLeaveLobby`

**Chat (Lobby + In-Game)**
`mpSendChat`, `mpShowChat`, `mpShowInGameChat`, `mpHideInGameChat`, `mpToggleInGameChat`,
`mpInGameChatKey`, `mpSendInGameChat`, `mpAddInGameChatMessage`

**HUD / UI / Kill Feed**
`mpShowKillFeedOverlay`, `mpAddKillFeed`, `mpRenderKillFeed`, `mpShowMatchResults`,
`mpLeaveMatchResults`, `mpShowPvpHud`, `mpHidePvpHud`, `mpUpdatePvpHud`,
`mpDrawMinimapPlayers`

**PVP Hangar**
`mpShowPvpHangar`, `mpHidePvpHangar`, `_pvpCloseAllDD`, `_pvpToggleDD`, `_pvpGetSlotLabel`,
`_pvpBuildDropdown`, `_pvpBuildColorDD`, `_pvpToggleColorDD`, `_pvpRenderHangar`,
`_pvpSelectSlot`, `_pvpSetChassis`, `_pvpJoinLobby`, `_pvpBackToMenu`,
`_pvpDeployFromHangar`, `_pvpQuitToMenu`

**PVP Menu**
`mpShowPvpMenu`, `mpClosePvpMenu`, `mpIsPvpMenuOpen`

_Natural splits: **(A)** connection + lobby + chat → `multiplayer-lobby.js`; **(B)** in-match
gameplay + HUD → `multiplayer-match.js`; **(C)** PVP hangar → `multiplayer-hangar.js`;
`mpConnect`/`mpDisconnect`/socket bootstrap stays in a thin `multiplayer.js`._

---

#### `js/menus.js` — 2,550 lines · 63 functions

**Navigation / Screen Transitions**
`returnToHangar`, `returnToMainMenu`, `goToMainMenu`, `proceedToMainMenu`, `startGame`,
`startMultiplayer`, `respawnMech`, `campaignDeathToMissionSelect`,
`returnToHangarForMissionSelect`, `_cleanupGame`, `_execDropInTween`

**Main Menu & Campaign Setup**
`_updateCampaignButton`, `_updateMainMenuStats`, `hideCampaignSubMenu`, `confirmNewCampaign`,
`_showNewCampaignChassisSelect`, `_renderChassisSelect`, `_highlightChassis`,
`_startNewCampaignWithChassis`, `_cancelNewCampaign`

**Death Screen**
`showDeathScreen`, `_showCampaignDeathScreen`, `_showWarzoneDeathScreen`

**Pause / Stats / Perks**
`togglePause`, `toggleStats`, `showWarzonePerksOverlay`

**Inventory / Drag-Drop**
`toggleInventory`, `populateInventory`, `_onBpCellDrop`, `_getSlotForItem`,
`_getDragValidSlots`, `_equipItem`, `_equipItemToSlot`, `_unequipItem`, `_scrapItem`,
`_showArmPicker`, `_updateInvCount`

**Loadout Overlay**
`populateLoadout`, `_renderHullBars`, `_renderActivePerksPanel`, `_renderGearBonusesPanel`,
`_renderWeaponBar`, `_loCloseColorDD`, `_loToggleColorDD`, `_loBuildColorDD`,
`_loRefreshColorSwatch`

**Hover Card / Item Display**
`_statRow`, `_hpBar`, `_hpBarBoosted`, `_perkBonus`, `_perkReduction`, `_camelToTitle`,
`_buildSingleCardHtml`, `_buildHoverHtml`, `_showSlotHover`, `_hideSlotHover`

**Leaderboard**
`closeLeaderboard`, `_sortScores`, `_renderScores`, `_lbSetFilter`, `_capturePendingRun`,
`_supabaseEnabled`, `_validateScoreEntry`

_Natural splits: **(A)** inventory + loadout overlay + hover cards → `menus-inventory.js`;
**(B)** leaderboard → `menus-leaderboard.js`; **(C)** death screen + pause + warzone perks →
`menus-overlays.js`; navigation + main menu chassis select stays in a thinner `menus.js`._

---

#### `js/enemies.js` — 2,431 lines · 37 functions

**Regular Enemy Spawning**
`randomEnemyLoadout`, `spawnEnemy`, `_assignEnemyToSquad`, `spawnCommander`, `spawnMedic`

**AI State Machine**
`handleEnemyAI`, `_updateEnemyAIState`, `_calcEnemyBehaviorVelocity`,
`_handleEnemyFiringDecision`, `_applyEnemyObstacleAvoidance`,
`_applyEnemyPassiveShieldRegen`, `_computeEnemyVisibility`

**Enemy Firing**
`enemyFire`, `_dispatchEnemyWeapon`, `enemyFireSecondary`

**Visual Sync**
`_syncEnemyVisuals`, `syncEnemyChassisEffect`, `_syncEnemyLightFX`, `_syncEnemyMediumFX`,
`_syncEnemyHeavyFX`

**Boss Infrastructure / HP Bar**
`spawnBoss`, `_bossSpawnPos`, `_showBossTitle`, `_buildBossEnemy`, `_addBossLabel`,
`_addBossHPBar`, `_updateBossHPBar`, `_hideBossHPBar`

**Boss Spawners (8 individual bosses)**
`spawnWarden`, `spawnTwinRazors`, `spawnArchitect`, `spawnJuggernaut`, `spawnSwarm`,
`spawnMirror`, `spawnTitan`, `spawnCore`

**Cleanup**
`destroyEnemyWithCleanup`

_Natural splits: **(A)** all 8 boss spawners + boss infrastructure → `bosses.js` (~900 lines);
**(B)** AI state machine + firing → `enemy-ai.js`; regular spawning + visual sync + cleanup
stays in a thinner `enemies.js`._

---

#### `js/combat.js` — 1,945 lines · 38 functions

**Weapon Firing Dispatch**
`fire`, `fireStandard`, `fireFTH`, `fireRAIL`, `fireSIPHON`, `fireGL`, `fireRL`, `fireSG`,
`firePLSM`, `fireSR`

**Siphon Beam**
`updateSiphonBeam`, `_drawSiphonBeam`, `_siphonBeamHide`, `_clearSiphonSlows`,
`_clearAllSiphonSlows`

**Player Damage Processing**
`processPlayerDamage`, `_applyExplosivePlayerDamage`, `_applyPassiveShieldAbsorption`

**Enemy Damage Processing**
`damageEnemy`, `_resolveEnemyDeath`, `handleBulletEnemyOverlap`, `_calcBulletDamage`,
`_handleShieldedHit`, `_applyIncendiaryProc`, `_applyChainPlasma`,
`_applyFlameBulletEffects`, `_registerEnemyBulletOverlap`

**Area Effects / Mines**
`createExplosion`, `_triggerTremor`, `_drawMineGraphic`, `dropMine`, `dropEnemyMine`

**Shield / Regen / Passives**
`handleShieldRegen`, `_applyPassiveAuras`, `_applyHeavyChassisRegen`, `_applyShieldRegen`,
`_applyAutoRepair`, `_applyFieldEngineer`

_Natural splits: **(A)** player damage + shield/regen → `combat-player.js`; **(B)** enemy
damage + bullet overlap → `combat-enemy.js`; weapon firing + siphon beam stays in
`combat.js`._

---

#### `js/loot-system.js` — 1,902 lines · 49 functions

**Item Generation**
`generateItem`, `generateUniqueItem`, `rollBossDrops`, `rollRarity`, `rollAffixes`,
`_selectItemType`, `_selectBaseItem`, `_getEquipDropChance`, `_createStarterItem`,
`equipStarterGear`

**Ground Drops (Campaign)**
`spawnEquipmentDrop`, `_removeEquipmentDrop`, `checkEquipmentPickups`,
`_showLootPickupNotification`, `_showFloatingWarning`, `spawnEquipmentLoot`,
`_drawLootIcon`, `cleanupEquipmentDrops`

**Warzone Loot Orbs**
`spawnLoot`, `removeLoot`, `checkLootPickups`, `applyLoot`

**Gear Stats Calculation**
`recalcGearStats`

**Unique Item Effects**
`hasUniqueEffect`, `applyFrontalAbsorb`, `getShieldDRBonus`, `getUnstoppableSpeedBonus`,
`checkImpactArmor`, `getImpactArmorDR`, `getDualReloadBonus`, `checkDoubleStrike`,
`spawnModCover`, `triggerSwarmBurst`, `getAdaptiveArmorDR`, `checkTitanSmash`,
`triggerTitanSmash`, `updateColossusStand`, `getColossusDmgMult`, `getColossusDR`,
`triggerCoreOverload`, `triggerMatrixBarrier`, `isMatrixBarrierActive`

**Inventory / Save-Load**
`resetInventory`, `saveInventory`, `loadCampaignInventory`, `saveCampaignProgress`,
`_scheduleCloudSave`, `debouncedCampaignSave`, `loadCampaignProgress`

_Natural splits: **(A)** unique item effects → `loot-unique-effects.js` (~300 lines);
**(B)** item generation + rarity/affix rolling → `loot-generator.js`; ground drops + warzone
orbs + save/load stays in `loot-system.js`._

---

#### `js/campaign-system.js` — 1,812 lines · 48 functions

**XP / Level System**
`getXPForLevel`, `getXPToNextLevel`, `getXPMultiplier`, `getBaseMissionXP`, `awardMissionXP`,
`_updateCampaignXPBar`

**Mission Modifiers / Objectives**
`rollMissionModifier`, `rollBonusObjective`, `trackBonusObjective`, `finalizeBonusObjective`

**Enemy Composition**
`_getCompositionTier`, `generateEnemyComposition`, `getCampaignEnemyConfig`

**Campaign Mission Flow**
`getCampaignMission`, `getChapterCompletionCount`, `isChapterUnlocked`, `isMissionCompleted`,
`completeCampaignMission`, `applyCampaignDeathPenalty`, `getMissionReward`,
`awardMissionReward`

**Mission Select UI**
`showMissionSelect`, `_openShopFromMission`, `_openLoadoutFromMission`,
`_openSkillTreeFromMission`, `_selectChapter`, `_selectMission`, `_deployFromMissionSelect`,
`_closeMissionSelect`

**Save / Load**
`saveCampaignState`, `loadCampaignState`, `_restoreFromCloudData`

**Supply Shop**
`showShop`, `refreshShopStock`, `getItemSellPrice`, `shopBuyItem`, `shopSellItem`,
`_shopGetCategory`, `_shopSortCategories`, `_shopRenderCategory`, `_shopSelectSell`,
`_shopBuy`, `_shopSell`, `_shopRestock`, `_shopGetHoverCard`, `_shopShowHover`,
`_shopHideHover`, `_closeShop`

_Natural splits: **(A)** supply shop (16 functions, ~500 lines) → `campaign-shop.js`;
**(B)** mission select UI → `campaign-mission-select.js`; XP + composition + flow + save/load
stays in `campaign-system.js`._
