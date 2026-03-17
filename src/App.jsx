import { Routes, Route, NavLink } from 'react-router-dom'
import { useCharacterState } from './hooks/useCharacterState.js'
import SheetPage from './pages/SheetPage.jsx'
import SpellsPage from './pages/SpellsPage.jsx'
import EditPage from './pages/EditPage.jsx'
import StarField from './components/StarField.jsx'
import { LUNAR_PHASES } from './data/annabelle.js'

const PHASE_ICONS = { full: '🌕', new: '🌑', crescent: '🌙' }

const NAV_LINKS = [
  { to: '/',       label: 'Sheet',   end: true },
  { to: '/spells', label: 'Spells',  end: false },
  { to: '/edit',   label: 'Builder', end: false },
]

function NavBar({ lunarPhase, level }) {
  return (
    <nav
      className="sticky top-0 z-20 border-b border-violet-900/30"
      style={{ background: 'rgba(7,9,26,0.88)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-[1380px] mx-auto flex items-center h-12 gap-1 px-4 sm:px-6">
        {/* Logo / Phase */}
        <div className="flex items-center gap-2 mr-3">
          <span className="text-xl animate-float">{PHASE_ICONS[lunarPhase]}</span>
          <div className="hidden sm:block">
            <p
              className="text-sm font-bold text-white leading-none"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              Annabelle
            </p>
            <p className="text-[10px] text-violet-300/55 leading-none mt-0.5">
              {LUNAR_PHASES[lunarPhase].name}
            </p>
          </div>
        </div>

        <span className="hidden sm:block text-violet-800/40 mr-2 text-xs">✦</span>

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `text-sm font-semibold px-3 py-1.5 rounded-md transition-all duration-150 ${
                  isActive
                    ? 'text-violet-200 bg-violet-900/30 shadow-[0_0_8px_rgba(139,92,246,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-violet-900/15'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Level badge */}
        <div className="ml-auto">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-violet-300/50 bg-violet-900/20 border border-violet-800/30 px-2.5 py-1 rounded-full">
            <span className="text-violet-400/60">Lvl</span>
            <span className="font-bold text-violet-200">{level}</span>
          </span>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  const charState = useCharacterState()

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10">
        <NavBar lunarPhase={charState.lunarPhase} level={charState.level} />
        <main>
          <Routes>
            <Route path="/" element={<SheetPage {...charState} />} />
            <Route
              path="/spells"
              element={
                <SpellsPage
                  concentration={charState.concentration}
                  setConcentration={charState.setConcentration}
                  lunarPhase={charState.lunarPhase}
                  knownSpells={charState.knownSpells}
                  knownCantrips={charState.knownCantrips}
                  spellSaveDC={charState.spellSaveDC}
                  spellAttackBonus={charState.spellAttackBonus}
                />
              }
            />
            <Route
              path="/edit"
              element={
                <EditPage
                  level={charState.level}
                  xp={charState.xp}
                  abilityScores={charState.abilityScores}
                  knownSpells={charState.knownSpells}
                  knownCantrips={charState.knownCantrips}
                  chosenMetamagic={charState.chosenMetamagic}
                  profBonus={charState.profBonus}
                  setLevel={charState.setLevel}
                  setXp={charState.setXp}
                  setAbilityScore={charState.setAbilityScore}
                  toggleKnownSpell={charState.toggleKnownSpell}
                  resetSpells={charState.resetSpells}
                  toggleMetamagic={charState.toggleMetamagic}
                  ac={charState.ac}
                  speed={charState.speed}
                  setAc={charState.setAc}
                  setSpeed={charState.setSpeed}
                  weapons={charState.weapons}
                  addWeapon={charState.addWeapon}
                  updateWeapon={charState.updateWeapon}
                  removeWeapon={charState.removeWeapon}
                  equipment={charState.equipment}
                  addEquipment={charState.addEquipment}
                  updateEquipment={charState.updateEquipment}
                  removeEquipment={charState.removeEquipment}
                  feats={charState.feats}
                  toggleFeat={charState.toggleFeat}
                  languages={charState.languages}
                  addLanguage={charState.addLanguage}
                  removeLanguage={charState.removeLanguage}
                  skillProfs={charState.skillProfs}
                  setSkillProf={charState.setSkillProf}
                  characterName={charState.characterName}
                  background={charState.background}
                  notes={charState.notes}
                  setCharacterName={charState.setCharacterName}
                  setBackground={charState.setBackground}
                  setNotes={charState.setNotes}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}
