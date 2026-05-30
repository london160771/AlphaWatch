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

const App = () => {
  const location = useLocation()

  // hide bottom nav on coin details page
  const hideNav = location.pathname.startsWith('/coin/')

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/news" element={<News />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/coin/:id" element={<CoinDetails />} />
        <Route path="/simulator" element={<Simulator />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  )
}

export default App