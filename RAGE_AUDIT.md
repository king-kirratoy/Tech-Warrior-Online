# Rage Inducer CPU — Audit Report

**Ability key:** `'rage'`
**Chassis restriction:** Heavy only (`CHASSIS_CPUS.heavy`)
**Audited:** 2026-03-25

---

## Verdict: Partially Implemented — Core Works, Two Broken Pieces

Rage activates correctly and delivers a real combat boost, but two advertised features are unimplemented stubs:
1. The **invincibility frames on activation** are defined in data but never executed.
2. The **Blood Rage perk** (`rage_feed`) accumulates a counter that is never consumed.

---

## Step-by-Step Findings

### Step 1 — `activateRage()` in `js/mods.js` (lines 270–281)

```javascript
function activateRage(scene) {
    sndRage();
    isRageActive = true;
    refreshMechColor();
    const _gearModEffMult = 1 + ((_gearState?.modEffPct || 0) / 100);
    const _rageDur = WEAPONS.rage.rageTime
        * (typeof hasUniqueEffect === 'function' && hasUniqueEffect('modAmplify') ? 1.5 : 1)
        * (_perkState.rageDurMult || 1)
        * _gearModEffMult;
    scene.time.delayedCall(_rageDur, () => {
        isRageActive = false;
        refreshMechColor();
        lastModTime = GAME.scene.scenes[0].time.now;
    });
}
```

**What it does on activation:**
- Plays the rage sound (`sndRage()`).
- Sets `isRageActive = true`.
- Calls `refreshMechColor()` — turns the mech bright red (`0xff0000` head, `0x660000` body).
- Computes a duration from `WEAPONS.rage.rageTime` (3500 ms base), multiplied by:
  - ×1.5 if the `modAmplify` unique item effect is active.
  - `_perkState.rageDurMult` (default 1.0; `berserker_fuel` perk stacks at ×1.5 each).
  - `_gearModEffMult` from equipped gear's `modEffPct` stat.
- Schedules a `delayedCall` for that duration. When it fires:
  - Sets `isRageActive = false`.
  - Calls `refreshMechColor()` again to restore original color.
  - Sets `lastModTime` to the current timestamp — **the cooldown clock starts only after rage ends**, not from when it activated.

**What it does NOT do:**
- Does not set `lastModTime` at the moment of activation (unlike every other mod activation function).
- Does not apply the 500 ms invincibility window defined in `WEAPONS.rage.invincFrames`.
- Does not modify `_perkState.dmgMult` or any per-bullet damage value.

---

### Step 2 — Rage helper functions in `js/mods.js`

**Enemy rage case** (`js/mods.js` lines 733–743): A separate `case 'rage'` block inside the enemy AI mod handler. Increases enemy speed ×1.6, tints the enemy torso red (`0xff2200`), and resets after `WEAPONS.rage.rageTime`. Unrelated to the player ability but shares the same `rageTime` constant.

**`activateMod()` dispatch** (`js/mods.js` line 885): Routes `loadout.cpu === 'rage'` to `activateRage(scene)`. No `time` argument is passed; `lastModTime` is handled inside the callback instead.

No other rage-specific helper functions exist in `mods.js`.

---

### Step 3 — Rage damage bonus in `js/combat.js`

**Fire rate boost (line 19):**
```javascript
const reloadActual = ((isRageActive || isAmmoActive) ? weapon.reload * 0.5 : weapon.reload) * ...
```
While `isRageActive` is true, every weapon's reload time is halved — effectively doubling the fire rate and therefore doubling DPS output. This is the only damage-related effect of rage.

**No explicit damage multiplier:** The `_effectiveDmg` calculation at line 127 does not include an `isRageActive` factor. The `damageEnemy()` function applies `_perkState.dmgMult` (line 875), but `activateRage()` never modifies `_perkState.dmgMult`. There is no separate per-shot damage multiplier for rage.

**Speed boost (events.js line 222):**
```javascript
const speed = CHASSIS[loadout.chassis].spd * (isRageActive ? 1.75 : 1) * ...
```
Rage grants +75% movement speed. Confirmed in `js/events.js`, not `combat.js`, but relevant to overall rage behavior.

**Summary of combat effects while rage is active:**
| Effect | Value | Where |
|--------|-------|--------|
| Fire rate | ×2 (reload halved) | `combat.js:19` |
| Movement speed | ×1.75 | `events.js:222` |
| Per-shot damage | none | not implemented |
| Invincibility | none | not implemented |

---

### Step 4 — Rage visual effects in `js/mechs.js`

**`refreshMechColor()` (lines 89–101):**
- When `isRageActive = true`: mech head → `0xff0000` (bright red), body shapes → `0x660000` (dark red).
- Called on activation and on expiry to restore original `loadout.color`.

**`handleRageGhosts()` (lines 267–282):**
- Called every frame from the game loop (`js/init.js:253`).
- Early-returns if `!isRageActive` or if `time % 150 >= 20` (spawns roughly every 150 ms within a 20 ms window).
- Builds a full player mech clone (`buildPlayerMech()`), tints it red, sets alpha 0.4, depth 9.
- Runs a 400 ms tween: alpha 0, scale 1.1, then destroys.
- Result: a trail of fading red ghost mechs while rage is active.

Both visual systems are fully functional.

---

### Step 5 — Rage state variables in `js/state.js`

| Variable | Location | Default | Purpose |
|----------|----------|---------|---------|
| `isRageActive` | `state.js:100` | `false` | Master flag: gates fire rate, speed, visuals, ghost spawning, HUD bar |
| `_perkState.rageDurMult` | `state.js:114` | `1` | Duration multiplier from `berserker_fuel` perk |
| `_perkState.rageFeed` | `state.js:114` | `0` | Duration-extension-per-kill value from `rage_feed` perk |
| `_perkState._rageEndTime` | `state.js:114` | `0` | Accumulator incremented by `rageFeed` per kill — **never read** |

---

### Step 6 — HUD indicators in `js/hud.js`

**`updateCooldownOverlays()` (lines 98–121):**
- While `isRageActive === true`: the CPU slot cooldown bar is forced to 100% (`pct = 100`). The slot text shows the full 10.5 s countdown (based on `WEAPONS.rage.cooldown - elapsed`, where `elapsed` uses the stale pre-activation `lastModTime`). Visually the bar stays full during the active window.
- After rage ends: `lastModTime` is set, elapsed resets to 0, and the 10500 ms cooldown counts down normally.
- No distinct "rage active" color change or separate HUD indicator exists beyond the full bar.

The cooldown display is functional, though there is no dedicated visual element distinguishing "rage active" from "ability just used." The bar being 100% serves as the active indicator.

---

## Full Summary

### 1. Is rage fully functional?

**No.** Two documented features are not implemented.

### 2. Is rage partially implemented?

**Yes.** The core activation loop (sound, red tint, ghost trail, 2× fire rate, 1.75× speed, 10.5 s cooldown, HUD bar) works end-to-end. Two pieces are stubs.

### 3. Is rage broken or a stub?

**Neither** — the ability is playable and provides a real combat advantage. The stubs are additive features that were never completed.

### 4. What specific damage multiplier does rage apply, and for how long?

There is **no explicit damage multiplier**. The DPS increase comes from the **fire rate doubling** (`weapon.reload × 0.5`) for the duration of rage.

- **Base duration:** 3500 ms (`WEAPONS.rage.rageTime`)
- **Max duration with `berserker_fuel` (2 stacks):** 3500 × 1.5 × 1.5 = 7875 ms
- **Max duration with `modAmplify` unique + 2 stacks berserker_fuel:** 3500 × 1.5 × 1.5 × 1.5 = 11812 ms

### 5. Bugs and missing pieces

#### Bug 1 — `invincFrames: 500` is a dead constant
- **Defined:** `js/constants.js:123` — `rage: { ..., invincFrames: 500 }`
- **Referenced nowhere** else in the entire codebase.
- **Impact:** The advertised "brief invincibility frames on activation" does not happen. Players activating rage receive no damage protection window and can be killed mid-activation animation.

#### Bug 2 — `rageFeed` / Blood Rage perk does nothing
- **Perk defined:** `js/perks.js:87` — `rage_feed` adds 500 ms per stack to `_perkState.rageFeed`.
- **Kill hook:** `js/rounds.js:325–326` — on each kill during rage, `_perkState._rageEndTime += _perkState.rageFeed`.
- **Never consumed:** `_rageEndTime` is written but never read. The `delayedCall` scheduled in `activateRage()` fires at a fixed time; there is no mechanism to cancel, modify, or extend it based on `_rageEndTime`.
- **Impact:** The Blood Rage perk ("Kills during rage extend duration by 0.5s") has no effect whatsoever. Kills during rage are silently counted but the duration is unchanged.

#### Observation — Cooldown timing design
`activateRage()` does not set `lastModTime` at activation time (unlike `activateJump`, `activateMissiles`, etc.). `lastModTime` is set only when the ability expires. This means the effective cooldown cycle is 3500 ms active + 10500 ms post-expiry = **14000 ms total from press to reuse**, rather than the 10500 ms `cooldown` value alone. This appears intentional, not a bug, but is an architectural inconsistency with other mod functions.
