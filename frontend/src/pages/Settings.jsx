import { useAuth } from '../auth'
import Avatar from '../components/Avatar'
import { Shield } from '../components/icons'

export default function Settings() {
  const { user } = useAuth()
  return (
    <div className="page settings">
      <h1>Paramètres</h1>
      <div className="settings-card">
        <div className="settings-id">
          <Avatar user={user} size={72} />
          <div>
            <h2>{user?.displayName}</h2>
            <div className="muted">@{user?.username} · {user?.email}</div>
            {user?.role === 'ADMIN' && <span className="pill pill-admin" style={{ marginTop: 8 }}><Shield size={14} /> Administrateur</span>}
          </div>
        </div>
        {user?.bio && <p className="settings-bio">{user.bio}</p>}
        <div className="settings-grid">
          <div><span>Rôle</span>{user?.role === 'ADMIN' ? 'Administrateur' : 'Membre'}</div>
          <div><span>Vidéos publiées</span>{user?.videoCount ?? 0}</div>
          <div><span>Membre depuis</span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}</div>
        </div>
        <p className="muted small">La modification du profil et la gestion des membres se font depuis le panneau d'administration.</p>
      </div>
    </div>
  )
}
