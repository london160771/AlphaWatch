import React from 'react'
import './CoinCard.css'

const CoinCard = ({ coin, onRemove }) => {
  if(!coin) return null

  const isUp = coin.price_change_percentage_24h >= 0

  return (
    <div className="coin-card">
      <div className="coin-card-header">
        <img src={coin.image} alt={coin.name} />
        <div>
          <p className="coin-name">{coin.name}</p>
          <p className="coin-symbol">{coin.symbol.toUpperCase()}</p>
        </div>
        <button className="remove-btn" onClick={() => onRemove(coin.id)}>✕</button>
      </div>
      <hr className="coin-divider" />
      <div className="coin-stats">
        <div className="coin-stat">
          <span className="stat-label">Price</span>
          <span className="stat-value">${coin.current_price.toLocaleString()}</span>
        </div>
        <div className="coin-stat">
          <span className="stat-label">24h Change</span>
          <span className={`stat-value ${isUp ? 'up' : 'down'}`}>
            {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
        <div className="coin-stat">
          <span className="stat-label">Market Cap</span>
          <span className="stat-value">${coin.market_cap.toLocaleString()}</span>
        </div>
        <div className="coin-stat">
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">${coin.total_volume.toLocaleString()}</span>
        </div>
        <div className="coin-stat">
          <span className="stat-label">All Time High</span>
          <span className="stat-value">${coin.ath.toLocaleString()}</span>
        </div>
        <div className="coin-stat">
          <span className="stat-label">Circulating Supply</span>
          <span className="stat-value">{coin.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}

export default CoinCard