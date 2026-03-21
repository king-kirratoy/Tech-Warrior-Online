// ═══════════ COVER / BATTLEFIELD OBJECTS ═══════════

// Building graphics array — cleared and rebuilt by generateCover() each round
let _buildingGraphics = [];


// ── placeBuilding ─────────────────────────────────────────────────
function placeBuilding(scene, x, y, def) {
    const w = def.w, h = def.h;
    const g = scene.add.graphics().setDepth(3);
    const v = def.variant;

    // ── Base fill ────────────────────────────────────────────────
    g.fillStyle(def.color, 1);
    g.fillRect(x - w/2, y - h/2, w, h);

    // ── Outer border ─────────────────────────────────────────────
    g.lineStyle(2, def.stroke, 1);
    g.strokeRect(x - w/2, y - h/2, w, h);

    if (v === 'small' || v === 'medium' || v === 'large') {
        // Rooftop edge trim (inner border 6px in)
        g.lineStyle(1, def.stroke, 0.5);
        g.strokeRect(x - w/2 + 6, y - h/2 + 6, w - 12, h - 12);

        // Windows — 2 rows of dark rectangles
        const winW = 14, winH = 10, winGapX = 22, winGapY = 20;
        const cols = Math.floor((w - 30) / winGapX);
        const rows = v === 'large' ? 3 : 2;
        const startX = x - (cols - 1) * winGapX / 2;
        const startY = y - (rows - 1) * winGapY / 2;
        g.fillStyle(0x0a0e14, 0.9);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const wx = startX + c * winGapX - winW/2;
                const wy = startY + r * winGapY - winH/2;
                g.fillRect(wx, wy, winW, winH);
                // Window frame
                g.lineStyle(1, def.stroke, 0.4);
                g.strokeRect(wx, wy, winW, winH);
            }
        }

        // Door (bottom center)
        if (v !== 'small') {
            g.fillStyle(0x080c10, 1);
            g.fillRect(x - 10, y + h/2 - 22, 20, 22);
            g.lineStyle(1, def.stroke, 0.5);
            g.strokeRect(x - 10, y + h/2 - 22, 20, 22);
        }

        // Rooftop details — centre box (HVAC / elevator)
        if (v === 'large') {
            g.fillStyle(0x252a33, 1);
            g.fillRect(x - 22, y - 16, 44, 32);
            g.lineStyle(1, def.stroke, 0.6);
            g.strokeRect(x - 22, y - 16, 44, 32);
            // Antenna
            g.lineStyle(2, 0x8899aa, 0.7);
            g.beginPath();
            g.moveTo(x, y - 16);
            g.lineTo(x, y - h/2 - 12);
            g.strokePath();
            g.fillStyle(0xaabbcc, 0.9);
            g.fillRect(x - 2, y - h/2 - 14, 4, 4);
        }
        if (v === 'medium') {
            // Side wing suggestion — darker strip on right
            g.fillStyle(0x252a33, 0.6);
            g.fillRect(x + w/2 - 28, y - h/2 + 8, 22, h - 16);
            g.lineStyle(1, def.stroke, 0.3);
            g.strokeRect(x + w/2 - 28, y - h/2 + 8, 22, h - 16);
        }

    } else if (v === 'ruin') {
        // Ruined building — jagged inner walls, rubble look
        // Broken top-left corner
        g.fillStyle(0x1a1510, 1);
        g.fillTriangle(x - w/2, y - h/2,  x - w/2 + 40, y - h/2,  x - w/2, y - h/2 + 35);
        // Crumbled right side
        g.fillStyle(0x1a1510, 1);
        g.fillRect(x + w/2 - 30, y - 20, 30, h/2 + 10);
        // Interior rubble lines
        g.lineStyle(1, 0x5a4a40, 0.5);
        g.beginPath(); g.moveTo(x - 20, y - h/2); g.lineTo(x - 20, y + 20); g.strokePath();
        g.beginPath(); g.moveTo(x - w/2, y + 10); g.lineTo(x + 10, y + 10); g.strokePath();
        // A few scattered debris rects
        g.fillStyle(0x4a3f38, 0.8);
        g.fillRect(x - w/2 + 8,  y + h/2 - 12, 18, 10);
        g.fillRect(x + 5,        y + h/2 - 10, 14,  8);
        g.fillRect(x - 10,       y - h/2 + 5,  20,  8);
    }

    // Track building graphics for cleanup between rounds
    _buildingGraphics.push(g);

    // ── Physics body (static rectangle matching footprint) ───────
    // Create invisible static body for collision — use origin(0,0) with top-left coords
    const body = scene.add.rectangle(x - w/2, y - h/2, w, h, 0x000000, 0)
        .setOrigin(0, 0).setDepth(3);
    coverObjects.add(body, true);
    body.body.setSize(w, h);
    body.body.reset(x - w/2, y - h/2);
    body.body.immovable = true;
    body.coverType  = 'building';
    body.coverHp    = 0;
    body.coverMaxHp = 0;
    body.coverDef   = def;
    // Store TRUE center for LOS/vision-cone raycasting (origin is 0,0 so c.x is top-left)
    body.coverCX = x;
    body.coverCY = y;
}


// ── generateCover ─────────────────────────────────────────────────
function generateCover(scene, arenaKey) {
    if (!coverObjects) return;
    // Destroy orphaned building graphics from previous round
    _buildingGraphics.forEach(g => { try { if (g?.active) g.destroy(); } catch(e){} });
    _buildingGraphics = [];
    coverObjects.clear(true, true);

    // If a custom arena generator exists, use it instead of default city layout
    if (arenaKey && arenaKey !== 'warehouse' && typeof ARENA_DEFS !== 'undefined') {
        const arenaDef = ARENA_DEFS[arenaKey];
        if (arenaDef?.generator) {
            const genFn = window[arenaDef.generator] || eval(arenaDef.generator);
            if (typeof genFn === 'function') {
                const _placed = [];
                const _placeAt = (def, x, y) => {
                    _placed.push({ x, y });
                    if (def.type === 'building') {
                        placeBuilding(scene, x, y, def);
                    } else {
                        const rect = scene.add.rectangle(x - def.w/2, y - def.h/2, def.w, def.h, def.color)
                            .setOrigin(0, 0).setStrokeStyle(2, def.stroke).setDepth(3);
                        coverObjects.add(rect, true);
                        rect.body.setSize(def.w, def.h);
                        rect.body.reset(x - def.w/2, y - def.h/2);
                        rect.body.immovable = true;
                        rect.coverType = def.type; rect.coverHp = def.hp;
                        rect.coverMaxHp = def.hp; rect.coverDef = def;
                        rect.coverCX = x; rect.coverCY = y;
                    }
                };
                genFn(scene, coverObjects, _placeAt, COVER_DEFS);
                // Force-sync all static bodies
                coverObjects.getChildren().forEach(c => {
                    if (c.body) {
                        const w = c.width || 60, h = c.height || 60;
                        c.body.setSize(w, h);
                        c.body.reset(c.x, c.y);
                        c.body.immovable = true;
                        if (c.coverCX === undefined) { c.coverCX = c.x + w / 2; c.coverCY = c.y + h / 2; }
                    }
                });
                coverObjects.refresh();
                try { scene.time.delayedCall(120, () => { try { coverObjects?.refresh(); } catch(e){} }); } catch(e) {}
                return;
            }
        }
    }

    const MARGIN    = 150;
    const SAFE_DIST = 420;   // min dist from world center (2000,2000)
    const placed    = [];

    // Helper: place a cover object at exact (x, y) center position
    const placeAt = (def, x, y) => {
        placed.push({ x, y });
        if (def.type === 'building') {
            placeBuilding(scene, x, y, def);
        } else {
            const rect = scene.add.rectangle(x - def.w/2, y - def.h/2, def.w, def.h, def.color)
                .setOrigin(0, 0).setStrokeStyle(2, def.stroke).setDepth(3);
            coverObjects.add(rect, true);
            rect.body.setSize(def.w, def.h);
            rect.body.reset(x - def.w/2, y - def.h/2);
            rect.body.immovable = true;
            rect.coverType = def.type; rect.coverHp = def.hp;
            rect.coverMaxHp = def.hp; rect.coverDef = def;
            rect.coverCX = x;
            rect.coverCY = y;
        }
    };

    // Helper: try random placement within bounds, respecting safe zone + min separation
    const tryPlace = (def, xMin, xMax, yMin, yMax, minSep) => {
        const sep = minSep || 160;
        for (let attempt = 0; attempt < 60; attempt++) {
            const x = Phaser.Math.Between(xMin, xMax);
            const y = Phaser.Math.Between(yMin, yMax);
            if (Phaser.Math.Distance.Between(x, y, WORLD_CENTER, WORLD_CENTER) < SAFE_DIST) continue;
            if (placed.some(p => Phaser.Math.Distance.Between(x, y, p.x, p.y) < sep)) continue;
            placeAt(def, x, y);
            return true;
        }
        return false;
    };

    // ══════════════════════════════════════════════════════════════
    // CITY LAYOUT — 4000×4000 map divided into city blocks with streets
    // ══════════════════════════════════════════════════════════════
    // Grid: 5×5 city blocks with streets between them
    // Each block ~600×600, streets ~200 wide
    // Block centers at: 500, 1300, 2100, 2900, 3700 → but shifted for border
    // Actual grid: starts at 300, each block 600px, street 160px gap
    const BLOCK_SIZE   = 600;
    const STREET_WIDTH = 160;
    const GRID_START   = 250;
    const blockCenters = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const bx = GRID_START + col * (BLOCK_SIZE + STREET_WIDTH) + BLOCK_SIZE / 2;
            const by = GRID_START + row * (BLOCK_SIZE + STREET_WIDTH) + BLOCK_SIZE / 2;
            if (bx > 3850 || by > 3850) continue;
            blockCenters.push({ x: bx, y: by, row, col });
        }
    }

    // Draw street markings (decorative — thin dashed lines down street centers)
    const streetGfx = scene.add.graphics().setDepth(2);
    streetGfx.lineStyle(1, 0x334433, 0.25);
    // Horizontal streets
    for (let row = 0; row < 4; row++) {
        const sy = GRID_START + (row + 1) * BLOCK_SIZE + row * STREET_WIDTH + STREET_WIDTH / 2;
        for (let dx = MARGIN; dx < 3850; dx += 40) {
            streetGfx.beginPath();
            streetGfx.moveTo(dx, sy);
            streetGfx.lineTo(dx + 20, sy);
            streetGfx.strokePath();
        }
    }
    // Vertical streets
    for (let col = 0; col < 4; col++) {
        const sx = GRID_START + (col + 1) * BLOCK_SIZE + col * STREET_WIDTH + STREET_WIDTH / 2;
        for (let dy = MARGIN; dy < 3850; dy += 40) {
            streetGfx.beginPath();
            streetGfx.moveTo(sx, dy);
            streetGfx.lineTo(sx, dy + 20);
            streetGfx.strokePath();
        }
    }

    // ── Fill each city block with buildings ──────────────────────
    const _buildingVariants = [
        COVER_DEFS[8],  // small building
        COVER_DEFS[9],  // medium building
        COVER_DEFS[10], // large building
        COVER_DEFS[11], // ruin building
    ];

    // Seeded pseudo-random for consistent but varied city feel
    let _seed = 42;
    const _srand = () => { _seed = (_seed * 16807 + 0) % 2147483647; return (_seed & 0x7fffffff) / 0x7fffffff; };

    blockCenters.forEach(block => {
        const bLeft = block.x - BLOCK_SIZE / 2;
        const bTop  = block.y - BLOCK_SIZE / 2;

        // Skip blocks that overlap the center spawn safe zone
        if (Phaser.Math.Distance.Between(block.x, block.y, WORLD_CENTER, WORLD_CENTER) < SAFE_DIST + 200) {
            // Center block: place only a few small obstacles (crates, walls) around edges
            for (let i = 0; i < 3; i++) {
                const angle = _srand() * Math.PI * 2;
                const dist  = 320 + _srand() * 200;
                const ox = Math.round(WORLD_CENTER + Math.cos(angle) * dist);
                const oy = Math.round(WORLD_CENTER + Math.sin(angle) * dist);
                if (placed.some(p => Phaser.Math.Distance.Between(ox, oy, p.x, p.y) < 120)) continue;
                placeAt(COVER_DEFS[6], ox, oy); // crate
            }
            return;
        }

        // Determine block composition based on position
        const isEdge = block.row === 0 || block.row === 4 || block.col === 0 || block.col === 4;
        const isCorner = (block.row === 0 || block.row === 4) && (block.col === 0 || block.col === 4);

        if (isCorner) {
            // Corner blocks: 1 large building + 1 small + scattered debris
            placeAt(COVER_DEFS[10], bLeft + 180, bTop + 180);  // large building
            placeAt(COVER_DEFS[8],  bLeft + 450, bTop + 420);  // small building
            placeAt(COVER_DEFS[11], bLeft + 380, bTop + 150);  // ruin
            // Crates and walls
            placeAt(COVER_DEFS[6], bLeft + 100, bTop + 420);
            placeAt(COVER_DEFS[7], bLeft + 500, bTop + 200);
            placeAt(COVER_DEFS[3], bLeft + 300, bTop + 520);   // h-wall (street barricade)
        } else if (isEdge) {
            // Edge blocks: 2 medium buildings + walls
            placeAt(COVER_DEFS[9],  bLeft + 160, bTop + 160);  // medium building
            placeAt(COVER_DEFS[9],  bLeft + 420, bTop + 400);  // medium building
            placeAt(COVER_DEFS[8],  bLeft + 400, bTop + 140);  // small building
            // Street-side walls and barriers
            placeAt(COVER_DEFS[4], bLeft + 40,  bTop + 300);   // v-wall (left edge)
            placeAt(COVER_DEFS[5], bLeft + 300, bTop + 560);   // short h-wall
            placeAt(COVER_DEFS[6], bLeft + 200, bTop + 450);   // crate
        } else {
            // Inner blocks: denser, more variety — 2-3 buildings + urban clutter
            const variant = Math.floor(_srand() * 4);
            if (variant === 0) {
                // Dense commercial block: 1 large + 2 small
                placeAt(COVER_DEFS[10], bLeft + 300, bTop + 280);
                placeAt(COVER_DEFS[8],  bLeft + 100, bTop + 140);
                placeAt(COVER_DEFS[8],  bLeft + 480, bTop + 480);
                placeAt(COVER_DEFS[3], bLeft + 300, bTop + 530); // h-wall
            } else if (variant === 1) {
                // Warehouse block: medium buildings in a row
                placeAt(COVER_DEFS[9],  bLeft + 150, bTop + 200);
                placeAt(COVER_DEFS[9],  bLeft + 420, bTop + 200);
                placeAt(COVER_DEFS[11], bLeft + 280, bTop + 450); // ruin
                placeAt(COVER_DEFS[7], bLeft + 100, bTop + 450);  // small crate
            } else if (variant === 2) {
                // Mixed: 1 large + debris
                placeAt(COVER_DEFS[10], bLeft + 200, bTop + 250);
                placeAt(COVER_DEFS[8],  bLeft + 470, bTop + 150);
                placeAt(COVER_DEFS[11], bLeft + 440, bTop + 450);
                placeAt(COVER_DEFS[6], bLeft + 120, bTop + 500);
                placeAt(COVER_DEFS[4], bLeft + 550, bTop + 320); // v-wall
            } else {
                // Residential: 3 small buildings clustered
                placeAt(COVER_DEFS[8],  bLeft + 120, bTop + 140);
                placeAt(COVER_DEFS[8],  bLeft + 350, bTop + 160);
                placeAt(COVER_DEFS[8],  bLeft + 240, bTop + 420);
                placeAt(COVER_DEFS[9],  bLeft + 480, bTop + 440);
                placeAt(COVER_DEFS[5], bLeft + 450, bTop + 280); // short h-wall
            }
        }

        // Random urban clutter per block: rocks as rubble, extra walls as barriers
        const clutterCount = isEdge ? 2 : 3;
        for (let c = 0; c < clutterCount; c++) {
            const cx = bLeft + 60 + _srand() * (BLOCK_SIZE - 120);
            const cy = bTop  + 60 + _srand() * (BLOCK_SIZE - 120);
            if (placed.some(p => Phaser.Math.Distance.Between(cx, cy, p.x, p.y) < 100)) continue;
            const clutterDef = [COVER_DEFS[0], COVER_DEFS[1], COVER_DEFS[6], COVER_DEFS[7]][c % 4];
            placeAt(clutterDef, Math.round(cx), Math.round(cy));
        }
    });

    // ── Street obstacles: barricades, abandoned vehicles (walls/crates in streets) ──
    // Place some obstacles in the streets for cover during firefights
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
            if (_srand() < 0.4) continue; // ~60% of intersections get something
            const sx = GRID_START + col * (BLOCK_SIZE + STREET_WIDTH) + BLOCK_SIZE / 2;
            const sy = GRID_START + (row + 1) * BLOCK_SIZE + row * STREET_WIDTH + STREET_WIDTH / 2;
            if (Phaser.Math.Distance.Between(sx, sy, WORLD_CENTER, WORLD_CENTER) < SAFE_DIST) continue;
            if (placed.some(p => Phaser.Math.Distance.Between(sx, sy, p.x, p.y) < 100)) continue;
            const streetDef = _srand() < 0.5 ? COVER_DEFS[3] : COVER_DEFS[6]; // h-wall or crate
            placeAt(streetDef, Math.round(sx), Math.round(sy));
        }
    }
    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 5; row++) {
            if (_srand() < 0.4) continue;
            const sx = GRID_START + (col + 1) * BLOCK_SIZE + col * STREET_WIDTH + STREET_WIDTH / 2;
            const sy = GRID_START + row * (BLOCK_SIZE + STREET_WIDTH) + BLOCK_SIZE / 2;
            if (Phaser.Math.Distance.Between(sx, sy, WORLD_CENTER, WORLD_CENTER) < SAFE_DIST) continue;
            if (placed.some(p => Phaser.Math.Distance.Between(sx, sy, p.x, p.y) < 100)) continue;
            const streetDef = _srand() < 0.5 ? COVER_DEFS[4] : COVER_DEFS[7]; // v-wall or small crate
            placeAt(streetDef, Math.round(sx), Math.round(sy));
        }
    }

    // ── Extra rocks/rubble scattered across streets for additional cover ──
    for (let i = 0; i < 12; i++) {
        const rx = MARGIN + _srand() * (WORLD_SIZE - 2 * MARGIN);
        const ry = MARGIN + _srand() * (WORLD_SIZE - 2 * MARGIN);
        if (Phaser.Math.Distance.Between(rx, ry, WORLD_CENTER, WORLD_CENTER) < SAFE_DIST) continue;
        if (placed.some(p => Phaser.Math.Distance.Between(rx, ry, p.x, p.y) < 130)) continue;
        placeAt(COVER_DEFS[Math.floor(_srand() * 3)], Math.round(rx), Math.round(ry)); // random rock variant
    }

    // Force-sync ALL static bodies
    coverObjects.getChildren().forEach(c => {
        if (c.body) {
            const w = c.width || 60, h = c.height || 60;
            c.body.setSize(w, h);
            c.body.reset(c.x, c.y);
            c.body.immovable = true;
            if (c.coverCX === undefined) { c.coverCX = c.x + w / 2; c.coverCY = c.y + h / 2; }
        }
    });
    coverObjects.refresh();
    try {
        const _sc = GAME?.scene?.scenes[0];
        if (_sc?.time) _sc.time.delayedCall(120, () => { try { coverObjects?.refresh(); } catch(e){} });
    } catch(e) {}
}


// ── damageCover ───────────────────────────────────────────────────
function damageCover(scene, cover, amt) {
    if (!cover?.active || cover.coverHp <= 0) return;
    cover.coverHp -= amt;
    // Darken toward charred black as damage increases
    const pct = Math.max(0, cover.coverHp / cover.coverMaxHp);
    const base = cover.coverDef.color;
    const r = Math.floor(((base >> 16) & 0xff) * pct);
    const g = Math.floor(((base >>  8) & 0xff) * pct);
    const b = Math.floor(( base        & 0xff) * pct);
    cover.setFillStyle((r << 16) | (g << 8) | b);

    if (cover.coverHp <= 0) {
        createExplosion(scene, cover.x, cover.y, 50, 0);
        spawnDebris(scene, cover.x, cover.y, cover.coverDef.stroke);
        cover.destroy();
    }
}
