import React, { useState, useEffect, useCallback } from 'react';
import './HighScores.css';

const HighScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHighScores = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/leaderboard');
      if (!response.ok) {
        throw new Error('Failed to fetch high scores');
      }
      const data = await response.json();
      console.log('Fetched high scores:', data);
      setScores(data);
    } catch (error) {
      console.error('Error fetching high scores:', error);
      setError('Failed to load high scores');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchHighScores();
  }, [fetchHighScores]);

  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchHighScores, 30000);
    return () => clearInterval(interval);
  }, [fetchHighScores]);

  // Expose refresh function globally
  useEffect(() => {
    window.refreshHighScores = fetchHighScores;
    return () => {
      delete window.refreshHighScores;
    };
  }, [fetchHighScores]);

  if (loading) {
    return <div className="high-scores">Loading high scores...</div>;
  }

  if (error) {
    return <div className="high-scores error">{error}</div>;
  }

  return (
    <div className="high-scores">
      <h2>High Scores</h2>
      {scores.length > 0 ? (
        <ul>
          {scores.map((score, index) => (
            <li key={index} className="score-item">
              <span className="rank">#{index + 1}</span>
              <span className="player-name">{score.name}</span>
              <span className="score-value">{score.score}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-scores">No high scores yet!</p>
      )}
    </div>
  );
};

export default HighScores; 