import React from 'react';
import './HighScores.css';

const HighScores = ({ scores }) => {
  return (
    <div className="high-scores">
      <h2>High Scores 🏆</h2>
      <div className="scores-list">
        {scores.length > 0 ? (
          scores.map((score, index) => (
            <div key={index} className="score-item">
              <div className="score-main">
                <div className="score-rank">#{index + 1}</div>
                <div className="score-info">
                  <span className="score-name">{score.playerName}</span>
                  <span className="score-points">{score.score} pts</span>
                </div>
              </div>
              <div className="score-date">
                {new Date(score.timeCompleted).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <p className="no-scores">No scores yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export default HighScores; 