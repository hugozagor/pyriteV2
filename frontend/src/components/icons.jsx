// Lightweight inline SVG icon set (stroke-based, currentColor).
const s = (props) => ({
  width: props.size || 20,
  height: props.size || 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: props.strokeWidth || 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

export const Drop = ({ size = 24, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2.5c3.6 4.2 6.5 7.7 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 10.2 8.4 6.7 12 2.5z" />
  </svg>
)
export const Menu = (p) => (<svg {...s(p)} {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>)
export const Search = (p) => (<svg {...s(p)} {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>)
export const Arrow = (p) => (<svg {...s(p)} {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>)
export const Bell = (p) => (<svg {...s(p)} {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>)
export const Moon = (p) => (<svg {...s(p)} {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>)
export const Sun = (p) => (<svg {...s(p)} {...p}><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.5" y1="4.5" x2="6.5" y2="6.5"/><line x1="17.5" y1="17.5" x2="19.5" y2="19.5"/><line x1="4.5" y1="19.5" x2="6.5" y2="17.5"/><line x1="17.5" y1="6.5" x2="19.5" y2="4.5"/></svg>)
export const Home = (p) => (<svg {...s(p)} {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>)
export const Compass = (p) => (<svg {...s(p)} {...p}><circle cx="12" cy="12" r="9"/><polygon points="16 8 14 14 8 16 10 10 16 8"/></svg>)
export const Live = (p) => (<svg {...s(p)} {...p}><circle cx="12" cy="12" r="2.5"/><path d="M7.5 7.5a6 6 0 0 0 0 9M16.5 7.5a6 6 0 0 1 0 9"/><path d="M4.5 4.5a10 10 0 0 0 0 15M19.5 4.5a10 10 0 0 1 0 15"/></svg>)
export const History = (p) => (<svg {...s(p)} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 4 3 8 7 8"/><polyline points="12 8 12 12 15 14"/></svg>)
export const Clock = (p) => (<svg {...s(p)} {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>)
export const ThumbUp = (p) => (<svg {...s(p)} {...p}><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"/><path d="M7 10l4-7a2.2 2.2 0 0 1 3 2v3h4.5a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17.1 21H7"/></svg>)
export const ThumbDown = (p) => (<svg {...s(p)} {...p}><path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1z"/><path d="M17 14l-4 7a2.2 2.2 0 0 1-3-2v-3H5.5a2 2 0 0 1-2-2.4l1.4-7A2 2 0 0 1 6.9 3H17"/></svg>)
export const Playlist = (p) => (<svg {...s(p)} {...p}><line x1="3" y1="6" x2="15" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="11" y2="18"/><polygon points="17 10 22 13 17 16" fill="currentColor" stroke="none"/></svg>)
export const Download = (p) => (<svg {...s(p)} {...p}><path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><path d="M5 20h14"/></svg>)
export const Settings = (p) => (<svg {...s(p)} {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.1a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 2.3 5.3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H7a1.7 1.7 0 0 0 1-1.5V1a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V7a1.7 1.7 0 0 0 1.5 1H23a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>)
export const Logout = (p) => (<svg {...s(p)} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>)
export const Plus = (p) => (<svg {...s(p)} {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)
export const Share = (p) => (<svg {...s(p)} {...p}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><polyline points="8 7 12 3 16 7"/><line x1="12" y1="3" x2="12" y2="15"/></svg>)
export const Bookmark = (p) => (<svg {...s(p)} {...p}><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>)
export const More = (p) => (<svg {...s(p)} {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>)
export const Play = ({ size = 22, ...p }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5.5v13l11-6.5z"/></svg>)
export const Verified = ({ size = 16, ...p }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l2.4 1.8 3-.3 1 2.9 2.6 1.6-1 2.9 1 2.9-2.6 1.6-1 2.9-3-.3L12 22l-2.4-1.8-3 .3-1-2.9L3 16l1-2.9L3 10.2l2.6-1.6 1-2.9 3 .3z"/><path d="M8.5 12.2l2.3 2.3 4.5-4.7" fill="none" stroke="#0a1320" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>)
export const Shield = (p) => (<svg {...s(p)} {...p}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9.5 12l1.8 1.8L15 10"/></svg>)
export const Users = (p) => (<svg {...s(p)} {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M18 14.2a5.5 5.5 0 0 1 2.5 4.8"/></svg>)
export const Trash = (p) => (<svg {...s(p)} {...p}><polyline points="3 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>)
export const Eye = (p) => (<svg {...s(p)} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>)
export const Mail = (p) => (<svg {...s(p)} {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>)
export const Lock = (p) => (<svg {...s(p)} {...p}><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>)
export const Sort = (p) => (<svg {...s(p)} {...p}><line x1="4" y1="7" x2="20" y2="7"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="17" x2="15" y2="17"/></svg>)
export const Chevron = (p) => (<svg {...s(p)} {...p}><polyline points="6 9 12 15 18 9"/></svg>)
export const Pencil = (p) => (<svg {...s(p)} {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>)
export const Check = (p) => (<svg {...s(p)} {...p}><polyline points="20 6 9 17 4 12"/></svg>)
export const LinkIco = (p) => (<svg {...s(p)} {...p}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>)
export const BookmarkFill = ({ size = 19, ...p }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>)
