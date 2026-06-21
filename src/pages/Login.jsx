import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const [email, setemail] = useState('')
  const [password, setpassword] = useState('')
  const [error, seterror] = useState('')
  const [loading, setloading] = useState(false)

  const handleLogin = async () => {
    if(!email || !password) {
      seterror('Please fill in all fields')
      return
    }

    setloading(true)
    seterror('')

    try {
      const data = await login(email, password)

      if(data.message) {
        seterror(data.message)
        setloading(false)
        return
      }

      loginUser(data.token, data.user)
      navigate('/')

    } catch(err) {
      seterror('Something went wrong. Try again.')
      setloading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">Alpha<span>Watch</span></h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button className="auth-btn" onClick={handleLogin}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login