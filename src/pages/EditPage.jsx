import { useState, useMemo } from 'react'
import spellsData from '../data/sorcerer-spells.json'
import metamagicData from '../data/metamagic.json'
import featsData from '../data/feats.json'
import { SKILLS } from '../data/annabelle.js'
import {
  SPELL_SLOTS_TABLE, LEVEL_FEATURES, CANTRIPS_KNOWN, SPELLS_KNOWN,
  SORCERY_POINTS, XP_THRESHOLDS, maxMetamagic, getProfBonus,
} from '../data/sorcerer-progression.js'

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const ABILITY_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }
const ABILITY_FULL  = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' }

function mod(score) { return Math.floor((score - 10) / 2) }
function fmtMod(n) { return n >= 0 ? `+${n}` : `${n}` }

// ── Shared primitives ─────────────────────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#0c1030]/90 rounded-xl border border-violet-950/50 ${className}`}>
      {children}
    </div>
  )
}

function SH({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-400/55 mb-3 flex items-center gap-1.5">
      <span className="text-violet-500/35">✦</span>{children}
    </p>
  )
}

const INPUT = 'bg-[#060c20] border border-violet-950/40 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-700/50'
const INPUT_XS = 'bg-[#060c20] border border-violet-950/40 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-700/50 placeholder-slate-700'
const BTN = 'bg-violet-900/50 hover:bg-violet-800/60 text-white font-semibold rounded-lg border border-violet-700/40 transition-colors'
const BTN_SM = 'w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a1228] hover:bg-violet-950/40 text-slate-300 font-bold border border-violet-950/40 select-none'
const BTN_XS  = 'w-7 h-7 flex items-center justify-center rounded-lg bg-[#0a1228] hover:bg-violet-950/40 text-slate-300 font-bold border border-violet-950/40 select-none text-sm'

const TABS = ['Character', 'Stats', 'Inventory', 'Skills & Languages', 'Spells', 'Metamagic', 'Feats']

// ── Character Tab ─────────────────────────────────────────────────────────────

function CharacterTab({
  level, xp, ac, speed, characterName, background, notes,
  setLevel, setXp, setAc, setSpeed, setCharacterName, setBackground, setNotes,
}) {
  const [xpInput, setXpInput] = useState(String(xp ?? 0))
  const nextXp    = XP_THRESHOLDS[level] ?? null
  const currentXp = XP_THRESHOLDS[level - 1] ?? 0
  const xpPct     = nextXp ? Math.min(100, Math.round(((xp - currentXp) / (nextXp - currentXp)) * 100)) : 100

  function applyXp() {
    const v = parseInt(xpInput, 10)
    if (!isNaN(v)) setXp(v)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      {/* Identity */}
      <Card className="p-5">
        <SH>Identity</SH>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-violet-300/50 uppercase tracking-wider block mb-1">Character Name</label>
            <input value={characterName ?? ''} onChange={e => setCharacterName(e.target.value)} className={`w-full ${INPUT}`} />
          </div>
          <div>
            <label className="text-xs text-violet-300/50 uppercase tracking-wider block mb-1">Background</label>
            <input value={background ?? ''} onChange={e => setBackground(e.target.value)} className={`w-full ${INPUT}`} />
          </div>
        </div>
      </Card>

      {/* Level & XP */}
      <Card className="p-5">
        <SH>Level & XP</SH>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setLevel(Math.max(1, level - 1))} className={BTN_SM} disabled={level <= 1}>−</button>
          <div className="flex-1 text-center">
            <span className="text-5xl font-bold text-violet-300">{level}</span>
            <p className="text-slate-400 text-sm mt-1">Lunar Sorcerer</p>
          </div>
          <button onClick={() => setLevel(Math.min(20, level + 1))} className={BTN_SM} disabled={level >= 20}>+</button>
        </div>
        {nextXp && (
          <div className="mb-3 space-y-1">
            <div className="flex justify-between text-[11px] text-violet-300/40">
              <span>{xp?.toLocaleString()} XP</span>
              <span>Next: {nextXp.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-violet-950/60 rounded-full overflow-hidden border border-violet-900/40">
              <div className="h-full bg-violet-500 transition-all" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        )}
        <div>
          <label className="text-xs text-violet-300/50 uppercase tracking-wider block mb-1">XP</label>
          <div className="flex gap-2">
            <input
              value={xpInput}
              onChange={e => setXpInput(e.target.value)}
              onBlur={applyXp}
              onKeyDown={e => e.key === 'Enter' && applyXp()}
              type="number" min="0"
              className={`flex-1 ${INPUT}`}
            />
            <button onClick={applyXp} className={`${BTN} py-2 px-3 text-sm`}>Set</button>
          </div>
        </div>
      </Card>

      {/* Combat */}
      <Card className="p-5">
        <SH>Combat</SH>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'AC',        value: ac,    setter: setAc,    min: 0, max: 30  },
            { label: 'Speed (ft)', value: speed, setter: setSpeed, min: 0, max: 120 },
          ].map(({ label, value, setter, min, max }) => (
            <div key={label}>
              <label className="text-xs text-violet-300/50 uppercase tracking-wider block mb-1">{label}</label>
              <div className="flex items-center gap-1">
                <button onClick={() => setter(Math.max(min, value - 1))} className={BTN_XS}>−</button>
                <span className="text-2xl font-bold text-violet-300 w-12 text-center tabular-nums">{value}</span>
                <button onClick={() => setter(Math.min(max, value + 1))} className={BTN_XS}>+</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-5">
        <SH>Notes</SH>
        <textarea
          value={notes ?? ''}
          onChange={e => setNotes(e.target.value)}
          rows={5}
          placeholder="Session notes, tactics, reminders…"
          className="w-full bg-[#060c20] border border-violet-950/40 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-700/50 placeholder-slate-700 resize-none"
        />
      </Card>

    </div>
  )
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────

function StatsTab({ abilityScores, setAbilityScore, profBonus }) {
  const SAVE_PROFS = ['con', 'cha']

  return (
    <Card className="p-5">
      <SH>Ability Scores</SH>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {ABILITY_KEYS.map(key => {
          const score    = abilityScores?.[key] ?? 10
          const m        = mod(score)
          const saveProf = SAVE_PROFS.includes(key)
          const saveBonus = saveProf ? m + profBonus : m
          return (
            <div key={key} className="bg-[#060c20] rounded-xl p-3 text-center border border-violet-950/40">
              <p className="text-xs text-violet-300/40 uppercase tracking-wider mb-2">{ABILITY_FULL[key]}</p>
              <p className="text-2xl font-bold text-violet-400 mb-1">{fmtMod(m)}</p>
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => setAbilityScore(key, Math.max(1, score - 1))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-[#0a1228] hover:bg-violet-950/40 text-slate-300 font-bold text-sm border border-violet-950/40 select-none"
                >−</button>
                <span className="text-lg font-semibold text-sky-200 w-8 text-center tabular-nums">{score}</span>
                <button
                  onClick={() => setAbilityScore(key, Math.min(30, score + 1))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-[#0a1228] hover:bg-violet-950/40 text-slate-300 font-bold text-sm border border-violet-950/40 select-none"
                >+</button>
              </div>
              <div className="mt-2 border-t border-violet-900/30 pt-1.5 text-center">
                <p className="text-[9px] text-violet-300/40 uppercase tracking-widest">Save</p>
                <span className={`text-xs font-bold ${saveProf ? 'text-violet-300' : 'text-slate-500'}`}>
                  {saveProf && <span className="text-violet-400 mr-0.5">●</span>}
                  {fmtMod(saveBonus)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Inventory Tab ─────────────────────────────────────────────────────────────

function WeaponRow({ weapon, onUpdate, onRemove }) {
  return (
    <tr className="border-b border-violet-950/30">
      {['name', 'atkBonus', 'damage', 'notes'].map(field => (
        <td key={field} className="py-1.5 pr-2">
          <input
            value={weapon[field] ?? ''}
            onChange={e => onUpdate(weapon.id, { [field]: e.target.value })}
            className="w-full bg-[#060c20] border border-violet-950/40 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-violet-700/50"
          />
        </td>
      ))}
      <td className="py-1.5">
        <button onClick={() => onRemove(weapon.id)} className="text-violet-700/60 hover:text-red-400 text-sm">✕</button>
      </td>
    </tr>
  )
}

function InventoryTab({ weapons, addWeapon, updateWeapon, removeWeapon, equipment, addEquipment, updateEquipment, removeEquipment }) {
  const [newWeapon, setNewWeapon] = useState({ name: '', atkBonus: '', damage: '', notes: '' })
  const [newEquip,  setNewEquip]  = useState({ name: '', description: '', isMagic: false })

  function handleAddWeapon(e) {
    e.preventDefault()
    if (!newWeapon.name.trim()) return
    addWeapon(newWeapon)
    setNewWeapon({ name: '', atkBonus: '', damage: '', notes: '' })
  }

  function handleAddEquip(e) {
    e.preventDefault()
    if (!newEquip.name.trim()) return
    addEquipment(newEquip)
    setNewEquip({ name: '', description: '', isMagic: false })
  }

  return (
    <div className="space-y-4">

      {/* Weapons */}
      <Card className="p-5">
        <SH>Weapons & Attacks</SH>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-violet-300/40 border-b border-violet-950/40 uppercase tracking-wider text-[10px]">
                <th className="text-left pb-2 pr-2">Name</th>
                <th className="text-left pb-2 pr-2">Atk Bonus</th>
                <th className="text-left pb-2 pr-2">Damage</th>
                <th className="text-left pb-2 pr-2">Notes</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {(weapons || []).map(w => (
                <WeaponRow key={w.id} weapon={w} onUpdate={updateWeapon} onRemove={removeWeapon} />
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={handleAddWeapon} className="flex gap-2 flex-wrap">
          {['name', 'atkBonus', 'damage', 'notes'].map((f, i) => (
            <input
              key={f}
              value={newWeapon[f]}
              onChange={e => setNewWeapon(prev => ({ ...prev, [f]: e.target.value }))}
              placeholder={['Name *', 'Atk Bonus', 'Damage', 'Notes'][i]}
              className={`flex-1 min-w-[80px] ${INPUT_XS}`}
            />
          ))}
          <button type="submit" className={`${BTN} py-1.5 px-3 text-xs`}>+ Add</button>
        </form>
      </Card>

      {/* Equipment */}
      <Card className="p-5">
        <SH>Equipment</SH>
        <ul className="space-y-2 mb-3">
          {(equipment || []).map(item => (
            <li key={item.id} className="flex gap-2 items-center">
              <span className="text-xs flex-shrink-0 text-violet-400/40">{item.isMagic ? '✨' : '✦'}</span>
              <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
                <input
                  value={item.name ?? ''}
                  onChange={e => updateEquipment(item.id, { name: e.target.value })}
                  className={`bg-[#060c20] border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-violet-700/50 ${item.isMagic ? 'border-amber-900/40 text-amber-300/90' : 'border-violet-950/40 text-slate-200'}`}
                />
                <input
                  value={item.description ?? ''}
                  onChange={e => updateEquipment(item.id, { description: e.target.value })}
                  placeholder="Description"
                  className="bg-[#060c20] border border-violet-950/40 rounded-lg px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-violet-700/50 placeholder-slate-700"
                />
              </div>
              <label className="flex items-center gap-1 text-[10px] text-violet-300/40 cursor-pointer select-none flex-shrink-0">
                <input type="checkbox" checked={item.isMagic ?? false} onChange={e => updateEquipment(item.id, { isMagic: e.target.checked })} className="accent-amber-500 w-3 h-3" />✨
              </label>
              <button onClick={() => removeEquipment(item.id)} className="text-violet-700/60 hover:text-red-400 text-sm flex-shrink-0">✕</button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddEquip} className="flex gap-2 flex-wrap items-center">
          <input
            value={newEquip.name}
            onChange={e => setNewEquip(p => ({ ...p, name: e.target.value }))}
            placeholder="Item name *"
            className={`flex-1 min-w-[120px] ${INPUT_XS}`}
          />
          <input
            value={newEquip.description}
            onChange={e => setNewEquip(p => ({ ...p, description: e.target.value }))}
            placeholder="Description"
            className={`flex-1 min-w-[120px] ${INPUT_XS}`}
          />
          <label className="flex items-center gap-1 text-xs text-violet-300/50 cursor-pointer select-none">
            <input type="checkbox" checked={newEquip.isMagic} onChange={e => setNewEquip(p => ({ ...p, isMagic: e.target.checked }))} className="accent-amber-500" />✨
          </label>
          <button type="submit" className={`${BTN} py-1.5 px-3 text-xs`}>+ Add</button>
        </form>
      </Card>

    </div>
  )
}

// ── Skills & Languages Tab ────────────────────────────────────────────────────

function SkillsTab({ abilityScores, profBonus, skillProfs, setSkillProf, languages, addLanguage, removeLanguage }) {
  const [langInput, setLangInput] = useState('')
  const profLevels = ['none', 'proficient', 'expert']

  function handleAddLang(e) {
    e.preventDefault()
    if (!langInput.trim()) return
    addLanguage(langInput.trim())
    setLangInput('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Skills */}
      <Card className="p-5">
        <SH>Skill Proficiencies</SH>
        <div className="flex items-center gap-3 text-[10px] text-violet-300/40 mb-3">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-violet-900/40 border border-violet-800/40 inline-block" /> None</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-violet-600 inline-block" /> Prof</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Expert</span>
        </div>
        <div className="space-y-1">
          {SKILLS.map(skill => {
            const prof  = skillProfs?.[skill.name] ?? 'none'
            const score = abilityScores?.[skill.ability] ?? 10
            const total = mod(score) + (prof === 'expert' ? profBonus * 2 : prof === 'proficient' ? profBonus : 0)

            function cycle() {
              const next = profLevels[(profLevels.indexOf(prof) + 1) % profLevels.length]
              setSkillProf(skill.name, next)
            }

            return (
              <div key={skill.name} className="flex items-center gap-2 py-0.5">
                <button
                  onClick={cycle}
                  className={`w-4 h-4 rounded-full border flex-shrink-0 transition-all ${
                    prof === 'expert'     ? 'bg-amber-500 border-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.4)]'
                    : prof === 'proficient' ? 'bg-violet-600 border-violet-500 shadow-[0_0_4px_rgba(139,92,246,0.4)]'
                    : 'bg-violet-900/40 border-violet-800/40'
                  }`}
                  title="Click to cycle proficiency"
                />
                <span className="text-xs text-slate-300 flex-1">{skill.name}</span>
                <span className="text-[10px] text-violet-300/30 w-7">{ABILITY_LABELS[skill.ability]}</span>
                <span className={`text-xs font-bold tabular-nums w-6 text-right ${
                  prof === 'expert' ? 'text-amber-300' : prof === 'proficient' ? 'text-violet-400' : 'text-slate-500'
                }`}>{fmtMod(total)}</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Languages */}
      <Card className="p-5">
        <SH>Languages</SH>
        <div className="flex flex-wrap gap-2 mb-4">
          {(languages || []).map(lang => (
            <span key={lang} className="flex items-center gap-1.5 bg-violet-950/40 text-violet-300/80 text-xs px-2.5 py-1 rounded-full border border-violet-900/40">
              {lang}
              <button onClick={() => removeLanguage(lang)} className="text-violet-700/60 hover:text-red-400 transition-colors leading-none">×</button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddLang} className="flex gap-2">
          <input
            value={langInput}
            onChange={e => setLangInput(e.target.value)}
            placeholder="Add language…"
            className={`flex-1 ${INPUT}`}
          />
          <button type="submit" className={`${BTN} py-2 px-3 text-sm`}>+ Add</button>
        </form>
      </Card>

    </div>
  )
}

// ── Spells Tab ────────────────────────────────────────────────────────────────

const SCHOOL_COLORS = {
  Abjuration: 'text-blue-400', Conjuration: 'text-green-400', Divination: 'text-cyan-400',
  Enchantment: 'text-pink-400', Illusion: 'text-purple-400', Necromancy: 'text-red-400',
  Transmutation: 'text-yellow-400', Evocation: 'text-orange-400',
}

function SpellsTab({ level, knownSpells, knownCantrips, toggleKnownSpell, resetSpells }) {
  const [search,       setSearch]       = useState('')
  const [filterLevel,  setFilterLevel]  = useState('all')
  const [filterKnown,  setFilterKnown]  = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const maxSpellLevel = SPELL_SLOTS_TABLE[level]?.findLastIndex(n => n > 0) + 1 || 2
  const cantripMax  = CANTRIPS_KNOWN[level - 1]
  const spellMax    = SPELLS_KNOWN[level - 1]
  const cantripsFull = knownCantrips.length >= cantripMax
  const spellsFull   = knownSpells.length   >= spellMax

  const filtered = useMemo(() => spellsData.filter(s => {
    if (s.level !== 0 && s.level > maxSpellLevel) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterLevel !== 'all') {
      const fl = filterLevel === 'C' ? 0 : parseInt(filterLevel)
      if (s.level !== fl) return false
    }
    if (filterKnown) {
      const isCan = s.level === 0
      if (isCan  && !knownCantrips.includes(s.name)) return false
      if (!isCan && !knownSpells.includes(s.name))   return false
    }
    return true
  }), [search, filterLevel, filterKnown, knownSpells, knownCantrips, maxSpellLevel])

  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(s => { const k = s.level === 0 ? 'C' : s.level; if (!g[k]) g[k] = []; g[k].push(s) })
    return g
  }, [filtered])

  const levelOrder = ['C', ...Array.from({ length: maxSpellLevel }, (_, i) => i + 1)]
  const LEVEL_LABEL = { C:'Cantrips',1:'1st Level',2:'2nd Level',3:'3rd Level',4:'4th Level',5:'5th Level',6:'6th Level',7:'7th Level',8:'8th Level',9:'9th Level' }

  function handleReset() {
    if (confirmReset) { resetSpells(); setConfirmReset(false) }
    else setConfirmReset(true)
  }

  return (
    <div className="space-y-4">

      {/* Lunar note */}
      <div className="flex items-center gap-2 bg-violet-950/40 border border-violet-800/30 rounded-lg px-3 py-2 text-xs text-violet-300/60">
        <span>🌙</span>
        <span>Lunar bonus spells (Cure Wounds, Moonbeam, etc.) are always prepared by your subclass and don't count here.</span>
      </div>

      {/* Level overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Prof. Bonus',    value: `+${getProfBonus(level)}` },
          { label: 'Cantrips Known', value: CANTRIPS_KNOWN[level - 1] },
          { label: 'Spells Known',   value: SPELLS_KNOWN[level - 1]   },
          { label: 'Sorcery Points', value: SORCERY_POINTS[level - 1] },
        ].map(({ label, value }) => (
          <Card key={label} className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-300">{value}</p>
            <p className="text-[10px] text-violet-300/50 mt-1 uppercase tracking-wider">{label}</p>
          </Card>
        ))}
      </div>

      {/* Spell slots */}
      <Card className="p-5">
        <SH>Spell Slots at Level {level}</SH>
        <div className="flex flex-wrap gap-2">
          {(SPELL_SLOTS_TABLE[level] || []).map((count, i) => count > 0 && (
            <div key={i} className="bg-violet-950/50 border border-violet-800/40 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-bold text-violet-300">{count}</p>
              <p className="text-xs text-violet-300/50">{['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'][i]}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Known counts */}
      <div className="grid grid-cols-2 gap-3">
        <Card className={`p-4 text-center ${cantripsFull ? 'border-amber-600/40' : ''}`}>
          <p className={`text-2xl font-bold ${cantripsFull ? 'text-amber-400' : 'text-emerald-400'}`}>
            {knownCantrips.length} <span className="text-slate-500 text-lg">/ {cantripMax}</span>
          </p>
          <p className="text-xs text-violet-300/50 mt-1">Cantrips Known</p>
          {cantripsFull && <p className="text-[10px] text-amber-400/70 mt-0.5">Full — remove one to swap</p>}
        </Card>
        <Card className={`p-4 text-center ${spellsFull ? 'border-amber-600/40' : ''}`}>
          <p className={`text-2xl font-bold ${spellsFull ? 'text-amber-400' : 'text-violet-400'}`}>
            {knownSpells.length} <span className="text-slate-500 text-lg">/ {spellMax}</span>
          </p>
          <p className="text-xs text-violet-300/50 mt-1">Spells Known</p>
          {spellsFull && <p className="text-[10px] text-amber-400/70 mt-0.5">Full — remove one to swap</p>}
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search spells…"
          className={`flex-1 min-w-40 ${INPUT}`}
        />
        <select
          value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
          className="bg-[#060c20] border border-violet-950/40 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-700/50"
        >
          <option value="all">All Levels</option>
          <option value="C">Cantrips</option>
          {Array.from({ length: maxSpellLevel }, (_, i) => (
            <option key={i+1} value={i+1}>{['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'][i]} Level</option>
          ))}
        </select>
        <button
          onClick={() => setFilterKnown(v => !v)}
          className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${filterKnown ? 'bg-violet-700 border-violet-600 text-white' : 'bg-[#060c20] border-violet-950/40 text-slate-400 hover:text-slate-200 hover:bg-violet-950/30'}`}
        >Known Only</button>
        <button
          onClick={handleReset} onBlur={() => setConfirmReset(false)}
          className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${confirmReset ? 'bg-red-900/50 border-red-700/40 text-red-300' : 'bg-[#060c20] border-violet-950/40 text-slate-400 hover:text-slate-200 hover:bg-violet-950/30'}`}
        >{confirmReset ? '⚠ Confirm Reset?' : 'Reset'}</button>
      </div>

      {/* Spell list */}
      <div className="space-y-4">
        {levelOrder.map(lvl => {
          const spells = grouped[lvl]
          if (!spells?.length) return null
          return (
            <div key={lvl}>
              <h3 className="text-[10px] font-bold text-violet-300/50 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="text-violet-500/35">✦</span>{LEVEL_LABEL[lvl]}
              </h3>
              <div className="space-y-1">
                {spells.map(spell => {
                  const isCantrip = spell.level === 0
                  const known  = isCantrip ? knownCantrips.includes(spell.name) : knownSpells.includes(spell.name)
                  const atCap  = !known && (isCantrip ? cantripsFull : spellsFull)
                  const schoolColor = SCHOOL_COLORS[spell.school] || 'text-slate-400'
                  return (
                    <button
                      key={spell.name}
                      onClick={() => !atCap && toggleKnownSpell(spell.name, isCantrip)}
                      disabled={atCap}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all
                        ${known ? 'bg-violet-900/30 border-violet-600/50'
                          : atCap ? 'opacity-35 border-violet-900/20 cursor-not-allowed'
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
                          {spell.ritual       && <span className="text-xs bg-violet-950/40 border border-violet-800/40 text-violet-400/60 px-1.5 py-0.5 rounded">Ritual</span>}
                          {spell.material     && <span className="text-xs bg-violet-950/40 border border-violet-800/40 text-violet-400/60 px-1.5 py-0.5 rounded">M</span>}
                          <span className="text-xs text-slate-600 ml-auto">{spell.source}</span>
                        </div>
                        <div className="flex gap-3 text-xs text-violet-300/40 mt-0.5">
                          <span>{spell.castTime}</span>
                          <span>{spell.range}</span>
                        </div>
                        {spell.description && <p className="text-xs text-slate-400/70 mt-1 line-clamp-2">{spell.description}</p>}
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

// ── Metamagic Tab ─────────────────────────────────────────────────────────────

function MetamagicTab({ level, chosenMetamagic, toggleMetamagic }) {
  const max = maxMetamagic(level)
  if (level < 3) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-400 text-sm">Metamagic is unlocked at Level 3.</p>
      </Card>
    )
  }
  return (
    <div className="space-y-4">
      <Card className="p-5 flex items-center justify-between">
        <div>
          <SH>Metamagic Options</SH>
          <p className="text-xs text-violet-300/50 -mt-2">Choose {max} options at level {level}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-violet-300">{chosenMetamagic.length} <span className="text-slate-500 text-xl">/ {max}</span></p>
          <p className="text-xs text-violet-300/50">chosen</p>
        </div>
      </Card>

      <div className="space-y-2">
        {metamagicData.map(mm => {
          const chosen = chosenMetamagic.includes(mm.name)
          const atMax  = !chosen && chosenMetamagic.length >= max
          return (
            <button
              key={mm.name}
              onClick={() => !atMax && toggleMetamagic(mm.name)}
              disabled={atMax}
              className={`w-full text-left p-4 rounded-xl border transition-all
                ${chosen ? 'bg-violet-900/30 border-violet-600/50'
                  : atMax ? 'opacity-40 border-violet-900/25 cursor-not-allowed'
                  : 'bg-violet-950/20 border-violet-900/25 hover:border-violet-700/40'}`}
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

// ── Feats Tab ─────────────────────────────────────────────────────────────────

const FEAT_CAT = { G: 'General', O: 'Origin', FS: 'Fighting Style', EF: 'Epic Boon' }

function FeatsTab({ feats, toggleFeat }) {
  const [search,     setSearch]     = useState('')
  const [showChosen, setShowChosen] = useState(false)

  const filtered = useMemo(() => featsData.filter(f => {
    if (showChosen && !feats.includes(f.name)) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) &&
        !f.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [search, showChosen, feats])

  return (
    <div className="space-y-4">

      {feats.length > 0 && (
        <Card className="p-5">
          <SH>Chosen Feats</SH>
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
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        <input
          type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search feats…"
          className={`flex-1 min-w-40 ${INPUT}`}
        />
        <button
          onClick={() => setShowChosen(v => !v)}
          className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${showChosen ? 'bg-violet-700 border-violet-600 text-white' : 'bg-[#060c20] border-violet-950/40 text-slate-400 hover:text-slate-200 hover:bg-violet-950/30'}`}
        >Chosen Only</button>
      </div>

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
                    {feat.prerequisite && <span className="text-xs text-slate-500">Req: {feat.prerequisite}</span>}
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

// ── Main EditPage ─────────────────────────────────────────────────────────────

export default function EditPage({
  level, xp, abilityScores, knownSpells, knownCantrips, chosenMetamagic, profBonus,
  setLevel, setXp, setAbilityScore, toggleKnownSpell, resetSpells, toggleMetamagic,
  ac, speed, setAc, setSpeed,
  weapons, addWeapon, updateWeapon, removeWeapon,
  equipment, addEquipment, updateEquipment, removeEquipment,
  feats, toggleFeat,
  languages, addLanguage, removeLanguage,
  skillProfs, setSkillProf,
  characterName, background, notes,
  setCharacterName, setBackground, setNotes,
}) {
  const [tab, setTab] = useState('Character')

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">

      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-semibold px-3 py-1.5 rounded-md transition-all duration-150 ${
              tab === t
                ? 'text-violet-200 bg-violet-900/30 shadow-[0_0_8px_rgba(139,92,246,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-violet-950/20'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Character' && (
        <CharacterTab
          level={level} xp={xp} ac={ac} speed={speed}
          characterName={characterName} background={background} notes={notes}
          setLevel={setLevel} setXp={setXp} setAc={setAc} setSpeed={setSpeed}
          setCharacterName={setCharacterName} setBackground={setBackground} setNotes={setNotes}
        />
      )}
      {tab === 'Stats' && (
        <StatsTab abilityScores={abilityScores} setAbilityScore={setAbilityScore} profBonus={profBonus} />
      )}
      {tab === 'Inventory' && (
        <InventoryTab
          weapons={weapons} addWeapon={addWeapon} updateWeapon={updateWeapon} removeWeapon={removeWeapon}
          equipment={equipment} addEquipment={addEquipment} updateEquipment={updateEquipment} removeEquipment={removeEquipment}
        />
      )}
      {tab === 'Skills & Languages' && (
        <SkillsTab
          abilityScores={abilityScores} profBonus={profBonus} skillProfs={skillProfs} setSkillProf={setSkillProf}
          languages={languages} addLanguage={addLanguage} removeLanguage={removeLanguage}
        />
      )}
      {tab === 'Spells' && (
        <SpellsTab
          level={level} knownSpells={knownSpells} knownCantrips={knownCantrips}
          toggleKnownSpell={toggleKnownSpell} resetSpells={resetSpells}
        />
      )}
      {tab === 'Metamagic' && (
        <MetamagicTab level={level} chosenMetamagic={chosenMetamagic} toggleMetamagic={toggleMetamagic} />
      )}
      {tab === 'Feats' && (
        <FeatsTab feats={feats} toggleFeat={toggleFeat} />
      )}

    </div>
  )
}
