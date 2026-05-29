import React, { useEffect, useRef } from 'react'
import './Hero.css'

export default function Hero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let mouse = { x: -1000, y: -1000, active: false }
    let draggedBody = null
    let bursts = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ----- Background particles (atmosphere) -----
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }))

    // ----- Celestial bodies (4 interactive "planets") -----
    // Placed roughly in the right-center area where the rune sigil used to be
    const initPositions = () => {
      const cx = canvas.width * 0.72
      const cy = canvas.height * 0.5
      const spread = Math.min(canvas.width, canvas.height) * 0.18
      return [
        { ax: cx - spread * 0.6, ay: cy - spread * 0.7, r: 14, hue: 32 },
        { ax: cx + spread * 0.8, ay: cy - spread * 0.2, r: 9, hue: 28 },
        { ax: cx - spread * 0.2, ay: cy + spread * 0.6, r: 11, hue: 36 },
        { ax: cx + spread * 0.5, ay: cy + spread * 0.8, r: 7, hue: 30 },
      ]
    }

    let bodies = initPositions().map((p) => ({
      x: p.ax,
      y: p.ay,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      ax: p.ax,
      ay: p.ay,
      r: p.r,
      hue: p.hue,
      pulse: Math.random() * Math.PI * 2,
    }))

    window.addEventListener('resize', () => {
      const fresh = initPositions()
      bodies.forEach((b, i) => {
        b.ax = fresh[i].ax
        b.ay = fresh[i].ay
      })
    })

    // ----- Mouse interaction -----
    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
      if (draggedBody) {
        draggedBody.x = e.clientX
        draggedBody.y = e.clientY
        draggedBody.vx = 0
        draggedBody.vy = 0
      }
    }
    const onLeave = () => {
      mouse.active = false
      mouse.x = -1000
      mouse.y = -1000
    }
    const onDown = (e) => {
      for (const b of bodies) {
        const dx = e.clientX - b.x
        const dy = e.clientY - b.y
        if (Math.sqrt(dx * dx + dy * dy) < b.r + 8) {
          draggedBody = b
          return
        }
      }
    }
    const onUp = () => {
      draggedBody = null
    }
    const onDblClick = (e) => {
      for (const b of bodies) {
        const dx = e.clientX - b.x
        const dy = e.clientY - b.y
        if (Math.sqrt(dx * dx + dy * dy) < b.r + 12) {
          bursts.push({ x: b.x, y: b.y, age: 0, max: 60 })
          // Push particles away
          particles.forEach((p) => {
            const pdx = p.x - b.x
            const pdy = p.y - b.y
            const d = Math.sqrt(pdx * pdx + pdy * pdy)
            if (d < 250 && d > 0) {
              const force = (250 - d) / 250 * 8
              p.vx += (pdx / d) * force
              p.vy += (pdy / d) * force
            }
          })
          return
        }
      }
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    canvas.addEventListener('dblclick', onDblClick)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ----- Update + draw particles -----
      particles.forEach((p) => {
        // Mouse repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120 && d > 0) {
            const force = (120 - d) / 120 * 0.08
            p.vx += (dx / d) * force
            p.vy += (dy / d) * force
          }
        }

        // Friction to settle velocity
        p.vx *= 0.97
        p.vy *= 0.97

        // Idle drift floor
        const minSpeed = 0.05
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed < minSpeed) {
          p.vx += (Math.random() - 0.5) * 0.02
          p.vy += (Math.random() - 0.5) * 0.02
        }

        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.01

        // Wrap
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

      // ----- Update celestial bodies -----
      bodies.forEach((b) => {
        if (b === draggedBody) return

        // Pull toward anchor (spring)
        const dxA = b.ax - b.x
        const dyA = b.ay - b.y
        b.vx += dxA * 0.0008
        b.vy += dyA * 0.0008

        // Mutual gravity (very gentle)
        bodies.forEach((other) => {
          if (other === b) return
          const dx = other.x - b.x
          const dy = other.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 20 && dist < 300) {
            const force = 0.015 / dist
            b.vx += (dx / dist) * force * other.r
            b.vy += (dy / dist) * force * other.r
          }
        })

        // Mouse subtle attraction
        if (mouse.active) {
          const dx = mouse.x - b.x
          const dy = mouse.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 200 && d > 0) {
            const force = (200 - d) / 200 * 0.04
            b.vx += (dx / d) * force
            b.vy += (dy / d) * force
          }
        }

        // Friction
        b.vx *= 0.985
        b.vy *= 0.985

        b.x += b.vx
        b.y += b.vy
        b.pulse += 0.015
      })

      // ----- Draw connections between close bodies -----
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const dx = bodies[j].x - bodies[i].x
          const dy = bodies[j].y - bodies[i].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 220) {
            const opacity = (1 - d / 220) * 0.25
            ctx.beginPath()
            ctx.moveTo(bodies[i].x, bodies[i].y)
            ctx.lineTo(bodies[j].x, bodies[j].y)
            ctx.strokeStyle = `rgba(201, 137, 63, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // ----- Draw celestial bodies -----
      bodies.forEach((b) => {
        const glowSize = b.r * 4 + Math.sin(b.pulse) * 2
        // Outer glow
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, glowSize)
        grad.addColorStop(0, `hsla(${b.hue}, 70%, 60%, 0.6)`)
        grad.addColorStop(0.4, `hsla(${b.hue}, 70%, 50%, 0.15)`)
        grad.addColorStop(1, `hsla(${b.hue}, 70%, 50%, 0)`)
        ctx.beginPath()
        ctx.arc(b.x, b.y, glowSize, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Body core
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        const coreGrad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r)
        coreGrad.addColorStop(0, `hsla(${b.hue}, 80%, 75%, 1)`)
        coreGrad.addColorStop(1, `hsla(${b.hue}, 70%, 35%, 1)`)
        ctx.fillStyle = coreGrad
        ctx.fill()

        // Rim
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${b.hue}, 90%, 80%, 0.4)`
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // ----- Draw burst ripples -----
      bursts = bursts.filter((burst) => {
        burst.age += 1
        const progress = burst.age / burst.max
        if (progress >= 1) return false
        const radius = progress * 200
        const opacity = (1 - progress) * 0.5
        ctx.beginPath()
        ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(230, 165, 90, ${opacity})`
        ctx.lineWidth = 1.5 * (1 - progress) + 0.3
        ctx.stroke()
        // Inner ring
        ctx.beginPath()
        ctx.arc(burst.x, burst.y, radius * 0.6, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(230, 165, 90, ${opacity * 0.5})`
        ctx.lineWidth = 0.5
        ctx.stroke()
        return true
      })

      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('dblclick', onDblClick)
    }
  }, [])

  return (
    <section id="top" className="hero">
      <canvas ref={canvasRef} className="hero__canvas" />

      <div className="hero__vignette" />
      <div className="hero__gradient" />

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
            Systems designer building spaces<br />
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
