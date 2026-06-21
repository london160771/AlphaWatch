import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Watchlist.css'
import { useAuth } from '../context/AuthContext'
import { updateWatchlist } from '../services/api'

const getWatchlist = () => {
  try { return JSON.parse(localStorage.getItem('watchlist') || '[]') }
  catch { return [] }
}

const Watchlist = () => {
  const { user, userData, setuserData } = useAuth()
  const navigate = useNavigate()
  const [watchlist, setwatchlist] = useState([])

  const currency = localStorage.getItem('currency') || 'usd'

  const getCurrencySymbol = () => {
    if(currency === 'eur') return '€'
    if(currency === 'gbp') return '£'
    return '$'
  }

  // listen for watchlist changes from CoinCard
  useEffect(() => {
    const handleWatchlistChange = () => setwatchlist(getWatchlist())
    window.addEventListener('watchlistUpdated', handleWatchlistChange)
    return () => window.removeEventListener('watchlistUpdated', handleWatchlistChange)
  }, [])

  // sync with userData from AuthContext
  useEffect(() => {
    console.log('userData.watchlist changed:', userData.watchlist)
    setwatchlist(userData.watchlist || [])
  }, [userData.watchlist])

  // Clear watchlist when user logs out
  useEffect(() => {
    if(!user) {
      setwatchlist([])
    }
  }, [user])

  const removeFromWatchlist = (id) => {
    const updated = watchlist.filter((c) => c.id !== id)
    setwatchlist(updated)
    localStorage.setItem('watchlist', JSON.stringify(updated))
    setuserData(prev => ({ ...prev, watchlist: updated }))
    window.dispatchEvent(new Event('watchlistUpdated'))
    if(user) updateWatchlist(updated).catch(err => console.log(err))
  }

  const clearWatchlist = () => {
    setwatchlist([])
    localStorage.setItem('watchlist', JSON.stringify([]))
    setuserData(prev => ({ ...prev, watchlist: [] }))
    window.dispatchEvent(new Event('watchlistUpdated'))
    if(user) updateWatchlist([]).catch(err => console.log(err))
  }

  return (
    <div className="app">
      <div className="page-header">
        <h1 className="page-title">Watchlist</h1>
        {watchlist.length > 0 && (
          <button className="clear-btn" onClick={clearWatchlist}>Clear All</button>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">★</p>
          <p className="empty-title">No coins in watchlist</p>
          <p className="empty-sub">Star a coin from the home page to add it here</p>
          <button className="goto-btn" onClick={() => navigate('/')}>Go to Home</button>
        </div>
      ) : (
        <div className="watchlist-page-grid">
          {watchlist.map((coin) => (
            <div key={coin.id} className="watchlist-page-item" onClick={() => navigate(`/coin/${coin.id}`)}>
              <img src={coin.image} alt={coin.name} width={40} height={40} />
              <div className="watchlist-page-info">
                <span className="watchlist-page-name">{coin.name}</span>
                <span className="watchlist-page-symbol">{coin.symbol.toUpperCase()}</span>
              </div>
              <div className="watchlist-page-right">
                <span className="watchlist-page-price">{getCurrencySymbol()}{coin.current_price.toLocaleString()}</span>
                <span className={`watchlist-page-change ${coin.price_change_percentage_24h >= 0 ? 'up' : 'down'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
              <button className="watchlist-page-remove" onClick={(e) => {
                e.stopPropagation()
                removeFromWatchlist(coin.id)
              }}>★</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Watchlist