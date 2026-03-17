import { useMemo } from 'react'

function seededRand(seed) {
  let s = seed
  return () => {
    s = Math.imul(1664525, s) + 1013904223 | 0
    return (s >>> 0) / 4294967296
  }
}

export default function StarField() {
  const stars = useMemo(() => {
    const r = seededRand(0xC0DE1234)
    return Array.from({ length: 210 }, (_, i) => {
      const big = i >= 190
      const med = i >= 160 && i < 190
      return {
        id: i,
        x: r() * 100,
        y: r() * 100,
        radius: big ? r() * 0.55 + 0.9 : med ? r() * 0.35 + 0.45 : r() * 0.25 + 0.15,
        opacity: r() * 0.55 + 0.1,
        twinkle: r() > 0.55,
        delay: r() * 7,
        dur: r() * 3.5 + 2,
        color: big ? '#f0e6ff' : med ? '#ddd6fe' : '#c4b5fd',
      }
    })
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background star canvas */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 100 100"
      >
        <defs>
          {/* Upper-right purple atmospheric haze */}
          <radialGradient id="hazeUR" cx="75%" cy="5%" r="30%">
            <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          {/* Lower-left subtle haze */}
          <radialGradient id="hazeLL" cx="10%" cy="90%" r="28%">
            <stop offset="0%" stopColor="#2e1065" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Atmospheric glows */}
        <rect width="100" height="100" fill="url(#hazeUR)" />
        <rect width="100" height="100" fill="url(#hazeLL)" />

        {/* Stars */}
        {stars.map(s => (
          <circle
            key={s.id}
            cx={s.x}
            cy={s.y}
            r={s.radius}
            fill={s.color}
            opacity={s.opacity}
            style={s.twinkle ? {
              animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
            } : undefined}
          />
        ))}
      </svg>

      {/* Large decorative moon orb — upper right, partially off-screen */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-120px',
          right: '-100px',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 38%, rgba(109,40,217,0.22) 0%, rgba(30,10,80,0.12) 45%, transparent 70%)',
          boxShadow: '0 0 90px 30px rgba(88,28,220,0.06)',
        }}
      />

      {/* Subtle crescent ring decoration */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-80px',
          right: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          border: '1px solid rgba(139,92,246,0.12)',
          boxShadow: 'inset 0 0 40px rgba(139,92,246,0.06)',
        }}
      />
    </div>
  )
}
