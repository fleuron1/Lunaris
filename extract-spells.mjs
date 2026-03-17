import { readFileSync, writeFileSync } from 'fs';

const lookup = JSON.parse(readFileSync('C:/Users/goodn/OneDrive/Desktop/5etools-src-2.25.3/data/generated/gendata-spell-source-lookup.json', 'utf8'));
const phb = JSON.parse(readFileSync('C:/Users/goodn/OneDrive/Desktop/5etools-src-2.25.3/data/spells/spells-phb.json', 'utf8'));
const xphb = JSON.parse(readFileSync('C:/Users/goodn/OneDrive/Desktop/5etools-src-2.25.3/data/spells/spells-xphb.json', 'utf8'));
const tce = JSON.parse(readFileSync('C:/Users/goodn/OneDrive/Desktop/5etools-src-2.25.3/data/spells/spells-tce.json', 'utf8'));
const xge = JSON.parse(readFileSync('C:/Users/goodn/OneDrive/Desktop/5etools-src-2.25.3/data/spells/spells-xge.json', 'utf8'));

// Strip 5etools tags like {@spell Fireball} -> Fireball
function stripTags(str) {
  if (!str) return '';
  return str.replace(/\{@\w+ ([^|}]+)[^}]*\}/g, '$1');
}

function renderEntries(entries) {
  if (!entries) return '';
  return entries.map(e => {
    if (typeof e === 'string') return stripTags(e);
    if (e.type === 'entries' && e.entries) return renderEntries(e.entries);
    if (e.type === 'list' && e.items) {
      return e.items.map(i => {
        if (typeof i === 'string') return '• ' + stripTags(i);
        if (i.entry) return '• ' + stripTags(i.entry);
        return '';
      }).join(' ');
    }
    return '';
  }).filter(Boolean).join(' ').slice(0, 500);
}

const SCHOOL = { A: 'Abjuration', C: 'Conjuration', D: 'Divination', E: 'Enchantment', I: 'Illusion', N: 'Necromancy', T: 'Transmutation', V: 'Evocation' };

function getCastTime(time) {
  if (!time || !time[0]) return '';
  const t = time[0];
  if (t.unit === 'bonus') return '1 Bonus Action';
  if (t.unit === 'reaction') return '1 Reaction';
  return `${t.number} ${t.unit.charAt(0).toUpperCase()}${t.unit.slice(1)}`;
}

function getRange(range) {
  if (!range) return '';
  const d = range.distance;
  if (range.type === 'point' && d) {
    if (d.type === 'feet') return `${d.amount} ft`;
    if (d.type === 'miles') return `${d.amount} mile${d.amount !== 1 ? 's' : ''}`;
    if (['touch', 'self', 'sight', 'unlimited'].includes(d.type)) return d.type.charAt(0).toUpperCase() + d.type.slice(1);
    return d.type;
  }
  if (range.type === 'self' && d) return `Self (${d.amount} ft ${d.type})`;
  const simple = { self: 'Self', touch: 'Touch', sight: 'Sight', special: 'Special' };
  return simple[range.type] || range.type || '';
}

// Build Sorcerer spell name set
const sorcSpells = new Set();
Object.values(lookup).forEach(spellMap => {
  Object.entries(spellMap).forEach(([name, data]) => {
    const cls = data.class || {};
    if (cls.PHB?.Sorcerer || cls.XPHB?.Sorcerer || cls.TCE?.Sorcerer || cls.XGE?.Sorcerer) {
      sorcSpells.add(name.toLowerCase());
    }
  });
});

// Deduplicate: PHB first, then TCE/XGE, then XPHB
const seen = new Set();
const result = [];
const allSpells = [...phb.spell, ...tce.spell, ...xge.spell, ...xphb.spell];

allSpells.forEach(s => {
  const key = s.name.toLowerCase();
  if (!sorcSpells.has(key) || seen.has(s.name)) return;
  seen.add(s.name);

  result.push({
    name: s.name,
    level: s.level,
    school: SCHOOL[s.school] || s.school,
    castTime: getCastTime(s.time),
    range: getRange(s.range),
    concentration: !!(s.duration && s.duration[0] && s.duration[0].concentration),
    ritual: !!(s.meta && s.meta.ritual),
    material: !!(s.components && s.components.m),
    source: s.source,
    description: renderEntries(s.entries),
  });
});

result.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
writeFileSync('C:/Users/goodn/Lunaris/src/data/sorcerer-spells.json', JSON.stringify(result, null, 2));
console.log(`Written ${result.length} sorcerer spells`);
