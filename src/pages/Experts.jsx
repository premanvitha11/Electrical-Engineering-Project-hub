import React, { useState, useEffect } from 'react'
import { getExperts } from '../api/client'
import './Experts.css'

export default function Experts() {
  const [experts, setExperts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExperts()
      .then(setExperts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const book = (name) => alert(`✅ Session request sent to ${name}! They will contact you soon.`)

  return (
    <div className="experts-page">
      <h1>🎓 Consult Experts</h1>
      <p className="experts-sub">Book 1-on-1 sessions with professors and senior engineers</p>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--subtext)' }}>⏳ Loading experts...</div>
      ) : experts.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--subtext)' }}>
          <p>No experts registered yet.</p>
          <p style={{ marginTop: 8, fontSize: 13 }}>Professors and seniors who sign up will appear here.</p>
        </div>
      ) : (
        <div className="experts-grid">
          {experts.map(e => {
            const initials = e.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'EE'
            return (
              <div key={e._id} className="expert-card">
                <div className="expert-avatar">{initials}</div>
                <div className="expert-info">
                  <h3>{e.name}</h3>
                  <p className="expert-role">{e.role}{e.college ? ` • ${e.college}` : ''}</p>
                  {e.expertise && <p className="expert-expertise">🔬 {e.expertise}</p>}
                </div>
                <div className="expert-slots">
                  <button className="slot-btn" onClick={() => book(e.name)}>📅 Book Session</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
