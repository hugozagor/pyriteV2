import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import Avatar from '../components/Avatar'
import Thumbnail from '../components/Thumbnail'
import SaveToPlaylist from '../components/SaveToPlaylist'
import { ThumbUp, ThumbDown, Share, Clock, Check, LinkIco, Verified, Shield, Sort, Trash, Pencil } from '../components/icons'
import { formatViews, formatCount, timeAgo } from '../format'

export default function Watch() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [related, setRelated] = useState([])
  const [comments, setComments] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState('')
  const [autoplay, setAutoplay] = useState(true)
  const [error, setError] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const viewed = useRef(false)
  const shareRef = useRef(null)

  useEffect(() => {
    viewed.current = false
    setError('')
    setVideo(null)
    setShareOpen(false)
    api.video(id).then(setVideo).catch((e) => setError(e.message))
    api.comments(id).then(setComments).catch(() => {})
    api.feed().then((feed) => setRelated((feed.videos || []).filter((v) => String(v.id) !== String(id)))).catch(() => {})
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    const close = (e) => { if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const shareUrl = `${window.location.origin}/watch/${id}`

  const toggleLibrary = (kind, flag) => async () => {
    const active = video[flag]
    // optimistic flip
    setVideo((v) => v && { ...v, [flag]: !active })
    try {
      if (active) await api.removeFromLibrary(kind, id)
      else await api.addToLibrary(kind, id)
    } catch (e) {
      setVideo((v) => v && { ...v, [flag]: active }) // revert on failure
      setError(e.message)
    }
  }
  const toggleWatchLater = () => toggleLibrary('watch-later', 'watchLaterByMe')()

  const onShareClick = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: video.title, url: shareUrl }); return } catch { /* cancelled */ }
    }
    setShareOpen((o) => !o)
  }
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked */ }
  }

  const onPlay = () => {
    if (viewed.current) return
    viewed.current = true
    api.registerView(id).then(() => setVideo((v) => v && { ...v, views: v.views + 1 })).catch(() => {})
  }

  const toggleLike = async () => {
    try {
      const updated = await api.toggleLike(id)
      setVideo(updated)
    } catch (e) { setError(e.message) }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    const c = await api.addComment(id, draft.trim())
    setComments((list) => [c, ...list])
    setDraft('')
    setVideo((v) => v && { ...v, commentCount: v.commentCount + 1 })
  }

  const removeComment = async (commentId) => {
    await api.deleteComment(id, commentId)
    setComments((list) => list.filter((c) => c.id !== commentId))
    setVideo((v) => v && { ...v, commentCount: Math.max(0, v.commentCount - 1) })
  }

  const removeVideo = async () => {
    if (!confirm('Supprimer définitivement cette vidéo ?')) return
    await api.deleteVideo(id)
    navigate('/')
  }

  if (error) return <div className="page"><div className="empty">{error}</div></div>
  if (!video) return <div className="page"><div className="watch-skeleton" /></div>

  const hashtags = (video.hashtags || '')
    .split(/[\s,]+/).filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : `#${t}`))

  return (
    <div className="watch">
      <div className="watch-main">
        <div className="player">
          <video
            src={video.videoUrl}
            poster={video.thumbnailUrl || undefined}
            controls
            onPlay={onPlay}
            controlsList="nodownload"
          />
        </div>

        <h1 className="watch-title">{video.title}</h1>

        <div className="watch-bar">
          <div className="watch-owner">
            <Link to={`/channel/${video.uploader?.id}`}><Avatar user={video.uploader} size={44} /></Link>
            <div>
              <Link to={`/channel/${video.uploader?.id}`} className="watch-owner-name">
                {video.uploader?.displayName} <Verified size={15} className="badge" />
              </Link>
              <div className="watch-owner-sub">
                {video.uploader?.role === 'ADMIN' ? 'Compte administrateur' : 'Membre'} · {formatCount(video.uploader?.videoCount)} vidéos
              </div>
            </div>
            {video.uploader?.role === 'ADMIN' && (
              <span className="pill pill-admin"><Shield size={15} /> Administrateur</span>
            )}
          </div>

          <div className="watch-actions">
            <div className="action-group">
              <button className={`action ${video.likedByMe ? 'on' : ''}`} onClick={toggleLike}>
                <ThumbUp size={20} /> {formatCount(video.likes)}
              </button>
              <span className="action-sep" />
              <button className="action" onClick={toggleLike}><ThumbDown size={20} /></button>
            </div>
            <div className="share-wrap" ref={shareRef}>
              <button className="action pill-btn" onClick={onShareClick}><Share size={19} /> Partager</button>
              {shareOpen && (
                <div className="share-pop">
                  <span className="share-pop-title">Partager cette vidéo</span>
                  <div className="share-pop-row">
                    <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
                    <button className="btn btn-accent" onClick={copyLink}>
                      {copied ? <><Check size={16} /> Copié</> : <><LinkIco size={16} /> Copier</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <SaveToPlaylist
              videoId={id}
              inPlaylist={video.inPlaylist}
              onInPlaylistChange={(val) => setVideo((v) => v && { ...v, inPlaylist: val })}
            />
            <button className={`action pill-btn ${video.watchLaterByMe ? 'on' : ''}`} onClick={toggleWatchLater}>
              {video.watchLaterByMe ? <Check size={19} /> : <Clock size={19} />} {video.watchLaterByMe ? 'Ajoutée' : 'À regarder'}
            </button>
            {isAdmin && (
              <Link to={`/edit/${id}`} className="action pill-btn"><Pencil size={18} /> Modifier</Link>
            )}
            {isAdmin && (
              <button className="action pill-btn danger" onClick={removeVideo}><Trash size={18} /></button>
            )}
          </div>
        </div>

        <div className={`watch-desc ${expanded ? 'open' : ''}`}>
          <div className="watch-desc-meta">
            {formatViews(video.views)} · {timeAgo(video.createdAt)}
            {hashtags.length > 0 && <span className="tags"> · {hashtags.map((t) => <span key={t} className="tag">{t}</span>)}</span>}
          </div>
          {video.description && <p className="watch-desc-body">{video.description}</p>}
          {video.description && video.description.length > 180 && (
            <button className="watch-desc-toggle" onClick={() => setExpanded((e) => !e)}>
              {expanded ? 'Réduire' : '…plus'}
            </button>
          )}
        </div>

        <section className="comments">
          <div className="comments-head">
            <h3>{formatCount(video.commentCount)} commentaires</h3>
            <button className="comments-sort"><Sort size={18} /> Trier par</button>
          </div>

          <form className="comment-add" onSubmit={submitComment}>
            <Avatar user={user} size={40} />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ajouter un commentaire…"
            />
            {draft.trim() && <button type="submit" className="btn btn-accent">Commenter</button>}
          </form>

          <div className="comment-list">
            {comments.map((c) => (
              <div key={c.id} className="comment">
                <Avatar user={c.author} size={40} />
                <div className="comment-body">
                  <div className="comment-meta">
                    <span className="comment-author">@{c.author?.username}</span>
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="comment-text">{c.text}</p>
                  <div className="comment-actions">
                    <button className="comment-like"><ThumbUp size={16} /> {c.likes || ''}</button>
                    <button className="comment-dislike"><ThumbDown size={16} /></button>
                    <button className="comment-reply">Répondre</button>
                    {(isAdmin || c.author?.id === user?.id) && (
                      <button className="comment-del" onClick={() => removeComment(c.id)}>Supprimer</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && <div className="empty small">Soyez le premier à commenter.</div>}
          </div>
        </section>
      </div>

      <aside className="watch-side">
        <div className="autoplay-row">
          <span>Lecture automatique</span>
          <button
            className={`toggle ${autoplay ? 'on' : ''}`}
            onClick={() => setAutoplay((a) => !a)}
            aria-label="Lecture automatique"
          >
            <span className="toggle-knob" />
          </button>
        </div>
        {related.map((v) => (
          <Link key={v.id} to={`/watch/${v.id}`} className="side-card">
            <Thumbnail video={v} className="side-thumb" />
            <div className="side-info">
              <h4>{v.title}</h4>
              <div className="side-channel">{v.uploader?.displayName} <Verified size={12} className="badge" /></div>
              <div className="side-stats">{formatViews(v.views)} · {timeAgo(v.createdAt)}</div>
            </div>
          </Link>
        ))}
      </aside>
    </div>
  )
}
