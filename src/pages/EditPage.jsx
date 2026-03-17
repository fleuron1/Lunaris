import { useState, useMemo } from 'react'
import spellsData from '../data/sorcerer-spells.json'
import metamagicData from '../data/metamagic.json'
import featsData from '../data/feats.json'
import { SKILLS } from '../data/annabelle.js'
import {
  SPELL_SLOTS_TABLE, LEVEL_FEATURES, CANTRIPS_KNOWN, SPELLS_KNOWN,
  SORCERY_POINTS, XP_THRESHOLDS, maxMetamagic, getProfBonus,
} from '../data/sorcerer-progression.js'

const ABILITY_NAMES = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }
const ABILITY_FULL  = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' }

function mod(score) { return Math.floor((score - 10) / 2) }
function fmtMod(n) { return n >= 0 ? `+${n}` : `${n}` }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

// ── Tab: Level & XP ──────────────────────────────────────────────────────────

function LevelTab({ level, xp, setLevel, setXp }) {
  const [xpInput, setXpInput] = useState(String(xp))
  const nextXp = XP_THRESHOLDS[level] ?? null
  const currentXp = XP_THRESHOLDS[level - 1] ?? 0
  const xpPct = nextXp ? Math.min(100, Math.round(((xp - currentXp) / (nextXp - currentXp)) * 100)) : 100

  function applyXp() {
    const v = parseInt(xpInput, 10)
    if (!isNaN(v)) setXp(v)
  }

  const slots = SPELL_SLOTS_TABLE[level] || []

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="text-sm font-bold text-violet-300/60 uppercase tracking-widest mb-4">Character Level</h3>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setLevel(Math.max(1, level - 1))}
            className="btn-sm text-lg w-9 h-9"
            disabled={level <= 1}
          >−</button>
          <div className="flex-1 text-center">
            <span className="text-6xl font-bold text-violet-300">{level}</span>
            <p className="text-slate-400 text-sm mt-1">Lunar Sorcerer</p>
          </div>
          <button
            onClick={() => setLevel(Math.min(20, level + 1))}
            className="btn-sm text-lg w-9 h-9"
            disabled={level >= 20}
          >+</button>
        </div>

        {nextXp && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>XP: {xp.toLocaleString()}</span>
              <span>Next Level: {nextXp.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-violet-950/60 rounded-full overflow-hidden border border-violet-900/40">
              <div className="h-full bg-violet-500 transition-all" style={{ width: `${xpPct}%` }} />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={xpInput}
                onChange={e => setXpInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyXp()}
                className="input-field flex-1"
                placeholder="Set XP"
              />
              <button onClick={applyXp} className="btn-primary">Set</button>
            </div>
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="text-xs font-bold text-violet-300/50 uppercase tracking-widest mb-3">Stats at Level {level}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { label: 'Prof. Bonus',    value: `+${getProfBonus(level)}` },
            { label: 'Cantrips Known', value: CANTRIPS_KNOWN[level - 1] },
            { label: 'Spells Known',   value: SPELLS_KNOWN[level - 1] },
            { label: 'Sorcery Points', value: SORCERY_POINTS[level - 1] },
          ].map(({ label, value }) => (
            <div key={label} className="stat-box">
              <p className="text-2xl font-bold text-amber-300">{value}</p>
              <p className="text-xs text-violet-300/50 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs text-violet-300/50 uppercase tracking-wide font-bold mb-2">Spell Slots</p>
          <div className="flex flex-wrap gap-2">
            {slots.map((count, i) => count > 0 && (
              <div key={i} className="bg-violet-950/50 border border-violet-800/40 rounded-lg px-3 py-2 text-center">
                <p className="text-lg font-bold text-violet-300">{count}</p>
                <p className="text-xs text-violet-300/50">{['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'][i]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-xs font-bold text-violet-300/50 uppercase tracking-widest mb-3">Level Milestones</h3>
        <div className="space-y-1.5">
          {Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => {
            const features = LEVEL_FEATURES[lvl] || []
            const isCurrent = lvl === level
            const isPast = lvl < level
            return (
              <div
                key={lvl}
                className={`flex gap-3 items-start p-2.5 rounded-lg border transition-colors cursor-pointer
                  ${isCurrent
                    ? 'bg-violet-900/30 border-violet-600/50'
                    : isPast
                      ? 'border-violet-900/20 opacity-50'
                      : 'border-violet-900/25 hover:border-violet-700/40'}`}
                onClick={() => setLevel(lvl)}
              >
                <span className={`text-sm font-bold w-6 flex-shrink-0 ${isCurrent ? 'text-violet-300' : 'text-slate-500'}`}>
                  {lvl}
                </span>
                <div className="flex-1 min-w-0">
                  {features.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {features.map(f => (
                        <span key={f} className={`text-xs px-2 py-0.5 rounded border
                          ${isCurrent ? 'bg-violet-900/40 border-violet-600/50 text-violet-200' : 'bg-violet-950/30 border-violet-900/30 text-slate-400'}`}
                        >{f}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </div>
                <span className="text-xs text-slate-600 flex-shrink-0">{XP_THRESHOLDS[lvl - 1]?.toLocaleString()}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Spells ───────────────────────────────────────────────────────────────

const SCHOOL_COLORS = {
  Abjuration: 'text-blue-400', Conjuration: 'text-green-400', Divination: 'text-cyan-400',
  Enchantment: 'text-pink-400', Illusion: 'text-purple-400', Necromancy: 'text-red-400',
  Transmutation: 'text-yellow-400', Evocation: 'text-orange-400',
}

function SpellsTab({ level, knownSpells, knownCantrips, toggleKnownSpell, resetSpells }) {
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterKnown, setFilterKnown] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const maxSpellLevel = SPELL_SLOTS_TABLE[level]?.findLastIndex(n => n > 0) + 1 || 2
  const cantripMax = CANTRIPS_KNOWN[level - 1]
  const spellMax = SPELLS_KNOWN[level - 1]
  const cantripsFull = knownCantrips.length >= cantripMax
  const spellsFull = knownSpells.length >= spellMax

  const filtered = useMemo(() => {
    return spellsData.filter(s => {
      // Always restrict to spells accessible at current level
      if (s.level !== 0 && s.level > maxSpellLevel) return false
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filterLevel !== 'all') {
        const fl = filterLevel === 'C' ? 0 : parseInt(filterLevel)
        if (s.level !== fl) return false
      }
      if (filterKnown) {
        const isCantrip = s.level === 0
        if (isCantrip && !knownCantrips.includes(s.name)) return false
        if (!isCantrip && !knownSpells.includes(s.name)) return false
      }
      return true
    })
  }, [search, filterLevel, filterKnown, knownSpells, knownCantrips, maxSpellLevel])

  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(s => {
      const key = s.level === 0 ? 'C' : s.level
      if (!g[key]) g[key] = []
      g[key].push(s)
    })
    return g
  }, [filtered])

  const levelOrder = ['C', ...Array.from({ length: maxSpellLevel }, (_, i) => i + 1)]
  const LEVEL_LABEL = { C: 'Cantrips', 1:'1st Level',2:'2nd Level',3:'3rd Level',4:'4th Level',5:'5th Level',6:'6th Level',7:'7th Level',8:'8th Level',9:'9th Level' }

  function handleReset() {
    if (confirmReset) { resetSpells(); setConfirmReset(false) }
    else setConfirmReset(true)
  }

  return (
    <div className="space-y-4">
      {/* Lunar bonus note */}
      <div className="flex items-center gap-2 bg-violet-950/40 border border-violet-800/30 rounded-lg px-3 py-2 text-xs text-violet-300/60">
        <span>🌙</span>
        <span>Lunar bonus spells (Cure Wounds, Moonbeam, etc.) are always prepared by your subclass and don't count here.</span>
      </div>

      {/* Counts + reset */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`stat-box ${cantripsFull ? 'border-amber-600/40' : ''}`}>
          <p className={`text-2xl font-bold ${cantripsFull ? 'text-amber-400' : 'text-emerald-400'}`}>
            {knownCantrips.length} <span className="text-slate-500 text-lg">/ {cantripMax}</span>
          </p>
          <p className="text-xs text-violet-300/50 mt-1">Cantrips Known</p>
          {cantripsFull && <p className="text-[10px] text-amber-400/70 mt-0.5">Full — remove one to swap</p>}
        </div>
        <div className={`stat-box ${spellsFull ? 'border-amber-600/40' : ''}`}>
          <p className={`text-2xl font-bold ${spellsFull ? 'text-amber-400' : 'text-violet-400'}`}>
            {knownSpells.length} <span className="text-slate-500 text-lg">/ {spellMax}</span>
          </p>
          <p className="text-xs text-violet-300/50 mt-1">Spells Known</p>
          {spellsFull && <p className="text-[10px] text-amber-400/70 mt-0.5">Full — remove one to swap</p>}
        </div>
      </div>

      {/* Filters + reset */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search spells..."
          className="input-field flex-1 min-w-40"
        />
        <select
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value)}
          className="input-field"
        >
          <option value="all">All Levels</option>
          <option value="C">Cantrips</option>
          {Array.from({ length: maxSpellLevel }, (_, i) => (
            <option key={i+1} value={i+1}>{['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'][i]} Level</option>
          ))}
        </select>
        <button
          onClick={() => setFilterKnown(v => !v)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${filterKnown ? 'bg-violet-700 border-violet-600 text-white' : 'btn-secondary'}`}
        >
          Known Only
        </button>
        <button
          onClick={handleReset}
          onBlur={() => setConfirmReset(false)}
          className={confirmReset ? 'btn-danger' : 'btn-secondary'}
        >
          {confirmReset ? '⚠ Confirm Reset?' : 'Reset'}
        </button>
      </div>

      <div className="space-y-4">
        {levelOrder.map(lvl => {
          const spells = grouped[lvl]
          if (!spells || spells.length === 0) return null
          return (
            <div key={lvl}>
              <h3 className="text-[10px] font-bold text-violet-300/50 uppercase tracking-widest mb-2">✦ {LEVEL_LABEL[lvl]}</h3>
              <div className="space-y-1">
                {spells.map(spell => {
                  const isCantrip = spell.level === 0
                  const known = isCantrip ? knownCantrips.includes(spell.name) : knownSpells.includes(spell.name)
                  const atCap = !known && (isCantrip ? cantripsFull : spellsFull)
                  const schoolColor = SCHOOL_COLORS[spell.school] || 'text-slate-400'
                  return (
                    <button
                      key={spell.name}
                      onClick={() => !atCap && toggleKnownSpell(spell.name, isCantrip)}
                      disabled={atCap}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all
                        ${known
                          ? 'bg-violet-900/30 border-violet-600/50'
                          : atCap
                            ? 'opacity-35 border-violet-900/20 cursor-not-allowed'
                            : 'bg-violet-950/20 border-violet-900/25 hover:border-violet-700/40'}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
                        ${known ? 'bg-violet-500 border-violet-400' : 'border-violet-800/50'}`}>
                        {known && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-200">{spell.name}</span>
                          <span className={`text-xs ${schoolColor}`}>{spell.school}</span>
                          {spell.concentration && <span className="text-xs bg-amber-900/30 border border-amber-700/40 text-amber-300 px-1.5 py-0.5 rounded">Conc</span>}
                          {spell.ritual && <span className="text-xs bg-violet-950/40 border border-violet-800/40 text-violet-400/60 px-1.5 py-0.5 rounded">Ritual</span>}
                          {spell.material && <span className="text-xs bg-violet-950/40 border border-violet-800/40 text-violet-400/60 px-1.5 py-0.5 rounded">M</span>}
                          <span className="text-xs text-slate-600 ml-auto">{spell.source}</span>
                        </div>
                        <div className="flex gap-3 text-xs text-violet-300/40 mt-0.5">
                          <span>{spell.castTime}</span>
                          <span>{spell.range}</span>
                        </div>
                        {spell.description && (
                          <p className="text-xs text-slate-400/70 mt-1 line-clamp-2">{spell.description}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">No spells match your filters.</p>
        )}
      </div>
    </div>
  )
}

// ── Tab: Metamagic ───────────────────────────────────────────────────────────

function MetamagicTab({ level, chosenMetamagic, toggleMetamagic }) {
  const max = maxMetamagic(level)
  if (level < 3) {
    return <p className="text-slate-400 text-sm p-4">Metamagic is unlocked at Level 3.</p>
  }
  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-200">Metamagic Options</p>
          <p className="text-xs text-violet-300/50 mt-0.5">Choose {max} options at level {level}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-violet-300">{chosenMetamagic.length} <span className="text-slate-500 text-xl">/ {max}</span></p>
          <p className="text-xs text-violet-300/50">chosen</p>
        </div>
      </div>

      <div className="space-y-2">
        {metamagicData.map(mm => {
          const chosen = chosenMetamagic.includes(mm.name)
          const atMax = !chosen && chosenMetamagic.length >= max
          return (
            <button
              key={mm.name}
              onClick={() => !atMax && toggleMetamagic(mm.name)}
              disabled={atMax}
              className={`w-full text-left p-4 rounded-xl border transition-all
                ${chosen ? 'bg-violet-900/30 border-violet-600/50' : atMax ? 'opacity-40 border-violet-900/25 cursor-not-allowed' : 'bg-violet-950/20 border-violet-900/25 hover:border-violet-700/40'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
                  ${chosen ? 'bg-violet-500 border-violet-400' : 'border-violet-800/50'}`}>
                  {chosen && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-200">{mm.name}</span>
                    {mm.spCost > 0 && (
                      <span className="text-xs bg-violet-900/40 border border-violet-700/50 text-violet-300 px-1.5 py-0.5 rounded">
                        {mm.spCost} SP
                      </span>
                    )}
                    <span className="text-xs text-slate-500">{mm.source}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mm.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Tab: Ability Scores ──────────────────────────────────────────────────────

function AbilitiesTab({ abilityScores, setAbilityScore, profBonus }) {
  const SAVE_PROFS = ['con', 'cha']

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="text-xs font-bold text-violet-300/50 uppercase tracking-widest mb-4">Ability Scores</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(abilityScores).map(([key, score]) => {
            const m = mod(score)
            const saveProf = SAVE_PROFS.includes(key)
            const saveBonus = saveProf ? m + profBonus : m
            return (
              <div key={key} className="bg-violet-950/30 border border-violet-900/30 rounded-xl p-4 text-center space-y-2">
                <p className="text-xs font-bold text-violet-300/50 uppercase tracking-widest">{ABILITY_FULL[key]}</p>
                <div className={`text-4xl font-bold ${m >= 0 ? 'text-amber-300' : 'text-red-400'}`}>
                  {fmtMod(m)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setAbilityScore(key, score - 1)}
                    className="btn-sm w-6 h-6 text-sm"
                  >−</button>
                  <input
                    type="number"
                    value={score}
                    onChange={e => {
                      const v = parseInt(e.target.value, 10)
                      if (!isNaN(v)) setAbilityScore(key, v)
                    }}
                    className="w-12 text-center bg-[#0c1030] border border-violet-900/40 rounded px-1 py-0.5 text-sm font-bold focus:outline-none focus:border-violet-500/50 text-slate-100"
                    min="1" max="30"
                  />
                  <button
                    onClick={() => setAbilityScore(key, score + 1)}
                    className="btn-sm w-6 h-6 text-sm"
                  >+</button>
                </div>
                <div className="text-xs text-violet-300/40 border-t border-violet-900/30 pt-2">
                  Save: <span className={`font-bold ${saveProf ? 'text-violet-300' : 'text-slate-400'}`}>
                    {saveProf && '● '}{fmtMod(saveBonus)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-xs font-bold text-violet-300/50 uppercase tracking-widest mb-2">Reference</h3>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
          <div>
            <p className="font-semibold text-slate-300 mb-1">Standard Array</p>
            <p>15, 14, 13, 12, 10, 8</p>
          </div>
          <div>
            <p className="font-semibold text-slate-300 mb-1">Point Buy Budget</p>
            <p>27 points (score 8–15)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Combat ──────────────────────────────────────────────────────────────

function CombatTab({ ac, speed, setAc, setSpeed, weapons, addWeapon, updateWeapon, removeWeapon }) {
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [addingNew, setAddingNew] = useState(false)
  const [newWeapon, setNewWeapon] = useState({ name: '', atkBonus: '', damage: '', notes: '' })

  function startEdit(w) {
    setEditingId(w.id)
    setEditData({ name: w.name, atkBonus: w.atkBonus, damage: w.damage, notes: w.notes })
  }

  function saveEdit(id) {
    updateWeapon(id, editData)
    setEditingId(null)
  }

  function submitNew() {
    if (!newWeapon.name.trim()) return
    addWeapon(newWeapon)
    setNewWeapon({ name: '', atkBonus: '', damage: '', notes: '' })
    setAddingNew(false)
  }

  return (
    <div className="space-y-4">
      {/* AC + Speed */}
      <div className="card p-4">
        <h3 className="text-xs font-bold text-violet-300/50 uppercase tracking-widest mb-3">Combat Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-violet-300/50 uppercase tracking-wider block mb-1.5">Armor Class</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setAc(ac - 1)} className="btn-sm">−</button>
              <input
                type="number"
                value={ac}
                onChange={e => setAc(Number(e.target.value))}
                className="input-field w-20 text-center text-lg font-bold"
              />
              <button onClick={() => setAc(ac + 1)} className="btn-sm">+</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-violet-300/50 uppercase tracking-wider block mb-1.5">Speed (ft)</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setSpeed(speed - 5)} className="btn-sm">−</button>
              <input
                type="number"
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="input-field w-20 text-center text-lg font-bold"
              />
              <button onClick={() => setSpeed(speed + 5)} className="btn-sm">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Weapons */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-violet-300/50 uppercase tracking-widest">Weapons & Attacks</h3>
          <button onClick={() => setAddingNew(true)} className="btn-primary text-xs py-1 px-3">+ Add</button>
        </div>

        <div className="space-y-2">
          {weapons.map(w => (
            <div key={w.id} className="bg-violet-950/30 border border-violet-900/25 rounded-lg p-3">
              {editingId === w.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={editData.name}
                      onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                      className="input-field text-sm"
                      placeholder="Name"
                    />
                    <input
                      value={editData.atkBonus}
                      onChange={e => setEditData(d => ({ ...d, atkBonus: e.target.value }))}
                      className="input-field text-sm"
                      placeholder="Atk Bonus (e.g. +6)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={editData.damage}
                      onChange={e => setEditData(d => ({ ...d, damage: e.target.value }))}
                      className="input-field text-sm"
                      placeholder="Damage (e.g. 1d8 fire)"
                    />
                    <input
                      value={editData.notes}
                      onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))}
                      className="input-field text-sm"
                      placeholder="Notes"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="btn-secondary text-xs py-1 px-3">Cancel</button>
                    <button onClick={() => saveEdit(w.id)} className="btn-primary text-xs py-1 px-3">Save</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-200">{w.name}</span>
                      <span className="font-mono text-amber-300 text-sm">{w.atkBonus}</span>
                      <span className="text-slate-300 text-xs">{w.damage}</span>
                    </div>
                    {w.notes && <p className="text-xs text-slate-500 mt-0.5">{w.notes}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(w)} className="btn-sm text-xs">✎</button>
                    <button onClick={() => removeWeapon(w.id)} className="btn-sm text-red-400 hover:text-red-300 text-xs">✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {addingNew && (
            <div className="bg-violet-950/30 border border-violet-600/30 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newWeapon.name}
                  onChange={e => setNewWeapon(d => ({ ...d, name: e.target.value }))}
                  className="input-field text-sm"
                  placeholder="Name"
                  autoFocus
                />
                <input
                  value={newWeapon.atkBonus}
                  onChange={e => setNewWeapon(d => ({ ...d, atkBonus: e.target.value }))}
                  className="input-field text-sm"
                  placeholder="Atk Bonus (e.g. +6)"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newWeapon.damage}
                  onChange={e => setNewWeapon(d => ({ ...d, damage: e.target.value }))}
                  className="input-field text-sm"
                  placeholder="Damage (e.g. 1d8 fire)"
                />
                <input
                  value={newWeapon.notes}
                  onChange={e => setNewWeapon(d => ({ ...d, notes: e.target.value }))}
                  className="input-field text-sm"
                  placeholder="Notes"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setAddingNew(false)} className="btn-secondary text-xs py-1 px-3">Cancel</button>
                <button onClick={submitNew} className="btn-primary text-xs py-1 px-3">Add Weapon</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Items ───────────────────────────────────────────────────────────────

function ItemsTab({ equipment, addEquipment, updateEquipment, removeEquipment }) {
  const [addingNew, setAddingNew] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', description: '', isMagic: false })
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  function startEdit(item) {
    setEditingId(item.id)
    setEditData({ name: item.name, description: item.description, isMagic: item.isMagic })
  }

  function saveEdit(id) {
    updateEquipment(id, editData)
    setEditingId(null)
  }

  function submitNew() {
    if (!newItem.name.trim()) return
    addEquipment(newItem)
    setNewItem({ name: '', description: '', isMagic: false })
    setAddingNew(false)
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-violet-300/50 uppercase tracking-widest">Equipment</h3>
        <button onClick={() => setAddingNew(true)} className="btn-primary text-xs py-1 px-3">+ Add</button>
      </div>

      <div className="space-y-2">
        {equipment.map(item => (
          <div key={item.id} className={`border rounded-lg p-3 transition-colors ${
            item.isMagic ? 'bg-amber-900/10 border-amber-800/30' : 'bg-violet-950/30 border-violet-900/25'
          }`}>
            {editingId === item.id ? (
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <input
                    value={editData.name}
                    onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                    className="input-field flex-1 text-sm"
                    placeholder="Item name"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-violet-300/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editData.isMagic}
                      onChange={e => setEditData(d => ({ ...d, isMagic: e.target.checked }))}
                      className="accent-amber-500"
                    />
                    Magic
                  </label>
                </div>
                <input
                  value={editData.description}
                  onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                  className="input-field w-full text-sm"
                  placeholder="Description (optional)"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="btn-secondary text-xs py-1 px-3">Cancel</button>
                  <button onClick={() => saveEdit(item.id)} className="btn-primary text-xs py-1 px-3">Save</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="text-xs mt-0.5 flex-shrink-0">{item.isMagic ? '✨' : '✦'}</span>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${item.isMagic ? 'text-amber-300/90' : 'text-slate-200'}`}>
                    {item.name}
                  </span>
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(item)} className="btn-sm text-xs">✎</button>
                  <button onClick={() => removeEquipment(item.id)} className="btn-sm text-red-400 hover:text-red-300 text-xs">✕</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {addingNew && (
          <div className="bg-violet-950/30 border border-violet-600/30 rounded-lg p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <input
                value={newItem.name}
                onChange={e => setNewItem(d => ({ ...d, name: e.target.value }))}
                className="input-field flex-1 text-sm"
                placeholder="Item name"
                autoFocus
              />
              <label className="flex items-center gap-1.5 text-xs text-violet-300/60 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newItem.isMagic}
                  onChange={e => setNewItem(d => ({ ...d, isMagic: e.target.checked }))}
                  className="accent-amber-500"
                />
                Magic
              </label>
            </div>
            <input
              value={newItem.description}
              onChange={e => setNewItem(d => ({ ...d, description: e.target.value }))}
              className="input-field w-full text-sm"
              placeholder="Description (optional)"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddingNew(false)} className="btn-secondary text-xs py-1 px-3">Cancel</button>
              <button onClick={submitNew} className="btn-primary text-xs py-1 px-3">Add Item</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab: Feats ───────────────────────────────────────────────────────────────

const FEAT_CAT = { G: 'General', O: 'Origin', FS: 'Fighting Style', EF: 'Epic Boon' }

function FeatsTab({ feats, toggleFeat }) {
  const [search, setSearch] = useState('')
  const [showChosen, setShowChosen] = useState(false)

  const filtered = useMemo(() => {
    return featsData.filter(f => {
      if (showChosen && !feats.includes(f.name)) return false
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) &&
          !f.description?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search, showChosen, feats])

  return (
    <div className="space-y-4">
      {/* Chosen feats summary */}
      {feats.length > 0 && (
        <div className="card p-4">
          <p className="section-header">Chosen Feats</p>
          <div className="flex flex-wrap gap-2">
            {feats.map(name => (
              <button
                key={name}
                onClick={() => toggleFeat(name)}
                className="bg-violet-900/40 border border-violet-600/50 text-violet-200 text-xs px-2.5 py-1 rounded-full hover:bg-red-900/30 hover:border-red-700/40 hover:text-red-300 transition-colors"
                title="Click to remove"
              >
                {name} ✕
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search feats..."
          className="input-field flex-1 min-w-40"
        />
        <button
          onClick={() => setShowChosen(v => !v)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${showChosen ? 'bg-violet-700 border-violet-600 text-white' : 'btn-secondary'}`}
        >
          Chosen Only
        </button>
      </div>

      {/* Feat list */}
      <div className="space-y-1.5">
        {filtered.map(feat => {
          const chosen = feats.includes(feat.name)
          return (
            <button
              key={feat.name}
              onClick={() => toggleFeat(feat.name)}
              className={`w-full text-left p-3 rounded-xl border transition-all
                ${chosen ? 'bg-violet-900/30 border-violet-600/50' : 'bg-violet-950/20 border-violet-900/25 hover:border-violet-700/40'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
                  ${chosen ? 'bg-violet-500 border-violet-400' : 'border-violet-800/50'}`}>
                  {chosen && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-200">{feat.name}</span>
                    {feat.category && (
                      <span className="text-[10px] bg-violet-950/40 border border-violet-800/40 text-violet-400/60 px-1.5 py-0.5 rounded-full">
                        {FEAT_CAT[feat.category] || feat.category}
                      </span>
                    )}
                    {feat.prerequisite && (
                      <span className="text-xs text-slate-500">Req: {feat.prerequisite}</span>
                    )}
                    <span className="text-xs text-slate-600 ml-auto">{feat.source}</span>
                  </div>
                  <p className="text-xs text-slate-400/70 mt-1 leading-relaxed line-clamp-2">{feat.description}</p>
                </div>
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">No feats match your search.</p>
        )}
      </div>
    </div>
  )
}

// ── Tab: Character ───────────────────────────────────────────────────────────

function CharacterTab({
  characterName, background, notes,
  setCharacterName, setBackground, setNotes,
  languages, addLanguage, removeLanguage,
  skillProfs, setSkillProf, profBonus, abilityScores,
}) {
  const [langInput, setLangInput] = useState('')

  function handleAddLang(e) {
    if (e.key === 'Enter' && langInput.trim()) {
      addLanguage(langInput.trim())
      setLangInput('')
    }
  }

  const profLevels = ['none', 'proficient', 'expert']
  const profColors = {
    none: 'bg-violet-900/40 border-violet-800/40',
    proficient: 'bg-violet-600 border-violet-500',
    expert: 'bg-amber-500 border-amber-400',
  }

  return (
    <div className="space-y-4">
      {/* Name + Background */}
      <div className="card p-4 space-y-3">
        <h3 className="text-xs font-bold text-violet-300/50 uppercase tracking-widest">Character Info</h3>
        <div>
          <label className="text-xs text-violet-300/50 uppercase tracking-wider block mb-1">Character Name</label>
          <input
            value={characterName}
            onChange={e => setCharacterName(e.target.value)}
            className="input-field w-full"
            placeholder="Character name"
          />
        </div>
        <div>
          <label className="text-xs text-violet-300/50 uppercase tracking-wider block mb-1">Background</label>
          <input
            value={background}
            onChange={e => setBackground(e.target.value)}
            className="input-field w-full"
            placeholder="Background"
          />
        </div>
        <div>
          <label className="text-xs text-violet-300/50 uppercase tracking-wider block mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input-field w-full min-h-[100px] resize-y"
            placeholder="Session notes, reminders, etc."
          />
        </div>
      </div>

      {/* Languages */}
      <div className="card p-4">
        <h3 className="text-xs font-bold text-violet-300/50 uppercase tracking-widest mb-3">Languages</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {languages.map(lang => (
            <span
              key={lang}
              className="group flex items-center gap-1 bg-violet-950/50 border border-violet-800/40 text-violet-300/80 text-xs px-2.5 py-1 rounded-full"
            >
              {lang}
              <button
                onClick={() => removeLanguage(lang)}
                className="text-violet-500/40 hover:text-red-400 transition-colors ml-0.5"
              >✕</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={langInput}
            onChange={e => setLangInput(e.target.value)}
            onKeyDown={handleAddLang}
            className="input-field flex-1"
            placeholder="Add language (press Enter)"
          />
          <button
            onClick={() => { if (langInput.trim()) { addLanguage(langInput.trim()); setLangInput('') } }}
            className="btn-primary"
          >Add</button>
        </div>
      </div>

      {/* Skill Proficiencies */}
      <div className="card p-4">
        <div className="flex items-end justify-between mb-3">
          <h3 className="text-xs font-bold text-violet-300/50 uppercase tracking-widest">Skill Proficiencies</h3>
          <div className="flex items-center gap-3 text-[10px] text-violet-300/40">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-900/60 border border-violet-800/40 inline-block" /> None</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-600 inline-block" /> Prof</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Expert</span>
          </div>
        </div>
        <div className="space-y-1">
          {SKILLS.map(skill => {
            const current = skillProfs?.[skill.name] ?? 'none'
            const abilMod = Math.floor((abilityScores[skill.ability] - 10) / 2)
            const bonus = current === 'expert'
              ? abilMod + profBonus * 2
              : current === 'proficient'
                ? abilMod + profBonus
                : abilMod
            const fmtB = bonus >= 0 ? `+${bonus}` : `${bonus}`

            function cycle() {
              const next = profLevels[(profLevels.indexOf(current) + 1) % profLevels.length]
              setSkillProf(skill.name, next)
            }

            return (
              <div key={skill.name} className="flex items-center gap-2 py-1 px-1 hover:bg-violet-900/10 rounded transition-colors">
                <button
                  onClick={cycle}
                  className={`w-4 h-4 rounded-full border flex-shrink-0 transition-all ${profColors[current]}`}
                  title={`Click to cycle: ${current} → next`}
                />
                <span className="text-[10px] text-violet-300/40 uppercase tracking-wider w-8 flex-shrink-0">
                  {skill.ability}
                </span>
                <span className="flex-1 text-slate-300 text-xs">{skill.name}</span>
                <span className={`font-bold tabular-nums text-xs ${
                  current === 'expert' ? 'text-amber-300' : current === 'proficient' ? 'text-violet-300' : 'text-slate-400'
                }`}>{fmtB}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main EditPage ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'level',     label: 'Level' },
  { id: 'spells',    label: 'Spells' },
  { id: 'metamagic', label: 'Metamagic' },
  { id: 'abilities', label: 'Abilities' },
  { id: 'combat',    label: 'Combat' },
  { id: 'items',     label: 'Items' },
  { id: 'feats',     label: 'Feats' },
  { id: 'character', label: 'Character' },
]

export default function EditPage({
  level, xp, abilityScores, knownSpells, knownCantrips, chosenMetamagic, profBonus,
  setLevel, setXp, setAbilityScore, toggleKnownSpell, resetSpells, toggleMetamagic,
  // New state
  ac, speed, setAc, setSpeed,
  weapons, addWeapon, updateWeapon, removeWeapon,
  equipment, addEquipment, updateEquipment, removeEquipment,
  feats, toggleFeat,
  languages, addLanguage, removeLanguage,
  skillProfs, setSkillProf,
  characterName, background, notes,
  setCharacterName, setBackground, setNotes,
}) {
  const [activeTab, setActiveTab] = useState('level')

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
          Character Builder
        </h2>
        <p className="text-violet-300/50 text-sm">{characterName || 'Annabelle'} · Lunar Sorcerer</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 bg-[#0c1030]/80 p-1 rounded-xl border border-violet-900/30 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-1.5 px-3 rounded-lg text-sm font-semibold transition-all
              ${activeTab === tab.id
                ? 'bg-violet-700 text-white shadow-[0_0_8px_rgba(139,92,246,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-violet-900/20'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'level' && (
        <LevelTab level={level} xp={xp} setLevel={setLevel} setXp={setXp} />
      )}
      {activeTab === 'spells' && (
        <SpellsTab
          level={level}
          knownSpells={knownSpells}
          knownCantrips={knownCantrips}
          toggleKnownSpell={toggleKnownSpell}
          resetSpells={resetSpells}
        />
      )}
      {activeTab === 'metamagic' && (
        <MetamagicTab level={level} chosenMetamagic={chosenMetamagic} toggleMetamagic={toggleMetamagic} />
      )}
      {activeTab === 'abilities' && (
        <AbilitiesTab abilityScores={abilityScores} setAbilityScore={setAbilityScore} profBonus={profBonus} />
      )}
      {activeTab === 'combat' && (
        <CombatTab
          ac={ac} speed={speed} setAc={setAc} setSpeed={setSpeed}
          weapons={weapons} addWeapon={addWeapon} updateWeapon={updateWeapon} removeWeapon={removeWeapon}
        />
      )}
      {activeTab === 'items' && (
        <ItemsTab
          equipment={equipment}
          addEquipment={addEquipment}
          updateEquipment={updateEquipment}
          removeEquipment={removeEquipment}
        />
      )}
      {activeTab === 'feats' && (
        <FeatsTab feats={feats} toggleFeat={toggleFeat} />
      )}
      {activeTab === 'character' && (
        <CharacterTab
          characterName={characterName} background={background} notes={notes}
          setCharacterName={setCharacterName} setBackground={setBackground} setNotes={setNotes}
          languages={languages} addLanguage={addLanguage} removeLanguage={removeLanguage}
          skillProfs={skillProfs} setSkillProf={setSkillProf}
          profBonus={profBonus} abilityScores={abilityScores}
        />
      )}
    </div>
  )
}
