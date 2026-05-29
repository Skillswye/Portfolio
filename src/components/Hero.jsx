import React, { useEffect, useRef, useState } from 'react'
import './Hero.css'

export default function Hero() {
  const canvasRef = useRef(null)
  const [hoveredBody, setHoveredBody] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let mouse = { x: -1000, y: -1000, active: false }
    let bursts = []
    let solarBoost = 0 // sun double-click effect
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ----- Background particles (deep space dust) -----
    const particles = Array.from({ length: 110 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      r: Math.random() * 1.4 + 0.2,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }))

    // ----- Solar system definition -----
    // Distances and periods scaled for visual rhythm, ratios approximate Kepler's third law
    // baseRadius is the orbital radius in "design units"; actual pixel radius computed at render time
    const planets = [
      {
        name: 'Mercury',
        label: 'Mercury · 0.24y',
        baseRadius: 0.07,
        size: 3.5,
        hue: 30,
        sat: 15,
        lit: 55,
        period: 0.24,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: 0.02,
        rotation: 0,
        moons: [],
      },
      {
        name: 'Venus',
        label: 'Venus · 0.62y',
        baseRadius: 0.105,
        size: 5.5,
        hue: 38,
        sat: 50,
        lit: 65,
        period: 0.62,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: 0.005,
        rotation: 0,
        moons: [],
      },
      {
        name: 'Earth',
        label: 'Earth · 1.00y',
        baseRadius: 0.145,
        size: 6,
        hue: 200,
        sat: 35,
        lit: 50,
        period: 1.0,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: 0.03,
        rotation: 0,
        moons: [
          {
            name: 'Moon',
            baseRadius: 0.022,
            size: 1.8,
            hue: 30,
            sat: 5,
            lit: 70,
            period: 0.08,
            angle: Math.random() * Math.PI * 2,
          },
        ],
      },
      {
        name: 'Mars',
        label: 'Mars · 1.88y',
        baseRadius: 0.195,
        size: 4.5,
        hue: 12,
        sat: 60,
        lit: 50,
        period: 1.88,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: 0.028,
        rotation: 0,
        moons: [],
      },
      {
        name: 'Jupiter',
        label: 'Jupiter · 11.86y',
        baseRadius: 0.29,
        size: 13,
        hue: 32,
        sat: 50,
        lit: 55,
        period: 5.5, // visually compressed
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: 0.06,
        rotation: 0,
        bands: true,
        moons: [],
      },
      {
        name: 'Saturn',
        label: 'Saturn · 29.5y · ringed',
        baseRadius: 0.385,
        size: 11,
        hue: 38,
        sat: 45,
        lit: 65,
        period: 9,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: 0.05,
        rotation: 0,
        rings: true,
        moons: [],
      },
    ]

    // Center of solar system — top right area of hero
    let sunCx, sunCy, scale
    const computeLayout = () => {
      sunCx = canvas.width * 0.72
      sunCy = canvas.height * 0.5
      scale = Math.min(canvas.width, canvas.height) * 0.95
    }
    computeLayout()
    window.addEventListener('resize', computeLayout)

    // ----- Mouse handling -----
    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
      setMousePos({ x: e.clientX, y: e.clientY })

      // Check hover
      let found = null
      // Check sun first
      const dxS = e.clientX - sunCx
      const dyS = e.clientY - sunCy
      if (Math.sqrt(dxS * dxS + dyS * dyS) < 22) {
        found = { name: 'Sol', label: 'Sol · center of system' }
      } else {
        for (const p of planets) {
          const r = p.baseRadius * scale
          const px = sunCx + Math.cos(p.angle) * r
          const py = sunCy + Math.sin(p.angle) * r * 0.55 // squashed for 3D feel
          const dx = e.clientX - px
          const dy = e.clientY - py
          if (Math.sqrt(dx * dx + dy * dy) < p.size + 4) {
            found = { name: p.name, label: p.label }
            break
          }
        }
      }
      setHoveredBody(found)
    }
    const onLeave = () => {
      mouse.active = false
      mouse.x = -1000
      mouse.y = -1000
      setHoveredBody(null)
    }
    const onDblClick = (e) => {
      // Check sun first
      const dxS = e.clientX - sunCx
      const dyS = e.clientY - sunCy
      if (Math.sqrt(dxS * dxS + dyS * dyS) < 22) {
        // Sun easter egg: solar flare + boost
        bursts.push({ x: sunCx, y: sunCy, age: 0, max: 90, big: true })
        solarBoost = 1.0
        return
      }

      for (const p of planets) {
        const r = p.baseRadius * scale
        const px = sunCx + Math.cos(p.angle) * r
        const py = sunCy + Math.sin(p.angle) * r * 0.55
        const dx = e.clientX - px
        const dy = e.clientY - py
        if (Math.sqrt(dx * dx + dy * dy) < p.size + 8) {
          bursts.push({ x: px, y: py, age: 0, max: 60, big: false })
          // Push particles
          particles.forEach((part) => {
            const pdx = part.x - px
            const pdy = part.y - py
            const d = Math.sqrt(pdx * pdx + pdy * pdy)
            if (d < 200 && d > 0) {
              const force = ((200 - d) / 200) * 6
              part.vx += (pdx / d) * force
              part.vy += (pdy / d) * force
            }
          })
          return
        }
      }
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('dblclick', onDblClick)

    const drawOrbit = (radius) => {
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(sunCx, sunCy, radius, radius * 0.55, 0, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(201, 137, 63, 0.1)'
      ctx.lineWidth = 0.7
      ctx.setLineDash([3, 5])
      ctx.stroke()
      ctx.restore()
    }

    const drawPlanet = (x, y, planet) => {
      const { size, hue, sat, lit, rotation, bands } = planet

      // Outer atmosphere glow
      const glowSize = size * 2.2
      const glow = ctx.createRadialGradient(x, y, size * 0.8, x, y, glowSize)
      glow.addColorStop(0, `hsla(${hue}, ${sat}%, ${lit}%, 0.25)`)
      glow.addColorStop(1, `hsla(${hue}, ${sat}%, ${lit}%, 0)`)
      ctx.beginPath()
      ctx.arc(x, y, glowSize, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // Planet body with light-from-sun shading
      const angleToSun = Math.atan2(sunCy - y, sunCx - x)
      const lightX = x + Math.cos(angleToSun) * size * 0.5
      const lightY = y + Math.sin(angleToSun) * size * 0.5

      const bodyGrad = ctx.createRadialGradient(lightX, lightY, 0, x, y, size * 1.15)
      bodyGrad.addColorStop(0, `hsla(${hue}, ${sat}%, ${Math.min(lit + 20, 90)}%, 1)`)
      bodyGrad.addColorStop(0.5, `hsla(${hue}, ${sat}%, ${lit}%, 1)`)
      bodyGrad.addColorStop(1, `hsla(${hue}, ${sat + 10}%, ${Math.max(lit - 35, 8)}%, 1)`)

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = bodyGrad
      ctx.fill()

      // Surface bands (Jupiter)
      if (bands) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.clip()
        for (let i = -3; i <= 3; i++) {
          const yOff = i * (size / 3.5)
          const bandHue = hue + (i % 2 === 0 ? -8 : 8)
          const bandLit = lit + (i % 2 === 0 ? -10 : 8)
          ctx.beginPath()
          ctx.ellipse(x + Math.sin(rotation + i) * 1, y + yOff, size, size / 7, 0, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${bandHue}, ${sat}%, ${bandLit}%, 0.55)`
          ctx.fill()
        }
        ctx.restore()
      }

      // Subtle surface noise
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.clip()
      for (let i = 0; i < 3; i++) {
        const sx = x + Math.cos(rotation + i * 2.1) * size * 0.4
        const sy = y + Math.sin(rotation + i * 2.1) * size * 0.4
        ctx.beginPath()
        ctx.arc(sx, sy, size * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit - 10}%, 0.25)`
        ctx.fill()
      }
      ctx.restore()

      // Rim light
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${hue}, 80%, 75%, 0.3)`
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    const drawSaturnRings = (x, y, planetSize) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-0.35)
      // Back half of ring (behind planet)
      ctx.beginPath()
      ctx.ellipse(0, 0, planetSize * 2.2, planetSize * 0.55, 0, Math.PI, Math.PI * 2)
      ctx.strokeStyle = 'rgba(220, 190, 140, 0.45)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(0, 0, planetSize * 1.75, planetSize * 0.44, 0, Math.PI, Math.PI * 2)
      ctx.strokeStyle = 'rgba(220, 190, 140, 0.25)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
    }

    const drawSaturnRingsFront = (x, y, planetSize) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-0.35)
      // Front half of ring (in front of planet)
      ctx.beginPath()
      ctx.ellipse(0, 0, planetSize * 2.2, planetSize * 0.55, 0, 0, Math.PI)
      ctx.strokeStyle = 'rgba(220, 190, 140, 0.55)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(0, 0, planetSize * 1.75, planetSize * 0.44, 0, 0, Math.PI)
      ctx.strokeStyle = 'rgba(220, 190, 140, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
    }

    const animate = () => {
      time += 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ----- Background particles -----
      particles.forEach((p) => {
        if (mouse.active) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 100 && d > 0) {
            const force = ((100 - d) / 100) * 0.06
            p.vx += (dx / d) * force
            p.vy += (dy / d) * force
          }
        }
        p.vx *= 0.97
        p.vy *= 0.97
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed < 0.04) {
          p.vx += (Math.random() - 0.5) * 0.02
          p.vy += (Math.random() - 0.5) * 0.02
        }
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.01
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        const op = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 137, 63, ${op})`
        ctx.fill()
      })

      // ----- Solar boost decay -----
      solarBoost *= 0.96

      // ----- Draw orbit lines (very subtle) -----
      planets.forEach((p) => {
        drawOrbit(p.baseRadius * scale)
      })

      // ----- Draw Sun -----
      const sunPulse = Math.sin(time * 0.02) * 2
      const sunR = 16 + sunPulse
      // Outer corona
      const corona = ctx.createRadialGradient(sunCx, sunCy, sunR, sunCx, sunCy, sunR * 4)
      corona.addColorStop(0, 'rgba(255, 200, 110, 0.5)')
      corona.addColorStop(0.4, 'rgba(230, 160, 70, 0.15)')
      corona.addColorStop(1, 'rgba(230, 160, 70, 0)')
      ctx.beginPath()
      ctx.arc(sunCx, sunCy, sunR * 4, 0, Math.PI * 2)
      ctx.fillStyle = corona
      ctx.fill()
      // Sun body
      const sunGrad = ctx.createRadialGradient(sunCx, sunCy, 0, sunCx, sunCy, sunR)
      sunGrad.addColorStop(0, 'rgba(255, 240, 200, 1)')
      sunGrad.addColorStop(0.6, 'rgba(240, 180, 90, 1)')
      sunGrad.addColorStop(1, 'rgba(200, 120, 50, 1)')
      ctx.beginPath()
      ctx.arc(sunCx, sunCy, sunR, 0, Math.PI * 2)
      ctx.fillStyle = sunGrad
      ctx.fill()

      // ----- Update + draw planets -----
      const speedMultiplier = 1 + solarBoost * 4

      // Sort by y to handle depth (back planets drawn first when behind sun)
      const planetData = planets.map((p) => {
        p.angle += (0.003 / p.period) * speedMultiplier
        p.rotation += p.rotationSpeed * speedMultiplier
        const r = p.baseRadius * scale
        return {
          planet: p,
          x: sunCx + Math.cos(p.angle) * r,
          y: sunCy + Math.sin(p.angle) * r * 0.55,
          isBehindSun: Math.sin(p.angle) < 0,
        }
      })

      planetData.forEach(({ planet, x, y }) => {
        // Saturn rings (back half) before planet body
        if (planet.rings) {
          drawSaturnRings(x, y, planet.size)
        }
        drawPlanet(x, y, planet)
        if (planet.rings) {
          drawSaturnRingsFront(x, y, planet.size)
        }

        // Moons
        if (planet.moons && planet.moons.length > 0) {
          planet.moons.forEach((moon) => {
            moon.angle += (0.01 / moon.period) * speedMultiplier
            const mr = moon.baseRadius * scale
            const mx = x + Math.cos(moon.angle) * mr
            const my = y + Math.sin(moon.angle) * mr * 0.55
            const mGlow = ctx.createRadialGradient(mx, my, 0, mx, my, moon.size * 2)
            mGlow.addColorStop(0, `hsla(${moon.hue}, ${moon.sat}%, ${moon.lit}%, 0.4)`)
            mGlow.addColorStop(1, `hsla(${moon.hue}, ${moon.sat}%, ${moon.lit}%, 0)`)
            ctx.beginPath()
            ctx.arc(mx, my, moon.size * 2, 0, Math.PI * 2)
            ctx.fillStyle = mGlow
            ctx.fill()
            ctx.beginPath()
            ctx.arc(mx, my, moon.size, 0, Math.PI * 2)
            ctx.fillStyle = `hsla(${moon.hue}, ${moon.sat}%, ${moon.lit}%, 1)`
            ctx.fill()
          })
        }
      })

      // ----- Burst ripples -----
      bursts = bursts.filter((burst) => {
        burst.age += 1
        const progress = burst.age / burst.max
        if (progress >= 1) return false
        const maxRadius = burst.big ? 350 : 180
        const radius = progress * maxRadius
        const opacity = (1 - progress) * (burst.big ? 0.7 : 0.5)
        ctx.beginPath()
        ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 200, 100, ${opacity})`
        ctx.lineWidth = 1.5 * (1 - progress) + 0.3
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(burst.x, burst.y, radius * 0.6, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 200, 100, ${opacity * 0.5})`
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
      window.removeEventListener('resize', computeLayout)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('dblclick', onDblClick)
    }
  }, [])

  return (
    <section id="top" className="hero">
      <canvas ref={canvasRef} className="hero__canvas" />

      <div className="hero__vignette" />
      <div className="hero__gradient" />

      {hoveredBody && (
        <div
          className="hero__body-label"
          style={{
            left: mousePos.x + 16,
            top: mousePos.y - 8,
          }}
        >
          <span className="mono">{hoveredBody.label}</span>
        </div>
      )}

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