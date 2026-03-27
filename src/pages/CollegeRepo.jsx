import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getColleges, getCollegeProjects, registerCollege } from '../api/client'
import './CollegeRepo.css'

export default function CollegeRepo() {
  const [colleges, setColleges]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [year, setYear]           = useState(null)
  const [projects, setProjects]   = useState([])
  const [projLoading, setProjLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [regForm, setRegForm]     = useState({ name: '', dept: '', isPublic: true, adminEmail: '' })
  const [regLoading, setRegLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchColleges() }, [])

  const fetchColleges = async () => {
    try {
      const data = await getColleges()
      setColleges(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectYear = async (college, y) => {
    setYear(y)
    setSelected(college)
    setProjLoading(true)
    try {
      const data = await getCollegeProjects(college.name, y)
      setProjects(data)
    } catch (err) {
      console.error(err)
    } finally {
      setProjLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!regForm.name || !regForm.dept) return alert('College name and department are required')
    setRegLoading(true)
    try {
      await registerCollege(regForm)
      alert(`✅ ${regForm.name} registered successfully!`)
      setShowRegister(false)
      setRegForm({ name: '', dept: '', isPublic: true, adminEmail: '' })
      await fetchColleges()
    } catch (err) {
      alert(err.message)
    } finally {
      setRegLoading(false)
    }
  }

  // Year-level: show projects for selected college + year
  if (selected && year !== null) {
    return (
      <div className="repo-page">
        <button className="back-link" onClick={() => { setYear(null); setProjects([]) }}>
          ← {selected.name}
        </button>
        <h1>{year}-{String(year + 1).slice(2)} Academic Year Projects</h1>
        <p className="repo-sub">{selected.name} — {selected.dept}</p>

        {projLoading ? (
          <div className="repo-loading">⏳ Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="repo-empty">
            <p>📂 No approved projects found for {year} batch.</p>
            <button onClick={() => navigate('/upload')}>Upload a project →</button>
          </div>
        ) : (
          projects.map(p => (
            <div key={p._id} className="repo-project-row" onClick={() => navigate(`/project/${p._id}`)}>
              <div className="repo-proj-icon">⚡</div>
              <div>
                <p className="repo-proj-title">{p.title}</p>
                <p className="repo-proj-meta">{p.author?.name} • {p.subject} • {p.difficulty}</p>
              </div>
              <span className="repo-arrow">›</span>
            </div>
          ))
        )}
      </div>
    )
  }

  // College-level: show years for selected college
  if (selected) {
    const years = selected.years?.length > 0 ? selected.years : []

    return (
      <div className="repo-page">
        <button className="back-link" onClick={() => setSelected(null)}>← College Repository</button>
        <h1>{selected.name}</h1>
        <p className="repo-sub">{selected.dept} • {selected.count} project{selected.count !== 1 ? 's' : ''}</p>

        <div className={`visibility-badge ${selected.isPublic ? 'public' : 'private'}`}>
          {selected.isPublic ? '🌐 Public Repository — Accessible to all students' : '🔒 College-Only Repository — Restricted access'}
        </div>

        {years.length === 0 ? (
          <div className="repo-empty">
            <p>No projects uploaded yet for this college.</p>
            <p>Upload a project and set your college name to populate this repository.</p>
            <button onClick={() => navigate('/upload')}>Upload a project →</button>
          </div>
        ) : (
          <>
            <h2>Browse by Academic Year</h2>
            {years.map(y => (
              <div key={y} className="year-row" onClick={() => handleSelectYear(selected, y)}>
                <span className="year-icon">📁</span>
                <span className="year-label">{y}-{String(y + 1).slice(2)} Academic Year</span>
                <span className="repo-arrow">›</span>
              </div>
            ))}
          </>
        )}

        <div className="info-box">
          <p>📂 All uploaded projects are instantly published</p>
          <p>🎓 Helps juniors find guidance and inspiration</p>
          <p>🔍 Browse year-wise projects from your college</p>
        </div>
      </div>
    )
  }

  // Register form
  if (showRegister) {
    return (
      <div className="repo-page">
        <button className="back-link" onClick={() => setShowRegister(false)}>← College Repository</button>
        <h1>Register Your College</h1>
        <p className="repo-sub">Add your college to the EE Project Hub repository</p>
        <form className="register-form" onSubmit={handleRegister}>
          <label>College Name *</label>
          <input placeholder="e.g. NITK Surathkal" value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} />
          <label>Department *</label>
          <input placeholder="e.g. Electrical Engineering" value={regForm.dept} onChange={e => setRegForm(f => ({ ...f, dept: e.target.value }))} />
          <label>Admin Email</label>
          <input type="email" placeholder="dept-admin@college.edu" value={regForm.adminEmail} onChange={e => setRegForm(f => ({ ...f, adminEmail: e.target.value }))} />
          <label>Visibility</label>
          <div className="chip-row" style={{ marginBottom: 8 }}>
            <button type="button" className={`chip ${regForm.isPublic ? 'active' : ''}`} onClick={() => setRegForm(f => ({ ...f, isPublic: true }))}>🌐 Public</button>
            <button type="button" className={`chip ${!regForm.isPublic ? 'active' : ''}`} onClick={() => setRegForm(f => ({ ...f, isPublic: false }))}>🔒 College-Only</button>
          </div>
          <button type="submit" className="reg-submit-btn" disabled={regLoading}>
            {regLoading ? '⏳ Registering...' : 'Register College →'}
          </button>
        </form>
      </div>
    )
  }

  // Main list
  return (
    <div className="repo-page">
      <h1>🏛️ College Repository</h1>
      <p className="repo-sub">Year-wise verified project archives from engineering colleges</p>

      {loading ? (
        <div className="repo-loading">⏳ Loading colleges...</div>
      ) : colleges.length === 0 ? (
        <div className="repo-empty">
          <p>No colleges registered yet.</p>
          <p>Be the first to register your college!</p>
        </div>
      ) : (
        <div className="colleges-grid">
          {colleges.map(c => (
            <div key={c._id} className="college-card" onClick={() => setSelected(c)}>
              <div className="college-icon">🏛️</div>
              <div className="college-info">
                <h3>{c.name}</h3>
                <p>{c.dept}</p>
                <p className="college-count">📂 {c.count} project{c.count !== 1 ? 's' : ''}</p>
              </div>
              <div className={`visibility-dot ${c.isPublic ? 'public' : 'private'}`} title={c.isPublic ? 'Public' : 'Private'} />
            </div>
          ))}
        </div>
      )}

      <button className="register-btn" onClick={() => setShowRegister(true)}>
        + Register Your College
      </button>
    </div>
  )
}
