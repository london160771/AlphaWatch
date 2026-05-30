import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './BottomNav.css'

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    {
      path: '/',
      label: 'Home',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#8B6914' : 'rgba(26,26,26,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      path: '/portfolio',
      label: 'Portfolio',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#8B6914' : 'rgba(26,26,26,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    {
      path: '/simulator',
      label: 'Simulator',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#8B6914' : 'rgba(26,26,26,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      )
    },
    {
      path: '/news',
      label: 'News',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#8B6914' : 'rgba(26,26,26,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
          <line x1="16" y1="8" x2="10" y2="8"/>
          <line x1="16" y1="12" x2="10" y2="12"/>
          <line x1="16" y1="16" x2="10" y2="16"/>
        </svg>
      )
    },
    {
      path: '/watchlist',
      label: 'Watchlist',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#8B6914' : 'none'} stroke={active ? '#8B6914' : 'rgba(26,26,26,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="bottom-nav-icon">{tab.icon(active)}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav