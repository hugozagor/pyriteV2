const TOKEN_KEY = 'pyrite_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, headers = {}, isForm = false } = {}) {
  const opts = { method, headers: { ...headers } }
  const token = getToken()
  if (token) opts.headers.Authorization = `Bearer ${token}`

  if (body !== undefined) {
    if (isForm) {
      opts.body = body
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
  }

  const res = await fetch(`/api${path}`, opts)
  if (res.status === 204) return null

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const message = data?.message || data?.error || `Erreur ${res.status}`
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  // auth
  login: (login, password) => request('/auth/login', { method: 'POST', body: { login, password } }),
  me: () => request('/auth/me'),

  // videos
  feed: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString()
    return request(`/videos${qs ? `?${qs}` : ''}`)
  },
  video: (id) => request(`/videos/${id}`),
  registerView: (id) => request(`/videos/${id}/view`, { method: 'POST' }),
  toggleLike: (id) => request(`/videos/${id}/like`, { method: 'POST' }),
  uploadVideo: (formData) => request('/videos', { method: 'POST', body: formData, isForm: true }),
  editVideo: (id, formData) => request(`/videos/${id}`, { method: 'PUT', body: formData, isForm: true }),
  updateVideo: (id, body) => request(`/videos/${id}`, { method: 'PATCH', body }),
  deleteVideo: (id) => request(`/videos/${id}`, { method: 'DELETE' }),

  // comments
  comments: (videoId) => request(`/videos/${videoId}/comments`),
  addComment: (videoId, text) => request(`/videos/${videoId}/comments`, { method: 'POST', body: { text } }),
  deleteComment: (videoId, commentId) =>
    request(`/videos/${videoId}/comments/${commentId}`, { method: 'DELETE' }),

  // library (watch-later / saved) — kind: 'watch-later' | 'saved'
  library: (kind) => request(`/library/${kind}`),
  addToLibrary: (kind, videoId) => request(`/library/${kind}/${videoId}`, { method: 'POST' }),
  removeFromLibrary: (kind, videoId) => request(`/library/${kind}/${videoId}`, { method: 'DELETE' }),

  // history
  history: () => request('/history'),
  removeFromHistory: (videoId) => request(`/history/${videoId}`, { method: 'DELETE' }),
  clearHistory: () => request('/history', { method: 'DELETE' }),

  // playlists
  playlists: (videoId) => request(`/playlists${videoId ? `?videoId=${videoId}` : ''}`),
  playlist: (id) => request(`/playlists/${id}`),
  createPlaylist: (name, videoId) => request('/playlists', { method: 'POST', body: { name, videoId } }),
  renamePlaylist: (id, name) => request(`/playlists/${id}`, { method: 'PATCH', body: { name } }),
  deletePlaylist: (id) => request(`/playlists/${id}`, { method: 'DELETE' }),
  addToPlaylist: (id, videoId) => request(`/playlists/${id}/videos/${videoId}`, { method: 'POST' }),
  removeFromPlaylist: (id, videoId) => request(`/playlists/${id}/videos/${videoId}`, { method: 'DELETE' }),

  // users
  user: (id) => request(`/users/${id}`),
  users: () => request('/users'),
  createUser: (body) => request('/users', { method: 'POST', body }),
  updateUser: (id, body) => request(`/users/${id}`, { method: 'PATCH', body }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
}
