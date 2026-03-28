# PERK_RENAME_MAP

Audit generated from `js/perks.js`. Audit-only session — no code changes made.

---

## Perks to Remove (25 perks)

These perks will be deleted in Session 2. They are excluded from all rename tables.

| Key | Display Name |
|-----|-------------|
| `scavenger` | Scavenger |
| `salvage_protocol` | Salvage Protocol |
| `salvager` | Salvager |
| `kill_streak` | Kill Streak |
| `apex_predator` | Apex Predator |
| `adrenaline` | Adrenaline |
| `rapid_reload` | Rapid Fire |
| `emp_resistance` | EMP Resistance |
| `capacitor_armor` | Capacitor Armor |
| `thorns_protocol` | Thorns Protocol |
| `hit_and_run` | Hit and Run |
| `predator` | Predator |
| `glass_step` | Glass Step |
| `light_chain_kill` | Chain Kill |
| `light_reflex` | Combat Reflex |
| `flicker` | Flicker |
| `smg_mag_dump` | Mag Dump |
| `smg_spray` | Spray Pattern |
| `smg_burst` | Burst Trigger |
| `sg_slug` | Slug Round |
| `sg_breacher` | Breacher |
| `fth_pyro_aura` | Pyro Aura |
| `ghost_jump` | Ghost Jump |
| `jump_stealth` | Ghost Launch |
| `jump_reload` | Aerial Reset |

---

## Mandatory Renames (13 renames)

Confirmed by Zac — use these exact names.

| Old Key | New Key |
|---------|---------|
| `reactive_shield` | `shield_reactive` |
| `phantom` | `light_phantom` |
| `ghost_step` | `light_ghost_step` |
| `hair_trigger` | `light_hair_trigger` |
| `afterimage` | `light_afterimage` |
| `overheated_barrels` | `smg_overheated_barrels` |
| `point_blank` | `sg_point_blank` |
| `napalm_strike` | `fth_napalm_strike` |
| `inferno` | `fth_inferno` |
| `fuel_efficiency` | `fth_fuel_efficiency` |
| `melt_armor` | `fth_melt_armor` |
| `pressure_spray` | `fth_pressure_spray` |
| `meltdown_core` | `fth_meltdown_core` |

---

## Auto-Detected Renames

Every non-conforming perk not in the mandatory list and not being removed.

| Old Key | New Key | Cat | Reason |
|---------|---------|-----|--------|
| `blast_radius` | `heavy_blast_radius` | `heavy` | missing `heavy_` prefix |
| `scorched_earth` | `heavy_scorched_earth` | `heavy` | missing `heavy_` prefix |
| `fortress` | `heavy_fortress` | `heavy` | missing `heavy_` prefix |
| `siege_mode` | `heavy_siege_mode` | `heavy` | missing `heavy_` prefix |
| `iron_will` | `heavy_iron_will` | `heavy` | missing `heavy_` prefix |
| `reactor_core` | `heavy_reactor_core` | `heavy` | missing `heavy_` prefix |
| `titan_core` | `heavy_titan_core` | `heavy` | missing `heavy_` prefix |
| `ground_pound` | `heavy_ground_pound` | `heavy` | missing `heavy_` prefix |
| `iron_curtain` | `heavy_iron_curtain` | `heavy` | missing `heavy_` prefix |
| `kamikaze_protocol` | `heavy_kamikaze_protocol` | `heavy` | missing `heavy_` prefix |
| `overclock_ii` | `light_overclock_ii` | `light` | missing `light_` prefix |
| `balanced_load` | `medium_balanced_load` | `medium` | missing `medium_` prefix |
| `suppressor` | `medium_suppressor` | `medium` | missing `medium_` prefix |
| `battle_rhythm` | `medium_battle_rhythm` | `medium` | missing `medium_` prefix |
| `resilience` | `medium_resilience` | `medium` | missing `medium_` prefix |
| `adaptive_armor` | `medium_adaptive_armor` | `medium` | missing `medium_` prefix |
| `resonance` | `medium_resonance` | `medium` | missing `medium_` prefix |
| `pressure_system` | `medium_pressure_system` | `medium` | missing `medium_` prefix |
| `cold_shot` | `sr_cold_shot` | `sr` | missing `sr_` prefix |
| `one_shot` | `sr_one_shot` | `sr` | missing `sr_` prefix |
| `penetrator` | `sr_penetrator` | `sr` | missing `sr_` prefix |
| `cluster_rounds` | `gl_cluster_rounds` | `gl` | missing `gl_` prefix |
| `afterburn` | `rl_afterburn` | `rl` | missing `rl_` prefix |
| `snap_charge` | `rail_snap_charge` | `rail` | missing `rail_` prefix |
| `tungsten_core` | `rail_tungsten_core` | `rail` | missing `rail_` prefix |
| `piercing_momentum` | `rail_piercing_momentum` | `rail` | missing `rail_` prefix |
| `berserker_fuel` | `rage_fuel` | `rage` | `berserker` redundant in rage context; descriptive part is `fuel` |
| `afterburner` | `jump_afterburner` | `jump` | missing `jump_` prefix |
| `afterimage_jump` | `jump_afterimage` | `jump` | `_jump` suffix redundant once `jump_` prefix added |
| `kinetic_landing` | `jump_kinetic_landing` | `jump` | missing `jump_` prefix |
| `double_tap_jump` | `jump_double_tap` | `jump` | `_jump` suffix redundant once `jump_` prefix added |
| `phantom_protocol` | `jump_phantom_protocol` | `jump` | missing `jump_` prefix |
| `twin_decoy` | `decoy_twin` | `decoy` | missing `decoy_` prefix |
| `ghost_exit` | `decoy_ghost_exit` | `decoy` | missing `decoy_` prefix |
| `phantom_army` | `decoy_phantom_army` | `decoy` | missing `decoy_` prefix |
| `chain_emp` | `emp_chain` | `emp` | missing `emp_` prefix |
| `rapid_relaunch` | `drone_relaunch` | `atk_drone` | missing `drone_` prefix; `rapid` dropped (adjective, not key identifier) |
| `neural_link` | `drone_neural_link` | `atk_drone` | missing `drone_` prefix |
| `swarm_logic` | `drone_swarm_logic` | `atk_drone` | missing `drone_` prefix |
| `hardened_frame` | `drone_hardened_frame` | `atk_drone` | missing `drone_` prefix |
| `overwatch` | `drone_overwatch` | `atk_drone` | missing `drone_` prefix |
| `autonomous_unit` | `drone_autonomous_unit` | `atk_drone` | missing `drone_` prefix |
| `painter_lock` | `tp_lock` | `target_painter` | missing `tp_` prefix; `painter` redundant with tp context |
| `analyzer_deep` | `ta_deep` | `threat_analyzer` | missing `ta_` prefix; `analyzer` redundant with ta context |
| `plating_stacks` | `rp_stacks` | `reactive_plating` | missing `rp_` prefix; `plating` redundant with rp context |
| `boost_overdrive` | `hb_overdrive` | `hydraulic_boost` | missing `hb_` prefix; `boost` redundant with hb context |
| `mine_cluster` | `ml_cluster` | `mine_layer` | missing `ml_` prefix; `mine` redundant with ml context |
| `anchor_fortress` | `ma_fortress` | `mag_anchors` | missing `ma_` prefix; `anchor` redundant with ma context |
| `gl_burst_dmg` | `gleg_burst_dmg` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; correct prefix is `gleg_` |
| `gl_cooldown2` | `gleg_cooldown` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; `2` suffix dropped as redundant |
| `gl_shield_save` | `gleg_shield_save` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; correct prefix is `gleg_` |
| `gl_chain2` | `gleg_chain` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; `2` suffix dropped as redundant |
| `gl_counter` | `gleg_counter` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; correct prefix is `gleg_` |
| `gl_invuln` | `gleg_invuln` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; correct prefix is `gleg_` |
| `gl_speed2` | `gleg_speed` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; `2` suffix dropped as redundant |
| `gl_heal` | `gleg_heal` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; correct prefix is `gleg_` |
| `gl_emp2` | `gleg_emp` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; `2` suffix dropped as redundant |
| `gl_extend2` | `gleg_extend` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; `2` suffix dropped as redundant |
| `gl_legendary` | `gleg_legendary` | `ghost_legs` | uses `gl_` (grenade launcher) prefix; correct prefix is `gleg_` |

---

## Already Conforming (no change needed)

379 perks already follow the naming convention. Count by prefix:

| Prefix | Cat | Count |
|--------|-----|-------|
| *(none — descriptive)* | `universal` | 26 |
| `light_` | `light` | 3 |
| `medium_` | `medium` | 5 |
| `heavy_` | `heavy` | 6 |
| `smg_` | `smg` | 7 |
| `sg_` | `sg` | 9 |
| `mg_` | `mg` | 12 |
| `br_` | `br` | 12 |
| `sr_` | `sr` | 9 |
| `gl_` | `gl` (grenade launcher) | 11 |
| `rl_` | `rl` (rocket launcher) | 11 |
| `plsm_` | `plsm` | 12 |
| `rail_` | `rail` | 9 |
| `fth_` | `fth` | 4 |
| `hr_` | `hr` | 12 |
| `siphon_` | `siphon` | 7 |
| `barrier_` | `barrier` | 9 |
| `shield_` | `shield` | 10 |
| `jump_` | `jump` | 2 |
| `decoy_` | `decoy` | 8 |
| `rage_` | `rage` | 10 |
| `gs_` | `ghost_step` | 11 |
| `drone_` | `atk_drone` | 5 |
| `emp_` | `emp` | 10 |
| `fm_` | `fortress_mode` | 11 |
| `repair_` | `repair` | 11 |
| `missile_` | `missile` | 11 |
| `hb_` | `hydraulic_boost` | 8 |
| `ml_` | `mine_layer` | 10 |
| `ma_` | `mag_anchors` | 6 |
| `fw_` | `featherweight` | 10 |
| `sb_` | `sprint_boosters` | 11 |
| `gleg_` | `ghost_legs` | 0 |
| `sd_` | `seismic_dampener` | 11 |
| `rl2_` | `reactor_legs` | 8 |
| `tl_` | `tremor_legs` | 9 |
| `sl_` | `suppressor_legs` | 11 |
| `ws_` | `warlord_stride` | 11 |
| `tp_` | `target_painter` | 10 |
| `ta_` | `threat_analyzer` | 10 |
| `rp_` | `reactive_plating` | 10 |

---

## Summary

- Total perks in dictionary: 476
- Total perks being removed: 25
- Total perks being renamed: 72 (13 mandatory + 59 auto-detected)
- Total perks already conforming: 379
- **Total perks after cleanup: 451**

> Note: 11 `ghost_legs` perks all carry the wrong `gl_` prefix (collision with grenade launcher). Every one of the 11 `ghost_legs` perks needs renaming to `gleg_`. No `ghost_legs` perks are already conforming.
