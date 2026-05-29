import React from 'react'
import './Philosophy.css'

export default function Philosophy() {
  return (
    <section id="philosophy" className="philosophy">
      <div className="philosophy__inner">
        <div className="philosophy__col philosophy__col--left reveal">
          <span className="eyebrow">§ 01 / Statement</span>
        </div>

        <div className="philosophy__col philosophy__col--main">
          <p className="philosophy__lead reveal">
            <span className="philosophy__drop">I</span> design spaces the way
            a director stages a scene —
            <em> every doorway a choice, every corridor a held breath.</em>
          </p>

          <div className="philosophy__body reveal">
            <p>
              My work sits at the intersection of <strong>level design</strong>,
              <strong> systems design</strong>, and <strong>spatial storytelling</strong>.
              I am drawn to the Kojima tradition: games as places where mechanics carry meaning,
              where a button press can register as grief, and where the architecture itself remembers.
            </p>
            <p>
              I build in Unreal Engine 5, write in Blueprint, prototype in Twine, and read
              widely outside of games — contemporary art, ludology, nutrition science, language.
              The best level designers I know are also the most curious people in the room.
            </p>
          </div>

          <div className="philosophy__signature reveal">
            <span className="mono">Currently</span>
            <span className="philosophy__sig-dash">—</span>
            <span>Graduate applicant · GSND, MFA, Game Design programs</span>
          </div>
        </div>
      </div>
    </section>
  )
}
