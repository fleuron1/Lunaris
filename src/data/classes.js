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

export const DEFAULT_CLASS = 'sorcerer'

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
      { level: 1, name: 'Spellcasting',         description: 'CHA-based spellcasting.' },
      { level: 1, name: 'Lunar Embodiment',     description: 'Bonus spells per lunar phase, plus a passive phase effect.' },
      { level: 1, name: 'Lunar Spells',         description: 'Phase bonus spells always prepared, do not count against spells known.' },
      { level: 1, name: 'Sorcerous Resilience', description: 'Proficiency in Constitution saving throws.' },
      { level: 2, name: 'Font of Magic',        description: 'Sorcery Points: convert spell slots to SP or vice versa.' },
      { level: 3, name: 'Metamagic',            description: 'Bend your spells with Metamagic options.' },
      { level: 5, name: 'Magical Guidance',     description: 'Spend 1 SP to reroll a failed ability check.' },
      { level: 6, name: 'Waxing and Waning',    description: 'Change your lunar phase as a bonus action by spending 1 SP (free once per long rest).' },
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
      { level: 2, name: 'Arcane Tradition', description: 'Choose a school specialization at level 2 (track it in your notes for now).' },
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
      { level: 3, name: 'Bard College',        description: 'Choose a college at level 3 (track it in your notes for now).' },
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
      { level: 1, name: 'Divine Domain',       description: 'Choose a domain at level 1 (track it in your notes for now).' },
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
      { level: 2, name: 'Druid Circle',  description: 'Choose a circle at level 2 (track it in your notes for now).' },
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
      { level: 1, name: 'Otherworldly Patron',   description: 'Choose a patron at level 1 (track it in your notes for now).' },
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
}

export const CLASS_IDS = Object.keys(CLASSES)

export const SPELL_LISTS = {
  sorcerer: sorcererSpells,
  wizard: wizardSpells,
  bard: bardSpells,
  cleric: clericSpells,
  druid: druidSpells,
  warlock: warlockSpells,
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
  if (cfg.casterType === 'pact') {
    const pact = PACT_SLOTS[level] || PACT_SLOTS[1]
    result[pact.slotLevel] = pact.count
  } else {
    const slots = SPELL_SLOTS_TABLE[level] || SPELL_SLOTS_TABLE[1]
    for (let i = 1; i <= 9; i++) result[i] = slots[i - 1]
  }
  return result
}

export function cantripsKnownFor(classId, level) {
  return getClass(classId).cantripsKnown[level - 1] || 0
}

// Max known/prepared spells. Prepared casters need their casting ability mod.
export function spellsLimitFor(classId, level, abilityMod = 0) {
  const cfg = getClass(classId)
  if (cfg.spellsKnownType === 'prepared') return Math.max(1, level + abilityMod)
  return cfg.spellsKnown[level - 1] || 0
}

export function maxCastableSpellLevel(classId, level) {
  const slots = classSlotMax(classId, level)
  let max = 0
  for (let i = 1; i <= 9; i++) if (slots[i] > 0) max = i
  return max
}

export function spellListFor(classId) {
  return SPELL_LISTS[classId] || SPELL_LISTS[DEFAULT_CLASS]
}

// Display label for the spell-picker limit ("known" vs "prepared")
export function spellsLimitLabel(classId) {
  return getClass(classId).spellsKnownType === 'prepared' ? 'prepared' : 'known'
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
