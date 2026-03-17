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
// LOBBY STATE
// ────────────────────────────────────────────────────────────────

const lobby = {
    players: new Map(),   // socketId → { id, name, chassis, color, ready }
    hostId: null,         // first player to join becomes host
    matchActive: false,   // true once host starts match
    matchId: 0            // increments each match
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

        // Assign spawn positions in a circle around map center
        const spawns = generateSpawnPositions(lobby.players.size);
        const playerList = Array.from(lobby.players.values());
        const spawnMap = {};
        playerList.forEach((p, i) => {
            spawnMap[p.id] = spawns[i];
        });

        io.emit('match-begin', {
            matchId: lobby.matchId,
            players: playerList,
            spawns: spawnMap
        });

        console.log(`[MATCH] Started match #${lobby.matchId} with ${lobby.players.size} players`);
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

    // ── IN-MATCH: PLAYER KILLED ────────────────────────────────
    socket.on('player-killed', (data) => {
        io.emit('player-killed', {
            victimId: socket.id,
            killerId: data.killerId,
            victimName: lobby.players.get(socket.id)?.name || 'UNKNOWN',
            killerName: lobby.players.get(data.killerId)?.name || 'UNKNOWN'
        });

        // Check for match end (last player standing)
        const alive = Array.from(lobby.players.values()).filter(p => {
            // The victim just died — exclude them
            return p.id !== socket.id;
        });

        // Count how many are still connected (proxy for alive)
        // Actual alive tracking is client-side; server just relays
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

        // If match is active, broadcast player death (disconnect = elimination)
        if (lobby.matchActive) {
            io.emit('player-killed', {
                victimId: socket.id,
                killerId: null,
                victimName: name,
                killerName: 'DISCONNECT'
            });
        }

        console.log(`[-] ${name} disconnected (${lobby.players.size} remaining)`);
    });
});

// ────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────

function generateSpawnPositions(count) {
    const cx = 2000, cy = 2000;
    const radius = 1200;
    const spawns = [];
    for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count;
        spawns.push({
            x: Math.round(cx + radius * Math.cos(angle)),
            y: Math.round(cy + radius * Math.sin(angle))
        });
    }
    return spawns;
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
