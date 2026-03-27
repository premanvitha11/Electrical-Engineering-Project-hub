import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, getPopular, getRecent, saveProject } from '../api/client'
import { useTheme } from '../components/ThemeContext'
import './Home.css'

const SUBJECT_COLORS = { Power: '#1a237e', Machines: '#b71c1c', Control: '#4a148c', Electronics: '#1b5e20' }

const CARDS = [
  { icon: '🔍', title: 'Browse Projects', sub: 'Explore real EE projects', path: '/explore', lightColor: '#e8eaf6', darkColor: '#1e2a4a' },
  { icon: '📤', title: 'Upload Project',  sub: 'Share your work with peers', path: '/upload', lightColor: '#e0f7fa', darkColor: '#0d2d35' },
  { icon: '❓', title: 'Ask a Doubt',     sub: 'Get answers from seniors & profs', path: '/doubt', lightColor: '#fff8e1', darkColor: '#2d2500' },
  { icon: '🎓', title: 'Consult Experts', sub: 'Book 1-on-1 sessions', path: '/experts', lightColor: '#fce4ec', darkColor: '#2d0d1a' },
  { icon: '🏛️', title: 'College Repo',   sub: 'Year-wise project archives', path: '/college-repo', lightColor: '#e8f5e9', darkColor: '#0d2d15' },
]

function ProjectMiniCard({ p, onBookmark }) {
  const navigate = useNavigate()
  const color = SUBJECT_COLORS[p.subject] || '#1a237e'
  return (
    <div className="mini-card" onClick={() => navigate(`/project/${p._id}`)}>
      <div className="mini-thumb" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
        <span>⚡</span>
      </div>
      <div className="mini-body">
        <p className="mini-title">{p.title}</p>
        <p className="mini-meta">{p.subject} • {p.difficulty}</p>
        <div className="mini-footer">
          <span>👁 {p.views || 0}</span>
          <span>⭐ {p.rating || '—'}</span>
          <button className="bookmark-btn" onClick={e => { e.stopPropagation(); onBookmark(p._id) }} title="Bookmark">🔖</button>
          <button className="share-btn" onClick={e => {
            e.stopPropagation()
            navigator.clipboard.writeText(`${window.location.origin}/project/${p._id}`)
            alert('🔗 Link copied!')
          }} title="Share">🔗</button>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="mini-card">
      <div className="skeleton" style={{ height: 80 }} />
      <div className="mini-body">
        <div className="skeleton" style={{ height: 14, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '60%' }} />
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [search, setSearch]       = useState('')
  const [results, setResults]     = useState([])
  const [searching, setSearching] = useState(false)
  const [popular, setPopular]     = useState([])
  const [recent, setRecent]       = useState([])
  const [loadingPop, setLoadingPop] = useState(true)
  const [loadingRec, setLoadingRec] = useState(true)
  const [totalCount, setTotalCount] = useState('...')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const firstName = user.name?.split(' ')[0] || 'Engineer'

  useEffect(() => {
    getPopular().then(d => { setPopular(d); setLoadingPop(false) }).catch(() => setLoadingPop(false))
    getRecent().then(d => { setRecent(d); setLoadingRec(false) }).catch(() => setLoadingRec(false))
    getProjects().then(d => setTotalCount(d.length)).catch(() => setTotalCount(0))
  }, [])

  useEffect(() => {
    if (!search.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await getProjects({ search })
        setResults(data)
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleBookmark = async (id) => {
    try {
      await saveProject(id)
      alert('🔖 Project saved to your profile!')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="home">
      <div className="home-hero">
        <div>
          <h1>Welcome back, {firstName} 👋</h1>
          <p>What would you like to do today?</p>
        </div>
        <div className="home-stats">
          <div className="stat"><span className="stat-val">{totalCount}</span><span className="stat-label">Projects</span></div>
          <div className="stat"><span className="stat-val">4+</span><span className="stat-label">Colleges</span></div>
        </div>
      </div>

      {/* Live Search */}
      <div className="search-wrap">
        <div className="search-bar">
          <span>🔎</span>
          <input
            placeholder="Search projects, subjects, tools…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
        </div>
        {search && (
          <div className="search-results">
            {searching ? (
              <p className="search-hint">Searching...</p>
            ) : results.length === 0 ? (
              <p className="search-hint">No projects found for "{search}"</p>
            ) : (
              results.map(p => (
                <div key={p._id} className="search-result-item" onClick={() => { navigate(`/project/${p._id}`); setSearch('') }}>
                  <span className="sr-icon">⚡</span>
                  <div>
                    <p className="sr-title">{p.title}</p>
                    <p className="sr-meta">{p.subject} • {p.difficulty} • {p.author?.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="cards-grid">
        {CARDS.map(c => (
          <div key={c.title} className="action-card" style={{ background: dark ? c.darkColor : c.lightColor }} onClick={() => navigate(c.path)}>
            <span className="card-icon">{c.icon}</span>
            <h3>{c.title}</h3>
            <p>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Most Popular */}
      <div className="section-header">
        <h2 className="section-title">🔥 Most Popular</h2>
        <button className="see-all" onClick={() => navigate('/explore')}>See all →</button>
      </div>
      <div className="mini-grid">
        {loadingPop ? [1,2,3,4].map(i => <SkeletonCard key={i} />) :
          popular.length === 0 ? <p className="no-data">No projects yet</p> :
          popular.map(p => <ProjectMiniCard key={p._id} p={p} onBookmark={handleBookmark} />)
        }
      </div>

      {/* Recently Uploaded */}
      <div className="section-header">
        <h2 className="section-title">🆕 Recently Uploaded</h2>
        <button className="see-all" onClick={() => navigate('/explore')}>See all →</button>
      </div>
      <div className="mini-grid">
        {loadingRec ? [1,2,3,4].map(i => <SkeletonCard key={i} />) :
          recent.length === 0 ? <p className="no-data">No projects yet</p> :
          recent.map(p => <ProjectMiniCard key={p._id} p={p} onBookmark={handleBookmark} />)
        }
      </div>

      {/* Trending Topics */}
      <h2 className="section-title" style={{ marginTop: 28 }}>⚡ Trending Topics</h2>
      <div className="trend-row">
        {['Smart Grid', 'MPPT Solar', 'PID Control', 'Fault Detection', 'HVDC', 'Wireless Power', 'Power Electronics', 'Embedded Systems'].map(t => (
          <button key={t} className="trend-chip" onClick={() => navigate(`/explore?search=${t}`)}>⚡ {t}</button>
        ))}
      </div>
    </div>
  )
}
