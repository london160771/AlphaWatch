import React, { useState } from 'react'
import './SearchBar.css'

const SearchBar = ({ onSearch }) => {
  const [query, setquery] = useState('')

  const handleSearch = () => {
    if(query.trim() === '') return
    onSearch(query)
  }

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search coin... e.g bitcoin"
        value={query}
        onChange={(e) => setquery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="search-input"
      />
      <button onClick={handleSearch} className="search-btn">Search</button>
    </div>
  )
}

export default SearchBar