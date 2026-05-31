import React from 'react'
import SpellAnatomy from './SpellAnatomy.jsx'
import BossLoop from './BossLoop.jsx'
import PatrolAI from './PatrolAI.jsx'
import WaveSpawner from './WaveSpawner.jsx'
import './ProjectFeature.css'

export default function ProjectFeature({ project, index }) {
  const isEven = index % 2 === 0

  return (
    <section id={project.id} className={`project ${isEven ? 'project--even' : 'project--odd'}`}>
      {/* Section divider */}
      <div className="project__divider">
        <span className="project__divider-line" />
        <span className="project__divider-mark mono">§ {String(index + 2).padStart(2, '0')}</span>
        <span className="project__divider-line" />
      </div>

      {project.poster && (
        <div className="project__poster reveal">
          <img src={project.poster} alt={`${project.title} poster`} />
          <div className="project__poster-overlay" />
        </div>
      )}

      {/* Header — large project number + title */}
      <header className="project__header reveal">
        <div className="project__title-wrap">
          <span className="eyebrow">{project.subtitle}</span>
          <h2 className="project__title display">{project.title}</h2>
          <p className="project__tagline">"{project.tagline}"</p>
        </div>
      </header>

      {/* Meta strip */}
      <div className="project__meta reveal">
        <div className="project__meta-item">
          <span className="mono project__meta-label">Year</span>
          <span className="project__meta-value">{project.year}</span>
        </div>
        <div className="project__meta-item">
          <span className="mono project__meta-label">Engine</span>
          <span className="project__meta-value">{project.engine}</span>
        </div>
        <div className="project__meta-item">
          <span className="mono project__meta-label">Role</span>
          <span className="project__meta-value">{project.role}</span>
        </div>
      </div>

      {/* Logline */}
      <div className="project__logline-wrap reveal">
        <p className="project__logline">{project.logline}</p>
      </div>

      {project.trailerYoutubeId && (
        <div className="project__trailer reveal">
          <div className="project__trailer-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${project.trailerYoutubeId}?rel=0&modestbranding=1`}
              title={`${project.title} trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="project__trailer-caption mono">
            ▸ Trailer · {project.title}
          </p>
        </div>
      )}

      {project.showSpellAnatomy && <SpellAnatomy />}
      {project.showBossLoop && <BossLoop />}
      {project.showPatrolAI && <PatrolAI />}
      {project.showWaveSpawner && <WaveSpawner />}

      {project.media && project.media.length > 0 && (
      <div className="project__gallery reveal">
        {project.media.map((m, i) => (
          <figure
            key={i}
            className={`project__media project__media--${i} ${
              m.type === 'paired' ? 'project__media--paired' : ''
            }`}
          >
            {m.type === 'paired' ? (
              <div className="project__paired">
                <div className="project__paired-half project__paired-half--data">
                  <img src={m.dataSrc} alt={m.dataAlt || 'design data'} />
                  <span className="mono project__paired-label">
                    {m.dataLabel}
                  </span>
                </div>
                <div className="project__paired-divider">
                  <svg className="project__paired-arrow" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12 L40 12 M30 4 L42 12 L30 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="project__paired-half project__paired-half--runtime">
                  <img src={m.runtimeSrc} alt={m.runtimeAlt || 'runtime result'} />
                  <span className="mono project__paired-label">
                    {m.runtimeLabel}
                  </span>
                </div>
              </div>
            ) : m.type === 'image' ? (
              <div className="project__image-wrap">
                <img src={m.src} alt={m.alt || m.caption} />
              </div>
            ) : (
              <div className="project__placeholder">
                <div className="project__placeholder-grid">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <span key={idx} />
                  ))}
                </div>
                <span className="project__placeholder-label mono">
                  [ {m.caption} ]
                </span>
              </div>
            )}
            <figcaption className="project__media-caption mono">
              FIG. {String(i + 4).padStart(2, '0')} · {m.caption}
              {m.note && <span className="project__media-note"> — {m.note}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      )}

      {/* Systems breakdown — the meat of the case study */}
      <div className="project__systems reveal">
        <h3 className="project__systems-title">
          <span className="eyebrow">Systems &amp; Decisions</span>
          <span className="project__systems-heading display">What I built.</span>
        </h3>
        <ul className="project__systems-list">
          {project.systems.map((s, i) => (
            <li key={i} className="project__system">
              <span className="project__system-num mono">{String(i + 1).padStart(2, '0')}</span>
              <div className="project__system-content">
                <h4 className="project__system-label">{s.label}</h4>
                <p className="project__system-detail">{s.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </section>
  )
}
