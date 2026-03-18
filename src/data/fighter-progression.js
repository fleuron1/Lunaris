// Fighter class progression

export function getProfBonus(level) {
  if (level < 5)  return 2
  if (level < 9)  return 3
  if (level < 13) return 4
  if (level < 17) return 5
  return 6
}

// Fighter d10 hit die: level 1 = 10 + CON, subsequent = 6 + CON per level
export function getMaxHp(level, conMod) {
  return (10 + conMod) + (6 + conMod) * (level - 1)
}

export const HIT_DIE = 'd10'
