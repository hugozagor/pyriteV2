import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import Thumbnail from '../components/Thumbnail'
import { formatDuration } from '../format'

const CATEGORIES = ['Océan', 'Plongée', 'Lo-fi', 'Méditation', 'Pluie', 'Nature', 'Voile', 'Documentaires', 'Tech', 'Cuisine', 'Musique']

export default function EditVideo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const thumbInput = useRef(null)
  const [video, setVideo] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [category, setCategory] = useState('Océan')
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
    if (!title.trim()) { setError('Le titre est obligatoire.'); return }
    setError('')
    setBusy(true)
    try {
      const form = new FormData()
      form.append('title', title.trim())
      form.append('description', description)
      form.append('hashtags', hashtags)
      form.append('category', category)
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

  const categories = CATEGORIES.includes(category) || !category ? CATEGORIES : [category, ...CATEGORIES]
  const currentThumb = removeThumb ? null : (newThumbPreview || video.thumbnailUrl)

  return (
    <div className="page upload">
      <div className="upload-head">
        <h1>Modifier la vidéo</h1>
        <p>Mettez à jour le titre, la description, les mots-clés, la catégorie ou la miniature.</p>
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
                Changer la miniature
              </button>
              {(video.thumbnailUrl || newThumbPreview) && !removeThumb && (
                <button type="button" className="btn btn-ghost danger" onClick={clearThumb}>Retirer</button>
              )}
            </div>
            <p className="muted small">Le fichier vidéo d'origine n'est pas modifié.</p>
          </div>

          <div className="upload-right">
            <label className="field-label">Titre</label>
            <div className="field plain"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} /></div>

            <label className="field-label">Description</label>
            <textarea className="field-area" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />

            <label className="field-label">Mots-clés (séparés par des espaces)</label>
            <div className="field plain"><input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="apnée méditerranée freediving" /></div>

            <label className="field-label">Catégorie</label>
            <div className="field plain">
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <label className="check big">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <span>Mettre à la une (affichée en tête de la chaîne)</span>
            </label>

            {error && <div className="login-error">{error}</div>}

            <div className="upload-actions">
              <Link to={`/watch/${id}`} className="btn btn-ghost">Annuler</Link>
              <button type="submit" className="btn btn-accent" disabled={busy}>
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
