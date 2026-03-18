// ═══════════════════════════════════════════════════════════════════
//  CAMPAIGN MISSION SYSTEM — Phases 3 & 4
//  Phase 3: Chapters, missions, player leveling, modifiers, bonus
//           objectives, variable enemy compositions, XP scaling.
//  Phase 4: Chassis upgrades, hangar shop, mission rewards, loadout slots.
// ═══════════════════════════════════════════════════════════════════
//
// ── CROSS-FILE DEPENDENCIES ──────────────────────────────────────
// This file is loaded via <script> in index.html AFTER arena-objectives.js.
//
// GLOBALS EXPORTED:
//   CAMPAIGN_CHAPTERS     — chapter/mission definitions
//   _campaignState        — active campaign state (current chapter, mission, XP, level, etc.)
//   MISSION_MODIFIERS     — random modifier definitions
//   BONUS_OBJECTIVES      — random bonus objective definitions
//   CHASSIS_UPGRADES      — level-gated chassis stat bonuses (Phase 4)
//   MISSION_REWARDS       — first-clear guaranteed loot per mission (Phase 4)
//   SHOP_INVENTORY        — shop stock definitions (Phase 4)
//
// FUNCTIONS CALLED FROM index.html:
//   getCampaignMission()        — returns current mission config
//   getCampaignEnemyConfig()    — returns enemy spawn config for current mission
//   awardMissionXP(kills)       — award XP after mission clear
//   applyCampaignDeathPenalty() — apply scrap loss on death
//   rollMissionModifier()       — roll a random modifier for current deploy
//   rollBonusObjective()        — roll a random bonus objective
//   checkBonusObjective(event)  — check if bonus objective condition is met
//   getXPForLevel(level)        — XP required for a given level
//   getXPMultiplier(playerLvl, missionLvl) — level-differential multiplier
//   showMissionSelect()         — show mission/chapter select UI
//   saveCampaignState()         — save full campaign state
//   loadCampaignState()         — load full campaign state
//   getChassisUpgrades(level)   — get all chassis upgrades for current level (Phase 4)
//   applyChassisUpgrades()      — apply level-based chassis stat bonuses (Phase 4)
//   getMissionReward(missionId) — get first-clear reward for a mission (Phase 4)
//   showShop()                  — show campaign hangar shop UI (Phase 4)
//   refreshShopStock()          — restock shop inventory (Phase 4)
//   saveLoadoutSlot(slotIdx)    — save current loadout to a slot (Phase 4)
//   loadLoadoutSlot(slotIdx)    — load a saved loadout from a slot (Phase 4)
//   showLoadoutSlots()          — show loadout slot management UI (Phase 4)
//
// GLOBALS READ FROM index.html / other files:
//   _gameMode, _scrap, _round, _totalKills, _roundKills,
//   ARENA_DEFS, OBJECTIVE_DEFS, ENEMY_TYPE_DEFS, CHASSIS, loadout
// ──────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════
// CAMPAIGN CHAPTER & MISSION DEFINITIONS
// 5 chapters × 5 missions = 25 total
// Each chapter maps to a primary arena
// ══════════════════════════════════════════════════════════════════

const CAMPAIGN_CHAPTERS = [
    // ── CHAPTER 1: WAREHOUSE DISTRICT ────────────────────────────
    {
        id: 'ch1',
        title: 'WAREHOUSE DISTRICT',
        desc: 'Clear the abandoned industrial sector of rogue mechs.',
        unlockRequirement: 0, // always unlocked
        missions: [
            {
                id: 'ch1_m1', name: 'Warehouse Sweep',
                briefing: 'Rogue mechs detected in Sector 7. Eliminate all contacts.',
                arena: 'warehouse', objective: 'elimination',
                enemyLevel: 1, enemyCount: 3, hasBoss: false
            },
            {
                id: 'ch1_m2', name: 'First Contact',
                briefing: 'Multiple hostiles converging on your position. Hold the line.',
                arena: 'warehouse', objective: 'elimination',
                enemyLevel: 2, enemyCount: 4, hasBoss: false
            },
            {
                id: 'ch1_m3', name: 'Salvage Run',
                briefing: 'Intelligence cores scattered across the warehouse. Recover them before the enemy does.',
                arena: 'warehouse', objective: 'salvage',
                enemyLevel: 3, enemyCount: 4, hasBoss: false
            },
            {
                id: 'ch1_m4', name: 'Under Siege',
                briefing: 'Enemy forces are targeting our generator. Protect it at all costs.',
                arena: 'warehouse', objective: 'defense',
                enemyLevel: 4, enemyCount: 5, hasBoss: false
            },
            {
                id: 'ch1_m5', name: 'Warehouse Boss',
                briefing: 'A heavily armored command unit has taken position in the warehouse. Destroy it.',
                arena: 'warehouse', objective: 'elimination',
                enemyLevel: 5, enemyCount: 2, hasBoss: true
            }
        ]
    },
    // ── CHAPTER 2: THE CORRIDORS ─────────────────────────────────
    {
        id: 'ch2',
        title: 'THE CORRIDORS',
        desc: 'Navigate the narrow passages of the underground transit network.',
        unlockRequirement: 3, // complete 3 missions in chapter 1
        missions: [
            {
                id: 'ch2_m1', name: 'Corridor Breach',
                briefing: 'Hostiles fortified in the transit tunnels. Push through.',
                arena: 'corridors', objective: 'elimination',
                enemyLevel: 5, enemyCount: 5, hasBoss: false
            },
            {
                id: 'ch2_m2', name: 'Chokepoint',
                briefing: 'Enemy snipers control the main corridor. Survive their ambush.',
                arena: 'corridors', objective: 'survival',
                enemyLevel: 6, enemyCount: 6, hasBoss: false
            },
            {
                id: 'ch2_m3', name: 'High Value Target',
                briefing: 'Intelligence identifies a rogue commander in the tunnels. Eliminate them.',
                arena: 'corridors', objective: 'assassination',
                enemyLevel: 7, enemyCount: 5, hasBoss: false
            },
            {
                id: 'ch2_m4', name: 'Data Recovery',
                briefing: 'Critical data cores are hidden throughout the corridor network. Find them.',
                arena: 'corridors', objective: 'salvage',
                enemyLevel: 8, enemyCount: 6, hasBoss: false
            },
            {
                id: 'ch2_m5', name: 'Tunnel Warden',
                briefing: 'A massive siege unit blocks the exit. Break through or be buried.',
                arena: 'corridors', objective: 'elimination',
                enemyLevel: 10, enemyCount: 3, hasBoss: true
            }
        ]
    },
    // ── CHAPTER 3: THE PIT ───────────────────────────────────────
    {
        id: 'ch3',
        title: 'THE PIT',
        desc: 'Descend into the combat arena where the zone never stops shrinking.',
        unlockRequirement: 3,
        missions: [
            {
                id: 'ch3_m1', name: 'Descent',
                briefing: 'The pit awaits. Fight your way to the center as the zone closes in.',
                arena: 'pit', objective: 'survival',
                enemyLevel: 9, enemyCount: 5, hasBoss: false
            },
            {
                id: 'ch3_m2', name: 'Blood Sport',
                briefing: 'No rules. No mercy. Eliminate everything that moves.',
                arena: 'pit', objective: 'elimination',
                enemyLevel: 10, enemyCount: 7, hasBoss: false
            },
            {
                id: 'ch3_m3', name: 'The Gauntlet',
                briefing: 'Wave after wave of enemies in a shrinking arena. How long can you last?',
                arena: 'pit', objective: 'survival',
                enemyLevel: 11, enemyCount: 8, hasBoss: false
            },
            {
                id: 'ch3_m4', name: 'Pit Viper',
                briefing: 'A modified assassin mech lurks in the pit. Hunt it down before it hunts you.',
                arena: 'pit', objective: 'assassination',
                enemyLevel: 12, enemyCount: 6, hasBoss: false
            },
            {
                id: 'ch3_m5', name: 'Pit Champion',
                briefing: 'The reigning champion of The Pit challenges you. Only one mech leaves.',
                arena: 'pit', objective: 'elimination',
                enemyLevel: 14, enemyCount: 3, hasBoss: true
            }
        ]
    },
    // ── CHAPTER 4: STRONGHOLD ────────────────────────────────────
    {
        id: 'ch4',
        title: 'THE STRONGHOLD',
        desc: 'Assault the fortified enemy headquarters.',
        unlockRequirement: 3,
        missions: [
            {
                id: 'ch4_m1', name: 'Outer Defenses',
                briefing: 'Breach the outer perimeter. Expect heavy resistance.',
                arena: 'stronghold', objective: 'elimination',
                enemyLevel: 13, enemyCount: 7, hasBoss: false
            },
            {
                id: 'ch4_m2', name: 'Defend the Relay',
                briefing: 'Our comms relay is under attack. Protect it while reinforcements arrive.',
                arena: 'stronghold', objective: 'defense',
                enemyLevel: 14, enemyCount: 8, hasBoss: false
            },
            {
                id: 'ch4_m3', name: 'Behind Enemy Lines',
                briefing: 'Recover encrypted intel from deep within the stronghold.',
                arena: 'stronghold', objective: 'salvage',
                enemyLevel: 15, enemyCount: 7, hasBoss: false
            },
            {
                id: 'ch4_m4', name: 'Iron Curtain',
                briefing: 'Survive the enemy\'s full assault. They know you\'re coming.',
                arena: 'stronghold', objective: 'survival',
                enemyLevel: 16, enemyCount: 9, hasBoss: false
            },
            {
                id: 'ch4_m5', name: 'Stronghold Commander',
                briefing: 'The stronghold\'s commander deploys their personal war machine. End this.',
                arena: 'stronghold', objective: 'elimination',
                enemyLevel: 18, enemyCount: 4, hasBoss: true
            }
        ]
    },
    // ── CHAPTER 5: COMMAND POST ──────────────────────────────────
    {
        id: 'ch5',
        title: 'COMMAND POST',
        desc: 'The final assault on the enemy\'s central command.',
        unlockRequirement: 3,
        missions: [
            {
                id: 'ch5_m1', name: 'Forward Operating Base',
                briefing: 'Establish a foothold at the command post perimeter.',
                arena: 'tower_defense', objective: 'defense',
                enemyLevel: 17, enemyCount: 8, hasBoss: false
            },
            {
                id: 'ch5_m2', name: 'Signal Intercept',
                briefing: 'Recover enemy transmission data before they purge the servers.',
                arena: 'tower_defense', objective: 'salvage',
                enemyLevel: 18, enemyCount: 8, hasBoss: false
            },
            {
                id: 'ch5_m3', name: 'Kill Order',
                briefing: 'The enemy general is exposed. Execute the kill order.',
                arena: 'tower_defense', objective: 'assassination',
                enemyLevel: 19, enemyCount: 9, hasBoss: false
            },
            {
                id: 'ch5_m4', name: 'Last Stand',
                briefing: 'The enemy throws everything they have. Hold the generator or lose everything.',
                arena: 'tower_defense', objective: 'defense',
                enemyLevel: 20, enemyCount: 10, hasBoss: false
            },
            {
                id: 'ch5_m5', name: 'Endgame',
                briefing: 'The final boss. The war ends here.',
                arena: 'tower_defense', objective: 'elimination',
                enemyLevel: 22, enemyCount: 5, hasBoss: true
            }
        ]
    }
];

// ══════════════════════════════════════════════════════════════════
// CAMPAIGN STATE
// ══════════════════════════════════════════════════════════════════

let _campaignState = {
    playerLevel: 1,
    playerXP: 0,
    currentChapter: 0,    // index into CAMPAIGN_CHAPTERS
    currentMission: 0,    // index into chapter.missions
    // Locked chassis type chosen at campaign start
    chassis: null,
    // Track completed missions: { 'ch1_m1': true, 'ch1_m3': true, ... }
    completedMissions: {},
    // Currently active modifier and bonus objective for this deploy
    activeModifier: null,
    activeBonusObjective: null,
    bonusObjectiveProgress: 0,
    bonusObjectiveComplete: false,
    // Phase 4: Claimed first-clear rewards: { 'ch1_m1': true, ... }
    claimedRewards: {},
    // Phase 4: Saved loadout configurations
    loadoutSlots: []
};

// ══════════════════════════════════════════════════════════════════
// PLAYER LEVELING
// ══════════════════════════════════════════════════════════════════

/** XP required to reach a given level (cumulative). */
function getXPForLevel(level) {
    if (level <= 1) return 0;
    // Escalating curve: each level needs more XP
    // Level 2: 100, Level 3: 250, Level 4: 450, Level 5: 700, ...
    let total = 0;
    for (let i = 2; i <= level; i++) {
        total += 50 + (i - 1) * 50;
    }
    return total;
}

/** XP needed from current level to next level. */
function getXPToNextLevel(level) {
    return getXPForLevel(level + 1) - getXPForLevel(level);
}

/** Level-differential XP multiplier.
 *  playerLvl vs missionEnemyLvl determines reward scaling.
 *  Smooth curve with steep diminishing returns for lower-level enemies.
 *  At same level: 1.0x. Higher enemies: up to 1.5x. Lower enemies drop off fast. */
function getXPMultiplier(playerLvl, missionLvl) {
    const diff = missionLvl - playerLvl; // positive = enemies above, negative = below
    if (diff >= 5)  return 1.60;  // enemies 5+ above
    if (diff >= 3)  return 1.50;  // enemies 3-4 above
    if (diff >= 1)  return 1.00 + diff * 0.15; // enemies 1-2 above: 1.15, 1.30
    if (diff === 0) return 1.00;  // same level
    // Below player level: steep exponential dropoff
    // diff=-1: 0.55, diff=-2: 0.30, diff=-3: 0.15, diff=-4: 0.08, diff=-5+: 0.05
    const penalty = Math.max(0.05, Math.pow(0.55, Math.abs(diff)));
    return Math.round(penalty * 100) / 100;
}

/** Base XP for completing a mission (before multiplier). */
function getBaseMissionXP(mission) {
    // Base XP scales with enemy level and count
    return Math.round(40 * mission.enemyLevel + 15 * mission.enemyCount + (mission.hasBoss ? 80 : 0));
}

/** Award XP after clearing a mission. Returns { xpGained, leveledUp, newLevel }. */
function awardMissionXP() {
    const mission = getCampaignMission();
    if (!mission) return { xpGained: 0, leveledUp: false, newLevel: _campaignState.playerLevel };

    const baseXP = getBaseMissionXP(mission);
    const mult = getXPMultiplier(_campaignState.playerLevel, mission.enemyLevel);
    // Bonus objective completion grants +30% XP
    const bonusMult = _campaignState.bonusObjectiveComplete ? 1.30 : 1.00;
    // Active modifier bonus (some modifiers grant +XP)
    const modMult = (_campaignState.activeModifier?.xpMult) || 1.00;

    const totalXP = Math.round(baseXP * mult * bonusMult * modMult);

    const oldLevel = _campaignState.playerLevel;
    _campaignState.playerXP += totalXP;

    // Check for level ups
    let leveled = false;
    while (_campaignState.playerXP >= getXPForLevel(_campaignState.playerLevel + 1)) {
        _campaignState.playerLevel++;
        leveled = true;
    }

    return { xpGained: totalXP, leveledUp: leveled, newLevel: _campaignState.playerLevel, oldLevel };
}

// ══════════════════════════════════════════════════════════════════
// MISSION MODIFIERS (random per deploy)
// ══════════════════════════════════════════════════════════════════

const MISSION_MODIFIERS = [
    {
        id: 'dense_fog',
        label: 'DENSE FOG',
        desc: 'Reduced enemy vision range',
        icon: '🌫',
        effect: 'enemyVisionMult',
        value: 0.60,
        xpMult: 1.0
    },
    {
        id: 'reinforcements',
        label: 'REINFORCEMENTS',
        desc: '+3 extra enemies',
        icon: '⚠',
        effect: 'extraEnemies',
        value: 3,
        xpMult: 1.15
    },
    {
        id: 'scrap_surge',
        label: 'SCRAP SURGE',
        desc: '+50% scrap drops',
        icon: '💰',
        effect: 'scrapMult',
        value: 1.50,
        xpMult: 1.0
    },
    {
        id: 'elite_patrol',
        label: 'ELITE PATROL',
        desc: 'All enemies are elite',
        icon: '⚡',
        effect: 'allElite',
        value: true,
        xpMult: 1.25
    },
    {
        id: 'fragile_hulls',
        label: 'FRAGILE HULLS',
        desc: 'Enemies have -30% HP',
        icon: '🔻',
        effect: 'enemyHpMult',
        value: 0.70,
        xpMult: 0.90
    },
    {
        id: 'hardened_armor',
        label: 'HARDENED ARMOR',
        desc: 'Enemies have +25% HP',
        icon: '🛡',
        effect: 'enemyHpMult',
        value: 1.25,
        xpMult: 1.15
    },
    {
        id: 'fast_deploy',
        label: 'FAST DEPLOY',
        desc: 'Enemies move 20% faster',
        icon: '💨',
        effect: 'enemySpeedMult',
        value: 1.20,
        xpMult: 1.10
    },
    {
        id: 'no_modifier',
        label: 'STANDARD OPS',
        desc: 'No modifier active',
        icon: '—',
        effect: 'none',
        value: null,
        xpMult: 1.0
    }
];

/** Roll a random mission modifier. */
function rollMissionModifier() {
    const mod = MISSION_MODIFIERS[Math.floor(Math.random() * MISSION_MODIFIERS.length)];
    _campaignState.activeModifier = mod;
    return mod;
}

// ══════════════════════════════════════════════════════════════════
// BONUS OBJECTIVES (random per deploy)
// ══════════════════════════════════════════════════════════════════

const BONUS_OBJECTIVES = [
    {
        id: 'melee_kills',
        label: 'CLOSE QUARTERS',
        desc: 'Kill 3 enemies within 150px',
        icon: '⚔',
        target: 3,
        trackEvent: 'close_kill'
    },
    {
        id: 'no_damage',
        label: 'UNTOUCHABLE',
        desc: 'Take no core damage',
        icon: '✦',
        target: 1,
        trackEvent: 'no_core_damage'
    },
    {
        id: 'headshot_kills',
        label: 'PRECISION STRIKES',
        desc: 'Destroy 4 enemy heads',
        icon: '◎',
        target: 4,
        trackEvent: 'head_destroy'
    },
    {
        id: 'speed_run',
        label: 'SPEED RUN',
        desc: 'Complete mission in under 60s',
        icon: '⏱',
        target: 60000,
        trackEvent: 'time_limit'
    },
    {
        id: 'multi_kill',
        label: 'MULTI KILL',
        desc: 'Kill 2 enemies within 2 seconds',
        icon: '💥',
        target: 1,
        trackEvent: 'multi_kill'
    },
    {
        id: 'shield_breaker',
        label: 'SHIELD BREAKER',
        desc: 'Deplete 3 enemy shields',
        icon: '⚡',
        target: 3,
        trackEvent: 'shield_break'
    },
    {
        id: 'survivor',
        label: 'SURVIVOR',
        desc: 'Never drop below 25% core HP',
        icon: '❤',
        target: 1,
        trackEvent: 'hp_threshold'
    },
    {
        id: 'limb_destroyer',
        label: 'DISMANTLER',
        desc: 'Destroy 6 enemy limbs',
        icon: '✂',
        target: 6,
        trackEvent: 'limb_destroy'
    }
];

/** Roll a random bonus objective. */
function rollBonusObjective() {
    const obj = BONUS_OBJECTIVES[Math.floor(Math.random() * BONUS_OBJECTIVES.length)];
    _campaignState.activeBonusObjective = obj;
    _campaignState.bonusObjectiveProgress = 0;
    _campaignState.bonusObjectiveComplete = false;
    return obj;
}

/** Track progress on the bonus objective.
 *  Called from game events (kills, damage, etc.). */
function trackBonusObjective(eventType, value) {
    const obj = _campaignState.activeBonusObjective;
    if (!obj || _campaignState.bonusObjectiveComplete) return;

    if (obj.trackEvent !== eventType) return;

    // Special handling for negative-condition objectives
    if (obj.id === 'no_damage' && eventType === 'no_core_damage') {
        // This fails on any core damage — tracked externally, value=false means failed
        if (value === false) {
            _campaignState.bonusObjectiveProgress = -1; // failed
        }
        return;
    }
    if (obj.id === 'survivor' && eventType === 'hp_threshold') {
        if (value === false) {
            _campaignState.bonusObjectiveProgress = -1;
        }
        return;
    }
    if (obj.id === 'speed_run' && eventType === 'time_limit') {
        // value = elapsed time in ms
        if (value <= obj.target) {
            _campaignState.bonusObjectiveComplete = true;
        }
        return;
    }

    // Standard increment objectives
    _campaignState.bonusObjectiveProgress += (typeof value === 'number' ? value : 1);
    if (_campaignState.bonusObjectiveProgress >= obj.target) {
        _campaignState.bonusObjectiveComplete = true;
    }
}

/** Check if bonus objective is still achievable (for negative-condition types). */
function isBonusObjectiveFailed() {
    return _campaignState.bonusObjectiveProgress === -1;
}

/** Finalize bonus objective check at mission end. */
function finalizeBonusObjective(elapsedMs) {
    const obj = _campaignState.activeBonusObjective;
    if (!obj || _campaignState.bonusObjectiveComplete) return;

    // Negative-condition objectives succeed if not failed
    if (obj.id === 'no_damage' && _campaignState.bonusObjectiveProgress !== -1) {
        _campaignState.bonusObjectiveComplete = true;
    }
    if (obj.id === 'survivor' && _campaignState.bonusObjectiveProgress !== -1) {
        _campaignState.bonusObjectiveComplete = true;
    }
    // Speed run
    if (obj.id === 'speed_run') {
        trackBonusObjective('time_limit', elapsedMs);
    }
}

// ══════════════════════════════════════════════════════════════════
// VARIABLE ENEMY COMPOSITIONS
// ══════════════════════════════════════════════════════════════════

/** Possible enemy type pools by difficulty tier.
 *  Higher level missions pull from larger pools. */
const ENEMY_COMPOSITION_POOLS = {
    tier1: { normal: 1.0 },  // levels 1-4: only regular enemies
    tier2: { normal: 0.70, scout: 0.15, enforcer: 0.15 },  // levels 5-8
    tier3: { normal: 0.40, scout: 0.15, enforcer: 0.15, technician: 0.15, berserker: 0.15 },  // levels 9-14
    tier4: { normal: 0.25, scout: 0.12, enforcer: 0.13, technician: 0.12, berserker: 0.13, sniperElite: 0.12, droneCarrier: 0.13 }  // levels 15+
};

/** Get the composition tier for a given enemy level. */
function _getCompositionTier(enemyLevel) {
    if (enemyLevel <= 4)  return 'tier1';
    if (enemyLevel <= 8)  return 'tier2';
    if (enemyLevel <= 14) return 'tier3';
    return 'tier4';
}

/** Generate a randomized enemy composition for a mission.
 *  Returns an array of enemy type keys (e.g., ['normal', 'scout', 'normal', 'enforcer']). */
function generateEnemyComposition(enemyLevel, enemyCount) {
    const tier = _getCompositionTier(enemyLevel);
    const pool = ENEMY_COMPOSITION_POOLS[tier];
    const types = Object.keys(pool);
    const weights = Object.values(pool);

    const composition = [];
    for (let i = 0; i < enemyCount; i++) {
        let roll = Math.random();
        let picked = types[0];
        for (let j = 0; j < types.length; j++) {
            roll -= weights[j];
            if (roll <= 0) { picked = types[j]; break; }
        }
        composition.push(picked);
    }
    return composition;
}

// ══════════════════════════════════════════════════════════════════
// CAMPAIGN MISSION ACCESS
// ══════════════════════════════════════════════════════════════════

/** Get the current campaign mission config. */
function getCampaignMission() {
    const ch = CAMPAIGN_CHAPTERS[_campaignState.currentChapter];
    if (!ch) return null;
    return ch.missions[_campaignState.currentMission] || null;
}

/** Get how many missions are completed in a given chapter index. */
function getChapterCompletionCount(chapterIdx) {
    const ch = CAMPAIGN_CHAPTERS[chapterIdx];
    if (!ch) return 0;
    return ch.missions.filter(m => _campaignState.completedMissions[m.id]).length;
}

/** Check if a chapter is unlocked. */
function isChapterUnlocked(chapterIdx) {
    if (chapterIdx === 0) return true;
    // Must complete enough missions in the previous chapter
    const prevCh = CAMPAIGN_CHAPTERS[chapterIdx - 1];
    if (!prevCh) return false;
    const completed = getChapterCompletionCount(chapterIdx - 1);
    return completed >= CAMPAIGN_CHAPTERS[chapterIdx].unlockRequirement;
}

/** Check if a mission is completed. */
function isMissionCompleted(missionId) {
    return !!_campaignState.completedMissions[missionId];
}

/** Mark current mission as completed. */
function completeCampaignMission() {
    const mission = getCampaignMission();
    if (mission) {
        _campaignState.completedMissions[mission.id] = true;
    }
}

/** Get enemy spawn config for current campaign mission.
 *  This adapts mission data to the format startRound() expects. */
function getCampaignEnemyConfig() {
    const mission = getCampaignMission();
    if (!mission) return null;

    const composition = generateEnemyComposition(mission.enemyLevel, mission.enemyCount);
    const mod = _campaignState.activeModifier;

    // Apply modifier effects to count
    let extraEnemies = 0;
    if (mod?.effect === 'extraEnemies') extraEnemies = mod.value;

    // Determine elite chance based on level
    let eliteChance = 0;
    let maxElites = 0;
    if (mission.enemyLevel >= 5) { eliteChance = 0.20; maxElites = 1; }
    if (mission.enemyLevel >= 10) { eliteChance = 0.40; maxElites = 2; }
    if (mission.enemyLevel >= 15) { eliteChance = 0.60; maxElites = 3; }
    if (mission.enemyLevel >= 20) { eliteChance = 0.80; maxElites = 4; }

    // Elite patrol modifier: all enemies elite
    if (mod?.effect === 'allElite') { eliteChance = 1.0; maxElites = 99; }

    return {
        composition,
        totalEnemies: mission.enemyCount + extraEnemies,
        enemyLevel: mission.enemyLevel,
        hasBoss: mission.hasBoss,
        eliteChance,
        maxElites,
        // Modifier effects for spawning
        enemyHpMult: (mod?.effect === 'enemyHpMult') ? mod.value : 1.0,
        enemySpeedMult: (mod?.effect === 'enemySpeedMult') ? mod.value : 1.0,
        enemyVisionMult: (mod?.effect === 'enemyVisionMult') ? mod.value : 1.0,
        scrapMult: (mod?.effect === 'scrapMult') ? mod.value : 1.0
    };
}

// ══════════════════════════════════════════════════════════════════
// DEATH PENALTY
// ══════════════════════════════════════════════════════════════════

/** Apply campaign death penalty: lose 25% of scrap. */
function applyCampaignDeathPenalty() {
    if (typeof _scrap !== 'undefined') {
        const loss = Math.floor(_scrap * 0.25);
        _scrap = Math.max(0, _scrap - loss);
        return loss;
    }
    return 0;
}

// ══════════════════════════════════════════════════════════════════
// CAMPAIGN SAVE / LOAD
// ══════════════════════════════════════════════════════════════════

function saveCampaignState() {
    try {
        const state = {
            playerLevel: _campaignState.playerLevel,
            playerXP: _campaignState.playerXP,
            currentChapter: _campaignState.currentChapter,
            currentMission: _campaignState.currentMission,
            completedMissions: _campaignState.completedMissions
        };
        localStorage.setItem('tw_campaign_state', JSON.stringify(state));
    } catch(e) {}
}

function loadCampaignState() {
    try {
        const raw = localStorage.getItem('tw_campaign_state');
        if (!raw) return false;
        const state = JSON.parse(raw);
        if (state) {
            _campaignState.playerLevel = state.playerLevel || 1;
            _campaignState.playerXP = state.playerXP || 0;
            _campaignState.currentChapter = state.currentChapter || 0;
            _campaignState.currentMission = state.currentMission || 0;
            _campaignState.completedMissions = state.completedMissions || {};
            return true;
        }
    } catch(e) {}
    return false;
}

// ══════════════════════════════════════════════════════════════════
// MISSION SELECT UI
// ══════════════════════════════════════════════════════════════════

// Track which mission is currently selected (null = none selected)
let _selectedMissionIdx = null;

/** Show the mission select overlay. */
function showMissionSelect() {
    let overlay = document.getElementById('mission-select-overlay');
    if (!overlay) return;

    let html = '';

    // ── Header row: centered CAMPAIGN title + small QUIT button on far right ──
    html += '<div style="position:relative;width:100%;max-width:700px;margin-bottom:6px;display:flex;align-items:center;justify-content:center;">';
    html += '<div style="font-size:28px;letter-spacing:6px;color:#ffd700;text-shadow:0 0 20px rgba(255,215,0,0.5);">CAMPAIGN</div>';
    html += `<button onclick="_closeMissionSelect()" style="position:absolute;right:0;padding:5px 12px;background:rgba(255,60,60,0.04);border:1px solid rgba(255,60,60,0.25);color:rgba(255,100,100,0.7);font-size:9px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,60,60,0.12)'" onmouseout="this.style.background='rgba(255,60,60,0.04)'">QUIT</button>`;
    html += '</div>';

    // ── Player level / XP bar + scrap ──
    const xpCur = _campaignState.playerXP - getXPForLevel(_campaignState.playerLevel);
    const xpNeeded = getXPToNextLevel(_campaignState.playerLevel);
    const xpPct = xpNeeded > 0 ? Math.min(1, xpCur / xpNeeded) : 1;
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;width:100%;max-width:700px;">';
    html += `<div style="font-size:11px;letter-spacing:2px;color:rgba(255,215,0,0.7);">LEVEL ${_campaignState.playerLevel}</div>`;
    html += `<div style="flex:1;max-width:300px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">`;
    html += `<div style="width:${xpPct * 100}%;height:100%;background:#ffd700;border-radius:3px;transition:width 0.3s;"></div>`;
    html += `</div>`;
    html += `<div style="font-size:10px;letter-spacing:1px;color:rgba(255,215,0,0.4);">${xpCur} / ${xpNeeded} XP</div>`;
    html += `<div style="font-size:11px;letter-spacing:2px;color:rgba(255,215,0,0.5);margin-left:auto;">SCRAP: <span style="color:#ffd700;font-size:13px;">${typeof _scrap !== 'undefined' ? _scrap : 0}</span></div>`;
    html += '</div>';

    // ── Action buttons: Supply Shop, Upgrades, Loadout, Loadout Slots ──
    html += '<div style="display:flex;gap:10px;margin-bottom:16px;width:100%;max-width:700px;">';
    html += `<button onclick="_openShopFromMission()" style="flex:1;padding:10px 16px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.3);color:rgba(255,215,0,0.8);font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;text-align:center;" onmouseover="this.style.background='rgba(255,215,0,0.14)'" onmouseout="this.style.background='rgba(255,215,0,0.06)'">SUPPLY SHOP</button>`;
    html += `<button onclick="_showUpgradesPanel()" style="flex:1;padding:10px 16px;background:rgba(0,255,136,0.04);border:1px solid rgba(0,255,136,0.3);color:rgba(0,255,136,0.7);font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;text-align:center;" onmouseover="this.style.background='rgba(0,255,136,0.12)'" onmouseout="this.style.background='rgba(0,255,136,0.04)'">UPGRADES</button>`;
    html += `<button onclick="_openLoadoutFromMission()" style="flex:1;padding:10px 16px;background:rgba(0,200,255,0.04);border:1px solid rgba(0,200,255,0.3);color:rgba(0,200,255,0.7);font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;text-align:center;" onmouseover="this.style.background='rgba(0,200,255,0.12)'" onmouseout="this.style.background='rgba(0,200,255,0.04)'">LOADOUT</button>`;
    html += `<button onclick="showLoadoutSlots()" style="flex:1;padding:10px 16px;background:rgba(0,255,255,0.04);border:1px solid rgba(0,255,255,0.3);color:rgba(0,255,255,0.7);font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;text-align:center;" onmouseover="this.style.background='rgba(0,255,255,0.12)'" onmouseout="this.style.background='rgba(0,255,255,0.04)'">LOADOUT SLOTS</button>`;
    html += '</div>';

    // ── Chapter tabs ──
    html += '<div style="display:flex;gap:0;margin-bottom:16px;width:100%;max-width:700px;">';
    CAMPAIGN_CHAPTERS.forEach((ch, idx) => {
        const unlocked = isChapterUnlocked(idx);
        const active = idx === _campaignState.currentChapter;
        const completed = getChapterCompletionCount(idx);
        const total = ch.missions.length;
        const cls = active ? 'background:rgba(255,215,0,0.12);color:#ffd700;border-color:rgba(255,215,0,0.5);' :
                    unlocked ? 'background:rgba(255,255,255,0.04);color:rgba(200,210,217,0.7);border-color:rgba(255,255,255,0.1);' :
                    'background:rgba(0,0,0,0.3);color:rgba(200,210,217,0.25);border-color:rgba(255,255,255,0.05);cursor:not-allowed;';
        html += `<button onclick="${unlocked ? `_selectChapter(${idx})` : ''}" style="flex:1;padding:10px 8px;border:1px solid;font-size:10px;letter-spacing:1px;font-family:'Courier New',monospace;text-transform:uppercase;transition:all 0.2s;outline:none;${cls}${idx===0?'border-radius:6px 0 0 6px;':''}${idx===CAMPAIGN_CHAPTERS.length-1?'border-radius:0 6px 6px 0;':''}">`;
        html += `CH.${idx + 1}`;
        if (unlocked) html += ` <span style="font-size:8px;opacity:0.5;">${completed}/${total}</span>`;
        if (!unlocked) html += ` <span style="font-size:7px;opacity:0.4;">🔒</span>`;
        html += '</button>';
    });
    html += '</div>';

    // ── Current chapter info ──
    const ch = CAMPAIGN_CHAPTERS[_campaignState.currentChapter];
    html += `<div style="font-size:14px;letter-spacing:3px;color:#ffd700;margin-bottom:4px;">${ch.title}</div>`;
    html += `<div style="font-size:11px;letter-spacing:1px;color:rgba(200,210,217,0.5);margin-bottom:16px;">${ch.desc}</div>`;

    // ── Mission list (all missions selectable, including cleared ones) ──
    html += '<div style="display:flex;flex-direction:column;gap:8px;max-width:700px;width:100%;">';
    ch.missions.forEach((m, idx) => {
        const completed = isMissionCompleted(m.id);
        const isSelected = (_selectedMissionIdx === idx);
        const levelDiff = m.enemyLevel - _campaignState.playerLevel;
        const diffColor = levelDiff >= 3 ? '#ff2200' : levelDiff >= 1 ? '#ff8844' : levelDiff === 0 ? '#00ff88' : levelDiff >= -2 ? '#88aacc' : '#666666';
        const diffLabel = levelDiff >= 3 ? 'HARD' : levelDiff >= 1 ? 'TOUGH' : levelDiff === 0 ? 'EVEN' : levelDiff >= -2 ? 'EASY' : 'TRIVIAL';

        // Selected state uses gold highlight
        const bgBase = isSelected ? 'rgba(255,215,0,0.12)' : (completed ? 'rgba(0,255,136,0.04)' : 'rgba(255,255,255,0.03)');
        const bdBase = isSelected ? 'rgba(255,215,0,0.6)' : (completed ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.1)');
        const blBase = isSelected ? '#ffd700' : (completed ? '#00ff88' : 'rgba(255,215,0,0.4)');
        const shadowStyle = isSelected ? 'box-shadow:0 0 12px rgba(255,215,0,0.15),inset 0 0 12px rgba(255,215,0,0.05);' : '';

        html += '<button onclick="_selectMission(' + idx + ')" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:' + bgBase + ';border:1px solid ' + bdBase + ';border-left:3px solid ' + blBase + ';border-radius:4px;font-family:Courier New,monospace;cursor:pointer;transition:all 0.2s;text-align:left;outline:none;width:100%;' + shadowStyle + '">';

        // Mission number
        html += `<div style="font-size:18px;letter-spacing:2px;color:${completed ? '#00ff88' : 'rgba(255,215,0,0.6)'};min-width:30px;text-align:center;">${completed ? '✓' : (idx + 1)}</div>`;

        // Mission info
        html += '<div style="flex:1;">';
        html += `<div style="font-size:12px;letter-spacing:1px;color:${isSelected ? '#ffd700' : (completed ? 'rgba(0,255,136,0.8)' : '#c8d2d9')};margin-bottom:2px;">${m.name}</div>`;
        html += `<div style="font-size:10px;letter-spacing:0.5px;color:rgba(200,210,217,0.4);">${m.briefing}</div>`;
        html += '</div>';

        // Level + difficulty indicator
        html += `<div style="text-align:right;min-width:60px;">`;
        html += `<div style="font-size:11px;letter-spacing:1px;color:${diffColor};">LV.${m.enemyLevel}</div>`;
        html += `<div style="font-size:8px;letter-spacing:1px;color:${diffColor};opacity:0.7;">${diffLabel}</div>`;
        html += '</div>';

        // Boss indicator
        if (m.hasBoss) {
            html += `<div style="font-size:9px;letter-spacing:1px;color:#ff4444;border:1px solid rgba(255,68,68,0.3);padding:2px 6px;border-radius:3px;">BOSS</div>`;
        }

        // First-clear reward badge
        if (!completed && typeof getMissionReward === 'function' && getMissionReward(m.id)) {
            html += `<div style="font-size:8px;letter-spacing:1px;color:#ffd700;border:1px solid rgba(255,215,0,0.3);padding:2px 5px;border-radius:3px;white-space:nowrap;">REWARD</div>`;
        }

        html += '</button>';
    });
    html += '</div>';

    // ── Mission briefing panel — shown inline when a mission is selected ──
    if (_selectedMissionIdx !== null) {
        const selMission = ch.missions[_selectedMissionIdx];
        if (selMission) {
            const levelDiff = selMission.enemyLevel - _campaignState.playerLevel;
            const diffColor = levelDiff >= 3 ? '#ff2200' : levelDiff >= 1 ? '#ff8844' : levelDiff === 0 ? '#00ff88' : levelDiff >= -2 ? '#88aacc' : '#666666';
            html += '<div style="margin-top:16px;padding:14px 18px;background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.15);border-left:3px solid rgba(255,215,0,0.5);border-radius:4px;width:100%;max-width:700px;">';
            html += `<div style="font-size:13px;letter-spacing:3px;color:#ffd700;margin-bottom:4px;">${selMission.name.toUpperCase()}</div>`;
            html += `<div style="font-size:10px;letter-spacing:0.5px;color:rgba(200,210,217,0.5);margin-bottom:8px;">${selMission.briefing}</div>`;
            html += `<div style="font-size:10px;letter-spacing:1px;color:${diffColor};">ENEMY LEVEL ${selMission.enemyLevel} // YOUR LEVEL ${_campaignState.playerLevel}</div>`;
            if (selMission.hasBoss) {
                html += `<div style="font-size:9px;letter-spacing:1px;color:#ff4444;margin-top:4px;">BOSS ENCOUNTER</div>`;
            }
            html += '</div>';
        }

        // ── Deploy button — centered and compact ──
        const mLabel = selMission ? selMission.name.toUpperCase() : 'MISSION';
        html += '<div style="display:flex;justify-content:center;margin-top:16px;width:100%;max-width:700px;">';
        html += `<button onclick="_deployFromMissionSelect()" id="mission-deploy-btn" style="padding:10px 36px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.4);border-top:2px solid rgba(255,215,0,0.7);border-bottom:2px solid rgba(255,215,0,0.7);color:#ffd700;font-size:11px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,215,0,0.15)'" onmouseout="this.style.background='rgba(255,215,0,0.08)'">DEPLOY — ${mLabel}</button>`;
        html += '</div>';
    }

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
}

/** Open shop from mission select. */
function _openShopFromMission() {
    const overlay = document.getElementById('mission-select-overlay');
    if (overlay) overlay.style.display = 'none';
    showShop();
}

/** Open the loadout (stats/gear) overlay from mission select. */
function _openLoadoutFromMission() {
    const overlay = document.getElementById('mission-select-overlay');
    if (overlay) overlay.style.display = 'none';
    // Mark that we came from mission select so we can return there on close
    window._loadoutOpenedFromMission = true;
    // Open the loadout overlay directly (set _isStats so toggleStats close path works)
    if (typeof _isStats !== 'undefined') _isStats = true;
    const statsOv = document.getElementById('stats-overlay');
    if (statsOv) statsOv.style.display = 'flex';
    if (typeof populateStats === 'function') populateStats();
    if (typeof populateInventory === 'function') populateInventory();
    if (typeof _updateInvCount === 'function') _updateInvCount();
    if (typeof _switchLoadoutTab === 'function') _switchLoadoutTab('stats');
}

/** Select a chapter tab. */
function _selectChapter(idx) {
    if (!isChapterUnlocked(idx)) return;
    _campaignState.currentChapter = idx;
    _selectedMissionIdx = null; // Reset selection when switching chapters
    showMissionSelect();
}

/** Select a mission within the current chapter. */
function _selectMission(idx) {
    _campaignState.currentMission = idx;
    _selectedMissionIdx = idx;
    showMissionSelect();
}

/** Deploy from mission select — skip hangar, go straight to game. */
function _deployFromMissionSelect() {
    const mission = getCampaignMission();
    if (!mission) return;

    // Roll modifier and bonus objective
    rollMissionModifier();
    rollBonusObjective();

    // Save state
    saveCampaignState();

    // Hide mission select
    const overlay = document.getElementById('mission-select-overlay');
    if (overlay) overlay.style.display = 'none';

    // Skip the hangar entirely — deploy the mech directly
    if (typeof deployMech === 'function') {
        deployMech();
    }
}

/** Show a brief mission briefing before deploy. */
function _showMissionBriefing(mission) {
    const mod = _campaignState.activeModifier;
    const bonus = _campaignState.activeBonusObjective;

    let briefEl = document.getElementById('mission-briefing-popup');
    if (!briefEl) return;

    let html = '';
    html += `<div style="font-size:18px;letter-spacing:4px;color:#ffd700;text-shadow:0 0 12px rgba(255,215,0,0.5);margin-bottom:4px;">${mission.name.toUpperCase()}</div>`;
    html += `<div style="font-size:11px;letter-spacing:1px;color:rgba(200,210,217,0.6);margin-bottom:16px;">${mission.briefing}</div>`;

    // Modifier
    if (mod && mod.id !== 'no_modifier') {
        html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">`;
        html += `<span style="font-size:13px;">${mod.icon}</span>`;
        html += `<span style="font-size:11px;letter-spacing:2px;color:#ff8844;">${mod.label}</span>`;
        html += `<span style="font-size:10px;color:rgba(200,210,217,0.45);">— ${mod.desc}</span>`;
        html += '</div>';
    }

    // Bonus objective
    if (bonus) {
        html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">`;
        html += `<span style="font-size:13px;">${bonus.icon}</span>`;
        html += `<span style="font-size:11px;letter-spacing:2px;color:#00ccff;">BONUS: ${bonus.label}</span>`;
        html += `<span style="font-size:10px;color:rgba(200,210,217,0.45);">— ${bonus.desc}</span>`;
        html += '</div>';
    }

    // Enemy level info
    const levelDiff = mission.enemyLevel - _campaignState.playerLevel;
    const diffColor = levelDiff >= 3 ? '#ff2200' : levelDiff >= 1 ? '#ff8844' : levelDiff === 0 ? '#00ff88' : '#88aacc';
    html += `<div style="font-size:10px;letter-spacing:1px;color:${diffColor};margin-top:8px;">ENEMY LEVEL ${mission.enemyLevel} // YOUR LEVEL ${_campaignState.playerLevel}</div>`;

    briefEl.innerHTML = html;
    briefEl.style.display = 'flex';

    // Auto-hide after 4 seconds
    setTimeout(() => {
        if (briefEl) briefEl.style.display = 'none';
    }, 4000);
}

/** Close mission select and return to main menu. Saves progress first. */
function _closeMissionSelect() {
    // Save current campaign data before quitting
    if (typeof saveCampaignProgress === 'function') saveCampaignProgress();
    if (typeof saveCampaignState === 'function') saveCampaignState();

    const overlay = document.getElementById('mission-select-overlay');
    if (overlay) overlay.style.display = 'none';

    // Return to main menu
    const menu = document.getElementById('main-menu');
    if (menu) {
        menu.style.display = 'flex';
        menu.style.opacity = '1';
    }
}

// ══════════════════════════════════════════════════════════════════
// ██████████████████████████████████████████████████████████████████
//  PHASE 4 — CAMPAIGN-SPECIFIC RPG FEATURES
// ██████████████████████████████████████████████████████████████████
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
// 4A — CHASSIS UPGRADES (unlocked by pilot level)
// ══════════════════════════════════════════════════════════════════

/** Chassis upgrade definitions.
 *  Each entry grants a stat bonus at a specific pilot level.
 *  'chassis' = which chassis it applies to ('all' = universal). */
const CHASSIS_UPGRADES = [
    // ── Level 2-5: Early universals ──
    { level: 2,  chassis: 'all',    stat: 'coreHP',  value: 10,  label: '+10 Core HP' },
    { level: 3,  chassis: 'all',    stat: 'armHP',   value: 5,   label: '+5 Arm HP' },
    { level: 4,  chassis: 'all',    stat: 'legHP',   value: 5,   label: '+5 Leg HP' },
    { level: 5,  chassis: 'all',    stat: 'spd',     value: 5,   label: '+5 Speed' },

    // ── Level 6-10: Chassis-specific ──
    { level: 6,  chassis: 'light',  stat: 'spd',     value: 10,  label: '+10 Speed' },
    { level: 6,  chassis: 'medium', stat: 'coreHP',  value: 15,  label: '+15 Core HP' },
    { level: 6,  chassis: 'heavy',  stat: 'coreHP',  value: 25,  label: '+25 Core HP' },
    { level: 8,  chassis: 'light',  stat: 'coreHP',  value: 10,  label: '+10 Core HP' },
    { level: 8,  chassis: 'medium', stat: 'armHP',   value: 10,  label: '+10 Arm HP' },
    { level: 8,  chassis: 'heavy',  stat: 'armHP',   value: 15,  label: '+15 Arm HP' },
    { level: 10, chassis: 'light',  stat: 'armHP',   value: 8,   label: '+8 Arm HP' },
    { level: 10, chassis: 'medium', stat: 'legHP',   value: 10,  label: '+10 Leg HP' },
    { level: 10, chassis: 'heavy',  stat: 'legHP',   value: 15,  label: '+15 Leg HP' },

    // ── Level 12-16: Mid-game universals ──
    { level: 12, chassis: 'all',    stat: 'coreHP',  value: 15,  label: '+15 Core HP' },
    { level: 14, chassis: 'all',    stat: 'spd',     value: 5,   label: '+5 Speed' },
    { level: 16, chassis: 'all',    stat: 'armHP',   value: 8,   label: '+8 Arm HP' },
    { level: 16, chassis: 'all',    stat: 'legHP',   value: 8,   label: '+8 Leg HP' },

    // ── Level 18-22: Late chassis-specific ──
    { level: 18, chassis: 'light',  stat: 'spd',     value: 12,  label: '+12 Speed' },
    { level: 18, chassis: 'medium', stat: 'coreHP',  value: 20,  label: '+20 Core HP' },
    { level: 18, chassis: 'heavy',  stat: 'coreHP',  value: 30,  label: '+30 Core HP' },
    { level: 20, chassis: 'light',  stat: 'coreHP',  value: 15,  label: '+15 Core HP' },
    { level: 20, chassis: 'medium', stat: 'armHP',   value: 12,  label: '+12 Arm HP' },
    { level: 20, chassis: 'heavy',  stat: 'armHP',   value: 20,  label: '+20 Arm HP' },
    { level: 22, chassis: 'all',    stat: 'coreHP',  value: 20,  label: '+20 Core HP' },
    { level: 22, chassis: 'all',    stat: 'legHP',   value: 10,  label: '+10 Leg HP' },
];

/** Get all chassis upgrades unlocked at or below the given level. */
function getChassisUpgrades(level, chassisType) {
    return CHASSIS_UPGRADES.filter(u =>
        u.level <= level && (u.chassis === 'all' || u.chassis === chassisType)
    );
}

/** Compute total stat bonuses from chassis upgrades for current level.
 *  Returns { coreHP, armHP, legHP, spd } bonus values. */
function getChassisUpgradeBonuses(level, chassisType) {
    const bonuses = { coreHP: 0, armHP: 0, legHP: 0, spd: 0 };
    const upgrades = getChassisUpgrades(level, chassisType);
    for (const u of upgrades) {
        bonuses[u.stat] = (bonuses[u.stat] || 0) + u.value;
    }
    return bonuses;
}

/** Store base chassis values so we can re-apply upgrades cleanly. */
let _chassisBaseValues = null;

function _snapshotChassisBase() {
    if (_chassisBaseValues) return; // already captured
    if (typeof CHASSIS === 'undefined') return;
    _chassisBaseValues = {};
    for (const key of Object.keys(CHASSIS)) {
        _chassisBaseValues[key] = {
            coreHP: CHASSIS[key].coreHP,
            armHP: CHASSIS[key].armHP,
            legHP: CHASSIS[key].legHP,
            spd: CHASSIS[key].spd
        };
    }
}

/** Apply level-based chassis upgrades to the CHASSIS object.
 *  Should be called after loading campaign state and before deploy. */
function applyChassisUpgrades() {
    if (typeof CHASSIS === 'undefined') return;
    _snapshotChassisBase();

    for (const key of Object.keys(CHASSIS)) {
        // Restore base values first
        if (_chassisBaseValues?.[key]) {
            CHASSIS[key].coreHP = _chassisBaseValues[key].coreHP;
            CHASSIS[key].armHP  = _chassisBaseValues[key].armHP;
            CHASSIS[key].legHP  = _chassisBaseValues[key].legHP;
            CHASSIS[key].spd    = _chassisBaseValues[key].spd;
        }
        // Apply upgrades for this chassis at current pilot level
        const bonuses = getChassisUpgradeBonuses(_campaignState.playerLevel, key);
        CHASSIS[key].coreHP += bonuses.coreHP;
        CHASSIS[key].armHP  += bonuses.armHP;
        CHASSIS[key].legHP  += bonuses.legHP;
        CHASSIS[key].spd    += bonuses.spd;
    }
}

// ══════════════════════════════════════════════════════════════════
// 4B — MISSION REWARDS (first-clear guaranteed loot)
// ══════════════════════════════════════════════════════════════════

/** Guaranteed reward for first-time mission completion.
 *  scrap = flat scrap bonus, itemRarity = guaranteed loot drop rarity,
 *  itemLevel = item level for generation. */
const MISSION_REWARDS = {
    // Chapter 1
    ch1_m1: { scrap: 5,   itemRarity: 'common',    itemLevel: 1 },
    ch1_m2: { scrap: 8,   itemRarity: 'common',    itemLevel: 2 },
    ch1_m3: { scrap: 10,  itemRarity: 'uncommon',  itemLevel: 3 },
    ch1_m4: { scrap: 12,  itemRarity: 'uncommon',  itemLevel: 4 },
    ch1_m5: { scrap: 25,  itemRarity: 'rare',      itemLevel: 5 },
    // Chapter 2
    ch2_m1: { scrap: 12,  itemRarity: 'uncommon',  itemLevel: 5 },
    ch2_m2: { scrap: 14,  itemRarity: 'uncommon',  itemLevel: 6 },
    ch2_m3: { scrap: 16,  itemRarity: 'rare',      itemLevel: 7 },
    ch2_m4: { scrap: 18,  itemRarity: 'rare',      itemLevel: 8 },
    ch2_m5: { scrap: 40,  itemRarity: 'epic',      itemLevel: 10 },
    // Chapter 3
    ch3_m1: { scrap: 16,  itemRarity: 'rare',      itemLevel: 9 },
    ch3_m2: { scrap: 18,  itemRarity: 'rare',      itemLevel: 10 },
    ch3_m3: { scrap: 22,  itemRarity: 'rare',      itemLevel: 11 },
    ch3_m4: { scrap: 25,  itemRarity: 'epic',      itemLevel: 12 },
    ch3_m5: { scrap: 50,  itemRarity: 'epic',      itemLevel: 14 },
    // Chapter 4
    ch4_m1: { scrap: 22,  itemRarity: 'rare',      itemLevel: 13 },
    ch4_m2: { scrap: 25,  itemRarity: 'epic',      itemLevel: 14 },
    ch4_m3: { scrap: 28,  itemRarity: 'epic',      itemLevel: 15 },
    ch4_m4: { scrap: 30,  itemRarity: 'epic',      itemLevel: 16 },
    ch4_m5: { scrap: 60,  itemRarity: 'legendary', itemLevel: 18 },
    // Chapter 5
    ch5_m1: { scrap: 28,  itemRarity: 'epic',      itemLevel: 17 },
    ch5_m2: { scrap: 30,  itemRarity: 'epic',      itemLevel: 18 },
    ch5_m3: { scrap: 35,  itemRarity: 'epic',      itemLevel: 19 },
    ch5_m4: { scrap: 40,  itemRarity: 'legendary', itemLevel: 20 },
    ch5_m5: { scrap: 100, itemRarity: 'legendary', itemLevel: 22 },
};

/** Get the first-clear reward for a mission. Returns null if already claimed. */
function getMissionReward(missionId) {
    if (!MISSION_REWARDS[missionId]) return null;
    // Check if already claimed
    if (_campaignState.claimedRewards?.[missionId]) return null;
    return MISSION_REWARDS[missionId];
}

/** Generate and award the first-clear reward item.
 *  Returns { scrap, item } or null. */
function awardMissionReward(missionId) {
    const reward = getMissionReward(missionId);
    if (!reward) return null;

    // Mark as claimed
    if (!_campaignState.claimedRewards) _campaignState.claimedRewards = {};
    _campaignState.claimedRewards[missionId] = true;

    // Award scrap
    if (typeof _scrap !== 'undefined') _scrap += reward.scrap;

    // Generate a guaranteed item at the reward rarity
    let item = null;
    if (typeof generateItem === 'function') {
        // Try up to 5 times to get the target rarity
        for (let i = 0; i < 5; i++) {
            item = generateItem(reward.itemLevel, {});
            if (item) {
                // Force the reward rarity
                item.rarity = reward.itemRarity;
                // Re-apply rarity stat multiplier
                if (typeof RARITY_DEFS !== 'undefined' && item.baseStats) {
                    const rd = RARITY_DEFS[reward.itemRarity];
                    const levelMult = 1 + (reward.itemLevel - 1) * 0.03;
                    for (const [k, v] of Object.entries(item.baseStats)) {
                        if (typeof v === 'number') {
                            item.computedStats[k] = Math.round(v * levelMult * rd.statMult);
                        }
                    }
                    // Re-roll affixes for new rarity
                    if (typeof rollAffixes === 'function') {
                        const _affixTypeMap = { shield_system:'shield', mod_system:'mod', leg_system:'legs', aug_system:'augment' };
                        const affixType = _affixTypeMap[item.baseType] || item.baseType;
                        item.affixes = rollAffixes(affixType, item.subType, reward.itemRarity);
                        // Re-merge computed stats
                        for (const af of item.affixes) {
                            if (af.stat && typeof af.value === 'number') {
                                item.computedStats[af.stat] = (item.computedStats[af.stat] || 0) + af.value;
                            }
                        }
                    }
                    item.name = rd.label + ' ' + (item.shortName || item.name);
                }
                break;
            }
        }
        // Add to inventory if there's room
        if (item && typeof _inventory !== 'undefined' && _inventory.length < (typeof INVENTORY_MAX !== 'undefined' ? INVENTORY_MAX : 30)) {
            _inventory.push(item);
        }
    }

    return { scrap: reward.scrap, item };
}

// ══════════════════════════════════════════════════════════════════
// 4C — HANGAR SHOP (buy/sell gear with scrap)
// ══════════════════════════════════════════════════════════════════

/** Shop stock — refreshed each time player returns to mission select. */
let _shopStock = [];
const SHOP_MAX_ITEMS = 8;

/** Base prices by rarity (buy price). Sell = scrapValue from RARITY_DEFS. */
const SHOP_PRICES = {
    common:    5,
    uncommon:  15,
    rare:      40,
    epic:      100,
    legendary: 250
};

/** Refresh shop stock with random items at the player's level. */
function refreshShopStock() {
    _shopStock = [];
    if (typeof generateItem !== 'function') return;

    const level = _campaignState.playerLevel || 1;
    // Stock scales: lower levels = more commons, higher = rarer items possible
    for (let i = 0; i < SHOP_MAX_ITEMS; i++) {
        const item = generateItem(Math.max(1, level + Math.floor(Math.random() * 3) - 1), {});
        if (!item) continue;
        // Shop items cost based on rarity + level scaling
        const basePrice = SHOP_PRICES[item.rarity] || 10;
        const levelScale = 1 + (item.level - 1) * 0.05;
        item._shopPrice = Math.round(basePrice * levelScale);
        _shopStock.push(item);
    }
}

/** Get sell price for an item (same as scrap value). */
function getItemSellPrice(item) {
    if (!item) return 0;
    if (typeof RARITY_DEFS !== 'undefined' && RARITY_DEFS[item.rarity]) {
        return RARITY_DEFS[item.rarity].scrapValue;
    }
    return 1;
}

/** Buy an item from the shop. Returns true if successful. */
function shopBuyItem(shopIdx) {
    if (shopIdx < 0 || shopIdx >= _shopStock.length) return false;
    const item = _shopStock[shopIdx];
    if (!item) return false;
    if (typeof _scrap === 'undefined' || _scrap < item._shopPrice) return false;
    if (typeof _inventory !== 'undefined' && _inventory.length >= (typeof INVENTORY_MAX !== 'undefined' ? INVENTORY_MAX : 30)) return false;

    _scrap -= item._shopPrice;
    const bought = { ...item };
    delete bought._shopPrice;
    _inventory.push(bought);
    _shopStock.splice(shopIdx, 1);
    if (typeof saveInventory === 'function') saveInventory();
    return true;
}

/** Sell an item from inventory. Returns scrap gained. */
function shopSellItem(invIdx) {
    if (typeof _inventory === 'undefined' || invIdx < 0 || invIdx >= _inventory.length) return 0;
    const item = _inventory[invIdx];
    const price = getItemSellPrice(item);
    _scrap += price;
    _inventory.splice(invIdx, 1);
    if (typeof saveInventory === 'function') saveInventory();
    return price;
}

/** Show the campaign shop UI overlay. */
function showShop() {
    let overlay = document.getElementById('shop-overlay');
    if (!overlay) return;

    // Refresh stock if empty
    if (_shopStock.length === 0) refreshShopStock();

    const rarityColors = {
        common: '#c0c8d0', uncommon: '#00ff44', rare: '#4488ff',
        epic: '#aa44ff', legendary: '#ffd700'
    };

    let html = '';
    html += '<div style="font-size:28px;letter-spacing:6px;color:#ffd700;text-shadow:0 0 20px rgba(255,215,0,0.5);margin-bottom:4px;">SUPPLY SHOP</div>';
    html += `<div style="font-size:12px;letter-spacing:2px;color:rgba(255,215,0,0.6);margin-bottom:20px;">SCRAP: <span style="color:#ffd700;">${_scrap}</span></div>`;

    // ── BUY SECTION ──
    html += '<div style="font-size:13px;letter-spacing:3px;color:rgba(0,255,255,0.7);margin-bottom:10px;">BUY</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;max-width:700px;">';
    if (_shopStock.length === 0) {
        html += '<div style="font-size:11px;color:rgba(200,210,217,0.4);letter-spacing:1px;">No items in stock. Complete a mission to restock.</div>';
    }
    _shopStock.forEach((item, idx) => {
        const rc = rarityColors[item.rarity] || '#c0c8d0';
        const canBuy = _scrap >= item._shopPrice && _inventory.length < (typeof INVENTORY_MAX !== 'undefined' ? INVENTORY_MAX : 30);
        const opacity = canBuy ? '1' : '0.4';
        html += `<button onclick="${canBuy ? `_shopBuy(${idx})` : ''}" style="width:155px;padding:10px;background:rgba(255,255,255,0.03);border:1px solid ${rc}40;border-left:3px solid ${rc};border-radius:4px;font-family:'Courier New',monospace;cursor:${canBuy?'pointer':'not-allowed'};opacity:${opacity};text-align:left;transition:all 0.2s;" ${canBuy ? `onmouseover="this.style.background='rgba(255,215,0,0.06)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'"` : ''}>`;
        html += `<div style="font-size:10px;letter-spacing:1px;color:${rc};margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name || 'Item'}</div>`;
        html += `<div style="font-size:9px;color:rgba(200,210,217,0.5);margin-bottom:4px;">${(item.rarity||'').toUpperCase()} LV.${item.level||1}</div>`;
        // Show key stats
        if (item.computedStats) {
            const statKeys = Object.keys(item.computedStats).slice(0, 2);
            const statStr = statKeys.map(k => `${k}:${item.computedStats[k]}`).join(' ');
            html += `<div style="font-size:8px;color:rgba(200,210,217,0.35);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${statStr}</div>`;
        }
        html += `<div style="font-size:11px;letter-spacing:1px;color:#ffd700;">⬡ ${item._shopPrice}</div>`;
        html += '</button>';
    });
    html += '</div>';

    // ── SELL SECTION ──
    html += '<div style="font-size:13px;letter-spacing:3px;color:rgba(255,100,100,0.7);margin-bottom:10px;">SELL</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:24px;max-width:700px;max-height:200px;overflow-y:auto;">';
    if (typeof _inventory !== 'undefined' && _inventory.length > 0) {
        _inventory.forEach((item, idx) => {
            const rc = rarityColors[item.rarity] || '#c0c8d0';
            const sellPrice = getItemSellPrice(item);
            html += `<button onclick="_shopSell(${idx})" style="width:145px;padding:8px;background:rgba(255,255,255,0.03);border:1px solid ${rc}30;border-left:2px solid ${rc};border-radius:4px;font-family:'Courier New',monospace;cursor:pointer;text-align:left;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,60,60,0.06)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">`;
            html += `<div style="font-size:9px;letter-spacing:1px;color:${rc};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name || 'Item'}</div>`;
            html += `<div style="font-size:10px;color:#ff8844;">⬡ ${sellPrice}</div>`;
            html += '</button>';
        });
    } else {
        html += '<div style="font-size:11px;color:rgba(200,210,217,0.4);letter-spacing:1px;">No items in inventory to sell.</div>';
    }
    html += '</div>';

    // ── RESTOCK BUTTON ──
    const restockCost = Math.max(10, Math.round(_campaignState.playerLevel * 5));
    const canRestock = _scrap >= restockCost;
    html += '<div style="display:flex;gap:16px;margin-top:8px;">';
    html += `<button onclick="${canRestock ? '_shopRestock()' : ''}" style="padding:10px 24px;background:rgba(0,255,255,0.04);border:1px solid rgba(0,255,255,${canRestock?'0.4':'0.15'});color:${canRestock?'rgba(0,255,255,0.85)':'rgba(0,255,255,0.3)'};font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:${canRestock?'pointer':'not-allowed'};transition:all 0.2s;" ${canRestock?`onmouseover="this.style.background='rgba(0,255,255,0.1)'" onmouseout="this.style.background='rgba(0,255,255,0.04)'"`:''}>RESTOCK ⬡ ${restockCost}</button>`;
    html += `<button onclick="_closeShop()" style="padding:10px 32px;background:rgba(255,60,60,0.04);border:1px solid rgba(255,60,60,0.3);color:rgba(255,100,100,0.85);font-size:11px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,60,60,0.12)'" onmouseout="this.style.background='rgba(255,60,60,0.04)'">BACK</button>`;
    html += '</div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
}

function _shopBuy(idx) {
    if (shopBuyItem(idx)) {
        showShop(); // re-render
    }
}

function _shopSell(idx) {
    shopSellItem(idx);
    showShop(); // re-render
}

function _shopRestock() {
    const cost = Math.max(10, Math.round(_campaignState.playerLevel * 5));
    if (typeof _scrap === 'undefined' || _scrap < cost) return;
    _scrap -= cost;
    refreshShopStock();
    showShop();
}

function _closeShop() {
    const overlay = document.getElementById('shop-overlay');
    if (overlay) overlay.style.display = 'none';
    // Return to mission select
    if (typeof showMissionSelect === 'function') showMissionSelect();
}

// ══════════════════════════════════════════════════════════════════
// 4D — LOADOUT SLOTS (save/swap multiple loadout configurations)
// ══════════════════════════════════════════════════════════════════

const MAX_LOADOUT_SLOTS = 5;

/** Get saved loadout slots from campaign state. */
function _getLoadoutSlots() {
    if (!_campaignState.loadoutSlots) _campaignState.loadoutSlots = [];
    return _campaignState.loadoutSlots;
}

/** Save the current loadout to a named slot. */
function saveLoadoutSlot(slotIdx, name) {
    if (typeof loadout === 'undefined') return false;
    const slots = _getLoadoutSlots();
    if (slotIdx < 0 || slotIdx >= MAX_LOADOUT_SLOTS) return false;

    slots[slotIdx] = {
        name: name || ('SLOT ' + (slotIdx + 1)),
        chassis: loadout.chassis,
        L: loadout.L,
        R: loadout.R,
        mod: loadout.mod,
        aug: loadout.aug,
        leg: loadout.leg,
        shld: loadout.shld,
        color: loadout.color
    };
    saveCampaignState();
    return true;
}

/** Load a saved loadout from a slot. */
function loadLoadoutSlot(slotIdx) {
    const slots = _getLoadoutSlots();
    if (slotIdx < 0 || slotIdx >= slots.length || !slots[slotIdx]) return false;

    const slot = slots[slotIdx];
    loadout.chassis = slot.chassis || 'light';
    loadout.L       = slot.L       || 'smg';
    loadout.R       = slot.R       || 'none';
    loadout.mod     = slot.mod     || 'none';
    loadout.aug     = slot.aug     || 'none';
    loadout.leg     = slot.leg     || 'none';
    loadout.shld    = slot.shld    || 'light_shield';
    loadout.color   = slot.color   || 0x00ff00;

    // Refresh garage UI if available
    if (typeof refreshGarage === 'function') refreshGarage();
    return true;
}

/** Delete a saved loadout slot. */
function deleteLoadoutSlot(slotIdx) {
    const slots = _getLoadoutSlots();
    if (slotIdx < 0 || slotIdx >= slots.length) return;
    slots[slotIdx] = null;
    saveCampaignState();
}

/** Show the loadout slots UI overlay. */
function showLoadoutSlots() {
    let overlay = document.getElementById('loadout-slots-overlay');
    if (!overlay) return;

    const slots = _getLoadoutSlots();
    const chassisColors = { light: '#88ff88', medium: '#ffcc44', heavy: '#ff8844' };

    let html = '';
    html += '<div style="font-size:24px;letter-spacing:6px;color:#00ffff;text-shadow:0 0 16px rgba(0,255,255,0.5);margin-bottom:20px;">LOADOUT SLOTS</div>';

    // Current loadout preview
    html += '<div style="margin-bottom:20px;padding:12px 16px;background:rgba(0,255,255,0.04);border:1px solid rgba(0,255,255,0.2);border-radius:6px;max-width:500px;">';
    html += '<div style="font-size:10px;letter-spacing:2px;color:rgba(0,255,255,0.6);margin-bottom:6px;">CURRENT LOADOUT</div>';
    const chc = chassisColors[loadout.chassis] || '#c8d2d9';
    html += `<div style="font-size:12px;color:${chc};letter-spacing:1px;">${(loadout.chassis||'').toUpperCase()} // L:${(loadout.L||'none').toUpperCase()} R:${(loadout.R||'none').toUpperCase()} MOD:${(loadout.mod||'none').toUpperCase()} SHLD:${(loadout.shld||'none').toUpperCase()}</div>`;
    html += '</div>';

    // Slot list
    html += '<div style="display:flex;flex-direction:column;gap:8px;max-width:500px;width:100%;">';
    for (let i = 0; i < MAX_LOADOUT_SLOTS; i++) {
        const slot = slots[i];
        if (slot) {
            const sc = chassisColors[slot.chassis] || '#c8d2d9';
            html += `<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(0,255,255,0.15);border-left:3px solid ${sc};border-radius:4px;">`;
            html += `<div style="flex:1;">`;
            html += `<div style="font-size:11px;letter-spacing:2px;color:#c8d2d9;margin-bottom:2px;">${slot.name}</div>`;
            html += `<div style="font-size:9px;color:rgba(200,210,217,0.4);">${(slot.chassis||'').toUpperCase()} // L:${(slot.L||'none').toUpperCase()} R:${(slot.R||'none').toUpperCase()}</div>`;
            html += '</div>';
            html += `<button onclick="_loadSlot(${i})" style="padding:6px 14px;background:rgba(0,255,255,0.06);border:1px solid rgba(0,255,255,0.3);color:rgba(0,255,255,0.8);font-size:10px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;border-radius:3px;transition:all 0.2s;" onmouseover="this.style.background='rgba(0,255,255,0.15)'" onmouseout="this.style.background='rgba(0,255,255,0.06)'">LOAD</button>`;
            html += `<button onclick="_deleteSlot(${i})" style="padding:6px 10px;background:rgba(255,60,60,0.04);border:1px solid rgba(255,60,60,0.2);color:rgba(255,100,100,0.6);font-size:10px;letter-spacing:1px;font-family:'Courier New',monospace;cursor:pointer;border-radius:3px;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,60,60,0.12)'" onmouseout="this.style.background='rgba(255,60,60,0.04)'">✕</button>`;
            html += '</div>';
        } else {
            html += `<button onclick="_saveSlot(${i})" style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.1);border-radius:4px;font-family:'Courier New',monospace;cursor:pointer;transition:all 0.2s;text-align:left;width:100%;" onmouseover="this.style.background='rgba(0,255,255,0.04)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'">`;
            html += `<div style="font-size:11px;letter-spacing:2px;color:rgba(200,210,217,0.3);">SLOT ${i+1} — EMPTY</div>`;
            html += `<div style="margin-left:auto;font-size:10px;letter-spacing:2px;color:rgba(0,255,255,0.4);">SAVE</div>`;
            html += '</button>';
        }
    }
    html += '</div>';

    // Close button
    html += '<div style="margin-top:20px;">';
    html += `<button onclick="_closeLoadoutSlots()" style="padding:12px 32px;background:rgba(255,60,60,0.04);border:1px solid rgba(255,60,60,0.3);color:rgba(255,100,100,0.85);font-size:12px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,60,60,0.12)'" onmouseout="this.style.background='rgba(255,60,60,0.04)'">BACK</button>`;
    html += '</div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
}

function _saveSlot(idx) {
    const name = 'SLOT ' + (idx + 1) + ' — ' + (loadout.chassis || 'MECH').toUpperCase();
    saveLoadoutSlot(idx, name);
    showLoadoutSlots();
}

function _loadSlot(idx) {
    loadLoadoutSlot(idx);
    showLoadoutSlots();
}

function _deleteSlot(idx) {
    deleteLoadoutSlot(idx);
    showLoadoutSlots();
}

function _closeLoadoutSlots() {
    const overlay = document.getElementById('loadout-slots-overlay');
    if (overlay) overlay.style.display = 'none';
}

// ══════════════════════════════════════════════════════════════════
// 4E — UPDATED SAVE/LOAD (include Phase 4 state)
// ══════════════════════════════════════════════════════════════════

// Override saveCampaignState to include Phase 4 data
const _phase3_saveCampaignState = saveCampaignState;
saveCampaignState = function() {
    try {
        const state = {
            playerLevel: _campaignState.playerLevel,
            playerXP: _campaignState.playerXP,
            currentChapter: _campaignState.currentChapter,
            currentMission: _campaignState.currentMission,
            completedMissions: _campaignState.completedMissions,
            chassis: _campaignState.chassis || null,
            // Phase 4 additions
            claimedRewards: _campaignState.claimedRewards || {},
            loadoutSlots: _campaignState.loadoutSlots || []
        };
        localStorage.setItem('tw_campaign_state', JSON.stringify(state));
    } catch(e) {}
};

// Override loadCampaignState to restore Phase 4 data
const _phase3_loadCampaignState = loadCampaignState;
loadCampaignState = function() {
    try {
        const raw = localStorage.getItem('tw_campaign_state');
        if (!raw) return false;
        const state = JSON.parse(raw);
        if (state) {
            _campaignState.playerLevel = state.playerLevel || 1;
            _campaignState.playerXP = state.playerXP || 0;
            _campaignState.currentChapter = state.currentChapter || 0;
            _campaignState.currentMission = state.currentMission || 0;
            _campaignState.completedMissions = state.completedMissions || {};
            _campaignState.chassis = state.chassis || null;
            // Phase 4 additions
            _campaignState.claimedRewards = state.claimedRewards || {};
            _campaignState.loadoutSlots = state.loadoutSlots || [];
            return true;
        }
    } catch(e) {}
    return false;
};

// Phase 4F: showMissionSelect now includes shop/loadout/upgrades buttons inline.

/** Show chassis upgrades panel. */
function _showUpgradesPanel() {
    let overlay = document.getElementById('upgrades-overlay');
    if (!overlay) return;

    const level = _campaignState.playerLevel;
    const chassisTypes = ['light', 'medium', 'heavy'];
    const chassisColors = { light: '#88ff88', medium: '#ffcc44', heavy: '#ff8844' };

    let html = '';
    html += '<div style="font-size:24px;letter-spacing:6px;color:#00ff88;text-shadow:0 0 16px rgba(0,255,136,0.5);margin-bottom:6px;">CHASSIS UPGRADES</div>';
    html += `<div style="font-size:11px;letter-spacing:2px;color:rgba(0,255,136,0.5);margin-bottom:24px;">PILOT LEVEL ${level} — Upgrades unlock automatically as you level up</div>`;

    for (const ch of chassisTypes) {
        const cc = chassisColors[ch];
        html += `<div style="margin-bottom:20px;">`;
        html += `<div style="font-size:14px;letter-spacing:3px;color:${cc};margin-bottom:8px;">${ch.toUpperCase()}</div>`;

        const allForChassis = CHASSIS_UPGRADES.filter(u => u.chassis === 'all' || u.chassis === ch);
        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        for (const u of allForChassis) {
            const unlocked = u.level <= level;
            const borderColor = unlocked ? cc : 'rgba(255,255,255,0.08)';
            const textColor = unlocked ? cc : 'rgba(200,210,217,0.25)';
            const bg = unlocked ? `${cc}10` : 'rgba(0,0,0,0.2)';
            html += `<div style="padding:6px 10px;background:${bg};border:1px solid ${borderColor};border-radius:4px;min-width:100px;">`;
            html += `<div style="font-size:9px;letter-spacing:1px;color:${textColor};margin-bottom:2px;">${unlocked ? '✓' : '🔒'} LV.${u.level}</div>`;
            html += `<div style="font-size:10px;color:${unlocked ? '#c8d2d9' : 'rgba(200,210,217,0.2)'};letter-spacing:1px;">${u.label}</div>`;
            if (u.chassis !== 'all') {
                html += `<div style="font-size:8px;color:${textColor};opacity:0.6;">${u.chassis.toUpperCase()} ONLY</div>`;
            }
            html += '</div>';
        }
        html += '</div></div>';
    }

    // Next unlock preview
    const nextUpgrade = CHASSIS_UPGRADES.find(u => u.level > level);
    if (nextUpgrade) {
        html += `<div style="margin-top:8px;font-size:10px;letter-spacing:1px;color:rgba(0,255,136,0.4);">NEXT UNLOCK: LV.${nextUpgrade.level} — ${nextUpgrade.label}${nextUpgrade.chassis !== 'all' ? ' ('+nextUpgrade.chassis.toUpperCase()+')' : ''}</div>`;
    }

    html += '<div style="margin-top:20px;">';
    html += `<button onclick="document.getElementById('upgrades-overlay').style.display='none'" style="padding:12px 32px;background:rgba(255,60,60,0.04);border:1px solid rgba(255,60,60,0.3);color:rgba(255,100,100,0.85);font-size:12px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,60,60,0.12)'" onmouseout="this.style.background='rgba(255,60,60,0.04)'">BACK</button>`;
    html += '</div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
}
