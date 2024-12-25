import React from 'react';

const Card = ({ id, isFlipped, imageUrl, onClick }) => {
  return (
    <div 
      className={`card ${isFlipped ? 'flipped' : ''}`} 
      onClick={onClick}
    >
      <div className="card-inner">
        <div className="card-front">
          {/* Question mark or card back design */}
          ?
        </div>
        <div className="card-back">
          {/* Card image or content */}
          <img src={imageUrl} alt="card" />
        </div>
      </div>
    </div>
  );
};

export default Card; 