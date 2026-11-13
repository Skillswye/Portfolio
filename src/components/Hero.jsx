import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { createOrrery } from './hero/orrery.js'
import './Hero.css'

export default function Hero() {
  const canvasRef = useRef(null)

  // The solar-system chart is plain canvas code — see hero/orrery.js.
  useEffect(() => createOrrery(canvasRef.current), [])

  return (
    <section id="top" className="hero">
      <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />

      <div className="hero__vignette" />
      <div className="hero__gradient" />

      <div className="hero__content">
        <h1 className="hero__name display">
          <span className="hero__name-line">Ziye</span>
          <span className="hero__name-line hero__name-line--alt">Zhao</span>
        </h1>

        <div className="hero__tagline">
          <span className="hero__tagline-mark">—</span>
          <p>
            Systems designer building spaces<br />
            that remember the people who pass through them.
          </p>
        </div>

        <div className="hero__cta">
          <Link to="/work" className="hero__cta-link">
            <span>Enter the work</span>
            <svg width="32" height="8" viewBox="0 0 32 8" fill="none">
              <path d="M0 4 L28 4 M24 1 L28 4 L24 7" stroke="currentColor" strokeWidth="1" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
