import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharactersList, getCharacterLevel } from '../hooks/useCharactersList.js'

const ACCENT_STYLES = {
  violet: 'border-l-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  amber:  'border-l-amber-500  hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  blue:   'border-l-blue-500   hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  rose:   'border-l-rose-500   hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]',
  emerald:'border-l-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  slate:  'border-l-slate-400  hover:shadow-[0_0_20px_rgba(148,163,184,0.1)]',
}

const ACCENT_TEXT = {
  violet: 'text-violet-400',
  amber:  'text-amber-400',
  blue:   'text-blue-400',
  rose:   'text-rose-400',
  emerald:'text-emerald-400',
  slate:  'text-slate-400',
}

const ACCENT_OPTIONS = [
  { value: 'violet', label: 'Violet' },
  { value: 'amber',  label: 'Amber'  },
  { value: 'blue',   label: 'Blue'   },
  { value: 'rose',   label: 'Rose'   },
  { value: 'emerald',label: 'Emerald'},
  { value: 'slate',  label: 'Slate'  },
]

function CharacterCard({ character, onPlay, onDelete }) {
  const level = getCharacterLevel(character.id)
  const accent = character.accent || 'violet'

  return (
    <div
      className={`group relative bg-violet-950/30 border border-violet-900/30 border-l-4 rounded-xl p-5 transition-all duration-200 cursor-pointer ${ACCENT_STYLES[accent] || ACCENT_STYLES.violet}`}
      onClick={() => onPlay(character.id)}
    >
      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(character.id) }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-violet-600/60 hover:text-rose-400 transition-all text-sm"
        title="Remove character"
      >
        ✕
      </button>

      {/* Avatar circle */}
      <div className={`w-12 h-12 rounded-full bg-violet-900/40 border border-violet-800/40 flex items-center justify-center mb-4 text-xl font-bold ${ACCENT_TEXT[accent] || ACCENT_TEXT.violet}`}
        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
      >
        {character.name?.charAt(0) || '?'}
      </div>

      {/* Name */}
      <h3
        className="text-lg font-bold text-white leading-tight mb-1"
        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
      >
        {character.name}
      </h3>

      {/* Race · Class */}
      <p className="text-xs text-violet-300/50 mb-4">
        {[character.race, character.characterClass].filter(Boolean).join(' · ')}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {level ? (
          <span className="text-xs bg-violet-900/30 border border-violet-800/30 text-violet-300/70 px-2.5 py-1 rounded-full">
            Level {level}
          </span>
        ) : (
          <span className="text-xs text-violet-600/40 italic">New</span>
        )}
        <span className={`text-xs font-semibold ${ACCENT_TEXT[accent] || ACCENT_TEXT.violet} opacity-0 group-hover:opacity-100 transition-opacity`}>
          Play →
        </span>
      </div>
    </div>
  )
}

function NewCharacterForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [race, setRace] = useState('')
  const [characterClass, setCharacterClass] = useState('')
  const [accent, setAccent] = useState('violet')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), race: race.trim(), characterClass: characterClass.trim(), accent })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-violet-950/40 border border-violet-700/40 rounded-xl p-5 space-y-3"
      onClick={e => e.stopPropagation()}
    >
      <h3 className="text-sm font-bold text-violet-200 mb-4" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
        New Character
      </h3>
      <div>
        <label className="text-xs text-violet-400/60 uppercase tracking-wider block mb-1">Name *</label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Theron"
          className="w-full bg-violet-950/50 border border-violet-800/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-violet-600/40 focus:outline-none focus:border-violet-500/60"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-violet-400/60 uppercase tracking-wider block mb-1">Race</label>
          <input
            value={race}
            onChange={e => setRace(e.target.value)}
            placeholder="e.g. Elf"
            className="w-full bg-violet-950/50 border border-violet-800/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-violet-600/40 focus:outline-none focus:border-violet-500/60"
          />
        </div>
        <div>
          <label className="text-xs text-violet-400/60 uppercase tracking-wider block mb-1">Class</label>
          <input
            value={characterClass}
            onChange={e => setCharacterClass(e.target.value)}
            placeholder="e.g. Wizard"
            className="w-full bg-violet-950/50 border border-violet-800/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-violet-600/40 focus:outline-none focus:border-violet-500/60"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-violet-400/60 uppercase tracking-wider block mb-1">Colour</label>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAccent(opt.value)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                accent === opt.value
                  ? 'border-violet-400/60 bg-violet-800/40 text-violet-200'
                  : 'border-violet-900/30 text-violet-500/50 hover:border-violet-700/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 bg-violet-700/60 border border-violet-500/50 text-white text-sm font-semibold py-2 rounded-lg hover:bg-violet-600/70 transition-colors"
        >
          Create
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 bg-violet-950/40 border border-violet-900/30 text-violet-400/60 text-sm rounded-lg hover:text-violet-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function CharactersPage() {
  const navigate = useNavigate()
  const { characters, addCharacter, removeCharacter } = useCharactersList()
  const [showNewForm, setShowNewForm] = useState(false)

  function handlePlay(id) {
    navigate(`/${id}`)
  }

  function handleDelete(id) {
    if (window.confirm(`Remove ${id} from your list?`)) {
      removeCharacter(id)
    }
  }

  function handleCreate(data) {
    const id = addCharacter(data)
    navigate(`/${id}/edit`)
  }

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-10 sm:py-16">

      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-3xl sm:text-4xl font-bold text-white mb-2"
          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
        >
          ✦ Your Characters
        </h1>
        <p className="text-sm text-violet-300/40">Click a character to open their sheet</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {characters.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            onPlay={handlePlay}
            onDelete={handleDelete}
          />
        ))}

        {/* New character slot */}
        {showNewForm ? (
          <NewCharacterForm
            onSubmit={handleCreate}
            onCancel={() => setShowNewForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowNewForm(true)}
            className="border-2 border-dashed border-violet-800/30 rounded-xl p-5 text-violet-600/40 hover:border-violet-600/50 hover:text-violet-400/60 hover:bg-violet-950/20 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[180px]"
          >
            <span className="text-3xl">+</span>
            <span className="text-sm font-medium">New Character</span>
          </button>
        )}
      </div>
    </div>
  )
}
