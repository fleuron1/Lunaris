import DiceText from './DiceText.jsx'

// Generic per-class resource tracker (Rage, Ki, Lay on Hands, Action Surge, …).
// Driven entirely by classResourceDefs from useCharacterState — no class-specific
// code here, so new resources added in classes.js show up automatically.
const RECHARGE_LABEL = { short: 'short rest', long: 'long rest' }

function Pips({ current, max, onSet }) {
  // For small counters: clicking pip i sets the value so that i becomes the
  // boundary (spend down to i, or restore up to i+1).
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSet(i < current ? i : i + 1)}
          className={`pip ${i < current ? 'pip-filled' : 'pip-empty'}`}
          title={`${i < current ? 'Spend' : 'Restore'} to ${i < current ? i : i + 1}`}
        />
      ))}
    </div>
  )
}

function Pool({ current, max, onAdjust }) {
  const step = max >= 25 ? 5 : 1
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onAdjust(-step)} className="btn-sm" title={`−${step}`}>−</button>
      <div className="text-center min-w-[68px]">
        <span className="text-2xl font-bold text-emerald-300 tabular-nums">{current}</span>
        <span className="text-violet-300/40 text-sm"> / {max}</span>
      </div>
      <button onClick={() => onAdjust(step)} className="btn-sm" title={`+${step}`}>+</button>
      {step > 1 && (
        <div className="flex gap-1 ml-1">
          <button onClick={() => onAdjust(-1)} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-950/50 border border-violet-800/40 text-violet-300/70 hover:text-violet-100">−1</button>
          <button onClick={() => onAdjust(1)} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-950/50 border border-violet-800/40 text-violet-300/70 hover:text-violet-100">+1</button>
        </div>
      )}
    </div>
  )
}

export default function ClassResources({ defs = [], values = {}, adjustClassResource, setClassResource }) {
  if (!defs.length) return null
  const tracked = defs.filter(d => d.kind === 'uses' || d.kind === 'pool')
  const statics = defs.filter(d => d.kind === 'static')

  return (
    <div className="card p-4 space-y-3">
      <p className="section-header">Class Resources</p>

      <div className="space-y-3">
        {tracked.map(d => {
          const current = values[d.id] ?? d.max
          return (
            <div key={d.id} className="bg-violet-950/30 rounded-lg p-3 border border-violet-900/20">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-violet-200">{d.name}</span>
                <span className="text-[10px] text-violet-300/45 uppercase tracking-wider">
                  {d.kind === 'uses' ? `${current}/${d.max} · ` : ''}{RECHARGE_LABEL[d.recharge]}
                </span>
              </div>
              {d.kind === 'uses'
                ? <Pips current={current} max={d.max} onSet={v => setClassResource(d.id, v)} />
                : <Pool current={current} max={d.max} onAdjust={delta => adjustClassResource(d.id, delta)} />}
              {d.note && <p className="text-[11px] text-slate-500 mt-1.5 leading-snug"><DiceText text={d.note} label={d.name} /></p>}
            </div>
          )
        })}

        {statics.map(d => (
          <div key={d.id} className="flex items-center justify-between bg-violet-950/30 rounded-lg px-3 py-2 border border-violet-900/20">
            <span className="text-sm font-semibold text-violet-200">{d.name}</span>
            <span className="text-sm font-bold text-amber-300 tabular-nums">{d.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
