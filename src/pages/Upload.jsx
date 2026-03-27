import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadProject } from '../api/client'
import './Forms.css'
import './Upload.css'

const SUBJECTS    = ['Power', 'Machines', 'Control', 'Electronics']
const DIFFICULTIES = ['Easy', 'Medium', 'Advanced']

function FileSlot({ icon, label, accept, fieldName, multiple = false, files, onChange }) {
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = multiple ? Array.from(e.dataTransfer.files) : [e.dataTransfer.files[0]]
    onChange(fieldName, multiple ? dropped : dropped[0])
  }

  const handleChange = (e) => {
    const selected = multiple ? Array.from(e.target.files) : e.target.files[0]
    onChange(fieldName, selected)
  }

  const remove = (e, idx) => {
    e.stopPropagation()
    if (multiple) {
      const updated = files.filter((_, i) => i !== idx)
      onChange(fieldName, updated)
    } else {
      onChange(fieldName, null)
    }
  }

  const hasFiles = multiple ? files?.length > 0 : !!files

  return (
    <div
      className={`file-slot ${hasFiles ? 'has-files' : ''}`}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      {!hasFiles ? (
        <>
          <span className="slot-icon">{icon}</span>
          <span className="slot-label">{label}</span>
          <span className="slot-hint">Click or drag & drop</span>
        </>
      ) : (
        <div className="file-previews" onClick={e => e.stopPropagation()}>
          <span className="slot-icon-sm">{icon}</span>
          <div className="preview-list">
            {(multiple ? files : [files]).map((f, i) => (
              <div key={i} className="preview-item">
                {f.type?.startsWith('image/') ? (
                  <img src={URL.createObjectURL(f)} alt={f.name} className="preview-img" />
                ) : (
                  <span className="preview-file-icon">📄</span>
                )}
                <span className="preview-name">{f.name}</span>
                <span className="preview-size">{(f.size / 1024).toFixed(0)} KB</span>
                <button className="remove-btn" onClick={(e) => remove(e, i)}>✕</button>
              </div>
            ))}
          </div>
          <button className="add-more-btn" onClick={() => inputRef.current.click()}>
            {multiple ? '+ Add more' : '↺ Replace'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Upload() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', subject: '', abstract: '', objectives: '', tools: '', difficulty: '', semester: '', college: '', reportLink: '', simulationLink: '', model3dLink: '', imageLinks: '' })
  const [fileMap, setFileMap] = useState({ report: null, images: [], simulation: null, model3d: null })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setFile  = (k, v) => setFileMap(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title || !form.subject || !form.abstract || !form.difficulty) {
      return setError('Please fill all required fields (Title, Subject, Abstract, Difficulty)')
    }

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })

    // Parse objectives and tools as JSON arrays
    if (form.objectives) fd.set('objectives', JSON.stringify(form.objectives.split('\n').filter(Boolean)))
    if (form.tools)      fd.set('tools',      JSON.stringify(form.tools.split(',').map(t => t.trim()).filter(Boolean)))
    if (form.reportLink)     fd.append('reportLink',     form.reportLink)
    if (form.simulationLink) fd.append('simulationLink', form.simulationLink)
    if (form.model3dLink)    fd.append('model3dLink',    form.model3dLink)
    if (form.imageLinks)     fd.append('imageLinks',     form.imageLinks)

    if (fileMap.report)     fd.append('report',     fileMap.report)
    if (fileMap.simulation) fd.append('simulation', fileMap.simulation)
    if (fileMap.model3d)    fd.append('model3d',    fileMap.model3d)
    fileMap.images.forEach(img => fd.append('images', img))

    try {
      setLoading(true)
      await uploadProject(fd)
      alert('✅ Project submitted for faculty review!')
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
      <p className="form-sub">Share your EE project with the community — submitted projects go for faculty review</p>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="form-error">⚠️ {error}</div>}

        <label>Project Title *</label>
        <input placeholder="e.g. Smart Grid Load Balancer" value={form.title} onChange={e => setField('title', e.target.value)} />

        <label>Domain / Subject *</label>
        <div className="chip-row">
          {SUBJECTS.map(s => <button type="button" key={s} className={`chip ${form.subject === s ? 'active' : ''}`} onClick={() => setField('subject', s)}>{s}</button>)}
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
              {DIFFICULTIES.map(d => <button type="button" key={d} className={`chip ${form.difficulty === d ? 'active' : ''}`} onClick={() => setField('difficulty', d)}>{d}</button>)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label>Semester</label>
            <input type="number" min={1} max={8} placeholder="e.g. 6" value={form.semester} onChange={e => setField('semester', e.target.value)} />
          </div>
        </div>

        <label>College</label>
        <input placeholder="e.g. NITK Surathkal" value={form.college} onChange={e => setField('college', e.target.value)} />

        <label>🔗 Share Files via Links <span className="label-hint">(Google Drive / GitHub — recommended)</span></label>
        <input placeholder="📄 Report PDF link (Google Drive)" value={form.reportLink} onChange={e => setField('reportLink', e.target.value)} />
        <input placeholder="🖼️ Images folder link (Google Drive)" value={form.imageLinks} onChange={e => setField('imageLinks', e.target.value)} style={{marginTop:8}} />
        <input placeholder="⚙️ Simulation file link (Google Drive / GitHub)" value={form.simulationLink} onChange={e => setField('simulationLink', e.target.value)} style={{marginTop:8}} />
        <input placeholder="🧊 3D Model link (Google Drive / GitHub)" value={form.model3dLink} onChange={e => setField('model3dLink', e.target.value)} style={{marginTop:8}} />

        <label>Upload Files <span className="label-hint">(optional — use links above instead)</span></label>
        <div className="upload-grid-2">
          <FileSlot icon="📄" label="Project Report (PDF)" accept=".pdf" fieldName="report" files={fileMap.report} onChange={setFile} />
          <FileSlot icon="🖼️" label="Images (JPG/PNG)" accept=".jpg,.jpeg,.png,.webp" fieldName="images" multiple files={fileMap.images} onChange={setFile} />
          <FileSlot icon="⚙️" label="Simulation File (.slx/.mdl/.zip)" accept=".slx,.mdl,.m,.zip" fieldName="simulation" files={fileMap.simulation} onChange={setFile} />
          <FileSlot icon="🧊" label="3D Model (.glb/.obj/.zip)" accept=".glb,.obj,.zip" fieldName="model3d" files={fileMap.model3d} onChange={setFile} />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '⏳ Uploading...' : 'Submit for Review →'}
        </button>
      </form>
    </div>
  )
}
