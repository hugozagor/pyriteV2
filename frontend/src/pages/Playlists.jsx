import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Playlist as PlaylistIcon, Plus, Check } from '../components/icons'
import { gradientFor } from '../format'

export default function Playlists() {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    api.playlists()
      .then(setPlaylists)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const create = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const pl = await api.createPlaylist(name.trim())
      setPlaylists((list) => [pl, ...list])
      setName('')
      setCreating(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <div className="feed-head between">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PlaylistIcon size={22} className="feed-head-ico" />
          <h2>Playlists {playlists.length > 0 && <span className="count-badge">{playlists.length}</span>}</h2>
        </div>
        <button className="btn btn-accent" onClick={() => setCreating((c) => !c)}>
          <Plus size={18} /> Créer une playlist
        </button>
      </div>

      {creating && (
        <form className="pl-create" onSubmit={create}>
          <div className="field plain" style={{ flex: 1 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la playlist (ex. Sessions d'apnée)"
              autoFocus
              maxLength={120}
            />
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => { setCreating(false); setName('') }}>Annuler</button>
          <button type="submit" className="btn btn-accent"><Check size={18} /> Créer</button>
        </form>
      )}

      {error && <div className="banner err">{error}</div>}

      {loading ? (
        <div className="grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="vcard skeleton-card" />)}</div>
      ) : playlists.length === 0 ? (
        <div className="empty">
          <p>Aucune playlist pour le moment.</p>
          <span>Créez-en une, puis enregistrez des vidéos dedans via le bouton « Enregistrer ».</span>
        </div>
      ) : (
        <div className="grid pl-grid">
          {playlists.map((p) => (
            <Link key={p.id} to={`/playlist/${p.id}`} className="pl-card">
              <div className="pl-cover" style={!p.coverUrl ? { background: gradientFor(p.id) } : undefined}>
                {p.coverUrl && <img src={p.coverUrl} alt="" />}
                <span className="pl-stack" />
                <span className="pl-count"><PlaylistIcon size={15} /> {p.videoCount}</span>
              </div>
              <div className="pl-meta">
                <h3>{p.name}</h3>
                <span>{p.videoCount} vidéo{p.videoCount > 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
