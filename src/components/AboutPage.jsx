import React, { useEffect } from 'react'
import Philosophy from './Philosophy.jsx'
import About from './About.jsx'
import './AboutPage.css'

export default function AboutPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
  }, [])

  return (
    <main className="about-page">
      <header className="about-page__header">
        <span className="eyebrow">About</span>
        <h1 className="about-page__title display">
          The person behind the systems.
        </h1>
      </header>

      <Philosophy />
      <About />
    </main>
  )
}