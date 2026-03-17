import { SPELLS as LUNAR_SPELLS, COMBAT, LUNAR_PHASES } from '../data/annabelle.js'
import sorcererSpells from '../data/sorcerer-spells.json'

const LEVEL_LABELS = { C: 'Cantrip', 1: '1st Level', 2: '2nd Level', 3: '3rd Level', 4: '4th Level', 5: '5th Level', 6: '6th Level', 7: '7th Level', 8: '8th Level', 9: '9th Level' }

const PHASE_STYLES = {
  full:     'bg-amber-900/20 border-amber-700/40 text-amber-200',
  new:      'bg-slate-800/40 border-slate-600/40 text-slate-300',
  crescent: 'bg-violet-900/20 border-violet-700/40 text-violet-200',
}

const PHASE_ICONS = { full: '🌕', new: '🌑', crescent: '🌙' }

// Lunar bonus spells from annabelle.js (have curated notes + lunar field)
const LUNAR_SPELL_MAP = {}
LUNAR_SPELLS.filter(s => s.lunar).forEach(s => { LUNAR_SPELL_MAP[s.name] = s })
const LUNAR_NAMES = new Set(Object.keys(LUNAR_SPELL_MAP))

// Convert sorcerer-spells.json entry to the shape SpellCard expects
function adaptSpell(s) {
  return {
    name: s.name,
    level: s.level === 0 ? 'C' : s.level,
    castTime: s.castTime,
    range: s.range,
    conc: s.concentration,
    ritual: s.ritual,
    mat: s.material,
    notes: s.description,
  }
}

// Full spell list: lunar bonus spells (with lunar metadata) + all other sorcerer spells
const ALL_SPELLS = [
  ...Object.values(LUNAR_SPELL_MAP),
  ...sorcererSpells.filter(s => !LUNAR_NAMES.has(s.name)).map(adaptSpell),
]

function SpellCard({ spell, concentration, setConcentration, lunarPhase }) {
  const isLunar = !!spell.lunar
  const isActivePhase = spell.lunar === lunarPhase
  const isConc = concentration === spell.name

  return (
    <div
      className={`rounded-xl border p-3 transition-all duration-200 ${
        isLunar && isActivePhase
          ? PHASE_STYLES[spell.lunar]
          : 'bg-violet-950/20 border-violet-900/25 hover:border-violet-700/30'
      } ${isConc ? 'ring-1 ring-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.1)]' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-semibold text-sm text-slate-200">{spell.name}</p>
            {isLunar && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${
                  isActivePhase ? PHASE_STYLES[spell.lunar] : 'bg-violet-950/40 border-violet-900/30 text-violet-400/50'
                }`}
                title={LUNAR_PHASES[spell.lunar].name}
              >
                {PHASE_ICONS[spell.lunar]}
              </span>
            )}
            {spell.conc && (
              <span className="text-[10px] bg-amber-900/30 border border-amber-700/40 text-amber-300 px-1.5 py-0.5 rounded-full">C</span>
            )}
            {spell.ritual && (
              <span className="text-[10px] bg-violet-950/40 border border-violet-800/40 text-violet-400/60 px-1.5 py-0.5 rounded-full">R</span>
            )}
            {spell.mat && (
              <span className="text-[10px] bg-violet-950/40 border border-violet-800/40 text-violet-400/60 px-1.5 py-0.5 rounded-full">M</span>
            )}
          </div>
          <div className="flex gap-3 mt-1 text-[11px] text-violet-300/40">
            <span>{spell.castTime}</span>
            <span>{spell.range}</span>
          </div>
          {spell.notes && (
            <p className="text-xs text-slate-400/70 mt-1 leading-snug line-clamp-3">{spell.notes}</p>
          )}
        </div>
        {spell.conc && (
          <button
            onClick={() => setConcentration(isConc ? null : spell.name)}
            className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 transition-all duration-150 ${
              isConc
                ? 'bg-amber-600/80 text-white shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                : 'bg-violet-950/50 border border-violet-800/40 text-violet-300/50 hover:border-violet-500/50 hover:text-violet-200'
            }`}
          >
            {isConc ? 'Conc. ✓' : 'Conc.'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function SpellsPage({ concentration, setConcentration, lunarPhase, spellSaveDC, spellAttackBonus, knownSpells, knownCantrips }) {
  const grouped = {}
  ALL_SPELLS.forEach(spell => {
    const isCantrip = spell.level === 'C'
    // Lunar bonus spells are always shown; other spells only if known
    const show = spell.lunar
      ? true
      : isCantrip
        ? !knownCantrips || knownCantrips.includes(spell.name)
        : !knownSpells || knownSpells.includes(spell.name)
    if (!show) return
    const key = spell.level
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(spell)
  })

  const levelOrder = ['C', 1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">

      {/* Header */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
              Spells
            </h2>
            <div className="flex gap-5 mt-1.5 text-sm">
              <div>
                <span className="text-violet-300/50 text-xs uppercase tracking-wider">Ability </span>
                <span className="font-bold text-violet-300">{COMBAT.spellcastingAbility}</span>
              </div>
              <div>
                <span className="text-violet-300/50 text-xs uppercase tracking-wider">Save DC </span>
                <span className="font-bold text-amber-300">{spellSaveDC ?? COMBAT.spellSaveDC}</span>
              </div>
              <div>
                <span className="text-violet-300/50 text-xs uppercase tracking-wider">Atk </span>
                <span className="font-bold text-amber-300">+{spellAttackBonus ?? COMBAT.spellAttackBonus}</span>
              </div>
            </div>
          </div>

          {concentration && (
            <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/40 rounded-xl px-3 py-2 ml-auto">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Concentrating:</span>
              <span className="text-amber-200 text-sm">{concentration}</span>
              <button
                onClick={() => setConcentration(null)}
                className="ml-2 text-amber-600 hover:text-amber-300 text-xs transition-colors"
              >
                End
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(LUNAR_PHASES).map(([key, p]) => (
          <span
            key={key}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              lunarPhase === key ? PHASE_STYLES[key] : 'bg-violet-950/20 border-violet-900/25 text-violet-400/40'
            }`}
          >
            {PHASE_ICONS[key]} <span className="font-semibold">{p.name}:</span> {p.bonusSpells.join(', ')}
          </span>
        ))}
      </div>

      {/* Spell levels */}
      {levelOrder.map(level => {
        const spells = grouped[level]
        if (!spells) return null
        return (
          <div key={level} className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-[11px] font-bold text-violet-300/50 uppercase tracking-[0.14em]">
                ✦ {LEVEL_LABELS[level] || `Level ${level}`}
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-violet-800/40 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {spells.map(spell => (
                <SpellCard
                  key={spell.name}
                  spell={spell}
                  concentration={concentration}
                  setConcentration={setConcentration}
                  lunarPhase={lunarPhase}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
