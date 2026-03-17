import { SPELL_SLOT_MAX } from '../data/annabelle.js'

const LEVEL_LABELS = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']

export default function SpellSlots({ spellSlots, toggleSpellSlot }) {
  const activeLevels = Object.keys(SPELL_SLOT_MAX)
    .map(Number)
    .filter(lvl => SPELL_SLOT_MAX[lvl] > 0)

  return (
    <div className="card p-4 space-y-3">
      <p className="section-header">Spell Slots</p>
      <div className="space-y-2">
        {activeLevels.map(lvl => {
          const slot = spellSlots[lvl]
          return (
            <div key={lvl} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-violet-300/50 uppercase tracking-wider w-8 text-right">{LEVEL_LABELS[lvl]}</span>
              <div className="flex gap-1.5">
                {Array.from({ length: slot.total }).map((_, i) => {
                  const used = i < slot.expended
                  return (
                    <button
                      key={i}
                      onClick={() => toggleSpellSlot(lvl, i)}
                      className={`pip ${used ? 'pip-filled' : 'pip-empty'}`}
                      title={used ? 'Click to restore' : 'Click to expend'}
                    />
                  )
                })}
              </div>
              <span className="text-xs text-violet-300/40 ml-auto tabular-nums">
                {slot.total - slot.expended}/{slot.total}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
