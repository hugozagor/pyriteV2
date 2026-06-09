import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useI18n } from '../i18n'
import VideoCard from '../components/VideoCard'
import { History as HistoryIcon, Trash } from '../components/icons'

export default function History() {
  const { t } = useI18n()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.history()
      .then(setVideos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (videoId) => {
    setVideos((list) => list.filter((v) => v.id !== videoId))
    try { await api.removeFromHistory(videoId) } catch (e) { setError(e.message) }
  }

  const clearAll = async () => {
    if (!confirm(t('history.confirmClear'))) return
    setVideos([])
    try { await api.clearHistory() } catch (e) { setError(e.message) }
  }

  return (
    <div className="page">
      <div className="feed-head between">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HistoryIcon size={22} className="feed-head-ico" />
          <h2>{t('history.title')} {videos.length > 0 && <span className="count-badge">{videos.length}</span>}</h2>
        </div>
        {videos.length > 0 && (
          <button className="btn btn-ghost danger" onClick={clearAll}><Trash size={16} /> {t('history.clear')}</button>
        )}
      </div>

      {loading ? (
        <div className="grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="vcard skeleton-card" />)}</div>
      ) : error ? (
        <div className="empty">{error}</div>
      ) : videos.length === 0 ? (
        <div className="empty">
          <p>{t('history.empty')}</p>
          <span>{t('history.emptyHint')}</span>
          <Link to="/" className="btn btn-accent" style={{ marginTop: 14 }}>{t('common.browse')}</Link>
        </div>
      ) : (
        <div className="grid">
          {videos.map((v) => (
            <div key={v.id} className="removable">
              <VideoCard video={v} />
              <button className="remove-btn" title={t('history.remove')} onClick={(e) => { e.preventDefault(); remove(v.id) }}>
                <Trash size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
