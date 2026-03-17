import { useState } from 'react'

export default function HPTracker({ currentHp, maxHp, tempHp, adjustHp, setTempHp }) {
  const [hpInput, setHpInput] = useState('')
  const [mode, setMode] = useState('heal') // 'heal' | 'damage'

  function applyInput() {
    const val = parseInt(hpInput, 10)
    if (isNaN(val) || val <= 0) return
    adjustHp(mode === 'heal' ? val : -val)
    setHpInput('')
  }

  function handleKey(e) {
    if (e.key === 'Enter') applyInput()
  }

  const hpPercent = Math.round((currentHp / (maxHp || 1)) * 100)
  const barColor =
    hpPercent > 50 ? 'bg-emerald-500' :
    hpPercent > 25 ? 'bg-yellow-500' :
    'bg-red-500'

  return (
    <div className="card p-4 space-y-3">
      <p className="section-header">Hit Points</p>

      {/* HP bar */}
      <div className="h-1.5 bg-violet-950/60 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>

      {/* Current / Max */}
      <div className="flex items-end justify-center gap-2">
        <button onClick={() => adjustHp(-1)} className="btn-sm">−</button>
        <div className="text-center">
          <span className="text-5xl font-bold tabular-nums leading-none text-amber-300">{currentHp}</span>
          <span className="text-violet-300/50 text-lg"> / {maxHp}</span>
          <p className="text-[10px] text-violet-300/40 uppercase tracking-widest mt-0.5">Current / Max</p>
        </div>
        <button onClick={() => adjustHp(1)} className="btn-sm">+</button>
      </div>

      {/* Quick input */}
      <div className="flex gap-2 items-center">
        <div className="flex rounded-md overflow-hidden border border-slate-600 text-sm">
          <button
            onClick={() => setMode('heal')}
            className={`px-3 py-1.5 font-semibold transition-colors rounded-l ${mode === 'heal' ? 'bg-emerald-700 text-white' : 'bg-[#12163a] text-slate-400 hover:bg-violet-900/30'}`}
          >
            Heal
          </button>
          <button
            onClick={() => setMode('damage')}
            className={`px-3 py-1.5 font-semibold transition-colors rounded-r ${mode === 'damage' ? 'bg-red-800/80 text-white' : 'bg-[#12163a] text-slate-400 hover:bg-violet-900/30'}`}
          >
            Dmg
          </button>
        </div>
        <input
          type="number"
          min="1"
          value={hpInput}
          onChange={e => setHpInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="amount"
          className="flex-1 bg-[#0c1030] border border-violet-900/40 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-violet-500/50 w-0 placeholder-slate-600"
        />
        <button onClick={applyInput} className="btn-primary">Apply</button>
      </div>

      {/* Temp HP */}
      <div className="flex items-center gap-3 pt-1 border-t border-violet-900/25">
        <span className="text-xs text-violet-300/50 font-semibold uppercase tracking-wider">Temp HP</span>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setTempHp(tempHp - 1)} className="btn-sm">−</button>
          <span className="text-xl font-bold tabular-nums w-8 text-center text-cyan-400">{tempHp}</span>
          <button onClick={() => setTempHp(tempHp + 1)} className="btn-sm">+</button>
        </div>
      </div>
    </div>
  )
}
