import React from 'react'
import './PatrolAI.css'

export default function PatrolAI() {
  return (
    <section className="patrol reveal">
      <header className="patrol__header">
        <span className="eyebrow">Fig. 03 / Patrol AI · State Machine</span>
        <h3 className="patrol__title display">
          The shape of attention.
        </h3>
      </header>

      {/* State machine diagram */}
      <div className="patrol__diagram">
        <svg viewBox="0 0 680 480" className="patrol__svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="patrol-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M2 1 L8 5 L2 9" fill="none" stroke="var(--ember)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {/* PATROL node */}
          <g>
            <rect x="40" y="60" width="150" height="64" rx="4" className="patrol__node" />
            <text x="115" y="90" textAnchor="middle" className="patrol__node-name">Patrol</text>
            <text x="115" y="108" textAnchor="middle" className="patrol__node-sub">FOLLOW TAGGED PATH</text>
          </g>

          {/* CHASE node */}
          <g>
            <rect x="265" y="60" width="150" height="64" rx="4" className="patrol__node" />
            <text x="340" y="90" textAnchor="middle" className="patrol__node-name">Chase</text>
            <text x="340" y="108" textAnchor="middle" className="patrol__node-sub">PURSUE PLAYER</text>
          </g>

          {/* ATTACK node */}
          <g>
            <rect x="490" y="60" width="150" height="64" rx="4" className="patrol__node" />
            <text x="565" y="90" textAnchor="middle" className="patrol__node-name">Attack</text>
            <text x="565" y="108" textAnchor="middle" className="patrol__node-sub">IN RANGE</text>
          </g>

          {/* Patrol -> Chase */}
          <line x1="190" y1="85" x2="263" y2="85" className="patrol__trans" markerEnd="url(#patrol-ar)" />
          <rect x="192" y="42" width="68" height="13" className="patrol__label-bg" />
          <text x="226" y="51" textAnchor="middle" className="patrol__trans-label">sees player</text>

          {/* Chase -> Attack */}
          <line x1="415" y1="85" x2="488" y2="85" className="patrol__trans" markerEnd="url(#patrol-ar)" />
          <rect x="414" y="42" width="76" height="13" className="patrol__label-bg" />
          <text x="452" y="51" textAnchor="middle" className="patrol__trans-label">enters range</text>

          {/* Attack -> Chase (return arc) */}
          <path d="M490,112 Q452,150 415,112" className="patrol__trans" fill="none" markerEnd="url(#patrol-ar)" />
          <rect x="412" y="146" width="80" height="13" className="patrol__label-bg" />
          <text x="452" y="155" textAnchor="middle" className="patrol__trans-label">leaves range</text>

          {/* Chase -> Patrol (big return arc) */}
          <path d="M285,124 Q165,210 175,126" className="patrol__trans" fill="none" markerEnd="url(#patrol-ar)" />
          <rect x="155" y="196" width="128" height="13" className="patrol__label-bg" />
          <text x="219" y="205" textAnchor="middle" className="patrol__trans-label">lost sight · 4s timeout</text>

          {/* Detection cone — 120 degrees (60 above + 60 below horizontal) */}
          <g transform="translate(150, 330)">
            <path d="M0,0 L55,-95 A110,110 0 0,1 55,95 Z" fill="var(--ember)" opacity="0.13" />
            <path d="M0,0 L55,-95" stroke="var(--ember)" strokeWidth="0.5" opacity="0.5" />
            <path d="M0,0 L55,95" stroke="var(--ember)" strokeWidth="0.5" opacity="0.5" />
            <path d="M55,-95 A110,110 0 0,1 55,95" fill="none" stroke="var(--ember)" strokeWidth="0.5" opacity="0.5" />
            <circle cx="0" cy="0" r="5" fill="var(--ember-bright)" />
            <text x="-8" y="20" textAnchor="middle" className="patrol__node-sub">ENEMY</text>
            <text x="40" y="-105" textAnchor="middle" className="patrol__detect-label">120° CONE</text>
            <text x="135" y="4" textAnchor="middle" className="patrol__detect-label">800 UNITS</text>
          </g>

          {/* SuicideBomber variant */}
          <g transform="translate(380, 270)">
            <rect x="0" y="0" width="260" height="80" rx="4" className="patrol__node-dim" />
            <text x="16" y="26" className="patrol__variant-eyebrow">VARIANT · SUICIDE BOMBER</text>
            <text x="16" y="50" className="patrol__variant-text">Sees player → charge → detonate.</text>
            <text x="16" y="68" className="patrol__variant-sub">One-shot. No chase, no negotiation.</text>
          </g>
        </svg>
      </div>

      {/* Live debug screenshot */}
      <figure className="patrol__debug">
        <div className="patrol__debug-frame">
          <img src="/patrol-ai-debug.png" alt="UE5 AI Perception debug visualization showing sight cone and detection range" />
        </div>
        <figcaption className="patrol__debug-caption mono">
          Fig. 03a · Live AI Perception debug · 120° sight cone · 800 unit range
        </figcaption>
      </figure>

      <blockquote className="patrol__quote">
        Each enemy is a small state machine. Detection commits it to pursuit;
        a four-second memory lets it give up rather than chase forever.
      </blockquote>
    </section>
  )
}