import React, { useState, useEffect } from 'react'
import './CoinCard.css'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
} from 'chart.js'
import { useNavigate } from 'react-router-dom'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const CoinCard = ({ coin, onRemove, currencySymbol }) => {
  const [watchlist, setwatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist')
    return saved ? JSON.parse(saved) : []
  })

  const toggleWatchlist = () => {
    setwatchlist((prev) => {
      const alreadyExists = prev.find((c) => c.id === coin.id)
      const updated = alreadyExists
        ? prev.filter((c) => c.id !== coin.id)
        : [coin, ...prev]
      localStorage.setItem('watchlist', JSON.stringify(updated))
      return updated
    })
  }

  const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY

  const navigate = useNavigate()

  const [chartData, setchartData] = useState([])
  const [chartError, setchartError] = useState(false)

  useEffect(() => {
    const index = watchlist.findIndex((c) => c.id === coin.id)
    const delay = index >= 0 ? index * 1000 : 0

    const timer = setTimeout(() => {
      fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=7`, {
        headers: { 'x-cg-demo-api-key': API_KEY }
      })
        .then(res => {
          if(!res.ok) throw new Error('Rate limited')
          return res.json()
        })
        .then(data => {
          if(data.prices) {
            setchartData(data.prices.map((price) => price[1]))
            setchartError(false)
          }
        })
        .catch(err => {
          console.log(err)
          setchartError(true)
        })
    }, delay)

    return () => clearTimeout(timer)
  }, [coin.id])

  if(!coin) return null

  const isUp = coin.price_change_percentage_24h >= 0
  const isWatchlisted = watchlist.find((c) => c.id === coin.id)

  const formatNumber = (num, symbol = '$') => {
    if(num >= 1e12) return symbol + (num / 1e12).toFixed(2) + 'T'
    if(num >= 1e9) return symbol + (num / 1e9).toFixed(2) + 'B'
    if(num >= 1e6) return symbol + (num / 1e6).toFixed(2) + 'M'
    return symbol + num.toLocaleString()
  }

  return (
    <div className="coin-card" onClick={() => navigate(`/coin/${coin.id}`)}>
      <div className="coin-card-header">
        <img src={coin.image} alt={coin.name} />
        <div>
          <p className="coin-name">{coin.name}</p>
          <p className="coin-symbol">{coin.symbol.toUpperCase()}</p>
        </div>
        <div className="coin-card-actions">
          <button
            className={`watchlist-btn ${isWatchlisted ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              toggleWatchlist()
            }}
          >
            {isWatchlisted ? '★' : '☆'}
          </button>
          <button className="remove-btn" onClick={(e) => {
            e.stopPropagation()
            onRemove(coin.id)
          }}>✕</button>
        </div>
      </div>
      <hr className="coin-divider" />
      <div className="coin-stats">
        <div className="coin-stat">
          <span className="stat-label">Price</span>
          <span className="stat-value">{currencySymbol}{coin.current_price.toLocaleString()}</span>
        </div>
        <div className="coin-stat">
          <span className="stat-label">24h Change</span>
          <span className={`stat-value ${isUp ? 'up' : 'down'}`}>
            {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
        <div className="coin-stat">
          <span className="stat-label">Market Cap</span>
          <span className="stat-value">{formatNumber(coin.market_cap, currencySymbol)}</span>
        </div>
        <div className="coin-stat">
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">{formatNumber(coin.total_volume, currencySymbol)}</span>
        </div>
        <div className="coin-stat">
          <span className="stat-label">All Time High</span>
          <span className="stat-value">{formatNumber(coin.ath, currencySymbol)}</span>
        </div>
        <div className="coin-stat">
          <span className="stat-label">Circulating Supply</span>
          <span className="stat-value">{coin.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}</span>
        </div>
      </div>
      {chartError ? (
        <div className="chart-error">Chart unavailable</div>
      ) : chartData.length > 0 ? (
        <div className="coin-chart">
          <Line
            data={{
              labels: chartData.map(() => ''),
              datasets: [{
                data: chartData,
                borderColor: isUp ? '#4ade80' : '#f87171',
                borderWidth: 1.5,
                fill: true,
                backgroundColor: isUp
                  ? 'rgba(74, 222, 128, 0.08)'
                  : 'rgba(248, 113, 113, 0.08)',
                pointRadius: 0,
                tension: 0.4
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  enabled: true,
                  callbacks: {
                    label: (context) => `${currencySymbol}${context.parsed.y.toLocaleString()}`
                  }
                }
              },
              scales: {
                x: { display: false },
                y: { display: false }
              },
              interaction: {
                intersect: false,
                mode: 'index'
              }
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

export default CoinCard