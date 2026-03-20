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
//   SKILL_TREES           — skill tree definitions per chassis (Phase 4)
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
//   getSkillTreeBonuses(chassisType) — get bonuses from chosen skills (Phase 4)
//   applySkillTreeBonuses()     — apply skill-based chassis stat bonuses (Phase 4)
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
    loadoutSlots: [],
    // Skill tree: array of chosen node IDs
    skillsChosen: []
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
function loadCampaignState() { return false; }

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
    html += `<button onclick="_closeMissionSelect()" style="position:absolute;right:0;padding:8px 18px;background:rgba(255,60,60,0.04);border:1px solid rgba(255,60,60,0.25);color:rgba(255,100,100,0.7);font-size:10px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;overflow:hidden;" onmouseover="this.style.background='rgba(255,60,60,0.12)';this.style.color='#fff';this.style.letterSpacing='4px';this.style.boxShadow='0 0 16px rgba(255,60,60,0.2)'" onmouseout="this.style.background='rgba(255,60,60,0.04)';this.style.color='rgba(255,100,100,0.7)';this.style.letterSpacing='3px';this.style.boxShadow='none'">QUIT</button>`;
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
    html += `<button onclick="_openShopFromMission()" style="flex:1;padding:10px 16px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.3);color:rgba(255,215,0,0.8);font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;text-align:center;" onmouseover="this.style.background='rgba(255,215,0,0.14)';this.style.color='#fff';this.style.letterSpacing='3px';this.style.boxShadow='0 0 12px rgba(255,215,0,0.2)'" onmouseout="this.style.background='rgba(255,215,0,0.06)';this.style.color='rgba(255,215,0,0.8)';this.style.letterSpacing='2px';this.style.boxShadow='none'">SUPPLY SHOP</button>`;
    html += `<button onclick="_showUpgradesPanel()" style="flex:1;padding:10px 16px;background:rgba(0,255,136,0.04);border:1px solid rgba(0,255,136,0.3);color:rgba(0,255,136,0.7);font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;text-align:center;" onmouseover="this.style.background='rgba(0,255,136,0.12)';this.style.color='#fff';this.style.letterSpacing='3px';this.style.boxShadow='0 0 12px rgba(0,255,136,0.2)'" onmouseout="this.style.background='rgba(0,255,136,0.04)';this.style.color='rgba(0,255,136,0.7)';this.style.letterSpacing='2px';this.style.boxShadow='none'">UPGRADES</button>`;
    html += `<button onclick="_openLoadoutFromMission()" style="flex:1;padding:10px 16px;background:rgba(0,200,255,0.04);border:1px solid rgba(0,200,255,0.3);color:rgba(0,200,255,0.7);font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;text-align:center;" onmouseover="this.style.background='rgba(0,200,255,0.12)';this.style.color='#fff';this.style.letterSpacing='3px';this.style.boxShadow='0 0 12px rgba(0,200,255,0.2)'" onmouseout="this.style.background='rgba(0,200,255,0.04)';this.style.color='rgba(0,200,255,0.7)';this.style.letterSpacing='2px';this.style.boxShadow='none'">LOADOUT</button>`;
    html += `<button onclick="showLoadoutSlots()" style="flex:1;padding:10px 16px;background:rgba(0,255,255,0.04);border:1px solid rgba(0,255,255,0.3);color:rgba(0,255,255,0.7);font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;text-align:center;" onmouseover="this.style.background='rgba(0,255,255,0.12)';this.style.color='#fff';this.style.letterSpacing='3px';this.style.boxShadow='0 0 12px rgba(0,255,255,0.2)'" onmouseout="this.style.background='rgba(0,255,255,0.04)';this.style.color='rgba(0,255,255,0.7)';this.style.letterSpacing='2px';this.style.boxShadow='none'">LOADOUT SLOTS</button>`;
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

        html += '<button onclick="_selectMission(' + idx + ')" style="display:flex;align-items:center;gap:12px;padding:12px 16px;min-height:54px;background:' + bgBase + ';border:1px solid ' + bdBase + ';border-left:3px solid ' + blBase + ';border-radius:4px;font-family:Courier New,monospace;cursor:pointer;transition:all 0.2s;text-align:left;outline:none;width:100%;' + shadowStyle + '">';

        // Mission number
        html += `<div style="font-size:18px;letter-spacing:2px;color:${completed ? '#00ff88' : 'rgba(255,215,0,0.6)'};min-width:30px;text-align:center;">${completed ? '✓' : (idx + 1)}</div>`;

        // Mission info
        html += '<div style="flex:1;min-width:0;">';
        html += `<div style="font-size:12px;letter-spacing:1px;color:${isSelected ? '#ffd700' : (completed ? 'rgba(0,255,136,0.8)' : '#c8d2d9')};margin-bottom:2px;">${m.name}</div>`;
        html += `<div style="font-size:10px;letter-spacing:0.5px;color:rgba(200,210,217,0.4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.briefing}</div>`;
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

        // ── Deploy button — right-aligned with action buttons above ──
        html += '<div style="display:flex;justify-content:flex-end;margin-top:16px;width:100%;max-width:700px;">';
        html += `<button onclick="_deployFromMissionSelect()" id="mission-deploy-btn" style="padding:10px 32px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.4);border-top:2px solid rgba(255,215,0,0.7);border-bottom:2px solid rgba(255,215,0,0.7);color:#ffd700;font-size:11px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;text-align:center;" onmouseover="this.style.background='rgba(255,215,0,0.15)';this.style.color='#fff';this.style.letterSpacing='5px';this.style.boxShadow='0 0 24px rgba(255,215,0,0.2)'" onmouseout="this.style.background='rgba(255,215,0,0.08)';this.style.color='#ffd700';this.style.letterSpacing='3px';this.style.boxShadow='none'">DEPLOY</button>`;
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
}

// ══════════════════════════════════════════════════════════════════
// ██████████████████████████████████████████████████████████████████
//  PHASE 4 — CAMPAIGN-SPECIFIC RPG FEATURES
// ██████████████████████████████████████████████████████████████████
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
// 4A — SKILL TREE UPGRADES (1 skill point per level)
// ══════════════════════════════════════════════════════════════════

/** Skill tree definitions per chassis.
 *  Each node: { id, label, desc, stats, requires, x, y }
 *  x/y are grid positions for visual tree layout (x: 0-6 columns, y: 0-9 rows).
 *  Three branches: LEFT=offense, CENTER=defense/hull, RIGHT=utility/mobility */
const SKILL_TREES = {
    // ══════════════════════════════════════════════════════════════
    // LIGHT CHASSIS — Speed, Crit, Dodge focused
    // ══════════════════════════════════════════════════════════════
    light: [
        // ── ROW 0: Entry nodes (3 branches) ──
        { id:'l_dmg1',     x:0, y:0, label:'+5% Damage',         desc:'Weapon amplifier circuit.',         stats:{ dmgMult:0.05 } },
        { id:'l_core1',    x:3, y:0, label:'+15 Core HP',        desc:'Reinforce core plating.',           stats:{ coreHP:15 } },
        { id:'l_spd1',     x:6, y:0, label:'+10 Speed',          desc:'Tune leg actuators.',               stats:{ spd:10 } },
        // ── ROW 1 ──
        { id:'l_reload1',  x:0, y:1, label:'+5% Reload',         desc:'Optimized ammo feed.',              stats:{ reloadMult:0.05 }, requires:['l_dmg1'] },
        { id:'l_crit1',    x:1, y:1, label:'+3% Crit',           desc:'Precision targeting.',              stats:{ critChance:0.03 }, requires:['l_dmg1'] },
        { id:'l_arm1',     x:2, y:1, label:'+10 Arm HP',         desc:'Reinforce arm joints.',             stats:{ armHP:10 }, requires:['l_core1'] },
        { id:'l_shld1',    x:4, y:1, label:'+8% Shield Regen',   desc:'Quick-charge capacitors.',          stats:{ shieldRegen:0.08 }, requires:['l_core1'] },
        { id:'l_dodge1',   x:5, y:1, label:'+3% Dodge',          desc:'Evasive subroutines.',              stats:{ dodgeChance:0.03 }, requires:['l_spd1'] },
        { id:'l_leg1',     x:6, y:1, label:'+10 Leg HP',         desc:'Composite leg armor.',              stats:{ legHP:10 }, requires:['l_spd1'] },
        // ── ROW 2 ──
        { id:'l_reload2',  x:0, y:2, label:'+8% Reload',         desc:'Dual-feed magazine.',               stats:{ reloadMult:0.08 }, requires:['l_reload1'] },
        { id:'l_crit2',    x:1, y:2, label:'+4% Crit',           desc:'Weak-point analyzer.',              stats:{ critChance:0.04 }, requires:['l_crit1'] },
        { id:'l_core2',    x:3, y:2, label:'+20 Core HP',        desc:'Layered core shielding.',           stats:{ coreHP:20 }, requires:['l_core1'] },
        { id:'l_dodge2',   x:5, y:2, label:'+4% Dodge',          desc:'Predictive evasion.',               stats:{ dodgeChance:0.04 }, requires:['l_dodge1'] },
        { id:'l_spd2',     x:6, y:2, label:'+12 Speed',          desc:'Advanced thrusters.',               stats:{ spd:12 }, requires:['l_spd1'] },
        // ── ROW 3 ──
        { id:'l_dmg2',     x:0, y:3, label:'+8% Damage',         desc:'Overclocked weapon rails.',         stats:{ dmgMult:0.08 }, requires:['l_reload1'] },
        { id:'l_critdmg1', x:1, y:3, label:'+20% Crit Damage',   desc:'Armor-piercing rounds.',           stats:{ critDmg:0.20 }, requires:['l_crit2'] },
        { id:'l_arm2',     x:2, y:3, label:'+15 Arm HP',         desc:'Hardened arm plating.',             stats:{ armHP:15 }, requires:['l_arm1'] },
        { id:'l_shld2',    x:4, y:3, label:'+12% Shield Regen',  desc:'Rapid-cycle shield array.',         stats:{ shieldRegen:0.12 }, requires:['l_shld1'] },
        { id:'l_leg2',     x:5, y:3, label:'+15 Leg HP',         desc:'Carbon-fiber legs.',                stats:{ legHP:15 }, requires:['l_leg1'] },
        { id:'l_spd3',     x:6, y:3, label:'+15 Speed',          desc:'Afterburner integration.',          stats:{ spd:15 }, requires:['l_spd2'] },
        // ── ROW 4 ──
        { id:'l_reload3',  x:0, y:4, label:'+10% Reload',        desc:'Neural-linked auto-loader.',        stats:{ reloadMult:0.10 }, requires:['l_reload2'] },
        { id:'l_crit3',    x:1, y:4, label:'+5% Crit',           desc:'Thermal imaging scope.',            stats:{ critChance:0.05 }, requires:['l_crit2'] },
        { id:'l_dr1',      x:3, y:4, label:'+3% DR',             desc:'Reactive nano-plating.',            stats:{ dr:0.03 }, requires:['l_core2'] },
        { id:'l_dodge3',   x:5, y:4, label:'+5% Dodge',          desc:'Phase-shift module.',               stats:{ dodgeChance:0.05 }, requires:['l_dodge2'] },
        { id:'l_mod1',     x:6, y:4, label:'-8% Mod CD',         desc:'CPU overclock.',                    stats:{ modCdMult:0.08 }, requires:['l_spd3'] },
        // ── ROW 5 ──
        { id:'l_dmg3',     x:0, y:5, label:'+10% Damage',        desc:'Supercharged weapon cores.',        stats:{ dmgMult:0.10 }, requires:['l_dmg2'] },
        { id:'l_critdmg2', x:1, y:5, label:'+30% Crit Damage',   desc:'Devastator rounds.',               stats:{ critDmg:0.30 }, requires:['l_critdmg1'] },
        { id:'l_core3',    x:3, y:5, label:'+25 Core HP',        desc:'Reinforced inner hull.',            stats:{ coreHP:25 }, requires:['l_core2','l_dr1'] },
        { id:'l_spd4',     x:5, y:5, label:'+18 Speed',          desc:'Quantum thrusters.',                stats:{ spd:18 }, requires:['l_dodge3'] },
        { id:'l_mod2',     x:6, y:5, label:'-12% Mod CD',        desc:'Quantum processing unit.',          stats:{ modCdMult:0.12 }, requires:['l_mod1'] },
        // ── ROW 6 ──
        { id:'l_dmg4',     x:0, y:6, label:'+12% Damage',        desc:'Hypervelocity barrels.',            stats:{ dmgMult:0.12 }, requires:['l_dmg3'] },
        { id:'l_crit4',    x:1, y:6, label:'+6% Crit',           desc:'Neural-linked targeting.',          stats:{ critChance:0.06 }, requires:['l_crit3','l_critdmg1'] },
        { id:'l_all1',     x:3, y:6, label:'+20 All HP',         desc:'Full chassis reinforcement.',       stats:{ coreHP:20, armHP:12, legHP:12 }, requires:['l_core3','l_arm2'] },
        { id:'l_dodge4',   x:5, y:6, label:'+6% Dodge',          desc:'Ghost-frame modification.',         stats:{ dodgeChance:0.06 }, requires:['l_dodge3','l_spd4'] },
        { id:'l_spd5',     x:6, y:6, label:'+20 Speed',          desc:'Experimental drive system.',        stats:{ spd:20 }, requires:['l_spd4'] },
        // ── ROW 7: Capstones ──
        { id:'l_glass',    x:0, y:7, label:'Glass Cannon',       desc:'+15% Dmg, +10% Crit, -25 Core HP.', stats:{ dmgMult:0.15, critChance:0.10, coreHP:-25 }, requires:['l_dmg4'] },
        { id:'l_lethal',   x:1, y:7, label:'Lethal Precision',   desc:'+8% Crit, +40% Crit Damage.',      stats:{ critChance:0.08, critDmg:0.40 }, requires:['l_crit4','l_critdmg2'] },
        { id:'l_titan',    x:3, y:7, label:'Titanium Frame',     desc:'+30 Core, +20 Arm, +5% DR.',       stats:{ coreHP:30, armHP:20, dr:0.05 }, requires:['l_all1'] },
        { id:'l_ghost',    x:5, y:7, label:'Ghost Protocol',     desc:'+8% Dodge, +25 Speed.',             stats:{ dodgeChance:0.08, spd:25 }, requires:['l_dodge4','l_spd5'] },
        { id:'l_apex',     x:6, y:7, label:'Apex Striker',       desc:'-15% Mod CD, +10% Reload.',        stats:{ modCdMult:0.15, reloadMult:0.10 }, requires:['l_mod2'] },
    ],
    // ══════════════════════════════════════════════════════════════
    // MEDIUM CHASSIS — Balanced, Mod Cooldown, Versatility
    // ══════════════════════════════════════════════════════════════
    medium: [
        // ── ROW 0 ──
        { id:'m_dmg1',     x:0, y:0, label:'+5% Damage',         desc:'Weapon calibration suite.',         stats:{ dmgMult:0.05 } },
        { id:'m_core1',    x:3, y:0, label:'+20 Core HP',        desc:'Reinforce core hull.',              stats:{ coreHP:20 } },
        { id:'m_mod1',     x:6, y:0, label:'-5% Mod CD',         desc:'Efficient CPU thermals.',           stats:{ modCdMult:0.05 } },
        // ── ROW 1 ──
        { id:'m_reload1',  x:0, y:1, label:'+6% Reload',         desc:'Optimized ammo rack.',              stats:{ reloadMult:0.06 }, requires:['m_dmg1'] },
        { id:'m_crit1',    x:1, y:1, label:'+3% Crit',           desc:'Targeting algorithms.',             stats:{ critChance:0.03 }, requires:['m_dmg1'] },
        { id:'m_arm1',     x:2, y:1, label:'+12 Arm HP',         desc:'Servo-assisted joints.',            stats:{ armHP:12 }, requires:['m_core1'] },
        { id:'m_shld1',    x:4, y:1, label:'+8% Shield Regen',   desc:'Shield capacitor upgrade.',         stats:{ shieldRegen:0.08 }, requires:['m_core1'] },
        { id:'m_spd1',     x:5, y:1, label:'+8 Speed',           desc:'Balanced thruster output.',          stats:{ spd:8 }, requires:['m_mod1'] },
        { id:'m_mod2',     x:6, y:1, label:'-8% Mod CD',         desc:'Dual-core CPU module.',             stats:{ modCdMult:0.08 }, requires:['m_mod1'] },
        // ── ROW 2 ──
        { id:'m_dmg2',     x:0, y:2, label:'+8% Damage',         desc:'Weapon rail overcharge.',           stats:{ dmgMult:0.08 }, requires:['m_dmg1'] },
        { id:'m_crit2',    x:1, y:2, label:'+4% Crit',           desc:'Weak-point scanner.',               stats:{ critChance:0.04 }, requires:['m_crit1'] },
        { id:'m_core2',    x:3, y:2, label:'+25 Core HP',        desc:'Composite core plating.',           stats:{ coreHP:25 }, requires:['m_core1'] },
        { id:'m_leg1',     x:5, y:2, label:'+15 Leg HP',         desc:'Reinforced leg struts.',            stats:{ legHP:15 }, requires:['m_spd1'] },
        { id:'m_spd2',     x:6, y:2, label:'+10 Speed',          desc:'Thrust vectoring.',                  stats:{ spd:10 }, requires:['m_spd1'] },
        // ── ROW 3 ──
        { id:'m_reload2',  x:0, y:3, label:'+8% Reload',         desc:'Auto-loading mechanism.',           stats:{ reloadMult:0.08 }, requires:['m_reload1'] },
        { id:'m_critdmg1', x:1, y:3, label:'+20% Crit Damage',   desc:'Penetrator rounds.',               stats:{ critDmg:0.20 }, requires:['m_crit2'] },
        { id:'m_dr1',      x:2, y:3, label:'+3% DR',             desc:'Ablative armor coating.',           stats:{ dr:0.03 }, requires:['m_arm1'] },
        { id:'m_shld2',    x:4, y:3, label:'+12% Shield Regen',  desc:'Rapid-cycle array.',                stats:{ shieldRegen:0.12 }, requires:['m_shld1'] },
        { id:'m_arm2',     x:3, y:3, label:'+15 Arm HP',         desc:'Titanium arm plating.',             stats:{ armHP:15 }, requires:['m_arm1'] },
        { id:'m_mod3',     x:6, y:3, label:'-10% Mod CD',        desc:'Overclocked processor.',            stats:{ modCdMult:0.10 }, requires:['m_mod2'] },
        // ── ROW 4 ──
        { id:'m_dmg3',     x:0, y:4, label:'+10% Damage',        desc:'Overclocked weapons.',              stats:{ dmgMult:0.10 }, requires:['m_dmg2'] },
        { id:'m_crit3',    x:1, y:4, label:'+5% Crit',           desc:'Combat analytics AI.',              stats:{ critChance:0.05 }, requires:['m_crit2'] },
        { id:'m_core3',    x:3, y:4, label:'+30 Core HP',        desc:'Layered composite hull.',           stats:{ coreHP:30 }, requires:['m_core2'] },
        { id:'m_dodge1',   x:5, y:4, label:'+3% Dodge',          desc:'Reactive maneuver jets.',           stats:{ dodgeChance:0.03 }, requires:['m_leg1'] },
        { id:'m_mod4',     x:6, y:4, label:'-12% Mod CD',        desc:'Quantum processor.',                stats:{ modCdMult:0.12 }, requires:['m_mod3'] },
        // ── ROW 5 ──
        { id:'m_reload3',  x:0, y:5, label:'+10% Reload',        desc:'Neural auto-loader.',               stats:{ reloadMult:0.10 }, requires:['m_reload2'] },
        { id:'m_critdmg2', x:1, y:5, label:'+25% Crit Damage',   desc:'Armor-piercing sabot.',            stats:{ critDmg:0.25 }, requires:['m_critdmg1'] },
        { id:'m_dr2',      x:2, y:5, label:'+4% DR',             desc:'Active armor response.',            stats:{ dr:0.04 }, requires:['m_dr1'] },
        { id:'m_shld3',    x:4, y:5, label:'+15% Shield Regen',  desc:'Overcharged shield core.',          stats:{ shieldRegen:0.15 }, requires:['m_shld2'] },
        { id:'m_leg2',     x:5, y:5, label:'+20 Leg HP',         desc:'Armored leg housing.',              stats:{ legHP:20 }, requires:['m_leg1'] },
        { id:'m_spd3',     x:6, y:5, label:'+12 Speed',          desc:'Advanced drive system.',            stats:{ spd:12 }, requires:['m_spd2'] },
        // ── ROW 6 ──
        { id:'m_dmg4',     x:0, y:6, label:'+12% Damage',        desc:'Supercharged rails.',               stats:{ dmgMult:0.12 }, requires:['m_dmg3'] },
        { id:'m_crit4',    x:1, y:6, label:'+6% Crit',           desc:'Neural-linked precision.',          stats:{ critChance:0.06 }, requires:['m_crit3'] },
        { id:'m_all1',     x:3, y:6, label:'+15 All HP, +5 Spd', desc:'Balanced systems upgrade.',         stats:{ coreHP:15, armHP:12, legHP:12, spd:5 }, requires:['m_core3','m_arm2'] },
        { id:'m_dodge2',   x:5, y:6, label:'+4% Dodge',          desc:'Predictive evasion.',               stats:{ dodgeChance:0.04 }, requires:['m_dodge1'] },
        { id:'m_mod5',     x:6, y:6, label:'-15% Mod CD',        desc:'Experimental AI core.',             stats:{ modCdMult:0.15 }, requires:['m_mod4'] },
        // ── ROW 7: Capstones ──
        { id:'m_war',      x:0, y:7, label:'War Machine',        desc:'+15% Dmg, +8% Crit, +10% Reload.', stats:{ dmgMult:0.15, critChance:0.08, reloadMult:0.10 }, requires:['m_dmg4','m_crit4'] },
        { id:'m_bastion',  x:2, y:7, label:'Bastion',            desc:'+6% DR, +35 Core HP.',             stats:{ dr:0.06, coreHP:35 }, requires:['m_dr2','m_core3'] },
        { id:'m_sentinel', x:4, y:7, label:'Sentinel',           desc:'+20% Shield Regen, +5% Dodge.',    stats:{ shieldRegen:0.20, dodgeChance:0.05 }, requires:['m_shld3','m_dodge2'] },
        { id:'m_apex',     x:6, y:7, label:'Apex Commander',     desc:'-20% Mod CD, +15 Speed.',          stats:{ modCdMult:0.20, spd:15 }, requires:['m_mod5'] },
    ],
    // ══════════════════════════════════════════════════════════════
    // HEAVY CHASSIS — HP, DR, Blast Radius focused
    // ══════════════════════════════════════════════════════════════
    heavy: [
        // ── ROW 0 ──
        { id:'h_dmg1',     x:0, y:0, label:'+5% Damage',         desc:'Heavy weapon mounts.',              stats:{ dmgMult:0.05 } },
        { id:'h_core1',    x:3, y:0, label:'+30 Core HP',        desc:'Thick core armor.',                 stats:{ coreHP:30 } },
        { id:'h_dr1',      x:6, y:0, label:'+2% DR',             desc:'Layered reactive plating.',         stats:{ dr:0.02 } },
        // ── ROW 1 ──
        { id:'h_blast1',   x:0, y:1, label:'+8% Blast Radius',   desc:'Expanded warheads.',                stats:{ blastMult:0.08 }, requires:['h_dmg1'] },
        { id:'h_reload1',  x:1, y:1, label:'+5% Reload',         desc:'Hydraulic auto-loader.',            stats:{ reloadMult:0.05 }, requires:['h_dmg1'] },
        { id:'h_arm1',     x:2, y:1, label:'+15 Arm HP',         desc:'Reinforced arm housing.',           stats:{ armHP:15 }, requires:['h_core1'] },
        { id:'h_shld1',    x:4, y:1, label:'+8% Shield Regen',   desc:'Shield capacitors.',                stats:{ shieldRegen:0.08 }, requires:['h_core1'] },
        { id:'h_leg1',     x:5, y:1, label:'+15 Leg HP',         desc:'Heavy-duty actuators.',             stats:{ legHP:15 }, requires:['h_dr1'] },
        { id:'h_dr2',      x:6, y:1, label:'+3% DR',             desc:'Active armor response.',            stats:{ dr:0.03 }, requires:['h_dr1'] },
        // ── ROW 2 ──
        { id:'h_dmg2',     x:0, y:2, label:'+8% Damage',         desc:'Heavy bore calibration.',           stats:{ dmgMult:0.08 }, requires:['h_dmg1'] },
        { id:'h_blast2',   x:1, y:2, label:'+10% Blast Radius',  desc:'Cluster munitions.',                stats:{ blastMult:0.10 }, requires:['h_blast1'] },
        { id:'h_core2',    x:3, y:2, label:'+35 Core HP',        desc:'Reinforced inner hull.',            stats:{ coreHP:35 }, requires:['h_core1'] },
        { id:'h_spd1',     x:5, y:2, label:'+6 Speed',           desc:'Improved hydraulics.',              stats:{ spd:6 }, requires:['h_leg1'] },
        { id:'h_dr3',      x:6, y:2, label:'+4% DR',             desc:'Composite ablative layers.',        stats:{ dr:0.04 }, requires:['h_dr2'] },
        // ── ROW 3 ──
        { id:'h_dmg3',     x:0, y:3, label:'+10% Damage',        desc:'Overcharged weapon rails.',         stats:{ dmgMult:0.10 }, requires:['h_dmg2'] },
        { id:'h_crit1',    x:1, y:3, label:'+3% Crit',           desc:'Heavy targeting system.',           stats:{ critChance:0.03 }, requires:['h_reload1'] },
        { id:'h_arm2',     x:2, y:3, label:'+20 Arm HP',         desc:'Siege-grade arm plating.',          stats:{ armHP:20 }, requires:['h_arm1'] },
        { id:'h_shld2',    x:4, y:3, label:'+12% Shield Regen',  desc:'Reinforced shield core.',           stats:{ shieldRegen:0.12 }, requires:['h_shld1'] },
        { id:'h_leg2',     x:5, y:3, label:'+20 Leg HP',         desc:'Armored leg housing.',              stats:{ legHP:20 }, requires:['h_leg1'] },
        { id:'h_core3',    x:3, y:3, label:'+40 Core HP',        desc:'Titan-class hull.',                 stats:{ coreHP:40 }, requires:['h_core2'] },
        // ── ROW 4 ──
        { id:'h_blast3',   x:0, y:4, label:'+12% Blast Radius',  desc:'High-yield warheads.',              stats:{ blastMult:0.12 }, requires:['h_blast2'] },
        { id:'h_reload2',  x:1, y:4, label:'+8% Reload',         desc:'Motorized ammo belt.',              stats:{ reloadMult:0.08 }, requires:['h_reload1'] },
        { id:'h_dr4',      x:3, y:4, label:'+5% DR',             desc:'Nanite repair armor.',              stats:{ dr:0.05 }, requires:['h_core3','h_dr3'] },
        { id:'h_spd2',     x:5, y:4, label:'+8 Speed',           desc:'Reinforced drive train.',           stats:{ spd:8 }, requires:['h_spd1'] },
        { id:'h_mod1',     x:6, y:4, label:'-8% Mod CD',         desc:'Heavy processor upgrade.',          stats:{ modCdMult:0.08 }, requires:['h_dr3'] },
        // ── ROW 5 ──
        { id:'h_dmg4',     x:0, y:5, label:'+12% Damage',        desc:'Supercharged weapon cores.',        stats:{ dmgMult:0.12 }, requires:['h_dmg3'] },
        { id:'h_crit2',    x:1, y:5, label:'+4% Crit',           desc:'Structural analyzer.',              stats:{ critChance:0.04 }, requires:['h_crit1'] },
        { id:'h_all1',     x:2, y:5, label:'+20 All HP',         desc:'Full chassis reinforcement.',       stats:{ coreHP:20, armHP:15, legHP:15 }, requires:['h_arm2','h_leg2'] },
        { id:'h_core4',    x:3, y:5, label:'+50 Core HP',        desc:'Fortress-class hull.',              stats:{ coreHP:50 }, requires:['h_core3'] },
        { id:'h_shld3',    x:4, y:5, label:'+15% Shield Regen',  desc:'Overcharged shield array.',         stats:{ shieldRegen:0.15 }, requires:['h_shld2'] },
        { id:'h_mod2',     x:6, y:5, label:'-12% Mod CD',        desc:'Tactical processor.',               stats:{ modCdMult:0.12 }, requires:['h_mod1'] },
        // ── ROW 6 ──
        { id:'h_blast4',   x:0, y:6, label:'+15% Blast Radius',  desc:'Tactical warhead system.',          stats:{ blastMult:0.15 }, requires:['h_blast3'] },
        { id:'h_dmg5',     x:1, y:6, label:'+15% Damage',        desc:'Devastator weapon package.',        stats:{ dmgMult:0.15 }, requires:['h_dmg4','h_crit2'] },
        { id:'h_dr5',      x:3, y:6, label:'+6% DR',             desc:'Adaptive nano-armor.',              stats:{ dr:0.06 }, requires:['h_dr4'] },
        { id:'h_all2',     x:5, y:6, label:'+25 All HP, +5 Spd', desc:'Titan systems upgrade.',            stats:{ coreHP:25, armHP:15, legHP:15, spd:5 }, requires:['h_all1','h_spd2'] },
        { id:'h_repair1',  x:6, y:6, label:'+2 Auto-Repair',     desc:'Nanite repair system.',             stats:{ autoRepair:2 }, requires:['h_mod2'] },
        // ── ROW 7: Capstones ──
        { id:'h_siege',    x:0, y:7, label:'Siege Artillery',    desc:'+18% Dmg, +20% Blast Radius.',     stats:{ dmgMult:0.18, blastMult:0.20 }, requires:['h_blast4','h_dmg5'] },
        { id:'h_jugg',     x:3, y:7, label:'Juggernaut',         desc:'+8% DR, +60 Core HP.',             stats:{ dr:0.08, coreHP:60 }, requires:['h_dr5','h_core4'] },
        { id:'h_titan',    x:5, y:7, label:'Titan',              desc:'+30 All HP, +8 Spd, +3 Repair.',   stats:{ coreHP:30, armHP:20, legHP:20, spd:8, autoRepair:3 }, requires:['h_all2','h_repair1'] },
    ]
};

/** Get available skill points = playerLevel - 1 (level 1 has 0 points). */
function getAvailableSkillPoints() {
    const total = Math.max(0, _campaignState.playerLevel - 1);
    const spent = (_campaignState.skillsChosen || []).length;
    return total - spent;
}

/** Check if a skill node's prerequisites are met. */
function _skillNodeAvailable(nodeId, chassisType) {
    const tree = SKILL_TREES[chassisType];
    if (!tree) return false;
    const node = tree.find(n => n.id === nodeId);
    if (!node) return false;
    const chosen = _campaignState.skillsChosen || [];
    if (chosen.includes(nodeId)) return false; // already purchased
    if (!node.requires) return true; // tier 1 nodes have no requirements
    return node.requires.every(reqId => chosen.includes(reqId));
}

/** Purchase a skill node. */
function purchaseSkillNode(nodeId) {
    const chassisType = _campaignState.chassis;
    if (!chassisType) return false;
    if (getAvailableSkillPoints() <= 0) return false;
    if (!_skillNodeAvailable(nodeId, chassisType)) return false;
    if (!_campaignState.skillsChosen) _campaignState.skillsChosen = [];
    _campaignState.skillsChosen.push(nodeId);
    saveCampaignState();
    return true;
}

/** Compute total stat bonuses from all chosen skill nodes.
 *  Returns { coreHP, armHP, legHP, spd, dmgMult, reloadMult, critChance,
 *            shieldRegen, blastMult, dodgeChance, dr, modCdMult } */
function getSkillTreeBonuses(chassisType) {
    const bonuses = { coreHP:0, armHP:0, legHP:0, spd:0, dmgMult:0, reloadMult:0,
                      critChance:0, critDmg:0, shieldRegen:0, blastMult:0, dodgeChance:0,
                      dr:0, modCdMult:0, autoRepair:0 };
    const tree = SKILL_TREES[chassisType];
    if (!tree) return bonuses;
    const chosen = _campaignState.skillsChosen || [];
    for (const nodeId of chosen) {
        const node = tree.find(n => n.id === nodeId);
        if (!node) continue;
        for (const [k, v] of Object.entries(node.stats)) {
            bonuses[k] = (bonuses[k] || 0) + v;
        }
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

/** Apply skill tree upgrades to the CHASSIS object.
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
    }
    // Apply skill tree bonuses only to the player's chosen chassis
    const ch = _campaignState.chassis;
    if (ch && CHASSIS[ch]) {
        const bonuses = getSkillTreeBonuses(ch);
        CHASSIS[ch].coreHP += bonuses.coreHP;
        CHASSIS[ch].armHP  += bonuses.armHP;
        CHASSIS[ch].legHP  += bonuses.legHP;
        CHASSIS[ch].spd    += bonuses.spd;
    }
}

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

/** Currently selected shop item index (null = none). */
let _selectedShopIdx = null;

/** Stat display names for comparison panel. */
const _shopStatNames = {
    dmgFlat:'Flat Damage', dmgPct:'Damage %', critChance:'Crit %', critDmg:'Crit Dmg %',
    reloadPct:'Reload Spd %', coreHP:'Core HP', armHP:'Arm HP', legHP:'Leg HP', allHP:'All HP',
    dr:'Dmg Reduction', shieldHP:'Shield HP', shieldRegen:'Shield Regen %', absorbPct:'Absorb %',
    dodgePct:'Dodge %', speedPct:'Move Speed %', modCdPct:'Mod CD %', modEffPct:'Mod Eff %',
    lootMult:'Loot Quality %', autoRepair:'Auto Repair', pellets:'Pellets', splashRadius:'Blast Radius %',
    accuracy:'Accuracy', dmg:'Damage', reload:'Reload (ms)'
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

    const rarityColors = {
        common: '#c0c8d0', uncommon: '#00ff44', rare: '#4488ff',
        epic: '#aa44ff', legendary: '#ffd700'
    };

    let html = '';
    html += '<div style="font-size:28px;letter-spacing:6px;color:#ffd700;text-shadow:0 0 20px rgba(255,215,0,0.5);margin-bottom:4px;">SUPPLY SHOP</div>';
    html += `<div style="font-size:12px;letter-spacing:2px;color:rgba(255,215,0,0.6);margin-bottom:20px;">SCRAP: <span style="color:#ffd700;">${_scrap}</span></div>`;

    // ── BUY SECTION ──
    html += '<div style="font-size:13px;letter-spacing:3px;color:rgba(0,255,255,0.7);margin-bottom:10px;">BUY</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;max-width:700px;">';
    if (_shopStock.length === 0) {
        html += '<div style="font-size:11px;color:rgba(200,210,217,0.4);letter-spacing:1px;">No items in stock. Complete a mission to restock.</div>';
    }
    _shopStock.forEach((item, idx) => {
        const rc = rarityColors[item.rarity] || '#c0c8d0';
        const isSelected = (_selectedShopIdx === idx);
        const bgBase = isSelected ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.03)';
        const bdBase = isSelected ? `${rc}` : `${rc}40`;
        const shadowStyle = isSelected ? `box-shadow:0 0 12px ${rc}33;` : '';
        html += `<button onclick="_shopSelect(${idx})" style="width:155px;padding:10px;background:${bgBase};border:1px solid ${bdBase};border-left:3px solid ${rc};border-radius:4px;font-family:'Courier New',monospace;cursor:pointer;text-align:left;transition:all 0.2s;${shadowStyle}" onmouseover="this.style.background='rgba(255,215,0,0.06)'" onmouseout="this.style.background='${bgBase}'">`;
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

    // ── SELECTED ITEM DETAIL + COMPARISON ──
    if (_selectedShopIdx !== null && _selectedShopIdx < _shopStock.length) {
        const selItem = _shopStock[_selectedShopIdx];
        const rc = rarityColors[selItem.rarity] || '#c0c8d0';
        const canBuy = _scrap >= selItem._shopPrice && _inventory.length < (typeof INVENTORY_MAX !== 'undefined' ? INVENTORY_MAX : 30);

        html += `<div style="margin-bottom:16px;padding:14px 18px;background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.15);border-left:3px solid ${rc};border-radius:4px;width:100%;max-width:700px;">`;
        html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">`;
        html += `<div><span style="font-size:13px;letter-spacing:2px;color:${rc};">${selItem.name || 'Item'}</span>`;
        html += `<span style="font-size:9px;color:rgba(200,210,217,0.5);margin-left:10px;">${(selItem.rarity||'').toUpperCase()} LV.${selItem.level||1}</span></div>`;
        html += `<div style="font-size:13px;letter-spacing:1px;color:#ffd700;">⬡ ${selItem._shopPrice}</div>`;
        html += `</div>`;

        // Stat comparison with equipped item
        const slotKey = typeof _getSlotForItem === 'function' ? _getSlotForItem(selItem) : null;
        const equippedItem = (slotKey && typeof _equipped !== 'undefined') ? _equipped[slotKey] : null;
        const newStats = _shopItemTotal(selItem);
        const oldStats = equippedItem ? _shopItemTotal(equippedItem) : {};
        const allKeys = new Set([...Object.keys(newStats), ...Object.keys(oldStats)]);

        if (allKeys.size > 0) {
            html += `<div style="display:grid;grid-template-columns:1fr auto auto auto;gap:2px 12px;font-size:11px;margin-bottom:10px;">`;
            html += `<div style="color:rgba(200,210,220,0.35);letter-spacing:1px;">STAT</div>`;
            html += `<div style="color:rgba(200,210,220,0.35);letter-spacing:1px;text-align:right;">${equippedItem ? 'EQUIPPED' : ''}</div>`;
            html += `<div style="color:rgba(200,210,220,0.35);letter-spacing:1px;text-align:right;">NEW</div>`;
            html += `<div style="color:rgba(200,210,220,0.35);letter-spacing:1px;text-align:right;">${equippedItem ? 'DIFF' : ''}</div>`;
            allKeys.forEach(k => {
                const o = oldStats[k] || 0;
                const n = newStats[k] || 0;
                if (o === 0 && n === 0) return;
                const diff = n - o;
                const diffColor = diff > 0 ? '#44ff88' : diff < 0 ? '#ff5050' : 'rgba(200,210,220,0.5)';
                const diffStr = equippedItem ? (diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '—') : '';
                html += `<div style="color:rgba(200,210,220,0.6);">${_shopStatNames[k] || k}</div>`;
                html += `<div style="text-align:right;color:rgba(200,210,220,0.5);">${equippedItem ? o : ''}</div>`;
                html += `<div style="text-align:right;color:rgba(200,210,220,0.9);">${n}</div>`;
                html += `<div style="text-align:right;color:${diffColor};font-weight:bold;">${diffStr}</div>`;
            });
            html += `</div>`;
            if (equippedItem) {
                html += `<div style="font-size:9px;color:rgba(200,210,217,0.35);margin-bottom:8px;">Comparing to: ${equippedItem.name || 'equipped item'} (${slotKey})</div>`;
            } else if (slotKey) {
                html += `<div style="font-size:9px;color:rgba(200,210,217,0.35);margin-bottom:8px;">Slot: ${slotKey.toUpperCase()} (nothing equipped)</div>`;
            }
        }

        // BUY button
        if (canBuy) {
            html += `<button onclick="_shopBuy(${_selectedShopIdx})" style="padding:8px 28px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.4);border-top:2px solid rgba(255,215,0,0.7);border-bottom:2px solid rgba(255,215,0,0.7);color:#ffd700;font-size:11px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;text-transform:uppercase;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,215,0,0.15)';this.style.color='#fff';this.style.letterSpacing='4px';this.style.boxShadow='0 0 16px rgba(255,215,0,0.2)'" onmouseout="this.style.background='rgba(255,215,0,0.08)';this.style.color='#ffd700';this.style.letterSpacing='3px';this.style.boxShadow='none'">BUY — ⬡ ${selItem._shopPrice}</button>`;
        } else {
            const reason = _scrap < selItem._shopPrice ? 'Not enough scrap' : 'Inventory full';
            html += `<div style="font-size:10px;color:rgba(255,100,100,0.6);letter-spacing:1px;">${reason}</div>`;
        }
        html += '</div>';
    }

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
    html += `<button onclick="${canRestock ? '_shopRestock()' : ''}" style="padding:10px 24px;background:rgba(0,255,255,0.04);border:1px solid rgba(0,255,255,${canRestock?'0.4':'0.15'});color:${canRestock?'rgba(0,255,255,0.85)':'rgba(0,255,255,0.3)'};font-size:11px;letter-spacing:2px;font-family:'Courier New',monospace;cursor:${canRestock?'pointer':'not-allowed'};transition:all 0.2s;" ${canRestock?`onmouseover="this.style.background='rgba(0,255,255,0.1)';this.style.color='#fff';this.style.letterSpacing='3px';this.style.boxShadow='0 0 12px rgba(0,255,255,0.2)'" onmouseout="this.style.background='rgba(0,255,255,0.04)';this.style.color='rgba(0,255,255,0.85)';this.style.letterSpacing='2px';this.style.boxShadow='none'"`:''}>RESTOCK ⬡ ${restockCost}</button>`;
    html += `<button onclick="_closeShop()" style="padding:10px 32px;background:rgba(255,60,60,0.04);border:1px solid rgba(255,60,60,0.3);color:rgba(255,100,100,0.85);font-size:11px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,60,60,0.12)';this.style.color='#fff';this.style.letterSpacing='4px';this.style.boxShadow='0 0 16px rgba(255,60,60,0.2)'" onmouseout="this.style.background='rgba(255,60,60,0.04)';this.style.color='rgba(255,100,100,0.85)';this.style.letterSpacing='3px';this.style.boxShadow='none'">BACK</button>`;
    html += '</div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
}

/** Select a shop item (highlight, show details). */
function _shopSelect(idx) {
    _selectedShopIdx = (_selectedShopIdx === idx) ? null : idx; // toggle
    showShop();
}

function _shopBuy(idx) {
    if (shopBuyItem(idx)) {
        _selectedShopIdx = null;
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
    _selectedShopIdx = null;
    refreshShopStock();
    showShop();
}

function _closeShop() {
    _selectedShopIdx = null;
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
    html += `<button onclick="_closeLoadoutSlots()" style="padding:12px 32px;background:rgba(255,60,60,0.04);border:1px solid rgba(255,60,60,0.3);color:rgba(255,100,100,0.85);font-size:12px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,60,60,0.12)';this.style.color='#fff';this.style.letterSpacing='4px';this.style.boxShadow='0 0 16px rgba(255,60,60,0.2)'" onmouseout="this.style.background='rgba(255,60,60,0.04)';this.style.color='rgba(255,100,100,0.85)';this.style.letterSpacing='3px';this.style.boxShadow='none'">BACK</button>`;
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
            skillsChosen: _campaignState.skillsChosen || [],
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
            _campaignState.skillsChosen = state.skillsChosen || [];
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

    const ch = _campaignState.chassis || 'medium';
    const level = _campaignState.playerLevel;
    const cc = ch === 'light' ? '#88ff88' : ch === 'medium' ? '#ffcc44' : '#ff8844';
    const tree = SKILL_TREES[ch] || [];
    const chosen = _campaignState.skillsChosen || [];
    const availPts = getAvailableSkillPoints();

    // Tree layout dimensions
    const COLS = 7, NODE_W = 96, NODE_H = 52, GAP_X = 12, GAP_Y = 14;
    const maxRow = Math.max(...tree.map(n => n.y));
    const gridW = COLS * (NODE_W + GAP_X) - GAP_X;
    const gridH = (maxRow + 1) * (NODE_H + GAP_Y) - GAP_Y;

    // Node center positions for SVG lines
    const nodePos = {};
    for (const n of tree) {
        nodePos[n.id] = {
            cx: n.x * (NODE_W + GAP_X) + NODE_W / 2,
            cy: n.y * (NODE_H + GAP_Y) + NODE_H / 2
        };
    }

    let html = '';
    html += `<div style="font-size:24px;letter-spacing:6px;color:${cc};text-shadow:0 0 16px ${cc}80;margin-bottom:4px;">SKILL TREE</div>`;
    html += `<div style="font-size:11px;letter-spacing:2px;color:${cc}88;margin-bottom:4px;">${ch.toUpperCase()} CHASSIS — PILOT LEVEL ${level}</div>`;
    html += `<div style="font-size:12px;letter-spacing:2px;color:${availPts > 0 ? '#ffd700' : 'rgba(200,210,217,0.4)'};margin-bottom:16px;">SKILL POINTS: <span style="font-size:14px;">${availPts}</span></div>`;

    // Tree container with relative positioning
    html += `<div style="position:relative;width:${gridW}px;height:${gridH}px;margin-bottom:16px;">`;

    // SVG layer for connecting lines
    html += `<svg style="position:absolute;inset:0;width:${gridW}px;height:${gridH}px;pointer-events:none;z-index:0;">`;
    for (const node of tree) {
        if (!node.requires) continue;
        const to = nodePos[node.id];
        for (const reqId of node.requires) {
            const from = nodePos[reqId];
            if (!from || !to) continue;
            const bothOwned = chosen.includes(node.id) && chosen.includes(reqId);
            const oneOwned = chosen.includes(reqId);
            const lineColor = bothOwned ? cc : oneOwned ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.08)';
            html += `<line x1="${from.cx}" y1="${from.cy}" x2="${to.cx}" y2="${to.cy}" stroke="${lineColor}" stroke-width="${bothOwned ? 2 : 1}" />`;
        }
    }
    html += '</svg>';

    // Node elements
    for (const node of tree) {
        const owned = chosen.includes(node.id);
        const canBuy = !owned && availPts > 0 && _skillNodeAvailable(node.id, ch);
        const locked = !owned && !canBuy;
        const left = node.x * (NODE_W + GAP_X);
        const top = node.y * (NODE_H + GAP_Y);

        let borderColor, textColor, bg, labelIcon;
        if (owned) {
            borderColor = cc; textColor = cc; bg = `${cc}18`; labelIcon = '✓';
        } else if (canBuy) {
            borderColor = '#ffd700'; textColor = '#ffd700'; bg = 'rgba(255,215,0,0.06)'; labelIcon = '●';
        } else {
            borderColor = 'rgba(255,255,255,0.08)'; textColor = 'rgba(200,210,217,0.25)'; bg = 'rgba(0,0,0,0.3)'; labelIcon = '🔒';
        }

        const onclick = canBuy ? `onclick="_buySkillNode('${node.id}')"` : '';
        const cursor = canBuy ? 'pointer' : 'default';
        const shadowStyle = owned ? `box-shadow:0 0 8px ${cc}33;` : canBuy ? 'box-shadow:0 0 8px rgba(255,215,0,0.15);' : '';

        html += `<div ${onclick} title="${node.desc}" style="position:absolute;left:${left}px;top:${top}px;width:${NODE_W}px;height:${NODE_H}px;padding:4px 6px;background:${bg};border:1px solid ${borderColor};border-radius:4px;cursor:${cursor};transition:all 0.2s;z-index:1;overflow:hidden;box-sizing:border-box;${shadowStyle}" ${canBuy ? `onmouseover="this.style.background='rgba(255,215,0,0.12)';this.style.boxShadow='0 0 12px rgba(255,215,0,0.25)'" onmouseout="this.style.background='${bg}';this.style.boxShadow='${canBuy ? '0 0 8px rgba(255,215,0,0.15)' : 'none'}'"` : ''}>`;
        html += `<div style="font-size:8px;letter-spacing:0.5px;color:${textColor};margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${labelIcon} ${node.label}</div>`;
        html += `<div style="font-size:7px;color:${owned ? 'rgba(200,210,217,0.5)' : 'rgba(200,210,217,0.25)'};line-height:1.3;overflow:hidden;max-height:30px;">${node.desc}</div>`;
        html += '</div>';
    }
    html += '</div>'; // end tree container

    // Summary of current bonuses
    const bonuses = getSkillTreeBonuses(ch);
    const activeStats = Object.entries(bonuses).filter(([k, v]) => v !== 0);
    if (activeStats.length > 0) {
        html += `<div style="padding:10px 14px;background:rgba(0,255,255,0.03);border:1px solid rgba(0,255,255,0.1);border-radius:4px;max-width:${gridW}px;margin-bottom:12px;">`;
        html += '<div style="font-size:9px;letter-spacing:2px;color:rgba(0,255,255,0.4);margin-bottom:6px;">ACTIVE BONUSES</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        const statLabels = { coreHP:'Core HP', armHP:'Arm HP', legHP:'Leg HP', spd:'Speed',
            dmgMult:'Damage', reloadMult:'Reload Spd', critChance:'Crit Chance', critDmg:'Crit Damage',
            shieldRegen:'Shield Regen', blastMult:'Blast Radius', dodgeChance:'Dodge',
            dr:'Dmg Reduction', modCdMult:'Mod Cooldown', autoRepair:'Auto Repair' };
        const pctStats = new Set(['dmgMult','reloadMult','critChance','critDmg','shieldRegen','blastMult','dodgeChance','dr','modCdMult']);
        for (const [k, v] of activeStats) {
            const label = statLabels[k] || k;
            const isNeg = k === 'modCdMult';
            const sign = v > 0 ? '+' : '';
            const display = pctStats.has(k) ? `${sign}${Math.round(v * 100)}%` : `${sign}${v}`;
            const color = (v > 0 && !isNeg) || (v < 0 && isNeg) ? '#44ff88' : v < 0 ? '#ff5050' : '#44ff88';
            html += `<span style="font-size:10px;color:${color};padding:2px 6px;border:1px solid ${color}33;border-radius:3px;">${label}: ${isNeg ? '-' + Math.round(v*100) + '%' : display}</span>`;
        }
        html += '</div></div>';
    }

    html += '<div style="margin-top:8px;">';
    html += `<button onclick="_closeUpgrades()" style="padding:12px 32px;background:rgba(255,60,60,0.04);border:1px solid rgba(255,60,60,0.3);color:rgba(255,100,100,0.85);font-size:12px;letter-spacing:3px;font-family:'Courier New',monospace;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,60,60,0.12)';this.style.color='#fff';this.style.letterSpacing='4px';this.style.boxShadow='0 0 16px rgba(255,60,60,0.2)'" onmouseout="this.style.background='rgba(255,60,60,0.04)';this.style.color='rgba(255,100,100,0.85)';this.style.letterSpacing='3px';this.style.boxShadow='none'">BACK</button>`;
    html += '</div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
}

function _buySkillNode(nodeId) {
    if (purchaseSkillNode(nodeId)) {
        // Re-apply chassis upgrades with new skill
        if (typeof applyChassisUpgrades === 'function') applyChassisUpgrades();
        _showUpgradesPanel(); // re-render
    }
}

function _closeUpgrades() {
    const overlay = document.getElementById('upgrades-overlay');
    if (overlay) overlay.style.display = 'none';
    // Return to mission select
    if (typeof showMissionSelect === 'function') showMissionSelect();
}
