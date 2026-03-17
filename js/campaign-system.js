// ═══════════════════════════════════════════════════════════════════
//  CAMPAIGN MISSION SYSTEM — Phase 3
//  Chapters, missions, player leveling, modifiers, bonus objectives,
//  variable enemy compositions, and level-differential XP scaling.
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
//
// GLOBALS READ FROM index.html / other files:
//   _gameMode, _scrap, _round, _totalKills, _roundKills,
//   ARENA_DEFS, OBJECTIVE_DEFS, ENEMY_TYPE_DEFS
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
    // Track completed missions: { 'ch1_m1': true, 'ch1_m3': true, ... }
    completedMissions: {},
    // Currently active modifier and bonus objective for this deploy
    activeModifier: null,
    activeBonusObjective: null,
    bonusObjectiveProgress: 0,
    bonusObjectiveComplete: false
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
 *  playerLvl vs missionEnemyLvl determines reward scaling. */
function getXPMultiplier(playerLvl, missionLvl) {
    const diff = missionLvl - playerLvl;
    if (diff >= 3)  return 1.50;  // enemies 3+ above
    if (diff >= 1)  return 1.25;  // enemies 1-2 above
    if (diff === 0) return 1.00;  // same level
    if (diff >= -2) return 0.60;  // enemies 1-2 below
    return 0.30;                   // enemies 3+ below
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

/** Show the mission select overlay. */
function showMissionSelect() {
    let overlay = document.getElementById('mission-select-overlay');
    if (!overlay) return;

    // Build chapter tabs + mission list
    let html = '';
    html += '<div style="font-size:28px;letter-spacing:6px;color:#ffd700;text-shadow:0 0 20px rgba(255,215,0,0.5);margin-bottom:6px;">CAMPAIGN</div>';

    // Player level / XP bar
    const xpCur = _campaignState.playerXP - getXPForLevel(_campaignState.playerLevel);
    const xpNeeded = getXPToNextLevel(_campaignState.playerLevel);
    const xpPct = xpNeeded > 0 ? Math.min(1, xpCur / xpNeeded) : 1;
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">';
    html += `<div style="font-size:11px;letter-spacing:2px;color:rgba(255,215,0,0.7);">LEVEL ${_campaignState.playerLevel}</div>`;
    html += `<div style="flex:1;max-width:300px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">`;
    html += `<div style="width:${xpPct * 100}%;height:100%;background:#ffd700;border-radius:3px;transition:width 0.3s;"></div>`;
    html += `</div>`;
    html += `<div style="font-size:10px;letter-spacing:1px;color:rgba(255,215,0,0.4);">${xpCur} / ${xpNeeded} XP</div>`;
    html += '</div>';

    // Chapter tabs
    html += '<div style="display:flex;gap:0;margin-bottom:20px;">';
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

    // Current chapter info
    const ch = CAMPAIGN_CHAPTERS[_campaignState.currentChapter];
    html += `<div style="font-size:14px;letter-spacing:3px;color:#ffd700;margin-bottom:4px;">${ch.title}</div>`;
    html += `<div style="font-size:11px;letter-spacing:1px;color:rgba(200,210,217,0.5);margin-bottom:16px;">${ch.desc}</div>`;

    // Mission list
    html += '<div style="display:flex;flex-direction:column;gap:8px;max-width:600px;width:100%;">';
    ch.missions.forEach((m, idx) => {
        const completed = isMissionCompleted(m.id);
        const levelDiff = m.enemyLevel - _campaignState.playerLevel;
        const diffColor = levelDiff >= 3 ? '#ff2200' : levelDiff >= 1 ? '#ff8844' : levelDiff === 0 ? '#00ff88' : levelDiff >= -2 ? '#88aacc' : '#666666';
        const diffLabel = levelDiff >= 3 ? 'HARD' : levelDiff >= 1 ? 'TOUGH' : levelDiff === 0 ? 'EVEN' : levelDiff >= -2 ? 'EASY' : 'TRIVIAL';

        const bgBase = completed ? 'rgba(0,255,136,0.04)' : 'rgba(255,255,255,0.03)';
        const bdBase = completed ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.1)';
        const blBase = completed ? '#00ff88' : 'rgba(255,215,0,0.4)';
        html += '<button onclick="_selectMission(' + idx + ')" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:' + bgBase + ';border:1px solid ' + bdBase + ';border-left:3px solid ' + blBase + ';border-radius:4px;font-family:Courier New,monospace;cursor:pointer;transition:all 0.2s;text-align:left;outline:none;width:100%;" onmouseover="this.style.background=\'rgba(255,215,0,0.08)\'" onmouseout="this.style.background=\'' + bgBase + '\'">';

        // Mission number
        html += `<div style="font-size:18px;letter-spacing:2px;color:${completed ? '#00ff88' : 'rgba(255,215,0,0.6)'};min-width:30px;text-align:center;">${completed ? '✓' : (idx + 1)}</div>`;

        // Mission info
        html += '<div style="flex:1;">';
        html += `<div style="font-size:12px;letter-spacing:1px;color:${completed ? 'rgba(0,255,136,0.8)' : '#c8d2d9'};margin-bottom:2px;">${m.name}</div>`;
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

        html += '</button>';
    });
    html += '</div>';

    // Bottom buttons
    html += '<div style="display:flex;gap:16px;margin-top:24px;">';
    html += `<button onclick="_deployFromMissionSelect()" id="mission-deploy-btn" style="padding:14px 48px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.4);border-top:2px solid rgba(255,215,0,0.7);border-bottom:2px solid rgba(255,215,0,0.7);color:#ffd700;font-size:13px;letter-spacing:4px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,215,0,0.15)';this.style.letterSpacing='6px';" onmouseout="this.style.background='rgba(255,215,0,0.08)';this.style.letterSpacing='4px';">DEPLOY</button>`;
    html += `<button onclick="_closeMissionSelect()" style="padding:14px 32px;background:rgba(255,60,60,0.04);border:1px solid rgba(255,60,60,0.3);color:rgba(255,100,100,0.85);font-size:13px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,60,60,0.12)';" onmouseout="this.style.background='rgba(255,60,60,0.04)';">BACK</button>`;
    html += '</div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
}

/** Select a chapter tab. */
function _selectChapter(idx) {
    if (!isChapterUnlocked(idx)) return;
    _campaignState.currentChapter = idx;
    _campaignState.currentMission = 0;
    showMissionSelect();
}

/** Select a mission within the current chapter. */
function _selectMission(idx) {
    _campaignState.currentMission = idx;
    // Highlight selected mission
    showMissionSelect();
}

/** Deploy from mission select — go to hangar with mission config. */
function _deployFromMissionSelect() {
    const mission = getCampaignMission();
    if (!mission) return;

    // Roll modifier and bonus objective
    rollMissionModifier();
    rollBonusObjective();

    // Save state
    saveCampaignState();

    // Hide mission select, show hangar
    const overlay = document.getElementById('mission-select-overlay');
    if (overlay) overlay.style.display = 'none';

    // Update hangar mode label with mission info
    const modeLabel = document.getElementById('hangar-mode-label');
    if (modeLabel) {
        modeLabel.textContent = `CAMPAIGN // ${mission.name.toUpperCase()}`;
        modeLabel.style.color = 'rgba(255,215,0,0.45)';
    }

    document.getElementById('ui-layer').style.display = 'flex';
    if (typeof startHangarGrid === 'function') startHangarGrid();
    try { refreshGarage(); } catch(e) {}

    // Show modifier and bonus objective in a brief overlay
    _showMissionBriefing(mission);
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

/** Close mission select and return to main menu. */
function _closeMissionSelect() {
    const overlay = document.getElementById('mission-select-overlay');
    if (overlay) overlay.style.display = 'none';

    // Return to main menu
    const menu = document.getElementById('main-menu');
    if (menu) {
        menu.style.display = 'flex';
        menu.style.opacity = '1';
    }
}
