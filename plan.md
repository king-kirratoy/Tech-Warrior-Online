# Implementation Plan

## 1. Fix: Twin Razors extraction point bug
**Root cause:** Boss rounds set `_roundTotal = 1`, but Twin Razors spawns 2 enemies. Additionally, the death handling code (lines 10006-10122) has no try-catch around the section between the death check and `onEnemyKilled`, meaning any error in loot spawning, elite death effects, or visual cleanup could silently prevent `onEnemyKilled` from being called — which means `_roundKills` never increments and extraction never spawns.

**Fixes:**
- In `spawnTwinRazors()`, set `_roundTotal = 2` after spawning both enemies so both must die before extraction
- Wrap the death handling code in a try-catch to ensure `onEnemyKilled` is always called even if a preceding operation fails
- Add a safety-net periodic check: if all enemies in the group are dead but `_roundKills < _roundTotal`, force extraction spawn

## 2. Chassis-specific loot drops
**Current state:** `generateItem()` picks random weapon/equipment types without checking if the player's current chassis can equip them. Drops can include weapons like `rl` (rocket launcher) for a light mech that can only use `smg, br, fth, sg, sr`.

**Fix:** In `generateItem()` (loot-system.js), filter the weapon/equipment pool to only items the current chassis can equip:
- Weapons: filter `WEAPON_LOOT_KEYS` against `CHASSIS_WEAPONS[loadout.chassis]`
- Mods: filter against `CHASSIS_MODS[loadout.chassis]`
- Shields: filter against `CHASSIS_SHIELDS[loadout.chassis]`
- Legs: filter against `CHASSIS_LEGS[loadout.chassis]`
- Augments: filter against `CHASSIS_AUGS[loadout.chassis]`
- Boss unique items: keep as-is (they're special rewards, always drop)

## 3. Gear menu: arm weapon selection + drag-and-drop
**Current state:** `_equipItem()` auto-assigns weapons to L arm first, then R. No way to choose which arm.

**Changes:**
- When equipping a weapon from backpack, show an arm selection prompt (L ARM / R ARM buttons) instead of auto-assigning
- Implement drag-and-drop for the gear menu:
  - Backpack items can be dragged to equipped slots to equip
  - Equipped items can be dragged to backpack to unequip
  - Equipped items can be dragged to other equipped slots to swap (weapon L↔R)
  - Items dragged from backpack to an invalid slot snap back
- Visual feedback: highlight valid drop targets when dragging

## 4. Gear menu visual redesign (Diablo 4 style)
**Current layout:** 2-column grid — equipped slots on left, backpack on right, detail panel on bottom.

**New layout:**
- **Top section: EQUIPPED GEAR** — mech silhouette as background with slots positioned at body locations:
  - L ARM slot on left side of mech image
  - R ARM slot on right side of mech image
  - CHEST (armor) on center torso
  - ARMS slot on upper shoulders area
  - LEGS slot at bottom/feet area
  - SHIELD slot on one side
  - MOD CHIP slot near head/cockpit area
  - AUGMENT slot near core/center
  - Mech image is chassis-specific (light/medium/heavy) and large enough to position slots clearly
- **Bottom section: BACKPACK** — grid of inventory items, below the equipped section
- **Detail panel:** appears as overlay/tooltip when clicking an item (showing stats, comparison, equip/unequip/scrap buttons)

The mech silhouette will be drawn using Phaser-style shapes/CSS (since we don't have sprite assets yet), colored to match the player's mech color.

## 5. Combine STATS + GEAR into LOADOUT menu; rename PAUSE to MENU
**Changes:**
- Rename the in-game "PAUSE" button to "MENU"
- The pause overlay title stays "PAUSED"
- Replace STATS and GEAR buttons in pause menu with single "LOADOUT" button
- The LOADOUT menu is a single overlay combining:
  - **Left panel / top tabs:** Two tabs — "STATS" and "GEAR" — within the same overlay
  - STATS tab: all current stats content (chassis info, weapons/DPS, mobility, run stats, traits, perks, gear bonuses)
  - GEAR tab: the redesigned inventory/equipment UI from item 4
- Keep MAIN MENU and CLOSE buttons in pause overlay
- The LOADOUT overlay has its own CLOSE button to return to pause menu or game

## File changes:
- `index.html`: Boss fix, menu HTML/CSS restructuring, pause button rename, combined LOADOUT overlay
- `js/loot-system.js`: Chassis-filtered loot drops, arm selection UI, drag-and-drop
