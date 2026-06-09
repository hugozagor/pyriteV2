import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import VideoCard from '../components/VideoCard'
import { History as HistoryIcon, Trash } from '../components/icons'

export default function History() {
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
    if (!confirm("Effacer tout l'historique de visionnage ?")) return
    setVideos([])
    try { await api.clearHistory() } catch (e) { setError(e.message) }
  }

  return (
    <div className="page">
      <div className="feed-head between">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HistoryIcon size={22} className="feed-head-ico" />
          <h2>Historique {videos.length > 0 && <span className="count-badge">{videos.length}</span>}</h2>
        </div>
        {videos.length > 0 && (
          <button className="btn btn-ghost danger" onClick={clearAll}><Trash size={16} /> Tout effacer</button>
        )}
      </div>

      {loading ? (
        <div className="grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="vcard skeleton-card" />)}</div>
      ) : error ? (
        <div className="empty">{error}</div>
      ) : videos.length === 0 ? (
        <div className="empty">
          <p>Votre historique est vide.</p>
          <span>Les vidéos que vous lancez apparaîtront ici, les plus récentes en premier.</span>
          <Link to="/" className="btn btn-accent" style={{ marginTop: 14 }}>Parcourir les vidéos</Link>
        </div>
      ) : (
        <div className="grid">
          {videos.map((v) => (
            <div key={v.id} className="removable">
              <VideoCard video={v} />
              <button className="remove-btn" title="Retirer de l'historique" onClick={(e) => { e.preventDefault(); remove(v.id) }}>
                <Trash size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
