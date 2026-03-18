import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

// ── Notation parser ───────────────────────────────────────────────────────────
// Handles: "1d6+4 slashing", "2d8-1 piercing", "1d4+4", "1d10"

function parseDamage(notation) {
  const cleaned = (notation || '').trim()
  const match = cleaned.match(/^(\d+)d(\d+)([+-]\d+)?(?:\s+(.+))?$/i)
  if (!match) return null
  return {
    count:      parseInt(match[1], 10),
    sides:      parseInt(match[2], 10),
    modifier:   match[3] ? parseInt(match[3], 10) : 0,
    damageType: match[4] ? match[4].trim() : '',
  }
}

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1
}

// ── Theme helpers ─────────────────────────────────────────────────────────────

function getTheme(theme) {
  if (theme === 'pink') return {
    bg:          'bg-[#030b18]/95',
    border:      'border-pink-900/60',
    dieBg:       'bg-[#060f1e]',
    dieBorder:   'border-pink-700/60',
    dieGlow:     'shadow-[0_0_18px_rgba(232,25,127,0.25)]',
    dieText:     'text-pink-200',
    dieLabel:    'text-pink-400/50',
    modBg:       'bg-pink-950/60',
    modBorder:   'border-pink-700/50',
    modText:     'text-pink-300',
    modGlow:     'shadow-[0_0_12px_rgba(232,25,127,0.15)]',
    totalText:   'text-pink-100',
    accent:      'text-pink-400',
    btnBg:       'bg-pink-900/50 hover:bg-pink-800/70 border-pink-700/40',
    closeHover:  'hover:text-pink-300',
    divider:     'border-pink-900/40',
    label:       'text-pink-300/60',
    iconColor:   '#e8197f',
    pip:         'bg-pink-500',
  }
  // violet / sorcerer
  return {
    bg:          'bg-[#07091a]/95',
    border:      'border-violet-900/60',
    dieBg:       'bg-[#0c1030]',
    dieBorder:   'border-violet-700/60',
    dieGlow:     'shadow-[0_0_18px_rgba(139,92,246,0.25)]',
    dieText:     'text-violet-200',
    dieLabel:    'text-violet-400/50',
    modBg:       'bg-violet-950/60',
    modBorder:   'border-violet-700/50',
    modText:     'text-violet-300',
    modGlow:     'shadow-[0_0_12px_rgba(139,92,246,0.15)]',
    totalText:   'text-violet-100',
    accent:      'text-violet-400',
    btnBg:       'bg-violet-900/50 hover:bg-violet-800/70 border-violet-700/40',
    closeHover:  'hover:text-violet-300',
    divider:     'border-violet-900/40',
    label:       'text-violet-300/60',
    iconColor:   '#8b5cf6',
    pip:         'bg-violet-500',
  }
}

// ── Single die face ───────────────────────────────────────────────────────────

function DieFace({ sides, finalResult, isRolling, t }) {
  const [display, setDisplay] = useState('?')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!isRolling) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setDisplay(finalResult)
      return
    }
    setDisplay('?')
    intervalRef.current = setInterval(() => {
      setDisplay(Math.floor(Math.random() * sides) + 1)
    }, 55)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRolling, finalResult, sides])

  return (
    <div className={`
      flex flex-col items-center justify-center
      w-20 h-20 rounded-2xl border-2
      transition-all duration-300 select-none
      ${t.dieBg} ${t.dieBorder}
      ${isRolling
        ? 'animate-diceRoll opacity-80'
        : `${t.dieGlow} scale-[1.07]`
      }
    `}>
      <span className={`text-3xl font-bold leading-none tabular-nums ${t.dieText}`}>
        {display}
      </span>
      <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${t.dieLabel}`}>
        d{sides}
      </span>
    </div>
  )
}

// ── Modifier pill ─────────────────────────────────────────────────────────────

function ModPill({ modifier, enabled, onToggle, t }) {
  if (modifier === 0) return null
  const sign = modifier > 0 ? '+' : ''

  return (
    <button
      onClick={onToggle}
      title={enabled ? 'Click to remove modifier from total' : 'Click to add modifier back'}
      className={`
        flex flex-col items-center justify-center
        w-20 h-20 rounded-2xl border-2
        transition-all duration-200 select-none
        ${enabled
          ? `${t.modBg} ${t.modBorder} ${t.modGlow}`
          : 'bg-transparent border-slate-800/40 opacity-35'
        }
      `}
    >
      <span className={`text-2xl font-bold leading-none tabular-nums ${enabled ? t.modText : 'text-slate-600'}`}>
        {sign}{modifier}
      </span>
      <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${enabled ? t.label : 'text-slate-700'}`}>
        mod
      </span>
      {!enabled && (
        <span className="text-[9px] text-slate-600 mt-0.5">off</span>
      )}
    </button>
  )
}

// ── Plus / equals signs ───────────────────────────────────────────────────────

function Op({ char, t }) {
  return (
    <span className={`text-2xl font-light ${t.label} select-none px-1`}>{char}</span>
  )
}

// ── Main overlay ──────────────────────────────────────────────────────────────

function DiceRollerOverlay({ label, damage, theme, onClose }) {
  const t = getTheme(theme)
  const parsed = parseDamage(damage)

  // Roll state
  const [diceResults, setDiceResults]     = useState([])
  const [isRolling, setIsRolling]         = useState(false)
  const [modEnabled, setModEnabled]       = useState(true)
  const [hasRolled, setHasRolled]         = useState(false)
  const [visible, setVisible]             = useState(false)

  // Slide in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  function doRoll() {
    if (!parsed) return
    setIsRolling(true)
    setHasRolled(false)
    setModEnabled(true)

    const results = Array.from({ length: parsed.count }, () => rollDie(parsed.sides))

    setTimeout(() => {
      setDiceResults(results)
      setIsRolling(false)
      setHasRolled(true)
    }, 900)
  }

  // Auto-roll on mount
  useEffect(() => { doRoll() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!parsed) return null

  const diceSum = diceResults.reduce((a, b) => a + b, 0)
  const total   = diceSum + (modEnabled ? parsed.modifier : 0)
  const isCrit  = diceResults.length > 0 && diceResults.every(r => r === parsed.sides)
  const isFumble = diceResults.length > 0 && diceResults.every(r => r === 1)

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40"
        style={{ transition: 'opacity 0.2s', opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Tray */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-[101]
          ${t.bg} border-t-2 ${t.border}
          rounded-t-3xl px-6 pb-8 pt-5
          shadow-[0_-8px_40px_rgba(0,0,0,0.6)]
        `}
        style={{
          backdropFilter: 'blur(20px)',
          transition: 'transform 0.25s cubic-bezier(0.32,0.72,0,1)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          maxWidth: '560px',
          margin: '0 auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className={`w-10 h-1 rounded-full ${t.pip} opacity-30`} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className={`text-lg font-bold text-white leading-none`} style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
              {label}
            </p>
            <p className={`text-sm mt-0.5 ${t.label}`}>
              {damage}
              {parsed.damageType && <span className="ml-1 capitalize">{parsed.damageType}</span>}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`text-slate-500 ${t.closeHover} transition-colors text-xl leading-none p-1`}
          >
            ✕
          </button>
        </div>

        {/* Dice area */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-5 min-h-[80px]">
          {/* Dice faces */}
          {Array.from({ length: parsed.count }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <Op char="+" t={t} />}
              <DieFace
                sides={parsed.sides}
                finalResult={diceResults[i] ?? '?'}
                isRolling={isRolling}
                t={t}
              />
            </div>
          ))}

          {/* Modifier */}
          {parsed.modifier !== 0 && (
            <>
              <Op char="+" t={t} />
              <ModPill
                modifier={parsed.modifier}
                enabled={modEnabled}
                onToggle={() => setModEnabled(e => !e)}
                t={t}
              />
            </>
          )}

          {/* Total */}
          {hasRolled && (
            <>
              <Op char="=" t={t} />
              <div className="flex flex-col items-center">
                <span
                  className={`text-5xl font-bold tabular-nums leading-none ${
                    isCrit ? 'text-yellow-300' : isFumble ? 'text-red-400' : t.totalText
                  }`}
                  style={{
                    textShadow: isCrit
                      ? '0 0 20px rgba(253,224,71,0.6)'
                      : isFumble
                      ? '0 0 20px rgba(248,113,113,0.5)'
                      : undefined,
                  }}
                >
                  {total}
                </span>
                {isCrit   && <span className="text-[11px] font-bold text-yellow-400 tracking-widest mt-1">CRITICAL!</span>}
                {isFumble && <span className="text-[11px] font-bold text-red-400 tracking-widest mt-1">FUMBLE</span>}
              </div>
            </>
          )}
        </div>

        {/* Modifier hint */}
        {parsed.modifier !== 0 && hasRolled && (
          <p className={`text-center text-[11px] ${t.label} mb-4`}>
            {modEnabled
              ? 'Tap modifier to roll raw dice'
              : `Raw dice only · tap modifier to add ${parsed.modifier > 0 ? '+' : ''}${parsed.modifier}`
            }
          </p>
        )}

        {/* Divider */}
        <div className={`border-t ${t.divider} mb-4`} />

        {/* Roll Again */}
        <button
          onClick={doRoll}
          disabled={isRolling}
          className={`
            w-full py-2.5 rounded-xl font-bold text-sm text-white
            border transition-all duration-150
            ${t.btnBg}
            ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isRolling ? '🎲 Rolling…' : '🎲 Roll Again'}
        </button>
      </div>
    </>,
    document.body,
  )
}

// ── Context ───────────────────────────────────────────────────────────────────

const DiceRollerContext = createContext(null)

export function DiceRollerProvider({ children }) {
  const [request, setRequest] = useState(null)

  const roll = useCallback((label, damage, theme = 'violet') => {
    setRequest({ label, damage, theme, key: Date.now() })
  }, [])

  const close = useCallback(() => setRequest(null), [])

  return (
    <DiceRollerContext.Provider value={{ roll }}>
      {children}
      {request && (
        <DiceRollerOverlay
          key={request.key}
          label={request.label}
          damage={request.damage}
          theme={request.theme}
          onClose={close}
        />
      )}
    </DiceRollerContext.Provider>
  )
}

export function useDiceRoller() {
  return useContext(DiceRollerContext)
}
