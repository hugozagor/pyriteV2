import { useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import { Drop, Mail, Lock, Eye, Arrow } from '../components/icons'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={location.state?.from?.pathname || '/'} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(loginId.trim(), password)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      setError(err.message || 'Connexion impossible')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <div className="login-hero">
        <svg className="login-waves" viewBox="0 0 800 600" preserveAspectRatio="none">
          <path d="M-50 380 C 150 320, 350 440, 550 380 S 850 320, 950 380" />
          <path d="M-50 440 C 150 380, 350 500, 550 440 S 850 380, 950 440" />
          <path d="M-50 500 C 150 440, 350 560, 550 500 S 850 440, 950 500" />
        </svg>
        <div className="login-brand">
          <span className="brand-logo lg"><Drop size={30} /></span>
          <span className="brand-name lg">Pyrite</span>
        </div>
        <div className="login-tagline">
          <h1>La<br />plateforme<br />vidéo, au<br />calme.</h1>
          <p>
            Un espace privé où l'administrateur <strong>Dioptase</strong> partage ses vidéos.
            L'accès est réservé aux membres invités.
          </p>
        </div>
        <div className="login-foot">© 2026 Pyrite · Accès sur invitation uniquement</div>
      </div>

      <div className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <h2>Connexion</h2>
          <p className="login-sub">Identifiez-vous pour accéder à la plateforme.</p>

          <label className="field-label">Identifiant ou e-mail</label>
          <div className="field">
            <Mail size={18} className="field-ico" />
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="vous@exemple.fr"
              autoFocus
              autoComplete="username"
            />
          </div>

          <label className="field-label">Mot de passe</label>
          <div className="field">
            <Lock size={18} className="field-ico" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button type="button" className="field-eye" onClick={() => setShow((s) => !s)} aria-label="Afficher">
              <Eye size={18} />
            </button>
          </div>

          <div className="login-row">
            <label className="check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Rester connecté</span>
            </label>
            <span className="link-faint">Mot de passe oublié ?</span>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-accent btn-block login-submit" disabled={busy}>
            {busy ? 'Connexion…' : 'Se connecter'} <Arrow size={18} />
          </button>

          <div className="login-note">
            Pas encore de compte ? Les accès sont <strong>créés par l'administrateur Dioptase</strong>.
            Contactez-le pour obtenir une invitation.
          </div>
        </form>
      </div>
    </div>
  )
}
