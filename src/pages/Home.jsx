import React, { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import CoinCard from '../components/CoinCard'
import PopularCoins from '../components/PopularCoins'
import Watchlist from '../components/Watchlist'
import SkeletonCard from '../components/SkeletonCard'

const Home = () => {
  const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY

  const [coins, setcoins] = useState(() => {
    const saved = localStorage.getItem('coins')
    return saved ? JSON.parse(saved) : []
  })
  const [loading, setloading] = useState(false)
  const [error, seterror] = useState('')
  const [history, sethistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory')
    return saved ? JSON.parse(saved) : []
  })
  const [popularCoins, setpopularCoins] = useState([])
  const [watchlist, setwatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist')
    return saved ? JSON.parse(saved) : []
  })
  const [currency, setcurrency] = useState(() => {
    return localStorage.getItem('currency') || 'usd'
  })
  const [sortBy, setsortBy] = useState('market_cap')
  const [filter, setfilter] = useState('all')


  const getCurrencySymbol = () => {
    if(currency === 'eur') return '€'
    if(currency === 'gbp') return '£'
    return '$'
  }

  const getSortedAndFilteredCoins = () => {
    let result = [...popularCoins]

    // filter
    if(filter === 'gainers') result = result.filter(c => c.price_change_percentage_24h >= 0)
    if(filter === 'losers') result = result.filter(c => c.price_change_percentage_24h < 0)

    // sort
    if(sortBy === 'price') result.sort((a, b) => b.current_price - a.current_price)
    if(sortBy === 'change') result.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    if(sortBy === 'market_cap') result.sort((a, b) => b.market_cap - a.market_cap)

    return result
  }


  useEffect(() => {
    localStorage.setItem('currency', currency)
  }, [currency])

  useEffect(() => {
    localStorage.setItem('coins', JSON.stringify(coins))
  }, [coins])

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
  }, [watchlist])


 useEffect(() => {
        if(coins.length === 0) return

        const ids = coins.map((c) => c.id).join(',')

        fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${ids}`, {
          headers: { 'x-cg-demo-api-key': API_KEY }
        })
            .then(res => {
            if(!res.ok) throw new Error('Rate limited')
            return res.json()
            })
            .then(data => setcoins(data))
            .catch(err => console.log(err))
  }, [currency])


  useEffect(() => {
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=bitcoin,ethereum,solana,dogecoin,cardano`, {
      headers: { 'x-cg-demo-api-key': API_KEY }
    })
        .then(res => {
        if(!res.ok) throw new Error('Rate limited')
        return res.json()
        })
        .then(data => {
        setpopularCoins(data)
        localStorage.setItem('popularCoins', JSON.stringify(data))
        })
        .catch(err => console.log(err))
    }, [currency])

  const toggleWatchlist = (coin) => {
    setwatchlist((prev) => {
      const alreadyExists = prev.find((c) => c.id === coin.id)
      if(alreadyExists) return prev.filter((c) => c.id !== coin.id)
      return [coin, ...prev]
    })
  }

  const handleSearch = async (query) => {
    setloading(true)
    seterror('')

    try {
      const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`, {
        headers: { 'x-cg-demo-api-key': API_KEY }
      })
        if(!searchRes.ok) {
            seterror('Too many requests. Please wait a moment and try again.')
            setloading(false)
            return
        }
      const searchData = await searchRes.json()

      if(searchData.coins.length === 0) {
        seterror('Coin not found. Try "bitcoin" or "ethereum"')
        setloading(false)
        return
      }

      const coinId = searchData.coins[0].id
      const priceRes = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${coinId}`, {
        headers: { 'x-cg-demo-api-key': API_KEY }
      })
      if(!priceRes.ok) {
        seterror('Too many requests. Please wait a moment and try again.')
        setloading(false)
        return
      }
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
        <div className="currency-switcher">
            {['usd', 'eur', 'gbp'].map((c) => (
            <button
                key={c}
                className={`currency-btn ${currency === c ? 'active' : ''}`}
                onClick={() => setcurrency(c)}
            >
                {c.toUpperCase()}
            </button>
            ))}
        </div>
      </div>
      <SearchBar onSearch={handleSearch} />
      {loading && coins.length === 0 && (
        <div className="coins-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {coins.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className="clear-btn" onClick={() => setcoins([])}>Clear All</button>
        </div>
      )}
      <div className="coins-grid">
        {coins.map((coin) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            onRemove={(id) => setcoins((prev) => prev.filter((c) => c.id !== id))}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
            currencySymbol={getCurrencySymbol()}
          />
        ))}
      </div>
      <Watchlist
        watchlist={watchlist}
        toggleWatchlist={toggleWatchlist}
        currencySymbol={getCurrencySymbol()}
        onSelect={(coin) => {
          setcoins((prev) => {
            const alreadyExists = prev.find((c) => c.id === coin.id)
            if(alreadyExists) return prev
            return [coin, ...prev]
          })
        }}
      />
      <PopularCoins coins={getSortedAndFilteredCoins()} currencySymbol={getCurrencySymbol()} onSelect={(coin) => {
        setcoins((prev) => {
          const alreadyExists = prev.find((c) => c.id === coin.id)
          if(alreadyExists) return prev
          return [coin, ...prev]
        })
      }} 
       sortBy={sortBy}
       setsortBy={setsortBy}
       filter={filter}
       setfilter={setfilter}
      />
      {history.length > 0 && (
        <div className="history">
          <div className="history-header">
            <h3 className="section-title">Recent Searches</h3>
            <button className="clear-btn" onClick={() => sethistory([])}>Clear History</button>
          </div>
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
                  <span className="history-item-price">{item.current_price.toLocaleString()} <span style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)'}}>USD</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home