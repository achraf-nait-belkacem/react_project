import React, { useState, useEffect } from 'react';
import Card from './Card.jsx';
import HighScores from './HighScores.jsx';
import './GameBoard.css';

// Import images directly
import ananas from './assets/images/ananas.jpeg';
import apple from './assets/images/apple.jpeg';
import banana from './assets/images/banana.jpg';
import kiwi from './assets/images/kiwi.jpg';
import melon from './assets/images/melon.jpeg';
import orange from './assets/images/orange.jpg';

const API_URL = 'http://localhost:3000/api';

const GameBoard = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [highScores, setHighScores] = useState([]);

  // Use imported images
  const cardImages = [
    ananas,
    apple,
    banana,
    kiwi,
    melon,
    orange
  ];

  useEffect(() => {
    initializeCards();
    fetchHighScores();
  }, []);

  const initializeCards = () => {
    const cardPairs = [...cardImages, ...cardImages]
      .map((image, index) => ({
        id: index,
        imageUrl: image,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    setCards(cardPairs);
    setScore(0);
    setMoves(0);
    setErrors(0);
    setStartTime(new Date());
    setFlippedCards([]);
    setMatchedPairs([]);
    setIsGameComplete(false);
  };

  const fetchHighScores = async () => {
    try {
      const response = await fetch(`${API_URL}/scores`);
      if (!response.ok) {
        throw new Error('Failed to fetch high scores');
      }
      const data = await response.json();
      setHighScores(data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching high scores:', error);
    }
  };

  const handleCardClick = (clickedCard) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(clickedCard.id) ||
      matchedPairs.includes(clickedCard.id)
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, clickedCard.id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prevMoves => prevMoves + 1);
      checkMatch(newFlippedCards);
    }
  };

  const handleGameOver = async () => {
    setIsGameComplete(true);
    
    const finalStats = {
      score: score,
      moves: moves,
      timeCompleted: new Date().toISOString(),
      matchedPairs: matchedPairs.length / 2,
      totalPairs: cards.length / 2,
    };

    try {
      setIsSaving(true);
      setSaveError(null);

      const response = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalStats),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Score saved successfully:', data);
      setIsSaving(false);
      
      fetchHighScores();
    } catch (error) {
      console.error('Error saving score:', error);
      setSaveError('Failed to save score. Please try again.');
      setIsSaving(false);
    }
  };

  const calculateScore = (moves, errors, timeInSeconds) => {
    // Base score for completing the game
    const baseScore = 1000;
    
    // Penalty for each move (-5 points per move)
    const movePenalty = moves * 5;
    
    // Higher penalty for errors (-20 points per error)
    const errorPenalty = errors * 20;
    
    // Time penalty (-1 point per second after first 30 seconds)
    const timeThreshold = 30; // seconds
    const timePenalty = Math.max(0, timeInSeconds - timeThreshold);
    
    // Calculate bonus for quick completion
    const speedBonus = timeInSeconds < timeThreshold ? 
      Math.floor((timeThreshold - timeInSeconds) * 10) : 0;
    
    // Perfect game bonus (no errors)
    const perfectGameBonus = errors === 0 ? 200 : 0;
    
    // Efficiency bonus (minimum moves possible is pairs * 2)
    const minimumMoves = cards.length;
    const efficiencyBonus = moves <= minimumMoves ? 300 : 
      moves <= minimumMoves * 1.5 ? 150 : 0;

    const finalScore = Math.max(0,
      baseScore 
      - movePenalty 
      - errorPenalty 
      - timePenalty 
      + speedBonus 
      + perfectGameBonus 
      + efficiencyBonus
    );

    return Math.round(finalScore);
  };

  const checkMatch = (newFlippedCards) => {
    const [firstCard, secondCard] = newFlippedCards.map(id => 
      cards.find(card => card.id === id)
    );

    if (firstCard.imageUrl === secondCard.imageUrl) {
      const newMatchedPairs = [...matchedPairs, firstCard.id, secondCard.id];
      setMatchedPairs(newMatchedPairs);
      setFlippedCards([]);

      // Check if all cards are matched
      if (newMatchedPairs.length === cards.length) {
        const endTime = new Date();
        const timeInSeconds = Math.floor((endTime - startTime) / 1000);
        const finalScore = calculateScore(moves, errors, timeInSeconds);
        setScore(finalScore);
        handleGameOver();
      }
    } else {
      // Increment error count for mismatches
      setErrors(prev => prev + 1);
      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setTimeout(() => {
      initializeCards();
    }, 300);
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="score-display">
          <p>Score: <span className="score-value">{score}</span></p>
          <p>Moves: <span className="moves-value">{moves}</span></p>
          <p>Errors: <span className="errors-value">{errors}</span></p>
        </div>
        <button className="restart-button" onClick={handleRestart}>
          Restart Game
        </button>
      </div>

      {isGameComplete && (
        <div className="game-complete-message">
          <h2>Congratulations! 🎉</h2>
          <p>Final Score: {score}</p>
          <div className="score-breakdown">
            <p>Total Moves: {moves}</p>
            <p>Errors Made: {errors}</p>
            <p>Time: {Math.floor((new Date() - startTime) / 1000)}s</p>
            {errors === 0 && <p className="bonus">Perfect Game Bonus! +200</p>}
            {moves <= cards.length && <p className="bonus">Efficiency Bonus! +300</p>}
          </div>
          {isSaving && <p className="saving-message">Saving score...</p>}
          {saveError && (
            <div className="error-message">
              <p>{saveError}</p>
              <button 
                className="retry-button" 
                onClick={handleGameOver}
                disabled={isSaving}
              >
                Retry Save
              </button>
            </div>
          )}
        </div>
      )}

      <div className="game-board">
        {cards.map(card => (
          <Card
            key={card.id}
            id={card.id}
            imageUrl={card.imageUrl}
            isFlipped={flippedCards.includes(card.id) || matchedPairs.includes(card.id)}
            onClick={() => handleCardClick(card)}
          />
        ))}
      </div>

      <HighScores scores={highScores} />
    </div>
  );
};

export default GameBoard; 