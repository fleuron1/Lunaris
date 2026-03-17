export default function SorceryPoints({ sorceryPoints, maxSorceryPoints = 4, adjustSorceryPoints }) {
  return (
    <div className="card p-4 space-y-3">
      <p className="section-header">Sorcery Points</p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => adjustSorceryPoints(-1)} className="btn-sm">−</button>
        <div className="text-center">
          <span className="text-4xl font-bold text-violet-300 tabular-nums">{sorceryPoints}</span>
          <span className="text-violet-300/40 text-lg"> / {maxSorceryPoints}</span>
          <p className="text-[10px] text-violet-300/40 uppercase tracking-widest mt-0.5">Remaining</p>
        </div>
        <button onClick={() => adjustSorceryPoints(1)} className="btn-sm">+</button>
      </div>
      <div className="flex gap-1.5 justify-center flex-wrap">
        {Array.from({ length: maxSorceryPoints }).map((_, i) => (
          <button
            key={i}
            onClick={() => adjustSorceryPoints(i < sorceryPoints ? -(sorceryPoints - i) : (i + 1 - sorceryPoints))}
            className={`pip ${i < sorceryPoints ? 'pip-filled' : 'pip-empty'}`}
          />
        ))}
      </div>
    </div>
  )
}
