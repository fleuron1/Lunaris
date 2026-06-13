import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  SPECIES, BACKGROUNDS, ASI_LEVELS,
  STANDARD_ARRAY, POINT_BUY_BUDGET, POINT_BUY_COSTS,
  ABILITY_KEYS, ABILITY_NAMES, ABILITY_HINTS,
  abilityMod, formatMod, pointBuyTotal,
  ALL_LANGUAGES, ALL_SKILLS,
  ATTACK_CANTRIPS, cantripDiceCount,
  ACCENT_OPTIONS, generateCharacterId,
} from '../data/character-creation.js'
import { XP_THRESHOLDS, getProfBonus, maxMetamagic } from '../data/sorcerer-progression.js'
import {
  CLASSES, CLASS_IDS, getClass, classMaxHp, classSlotMax,
  cantripsKnownFor, spellsLimitFor, maxCastableSpellLevel,
  spellListFor, spellsLimitLabel, startingAc,
} from '../data/classes.js'
import { LUNAR_PHASES } from '../data/annabelle.js'
import metamagicData from '../data/metamagic.json'
import { createCharacterState, persistNewCharacter } from '../hooks/useCharacterState.js'
import { useCharactersList } from '../hooks/useCharactersList.js'

const DRAFT_KEY = 'lunaris-create-draft-v1'
const STEPS = ['Identity', 'Class', 'Abilities', 'Spells', 'Equipment', 'Review']

// Spells granted by Lunar Sorcery — always prepared, never picked as known spells
const LUNAR_GRANTED = new Set(Object.values(LUNAR_PHASES).flatMap(p => p.bonusSpells))

const PHASE_ICONS = { full: '🌕', new: '🌑', crescent: '🌙' }

const emptyAbilities = (val) => ({ str: val, dex: val, con: val, int: val, wis: val, cha: val })

const INITIAL_DRAFT = {
  name: '', accent: 'violet', speciesId: null, backgroundId: null, notes: '',
  classId: 'sorcerer',
  level: 1,
  abilityMethod: 'standard',
  arrayAssign: emptyAbilities(null),
  pointBuyScores: emptyAbilities(8),
  manualScores: emptyAbilities(10),
  originMode: '2-1', originPlusTwo: 'cha', originPlusOne: 'con', originOnes: [],
  asiAlloc: emptyAbilities(0),
  classSkills: [], extraSkillPicks: [], extraLangPicks: [],
  metamagic: [],
  cantrips: [], spells: [],
  equipMode: 'kit', weaponChoice: 'crossbow', focusChoice: 'arcane-focus', packChoice: 'explorers',
  goldRolled: null,
}

// Patch to apply when the class changes — clears every class-dependent pick
// and re-defaults equipment + origin bonus for the new class.
function classChangePatch(classId) {
  const cls = getClass(classId)
  return {
    classId,
    classSkills: [],
    metamagic: [],
    cantrips: [],
    spells: [],
    weaponChoice: cls.kit.weaponOptions[0]?.id,
    focusChoice: cls.kit.focusOptions[0]?.id,
    packChoice: cls.kit.packOptions[0]?.id,
    goldRolled: null,
    originPlusTwo: cls.spellAbility,
    originPlusOne: cls.spellAbility === 'con' ? 'dex' : 'con',
  }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return { ...INITIAL_DRAFT }
    return { ...INITIAL_DRAFT, ...JSON.parse(raw) }
  } catch {
    return { ...INITIAL_DRAFT }
  }
}

// ── Derivation helpers (single source of truth for validation, review & create) ──

function getBaseScores(draft) {
  if (draft.abilityMethod === 'standard') return draft.arrayAssign
  if (draft.abilityMethod === 'pointbuy') return draft.pointBuyScores
  return draft.manualScores
}

function getOriginBonus(draft, key) {
  if (draft.originMode === '2-1') {
    return (draft.originPlusTwo === key ? 2 : 0) + (draft.originPlusOne === key ? 1 : 0)
  }
  return draft.originOnes.includes(key) ? 1 : 0
}

function getFinalScores(draft) {
  const base = getBaseScores(draft)
  const out = {}
  for (const k of ABILITY_KEYS) {
    const b = base[k] ?? 0
    const asi = draft.level >= 4 ? (draft.asiAlloc[k] || 0) : 0
    out[k] = Math.min(20, Math.max(1, b + getOriginBonus(draft, k) + asi))
  }
  return out
}

function getSpecies(draft)    { return SPECIES.find(s => s.id === draft.speciesId) || null }
function getBackground(draft) { return BACKGROUNDS.find(b => b.id === draft.backgroundId) || null }

function asiPointsAvailable(level) {
  return 2 * ASI_LEVELS.filter(l => l <= level).length
}

// Class-dependent derivations from the draft
function draftClass(draft)        { return getClass(draft.classId || 'sorcerer') }
function draftMaxSpellLevel(draft) { return maxCastableSpellLevel(draft.classId, draft.level) }
function draftCastMod(draft)      { return abilityMod(getFinalScores(draft)[draftClass(draft).spellAbility] ?? 10) }
function draftCantripMax(draft)   { return cantripsKnownFor(draft.classId, draft.level) }
function draftSpellMax(draft)     { return spellsLimitFor(draft.classId, draft.level, draftCastMod(draft)) }

// All automatically granted skill proficiencies (species + background)
function grantedSkills(draft) {
  const sp = getSpecies(draft)
  const bg = getBackground(draft)
  return new Set([...(sp?.skills || []), ...(bg?.skills || [])])
}

// ── Per-step validation. Returns an array of human-readable problems. ─────────

function validateStep(step, draft) {
  const errors = []
  const species = getSpecies(draft)

  if (step === 0) {
    if (!draft.name.trim()) errors.push('Give your character a name.')
    if (!species) errors.push('Choose a species.')
    if (!getBackground(draft)) errors.push('Choose a background.')
  }

  if (step === 1) {
    const cls = draftClass(draft)
    const extra = species?.extraSkills || 0
    if (draft.classSkills.length !== cls.skillChoices)
      errors.push(`Choose ${cls.skillChoices} ${cls.name.toLowerCase()} skills (${draft.classSkills.length}/${cls.skillChoices} picked).`)
    if (extra > 0 && draft.extraSkillPicks.length !== extra)
      errors.push(`Choose ${extra} bonus skill${extra > 1 ? 's' : ''} from your species (${draft.extraSkillPicks.length}/${extra} picked).`)
    const langChoices = (species?.extraLanguages || 0) + (getBackground(draft)?.extraLanguages || 0)
    if (draft.extraLangPicks.length > langChoices)
      errors.push(`Too many extra languages picked (${draft.extraLangPicks.length}/${langChoices}).`)
    const mmMax = cls.hasMetamagic && draft.level >= 3 ? maxMetamagic(draft.level) : 0
    if (mmMax > 0 && draft.metamagic.length !== mmMax)
      errors.push(`Choose ${mmMax} Metamagic options (${draft.metamagic.length}/${mmMax} picked).`)
  }

  if (step === 2) {
    const base = getBaseScores(draft)
    if (draft.abilityMethod === 'standard') {
      if (ABILITY_KEYS.some(k => base[k] == null)) errors.push('Assign every value from the standard array.')
    }
    if (draft.abilityMethod === 'pointbuy') {
      const spent = pointBuyTotal(base)
      if (spent > POINT_BUY_BUDGET) errors.push(`Point buy over budget (${spent}/${POINT_BUY_BUDGET}).`)
    }
    if (draft.abilityMethod === 'manual') {
      if (ABILITY_KEYS.some(k => base[k] < 3 || base[k] > 18)) errors.push('Manual scores must be between 3 and 18.')
    }
    if (draft.originMode === '2-1') {
      if (!draft.originPlusTwo || !draft.originPlusOne) errors.push('Assign your +2 and +1 origin bonuses.')
      else if (draft.originPlusTwo === draft.originPlusOne) errors.push('The +2 and +1 origin bonuses must go to different abilities.')
    } else if (draft.originOnes.length !== 3) {
      errors.push(`Pick three abilities for +1 origin bonuses (${draft.originOnes.length}/3).`)
    }
    if (draft.level >= 4) {
      const avail = asiPointsAvailable(draft.level)
      const spent = ABILITY_KEYS.reduce((s, k) => s + (draft.asiAlloc[k] || 0), 0)
      if (spent > avail) errors.push(`Too many ability score improvement points spent (${spent}/${avail}).`)
    }
  }

  if (step === 3) {
    const list = spellListFor(draft.classId)
    const cMax = draftCantripMax(draft)
    const sMax = draftSpellMax(draft)
    const label = spellsLimitLabel(draft.classId) === 'prepared' ? 'prepared spells' : 'spells'
    if (draft.cantrips.length !== cMax) errors.push(`Choose ${cMax} cantrips (${draft.cantrips.length}/${cMax} picked).`)
    if (draft.spells.length !== sMax) errors.push(`Choose ${sMax} ${label} (${draft.spells.length}/${sMax} picked).`)
    const maxLvl = draftMaxSpellLevel(draft)
    const tooHigh = draft.spells.filter(name => {
      const sp = list.find(s => s.name === name)
      return sp && sp.level > maxLvl
    })
    if (tooHigh.length) errors.push(`Above your max spell level (${maxLvl}): ${tooHigh.join(', ')}.`)
    // Spells picked under a previous class that aren't on this class's list
    const names = new Set(list.map(s => s.name))
    const wrongClass = [...draft.cantrips, ...draft.spells].filter(n => !names.has(n))
    if (wrongClass.length) errors.push(`Not on the ${draftClass(draft).name} spell list: ${wrongClass.join(', ')}.`)
  }

  if (step === 4) {
    if (draft.equipMode === 'gold' && !draft.goldRolled) errors.push('Roll for your starting gold.')
  }

  return errors
}

function validateAll(draft) {
  for (let i = 0; i < STEPS.length - 1; i++) {
    const errs = validateStep(i, draft)
    if (errs.length) return { step: i, errors: errs }
  }
  return null
}

// ── Build the final character state config from a valid draft ─────────────────

function buildFinal(draft) {
  const species = getSpecies(draft)
  const background = getBackground(draft)
  const cls = draftClass(draft)
  const kit = cls.kit
  const scores = getFinalScores(draft)
  const level = draft.level
  const prof = getProfBonus(level)
  const dexMod = abilityMod(scores.dex)
  const strMod = abilityMod(scores.str)
  const castMod = abilityMod(scores[cls.spellAbility] ?? 10)
  const withKit = draft.equipMode === 'kit'

  // Skills → { name: 'proficient' }
  const skillProfs = {}
  for (const s of grantedSkills(draft)) skillProfs[s] = 'proficient'
  for (const s of draft.classSkills) skillProfs[s] = 'proficient'
  for (const s of draft.extraSkillPicks) skillProfs[s] = 'proficient'

  // Languages
  const languages = [...new Set([...(species?.languages || ['Common']), ...draft.extraLangPicks])]

  // Weapons table — kit weapon + dagger (when the kit includes one) + attack cantrips
  const weaponMod = (stat) => stat === 'dex' ? dexMod : stat === 'finesse' ? Math.max(strMod, dexMod) : strMod
  const weapons = []
  const kitWeapon = withKit ? kit.weaponOptions.find(o => o.id === draft.weaponChoice) : null
  if (kitWeapon) {
    const m = weaponMod(kitWeapon.stat)
    weapons.push({
      name: kitWeapon.name.split(' & ')[0], atkBonus: formatMod(prof + m),
      damage: `${kitWeapon.die}${m ? formatMod(m) : ''} ${kitWeapon.type}`,
      notes: kitWeapon.notes,
    })
  }
  const hasDaggers = withKit && kit.fixedItems.some(i => /^Dagger/.test(i.name)) && !/^Dagger/.test(kitWeapon?.name || '')
  if (hasDaggers) {
    const m = Math.max(strMod, dexMod)
    weapons.push({
      name: 'Dagger', atkBonus: formatMod(prof + m),
      damage: `1d4${m ? formatMod(m) : ''} piercing`,
      notes: 'Finesse, Light, Thrown 20/60',
    })
  }
  const diceN = cantripDiceCount(level)
  for (const name of draft.cantrips) {
    const c = ATTACK_CANTRIPS[name]
    if (!c) continue
    const dmg = `${diceN}${c.die} ${c.type}`
    if (c.kind === 'attack') {
      weapons.push({
        name, atkBonus: formatMod(prof + castMod), damage: dmg,
        notes: `Cantrip | ${c.range}${c.extra ? ` | ${c.extra}` : ''}`,
      })
    } else {
      weapons.push({
        name, atkBonus: `${c.save} save`, damage: dmg,
        notes: `Cantrip | ${c.range} | DC ${8 + prof + castMod}${c.extra ? ` | ${c.extra}` : ''}`,
      })
    }
  }

  // Equipment list + gold
  const equipment = []
  let gp = 0
  if (withKit) {
    const f = kit.focusOptions.find(o => o.id === draft.focusChoice)
    const p = kit.packOptions.find(o => o.id === draft.packChoice)
    if (kitWeapon) equipment.push({ name: kitWeapon.name, description: '', isMagic: false })
    for (const item of kit.fixedItems) equipment.push({ name: item.name, description: item.description || '', isMagic: false })
    if (f) equipment.push({ name: f.name, description: '', isMagic: false })
    if (p) equipment.push({ name: p.name, description: p.contents, isMagic: false })
  } else {
    gp = draft.goldRolled?.total || 0
  }

  // Notes: backstory + background feature
  let notes = draft.notes.trim()
  if (background) {
    const featureLine = `${background.name} — ${background.feature.name}: ${background.feature.description}`
    notes = notes ? `${notes}\n\n${featureLine}` : featureLine
  }

  return {
    characterName: draft.name.trim(),
    background: background?.name || '',
    notes,
    species: species?.name || 'Unknown',
    size: species?.size || 'Med',
    speed: species?.speed ?? 30,
    speciesTraits: species?.traits || [],
    characterClass: draft.classId,
    level,
    abilityScores: scores,
    ac: startingAc(draft.classId, dexMod, { withKit, speciesAcBonus: species?.acBonus || 0 }),
    skillProfs,
    languages,
    knownCantrips: [...draft.cantrips],
    knownSpells: [...draft.spells],
    chosenMetamagic: cls.hasMetamagic && level >= 3 ? [...draft.metamagic] : [],
    weapons,
    equipment,
    currency: { cp: 0, sp: 0, gp, pp: 0 },
    xp: XP_THRESHOLDS[level - 1] || 0,
  }
}

// ── Small shared UI bits ──────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-400/50 mb-2">{children}</p>
}

function CountChip({ current, max, label }) {
  const done = current === max
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
      done ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-300'
           : 'bg-violet-950/40 border-violet-800/40 text-violet-300/70'
    }`}>
      {current} / {max} {label}
    </span>
  )
}

function PickCard({ selected, disabled, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-left rounded-xl border p-4 transition-all duration-150 ${
        selected
          ? 'bg-violet-900/40 border-violet-500/60 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
          : disabled
            ? 'bg-violet-950/20 border-violet-900/20 opacity-40 cursor-not-allowed'
            : 'bg-violet-950/30 border-violet-900/30 hover:border-violet-600/50 hover:bg-violet-950/50'
      } ${className}`}
    >
      {children}
    </button>
  )
}

// ── Step 0: Identity ──────────────────────────────────────────────────────────

function StepIdentity({ draft, set }) {
  const species = getSpecies(draft)
  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-4">
        <SectionLabel>Name & Colour</SectionLabel>
        <input
          value={draft.name}
          onChange={e => set({ name: e.target.value })}
          placeholder="Character name…"
          maxLength={40}
          className="w-full bg-violet-950/50 border border-violet-800/40 rounded-xl px-4 py-3 text-lg text-white placeholder-violet-600/40 focus:outline-none focus:border-violet-500/60"
          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
        />
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-violet-400/50 mr-1">Card colour:</span>
          {ACCENT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ accent: opt.value })}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                draft.accent === opt.value
                  ? 'border-violet-400/60 bg-violet-800/40 text-violet-100'
                  : 'border-violet-900/30 text-violet-500/50 hover:border-violet-700/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Species</SectionLabel>
          {species && <span className="text-xs text-violet-300/60">{species.icon} {species.name} · {species.size} · {species.speed} ft</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SPECIES.map(sp => (
            <PickCard key={sp.id} selected={draft.speciesId === sp.id} onClick={() => set({ speciesId: sp.id, extraSkillPicks: [], extraLangPicks: [] })}>
              <div className="text-2xl mb-1.5">{sp.icon}</div>
              <p className="font-semibold text-white text-sm">{sp.name}</p>
              <p className="text-[11px] text-violet-300/50 mt-1 leading-snug">{sp.blurb}</p>
            </PickCard>
          ))}
        </div>
        {species && (
          <div className="mt-4 bg-violet-950/30 border border-violet-900/25 rounded-xl p-4 space-y-2">
            {species.traits.map(t => (
              <p key={t.name} className="text-xs text-slate-400 leading-relaxed">
                <span className="text-amber-300/80 font-semibold">{t.name}.</span> {t.description}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <SectionLabel>Background</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {BACKGROUNDS.map(bg => (
            <PickCard key={bg.id} selected={draft.backgroundId === bg.id} onClick={() => set({ backgroundId: bg.id, extraLangPicks: [] })}>
              <div className="text-xl mb-1">{bg.icon}</div>
              <p className="font-semibold text-white text-sm">{bg.name}</p>
              <p className="text-[11px] text-violet-300/50 mt-0.5">{bg.skills.join(' · ')}</p>
            </PickCard>
          ))}
        </div>
        {getBackground(draft) && (
          <p className="mt-4 text-xs text-slate-400 bg-violet-950/30 border border-violet-900/25 rounded-xl p-4 leading-relaxed">
            <span className="text-amber-300/80 font-semibold">{getBackground(draft).feature.name}.</span>{' '}
            {getBackground(draft).feature.description}
          </p>
        )}
      </div>

      <div className="card p-5">
        <SectionLabel>Backstory & Notes <span className="normal-case tracking-normal text-violet-500/40">(optional)</span></SectionLabel>
        <textarea
          value={draft.notes}
          onChange={e => set({ notes: e.target.value })}
          rows={4}
          placeholder="Who are they? Where did their magic come from?"
          className="w-full bg-violet-950/50 border border-violet-800/40 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-violet-600/40 focus:outline-none focus:border-violet-500/60 resize-y"
        />
      </div>
    </div>
  )
}

// ── Step 1: Class ─────────────────────────────────────────────────────────────

function StepClass({ draft, set }) {
  const species = getSpecies(draft)
  const background = getBackground(draft)
  const cls = draftClass(draft)
  const granted = grantedSkills(draft)
  const extraSkills = species?.extraSkills || 0
  const langChoices = (species?.extraLanguages || 0) + (background?.extraLanguages || 0)
  const fixedLangs = species?.languages || ['Common']
  const mmMax = cls.hasMetamagic && draft.level >= 3 ? maxMetamagic(draft.level) : 0

  // One toggle for both pools: class slots fill first, then species extras.
  // (Matters for bards, whose class list is every skill.)
  function toggleSkill(name, isClassSkill) {
    if (granted.has(name)) return
    if (draft.classSkills.includes(name)) {
      set({ classSkills: draft.classSkills.filter(s => s !== name) })
      return
    }
    if (draft.extraSkillPicks.includes(name)) {
      set({ extraSkillPicks: draft.extraSkillPicks.filter(s => s !== name) })
      return
    }
    if (isClassSkill && draft.classSkills.length < cls.skillChoices) {
      set({ classSkills: [...draft.classSkills, name] })
      return
    }
    if (extraSkills > 0 && draft.extraSkillPicks.length < extraSkills) {
      set({ extraSkillPicks: [...draft.extraSkillPicks, name] })
    }
  }

  function toggleLang(lang) {
    if (fixedLangs.includes(lang)) return
    set({
      extraLangPicks: draft.extraLangPicks.includes(lang)
        ? draft.extraLangPicks.filter(l => l !== lang)
        : draft.extraLangPicks.length < langChoices ? [...draft.extraLangPicks, lang] : draft.extraLangPicks,
    })
  }

  function toggleMetamagic(name) {
    set({
      metamagic: draft.metamagic.includes(name)
        ? draft.metamagic.filter(m => m !== name)
        : draft.metamagic.length < mmMax ? [...draft.metamagic, name] : draft.metamagic,
    })
  }

  return (
    <div className="space-y-6">
      {/* Class cards */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <SectionLabel>Class</SectionLabel>
          <span className="text-[11px] text-violet-500/50 italic">Changing class resets skills, spells & equipment picks</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CLASS_IDS.map(id => {
            const c = CLASSES[id]
            return (
              <PickCard key={id} selected={draft.classId === id} onClick={() => { if (draft.classId !== id) set(classChangePatch(id)) }}>
                <div className="text-2xl mb-1.5">{c.icon}</div>
                <p className="font-semibold text-white text-sm">{c.name}</p>
                <p className="text-[11px] text-violet-300/50 mt-1 leading-snug">{c.blurb}</p>
                <p className="text-[10px] text-violet-400/50 mt-2">
                  d{c.hitDie} · {c.spellAbility.toUpperCase()} caster · Saves {c.saves.join('/')}
                </p>
                {c.subclass && <p className="text-[10px] text-amber-300/70 mt-0.5">{c.subclass}</p>}
              </PickCard>
            )
          })}
        </div>
        <p className="mt-3 text-[11px] text-violet-300/50">{cls.proficiencies}</p>

        {/* Lunar phases showcase — sorcerer only */}
        {cls.hasLunarPhases && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.entries(LUNAR_PHASES).map(([key, ph]) => (
              <div key={key} className="bg-violet-950/30 border border-violet-900/25 rounded-xl p-3">
                <p className="text-xs font-semibold text-violet-200">{PHASE_ICONS[key]} {ph.name}</p>
                <p className="text-[11px] text-violet-300/50 mt-1">Bonus: {ph.bonusSpells.join(', ')}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{ph.tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Level */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <SectionLabel>Starting Level</SectionLabel>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set({ level: Math.max(1, draft.level - 1) })} disabled={draft.level <= 1}
              className="w-9 h-9 rounded-lg border border-violet-800/40 bg-violet-950/40 text-violet-200 font-bold disabled:opacity-30 hover:bg-violet-900/40 transition-colors">−</button>
            <span className="text-3xl font-bold text-white w-12 text-center tabular-nums" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>{draft.level}</span>
            <button type="button" onClick={() => set({ level: Math.min(20, draft.level + 1) })} disabled={draft.level >= 20}
              className="w-9 h-9 rounded-lg border border-violet-800/40 bg-violet-950/40 text-violet-200 font-bold disabled:opacity-30 hover:bg-violet-900/40 transition-colors">+</button>
          </div>
        </div>
        <p className="text-xs text-violet-300/50 mt-2">
          Level {draft.level}: {draftCantripMax(draft)} cantrips · {
            cls.spellsKnownType === 'prepared'
              ? `level + ${cls.spellAbility.toUpperCase()} mod spells prepared`
              : `${draftSpellMax(draft)} spells known`
          }
          {' '}· max spell level {draftMaxSpellLevel(draft)}
          {cls.casterType === 'pact' ? ' (pact slots recharge on short rest)' : ''}
          {mmMax > 0 ? ` · ${mmMax} metamagic` : ''}
          {draft.level >= 4 ? ` · +${asiPointsAvailable(draft.level)} ability points (ASI)` : ''}
        </p>
      </div>

      {/* Skills */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <SectionLabel>Skill Proficiencies</SectionLabel>
          <div className="flex gap-2 flex-wrap">
            <CountChip current={draft.classSkills.length} max={cls.skillChoices} label="class picks" />
            {extraSkills > 0 && <CountChip current={draft.extraSkillPicks.length} max={extraSkills} label={`${species.name} picks`} />}
          </div>
        </div>
        <p className="text-xs text-violet-300/50 mb-3">
          Pick {cls.skillChoices} from the {cls.name.toLowerCase()} list{extraSkills > 0 ? `, plus ${extraSkills} more from any skill (${species.name})` : ''}.
          Skills granted by your background{species?.skills?.length ? ' and species' : ''} are already locked in.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_SKILLS.map(sk => {
            const isClassSkill = cls.skillList.includes(sk.name)
            const isGranted = granted.has(sk.name)
            const isClassPicked = draft.classSkills.includes(sk.name)
            const isExtraPicked = draft.extraSkillPicks.includes(sk.name)
            const selected = isGranted || isClassPicked || isExtraPicked
            const canExtra = extraSkills > 0
            const clickable = !isGranted && (isClassSkill || canExtra)
            const onClick = clickable ? () => toggleSkill(sk.name, isClassSkill) : undefined
            return (
              <button
                key={sk.name}
                type="button"
                onClick={onClick}
                disabled={!clickable}
                className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                  selected
                    ? 'bg-violet-800/40 border-violet-500/50 text-white'
                    : clickable
                      ? 'bg-violet-950/30 border-violet-900/30 text-violet-300/70 hover:border-violet-600/50'
                      : 'bg-violet-950/15 border-violet-950/30 text-violet-700/40 cursor-not-allowed'
                }`}
              >
                <span className="font-semibold">{sk.name}</span>
                <span className="text-violet-500/50 ml-1 uppercase">{sk.ability}</span>
                {isGranted && <span className="block text-[10px] text-amber-300/70 mt-0.5">✓ {species?.skills?.includes(sk.name) ? species.name : background?.name}</span>}
                {isClassPicked && <span className="block text-[10px] text-violet-300/70 mt-0.5">✓ {cls.name}</span>}
                {isExtraPicked && <span className="block text-[10px] text-violet-300/70 mt-0.5">✓ {species?.name}</span>}
                {!isGranted && !selected && isClassSkill && <span className="block text-[10px] text-violet-600/50 mt-0.5">{cls.name} list</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Languages */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <SectionLabel>Languages</SectionLabel>
          {langChoices > 0 && <CountChip current={draft.extraLangPicks.length} max={langChoices} label="extra picks" />}
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_LANGUAGES.map(lang => {
            const fixed = fixedLangs.includes(lang)
            const picked = draft.extraLangPicks.includes(lang)
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLang(lang)}
                disabled={fixed || (!picked && draft.extraLangPicks.length >= langChoices)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  fixed
                    ? 'bg-amber-900/25 border-amber-700/40 text-amber-200/90 cursor-default'
                    : picked
                      ? 'bg-violet-800/40 border-violet-500/50 text-white'
                      : draft.extraLangPicks.length >= langChoices
                        ? 'bg-violet-950/15 border-violet-950/30 text-violet-700/40 cursor-not-allowed'
                        : 'bg-violet-950/30 border-violet-900/30 text-violet-300/70 hover:border-violet-600/50'
                }`}
              >
                {lang}{fixed && ' ✓'}
              </button>
            )
          })}
        </div>
        {langChoices === 0 && <p className="text-[11px] text-violet-500/50 mt-2 italic">Your species and background don't grant extra language picks — you can add more later in the Builder.</p>}
      </div>

      {/* Metamagic */}
      {mmMax > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <SectionLabel>Metamagic</SectionLabel>
            <CountChip current={draft.metamagic.length} max={mmMax} label="chosen" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {metamagicData.map(mm => {
              const picked = draft.metamagic.includes(mm.name)
              return (
                <PickCard
                  key={mm.name}
                  selected={picked}
                  disabled={!picked && draft.metamagic.length >= mmMax}
                  onClick={() => toggleMetamagic(mm.name)}
                >
                  <p className="font-semibold text-sm text-white">{mm.name} <span className="text-violet-400/60 text-xs font-normal">({mm.spCost} SP)</span></p>
                  <p className="text-[11px] text-violet-300/50 mt-1 leading-snug">{mm.description}</p>
                </PickCard>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step 2: Abilities ─────────────────────────────────────────────────────────

function StepAbilities({ draft, set }) {
  const base = getBaseScores(draft)
  const final = getFinalScores(draft)
  const species = getSpecies(draft)
  const cls = draftClass(draft)

  const conMod = abilityMod(final.con)
  const dexMod = abilityMod(final.dex)
  const castMod = abilityMod(final[cls.spellAbility] ?? 10)
  const prof = getProfBonus(draft.level)
  const hp = classMaxHp(draft.classId, draft.level, conMod)
  const ac = startingAc(draft.classId, dexMod, { withKit: draft.equipMode === 'kit', speciesAcBonus: species?.acBonus || 0 })
  const armorName = draft.equipMode === 'kit' && cls.kit.armor ? cls.kit.armor.name : null
  const hints = { ...ABILITY_HINTS, cha: 'Deception, presence' }
  hints[cls.spellAbility] = 'Your spellcasting ability ★'

  const pbSpent = pointBuyTotal(draft.pointBuyScores)
  const asiAvail = asiPointsAvailable(draft.level)
  const asiSpent = ABILITY_KEYS.reduce((s, k) => s + (draft.asiAlloc[k] || 0), 0)

  function setArrayValue(key, value) {
    const next = { ...draft.arrayAssign }
    const val = value === '' ? null : Number(value)
    // un-assign this value from any other ability that holds it
    if (val != null) {
      for (const k of ABILITY_KEYS) if (k !== key && next[k] === val) next[k] = null
    }
    next[key] = val
    set({ arrayAssign: next })
  }

  function bumpPointBuy(key, dir) {
    const cur = draft.pointBuyScores[key]
    const next = cur + dir
    if (next < 8 || next > 15) return
    const scores = { ...draft.pointBuyScores, [key]: next }
    if (pointBuyTotal(scores) > POINT_BUY_BUDGET) return
    set({ pointBuyScores: scores })
  }

  function bumpManual(key, dir) {
    const next = Math.max(3, Math.min(18, draft.manualScores[key] + dir))
    set({ manualScores: { ...draft.manualScores, [key]: next } })
  }

  function toggleOriginOne(key) {
    set({
      originOnes: draft.originOnes.includes(key)
        ? draft.originOnes.filter(k => k !== key)
        : draft.originOnes.length < 3 ? [...draft.originOnes, key] : draft.originOnes,
    })
  }

  function bumpAsi(key, dir) {
    const cur = draft.asiAlloc[key] || 0
    if (dir > 0) {
      if (asiSpent >= asiAvail) return
      const baseVal = (base[key] ?? 0) + getOriginBonus(draft, key)
      if (baseVal + cur + 1 > 20) return
      set({ asiAlloc: { ...draft.asiAlloc, [key]: cur + 1 } })
    } else if (cur > 0) {
      set({ asiAlloc: { ...draft.asiAlloc, [key]: cur - 1 } })
    }
  }

  const METHODS = [
    { id: 'standard', label: 'Standard Array', hint: '15, 14, 13, 12, 10, 8' },
    { id: 'pointbuy', label: 'Point Buy', hint: `${POINT_BUY_BUDGET} points` },
    { id: 'manual', label: 'Manual', hint: 'Rolled at the table' },
  ]

  return (
    <div className="space-y-6">
      {/* Method tabs */}
      <div className="card p-5">
        <SectionLabel>Method</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {METHODS.map(m => (
            <PickCard key={m.id} selected={draft.abilityMethod === m.id} onClick={() => set({ abilityMethod: m.id })}>
              <p className="font-semibold text-sm text-white">{m.label}</p>
              <p className="text-[11px] text-violet-300/50 mt-0.5">{m.hint}</p>
            </PickCard>
          ))}
        </div>
        {draft.abilityMethod === 'pointbuy' && (
          <p className="mt-3 text-xs">
            <span className={`font-bold ${pbSpent > POINT_BUY_BUDGET ? 'text-rose-400' : 'text-emerald-300'}`}>{POINT_BUY_BUDGET - pbSpent}</span>
            <span className="text-violet-300/50"> points remaining · scores 8–15 before bonuses</span>
          </p>
        )}
      </div>

      {/* Score rows */}
      <div className="card p-5">
        <SectionLabel>Base Scores</SectionLabel>
        <div className="space-y-2">
          {ABILITY_KEYS.map(key => {
            const b = base[key]
            const origin = getOriginBonus(draft, key)
            const asi = draft.level >= 4 ? (draft.asiAlloc[key] || 0) : 0
            return (
              <div key={key} className="flex items-center gap-3 bg-violet-950/30 border border-violet-900/25 rounded-xl px-4 py-2.5">
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm font-semibold text-white">{ABILITY_NAMES[key]}</p>
                  <p className="text-[10px] text-violet-400/40">{hints[key]}</p>
                </div>

                {/* method-specific input */}
                {draft.abilityMethod === 'standard' && (
                  <select
                    value={b ?? ''}
                    onChange={e => setArrayValue(key, e.target.value)}
                    className="bg-violet-950/60 border border-violet-800/40 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/60"
                  >
                    <option value="">—</option>
                    {STANDARD_ARRAY.map((v, i) => (
                      <option key={i} value={v} disabled={ABILITY_KEYS.some(k => k !== key && draft.arrayAssign[k] === v) && b !== v}>
                        {v}
                      </option>
                    ))}
                  </select>
                )}
                {draft.abilityMethod === 'pointbuy' && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => bumpPointBuy(key, -1)} className="w-7 h-7 rounded-md border border-violet-800/40 bg-violet-950/40 text-violet-200 text-sm font-bold hover:bg-violet-900/40">−</button>
                    <span className="w-8 text-center text-white font-bold tabular-nums">{b}</span>
                    <button type="button" onClick={() => bumpPointBuy(key, 1)} className="w-7 h-7 rounded-md border border-violet-800/40 bg-violet-950/40 text-violet-200 text-sm font-bold hover:bg-violet-900/40">+</button>
                    <span className="text-[10px] text-violet-500/50 w-10">cost {POINT_BUY_COSTS[b]}</span>
                  </div>
                )}
                {draft.abilityMethod === 'manual' && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => bumpManual(key, -1)} className="w-7 h-7 rounded-md border border-violet-800/40 bg-violet-950/40 text-violet-200 text-sm font-bold hover:bg-violet-900/40">−</button>
                    <span className="w-8 text-center text-white font-bold tabular-nums">{b}</span>
                    <button type="button" onClick={() => bumpManual(key, 1)} className="w-7 h-7 rounded-md border border-violet-800/40 bg-violet-950/40 text-violet-200 text-sm font-bold hover:bg-violet-900/40">+</button>
                  </div>
                )}

                {/* bonuses + final */}
                <div className="ml-auto flex items-center gap-3 text-right">
                  {origin > 0 && <span className="text-[11px] text-amber-300/80">+{origin} origin</span>}
                  {asi > 0 && <span className="text-[11px] text-emerald-300/80">+{asi} ASI</span>}
                  <div className="w-14">
                    <p className="text-xl font-bold text-white leading-none tabular-nums">{b == null ? '—' : final[key]}</p>
                    <p className="text-[10px] text-violet-400/50">{b == null ? '' : formatMod(abilityMod(final[key]))}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Origin bonus */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <SectionLabel>Origin Bonus</SectionLabel>
          <div className="flex gap-2">
            {[{ id: '2-1', label: '+2 / +1' }, { id: '1-1-1', label: '+1 / +1 / +1' }].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => set({ originMode: m.id })}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  draft.originMode === m.id
                    ? 'bg-violet-800/40 border-violet-500/50 text-white'
                    : 'bg-violet-950/30 border-violet-900/30 text-violet-300/60 hover:border-violet-600/50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-violet-300/50 mb-3">Your heritage grants ability bonuses — {ABILITY_NAMES[cls.spellAbility]} fuels your spellcasting.</p>

        {draft.originMode === '2-1' ? (
          <div className="space-y-2">
            {[{ field: 'originPlusTwo', label: '+2' }, { field: 'originPlusOne', label: '+1' }].map(({ field, label }) => (
              <div key={field} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-300/90 w-8">{label}</span>
                {ABILITY_KEYS.map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => set({ [field]: k })}
                    className={`text-xs px-3 py-1.5 rounded-lg border uppercase font-semibold transition-all ${
                      draft[field] === k
                        ? 'bg-amber-800/40 border-amber-500/50 text-amber-100'
                        : 'bg-violet-950/30 border-violet-900/30 text-violet-300/60 hover:border-violet-600/50'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            ))}
            {draft.originPlusTwo && draft.originPlusTwo === draft.originPlusOne && (
              <p className="text-xs text-rose-400">The +2 and +1 must go to different abilities.</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-300/90 w-8">+1 ×3</span>
            {ABILITY_KEYS.map(k => (
              <button
                key={k}
                type="button"
                onClick={() => toggleOriginOne(k)}
                className={`text-xs px-3 py-1.5 rounded-lg border uppercase font-semibold transition-all ${
                  draft.originOnes.includes(k)
                    ? 'bg-amber-800/40 border-amber-500/50 text-amber-100'
                    : 'bg-violet-950/30 border-violet-900/30 text-violet-300/60 hover:border-violet-600/50'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ASI allocator */}
      {draft.level >= 4 && (
        <div className="card p-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <SectionLabel>Ability Score Improvements</SectionLabel>
            <CountChip current={asiSpent} max={asiAvail} label="points" />
          </div>
          <p className="text-xs text-violet-300/50 mb-3">
            Sorcerers gain ASIs at levels {ASI_LEVELS.filter(l => l <= draft.level).join(', ')} — {asiAvail} points to spend (+1 each, max 20 per score).
            Unspent points are fine: you can take feats instead in the Builder afterwards.
          </p>
          <div className="flex flex-wrap gap-2">
            {ABILITY_KEYS.map(k => (
              <div key={k} className="flex items-center gap-2 bg-violet-950/30 border border-violet-900/25 rounded-xl px-3 py-2">
                <span className="text-xs font-bold uppercase text-violet-200 w-8">{k}</span>
                <button type="button" onClick={() => bumpAsi(k, -1)} className="w-6 h-6 rounded-md border border-violet-800/40 bg-violet-950/40 text-violet-200 text-xs font-bold hover:bg-violet-900/40">−</button>
                <span className="w-6 text-center text-white font-bold tabular-nums text-sm">{draft.asiAlloc[k] || 0}</span>
                <button type="button" onClick={() => bumpAsi(k, 1)} className="w-6 h-6 rounded-md border border-violet-800/40 bg-violet-950/40 text-violet-200 text-xs font-bold hover:bg-violet-900/40">+</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live derived preview */}
      <div className="card p-5">
        <SectionLabel>Derived Stats Preview</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Hit Points', value: hp, sub: `d${cls.hitDie} hit die` },
            { label: 'Armor Class', value: ac, sub: armorName || (species?.acBonus ? `incl. +${species.acBonus} ${species.name}` : '10 + DEX') },
            { label: 'Spell Save DC', value: 8 + prof + castMod, sub: cls.spellAbility.toUpperCase() },
            { label: 'Spell Attack', value: formatMod(prof + castMod) },
            { label: 'Prof. Bonus', value: `+${prof}` },
            { label: 'Speed', value: `${species?.speed ?? 30} ft` },
          ].map(s => (
            <div key={s.label} className="bg-violet-950/40 border border-violet-800/30 rounded-xl px-4 py-2.5 text-center min-w-[92px]">
              <p className="text-xl font-bold text-white tabular-nums">{s.value}</p>
              <p className="text-[9px] uppercase tracking-widest text-violet-400/50 font-bold mt-0.5">{s.label}</p>
              {s.sub && <p className="text-[9px] text-violet-500/40">{s.sub}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Spells ────────────────────────────────────────────────────────────

function SpellRow({ spell, picked, disabled, onToggle }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-xl border transition-all ${
      picked ? 'bg-violet-900/30 border-violet-500/50' : 'bg-violet-950/25 border-violet-900/25'
    }`}>
      <div className="flex items-center gap-3 px-4 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled && !picked}
          className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center text-[11px] font-bold transition-all ${
            picked
              ? 'bg-violet-600 border-violet-400 text-white'
              : disabled
                ? 'border-violet-900/40 text-transparent cursor-not-allowed'
                : 'border-violet-700/50 text-transparent hover:border-violet-500/70'
          }`}
        >
          ✓
        </button>
        <button type="button" className="flex-1 min-w-0 text-left" onClick={() => setOpen(o => !o)}>
          <p className="text-sm font-semibold text-white truncate">
            {spell.name}
            {spell.concentration && <span className="ml-1.5 text-[9px] bg-amber-900/40 border border-amber-700/40 text-amber-300 px-1.5 py-0.5 rounded uppercase">Conc</span>}
            {spell.ritual && <span className="ml-1.5 text-[9px] bg-blue-900/40 border border-blue-700/40 text-blue-300 px-1.5 py-0.5 rounded uppercase">Ritual</span>}
          </p>
          <p className="text-[11px] text-violet-400/50">{spell.school} · {spell.castTime} · {spell.range}</p>
        </button>
        <button type="button" onClick={() => setOpen(o => !o)} className="text-violet-500/50 hover:text-violet-300 text-xs flex-shrink-0">
          {open ? '▲' : '▼'}
        </button>
      </div>
      {open && (
        <div className="px-4 pb-3 -mt-0.5">
          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{spell.description}</p>
          {spell.atHigherLevels && (
            <p className="text-xs text-amber-200/70 leading-relaxed mt-2">
              <span className="font-bold uppercase text-[10px] tracking-wider">At higher levels: </span>
              {spell.atHigherLevels}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function StepSpells({ draft, set }) {
  const [search, setSearch] = useState('')
  const [lvlFilter, setLvlFilter] = useState('all')

  const cls = draftClass(draft)
  const isSorcerer = draft.classId === 'sorcerer'
  const classSpells = spellListFor(draft.classId)
  const cMax = draftCantripMax(draft)
  const sMax = draftSpellMax(draft)
  const maxLvl = draftMaxSpellLevel(draft)
  const isPrepared = cls.spellsKnownType === 'prepared'

  const cantripList = useMemo(() => classSpells.filter(s => s.level === 0), [classSpells])
  const spellList = useMemo(
    () => classSpells.filter(s => s.level >= 1 && s.level <= maxLvl && (!isSorcerer || !LUNAR_GRANTED.has(s.name))),
    [classSpells, maxLvl, isSorcerer],
  )

  const q = search.trim().toLowerCase()
  const visibleCantrips = cantripList.filter(s => !q || s.name.toLowerCase().includes(q))
  const visibleSpells = spellList.filter(s => {
    if (q && !s.name.toLowerCase().includes(q)) return false
    if (lvlFilter !== 'all' && s.level !== Number(lvlFilter)) return false
    return true
  })

  function toggleCantrip(name) {
    set({
      cantrips: draft.cantrips.includes(name)
        ? draft.cantrips.filter(n => n !== name)
        : draft.cantrips.length < cMax ? [...draft.cantrips, name] : draft.cantrips,
    })
  }
  function toggleSpell(name) {
    set({
      spells: draft.spells.includes(name)
        ? draft.spells.filter(n => n !== name)
        : draft.spells.length < sMax ? [...draft.spells, name] : draft.spells,
    })
  }

  return (
    <div className="space-y-6">
      {/* Lunar freebies callout — sorcerer only */}
      {isSorcerer && (
        <div className="rounded-xl border border-amber-700/30 bg-amber-900/15 p-4">
          <p className="text-xs text-amber-200/90 font-semibold mb-1">🌕 Lunar Sorcery bonus spells — always prepared, free of charge</p>
          <p className="text-[11px] text-amber-200/60 leading-relaxed">
            {Object.entries(LUNAR_PHASES).map(([k, p]) => `${PHASE_ICONS[k]} ${p.bonusSpells.join(', ')}`).join('  ·  ')}
          </p>
          <p className="text-[11px] text-amber-200/50 mt-1">They don't count against your spells known, so they're not listed below.</p>
        </div>
      )}
      {isPrepared && (
        <div className="rounded-xl border border-violet-800/30 bg-violet-950/30 p-4">
          <p className="text-xs text-violet-200/80 font-semibold mb-1">📖 {cls.name}s prepare spells</p>
          <p className="text-[11px] text-violet-300/55 leading-relaxed">
            Your limit is level + {cls.spellAbility.toUpperCase()} modifier ({sMax} right now) and you can swap your prepared list after any long rest — pick what you'd start the day with.
          </p>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex gap-2 flex-wrap items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search spells…"
          className="flex-1 min-w-[200px] bg-violet-950/50 border border-violet-800/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-violet-600/40 focus:outline-none focus:border-violet-500/60"
        />
        <div className="flex gap-1.5">
          {['all', ...Array.from({ length: maxLvl }, (_, i) => String(i + 1))].map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setLvlFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                lvlFilter === f
                  ? 'bg-violet-800/40 border-violet-500/50 text-white'
                  : 'bg-violet-950/30 border-violet-900/30 text-violet-300/60 hover:border-violet-600/50'
              }`}
            >
              {f === 'all' ? 'All' : `Lvl ${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* Cantrips */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <SectionLabel>Cantrips</SectionLabel>
          <CountChip current={draft.cantrips.length} max={cMax} label="cantrips" />
        </div>
        <div className="space-y-1.5">
          {visibleCantrips.map(sp => (
            <SpellRow
              key={sp.name}
              spell={sp}
              picked={draft.cantrips.includes(sp.name)}
              disabled={draft.cantrips.length >= cMax}
              onToggle={() => toggleCantrip(sp.name)}
            />
          ))}
          {visibleCantrips.length === 0 && <p className="text-xs text-violet-500/50 italic py-3 text-center">No cantrips match your search.</p>}
        </div>
      </div>

      {/* Levelled spells */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <SectionLabel>Spells {isPrepared ? 'Prepared' : 'Known'} <span className="normal-case tracking-normal text-violet-500/40">(up to level {maxLvl})</span></SectionLabel>
          <CountChip current={draft.spells.length} max={sMax} label="spells" />
        </div>
        <div className="space-y-1.5">
          {visibleSpells.map(sp => (
            <SpellRow
              key={sp.name}
              spell={sp}
              picked={draft.spells.includes(sp.name)}
              disabled={draft.spells.length >= sMax}
              onToggle={() => toggleSpell(sp.name)}
            />
          ))}
          {visibleSpells.length === 0 && <p className="text-xs text-violet-500/50 italic py-3 text-center">No spells match your filters.</p>}
        </div>
      </div>
    </div>
  )
}

// ── Step 4: Equipment ─────────────────────────────────────────────────────────

function StepEquipment({ draft, set }) {
  const cls = draftClass(draft)
  const kit = cls.kit
  const goldRoll = kit.goldRoll

  function rollGold() {
    const rolls = Array.from({ length: goldRoll.dice }, () => Math.floor(Math.random() * goldRoll.sides) + 1)
    const total = rolls.reduce((a, b) => a + b, 0) * goldRoll.multiplier
    set({ goldRolled: { rolls, total } })
  }

  const radioGroup = (label, options, field, render) => (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(opt => (
          <PickCard key={opt.id} selected={draft[field] === opt.id} onClick={() => set({ [field]: opt.id })}>
            {render(opt)}
          </PickCard>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PickCard selected={draft.equipMode === 'kit'} onClick={() => set({ equipMode: 'kit' })}>
          <p className="font-semibold text-white">🎒 Take the starting kit</p>
          <p className="text-[11px] text-violet-300/50 mt-1">The standard {cls.name.toLowerCase()} loadout — weapon, focus, pack{kit.armor ? ', armor' : ''}.</p>
        </PickCard>
        <PickCard selected={draft.equipMode === 'gold'} onClick={() => set({ equipMode: 'gold' })}>
          <p className="font-semibold text-white">💰 Roll for gold instead</p>
          <p className="text-[11px] text-violet-300/50 mt-1">Roll {goldRoll.dice}d{goldRoll.sides} × {goldRoll.multiplier} gp and buy your own gear (avg. {Math.round(goldRoll.dice * (goldRoll.sides + 1) / 2) * goldRoll.multiplier} gp).</p>
        </PickCard>
      </div>

      {draft.equipMode === 'kit' ? (
        <div className="card p-5 space-y-5">
          {radioGroup('Weapon', kit.weaponOptions, 'weaponChoice', opt => (
            <>
              <p className="font-semibold text-sm text-white">{opt.name}</p>
              <p className="text-[11px] text-violet-300/50 mt-0.5">{opt.die} {opt.type}{opt.notes ? ` · ${opt.notes}` : ''}</p>
            </>
          ))}
          {radioGroup('Spellcasting Focus', kit.focusOptions, 'focusChoice', opt => (
            <>
              <p className="font-semibold text-sm text-white">{opt.name}</p>
              <p className="text-[11px] text-violet-300/50 mt-0.5">{opt.description}</p>
            </>
          ))}
          {radioGroup('Adventuring Pack', kit.packOptions, 'packChoice', opt => (
            <>
              <p className="font-semibold text-sm text-white">{opt.name}</p>
              <p className="text-[11px] text-violet-300/50 mt-0.5">{opt.contents}</p>
            </>
          ))}
          {kit.fixedItems.length > 0 && (
            <p className="text-[11px] text-violet-500/50 italic">
              Also included: {kit.fixedItems.map(i => i.name).join(', ')}.
            </p>
          )}
        </div>
      ) : (
        <div className="card p-5 text-center space-y-4">
          {draft.goldRolled ? (
            <>
              <div className="flex justify-center gap-2">
                {draft.goldRolled.rolls.map((r, i) => (
                  <span key={i} className="w-12 h-12 rounded-xl border-2 border-amber-600/50 bg-amber-900/25 flex items-center justify-center text-xl font-bold text-amber-200">{r}</span>
                ))}
                <span className="w-12 h-12 flex items-center justify-center text-violet-400/60 text-lg">×{goldRoll.multiplier}</span>
              </div>
              <p className="text-3xl font-bold text-amber-300" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>{draft.goldRolled.total} gp</p>
              <button type="button" onClick={rollGold} className="text-xs text-violet-400/60 hover:text-violet-200 underline underline-offset-2">Re-roll</button>
            </>
          ) : (
            <button
              type="button"
              onClick={rollGold}
              className="px-6 py-3 rounded-xl bg-amber-700/40 border border-amber-500/50 text-amber-100 font-semibold hover:bg-amber-600/50 transition-all shadow-[0_0_12px_rgba(251,191,36,0.15)]"
            >
              🎲 Roll {goldRoll.dice}d{goldRoll.sides} × {goldRoll.multiplier} gp
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Step 5: Review ────────────────────────────────────────────────────────────

function StepReview({ draft }) {
  const problem = validateAll(draft)
  const cfg = buildFinal(draft)
  const cls = draftClass(draft)
  const conMod = abilityMod(cfg.abilityScores.con)
  const castMod = abilityMod(cfg.abilityScores[cls.spellAbility] ?? 10)
  const prof = getProfBonus(cfg.level)
  const hp = classMaxHp(cfg.characterClass, cfg.level, conMod)
  const slots = classSlotMax(cfg.characterClass, cfg.level)
  const slotStr = Object.entries(slots).filter(([, n]) => n > 0).map(([l, n]) => `L${l}×${n}`).join(' · ')
    + (cls.casterType === 'pact' ? ' (short-rest recharge)' : '')

  return (
    <div className="space-y-6">
      {problem && (
        <div className="rounded-xl border border-rose-700/40 bg-rose-950/30 p-4">
          <p className="text-sm font-semibold text-rose-300 mb-1">Not quite finished — fix the {STEPS[problem.step]} step:</p>
          {problem.errors.map((e, i) => <p key={i} className="text-xs text-rose-300/80">• {e}</p>)}
        </div>
      )}

      <div className="card p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
              {cfg.characterName || 'Unnamed Hero'}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              <span className="text-violet-300">{cfg.species}</span>
              <span className="text-violet-500/50 mx-1.5">·</span>
              <span className="text-violet-200">{cls.name}</span>
              {cls.subclassShort && <span className="text-slate-500 text-xs"> ({cls.subclassShort})</span>}
              <span className="text-violet-500/50 mx-1.5">·</span>
              <span className="text-amber-300/80">Level {cfg.level}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{cfg.background} Background</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'HP', value: hp }, { label: 'AC', value: cfg.ac },
              { label: 'Speed', value: cfg.speed }, { label: 'Save DC', value: 8 + prof + castMod },
              { label: 'Spell Atk', value: formatMod(prof + castMod) },
            ].map(s => (
              <div key={s.label} className="bg-violet-950/40 border border-violet-800/30 rounded-xl px-3 py-2 text-center min-w-[64px]">
                <p className="text-lg font-bold text-white tabular-nums">{s.value}</p>
                <p className="text-[9px] uppercase tracking-widest text-violet-400/50 font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <SectionLabel>Ability Scores</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {ABILITY_KEYS.map(k => (
              <div key={k} className="bg-violet-950/30 border border-violet-900/25 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-violet-400/50 font-bold">{k}</p>
                <p className="text-xl font-bold text-white tabular-nums">{cfg.abilityScores[k]}</p>
                <p className="text-xs text-violet-300/60">{formatMod(abilityMod(cfg.abilityScores[k]))}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <div>
            <SectionLabel>Skill Proficiencies</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(cfg.skillProfs).sort().map(s => (
                <span key={s} className="text-xs bg-violet-900/30 border border-violet-800/30 text-violet-200/80 px-2.5 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Languages</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {cfg.languages.map(l => (
                <span key={l} className="text-xs bg-violet-900/30 border border-violet-800/30 text-violet-200/80 px-2.5 py-1 rounded-full">{l}</span>
              ))}
            </div>
          </div>
          {cfg.chosenMetamagic.length > 0 && (
            <div>
              <SectionLabel>Metamagic</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {cfg.chosenMetamagic.map(m => (
                  <span key={m} className="text-xs bg-amber-900/25 border border-amber-700/30 text-amber-200/80 px-2.5 py-1 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <SectionLabel>Spells</SectionLabel>
          <p className="text-[11px] text-violet-400/50 mb-2">Slots: {slotStr}</p>
          <p className="text-xs text-violet-300/60 mb-1 font-semibold">Cantrips</p>
          <p className="text-xs text-slate-400 mb-3">{cfg.knownCantrips.join(', ') || '—'}</p>
          <p className="text-xs text-violet-300/60 mb-1 font-semibold">Known Spells</p>
          <p className="text-xs text-slate-400">{cfg.knownSpells.join(', ') || '—'}</p>
        </div>

        <div className="card p-5">
          <SectionLabel>Equipment & Gold</SectionLabel>
          <ul className="space-y-1 mb-3">
            {cfg.equipment.map((e, i) => (
              <li key={i} className="text-xs text-slate-400">✦ {e.name}{e.description ? ` — ${e.description}` : ''}</li>
            ))}
          </ul>
          <p className="text-xs text-amber-300/80 font-semibold">{cfg.currency.gp} gp</p>
          <div className="mt-3 pt-3 border-t border-violet-900/30">
            <SectionLabel>Attacks</SectionLabel>
            {cfg.weapons.map((w, i) => (
              <p key={i} className="text-xs text-slate-400">⚔ {w.name} <span className="text-violet-300/60">{w.atkBonus}</span> · {w.damage}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Wizard shell ──────────────────────────────────────────────────────────────

export default function CreatePage() {
  const navigate = useNavigate()
  const { characters, addCharacter } = useCharactersList()
  const [draft, setDraft] = useState(loadDraft)
  const [step, setStep] = useState(0)
  const [maxVisited, setMaxVisited] = useState(0)
  const [showErrors, setShowErrors] = useState(false)

  // autosave draft
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)) } catch {}
  }, [draft])

  const set = (patch) => setDraft(d => ({ ...d, ...patch }))

  const errors = validateStep(step, draft)
  const isLast = step === STEPS.length - 1

  function goTo(i) {
    if (i <= maxVisited) { setStep(i); setShowErrors(false) }
  }

  function next() {
    if (errors.length) { setShowErrors(true); return }
    const n = Math.min(STEPS.length - 1, step + 1)
    setStep(n)
    setMaxVisited(m => Math.max(m, n))
    setShowErrors(false)
    window.scrollTo({ top: 0 })
  }

  function back() {
    setStep(s => Math.max(0, s - 1))
    setShowErrors(false)
    window.scrollTo({ top: 0 })
  }

  function handleCreate() {
    const problem = validateAll(draft)
    if (problem) {
      setStep(problem.step)
      setShowErrors(true)
      window.scrollTo({ top: 0 })
      return
    }
    const cfg = buildFinal(draft)
    const cls = draftClass(draft)
    const id = generateCharacterId(cfg.characterName, characters.map(c => c.id))
    const state = createCharacterState(cfg)
    persistNewCharacter(id, state)
    addCharacter({
      id,
      name: cfg.characterName,
      race: cfg.species,
      characterClass: cls.subclassShort ? `${cls.name} (${cls.subclassShort})` : cls.name,
      accent: draft.accent,
    })
    try { localStorage.removeItem(DRAFT_KEY) } catch {}
    navigate(`/${id}`)
  }

  function handleCancel() {
    if (window.confirm('Discard this character draft?')) {
      try { localStorage.removeItem(DRAFT_KEY) } catch {}
      navigate('/')
    }
  }

  const stepBody = [
    <StepIdentity key="s0" draft={draft} set={set} />,
    <StepClass key="s1" draft={draft} set={set} />,
    <StepAbilities key="s2" draft={draft} set={set} />,
    <StepSpells key="s3" draft={draft} set={set} />,
    <StepEquipment key="s4" draft={draft} set={set} />,
    <StepReview key="s5" draft={draft} />,
  ][step]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <Link to="/" className="text-xs text-violet-400/60 hover:text-violet-200 transition-colors">← Characters</Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
            ✦ Create a Character
          </h1>
        </div>
        <button onClick={handleCancel} className="text-xs text-violet-500/60 hover:text-rose-400 transition-colors">
          Discard draft
        </button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {STEPS.map((label, i) => {
          const active = i === step
          const visited = i <= maxVisited
          return (
            <button
              key={label}
              type="button"
              onClick={() => goTo(i)}
              disabled={!visited}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? 'bg-violet-800/50 border border-violet-500/50 text-white'
                  : visited
                    ? 'text-violet-300/60 hover:text-violet-200 border border-transparent'
                    : 'text-violet-700/40 border border-transparent cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                active ? 'border-violet-400 bg-violet-700/60 text-white'
                       : visited ? 'border-violet-600/50 text-violet-300/70' : 'border-violet-900/40 text-violet-700/40'
              }`}>
                {i + 1}
              </span>
              {label}
            </button>
          )
        })}
      </div>

      {/* Step content */}
      {stepBody}

      {/* Sticky footer nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#07091a]/90 border-t border-violet-900/40" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="px-4 py-2 rounded-xl border border-violet-800/40 bg-violet-950/40 text-violet-200 text-sm font-semibold disabled:opacity-30 hover:bg-violet-900/40 transition-colors"
          >
            ← Back
          </button>

          <div className="flex-1 min-w-0">
            {showErrors && errors.length > 0 && (
              <p className="text-xs text-rose-400 truncate">{errors[0]}</p>
            )}
            {!showErrors && errors.length > 0 && !isLast && (
              <p className="text-xs text-violet-500/50 truncate">{errors[0]}</p>
            )}
          </div>

          {isLast ? (
            <button
              type="button"
              onClick={handleCreate}
              disabled={!!validateAll(draft)}
              className="px-6 py-2.5 rounded-xl bg-violet-700/70 border border-violet-500/60 text-white font-bold text-sm hover:bg-violet-600/80 transition-all shadow-[0_0_16px_rgba(139,92,246,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✦ Create {draft.name.trim() || 'Character'}
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className={`px-6 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                errors.length
                  ? 'bg-violet-950/40 border-violet-900/40 text-violet-500/50'
                  : 'bg-violet-700/70 border-violet-500/60 text-white hover:bg-violet-600/80 shadow-[0_0_16px_rgba(139,92,246,0.3)]'
              }`}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
