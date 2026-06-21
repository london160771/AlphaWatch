import React, { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import CoinCard from '../components/CoinCard'
import PopularCoins from '../components/PopularCoins'
import SkeletonCard from '../components/SkeletonCard'
import { useAuth } from '../context/AuthContext'
import { updateCoins, updateHistory } from '../services/api'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const { user, logoutUser, userData, setuserData } = useAuth()
  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY

  const [coins, setcoins] = useState(() => {
    return userData.coins && userData.coins.length > 0 ? userData.coins : JSON.parse(localStorage.getItem('coins') || '[]')
  })
  const [history, sethistory] = useState(() => {
    return userData.history && userData.history.length > 0 ? userData.history : JSON.parse(localStorage.getItem('searchHistory') || '[]')
  })
  const [loading, setloading] = useState(false)
  const [error, seterror] = useState('')
  const [popularCoins, setpopularCoins] = useState([])
  const [currency, setcurrency] = useState(() => {
    return localStorage.getItem('currency') || 'usd'
  })
  const [sortBy, setsortBy] = useState('market_cap')
  const [filter, setfilter] = useState('all')

  // Clear coins and history when user logs out
  useEffect(() => {
    if(!user) {
      setcoins([])
      sethistory([])
    }
  }, [user])

  const getCurrencySymbol = () => {
    if(currency === 'eur') return '€'
    if(currency === 'gbp') return '£'
    return '$'
  }

  const getSortedAndFilteredCoins = () => {
    let result = [...popularCoins]
    if(filter === 'gainers') result = result.filter(c => c.price_change_percentage_24h >= 0)
    if(filter === 'losers') result = result.filter(c => c.price_change_percentage_24h < 0)
    if(sortBy === 'price') result.sort((a, b) => b.current_price - a.current_price)
    if(sortBy === 'change') result.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    if(sortBy === 'market_cap') result.sort((a, b) => b.market_cap - a.market_cap)
    return result
  }

  // sync coins and history only on initial load from context
  useEffect(() => {
    if(coins.length === 0 && userData.coins && userData.coins.length > 0) {
      setcoins(userData.coins)
    }
  }, []) // Only run on mount, not on userData changes

  useEffect(() => {
    if(history.length === 0 && userData.history && userData.history.length > 0) {
      sethistory(userData.history)
    }
  }, []) // Only run on mount, not on userData changes

  // Re-sync when user logs back in (userData populated from backend)
  // This only syncs if local state is empty, preventing circular updates
  useEffect(() => {
    if(user && coins.length === 0 && userData.coins && userData.coins.length > 0) {
      setcoins(userData.coins)
    }
  }, [user, userData.coins])

  useEffect(() => {
    if(user && history.length === 0 && userData.history && userData.history.length > 0) {
      sethistory(userData.history)
    }
  }, [user, userData.history])

  useEffect(() => {
    localStorage.setItem('currency', currency)
  }, [currency])

  // save coins to localStorage and backend
  useEffect(() => {
    localStorage.setItem('coins', JSON.stringify(coins))
    if(user?._id) {
      updateCoins(coins).catch(err => console.log('Error saving coins:', err))
    }
  }, [coins, user?._id])

  // save history to localStorage and backend
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history))
    if(user?._id) {
      updateHistory(history).catch(err => console.log('Error saving history:', err))
    }
  }, [history, user?._id])

  useEffect(() => {
      if(coins.length === 0) return
      
      const timer = setTimeout(() => {
        const ids = coins.map((c) => c.id).join(',')
        fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${ids}`, {
          headers: { 'x-cg-demo-api-key': API_KEY }
        })
          .then(res => {
            if(!res.ok) throw new Error('Rate limited')
            return res.json()
          })
          .then(data => {
            setcoins(prev => prev.map(c => {
              const updated = data.find(d => d.id === c.id)
              return updated ? updated : c
            }))
          })
          .catch(err => console.log(err))
      }, 2000) // ← wait 2 seconds before fetching

      return () => clearTimeout(timer)
  }, [currency])

  // useEffect(() => {
  //   if(coins.length === 0) return
  //   const ids = coins.map((c) => c.id).join(',')
  //   fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${ids}`, {
  //     headers: { 'x-cg-demo-api-key': API_KEY }
  //   })
  //     .then(res => {
  //       if(!res.ok) throw new Error('Rate limited')
  //       return res.json()
  //     })
  //     .then(data => {
  //       setcoins(prev => prev.map(c => {
  //         const updated = data.find(d => d.id === c.id)
  //         return updated ? updated : c
  //       }))
  //     })
  //     .catch(err => console.log(err))
  // }, [currency])

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
        const updated = [foundCoin, ...prev]
        setuserData(prevUserData => ({ ...prevUserData, coins: updated }))
        return updated
      })

      sethistory((prev) => {
        const alreadyExists = prev.find((c) => c.id === foundCoin.id)
        if(alreadyExists) return prev
        const updated = [foundCoin, ...prev]
        setuserData(prevUserData => ({ ...prevUserData, history: updated }))
        return updated
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
        <div className="header-top">
          <div>
            <h1 className="app-title">Alpha<span>Watch</span></h1>
            <p className="app-subtitle">Real-time crypto tracker</p>
          </div>
          <div className="header-right">
            {user ? (
              <div className="user-menu">
                <div className="user-avatar">
                  {user?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.username || ''}</span>
                  <button className="logout-btn" onClick={() => {
                    logoutUser()
                    navigate('/')
                  }}>Sign out</button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="signin-btn" onClick={() => navigate('/login')}>Sign in</button>
                <button className="signup-btn" onClick={() => navigate('/signup')}>Sign up</button>
              </div>
            )}
          </div>
        </div>
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
          <button className="clear-btn" onClick={() => {
            setcoins([])
            setuserData(prev => ({ ...prev, coins: [] }))
          }}>Clear All</button>
        </div>
      )}
      <div className="coins-grid">
        {coins.map((coin) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            onRemove={(id) => {
              setcoins((prev) => {
                const updated = prev.filter((c) => c.id !== id)
                setuserData(prevUserData => ({ ...prevUserData, coins: updated }))
                return updated
              })
            }}
            currencySymbol={getCurrencySymbol()}
          />
        ))}
      </div>
      <PopularCoins
        coins={getSortedAndFilteredCoins()}
        currencySymbol={getCurrencySymbol()}
        onSelect={(coin) => {
          setcoins((prev) => {
            const alreadyExists = prev.find((c) => c.id === coin.id)
            if(alreadyExists) return prev
            const updated = [coin, ...prev]
            setuserData(prevUserData => ({ ...prevUserData, coins: updated }))
            return updated
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
            <button className="clear-btn" onClick={() => {
              sethistory([])
              setuserData(prev => ({ ...prev, history: [] }))
            }}>Clear History</button>
          </div>
          <div className="history-grid">
            {history.map((item) => (
              <div key={item.id} className="history-item" onClick={() => {
                setcoins((prev) => {
                  const alreadyExists = prev.find((c) => c.id === item.id)
                  if(alreadyExists) return prev
                  const updated = [item, ...prev]
                  setuserData(prevUserData => ({ ...prevUserData, coins: updated }))
                  return updated
                })
              }}>
                <img src={item.image} alt={item.name} width={35} height={35} />
                <div className="history-item-info">
                  <span className="history-item-name">{item.name}</span>
                  <span className="history-item-symbol">{item.symbol.toUpperCase()}</span>
                  <span className="history-item-price">{item.current_price.toLocaleString()} <span style={{fontSize: '0.7rem', color: 'rgba(26,26,26,0.3)'}}>USD</span></span>
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