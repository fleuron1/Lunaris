// Class configuration for all supported spellcasting classes.
// Every class runs on the same "caster chassis" (SheetPage / SpellsPage /
// EditPage / useCharacterState) — this file holds everything that differs.
import { SPELL_SLOTS_TABLE } from './sorcerer-progression.js'
import sorcererSpells from './sorcerer-spells.json'
import wizardSpells from './wizard-spells.json'
import bardSpells from './bard-spells.json'
import clericSpells from './cleric-spells.json'
import druidSpells from './druid-spells.json'
import warlockSpells from './warlock-spells.json'
import paladinSpells from './paladin-spells.json'
import rangerSpells from './ranger-spells.json'
import subclassesData from './subclasses.json'

export const DEFAULT_CLASS = 'sorcerer'

// Annabelle's Lunar Sorcery isn't in the 2014 PHB subclass data, so inject it
// as a sorcerer option. Picking it lights up the lunar-phase UI on the sheet.
const LUNAR_SUBCLASS = {
  name: 'Lunar Sorcery', shortName: 'Lunar',
  blurb: 'Your magic waxes and wanes with the moon — shifting bonus spells and embodiment effects by phase.',
  features: [
    { level: 1, name: 'Lunar Embodiment', description: 'You gain bonus spells and a passive effect tied to the active moon phase (Full, New, or Crescent). Switch phase with the phase selector on your sheet.' },
    { level: 6, name: 'Lunar Boons', description: 'Casting a spell of the active phase grants a phase-specific boon.' },
    { level: 6, name: 'Waxing and Waning', description: 'Change your lunar phase as a bonus action by spending 1 sorcery point (free once per long rest).' },
    { level: 14, name: 'Lunar Empowerment', description: 'Your active-phase effects grow stronger.' },
    { level: 18, name: 'Lunar Phenomenon', description: 'As a bonus action, shift phase and unleash a powerful phase effect.' },
  ],
}

// Half-caster spell slots (Paladin, Ranger) — spellcasting starts at level 2,
// caps at 5th-level slots. [lvl1..lvl5]
export const HALF_SLOTS_TABLE = {
  1:  [0,0,0,0,0], 2:  [2,0,0,0,0], 3:  [3,0,0,0,0], 4:  [3,0,0,0,0],
  5:  [4,2,0,0,0], 6:  [4,2,0,0,0], 7:  [4,3,0,0,0], 8:  [4,3,0,0,0],
  9:  [4,3,2,0,0], 10: [4,3,2,0,0], 11: [4,3,3,0,0], 12: [4,3,3,0,0],
  13: [4,3,3,1,0], 14: [4,3,3,1,0], 15: [4,3,3,2,0], 16: [4,3,3,2,0],
  17: [4,3,3,3,1], 18: [4,3,3,3,1], 19: [4,3,3,3,2], 20: [4,3,3,3,2],
}

// Warlock Pact Magic: all slots are the same level and recharge on a short rest
export const PACT_SLOTS = {
  1:  { count: 1, slotLevel: 1 }, 2:  { count: 2, slotLevel: 1 },
  3:  { count: 2, slotLevel: 2 }, 4:  { count: 2, slotLevel: 2 },
  5:  { count: 2, slotLevel: 3 }, 6:  { count: 2, slotLevel: 3 },
  7:  { count: 2, slotLevel: 4 }, 8:  { count: 2, slotLevel: 4 },
  9:  { count: 2, slotLevel: 5 }, 10: { count: 2, slotLevel: 5 },
  11: { count: 3, slotLevel: 5 }, 12: { count: 3, slotLevel: 5 },
  13: { count: 3, slotLevel: 5 }, 14: { count: 3, slotLevel: 5 },
  15: { count: 3, slotLevel: 5 }, 16: { count: 3, slotLevel: 5 },
  17: { count: 4, slotLevel: 5 }, 18: { count: 4, slotLevel: 5 },
  19: { count: 4, slotLevel: 5 }, 20: { count: 4, slotLevel: 5 },
}

const SKILLS_ALL = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History',
  'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception',
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival',
]

// Classes with no cantrips (half-casters + martials) use this 20-level zero row
const NO_CANTRIPS = Array(20).fill(0)

export const CLASSES = {
  sorcerer: {
    id: 'sorcerer', name: 'Sorcerer', icon: '🔮', hitDie: 6,
    spellAbility: 'cha', saves: ['CON', 'CHA'],
    skillChoices: 2,
    skillList: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
    casterType: 'full',
    cantripsKnown: [4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6],
    spellsKnownType: 'known',
    spellsKnown: [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15],
    subclass: 'Lunar Sorcery', subclassShort: 'Lunar',
    hasMetamagic: true, hasSorceryPoints: true, hasLunarPhases: true,
    blurb: 'Magic flows through your veins. Lunar Sorcery binds your power to the phases of the moon — shifting bonus spells and embodiment effects as the moon waxes and wanes.',
    proficiencies: 'Daggers, darts, slings, quarterstaffs, light crossbows. No armor or shields.',
    features: [
      // Base sorcerer features only — origin-specific powers (Lunar Embodiment,
      // etc.) live on the chosen subclass and render in the Subclass card.
      { level: 1, name: 'Spellcasting',           description: 'CHA-based spellcasting.' },
      { level: 2, name: 'Font of Magic',          description: 'Sorcery Points: convert spell slots to SP or vice versa.' },
      { level: 3, name: 'Metamagic',              description: 'Bend your spells with Metamagic options.' },
      { level: 20, name: 'Sorcerous Restoration', description: 'Regain 4 sorcery points when you finish a short rest.' },
    ],
    kit: {
      weaponOptions: [
        { id: 'crossbow', name: 'Light Crossbow & 20 bolts', stat: 'dex', die: '1d8', type: 'piercing', notes: 'Ammunition 80/320, Loading, Two-handed' },
        { id: 'quarterstaff', name: 'Quarterstaff', stat: 'str', die: '1d6', type: 'bludgeoning', notes: 'Versatile (1d8)' },
      ],
      focusOptions: [
        { id: 'arcane-focus', name: 'Arcane Focus', description: 'A crystal, orb, rod, staff, or wand used as a spellcasting focus.' },
        { id: 'component-pouch', name: 'Component Pouch', description: 'A small watertight pouch holding all the material components your spells need.' },
      ],
      packOptions: [
        { id: 'dungeoneers', name: "Dungeoneer's Pack", contents: 'Backpack, Crowbar, Hammer, 10 Pitons, 10 Torches, Tinderbox, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
        { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [{ name: 'Dagger x2', description: '' }],
      armor: null,
      goldRoll: { dice: 3, sides: 4, multiplier: 10 },
    },
  },

  wizard: {
    id: 'wizard', name: 'Wizard', icon: '📖', hitDie: 6,
    spellAbility: 'int', saves: ['INT', 'WIS'],
    skillChoices: 2,
    skillList: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
    casterType: 'full',
    cantripsKnown: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
    spellsKnownType: 'prepared', // prepared = level + INT mod (min 1)
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'A scholar of the arcane. Your spellbook holds the largest spell list in the game — preparation and knowledge are your weapons.',
    proficiencies: 'Daggers, darts, slings, quarterstaffs, light crossbows. No armor or shields.',
    features: [
      { level: 1, name: 'Spellcasting',     description: 'INT-based spellcasting from your spellbook.' },
      { level: 1, name: 'Arcane Recovery',  description: 'Once per day after a short rest, recover spell slots totalling half your wizard level (rounded up), none 6th or higher.' },
      { level: 18, name: 'Spell Mastery',   description: 'Cast one 1st- and one 2nd-level spell at will.' },
    ],
    kit: {
      weaponOptions: [
        { id: 'quarterstaff', name: 'Quarterstaff', stat: 'str', die: '1d6', type: 'bludgeoning', notes: 'Versatile (1d8)' },
        { id: 'dagger-extra', name: 'Dagger', stat: 'finesse', die: '1d4', type: 'piercing', notes: 'Finesse, Light, Thrown 20/60' },
      ],
      focusOptions: [
        { id: 'arcane-focus', name: 'Arcane Focus', description: 'A crystal, orb, rod, staff, or wand used as a spellcasting focus.' },
        { id: 'component-pouch', name: 'Component Pouch', description: 'A small watertight pouch holding all the material components your spells need.' },
      ],
      packOptions: [
        { id: 'scholars', name: "Scholar's Pack", contents: 'Backpack, Book of Lore, Ink, Ink Pen, 10 Parchment, Bag of Sand, Small Knife' },
        { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [{ name: 'Spellbook', description: 'Your most precious possession — 100 pages of arcane formulae.' }],
      armor: null,
      goldRoll: { dice: 4, sides: 4, multiplier: 10 },
    },
  },

  bard: {
    id: 'bard', name: 'Bard', icon: '🎻', hitDie: 8,
    spellAbility: 'cha', saves: ['DEX', 'CHA'],
    skillChoices: 3,
    skillList: SKILLS_ALL, // bards choose any three skills
    casterType: 'full',
    cantripsKnown: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    spellsKnownType: 'known',
    spellsKnown: [4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22],
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'A magical entertainer whose music weaves spells. Inspire your allies, demoralize your foes, and dabble in every trade.',
    proficiencies: 'Light armor. Simple weapons, hand crossbows, longswords, rapiers, shortswords. Three musical instruments.',
    features: [
      { level: 1, name: 'Spellcasting',        description: 'CHA-based spellcasting.' },
      { level: 1, name: 'Bardic Inspiration',  description: 'Bonus action: give a creature a d6 to add to one roll (d8 at 5th, d10 at 10th). Uses = CHA mod per long rest.' },
      { level: 2, name: 'Jack of All Trades',  description: 'Add half your proficiency bonus to ability checks you are not proficient in.' },
      { level: 2, name: 'Song of Rest',        description: 'Allies who hear your performance during a short rest regain an extra 1d6 HP.' },
      { level: 3, name: 'Expertise',           description: 'Double proficiency bonus for two skill proficiencies (set them to Expert in the Builder).' },
      { level: 5, name: 'Font of Inspiration', description: 'Bardic Inspiration recharges on a short rest.' },
      { level: 6, name: 'Countercharm',        description: 'Performance grants allies advantage on saves vs. being frightened or charmed.' },
      { level: 10, name: 'Magical Secrets',    description: 'Learn two spells from any class.' },
    ],
    kit: {
      weaponOptions: [
        { id: 'rapier', name: 'Rapier', stat: 'finesse', die: '1d8', type: 'piercing', notes: 'Finesse' },
        { id: 'longsword', name: 'Longsword', stat: 'str', die: '1d8', type: 'slashing', notes: 'Versatile (1d10)' },
      ],
      focusOptions: [
        { id: 'lute', name: 'Lute', description: 'A musical instrument that doubles as your spellcasting focus.' },
        { id: 'flute', name: 'Flute', description: 'A musical instrument that doubles as your spellcasting focus.' },
      ],
      packOptions: [
        { id: 'diplomats', name: "Diplomat's Pack", contents: 'Chest, 2 Cases for maps, Fine Clothes, Ink, Ink Pen, Lamp, 2 Flasks of Oil, 5 Paper, Perfume, Sealing Wax, Soap' },
        { id: 'entertainers', name: "Entertainer's Pack", contents: 'Backpack, Bedroll, 2 Costumes, 5 Candles, 5 days Rations, Waterskin, Disguise Kit' },
      ],
      fixedItems: [
        { name: 'Leather Armor', description: 'AC 11 + DEX' },
        { name: 'Dagger', description: '' },
      ],
      armor: { name: 'Leather Armor', baseAc: 11, addDex: true, maxDex: null, shield: false },
      goldRoll: { dice: 5, sides: 4, multiplier: 10 },
    },
  },

  cleric: {
    id: 'cleric', name: 'Cleric', icon: '✨', hitDie: 8,
    spellAbility: 'wis', saves: ['WIS', 'CHA'],
    skillChoices: 2,
    skillList: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
    casterType: 'full',
    cantripsKnown: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
    spellsKnownType: 'prepared', // prepared = level + WIS mod (min 1)
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'A divine agent wielding the power of the gods. Heal the wounded, smite the unholy, and anchor any party.',
    proficiencies: 'Light and medium armor, shields. Simple weapons.',
    features: [
      { level: 1, name: 'Spellcasting',        description: 'WIS-based divine spellcasting — you prepare spells from the full cleric list each day.' },
      { level: 2, name: 'Channel Divinity',    description: 'Turn Undead, plus a domain option. Once per rest (twice at 6th, three times at 18th).' },
      { level: 5, name: 'Destroy Undead',      description: 'Turned undead of CR 1/2 or lower are destroyed (scales with level).' },
      { level: 10, name: 'Divine Intervention', description: 'Once per day, call on your deity — d100 ≤ cleric level and they intervene.' },
    ],
    kit: {
      weaponOptions: [
        { id: 'mace', name: 'Mace', stat: 'str', die: '1d6', type: 'bludgeoning', notes: '' },
        { id: 'crossbow', name: 'Light Crossbow & 20 bolts', stat: 'dex', die: '1d8', type: 'piercing', notes: 'Ammunition 80/320, Loading, Two-handed' },
      ],
      focusOptions: [
        { id: 'holy-symbol', name: 'Holy Symbol (amulet)', description: 'An amulet bearing the symbol of your deity — your spellcasting focus.' },
        { id: 'holy-emblem', name: 'Holy Symbol (shield emblem)', description: 'Your deity\'s symbol emblazoned on your shield.' },
      ],
      packOptions: [
        { id: 'priests', name: "Priest's Pack", contents: 'Backpack, Blanket, 10 Candles, Tinderbox, Alms Box, 2 Incense, Censer, Vestments, 2 days Rations, Waterskin' },
        { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [
        { name: 'Scale Mail', description: 'AC 14 + DEX (max 2)' },
        { name: 'Shield', description: '+2 AC' },
      ],
      armor: { name: 'Scale Mail', baseAc: 14, addDex: true, maxDex: 2, shield: true },
      goldRoll: { dice: 5, sides: 4, multiplier: 10 },
    },
  },

  druid: {
    id: 'druid', name: 'Druid', icon: '🌿', hitDie: 8,
    spellAbility: 'wis', saves: ['INT', 'WIS'],
    skillChoices: 2,
    skillList: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
    casterType: 'full',
    cantripsKnown: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    spellsKnownType: 'prepared', // prepared = level + WIS mod (min 1)
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'A guardian of the wild. Command nature\'s fury, shapeshift into beasts, and draw power from the living world.',
    proficiencies: 'Light and medium armor, shields (no metal). Clubs, daggers, darts, javelins, maces, quarterstaffs, scimitars, sickles, slings, spears.',
    features: [
      { level: 1, name: 'Druidic',       description: 'You know the secret language of druids.' },
      { level: 1, name: 'Spellcasting',  description: 'WIS-based nature magic — you prepare spells from the full druid list each day.' },
      { level: 2, name: 'Wild Shape',    description: 'Transform into a beast you have seen (CR 1/4, no fly/swim — improves with level). Twice per rest.' },
      { level: 18, name: 'Beast Spells', description: 'Cast spells while in Wild Shape.' },
      { level: 20, name: 'Archdruid',    description: 'Unlimited Wild Shape.' },
    ],
    kit: {
      weaponOptions: [
        { id: 'scimitar', name: 'Scimitar', stat: 'finesse', die: '1d6', type: 'slashing', notes: 'Finesse, Light' },
        { id: 'quarterstaff', name: 'Quarterstaff', stat: 'str', die: '1d6', type: 'bludgeoning', notes: 'Versatile (1d8)' },
      ],
      focusOptions: [
        { id: 'druidic-focus', name: 'Druidic Focus (wooden staff)', description: 'A sprig of mistletoe, totem, or wooden staff — your spellcasting focus.' },
        { id: 'druidic-totem', name: 'Druidic Focus (totem)', description: 'A totem carved from bone or wood — your spellcasting focus.' },
      ],
      packOptions: [
        { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [
        { name: 'Leather Armor', description: 'AC 11 + DEX' },
        { name: 'Wooden Shield', description: '+2 AC' },
        { name: 'Herbalism Kit', description: '' },
      ],
      armor: { name: 'Leather Armor', baseAc: 11, addDex: true, maxDex: null, shield: true },
      goldRoll: { dice: 2, sides: 4, multiplier: 10 },
    },
  },

  warlock: {
    id: 'warlock', name: 'Warlock', icon: '👁️', hitDie: 8,
    spellAbility: 'cha', saves: ['WIS', 'CHA'],
    skillChoices: 2,
    skillList: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
    casterType: 'pact',
    cantripsKnown: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    spellsKnownType: 'known',
    spellsKnown: [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'You struck a bargain with an otherworldly patron. Few spell slots — but they\'re always at your highest level, and they come back on a short rest.',
    proficiencies: 'Light armor. Simple weapons.',
    features: [
      { level: 1, name: 'Pact Magic',            description: 'CHA-based. All spell slots are the same level and recharge on a short rest.' },
      { level: 2, name: 'Eldritch Invocations',  description: 'Learn 2 invocations (more as you level — track them in your notes for now).' },
      { level: 3, name: 'Pact Boon',             description: 'Choose Pact of the Chain, Blade, or Tome at level 3.' },
      { level: 11, name: 'Mystic Arcanum (6th)', description: 'One 6th-level spell castable once per long rest (7th at 13, 8th at 15, 9th at 17).' },
    ],
    kit: {
      weaponOptions: [
        { id: 'crossbow', name: 'Light Crossbow & 20 bolts', stat: 'dex', die: '1d8', type: 'piercing', notes: 'Ammunition 80/320, Loading, Two-handed' },
        { id: 'quarterstaff', name: 'Quarterstaff', stat: 'str', die: '1d6', type: 'bludgeoning', notes: 'Versatile (1d8)' },
      ],
      focusOptions: [
        { id: 'arcane-focus', name: 'Arcane Focus', description: 'A crystal, orb, rod, staff, or wand used as a spellcasting focus.' },
        { id: 'component-pouch', name: 'Component Pouch', description: 'A small watertight pouch holding all the material components your spells need.' },
      ],
      packOptions: [
        { id: 'scholars', name: "Scholar's Pack", contents: 'Backpack, Book of Lore, Ink, Ink Pen, 10 Parchment, Bag of Sand, Small Knife' },
        { id: 'dungeoneers', name: "Dungeoneer's Pack", contents: 'Backpack, Crowbar, Hammer, 10 Pitons, 10 Torches, Tinderbox, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [
        { name: 'Leather Armor', description: 'AC 11 + DEX' },
        { name: 'Dagger x2', description: '' },
      ],
      armor: { name: 'Leather Armor', baseAc: 11, addDex: true, maxDex: null, shield: false },
      goldRoll: { dice: 4, sides: 4, multiplier: 10 },
    },
  },

  // ── Half-casters ────────────────────────────────────────────────────────────
  paladin: {
    id: 'paladin', name: 'Paladin', icon: '⚜️', hitDie: 10,
    spellAbility: 'cha', saves: ['WIS', 'CHA'],
    skillChoices: 2,
    skillList: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
    casterType: 'half',
    cantripsKnown: NO_CANTRIPS,
    spellsKnownType: 'prepared', // prepared = floor(level/2) + CHA mod (min 1, none until lvl 2)
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'A holy warrior bound by an oath. Smite your enemies, lay hands on the wounded, and project an aura that shields your allies. Spellcasting awakens at level 2.',
    proficiencies: 'All armor, shields. Simple and martial weapons.',
    features: [
      { level: 1, name: 'Divine Sense',     description: 'Action: detect celestials, fiends, and undead nearby, and consecrated/desecrated places. Uses = 1 + CHA mod per long rest.' },
      { level: 1, name: 'Lay on Hands',      description: 'A pool of healing equal to 5 × your level. Restore HP or cure a disease/poison as an action.' },
      { level: 2, name: 'Spellcasting',      description: 'CHA-based divine magic — prepare spells from the paladin list (floor(level/2) + CHA mod).' },
      { level: 2, name: 'Divine Smite',      description: 'On a melee hit, expend a spell slot to deal +2d8 radiant (+1d8 per slot level above 1st, +1d8 vs undead/fiends).' },
      { level: 2, name: 'Fighting Style',    description: 'Choose a fighting style (track it in your notes for now).' },
      { level: 3, name: 'Divine Health',     description: 'You are immune to disease.' },
      { level: 6, name: 'Aura of Protection', description: 'You and allies within 10 ft add your CHA mod to saving throws.' },
    ],
    kit: {
      weaponOptions: [
        { id: 'longsword', name: 'Longsword', stat: 'str', die: '1d8', type: 'slashing', notes: 'Versatile (1d10)' },
        { id: 'warhammer', name: 'Warhammer', stat: 'str', die: '1d8', type: 'bludgeoning', notes: 'Versatile (1d10)' },
      ],
      focusOptions: [],
      packOptions: [
        { id: 'priests', name: "Priest's Pack", contents: 'Backpack, Blanket, 10 Candles, Tinderbox, Alms Box, 2 Incense, Censer, Vestments, 2 days Rations, Waterskin' },
        { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [
        { name: 'Chain Mail', description: 'AC 16' },
        { name: 'Shield', description: '+2 AC' },
        { name: 'Holy Symbol', description: 'Spellcasting focus' },
        { name: '5 Javelins', description: '1d6 thrown 30/120' },
      ],
      armor: { name: 'Chain Mail', baseAc: 16, addDex: false, maxDex: 0, shield: true },
      goldRoll: { dice: 5, sides: 4, multiplier: 10 },
    },
  },

  ranger: {
    id: 'ranger', name: 'Ranger', icon: '🏹', hitDie: 10,
    spellAbility: 'wis', saves: ['STR', 'DEX'],
    skillChoices: 3,
    skillList: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
    casterType: 'half',
    cantripsKnown: NO_CANTRIPS,
    spellsKnownType: 'known',
    spellsKnown: [0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11],
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'A hunter on the wild frontier. Track quarry across any terrain, fight with bow or blade, and call on primal magic. Spellcasting awakens at level 2.',
    proficiencies: 'Light and medium armor, shields. Simple and martial weapons.',
    features: [
      { level: 1, name: "Favored Enemy",     description: 'You have significant experience with a type of enemy — advantage on tracking and recalling lore about them.' },
      { level: 1, name: 'Natural Explorer',  description: 'You are a master of a favored terrain — difficult terrain doesn\'t slow your group, you can\'t get lost by magic, and more.' },
      { level: 2, name: 'Spellcasting',      description: 'WIS-based primal magic — you know a fixed set of ranger spells.' },
      { level: 2, name: 'Fighting Style',    description: 'Choose Archery, Defense, Dueling, or Two-Weapon Fighting (track it in your notes for now).' },
      { level: 3, name: 'Primeval Awareness', description: 'Expend a spell slot to sense favored enemies within 1 mile (6 with a favored terrain).' },
      { level: 5, name: 'Extra Attack',      description: 'Attack twice whenever you take the Attack action.' },
    ],
    kit: {
      weaponOptions: [
        { id: 'longbow', name: 'Longbow & 20 arrows', stat: 'dex', die: '1d8', type: 'piercing', notes: 'Ammunition 150/600, Heavy, Two-handed' },
        { id: 'shortswords', name: 'Two Shortswords', stat: 'finesse', die: '1d6', type: 'piercing', notes: 'Finesse, Light (two-weapon fighting)' },
      ],
      focusOptions: [],
      packOptions: [
        { id: 'dungeoneers', name: "Dungeoneer's Pack", contents: 'Backpack, Crowbar, Hammer, 10 Pitons, 10 Torches, Tinderbox, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
        { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [
        { name: 'Scale Mail', description: 'AC 14 + DEX (max 2)' },
        { name: 'Two Shortswords', description: '1d6 piercing, Finesse' },
      ],
      armor: { name: 'Scale Mail', baseAc: 14, addDex: true, maxDex: 2, shield: false },
      goldRoll: { dice: 5, sides: 4, multiplier: 10 },
    },
  },

  // ── Pure martials (non-casters) ───────────────────────────────────────────────
  barbarian: {
    id: 'barbarian', name: 'Barbarian', icon: '🪓', hitDie: 12,
    spellAbility: null, saves: ['STR', 'CON'],
    skillChoices: 2,
    skillList: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
    casterType: 'none',
    cantripsKnown: NO_CANTRIPS,
    spellsKnownType: 'none',
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'A fury-fueled warrior of the wilds. Rage through pain, hit like a landslide, and shrug off blows that would fell lesser fighters.',
    proficiencies: 'Light and medium armor, shields. Simple and martial weapons.',
    features: [
      { level: 1, name: 'Rage',               description: 'Bonus action: rage for advantage on STR checks/saves, +rage damage on STR attacks, and resistance to bludgeoning/piercing/slashing. Uses scale with level.' },
      { level: 1, name: 'Unarmored Defense',  description: 'While not wearing armor, your AC = 10 + DEX mod + CON mod (you may use a shield). Set this in the Builder.' },
      { level: 2, name: 'Reckless Attack',    description: 'Gain advantage on melee STR attacks this turn; attacks against you have advantage until your next turn.' },
      { level: 2, name: 'Danger Sense',       description: 'Advantage on DEX saves against effects you can see (traps, spells).' },
      { level: 5, name: 'Extra Attack',       description: 'Attack twice whenever you take the Attack action.' },
      { level: 5, name: 'Fast Movement',      description: '+10 ft speed while not wearing heavy armor.' },
    ],
    kit: {
      weaponOptions: [
        { id: 'greataxe', name: 'Greataxe', stat: 'str', die: '1d12', type: 'slashing', notes: 'Heavy, Two-handed' },
        { id: 'greatsword', name: 'Greatsword', stat: 'str', die: '2d6', type: 'slashing', notes: 'Heavy, Two-handed' },
      ],
      focusOptions: [],
      packOptions: [
        { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [
        { name: '4 Javelins', description: '1d6 thrown 30/120' },
      ],
      armor: null,
      goldRoll: { dice: 2, sides: 4, multiplier: 10 },
    },
  },

  fighter: {
    id: 'fighter', name: 'Fighter', icon: '⚔️', hitDie: 10,
    spellAbility: null, saves: ['STR', 'CON'],
    skillChoices: 2,
    skillList: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
    casterType: 'none',
    cantripsKnown: NO_CANTRIPS,
    spellsKnownType: 'none',
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'A master of weapons and armor. Versatile, durable, and unmatched in sustained combat — the backbone of any front line.',
    proficiencies: 'All armor, shields. Simple and martial weapons.',
    features: [
      { level: 1, name: 'Fighting Style',    description: 'Choose a fighting style — Archery, Defense, Dueling, Great Weapon, Protection, or Two-Weapon (track it in your notes for now).' },
      { level: 1, name: 'Second Wind',       description: 'Bonus action: regain 1d10 + fighter level HP. Once per short or long rest.' },
      { level: 2, name: 'Action Surge',      description: 'Take one additional action on your turn. Once per short or long rest (twice at 17th).' },
      { level: 5, name: 'Extra Attack',      description: 'Attack twice whenever you take the Attack action (three times at 11th, four at 20th).' },
    ],
    kit: {
      weaponOptions: [
        { id: 'longsword', name: 'Longsword', stat: 'str', die: '1d8', type: 'slashing', notes: 'Versatile (1d10)' },
        { id: 'greatsword', name: 'Greatsword', stat: 'str', die: '2d6', type: 'slashing', notes: 'Heavy, Two-handed' },
      ],
      focusOptions: [],
      packOptions: [
        { id: 'dungeoneers', name: "Dungeoneer's Pack", contents: 'Backpack, Crowbar, Hammer, 10 Pitons, 10 Torches, Tinderbox, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
        { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [
        { name: 'Chain Mail', description: 'AC 16' },
        { name: 'Shield', description: '+2 AC' },
        { name: 'Light Crossbow & 20 bolts', description: '1d8 piercing' },
      ],
      armor: { name: 'Chain Mail', baseAc: 16, addDex: false, maxDex: 0, shield: true },
      goldRoll: { dice: 5, sides: 4, multiplier: 10 },
    },
  },

  monk: {
    id: 'monk', name: 'Monk', icon: '👊', hitDie: 8,
    spellAbility: null, saves: ['STR', 'DEX'],
    skillChoices: 2,
    skillList: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
    casterType: 'none',
    cantripsKnown: NO_CANTRIPS,
    spellsKnownType: 'none',
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'A disciplined martial artist channeling inner ki. Strike faster than the eye, deflect arrows, and walk paths no armor could follow.',
    proficiencies: 'Simple weapons and shortswords. No armor or shields.',
    features: [
      { level: 1, name: 'Unarmored Defense', description: 'While unarmored and not using a shield, your AC = 10 + DEX mod + WIS mod. Set this in the Builder.' },
      { level: 1, name: 'Martial Arts',      description: 'Use DEX for unarmed/monk-weapon attacks, roll a Martial Arts die (d4→d10) for damage, and make an unarmed strike as a bonus action.' },
      { level: 2, name: 'Ki',                description: 'You have ki points = your level. Spend them on Flurry of Blows, Patient Defense, or Step of the Wind. Recharge on a short rest.' },
      { level: 2, name: 'Unarmored Movement', description: '+10 ft speed while unarmored (scales with level).' },
      { level: 3, name: 'Deflect Missiles',  description: 'Reaction: reduce ranged weapon damage by 1d10 + DEX + level; if reduced to 0 you can throw it back.' },
      { level: 5, name: 'Extra Attack',      description: 'Attack twice whenever you take the Attack action.' },
      { level: 5, name: 'Stunning Strike',   description: 'Spend 1 ki on a hit to force a CON save or stun the target until your next turn.' },
    ],
    kit: {
      weaponOptions: [
        { id: 'shortsword', name: 'Shortsword', stat: 'finesse', die: '1d6', type: 'piercing', notes: 'Finesse, Light (monk weapon)' },
        { id: 'quarterstaff', name: 'Quarterstaff', stat: 'str', die: '1d6', type: 'bludgeoning', notes: 'Versatile (1d8), monk weapon' },
      ],
      focusOptions: [],
      packOptions: [
        { id: 'dungeoneers', name: "Dungeoneer's Pack", contents: 'Backpack, Crowbar, Hammer, 10 Pitons, 10 Torches, Tinderbox, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
        { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [
        { name: '10 Darts', description: '1d4 thrown 20/60, Finesse' },
      ],
      armor: null,
      goldRoll: { dice: 5, sides: 4, multiplier: 1 }, // monks start poor (5d4 gp)
    },
  },

  rogue: {
    id: 'rogue', name: 'Rogue', icon: '🗡️', hitDie: 8,
    spellAbility: null, saves: ['DEX', 'INT'],
    skillChoices: 4,
    skillList: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
    casterType: 'none',
    cantripsKnown: NO_CANTRIPS,
    spellsKnownType: 'none',
    subclass: null, subclassShort: null,
    hasMetamagic: false, hasSorceryPoints: false, hasLunarPhases: false,
    blurb: 'A cunning opportunist who turns precision into devastation. Sneak, scout, disarm, and strike where it hurts most.',
    proficiencies: 'Light armor. Simple weapons, hand crossbows, longswords, rapiers, shortswords. Thieves\' tools.',
    features: [
      { level: 1, name: 'Expertise',     description: 'Double your proficiency bonus for two skills (or one skill + thieves\' tools). Set them to Expert in the Builder.' },
      { level: 1, name: 'Sneak Attack',  description: 'Once per turn, deal extra damage (1d6 at level 1, scaling) to a target you have advantage on, or that\'s near an ally.' },
      { level: 1, name: "Thieves' Cant", description: 'A secret mix of dialect, jargon, and code you can use to hide messages.' },
      { level: 2, name: 'Cunning Action', description: 'Bonus action each turn to Dash, Disengage, or Hide.' },
      { level: 5, name: 'Uncanny Dodge', description: 'Reaction: halve the damage from one attack that hits you.' },
    ],
    kit: {
      weaponOptions: [
        { id: 'rapier', name: 'Rapier', stat: 'finesse', die: '1d8', type: 'piercing', notes: 'Finesse' },
        { id: 'shortsword', name: 'Shortsword', stat: 'finesse', die: '1d6', type: 'piercing', notes: 'Finesse, Light' },
      ],
      focusOptions: [],
      packOptions: [
        { id: 'burglars', name: "Burglar's Pack", contents: 'Backpack, Ball Bearings, 10 ft String, Bell, 5 Candles, Crowbar, Hammer, 10 Pitons, Hooded Lantern, 2 Oil, 5 days Rations, Tinderbox, Waterskin, 50 ft Rope' },
        { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
      ],
      fixedItems: [
        { name: 'Leather Armor', description: 'AC 11 + DEX' },
        { name: 'Dagger x2', description: '' },
        { name: "Thieves' Tools", description: '' },
      ],
      armor: { name: 'Leather Armor', baseAc: 11, addDex: true, maxDex: null, shield: false },
      goldRoll: { dice: 4, sides: 4, multiplier: 10 },
    },
  },
}

export const CLASS_IDS = Object.keys(CLASSES)

export const SPELL_LISTS = {
  sorcerer: sorcererSpells,
  wizard: wizardSpells,
  bard: bardSpells,
  cleric: clericSpells,
  druid: druidSpells,
  warlock: warlockSpells,
  paladin: paladinSpells,
  ranger: rangerSpells,
}

// ── Helpers (all tolerate unknown ids by falling back to sorcerer) ────────────

export function getClass(classId) {
  return CLASSES[classId] || CLASSES[DEFAULT_CLASS]
}

export function classMaxHp(classId, level, conMod) {
  const die = getClass(classId).hitDie
  // Level 1: max die + CON; later levels: average (die/2 + 1) + CON
  return die + conMod + (level - 1) * (die / 2 + 1 + conMod)
}

// Spell slots as { 1: total, ..., 9: total } for any class
export function classSlotMax(classId, level) {
  const cfg = getClass(classId)
  const result = {}
  for (let i = 1; i <= 9; i++) result[i] = 0
  if (cfg.casterType === 'none') {
    // martials have no spell slots
  } else if (cfg.casterType === 'pact') {
    const pact = PACT_SLOTS[level] || PACT_SLOTS[1]
    result[pact.slotLevel] = pact.count
  } else if (cfg.casterType === 'half') {
    const slots = HALF_SLOTS_TABLE[level] || HALF_SLOTS_TABLE[1]
    for (let i = 1; i <= 5; i++) result[i] = slots[i - 1]
  } else {
    const slots = SPELL_SLOTS_TABLE[level] || SPELL_SLOTS_TABLE[1]
    for (let i = 1; i <= 9; i++) result[i] = slots[i - 1]
  }
  return result
}

export function isCaster(classId) {
  return getClass(classId).casterType !== 'none'
}

export function cantripsKnownFor(classId, level) {
  return getClass(classId).cantripsKnown[level - 1] || 0
}

// Max known/prepared spells.
//  • martials: 0
//  • before a class has any slots (e.g. paladin/ranger level 1): 0
//  • prepared full casters: level + ability mod
//  • prepared half casters (paladin): floor(level/2) + ability mod
//  • known casters: their spellsKnown table
export function spellsLimitFor(classId, level, abilityMod = 0) {
  const cfg = getClass(classId)
  if (cfg.casterType === 'none') return 0
  if (maxCastableSpellLevel(classId, level) === 0) return 0
  if (cfg.spellsKnownType === 'prepared') {
    const effLevel = cfg.casterType === 'half' ? Math.floor(level / 2) : level
    return Math.max(1, effLevel + abilityMod)
  }
  return cfg.spellsKnown[level - 1] || 0
}

export function maxCastableSpellLevel(classId, level) {
  const slots = classSlotMax(classId, level)
  let max = 0
  for (let i = 1; i <= 9; i++) if (slots[i] > 0) max = i
  return max
}

export function spellListFor(classId) {
  if (getClass(classId).casterType === 'none') return []
  return SPELL_LISTS[classId] || SPELL_LISTS[DEFAULT_CLASS]
}

// Display label for the spell-picker limit ("known" vs "prepared")
export function spellsLimitLabel(classId) {
  return getClass(classId).spellsKnownType === 'prepared' ? 'prepared' : 'known'
}

// ── Class resources (Rage, Ki, Lay on Hands, …) ──────────────────────────────
// Returns the trackable / reference resources for a class at a given level.
// kind: 'uses'  → small pip counter (spend/restore)
//       'pool'  → numeric pool with +/- (e.g. Lay on Hands HP)
//       'static'→ display-only reference value (e.g. Sneak Attack dice)
// recharge: 'short' | 'long' (when the resource refills on a rest)
export function getClassResources(classId, level, abilityScores = {}) {
  const mod = (a) => Math.floor(((abilityScores[a] ?? 10) - 10) / 2)
  const out = []

  if (classId === 'barbarian') {
    const uses = level >= 17 ? 6 : level >= 12 ? 5 : level >= 6 ? 4 : level >= 3 ? 3 : 2
    const rageDmg = level >= 16 ? 4 : level >= 9 ? 3 : 2
    out.push({ id: 'rage', name: 'Rage', max: uses, recharge: 'long', kind: 'uses',
      note: `+${rageDmg} rage damage · resistance to bludgeoning/piercing/slashing${level >= 20 ? ' · (unlimited at 20)' : ''}` })
  }

  if (classId === 'fighter') {
    out.push({ id: 'second-wind', name: 'Second Wind', max: 1, recharge: 'short', kind: 'uses',
      note: `Bonus action: regain 1d10 + ${level} HP` })
    if (level >= 2) {
      out.push({ id: 'action-surge', name: 'Action Surge', max: level >= 17 ? 2 : 1, recharge: 'short', kind: 'uses',
        note: 'One extra action on your turn' })
    }
    if (level >= 9) {
      out.push({ id: 'indomitable', name: 'Indomitable', max: level >= 17 ? 3 : level >= 13 ? 2 : 1, recharge: 'long', kind: 'uses',
        note: 'Reroll a failed saving throw' })
    }
  }

  if (classId === 'monk') {
    if (level >= 2) {
      out.push({ id: 'ki', name: 'Ki Points', max: level, recharge: 'short', kind: 'uses',
        note: 'Flurry of Blows, Patient Defense, Step of the Wind' })
    }
    const ma = level >= 17 ? 'd10' : level >= 11 ? 'd8' : level >= 5 ? 'd6' : 'd4'
    out.push({ id: 'martial-arts', name: 'Martial Arts Die', max: 0, recharge: 'long', kind: 'static', note: ma })
  }

  if (classId === 'rogue') {
    const dice = Math.ceil(level / 2)
    out.push({ id: 'sneak-attack', name: 'Sneak Attack', max: 0, recharge: 'long', kind: 'static', note: `${dice}d6` })
  }

  if (classId === 'paladin') {
    out.push({ id: 'lay-on-hands', name: 'Lay on Hands', max: 5 * level, recharge: 'long', kind: 'pool',
      note: 'Pool of healing HP (or cure disease/poison)' })
    out.push({ id: 'divine-sense', name: 'Divine Sense', max: 1 + Math.max(0, mod('cha')), recharge: 'long', kind: 'uses',
      note: 'Detect celestials, fiends, undead' })
    if (level >= 3) {
      out.push({ id: 'channel-divinity', name: 'Channel Divinity', max: 1, recharge: 'short', kind: 'uses',
        note: 'Oath-specific divine power' })
    }
  }

  return out
}

// ── Subclasses ───────────────────────────────────────────────────────────────
// { title, gainLevel, options: [{ name, shortName, blurb, features:[{level,name,description}] }] }
export function getSubclasses(classId) {
  const data = subclassesData[classId]
  if (!data) return { title: 'Subclass', gainLevel: 3, options: [] }
  // Sorcerer also offers the injected Lunar Sorcery option (Annabelle's path)
  if (classId === 'sorcerer') {
    return { ...data, options: [LUNAR_SUBCLASS, ...data.options] }
  }
  return data
}

export function getSubclassOption(classId, shortName) {
  if (!shortName) return null
  return getSubclasses(classId).options.find(o => o.shortName === shortName) || null
}

// Full display name for a chosen subclass short name (falls back to the short)
export function subclassDisplayName(classId, shortName) {
  if (!shortName) return null
  return getSubclassOption(classId, shortName)?.name || shortName
}

// Subclass features unlocked at or below the given character level
export function getSubclassFeatures(classId, shortName, level) {
  const opt = getSubclassOption(classId, shortName)
  if (!opt) return []
  return opt.features.filter(f => (f.level || 1) <= level)
}

// Lunar sorcerers get the moon-phase UI + always-prepared bonus spells.
export function isLunarSorcerer(classId, shortName) {
  return classId === 'sorcerer' && shortName === 'Lunar'
}

// AC for a freshly created character of this class
export function startingAc(classId, dexMod, { withKit = true, speciesAcBonus = 0 } = {}) {
  const armor = withKit ? getClass(classId).kit.armor : null
  let ac
  if (!armor) {
    ac = 10 + dexMod
  } else {
    const dexPart = armor.addDex ? (armor.maxDex != null ? Math.min(dexMod, armor.maxDex) : dexMod) : 0
    ac = armor.baseAc + dexPart + (armor.shield ? 2 : 0)
  }
  return ac + speciesAcBonus
}
