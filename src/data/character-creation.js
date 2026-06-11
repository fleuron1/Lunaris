// Character creation data — species, backgrounds, ability methods, equipment.
// v1 supports one class: Sorcerer (Lunar Sorcery), matching the existing sheet.

// ── Species ───────────────────────────────────────────────────────────────────
// Mechanical hooks the wizard actually applies:
//   speed/size/languages  → written to the sheet
//   acBonus               → added to starting AC (10 + DEX mod)
//   skills                → auto-granted skill proficiencies
//   extraSkills           → additional skill picks (any skill)
//   extraLanguages        → additional language picks
// Everything in `traits` is displayed on the sheet's Species Traits card.
export const SPECIES = [
  {
    id: 'human', name: 'Human', icon: '🧑', size: 'Med', speed: 30,
    languages: ['Common'], extraLanguages: 1, extraSkills: 1,
    blurb: 'Adaptable and ambitious — the most widespread folk in every land.',
    traits: [
      { name: 'Versatile', description: 'You gain proficiency in one additional skill of your choice.' },
      { name: 'Ambitious', description: 'Humans pick up languages and customs quickly — you know one extra language of your choice.' },
    ],
  },
  {
    id: 'high-elf', name: 'Elf (High)', icon: '🧝', size: 'Med', speed: 30,
    languages: ['Common', 'Elvish'], skills: ['Perception'],
    blurb: 'Graceful, long-lived, and touched by the magic of the Feywild.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Keen Senses', description: 'You have proficiency in the Perception skill.' },
      { name: 'Fey Ancestry', description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.' },
      { name: 'Trance', description: 'You don\'t need to sleep. You meditate deeply for 4 hours a day, gaining the benefit of a long rest.' },
    ],
  },
  {
    id: 'half-elf', name: 'Half-Elf', icon: '🌗', size: 'Med', speed: 30,
    languages: ['Common', 'Elvish'], extraLanguages: 1, extraSkills: 2,
    blurb: 'Walking in two worlds, belonging fully to neither — charming and versatile.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Fey Ancestry', description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.' },
      { name: 'Skill Versatility', description: 'You gain proficiency in two skills of your choice.' },
    ],
  },
  {
    id: 'tiefling', name: 'Tiefling', icon: '😈', size: 'Med', speed: 30,
    languages: ['Common', 'Infernal'],
    blurb: 'Marked by an infernal bloodline — horns, tail, and an unearned reputation.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Hellish Resistance', description: 'You have resistance to fire damage.' },
      { name: 'Infernal Legacy', description: 'You know the Thaumaturgy cantrip (Charisma is your spellcasting ability for it).' },
    ],
  },
  {
    id: 'dragonborn', name: 'Dragonborn', icon: '🐲', size: 'Med', speed: 30,
    languages: ['Common', 'Draconic'],
    blurb: 'Proud draconic kin with a breath weapon and scales to match their ancestry.',
    traits: [
      { name: 'Draconic Ancestry', description: 'Choose a dragon type — it determines your breath weapon and damage resistance.' },
      { name: 'Breath Weapon', description: 'Action: exhale destructive energy (2d6, DEX or CON save for half, scales with level). Recharges on a rest.' },
      { name: 'Damage Resistance', description: 'You have resistance to the damage type of your draconic ancestry.' },
    ],
  },
  {
    id: 'lightfoot-halfling', name: 'Halfling (Lightfoot)', icon: '🍀', size: 'Small', speed: 25,
    languages: ['Common', 'Halfling'],
    blurb: 'Small, brave, and impossibly lucky — easy to overlook until they save the day.',
    traits: [
      { name: 'Lucky', description: 'When you roll a 1 on a d20 for an attack roll, ability check, or saving throw, you can reroll and must use the new roll.' },
      { name: 'Brave', description: 'You have advantage on saving throws against being frightened.' },
      { name: 'Halfling Nimbleness', description: 'You can move through the space of any creature that is of a size larger than yours.' },
      { name: 'Naturally Stealthy', description: 'You can attempt to hide even when obscured only by a creature one size larger than you.' },
    ],
  },
  {
    id: 'rock-gnome', name: 'Gnome (Rock)', icon: '⚙️', size: 'Small', speed: 25,
    languages: ['Common', 'Gnomish'],
    blurb: 'Curious tinkerers with sharp minds and a knack for surviving magical mishaps.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Gnome Cunning', description: 'You have advantage on Intelligence, Wisdom, and Charisma saving throws against magic.' },
      { name: 'Artificer\'s Lore', description: 'Add twice your proficiency bonus to History checks about magic items, alchemical objects, or technological devices.' },
      { name: 'Tinker', description: 'Using tinker\'s tools, you can construct tiny clockwork devices (clockwork toy, fire starter, music box).' },
    ],
  },
  {
    id: 'warforged', name: 'Warforged', icon: '🤖', size: 'Med', speed: 30,
    languages: ['Common'], acBonus: 1,
    blurb: 'Living constructs built for a war that ended — now searching for purpose.',
    traits: [
      { name: 'Constructed Resilience', description: 'Resistant to poison. Advantage on saves vs poison, disease, exhaustion. No need to eat, drink, or breathe.' },
      { name: 'Sentry Rest', description: '6 hours of inactivity counts as a long rest. Remain aware of surroundings.' },
      { name: 'Integrated Protection', description: '+1 bonus to Armor Class.' },
      { name: 'Specialized Design', description: '+1 tool proficiency and +1 additional skill proficiency.' },
    ],
  },
  {
    id: 'tabaxi', name: 'Tabaxi', icon: '🐈', size: 'Med', speed: 30,
    languages: ['Common'], extraLanguages: 1, skills: ['Perception', 'Stealth'],
    blurb: 'Feline wanderers driven by insatiable curiosity and sudden bursts of speed.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Feline Agility', description: 'When you move on your turn, you can double your speed until the end of the turn. Recharges when you spend a turn without moving.' },
      { name: 'Cat\'s Claws', description: 'Your claws are natural weapons: 1d4 + STR slashing damage. You also have a climbing speed of 20 feet.' },
      { name: 'Cat\'s Talent', description: 'You have proficiency in the Perception and Stealth skills.' },
    ],
  },
  {
    id: 'half-orc', name: 'Half-Orc', icon: '💪', size: 'Med', speed: 30,
    languages: ['Common', 'Orc'], skills: ['Intimidation'],
    blurb: 'Strength and grit from orcish blood, tempered by human resolve.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Menacing', description: 'You have proficiency in the Intimidation skill.' },
      { name: 'Relentless Endurance', description: 'When reduced to 0 HP but not killed outright, you drop to 1 HP instead. Once per long rest.' },
      { name: 'Savage Attacks', description: 'On a melee weapon critical hit, roll one extra weapon damage die.' },
    ],
  },
  {
    id: 'aasimar', name: 'Aasimar', icon: '👼', size: 'Med', speed: 30,
    languages: ['Common', 'Celestial'],
    blurb: 'Mortals carrying a spark of the divine — healers and beacons against the dark.',
    traits: [
      { name: 'Darkvision', description: 'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.' },
      { name: 'Celestial Resistance', description: 'You have resistance to necrotic damage and radiant damage.' },
      { name: 'Healing Hands', description: 'Action: touch a creature to restore HP equal to your level. Once per long rest.' },
      { name: 'Light Bearer', description: 'You know the Light cantrip (Charisma is your spellcasting ability for it).' },
    ],
  },
]

// ── Backgrounds ───────────────────────────────────────────────────────────────
export const BACKGROUNDS = [
  {
    id: 'acolyte', name: 'Acolyte', icon: '⛪', skills: ['Insight', 'Religion'], extraLanguages: 2,
    blurb: 'You spent your life in service to a temple.',
    feature: { name: 'Shelter of the Faithful', description: 'You and your companions can receive free healing and care at temples of your faith.' },
  },
  {
    id: 'charlatan', name: 'Charlatan', icon: '🎭', skills: ['Deception', 'Sleight of Hand'],
    blurb: 'People believe what you want them to believe.',
    feature: { name: 'False Identity', description: 'You have a second identity with documentation and disguises, and can forge documents.' },
  },
  {
    id: 'criminal', name: 'Criminal', icon: '🗡️', skills: ['Deception', 'Stealth'],
    blurb: 'You have a history of breaking the law.',
    feature: { name: 'Criminal Contact', description: 'You have a reliable contact in a network of criminals who can get messages to and from you.' },
  },
  {
    id: 'entertainer', name: 'Entertainer', icon: '🎪', skills: ['Acrobatics', 'Performance'],
    blurb: 'You thrive in front of an audience.',
    feature: { name: 'By Popular Demand', description: 'You can always find a place to perform, receiving free lodging and food in return.' },
  },
  {
    id: 'folk-hero', name: 'Folk Hero', icon: '🌾', skills: ['Animal Handling', 'Survival'],
    blurb: 'You come from humble roots, destined for more.',
    feature: { name: 'Rustic Hospitality', description: 'Common folk will shelter you and shield you from the law (short of risking their lives).' },
  },
  {
    id: 'haunted-one', name: 'Haunted One', icon: '👻', skills: ['Arcana', 'Survival'], extraLanguages: 1,
    blurb: 'Something terrible haunts your past.',
    feature: { name: 'Heart of Darkness', description: 'Common folk who learn of your haunted past extend you sympathy and will even fight beside you.' },
  },
  {
    id: 'noble', name: 'Noble', icon: '👑', skills: ['History', 'Persuasion'], extraLanguages: 1,
    blurb: 'Wealth, power, and privilege run in your family.',
    feature: { name: 'Position of Privilege', description: 'High society welcomes you; common folk accommodate you and assume you have the right to be wherever you are.' },
  },
  {
    id: 'sage', name: 'Sage', icon: '📚', skills: ['Arcana', 'History'], extraLanguages: 2,
    blurb: 'You spent years learning the lore of the multiverse.',
    feature: { name: 'Researcher', description: 'When you don\'t know a piece of lore, you often know where and from whom to obtain it.' },
  },
  {
    id: 'soldier', name: 'Soldier', icon: '🛡️', skills: ['Athletics', 'Intimidation'],
    blurb: 'War has been your life for as long as you remember.',
    feature: { name: 'Military Rank', description: 'Soldiers loyal to your former organization recognize your authority and defer to you.' },
  },
  {
    id: 'urchin', name: 'Urchin', icon: '🐀', skills: ['Sleight of Hand', 'Stealth'],
    blurb: 'You grew up alone on the streets, surviving on your wits.',
    feature: { name: 'City Secrets', description: 'You can travel between any two locations in a city twice as fast as your speed would normally allow.' },
  },
]

// ── Class: Sorcerer (Lunar Sorcery) ───────────────────────────────────────────
export const SORCERER = {
  name: 'Sorcerer',
  subclass: 'Lunar Sorcery',
  hitDie: 6,
  saves: ['CON', 'CHA'],
  spellAbility: 'CHA',
  skillChoices: 2,
  skillList: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
  proficiencies: 'Daggers, darts, slings, quarterstaffs, light crossbows. No armor or shields.',
  blurb: 'Magic flows through your veins. Lunar Sorcery binds your power to the phases of the moon — shifting bonus spells and embodiment effects as the moon waxes and wanes.',
}

export const ASI_LEVELS = [4, 8, 12, 16, 19]

// ── Ability score methods ─────────────────────────────────────────────────────
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]
export const POINT_BUY_BUDGET = 27
export const POINT_BUY_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha']
export const ABILITY_NAMES = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
}
export const ABILITY_HINTS = {
  str: 'Melee attacks, carrying',
  dex: 'AC, initiative, finesse',
  con: 'Hit points, concentration',
  int: 'Arcana, investigation',
  wis: 'Perception, insight',
  cha: 'Your spellcasting ability ★',
}

export function abilityMod(score) {
  return Math.floor((score - 10) / 2)
}

export function formatMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function pointBuyTotal(scores) {
  return ABILITY_KEYS.reduce((sum, k) => sum + (POINT_BUY_COSTS[scores[k]] ?? 0), 0)
}

// ── Languages ─────────────────────────────────────────────────────────────────
export const ALL_LANGUAGES = [
  'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc',
  'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 'Infernal', 'Primordial', 'Sylvan', 'Undercommon',
]

// ── All 18 skills (ability mapping mirrors annabelle.js SKILLS) ───────────────
export const ALL_SKILLS = [
  { name: 'Acrobatics', ability: 'dex' }, { name: 'Animal Handling', ability: 'wis' },
  { name: 'Arcana', ability: 'int' }, { name: 'Athletics', ability: 'str' },
  { name: 'Deception', ability: 'cha' }, { name: 'History', ability: 'int' },
  { name: 'Insight', ability: 'wis' }, { name: 'Intimidation', ability: 'cha' },
  { name: 'Investigation', ability: 'int' }, { name: 'Medicine', ability: 'wis' },
  { name: 'Nature', ability: 'int' }, { name: 'Perception', ability: 'wis' },
  { name: 'Performance', ability: 'cha' }, { name: 'Persuasion', ability: 'cha' },
  { name: 'Religion', ability: 'int' }, { name: 'Sleight of Hand', ability: 'dex' },
  { name: 'Stealth', ability: 'dex' }, { name: 'Survival', ability: 'wis' },
]

// ── Starting equipment (PHB sorcerer) ─────────────────────────────────────────
export const WEAPON_OPTIONS = [
  { id: 'crossbow', name: 'Light Crossbow & 20 bolts', stat: 'dex', die: '1d8', type: 'piercing', notes: 'Ammunition 80/320, Loading, Two-handed' },
  { id: 'quarterstaff', name: 'Quarterstaff', stat: 'str', die: '1d6', type: 'bludgeoning', notes: 'Versatile (1d8)' },
]
export const FOCUS_OPTIONS = [
  { id: 'arcane-focus', name: 'Arcane Focus', description: 'A crystal, orb, rod, staff, or wand used as a spellcasting focus.' },
  { id: 'component-pouch', name: 'Component Pouch', description: 'A small watertight pouch holding all the material components your spells need.' },
]
export const PACK_OPTIONS = [
  { id: 'dungeoneers', name: "Dungeoneer's Pack", contents: 'Backpack, Crowbar, Hammer, 10 Pitons, 10 Torches, Tinderbox, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
  { id: 'explorers', name: "Explorer's Pack", contents: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Hempen Rope' },
]
// Alternative to the kit: roll 3d4 × 10 gp and buy your own gear.
export const GOLD_ROLL = { dice: 3, sides: 4, multiplier: 10 }

// ── Attack cantrips → auto-filled weapon table rows ───────────────────────────
// kind 'attack' rows get the spell attack bonus; 'save' rows show the save instead.
export const ATTACK_CANTRIPS = {
  'Fire Bolt':      { die: 'd10', type: 'fire',      range: '120 ft', kind: 'attack' },
  'Ray of Frost':   { die: 'd8',  type: 'cold',      range: '60 ft',  kind: 'attack', extra: 'Speed −10 ft' },
  'Chill Touch':    { die: 'd8',  type: 'necrotic',  range: '120 ft', kind: 'attack', extra: 'Target can\'t regain HP' },
  'Shocking Grasp': { die: 'd8',  type: 'lightning', range: 'Touch',  kind: 'attack', extra: 'No reactions until next turn' },
  'Acid Splash':    { die: 'd6',  type: 'acid',      range: '60 ft',  kind: 'save', save: 'DEX' },
  'Poison Spray':   { die: 'd12', type: 'poison',    range: '10 ft',  kind: 'save', save: 'CON' },
}

// Cantrip damage dice count scales at levels 5 / 11 / 17
export function cantripDiceCount(level) {
  return 1 + (level >= 5 ? 1 : 0) + (level >= 11 ? 1 : 0) + (level >= 17 ? 1 : 0)
}

// ── Misc ──────────────────────────────────────────────────────────────────────
export const ACCENT_OPTIONS = [
  { value: 'violet',  label: 'Violet'  },
  { value: 'amber',   label: 'Amber'   },
  { value: 'blue',    label: 'Blue'    },
  { value: 'rose',    label: 'Rose'    },
  { value: 'emerald', label: 'Emerald' },
  { value: 'slate',   label: 'Slate'   },
]

// ids that can never be used for a new character
export const RESERVED_IDS = ['annabelle', 'tonti', 'create']

export function slugify(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Generate a unique character id from a name, avoiding reserved ids and taken ids
export function generateCharacterId(name, takenIds = []) {
  const base = slugify(name) || 'character'
  const taken = new Set([...RESERVED_IDS, ...takenIds])
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}
