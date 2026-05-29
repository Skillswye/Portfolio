import React from 'react'
import './InDevelopment.css'

export default function InDevelopment() {
  const slots = [
    {
      tag: 'Systems Design',
      semester: 'Spring · TBD',
      note: 'Reserved for coursework in advanced systems design. Mechanics, economies, feedback loops.',
    },
    {
      tag: 'Niagara VFX',
      semester: 'Spring · TBD',
      note: 'Reserved for particle and visual effects work — combat impacts, environmental atmosphere, spell rendering.',
    },
    {
      tag: 'Open Slot',
      semester: 'Future',
      note: 'Reserved for a third project. Possibly a level design vertical slice or an original IP prototype.',
    },
  ]

  return (
    <section id="in-development" className="indev">
      <div className="indev__divider">
        <span className="indev__divider-line" />
        <span className="indev__divider-mark mono">§ 05</span>
        <span className="indev__divider-line" />
      </div>

      <header className="indev__header reveal">
        <span className="eyebrow">In Development</span>
        <h2 className="indev__title display">
          What's <em>coming next.</em>
        </h2>
        <p className="indev__intro">
          These slots are intentionally empty — a quiet promise that this portfolio
          is a living document. Each placeholder marks work currently in progress
          or scheduled for the next term.
        </p>
      </header>

      <div className="indev__grid">
        {slots.map((slot, i) => (
          <article key={i} className="indev__card reveal" style={{ transitionDelay: `${i * 100}ms` }}>
            <div className="indev__card-frame">
              <span className="indev__card-corner indev__card-corner--tl" />
              <span className="indev__card-corner indev__card-corner--tr" />
              <span className="indev__card-corner indev__card-corner--bl" />
              <span className="indev__card-corner indev__card-corner--br" />

              <div className="indev__card-content">
                <span className="mono indev__card-semester">{slot.semester}</span>
                <h3 className="indev__card-tag display">{slot.tag}</h3>
                <p className="indev__card-note">{slot.note}</p>
                <div className="indev__card-status">
                  <span className="indev__card-dot" />
                  <span className="mono">Awaiting upload</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
