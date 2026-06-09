import { useState } from 'react'
import { useAuth } from '../auth'
import { api } from '../api'
import Avatar from '../components/Avatar'
import { Shield, Check, Lock, Eye } from '../components/icons'

const AVATAR_COLORS = ['#2bb3d6', '#4a73c4', '#3fc0b1', '#6a64c9', '#d68a4a', '#d6566b', '#5aa860', '#8a6fd0']

export default function Settings() {
  const { user, setUser } = useAuth()

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
      setProfileMsg('Profil mis à jour.')
    } catch (err) {
      setProfileErr(err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setPwMsg(''); setPwErr('')
    if (newPassword.length < 6) { setPwErr('Le nouveau mot de passe doit faire au moins 6 caractères.'); return }
    if (newPassword !== confirm) { setPwErr('La confirmation ne correspond pas.'); return }
    setSavingPw(true)
    try {
      await api.changePassword(currentPassword, newPassword)
      setPwMsg('Mot de passe modifié.')
      setCurrentPassword(''); setNewPassword(''); setConfirm('')
    } catch (err) {
      setPwErr(err.message)
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="page settings">
      <h1>Paramètres</h1>

      {/* Profile */}
      <form className="settings-card" onSubmit={saveProfile}>
        <div className="settings-id">
          <Avatar user={preview} size={72} />
          <div>
            <h2>{displayName || user?.displayName}</h2>
            <div className="muted">@{user?.username}
              {user?.role === 'ADMIN' && <span className="pill pill-admin" style={{ marginLeft: 10 }}><Shield size={14} /> Administrateur</span>}
            </div>
          </div>
        </div>

        <h3 className="settings-section">Informations du profil</h3>
        <div className="settings-form-grid">
          <div>
            <label className="field-label">Nom affiché</label>
            <div className="field plain"><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} required /></div>
          </div>
          <div>
            <label className="field-label">E-mail</label>
            <div className="field plain"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          </div>
          <div>
            <label className="field-label">Nom d'utilisateur (non modifiable)</label>
            <div className="field plain disabled"><input value={`@${user?.username}`} disabled /></div>
          </div>
        </div>

        <label className="field-label">Bio</label>
        <textarea className="field-area" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Parlez un peu de vous…" maxLength={1000} />

        <label className="field-label">Couleur d'avatar</label>
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
            {savingProfile ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* Password */}
      <form className="settings-card" onSubmit={savePassword}>
        <h3 className="settings-section first">Mot de passe</h3>
        <div className="settings-form-grid">
          <div>
            <label className="field-label">Mot de passe actuel</label>
            <div className="field plain">
              <Lock size={17} className="field-ico" />
              <input type={showPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
            </div>
          </div>
          <div>
            <label className="field-label">Nouveau mot de passe</label>
            <div className="field plain">
              <Lock size={17} className="field-ico" />
              <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>
          </div>
          <div>
            <label className="field-label">Confirmer</label>
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
            {savingPw ? 'Modification…' : 'Changer le mot de passe'}
          </button>
        </div>
      </form>

      <div className="settings-card meta-card">
        <div className="settings-grid">
          <div><span>Rôle</span>{user?.role === 'ADMIN' ? 'Administrateur' : 'Membre'}</div>
          <div><span>Vidéos publiées</span>{user?.videoCount ?? 0}</div>
          <div><span>Membre depuis</span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}</div>
        </div>
      </div>
    </div>
  )
}
