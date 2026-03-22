// Annabelle — Warforged Lunar Sorcerer, Level 4

export const CHARACTER = {
  name: 'Annabelle',
  class: 'Sorcerer',
  subclass: 'Lunar',
  level: 4,
  background: 'Haunted One',
  species: 'Warforged',
  xp: 0,
}

export const ABILITIES = {
  str: { score: 8 },
  dex: { score: 10 },
  con: { score: 16 },
  int: { score: 8 },
  wis: { score: 14 },
  cha: { score: 19 },
}

export const PROFICIENCY_BONUS = 2
export const SAVE_PROFICIENCIES = ['con', 'cha']

export const SKILLS = [
  { name: 'Acrobatics',      ability: 'dex' },
  { name: 'Animal Handling', ability: 'wis' },
  { name: 'Arcana',          ability: 'int' },
  { name: 'Athletics',       ability: 'str' },
  { name: 'Deception',       ability: 'cha', proficient: true },
  { name: 'History',         ability: 'int' },
  { name: 'Insight',         ability: 'wis' },
  { name: 'Intimidation',    ability: 'cha' },
  { name: 'Investigation',   ability: 'int' },
  { name: 'Medicine',        ability: 'wis' },
  { name: 'Nature',          ability: 'int' },
  { name: 'Perception',      ability: 'wis' },
  { name: 'Performance',     ability: 'cha', proficient: true },
  { name: 'Persuasion',      ability: 'cha' },
  { name: 'Religion',        ability: 'int' },
  { name: 'Sleight of Hand', ability: 'dex' },
  { name: 'Stealth',         ability: 'dex' },
  { name: 'Survival',        ability: 'wis' },
]

export const COMBAT = {
  maxHp: 30,
  armorClass: 11,
  speed: 30,
  size: 'Med',
  passivePerception: 12,
  hitDiceType: 6,
  hitDiceTotal: 4,
  spellSaveDC: 14,
  spellAttackBonus: 6,
  spellcastingAbility: 'CHA',
}

export const SPELL_SLOT_MAX = { 1: 4, 2: 3, 3: 2, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
export const SORCERY_POINTS_MAX = 4

export const LUNAR_PHASES = {
  full: {
    name: 'Full Moon',
    color: 'amber',
    bonusSpells: ['Cure Wounds', 'Moonbeam'],
    embodiment: 'When you cast a healing spell, the target regains additional HP equal to your Proficiency Bonus (+2).',
    tip: 'Best for sustained fights & support',
  },
  new: {
    name: 'New Moon',
    color: 'slate',
    bonusSpells: ['Silent Image', 'Invisibility'],
    embodiment: 'When you cast an illusion spell, use your reaction to become invisible until start of your next turn.',
    tip: 'Best for stealth, escape, battlefield control',
  },
  crescent: {
    name: 'Crescent Moon',
    color: 'purple',
    bonusSpells: ['Shield', 'Lesser Restoration'],
    embodiment: '+1 bonus to AC. When you cast Shield, expend 1 SP to extend it to an ally within 30 ft.',
    tip: 'Best when expecting to take hits',
  },
}

export const SPELLS = [
  { level: 'C', name: 'Fire Bolt',          castTime: '1 Action',       range: '120 ft', conc: false, ritual: false, mat: false, notes: '+6 to hit | 1d10 fire' },
  { level: 'C', name: 'Prestidigitation',   castTime: '1 Action',       range: '10 ft',  conc: false, ritual: false, mat: false, notes: 'Utility cantrip' },
  { level: 'C', name: 'Mage Hand',          castTime: '1 Action',       range: '30 ft',  conc: false, ritual: false, mat: false, notes: 'Utility cantrip' },
  { level: 'C', name: 'Minor Illusion',     castTime: '1 Action',       range: '30 ft',  conc: false, ritual: false, mat: false, notes: 'Sound or image illusion' },
  { level: 1,   name: 'Cure Wounds',        castTime: '1 Action',       range: 'Touch',  conc: false, ritual: false, mat: false, lunar: 'full',     notes: 'Lunar bonus | 1d8+4 HP',                              upcast: '+1d8 healing per slot level above 1st' },
  { level: 1,   name: 'Silent Image',       castTime: '1 Action',       range: '60 ft',  conc: true,  ritual: false, mat: false, lunar: 'new',      notes: 'Lunar bonus | Illusion 15 ft cube' },
  { level: 1,   name: 'Shield',             castTime: '1 Reaction',     range: 'Self',   conc: false, ritual: false, mat: false, lunar: 'crescent', notes: 'Lunar bonus | +5 AC until next turn' },
  { level: 1,   name: 'Chromatic Orb',      castTime: '1 Action',       range: '90 ft',  conc: false, ritual: false, mat: true,  notes: '+6 to hit | 3d8 (choose type) | 50gp diamond',        upcast: '+1d8 damage per slot level above 1st' },
  { level: 1,   name: 'Sleep',              castTime: '1 Action',       range: '90 ft',  conc: false, ritual: false, mat: false, notes: '5d8 HP of creatures fall asleep',                      upcast: '+2d8 HP threshold per slot level above 1st' },
  { level: 1,   name: 'Mage Armor',         castTime: '1 Action',       range: 'Touch',  conc: false, ritual: false, mat: true,  notes: 'AC = 13 + DEX | 8 hrs | piece of leather' },
  { level: 2,   name: 'Moonbeam',           castTime: '1 Action',       range: '120 ft', conc: true,  ritual: false, mat: false, lunar: 'full',     notes: 'Lunar bonus | 2d10 radiant/turn | CON save',          upcast: '+1d10 radiant per slot level above 2nd' },
  { level: 2,   name: 'Invisibility',       castTime: '1 Action',       range: 'Touch',  conc: true,  ritual: false, mat: true,  lunar: 'new',      notes: 'Lunar bonus | 1 hr | eyelash + gum arabic',           upcast: 'Target 1 additional creature per slot level above 2nd' },
  { level: 2,   name: 'Lesser Restoration', castTime: '1 Action',       range: 'Touch',  conc: false, ritual: false, mat: false, lunar: 'crescent', notes: 'Lunar bonus | Remove condition or disease' },
  { level: 2,   name: 'Scorching Ray',      castTime: '1 Action',       range: '120 ft', conc: false, ritual: false, mat: false, notes: '3 rays | +6 to hit | 2d6 fire each',                   upcast: '+1 ray (+2d6) per slot level above 2nd' },
  { level: 2,   name: 'Misty Step',         castTime: '1 Bonus Action', range: 'Self',   conc: false, ritual: false, mat: false, notes: 'Teleport up to 30 ft' },
]

export const CLASS_FEATURES = [
  { name: 'Font of Magic',        description: 'You have 4 Sorcery Points. Convert spell slots to SP or vice versa.' },
  { name: 'Metamagic',            description: 'Choose 2 Metamagic options at level 3.' },
  { name: 'Lunar Embodiment',     description: 'Bonus spells per lunar phase, plus a passive phase effect.' },
  { name: 'Lunar Spells',         description: 'Phase bonus spells always prepared, do not count against spells known.' },
  { name: 'Sorcerous Resilience', description: 'Proficiency in Constitution saving throws.' },
  { name: 'Spellcasting',         description: 'CHA-based. Spell Save DC 14 | Spell Attack +6.' },
]

export const SPECIES_TRAITS = [
  { name: 'Constructed Resilience', description: 'Resistant to poison. Advantage on saves vs poison, disease, exhaustion. No need to eat, drink, or breathe.' },
  { name: 'Sentry Rest',            description: '6 hours of inactivity counts as a long rest. Remain aware of surroundings.' },
  { name: 'Integrated Protection',  description: '+1 bonus to Armor Class.' },
  { name: 'Specialized Design',     description: '+1 tool proficiency and +1 additional skill proficiency.' },
]

export const EQUIPMENT = [
  'Explorer Pack (Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Rope)',
  'Dagger x2',
  'Arcane Focus',
  '10 GP',
]

export const WEAPON_ATTACKS = [
  { name: 'Dagger',         atkBonus: '+2', damage: '1d4-1 piercing', notes: 'Finesse, Light, Thrown 20/60' },
  { name: 'Fire Bolt',      atkBonus: '+6', damage: '1d10 fire',      notes: 'Cantrip | 120 ft range' },
  { name: 'Chromatic Orb',  atkBonus: '+6', damage: '3d8 (type)',     notes: 'Lvl 1 | 90 ft | 50gp diamond' },
]

export const LANGUAGES = ['Common', 'Elvish', 'Draconic', 'Thieves Cant', 'Undercommon']
