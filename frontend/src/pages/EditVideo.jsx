import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import { useI18n, LANGUAGES, CATEGORY_VALUES } from '../i18n'
import Thumbnail from '../components/Thumbnail'
import { formatDuration } from '../format'

export default function EditVideo() {
  const { id } = useParams()
  const { t, tc } = useI18n()
  const navigate = useNavigate()
  const thumbInput = useRef(null)
  const [video, setVideo] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [category, setCategory] = useState('Océan')
  const [language, setLanguage] = useState('fr')
  const [featured, setFeatured] = useState(false)
  const [newThumb, setNewThumb] = useState(null)
  const [newThumbPreview, setNewThumbPreview] = useState(null)
  const [removeThumb, setRemoveThumb] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    api.video(id)
      .then((v) => {
        setVideo(v)
        setTitle(v.title || '')
        setDescription(v.description || '')
        setHashtags((v.hashtags || '').replace(/#/g, ''))
        setCategory(v.category || 'Océan')
        setLanguage(v.language || 'fr')
        setFeatured(!!v.featured)
      })
      .catch((e) => setLoadError(e.message))
  }, [id])

  const pickThumb = (f) => {
    if (!f) return
    setNewThumb(f)
    setNewThumbPreview(URL.createObjectURL(f))
    setRemoveThumb(false)
  }

  const clearThumb = () => {
    setNewThumb(null)
    setNewThumbPreview(null)
    setRemoveThumb(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError(t('upload.errTitle')); return }
    setError('')
    setBusy(true)
    try {
      const form = new FormData()
      form.append('title', title.trim())
      form.append('description', description)
      form.append('hashtags', hashtags)
      form.append('category', category)
      form.append('language', language)
      form.append('featured', String(featured))
      if (newThumb) form.append('thumbnail', newThumb)
      else if (removeThumb) form.append('removeThumbnail', 'true')
      const updated = await api.editVideo(id, form)
      navigate(`/watch/${updated.id}`)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (loadError) return <div className="page"><div className="empty">{loadError}</div></div>
  if (!video) return <div className="page"><div className="watch-skeleton" /></div>

  const categories = CATEGORY_VALUES.includes(category) || !category ? CATEGORY_VALUES : [category, ...CATEGORY_VALUES]
  const currentThumb = removeThumb ? null : (newThumbPreview || video.thumbnailUrl)

  return (
    <div className="page upload">
      <div className="upload-head">
        <h1>{t('edit.title')}</h1>
        <p>{t('edit.subtitle')}</p>
      </div>

      <form className="upload-form" onSubmit={submit}>
        <div className="upload-cols">
          <div className="upload-left">
            <div className="edit-preview">
              {currentThumb ? (
                <img src={currentThumb} alt="" className="edit-thumb-img" />
              ) : (
                <Thumbnail video={{ ...video, thumbnailUrl: null }} duration={false} />
              )}
              <span className="edit-duration">{formatDuration(video.durationSeconds)}</span>
            </div>
            <input ref={thumbInput} type="file" accept="image/*" hidden onChange={(e) => pickThumb(e.target.files[0])} />
            <div className="edit-thumb-actions">
              <button type="button" className="btn btn-ghost" onClick={() => thumbInput.current?.click()}>
                {t('edit.changeThumb')}
              </button>
              {(video.thumbnailUrl || newThumbPreview) && !removeThumb && (
                <button type="button" className="btn btn-ghost danger" onClick={clearThumb}>{t('edit.removeThumb')}</button>
              )}
            </div>
            <p className="muted small">{t('edit.originalKept')}</p>
          </div>

          <div className="upload-right">
            <label className="field-label">{t('upload.fieldTitle')}</label>
            <div className="field plain"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} /></div>

            <label className="field-label">{t('upload.description')}</label>
            <textarea className="field-area" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

            <label className="field-label">{t('upload.tags')}</label>
            <div className="field plain"><input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="apnée méditerranée freediving" /></div>

            <div className="upload-row2">
              <div className="upload-field">
                <label className="field-label">{t('upload.category')}</label>
                <div className="field plain">
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {categories.map((c) => <option key={c} value={c}>{tc(c)}</option>)}
                  </select>
                </div>
              </div>
              <div className="upload-field">
                <label className="field-label">{t('upload.language')}</label>
                <div className="field plain">
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <label className="check big">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <span>{t('upload.featured')}</span>
            </label>

            {error && <div className="login-error">{error}</div>}

            <div className="upload-actions">
              <Link to={`/watch/${id}`} className="btn btn-ghost">{t('common.cancel')}</Link>
              <button type="submit" className="btn btn-accent" disabled={busy}>
                {busy ? t('edit.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
