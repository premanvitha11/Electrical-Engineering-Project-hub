import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestReset } from '../api/client'
import './Auth.css'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) return setError('Please enter your email')
    setLoading(true)
    try {
      await requestReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">⚡ EE Project Hub</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Forgot Password</h2>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Check your email!</p>
            <p style={{ fontSize: 13, color: 'var(--subtext)', marginBottom: 20 }}>
              We sent a password reset link to <strong>{email}</strong>. It expires in 15 minutes.
            </p>
            <button onClick={() => navigate('/auth')} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">⚠️ {error}</div>}
            <p style={{ fontSize: 13, color: 'var(--subtext)', marginBottom: 16 }}>
              Enter your registered email and we'll send you a reset link.
            </p>
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? '⏳ Sending...' : 'Send Reset Link →'}
            </button>
            <p className="auth-switch">
              Remember your password? <span onClick={() => navigate('/auth')}>Login</span>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
