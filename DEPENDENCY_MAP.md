# Tech Warrior Online — Dependency Map

Generated: 2026-03-20
Purpose: Guide the upcoming file split. Every dependency listed here must be resolved before any file can be safely moved to its target location.

**Files covered:**
- `index.html` — monolithic game shell (inline `<script>` and `<style>`)
- `js/loot-system.js`
- `js/enemy-types.js`
- `js/arena-objectives.js`
- `js/campaign-system.js`
- `js/multiplayer.js`

**Load order:** `loot-system.js → enemy-types.js → arena-objectives.js → campaign-system.js → multiplayer.js → inline <script>`

---

## Section 1 — INDEX.HTML → EXTERNAL FILES

Every function call in `index.html`'s inline `<script>` that is defined in one of the five external JS files.
`✓` = call is wrapped in a `typeof … === 'function'` guard.
`✗` = called directly with no guard (crash risk if file fails to load).

### 1.1 Calls into `js/enemy-types.js`

| Function | Guard | Call sites in index.html |
|---|---|---|
| `spawnSpecialEnemy()` | ✓ | ~4925, ~4985 |
| `applyEliteModifier()` | **✗** (simulation path) / ✓ (campaign path) | ~4934 (no guard), ~4990 (no guard), ~4995 (no guard), ~5018 (no guard) |
| `_rollEliteModifier()` | **mixed** | ~4932 (no guard), ~4988 (no guard), ~5016 (no guard) |
| `updateSpecialEnemies()` | ✓ | ~3179 |
| `handleEliteDamage()` | ✓ | ~10487 |
| `handleEliteDeath()` | ✓ | ~5627, ~10698 |
| `handleVampiricHeal()` | ✓ | ~6151 |
| `_getEnemySpawnConfig()` | ✓ | ~4958 |

> **Risk:** `applyEliteModifier` and `_rollEliteModifier` are called without typeof guards in the simulation enemy-spawn path. If `enemy-types.js` fails to load, these calls will throw.

### 1.2 Calls into `js/arena-objectives.js`

| Function | Guard | Call sites in index.html |
|---|---|---|
| `selectArena()` | ✓ | ~4884 |
| `selectObjective()` | **✗** | ~4887 |
| `initObjective()` | ✓ | ~4897 |
| `updateObjectives()` | ✓ | ~3180 |
| `cleanupObjective()` | ✓ | ~4891, ~5985 |
| `shouldEndRound()` | ✓ | ~3198, ~5726 |
| `getArenaLabel()` | ✓ | ~4899 |
| `getObjectiveLabel()` | ✓ | ~4900 |
| `_showArenaLabel()` | ✓ | ~4949 (moved from index.html to arena-objectives.js in v4.4) |
| `_initPitZone()` | ✓ | ~4945 |

**Direct `_arenaState` mutations (no function call — object from arena-objectives.js mutated inline):**

| Access | Location | Notes |
|---|---|---|
| `_arenaState.currentArena = arenaKey` | ~4888 | Write — must mutate, never reassign |
| `_arenaState.currentObjective = objKey` | ~4889 | Write |
| `_arenaState.currentArena` (read) | ~5980 | Read in `cleanupObjective` guard |
| `_arenaState.currentObjective` (read) | ~5982 | Read in `cleanupObjective` guard |

**Arena generator functions** (`generateCorridors`, `generatePit`, `generateStronghold`, `generateTowerDefense`) are NOT called by name. They are invoked dynamically at ~7407:
```javascript
window[arenaDef.generator](scene, coverObjects, placeAt, COVER_DEFS)
```
`COVER_DEFS` is passed as a parameter — the generator functions have no direct global dependency on it.

### 1.3 Calls into `js/loot-system.js`

#### Guarded calls (✓)

| Function | Guard | Call sites in index.html |
|---|---|---|
| `recalcGearStats()` | ✓ | ~5228 |
| `spawnEquipmentLoot()` | ✓ | ~10410 |
| `resetInventory()` | ✓ | ~12076, ~13291 |
| `triggerSwarmBurst()` | ✓ | (unique effect helper) |
| `getAdaptiveArmorDR()` | ✓ | (unique effect helper) |
| `checkTitanSmash()` | ✓ | (unique effect helper) |
| `updateColossusStand()` | ✓ | (unique effect helper — in PvE-only update block) |
| `hasUniqueEffect()` | ✓ | (unique effect helper — several mod activation functions) |
| `applyFrontalAbsorb()` | ✓ | (unique effect helper) |
| `getShieldDRBonus()` | ✓ | (unique effect helper) |
| `getImpactArmorDR()` | ✓ | (unique effect helper) |
| `checkImpactArmor()` | ✓ | (unique effect helper) |
| `isMatrixBarrierActive()` | ✓ | (unique effect helper) |
| `triggerMatrixBarrier()` | ✓ | (unique effect helper) |
| `getColossusDR()` | ✓ | (unique effect helper) |
| `getColossusDmgMult()` | ✓ | (unique effect helper) |
| `getDualReloadBonus()` | ✓ | (unique effect helper) |
| `getUnstoppableSpeedBonus()` | ✓ | (unique effect helper) |
| `checkDoubleStrike()` | ✓ | (unique effect helper) |
| `spawnModCover()` | ✓ | (unique effect helper — Blueprint Core mod activation) |
| `triggerCoreOverload()` | ✓ | (unique effect helper — Core Reactor mod activation) |
| `_showFloatingWarning()` | ✓ | (~12642 — inventory full warning) |

#### Unguarded calls (✗)

| Function | Guard | Call sites in index.html |
|---|---|---|
| `checkEquipmentPickups()` | **✗** | ~3175 (runs every frame in `update()`) |
| `cleanupEquipmentDrops()` | **✗** | ~11975 |
| `loadCampaignInventory()` | **✗** | ~13485 |
| `loadCampaignProgress()` | **✗** | ~13451, ~13472, ~13695, ~13744 |
| `saveCampaignProgress()` | **✗** | ~5231, ~6013, ~6038, ~13376, ~13518, ~13854 |
| `saveInventory()` | **✗** | ~5233, ~6015, ~6038, ~12342, ~12569, ~12605, ~12616, ~13377, ~13519 |

> **Risk:** `checkEquipmentPickups` is called every frame in `update()` without a guard. If `loot-system.js` fails to load, the game loop crashes immediately on first deploy.

**Direct loot-system.js globals read by index.html inline script:**

| Global | Access type | Locations in index.html |
|---|---|---|
| `_inventory` | read | ~5123, ~5124, ~4677, ~4707, ~5218 |
| `_equipped` | read/write | ~5124, ~5224, ~6164 |
| `_gearState` | read | ~3259, ~3269, ~3953, ~3966 (damage calc, HUD) |
| `_scrap` | read/write | ~5125, ~5226, ~12188, ~12614 |
| `RARITY_DEFS` | read | ~5814, ~12226, ~12269, ~12355, ~12434, ~12613, ~13017 |
| `INVENTORY_MAX` | read | ~12188 |

### 1.4 Calls into `js/campaign-system.js`

All calls are typeof-guarded (✓):

| Function | Call sites in index.html |
|---|---|
| `getCampaignMission()` | ~4864, ~5999, ~6345 |
| `getCampaignEnemyConfig()` | ~4866, ~6348 |
| `awardMissionXP()` | ~5989 |
| `applyCampaignDeathPenalty()` | ~13513 |
| `trackBonusObjective()` | ~5664, ~10158, ~10437, ~10537 |
| `getXPForLevel()` | ~12673 |
| `showMissionSelect()` | ~12130, ~13505, ~13506, ~13862, ~13907 |
| `saveCampaignState()` | ~5232, ~6014, ~13855 |
| `loadCampaignState()` | ~13487 |
| `applyChassisUpgrades()` | ~6009, ~6067, ~13860, ~13899 |
| `refreshShopStock()` | ~13505, ~13861, ~13901 |
| `finalizeBonusObjective()` | ~5992 |
| `completeCampaignMission()` | ~6030 |
| `awardMissionReward()` | ~6035 |
| `getSkillTreeBonuses()` | ~6366 |
| `_updateCampaignXPBar()` | ~12727 (moved from index.html to campaign-system.js in v4.4) |
| `_closeShop()` | ~13227 (ESC handler for campaign shop overlay) |
| `_closeLoadoutSlots()` | ~13233 (ESC handler for loadout slots overlay) |
| `_closeUpgrades()` | ~13239 (ESC handler for upgrades overlay) |

**Direct `_campaignState` access (no function call — object from campaign-system.js used inline):**

| Access | Location | Notes |
|---|---|---|
| `_campaignState.*` (read/write) | ~5097–5199 in `saveToCloud()` | Reads multiple properties for Supabase payload |
| `_campaignState.*` (read/write) | ~6326 in `_restoreFromCloudData()` | Restores properties from cloud data |

### 1.5 Calls into `js/multiplayer.js`

All function calls are typeof-guarded (✓):

| Function | Guard | Call sites in index.html |
|---|---|---|
| `mpUpdate()` | ✓ | ~3149 (every frame in `update()`) |
| `mpBroadcastBullet()` | ✓ | ~9612, ~9617, ~9708 |
| `mpDrawMinimapPlayers()` | ✓ | ~5826 |
| `mpIsPvpMenuOpen()` | ✓ | ~13037, ~13199, ~13213 |
| `mpShowPvpMenu()` | ✓ | ~13039 |

**Direct `_mpMatchActive` read (no typeof guard on the variable itself):**

| Access | Location | Notes |
|---|---|---|
| `if (_mpMatchActive)` | ~9612 | Read before `mpBroadcastBullet()` call in `fire()` |
| `if (!_mpMatchActive)` | ~9617 | Guard in `fire()` |
| `if (_mpMatchActive)` | ~9708 | Another path in `fire()` |

> **Risk:** `_mpMatchActive` is referenced directly as a bare variable in `fire()`. If `multiplayer.js` fails to load, these lines throw `ReferenceError`. After the split, `_mpMatchActive` must be initialised in a shared state file or `fire()` must use `window._mpMatchActive` with a falsy default.

---

## Section 2 — EXTERNAL FILES → INDEX.HTML

Globals and functions defined in `index.html`'s inline `<script>` (or `<script>` block) that are read or called by the five external files.

### 2.1 `js/enemy-types.js` reads from index.html

| Name | Type | Used for |
|---|---|---|
| `CHASSIS` | constant object | Enemy HP/speed base values |
| `SHIELD_SYSTEMS` | constant object | Shield config for special enemies |
| `ENEMY_COLORS` | constant object | Color palette for elite modifiers |
| `player` | Phaser object | Position, HP, targeting |
| `enemies` | Phaser Group | Spawn into group, iterate |
| `enemyBullets` | Phaser Group | Enemy projectile group |
| `isDeployed` | boolean | Guard: don't spawn if not in-game |
| `_round` | number | Enemy level/difficulty scaling |
| `coverObjects` | Phaser Group | Pathfinding, LOS |
| `GAME` | Phaser.Game | Scene access (renamed from `game` in v4.3) |
| `Phaser` | global | Phaser API |
| `buildEnemyMech()` | function | Called in `spawnSpecialEnemy()` |
| `buildEnemyTorso()` | function | Called in `spawnSpecialEnemy()` |
| `_roundTotal` | number | Written by `handleEliteDeath()` when spawning split enemies |

### 2.2 `js/arena-objectives.js` reads from index.html

| Name | Type | Used for |
|---|---|---|
| `player` | Phaser object | Position checks, damage zone detection |
| `enemies` | Phaser Group | Objective completion checks |
| `Phaser` | global | Phaser API (geometry, math) |
| `processPlayerDamage()` | function | Called in `_updatePitZone()` (typeof guarded) |
| `sndObjectiveStart()` | function | Called in `initObjective()` (typeof guarded) |

### 2.3 `js/loot-system.js` reads from index.html

| Name | Type | Used for |
|---|---|---|
| `player` | Phaser object | Position, HP, component stats |
| `torso` | Phaser container | Visual reference |
| `enemies` | Phaser Group | Drop loot on kill |
| `loadout` | object | Current weapon/mod/shield/aug/leg config |
| `isDeployed` | boolean | Guard: suppress pickups in hangar |
| `_round` | number | Rarity scaling for drops |
| `_perkState` | object | Perk bonuses for gear calc |
| `_gameMode` | string | `'simulation'` vs `'campaign'` vs `'pvp'` |
| `_totalKills` | number | Read for loot bonus calculations |
| `_perksEarned` | number | Read for milestone bonuses |
| `coverObjects` | Phaser Group | Drop item placement |
| `GAME` | Phaser.Game | Scene access (renamed from `game` in v4.3) |
| `Phaser` | global | Phaser API |
| `CHASSIS_WEAPONS` | constant | Valid weapon list per chassis |
| `CHASSIS_MODS` | constant | Valid mod list per chassis |
| `CHASSIS_SHIELDS` | constant | Valid shield list per chassis |
| `CHASSIS_LEGS` | constant | Valid leg list per chassis |
| `CHASSIS_AUGS` | constant | Valid augment list per chassis |
| `WEAPONS` | constant object | Weapon stat lookup |
| `STARTER_LOADOUTS` | constant object | Default loadouts per chassis |
| `sndEquipDrop()` | function | Called when loot drops |
| `sndEquipPickup()` | function | Called when gear is picked up |
| `_noise()` | function | Sound utility |
| `damageEnemy()` | function | Called by unique item on-hit effects |
| `showDamageText()` | function | Called by unique item on-hit effects |
| `saveToCloud()` | function | Called after `saveInventory()` in campaign mode |
| `_updateInvCount()` | function | Called after inventory changes |

### 2.4 `js/campaign-system.js` reads from index.html

| Name | Type | Used for |
|---|---|---|
| `_scrap` | number | Read and written (shop purchases, rewards) |
| `CHASSIS` | constant object | `applyChassisUpgrades()` modifies HP values |
| `loadout` | object | Read for mission config checks |
| `_totalKills` | number | XP/reward calculations |
| `_perksEarned` | number | Milestone/reward calculations |
| `populateStats()` | function | Called after upgrades applied (typeof guarded) |
| `populateInventory()` | function | Called after inventory changes (typeof guarded) |
| `_switchLoadoutTab()` | function | Called to refresh hangar tabs (typeof guarded) |
| `_isStats` | boolean | Read/written to track active hangar tab (typeof guarded check) |
| `_updateInvCount()` | function | Called after inventory changes (typeof guarded) |

### 2.5 `js/multiplayer.js` reads from index.html

| Name | Type | Used for |
|---|---|---|
| `torso` | Phaser container | **Written** by `mpDeployPVP()` — assigns result of `buildPlayerMech()` |
| `_lArmDestroyed` | boolean | **Written** by `_mpApplyDamage()` |
| `_rArmDestroyed` | boolean | **Written** by `_mpApplyDamage()` |
| `_legsDestroyed` | boolean | **Written** by `_mpApplyDamage()` |
| `_totalKills` | number | **Written** by `_mpApplyDamage()` on remote kill |
| `buildPlayerMech()` | function | Called in `mpDeployPVP()` to build local PVP mech |
| `updateBars()` | function | Called in `_mpApplyDamage()` after HP change (typeof guarded) |
| `updatePaperDoll()` | function | Called in `_mpApplyDamage()` after component damage (typeof guarded) |
| `createExplosion()` | function | Called on PVP death (typeof guarded) |
| `spawnDebris()` | function | Called on PVP death (typeof guarded) |
| `goToMainMenu()` | function | Called in `_pvpBackToMenu()`, `_pvpQuitToMenu()` (typeof guarded) |
| `_cleanupGame()` | function | Called in `mpCleanupMatch()` (typeof guarded) |

---

## Section 3 — EXTERNAL FILES → EXTERNAL FILES

Direct dependencies between the five external JS files. These determine load-order requirements.

| Caller file | Callee file | Name accessed | Guard | Location in caller |
|---|---|---|---|---|
| `js/loot-system.js` | `js/arena-objectives.js` | `getObjectiveLootBonus()` | ✓ (typeof) | `rollRarity()`, ~line 599 |
| `js/campaign-system.js` | `js/loot-system.js` | `_scrap` (read + write) | **✗** (bare variable access) | Shop purchase logic, reward functions |

### Notes

- `loot-system.js` → `arena-objectives.js`: The call is properly guarded. However, this does create a dependency: `arena-objectives.js` must be loaded before `loot-system.js` is called at runtime (the current load order satisfies this — `arena-objectives.js` loads third, `loot-system.js` loads first but the call only runs at game-time not at parse-time).
- `campaign-system.js` → `loot-system.js`: `_scrap` is owned by `loot-system.js` (declared there as `let _scrap = 0`). `campaign-system.js` reads and writes it directly as a bare global. This is the most fragile cross-file dependency — no guard exists. After the split, `_scrap` must live in `state.js` which both files import.
- No other direct function calls or global reads exist between the five external files.

---

## Section 4 — SHARED GLOBALS

Variables written by one file and read (or also written) by another. These are the primary candidates for `state.js` in the refactor target structure.

### 4.1 Globals owned by `index.html`, read/written by external files

| Variable | Owner | Read by | Written by (besides owner) | Notes |
|---|---|---|---|---|
| `player` | index.html | loot-system.js, enemy-types.js, arena-objectives.js | — | Phaser physics body |
| `torso` | index.html | loot-system.js, multiplayer.js | **multiplayer.js** (mpDeployPVP writes it) | PVP path assigns new torso |
| `enemies` | index.html | loot-system.js, enemy-types.js, arena-objectives.js | — | Phaser Group — never destroy |
| `enemyBullets` | index.html | enemy-types.js | — | Phaser Group |
| `coverObjects` | index.html | loot-system.js, enemy-types.js | — | Phaser Group |
| `GAME` | index.html | loot-system.js, enemy-types.js | — | Phaser.Game instance (renamed from `game` in v4.3) |
| `loadout` | index.html | loot-system.js, campaign-system.js | — | `{ L, R, mod, aug, leg, shld }` |
| `_round` | index.html | loot-system.js, enemy-types.js | — | Current round number |
| `_gameMode` | index.html | loot-system.js | — | `'simulation'`/`'campaign'`/`'pvp'` |
| `_perkState` | index.html | loot-system.js | — | Perk bonus multipliers |
| `_totalKills` | index.html | loot-system.js, campaign-system.js | **multiplayer.js** (writes on PVP kill) | Session kill count |
| `_perksEarned` | index.html | loot-system.js, campaign-system.js | — | Lifetime perk count |
| `isDeployed` | index.html | loot-system.js, enemy-types.js | — | Deployment state flag |
| `_lArmDestroyed` | index.html | — | **multiplayer.js** | Arm state; also read by HUD |
| `_rArmDestroyed` | index.html | — | **multiplayer.js** | Arm state |
| `_legsDestroyed` | index.html | — | **multiplayer.js** | Legs state |
| `_roundTotal` | index.html | — | **enemy-types.js** (`handleEliteDeath`) | Split-enemy spawn count |
| `CHASSIS` | index.html | enemy-types.js | **campaign-system.js** (`applyChassisUpgrades` modifies HP) | Modifying a constant — side effect risk |
| `ENEMY_COLORS` | index.html | enemy-types.js | — | Color lookup |
| `CHASSIS_WEAPONS` | index.html | loot-system.js | — | Valid weapon keys per chassis |
| `CHASSIS_MODS` | index.html | loot-system.js | — | Valid mod keys per chassis |
| `CHASSIS_SHIELDS` | index.html | loot-system.js | — | Valid shield keys per chassis |
| `CHASSIS_LEGS` | index.html | loot-system.js | — | Valid leg keys per chassis |
| `CHASSIS_AUGS` | index.html | loot-system.js | — | Valid augment keys per chassis |
| `WEAPONS` | index.html | loot-system.js | — | Weapon stat definitions |
| `STARTER_LOADOUTS` | index.html | loot-system.js | — | Default loadouts |
| `SHIELD_SYSTEMS` | index.html | enemy-types.js | — | Shield config |

### 4.2 Globals owned by external files, read/written by index.html

| Variable | Owner file | Read by index.html | Written by index.html | Notes |
|---|---|---|---|---|
| `_inventory` | loot-system.js | ✓ (~5123–5218) | ✓ (reset paths) | Gear item array |
| `_equipped` | loot-system.js | ✓ (~5124, ~5224) | ✓ (~6164, equip flow) | Currently equipped gear |
| `_gearState` | loot-system.js | ✓ (~3259–3966, damage/HUD) | — | Computed gear bonuses |
| `_scrap` | loot-system.js | ✓ (~5125, ~5226, ~12188, ~12614) | ✓ (~12188, ~12614) | Currency |
| `RARITY_DEFS` | loot-system.js | ✓ (7 locations, UI and drop code) | — | Rarity display config |
| `INVENTORY_MAX` | loot-system.js | ✓ (~12188) | — | Inventory cap constant |
| `_arenaState` | arena-objectives.js | ✓ (~5980, ~5982) | ✓ (~4888–4889) | Arena/objective active state |
| `_campaignState` | campaign-system.js | ✓ (~5097–5199, ~6326) | ✓ (same locations) | Full campaign progression object |
| `_mpMatchActive` | multiplayer.js | ✓ (~9612, ~9617, ~9708) | — | PVP match in progress flag |

### 4.3 Globals shared between external files (no index.html involved)

| Variable | Owner file | Read/written by | Notes |
|---|---|---|---|
| `_scrap` | loot-system.js | campaign-system.js (read + write) | Only external-to-external shared global |

---

## Refactor Risk Summary

Items that require the most care during the file split:

| Risk | Severity | Detail |
|---|---|---|
| `checkEquipmentPickups()` called every frame without guard | High | `update()` will crash on first deploy if loot-system.js fails |
| `applyEliteModifier()` / `_rollEliteModifier()` called without guards | High | Simulation enemy spawn path will crash if enemy-types.js fails |
| `_mpMatchActive` read as bare variable in `fire()` | High | `ReferenceError` if multiplayer.js fails to load; must initialise in state.js |
| `CHASSIS` mutated by `campaign-system.js` | Medium | `applyChassisUpgrades()` writes HP values back to the shared constant — splitting these files requires the mutation target be the same object reference |
| `_scrap` written by both loot-system.js and campaign-system.js | Medium | No coordination mechanism; after split both must point to the same state.js binding |
| `torso` written by multiplayer.js (`mpDeployPVP`) | Medium | After split, `state.js` must export `torso` as a mutable reference, not a copied value |
| `_totalKills` written by multiplayer.js | Medium | Ownership is ambiguous — both index.html and multiplayer.js increment it |
| `_roundTotal` written by enemy-types.js (`handleEliteDeath`) | Medium | After split, must remain a shared mutable binding |
| `_campaignState` accessed directly by index.html | Medium | campaign-system.js owns it; index.html reads/writes raw properties without going through API functions |
| `selectObjective()` called without typeof guard | Low | `arena-objectives.js` is loaded reliably in practice, but the guard is missing |
