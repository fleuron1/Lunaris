import { useState, useEffect, useCallback, useRef } from 'react'
import { ABILITIES, SPELLS, SKILLS } from '../data/annabelle.js'
import { getProfBonus, SORCERY_POINTS, maxMetamagic } from '../data/sorcerer-progression.js'
import {
  getClass, classMaxHp, classSlotMax, getClassResources,
  isLunarSorcerer, subclassDisplayName, getSubclassFeatures, getSubclasses,
  getFightingStyleInfo, getFightingStyle,
} from '../data/classes.js'
import { loadFromCloud, saveToCloud } from '../lib/supabase.js'

const LEGACY_KEY = 'annabelle-sheet-v2' // migration: old single-character key

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

function buildDefaults(level = 4, abilities = DEFAULT_ABILITIES, classId = 'sorcerer') {
  const slotMax = classSlotMax(classId, level)
  const slots = {}
  for (let i = 1; i <= 9; i++) slots[i] = { total: slotMax[i], expended: 0 }
  const conMod = Math.floor((abilities.con - 10) / 2)
  return {
    // Combat tracking
    currentHp: classMaxHp(classId, level, conMod),
    tempHp: 0,
    hitDiceSpent: 0,
    deathSaves: { successes: 0, failures: 0 },
    spellSlots: slots,
    // Class resources (Rage/Ki/Lay on Hands/…) — keyed by resource id, value =
    // current amount. Undefined means "full" (computed max), so level-ups and
    // new characters start topped up without needing to seed every id here.
    resources: {},
    sorceryPoints: classId === 'sorcerer' ? SORCERY_POINTS[level - 1] : 0,
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
    // Identity (species fields are null/Annabelle defaults for legacy saves;
    // SheetPage falls back to the static Warforged data when speciesTraits is null)
    species: 'Warforged',
    size: 'Med',
    characterClass: classId,
    subclass: getClass(classId).subclassShort,
    fightingStyle: null,
    speciesTraits: null,
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
    currency: { cp: 0, sp: 0, gp: 10, pp: 0 },
  }
}

const LUNAR_SPELL_NAMES = new Set(
  ['Cure Wounds', 'Silent Image', 'Shield', 'Moonbeam', 'Invisibility', 'Lesser Restoration']
)

function storageKey(characterId) {
  return `character-${characterId}-v2`
}

function loadState(characterId) {
  try {
    const key = storageKey(characterId)
    let raw = localStorage.getItem(key)
    // One-time migration: copy old annabelle-sheet-v2 → character-annabelle-v2
    if (!raw && characterId === 'annabelle') {
      raw = localStorage.getItem(LEGACY_KEY)
      if (raw) localStorage.setItem(key, raw)
    }
    if (!raw) return buildDefaults()
    const saved = JSON.parse(raw)
    const merged = {
      ...buildDefaults(saved.level || 4, saved.abilityScores || DEFAULT_ABILITIES, saved.characterClass || 'sorcerer'),
      ...saved,
    }
    // Lunar bonus spells are always prepared by the Lunar Sorcery subclass — only
    // strip them for an actual Lunar sorcerer (a Draconic sorcerer or a cleric
    // may legitimately know Cure Wounds etc.).
    if (isLunarSorcerer(merged.characterClass || 'sorcerer', merged.subclass)) {
      merged.knownSpells = (merged.knownSpells || []).filter(n => !LUNAR_SPELL_NAMES.has(n))
    }
    return merged
  } catch {
    return buildDefaults()
  }
}

function saveState(characterId, state) {
  try { localStorage.setItem(storageKey(characterId), JSON.stringify(state)) } catch {}
}

// ── Character creation (used by the /create wizard) ───────────────────────────
// Builds a COMPLETE state object for a brand-new character. Every identity field
// must be overridden here — anything missed would fall back to Annabelle's data.
export function createCharacterState({
  characterName, background = '', notes = '',
  species = 'Unknown', size = 'Med', speed = 30, speciesTraits = [],
  characterClass = 'sorcerer', subclass = null, fightingStyle = null,
  level = 1, abilityScores, ac,
  skillProfs = {}, languages = ['Common'], feats = [],
  knownCantrips = [], knownSpells = [], chosenMetamagic = [],
  weapons = [], equipment = [], currency = { cp: 0, sp: 0, gp: 0, pp: 0 },
  xp = 0,
}) {
  const base = buildDefaults(level, abilityScores, characterClass)
  const dexMod = Math.floor(((abilityScores?.dex ?? 10) - 10) / 2)
  return {
    ...base,
    characterName: characterName || 'Unnamed Hero',
    background,
    notes,
    species,
    size,
    speed,
    speciesTraits,
    characterClass,
    // chosen subclass short name (e.g. 'Devotion', 'Champion', 'Lunar') or null
    subclass: subclass ?? getClass(characterClass).subclassShort,
    fightingStyle: fightingStyle ?? null,
    ac: ac ?? 10 + dexMod,
    xp,
    skillProfs,
    languages,
    knownCantrips: [...knownCantrips],
    knownSpells: [...knownSpells],
    chosenMetamagic: [...chosenMetamagic],
    weapons: weapons.map(w => ({ id: w.id || uid(), ...w })),
    equipment: equipment.map(e => ({ id: e.id || uid(), ...e })),
    currency: { ...currency },
    feats: [...feats],
  }
}

// Write a freshly created character to localStorage AND push it to the cloud
// immediately — the sheet's mount-time pull treats cloud as the winner, so a
// stale cloud row (e.g. from a deleted character with the same id) must not
// survive past creation. saveToCloud fails silently when offline.
export function persistNewCharacter(characterId, state) {
  saveState(characterId, state)
  saveToCloud(characterId, state)
}

export function useCharacterState(characterId = 'annabelle') {
  const [state, setState] = useState(() => loadState(characterId))
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const saveTimerRef = useRef(null)

  // On mount: pull latest from cloud and merge (cloud wins over localStorage)
  useEffect(() => {
    loadFromCloud(characterId).then(cloudData => {
      if (!cloudData) return
      setState(prev => {
        const merged = { ...prev, ...cloudData }
        if (isLunarSorcerer(merged.characterClass || 'sorcerer', merged.subclass)) {
          merged.knownSpells = (merged.knownSpells || []).filter(n => !LUNAR_SPELL_NAMES.has(n))
        }
        saveState(characterId, merged)
        return merged
      })
    })
  }, [characterId])

  // Save to localStorage immediately; debounce cloud save by 1.5s
  useEffect(() => {
    saveState(characterId, state)
    setSyncStatus('saving')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveToCloud(characterId, state).then(() => {
        setSyncStatus('saved')
        setTimeout(() => setSyncStatus('idle'), 2000)
      }).catch(() => setSyncStatus('error'))
    }, 1500)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [state])

  const update = useCallback((patch) => setState(prev => ({ ...prev, ...patch })), [])

  // ── HP ──────────────────────────────────────────────────
  function adjustHp(delta) {
    setState(prev => {
      const conMod = Math.floor((prev.abilityScores.con - 10) / 2)
      const maxHp = classMaxHp(prev.characterClass, prev.level, conMod)
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

  // ── Class Resources (Rage / Ki / Lay on Hands / …) ──────
  function adjustClassResource(id, delta) {
    setState(prev => {
      const def = getClassResources(prev.characterClass, prev.level, prev.abilityScores).find(d => d.id === id)
      if (!def || def.kind === 'static') return prev
      const cur = prev.resources?.[id] ?? def.max
      const next = Math.max(0, Math.min(def.max, cur + delta))
      return { ...prev, resources: { ...prev.resources, [id]: next } }
    })
  }
  function setClassResource(id, value) {
    setState(prev => {
      const def = getClassResources(prev.characterClass, prev.level, prev.abilityScores).find(d => d.id === id)
      if (!def || def.kind === 'static') return prev
      const next = Math.max(0, Math.min(def.max, Number(value) || 0))
      return { ...prev, resources: { ...prev.resources, [id]: next } }
    })
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

  function rollHitDie() {
    const { hitDiceSpent, level, abilityScores, currentHp, characterClass } = state
    if (hitDiceSpent >= level) return null
    const conMod  = Math.floor((abilityScores.con - 10) / 2)
    const maxHp   = classMaxHp(characterClass, level, conMod)
    const hitDie  = getClass(characterClass).hitDie
    const die     = Math.floor(Math.random() * hitDie) + 1
    const heal    = Math.max(1, die + conMod)
    const total   = Math.min(maxHp - currentHp, heal)
    setState(prev => ({
      ...prev,
      hitDiceSpent: prev.hitDiceSpent + 1,
      currentHp:    Math.min(maxHp, prev.currentHp + heal),
    }))
    return { die, conMod, total }
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

  // Short rest: recharge pact magic (warlock) slots + short-rest class resources
  function shortRest() {
    setState(prev => {
      let next = { ...prev }
      if (getClass(prev.characterClass).casterType === 'pact') {
        const slotMax = classSlotMax(prev.characterClass, prev.level)
        const slots = {}
        for (let i = 1; i <= 9; i++) slots[i] = { total: slotMax[i], expended: 0 }
        next.spellSlots = slots
      }
      const defs = getClassResources(prev.characterClass, prev.level, prev.abilityScores)
      if (defs.some(d => d.recharge === 'short' && d.kind !== 'static')) {
        const resources = { ...prev.resources }
        for (const d of defs) if (d.recharge === 'short' && d.kind !== 'static') resources[d.id] = d.max
        next.resources = resources
      }
      return next
    })
  }

  function longRest() {
    setState(prev => {
      const slotMax = classSlotMax(prev.characterClass, prev.level)
      const slots = {}
      for (let i = 1; i <= 9; i++) slots[i] = { total: slotMax[i], expended: 0 }
      const conMod = Math.floor((prev.abilityScores.con - 10) / 2)
      // Long rest refills every class resource (short- and long-recharge) to max
      const resources = {}
      for (const d of getClassResources(prev.characterClass, prev.level, prev.abilityScores)) {
        if (d.kind !== 'static') resources[d.id] = d.max
      }
      return {
        ...prev,
        currentHp: classMaxHp(prev.characterClass, prev.level, conMod),
        tempHp: 0, hitDiceSpent: 0,
        deathSaves: { successes: 0, failures: 0 },
        spellSlots: slots,
        sorceryPoints: prev.characterClass === 'sorcerer' ? SORCERY_POINTS[prev.level - 1] : 0,
        heroicInspiration: false, concentration: null,
        resources,
      }
    })
  }

  // ── Level & Advancement ─────────────────────────────────
  function setLevel(newLevel) {
    setState(prev => {
      const slotMax = classSlotMax(prev.characterClass, newLevel)
      const slots = {}
      for (let i = 1; i <= 9; i++) {
        slots[i] = { total: slotMax[i], expended: Math.min(prev.spellSlots[i]?.expended || 0, slotMax[i]) }
      }
      const conMod = Math.floor((prev.abilityScores.con - 10) / 2)
      const newMaxHp = classMaxHp(prev.characterClass, newLevel, conMod)
      const oldMaxHp = classMaxHp(prev.characterClass, prev.level, conMod)
      const maxSp = prev.characterClass === 'sorcerer' ? SORCERY_POINTS[newLevel - 1] : 0
      return {
        ...prev,
        level: newLevel,
        spellSlots: slots,
        // Keep however many points are currently unspent, capped at the new max.
        sorceryPoints: Math.min(prev.sorceryPoints ?? maxSp, maxSp),
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
  function setSubclass(shortName) {
    setState(prev => {
      const next = { ...prev, subclass: shortName || null }
      // Switching a sorcerer onto/off the Lunar path changes which bonus spells
      // are auto-granted; re-apply the lunar strip so known spells stay correct.
      if (isLunarSorcerer(next.characterClass, next.subclass)) {
        next.knownSpells = (next.knownSpells || []).filter(n => !LUNAR_SPELL_NAMES.has(n))
      }
      return next
    })
  }
  function setFightingStyle(name) { update({ fightingStyle: name || null }) }
  function setAc(n) { update({ ac: Math.max(0, Math.min(30, Number(n) || 0)) }) }
  function setSpeed(n) { update({ speed: Math.max(0, Number(n) || 0) }) }
  function setCharacterName(n) { update({ characterName: n }) }
  function setBackground(n) { update({ background: n }) }
  function setNotes(n) { update({ notes: n }) }
  function setCurrency(type, value) {
    setState(prev => ({ ...prev, currency: { ...prev.currency, [type]: value } }))
  }

  // ── Derived values ────────────────────────────────────────
  const cfg = getClass(state.characterClass)
  const conMod = Math.floor((state.abilityScores.con - 10) / 2)
  const castMod = Math.floor(((state.abilityScores[cfg.spellAbility] ?? 10) - 10) / 2)
  const profBonus = getProfBonus(state.level)

  return {
    ...state,
    // Combat actions
    adjustHp, setTempHp, toggleDeathSave, resetDeathSaves,
    toggleSpellSlot, castSpell, adjustSorceryPoints,
    setLunarPhase, toggleInspiration,
    setConcentration, adjustHitDice, rollHitDie,
    adjustClassResource, setClassResource,
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
    setAc, setSpeed, setCharacterName, setBackground, setNotes, setCurrency,
    setSubclass, setFightingStyle,
    // Sync
    syncStatus,
    // Derived
    maxHp: classMaxHp(state.characterClass, state.level, conMod),
    profBonus,
    spellSlotMax: classSlotMax(state.characterClass, state.level),
    maxSorceryPoints: state.characterClass === 'sorcerer' ? SORCERY_POINTS[state.level - 1] : 0,
    maxMetamagic: state.characterClass === 'sorcerer' ? maxMetamagic(state.level) : 0,
    spellSaveDC: 8 + profBonus + castMod,
    spellAttackBonus: profBonus + castMod,
    hitDiceType: cfg.hitDie,
    spellcastingAbility: cfg.spellAbility,
    classInfo: cfg,
    classResourceDefs: getClassResources(state.characterClass, state.level, state.abilityScores),
    // Subclass (derived from the stored `subclass` short name)
    subclassName: subclassDisplayName(state.characterClass, state.subclass),
    subclassTitle: getSubclasses(state.characterClass).title,
    subclassFeatures: getSubclassFeatures(state.characterClass, state.subclass, state.level),
    isLunar: isLunarSorcerer(state.characterClass, state.subclass),
    // Fighting style (the unlock level gates whether the picker shows)
    fightingStyleInfo: getFightingStyleInfo(state.characterClass),
    fightingStyleDef: getFightingStyle(state.characterClass, state.fightingStyle),
  }
}
