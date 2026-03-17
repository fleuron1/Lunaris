import { SAVE_PROFICIENCIES } from '../data/annabelle.js'

const ABILITY_NAMES = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }

export function getMod(score) {
  return Math.floor((score - 10) / 2)
}

export function fmtMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export default function AbilityBlock({ abilityScores, profBonus }) {
  return (
    <div className="card p-4">
      <p className="section-header">Ability Scores</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
        {Object.entries(abilityScores).map(([key, score]) => {
          const m = getMod(score)
          const saveProficient = SAVE_PROFICIENCIES.includes(key)
          const saveBonus = saveProficient ? m + profBonus : m
          return (
            <div key={key} className="stat-box flex flex-col items-center py-3">
              <p className="text-[10px] font-bold text-violet-300/50 tracking-widest">{ABILITY_NAMES[key]}</p>
              <p className="text-2xl font-bold leading-none mt-1 text-amber-300">{fmtMod(m)}</p>
              <p className="text-xs text-violet-300/35 mt-0.5">{score}</p>
              <div className="mt-2 border-t border-violet-900/30 pt-2 w-full text-center">
                <p className="text-[9px] text-violet-300/40 uppercase tracking-widest">Save</p>
                <p className={`text-sm font-bold ${saveProficient ? 'text-violet-300' : 'text-slate-400'}`}>
                  {saveProficient && <span className="mr-0.5 text-violet-400">●</span>}
                  {fmtMod(saveBonus)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
