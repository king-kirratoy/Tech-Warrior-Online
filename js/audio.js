// ================================================================
// SYNTHESIZED SOUND ENGINE  (Web Audio API — no asset files needed)
// ================================================================

// ── Audio state variables ────────────────────────────────────────
let _ac              = null;
let _masterVol       = 0.32;
let _activeNodes     = 0;
let _lastNodeStartTime = 0; // performance.now() of most recent node creation
const _MAX_NODES     = 48;   // generous cap — each weapon sound uses multiple tones
// ⚠️ MUTATED AT RUNTIME — _canPlay() writes a per-sound timestamp into this object
// every time a sound is allowed to play.
const _sndThrottle   = {}; // per-sound last-played timestamps
let _audioReady      = false; // gate: prevents AudioContext creation before first user gesture

// ── Core engine functions ────────────────────────────────────────

function _getAC() {
    if (!_audioReady) return null;
    if (!_ac) {
        _ac = new (window.AudioContext || window.webkitAudioContext)();
        // Periodic audit: if the context closes while nodes are in-flight their
        // onended callbacks will never fire, leaving _activeNodes permanently
        // inflated and silencing all future audio.  Also catches the case where
        // the context is running but a node silently dropped its onended callback.
        const _MAX_AUDIO_DURATION_MS = 1500; // longest possible sound + safety margin
        setInterval(function _auditActiveNodes() {
            if (!_ac) return;
            if (_ac.state === 'closed') { _activeNodes = 0; return; }
            if (_activeNodes > 0 &&
                performance.now() - _lastNodeStartTime > _MAX_AUDIO_DURATION_MS) {
                _activeNodes = 0;
            }
        }, 2000);
    }
    if (_ac.state === 'suspended') _ac.resume();
    return _ac;
}

/** Returns true if this sound key is allowed to play (throttle in ms) */
function _canPlay(key, minGap) {
    const now = performance.now();
    if (_activeNodes >= _MAX_NODES) return false;
    if (_sndThrottle[key] && now - _sndThrottle[key] < minGap) return false;
    _sndThrottle[key] = now;
    return true;
}

function _tone(freq, type, duration, vol, freqEnd, startDelay = 0) {
    try {
        const ac = _getAC();
        if (!ac) return; // AudioContext not ready yet or was closed
        const osc  = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime + startDelay);
        if (freqEnd !== undefined)
            osc.frequency.exponentialRampToValueAtTime(
                Math.max(1, freqEnd), ac.currentTime + startDelay + duration);
        gain.gain.setValueAtTime(vol * _masterVol, ac.currentTime + startDelay);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startDelay + duration);
        _activeNodes++;
        _lastNodeStartTime = performance.now();
        osc.onended = () => { _activeNodes = Math.max(0, _activeNodes - 1); };
        osc.start(ac.currentTime + startDelay);
        osc.stop(ac.currentTime + startDelay + duration);
    } catch(e) {}
}

function _noise(duration, vol, startDelay = 0, highpass = 0, lowpass = 0) {
    try {
        const ac = _getAC();
        if (!ac) return; // AudioContext not ready yet or was closed
        const bufLen = Math.ceil(ac.sampleRate * Math.min(duration, 0.5));
        const buf    = ac.createBuffer(1, bufLen, ac.sampleRate);
        const data   = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
        const src  = ac.createBufferSource();
        src.buffer = buf;
        const gain = ac.createGain();
        src.connect(gain);
        let node = gain;
        if (highpass > 0) {
            const hp = ac.createBiquadFilter();
            hp.type = 'highpass'; hp.frequency.value = highpass;
            gain.connect(hp); node = hp;
        }
        if (lowpass > 0) {
            const lp = ac.createBiquadFilter();
            lp.type = 'lowpass'; lp.frequency.value = lowpass;
            node.connect(lp); node = lp;
        }
        node.connect(ac.destination);
        gain.gain.setValueAtTime(vol * _masterVol, ac.currentTime + startDelay);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startDelay + duration);
        _activeNodes++;
        _lastNodeStartTime = performance.now();
        src.onended = () => { _activeNodes = Math.max(0, _activeNodes - 1); };
        src.start(ac.currentTime + startDelay);
        src.stop(ac.currentTime + startDelay + duration);
    } catch(e) {}
}

// ── Per-weapon fire sounds ─────────────────────────────────────────
// minGap controls max fire rate for sound (independent of GAME fire rate)
function sndFire(wKey) {
    const gaps = { smg:80, mg:180, sg:300, br:120, hr:400, sr:500, rl:400, gl:300, plsm:400, fth:80, rail:4500 };
    const gap  = gaps[wKey] || 150;
    if (!_canPlay('fire_' + wKey, gap)) return;
    switch (wKey) {
        case 'smg':
            _noise(0.05, 0.25, 0, 2000, 8000);
            break;
        case 'mg':
            _noise(0.09, 0.35, 0, 800, 5000);
            _tone(100, 'sawtooth', 0.07, 0.12, 50);
            break;
        case 'sg':
            _noise(0.14, 0.55, 0, 200, 3000);
            _tone(70, 'sawtooth', 0.10, 0.18, 25);
            break;
        case 'br':
            _noise(0.06, 0.28, 0, 1500, 7000);
            break;
        case 'hr':
            _noise(0.20, 0.65, 0, 80, 1200);
            _tone(50, 'sine', 0.18, 0.3, 18);
            break;
        case 'sr':
            _noise(0.07, 0.4, 0, 3000, 0);
            _tone(500, 'sine', 0.09, 0.2, 55);
            break;
        case 'rl':
            _noise(0.18, 0.45, 0, 80, 1800);
            _tone(65, 'sawtooth', 0.18, 0.22, 25);
            break;
        case 'gl':
            _tone(110, 'sine', 0.09, 0.28, 55);
            _noise(0.07, 0.18, 0, 400, 2000);
            break;
        case 'plsm':
            _tone(440, 'sine', 0.08, 0.14, 220);
            _tone(880, 'sine', 0.10, 0.08, 440, 0.04);
            break;
        case 'fth':
            _noise(0.06, 0.28, 0, 60, 2400);
            _tone(85, 'sawtooth', 0.04, 0.10, 40);
            break;
    }
}

function sndEnemyFire(wKey) {
    if (!_canPlay('efr_' + wKey, 200)) return;
    switch (wKey) {
        case 'smg': _noise(0.04, 0.08, 0, 2000, 8000); break;
        case 'mg':  _noise(0.08, 0.12, 0, 800, 5000);  break;
        case 'sg':  _noise(0.10, 0.18, 0, 200, 3000);  break;
        case 'hr':  _noise(0.16, 0.22, 0, 80, 1200); _tone(42, 'sawtooth', 0.15, 0.12, 18); break;
        case 'sr':  _noise(0.06, 0.14, 0, 3000, 0); break;
        default:    _noise(0.06, 0.08, 0, 600, 5000);  break;
    }
}

function sndExplosion(large = false) {
    if (!_canPlay('exp', 80)) return;
    const vol = large ? 0.7 : 0.4;
    const dur = large ? 0.5 : 0.25;
    _noise(dur, vol, 0, 0, large ? 600 : 350);
    _tone(large ? 45 : 75, 'sine', dur * 0.8, vol * 0.5, 18);
}

function sndShieldBlock() {
    if (!_canPlay('sblk', 120)) return;
    _tone(1100, 'sine', 0.09, 0.28, 700);
}

function sndShieldActivate() {
    if (!_canPlay('sact', 500)) return;
    _tone(300, 'sine', 0.25, 0.18, 800);
}

function sndShieldDeactivate() {
    if (!_canPlay('sdact', 300)) return;
    _tone(700, 'sine', 0.18, 0.12, 180);
}

function sndEMP() {
    if (!_canPlay('emp', 500)) return;
    _noise(0.35, 0.4, 0, 1200, 0);
    _tone(75, 'sawtooth', 0.35, 0.25, 18);
}

function sndRage() {
    if (!_canPlay('rage', 500)) return;
    _tone(110, 'sawtooth', 0.28, 0.3, 220);
    _tone(75,  'square',   0.35, 0.18, 150, 0.05);
}

function sndJump() {
    if (!_canPlay('jump', 250)) return;
    _noise(0.22, 0.3, 0, 350, 3000);
    _tone(180, 'sine', 0.18, 0.18, 550, 0.02);
}

function sndPlayerHit() {
    if (!_canPlay('phit', 120)) return;
    _noise(0.09, 0.28, 0, 250, 3000);
    _tone(130, 'sawtooth', 0.07, 0.18, 50);
}

function sndLoot(type) {
    if (!_canPlay('loot_' + type, 200)) return;
    switch(type) {
        case 'repair': _tone(440,'sine',0.08,0.2,660); _tone(660,'sine',0.08,0.15,880,0.08); break;
        case 'ammo':   _tone(330,'square',0.06,0.18,660); _tone(550,'square',0.06,0.12,880,0.06); break;
        case 'charge': _tone(500,'sine',0.09,0.18,1000); _tone(750,'sine',0.09,0.1,1400,0.08); break;
    }
}

function sndEnemyDeath(isCommander = false) {
    if (!_canPlay('edth', 60)) return;
    const vol = isCommander ? 0.7 : 0.35;
    const dur = isCommander ? 0.45 : 0.22;
    _noise(dur, vol, 0, 0, isCommander ? 500 : 350);
    _tone(isCommander ? 38 : 55, 'sawtooth', dur, vol * 0.6, 14);
}

function sndCommanderSpawn() {
    if (!_canPlay('cmdsn', 300)) return;
    _tone(55, 'sawtooth', 0.45, 0.35, 38);
    _tone(75, 'square',   0.35, 0.18, 55, 0.1);
    _noise(0.28, 0.18, 0.18, 0, 450);
}

function sndRoundClear() {
    if (!_canPlay('rclr', 500)) return;
    _tone(440,'sine',0.1,0.28,660); _tone(660,'sine',0.1,0.22,880,0.1); _tone(880,'sine',0.14,0.18,1100,0.2);
}

function sndRoundStart() {
    if (!_canPlay('rstrt', 500)) return;
    _tone(220,'square',0.11,0.22,330); _tone(330,'square',0.11,0.18,440,0.11);
}

// ── Phase 8: Equipment & Loot Sounds ────────────────────────────
function sndEquipDrop(rarity) {
    if (!_canPlay('eqdrop', 120)) return;
    switch(rarity) {
        case 'common':    _tone(300,'sine',0.08,0.12,400); break;
        case 'uncommon':  _tone(400,'sine',0.09,0.16,550); _tone(550,'sine',0.07,0.10,700,0.08); break;
        case 'rare':      _tone(500,'sine',0.10,0.20,700); _tone(700,'triangle',0.10,0.14,900,0.09); break;
        case 'epic':      _tone(550,'sine',0.12,0.25,800); _tone(800,'sine',0.10,0.18,1100,0.10); _tone(1100,'sine',0.08,0.12,1400,0.18); break;
        case 'legendary': _tone(440,'sine',0.14,0.30,660); _tone(660,'sine',0.12,0.24,880,0.12); _tone(880,'sine',0.10,0.18,1200,0.22); _tone(1200,'sine',0.16,0.14,1600,0.30); break;
    }
}

function sndEquipPickup(rarity) {
    if (!_canPlay('eqpick', 150)) return;
    const isHigh = rarity === 'epic' || rarity === 'legendary';
    _tone(isHigh ? 600 : 440, 'sine', 0.06, isHigh ? 0.28 : 0.18, isHigh ? 900 : 660);
    _tone(isHigh ? 900 : 660, 'sine', 0.06, isHigh ? 0.22 : 0.14, isHigh ? 1200 : 880, 0.06);
    if (isHigh) { _tone(1200,'sine',0.08,0.16,1600,0.12); _noise(0.05,0.08,0.12,2000); }
}

function sndObjectiveStart() {
    if (!_canPlay('objst', 500)) return;
    _tone(330,'square',0.08,0.20,440); _tone(440,'square',0.08,0.16,550,0.08); _tone(550,'sine',0.10,0.14,660,0.16);
}

function sndObjectiveComplete() {
    if (!_canPlay('objcmp', 500)) return;
    _tone(440,'sine',0.10,0.28,660); _tone(660,'sine',0.10,0.22,880,0.10); _tone(880,'sine',0.12,0.18,1100,0.20); _tone(1100,'sine',0.14,0.14,1400,0.32);
}

function sndObjectiveFail() {
    if (!_canPlay('objfail', 500)) return;
    _tone(330,'sawtooth',0.15,0.25,180); _tone(220,'sawtooth',0.18,0.20,110,0.12); _noise(0.15,0.12,0.20,0,400);
}

function sndArenaTransition() {
    if (!_canPlay('arena', 800)) return;
    _noise(0.20,0.15,0,0,600); _tone(110,'sawtooth',0.30,0.18,80); _tone(220,'square',0.12,0.14,330,0.25);
}

function sndBossSpawn() {
    if (!_canPlay('boss', 1000)) return;
    _tone(55,'sawtooth',0.50,0.40,35); _tone(80,'square',0.40,0.25,55,0.12);
    _noise(0.35,0.25,0.20,0,500); _tone(110,'sawtooth',0.30,0.20,70,0.40);
}

function sndBossDefeat() {
    if (!_canPlay('bossd', 1000)) return;
    _noise(0.40,0.35,0,0,600); _tone(55,'sawtooth',0.50,0.35,20);
    _tone(440,'sine',0.12,0.25,660,0.45); _tone(660,'sine',0.12,0.20,880,0.55); _tone(880,'sine',0.14,0.16,1200,0.65);
}

// ── Siphon beam continuous hum ────────────────────────────────────
// Persistent oscillator nodes kept alive while the beam fires.
let _siphonHumOsc  = null;
let _siphonHumGain = null;
let _siphonLfoOsc  = null;
let _siphonLfoGain = null;

/** Start the siphon hum.  heatFraction 0–1 maps pitch 80–120 Hz. */
function sndSiphonBeamStart(heatFraction) {
    try {
        const ac = _getAC();
        if (!ac || _siphonHumOsc) return; // not ready or already running
        const freq     = 80 + heatFraction * 40;
        const baseVol  = 0.22 * _masterVol;

        _siphonHumGain = ac.createGain();
        _siphonHumGain.gain.setValueAtTime(0.001, ac.currentTime);
        _siphonHumGain.gain.linearRampToValueAtTime(baseVol, ac.currentTime + 0.08);

        _siphonHumOsc = ac.createOscillator();
        _siphonHumOsc.type = 'triangle';
        _siphonHumOsc.frequency.setValueAtTime(freq, ac.currentTime);
        _siphonHumOsc.connect(_siphonHumGain);
        _siphonHumGain.connect(ac.destination);

        // LFO: 2.5 Hz sine modulates hum gain for pulsing effect
        _siphonLfoGain = ac.createGain();
        _siphonLfoGain.gain.setValueAtTime(baseVol * 0.55, ac.currentTime);
        _siphonLfoOsc = ac.createOscillator();
        _siphonLfoOsc.type = 'sine';
        _siphonLfoOsc.frequency.setValueAtTime(2.5, ac.currentTime);
        _siphonLfoOsc.connect(_siphonLfoGain);
        _siphonLfoGain.connect(_siphonHumGain.gain);

        _siphonHumOsc.start(ac.currentTime);
        _siphonLfoOsc.start(ac.currentTime);
        _activeNodes += 2;
        _lastNodeStartTime = performance.now();
    } catch(e) {}
}

/** Update hum pitch as heat changes (called every frame while firing). */
function sndSiphonBeamUpdate(heatFraction) {
    try {
        if (!_siphonHumOsc || !_ac) return;
        const freq = 80 + heatFraction * 40;
        _siphonHumOsc.frequency.setValueAtTime(freq, _ac.currentTime);
    } catch(e) {}
}

/** Fade out and stop the siphon hum. */
function sndSiphonBeamStop() {
    try {
        if (!_siphonHumOsc || !_ac) return;
        const ac   = _ac;
        const osc  = _siphonHumOsc;
        const lfo  = _siphonLfoOsc;
        // Null out refs immediately so re-entrant calls are no-ops
        _siphonHumOsc  = null;
        _siphonHumGain = null;
        _siphonLfoOsc  = null;
        _siphonLfoGain = null;
        // Short fade-out to avoid click artifacts
        try {
            const g = osc.context ? osc.context : ac;
            osc.disconnect();
            lfo.disconnect();
        } catch(e) {}
        const fadeGain = ac.createGain();
        fadeGain.gain.setValueAtTime(0.22 * _masterVol, ac.currentTime);
        fadeGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
        osc.connect(fadeGain);
        fadeGain.connect(ac.destination);
        setTimeout(() => {
            try { osc.stop(); } catch(e) {}
            try { lfo.stop(); } catch(e) {}
            _activeNodes = Math.max(0, _activeNodes - 2);
        }, 100);
    } catch(e) {}
}

/** Brief sawtooth buzz when the siphon overheats. */
function sndSiphonOverheat() {
    if (!_canPlay('siphon_ovheat', 500)) return;
    _noise(0.10, 0.35, 0, 0, 300);
    _tone(55, 'sawtooth', 0.10, 0.20, 28);
}

// ── Loot Landing Sounds ──────────────────────────────────────────
// sndLootDrop(rarity) — plays when a dropped item hits the ground after the arc.
// sndScrapPickup()    — plays when the player collects a scrap coin.
function sndLootDrop(rarity) {
    if (!_canPlay('loot_drop_' + rarity, 80)) return;
    switch (rarity) {
        case 'common':
            break; // silent
        case 'uncommon':
            _tone(800, 'sine', 0.05, 0.10, 900);
            break;
        case 'rare':
            _tone(1000, 'sine', 0.08, 0.16, 1200);
            _tone(1200, 'sine', 0.06, 0.10, 1400, 0.04);
            break;
        case 'epic':
            _tone(1200, 'sine', 0.12, 0.20, 1500);
            _tone(1800, 'sine', 0.10, 0.14, 2100, 0.05);
            break;
        case 'legendary':
            _tone(200, 'triangle', 0.06, 0.22, 80);
            _tone(2000, 'sine', 0.20, 0.18, 1600);
            _tone(2400, 'sine', 0.16, 0.12, 1800, 0.06);
            break;
    }
}

function sndScrapPickup() {
    if (!_canPlay('scrap_pick', 60)) return;
    _tone(1500, 'sine', 0.04, 0.14, 2000);
}

// ── AudioContext lifecycle handlers ──────────────────────────────
// Set _audioReady on the first user gesture so _getAC() is only called
// after the browser allows AudioContext creation without autoplay restriction.
(function _initAudioLifecycle() {
    function _onFirstUserGesture() {
        _audioReady = true;
        document.removeEventListener('mousedown', _onFirstUserGesture);
        document.removeEventListener('keydown',   _onFirstUserGesture);
    }
    document.addEventListener('mousedown', _onFirstUserGesture);
    document.addEventListener('keydown',   _onFirstUserGesture);

    // Suspend the AudioContext when the tab is hidden to stop background
    // audio processing; resume it when the tab becomes visible again.
    document.addEventListener('visibilitychange', function _onVisibilityChange() {
        if (!_ac) return;
        if (document.hidden) {
            _ac.suspend();
        } else if (_ac.state === 'suspended') {
            _ac.resume();
        }
    });
}());
