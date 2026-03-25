import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'

const NAV = [
  { path: '/home', label: '🏠 Home' },
  { path: '/explore', label: '🔍 Explore' },
  { path: '/upload', label: '📤 Upload' },
  { path: '/doubt', label: '❓ Ask Doubt' },
  { path: '/experts', label: '🎓 Experts' },
  { path: '/college-repo', label: '🏛️ College Repo' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <Link to="/home" className="navbar-logo">⚡ EE Project Hub</Link>
      <div className="navbar-links">
        {NAV.map(n => (
          <Link key={n.path} to={n.path} className={`nav-link ${pathname === n.path ? 'active' : ''}`}>
            {n.label}
          </Link>
        ))}
      </div>
      <button className="nav-profile" onClick={() => navigate('/profile')}>👤 Profile</button>
    </nav>
  )
}
