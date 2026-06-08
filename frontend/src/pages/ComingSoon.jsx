import { Drop } from '../components/icons'

export default function ComingSoon({ title, subtitle }) {
  return (
    <div className="page coming">
      <div className="coming-card">
        <span className="coming-icon"><Drop size={34} /></span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}
