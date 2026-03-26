// ═══════════════════════════════════════════════════════════════════
//  CAMPAIGN MISSION SYSTEM — Phases 3 & 4
//  Phase 3: Chapters, missions, player leveling, modifiers, bonus
//           objectives, variable enemy compositions, XP scaling.
//  Phase 4: Hangar shop, mission rewards, loadout slots.
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
//   MISSION_REWARDS       — first-clear guaranteed loot per mission (Phase 4)
//
// FUNCTIONS CALLED FROM index.html:
//   getCampaignMission()        — returns current mission config
//   getCampaignEnemyConfig()    — returns enemy spawn config for current mission
//   awardMissionXP(kills)       — award XP after mission clear
//   applyCampaignDeathPenalty() — apply scrap loss on death
//   rollMissionModifier()       — roll a random modifier for current deploy
//   rollBonusObjective()        — roll a random bonus objective
//   trackBonusObjective(eventType, value) — check if bonus objective condition is met
//   getXPForLevel(level)        — XP required for a given level
//   getXPMultiplier(playerLvl, missionLvl) — level-differential multiplier
//   showMissionSelect()         — show mission/chapter select UI
//   saveCampaignState()         — save full campaign state
//   loadCampaignState()         — load full campaign state
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
                enemyLevel: 1, enemyCount: 4, hasBoss: false
            },
            {
                id: 'ch1_m2', name: 'First Contact',
                briefing: 'Multiple hostiles converging on your position. Hold the line.',
                arena: 'warehouse', objective: 'elimination',
                enemyLevel: 3, enemyCount: 5, hasBoss: false
            },
            {
                id: 'ch1_m3', name: 'Salvage Run',
                briefing: 'Intelligence cores scattered across the warehouse. Recover them before the enemy does.',
                arena: 'warehouse', objective: 'salvage',
                enemyLevel: 5, enemyCount: 6, hasBoss: false
            },
            {
                id: 'ch1_m4', name: 'Under Siege',
                briefing: 'Enemy forces are targeting our generator. Protect it at all costs.',
                arena: 'warehouse', objective: 'defense',
                enemyLevel: 7, enemyCount: 7, hasBoss: false
            },
            {
                id: 'ch1_m5', name: 'Warehouse Boss',
                briefing: 'A heavily armored command unit has taken position in the warehouse. Destroy it.',
                arena: 'warehouse', objective: 'elimination',
                enemyLevel: 10, enemyCount: 4, hasBoss: true
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
                enemyLevel: 11, enemyCount: 6, hasBoss: false
            },
            {
                id: 'ch2_m2', name: 'Chokepoint',
                briefing: 'Enemy snipers control the main corridor. Survive their ambush.',
                arena: 'corridors', objective: 'survival',
                enemyLevel: 13, enemyCount: 7, hasBoss: false
            },
            {
                id: 'ch2_m3', name: 'High Value Target',
                briefing: 'Intelligence identifies a rogue commander in the tunnels. Eliminate them.',
                arena: 'corridors', objective: 'assassination',
                enemyLevel: 15, enemyCount: 7, hasBoss: false
            },
            {
                id: 'ch2_m4', name: 'Data Recovery',
                briefing: 'Critical data cores are hidden throughout the corridor network. Find them.',
                arena: 'corridors', objective: 'salvage',
                enemyLevel: 17, enemyCount: 8, hasBoss: false
            },
            {
                id: 'ch2_m5', name: 'Tunnel Warden',
                briefing: 'A massive siege unit blocks the exit. Break through or be buried.',
                arena: 'corridors', objective: 'elimination',
                enemyLevel: 20, enemyCount: 5, hasBoss: true
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
                enemyLevel: 21, enemyCount: 7, hasBoss: false
            },
            {
                id: 'ch3_m2', name: 'Blood Sport',
                briefing: 'No rules. No mercy. Eliminate everything that moves.',
                arena: 'pit', objective: 'elimination',
                enemyLevel: 24, enemyCount: 9, hasBoss: false
            },
            {
                id: 'ch3_m3', name: 'The Gauntlet',
                briefing: 'Wave after wave of enemies in a shrinking arena. How long can you last?',
                arena: 'pit', objective: 'survival',
                enemyLevel: 27, enemyCount: 10, hasBoss: false
            },
            {
                id: 'ch3_m4', name: 'Pit Viper',
                briefing: 'A modified assassin mech lurks in the pit. Hunt it down before it hunts you.',
                arena: 'pit', objective: 'assassination',
                enemyLevel: 30, enemyCount: 8, hasBoss: false
            },
            {
                id: 'ch3_m5', name: 'Pit Champion',
                briefing: 'The reigning champion of The Pit challenges you. Only one mech leaves.',
                arena: 'pit', objective: 'elimination',
                enemyLevel: 34, enemyCount: 5, hasBoss: true
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
                enemyLevel: 35, enemyCount: 9, hasBoss: false
            },
            {
                id: 'ch4_m2', name: 'Defend the Relay',
                briefing: 'Our comms relay is under attack. Protect it while reinforcements arrive.',
                arena: 'stronghold', objective: 'defense',
                enemyLevel: 38, enemyCount: 10, hasBoss: false
            },
            {
                id: 'ch4_m3', name: 'Behind Enemy Lines',
                briefing: 'Recover encrypted intel from deep within the stronghold.',
                arena: 'stronghold', objective: 'salvage',
                enemyLevel: 41, enemyCount: 9, hasBoss: false
            },
            {
                id: 'ch4_m4', name: 'Iron Curtain',
                briefing: 'Survive the enemy\'s full assault. They know you\'re coming.',
                arena: 'stronghold', objective: 'survival',
                enemyLevel: 44, enemyCount: 11, hasBoss: false
            },
            {
                id: 'ch4_m5', name: 'Stronghold Commander',
                briefing: 'The stronghold\'s commander deploys their personal war machine. End this.',
                arena: 'stronghold', objective: 'elimination',
                enemyLevel: 48, enemyCount: 6, hasBoss: true
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
                enemyLevel: 50, enemyCount: 10, hasBoss: false
            },
            {
                id: 'ch5_m2', name: 'Signal Intercept',
                briefing: 'Recover enemy transmission data before they purge the servers.',
                arena: 'tower_defense', objective: 'salvage',
                enemyLevel: 54, enemyCount: 11, hasBoss: false
            },
            {
                id: 'ch5_m3', name: 'Kill Order',
                briefing: 'The enemy general is exposed. Execute the kill order.',
                arena: 'tower_defense', objective: 'assassination',
                enemyLevel: 58, enemyCount: 12, hasBoss: false
            },
            {
                id: 'ch5_m4', name: 'Last Stand',
                briefing: 'The enemy throws everything they have. Hold the generator or lose everything.',
                arena: 'tower_defense', objective: 'defense',
                enemyLevel: 62, enemyCount: 13, hasBoss: false
            },
            {
                id: 'ch5_m5', name: 'Endgame',
                briefing: 'The final boss. The war ends here.',
                arena: 'tower_defense', objective: 'elimination',
                enemyLevel: 66, enemyCount: 7, hasBoss: true
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
 *  Called from GAME events (kills, damage, etc.). */
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

    const mod = _campaignState.activeModifier;

    // Apply modifier effects to count
    let extraEnemies = 0;
    if (mod?.effect === 'extraEnemies') extraEnemies = mod.value;

    const totalCount = mission.enemyCount + extraEnemies;
    const composition = generateEnemyComposition(mission.enemyLevel, totalCount);

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
        totalEnemies: totalCount,
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
// CAMPAIGN SAVE / LOAD (declared here, full implementation in Phase 4E below)
// ══════════════════════════════════════════════════════════════════
function saveCampaignState() {}
function loadCampaignState() {
    setTimeout(() => { if (typeof _updateMainMenuStats === 'function') _updateMainMenuStats(); }, 100);
    return false;
}

// ══════════════════════════════════════════════════════════════════
// CAMPAIGN HUD HELPERS
// ══════════════════════════════════════════════════════════════════

/** Update the campaign XP bar in the loadout/stats overlay. */
function _updateCampaignXPBar() {
    const bar = document.getElementById('campaign-xp-bar');
    if (!bar) return;
    if (typeof _gameMode === 'undefined' || _gameMode !== 'campaign') {
        bar.style.display = 'none';
        return;
    }
    bar.style.display = 'flex';
    const level = _campaignState.playerLevel;
    const xpCur = _campaignState.playerXP - getXPForLevel(level);
    const xpNeeded = getXPToNextLevel(level);
    const pct = xpNeeded > 0 ? Math.min(100, Math.round((xpCur / xpNeeded) * 100)) : 100;
    const lvEl = document.getElementById('campaign-xp-level');
    const fillEl = document.getElementById('campaign-xp-fill');
    const txtEl = document.getElementById('campaign-xp-text');
    if (lvEl) lvEl.textContent = 'LEVEL ' + level;
    if (fillEl) fillEl.style.width = pct + '%';
    if (txtEl) txtEl.textContent = xpCur + ' / ' + xpNeeded + ' XP';
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

    // Reset overlay to full-panel layout (override inline scrollable defaults)
    overlay.style.padding = '0';
    overlay.style.alignItems = 'stretch';
    overlay.style.justifyContent = 'flex-start';
    overlay.style.overflowY = 'hidden';

    const xpCur = _campaignState.playerXP - getXPForLevel(_campaignState.playerLevel);
    const xpNeeded = getXPToNextLevel(_campaignState.playerLevel);
    const xpPct = xpNeeded > 0 ? Math.min(1, xpCur / xpNeeded) : 1;

    let html = '';

    // ── Top bar ──
    html += '<div class="cm-top" style="position:relative;">';
    html += `<button onclick="_closeMissionSelect()" class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;">&#8249; Back</button>`;
    html += `<span style="position:absolute;left:50%;transform:translateX(-50%);font-size:11px;letter-spacing:4px;color:var(--sci-cyan);text-transform:uppercase;pointer-events:none;">CAMPAIGN</span>`;
    html += `<span style="position:absolute;left:50%;transform:translateX(-50%);margin-top:22px;font-size:9px;letter-spacing:2px;color:rgba(255,255,255,0.45);pointer-events:none;">LVL ${_campaignState.playerLevel} &nbsp;·&nbsp; ${xpCur} / ${xpNeeded} XP</span>`;
    html += `<button onclick="_openShopFromMission()" class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;margin-left:auto;">Supply Shop</button>`;
    html += `<button class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;opacity:0.45;cursor:default;" disabled title="Coming Soon">Skill Tree</button>`;
    html += `<button onclick="_openLoadoutFromMission()" class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;">Loadout</button>`;
    html += '</div>';

    // ── Body ──
    html += '<div class="cm-body">';

    // ── Left panel: chapter list ──
    html += '<div class="cm-left">';
    CAMPAIGN_CHAPTERS.forEach((ch, idx) => {
        const unlocked = isChapterUnlocked(idx);
        const active = idx === _campaignState.currentChapter;
        const completed = getChapterCompletionCount(idx);
        const total = ch.missions.length;
        let cls = 'cm-chapter';
        if (active) cls += ' active';
        if (!unlocked) cls += ' locked';
        const clickAttr = unlocked ? `onclick="_selectChapter(${idx})"` : '';
        html += `<div class="${cls}" ${clickAttr}>`;
        html += `<div class="cm-chapter-num">CH.${idx + 1}</div>`;
        html += `<div class="cm-chapter-name">${ch.title}</div>`;
        html += `<div class="cm-chapter-prog">${completed} / ${total} missions</div>`;
        html += '</div>';
    });
    html += '</div>';

    // ── Right panel: mission list + deploy bar ──
    html += '<div class="cm-main">';

    // Scrollable mission rows
    html += '<div style="flex:1;overflow-y:auto;">';
    const ch = CAMPAIGN_CHAPTERS[_campaignState.currentChapter];
    ch.missions.forEach((m, idx) => {
        const completed = isMissionCompleted(m.id);
        const isSelected = (_selectedMissionIdx === idx);
        let cls = 'cm-mission';
        if (isSelected) cls += ' selected';

        html += `<div class="${cls}" onclick="_selectMission(${idx})">`;

        // Number / completion indicator
        if (completed) {
            html += `<span class="cm-mission-done">✓</span>`;
        } else {
            html += `<span class="cm-mission-num">${String(idx + 1).padStart(2, '0')}</span>`;
        }

        // Name + briefing
        html += '<div style="flex:1;min-width:0;">';
        html += `<div class="cm-mission-name">${m.name}</div>`;
        html += `<div class="cm-mission-brief">${m.briefing}</div>`;
        html += '</div>';

        // Level badge (red border if boss)
        html += `<span class="cm-mission-lv${m.hasBoss ? ' boss' : ''}">LV.${m.enemyLevel}</span>`;

        // First-clear reward badge
        if (!completed && typeof getMissionReward === 'function' && getMissionReward(m.id)) {
            html += `<span style="font-size:8px;letter-spacing:1px;color:var(--sci-gold);border:1px solid rgba(255,209,102,0.3);padding:2px 5px;white-space:nowrap;">REWARD</span>`;
        }

        html += '</div>';
    });
    html += '</div>'; // scrollable missions

    // Deploy bar
    html += '<div class="cm-bottom">';
    if (_selectedMissionIdx !== null) {
        html += `<button onclick="_deployFromMissionSelect()" id="mission-deploy-btn" class="tw-btn tw-btn--solid" style="flex:0 0 auto;width:auto;margin-left:auto;">Deploy &#8250;</button>`;
    }
    html += '</div>'; // cm-bottom

    html += '</div>'; // cm-main
    html += '</div>'; // cm-body

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
    if (typeof populateLoadout === 'function') populateLoadout();
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

/** Deploy from mission select — skip hangar, go straight to GAME. */
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
    if (typeof _updateMainMenuStats === 'function') _updateMainMenuStats();
}

// ══════════════════════════════════════════════════════════════════
// ██████████████████████████████████████████████████████████████████
//  PHASE 4 — CAMPAIGN-SPECIFIC RPG FEATURES
// ██████████████████████████████████████████████████████████████████
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
// 4A — SKILL TREE (removed — new system TBD)
// ══════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════
// 4B — MISSION REWARDS (first-clear guaranteed loot)
// ══════════════════════════════════════════════════════════════════

/** Guaranteed reward for first-time mission completion.
 *  scrap = flat scrap bonus, itemRarity = guaranteed loot drop rarity,
 *  itemLevel = item level for generation. */
const MISSION_REWARDS = {
    // Chapter 1 (LV 1-10)
    ch1_m1: { scrap: 5,   itemRarity: 'common',    itemLevel: 1 },
    ch1_m2: { scrap: 8,   itemRarity: 'common',    itemLevel: 3 },
    ch1_m3: { scrap: 12,  itemRarity: 'uncommon',  itemLevel: 5 },
    ch1_m4: { scrap: 15,  itemRarity: 'uncommon',  itemLevel: 7 },
    ch1_m5: { scrap: 30,  itemRarity: 'rare',      itemLevel: 10 },
    // Chapter 2 (LV 11-20)
    ch2_m1: { scrap: 15,  itemRarity: 'uncommon',  itemLevel: 11 },
    ch2_m2: { scrap: 18,  itemRarity: 'rare',      itemLevel: 13 },
    ch2_m3: { scrap: 22,  itemRarity: 'rare',      itemLevel: 15 },
    ch2_m4: { scrap: 28,  itemRarity: 'rare',      itemLevel: 17 },
    ch2_m5: { scrap: 50,  itemRarity: 'epic',      itemLevel: 20 },
    // Chapter 3 (LV 21-34)
    ch3_m1: { scrap: 25,  itemRarity: 'rare',      itemLevel: 21 },
    ch3_m2: { scrap: 30,  itemRarity: 'rare',      itemLevel: 24 },
    ch3_m3: { scrap: 35,  itemRarity: 'epic',      itemLevel: 27 },
    ch3_m4: { scrap: 40,  itemRarity: 'epic',      itemLevel: 30 },
    ch3_m5: { scrap: 70,  itemRarity: 'epic',      itemLevel: 34 },
    // Chapter 4 (LV 35-48)
    ch4_m1: { scrap: 35,  itemRarity: 'epic',      itemLevel: 35 },
    ch4_m2: { scrap: 40,  itemRarity: 'epic',      itemLevel: 38 },
    ch4_m3: { scrap: 50,  itemRarity: 'epic',      itemLevel: 41 },
    ch4_m4: { scrap: 55,  itemRarity: 'legendary', itemLevel: 44 },
    ch4_m5: { scrap: 90,  itemRarity: 'legendary', itemLevel: 48 },
    // Chapter 5 (LV 50-66)
    ch5_m1: { scrap: 50,  itemRarity: 'epic',      itemLevel: 50 },
    ch5_m2: { scrap: 60,  itemRarity: 'legendary', itemLevel: 54 },
    ch5_m3: { scrap: 70,  itemRarity: 'legendary', itemLevel: 58 },
    ch5_m4: { scrap: 85,  itemRarity: 'legendary', itemLevel: 62 },
    ch5_m5: { scrap: 150, itemRarity: 'legendary', itemLevel: 66 },
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
                        const _affixTypeMap = { shield_system:'shield', cpu_system:'cpu', leg_system:'legs', aug_system:'augment' };
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
        if (item && typeof _inventory !== 'undefined') {
            const _freeIdx = _inventory.indexOf(null);
            if (_freeIdx !== -1) _inventory[_freeIdx] = item;
        }
    }

    return { scrap: reward.scrap, item };
}

// ══════════════════════════════════════════════════════════════════
// 4C — HANGAR SHOP (buy/sell gear with scrap)
// ══════════════════════════════════════════════════════════════════

/** Shop stock — refreshed each time player returns to mission select. */
let _shopStock = [];
const SHOP_MAX_ITEMS = 12;

/** Category-sorted views into _shopStock, rebuilt by _shopSortCategories(). */
let _shopItems = { offensive: [], defensive: [], utility: [] };

/** Categorize a shop/loot item by its baseType for the three-column buy grid. */
function _shopGetCategory(item) {
    const t = (item.baseType || '').toLowerCase();
    if (['weapon'].includes(t)) return 'offensive';
    if (['armor', 'arms', 'shield', 'shield_system'].includes(t)) return 'defensive';
    if (['legs', 'leg_system', 'cpu', 'cpu_system', 'augment', 'aug_system'].includes(t)) return 'utility';
    return 'utility';
}

/** Rebuild _shopItems from _shopStock by category. */
function _shopSortCategories() {
    _shopItems = { offensive: [], defensive: [], utility: [] };
    _shopStock.forEach(item => {
        const cat = _shopGetCategory(item);
        _shopItems[cat].push(item);
    });
}

/** Re-render a single category grid in the DOM without full shop re-render. */
function _shopRenderCategory(catKey) {
    const grid = document.getElementById('shop-grid-' + catKey);
    if (!grid) return;
    const items = _shopItems[catKey];
    const _shopSlotLabelsLocal = {
        weapon:'WEAPON', armor:'ARMOR', arms:'ARMS', legs:'LEGS',
        shield:'SHIELD', cpu:'CPU', augment:'AUGMENT',
        shield_system:'SHIELD', cpu_system:'CPU', leg_system:'LEGS', aug_system:'AUGMENT'
    };
    const slotLbl = (item) => _shopSlotLabelsLocal[item?.baseType] || (item?.baseType || '');
    const _shopItemName = (item) => (item.baseType === 'weapon' && typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[item.subType] : null) || item.shortName || item.name || 'Item';
    let h = '';
    for (let i = 0; i < 15; i++) {
        if (i < items.length) {
            const item = items[i];
            const stockIdx = _shopStock.indexOf(item);
            const rd = (typeof RARITY_DEFS !== 'undefined') ? RARITY_DEFS[item.rarity] : null;
            const color = rd ? rd.colorStr : (_shopRarityColors[item?.rarity] || _shopRarityColors.common);
            const borderColor = item.isUnique ? 'rgba(255,215,0,0.4)' : color + '44';
            const priceTag = `<div style="font-size:8px;color:var(--sci-gold,#ffd700);margin-top:2px;">⬡ ${item._shopPrice}</div>`;
            h += `<div class="lo-slot" style="border-color:${borderColor};" data-shop-idx="${stockIdx}"
                onclick="_shopBuy(${stockIdx})"
                onmouseenter="_shopShowHover(this,_shopStock[${stockIdx}],'right')"
                onmouseleave="_shopHideHover()"
                onmousedown="_shopHideHover()">
                ${item.isUnique ? '<div class="lo-slot-star">★</div>' : ''}
                <div class="lo-slot-lbl">${slotLbl(item)}</div>
                <div class="lo-slot-name" style="color:${color};">${_shopItemName(item)}</div>
                ${priceTag}
            </div>`;
        } else {
            h += '<div class="lo-slot empty"></div>';
        }
    }
    grid.innerHTML = h;
}

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
    _shopSortCategories();
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
    if (typeof _inventory !== 'undefined' && _inventory.indexOf(null) === -1) return false;

    _scrap -= item._shopPrice;
    const bought = { ...item };
    delete bought._shopPrice;
    const _shopFreeSlot = _inventory.indexOf(null);
    _inventory[_shopFreeSlot] = bought;
    _shopStock.splice(shopIdx, 1);
    if (typeof saveInventory === 'function') saveInventory();
    return true;
}

/** Sell an item from inventory. Returns scrap gained. */
function shopSellItem(invIdx) {
    if (typeof _inventory === 'undefined' || invIdx < 0 || invIdx >= INVENTORY_MAX || !_inventory[invIdx]) return 0;
    const item = _inventory[invIdx];
    const price = getItemSellPrice(item);
    _scrap += price;
    _inventory[invIdx] = null;
    if (typeof saveInventory === 'function') saveInventory();
    return price;
}

/** Currently selected shop buy-item index (null = none). */
let _selectedShopIdx = null;

/** Currently selected shop sell-item index (null = none). */
let _selectedSellIdx = null;

/** Rarity colors used throughout the shop renderer. */
const _shopRarityColors = {
    common:    '#c0c8d0',
    uncommon:  '#00ff44',
    rare:      '#4488ff',
    epic:      '#aa44ff',
    legendary: '#ffd700'
};

/** Stat display names for comparison panel. */
const _shopStatNames = {
    dmgFlat:'Damage', dmgPct:'Damage %', critChance:'Crit Chance %', critDmg:'Crit Damage %',
    fireRatePct:'Fire Rate %', coreHP:'Core HP', armHP:'Arm HP', legHP:'Leg HP', allHP:'All HP',
    dr:'Damage Reduction %', shieldHP:'Shield HP', shieldRegen:'Shield Regen %', absorbPct:'Absorb %',
    dodgePct:'Dodge %', speedPct:'Speed %', modCdPct:'CPU Cooldown %', modEffPct:'CPU Effect %',
    lootMult:'Loot Quality %', autoRepair:'Auto Repair', pellets:'Pellets', splashRadius:'Blast Radius %',
    accuracy:'Accuracy %', dmg:'Damage', reload:'Fire Rate', maxShield:'Shield HP'
};

/** Get the total computed stats for an item (baseStats + affixes). */
function _shopItemTotal(item) {
    const totals = {};
    if (item?.baseStats) {
        for (const [k, v] of Object.entries(item.baseStats)) totals[k] = (totals[k] || 0) + v;
    }
    if (item?.computedStats) {
        for (const [k, v] of Object.entries(item.computedStats)) totals[k] = (totals[k] || 0) + v;
    }
    return totals;
}

/** Show the campaign shop UI overlay. */
function showShop() {
    let overlay = document.getElementById('shop-overlay');
    if (!overlay) return;

    // Refresh stock if empty
    if (_shopStock.length === 0) refreshShopStock();

    // Reset overlay to full-panel layout
    overlay.style.padding        = '0';
    overlay.style.alignItems     = 'stretch';
    overlay.style.justifyContent = 'flex-start';
    overlay.style.overflowY      = 'hidden';

    const rc          = (item) => _shopRarityColors[item?.rarity] || _shopRarityColors.common;
    const restockCost = Math.max(10, Math.round(_campaignState.playerLevel * 5));
    const canRestock  = (typeof _scrap !== 'undefined') && _scrap >= restockCost;
    const invMax      = typeof INVENTORY_MAX !== 'undefined' ? INVENTORY_MAX : 30;
    const scrapVal    = typeof _scrap !== 'undefined' ? _scrap : 0;

    // ── Slot mappings (Fix 2 + Fix 3) ──
    const _baseTypeToSlot = {
        armor:         'armor',
        arms:          'arms',
        legs:          'legs',
        shield:        'shield',
        cpu:           'cpu',
        augment:       'augment',
        shield_system: 'shield',
        cpu_system:    'cpu',
        leg_system:    'legs',
        aug_system:    'augment'
    };
    // Friendly slot labels per baseType (Fix 3)
    const _shopSlotLabels = {
        weapon:        'WEAPON',
        armor:         'ARMOR',
        arms:          'ARMS',
        legs:          'LEGS',
        shield:        'SHIELD',
        cpu:           'CPU',
        augment:       'AUGMENT',
        shield_system: 'SHIELD',
        cpu_system:    'CPU',
        leg_system:    'LEGS',
        aug_system:    'AUGMENT'
    };
    const slotLbl = (item) => _shopSlotLabels[item?.baseType] || (item?.baseType || '');

    // ── Stat card helper for side-by-side comparison (Fix 2) ──
    function _itemStatCard(item, cardLabel) {
        const itemRc  = rc(item);
        const typeLbl = slotLbl(item);
        const meta    = `${item.rarity || 'common'} · ${typeLbl} · LV.${item.level || 1}`;
        const stats   = _shopItemTotal(item);
        const entries = Object.entries(stats).filter(([, v]) => v !== 0);
        let h = `<div style="flex:1;min-width:0;background:rgba(0,0,0,0.25);border:1px solid var(--sci-line);border-radius:3px;padding:10px 12px;">`;
        if (cardLabel) {
            h += `<div style="font-size:8px;letter-spacing:2px;color:rgba(255,255,255,0.45);margin-bottom:4px;text-transform:uppercase;">${cardLabel}</div>`;
        }
        h += `<div style="font-size:11px;letter-spacing:1px;color:${itemRc};margin-bottom:2px;">${(item.baseType === 'weapon' ? WEAPON_NAMES[item.subType] : null) || item.name || 'Item'}</div>`;
        h += `<div style="font-size:9px;color:rgba(255,255,255,0.45);margin-bottom:8px;">${meta}</div>`;
        entries.forEach(([k, v]) => {
            h += `<div style="display:flex;justify-content:space-between;font-size:10px;padding:1px 0;">`;
            h += `<span style="color:rgba(255,255,255,0.45);">${_shopStatNames[k] || k}</span>`;
            h += `<span style="color:var(--sci-txt);">${k === 'reload' ? (1000 / v).toFixed(1) + '/sec' : v}</span>`;
            h += `</div>`;
        });
        if (!entries.length) {
            h += `<div style="font-size:9px;color:rgba(255,255,255,0.45);">No stats</div>`;
        }
        h += `</div>`;
        return h;
    }

    // ── Slot builders ──
    function _shopItemName(item) {
        return (item.baseType === 'weapon' && typeof WEAPON_NAMES !== 'undefined' ? WEAPON_NAMES[item.subType] : null) || item.shortName || item.name || 'Item';
    }

    function buySlot(item, idx) {
        const rd = (typeof RARITY_DEFS !== 'undefined') ? RARITY_DEFS[item.rarity] : null;
        const color = rd ? rd.colorStr : rc(item);
        const borderColor = item.isUnique ? 'rgba(255,215,0,0.4)' : color + '44';
        const priceTag = `<div style="font-size:8px;color:var(--sci-gold,#ffd700);margin-top:2px;">⬡ ${item._shopPrice}</div>`;
        return `<div class="lo-slot" style="border-color:${borderColor};" data-shop-idx="${idx}"
            onclick="_shopBuy(${idx})"
            onmouseenter="_shopShowHover(this,_shopStock[${idx}],'right')"
            onmouseleave="_shopHideHover()"
            onmousedown="_shopHideHover()">
            ${item.isUnique ? '<div class="lo-slot-star">★</div>' : ''}
            <div class="lo-slot-lbl">${slotLbl(item)}</div>
            <div class="lo-slot-name" style="color:${color};">${_shopItemName(item)}</div>
            ${priceTag}
        </div>`;
    }

    function sellSlot(item, idx) {
        const rd = (typeof RARITY_DEFS !== 'undefined') ? RARITY_DEFS[item.rarity] : null;
        const color = rd ? rd.colorStr : rc(item);
        const borderColor = item.isUnique ? 'rgba(255,215,0,0.4)' : color + '44';
        const sellPrice = getItemSellPrice(item);
        return `<div class="lo-slot" style="border-color:${borderColor};" data-sell-idx="${idx}"
            onclick="_shopSelectSell(${idx})"
            onmouseenter="_shopShowHover(this,_inventory[${idx}],'left',true)"
            onmouseleave="_shopHideHover()"
            onmousedown="_shopHideHover()">
            ${item.isUnique ? '<div class="lo-slot-star">★</div>' : ''}
            <div class="lo-slot-lbl">${slotLbl(item)}</div>
            <div class="lo-slot-name" style="color:${color};">${_shopItemName(item)}</div>
            <div style="font-size:8px;color:#00ff88;margin-top:2px;">⬡ ${sellPrice}</div>
        </div>`;
    }

    // ── Buy detail panel — disabled; hover cards replace click-to-view ──
    _selectedShopIdx = null;
    let detailHtml = '';
    if (false) { // detail panel removed — kept as dead code for reference
        const selItem      = _shopStock[_selectedShopIdx];
        const itemRc       = rc(selItem);
        const canBuy       = scrapVal >= selItem._shopPrice && (typeof _inventory === 'undefined' || _inventory.length < invMax);
        const slotKey      = _baseTypeToSlot[selItem.baseType] || null;
        const equippedItem = (slotKey && typeof _equipped !== 'undefined') ? (_equipped[slotKey] || null) : null;
        const newStats     = _shopItemTotal(selItem);
        const oldStats     = equippedItem ? _shopItemTotal(equippedItem) : {};
        const allKeys      = [...new Set([...Object.keys(newStats), ...Object.keys(oldStats)])];
        const slotLabel    = slotLbl(selItem);

        detailHtml += `<div class="shop-detail-panel">`;

        // Slot label (Fix 3)
        if (slotLabel) {
            detailHtml += `<div style="font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.45);text-transform:uppercase;margin-bottom:4px;">${slotLabel}</div>`;
        }

        if (equippedItem) {
            // Two cards side by side (Fix 2)
            detailHtml += `<div style="display:flex;gap:12px;margin-bottom:10px;">`;
            detailHtml += _itemStatCard(selItem, 'New');
            detailHtml += _itemStatCard(equippedItem, 'Equipped');
            detailHtml += `</div>`;
            // Diff section — only show stats that differ
            const diffKeys = allKeys.filter(k => (newStats[k] || 0) !== (oldStats[k] || 0));
            if (diffKeys.length > 0) {
                detailHtml += `<div style="font-size:8px;letter-spacing:2px;color:rgba(255,255,255,0.45);text-transform:uppercase;margin-bottom:4px;">Changes if equipped:</div>`;
                const _shopInvertedStats = new Set(['fireRatePct','modCdPct','fireRate']);
                diffKeys.forEach(k => {
                    const diff    = (newStats[k] || 0) - (oldStats[k] || 0);
                    const isInv   = _shopInvertedStats.has(k);
                    const isGood  = isInv ? diff < 0 : diff > 0;
                    const diffCls = isGood ? 'pos' : 'neg';
                    const diffStr = (isInv && diff < 0) ? `+${Math.abs(diff)}` : (diff > 0 ? `+${diff}` : `${diff}`);
                    detailHtml += `<div style="display:flex;justify-content:space-between;font-size:10px;padding:1px 0;">`;
                    detailHtml += `<span style="color:rgba(255,255,255,0.45);">${_shopStatNames[k] || k}</span>`;
                    detailHtml += `<span class="shop-compare-diff ${diffCls}">${diffStr}</span>`;
                    detailHtml += `</div>`;
                });
            }
        } else {
            // Single card, no comparison (Fix 2 no-equipped case)
            detailHtml += `<div style="margin-bottom:10px;">`;
            detailHtml += `<div style="font-size:11px;letter-spacing:1px;color:${itemRc};margin-bottom:2px;">${selItem.name || 'Item'}</div>`;
            detailHtml += `<div style="font-size:9px;color:rgba(255,255,255,0.45);margin-bottom:8px;">${selItem.rarity || 'common'} · ${slotLabel} · LV.${selItem.level || 1} · ⬡ ${selItem._shopPrice}</div>`;
            const entries = Object.entries(newStats).filter(([, v]) => v !== 0);
            entries.forEach(([k, v]) => {
                detailHtml += `<div style="display:flex;justify-content:space-between;font-size:10px;padding:1px 0;">`;
                detailHtml += `<span style="color:rgba(255,255,255,0.45);">${_shopStatNames[k] || k}</span>`;
                detailHtml += `<span style="color:var(--sci-txt);">${k === 'reload' ? (1000 / v).toFixed(1) + '/sec' : v}</span>`;
                detailHtml += `</div>`;
            });
            if (!entries.length) {
                detailHtml += `<div style="font-size:9px;color:rgba(255,255,255,0.45);">No stats</div>`;
            }
            if (slotKey) {
                detailHtml += `<div style="font-size:9px;color:rgba(255,255,255,0.45);margin-top:6px;">Slot: ${slotLabel} (nothing equipped)</div>`;
            }
            detailHtml += `</div>`;
        }

        // Buy action
        detailHtml += `<div class="shop-bottom-bar">`;
        if (canBuy) {
            detailHtml += `<button onclick="_shopBuy(${_selectedShopIdx})" class="tw-btn tw-btn--solid" style="flex:0 0 auto;width:auto;min-width:160px;">Buy — ⬡ ${selItem._shopPrice}</button>`;
        } else {
            const reason = scrapVal < selItem._shopPrice ? 'Not enough scrap' : 'Inventory full';
            detailHtml += `<div style="font-size:10px;letter-spacing:1px;color:rgba(255,255,255,0.45);">${reason}</div>`;
        }
        detailHtml += `</div>`;
        detailHtml += `</div>`;
    }

    // ── Sell detail panel (Fix 1) ──
    let sellDetailHtml = '';
    if (_selectedSellIdx !== null && typeof _inventory !== 'undefined' && _selectedSellIdx < INVENTORY_MAX && _inventory[_selectedSellIdx]) {
        const sellItem   = _inventory[_selectedSellIdx];
        const sellItemRc = rc(sellItem);
        const sellPrice  = getItemSellPrice(sellItem);
        const slotLabel  = slotLbl(sellItem);
        sellDetailHtml += `<div class="shop-detail-panel">`;
        if (slotLabel) {
            sellDetailHtml += `<div style="font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.45);text-transform:uppercase;margin-bottom:4px;">${slotLabel}</div>`;
        }
        sellDetailHtml += `<div class="shop-detail-name" style="color:${sellItemRc};">${sellItem.name || 'Item'}</div>`;
        sellDetailHtml += `<div class="shop-detail-meta">${sellItem.rarity || 'common'} · ${slotLabel} · LV.${sellItem.level || 1}</div>`;
        sellDetailHtml += `<div class="shop-bottom-bar" style="flex-direction:column;gap:6px;">`;
        sellDetailHtml += `<button onclick="_shopSell(${_selectedSellIdx})" class="tw-btn tw-btn--danger" style="width:100%;">Sell — ⬡ ${sellPrice}</button>`;
        sellDetailHtml += `<button onclick="_shopSelectSell(${_selectedSellIdx})" class="tw-btn tw-btn--ghost tw-btn--sm" style="width:100%;">Cancel</button>`;
        sellDetailHtml += `</div>`;
        sellDetailHtml += `</div>`;
    }

    // ── Buy grid HTML — three category grids (3×5 each) ──
    _shopSortCategories();
    function _buildCatGrid(catKey, label) {
        const items = _shopItems[catKey];
        let h = `<div class="shop-cat" id="shop-cat-${catKey}">`;
        h += `<div class="shop-cat-header"><span class="shop-cat-title">${label}</span><div class="shop-cat-line"></div></div>`;
        h += `<div class="shop-cat-grid" id="shop-grid-${catKey}">`;
        for (let i = 0; i < 15; i++) {
            if (i < items.length) {
                const stockIdx = _shopStock.indexOf(items[i]);
                h += buySlot(items[i], stockIdx);
            } else {
                h += '<div class="lo-slot empty"></div>';
            }
        }
        h += '</div></div>';
        return h;
    }
    let buyItemsHtml = '<div class="shop-buy-cats">';
    buyItemsHtml += _buildCatGrid('offensive', 'Offensive Gear');
    buyItemsHtml += '<div class="shop-cat-sep"></div>';
    buyItemsHtml += _buildCatGrid('defensive', 'Defensive Gear');
    buyItemsHtml += '<div class="shop-cat-sep"></div>';
    buyItemsHtml += _buildCatGrid('utility', 'Utility Gear');
    buyItemsHtml += '</div>';

    // ── Sell grid HTML (4×5 = 20 slots) ──
    let sellItemsHtml = '<div class="shop-cat-header"><span class="shop-cat-title">Backpack</span><div class="shop-cat-line"></div></div>';
    sellItemsHtml += '<div class="shop-sell-grid">';
    const inv = (typeof _inventory !== 'undefined') ? _inventory : [];
    for (let i = 0; i < invMax; i++) {
        if (inv[i]) {
            sellItemsHtml += sellSlot(inv[i], i);
        } else {
            sellItemsHtml += '<div class="lo-slot empty"></div>';
        }
    }
    sellItemsHtml += '</div>';

    // ── Restock button ──
    const restockBtn = `<button onclick="${canRestock ? '_shopRestock()' : ''}"
        class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;${canRestock ? '' : 'opacity:0.4;pointer-events:none;'}"
        ${canRestock ? '' : 'disabled'}>Restock ⬡ ${restockCost}</button>`;

    // ── Assemble full screen ──
    overlay.innerHTML = `
        <div class="shop-screen">
            <div class="shop-top">
                <button onclick="_closeShop()" class="tw-btn tw-btn--ghost tw-btn--sm" style="flex:0 0 auto;width:auto;">‹ Back</button>
                <div class="shop-title">Supply Shop</div>
                <div style="margin-left:auto;display:flex;align-items:center;gap:12px;">
                    <div class="shop-scrap">Scrap &nbsp;<span>${scrapVal}</span></div>
                    ${restockBtn}
                </div>
            </div>
            <div class="shop-body">
                <!-- BUY column -->
                <div class="shop-buy-col">
                    <div class="shop-col-hdr">
                        <div class="shop-col-title">Buy</div>
                    </div>
                    ${buyItemsHtml}
                    ${detailHtml}
                </div>
                <!-- SELL column -->
                <div class="shop-sell-col">
                    <div class="shop-col-hdr">
                        <div class="shop-col-title">Sell</div>
                        <div class="shop-col-sub">${typeof _inventory !== 'undefined' ? _inventory.filter(i => i !== null).length : 0} / ${invMax}</div>
                    </div>
                    ${sellItemsHtml}
                    ${sellDetailHtml}
                </div>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';
}

/** Select a buy item (highlight, show details). Toggle on second click. */
function _shopSelect(idx) {
    _selectedShopIdx = (_selectedShopIdx === idx) ? null : idx;
    showShop();
}

/** Select a sell item (highlight, show confirm panel). Toggle on second click. */
function _shopSelectSell(idx) {
    _selectedSellIdx = (_selectedSellIdx === idx) ? null : idx;
    showShop();
}

function _shopBuy(idx) {
    if (shopBuyItem(idx)) {
        _selectedShopIdx = null;
        showShop();
    }
}

/** Sell an inventory item: removes it, adds it to shop stock as a buyable item, awards scrap. */
function _shopSell(invIdx) {
    if (typeof _inventory === 'undefined' || invIdx < 0 || invIdx >= INVENTORY_MAX || !_inventory[invIdx]) return;
    const item  = _inventory[invIdx];
    const price = getItemSellPrice(item);
    if (typeof _scrap !== 'undefined') _scrap += price;
    // Add back to buy list so player can repurchase before next restock
    const soldItem = { ...item, _shopPrice: price, _soldBack: true };
    _shopStock.push(soldItem);
    // Add to correct category array and re-render just that grid
    const cat = _shopGetCategory(soldItem);
    _shopItems[cat].push(soldItem);
    _shopRenderCategory(cat);
    // Remove from inventory and re-render sell side + scrap display
    _inventory[invIdx] = null;
    if (typeof saveInventory === 'function') saveInventory();
    _selectedSellIdx = null;
    showShop();
}

function _shopRestock() {
    const cost = Math.max(10, Math.round(_campaignState.playerLevel * 5));
    if (typeof _scrap === 'undefined' || _scrap < cost) return;
    _scrap -= cost;
    _selectedShopIdx = null;
    _selectedSellIdx = null;
    refreshShopStock(); // replaces _shopStock entirely, clearing sold-back items
    showShop();
}

// ── Shop hover card helpers ──
function _shopGetHoverCard() {
    let card = document.getElementById('shop-hover-card');
    if (!card) {
        card = document.createElement('div');
        card.id = 'shop-hover-card';
        card.className = 'lo-hover-card';
        card.style.display = 'none';
        card.style.position = 'fixed';
        card.style.zIndex = '10010';
        card.style.pointerEvents = 'none';
        document.body.appendChild(card);
    }
    return card;
}

var _shopHoverActiveEl = null;
var _shopHoverActiveItem = null;
var _shopHoverActiveSide = null;
var _shopHoverActiveNoCompare = false;
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' && _shopHoverActiveEl && _shopHoverActiveItem && _shopHoverActiveItem.baseType === 'weapon' && !_shopHoverActiveNoCompare) {
        _shopShowHover(_shopHoverActiveEl, _shopHoverActiveItem, _shopHoverActiveSide, _shopHoverActiveNoCompare);
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' && _shopHoverActiveEl && _shopHoverActiveItem && _shopHoverActiveItem.baseType === 'weapon' && !_shopHoverActiveNoCompare) {
        _shopShowHover(_shopHoverActiveEl, _shopHoverActiveItem, _shopHoverActiveSide, _shopHoverActiveNoCompare);
    }
});

function _shopShowHover(el, item, preferSide, noCompare) {
    if (typeof _buildHoverHtml !== 'function') return;
    if (!el || !item) return;
    _shopHoverActiveEl = el;
    _shopHoverActiveItem = item;
    _shopHoverActiveSide = preferSide;
    _shopHoverActiveNoCompare = !!noCompare;
    const card = _shopGetHoverCard();

    // Determine slot label
    const _shopHoverSlotNames = {
        weapon:'Weapon', armor:'Armor', arms:'Arms', legs:'Legs',
        shield:'Shield', cpu:'CPU', augment:'Augment',
        shield_system:'Shield', cpu_system:'CPU', leg_system:'Legs', aug_system:'Augment'
    };
    const slotLabel = _shopHoverSlotNames[item.baseType] || item.baseType || '';

    // Find equipped item for comparison (skip for sell slots)
    let compareItem = null;
    if (!noCompare) {
        const _slotMap = {
            weapon:'L', armor:'armor', arms:'arms', legs:'legs',
            shield:'shield', cpu:'cpu', augment:'augment',
            shield_system:'shield', cpu_system:'cpu', leg_system:'legs', aug_system:'augment'
        };
        if (item.baseType === 'weapon') {
            if (typeof _equipped !== 'undefined') {
                const _hArm = (typeof _shiftHeld !== 'undefined' && _shiftHeld) ? 'R' : 'L';
                const _hAlt = _hArm === 'L' ? 'R' : 'L';
                if (_equipped[_hArm]) compareItem = _equipped[_hArm];
                else if (_equipped[_hAlt]) compareItem = _equipped[_hAlt];
            }
        } else {
            const eqKey = _slotMap[item.baseType];
            if (eqKey && typeof _equipped !== 'undefined' && _equipped[eqKey]) {
                compareItem = _equipped[eqKey];
            }
        }
    }

    const isCompare = !!compareItem;
    card.innerHTML = _buildHoverHtml(item, slotLabel, compareItem, 'SHOP');
    card.style.display = 'block';
    card.style.width = isCompare ? 'auto' : '200px';
    card.style.padding = isCompare ? '0' : '';
    card.style.border = isCompare ? 'none' : '';

    // Position offscreen to measure
    card.style.left = '-9999px';
    card.style.top = '0';
    const cardW = card.offsetWidth;
    const cardH = card.offsetHeight;

    const er = el.getBoundingClientRect();
    const margin = 8;
    let left;
    if (preferSide === 'left') {
        left = er.left - cardW - margin;
        if (left < 4) left = er.right + margin;
    } else {
        left = er.right + margin;
        if (left + cardW > window.innerWidth) left = er.left - cardW - margin;
    }
    if (left < 4) left = 4;
    if (left + cardW > window.innerWidth) left = window.innerWidth - cardW - 4;

    let top = er.top;
    if (top + cardH > window.innerHeight - 8) top = er.bottom - cardH;
    if (top < 4) top = 4;

    card.style.left = left + 'px';
    card.style.top = top + 'px';
}

function _shopHideHover() {
    _shopHoverActiveEl = null;
    _shopHoverActiveItem = null;
    _shopHoverActiveSide = null;
    _shopHoverActiveNoCompare = false;
    const card = document.getElementById('shop-hover-card');
    if (card) {
        card.style.display = 'none';
        card.innerHTML = '';
    }
}

function _closeShop() {
    _selectedShopIdx = null;
    _selectedSellIdx = null;
    _shopHideHover();
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
        cpu: loadout.cpu,
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
    loadout.cpu     = slot.cpu     || 'none';
    loadout.aug     = slot.aug     || 'none';
    loadout.leg     = slot.leg     || 'none';
    loadout.shld    = slot.shld    || 'none';
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
    const chassisColors = { light: UI_COLORS.chassisLight, medium: UI_COLORS.chassisMedium, heavy: UI_COLORS.chassisHeavy };

    let html = '';
    html += `<div style="font-size:24px;letter-spacing:6px;color:${UI_COLORS.cyan};text-shadow:0 0 16px ${UI_COLORS.cyan50};margin-bottom:20px;">LOADOUT SLOTS</div>`;

    // Current loadout preview
    html += `<div style="margin-bottom:20px;padding:12px 16px;background:${UI_COLORS.cyanSurface04};border:1px solid ${UI_COLORS.cyan20};border-radius:6px;max-width:500px;">`;
    html += `<div style="font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.45);margin-bottom:6px;">CURRENT LOADOUT</div>`;
    const chc = chassisColors[loadout.chassis] || UI_COLORS.text;
    html += `<div style="font-size:12px;color:${chc};letter-spacing:1px;">${(loadout.chassis||'').toUpperCase()} // L:${(loadout.L||'none').toUpperCase()} R:${(loadout.R||'none').toUpperCase()} CPU:${(loadout.cpu||'none').toUpperCase()} SHLD:${(loadout.shld||'none').toUpperCase()}</div>`;
    html += '</div>';

    // Slot list
    html += '<div style="display:flex;flex-direction:column;gap:8px;max-width:500px;width:100%;">';
    for (let i = 0; i < MAX_LOADOUT_SLOTS; i++) {
        const slot = slots[i];
        if (slot) {
            const sc = chassisColors[slot.chassis] || UI_COLORS.text;
            html += `<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:${UI_COLORS.surface03};border:1px solid ${UI_COLORS.cyan12};border-left:3px solid ${sc};border-radius:4px;">`;
            html += `<div style="flex:1;">`;
            html += `<div style="font-size:11px;letter-spacing:2px;color:${UI_COLORS.text};margin-bottom:2px;">${slot.name}</div>`;
            html += `<div style="font-size:9px;color:${UI_COLORS.text40};">${(slot.chassis||'').toUpperCase()} // L:${(slot.L||'none').toUpperCase()} R:${(slot.R||'none').toUpperCase()}</div>`;
            html += '</div>';
            html += `<button onclick="_loadSlot(${i})" class="tw-btn tw-btn--sm">LOAD</button>`;
            html += `<button onclick="_deleteSlot(${i})" class="tw-btn tw-btn--danger tw-btn--sm">✕</button>`;
            html += '</div>';
        } else {
            html += `<button onclick="_saveSlot(${i})" class="tw-btn" style="align-items:center;display:flex;gap:8px;text-align:left;width:100%;">`;
            html += `<div style="font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.45);">SLOT ${i+1} — EMPTY</div>`;
            html += `<div style="margin-left:auto;font-size:10px;letter-spacing:2px;color:var(--sci-cyan);">SAVE</div>`;
            html += '</button>';
        }
    }
    html += '</div>';

    // Close button
    html += '<div style="margin-top:20px;">';
    html += `<button onclick="_closeLoadoutSlots()" class="tw-btn tw-btn--danger">BACK</button>`;
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

saveCampaignState = function() {
    try {
        const state = {
            playerLevel: _campaignState.playerLevel,
            playerXP: _campaignState.playerXP,
            currentChapter: _campaignState.currentChapter,
            currentMission: _campaignState.currentMission,
            completedMissions: _campaignState.completedMissions,
            chassis: _campaignState.chassis || null,
            claimedRewards: _campaignState.claimedRewards || {},
            loadoutSlots: _campaignState.loadoutSlots || []
        };
        localStorage.setItem('tw_campaign_state', JSON.stringify(state));
    } catch(e) {}
};

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
            _campaignState.claimedRewards = state.claimedRewards || {};
            _campaignState.loadoutSlots = state.loadoutSlots || [];
            return true;
        }
    } catch(e) {}
    return false;
};


// ── Cloud save / load ─────────────────────────────────────────────

/** Save all campaign data to Supabase (upsert by callsign). */
async function saveToCloud() {
    if (!_supabaseEnabled() || _gameMode !== 'campaign') return;
    const callsign = _playerCallsign || 'ANONYMOUS';
    if (callsign === 'ANONYMOUS') return;

    try {
        const campaignState = {
            playerLevel: _campaignState.playerLevel,
            playerXP: _campaignState.playerXP,
            currentChapter: _campaignState.currentChapter,
            currentMission: _campaignState.currentMission,
            completedMissions: _campaignState.completedMissions,
            chassis: _campaignState.chassis || null,
            claimedRewards: _campaignState.claimedRewards || {},
            loadoutSlots: _campaignState.loadoutSlots || []
        };

        const campaignProgress = {
            round: (typeof _round !== 'undefined') ? _round : 1,
            chassis: loadout.chassis,
            color: loadout.color,
            L: loadout.L, R: loadout.R,
            cpu: loadout.cpu, aug: loadout.aug,
            leg: loadout.leg, shld: loadout.shld,
            totalKills: (typeof _totalKills !== 'undefined') ? _totalKills : 0,
            perksEarned: (typeof _perksEarned !== 'undefined') ? _perksEarned : 0
        };

        const payload = {
            callsign: callsign,
            campaign_state: campaignState,
            campaign_progress: campaignProgress,
            inventory: (typeof _inventory !== 'undefined') ? _inventory : [],
            equipped: (typeof _equipped !== 'undefined') ? _equipped : {},
            scrap: (typeof _scrap !== 'undefined') ? _scrap : 0,
            item_counter: (typeof _lootItemIdCounter !== 'undefined') ? _lootItemIdCounter : 0,
            updated_at: new Date().toISOString()
        };

        const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_CAMPAIGN_TABLE}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify(payload)
        });
        if (saveRes.ok) {
            _showCloudStatusToast('CLOUD SAVE SYNCED', false);
        } else {
            _showCloudStatusToast('CLOUD SAVE FAILED — SAVED LOCALLY', true);
        }
    } catch(e) {
        console.warn('Cloud save failed', e);
        _showCloudStatusToast('CLOUD SAVE FAILED — SAVED LOCALLY', true);
    }
}

/** Load campaign data from Supabase by callsign. Returns data object or null. */
async function loadFromCloud() {
    if (!_supabaseEnabled()) return null;
    const callsign = _playerCallsign || 'ANONYMOUS';
    if (callsign === 'ANONYMOUS') return null;

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/${SUPABASE_CAMPAIGN_TABLE}?callsign=eq.${encodeURIComponent(callsign)}&limit=1`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        if (!res.ok) return null;
        const rows = await res.json();
        if (!rows || rows.length === 0) return null;
        return rows[0];
    } catch(e) { console.warn('Cloud load failed', e); return null; }
}

/** Delete cloud save for current player. */
async function deleteCloudSave() {
    if (!_supabaseEnabled()) return;
    const callsign = _playerCallsign || 'ANONYMOUS';
    if (callsign === 'ANONYMOUS') return;
    try {
        await fetch(
            `${SUPABASE_URL}/rest/v1/${SUPABASE_CAMPAIGN_TABLE}?callsign=eq.${encodeURIComponent(callsign)}`,
            {
                method: 'DELETE',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }
        );
    } catch(e) { console.warn('Cloud delete failed', e); }
}

/** Restore campaign state from cloud data object. */
function _restoreFromCloudData(data) {
    if (!data) return false;
    // Restore campaign state
    if (data.campaign_state) {
        const cs = data.campaign_state;
        _campaignState.playerLevel = cs.playerLevel || 1;
        _campaignState.playerXP = cs.playerXP || 0;
        _campaignState.currentChapter = cs.currentChapter || 0;
        _campaignState.currentMission = cs.currentMission || 0;
        _campaignState.completedMissions = cs.completedMissions || {};
        _campaignState.chassis = cs.chassis || null;
        _campaignState.claimedRewards = cs.claimedRewards || {};
        _campaignState.loadoutSlots = cs.loadoutSlots || [];
    }
    // Restore campaign progress (loadout)
    if (data.campaign_progress) {
        const cp = data.campaign_progress;
        loadout.chassis = cp.chassis || 'light';
        loadout.color = cp.color || 0x00ff00;
        loadout.L = cp.L || 'smg';
        loadout.R = cp.R || 'none';
        loadout.cpu = cp.cpu || 'none';
        const _cpAug = cp.aug || 'none';
        loadout.aug = (typeof REMOVED_AUGMENTS !== 'undefined' && REMOVED_AUGMENTS.includes(_cpAug)) ? 'none' : _cpAug;
        const _cpLeg = cp.leg || 'none';
        loadout.leg = (typeof REMOVED_LEGS !== 'undefined' && REMOVED_LEGS.includes(_cpLeg)) ? 'none' : _cpLeg;
        const _cpShld = cp.shld || 'none';
        loadout.shld = (typeof REMOVED_SHIELDS !== 'undefined' && REMOVED_SHIELDS.includes(_cpShld)) ? 'none' : _cpShld;
        _round = cp.round || 1;
        _totalKills = cp.totalKills || 0;
        _perksEarned = cp.perksEarned || 0;
    }
    // Restore inventory
    if (data.inventory && Array.isArray(data.inventory)) {
        const _cloudClean = Array(INVENTORY_MAX).fill(null);
        data.inventory.forEach((it, i) => {
            if (i < INVENTORY_MAX && it && typeof it === 'object' && it.name && it.rarity && it.baseType) {
                // Skip items whose subType is a removed leg or augment key
                if (typeof REMOVED_LEGS !== 'undefined' && REMOVED_LEGS.includes(it.subType)) return;
                if (typeof REMOVED_AUGMENTS !== 'undefined' && REMOVED_AUGMENTS.includes(it.subType)) return;
                _cloudClean[i] = it;
            }
        });
        _inventory = _cloudClean;
    }
    if (data.equipped && typeof data.equipped === 'object') {
        const validSlots = ['L','R','armor','arms','legs','shield','cpu','augment'];
        const clean = { L:null, R:null, armor:null, arms:null, legs:null, shield:null, cpu:null, augment:null };
        validSlots.forEach(s => { if (data.equipped[s] && typeof data.equipped[s] === 'object' && data.equipped[s].name && data.equipped[s].rarity && data.equipped[s].baseType) clean[s] = data.equipped[s]; });
        _equipped = clean;
    }
    if (typeof data.scrap === 'number') _scrap = Math.max(0, data.scrap);
    if (typeof data.item_counter === 'number') _lootItemIdCounter = Math.max(_lootItemIdCounter, data.item_counter);
    if (typeof recalcGearStats === 'function') recalcGearStats();
    // Also save to localStorage as local cache
    try {
        saveCampaignProgress();
        if (typeof saveCampaignState === 'function') saveCampaignState();
        saveInventory();
    } catch(e) {}
    return true;
}

/** Load campaign data: cloud first, then local fallback. */
async function _loadCampaignData() {
    // Read local timestamp before hitting the network so we can compare
    let localSavedAt = 0;
    try {
        const localProgress = loadCampaignProgress();
        if (localProgress && localProgress.savedAt) localSavedAt = localProgress.savedAt;
    } catch(e) {}

    // Try cloud load
    let cloudLoaded = false;
    try {
        const cloudData = await loadFromCloud();
        if (cloudData) {
            // Only restore from cloud if it is at least as recent as the local save.
            // This prevents a stale cloud record from overwriting a newer local save
            // that was written after the last successful cloud sync.
            const cloudTs = cloudData.updated_at ? new Date(cloudData.updated_at).getTime() : 0;
            if (cloudTs >= localSavedAt) {
                cloudLoaded = _restoreFromCloudData(cloudData);
            }
        }
    } catch(e) { console.warn('Cloud load attempt failed', e); }

    if (!cloudLoaded) {
        // Fall back to localStorage
        const saved = loadCampaignProgress();
        if (saved) {
            loadout.chassis = saved.chassis || 'light';
            loadout.color   = saved.color   || 0x00ff00;
            loadout.L       = saved.L       || 'smg';
            loadout.R       = saved.R       || 'none';
            loadout.cpu     = saved.cpu     || 'none';
            const _savedAug = saved.aug || 'none';
            loadout.aug     = (typeof REMOVED_AUGMENTS !== 'undefined' && REMOVED_AUGMENTS.includes(_savedAug)) ? 'none' : _savedAug;
            const _savedLeg = saved.leg || 'none';
            loadout.leg     = (typeof REMOVED_LEGS !== 'undefined' && REMOVED_LEGS.includes(_savedLeg)) ? 'none' : _savedLeg;
            loadout.shld    = saved.shld    || 'none';
            _round          = saved.round   || 1;
            _totalKills     = saved.totalKills || 0;
            _perksEarned    = saved.perksEarned || 0;
            loadCampaignInventory();
        }
        if (typeof loadCampaignState === 'function') loadCampaignState();
    }
    // Enforce locked chassis from campaign state
    if (_campaignState.chassis) {
        loadout.chassis = _campaignState.chassis;
    }
}
