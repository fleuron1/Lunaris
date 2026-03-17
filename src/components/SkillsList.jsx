import { SKILLS } from '../data/annabelle.js'
import { getMod, fmtMod } from './AbilityBlock.jsx'

export default function SkillsList({ abilityScores, profBonus, skillProfs }) {
  return (
    <div className="card p-4">
      <p className="section-header">Skills</p>
      <div className="space-y-0.5 text-sm">
        {SKILLS.map(skill => {
          const profLevel = skillProfs?.[skill.name] ?? (skill.proficient ? 'proficient' : 'none')
          const abilMod = getMod(abilityScores[skill.ability])
          const bonus = profLevel === 'expert'
            ? abilMod + profBonus * 2
            : profLevel === 'proficient'
              ? abilMod + profBonus
              : abilMod
          const isProf = profLevel === 'proficient'
          const isExpert = profLevel === 'expert'
          return (
            <div key={skill.name} className="flex items-center gap-2 py-[3px] hover:bg-violet-900/10 rounded px-1 transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isExpert
                  ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]'
                  : isProf
                    ? 'bg-violet-400 shadow-[0_0_4px_rgba(167,139,250,0.5)]'
                    : 'bg-violet-900/40 border border-violet-800/40'
              }`} />
              <span className="text-[10px] text-violet-300/40 uppercase tracking-wider w-8 flex-shrink-0">
                {skill.ability}
              </span>
              <span className="flex-1 text-slate-300 text-xs">{skill.name}</span>
              <span className={`font-bold tabular-nums text-xs ${
                isExpert ? 'text-amber-300' : isProf ? 'text-violet-300' : 'text-slate-400'
              }`}>
                {fmtMod(bonus)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
