import React from 'react'
import './Watchlist.css'

const Watchlist = ({ watchlist, toggleWatchlist, onSelect, currencySymbol }) => {
  if(watchlist.length === 0) return null

  return (
    <div className="watchlist-section">
      <h3 className="section-title">Watchlist ★</h3>
      <div className="watchlist-grid">
        {watchlist.map((coin) => (
          <div key={coin.id} className="watchlist-item" onClick={() => onSelect(coin)}>
            <img src={coin.image} alt={coin.name} />
            <div className="watchlist-item-info">
              <span className="watchlist-item-name">{coin.name}</span>
              <span className="watchlist-item-symbol">{coin.symbol.toUpperCase()}</span>
            <span className="watchlist-item-price">{currencySymbol}{coin.current_price.toLocaleString()}</span>
            </div>
            <button
              className="watchlist-remove-btn"
              onClick={(e) => {
                e.stopPropagation()
                toggleWatchlist(coin)
              }}
            >★</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Watchlist