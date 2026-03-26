// ═══════════ STATE ═══════════
// All mutable runtime globals shared across systems.
// Every variable declared here is accessible from index.html and all
// external JS files that run in the same page context.

// ── PHASER OBJECTS ───────────────────────────────────────────────
// Phaser physics body for the player (invisible; moves with WASD).
let player, torso, keys;

// Phaser groups — created once in create(), never destroyed; only children cleared.
let enemies, bullets, enemyBullets;

// Phaser miscellaneous scene objects created at deploy time.
let shieldGraphic;
let coverObjects;
let speedStreakLine, crosshair;
let glowWedge;

// Stored Phaser Collider references — destroyed and re-registered each deploy.
let _playerBulletOverlap  = null;
let _playerEnemyCollider  = null;
let _enemyEnemyCollider   = null;

// Root Phaser.Game instance (assigned in index.html after GAME_CONFIG is built).
let GAME;

// ── GAME MODE & FLAGS ────────────────────────────────────────────
// Active game mode: 'simulation' | 'campaign' | 'pvp'
let _gameMode = 'simulation';

// True once the drop-in tween completes; false in hangar and during drop-in animation.
let isDeployed = false;

// True while the pause overlay is visible.
let _isPaused = false;

// True while the stats / loadout overlay is open.
let _isStats = false;

// True while the gear / inventory overlay tab is the active view.
let _isInventory = false;

// Tab name to auto-switch to when the stats overlay opens; consumed by toggleStats().
let _pendingLoadoutTab = null;

// ── LOADOUT ──────────────────────────────────────────────────────
/** Current loadout selected in the garage. */
let loadout = {
    chassis: 'light',
    L: 'smg',
    R: 'none',
    cpu: 'none',
    aug: 'none',
    leg: 'none',
    shld: 'none',
    color: 0x00ff00
};

// Saved loadout snapshots taken at deploy time; used to restore on respawn.
let _savedL   = null;
let _savedR   = null;
let _savedCpu = null;
let _savedAug = null;
let _savedLeg = null;

// Per-arm / per-limb destruction flags.
let _lArmDestroyed = false, _rArmDestroyed = false, _legsDestroyed = false;

// ── ROUND STATE ──────────────────────────────────────────────────
let _round          = 1;
let _bestRound      = 1;
let _roundKills     = 0;   // kills this round
let _roundTotal     = 0;   // enemies in this round
let _totalKills     = 0;
let _shotsFired     = 0;   // total shots fired this run
let _shotsHit       = 0;   // player bullets that hit an enemy this run
let _damageDealt    = 0;   // total damage dealt to enemies this run
let _damageTaken    = 0;   // total damage taken by player this run
let _perksEarned    = 0;   // perks picked this run
let _roundActive    = false;
let _roundClearing  = false; // freeze movement during round-clear banner + perk menu
let _extractionActive     = false;  // true after all enemies killed, waiting to extract
let _extractionPoint      = null;   // { x, y } world coords of extraction zone
let _extractionVisuals    = null;   // scene objects for the extraction zone
let _extractionPromptShown = false; // whether "PRESS E" prompt is visible

// ── COMBAT STATE ─────────────────────────────────────────────────
// Left / right arm reload timestamps (scene.time.now of next allowed shot).
let reloadL = 0;
let reloadR = 0;

// Damage and mod timing.
let lastDamageTime         = -99999;
let lastModTime            = 0;
let _lastPlayerDamageTime  = 0;

// Modification active flags.
let isJumping       = false;
let isShieldActive  = false;
let isRageActive    = false;
let _rageDmgMult    = 1.0;
let isAmmoActive    = false;  // loot: 50% reload reduction for 8s
let isChargeActive  = false;  // loot: 50% mod cooldown reduction for 10s

// Chassis-specific movement effect state (will move to mechs.js once that file exists).
let _footstepTimer  = 0;
let _footstepSide   = 1;
let _shockwaveTimer = 0;
let _lastTorsoX     = 0;  // light trail tracking
let _lastTorsoY     = 0;
let _lastTorsoMX    = 0;  // medium blur tracking
let _lastTorsoMY    = 0;

// ── PERK STATE ───────────────────────────────────────────────────
let _perkState = { dmgMult:1, reloadMult:1, speedMult:1, shieldRegenMult:1, lootMult:1, noShieldRegen:false, jumpDisabled:false, critChance:0, blastMult:1, armorPierce:0, adrenalineStacks:0, autoRepair:0, lastStand:false, fieldEngineer:0, empResist:0, commanderBounty:false, dodgeChance:0, hitRunStacks:0, jumpCdMult:1, flicker:false, predatorStacks:0, suppressStacks:0, battleRhythm:0, resilience:false, adaptiveArmor:0, fortress:0, siegeMode:0, ironWill:false, reactorCore:false, perfectAccuracy:false, pointBlank:0, coldShot:false, coldShotReady:false, clusterRounds:false, afterburn:false, reactiveShield:0, rageDurMult:1, jumpSpeedMult:1, chainEmp:false, plsmMult:1, _hitRunActive:false, _hitRunTimer:0, _flickerActive:false, _flickerLastTrigger:0, _adaptiveActive:false, _adaptiveTimer:0, _predatorCharged:false, _suppressedEnemies:new Map(), _ironWillUsed:false, _battleRhythmBonus:0, targetPainter:false, _paintedEnemy:null, threatAnalyzer:false, overclockCpu:false, reactivePlating:false, _reactivePlatingStacks:0, railChargeActive:false, _railChargeStart:0, legSystemActive:true, mineLayerTimer:0, _magAnchorsActive:false, _droneActive:false, fthRange:0, fthDmg:0, hollowPoint:0, threatScanner:0, opportunist:0, pressureSystem:0, _pressureTarget:null, _pressureStacks:0, resonance:0, overchargeRounds:0, _shotCounter:0, incendiary:0, chainReaction:0, killStreak:0, _killStreakCount:0, _killStreakActive:false, glassStep:false, _glassStepUsed:false, scrapShield:0, titanCore:false, sgFlechette:0, srBreath:0, brMarksman:0, _mgShotCount:0, mgTracer:false, salvageProtocol:false, afterimage:false, barrierSpike:false, groundPound:0, empAmplifier:false, jumpSlam:0, rlTandem:false, plsmChain:false, rageFeed:0, _rageEndTime:0, scorchedEarth:false, reinforcedCore:false, anchorFortress:false, painterDuration:0, analyzerDepth:false, platingMaxStacks:5, droneUplink:0, droneCdMult:1, neuralLink:0, swarmLogic:0, droneArmor:0, overwatchStacks:0, overwatchKills:0, autonomousUnit:false, _autoDroneActive:false, _autoDroneRespawnTimer:null, ghostJump:false, kineticLanding:0, jumpCharges:1, _jumpChargesLeft:1, snapCharge:false, _snapChargeReady:false, tungstenCore:false, piercingMomentum:0, oneShot:false, penetrator:0, phantomProtocol:false, _phantomActive:false, _phantomTimer:null, inferno:false, meltArmor:0, pressureSpray:false, napalmStrike:false, thornsProtocol:0, capacitorArmor:0, _capacitorCharge:0, meltdownCore:false, fthNapalm:false, lightSpectre:false, lightGhostMech:false, mediumCommand:false, mediumApexSystem:false, heavyDreadnought:false, heavyTitan:false, adaptiveEvolution:false, heavyCoreTank:false, _heavyCoreTankUsed:false, heavyRampage:false, mediumOverload:false, mediumSalvage:false, mediumMultiMod:false, apexPredator:false, _apexPredatorActive:false };

let _spectreClones    = [];
let _lastKillTime     = 0;   // timestamp of last enemy kill — used for multi-kill tracking
let _pickedPerks      = [];
let _lastOfferedPerks = [];

// ── LOOT STATE ───────────────────────────────────────────────────
// Active consumable loot-orb scene objects (repair / ammo / charge).
let lootPickups = [];

// _buildingGraphics — moved to js/cover.js

// ── LEADERBOARD / RUN STATE ──────────────────────────────────────
// Captured run stats held between death and leaderboard submission.
let _pendingRun = null;

// Player's chosen callsign (sanitized, uppercased).
let _playerCallsign = 'ANONYMOUS';

// ── ENEMY DOLL STATE ─────────────────────────────────────────────
let _eDollTarget   = null;
let _eDollHideTimer = null;

// ── GARAGE DROPDOWN STATE ────────────────────────────────────────
let _openDD = null; // currently open dropdown slot key

