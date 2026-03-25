import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects } from '../api/client'
import './Home.css'

const CARDS = [
  { icon: '🔍', title: 'Browse Projects', sub: 'Explore real EE projects', path: '/explore', color: '#e8eaf6' },
  { icon: '📤', title: 'Upload Project', sub: 'Share your work with peers', path: '/upload', color: '#e0f7fa' },
  { icon: '❓', title: 'Ask a Doubt', sub: 'Get answers from seniors & profs', path: '/doubt', color: '#fff8e1' },
  { icon: '🎓', title: 'Consult Experts', sub: 'Book 1-on-1 sessions', path: '/experts', color: '#fce4ec' },
  { icon: '🏛️', title: 'College Repository', sub: 'Year-wise project archives', path: '/college-repo', color: '#e8f5e9' },
]

export default function Home() {
  const navigate = useNavigate()
  const [projectCount, setProjectCount] = useState('...')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    getProjects().then(data => setProjectCount(data.length)).catch(() => setProjectCount(0))
  }, [])

  const firstName = user.name?.split(' ')[0] || 'Engineer'
  return (
    <div className="home">
      <div className="home-hero">
        <div>
          <h1>Welcome back, {firstName} 👋</h1>
          <p>What would you like to do today?</p>
        </div>
        <div className="home-stats">
          <div className="stat"><span className="stat-val">{projectCount}</span><span className="stat-label">Projects</span></div>
          <div className="stat"><span className="stat-val">4+</span><span className="stat-label">Colleges</span></div>
        </div>
      </div>

      <div className="search-bar">
        <span>🔎</span>
        <input placeholder="Search projects, subjects, tools, colleges…" />
      </div>

      <div className="cards-grid">
        {CARDS.map(c => (
          <div key={c.title} className="action-card" style={{ background: c.color }} onClick={() => navigate(c.path)}>
            <span className="card-icon">{c.icon}</span>
            <h3>{c.title}</h3>
            <p>{c.sub}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title">Trending Topics</h2>
      <div className="trend-row">
        {['Smart Grid', 'MPPT Solar', 'PID Control', 'Fault Detection', 'HVDC', 'Wireless Power', 'Power Electronics', 'Embedded Systems'].map(t => (
          <button key={t} className="trend-chip" onClick={() => navigate('/explore')}>⚡ {t}</button>
        ))}
      </div>
    </div>
  )
}
