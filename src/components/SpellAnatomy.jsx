import React from 'react'
import './SpellAnatomy.css'

const Mini = ({ active = [], path = [], highlight = null }) => {
  const positions = {
    0: [0, 0], 1: [20, 0], 2: [40, 0],
    3: [0, 20], 4: [20, 20], 5: [40, 20],
    6: [0, 40], 7: [20, 40], 8: [40, 40],
  }
  const pathPoints = path.map((idx) => positions[idx])
  return (
    <svg viewBox="-6 -6 52 52" className="spell__mini">
      {pathPoints.length > 1 && (
        <polyline
          points={pathPoints.map((p) => p.join(',')).join(' ')}
          className="spell__mini-line"
        />
      )}
      {Object.entries(positions).map(([idx, [x, y]]) => {
        const i = parseInt(idx)
        const isActive = active.includes(i)
        const isHighlight = highlight === i
        return (
          <circle
            key={idx}
            cx={x}
            cy={y}
            r="3"
            className={
              isHighlight
                ? 'spell__mini-dot--bright'
                : isActive
                ? 'spell__mini-dot--active'
                : 'spell__mini-dot'
            }
          />
        )
      })}
    </svg>
  )
}

const spells = [
  {
    name: 'Sanctum of Aurelion',
    sub: 'Heal',
    meta: '2 dots · lowest risk',
    pattern: [0, 1],
    highlight: 0,
  },
  {
    name: 'Way of Flame',
    sub: 'Elemental · Fire',
    meta: '3 dots · mid risk',
    pattern: [1, 2, 5],
    highlight: 1,
  },
  {
    name: 'Way of Water',
    sub: 'Elemental · Water',
    meta: '3 dots · mid risk',
    pattern: [3, 4, 0],
    highlight: 3,
  },
  {
    name: 'Hand of Chronos',
    sub: 'Time control · straight',
    meta: '3 dots · high risk',
    pattern: [1, 4, 7],
    highlight: 1,
  },
  {
    name: 'BreakDown',
    sub: 'Debuff · bleeding',
    meta: '3 dots · high risk',
    pattern: [5, 6, 8],
    highlight: 5,
  },
  {
    name: 'Judgement',
    sub: 'Ultimate · full traversal',
    meta: '9 dots · maximum risk',
    pattern: [0, 1, 2, 5, 4, 3, 6, 7, 8],
    highlight: 0,
  },
]

export default function SpellAnatomy() {
  return (
    <section className="spell reveal">
      <header className="spell__header">
        <span className="eyebrow">Fig. 02 / Spell Gesture Anatomy</span>
        <h3 className="spell__title display">
          A language drawn under fire.
        </h3>
      </header>

      <div className="spell__layout">
        {/* Left: large reference grid */}
        <div className="spell__reference">
          <span className="mono spell__reference-label">The Grid</span>
          <svg viewBox="-20 -25 140 145" className="spell__big-grid">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const x = (i % 3) * 50
              const y = Math.floor(i / 3) * 50
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="6" className="spell__big-dot" />
                  <text x={x} y={y - 12} className="spell__big-num">
                    {i}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Right: pattern cards */}
        <div className="spell__cards">
          {spells.map((s, i) => (
            <article
              key={i}
              className={`spell__card ${s.isUltimate ? 'spell__card--ultimate' : ''}`}
            >
              <Mini
                active={s.pattern}
                path={s.pattern}
                highlight={s.highlight}
              />
              <div className="spell__card-text">
                <h4 className="spell__card-name">{s.name}</h4>
                <span className="mono spell__card-sub">{s.sub}</span>
                <span className="mono spell__card-meta">{s.meta}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <blockquote className="spell__quote">
        Every spell is a sentence the player writes in real time. The grid is the
        alphabet. The pattern is the grammar. The rune charge is the cost — paid
        before the meaning is known.
      </blockquote>
    </section>
  )
}