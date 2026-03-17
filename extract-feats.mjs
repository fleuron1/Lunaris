import { readFileSync, writeFileSync } from 'fs'

function cleanTags(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/\{@[a-z0-9]+ ([^|}]+)\|[^}]*\}/gi, '$1')
    .replace(/\{@[a-z0-9]+ ([^}]+)\}/gi, '$1')
    .replace(/\{@[a-zA-Z]+\}/g, '')
    .replace(/\{[^}]*\}/g, '')
    .trim()
}

function entriesToText(entries, depth = 0) {
  if (!entries || !Array.isArray(entries)) return ''
  const parts = []
  for (const e of entries) {
    if (typeof e === 'string') {
      parts.push(cleanTags(e))
    } else if (e && typeof e === 'object') {
      if (e.type === 'entries' || e.type === 'section') {
        const sub = entriesToText(e.entries, depth + 1)
        parts.push(e.name ? `${e.name}: ${sub}` : sub)
      } else if (e.type === 'list') {
        const items = (e.items || []).map(item => {
          if (typeof item === 'string') return cleanTags(item)
          if (item.entries) return (item.name ? `${item.name}: ` : '') + entriesToText(item.entries)
          return ''
        }).filter(Boolean)
        parts.push(items.join('. '))
      } else if (e.type === 'item') {
        const sub = entriesToText(e.entries || [], depth + 1)
        parts.push(e.name ? `${e.name}: ${sub}` : sub)
      } else if (e.type === 'table' || e.type === 'inset' || e.type === 'quote') {
        // skip
      } else if (e.entries) {
        parts.push(entriesToText(e.entries, depth + 1))
      }
    }
  }
  return parts.filter(Boolean).join(' ')
}

function parsePrerequisite(prereqs) {
  if (!prereqs || !prereqs.length) return null
  const parts = []
  for (const p of prereqs) {
    if (typeof p === 'string') { parts.push(p); continue }
    if (p.level) {
      const l = p.level
      if (typeof l === 'number') parts.push(`Level ${l}+`)
      else if (l.class) parts.push(`${l.class.name} Level ${l.level}+`)
      else parts.push(`Level ${l.level || '?'}+`)
    }
    if (p.ability) {
      const arr = Array.isArray(p.ability) ? p.ability : [p.ability]
      arr.forEach(a => Object.entries(a).forEach(([ab, val]) => parts.push(`${ab.toUpperCase()} ${val}+`)))
    }
    if (p.race) parts.push(p.race.map(r => r.displayEntry || r.name).join(' or '))
    if (p.spellcasting || p.spellcasting2020) parts.push('Spellcasting ability')
    if (p.psionics) parts.push('Psionics')
    if (p.feat) parts.push(`Feat: ${p.feat.map(f => f.split('|')[0]).join(' or ')}`)
    if (p.campaign) parts.push(`Campaign: ${p.campaign.join(', ')}`)
    if (p.other) parts.push(cleanTags(p.other.entry || p.other))
    if (p.otherSummary) parts.push(cleanTags(typeof p.otherSummary === 'string' ? p.otherSummary : p.otherSummary.entry || ''))
    if (p.proficiency) {
      p.proficiency.forEach(prof => {
        const val = Object.values(prof)[0]
        if (val) parts.push(`Proficiency: ${val}`)
      })
    }
  }
  return parts.length ? parts.join('; ') : null
}

const CORE_SOURCES = ['XPHB', 'PHB', 'TCE', 'XGE', 'DMG']
const data = JSON.parse(readFileSync('C:/Users/goodn/OneDrive/Desktop/5etools-src-2.25.3/data/feats.json', 'utf8'))

const seen = new Set()
const feats = []

// Process in priority order so XPHB versions take precedence
for (const src of CORE_SOURCES) {
  for (const feat of data.feat) {
    if (feat.source !== src) continue
    if (feat._copy) continue
    if (seen.has(feat.name)) continue
    seen.add(feat.name)

    const description = entriesToText(feat.entries)
    if (!description) continue

    feats.push({
      name: feat.name,
      source: feat.source,
      category: feat.category || 'G',
      prerequisite: parsePrerequisite(feat.prerequisite),
      description: description.length > 700 ? description.slice(0, 700) + '…' : description,
    })
  }
}

feats.sort((a, b) => a.name.localeCompare(b.name))

writeFileSync('src/data/feats.json', JSON.stringify(feats, null, 2))
console.log(`Extracted ${feats.length} feats`)
feats.slice(0, 3).forEach(f => console.log(` - ${f.name} (${f.source}): ${f.description.slice(0, 80)}...`))
