import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function loadFromCloud(characterId) {
  try {
    const { data, error } = await supabase
      .from('character_sheet')
      .select('data')
      .eq('id', characterId)
      .single()
    if (error || !data?.data || Object.keys(data.data).length === 0) return null
    return data.data
  } catch {
    return null
  }
}

export async function saveToCloud(characterId, state) {
  try {
    await supabase
      .from('character_sheet')
      .upsert({ id: characterId, data: state, updated_at: new Date().toISOString() })
  } catch {
    // fail silently — localStorage is the fallback
  }
}
