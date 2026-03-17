import { readFileSync, writeFileSync } from 'fs';

const d = JSON.parse(readFileSync('C:/Users/goodn/OneDrive/Desktop/5etools-src-2.25.3/data/optionalfeatures.json', 'utf8'));

function stripTags(s) {
  return s ? s.replace(/\{@\w+ ([^|}]+)[^}]*\}/g, '$1') : '';
}

const meta = d.optionalfeature
  .filter(f => f.featureType && f.featureType.includes('MM'))
  .map(f => ({
    name: f.name,
    source: f.source,
    spCost: f.consumes ? (f.consumes.amount || 1) : 0,
    description: f.entries
      ? f.entries.map(e => typeof e === 'string' ? stripTags(e) : '').join(' ').slice(0, 500)
      : '',
  }));

// Deduplicate by name (keep PHB/TCE version first)
const seen = new Set();
const unique = meta.filter(m => {
  if (seen.has(m.name)) return false;
  seen.add(m.name);
  return true;
});

console.log(unique.map(m => m.name + ' (' + m.source + ')'));
writeFileSync('C:/Users/goodn/Lunaris/src/data/metamagic.json', JSON.stringify(unique, null, 2));
