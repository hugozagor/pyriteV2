import { initial } from '../format'

export default function Avatar({ user, size = 36, className = '' }) {
  const bg = user?.avatarColor || '#2bb3d6'
  return (
    <span
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(160deg, ${bg}, ${shade(bg, -25)})`,
        fontSize: size * 0.42,
      }}
    >
      {initial(user?.displayName || user?.username)}
    </span>
  )
}

function shade(hex, percent) {
  const n = hex.replace('#', '')
  if (n.length !== 6) return hex
  const num = parseInt(n, 16)
  const amt = Math.round(2.55 * percent)
  const r = Math.min(255, Math.max(0, (num >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
