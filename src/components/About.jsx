import React from 'react'
import './About.css'

export default function About() {
  return (
    <section id="about" className="about">
      <div className="about__divider">
        <span className="about__divider-line" />
        <span className="about__divider-mark mono">§ 06</span>
        <span className="about__divider-line" />
      </div>

      <div className="about__grid">
        <div className="about__col-left reveal">
          <span className="eyebrow">About</span>
          <h2 className="about__name display">
            Ziye Zhao
            <span className="about__name-alt">— 赵子烨 · Jason</span>
          </h2>

          <div className="about__bio">
            <p>
              Game design student in Savannah, USA. I am building toward a career as a{' '}
              <strong>systems designer</strong> — the discipline of designing not what
              players see, but what they feel through the rules.
            </p>
            <p>
              I am drawn to the spaces beneath mechanics: how a single resource gate can
              become a moral question, how a feedback loop can become a sentence, how an
              economy can become a world. I work primarily in Unreal Engine 5, write in
              C++ and Java, and prototype quickly in Twine before any system goes into
              engine.
            </p>
          </div>
        </div>

        <aside className="about__col-right reveal">
          <div className="about__card">
            <span className="mono about__card-label">— Contact —</span>
            <ul className="about__contact">
              <li>
                <span className="mono about__contact-tag">Email</span>
                <a href="mailto:skillswye@gmail.com">skillswye@gmail.com</a>
              </li>
              <li>
                <span className="mono about__contact-tag">LinkedIn</span>
                <a href="#" target="_blank" rel="noopener">[your-linkedin]</a>
              </li>
              <li>
                <span className="mono about__contact-tag">Location</span>
                <span>Savannah, Georgia · USA</span>
              </li>
            </ul>
          </div>

          <div className="about__card">
            <span className="mono about__card-label">— Skills —</span>
            <ul className="about__tools">
              <li>Unreal Engine 5 (Blueprint)</li>
              <li>Maya</li>
              <li>Twine · Harlowe</li>
              <li>Niagara <span className="about__tool-status">(coming)</span></li>
              <li>C++</li>
              <li>Java</li>
            </ul>
          </div>

          <div className="about__card">
            <span className="mono about__card-label">— Languages —</span>
            <ul className="about__tools">
              <li>English</li>
              <li>Mandarin</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
