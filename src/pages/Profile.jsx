import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, getMyProjects, updateProfile } from '../api/client'
import './Profile.css'

const STATUS_COLOR = { approved: '#2e7d32', pending: '#f57f17', rejected: '#c62828' }
const STATUS_BG    = { approved: '#e8f5e9', pending: '#fff8e1', rejected: '#fce4ec' }

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser]           = useState(null)
  const [myProjects, setMyProjects] = useState([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [editForm, setEditForm]   = useState({})
  const [saving, setSaving]       = useState(false)
  const [activeTab, setActiveTab] = useState('uploaded')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return navigate('/')
    Promise.all([getProfile(), getMyProjects()])
      .then(([profile, projects]) => {
        setUser(profile)
        setMyProjects(projects)
        setEditForm({ name: profile.name, college: profile.college || '', semester: profile.semester || '' })
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateProfile(editForm)
      setUser(updated)
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), name: updated.name }))
      setEditing(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    if (!confirm('Logout?')) return
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  if (loading) return <div className="profile-loading">⏳ Loading profile...</div>
  if (!user)   return null

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'EE'
  const savedProjects = user.savedProjects || []

  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          {editing ? (
            <div className="edit-form">
              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
              <input value={editForm.college} onChange={e => setEditForm(f => ({ ...f, college: e.target.value }))} placeholder="College" />
              <input type="number" value={editForm.semester} onChange={e => setEditForm(f => ({ ...f, semester: e.target.value }))} placeholder="Semester" min={1} max={8} />
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{user.name}</h1>
              <p>{user.role}{user.college ? ` • ${user.college}` : ''}{user.semester ? ` • Semester ${user.semester}` : ''}</p>
              <p className="profile-email">{user.email}</p>
            </>
          )}
        </div>
        {!editing && <button className="edit-btn" onClick={() => setEditing(true)}>✏️ Edit</button>}
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { v: myProjects.length,                                    l: 'Uploaded' },
          { v: myProjects.filter(p => p.status === 'approved').length, l: 'Approved' },
          { v: myProjects.filter(p => p.status === 'pending').length,  l: 'Pending' },
          { v: savedProjects.length,                                 l: 'Saved' },
        ].map(s => (
          <div key={s.l} className="stat-box">
            <span className="stat-val">{s.v}</span>
            <span className="stat-lbl">{s.l}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className={`ptab ${activeTab === 'uploaded' ? 'active' : ''}`} onClick={() => setActiveTab('uploaded')}>
          📤 My Projects ({myProjects.length})
        </button>
        <button className={`ptab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
          🔖 Saved ({savedProjects.length})
        </button>
      </div>

      {/* My Uploaded Projects */}
      {activeTab === 'uploaded' && (
        <div>
          {myProjects.length === 0 ? (
            <div className="empty-profile">
              <p>You haven't uploaded any projects yet.</p>
              <button onClick={() => navigate('/upload')}>📤 Upload your first project →</button>
            </div>
          ) : (
            myProjects.map(p => (
              <div key={p._id} className="project-row" onClick={() => navigate(`/project/${p._id}`)}>
                <div className="proj-icon-box">⚡</div>
                <div className="proj-details">
                  <p className="proj-title">{p.title}</p>
                  <p className="proj-meta">{p.subject} • {p.difficulty}{p.college ? ` • ${p.college}` : ''}</p>
                  <p className="proj-meta">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="proj-right">
                  <span className="status-badge" style={{ background: STATUS_BG[p.status], color: STATUS_COLOR[p.status] }}>
                    {p.status === 'approved' ? '✅' : p.status === 'pending' ? '⏳' : '❌'} {p.status}
                  </span>
                  {p.rating > 0 && <span className="proj-rating">⭐ {p.rating}</span>}
                </div>
              </div>
            ))
          )}
          <button className="upload-new-btn" onClick={() => navigate('/upload')}>+ Upload New Project</button>
        </div>
      )}

      {/* Saved Projects */}
      {activeTab === 'saved' && (
        <div>
          {savedProjects.length === 0 ? (
            <div className="empty-profile">
              <p>No saved projects yet.</p>
              <button onClick={() => navigate('/explore')}>🔍 Browse projects →</button>
            </div>
          ) : (
            savedProjects.map(p => (
              <div key={p._id} className="project-row" onClick={() => navigate(`/project/${p._id}`)}>
                <div className="proj-icon-box">🔖</div>
                <div className="proj-details">
                  <p className="proj-title">{p.title}</p>
                  <p className="proj-meta">{p.subject} • {p.difficulty}</p>
                </div>
                <span className="proj-arrow">›</span>
              </div>
            ))
          )}
        </div>
      )}

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  )
}
