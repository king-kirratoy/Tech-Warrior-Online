// ================================================================
// ARENA VARIANTS & OBJECTIVE SYSTEM — Phase 6
// ================================================================
// Provides arena layout variants (Warehouse, Corridors, Pit,
// Stronghold, Tower Defense) and round objectives (Elimination,
// Survival, Assassination, Defense, Salvage).
// ================================================================

// ── ARENA DEFINITIONS ────────────────────────────────────────────
const ARENA_DEFS = {
    warehouse: {
        label: 'WAREHOUSE',
        desc: 'Open industrial zone with scattered cover',
        color: '#88aacc',
        gridColor: 0x004400,
        // null = use default city-block generator
        generator: null
    },
    corridors: {
        label: 'CORRIDORS',
        desc: 'Narrow hallways and chokepoints',
        color: '#ff8844',
        gridColor: 0x002244,
        generator: 'generateCorridors'
    },
    pit: {
        label: 'THE PIT',
        desc: 'Circular arena with shrinking safe zone',
        color: '#ff4444',
        gridColor: 0x220000,
        generator: 'generatePit'
    },
    stronghold: {
        label: 'STRONGHOLD',
        desc: 'Fortified position — enemies breach your walls',
        color: '#44ff88',
        gridColor: 0x003300,
        generator: 'generateStronghold'
    },
    tower_defense: {
        label: 'COMMAND POST',
        desc: 'Protect the central generator',
        color: '#ffcc00',
        gridColor: 0x222200,
        generator: 'generateTowerDefense'
    }
};

// ── OBJECTIVE DEFINITIONS ────────────────────────────────────────
const OBJECTIVE_DEFS = {
    elimination: {
        label: 'ELIMINATION',
        desc: 'Destroy all hostiles',
        icon: '⊕',
        color: '#ff4400',
        hudColor: '#ff4400',
        bonusLoot: 1.0
    },
    survival: {
        label: 'SURVIVAL',
        desc: 'Survive for 90 seconds',
        icon: '⏱',
        color: '#00ccff',
        hudColor: '#00ccff',
        bonusLoot: 1.5,
        duration: 90000
    },
    assassination: {
        label: 'ASSASSINATION',
        desc: 'Eliminate the marked target',
        icon: '◎',
        color: '#ff0066',
        hudColor: '#ff0066',
        bonusLoot: 1.3,
        timeLimit: 60000
    },
    defense: {
        label: 'DEFENSE',
        desc: 'Protect the generator',
        icon: '⛊',
        color: '#44ff88',
        hudColor: '#44ff88',
        bonusLoot: 1.4,
        generatorHP: 500,
        generatorMaxHP: 500
    },
    salvage: {
        label: 'SALVAGE',
        desc: 'Collect 5 data cores',
        icon: '◆',
        color: '#ffcc00',
        hudColor: '#ffcc00',
        bonusLoot: 1.2,
        coresRequired: 5
    }
};

// ── ACTIVE STATE ─────────────────────────────────────────────────
let _arenaState = {
    currentArena: 'warehouse',
    currentObjective: 'elimination',
    objectiveActive: false,
    objectiveComplete: false,
    objectiveFailed: false,
    timer: 0,
    startTime: 0,
    // Survival
    survivalTimeLeft: 0,
    // Assassination
    assassinTarget: null,
    assassinTimeLeft: 0,
    // Defense
    generator: null,
    generatorHP: 0,
    generatorMaxHP: 0,
    // Salvage
    coresCollected: 0,
    coresRequired: 5,
    corePickups: [],
    // Pit
    pitZoneRadius: 1800,
    pitShrinkRate: 0,
    pitDamageRate: 12,
    _pitZoneGfx: null,
    _pitDamageTick: 0
};

// ══════════════════════════════════════════════════════════════════
// ARENA SELECTION — picks arena variant based on round number
// ══════════════════════════════════════════════════════════════════
function selectArena(roundNum) {
    // Boss rounds always use warehouse
    if (roundNum % 5 === 0) return 'warehouse';
    // R1-5: warehouse only
    if (roundNum <= 5) return 'warehouse';
    // R6-10: warehouse or corridors
    if (roundNum <= 10) {
        const pool = ['warehouse', 'corridors'];
        return pool[Math.floor(Math.random() * pool.length)];
    }
    // R11-15: add stronghold and tower_defense
    if (roundNum <= 15) {
        const pool = ['warehouse', 'corridors', 'stronghold', 'tower_defense'];
        return pool[Math.floor(Math.random() * pool.length)];
    }
    // R16+: full rotation including pit
    const pool = ['warehouse', 'corridors', 'pit', 'stronghold', 'tower_defense'];
    return pool[Math.floor(Math.random() * pool.length)];
}

// ══════════════════════════════════════════════════════════════════
// OBJECTIVE SELECTION — picks objective based on round + arena
// ══════════════════════════════════════════════════════════════════
function selectObjective(roundNum, arenaKey) {
    // Boss rounds and R1-4: always elimination
    if (roundNum % 5 === 0 || roundNum <= 4) return 'elimination';
    // Tower defense arena forces defense objective
    if (arenaKey === 'tower_defense') return 'defense';
    // Pit arena forces survival objective
    if (arenaKey === 'pit') return 'survival';
    // R5+: random objective selection with weights
    const weights = [
        { key: 'elimination',   w: 40 },
        { key: 'survival',      w: roundNum >= 8 ? 15 : 0 },
        { key: 'assassination', w: roundNum >= 6 ? 20 : 0 },
        { key: 'salvage',       w: roundNum >= 7 ? 15 : 0 },
        { key: 'defense',       w: roundNum >= 10 ? 10 : 0 }
    ];
    const total = weights.reduce((s, w) => s + w.w, 0);
    let roll = Math.random() * total;
    for (const w of weights) {
        roll -= w.w;
        if (roll <= 0) return w.key;
    }
    return 'elimination';
}

// ══════════════════════════════════════════════════════════════════
// ARENA GENERATORS — create cover layouts per arena variant
// ══════════════════════════════════════════════════════════════════

// Corridors: maze-like layout with long walls forming narrow passages
function generateCorridors(scene, coverObjects, placeAt, COVER_DEFS) {
    const wallH = COVER_DEFS.find(d => d.type === 'wall' && d.w > d.h) || COVER_DEFS[3];
    const wallV = COVER_DEFS.find(d => d.type === 'wall' && d.h > d.w) || COVER_DEFS[4];
    const crate = COVER_DEFS.find(d => d.type === 'crate') || COVER_DEFS[6];
    const rock  = COVER_DEFS[0];

    // Define long corridor walls (extended versions)
    const longH = { ...wallH, w: 400, h: 28, hp: 0, color: 0x445566, stroke: 0x8899aa, type: 'wall' };
    const longV = { ...wallV, w: 28, h: 400, hp: 0, color: 0x445566, stroke: 0x8899aa, type: 'wall' };
    const medH  = { ...wallH, w: 260, h: 28, hp: 0, color: 0x445566, stroke: 0x8899aa, type: 'wall' };
    const medV  = { ...wallV, w: 28, h: 260, hp: 0, color: 0x445566, stroke: 0x8899aa, type: 'wall' };

    // Outer perimeter corridors
    // Top corridor
    placeAt(longH, 1000, 600); placeAt(longH, 2000, 600); placeAt(longH, 3000, 600);
    placeAt(longH, 1000, 900); placeAt(longH, 2000, 900); placeAt(longH, 3000, 900);
    // Bottom corridor
    placeAt(longH, 1000, 3100); placeAt(longH, 2000, 3100); placeAt(longH, 3000, 3100);
    placeAt(longH, 1000, 3400); placeAt(longH, 2000, 3400); placeAt(longH, 3000, 3400);
    // Left corridor
    placeAt(longV, 600, 1000); placeAt(longV, 600, 2000); placeAt(longV, 600, 3000);
    placeAt(longV, 900, 1000); placeAt(longV, 900, 2000); placeAt(longV, 900, 3000);
    // Right corridor
    placeAt(longV, 3100, 1000); placeAt(longV, 3100, 2000); placeAt(longV, 3100, 3000);
    placeAt(longV, 3400, 1000); placeAt(longV, 3400, 2000); placeAt(longV, 3400, 3000);

    // Inner cross corridors through center
    placeAt(medH, 1500, 1800); placeAt(medH, 2500, 1800);
    placeAt(medH, 1500, 2200); placeAt(medH, 2500, 2200);
    placeAt(medV, 1800, 1500); placeAt(medV, 1800, 2500);
    placeAt(medV, 2200, 1500); placeAt(medV, 2200, 2500);

    // Scatter crates in corridors for cover
    const cratePositions = [
        [750, 750], [1500, 750], [2500, 750], [3250, 750],
        [750, 1500], [750, 2500], [750, 3250],
        [3250, 1500], [3250, 2500], [3250, 3250],
        [1500, 3250], [2500, 3250],
        [2000, 1500], [2000, 2500], [1500, 2000], [2500, 2000]
    ];
    cratePositions.forEach(([x, y]) => placeAt(crate, x, y));

    // Rocks at dead-ends
    for (let i = 0; i < 8; i++) {
        const rx = 500 + Math.random() * 3000;
        const ry = 500 + Math.random() * 3000;
        if (Math.abs(rx - 2000) < 300 && Math.abs(ry - 2000) < 300) continue;
        placeAt(rock, Math.round(rx), Math.round(ry));
    }
}

// Pit: open circular arena with minimal cover near center
function generatePit(scene, coverObjects, placeAt, COVER_DEFS) {
    const crate = COVER_DEFS.find(d => d.type === 'crate') || COVER_DEFS[6];
    const rock  = COVER_DEFS[0];
    const wallH = { type: 'wall', w: 140, h: 24, hp: 0, color: 0x664444, stroke: 0xaa6666 };

    // Ring of low walls around center (radius ~500)
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const x = 2000 + Math.cos(a) * 600;
        const y = 2000 + Math.sin(a) * 600;
        // Alternate horizontal and vertical
        if (Math.floor(a / (Math.PI / 4)) % 2 === 0) {
            placeAt(wallH, Math.round(x), Math.round(y));
        } else {
            placeAt({ ...wallH, w: 24, h: 140 }, Math.round(x), Math.round(y));
        }
    }

    // Scatter crates inside ring
    for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 200 + Math.random() * 300;
        placeAt(crate, Math.round(2000 + Math.cos(a) * r), Math.round(2000 + Math.sin(a) * r));
    }

    // Outer ring of rocks (radius ~1200) — landmarks outside danger zone
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
        const r = 1100 + Math.random() * 200;
        placeAt(rock, Math.round(2000 + Math.cos(a) * r), Math.round(2000 + Math.sin(a) * r));
    }
}

// Stronghold: player starts with fortified cover, enemies approach from edges
function generateStronghold(scene, coverObjects, placeAt, COVER_DEFS) {
    const wallH = { type: 'wall', w: 200, h: 28, hp: 300, color: 0x446644, stroke: 0x88cc88 };
    const wallV = { type: 'wall', w: 28, h: 200, hp: 300, color: 0x446644, stroke: 0x88cc88 };
    const crate = COVER_DEFS.find(d => d.type === 'crate') || COVER_DEFS[6];
    const rock  = COVER_DEFS[0];

    // Central fortress walls (square ~400px around center)
    // North wall
    placeAt(wallH, 1800, 1750); placeAt(wallH, 2200, 1750);
    // South wall
    placeAt(wallH, 1800, 2250); placeAt(wallH, 2200, 2250);
    // West wall
    placeAt(wallV, 1700, 1850); placeAt(wallV, 1700, 2150);
    // East wall
    placeAt(wallV, 2300, 1850); placeAt(wallV, 2300, 2150);

    // Inner crates for additional cover
    placeAt(crate, 1900, 1900); placeAt(crate, 2100, 1900);
    placeAt(crate, 1900, 2100); placeAt(crate, 2100, 2100);

    // Outer approach cover — scattered rocks and walls enemies can use
    const outerPositions = [
        [800, 800], [1200, 600], [2000, 500], [2800, 600], [3200, 800],
        [600, 1200], [3400, 1200],
        [500, 2000], [3500, 2000],
        [600, 2800], [3400, 2800],
        [800, 3200], [1200, 3400], [2000, 3500], [2800, 3400], [3200, 3200]
    ];
    outerPositions.forEach(([x, y]) => {
        if (Math.random() < 0.6) placeAt(rock, x, y);
        else placeAt(crate, x, y);
    });

    // Barricade checkpoints at mid-range (~800px from center)
    placeAt({ ...wallH, w: 160, hp: 200 }, 2000, 1200);
    placeAt({ ...wallH, w: 160, hp: 200 }, 2000, 2800);
    placeAt({ ...wallV, h: 160, hp: 200 }, 1200, 2000);
    placeAt({ ...wallV, h: 160, hp: 200 }, 2800, 2000);
}

// Tower Defense: central generator with defensive rings
function generateTowerDefense(scene, coverObjects, placeAt, COVER_DEFS) {
    const wallH = { type: 'wall', w: 160, h: 28, hp: 250, color: 0x665522, stroke: 0xccaa44 };
    const wallV = { type: 'wall', w: 28, h: 160, hp: 250, color: 0x665522, stroke: 0xccaa44 };
    const crate = COVER_DEFS.find(d => d.type === 'crate') || COVER_DEFS[6];
    const rock  = COVER_DEFS[0];

    // Inner defensive ring (~350px from center)
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        const x = 2000 + Math.cos(a) * 350;
        const y = 2000 + Math.sin(a) * 350;
        if (Math.floor(a / (Math.PI / 3)) % 2 === 0) {
            placeAt(wallH, Math.round(x), Math.round(y));
        } else {
            placeAt(wallV, Math.round(x), Math.round(y));
        }
    }

    // Outer ring (~800px) — approach obstacles
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
        const x = 2000 + Math.cos(a) * 800;
        const y = 2000 + Math.sin(a) * 800;
        placeAt(Math.random() < 0.5 ? rock : crate, Math.round(x), Math.round(y));
    }

    // Far scatter for enemy spawning cover
    for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 1200 + Math.random() * 600;
        const x = Math.round(2000 + Math.cos(a) * r);
        const y = Math.round(2000 + Math.sin(a) * r);
        if (x < 200 || x > 3800 || y < 200 || y > 3800) continue;
        placeAt(rock, x, y);
    }
}

// ══════════════════════════════════════════════════════════════════
// OBJECTIVE INITIALIZATION — called when a round starts
// ══════════════════════════════════════════════════════════════════
function initObjective(scene, roundNum, objectiveKey) {
    const def = OBJECTIVE_DEFS[objectiveKey];
    _arenaState.currentObjective = objectiveKey;
    _arenaState.objectiveActive = true;
    _arenaState.objectiveComplete = false;
    _arenaState.objectiveFailed = false;
    _arenaState.startTime = scene.time.now;
    if (objectiveKey !== 'elimination' && typeof sndObjectiveStart === 'function') sndObjectiveStart();

    switch (objectiveKey) {
        case 'elimination':
            // No special init — default kill-all behavior
            break;

        case 'survival': {
            _arenaState.survivalTimeLeft = def.duration;
            break;
        }

        case 'assassination': {
            _arenaState.assassinTarget = null;
            _arenaState.assassinTimeLeft = def.timeLimit;
            // Mark target after enemies spawn (slight delay)
            scene.time.delayedCall(1200, () => {
                _markAssassinTarget(scene);
            });
            break;
        }

        case 'defense': {
            _arenaState.generatorHP = def.generatorHP + roundNum * 20;
            _arenaState.generatorMaxHP = _arenaState.generatorHP;
            _spawnGenerator(scene);
            break;
        }

        case 'salvage': {
            _arenaState.coresCollected = 0;
            _arenaState.coresRequired = def.coresRequired;
            _arenaState.corePickups = [];
            // Spawn cores after a short delay
            scene.time.delayedCall(800, () => {
                _spawnDataCores(scene);
            });
            break;
        }
    }

    // Show objective HUD
    _updateObjectiveHUD();
}

// ══════════════════════════════════════════════════════════════════
// OBJECTIVE UPDATE — called each frame from update()
// ══════════════════════════════════════════════════════════════════
function updateObjectives(scene, time) {
    if (!_arenaState.objectiveActive || _arenaState.objectiveComplete || _arenaState.objectiveFailed) return;

    switch (_arenaState.currentObjective) {
        case 'survival':
            _updateSurvival(scene, time);
            break;
        case 'assassination':
            _updateAssassination(scene, time);
            break;
        case 'defense':
            _updateDefense(scene, time);
            break;
        case 'salvage':
            _updateSalvage(scene, time);
            break;
        // elimination: no per-frame update needed
    }

    // Pit zone shrink
    if (_arenaState.currentArena === 'pit') {
        _updatePitZone(scene, time);
    }

    _updateObjectiveHUD();
}

// ── SURVIVAL ─────────────────────────────────────────────────────
function _updateSurvival(scene, time) {
    const elapsed = time - _arenaState.startTime;
    _arenaState.survivalTimeLeft = Math.max(0, OBJECTIVE_DEFS.survival.duration - elapsed);

    if (_arenaState.survivalTimeLeft <= 0) {
        _arenaState.objectiveComplete = true;
        _arenaState.objectiveActive = false;
        _onObjectiveComplete(scene);
    }
}

// ── ASSASSINATION ────────────────────────────────────────────────
function _markAssassinTarget(scene) {
    if (typeof enemies === 'undefined' || !enemies) return;
    const pool = enemies.getChildren().filter(e => e.active && !e.isBoss);
    if (pool.length === 0) return;

    // Pick strongest enemy as target
    const target = pool.reduce((best, e) => {
        const hp = e.comp ? Object.values(e.comp).reduce((s, c) => s + c.hp, 0) : 0;
        const bestHp = best.comp ? Object.values(best.comp).reduce((s, c) => s + c.hp, 0) : 0;
        return hp > bestHp ? e : best;
    }, pool[0]);

    _arenaState.assassinTarget = target;
    // Visual marker on target
    target._assassinMarker = scene.add.circle(target.x, target.y, 35, 0xff0066, 0)
        .setStrokeStyle(3, 0xff0066).setDepth(15);
    target._assassinLabel = scene.add.text(target.x, target.y - 45, '◎ TARGET', {
        font: 'bold 11px monospace', fill: '#ff0066', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(15);

    // Pulse tween on marker
    scene.tweens.add({
        targets: target._assassinMarker,
        scaleX: 1.3, scaleY: 1.3, alpha: 0.6,
        yoyo: true, repeat: -1, duration: 600
    });
}

function _updateAssassination(scene, time) {
    const elapsed = time - _arenaState.startTime;
    _arenaState.assassinTimeLeft = Math.max(0, OBJECTIVE_DEFS.assassination.timeLimit - elapsed);

    // Update marker position
    const t = _arenaState.assassinTarget;
    if (t?.active) {
        if (t._assassinMarker) t._assassinMarker.setPosition(t.x, t.y);
        if (t._assassinLabel) t._assassinLabel.setPosition(t.x, t.y - 45);
    }

    // Target killed?
    if (t && !t.active) {
        _arenaState.objectiveComplete = true;
        _arenaState.objectiveActive = false;
        _cleanupAssassinMarker();
        _onObjectiveComplete(scene);
        return;
    }

    // Time ran out?
    if (_arenaState.assassinTimeLeft <= 0) {
        _arenaState.objectiveFailed = true;
        _arenaState.objectiveActive = false;
        _cleanupAssassinMarker();
        _onObjectiveFailed(scene);
    }
}

function _cleanupAssassinMarker() {
    const t = _arenaState.assassinTarget;
    if (!t) return;
    try { t._assassinMarker?.destroy(); } catch(e) {}
    try { t._assassinLabel?.destroy(); } catch(e) {}
}

// ── DEFENSE ──────────────────────────────────────────────────────
function _spawnGenerator(scene) {
    // Visual generator object at world center
    const gfx = scene.add.graphics().setDepth(4);
    gfx.fillStyle(0x44ff88, 0.8);
    gfx.fillRoundedRect(-25, -25, 50, 50, 8);
    gfx.lineStyle(2, 0x88ffcc);
    gfx.strokeRoundedRect(-25, -25, 50, 50, 8);
    // Inner core
    gfx.fillStyle(0x00ff66, 0.6);
    gfx.fillCircle(0, 0, 12);
    gfx.setPosition(2000, 2000);

    // HP bar above
    const hpBg = scene.add.rectangle(2000, 1960, 60, 8, 0x000000).setStrokeStyle(1, 0x44ff88).setDepth(4);
    const hpFill = scene.add.rectangle(2000 - 29, 1960, 58, 6, 0x44ff88).setOrigin(0, 0.5).setDepth(4);

    const label = scene.add.text(2000, 1940, '⛊ GENERATOR', {
        font: 'bold 10px monospace', fill: '#44ff88', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(4);

    // Pulse tween
    scene.tweens.add({
        targets: gfx, scaleX: 1.08, scaleY: 1.08,
        yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut'
    });

    _arenaState.generator = { gfx, hpBg, hpFill, label };

    // Add physics body for enemy targeting
    const genBody = scene.add.rectangle(1975, 1975, 50, 50, 0, 0).setOrigin(0, 0).setDepth(1).setAlpha(0.01);
    scene.physics.add.existing(genBody, true);
    genBody.body.setSize(50, 50);
    genBody.body.reset(1975, 1975);
    _arenaState.generator.body = genBody;
}

function _updateDefense(scene, time) {
    if (!_arenaState.generator) return;

    // Check if enemies are near generator — they damage it
    if (typeof enemies !== 'undefined' && enemies) {
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const dist = Phaser.Math.Distance.Between(e.x, e.y, 2000, 2000);
            if (dist < 120) {
                // Enemies in range damage generator at 15 DPS (checked ~60 fps)
                _arenaState.generatorHP -= 0.25;
            }
        });
    }

    // Update HP bar
    const pct = Math.max(0, _arenaState.generatorHP / _arenaState.generatorMaxHP);
    if (_arenaState.generator.hpFill) {
        _arenaState.generator.hpFill.setScale(pct, 1);
        // Color shift as HP drops
        if (pct < 0.3) _arenaState.generator.hpFill.setFillStyle(0xff4400);
        else if (pct < 0.6) _arenaState.generator.hpFill.setFillStyle(0xffcc00);
    }

    if (_arenaState.generatorHP <= 0) {
        _arenaState.objectiveFailed = true;
        _arenaState.objectiveActive = false;
        _destroyGenerator(scene);
        _onObjectiveFailed(scene);
    }
}

function _destroyGenerator(scene) {
    if (!_arenaState.generator) return;
    const g = _arenaState.generator;
    // Explosion effect
    const boom = scene.add.circle(2000, 2000, 10, 0xff4400, 0.8).setDepth(20);
    scene.tweens.add({ targets: boom, radius: 80, alpha: 0, duration: 500, onComplete: () => boom.destroy() });
    try { g.gfx?.destroy(); } catch(e) {}
    try { g.hpBg?.destroy(); } catch(e) {}
    try { g.hpFill?.destroy(); } catch(e) {}
    try { g.label?.destroy(); } catch(e) {}
    try { g.body?.destroy(); } catch(e) {}
    _arenaState.generator = null;
}

// ── SALVAGE ──────────────────────────────────────────────────────
function _spawnDataCores(scene) {
    const count = _arenaState.coresRequired;
    for (let i = 0; i < count; i++) {
        let x, y, attempts = 0;
        do {
            x = 400 + Math.random() * 3200;
            y = 400 + Math.random() * 3200;
            attempts++;
        } while (Phaser.Math.Distance.Between(x, y, 2000, 2000) < 300 && attempts < 40);

        const core = scene.add.graphics().setDepth(6);
        core.fillStyle(0xffcc00, 0.9);
        core.fillRoundedRect(-10, -10, 20, 20, 4);
        core.lineStyle(2, 0xffee88);
        core.strokeRoundedRect(-10, -10, 20, 20, 4);
        core.fillStyle(0xffffff, 0.5);
        core.fillCircle(0, 0, 5);
        core.setPosition(Math.round(x), Math.round(y));

        const label = scene.add.text(Math.round(x), Math.round(y) - 20, '◆ CORE', {
            font: 'bold 9px monospace', fill: '#ffcc00', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(6);

        // Pulse
        scene.tweens.add({
            targets: core, scaleX: 1.2, scaleY: 1.2,
            yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut'
        });

        // Add physics for pickup detection
        const pickupZone = scene.add.rectangle(Math.round(x) - 20, Math.round(y) - 20, 40, 40, 0, 0)
            .setOrigin(0, 0).setAlpha(0.01).setDepth(1);
        scene.physics.add.existing(pickupZone, true);
        pickupZone.body.setSize(40, 40);
        pickupZone.body.reset(Math.round(x) - 20, Math.round(y) - 20);

        _arenaState.corePickups.push({ gfx: core, label, body: pickupZone, collected: false });
    }
}

function _updateSalvage(scene, time) {
    if (typeof player === 'undefined' || !player?.active) return;

    _arenaState.corePickups.forEach(core => {
        if (core.collected) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, core.gfx.x, core.gfx.y);
        if (dist < 50) {
            core.collected = true;
            _arenaState.coresCollected++;
            // Pickup effect
            scene.tweens.add({ targets: core.gfx, scaleX: 0, scaleY: 0, alpha: 0, duration: 300, onComplete: () => core.gfx.destroy() });
            scene.tweens.add({ targets: core.label, alpha: 0, y: core.label.y - 20, duration: 300, onComplete: () => core.label.destroy() });
            try { core.body?.destroy(); } catch(e) {}
            // Flash text
            const txt = scene.add.text(player.x, player.y - 40,
                `◆ ${_arenaState.coresCollected}/${_arenaState.coresRequired}`, {
                font: 'bold 14px monospace', fill: '#ffcc00', stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(20);
            scene.tweens.add({ targets: txt, y: txt.y - 25, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
        }
    });

    if (_arenaState.coresCollected >= _arenaState.coresRequired) {
        _arenaState.objectiveComplete = true;
        _arenaState.objectiveActive = false;
        _onObjectiveComplete(scene);
    }
}

// ── PIT ZONE SHRINK ──────────────────────────────────────────────
function _initPitZone(scene) {
    _arenaState.pitZoneRadius = 1800;
    _arenaState.pitShrinkRate = 1.5; // px per frame (~90 px/s)
    _arenaState._pitDamageTick = 0;
    // Draw zone boundary ring
    _arenaState._pitZoneGfx = scene.add.graphics().setDepth(2);
    _drawPitZone();
}

function _drawPitZone() {
    const gfx = _arenaState._pitZoneGfx;
    if (!gfx) return;
    gfx.clear();
    const r = _arenaState.pitZoneRadius;
    // Danger zone outside the ring
    gfx.lineStyle(4, 0xff2200, 0.5);
    gfx.strokeCircle(2000, 2000, r);
    // Inner safe glow
    gfx.lineStyle(2, 0xff4400, 0.2);
    gfx.strokeCircle(2000, 2000, r - 5);
}

function _updatePitZone(scene, time) {
    // Don't shrink below 300px radius
    if (_arenaState.pitZoneRadius > 300) {
        _arenaState.pitZoneRadius -= _arenaState.pitShrinkRate * (1/60);
        _drawPitZone();
    }

    // Damage player if outside zone
    if (typeof player !== 'undefined' && player?.active) {
        const dist = Phaser.Math.Distance.Between(player.x, player.y, 2000, 2000);
        if (dist > _arenaState.pitZoneRadius) {
            _arenaState._pitDamageTick += 1;
            if (_arenaState._pitDamageTick >= 30) { // ~0.5s at 60fps
                _arenaState._pitDamageTick = 0;
                if (typeof processPlayerDamage === 'function') {
                    processPlayerDamage(_arenaState.pitDamageRate);
                }
                // Warning flash on screen edge
                const flash = scene.add.rectangle(player.x, player.y, 60, 60, 0xff0000, 0.3).setDepth(19);
                scene.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
            }
        } else {
            _arenaState._pitDamageTick = 0;
        }
    }

    // Also damage enemies outside zone
    if (typeof enemies !== 'undefined' && enemies) {
        enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const dist = Phaser.Math.Distance.Between(e.x, e.y, 2000, 2000);
            if (dist > _arenaState.pitZoneRadius + 100) {
                // Push enemies inward
                const angle = Math.atan2(2000 - e.y, 2000 - e.x);
                if (e.body) {
                    e.body.velocity.x += Math.cos(angle) * 40;
                    e.body.velocity.y += Math.sin(angle) * 40;
                }
            }
        });
    }
}

// ── OBJECTIVE COMPLETE / FAILED ──────────────────────────────────
function _onObjectiveComplete(scene) {
    const def = OBJECTIVE_DEFS[_arenaState.currentObjective];
    if (typeof sndObjectiveComplete === 'function') sndObjectiveComplete();
    const txt = scene.add.text(
        scene.cameras.main.midPoint.x, scene.cameras.main.midPoint.y - 60,
        `${def.icon} OBJECTIVE COMPLETE`, {
        font: 'bold 22px monospace', fill: def.color, stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(30).setScrollFactor(0);
    scene.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, duration: 2000, onComplete: () => txt.destroy() });
}

function _onObjectiveFailed(scene) {
    const def = OBJECTIVE_DEFS[_arenaState.currentObjective];
    if (typeof sndObjectiveFail === 'function') sndObjectiveFail();
    const txt = scene.add.text(
        scene.cameras.main.midPoint.x, scene.cameras.main.midPoint.y - 60,
        `✖ OBJECTIVE FAILED`, {
        font: 'bold 22px monospace', fill: '#ff2200', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(30).setScrollFactor(0);
    scene.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, duration: 2000, onComplete: () => txt.destroy() });
}

// ══════════════════════════════════════════════════════════════════
// OBJECTIVE HUD — persistent display during round
// ══════════════════════════════════════════════════════════════════
function _updateObjectiveHUD() {
    const el = document.getElementById('objective-hud');
    if (!el) return;
    const def = OBJECTIVE_DEFS[_arenaState.currentObjective];
    if (!def) { el.style.display = 'none'; return; }

    // For elimination, hide the objective HUD (round HUD handles it)
    if (_arenaState.currentObjective === 'elimination') {
        el.style.display = 'none';
        return;
    }

    el.style.display = 'block';
    const icon = el.querySelector('#obj-icon');
    const label = el.querySelector('#obj-label');
    const detail = el.querySelector('#obj-detail');
    const bar = el.querySelector('#obj-bar-fill');

    if (icon) icon.innerText = def.icon;
    if (label) { label.innerText = def.label; label.style.color = def.hudColor; }

    switch (_arenaState.currentObjective) {
        case 'survival': {
            const secs = Math.ceil(_arenaState.survivalTimeLeft / 1000);
            if (detail) detail.innerText = `${secs}s remaining`;
            const pct = _arenaState.survivalTimeLeft / def.duration;
            if (bar) { bar.style.width = (pct * 100) + '%'; bar.style.background = def.hudColor; }
            break;
        }
        case 'assassination': {
            const secs = Math.ceil(_arenaState.assassinTimeLeft / 1000);
            if (detail) detail.innerText = `${secs}s to eliminate target`;
            const pct = _arenaState.assassinTimeLeft / def.timeLimit;
            if (bar) { bar.style.width = (pct * 100) + '%'; bar.style.background = pct < 0.3 ? '#ff2200' : def.hudColor; }
            break;
        }
        case 'defense': {
            const pct = Math.max(0, _arenaState.generatorHP / _arenaState.generatorMaxHP);
            if (detail) detail.innerText = `Generator: ${Math.ceil(pct * 100)}%`;
            if (bar) { bar.style.width = (pct * 100) + '%'; bar.style.background = pct < 0.3 ? '#ff2200' : def.hudColor; }
            break;
        }
        case 'salvage': {
            if (detail) detail.innerText = `Cores: ${_arenaState.coresCollected}/${_arenaState.coresRequired}`;
            const pct = _arenaState.coresCollected / _arenaState.coresRequired;
            if (bar) { bar.style.width = (pct * 100) + '%'; bar.style.background = def.hudColor; }
            break;
        }
    }
}

// ══════════════════════════════════════════════════════════════════
// CLEANUP — called between rounds / on game over
// ══════════════════════════════════════════════════════════════════
function cleanupObjective(scene) {
    _arenaState.objectiveActive = false;
    _arenaState.objectiveComplete = false;
    _arenaState.objectiveFailed = false;

    // Cleanup assassination marker
    _cleanupAssassinMarker();
    _arenaState.assassinTarget = null;

    // Cleanup generator
    if (_arenaState.generator) _destroyGenerator(scene);

    // Cleanup salvage cores
    _arenaState.corePickups.forEach(core => {
        try { core.gfx?.destroy(); } catch(e) {}
        try { core.label?.destroy(); } catch(e) {}
        try { core.body?.destroy(); } catch(e) {}
    });
    _arenaState.corePickups = [];
    _arenaState.coresCollected = 0;

    // Cleanup pit zone
    if (_arenaState._pitZoneGfx) {
        try { _arenaState._pitZoneGfx.destroy(); } catch(e) {}
        _arenaState._pitZoneGfx = null;
    }

    // Hide objective HUD
    const el = document.getElementById('objective-hud');
    if (el) el.style.display = 'none';
}

// ══════════════════════════════════════════════════════════════════
// HELPER: get loot bonus multiplier for current objective
// ══════════════════════════════════════════════════════════════════
function getObjectiveLootBonus() {
    if (_arenaState.objectiveComplete) {
        return OBJECTIVE_DEFS[_arenaState.currentObjective]?.bonusLoot || 1.0;
    }
    return 1.0;
}

// ══════════════════════════════════════════════════════════════════
// HELPER: check if round should end (for non-elimination objectives)
// ══════════════════════════════════════════════════════════════════
function shouldEndRound() {
    const obj = _arenaState.currentObjective;
    // Elimination: standard kill-all check
    if (obj === 'elimination') return false; // let normal check handle it
    // Survival: round ends when timer runs out (success) or all enemies killed
    if (obj === 'survival' && _arenaState.objectiveComplete) return true;
    // Assassination: complete when target killed, fail on timeout
    if (obj === 'assassination' && (_arenaState.objectiveComplete || _arenaState.objectiveFailed)) return true;
    // Defense: fail = generator destroyed, success = kill all enemies (normal check)
    if (obj === 'defense' && _arenaState.objectiveFailed) return true;
    // Salvage: complete when all cores collected
    if (obj === 'salvage' && _arenaState.objectiveComplete) return true;
    return false;
}

// ══════════════════════════════════════════════════════════════════
// HELPER: get arena label for round banner
// ══════════════════════════════════════════════════════════════════
function getArenaLabel() {
    return ARENA_DEFS[_arenaState.currentArena]?.label || 'WAREHOUSE';
}
function getObjectiveLabel() {
    const def = OBJECTIVE_DEFS[_arenaState.currentObjective];
    if (!def || _arenaState.currentObjective === 'elimination') return '';
    return `${def.icon} ${def.label}: ${def.desc}`;
}
