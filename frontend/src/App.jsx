import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Watch from './pages/Watch'
import Channel from './pages/Channel'
import Upload from './pages/Upload'
import EditVideo from './pages/EditVideo'
import UsersAdmin from './pages/UsersAdmin'
import Settings from './pages/Settings'
import WatchLater from './pages/WatchLater'
import Playlists from './pages/Playlists'
import PlaylistDetail from './pages/PlaylistDetail'
import ComingSoon from './pages/ComingSoon'

function Protected({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <div className="boot-screen"><span className="spinner" /></div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}

function Shell({ children }) {
  return (
    <Protected>
      <Layout>{children}</Layout>
    </Protected>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Shell><Home /></Shell>} />
      <Route path="/explore" element={<Shell><Home /></Shell>} />
      <Route path="/watch/:id" element={<Shell><Watch /></Shell>} />
      <Route path="/channel/:id" element={<Shell><Channel /></Shell>} />
      <Route path="/settings" element={<Shell><Settings /></Shell>} />
      <Route path="/live" element={<Shell><ComingSoon title="En direct" subtitle="Les diffusions en direct arrivent bientôt sur Pyrite." /></Shell>} />
      <Route path="/history" element={<Shell><ComingSoon title="Historique" subtitle="Votre historique de visionnage apparaîtra ici." /></Shell>} />
      <Route path="/watch-later" element={<Shell><WatchLater /></Shell>} />
      <Route path="/liked" element={<Shell><ComingSoon title="Vidéos aimées" subtitle="Retrouvez ici les vidéos que vous avez aimées." /></Shell>} />
      <Route path="/playlists" element={<Shell><Playlists /></Shell>} />
      <Route path="/playlist/:id" element={<Shell><PlaylistDetail /></Shell>} />
      <Route path="/downloads" element={<Shell><ComingSoon title="Téléchargements" subtitle="Vos téléchargements hors-ligne s'afficheront ici." /></Shell>} />

      <Route path="/upload" element={<Protected adminOnly><Layout><Upload /></Layout></Protected>} />
      <Route path="/edit/:id" element={<Protected adminOnly><Layout><EditVideo /></Layout></Protected>} />
      <Route path="/admin/users" element={<Protected adminOnly><Layout><UsersAdmin /></Layout></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
