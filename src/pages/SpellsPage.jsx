import { useState, useEffect } from 'react'
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
    school: s.school,
    castTime: s.castTime,
    range: s.range,
    conc: s.concentration,
    ritual: s.ritual,
    mat: s.material,
    source: s.source,
    notes: s.description,
  }
}

// Full spell list: lunar bonus spells (with lunar metadata) + all other sorcerer spells
const ALL_SPELLS = [
  ...Object.values(LUNAR_SPELL_MAP),
  ...sorcererSpells.filter(s => !LUNAR_NAMES.has(s.name)).map(adaptSpell),
]

// ── Spell Detail Modal ────────────────────────────────────────────────────────

function SpellModal({ spell, onClose, spellSlots, castSpell, lunarPhase }) {
  const isCantrip = spell.level === 'C'
  const isLunar = !!spell.lunar
  const isActivePhase = spell.lunar === lunarPhase
  const [selectedSlot, setSelectedSlot] = useState(isCantrip ? null : spell.level)

  // Build list of slot levels >= base level that exist
  const availableSlotLevels = isCantrip ? [] : [1,2,3,4,5,6,7,8,9].filter(lvl => {
    if (lvl < spell.level) return false
    const s = spellSlots?.[lvl]
    return s && s.total > 0
  })

  const selectedSlotData = selectedSlot ? spellSlots?.[selectedSlot] : null
  const slotsLeft = selectedSlotData ? selectedSlotData.total - selectedSlotData.expended : 0
  const noSlots = !isCantrip && slotsLeft <= 0
  const isUpcast = !isCantrip && selectedSlot > spell.level

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleCast() {
    if (isCantrip || noSlots || !selectedSlot) return
    castSpell(selectedSlot)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
          isLunar && isActivePhase
            ? PHASE_STYLES[spell.lunar] + ' border-opacity-60'
            : 'bg-[#0f0a1e] border-violet-800/40'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 pt-5 pb-4 border-b ${isLunar && isActivePhase ? 'border-current/20' : 'border-violet-800/30'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
                {spell.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-violet-300/60">
                  {isCantrip ? 'Cantrip' : `${LEVEL_LABELS[spell.level]} spell`}
                  {spell.school ? ` · ${spell.school}` : ''}
                </span>
                {spell.source && (
                  <span className="text-[10px] bg-violet-950/50 border border-violet-800/30 text-violet-400/50 px-1.5 py-0.5 rounded-full">
                    {spell.source}
                  </span>
                )}
                {isLunar && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${
                    isActivePhase ? PHASE_STYLES[spell.lunar] : 'bg-violet-950/40 border-violet-900/30 text-violet-400/50'
                  }`}>
                    {PHASE_ICONS[spell.lunar]} Lunar Bonus
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-violet-400/50 hover:text-violet-200 transition-colors text-xl leading-none mt-0.5 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 px-5 py-3 border-b border-violet-800/20 text-xs">
          <div>
            <span className="text-violet-400/50 uppercase tracking-wider">Cast Time </span>
            <span className="text-slate-200 font-medium">{spell.castTime}</span>
          </div>
          <div>
            <span className="text-violet-400/50 uppercase tracking-wider">Range </span>
            <span className="text-slate-200 font-medium">{spell.range}</span>
          </div>
          <div className="flex gap-1.5 ml-auto items-center">
            {spell.conc && (
              <span className="bg-amber-900/30 border border-amber-700/40 text-amber-300 px-2 py-0.5 rounded-full">Concentration</span>
            )}
            {spell.ritual && (
              <span className="bg-violet-950/40 border border-violet-800/40 text-violet-400/70 px-2 py-0.5 rounded-full">Ritual</span>
            )}
            {spell.mat && (
              <span className="bg-violet-950/40 border border-violet-800/40 text-violet-400/70 px-2 py-0.5 rounded-full">Material</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="px-5 py-4 max-h-48 overflow-y-auto">
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {spell.notes?.split(/(\d+d\d+(?:[+-]\d+)?)/g).map((part, i) =>
              /^\d+d\d+/.test(part)
                ? <span key={i} className="font-bold text-amber-300 text-base">{part}</span>
                : part
            )}
          </p>
        </div>

        {/* Upcast scaling info */}
        {spell.upcast && (
          <div className="px-5 pb-3">
            <div className="rounded-lg bg-violet-900/20 border border-violet-700/30 px-3 py-2 text-xs text-violet-300/70">
              <span className="text-violet-400/50 font-semibold uppercase tracking-wider mr-1.5">At Higher Levels:</span>
              {spell.upcast}
            </div>
          </div>
        )}

        {/* Footer — slot picker + cast */}
        {!isCantrip && (
          <div className="px-5 py-4 border-t border-violet-800/20 space-y-3">
            {/* Slot level picker */}
            {availableSlotLevels.length > 1 && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-violet-400/40 uppercase tracking-wider font-semibold">Slot Level</p>
                <div className="flex gap-1.5 flex-wrap">
                  {availableSlotLevels.map(lvl => {
                    const sd = spellSlots[lvl]
                    const left = sd.total - sd.expended
                    const isSel = selectedSlot === lvl
                    const isBase = lvl === spell.level
                    return (
                      <button
                        key={lvl}
                        onClick={() => setSelectedSlot(lvl)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-100 ${
                          isSel
                            ? isBase
                              ? 'bg-violet-700/60 border-violet-500/60 text-white shadow-[0_0_8px_rgba(139,92,246,0.25)]'
                              : 'bg-amber-700/50 border-amber-500/50 text-amber-100 shadow-[0_0_8px_rgba(251,191,36,0.2)]'
                            : left === 0
                              ? 'bg-violet-950/20 border-violet-900/20 text-violet-600/30 cursor-not-allowed'
                              : 'bg-violet-950/40 border-violet-800/40 text-violet-300/60 hover:border-violet-600/50 hover:text-violet-200'
                        }`}
                        disabled={left === 0}
                      >
                        {!isBase && <span className="mr-1 opacity-70">↑</span>}Lvl {lvl}
                        <span className="ml-1 opacity-60">({left})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Upcast effect callout */}
            {isUpcast && spell.upcast && (
              <div className="rounded-lg bg-amber-900/20 border border-amber-700/30 px-3 py-2 text-xs text-amber-200/80 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">⬆</span>
                <span>
                  <span className="font-semibold text-amber-300">Upcast ×{selectedSlot - spell.level}: </span>
                  {spell.upcast}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-violet-300/50">
                {selectedSlotData
                  ? <span>{slotsLeft} / {selectedSlotData.total} slots remaining at level {selectedSlot}</span>
                  : <span>No slots at this level</span>
                }
              </div>
              <button
                onClick={handleCast}
                disabled={noSlots}
                className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  noSlots
                    ? 'bg-violet-950/40 border border-violet-800/30 text-violet-500/40 cursor-not-allowed'
                    : isUpcast
                      ? 'bg-amber-700/50 border border-amber-500/50 text-amber-100 hover:bg-amber-600/60 hover:border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                      : 'bg-violet-700/60 border border-violet-500/50 text-white hover:bg-violet-600/70 hover:border-violet-400/60 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                }`}
              >
                {noSlots ? 'No Slots Left' : isUpcast ? `⬆ Cast at Level ${selectedSlot}` : `Cast (lvl ${selectedSlot} slot)`}
              </button>
            </div>
          </div>
        )}
        {isCantrip && (
          <div className="px-5 py-3 border-t border-violet-800/20 flex justify-end">
            <span className="text-xs text-violet-400/40 italic">Cantrips don't use spell slots</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Spell Card ────────────────────────────────────────────────────────────────

function SpellCard({ spell, concentration, setConcentration, lunarPhase, onOpen, spellSlots, castSpell }) {
  const isLunar = !!spell.lunar
  const isActivePhase = spell.lunar === lunarPhase
  const isConc = concentration === spell.name
  const isCantrip = spell.level === 'C'
  const slotData = !isCantrip ? spellSlots?.[spell.level] : null
  const slotsLeft = slotData ? slotData.total - slotData.expended : 0
  const noSlots = !isCantrip && slotsLeft <= 0

  function handleCast(e) {
    e.stopPropagation()
    if (isCantrip || noSlots) return
    castSpell(spell.level)
  }

  return (
    <div
      onClick={() => onOpen(spell)}
      className={`rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
        isLunar && isActivePhase
          ? PHASE_STYLES[spell.lunar]
          : 'bg-violet-950/20 border-violet-900/25 hover:border-violet-600/50 hover:bg-violet-950/30'
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
            <p className="text-xs text-slate-400/70 mt-1 leading-snug line-clamp-2">{spell.notes}</p>
          )}
        </div>

        {/* Right-side buttons */}
        <div className="flex flex-col gap-1 flex-shrink-0 items-end">
          {spell.conc && (
            <button
              onClick={(e) => { e.stopPropagation(); setConcentration(isConc ? null : spell.name) }}
              className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all duration-150 ${
                isConc
                  ? 'bg-amber-600/80 text-white shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                  : 'bg-violet-950/50 border border-violet-800/40 text-violet-300/50 hover:border-violet-500/50 hover:text-violet-200'
              }`}
            >
              {isConc ? 'Conc. ✓' : 'Conc.'}
            </button>
          )}
          {!isCantrip && (
            <button
              onClick={handleCast}
              disabled={noSlots}
              className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all duration-150 ${
                noSlots
                  ? 'bg-violet-950/30 border border-violet-900/20 text-violet-600/30 cursor-not-allowed'
                  : 'bg-violet-800/40 border border-violet-600/40 text-violet-200 hover:bg-violet-700/50 hover:border-violet-500/60'
              }`}
              title={noSlots ? 'No spell slots remaining' : `Cast (uses 1 level ${spell.level} slot)`}
            >
              {noSlots ? '✕ Cast' : '⚡ Cast'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SpellsPage({ concentration, setConcentration, lunarPhase, spellSaveDC, spellAttackBonus, knownSpells, knownCantrips, spellSlots, castSpell }) {
  const [selectedSpell, setSelectedSpell] = useState(null)

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

      {/* Spell detail modal */}
      {selectedSpell && (
        <SpellModal
          spell={selectedSpell}
          onClose={() => setSelectedSpell(null)}
          spellSlots={spellSlots}
          castSpell={castSpell}
          lunarPhase={lunarPhase}
        />
      )}

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

      {/* Slot tracker summary */}
      {spellSlots && (
        <div className="flex flex-wrap gap-2">
          {[1,2,3,4,5,6,7,8,9].map(lvl => {
            const slot = spellSlots[lvl]
            if (!slot || slot.total === 0) return null
            const left = slot.total - slot.expended
            return (
              <div key={lvl} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${
                left === 0
                  ? 'bg-violet-950/20 border-violet-900/20 text-violet-600/40'
                  : 'bg-violet-950/30 border-violet-800/40 text-violet-300'
              }`}>
                <span className="text-violet-400/50">Lvl {lvl}</span>
                <span className={left === 0 ? 'text-violet-600/40' : 'text-amber-300 font-bold'}>{left}/{slot.total}</span>
              </div>
            )
          })}
        </div>
      )}

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
                  onOpen={setSelectedSpell}
                  spellSlots={spellSlots}
                  castSpell={castSpell}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
