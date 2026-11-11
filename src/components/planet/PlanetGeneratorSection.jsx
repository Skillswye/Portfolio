import React, { Suspense, lazy } from 'react'
import './PlanetGeneratorSection.css'

// three.js + R3F are only fetched when a project page actually shows the
// generator. This wrapper is imported statically and must stay three-free.
const PlanetGenerator = lazy(() => import('./PlanetGenerator.jsx'))

export default function PlanetGeneratorSection() {
  return (
    <section className="pg-section">
      {/* .reveal lives here, not inside the lazy chunk: ProjectDetail's
          IntersectionObserver only sees elements present on first mount. */}
      <header className="pg-section__header reveal">
        <span className="eyebrow">Fig. 01 / Planet Generator · Live Build</span>
        <h3 className="pg-section__title display">A world, from one seed.</h3>
      </header>
      <div className="pg-section__frame reveal">
        <Suspense fallback={<div className="pg-section__placeholder" aria-hidden="true" />}>
          <PlanetGenerator />
        </Suspense>
        <p className="pg-section__caption mono">
          Fig. 01a · Interactive · Every slider rebuilds the world · Export as .OBJ
        </p>
      </div>
    </section>
  )
}
