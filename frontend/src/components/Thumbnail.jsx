import { gradientFor, formatDuration } from '../format'

// Renders the thumbnail image when present, otherwise the signature Pyrite
// water-gradient placeholder with a subtle wave at the bottom.
export default function Thumbnail({ video, duration = true, live = false, className = '' }) {
  return (
    <div className={`thumb ${className}`} style={!video?.thumbnailUrl ? { background: gradientFor(video?.id) } : undefined}>
      {video?.thumbnailUrl ? (
        <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
      ) : (
        <svg className="thumb-wave" viewBox="0 0 400 120" preserveAspectRatio="none">
          <path d="M0 70 C 60 40, 120 95, 200 70 S 340 45, 400 70 L400 120 L0 120 Z" fill="rgba(255,255,255,0.12)" />
          <path d="M0 90 C 80 65, 160 110, 240 88 S 360 70, 400 90 L400 120 L0 120 Z" fill="rgba(255,255,255,0.10)" />
        </svg>
      )}
      {live ? (
        <span className="thumb-live">● LIVE</span>
      ) : duration && video?.durationSeconds ? (
        <span className="thumb-duration">{formatDuration(video.durationSeconds)}</span>
      ) : null}
    </div>
  )
}
