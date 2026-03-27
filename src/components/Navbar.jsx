import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from './ThemeContext'
import './Navbar.css'

const NAV = [
  { path: '/home',         label: '🏠 Home' },
  { path: '/explore',      label: '🔍 Explore' },
  { path: '/upload',       label: '📤 Upload' },
  { path: '/doubt',        label: '❓ Ask Doubt' },
  { path: '/experts',      label: '🎓 Experts' },
  { path: '/college-repo', label: '🏛️ College Repo' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'EE'
  const isProf = user.role === 'Professor'

  const links = [...NAV, ...(isProf ? [{ path: '/admin', label: '⚙️ Admin' }] : [])]

  return (
    <nav className="navbar">
      <Link to="/home" className="navbar-logo">⚡ EE Project Hub</Link>

      {/* Desktop links */}
      <div className="navbar-links">
        {links.map(n => (
          <Link key={n.path} to={n.path} className={`nav-link ${pathname === n.path ? 'active' : ''}`}>
            {n.label}
          </Link>
        ))}
      </div>

      <div className="navbar-actions">
        {/* Dark mode toggle */}
        <button className="icon-btn" onClick={toggle} title="Toggle dark mode">
          {dark ? '☀️' : '🌙'}
        </button>

        {/* Profile */}
        <button className="nav-avatar" onClick={() => navigate('/profile')}>{initials}</button>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {links.map(n => (
            <Link key={n.path} to={n.path} className={`mobile-link ${pathname === n.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}>
              {n.label}
            </Link>
          ))}
          <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>👤 Profile</Link>
        </div>
      )}
    </nav>
  )
}
