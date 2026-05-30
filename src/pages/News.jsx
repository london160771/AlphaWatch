import React, { useState, useEffect } from 'react'
import './News.css'

const News = () => {
  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY

  const [news, setnews] = useState([])
  const [loading, setloading] = useState(true)
  const [error, seterror] = useState('')
  const [category, setcategory] = useState('cryptocurrency')

  const categories = [
    { label: 'All', value: 'cryptocurrency' },
    { label: 'Bitcoin', value: 'bitcoin' },
    { label: 'Ethereum', value: 'ethereum' },
    { label: 'DeFi', value: 'defi' },
    { label: 'NFT', value: 'nft' },
    { label: 'Regulation', value: 'crypto regulation' },
  ]

  useEffect(() => {
    setloading(true)
    seterror('')

    fetch(`https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${category}&language=en&size=10`)
      .then(res => {
        if(!res.ok) throw new Error('Failed to fetch news')
        return res.json()
      })
      .then(data => {
        if(data.results) {
          setnews(data.results)
        }
        setloading(false)
      })
      .catch(err => {
        console.log(err)
        seterror('Failed to load news. Try again later.')
        setloading(false)
      })
  }, [category])

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="app">
      <div className="page-header">
        <h1 className="page-title">News</h1>
      </div>

      <div className="news-categories">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`news-cat-btn ${category === cat.value ? 'active' : ''}`}
            onClick={() => setcategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="news-skeleton-list">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="news-skeleton-item">
              <div className="news-skeleton-line long"></div>
              <div className="news-skeleton-line medium"></div>
              <div className="news-skeleton-line short"></div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {!loading && !error && news.length === 0 && (
        <div className="empty-state">
          <p className="empty-title">No news found</p>
          <p className="empty-sub">Try a different category</p>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="news-list">
          {news.map((article, index) => (
            <a
              key={index}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-item"
            >
              {article.image_url && (
                <img src={article.image_url} alt={article.title} className="news-image" />
              )}
              <div className="news-content">
                <p className="news-source">{article.source_id}</p>
                <p className="news-title">{article.title}</p>
                <p className="news-date">{formatDate(article.pubDate)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default News