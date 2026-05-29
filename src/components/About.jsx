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
            Jason Zhao
            <span className="about__name-alt">— 赵子叶</span>
          </h2>

          <div className="about__bio">
            <p>
              I am a Game Science &amp; Design student in Savannah, USA — building toward
              a career as a <strong>level designer</strong> in worlds that earn their atmosphere.
            </p>
            <p>
              My background sits across disciplines: I read art theory (Chiharu Shiota,
              Donald Judd, Linda Nochlin), study nutrition and physics for fun, and design
              original IPs with an eye toward long-form storytelling. Hideo Kojima is my
              favorite designer — not for the spectacle, but for the spaces between scenes.
            </p>
            <p>
              When I'm not building in Unreal, I'm probably with my Ragdoll cat, <em>Oreo</em>,
              who has very strong opinions about my chair.
            </p>
          </div>
        </div>

        <aside className="about__col-right reveal">
          <div className="about__card">
            <span className="mono about__card-label">— Contact —</span>
            <ul className="about__contact">
              <li>
                <span className="mono about__contact-tag">Email</span>
                <a href="mailto:[your-email]">[your-email@example.com]</a>
              </li>
              <li>
                <span className="mono about__contact-tag">GitHub</span>
                <a href="https://github.com/[your-username]" target="_blank" rel="noopener">
                  github.com/[your-username]
                </a>
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
            <span className="mono about__card-label">— Tools —</span>
            <ul className="about__tools">
              <li>Unreal Engine 5 (Blueprint)</li>
              <li>Gameplay Ability System</li>
              <li>Twine · Harlowe</li>
              <li>Niagara <span className="about__tool-status">(coming)</span></li>
              <li>Blender · 3D modeling</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
