import { useState, useEffect } from 'react'

const STORAGE_KEY = 'lunaris-characters-v1'

const DEFAULT_CHARACTERS = [
  {
    id: 'annabelle',
    name: 'Annabelle',
    race: 'Warforged',
    characterClass: 'Sorcerer (Lunar)',
    accent: 'violet',
    sheetType: 'sorcerer',
  },
  {
    id: 'tonti',
    name: 'Tonti of Darkgate',
    race: 'Tabaxi',
    characterClass: 'Echo Knight Fighter',
    accent: 'rose',
    sheetType: 'fighter',
  },
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CHARACTERS
    const saved = JSON.parse(raw)
    // Ensure all default characters are present (migration)
    const merged = [...saved]
    for (const def of DEFAULT_CHARACTERS) {
      if (!merged.find(c => c.id === def.id)) merged.push(def)
    }
    return merged
  } catch {
    return DEFAULT_CHARACTERS
  }
}

function save(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
}

// Read just the level from a character's saved state without loading full hook
export function getCharacterLevel(id) {
  try {
    const raw = localStorage.getItem(`character-${id}-v2`)
    if (raw) return JSON.parse(raw).level || null
    // fallback: check old Annabelle key
    if (id === 'annabelle') {
      const old = localStorage.getItem('annabelle-sheet-v2')
      if (old) return JSON.parse(old).level || null
    }
    return null
  } catch {
    return null
  }
}

function toId(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function useCharactersList() {
  const [characters, setCharacters] = useState(load)

  useEffect(() => { save(characters) }, [characters])

  function addCharacter({ id: explicitId, name, race, characterClass, accent = 'violet' }) {
    let id = explicitId || toId(name) || `char-${Date.now()}`
    // Never silently reuse an existing id — suffix instead
    const taken = new Set(characters.map(c => c.id))
    if (!explicitId && taken.has(id)) {
      let n = 2
      while (taken.has(`${id}-${n}`)) n++
      id = `${id}-${n}`
    }
    // Save synchronously: callers often navigate away in the same event, which
    // can unmount this hook before the save effect sees the updated list.
    if (!characters.find(c => c.id === id)) {
      const next = [...characters, { id, name, race, characterClass, accent }]
      save(next)
      setCharacters(next)
    }
    return id
  }

  function removeCharacter(id) {
    setCharacters(prev => prev.filter(c => c.id !== id))
  }

  function updateCharacterMeta(id, patch) {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  return { characters, addCharacter, removeCharacter, updateCharacterMeta }
}
