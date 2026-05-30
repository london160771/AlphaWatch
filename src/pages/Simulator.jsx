import React, { useState } from 'react'
import './Simulator.css'

const Simulator = () => {
  const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY

  const [query, setquery] = useState('')
  const [coin, setcoin] = useState(null)
  const [amount, setamount] = useState('')
  const [buyPrice, setbuyPrice] = useState('')
  const [exitPrice, setexitPrice] = useState(0)
  const [loading, setloading] = useState(false)
  const [error, seterror] = useState('')

  const searchCoin = async () => {
    if(!query.trim()) return
    setloading(true)
    seterror('')
    setcoin(null)

    try {
      const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`, {
        headers: { 'x-cg-demo-api-key': API_KEY }
      })
      const searchData = await searchRes.json()

      if(searchData.coins.length === 0) {
        seterror('Coin not found')
        setloading(false)
        return
      }

      const coinId = searchData.coins[0].id
      const priceRes = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`, {
        headers: { 'x-cg-demo-api-key': API_KEY }
      })
      const priceData = await priceRes.json()
      const coinData = priceData[0]

      setcoin(coinData)
      setexitPrice(coinData.current_price)
      setloading(false)

    } catch(err) {
      seterror('Something went wrong. Try again.')
      setloading(false)
    }
  }

  const amountNum = parseFloat(amount) || 0
  const buyPriceNum = parseFloat(buyPrice) || 0
  const currentPrice = coin ? coin.current_price : 0

  const invested = amountNum * buyPriceNum
  const currentValue = amountNum * currentPrice
  const exitValue = amountNum * exitPrice

  const pnlCurrent = currentValue - invested
  const pnlExit = exitValue - invested

  const pnlPercentCurrent = invested > 0 ? ((pnlCurrent / invested) * 100).toFixed(2) : 0
  const pnlPercentExit = invested > 0 ? ((pnlExit / invested) * 100).toFixed(2) : 0

  const breakEven = buyPriceNum
  const isCurrentUp = pnlCurrent >= 0
  const isExitUp = pnlExit >= 0

  const sliderMin = coin ? (coin.current_price * 0.1).toFixed(2) : 0
  const sliderMax = coin ? (coin.current_price * 3).toFixed(2) : 0

  return (
    <div className="app">
      <div className="page-header">
        <h1 className="page-title">Simulator</h1>
      </div>

      <div className="sim-search">
        <input
          className="form-input"
          type="text"
          placeholder="Search coin... e.g bitcoin"
          value={query}
          onChange={(e) => setquery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchCoin()}
        />
        <button className="submit-btn" onClick={searchCoin}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {coin && (
        <div className="sim-coin-header">
          <img src={coin.image} alt={coin.name} width={40} height={40} />
          <div>
            <p className="sim-coin-name">{coin.name}</p>
            <p className="sim-coin-price">Live price: ${coin.current_price.toLocaleString()}</p>
          </div>
        </div>
      )}

      {coin && (
        <div className="sim-inputs">
          <input
            className="form-input"
            type="number"
            placeholder="Amount e.g 0.5"
            value={amount}
            onChange={(e) => setamount(e.target.value)}
          />
          <input
            className="form-input"
            type="number"
            placeholder="Buy price in USD e.g 60000"
            value={buyPrice}
            onChange={(e) => setbuyPrice(e.target.value)}
          />
        </div>
      )}

      {coin && amount && buyPrice && (
        <div className="sim-results">

          {/* Current P&L */}
          <div className="sim-card">
            <p className="sim-card-label">If you sell now</p>
            <div className="sim-card-row">
              <span className="sim-card-sub">Current value</span>
              <span className="sim-card-value">${currentValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
            <div className="sim-card-row">
              <span className="sim-card-sub">Invested</span>
              <span className="sim-card-value">${invested.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
            <div className="sim-card-row">
              <span className="sim-card-sub">P&L</span>
              <span className={`sim-card-value ${isCurrentUp ? 'up' : 'down'}`}>
                {isCurrentUp ? '+' : ''}${pnlCurrent.toFixed(2)} ({isCurrentUp ? '+' : ''}{pnlPercentCurrent}%)
              </span>
            </div>
          </div>

          {/* Break even */}
          <div className="sim-card">
            <p className="sim-card-label">Break even</p>
            <div className="sim-card-row">
              <span className="sim-card-sub">Sell at</span>
              <span className="sim-card-value">${breakEven.toLocaleString()}</span>
            </div>
            <div className="sim-card-row">
              <span className="sim-card-sub">Status</span>
              <span className={`sim-card-value ${isCurrentUp ? 'up' : 'down'}`}>
                {isCurrentUp ? 'Above break even ✓' : 'Below break even ✗'}
              </span>
            </div>
          </div>

          {/* Scenario Cards */}
          <div className="sim-scenarios">
            <p className="sim-card-label">What if scenarios</p>
            <div className="sim-scenarios-grid">
              {[
                { label: 'Price drops 50%', multiplier: 0.5 },
                { label: 'Price drops 20%', multiplier: 0.8 },
                { label: 'Price stays same', multiplier: 1 },
                { label: 'Price rises 20%', multiplier: 1.2 },
                { label: 'Price doubles', multiplier: 2 },
                { label: 'Price 10x', multiplier: 10 },
              ].map((scenario) => {
                const scenarioPrice = coin.current_price * scenario.multiplier
                const scenarioValue = amountNum * scenarioPrice
                const scenarioPnl = scenarioValue - invested
                const scenarioPnlPercent = invested > 0 ? ((scenarioPnl / invested) * 100).toFixed(2) : 0
                const scenarioUp = scenarioPnl >= 0

                return (
                  <div
                    key={scenario.label}
                    className={`sim-scenario-card ${scenarioUp ? 'up-card' : 'down-card'}`}
                    onClick={() => setexitPrice(scenarioPrice)}
                  >
                    <p className="scenario-label">{scenario.label}</p>
                    <p className="scenario-price">${scenarioPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                    <p className={`scenario-pnl ${scenarioUp ? 'up' : 'down'}`}>
                      {scenarioUp ? '+' : ''}${scenarioPnl.toFixed(2)}
                    </p>
                    <p className={`scenario-percent ${scenarioUp ? 'up' : 'down'}`}>
                      {scenarioUp ? '+' : ''}{scenarioPnlPercent}%
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Exit price slider */}
          <div className="sim-slider-section">
            <div className="sim-slider-header">
              <p className="sim-card-label">Exit price simulator</p>
              <span className="sim-slider-value">${parseFloat(exitPrice).toLocaleString()}</span>
            </div>
            <input
              type="range"
              className="sim-slider"
              min={sliderMin}
              max={sliderMax}
              step={(sliderMax - sliderMin) / 100}
              value={exitPrice}
              onChange={(e) => setexitPrice(parseFloat(e.target.value))}
            />
            <div className="sim-slider-labels">
              <span>${parseFloat(sliderMin).toLocaleString()}</span>
              <span>${parseFloat(sliderMax).toLocaleString()}</span>
            </div>
            <div className={`sim-exit-result ${isExitUp ? 'up-bg' : 'down-bg'}`}>
              <div className="sim-exit-row">
                <span>Exit value</span>
                <span>${exitValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
              <div className="sim-exit-row">
                <span>P&L</span>
                <span className={isExitUp ? 'up' : 'down'}>
                  {isExitUp ? '+' : ''}${pnlExit.toFixed(2)} ({isExitUp ? '+' : ''}{pnlPercentExit}%)
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default Simulator