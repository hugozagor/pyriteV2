import { useState } from 'react'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import { api } from '../api'
import Avatar from '../components/Avatar'
import { Shield, Check, Lock, Eye } from '../components/icons'

const AVATAR_COLORS = ['#2bb3d6', '#4a73c4', '#3fc0b1', '#6a64c9', '#d68a4a', '#d6566b', '#5aa860', '#8a6fd0']

export default function Settings() {
  const { user, setUser } = useAuth()
  const { t, lang } = useI18n()

  // --- profile form ---
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#2bb3d6')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')

  // --- password form ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')

  const preview = { displayName, username: user?.username, avatarColor }

  const saveProfile = async (e) => {
    e.preventDefault()
    setProfileMsg(''); setProfileErr(''); setSavingProfile(true)
    try {
      const updated = await api.updateProfile({ displayName: displayName.trim(), email: email.trim(), bio, avatarColor })
      setUser(updated)
      setProfileMsg(t('settings.profileUpdated'))
    } catch (err) {
      setProfileErr(err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setPwMsg(''); setPwErr('')
    if (newPassword.length < 6) { setPwErr(t('settings.pwTooShort')); return }
    if (newPassword !== confirm) { setPwErr(t('settings.pwMismatch')); return }
    setSavingPw(true)
    try {
      await api.changePassword(currentPassword, newPassword)
      setPwMsg(t('settings.passwordChanged'))
      setCurrentPassword(''); setNewPassword(''); setConfirm('')
    } catch (err) {
      setPwErr(err.message)
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="page settings">
      <h1>{t('settings.title')}</h1>

      {/* Profile */}
      <form className="settings-card" onSubmit={saveProfile}>
        <div className="settings-id">
          <Avatar user={preview} size={72} />
          <div>
            <h2>{displayName || user?.displayName}</h2>
            <div className="muted">@{user?.username}
              {user?.role === 'ADMIN' && <span className="pill pill-admin" style={{ marginLeft: 10 }}><Shield size={14} /> {t('common.administrator')}</span>}
            </div>
          </div>
        </div>

        <h3 className="settings-section">{t('settings.profileSection')}</h3>
        <div className="settings-form-grid">
          <div>
            <label className="field-label">{t('settings.displayName')}</label>
            <div className="field plain"><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} required /></div>
          </div>
          <div>
            <label className="field-label">{t('settings.email')}</label>
            <div className="field plain"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          </div>
          <div>
            <label className="field-label">{t('settings.username')}</label>
            <div className="field plain disabled"><input value={`@${user?.username}`} disabled /></div>
          </div>
        </div>

        <label className="field-label">{t('settings.bio')}</label>
        <textarea className="field-area" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder={t('settings.bioPh')} maxLength={1000} />

        <label className="field-label">{t('settings.avatarColor')}</label>
        <div className="color-row">
          {AVATAR_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              className={`color-dot ${avatarColor.toLowerCase() === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setAvatarColor(c)}
              aria-label={c}
            >
              {avatarColor.toLowerCase() === c && <Check size={14} />}
            </button>
          ))}
        </div>

        {profileErr && <div className="login-error">{profileErr}</div>}
        {profileMsg && <div className="banner ok">{profileMsg}</div>}

        <div className="settings-actions">
          <button type="submit" className="btn btn-accent" disabled={savingProfile}>
            {savingProfile ? t('settings.saving') : t('settings.saveProfile')}
          </button>
        </div>
      </form>

      {/* Password */}
      <form className="settings-card" onSubmit={savePassword}>
        <h3 className="settings-section first">{t('settings.passwordSection')}</h3>
        <div className="settings-form-grid">
          <div>
            <label className="field-label">{t('settings.currentPassword')}</label>
            <div className="field plain">
              <Lock size={17} className="field-ico" />
              <input type={showPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
            </div>
          </div>
          <div>
            <label className="field-label">{t('settings.newPassword')}</label>
            <div className="field plain">
              <Lock size={17} className="field-ico" />
              <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>
          </div>
          <div>
            <label className="field-label">{t('settings.confirm')}</label>
            <div className="field plain">
              <Lock size={17} className="field-ico" />
              <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
              <button type="button" className="field-eye" onClick={() => setShowPw((s) => !s)} aria-label="Afficher"><Eye size={17} /></button>
            </div>
          </div>
        </div>

        {pwErr && <div className="login-error">{pwErr}</div>}
        {pwMsg && <div className="banner ok">{pwMsg}</div>}

        <div className="settings-actions">
          <button type="submit" className="btn btn-accent" disabled={savingPw}>
            {savingPw ? t('settings.changing') : t('settings.changePassword')}
          </button>
        </div>
      </form>

      <div className="settings-card meta-card">
        <div className="settings-grid">
          <div><span>{t('settings.role')}</span>{user?.role === 'ADMIN' ? t('common.administrator') : t('common.member')}</div>
          <div><span>{t('settings.published')}</span>{user?.videoCount ?? 0}</div>
          <div><span>{t('settings.memberSince')}</span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(lang) : '—'}</div>
        </div>
      </div>
    </div>
  )
}
