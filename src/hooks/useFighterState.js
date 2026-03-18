import { useState, useEffect, useRef } from 'react'
import { ABILITIES, SKILLS, SAVE_PROFS } from '../data/tonti.js'
import { getMaxHp, getProfBonus } from '../data/fighter-progression.js'
import { loadFromCloud, saveToCloud } from '../lib/supabase.js'

const LEGACY_FIGHTER_KEY = null // no migration needed for new character

function storageKey(characterId) {
  return `character-${characterId}-v2`
}

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

const DEFAULT_ABILITIES = {
  str: ABILITIES.str.score, dex: ABILITIES.dex.score, con: ABILITIES.con.score,
  int: ABILITIES.int.score, wis: ABILITIES.wis.score, cha: ABILITIES.cha.score,
}

const DEFAULT_SKILL_PROFS = {}
SKILLS.filter(s => s.proficient).forEach(s => { DEFAULT_SKILL_PROFS[s.name] = 'proficient' })

function buildDefaults(level = 4, abilities = DEFAULT_ABILITIES) {
  const conMod = Math.floor((abilities.con - 10) / 2)
  return {
    level,
    xp: 0,
    abilityScores: { ...abilities },
    // Sheet value: 44. Formula gives 40, so trust the sheet value
    currentHp: level === 4 && abilities.con === 16 ? 44 : getMaxHp(level, conMod),
    tempHp: 0,
    hitDiceSpent: 0,
    deathSaves: { successes: 0, failures: 0 },
    ac: 17,
    speed: 30,
    heroicInspiration: false,
    // Fighter resource tracking
    secondWindUsed: false,
    actionSurgeUsed: false,
    ambushUsed: false,
    manifestEchoActive: false,
    unleashIncarnationUsed: 0,  // 0–conMod (3 at CON 16)
    felineAgilityUsed: false,
    // Character info
    characterName: 'Tonti of Darkgate',
    background: 'Folk Hero',
    notes: '',
    skillProfs: { ...DEFAULT_SKILL_PROFS },
    languages: ['Eskudan', 'Common'],
    weapons: [
      { id: 'scimitar',   name: 'Scimitar',          atkBonus: '+6', damage: '1d6+4 slashing',  notes: 'Finesse, Light' },
      { id: 'crossbow',   name: 'Light Crossbow',     atkBonus: '+6', damage: '1d8+4 piercing',  notes: 'Ranged 80/320 ft, Ammo' },
      { id: 'hatchet',    name: 'Throwing Hatchet',   atkBonus: '+6', damage: '1d4+4 slashing',  notes: 'Thrown 20/60 ft' },
      { id: 'claws',      name: "Cat's Claws",        atkBonus: '+6', damage: '1d4+4 slashing',  notes: 'Unarmed, Tabaxi racial' },
      { id: 'manchatcher',name: 'Man Catcher',        atkBonus: '+2', damage: '1d6 piercing',    notes: 'Reach, grapple on hit (DC 14)' },
    ],
    equipment: [
      { id: 'shield',   name: 'Shield',              description: '+2 AC when wielded',                                         isMagic: false },
      { id: 'leather',  name: 'Leather Armour',      description: 'AC 11 + DEX',                                                isMagic: false },
      { id: 'bolts',    name: 'Crossbow Bolts ×20',  description: '',                                                           isMagic: false },
      { id: 'pack',     name: "Explorer's Pack",     description: 'Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50 ft rope', isMagic: false },
      { id: 'gold',     name: '45 GP',               description: '',                                                           isMagic: false },
    ],
  }
}

function loadFighterState(characterId) {
  try {
    const raw = localStorage.getItem(storageKey(characterId))
    if (!raw) return buildDefaults()
    const saved = JSON.parse(raw)
    return { ...buildDefaults(saved.level || 4, saved.abilityScores || DEFAULT_ABILITIES), ...saved }
  } catch {
    return buildDefaults()
  }
}

function saveFighterState(characterId, state) {
  try { localStorage.setItem(storageKey(characterId), JSON.stringify(state)) } catch {}
}

export function useFighterState(characterId = 'tonti') {
  const [state, setState] = useState(() => loadFighterState(characterId))
  const [syncStatus, setSyncStatus] = useState('idle')
  const saveTimerRef = useRef(null)

  // Load from cloud on mount
  useEffect(() => {
    loadFromCloud(characterId).then(cloudData => {
      if (!cloudData) return
      setState(prev => {
        const merged = { ...prev, ...cloudData }
        saveFighterState(characterId, merged)
        return merged
      })
    })
  }, [characterId])

  // Debounced cloud save
  useEffect(() => {
    saveFighterState(characterId, state)
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

  const update = (patch) => setState(prev => ({ ...prev, ...patch }))

  // ── HP ──────────────────────────────────────────────────
  function adjustHp(delta) {
    setState(prev => {
      const conMod = Math.floor((prev.abilityScores.con - 10) / 2)
      const maxHp = prev.level === 4 && prev.abilityScores.con === 16 ? 44 : getMaxHp(prev.level, conMod)
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

  function adjustHitDice(delta) {
    setState(prev => ({
      ...prev,
      hitDiceSpent: Math.max(0, Math.min(prev.level, prev.hitDiceSpent + delta)),
    }))
  }

  // ── Fighter resources ────────────────────────────────────
  function toggleSecondWind() { update({ secondWindUsed: !state.secondWindUsed }) }
  function toggleActionSurge() { update({ actionSurgeUsed: !state.actionSurgeUsed }) }
  function toggleAmbush() { update({ ambushUsed: !state.ambushUsed }) }
  function toggleManifestEcho() { update({ manifestEchoActive: !state.manifestEchoActive }) }
  function useUnleashIncarnation() {
    const conMod = Math.floor((state.abilityScores.con - 10) / 2)
    const maxUses = Math.max(1, conMod)
    setState(prev => ({
      ...prev,
      unleashIncarnationUsed: Math.min(maxUses, prev.unleashIncarnationUsed + 1),
    }))
  }
  function restoreUnleashIncarnation() {
    setState(prev => ({ ...prev, unleashIncarnationUsed: Math.max(0, prev.unleashIncarnationUsed - 1) }))
  }
  function toggleFelineAgility() { update({ felineAgilityUsed: !state.felineAgilityUsed }) }
  function toggleInspiration() { update({ heroicInspiration: !state.heroicInspiration }) }

  // ── Rest ─────────────────────────────────────────────────
  function shortRest() {
    setState(prev => {
      const conMod = Math.floor((prev.abilityScores.con - 10) / 2)
      const maxHp = prev.level === 4 && prev.abilityScores.con === 16 ? 44 : getMaxHp(prev.level, conMod)
      return {
        ...prev,
        secondWindUsed: false,
        actionSurgeUsed: false,
        ambushUsed: false,
        felineAgilityUsed: false,
      }
    })
  }

  function longRest() {
    setState(prev => {
      const conMod = Math.floor((prev.abilityScores.con - 10) / 2)
      const maxHp = prev.level === 4 && prev.abilityScores.con === 16 ? 44 : getMaxHp(prev.level, conMod)
      return {
        ...prev,
        currentHp: maxHp,
        tempHp: 0,
        hitDiceSpent: 0,
        deathSaves: { successes: 0, failures: 0 },
        secondWindUsed: false,
        actionSurgeUsed: false,
        ambushUsed: false,
        unleashIncarnationUsed: 0,
        felineAgilityUsed: false,
        heroicInspiration: false,
      }
    })
  }

  // ── Advancement ──────────────────────────────────────────
  function setLevel(n) { update({ level: Math.max(1, Math.min(20, n)) }) }
  function setAbilityScore(ability, score) {
    setState(prev => ({
      ...prev,
      abilityScores: { ...prev.abilityScores, [ability]: Math.max(1, Math.min(30, score)) },
    }))
  }
  function setXp(xp) { update({ xp: Math.max(0, xp) }) }

  // ── Weapons & Equipment ──────────────────────────────────
  function addWeapon(data) { setState(prev => ({ ...prev, weapons: [...prev.weapons, { id: uid(), ...data }] })) }
  function updateWeapon(id, data) { setState(prev => ({ ...prev, weapons: prev.weapons.map(w => w.id === id ? { ...w, ...data } : w) })) }
  function removeWeapon(id) { setState(prev => ({ ...prev, weapons: prev.weapons.filter(w => w.id !== id) })) }

  function addEquipment(data) { setState(prev => ({ ...prev, equipment: [...prev.equipment, { id: uid(), ...data }] })) }
  function updateEquipment(id, data) { setState(prev => ({ ...prev, equipment: prev.equipment.map(e => e.id === id ? { ...e, ...data } : e) })) }
  function removeEquipment(id) { setState(prev => ({ ...prev, equipment: prev.equipment.filter(e => e.id !== id) })) }

  // ── Skills & Languages ───────────────────────────────────
  function setSkillProf(skillName, level) {
    setState(prev => ({ ...prev, skillProfs: { ...prev.skillProfs, [skillName]: level } }))
  }
  function addLanguage(lang) {
    if (!lang?.trim()) return
    setState(prev => prev.languages.includes(lang.trim()) ? prev : { ...prev, languages: [...prev.languages, lang.trim()] })
  }
  function removeLanguage(lang) {
    setState(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }))
  }

  // ── Character Info ───────────────────────────────────────
  function setAc(n) { update({ ac: Math.max(0, Math.min(30, Number(n) || 0)) }) }
  function setSpeed(n) { update({ speed: Math.max(0, Number(n) || 0) }) }
  function setCharacterName(n) { update({ characterName: n }) }
  function setBackground(n) { update({ background: n }) }
  function setNotes(n) { update({ notes: n }) }

  // ── Derived ──────────────────────────────────────────────
  const conMod = Math.floor((state.abilityScores.con - 10) / 2)
  const profBonus = getProfBonus(state.level)
  const maxHp = state.level === 4 && state.abilityScores.con === 16 ? 44 : getMaxHp(state.level, conMod)
  const unleashIncarnationMax = Math.max(1, conMod)

  return {
    ...state,
    // Actions
    adjustHp, setTempHp, toggleDeathSave, resetDeathSaves, adjustHitDice,
    toggleSecondWind, toggleActionSurge, toggleAmbush, toggleManifestEcho,
    useUnleashIncarnation, restoreUnleashIncarnation, toggleFelineAgility,
    toggleInspiration, shortRest, longRest,
    setLevel, setAbilityScore, setXp,
    addWeapon, updateWeapon, removeWeapon,
    addEquipment, updateEquipment, removeEquipment,
    setSkillProf, addLanguage, removeLanguage,
    setAc, setSpeed, setCharacterName, setBackground, setNotes,
    // Sync
    syncStatus,
    // Derived
    maxHp,
    profBonus,
    unleashIncarnationMax,
  }
}
