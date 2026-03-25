import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { login, register } from '../api/client'
import './Auth.css'

const ROLES = ['Student', 'Senior', 'Professor']

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') || 'login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState('Student')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Please fill all fields')
    try {
      setLoading(true)
      const data = mode === 'login'
        ? await login({ email, password })
        : await register({ name, email, password, role })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/home')
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
        <div className="auth-toggle">
          {['login', 'signup'].map(m => (
            <button key={m} className={`toggle-btn ${mode === m ? 'active' : ''}`} onClick={() => { setMode(m); setError('') }}>
              {m === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <><label>Full Name</label>
            <input type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} /></>)}
          <label>Email</label>
          <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
          <label>Password</label>
          <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} />
          {mode === 'signup' && (
            <><label>Select Role</label>
            <div className="role-row">
              {ROLES.map(r => (
                <button type="button" key={r} className={`role-btn ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>{r}</button>
              ))}
            </div></>)}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? '⏳ Please wait...' : 'Continue →'}
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>{mode === 'login' ? 'Sign Up' : 'Login'}</span>
        </p>
      </div>
    </div>
  )
}
