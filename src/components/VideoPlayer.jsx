import React, { forwardRef } from 'react'
import './VideoPlayer.css'

/**
 * Self-hosted video in the site's 16:9 frame.
 * Native controls keep it keyboard and screen-reader accessible. Only the
 * metadata loads until the viewer presses play, so a page with several videos
 * doesn't pull tens of MB on arrival. Forward a ref to seek it from outside.
 */
const VideoPlayer = forwardRef(function VideoPlayer({ video, title, onTimeUpdate }, ref) {
  return (
    <div className="video-frame">
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        width={video.width}
        height={video.height}
        controls
        preload="metadata"
        playsInline
        aria-label={title}
        onTimeUpdate={onTimeUpdate}
      />
    </div>
  )
})

export default VideoPlayer
