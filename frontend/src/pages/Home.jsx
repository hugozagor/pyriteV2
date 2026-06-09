import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useI18n } from '../i18n'
import VideoCard from '../components/VideoCard'
import { Compass } from '../components/icons'

// Canonical category values (match what is stored on videos); labels are translated.
const CATEGORIES = [
  'Crystalcloud', 'Saphir', 'Récemment mis en ligne',
]
const META = ['Tout', 'Pour vous', 'Récemment mis en ligne']

export default function Home() {
  const { t, tc, lang } = useI18n()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  const [active, setActive] = useState('Tout')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    const category = META.includes(active) ? null : active
    api.feed({ search, category })
      .then((feed) => setVideos(feed.videos || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [active, search, lang])

  const heading = search
    ? t('home.results', { q: search })
    : active === 'Tout' || active === 'Pour vous'
      ? t('home.forYou')
      : tc(active)

  return (
    <div className="page home">
      {!search && (
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${active === c ? 'active' : ''}`}
              onClick={() => setActive(c)}
            >
              {tc(c)}
            </button>
          ))}
        </div>
      )}

      <div className="feed-head">
        <Compass size={20} className="feed-head-ico" />
        <h2>{heading}</h2>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="vcard skeleton-card" />)}
        </div>
      ) : error ? (
        <div className="empty">{error}</div>
      ) : videos.length === 0 ? (
        <div className="empty">
          <p>{t('home.empty')}</p>
          <span>{t('home.emptyHint')}</span>
        </div>
      ) : (
        <div className="grid">
          {videos.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  )
}
