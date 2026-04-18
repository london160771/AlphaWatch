import React from 'react'
import './PopularCoins.css'

const PopularCoins = ({ coins, onSelect, currencySymbol, sortBy, setsortBy, filter, setfilter }) => {
  if(coins.length === 0 && filter === 'all') return <p>Loading popular coins...</p>

  return (
    <div className="popular-section">
      <div className="popular-header">
        <h3 className="section-title">Most Popular</h3>
        <div className="popular-controls">
          <div className="filter-group">
            {['all', 'gainers', 'losers'].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setfilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setsortBy(e.target.value)}
          >
            <option value="market_cap">Market Cap</option>
            <option value="price">Price</option>
            <option value="change">24h Change</option>
          </select>
        </div>
      </div>

      {coins.length === 0 ? (
        <p className="no-results">No coins match this filter.</p>
      ) : (
        <div className="popular-grid">
          {coins.map((coin) => (
            <div key={coin.id} className="popular-item" onClick={() => onSelect(coin)}>
              <img src={coin.image} alt={coin.name} />
              <div className="popular-item-info">
                <p className="popular-coin-name">{coin.name}</p>
                <p className="popular-coin-symbol">{coin.symbol.toUpperCase()}</p>
                <p className="popular-coin-price">{currencySymbol}{coin.current_price.toLocaleString()}</p>
              </div>
              <span className={`popular-coin-change ${coin.price_change_percentage_24h >= 0 ? 'up' : 'down'}`}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PopularCoins