import React from 'react'

/**
 * ResponsiveImage — WebP with srcset + JPEG fallback.
 *
 * Always pass intrinsic `width`/`height` so the browser can reserve space
 * before the image decodes (prevents Cumulative Layout Shift).
 * Everything is lazy by default; set `eager` only for above-the-fold images.
 */
export default function ResponsiveImage({
  webpSrcSet,
  fallbackSrc,
  width,
  height,
  alt,
  sizes = '100vw',
  eager = false,
  className,
}) {
  return (
    <picture>
      {webpSrcSet && (
        <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      )}
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    </picture>
  )
}
