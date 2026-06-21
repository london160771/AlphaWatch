import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import News from './pages/News'
import Watchlist from './pages/Watchlist'
import CoinDetails from './pages/CoinDetails'
import BottomNav from './components/BottomNav'
import './App.css'
import Simulator from './pages/Simulator'
import Login from './pages/Login'
import Signup from './pages/Signup'

const App = () => {
  const location = useLocation()

  // hide bottom nav on coin details page
  const hideNav = location.pathname.startsWith('/coin/') ||
  location.pathname === '/login' ||
  location.pathname === '/signup'

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/news" element={<News />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/coin/:id" element={<CoinDetails />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  )
}

export default App