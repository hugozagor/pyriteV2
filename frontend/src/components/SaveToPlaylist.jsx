import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { useI18n } from '../i18n'
import { Bookmark, BookmarkFill, Plus, Check } from './icons'

// "Enregistrer" button + popover to pick which playlist(s) the video belongs to.
export default function SaveToPlaylist({ videoId, inPlaylist, onInPlaylistChange }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [playlists, setPlaylists] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const refresh = (list) => {
    if (onInPlaylistChange) onInPlaylistChange(list.some((p) => p.containsVideo))
  }

  const openMenu = async () => {
    const next = !open
    setOpen(next)
    if (next) {
      setError('')
      try {
        const list = await api.playlists(videoId)
        setPlaylists(list)
      } catch (e) { setError(e.message) }
    }
  }

  const toggle = async (pl) => {
    const adding = !pl.containsVideo
    setPlaylists((list) => list.map((p) => p.id === pl.id
      ? { ...p, containsVideo: adding, videoCount: p.videoCount + (adding ? 1 : -1) }
      : p))
    try {
      if (adding) await api.addToPlaylist(pl.id, videoId)
      else await api.removeFromPlaylist(pl.id, videoId)
      setPlaylists((list) => { refresh(list); return list })
    } catch (e) { setError(e.message) }
  }

  const create = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      const pl = await api.createPlaylist(newName.trim(), videoId)
      setPlaylists((list) => {
        const next = [{ ...pl, containsVideo: true }, ...(list || [])]
        refresh(next)
        return next
      })
      setNewName('')
      setCreating(false)
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="share-wrap" ref={ref}>
      <button className={`action pill-btn ${inPlaylist ? 'on' : ''}`} onClick={openMenu}>
        {inPlaylist ? <BookmarkFill size={19} /> : <Bookmark size={19} />} {inPlaylist ? t('watch.saved') : t('watch.save')}
      </button>
      {open && (
        <div className="save-pop">
          <span className="share-pop-title">{t('save.into')}</span>
          {error && <div className="save-err">{error}</div>}
          {playlists === null ? (
            <div className="save-loading">{t('common.loading')}</div>
          ) : (
            <div className="save-list">
              {playlists.length === 0 && <div className="save-empty">{t('save.none')}</div>}
              {playlists.map((p) => (
                <button key={p.id} className="save-item" onClick={() => toggle(p)}>
                  <span className={`save-check ${p.containsVideo ? 'on' : ''}`}>{p.containsVideo && <Check size={14} />}</span>
                  <span className="save-name">{p.name}</span>
                  <span className="save-num">{p.videoCount}</span>
                </button>
              ))}
            </div>
          )}

          {creating ? (
            <form className="save-create" onSubmit={create}>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('save.namePh')} autoFocus maxLength={120} />
              <button type="submit" className="btn btn-accent"><Check size={16} /></button>
            </form>
          ) : (
            <button className="save-new" onClick={() => setCreating(true)}>
              <Plus size={18} /> {t('save.new')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
