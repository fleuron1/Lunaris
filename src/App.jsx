import { useState } from 'react'
import { Routes, Route, NavLink, Link, useParams, useNavigate } from 'react-router-dom'
import { useCharacterState } from './hooks/useCharacterState.js'
import { useFighterState } from './hooks/useFighterState.js'
import SheetPage from './pages/SheetPage.jsx'
import SpellsPage from './pages/SpellsPage.jsx'
import EditPage from './pages/EditPage.jsx'
import TontiSheetPage from './pages/TontiSheetPage.jsx'
import FighterEditPage from './pages/FighterEditPage.jsx'
import CharactersPage from './pages/CharactersPage.jsx'
import StarField from './components/StarField.jsx'
import SnowField from './components/SnowField.jsx'
import { LUNAR_PHASES } from './data/annabelle.js'

const PHASE_ICONS = { full: '🌕', new: '🌑', crescent: '🌙' }

function SyncDot({ status }) {
  if (status === 'idle') return null
  const styles = {
    saving: 'bg-violet-400/60 animate-pulse',
    saved:  'bg-emerald-400/80',
    error:  'bg-red-400/80',
  }
  const labels = { saving: 'Saving…', saved: 'Saved', error: 'Sync error' }
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-violet-300/50">
      <span className={`w-1.5 h-1.5 rounded-full ${styles[status]}`} />
      <span>{labels[status]}</span>
    </div>
  )
}

function SyncDotPink({ status }) {
  if (status === 'idle') return null
  const styles = {
    saving: 'bg-pink-400/60 animate-pulse',
    saved:  'bg-emerald-400/80',
    error:  'bg-red-400/80',
  }
  const labels = { saving: 'Saving…', saved: 'Saved', error: 'Sync error' }
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-pink-300/50">
      <span className={`w-1.5 h-1.5 rounded-full ${styles[status]}`} />
      <span>{labels[status]}</span>
    </div>
  )
}

// ── Sorcerer Nav Bar ──────────────────────────────────────────────────────────

function CharacterNavBar({ characterId, characterName, lunarPhase, level, syncStatus }) {
  const base = `/${characterId}`
  const NAV_LINKS = [
    { to: base,          label: 'Sheet',   end: true  },
    { to: `${base}/spells`, label: 'Spells',  end: false },
    { to: `${base}/edit`,   label: 'Builder', end: false },
  ]

  return (
    <nav
      className="sticky top-0 z-20 border-b border-violet-900/30"
      style={{ background: 'rgba(7,9,26,0.88)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-[1380px] mx-auto flex items-center h-12 gap-1 px-4 sm:px-6">

        <Link
          to="/"
          className="flex items-center gap-1.5 text-violet-400/50 hover:text-violet-200 transition-colors mr-2 text-sm"
          title="All characters"
        >
          ←
        </Link>

        <div className="flex items-center gap-2 mr-3">
          <span className="text-xl animate-float">{PHASE_ICONS[lunarPhase] || '🌕'}</span>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white leading-none" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
              {characterName || 'Character'}
            </p>
            <p className="text-[10px] text-violet-300/55 leading-none mt-0.5">
              {LUNAR_PHASES[lunarPhase]?.name || ''}
            </p>
          </div>
        </div>

        <span className="hidden sm:block text-violet-800/40 mr-2 text-xs">✦</span>

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

        <div className="ml-auto flex items-center gap-3">
          <SyncDot status={syncStatus} />
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-violet-300/50 bg-violet-900/20 border border-violet-800/30 px-2.5 py-1 rounded-full">
            <span className="text-violet-400/60">Lvl</span>
            <span className="font-bold text-violet-200">{level}</span>
          </span>
        </div>
      </div>
    </nav>
  )
}

// ── Fighter Nav Bar ───────────────────────────────────────────────────────────

function FighterNavBar({ characterId, characterName, level, syncStatus }) {
  const base = `/${characterId}`
  const NAV_LINKS = [
    { to: base,            label: 'Sheet',   end: true  },
    { to: `${base}/edit`,  label: 'Builder', end: false },
  ]

  return (
    <nav
      className="sticky top-0 z-20 border-b border-pink-900/30"
      style={{ background: 'rgba(3,9,22,0.90)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-[1380px] mx-auto flex items-center h-12 gap-1 px-4 sm:px-6">

        <Link
          to="/"
          className="flex items-center gap-1.5 text-pink-400/50 hover:text-pink-200 transition-colors mr-2 text-sm"
          title="All characters"
        >
          ←
        </Link>

        <div className="flex items-center gap-2 mr-3">
          <span className="text-xl">❄</span>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white leading-none" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
              {characterName || 'Character'}
            </p>
            <p className="text-[10px] text-pink-300/50 leading-none mt-0.5">Echo Knight Fighter</p>
          </div>
        </div>

        <span className="hidden sm:block text-pink-900/40 mr-2 text-xs">✦</span>

        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `text-sm font-semibold px-3 py-1.5 rounded-md transition-all duration-150 ${
                  isActive
                    ? 'text-pink-200 bg-pink-900/30 shadow-[0_0_8px_rgba(232,25,127,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-pink-950/20'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <SyncDotPink status={syncStatus} />
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-pink-300/50 bg-pink-950/20 border border-pink-900/30 px-2.5 py-1 rounded-full">
            <span className="text-pink-400/60">Lvl</span>
            <span className="font-bold text-pink-200">{level}</span>
          </span>
        </div>
      </div>
    </nav>
  )
}

// ── Character type detection ──────────────────────────────────────────────────

function getSheetType(characterId) {
  try {
    const raw = localStorage.getItem('lunaris-characters-v1')
    if (raw) {
      const list = JSON.parse(raw)
      const char = list.find(c => c.id === characterId)
      if (char?.sheetType) return char.sheetType
    }
  } catch {}
  return characterId === 'tonti' ? 'fighter' : 'sorcerer'
}

// ── Sorcerer sub-app ──────────────────────────────────────────────────────────

function CharacterApp() {
  const { characterId } = useParams()
  const charState = useCharacterState(characterId)

  return (
    <>
      <CharacterNavBar
        characterId={characterId}
        characterName={charState.characterName}
        lunarPhase={charState.lunarPhase}
        level={charState.level}
        syncStatus={charState.syncStatus}
      />
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
                spellSlots={charState.spellSlots}
                castSpell={charState.castSpell}
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
    </>
  )
}

// ── Fighter sub-app ───────────────────────────────────────────────────────────

function FighterApp() {
  const { characterId } = useParams()
  const state = useFighterState(characterId)

  return (
    <>
      <SnowField />
      <div className="relative z-10">
      <FighterNavBar
        characterId={characterId}
        characterName={state.characterName}
        level={state.level}
        syncStatus={state.syncStatus}
      />
      <main>
        <Routes>
          <Route path="/" element={<TontiSheetPage {...state} />} />
          <Route
            path="/edit"
            element={
              <FighterEditPage
                level={state.level}
                xp={state.xp}
                abilityScores={state.abilityScores}
                ac={state.ac}
                speed={state.speed}
                characterName={state.characterName}
                background={state.background}
                notes={state.notes}
                weapons={state.weapons}
                equipment={state.equipment}
                languages={state.languages}
                skillProfs={state.skillProfs}
                profBonus={state.profBonus}
                setLevel={state.setLevel}
                setXp={state.setXp}
                setAbilityScore={state.setAbilityScore}
                setAc={state.setAc}
                setSpeed={state.setSpeed}
                setCharacterName={state.setCharacterName}
                setBackground={state.setBackground}
                setNotes={state.setNotes}
                addWeapon={state.addWeapon}
                updateWeapon={state.updateWeapon}
                removeWeapon={state.removeWeapon}
                addEquipment={state.addEquipment}
                updateEquipment={state.updateEquipment}
                removeEquipment={state.removeEquipment}
                addLanguage={state.addLanguage}
                removeLanguage={state.removeLanguage}
                setSkillProf={state.setSkillProf}
                feats={state.feats}
                toggleFeat={state.toggleFeat}
              />
            }
          />
        </Routes>
      </main>
      </div>
    </>
  )
}

// ── Character router — picks sorcerer vs fighter ──────────────────────────────

function CharacterRouter() {
  const { characterId } = useParams()
  const [sheetType] = useState(() => getSheetType(characterId))
  return sheetType === 'fighter' ? <FighterApp /> : <CharacterApp />
}

// ── Root app ──────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<CharactersPage />} />
          <Route path="/:characterId/*" element={<CharacterRouter />} />
        </Routes>
      </div>
    </div>
  )
}
