import React, { useState, useEffect } from 'react'
import './SearchBar.css'

const SearchBar = ({ onSearch }) => {
  const [query, setquery] = useState('')
  const [suggestions, setsuggestions] = useState([])
  const [showDropdown, setshowDropdown] = useState(false)

  const handleSearch = () => {
    if(query.trim() === '') return
    onSearch(query)
  }

 const debounceRef = React.useRef(null)
 const wrapperRef = React.useRef(null) 

 useEffect(() => {
    const handleClickOutside = (e) => {
      if(wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setshowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInput = async (e) => {
    const value = e.target.value
    setquery(value)

    if(value.trim().length < 2) {
      setsuggestions([])
      setshowDropdown(false)
      return
    }

    // ← clear previous timer
    clearTimeout(debounceRef.current)

    // ← only fetch after 500ms of no typing
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${value}`)
        const data = await res.json()
        setsuggestions(data.coins.slice(0, 5))
        setshowDropdown(true)
      } catch(err) {
        setsuggestions([])
      }
    }, 500)
  }

  return (
      <div className="search-wrapper" ref={wrapperRef}>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search coin... e.g bitcoin"
            value={query}
            onChange={handleInput}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">Search</button>
        </div>

        {showDropdown && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((coin) => (
              <div key={coin.id} className="suggestion-item" onClick={() => {
                setquery(coin.name)
                setshowDropdown(false)
                onSearch(coin.name)
              }}>
                <img src={coin.thumb} alt={coin.name} width={24} height={24} />
                <span className="suggestion-name">{coin.name}</span>
                <span className="suggestion-symbol">{coin.symbol}</span>
              </div>
            ))}
          </div>
        )}
      </div>
  )
}

export default SearchBar