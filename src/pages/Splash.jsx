import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Splash.css'

export default function Splash() {
  const navigate = useNavigate()
  return (
    <div className="splash">
      <div className="splash-content">
        <div className="splash-logo">⚡</div>
        <h1 className="splash-title">EE Project Hub</h1>
        <p className="splash-tagline">Learn • Build • Share • Preserve<br />Electrical Engineering Projects</p>
        <p className="splash-sub">Free • Open • Community-Driven — Not another paid platform</p>
        <div className="splash-btns">
          <button className="btn-primary" onClick={() => navigate('/auth?mode=signup')}>Get Started</button>
          <button className="btn-outline" onClick={() => navigate('/auth?mode=login')}>Login</button>
        </div>
        <div className="splash-features">
          {['100% Free', 'Upload Projects', 'Ask Doubts', 'College Archives', 'Consult Experts', 'Preserve Work'].map(f => (
            <div key={f} className="feature-chip">✅ {f}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
