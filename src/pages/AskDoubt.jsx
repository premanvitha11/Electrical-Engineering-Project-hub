import React, { useState, useEffect, useRef } from 'react'
import { getDoubts, postDoubt, postAnswer } from '../api/client'
import './Forms.css'
import './AskDoubt.css'

const FILE_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const SUBJECTS = ['Power', 'Machines', 'Control', 'Electronics', 'Signals', 'EMF']

export default function AskDoubt() {
  const [subject, setSubject]   = useState('')
  const [question, setQuestion] = useState('')
  const [doubts, setDoubts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [posting, setPosting]   = useState(false)
  const [replyId, setReplyId]   = useState(null)
  const [replyText, setReplyText] = useState('')
  const imageRef = useRef()

  useEffect(() => { fetchDoubts() }, [])

  const fetchDoubts = async () => {
    try {
      const data = await getDoubts()
      setDoubts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!subject || !question) return alert('Select a subject and type your question')
    setPosting(true)
    try {
      const fd = new FormData()
      fd.append('subject', subject)
      fd.append('question', question)
      if (imageRef.current?.files[0]) fd.append('image', imageRef.current.files[0])
      await postDoubt(fd)
      setQuestion('')
      setSubject('')
      await fetchDoubts()
    } catch (err) {
      alert(err.message)
    } finally {
      setPosting(false)
    }
  }

  const handleReply = async (doubtId) => {
    if (!replyText.trim()) return alert('Type your answer')
    try {
      const fd = new FormData()
      fd.append('text', replyText)
      await postAnswer(doubtId, fd)
      setReplyId(null)
      setReplyText('')
      await fetchDoubts()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="form-page doubt-page">
      <h1>❓ Ask a Doubt</h1>
      <p className="form-sub">Get answers from seniors and professors</p>

      <form className="form-card" onSubmit={handlePost}>
        <label>Select Subject</label>
        <div className="chip-row">
          {SUBJECTS.map(s => (
            <button type="button" key={s} className={`chip ${subject === s ? 'active' : ''}`} onClick={() => setSubject(s)}>{s}</button>
          ))}
        </div>
        <label>Your Question</label>
        <textarea rows={4} placeholder="Type your doubt clearly..." value={question} onChange={e => setQuestion(e.target.value)} />
        <label>Upload Image (optional)</label>
        <input ref={imageRef} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ border: 'none', padding: 0 }} />
        <button type="submit" className="submit-btn" disabled={posting}>
          {posting ? '⏳ Posting...' : 'Post Question →'}
        </button>
      </form>

      <h2 className="doubts-heading">
        {loading ? '⏳ Loading doubts...' : `Recent Doubts (${doubts.length})`}
      </h2>

      {!loading && doubts.length === 0 && (
        <div className="doubt-card" style={{ textAlign: 'center', color: 'var(--subtext)' }}>
          No doubts posted yet. Be the first to ask!
        </div>
      )}

      {doubts.map(d => (
        <div key={d._id} className="doubt-card">
          <div className="doubt-header">
            <span className="subject-tag">{d.subject}</span>
            <span className="doubt-author">{d.author?.name} • {d.author?.role}</span>
            <span className="doubt-time">{new Date(d.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
          <p className="doubt-q">{d.question}</p>

          {d.image && (
            <a href={`${FILE_BASE}${d.image.path}`} target="_blank" rel="noreferrer">
              <img src={`${FILE_BASE}${d.image.path}`} alt="doubt" className="doubt-img" />
            </a>
          )}

          {d.answers.map((a, i) => (
            <div key={i} className={`answer-box ${a.verified ? 'verified' : ''}`}>
              <span className="answer-author">{a.author?.role === 'Professor' ? '🎓' : '👤'} {a.author?.name} — {a.author?.role}</span>
              <p>{a.text}</p>
              {a.verified && <span className="verified-tag">✅ Professor Verified</span>}
            </div>
          ))}

          {replyId === d._id ? (
            <div className="reply-box">
              <textarea rows={3} placeholder="Type your answer..." value={replyText} onChange={e => setReplyText(e.target.value)} />
              <div className="reply-actions">
                <button className="reply-submit" onClick={() => handleReply(d._id)}>Post Answer</button>
                <button className="reply-cancel" onClick={() => setReplyId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="reply-btn" onClick={() => setReplyId(d._id)}>💬 Answer this doubt</button>
          )}
        </div>
      ))}
    </div>
  )
}
