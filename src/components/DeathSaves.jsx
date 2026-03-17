export default function DeathSaves({ deathSaves, toggleDeathSave, resetDeathSaves, currentHp }) {
  if (currentHp > 0) return null

  return (
    <div className="card p-4 space-y-3 border-red-900/50 shadow-[0_0_20px_rgba(185,28,28,0.1)]">
      <div className="flex items-center justify-between">
        <p className="section-header text-red-400/70" style={{ '--tw-content': '' }}>
          ✦ Death Saves
        </p>
        <button onClick={resetDeathSaves} className="text-xs text-violet-300/30 hover:text-slate-300 transition-colors">
          Reset
        </button>
      </div>

      {[
        { type: 'successes', label: 'Successes', color: 'emerald' },
        { type: 'failures',  label: 'Failures',  color: 'red' },
      ].map(({ type, label, color }) => (
        <div key={type} className="flex items-center gap-3">
          <span className={`text-xs font-semibold text-${color}-400/70 w-20`}>{label}</span>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => {
              const filled = i < deathSaves[type]
              return (
                <button
                  key={i}
                  onClick={() => toggleDeathSave(type, i)}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    filled
                      ? color === 'emerald'
                        ? 'bg-emerald-600 border-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                        : 'bg-red-700 border-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                      : color === 'emerald'
                        ? 'border-emerald-800/60 hover:border-emerald-500/60'
                        : 'border-red-900/50 hover:border-red-500/60'
                  }`}
                />
              )
            })}
          </div>
        </div>
      ))}

      {deathSaves.failures >= 3 && (
        <p className="text-red-400 text-sm font-bold text-center animate-pulse">✦ 3 Failures — Character Dead ✦</p>
      )}
      {deathSaves.successes >= 3 && (
        <p className="text-emerald-400 text-sm font-bold text-center">✦ 3 Successes — Stable! ✦</p>
      )}
    </div>
  )
}
