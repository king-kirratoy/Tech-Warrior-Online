# Global Inventory

## Section 1 — Full Variable List

| Variable | Type / Initial Value | Purpose | Read/Written By |
|----------|---------------------|---------|-----------------|
| `CHASSIS_WEAPONS` | `const Object` | Lookup table mapping each chassis key (`light`, `medium`, `heavy`) to a `Set` of allowed weapon slot keys for that chassis | Read by `refreshGarage()` (filters weapon dropdown), `randomEnemyLoadout()` (enemy weapon selection), `selectSlot()` |
| `CHASSIS_MODS` | `const Object` | Lookup table mapping each chassis to a `Set` of allowed mod keys | Read by `refreshGarage()`, `randomEnemyLoadout()` |
| `CHASSIS_SHIELDS` | `const Object` | Lookup table mapping each chassis to a `Set` of allowed shield keys | Read by `refreshGarage()`, `randomEnemyLoadout()` |
| `CHASSIS_LEGS` | `const Object` | Lookup table mapping each chassis to a `Set` of allowed leg system keys | Read by `refreshGarage()`, `randomEnemyLoadout()` |
| `CHASSIS_AUGS` | `const Object` | Lookup table mapping each chassis to a `Set` of allowed augment keys | Read by `refreshGarage()`, `randomEnemyLoadout()` |
| `SHIELD_SYSTEMS` | `const Object` | Full definitions for all 20 shield types — passive absorb %, regen rate, regen delay, max shield HP, and unique on-break effects | Read by `deployMech()` (init player shield), `processPlayerDamage()` (absorb + on-break), `handleShieldRegen()`, `updateBars()`, `refreshGarage()` |
| `AUGMENTS` | `const Object` | Full definitions for all augment items — each has a label, stat bonuses, and passive effect description; applied at deploy time | Read by `deployMech()`, `refreshGarage()`, `updateHUD()` |
| `LEG_SYSTEMS` | `const Object` | Full definitions for all leg system items — speed modifiers, passive traits, and jump interactions | Read by `deployMech()`, `refreshGarage()`, `activateJump()`, `handlePlayerFiring()` |
| `CHASSIS` | `const Object` | Core chassis definitions for `light`, `medium`, `heavy` — base HP pools, speed, scale, passive DR, and chassis-specific traits; `campaign-system.js` may mutate upgrade fields | Read by `deployMech()`, `refreshGarage()`, `spawnEnemy()`, `processPlayerDamage()`, `buildPlayerMech()`; Written (mutated) by `campaign-system.js` upgrades, `goToMainMenu()` (restore `modCooldownMult`) |
| `WEAPONS` | `const Object` | Full weapon stat definitions — damage, fire rate, reload time, bullet speed, range, AOE radius, pellet count, and special flags for every weapon key | Read by `fire()`, `fireXxx()` functions, `handlePlayerFiring()`, `enemyFire()`, `refreshGarage()`, `updateHUD()`, `damageEnemy()` |
| `STARTER_LOADOUTS` | `const Object` | Default loadout configs keyed by chassis — used to initialise `loadout` when starting a new game or switching chassis | Read by `resetLoadout()`, `startGame()`, `confirmNewCampaign()` |
| `loadout` | `let Object` — `{ chassis:'medium', L:'smg', R:'smg', mod:'jump', aug:'none', leg:'standard', shld:'medium_shield', color:0x44aaff }` | Player's current build across 7 slots; **slot key is `shld` not `shield`**; two-handed weapons lock `L === R` | Read/Written by `selectSlot()`, `deployMech()`, `refreshGarage()`, `updateHUD()`, `fire()`, `respawnMech()`, `goToMainMenu()`; also read by `multiplayer.js` |
| `_gameMode` | `let string` — `'simulation'` | Active game mode: `'simulation'` \| `'campaign'` \| `'pvp'`; gates which systems are active in `update()`, `startRound()`, `onEnemyKilled()`, etc. | Read by nearly all major functions; Written by `startGame()`, `startMultiplayer()`, `goToMainMenu()`, `mpClosePvpMenu()` |
| `player` | `let Phaser.Physics.Arcade.Image` — `null` | Invisible physics rectangle; moves with WASD; holds `player.comp` (part HP), `player.shield`, `player._shieldAbsorb`, etc.; **not** the visual sprite | Written by `deployMech()`, `_cleanupGame()`; Read/mutated by `update()`, `processPlayerDamage()`, `handleShieldRegen()`, `handlePlayerFiring()`, `syncVisuals()`, `damageEnemy()`, external files via `window.player` |
| `torso` | `let Phaser.GameObjects.Container` — `null` | Visual container for the player mech; rotates toward mouse cursor each frame; separate from physics `player` object | Written by `deployMech()`, `_cleanupGame()`, `multiplayer.js`; Read by `syncVisuals()`, `update()`, `fireFTH()`, `activateGhostStep()`, `buildPlayerMech()` |
| `keys` | `let Phaser.Types.Input.Keyboard.CursorKeys` — `null` | Phaser keyboard cursor-key object (WASD + arrow bindings); used to read directional input each frame | Written by `create()`; Read by `update()`, `handlePlayerMovement()`, `handlePlayerFiring()` |
| `enemies` | `let Phaser.Physics.Arcade.Group` — `null` | Phaser group holding all active enemy physics bodies; persists across rounds — only children are cleared, group is never destroyed | Written (created) by `create()`; Children added by `spawnEnemy()`, `spawnCommander()`, `spawnMedic()`, boss spawners; Children removed by `damageEnemy()`, `destroyEnemyWithCleanup()`; Read by `update()`, `handleEnemyAI()`, `fire()`, overlap/collider callbacks |
| `bullets` | `let Phaser.Physics.Arcade.Group` — `null` | Phaser group holding all active player bullets; persists across rounds — only children are cleared | Written (created) by `create()`; Children added by `fireStandard()`, `fireXxx()` functions; Read by overlap callback `handleBulletEnemyOverlap()`, `update()` |
| `enemyBullets` | `let Phaser.Physics.Arcade.Group` — `null` | Phaser group holding all active enemy bullets; persists across rounds — only children are cleared | Written (created) by `create()`; Children added by `enemyFire()`, `enemyFireSecondary()`; Read by player-bullet overlap callback, `update()` |
| `shieldGraphic` | `let Phaser.GameObjects.Arc` — `null` | Visible circle rendered around the player when the barrier shield mod is active | Written by `deployMech()` (created), `activateShield()` (shown/hidden), `_cleanupGame()` (nulled); Read by `activateShield()`, `syncVisuals()` |
| `coverObjects` | `let Phaser.Physics.Arcade.StaticGroup` — `null` | Phaser static group holding all destructible cover pieces; persists across rounds — only children are cleared | Written (created) by `create()`; Children added by `generateCover()`, `placeBuilding()`; Children managed by `damageCover()`, `_clearMapForRound()`; Read by `handleEnemyAI()` (LOS), `fireSR()`, `fireRAIL()` |
| `speedStreakLine` | `let Phaser.GameObjects.Graphics` — `null` | Reserved Phaser graphics object for medium-chassis speed-streak motion effect; created in `deployMech()` but never drawn to directly (ghost mech containers used instead) | Written by `deployMech()` (created), `_cleanupGame()` (nulled); not yet drawn to by any function |
| `crosshair` | `let Phaser.GameObjects.Graphics` — `null` | Custom bracket-corner crosshair graphic drawn in screen space; follows mouse position each frame; replaces default browser cursor | Written by `deployMech()` (created via `drawCrosshair()`), `_cleanupGame()` (nulled); Read/positioned by `updateCrosshair()` each frame in `syncVisuals()` |
| `glowWedge` | `let Phaser.GameObjects.Graphics` — `null` | Phaser graphics object that renders the front-facing aim glow wedge from the player torso toward the cursor | Written by `deployMech()` (created), `_cleanupGame()` (nulled); Read/drawn by `drawGlowWedge()` each frame |
| `_savedL` | `let string\|null` — `null` | Cached value of `loadout.L` saved at deploy time; used to restore left arm weapon after limb destruction or respawn | Written by `deployMech()` (snapshot), `_resetHUDState()` / `_cleanupGame()` path (null); Read by `processPlayerDamage()` (arm restore), `respawnMech()`, `returnToHangar()` |
| `_savedR` | `let string\|null` — `null` | Cached value of `loadout.R` saved at deploy time; used to restore right arm weapon after limb destruction or respawn | Written by `deployMech()` (snapshot), reset path (null); Read by `processPlayerDamage()`, `respawnMech()`, `returnToHangar()` |
| `_savedMod` | `let string\|null` — `null` | Cached value of `loadout.mod` saved at deploy time; used to restore mod slot on respawn | Written by `deployMech()`; Read by `returnToHangar()` |
| `_savedAug` | `let string\|null` — `null` | Cached value of `loadout.aug` saved at deploy time; used to restore augment slot on respawn | Written by `deployMech()`; Read by `returnToHangar()` |
| `_savedLeg` | `let string\|null` — `null` | Cached value of `loadout.leg` saved at deploy time; used to restore leg system on respawn | Written by `deployMech()`; Read by `returnToHangar()` |
| `_lArmDestroyed` | `let boolean` — `false` | Flag: left arm has been destroyed this deploy; gates left-arm firing and triggers weapon-slot wipe to `'none'` | Written by `processPlayerDamage()` (set true), `_cleanupGame()` / `respawnMech()` (reset false); Read by `handlePlayerFiring()`, `fire()`, `updateHUD()`, `updatePaperDoll()`; also written by `multiplayer.js` |
| `_rArmDestroyed` | `let boolean` — `false` | Flag: right arm has been destroyed this deploy; gates right-arm firing | Written by `processPlayerDamage()` (set true), `_cleanupGame()` / `respawnMech()` (reset false); Read by `handlePlayerFiring()`, `fire()`, `updateHUD()`, `updatePaperDoll()`; also written by `multiplayer.js` |
| `_legsDestroyed` | `let boolean` — `false` | Flag: legs have been destroyed this deploy; disables movement speed bonus and leg-system actives; sets `_perkState.legSystemActive = false` | Written by `processPlayerDamage()` (set true), `_cleanupGame()` / `respawnMech()` (reset false); Read by `handlePlayerMovement()`, `activateJump()`, `updatePaperDoll()`; also written by `multiplayer.js` |
| `_lastPlayerDamageTime` | `let number` — `0` | `scene.time.now` timestamp of the most recent damage the player received; used to gate shield regen delay | Written by `processPlayerDamage()`; Read by `handleShieldRegen()` |
| `_round` | `let number` — `1` | Current round number; incremented at the start of each round; drives enemy count formula and boss cycle detection | Written by `startRound()`; Read by `startRound()`, `spawnEnemy()`, `onEnemyKilled()`, `updateRoundHUD()`, `_capturePendingRun()`, `selectPerks()`, boss spawners; also read by `campaign-system.js`, `arena-objectives.js` |
| `_bestRound` | `let number` — `1` | Highest round reached in the current session; persisted to `localStorage` | Written by `startRound()` (if `_round > _bestRound`), `goToMainMenu()` (loaded from localStorage); Read by `_capturePendingRun()`, death screen render |
| `_roundKills` | `let number` — `0` | Number of enemies killed in the current round; compared with `_roundTotal` to detect all-dead state | Written by `onEnemyKilled()` (increment), `startRound()` / `goToMainMenu()` (reset); Read by `onEnemyKilled()`, `updateRoundHUD()` |
| `_roundTotal` | `let number` — `0` | Total number of enemies spawned in the current round; set by `startRound()` | Written by `startRound()`, `goToMainMenu()` (reset); Read by `onEnemyKilled()`, `updateRoundHUD()` |
| `_totalKills` | `let number` — `0` | Cumulative enemy kills across the entire run; used for leaderboard score | Written by `onEnemyKilled()` (increment), `goToMainMenu()` (reset); Read by `_capturePendingRun()`, death screen; also written by `multiplayer.js` |
| `_shotsFired` | `let number` — `0` | Total player shots fired this run; used to compute accuracy stat | Written by `fire()` / `fireXxx()` functions (increment), `respawnMech()` / `goToMainMenu()` (reset); Read by `_capturePendingRun()`, stats overlay |
| `_shotsHit` | `let number` — `0` | Player bullets that hit an enemy this run; used to compute accuracy stat | Written by `handleBulletEnemyOverlap()` (increment), `respawnMech()` / `goToMainMenu()` (reset); Read by `_capturePendingRun()`, stats overlay |
| `_damageDealt` | `let number` — `0` | Total damage dealt to enemies this run | Written by `damageEnemy()` (accumulate), `respawnMech()` / `goToMainMenu()` (reset); Read by `_capturePendingRun()`, stats overlay |
| `_damageTaken` | `let number` — `0` | Total damage taken by player this run | Written by `processPlayerDamage()` (accumulate), `respawnMech()` / `goToMainMenu()` (reset); Read by stats overlay, `_capturePendingRun()` |
| `_perksEarned` | `let number` — `0` | Number of perks picked this run | Written by `pickPerk()` (increment), `respawnMech()` / `goToMainMenu()` (reset); Read by stats overlay |
| `_roundActive` | `let boolean` — `false` | True while a round is in progress (enemies can spawn, objectives active); false during extraction/perk menu/hangar | Written by `startRound()` (true), `_cleanupGame()` / `_triggerExtraction()` (false); Read by `update()`, `onEnemyKilled()`, `handleObjectiveRoundEnd()` |
| `_roundClearing` | `let boolean` — `false` | True during the round-clear banner and perk menu; blocks most of `update()` game logic | Written by `_triggerExtraction()` (true), `pickPerk()` / `_cleanupGame()` (false); Read by `update()` (early return guard) |
| `_extractionActive` | `let boolean` — `false` | True after all enemies are dead and the extraction zone has spawned; player must reach it to end the round | Written by `_spawnExtractionPoint()` (true), `_triggerExtraction()` / `_cleanupGame()` (false); Read by `update()`, `_updateExtraction()` |
| `_extractionPoint` | `let Object\|null` — `null` | `{ x, y }` world coordinates of the active extraction zone | Written by `_spawnExtractionPoint()` (set), `_cleanupGame()` / `_triggerExtraction()` (null); Read by `_updateExtraction()`, `drawMinimap()` |
| `_extractionVisuals` | `let Object\|null` — `null` | Scene graphic objects (ring, pulse, label) for the extraction zone | Written by `_spawnExtractionPoint()` (created), `_cleanupGame()` / `_triggerExtraction()` (destroyed + nulled); Read by `_updateExtraction()` |
| `_extractionPromptShown` | `let boolean` — `false` | Whether the "PRESS E" extraction prompt banner is currently visible | Written by `_updateExtraction()` (toggle), `_cleanupGame()` / `_triggerExtraction()` (false); Read by `_updateExtraction()` |
| `_footstepTimer` | `let number` — `0` | `scene.time.now` timestamp before which no new footprint is spawned; controls footstep cadence for medium/heavy chassis | Written by `syncMediumFootsteps()`, `syncHeavyShockwave()`; Read by same functions |
| `_footstepSide` | `let number` — `1` | Alternates between `1` and `-1` to offset footprints left/right of travel direction | Written by `syncMediumFootsteps()` (`*= -1` each step); Read by `syncMediumFootsteps()` |
| `_shockwaveTimer` | `let number` — `0` | `scene.time.now` timestamp before which no new shockwave ring is spawned; controls heavy chassis step-thud cadence | Written by `syncHeavyShockwave()`; Read by `syncHeavyShockwave()` |
| `_lastTorsoX` | `let number` — `0` | Previous X position of `torso`; used by light chassis to detect movement and spawn ghost-trail particles | Written by `syncLightTrail()` each frame; Read by `syncLightTrail()` |
| `_lastTorsoY` | `let number` — `0` | Previous Y position of `torso`; light trail tracking counterpart to `_lastTorsoX` | Written by `syncLightTrail()` each frame; Read by `syncLightTrail()` |
| `_lastTorsoMX` | `let number` — `0` | Previous X position of `torso` for medium blur ghost spawning; triggers a new ghost every 14 px of movement | Written by `syncMediumFootsteps()`; Read by `syncMediumFootsteps()` |
| `_lastTorsoMY` | `let number` — `0` | Previous Y position of `torso` for medium blur ghost spawning | Written by `syncMediumFootsteps()`; Read by `syncMediumFootsteps()` |
| `isDeployed` | `let boolean` — `false` | True while the player is in-game (after drop-in tween completes); false in the hangar and during drop-in animation | Written by `deployMech()` drop-in `onComplete` (true), `_cleanupGame()` (false); Read by `update()`, `updateHUD()`, `handlePlayerFiring()`, `updateEnemyDoll()` and many other systems |
| `_perks` | `const Object` | Master perk definition dictionary (~400+ entries); each entry has `cat`, `label`, `desc`, and `apply()` which mutates `_perkState` | Read by `selectPerks()`, `showPerkMenu()`, `pickPerk()`; never written at runtime |
| `_perkState` | `let Object` — large flat object with 150+ fields, all initialized | All active perk effects for the current run — multipliers, flags, counters, and internal state trackers; canonical single source of truth for perk bonuses | Written by perk `apply()` callbacks, `resetRoundPerks()`, `returnToHangar()`, `goToMainMenu()`, `respawnMech()`; Read by `damageEnemy()`, `processPlayerDamage()`, `fire()` and all `fireXxx()` functions, mod activations, `handleShieldRegen()`, `update()` |
| `_spectreClones` | `let Array` — `[]` | Array of active spectre-clone scene containers (Light Spectre legendary perk); each clone has its own drift and fire timer events | Written by `_spawnSpectreClone()` (push), `onEnemyKilled()` / `goToMainMenu()` / `_cleanupGame()` (destroy + clear); Read by `_spawnSpectreClone()` fire/drift events |
| `_lastKillTime` | `let number` — `0` | `performance.now()` timestamp of the last enemy kill; used to detect multi-kill streaks (Kill Streak perk) | Written by `onEnemyKilled()`; Read by `onEnemyKilled()` (compares elapsed since last kill) |
| `_pickedPerks` | `let Array` — `[]` | List of perk keys the player has chosen this run; used to check legendary eligibility (requires 2+ perks in category) | Written by `pickPerk()` (push), `returnToHangar()` / `goToMainMenu()` (reset); Read by `selectPerks()` |
| `_lastOfferedPerks` | `let Array` — `[]` | List of perk keys offered in the last perk menu; prevents immediate re-offering of the same perks | Written by `selectPerks()` / `showPerkMenu()`; Read by `selectPerks()` (excluded from next offer pool) |
| `reloadL` | `let number` — `0` | `scene.time.now` timestamp before which the left arm cannot fire again; acts as left-arm reload cooldown | Written by `handlePlayerFiring()` / `fire()` after each left-arm shot; Read by `handlePlayerFiring()`, `updateCooldownOverlays()` |
| `reloadR` | `let number` — `0` | `scene.time.now` timestamp before which the right arm cannot fire again; acts as right-arm reload cooldown | Written by `handlePlayerFiring()` / `fire()` after each right-arm shot; Read by `handlePlayerFiring()`, `updateCooldownOverlays()` |
| `_chaingunSpinStart` | `let number` — `0` | `scene.time.now` timestamp when chaingun (`chain` weapon) started spinning up; used to compute spin-up progress | Written by `handlePlayerFiring()` (on first trigger press); Read by `handlePlayerFiring()` to determine when `_chaingunReady` becomes true |
| `_chaingunReady` | `let boolean` — `false` | True once the chaingun spin-up delay has elapsed and it can begin firing | Written by `handlePlayerFiring()` (set true after spin-up, false on release), `_cleanupGame()` (false); Read by `handlePlayerFiring()` |
| `lastDamageTime` | `let number` — `-99999` | `scene.time.now` of the last time the player took damage; used by shield regen, hit-and-run perk, and HUD flash | Written by `processPlayerDamage()`; Read by `handleShieldRegen()`, `_perkState` hit-run timer checks, `update()` |
| `lastModTime` | `let number` — `0` | `scene.time.now` of the last mod activation; used to enforce mod cooldown | Written by mod activation functions (`activateJump()`, `activateShield()`, etc.); Read by `handlePlayerFiring()` (cooldown gate) |
| `isJumping` | `let boolean` — `false` | True while the jump mod is actively in its airborne phase | Written by `activateJump()` (true at launch, false on land), `_cleanupGame()` (false); Read by `update()`, `handlePlayerMovement()`, `processPlayerDamage()` (dodge + slam), `spawnEnemy()` (guard) |
| `isShieldActive` | `let boolean` — `false` | True while the barrier shield mod is projecting its block field | Written by `activateShield()` (true on activate, false on expiry), `_cleanupGame()` (false); Read by `processPlayerDamage()` (full-block check), `updateCooldownOverlays()` |
| `isRageActive` | `let boolean` — `false` | True while the rage mod is active (speed + damage boost) | Written by `activateRage()` (true on activate, false on expiry), `_cleanupGame()` (false); Read by `processPlayerDamage()`, `handlePlayerMovement()`, `damageEnemy()` |
| `isAmmoActive` | `let boolean` — `false` | True for 8 s after picking up an ammo loot orb; applies 50% reload reduction | Written by `checkLootPickups()` (true on pickup, false on timer expiry); Read by `handlePlayerFiring()` (reload multiplier) |
| `isChargeActive` | `let boolean` — `false` | True for 10 s after picking up a charge loot orb; applies 50% mod cooldown reduction | Written by `checkLootPickups()` (true on pickup, false on timer expiry); Read by `handlePlayerFiring()` (cooldown multiplier) |
| `_ac` | `let AudioContext\|null` — `null` | Web Audio API `AudioContext`; created lazily on first user gesture via `_getAC()`; null before first interaction or when closed | Written by `_getAC()` (create), `_onVisibilityChange` (suspend/resume); Read by `_tone()`, `_noise()`, all `sndXxx()` functions |
| `_masterVol` | `let number` — `0.32` | Global audio volume scalar applied to all gain nodes in `_tone()` and `_noise()` | Read by `_tone()`, `_noise()`; not currently exposed to a UI control (set at declaration) |
| `_activeNodes` | `let number` — `0` | Running count of active Web Audio nodes; prevents exceeding `_MAX_NODES`; decremented in each node's `onended` callback | Written by `_tone()`, `_noise()` (increment on create, decrement in `onended`), `_auditActiveNodes` interval (reset on stale/closed); Read by `_tone()`, `_noise()` (cap check) |
| `_lastNodeStartTime` | `let number` — `0` | `performance.now()` timestamp of the most recently created audio node; used by the periodic audit to detect when all nodes must have completed | Written by `_tone()`, `_noise()`; Read by `_auditActiveNodes` setInterval callback |
| `_MAX_NODES` | `const number` — `48` | Maximum simultaneous Web Audio nodes allowed; new sounds are dropped if this cap is reached | Read by `_tone()`, `_noise()` (cap check); never written |
| `_sndThrottle` | `const Object` — `{}` | Per-sound last-played timestamp map; keyed by sound ID string; used by `_canPlay()` to enforce per-sound minimum intervals | Written by `_canPlay()` (update timestamp on play); Read by `_canPlay()` (compare elapsed) |
| `_audioReady` | `let boolean` — `false` | Gate flag; prevents `AudioContext` creation before the first user gesture (browser autoplay policy) | Written by `_onFirstUserGesture` one-shot listener (true); Read by `_getAC()` |
| `config` | `const Object` | Phaser 3 game config — renderer type, canvas parent, dimensions, FPS target, arcade physics settings, and scene callbacks | Read by `new Phaser.Game(config)` only; never written after creation |
| `game` | `const Phaser.Game` | Root Phaser game instance; used for `game.scale.resize()` on window resize and to access `game.scene.scenes[0]` | Written once by `new Phaser.Game(config)`; Read by `_onWindowResize`, `togglePause()`, `returnToHangar()`, `goToMainMenu()` |
| `_FEELER_OFFSETS` | `const Array` — `Object.freeze([0, -0.35, 0.35])` | Pre-allocated frozen array of angular offsets for the three enemy obstacle-avoidance feeler rays; hoisted to avoid per-frame allocation | Read by `handleEnemyAI()` every frame; never written |
| `_CONE_RAY_POINTS` | `const Array` — `19 × {x:0, y:0}` | Pre-allocated pool of 19 `{x,y}` objects for enemy vision-cone ray-point calculations; mutated in-place each frame to avoid heap allocation | Written (mutated) by `handleEnemyAI()` each frame; Read by `handleEnemyAI()` |
| `_currentPerkKeys` | `let Array` — `[]` | Keys of perks currently displayed in the perk menu; allows the global `keydown` handler to resolve number-key perk picks without DOM traversal | Written by `selectPerks()` / `showPerkMenu()`; Read by global `keydown` handler |
| `_currentPerkNextRound` | `let number` — `1` | Round number to pass to `startRound()` after the perk is picked; set by `showPerkMenu()` | Written by `showPerkMenu()`; Read by global `keydown` handler perk-pick path, `pickPerk()` |
| `SUPABASE_URL` | `const string` | Base URL for the project's Supabase instance; used to construct REST API calls for leaderboard and campaign cloud saves | Read by `_insertScore()`, `_fetchScores()`, `saveToCloud()`, `_loadCampaignData()`; never written |
| `SUPABASE_KEY` | `const string` | Publishable Supabase API key (safe for client-side use); sent as `apikey` / `Authorization` header in all Supabase fetch calls | Read by all Supabase fetch helpers; never written |
| `SUPABASE_TABLE` | `const string` — `'tw_scores'` | Supabase table name for leaderboard score records | Read by `_insertScore()`, `_fetchScores()`; never written |
| `SUPABASE_CAMPAIGN_TABLE` | `const string` — `'tw_campaign_saves'` | Supabase table name for campaign cloud save records | Read by `saveToCloud()`, `_loadCampaignData()` (via `campaign-system.js`); never written |
| `LB_KEY` | `const string` — `'tw_leaderboard_v1'` | `localStorage` key for the local leaderboard cache | Read by `_fetchScores()`, `_insertScore()`, `_renderScores()`; never written at runtime |
| `LB_MAX` | `const number` — `20` | Maximum number of leaderboard entries kept locally | Read by `_insertScore()` (trim to top N); never written |
| `SCORE_MAX_ROUND` | `const number` — `999` | Validation ceiling for submitted round numbers; clamped in `_validateScoreEntry()` | Read by `_validateScoreEntry()`; never written |
| `SCORE_MAX_KILLS` | `const number` — `30000` | Validation ceiling for submitted kill counts | Read by `_validateScoreEntry()`; never written |
| `SCORE_MAX_DAMAGE` | `const number` — `100000000` | Validation ceiling for submitted total-damage values (100 million) | Read by `_validateScoreEntry()`; never written |
| `_pendingRun` | `let Object\|null` — `null` | Captured run stats (round, kills, accuracy, damage, callsign, chassis) held between death and leaderboard submission | Written by `_capturePendingRun()` (on death/extraction); Read by `_insertScore()`, death-screen render; cleared to `null` after insertion |
| `_playerCallsign` | `let string` — `'ANONYMOUS'` | Player's chosen callsign, sanitized and uppercased; stored in `localStorage` and sent to Supabase leaderboard | Written by `proceedToMainMenu()`, `startGame()`, `startMultiplayer()`; Read by `_capturePendingRun()`, `_insertScore()`, PVP HUD |
| `_buildingGraphics` | `let Array` — `[]` | Array of Phaser `Graphics` objects for building/structure cover visuals; cleared and rebuilt each round | Written by `placeBuilding()` (push), `_clearMapForRound()` (destroy + reset); Read by `_clearMapForRound()` |
| `COVER_DEFS` | `const Array` | Array of cover-piece definition objects — each specifies shape type, size range, color, HP, and weight for weighted random selection | Read by `generateCover()` variants; never written |
| `LOOT_TYPES` | `const Object` | Definitions for the three consumable loot-orb types (`repair`, `ammo`, `charge`) — label, color, glow color, and size | Read by `spawnLoot()`, `checkLootPickups()`, `drawMinimap()`; never written |
| `lootPickups` | `let Array` — `[]` | Array of active consumable loot-orb scene objects (repair / ammo / charge); separate from equipment drops managed by `loot-system.js` | Written by `spawnLoot()` (push), `checkLootPickups()` (splice on pickup), `_clearMapForRound()` (destroy + reset); Read by `checkLootPickups()`, `drawMinimap()` |
| `_playerBulletOverlap` | `let Phaser.Physics.Arcade.Collider\|null` — `null` | Stored reference to the player-bullets ↔ enemies overlap collider; destroyed and re-registered each deploy to avoid stale group references | Written by `deployMech()` (created), `_cleanupGame()` (destroyed + nulled); used internally by Phaser physics |
| `_playerEnemyCollider` | `let Phaser.Physics.Arcade.Collider\|null` — `null` | Stored reference to the player ↔ enemies physics collider | Written by `deployMech()` (created), `_cleanupGame()` (destroyed + nulled) |
| `_enemyEnemyCollider` | `let Phaser.Physics.Arcade.Collider\|null` — `null` | Stored reference to the enemies ↔ enemies physics collider (separation) | Written by `deployMech()` (created), `_cleanupGame()` (destroyed + nulled) |
| `ENEMY_COLORS` | `const Object` | Color palette lookup keyed by chassis (`light`, `medium`, `heavy`) — each entry has `body` and `head` hex colors used when building enemy mechs | Read by `buildEnemyTorso()`, `spawnEnemy()`, `spawnCommander()`; never written |
| `COMMANDER_COLORS` | `const Object` — `{ body:0x1a1000, head:0xddaa00, eye:0xff8800 }` | Fixed color palette for commander-type enemies | Read by `spawnCommander()`, `buildEnemyTorso()`; never written |
| `MEDIC_COLORS` | `const Object` — `{ body:0x001a08, head:0x00cc55, eye:0x00ffaa }` | Fixed color palette for medic-type enemies | Read by `spawnMedic()`, `buildEnemyTorso()`; never written |
| `BOSS_COLORS` | `const Object` | Color palettes for each of the 8 bosses, keyed by boss name | Read by each boss spawner function (`spawnWarden()`, `spawnTwinRazors()`, etc.); never written |
| `ENEMY_PRIMARY` | `const Array` — `['smg','mg','br','sg','hr','fth']` | Weapon keys available for standard enemy primary arm slots; used by `randomEnemyLoadout()` | Read by `randomEnemyLoadout()`; never written |
| `ENEMY_ARM_WEAPONS` | `const Array` — `['smg','mg','br','sg','hr','fth','sr','gl','rl','plsm']` | Superset of weapon keys valid for any enemy arm slot (excludes `rail` as too accurate for AI) | Read by `randomEnemyLoadout()`, `spawnCommander()`; never written |
| `ENEMY_2H_WEAPONS` | `const Array` — `['siege','chain']` | Two-handed weapon keys that enemies can use; when assigned, both arm slots get the same key | Read by `randomEnemyLoadout()`, `spawnEnemy()`; never written |
| `_eDollTarget` | `let Object\|null` — `null` | Reference to the enemy currently displayed in the enemy paper-doll HUD | Written by `updateEnemyDoll()` (set on hover), hide-timer callback (null on timeout); Read by `updateEnemyDoll()`, per-frame `update()` doll refresh |
| `_eDollHideTimer` | `let number\|null` — `null` | `setTimeout` handle for hiding the enemy doll HUD 3 s after last update | Written by `updateEnemyDoll()` (set/clear); Read by `updateEnemyDoll()` |
| `HUD_NAMES` | `const Object` | Display name strings for every weapon, mod, aug, and leg key; used by `updateHUD()` to label the four weapon bar slots | Read by `updateHUD()`; never written |
| `SLOT_ID_MAP` | `const Object` — `{ L:'L', R:'R', M:'mod', A:'aug', G:'leg', S:'shld' }` | Maps single-letter garage dropdown slot IDs to `loadout` property keys; canonical translation table to avoid mixing up slot-id and loadout-key naming conventions | Read by `buildDD()`, `selectSlot()`, `toggleDD()`; never written |
| `WEAPON_OPTIONS` | `const Array` | Array of `{ key, label }` objects for all selectable weapons in the garage dropdown, ordered for display | Read by `buildDD()` when constructing the weapon dropdown; never written |
| `MOD_OPTIONS` | `const Array` | Array of `{ key, label }` objects for all selectable mods in the garage dropdown | Read by `buildDD()` (mod slot); never written |
| `AUG_OPTIONS` | `const Array` | Array of `{ key, label }` objects for all selectable augments in the garage dropdown | Read by `buildDD()` (aug slot); never written |
| `LEG_OPTIONS` | `const Array` | Array of `{ key, label }` objects for all selectable leg systems in the garage dropdown | Read by `buildDD()` (leg slot); never written |
| `SHIELD_OPTIONS` | `const Array` | Array of `{ key, label }` objects for all selectable shield systems in the garage dropdown, filtered at render time by chassis | Read by `buildDD()` (shield slot); never written |
| `SLOT_DESCS` | `const Object` | Long-form description strings for every weapon, mod, aug, leg, and shield key; displayed in the garage stats panel when a slot is selected | Read by `refreshGarage()` / `updateGarageStats()`; never written |
| `COLOR_OPTIONS` | `const Array` | Array of `{ key, label, hex }` objects for selectable mech color options in the garage color dropdown | Read by `buildDD()` (color slot), `refreshMechColor()`; never written |
| `EXPLOSIVE_KEYS` | `const Set` — `new Set(['gl','rl','plsm','rail'])` | Set of weapon keys that deal splash/explosive damage; used in `fire()` to apply `_gearSplashMult` from gear and to gate explosion-related perk bonuses | Read by `fire()`, `damageEnemy()`, perk eligibility checks; never written |
| `_openDD` | `let string\|null` — `null` | Key of the currently open garage dropdown slot (e.g. `'L'`, `'S'`), or `null` if all dropdowns are closed | Written by `toggleDD()` (set to slot key), `closeAllDD()` (null); Read by `toggleDD()` (detect re-click to close), `buildDD()` |
| `_isStats` | `let boolean` — `false` | True while the stats/loadout overlay is open | Written by `toggleStats()` (toggle), `_cleanupGame()` / `pickPerk()` / `_resetHUDState()` (false); Read by `toggleStats()`, global `keydown` handler (ESC close), `update()` |
| `_isInventory` | `let boolean` — `false` | True while the gear/inventory overlay tab is the active view within the stats overlay | Written by `openInventory()` (true), `toggleStats()` (false on close); Read by `toggleStats()`, `openInventory()` |
| `_pendingLoadoutTab` | `let string\|null` — `null` | Tab name (`'gear'`) to auto-switch to when the stats overlay opens; set by `openInventory()` so the gear tab activates on next `toggleStats()` call | Written by `openInventory()` (set `'gear'`), `toggleStats()` (consumed + nulled); Read by `toggleStats()` |
| `_isPaused` | `let boolean` — `false` | True while the pause overlay is visible; suspends Phaser physics and time | Written by `togglePause()` (toggle), `_cleanupGame()` / `_resetHUDState()` (false), various overlay-close paths; Read by `update()`, `handlePlayerFiring()`, `activateJump()`, global `keydown` handler |
| `_selectedNewChassis` | `let string\|null` — `null` | Chassis key (`'light'`, `'medium'`, `'heavy'`) selected during the new-campaign chassis-choice screen; confirmed by `_startNewCampaignWithChassis()` | Written by `_showNewCampaignChassisSelect()` arrow-key handler (set), `_cancelNewCampaign()` (null); Read by campaign chassis-select `keydown` handler, `_startNewCampaignWithChassis()` |

---

## Section 2 — Ownership Assignments

| Variable | Destination File | Notes |
|----------|-----------------|-------|
| `CHASSIS_WEAPONS` | `constants.js` | Truly static `const`; read by garage, enemy AI, and `loot-system.js` — belongs in the shared constants layer |
| `CHASSIS_MODS` | `constants.js` | Same pattern as `CHASSIS_WEAPONS` |
| `CHASSIS_SHIELDS` | `constants.js` | Same pattern |
| `CHASSIS_LEGS` | `constants.js` | Same pattern |
| `CHASSIS_AUGS` | `constants.js` | Same pattern |
| `SHIELD_SYSTEMS` | `constants.js` | Read by combat, garage, HUD, and `enemy-types.js` — too broadly shared to live in any single feature file |
| `AUGMENTS` | `constants.js` | Static definitions; read by `deployMech()`, garage, and HUD |
| `LEG_SYSTEMS` | `constants.js` | Static definitions; read by deploy, garage, firing, and mod activation paths |
| `CHASSIS` | `constants.js` | Declared `const` and treated as static, but `campaign-system.js` mutates HP fields via `applyChassisUpgrades()` — the object reference must remain a single shared binding; mutation side-effect is a known refactor risk (DEPENDENCY_MAP §4.1) |
| `WEAPONS` | `constants.js` | Static weapon stat definitions; read by firing, enemy AI, garage, HUD, and `loot-system.js` |
| `STARTER_LOADOUTS` | `constants.js` | Static defaults; read by `resetLoadout()`, `startGame()`, `confirmNewCampaign()`, and `loot-system.js` |
| `loadout` | `state.js` | Mutable at any time (garage selects, arm destruction, respawn); read by combat, HUD, enemies, `loot-system.js`, `campaign-system.js`, and `multiplayer.js` |
| `_gameMode` | `state.js` | Single most-read gate variable in the codebase; consumed by nearly every major system and by `loot-system.js` |
| `player` | `state.js` | Phaser physics body; written by `deployMech()` and read by all combat, AI, loot, arena, and multiplayer systems — must be a shared mutable binding |
| `torso` | `state.js` | Phaser visual container; written by `deployMech()` and **also written by `multiplayer.js`** (`mpDeployPVP`) — cannot be local to any single feature file |
| `keys` | `state.js` | Phaser keyboard input handle; set once in `create()` and read each frame by movement and firing — needs to be accessible across the game loop |
| `enemies` | `state.js` | Phaser Group shared by combat, AI, rounds, arena objectives, and `enemy-types.js` / `loot-system.js` — must never be destroyed, so the reference must be universally reachable |
| `bullets` | `state.js` | Phaser Group shared by combat (fire functions) and the bullet–enemy overlap callback |
| `enemyBullets` | `state.js` | Phaser Group shared by enemy AI firing and the player-damage overlap callback |
| `shieldGraphic` | `state.js` | Phaser Arc tied to the player's deploy lifecycle; shown/hidden by the barrier mod and cleaned up in `_cleanupGame()` |
| `coverObjects` | `state.js` | Phaser StaticGroup shared by cover generation, enemy LOS, sniper/rail line-of-sight, and `loot-system.js` drop placement |
| `speedStreakLine` | `state.js` | Phaser Graphics scene object; created in `deployMech()`, nulled in `_cleanupGame()`; reserved for the medium-chassis streak effect — will move to `mechs.js` once that file exists |
| `crosshair` | `state.js` | Phaser Graphics scene object cleaned up by `_cleanupGame()`; will move to `mechs.js` |
| `glowWedge` | `state.js` | Phaser Graphics scene object cleaned up by `_cleanupGame()`; will move to `mechs.js` |
| `_savedL` | `state.js` | Snapshot of `loadout.L` shared between `deployMech()` (write), `processPlayerDamage()` arm-restore (read), and `respawnMech()` / `returnToHangar()` (read) |
| `_savedR` | `state.js` | Same pattern as `_savedL` |
| `_savedMod` | `state.js` | Same pattern |
| `_savedAug` | `state.js` | Same pattern |
| `_savedLeg` | `state.js` | Same pattern |
| `_lArmDestroyed` | `state.js` | Written by both `processPlayerDamage()` and `multiplayer.js`; read by combat, HUD, and movement — must be a shared binding |
| `_rArmDestroyed` | `state.js` | Same cross-file write pattern as `_lArmDestroyed` |
| `_legsDestroyed` | `state.js` | Written by `processPlayerDamage()` and `multiplayer.js`; read by movement, mod activation, and HUD |
| `_lastPlayerDamageTime` | `state.js` | Written by `processPlayerDamage()` (combat), read by `handleShieldRegen()` (combat) — both in the same future `combat.js`, but also reset by cleanup paths in `state.js` territory |
| `_round` | `state.js` | Read by rounds, enemies, perks, HUD, leaderboard capture, `campaign-system.js`, `arena-objectives.js`, and `loot-system.js` — the most widely shared numeric counter |
| `_bestRound` | `state.js` | Written by round progression; read by death screen and leaderboard — straddles rounds and menus |
| `_roundKills` | `state.js` | Written by `onEnemyKilled()` (rounds), read by `updateRoundHUD()` (HUD) and round-end detection |
| `_roundTotal` | `state.js` | Written by `startRound()` and also by `enemy-types.js` (`handleEliteDeath` adds split enemies) — cross-file write requires shared binding |
| `_totalKills` | `state.js` | Written by `onEnemyKilled()` and `multiplayer.js`; read by `loot-system.js` and `campaign-system.js` — four files touch this |
| `_shotsFired` | `state.js` | Written by combat firing functions; read by leaderboard capture and stats overlay — straddles combat and menus |
| `_shotsHit` | `state.js` | Same pattern as `_shotsFired` |
| `_damageDealt` | `state.js` | Written by `damageEnemy()` (combat); read by stats overlay and leaderboard (menus) |
| `_damageTaken` | `state.js` | Written by `processPlayerDamage()` (combat); read by stats overlay and leaderboard |
| `_perksEarned` | `state.js` | Written by `pickPerk()` (perks); read by `loot-system.js` and `campaign-system.js` — cross-file read forces it into shared state |
| `_roundActive` | `state.js` | Written by rounds and cleanup; read by `update()`, enemy kill handler, and objective system |
| `_roundClearing` | `state.js` | The primary `update()` gate flag; written by extraction/perk/cleanup, read at the very top of `update()` |
| `_extractionActive` | `state.js` | Written by round-flow functions and `_cleanupGame()`; read by `update()` and extraction update — straddles rounds and core game loop |
| `_extractionPoint` | `state.js` | Written by extraction spawn and cleanup; read by extraction update and minimap — shared between rounds and HUD |
| `_extractionVisuals` | `state.js` | Scene objects created by the extraction spawner and destroyed by `_cleanupGame()` — tied to the cleanup lifecycle |
| `_extractionPromptShown` | `state.js` | UI toggle flag managed by the extraction updater and reset by cleanup; shared between rounds and HUD |
| `_footstepTimer` | `state.js` | Used exclusively by `syncMediumFootsteps()` and `syncHeavyShockwave()` — will move to `mechs.js` once that file is created; no matching destination in current option list |
| `_footstepSide` | `state.js` | Same as `_footstepTimer` — `mechs.js`-bound |
| `_shockwaveTimer` | `state.js` | Same — heavy chassis footstep timing, `mechs.js`-bound |
| `_lastTorsoX` | `state.js` | Light trail position tracking; used only by `syncLightTrail()` — will move to `mechs.js` |
| `_lastTorsoY` | `state.js` | Same as `_lastTorsoX` |
| `_lastTorsoMX` | `state.js` | Medium blur ghost position tracking; used only by `syncMediumFootsteps()` — will move to `mechs.js` |
| `_lastTorsoMY` | `state.js` | Same as `_lastTorsoMX` |
| `isDeployed` | `state.js` | Read by `loot-system.js`, `enemy-types.js`, and nearly every in-game system as the primary "is game running" guard |
| `_perks` | `perks.js` | Const perk definition dictionary (~400+ entries); exclusively consumed by `selectPerks()`, `showPerkMenu()`, and `pickPerk()` — too large and specialized for the general constants file |
| `_perkState` | `state.js` | Read by combat, damage, firing, movement, shield regen, HUD, and `loot-system.js` — the second most widely shared mutable object after `player` |
| `_spectreClones` | `state.js` | Created by a perk effect but cleaned up by `onEnemyKilled()` and `_cleanupGame()`, not just by perk code — requires shared visibility |
| `_lastKillTime` | `state.js` | Written and read by `onEnemyKilled()` for Kill Streak perk; reset in `returnToHangar()` and `goToMainMenu()` — participates in global state resets |
| `_pickedPerks` | `state.js` | Written by `pickPerk()`; read by `selectPerks()`; reset in hangar/menu cleanup — reset path crosses perk and menu systems |
| `_lastOfferedPerks` | `state.js` | Written and read by perk selection functions; reset between runs — participates in run-start state resets |
| `reloadL` | `state.js` | Written by firing functions; read by `handlePlayerFiring()` and `updateCooldownOverlays()` (HUD) — shared between combat and HUD systems |
| `reloadR` | `state.js` | Same pattern as `reloadL` |
| `_chaingunSpinStart` | `state.js` | Written and read by `handlePlayerFiring()`; reset by `_cleanupGame()` — combat-local in function but reset by shared cleanup |
| `_chaingunReady` | `state.js` | Same pattern as `_chaingunSpinStart` |
| `lastDamageTime` | `state.js` | Written by `processPlayerDamage()`; read by `handleShieldRegen()` and `update()` — shared across combat, shield, and game-loop systems |
| `lastModTime` | `state.js` | Written by all mod activations; read by `handlePlayerFiring()` cooldown gate — shared between mods and firing systems |
| `isJumping` | `state.js` | Written by `activateJump()`; read by movement, damage, and `spawnEnemy()` — shared across combat, movement, and enemy spawn paths |
| `isShieldActive` | `state.js` | Written by `activateShield()`; read by `processPlayerDamage()` and HUD cooldown overlay |
| `isRageActive` | `state.js` | Written by `activateRage()`; read by `processPlayerDamage()`, movement, and `damageEnemy()` |
| `isAmmoActive` | `state.js` | Written by loot pickup; read by `handlePlayerFiring()` — bridges loot and combat systems |
| `isChargeActive` | `state.js` | Same cross-system bridge as `isAmmoActive` |
| `_ac` | `audio.js` | The Web Audio `AudioContext`; created, suspended/resumed, and queried exclusively by audio engine functions |
| `_masterVol` | `audio.js` | Applied only inside `_tone()` and `_noise()`; no other system reads it |
| `_activeNodes` | `audio.js` | Incremented and decremented entirely within audio node creation and `onended` callbacks |
| `_lastNodeStartTime` | `audio.js` | Written by `_tone()` and `_noise()`; read only by the audio audit interval |
| `_MAX_NODES` | `audio.js` | Const used only by `_tone()` and `_noise()` as the node cap; audio-engine-internal |
| `_sndThrottle` | `audio.js` | Throttle map read and written exclusively by `_canPlay()` inside the audio engine |
| `_audioReady` | `audio.js` | Gate flag set by the audio lifecycle IIFE and read only by `_getAC()` |
| `config` | `constants.js` | Static Phaser game config object; consumed once by `new Phaser.Game(config)` and never referenced again — properly belongs in `init.js` (per target structure) but that file is not in the current destination list |
| `game` | `state.js` | The live Phaser.Game instance; read by `_onWindowResize`, `togglePause()`, `returnToHangar()`, `goToMainMenu()`, and `loot-system.js` / `enemy-types.js` via `window.game` |
| `_FEELER_OFFSETS` | `enemies.js` | Frozen constant used exclusively by `handleEnemyAI()` — hoisted for perf, logically owned by the enemy AI module |
| `_CONE_RAY_POINTS` | `enemies.js` | Pre-allocated pool mutated in-place each frame exclusively by `handleEnemyAI()` |
| `_currentPerkKeys` | `perks.js` | Written by `showPerkMenu()`; read only by the perk number-key handler in `events.js` — purely perk UI state |
| `_currentPerkNextRound` | `perks.js` | Written by `showPerkMenu()`; read only by the perk pick path — perk UI coordination value |
| `SUPABASE_URL` | `constants.js` | Static endpoint URL; never changes at runtime — infrastructure constant shared by leaderboard and campaign cloud-save fetch calls |
| `SUPABASE_KEY` | `constants.js` | Static publishable API key; same rationale as `SUPABASE_URL` |
| `SUPABASE_TABLE` | `constants.js` | Static table name string; same rationale |
| `SUPABASE_CAMPAIGN_TABLE` | `constants.js` | Static table name string; same rationale |
| `LB_KEY` | `constants.js` | Static `localStorage` key string; only used by leaderboard functions but is a never-changing identifier |
| `LB_MAX` | `constants.js` | Static numeric cap; only used by `_insertScore()` but is a configuration constant |
| `SCORE_MAX_ROUND` | `constants.js` | Validation ceiling constant; used only by `_validateScoreEntry()` |
| `SCORE_MAX_KILLS` | `constants.js` | Same pattern as `SCORE_MAX_ROUND` |
| `SCORE_MAX_DAMAGE` | `constants.js` | Same pattern |
| `_pendingRun` | `state.js` | Written at run-end by `_capturePendingRun()`; read at submission by `_insertScore()` and death-screen render — bridges the round-end moment and the menu display |
| `_playerCallsign` | `state.js` | Written by menu entry flows; read by leaderboard, PVP HUD, and leaderboard capture — shared across menus and multiplayer |
| `_buildingGraphics` | `state.js` | Array of Phaser Graphics objects destroyed and rebuilt each round by `placeBuilding()` and `_clearMapForRound()`; will move to `cover.js` once that file exists |
| `COVER_DEFS` | `constants.js` | Static array of cover-piece layout definitions; passed as a parameter to arena generator functions — never mutated |
| `LOOT_TYPES` | `constants.js` | Static definitions for the three consumable loot-orb types; read by spawn and pickup functions and minimap |
| `lootPickups` | `state.js` | Mutable array of live scene objects; written by `spawnLoot()`, consumed by `checkLootPickups()`, and cleared by `_clearMapForRound()` — crosses combat, loot, and round systems |
| `_playerBulletOverlap` | `state.js` | Phaser Collider reference; created in `deployMech()` and destroyed in `_cleanupGame()` — part of the deploy/cleanup lifecycle |
| `_playerEnemyCollider` | `state.js` | Same deploy/cleanup lifecycle as `_playerBulletOverlap` |
| `_enemyEnemyCollider` | `state.js` | Same deploy/cleanup lifecycle |
| `ENEMY_COLORS` | `constants.js` | Static color palette; read by `buildEnemyTorso()` and `enemy-types.js` — cross-file constant |
| `COMMANDER_COLORS` | `constants.js` | Static color palette for commanders; same cross-file usage pattern as `ENEMY_COLORS` |
| `MEDIC_COLORS` | `constants.js` | Static color palette for medics |
| `BOSS_COLORS` | `constants.js` | Static color palettes for all 8 bosses; read by each boss spawner |
| `ENEMY_PRIMARY` | `constants.js` | Static weapon key list; read by `randomEnemyLoadout()` and could be needed by `enemy-types.js` |
| `ENEMY_ARM_WEAPONS` | `constants.js` | Static weapon key list; read by enemy spawn and commander spawn functions |
| `ENEMY_2H_WEAPONS` | `constants.js` | Static two-handed weapon key list; read by enemy spawners |
| `_eDollTarget` | `hud.js` | Written and read exclusively by `updateEnemyDoll()` and its hide-timer callback — purely HUD state |
| `_eDollHideTimer` | `hud.js` | `setTimeout` handle managed entirely within `updateEnemyDoll()` — HUD-internal |
| `HUD_NAMES` | `hud.js` | Const display-name map read only by `updateHUD()`; no other system uses it |
| `SLOT_ID_MAP` | `garage.js` | Const slot-ID-to-loadout-key map read exclusively by `buildDD()`, `selectSlot()`, and `toggleDD()` |
| `WEAPON_OPTIONS` | `garage.js` | Const array read only by `buildDD()` for the weapon dropdown |
| `MOD_OPTIONS` | `garage.js` | Const array read only by `buildDD()` for the mod dropdown |
| `AUG_OPTIONS` | `garage.js` | Const array read only by `buildDD()` for the augment dropdown |
| `LEG_OPTIONS` | `garage.js` | Const array read only by `buildDD()` for the leg system dropdown |
| `SHIELD_OPTIONS` | `garage.js` | Const array read only by `buildDD()` for the shield dropdown |
| `SLOT_DESCS` | `garage.js` | Const description map read only by the garage stats panel render |
| `COLOR_OPTIONS` | `garage.js` | Const array read only by `buildDD()` (color slot) and `refreshMechColor()` |
| `EXPLOSIVE_KEYS` | `constants.js` | Const `Set` read by `fire()`, `damageEnemy()`, and perk eligibility checks — used across combat and perk systems, too broadly shared for a single feature file |
| `_openDD` | `garage.js` | Written and read only by `toggleDD()`, `closeAllDD()`, and `buildDD()` — garage-internal dropdown state |
| `_isStats` | `state.js` | Read by `campaign-system.js` (confirmed in DEPENDENCY_MAP §2.4) and reset by `_cleanupGame()` — cross-file read forces it out of `garage.js` into shared state |
| `_isInventory` | `state.js` | Reset by `toggleStats()` and participates in the equip-prompt state flow that crosses menus and garage — shared between those systems |
| `_pendingLoadoutTab` | `state.js` | Acts as a coordination signal between the equip-prompt (menus) and the inventory view (garage); consumed and nulled by `toggleStats()` |
| `_isPaused` | `state.js` | Read by `update()`, `handlePlayerFiring()`, `activateJump()`, and the global keydown handler — too widely consulted to be local to any one feature file |
| `_selectedNewChassis` | `menus.js` | Written and read exclusively within the new-campaign chassis-selection overlay and its keydown handler; no other system touches it |

---

## Section 3 — Collision Risks

### Pass 1 Methodology

Each of the five external JS files (`loot-system.js`, `enemy-types.js`, `arena-objectives.js`, `campaign-system.js`, `multiplayer.js`) was scanned for top-level `let`/`const`/`var` declarations. Every name found was compared against all 130 names in Section 1.

### Cross-File Collisions

| Variable | File A | File B | Same Thing? | Risk |
|----------|--------|--------|-------------|------|
| *(none)* | — | — | — | **No exact name collisions found.** All five external files use distinct prefixes (`_mp*`, `_pvp*`, `_arena*`, `_campaign*`, `_shop*`, `_loot*`, `ENEMY_TYPE_*`, etc.) that do not overlap with any index.html top-level declaration. |

**Near-miss semantic pairs (different names, same concept — confusing during refactor):**

| index.html name | External file name | File | Relationship |
|---|---|---|---|
| `_openDD` | `_pvpOpenDD` | `multiplayer.js` | Both track the currently open dropdown slot key; parallel pattern, same data shape, different UI contexts |
| `_playerBulletOverlap` | `_mpBulletOverlap` | `multiplayer.js` | Both are stored Phaser `Collider` references for bullet overlap; parallel lifecycle but different bullet groups |
| `isDeployed` | `_mpAlive` | `multiplayer.js` | Both answer "is the local player currently active in the game world"; semantically overlapping but structurally different (isDeployed gates PvE deploy, _mpAlive tracks PVP respawn state) |
| `_round` | `_campaignState.currentMission` | `campaign-system.js` | Both encode "where in the progression sequence are we"; misreading one for the other in scaling formulas is an existing pitfall noted in CLAUDE.md |

### Generic Name Risks

| Variable | Current File | Risk | Suggested Rename |
|----------|-------------|------|-----------------|
| `keys` | `state.js` | **HIGH** — 4 chars; `keys` is a standard JS idiom (`Object.keys()`, destructuring, `event.key`). Any future utility or extracted function that writes `const keys = …` at module scope will silently shadow or be shadowed by this Phaser cursor-key handle. Most likely name to collide. | `_cursorKeys` |
| `config` | `constants.js` | **HIGH** — 6 chars, no prefix; one of the most common variable names in all of JavaScript. Every library, plugin, and future feature file that needs a configuration object will naturally reach for `config`. The refactor will import this file globally, making the bare name a landmine. | `PHASER_CONFIG` (it's a `const` — use SCREAMING_SNAKE) |
| `game` | `state.js` | **HIGH** — 4 chars, no prefix; the Phaser game instance. Any loop body, callback, or spawned agent that needs "the game" will instinctively write `const game = …`, immediately shadowing this global. Also: Phaser's own documentation uses `game` as the canonical example variable name. | `_phaserGame` |
| `_ac` | `audio.js` | **HIGH** — 3 chars; the most terse name in the entire file. `ac` is also a common abbreviation for AbortController, access control, alternating current, and `accumulator`. Any developer unfamiliar with the audio engine who adds `const _ac = …` anywhere will silently clobber the AudioContext reference. | `_audioCtx` |
| `player` | `state.js` | **MEDIUM-HIGH** — 6 chars, no underscore prefix despite being module-level mutable state. `player` is the single most common local parameter name in game-engine code — every `spawnEnemy(scene, player)`, `onHit(player, bullet)`, and similar callback uses it. Already confirmed issue: `multiplayer.js` assigns to `torso` (the paired global) and the DEPENDENCY_MAP notes the paired write risk. | `_player` (adds underscore per module-state convention; external files already access it via `window.player`) |
| `reloadL` | `state.js` | **MEDIUM** — no underscore prefix for a module-level mutable var; single-letter suffix `L` makes automated search ambiguous (matches `reloadLobby`, `reloadLevel`, etc.). Inconsistent with `_roundKills`, `_lastKillTime`, etc. | `_reloadL` |
| `reloadR` | `state.js` | **MEDIUM** — same issues as `reloadL`. | `_reloadR` |
| `lastDamageTime` | `state.js` | **MEDIUM** — module-level mutable state missing underscore prefix per project convention (compare: `_lastPlayerDamageTime`, `_lastKillTime`, `_lastTorsoX`). Without the prefix, a function with a local `const lastDamageTime = …` would silently shadow the global, breaking shield regen. | `_lastDamageTime` |
| `lastModTime` | `state.js` | **MEDIUM** — same missing-underscore issue as `lastDamageTime`; module-level timing var used as a mod-cooldown gate, breakable by any local `lastModTime` declaration. | `_lastModTime` |
| `loadout` | `state.js` | **MEDIUM** — no underscore prefix; a natural local variable name in any function that processes loadout data (e.g., `function applyLoadout(loadout) {…}`). Currently read by `loot-system.js`, `campaign-system.js`, and `multiplayer.js` as `window.loadout` — the bare name is workable but fragile. | `_loadout` |
| `lootPickups` | `state.js` | **LOW-MEDIUM** — no underscore prefix for a module-level mutable array. Less collision-prone than `loadout` because the compound word is more specific, but inconsistent with `_buildingGraphics`, `_equipmentDrops` (loot-system.js) and other array globals. | `_lootPickups` |
| `LB_KEY` | `constants.js` | **LOW** — `LB` is a non-obvious abbreviation for "leaderboard"; not a naming collision risk per se but a comprehension risk — new contributors may search for `LEADERBOARD` and miss this constant, leading to duplicate declarations. | `LEADERBOARD_LS_KEY` |
| `LB_MAX` | `constants.js` | **LOW** — same opaque-abbreviation issue as `LB_KEY`. | `LEADERBOARD_MAX_ENTRIES` |
| `_openDD` | `garage.js` | **LOW** — `DD` is an abbreviation for "dropdown" that is not defined anywhere in the codebase documentation. Combined with the parallel `_pvpOpenDD` in `multiplayer.js`, a new developer working on both files could confuse them. | `_openDropdownSlot` |
