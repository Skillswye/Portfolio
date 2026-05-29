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
            <span className="philosophy__drop">G</span>ames are built twice — once in their
            rules, and once in the player's understanding of them.
            <em> That second build is where I work.</em>
          </p>

          <div className="philosophy__body reveal">
            <p>
              My focus is <strong>systems design</strong> — the discipline of shaping
              mechanics, economies, and feedback loops into something a player can
              inhabit. Less about what a player sees, more about what they come to
              understand by playing.
            </p>
            <p>
              I work primarily in Unreal Engine 5, write in C++ and Java, and prototype
              in Twine before any system enters engine.
            </p>
          </div>

          <div className="philosophy__signature reveal">
            <span className="mono">Currently</span>
            <span className="philosophy__sig-dash">—</span>
            <span>Graduate applicant · MA, Game Design programs</span>
          </div>
        </div>
      </div>
    </section>
  )
}
