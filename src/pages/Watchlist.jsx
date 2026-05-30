import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Watchlist.css'

const Watchlist = () => {
  const navigate = useNavigate()
  const [watchlist, setwatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist')
    return saved ? JSON.parse(saved) : []
  })

  const currency = localStorage.getItem('currency') || 'usd'

  const getCurrencySymbol = () => {
    if(currency === 'eur') return '€'
    if(currency === 'gbp') return '£'
    return '$'
  }

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const removeFromWatchlist = (id) => {
    setwatchlist((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="app">
      <div className="page-header">
        <h1 className="page-title">Watchlist</h1>
        {watchlist.length > 0 && (
          <button className="clear-btn" onClick={() => setwatchlist([])}>Clear All</button>
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