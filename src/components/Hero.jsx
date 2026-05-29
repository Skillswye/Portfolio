import React, { useEffect, useRef } from 'react'
import './Hero.css'

export default function Hero() {
  const canvasRef = useRef(null)

  // Drifting particle field — atmospheric, subtle
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.01
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        const pulseOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 137, 63, ${pulseOpacity})`
        ctx.fill()
      })
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section id="top" className="hero">
      <canvas ref={canvasRef} className="hero__canvas" />

      {/* Atmospheric layers */}
      <div className="hero__vignette" />
      <div className="hero__gradient" />

      {/* Decorative geometry */}
      <svg className="hero__rune" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
        <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
        <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
        <circle cx="100" cy="100" r="2" fill="currentColor" opacity="0.8" />
      </svg>

      <div className="hero__content">
        <div className="hero__meta">
          <span className="mono">Portfolio · 2026</span>
          <span className="hero__divider">/</span>
          <span className="mono">Savannah, GA</span>
        </div>

        <h1 className="hero__name display">
          <span className="hero__name-line">Jason</span>
          <span className="hero__name-line hero__name-line--alt">Zhao</span>
        </h1>

        <div className="hero__tagline">
          <span className="hero__tagline-mark">—</span>
          <p>
            Level &amp; systems designer building spaces<br />
            that remember the people who pass through them.
          </p>
        </div>

        <div className="hero__cta">
          <a href="#runic-vanguard" className="hero__cta-link">
            <span>Enter the work</span>
            <svg width="32" height="8" viewBox="0 0 32 8" fill="none">
              <path d="M0 4 L28 4 M24 1 L28 4 L24 7" stroke="currentColor" strokeWidth="1" />
            </svg>
          </a>
        </div>
      </div>

      <div className="hero__scroll-hint">
        <span className="mono">Scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  )
}
