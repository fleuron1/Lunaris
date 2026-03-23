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
  { level: 'C', name: 'Fire Bolt',          castTime: '1 Action',       range: '120 ft', conc: false, ritual: false, mat: false, notes: '+6 to hit | 1d10 fire',                               rollBase: '1d10',
    description: 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn\'t being worn or carried.' },
  { level: 'C', name: 'Prestidigitation',   castTime: '1 Action',       range: '10 ft',  conc: false, ritual: false, mat: false, notes: 'Utility cantrip' },
  { level: 'C', name: 'Mage Hand',          castTime: '1 Action',       range: '30 ft',  conc: false, ritual: false, mat: false, notes: 'Utility cantrip' },
  { level: 'C', name: 'Minor Illusion',     castTime: '1 Action',       range: '30 ft',  conc: false, ritual: false, mat: false, notes: 'Sound or image illusion' },
  { level: 1,   name: 'Cure Wounds',        castTime: '1 Action',       range: 'Touch',  conc: false, ritual: false, mat: false, lunar: 'full',     notes: 'Lunar bonus | 1d8+4 HP',                              upcast: 'When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.',     rollBase: '1d8+4', upcastDie: '1d8',
    description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.' },
  { level: 1,   name: 'Silent Image',       castTime: '1 Action',       range: '60 ft',  conc: true,  ritual: false, mat: false, lunar: 'new',      notes: 'Lunar bonus | Illusion 15 ft cube',
    description: 'You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot cube. The image appears at a spot within range and lasts for the duration. The image is purely visual; it isn\'t accompanied by sound, smell, or other sensory effects.\n\nIf a creature uses its action to examine the image, the creature can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image.' },
  { level: 1,   name: 'Shield',             castTime: '1 Reaction',     range: 'Self',   conc: false, ritual: false, mat: false, lunar: 'crescent', notes: 'Lunar bonus | +5 AC until next turn',
    description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.' },
  { level: 1,   name: 'Chromatic Orb',      castTime: '1 Action',       range: '90 ft',  conc: false, ritual: false, mat: true,  notes: '+6 to hit | 3d8 (choose type) | 50gp diamond',        upcast: 'When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.',           rollBase: '3d8',   upcastDie: '1d8',
    description: 'You hurl a 4-inch-diameter sphere of energy at a creature that you can see within range. You choose acid, cold, fire, lightning, poison, or thunder for the type of orb you create, and then make a ranged spell attack against the target. If the attack hits, the creature takes 3d8 damage of the type you chose.\n\nIf you roll the highest number possible on any of the damage dice, you can roll that die again and add the result (you only roll it one additional time).' },
  { level: 1,   name: 'Sleep',              castTime: '1 Action',       range: '90 ft',  conc: false, ritual: false, mat: false, notes: '5d8 HP of creatures fall asleep',                      upcast: 'When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st.',                  rollBase: '5d8',   upcastDie: '2d8',
    description: 'This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current hit points (ignoring unconscious creatures).\n\nStarting with the creature that has the lowest current hit points, each creature affected by this spell falls unconscious until the spell ends, the sleeper takes damage, or someone uses an action to shake or slap the sleeper awake. Subtract each creature\'s hit points from the total before moving on to the creature with the next lowest hit points. A creature\'s hit points must be equal to or less than the remaining total for that creature to be affected. Undead and creatures immune to being charmed aren\'t affected by this spell.' },
  { level: 1,   name: 'Mage Armor',         castTime: '1 Action',       range: 'Touch',  conc: false, ritual: false, mat: true,  notes: 'AC = 13 + DEX | 8 hrs | piece of leather',
    description: 'You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it until the spell ends. The target\'s base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.' },
  { level: 2,   name: 'Moonbeam',           castTime: '1 Action',       range: '120 ft', conc: true,  ritual: false, mat: false, lunar: 'full',     notes: 'Lunar bonus | 2d10 radiant/turn | CON save',          upcast: 'When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d10 for each slot level above 2nd.',       rollBase: '2d10',  upcastDie: '1d10',
    description: 'A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high cylinder centered on a point within range. Until the spell ends, dim light fills the cylinder.\n\nWhen a creature enters the spell\'s area for the first time on a turn or starts its turn there, it is engulfed in ghostly flames that cause searing pain, and it must make a Constitution saving throw. It takes 2d10 radiant damage on a failed save, or half as much damage on a successful one. A shapechanger makes its saving throw with disadvantage. If it fails, it also instantly reverts to its original form and can\'t assume a different form until it leaves the spell\'s light.\n\nOn each of your turns after you cast this spell, you can use an action to move the beam up to 60 feet in any direction.' },
  { level: 2,   name: 'Invisibility',       castTime: '1 Action',       range: 'Touch',  conc: true,  ritual: false, mat: true,  lunar: 'new',      notes: 'Lunar bonus | 1 hr | eyelash + gum arabic',           upcast: 'When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd.',
    description: 'A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target\'s person. The spell ends for a target that attacks or casts a spell.' },
  { level: 2,   name: 'Lesser Restoration', castTime: '1 Action',       range: 'Touch',  conc: false, ritual: false, mat: false, lunar: 'crescent', notes: 'Lunar bonus | Remove condition or disease',
    description: 'You touch a creature and can end either one disease or one condition afflicting it. The condition can be blinded, deafened, paralyzed, or poisoned.' },
  { level: 2,   name: 'Scorching Ray',      castTime: '1 Action',       range: '120 ft', conc: false, ritual: false, mat: false, notes: '3 rays | +6 to hit | 2d6 fire each',                   upcast: 'When you cast this spell using a spell slot of 3rd level or higher, you create one additional ray for each slot level above 2nd.',              rollBase: '6d6',   upcastDie: '2d6',
    description: 'You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several.\n\nMake a ranged spell attack for each ray. On a hit, the target takes 2d6 fire damage.' },
  { level: 2,   name: 'Misty Step',         castTime: '1 Bonus Action', range: 'Self',   conc: false, ritual: false, mat: false, notes: 'Teleport up to 30 ft',
    description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.' },
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
