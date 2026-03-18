import { useState } from 'react'
import { useDiceRoller } from '../components/DiceRoller.jsx'
import AbilityBlock from '../components/AbilityBlock.jsx'
import SkillsList from '../components/SkillsList.jsx'
import HPTracker from '../components/HPTracker.jsx'
import SpellSlots from '../components/SpellSlots.jsx'
import SorceryPoints from '../components/SorceryPoints.jsx'
import HitDice from '../components/HitDice.jsx'
import DeathSaves from '../components/DeathSaves.jsx'
import LunarPhaseSwitcher from '../components/LunarPhaseSwitcher.jsx'
import { CLASS_FEATURES, SPECIES_TRAITS } from '../data/annabelle.js'
import metamagicData from '../data/metamagic.json'

function StatBadge({ label, value, sub }) {
  return (
    <div className="stat-box flex flex-col items-center min-w-[64px] px-3 py-2.5">
      <p className="text-lg font-bold text-amber-300 leading-none">{value}</p>
      {sub && <p className="text-[9px] text-violet-300/45 mt-0.5">{sub}</p>}
      <p className="text-[9px] text-violet-300/50 font-bold uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-400/40">✦ {label} ✦</span>
      <div className="flex-1 h-px bg-gradient-to-r from-violet-800/40 to-transparent" />
    </div>
  )
}

export default function SheetPage({
  currentHp, maxHp, tempHp, hitDiceSpent, deathSaves,
  spellSlots, sorceryPoints, maxSorceryPoints, heroicInspiration, lunarPhase,
  level, profBonus, abilityScores,
  adjustHp, setTempHp, toggleDeathSave, resetDeathSaves,
  toggleSpellSlot, adjustSorceryPoints, setLunarPhase,
  toggleInspiration, adjustHitDice, shortRest, longRest,
  // State-driven fields
  weapons, equipment, feats, languages, skillProfs,
  ac, speed, characterName, background,
  spellSaveDC, spellAttackBonus, chosenMetamagic,
}) {
  const [showLongRestConfirm, setShowLongRestConfirm] = useState(false)
  const { roll } = useDiceRoller()

  function handleLongRest() {
    if (showLongRestConfirm) {
      longRest()
      setShowLongRestConfirm(false)
    } else {
      setShowLongRestConfirm(true)
    }
  }

  // Passive perception with skillProfs
  const wisMod = Math.floor((abilityScores.wis - 10) / 2)
  const percProf = skillProfs?.['Perception']
  const passPerc = 10 + wisMod + (percProf === 'expert' ? profBonus * 2 : percProf === 'proficient' ? profBonus : 0)

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">

      {/* ── Character Header ──────────────────────────────── */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-4">

          {/* Name + identity */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-3xl sm:text-4xl font-bold text-white leading-none"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              {characterName || 'Annabelle'}
            </h1>
            <p className="text-slate-300 text-sm mt-1.5">
              <span className="text-violet-300">Warforged</span>
              <span className="text-violet-500/50 mx-1.5">·</span>
              <span className="text-violet-200">Sorcerer</span>
              <span className="text-slate-500 text-xs"> (Lunar)</span>
              <span className="text-violet-500/50 mx-1.5">·</span>
              <span className="text-amber-300/80">Level {level}</span>
            </p>
            <p className="text-slate-500 text-xs mt-0.5">{background || 'Haunted One'} Background</p>
          </div>

          {/* Combat stats row */}
          <div className="flex flex-wrap gap-2 items-center">
            <StatBadge label="AC" value={ac ?? 11} />
            <StatBadge label="Speed" value={speed ?? 30} sub="ft" />
            <StatBadge label="Size" value="Med" />
            <StatBadge label="Pass. Perc." value={passPerc} />
            <StatBadge label="Prof. Bonus" value={`+${profBonus}`} />

            {/* Inspiration */}
            <button
              onClick={toggleInspiration}
              className={`stat-box min-w-[64px] px-3 py-2.5 flex flex-col items-center transition-all duration-200 ${
                heroicInspiration
                  ? 'border-amber-500/60 bg-amber-900/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : ''
              }`}
              title="Toggle Heroic Inspiration"
            >
              <span className={`text-xl leading-none ${heroicInspiration ? 'animate-float' : 'opacity-40'}`}>
                {heroicInspiration ? '★' : '☆'}
              </span>
              <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${heroicInspiration ? 'text-amber-300' : 'text-violet-300/50'}`}>
                Inspire
              </p>
            </button>
          </div>

          {/* Spellcasting */}
          <div className="flex gap-4 items-center border-l border-violet-800/30 pl-4">
            <div className="text-center">
              <p className="text-[10px] text-violet-300/50 uppercase tracking-widest">Ability</p>
              <p className="text-sm font-bold text-violet-300 mt-0.5">CHA</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-violet-300/50 uppercase tracking-widest">Save DC</p>
              <p className="text-sm font-bold text-amber-300 mt-0.5">{spellSaveDC}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-violet-300/50 uppercase tracking-widest">Atk Bonus</p>
              <p className="text-sm font-bold text-amber-300 mt-0.5">+{spellAttackBonus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout: sidebar + content ────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* ── LEFT SIDEBAR ───────────────────────────────── */}
        <aside className="w-full lg:w-[272px] lg:flex-shrink-0 space-y-4 lg:sticky lg:top-16">
          <LunarPhaseSwitcher phase={lunarPhase} setPhase={setLunarPhase} />
          <AbilityBlock abilityScores={abilityScores} profBonus={profBonus} />
          <SkillsList abilityScores={abilityScores} profBonus={profBonus} skillProfs={skillProfs} />
        </aside>

        {/* ── MAIN CONTENT ───────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* HP + Spell Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <HPTracker
              currentHp={currentHp}
              maxHp={maxHp}
              tempHp={tempHp}
              adjustHp={adjustHp}
              setTempHp={setTempHp}
            />
            <SpellSlots spellSlots={spellSlots} toggleSpellSlot={toggleSpellSlot} />
          </div>

          {/* Sorcery Points + Hit Dice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SorceryPoints
              sorceryPoints={sorceryPoints}
              maxSorceryPoints={maxSorceryPoints}
              adjustSorceryPoints={adjustSorceryPoints}
            />
            <HitDice hitDiceSpent={hitDiceSpent} adjustHitDice={adjustHitDice} />
          </div>

          {/* Death Saves */}
          <DeathSaves
            deathSaves={deathSaves}
            toggleDeathSave={toggleDeathSave}
            resetDeathSaves={resetDeathSaves}
            currentHp={currentHp}
          />

          {/* Rest Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={shortRest} className="btn-secondary">
              <span className="mr-1.5 opacity-60">☽</span> Short Rest
            </button>
            <button
              onClick={handleLongRest}
              className={showLongRestConfirm ? 'btn-danger' : 'btn-secondary'}
            >
              {showLongRestConfirm ? '⚠ Confirm Long Rest?' : '🌕 Long Rest'}
            </button>
            {showLongRestConfirm && (
              <button onClick={() => setShowLongRestConfirm(false)} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>

          {/* Feats — only shown if any chosen */}
          {feats && feats.length > 0 && (
            <div className="card p-4">
              <p className="section-header">Feats</p>
              <div className="flex flex-wrap gap-2">
                {feats.map(feat => (
                  <span
                    key={feat}
                    className="bg-violet-950/50 text-violet-300/80 text-xs px-2.5 py-1 rounded-full border border-violet-800/40"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metamagic — only shown if level >= 3 and any chosen */}
          {chosenMetamagic && chosenMetamagic.length > 0 && (
            <div className="card p-4">
              <p className="section-header">Metamagic</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {chosenMetamagic.map(name => {
                  const mm = metamagicData.find(m => m.name === name)
                  if (!mm) return null
                  return (
                    <div key={name} className="bg-violet-950/30 rounded-lg p-3 border border-violet-900/20">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-violet-300 text-sm flex-1">{mm.name}</p>
                        <span className="text-[10px] bg-violet-900/50 border border-violet-700/40 text-violet-300 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                          {mm.spCost} SP
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{mm.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Weapons */}
          <div className="card p-4">
            <p className="section-header">Weapons & Attacks</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-violet-300/50 border-b border-violet-900/30 uppercase tracking-wider">
                    <th className="text-left pb-2 font-semibold">Name</th>
                    <th className="text-center pb-2 font-semibold">Atk Bonus</th>
                    <th className="text-left pb-2 font-semibold">Damage</th>
                    <th className="text-left pb-2 font-semibold hidden sm:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(weapons || []).map(w => (
                    <tr key={w.id} className="border-b border-violet-900/20 hover:bg-violet-900/10 transition-colors">
                      <td className="py-2.5 font-medium text-slate-200">{w.name}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-amber-300">{w.atkBonus}</td>
                      <td
                        className="py-2.5 text-violet-300/80 cursor-pointer hover:text-violet-200 group transition-colors"
                        onClick={() => roll(w.name, w.damage, 'violet')}
                        title="Click to roll damage"
                      >
                        <span className="group-hover:underline underline-offset-2">{w.damage}</span>
                        <span className="ml-1.5 text-violet-500/40 group-hover:text-violet-400/70 text-[11px] transition-colors">🎲</span>
                      </td>
                      <td className="py-2.5 text-slate-500 text-xs hidden sm:table-cell">{w.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Class Features + Species Traits */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="card p-4">
              <p className="section-header">Class Features</p>
              <div className="space-y-2">
                {CLASS_FEATURES.map(f => (
                  <div key={f.name} className="bg-violet-950/30 rounded-lg p-3 border border-violet-900/20">
                    <p className="font-semibold text-violet-300 text-sm">{f.name}</p>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <p className="section-header">Species Traits — Warforged</p>
              <div className="space-y-2">
                {SPECIES_TRAITS.map(t => (
                  <div key={t.name} className="bg-violet-950/30 rounded-lg p-3 border border-violet-900/20">
                    <p className="font-semibold text-amber-300/80 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Equipment + Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-4">
              <p className="section-header">Equipment</p>
              <ul className="space-y-1.5">
                {(equipment || []).map(item => (
                  <li key={item.id} className="text-sm text-slate-300 flex gap-2 items-start">
                    <span className="text-violet-500/50 mt-0.5 text-xs flex-shrink-0">
                      {item.isMagic ? '✨' : '✦'}
                    </span>
                    <span>
                      <span className={item.isMagic ? 'text-amber-300/90' : ''}>{item.name}</span>
                      {item.description && (
                        <span className="text-slate-500 text-xs block">{item.description}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-4 space-y-4">
              <div>
                <p className="section-header">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {(languages || []).map(lang => (
                    <span key={lang} className="bg-violet-950/50 text-violet-300/80 text-xs px-2.5 py-1 rounded-full border border-violet-800/40">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              <SectionDivider label="Spellcasting" />
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-violet-300/50 uppercase tracking-wider">Ability</p>
                  <p className="text-sm font-bold text-violet-300 mt-0.5">CHA</p>
                </div>
                <div>
                  <p className="text-[10px] text-violet-300/50 uppercase tracking-wider">Save DC</p>
                  <p className="text-sm font-bold text-amber-300 mt-0.5">{spellSaveDC}</p>
                </div>
                <div>
                  <p className="text-[10px] text-violet-300/50 uppercase tracking-wider">Atk Bonus</p>
                  <p className="text-sm font-bold text-amber-300 mt-0.5">+{spellAttackBonus}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
