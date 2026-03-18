import { useState } from 'react'
import { ABILITIES, SKILLS, CLASS_FEATURES, SPECIES_TRAITS, SAVE_PROFS, PROFICIENCIES } from '../data/tonti.js'

function mod(score) { return Math.floor((score - 10) / 2) }
function fmtMod(n) { return n >= 0 ? `+${n}` : `${n}` }

// ── Shared snow-theme primitives ──────────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#060f1e]/90 rounded-xl border border-pink-950/50 shadow-[0_4px_20px_rgba(232,25,127,0.05)] ${className}`}>
      {children}
    </div>
  )
}

function SH({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-400/55 mb-2 flex items-center gap-1.5">
      <span className="text-pink-500/35">❄</span>{children}
    </p>
  )
}

function Btn({ onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-lg bg-[#0a1626] hover:bg-pink-950/40 text-slate-300 font-bold text-sm transition-all border border-pink-950/40 hover:border-pink-800/40 select-none ${className}`}
    >
      {children}
    </button>
  )
}

function StatBox({ label, value, sub }) {
  return (
    <div className="bg-[#060f1e] rounded-xl p-2.5 text-center border border-pink-950/40 min-w-[60px] px-3">
      <p className="text-lg font-bold text-pink-300 leading-none">{value}</p>
      {sub && <p className="text-[9px] text-sky-300/35 mt-0.5">{sub}</p>}
      <p className="text-[9px] text-pink-300/40 font-bold uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

// ── Ability Scores + Saving Throws ───────────────────────────────────────────

function AbilityBlock({ abilityScores, profBonus }) {
  return (
    <Card className="p-4">
      <SH>Ability Scores</SH>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {Object.entries(ABILITIES).map(([key, { label }]) => {
          const score = abilityScores?.[key] ?? 10
          const m = mod(score)
          return (
            <div key={key} className="bg-[#030b18] rounded-lg p-2 text-center border border-pink-950/40 hover:border-pink-800/40 transition-colors">
              <p className="text-base font-bold text-pink-400 leading-none">{fmtMod(m)}</p>
              <p className="text-xs text-sky-200/70 font-semibold tabular-nums">{score}</p>
              <p className="text-[9px] text-pink-300/35 uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          )
        })}
      </div>
      <SH>Saving Throws</SH>
      <div className="space-y-1">
        {Object.entries(ABILITIES).map(([key, { label }]) => {
          const isProficient = SAVE_PROFS.has(key)
          const score = abilityScores?.[key] ?? 10
          const total = mod(score) + (isProficient ? profBonus : 0)
          return (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full border flex-shrink-0 ${
                isProficient ? 'bg-pink-500 border-pink-400' : 'bg-transparent border-pink-900/40'
              }`} />
              <span className="text-xs text-slate-300 flex-1">{label}</span>
              <span className={`text-xs font-bold tabular-nums ${isProficient ? 'text-pink-400' : 'text-slate-500'}`}>
                {fmtMod(total)}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Skills ────────────────────────────────────────────────────────────────────

function SkillsBlock({ abilityScores, profBonus, skillProfs }) {
  return (
    <Card className="p-4">
      <SH>Skills</SH>
      <div className="space-y-0.5">
        {SKILLS.map(skill => {
          const prof = skillProfs?.[skill.name]
          const score = abilityScores?.[skill.ability] ?? 10
          const total = mod(score) + (prof === 'expert' ? profBonus * 2 : prof === 'proficient' ? profBonus : 0)
          return (
            <div key={skill.name} className="flex items-center gap-2 py-[3px]">
              <span className={`w-2 h-2 rounded-full border flex-shrink-0 ${
                prof === 'expert'     ? 'bg-sky-400 border-sky-300' :
                prof === 'proficient' ? 'bg-pink-500 border-pink-400' :
                'bg-transparent border-pink-900/40'
              }`} />
              <span className="text-xs text-slate-300 flex-1 truncate">{skill.name}</span>
              <span className="text-[10px] text-pink-300/30 mr-0.5">{ABILITIES[skill.ability]?.label}</span>
              <span className={`text-xs font-bold tabular-nums w-6 text-right ${
                prof ? 'text-pink-400' : 'text-slate-500'
              }`}>
                {fmtMod(total)}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── HP Tracker ────────────────────────────────────────────────────────────────

function HPSection({ currentHp, maxHp, tempHp, adjustHp, setTempHp }) {
  const [hpInput, setHpInput] = useState('')
  const [mode, setMode] = useState('heal')

  function apply() {
    const val = parseInt(hpInput, 10)
    if (isNaN(val) || val <= 0) return
    adjustHp(mode === 'heal' ? val : -val)
    setHpInput('')
  }

  const pct = Math.round((currentHp / (maxHp || 1)) * 100)
  const barColor = pct > 50 ? 'bg-emerald-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <Card className="p-4 space-y-3">
      <SH>Hit Points</SH>
      <div className="h-1.5 bg-[#030b18] rounded-full overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-end justify-center gap-2">
        <Btn onClick={() => adjustHp(-1)}>−</Btn>
        <div className="text-center">
          <span className="text-5xl font-bold tabular-nums leading-none text-pink-300">{currentHp}</span>
          <span className="text-pink-900/70 text-lg"> / {maxHp}</span>
          <p className="text-[10px] text-pink-300/30 uppercase tracking-widest mt-0.5">Current / Max</p>
        </div>
        <Btn onClick={() => adjustHp(1)}>+</Btn>
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex rounded-md overflow-hidden border border-pink-950/50 text-sm">
          <button
            onClick={() => setMode('heal')}
            className={`px-3 py-1.5 font-semibold transition-colors rounded-l ${mode === 'heal' ? 'bg-emerald-700 text-white' : 'bg-[#0a1626] text-slate-400 hover:bg-pink-950/30'}`}
          >Heal</button>
          <button
            onClick={() => setMode('damage')}
            className={`px-3 py-1.5 font-semibold transition-colors rounded-r ${mode === 'damage' ? 'bg-red-800/80 text-white' : 'bg-[#0a1626] text-slate-400 hover:bg-pink-950/30'}`}
          >Dmg</button>
        </div>
        <input
          type="number"
          min="1"
          value={hpInput}
          onChange={e => setHpInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && apply()}
          placeholder="amount"
          className="flex-1 bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-pink-700/50 placeholder-slate-700 w-0"
        />
        <button
          onClick={apply}
          className="bg-pink-900/60 hover:bg-pink-800/70 text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition-all border border-pink-700/40"
        >Apply</button>
      </div>
      <div className="flex items-center gap-3 pt-1 border-t border-pink-950/30">
        <span className="text-xs text-pink-300/40 font-semibold uppercase tracking-wider">Temp HP</span>
        <div className="flex items-center gap-2 ml-auto">
          <Btn onClick={() => setTempHp(tempHp - 1)}>−</Btn>
          <span className="text-xl font-bold tabular-nums w-8 text-center text-sky-300">{tempHp}</span>
          <Btn onClick={() => setTempHp(tempHp + 1)}>+</Btn>
        </div>
      </div>
    </Card>
  )
}

// ── Hit Dice ──────────────────────────────────────────────────────────────────

function HitDiceSection({ hitDiceSpent, adjustHitDice, level }) {
  const available = level - hitDiceSpent
  return (
    <Card className="p-4">
      <SH>Hit Dice (d10)</SH>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {Array.from({ length: level }).map((_, i) => {
          const spent = i >= available
          return (
            <button
              key={i}
              onClick={() => adjustHitDice(spent ? -1 : 1)}
              title={spent ? 'Restore die' : 'Spend die'}
              className={`w-10 h-10 rounded-lg border-2 text-xs font-bold transition-all duration-150 ${
                spent
                  ? 'border-pink-950/40 bg-transparent text-pink-900/40'
                  : 'border-pink-700/50 bg-pink-950/30 text-pink-300 hover:bg-pink-900/40 hover:border-pink-500/60 shadow-[0_0_8px_rgba(232,25,127,0.08)]'
              }`}
            >
              d10
            </button>
          )
        })}
      </div>
      <p className="text-xs text-pink-300/40">
        {available}/{level} available · Recover half on Short Rest
      </p>
    </Card>
  )
}

// ── Death Saves ───────────────────────────────────────────────────────────────

function DeathSavesSection({ deathSaves, toggleDeathSave, resetDeathSaves }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <SH>Death Saves</SH>
        <button onClick={resetDeathSaves} className="text-[10px] text-pink-500/50 hover:text-pink-300 transition-colors mb-2">
          Reset
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {['successes', 'failures'].map(type => (
          <div key={type}>
            <p className={`text-xs mb-2 font-semibold ${type === 'successes' ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
              {type === 'successes' ? '✓ Successes' : '✗ Failures'}
            </p>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  onClick={() => toggleDeathSave(type, i)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    deathSaves[type] > i
                      ? type === 'successes'
                        ? 'bg-emerald-500 border-emerald-400'
                        : 'bg-red-500 border-red-400'
                      : 'bg-transparent border-pink-900/40 hover:border-pink-700/50'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Class Features ────────────────────────────────────────────────────────────

function ClassFeaturesSection({
  secondWindUsed, toggleSecondWind,
  actionSurgeUsed, toggleActionSurge,
  ambushUsed, toggleAmbush,
  manifestEchoActive, toggleManifestEcho,
  unleashIncarnationUsed, unleashIncarnationMax, useUnleashIncarnation, restoreUnleashIncarnation,
}) {
  const stateMap = {
    secondWindUsed:    { value: secondWindUsed,    toggle: toggleSecondWind    },
    actionSurgeUsed:   { value: actionSurgeUsed,   toggle: toggleActionSurge   },
    ambushUsed:        { value: ambushUsed,         toggle: toggleAmbush        },
    manifestEchoActive:{ value: manifestEchoActive, toggle: toggleManifestEcho  },
  }

  return (
    <Card className="p-4">
      <SH>Class Features</SH>
      <div className="space-y-2">
        {CLASS_FEATURES.map(f => {
          // ── Counter-based feature (Unleash Incarnation) ──
          if (f.restoreType === 'counter') {
            const used = unleashIncarnationUsed ?? 0
            const max  = unleashIncarnationMax  ?? f.maxUses
            const exhausted = used >= max
            return (
              <div
                key={f.name}
                className={`rounded-lg p-3 border transition-all duration-200 ${
                  exhausted ? 'bg-[#030b18] border-pink-950/30 opacity-55' : 'bg-[#030b18] border-pink-950/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className={`font-semibold text-sm ${exhausted ? 'text-pink-300/40' : 'text-sky-100'}`}>
                        {f.name}
                      </p>
                      {f.cost !== '—' && (
                        <span className="text-[10px] bg-pink-950/50 border border-pink-900/40 text-pink-300/60 px-1.5 py-0.5 rounded-full">
                          {f.cost}
                        </span>
                      )}
                      <span className="text-[10px] text-pink-400/40">↺ Long Rest</span>
                      <span className="text-xs font-bold text-pink-300/70 ml-auto tabular-nums">
                        {max - used}/{max}
                      </span>
                    </div>
                    {/* Pip row */}
                    <div className="flex gap-1.5 mb-2">
                      {Array.from({ length: max }).map((_, i) => {
                        const isSpent = i < used
                        return (
                          <button
                            key={i}
                            onClick={() => isSpent ? restoreUnleashIncarnation() : useUnleashIncarnation()}
                            title={isSpent ? 'Restore use' : 'Spend use'}
                            className={`w-5 h-5 rounded-full border-2 transition-all duration-150 ${
                              isSpent
                                ? 'bg-transparent border-pink-900/40'
                                : 'bg-pink-500 border-pink-400 shadow-[0_0_6px_rgba(232,25,127,0.35)] hover:bg-pink-400'
                            }`}
                          />
                        )
                      })}
                    </div>
                    <p className="text-slate-400/80 text-xs leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </div>
            )
          }

          // ── Toggle / short-rest binary feature ──
          const { value, toggle } = stateMap[f.trackKey] || {}
          const isToggle = f.restType === 'toggle'
          const isActive = Boolean(value)

          return (
            <div
              key={f.name}
              className={`rounded-lg p-3 border transition-all duration-200 ${
                isToggle && isActive
                  ? 'bg-pink-950/40 border-pink-700/50 shadow-[0_0_14px_rgba(232,25,127,0.12)]'
                  : !isToggle && isActive
                  ? 'bg-[#030b18] border-pink-950/30 opacity-55'
                  : 'bg-[#030b18] border-pink-950/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={toggle}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center text-[10px] font-bold ${
                    isToggle
                      ? isActive
                        ? 'bg-pink-500 border-pink-400 text-white'
                        : 'bg-transparent border-pink-800/60 hover:border-pink-600/60'
                      : isActive
                        ? 'bg-pink-500/30 border-pink-700/50 text-pink-400'
                        : 'bg-transparent border-pink-800/60 hover:border-pink-600/60'
                  }`}
                >
                  {!isToggle && isActive ? '✓' : isToggle && isActive ? '●' : ''}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold text-sm ${
                      isToggle && isActive ? 'text-pink-300' :
                      !isToggle && isActive ? 'text-pink-300/40 line-through' :
                      'text-sky-100'
                    }`}>{f.name}</p>
                    {f.cost !== '—' && (
                      <span className="text-[10px] bg-pink-950/50 border border-pink-900/40 text-pink-300/60 px-1.5 py-0.5 rounded-full">
                        {f.cost}
                      </span>
                    )}
                    {!isToggle && (
                      <span className="text-[10px] text-pink-400/40">
                        ↺ {f.restType === 'short' ? 'Short Rest' : 'Long Rest'}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400/80 text-xs mt-1 leading-relaxed">{f.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Species Traits ────────────────────────────────────────────────────────────

function SpeciesTraitsSection({ felineAgilityUsed, toggleFelineAgility }) {
  return (
    <Card className="p-4">
      <SH>Species Traits — Tabaxi</SH>
      <div className="space-y-2">
        {SPECIES_TRAITS.map(t => {
          const isActive = t.trackKey === 'felineAgilityUsed' ? felineAgilityUsed : false
          return (
            <div
              key={t.name}
              className={`rounded-lg p-3 border transition-all duration-200 ${
                t.tracked && isActive
                  ? 'bg-[#030b18] border-pink-950/30 opacity-55'
                  : 'bg-[#030b18] border-pink-950/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {t.tracked ? (
                  <button
                    onClick={toggleFelineAgility}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-pink-500/30 border-pink-700/50 text-pink-400'
                        : 'bg-transparent border-pink-800/60 hover:border-pink-600/60'
                    }`}
                  >
                    {isActive ? '✓' : ''}
                  </button>
                ) : (
                  <span className="mt-1 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-800/60" />
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${
                      t.tracked && isActive ? 'text-pink-300/40 line-through' : 'text-sky-100'
                    }`}>{t.name}</p>
                    {t.tracked && (
                      <span className="text-[10px] text-pink-400/40">↺ move 0 ft to recharge</span>
                    )}
                  </div>
                  <p className="text-slate-400/80 text-xs mt-1 leading-relaxed">{t.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── Weapons ───────────────────────────────────────────────────────────────────

function WeaponsSection({ weapons }) {
  return (
    <Card className="p-4">
      <SH>Weapons & Attacks</SH>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-pink-300/40 border-b border-pink-950/40 uppercase tracking-wider">
              <th className="text-left pb-2 font-semibold">Name</th>
              <th className="text-center pb-2 font-semibold">Atk Bonus</th>
              <th className="text-left pb-2 font-semibold">Damage</th>
              <th className="text-left pb-2 font-semibold hidden sm:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody>
            {(weapons || []).map(w => (
              <tr key={w.id} className="border-b border-pink-950/30 hover:bg-pink-950/10 transition-colors">
                <td className="py-2.5 font-medium text-slate-200">{w.name}</td>
                <td className="py-2.5 text-center font-mono font-bold text-pink-300">{w.atkBonus}</td>
                <td className="py-2.5 text-slate-300">{w.damage}</td>
                <td className="py-2.5 text-slate-500 text-xs hidden sm:table-cell">{w.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ── Equipment ─────────────────────────────────────────────────────────────────

function EquipmentSection({ equipment }) {
  return (
    <Card className="p-4">
      <SH>Equipment</SH>
      <ul className="space-y-1.5">
        {(equipment || []).map(item => (
          <li key={item.id} className="text-sm text-slate-300 flex gap-2 items-start">
            <span className="text-pink-600/40 mt-0.5 text-xs flex-shrink-0">
              {item.isMagic ? '✨' : '❄'}
            </span>
            <span>
              <span className={item.isMagic ? 'text-pink-300/90' : ''}>{item.name}</span>
              {item.description && (
                <span className="text-slate-500 text-xs block">{item.description}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

// ── Languages + Proficiencies ─────────────────────────────────────────────────

function LanguagesSection({ languages }) {
  return (
    <Card className="p-4 space-y-4">
      <div>
        <SH>Languages</SH>
        <div className="flex flex-wrap gap-2">
          {(languages || []).map(lang => (
            <span key={lang} className="bg-pink-950/40 text-pink-300/80 text-xs px-2.5 py-1 rounded-full border border-pink-900/40">
              {lang}
            </span>
          ))}
        </div>
      </div>

      <div>
        <SH>Proficiencies</SH>
        <div className="space-y-1">
          {Object.entries(PROFICIENCIES).map(([key, val]) => (
            <div key={key} className="flex gap-2 text-xs">
              <span className="text-pink-300/40 font-semibold uppercase tracking-wider capitalize flex-shrink-0 w-16">
                {key}
              </span>
              <span className="text-slate-400">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TontiSheetPage({
  currentHp, maxHp, tempHp, adjustHp, setTempHp,
  hitDiceSpent, adjustHitDice,
  deathSaves, toggleDeathSave, resetDeathSaves,
  ac, speed, level, profBonus, abilityScores,
  heroicInspiration, toggleInspiration,
  secondWindUsed, toggleSecondWind,
  actionSurgeUsed, toggleActionSurge,
  ambushUsed, toggleAmbush,
  manifestEchoActive, toggleManifestEcho,
  unleashIncarnationUsed, unleashIncarnationMax, useUnleashIncarnation, restoreUnleashIncarnation,
  felineAgilityUsed, toggleFelineAgility,
  shortRest, longRest,
  characterName, background, notes, setNotes,
  skillProfs, languages, weapons, equipment,
}) {
  const [showLongRestConfirm, setShowLongRestConfirm] = useState(false)

  const wisMod = mod(abilityScores?.wis ?? 9)
  const percProf = skillProfs?.['Perception']
  const passPerc = 10 + wisMod + (percProf === 'expert' ? profBonus * 2 : percProf === 'proficient' ? profBonus : 0)
  const initiative = fmtMod(mod(abilityScores?.dex ?? 18))

  function handleLongRest() {
    if (showLongRestConfirm) { longRest(); setShowLongRestConfirm(false) }
    else setShowLongRestConfirm(true)
  }

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">

      {/* ── Character Header ──────────────────────────────── */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1
              className="text-3xl sm:text-4xl font-bold text-white leading-none"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              {characterName || 'Tonti of Darkgate'}
            </h1>
            <p className="text-slate-300 text-sm mt-1.5">
              <span className="text-sky-300">Tabaxi</span>
              <span className="text-pink-800/60 mx-1.5">·</span>
              <span className="text-pink-200">Echo Knight Fighter</span>
              <span className="text-pink-800/60 mx-1.5">·</span>
              <span className="text-pink-300/80">Level {level}</span>
            </p>
            <p className="text-slate-500 text-xs mt-0.5">{background || 'Folk Hero'} Background</p>
          </div>

          {/* Combat stats */}
          <div className="flex flex-wrap gap-2 items-center">
            <StatBox label="AC"         value={ac ?? 17} />
            <StatBox label="Speed"      value={speed ?? 30} sub="ft" />
            <StatBox label="Size"       value="Small" />
            <StatBox label="Initiative" value={initiative} />
            <StatBox label="Pass. Perc" value={passPerc} />
            <StatBox label="Prof Bonus" value={`+${profBonus}`} />

            <button
              onClick={toggleInspiration}
              className={`bg-[#060f1e] rounded-xl p-2.5 text-center border min-w-[60px] px-3 transition-all duration-200 ${
                heroicInspiration
                  ? 'border-pink-500/60 bg-pink-900/20 shadow-[0_0_12px_rgba(232,25,127,0.2)]'
                  : 'border-pink-950/40'
              }`}
              title="Toggle Heroic Inspiration"
            >
              <span className={`text-xl leading-none block ${heroicInspiration ? 'animate-float' : 'opacity-40'}`}>
                {heroicInspiration ? '★' : '☆'}
              </span>
              <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${heroicInspiration ? 'text-pink-300' : 'text-pink-300/40'}`}>
                Inspire
              </p>
            </button>
          </div>
        </div>
      </Card>

      {/* ── Main layout ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
        <aside className="w-full lg:w-[272px] lg:flex-shrink-0 space-y-4 lg:sticky lg:top-16">
          <AbilityBlock abilityScores={abilityScores} profBonus={profBonus} />
          <SkillsBlock abilityScores={abilityScores} profBonus={profBonus} skillProfs={skillProfs} />
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* HP + Hit Dice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <HPSection
              currentHp={currentHp}
              maxHp={maxHp}
              tempHp={tempHp}
              adjustHp={adjustHp}
              setTempHp={setTempHp}
            />
            <HitDiceSection
              hitDiceSpent={hitDiceSpent}
              adjustHitDice={adjustHitDice}
              level={level}
            />
          </div>

          {/* Death Saves — only at 0 HP */}
          {currentHp === 0 && (
            <DeathSavesSection
              deathSaves={deathSaves}
              toggleDeathSave={toggleDeathSave}
              resetDeathSaves={resetDeathSaves}
            />
          )}

          {/* Rest Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={shortRest}
              className="bg-[#0a1626] hover:bg-[#0f1e38] text-slate-200 font-semibold py-1.5 px-4 rounded-lg text-sm transition-all border border-pink-950/40 hover:border-pink-800/40"
            >
              <span className="mr-1.5 opacity-60">❄</span>Short Rest
            </button>
            <button
              onClick={handleLongRest}
              className={showLongRestConfirm
                ? 'bg-red-900/60 hover:bg-red-800/70 text-white font-semibold py-1.5 px-4 rounded-lg text-sm border border-red-800/40'
                : 'bg-[#0a1626] hover:bg-[#0f1e38] text-slate-200 font-semibold py-1.5 px-4 rounded-lg text-sm transition-all border border-pink-950/40 hover:border-pink-800/40'}
            >
              {showLongRestConfirm ? '⚠ Confirm Long Rest?' : '🌙 Long Rest'}
            </button>
            {showLongRestConfirm && (
              <button
                onClick={() => setShowLongRestConfirm(false)}
                className="bg-[#0a1626] text-slate-400 font-semibold py-1.5 px-4 rounded-lg text-sm border border-pink-950/40"
              >Cancel</button>
            )}
          </div>

          {/* Class Features + Species Traits */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ClassFeaturesSection
              secondWindUsed={secondWindUsed}   toggleSecondWind={toggleSecondWind}
              actionSurgeUsed={actionSurgeUsed} toggleActionSurge={toggleActionSurge}
              ambushUsed={ambushUsed}           toggleAmbush={toggleAmbush}
              manifestEchoActive={manifestEchoActive} toggleManifestEcho={toggleManifestEcho}
              unleashIncarnationUsed={unleashIncarnationUsed}
              unleashIncarnationMax={unleashIncarnationMax}
              useUnleashIncarnation={useUnleashIncarnation}
              restoreUnleashIncarnation={restoreUnleashIncarnation}
            />
            <SpeciesTraitsSection
              felineAgilityUsed={felineAgilityUsed}
              toggleFelineAgility={toggleFelineAgility}
            />
          </div>

          {/* Weapons */}
          <WeaponsSection weapons={weapons} />

          {/* Equipment + Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EquipmentSection equipment={equipment} />
            <LanguagesSection languages={languages} />
          </div>

          {/* Notes */}
          <Card className="p-4">
            <SH>Notes</SH>
            <textarea
              value={notes ?? ''}
              onChange={e => setNotes?.(e.target.value)}
              placeholder="Session notes, reminders, tactics…"
              rows={4}
              className="w-full bg-[#030b18] border border-pink-950/40 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-pink-700/50 placeholder-slate-700 resize-none"
            />
          </Card>

        </div>
      </div>
    </div>
  )
}
