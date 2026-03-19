import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import DiceBox from '@3d-dice/dice-box'

// ── Asset paths ───────────────────────────────────────────────────────────────
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
      60%  { transform: scale(1.5); opacity: 1; }
      80%  { transform: scale(0.88); }
      100% { transform: scale(1);   opacity: 1; }
    }
    @keyframes critFlash {
      0%,100% { opacity: 1; }
      50%     { opacity: 0.3; }
    }
    .dice-pop        { animation: dicePop      0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
    .dice-pop-total  { animation: dicePopTotal 0.5s  cubic-bezier(0.34,1.56,0.64,1) both; }
    .dice-crit-flash { animation: critFlash 0.35s ease-in-out 4; }

    /* Critical: style both container AND canvas — from official dice-box CSS */
    #dice-box-host,
    #dice-box-host canvas {
      position: fixed !important;
      pointer-events: none;
      z-index: 102;
      width: 100% !important;
      height: 100% !important;
      top: 0;
      left: 0;
    }
  `
  document.head.appendChild(s)
})()

// ── SFX (Web Audio API synthesized dice rattle) ──────────────────────────────
let audioCtx = null
function playRollSfx() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = audioCtx
    const now = ctx.currentTime
    // Short burst of filtered noise = dice clatter
    const dur = 0.35
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate
      // Decaying noise with a few "bounce" bumps
      const env = Math.exp(-t * 12) * (1 + 0.6 * Math.sin(t * 140))
      data[i] = (Math.random() * 2 - 1) * env * 0.4
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    // Bandpass for a woody/plastic dice sound
    const filt = ctx.createBiquadFilter()
    filt.type = 'bandpass'
    filt.frequency.value = 3200
    filt.Q.value = 1.2
    const gain = ctx.createGain()
    gain.gain.value = 0.7
    src.connect(filt).connect(gain).connect(ctx.destination)
    src.start(now)
  } catch (_) {}
}

// ── Module-level DiceBox singleton ────────────────────────────────────────────
// Created once at module level — never inside a React component.
// scale=6 is the library default and correctly fits the physics world.
// Higher scales cause dice to spawn outside physics walls and disappear.
let _box = null
let _initPromise = null

function initDiceBox() {
  if (_initPromise) return _initPromise

  const el = document.createElement('div')
  el.id = 'dice-box-host'
  el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:102;pointer-events:none;'
  document.body.appendChild(el)

  // scale=50 for big dice. Camera patched in world.onscreen.js (y=120, fov=0.50)
  // to see the larger world. size=30 gives a 60-unit physics arena.
  _box = new DiceBox({
    assetPath:      ASSET_PATH,
    container:      '#dice-box-host',
    id:             'dice-canvas',
    scale:          10,
    size:           10,
    throwForce:     5,
    spinForce:      4,
    startingHeight: 10,
    settleTimeout:  5000,
    offscreen:      false,
  })

  _initPromise = _box.init()
  return _initPromise
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
  const group      = rollResult?.[0]
  const diceValues = group?.rolls?.map(d => d.value) ?? []
  const diceSum    = diceValues.reduce((a, b) => a + b, 0)
  const modifier   = parsed?.modifier ?? 0
  const total      = diceSum + (modEnabled ? modifier : 0)
  const sides      = parsed?.sides ?? group?.sides ?? 6
  const isCrit     = diceValues.length > 0 && diceValues.every(v => v === sides)
  const isFumble   = diceValues.length > 0 && diceValues.every(v => v === 1)

  const delays = ['0ms','60ms','120ms','180ms','240ms','300ms','360ms','420ms']

  return (
    <div className="flex flex-col gap-3">
      {diceValues.length > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-2">
          {diceValues.map((v, i) => (
            <div key={`${rollKey}-die-${i}`} className="flex items-center gap-2">
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

          <div
            key={`${rollKey}-total`}
            className={`dice-pop-total min-w-[64px] h-14 rounded-xl border-2 px-3 flex flex-col items-center justify-center ${t.totalBg}`}
            style={{ animationDelay: `${diceValues.length * 55 + 40}ms` }}
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
// The overlay only mounts when boxReady=true, so _box is guaranteed initialized.
function DiceRollerOverlay({ label, damage, theme, onClose }) {
  const t      = getTheme(theme)
  const parsed = parseDamage(damage)

  const [rollResult, setRollResult] = useState(null)
  const [isRolling, setIsRolling]   = useState(true)
  const [modEnabled, setModEnabled] = useState(true)
  const [visible, setVisible]       = useState(false)
  const [rollKey, setRollKey]       = useState(0)
  const didRoll                     = useRef(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))

    _box.onRollComplete = (result) => {
      setRollResult(result)
      setIsRolling(false)
      setRollKey(k => k + 1)
    }

    // Guard against StrictMode double-fire
    if (!didRoll.current && parsed) {
      didRoll.current = true
      // show() MUST be called before roll() — canvas is hidden by default
      _box.show().roll(parsed.notation).catch(() => setIsRolling(false))
    }

    return () => {
      if (_box) {
        _box.onRollComplete = null
        _box.hide().clear()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function doRollAgain() {
    if (!_box || !parsed) return
    setIsRolling(true)
    setRollResult(null)
    setModEnabled(true)
    playRollSfx()
    _box.show().roll(parsed.notation).catch(() => setIsRolling(false))
  }

  function handleClose() {
    setVisible(false)
    _box?.hide().clear()
    setTimeout(onClose, 220)
  }

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-200 ${t.overlay}`}
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
      />

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
              onRollAgain={doRollAgain}
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
  const [boxReady, setBoxReady] = useState(false)
  const [request, setRequest]   = useState(null)

  useEffect(() => {
    // Initialize once. initDiceBox() returns the same promise on repeat calls.
    initDiceBox()
      .then(() => setBoxReady(true))
      .catch(err => console.warn('[DiceBox] init failed (dice rolling unavailable):', err))
  }, [])

  const roll = useCallback((label, damage, theme = 'violet') => {
    if (!boxReady) return
    playRollSfx()   // synchronous from user click → autoplay allowed
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
          onClose={close}
        />
      )}
    </DiceRollerContext.Provider>
  )
}

export function useDiceRoller() {
  return useContext(DiceRollerContext)
}
