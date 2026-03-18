import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import DiceBox from '@3d-dice/dice-box'

// ── Asset path — adapts to dev ("/") and prod ("/Lunaris/") ──────────────────
const ASSET_PATH = import.meta.env.BASE_URL + 'assets/dice-box/'

// ── Inject pop/shake keyframes once ──────────────────────────────────────────
;(function injectStyles() {
  if (document.getElementById('dice-roller-styles')) return
  const s = document.createElement('style')
  s.id = 'dice-roller-styles'
  s.textContent = `
    @keyframes dicePop {
      0%   { transform: scale(0.25) rotate(-8deg); opacity: 0; }
      55%  { transform: scale(1.3)  rotate(3deg);  opacity: 1; }
      75%  { transform: scale(0.9)  rotate(-1deg); }
      100% { transform: scale(1)    rotate(0deg);  opacity: 1; }
    }
    @keyframes dicePopTotal {
      0%   { transform: scale(0.2); opacity: 0; }
      60%  { transform: scale(1.45); opacity: 1; }
      80%  { transform: scale(0.88); }
      100% { transform: scale(1);   opacity: 1; }
    }
    @keyframes critFlash {
      0%,100% { opacity: 1; }
      50%     { opacity: 0.4; }
    }
    .dice-pop        { animation: dicePop     0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
    .dice-pop-total  { animation: dicePopTotal 0.5s  cubic-bezier(0.34,1.56,0.64,1) both; }
    .dice-crit-flash { animation: critFlash 0.4s ease-in-out 3; }
  `
  document.head.appendChild(s)
})()

// ── Synthesised SFX ───────────────────────────────────────────────────────────

function playRollSfx() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    // 9 noise bursts — descending timing simulates dice tumbling to rest
    for (let i = 0; i < 9; i++) {
      const t   = now + i * 0.1 + Math.random() * 0.04
      const dur = 0.07 + Math.random() * 0.05
      const len = Math.floor(ctx.sampleRate * dur)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const ch  = buf.getChannelData(0)
      for (let j = 0; j < len; j++) ch[j] = Math.random() * 2 - 1

      const src    = ctx.createBufferSource()
      src.buffer   = buf

      const filt       = ctx.createBiquadFilter()
      filt.type        = 'bandpass'
      filt.frequency.value = 500 + Math.random() * 700
      filt.Q.value     = 0.8

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18 * (1 - i * 0.07), t + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)

      src.connect(filt); filt.connect(gain); gain.connect(ctx.destination)
      src.start(t); src.stop(t + dur + 0.02)
    }
    setTimeout(() => ctx.close(), 2200)
  } catch (_) {}
}

function playLandSfx() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    // Two quick impact thuds
    for (let hit = 0; hit < 2; hit++) {
      const t   = now + hit * 0.07
      const dur = 0.12
      const len = Math.floor(ctx.sampleRate * dur)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const ch  = buf.getChannelData(0)
      for (let j = 0; j < len; j++) ch[j] = (Math.random() * 2 - 1) * Math.exp(-j / (len * 0.18))

      const src  = ctx.createBufferSource()
      src.buffer = buf

      const filt       = ctx.createBiquadFilter()
      filt.type        = 'lowpass'
      filt.frequency.value = 350 - hit * 80

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.35 - hit * 0.1, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)

      src.connect(filt); filt.connect(gain); gain.connect(ctx.destination)
      src.start(t); src.stop(t + dur + 0.02)
    }
    setTimeout(() => ctx.close(), 600)
  } catch (_) {}
}

// ── Notation parser ───────────────────────────────────────────────────────────

function parseDamage(notation) {
  const cleaned = (notation || '').trim()
  const match = cleaned.match(/^(\d+)d(\d+)([+-]\d+)?(?:\s+(.+))?$/i)
  if (!match) return null
  return {
    count:      parseInt(match[1], 10),
    sides:      parseInt(match[2], 10),
    modifier:   match[3] ? parseInt(match[3], 10) : 0,
    damageType: match[4] ? match[4].trim() : '',
    raw:        cleaned,
    notation:   `${match[1]}d${match[2]}${match[3] || ''}`,
  }
}

// ── Theme helpers ─────────────────────────────────────────────────────────────

function getTheme(theme) {
  if (theme === 'pink') return {
    overlay:   'bg-[#030b18]/60',
    panel:     'bg-[#060f1e]/95 border-pink-900/60',
    label:     'text-pink-300/60',
    titleText: 'text-white',
    subText:   'text-pink-300/50',
    totalBg:   'bg-pink-950/40 border-pink-800/40',
    totalText: 'text-pink-100',
    modBg:     'bg-pink-950/50 border-pink-700/40',
    modActive: 'text-pink-200',
    divider:   'border-pink-900/40',
    btn:       'bg-pink-900/50 hover:bg-pink-800/70 border-pink-700/40 text-white',
    closeBtn:  'text-slate-500 hover:text-pink-300',
    pip:       'bg-pink-500',
    dieBreak:  'bg-[#030b18] border-pink-900/40 text-pink-200',
    plus:      'text-pink-700/60',
    critColor: 'text-yellow-300',
    fumColor:  'text-red-400',
  }
  return {
    overlay:   'bg-[#07091a]/60',
    panel:     'bg-[#0b0e24]/95 border-violet-900/60',
    label:     'text-violet-300/60',
    titleText: 'text-white',
    subText:   'text-violet-300/50',
    totalBg:   'bg-violet-950/40 border-violet-800/40',
    totalText: 'text-violet-100',
    modBg:     'bg-violet-950/50 border-violet-700/40',
    modActive: 'text-violet-200',
    divider:   'border-violet-900/40',
    btn:       'bg-violet-900/50 hover:bg-violet-800/70 border-violet-700/40 text-white',
    closeBtn:  'text-slate-500 hover:text-violet-300',
    pip:       'bg-violet-500',
    dieBreak:  'bg-[#0c1030] border-violet-900/40 text-violet-200',
    plus:      'text-violet-700/60',
    critColor: 'text-yellow-300',
    fumColor:  'text-red-400',
  }
}

// ── Result breakdown panel ────────────────────────────────────────────────────

function ResultPanel({ parsed, rollResult, modEnabled, onToggleMod, onRollAgain, isRolling, t, rollKey }) {
  const diceValues = rollResult?.rolls?.[0]?.dice?.map(d => d.value) ?? []
  const diceSum    = diceValues.reduce((a, b) => a + b, 0)
  const modifier   = parsed?.modifier ?? 0
  const total      = diceSum + (modEnabled ? modifier : 0)
  const sides      = parsed?.sides ?? 6
  const isCrit     = diceValues.length > 0 && diceValues.every(v => v === sides)
  const isFumble   = diceValues.length > 0 && diceValues.every(v => v === 1)

  // Staggered delays for each die
  const delays = ['0ms','60ms','120ms','180ms','240ms','300ms','360ms','420ms']

  return (
    <div className="flex flex-col gap-3">
      {/* Dice breakdown row */}
      {diceValues.length > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-2">
          {diceValues.map((v, i) => (
            <div
              key={`${rollKey}-die-${i}`}
              className="flex items-center gap-2"
            >
              {i > 0 && <span className={`text-lg font-light select-none ${t.plus}`}>+</span>}
              <div
                className={`dice-pop w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center select-none
                  ${t.dieBreak} ${isCrit ? 'dice-crit-flash' : ''}`}
                style={{ animationDelay: delays[i] || '0ms' }}
              >
                <span className="text-2xl font-bold leading-none tabular-nums">{v}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${t.label}`}>d{sides}</span>
              </div>
            </div>
          ))}

          {/* Modifier pill — click to toggle */}
          {modifier !== 0 && (
            <>
              <span className={`text-lg font-light select-none ${t.plus}`}>+</span>
              <button
                onClick={onToggleMod}
                title={modEnabled ? 'Remove modifier' : 'Add modifier back'}
                className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all
                  ${t.modBg} ${modEnabled ? '' : 'opacity-35'}`}
              >
                <span className={`text-2xl font-bold leading-none tabular-nums ${modEnabled ? t.modActive : 'text-slate-600 line-through'}`}>
                  {modifier > 0 ? '+' : ''}{modifier}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${t.label}`}>mod</span>
              </button>
            </>
          )}

          <span className={`text-lg font-light select-none ${t.plus}`}>=</span>

          {/* Total — big pop */}
          <div
            key={`${rollKey}-total`}
            className={`dice-pop-total min-w-[64px] h-14 rounded-xl border-2 px-3 flex flex-col items-center justify-center ${t.totalBg}`}
            style={{ animationDelay: `${(diceValues.length) * 55 + 40}ms` }}
          >
            <span className={`text-3xl font-bold leading-none tabular-nums ${isCrit ? t.critColor : isFumble ? t.fumColor : t.totalText}`}>
              {total}
            </span>
          </div>
        </div>
      )}

      {isCrit   && <p className={`text-center text-xs font-bold tracking-widest ${t.critColor}`}>⚡ CRITICAL HIT!</p>}
      {isFumble && <p className={`text-center text-xs font-bold tracking-widest ${t.fumColor}`}>💀 FUMBLE</p>}

      {modifier !== 0 && diceValues.length > 0 && (
        <p className={`text-center text-[11px] ${t.label}`}>
          {modEnabled ? 'Tap modifier to see raw roll' : `Raw · tap to add ${modifier > 0 ? '+' : ''}${modifier}`}
        </p>
      )}

      <div className={`border-t ${t.divider}`} />

      <button
        onClick={onRollAgain}
        disabled={isRolling}
        className={`w-full py-2.5 rounded-xl font-bold text-sm border transition-all ${t.btn} ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isRolling ? '🎲 Rolling…' : '🎲 Roll Again'}
      </button>
    </div>
  )
}

// ── Overlay (portal) ──────────────────────────────────────────────────────────

function DiceRollerOverlay({ label, damage, theme, diceBoxRef, onClose }) {
  const t      = getTheme(theme)
  const parsed = parseDamage(damage)

  const [rollResult, setRollResult] = useState(null)
  const [isRolling, setIsRolling]   = useState(false)
  const [modEnabled, setModEnabled] = useState(true)
  const [visible, setVisible]       = useState(false)
  const [rollKey, setRollKey]       = useState(0)

  // Slide-in animation
  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  // Wire DiceBox callbacks to this roll session
  useEffect(() => {
    const box = diceBoxRef.current
    if (!box || !parsed) return

    box.onRollComplete = (result) => {
      setRollResult(result)
      setIsRolling(false)
      setRollKey(k => k + 1)
      playLandSfx()
    }

    doRoll()

    return () => {
      if (diceBoxRef.current) {
        diceBoxRef.current.onRollComplete = null
        diceBoxRef.current.clear?.()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function doRoll() {
    if (!diceBoxRef.current || !parsed) return
    setIsRolling(true)
    setRollResult(null)
    setModEnabled(true)
    playRollSfx()
    diceBoxRef.current.roll(parsed.notation).catch(() => setIsRolling(false))
  }

  function handleClose() {
    setVisible(false)
    diceBoxRef.current?.clear?.()
    setTimeout(onClose, 220)
  }

  return createPortal(
    <>
      {/* Dim backdrop */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-200 ${t.overlay}`}
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Result tray slides up */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-[103]
          ${t.panel} border-t-2 rounded-t-3xl
          px-6 pb-8 pt-4
          shadow-[0_-8px_40px_rgba(0,0,0,0.7)]
          max-w-[540px] mx-auto
        `}
        style={{
          backdropFilter: 'blur(24px)',
          transition: 'transform 0.25s cubic-bezier(0.32,0.72,0,1)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          <div className={`w-10 h-1 rounded-full ${t.pip} opacity-30`} />
        </div>

        <div className="flex items-start justify-between mb-4">
          <div>
            <p className={`text-lg font-bold leading-none ${t.titleText}`} style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
              {label}
            </p>
            <p className={`text-sm mt-0.5 ${t.subText}`}>{damage}</p>
          </div>
          <button onClick={handleClose} className={`${t.closeBtn} transition-colors text-xl leading-none p-1`}>✕</button>
        </div>

        {isRolling && !rollResult
          ? <p className={`text-center text-sm py-4 ${t.label}`}>Rolling…</p>
          : rollResult && (
            <ResultPanel
              parsed={parsed}
              rollResult={rollResult}
              modEnabled={modEnabled}
              onToggleMod={() => setModEnabled(e => !e)}
              onRollAgain={doRoll}
              isRolling={isRolling}
              t={t}
              rollKey={rollKey}
            />
          )
        }
      </div>
    </>,
    document.body,
  )
}

// ── Context / Provider ────────────────────────────────────────────────────────

const DiceRollerContext = createContext(null)

export function DiceRollerProvider({ children }) {
  const diceBoxRef = useRef(null)
  const [boxReady, setBoxReady] = useState(false)
  const [request, setRequest]   = useState(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.id = 'dice-box-host'
    el.style.cssText = 'position:fixed;inset:0;z-index:102;pointer-events:none;'
    document.body.appendChild(el)

    let box = null
    try {
      box = new DiceBox({
        assetPath:        ASSET_PATH,
        container:        '#dice-box-host',
        id:               'dice-canvas',
        scale:            12,
        gravity:          1,
        mass:             1,
        friction:         0.8,
        restitution:      0,
        angularDamping:   0.4,
        linearDamping:    0.4,
        spinForce:        5,
        throwForce:       6,
        startingHeight:   8,
        settleTimeout:    5000,
        offscreen:        true,
        delay:            10,
        enableShadows:    true,
        lightIntensity:   1,
      })

      box.init()
        .then(() => { diceBoxRef.current = box; setBoxReady(true) })
        .catch(err => console.warn('[DiceBox] init failed (dice rolling unavailable):', err))
    } catch (err) {
      console.warn('[DiceBox] constructor failed (dice rolling unavailable):', err)
      el.remove()
    }

    return () => {
      box?.clear?.()
      el.remove()
    }
  }, [])

  const roll = useCallback((label, damage, theme = 'violet') => {
    if (!boxReady) return
    setRequest({ label, damage, theme, key: Date.now() })
  }, [boxReady])

  const close = useCallback(() => setRequest(null), [])

  return (
    <DiceRollerContext.Provider value={{ roll }}>
      {children}
      {request && boxReady && (
        <DiceRollerOverlay
          key={request.key}
          label={request.label}
          damage={request.damage}
          theme={request.theme}
          diceBoxRef={diceBoxRef}
          onClose={close}
        />
      )}
    </DiceRollerContext.Provider>
  )
}

export function useDiceRoller() {
  return useContext(DiceRollerContext)
}
