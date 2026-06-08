// French formatting helpers for views, durations and relative dates.

export function formatViews(n) {
  if (n == null) return '0 vue'
  if (n < 1000) return `${n} vue${n > 1 ? 's' : ''}`
  if (n < 1_000_000) return `${trim(n / 1000)} k vues`
  return `${trim(n / 1_000_000)} M vues`
}

function trim(x) {
  return (Math.round(x * 10) / 10).toString().replace('.', ',')
}

export function formatCount(n) {
  if (n == null) return '0'
  if (n < 1000) return `${n}`
  if (n < 1_000_000) return `${trim(n / 1000)} k`
  return `${trim(n / 1_000_000)} M`
}

export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0:00'
  const s = Math.floor(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (v) => String(v).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

export function timeAgo(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - then)
  const sec = Math.floor(diff / 1000)
  const units = [
    ['an', 31536000],
    ['mois', 2592000],
    ['semaine', 604800],
    ['jour', 86400],
    ['heure', 3600],
    ['minute', 60],
  ]
  for (const [label, secs] of units) {
    const v = Math.floor(sec / secs)
    if (v >= 1) {
      const plural = v > 1 && label !== 'mois' ? 's' : ''
      return `il y a ${v} ${label}${plural}`
    }
  }
  return "à l'instant"
}

// Deterministic gradient placeholder for videos that ship no thumbnail.
const GRADIENTS = [
  'linear-gradient(135deg, #5fbfe0 0%, #4a73c4 100%)',
  'linear-gradient(135deg, #57c6dd 0%, #6a64c9 100%)',
  'linear-gradient(135deg, #3fc0b1 0%, #5aa8d6 100%)',
  'linear-gradient(135deg, #6aa9e0 0%, #8b6fd0 100%)',
  'linear-gradient(135deg, #4fb6d8 0%, #3f9bd0 100%)',
  'linear-gradient(135deg, #59c4c0 0%, #4f86cf 100%)',
]

export function gradientFor(id) {
  const i = Math.abs(Number(id) || 0) % GRADIENTS.length
  return GRADIENTS[i]
}

export function initial(name) {
  return (name || '?').trim().charAt(0).toUpperCase()
}
