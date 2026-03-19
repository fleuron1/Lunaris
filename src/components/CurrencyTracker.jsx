import { useState } from 'react'

const COINS = [
  { key: 'cp', label: 'CP', name: 'Copper',   dot: 'bg-amber-700',   text: 'text-amber-600/90' },
  { key: 'sp', label: 'SP', name: 'Silver',   dot: 'bg-slate-300',   text: 'text-slate-300/90' },
  { key: 'gp', label: 'GP', name: 'Gold',     dot: 'bg-yellow-400',  text: 'text-yellow-300'   },
  { key: 'pp', label: 'PP', name: 'Platinum', dot: 'bg-cyan-200',    text: 'text-cyan-200/90'  },
]

function CoinSlot({ coin, value, onChange, theme }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')

  const isV = theme !== 'pink'
  const cardBg    = isV ? 'bg-violet-950/40 border-violet-800/30' : 'bg-pink-950/40 border-pink-900/30'
  const inputRing = isV ? 'focus:border-violet-500/60' : 'focus:border-pink-500/60'

  function startEdit() {
    setDraft(String(value ?? 0))
    setEditing(true)
  }

  function commit() {
    const n = parseInt(draft, 10)
    onChange(coin.key, isNaN(n) ? 0 : Math.max(0, n))
    setEditing(false)
  }

  function onKey(e) {
    if (e.key === 'Enter') { e.target.blur(); commit() }
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 ${cardBg}`}>
      {/* Coin dot */}
      <span className={`w-3 h-3 rounded-full ${coin.dot} shadow-sm`} />

      {/* Label */}
      <p className={`text-[9px] font-bold uppercase tracking-[0.14em] ${coin.text}`}>{coin.label}</p>

      {/* Editable amount */}
      {editing ? (
        <input
          type="number"
          min="0"
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          className={`w-full text-center text-sm font-bold bg-transparent border border-slate-600/50 rounded-md py-0.5 text-white outline-none transition-colors ${inputRing}`}
          style={{ MozAppearance: 'textfield' }}
        />
      ) : (
        <button
          onClick={startEdit}
          title={`Edit ${coin.name}`}
          className="text-sm font-bold text-white tabular-nums hover:text-yellow-200 transition-colors leading-none py-0.5 min-w-[2rem] text-center"
        >
          {value ?? 0}
        </button>
      )}
    </div>
  )
}

export default function CurrencyTracker({ currency = {}, setCurrency, theme = 'violet' }) {
  const isV = theme !== 'pink'
  const header = isV ? 'text-violet-400/50' : 'text-pink-400/50'

  return (
    <div>
      <p className={`text-[10px] font-bold uppercase tracking-[0.13em] mb-2 ${header}`}>Currency</p>
      <div className="grid grid-cols-4 gap-1.5">
        {COINS.map(coin => (
          <CoinSlot
            key={coin.key}
            coin={coin}
            value={currency[coin.key] ?? 0}
            onChange={setCurrency}
            theme={theme}
          />
        ))}
      </div>
    </div>
  )
}
