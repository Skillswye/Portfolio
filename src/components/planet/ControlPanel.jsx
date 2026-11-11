import React, { useId } from 'react'
import { SLIDERS, TOGGLES, formatValue } from './params.js'

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="pg-panel__chev">
      <path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function DiceIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="11" height="11" stroke="currentColor" />
      <circle cx="3.5" cy="3.5" r="0.9" fill="currentColor" />
      <circle cx="6" cy="6" r="0.9" fill="currentColor" />
      <circle cx="8.5" cy="8.5" r="0.9" fill="currentColor" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1 V8 M3 5 L6 8 L9 5 M1 11 H11" stroke="currentColor" />
    </svg>
  )
}

export default function ControlPanel({
  params,
  onChange,
  onRandomize,
  onExport,
  exporting,
  canExport,
  stats,
  open,
  onToggleOpen,
}) {
  const uid = useId()
  const bodyId = `${uid}-body`

  return (
    <aside className={`pg-panel ${open ? 'pg-panel--open' : ''}`} aria-label="Planet generator controls">
      <div className="pg-panel__head">
        <span className="pg-panel__title mono">Parameters</span>
        <button
          type="button"
          className="pg-panel__toggle mono"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggleOpen}
        >
          {open ? 'Hide' : 'Show'}
          <Chevron />
        </button>
      </div>

      <div id={bodyId} className="pg-panel__body" hidden={!open}>
        <div className="pg-seed">
          <div className="pg-seed__readout">
            <span className="pg-label__en mono">Seed</span>
            <output className="pg-seed__value mono" aria-live="polite">{params.seed}</output>
          </div>
          <button type="button" className="pg-btn mono" onClick={onRandomize}>
            <DiceIcon />
            Randomize
          </button>
        </div>

        <div className="pg-sliders">
          {SLIDERS.map((s) => {
            const id = `${uid}-${s.key}`
            const value = params[s.key]
            const text = formatValue(s, value)
            return (
              <div className="pg-field" key={s.key}>
                <label htmlFor={id} className="pg-label">
                  {s.label}
                </label>
                <output htmlFor={id} className="pg-field__value mono">{text}</output>
                <input
                  id={id}
                  type="range"
                  className="pg-range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={value}
                  aria-valuetext={text}
                  onChange={(e) => onChange(s.key, parseFloat(e.target.value))}
                />
              </div>
            )
          })}
        </div>

        <fieldset className="pg-toggles">
          <legend className="pg-label__en mono">Layers</legend>
          {TOGGLES.map((t) => (
            <label className="pg-check" key={t.key}>
              <input
                type="checkbox"
                checked={params[t.key]}
                onChange={(e) => onChange(t.key, e.target.checked)}
              />
              <span className="pg-label">{t.label}</span>
            </label>
          ))}
        </fieldset>

        <button
          type="button"
          className="pg-btn pg-btn--wide mono"
          onClick={onExport}
          disabled={!canExport || exporting}
        >
          <DownloadIcon />
          {exporting ? 'Exporting…' : 'Export .OBJ'}
        </button>

        <p className="pg-note">
          Land = 100% − Ocean. Mountains, hills, lakes, forest and desert are shares of land area.
        </p>

        {stats && (
          <p className="pg-stats mono">
            {stats.verts.toLocaleString('en-US')} verts ·{' '}
            {stats.refining ? 'refining…' : `built in ${Math.round(stats.ms)} ms`}
          </p>
        )}
      </div>
    </aside>
  )
}
