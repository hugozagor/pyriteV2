import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'
import { useI18n } from '../i18n'
import Avatar from '../components/Avatar'
import { Plus, Trash, Shield, Users as UsersIcon } from '../components/icons'
import { timeAgo, formatCount } from '../format'

const EMPTY = { email: '', username: '', displayName: '', password: '', role: 'MEMBER', bio: '' }

export default function UsersAdmin() {
  const { user: me } = useAuth()
  const { t } = useI18n()
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
      setNotice(t('admin.created', { name: created.displayName }))
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (u) => {
    if (!confirm(t('admin.confirmDelete', { name: u.displayName }))) return
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
          <h1><UsersIcon size={26} /> {t('admin.title')}</h1>
          <p>{t('admin.subtitle')}</p>
        </div>
        <button className="btn btn-accent" onClick={() => { setShowForm((s) => !s); setError('') }}>
          <Plus size={18} /> {t('admin.invite')}
        </button>
      </div>

      {notice && <div className="banner ok">{notice}</div>}
      {error && <div className="banner err">{error}</div>}

      {showForm && (
        <form className="admin-form" onSubmit={create}>
          <div className="admin-form-grid">
            <div>
              <label className="field-label">{t('admin.displayName')}</label>
              <div className="field plain"><input value={form.displayName} onChange={set('displayName')} placeholder="Marin Lefebvre" required /></div>
            </div>
            <div>
              <label className="field-label">{t('admin.username')}</label>
              <div className="field plain"><input value={form.username} onChange={set('username')} placeholder="marin_82" required /></div>
            </div>
            <div>
              <label className="field-label">{t('admin.email')}</label>
              <div className="field plain"><input type="email" value={form.email} onChange={set('email')} placeholder="marin@exemple.fr" required /></div>
            </div>
            <div>
              <label className="field-label">{t('admin.tempPassword')}</label>
              <div className="field plain"><input value={form.password} onChange={set('password')} placeholder={t('admin.passwordHint')} required minLength={6} /></div>
            </div>
            <div>
              <label className="field-label">{t('admin.role')}</label>
              <div className="field plain">
                <select value={form.role} onChange={set('role')}>
                  <option value="MEMBER">{t('admin.roleMember')}</option>
                  <option value="ADMIN">{t('admin.roleAdmin')}</option>
                </select>
              </div>
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-accent">{t('admin.createAccount')}</button>
          </div>
        </form>
      )}

      <div className="user-table">
        <div className="user-row head">
          <span>{t('admin.colMember')}</span><span>{t('admin.colRole')}</span><span>{t('admin.colVideos')}</span><span>{t('admin.colJoined')}</span><span></span>
        </div>
        {loading ? (
          <div className="empty small">{t('common.loading')}</div>
        ) : users.map((u) => (
          <div key={u.id} className="user-row">
            <div className="user-cell">
              <Avatar user={u} size={40} />
              <div>
                <div className="user-name">{u.displayName} {u.id === me?.id && <span className="you">{t('admin.you')}</span>}</div>
                <div className="user-mail">@{u.username} · {u.email}</div>
              </div>
            </div>
            <span>
              {u.role === 'ADMIN'
                ? <span className="pill pill-admin"><Shield size={14} /> {t('admin.roleAdmin')}</span>
                : <span className="pill">{t('admin.roleMember')}</span>}
            </span>
            <span className="user-num">{formatCount(u.videoCount)}</span>
            <span className="user-num">{timeAgo(u.createdAt)}</span>
            <span className="user-act">
              {u.id !== me?.id && (
                <button className="icon-btn danger" onClick={() => remove(u)} aria-label={t('common.delete')}><Trash size={18} /></button>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
