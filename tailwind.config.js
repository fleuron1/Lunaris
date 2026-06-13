/** @type {import('tailwindcss').Config} */
//
// ─────────────────────────────────────────────────────────────────────────────
//  THEME NOTE — how to restyle the app
//  The `violet` (primary) and `amber` (accent) scales below are wired to CSS
//  custom properties defined in src/index.css (the `:root` block marked
//  "THEME PALETTE"). Editing those variables re-tones the ENTIRE app, because
//  every component uses `violet-*` / `amber-*` classes. You normally never need
//  to touch this file — change the colours in index.css instead.
//  Surface colours, the page background, and the display font are CSS vars too;
//  see index.css. Reusable component-class tokens live in src/theme.js.
// ─────────────────────────────────────────────────────────────────────────────
const withVar = (name) => ({
  50:  `rgb(var(--${name}-50) / <alpha-value>)`,
  100: `rgb(var(--${name}-100) / <alpha-value>)`,
  200: `rgb(var(--${name}-200) / <alpha-value>)`,
  300: `rgb(var(--${name}-300) / <alpha-value>)`,
  400: `rgb(var(--${name}-400) / <alpha-value>)`,
  500: `rgb(var(--${name}-500) / <alpha-value>)`,
  600: `rgb(var(--${name}-600) / <alpha-value>)`,
  700: `rgb(var(--${name}-700) / <alpha-value>)`,
  800: `rgb(var(--${name}-800) / <alpha-value>)`,
  900: `rgb(var(--${name}-900) / <alpha-value>)`,
  950: `rgb(var(--${name}-950) / <alpha-value>)`,
})

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary + accent are CSS-variable backed → see index.css THEME PALETTE
        violet: withVar('violet'),
        amber: withVar('amber'),
        midnight: 'rgb(var(--bg) / <alpha-value>)',
        lunar: {
          full: '#F5A623',
          new: '#6B7280',
          crescent: '#8B5CF6',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        'twinkle-slow': 'twinkle 5s ease-in-out infinite',
        'twinkle-fast': 'twinkle 1.8s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
