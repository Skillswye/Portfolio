import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { featuredProjects } from '../data/projects.js'
import './WorkIndex.css'

export default function WorkIndex() {
  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view')
        })
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="work">
      <header className="work__header">
        <span className="eyebrow">The Work</span>
        <h1 className="work__title display">
          Systems, drawn out.
        </h1>
        <p className="work__intro">
          A growing collection of game projects — each one a study in how rules
          become experience. Some are complete; others are quietly in progress.
        </p>
      </header>

      <div className="work__grid">
        {featuredProjects.map((project, i) => (
          <Link
            to={`/work/${project.id}`}
            key={project.id}
            className={`work__card reveal ${project.inDevelopment ? 'work__card--dev' : ''}`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            {/* Visual */}
            <div className="work__card-visual">
              {project.poster ? (
                <img src={project.poster} alt={`${project.title} poster`} />
              ) : (
                <div className="work__card-placeholder">
                  <div className="work__card-placeholder-grid">
                    {Array.from({ length: 9 }).map((_, idx) => (
                      <span key={idx} />
                    ))}
                  </div>
                </div>
              )}
              {project.inDevelopment && (
                <div className="work__card-badge">
                  <span className="mono">In Development</span>
                </div>
              )}
              <div className="work__card-overlay" />
            </div>

            {/* Text */}
            <div className="work__card-text">
              <div className="work__card-meta">
                <span className="mono work__card-number">{project.number}</span>
                <span className="mono work__card-year">{project.year}</span>
              </div>
              <h2 className="work__card-title display">{project.title}</h2>
              <span className="mono work__card-subtitle">{project.subtitle}</span>
              <p className="work__card-tagline">"{project.tagline}"</p>
              <span className="work__card-enter mono">
                View project
                <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
                  <path d="M0 4 L20 4 M16 1 L20 4 L16 7" stroke="currentColor" strokeWidth="1" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}