import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../api'
import { useI18n, LANGUAGES, CATEGORY_VALUES } from '../i18n'
import { Plus, Download } from '../components/icons'
import { formatDuration } from '../format'

export default function Upload() {
  const navigate = useNavigate()
  const { t, tc, lang } = useI18n()
  const fileInput = useRef(null)
  const [file, setFile] = useState(null)
  const [thumb, setThumb] = useState(null)
  const [thumbPreview, setThumbPreview] = useState(null)
  const [duration, setDuration] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [category, setCategory] = useState('Océan')
  const [language, setLanguage] = useState(lang)
  const [featured, setFeatured] = useState(false)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const pickVideo = (f) => {
    if (!f) return
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.onloadedmetadata = () => { setDuration(Math.round(v.duration) || 0); URL.revokeObjectURL(v.src) }
    v.src = URL.createObjectURL(f)
  }

  const pickThumb = (f) => {
    if (!f) return
    setThumb(f)
    setThumbPreview(URL.createObjectURL(f))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!file) { setError(t('upload.errFile')); return }
    if (!title.trim()) { setError(t('upload.errTitle')); return }
    setError('')
    setBusy(true)
    setProgress(0)

    const form = new FormData()
    form.append('video', file)
    if (thumb) form.append('thumbnail', thumb)
    form.append('title', title.trim())
    form.append('description', description)
    form.append('hashtags', hashtags)
    form.append('category', category)
    form.append('language', language)
    form.append('durationSeconds', String(duration))
    form.append('featured', String(featured))

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/videos')
    xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`)
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100))
    }
    xhr.onload = () => {
      setBusy(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        navigate(`/watch/${JSON.parse(xhr.responseText).id}`)
      } else {
        try { setError(JSON.parse(xhr.responseText).message || t('upload.errSend')) }
        catch { setError(t('upload.errSend')) }
      }
    }
    xhr.onerror = () => { setBusy(false); setError(t('upload.errSend')) }
    xhr.send(form)
  }

  return (
    <div className="page upload">
      <div className="upload-head">
        <h1>{t('upload.title')}</h1>
        <p>{t('upload.subtitle')}</p>
      </div>

      <form className="upload-form" onSubmit={submit}>
        <div className="upload-cols">
          <div className="upload-left">
            <div
              className={`dropzone ${file ? 'has-file' : ''}`}
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); pickVideo(e.dataTransfer.files[0]) }}
            >
              <input ref={fileInput} type="file" accept="video/*" hidden onChange={(e) => pickVideo(e.target.files[0])} />
              {file ? (
                <div className="dropzone-file">
                  <div className="dropzone-badge"><Download size={22} /></div>
                  <div>
                    <strong>{file.name}</strong>
                    <span>{(file.size / 1024 / 1024).toFixed(1)} MB · {formatDuration(duration)}</span>
                  </div>
                </div>
              ) : (
                <div className="dropzone-empty">
                  <span className="dropzone-icon"><Plus size={28} /></span>
                  <strong>{t('upload.drop')}</strong>
                  <span>{t('upload.dropHint')}</span>
                </div>
              )}
            </div>

            {busy && (
              <div className="upload-progress">
                <div className="upload-bar"><span style={{ width: `${progress}%` }} /></div>
                <span>{progress}%</span>
              </div>
            )}
          </div>

          <div className="upload-right">
            <label className="field-label">{t('upload.fieldTitle')}</label>
            <div className="field plain">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('upload.titlePh')} maxLength={120} />
            </div>

            <label className="field-label">{t('upload.description')}</label>
            <textarea className="field-area" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('upload.descriptionPh')} rows={4} />

            <label className="field-label">{t('upload.tags')}</label>
            <div className="field plain">
              <input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="apnée méditerranée freediving" />
            </div>

            <div className="upload-row2">
              <div className="upload-field">
                <label className="field-label">{t('upload.category')}</label>
                <div className="field plain">
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORY_VALUES.map((c) => <option key={c} value={c}>{tc(c)}</option>)}
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

            <label className="field-label">{t('upload.thumbnail')}</label>
            <label className="thumb-pick">
              <input type="file" accept="image/*" hidden onChange={(e) => pickThumb(e.target.files[0])} />
              {thumbPreview ? <img src={thumbPreview} alt="" /> : <span>{t('upload.chooseImage')}</span>}
            </label>

            <label className="check big">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <span>{t('upload.featured')}</span>
            </label>

            {error && <div className="login-error">{error}</div>}

            <div className="upload-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} disabled={busy}>{t('common.cancel')}</button>
              <button type="submit" className="btn btn-accent" disabled={busy}>
                {busy ? t('upload.sending') : t('upload.publish')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
