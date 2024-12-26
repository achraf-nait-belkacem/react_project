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

const GameBoard = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
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
    setFlippedCards([]);
    setMatchedPairs([]);
    setIsGameComplete(false);
  };

  const fetchHighScores = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/scores');
      if (!response.ok) {
        throw new Error('Failed to fetch high scores');
      }
      const data = await response.json();
      // Assuming the scores are already sorted by the server
      setHighScores(data.slice(0, 5)); // Show top 5 scores
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
    
    // Calculate final statistics
    const finalStats = {
      score: score,
      moves: moves,
      timeCompleted: new Date().toISOString(),
      matchedPairs: matchedPairs.length / 2,
      totalPairs: cards.length / 2,
    };

    // Save the score
    try {
      setIsSaving(true);
      setSaveError(null);

      const response = await fetch('http://localhost:3000/api/scores', {
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
      
      // Fetch updated high scores after saving new score
      fetchHighScores();
    } catch (error) {
      console.error('Error saving score:', error);
      setSaveError('Failed to save score. Please try again.');
      setIsSaving(false);
    }
  };

  const checkMatch = (newFlippedCards) => {
    const [firstCard, secondCard] = newFlippedCards.map(id => 
      cards.find(card => card.id === id)
    );

    if (firstCard.imageUrl === secondCard.imageUrl) {
      const newMatchedPairs = [...matchedPairs, firstCard.id, secondCard.id];
      setMatchedPairs(newMatchedPairs);
      setFlippedCards([]);
      setScore(prevScore => prevScore + 10);

      // Check if all cards are matched
      if (newMatchedPairs.length === cards.length) {
        handleGameOver();
      }
    } else {
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
        </div>
        <button className="restart-button" onClick={handleRestart}>
          Restart Game
        </button>
      </div>

      {isGameComplete && (
        <div className="game-complete-message">
          <h2>Congratulations! 🎉</h2>
          <p>You completed the game in {moves} moves</p>
          <p>Final Score: {score}</p>
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