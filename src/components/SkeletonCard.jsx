import React from 'react'
import './SkeletonCard.css'

const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-circle"></div>
        <div className="skeleton-title-group">
          <div className="skeleton-line long"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
      <div className="skeleton-divider"></div>
      <div className="skeleton-rows">
        <div className="skeleton-row">
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-row">
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-row">
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-row">
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCard