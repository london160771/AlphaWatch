import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Signup = () => {
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const [username, setusername] = useState('')
  const [email, setemail] = useState('')
  const [password, setpassword] = useState('')
  const [error, seterror] = useState('')
  const [loading, setloading] = useState(false)

  const handleSignup = async () => {
    if(!username || !email || !password) {
      seterror('Please fill in all fields')
      return
    }

    if(password.length < 6) {
      seterror('Password must be at least 6 characters')
      return
    }

    setloading(true)
    seterror('')

    try {
      const data = await signup(username, email, password)

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
          <p className="auth-subtitle">Create your account</p>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setusername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            />
          </div>
          <button className="auth-btn" onClick={handleSignup}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup