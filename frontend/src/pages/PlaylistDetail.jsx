import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import { useI18n } from '../i18n'
import VideoCard from '../components/VideoCard'
import { Play, Pencil, Trash, Check } from '../components/icons'

export default function PlaylistDetail() {
  const { id } = useParams()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [pl, setPl] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')

  const load = () => api.playlist(id).then((p) => { setPl(p); setName(p.name) }).catch((e) => setError(e.message))
  useEffect(() => { load() }, [id])

  const rename = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const updated = await api.renamePlaylist(id, name.trim())
    setPl((p) => ({ ...p, name: updated.name }))
    setEditing(false)
  }

  const removePlaylist = async () => {
    if (!confirm(t('playlists.confirmDelete', { name: pl.name }))) return
    await api.deletePlaylist(id)
    navigate('/playlists')
  }

  const removeVideo = async (videoId) => {
    setPl((p) => ({ ...p, videos: p.videos.filter((v) => v.id !== videoId), videoCount: p.videoCount - 1 }))
    try { await api.removeFromPlaylist(id, videoId) } catch (e) { setError(e.message) }
  }

  if (error) return <div className="page"><div className="empty">{error}</div></div>
  if (!pl) return <div className="page"><div className="watch-skeleton" /></div>

  return (
    <div className="page">
      <div className="pl-header">
        <div className="pl-header-info">
          {editing ? (
            <form className="pl-rename" onSubmit={rename}>
              <div className="field plain"><input value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={120} /></div>
              <button type="submit" className="btn btn-accent"><Check size={16} /> OK</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setEditing(false); setName(pl.name) }}>{t('common.cancel')}</button>
            </form>
          ) : (
            <h1>{pl.name}</h1>
          )}
          <span className="pl-header-count">{t(pl.videoCount > 1 ? 'playlists.videos' : 'playlists.video', { count: pl.videoCount })}</span>
        </div>
        <div className="pl-header-actions">
          {pl.videos.length > 0 && (
            <Link to={`/watch/${pl.videos[0].id}`} className="btn btn-accent"><Play size={16} /> {t('playlists.playAll')}</Link>
          )}
          <button className="btn btn-ghost" onClick={() => setEditing(true)}><Pencil size={16} /> {t('playlists.rename')}</button>
          <button className="btn btn-ghost danger" onClick={removePlaylist}><Trash size={16} /> {t('common.delete')}</button>
        </div>
      </div>

      {pl.videos.length === 0 ? (
        <div className="empty">
          <p>{t('playlists.emptyOne')}</p>
          <span>{t('playlists.emptyOneHint')}</span>
        </div>
      ) : (
        <div className="grid">
          {pl.videos.map((v) => (
            <div key={v.id} className="removable">
              <VideoCard video={v} />
              <button className="remove-btn" title={t('playlists.removeFromList')} onClick={(e) => { e.preventDefault(); removeVideo(v.id) }}>
                <Trash size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
