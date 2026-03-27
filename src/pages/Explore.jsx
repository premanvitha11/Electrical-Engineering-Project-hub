import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, saveProject } from '../api/client'
import './Explore.css'

const SUBJECTS     = ['All', 'Machines', 'Power', 'Control', 'Electronics']
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Advanced']
const SUBJECT_COLORS = { Power: '#1a237e', Machines: '#b71c1c', Control: '#4a148c', Electronics: '#1b5e20' }

function SkeletonProjectCard() {
  return (
    <div className="project-card">
      <div className="skeleton" style={{ height: 160 }} />
      <div className="project-body">
        <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '70%', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ height: 24, width: 70 }} />
          <div className="skeleton" style={{ height: 24, width: 70 }} />
        </div>
      </div>
    </div>
  )
}

export default function Explore() {
  const [projects, setProjects]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [subject, setSubject]       = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [search, setSearch]         = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchProjects() }, [subject, difficulty])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = {}
      if (subject !== 'All')    params.subject    = subject
      if (difficulty !== 'All') params.difficulty = difficulty
      if (search)               params.search     = search
      setProjects(await getProjects(params))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleBookmark = async (e, id) => {
    e.stopPropagation()
    try {
      await saveProject(id)
      alert('🔖 Saved to your profile!')
    } catch (err) { alert(err.message) }
  }

  const handleShare = (e, id) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/project/${id}`)
    alert('🔗 Link copied to clipboard!')
  }

  return (
    <div className="explore">
      <h1>Explore Projects</h1>

      <form className="search-bar-explore" onSubmit={e => { e.preventDefault(); fetchProjects() }}>
        <input placeholder="Search projects by title..." value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit">Search</button>
      </form>

      <div className="filters">
        <div className="filter-group">
          <span className="filter-label">Subject</span>
          <div className="chips">
            {SUBJECTS.map(s => <button key={s} className={`chip ${subject === s ? 'active' : ''}`} onClick={() => setSubject(s)}>{s}</button>)}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Difficulty</span>
          <div className="chips">
            {DIFFICULTIES.map(d => <button key={d} className={`chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>)}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="projects-grid">
          {[1,2,3,4,5,6].map(i => <SkeletonProjectCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p>🔍 No projects found.</p>
          <p>Be the first to <span onClick={() => navigate('/upload')}>upload a project →</span></p>
        </div>
      ) : (
        <>
          <p className="result-count">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
          <div className="projects-grid">
            {projects.map(p => {
              const color   = SUBJECT_COLORS[p.subject] || '#1a237e'
              const author  = p.author?.name || 'Unknown'
              const role    = p.author?.role || ''
              const college = p.author?.college || p.college || ''
              return (
                <div key={p._id} className="project-card" onClick={() => navigate(`/project/${p._id}`)}>
                  <div className="project-thumb" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                    <span className="thumb-icon">⚡</span>
                  </div>
                  <div className="project-body">
                    <h3>{p.title}</h3>
                    <p className="project-meta">{author}{role ? ` • ${role}` : ''}{college ? ` • ${college}` : ''}</p>
                    <div className="project-footer">
                      <span className={`diff-badge ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                      <span className="subject-badge">{p.subject}</span>
                      <span className="rating">⭐ {p.rating || '—'}</span>
                      <span className="views">👁 {p.views || 0}</span>
                    </div>
                    <div className="card-actions">
                      <button className="view-btn" onClick={e => { e.stopPropagation(); navigate(`/project/${p._id}`) }}>View →</button>
                      <button className="action-icon-btn" onClick={e => handleBookmark(e, p._id)} title="Save">🔖</button>
                      <button className="action-icon-btn" onClick={e => handleShare(e, p._id)} title="Share">🔗</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
