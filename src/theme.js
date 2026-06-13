// ═════════════════════════════════════════════════════════════════════════════
//  THEME TOKENS — component-level styling, in one place.
//
//  WHERE TO CHANGE WHAT
//  • Colours / brand palette / page background / heading font
//        → src/index.css  (the `:root` "THEME PALETTE" block)
//  • Tailwind colour wiring (you rarely touch this)
//        → tailwind.config.js
//  • Reusable component class strings (cards, buttons, inputs, chips, …)
//        → THIS FILE
//
//  These are plain Tailwind class strings. Import what you need and spread it
//  into a className, e.g.:
//      import { T } from '../theme.js'
//      <div className={T.card}> … </div>
//      <button className={T.btnPrimary}>Cast</button>
//
//  Because the colour names (violet-*, amber-*) resolve to CSS variables, you
//  can re-skin the app entirely from index.css without editing these strings.
//  Adjust the strings here when you want to change *shape* (radius, padding,
//  borders) rather than colour.
// ═════════════════════════════════════════════════════════════════════════════

// Surfaces & containers
export const CARD        = 'card p-4'
export const PANEL       = 'rounded-xl border border-violet-900/30 bg-violet-950/30'
export const PANEL_INSET = 'rounded-lg border border-violet-900/20 bg-violet-950/30'

// Typography
export const DISPLAY      = "font-display" // heading font (Cinzel via --font-display)
export const SECTION_LABEL = 'text-[10px] font-bold uppercase tracking-[0.14em] text-violet-400/50'
export const MUTED        = 'text-violet-300/50'
export const HEADING      = 'text-white font-bold'

// Buttons
export const BTN_PRIMARY = 'px-4 py-2 rounded-xl bg-violet-700/70 border border-violet-500/60 text-white font-semibold text-sm hover:bg-violet-600/80 transition-all shadow-[0_0_16px_rgba(139,92,246,0.3)] disabled:opacity-40 disabled:cursor-not-allowed'
export const BTN_GHOST   = 'px-4 py-2 rounded-xl border border-violet-800/40 bg-violet-950/40 text-violet-200 text-sm font-semibold hover:bg-violet-900/40 transition-colors disabled:opacity-30'
export const STEPPER_DOT = 'w-7 h-7 rounded-md border border-violet-800/40 bg-violet-950/40 text-violet-200 font-bold hover:bg-violet-900/40 transition-colors'

// Inputs
export const INPUT = 'bg-violet-950/50 border border-violet-800/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-violet-600/40 focus:outline-none focus:border-violet-500/60'

// Selectable cards / chips
export const PICK_SELECTED = 'bg-violet-900/40 border-violet-500/60 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
export const PICK_IDLE     = 'bg-violet-950/30 border-violet-900/30 hover:border-violet-600/50 hover:bg-violet-950/50'
export const CHIP          = 'text-xs bg-violet-900/30 border border-violet-800/30 text-violet-200/80 px-2.5 py-1 rounded-full'
export const CHIP_ACCENT   = 'text-xs bg-amber-900/25 border border-amber-700/30 text-amber-200/80 px-2.5 py-1 rounded-full'

// Status colours (kept literal so they read clearly at call sites)
export const OK_TEXT   = 'text-emerald-300'
export const WARN_TEXT = 'text-amber-300'
export const BAD_TEXT  = 'text-rose-400'

// Bundle for `import { T }` ergonomics
export const T = {
  card: CARD, panel: PANEL, panelInset: PANEL_INSET,
  display: DISPLAY, sectionLabel: SECTION_LABEL, muted: MUTED, heading: HEADING,
  btnPrimary: BTN_PRIMARY, btnGhost: BTN_GHOST, stepperDot: STEPPER_DOT,
  input: INPUT,
  pickSelected: PICK_SELECTED, pickIdle: PICK_IDLE, chip: CHIP, chipAccent: CHIP_ACCENT,
  okText: OK_TEXT, warnText: WARN_TEXT, badText: BAD_TEXT,
}

export default T
