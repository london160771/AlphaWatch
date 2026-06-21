import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Portfolio.css'
import { useAuth } from '../context/AuthContext'
import { updatePortfolio } from '../services/api'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const Portfolio = () => {
  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY
  const { user, userData, setuserData } = useAuth()

  const [editingId, seteditingId] = useState(null)
  const [editValues, seteditValues] = useState({ amount: '', buyPrice: '' })

  const [holdings, setholdings] = useState(userData.portfolio || [])

  const [showAddForm, setshowAddForm] = useState(false)
  const [newCoin, setnewCoin] = useState({ name: '', amount: '', buyPrice: '' })
  const [error, seterror] = useState('')
  const [loading, setloading] = useState(false)

  // sync portfolio from AuthContext
  useEffect(() => {
    setholdings(userData.portfolio || [])
  }, [userData.portfolio])

  // Clear holdings when user logs out
  useEffect(() => {
    if(!user) {
      setholdings([])
    }
  }, [user])

  // save portfolio to localStorage and backend
  useEffect(() => {
    localStorage.setItem('holdings', JSON.stringify(holdings))
    if(user?._id) {
      updatePortfolio(holdings).catch(err => console.log('Error saving portfolio:', err))
    }
  }, [holdings, user?._id])

  useEffect(() => {
    if(holdings.length === 0) return
    const ids = holdings.map((h) => h.id).join(',')
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`, {
      headers: { 'x-cg-demo-api-key': API_KEY }
    })
      .then(res => {
        if(!res.ok) throw new Error('Rate limited')
        return res.json()
      })
      .then(data => {
        setholdings((prev) => prev.map((holding) => {
          const updated = data.find((c) => c.id === holding.id)
          if(updated) return { ...holding, currentPrice: updated.current_price }
          return holding
        }))
      })
      .catch(err => console.log(err))
  }, [])

  const addHolding = async () => {
    if(!newCoin.name || !newCoin.amount || !newCoin.buyPrice) {
      seterror('Please fill in all fields')
      return
    }

    setloading(true)
    seterror('')

    try {
      const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${newCoin.name}`, {
        headers: { 'x-cg-demo-api-key': API_KEY }
      })
      const searchData = await searchRes.json()

      if(searchData.coins.length === 0) {
        seterror('Coin not found. Try "bitcoin" or "ethereum"')
        setloading(false)
        return
      }

      const coinId = searchData.coins[0].id
      const priceRes = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`, {
        headers: { 'x-cg-demo-api-key': API_KEY }
      })
      const priceData = await priceRes.json()
      const coinData = priceData[0]

      const holding = {
        id: coinData.id,
        name: coinData.name,
        symbol: coinData.symbol,
        image: coinData.image,
        amount: parseFloat(newCoin.amount),
        buyPrice: parseFloat(newCoin.buyPrice),
        currentPrice: coinData.current_price,
      }

      setholdings((prev) => {
        const alreadyExists = prev.find((h) => h.id === holding.id)
        if(alreadyExists) {
          seterror('Coin already in portfolio')
          return prev
        }
        const updated = [holding, ...prev]
        setuserData(prev => ({ ...prev, portfolio: updated }))
        return updated
      })

      setnewCoin({ name: '', amount: '', buyPrice: '' })
      setshowAddForm(false)
      setloading(false)

    } catch(err) {
      seterror('Something went wrong. Try again.')
      setloading(false)
    }
  }

  const saveEdit = (id) => {
    if(!editValues.amount || !editValues.buyPrice) {
      seterror('Please fill in all fields')
      return
    }

    setholdings((prev) => {
      const updated = prev.map((h) => {
        if(h.id === id) {
          return {
            ...h,
            amount: parseFloat(editValues.amount),
            buyPrice: parseFloat(editValues.buyPrice)
          }
        }
        return h
      })
      setuserData(prevUserData => ({ ...prevUserData, portfolio: updated }))
      return updated
    })

    seteditingId(null)
    seteditValues({ amount: '', buyPrice: '' })
    seterror('')
  }

  const totalValue = holdings.reduce((sum, h) => sum + (h.amount * h.currentPrice), 0)
  const totalInvested = holdings.reduce((sum, h) => sum + (h.amount * h.buyPrice), 0)
  const totalPnl = totalValue - totalInvested
  const totalPnlPercent = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(2) : 0
  const isOverallUp = totalPnl >= 0

  const chartData = {
    labels: holdings.map((h) => h.name),
    datasets: [{
      data: holdings.map((h) => h.amount * h.currentPrice),
      backgroundColor: [
        'rgba(168, 85, 247, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderColor: 'rgba(0,0,0,0)',
      borderWidth: 0,
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'black',
          font: { size: 14, family: 'Space Grotesk' },
          padding: 16,
          boxWidth: 12,
          boxHeight: 12,
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percent = ((value / total) * 100).toFixed(1)
            return ` $${value.toLocaleString()} (${percent}%)`
          }
        }
      }
    },
    cutout: '70%',
  }

  return (
    <div className="app">
      <div className="page-header">
        <h1 className="page-title">Portfolio</h1>
        <button className="add-btn" onClick={() => setshowAddForm(!showAddForm)}>
          {showAddForm ? '✕ Cancel' : '+ Add'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {holdings.length > 0 && (
        <div className="portfolio-stats">
          <div className="portfolio-stat">
            <span className="portfolio-stat-label">Total Value</span>
            <span className="portfolio-stat-value">${totalValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
          </div>
          <div className="portfolio-stat">
            <span className="portfolio-stat-label">Invested</span>
            <span className="portfolio-stat-value">${totalInvested.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
          </div>
          <div className="portfolio-stat">
            <span className="portfolio-stat-label">Total P&L</span>
            <span className={`portfolio-stat-value ${isOverallUp ? 'up' : 'down'}`}>
              {isOverallUp ? '+' : ''}${totalPnl.toFixed(2)}
            </span>
          </div>
          <div className="portfolio-stat">
            <span className="portfolio-stat-label">Overall</span>
            <span className={`portfolio-stat-value ${isOverallUp ? 'up' : 'down'}`}>
              {isOverallUp ? '+' : ''}{totalPnlPercent}%
            </span>
          </div>
        </div>
      )}

      {holdings.length > 0 && (
        <div className="portfolio-chart">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      )}

      {showAddForm && (
        <div className="add-form">
          <input
            className="form-input"
            type="text"
            placeholder="Coin name e.g bitcoin"
            value={newCoin.name}
            onChange={(e) => setnewCoin({ ...newCoin, name: e.target.value })}
          />
          <input
            className="form-input"
            type="number"
            placeholder="Amount owned e.g 0.5"
            value={newCoin.amount}
            onChange={(e) => setnewCoin({ ...newCoin, amount: e.target.value })}
          />
          <input
            className="form-input"
            type="number"
            placeholder="Buy price in USD e.g 60000"
            value={newCoin.buyPrice}
            onChange={(e) => setnewCoin({ ...newCoin, buyPrice: e.target.value })}
          />
          <button className="submit-btn" onClick={addHolding}>
            {loading ? 'Adding...' : 'Add to Portfolio'}
          </button>
        </div>
      )}

      {holdings.length === 0 && !showAddForm && (
        <div className="empty-state">
          <p className="empty-icon">◎</p>
          <p className="empty-title">No holdings yet</p>
          <p className="empty-sub">Add your first coin to start tracking your portfolio</p>
          <button className="goto-btn" onClick={() => setshowAddForm(true)}>Add a coin</button>
        </div>
      )}

      {holdings.length > 0 && (
        <div className="holdings-list">
          {holdings.map((holding) => {
            const currentValue = holding.amount * holding.currentPrice
            const invested = holding.amount * holding.buyPrice
            const pnl = currentValue - invested
            const pnlPercent = ((pnl / invested) * 100).toFixed(2)
            const isUp = pnl >= 0
            const isEditing = editingId === holding.id

            return (
              <div key={holding.id} className="holding-item">
                <img src={holding.image} alt={holding.name} width={40} height={40} />
                <div className="holding-info">
                  <span className="holding-name">{holding.name}</span>
                  {isEditing ? (
                    <div className="edit-inputs">
                      <input
                        className="edit-input"
                        type="number"
                        placeholder="Amount"
                        value={editValues.amount}
                        onChange={(e) => seteditValues({ ...editValues, amount: e.target.value })}
                      />
                      <input
                        className="edit-input"
                        type="number"
                        placeholder="Buy price"
                        value={editValues.buyPrice}
                        onChange={(e) => seteditValues({ ...editValues, buyPrice: e.target.value })}
                      />
                    </div>
                  ) : (
                    <span className="holding-amount">{holding.amount} {holding.symbol.toUpperCase()} · avg ${holding.buyPrice.toLocaleString()}</span>
                  )}
                </div>
                <div className="holding-values">
                  <span className="holding-value">${currentValue.toLocaleString()}</span>
                  <span className={`holding-pnl ${isUp ? 'up' : 'down'}`}>
                    {isUp ? '+' : ''}${pnl.toFixed(2)} ({isUp ? '+' : ''}{pnlPercent}%)
                  </span>
                </div>
                <div className="holding-actions">
                  {isEditing ? (
                    <>
                      <button className="save-btn" onClick={() => saveEdit(holding.id)}>✓</button>
                      <button className="holding-remove" onClick={() => seteditingId(null)}>✕</button>
                    </>
                  ) : (
                    <>
                      <button className="edit-btn" onClick={() => {
                        seteditingId(holding.id)
                        seteditValues({ amount: holding.amount, buyPrice: holding.buyPrice })
                      }}>✎</button>
                      <button className="holding-remove" onClick={() => setholdings((prev) => {
                        const updated = prev.filter((h) => h.id !== holding.id)
                        setuserData(prevUserData => ({ ...prevUserData, portfolio: updated }))
                        return updated
                      })}>✕</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Portfolio