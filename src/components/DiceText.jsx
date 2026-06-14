import { useDiceRoller } from './DiceRoller.jsx'

// Detects dice notation anywhere in a string — "2d6", "1d20", "d20", "1d8+4",
// "3d6 - 1" — and turns each into a clickable button that rolls it with the 3D
// roller. Everything else renders as plain text. Drop-in replacement for {text}:
//   <DiceText text={feat.description} label={feat.name} />
//
// The 'd' must not be preceded by a word char, so "Xd6" / "DnD" don't match but
// "deal 2d6", "(1d20+4)" and "regain 1d10 HP" do.
const DICE_RE = /(?<![\w])(\d{0,3})d(\d{1,3})(?:\s*([+-])\s*(\d{1,3}))?/gi

export default function DiceText({ text, label, theme = 'violet', className }) {
  const ctx = useDiceRoller()
  const roll = ctx?.roll
  if (text == null || typeof text !== 'string') return text ?? null
  if (!roll) return text   // no roller in context — just show the text

  const parts = []
  let last = 0
  let m
  DICE_RE.lastIndex = 0
  while ((m = DICE_RE.exec(text)) !== null) {
    const [full, count, sides, sign, mod] = m
    const start = m.index
    if (start > last) parts.push(text.slice(last, start))
    const notation = `${count || 1}d${sides}${sign && mod ? sign + mod : ''}`
    parts.push(
      <button
        key={start}
        type="button"
        className="dice-link"
        title={`Roll ${notation}`}
        onClick={(e) => { e.stopPropagation(); roll(label || notation, notation, theme) }}
      >
        {full}
      </button>,
    )
    last = start + full.length
  }
  if (!parts.length) return text
  if (last < text.length) parts.push(text.slice(last))
  return <span className={className}>{parts}</span>
}
