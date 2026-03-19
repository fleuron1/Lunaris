import { useState } from 'react'

export default function HitDice({
  level, hitDiceSpent, hitDiceType, conMod,
  rollHitDie,   // fn → { die, conMod, total } | null if none left
  theme = 'violet',
}) {
  const available = level - hitDiceSpent
  const [flash, setFlash] = useState(null)  // { die, conMod, total }

  const isV = theme === 'violet'
  const hdr   = isV ? 'section-header' : 'text-[10px] font-bold uppercase tracking-[0.14em] text-pink-400/55 mb-2'
  const avail = isV
    ? 'border-emerald-600/60 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30 hover:border-emerald-500/70 shadow-[0_0_6px_rgba(52,211,153,0.12)]'
    : 'border-pink-700/50 bg-pink-950/30 text-pink-300 hover:bg-pink-900/40 hover:border-pink-500/60 shadow-[0_0_6px_rgba(232,25,127,0.1)]'
  const spent = isV
    ? 'border-violet-900/25 text-violet-900/35 cursor-default'
    : 'border-pink-950/30 text-pink-900/35 cursor-default'
  const sub   = isV ? 'text-violet-300/35' : 'text-pink-300/35'
  const flashBg = isV ? 'bg-emerald-900/80 text-emerald-300 border-emerald-700/60' : 'bg-emerald-900/80 text-emerald-300 border-emerald-700/60'

  function handleClick() {
    if (available <= 0 || !rollHitDie) return
    const result = rollHitDie()
    if (!result) return
    setFlash(result)
    setTimeout(() => setFlash(null), 2200)
  }

  const conStr = conMod >= 0 ? `+${conMod}` : `${conMod}`

  return (
    <div className={`${isV ? 'card' : 'bg-[#060f1e]/90 rounded-xl border border-pink-950/50 shadow-[0_4px_20px_rgba(232,25,127,0.05)]'} p-4 space-y-3`}>
      <p className={hdr}>Hit Dice (d{hitDiceType})</p>

      {/* Die grid */}
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: level }).map((_, i) => {
          const isSpent = i >= available
          return (
            <button
              key={i}
              onClick={isSpent ? undefined : handleClick}
              disabled={isSpent}
              title={isSpent ? 'Spent' : `Roll 1d${hitDiceType}${conStr} to heal`}
              className={`w-10 h-10 rounded-lg border-2 text-[10px] font-bold transition-all duration-150 ${
                isSpent ? spent : avail
              }`}
            >
              d{hitDiceType}
            </button>
          )
        })}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <p className={`text-xs ${sub}`}>
          {available}/{level} · click to heal (1d{hitDiceType}{conStr})
        </p>

        {/* Heal flash */}
        {flash && (
          <span
            key={flash.die + flash.total + Math.random()}
            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${flashBg} animate-fade-in`}
            style={{ animation: 'fadeInUp 0.25s ease both' }}
          >
            🩹 d{hitDiceType}={flash.die} {conStr} = +{flash.total} HP
          </span>
        )}
      </div>
    </div>
  )
}
