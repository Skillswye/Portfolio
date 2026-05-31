import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { featuredProjects } from '../data/projects.js'
import './Nav.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [workOpen, setWorkOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll current page to top (does not change route)
  const scrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <button onClick={scrollToTop} className="nav__mark">
          <span className="nav__mark-glyph">▲</span>
          <span className="nav__mark-text">JZ</span>
        </button>
        <ul className="nav__links">
          <li><Link to="/">Home</Link></li>
          <li
            className="nav__work"
            onMouseEnter={() => setWorkOpen(true)}
            onMouseLeave={() => setWorkOpen(false)}
          >
            <Link to="/work">Work</Link>
            <div className={`nav__dropdown ${workOpen ? 'nav__dropdown--open' : ''}`}>
              <div className="nav__dropdown-inner">
                {featuredProjects.map((p) => (
                  <Link key={p.id} to={`/work/${p.id}`} className="nav__dropdown-item">
                    <span className="nav__dropdown-label">{p.title}</span>
                    <span className="nav__dropdown-meta mono">{p.subtitle}</span>
                  </Link>
                ))}
              </div>
            </div>
          </li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </div>
    </nav>
  )
}