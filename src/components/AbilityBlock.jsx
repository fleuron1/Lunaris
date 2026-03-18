import { SAVE_PROFICIENCIES } from '../data/annabelle.js'
import { useDiceRoller } from './DiceRoller.jsx'

const ABILITY_NAMES = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' }

export function getMod(score) {
  return Math.floor((score - 10) / 2)
}

export function fmtMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export default function AbilityBlock({ abilityScores, profBonus }) {
  const { roll } = useDiceRoller()

  return (
    <div className="card p-4">
      <p className="section-header">Ability Scores</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
        {Object.entries(abilityScores).map(([key, score]) => {
          const m = getMod(score)
          const saveProficient = SAVE_PROFICIENCIES.includes(key)
          const saveBonus = saveProficient ? m + profBonus : m
          const checkNotation = m >= 0 ? `1d20+${m}` : `1d20-${Math.abs(m)}`
          const saveNotation  = saveBonus >= 0 ? `1d20+${saveBonus}` : `1d20-${Math.abs(saveBonus)}`
          return (
            <div key={key} className="stat-box flex flex-col items-center py-3">
              <p className="text-[10px] font-bold text-violet-300/50 tracking-widest">{ABILITY_NAMES[key]}</p>
              {/* Ability check — click modifier */}
              <button
                onClick={() => roll(`${ABILITY_NAMES[key]} Check`, checkNotation, 'violet')}
                title={`Roll ${ABILITY_NAMES[key]} check (${checkNotation})`}
                className="text-2xl font-bold leading-none mt-1 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
              >
                {fmtMod(m)}
              </button>
              <p className="text-xs text-violet-300/35 mt-0.5">{score}</p>
              <div className="mt-2 border-t border-violet-900/30 pt-2 w-full text-center">
                <p className="text-[9px] text-violet-300/40 uppercase tracking-widest">Save</p>
                {/* Saving throw — click save bonus */}
                <button
                  onClick={() => roll(`${ABILITY_NAMES[key]} Save`, saveNotation, 'violet')}
                  title={`Roll ${ABILITY_NAMES[key]} save (${saveNotation})`}
                  className={`text-sm font-bold transition-colors cursor-pointer ${saveProficient ? 'text-violet-300 hover:text-violet-200' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  {saveProficient && <span className="mr-0.5 text-violet-400">●</span>}
                  {fmtMod(saveBonus)}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
