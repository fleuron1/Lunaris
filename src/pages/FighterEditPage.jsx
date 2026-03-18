import { useState, useMemo } from 'react'
import { SKILLS } from '../data/tonti.js'
import { getProfBonus } from '../data/fighter-progression.js'
import featsData from '../data/feats.json'

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const ABILITY_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }
const ABILITY_FULL = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' }

function mod(score) { return Math.floor((score - 10) / 2) }
function fmtMod(n) { return n >= 0 ? `+${n}` : `${n}` }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#060f1e]/90 rounded-xl border border-pink-950/50 ${className}`}>
      {children}
    </div>
  )
}

function SH({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-400/55 mb-3 flex items-center gap-1.5">
      <span className="text-pink-500/35">❄</span>{children}
    </p>
  )
}

const TABS = ['Character', 'Stats', 'Inventory', 'Skills & Languages', 'Feats']

export default function FighterEditPage({
  level, xp, abilityScores, ac, speed,
  characterName, background, notes,
  weapons, equipment, languages, skillProfs, feats,
  setLevel, setXp, setAbilityScore, setAc, setSpeed,
  setCharacterName, setBackground, setNotes,
  addWeapon, updateWeapon, removeWeapon,
  addEquipment, updateEquipment, removeEquipment,
  addLanguage, removeLanguage, setSkillProf, toggleFeat,
  profBonus,
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
                ? 'text-pink-200 bg-pink-900/30 shadow-[0_0_8px_rgba(232,25,127,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-pink-950/20'
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
      {tab === 'Feats' && (
        <FeatsTab feats={feats} toggleFeat={toggleFeat} />
      )}
    </div>
  )
}

// ── Character Tab ─────────────────────────────────────────────────────────────

function CharacterTab({ level, xp, ac, speed, characterName, background, notes, setLevel, setXp, setAc, setSpeed, setCharacterName, setBackground, setNotes }) {
  const [xpInput, setXpInput] = useState(String(xp ?? 0))

  function applyXp() {
    const v = parseInt(xpInput, 10)
    if (!isNaN(v)) setXp(v)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="p-5">
        <SH>Identity</SH>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-pink-300/50 uppercase tracking-wider block mb-1">Character Name</label>
            <input
              value={characterName ?? ''}
              onChange={e => setCharacterName(e.target.value)}
              className="w-full bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-700/50"
            />
          </div>
          <div>
            <label className="text-xs text-pink-300/50 uppercase tracking-wider block mb-1">Background</label>
            <input
              value={background ?? ''}
              onChange={e => setBackground(e.target.value)}
              className="w-full bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-700/50"
            />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SH>Level & XP</SH>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setLevel(Math.max(1, level - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a1626] hover:bg-pink-950/40 text-slate-300 font-bold border border-pink-950/40 select-none"
            disabled={level <= 1}
          >−</button>
          <div className="flex-1 text-center">
            <span className="text-5xl font-bold text-pink-300">{level}</span>
            <p className="text-slate-400 text-sm mt-1">Echo Knight Fighter</p>
          </div>
          <button
            onClick={() => setLevel(Math.min(20, level + 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a1626] hover:bg-pink-950/40 text-slate-300 font-bold border border-pink-950/40 select-none"
            disabled={level >= 20}
          >+</button>
        </div>
        <div>
          <label className="text-xs text-pink-300/50 uppercase tracking-wider block mb-1">XP</label>
          <div className="flex gap-2">
            <input
              value={xpInput}
              onChange={e => setXpInput(e.target.value)}
              onBlur={applyXp}
              onKeyDown={e => e.key === 'Enter' && applyXp()}
              type="number"
              min="0"
              className="flex-1 bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-700/50"
            />
            <button
              onClick={applyXp}
              className="bg-pink-900/50 hover:bg-pink-800/60 text-white font-semibold py-1.5 px-3 rounded-lg text-sm border border-pink-700/40"
            >Set</button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SH>Combat</SH>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: 'AC', value: ac, setter: setAc, min: 0, max: 30 }, { label: 'Speed (ft)', value: speed, setter: setSpeed, min: 0, max: 120 }].map(({ label, value, setter, min, max }) => (
            <div key={label}>
              <label className="text-xs text-pink-300/50 uppercase tracking-wider block mb-1">{label}</label>
              <div className="flex items-center gap-1">
                <button onClick={() => setter(Math.max(min, value - 1))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0a1626] hover:bg-pink-950/40 text-slate-300 font-bold border border-pink-950/40 select-none text-sm">−</button>
                <span className="text-2xl font-bold text-pink-300 w-12 text-center tabular-nums">{value}</span>
                <button onClick={() => setter(Math.min(max, value + 1))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0a1626] hover:bg-pink-950/40 text-slate-300 font-bold border border-pink-950/40 select-none text-sm">+</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SH>Notes</SH>
        <textarea
          value={notes ?? ''}
          onChange={e => setNotes(e.target.value)}
          rows={5}
          placeholder="Session notes, tactics, reminders…"
          className="w-full bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-pink-700/50 placeholder-slate-700 resize-none"
        />
      </Card>
    </div>
  )
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────

function StatsTab({ abilityScores, setAbilityScore, profBonus }) {
  return (
    <Card className="p-5">
      <SH>Ability Scores</SH>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {ABILITY_KEYS.map(key => {
          const score = abilityScores?.[key] ?? 10
          const m = mod(score)
          return (
            <div key={key} className="bg-[#030b18] rounded-xl p-3 text-center border border-pink-950/40">
              <p className="text-xs text-pink-300/40 uppercase tracking-wider mb-2">{ABILITY_FULL[key]}</p>
              <p className="text-2xl font-bold text-pink-400 mb-1">{fmtMod(m)}</p>
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => setAbilityScore(key, Math.max(1, score - 1))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-[#0a1626] hover:bg-pink-950/40 text-slate-300 font-bold text-sm border border-pink-950/40 select-none"
                >−</button>
                <span className="text-lg font-semibold text-sky-200 w-8 text-center tabular-nums">{score}</span>
                <button
                  onClick={() => setAbilityScore(key, Math.min(30, score + 1))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-[#0a1626] hover:bg-pink-950/40 text-slate-300 font-bold text-sm border border-pink-950/40 select-none"
                >+</button>
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
    <tr className="border-b border-pink-950/30">
      {['name', 'atkBonus', 'damage', 'notes'].map(field => (
        <td key={field} className="py-1.5 pr-2">
          <input
            value={weapon[field] ?? ''}
            onChange={e => onUpdate(weapon.id, { [field]: e.target.value })}
            className="w-full bg-[#030b18] border border-pink-950/40 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-pink-700/50"
          />
        </td>
      ))}
      <td className="py-1.5">
        <button onClick={() => onRemove(weapon.id)} className="text-pink-700/60 hover:text-rose-400 text-sm">✕</button>
      </td>
    </tr>
  )
}

function InventoryTab({ weapons, addWeapon, updateWeapon, removeWeapon, equipment, addEquipment, updateEquipment, removeEquipment }) {
  const [newWeapon, setNewWeapon] = useState({ name: '', atkBonus: '', damage: '', notes: '' })
  const [newEquip, setNewEquip] = useState({ name: '', description: '' })

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
    setNewEquip({ name: '', description: '' })
  }

  return (
    <div className="space-y-4">
      {/* Weapons */}
      <Card className="p-5">
        <SH>Weapons & Attacks</SH>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-pink-300/40 border-b border-pink-950/40 uppercase tracking-wider text-[10px]">
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
              className="flex-1 min-w-[80px] bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-700/50 placeholder-slate-700"
            />
          ))}
          <button type="submit" className="bg-pink-900/50 hover:bg-pink-800/60 text-white font-semibold py-1.5 px-3 rounded-lg text-xs border border-pink-700/40">
            + Add
          </button>
        </form>
      </Card>

      {/* Equipment */}
      <Card className="p-5">
        <SH>Equipment</SH>
        <ul className="space-y-2 mb-3">
          {(equipment || []).map(item => (
            <li key={item.id} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  value={item.name ?? ''}
                  onChange={e => updateEquipment(item.id, { name: e.target.value })}
                  className="bg-[#030b18] border border-pink-950/40 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-pink-700/50"
                />
                <input
                  value={item.description ?? ''}
                  onChange={e => updateEquipment(item.id, { description: e.target.value })}
                  placeholder="Description"
                  className="bg-[#030b18] border border-pink-950/40 rounded-lg px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-pink-700/50 placeholder-slate-700"
                />
              </div>
              <button onClick={() => removeEquipment(item.id)} className="text-pink-700/60 hover:text-rose-400 text-sm mt-0.5">✕</button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddEquip} className="flex gap-2">
          <input
            value={newEquip.name}
            onChange={e => setNewEquip(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Item name *"
            className="flex-1 bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-700/50 placeholder-slate-700"
          />
          <input
            value={newEquip.description}
            onChange={e => setNewEquip(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className="flex-1 bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-700/50 placeholder-slate-700"
          />
          <button type="submit" className="bg-pink-900/50 hover:bg-pink-800/60 text-white font-semibold py-1.5 px-3 rounded-lg text-xs border border-pink-700/40">
            + Add
          </button>
        </form>
      </Card>
    </div>
  )
}

// ── Skills & Languages Tab ────────────────────────────────────────────────────

function SkillsTab({ abilityScores, profBonus, skillProfs, setSkillProf, languages, addLanguage, removeLanguage }) {
  const [langInput, setLangInput] = useState('')

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
        <div className="flex items-center gap-3 mb-3 text-[10px] text-pink-300/40">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#030b18]/80 border border-pink-950/40 inline-block" /> None</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-pink-500 border-pink-400 inline-block" /> Prof</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 border-amber-400 inline-block" /> Expert</span>
        </div>
        <div className="space-y-1">
          {SKILLS.map(skill => {
            const prof = skillProfs?.[skill.name]
            const score = abilityScores?.[skill.ability] ?? 10
            const total = mod(score) + (prof === 'expert' ? profBonus * 2 : prof === 'proficient' ? profBonus : 0)
            function cycle() {
              const next = prof === 'expert' ? undefined : prof === 'proficient' ? 'expert' : 'proficient'
              setSkillProf(skill.name, next)
            }
            return (
              <div key={skill.name} className="flex items-center gap-2">
                <button
                  onClick={cycle}
                  title={prof === 'expert' ? 'Expert · click to clear' : prof === 'proficient' ? 'Proficient · click for Expert' : 'None · click for Proficient'}
                  className={`w-4 h-4 rounded-full border flex-shrink-0 transition-all ${
                    prof === 'expert'      ? 'bg-amber-500 border-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.5)]'
                    : prof === 'proficient' ? 'bg-pink-500 border-pink-400 shadow-[0_0_4px_rgba(236,72,153,0.4)]'
                    : 'bg-[#030b18]/80 border-pink-950/40 hover:border-pink-700/50'
                  }`}
                />
                <span className="text-xs text-slate-300 flex-1">{skill.name}</span>
                <span className="text-[10px] text-pink-300/30 w-7">{ABILITY_LABELS[skill.ability]}</span>
                <span className={`text-xs font-bold tabular-nums w-8 text-right ${prof ? 'text-pink-300' : 'text-slate-500'}`}>
                  {fmtMod(total)}
                </span>
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
            <span key={lang} className="flex items-center gap-1.5 bg-pink-950/40 text-pink-300/80 text-xs px-2.5 py-1 rounded-full border border-pink-900/40">
              {lang}
              <button
                onClick={() => removeLanguage(lang)}
                className="text-pink-700/60 hover:text-rose-400 transition-colors leading-none"
              >×</button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddLang} className="flex gap-2">
          <input
            value={langInput}
            onChange={e => setLangInput(e.target.value)}
            placeholder="Add language…"
            className="flex-1 bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-pink-700/50 placeholder-slate-700"
          />
          <button type="submit" className="bg-pink-900/50 hover:bg-pink-800/60 text-white font-semibold py-1.5 px-3 rounded-lg text-sm border border-pink-700/40">
            + Add
          </button>
        </form>
      </Card>
    </div>
  )
}

// ── Feats Tab ─────────────────────────────────────────────────────────────────

const FEAT_CAT = { G: 'General', O: 'Origin', FS: 'Fighting Style', EF: 'Epic Boon' }

function FeatsTab({ feats = [], toggleFeat }) {
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
                className="bg-pink-900/40 border border-pink-600/50 text-pink-200 text-xs px-2.5 py-1 rounded-full hover:bg-red-900/30 hover:border-red-700/40 hover:text-red-300 transition-colors"
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
          className="flex-1 min-w-40 bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-700/50 placeholder-slate-700"
        />
        <button
          onClick={() => setShowChosen(v => !v)}
          className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${showChosen ? 'bg-pink-800 border-pink-600 text-white' : 'bg-[#030b18] border-pink-950/40 text-slate-400 hover:text-slate-200 hover:bg-pink-950/30'}`}
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
                ${chosen ? 'bg-pink-900/30 border-pink-600/50' : 'bg-[#030b18]/60 border-pink-950/30 hover:border-pink-800/50'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
                  ${chosen ? 'bg-pink-500 border-pink-400' : 'border-pink-900/50'}`}>
                  {chosen && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-200">{feat.name}</span>
                    {feat.category && (
                      <span className="text-[10px] bg-pink-950/40 border border-pink-900/40 text-pink-400/60 px-1.5 py-0.5 rounded-full">
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
