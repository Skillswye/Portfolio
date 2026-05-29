import React from 'react'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__line" />

        <div className="footer__grid">
          <div className="footer__col">
            <span className="mono footer__label">— Index —</span>
            <p className="footer__quote">
              "The architecture itself remembers."
            </p>
          </div>

          <div className="footer__col footer__col--center">
            <a href="#top" className="footer__top">
              <span className="mono">Return to top</span>
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                <path d="M6 0 L6 18 M1 5 L6 0 L11 5" stroke="currentColor" strokeWidth="1" />
              </svg>
            </a>
          </div>

          <div className="footer__col footer__col--right">
            <span className="mono footer__label">— Colophon —</span>
            <p className="footer__colophon">
              Designed &amp; built by Jason Zhao · {year}<br />
              Cormorant Garamond, JetBrains Mono, Inter Tight
            </p>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="mono">© {year} Jason Zhao</span>
          <span className="footer__signal">●</span>
          <span className="mono">All work shown is property of its creator</span>
        </div>
      </div>
    </footer>
  )
}
