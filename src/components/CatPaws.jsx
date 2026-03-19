import { useEffect, useState, useRef } from 'react'

// Inject keyframe once
function injectStyles() {
  if (document.getElementById('cat-paw-styles')) return
  const s = document.createElement('style')
  s.id = 'cat-paw-styles'
  s.textContent = `
    @keyframes catPawFade {
      0%   { opacity: 0; }
      10%  { opacity: 1; }
      55%  { opacity: 0.85; }
      100% { opacity: 0; }
    }
  `
  document.head.appendChild(s)
}

// Single paw print — toes pointing "up" in SVG space (rotate to match walk direction)
function PawPrint({ x, y, rotation, flipX, delay }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: x - 9,
        top: y - 10,
        width: 18,
        height: 20,
        pointerEvents: 'none',
        zIndex: 3,
        transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1})`,
        transformOrigin: '9px 10px',
        animation: `catPawFade 4200ms ${delay}ms ease-in-out both`,
      }}
    >
      <svg width="18" height="20" viewBox="0 0 20 22" fill="rgba(219,234,254,0.52)">
        {/* 4 toe beans — arc at top */}
        <ellipse cx="3.5"  cy="7.5" rx="2.4" ry="2.9" />
        <ellipse cx="8.5"  cy="4.5" rx="2.4" ry="2.9" />
        <ellipse cx="13.5" cy="4.8" rx="2.4" ry="2.9" />
        <ellipse cx="18"   cy="8.2" rx="2.4" ry="2.9" />
        {/* main metacarpal pad */}
        <ellipse cx="10"   cy="16"  rx="7"   ry="5.5" />
      </svg>
    </div>
  )
}

function generateWalk() {
  const W = window.innerWidth
  const H = window.innerHeight
  const goRight = Math.random() > 0.5

  // Y anywhere from 20%–80% down the screen
  const baseY   = H * (0.2 + Math.random() * 0.6)
  // Slight diagonal slope
  const slope   = (Math.random() - 0.5) * 0.18

  const count   = 8
  const stepX   = (W + 100) / (count - 1)   // spans full width + a bit off each edge
  const rotation = goRight ? 90 : -90

  return Array.from({ length: count }, (_, i) => {
    const forward  = goRight ? stepX * i : -stepX * i
    const isLeft   = i % 2 === 0
    return {
      id:       i,
      x:        (goRight ? -50 : W + 50) + forward,
      y:        baseY + slope * Math.abs(forward) + (isLeft ? -15 : 15),
      rotation,
      flipX:    !isLeft,
      delay:    i * 370,
    }
  })
}

export default function CatPaws() {
  const [paws, setPaws]   = useState([])
  const timerRef          = useRef(null)

  useEffect(() => {
    injectStyles()

    function triggerWalk() {
      const walk      = generateWalk()
      setPaws(walk)

      // Clean up after all paws have finished fading
      const totalMs   = (walk.length - 1) * 370 + 4200 + 400
      setTimeout(() => setPaws([]), totalMs)

      // Schedule next walk: 35–90 seconds later
      timerRef.current = setTimeout(triggerWalk, 35000 + Math.random() * 55000)
    }

    // First walk: 10–25 seconds after mount
    timerRef.current = setTimeout(triggerWalk, 10000 + Math.random() * 15000)

    return () => clearTimeout(timerRef.current)
  }, [])

  if (!paws.length) return null
  return (
    <>
      {paws.map(p => <PawPrint key={p.id} {...p} />)}
    </>
  )
}
