import { useState, useEffect, useCallback } from 'react'
import { ABILITIES, SPELLS, SKILLS } from '../data/annabelle.js'
import {
  getSpellSlotMax, getMaxHp, getProfBonus, SORCERY_POINTS, maxMetamagic,
} from '../data/sorcerer-progression.js'

const STORAGE_KEY = 'annabelle-sheet-v2'

// Lunar bonus spells are always prepared by the subclass — exclude from managed known spells
const DEFAULT_KNOWN_SPELLS = SPELLS.filter(s => s.level !== 'C' && !s.lunar).map(s => s.name)
const DEFAULT_CANTRIPS = SPELLS.filter(s => s.level === 'C').map(s => s.name)
const DEFAULT_ABILITIES = {
  str: ABILITIES.str.score, dex: ABILITIES.dex.score, con: ABILITIES.con.score,
  int: ABILITIES.int.score, wis: ABILITIES.wis.score, cha: ABILITIES.cha.score,
}

// Build default skillProfs from static SKILLS data
const DEFAULT_SKILL_PROFS = {}
SKILLS.filter(s => s.proficient).forEach(s => { DEFAULT_SKILL_PROFS[s.name] = 'proficient' })

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

function buildDefaults(level = 4, abilities = DEFAULT_ABILITIES) {
  const slotMax = getSpellSlotMax(level)
  const slots = {}
  for (let i = 1; i <= 9; i++) slots[i] = { total: slotMax[i], expended: 0 }
  const conMod = Math.floor((abilities.con - 10) / 2)
  return {
    // Combat tracking
    currentHp: getMaxHp(level, conMod),
    tempHp: 0,
    hitDiceSpent: 0,
    deathSaves: { successes: 0, failures: 0 },
    spellSlots: slots,
    sorceryPoints: SORCERY_POINTS[level - 1],
    heroicInspiration: false,
    lunarPhase: 'full',
    concentration: null,
    // Character advancement
    level,
    xp: 0,
    abilityScores: { ...abilities },
    knownSpells: [...DEFAULT_KNOWN_SPELLS],
    knownCantrips: [...DEFAULT_CANTRIPS],
    chosenMetamagic: [],
    feats: [],
    // Character info (editable)
    characterName: 'Annabelle',
    background: 'Haunted One',
    notes: '',
    ac: 11,
    speed: 30,
    // Skill proficiencies: { 'Deception': 'proficient' | 'expert' }
    skillProfs: { ...DEFAULT_SKILL_PROFS },
    // Weapons & gear
    weapons: [
      { id: 'dagger', name: 'Dagger', atkBonus: '+2', damage: '1d4-1 piercing', notes: 'Finesse, Light, Thrown 20/60' },
      { id: 'firebolt', name: 'Fire Bolt', atkBonus: '+6', damage: '1d10 fire', notes: 'Cantrip | 120 ft range' },
      { id: 'chromatic', name: 'Chromatic Orb', atkBonus: '+6', damage: '3d8 (type)', notes: 'Lvl 1 | 90 ft | 50gp diamond' },
    ],
    equipment: [
      { id: 'pack', name: "Explorer's Pack", description: 'Backpack, Bedroll, Mess Kit, Tinderbox, 10 Torches, 10 days Rations, Waterskin, 50 ft Rope', isMagic: false },
      { id: 'daggers2', name: 'Dagger x2', description: '', isMagic: false },
      { id: 'focus', name: 'Arcane Focus', description: '', isMagic: false },
      { id: 'gold', name: '10 GP', description: '', isMagic: false },
    ],
    languages: ['Common', 'Elvish', 'Draconic', 'Thieves Cant', 'Undercommon'],
  }
}

const LUNAR_SPELL_NAMES = new Set(
  ['Cure Wounds', 'Silent Image', 'Shield', 'Moonbeam', 'Invisibility', 'Lesser Restoration']
)

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildDefaults()
    const saved = JSON.parse(raw)
    const merged = { ...buildDefaults(saved.level || 4, saved.abilityScores || DEFAULT_ABILITIES), ...saved }
    // Strip any lunar bonus spells that ended up in the managed known spells list
    merged.knownSpells = (merged.knownSpells || []).filter(n => !LUNAR_SPELL_NAMES.has(n))
    return merged
  } catch {
    return buildDefaults()
  }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

export function useCharacterState() {
  const [state, setState] = useState(loadState)
  useEffect(() => { saveState(state) }, [state])

  const update = useCallback((patch) => setState(prev => ({ ...prev, ...patch })), [])

  // ── HP ──────────────────────────────────────────────────
  function adjustHp(delta) {
    setState(prev => {
      const conMod = Math.floor((prev.abilityScores.con - 10) / 2)
      const maxHp = getMaxHp(prev.level, conMod)
      const hp = Math.max(0, Math.min(maxHp, prev.currentHp + delta))
      const next = { ...prev, currentHp: hp }
      if (delta > 0 && prev.currentHp === 0) next.deathSaves = { successes: 0, failures: 0 }
      return next
    })
  }
  function setTempHp(val) { update({ tempHp: Math.max(0, val) }) }

  function toggleDeathSave(type, index) {
    setState(prev => {
      const ds = { ...prev.deathSaves }
      ds[type] = ds[type] === index + 1 ? index : index + 1
      return { ...prev, deathSaves: ds }
    })
  }
  function resetDeathSaves() { update({ deathSaves: { successes: 0, failures: 0 } }) }

  // ── Spell Slots ─────────────────────────────────────────
  function toggleSpellSlot(level, pipIndex) {
    setState(prev => {
      const slots = { ...prev.spellSlots }
      const slot = { ...slots[level] }
      slot.expended = pipIndex < slot.expended ? pipIndex : pipIndex + 1
      slot.expended = Math.min(slot.total, Math.max(0, slot.expended))
      slots[level] = slot
      return { ...prev, spellSlots: slots }
    })
  }

  // ── Sorcery Points ──────────────────────────────────────
  function adjustSorceryPoints(delta) {
    setState(prev => ({
      ...prev,
      sorceryPoints: Math.max(0, Math.min(SORCERY_POINTS[prev.level - 1], prev.sorceryPoints + delta)),
    }))
  }

  // ── Misc ────────────────────────────────────────────────
  function setLunarPhase(phase) { update({ lunarPhase: phase }) }
  function toggleInspiration() { update({ heroicInspiration: !state.heroicInspiration }) }
  function setConcentration(name) { update({ concentration: state.concentration === name ? null : name }) }

  function adjustHitDice(delta) {
    setState(prev => ({
      ...prev,
      hitDiceSpent: Math.max(0, Math.min(prev.level, prev.hitDiceSpent + delta)),
    }))
  }

  function castSpell(level) {
    if (!level || level === 'C') return
    setState(prev => {
      const slots = { ...prev.spellSlots }
      const slot = { ...slots[level] }
      if (!slot || slot.expended >= slot.total) return prev
      slots[level] = { ...slot, expended: slot.expended + 1 }
      return { ...prev, spellSlots: slots }
    })
  }

  function shortRest() {}

  function longRest() {
    setState(prev => {
      const slotMax = getSpellSlotMax(prev.level)
      const slots = {}
      for (let i = 1; i <= 9; i++) slots[i] = { total: slotMax[i], expended: 0 }
      const conMod = Math.floor((prev.abilityScores.con - 10) / 2)
      return {
        ...prev,
        currentHp: getMaxHp(prev.level, conMod),
        tempHp: 0, hitDiceSpent: 0,
        deathSaves: { successes: 0, failures: 0 },
        spellSlots: slots,
        sorceryPoints: SORCERY_POINTS[prev.level - 1],
        heroicInspiration: false, concentration: null,
      }
    })
  }

  // ── Level & Advancement ─────────────────────────────────
  function setLevel(newLevel) {
    setState(prev => {
      const slotMax = getSpellSlotMax(newLevel)
      const slots = {}
      for (let i = 1; i <= 9; i++) {
        slots[i] = { total: slotMax[i], expended: Math.min(prev.spellSlots[i]?.expended || 0, slotMax[i]) }
      }
      const conMod = Math.floor((prev.abilityScores.con - 10) / 2)
      const newMaxHp = getMaxHp(newLevel, conMod)
      const oldMaxHp = getMaxHp(prev.level, conMod)
      return {
        ...prev,
        level: newLevel,
        spellSlots: slots,
        sorceryPoints: Math.min(SORCERY_POINTS[prev.level - 1], SORCERY_POINTS[newLevel - 1]),
        currentHp: Math.min(prev.currentHp + (newMaxHp - oldMaxHp), newMaxHp),
      }
    })
  }

  function setAbilityScore(ability, score) {
    setState(prev => {
      const as = { ...prev.abilityScores, [ability]: Math.max(1, Math.min(30, score)) }
      const conMod = Math.floor((as.con - 10) / 2)
      const newMaxHp = getMaxHp(prev.level, conMod)
      return { ...prev, abilityScores: as, currentHp: Math.min(prev.currentHp, newMaxHp) }
    })
  }

  function toggleKnownSpell(spellName, isCantrip) {
    setState(prev => {
      const field = isCantrip ? 'knownCantrips' : 'knownSpells'
      const list = prev[field]
      const next = list.includes(spellName) ? list.filter(n => n !== spellName) : [...list, spellName]
      return { ...prev, [field]: next }
    })
  }

  function resetSpells() {
    update({ knownSpells: [...DEFAULT_KNOWN_SPELLS], knownCantrips: [...DEFAULT_CANTRIPS] })
  }

  function toggleMetamagic(name) {
    setState(prev => {
      const max = maxMetamagic(prev.level)
      if (prev.chosenMetamagic.includes(name)) {
        return { ...prev, chosenMetamagic: prev.chosenMetamagic.filter(n => n !== name) }
      }
      if (prev.chosenMetamagic.length >= max) return prev
      return { ...prev, chosenMetamagic: [...prev.chosenMetamagic, name] }
    })
  }

  function setXp(xp) { update({ xp: Math.max(0, xp) }) }

  // ── Feats ────────────────────────────────────────────────
  function toggleFeat(name) {
    setState(prev => ({
      ...prev,
      feats: prev.feats.includes(name) ? prev.feats.filter(n => n !== name) : [...prev.feats, name],
    }))
  }

  // ── Weapons ─────────────────────────────────────────────
  function addWeapon(data) {
    setState(prev => ({ ...prev, weapons: [...prev.weapons, { id: uid(), ...data }] }))
  }
  function updateWeapon(id, data) {
    setState(prev => ({ ...prev, weapons: prev.weapons.map(w => w.id === id ? { ...w, ...data } : w) }))
  }
  function removeWeapon(id) {
    setState(prev => ({ ...prev, weapons: prev.weapons.filter(w => w.id !== id) }))
  }

  // ── Equipment ────────────────────────────────────────────
  function addEquipment(data) {
    setState(prev => ({ ...prev, equipment: [...prev.equipment, { id: uid(), ...data }] }))
  }
  function updateEquipment(id, data) {
    setState(prev => ({ ...prev, equipment: prev.equipment.map(e => e.id === id ? { ...e, ...data } : e) }))
  }
  function removeEquipment(id) {
    setState(prev => ({ ...prev, equipment: prev.equipment.filter(e => e.id !== id) }))
  }

  // ── Skills ───────────────────────────────────────────────
  function setSkillProf(skillName, level) {
    setState(prev => ({ ...prev, skillProfs: { ...prev.skillProfs, [skillName]: level } }))
  }

  // ── Languages ────────────────────────────────────────────
  function addLanguage(lang) {
    if (!lang?.trim()) return
    setState(prev => {
      if (prev.languages.includes(lang.trim())) return prev
      return { ...prev, languages: [...prev.languages, lang.trim()] }
    })
  }
  function removeLanguage(lang) {
    setState(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }))
  }

  // ── Character Info ────────────────────────────────────────
  function setAc(n) { update({ ac: Math.max(0, Math.min(30, Number(n) || 0)) }) }
  function setSpeed(n) { update({ speed: Math.max(0, Number(n) || 0) }) }
  function setCharacterName(n) { update({ characterName: n }) }
  function setBackground(n) { update({ background: n }) }
  function setNotes(n) { update({ notes: n }) }

  // ── Derived values ────────────────────────────────────────
  const conMod = Math.floor((state.abilityScores.con - 10) / 2)
  const chaMod = Math.floor((state.abilityScores.cha - 10) / 2)
  const profBonus = getProfBonus(state.level)

  return {
    ...state,
    // Combat actions
    adjustHp, setTempHp, toggleDeathSave, resetDeathSaves,
    toggleSpellSlot, castSpell, adjustSorceryPoints,
    setLunarPhase, toggleInspiration,
    setConcentration, adjustHitDice,
    shortRest, longRest,
    // Advancement
    setLevel, setAbilityScore, toggleKnownSpell, resetSpells, toggleMetamagic, setXp,
    toggleFeat,
    // Weapons & gear
    addWeapon, updateWeapon, removeWeapon,
    addEquipment, updateEquipment, removeEquipment,
    // Skills & languages
    setSkillProf, addLanguage, removeLanguage,
    // Character info
    setAc, setSpeed, setCharacterName, setBackground, setNotes,
    // Derived
    maxHp: getMaxHp(state.level, conMod),
    profBonus,
    spellSlotMax: getSpellSlotMax(state.level),
    maxSorceryPoints: SORCERY_POINTS[state.level - 1],
    maxMetamagic: maxMetamagic(state.level),
    spellSaveDC: 8 + profBonus + chaMod,
    spellAttackBonus: profBonus + chaMod,
  }
}
