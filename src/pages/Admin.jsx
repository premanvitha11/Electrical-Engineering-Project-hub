import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, approveProject, getDoubts, verifyAnswer } from '../api/client'
import './Admin.css'

export default function Admin() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [tab, setTab]           = useState('projects')
  const [projects, setProjects] = useState([])
  const [doubts, setDoubts]     = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (user.role !== 'Professor') { navigate('/home'); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [p, d] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/projects?status=all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()),
        getDoubts()
      ])
      setProjects(Array.isArray(p) ? p : [])
      setDoubts(Array.isArray(d) ? d : [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleApprove = async (id, status) => {
    try {
      await approveProject(id, status)
      setProjects(ps => ps.map(p => p._id === id ? { ...p, status } : p))
    } catch (err) { alert(err.message) }
  }

  const handleVerify = async (doubtId, answerId) => {
    try {
      await verifyAnswer(doubtId, answerId)
      setDoubts(ds => ds.map(d => d._id === doubtId ? {
        ...d,
        answers: d.answers.map(a => a._id === answerId ? { ...a, verified: true } : a)
      } : d))
    } catch (err) { alert(err.message) }
  }

  if (user.role !== 'Professor') return null

  return (
    <div className="admin-page">
      <h1>🎓 Professor Admin Panel</h1>
      <p className="admin-sub">Manage projects and verify answers</p>

      <div className="admin-tabs">
        <button className={`atab ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>
          📋 Projects ({projects.length})
        </button>
        <button className={`atab ${tab === 'doubts' ? 'active' : ''}`} onClick={() => setTab('doubts')}>
          ❓ Doubts ({doubts.length})
        </button>
      </div>

      {loading ? <div className="admin-loading">⏳ Loading...</div> : (

        tab === 'projects' ? (
          <div>
            {projects.length === 0 ? <p className="admin-empty">No projects yet</p> : projects.map(p => (
              <div key={p._id} className="admin-card">
                <div className="admin-card-info">
                  <h3>{p.title}</h3>
                  <p>{p.subject} • {p.difficulty} • by {p.author?.name || 'Unknown'}</p>
                  <p className="admin-abstract">{p.abstract?.slice(0, 120)}...</p>
                </div>
                <div className="admin-card-actions">
                  <span className={`status-pill ${p.status}`}>{p.status}</span>
                  {p.status !== 'approved' && (
                    <button className="approve-btn" onClick={() => handleApprove(p._id, 'approved')}>✅ Approve</button>
                  )}
                  {p.status !== 'rejected' && (
                    <button className="reject-btn" onClick={() => handleApprove(p._id, 'rejected')}>❌ Reject</button>
                  )}
                  <button className="view-link" onClick={() => navigate(`/project/${p._id}`)}>View →</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {doubts.length === 0 ? <p className="admin-empty">No doubts yet</p> : doubts.map(d => (
              <div key={d._id} className="admin-card">
                <div className="admin-card-info">
                  <span className="subject-pill">{d.subject}</span>
                  <h3>{d.question}</h3>
                  <p>Asked by {d.author?.name}</p>
                </div>
                {d.answers.length === 0 ? (
                  <p className="no-answers">No answers yet</p>
                ) : (
                  <div className="answers-list">
                    {d.answers.map(a => (
                      <div key={a._id} className={`answer-item ${a.verified ? 'verified' : ''}`}>
                        <p><strong>{a.author?.name}</strong> — {a.text}</p>
                        {a.verified ? (
                          <span className="verified-pill">✅ Verified</span>
                        ) : (
                          <button className="verify-btn" onClick={() => handleVerify(d._id, a._id)}>
                            ✅ Mark as Verified
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
