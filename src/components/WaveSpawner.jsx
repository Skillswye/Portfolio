import React from 'react'
import './WaveSpawner.css'

export default function WaveSpawner() {
  return (
    <section className="wave reveal">
      <header className="wave__header">
        <span className="eyebrow">Fig. 04 / Wave Spawner · Encounter Design</span>
        <h3 className="wave__title display">
          Encounters, written in data.
        </h3>
      </header>

      <div className="wave__diagram">
        <svg viewBox="0 0 680 560" className="wave__svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="ws-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M2 1 L8 5 L2 9" fill="none" stroke="var(--ember)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {/* Part 1: Room top-down */}
          <text x="40" y="40" className="wave__svg-eyebrow">ROOM · SPAWN ON ENTER</text>
          <line x1="40" y1="54" x2="640" y2="54" stroke="var(--char)" strokeWidth="0.5" />

          <rect x="180" y="90" width="320" height="200" rx="2" className="wave__room" />
          <text x="340" y="280" textAnchor="middle" className="wave__svg-sub">ENCOUNTER ROOM</text>

          <rect x="320" y="285" width="40" height="8" className="wave__entry" />
          <text x="340" y="312" textAnchor="middle" className="wave__svg-sub">ENTRY</text>

          <circle cx="340" cy="330" r="7" fill="var(--signal)" />
          <text x="340" y="350" textAnchor="middle" className="wave__svg-player">PLAYER</text>
          <line x1="340" y1="322" x2="340" y2="296" stroke="var(--signal)" strokeWidth="0.8" strokeDasharray="3 3" markerEnd="url(#ws-ar)" />

          <g>
            <circle cx="240" cy="140" r="16" className="wave__spawn" />
            <circle cx="240" cy="140" r="4" className="wave__enemy" />
          </g>
          <g>
            <circle cx="430" cy="135" r="16" className="wave__spawn" />
            <circle cx="430" cy="135" r="4" className="wave__enemy" />
          </g>
          <g>
            <circle cx="340" cy="180" r="16" className="wave__spawn" />
            <circle cx="340" cy="180" r="4" className="wave__enemy" />
          </g>
          <g>
            <circle cx="280" cy="230" r="16" className="wave__spawn" />
            <circle cx="280" cy="230" r="4" className="wave__enemy" />
          </g>
          <g>
            <circle cx="440" cy="225" r="16" className="wave__spawn" />
            <circle cx="440" cy="225" r="4" className="wave__enemy" />
          </g>

          <text x="540" y="150" textAnchor="start" className="wave__svg-note">⊘ Random</text>
          <text x="540" y="164" textAnchor="start" className="wave__svg-note">  Spawn</text>
          <text x="540" y="178" textAnchor="start" className="wave__svg-note">  Points</text>

          {/* Part 2: Wave sequence */}
          <text x="40" y="380" className="wave__svg-eyebrow">WAVE SEQUENCE</text>
          <line x1="40" y1="394" x2="640" y2="394" stroke="var(--char)" strokeWidth="0.5" />

          <g>
            <rect x="50" y="430" width="130" height="60" rx="4" className="wave__box" />
            <text x="115" y="458" textAnchor="middle" className="wave__box-name">Wave 1</text>
            <text x="115" y="474" textAnchor="middle" className="wave__box-sub">2 GHOST · 1 BOMBER</text>
          </g>

          <line x1="180" y1="460" x2="248" y2="460" stroke="var(--ember)" strokeWidth="1" opacity="0.7" markerEnd="url(#ws-ar)" />
          <rect x="183" y="440" width="64" height="12" className="wave__flow-bg" />
          <text x="215" y="449" textAnchor="middle" className="wave__flow-label">cleared</text>
          <rect x="183" y="466" width="64" height="12" className="wave__flow-bg" />
          <text x="215" y="475" textAnchor="middle" className="wave__flow-label">→ delay 3s</text>

          <g>
            <rect x="250" y="430" width="130" height="60" rx="4" className="wave__box" />
            <text x="315" y="458" textAnchor="middle" className="wave__box-name">Wave 2</text>
            <text x="315" y="474" textAnchor="middle" className="wave__box-sub">CONFIGURED SET</text>
          </g>

          <line x1="380" y1="460" x2="448" y2="460" stroke="var(--ember)" strokeWidth="1" opacity="0.7" markerEnd="url(#ws-ar)" />
          <rect x="383" y="440" width="64" height="12" className="wave__flow-bg" />
          <text x="415" y="449" textAnchor="middle" className="wave__flow-label">cleared</text>
          <rect x="383" y="466" width="64" height="12" className="wave__flow-bg" />
          <text x="415" y="475" textAnchor="middle" className="wave__flow-label">→ delay</text>

          <g>
            <rect x="450" y="430" width="130" height="60" rx="4" className="wave__box" />
            <text x="515" y="458" textAnchor="middle" className="wave__box-name">Wave N…</text>
            <text x="515" y="474" textAnchor="middle" className="wave__box-sub">UNTIL COMPLETE</text>
          </g>

          <text x="50" y="520" textAnchor="start" className="wave__svg-footnote">Each wave's enemy class, count, and element are configured in the Details panel before play.</text>
        </svg>
      </div>

      <figure className="wave__figure">
        <div className="wave__paired">
          <div className="wave__half wave__half--data">
            <img src="/wave-spawner-details.png" alt="Wave spawner Details panel showing data structure" />
            <span className="mono wave__label">— Design (Details Panel) —</span>
          </div>
          <div className="wave__divider">
            <svg className="wave__arrow" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12 L40 12 M30 4 L42 12 L30 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="wave__half wave__half--runtime">
            <img src="/wave-spawner-runtime.png" alt="Runtime wave with ghosts and bomber spawned" />
            <span className="mono wave__label">— Runtime (Spawned) —</span>
          </div>
        </div>
        <figcaption className="wave__caption mono">
          Fig. 04a · Designer's View
        </figcaption>
      </figure>

      <blockquote className="wave__quote">
        Encounters are written in data, not script. Each wave is a row in a
        table — spawn point, enemy class, delay. The system stages the moment;
        the design is the choice of what to ask for.
      </blockquote>
    </section>
  )
}