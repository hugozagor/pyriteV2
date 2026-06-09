import { useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import { Drop, Mail, Lock, Eye, Arrow } from '../components/icons'

const ADMIN_NAME = 'Dioptase'

export default function Login() {
  const { user, login } = useAuth()
  const { t } = useI18n()
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
      setError(err.message || t('login.error'))
    } finally {
      setBusy(false)
    }
  }

  // Split the hero text around the {admin} marker to keep the bold name.
  const heroParts = t('login.heroText').split('{admin}')
  const noteParts = t('login.note').split('{admin}')

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
          <h1>{t('login.tagline')}</h1>
          <p>{heroParts[0]}<strong>{ADMIN_NAME}</strong>{heroParts[1]}</p>
        </div>
        <div className="login-foot">{t('login.footer')}</div>
      </div>

      <div className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <h2>{t('login.title')}</h2>
          <p className="login-sub">{t('login.subtitle')}</p>

          <label className="field-label">{t('login.idLabel')}</label>
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

          <label className="field-label">{t('login.password')}</label>
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
              <span>{t('login.remember')}</span>
            </label>
            <span className="link-faint">{t('login.forgot')}</span>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-accent btn-block login-submit" disabled={busy}>
            {busy ? t('login.connecting') : t('login.submit')} <Arrow size={18} />
          </button>

          <div className="login-note">
            {noteParts[0]}<strong>{ADMIN_NAME}</strong>{noteParts[1]}
          </div>
        </form>
      </div>
    </div>
  )
}
