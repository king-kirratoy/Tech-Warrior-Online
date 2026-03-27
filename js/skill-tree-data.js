const SKILL_TREE_DATA = {
  light: [
  {
    "id": "start",
    "x": 0,
    "y": 0,
    "t": "start",
    "n": "Pilot Core",
    "d": "Your journey begins here.",
    "s": null,
    "r": 0,
    "c": [
      "node_47",
      "node_43",
      "node_46",
      "node_5",
      "node_45",
      "node_41",
      "node_44",
      "node_42"
    ]
  },
  {
    "id": "gen_dmg",
    "x": 240,
    "y": -40,
    "t": "regular",
    "n": "Weapon Calibration",
    "d": "+2% Damage",
    "s": "+2% DMG",
    "r": 2,
    "c": [
      "node_106",
      "node_107"
    ]
  },
  {
    "id": "gen_crit",
    "x": 240,
    "y": -160,
    "t": "regular",
    "n": "Targeting Matrix",
    "d": "+5% Crit Chance",
    "s": "+5% CRIT",
    "r": 2,
    "c": [
      "fth_heat",
      "path_gc"
    ]
  },
  {
    "id": "path_gc",
    "x": 280,
    "y": -160,
    "t": "regular",
    "n": "Crit Damage",
    "d": "+10% Crit Damage",
    "s": "+10% CRIT DMG",
    "r": 2,
    "c": [
      "gen_crit",
      "node_182"
    ]
  },
  {
    "id": "smg_dmg",
    "x": -220,
    "y": -200,
    "t": "regular",
    "n": "SMG Damage",
    "d": "+2% SMG Damage",
    "s": "+2% SMG DMG",
    "r": 2,
    "c": [
      "node_112",
      "node_114"
    ]
  },
  {
    "id": "smg_util",
    "x": -140,
    "y": -200,
    "t": "regular",
    "n": "SMG Fire Rate",
    "d": "+2% SMG Fire Rate",
    "s": "+2% SMG Fire Rate",
    "r": 2,
    "c": [
      "node_113",
      "smg_heat",
      "smg_notable"
    ]
  },
  {
    "id": "smg_heat",
    "x": -160,
    "y": -160,
    "t": "regular",
    "n": "SMG Heat Control",
    "d": "+5% SMG Heat",
    "s": "+5% SMG HEAT",
    "r": 2,
    "c": [
      "node_69",
      "node_112",
      "smg_util"
    ]
  },
  {
    "id": "smg_notable",
    "x": -180,
    "y": -200,
    "t": "notable",
    "n": "Bullet Specialist",
    "d": "+4% SMG Damage, +4% SMG Fire Rate",
    "s": "+4% SMG DMG +4% SMG Fire Rate",
    "r": 1,
    "c": [
      "node_112",
      "smg_util"
    ]
  },
  {
    "id": "ks_bullet_hell",
    "x": -320,
    "y": -360,
    "t": "keystone",
    "n": "BULLET HELL",
    "d": "+6% SMG Damage, +6% SMG Fire Rate, Fires two rounds per shot.",
    "s": "SMG MASTERY",
    "r": 1,
    "c": [
      "node_141"
    ]
  },
  {
    "id": "fth_dmg",
    "x": 200,
    "y": -240,
    "t": "regular",
    "n": "Flamethrower Damage",
    "d": "+2% Flamethrower Damage",
    "s": "+2% Flamethrower DMG",
    "r": 2,
    "c": [
      "node_111",
      "node_138",
      "node_109"
    ]
  },
  {
    "id": "fth_util",
    "x": 140,
    "y": -200,
    "t": "regular",
    "n": "Burn Duration",
    "d": "+0.5s Burn",
    "s": "+0.5s BURN",
    "r": 2,
    "c": [
      "node_110",
      "node_111",
      "fth_notable"
    ]
  },
  {
    "id": "fth_heat",
    "x": 200,
    "y": -160,
    "t": "regular",
    "n": "Flamethrower Heat Control",
    "d": "+5% Flamethrower Heat",
    "s": "+5% Flamethrower HEAT",
    "r": 2,
    "c": [
      "node_109",
      "node_110",
      "fth_notable",
      "gen_crit"
    ]
  },
  {
    "id": "fth_notable",
    "x": 180,
    "y": -200,
    "t": "notable",
    "n": "Flame Specialist",
    "d": "+4% Flamethrower Damage, +6% Ignite",
    "s": "+4% Flamethrower DMG +6% IGNITE",
    "r": 1,
    "c": [
      "fth_util",
      "fth_heat"
    ]
  },
  {
    "id": "ks_hellfire",
    "x": 320,
    "y": -360,
    "t": "keystone",
    "n": "HELLFIRE",
    "d": "+6% Flamethrower Damage, Always ignite, Burn Explode 30 AOE",
    "s": "Flamethrower MASTERY",
    "r": 1,
    "c": [
      "node_139"
    ]
  },
  {
    "id": "sg_dmg",
    "x": -140,
    "y": 200,
    "t": "regular",
    "n": "Shotgun Damage",
    "d": "+2% Shotgun Damage",
    "s": "+2% Shotgun DMG",
    "r": 2,
    "c": [
      "node_115",
      "node_117",
      "sg_notable"
    ]
  },
  {
    "id": "sg_notable",
    "x": -180,
    "y": 200,
    "t": "notable",
    "n": "Scatter Specialist",
    "d": "+4% Shotgun Damage, +4% Shotgun Fire Rate",
    "s": "+5% Shotgun DMG +8% CLOSE",
    "r": 1,
    "c": [
      "node_116",
      "sg_dmg"
    ]
  },
  {
    "id": "ks_decimator",
    "x": -320,
    "y": 360,
    "t": "keystone",
    "n": "DECIMATOR",
    "d": "+15% Shotgun. +3 pellets. Same-target +5% each.",
    "s": "Shotgun MASTERY",
    "r": 1,
    "c": [
      "node_135"
    ]
  },
  {
    "id": "siph_util",
    "x": 140,
    "y": 200,
    "t": "regular",
    "n": "Siphon Slow",
    "d": "+2% Siphon Slow",
    "s": "+2% SIPHON SLOW",
    "r": 2,
    "c": [
      "node_120",
      "node_122",
      "siph_notable"
    ]
  },
  {
    "id": "siph_notable",
    "x": 180,
    "y": 200,
    "t": "notable",
    "n": "Drain Specialist",
    "d": "+4% Siphon Heal, +5% Siphon Slow",
    "s": "+8% HEAL +5% SLOW",
    "r": 1,
    "c": [
      "siph_util",
      "node_121"
    ]
  },
  {
    "id": "ks_parasyte",
    "x": 320,
    "y": 360,
    "t": "keystone",
    "n": "PARASYTE",
    "d": "+6% Siphon Heal, +8% Damage, Chain to 1 enemy",
    "s": "SIPHON MASTERY",
    "r": 1,
    "c": [
      "node_137"
    ]
  },
  {
    "id": "crit_notable",
    "x": -380,
    "y": 160,
    "t": "notable",
    "n": "Assassin's Eye",
    "d": "+3% Crit, +6% Crit Damage",
    "s": "+3% CRIT +6% CRIT DMG",
    "r": 1,
    "c": [
      "node_159"
    ]
  },
  {
    "id": "shield_notable",
    "x": 0,
    "y": 220,
    "t": "notable",
    "n": "Fortified Barrier",
    "d": "+20 Shield HP, +4% Regen",
    "s": "+20 SHIELD +4% REGEN",
    "r": 1,
    "c": [
      "node_4",
      "node_90"
    ]
  },
  {
    "id": "speed_move",
    "x": -180,
    "y": 0,
    "t": "regular",
    "n": "Hydraulic Upgrade",
    "d": "+2% Move Speed",
    "s": "+2% SPEED",
    "r": 2,
    "c": [
      "node_76",
      "node_95",
      "node_96"
    ]
  },
  {
    "id": "speed_fr",
    "x": 180,
    "y": 0,
    "t": "regular",
    "n": "Streamlined Action",
    "d": "+2% Fire Rate",
    "s": "+2% FIRE RATE",
    "r": 2,
    "c": [
      "node_64",
      "node_106",
      "node_105"
    ]
  },
  {
    "id": "ks_phantom",
    "x": -400,
    "y": 0,
    "t": "keystone",
    "n": "Phantom",
    "d": "+6% Move Speed, +6% Dodge",
    "s": "EVASION MASTERY",
    "r": 1,
    "c": [
      "node_127"
    ]
  },
  {
    "id": "ks_overclock",
    "x": -160,
    "y": -420,
    "t": "keystone",
    "n": "OVERCLOCK",
    "d": "+15% Mod Cooldown, +30% Mod Effects",
    "s": "+15% Cooldown +30% EFFECT",
    "r": 1,
    "c": [
      "node_191"
    ]
  },
  {
    "id": "ks_meteor",
    "x": -420,
    "y": -160,
    "t": "keystone",
    "n": "Meteor Strike",
    "d": "+25% Jump. Landing 50 AOE. 2s invuln.",
    "s": "JUMP MASTERY",
    "r": 1,
    "c": [
      "node_25"
    ]
  },
  {
    "id": "ks_stasis",
    "x": -160,
    "y": 460,
    "t": "keystone",
    "n": "Stasis Field",
    "d": "+3s Barrier. Slows enemies 150u by 40%.",
    "s": "BARRIER MASTERY",
    "r": 1,
    "c": [
      "node_23"
    ]
  },
  {
    "id": "ks_doppel",
    "x": 160,
    "y": -460,
    "t": "keystone",
    "n": "Doppelganger",
    "d": "Decoy fires at 50%. +4s, 100% aggro",
    "s": "DECOY MASTERY",
    "r": 1,
    "c": [
      "node_27"
    ]
  },
  {
    "id": "ks_glass_cannon",
    "x": 400,
    "y": 0,
    "t": "keystone",
    "n": "GLASS CANNON",
    "d": "+12% Damage, +12% Fire Rate, -30 All Parts HP",
    "s": "WEAPON MASTERY",
    "r": 1,
    "c": [
      "node_129"
    ]
  },
  {
    "id": "node_4",
    "x": -40,
    "y": 220,
    "t": "regular",
    "n": "Quick Recharge",
    "d": "+5% Shield Regen",
    "s": "+5% SHIELD REGEN",
    "r": 2,
    "c": [
      "node_92",
      "shield_notable",
      "node_89"
    ]
  },
  {
    "id": "node_5",
    "x": 60,
    "y": 0,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "start",
      "node_46",
      "node_45",
      "node_51"
    ]
  },
  {
    "id": "node_6",
    "x": -240,
    "y": -40,
    "t": "regular",
    "n": "Servo Boost",
    "d": "+2% Dodge",
    "s": "+2% DODGE",
    "r": 2,
    "c": [
      "node_95",
      "node_98"
    ]
  },
  {
    "id": "node_9",
    "x": 0,
    "y": -400,
    "t": "keystone",
    "n": "IRON STEEL",
    "d": "+30 All Parts HP, +6% Damage Reduction",
    "s": "RESISTANCE MASTERY",
    "r": 1,
    "c": [
      "node_133"
    ]
  },
  {
    "id": "node_10",
    "x": -40,
    "y": -220,
    "t": "regular",
    "n": "Composite Plating",
    "d": "+2% Damage Reduction",
    "s": "+2% Damage Reduction",
    "r": 2,
    "c": [
      "node_104",
      "node_81",
      "node_99"
    ]
  },
  {
    "id": "node_11",
    "x": 0,
    "y": 400,
    "t": "keystone",
    "n": "BLESSED SHIELD",
    "d": "+30 Shield HP, +6% Regen, +4% Absorb",
    "s": "SHIELD MASTERY",
    "r": 1,
    "c": [
      "node_131"
    ]
  },
  {
    "id": "node_14",
    "x": 220,
    "y": 0,
    "t": "notable",
    "n": "Lightning Reflexes",
    "d": "+4% Damage, +4% Fire Rate",
    "s": "+4% DMG +4% Fire Rate",
    "r": 1,
    "c": [
      "node_105",
      "node_106"
    ]
  },
  {
    "id": "node_20",
    "x": -140,
    "y": 40,
    "t": "regular",
    "n": "Processor Boost",
    "d": "+2% Mod Cooldown",
    "s": "+2% MOD Cooldown",
    "r": 2,
    "c": [
      "node_76"
    ]
  },
  {
    "id": "node_23",
    "x": -160,
    "y": 400,
    "t": "regular",
    "n": "Barrier Boost",
    "d": "+1.5s Barrier, +5% Barrier Cooldown",
    "s": "+1.5s BARRIER +5% Cooldown",
    "r": 2,
    "c": [
      "node_158",
      "ks_stasis"
    ]
  },
  {
    "id": "node_25",
    "x": -360,
    "y": -160,
    "t": "regular",
    "n": "Jump Boost",
    "d": "+10% Jump, +5% Jump Cooldown",
    "s": "+10% JUMP +5% Cooldown",
    "r": 2,
    "c": [
      "ks_meteor",
      "node_195"
    ]
  },
  {
    "id": "node_27",
    "x": 160,
    "y": -400,
    "t": "regular",
    "n": "Decoy Boost",
    "d": "+2s Decoy, Explodes 20 Damage",
    "s": "+2s DECOY +20 DMG",
    "r": 2,
    "c": [
      "node_186",
      "ks_doppel"
    ]
  },
  {
    "id": "node_32",
    "x": 40,
    "y": 360,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_131",
      "node_171"
    ]
  },
  {
    "id": "node_40",
    "x": 220,
    "y": 200,
    "t": "regular",
    "n": "Siphon Heal",
    "d": "+2% Siphon Heal",
    "s": "+5% SIPHON HEAL",
    "r": 2,
    "c": [
      "node_121",
      "node_123"
    ]
  },
  {
    "id": "node_41",
    "x": 0,
    "y": 60,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "start",
      "node_45",
      "node_44",
      "node_48"
    ]
  },
  {
    "id": "node_42",
    "x": -60,
    "y": 0,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "start",
      "node_47",
      "node_44",
      "node_58"
    ]
  },
  {
    "id": "node_43",
    "x": 0,
    "y": -60,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "start",
      "node_47",
      "node_46",
      "node_59"
    ]
  },
  {
    "id": "node_44",
    "x": -40,
    "y": 40,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "start",
      "node_41",
      "node_42",
      "node_72"
    ]
  },
  {
    "id": "node_45",
    "x": 40,
    "y": 40,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "start",
      "node_5",
      "node_41",
      "node_61"
    ]
  },
  {
    "id": "node_46",
    "x": 40,
    "y": -40,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "start",
      "node_43",
      "node_5",
      "node_66"
    ]
  },
  {
    "id": "node_47",
    "x": -40,
    "y": -40,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "start",
      "node_42",
      "node_43",
      "node_68"
    ]
  },
  {
    "id": "node_48",
    "x": 0,
    "y": 100,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_41",
      "node_60"
    ]
  },
  {
    "id": "node_51",
    "x": 100,
    "y": 0,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_5",
      "node_64"
    ]
  },
  {
    "id": "node_58",
    "x": -100,
    "y": 0,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_42",
      "node_76"
    ]
  },
  {
    "id": "node_59",
    "x": 0,
    "y": -100,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_43",
      "node_65"
    ]
  },
  {
    "id": "node_60",
    "x": 0,
    "y": 140,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_48",
      "node_91",
      "node_92",
      "node_163",
      "node_164"
    ]
  },
  {
    "id": "node_61",
    "x": 80,
    "y": 80,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_45",
      "node_62"
    ]
  },
  {
    "id": "node_62",
    "x": 120,
    "y": 120,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_61",
      "node_120"
    ]
  },
  {
    "id": "node_64",
    "x": 140,
    "y": 0,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_51",
      "speed_fr",
      "node_165",
      "node_166"
    ]
  },
  {
    "id": "node_65",
    "x": 0,
    "y": -140,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_59",
      "node_104",
      "node_103",
      "node_167",
      "node_168"
    ]
  },
  {
    "id": "node_66",
    "x": 80,
    "y": -80,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_46",
      "node_67"
    ]
  },
  {
    "id": "node_67",
    "x": 120,
    "y": -120,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_66",
      "node_110"
    ]
  },
  {
    "id": "node_68",
    "x": -80,
    "y": -80,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_47",
      "node_69"
    ]
  },
  {
    "id": "node_69",
    "x": -120,
    "y": -120,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_68",
      "smg_heat"
    ]
  },
  {
    "id": "node_70",
    "x": -120,
    "y": 120,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_72",
      "node_115"
    ]
  },
  {
    "id": "node_72",
    "x": -80,
    "y": 80,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_44",
      "node_70"
    ]
  },
  {
    "id": "node_76",
    "x": -140,
    "y": 0,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_58",
      "speed_move",
      "node_162",
      "node_20"
    ]
  },
  {
    "id": "node_81",
    "x": 0,
    "y": -220,
    "t": "notable",
    "n": "Structural Integrity",
    "d": "+20 All Parts HP, +4% Damage Reduction",
    "s": "+20 ALL HP +4% Damage Reduction",
    "r": 1,
    "c": [
      "node_101",
      "node_10"
    ]
  },
  {
    "id": "node_89",
    "x": -20,
    "y": 260,
    "t": "regular",
    "n": "Dense Barrier",
    "d": "+2% Shield Absorb",
    "s": "+2% SHIELD ABSORB",
    "r": 2,
    "c": [
      "node_4",
      "node_130"
    ]
  },
  {
    "id": "node_90",
    "x": 40,
    "y": 220,
    "t": "regular",
    "n": "Quick Recharge",
    "d": "+2% Shield Regen",
    "s": "+2% SHIELD REGEN",
    "r": 2,
    "c": [
      "node_91",
      "shield_notable",
      "node_93"
    ]
  },
  {
    "id": "node_91",
    "x": 20,
    "y": 180,
    "t": "regular",
    "n": "Shield Matrix",
    "d": "+10 Shield HP",
    "s": "+10 SHIELD HP",
    "r": 2,
    "c": [
      "node_60",
      "node_90"
    ]
  },
  {
    "id": "node_92",
    "x": -20,
    "y": 180,
    "t": "regular",
    "n": "Shield Matrix",
    "d": "+10 Shield HP",
    "s": "+10 SHIELD HP",
    "r": 2,
    "c": [
      "node_60",
      "node_4"
    ]
  },
  {
    "id": "node_93",
    "x": 20,
    "y": 260,
    "t": "regular",
    "n": "Dense Barrier",
    "d": "+2% Shield Absorb",
    "s": "+2% SHIELD ABSORB",
    "r": 2,
    "c": [
      "node_90",
      "node_130"
    ]
  },
  {
    "id": "node_94",
    "x": -220,
    "y": 0,
    "t": "notable",
    "n": "Lightning Reflexes",
    "d": "+4% Move Speed, +4% Dodge",
    "s": "+4% SPEED +4% DODGE",
    "r": 1,
    "c": [
      "node_96",
      "node_95"
    ]
  },
  {
    "id": "node_95",
    "x": -200,
    "y": -40,
    "t": "regular",
    "n": "Hydraulic Upgrade",
    "d": "+2% Move Speed",
    "s": "+2% SPEED",
    "r": 2,
    "c": [
      "speed_move",
      "node_6",
      "node_94"
    ]
  },
  {
    "id": "node_96",
    "x": -200,
    "y": 40,
    "t": "regular",
    "n": "Hydraulic Upgrade",
    "d": "+2% Move Speed",
    "s": "+2% SPEED",
    "r": 2,
    "c": [
      "speed_move",
      "node_97",
      "node_94"
    ]
  },
  {
    "id": "node_97",
    "x": -240,
    "y": 40,
    "t": "regular",
    "n": "Servo Boost",
    "d": "+2% Dodge",
    "s": "+2% DODGE",
    "r": 2,
    "c": [
      "node_96",
      "node_98"
    ]
  },
  {
    "id": "node_98",
    "x": -260,
    "y": 0,
    "t": "regular",
    "n": "Servo Boost",
    "d": "+2% Dodge",
    "s": "+2% DODGE",
    "r": 2,
    "c": [
      "node_6",
      "node_126",
      "node_97"
    ]
  },
  {
    "id": "node_99",
    "x": -20,
    "y": -260,
    "t": "regular",
    "n": "Composite Plating",
    "d": "+2% Damage Reduction",
    "s": "+2% Damage Reduction",
    "r": 2,
    "c": [
      "node_10",
      "node_132"
    ]
  },
  {
    "id": "node_101",
    "x": 40,
    "y": -220,
    "t": "regular",
    "n": "Arm Reinforcement",
    "d": "+20 Arm HP",
    "s": "+20 ARM HP",
    "r": 2,
    "c": [
      "node_103",
      "node_81",
      "node_102"
    ]
  },
  {
    "id": "node_102",
    "x": 20,
    "y": -260,
    "t": "regular",
    "n": "Core Reinforcement",
    "d": "+20 Core HP",
    "s": "+20 CORE HP",
    "r": 2,
    "c": [
      "node_132",
      "node_101"
    ]
  },
  {
    "id": "node_103",
    "x": 20,
    "y": -180,
    "t": "regular",
    "n": "Leg Reinforcement",
    "d": "+20 Leg HP",
    "s": "+20 LEG HP",
    "r": 2,
    "c": [
      "node_65",
      "node_101"
    ]
  },
  {
    "id": "node_104",
    "x": -20,
    "y": -180,
    "t": "regular",
    "n": "Composite Plating",
    "d": "+2% Damage Reduction",
    "s": "+2% Damage Reduction",
    "r": 2,
    "c": [
      "node_65",
      "node_10"
    ]
  },
  {
    "id": "node_105",
    "x": 200,
    "y": 40,
    "t": "regular",
    "n": "Streamlined Action",
    "d": "+2% Fire Rate",
    "s": "+2% FIRE RATE",
    "r": 2,
    "c": [
      "node_108",
      "speed_fr",
      "node_14"
    ]
  },
  {
    "id": "node_106",
    "x": 200,
    "y": -40,
    "t": "regular",
    "n": "Streamlined Action",
    "d": "+2% Fire Rate",
    "s": "+2% FIRE RATE",
    "r": 2,
    "c": [
      "speed_fr",
      "gen_dmg",
      "node_14"
    ]
  },
  {
    "id": "node_107",
    "x": 260,
    "y": 0,
    "t": "regular",
    "n": "Weapon Calibration",
    "d": "+2% Damage",
    "s": "+2% DMG",
    "r": 2,
    "c": [
      "gen_dmg",
      "node_128",
      "node_108"
    ]
  },
  {
    "id": "node_108",
    "x": 240,
    "y": 40,
    "t": "regular",
    "n": "Weapon Calibration",
    "d": "+2% Damage",
    "s": "+2% DMG",
    "r": 2,
    "c": [
      "node_107",
      "node_105"
    ]
  },
  {
    "id": "node_109",
    "x": 220,
    "y": -200,
    "t": "regular",
    "n": "Flamethrower Damage",
    "d": "+2% Flamethrower Damage",
    "s": "+2% Flamethrower DMG",
    "r": 2,
    "c": [
      "fth_dmg",
      "fth_heat"
    ]
  },
  {
    "id": "node_110",
    "x": 160,
    "y": -160,
    "t": "regular",
    "n": "Flamethrower Heat Control",
    "d": "+5% Flamethrower Heat",
    "s": "+5% Flamethrower HEAT",
    "r": 2,
    "c": [
      "node_67",
      "fth_util",
      "fth_heat"
    ]
  },
  {
    "id": "node_111",
    "x": 160,
    "y": -240,
    "t": "regular",
    "n": "Burn Duration",
    "d": "+0.5s Burn",
    "s": "+0.5s BURN",
    "r": 2,
    "c": [
      "fth_util",
      "fth_dmg",
      "node_200"
    ]
  },
  {
    "id": "node_112",
    "x": -200,
    "y": -160,
    "t": "regular",
    "n": "SMG Heat Control",
    "d": "+5% SMG Heat",
    "s": "+5% SMG HEAT",
    "r": 2,
    "c": [
      "smg_heat",
      "smg_dmg",
      "smg_notable",
      "node_202"
    ]
  },
  {
    "id": "node_113",
    "x": -160,
    "y": -240,
    "t": "regular",
    "n": "SMG Fire Rate",
    "d": "+2% SMG Fire Rate",
    "s": "+2% SMG Fire Rate",
    "r": 2,
    "c": [
      "node_114",
      "smg_util",
      "node_201"
    ]
  },
  {
    "id": "node_114",
    "x": -200,
    "y": -240,
    "t": "regular",
    "n": "SMG Damage",
    "d": "+2% SMG Damage",
    "s": "+2% SMG DMG",
    "r": 2,
    "c": [
      "smg_dmg",
      "node_113",
      "node_140"
    ]
  },
  {
    "id": "node_115",
    "x": -160,
    "y": 160,
    "t": "regular",
    "n": "Shotgun Fire Rate",
    "d": "+2% Shotgun Fire Rate",
    "s": "+2% Shotgun Fire Rate",
    "r": 2,
    "c": [
      "node_70",
      "sg_dmg",
      "node_116"
    ]
  },
  {
    "id": "node_116",
    "x": -200,
    "y": 160,
    "t": "regular",
    "n": "Shotgun Fire Rate",
    "d": "+2% Shotgun Fire Rate",
    "s": "+2% Shotgun Fire Rate",
    "r": 2,
    "c": [
      "node_115",
      "node_119",
      "sg_notable",
      "node_203"
    ]
  },
  {
    "id": "node_117",
    "x": -160,
    "y": 240,
    "t": "regular",
    "n": "Shotgun Damage",
    "d": "+2% Shotgun Damage",
    "s": "+2% Shotgun DMG",
    "r": 2,
    "c": [
      "sg_dmg",
      "node_118",
      "node_204"
    ]
  },
  {
    "id": "node_118",
    "x": -200,
    "y": 240,
    "t": "regular",
    "n": "Shotgun Pellets",
    "d": "+1 Shotgun Pellet",
    "s": "+1 Shotgun PELLET",
    "r": 2,
    "c": [
      "node_117",
      "node_134",
      "node_119"
    ]
  },
  {
    "id": "node_119",
    "x": -220,
    "y": 200,
    "t": "regular",
    "n": "Shotgun Fire Rate",
    "d": "+2% Shotgun Fire Rate",
    "s": "+2% Shotgun Fire Rate",
    "r": 2,
    "c": [
      "node_116",
      "node_118"
    ]
  },
  {
    "id": "node_120",
    "x": 160,
    "y": 160,
    "t": "regular",
    "n": "Siphon Heat Control",
    "d": "+5% Siphon Heat",
    "s": "+5% SIPHON HEAT",
    "r": 2,
    "c": [
      "node_62",
      "siph_util",
      "node_121"
    ]
  },
  {
    "id": "node_121",
    "x": 200,
    "y": 160,
    "t": "regular",
    "n": "Siphon Heat Control",
    "d": "+5% Siphon Heat",
    "s": "+5% SIPHON HEAT",
    "r": 2,
    "c": [
      "node_120",
      "node_40",
      "siph_notable",
      "node_206"
    ]
  },
  {
    "id": "node_122",
    "x": 160,
    "y": 240,
    "t": "regular",
    "n": "Siphon Slow",
    "d": "+2% Siphon Slow",
    "s": "+2% SIPHON SLOW",
    "r": 2,
    "c": [
      "siph_util",
      "node_123",
      "node_205"
    ]
  },
  {
    "id": "node_123",
    "x": 200,
    "y": 240,
    "t": "regular",
    "n": "Siphon Heal",
    "d": "+2% Siphon Heal",
    "s": "+5% SIPHON HEAL",
    "r": 2,
    "c": [
      "node_122",
      "node_40",
      "node_136"
    ]
  },
  {
    "id": "node_124",
    "x": 240,
    "y": 360,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_137",
      "node_174"
    ]
  },
  {
    "id": "node_125",
    "x": 320,
    "y": 280,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_137",
      "node_175"
    ]
  },
  {
    "id": "node_126",
    "x": -300,
    "y": 0,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_98",
      "node_127"
    ]
  },
  {
    "id": "node_127",
    "x": -340,
    "y": 0,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_126",
      "ks_phantom",
      "node_145",
      "node_146"
    ]
  },
  {
    "id": "node_128",
    "x": 300,
    "y": 0,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_107",
      "node_129"
    ]
  },
  {
    "id": "node_129",
    "x": 340,
    "y": 0,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_128",
      "ks_glass_cannon",
      "node_154",
      "node_153"
    ]
  },
  {
    "id": "node_130",
    "x": 0,
    "y": 300,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_89",
      "node_93",
      "node_131"
    ]
  },
  {
    "id": "node_131",
    "x": 0,
    "y": 340,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_130",
      "node_11",
      "node_142",
      "node_32"
    ]
  },
  {
    "id": "node_132",
    "x": 0,
    "y": -300,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_99",
      "node_133",
      "node_102"
    ]
  },
  {
    "id": "node_133",
    "x": 0,
    "y": -340,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_132",
      "node_9",
      "node_149",
      "node_150"
    ]
  },
  {
    "id": "node_134",
    "x": -240,
    "y": 280,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_118",
      "node_135"
    ]
  },
  {
    "id": "node_135",
    "x": -280,
    "y": 320,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_134",
      "ks_decimator",
      "node_144",
      "node_143"
    ]
  },
  {
    "id": "node_136",
    "x": 240,
    "y": 280,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_123",
      "node_137"
    ]
  },
  {
    "id": "node_137",
    "x": 280,
    "y": 320,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_136",
      "ks_parasyte",
      "node_124",
      "node_125"
    ]
  },
  {
    "id": "node_138",
    "x": 240,
    "y": -280,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "fth_dmg",
      "node_139"
    ]
  },
  {
    "id": "node_139",
    "x": 280,
    "y": -320,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_138",
      "ks_hellfire",
      "node_151",
      "node_152"
    ]
  },
  {
    "id": "node_140",
    "x": -240,
    "y": -280,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_114",
      "node_141"
    ]
  },
  {
    "id": "node_141",
    "x": -280,
    "y": -320,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_140",
      "ks_bullet_hell",
      "node_147",
      "node_148"
    ]
  },
  {
    "id": "node_142",
    "x": -40,
    "y": 360,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_131",
      "node_170"
    ]
  },
  {
    "id": "node_143",
    "x": -240,
    "y": 360,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_135",
      "node_161"
    ]
  },
  {
    "id": "node_144",
    "x": -320,
    "y": 280,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_135",
      "node_157"
    ]
  },
  {
    "id": "node_145",
    "x": -320,
    "y": 40,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_127",
      "node_160"
    ]
  },
  {
    "id": "node_146",
    "x": -320,
    "y": -40,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_127",
      "node_197"
    ]
  },
  {
    "id": "node_147",
    "x": -320,
    "y": -280,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_141",
      "node_193"
    ]
  },
  {
    "id": "node_148",
    "x": -240,
    "y": -360,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_141",
      "node_192"
    ]
  },
  {
    "id": "node_149",
    "x": -40,
    "y": -360,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_133",
      "node_189"
    ]
  },
  {
    "id": "node_150",
    "x": 40,
    "y": -360,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_133",
      "node_188"
    ]
  },
  {
    "id": "node_151",
    "x": 240,
    "y": -360,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_139",
      "node_185"
    ]
  },
  {
    "id": "node_152",
    "x": 320,
    "y": -280,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_139",
      "node_184"
    ]
  },
  {
    "id": "node_153",
    "x": 320,
    "y": -40,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_129",
      "node_180"
    ]
  },
  {
    "id": "node_154",
    "x": 320,
    "y": 40,
    "t": "regular",
    "n": "Augment Boost",
    "d": "+2% Augment Effect",
    "s": "+2% AUGMENT",
    "r": 2,
    "c": [
      "node_129",
      "node_179"
    ]
  },
  {
    "id": "node_155",
    "x": -320,
    "y": 120,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_159",
      "node_160"
    ]
  },
  {
    "id": "node_156",
    "x": -320,
    "y": 200,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_157",
      "node_159"
    ]
  },
  {
    "id": "node_157",
    "x": -320,
    "y": 240,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_144",
      "node_156"
    ]
  },
  {
    "id": "node_158",
    "x": -160,
    "y": 360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_211",
      "node_169",
      "node_161",
      "node_23"
    ]
  },
  {
    "id": "node_159",
    "x": -320,
    "y": 160,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_210",
      "node_156",
      "node_155",
      "crit_notable"
    ]
  },
  {
    "id": "node_160",
    "x": -320,
    "y": 80,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_155",
      "node_145"
    ]
  },
  {
    "id": "node_161",
    "x": -200,
    "y": 360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_158",
      "node_143"
    ]
  },
  {
    "id": "node_162",
    "x": -140,
    "y": -40,
    "t": "regular",
    "n": "Processor Boost",
    "d": "+2% Mod Cooldown",
    "s": "+2% MOD Cooldown",
    "r": 2,
    "c": [
      "node_76"
    ]
  },
  {
    "id": "node_163",
    "x": -40,
    "y": 140,
    "t": "regular",
    "n": "Processor Boost",
    "d": "+2% Mod Cooldown",
    "s": "+2% MOD Cooldown",
    "r": 2,
    "c": [
      "node_60"
    ]
  },
  {
    "id": "node_164",
    "x": 40,
    "y": 140,
    "t": "regular",
    "n": "Processor Boost",
    "d": "+2% Mod Cooldown",
    "s": "+2% MOD Cooldown",
    "r": 2,
    "c": [
      "node_60"
    ]
  },
  {
    "id": "node_165",
    "x": 140,
    "y": 40,
    "t": "regular",
    "n": "Processor Boost",
    "d": "+2% Mod Cooldown",
    "s": "+2% MOD Cooldown",
    "r": 2,
    "c": [
      "node_64"
    ]
  },
  {
    "id": "node_166",
    "x": 140,
    "y": -40,
    "t": "regular",
    "n": "Processor Boost",
    "d": "+2% Mod Cooldown",
    "s": "+2% MOD Cooldown",
    "r": 2,
    "c": [
      "node_64"
    ]
  },
  {
    "id": "node_167",
    "x": 40,
    "y": -140,
    "t": "regular",
    "n": "Processor Boost",
    "d": "+2% Mod Cooldown",
    "s": "+2% MOD Cooldown",
    "r": 2,
    "c": [
      "node_65"
    ]
  },
  {
    "id": "node_168",
    "x": -40,
    "y": -140,
    "t": "regular",
    "n": "Processor Boost",
    "d": "+2% Mod Cooldown",
    "s": "+2% MOD Cooldown",
    "r": 2,
    "c": [
      "node_65"
    ]
  },
  {
    "id": "node_169",
    "x": -120,
    "y": 360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_170",
      "node_158"
    ]
  },
  {
    "id": "node_170",
    "x": -80,
    "y": 360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_142",
      "node_169"
    ]
  },
  {
    "id": "node_171",
    "x": 80,
    "y": 360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_172",
      "node_32"
    ]
  },
  {
    "id": "node_172",
    "x": 120,
    "y": 360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_173",
      "node_171"
    ]
  },
  {
    "id": "node_173",
    "x": 160,
    "y": 360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_212",
      "node_174",
      "node_172",
      "node_198"
    ]
  },
  {
    "id": "node_174",
    "x": 200,
    "y": 360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_124",
      "node_173"
    ]
  },
  {
    "id": "node_175",
    "x": 320,
    "y": 240,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_176",
      "node_125"
    ]
  },
  {
    "id": "node_176",
    "x": 320,
    "y": 200,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_177",
      "node_175"
    ]
  },
  {
    "id": "node_177",
    "x": 320,
    "y": 160,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_213",
      "node_178",
      "node_176",
      "node_214"
    ]
  },
  {
    "id": "node_178",
    "x": 320,
    "y": 120,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_179",
      "node_177"
    ]
  },
  {
    "id": "node_179",
    "x": 320,
    "y": 80,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_154",
      "node_178"
    ]
  },
  {
    "id": "node_180",
    "x": 320,
    "y": -80,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_181",
      "node_153"
    ]
  },
  {
    "id": "node_181",
    "x": 320,
    "y": -120,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_182",
      "node_180"
    ]
  },
  {
    "id": "node_182",
    "x": 320,
    "y": -160,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "path_gc",
      "node_183",
      "node_181",
      "node_199"
    ]
  },
  {
    "id": "node_183",
    "x": 320,
    "y": -200,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_184",
      "node_182"
    ]
  },
  {
    "id": "node_184",
    "x": 320,
    "y": -240,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_152",
      "node_183"
    ]
  },
  {
    "id": "node_185",
    "x": 200,
    "y": -360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_186",
      "node_151"
    ]
  },
  {
    "id": "node_186",
    "x": 160,
    "y": -360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_207",
      "node_187",
      "node_185",
      "node_27"
    ]
  },
  {
    "id": "node_187",
    "x": 120,
    "y": -360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_188",
      "node_186"
    ]
  },
  {
    "id": "node_188",
    "x": 80,
    "y": -360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_150",
      "node_187"
    ]
  },
  {
    "id": "node_189",
    "x": -80,
    "y": -360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_190",
      "node_149"
    ]
  },
  {
    "id": "node_190",
    "x": -120,
    "y": -360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_191",
      "node_189"
    ]
  },
  {
    "id": "node_191",
    "x": -160,
    "y": -360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_208",
      "node_192",
      "node_190",
      "ks_overclock"
    ]
  },
  {
    "id": "node_192",
    "x": -200,
    "y": -360,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_148",
      "node_191"
    ]
  },
  {
    "id": "node_193",
    "x": -320,
    "y": -240,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_194",
      "node_147"
    ]
  },
  {
    "id": "node_194",
    "x": -320,
    "y": -200,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_195",
      "node_193"
    ]
  },
  {
    "id": "node_195",
    "x": -320,
    "y": -160,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_209",
      "node_196",
      "node_194",
      "node_25"
    ]
  },
  {
    "id": "node_196",
    "x": -320,
    "y": -120,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_197",
      "node_195"
    ]
  },
  {
    "id": "node_197",
    "x": -320,
    "y": -80,
    "t": "regular",
    "n": "Hull Plating",
    "d": "+10 All Parts HP",
    "s": "+10 ALL HP",
    "r": 2,
    "c": [
      "node_146",
      "node_196"
    ]
  },
  {
    "id": "node_198",
    "x": 160,
    "y": 420,
    "t": "notable",
    "n": "Charged Barrier",
    "d": "+20 Shield HP, +4% Fire Rate",
    "s": "+20 SHIELD +4% Fire Rate",
    "r": 1,
    "c": [
      "node_173"
    ]
  },
  {
    "id": "node_199",
    "x": 380,
    "y": -160,
    "t": "notable",
    "n": "Combat Readiness",
    "d": "+4% Move Speed, +20 All Parts HP",
    "s": "+4% SPEED +20 ALL HP",
    "r": 1,
    "c": [
      "node_182"
    ]
  },
  {
    "id": "node_200",
    "x": 160,
    "y": -280,
    "t": "regular",
    "n": "Targeting Matrix",
    "d": "+5% Crit Chance",
    "s": "+5% CRIT",
    "r": 2,
    "c": [
      "node_111",
      "node_207"
    ]
  },
  {
    "id": "node_201",
    "x": -160,
    "y": -280,
    "t": "regular",
    "n": "Targeting Matrix",
    "d": "+5% Crit Chance",
    "s": "+5% CRIT",
    "r": 2,
    "c": [
      "node_113",
      "node_208"
    ]
  },
  {
    "id": "node_202",
    "x": -240,
    "y": -160,
    "t": "regular",
    "n": "Targeting Matrix",
    "d": "+5% Crit Chance",
    "s": "+5% CRIT",
    "r": 2,
    "c": [
      "node_112",
      "node_209"
    ]
  },
  {
    "id": "node_203",
    "x": -240,
    "y": 160,
    "t": "regular",
    "n": "Targeting Matrix",
    "d": "+5% Crit Chance",
    "s": "+5% CRIT",
    "r": 2,
    "c": [
      "node_116",
      "node_210"
    ]
  },
  {
    "id": "node_204",
    "x": -160,
    "y": 280,
    "t": "regular",
    "n": "Targeting Matrix",
    "d": "+5% Crit Chance",
    "s": "+5% CRIT",
    "r": 2,
    "c": [
      "node_117",
      "node_211"
    ]
  },
  {
    "id": "node_205",
    "x": 160,
    "y": 280,
    "t": "regular",
    "n": "Targeting Matrix",
    "d": "+5% Crit Chance",
    "s": "+5% CRIT",
    "r": 2,
    "c": [
      "node_122",
      "node_212"
    ]
  },
  {
    "id": "node_206",
    "x": 240,
    "y": 160,
    "t": "regular",
    "n": "Targeting Matrix",
    "d": "+5% Crit Chance",
    "s": "+5% CRIT",
    "r": 2,
    "c": [
      "node_121",
      "node_213"
    ]
  },
  {
    "id": "node_207",
    "x": 160,
    "y": -320,
    "t": "regular",
    "n": "Crit Damage",
    "d": "+10% Crit Damage",
    "s": "+10% CRIT DMG",
    "r": 2,
    "c": [
      "node_200",
      "node_186"
    ]
  },
  {
    "id": "node_208",
    "x": -160,
    "y": -320,
    "t": "regular",
    "n": "Crit Damage",
    "d": "+10% Crit Damage",
    "s": "+10% CRIT DMG",
    "r": 2,
    "c": [
      "node_201",
      "node_191"
    ]
  },
  {
    "id": "node_209",
    "x": -280,
    "y": -160,
    "t": "regular",
    "n": "Crit Damage",
    "d": "+10% Crit Damage",
    "s": "+10% CRIT DMG",
    "r": 2,
    "c": [
      "node_202",
      "node_195"
    ]
  },
  {
    "id": "node_210",
    "x": -280,
    "y": 160,
    "t": "regular",
    "n": "Crit Damage",
    "d": "+10% Crit Damage",
    "s": "+10% CRIT DMG",
    "r": 2,
    "c": [
      "node_203",
      "node_159"
    ]
  },
  {
    "id": "node_211",
    "x": -160,
    "y": 320,
    "t": "regular",
    "n": "Crit Damage",
    "d": "+10% Crit Damage",
    "s": "+10% CRIT DMG",
    "r": 2,
    "c": [
      "node_204",
      "node_158"
    ]
  },
  {
    "id": "node_212",
    "x": 160,
    "y": 320,
    "t": "regular",
    "n": "Crit Damage",
    "d": "+10% Crit Damage",
    "s": "+10% CRIT DMG",
    "r": 2,
    "c": [
      "node_205",
      "node_173"
    ]
  },
  {
    "id": "node_213",
    "x": 280,
    "y": 160,
    "t": "regular",
    "n": "Crit Damage",
    "d": "+10% Crit Damage",
    "s": "+10% CRIT DMG",
    "r": 2,
    "c": [
      "node_206",
      "node_177"
    ]
  },
  {
    "id": "node_214",
    "x": 360,
    "y": 160,
    "t": "regular",
    "n": "Ghost Step Boost",
    "d": "+0.3s Invis, +5% Invis Cooldown",
    "s": "+0.3s INVIS +5% Cooldown",
    "r": 1,
    "c": [
      "node_177",
      "node_215"
    ]
  },
  {
    "id": "node_215",
    "x": 420,
    "y": 160,
    "t": "keystone",
    "n": "Ghost Protocol",
    "d": "2s Invis, First Attack 3x, +5% Move Speed",
    "s": "GHOST MASTERY",
    "r": 1,
    "c": [
      "node_214"
    ]
  }
]
};
