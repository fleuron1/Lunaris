// Static character data for Tonti of Darkgate — Echo Knight Fighter 4

export const CHARACTER = {
  name: 'Tonti of Darkgate',
  class: 'Fighter',
  subclass: 'Echo Knight',
  race: 'Tabaxi',
  background: 'Folk Hero',
  level: 4,
  size: 'Small',
}

export const ABILITIES = {
  str: { score: 10, label: 'STR' },
  dex: { score: 18, label: 'DEX' },
  con: { score: 16, label: 'CON' },
  int: { score: 10, label: 'INT' },
  wis: { score: 9,  label: 'WIS' },
  cha: { score: 13, label: 'CHA' },
}

export const SAVE_PROFS = new Set(['str', 'con'])

export const SKILLS = [
  { name: 'Acrobatics',      ability: 'dex', proficient: true  },
  { name: 'Animal Handling', ability: 'wis', proficient: false },
  { name: 'Arcana',          ability: 'int', proficient: false },
  { name: 'Athletics',       ability: 'str', proficient: true  },
  { name: 'Deception',       ability: 'cha', proficient: false },
  { name: 'History',         ability: 'int', proficient: false },
  { name: 'Insight',         ability: 'wis', proficient: false },
  { name: 'Intimidation',    ability: 'cha', proficient: false },
  { name: 'Investigation',   ability: 'int', proficient: false },
  { name: 'Medicine',        ability: 'wis', proficient: false },
  { name: 'Nature',          ability: 'int', proficient: false },
  { name: 'Perception',      ability: 'wis', proficient: true  },
  { name: 'Performance',     ability: 'cha', proficient: false },
  { name: 'Persuasion',      ability: 'cha', proficient: false },
  { name: 'Religion',        ability: 'int', proficient: false },
  { name: 'Sleight of Hand', ability: 'dex', proficient: true  },
  { name: 'Stealth',         ability: 'dex', proficient: true  },
  { name: 'Survival',        ability: 'wis', proficient: true  },
]

export const CLASS_FEATURES = [
  {
    name: 'Second Wind',
    trackKey: 'secondWindUsed',
    restType: 'short',
    cost: 'Bonus Action',
    description: 'Regain 1d10 + 4 HP. Recharges on a Short or Long Rest.',
  },
  {
    name: 'Action Surge',
    trackKey: 'actionSurgeUsed',
    restType: 'short',
    cost: '—',
    description: 'Take one additional action on your turn. Recharges on a Short or Long Rest.',
  },
  {
    name: 'Ambush',
    trackKey: 'ambushUsed',
    restType: 'short',
    cost: '—',
    description: 'Once per rest, add 1d6 to a Stealth check or Initiative roll.',
  },
  {
    name: 'Manifest Echo',
    trackKey: 'manifestEchoActive',
    restType: 'toggle',
    cost: 'Bonus Action',
    description: 'Summon an echo in an unoccupied space within 15 ft (AC 16, 1 HP, immune to all conditions). Mentally move it up to 30 ft/turn. Attacks can originate from its space. Swap places with it (costs 15 ft movement). Reaction: it makes an opportunity attack when a creature moves 5+ ft from it.',
  },
  {
    name: 'Unleash Incarnation',
    trackKey: 'unleashIncarnationUsed',
    restType: 'long',
    restoreType: 'counter',
    maxUses: 3,   // = CON modifier
    cost: 'Attack Action',
    description: 'When you take the Attack action, make one additional melee attack from your echo\'s space. 3 uses (= CON mod). Recharges on a Long Rest.',
  },
]

export const SPECIES_TRAITS = [
  {
    name: 'Feline Agility',
    trackKey: 'felineAgilityUsed',
    tracked: true,
    description: 'Double your Speed for a turn. After using, must spend a turn not moving to recharge.',
  },
  {
    name: 'Darkvision',
    tracked: false,
    description: '60 ft. See in dim light as bright, darkness as dim light.',
  },
  {
    name: "Cat's Claws",
    tracked: false,
    description: 'Unarmed strikes deal 1d4 + DEX slashing. Climbing speed 20 ft.',
  },
  {
    name: 'Rustic Hospitality',
    tracked: false,
    description: 'Common folk will help you if it doesn\'t endanger them.',
  },
]

export const PROFICIENCIES = {
  saves: 'Strength, Constitution',
  armor: 'All armour, shields',
  weapons: 'All weapons',
  tools: 'Cooking utensils, land vehicles',
}
