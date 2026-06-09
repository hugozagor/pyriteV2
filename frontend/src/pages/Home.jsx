import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import VideoCard from '../components/VideoCard'
import { Compass } from '../components/icons'

const CATEGORIES = [
  'Tout', 'Pour vous', 'Musique', 'Lo-fi', 'Océan', 'Pluie', 'Méditation',
  'Nature', 'Plongée', 'Voile', 'Documentaires', 'Tech', 'Cuisine',
  'Récemment mis en ligne',
]

export default function Home() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q') || ''
  const [active, setActive] = useState('Tout')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    const category = ['Tout', 'Pour vous', 'Récemment mis en ligne'].includes(active) ? null : active
    api.feed({ search, category })
      .then((feed) => setVideos(feed.videos || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [active, search])

  const heading = search
    ? `Résultats pour « ${search} »`
    : active === 'Tout' || active === 'Pour vous'
      ? 'Pour vous · eaux calmes'
      : active

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
              {c}
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
          <p>Aucune vidéo pour le moment.</p>
          <span>L'administrateur n'a pas encore publié de contenu ici.</span>
        </div>
      ) : (
        <div className="grid">
          {videos.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  )
}
