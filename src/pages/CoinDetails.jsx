import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import './CoinDetails.css'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const CoinDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [coin, setcoin] = useState(null)
  const [chartData, setchartData] = useState([])
  const [days, setdays] = useState(7)
  const [loading, setloading] = useState(true)
  const [error, seterror] = useState(false)

  const currency = localStorage.getItem('currency') || 'usd'

  const getCurrencySymbol = () => {
    if(currency === 'eur') return '€'
    if(currency === 'gbp') return '£'
    return '$'
  }

  useEffect(() => {
    setloading(true)
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${id}`)
        .then(res => {
            if(!res.ok) throw new Error('Rate limited')
            return res.json()
        })
        .then(data => {
            setcoin(data[0])
            setloading(false)
        })
        .catch(err => {
            console.log(err)
            setloading(false)
            seterror(true)  // ← add this
        })
  }, [id])

  useEffect(() => {
    fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`)
        .then(res => {
            if(!res.ok) throw new Error('Rate limited')
            return res.json()
        })
        .then(data => {
        if(data.prices) {
            setchartData(data.prices.map((price) => price[1]))
        }
        })
        .catch(err => console.log(err))
  }, [id, days])

  if(loading) return <div className="details-loading">Loading...</div>
  if(error) return (
    <div className="details-loading">
        <p>Too many requests. Please wait a moment.</p>
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
    </div>
    )
  if(!coin) return <div className="details-loading">Coin not found.</div>

  const isUp = coin.price_change_percentage_24h >= 0


  const formatNumber = (num, symbol = '$') => {
    if(num >= 1e12) return symbol + (num / 1e12).toFixed(2) + 'T'
    if(num >= 1e9) return symbol + (num / 1e9).toFixed(2) + 'B'
    if(num >= 1e6) return symbol + (num / 1e6).toFixed(2) + 'M'
    return symbol + num?.toLocaleString()
  }

  return (
    <div className="details-page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

      <div className="details-header">
        <img src={coin.image} alt={coin.name} width={60} height={60} />
        <div>
          <h1 className="details-name">{coin.name}</h1>
          <p className="details-symbol">{coin.symbol.toUpperCase()}</p>
        </div>
        <div className="details-price-group">
          <h2 className="details-price">{getCurrencySymbol()}{coin.current_price.toLocaleString()}</h2>
          <span className={`details-change ${isUp ? 'up' : 'down'}`}>
            {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="details-chart-section">
        <div className="chart-controls">
          {[1, 7, 30, 90].map((d) => (
            <button
              key={d}
              className={`chart-btn ${days === d ? 'active' : ''}`}
              onClick={() => setdays(d)}
            >
              {d === 1 ? '24H' : d === 7 ? '7D' : d === 30 ? '1M' : '3M'}
            </button>
          ))}
        </div>
        {chartData.length > 0 && (
          <div className="details-chart">
            <Line
              data={{
                labels: chartData.map(() => ''),
                datasets: [{
                  data: chartData,
                  borderColor: isUp ? '#4ade80' : '#f87171',
                  borderWidth: 2,
                  fill: true,
                  backgroundColor: isUp ? 'rgba(74, 222, 128, 0.08)' : 'rgba(248, 113, 113, 0.08)',
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
                      label: (context) => `${getCurrencySymbol()}${context.parsed.y.toLocaleString()}`
                    }
                  }
                },
                scales: {
                  x: { display: false },
                  y: {
                    display: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } }
                  }
                },
                interaction: { intersect: false, mode: 'index' }
              }}
            />
          </div>
        )}
      </div>

      <div className="details-stats-grid">
        <div className="details-stat">
          <span className="details-stat-label">Market Cap</span>
          <span className="details-stat-value">{formatNumber(coin.market_cap, getCurrencySymbol())}</span>
        </div>
        <div className="details-stat">
          <span className="details-stat-label">24h Volume</span>
          <span className="details-stat-value">{formatNumber(coin.total_volume, getCurrencySymbol())}</span>
        </div>
        <div className="details-stat">
          <span className="details-stat-label">All Time High</span>
          <span className="details-stat-value">{formatNumber(coin.ath, getCurrencySymbol())}</span>
        </div>
        <div className="details-stat">
          <span className="details-stat-label">All Time Low</span>
          <span className="details-stat-value">{formatNumber(coin.atl, getCurrencySymbol())}</span>
        </div>
        <div className="details-stat">
          <span className="details-stat-label">Circulating Supply</span>
          <span className="details-stat-value">{coin.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}</span>
        </div>
        <div className="details-stat">
          <span className="details-stat-label">Market Cap Rank</span>
          <span className="details-stat-value">#{coin.market_cap_rank}</span>
        </div>
      </div>
    </div>
  )
}

export default CoinDetails