const BASE_URL = 'https://alphawatch-server.onrender.com/api'

const getToken = () => localStorage.getItem('token')

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

export const signup = async (username, email, password) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
  return res.json()
}

export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

export const getProfile = async () => {
  const res = await fetch(`${BASE_URL}/user/profile`, {
    headers: headers()
  })
  return res.json()
}

export const updateWatchlist = async (watchlist) => {
  const res = await fetch(`${BASE_URL}/user/watchlist`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ watchlist })
  })
  return res.json()
}

export const updatePortfolio = async (portfolio) => {
  const res = await fetch(`${BASE_URL}/user/portfolio`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ portfolio })
  })
  return res.json()
}

export const updateHistory = async (history) => {
  const res = await fetch(`${BASE_URL}/user/history`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ history })
  })
  return res.json()
}

export const updateCoins = async (coins) => {
  const res = await fetch(`${BASE_URL}/user/coins`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ coins })
  })
  return res.json()
}