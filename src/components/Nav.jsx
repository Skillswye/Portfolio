import React, { useEffect, useState } from 'react'
import './Nav.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <a href="#top" className="nav__mark">
          <span className="nav__mark-glyph">▲</span>
          <span className="nav__mark-text">JZ</span>
        </a>
        <ul className="nav__links">
          <li><a href="#philosophy">Philosophy</a></li>
          <li><a href="#runic-vanguard">Work</a></li>
          <li><a href="#about">About</a></li>
        </ul>
      </div>
    </nav>
  )
}
