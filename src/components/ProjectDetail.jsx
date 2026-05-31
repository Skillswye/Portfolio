import React, { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { featuredProjects } from '../data/projects.js'
import ProjectFeature from './ProjectFeature.jsx'
import './ProjectDetail.css'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  // Find the project by URL id
  const projectIndex = featuredProjects.findIndex((p) => p.id === projectId)
  const project = featuredProjects[projectIndex]

  // Scroll to top when project changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [projectId])

  // Scroll reveal observer
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
  }, [projectId])

  // Project not found — show a graceful fallback
  if (!project) {
    return (
      <main className="detail detail--notfound">
        <h1 className="display">Project not found.</h1>
        <Link to="/work" className="detail__back-link mono">
          ← Back to all work
        </Link>
      </main>
    )
  }

  // Determine prev/next for navigation
  const prevProject = featuredProjects[projectIndex - 1]
  const nextProject = featuredProjects[projectIndex + 1]

  return (
    <main className="detail">
      {/* Back link */}
      <div className="detail__top">
        <Link to="/work" className="detail__back mono">
          <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
            <path d="M24 4 L4 4 M8 1 L4 4 L8 7" stroke="currentColor" strokeWidth="1" />
          </svg>
          All work
        </Link>
      </div>

      {/* Reuse the existing ProjectFeature component */}
      <ProjectFeature project={project} index={projectIndex} />

      {/* Prev / Next navigation */}
      <nav className="detail__pager">
        {prevProject ? (
          <button
            className="detail__pager-link detail__pager-link--prev"
            onClick={() => navigate(`/work/${prevProject.id}`)}
          >
            <span className="mono detail__pager-dir">← Previous</span>
            <span className="detail__pager-name display">{prevProject.title}</span>
          </button>
        ) : (
          <span />
        )}
        {nextProject ? (
          <button
            className="detail__pager-link detail__pager-link--next"
            onClick={() => navigate(`/work/${nextProject.id}`)}
          >
            <span className="mono detail__pager-dir">Next →</span>
            <span className="detail__pager-name display">{nextProject.title}</span>
          </button>
        ) : (
          <span />
        )}
      </nav>
    </main>
  )
}