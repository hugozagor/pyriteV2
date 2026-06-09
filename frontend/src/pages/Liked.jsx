import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useI18n } from '../i18n'
import VideoCard from '../components/VideoCard'
import { ThumbUp } from '../components/icons'

export default function Liked() {
  const { t } = useI18n()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.likedVideos()
      .then(setVideos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const unlike = async (videoId) => {
    setVideos((list) => list.filter((v) => v.id !== videoId))
    try { await api.toggleLike(videoId) } catch (e) { setError(e.message) }
  }

  return (
    <div className="page">
      <div className="feed-head">
        <ThumbUp size={22} className="feed-head-ico" />
        <h2>{t('liked.title')} {videos.length > 0 && <span className="count-badge">{videos.length}</span>}</h2>
      </div>

      {loading ? (
        <div className="grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="vcard skeleton-card" />)}</div>
      ) : error ? (
        <div className="empty">{error}</div>
      ) : videos.length === 0 ? (
        <div className="empty">
          <p>{t('liked.empty')}</p>
          <span>{t('liked.emptyHint')}</span>
          <Link to="/" className="btn btn-accent" style={{ marginTop: 14 }}>{t('common.browse')}</Link>
        </div>
      ) : (
        <div className="grid">
          {videos.map((v) => (
            <div key={v.id} className="removable">
              <VideoCard video={v} />
              <button className="remove-btn liked" title={t('liked.unlike')} onClick={(e) => { e.preventDefault(); unlike(v.id) }}>
                <ThumbUp size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
