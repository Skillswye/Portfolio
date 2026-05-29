import React, { useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Philosophy from './components/Philosophy.jsx'
import ProjectFeature from './components/ProjectFeature.jsx'
import InDevelopment from './components/InDevelopment.jsx'
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
      id: 'project-two',
      number: '02',
      title: 'Arena Boss Fight',
      subtitle: 'Combat Encounter Design',
      year: '2025',
      engine: 'Unreal Engine 5',
      role: 'Designer & Developer',
      tagline: '[Tagline goes here]',
      logline:
        '[Replace with your project description. A dark-fantasy arena built around a single knight and a single adversary — every system in service of one fight.]',
      systems: [
        { label: 'Combat Loop', detail: '[Describe core mechanic]' },
        { label: 'UI Systems', detail: '[Health, respawn, feedback]' },
        { label: 'Encounter Pacing', detail: '[Phases, tells, recovery]' },
        { label: 'Arena Design', detail: '[Spatial choices, sightlines]' },
      ],
      media: [
        { type: 'placeholder', caption: 'Boss arena' },
        { type: 'placeholder', caption: 'Combat moment' },
        { type: 'placeholder', caption: 'UI state' },
      ],
    },
    {
      id: 'project-three',
      number: '03',
      title: 'Fracture Point',
      subtitle: 'Analog Escape Room / Ludological Study',
      year: '2026',
      engine: 'Physical Space · GAME714',
      role: 'Designer & Researcher',
      tagline: 'The room remembers what you forgot.',
      logline:
        'A memory-themed escape room with Seeker/Mastermind asymmetric roles, Morse code puzzles, and an open ending. Designed as both a playable artifact and a ludological case study through the lenses of the Magic Circle, Emergent Play, and Ergodic Theory.',
      systems: [
        { label: 'Role Asymmetry', detail: 'Seeker / Mastermind · information asymmetry as core tension' },
        { label: 'Puzzle Layering', detail: 'Morse code · spatial cipher · memory reconstruction' },
        { label: 'Theoretical Frame', detail: 'Magic Circle · Emergent Play · Ergodic Theory analysis' },
        { label: 'Spatial Authoring', detail: 'Real-space staging in Montgomery Hall · diegetic props' },
      ],
      media: [
        { type: 'placeholder', caption: 'Room layout' },
        { type: 'placeholder', caption: 'Puzzle artifact' },
        { type: 'placeholder', caption: 'Playtest moment' },
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
      <InDevelopment />
      <About />
      <Footer />
    </>
  )
}
