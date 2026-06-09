import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useI18n, LANGUAGES } from '../i18n'
import Avatar from './Avatar'
import SearchBar from './SearchBar'
import {
  Drop, Menu, Bell, Moon, Sun, Home, Compass, Globe, Check,
  History, Clock, ThumbUp, Playlist, Settings, Logout, Plus, Users, Shield,
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
  const { t, lang, setLang } = useI18n()
  const [collapsed, setCollapsed] = useState(false)
  const [theme, toggleTheme] = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const langRef = useRef(null)

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

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

        <SearchBar />

        <div className="topbar-right">
          {isAdmin && (
            <Link to="/upload" className="btn btn-accent publish-btn">
              <Plus size={18} /> <span>{t('nav.publish')}</span>
            </Link>
          )}

          <div className="avatar-menu" ref={langRef}>
            <button className="icon-btn lang-btn" onClick={() => setLangOpen((o) => !o)} aria-label={t('nav.language')}>
              <Globe size={20} />
              <span className="lang-code">{current.code.toUpperCase()}</span>
            </button>
            {langOpen && (
              <div className="dropdown lang-dropdown">
                <div className="dropdown-label">{t('nav.language')}</div>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    className="dropdown-item"
                    onClick={() => { setLang(l.code); setLangOpen(false) }}
                  >
                    <span className="lang-flag">{l.flag}</span>
                    <span style={{ flex: 1 }}>{l.label}</span>
                    {l.code === lang && <Check size={16} />}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                  <Compass size={18} /> {t('nav.yourChannel')}
                </Link>
                {isAdmin && (
                  <Link to="/admin/users" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    <Users size={18} /> {t('nav.manageMembers')}
                  </Link>
                )}
                <Link to="/settings" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  <Settings size={18} /> {t('nav.settings')}
                </Link>
                <div className="dropdown-sep" />
                <button className="dropdown-item" onClick={() => { logout(); navigate('/login') }}>
                  <Logout size={18} /> {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className="sidebar">
        <nav className="side-nav">
          <SideLink to="/" icon={<Home size={20} />} label={t('nav.home')} end />
          <SideLink to="/explore" icon={<Compass size={20} />} label={t('nav.explore')} />

          <div className="side-section">{t('nav.yourSpace')}</div>
          <SideLink to="/history" icon={<History size={20} />} label={t('nav.history')} />
          <SideLink to="/watch-later" icon={<Clock size={20} />} label={t('nav.watchLater')} />
          <SideLink to="/liked" icon={<ThumbUp size={20} />} label={t('nav.liked')} />
          <SideLink to="/playlists" icon={<Playlist size={20} />} label={t('nav.playlists')} />

          <div className="side-divider" />
          {isAdmin && <SideLink to="/admin/users" icon={<Shield size={20} />} label={t('nav.administration')} />}
          <SideLink to="/settings" icon={<Settings size={20} />} label={t('nav.settings')} />
          <button className="side-link" onClick={() => { logout(); navigate('/login') }}>
            <span className="side-ico"><Logout size={20} /></span>
            <span className="side-label">{t('nav.logout')}</span>
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
