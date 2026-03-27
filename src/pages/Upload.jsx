import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadProject } from '../api/client'
import './Forms.css'
import './Upload.css'

const SUBJECTS     = ['Power', 'Machines', 'Control', 'Electronics']
const DIFFICULTIES = ['Easy', 'Medium', 'Advanced']

export default function Upload() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', subject: '', abstract: '', objectives: '',
    tools: '', difficulty: '', semester: '', college: '',
    reportLink: '', imageLinks: '', simulationLink: '', model3dLink: ''
  })
  const [showGuide, setShowGuide] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.subject || !form.abstract || !form.difficulty) {
      return setError('Please fill all required fields (Title, Subject, Abstract, Difficulty)')
    }

    const fd = new FormData()
    fd.append('title',      form.title)
    fd.append('subject',    form.subject)
    fd.append('abstract',   form.abstract)
    fd.append('difficulty', form.difficulty)
    if (form.semester)       fd.append('semester',       form.semester)
    if (form.college)        fd.append('college',        form.college)
    if (form.objectives)     fd.append('objectives',     JSON.stringify(form.objectives.split('\n').filter(Boolean)))
    if (form.tools)          fd.append('tools',          JSON.stringify(form.tools.split(',').map(t => t.trim()).filter(Boolean)))
    if (form.reportLink)     fd.append('reportLink',     form.reportLink)
    if (form.imageLinks)     fd.append('imageLinks',     form.imageLinks)
    if (form.simulationLink) fd.append('simulationLink', form.simulationLink)
    if (form.model3dLink)    fd.append('model3dLink',    form.model3dLink)

    try {
      setLoading(true)
      await uploadProject(fd)
      alert('✅ Project uploaded successfully!')
      navigate('/explore')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <h1>📤 Upload Project</h1>
      <p className="form-sub">Share your EE project with the community</p>

      {/* How to Upload Guide */}
      <div className="guide-box">
        <div className="guide-header" onClick={() => setShowGuide(g => !g)}>
          <span>📖 How to Upload a Project</span>
          <span>{showGuide ? '▲' : '▼'}</span>
        </div>
        {showGuide && (
          <div className="guide-steps">
            <div className="guide-step">
              <span className="step-num">1</span>
              <div>
                <p className="step-title">Fill in Project Details</p>
                <p className="step-desc">Enter your project title, select the subject (Power/Machines/Control/Electronics), write a clear abstract describing what your project does, list objectives and tools used.</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="step-num">2</span>
              <div>
                <p className="step-title">Upload Files to Google Drive</p>
                <p className="step-desc">Upload your PDF report, images, simulation files (.slx/.mdl) and 3D models to Google Drive. Keep all files organized in one folder.</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="step-num">3</span>
              <div>
                <p className="step-title">Make Files Public</p>
                <p className="step-desc">Right click each file in Google Drive → Share → click "Restricted" → change to "Anyone with the link" → Copy link. This allows anyone to view your files.</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="step-num">4</span>
              <div>
                <p className="step-title">Paste Google Drive Links</p>
                <p className="step-desc">Paste the copied links in the respective fields below (Report, Images, Simulation, 3D Model). Links are optional but highly recommended.</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="step-num">5</span>
              <div>
                <p className="step-title">Submit Your Project</p>
                <p className="step-desc">Click "Submit Project" — your project will be instantly published and visible to all students in the Explore section.</p>
              </div>
            </div>
            <div className="guide-tip">
              💡 <strong>Tip:</strong> A good abstract (3-5 sentences) and clear objectives will help other students understand and learn from your project.
            </div>
          </div>
        )}
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="form-error">⚠️ {error}</div>}

        <label>Project Title *</label>
        <input placeholder="e.g. Smart Grid Load Balancer" value={form.title} onChange={e => setField('title', e.target.value)} />

        <label>Domain / Subject *</label>
        <div className="chip-row">
          {SUBJECTS.map(s => (
            <button type="button" key={s} className={`chip ${form.subject === s ? 'active' : ''}`} onClick={() => setField('subject', s)}>{s}</button>
          ))}
        </div>

        <label>Abstract *</label>
        <textarea rows={4} placeholder="Describe your project, methodology, and results..." value={form.abstract} onChange={e => setField('abstract', e.target.value)} />

        <label>Objectives <span className="label-hint">(one per line)</span></label>
        <textarea rows={3} placeholder={"Monitor real-time load\nAuto-switch feeders\nReduce outage time"} value={form.objectives} onChange={e => setField('objectives', e.target.value)} />

        <label>Tools Used <span className="label-hint">(comma separated)</span></label>
        <input placeholder="MATLAB, Simulink, Arduino, SCADA" value={form.tools} onChange={e => setField('tools', e.target.value)} />

        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label>Difficulty Level *</label>
            <div className="chip-row">
              {DIFFICULTIES.map(d => (
                <button type="button" key={d} className={`chip ${form.difficulty === d ? 'active' : ''}`} onClick={() => setField('difficulty', d)}>{d}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label>Semester</label>
            <input type="number" min={1} max={8} placeholder="e.g. 6" value={form.semester} onChange={e => setField('semester', e.target.value)} />
          </div>
        </div>

        <label>College</label>
        <input placeholder="e.g. NITK Surathkal" value={form.college} onChange={e => setField('college', e.target.value)} />

        <label>🔗 Share Files via Google Drive Links</label>
        <div className="drive-info">
          💡 Upload your files to Google Drive → right click → Share → "Anyone with the link" → copy link
        </div>
        <input placeholder="📄 Project Report (Google Drive link)" value={form.reportLink} onChange={e => setField('reportLink', e.target.value)} />
        <input placeholder="🖼️ Images folder (Google Drive link)" value={form.imageLinks} onChange={e => setField('imageLinks', e.target.value)} style={{ marginTop: 8 }} />
        <input placeholder="⚙️ Simulation file (Google Drive link)" value={form.simulationLink} onChange={e => setField('simulationLink', e.target.value)} style={{ marginTop: 8 }} />
        <input placeholder="🧊 3D Model file (Google Drive link)" value={form.model3dLink} onChange={e => setField('model3dLink', e.target.value)} style={{ marginTop: 8 }} />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '⏳ Uploading...' : 'Submit Project →'}
        </button>
      </form>
    </div>
  )
}
