import React, { useState, useEffect } from 'react';
import Card from './Card.jsx';
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

  const checkMatch = (newFlippedCards) => {
    const [firstCard, secondCard] = newFlippedCards.map(id => 
      cards.find(card => card.id === id)
    );

    if (firstCard.imageUrl === secondCard.imageUrl) {
      setMatchedPairs([...matchedPairs, firstCard.id, secondCard.id]);
      setFlippedCards([]);
      setScore(prevScore => prevScore + 10);

      // Check if game is complete
      if (matchedPairs.length + 2 === cards.length) {
        setIsGameComplete(true);
        saveScore();
      }
    } else {
      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    }
  };

  const saveScore = async () => {
    try {
      const response = await fetch('http://localhost:3000/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: score,
          moves: moves,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save score');
      }

      const data = await response.json();
      console.log('Score saved successfully:', data);
    } catch (error) {
      console.error('Error saving score:', error);
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
    </div>
  );
};

export default GameBoard; 