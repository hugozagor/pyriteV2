import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import Avatar from '../components/Avatar'
import VideoCard from '../components/VideoCard'
import Thumbnail from '../components/Thumbnail'
import { Verified, Shield, Share, Play, Chevron } from '../components/icons'
import { formatViews, formatCount, timeAgo } from '../format'

const TABS = ['Accueil', 'Vidéos', 'Playlists', 'À propos']

export default function Channel() {
  const { id } = useParams()
  const { user: me } = useAuth()
  const [profile, setProfile] = useState(null)
  const [videos, setVideos] = useState([])
  const [tab, setTab] = useState('Accueil')
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    setTab('Accueil')
    api.user(id).then(setProfile).catch((e) => setError(e.message))
    api.feed({ uploaderId: id }).then((f) => setVideos(f.videos || [])).catch(() => {})
    window.scrollTo(0, 0)
  }, [id])

  if (error) return <div className="page"><div className="empty">{error}</div></div>
  if (!profile) return <div className="page"><div className="watch-skeleton" /></div>

  const isAdmin = profile.role === 'ADMIN'
  const featured = videos[0]

  return (
    <div className="channel">
      <div className="channel-banner" style={{ background: 'linear-gradient(120deg, #2f8fc0, #57c6dd 55%, #4a73c4)' }}>
        <svg className="banner-wave" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0 150 C 200 110, 400 180, 600 150 S 1000 110, 1200 150 L1200 200 L0 200 Z" fill="rgba(255,255,255,0.12)" />
        </svg>
      </div>

      <div className="channel-head">
        <Avatar user={profile} size={132} className="channel-avatar" />
        <div className="channel-id">
          <h1>{profile.displayName} {isAdmin && <Verified size={22} className="badge" />}</h1>
          <div className="channel-sub">
            @{profile.username} · {isAdmin ? 'Compte administrateur' : 'Membre'} · {formatCount(profile.videoCount)} vidéos
          </div>
          {profile.bio && <p className="channel-bio">{profile.bio}</p>}
          <div className="channel-links">
            <span>pyrite.tv/{profile.username}</span>
            <span>{profile.email}</span>
          </div>
        </div>
        <div className="channel-cta">
          {isAdmin && <span className="pill pill-admin big"><Shield size={16} /> Compte administrateur</span>}
          <button className="icon-btn boxed"><Share size={18} /></button>
        </div>
      </div>

      <div className="channel-tabs">
        {TABS.map((t) => (
          <button key={t} className={`channel-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'À propos' ? (
        <div className="channel-about">
          <h3>À propos</h3>
          <p>{profile.bio || 'Aucune description.'}</p>
          <div className="about-grid">
            <div><span>Identifiant</span>@{profile.username}</div>
            <div><span>Contact</span>{profile.email}</div>
            <div><span>Vidéos</span>{formatCount(profile.videoCount)}</div>
            <div><span>Membre depuis</span>{new Date(profile.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty">
          <p>Aucune vidéo publiée.</p>
          {String(me?.id) === String(id) && me?.role === 'ADMIN' && (
            <Link to="/upload" className="btn btn-accent" style={{ marginTop: 12 }}>Publier une vidéo</Link>
          )}
        </div>
      ) : (
        <>
          {tab === 'Accueil' && featured && (
            <div className="channel-featured">
              <Link to={`/watch/${featured.id}`} className="featured-player">
                <Thumbnail video={featured} duration={false} />
                <span className="featured-play"><Play size={26} /></span>
              </Link>
              <div className="featured-info">
                <span className="featured-kicker">À la une</span>
                <h2>{featured.title}</h2>
                <p>{featured.description || 'Une nouvelle immersion à découvrir.'}</p>
                <div className="featured-stats">{formatViews(featured.views)} · {timeAgo(featured.createdAt)}</div>
              </div>
            </div>
          )}

          <div className="feed-head between">
            <h2>Vidéos récentes</h2>
            <button className="sort-mini">Les plus récentes <Chevron size={16} /></button>
          </div>
          <div className="grid">
            {videos.map((v) => <VideoCard key={v.id} video={v} showAvatar={false} />)}
          </div>
        </>
      )}
    </div>
  )
}
