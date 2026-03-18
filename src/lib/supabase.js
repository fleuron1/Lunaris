import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

const ROW_ID = 'annabelle'

export async function loadFromCloud() {
  try {
    const { data, error } = await supabase
      .from('character_sheet')
      .select('data')
      .eq('id', ROW_ID)
      .single()
    if (error || !data?.data || Object.keys(data.data).length === 0) return null
    return data.data
  } catch {
    return null
  }
}

export async function saveToCloud(state) {
  try {
    await supabase
      .from('character_sheet')
      .upsert({ id: ROW_ID, data: state, updated_at: new Date().toISOString() })
  } catch {
    // fail silently — localStorage is the fallback
  }
}
