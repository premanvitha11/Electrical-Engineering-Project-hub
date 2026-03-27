import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { confirmReset } from '../api/client'
import './Auth.css'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!password || !confirm) return setError('Please fill both fields')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    if (!token) return setError('Invalid reset link')
    setLoading(true)
    try {
      await confirmReset(token, password)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">⚡ EE Project Hub</div>
        <p style={{ color: 'var(--danger)', textAlign: 'center', margin: '20px 0' }}>⚠️ Invalid or missing reset link.</p>
        <button onClick={() => navigate('/forgot-password')} className="auth-submit">Request New Link</button>
      </div>
    </div>
  )

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">⚡ EE Project Hub</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Set New Password</h2>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Password reset successfully!</p>
            <p style={{ fontSize: 13, color: 'var(--subtext)', marginBottom: 20 }}>You can now login with your new password.</p>
            <button onClick={() => navigate('/auth')} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">⚠️ {error}</div>}
            <label>New Password</label>
            <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            <label>Confirm Password</label>
            <input type="password" placeholder="Repeat new password" value={confirm} onChange={e => setConfirm(e.target.value)} />
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? '⏳ Resetting...' : 'Reset Password →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
