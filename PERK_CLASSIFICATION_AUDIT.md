# PERK CLASSIFICATION AUDIT
**File:** `js/perks.js` | **Game version at audit:** v7.23 | **Audit date:** 2026-03-28

---

## Constants Cross-Check (Step 1 findings)

Equipment restrictions confirmed from `js/constants.js`:

| Slot | Light | Medium | Heavy |
|------|-------|--------|-------|
| Weapons | smg, fth, sg, siphon | mg, br, sr, rail | hr, rl, plsm, gl |
| CPU mods | barrier, jump, decoy, ghost_step | barrier, atk_drone, repair, rage | barrier, missile, fortress_mode, emp |
| Shields | micro_shield, flicker_shield, smoke_burst, mirror_shield | fortress_shield, adaptive_shield, layered_shield, overcharge_shld | bulwark_shield, thermal_shield, titan_shield |
| Legs | hydraulic_boost, seismic_dampener, featherweight, ghost_legs | gyro_stabilizer, mine_layer, sprint_boosters, reactor_legs | mag_anchors, tremor_legs, suppressor_legs, warlord_stride |
| Augments | threat_analyzer, ballistic_weave, neural_accel, thermal_core | target_painter, overclock_cpu, multi_drone, field_processor | reactive_plating, war_machine, suppressor_aura, heavy_loader |

**Discrepancy noted:** `LEG_SYSTEMS` section comments in `constants.js` are reversed — `seismic_dampener` is commented as "Medium chassis unique" and `sprint_boosters` as "Light chassis unique", but `CHASSIS_LEGS` (the authoritative restriction Sets) assigns `seismic_dampener` to Light and `sprint_boosters` to Medium. Classification below follows `CHASSIS_LEGS`.

---

## Universal Perks

A perk is classified UNIVERSAL when it references no chassis-specific equipment and its mechanical effect applies to generic stats regardless of loadout. **Barrier perks** are UNIVERSAL because all three chassis have barrier. **Shield perks** are UNIVERSAL because all three chassis have shields.

### Universal — Generic offense / survivability / utility (cat: `universal`)

| Perk key | Display name | Reason it is universal |
|---|---|---|
| `heavy_rounds` | Heavy Rounds | Generic +% weapon damage multiplier |
| `rapid_reload` | Rapid Fire | Generic fire rate interval reduction |
| `critical_hit` | Critical Hit | Generic crit chance — works for any weapon |
| `adrenaline` | Adrenaline | Kills restore % core HP — generic lifesteal |
| `hollow_point` | Hollow Point | +damage to enemies below 50% HP — generic |
| `incendiary` | Incendiary Rounds | % chance to ignite on any hit — generic DoT |
| `chain_reaction` | Chain Reaction | Kills trigger a small blast — generic kill effect |
| `overcharge_rounds` | Overcharge Rounds | Every 5th bullet deals 3× — generic bullet scaling |
| `thick_plating` | Thick Plating | +% all part max HP — generic survivability |
| `extended_shield` | Extended Shield | +% max shield HP — generic |
| `shield_regen` | Shield Regen | Shield regens faster — generic |
| `auto_repair` | Auto-Repair | Core regenerates HP/s — generic passive heal |
| `last_stand` | Last Stand | DR below 20% core HP — generic threshold bonus |
| `reinforced_core` | Reinforced Core | +% core max HP — generic |
| `scrap_shield` | Scrap Shield | Limb destruction absorbs damage to core — generic |
| `overclock` | Overclock | +% move speed — generic |
| `salvager` | Salvager | Loot drop rate increase — generic |
| `emp_resistance` | EMP Resistance | Enemy EMP stun reduction — generic |
| `scavenger` | Scavenger | Kill loot chance — generic |
| `salvage_protocol` | Salvage Protocol | Limb destruction guarantees loot — generic |
| `threat_scanner` | Threat Scanner | +% damage to nearby enemies — generic proximity bonus |
| `kill_streak` | Kill Streak | +% damage after kill streak — generic |
| `opportunist` | Opportunist | +damage vs stunned/slowed enemies — generic |
| `glass_cannon` | Glass Cannon | +damage / −HP tradeoff — generic stats |
| `berserker` | Berserker | +damage / no shield regen — generic tradeoff |
| `stripped_armor` | Stripped Armor | +speed / −HP tradeoff — generic stats |
| `war_machine` | War Machine | +damage / no shield / no repair — generic tradeoff |
| `apex_predator` ★ | Apex Predator | Kill streak unlocks 2× dmg, no cd, regen — generic |
| `armor_piercing` | Armor Piercing | Bullets ignore % enemy DR — generic |
| `ricochet_rounds` † | Ricochet Rounds | Bullets ricochet toward nearest enemy — generic |
| `reckless_charge` | Reckless Charge | +speed / +damage / −shield — generic tradeoff |
| `blood_pact` | Blood Pact | Kills heal / passive HP drain — generic tradeoff |
| `overdrive_protocol` | Overdrive Protocol | +fire rate / fire rate penalty doubled — generic |
| `vampiric_rounds` | Vampiric Rounds | Lifesteal / −max HP — generic tradeoff |

★ = legendary (once-only)
† = in `_hiddenPerks` set (in dictionary; not in selection pool)

### Universal — Barrier perks (cat: `barrier`)
*Barrier is available to all three chassis via `CHASSIS_CPUS`. All perks in this pool appear whenever `loadout.cpu === 'barrier'`.*

| Perk key | Display name | Reason it is universal |
|---|---|---|
| `barrier_spike` | Barrier Spike | Boosts barrier active effect — barrier is all-chassis |
| `thorns_protocol` | Thorns Protocol | Reflects damage while shield/barrier active — generic |
| `capacitor_armor` | Capacitor Armor | Shield damage absorbed charges next shot — generic |
| `barrier_extend` | Extended Field | Barrier duration increase — barrier is all-chassis |
| `barrier_cooldown` | Rapid Recharge | Barrier cooldown reduction — barrier is all-chassis |
| `barrier_reflect` | Mirror Field | Barrier reflects incoming damage — barrier is all-chassis |
| `barrier_heal` | Field Repair | HP regen while barrier is active — barrier is all-chassis |
| `barrier_emp_pop` | EMP Pop | Barrier expiry emits EMP — barrier is all-chassis |
| `barrier_speed` | Reactive Dash | +speed while barrier active — barrier is all-chassis |
| `barrier_recharge` | Overcharge | Early barrier break reduces cooldown — all-chassis |
| `barrier_legendary` ★ | Absolute Defense | Barrier duration +3s, invisible while active — all-chassis |

★ = legendary

### Universal — Shield perks (cat: `shield`)
*All three chassis have shields (`loadout.shld`). These perks appear whenever any shield is equipped.*

| Perk key | Display name | Reason it is universal |
|---|---|---|
| `reactive_shield` | Reactive Shield | Generic shield-activation damage reflect |
| `shield_regen_boost` | Fast Regen | Shield regen rate increase — generic |
| `shield_cap` | Expanded Cell | +shield max HP — generic |
| `shield_absorb` | Dense Matrix | +shield absorb % per hit — generic |
| `shield_delay` | Hardened Cell | Shield regen delay reduction — generic |
| `shield_repulse` | Repulsor | Knockback on shield break — generic |
| `shield_spike_dmg` | Feedback | Damage-back per absorbed hit — generic |
| `shield_overcharge` | Overcharge | Shield can exceed max HP — generic |
| `shield_reform` | Emergency Cell | Shield instant-reforms at 30% after break — generic |
| `shield_speed` | Agile Shell | +speed while shield above 50% — generic |
| `shield_legendary` ★ | Indestructible | Shield cannot be fully broken; +50% max — generic |

★ = legendary

**Universal perk count: 34 (generic) + 11 (barrier) + 11 (shield) = 56 total**

> **Note — 4 perks with `cat:'universal'` are MISCLASSIFIED and excluded from this table.** They appear in the universal pool and are therefore currently offered to all chassis, but each references chassis-specific equipment. Full details in the **Recommended Changes** section:
> - `blast_radius` → should be **HEAVY** (desc: "GL/RL explosion radius +25%")
> - `overclock_ii` → should be **LIGHT** (sets `jumpDisabled`; JUMP is Light-only)
> - `scorched_earth` → should be **HEAVY** ("+50% explosion damage"; only Heavy has explosive weapons)
> - `kamikaze_protocol` → should be **HEAVY** ("+60% explosion damage"; same reasoning)

---

## Light Chassis Perks

These perks reference equipment exclusive to the Light chassis. Perks with equipment-specific cats (`smg`, `sg`, `fth`, `siphon`, `jump`, `decoy`, `ghost_step`, `hydraulic_boost`, `seismic_dampener`, `featherweight`, `ghost_legs`, `threat_analyzer`) appear only in slot 4 when the matching item is equipped — which can only happen on Light. Perks with `cat:'light'` appear in slot 3 for Light only. The one misclassified universal perk (`overclock_ii`) is included here.

### Light — Chassis identity perks (cat: `light`)

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `phantom` | Phantom | Light chassis identity — bullet dodge chance |
| `hit_and_run` | Hit and Run | Light chassis identity — kill speed burst |
| `ghost_step` | Ghost Step | JUMP mod (Light-only) — cooldown reduction |
| `flicker` | Flicker | Light chassis identity — brief invincibility on hit |
| `predator` | Predator | Light chassis identity — kills charge next shot |
| `hair_trigger` | Hair Trigger | Light chassis identity — fire rate boost |
| `glass_step` | Glass Step | Light chassis identity — first hit of round dodged |
| `afterimage` | Afterimage | JUMP mod (Light-only) — decoy at launch point |
| `light_chain_kill` | Chain Kill | Light chassis identity — 3 kills = 3s invincibility |
| `light_reflex` | Combat Reflex | Light chassis identity — near-miss grants +damage |
| `light_evasion_master` | Evasion Master | Light chassis identity — dodge chance |
| `light_spectre` | Spectre | Light chassis identity — kill spawns shadow clone |
| `light_legendary` ★ | Ghost Mech | Light chassis identity — permanent detection reduction |

### Light — Misclassified universal (currently cat: `universal`, should be `light`)

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `overclock_ii` | Overclock II | JUMP mod (Light-only) — sets `_perkState.jumpDisabled`; JUMP is exclusive to Light; Medium/Heavy have no JUMP to disable so the stated cost never applies |

### Light — SMG perks (cat: `smg`)
*SMG is Light-only (`CHASSIS_WEAPONS.light`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `overheated_barrels` | Overheated Barrels | SMG — +damage & fire rate |
| `smg_mag_dump` | Mag Dump | SMG — last 4 bullets +60% damage |
| `smg_hollow` | Hollow Points | SMG — +damage at close range |
| `smg_spray` | Spray Pattern | SMG — fire rate and spread |
| `smg_rupture` | Rupture Rounds | SMG — bleed on hit |
| `smg_suppressor` | Suppressor | SMG — slow on hit |
| `smg_tracer` | Tracer Rounds | SMG — every 5th bullet 3× damage |
| `smg_burst` | Burst Trigger | SMG — first 3 shots +damage |
| `smg_range` | Extended Barrel | SMG — range dropoff extension |
| `smg_lifesteal` | Lifesteal | SMG — kills restore HP |
| `smg_ricochet` † | Ricochet | SMG — bullets bounce off cover |

† = in `_hiddenPerks`

### Light — Shotgun perks (cat: `sg`)
*Shotgun (sg) is Light-only.*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `point_blank` | Point Blank | SG — +damage within 150px |
| `sg_flechette` | Flechette | SG — extra pellets per shot |
| `sg_spread` | Wide Spread | SG — +pellets, wider cone |
| `sg_slug` | Slug Round | SG — every 3rd shot is a slug |
| `sg_reload_kd` | Pump Action Pro | SG — fire rate boost |
| `sg_range_ext` | Extended Choke | SG — effective range increase |
| `sg_momentum` | Knockback | SG — pushes enemies back |
| `sg_breacher` | Breacher | SG — +damage vs stationary enemies |
| `sg_lifesteal` | Bloodsoak | SG — kills heal HP |
| `sg_buckshot` | Dragon Breath | SG — pellets ignite enemies |
| `sg_incendiary` † | Incendiary Shell | SG — every 3rd shot incendiary |
| `sg_legendary` ★ | Point Blank Protocol | SG — max damage regardless of range |

### Light — Flamethrower perks (cat: `fth`)
*Flamethrower (fth) is Light-only.*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `fth_napalm` | Napalm | FTH — ignited enemies burn after leaving range |
| `fth_wide_cone` | Wide Cone | FTH — spread and range increase |
| `fth_afterburn` | Afterburn | FTH — ignite duration extension |
| `fth_intensity` | High Intensity | FTH — base damage boost |
| `fth_pyro_aura` | Pyro Aura | FTH — immunity to own fire damage |
| `napalm_strike` | Napalm Strike | FTH — burning ground patch at impact |
| `inferno` | Inferno | FTH — fire spreads on ignited enemy death |
| `fuel_efficiency` | Fuel Efficiency | FTH — fire rate boost |
| `melt_armor` | Melt Armor | FTH — reduces enemy DR on hit |
| `pressure_spray` | Pressure Spray | FTH — slows enemies in cone |
| `meltdown_core` ★ | Meltdown Core | FTH — passive heat aura; barrier/shield activates AoE spike |

### Light — Siphon perks (cat: `siphon`)
*Siphon is Light-only (`CHASSIS_WEAPONS.light`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `siphon_deep_drain` | Deep Drain | Siphon — 2× heal vs low-HP targets |
| `siphon_corrode` | Corroded Tether | Siphon — beamed targets take +% damage |
| `siphon_range` | Extended Filament | Siphon — beam range increase |
| `siphon_efficiency` | Thermal Recycler | Siphon — heat buildup reduction |
| `siphon_parasite` | Parasitic Link | Siphon — +speed while beam is firing |
| `siphon_wide` | Diffusion Lens | Siphon — beam width increase |
| `siphon_leech_shield` ★ | Shield Leech | Siphon — restores shield HP instead of core HP |

### Light — JUMP mod perks (cat: `jump`)
*JUMP is Light-only (`CHASSIS_CPUS.light`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `afterburner` | Afterburner | JUMP — distance and speed increase |
| `jump_slam` | Ground Slam | JUMP — landing slam damage |
| `afterimage_jump` | Afterimage | JUMP — decoy at launch point |
| `ghost_jump` | Ghost Jump | JUMP — enemies stop targeting during airtime |
| `kinetic_landing` | Kinetic Landing | JUMP — scaled landing damage within 80px |
| `double_tap_jump` | Double Tap | JUMP — 2 charges per cooldown |
| `jump_stealth` | Ghost Launch | JUMP — 1s invisibility on launch |
| `jump_reload` | Aerial Reset | JUMP — resets weapon fire delays during airtime |
| `jump_cooldown` | Quick Recovery | JUMP — cooldown reduction |
| `jump_dmg_boost` | Apex Strike | JUMP — landing slam damage boost |
| `phantom_protocol` ★ | Phantom Protocol | JUMP — 3s post-landing window: next shot 4×, pierces all |

### Light — Decoy mod perks (cat: `decoy`)
*Decoy is Light-only (`CHASSIS_CPUS.light`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `decoy_duration` | Extended Run | Decoy — duration increase |
| `decoy_damage` | Live Rounds | Decoy — fires at full damage |
| `twin_decoy` | Twin Decoy | Decoy — deploys 2 simultaneously |
| `ghost_exit` | Ghost Exit | Decoy — cloak when decoy expires |
| `decoy_cooldown` | Quick Deploy | Decoy — cooldown reduction |
| `decoy_firefast` | Suppressing Fire | Decoy — increased fire rate |
| `decoy_hp` | Reinforced Holo | Decoy — absorbs damage before dissolving |
| `decoy_taunt` | Full Taunt | Decoy — 100% enemy aggro guarantee |
| `decoy_multi` | Triple Threat | Decoy — 3 decoys at once |
| `decoy_explosive` | Explosive Holo | Decoy — explodes on destruction |
| `phantom_army` ★ | Phantom Army | Decoy — permanent non-expiring decoys (max 3) |

### Light — Ghost Step mod perks (cat: `ghost_step`)
*Ghost Step is Light-only (`CHASSIS_CPUS.light`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `gs_extend` | Extended Cloak | Ghost Step — duration increase |
| `gs_cooldown` | Quick Recharge | Ghost Step — cooldown reduction |
| `gs_damage` | Assassin | Ghost Step — first post-cloak shot +80% damage |
| `gs_speed` | Blur | Ghost Step — +speed while cloaked |
| `gs_extend_fire` | Quiet Kill | Ghost Step — kills while cloaked extend cloak |
| `gs_reflect` | Phase Shift | Ghost Step — intangible; bullets pass through |
| `gs_aoe` | Shadow Burst | Ghost Step — shockwave on exit |
| `gs_double` | Double Ghost | Ghost Step — 2 charges per cooldown |
| `gs_heal` | Mend in Shadow | Ghost Step — HP regen during cloak |
| `gs_sensor` | Threat Pulse | Ghost Step — highlights enemies through walls |
| `gs_legendary` ★ | Wraith Protocol | Ghost Step — duration tripled; 2× damage; undetectable |

### Light — Hydraulic Boost leg perks (cat: `hydraulic_boost`)
*Hydraulic Boost is Light-only (`CHASSIS_LEGS.light`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `boost_overdrive` | Overdrive | Hydraulic Boost — speed bonus increased to +35% |
| `hb_speed2` | Overdrive II | Hydraulic Boost — additional +speed |
| `hb_leg_armor` | Leg Armor | Hydraulic Boost — legs take less damage |
| `hb_slam` | Boosted Slam | Hydraulic Boost — AoE on landing |
| `hb_reload` | Sprint Fire | Hydraulic Boost — fire rate while at full speed |
| `hb_launch` | Sprint Launch | Hydraulic Boost — speed burst on sprint start |
| `hb_leg_regen` | Self Repair | Hydraulic Boost — leg HP regen |
| `hb_trail` | Slipstream | Hydraulic Boost — movement trail slows enemies |
| `hb_legendary` ★ | Mach Protocol | Hydraulic Boost — speed doubled; untargetable at full sprint |

### Light — Seismic Dampener leg perks (cat: `seismic_dampener`)
*Seismic Dampener is Light-only per `CHASSIS_LEGS.light`. (The `LEG_SYSTEMS` section comment incorrectly labels it "Medium chassis unique" — `CHASSIS_LEGS` is authoritative.)*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `sd_leg_armor` | Shock Absorb | Seismic Dampener — leg damage reduction |
| `sd_slam_boost` | Quake Amp | Seismic Dampener — slam damage increase |
| `sd_regen` | Bone Regen | Seismic Dampener — leg HP regen |
| `sd_stagger` | Earth Stomp | Seismic Dampener — heavy movement staggers nearby enemies |
| `sd_dr` | Dampened Frame | Seismic Dampener — total DR increase |
| `sd_slam_range` | Shockwave Ring | Seismic Dampener — slam radius increase |
| `sd_emp` | EMP Tremor | Seismic Dampener — slams stun enemies |
| `sd_chain3` | Cascade | Seismic Dampener — slams chain to nearby enemies |
| `sd_speed` | Ground Surge | Seismic Dampener — +speed after landing slam |
| `sd_heal` | Impact Heal | Seismic Dampener — landing slams heal HP |
| `sd_legendary` ★ | Tectonic Force | Seismic Dampener — continuous seismic waves; 500-dmg slams |

### Light — Featherweight leg perks (cat: `featherweight`)
*Featherweight is Light-only (`CHASSIS_LEGS.light`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `fw_speed` | Ultralight | Featherweight — additional +speed |
| `fw_reload` | Swift Hands | Featherweight — additional fire rate |
| `fw_evasion` | Feather Dodge | Featherweight — % chance to fully dodge hits |
| `fw_kill_speed` | Burst Sprint | Featherweight — kills grant speed burst |
| `fw_dmg` | Glass Strike | Featherweight — +damage / +damage taken tradeoff |
| `fw_crit` | Light Touch | Featherweight — crit chance on all shots |
| `fw_heal` | Rush Heal | Featherweight — kills restore HP at full speed |
| `fw_slide` | Combat Slide | Featherweight — hitbox reduction on direction change |
| `fw_adrenaline` | Adrenaline | Featherweight — below 30% HP: +speed and +damage |
| `fw_legendary` ★ | Ghost Frame | Featherweight — untargetable while moving |

### Light — Ghost Legs leg perks (cat: `ghost_legs`)
*Ghost Legs is Light-only (`CHASSIS_LEGS.light`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `gl_burst_dmg` | Pain Burst | Ghost Legs — +damage burst after trigger |
| `gl_cooldown2` | Hair Trigger | Ghost Legs — easier trigger threshold |
| `gl_shield_save` | Shield Deflect | Ghost Legs — speed burst triggers shield regen |
| `gl_chain2` | Chain Dash | Ghost Legs — multiple triggers within 3s |
| `gl_counter` | Counter Rush | Ghost Legs — next shot +50% damage after trigger |
| `gl_invuln` | Blink | Ghost Legs — 0.4s invincibility on trigger |
| `gl_speed2` | Surge | Ghost Legs — burst speed increase |
| `gl_heal` | Resilient | Ghost Legs — trigger heals HP |
| `gl_emp2` | Shock Step | Ghost Legs — burst stuns nearby enemies |
| `gl_extend2` | Long Stride | Ghost Legs — burst duration increase |
| `gl_legendary` ★ | Phantom Step | Ghost Legs — auto-activates on any damage; 1s invincibility |

### Light — Threat Analyzer aug perks (cat: `threat_analyzer`)
*Threat Analyzer is Light-only (`CHASSIS_AUGS.light`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `analyzer_deep` | Deep Scan | Threat Analyzer — resistance reduction increased to 25% |
| `ta_stack` | Deep Scan | Threat Analyzer — DR reduction per stack increase |
| `ta_duration` | Long Scan | Threat Analyzer — debuff duration increase |
| `ta_spread2` | Scan Pulse | Threat Analyzer — debuff spreads to nearby enemies |
| `ta_expose2` | Full Analysis | Threat Analyzer — analyzed targets take +% damage |
| `ta_slow2` | System Jam | Threat Analyzer — analyzed targets move slower |
| `ta_dmg` | Exploit | Threat Analyzer — +damage vs analyzed targets |
| `ta_detonate2` | Data Bomb | Threat Analyzer — analyzed enemy death explodes |
| `ta_heal` | Data Drain | Threat Analyzer — hits on analyzed target restore HP |
| `ta_chain7` | Cascade Scan | Threat Analyzer — kill cascades debuff to nearby |
| `ta_legendary` ★ | Total Analysis | Threat Analyzer — all enemies permanently debuffed |

**Light perk count: 140**
*(13 chassis + 1 misclassified universal + 11 SMG + 12 SG + 11 FTH + 7 Siphon + 11 JUMP + 11 Decoy + 11 Ghost Step + 9 Hydraulic Boost + 11 Seismic Dampener + 10 Featherweight + 11 Ghost Legs + 11 Threat Analyzer)*

---

## Medium Chassis Perks

These perks reference equipment exclusive to the Medium chassis. Perks with `cat:'medium'` appear in slot 3 for Medium only. Equipment-specific cats (`mg`, `br`, `sr`, `rail`, `rage`, `atk_drone`, `repair`, `mine_layer`, `sprint_boosters`, `reactor_legs`, `target_painter`) appear only in slot 4 when the matching item is equipped — which can only happen on Medium.

### Medium — Chassis identity perks (cat: `medium`)

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `balanced_load` | Balanced Load | Medium chassis identity — both weapons fire faster |
| `suppressor` | Suppressor | Medium chassis identity — hits slow enemies |
| `battle_rhythm` | Battle Rhythm | Medium chassis identity — per-kill damage ramp |
| `resilience` | Resilience | Medium chassis identity — destroyed arms restored each round |
| `adaptive_armor` | Adaptive Armor | Medium chassis identity — post-hit resist |
| `resonance` | Resonance | Medium chassis identity — dealing damage charges shield |
| `pressure_system` | Pressure System | Medium chassis identity — consecutive hits +damage |
| `medium_overload` | System Overload | Medium chassis identity — mod activation grants +damage |
| `medium_salvage` | Combat Salvage | Medium chassis identity — kills reduce mod cooldown |
| `medium_multi_mod` | Dual System | Medium chassis identity — two mods active simultaneously |
| `medium_apex_system` | Apex System | Medium chassis identity — mod cooldowns tick 3× faster |
| `medium_legendary` ★ | Command Unit | Medium chassis — all mod cds halved; mod activation triggers free Repair tick |

★ = legendary

### Medium — Machine Gun perks (cat: `mg`)
*Machine Gun (mg) is Medium-only (`CHASSIS_WEAPONS.medium`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `mg_heat_sink` | Heat Sink | MG — fire rate increase |
| `mg_tracer` | Tracer Rounds | MG — every 5th bullet +50% damage |
| `mg_overheat` | Overheat Rounds | MG — every 8th bullet incendiary |
| `mg_penetrator` | Penetrator | MG — bullets pierce first enemy |
| `mg_armor_strip` | Armor Strip | MG — hits reduce enemy DR |
| `mg_velocity` | High Velocity | MG — bullet speed and range damage boost |
| `mg_sustain` | Sustained Fire | MG — continuous fire ramps +damage |
| `mg_headshot` | Precision Feed | MG — 10% crit chance per bullet |
| `mg_coolant` | Coolant System | MG — fire rate boost |
| `mg_shieldbreak` | Shield Breaker | MG — ignores 30% of enemy shield absorption |
| `mg_explosive_tips` † | Explosive Tips | MG — every 10th bullet creates small explosion |
| `mg_legendary` ★ | Iron Curtain | MG — no fire rate limit; continuous fire ramps +50% damage |

† = in `_hiddenPerks`

### Medium — Battle Rifle perks (cat: `br`)
*Battle Rifle (br) is Medium-only.*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `br_marksman` | Marksman | BR — first shot after full cycle +damage |
| `br_burst_chain` | Chain Burst | BR — kills reset burst cooldown |
| `br_penetrate` | Penetrating Fire | BR — bullets pierce one enemy |
| `br_headhunter` | Headhunter | BR — first shot of burst +50% damage |
| `br_stagger` | Stagger Rounds | BR — bursts briefly stagger enemies |
| `br_scope` | Long Barrel | BR — +damage at range over 300px |
| `br_mag_size` | Extended Mag | BR — 4-round bursts instead of 3 |
| `br_reload` | Fast Hands | BR — fire rate increase |
| `br_tracking` | Target Tracking | BR — each successive burst hit deals more damage |
| `br_explosive_tip` | Explosive Tip | BR — last bullet of burst causes explosion |
| `br_crit_burst` † | Critical Burst | BR — full burst hitting = last bullet 3× damage |
| `br_legendary` ★ | Decimator Protocol | BR — 6-round bursts; every 3rd burst auto-fires bonus burst |

### Medium — Sniper Rifle perks (cat: `sr`)
*Sniper Rifle (sr) is Medium-only.*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `cold_shot` | Cold Shot | SR — first shot after full cooldown deals 3× damage |
| `sr_breath` | Steady Breath | SR — +damage while standing still |
| `one_shot` | One Shot | SR — killing target halves fire interval |
| `penetrator` | Penetrator | SR — +damage per 200px traveled |
| `sr_explosive` | Explosive Round | SR — impact creates 80px explosion |
| `sr_chain` | Chain Shot | SR — kill ricochets bullet to nearest enemy |
| `sr_scope_in` | Scope Mastery | SR — stationary 1s+ grants +30% damage |
| `sr_reload` | Bolt Action Pro | SR — fire rate increase |
| `sr_mark` | Death Mark | SR — hit marks target for +30% damage to all sources |
| `sr_ghost_bullet` | Ghost Round | SR — bullets invisible until impact |
| `sr_double_shot` † | Double Shot | SR — 20% chance to fire second bullet immediately |
| `sr_legendary` ★ | One Shot Protocol | SR — 600 base damage; kills grant invincibility and reset fire rate |

### Medium — Railgun perks (cat: `rail`)
*Railgun (rail) is Medium-only.*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `rail_capacitor` | Capacitor | RAIL — charge time reduction |
| `rail_overload` | Overload | RAIL — +damage per enemy pierced |
| `snap_charge` | Snap Charge | RAIL — first shot each round fires instantly |
| `tungsten_core` | Tungsten Core | RAIL — shots ignore enemy shields |
| `piercing_momentum` | Piercing Momentum | RAIL — each pierced enemy adds +damage for that shot |
| `rail_emp_trail` | EMP Trail | RAIL — shot leaves EMP trail |
| `rail_splinter` | Splinter Shot | RAIL — penetration splits into shards at each enemy |
| `rail_reload` | Rapid Charge | RAIL — charge time and interval reduction |
| `rail_shield_rip` | Shield Ripper | RAIL — destroys enemy shields on hit |
| `rail_afterburn` | Plasma Burn | RAIL — ignites every enemy pierced |
| `rail_chain_lightning` † | Chain Lightning | RAIL — chains to 2 additional enemies |
| `rail_legendary` ★ | Railstorm | RAIL — 3 simultaneous shots; charge time halved |

### Medium — Rage mod perks (cat: `rage`)
*Rage is Medium-only (`CHASSIS_CPUS.medium`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `berserker_fuel` | Berserker Fuel | Rage — duration increase |
| `rage_feed` | Blood Rage | Rage — kills during rage extend duration |
| `rage_speed` | War Dash | Rage — +speed while active |
| `rage_lifesteal` | Bloodthirst | Rage — kills during rage restore HP |
| `rage_cooldown` | Warpath | Rage — cooldown reduction |
| `rage_dmg_stack` | Frenzy | Rage — kills stack +damage |
| `rage_extend` | Prolonged Fury | Rage — duration increase |
| `rage_armor` | Iron Skin | Rage — grants +DR while active |
| `rage_execute` | Execute | Rage — enemies below 15% HP instantly killed |
| `rage_chain_kill` | Kill Chain | Rage — kills have chance to reset rage duration |
| `rage_legendary` ★ | Godmode Surge | Rage — full invincibility; +60% damage; kills detonate enemies |

### Medium — Attack Drone mod perks (cat: `atk_drone`)
*Attack Drone is Medium-only (`CHASSIS_CPUS.medium`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `drone_uplink` | Drone Uplink | Attack Drone — damage increase |
| `rapid_relaunch` | Rapid Relaunch | Attack Drone — cooldown reduction |
| `neural_link` | Neural Link | Attack Drone — +fire rate while drone is active |
| `swarm_logic` | Swarm Logic | Attack Drone — kills reduce drone cooldown |
| `hardened_frame` | Hardened Frame | Attack Drone — drone takes less damage |
| `overwatch` | Overwatch | Attack Drone — drone damage scales with player kills |
| `drone_burst` | Burst Fire | Attack Drone — drone fires in 3-shot bursts |
| `drone_shield` | Shield Siphon | Attack Drone — drone hits restore shield HP |
| `drone_emp5` | EMP Drone | Attack Drone — every 5th shot stuns target |
| `drone_range` | Extended Range | Attack Drone — targeting range increase |
| `autonomous_unit` ★ | Autonomous Unit | Attack Drone — auto-deploys each round; respawns on death |

### Medium — Repair Drone mod perks (cat: `repair`)
*Repair Drone is Medium-only (`CHASSIS_CPUS.medium`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `repair_boost` | Overclocked | Repair Drone — heal rate increase |
| `repair_full_arm` | Full Restore | Repair Drone — heals all limb types |
| `repair_cooldown` | Quick Deploy | Repair Drone — cooldown reduction |
| `repair_shield` | Shield Splice | Repair Drone — also restores shield HP |
| `repair_combat` | Combat Medic | Repair Drone — auto-activates below 25% HP |
| `repair_burst` | Burst Heal | Repair Drone — heals in instant burst |
| `repair_radius` | Field Medic | Repair Drone — passive HP/s while deployed |
| `repair_double` | Dual Drone | Repair Drone — activates two drones simultaneously |
| `repair_save` | Emergency Protocol | Repair Drone — one free activation per round at low HP |
| `repair_lifeline` | Lifeline | Repair Drone — restores full HP of most-damaged limb |
| `repair_legendary` ★ | Nanite Swarm | Repair Drone — permanent passive heal 3 HP/s; activation = full emergency restore |

### Medium — Mine Layer leg perks (cat: `mine_layer`)
*Mine Layer is Medium-only (`CHASSIS_LEGS.medium`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `mine_cluster` | Cluster Mine | Mine Layer — mines spawn 3 submunitions on detonation |
| `ml_dmg` | High Yield | Mine Layer — damage increase |
| `ml_rate` | Rapid Deploy | Mine Layer — deploy interval reduction |
| `ml_radius` | Wide Charge | Mine Layer — explosion radius increase |
| `ml_sticky` | Magnetic | Mine Layer — mines attract and stick to enemies |
| `ml_emp` | EMP Mine | Mine Layer — mines stun enemies |
| `ml_chain` | Chain Reaction | Mine Layer — explosions trigger adjacent mines |
| `ml_cloak` | Invisible Mine | Mine Layer — mines invisible until triggered |
| `ml_cluster2` | Cluster Mine | Mine Layer — mine spawns submunitions on detonation |
| `ml_count` | Dense Field | Mine Layer — deploys 2 mines per interval |
| `ml_legendary` ★ | Minefield Protocol | Mine Layer — mines every 1s; 200 dmg; infinite chain |

### Medium — Sprint Boosters leg perks (cat: `sprint_boosters`)
*Sprint Boosters is Medium-only per `CHASSIS_LEGS.medium`. (The `LEG_SYSTEMS` section comment incorrectly labels it "Light chassis unique" — `CHASSIS_LEGS` is authoritative.)*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `sb_cooldown` | Quick Tap | Sprint Boosters — cooldown reduction |
| `sb_duration` | Extended Burn | Sprint Boosters — burst duration increase |
| `sb_dmg` | Impact Run | Sprint Boosters — +damage while sprinting |
| `sb_invuln` | Phase Rush | Sprint Boosters — brief invincibility at burst start |
| `sb_trail` | Afterburn | Sprint Boosters — fire trail during sprint burst |
| `sb_reload` | Sprint Reset | Sprint Boosters — resets weapon fire delays |
| `sb_charges` | Double Tap II | Sprint Boosters — 2 charges per cooldown |
| `sb_kill_reset` | Blitz | Sprint Boosters — kills reset cooldown (30% chance) |
| `sb_stealth` | Shadow Run | Sprint Boosters — invisible during burst |
| `sb_aoe` | Shockwave Sprint | Sprint Boosters — AoE at burst start and end |
| `sb_legendary` ★ | Mach Dash | Sprint Boosters — quintupled speed; full invincibility during burst |

### Medium — Reactor Legs leg perks (cat: `reactor_legs`)
*Reactor Legs is Medium-only (`CHASSIS_LEGS.medium`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `rl2_rate` | Efficient Burn | Reactor Legs — cooldown reduction distance threshold reduced |
| `rl2_amount` | Power Surge | Reactor Legs — cooldown reduction per trigger increase |
| `rl2_speed` | Reactor Boost | Reactor Legs — +speed while active |
| `rl2_chain4` | Chain Reaction | Reactor Legs — cooldown reduction applies to all mods |
| `rl2_heal` | Kinetic Heal | Reactor Legs — HP restored per distance traveled |
| `rl2_reload` | Sprint Fire | Reactor Legs — fire rate while moving |
| `rl2_aoe` | Exhaust Trail | Reactor Legs — slow trail behind player |
| `rl2_legendary` ★ | Perpetual Motion | Reactor Legs — movement removes all cooldowns; all mods activate simultaneously |

### Medium — Target Painter aug perks (cat: `target_painter`)
*Target Painter is Medium-only (`CHASSIS_AUGS.medium`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `painter_lock` | Target Lock | Target Painter — mark duration increase |
| `tp_stack` | Deep Mark | Target Painter — stacking damage bonus per application |
| `tp_duration` | Long Mark | Target Painter — mark duration increase |
| `tp_spread` | Area Mark | Target Painter — marks spread to nearby enemies |
| `tp_heal` | Blood Trail | Target Painter — killing marked targets heals HP |
| `tp_expose` | Expose | Target Painter — marked targets have reduced DR |
| `tp_slow` | Hamstring | Target Painter — marked targets move slower |
| `tp_chain6` | Chain Mark | Target Painter — kill auto-marks nearest enemy |
| `tp_multi` | Multi-Tag | Target Painter — marks up to 3 enemies simultaneously |
| `tp_detonate` | Mark Detonate | Target Painter — marked enemy death causes explosion |
| `tp_legendary` ★ | Hunter Protocol | Target Painter — all enemies permanently marked; +60% damage bonus |

**Medium perk count: 134**
*(12 chassis + 12 MG + 12 BR + 12 SR + 12 RAIL + 11 Rage + 11 Attack Drone + 11 Repair Drone + 11 Mine Layer + 11 Sprint Boosters + 8 Reactor Legs + 11 Target Painter)*

---

## Heavy Chassis Perks

These perks reference equipment exclusive to the Heavy chassis. Perks with `cat:'heavy'` appear in slot 3 for Heavy only. Equipment-specific cats (`hr`, `rl`, `plsm`, `gl`, `emp`, `missile`, `fortress_mode`, `mag_anchors`, `tremor_legs`, `suppressor_legs`, `warlord_stride`, `reactive_plating`) appear only in slot 4 when the matching item is equipped — which can only happen on Heavy. Three misclassified universals (`blast_radius`, `scorched_earth`, `kamikaze_protocol`) are included here.

### Heavy — Chassis identity perks (cat: `heavy`)

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `fortress` | Fortress | Heavy chassis identity — take less damage |
| `siege_mode` | Siege Mode | Heavy chassis identity — +damage while moving slowly |
| `iron_will` | Iron Will | Heavy chassis identity — core cannot be one-shot |
| `reactor_core` | Reactor Core | GL/RL kills (Heavy weapons) — secondary explosion on kill |
| `titan_core` | Titan Core | Heavy chassis identity — single-hit core damage cap |
| `ground_pound` | Ground Pound | Heavy chassis identity — contact damage vs enemies |
| `iron_curtain` | Iron Curtain | Heavy chassis identity — −40% damage taken / −30% speed |
| `heavy_core_tank` | Core Reinforced | Heavy chassis identity — +50 core HP; lethal hit survives to 1 HP |
| `heavy_rampage` | Rampage | Heavy chassis identity — per-kill damage ramp |
| `heavy_wrecking_ball` | Wrecking Ball | Heavy chassis identity — contact damage |
| `heavy_endurance` | Endurance | Heavy chassis identity — passive core regen |
| `heavy_titan` | Titan Protocol | Heavy chassis identity — +200 core HP; immunity to CC |
| `heavy_legendary` ★ | Dreadnought | Heavy chassis identity — +100 core HP; +80 arm/leg; −25% all damage |

★ = legendary
**Note:** The `heavy_legendary` description includes "Rage mod cooldown halved" — Rage is Medium-only and cannot be equipped by Heavy. This is a description error; the classification `cat:'heavy'` is correct.

### Heavy — Misclassified universals (currently cat: `universal`, should be `heavy`)

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `blast_radius` | Blast Radius | GL and RL (both Heavy-only weapons) — desc explicitly says "GL/RL explosion radius +25%"; sets `blastMult` |
| `scorched_earth` | Scorched Earth | Explosion weapons (Heavy-only: GL, RL) — "+50% explosion damage"; only Heavy has explosive weapons; `blastMult` flag set but never read by any game code |
| `kamikaze_protocol` | Kamikaze Protocol | Explosion weapons (Heavy-only) — "+60% explosion damage, but all explosions also damage you"; the self-damage downside applies only via RL (`selfDamage: true`), which is Heavy-only; `blastMult` flag set but never read |

### Heavy — Heavy Rifle perks (cat: `hr`)
*Heavy Rifle (hr) is Heavy-only (`CHASSIS_WEAPONS.heavy`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `hr_devastator` | Devastator | HR — +damage and blast on impact |
| `hr_capacitor` | Capacitor Round | HR — charge between shots for +50% damage |
| `hr_blowthrough` | Blowthrough | HR — pierces all enemies in line |
| `hr_emp_shot` | EMP Shot | HR — hits disable enemy weapons for 1.5s |
| `hr_reload_boost` | Quick Cycle | HR — fire rate increase |
| `hr_splash` | Hyper Expansion | HR — shockwave at impact point |
| `hr_stagger` | Heavy Impact | HR — hits stagger large enemies |
| `hr_expose` | Armor Crack | HR — hit marks target for +25% damage to all sources |
| `hr_charge_dmg` | Overcharge | HR — base damage increase |
| `hr_twin_shot` | Twin Shot | HR — every 3rd shot fires a second bullet |
| `hr_concussive` † | Concussive Round | HR — hits stun target for 0.8s |
| `hr_legendary` ★ | Annihilator | HR — bullets explode on impact; no cooldown between shots |

† = in `_hiddenPerks`

### Heavy — Rocket Launcher perks (cat: `rl`)
*Rocket Launcher (rl) is Heavy-only.*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `rl_warhead` | Warhead | RL — explosion radius and damage increase |
| `rl_tandem` | Tandem Warhead | RL — each rocket spawns follow-up explosion |
| `afterburn` | Afterburn | RL — burning trail at impact |
| `rl_cluster_war` | Cluster Warhead | RL — explosion spawns 4 homing micro-rockets |
| `rl_propellant` | High Propellant | RL — rocket speed and radius increase |
| `rl_lock_on` | Lock-On System | RL — rockets home toward nearest enemy |
| `rl_reload` | Rapid Loader | RL — fire rate increase |
| `rl_penetrate` | Bunker Buster | RL — explosion ignores 50% enemy DR |
| `rl_self_shield` | Blast Shield | RL — self-damage further reduced |
| `rl_shockwave` | Shockwave | RL — explosion knocks enemies back 200px |
| `rl_napalm` † | Napalm Warhead | RL — explosion leaves burning ground patch |
| `rl_legendary` ★ | Doomsday Round | RL — explosion radius doubled; direct hits deal +300 damage |

### Heavy — Plasma Cannon perks (cat: `plsm`)
*Plasma Cannon (plsm) is Heavy-only.*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `plsm_overcharge` | Overcharge | PLSM — orb size and damage increase |
| `plsm_chain` | Chain Plasma | PLSM — orb chains to nearest enemy on hit |
| `plsm_pierce` | Pierce Core | PLSM — beam passes through enemies |
| `plsm_regen` | Energy Siphon | PLSM — kills restore shield HP |
| `plsm_width` | Wide Beam | PLSM — orb size increase |
| `plsm_speed` | Accelerator | PLSM — travel speed and impact damage |
| `plsm_nova` | Nova Burst | PLSM — releases energy nova on impact |
| `plsm_reload` | Capacitor Bank | PLSM — fire rate increase |
| `plsm_emp_burst` | EMP Burst | PLSM — stuns enemies in 80px on impact |
| `plsm_dmg` | Overcharge Core | PLSM — base damage increase |
| `plsm_gravity` † | Gravity Well | PLSM — pulls enemies inward before exploding |
| `plsm_legendary` ★ | Singularity | PLSM — singularity pulls all nearby enemies then explodes |

### Heavy — Grenade Launcher perks (cat: `gl`)
*Grenade Launcher (gl weapon key) is Heavy-only. Note: `cat:'gl'` in the dictionary refers to the Grenade Launcher weapon — distinct from `cat:'ghost_legs'` (Light leg).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `cluster_rounds` | Cluster Rounds | GL — explosion spawns 3 small secondary blasts |
| `gl_airburst` | Airburst | GL — grenades explode mid-air after 1.2s |
| `gl_sticky` | Sticky Round | GL — grenades stick to enemies |
| `gl_radius` | Heavy Charge | GL — explosion radius increase |
| `gl_cluster` | Cluster II | GL — explosions spawn 3 mini-grenades |
| `gl_incendiary` | Incendiary Round | GL — explosions leave burning ground patch |
| `gl_reload` | Autoloader | GL — fire rate increase |
| `gl_double` | Double Tap | GL — fires 2 grenades per trigger |
| `gl_concuss` | Concussive Blast | GL — explosions stun enemies |
| `gl_chain_det` | Chain Detonation | GL — kills trigger secondary explosion from corpse |
| `gl_toxic` † | Toxic Cloud | GL — explosions leave toxic cloud |
| `gl_legendary` ★ | Carpet Bomb | GL — 4 grenades simultaneously; radius doubled |

### Heavy — EMP mod perks (cat: `emp`)
*EMP is Heavy-only (`CHASSIS_CPUS.heavy`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `chain_emp` | Chain EMP | EMP — stun chains to 2nd nearby enemy |
| `emp_amplifier` | Amplifier | EMP — stun duration and area increase |
| `emp_reload_dmg` | Post-EMP Strike | EMP — +damage to stunned enemies |
| `emp_pulse` | Pulse Echo | EMP — second pulse 1.5s after first |
| `emp_slow` | Residual Jam | EMP — stun fades into movement slow |
| `emp_cooldown` | Fast Charge | EMP — cooldown reduction |
| `emp_shieldstrip` | Shield Wipe | EMP — fully destroys enemy shields |
| `emp_overload` | Overload | EMP — stunned enemies take +% damage |
| `emp_radius` | Wide Field | EMP — radius increase |
| `emp_detonate` | Detonate | EMP — stun ends in explosion on each enemy |
| `emp_legendary` ★ | Cascade Pulse | EMP — chains between all enemies within 500px |

### Heavy — Missile Pod mod perks (cat: `missile`)
*Missile Pod is Heavy-only (`CHASSIS_CPUS.heavy`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `missile_count` | Extra Payload | Missiles — +2 missiles per activation |
| `missile_dmg` | Warhead Boost | Missiles — damage increase |
| `missile_cooldown` | Fast Launch | Missiles — cooldown reduction |
| `missile_cluster` | Cluster Head | Missiles — each missile spawns submunitions |
| `missile_smart` | Smart Lock | Missiles — target up to 6 enemies |
| `missile_emp` | EMP Warhead | Missiles — stun on impact |
| `missile_incend` | Incendiary | Missiles — ignite on impact |
| `missile_speed` | High Velocity | Missiles — travel speed and homing radius |
| `missile_chain` | Chain Seeker | Missiles — re-seek after killing target |
| `missile_shield` | Shield Buster | Missiles — ignore enemy shield absorption |
| `missile_legendary` ★ | Hellfire | Missiles — count tripled; simultaneous tracking; volley bonus |

### Heavy — Fortress Mode mod perks (cat: `fortress_mode`)
*Fortress Mode is Heavy-only (`CHASSIS_CPUS.heavy`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `fm_extend` | Extended Hold | Fortress Mode — duration increase |
| `fm_cooldown` | Quick Reset | Fortress Mode — cooldown reduction |
| `fm_dmg` | Siege Damage | Fortress Mode — also grants +damage while active |
| `fm_heal` | Fortify | Fortress Mode — heal rate increase |
| `fm_aoe` | Retribution | Fortress Mode — reflects incoming damage as AoE |
| `fm_end_burst` | Breakout | Fortress Mode — expiry releases shockwave |
| `fm_immunity` | Ironclad | Fortress Mode — immunity to DoT effects |
| `fm_speed` | Rapid Advance | Fortress Mode — no movement speed penalty |
| `fm_kill_extend` | Last Stand | Fortress Mode — kills extend duration |
| `fm_shield_regen` | Bulwark | Fortress Mode — shield regen while active |
| `fm_legendary` ★ | Colossus Mode | Fortress Mode — duration doubled; full invincibility; 60% slow aura |

### Heavy — Mag Anchors leg perks (cat: `mag_anchors`)
*Mag Anchors is Heavy-only (`CHASSIS_LEGS.heavy`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `anchor_fortress` | Fortress Mode | Mag Anchors — DR while stationary increased to 35% |
| `ma_aoe_lock` | Rooted Burst | Mag Anchors — shockwave when anchoring |
| `ma_reload` | Planted Hands | Mag Anchors — fire rate while anchored |
| `ma_regen` | Anchor Regen | Mag Anchors — core HP regen while anchored |
| `ma_crit` | Target Lock | Mag Anchors — crit chance while anchored |
| `ma_shield_regen` | Static Hold | Mag Anchors — shield regen rate doubled while anchored |
| `ma_legendary` ★ | Immovable Object | Mag Anchors — +40% DR; +40% damage; 5 HP/s regen while anchored |

### Heavy — Tremor Legs leg perks (cat: `tremor_legs`)
*Tremor Legs is Heavy-only (`CHASSIS_LEGS.heavy`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `tl_dmg` | Heavy Tremor | Tremor Legs — tremor damage increase |
| `tl_radius2` | Wide Tremor | Tremor Legs — tremor radius increase |
| `tl_slow` | Quake | Tremor Legs — tremor slows enemies |
| `tl_fire` | Magma Tremor | Tremor Legs — tremor ignites enemies |
| `tl_emp2` | EMP Tremor | Tremor Legs — tremor stuns enemies |
| `tl_chain5` | Aftershock | Tremor Legs — tremor triggers second smaller tremor |
| `tl_heal` | Ground Surge | Tremor Legs — each tremor restores HP |
| `tl_cd` | Restless | Tremor Legs — tremor cooldown reduction |
| `tl_legendary` ★ | Magnitude 10 | Tremor Legs — 300 dmg / 300px; drops 3 mines; triggers while stationary |

### Heavy — Suppressor Legs leg perks (cat: `suppressor_legs`)
*Suppressor Legs is Heavy-only (`CHASSIS_LEGS.heavy`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `sl_radius2` | Wide Aura | Suppressor Legs — aura radius increase |
| `sl_slow2` | Deep Slow | Suppressor Legs — slow effect increase |
| `sl_fear` | Intimidate | Suppressor Legs — enemies in aura deal less damage |
| `sl_dmg` | Suppression Strike | Suppressor Legs — +damage vs slowed enemies |
| `sl_heal` | Drain | Suppressor Legs — drain HP from enemies in aura |
| `sl_emp3` | Pulse Shock | Suppressor Legs — periodic stun pulse from aura |
| `sl_fire2` | Heated Aura | Suppressor Legs — aura ignites enemies |
| `sl_mark` | Target Lock | Suppressor Legs — enemies in aura marked for +damage |
| `sl_reload` | Pressure Cooker | Suppressor Legs — fire rate while enemies are in aura |
| `sl_dmg2` | Suppressor Core | Suppressor Legs — player damage increase |
| `sl_legendary` ★ | Dominion Field | Suppressor Legs — aura tripled; 60% slow; 40% less damage from enemies; 5 HP/s drain |

### Heavy — Warlord Stride leg perks (cat: `warlord_stride`)
*Warlord Stride is Heavy-only (`CHASSIS_LEGS.heavy`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `ws_threshold` | Iron Threshold | Warlord Stride — bonus activates at 70% leg HP instead of 50% |
| `ws_dmg` | Close Quarters | Warlord Stride — close-range damage bonus increase |
| `ws_speed2` | War March | Warlord Stride — speed bonus increase |
| `ws_heal` | Combat Vitality | Warlord Stride — close-range kills heal HP |
| `ws_leg_regen` | Warlord Repair | Warlord Stride — leg HP regen |
| `ws_aura` | War Aura | Warlord Stride — nearby enemies slowed while active |
| `ws_reflect` | Iron Fist | Warlord Stride — close-range hits deal damage back to attacker |
| `ws_crit` | Warlord Precision | Warlord Stride — crit chance while active |
| `ws_fear` | Imposing | Warlord Stride — enemies deal less damage while active |
| `ws_shield` | Blood Shield | Warlord Stride — close-range kills restore shield HP |
| `ws_legendary` ★ | Apex Warlord | Warlord Stride — bonus never expires; +40% close-range damage; +20% speed |

### Heavy — Reactive Plating aug perks (cat: `reactive_plating`)
*Reactive Plating is Heavy-only (`CHASSIS_AUGS.heavy`).*

| Perk key | Display name | Equipment referenced |
|---|---|---|
| `plating_stacks` | Dense Weave | Reactive Plating — max stacks increased to 8 |
| `rp_decay` | Durable Stack | Reactive Plating — stacks decay slowly rather than resetting |
| `rp_cap` | More Plates | Reactive Plating — max stacks increase |
| `rp_val` | Thick Plate | Reactive Plating — DR per stack increase |
| `rp_regen` | Plate Regen | Reactive Plating — HP regen at max stacks |
| `rp_reflect2` | Ricochet | Reactive Plating — reflects incoming damage at max stacks |
| `rp_fast` | Quick Stack | Reactive Plating — reaches max stacks in 2 hits |
| `rp_shield` | Shield Plate | Reactive Plating — stacks also grant +shield HP |
| `rp_dmg` | Battle Hardened | Reactive Plating — +damage at max stacks |
| `rp_lifesteal` | Siphon Plating | Reactive Plating — kills restore HP at max stacks |
| `rp_legendary` ★ | Living Armor | Reactive Plating — stacks never reset; max 10; full DR at max |

**Heavy perk count: 146**
*(13 chassis + 3 misclassified universals + 12 HR + 12 RL + 12 PLSM + 12 GL + 11 EMP + 11 Missile + 11 Fortress Mode + 7 Mag Anchors + 9 Tremor Legs + 11 Suppressor Legs + 11 Warlord Stride + 11 Reactive Plating)*

---

## Multi-Chassis Perks

**None.** Every piece of equipment is exclusive to exactly one chassis except `barrier` (all three). No perk references exactly two chassis worth of equipment. All barrier perks are fully universal and are classified as such.

---

## Summary

| Classification | Count | Notes |
|---|---|---|
| **UNIVERSAL** | **56** | 34 generic + 11 barrier + 11 shield |
| **LIGHT** | **140** | 13 chassis + 1 misclassified universal + 11 SMG + 12 SG + 11 FTH + 7 Siphon + 11 JUMP + 11 Decoy + 11 Ghost Step + 9 Hydraulic Boost + 11 Seismic Dampener + 10 Featherweight + 11 Ghost Legs + 11 Threat Analyzer |
| **MEDIUM** | **134** | 12 chassis + 12 MG + 12 BR + 12 SR + 12 RAIL + 11 Rage + 11 Attack Drone + 11 Repair Drone + 11 Mine Layer + 11 Sprint Boosters + 8 Reactor Legs + 11 Target Painter |
| **HEAVY** | **146** | 13 chassis + 3 misclassified universals + 12 HR + 12 RL + 12 PLSM + 12 GL + 11 EMP + 11 Missile + 11 Fortress Mode + 7 Mag Anchors + 9 Tremor Legs + 11 Suppressor Legs + 11 Warlord Stride + 11 Reactive Plating |
| **Total in dictionary** | **476** | |

> **Total reconciliation:** 56 + 140 + 134 + 146 = 476. The grep-counted total was 477; the one-count difference is because `plating_stacks` appears both in the early "AUGMENT PERKS" sub-section (line 118) and is also counted in the dedicated `reactive_plating` block — it is a single perk catalogued once above. The grep double-counts one `cat:` token. The true unique perk count is **476**.

### Perks currently missing a chassis restriction that should have one: **4**

These four perks have `cat:'universal'` in the dictionary and therefore appear in the **universal pool** (slots 1 and 2) for all three chassis. Each references equipment that only one chassis can use:

| Perk key | Current cat | Should be | Impact of misclassification |
|---|---|---|---|
| `blast_radius` | `universal` | `heavy` | Offered to Light and Medium players who have no GL or RL — the perk does nothing for them |
| `overclock_ii` | `universal` | `light` | Offered to Medium and Heavy players — `jumpDisabled` has no effect on them (they cannot equip JUMP), so the stated tradeoff disappears and they receive +30% speed for free |
| `scorched_earth` | `universal` | `heavy` | Offered to Light and Medium players who have no explosive weapons — the `blastMult` and `scorchedEarth` flags are also never read by game code, making this perk doubly inert for non-Heavy |
| `kamikaze_protocol` | `universal` | `heavy` | Offered to Light and Medium players — the explosion damage boost is irrelevant without GL/RL; the self-damage downside only manifests via RL (`selfDamage: true`), which is Heavy-only |

### Additional finding — `_hiddenPerks` classification

All 11 hidden perks are already in the correct chassis category:

| Perk key | Cat | Correct chassis |
|---|---|---|
| `ricochet_rounds` | `universal` | UNIVERSAL |
| `smg_ricochet` | `smg` | LIGHT |
| `mg_explosive_tips` | `mg` | MEDIUM |
| `sg_incendiary` | `sg` | LIGHT |
| `br_crit_burst` | `br` | MEDIUM |
| `hr_concussive` | `hr` | HEAVY |
| `sr_double_shot` | `sr` | MEDIUM |
| `gl_toxic` | `gl` | HEAVY |
| `rl_napalm` | `rl` | HEAVY |
| `plsm_gravity` | `plsm` | HEAVY |
| `rail_chain_lightning` | `rail` | MEDIUM |

### Additional finding — `blastMult` flag is unimplemented

`_perkState.blastMult` is set by `blast_radius`, `rl_warhead`, `scorched_earth`, and `kamikaze_protocol`, but is **never read** in `combat.js`, `mods.js`, `events.js`, or any other game file. The `createExplosion()` function in `combat.js` takes hardcoded `radius` and `damage` parameters. This means explosion-radius and explosion-damage perks have no in-game effect. This is a secondary bug; fixing the chassis restrictions is a prerequisite to implementing the stat.

### Additional finding — `jumpDisabled` flag is unimplemented

`_perkState.jumpDisabled` is set by `overclock_ii` but **never read** in `events.js` or `mods.js`. JUMP activation code in `mods.js` does not check this flag, so the stated tradeoff of `overclock_ii` has no effect for anyone.

### Additional finding — `heavy_legendary` description error

`heavy_legendary` (`Dreadnought`) description says "Rage mod cooldown halved". Rage is Medium-only and cannot be equipped by Heavy. The classification `cat:'heavy'` is correct, but the description references wrong-chassis equipment. The description should reference a Heavy mod (Fortress Mode or Missiles).

### Additional finding — `seismic_dampener` / `sprint_boosters` comment inversion

In `js/constants.js`, the `LEG_SYSTEMS` object has section comments that incorrectly label `sprint_boosters` as "Light chassis unique" and `seismic_dampener` as "Medium chassis unique". The `CHASSIS_LEGS` restriction Sets (authoritative) correctly assign `seismic_dampener` → Light and `sprint_boosters` → Medium. No perk is misclassified as a result, but the comments are misleading.

---

## Recommended Changes

### Priority 1 — Fix misclassified universal perks (4 perks, all currently in the universal pool)

Each of the following perks should be moved out of the universal pool. The simplest fix is to change `cat` from `'universal'` to the appropriate chassis key so `selectPerks()` places them in slot 3 (chassis pool) rather than slots 1–2 (universal pool).

---

**1. `blast_radius` → restrict to Heavy**

```
Current:  cat: 'universal'
Proposed: cat: 'heavy'
```
Reason: The description explicitly names GL and RL ("GL/RL explosion radius +25%"), both Heavy-only weapons. A Light or Medium player who picks this perk cannot trigger it. Additionally, `blastMult` is currently unimplemented — fixing chassis restriction should accompany implementing the stat in `createExplosion()`.

Chassis currently offered this perk that cannot use it: **Light**, **Medium**

---

**2. `overclock_ii` → restrict to Light**

```
Current:  cat: 'universal', once: true
Proposed: cat: 'light',     once: true
```
Reason: The perk sets `_perkState.jumpDisabled = true`. JUMP is Light-only (`CHASSIS_CPUS.light`). Medium and Heavy players have no JUMP to disable, so the stated cost never activates — they receive +30% speed at no actual tradeoff. This is an unintentional power imbalance. Additionally, `jumpDisabled` is currently unimplemented (never read by activation code), so fixing chassis restriction should accompany reading the flag in `mods.js` `activateJump()`.

Chassis currently offered this perk that cannot use the referenced equipment: **Medium**, **Heavy**

---

**3. `scorched_earth` → restrict to Heavy**

```
Current:  cat: 'universal', once: true
Proposed: cat: 'heavy',     once: true
```
Reason: "+50% explosion damage" — only Heavy chassis has explosive weapons (GL, RL). Light and Medium have no use for an explosion damage multiplier. The `blastMult` flag is also unimplemented (see above). The `scorchedEarth` flag (loot orbs destroyed at round start) is also set but never read by `rounds.js`.

Chassis currently offered this perk that cannot use it: **Light**, **Medium**

---

**4. `kamikaze_protocol` → restrict to Heavy**

```
Current:  cat: 'universal', once: true
Proposed: cat: 'heavy',     once: true
```
Reason: "+60% explosion damage, but all explosions also damage you" — the benefit requires explosive weapons (GL, RL = Heavy-only). The self-damage downside is meaningful only with RL (`selfDamage: true`), which is Heavy-only. For Light and Medium the perk is both useless and harmless — a waste of a perk slot. `blastMult` and `kamikazeProtocol` flags are both unimplemented.

Chassis currently offered this perk that cannot use it: **Light**, **Medium**

---

### Priority 2 — Description error (no code change required, description only)

**5. `heavy_legendary` description fix**

```
Current desc:  "… All incoming damage reduced by 25%. Rage mod cooldown halved."
Proposed desc: "… All incoming damage reduced by 25%. Fortress Mode cooldown halved."
  (or: "Missile Pod cooldown halved." — whichever is more appropriate for Heavy identity)
```
Rage is Medium-only. The cat is already `'heavy'`, so this is a display error only — the perk is correctly restricted. The `heavyDreadnought` state flag is set but also currently unimplemented (never read in game code).

---

### Priority 3 — Implement unread state flags (out of scope for this audit, noted for completeness)

The following `_perkState` flags are set by perks but never read in any game file. The perks that set them have **no in-game effect**. Implementing them is separate work but should be coordinated with the chassis-restriction fixes above since some flags (`blastMult`, `jumpDisabled`) are central to the misclassified perks.

| Flag | Set by | Never read in |
|---|---|---|
| `blastMult` (re explosion radius/damage) | `blast_radius`, `rl_warhead`, `scorched_earth`, `kamikaze_protocol` | `combat.js` `createExplosion()` |
| `jumpDisabled` | `overclock_ii` | `mods.js` `activateJump()` |
| `scorchedEarth` | `scorched_earth` | `rounds.js` (loot orb destruction) |
| `kamikazeProtocol` | `kamikaze_protocol` | `combat.js` (self-damage on explosion) |
| `heavyDreadnought` | `heavy_legendary` | all game files |
