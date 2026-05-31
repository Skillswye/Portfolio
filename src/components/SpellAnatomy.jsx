import React, { useState, useRef, useEffect } from 'react'
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

// Helper — compare two patterns
const patternsMatch = (a, b) => {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

export default function SpellAnatomy() {
  // Interactive grid state
  const [drawnPath, setDrawnPath] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [cursorPos, setCursorPos] = useState(null)
  const [resultState, setResultState] = useState('idle') // 'idle' | 'success' | 'fail'
  const [matchedSpellIndex, setMatchedSpellIndex] = useState(null)
  const [pulseSpellIndex, setPulseSpellIndex] = useState(null)
  const svgRef = useRef(null)
  const failTimeout = useRef(null)
  const successTimeout = useRef(null)

  // Dot positions in SVG coordinates (matching the viewBox layout)
  const dotPositions = {
    0: [0, 0], 1: [50, 0], 2: [100, 0],
    3: [0, 50], 4: [50, 50], 5: [100, 50],
    6: [0, 100], 7: [50, 100], 8: [100, 100],
  }

  // Convert mouse/touch event coordinates into SVG space
  const getSvgPoint = (e) => {
    const svg = svgRef.current
    if (!svg) return null
    const pt = svg.createSVGPoint()
    const touch = e.touches?.[0]
    pt.x = touch ? touch.clientX : e.clientX
    pt.y = touch ? touch.clientY : e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const local = pt.matrixTransform(ctm.inverse())
    return { x: local.x, y: local.y }
  }

  // Find a dot near the cursor (snap radius)
  const findNearbyDot = (point) => {
    if (!point) return null
    const SNAP_RADIUS = 18
    for (const [idx, [x, y]] of Object.entries(dotPositions)) {
      const dx = point.x - x
      const dy = point.y - y
      if (Math.sqrt(dx * dx + dy * dy) < SNAP_RADIUS) {
        return parseInt(idx)
      }
    }
    return null
  }

  const startDraw = (e) => {
    e.preventDefault()
    if (failTimeout.current) clearTimeout(failTimeout.current)
    if (successTimeout.current) clearTimeout(successTimeout.current)
    setResultState('idle')
    setMatchedSpellIndex(null)
    const point = getSvgPoint(e)
    const hit = findNearbyDot(point)
    if (hit !== null) {
      setDrawnPath([hit])
      setIsDrawing(true)
      setCursorPos(point)
    }
  }

  const continueDraw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const point = getSvgPoint(e)
    setCursorPos(point)
    const hit = findNearbyDot(point)
    if (hit !== null && !drawnPath.includes(hit)) {
      setDrawnPath((prev) => [...prev, hit])
    }
  }

  const endDraw = (e) => {
    if (!isDrawing) return
    e?.preventDefault?.()
    setIsDrawing(false)
    setCursorPos(null)

    if (drawnPath.length < 2) {
      // Too short — just reset silently
      setDrawnPath([])
      return
    }

    // Check against spell library (strict match)
    const matchIdx = spells.findIndex((s) => patternsMatch(s.pattern, drawnPath))
    if (matchIdx >= 0) {
      setResultState('success')
      setMatchedSpellIndex(matchIdx)
      setPulseSpellIndex(matchIdx)
      // After 900ms, transition into the fading state
      successTimeout.current = setTimeout(() => {
        setResultState('success-fading')
        // After the fade completes, clear all data
        successTimeout.current = setTimeout(() => {
          setPulseSpellIndex(null)
          setResultState('idle')
          setDrawnPath([])
          setMatchedSpellIndex(null)
        }, 700)
      }, 900)
    } else {
      setResultState('fail')
      failTimeout.current = setTimeout(() => {
        setResultState('idle')
        setDrawnPath([])
      }, 600)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (failTimeout.current) clearTimeout(failTimeout.current)
      if (successTimeout.current) clearTimeout(successTimeout.current)
    }
  }, [])

  // Build the polyline string from drawn path + optional cursor extension
  const buildLineString = () => {
    if (drawnPath.length === 0) return ''
    const points = drawnPath.map((idx) => dotPositions[idx])
    let pointsStr = points.map((p) => p.join(',')).join(' ')
    // Add cursor as floating end while drawing
    if (isDrawing && cursorPos && drawnPath.length > 0) {
      pointsStr += ` ${cursorPos.x},${cursorPos.y}`
    }
    return pointsStr
  }

  return (
    <section className="spell reveal">
      <header className="spell__header">
        <span className="eyebrow">Fig. 01 / Spell Gesture Anatomy</span>
        <h3 className="spell__title display">
          A language drawn under fire.
        </h3>
      </header>

      <div className="spell__layout">
        {/* Left: interactive grid */}
        <div className="spell__reference">
          <span className="mono spell__reference-label">The Grid</span>
          <svg
            ref={svgRef}
            viewBox="-20 -25 140 145"
            className={`spell__big-grid spell__big-grid--interactive spell__big-grid--${resultState}`}
            onMouseDown={startDraw}
            onMouseMove={continueDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={continueDraw}
            onTouchEnd={endDraw}
          >
            {/* Drawn line */}
            {drawnPath.length > 0 && (
              <polyline
                points={buildLineString()}
                className={`spell__draw-line spell__draw-line--${resultState}`}
              />
            )}

            {/* Dots */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const [x, y] = dotPositions[i]
              const isInPath = drawnPath.includes(i)
              const stateClass =
                isInPath || resultState === 'fail'
                  ? `spell__big-dot--${resultState}`
                  : ''
              return (
                <g key={i}>
                  <text x={x} y={y - 12} className="spell__big-num">
                    {i}
                  </text>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    className={`spell__big-dot ${stateClass} ${
                      isInPath ? 'spell__big-dot--lit' : ''
                    }`}
                  />
                </g>
              )
            })}
          </svg>
          <span className="mono spell__try-hint">
            ▸ Try drawing a pattern
          </span>
        </div>

        {/* Right: pattern cards */}
        <div className="spell__cards">
          {spells.map((s, i) => (
            <article
              key={i}
              className={`spell__card ${
                pulseSpellIndex === i ? 'spell__card--pulse' : ''
              }`}
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