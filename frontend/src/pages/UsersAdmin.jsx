import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'
import Avatar from '../components/Avatar'
import { Plus, Trash, Shield, Users as UsersIcon } from '../components/icons'
import { timeAgo, formatCount } from '../format'

const EMPTY = { email: '', username: '', displayName: '', password: '', role: 'MEMBER', bio: '' }

export default function UsersAdmin() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => api.users().then(setUsers).catch((e) => setError(e.message)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const create = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      const created = await api.createUser(form)
      setUsers((u) => [...u, created])
      setForm(EMPTY)
      setShowForm(false)
      setNotice(`Compte créé pour ${created.displayName}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (u) => {
    if (!confirm(`Supprimer le compte de ${u.displayName} ?`)) return
    setError('')
    try {
      await api.deleteUser(u.id)
      setUsers((list) => list.filter((x) => x.id !== u.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page admin">
      <div className="admin-head">
        <div>
          <h1><UsersIcon size={26} /> Membres</h1>
          <p>Les accès à Pyrite sont créés exclusivement par l'administrateur.</p>
        </div>
        <button className="btn btn-accent" onClick={() => { setShowForm((s) => !s); setError('') }}>
          <Plus size={18} /> Inviter un membre
        </button>
      </div>

      {notice && <div className="banner ok">{notice}</div>}
      {error && <div className="banner err">{error}</div>}

      {showForm && (
        <form className="admin-form" onSubmit={create}>
          <div className="admin-form-grid">
            <div>
              <label className="field-label">Nom affiché</label>
              <div className="field plain"><input value={form.displayName} onChange={set('displayName')} placeholder="Marin Lefebvre" required /></div>
            </div>
            <div>
              <label className="field-label">Nom d'utilisateur</label>
              <div className="field plain"><input value={form.username} onChange={set('username')} placeholder="marin_82" required /></div>
            </div>
            <div>
              <label className="field-label">E-mail</label>
              <div className="field plain"><input type="email" value={form.email} onChange={set('email')} placeholder="marin@exemple.fr" required /></div>
            </div>
            <div>
              <label className="field-label">Mot de passe provisoire</label>
              <div className="field plain"><input value={form.password} onChange={set('password')} placeholder="6 caractères minimum" required minLength={6} /></div>
            </div>
            <div>
              <label className="field-label">Rôle</label>
              <div className="field plain">
                <select value={form.role} onChange={set('role')}>
                  <option value="MEMBER">Membre</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
            <button type="submit" className="btn btn-accent">Créer le compte</button>
          </div>
        </form>
      )}

      <div className="user-table">
        <div className="user-row head">
          <span>Membre</span><span>Rôle</span><span>Vidéos</span><span>Inscrit</span><span></span>
        </div>
        {loading ? (
          <div className="empty small">Chargement…</div>
        ) : users.map((u) => (
          <div key={u.id} className="user-row">
            <div className="user-cell">
              <Avatar user={u} size={40} />
              <div>
                <div className="user-name">{u.displayName} {u.id === me?.id && <span className="you">vous</span>}</div>
                <div className="user-mail">@{u.username} · {u.email}</div>
              </div>
            </div>
            <span>
              {u.role === 'ADMIN'
                ? <span className="pill pill-admin"><Shield size={14} /> Admin</span>
                : <span className="pill">Membre</span>}
            </span>
            <span className="user-num">{formatCount(u.videoCount)}</span>
            <span className="user-num">{timeAgo(u.createdAt)}</span>
            <span className="user-act">
              {u.id !== me?.id && (
                <button className="icon-btn danger" onClick={() => remove(u)} aria-label="Supprimer"><Trash size={18} /></button>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
