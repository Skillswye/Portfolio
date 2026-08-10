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
  // Keyboard users must be able to see where focus is. The crosshair hides the
  // OS cursor site-wide, so the moment someone tabs we stand down and hand the
  // native cursor + focus ring back. Any mouse movement resumes the crosshair.
  const [keyboardNav, setKeyboardNav] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    // A crosshair that tracks the pointer is continuous motion — skip it
    // entirely when the OS asks for reduced motion.
    const update = () => setEnabled(mq.matches && !motionMq.matches)
    update()
    mq.addEventListener('change', update)
    motionMq.addEventListener('change', update)
    return () => {
      mq.removeEventListener('change', update)
      motionMq.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Tab') setKeyboardNav(true)
    }
    const onPointerMove = () => setKeyboardNav(false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousemove', onPointerMove, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousemove', onPointerMove)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('keyboard-nav', keyboardNav)
    return () => document.documentElement.classList.remove('keyboard-nav')
  }, [keyboardNav])

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

  const active = enabled && !overIframe && !keyboardNav

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
