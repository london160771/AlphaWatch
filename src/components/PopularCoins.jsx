import React from 'react'
import './PopularCoins.css'

const PopularCoins = ({ coins, onSelect }) => {
  if(coins.length === 0) return <p>Loading popular coins...</p>

  return (
    <div className="popular-section">
      <h3 className="section-title">Most Popular</h3>
      <div className="popular-grid">
        {coins.map((coin) => (
          <div key={coin.id} className="popular-item" onClick={() => onSelect(coin)}>
            <img src={coin.image} alt={coin.name} />
            <div className="popular-item-info">
              <p className="popular-coin-name">{coin.name}</p>
              <p className="popular-coin-symbol">{coin.symbol.toUpperCase()}</p>
              <p className="popular-coin-price">${coin.current_price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PopularCoins