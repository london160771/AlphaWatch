import React, { createContext, useState, useEffect, useContext } from 'react'
import { getProfile } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setuser] = useState(null)
  const [loading, setloading] = useState(true)
  const [userData, setuserData] = useState({
    coins: [],
    history: [],
    watchlist: [],
    portfolio: []
  })

  const saveToLocalStorage = (data) => {
    if(data.watchlist) localStorage.setItem('watchlist', JSON.stringify(data.watchlist))
    if(data.portfolio) localStorage.setItem('holdings', JSON.stringify(data.portfolio))
    if(data.history) localStorage.setItem('searchHistory', JSON.stringify(data.history))
    if(data.coins) localStorage.setItem('coins', JSON.stringify(data.coins))
  }

  const clearLocalStorage = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('watchlist')
    localStorage.removeItem('coins')
    localStorage.removeItem('searchHistory')
    localStorage.removeItem('holdings')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if(token) {
      getProfile()
        .then(data => {
          if(data._id) {
            setuser(data)
            setuserData({
              coins: data.coins || [],
              history: data.history || [],
              watchlist: data.watchlist || [],
              portfolio: data.portfolio || []
            })
            saveToLocalStorage(data)
          } else {
            clearLocalStorage()
          }
          setloading(false)
        })
        .catch(() => {
          clearLocalStorage()
          setloading(false)
        })
    } else {
      setloading(false)
    }
  }, [])

  const loginUser = async (token, data) => {
    localStorage.setItem('token', token)
    setuser(data)

    // fetch fresh profile data from MongoDB instead of using login response
    try {
      const freshData = await getProfile()
      if(freshData._id) {
        setuserData({
          coins: freshData.coins || [],
          history: freshData.history || [],
          watchlist: freshData.watchlist || [],
          portfolio: freshData.portfolio || []
        })
        saveToLocalStorage(freshData)
      }
    } catch(err) {
      // fallback to login response data
      setuserData({
        coins: data.coins || [],
        history: data.history || [],
        watchlist: data.watchlist || [],
        portfolio: data.portfolio || []
      })
      saveToLocalStorage(data)
    }
  }

  // const loginUser = (token, data) => {
  //   localStorage.setItem('token', token)
  //   setuser(data)
  //   setuserData({
  //     coins: data.coins || [],
  //     history: data.history || [],
  //     watchlist: data.watchlist || [],
  //     portfolio: data.portfolio || []
  //   })
  //   saveToLocalStorage(data)
  // }

  const logoutUser = () => {
    clearLocalStorage()
    setuser(null)
    setuserData({
      coins: [],
      history: [],
      watchlist: [],
      portfolio: []
    })
  }

  const updateUser = (updatedData) => {
    setuser((prev) => ({ ...prev, ...updatedData }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, updateUser, userData, setuserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)