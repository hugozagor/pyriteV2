import { Link } from 'react-router-dom'
import Thumbnail from './Thumbnail'
import Avatar from './Avatar'
import { Verified } from './icons'
import { formatViews, timeAgo } from '../format'

// Standard feed card: thumbnail on top, uploader avatar + meta below.
export default function VideoCard({ video, showAvatar = true }) {
  return (
    <Link to={`/watch/${video.id}`} className="vcard">
      <Thumbnail video={video} live={video.live} />
      <div className="vcard-body">
        {showAvatar && (
          <Link
            to={`/channel/${video.uploader?.id}`}
            className="vcard-avatar"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar user={video.uploader} size={36} />
          </Link>
        )}
        <div className="vcard-meta">
          <h3 className="vcard-title">{video.title}</h3>
          <div className="vcard-channel">
            {video.uploader?.displayName}
            <Verified size={13} className="badge" />
          </div>
          <div className="vcard-stats">
            {video.live
              ? `${formatViews(video.views)} · en direct`
              : `${formatViews(video.views)} · ${timeAgo(video.createdAt)}`}
          </div>
        </div>
      </div>
    </Link>
  )
}
