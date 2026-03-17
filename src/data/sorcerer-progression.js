// Sorcerer class progression table (PHB)

// Spell slots per level [lvl1, lvl2, ..., lvl9]
export const SPELL_SLOTS_TABLE = {
  1:  [2,0,0,0,0,0,0,0,0],
  2:  [3,0,0,0,0,0,0,0,0],
  3:  [4,2,0,0,0,0,0,0,0],
  4:  [4,3,0,0,0,0,0,0,0],
  5:  [4,3,2,0,0,0,0,0,0],
  6:  [4,3,3,0,0,0,0,0,0],
  7:  [4,3,3,1,0,0,0,0,0],
  8:  [4,3,3,2,0,0,0,0,0],
  9:  [4,3,3,3,1,0,0,0,0],
  10: [4,3,3,3,2,0,0,0,0],
  11: [4,3,3,3,2,1,0,0,0],
  12: [4,3,3,3,2,1,0,0,0],
  13: [4,3,3,3,2,1,1,0,0],
  14: [4,3,3,3,2,1,1,0,0],
  15: [4,3,3,3,2,1,1,1,0],
  16: [4,3,3,3,2,1,1,1,0],
  17: [4,3,3,3,2,1,1,1,1],
  18: [4,3,3,3,3,1,1,1,1],
  19: [4,3,3,3,3,2,1,1,1],
  20: [4,3,3,3,3,2,2,1,1],
}

export const CANTRIPS_KNOWN = [4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6]
export const SPELLS_KNOWN   = [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15]
export const SORCERY_POINTS = [0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]

export const PROF_BONUS = [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6]

export const XP_THRESHOLDS = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000]

// Features unlocked per level (PHB Lunar Sorcery)
export const LEVEL_FEATURES = {
  1:  ['Spellcasting', 'Sorcerous Origin: Lunar Sorcery', 'Lunar Embodiment'],
  2:  ['Font of Magic', 'Sorcery Points (2)'],
  3:  ['Metamagic (choose 2)'],
  4:  ['Ability Score Improvement', 'Sorcerous Versatility'],
  5:  ['Magical Guidance'],
  6:  ['Lunar Boons', 'Waxing and Waning'],
  7:  [],
  8:  ['Ability Score Improvement'],
  9:  [],
  10: ['Metamagic (choose 1 more)'],
  11: [],
  12: ['Ability Score Improvement'],
  13: [],
  14: ['Lunar Empowerment'],
  15: [],
  16: ['Ability Score Improvement'],
  17: ['Metamagic (choose 1 more)'],
  18: ['Lunar Phenomenon'],
  19: ['Ability Score Improvement'],
  20: ['Sorcerous Restoration'],
}

// Max metamagic choices per level
export function maxMetamagic(level) {
  if (level < 3)  return 0
  if (level < 10) return 2
  if (level < 17) return 3
  return 4
}

export function getSpellSlotMax(level) {
  const slots = SPELL_SLOTS_TABLE[level] || SPELL_SLOTS_TABLE[1]
  const result = {}
  for (let i = 1; i <= 9; i++) {
    result[i] = slots[i - 1]
  }
  return result
}

export function getMaxHp(level, conMod) {
  // Level 1: max hit die (6) + CON; subsequent levels: average (4) + CON
  return 6 + conMod + (level - 1) * (4 + conMod)
}

export function getProfBonus(level) {
  return PROF_BONUS[level - 1] || 2
}
