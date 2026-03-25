import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject, rateProject } from '../api/client'
import './ProjectDetail.css'

const TABS = ['Overview', 'Circuit & Simulation', '3D Model', 'Discussion']
const FILE_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tab, setTab]         = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [rating, setRating]   = useState(0)
  const [rated, setRated]     = useState(false)

  useEffect(() => {
    getProject(id)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleRate = async (stars) => {
    if (rated) return
    try {
      const res = await rateProject(id, stars)
      setProject(p => ({ ...p, rating: res.rating, ratingCount: res.ratingCount }))
      setRating(stars)
      setRated(true)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="detail-loading">⏳ Loading project...</div>
  if (!project) return (
    <div className="detail-loading">
      Project not found. <button onClick={() => navigate('/explore')}>← Go back</button>
    </div>
  )

  const author  = project.author?.name || 'Unknown'
  const role    = project.author?.role || ''
  const college = project.author?.college || project.college || ''
  const color   = { Power: '#1a237e', Machines: '#b71c1c', Control: '#4a148c', Electronics: '#1b5e20' }[project.subject] || '#1a237e'

  return (
    <div className="detail">
      <div className="detail-hero" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
        <button className="back-btn" onClick={() => navigate('/explore')}>← Back to Explore</button>
        <span className="detail-hero-icon">⚡</span>
        <h1>{project.title}</h1>
        <p>{author}{role ? ` • ${role}` : ''}{college ? ` • ${college}` : ''}</p>
        <div className="detail-badges">
          <span className="badge-primary">{project.subject}</span>
          <span className="badge-primary">{project.difficulty}</span>
          {project.semester && <span className="badge-primary">Sem {project.semester}</span>}
          <span className="badge-primary">⭐ {project.rating || 'No ratings'}</span>
          <span className={`badge-status ${project.status}`}>{project.status}</span>
        </div>

        {/* Star rating */}
        <div className="star-rating">
          <span>Rate this project: </span>
          {[1,2,3,4,5].map(s => (
            <button key={s} className={`star-btn ${s <= rating ? 'filled' : ''}`} onClick={() => handleRate(s)} disabled={rated}>★</button>
          ))}
          {rated && <span className="rated-msg">Thanks for rating!</span>}
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map(t => <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      <div className="detail-body">

        {tab === 'Overview' && (
          <div>
            <h2>Abstract</h2>
            <p className="abstract">{project.abstract || '—'}</p>

            {project.objectives?.length > 0 && <>
              <h2>Objectives</h2>
              <ul>{project.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
            </>}

            {project.tools?.length > 0 && <>
              <h2>Tools Used</h2>
              <div className="tools-row">{project.tools.map(t => <span key={t} className="tool-chip">{t}</span>)}</div>
            </>}
          </div>
        )}

        {tab === 'Circuit & Simulation' && (
          <div>
            {project.files?.images?.length > 0 ? (
              <>
                <h2>Circuit / Project Images</h2>
                <div className="images-grid">
                  {project.files.images.map((img, i) => (
                    <a key={i} href={`${FILE_BASE}${img.path}`} target="_blank" rel="noreferrer">
                      <img src={`${FILE_BASE}${img.path}`} alt={img.name} className="project-image" />
                    </a>
                  ))}
                </div>
              </>
            ) : <div className="placeholder-box">📐 No images uploaded for this project</div>}

            {project.files?.report ? (
              <>
                <h2>Project Report</h2>
                <a href={`${FILE_BASE}${project.files.report.path}`} target="_blank" rel="noreferrer" className="download-btn">
                  📄 View / Download Report — {project.files.report.name}
                </a>
              </>
            ) : <div className="placeholder-box" style={{marginTop:16}}>📄 No report uploaded</div>}

            {project.files?.simulation ? (
              <>
                <h2>Simulation File</h2>
                <a href={`${FILE_BASE}${project.files.simulation.path}`} download className="download-btn">
                  ⬇ Download — {project.files.simulation.name}
                </a>
              </>
            ) : null}
          </div>
        )}

        {tab === '3D Model' && (
          <div>
            {project.files?.model3d ? (
              <>
                <h2>3D Model File</h2>
                <a href={`${FILE_BASE}${project.files.model3d.path}`} download className="download-btn">
                  🧊 Download 3D Model — {project.files.model3d.name}
                </a>
                <div className="placeholder-box model-box" style={{marginTop:16}}>
                  🔄 Interactive 3D viewer coming soon<br />
                  <small>Download the file above to view in your 3D software</small>
                </div>
              </>
            ) : (
              <div className="placeholder-box model-box">🧊 No 3D model uploaded for this project</div>
            )}
          </div>
        )}

        {tab === 'Discussion' && (
          <div>
            <h2>Q&A Discussion</h2>
            <div className="placeholder-box">💬 Discussion feature coming soon — connect to doubts section to ask questions about this project</div>
            <button className="download-btn" style={{marginTop:16}} onClick={() => navigate('/doubt')}>
              ❓ Ask a Doubt about this project →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
