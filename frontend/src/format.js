// Locale-aware formatting for views, counts, durations and relative dates.
// The active locale is set by the i18n provider via setLocale().

let locale = 'fr'
const VIEWS_WORD = { fr: 'vues', en: 'views', es: 'visualizaciones', ru: 'просмотров' }

export function setLocale(l) {
  locale = l || 'fr'
}

export function formatCount(n) {
  if (n == null) return '0'
  try {
    return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n)
  } catch {
    return `${n}`
  }
}

export function formatViews(n) {
  return `${formatCount(n || 0)} ${VIEWS_WORD[locale] || VIEWS_WORD.fr}`
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
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60],
  ]
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  for (const [unit, secs] of units) {
    const v = Math.floor(diffSec / secs)
    if (v >= 1) return rtf.format(-v, unit)
  }
  return rtf.format(0, 'second')
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
