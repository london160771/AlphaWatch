import React, { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import CoinCard from './components/CoinCard'
import PopularCoins from './components/PopularCoins'
import './App.css'

const App = () => {
  const [coins, setcoins] = useState([])
  const [loading, setloading] = useState(false)
  const [error, seterror] = useState('')
  const [history, sethistory] = useState([])
  const [popularCoins, setpopularCoins] = useState([])

  useEffect(() => {
    const cached = localStorage.getItem('popularCoins')

    if(cached) {
      setpopularCoins(JSON.parse(cached))  // ← use cached data if available
      return
    }

    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,dogecoin,cardano')
      .then(res => res.json())
      .then(data => {
        setpopularCoins(data)
        localStorage.setItem('popularCoins', JSON.stringify(data))  // ← save to cache
      })
  }, [])

  const handleSearch = async (query) => {
    setloading(true)
    seterror('')

    try {
      const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`)
      const searchData = await searchRes.json()

      if(searchData.coins.length === 0) {
        seterror('Coin not found. Try "bitcoin" or "ethereum"')
        setloading(false)
        return
      }

      const coinId = searchData.coins[0].id

      const priceRes = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`)
      const priceData = await priceRes.json()

      const foundCoin = priceData[0]

      setcoins((prev) => {
        const alreadyExists = prev.find((c) => c.id === foundCoin.id)
        if(alreadyExists) return prev
        return [foundCoin, ...prev]
      })

      sethistory((prev) => {
        const alreadyExists = prev.find((c) => c.id === foundCoin.id)
        if(alreadyExists) return prev
        return [foundCoin, ...prev]
      })
      setloading(false)

    } catch(err) {
      seterror('Something went wrong. Try again.')
      setloading(false)
    }
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">AlphaWatch</h1>
        <p className="app-subtitle">Real-time crypto tracker</p>
      </div>
      <SearchBar onSearch={handleSearch} />
      {loading && <p className="loading">Fetching coin data...</p>}
      {error && <p className="error">{error}</p>}
      {coins.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className="clear-btn" onClick={() => setcoins([])}>Clear All</button>
        </div>
      )}
      <div className="coins-grid">
        {coins.map((coin) => (
          <CoinCard key={coin.id} coin={coin} onRemove={(id) => {
            setcoins((prev) => prev.filter((c) => c.id !== id))
          }} />
        ))}
      </div>
      <PopularCoins coins={popularCoins} onSelect={(coin) => {
        setcoins((prev) => {
          const alreadyExists = prev.find((c) => c.id === coin.id)
          if(alreadyExists) return prev
          return [coin, ...prev]
        })
      }} />
      {history.length > 0 && (
        <div className="history">
          <h3 className="section-title">Recent Searches</h3>
          <button className="clear-btn" onClick={() => sethistory([])}>Clear History</button>
          <div className="history-grid">
            {history.map((item) => (
              <div key={item.id} className="history-item" onClick={() => {
                setcoins((prev) => {
                  const alreadyExists = prev.find((c) => c.id === item.id)
                  if(alreadyExists) return prev
                  return [item, ...prev]
                })
              }}>
                <img src={item.image} alt={item.name} width={35} height={35} />
                <div className="history-item-info">
                  <span className="history-item-name">{item.name}</span>
                  <span className="history-item-symbol">{item.symbol.toUpperCase()}</span>
                  <span className="history-item-price">${item.current_price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App