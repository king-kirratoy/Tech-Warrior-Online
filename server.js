// ================================================================
// TECH WARRIOR ONLINE — PVP MULTIPLAYER SERVER
// Express static file server + Socket.io relay
// Usage: npm install && node server.js
// ================================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' },
    pingInterval: 2000,
    pingTimeout: 5000
});

// Serve static game files
app.use(express.static(path.join(__dirname)));

// ────────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────────

const KILLS_TO_WIN = 25;
const PVP_MAP_SIZE = 6000;   // larger PVP map (client must match)

// ────────────────────────────────────────────────────────────────
// LOBBY STATE
// ────────────────────────────────────────────────────────────────

const lobby = {
    players: new Map(),   // socketId → { id, name, chassis, color, loadout, ready }
    hostId: null,         // first player to join becomes host
    matchActive: false,   // true once host starts match
    matchId: 0,           // increments each match
    scores: new Map()     // socketId → { kills, deaths } (deathmatch)
};

// ────────────────────────────────────────────────────────────────
// SOCKET.IO EVENT HANDLERS
// ────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
    console.log(`[+] Player connected: ${socket.id}`);

    // ── JOIN LOBBY ──────────────────────────────────────────────
    socket.on('lobby-join', (data) => {
        const playerInfo = {
            id: socket.id,
            name: (data.name || 'ANONYMOUS').substring(0, 16).toUpperCase(),
            chassis: data.chassis || 'light',
            color: data.color || 0x00ff00,
            loadout: data.loadout || {},
            ready: false
        };
        lobby.players.set(socket.id, playerInfo);

        // First player becomes host
        if (!lobby.hostId || !lobby.players.has(lobby.hostId)) {
            lobby.hostId = socket.id;
        }

        // Send current lobby state to the new player
        socket.emit('lobby-state', {
            players: Array.from(lobby.players.values()),
            hostId: lobby.hostId,
            matchActive: lobby.matchActive
        });

        // Broadcast new player to everyone else
        socket.broadcast.emit('lobby-player-joined', playerInfo);

        console.log(`[LOBBY] ${playerInfo.name} joined (${lobby.players.size} players)`);
    });

    // ── UPDATE LOADOUT ─────────────────────────────────────────
    socket.on('lobby-update', (data) => {
        const p = lobby.players.get(socket.id);
        if (!p) return;
        if (data.chassis) p.chassis = data.chassis;
        if (data.color !== undefined) p.color = data.color;
        if (data.loadout) p.loadout = data.loadout;
        if (data.name) p.name = data.name.substring(0, 16).toUpperCase();
        io.emit('lobby-player-updated', p);
    });

    // ── READY TOGGLE ───────────────────────────────────────────
    socket.on('lobby-ready', (isReady) => {
        const p = lobby.players.get(socket.id);
        if (!p) return;
        p.ready = !!isReady;
        io.emit('lobby-player-updated', p);
    });

    // ── HOST STARTS MATCH ──────────────────────────────────────
    socket.on('match-start', () => {
        if (socket.id !== lobby.hostId) return;
        if (lobby.players.size < 2) return;

        lobby.matchActive = true;
        lobby.matchId++;

        // Reset scores for all players
        lobby.scores.clear();
        lobby.players.forEach((p) => {
            lobby.scores.set(p.id, { kills: 0, deaths: 0 });
        });

        // Assign spawn positions on the PVP map
        const spawns = generateSpawnPositions(lobby.players.size);
        const playerList = Array.from(lobby.players.values());
        const spawnMap = {};
        playerList.forEach((p, i) => {
            spawnMap[p.id] = spawns[i];
        });

        // Build initial scoreboard
        const scoreboard = {};
        lobby.scores.forEach((s, id) => { scoreboard[id] = s; });

        io.emit('match-begin', {
            matchId: lobby.matchId,
            players: playerList,
            spawns: spawnMap,
            killsToWin: KILLS_TO_WIN,
            mapSize: PVP_MAP_SIZE,
            scoreboard: scoreboard
        });

        console.log(`[MATCH] Started deathmatch #${lobby.matchId} with ${lobby.players.size} players (first to ${KILLS_TO_WIN})`);
    });

    // ── IN-MATCH: PLAYER STATE (position, rotation, hp) ────────
    socket.on('player-state', (data) => {
        // Relay to all other players (not back to sender)
        socket.broadcast.emit('player-state', {
            id: socket.id,
            x: data.x,
            y: data.y,
            rotation: data.rotation,
            torsoRotation: data.torsoRotation,
            velocityX: data.velocityX,
            velocityY: data.velocityY,
            hp: data.hp,
            shield: data.shield,
            maxHp: data.maxHp,
            maxShield: data.maxShield,
            firing: data.firing,
            chassis: data.chassis,
            color: data.color
        });
    });

    // ── IN-MATCH: BULLET FIRED ─────────────────────────────────
    socket.on('bullet-fired', (data) => {
        socket.broadcast.emit('bullet-fired', {
            shooterId: socket.id,
            x: data.x,
            y: data.y,
            angle: data.angle,
            weapon: data.weapon,
            speed: data.speed,
            damage: data.damage,
            bulletSize: data.bulletSize,
            pierce: data.pierce || false,
            explosive: data.explosive || false,
            radius: data.radius || 0,
            pellets: data.pellets || 0,
            spread: data.spread || 0
        });
    });

    // ── IN-MATCH: PLAYER HIT (victim reports being hit) ────────
    socket.on('player-hit', (data) => {
        // Relay hit confirmation to the shooter for kill tracking
        io.to(data.shooterId).emit('hit-confirmed', {
            victimId: socket.id,
            damage: data.damage
        });
        // Broadcast to all for visual effects
        socket.broadcast.emit('player-hit-visual', {
            victimId: socket.id,
            x: data.x,
            y: data.y,
            damage: data.damage
        });
    });

    // ── IN-MATCH: PLAYER KILLED (deathmatch — respawn, track score) ──
    socket.on('player-killed', (data) => {
        const killerScore = lobby.scores.get(data.killerId);
        const victimScore = lobby.scores.get(socket.id);

        if (killerScore && data.killerId) killerScore.kills++;
        if (victimScore) victimScore.deaths++;

        // Build updated scoreboard
        const scoreboard = {};
        lobby.scores.forEach((s, id) => { scoreboard[id] = s; });

        io.emit('player-killed', {
            victimId: socket.id,
            killerId: data.killerId,
            victimName: lobby.players.get(socket.id)?.name || 'UNKNOWN',
            killerName: lobby.players.get(data.killerId)?.name || 'UNKNOWN',
            scoreboard: scoreboard
        });

        // Assign a new spawn point for the victim to respawn at
        const respawnPos = getRandomSpawnPosition();
        socket.emit('respawn', {
            x: respawnPos.x,
            y: respawnPos.y,
            delay: 3000 // 3 second respawn delay
        });

        // Check for match winner (first to KILLS_TO_WIN)
        if (killerScore && killerScore.kills >= KILLS_TO_WIN) {
            const winner = lobby.players.get(data.killerId);
            io.emit('match-winner', {
                winnerId: data.killerId,
                winnerName: winner?.name || 'UNKNOWN',
                scoreboard: scoreboard
            });
            lobby.matchActive = false;
            console.log(`[MATCH] ${winner?.name} wins with ${killerScore.kills} kills!`);
        }
    });

    // ── IN-MATCH: CHAT ─────────────────────────────────────────
    socket.on('chat', (msg) => {
        const p = lobby.players.get(socket.id);
        if (!p) return;
        const sanitized = String(msg).substring(0, 200);
        io.emit('chat', {
            id: socket.id,
            name: p.name,
            message: sanitized
        });
    });

    // ── RETURN TO LOBBY ────────────────────────────────────────
    socket.on('return-to-lobby', () => {
        lobby.matchActive = false;
        if (socket.id === lobby.hostId) {
            // Reset all ready states
            lobby.players.forEach(p => { p.ready = false; });
            lobby.scores.clear();
            io.emit('match-ended', { reason: 'host-return' });
            io.emit('lobby-state', {
                players: Array.from(lobby.players.values()),
                hostId: lobby.hostId,
                matchActive: false
            });
        }
    });

    // ── DISCONNECT ─────────────────────────────────────────────
    socket.on('disconnect', () => {
        const p = lobby.players.get(socket.id);
        const name = p?.name || socket.id;
        lobby.players.delete(socket.id);
        lobby.scores.delete(socket.id);

        // Host migration
        if (socket.id === lobby.hostId) {
            const remaining = Array.from(lobby.players.keys());
            lobby.hostId = remaining.length > 0 ? remaining[0] : null;
            if (lobby.hostId) {
                io.emit('host-changed', { hostId: lobby.hostId });
                console.log(`[LOBBY] Host migrated to ${lobby.players.get(lobby.hostId)?.name}`);
            }
        }

        io.emit('lobby-player-left', { id: socket.id });

        // If match is active, broadcast disconnect kill feed
        if (lobby.matchActive) {
            io.emit('player-killed', {
                victimId: socket.id,
                killerId: null,
                victimName: name,
                killerName: 'DISCONNECT',
                scoreboard: Object.fromEntries(lobby.scores)
            });
        }

        console.log(`[-] ${name} disconnected (${lobby.players.size} remaining)`);
    });
});

// ────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────

// PVP spawn positions — open areas in each zone of the map
// Matches the zone-based layout in generatePvpCover (client).
// Positions are in corridors, plazas, and open gaps between buildings.
function _getPvpStreetPositions() {
    const cx = PVP_MAP_SIZE / 2, cy = PVP_MAP_SIZE / 2;
    return [
        // NW Dense Urban — alley intersections and gaps
        { x: 550, y: 530 }, { x: 950, y: 650 }, { x: 1350, y: 700 },
        { x: 500, y: 1150 }, { x: 900, y: 1100 }, { x: 1100, y: 1200 },
        { x: 350, y: 1680 }, { x: 1000, y: 1650 }, { x: 1500, y: 1500 },
        { x: 1900, y: 1400 }, { x: 700, y: 470 }, { x: 1250, y: 900 },

        // NE Industrial — open yards between warehouses
        { x: 4400, y: 800 }, { x: 4900, y: 850 }, { x: 5400, y: 700 },
        { x: 4200, y: 1200 }, { x: 4700, y: 1200 }, { x: 5300, y: 1200 },
        { x: 4600, y: 1800 }, { x: 5200, y: 1800 }, { x: 3900, y: 1700 },
        { x: 4400, y: 500 }, { x: 5100, y: 1000 },

        // SW Ruins — rubble clearings and crater edges
        { x: 700, y: 4100 }, { x: 1100, y: 4350 }, { x: 1500, y: 4100 },
        { x: 800, y: 4600 }, { x: 1200, y: 4600 }, { x: 1600, y: 4550 },
        { x: 500, y: 5100 }, { x: 1000, y: 5100 }, { x: 1600, y: 5100 },
        { x: 700, y: 5550 }, { x: 1400, y: 5550 }, { x: 2000, y: 5100 },

        // SE Fortress — alleys between barracks and motor pool
        { x: 4300, y: 4250 }, { x: 4650, y: 4250 }, { x: 5000, y: 4000 },
        { x: 4200, y: 4700 }, { x: 4500, y: 4850 }, { x: 4800, y: 4700 },
        { x: 5300, y: 4700 }, { x: 4700, y: 5300 }, { x: 5300, y: 5350 },
        { x: 4100, y: 5350 }, { x: 5000, y: 5500 },

        // Corridors — connecting passages between zones
        { x: 2800, y: 2050 }, { x: 3200, y: 2200 }, { x: 2600, y: 2500 },
        { x: 3400, y: 2500 }, { x: 3000, y: 3000 }, // center area
        { x: 2600, y: 3500 }, { x: 3400, y: 3500 }, { x: 3000, y: 3800 },
        { x: 2900, y: 4850 }, { x: 4500, y: 2900 }, { x: 2100, y: 3000 },
        { x: 3900, y: 3000 },

        // Transition zones — edges between districts
        { x: 2800, y: 700 }, { x: 3200, y: 1200 }, { x: 3000, y: 1700 },
        { x: 700, y: 2800 }, { x: 1200, y: 3200 }, { x: 1800, y: 2800 },
        { x: 4400, y: 3000 }, { x: 5200, y: 3200 }, { x: 4800, y: 3400 },
        { x: 2800, y: 4400 }, { x: 3200, y: 5000 }, { x: 3000, y: 5400 },
    ];
}

function generateSpawnPositions(count) {
    const cx = PVP_MAP_SIZE / 2, cy = PVP_MAP_SIZE / 2;
    const positions = _getPvpStreetPositions();

    // Sort by distance from center descending — prefer outer spawns for spread
    positions.sort((a, b) => {
        const da = Math.hypot(a.x - cx, a.y - cy);
        const db = Math.hypot(b.x - cx, b.y - cy);
        return db - da;
    });

    // Remove points too close to center
    const filtered = positions.filter(p => Math.hypot(p.x - cx, p.y - cy) > 600);

    // Select spawns that are well-spread from each other
    const spawns = [];
    const used = new Set();
    for (let i = 0; i < count; i++) {
        let best = null;
        let bestMinDist = -1;
        for (let j = 0; j < filtered.length; j++) {
            if (used.has(j)) continue;
            const p = filtered[j];
            let minDist = Infinity;
            for (const s of spawns) {
                const d = Math.hypot(p.x - s.x, p.y - s.y);
                if (d < minDist) minDist = d;
            }
            if (spawns.length === 0) minDist = Math.hypot(p.x - cx, p.y - cy);
            if (minDist > bestMinDist) {
                bestMinDist = minDist;
                best = j;
            }
        }
        if (best !== null) {
            spawns.push(filtered[best]);
            used.add(best);
        } else {
            const angle = (2 * Math.PI * i) / count;
            spawns.push({ x: Math.round(cx + 1800 * Math.cos(angle)), y: Math.round(cy + 1800 * Math.sin(angle)) });
        }
    }
    return spawns;
}

// Get a random street position for respawning
function getRandomSpawnPosition() {
    const positions = _getPvpStreetPositions();
    const cx = PVP_MAP_SIZE / 2, cy = PVP_MAP_SIZE / 2;
    const valid = positions.filter(p => Math.hypot(p.x - cx, p.y - cy) > 400);
    return valid[Math.floor(Math.random() * valid.length)] || { x: cx, y: cy };
}

// ────────────────────────────────────────────────────────────────
// START
// ────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ╔══════════════════════════════════════╗`);
    console.log(`  ║   TECH WARRIOR ONLINE — PVP SERVER   ║`);
    console.log(`  ║   http://localhost:${PORT}              ║`);
    console.log(`  ╚══════════════════════════════════════╝\n`);
});
