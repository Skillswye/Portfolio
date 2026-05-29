import React, { useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Philosophy from './components/Philosophy.jsx'
import ProjectFeature from './components/ProjectFeature.jsx'
import About from './components/About.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  // Intersection observer for scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // ============================================
  // PROJECT DATA — Edit this to add/change projects
  // ============================================
  const featuredProjects = [
    {
      id: 'runic-vanguard',
      number: '01',
      title: 'Runic Vanguard',
      subtitle: 'Asymmetric Co-op / Spell-Gesture System',
      year: '2026',
      engine: 'Unreal Engine 5 · Blueprint',
      role: 'Designer & Developer',
      tagline: 'A vow rendered as mechanics.',
      poster: '/runic-vanguard-poster.jpg',
      trailerYoutubeId: 'gDNCiYdKa0c',
      logline:
        'Two players bound by an ancient pact — one wields the blade, the other draws magic from forbidden geometry. A spell-gesture system built on a 3×3 grid where every line is intention made manifest.',
      systems: [
        { label: 'Spell Gesture Grid', detail: '3×3 dot matrix · OnPaint line rendering · DataTable pattern matching' },
        { label: 'Gameplay Ability System', detail: 'GAS integration · rune charge resource gate · elemental binding' },
        { label: 'Encounter Design', detail: 'Wave spawn director · patrol/chase AI · Blueprint Interface tagging' },
        { label: 'Spatial Systems', detail: 'Checkpoint respawn · ragdoll death · camera occlusion transparency · enemy-tagged doors' },
      ],
      // Replace these with real screenshots/GIFs later
      media: [
        { type: 'placeholder', caption: 'Spell grid in action' },
        { type: 'placeholder', caption: 'Encounter design' },
        { type: 'placeholder', caption: 'Co-op moment' },
      ],
    },
    {
      id: 'systems-design',
      number: '02',
      title: 'Systems Design Project',
      subtitle: 'Coursework · In Development',
      year: 'Spring 2027',
      engine: 'TBD',
      role: 'Designer & Developer',
      tagline: '[Tagline coming soon]',
      logline:
        '[Reserved for an upcoming systems design project. This space will document the mechanics, economies, and feedback loops authored during the Spring 2027 systems design coursework.]',
      systems: [
        { label: 'Core Mechanic', detail: '[To be documented]' },
        { label: 'Economy / Resource Loop', detail: '[To be documented]' },
        { label: 'Feedback Systems', detail: '[To be documented]' },
        { label: 'Design Rationale', detail: '[To be documented]' },
      ],
      media: [
        { type: 'placeholder', caption: 'Coming Spring 2027' },
        { type: 'placeholder', caption: 'Coming Spring 2027' },
        { type: 'placeholder', caption: 'Coming Spring 2027' },
      ],
    },
    {
      id: 'niagara-vfx',
      number: '03',
      title: 'Niagara VFX Project',
      subtitle: 'Coursework · In Development',
      year: 'Spring 2027',
      engine: 'Unreal Engine 5 · Niagara',
      role: 'VFX & Technical Designer',
      tagline: '[Tagline coming soon]',
      logline:
        '[Reserved for an upcoming Niagara visual effects project. This space will document particle systems, environmental atmosphere, and combat or spell-rendering work authored during the Spring 2027 VFX coursework.]',
      systems: [
        { label: 'Particle Systems', detail: '[To be documented]' },
        { label: 'Visual Language', detail: '[To be documented]' },
        { label: 'Technical Pipeline', detail: '[To be documented]' },
        { label: 'Integration', detail: '[To be documented]' },
      ],
      media: [
        { type: 'placeholder', caption: 'Coming Spring 2027' },
        { type: 'placeholder', caption: 'Coming Spring 2027' },
        { type: 'placeholder', caption: 'Coming Spring 2027' },
      ],
    },
  ]

  return (
    <>
      <Nav />
      <Hero />
      <Philosophy />
      {featuredProjects.map((project, i) => (
        <ProjectFeature key={project.id} project={project} index={i} />
      ))}
      <About />
      <Footer />
    </>
  )
}
