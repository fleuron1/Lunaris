import { COMBAT } from '../data/annabelle.js'

export default function HitDice({ hitDiceSpent, adjustHitDice }) {
  const remaining = COMBAT.hitDiceTotal - hitDiceSpent

  return (
    <div className="card p-4 space-y-3">
      <p className="section-header">Hit Dice</p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => adjustHitDice(1)} className="btn-sm" title="Spend a die">−</button>
        <div className="text-center">
          <span className="text-4xl font-bold tabular-nums text-amber-300">{remaining}</span>
          <span className="text-violet-300/40 text-lg"> / {COMBAT.hitDiceTotal}</span>
          <p className="text-[10px] text-violet-300/40 uppercase tracking-widest mt-0.5">
            d{COMBAT.hitDiceType} Remaining
          </p>
        </div>
        <button onClick={() => adjustHitDice(-1)} className="btn-sm" title="Restore a die">+</button>
      </div>
      <div className="flex gap-1.5 justify-center flex-wrap">
        {Array.from({ length: COMBAT.hitDiceTotal }).map((_, i) => {
          const spent = i >= remaining
          return (
            <div
              key={i}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[9px] font-bold transition-colors ${
                spent
                  ? 'border-violet-900/30 text-violet-900/40'
                  : 'border-emerald-600/60 text-emerald-500'
              }`}
            >
              d
            </div>
          )
        })}
      </div>
    </div>
  )
}
