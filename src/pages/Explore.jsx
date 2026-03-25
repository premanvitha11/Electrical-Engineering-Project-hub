import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects } from '../api/client'
import './Explore.css'

const SUBJECTS    = ['All', 'Machines', 'Power', 'Control', 'Electronics']
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Advanced']
const SUBJECT_COLORS = { Power: '#1a237e', Machines: '#b71c1c', Control: '#4a148c', Electronics: '#1b5e20' }

export default function Explore() {
  const [projects, setProjects]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [subject, setSubject]       = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [search, setSearch]         = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [subject, difficulty])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = {}
      if (subject !== 'All')    params.subject    = subject
      if (difficulty !== 'All') params.difficulty = difficulty
      if (search)               params.search     = search
      const data = await getProjects(params)
      setProjects(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProjects()
  }

  return (
    <div className="explore">
      <h1>Explore Projects</h1>

      <form className="search-bar-explore" onSubmit={handleSearch}>
        <input
          placeholder="Search projects by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className="filters">
        <div className="filter-group">
          <span className="filter-label">Subject</span>
          <div className="chips">
            {SUBJECTS.map(s => (
              <button key={s} className={`chip ${subject === s ? 'active' : ''}`} onClick={() => setSubject(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Difficulty</span>
          <div className="chips">
            {DIFFICULTIES.map(d => (
              <button key={d} className={`chip ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">⏳ Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p>🔍 No approved projects found yet.</p>
          <p>Be the first to <span onClick={() => navigate('/upload')}>upload a project →</span></p>
        </div>
      ) : (
        <>
          <p className="result-count">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
          <div className="projects-grid">
            {projects.map(p => {
              const color = SUBJECT_COLORS[p.subject] || '#1a237e'
              const author = p.author?.name || 'Unknown'
              const role   = p.author?.role || ''
              const college = p.author?.college || p.college || ''
              return (
                <div key={p._id} className="project-card" onClick={() => navigate(`/project/${p._id}`)}>
                  <div className="project-thumb" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                    {p.files?.images?.[0]
                      ? <img src={`http://localhost:5000${p.files.images[0].path}`} alt={p.title} className="thumb-real-img" />
                      : <span className="thumb-icon">⚡</span>
                    }
                  </div>
                  <div className="project-body">
                    <h3>{p.title}</h3>
                    <p className="project-meta">{author}{role ? ` • ${role}` : ''}{college ? ` • ${college}` : ''}</p>
                    <div className="project-footer">
                      <span className={`diff-badge ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                      <span className="subject-badge">{p.subject}</span>
                      <span className="rating">⭐ {p.rating || '—'}</span>
                      <button className="view-btn" onClick={e => { e.stopPropagation(); navigate(`/project/${p._id}`) }}>View →</button>
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
