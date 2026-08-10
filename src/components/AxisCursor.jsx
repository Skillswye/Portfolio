import { useEffect, useState } from 'react'
import CrosshairCursor from './originkit/ui/axis-cursor'

/**
 * Site-wide "Axis Cursor" overlay.
 * Renders the Originkit crosshair cursor in a fixed, full-viewport layer that
 * lets clicks pass through, themed to match the portfolio's ember palette.
 * Only active on devices with a precise pointer (desktop mouse / trackpad).
 */
export default function AxisCursor() {
  const [enabled, setEnabled] = useState(false)
  // Iframes (e.g. YouTube embeds) swallow the parent's mousemove events, which
  // freezes the crosshair at their edge. While the pointer is over an iframe we
  // hide the crosshair and restore the native cursor so the embed stays usable.
  const [overIframe, setOverIframe] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const update = () => setEnabled(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    // mouseover/mouseout bubble and fire on the iframe element as the pointer
    // crosses its boundary in the parent document — this catches every iframe,
    // including ones added after mount.
    const handleOver = (e) => {
      if (e.target.tagName === 'IFRAME') setOverIframe(true)
    }
    const handleOut = (e) => {
      if (e.target.tagName === 'IFRAME') setOverIframe(false)
    }
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)
    return () => {
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
    }
  }, [])

  const active = enabled && !overIframe

  useEffect(() => {
    // Hide the OS cursor everywhere while the axis cursor is active.
    document.documentElement.classList.toggle('axis-cursor-active', active)
    return () => document.documentElement.classList.remove('axis-cursor-active')
  }, [active])

  if (!active) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        pointerEvents: 'none',
      }}
    >
      <CrosshairCursor
        verticalColor="rgba(201, 137, 63, 0.35)"
        horizontalColor="rgba(201, 137, 63, 0.35)"
        verticalThickness={1}
        horizontalThickness={1}
        dotColor="#e6a55a"
        dotSize={8}
        showPosition={true}
        labelMode="position"
        labelColor="#e8e8ea"
        labelBg="rgba(13, 13, 16, 0.85)"
        labelFont={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 400,
          fontSize: 11,
          lineHeight: '1em',
          letterSpacing: '0.05em',
        }}
        labelPaddingX={6}
        labelPaddingY={4}
        labelRadius={2}
      />
    </div>
  )
}
