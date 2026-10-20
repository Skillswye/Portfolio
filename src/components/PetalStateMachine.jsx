import React, { useRef, useState } from 'react'
import VideoPlayer from './VideoPlayer.jsx'
import './PetalStateMachine.css'

// Diagram geometry only (viewBox 720 × 420) — all wording lives in projects.js.
const NODE_W = 150
const NODE_H = 56
const NODES = {
  falling: { x: 360, y: 50 },
  airborne: { x: 360, y: 205 },
  grounded: { x: 130, y: 355 },
  drifting: { x: 590, y: 355 },
}
const EDGES = [
  { key: 'falling>airborne', d: 'M360 78 L360 175', label: [372, 132], anchor: 'start' },
  { key: 'falling>grounded', d: 'M285 50 C170 50 130 190 130 325', label: [146, 205], anchor: 'start' },
  { key: 'falling>drifting', d: 'M435 50 C550 50 590 190 590 325', label: [574, 205], anchor: 'end' },
  { key: 'grounded>airborne', d: 'M205 322 L285 228', label: [232, 262], anchor: 'end' },
  { key: 'airborne>grounded', d: 'M295 238 L215 332', label: [268, 304], anchor: 'start' },
  { key: 'drifting>airborne', d: 'M515 322 L435 228', label: [488, 262], anchor: 'start' },
  { key: 'airborne>drifting', d: 'M425 238 L505 332', label: [452, 304], anchor: 'end' },
  { key: 'drifting>grounded', d: 'M515 355 L205 355', label: [360, 380], anchor: 'middle' },
]

export default function PetalStateMachine({ figure }) {
  const { video, states, transitions, behaviors } = figure
  const [activeIndex, setActiveIndex] = useState(null)
  const videoRef = useRef(null)

  const stateById = Object.fromEntries(states.map((s) => [s.id, s]))
  const activeState = activeIndex === null ? null : behaviors[activeIndex].state

  const jumpTo = (index) => {
    setActiveIndex(index)
    const v = videoRef.current
    if (!v) return
    v.currentTime = behaviors[index].startSec
    // The browser may refuse to start playback; the seek still lands either way.
    v.play().catch(() => {})
  }

  const jumpToState = (stateId) => {
    const index = behaviors.findIndex((b) => b.state === stateId)
    if (index !== -1) jumpTo(index)
  }

  // While the video plays, light up the behavior currently on screen.
  const handleTimeUpdate = (e) => {
    const t = e.currentTarget.currentTime
    let index = null
    behaviors.forEach((b, i) => {
      if (b.startSec <= t) index = i
    })
    if (index !== activeIndex) setActiveIndex(index)
  }

  const onNodeKey = (e, stateId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      jumpToState(stateId)
    }
  }

  return (
    <section className="psm reveal">
      <header className="psm__header">
        <span className="eyebrow">Fig. 01 / Petal State Machine</span>
        <h3 className="psm__title display">{figure.title}</h3>
      </header>

      <div className="psm__video-wrap">
        <VideoPlayer
          ref={videoRef}
          video={video}
          title={figure.videoTitle}
          onTimeUpdate={handleTimeUpdate}
        />
        <p className="psm__caption mono">
          Fig. 01a · Showcase · Click a state or behavior to jump
        </p>
      </div>

      <div className="psm__diagram">
        <svg viewBox="0 0 720 420" role="group" aria-label="Petal state diagram">
          <defs>
            <marker id="psm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 1 L9 5 L0 9" className="psm__arrowhead" />
            </marker>
          </defs>

          {EDGES.map((edge) => {
            const [from, to] = edge.key.split('>')
            const lit = activeState === from || activeState === to
            return (
              <g key={edge.key} className={`psm__edge ${lit ? 'psm__edge--lit' : ''}`}>
                <path d={edge.d} markerEnd="url(#psm-arrow)" />
                <text x={edge.label[0]} y={edge.label[1]} textAnchor={edge.anchor}>
                  {transitions[edge.key]}
                </text>
              </g>
            )
          })}

          {Object.entries(NODES).map(([id, { x, y }]) => {
            const state = stateById[id]
            return (
              <g
                key={id}
                className={`psm__node ${activeState === id ? 'psm__node--active' : ''}`}
                transform={`translate(${x - NODE_W / 2} ${y - NODE_H / 2})`}
                role="button"
                tabIndex={0}
                aria-label={`State ${state.code}: ${state.name} — jump to it in the video`}
                onClick={() => jumpToState(id)}
                onKeyDown={(e) => onNodeKey(e, id)}
              >
                <rect width={NODE_W} height={NODE_H} />
                <text x="14" y="21" className="psm__node-code">
                  STATE {String(state.code).padStart(2, '0')}
                </text>
                <text x="14" y="43" className="psm__node-name">
                  {state.name}
                </text>
              </g>
            )
          })}
        </svg>
        <p className="psm__footnote">{figure.footnote}</p>
      </div>

      <div className="psm__cards">
        {behaviors.map((b, i) => {
          const state = stateById[b.state]
          return (
            <button
              key={b.name}
              type="button"
              className={`psm__card ${activeIndex === i ? 'psm__card--active' : ''}`}
              onClick={() => jumpTo(i)}
            >
              <span className="psm__card-head">
                <span className="mono psm__card-state">
                  State {String(state.code).padStart(2, '0')} · {state.name}
                </span>
                <span className="mono psm__card-time">{b.timestamp}</span>
              </span>
              <span className="psm__card-name display">{b.name}</span>
              <span className="psm__card-mechanic mono">{b.mechanic}</span>
              <span className="psm__card-intent">{b.intent}</span>
            </button>
          )
        })}
      </div>

      <blockquote className="psm__quote">{figure.quote}</blockquote>
    </section>
  )
}
