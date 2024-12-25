import React from 'react';
import './Card.css';

const Card = ({ id, isFlipped, imageUrl, onClick }) => {
  return (
    <div 
      className={`card ${isFlipped ? 'flipped' : ''}`} 
      onClick={onClick}
    >
      <div className="card-inner">
        <div className="card-front">
          {/* Question mark or card back design */}
          <span>?</span>
        </div>
        <div className="card-back">
          <img 
            src={imageUrl} 
            alt="card" 
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default Card; 