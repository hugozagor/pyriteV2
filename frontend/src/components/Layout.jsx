import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import Avatar from './Avatar'
import {
  Drop, Menu, Search, Arrow, Bell, Moon, Sun, Home, Compass, Live,
  History, Clock, ThumbUp, Playlist, Download, Settings, Logout, Plus, Users, Shield,
} from './icons'

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('pyrite_theme') || 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('pyrite_theme', theme)
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}

export default function Layout({ children }) {
  const { user, isAdmin, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [theme, toggleTheme] = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef(null)

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setQuery(params.get('q') || '')
  }, [location.search])

  const submitSearch = (e) => {
    e.preventDefault()
    navigate(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : '/')
  }

  return (
    <div className={`app ${collapsed ? 'collapsed' : ''}`}>
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-btn" onClick={() => setCollapsed((c) => !c)} aria-label="Menu">
            <Menu size={22} />
          </button>
          <Link to="/" className="brand">
            <span className="brand-logo"><Drop size={24} /></span>
            <span className="brand-name">Pyrite</span>
          </Link>
        </div>

        <form className="searchbar" onSubmit={submitSearch}>
          <Search size={18} className="searchbar-icon" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des vidéos…"
          />
          <button type="submit" className="searchbar-go" aria-label="Rechercher"><Arrow size={18} /></button>
        </form>

        <div className="topbar-right">
          {isAdmin && (
            <Link to="/upload" className="btn btn-accent publish-btn">
              <Plus size={18} /> <span>Publier</span>
            </Link>
          )}
          <button className="icon-btn badge-wrap" aria-label="Notifications">
            <Bell size={21} />
            <span className="notif-badge">2</span>
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Thème">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="avatar-menu" ref={menuRef}>
            <button onClick={() => setMenuOpen((o) => !o)} className="avatar-btn">
              <Avatar user={user} size={36} />
            </button>
            {menuOpen && (
              <div className="dropdown">
                <div className="dropdown-head">
                  <Avatar user={user} size={40} />
                  <div>
                    <div className="dropdown-name">{user?.displayName}</div>
                    <div className="dropdown-handle">@{user?.username}</div>
                  </div>
                </div>
                <div className="dropdown-sep" />
                <Link to={`/channel/${user?.id}`} className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  <Compass size={18} /> Votre chaîne
                </Link>
                {isAdmin && (
                  <Link to="/admin/users" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    <Users size={18} /> Gérer les membres
                  </Link>
                )}
                <Link to="/settings" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  <Settings size={18} /> Paramètres
                </Link>
                <div className="dropdown-sep" />
                <button className="dropdown-item" onClick={() => { logout(); navigate('/login') }}>
                  <Logout size={18} /> Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className="sidebar">
        <nav className="side-nav">
          <SideLink to="/" icon={<Home size={20} />} label="Accueil" end />
          <SideLink to="/explore" icon={<Compass size={20} />} label="Explorer" />
          <SideLink to="/live" icon={<Live size={20} />} label="En direct" />

          <div className="side-section">Votre espace</div>
          <SideLink to="/history" icon={<History size={20} />} label="Historique" />
          <SideLink to="/watch-later" icon={<Clock size={20} />} label="À regarder" />
          <SideLink to="/liked" icon={<ThumbUp size={20} />} label="Vidéos aimées" />
          <SideLink to="/playlists" icon={<Playlist size={20} />} label="Playlists" />
          <SideLink to="/downloads" icon={<Download size={20} />} label="Téléchargements" />

          <div className="side-divider" />
          {isAdmin && <SideLink to="/admin/users" icon={<Shield size={20} />} label="Administration" />}
          <SideLink to="/settings" icon={<Settings size={20} />} label="Paramètres" />
          <button className="side-link" onClick={() => { logout(); navigate('/login') }}>
            <span className="side-ico"><Logout size={20} /></span>
            <span className="side-label">Se déconnecter</span>
          </button>
        </nav>
      </aside>

      <main className="content">{children}</main>
    </div>
  )
}

function SideLink({ to, icon, label, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
      <span className="side-ico">{icon}</span>
      <span className="side-label">{label}</span>
    </NavLink>
  )
}
