import { LUNAR_PHASES } from '../data/annabelle.js'

const PHASE_ICONS = { full: '🌕', new: '🌑', crescent: '🌙' }

const COLOR_MAP = {
  amber:  {
    active: 'bg-amber-900/30 border-amber-500/50 text-amber-200',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
  },
  slate:  {
    active: 'bg-slate-700/40 border-slate-400/40 text-slate-200',
    glow: '',
  },
  purple: {
    active: 'bg-violet-900/40 border-violet-400/50 text-violet-200',
    glow: 'shadow-[0_0_12px_rgba(139,92,246,0.2)]',
  },
}

export default function LunarPhaseSwitcher({ phase, setPhase }) {
  const active = LUNAR_PHASES[phase]

  return (
    <div className="card p-4 space-y-3">
      <p className="section-header">Lunar Phase</p>

      <div className="grid grid-cols-3 gap-2">
        {Object.entries(LUNAR_PHASES).map(([key, p]) => {
          const isActive = phase === key
          const cm = COLOR_MAP[p.color]
          return (
            <button
              key={key}
              onClick={() => setPhase(key)}
              className={`
                flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 transition-all duration-200 text-sm font-semibold
                ${isActive
                  ? cm.active + ' ' + cm.glow
                  : 'border-violet-900/25 bg-violet-950/20 hover:bg-violet-900/20 text-slate-400 hover:text-slate-200'
                }
              `}
            >
              <span className={`text-xl ${isActive ? 'animate-float' : 'opacity-70'}`}>
                {PHASE_ICONS[key]}
              </span>
              <span className="text-[10px] leading-tight text-center font-bold uppercase tracking-wide">
                {p.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active phase info */}
      <div className="bg-violet-950/30 rounded-xl p-3 space-y-2 border border-violet-900/20">
        <div>
          <span className="text-[10px] font-bold text-violet-300/50 uppercase tracking-widest">✦ Bonus Spells</span>
          <p className="text-sm text-violet-200 font-medium mt-0.5">{active.bonusSpells.join(' · ')}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-violet-300/50 uppercase tracking-widest">✦ Embodiment</span>
          <p className="text-sm text-slate-300/80 leading-snug mt-0.5">{active.embodiment}</p>
        </div>
        <p className="text-[10px] text-violet-400/40 italic">{active.tip}</p>
      </div>
    </div>
  )
}
