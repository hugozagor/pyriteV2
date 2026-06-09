import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useI18n } from '../i18n'
import VideoCard from '../components/VideoCard'
import { Clock, Trash } from '../components/icons'

export default function WatchLater() {
  const { t } = useI18n()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.library('watch-later')
      .then(setVideos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (videoId) => {
    setVideos((list) => list.filter((v) => v.id !== videoId))
    try { await api.removeFromLibrary('watch-later', videoId) } catch (e) { setError(e.message) }
  }

  return (
    <div className="page">
      <div className="feed-head">
        <Clock size={22} className="feed-head-ico" />
        <h2>{t('wl.title')} {videos.length > 0 && <span className="count-badge">{videos.length}</span>}</h2>
      </div>

      {loading ? (
        <div className="grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="vcard skeleton-card" />)}</div>
      ) : error ? (
        <div className="empty">{error}</div>
      ) : videos.length === 0 ? (
        <div className="empty">
          <p>{t('wl.empty')}</p>
          <span>{t('wl.emptyHint')}</span>
          <Link to="/" className="btn btn-accent" style={{ marginTop: 14 }}>{t('common.browse')}</Link>
        </div>
      ) : (
        <div className="grid">
          {videos.map((v) => (
            <div key={v.id} className="removable">
              <VideoCard video={v} />
              <button
                className="remove-btn"
                title={t('wl.remove')}
                onClick={(e) => { e.preventDefault(); remove(v.id) }}
              >
                <Trash size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
