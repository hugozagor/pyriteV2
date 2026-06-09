import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { useI18n, LANGUAGES } from '../i18n'
import Avatar from '../components/Avatar'
import Thumbnail from '../components/Thumbnail'
import SaveToPlaylist from '../components/SaveToPlaylist'
import { ThumbUp, ThumbDown, Share, Clock, Check, LinkIco, Globe, Verified, Shield, Sort, Trash, Pencil } from '../components/icons'
import { formatViews, formatCount, timeAgo } from '../format'

export default function Watch() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const { t, tc, lang } = useI18n()
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
  }, [id, lang])

  useEffect(() => {
    const close = (e) => { if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const shareUrl = `${window.location.origin}/watch/${id}`

  const toggleLibrary = (kind, flag) => async () => {
    const active = video[flag]
    setVideo((v) => v && { ...v, [flag]: !active })
    try {
      if (active) await api.removeFromLibrary(kind, id)
      else await api.addToLibrary(kind, id)
    } catch (e) {
      setVideo((v) => v && { ...v, [flag]: active })
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
    try { setVideo(await api.toggleLike(id)) } catch (e) { setError(e.message) }
  }
  const toggleDislike = async () => {
    try { setVideo(await api.toggleDislike(id)) } catch (e) { setError(e.message) }
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
    if (!confirm(t('watch.confirmDelete'))) return
    await api.deleteVideo(id)
    navigate('/')
  }

  if (error) return <div className="page"><div className="empty">{error}</div></div>
  if (!video) return <div className="page"><div className="watch-skeleton" /></div>

  const hashtags = (video.hashtags || '')
    .split(/[\s,]+/).filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
  const langLabel = (LANGUAGES.find((l) => l.code === video.language) || {}).label

  return (
    <div className="watch">
      <div className="watch-main">
        <div className="player">
          <video src={video.videoUrl} poster={video.thumbnailUrl || undefined} controls onPlay={onPlay} controlsList="nodownload" />
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
                {video.uploader?.role === 'ADMIN' ? t('channel.adminAccount') : t('common.member')} · {t('watch.videos', { count: formatCount(video.uploader?.videoCount) })}
              </div>
            </div>
            {video.uploader?.role === 'ADMIN' && (
              <span className="pill pill-admin"><Shield size={15} /> {t('common.administrator')}</span>
            )}
          </div>

          <div className="watch-actions">
            <div className="action-group">
              <button className={`action ${video.likedByMe ? 'on' : ''}`} onClick={toggleLike}>
                <ThumbUp size={20} /> {formatCount(video.likes)}
              </button>
              <span className="action-sep" />
              <button className={`action ${video.dislikedByMe ? 'on' : ''}`} onClick={toggleDislike}>
                <ThumbDown size={20} />
              </button>
            </div>
            <div className="share-wrap" ref={shareRef}>
              <button className="action pill-btn" onClick={onShareClick}><Share size={19} /> {t('watch.share')}</button>
              {shareOpen && (
                <div className="share-pop">
                  <span className="share-pop-title">{t('watch.shareTitle')}</span>
                  <div className="share-pop-row">
                    <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
                    <button className="btn btn-accent" onClick={copyLink}>
                      {copied ? <><Check size={16} /> {t('watch.copied')}</> : <><LinkIco size={16} /> {t('watch.copy')}</>}
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
              {video.watchLaterByMe ? <Check size={19} /> : <Clock size={19} />} {video.watchLaterByMe ? t('watch.added') : t('watch.watchLater')}
            </button>
            {isAdmin && (
              <Link to={`/edit/${id}`} className="action pill-btn"><Pencil size={18} /> {t('watch.edit')}</Link>
            )}
            {isAdmin && (
              <button className="action pill-btn danger" onClick={removeVideo}><Trash size={18} /></button>
            )}
          </div>
        </div>

        <div className={`watch-desc ${expanded ? 'open' : ''}`}>
          <div className="watch-desc-meta">
            {formatViews(video.views)} · {timeAgo(video.createdAt)}
            {langLabel && <span className="lang-chip"><Globe size={13} /> {langLabel}</span>}
            {video.category && <span className="tag"> · {tc(video.category)}</span>}
            {hashtags.length > 0 && <span className="tags"> · {hashtags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</span>}
          </div>
          {video.description && <p className="watch-desc-body">{video.description}</p>}
          {video.description && video.description.length > 180 && (
            <button className="watch-desc-toggle" onClick={() => setExpanded((e) => !e)}>
              {expanded ? t('watch.less') : t('watch.more')}
            </button>
          )}
        </div>

        <section className="comments">
          <div className="comments-head">
            <h3>{t('comments.count', { count: formatCount(video.commentCount) })}</h3>
            <button className="comments-sort"><Sort size={18} /> {t('comments.sort')}</button>
          </div>

          <form className="comment-add" onSubmit={submitComment}>
            <Avatar user={user} size={40} />
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t('comments.add')} />
            {draft.trim() && <button type="submit" className="btn btn-accent">{t('comments.submit')}</button>}
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
                    <button className="comment-reply">{t('comments.reply')}</button>
                    {(isAdmin || c.author?.id === user?.id) && (
                      <button className="comment-del" onClick={() => removeComment(c.id)}>{t('comments.delete')}</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && <div className="empty small">{t('comments.first')}</div>}
          </div>
        </section>
      </div>

      <aside className="watch-side">
        <div className="autoplay-row">
          <span>{t('watch.autoplay')}</span>
          <button className={`toggle ${autoplay ? 'on' : ''}`} onClick={() => setAutoplay((a) => !a)} aria-label={t('watch.autoplay')}>
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
