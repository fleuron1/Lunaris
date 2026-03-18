import { useMemo } from 'react'

function seededRand(seed) {
  let s = seed
  return () => {
    s = Math.imul(1664525, s) + 1013904223 | 0
    return (s >>> 0) / 4294967296
  }
}

const ANIMS = ['snowfall-l', 'snowfall-r', 'snowfall-s']

export default function SnowField() {
  const flakes = useMemo(() => {
    const r = seededRand(0x5E30E4AC)
    return Array.from({ length: 55 }, (_, i) => ({
      id: i,
      x: r() * 100,
      size: r() * 3.5 + 1.5,
      opacity: r() * 0.55 + 0.2,
      duration: r() * 10 + 7,
      delay: r() * 14 - 4,
      anim: ANIMS[Math.floor(r() * 3)],
    }))
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Navy background — covers any default body bg */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(175deg, #020a18 0%, #030d1e 45%, #041020 100%)' }}
      />

      {/* SVG atmospheric glows */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 100 100"
      >
        <defs>
          <radialGradient id="sfPinkBL" cx="8%" cy="96%" r="40%">
            <stop offset="0%" stopColor="#e8197f" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sfPinkTR" cx="88%" cy="6%" r="32%">
            <stop offset="0%" stopColor="#be185d" stopOpacity="0.14" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sfIce" cx="50%" cy="105%" r="50%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.07" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#sfPinkBL)" />
        <rect width="100" height="100" fill="url(#sfPinkTR)" />
        <rect width="100" height="100" fill="url(#sfIce)" />
      </svg>

      {/* Falling snow particles */}
      {flakes.map(f => (
        <div
          key={f.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${f.x}%`,
            top: 0,
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: f.opacity,
            animation: `${f.anim} ${f.duration}s ${f.delay}s linear infinite`,
          }}
        />
      ))}

      {/* Pink glow orb — bottom left */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-60px',
          left: '-50px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(232,25,127,0.14) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
