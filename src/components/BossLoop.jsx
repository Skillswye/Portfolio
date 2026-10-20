import React, { useState, useRef } from 'react'
import VideoPlayer from './VideoPlayer.jsx'
import './BossLoop.css'

const phases = [
  {
    id: 1,
    name: 'Ignition',
    element: 'Fire',
    mechanic: '360° fire wave · twice',
    role: 'Teaching the read',
    intent:
      'Symmetrical attacks are the purest spatial test. No punishment chain, no accumulating risk — only whether the player can find the gap before the wave arrives.',
    timestamp: '00:10',
    startSec: 10,
  },
  {
    id: 2,
    name: 'Undertow',
    element: 'Water',
    mechanic: 'Stun slam → rectangular spikes',
    role: 'Delayed punishment',
    intent:
      'The stun strips agency; the death zone falls after. Two attacks, one sentence — Phase 2 teaches the player that consequence can arrive on a delay.',
    timestamp: '00:18',
    startSec: 18,
  },
  {
    id: 3,
    name: 'Bloom',
    element: 'Wood',
    mechanic: '3× curse circles · stack debt → thorns',
    role: 'Risk economy',
    intent:
      'Curse stacks are debt the player chooses to take. Standing in the red circle buys positioning, but the bill comes due — thorns at the player’s feet collect what was owed.',
    timestamp: '00:30',
    startSec: 30,
  },
  {
    id: 4,
    name: 'Confluence',
    element: 'All',
    mechanic: 'Full-screen AOE + cover walls + phase 1-3 loop',
    role: 'Final exam',
    intent:
      'The walls are the boss’s only gift — held back until the player has earned them. The full-screen AOE teaches the tool, then every prior phase replays. Not a test of reflexes; a test of memory.',
    timestamp: '00:52',
    startSec: 52,
  },
]

export default function BossLoop({ video }) {
  const [activePhase, setActivePhase] = useState(null)
  const videoRef = useRef(null)

  const handlePhaseClick = (phase) => {
    setActivePhase(phase.id)
    const v = videoRef.current
    if (!v) return
    v.currentTime = phase.startSec
    // The browser may refuse to start playback; the seek still lands either way.
    v.play().catch(() => {})
  }

  return (
    <section className="boss reveal">
      <header className="boss__header">
        <span className="eyebrow">Fig. 02 / Boss Encounter Loop</span>
        <h3 className="boss__title display">
          A teacher across four lessons.
        </h3>
      </header>

      {/* Video frame */}
      <div className="boss__video-wrap">
        <VideoPlayer
          ref={videoRef}
          video={video}
          title="Runic Vanguard — Boss encounter loop"
        />
        <p className="boss__video-caption mono">
          Fig. 02a · 4-phase encounter loop · Click a phase below to jump
        </p>
      </div>

      {/* Phase cards (2x2 grid) */}
      <div className="boss__phases">
        {phases.map((p) => (
          <article
            key={p.id}
            className={`boss__phase ${activePhase === p.id ? 'boss__phase--active' : ''}`}
            onClick={() => handlePhaseClick(p)}
          >
            <div className="boss__phase-head">
              <span className="mono boss__phase-num">
                Phase {String(p.id).padStart(2, '0')}
              </span>
              <span className="mono boss__phase-time">{p.timestamp}</span>
            </div>
            <h4 className="boss__phase-name display">{p.name}</h4>
            <div className="boss__phase-meta">
              <span className="mono boss__phase-element">{p.element}</span>
              <span className="boss__phase-dot">·</span>
              <span className="mono boss__phase-role">{p.role}</span>
            </div>
            <p className="boss__phase-mechanic mono">{p.mechanic}</p>
            <p className="boss__phase-intent">{p.intent}</p>
          </article>
        ))}
      </div>

      <blockquote className="boss__quote">
        Each phase rewrites the grammar of the last. What worked in Ignition
        fails in Undertow; what felt safe in Bloom becomes the trap in
        Confluence. Failure is the curriculum.
      </blockquote>
    </section>
  )
}
