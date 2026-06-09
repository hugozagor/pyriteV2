import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useI18n } from '../i18n'
import { Search, Arrow } from './icons'
import { gradientFor } from '../format'

export default function SearchBar() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const ref = useRef(null)
  const skipFetch = useRef(false)

  // Keep the field in sync with the URL (?q=) when navigating.
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || ''
    skipFetch.current = true
    setQuery(q)
    setOpen(false)
  }, [location.search])

  // Debounced suggestion fetch as the user types.
  useEffect(() => {
    if (skipFetch.current) { skipFetch.current = false; return }
    const term = query.trim()
    if (term.length < 1) { setSuggestions([]); setOpen(false); return }
    const t = setTimeout(async () => {
      try {
        const res = await api.suggest(term)
        setSuggestions(res)
        setActive(-1)
        setOpen(true)
      } catch { /* ignore */ }
    }, 180)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const runSearch = (term) => {
    setOpen(false)
    navigate(term.trim() ? `/?q=${encodeURIComponent(term.trim())}` : '/')
  }

  const goToVideo = (s) => {
    setOpen(false)
    setQuery('')
    navigate(`/watch/${s.id}`)
  }

  const submit = (e) => {
    e.preventDefault()
    if (open && active >= 0 && active < suggestions.length) goToVideo(suggestions[active])
    else runSearch(query)
  }

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div className="searchbar-wrap" ref={ref}>
      <form className="searchbar" onSubmit={submit} role="search">
        <Search size={18} className="searchbar-icon" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => { if (suggestions.length) setOpen(true) }}
          placeholder={t('nav.search')}
          aria-label={t('nav.search')}
          autoComplete="off"
        />
        <button type="submit" className="searchbar-go" aria-label="Rechercher"><Arrow size={18} /></button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="suggest-pop">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`suggest-item ${i === active ? 'active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => goToVideo(s)}
            >
              <span className="suggest-thumb" style={!s.thumbnailUrl ? { background: gradientFor(s.id) } : undefined}>
                {s.thumbnailUrl && <img src={s.thumbnailUrl} alt="" />}
              </span>
              <span className="suggest-text">
                <span className="suggest-title">{s.title}</span>
                {s.channel && <span className="suggest-channel">{s.channel}</span>}
              </span>
              <Search size={15} className="suggest-go" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
